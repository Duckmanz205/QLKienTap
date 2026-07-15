import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity('NamHoc')
export class NamHoc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ten_nam_hoc: string;

  @Column({ type: 'date' })
  ngay_bat_dau: Date;

  @Column({ type: 'date' })
  ngay_ket_thuc: Date;
}

@Entity('HocKy')
export class HocKy {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => NamHoc)
  @JoinColumn({ name: 'nam_hoc_id' })
  namHoc: NamHoc;

  @Column({ name: 'nam_hoc_id' })
  nam_hoc_id: number;

  @Column()
  ten_hoc_ky: string;

  @Column({ type: 'date' })
  ngay_bat_dau: Date;

  @Column({ type: 'date' })
  ngay_ket_thuc: Date;
}

@Entity('Khoa')
export class Khoa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ten_khoa: string;

  @Column()
  nam_nhap_hoc: number;
}

@Entity('TaiKhoan')
export class TaiKhoan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ten_dang_nhap: string;

  @Column()
  mat_khau_hash: string;

  @Column()
  vai_tro: string; // 'QuanLyKhoa' | 'GiangVien' | 'SinhVien'

  @Column({ default: 'HoatDong' })
  trang_thai: string; // 'HoatDong' | 'KhoaTaiKhoan'

  @Column({ default: true })
  phai_doi_mat_khau: boolean;

  @Column({ type: 'datetime2', nullable: true })
  lan_dang_nhap_cuoi: Date;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_tao: Date;
}

@Entity('SinhVien')
export class SinhVien {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  mssv: string;

  @Column()
  ho_ten: string;

  @OneToOne(() => TaiKhoan)
  @JoinColumn({ name: 'taikhoan_id' })
  taiKhoan: TaiKhoan;

  @Column()
  taikhoan_id: number;

  @ManyToOne(() => Khoa)
  @JoinColumn({ name: 'khoa_id' })
  khoa: Khoa;

  @Column()
  khoa_id: number;

  @Column({ nullable: true })
  ten_lop: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  sdt: string;

  @Column({ default: false })
  hoc_lai: boolean;
}

@Entity('GiangVien')
export class GiangVien {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ma_gv: string;

  @Column()
  ho_ten: string;

  @OneToOne(() => TaiKhoan)
  @JoinColumn({ name: 'taikhoan_id' })
  taiKhoan: TaiKhoan;

  @Column()
  taikhoan_id: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  sdt: string;

  @Column({ default: false })
  du_dk_hoi_dong: boolean;

  @Column({ nullable: true })
  so_sv_toi_da_huong_dan: number;
}

@Entity('NhaMay')
export class NhaMay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ten_nha_may: string;

  @Column({ nullable: true })
  dia_chi: string;

  @Column({ nullable: true })
  nhom_nganh: string;

  @Column({ default: true })
  ho_tro_truc_tiep: boolean;

  @Column({ default: false })
  ho_tro_truc_tuyen: boolean;

  @Column({ default: 'HoatDong' })
  trang_thai: string; // 'HoatDong' | 'NgungHopTac'
}

@Entity('ThongBao')
export class ThongBao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tieu_de: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  noi_dung: string;

  @ManyToOne(() => TaiKhoan)
  @JoinColumn({ name: 'nguoi_gui_id' })
  nguoiGui: TaiKhoan;

  @Column()
  nguoi_gui_id: number;

  @ManyToOne(() => Khoa, { nullable: true })
  @JoinColumn({ name: 'khoa_id' })
  khoa: Khoa;

  @Column({ nullable: true })
  khoa_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_gui: Date;

  @Column({ default: false })
  da_chinh_sua: boolean;
}

@Entity('ThongBaoFile')
export class ThongBaoFile {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ThongBao)
  @JoinColumn({ name: 'thongbao_id' })
  thongBao: ThongBao;

  @Column()
  thongbao_id: number;

  @Column()
  ten_file: string;

  @Column()
  duong_dan: string;

  @Column()
  dung_luong_kb: number;
}

@Entity('ThongBaoDaDoc')
export class ThongBaoDaDoc {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ThongBao)
  @JoinColumn({ name: 'thongbao_id' })
  thongBao: ThongBao;

  @Column()
  thongbao_id: number;

  @ManyToOne(() => TaiKhoan)
  @JoinColumn({ name: 'taikhoan_id' })
  taiKhoan: TaiKhoan;

  @Column()
  taikhoan_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_doc: Date;
}

