import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('TaiKhoanThuHuong')
export class TaiKhoanThuHuong {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  ma_ngan_hang: string; // Mã BIN của VietQR (vd: 970436 cho Vietcombank)

  @Column({ length: 100 })
  ten_ngan_hang: string; // Tên hiển thị (vd: Vietcombank)

  @Column({ length: 50 })
  so_tai_khoan: string;

  @Column({ length: 100 })
  ten_chu_tai_khoan: string; // Tên in hoa không dấu

  @Column({ length: 255, nullable: true })
  ghi_chu: string;

  @Column({ length: 20, default: 'HoatDong' })
  trang_thai: string; // 'HoatDong' | 'NgungSuDung'
}

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

// (v11) Đổi tên từ Khoa → KhoaHoc để tránh nhầm lẫn với vai trò QuanLyKhoa
@Entity('KhoaHoc')
export class KhoaHoc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  ma_khoa_hoc: string;

  @Column({ unique: true })
  ten_khoa_hoc: string;

  @Column()
  nam_nhap_hoc: number;
}

// (v8) Bảng tra cứu vai trò — thay thế enum chuỗi trên TaiKhoan.vai_tro
@Entity('VaiTro')
export class VaiTro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ma_vai_tro: string; // 'QuanLyKhoa' | 'QuanLyCLB' | 'GiangVien' | 'SinhVien' | 'QuanTriVienHeThong'

  @Column()
  ten_vai_tro: string;

  @Column({ nullable: true })
  mo_ta: string;
}

@Entity('TaiKhoan')
export class TaiKhoan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ten_dang_nhap: string;

  @Column()
  mat_khau_hash: string;

  // (v8) FK vào bảng VaiTro thay vì enum chuỗi
  @ManyToOne(() => VaiTro)
  @JoinColumn({ name: 'vai_tro_id' })
  vaiTro: VaiTro;

  @Column()
  vai_tro_id: number;

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

  // (v11) khoa_id → khoa_hoc_id
  @ManyToOne(() => KhoaHoc)
  @JoinColumn({ name: 'khoa_hoc_id' })
  khoaHoc: KhoaHoc;

  @Column()
  khoa_hoc_id: number;

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

// (v10) Thêm nguoi_lien_he/sdt_lien_he
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

  @Column({ nullable: true })
  nguoi_lien_he: string;

  @Column({ nullable: true })
  sdt_lien_he: string;

  @Column({ default: true })
  ho_tro_truc_tiep: boolean;

  @Column({ default: false })
  ho_tro_truc_tuyen: boolean;

  @Column({ default: 'HoatDong' })
  trang_thai: string; // 'HoatDong' | 'NgungHopTac'
}

// (v7) Hệ thống phân quyền
@Entity('Quyen')
export class Quyen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ma_quyen: string;

  @Column()
  ten_quyen: string;

  @Column()
  nhom_chuc_nang: string;

  @Column({ nullable: true })
  mo_ta: string;
}

@Entity('VaiTro_Quyen')
export class VaiTro_Quyen {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VaiTro)
  @JoinColumn({ name: 'vai_tro_id' })
  vaiTro: VaiTro;

  @Column()
  vai_tro_id: number;

  @ManyToOne(() => Quyen)
  @JoinColumn({ name: 'quyen_id' })
  quyen: Quyen;

  @Column()
  quyen_id: number;
}

// (v13) Bảng ThongBaoDaDoc đã bị XÓA — chuyển sang mô hình newsfeed
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

  // (v11) khoa_id → khoa_hoc_id
  @ManyToOne(() => KhoaHoc, { nullable: true })
  @JoinColumn({ name: 'khoa_hoc_id' })
  khoaHoc: KhoaHoc;

  @Column({ nullable: true })
  khoa_hoc_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_gui: Date;

  @Column({ default: false })
  da_chinh_sua: boolean;

  // (v6) Thêm ngay_chinh_sua
  @Column({ type: 'datetime2', nullable: true })
  ngay_chinh_sua: Date;
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

