import {
  Injectable,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  DataSource,
  EntityManager,
  Not,
  IsNull,
  FindOptionsWhere,
  QueryFailedError,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { TaskQueueService } from '../../queue/task-queue.service';
import {
  NamHoc,
  HocKy,
  KhoaHoc,
  VaiTro,
  TaiKhoan,
  SinhVien,
  GiangVien,
  NhaMay,
  ThongBao,
  ThongBaoFile,
  DotKienTap,
  LichKienTap,
  DotKienTap_SinhVien,
  ChuyenThamQuan,
  PhanCongGiangVienDanDoan,
  PhieuDangKy,
  YeuCauHuyDangKy,
  DanhSachDen,
  HoaDonLePhi,
  DonHoanPhi,
  PhanCongGVHD,
  DiemDanh,
  BaiThuHoach,
  DiemPhieuThamQuan,
  HoiDongChamBaoCao,
  HoiDong_ThanhVien,
  DiemHoiDong_ChiTiet,
  BoChuyenBaoCao,
  PhieuDeXuatChuyenThamQuan,
  PhieuThamQuan,
  TaiKhoanThuHuong,
} from '../../entities/qlkt.entity';
import { CompanyMatcher } from '../../common/company-matcher.util';
import { RoleDataSourceService } from '../../common/role-datasource.service';

@Injectable()
export class KhoaService implements OnModuleInit {
  private readonly logger = new Logger(KhoaService.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(NamHoc) private namHocRepo: Repository<NamHoc>,
    @InjectRepository(HocKy) private hocKyRepo: Repository<HocKy>,
    @InjectRepository(KhoaHoc) private khoaHocRepo: Repository<KhoaHoc>,
    @InjectRepository(VaiTro) private vaiTroRepo: Repository<VaiTro>,
    @InjectRepository(TaiKhoan) private taiKhoanRepo: Repository<TaiKhoan>,
    @InjectRepository(SinhVien) private svRepo: Repository<SinhVien>,
    @InjectRepository(GiangVien) private gvRepo: Repository<GiangVien>,
    @InjectRepository(NhaMay) private nhaMayRepo: Repository<NhaMay>,
    @InjectRepository(ThongBao) private thongBaoRepo: Repository<ThongBao>,
    @InjectRepository(ThongBaoFile)
    private tbFileRepo: Repository<ThongBaoFile>,
    @InjectRepository(DotKienTap) private dotRepo: Repository<DotKienTap>,
    @InjectRepository(LichKienTap) private lichRepo: Repository<LichKienTap>,
    @InjectRepository(DotKienTap_SinhVien)
    private dksvRepo: Repository<DotKienTap_SinhVien>,
    @InjectRepository(ChuyenThamQuan)
    private chuyenRepo: Repository<ChuyenThamQuan>,
    @InjectRepository(PhanCongGiangVienDanDoan)
    private danDoanRepo: Repository<PhanCongGiangVienDanDoan>,
    @InjectRepository(PhieuDangKy) private phieuRepo: Repository<PhieuDangKy>,
    @InjectRepository(YeuCauHuyDangKy)
    private huyRepo: Repository<YeuCauHuyDangKy>,
    @InjectRepository(DanhSachDen)
    private blacklistRepo: Repository<DanhSachDen>,
    @InjectRepository(HoaDonLePhi) private hoaDonRepo: Repository<HoaDonLePhi>,
    @InjectRepository(DonHoanPhi) private hoanPhiRepo: Repository<DonHoanPhi>,
    @InjectRepository(PhanCongGVHD)
    private pcGvhdRepo: Repository<PhanCongGVHD>,
    @InjectRepository(DiemDanh) private diemDanhRepo: Repository<DiemDanh>,
    @InjectRepository(BaiThuHoach) private baiRepo: Repository<BaiThuHoach>,
    @InjectRepository(DiemPhieuThamQuan)
    private diemPhieuRepo: Repository<DiemPhieuThamQuan>,
    @InjectRepository(PhieuDeXuatChuyenThamQuan)
    private deXuatRepo: Repository<PhieuDeXuatChuyenThamQuan>,
    @InjectRepository(PhieuThamQuan)
    private phieuTQRepo: Repository<PhieuThamQuan>,
    @InjectRepository(HoiDongChamBaoCao)
    private hdRepo: Repository<HoiDongChamBaoCao>,
    @InjectRepository(HoiDong_ThanhVien)
    private hdTvRepo: Repository<HoiDong_ThanhVien>,
    @InjectRepository(DiemHoiDong_ChiTiet)
    private hdCtRepo: Repository<DiemHoiDong_ChiTiet>,
    @InjectRepository(BoChuyenBaoCao)
    private boRepo: Repository<BoChuyenBaoCao>,
    @InjectRepository(TaiKhoanThuHuong)
    private taiKhoanThuHuongRepo: Repository<TaiKhoanThuHuong>,

    private readonly taskQueueService: TaskQueueService,
    private readonly roleDataSourceService: RoleDataSourceService,
  ) { }

  private initRoleProxies() {
    this.dataSource = this.roleDataSourceService.createDataSourceProxy(this.dataSource);
    this.namHocRepo = this.roleDataSourceService.createRepositoryProxy(NamHoc, this.namHocRepo);
    this.hocKyRepo = this.roleDataSourceService.createRepositoryProxy(HocKy, this.hocKyRepo);
    this.khoaHocRepo = this.roleDataSourceService.createRepositoryProxy(KhoaHoc, this.khoaHocRepo);
    this.vaiTroRepo = this.roleDataSourceService.createRepositoryProxy(VaiTro, this.vaiTroRepo);
    this.taiKhoanRepo = this.roleDataSourceService.createRepositoryProxy(TaiKhoan, this.taiKhoanRepo);
    this.svRepo = this.roleDataSourceService.createRepositoryProxy(SinhVien, this.svRepo);
    this.gvRepo = this.roleDataSourceService.createRepositoryProxy(GiangVien, this.gvRepo);
    this.nhaMayRepo = this.roleDataSourceService.createRepositoryProxy(NhaMay, this.nhaMayRepo);
    this.thongBaoRepo = this.roleDataSourceService.createRepositoryProxy(ThongBao, this.thongBaoRepo);
    this.tbFileRepo = this.roleDataSourceService.createRepositoryProxy(ThongBaoFile, this.tbFileRepo);
    this.dotRepo = this.roleDataSourceService.createRepositoryProxy(DotKienTap, this.dotRepo);
    this.lichRepo = this.roleDataSourceService.createRepositoryProxy(LichKienTap, this.lichRepo);
    this.dksvRepo = this.roleDataSourceService.createRepositoryProxy(DotKienTap_SinhVien, this.dksvRepo);
    this.chuyenRepo = this.roleDataSourceService.createRepositoryProxy(ChuyenThamQuan, this.chuyenRepo);
    this.danDoanRepo = this.roleDataSourceService.createRepositoryProxy(PhanCongGiangVienDanDoan, this.danDoanRepo);
    this.phieuRepo = this.roleDataSourceService.createRepositoryProxy(PhieuDangKy, this.phieuRepo);
    this.huyRepo = this.roleDataSourceService.createRepositoryProxy(YeuCauHuyDangKy, this.huyRepo);
    this.blacklistRepo = this.roleDataSourceService.createRepositoryProxy(DanhSachDen, this.blacklistRepo);
    this.hoaDonRepo = this.roleDataSourceService.createRepositoryProxy(HoaDonLePhi, this.hoaDonRepo);
    this.hoanPhiRepo = this.roleDataSourceService.createRepositoryProxy(DonHoanPhi, this.hoanPhiRepo);
    this.pcGvhdRepo = this.roleDataSourceService.createRepositoryProxy(PhanCongGVHD, this.pcGvhdRepo);
    this.diemDanhRepo = this.roleDataSourceService.createRepositoryProxy(DiemDanh, this.diemDanhRepo);
    this.baiRepo = this.roleDataSourceService.createRepositoryProxy(BaiThuHoach, this.baiRepo);
    this.diemPhieuRepo = this.roleDataSourceService.createRepositoryProxy(DiemPhieuThamQuan, this.diemPhieuRepo);
    this.deXuatRepo = this.roleDataSourceService.createRepositoryProxy(PhieuDeXuatChuyenThamQuan, this.deXuatRepo);
    this.phieuTQRepo = this.roleDataSourceService.createRepositoryProxy(PhieuThamQuan, this.phieuTQRepo);
    this.hdRepo = this.roleDataSourceService.createRepositoryProxy(HoiDongChamBaoCao, this.hdRepo);
    this.hdTvRepo = this.roleDataSourceService.createRepositoryProxy(HoiDong_ThanhVien, this.hdTvRepo);
    this.hdCtRepo = this.roleDataSourceService.createRepositoryProxy(DiemHoiDong_ChiTiet, this.hdCtRepo);
    this.boRepo = this.roleDataSourceService.createRepositoryProxy(BoChuyenBaoCao, this.boRepo);
    this.taiKhoanThuHuongRepo = this.roleDataSourceService.createRepositoryProxy(TaiKhoanThuHuong, this.taiKhoanThuHuongRepo);
  }

  async onModuleInit() {
    this.initRoleProxies();
    try {
      // 1. Tự động nới lỏng CHECK constraint sức chứa chuyến tự do (>= 1 thay vì bắt buộc = 1)
      await this.dataSource.query(`
        IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ChuyenThamQuan_TuDo_SucChua')
        BEGIN
          ALTER TABLE ChuyenThamQuan DROP CONSTRAINT CK_ChuyenThamQuan_TuDo_SucChua;
          ALTER TABLE ChuyenThamQuan ADD CONSTRAINT CK_ChuyenThamQuan_TuDo_SucChua 
            CHECK (cach_to_chuc <> N'TuDo' OR suc_chua >= 1);
        END
      `);

      // 2. Chuyển UQ_PhieuDeXuat_ChuyenThamQuan thành IX_PhieuDeXuat_ChuyenThamQuan (non-unique index)
      await this.dataSource.query(`
        IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_PhieuDeXuat_ChuyenThamQuan' AND object_id = OBJECT_ID('PhieuDeXuatChuyenThamQuan'))
        BEGIN
          DROP INDEX UQ_PhieuDeXuat_ChuyenThamQuan ON PhieuDeXuatChuyenThamQuan;
        END
        IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PhieuDeXuat_ChuyenThamQuan' AND object_id = OBJECT_ID('PhieuDeXuatChuyenThamQuan'))
        BEGIN
          CREATE NONCLUSTERED INDEX IX_PhieuDeXuat_ChuyenThamQuan ON PhieuDeXuatChuyenThamQuan(chuyen_tham_quan_id);
        END
      `);
    } catch (err: any) {
      console.warn('Lỗi kiểm tra migration tự động chuyến tự do:', err?.message || err);
    }
  }

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // Danh Muc CRUD: Năm học & Học kỳ (Ràng buộc chặt chẽ)
  // -------------------------------------------------------------
  private toDateOnlyString(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      return date.split('T')[0].trim();
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateVN(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  private validateYearName(name: string): { startYear: number; endYear: number } {
    if (!name || typeof name !== 'string') {
      throw new BadRequestException('Tên năm học không được để trống');
    }
    const trimmed = name.trim();
    const match = trimmed.match(/^(\d{4})-(\d{4})$/);
    if (!match) {
      throw new BadRequestException(
        'Tên năm học phải có định dạng YYYY-YYYY (Ví dụ: 2024-2025)',
      );
    }
    const startYear = parseInt(match[1], 10);
    const endYear = parseInt(match[2], 10);
    if (endYear !== startYear + 1) {
      throw new BadRequestException(
        `Năm kết thúc (${endYear}) phải bằng năm bắt đầu (${startYear}) + 1 (Ví dụ: ${startYear}-${startYear + 1})`,
      );
    }
    return { startYear, endYear };
  }

  async getYears() {
    return this.namHocRepo.find({ order: { ten_nam_hoc: 'DESC' } });
  }

  async createYear(data: Partial<NamHoc>) {
    if (!data.ten_nam_hoc) {
      throw new BadRequestException('Tên năm học không được để trống');
    }
    const { startYear, endYear } = this.validateYearName(data.ten_nam_hoc);
    const tenNamHoc = `${startYear}-${endYear}`;

    // 1. Kiểm tra trùng tên năm học
    const existing = await this.namHocRepo.findOne({
      where: { ten_nam_hoc: tenNamHoc },
    });
    if (existing) {
      throw new BadRequestException(`Năm học "${tenNamHoc}" đã tồn tại trên hệ thống`);
    }

    // 2. Kiểm tra ngày bắt đầu và ngày kết thúc
    if (!data.ngay_bat_dau || !data.ngay_ket_thuc) {
      throw new BadRequestException('Vui lòng chọn ngày bắt đầu và kết thúc năm học');
    }
    const startStr = this.toDateOnlyString(data.ngay_bat_dau);
    const endStr = this.toDateOnlyString(data.ngay_ket_thuc);
    if (startStr >= endStr) {
      throw new BadRequestException('Ngày kết thúc năm học phải lớn hơn ngày bắt đầu');
    }

    // 3. Kiểm tra chồng chéo khoảng thời gian với các năm học khác
    const allYears = await this.namHocRepo.find();
    for (const y of allYears) {
      const yStart = this.toDateOnlyString(y.ngay_bat_dau);
      const yEnd = this.toDateOnlyString(y.ngay_ket_thuc);
      if (startStr <= yEnd && endStr >= yStart) {
        throw new BadRequestException(
          `Khoảng thời gian năm học (${this.formatDateVN(startStr)} - ${this.formatDateVN(endStr)}) bị chồng chéo với năm học "${y.ten_nam_hoc}" (${this.formatDateVN(yStart)} - ${this.formatDateVN(yEnd)})`,
        );
      }
    }

    data.ten_nam_hoc = tenNamHoc;
    return this.namHocRepo.save(data);
  }

  async updateYear(id: number, data: Partial<NamHoc>) {
    const nh = await this.namHocRepo.findOne({ where: { id } });
    if (!nh) throw new NotFoundException('Không tìm thấy năm học');

    let tenNamHoc = nh.ten_nam_hoc;
    if (data.ten_nam_hoc) {
      const { startYear, endYear } = this.validateYearName(data.ten_nam_hoc);
      tenNamHoc = `${startYear}-${endYear}`;
      const duplicate = await this.namHocRepo.findOne({
        where: { ten_nam_hoc: tenNamHoc, id: Not(id) },
      });
      if (duplicate) {
        throw new BadRequestException(`Năm học "${tenNamHoc}" đã tồn tại trên hệ thống`);
      }
      data.ten_nam_hoc = tenNamHoc;
    }

    const startStr = this.toDateOnlyString(data.ngay_bat_dau ?? nh.ngay_bat_dau);
    const endStr = this.toDateOnlyString(data.ngay_ket_thuc ?? nh.ngay_ket_thuc);
    if (startStr >= endStr) {
      throw new BadRequestException('Ngày kết thúc năm học phải lớn hơn ngày bắt đầu');
    }

    // Kiểm tra chồng chéo thời gian với các năm học khác
    const otherYears = await this.namHocRepo.find({ where: { id: Not(id) } });
    for (const y of otherYears) {
      const yStart = this.toDateOnlyString(y.ngay_bat_dau);
      const yEnd = this.toDateOnlyString(y.ngay_ket_thuc);
      if (startStr <= yEnd && endStr >= yStart) {
        throw new BadRequestException(
          `Khoảng thời gian năm học (${this.formatDateVN(startStr)} - ${this.formatDateVN(endStr)}) bị chồng chéo với năm học "${y.ten_nam_hoc}" (${this.formatDateVN(yStart)} - ${this.formatDateVN(yEnd)})`,
        );
      }
    }

    // Kiểm tra không thu hẹp thời gian năm học làm rơi các học kỳ con ra ngoài
    const childTerms = await this.hocKyRepo.find({ where: { nam_hoc_id: id } });
    for (const term of childTerms) {
      const termStart = this.toDateOnlyString(term.ngay_bat_dau);
      const termEnd = this.toDateOnlyString(term.ngay_ket_thuc);
      if (startStr > termStart || endStr < termEnd) {
        throw new BadRequestException(
          `Không thể điều chỉnh thời gian năm học vì học kỳ "${term.ten_hoc_ky}" (${this.formatDateVN(termStart)} - ${this.formatDateVN(termEnd)}) sẽ nằm ngoài phạm vi năm học mới (${this.formatDateVN(startStr)} - ${this.formatDateVN(endStr)})`,
        );
      }
    }

    Object.assign(nh, data);
    await this.namHocRepo.save(nh);
    return { message: 'Cập nhật năm học thành công', data: nh };
  }

  async deleteYear(id: number) {
    const count = await this.hocKyRepo.count({ where: { nam_hoc_id: id } });
    if (count > 0) {
      throw new BadRequestException(
        'Không thể xóa năm học đã có học kỳ được gắn vào',
      );
    }
    const nh = await this.namHocRepo.findOne({ where: { id } });
    if (!nh) throw new NotFoundException('Không tìm thấy năm học');
    await this.namHocRepo.remove(nh);
    return { message: 'Xóa năm học thành công' };
  }

  async getTerms() {
    return this.hocKyRepo.find({
      relations: { namHoc: true },
      order: { ngay_bat_dau: 'DESC' },
    });
  }

  async createTerm(data: Partial<HocKy>) {
    if (!data.nam_hoc_id) {
      throw new BadRequestException('Vui lòng chọn năm học cho học kỳ');
    }
    const namHoc = await this.namHocRepo.findOne({ where: { id: data.nam_hoc_id } });
    if (!namHoc) {
      throw new NotFoundException('Không tìm thấy năm học đã chọn');
    }

    if (!data.ten_hoc_ky || !data.ten_hoc_ky.trim()) {
      throw new BadRequestException('Tên học kỳ không được để trống');
    }
    const tenHocKy = data.ten_hoc_ky.trim();

    // 1. Kiểm tra trùng tên học kỳ trong cùng năm học
    const existingSameName = await this.hocKyRepo.findOne({
      where: { nam_hoc_id: data.nam_hoc_id, ten_hoc_ky: tenHocKy },
    });
    if (existingSameName) {
      throw new BadRequestException(
        `Học kỳ "${tenHocKy}" đã tồn tại trong năm học ${namHoc.ten_nam_hoc}`,
      );
    }

    // 2. Kiểm tra ngày bắt đầu và ngày kết thúc
    if (!data.ngay_bat_dau || !data.ngay_ket_thuc) {
      throw new BadRequestException('Vui lòng chọn ngày bắt đầu và kết thúc của học kỳ');
    }
    const termStartStr = this.toDateOnlyString(data.ngay_bat_dau);
    const termEndStr = this.toDateOnlyString(data.ngay_ket_thuc);
    if (termStartStr >= termEndStr) {
      throw new BadRequestException('Ngày kết thúc học kỳ phải lớn hơn ngày bắt đầu');
    }

    // 3. RÀNG BUỘC CỐT LÕI: Thời gian học kỳ phải nằm trong năm học cha
    const yearStartStr = this.toDateOnlyString(namHoc.ngay_bat_dau);
    const yearEndStr = this.toDateOnlyString(namHoc.ngay_ket_thuc);
    if (termStartStr < yearStartStr || termEndStr > yearEndStr) {
      throw new BadRequestException(
        `Thời gian học kỳ (${this.formatDateVN(termStartStr)} - ${this.formatDateVN(termEndStr)}) phải nằm trong khoảng thời gian của năm học ${namHoc.ten_nam_hoc} (${this.formatDateVN(yearStartStr)} - ${this.formatDateVN(yearEndStr)})`,
      );
    }

    // 4. Kiểm tra không chồng chéo thời gian giữa các học kỳ trong cùng năm học
    const termsInYear = await this.hocKyRepo.find({
      where: { nam_hoc_id: data.nam_hoc_id },
    });
    for (const otherTerm of termsInYear) {
      const oStart = this.toDateOnlyString(otherTerm.ngay_bat_dau);
      const oEnd = this.toDateOnlyString(otherTerm.ngay_ket_thuc);
      if (termStartStr <= oEnd && termEndStr >= oStart) {
        throw new BadRequestException(
          `Thời gian học kỳ (${this.formatDateVN(termStartStr)} - ${this.formatDateVN(termEndStr)}) bị chồng chéo với học kỳ "${otherTerm.ten_hoc_ky}" (${this.formatDateVN(oStart)} - ${this.formatDateVN(oEnd)}) trong cùng năm học`,
        );
      }
    }

    data.ten_hoc_ky = tenHocKy;
    return this.hocKyRepo.save(data);
  }

  async updateTerm(id: number, data: Partial<HocKy>) {
    const hk = await this.hocKyRepo.findOne({
      where: { id },
      relations: { namHoc: true },
    });
    if (!hk) throw new NotFoundException('Không tìm thấy học kỳ');

    const targetNamHocId = data.nam_hoc_id ?? hk.nam_hoc_id;
    const namHoc = await this.namHocRepo.findOne({ where: { id: targetNamHocId } });
    if (!namHoc) throw new NotFoundException('Không tìm thấy năm học');

    let tenHocKy = hk.ten_hoc_ky;
    if (data.ten_hoc_ky) {
      tenHocKy = data.ten_hoc_ky.trim();
      const duplicate = await this.hocKyRepo.findOne({
        where: {
          nam_hoc_id: targetNamHocId,
          ten_hoc_ky: tenHocKy,
          id: Not(id),
        },
      });
      if (duplicate) {
        throw new BadRequestException(
          `Học kỳ "${tenHocKy}" đã tồn tại trong năm học ${namHoc.ten_nam_hoc}`,
        );
      }
      data.ten_hoc_ky = tenHocKy;
    }

    const termStartStr = this.toDateOnlyString(data.ngay_bat_dau ?? hk.ngay_bat_dau);
    const termEndStr = this.toDateOnlyString(data.ngay_ket_thuc ?? hk.ngay_ket_thuc);
    if (termStartStr >= termEndStr) {
      throw new BadRequestException('Ngày kết thúc học kỳ phải lớn hơn ngày bắt đầu');
    }

    // Thời gian học kỳ phải nằm trong năm học cha
    const yearStartStr = this.toDateOnlyString(namHoc.ngay_bat_dau);
    const yearEndStr = this.toDateOnlyString(namHoc.ngay_ket_thuc);
    if (termStartStr < yearStartStr || termEndStr > yearEndStr) {
      throw new BadRequestException(
        `Thời gian học kỳ (${this.formatDateVN(termStartStr)} - ${this.formatDateVN(termEndStr)}) phải nằm trong khoảng thời gian của năm học ${namHoc.ten_nam_hoc} (${this.formatDateVN(yearStartStr)} - ${this.formatDateVN(yearEndStr)})`,
      );
    }

    // Kiểm tra không chồng chéo với học kỳ khác trong cùng năm học
    const otherTerms = await this.hocKyRepo.find({
      where: { nam_hoc_id: targetNamHocId, id: Not(id) },
    });
    for (const otherTerm of otherTerms) {
      const oStart = this.toDateOnlyString(otherTerm.ngay_bat_dau);
      const oEnd = this.toDateOnlyString(otherTerm.ngay_ket_thuc);
      if (termStartStr <= oEnd && termEndStr >= oStart) {
        throw new BadRequestException(
          `Thời gian học kỳ (${this.formatDateVN(termStartStr)} - ${this.formatDateVN(termEndStr)}) bị chồng chéo với học kỳ "${otherTerm.ten_hoc_ky}" (${this.formatDateVN(oStart)} - ${this.formatDateVN(oEnd)}) trong cùng năm học`,
        );
      }
    }

    // Kiểm tra không thu hẹp thời gian học kỳ ngoài phạm vi các đợt kiến tập con hiện có
    const childDots = await this.dotRepo.find({ where: { hoc_ky_id: id } });
    for (const dot of childDots) {
      const dotStart = this.toDateOnlyString(dot.ngay_bat_dau);
      const dotEnd = this.toDateOnlyString(dot.ngay_ket_thuc);
      if (termStartStr > dotStart || termEndStr < dotEnd) {
        throw new BadRequestException(
          `Không thể điều chỉnh thời gian học kỳ vì đợt kiến tập "${dot.ten_dot}" (${this.formatDateVN(dotStart)} - ${this.formatDateVN(dotEnd)}) sẽ nằm ngoài phạm vi học kỳ mới (${this.formatDateVN(termStartStr)} - ${this.formatDateVN(termEndStr)})`,
        );
      }
    }

    Object.assign(hk, data);
    await this.hocKyRepo.save(hk);
    return { message: 'Cập nhật học kỳ thành công', data: hk };
  }

  async deleteTerm(id: number) {
    const dotCount = await this.dotRepo.count({ where: { hoc_ky_id: id } });
    if (dotCount > 0) {
      throw new BadRequestException(
        'Không thể xóa học kỳ đã có đợt kiến tập được gắn vào',
      );
    }
    const hk = await this.hocKyRepo.findOne({ where: { id } });
    if (!hk) throw new NotFoundException('Không tìm thấy học kỳ');
    await this.hocKyRepo.remove(hk);
    return { message: 'Xóa học kỳ thành công' };
  }

  async getCourses() {
    return this.khoaHocRepo.find();
  }

  async createCourse(data: Partial<KhoaHoc>) {
    return this.khoaHocRepo.save(data);
  }

  async updateCourse(id: number, data: Partial<KhoaHoc>) {
    const kh = await this.khoaHocRepo.findOne({ where: { id } });
    if (!kh) throw new NotFoundException('Không tìm thấy khóa');
    Object.assign(kh, data);
    await this.khoaHocRepo.save(kh);
    return { message: 'Cập nhật khóa thành công', data: kh };
  }

  async deleteCourse(id: number) {
    const count = await this.svRepo.count({ where: { khoa_hoc_id: id } });
    if (count > 0)
      throw new BadRequestException(
        'Không thể xóa khóa đã có sinh viên nằm trong đó',
      );
    const kh = await this.khoaHocRepo.findOne({ where: { id } });
    if (!kh) throw new NotFoundException('Không tìm thấy khóa');
    await this.khoaHocRepo.remove(kh);
    return { message: 'Xóa khóa thành công' };
  }

  async getFactories() {
    const factories = await this.nhaMayRepo.find();
    if (factories.length === 0) return [];

    const tripCounts = await this.chuyenRepo
      .createQueryBuilder('ctq')
      .select('ctq.nha_may_id', 'nha_may_id')
      .addSelect('COUNT(ctq.id)', 'count')
      .groupBy('ctq.nha_may_id')
      .getRawMany();

    const deXuatCounts = await this.deXuatRepo
      .createQueryBuilder('dx')
      .select('dx.nha_may_id', 'nha_may_id')
      .addSelect('COUNT(dx.id)', 'count')
      .where('dx.nha_may_id IS NOT NULL')
      .groupBy('dx.nha_may_id')
      .getRawMany();

    const draftTripCounts = await this.chuyenRepo
      .createQueryBuilder('ctq')
      .select('ctq.nha_may_id', 'nha_may_id')
      .addSelect('COUNT(ctq.id)', 'count')
      .where("ctq.trang_thai = 'Nhap'")
      .groupBy('ctq.nha_may_id')
      .getRawMany();

    const tripMap = new Map<number, number>();
    for (const r of tripCounts) {
      if (r.nha_may_id != null) {
        tripMap.set(Number(r.nha_may_id), Number(r.count) || 0);
      }
    }
    for (const r of deXuatCounts) {
      if (r.nha_may_id != null) {
        const factoryId = Number(r.nha_may_id);
        const current = tripMap.get(factoryId) || 0;
        tripMap.set(factoryId, current + (Number(r.count) || 0));
      }
    }

    const draftMap = new Map<number, number>();
    for (const r of draftTripCounts) {
      if (r.nha_may_id != null) {
        draftMap.set(Number(r.nha_may_id), Number(r.count) || 0);
      }
    }

    return factories.map((f) => ({
      ...f,
      so_chuyen_tham_quan: tripMap.get(f.id) || 0,
      so_chuyen_nhap: draftMap.get(f.id) || 0,
    }));
  }

  async getFactoryIndustryGroups() {
    return [];
  }
  async createFactory(data: Partial<NhaMay>) {
    return this.nhaMayRepo.save(data);
  }
  async updateFactory(id: number, data: Partial<NhaMay>) {
    if (data.trang_thai === 'NgungHopTac') {
      const draftCount = await this.chuyenRepo.count({
        where: { nha_may_id: id, trang_thai: 'Nhap' },
      });
      if (draftCount > 0) {
        throw new BadRequestException(
          `Nhà máy này đang có ${draftCount} chuyến tham quan ở trạng thái Nháp. Vui lòng xóa các chuyến tham quan nháp trước khi chọn ngừng hợp tác.`,
        );
      }
    }

    await this.nhaMayRepo.update(id, data);
    return this.nhaMayRepo.findOne({ where: { id } });
  }

  async deleteFactory(id: number) {
    const factory = await this.nhaMayRepo.findOne({ where: { id } });
    if (!factory) {
      throw new NotFoundException('Không tìm thấy nhà máy cần xóa');
    }

    const tripCount = await this.chuyenRepo.count({ where: { nha_may_id: id } });
    const proposalCount = await this.deXuatRepo.count({ where: { nha_may_id: id } });
    const totalLinked = tripCount + proposalCount;

    if (totalLinked > 0) {
      throw new BadRequestException(
        `Nhà máy "${factory.ten_nha_may}" đã có ${totalLinked} chuyến tham quan/đề xuất liên quan trong hệ thống. Không thể xóa để bảo toàn dữ liệu học vụ, chỉ có thể chuyển sang trạng thái "Ngừng hợp tác".`
      );
    }

    await this.nhaMayRepo.delete(id);
    return { success: true, message: 'Xóa nhà máy thành công' };
  }

  // -------------------------------------------------------------
  // Giang Vien & Sinh Vien
  // -------------------------------------------------------------
  async getLecturers() {
    return this.gvRepo.find();
  }

  async updateLecturerBoardEligibility(id: number, duDkHoiDong: boolean) {
    const gv = await this.gvRepo.findOne({ where: { id } });
    if (!gv) throw new NotFoundException('Không tìm thấy giảng viên');
    gv.du_dk_hoi_dong = duDkHoiDong;
    await this.gvRepo.save(gv);
    return {
      message: duDkHoiDong
        ? 'Đã đánh dấu đủ điều kiện Hội đồng'
        : 'Đã bỏ đánh dấu đủ điều kiện Hội đồng',
      data: gv,
    };
  }

  async createLecturer(data: any) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const existUser = await manager.findOne(TaiKhoan, {
        where: { ten_dang_nhap: data.ma_gv },
      });
      if (existUser) {
        throw new BadRequestException(
          'Mã giảng viên (tên đăng nhập) đã tồn tại',
        );
      }
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(data.ma_gv, salt);

      const newAccount = new TaiKhoan();
      newAccount.ten_dang_nhap = data.ma_gv;
      newAccount.mat_khau_hash = hashPassword;
      const vaiTroInfo = await manager.findOne(VaiTro, {
        where: { ma_vai_tro: 'GiangVien' },
      });
      newAccount.vai_tro_id = vaiTroInfo!.id;
      newAccount.phai_doi_mat_khau = true;
      newAccount.trang_thai = 'HoatDong';
      const savedAccount = await manager.save(TaiKhoan, newAccount);

      const newLecturer = new GiangVien();
      newLecturer.ma_gv = data.ma_gv;
      newLecturer.ho_ten = data.ho_ten;
      newLecturer.email = data.email || '';
      newLecturer.sdt = data.sdt || '';
      newLecturer.so_sv_toi_da_huong_dan = data.so_sv_toi_da_huong_dan || null;
      newLecturer.taikhoan_id = savedAccount.id;
      const savedLecturer = await manager.save(GiangVien, newLecturer);

      return {
        message: 'Thêm giảng viên và tạo tài khoản thành công',
        giangVien: savedLecturer,
      };
    });
  }

  async updateLecturer(id: number, data: any) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const gv = await manager.findOne(GiangVien, {
        where: { id },
        relations: { taiKhoan: true },
      });
      if (!gv) throw new NotFoundException('Không tìm thấy giảng viên');

      if (data.ma_gv !== undefined && data.ma_gv !== gv.ma_gv) {
        // Kiểm tra mã giảng viên mới đã tồn tại chưa
        const existUser = await manager.findOne(TaiKhoan, {
          where: { ten_dang_nhap: data.ma_gv },
        });
        if (existUser) {
          throw new BadRequestException(
            'Mã giảng viên (tên đăng nhập) đã tồn tại',
          );
        }
        gv.ma_gv = data.ma_gv;
        if (gv.taiKhoan) {
          gv.taiKhoan.ten_dang_nhap = data.ma_gv;
          await manager.save(TaiKhoan, gv.taiKhoan);
        }
      }

      if (data.ho_ten !== undefined) gv.ho_ten = data.ho_ten;
      if (data.email !== undefined) gv.email = data.email;
      if (data.sdt !== undefined) gv.sdt = data.sdt;
      if (data.so_sv_toi_da_huong_dan !== undefined)
        gv.so_sv_toi_da_huong_dan = data.so_sv_toi_da_huong_dan;

      await manager.save(GiangVien, gv);
      return { message: 'Cập nhật giảng viên thành công', data: gv };
    });
  }
  async getStudents(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.svRepo
      .createQueryBuilder('sinhVien')
      .leftJoinAndSelect('sinhVien.khoaHoc', 'khoaHoc');

    if (search) {
      queryBuilder.where(
        'sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search',
        { search: `%${search}%` },
      );
    }

    const take = limit;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .orderBy('sinhVien.mssv', 'ASC')
      .take(take)
      .skip(skip)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUniqueClasses() {
    const result = await this.svRepo
      .createQueryBuilder('sv')
      .select('DISTINCT sv.ten_lop', 'ten_lop')
      .where('sv.ten_lop IS NOT NULL')
      .andWhere("sv.ten_lop != ''")
      .orderBy('sv.ten_lop', 'ASC')
      .getRawMany();
    return result.map((r) => r.ten_lop);
  }

  async createStudent(data: any) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. Kiểm tra MSSV (tên đăng nhập) đã tồn tại chưa
      const existUser = await manager.findOne(TaiKhoan, {
        where: { ten_dang_nhap: data.mssv },
      });
      if (existUser) {
        // Kiểm tra xem tài khoản này có đang gắn với sinh viên nào không
        const linkedStudent = await manager.findOne(SinhVien, {
          where: { taikhoan_id: existUser.id },
        });
        if (linkedStudent) {
          throw new BadRequestException(
            'Mã số sinh viên (tên đăng nhập) đã tồn tại',
          );
        } else {
          // Tài khoản mồ côi (tồn dư từ trước) -> dọn dẹp để tạo lại sạch sẽ
          await manager.delete(TaiKhoan, existUser.id);
        }
      }

      // 2. Tạo tài khoản
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(data.mssv, salt);

      const newAccount = new TaiKhoan();
      newAccount.ten_dang_nhap = data.mssv;
      newAccount.mat_khau_hash = hashPassword;
      const vaiTroInfo = await manager.findOne(VaiTro, {
        where: { ma_vai_tro: 'SinhVien' },
      });
      newAccount.vai_tro_id = vaiTroInfo!.id;
      newAccount.phai_doi_mat_khau = true; // Yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên
      newAccount.trang_thai = 'HoatDong';

      const savedAccount = await manager.save(TaiKhoan, newAccount);

      // 3. Tạo thông tin sinh viên
      const newStudent = new SinhVien();
      newStudent.mssv = data.mssv;
      newStudent.ho_ten = data.ho_ten;
      newStudent.email = data.email || `${data.mssv}@huit.edu.vn`;
      newStudent.sdt = data.sdt || '';
      newStudent.ten_lop = data.ten_lop || '';
      newStudent.taikhoan_id = savedAccount.id;

      if (data.khoa_hoc_id) {
        newStudent.khoa_hoc_id = data.khoa_hoc_id;
      } else if (data.ten_khoa_hoc && data.ten_khoa_hoc !== 'Khác') {
        let khoa = await manager.findOne(KhoaHoc, {
          where: { ten_khoa_hoc: data.ten_khoa_hoc },
        });
        if (!khoa) {
          khoa = new KhoaHoc();
          khoa.ten_khoa_hoc = data.ten_khoa_hoc;
          const match = data.ten_khoa_hoc.match(/\d+/);
          if (match) {
            const soKhoa = parseInt(match[0], 10);
            khoa.ma_khoa_hoc = `${soKhoa}ĐHTP`;
            khoa.nam_nhap_hoc = new Date().getFullYear();
          } else {
            khoa.ma_khoa_hoc = data.ten_khoa_hoc.replace(/\s+/g, '');
            khoa.nam_nhap_hoc = new Date().getFullYear();
          }
          khoa = await manager.save(KhoaHoc, khoa);
        }
        newStudent.khoa_hoc_id = khoa.id;
      } else {
        const khoa = await manager.findOne(KhoaHoc, { where: {} });
        if (khoa) {
          newStudent.khoa_hoc_id = khoa.id;
        } else {
          throw new BadRequestException(
            'Hệ thống chưa có Khóa Học nào để gán cho sinh viên',
          );
        }
      }

      const savedStudent = await manager.save(SinhVien, newStudent);

      return {
        message: 'Thêm sinh viên và tạo tài khoản thành công',
        sinhVien: savedStudent,
      };
    });
  }

  async updateStudent(id: number, data: any) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const sv = await manager.findOne(SinhVien, {
        where: { id },
        relations: { taiKhoan: true },
      });
      if (!sv) throw new NotFoundException('Không tìm thấy sinh viên');

      if (data.mssv !== undefined && data.mssv !== sv.mssv) {
        // Kiểm tra MSSV mới đã tồn tại chưa
        const existUser = await manager.findOne(TaiKhoan, {
          where: { ten_dang_nhap: data.mssv },
        });
        if (existUser) {
          const linkedStudent = await manager.findOne(SinhVien, {
            where: { taikhoan_id: existUser.id },
          });
          if (linkedStudent && linkedStudent.id !== id) {
            throw new BadRequestException(
              'Mã số sinh viên (tên đăng nhập) đã tồn tại',
            );
          } else if (!linkedStudent) {
            // Tài khoản mồ côi -> dọn dẹp
            await manager.delete(TaiKhoan, existUser.id);
          }
        }
        sv.mssv = data.mssv;
        if (sv.taiKhoan) {
          sv.taiKhoan.ten_dang_nhap = data.mssv;
          await manager.save(TaiKhoan, sv.taiKhoan);
        }
      }

      if (data.ho_ten !== undefined) sv.ho_ten = data.ho_ten;
      if (data.email !== undefined) sv.email = data.email;
      if (data.sdt !== undefined) sv.sdt = data.sdt;
      if (data.ten_lop !== undefined) sv.ten_lop = data.ten_lop;

      if (data.ten_khoa_hoc && data.ten_khoa_hoc !== 'Khác') {
        let khoa = await manager.findOne(KhoaHoc, {
          where: { ten_khoa_hoc: data.ten_khoa_hoc },
        });
        if (!khoa) {
          khoa = new KhoaHoc();
          khoa.ten_khoa_hoc = data.ten_khoa_hoc;
          const match = data.ten_khoa_hoc.match(/\d+/);
          if (match) {
            const soKhoa = parseInt(match[0], 10);
            khoa.ma_khoa_hoc = `${soKhoa}ĐHTP`;
            khoa.nam_nhap_hoc = new Date().getFullYear();
          } else {
            khoa.ma_khoa_hoc = data.ten_khoa_hoc.replace(/\s+/g, '');
            khoa.nam_nhap_hoc = new Date().getFullYear();
          }
          khoa = await manager.save(KhoaHoc, khoa);
        }
        sv.khoa_hoc_id = khoa.id;
      }

      await manager.save(SinhVien, sv);
      return { message: 'Cập nhật sinh viên thành công', data: sv };
    });
  }

  async deleteStudent(id: number) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const sv = await manager.findOne(SinhVien, {
        where: { id },
        relations: { taiKhoan: true },
      });
      if (!sv) throw new NotFoundException('Không tìm thấy sinh viên');

      // 1. Kiểm tra toàn diện các ràng buộc dữ liệu
      const [hasRegistrations, hasCampaigns, hasProposals, hasBlacklist] =
        await Promise.all([
          manager.count(PhieuDangKy, { where: { sinh_vien_id: id } }),
          manager.count(DotKienTap_SinhVien, { where: { sinh_vien_id: id } }),
          manager.count(PhieuDeXuatChuyenThamQuan, {
            where: { sinh_vien_id: id },
          }),
          manager.count(DanhSachDen, { where: { sinh_vien_id: id } }),
        ]);

      const hasConstraints =
        hasRegistrations > 0 ||
        hasCampaigns > 0 ||
        hasProposals > 0 ||
        hasBlacklist > 0;

      // 2. Nếu đã có dữ liệu tham gia, chuyển sang khóa tài khoản thay vì xóa cứng
      if (hasConstraints) {
        if (sv.taiKhoan) {
          sv.taiKhoan.trang_thai = 'KhoaTaiKhoan';
          await manager.save(TaiKhoan, sv.taiKhoan);
        }
        return {
          message:
            'Sinh viên đã có dữ liệu trong hệ thống (đợt kiến tập/đăng ký) nên không thể xóa hoàn toàn — đã chuyển sang khóa tài khoản thay thế',
          action: 'locked',
        };
      }

      // 3. Nếu chưa có ràng buộc, xóa đồng thời SinhVien và TaiKhoan trong cùng transaction
      const taiKhoanId = sv.taikhoan_id || sv.taiKhoan?.id;
      await manager.remove(SinhVien, sv);

      if (taiKhoanId) {
        await manager.delete(TaiKhoan, taiKhoanId);
      }

      return {
        message: 'Xóa sinh viên và tài khoản liên kết thành công',
        action: 'deleted',
      };
    });
  }

  async getAccounts(
    page: number = 1,
    limit: number = 15,
    search?: string,
    vaiTro?: string,
    trangThai?: string,
  ) {
    const qb = this.taiKhoanRepo
      .createQueryBuilder('tk')
      .leftJoin('tk.vaiTro', 'vt')
      .leftJoin('SinhVien', 'sv', 'sv.taikhoan_id = tk.id')
      .leftJoin('GiangVien', 'gv', 'gv.taikhoan_id = tk.id')
      .select([
        'tk.id AS id',
        'tk.ten_dang_nhap AS ten_dang_nhap',
        'vt.ten_vai_tro AS vai_tro',
        'tk.trang_thai AS trang_thai',
        'tk.lan_dang_nhap_cuoi AS lan_dang_nhap_cuoi',
        'COALESCE(sv.ho_ten, gv.ho_ten, tk.ten_dang_nhap) AS ho_ten',
      ]);

    if (search) {
      qb.andWhere(
        '(tk.ten_dang_nhap LIKE :s OR sv.ho_ten LIKE :s OR gv.ho_ten LIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (vaiTro) qb.andWhere('vt.ma_vai_tro = :vaiTro', { vaiTro });
    if (trangThai) qb.andWhere('tk.trang_thai = :trangThai', { trangThai });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('tk.ngay_tao', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async toggleAccountLock(accountId: number) {
    const tk = await this.taiKhoanRepo.findOne({ where: { id: accountId } });
    if (!tk) throw new NotFoundException('Không tìm thấy tài khoản');
    tk.trang_thai = tk.trang_thai === 'HoatDong' ? 'KhoaTaiKhoan' : 'HoatDong';
    await this.taiKhoanRepo.save(tk);
    return {
      message:
        tk.trang_thai === 'KhoaTaiKhoan'
          ? 'Đã khóa tài khoản'
          : 'Đã mở khóa tài khoản',
      data: tk,
    };
  }

  async resetAccountPassword(accountId: number) {
    const tk = await this.taiKhoanRepo.findOne({ where: { id: accountId } });
    if (!tk) throw new NotFoundException('Không tìm thấy tài khoản');
    const salt = await bcrypt.genSalt(10);
    tk.mat_khau_hash = await bcrypt.hash(tk.ten_dang_nhap, salt);
    tk.phai_doi_mat_khau = true;
    await this.taiKhoanRepo.save(tk);
    return {
      message: `Đã đặt lại mật khẩu về mặc định (trùng tên đăng nhập: ${tk.ten_dang_nhap})`,
    };
  }

  // -------------------------------------------------------------
  // Dot Kien Tap & Lich Kien Tap
  // -------------------------------------------------------------
  async getCampaigns(
    page: number = 1,
    limit: number = 15,
    search?: string,
    namHoc?: string,
    hocKy?: string,
    trangThai?: string,
    excludeDraft: boolean = false,
  ) {
    const query = this.dotRepo
      .createQueryBuilder('dot')
      .leftJoinAndSelect('dot.hocKy', 'hocKy')
      .leftJoinAndSelect('hocKy.namHoc', 'namHoc')
      .leftJoinAndSelect('dot.khoaHoc', 'khoaHoc')
      .orderBy('dot.id', 'DESC');

    if (search) {
      query.andWhere('dot.ten_dot LIKE :search', { search: `%${search}%` });
    }

    if (namHoc) {
      query.andWhere('namHoc.id = :namHoc', { namHoc: parseInt(namHoc) });
    }

    if (hocKy) {
      query.andWhere('hocKy.id = :hocKy', { hocKy: parseInt(hocKy) });
    }

    if (excludeDraft) {
      query.andWhere('dot.trang_thai != :draftStatus', { draftStatus: 'Nhap' });
    }

    if (trangThai) {
      query.andWhere('dot.trang_thai = :trangThai', { trangThai });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async createCampaign(data: any, userId?: number) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. Kiểm tra trùng tên đợt trong cùng hoc_ky_id + khoa_id
      const existing = await manager.findOne(DotKienTap, {
        where: {
          hoc_ky_id: data.hoc_ky_id,
          khoa_hoc_id: data.khoa_hoc_id,
          ten_dot: data.ten_dot,
        },
      });
      if (existing) {
        throw new BadRequestException(
          'Tên đợt kiến tập đã tồn tại trong cùng Học kỳ và Khóa. Vui lòng chọn tên khác.',
        );
      }

      if (
        data.ngay_bat_dau &&
        data.ngay_ket_thuc &&
        new Date(data.ngay_bat_dau) >= new Date(data.ngay_ket_thuc)
      ) {
        throw new BadRequestException(
          'Ngày bắt đầu đợt kiến tập phải trước ngày kết thúc.',
        );
      }

      // 2. Tạo Đợt kiến tập
      const newDot = new DotKienTap();
      newDot.hoc_ky_id = data.hoc_ky_id;
      newDot.khoa_hoc_id = data.khoa_hoc_id;
      newDot.ten_dot = data.ten_dot;
      newDot.ngay_bat_dau = data.ngay_bat_dau;
      newDot.ngay_ket_thuc = data.ngay_ket_thuc;
      newDot.trang_thai = 'Nhap';
      const savedDot = await manager.save(DotKienTap, newDot);

      // 3. Import sinh viên vào Đợt (nếu có danh_sach_sinh_vien)
      if (
        data.danh_sach_sinh_vien &&
        Array.isArray(data.danh_sach_sinh_vien) &&
        data.danh_sach_sinh_vien.length > 0
      ) {
        // Lấy tất cả mssv từ dữ liệu truyền vào
        const mssvList = data.danh_sach_sinh_vien
          .map((sv: any) => sv.mssv)
          .filter(Boolean);

        // Tìm các sinh viên đã tồn tại trong DB
        const existingStudents = await manager.find(SinhVien, {
          where: { mssv: In(mssvList) },
        });

        const existingMssvSet = new Set(existingStudents.map((sv) => sv.mssv));

        // Lọc ra các sinh viên bị thiếu
        const missingStudents = data.danh_sach_sinh_vien.filter(
          (sv: any) => sv.mssv && !existingMssvSet.has(sv.mssv),
        );

        if (missingStudents.length > 0) {
          throw new BadRequestException({
            message:
              'Danh sách sinh viên không hợp lệ (Chưa có trong hệ thống)',
            missingStudents: missingStudents,
          });
        }

        // Tất cả hợp lệ, tiến hành thêm vào đợt
        for (const sv of existingStudents) {
          const dksvExist = await manager.findOne(DotKienTap_SinhVien, {
            where: { dot_kien_tap_id: savedDot.id, sinh_vien_id: sv.id },
          });

          if (!dksvExist) {
            const dksv = new DotKienTap_SinhVien();
            dksv.dot_kien_tap_id = savedDot.id;
            dksv.sinh_vien_id = sv.id;
            dksv.lan_dang_ky = 1;
            dksv.trang_thai = 'DangThucHien';
            await manager.save(DotKienTap_SinhVien, dksv);
          }
        }
      }

      return savedDot;
    });
  }

  async updateCampaign(id: number, data: any, userId?: number) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const campaign = await manager.findOne(DotKienTap, { where: { id } });
      if (!campaign) throw new NotFoundException('Không tìm thấy đợt kiến tập');
      if (campaign.trang_thai !== 'Nhap') {
        throw new BadRequestException(
          'Chỉ có thể chỉnh sửa đợt kiến tập ở trạng thái Nháp',
        );
      }

      if (data.danh_sach_sinh_vien && Array.isArray(data.danh_sach_sinh_vien)) {
        const mssvList = data.danh_sach_sinh_vien
          .map((sv: any) => sv.mssv)
          .filter(Boolean);
        const existingStudents = await manager.find(SinhVien, {
          where: { mssv: In(mssvList) },
        });
        const existingMssvSet = new Set(existingStudents.map((sv) => sv.mssv));
        const missingStudents = data.danh_sach_sinh_vien.filter(
          (sv: any) => sv.mssv && !existingMssvSet.has(sv.mssv),
        );

        if (missingStudents.length > 0) {
          throw new BadRequestException({
            message:
              'Danh sách sinh viên không hợp lệ (Chưa có trong hệ thống)',
            missingStudents: missingStudents,
          });
        }

        // Delete existing students
        await manager.delete(DotKienTap_SinhVien, { dot_kien_tap_id: id });

        // Insert new ones
        for (const sv of existingStudents) {
          const dksv = new DotKienTap_SinhVien();
          dksv.dot_kien_tap_id = id;
          dksv.sinh_vien_id = sv.id;
          dksv.lan_dang_ky = 1;
          dksv.trang_thai = 'DangThucHien';
          await manager.save(DotKienTap_SinhVien, dksv);
        }
      }

      const oldTrangThai = campaign.trang_thai;
      const { danh_sach_sinh_vien, ...updateData } = data;
      Object.assign(campaign, updateData);

      if (
        campaign.ngay_bat_dau &&
        campaign.ngay_ket_thuc &&
        new Date(campaign.ngay_bat_dau) >= new Date(campaign.ngay_ket_thuc)
      ) {
        throw new BadRequestException(
          'Ngày bắt đầu đợt kiến tập phải trước ngày kết thúc.',
        );
      }

      const savedCampaign = await manager.save(DotKienTap, campaign);

      // Gửi thông báo đến Ban chủ nhiệm CLB khi Khoa chính thức gửi đợt (chuyển sang 'DangTrienKhai')
      if (oldTrangThai === 'Nhap' && savedCampaign.trang_thai === 'DangTrienKhai') {
        try {
          const thoiGianStr =
            savedCampaign.ngay_bat_dau && savedCampaign.ngay_ket_thuc
              ? ` (Từ ${new Date(savedCampaign.ngay_bat_dau).toLocaleDateString('vi-VN')} đến ${new Date(savedCampaign.ngay_ket_thuc).toLocaleDateString('vi-VN')})`
              : '';

          const notif = new ThongBao();
          notif.tieu_de = `[Đợt kiến tập mới] ${savedCampaign.ten_dot}`;
          notif.noi_dung = `Khoa đã gửi đợt kiến tập: "${savedCampaign.ten_dot}"${thoiGianStr}. Ban chủ nhiệm CLB vui lòng chuẩn bị kế hoạch tham quan và lập lịch kiến tập cho sinh viên.`;
          notif.nguoi_gui_id = userId || 1;
          notif.doi_tuong_nhan = 'CLB';
          notif.loai_thong_bao = 'NhacNho';
          if (savedCampaign.khoa_hoc_id) notif.khoa_hoc_id = savedCampaign.khoa_hoc_id;
          notif.ngay_gui = new Date();
          notif.da_chinh_sua = false;
          await manager.save(ThongBao, notif);
        } catch (err) {
          console.warn('Lỗi khi gửi thông báo đợt kiến tập mới cho CLB:', err);
        }
      }

      return savedCampaign;
    });
  }

  async deleteCampaign(id: number) {
    const campaign = await this.dotRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Không tìm thấy đợt kiến tập');
    if (campaign.trang_thai !== 'Nhap') {
      throw new BadRequestException(
        'Chỉ có thể xóa đợt kiến tập ở trạng thái Nháp',
      );
    }

    // Xóa các liên kết sinh viên - đợt kiến tập trước
    await this.dksvRepo.delete({ dot_kien_tap_id: id });

    await this.dotRepo.remove(campaign);
    return { message: 'Xóa đợt kiến tập thành công' };
  }

  async getCampaignStudents(
    id: number,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const query = this.dksvRepo
      .createQueryBuilder('dksv')
      .leftJoinAndSelect('dksv.sinhVien', 'sinhVien')
      .leftJoinAndSelect('sinhVien.khoaHoc', 'khoaHoc')
      .where('dksv.dot_kien_tap_id = :id', { id });

    if (search) {
      query.andWhere(
        '(sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addStudentToCampaign(id: number, mssv: string) {
    const campaign = await this.dotRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Không tìm thấy đợt kiến tập');

    const sv = await this.svRepo.findOne({ where: { mssv } });
    if (!sv)
      throw new BadRequestException(
        `Sinh viên có MSSV ${mssv} không tồn tại trong hệ thống.`,
      );

    const existing = await this.dksvRepo.findOne({
      where: { dot_kien_tap_id: id, sinh_vien_id: sv.id },
    });

    if (existing)
      throw new BadRequestException(
        'Sinh viên này đã có trong danh sách của đợt.',
      );

    const dksv = new DotKienTap_SinhVien();
    dksv.dot_kien_tap_id = id;
    dksv.sinh_vien_id = sv.id;
    dksv.lan_dang_ky = 1;
    dksv.trang_thai = 'DangThucHien';
    await this.dksvRepo.save(dksv);

    const savedDksv = await this.dksvRepo.findOne({
      where: { dot_kien_tap_id: id, sinh_vien_id: sv.id },
      relations: { sinhVien: true },
    });
    return { message: 'Thêm sinh viên thành công', data: savedDksv };
  }

  async removeStudentFromCampaign(id: number, studentId: number) {
    const existing = await this.dksvRepo.findOne({
      where: { dot_kien_tap_id: id, sinh_vien_id: studentId },
    });
    if (!existing)
      throw new NotFoundException('Sinh viên không nằm trong đợt này.');

    await this.dksvRepo.remove(existing);
    return { message: 'Xóa sinh viên khỏi đợt thành công' };
  }

  // [ĐÃ XÓA] publishCampaign(): Trạng thái đợt kiến tập giờ được tự động
  // chuyển bởi updateDotKienTapStatus() — không còn cho phép nhập tay.
  // Xem updateDotKienTapStatus() bên dưới.

  async getSchedules(userRole?: string, excludeInactive: boolean = false) {
    const schedules = await this.lichRepo.find({
      relations: { dotKienTap: { khoaHoc: true } },
    });

    // Tự động đồng bộ các lịch con nếu đợt kiến tập đã có lịch bị 'DaKhoa'
    const lockedDotIds = new Set<number>();
    for (const s of schedules) {
      if (s.trang_thai === 'DaKhoa' && s.dot_kien_tap_id) {
        lockedDotIds.add(s.dot_kien_tap_id);
      }
    }
    if (lockedDotIds.size > 0) {
      let hasChanges = false;
      for (const s of schedules) {
        if (
          s.dot_kien_tap_id &&
          lockedDotIds.has(s.dot_kien_tap_id) &&
          s.trang_thai !== 'DaKhoa' &&
          !['DaHuy', 'TuChoi'].includes(s.trang_thai)
        ) {
          s.trang_thai = 'DaKhoa';
          await this.lichRepo.save(s);
          hasChanges = true;
        }
      }
      if (hasChanges) {
        for (const dotId of lockedDotIds) {
          await this.updateDotKienTapStatus(dotId);
        }
      }
    }

    let result = schedules;
    if (userRole === 'QuanLyKhoa') {
      result = result.filter((s) => s.trang_thai !== 'Nhap');
    }
    if (excludeInactive) {
      result = result.filter((s) => !['Nhap', 'ChoDuyet', 'TuChoi', 'DaHuy'].includes(s.trang_thai));
    }
    return result;
  }
  private validateRegistrationTimeWithCampaign(
    dot: DotKienTap,
    tgTu: Date | string,
    tgDen: Date | string,
  ) {
    if (!tgTu || !tgDen) return;

    const tu = new Date(tgTu);
    const den = new Date(tgDen);

    if (isNaN(tu.getTime()) || isNaN(den.getTime())) {
      throw new BadRequestException('Thời gian mở đăng ký không hợp lệ.');
    }

    // Nếu chỉ truyền date string (YYYY-MM-DD), chuẩn hóa tu về đầu ngày (00:00:00) và den về cuối ngày (23:59:59.999)
    if (typeof tgTu === 'string' && !tgTu.includes('T') && !tgTu.includes(':')) {
      tu.setHours(0, 0, 0, 0);
    }
    if (typeof tgDen === 'string' && !tgDen.includes('T') && !tgDen.includes(':')) {
      den.setHours(23, 59, 59, 999);
    }

    // Nếu cùng ngày (ví dụ mở cùng ngày 31/10/2026), cho phép trùng ngày bằng cách gán tu lúc 00:00:00 và den lúc 23:59:59.999
    const tuDateOnly = new Date(tu.getFullYear(), tu.getMonth(), tu.getDate());
    const denDateOnly = new Date(den.getFullYear(), den.getMonth(), den.getDate());

    if (tuDateOnly.getTime() === denDateOnly.getTime() && tu.getTime() >= den.getTime()) {
      tu.setHours(0, 0, 0, 0);
      den.setHours(23, 59, 59, 999);
    }

    if (tu > den) {
      throw new BadRequestException(
        'Thời gian mở đăng ký (từ) không được sau thời gian mở đăng ký (đến).',
      );
    }

    // Chuẩn hóa mốc bắt đầu đợt kiến tập (00:00:00)
    const dotStart = new Date(dot.ngay_bat_dau);
    dotStart.setHours(0, 0, 0, 0);

    // Chuẩn hóa mốc kết thúc đợt kiến tập (23:59:59.999)
    const dotEnd = new Date(dot.ngay_ket_thuc);
    dotEnd.setHours(23, 59, 59, 999);

    if (tu < dotStart) {
      const dotStartStr = new Date(dot.ngay_bat_dau).toLocaleDateString('vi-VN');
      throw new BadRequestException(
        `Thời gian mở đăng ký (từ) không được sớm hơn ngày bắt đầu của đợt kiến tập (${dotStartStr}).`,
      );
    }

    if (den > dotEnd) {
      const dotEndStr = new Date(dot.ngay_ket_thuc).toLocaleDateString('vi-VN');
      throw new BadRequestException(
        `Thời gian mở đăng ký (đến) không được muộn hơn ngày kết thúc của đợt kiến tập (${dotEndStr}).`,
      );
    }
  }

  private validateRegistrationTimeWithTrips(
    tgDen: Date | string,
    trips: ChuyenThamQuan[],
  ) {
    if (!tgDen || !trips || trips.length === 0) return;

    const denDate = new Date(tgDen);
    const denDay = new Date(
      denDate.getFullYear(),
      denDate.getMonth(),
      denDate.getDate(),
    );

    for (const trip of trips) {
      if (trip.ngay_tham_quan) {
        const tripDate = new Date(trip.ngay_tham_quan);
        const tripDay = new Date(
          tripDate.getFullYear(),
          tripDate.getMonth(),
          tripDate.getDate(),
        );

        if (denDay >= tripDay) {
          const denStr = denDate.toLocaleDateString('vi-VN');
          const tripStr = tripDate.toLocaleDateString('vi-VN');
          const nhaMayName = trip.nhaMay?.ten_nha_may || 'Chuyến tham quan';
          throw new BadRequestException(
            `Thời gian kết thúc mở đăng ký (${denStr}) không được sau hoặc bằng ngày tổ chức chuyến tham quan (${tripStr} tại "${nhaMayName}"). Chuyến tham quan phải diễn ra sau khi kết thúc đăng ký.`,
          );
        }
      }
    }
  }

  async createSchedule(data: any) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const { chuyen_tham_quan_ids, isSubmit, ...lichData } = data;

      if (lichData.dot_kien_tap_id) {
        const dot = await manager.findOne(DotKienTap, {
          where: { id: lichData.dot_kien_tap_id },
        });
        if (!dot) {
          throw new NotFoundException('Không tìm thấy đợt kiến tập.');
        }
        if (dot.trang_thai === 'Nhap') {
          throw new BadRequestException(
            'Đợt kiến tập đang ở trạng thái Nháp và chưa được Khoa gửi cho CLB để lập lịch.',
          );
        }
        if (['DaKetThuc', 'DaKhoa', 'DaHuy'].includes(dot.trang_thai)) {
          throw new BadRequestException(
            'Không thể lập lịch cho đợt kiến tập đã kết thúc hoặc đã hủy.',
          );
        }

        // Kiểm tra thời gian đăng ký phải nằm trong khoảng thời gian diễn ra đợt kiến tập
        this.validateRegistrationTimeWithCampaign(
          dot,
          lichData.tg_mo_dang_ky_tu,
          lichData.tg_mo_dang_ky_den,
        );
      }

      // Kiểm tra thời gian đăng ký phải kết thúc TRƯỚC ngày tổ chức của tất cả các chuyến tham quan trong lịch
      if (
        chuyen_tham_quan_ids &&
        Array.isArray(chuyen_tham_quan_ids) &&
        chuyen_tham_quan_ids.length > 0 &&
        lichData.tg_mo_dang_ky_den
      ) {
        const selectedTrips = await manager.find(ChuyenThamQuan, {
          where: { id: In(chuyen_tham_quan_ids) },
          relations: { nhaMay: true },
        });
        this.validateRegistrationTimeWithTrips(
          lichData.tg_mo_dang_ky_den,
          selectedTrips,
        );
      }

      if (lichData.tg_mo_dang_ky_tu) {
        const tuDate = new Date(lichData.tg_mo_dang_ky_tu);
        if (typeof lichData.tg_mo_dang_ky_tu === 'string' && !lichData.tg_mo_dang_ky_tu.includes('T')) {
          tuDate.setHours(0, 0, 0, 0);
          lichData.tg_mo_dang_ky_tu = tuDate;
        }
      }
      if (lichData.tg_mo_dang_ky_den) {
        const denDate = new Date(lichData.tg_mo_dang_ky_den);
        if (typeof lichData.tg_mo_dang_ky_den === 'string' && !lichData.tg_mo_dang_ky_den.includes('T')) {
          denDate.setHours(23, 59, 59, 999);
          lichData.tg_mo_dang_ky_den = denDate;
        }
      }

      const newLich = new LichKienTap();
      Object.assign(newLich, lichData);
      newLich.trang_thai = isSubmit ? 'ChoDuyet' : 'Nhap';

      const savedLich = await manager.save(LichKienTap, newLich);

      if (
        chuyen_tham_quan_ids &&
        Array.isArray(chuyen_tham_quan_ids) &&
        chuyen_tham_quan_ids.length > 0
      ) {
        await manager.update(
          ChuyenThamQuan,
          { id: In(chuyen_tham_quan_ids) },
          { lich_kien_tap_id: savedLich.id },
        );
      }

      return savedLich;
    });
  }

  async updateSchedule(id: number, data: any) {
    const lichCheck = await this.lichRepo.findOne({ where: { id } });
    if (!lichCheck) throw new NotFoundException('Không tìm thấy lịch kiến tập');
    if (lichCheck.trang_thai !== 'Nhap')
      throw new BadRequestException(
        'Chỉ có thể cập nhật lịch ở trạng thái Nháp',
      );

    try {
      return await this.dataSource.transaction(
        async (manager: EntityManager) => {
          const { chuyen_tham_quan_ids, ...lichData } = data;
          const lich = await manager.findOne(LichKienTap, { where: { id } });
          if (!lich) throw new NotFoundException('Lịch không tồn tại');

          const targetDotId = lichData.dot_kien_tap_id || lich.dot_kien_tap_id;
          if (targetDotId) {
            const dot = await manager.findOne(DotKienTap, {
              where: { id: targetDotId },
            });
            if (!dot) {
              throw new NotFoundException('Không tìm thấy đợt kiến tập.');
            }
            if (dot.trang_thai === 'Nhap') {
              throw new BadRequestException(
                'Đợt kiến tập đang ở trạng thái Nháp và chưa được Khoa gửi cho CLB để lập lịch.',
              );
            }
            if (['DaKetThuc', 'DaKhoa', 'DaHuy'].includes(dot.trang_thai)) {
              throw new BadRequestException(
                'Không thể lập lịch cho đợt kiến tập đã kết thúc hoặc đã hủy.',
              );
            }

            const tgTu =
              lichData.tg_mo_dang_ky_tu !== undefined
                ? lichData.tg_mo_dang_ky_tu
                : lich.tg_mo_dang_ky_tu;
            const tgDen =
              lichData.tg_mo_dang_ky_den !== undefined
                ? lichData.tg_mo_dang_ky_den
                : lich.tg_mo_dang_ky_den;
            this.validateRegistrationTimeWithCampaign(dot, tgTu, tgDen);
          }

          const effectiveTgDen =
            lichData.tg_mo_dang_ky_den !== undefined
              ? lichData.tg_mo_dang_ky_den
              : lich.tg_mo_dang_ky_den;

          let targetTripIds: number[] = [];
          if (chuyen_tham_quan_ids !== undefined) {
            if (Array.isArray(chuyen_tham_quan_ids)) {
              targetTripIds = chuyen_tham_quan_ids;
            }
          } else {
            const existingTrips = await manager.find(ChuyenThamQuan, {
              where: { lich_kien_tap_id: id },
              select: { id: true },
            });
            targetTripIds = existingTrips.map((t) => t.id);
          }

          if (targetTripIds.length > 0 && effectiveTgDen) {
            const trips = await manager.find(ChuyenThamQuan, {
              where: { id: In(targetTripIds) },
              relations: { nhaMay: true },
            });
            this.validateRegistrationTimeWithTrips(effectiveTgDen, trips);
          }

          if (lichData.tg_mo_dang_ky_tu) {
            const tuDate = new Date(lichData.tg_mo_dang_ky_tu);
            if (typeof lichData.tg_mo_dang_ky_tu === 'string' && !lichData.tg_mo_dang_ky_tu.includes('T')) {
              tuDate.setHours(0, 0, 0, 0);
              lichData.tg_mo_dang_ky_tu = tuDate;
            }
          }
          if (lichData.tg_mo_dang_ky_den) {
            const denDate = new Date(lichData.tg_mo_dang_ky_den);
            if (typeof lichData.tg_mo_dang_ky_den === 'string' && !lichData.tg_mo_dang_ky_den.includes('T')) {
              denDate.setHours(23, 59, 59, 999);
              lichData.tg_mo_dang_ky_den = denDate;
            }
          }

          Object.assign(lich, lichData);
          const savedLich = await manager.save(LichKienTap, lich);

          if (chuyen_tham_quan_ids !== undefined) {
            await manager.update(
              ChuyenThamQuan,
              { lich_kien_tap_id: id },
              { lich_kien_tap_id: null as any },
            );
            if (
              Array.isArray(chuyen_tham_quan_ids) &&
              chuyen_tham_quan_ids.length > 0
            ) {
              await manager.update(
                ChuyenThamQuan,
                { id: In(chuyen_tham_quan_ids) },
                { lich_kien_tap_id: id },
              );
            }
          }
          return savedLich;
        },
      );
    } catch (e) {
      require('fs').appendFileSync('error.log', e.stack + '\n');
      throw e;
    }
  }

  async deleteSchedule(id: number) {
    const lich = await this.lichRepo.findOne({ where: { id } });
    if (!lich) throw new NotFoundException('Không tìm thấy lịch kiến tập');
    if (lich.trang_thai !== 'Nhap')
      throw new BadRequestException('Chỉ có thể xóa lịch ở trạng thái Nháp');

    // Khóa ngoại ở CSDL đã được cài đặt ON DELETE SET NULL, 
    // nên không cần gỡ thủ công ở đây (và tránh lỗi TS2322 Type 'null' is not assignable to type 'number').
    await this.lichRepo.remove(lich);
    return { message: 'Xóa lịch thành công' };
  }

  async submitScheduleForApproval(id: number, userId?: number) {
    const lich = await this.lichRepo.findOne({
      where: { id },
      relations: { dotKienTap: true },
    });
    if (!lich) throw new BadRequestException('Không tìm thấy lịch kiến tập');
    if (lich.trang_thai !== 'Nhap') {
      throw new BadRequestException(
        'Chỉ có thể gửi duyệt các lịch ở trạng thái Nháp',
      );
    }
    lich.trang_thai = 'ChoDuyet';
    await this.lichRepo.save(lich);

    // Cập nhật trạng thái các chuyến tham quan thuộc lịch
    await this.chuyenRepo.update(
      { lich_kien_tap_id: id },
      { trang_thai: 'ChoDuyet' },
    );

    // Gửi thông báo đến Quản lý Khoa
    await this.createNotification({
      tieu_de: 'Lịch kiến tập chờ duyệt',
      noi_dung: `Câu lạc bộ đã gửi yêu cầu duyệt cho lịch kiến tập "${lich.ten_lich}". Vui lòng kiểm tra và phản hồi.`,
      nguoi_gui_id: userId || 1,
      khoa_hoc_id: lich.dotKienTap?.khoa_hoc_id,
      doi_tuong_nhan: 'KHOA',
      loai_thong_bao: 'NhacNho',
    });

    return lich;
  }

  async approveSchedule(id: number, userId?: number) {
    const lich = await this.lichRepo.findOne({
      where: { id },
      relations: { dotKienTap: true },
    });
    if (!lich) throw new BadRequestException('Không tìm thấy lịch kiến tập');
    if (lich.trang_thai !== 'ChoDuyet') {
      throw new BadRequestException('Lịch không ở trạng thái chờ duyệt');
    }

    const totalStudents = await this.dksvRepo.count({
      where: {
        dot_kien_tap_id: lich.dot_kien_tap_id,
        trang_thai: 'DangThucHien',
      },
    });

    if (totalStudents > 0) {
      const assignedStudentsCount = await this.pcGvhdRepo
        .createQueryBuilder('pc')
        .innerJoin('pc.dotKienTapSinhVien', 'dksv')
        .where('dksv.dot_kien_tap_id = :dotId', { dotId: lich.dot_kien_tap_id })
        .andWhere('dksv.trang_thai = :status1', { status1: 'DangThucHien' })
        .andWhere('pc.trang_thai = :status2', { status2: 'DangHoatDong' })
        .getCount();

      if (assignedStudentsCount < totalStudents) {
        throw new BadRequestException(
          `Bạn phải hoàn thành phân công GVHD cho toàn bộ sinh viên trong đợt trước khi duyệt lịch (Còn ${totalStudents - assignedStudentsCount}/${totalStudents} SV chưa được phân công).`,
        );
      }
    }

    lich.trang_thai = 'DaDuyet';
    lich.ly_do_tu_choi = null as any;
    await this.lichRepo.save(lich);

    // Cập nhật trạng thái các chuyến tham quan thuộc lịch
    await this.chuyenRepo.update(
      { lich_kien_tap_id: id },
      { trang_thai: 'DaDuyet' },
    );
    // Đồng bộ trạng thái đợt kiến tập cha
    await this.updateDotKienTapStatus(lich.dot_kien_tap_id);

    // 1. Gửi thông báo đến Duyệt lịch CLB
    try {
      await this.createNotification({
        tieu_de: `[Đã duyệt] Lịch kiến tập đã được phê duyệt`,
        noi_dung: `Khoa đã phê duyệt lịch kiến tập "${lich.ten_lich}" (Đợt: ${lich.dotKienTap?.ten_dot || ''}). Ban chủ nhiệm CLB có thể tiến hành các hoạt động tổ chức tiếp theo.`,
        nguoi_gui_id: userId || 1,
        khoa_hoc_id: lich.dotKienTap?.khoa_hoc_id,
        doi_tuong_nhan: 'CLB',
        loai_thong_bao: 'ThanhCong',
      });
    } catch (err) {
      console.warn('Lỗi gửi thông báo duyệt lịch cho CLB:', err);
    }

    // 2. Gửi thông báo đến Sinh viên & Giảng viên (công bố lịch chính thức)
    try {
      await this.createNotification({
        tieu_de: `[Lịch kiến tập] Công bố lịch kiến tập chính thức: ${lich.ten_lich}`,
        noi_dung: `Lịch kiến tập "${lich.ten_lich}" thuộc đợt "${lich.dotKienTap?.ten_dot || ''}" đã chính thức được phê duyệt. Sinh viên vui lòng theo dõi danh sách các chuyến tham quan và đăng ký tham gia đúng hạn.`,
        nguoi_gui_id: userId || 1,
        khoa_hoc_id: lich.dotKienTap?.khoa_hoc_id,
        doi_tuong_nhan: 'ALL',
        loai_thong_bao: 'ChuyenDi',
      });
    } catch (err) {
      console.warn('Lỗi gửi thông báo công bố lịch kiến tập cho SV/GV:', err);
    }

    return lich;
  }

  async rejectSchedule(id: number, reason: string, userId?: number) {
    const lich = await this.lichRepo.findOne({
      where: { id },
      relations: { dotKienTap: true },
    });
    if (!lich) throw new BadRequestException('Không tìm thấy lịch kiến tập');
    if (lich.trang_thai !== 'ChoDuyet') {
      throw new BadRequestException('Lịch không ở trạng thái chờ duyệt');
    }
    lich.trang_thai = 'TuChoi';
    lich.ly_do_tu_choi = reason || 'Chưa nhập lý do';
    await this.lichRepo.save(lich);

    // Trả trạng thái các chuyến tham quan thuộc lịch về Nháp VÀ gỡ khỏi lịch (để có thể tái sử dụng)
    await this.chuyenRepo.update(
      { lich_kien_tap_id: id },
      { trang_thai: 'Nhap', lich_kien_tap_id: null as any },
    );
    // Đồng bộ trạng thái đợt kiến tập cha
    await this.updateDotKienTapStatus(lich.dot_kien_tap_id);

    // Gửi thông báo đến Duyệt lịch CLB (kèm lý do, KHÔNG gửi SV/GV)
    try {
      await this.createNotification({
        tieu_de: `[Từ chối] Lịch kiến tập không được phê duyệt`,
        noi_dung: `Lịch kiến tập "${lich.ten_lich}" đã bị Khoa từ chối phê duyệt. Lý do: "${reason || 'Chưa nhập lý do'}". Vui lòng điều chỉnh lại lịch trình và gửi duyệt lại.`,
        nguoi_gui_id: userId || 1,
        khoa_hoc_id: lich.dotKienTap?.khoa_hoc_id,
        doi_tuong_nhan: 'CLB',
        loai_thong_bao: 'CanhBao',
      });
    } catch (err) {
      console.warn('Lỗi gửi thông báo từ chối lịch cho CLB:', err);
    }

    return lich;
  }

  // -------------------------------------------------------------
  // Chuyen Tham Quan & Phieu Dang Ky
  // -------------------------------------------------------------
  async getTrips(unassigned?: boolean) {
    const query = this.chuyenRepo
      .createQueryBuilder('chuyen')
      .leftJoinAndSelect('chuyen.nhaMay', 'nhaMay')
      .leftJoinAndSelect('chuyen.lichKienTap', 'lichKienTap')
      .leftJoinAndSelect('lichKienTap.dotKienTap', 'dotKienTap')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(phieu.id)', 'count')
          .from(PhieuDangKy, 'phieu')
          .where('phieu.chuyen_tham_quan_id = chuyen.id')
          .andWhere('phieu.trang_thai IN (:...statuses)', {
            statuses: ['HopLe', 'ChoDuyet', 'DaThamGia', 'HoanThanh'],
          });
      }, 'dang_ky_count');

    if (unassigned) {
      query.where('chuyen.lich_kien_tap_id IS NULL');
    }

    const trips = await query.getRawAndEntities();
    const tripEntities = trips.entities;

    let assignments: PhanCongGiangVienDanDoan[] = [];
    const tripIds = tripEntities.map((t) => t.id);
    if (tripIds.length > 0) {
      assignments = await this.danDoanRepo.find({
        where: { chuyen_tham_quan_id: In(tripIds) },
        relations: { giangVien: true },
      });
    }

    const result = tripEntities.map((ent, idx) => ({
      ...ent,
      dang_ky_count: parseInt(trips.raw[idx].dang_ky_count, 10) || 0,
      giaoVienDanDoan: assignments.filter(
        (a) => a.chuyen_tham_quan_id === ent.id,
      ),
    }));

    return result;
  }

  async getProposals() {
    const proposals = await this.deXuatRepo.find({
      relations: {
        nhaMay: true,
        lichKienTap: true,
        sinhVien: true,
        chuyenThamQuan: true,
      },
      order: { ngay_de_xuat: 'DESC' },
    });

    const tripIds = proposals
      .map((p) => p.chuyen_tham_quan_id)
      .filter((id): id is number => typeof id === 'number' && id > 0);

    let assignments: PhanCongGiangVienDanDoan[] = [];
    if (tripIds.length > 0) {
      assignments = await this.danDoanRepo.find({
        where: { chuyen_tham_quan_id: In(tripIds) },
        relations: { giangVien: true },
      });
    }

    return proposals.map((p) => {
      const tripAssignment = assignments.find(
        (a) => a.chuyen_tham_quan_id === p.chuyen_tham_quan_id,
      );
      const giangVien = tripAssignment?.giangVien || null;

      let mappedStatus = p.trang_thai_duyet;
      if (
        p.trang_thai_duyet === 'DaDuyet' &&
        p.chuyenThamQuan?.trang_thai === 'ChoDuyet'
      ) {
        mappedStatus = 'ChoKhoaDuyet';
      }

      return {
        ...p,
        trang_thai_duyet: mappedStatus,
        ngay_clb_duyet: p.trang_thai_duyet === 'DaDuyet' ? p.ngay_duyet : null,
        giangVien,
        giang_vien_id: giangVien?.id || null,
      };
    });
  }

  async getMatchingTripsForProposal(proposalId: number) {
    if (!proposalId) {
      throw new BadRequestException('Mã đề xuất không hợp lệ');
    }

    const proposal = await this.deXuatRepo.findOne({
      where: { id: proposalId },
      relations: {
        nhaMay: true,
        sinhVien: true,
        chuyenThamQuan: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Không tìm thấy đề xuất chuyến đi');
    }

    // Lấy ngày tham quan định dạng yyyy-mm-dd
    let ngayStr = '';
    if (proposal.ngay_tham_quan_de_xuat) {
      const d = new Date(proposal.ngay_tham_quan_de_xuat);
      if (!isNaN(d.getTime())) {
        ngayStr = d.toISOString().split('T')[0];
      }
    }

    // 1. Tìm các ChuyenThamQuan cùng ngày hoặc cùng nhà máy (ưu tiên cach_to_chuc = 'TuDo')
    const tripQuery = this.chuyenRepo
      .createQueryBuilder('ctq')
      .leftJoinAndSelect('ctq.nhaMay', 'nm')
      .leftJoinAndSelect('ctq.phanCongGiangVienDanDoans', 'pc')
      .leftJoinAndSelect('pc.giangVien', 'gv')
      .where('ctq.cach_to_chuc = :cachToChuc', { cachToChuc: 'TuDo' })
      .andWhere('ctq.trang_thai NOT IN (:...badStatuses)', {
        badStatuses: ['DaHuy', 'DaKetThuc'],
      });

    if (ngayStr) {
      tripQuery.andWhere('CAST(ctq.ngay_tham_quan AS DATE) = :ngay', { ngay: ngayStr });
    }

    if (proposal.nha_may_id) {
      tripQuery.andWhere('ctq.nha_may_id = :nmId', { nmId: proposal.nha_may_id });
    } else if (proposal.ten_nha_may_de_xuat) {
      tripQuery.andWhere(
        'nm.ten_nha_may LIKE :tenNm',
        { tenNm: `%${proposal.ten_nha_may_de_xuat.trim()}%` },
      );
    }

    const matchingTripsRaw = await tripQuery.getMany();

    const tripIds = matchingTripsRaw.map((t) => t.id);
    const assignments = tripIds.length > 0
      ? await this.danDoanRepo.find({
          where: { chuyen_tham_quan_id: In(tripIds) },
          relations: { giangVien: true },
        })
      : [];

    const matchingTrips = await Promise.all(
      matchingTripsRaw.map(async (t) => {
        const studentCount = await this.phieuRepo.count({
          where: { chuyen_tham_quan_id: t.id, trang_thai: 'HopLe' },
        });
        const proposalCount = await this.deXuatRepo.count({
          where: { chuyen_tham_quan_id: t.id },
        });
        const count = Math.max(studentCount, proposalCount);
        const tripAssignments = assignments.filter(
          (a) => a.chuyen_tham_quan_id === t.id,
        );
        return {
          id: t.id,
          ngay_tham_quan: t.ngay_tham_quan,
          gio_bat_dau: t.gio_bat_dau,
          trang_thai: t.trang_thai,
          suc_chua: t.suc_chua,
          so_luong_hien_tai: count,
          nha_may_id: t.nha_may_id,
          ten_nha_may: t.nhaMay?.ten_nha_may || 'Chưa xác định',
          dia_chi_nha_may: t.nhaMay?.dia_chi || '',
          giang_vien_dan_doan: tripAssignments.map((pc) => ({
            id: pc.giangVien?.id,
            ho_ten: pc.giangVien?.ho_ten,
            email: pc.giangVien?.email,
            so_dien_thoai: pc.giangVien?.sdt,
            la_truong_doan: pc.la_truong_doan,
          })),
        };
      }),
    );

    // 2. Tìm các đề xuất tự do KHÁC đang ở trạng thái 'ChoDuyet' có cùng ngày và nhà máy
    const pendingQuery = this.deXuatRepo
      .createQueryBuilder('dx')
      .leftJoinAndSelect('dx.sinhVien', 'sv')
      .leftJoinAndSelect('dx.nhaMay', 'nm')
      .where('dx.id <> :currentId', { currentId: proposalId })
      .andWhere('dx.trang_thai_duyet = :choDuyet', { choDuyet: 'ChoDuyet' });

    if (ngayStr) {
      pendingQuery.andWhere('CAST(dx.ngay_tham_quan_de_xuat AS DATE) = :ngay', { ngay: ngayStr });
    }

    if (proposal.nha_may_id) {
      pendingQuery.andWhere(
        '(dx.nha_may_id = :nmId OR dx.ten_nha_may_de_xuat LIKE :nmTen)',
        {
          nmId: proposal.nha_may_id,
          nmTen: `%${proposal.nhaMay?.ten_nha_may || ''}%`,
        },
      );
    } else if (proposal.ten_nha_may_de_xuat) {
      pendingQuery.andWhere(
        '(dx.ten_nha_may_de_xuat LIKE :nmTen OR nm.ten_nha_may LIKE :nmTen)',
        { nmTen: `%${proposal.ten_nha_may_de_xuat.trim()}%` },
      );
    }

    const otherPendingRaw = await pendingQuery.getMany();

    const otherPendingProposals = otherPendingRaw.map((p) => ({
      id: p.id,
      sinh_vien_id: p.sinh_vien_id,
      ma_sinh_vien: p.sinhVien?.mssv,
      ho_ten: p.sinhVien?.ho_ten,
      lop: p.sinhVien?.ten_lop,
      so_dien_thoai: p.sinhVien?.sdt,
      ngay_tham_quan_de_xuat: p.ngay_tham_quan_de_xuat,
      gio_bat_dau_de_xuat: p.gio_bat_dau_de_xuat,
      nha_may_id: p.nha_may_id,
      ten_nha_may: p.nhaMay?.ten_nha_may || p.ten_nha_may_de_xuat,
      dia_chi: p.dia_chi_de_xuat || p.nhaMay?.dia_chi,
    }));

    return {
      proposal,
      matchingTrips,
      otherPendingProposals,
    };
  }

  /**
   * Tự động cập nhật trạng thái DotKienTap dựa trên trạng thái các LichKienTap con.
   * Quy tắc (theo đặc tả nghiệp vụ — KHÔNG cho phép nhập tay):
   *   Nhap → DangTrienKhai : khi có ≥1 LichKienTap đã chốt danh sách trở đi
   *   DangTrienKhai → DaKetThuc : khi TẤT CẢ lịch con đã kết thúc hoặc đã khóa
   *   DaKetThuc → DaKhoa : khi TẤT CẢ lịch con đều đã khóa điểm
   */
  async updateDotKienTapStatus(dotId: number, manager?: EntityManager) {
    const dotRepo = manager ? manager.getRepository(DotKienTap) : this.dotRepo;
    const lichRepo = manager ? manager.getRepository(LichKienTap) : this.lichRepo;

    const dot = await dotRepo.findOne({ where: { id: dotId } });
    if (!dot || dot.trang_thai === 'DaHuy') return;

    const liches = await lichRepo.find({
      where: { dot_kien_tap_id: dotId },
    });
    if (liches.length === 0) {
      // Chưa có lịch nào → Giữ nguyên trạng thái hiện tại (không tự ý ép về Nhap nếu Khoa đã gửi CLB)
      return;
    }

    const statuses = liches.map((l) => l.trang_thai);

    // Các trạng thái LichKienTap cho thấy đợt đang hoạt động
    const activeStatuses = [
      'ChoDuyet',
      'DaDuyet',
      'MoDangKy',
      'DaChotDanhSach',
      'DangDienRa',
      'DaDienRa',
      'DaKetThuc',
      'DaKhoa',
    ];
    // Các trạng thái LichKienTap cho thấy lịch đã kết thúc
    const finishedStatuses = ['DaKetThuc', 'DaKhoa'];

    let newStatus = dot.trang_thai;

    if (statuses.every((s) => s === 'DaKhoa')) {
      newStatus = 'DaKhoa';
    } else if (statuses.every((s) => finishedStatuses.includes(s))) {
      newStatus = 'DaKetThuc';
    } else if (statuses.some((s) => activeStatuses.includes(s))) {
      newStatus = 'DangTrienKhai';
    } else {
      newStatus = dot.trang_thai;
    }

    if (newStatus !== dot.trang_thai) {
      dot.trang_thai = newStatus;
      await dotRepo.save(dot);
    }
  }

  async checkAndUpdatePenalties(studentId: number): Promise<{
    bannedFromRegistration: boolean;
    demotedPriority: boolean;
    remainingBannedTrips: number;
    remainingDemotedTrips: number;
  }> {
    const blacklistRecords = await this.blacklistRepo.find({
      where: { sinh_vien_id: studentId, con_hieu_luc: true },
    });

    let demotedPriority = false;
    let remainingDemotedTrips = 0;

    for (const record of blacklistRecords) {
      if (record.so_chuyen_con_lai > 0) {
        demotedPriority = true;
        remainingDemotedTrips = Math.max(
          remainingDemotedTrips,
          record.so_chuyen_con_lai,
        );
      }
    }

    return {
      bannedFromRegistration: false,
      demotedPriority,
      remainingBannedTrips: 0,
      remainingDemotedTrips,
    };
  }

  async assignGvhdToTuDoTrips(sinhVienId: number, giangVienId: number) {
    const phieus = await this.phieuRepo.find({
      where: { sinh_vien_id: sinhVienId, trang_thai: 'HopLe' },
      relations: { chuyenThamQuan: true },
    });

    const trips = phieus
      .map((p) => p.chuyenThamQuan)
      .filter((t) => t && t.cach_to_chuc === 'TuDo');

    for (const trip of trips) {
      const exists = await this.danDoanRepo.findOne({
        where: { chuyen_tham_quan_id: trip.id },
      });
      if (!exists) {
        const dd = new PhanCongGiangVienDanDoan();
        dd.chuyen_tham_quan_id = trip.id;
        dd.giang_vien_id = giangVienId;
        dd.la_truong_doan = true;
        await this.danDoanRepo.save(dd);
      }
    }
  }

  async scanAndMarkLatePayments() {
    const now = new Date();
    const lateInvoices = await this.hoaDonRepo
      .createQueryBuilder('hd')
      .leftJoinAndSelect('hd.phieuDangKy', 'phieu')
      .where('hd.trang_thai = :status', { status: 'ChuaDong' })
      .andWhere('hd.han_dong < :now', { now })
      .andWhere('hd.so_tien > 0')
      .andWhere('(phieu.trang_thai IS NULL OR phieu.trang_thai != :daHuy)', {
        daHuy: 'DaHuy',
      })
      .getMany();

    for (const inv of lateInvoices) {
      inv.trang_thai = 'ViPham';
      await this.hoaDonRepo.save(inv);

      if (inv.phieuDangKy) {
        inv.phieuDangKy.trang_thai = 'BiLoai';
        await this.phieuRepo.save(inv.phieuDangKy);

        const black = new DanhSachDen();
        black.sinh_vien_id = inv.phieuDangKy.sinh_vien_id;
        black.ly_do = 'KhongDongPhi';
        black.phieu_dang_ky_id = inv.phieu_dang_ky_id;
        black.ngay_ghi_nhan = new Date();
        black.so_chuyen_bi_cam = 5;
        black.so_chuyen_con_lai = 5;
        await this.blacklistRepo.save(black);
      }
    }

    // Tự động chuẩn hóa các hóa đơn 0đ chưa đóng thành 'DaDongDungHan'
    const zeroInvoices = await this.hoaDonRepo.find({
      where: { so_tien: 0, trang_thai: 'ChuaDong' },
    });
    for (const inv of zeroInvoices) {
      inv.trang_thai = 'DaDongDungHan';
      inv.ngay_dong_thuc_te = inv.ngay_dong_thuc_te || new Date();
      await this.hoaDonRepo.save(inv);
    }

    // Tự động sinh HoaDonLePhi 0đ cho các phiếu hợp lệ của chuyến miễn phí mà chưa có hóa đơn
    const freeRegistrationsWithoutInvoice = await this.phieuRepo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.chuyenThamQuan', 'ctq')
      .leftJoinAndSelect('ctq.nhaMay', 'nm')
      .innerJoinAndSelect('p.sinhVien', 'sv')
      .leftJoin('p.hoaDon', 'hd')
      .where('hd.id IS NULL')
      .andWhere('(ctq.le_phi <= 0 OR ctq.le_phi IS NULL)')
      .andWhere('p.trang_thai IN (:...validStatuses)', {
        validStatuses: ['HopLe', 'DaThamGia', 'HoanThanh'],
      })
      .getMany();

    for (const p of freeRegistrationsWithoutInvoice) {
      const removeAccents = (str: string) => {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D');
      };
      const nhaMayStr = p.chuyenThamQuan?.nhaMay
        ? CompanyMatcher.shortenFactoryName(p.chuyenThamQuan.nhaMay.ten_nha_may, 10)
        : 'NM';
      let ngayStr = '0000';
      if (p.chuyenThamQuan?.ngay_tham_quan) {
        const d = new Date(p.chuyenThamQuan.ngay_tham_quan);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        ngayStr = `${day}${month}`;
      }
      const sttStr = p.id.toString();
      const mssvStr = p.sinhVien?.mssv || '0000000';
      const hoTenStr = p.sinhVien
        ? removeAccents(p.sinhVien.ho_ten).replace(/\s+/g, '').toUpperCase()
        : 'SV';

      const newHd = new HoaDonLePhi();
      newHd.phieu_dang_ky_id = p.id;
      newHd.so_tien = 0;
      newHd.noi_dung_chuyen_khoan = `${nhaMayStr}_${ngayStr}_${sttStr}_${mssvStr}_${hoTenStr}`;
      newHd.han_dong = p.ngay_dang_ky || new Date();
      newHd.ngay_dong_thuc_te = p.ngay_dang_ky || new Date();
      newHd.trang_thai = 'DaDongDungHan';
      await this.hoaDonRepo.save(newHd);
    }
  }

  async createTrip(data: any) {
    try {
      const date = new Date(data.ngay_tham_quan);
      const startStr = data.gio_bat_dau;

      // TypeORM mssql driver (tedious) requires a Date object for TIME columns
      // Bỏ đuôi Z để hệ thống hiểu đây là Local Time, tránh bị lệch +7 tiếng (11h thành 18h)
      const startDate = new Date(
        `1970-01-01T${startStr.length === 5 ? startStr + ':00' : startStr}`,
      );

      // Ghi đè bằng Date object
      data.gio_bat_dau = startDate as any;

      const overlap = await this.chuyenRepo.findOne({
        where: {
          nha_may_id: data.nha_may_id,
          ngay_tham_quan: date,
          gio_bat_dau: startDate as any,
        },
      });
      if (overlap) {
        throw new BadRequestException(
          'Đã tồn tại chuyến tham quan tại nhà máy này trong cùng ngày và khung giờ này',
        );
      }

      const nhaMay = await this.nhaMayRepo.findOne({
        where: { id: data.nha_may_id },
      });
      if (!nhaMay) throw new NotFoundException('Không tìm thấy nhà máy');
      if (nhaMay.trang_thai === 'NgungHopTac') {
        throw new BadRequestException(
          `Nhà máy "${nhaMay.ten_nha_may}" đã ngừng hợp tác, không thể tạo chuyến tham quan mới.`,
        );
      }
      if (data.hinh_thuc === 'TrucTuyen' && !nhaMay.ho_tro_truc_tuyen) {
        throw new BadRequestException(
          'Nhà máy này không hỗ trợ tham quan trực tuyến',
        );
      }
      if (data.hinh_thuc === 'TrucTiep' && !nhaMay.ho_tro_truc_tiep) {
        throw new BadRequestException(
          'Nhà máy này không hỗ trợ tham quan trực tiếp',
        );
      }

      if (data.cach_to_chuc === 'TuDo' && data.suc_chua !== 1) {
        throw new BadRequestException(
          'Mỗi chuyến tự do chỉ phục vụ đúng 1 sinh viên (sức chứa phải bằng 1)',
        );
      }

      return await this.chuyenRepo.save(data);
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(`Chi tiết lỗi 500: ${error.message}`);
    }
  }

  async updateTrip(id: number, data: any, userId?: number) {
    const trip = await this.chuyenRepo.findOne({ where: { id } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');
    if (['DaDienRa', 'DaHuy'].includes(trip.trang_thai)) {
      throw new BadRequestException(
        'Không thể cập nhật chuyến tham quan đã kết thúc hoặc đã hủy',
      );
    }

    const isRequiresApproval = ['MoDangKy', 'DaChotDanhSach', 'DaDuyet'].includes(trip.trang_thai);

    if (
      !isRequiresApproval &&
      data.suc_chua &&
      data.suc_chua < trip.suc_chua &&
      ['MoDangKy', 'DaChotDanhSach'].includes(trip.trang_thai) // This is basically always false now because of !isRequiresApproval
    ) {
      // Logic for reducing capacity immediately is blocked here, but for ChoDuyet we validate later or now
    }
    if (data.suc_chua && data.suc_chua < trip.suc_chua && ['MoDangKy', 'DaChotDanhSach'].includes(trip.trang_thai)) {
      const acceptedCount = await this.phieuRepo.count({
        where: { chuyen_tham_quan_id: id, trang_thai: 'HopLe' },
      });
      if (data.suc_chua < acceptedCount) {
        throw new BadRequestException(
          `Không thể giảm sức chứa xuống ${data.suc_chua} vì đã có ${acceptedCount} sinh viên được duyệt hợp lệ.`,
        );
      }
    }

    try {
      let parsedGioBatDau: Date | null = null;
      let parsedNgayThamQuan = data.ngay_tham_quan ? new Date(data.ngay_tham_quan) : null;

      // Kiểm tra nếu chuyến đang thuộc một lịch kiến tập thì ngày tổ chức mới không được trước hoặc bằng hạn đăng ký của lịch
      if (trip.lich_kien_tap_id && parsedNgayThamQuan) {
        const attachedLich = await this.lichRepo.findOne({
          where: { id: trip.lich_kien_tap_id },
        });
        if (attachedLich && attachedLich.tg_mo_dang_ky_den) {
          const denDate = new Date(attachedLich.tg_mo_dang_ky_den);
          const denDay = new Date(
            denDate.getFullYear(),
            denDate.getMonth(),
            denDate.getDate(),
          );
          const tripDay = new Date(
            parsedNgayThamQuan.getFullYear(),
            parsedNgayThamQuan.getMonth(),
            parsedNgayThamQuan.getDate(),
          );
          if (tripDay <= denDay) {
            const denStr = denDate.toLocaleDateString('vi-VN');
            const tripStr = parsedNgayThamQuan.toLocaleDateString('vi-VN');
            throw new BadRequestException(
              `Ngày tổ chức chuyến tham quan (${tripStr}) không được trước hoặc bằng thời gian kết thúc mở đăng ký (${denStr}) của lịch kiến tập "${attachedLich.ten_lich}".`,
            );
          }
        }
      }

      if (data.gio_bat_dau) {
        const startStr = typeof data.gio_bat_dau === 'string' ? data.gio_bat_dau : null;
        if (startStr) {
          parsedGioBatDau = new Date(
            `1970-01-01T${startStr.length === 5 ? startStr + ':00' : startStr}`,
          );
        }
      }

      // Check overlap ONLY IF modifying the main schedule immediately
      if (!isRequiresApproval && parsedGioBatDau && parsedNgayThamQuan) {
        const overlap = await this.chuyenRepo.findOne({
          where: {
            nha_may_id: data.nha_may_id || trip.nha_may_id,
            ngay_tham_quan: parsedNgayThamQuan,
            gio_bat_dau: parsedGioBatDau as any,
            id: Not(id),
          },
        });

        if (overlap) {
          throw new BadRequestException(
            'Đã tồn tại chuyến tham quan trùng khung giờ',
          );
        }

        // Kiểm tra xem giảng viên dẫn đoàn hiện tại có bị trùng lịch dẫn đoàn ở chuyến khác trong ngày mới không
        const currentLeader = await this.danDoanRepo.findOne({
          where: { chuyen_tham_quan_id: id },
        });
        if (currentLeader) {
          const targetDateStr = parsedNgayThamQuan.toDateString();
          const otherAssignments = await this.danDoanRepo.find({
            where: { giang_vien_id: currentLeader.giang_vien_id },
            relations: { chuyenThamQuan: true },
          });
          const hasConflict = otherAssignments.some(
            (a) =>
              a.chuyen_tham_quan_id !== id &&
              a.chuyenThamQuan &&
              a.chuyenThamQuan.trang_thai !== 'DaHuy' &&
              a.chuyenThamQuan.ngay_tham_quan &&
              new Date(a.chuyenThamQuan.ngay_tham_quan).toDateString() === targetDateStr,
          );
          if (hasConflict) {
            throw new BadRequestException(
              'Không thể đổi ngày vì giảng viên dẫn đoàn của chuyến này đã có lịch dẫn đoàn ở chuyến khác trong ngày được chọn.',
            );
          }
        }
      }

      if (trip.lich_kien_tap_id && data.lich_kien_tap_id !== undefined) {
        delete data.lich_kien_tap_id;
      }

      if (isRequiresApproval) {
        if (data.ngay_tham_quan !== undefined) trip.ngay_tham_quan_moi = parsedNgayThamQuan;
        if (data.gio_bat_dau !== undefined) trip.gio_bat_dau_moi = parsedGioBatDau as any;
        if (data.suc_chua !== undefined) trip.suc_chua_moi = data.suc_chua;
        if (data.han_dong_le_phi !== undefined) trip.han_dong_le_phi_moi = data.han_dong_le_phi ? new Date(data.han_dong_le_phi) : null;

        trip.trang_thai_sua_doi = 'ChoDuyet';

        // Remove from data to prevent Object.assign from overwriting main columns
        delete data.ngay_tham_quan;
        delete data.gio_bat_dau;
        delete data.suc_chua;
        delete data.han_dong_le_phi;
      }

      const oldDate = trip.ngay_tham_quan;
      const oldTime = trip.gio_bat_dau;

      if (data.gio_bat_dau && !isRequiresApproval) data.gio_bat_dau = parsedGioBatDau as any;

      Object.assign(trip, data);
      const savedTrip = await this.chuyenRepo.save(trip);

      // Gửi thông báo đến Quản lý Khoa nếu đây là yêu cầu thay đổi khẩn cấp
      if (isRequiresApproval) {
        try {
          const tripFull = await this.chuyenRepo.findOne({
            where: { id },
            relations: { nhaMay: true },
          });
          const nhaMayName = tripFull?.nhaMay?.ten_nha_may || 'N/A';
          const maChuyen = `CTQ#${id}`;

          await this.createNotification({
            tieu_de: `[Khẩn cấp] Đề xuất sửa đổi chuyến tham quan: ${nhaMayName}`,
            noi_dung: `Ban chủ nhiệm CLB đã gửi yêu cầu thay đổi khẩn cấp cho chuyến tham quan tại ${nhaMayName} (Mã chuyến: ${maChuyen}). Vui lòng xem xét và phê duyệt.`,
            nguoi_gui_id: userId || 1,
            doi_tuong_nhan: 'KHOA',
            loai_thong_bao: 'CanhBao',
          });
        } catch (notifErr) {
          console.warn('Lỗi gửi thông báo yêu cầu sửa chuyến khẩn cấp cho Khoa:', notifErr);
        }
      }

      // Keep TuDo logic if it's not approved yet (meaning it's just Nhap)
      if (trip.cach_to_chuc === 'TuDo' && !isRequiresApproval) {
        const isDateChanged = data.ngay_tham_quan && new Date(oldDate).getTime() !== new Date(savedTrip.ngay_tham_quan).getTime();
        const isTimeChanged = data.gio_bat_dau && oldTime !== savedTrip.gio_bat_dau;

        if (isDateChanged || isTimeChanged) {
          savedTrip.trang_thai = 'Nhap';
          await this.chuyenRepo.save(savedTrip);

          if (savedTrip.lich_kien_tap_id) {
            await this.lichRepo.update(savedTrip.lich_kien_tap_id, { trang_thai: 'ChoDuyet' });
          }
        }
      }

      return savedTrip;
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Chi tiết lỗi: ${error.message}`);
    }
  }

  async approveEmergencyEdit(tripId: number, isApproved: boolean, userId?: number) {
    const trip = await this.chuyenRepo.findOne({
      where: { id: tripId },
      relations: { nhaMay: true },
    });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

    if (trip.trang_thai_sua_doi !== 'ChoDuyet') {
      throw new BadRequestException('Chuyến tham quan không có yêu cầu sửa đổi nào đang chờ duyệt');
    }

    const nhaMayName = trip.nhaMay?.ten_nha_may || 'N/A';

    if (isApproved) {
      // Validate sức chứa mới không nhỏ hơn số lượng phiếu đăng ký hợp lệ hiện có
      if (trip.suc_chua_moi) {
        const countHopLe = await this.phieuRepo.count({
          where: { chuyen_tham_quan_id: tripId, trang_thai: In(['HopLe', 'ChoXacNhan']) },
        });
        if (trip.suc_chua_moi < countHopLe) {
          throw new BadRequestException(
            `Sức chứa mới (${trip.suc_chua_moi}) không được nhỏ hơn số lượng phiếu đăng ký hợp lệ hiện tại (${countHopLe} sinh viên).`,
          );
        }
      }

      // Copy shadow data to main columns
      if (trip.ngay_tham_quan_moi) {
        trip.ngay_tham_quan = trip.ngay_tham_quan_moi;

        // Đồng bộ cập nhật lại hạn nộp báo cáo (ngày tham quan + 10 ngày) cho toàn bộ PhieuThamQuan đã cấp của chuyến
        const targetPhieus = await this.phieuRepo.find({
          where: { chuyen_tham_quan_id: tripId },
        });
        const targetPhieuIds = targetPhieus.map((p) => p.id);
        if (targetPhieuIds.length > 0) {
          const newDeadline = new Date(trip.ngay_tham_quan_moi);
          newDeadline.setDate(newDeadline.getDate() + 10);
          await this.phieuTQRepo
            .createQueryBuilder()
            .update(PhieuThamQuan)
            .set({ han_nop_bao_cao: newDeadline })
            .where('phieu_dang_ky_id IN (:...ids)', { ids: targetPhieuIds })
            .execute();
        }
      }
      if (trip.gio_bat_dau_moi) trip.gio_bat_dau = trip.gio_bat_dau_moi;
      if (trip.suc_chua_moi) trip.suc_chua = trip.suc_chua_moi;
      if (trip.han_dong_le_phi_moi !== undefined) trip.han_dong_le_phi = trip.han_dong_le_phi_moi;

      // 1. Gửi thông báo đến Duyệt lịch CLB
      try {
        await this.createNotification({
          tieu_de: `[Phê duyệt] Thay đổi khẩn cấp chuyến: ${nhaMayName}`,
          noi_dung: `Khoa đã phê duyệt yêu cầu thay đổi lịch trình khẩn cấp cho chuyến tham quan tại ${nhaMayName}. Thông tin mới đã được cập nhật thành công trên hệ thống.`,
          nguoi_gui_id: userId || 1,
          doi_tuong_nhan: 'CLB',
          loai_thong_bao: 'ThanhCong',
        });
      } catch (e) {
        console.warn('Lỗi gửi thông báo duyệt thay đổi khẩn cấp cho CLB:', e);
      }

      // 2. Gửi thông báo đến Sinh viên & Giảng viên (theo yêu cầu 3)
      try {
        const dateStr = trip.ngay_tham_quan ? new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN') : 'N/A';
        await this.createNotification({
          tieu_de: `[Khẩn cấp] Cập nhật lịch trình tham quan: ${nhaMayName}`,
          noi_dung: `Chuyến tham quan tại ${nhaMayName} đã được cập nhật lịch sang ngày ${dateStr} lúc ${trip.gio_bat_dau || ''}. Nếu bạn bị kẹt lịch mới, bạn có quyền Hủy đăng ký tự do mà không bị phạt.`,
          nguoi_gui_id: userId || 1,
          doi_tuong_nhan: 'ALL',
          loai_thong_bao: 'CanhBao',
        });
      } catch (e) {
        console.warn('Lỗi gửi thông báo thay đổi lịch trình cho sinh viên:', e);
      }
    } else {
      // isApproved === false: Từ chối yêu cầu thay đổi
      // 1. Gửi thông báo đến Duyệt lịch CLB (kèm từ chối, KHÔNG gửi SV/GV)
      try {
        await this.createNotification({
          tieu_de: `[Từ chối] Thay đổi khẩn cấp chuyến: ${nhaMayName}`,
          noi_dung: `Khoa đã từ chối yêu cầu thay đổi lịch trình khẩn cấp cho chuyến tham quan tại ${nhaMayName}. Lịch trình ban đầu vẫn được giữ nguyên.`,
          nguoi_gui_id: userId || 1,
          doi_tuong_nhan: 'CLB',
          loai_thong_bao: 'CanhBao',
        });
      } catch (e) {
        console.warn('Lỗi gửi thông báo từ chối thay đổi khẩn cấp cho CLB:', e);
      }
    }

    // Clear shadow columns
    trip.ngay_tham_quan_moi = null;
    trip.gio_bat_dau_moi = null;
    trip.suc_chua_moi = null;
    trip.han_dong_le_phi_moi = null;
    trip.trang_thai_sua_doi = null;

    return await this.chuyenRepo.save(trip);
  }

  async deleteTrip(id: number) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const trip = await manager.findOne(ChuyenThamQuan, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

      if (trip.trang_thai !== 'Nhap') {
        throw new BadRequestException(
          'Chỉ có thể xóa chuyến tham quan ở trạng thái Nháp',
        );
      }

      // Kiểm tra an toàn trước khi xóa: nếu đã có đăng ký thì chặn
      const regCount = await manager.count(PhieuDangKy, {
        where: { chuyen_tham_quan_id: id },
      });
      if (regCount > 0) {
        throw new BadRequestException(
          'Chuyến tham quan đã có phiếu đăng ký liên kết, không thể xóa trực tiếp',
        );
      }

      // Dọn dẹp phân công GVDĐ nếu có trước khi xóa chuyến
      await manager.delete(PhanCongGiangVienDanDoan, { chuyen_tham_quan_id: id });

      return await manager.remove(ChuyenThamQuan, trip);
    });
  }

  /**
   * Hủy chuyến tham quan đã duyệt.
   * Cascade: PhieuDangKy → PhieuThamQuan → PhanCongGVDanDoan → ThongBao
   * KHÔNG phạt sinh viên (khác với SV tự hủy đăng ký sau khi đậu).
   */
  async cancelTrip(tripId: number, lyDoHuy: string) {
    const trip = await this.chuyenRepo.findOne({
      where: { id: tripId },
      relations: { nhaMay: true },
    });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

    const allowedStatuses = ['DaDuyet', 'MoDangKy', 'DaChotDanhSach'];
    if (!allowedStatuses.includes(trip.trang_thai)) {
      throw new BadRequestException(
        `Không thể hủy chuyến ở trạng thái "${trip.trang_thai}". Chỉ cho phép hủy khi chuyến đang ở: ${allowedStatuses.join(', ')}`,
      );
    }

    return this.dataSource.transaction(async (manager: EntityManager) => {
      // Bước 2: Chuyển trạng thái chuyến
      trip.trang_thai = 'DaHuy';
      await manager.save(ChuyenThamQuan, trip);

      // Bước 3: Cascade PhieuDangKy
      const phieus = await manager.find(PhieuDangKy, {
        where: {
          chuyen_tham_quan_id: tripId,
          trang_thai: In(['ChoDuyet', 'HopLe']),
        },
      });

      for (const phieu of phieus) {
        phieu.trang_thai = 'DaHuy';
        await manager.save(PhieuDangKy, phieu);

        // Bước 4: Cascade PhieuThamQuan
        const ptq = await manager.findOne(PhieuThamQuan, {
          where: { phieu_dang_ky_id: phieu.id, trang_thai: 'HopLe' },
        });
        if (ptq) {
          ptq.trang_thai = 'DaHuy';
          // Nếu phiếu này đã nằm trong Bộ 3 chuyến báo cáo, gỡ liên kết để tránh báo cáo chuyến đã hủy
          if (ptq.bo_chuyen_bao_cao_id) {
            ptq.bo_chuyen_bao_cao_id = null as any;
          }
          await manager.save(PhieuThamQuan, ptq);
        }
      }

      // Bước 5: Xóa phân công GV dẫn đoàn
      await manager.delete(PhanCongGiangVienDanDoan, {
        chuyen_tham_quan_id: tripId,
      });

      // Bước 7: Gửi thông báo nội bộ
      const nhaMayName = trip.nhaMay?.ten_nha_may || 'N/A';
      const dateStr = trip.ngay_tham_quan
        ? new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN')
        : 'N/A';

      let senderId = 1;
      const adminAcc = await manager.findOne(TaiKhoan, {
        where: { vaiTro: { ten_vai_tro: 'QuanTriVienHeThong' } },
        relations: { vaiTro: true },
      });
      if (adminAcc) senderId = adminAcc.id;

      const hasLePhi = trip.le_phi > 0;
      const hoPhiNote = hasLePhi
        ? ' Nếu bạn đã đóng lệ phí, vui lòng sử dụng thông tin hóa đơn hiện tại để tạo Đơn Hoàn Phí trên hệ thống.'
        : '';

      const notif = new ThongBao();
      notif.tieu_de = '⚠️ CHUYẾN THAM QUAN BỊ HỦY';
      notif.noi_dung = `Chuyến tham quan tại ${nhaMayName} ngày ${dateStr} đã bị HỦY.\n\nLý do: ${lyDoHuy}\n\nPhiếu đăng ký của bạn đã được chuyển sang trạng thái "Đã hủy". Bạn sẽ KHÔNG bị phạt do đây là sự kiện bất khả kháng.${hoPhiNote}`;
      notif.nguoi_gui_id = senderId;
      notif.ngay_gui = new Date();
      notif.da_chinh_sua = false;
      await manager.save(ThongBao, notif);

      return {
        message: 'Hủy chuyến tham quan thành công',
        tripId,
        cancelledRegistrations: phieus.length,
        nhaMay: nhaMayName,
        ngayThamQuan: dateStr,
      };
    });
  }

  async reopenTripRegistration(id: number) {
    const trip = await this.chuyenRepo.findOne({ where: { id } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

    if (trip.trang_thai !== 'DaChotDanhSach') {
      throw new BadRequestException(
        'Chỉ có thể mở đăng ký bổ sung khi chuyến tham quan ở trạng thái Đã chốt danh sách',
      );
    }

    // Kiểm tra số lượng đã đăng ký
    const countHopLe = await this.phieuRepo.count({
      where: { chuyen_tham_quan_id: id, trang_thai: 'HopLe' },
    });

    if (countHopLe >= trip.suc_chua) {
      throw new BadRequestException(
        'Chuyến tham quan đã đủ số lượng, không thể mở bổ sung',
      );
    }

    trip.trang_thai = 'MoDangKy';
    return await this.chuyenRepo.save(trip);
  }

  // CLB Duyệt Đề Xuất Sơ Bộ (Có hỗ trợ gộp vào chuyến tự do đã có hoặc gom nhiều đề xuất cùng lúc)
  async clbApproveProposeTrip(
    deXuatId: number,
    approverId: number,
    isApproved: boolean,
    giangVienId?: number,
    nhaMayIdGop?: number,
    gopVaoChuyenId?: number,
    gopCacPhieuDeXuatIds?: number[],
  ) {
    try {
      if (!deXuatId) {
        throw new BadRequestException('Mã đề xuất chuyến đi không hợp lệ');
      }

      const dexuat = await this.deXuatRepo.findOne({
        where: { id: deXuatId },
        relations: { nhaMay: true, sinhVien: true },
      });
      if (!dexuat) {
        throw new NotFoundException('Không tìm thấy đề xuất chuyến đi tự do');
      }

      if (dexuat.trang_thai_duyet !== 'ChoDuyet') {
        throw new BadRequestException(
          'Đề xuất này đã được xử lý trước đó, không thể thao tác lại',
        );
      }

      if (!isApproved) {
        dexuat.ngay_duyet = new Date();
        dexuat.trang_thai_duyet = 'TuChoi';
        await this.deXuatRepo.save(dexuat);

        return {
          message: 'Từ chối chuyến đi tự do thành công.',
        };
      }

      // TRƯỜNG HỢP A: Gộp vào chuyến tự do đã có sẵn
      if (gopVaoChuyenId) {
        const existingTrip = await this.chuyenRepo.findOne({
          where: { id: gopVaoChuyenId },
          relations: { nhaMay: true },
        });
        if (!existingTrip) {
          throw new NotFoundException(
            'Không tìm thấy chuyến tham quan được chỉ định để gộp vào',
          );
        }
        if (existingTrip.cach_to_chuc !== 'TuDo') {
          throw new BadRequestException(
            'Chỉ có thể gộp đề xuất tự do vào chuyến tham quan tự do',
          );
        }

        const additionalIds = (gopCacPhieuDeXuatIds || []).filter(
          (id) => id && id !== deXuatId,
        );
        const allIdsToMerge = [deXuatId, ...additionalIds];

        const targetProposals = await this.deXuatRepo.find({
          where: { id: In(allIdsToMerge), trang_thai_duyet: 'ChoDuyet' },
        });

        // Tăng sức chứa của chuyến tham quan theo số lượng đề xuất gộp thêm
        existingTrip.suc_chua =
          (existingTrip.suc_chua || 0) + targetProposals.length;
        await this.chuyenRepo.save(existingTrip);

        // Cập nhật tất cả các phiếu đề xuất được gộp
        for (const p of targetProposals) {
          p.chuyen_tham_quan_id = existingTrip.id;
          p.nha_may_id = existingTrip.nha_may_id;
          p.trang_thai_duyet = 'DaDuyet';
          p.ngay_duyet = new Date();
          await this.deXuatRepo.save(p);
        }

        return {
          message:
            targetProposals.length > 1
              ? `Đã gộp thành công ${targetProposals.length} đề xuất tự do vào chuyến tham quan.`
              : 'Đã gộp thành công đề xuất tự do vào chuyến tham quan.',
        };
      }

      // TRƯỜNG HỢP B: Tạo chuyến mới (có thể gom nhiều đề xuất tự do cùng lúc)
      // Lưu ý: Chuyến tham quan tự do không bắt buộc phân công GVDĐ (sinh viên tự túc)

      // 1. Tìm Đợt Kiến Tập đang triển khai (hoặc đợt mới nhất)
      let activeDot = await this.dotRepo.findOne({
        where: { trang_thai: In(['DangTrienKhai', 'DangDienRa', 'Nhap']) },
        order: { ngay_bat_dau: 'DESC' },
      });
      if (!activeDot) {
        const dots = await this.dotRepo.find({
          where: { trang_thai: Not('DaHuy') },
          order: { id: 'DESC' },
          take: 1,
        });
        activeDot = dots[0] || null;
      }

      if (!activeDot) {
        throw new BadRequestException(
          'Hệ thống chưa có đợt kiến tập nào khả dụng để tiếp nhận chuyến đi tự do',
        );
      }

      let lichId: number | null = null;
      if (activeDot) {
        let lich = await this.lichRepo.findOne({
          where: {
            dot_kien_tap_id: activeDot.id,
            ten_lich: 'Lịch tiếp nhận đề xuất tự do',
          },
        });

        if (!lich) {
          lich = new LichKienTap();
          lich.dot_kien_tap_id = activeDot.id;
          lich.ten_lich = 'Lịch tiếp nhận đề xuất tự do';
          lich.so_luong_du_kien = 9999;
          lich.tg_mo_dang_ky_tu = new Date();

          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3);
          lich.tg_mo_dang_ky_den = endDate;
          lich.trang_thai = 'DaDuyet';
          const savedLich = await this.lichRepo.save(lich);
          lichId = savedLich.id;
        } else {
          if (lich.trang_thai !== 'DaDuyet') {
            lich.trang_thai = 'DaDuyet';
            await this.lichRepo.save(lich);
          }
          lichId = lich.id;
        }
      }

      // 2. Xử lý Nhà Máy
      let finalNhaMayId = nhaMayIdGop || dexuat.nha_may_id;
      if (!finalNhaMayId && dexuat.ten_nha_may_de_xuat) {
        const existingNhaMay = await this.nhaMayRepo
          .createQueryBuilder('nm')
          .where(
            'nm.ten_nha_may COLLATE SQL_Latin1_General_CP1_CI_AI = :ten COLLATE SQL_Latin1_General_CP1_CI_AI',
            { ten: dexuat.ten_nha_may_de_xuat.trim() },
          )
          .andWhere(
            'nm.dia_chi COLLATE SQL_Latin1_General_CP1_CI_AI = :dc COLLATE SQL_Latin1_General_CP1_CI_AI',
            { dc: (dexuat.dia_chi_de_xuat || '').trim() },
          )
          .getOne();

        if (existingNhaMay) {
          finalNhaMayId = existingNhaMay.id;
        } else {
          const activeFactories = await this.nhaMayRepo.find({
            where: { trang_thai: 'HoatDong' },
          });
          const matchResult = CompanyMatcher.findBestMatch(
            dexuat.ten_nha_may_de_xuat,
            dexuat.dia_chi_de_xuat || '',
            activeFactories,
          );

          if (matchResult.bestMatch && matchResult.score >= 75) {
            finalNhaMayId = matchResult.bestMatch.id;
          } else {
            const newNhaMay = new NhaMay();
            newNhaMay.ten_nha_may = CompanyMatcher.toTitleCase(
              dexuat.ten_nha_may_de_xuat,
            );
            newNhaMay.dia_chi = dexuat.dia_chi_de_xuat || '';
            newNhaMay.nguoi_lien_he = dexuat.nguoi_lien_he_de_xuat || '';
            newNhaMay.sdt_lien_he = dexuat.sdt_lien_he_de_xuat || '';
            newNhaMay.ho_tro_truc_tiep = dexuat.hinh_thuc === 'TrucTiep';
            newNhaMay.ho_tro_truc_tuyen = dexuat.hinh_thuc === 'TrucTuyen';
            newNhaMay.trang_thai = 'HoatDong';
            const savedNhaMay = await this.nhaMayRepo.save(newNhaMay);
            finalNhaMayId = savedNhaMay.id;
          }
        }
      }

      if (!finalNhaMayId) {
        throw new BadRequestException(
          'Không xác định được nhà máy cho chuyến đi đề xuất',
        );
      }

      // 3. Gom danh sách đề xuất cần tạo chung chuyến
      const additionalIds = (gopCacPhieuDeXuatIds || []).filter(
        (id) => id && id !== deXuatId,
      );
      const allIds = [deXuatId, ...additionalIds];
      const targetProposals = await this.deXuatRepo.find({
        where: { id: In(allIds), trang_thai_duyet: 'ChoDuyet' },
      });

      const totalStudents =
        targetProposals.length > 0 ? targetProposals.length : 1;

      // 3.5. Kiểm tra trùng lịch giảng viên dẫn đoàn trong cùng ngày
      if (giangVienId && dexuat.ngay_tham_quan_de_xuat) {
        const targetDate = new Date(dexuat.ngay_tham_quan_de_xuat).toDateString();
        const sameDayAssignments = await this.danDoanRepo.find({
          where: { giang_vien_id: giangVienId },
          relations: { chuyenThamQuan: true },
        });
        const isConflict = sameDayAssignments.some(
          (a) =>
            a.chuyenThamQuan &&
            a.chuyenThamQuan.trang_thai !== 'DaHuy' &&
            a.chuyenThamQuan.ngay_tham_quan &&
            new Date(a.chuyenThamQuan.ngay_tham_quan).toDateString() === targetDate,
        );
        if (isConflict) {
          throw new BadRequestException(
            'Giảng viên đã được phân công dẫn đoàn cho một chuyến tham quan khác trong cùng ngày',
          );
        }
      }

      // 4. Tạo Chuyến Tham Quan (Trạng thái: ChoDuyet)
      const trip = new ChuyenThamQuan();
      trip.nha_may_id = finalNhaMayId;
      trip.lich_kien_tap_id = lichId;
      trip.ngay_tham_quan = dexuat.ngay_tham_quan_de_xuat;
      trip.gio_bat_dau = dexuat.gio_bat_dau_de_xuat;
      trip.hinh_thuc = dexuat.hinh_thuc;
      trip.cach_to_chuc = 'TuDo';
      trip.suc_chua = totalStudents;
      trip.trang_thai = 'ChoDuyet';
      trip.le_phi = 0;
      const savedTrip = await this.chuyenRepo.save(trip);

      // 5. Gán Giảng Viên do CLB đề xuất vào bảng PhanCongGiangVienDanDoan (nếu có chọn)
      if (giangVienId) {
        const dd = new PhanCongGiangVienDanDoan();
        dd.chuyen_tham_quan_id = savedTrip.id;
        dd.giang_vien_id = giangVienId;
        dd.la_truong_doan = true;
        await this.danDoanRepo.save(dd);
      }

      // 6. Cập nhật các Phiếu Đề Xuất
      for (const p of targetProposals) {
        p.chuyen_tham_quan_id = savedTrip.id;
        p.nha_may_id = finalNhaMayId;
        p.trang_thai_duyet = 'DaDuyet';
        p.ngay_duyet = new Date();
        await this.deXuatRepo.save(p);
      }

      return {
        message:
          targetProposals.length > 1
            ? `CLB đã duyệt gom ${targetProposals.length} đề xuất vào chuyến mới và chuyển đến Quản lý Khoa phê duyệt.`
            : 'CLB đã duyệt sơ bộ đề xuất và chuyển đến Quản lý Khoa phê duyệt.',
      };
    } catch (error) {
      console.error('Lỗi khi CLB duyệt chuyến đi:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Không thể phê duyệt chuyến tham quan do lỗi xử lý dữ liệu hệ thống. Vui lòng thử lại.',
      );
    }
  }

  // Khoa Phê Duyệt Chính Thức Chuyến Đi Tự Do (Khoa duyệt cả chuyến và tự động cấp phiếu cho mọi đề xuất được gộp)
  async khoaApproveProposeTrip(
    deXuatId: number,
    approverId: number,
    isApproved: boolean,
  ) {
    try {
      if (!deXuatId) {
        throw new BadRequestException('Mã đề xuất chuyến đi không hợp lệ');
      }

      const dexuat = await this.deXuatRepo.findOne({
        where: { id: deXuatId },
        relations: { chuyenThamQuan: true },
      });
      if (!dexuat) {
        throw new NotFoundException('Không tìm thấy đề xuất chuyến đi tự do');
      }

      if (
        dexuat.trang_thai_duyet !== 'DaDuyet' ||
        !dexuat.chuyenThamQuan ||
        dexuat.chuyenThamQuan.trang_thai !== 'ChoDuyet'
      ) {
        throw new BadRequestException(
          'Đề xuất này không ở trạng thái Chờ Khoa duyệt hoặc đã được xử lý trước đó',
        );
      }

      const tripId = dexuat.chuyen_tham_quan_id;

      if (isApproved) {
        // 1. Kiểm tra phân công giảng viên từ bước CLB đề cử (chuyến tự do không bắt buộc GVDĐ)
        const currentAssignment = await this.danDoanRepo.findOne({
          where: { chuyen_tham_quan_id: tripId },
        });

        // 2. Kích hoạt Chuyến Tham Quan
        const trip = dexuat.chuyenThamQuan;
        trip.trang_thai = 'DaChotDanhSach';
        await this.chuyenRepo.save(trip);

        // 3. Tìm TẤT CẢ các phiếu đề xuất liên kết với chuyến này để cấp phiếu đăng ký & phiếu tham quan
        const allProposals = await this.deXuatRepo.find({
          where: { chuyen_tham_quan_id: tripId },
          relations: { sinhVien: true },
        });

        for (const p of allProposals) {
          // Phiếu Đăng Ký
          let phieu = await this.phieuRepo.findOne({
            where: {
              sinh_vien_id: p.sinh_vien_id,
              chuyen_tham_quan_id: tripId,
            },
          });
          if (!phieu) {
            phieu = new PhieuDangKy();
            phieu.sinh_vien_id = p.sinh_vien_id;
            phieu.chuyen_tham_quan_id = tripId;
            phieu.trang_thai = 'HopLe';
            phieu = await this.phieuRepo.save(phieu);
          } else {
            phieu.trang_thai = 'HopLe';
            await this.phieuRepo.save(phieu);
          }

          // Hóa đơn 0đ (Tự động cập nhật Đã đóng đúng hạn ngay khi lập phiếu)
          let hd = await this.hoaDonRepo.findOne({
            where: { phieu_dang_ky_id: phieu.id },
          });
          if (!hd) {
            hd = new HoaDonLePhi();
            hd.phieu_dang_ky_id = phieu.id;
            hd.so_tien = 0;
            hd.trang_thai = 'DaDongDungHan';
            hd.ngay_dong_thuc_te = new Date();
            hd.han_dong = new Date();

            const removeAccents = (str: string) => {
              return str
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D');
            };
            const nm = await this.nhaMayRepo.findOne({ where: { id: trip.nha_may_id } });
            const nhaMayStr = nm ? CompanyMatcher.shortenFactoryName(nm.ten_nha_may, 10) : 'TUDO';
            const sv = p.sinhVien;
            const mssvStr = sv?.mssv || '0000000';
            const hoTenStr = sv
              ? removeAccents(sv.ho_ten).replace(/\s+/g, '').toUpperCase()
              : 'SV';
            hd.noi_dung_chuyen_khoan = `${nhaMayStr}_0000_${p.id}_${mssvStr}_${hoTenStr}`;
            await this.hoaDonRepo.save(hd);
          } else {
            hd.so_tien = 0;
            hd.trang_thai = 'DaDongDungHan';
            hd.ngay_dong_thuc_te = hd.ngay_dong_thuc_te || new Date();
            await this.hoaDonRepo.save(hd);
          }

          // Phiếu Tham Quan
          let ptq = await this.phieuTQRepo.findOne({
            where: { phieu_dang_ky_id: phieu.id },
          });
          if (!ptq) {
            ptq = new PhieuThamQuan();
            ptq.phieu_dang_ky_id = phieu.id;
            ptq.trang_thai = 'HopLe';
            await this.phieuTQRepo.save(ptq);
          } else {
            ptq.trang_thai = 'HopLe';
            await this.phieuTQRepo.save(ptq);
          }
        }

        return {
          message:
            allProposals.length > 1
              ? `Khoa đã phê duyệt chính thức chuyến tham quan tự do và cấp phiếu tham quan cho ${allProposals.length} sinh viên thành công.`
              : 'Khoa đã phê duyệt chính thức chuyến tham quan tự do và cấp phiếu tham quan cho sinh viên thành công.',
        };
      } else {
        // Khoa từ chối:
        // 1. Xóa phân công giảng viên
        await this.danDoanRepo.delete({ chuyen_tham_quan_id: tripId });

        // 2. Xóa phiếu đăng ký & phiếu tham quan nếu có
        const phieus = await this.phieuRepo.find({
          where: { chuyen_tham_quan_id: tripId },
        });
        if (phieus.length > 0) {
          const phieuIds = phieus.map((p) => p.id);
          await this.phieuTQRepo.delete({ phieu_dang_ky_id: In(phieuIds) });
          await this.phieuRepo.delete({ chuyen_tham_quan_id: tripId });
        }

        // 3. Cập nhật TẤT CẢ các phiếu đề xuất liên quan về TuChoi & gỡ chuyến
        await this.deXuatRepo.update(
          { chuyen_tham_quan_id: tripId },
          {
            chuyen_tham_quan_id: null as any,
            trang_thai_duyet: 'TuChoi',
            ngay_duyet: new Date(),
          },
        );

        // 4. Xóa chuyến đi nháp
        await this.chuyenRepo.delete(tripId);

        return {
          message: 'Khoa đã từ chối chuyến tham quan tự do thành công.',
        };
      }
    } catch (error: any) {
      console.error(
        `Lỗi khi Khoa ${isApproved ? 'duyệt' : 'từ chối'} chuyến đi:`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const actionText = isApproved ? 'phê duyệt' : 'từ chối';
      throw new BadRequestException(
        error?.message ||
          `Không thể ${actionText} chuyến tham quan do lỗi xử lý dữ liệu hệ thống. Vui lòng thử lại.`,
      );
    }
  }

  // Wrapper tương thích ngược
  async approveProposeTrip(
    deXuatId: number,
    approverId: number,
    isApproved: boolean,
    giangVienId?: number,
    nhaMayIdGop?: number,
    gopVaoChuyenId?: number,
    gopCacPhieuDeXuatIds?: number[],
  ) {
    return this.clbApproveProposeTrip(
      deXuatId,
      approverId,
      isApproved,
      giangVienId,
      nhaMayIdGop,
      gopVaoChuyenId,
      gopCacPhieuDeXuatIds,
    );
  }

  // Duyet thanh toan dang ky cua Sinh Vien
  async approveRegistrationPayment(
    registrationId: number,
    isApproved: boolean,
  ) {
    const phieu = await this.phieuRepo.findOne({
      where: { id: registrationId },
      relations: { hoaDon: true },
    });
    if (!phieu) {
      throw new NotFoundException('Không tìm thấy phiếu đăng ký');
    }

    if (isApproved) {
      phieu.trang_thai = 'HopLe';
      if (phieu.hoaDon) {
        phieu.hoaDon.trang_thai = 'DaDongDungHan';
        phieu.hoaDon.ngay_dong_thuc_te = new Date();
        await this.hoaDonRepo.save(phieu.hoaDon);
      }

      let ptq = await this.phieuTQRepo.findOne({
        where: { phieu_dang_ky_id: phieu.id },
      });
      if (!ptq) {
        ptq = new PhieuThamQuan();
        ptq.phieu_dang_ky_id = phieu.id;
        ptq.trang_thai = 'HopLe';
        await this.phieuTQRepo.save(ptq);
      }
    } else {
      phieu.trang_thai = 'BiLoai';
      if (phieu.hoaDon) {
        phieu.hoaDon.trang_thai = 'ChuaDong';
        phieu.hoaDon.ngay_dong_thuc_te = null;
        await this.hoaDonRepo.save(phieu.hoaDon);
      }
    }
    await this.phieuRepo.save(phieu);
    return { message: 'Cập nhật trạng thái thanh toán thành công' };
  }

  // Duyet yeu cau huy dang ky cua Sinh Vien (Transaction)
  async approveCancelRequest(
    requestId: number,
    approverId: number,
    isApproved: boolean,
  ) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const req = await manager.findOne(YeuCauHuyDangKy, {
        where: { id: requestId },
        relations: { phieuDangKy: { chuyenThamQuan: true } },
      });
      if (!req) throw new NotFoundException('Không tìm thấy yêu cầu hủy');

      req.ngay_duyet = new Date();
      req.trang_thai_duyet = isApproved ? 'DaDuyet' : 'TuChoi';
      await manager.save(YeuCauHuyDangKy, req);

      const previousStatus = req.phieuDangKy.trang_thai;
      if (isApproved) {
        req.phieuDangKy.trang_thai = 'DaHuy';
        await manager.save(PhieuDangKy, req.phieuDangKy);

        // Neu day la chuyen tham quan tu do thi huy luon chuyen di
        if (req.phieuDangKy.chuyenThamQuan?.cach_to_chuc === 'TuDo') {
          req.phieuDangKy.chuyenThamQuan.trang_thai = 'DaHuy';
          await manager.save(ChuyenThamQuan, req.phieuDangKy.chuyenThamQuan);
        }

        // (BUG-02 FIX): Khoa đã phê duyệt → lý do hợp lệ → KHÔNG phạt.
        // Hủy PhieuThamQuan nếu đã được cấp (tránh SV dùng phiếu cũ báo cáo)
        if (previousStatus === 'HopLe') {
          const ptq = await manager.findOne(PhieuThamQuan, {
            where: { phieu_dang_ky_id: req.phieu_dang_ky_id, trang_thai: 'HopLe' },
          });
          if (ptq) {
            ptq.trang_thai = 'DaHuy';
            if (ptq.bo_chuyen_bao_cao_id) ptq.bo_chuyen_bao_cao_id = null as any;
            await manager.save(PhieuThamQuan, ptq);
          }
        }

        // MIỄN TRỪ ÁN PHẠT THEO QUY ĐỊNH:
        // Gỡ bỏ toàn bộ ghi nhận vi phạm trong DanhSachDen liên quan đến phiếu đăng ký này
        await manager.delete(DanhSachDen, {
          phieu_dang_ky_id: req.phieu_dang_ky_id,
        });

        // Dọn dẹp hóa đơn lệ phí chưa thanh toán (ChuaDong, ViPham) để tránh bị phạt trễ hạn sau khi đã được duyệt hủy
        await manager.delete(HoaDonLePhi, {
          phieu_dang_ky_id: req.phieu_dang_ky_id,
          trang_thai: In(['ChuaDong', 'ViPham']),
        });
      }

      return { message: 'Xử lý yêu cầu hủy thành công' };
    });
  }

  // -------------------------------------------------------------
  // Phieu Dang Ky & Lọc Danh Sach Tu Dong (3 Tầng ưu tiên + Trùng Lịch / Quá Số Lượng)
  // -------------------------------------------------------------
  async previewAssignStudents(tripId: number) {
    const trip = await this.chuyenRepo.findOne({
      where: { id: tripId },
      relations: { lichKienTap: { dotKienTap: { hocKy: { namHoc: true } } } },
    });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến đi');

    await this.scanAndMarkLatePayments();

    const phieus = await this.phieuRepo.find({
      where: {
        chuyen_tham_quan_id: tripId,
        trang_thai: In(['ChoDuyet', 'HopLe', 'BiLoai']),
      },
      relations: { sinhVien: { khoaHoc: true } },
    });

    if (phieus.length === 0) return { message: 'Không có đăng ký nào cần lọc' };

    // Tách 2 tập: Các phiếu đã HopLe từ đợt trước và các phiếu cần xét duyệt (ChoDuyet hoặc BiLoai)
    const alreadyHopLePhieus = phieus.filter((p) => p.trang_thai === 'HopLe');
    const pendingPhieus = phieus.filter((p) =>
      ['ChoDuyet', 'BiLoai'].includes(p.trang_thai),
    );

    // Bảo lưu 100% sinh viên đã HopLe từ đợt trước vào danh sách chấp nhận
    const suggestedAccepted: PhieuDangKy[] = [...alreadyHopLePhieus];
    const suggestedRejected: PhieuDangKy[] = [];

    // Nếu không có sinh viên nào chờ duyệt (ChoDuyet), trả về luôn danh sách HopLe hiện có
    if (pendingPhieus.length === 0) {
      return {
        suggestedAccepted,
        suggestedRejected: [],
        tripCapacity: trip.suc_chua,
      };
    }

    // Số suất trống còn lại cho các phiếu ChoDuyet xét tuyển bổ sung
    const remainingCapacity = Math.max(
      0,
      trip.suc_chua - alreadyHopLePhieus.length,
    );

    const startYearStr =
      trip.lichKienTap.dotKienTap.hocKy.namHoc.ten_nam_hoc.split('-')[0];
    const startYear = parseInt(startYearStr, 10);

    const eligibleStats: {
      phieu: PhieuDangKy;
      penalties: any;
      finishedCount: number;
      isSeniorOrOlder: boolean;
      isCurrentDotCohort: boolean;
    }[] = [];

    const autoRejected: PhieuDangKy[] = [];

    for (const p of pendingPhieus) {
      const penalties = await this.checkAndUpdatePenalties(p.sinh_vien_id);

      if (penalties.bannedFromRegistration) {
        p.trang_thai = 'BiLoai';
        (p as any).ly_do_loai = 'Vi phạm: Nằm trong danh sách đen';
        autoRejected.push(p);
        continue;
      }

      const studyYear = startYear - p.sinhVien.khoaHoc.nam_nhap_hoc + 1;
      if (studyYear < 2) {
        p.trang_thai = 'BiLoai';
        (p as any).ly_do_loai = 'Năm 1 chưa được phép đi kiến tập';
        autoRejected.push(p);
        continue;
      }

      const finishedCountResult = await this.phieuRepo
        .createQueryBuilder('phieu')
        .leftJoin('phieu.chuyenThamQuan', 'chuyen')
        .where('phieu.sinh_vien_id = :svId', { svId: p.sinh_vien_id })
        .andWhere('phieu.trang_thai IN (:...statuses)', { statuses: ['HopLe'] })
        .select('COUNT(DISTINCT chuyen.nha_may_id)', 'count')
        .getRawOne();
      const finishedCount = parseInt(finishedCountResult.count, 10) || 0;
      if (finishedCount >= 3) {
        p.trang_thai = 'BiLoai';
        (p as any).ly_do_loai = 'Đã hoàn thành 3 chuyến kiến tập';
        autoRejected.push(p);
        continue;
      }

      const sameDayRegistered = await this.phieuRepo.find({
        where: {
          sinh_vien_id: p.sinh_vien_id,
          trang_thai: In(['HopLe']),
        },
        relations: { chuyenThamQuan: true },
      });
      const overlap = sameDayRegistered.some(
        (reg) =>
          reg.chuyen_tham_quan_id !== tripId &&
          new Date(reg.chuyenThamQuan.ngay_tham_quan).toDateString() ===
          new Date(trip.ngay_tham_quan).toDateString(),
      );
      if (overlap) {
        p.trang_thai = 'BiLoai';
        (p as any).ly_do_loai = 'Trùng lịch với chuyến đã được duyệt';
        autoRejected.push(p);
        continue;
      }

      const namNhapHoc = p.sinhVien.khoaHoc.nam_nhap_hoc;
      const dotKhoaHocNam =
        trip.lichKienTap?.dotKienTap?.khoaHoc?.nam_nhap_hoc;
      // Sinh viên năm cuối hoặc khóa cũ hơn đợt kiến tập hiện tại
      const isSeniorOrOlder =
        studyYear >= 4 ||
        (dotKhoaHocNam ? namNhapHoc < dotKhoaHocNam : false);
      // Sinh viên thuộc chính khóa của đợt kiến tập
      const isCurrentDotCohort = dotKhoaHocNam
        ? namNhapHoc === dotKhoaHocNam
        : studyYear === 3;

      eligibleStats.push({
        phieu: p,
        penalties,
        finishedCount,
        isSeniorOrOlder,
        isCurrentDotCohort,
      });
    }

    // Phân 6 tầng ưu tiên theo Mục 4 Tài liệu đặc tả:
    // 1. Năm cuối/Khóa cũ + Chưa từng tham quan
    const group1 = eligibleStats.filter(
      (e) =>
        e.isSeniorOrOlder &&
        e.finishedCount === 0 &&
        !e.penalties.demotedPriority,
    );
    // 2. Năm cuối/Khóa cũ (Đã từng đi)
    const group2 = eligibleStats.filter(
      (e) =>
        e.isSeniorOrOlder &&
        e.finishedCount > 0 &&
        !e.penalties.demotedPriority,
    );
    // 3. Đúng khóa của đợt + Chưa từng tham quan
    const group3 = eligibleStats.filter(
      (e) =>
        e.isCurrentDotCohort &&
        e.finishedCount === 0 &&
        !e.penalties.demotedPriority,
    );
    // 4. Đúng khóa của đợt (Đã từng đi)
    const group4 = eligibleStats.filter(
      (e) =>
        e.isCurrentDotCohort &&
        e.finishedCount > 0 &&
        !e.penalties.demotedPriority,
    );
    // 5. Khóa khác (không thuộc đợt, không phải năm cuối)
    const group5 = eligibleStats.filter(
      (e) =>
        !e.isSeniorOrOlder &&
        !e.isCurrentDotCohort &&
        !e.penalties.demotedPriority,
    );
    // 6. Sinh viên trong danh sách đen (bị phạt)
    const group6 = eligibleStats.filter((e) => e.penalties.demotedPriority);

    const sortFn = (a: any, b: any) =>
      new Date(a.phieu.ngay_dang_ky).getTime() -
      new Date(b.phieu.ngay_dang_ky).getTime();

    group1.sort(sortFn);
    group2.sort(sortFn);
    group3.sort(sortFn);
    group4.sort(sortFn);
    group5.sort(sortFn);
    group6.sort(sortFn);
    const sortedList = [
      ...group1,
      ...group2,
      ...group3,
      ...group4,
      ...group5,
      ...group6,
    ];

    let count = 0;
    for (const item of sortedList) {
      if (count < remainingCapacity) {
        suggestedAccepted.push(item.phieu);
        count++;
      } else {
        (item.phieu as any).ly_do_loai =
          alreadyHopLePhieus.length > 0
            ? 'Vượt quá sức chứa chuyến đi (Đợt bổ sung)'
            : 'Vượt quá sức chứa chuyến đi';
        suggestedRejected.push(item.phieu);
      }
    }

    return {
      suggestedAccepted,
      suggestedRejected: [...suggestedRejected, ...autoRejected],
      tripCapacity: trip.suc_chua,
    };
  }

  async confirmAssignStudents(
    tripId: number,
    acceptedStudentIds: number[],
    deadlineDate?: string,
  ) {
    const trip = await this.chuyenRepo.findOne({
      where: { id: tripId },
      relations: { nhaMay: true, lichKienTap: { taiKhoanThuHuong: true } },
    });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến đi');

    if (['DaDienRa', 'DaHuy'].includes(trip.trang_thai)) {
      throw new BadRequestException(
        'Không thể chốt danh sách cho chuyến tham quan đã diễn ra hoặc đã bị hủy!',
      );
    }

    // 0. Kiểm tra xem Lịch kiến tập đã được gắn tài khoản thụ hưởng chưa
    if (!trip.lichKienTap || !trip.lichKienTap.tai_khoan_thu_huong_id) {
      throw new BadRequestException(
        'Vui lòng cấu hình tài khoản thanh toán VietQR cho Lịch kiến tập này trước khi chốt danh sách!',
      );
    }
    const activeConfig = trip.lichKienTap.taiKhoanThuHuong;

    const phieus = await this.phieuRepo.find({
      where: {
        chuyen_tham_quan_id: tripId,
        trang_thai: In(['ChoDuyet', 'HopLe', 'BiLoai']),
      },
      relations: { sinhVien: true },
    });

    // 1. Tính toán hạn nộp lệ phí an toàn (bắt buộc phải ở tương lai để không bị tự động phạt)
    const now = new Date();
    let safeDeadline = new Date();
    if (
      deadlineDate &&
      !isNaN(new Date(deadlineDate).getTime()) &&
      new Date(deadlineDate) > now
    ) {
      safeDeadline = new Date(deadlineDate);
    } else if (trip.han_dong_le_phi && new Date(trip.han_dong_le_phi) > now) {
      safeDeadline = new Date(trip.han_dong_le_phi);
    } else {
      safeDeadline.setDate(safeDeadline.getDate() + 3);
      safeDeadline.setHours(23, 59, 59, 999);
    }

    const acceptedIdsSet = new Set(acceptedStudentIds.map((id) => Number(id)));

    const result = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        let count = 0;
        for (const phieu of phieus) {
          if (acceptedIdsSet.has(Number(phieu.sinh_vien_id))) {
            phieu.trang_thai = 'HopLe';
            await manager.save(PhieuDangKy, phieu);

            // Tự động gỡ sinh viên khỏi DanhSachDen nếu từng bị ghi nhận phạt quá hạn của phiếu này
            await manager.delete(DanhSachDen, {
              sinh_vien_id: phieu.sinh_vien_id,
              phieu_dang_ky_id: phieu.id,
              ly_do: 'KhongDongPhi',
            });

            const isFreeTrip = (trip.le_phi || 0) <= 0;

            if (isFreeTrip) {
              // Chuyến miễn phí (0đ): Tự động tạo/cập nhật HoaDonLePhi 0đ là 'DaDongDungHan' và cấp ngay PhieuThamQuan
              let existingInvoice = await manager.findOne(HoaDonLePhi, {
                where: { phieu_dang_ky_id: phieu.id },
              });
              if (!existingInvoice) {
                existingInvoice = new HoaDonLePhi();
                existingInvoice.phieu_dang_ky_id = phieu.id;
                existingInvoice.so_tien = 0;
                const removeAccents = (str: string) => {
                  return str
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd')
                    .replace(/Đ/g, 'D');
                };
                const nhaMayStr = trip.nhaMay
                  ? CompanyMatcher.shortenFactoryName(trip.nhaMay.ten_nha_may, 10)
                  : 'NM';
                let ngayStr = '0000';
                if (trip.ngay_tham_quan) {
                  const d = new Date(trip.ngay_tham_quan);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  ngayStr = `${day}${month}`;
                }
                const sttStr = (count + 1).toString();
                const mssvStr = phieu.sinhVien?.mssv || '0000000';
                const hoTenStr = phieu.sinhVien
                  ? removeAccents(phieu.sinhVien.ho_ten).replace(/\s+/g, '').toUpperCase()
                  : 'SV';
                existingInvoice.noi_dung_chuyen_khoan = `${nhaMayStr}_${ngayStr}_${sttStr}_${mssvStr}_${hoTenStr}`;
                existingInvoice.han_dong = new Date();
              }
              existingInvoice.so_tien = 0;
              existingInvoice.trang_thai = 'DaDongDungHan';
              existingInvoice.ngay_dong_thuc_te = existingInvoice.ngay_dong_thuc_te || new Date();
              await manager.save(HoaDonLePhi, existingInvoice);

              let ptq = await manager.findOne(PhieuThamQuan, {
                where: { phieu_dang_ky_id: phieu.id },
              });
              if (!ptq) {
                ptq = new PhieuThamQuan();
                ptq.phieu_dang_ky_id = phieu.id;
                ptq.trang_thai = 'HopLe';
                await manager.save(PhieuThamQuan, ptq);
              }
            } else {
              // Phát hành HoaDonLePhi cho sinh viên được duyệt HopLe
              const existingInvoice = await manager.findOne(HoaDonLePhi, {
                where: { phieu_dang_ky_id: phieu.id },
              });
              if (!existingInvoice) {
                const hoaDon = new HoaDonLePhi();
                hoaDon.phieu_dang_ky_id = phieu.id;
                hoaDon.so_tien = trip.le_phi || 0;

                // Generate formatted string
                const removeAccents = (str: string) => {
                  return str
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd')
                    .replace(/Đ/g, 'D');
                };

                const nhaMayStr = trip.nhaMay
                  ? CompanyMatcher.shortenFactoryName(trip.nhaMay.ten_nha_may, 10)
                  : 'NM';
                let ngayStr = '0000';
                if (trip.ngay_tham_quan) {
                  const d = new Date(trip.ngay_tham_quan);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  ngayStr = `${day}${month}`;
                }
                const sttStr = (count + 1).toString();
                const mssvStr = phieu.sinhVien.mssv || '0000000';
                const hoTenStr = removeAccents(phieu.sinhVien.ho_ten)
                  .replace(/\s+/g, '')
                  .toUpperCase();

                hoaDon.noi_dung_chuyen_khoan = `${nhaMayStr}_${ngayStr}_${sttStr}_${mssvStr}_${hoTenStr}`;

                hoaDon.han_dong = safeDeadline;
                hoaDon.trang_thai = 'ChuaDong';
                await manager.save(HoaDonLePhi, hoaDon);
              } else {
                // Đã có hóa đơn: cập nhật lại hạn nộp mới và chuyển trạng thái về ChuaDong
                existingInvoice.han_dong = safeDeadline;
                existingInvoice.trang_thai = 'ChuaDong';
                await manager.save(HoaDonLePhi, existingInvoice);
              }
            }
            count++;
          } else {
            phieu.trang_thai = 'BiLoai';
            await manager.save(PhieuDangKy, phieu);
          }
        }

        trip.trang_thai = 'DaChotDanhSach';
        trip.han_dong_le_phi = safeDeadline;
        await manager.save(ChuyenThamQuan, trip);

        return {
          message:
            'Đã hoàn tất lọc danh sách tự động theo thứ tự ưu tiên và phát hành hóa đơn lệ phí',
          accepted: count,
          rejected: phieus.length - count,
          dotKienTapId: trip.lich_kien_tap_id
            ? (
              await manager.findOne(LichKienTap, {
                where: { id: trip.lich_kien_tap_id },
              })
            )?.dot_kien_tap_id
            : null,
        };
      },
    );

    // Đồng bộ trạng thái đợt kiến tập cha sau khi chốt danh sách chuyến
    if (result.dotKienTapId) {
      await this.updateDotKienTapStatus(result.dotKienTapId);

      // (BUG-08 FIX) Trừ 1 lượt phạt cho những SV có đăng ký chuyến này ở Ưu tiên 6 (dù HopLe hay BiLoai do hết chỗ)
      try {
        const registeredStudentIds = phieus.map((p) => p.sinh_vien_id);
        if (registeredStudentIds.length > 0) {
          const activeBlacklists = await this.blacklistRepo.find({
            where: { sinh_vien_id: In(registeredStudentIds), con_hieu_luc: true },
          });
          for (const bl of activeBlacklists) {
            if (bl.so_chuyen_con_lai > 0) {
              await this.blacklistRepo.update(bl.id, {
                so_chuyen_con_lai: bl.so_chuyen_con_lai - 1,
              });
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khi trừ án phạt blacklist tự động:', err);
      }
    }
    return result;
  }

  // -------------------------------------------------------------
  // Phan Cong GVHD & GVDD
  // -------------------------------------------------------------
  async assignLecturerGuide(
    dotKienTapSinhVienId: number,
    lecturerId: number,
    checkLimit: boolean = true,
  ) {
    const dksv = await this.dksvRepo.findOne({
      where: { id: dotKienTapSinhVienId },
      relations: { dotKienTap: true },
    });
    if (!dksv)
      throw new NotFoundException('Không tìm thấy đăng ký đợt kiến tập');

    if (dksv.trang_thai !== 'DangThucHien') {
      throw new BadRequestException(
        'Sinh viên không trong trạng thái đang thực hiện kiến tập',
      );
    }

    if (
      dksv.dotKienTap &&
      (dksv.dotKienTap.trang_thai === 'DaKetThuc' ||
        dksv.dotKienTap.trang_thai === 'DaKhoa')
    ) {
      throw new BadRequestException(
        'Không thể phân công khi đợt kiến tập đã kết thúc hoặc khóa',
      );
    }

    if (checkLimit) {
      const gv = await this.gvRepo.findOne({ where: { id: lecturerId } });
      if (!gv) throw new NotFoundException('Không tìm thấy giảng viên');

      if (gv.so_sv_toi_da_huong_dan) {
        const currentCount = await this.pcGvhdRepo.count({
          where: { giang_vien_id: lecturerId, trang_thai: 'DangHoatDong' },
        });

        const isAlreadyAssigned = await this.pcGvhdRepo.findOne({
          where: {
            dot_kien_tap_sinh_vien_id: dotKienTapSinhVienId,
            giang_vien_id: lecturerId,
            trang_thai: 'DangHoatDong',
          },
        });

        if (!isAlreadyAssigned && currentCount >= gv.so_sv_toi_da_huong_dan) {
          throw new BadRequestException(
            `GV ${gv.ho_ten} đã đạt giới hạn ${gv.so_sv_toi_da_huong_dan} sinh viên hướng dẫn`,
          );
        }
      }
    }

    const current = await this.pcGvhdRepo.findOne({
      where: {
        dot_kien_tap_sinh_vien_id: dotKienTapSinhVienId,
        trang_thai: 'DangHoatDong',
      },
    });
    if (current) {
      current.trang_thai = 'DaGo';
      await this.pcGvhdRepo.save(current);
    }

    const pc = new PhanCongGVHD();
    pc.dot_kien_tap_sinh_vien_id = dotKienTapSinhVienId;
    pc.giang_vien_id = lecturerId;
    pc.trang_thai = 'DangHoatDong';
    pc.ngay_phan_cong = new Date();
    await this.pcGvhdRepo.save(pc);

    await this.assignGvhdToTuDoTrips(dksv.sinh_vien_id, lecturerId);

    // Đồng bộ cập nhật giang_vien_hd_id trên DiemPhieuThamQuan của các phiếu chưa khóa điểm thu hoạch
    try {
      const svPhieus = await this.phieuRepo.find({
        where: { sinh_vien_id: dksv.sinh_vien_id },
        relations: { phieuThamQuan: true },
      });
      const ptqIds = svPhieus.map((p) => p.phieuThamQuan?.id).filter(Boolean);
      if (ptqIds.length > 0) {
        await this.diemPhieuRepo
          .createQueryBuilder()
          .update(DiemPhieuThamQuan)
          .set({ giang_vien_hd_id: lecturerId })
          .where('phieu_tham_quan_id IN (:...ptqIds)', { ptqIds })
          .andWhere('(da_khoa_thu_hoach = 0 OR da_khoa_thu_hoach IS NULL)')
          .execute();
      }
    } catch (updateGvhdError) {
      console.warn('Lỗi khi đồng bộ giang_vien_hd_id cho phiếu tham quan:', updateGvhdError);
    }

    return { success: true, pc };
  }

  async getLecturersWithWorkload(dotKienTapId?: number) {
    const lecturers = await this.gvRepo.find();
    const result: any[] = [];
    for (const gv of lecturers) {
      const qb = this.pcGvhdRepo
        .createQueryBuilder('pc')
        .where('pc.giang_vien_id = :gvId', { gvId: gv.id })
        .andWhere('pc.trang_thai = :trangThai', { trangThai: 'DangHoatDong' });

      if (dotKienTapId) {
        qb.innerJoin('pc.dotKienTapSinhVien', 'dksv').andWhere(
          'dksv.dot_kien_tap_id = :dotKienTapId',
          { dotKienTapId },
        );
      }

      const count = await qb.getCount();
      result.push({
        ...gv,
        so_sv_dang_huong_dan: count,
      });
    }
    return result;
  }

  async batchAssignGvhd(dotKienTapSinhVienIds: number[], lecturerId: number) {
    const results = { success: 0, failed: [] as any[] };
    for (const id of dotKienTapSinhVienIds) {
      try {
        await this.assignLecturerGuide(id, lecturerId, true);
        results.success++;
      } catch (err) {
        results.failed.push({ id, reason: err.message });
      }
    }
    return results;
  }

  async previewAutoAssignGvhd(dotKienTapId: number) {
    const dksvs = await this.dksvRepo.find({
      where: { dot_kien_tap_id: dotKienTapId },
      relations: { sinhVien: true },
    });

    const unassignedDksvs: any[] = [];
    for (const dksv of dksvs) {
      const pc = await this.pcGvhdRepo.findOne({
        where: {
          dot_kien_tap_sinh_vien_id: dksv.id,
          trang_thai: 'DangHoatDong',
        },
      });
      if (!pc) unassignedDksvs.push(dksv);
    }

    if (unassignedDksvs.length === 0) {
      return { assignments: [], unassigned: [] };
    }

    const lecturers = await this.getLecturersWithWorkload();
    const DEFAULT_MAX_SV = 40; // Định mức mặc định nếu NULL

    // Tính tổng sức chứa còn lại của Khoa
    let totalAvailableCapacity = 0;
    const availableLecturers = lecturers.filter((gv) => {
      const max = gv.so_sv_toi_da_huong_dan || DEFAULT_MAX_SV;
      const current = gv.so_sv_dang_huong_dan || 0;
      if (current < max) {
        totalAvailableCapacity += max - current;
        return true;
      }
      return false;
    });

    if (totalAvailableCapacity < unassignedDksvs.length) {
      throw new BadRequestException(
        `Không đủ định mức giảng viên! Cần phân công ${unassignedDksvs.length} SV, nhưng tổng sức chứa còn lại chỉ là ${totalAvailableCapacity}. Vui lòng cập nhật thêm định mức hoặc thêm giảng viên.`,
      );
    }

    const assignments: any[] = [];
    const unassigned: any[] = [];

    // Hàm trộn mảng (Fisher-Yates Shuffle)
    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    for (const dksv of unassignedDksvs) {
      // Đảo ngẫu nhiên trước để phá vỡ thứ tự cố định
      shuffleArray(availableLecturers);

      // Sắp xếp theo tỉ lệ tải (Ratio = Current / Max)
      availableLecturers.sort((a, b) => {
        const maxA = a.so_sv_toi_da_huong_dan || DEFAULT_MAX_SV;
        const maxB = b.so_sv_toi_da_huong_dan || DEFAULT_MAX_SV;
        const ratioA = (a.so_sv_dang_huong_dan || 0) / maxA;
        const ratioB = (b.so_sv_dang_huong_dan || 0) / maxB;
        return ratioA - ratioB;
      });

      const targetGv = availableLecturers[0];
      const targetMax = targetGv?.so_sv_toi_da_huong_dan || DEFAULT_MAX_SV;
      const targetCurrent = targetGv?.so_sv_dang_huong_dan || 0;

      if (targetGv && targetCurrent < targetMax) {
        assignments.push({
          dotKienTapSinhVienId: dksv.id,
          sinhVien: dksv.sinhVien,
          lecturerId: targetGv.id,
          lecturer: targetGv,
        });
        targetGv.so_sv_dang_huong_dan = targetCurrent + 1;
      } else {
        unassigned.push(dksv);
      }
    }

    return { assignments, unassigned };
  }

  async confirmAutoAssignGvhd(
    assignments: { dotKienTapSinhVienId: number; lecturerId: number }[],
  ) {
    const results = { success: 0, failed: [] as any[] };
    for (const assign of assignments) {
      try {
        await this.assignLecturerGuide(
          assign.dotKienTapSinhVienId,
          assign.lecturerId,
          false,
        );
        results.success++;
      } catch (err) {
        results.failed.push({
          id: assign.dotKienTapSinhVienId,
          reason: err.message,
        });
      }
    }
    return results;
  }

  async assignTourLeader(
    tripId: number,
    lecturerId: number,
    laTruongDoan: boolean,
  ) {
    const trip = await this.chuyenRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

    if (trip.trang_thai === 'DaDienRa' || trip.trang_thai === 'DaHuy') {
      throw new BadRequestException(
        'Không thể cập nhật giảng viên dẫn đoàn sau khi chuyến tham quan đã diễn ra hoặc bị hủy',
      );
    }

    const sameDayLedTrips = await this.danDoanRepo.find({
      where: { giang_vien_id: lecturerId },
      relations: { chuyenThamQuan: true },
    });
    const overlap = sameDayLedTrips.some(
      (m) =>
        m.chuyen_tham_quan_id !== tripId &&
        m.chuyenThamQuan &&
        m.chuyenThamQuan.trang_thai !== 'DaHuy' &&
        m.chuyenThamQuan.ngay_tham_quan &&
        new Date(m.chuyenThamQuan.ngay_tham_quan).toDateString() ===
          new Date(trip.ngay_tham_quan).toDateString(),
    );
    if (overlap) {
      throw new BadRequestException(
        'Giảng viên đã được phân công dẫn đoàn cho một chuyến tham quan khác trong cùng ngày',
      );
    }

    // Xóa tất cả phân công cũ của chuyến này để đảm bảo chỉ có 1 GV dẫn đoàn
    await this.danDoanRepo.delete({ chuyen_tham_quan_id: tripId });

    const dd = new PhanCongGiangVienDanDoan();
    dd.chuyen_tham_quan_id = tripId;
    dd.giang_vien_id = lecturerId;
    dd.la_truong_doan = laTruongDoan;
    return this.danDoanRepo.save(dd);
  }

  async unassignTourLeader(tripId: number, lecturerId: number) {
    const trip = await this.chuyenRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

    if (trip.trang_thai === 'DaDienRa' || trip.trang_thai === 'DaHuy') {
      throw new BadRequestException(
        'Không thể gỡ phân công giảng viên dẫn đoàn sau khi chuyến tham quan đã diễn ra hoặc bị hủy',
      );
    }

    const exist = await this.danDoanRepo.findOne({
      where: { chuyen_tham_quan_id: tripId, giang_vien_id: lecturerId },
    });
    if (!exist) {
      throw new BadRequestException(
        'Không tìm thấy phân công của giảng viên này trong chuyến',
      );
    }

    return this.danDoanRepo.remove(exist);
  }

  async autoAssignGvdd() {
    const lecturers = await this.gvRepo.find();
    if (lecturers.length === 0) {
      throw new BadRequestException('Không có giảng viên nào trong hệ thống');
    }

    const trips = await this.chuyenRepo.find({
      where: {
        cach_to_chuc: In(['DoKhoaToChuc', 'TuDo']),
        trang_thai: In(['Nhap', 'ChoDuyet', 'DaDuyet', 'MoDangKy']),
      },
    });

    const currentAssignments = await this.danDoanRepo.find({
      relations: { chuyenThamQuan: true },
    });

    const lecturerStats = new Map<
      number,
      { workload: number; busyDates: Set<string> }
    >();
    for (const l of lecturers) {
      lecturerStats.set(l.id, { workload: 0, busyDates: new Set() });
    }

    const assignedTripIds = new Set<number>();
    for (const a of currentAssignments) {
      if (a.chuyenThamQuan?.trang_thai === 'DaHuy') continue;
      if (a.chuyen_tham_quan_id) {
        assignedTripIds.add(a.chuyen_tham_quan_id);
      }
      const stat = lecturerStats.get(a.giang_vien_id);
      if (stat && a.chuyenThamQuan?.ngay_tham_quan) {
        stat.workload += 1;
        stat.busyDates.add(
          new Date(a.chuyenThamQuan.ngay_tham_quan).toDateString(),
        );
      }
    }

    const unassignedTrips = trips.filter(
      (t) => !assignedTripIds.has(t.id) && t.ngay_tham_quan,
    );

    // Group trips by Date để ưu tiên ngày có nhiều chuyến nhất
    const tripsByDate = new Map<string, typeof unassignedTrips>();
    for (const trip of unassignedTrips) {
      const dateStr = new Date(trip.ngay_tham_quan).toDateString();
      if (!tripsByDate.has(dateStr)) tripsByDate.set(dateStr, []);
      tripsByDate.get(dateStr)!.push(trip);
    }

    // Sort các ngày: Ngày nào có nhiều chuyến nhất thì xử lý trước
    const sortedDates = Array.from(tripsByDate.keys()).sort(
      (a, b) => tripsByDate.get(b)!.length - tripsByDate.get(a)!.length,
    );

    let assignedCount = 0;
    const newAssignments: PhanCongGiangVienDanDoan[] = [];

    // Hàm trộn mảng
    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    for (const dateStr of sortedDates) {
      const dailyTrips = tripsByDate.get(dateStr)!;

      for (const trip of dailyTrips) {
        // Lọc GV rảnh trong ngày này
        const availableLecturers = lecturers.filter((l) => {
          const stat = lecturerStats.get(l.id);
          return stat && !stat.busyDates.has(dateStr);
        });

        if (availableLecturers.length > 0) {
          // Trộn ngẫu nhiên để phá vỡ thứ tự
          shuffleArray(availableLecturers);

          // Ưu tiên GV đang có workload thấp nhất
          availableLecturers.sort((a, b) => {
            const wA = lecturerStats.get(a.id)!.workload;
            const wB = lecturerStats.get(b.id)!.workload;
            return wA - wB;
          });

          const selectedLecturer = availableLecturers[0];
          const stat = lecturerStats.get(selectedLecturer.id)!;

          const assignment = new PhanCongGiangVienDanDoan();
          assignment.chuyen_tham_quan_id = trip.id;
          assignment.giang_vien_id = selectedLecturer.id;
          assignment.la_truong_doan = true;
          newAssignments.push(assignment);

          stat.workload += 1;
          stat.busyDates.add(dateStr);
          assignedCount += 1;
        }
      }
    }

    if (newAssignments.length > 0) {
      await this.danDoanRepo.save(newAssignments);
    }

    return {
      message: `Đã phân công tự động cho ${assignedCount}/${unassignedTrips.length} chuyến.`,
      assignedCount,
      totalUnassigned: unassignedTrips.length,
    };
  }

  // -------------------------------------------------------------
  // Hoi Dong Cham Bao Cao & Tong Ket Diem
  // -------------------------------------------------------------
  async getBoards(dotKienTapId?: number) {
    const where: FindOptionsWhere<HoiDongChamBaoCao> = {};
    if (dotKienTapId) {
      where.dot_kien_tap_id = dotKienTapId;
    }

    const boards = await this.hdRepo.find({
      where,
      relations: { dotKienTap: true },
      order: { ngay_bao_cao: 'DESC' },
    });

    return Promise.all(
      boards.map(async (b) => {
        const thanhViens = await this.hdTvRepo.find({
          where: { hoi_dong_id: b.id },
          relations: { giangVien: true },
        });

        const boChuyens = await this.boRepo.find({
          where: { hoi_dong_id: b.id },
        });
        const boIds = boChuyens.map((bo) => bo.id);
        let isCouncilLocked = false;
        let isKhoaLocked = false;
        if (boIds.length > 0) {
          const phieuTQs = await this.phieuTQRepo.find({
            where: { bo_chuyen_bao_cao_id: In(boIds) },
            relations: { diemPhieuThamQuan: true },
          });
          isCouncilLocked = phieuTQs.length > 0 && phieuTQs.every(
            (p) => Boolean(p.diemPhieuThamQuan?.da_khoa_hoi_dong),
          );
          isKhoaLocked = phieuTQs.length > 0 && phieuTQs.every(
            (p) => Boolean(p.diemPhieuThamQuan?.da_khoa),
          );
        }

        return {
          ...b,
          members: thanhViens,
          sv: boIds.length,
          isCouncilLocked,
          isKhoaLocked,
        };
      }),
    );
  }

  async getBoardsExportData(dotKienTapId?: number) {
    const where: FindOptionsWhere<HoiDongChamBaoCao> = {};
    if (dotKienTapId) {
      where.dot_kien_tap_id = dotKienTapId;
    }

    const boards = await this.hdRepo.find({
      where,
      relations: { dotKienTap: true },
      order: { ngay_bao_cao: 'ASC', ten_hoi_dong: 'ASC' },
    });

    return Promise.all(
      boards.map(async (b) => {
        const thanhViens = await this.hdTvRepo.find({
          where: { hoi_dong_id: b.id },
          relations: { giangVien: true },
          order: { id: 'ASC' },
        });

        const students = await this.getBoardStudents(b.id);

        return {
          id: b.id,
          ten_hoi_dong: b.ten_hoi_dong,
          ngay_bao_cao: b.ngay_bao_cao,
          dia_diem: b.dia_diem,
          dot_kien_tap_id: b.dot_kien_tap_id,
          dotKienTap: b.dotKienTap,
          members: thanhViens,
          students: students,
        };
      }),
    );
  }

  async validateLecturersBoardScheduleConflict(
    lecturerIds: number[],
    boardDate: Date | string,
    excludeBoardId?: number,
  ) {
    if (!lecturerIds || lecturerIds.length === 0 || !boardDate) return;
    const targetDate = new Date(boardDate);
    if (isNaN(targetDate.getTime())) return;

    // Lấy tất cả thành viên hội đồng của các giảng viên này
    const otherMembers = await this.hdTvRepo.find({
      where: { giang_vien_id: In(lecturerIds) },
      relations: { hoiDong: true, giangVien: true },
    });

    for (const m of otherMembers) {
      if (!m.hoiDong || (excludeBoardId && m.hoi_dong_id === excludeBoardId)) {
        continue;
      }
      const otherDate = new Date(m.hoiDong.ngay_bao_cao);
      if (isNaN(otherDate.getTime())) continue;

      const isSameDay =
        targetDate.getFullYear() === otherDate.getFullYear() &&
        targetDate.getMonth() === otherDate.getMonth() &&
        targetDate.getDate() === otherDate.getDate();

      const diffMinutes = Math.abs(targetDate.getTime() - otherDate.getTime()) / (60 * 1000);

      // Trùng ngày và khoảng cách thời gian < 120 phút (trong cùng khung giờ bảo vệ)
      if (isSameDay && diffMinutes < 120) {
        const gvName = m.giangVien?.ho_ten || `ID ${m.giang_vien_id}`;
        const gvCode = m.giangVien?.ma_gv ? ` (Mã: ${m.giangVien.ma_gv})` : '';
        const boardName = m.hoiDong.ten_hoi_dong || `Hội đồng #${m.hoi_dong_id}`;
        const roomStr = m.hoiDong.dia_diem ? ` tại phòng ${m.hoiDong.dia_diem}` : '';
        const timeStr = otherDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const dateStr = otherDate.toLocaleDateString('vi-VN');

        throw new BadRequestException(
          `Xung đột lịch bảo vệ: Giảng viên "${gvName}"${gvCode} đã được phân công vào hội đồng "${boardName}"${roomStr} lúc ${timeStr} ngày ${dateStr}. Vui lòng chọn giảng viên khác hoặc điều chỉnh khung giờ bảo vệ.`,
        );
      }
    }
  }

  async createBoard(
    dotKienTapId: number,
    name: string,
    date: Date,
    room: string,
    members?: Array<{ lecturerId: number; role: string }>,
  ) {
    // 1. Kiểm tra nghiệp vụ thành viên nếu có truyền lên
    if (members && members.length > 0) {
      const uniqueLecturerIds = new Set(members.map((m) => m.lecturerId));
      if (uniqueLecturerIds.size !== members.length) {
        throw new BadRequestException('Mỗi giảng viên chỉ có thể đảm nhiệm một vai trò trong cùng một hội đồng.');
      }

      const chuTichCount = members.filter((m) => m.role === 'ChuTich').length;
      if (chuTichCount !== 1) {
        throw new BadRequestException('Hội đồng phải có chính xác 1 Chủ tịch.');
      }

      const thuKyCount = members.filter((m) => m.role === 'ThuKy').length;
      if (thuKyCount < 1) {
        throw new BadRequestException('Hội đồng phải có ít nhất 1 Thư ký.');
      }

      const lecturerIds = members.map((m) => m.lecturerId);
      const lecturers = await this.gvRepo.find({ where: { id: In(lecturerIds) } });
      for (const gv of lecturers) {
        if (!gv.du_dk_hoi_dong) {
          throw new BadRequestException(
            `Giảng viên "${gv.ho_ten}" (Mã: ${gv.ma_gv}) chưa đủ điều kiện tham gia Hội đồng theo tiêu chuẩn khoa.`,
          );
        }
      }

      // Kiểm tra xung đột lịch bảo vệ
      await this.validateLecturersBoardScheduleConflict(lecturerIds, date);
    }

    // 2. Thực hiện lưu bằng transaction đảm bảo tính toàn vẹn (atomic)
    return this.dataSource.transaction(async (manager) => {
      try {
        const hd = new HoiDongChamBaoCao();
        hd.dot_kien_tap_id = dotKienTapId;
        hd.ten_hoi_dong = name;
        hd.ngay_bao_cao = date;
        hd.dia_diem = room;
        const savedBoard = await manager.save(HoiDongChamBaoCao, hd);

        if (members && members.length > 0) {
          const memberEntities = members.map((m) => {
            const hdtv = new HoiDong_ThanhVien();
            hdtv.hoi_dong_id = savedBoard.id;
            hdtv.giang_vien_id = m.lecturerId;
            hdtv.vai_tro = m.role;
            return hdtv;
          });
          await manager.save(HoiDong_ThanhVien, memberEntities);
        }

        return savedBoard;
      } catch (error: any) {
        if (
          error?.message?.includes('trg_HoiDongThanhVien_ChanTrungLich') ||
          error?.message?.includes('Giảng viên đã tham gia một hội đồng khác cùng thời gian báo cáo')
        ) {
          throw new BadRequestException(
            'Xung đột lịch bảo vệ: Giảng viên đã được phân công vào một hội đồng khác trong cùng khung thời gian báo cáo. Vui lòng kiểm tra lại lịch phân công.',
          );
        }
        throw error;
      }
    });
  }

  async addBoardMember(boardId: number, lecturerId: number, role: string) {
    const board = await this.hdRepo.findOne({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Không tìm thấy hội đồng');

    const gv = await this.gvRepo.findOne({ where: { id: lecturerId } });
    if (!gv) throw new NotFoundException('Không tìm thấy giảng viên');
    if (!gv.du_dk_hoi_dong) {
      throw new BadRequestException(
        `Giảng viên "${gv.ho_ten}" (Mã: ${gv.ma_gv}) chưa đủ điều kiện tham gia Hội đồng theo tiêu chuẩn khoa.`,
      );
    }

    // Kiểm tra xung đột lịch bảo vệ
    await this.validateLecturersBoardScheduleConflict([lecturerId], board.ngay_bao_cao, boardId);

    try {
      const m = new HoiDong_ThanhVien();
      m.hoi_dong_id = boardId;
      m.giang_vien_id = lecturerId;
      m.vai_tro = role;
      return await this.hdTvRepo.save(m);
    } catch (error: any) {
      if (
        error?.message?.includes('trg_HoiDongThanhVien_ChanTrungLich') ||
        error?.message?.includes('Giảng viên đã tham gia một hội đồng khác cùng thời gian báo cáo')
      ) {
        throw new BadRequestException(
          `Xung đột lịch bảo vệ: Giảng viên "${gv.ho_ten}" đã được phân công vào một hội đồng khác trong cùng khung thời gian báo cáo.`,
        );
      }
      throw error;
    }
  }

  async updateBoard(
    boardId: number,
    data: {
      name?: string;
      dotKienTapId?: number;
      date?: Date;
      room?: string;
      members?: Array<{ lecturerId: number; role: string }>;
    },
  ) {
    const board = await this.hdRepo.findOne({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Không tìm thấy hội đồng');

    // 1. Kiểm tra và cập nhật đợt kiến tập
    if (data.dotKienTapId !== undefined && data.dotKienTapId !== board.dot_kien_tap_id) {
      const studentCount = await this.boRepo.count({
        where: { hoi_dong_id: boardId },
      });
      if (studentCount > 0) {
        throw new BadRequestException(
          `Không thể thay đổi đợt kiến tập vì hội đồng hiện đang có ${studentCount} sinh viên được phân công. Vui lòng hủy phân công sinh viên trước khi đổi đợt kiến tập.`,
        );
      }
      board.dot_kien_tap_id = data.dotKienTapId;
    }

    const effectiveDate = data.date ? new Date(data.date) : board.ngay_bao_cao;

    // 2. Kiểm tra chuẩn học thuật và xung đột lịch nếu có cập nhật thành viên hoặc ngày giờ
    let lecturerIdsToCheck: number[] = [];
    if (data.members !== undefined) {
      const uniqueLecturerIds = new Set(data.members.map((m) => m.lecturerId));
      if (uniqueLecturerIds.size !== data.members.length) {
        throw new BadRequestException('Mỗi giảng viên chỉ có thể đảm nhiệm một vai trò trong cùng một hội đồng.');
      }

      if (data.members.length > 0) {
        const chuTichCount = data.members.filter((m) => m.role === 'ChuTich').length;
        if (chuTichCount !== 1) {
          throw new BadRequestException('Hội đồng phải có chính xác 1 Chủ tịch.');
        }

        const thuKyCount = data.members.filter((m) => m.role === 'ThuKy').length;
        if (thuKyCount < 1) {
          throw new BadRequestException('Hội đồng phải có ít nhất 1 Thư ký.');
        }

        const lecturerIds = data.members.map((m) => m.lecturerId);
        const lecturers = await this.gvRepo.find({ where: { id: In(lecturerIds) } });
        for (const gv of lecturers) {
          if (!gv.du_dk_hoi_dong) {
            throw new BadRequestException(
              `Giảng viên "${gv.ho_ten}" (Mã: ${gv.ma_gv}) chưa đủ điều kiện tham gia Hội đồng theo tiêu chuẩn khoa.`,
            );
          }
        }
      }
      lecturerIdsToCheck = data.members.map((m) => m.lecturerId);
    } else if (data.date !== undefined) {
      const existingMembers = await this.hdTvRepo.find({ where: { hoi_dong_id: boardId } });
      lecturerIdsToCheck = existingMembers.map((m) => m.giang_vien_id);
    }

    if (lecturerIdsToCheck.length > 0) {
      await this.validateLecturersBoardScheduleConflict(
        lecturerIdsToCheck,
        effectiveDate,
        boardId,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      try {
        if (data.name) board.ten_hoi_dong = data.name;
        if (data.date) board.ngay_bao_cao = data.date;
        if (data.room !== undefined) board.dia_diem = data.room;

        await manager.save(HoiDongChamBaoCao, board);

        // Cập nhật thành viên hội đồng nếu có truyền lên
        if (data.members !== undefined) {
          const currentMembers = await manager.find(HoiDong_ThanhVien, {
            where: { hoi_dong_id: boardId },
            relations: { giangVien: true },
          });

          const currentTvIds = currentMembers.map((m) => m.id);
          let scoredTvIds: number[] = [];
          if (currentTvIds.length > 0) {
            const scores = await manager.find(DiemHoiDong_ChiTiet, {
              where: { hoi_dong_thanhvien_id: In(currentTvIds) },
              select: { hoi_dong_thanhvien_id: true },
            });
            scoredTvIds = Array.from(new Set(scores.map((s) => s.hoi_dong_thanhvien_id)));
          }

          const newLecturerIds = new Set(data.members.map((m) => m.lecturerId));

          // Kiểm tra thành viên bị gỡ bỏ
          for (const curr of currentMembers) {
            if (!newLecturerIds.has(curr.giang_vien_id)) {
              if (scoredTvIds.includes(curr.id)) {
                const gvName = curr.giangVien?.ho_ten || `ID ${curr.giang_vien_id}`;
                throw new BadRequestException(
                  `Không thể xóa giảng viên "${gvName}" khỏi hội đồng vì đã có điểm chấm chi tiết cho sinh viên.`,
                );
              }
              await manager.delete(HoiDong_ThanhVien, curr.id);
            }
          }

          // Cập nhật vai trò hoặc thêm mới
          for (const item of data.members) {
            const existing = currentMembers.find((m) => m.giang_vien_id === item.lecturerId);
            if (existing) {
              if (existing.vai_tro !== item.role) {
                existing.vai_tro = item.role;
                await manager.save(HoiDong_ThanhVien, existing);
              }
            } else {
              const newMember = new HoiDong_ThanhVien();
              newMember.hoi_dong_id = boardId;
              newMember.giang_vien_id = item.lecturerId;
              newMember.vai_tro = item.role;
              await manager.save(HoiDong_ThanhVien, newMember);
            }
          }
        }

        return await manager.findOne(HoiDongChamBaoCao, {
          where: { id: boardId },
          relations: { dotKienTap: true },
        });
      } catch (error: any) {
        if (
          error?.message?.includes('trg_HoiDongThanhVien_ChanTrungLich') ||
          error?.message?.includes('Giảng viên đã tham gia một hội đồng khác cùng thời gian báo cáo')
        ) {
          throw new BadRequestException(
            'Xung đột lịch bảo vệ: Giảng viên đã được phân công vào một hội đồng khác trong cùng khung thời gian báo cáo. Vui lòng kiểm tra lại lịch phân công.',
          );
        }
        throw error;
      }
    });
  }

  async deleteBoard(boardId: number) {
    const board = await this.hdRepo.findOne({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Không tìm thấy hội đồng');

    // 1. Kiểm tra xem đã có điểm chi tiết chưa
    const thanhViens = await this.hdTvRepo.find({ where: { hoi_dong_id: boardId } });
    const tvIds = thanhViens.map((t) => t.id);
    if (tvIds.length > 0) {
      const hasScores = await this.dataSource.manager.count(DiemHoiDong_ChiTiet, {
        where: { hoi_dong_thanhvien_id: In(tvIds) },
      });
      if (hasScores > 0) {
        throw new BadRequestException('Hội đồng đã có giảng viên chấm điểm, không thể xóa');
      }
    }

    // 2. Gỡ bỏ sinh viên khỏi hội đồng (set hoi_dong_id = null trên BoChuyenBaoCao)
    await this.boRepo.update({ hoi_dong_id: boardId }, { hoi_dong_id: null as any });

    // 3. Xóa thành viên hội đồng
    await this.hdTvRepo.delete({ hoi_dong_id: boardId });

    // 4. Xóa hội đồng
    await this.hdRepo.delete(boardId);

    return { message: 'Đã xóa hội đồng thành công' };
  }

  async getBoardStudents(boardId: number) {
    const boChuyens = await this.boRepo.find({
      where: { hoi_dong_id: boardId },
      relations: {
        dotKienTapSinhVien: { sinhVien: true },
      },
    });

    return Promise.all(
      boChuyens.map(async (bo) => {
        const phieuTQs = await this.phieuTQRepo.find({
          where: { bo_chuyen_bao_cao_id: bo.id },
          relations: {
            phieuDangKy: { chuyenThamQuan: { nhaMay: true } },
            diemPhieuThamQuan: true,
          },
        });

        const isCouncilLocked = phieuTQs.length > 0 && phieuTQs.every(
          (p) => Boolean(p.diemPhieuThamQuan?.da_khoa_hoi_dong),
        );
        const isKhoaLocked = phieuTQs.length > 0 && phieuTQs.every(
          (p) => Boolean(p.diemPhieuThamQuan?.da_khoa),
        );

        return {
          boChuyenId: bo.id,
          dotKienTapSinhVienId: bo.dot_kien_tap_sinh_vien_id,
          sinhVien: bo.dotKienTapSinhVien?.sinhVien,
          ghiChu: bo.ghi_chu || '',
          isCouncilLocked,
          isKhoaLocked,
          isLocked: isCouncilLocked || isKhoaLocked,
          trips: phieuTQs.map((ptq) => ({
            id: ptq.id,
            phieuDangKyId: ptq.phieu_dang_ky_id,
            nhaMay: ptq.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi',
            hinhThuc: ptq.phieuDangKy?.chuyenThamQuan?.hinh_thuc,
            diemHoiDong: ptq.diemPhieuThamQuan?.diem_hoi_dong_final ?? null,
            daKhoaHoiDong: Boolean(ptq.diemPhieuThamQuan?.da_khoa_hoi_dong),
            daKhoaKhoa: Boolean(ptq.diemPhieuThamQuan?.da_khoa),
            daKhoa:
              (ptq.diemPhieuThamQuan?.da_khoa_hoi_dong ||
                ptq.diemPhieuThamQuan?.da_khoa) ??
              false,
          })),
        };
      }),
    );
  }

  async getAvailableStudentsForBoard(dotKienTapId: number) {
    // 1. Chỉ tìm những sinh viên trong đợt CÓ TỪ 3 CHUYẾN TRỞ LÊN nhưng chưa có BoChuyenBaoCao
    // Thay vì lặp tuần tự qua toàn bộ 803 sinh viên (gây nghẽn 2.400 câu query SQL), dùng 1 query lọc đúng người tiềm năng
    const candidateIds = await this.dksvRepo
      .createQueryBuilder('dksv')
      .innerJoin('PhieuDangKy', 'pdk', 'pdk.sinh_vien_id = dksv.sinh_vien_id AND pdk.trang_thai IN (:...statuses)', { statuses: ['HopLe', 'DaThamGia'] })
      .leftJoin('BoChuyenBaoCao', 'bo', 'bo.dot_kien_tap_sinh_vien_id = dksv.id')
      .where('dksv.dot_kien_tap_id = :dotId', { dotId: dotKienTapId })
      .andWhere('bo.id IS NULL')
      .select('dksv.id', 'id')
      .groupBy('dksv.id')
      .having('COUNT(pdk.id) >= 3')
      .getRawMany();

    for (const c of candidateIds) {
      await this.autoSelectRepresentativeTrips(c.id);
    }

    // 2. Trả về ngay danh sách sinh viên có BoChuyenBaoCao chưa gán hội đồng (Truy vấn tức thì < 15ms)
    return this.boRepo.find({
      where: {
        dotKienTapSinhVien: { dot_kien_tap_id: dotKienTapId },
        hoi_dong_id: IsNull(),
      },
      relations: {
        dotKienTapSinhVien: { sinhVien: true },
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async assignStudentsToBoard(boardId: number, boChuyenIds: number[]) {
    if (!boChuyenIds || boChuyenIds.length === 0) return;
    await this.boRepo.update(
      { id: In(boChuyenIds) },
      { hoi_dong_id: boardId }
    );
    return { message: 'Phân công sinh viên vào hội đồng thành công' };
  }

  async unassignStudentsFromBoard(boardId: number, boChuyenIds: number[]) {
    if (!boChuyenIds || boChuyenIds.length === 0) return;
    await this.boRepo.update(
      { id: In(boChuyenIds), hoi_dong_id: boardId },
      { hoi_dong_id: null as any }
    );
    return { message: 'Đã hủy phân công sinh viên khỏi hội đồng thành công' };
  }

  // Helper tính thời điểm 23:59:59.999 (múi giờ Việt Nam UTC+7) của ngày kết thúc đợt
  private getEndOfDayVietnam(dateInput: Date | string): Date {
    if (!dateInput) return new Date();
    let dateStr = '';
    if (typeof dateInput === 'string') {
      dateStr = dateInput.split('T')[0];
    } else if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return new Date();
      dateStr = dateInput.toISOString().split('T')[0];
    } else {
      dateStr = String(dateInput).split('T')[0];
    }
    return new Date(`${dateStr}T23:59:59.999+07:00`);
  }

  // Tự động gom & tạo Bộ 3 chuyến báo cáo cho sinh viên đủ điều kiện
  async autoPickTriadsForStudent(
    studentId: number,
    termStudentId: number,
  ): Promise<BoChuyenBaoCao | null> {
    const existingBo = await this.boRepo.findOne({
      where: { dot_kien_tap_sinh_vien_id: termStudentId },
    });
    if (existingBo) return existingBo;

    const dksv = await this.dksvRepo.findOne({
      where: { id: termStudentId },
      relations: { dotKienTap: true },
    });
    if (!dksv) return null;

    const phieus = await this.phieuRepo.find({
      where: { sinh_vien_id: studentId },
      relations: {
        chuyenThamQuan: { nhaMay: true, lichKienTap: true },
        phieuThamQuan: {
          baiThuHoach: true,
          diemPhieuThamQuan: true,
        },
      },
      order: { ngay_dang_ky: 'DESC' },
    });

    if (!phieus || phieus.length < 3) return null;

    const ptqIds = phieus
      .map((p) => p.phieuThamQuan?.id)
      .filter((id): id is number => typeof id === 'number');

    const diemDanhMap = new Map<number, string>();
    if (ptqIds.length > 0) {
      const dds = await this.diemDanhRepo.find({
        where: { phieu_tham_quan_id: In(ptqIds) },
      });
      for (const dd of dds) {
        diemDanhMap.set(dd.phieu_tham_quan_id, dd.trang_thai);
      }
    }

    const eighteenMonthsAgo = new Date();
    eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18);

    const validTrips = phieus.filter((p) => {
      if (!['HopLe', 'DaThamGia', 'HoanThanh'].includes(p.trang_thai)) return false;
      if (['KhongDat', 'BiLoai', 'DaHuy', 'VangMat'].includes(p.trang_thai)) return false;
      if (!p.phieuThamQuan || p.phieuThamQuan.trang_thai !== 'HopLe') return false;
      if (!p.phieuThamQuan.baiThuHoach) return false;

      const ddStatus = diemDanhMap.get(p.phieuThamQuan.id);
      if (ddStatus && ddStatus !== 'CoMat') return false;

      const ngayThamQuan = p.chuyenThamQuan?.ngay_tham_quan;
      if (ngayThamQuan && new Date(ngayThamQuan) < eighteenMonthsAgo) {
        return false;
      }

      if (!p.chuyenThamQuan?.nha_may_id) return false;

      return true;
    });

    if (validTrips.length < 3) return null;

    const getTripPriorityScore = (p: PhieuDangKy): number => {
      const bth = p.phieuThamQuan?.baiThuHoach;
      const isOnTimeScore = bth?.trang_thai === 'DaNop' ? 1000 : 0;

      const dptq = p.phieuThamQuan?.diemPhieuThamQuan;
      const grade = Number(
        dptq?.diem_thu_hoach ??
        (bth as any)?.diem_ai_de_xuat ??
        dptq?.diem_chuan_bi ??
        0,
      );

      const tripTime = p.chuyenThamQuan?.ngay_tham_quan
        ? new Date(p.chuyenThamQuan.ngay_tham_quan).getTime() / 1e12
        : 0;

      return isOnTimeScore + grade * 10 + tripTime;
    };

    const directTrips = validTrips
      .filter((p) => p.chuyenThamQuan?.hinh_thuc === 'TrucTiep')
      .sort((a, b) => getTripPriorityScore(b) - getTripPriorityScore(a));

    const onlineTrips = validTrips
      .filter((p) => p.chuyenThamQuan?.hinh_thuc === 'TrucTuyen')
      .sort((a, b) => getTripPriorityScore(b) - getTripPriorityScore(a));

    let selectedTrips: PhieuDangKy[] | null = null;
    let bestScore = -1;

    if (directTrips.length >= 2 && onlineTrips.length >= 1) {
      for (let i = 0; i < directTrips.length - 1; i++) {
        for (let j = i + 1; j < directTrips.length; j++) {
          const d1 = directTrips[i];
          const d2 = directTrips[j];
          if (d1.chuyenThamQuan.nha_may_id === d2.chuyenThamQuan.nha_may_id) continue;

          for (const onl of onlineTrips) {
            if (
              onl.chuyenThamQuan.nha_may_id === d1.chuyenThamQuan.nha_may_id ||
              onl.chuyenThamQuan.nha_may_id === d2.chuyenThamQuan.nha_may_id
            ) {
              continue;
            }

            const totalScore =
              getTripPriorityScore(d1) +
              getTripPriorityScore(d2) +
              getTripPriorityScore(onl);

            if (totalScore > bestScore) {
              bestScore = totalScore;
              selectedTrips = [d1, d2, onl];
              break;
            }
          }
          if (selectedTrips) break;
        }
        if (selectedTrips) break;
      }
    }

    if (!selectedTrips && directTrips.length >= 3) {
      for (let i = 0; i < directTrips.length - 2; i++) {
        for (let j = i + 1; j < directTrips.length - 1; j++) {
          for (let k = j + 1; k < directTrips.length; k++) {
            const d1 = directTrips[i];
            const d2 = directTrips[j];
            const d3 = directTrips[k];
            const factorySet = new Set([
              d1.chuyenThamQuan.nha_may_id,
              d2.chuyenThamQuan.nha_may_id,
              d3.chuyenThamQuan.nha_may_id,
            ]);
            if (factorySet.size === 3) {
              selectedTrips = [d1, d2, d3];
              break;
            }
          }
          if (selectedTrips) break;
        }
        if (selectedTrips) break;
      }
    }

    if (!selectedTrips || selectedTrips.length !== 3) {
      return null;
    }

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const boRepo = manager.getRepository(BoChuyenBaoCao);
      const ptqRepo = manager.getRepository(PhieuThamQuan);

      const bo = new BoChuyenBaoCao();
      bo.dot_kien_tap_sinh_vien_id = termStudentId;
      bo.ngay_chon = new Date();
      bo.ghi_chu = 'Hệ thống tự động chốt bộ 3 chuyến khi hết hạn đợt kiến tập';
      const savedBo = await boRepo.save(bo);

      for (const trip of selectedTrips!) {
        if (trip.phieuThamQuan) {
          await ptqRepo.update(trip.phieuThamQuan.id, {
            bo_chuyen_bao_cao_id: savedBo.id,
          });
        }
      }

      return savedBo;
    });
  }

  // Tự động gom & chốt Bộ 3 chuyến cho toàn bộ sinh viên đủ điều kiện trong đợt
  async autoPickRepresentativeTripsForDot(dotKienTapId: number) {
    const dksvs = await this.dksvRepo.find({
      where: { dot_kien_tap_id: dotKienTapId },
    });
    if (!dksvs || dksvs.length === 0) return { dotKienTapId, autoPickedCount: 0 };

    let autoPickedCount = 0;
    for (const dksv of dksvs) {
      const existingBo = await this.boRepo.findOne({
        where: { dot_kien_tap_sinh_vien_id: dksv.id },
      });
      if (existingBo) continue;

      const createdBo = await this.autoPickTriadsForStudent(dksv.sinh_vien_id, dksv.id);
      if (createdBo) {
        autoPickedCount++;
      }
    }
    this.logger.log(`Đã tự động chốt Bộ 3 chuyến cho ${autoPickedCount} sinh viên trong đợt #${dotKienTapId}`);
    return { dotKienTapId, autoPickedCount };
  }

  // Tự động khóa các đợt kiến tập đã qua hạn kết thúc và gom bộ 3 cho SV đủ điều kiện
  async autoLockExpiredBoChuyen() {
    const now = new Date();
    const unlockedDots = await this.dotRepo.find({
      where: { is_bo_chuyen_locked: false },
    });

    const expiredDots: DotKienTap[] = [];
    for (const dot of unlockedDots) {
      if (!dot.ngay_ket_thuc) continue;
      const deadline = this.getEndOfDayVietnam(dot.ngay_ket_thuc);
      if (now > deadline) {
        expiredDots.push(dot);
      }
    }

    if (expiredDots.length > 0) {
      this.logger.log(`Tự động khóa ${expiredDots.length} đợt kiến tập đã quá hạn kết thúc.`);
      for (const dot of expiredDots) {
        dot.is_bo_chuyen_locked = true;
        await this.dotRepo.save(dot);
        try {
          await this.autoPickRepresentativeTripsForDot(dot.id);
        } catch (err: any) {
          this.logger.error(`Lỗi khi auto-pick đợt #${dot.id}:`, err?.stack || err);
        }
      }
    }
  }

  async toggleLockBoChuyen(dotKienTapId: number, isLocked: boolean) {
    const dot = await this.dotRepo.findOne({ where: { id: dotKienTapId } });
    if (!dot) throw new NotFoundException('Không tìm thấy đợt kiến tập');
    dot.is_bo_chuyen_locked = isLocked;
    await this.dotRepo.save(dot);

    // Khi Khoa chủ động bấm Khóa cổng, tự động gom Bộ 3 cho SV đủ điều kiện chưa chọn
    if (isLocked) {
      try {
        await this.autoPickRepresentativeTripsForDot(dotKienTapId);
      } catch (err: any) {
        this.logger.error(`Lỗi khi auto-pick bộ 3 cho đợt #${dotKienTapId}:`, err?.stack || err);
      }
    }

    return {
      message: isLocked
        ? 'Đã khóa cổng đăng ký / thay đổi Bộ 3 chuyến báo cáo cho đợt này'
        : 'Đã mở khóa cổng đăng ký / thay đổi Bộ 3 chuyến báo cáo cho đợt này',
      isLocked,
    };
  }

  async getBoChuyenLockStatus(dotKienTapId: number) {
    const dot = await this.dotRepo.findOne({
      where: { id: dotKienTapId },
    });
    if (!dot) throw new NotFoundException('Không tìm thấy đợt kiến tập');

    const now = new Date();
    const deadline = dot.ngay_ket_thuc ? this.getEndOfDayVietnam(dot.ngay_ket_thuc) : null;
    const isExpired = deadline ? now > deadline : false;

    // Lazy evaluation: Nếu đã quá hạn mà chưa khóa, tự động khóa và gom bộ 3 cho SV đủ điều kiện
    if (isExpired && !dot.is_bo_chuyen_locked) {
      dot.is_bo_chuyen_locked = true;
      await this.dotRepo.save(dot);
      try {
        await this.autoPickRepresentativeTripsForDot(dot.id);
      } catch (err: any) {
        this.logger.error(`Lỗi khi auto-pick bộ 3 đợt #${dot.id}:`, err?.stack || err);
      }
    }

    const isLocked = dot.is_bo_chuyen_locked || isExpired;
    return {
      dotKienTapId,
      isLocked,
      isDeadlineExpired: isExpired,
      deadline: deadline ? deadline.toISOString() : null,
    };
  }

  async lockBoard(boardId: number) {
    const board = await this.hdRepo.findOne({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Không tìm thấy hội đồng');

    const boChuyens = await this.boRepo.find({ where: { hoi_dong_id: boardId } });
    const boIds = boChuyens.map((b) => b.id);
    if (boIds.length === 0) {
      return { message: 'Hội đồng chưa có sinh viên nào để khóa điểm' };
    }

    const phieuTQs = await this.phieuTQRepo.find({
      where: { bo_chuyen_bao_cao_id: In(boIds) },
    });

    const members = await this.hdTvRepo.find({ where: { hoi_dong_id: boardId } });
    const memberIds = members.map((m) => m.id);

    let updatedCount = 0;
    for (const ptq of phieuTQs) {
      const chiTiets = memberIds.length > 0
        ? await this.dataSource.manager.find(DiemHoiDong_ChiTiet, {
          where: {
            phieu_tham_quan_id: ptq.id,
            hoi_dong_thanhvien_id: In(memberIds),
          },
        })
        : [];

      let diemPhieu = await this.diemPhieuRepo.findOne({
        where: { phieu_tham_quan_id: ptq.id },
      });
      if (!diemPhieu) {
        diemPhieu = new DiemPhieuThamQuan();
        diemPhieu.phieu_tham_quan_id = ptq.id;
      }

      if (chiTiets.length > 0) {
        // Tính trung bình trên số lượng GV thực tế đã chấm
        const sum = chiTiets.reduce((acc, curr) => acc + Number(curr.diem), 0);
        const avg = sum / chiTiets.length;
        diemPhieu.diem_hoi_dong_final = Number(avg.toFixed(2));
      } else {
        diemPhieu.diem_hoi_dong_final = 0;
      }
      diemPhieu.da_khoa_hoi_dong = true;
      diemPhieu.ngay_khoa_hoi_dong = new Date();

      await this.diemPhieuRepo.save(diemPhieu);
      updatedCount++;
    }

    return {
      message: `Đã khóa điểm hội đồng thành công cho ${boChuyens.length} sinh viên (${updatedCount} phiếu tham quan).`,
    };
  }

  async unlockBoardCouncilGrades(
    dto: { boardId: number; boChuyenId?: number; lyDo?: string },
    userAccountId?: number,
  ) {
    const board = await this.hdRepo.findOne({
      where: { id: dto.boardId },
      relations: { dotKienTap: true },
    });
    if (!board) throw new NotFoundException('Không tìm thấy hội đồng');

    // Kiểm tra nếu đợt kiến tập đã được Khoa khóa sổ toàn diện
    if (board.dotKienTap?.trang_thai === 'DaKhoa') {
      throw new BadRequestException(
        'Đợt kiến tập đã được khóa sổ toàn diện (da_khoa = 1), không thể mở khóa điểm hội đồng.',
      );
    }

    let targetBoIds: number[] = [];
    if (dto.boChuyenId) {
      const bo = await this.boRepo.findOne({
        where: { id: dto.boChuyenId, hoi_dong_id: dto.boardId },
      });
      if (!bo) {
        throw new NotFoundException(
          'Không tìm thấy bộ chuyến báo cáo của sinh viên trong hội đồng này',
        );
      }
      targetBoIds = [bo.id];
    } else {
      const boChuyens = await this.boRepo.find({
        where: { hoi_dong_id: dto.boardId },
      });
      targetBoIds = boChuyens.map((b) => b.id);
    }

    if (targetBoIds.length === 0) {
      return { message: 'Hội đồng chưa có sinh viên nào để mở khóa điểm' };
    }

    const phieuTQs = await this.phieuTQRepo.find({
      where: { bo_chuyen_bao_cao_id: In(targetBoIds) },
      relations: { diemPhieuThamQuan: true },
    });

    // Kiểm tra xem có phiếu nào đã bị khóa sổ cấp Khoa chưa
    const alreadyKhoaLocked = phieuTQs.find((p) => p.diemPhieuThamQuan?.da_khoa);
    if (alreadyKhoaLocked) {
      throw new BadRequestException(
        'Đợt kiến tập đã được khóa sổ toàn diện, không thể mở khóa điểm hội đồng.',
      );
    }

    let updatedCount = 0;
    for (const ptq of phieuTQs) {
      let diemPhieu = ptq.diemPhieuThamQuan;
      if (!diemPhieu) {
        diemPhieu = await this.diemPhieuRepo.findOne({
          where: { phieu_tham_quan_id: ptq.id },
        });
      }
      if (diemPhieu) {
        diemPhieu.da_khoa_hoi_dong = false;
        diemPhieu.ngay_khoa_hoi_dong = null;
        await this.diemPhieuRepo.save(diemPhieu);
        updatedCount++;
      }
    }

    // Gửi thông báo đến Chủ tịch và Thư ký hội đồng
    try {
      const notif = new ThongBao();
      notif.tieu_de = `[Khoa] Mở khóa điểm Hội đồng: ${board.ten_hoi_dong}`;
      notif.noi_dung = `Khoa đã phê duyệt mở khóa điểm cho Hội đồng "${board.ten_hoi_dong}"${dto.boChuyenId ? ' (cho sinh viên được chỉ định)' : ''}. Lý do: "${dto.lyDo || 'Mở khóa điểm hội đồng'}". Thầy/Cô Chủ tịch & Thư ký vui lòng kiểm tra, chấm lại và thực hiện chốt điểm khi hoàn tất.`;
      notif.nguoi_gui_id = userAccountId || 1;
      notif.doi_tuong_nhan = 'LECTURER';
      notif.loai_thong_bao = 'NhacNho';
      await this.thongBaoRepo.save(notif);
    } catch (e) {
      console.warn('Lỗi gửi thông báo mở khóa Hội đồng:', e);
    }

    return {
      message: `Đã mở khóa điểm hội đồng thành công cho ${targetBoIds.length} sinh viên (${updatedCount} phiếu tham quan).`,
      updatedCount,
    };
  }

  async unlockBoard(boardId: number, lyDo?: string, userAccountId?: number) {
    return this.unlockBoardCouncilGrades(
      { boardId, lyDo: lyDo || 'Mở khóa toàn bộ hội đồng' },
      userAccountId,
    );
  }

  async autoSelectRepresentativeTrips(dksvId: number, manager?: EntityManager) {
    const dksvRepo = manager ? manager.getRepository(DotKienTap_SinhVien) : this.dksvRepo;
    const boRepo = manager ? manager.getRepository(BoChuyenBaoCao) : this.boRepo;
    const phieuRepo = manager ? manager.getRepository(PhieuDangKy) : this.phieuRepo;
    const phieuTQRepo = manager ? manager.getRepository(PhieuThamQuan) : this.phieuTQRepo;
    const diemPhieuRepo = manager ? manager.getRepository(DiemPhieuThamQuan) : this.diemPhieuRepo;
    const baiRepo = manager ? manager.getRepository(BaiThuHoach) : this.baiRepo;

    const dksv = await dksvRepo.findOne({ where: { id: dksvId } });
    if (!dksv) return;

    const exist = await boRepo.findOne({
      where: { dot_kien_tap_sinh_vien_id: dksvId },
    });
    if (exist) return;

    const phieus = await phieuRepo.find({
      where: {
        sinh_vien_id: dksv.sinh_vien_id,
        trang_thai: In(['HopLe', 'DaThamGia']),
      },
      relations: { chuyenThamQuan: true },
    });

    const directPhieus = phieus.filter(
      (p) => p.chuyenThamQuan?.hinh_thuc === 'TrucTiep',
    );
    const onlinePhieus = phieus.filter(
      (p) => p.chuyenThamQuan?.hinh_thuc === 'TrucTuyen',
    );

    if (directPhieus.length < 2 || onlinePhieus.length < 1) {
      return;
    }

    const getTripScore = async (phieuId: number) => {
      const phieuTQ = await phieuTQRepo.findOne({
        where: { phieu_dang_ky_id: phieuId },
      });
      if (!phieuTQ) return 0;
      const ptqId = phieuTQ.id;

      const score = await diemPhieuRepo.findOne({
        where: { phieu_tham_quan_id: ptqId },
      });
      if (!score) return 0;

      const report = await baiRepo.findOne({
        where: { phieu_tham_quan_id: ptqId },
        order: { ngay_nop: 'DESC' },
      });
      const isLate = report?.trang_thai === 'TreHan';

      const prep = Number(score.diem_chuan_bi || 0);
      const reportScore = Number(score.diem_thu_hoach || 0);
      const reportFinal = Math.max(0, reportScore - (isLate ? 1.0 : 0));
      const board = Number(score.diem_hoi_dong_final || 0);
      const bonus = Number(score.diem_cong_final || 0);

      return prep * 0.3 + reportFinal * 0.3 + board * 0.4 + bonus;
    };

    const directScores: any[] = [];
    for (const p of directPhieus) {
      const scoreVal = await getTripScore(p.id);
      directScores.push({ phieu: p, score: scoreVal });
    }
    directScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(a.phieu.chuyenThamQuan.ngay_tham_quan).getTime() -
        new Date(b.phieu.chuyenThamQuan.ngay_tham_quan).getTime()
      );
    });

    const onlineScores: any[] = [];
    for (const p of onlinePhieus) {
      const scoreVal = await getTripScore(p.id);
      onlineScores.push({ phieu: p, score: scoreVal });
    }
    onlineScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(a.phieu.chuyenThamQuan.ngay_tham_quan).getTime() -
        new Date(b.phieu.chuyenThamQuan.ngay_tham_quan).getTime()
      );
    });

    const bo = new BoChuyenBaoCao();
    bo.dot_kien_tap_sinh_vien_id = dksvId;
    const savedBo = await boRepo.save(bo);

    const selected = [
      directScores[0].phieu.id,
      directScores[1].phieu.id,
      onlineScores[0].phieu.id,
    ];

    for (const rId of selected) {
      const phieuTQ = await phieuTQRepo.findOne({
        where: { phieu_dang_ky_id: rId },
      });
      if (phieuTQ) {
        phieuTQ.bo_chuyen_bao_cao_id = savedBo.id;
        await phieuTQRepo.save(phieuTQ);
      }
    }
  }

  private async resolveDotKienTapId(lichOrDotId: number): Promise<number> {
    const dot = await this.dotRepo.findOne({ where: { id: lichOrDotId } });
    if (dot) return dot.id;

    const lich = await this.lichRepo.findOne({ where: { id: lichOrDotId } });
    if (lich) return lich.dot_kien_tap_id;

    throw new NotFoundException('Không tìm thấy đợt hoặc lịch kiến tập');
  }

  async lockAndFinalizeGrades(lichOrDotId: number) {
    const dotKienTapId = await this.resolveDotKienTapId(lichOrDotId);

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const dotRepo = manager.getRepository(DotKienTap);
      const lichRepo = manager.getRepository(LichKienTap);
      const dksvRepo = manager.getRepository(DotKienTap_SinhVien);
      const boRepo = manager.getRepository(BoChuyenBaoCao);
      const phieuTQRepo = manager.getRepository(PhieuThamQuan);
      const diemPhieuRepo = manager.getRepository(DiemPhieuThamQuan);
      const baiRepo = manager.getRepository(BaiThuHoach);
      const svRepo = manager.getRepository(SinhVien);
      const phieuRepo = manager.getRepository(PhieuDangKy);

      // Khóa bi quan (Pessimistic Write Lock) trên Đợt kiến tập để ngăn chặn 2 người quản trị cùng chốt điểm đồng thời
      const dot = await dotRepo.findOne({
        where: { id: dotKienTapId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!dot) {
        throw new NotFoundException('Không tìm thấy đợt kiến tập');
      }
      if (dot.trang_thai === 'DaKhoa') {
        throw new BadRequestException('Đợt kiến tập này đã được khóa điểm trước đó.');
      }

      const lich = await lichRepo.findOne({ where: { id: lichOrDotId } });
      if (lich?.trang_thai === 'DaKhoa') {
        throw new BadRequestException('Đợt/lịch kiến tập này đã được khóa điểm trước đó.');
      }

      // Lấy toàn bộ danh sách đăng ký sinh viên thuộc đợt kiến tập
      const enrollments = await dksvRepo.find({
        where: { dot_kien_tap_id: dotKienTapId },
        relations: { sinhVien: true },
      });

      let lockedCount = 0;

      for (const dksv of enrollments) {
        let bo = await boRepo.findOne({
          where: { dot_kien_tap_sinh_vien_id: dksv.id },
        });
        if (!bo) {
          await this.autoSelectRepresentativeTrips(dksv.id, manager);
          bo = await boRepo.findOne({
            where: { dot_kien_tap_sinh_vien_id: dksv.id },
          });
        }
        if (!bo) {
          dksv.trang_thai = 'KhongDat';
          await dksvRepo.save(dksv);
          continue;
        }

        const mappings = await phieuTQRepo.find({
          where: { bo_chuyen_bao_cao_id: bo.id },
          relations: { phieuDangKy: { chuyenThamQuan: { nhaMay: true } } },
        });

        if (mappings.length !== 3) {
          dksv.trang_thai = 'KhongDat';
          await dksvRepo.save(dksv);
          continue;
        }

        let sumTripScores = 0;
        let hasZeroTrip = false;

        for (const phieuTQ of mappings) {
          let score = await diemPhieuRepo.findOne({
            where: { phieu_tham_quan_id: phieuTQ.id },
          });

          if (!score) {
            score = new DiemPhieuThamQuan();
            score.phieu_tham_quan_id = phieuTQ.id;
            score = await diemPhieuRepo.save(score);
          }

          const isTuDo = phieuTQ.phieuDangKy?.chuyenThamQuan?.cach_to_chuc === 'TuDo';
          const diemThuHoach = Number(score.diem_thu_hoach ?? 0);
          // Đối với chuyến tự do: nếu không có GVDĐ chấm điểm chuẩn bị thì lấy điểm thu hoạch làm cơ sở
          const diemChuanBi = isTuDo
            ? Number(score.diem_chuan_bi ?? diemThuHoach)
            : Number(score.diem_chuan_bi ?? 0);
          const diemBaoCao = Number(score.diem_hoi_dong_final ?? 0);
          const diemCong = Number(score.diem_cong_final ?? 0);

          const report = await baiRepo.findOne({
            where: { phieu_tham_quan_id: phieuTQ.id },
            order: { ngay_nop: 'DESC' },
          });

          const tripDate = new Date(
            phieuTQ.phieuDangKy.chuyenThamQuan.ngay_tham_quan,
          );
          let diffDays = 999;
          if (report) {
            const diffTime = report.ngay_nop.getTime() - tripDate.getTime();
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }

          let tripScore =
            diemChuanBi * 0.3 + diemThuHoach * 0.3 + diemBaoCao * 0.4 + diemCong;

          // Trừ điểm nộp trễ bài thu hoạch
          if (diffDays > 20) {
            tripScore = 0;
          } else if (diffDays > 10) {
            tripScore = Math.max(0, tripScore - 1.0);
          }

          tripScore = Math.min(10.0, tripScore);

          if (tripScore === 0) {
            hasZeroTrip = true;
          }

          // Cập nhật điểm và khóa sổ: chỉ cập nhật đúng các cột mà role_quantrikhoa được phân quyền (tuân thủ RBAC)
          await diemPhieuRepo.update(score.id, {
            diem_tong_chuyen: Number(tripScore.toFixed(2)),
            da_khoa: true,
            ngay_khoa: new Date(),
          });

          if (tripScore >= 5.0) {
            phieuTQ.phieuDangKy.trang_thai = 'HoanThanh';
          } else {
            phieuTQ.phieuDangKy.trang_thai = 'KhongDat';
          }
          await phieuRepo.save(phieuTQ.phieuDangKy);

          sumTripScores += tripScore;
        }

        // Thống kê số lượng nhà máy theo quy chế HUIT: >= 2 offline, >= 1 online, >= 3 không trùng lặp
        const distinctFactoryIds = new Set(
          mappings
            .map(
              (m) =>
                m.phieuDangKy?.chuyenThamQuan?.nha_may_id ||
                m.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may,
            )
            .filter(Boolean),
        );
        const so_nm_off = mappings.filter(
          (m) => m.phieuDangKy?.chuyenThamQuan?.hinh_thuc === 'TrucTiep',
        ).length;
        const so_nm_onl = mappings.filter(
          (m) => m.phieuDangKy?.chuyenThamQuan?.hinh_thuc === 'TrucTuyen',
        ).length;
        const du_dieu_kien_nm =
          so_nm_off >= 2 && so_nm_onl >= 1 && distinctFactoryIds.size >= 3;

        const finalScore = Number((sumTripScores / 3).toFixed(2));

        // Quy tắc chuẩn HUIT (Sheet Kết quả duyệt): Phải đủ ĐK nhà máy, không chuyến 0 điểm, và điểm tổng kết >= 5.0
        if (hasZeroTrip || !du_dieu_kien_nm || finalScore < 5.0) {
          dksv.trang_thai = 'KhongDat';
          await svRepo.update(dksv.sinh_vien_id, { hoc_lai: true });
        } else {
          dksv.trang_thai = 'Dat';
          await svRepo.update(dksv.sinh_vien_id, { hoc_lai: false });
        }

        await dksvRepo.save(dksv);

        // Cập nhật đồng bộ toàn bộ các chuyến của sinh viên trong đợt này
        const allPdks = await phieuRepo.find({
          where: [
            {
              sinh_vien_id: dksv.sinh_vien_id,
              chuyenThamQuan: {
                lichKienTap: { dot_kien_tap_id: dksv.dot_kien_tap_id },
              },
            },
            {
              sinh_vien_id: dksv.sinh_vien_id,
              chuyenThamQuan: {
                lich_kien_tap_id: IsNull(),
              },
            },
          ],
          relations: { phieuThamQuan: true },
        });

        for (const p of allPdks) {
          // Chỉ cập nhật các phiếu hợp lệ/đang thực hiện/đã tham gia, KHÔNG ghi đè lên phiếu đã Hủy (DaHuy) hoặc Bị loại (BiLoai)
          if (p.trang_thai === 'DaHuy' || p.trang_thai === 'BiLoai') {
            continue;
          }
          if (dksv.trang_thai === 'Dat') {
            p.trang_thai = 'HoanThanh';
          } else {
            p.trang_thai = 'KhongDat';
            if (p.phieuThamQuan) {
              p.phieuThamQuan.trang_thai = 'DaHuy';
              await phieuTQRepo.save(p.phieuThamQuan);
            }
          }
          await phieuRepo.save(p);
        }

        lockedCount++;
      }

      // Cập nhật trạng thái TẤT CẢ Lịch Kiến Tập thuộc đợt này thành 'DaKhoa'
      const allLiches = await lichRepo.find({
        where: { dot_kien_tap_id: dotKienTapId },
      });
      for (const l of allLiches) {
        if (!['DaHuy', 'TuChoi'].includes(l.trang_thai)) {
          l.trang_thai = 'DaKhoa';
          await lichRepo.save(l);
        }
      }

      // Cập nhật trạng thái DotKienTap cha
      dot.trang_thai = 'DaKhoa';
      await dotRepo.save(dot);
      await this.updateDotKienTapStatus(dotKienTapId, manager);

      return {
        message: `Đã khóa điểm và tổng kết học phần thành công cho ${lockedCount} sinh viên.`,
      };
    });
  }

  // Lấy trạng thái nộp điểm chuẩn bị của các chuyến tham quan thuộc đợt/lịch kiến tập (cho Tab GVDĐ)
  async getTripGradingStatuses(lichOrDotId: number) {
    const dotKienTapId = await this.resolveDotKienTapId(lichOrDotId);

    // Lấy tất cả các lịch thuộc cùng đợt kiến tập để bao quát toàn bộ các chuyến đi trong đợt
    const liches = await this.lichRepo.find({
      where: { dot_kien_tap_id: dotKienTapId },
    });
    const lichIds = liches.length > 0 ? liches.map((l) => l.id) : [];

    const trips =
      lichIds.length > 0
        ? await this.chuyenRepo.find({
            where: { lich_kien_tap_id: In(lichIds) },
            relations: {
              nhaMay: true,
              lichKienTap: true,
            },
            order: { ngay_tham_quan: 'ASC' },
          })
        : [];

    return Promise.all(
      trips.map(async (t) => {
        const lead = await this.danDoanRepo.findOne({
          where: { chuyen_tham_quan_id: t.id },
          relations: { giangVien: true },
        });
        const gvdd = lead?.giangVien || null;

        const regs = await this.phieuRepo.find({
          where: {
            chuyen_tham_quan_id: t.id,
            trang_thai: In(['HopLe', 'ChoDuyet', 'DaThamGia', 'HoanThanh']),
          },
        });
        const regIds = regs.map((r) => r.id);
        let daKhoaChuanBi = false;
        let ngayKhoaChuanBi: Date | null = null;
        let soSvCoDiem = 0;

        if (regIds.length > 0) {
          const ptqs = await this.phieuTQRepo.find({
            where: { phieu_dang_ky_id: In(regIds) },
          });
          const ptqIds = ptqs.map((p) => p.id);
          if (ptqIds.length > 0) {
            const diems = await this.diemPhieuRepo.find({
              where: { phieu_tham_quan_id: In(ptqIds) },
            });
            soSvCoDiem = diems.filter(
              (d) => d.diem_chuan_bi !== null && d.diem_chuan_bi !== undefined,
            ).length;
            if (diems.length === ptqIds.length && diems.every((d) => d.da_khoa_chuan_bi)) {
              daKhoaChuanBi = true;
              ngayKhoaChuanBi = diems[0]?.ngay_khoa_chuan_bi || null;
            }
          }
        }

        return {
          id: t.id,
          chuyen_id: t.id,
          ma_chuyen: `CTQ-${String(t.id).padStart(3, '0')}`,
          ten_nha_may: t.nhaMay?.ten_nha_may || 'Chưa rõ',
          hinh_thuc: t.hinh_thuc,
          ngay_tham_quan: t.ngay_tham_quan,
          ten_lich: t.lichKienTap?.ten_lich || '',
          lich_kien_tap_id: t.lich_kien_tap_id,
          dot_kien_tap_id: dotKienTapId,
          so_luong_sv: regs.length,
          so_sv_co_diem: soSvCoDiem,
          gvdd: gvdd
            ? {
                id: gvdd.id,
                ma_gv: gvdd.ma_gv,
                ma_giang_vien: gvdd.ma_gv,
                ho_ten: gvdd.ho_ten,
                so_dien_thoai: gvdd.sdt || null,
              }
            : null,
          da_khoa_chuan_bi: t.cach_to_chuc === 'TuDo' ? true : daKhoaChuanBi,
          ngay_khoa_chuan_bi: ngayKhoaChuanBi,
          cach_to_chuc: t.cach_to_chuc,
        };
      }),
    );
  }

  // Lấy trạng thái nộp điểm bài thu hoạch của các GVHD thuộc đợt (cho Tab GVHD)
  async getSupervisorGradingStatuses(lichOrDotId: number) {
    const dotKienTapId = await this.resolveDotKienTapId(lichOrDotId);

    const assignments = await this.pcGvhdRepo.find({
      where: {
        trang_thai: 'DangHoatDong',
        dotKienTapSinhVien: { dot_kien_tap_id: dotKienTapId },
      },
      relations: {
        giangVien: true,
        dotKienTapSinhVien: { sinhVien: true },
      },
    });

    const gvMap = new Map<number, {
      giangVien: any;
      studentIds: number[];
    }>();

    for (const a of assignments) {
      if (!a.giangVien) continue;
      const gvId = a.giang_vien_id;
      if (!gvMap.has(gvId)) {
        gvMap.set(gvId, {
          giangVien: a.giangVien,
          studentIds: [],
        });
      }
      if (a.dotKienTapSinhVien?.sinh_vien_id) {
        gvMap.get(gvId)!.studentIds.push(a.dotKienTapSinhVien.sinh_vien_id);
      }
    }

    const result: {
      giang_vien_id?: number;
      ho_ten?: string;
      ma_giang_vien?: string;
      bo_mon?: string;
      email?: string | null;
      giangVien: {
        id: number;
        ma_gv: string;
        ho_ten: string;
        bo_mon: string;
      };
      so_sv_huong_dan: number;
      so_luong_sv?: number;
      so_bai_da_cham: number;
      so_sv_da_cham?: number;
      tong_so_bai: number;
      da_khoa_thu_hoach: boolean;
      ngay_khoa_thu_hoach: Date | null;
      dot_kien_tap_id?: number;
    }[] = [];

    for (const [gvId, data] of gvMap.entries()) {
      const { giangVien, studentIds } = data;
      let totalReports = 0;
      let gradedReports = 0;
      let fullyGradedStudentsCount = 0;
      let daKhoaThuHoach = false;
      let ngayKhoaThuHoach: Date | null = null;

      if (studentIds.length > 0) {
        const qb = this.baiRepo
          .createQueryBuilder('baiThu')
          .leftJoinAndSelect('baiThu.phieuThamQuan', 'phieuTQ')
          .leftJoinAndSelect('phieuTQ.phieuDangKy', 'phieu')
          .leftJoinAndSelect('phieu.chuyenThamQuan', 'chuyen')
          .leftJoinAndSelect('chuyen.lichKienTap', 'lich')
          .leftJoinAndSelect('phieuTQ.diemPhieuThamQuan', 'diem')
          .where('phieu.sinh_vien_id IN (:...studentIds)', { studentIds });

        if (dotKienTapId) {
          qb.andWhere('lich.dot_kien_tap_id = :dotKienTapId', { dotKienTapId });
        }

        const reports = await qb.getMany();

        totalReports = reports.length;
        const graded = reports.filter(
          (r) =>
            r.phieuThamQuan?.diemPhieuThamQuan &&
            r.phieuThamQuan.diemPhieuThamQuan.diem_thu_hoach !== null &&
            r.phieuThamQuan.diemPhieuThamQuan.diem_thu_hoach !== undefined,
        );
        gradedReports = graded.length;

        // Nhóm bài nộp theo sinh viên để tính số sinh viên đã được chấm đủ điểm
        const studentReportsMap = new Map<number, any[]>();
        for (const r of reports) {
          const svId = r.phieuThamQuan?.phieuDangKy?.sinh_vien_id;
          if (svId) {
            if (!studentReportsMap.has(svId)) {
              studentReportsMap.set(svId, []);
            }
            studentReportsMap.get(svId)!.push(r);
          }
        }

        for (const [svId, sReports] of studentReportsMap.entries()) {
          if (
            sReports.length > 0 &&
            sReports.every(
              (r) =>
                r.phieuThamQuan?.diemPhieuThamQuan &&
                r.phieuThamQuan.diemPhieuThamQuan.diem_thu_hoach !== null &&
                r.phieuThamQuan.diemPhieuThamQuan.diem_thu_hoach !== undefined,
            )
          ) {
            fullyGradedStudentsCount++;
          }
        }

        if (totalReports > 0 && reports.every((r) => r.phieuThamQuan?.diemPhieuThamQuan?.da_khoa_thu_hoach)) {
          daKhoaThuHoach = true;
          ngayKhoaThuHoach = reports[0]?.phieuThamQuan?.diemPhieuThamQuan?.ngay_khoa_thu_hoach || null;
        }
      }

      result.push({
        giang_vien_id: giangVien.id,
        ho_ten: giangVien.ho_ten,
        ma_giang_vien: giangVien.ma_gv,
        bo_mon: giangVien.bo_mon || 'Khoa CNTT',
        email: giangVien.email || null,
        giangVien: {
          id: giangVien.id,
          ma_gv: giangVien.ma_gv,
          ho_ten: giangVien.ho_ten,
          bo_mon: giangVien.bo_mon || 'Khoa CNTT',
        },
        so_sv_huong_dan: studentIds.length,
        so_luong_sv: studentIds.length,
        so_bai_da_cham: gradedReports,
        so_sv_da_cham: fullyGradedStudentsCount,
        tong_so_bai: totalReports,
        da_khoa_thu_hoach: daKhoaThuHoach,
        ngay_khoa_thu_hoach: ngayKhoaThuHoach,
        dot_kien_tap_id: dotKienTapId,
      });
    }

    return result;
  }

  // Mở khóa điểm chuẩn bị của chuyến tham quan (GVDĐ)
  async unlockTripPrepGrades(tripId: number, lyDo: string, userAccountId?: number) {
    const trip = await this.chuyenRepo.findOne({
      where: { id: tripId },
      relations: {
        lichKienTap: true,
        nhaMay: true,
      },
    });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

    if (trip.lichKienTap?.trang_thai === 'DaKhoa') {
      throw new BadRequestException(
        'Đợt kiến tập đã được khóa sổ toàn diện, không thể mở khóa điểm nữa.',
      );
    }
    if (trip.lichKienTap?.dot_kien_tap_id) {
      const dot = await this.dotRepo.findOne({
        where: { id: trip.lichKienTap.dot_kien_tap_id },
      });
      if (dot?.trang_thai === 'DaKhoa') {
        throw new BadRequestException(
          'Đợt kiến tập đã được khóa sổ toàn diện, không thể mở khóa điểm nữa.',
        );
      }
    }

    const regs = await this.phieuRepo.find({
      where: { chuyen_tham_quan_id: tripId },
    });
    const regIds = regs.map((r) => r.id);
    if (regIds.length > 0) {
      const ptqs = await this.phieuTQRepo.find({
        where: { phieu_dang_ky_id: In(regIds) },
      });
      const ptqIds = ptqs.map((p) => p.id);
      if (ptqIds.length > 0) {
        await this.diemPhieuRepo
          .createQueryBuilder()
          .update(DiemPhieuThamQuan)
          .set({ da_khoa_chuan_bi: false, ngay_khoa_chuan_bi: null })
          .where('phieu_tham_quan_id IN (:...ptqIds)', { ptqIds })
          .execute();
      }
    }

    // Gửi thông báo đến GVDĐ
    try {
      const notif = new ThongBao();
      notif.tieu_de = `[Khoa] Mở khóa bảng điểm chuyến tham quan: ${trip.nhaMay?.ten_nha_may || ''}`;
      notif.noi_dung = `Khoa đã phê duyệt mở khóa bảng điểm chuyến tham quan theo đơn đề nghị. Lý do: "${lyDo}". Thầy/Cô vui lòng cập nhật lại điểm chuẩn bị & điểm cộng, sau đó bấm "Khóa & Nộp điểm chuyến đi" để hoàn tất.`;
      notif.nguoi_gui_id = userAccountId || 1;
      notif.doi_tuong_nhan = 'LECTURER';
      notif.loai_thong_bao = 'NhacNho';
      await this.thongBaoRepo.save(notif);
    } catch (e) {
      console.warn('Lỗi gửi thông báo mở khóa GVDĐ:', e);
    }

    return { message: 'Đã mở khóa điểm chuyến tham quan thành công.' };
  }

  // Mở khóa điểm bài thu hoạch (GVHD)
  async unlockLecturerReportGrades(
    dotKienTapId: number,
    giangVienId: number,
    lyDo: string,
    userAccountId?: number,
  ) {
    const dot = await this.dotRepo.findOne({
      where: { id: dotKienTapId },
    });
    if (dot?.trang_thai === 'DaKhoa') {
      throw new BadRequestException(
        'Đợt kiến tập đã được khóa sổ toàn diện, không thể mở khóa điểm nữa.',
      );
    }

    const liches = await this.lichRepo.find({
      where: { dot_kien_tap_id: dotKienTapId },
    });
    if (liches.some((l) => l.trang_thai === 'DaKhoa')) {
      throw new BadRequestException(
        'Đợt kiến tập đã được khóa sổ toàn diện, không thể mở khóa điểm nữa.',
      );
    }

    const assignments = await this.pcGvhdRepo.find({
      where: {
        giang_vien_id: giangVienId,
        trang_thai: 'DangHoatDong',
        dotKienTapSinhVien: { dot_kien_tap_id: dotKienTapId },
      },
      relations: { dotKienTapSinhVien: true },
    });

    const svIds = assignments.map((a) => a.dotKienTapSinhVien.sinh_vien_id);
    if (svIds.length > 0) {
      const reports = await this.baiRepo
        .createQueryBuilder('baiThu')
        .leftJoinAndSelect('baiThu.phieuThamQuan', 'phieuTQ')
        .leftJoinAndSelect('phieuTQ.phieuDangKy', 'phieu')
        .where('phieu.sinh_vien_id IN (:...svIds)', { svIds })
        .getMany();

      const ptqIds = reports.map((r) => r.phieu_tham_quan_id).filter(Boolean);
      if (ptqIds.length > 0) {
        await this.diemPhieuRepo
          .createQueryBuilder()
          .update(DiemPhieuThamQuan)
          .set({ da_khoa_thu_hoach: false, ngay_khoa_thu_hoach: null })
          .where('phieu_tham_quan_id IN (:...ptqIds)', { ptqIds })
          .execute();
      }
    }

    // Gửi thông báo đến GVHD
    try {
      const notif = new ThongBao();
      notif.tieu_de = `[Khoa] Mở khóa bảng điểm bài thu hoạch`;
      notif.noi_dung = `Khoa đã phê duyệt mở khóa bảng điểm bài thu hoạch theo đơn đề nghị. Lý do: "${lyDo}". Thầy/Cô vui lòng cập nhật lại điểm bài thu hoạch và bấm "Khóa & Nộp bảng điểm thu hoạch" để hoàn tất.`;
      notif.nguoi_gui_id = userAccountId || 1;
      notif.doi_tuong_nhan = 'LECTURER';
      notif.loai_thong_bao = 'NhacNho';
      await this.thongBaoRepo.save(notif);
    } catch (e) {
      console.warn('Lỗi gửi thông báo mở khóa GVHD:', e);
    }

    return { message: 'Đã mở khóa điểm bài thu hoạch thành công.' };
  }

  // Lấy danh sách giảng viên chưa nộp điểm (để cảnh báo khi khóa đợt)
  async getUnsubmittedLecturers(lichOrDotId: number) {
    const unsubmitted: {
      ten: string;
      ten_giang_vien: string;
      vai_tro: string;
      chi_tiet: string;
    }[] = [];

    // 1. Kiểm tra GVDĐ
    const tripStatuses = await this.getTripGradingStatuses(lichOrDotId);
    for (const t of tripStatuses) {
      if (t.cach_to_chuc === 'TuDo') continue; // Miễn kiểm tra điểm chuẩn bị đối với chuyến tự do
      if (!t.da_khoa_chuan_bi && t.gvdd) {
        unsubmitted.push({
          ten: t.gvdd.ho_ten,
          ten_giang_vien: t.gvdd.ho_ten,
          vai_tro: 'Giảng viên dẫn đoàn',
          chi_tiet: `Chuyến ${t.ten_nha_may} (${t.ma_chuyen})`,
        });
      }
    }

    // 2. Kiểm tra GVHD
    const supervisorStatuses = await this.getSupervisorGradingStatuses(lichOrDotId);
    for (const s of supervisorStatuses) {
      if (!s.da_khoa_thu_hoach) {
        if (s.tong_so_bai === 0) continue; // Nếu sinh viên chưa nộp bài nào thì GVHD không bị tính là nợ điểm
        const hoTen = s.giangVien?.ho_ten || s.ho_ten || '';
        unsubmitted.push({
          ten: hoTen,
          ten_giang_vien: hoTen,
          vai_tro: 'Giảng viên hướng dẫn',
          chi_tiet: `Phụ trách ${s.so_sv_huong_dan} SV (${s.so_sv_da_cham}/${s.so_sv_huong_dan} SV đã chấm xong)`,
        });
      }
    }

    // 3. Kiểm tra Hội đồng chấm báo cáo
    // Quy tắc: Chỉ kiểm tra da_khoa_hoi_dong = true đối với các PhieuThamQuan nằm trong bộ chuyến báo cáo (bo_chuyen_bao_cao_id IS NOT NULL và gắn với BoChuyenBaoCao)
    const dotKienTapId = await this.resolveDotKienTapId(lichOrDotId);
    const boards = await this.hdRepo.find({
      where: { dot_kien_tap_id: dotKienTapId },
    });

    for (const b of boards) {
      const boChuyens = await this.boRepo.find({
        where: { hoi_dong_id: b.id },
      });
      if (boChuyens.length === 0) continue;

      const boIds = boChuyens.map((bo) => bo.id);
      const phieuTQs = await this.phieuTQRepo.find({
        where: { bo_chuyen_bao_cao_id: In(boIds) },
        relations: { diemPhieuThamQuan: true },
      });

      const unsubmittedPhieus = phieuTQs.filter(
        (p) => !p.diemPhieuThamQuan?.da_khoa_hoi_dong,
      );

      if (unsubmittedPhieus.length > 0) {
        const chuTich = await this.hdTvRepo.findOne({
          where: { hoi_dong_id: b.id, vai_tro: 'ChuTich' },
          relations: { giangVien: true },
        });

        const chuTichName = chuTich?.giangVien?.ho_ten || 'Chưa phân công Chủ tịch';
        unsubmitted.push({
          ten: chuTichName,
          ten_giang_vien: chuTichName,
          vai_tro: 'Chủ tịch Hội đồng',
          chi_tiet: `Hội đồng "${b.ten_hoi_dong}" còn ${unsubmittedPhieus.length}/${phieuTQs.length} phiếu báo cáo chưa chốt điểm`,
        });
      }
    }

    return unsubmitted;
  }

  // Kiểm tra điều kiện có thể khóa sổ toàn diện đợt/lịch kiến tập
  async checkCanLockSchedule(lichOrDotId: number) {
    const unsubmitted = await this.getUnsubmittedLecturers(lichOrDotId);
    return {
      canLock: unsubmitted.length === 0,
      unsubmitted,
    };
  }

  private getBlacklistReasonLabel(reason?: string): string {
    switch (reason) {
      case 'KhongDongPhi':
        return 'Cấm thi - Không nộp lệ phí tham quan';
      case 'DangKyKhongThamGia':
        return 'Cấm thi - Đăng ký nhưng vắng mặt không phép';
      case 'HuyKhongMinhChung':
        return 'Cấm thi - Hủy chuyến không có minh chứng';
      default:
        return reason || 'Cấm thi - Vi phạm quy chế kiến tập';
    }
  }

  async getRetakeStudentsReport(dotKienTapId?: number) {
    // 1. Lấy danh sách sinh viên các khóa cũ có hoc_lai = true (chưa đạt học phần kiến tập)
    const svDebt = await this.svRepo.find({
      where: { hoc_lai: true },
      relations: { khoaHoc: true },
      order: {
        khoa_hoc_id: 'DESC',
        mssv: 'ASC',
      },
    });

    if (svDebt.length === 0) return [];

    const svIds = svDebt.map((s) => s.id);

    // 2. Lấy thông tin đăng ký đợt kiến tập (nếu sinh viên đã đăng ký học lại trong đợt nào)
    const enrollments = await this.dksvRepo.find({
      where: { sinh_vien_id: In(svIds) },
      relations: { dotKienTap: true },
    });

    const enrollMap = new Map<number, any>();
    enrollments.forEach((e) => {
      if (!enrollMap.has(e.sinh_vien_id) || e.lan_dang_ky > 1) {
        enrollMap.set(e.sinh_vien_id, e);
      }
    });

    // 3. Chuẩn hóa kết quả trả về cho danh sách sinh viên nợ môn
    return svDebt.map((sv) => {
      const en = enrollMap.get(sv.id);
      return {
        id: sv.id,
        mssv: sv.mssv,
        ho_ten: sv.ho_ten,
        lop: sv.ten_lop,
        ten_lop: sv.ten_lop,
        email: sv.email,
        sdt: sv.sdt,
        khoaHoc: sv.khoaHoc,
        phan_loai: 'NoMon',
        phan_loai_label: 'Nợ môn',
        ly_do:
          en && en.lan_dang_ky > 1
            ? `Đã đăng ký học lại (Lần ${en.lan_dang_ky})`
            : 'Nợ học phần kiến tập (Cần học lại)',
        lan_dang_ky: en?.lan_dang_ky || 1,
        dot_kien_tap: en?.dotKienTap?.ten_dot || null,
      };
    });
  }

  async getFinalResultsReport(lichOrDotId: number) {
    const lich = await this.lichRepo.findOne({ where: { id: lichOrDotId } });
    const dotKienTapId = lich ? lich.dot_kien_tap_id : lichOrDotId;

    const enrollments = await this.dksvRepo.find({
      where: { dot_kien_tap_id: dotKienTapId },
      relations: {
        sinhVien: { khoaHoc: true },
      },
    });

    if (enrollments.length === 0) return [];

    return Promise.all(
      enrollments.map(async (e) => {
        const bo = await this.boRepo.findOne({
          where: { dot_kien_tap_sinh_vien_id: e.id },
        });

        let diemTongKet: number | null = null;
        let lastDiem: any = null;
        if (bo) {
          const ptqs = await this.phieuTQRepo.find({
            where: { bo_chuyen_bao_cao_id: bo.id },
            relations: { diemPhieuThamQuan: true },
          });
          const validScores = ptqs
            .map((p) => p.diemPhieuThamQuan?.diem_tong_chuyen)
            .filter((s) => s !== null && s !== undefined);
          if (validScores.length === 3) {
            const sum = validScores.reduce((acc, curr) => acc + Number(curr), 0);
            diemTongKet = Number((sum / 3).toFixed(2));
          }
          if (ptqs.length > 0 && ptqs[0].diemPhieuThamQuan) {
            lastDiem = ptqs[0].diemPhieuThamQuan;
          }
        }

        return {
          ...e,
          diem_chuan_bi: lastDiem?.diem_chuan_bi ?? null,
          diem_thu_hoach: lastDiem?.diem_thu_hoach ?? null,
          diem_hoi_dong_final: lastDiem?.diem_hoi_dong_final ?? null,
          diem_cong_final: lastDiem?.diem_cong_final ?? null,
          diem_tong_chuyen: diemTongKet,
          diem_tong_ket: diemTongKet,
          ket_qua: e.trang_thai,
          trang_thai: e.trang_thai,
        };
      }),
    );
  }

  async getVisitedStudentsReport(
    lichKienTapId?: number,
    dotKienTapId?: number,
  ) {
    let studentIdsInDot: number[] = [];
    if (dotKienTapId && !lichKienTapId) {
      const enrollments = await this.dksvRepo.find({
        where: { dot_kien_tap_id: dotKienTapId },
        select: { sinh_vien_id: true },
      });
      studentIdsInDot = enrollments.map(e => e.sinh_vien_id);
      if (studentIdsInDot.length === 0) return [];
    }

    const whereCondition: any = { trang_thai: In(['HopLe', 'HoanThanh']) };
    if (lichKienTapId) {
      whereCondition.chuyenThamQuan = { lich_kien_tap_id: lichKienTapId };
    } else if (dotKienTapId) {
      whereCondition.sinh_vien_id = In(studentIdsInDot);
    }

    const phieus = await this.phieuRepo.find({
      where: whereCondition,
      relations: {
        chuyenThamQuan: true,
        sinhVien: { khoaHoc: true },
      },
    });

    const svMap = new Map();
    phieus.forEach((p) => {
      if (p.sinhVien) {
        if (!svMap.has(p.sinhVien.id)) {
          svMap.set(p.sinhVien.id, { ...p.sinhVien, visitsCount: 0 });
        }
        svMap.get(p.sinhVien.id).visitsCount++;
      }
    });
    return Array.from(svMap.values());
  }

  async getNotVisitedStudentsReport(dotKienTapId?: number) {
    const whereCondition: any = {};
    if (dotKienTapId) {
      whereCondition.dot_kien_tap_id = dotKienTapId;
    }
    const enrollments = await this.dksvRepo.find({
      where: whereCondition,
      relations: {
        sinhVien: { khoaHoc: true },
      },
    });

    const visitedStudents = await this.getVisitedStudentsReport(
      undefined,
      dotKienTapId,
    );
    const visitedSet = new Set(visitedStudents.map((sv) => sv.id));

    const notVisited: any[] = [];
    const seen = new Set();
    for (const en of enrollments) {
      if (
        en.sinhVien &&
        !visitedSet.has(en.sinhVien.id) &&
        !seen.has(en.sinhVien.id)
      ) {
        notVisited.push(en.sinhVien);
        seen.add(en.sinhVien.id);
      }
    }
    return notVisited;
  }

  async getEligibleStudentsReport(
    lichKienTapId?: number,
    dotKienTapId?: number,
  ) {
    let studentIdsInDot: number[] = [];
    if (dotKienTapId && !lichKienTapId) {
      const enrollments = await this.dksvRepo.find({
        where: { dot_kien_tap_id: dotKienTapId },
        select: { sinh_vien_id: true },
      });
      studentIdsInDot = enrollments.map((e) => e.sinh_vien_id);
      if (studentIdsInDot.length === 0) return [];
    }

    const whereCondition: any = { trang_thai: In(['HopLe', 'HoanThanh']) };
    if (lichKienTapId) {
      whereCondition.chuyenThamQuan = { lich_kien_tap_id: lichKienTapId };
    } else if (dotKienTapId) {
      whereCondition.sinh_vien_id = In(studentIdsInDot);
    }

    const phieus = await this.phieuRepo.find({
      where: whereCondition,
      relations: {
        chuyenThamQuan: true,
        sinhVien: { khoaHoc: true },
      },
    });

    const svStats = new Map();
    phieus.forEach((p) => {
      if (p.sinhVien && p.chuyenThamQuan) {
        const svId = p.sinhVien.id;
        if (!svStats.has(svId)) {
          svStats.set(svId, { sv: p.sinhVien, direct: 0, online: 0 });
        }
        const stats = svStats.get(svId);
        if (p.chuyenThamQuan.hinh_thuc === 'TrucTiep') stats.direct++;
        if (p.chuyenThamQuan.hinh_thuc === 'TrucTuyen') stats.online++;
      }
    });

    const eligibleSvIds: number[] = [];
    for (const stats of svStats.values()) {
      if (stats.direct >= 2 && stats.online >= 1) {
        eligibleSvIds.push(stats.sv.id);
      }
    }

    if (eligibleSvIds.length === 0) return [];

    // 1. Lấy thông tin Hội đồng phân công từ BoChuyenBaoCao
    const boChuyens = await this.boRepo.find({
      where: {
        dotKienTapSinhVien: {
          sinh_vien_id: In(eligibleSvIds),
          ...(dotKienTapId ? { dot_kien_tap_id: dotKienTapId } : {}),
        },
      },
      relations: {
        hoiDong: true,
        dotKienTapSinhVien: true,
      },
    });

    const boMap = new Map();
    boChuyens.forEach((b) => {
      if (b.dotKienTapSinhVien) {
        boMap.set(b.dotKienTapSinhVien.sinh_vien_id, b.hoiDong);
      }
    });

    // 2. Lấy GVHD từ PhanCongGVHD
    const phanCongs = await this.pcGvhdRepo.find({
      where: {
        dotKienTapSinhVien: {
          sinh_vien_id: In(eligibleSvIds),
          ...(dotKienTapId ? { dot_kien_tap_id: dotKienTapId } : {}),
        },
        trang_thai: 'DangHoatDong',
      },
      relations: {
        giangVien: true,
        dotKienTapSinhVien: true,
      },
    });

    const gvhdMap = new Map();
    phanCongs.forEach((pc) => {
      if (pc.dotKienTapSinhVien && pc.giangVien) {
        gvhdMap.set(pc.dotKienTapSinhVien.sinh_vien_id, pc.giangVien.ho_ten);
      }
    });

    // 3. Đếm số bài nộp thu hoạch qua PhieuThamQuan -> BaiThuHoach
    const phieuTQs = await this.phieuTQRepo.find({
      where: {
        phieuDangKy: {
          sinh_vien_id: In(eligibleSvIds),
        },
      },
      relations: {
        phieuDangKy: true,
        baiThuHoach: true,
      },
    });

    const submittedCountMap = new Map();
    phieuTQs.forEach((ptq) => {
      if (ptq.phieuDangKy && ptq.baiThuHoach) {
        const svId = ptq.phieuDangKy.sinh_vien_id;
        submittedCountMap.set(svId, (submittedCountMap.get(svId) || 0) + 1);
      }
    });

    const eligible: any[] = [];
    for (const stats of svStats.values()) {
      if (stats.direct >= 2 && stats.online >= 1) {
        const svId = stats.sv.id;
        const hd = boMap.get(svId);
        const submittedCount = submittedCountMap.get(svId) || 0;
        eligible.push({
          ...stats.sv,
          so_nm_off: stats.direct,
          so_nm_onl: stats.online,
          tong_nm: stats.direct + stats.online,
          gvhd: gvhdMap.get(svId) || 'Chưa phân công',
          hoi_dong: hd ? hd.ten_hoi_dong : null,
          hoi_dong_id: hd ? hd.id : null,
          dia_diem_hd: hd ? hd.dia_diem : null,
          ngay_bao_cao_hd: hd ? hd.ngay_bao_cao : null,
          so_bai_nop: submittedCount,
          hasSubmitted: submittedCount > 0,
          isDuDieuKien: true,
        });
      }
    }
    return eligible;
  }

  // Dashboard overview stats
  async getDashboardStats() {
    try {
      const studentCount =
        (await this.dksvRepo.count()) || (await this.svRepo.count());
    const lecturerCount = await this.gvRepo.count();
    const factoryCount = await this.nhaMayRepo.count();
    const campaignCount = await this.dotRepo.count();
    const scheduleCount = await this.lichRepo.count();
    const tripCount = await this.chuyenRepo.count();

    const pendingCancelCount = await this.huyRepo.count({
      where: { trang_thai_duyet: 'ChoDuyet' },
    });

    const pendingRefundCount = await this.hoanPhiRepo.count({
      where: { trang_thai: 'ChoXuLy' },
    });

    const pendingProposalCount = await this.deXuatRepo.count({
      where: { trang_thai_duyet: 'ChoDuyet' },
    });

    const pendingActionCount = pendingCancelCount + pendingRefundCount;

    // Thống kê sinh viên theo Khóa học
    const khoas = await this.khoaHocRepo.find();
    const distributionData: any[] = [];
    for (const kh of khoas) {
      const count = await this.svRepo.count({ where: { khoa_hoc_id: kh.id } });
      if (count > 0) {
        distributionData.push({ name: kh.ten_khoa_hoc, value: count });
      }
    }

    // Timeline hôm nay/sắp tới
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chuyens = await this.chuyenRepo.find({
      where: {
        ngay_tham_quan: MoreThanOrEqual(today),
      },
      relations: {
        nhaMay: true,
      },
      order: { ngay_tham_quan: 'ASC' },
      take: 10,
    });

    const timeline = await Promise.all(
      chuyens.map(async (chuyen) => {
        const tripDate = new Date(chuyen.ngay_tham_quan);
        const isToday =
          tripDate.getFullYear() === today.getFullYear() &&
          tripDate.getMonth() === today.getMonth() &&
          tripDate.getDate() === today.getDate();

        let status = isToday ? 'Hôm nay' : 'Sắp diễn ra';
        let statusColor = isToday
          ? 'bg-[#89B449] text-white'
          : 'bg-[#DBD468]/30 text-slate-800 border border-[#DBD468]/60';

        if (
          chuyen.trang_thai === 'DaDienRa' ||
          chuyen.trang_thai === 'HoanThanh'
        ) {
          status = 'Đã diễn ra';
          statusColor = 'bg-slate-100 text-slate-500 border border-slate-200';
        }

        const studentCount = await this.phieuRepo.count({
          where: {
            chuyen_tham_quan_id: chuyen.id,
            trang_thai: In(['HopLe', 'DaThamGia', 'HoanThanh']),
          },
        });

        const phanCongs = await this.danDoanRepo.find({
          where: { chuyen_tham_quan_id: chuyen.id },
          relations: { giangVien: true },
        });

        const gio = chuyen.gio_bat_dau
          ? chuyen.gio_bat_dau.substring(0, 5)
          : '00:00';
        return {
          id: chuyen.id,
          factoryName: chuyen.nhaMay?.ten_nha_may || 'Chuyến đi',
          dateFormatted: tripDate.toLocaleDateString('vi-VN'),
          time: gio,
          isToday,
          studentCount: studentCount || 0,
          lecturer: phanCongs[0]?.giangVien?.ho_ten || 'Đang chờ PC',
          status,
          statusColor,
        };
      }),
    );

    // 1. Đợt kiến tập hiện tại & Trạng thái khóa cổng Bộ 3 chuyến
    let activeDot = await this.dotRepo.findOne({
      where: { trang_thai: In(['DangTrienKhai', 'DangDienRa', 'MoDangKy']) },
      relations: { hocKy: { namHoc: true } },
      order: { id: 'DESC' },
    });

    if (!activeDot) {
      const dots = await this.dotRepo.find({
        relations: { hocKy: { namHoc: true } },
        order: { id: 'DESC' },
        take: 1,
      });
      activeDot = dots[0] || null;
    }

    const dotId = activeDot ? activeDot.id : null;
    const isBoChuyenLocked = activeDot?.is_bo_chuyen_locked ?? false;

    const currentCampaign = activeDot ? {
      id: activeDot.id,
      tenDot: activeDot.ten_dot || `Đợt #${activeDot.id}`,
      hocKy: activeDot.hocKy?.ten_hoc_ky || 'Học kỳ 1',
      namHoc: activeDot.hocKy?.namHoc?.ten_nam_hoc || '2026-2027',
      ngayBatDau: activeDot.ngay_bat_dau,
      ngayKetThuc: activeDot.ngay_ket_thuc,
      isBoChuyenLocked,
    } : null;

    // 2. Thống kê tiến trình 4 giai đoạn học phần (Pipeline)
    // GĐ 1: Số sinh viên đã đăng ký ít nhất 1 chuyến hợp lệ
    let registeredStudentsCount = 0;
    try {
      const regRaw = await this.phieuRepo.createQueryBuilder('p')
        .select('COUNT(DISTINCT p.sinh_vien_id)', 'cnt')
        .where("p.trang_thai IN ('HopLe', 'DaThamGia', 'HoanThanh')")
        .getRawOne();
      registeredStudentsCount = Number(regRaw?.cnt || 0);
    } catch (e) {
      registeredStudentsCount = 0;
    }

    // GĐ 2: Số bài thu hoạch đã nộp
    const submittedReportsCount = await this.baiRepo.count();

    // GĐ 3: Số sinh viên đủ điều kiện (>= 2 trực tiếp + >= 1 trực tuyến tại >= 3 nhà máy)
    let eligibleCount = 0;
    try {
      const eligibleRaw: any[] = await this.dataSource.query(`
        SELECT p.sinh_vien_id
        FROM PhieuDangKy p
        JOIN PhieuThamQuan ptq ON ptq.phieu_dang_ky_id = p.id
        JOIN ChuyenThamQuan c ON c.id = p.chuyen_tham_quan_id
        JOIN BaiThuHoach b ON b.phieu_tham_quan_id = ptq.id
        WHERE p.trang_thai IN ('HopLe', 'DaThamGia', 'HoanThanh')
          AND ptq.trang_thai = 'HopLe'
        GROUP BY p.sinh_vien_id
        HAVING SUM(CASE WHEN c.hinh_thuc = 'TrucTiep' THEN 1 ELSE 0 END) >= 2
           AND SUM(CASE WHEN c.hinh_thuc = 'TrucTuyen' THEN 1 ELSE 0 END) >= 1
           AND COUNT(DISTINCT c.nha_may_id) >= 3
      `);
      eligibleCount = eligibleRaw?.length || 0;
    } catch (e) {
      eligibleCount = 0;
    }

    // Số sinh viên đã chọn đủ Bộ 3 chuyến báo cáo
    const selectedBoChuyenCount = await this.boRepo.count();

    // GĐ 4: Thống kê Hội đồng chấm & Khóa điểm
    const totalBoardsCount = await this.hdRepo.count();
    let lockedBoardsCount = 0;
    try {
      const lockedRaw: any[] = await this.dataSource.query(`
        SELECT COUNT(DISTINCT hd.id) as cnt
        FROM HoiDongChamBaoCao hd
        JOIN BoChuyenBaoCao bo ON bo.hoi_dong_id = hd.id
        JOIN PhieuThamQuan ptq ON ptq.bo_chuyen_bao_cao_id = bo.id
        JOIN DiemPhieuThamQuan d ON d.phieu_tham_quan_id = ptq.id
        WHERE d.da_khoa_hoi_dong = 1 OR d.da_khoa = 1
      `);
      lockedBoardsCount = Number(lockedRaw[0]?.cnt || 0);
    } catch (e) {
      lockedBoardsCount = 0;
    }
    
    // Số sinh viên đã có điểm tổng kết / đã chấm xong
    let gradedStudentsCount = 0;
    try {
      const gradedRaw: any[] = await this.dataSource.query(`
        SELECT COUNT(DISTINCT bo.id) as cnt
        FROM BoChuyenBaoCao bo
        JOIN PhieuThamQuan ptq ON ptq.bo_chuyen_bao_cao_id = bo.id
        JOIN DiemPhieuThamQuan d ON d.phieu_tham_quan_id = ptq.id
        WHERE d.da_khoa_hoi_dong = 1 OR d.da_khoa = 1
      `);
      gradedStudentsCount = Number(gradedRaw[0]?.cnt || 0);
    } catch (e) {
      gradedStudentsCount = 0;
    }

    // 3. Trung tâm Cảnh báo việc cần xử lý gấp (Urgent Action Center)
    const pendingProposalsCount = await this.deXuatRepo.count({
      where: [
        { trang_thai_duyet: 'ChoDuyet' },
        { trang_thai_duyet: 'ChoKhoaDuyet' },
      ],
    });

    const notEligibleCount = Math.max(0, studentCount - eligibleCount);

    let unassignedCouncilCount = 0;
    try {
      unassignedCouncilCount = await this.boRepo.count({
        where: { hoi_dong_id: IsNull() },
      });
    } catch (e) {
      unassignedCouncilCount = 0;
    }

    let unassignedSupervisorCount = 0;
    try {
      const unassignedSvRaw = await this.dataSource.query(`
        SELECT COUNT(sv.id) as cnt
        FROM SinhVien sv
        WHERE sv.id NOT IN (SELECT DISTINCT sinh_vien_id FROM PhanCongGVHD WHERE sinh_vien_id IS NOT NULL)
      `);
      unassignedSupervisorCount = Number(unassignedSvRaw[0]?.cnt || 0);
    } catch (e) {
      unassignedSupervisorCount = 0;
    }

    return {
      studentCount,
      lecturerCount,
      factoryCount,
      campaignCount,
      scheduleCount,
      tripCount,
      pendingCancelCount,
      pendingRefundCount,
      pendingActionCount: pendingCancelCount + pendingRefundCount + pendingProposalsCount,
      pendingProposalCount: pendingProposalsCount,
      distributionData,
      timeline,
      currentCampaign,
      pipeline: {
        registeredStudentsCount,
        submittedReportsCount,
        eligibleCount,
        selectedBoChuyenCount,
        totalBoardsCount,
        lockedBoardsCount,
        gradedStudentsCount,
      },
      urgentAlerts: {
        pendingProposalsCount,
        pendingCancelCount,
        pendingRefundCount,
        notEligibleCount,
        unassignedCouncilCount,
        unassignedSupervisorCount,
      },
    };
    } catch (err: any) {
      console.error('LỖI GET DASHBOARD STATS:', err);
      return {
        studentCount: 0,
        lecturerCount: 0,
        factoryCount: 0,
        campaignCount: 0,
        scheduleCount: 0,
        tripCount: 0,
        pendingCancelCount: 0,
        pendingRefundCount: 0,
        pendingActionCount: 0,
        pendingProposalCount: 0,
        distributionData: [],
        timeline: [],
        currentCampaign: null,
        pipeline: {
          registeredStudentsCount: 0,
          submittedReportsCount: 0,
          eligibleCount: 0,
          selectedBoChuyenCount: 0,
          totalBoardsCount: 0,
          lockedBoardsCount: 0,
          gradedStudentsCount: 0,
        },
        urgentAlerts: {
          pendingProposalsCount: 0,
          pendingCancelCount: 0,
          pendingRefundCount: 0,
          notEligibleCount: 0,
          unassignedCouncilCount: 0,
          unassignedSupervisorCount: 0,
        },
      };
    }
  }

  // List all student registrations with pagination and filters
  async getRegistrations(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    lichKienTapId?: number,
    chuyenThamQuanId?: number,
    hasCancelRequest?: string,
    hasInvoice?: string,
  ) {
    await this.scanAndMarkLatePayments();
    const queryBuilder = this.phieuRepo
      .createQueryBuilder('phieu')
      .leftJoinAndSelect('phieu.sinhVien', 'sinhVien')
      .leftJoinAndSelect('sinhVien.khoaHoc', 'khoaHoc')
      .leftJoinAndSelect('phieu.chuyenThamQuan', 'chuyen')
      .leftJoinAndSelect('chuyen.nhaMay', 'nhaMay')
      .leftJoinAndSelect('chuyen.lichKienTap', 'lich')
      .leftJoinAndSelect('phieu.yeuCauHuy', 'yeuCauHuy')
      .leftJoinAndSelect('phieu.hoaDon', 'hoaDon')
      .leftJoinAndSelect('phieu.phieuThamQuan', 'phieuThamQuan')
      .leftJoinAndMapOne(
        'phieu.diemDanh',
        DiemDanh,
        'diemDanh',
        'diemDanh.phieu_tham_quan_id = phieuThamQuan.id',
      );

    if (search) {
      queryBuilder.andWhere(
        '(sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search OR nhaMay.ten_nha_may LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status && status !== 'All') {
      if (status === 'HopLe') {
        queryBuilder.andWhere('phieu.trang_thai IN (:...finalizedStatuses)', {
          finalizedStatuses: ['HopLe', 'DaThamGia', 'HoanThanh'],
        });
      } else {
        queryBuilder.andWhere('phieu.trang_thai = :status', { status });
      }
    }

    if (lichKienTapId) {
      queryBuilder.andWhere('chuyen.lich_kien_tap_id = :lichKienTapId', {
        lichKienTapId,
      });
    }

    if (chuyenThamQuanId) {
      queryBuilder.andWhere('phieu.chuyen_tham_quan_id = :chuyenThamQuanId', {
        chuyenThamQuanId,
      });
    }

    if (hasCancelRequest === 'true') {
      queryBuilder.andWhere('yeuCauHuy.id IS NOT NULL');
    }

    if (hasInvoice === 'true') {
      queryBuilder
        .andWhere('hoaDon.id IS NOT NULL')
        .andWhere('phieu.trang_thai != :choDuyetStatus', { choDuyetStatus: 'ChoDuyet' });
    }

    const take = limit;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .orderBy('phieu.ngay_dang_ky', 'DESC')
      .take(take)
      .skip(skip)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // List all refund requests with pagination
  async getRefundRequests(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const queryBuilder = this.hoanPhiRepo
      .createQueryBuilder('don')
      .leftJoinAndSelect('don.hoaDon', 'hoaDon')
      .leftJoinAndSelect('hoaDon.phieuDangKy', 'phieu')
      .leftJoinAndSelect('phieu.sinhVien', 'sinhVien')
      .leftJoinAndSelect('phieu.chuyenThamQuan', 'chuyen')
      .leftJoinAndSelect('chuyen.nhaMay', 'nhaMay');

    if (search) {
      queryBuilder.andWhere(
        '(sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const take = limit;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .orderBy('don.ngay_nop', 'DESC')
      .take(take)
      .skip(skip)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Approve or reject refund request
  async approveRefund(
    refundId: number,
    approverId: number,
    isApproved: boolean,
  ) {
    const don = await this.hoanPhiRepo.findOne({
      where: { id: refundId },
      relations: { hoaDon: true },
    });
    if (!don) throw new NotFoundException('Không tìm thấy đơn hoàn phí');

    don.ngay_xu_ly = new Date();
    don.ngay_xu_ly = new Date();
    don.trang_thai = isApproved ? 'DaHoanTien' : 'TuChoi';
    await this.hoanPhiRepo.save(don);

    if (isApproved && don.hoaDon) {
      don.hoaDon.trang_thai = 'DaHoanPhi';
      await this.hoaDonRepo.save(don.hoaDon);
    }

    return {
      message: isApproved
        ? 'Phê duyệt hoàn phí thành công'
        : 'Từ chối hoàn phí thành công',
    };
  }

  // Get student enrollments for advisor assignment with pagination
  async getEnrollments(
    page: number = 1,
    limit: number = 10,
    search?: string,
    dotKienTapId?: number,
    lichKienTapId?: number,
  ) {
    let targetDotId = dotKienTapId;
    if (!targetDotId && lichKienTapId) {
      const lich = await this.lichRepo.findOne({ where: { id: lichKienTapId } });
      if (lich) {
        targetDotId = lich.dot_kien_tap_id;
      } else {
        const dot = await this.dotRepo.findOne({ where: { id: lichKienTapId } });
        if (dot) {
          targetDotId = dot.id;
        }
      }
    }

    const queryBuilder = this.dksvRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.sinhVien', 'sinhVien')
      .leftJoinAndSelect('enrollment.dotKienTap', 'dot');

    if (targetDotId) {
      queryBuilder.andWhere('enrollment.dot_kien_tap_id = :targetDotId', {
        targetDotId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const take = limit;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .orderBy('enrollment.id', 'DESC')
      .take(take)
      .skip(skip)
      .getManyAndCount();

    let mappedData: any[] = data;

    if (data.length > 0) {
      const dksvIds = data.map((e) => e.id);

      // Map PhanCongGVHD
      const phanCongs = await this.pcGvhdRepo.find({
        where: {
          dot_kien_tap_sinh_vien_id: In(dksvIds),
          trang_thai: 'DangHoatDong',
        },
        relations: { giangVien: true },
      });

      const sinhVienIds = data.map((e) => e.sinh_vien_id);
      let phieus: any[] = [];
      const chunkSize = 1000;
      for (let i = 0; i < sinhVienIds.length; i += chunkSize) {
        const chunk = sinhVienIds.slice(i, i + chunkSize);
        const qbPhieus = this.phieuRepo
          .createQueryBuilder('phieu')
          .leftJoinAndSelect('phieu.chuyenThamQuan', 'chuyen')
          .leftJoinAndSelect('chuyen.nhaMay', 'nhaMay')
          .leftJoinAndSelect('chuyen.lichKienTap', 'lich')
          .leftJoinAndSelect('phieu.phieuThamQuan', 'ptq')
          .leftJoinAndSelect('ptq.diemPhieuThamQuan', 'diem')
          .where('phieu.sinh_vien_id IN (:...chunk)', { chunk })
          .andWhere('phieu.trang_thai IN (:...statuses)', {
            statuses: ['HopLe', 'DaThamGia', 'HoanThanh'],
          });

        if (targetDotId) {
          qbPhieus.andWhere('lich.dot_kien_tap_id = :dotId', { dotId: targetDotId });
        }

        const chunkPhieus = await qbPhieus
          .orderBy('chuyen.ngay_tham_quan', 'ASC')
          .getMany();
        phieus = phieus.concat(chunkPhieus);
      }

      mappedData = data.map((e: any) => {
        // Map GVHD
        const pc = phanCongs.find((p) => p.dot_kien_tap_sinh_vien_id === e.id);
        const gvhdObj = pc?.giangVien
          ? {
              id: pc.giangVien.id,
              ma_gv: pc.giangVien.ma_gv,
              ho_ten: pc.giangVien.ho_ten,
              email: pc.giangVien.email || null,
              sdt: pc.giangVien.sdt || null,
            }
          : null;

        const studentTrips = phieus.filter(
          (p) => p.sinh_vien_id === e.sinh_vien_id,
        );

        // Thống kê số lượng nhà máy theo quy chế HUIT
        const distinctFactoryIds = new Set(
          studentTrips
            .map(
              (p) =>
                p.chuyenThamQuan?.nha_may_id ||
                p.chuyenThamQuan?.nhaMay?.ten_nha_may,
            )
            .filter(Boolean),
        );
        const so_nm_khong_trung = distinctFactoryIds.size;
        const so_nm_off = studentTrips.filter(
          (p) => p.chuyenThamQuan?.hinh_thuc === 'TrucTiep',
        ).length;
        const so_nm_onl = studentTrips.filter(
          (p) => p.chuyenThamQuan?.hinh_thuc === 'TrucTuyen',
        ).length;
        const so_nm_di = studentTrips.length;
        const so_nm_trung = Math.max(0, so_nm_di - so_nm_khong_trung);
        const du_dieu_kien_nm =
          so_nm_off >= 2 && so_nm_onl >= 1 && so_nm_khong_trung >= 3;

        let validTripsCount = 0;
        let sumScore = 0;
        let hasZero = false;

        const mappedTrips = studentTrips.map((p) => {
          const diemPhieu = p.phieuThamQuan?.diemPhieuThamQuan;
          const tenNM = p.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi';
          const hinhThuc = p.chuyenThamQuan?.hinh_thuc;

          let tripScore: number | null = null;
          if (
            diemPhieu?.diem_tong_chuyen !== null &&
            diemPhieu?.diem_tong_chuyen !== undefined
          ) {
            tripScore = Number(diemPhieu.diem_tong_chuyen);
          } else if (
            diemPhieu?.diem_chuan_bi !== null &&
            diemPhieu?.diem_chuan_bi !== undefined &&
            diemPhieu?.diem_thu_hoach !== null &&
            diemPhieu?.diem_thu_hoach !== undefined &&
            diemPhieu?.diem_hoi_dong_final !== null &&
            diemPhieu?.diem_hoi_dong_final !== undefined
          ) {
            const calc =
              Number(diemPhieu.diem_chuan_bi) * 0.3 +
              Number(diemPhieu.diem_thu_hoach) * 0.3 +
              Number(diemPhieu.diem_hoi_dong_final) * 0.4 +
              Number(diemPhieu.diem_cong_final || 0);
            tripScore = Number(Math.min(10, calc).toFixed(2));
          }

          if (tripScore !== null) {
            validTripsCount++;
            sumScore += tripScore;
            if (tripScore === 0) {
              hasZero = true;
            }
          }

          return {
            nhaMay: tenNM,
            ten_nha_may: tenNM,
            ten_chuyen: tenNM,
            nha_may_id: p.chuyenThamQuan?.nha_may_id,
            ma_chuyen_tham_quan: p.chuyenThamQuan?.id,
            ngay_tham_quan: p.chuyenThamQuan?.ngay_tham_quan,
            hinh_thuc: hinhThuc,
            cach_to_chuc: p.chuyenThamQuan?.cach_to_chuc,
            diem_chuan_bi:
              diemPhieu?.diem_chuan_bi != null
                ? Number(diemPhieu.diem_chuan_bi)
                : null,
            diem_thu_hoach:
              diemPhieu?.diem_thu_hoach != null
                ? Number(diemPhieu.diem_thu_hoach)
                : null,
            diem_bao_cao:
              diemPhieu?.diem_thu_hoach != null
                ? Number(diemPhieu.diem_thu_hoach)
                : null,
            diem_hoi_dong:
              diemPhieu?.diem_hoi_dong_final != null
                ? Number(diemPhieu.diem_hoi_dong_final)
                : null,
            diem_bao_cao_hoi_dong:
              diemPhieu?.diem_hoi_dong_final != null
                ? Number(diemPhieu.diem_hoi_dong_final)
                : null,
            diem_bao_cao_hd:
              diemPhieu?.diem_hoi_dong_final != null
                ? Number(diemPhieu.diem_hoi_dong_final)
                : null,
            diem_hoi_dong_final:
              diemPhieu?.diem_hoi_dong_final != null
                ? Number(diemPhieu.diem_hoi_dong_final)
                : null,
            diem_van_dap:
              diemPhieu?.diem_hoi_dong_final != null
                ? Number(diemPhieu.diem_hoi_dong_final)
                : null,
            diem_cong:
              diemPhieu?.diem_cong_final != null
                ? Number(diemPhieu.diem_cong_final)
                : 0,
            diem_tong: tripScore,
            diem_tong_nm: tripScore,
          };
        });

        let diemTongKet: number | null = null;
        let trangThaiKetQua = e.trang_thai;

        if (mappedTrips.length >= 3 && validTripsCount >= 3 && du_dieu_kien_nm) {
          if (hasZero) {
            diemTongKet = 0;
            trangThaiKetQua = 'Không đạt';
          } else {
            diemTongKet = Number((sumScore / 3).toFixed(2));
            trangThaiKetQua = diemTongKet >= 5.0 ? 'Đạt' : 'Không đạt'; // (BUG-03)
          }
        } else if (e.trang_thai === 'Dat' || e.trang_thai === 'Đạt') {
          trangThaiKetQua = 'Đạt';
        } else if (e.trang_thai === 'KhongDat' || e.trang_thai === 'Không đạt') {
          trangThaiKetQua = 'Không đạt';
        } else {
          diemTongKet = e.diem_tong_ket ?? null;
          trangThaiKetQua = 'Đang thực hiện';
        }

        return {
          id: e.id,
          dot_kien_tap_id: e.dot_kien_tap_id,
          dotKienTap: e.dotKienTap,
          sinh_vien_id: e.sinh_vien_id,
          sinhVien: {
            id: e.sinhVien?.id,
            mssv: e.sinhVien?.mssv,
            ho_ten: e.sinhVien?.ho_ten,
            taikhoan_id: e.sinhVien?.taikhoan_id,
            khoa_hoc_id: e.sinhVien?.khoa_hoc_id,
            ten_lop: e.sinhVien?.ten_lop,
            lop: e.sinhVien?.ten_lop,
            email: e.sinhVien?.email,
            sdt: e.sinhVien?.sdt,
            details: {
              giangVienHuongDan: gvhdObj,
            },
          },
          giangVienHuongDan: gvhdObj,
          gvhd: gvhdObj?.ho_ten || null,
          lan_dang_ky: e.lan_dang_ky,
          trang_thai: trangThaiKetQua,
          ngay_them: e.ngay_them,
          so_nm_di,
          so_nm_khong_trung,
          so_nm_off,
          so_nm_onl,
          so_nm_trung,
          du_dieu_kien_nm,
          nm_thuc_te: so_nm_off,
          nm_online: so_nm_onl,
          tong_nm: so_nm_khong_trung,
          trips: mappedTrips,
          diem_tong_ket: diemTongKet,
        };
      });
    }

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get all notifications (filtered by role if CLB)
  async getNotifications(role?: string, userSub?: number) {
    let whereCondition: any = undefined;
    if (role === 'QuanLyCLB') {
      whereCondition = [
        { doi_tuong_nhan: In(['ALL', 'CLB']) },
        ...(userSub ? [{ nguoi_gui_id: userSub }] : []),
      ];
    }

    const list = await this.thongBaoRepo.find({
      where: whereCondition,
      relations: {
        nguoiGui: true,
        khoaHoc: true,
        files: true,
      },
      order: { ngay_gui: 'DESC' },
    });

    return list.map((n) => ({
      ...n,
      file_dinh_kem: n.files && n.files.length > 0 ? n.files[0].ten_file : null,
      file_url: n.files && n.files.length > 0 ? n.files[0].duong_dan : null,
    }));
  }

  // Create a new notification
  async createNotification(data: {
    tieu_de: string;
    noi_dung: string;
    nguoi_gui_id?: number;
    khoa_hoc_id?: number;
    doi_tuong_nhan?: string;
    loai_thong_bao?: string;
    file_url?: string;
    file_name?: string;
  }) {
    const notif = new ThongBao();
    notif.tieu_de = data.tieu_de;
    notif.noi_dung = data.noi_dung;
    notif.nguoi_gui_id = data.nguoi_gui_id || 1;
    notif.doi_tuong_nhan = data.doi_tuong_nhan || 'ALL';
    notif.loai_thong_bao = data.loai_thong_bao || 'ThongBao';
    if (data.khoa_hoc_id) {
      notif.khoa_hoc_id = data.khoa_hoc_id;
    }
    notif.ngay_gui = new Date();
    notif.da_chinh_sua = false;

    const savedNotif = await this.thongBaoRepo.save(notif);

    if (data.file_url) {
      const file = new ThongBaoFile();
      file.thongbao_id = savedNotif.id;
      file.ten_file = data.file_name || 'attachment';
      file.duong_dan = data.file_url;
      file.dung_luong_kb = 0;
      await this.tbFileRepo.save(file);
      savedNotif.files = [file];
    }

    // Queue background jobs for email and reminder notification ONLY for students/all
    if (savedNotif.doi_tuong_nhan === 'ALL' || savedNotif.doi_tuong_nhan === 'STUDENT') {
      await this.taskQueueService.addJob('send-email', {
        to: 'sinhvien-khoa@hcmute.edu.vn',
        subject: `[Thông báo kiến tập] ${savedNotif.tieu_de}`,
        body: savedNotif.noi_dung,
      });

      await this.taskQueueService.addJob('send-reminder', {
        studentId: 0, // 0 denotes all students in the campaign
        title: savedNotif.tieu_de,
        message: 'Khoa vừa cập nhật thông báo mới về đợt kiến tập.',
      });
    }

    return savedNotif;
  }

  async bulkConfirmPayments(
    records: { noi_dung_chuyen_khoan: string; so_tien?: number }[],
  ) {
    let successCount = 0;
    let notFoundCount = 0;
    for (const r of records) {
      const hd = await this.hoaDonRepo.findOne({
        where: { noi_dung_chuyen_khoan: r.noi_dung_chuyen_khoan },
        relations: { phieuDangKy: true },
      });
      if (!hd) {
        notFoundCount++;
        continue;
      }
      hd.trang_thai = 'DaDongDungHan';
      hd.ngay_dong_thuc_te = new Date();
      await this.hoaDonRepo.save(hd);
      if (hd.phieuDangKy) {
        hd.phieuDangKy.trang_thai = 'HopLe';
        await this.phieuRepo.save(hd.phieuDangKy);

        let ptq = await this.phieuTQRepo.findOne({
          where: { phieu_dang_ky_id: hd.phieuDangKy.id },
        });
        if (!ptq) {
          ptq = new PhieuThamQuan();
          ptq.phieu_dang_ky_id = hd.phieuDangKy.id;
          ptq.trang_thai = 'HopLe';
          await this.phieuTQRepo.save(ptq);
        }
      }
      successCount++;
    }
    return {
      message: `Đối chiếu xong: ${successCount} hóa đơn cập nhật, ${notFoundCount} không tìm thấy nội dung chuyển khoản khớp.`,
    };
  }

  async confirmManualPayment(hoaDonId: number) {
    const hd = await this.hoaDonRepo.findOne({
      where: { id: hoaDonId },
      relations: { phieuDangKy: { chuyenThamQuan: true } },
    });
    if (!hd) throw new NotFoundException('Không tìm thấy hóa đơn');
    if (hd.trang_thai !== 'ChuaDong') {
      throw new BadRequestException(
        'Hóa đơn này đã được xử lý thanh toán trước đó',
      );
    }

    const now = new Date();
    hd.ngay_dong_thuc_te = now;
    if (hd.han_dong && now > hd.han_dong) {
      // Nộp trễ hạn → vi phạm, loại khỏi chuyến (nhất quán với scanAndMarkLatePayments)
      hd.trang_thai = 'ViPham';
      await this.hoaDonRepo.save(hd);
      if (hd.phieuDangKy) {
        hd.phieuDangKy.trang_thai = 'BiLoai';
        await this.phieuRepo.save(hd.phieuDangKy);
        // Thêm vào danh sách đen 5 chuyến (KhongDongPhi)
        const black = new DanhSachDen();
        black.sinh_vien_id = hd.phieuDangKy.sinh_vien_id;
        black.ly_do = 'KhongDongPhi';
        black.phieu_dang_ky_id = hd.phieu_dang_ky_id;
        black.ngay_ghi_nhan = now;
        black.so_chuyen_bi_cam = 5;
        black.so_chuyen_con_lai = 5;
        await this.blacklistRepo.save(black);
      }
    } else {
      // Nộp đúng hạn → cấp phiếu tham quan
      hd.trang_thai = 'DaDongDungHan';
      await this.hoaDonRepo.save(hd);
      if (hd.phieuDangKy) {
        hd.phieuDangKy.trang_thai = 'HopLe';
        await this.phieuRepo.save(hd.phieuDangKy);
        let ptq = await this.phieuTQRepo.findOne({
          where: { phieu_dang_ky_id: hd.phieuDangKy.id },
        });
        if (!ptq) {
          ptq = new PhieuThamQuan();
          ptq.phieu_dang_ky_id = hd.phieuDangKy.id;
          ptq.trang_thai = 'HopLe';
          await this.phieuTQRepo.save(ptq);
        }
      }
    }

    return { message: 'Đã xác nhận thanh toán thủ công' };
  }

  // Quan ly Tai khoan thu huong (VietQR)
  async getTaiKhoanThuHuong() {
    return this.taiKhoanThuHuongRepo.find({ order: { id: 'DESC' } });
  }

  async saveTaiKhoanThuHuong(data: Partial<TaiKhoanThuHuong>) {
    if (data.id) {
      const { id, ...updateData } = data;
      await this.taiKhoanThuHuongRepo.update(id, updateData);
      return this.taiKhoanThuHuongRepo.findOne({ where: { id } });
    } else {
      const newTk = this.taiKhoanThuHuongRepo.create(data);
      return this.taiKhoanThuHuongRepo.save(newTk);
    }
  }

  // Quet file Excel sao ke
  async uploadPaidStudents(fileBuffer: Buffer) {
    // 1. Doc file excel thanh text
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Ghep thanh 1 chuoi duy nhat, loai bo dau cach, viet hoa
    const fileText = rows
      .map((row: any) => row.join('|'))
      .join('\n')
      .replace(/\s+/g, '')
      .toUpperCase();

    // 2. Lay danh sach HoaDon ChuaDong
    const chuaDongs = await this.hoaDonRepo.find({
      where: { trang_thai: 'ChuaDong' },
      relations: { phieuDangKy: true },
    });

    let countSuccess = 0;
    const now = new Date();

    // 3. Quet
    for (const hd of chuaDongs) {
      if (hd.noi_dung_chuyen_khoan) {
        const code = hd.noi_dung_chuyen_khoan.replace(/\s+/g, '').toUpperCase();
        if (code && fileText.includes(code)) {
          hd.ngay_dong_thuc_te = now;
          if (hd.han_dong && now > hd.han_dong) {
            hd.trang_thai = 'ViPham';
            await this.hoaDonRepo.save(hd);
            if (hd.phieuDangKy) {
              hd.phieuDangKy.trang_thai = 'BiLoai';
              await this.phieuRepo.save(hd.phieuDangKy);
              const black = new DanhSachDen();
              black.sinh_vien_id = hd.phieuDangKy.sinh_vien_id;
              black.ly_do = 'KhongDongPhi';
              black.phieu_dang_ky_id = hd.phieu_dang_ky_id;
              black.ngay_ghi_nhan = now;
              black.so_chuyen_bi_cam = 5;
              black.so_chuyen_con_lai = 5;
              await this.blacklistRepo.save(black);
            }
          } else {
            hd.trang_thai = 'DaDongDungHan';
            await this.hoaDonRepo.save(hd);
            if (hd.phieuDangKy) {
              hd.phieuDangKy.trang_thai = 'HopLe';
              await this.phieuRepo.save(hd.phieuDangKy);

              let ptq = await this.phieuTQRepo.findOne({
                where: { phieu_dang_ky_id: hd.phieuDangKy.id },
              });
              if (!ptq) {
                ptq = new PhieuThamQuan();
                ptq.phieu_dang_ky_id = hd.phieuDangKy.id;
                ptq.trang_thai = 'HopLe';
                await this.phieuTQRepo.save(ptq);
              }
            }
          }

          countSuccess++;
        }
      }
    }

    return {
      message: 'Hoàn tất quét sao kê',
      success: countSuccess,
      totalUnpaidChecked: chuaDongs.length,
    };
  }

  // -------------------------------------------------------------
  // Sao Luu Co So Du Lieu (Database Backup & Direct Stream)
  // -------------------------------------------------------------
  async streamDatabaseBackup(res: Response) {
    const dbName = process.env.DB_DATABASE || 'QLKienTap';
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const downloadFileName = `${dbName}_Backup_${timestampStr}.bak`;

    // Lưu tệp tạm thời trên máy chủ để SQL Server xuất bản sao lưu
    const tempDir = path.resolve(process.cwd(), 'temp_backups');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, downloadFileName);

    try {
      const escapedPath = tempFilePath.replace(/'/g, "''");
      const backupSql = `BACKUP DATABASE [${dbName}] TO DISK = N'${escapedPath}' WITH COPY_ONLY, FORMAT, INIT, CHECKSUM;`;
      await this.dataSource.query(backupSql);

      if (!fs.existsSync(tempFilePath)) {
        throw new BadRequestException(
          'Không tìm thấy tệp sao lưu sau khi hoàn thành lệnh trích xuất',
        );
      }

      // Stream trực tiếp về client qua res.download và tự động xóa sạch tệp tạm khi kết thúc
      res.download(tempFilePath, downloadFileName, (err) => {
        if (err) {
          console.error('Lỗi trong quá trình truyền file sao lưu:', err);
        }
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          if (fs.existsSync(tempDir)) {
            const remaining = fs.readdirSync(tempDir);
            if (remaining.length === 0) {
              fs.rmSync(tempDir, { recursive: true, force: true });
            }
          }
        } catch (cleanupErr) {
          console.error('Lỗi dọn dẹp tệp sao lưu tạm:', cleanupErr);
        }
      });
    } catch (error: any) {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (cleanupErr) {}

      console.error('LỖI KHI SAO LƯU CƠ SỞ DỮ LIỆU:', error);
      throw new BadRequestException(
        `Không thể sao lưu cơ sở dữ liệu: ${error.message || 'Lỗi hệ thống'}`,
      );
    }
  }
}