@Entity('NhacNho')
export class NhacNho {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TaiKhoan)
  @JoinColumn({ name: 'taikhoan_id' })
  taiKhoan: TaiKhoan;

  @Column()
  taikhoan_id: number;

  @Column()
  loai: string; // 'HanNopBaoCao' | 'HanDongPhi' | 'HanBaoLuu18Thang' | ...

  @Column()
  noi_dung: string;

  @Column({ nullable: true })
  doi_tuong_id: number;

  @Column({ type: 'datetime2' })
  ngay_du_kien_gui: Date;

  @Column({ default: false })
  da_gui: boolean;

  @Column({ type: 'datetime2', nullable: true })
  ngay_gui_thuc_te: Date;
}

@Entity('DotKienTap')
export class DotKienTap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ten_dot: string;

  @ManyToOne(() => NamHoc)
  @JoinColumn({ name: 'nam_hoc_id' })
  namHoc: NamHoc;

  @Column()
  nam_hoc_id: number;

  @ManyToOne(() => HocKy)
  @JoinColumn({ name: 'hoc_ky_id' })
  hocKy: HocKy;

  @Column()
  hoc_ky_id: number;

  @Column({ type: 'date' })
  ngay_bat_dau: Date;

  @Column({ type: 'date' })
  ngay_ket_thuc: Date;

  @Column({ default: 'Nhap' })
  trang_thai: string; // 'Nhap' | 'DangTrienKhai' | 'DaKetThuc' | 'DaKhoa' | 'DaHuy'
}

@Entity('LichKienTap')
export class LichKienTap {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DotKienTap)
  @JoinColumn({ name: 'dot_kien_tap_id' })
  dotKienTap: DotKienTap;

  @Column()
  dot_kien_tap_id: number;

  @ManyToOne(() => Khoa)
  @JoinColumn({ name: 'khoa_id' })
  khoa: Khoa;

  @Column()
  khoa_id: number;

  @Column()
  ten_lich: string;

  @Column({ type: 'datetime2' })
  tg_mo_dang_ky_tu: Date;

  @Column({ type: 'datetime2' })
  tg_mo_dang_ky_den: Date;

  @Column({ type: 'date' })
  tg_dien_ra_tu: Date;

  @Column({ type: 'date' })
  tg_dien_ra_den: Date;

  @Column({ type: 'datetime2' })
  han_chot_nop_bao_cao: Date;

  @Column({ type: 'datetime2' })
  han_chot_diem: Date;

  @Column({ default: 'Nhap' })
  trang_thai: string; // 'Nhap' | 'MoDangKy' | 'DangDienRa' | 'DaKetThuc' | 'DaKhoa'
}

@Entity('LichKienTap_SinhVien')
export class LichKienTap_SinhVien {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LichKienTap)
  @JoinColumn({ name: 'lich_kien_tap_id' })
  lichKienTap: LichKienTap;

  @Column()
  lich_kien_tap_id: number;

  @ManyToOne(() => SinhVien)
  @JoinColumn({ name: 'sinh_vien_id' })
  sinhVien: SinhVien;

  @Column()
  sinh_vien_id: number;

  @Column({ default: 1 })
  lan_dang_ky: number;

  @Column({ default: 'DangThucHien' })
  trang_thai: string; // 'DangThucHien' | 'Dat' | 'KhongDat'

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_them: Date;
}

@Entity('ChuyenThamQuan')
export class ChuyenThamQuan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => NhaMay)
  @JoinColumn({ name: 'nha_may_id' })
  nhaMay: NhaMay;

  @Column()
  nha_may_id: number;

  @ManyToOne(() => LichKienTap)
  @JoinColumn({ name: 'lich_kien_tap_id' })
  lichKienTap: LichKienTap;

  @Column()
  lich_kien_tap_id: number;

  @Column({ type: 'date' })
  ngay_tham_quan: Date;

  @Column({ type: 'time' })
  gio_bat_dau: string;

  @Column({ type: 'time' })
  gio_ket_thuc: string;

  @Column()
  hinh_thuc: string; // 'TrucTiep' | 'TrucTuyen'

  @Column({ default: 'DoKhoaToChuc' })
  cach_to_chuc: string; // 'DoKhoaToChuc' | 'TuDo'

  @Column()
  suc_chua: number;

  @Column({ default: 'Nhap' })
  trang_thai: string; // 'Nhap' | 'MoDangKy' | 'DaChotDanhSach' | 'DaDienRa' | 'DaHuy'

  @ManyToOne(() => SinhVien, { nullable: true })
  @JoinColumn({ name: 'de_xuat_boi_id' })
  deXuatBoi: SinhVien;

  @Column({ nullable: true })
  de_xuat_boi_id: number;

  @Column({ nullable: true })
  trang_thai_duyet_tudo: string; // 'ChoDuyet' | 'DaDuyet' | 'TuChoi'

  @ManyToOne(() => TaiKhoan, { nullable: true })
  @JoinColumn({ name: 'nguoi_duyet_id' })
  nguoiDuyet: TaiKhoan;

  @Column({ nullable: true })
  nguoi_duyet_id: number;

  @Column({ type: 'datetime2', nullable: true })
  ngay_duyet: Date;
}