// (v6) DotKienTap thêm khoa_hoc_id
@Entity('DotKienTap')
export class DotKienTap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ten_dot: string;

  @ManyToOne(() => HocKy)
  @JoinColumn({ name: 'hoc_ky_id' })
  hocKy: HocKy;

  @Column()
  hoc_ky_id: number;

  // (v6) Khóa sinh viên áp dụng
  @ManyToOne(() => KhoaHoc)
  @JoinColumn({ name: 'khoa_hoc_id' })
  khoaHoc: KhoaHoc;

  @Column()
  khoa_hoc_id: number;

  @Column({ type: 'date' })
  ngay_bat_dau: Date;

  @Column({ type: 'date' })
  ngay_ket_thuc: Date;

  @Column({ default: 'Nhap' })
  trang_thai: string; // 'Nhap' | 'DangTrienKhai' | 'DaKetThuc' | 'DaKhoa' | 'DaHuy'
}

// (v12) Bỏ tg_dien_ra_tu/den, han_chot_nop_bao_cao, han_chot_diem
// (v6) Bỏ khoa_id. Thêm so_luong_du_kien
@Entity('LichKienTap')
export class LichKienTap {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DotKienTap)
  @JoinColumn({ name: 'dot_kien_tap_id' })
  dotKienTap: DotKienTap;

  @Column()
  dot_kien_tap_id: number;

  @Column()
  ten_lich: string;

  @Column()
  so_luong_du_kien: number;

  @Column({ type: 'datetime2' })
  tg_mo_dang_ky_tu: Date;

  @Column({ type: 'datetime2' })
  tg_mo_dang_ky_den: Date;

  @Column({ nullable: true })
  ly_do_tu_choi: string;

  @Column({ default: 'Nhap' })
  trang_thai: string; // 'Nhap' | 'ChoDuyet' | 'DaDuyet' | 'TuChoi' | 'MoDangKy' | 'DangDienRa' | 'DaKetThuc' | 'DaKhoa'
}

@Entity('DotKienTap_SinhVien')
export class DotKienTap_SinhVien {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DotKienTap)
  @JoinColumn({ name: 'dot_kien_tap_id' })
  dotKienTap: DotKienTap;

  @Column()
  dot_kien_tap_id: number;

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

// (v6) lich_kien_tap_id nay là nullable
@Entity('ChuyenThamQuan')
export class ChuyenThamQuan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => NhaMay)
  @JoinColumn({ name: 'nha_may_id' })
  nhaMay: NhaMay;

  @Column()
  nha_may_id: number;

  @ManyToOne(() => LichKienTap, { nullable: true })
  @JoinColumn({ name: 'lich_kien_tap_id' })
  lichKienTap: LichKienTap;

  @Column({ nullable: true })
  lich_kien_tap_id: number;

  @Column({ type: 'date' })
  ngay_tham_quan: Date;

  @Column({ type: 'time', name: 'gio_bat_dau' })
  gio_bat_dau: string;

  @Column({ type: 'nvarchar', length: 15, name: 'hinh_thuc' })
  hinh_thuc: string; // 'TrucTiep' | 'TrucTuyen'

  @Column({ default: 'DoKhoaToChuc' })
  cach_to_chuc: string; // 'DoKhoaToChuc' | 'TuDo'

  @Column()
  suc_chua: number;

  @Column({ type: 'int', default: 0 })
  le_phi: number;

  @Column({ nullable: true })
  dia_diem_tap_trung: string;

  @Column({ length: 50, default: 'Nhap' })
  trang_thai: string; // 'Nhap' | 'ChoDuyet' | 'DaDuyet' | 'MoDangKy' | 'DaChotDanhSach' | 'DaDienRa' | 'DaHuy'
}

