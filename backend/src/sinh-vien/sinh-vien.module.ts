import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  DiemPhieuDangKy,
  LichKienTap_SinhVien,
  BoChuyenBaoCao,
  BoChuyenBaoCao_Chuyen,
  KetQuaHocPhan,
  NhaMay,
  ThongBao,
  ThongBaoDaDoc,
  DanhSachDen,
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
      DiemPhieuDangKy,
      LichKienTap_SinhVien,
      BoChuyenBaoCao,
      BoChuyenBaoCao_Chuyen,
      KetQuaHocPhan,
      NhaMay,
      ThongBao,
      ThongBaoDaDoc,
      DanhSachDen,
    ]),
  ],
  controllers: [SinhVienController],
  providers: [SinhVienService],
  exports: [SinhVienService],
})
export class SinhVienModule {}