@Entity('ChuyenThamQuan_GiangVienDanDoan')
export class ChuyenThamQuan_GiangVienDanDoan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChuyenThamQuan)
  @JoinColumn({ name: 'chuyen_tham_quan_id' })
  chuyenThamQuan: ChuyenThamQuan;

  @Column()
  chuyen_tham_quan_id: number;

  @ManyToOne(() => GiangVien)
  @JoinColumn({ name: 'giang_vien_id' })
  giangVien: GiangVien;

  @Column()
  giang_vien_id: number;

  @Column({ default: true })
  la_truong_doan: boolean;
}

@Entity('PhieuDangKy')
export class PhieuDangKy {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SinhVien)
  @JoinColumn({ name: 'sinh_vien_id' })
  sinhVien: SinhVien;

  @Column()
  sinh_vien_id: number;

  @ManyToOne(() => ChuyenThamQuan)
  @JoinColumn({ name: 'chuyen_tham_quan_id' })
  chuyenThamQuan: ChuyenThamQuan;

  @Column()
  chuyen_tham_quan_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_dang_ky: Date;

  @Column({ default: 'ChoDuyet' })
  trang_thai: string; // 'ChoDuyet' | 'HopLe' | 'BiLoai' | 'DaHuy' | 'DaThamGia' | 'VangMat' | 'HoanThanh' | 'KhongDat'

  @OneToMany(() => BaiThuHoach, (b) => b.phieuDangKy)
  baiThuHoach: any[];

  @OneToOne(() => YeuCauHuyDangKy, (y) => y.phieuDangKy)
  yeuCauHuy: any;

  @OneToOne(() => HoaDonLePhi, (h) => h.phieuDangKy)
  hoaDon: any;
}

@Entity('YeuCauHuyDangKy')
export class YeuCauHuyDangKy {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PhieuDangKy)
  @JoinColumn({ name: 'phieu_dang_ky_id' })
  phieuDangKy: PhieuDangKy;

  @Column()
  phieu_dang_ky_id: number;

  @Column()
  ly_do: string;

  @Column({ nullable: true })
  file_minh_chung: string;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_yeu_cau: Date;

  @Column({ default: 'ChoDuyet' })
  trang_thai_duyet: string; // 'ChoDuyet' | 'DaDuyet' | 'TuChoi'

  @ManyToOne(() => TaiKhoan, { nullable: true })
  @JoinColumn({ name: 'nguoi_duyet_id' })
  nguoiDuyet: TaiKhoan;

  @Column({ nullable: true })
  nguoi_duyet_id: number;

  @Column({ type: 'datetime2', nullable: true })
  ngay_duyet: Date;
}

@Entity('DanhSachDen')
export class DanhSachDen {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SinhVien)
  @JoinColumn({ name: 'sinh_vien_id' })
  sinhVien: SinhVien;

  @Column()
  sinh_vien_id: number;

  @Column()
  ly_do: string; // 'KhongDongPhi' | 'DangKyKhongThamGia' | 'HuyKhongMinhChung'

  @ManyToOne(() => PhieuDangKy, { nullable: true })
  @JoinColumn({ name: 'phieu_dang_ky_id' })
  phieuDangKy: PhieuDangKy;

  @Column({ nullable: true })
  phieu_dang_ky_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_ghi_nhan: Date;

  @Column({ default: true })
  con_hieu_luc: boolean;
}

