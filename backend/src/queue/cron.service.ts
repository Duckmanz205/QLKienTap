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
      this.logger.log('Executed daily lifecycle updates successfully.');
    } catch (error) {
      this.logger.error('Failed to execute daily lifecycle updates', error.stack);
    }
  }
}
