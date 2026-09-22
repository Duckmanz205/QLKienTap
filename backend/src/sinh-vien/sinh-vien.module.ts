import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { SinhVienController } from './sinh-vien.controller';
import { SinhVienService } from './sinh-vien.service';
import {
  SinhVien,
  ChuyenThamQuan,
  PhieuDangKy,
  YeuCauHuyDangKy,
  HoaDonLePhi,
  DonHoanPhi,
  BaiThuHoach,
  DiemPhieuThamQuan,
  DotKienTap_SinhVien,
  BoChuyenBaoCao,
  PhieuThamQuan,
  PhieuDeXuatChuyenThamQuan,
  DiemDanh,
  NhaMay,
  ThongBao,
  DanhSachDen,
  LichKienTap,
  TaiKhoanThuHuong,
} from '../entities/qlkt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SinhVien,
      ChuyenThamQuan,
      PhieuDangKy,
      YeuCauHuyDangKy,
      HoaDonLePhi,
      DonHoanPhi,
      BaiThuHoach,
      DiemPhieuThamQuan,
      DotKienTap_SinhVien,
      BoChuyenBaoCao,
      PhieuThamQuan,
      PhieuDeXuatChuyenThamQuan,
      DiemDanh,
      NhaMay,
      ThongBao,
      DanhSachDen,
      LichKienTap,
      TaiKhoanThuHuong,
    ]),
    AuthModule,
  ],
  controllers: [SinhVienController],
  providers: [SinhVienService],
  exports: [SinhVienService],
})
export class SinhVienModule {}