@Entity('HoaDonLePhi')
export class HoaDonLePhi {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PhieuDangKy)
  @JoinColumn({ name: 'phieu_dang_ky_id' })
  phieuDangKy: PhieuDangKy;

  @Column()
  phieu_dang_ky_id: number;

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  so_tien: number;

  @Column()
  noi_dung_chuyen_khoan: string;

  @Column({ type: 'datetime2' })
  han_dong: Date;

  @Column({ type: 'datetime2', nullable: true })
  ngay_dong_thuc_te: Date;

  @Column({ default: 'ChuaDong' })
  trang_thai: string; // 'ChuaDong' | 'DaDongDungHan' | 'ViPham' | 'DaHoanPhi'
}

@Entity('DonHoanPhi')
export class DonHoanPhi {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HoaDonLePhi)
  @JoinColumn({ name: 'hoa_don_id' })
  hoaDon: HoaDonLePhi;

  @Column()
  hoa_don_id: number;

  @Column()
  file_don_da_duyet: string;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_nop: Date;

  @Column({ default: 'ChoXuLy' })
  trang_thai: string; // 'ChoXuLy' | 'DaHoanTien' | 'TuChoi'

  @ManyToOne(() => TaiKhoan, { nullable: true })
  @JoinColumn({ name: 'nguoi_xu_ly_id' })
  nguoiXuLy: TaiKhoan;

  @Column({ nullable: true })
  nguoi_xu_ly_id: number;

  @Column({ type: 'datetime2', nullable: true })
  ngay_xu_ly: Date;
}

@Entity('PhanCongGVHD')
export class PhanCongGVHD {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LichKienTap_SinhVien)
  @JoinColumn({ name: 'lich_kien_tap_sinh_vien_id' })
  lichKienTapSinhVien: LichKienTap_SinhVien;

  @Column()
  lich_kien_tap_sinh_vien_id: number;

  @ManyToOne(() => GiangVien)
  @JoinColumn({ name: 'giang_vien_id' })
  giangVien: GiangVien;

  @Column()
  giang_vien_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_phan_cong: Date;

  @Column({ default: 'DangHoatDong' })
  trang_thai: string; // 'DangHoatDong' | 'DaGo'
}

@Entity('DiemDanh')
export class DiemDanh {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PhieuDangKy)
  @JoinColumn({ name: 'phieu_dang_ky_id' })
  phieuDangKy: PhieuDangKy;

  @Column()
  phieu_dang_ky_id: number;

  @Column()
  trang_thai: string; // 'CoMat' | 'Vang' | 'TuChoiThamGia'

  @Column({ nullable: true })
  ghi_chu: string;

  @ManyToOne(() => GiangVien)
  @JoinColumn({ name: 'nguoi_diem_danh_id' })
  nguoiDiemDanh: GiangVien;

  @Column()
  nguoi_diem_danh_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_diem_danh: Date;
}

@Entity('BaiThuHoach')
export class BaiThuHoach {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PhieuDangKy)
  @JoinColumn({ name: 'phieu_dang_ky_id' })
  phieuDangKy: PhieuDangKy;

  @Column()
  phieu_dang_ky_id: number;

  @Column()
  file_bao_cao: string;

  @Column({ nullable: true })
  file_xac_nhan_tham_quan: string;

  @Column({ default: 1 })
  lan_nop: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_nop: Date;

  @Column({ default: 'DaNop' })
  trang_thai: string; // 'DaNop' | 'ChoBoSung' | 'TreHan'
}

@Entity('DiemPhieuDangKy')
export class DiemPhieuDangKy {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PhieuDangKy)
  @JoinColumn({ name: 'phieu_dang_ky_id' })
  phieuDangKy: PhieuDangKy;

  @Column()
  phieu_dang_ky_id: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  diem_chuan_bi: number;

  @Column({ type: 'datetime2', nullable: true })
  ngay_lam_bai_chuan_bi: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  diem_bai_thu_hoach_ai: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  diem_bai_thu_hoach: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  nhan_xet_bai_thu_hoach: string;

  @ManyToOne(() => GiangVien, { nullable: true })
  @JoinColumn({ name: 'giang_vien_cham_id' })
  giangVienCham: GiangVien;

  @Column({ nullable: true })
  giang_vien_cham_id: number;

  @Column({ type: 'datetime2', nullable: true })
  ngay_cham_bai_thu_hoach: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  diem_bao_cao_tqnm: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0 })
  diem_cong: number;

  @Column({ default: false })
  da_khoa: boolean;
}

