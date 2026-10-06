import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly dataSource: DataSource) {}

  // 1. Chạy mỗi phút: Đảm bảo sinh viên đăng ký được đúng giờ, khóa sổ đúng giờ
  @Cron(CronExpression.EVERY_MINUTE)
  async handleTripRegistrationStatus() {
    try {
      await this.dataSource.query('EXEC sp_TuDongDongMoDangKyLich');
      this.logger.log('Executed sp_TuDongDongMoDangKyLich successfully.');
    } catch (error) {
      this.logger.error('Failed to execute sp_TuDongDongMoDangKyLich', error.stack);
    }
  }

  // 2. Chạy mỗi ngày lúc Nửa đêm (00:00): Chốt sổ các Lịch/Đợt đã hoàn tất
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleLifecycleStatus() {
    try {
      await this.dataSource.query('EXEC sp_TuDongCapNhatChuyenThamQuan');
      await this.dataSource.query('EXEC sp_TuDongKetThucLichKienTap');
      await this.dataSource.query('EXEC sp_DongBoTrangThaiDotKienTap');

      // 1. Khởi tạo bản ghi điểm (nếu chưa có) cho những Phiếu Tham Quan quá hạn 20 ngày mà chưa nộp bài
      await this.dataSource.query(`
        INSERT INTO DiemPhieuThamQuan (phieu_tham_quan_id, diem_thu_hoach)
        SELECT ptq.id, 0
        FROM PhieuThamQuan ptq
        LEFT JOIN BaiThuHoach bth ON bth.phieu_tham_quan_id = ptq.id
        LEFT JOIN DiemPhieuThamQuan d ON d.phieu_tham_quan_id = ptq.id
        WHERE ptq.han_nop_bao_cao IS NOT NULL 
          AND SYSDATETIME() > DATEADD(DAY, 10, ptq.han_nop_bao_cao)
          AND bth.id IS NULL
          AND d.id IS NULL
      `);

      // 2. Cập nhật 0 điểm đối với các bản ghi đã có sẵn nhưng bị null điểm thu hoạch
      await this.dataSource.query(`
        UPDATE DiemPhieuThamQuan
        SET diem_thu_hoach = 0
        FROM DiemPhieuThamQuan d
        JOIN PhieuThamQuan ptq ON ptq.id = d.phieu_tham_quan_id
        LEFT JOIN BaiThuHoach bth ON bth.phieu_tham_quan_id = ptq.id
        WHERE ptq.han_nop_bao_cao IS NOT NULL 
          AND SYSDATETIME() > DATEADD(DAY, 10, ptq.han_nop_bao_cao)
          AND bth.id IS NULL
          AND d.diem_thu_hoach IS NULL
      `);

      this.logger.log('Executed daily lifecycle updates successfully.');
    } catch (error) {
      this.logger.error('Failed to execute daily lifecycle updates', error.stack);
    }
  }
}