// (v11) Đổi tên từ ChuyenThamQuan_GiangVienDanDoan → PhanCongGiangVienDanDoan
@Entity('PhanCongGiangVienDanDoan')
export class PhanCongGiangVienDanDoan {
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

// (v7) Đổi tên từ DeXuatChuyenThamQuan → PhieuDeXuatChuyenThamQuan
// (v9) Bỏ nguoi_duyet_id
@Entity('PhieuDeXuatChuyenThamQuan')
export class PhieuDeXuatChuyenThamQuan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SinhVien)
  @JoinColumn({ name: 'sinh_vien_id' })
  sinhVien: SinhVien;

  @Column()
  sinh_vien_id: number;

  @ManyToOne(() => LichKienTap)
  @JoinColumn({ name: 'lich_kien_tap_id' })
  lichKienTap: LichKienTap;

  @Column()
  lich_kien_tap_id: number;

  @ManyToOne(() => NhaMay, { nullable: true })
  @JoinColumn({ name: 'nha_may_id' })
  nhaMay: NhaMay;

  @Column({ nullable: true })
  nha_may_id: number;

  @Column({ nullable: true })
  ten_nha_may_de_xuat: string;

  @Column({ nullable: true })
  dia_chi_de_xuat: string;

  @Column({ nullable: true })
  nguoi_lien_he_de_xuat: string;

  @Column({ nullable: true })
  sdt_lien_he_de_xuat: string;

  @Column({ type: 'date' })
  ngay_tham_quan_de_xuat: Date;

  @Column({ type: 'time', name: 'gio_bat_dau_de_xuat' })
  gio_bat_dau_de_xuat: string;

  @Column({ type: 'nvarchar', length: 15, name: 'hinh_thuc' })
  hinh_thuc: string; // 'TrucTiep' | 'TrucTuyen'

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_de_xuat: Date;

  @Column({ default: 'ChoDuyet' })
  trang_thai_duyet: string; // 'ChoDuyet' | 'DaDuyet' | 'TuChoi'

  @Column({ type: 'datetime2', nullable: true })
  ngay_duyet: Date;

  @OneToOne(() => ChuyenThamQuan, { nullable: true })
  @JoinColumn({ name: 'chuyen_tham_quan_id' })
  chuyenThamQuan: ChuyenThamQuan;

  @Column({ nullable: true })
  chuyen_tham_quan_id: number;
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
  trang_thai: string; // 'ChoDuyet' | 'HopLe' | 'BiLoai' | 'DaHuy'

  @OneToOne(() => PhieuThamQuan, (p) => p.phieuDangKy)
  phieuThamQuan: any;

  @OneToOne(() => YeuCauHuyDangKy, (y) => y.phieuDangKy)
  yeuCauHuy: any;

  @OneToOne(() => HoaDonLePhi, (h) => h.phieuDangKy)
  hoaDon: any;
}

// (v9) Bỏ nguoi_cap_id
// (v11) Thêm bo_chuyen_bao_cao_id (gộp từ BoChuyenBaoCao_Chuyen)
// (v12) Thêm han_nop_bao_cao
@Entity('PhieuThamQuan')
export class PhieuThamQuan {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PhieuDangKy, (p) => p.phieuThamQuan)
  @JoinColumn({ name: 'phieu_dang_ky_id' })
  phieuDangKy: PhieuDangKy;

  @Column()
  phieu_dang_ky_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_cap: Date;

  @Column({ default: 'HopLe' })
  trang_thai: string; // 'HopLe' | 'DaHuy'

  @ManyToOne(() => BoChuyenBaoCao, { nullable: true })
  @JoinColumn({ name: 'bo_chuyen_bao_cao_id' })
  boChuyenBaoCao: any;

  @Column({ nullable: true })
  bo_chuyen_bao_cao_id: number;

  @Column({ type: 'datetime2', nullable: true })
  han_nop_bao_cao: Date;

  @OneToOne(() => BaiThuHoach, (b) => b.phieuThamQuan)
  baiThuHoach: any;

  @OneToOne(() => DiemPhieuThamQuan, (d) => d.phieuThamQuan)
  diemPhieuThamQuan: any;
}

// (v9) Bỏ nguoi_duyet_id
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

  @Column()
  so_chuyen_bi_cam: number;

  @Column()
  so_chuyen_con_lai: number;

  @Column({ type: 'bit', generatedType: 'STORED', asExpression: 'CASE WHEN so_chuyen_con_lai > 0 THEN 1 ELSE 0 END' })
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

