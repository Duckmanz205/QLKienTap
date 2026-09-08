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
  DiemChuanBi,
  DiemBaiThuHoach,
  LichKienTap_SinhVien,
  BoChuyenBaoCao,
  BoChuyenBaoCao_Chuyen,
  PhieuThamQuan,
  DeXuatChuyenThamQuan,
  NhaMay,
  ThongBao,
  ThongBaoDaDoc,
  DanhSachDen,
  DiemDanh,
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
      DiemChuanBi,
      DiemBaiThuHoach,
      LichKienTap_SinhVien,
      BoChuyenBaoCao,
      BoChuyenBaoCao_Chuyen,
      PhieuThamQuan,
      DeXuatChuyenThamQuan,
      DiemDanh,
      NhaMay,
      ThongBao,
      ThongBaoDaDoc,
      DanhSachDen,
    ]),
    AuthModule,
  ],
  controllers: [SinhVienController],
  providers: [SinhVienService],
  exports: [SinhVienService],
})
export class SinhVienModule {}
