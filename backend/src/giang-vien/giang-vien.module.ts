import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { GiangVienController } from './giang-vien.controller';
import { GiangVienService } from './giang-vien.service';
import {
  GiangVien,
  LichKienTap_SinhVien,
  PhanCongGVHD,
  ChuyenThamQuan,
  ChuyenThamQuan_GiangVienDanDoan,
  PhieuDangKy,
  DiemDanh,
  DiemPhieuDangKy,
  NhatKyDiemCong,
  BaiThuHoach,
  HoiDong_ThanhVien,
  DiemHoiDong_ChiTiet,
  HoiDongChamBaoCao,
  DanhSachDen,
} from '../entities/qlkt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GiangVien,
      LichKienTap_SinhVien,
      PhanCongGVHD,
      ChuyenThamQuan,
      ChuyenThamQuan_GiangVienDanDoan,
      PhieuDangKy,
      DiemDanh,
      DiemPhieuDangKy,
      NhatKyDiemCong,
      BaiThuHoach,
      HoiDong_ThanhVien,
      DiemHoiDong_ChiTiet,
      HoiDongChamBaoCao,
      DanhSachDen,
    ]),
    AuthModule,
  ],
  controllers: [GiangVienController],
  providers: [GiangVienService],
  exports: [GiangVienService],
})
export class GiangVienModule {}