// (v9) Bỏ nguoi_xu_ly_id
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

  @Column({ type: 'datetime2', nullable: true })
  ngay_xu_ly: Date;
}

@Entity('PhanCongGVHD')
export class PhanCongGVHD {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DotKienTap_SinhVien)
  @JoinColumn({ name: 'dot_kien_tap_sinh_vien_id' })
  dotKienTapSinhVien: DotKienTap_SinhVien;

  @Column()
  dot_kien_tap_sinh_vien_id: number;

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

  @OneToOne(() => PhieuThamQuan)
  @JoinColumn({ name: 'phieu_tham_quan_id' })
  phieuThamQuan: PhieuThamQuan;

  @Column()
  phieu_tham_quan_id: number;

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

  @Column()
  phieu_tham_quan_id: number;

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

  @OneToOne(() => PhieuThamQuan, (p) => p.baiThuHoach)
  @JoinColumn({ name: 'phieu_tham_quan_id' })
  phieuThamQuan: PhieuThamQuan;
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

  @ManyToOne(() => PhieuThamQuan)
  @JoinColumn({ name: 'phieu_tham_quan_id' })
  phieuThamQuan: PhieuThamQuan;

  @Column()
  phieu_tham_quan_id: number;

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

// (v10) "Phiếu điểm" — gộp DiemChuanBi + DiemBaiThuHoach + NhatKyDiemCong
// vào một bảng duy nhất. Dòng được tự động tạo bởi trigger khi PhieuThamQuan được cấp.
@Entity('DiemPhieuThamQuan')
export class DiemPhieuThamQuan {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PhieuThamQuan)
  @JoinColumn({ name: 'phieu_tham_quan_id' })
  phieuThamQuan: PhieuThamQuan;

  @Column()
  phieu_tham_quan_id: number;

  // Điểm chuẩn bị (30%) — GVDĐ chấm (gộp từ DiemChuanBi cũ)
  @ManyToOne(() => GiangVien, { nullable: true })
  @JoinColumn({ name: 'giang_vien_dan_doan_id' })
  giangVienDanDoan: GiangVien;

  @Column({ nullable: true })
  giang_vien_dan_doan_id: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  diem_chuan_bi: number;

  @Column({ type: 'datetime2', nullable: true })
  ngay_cham_chuan_bi: Date;

  // Điểm bài thu hoạch (30%) — GVHD chấm (gộp từ DiemBaiThuHoach cũ)
  @ManyToOne(() => GiangVien, { nullable: true })
  @JoinColumn({ name: 'giang_vien_hd_id' })
  giangVienHD: GiangVien;

  @Column({ nullable: true })
  giang_vien_hd_id: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  diem_ai_de_xuat: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  diem_thu_hoach: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  nhan_xet_thu_hoach: string;

  @Column({ type: 'datetime2', nullable: true })
  ngay_cham_thu_hoach: Date;

  // Điểm hội đồng (40%) — tổng hợp từ DiemHoiDong_ChiTiet
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  diem_hoi_dong_final: number;

  // Điểm cộng — GVDĐ UPDATE trực tiếp (thay cho NhatKyDiemCong cũ)
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0 })
  diem_cong_final: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  diem_tong_chuyen: number;

  @Column({ default: false })
  da_khoa: boolean;

  @Column({ type: 'datetime2', nullable: true })
  ngay_khoa: Date;
}

// (v11) BoChuyenBaoCao_Chuyen đã bị XÓA — quan hệ gộp vào PhieuThamQuan.bo_chuyen_bao_cao_id
@Entity('BoChuyenBaoCao')
export class BoChuyenBaoCao {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => DotKienTap_SinhVien)
  @JoinColumn({ name: 'dot_kien_tap_sinh_vien_id' })
  dotKienTapSinhVien: DotKienTap_SinhVien;

  @Column()
  dot_kien_tap_sinh_vien_id: number;

  @Column({ type: 'datetime2', default: () => 'SYSDATETIME()' })
  ngay_chon: Date;

  @Column({ nullable: true })
  ghi_chu: string;
}
