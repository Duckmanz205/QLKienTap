import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { GiangVienController } from './giang-vien.controller';
import { GiangVienService } from './giang-vien.service';
import {
  GiangVien,
  DotKienTap_SinhVien,
  PhanCongGVHD,
  ChuyenThamQuan,
  PhanCongGiangVienDanDoan,
  PhieuDangKy,
  DiemDanh,
  DiemPhieuThamQuan,
  PhieuThamQuan,
  BaiThuHoach,
  HoiDong_ThanhVien,
  DiemHoiDong_ChiTiet,
  HoiDongChamBaoCao,
  DanhSachDen,
  ThongBao,
} from '../entities/qlkt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GiangVien,
      DotKienTap_SinhVien,
      PhanCongGVHD,
      ChuyenThamQuan,
      PhanCongGiangVienDanDoan,
      PhieuDangKy,
      DiemDanh,
      DiemPhieuThamQuan,
      PhieuThamQuan,
      BaiThuHoach,
      HoiDong_ThanhVien,
      DiemHoiDong_ChiTiet,
      HoiDongChamBaoCao,
      DanhSachDen,
      ThongBao,
    ]),
    AuthModule,
  ],
  controllers: [GiangVienController],
  providers: [GiangVienService],
  exports: [GiangVienService],
})
export class GiangVienModule {}