@Entity('NhatKyDiemCong')
export class NhatKyDiemCong {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PhieuDangKy)
  @JoinColumn({ name: 'phieu_dang_ky_id' })
  phieuDangKy: PhieuDangKy;

  @Column()
  phieu_dang_ky_id: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.5 })
  diem: number;

  @ManyToOne(() => GiangVien)
  @JoinColumn({ name: 'giang_vien_ghi_nhan_id' })
  giangVienGhiNhan: GiangVien;

  @Column()
  giang_vien_ghi_nhan_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_ghi_nhan: Date;
}

@Entity('HoiDongChamBaoCao')
export class HoiDongChamBaoCao {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LichKienTap)
  @JoinColumn({ name: 'lich_kien_tap_id' })
  lichKienTap: LichKienTap;

  @Column()
  lich_kien_tap_id: number;

  @Column()
  ten_hoi_dong: string;

  @Column({ type: 'datetime2' })
  ngay_bao_cao: Date;

  @Column({ nullable: true })
  dia_diem: string;
}

@Entity('HoiDong_ThanhVien')
export class HoiDong_ThanhVien {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HoiDongChamBaoCao)
  @JoinColumn({ name: 'hoi_dong_id' })
  hoiDong: HoiDongChamBaoCao;

  @Column()
  hoi_dong_id: number;

  @ManyToOne(() => GiangVien)
  @JoinColumn({ name: 'giang_vien_id' })
  giangVien: GiangVien;

  @Column()
  giang_vien_id: number;

  @Column({ default: 'ThanhVien' })
  vai_tro: string; // 'ChuTich' | 'ThuKy' | 'ThanhVien'
}

@Entity('DiemHoiDong_ChiTiet')
export class DiemHoiDong_ChiTiet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PhieuDangKy)
  @JoinColumn({ name: 'phieu_dang_ky_id' })
  phieuDangKy: PhieuDangKy;

  @Column()
  phieu_dang_ky_id: number;

  @ManyToOne(() => HoiDong_ThanhVien)
  @JoinColumn({ name: 'hoi_dong_thanhvien_id' })
  hoiDongThanhVien: HoiDong_ThanhVien;

  @Column()
  hoi_dong_thanhvien_id: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  diem: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_cham: Date;
}

@Entity('BoChuyenBaoCao')
export class BoChuyenBaoCao {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => LichKienTap_SinhVien)
  @JoinColumn({ name: 'lich_kien_tap_sinh_vien_id' })
  lichKienTapSinhVien: LichKienTap_SinhVien;

  @Column()
  lich_kien_tap_sinh_vien_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_chon: Date;

  @Column({ default: true })
  tu_dong: boolean;

  @Column({ nullable: true })
  ghi_chu_dieu_chinh_gvhd: string;
}

@Entity('BoChuyenBaoCao_Chuyen')
export class BoChuyenBaoCao_Chuyen {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BoChuyenBaoCao)
  @JoinColumn({ name: 'bo_chuyen_bao_cao_id' })
  boChuyenBaoCao: BoChuyenBaoCao;

  @Column()
  bo_chuyen_bao_cao_id: number;

  @ManyToOne(() => PhieuDangKy)
  @JoinColumn({ name: 'phieu_dang_ky_id' })
  phieuDangKy: PhieuDangKy;

  @Column()
  phieu_dang_ky_id: number;
}

@Entity('KetQuaHocPhan')
export class KetQuaHocPhan {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => LichKienTap_SinhVien)
  @JoinColumn({ name: 'lich_kien_tap_sinh_vien_id' })
  lichKienTapSinhVien: LichKienTap_SinhVien;

  @Column()
  lich_kien_tap_sinh_vien_id: number;

  @ManyToOne(() => BoChuyenBaoCao, { nullable: true })
  @JoinColumn({ name: 'bo_chuyen_bao_cao_id' })
  boChuyenBaoCao: BoChuyenBaoCao;

  @Column({ nullable: true })
  bo_chuyen_bao_cao_id: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  diem_tong_ket: number;

  @Column({ default: 'DangThucHien' })
  ket_qua: string; // 'DangThucHien' | 'Dat' | 'KhongDat' | 'ChuaHoanThanh'

  @Column({ type: 'datetime2', nullable: true })
  ngay_khoa: Date;

  @ManyToOne(() => TaiKhoan, { nullable: true })
  @JoinColumn({ name: 'nguoi_khoa_id' })
  nguoiKhoa: TaiKhoan;

  @Column({ nullable: true })
  nguoi_khoa_id: number;
}
