import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  LessThanOrEqual,
  DataSource,
  EntityManager,
  Not,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
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

@Injectable()
export class KhoaService {
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
  ) {}

  // -------------------------------------------------------------
  // Danh Muc Nen CRUD
  // -------------------------------------------------------------
  async getYears() {
    return this.namHocRepo.find();
  }
  async createYear(data: Partial<NamHoc>) {
    return this.namHocRepo.save(data);
  }

  async getTerms() {
    return this.hocKyRepo.find({ relations: { namHoc: true } });
  }
  async createTerm(data: Partial<HocKy>) {
    return this.hocKyRepo.save(data);
  }

  async getCourses() {
    return this.khoaHocRepo.find();
  }
  async createCourse(data: Partial<KhoaHoc>) {
    return this.khoaHocRepo.save(data);
  }

  async updateYear(id: number, data: Partial<NamHoc>) {
    const nh = await this.namHocRepo.findOne({ where: { id } });
    if (!nh) throw new NotFoundException('Không tìm thấy năm học');
    Object.assign(nh, data);
    await this.namHocRepo.save(nh);
    return { message: 'Cập nhật năm học thành công', data: nh };
  }

  async deleteYear(id: number) {
    const count = await this.hocKyRepo.count({ where: { nam_hoc_id: id } });
    if (count > 0) throw new BadRequestException('Không thể xóa năm học đã có học kỳ được gắn vào');
    const nh = await this.namHocRepo.findOne({ where: { id } });
    if (!nh) throw new NotFoundException('Không tìm thấy năm học');
    await this.namHocRepo.remove(nh);
    return { message: 'Xóa năm học thành công' };
  }

  async updateTerm(id: number, data: Partial<HocKy>) {
    const hk = await this.hocKyRepo.findOne({ where: { id } });
    if (!hk) throw new NotFoundException('Không tìm thấy học kỳ');
    Object.assign(hk, data);
    await this.hocKyRepo.save(hk);
    return { message: 'Cập nhật học kỳ thành công', data: hk };
  }

  async deleteTerm(id: number) {
    const hk = await this.hocKyRepo.findOne({ where: { id } });
    if (!hk) throw new NotFoundException('Không tìm thấy học kỳ');
    await this.hocKyRepo.remove(hk);
    return { message: 'Xóa học kỳ thành công' };
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
    if (count > 0) throw new BadRequestException('Không thể xóa khóa đã có sinh viên nằm trong đó');
    const kh = await this.khoaHocRepo.findOne({ where: { id } });
    if (!kh) throw new NotFoundException('Không tìm thấy khóa');
    await this.khoaHocRepo.remove(kh);
    return { message: 'Xóa khóa thành công' };
  }

  async getFactories() {
    return this.nhaMayRepo.find();
  }

  async getFactoryIndustryGroups() {
    const rows = await this.nhaMayRepo
      .createQueryBuilder('nm')
      .select('DISTINCT nm.nhom_nganh', 'nhom_nganh')
      .where('nm.nhom_nganh IS NOT NULL')
      .getRawMany();
    return rows.map((r) => r.nhom_nganh).filter(Boolean);
  }
  async createFactory(data: Partial<NhaMay>) {
    return this.nhaMayRepo.save(data);
  }
  async updateFactory(id: number, data: Partial<NhaMay>) {
    await this.nhaMayRepo.update(id, data);
    return this.nhaMayRepo.findOne({ where: { id } });
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
    return { message: duDkHoiDong ? 'Đã đánh dấu đủ điều kiện Hội đồng' : 'Đã bỏ đánh dấu đủ điều kiện Hội đồng', data: gv };
  }

  async createLecturer(data: any) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const existUser = await manager.findOne(TaiKhoan, { where: { ten_dang_nhap: data.ma_gv } });
      if (existUser) {
        throw new BadRequestException('Mã giảng viên (tên đăng nhập) đã tồn tại');
      }
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(data.ma_gv, salt);

      const newAccount = new TaiKhoan();
      newAccount.ten_dang_nhap = data.ma_gv;
      newAccount.mat_khau_hash = hashPassword;
      const vaiTroInfo = await manager.findOne(VaiTro, { where: { ma_vai_tro: 'GiangVien' } });
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

      return { message: 'Thêm giảng viên và tạo tài khoản thành công', giangVien: savedLecturer };
    });
  }

  async updateLecturer(id: number, data: any) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const gv = await manager.findOne(GiangVien, { where: { id }, relations: { taiKhoan: true } });
      if (!gv) throw new NotFoundException('Không tìm thấy giảng viên');
      
      if (data.ma_gv !== undefined && data.ma_gv !== gv.ma_gv) {
        // Kiểm tra mã giảng viên mới đã tồn tại chưa
        const existUser = await manager.findOne(TaiKhoan, { where: { ten_dang_nhap: data.ma_gv } });
        if (existUser) {
          throw new BadRequestException('Mã giảng viên (tên đăng nhập) đã tồn tại');
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
      if (data.so_sv_toi_da_huong_dan !== undefined) gv.so_sv_toi_da_huong_dan = data.so_sv_toi_da_huong_dan;
      
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
    return result.map(r => r.ten_lop);
  }

  async createStudent(data: any) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. Kiểm tra MSSV (tên đăng nhập) đã tồn tại chưa
      const existUser = await manager.findOne(TaiKhoan, {
        where: { ten_dang_nhap: data.mssv },
      });
      if (existUser) {
        throw new BadRequestException(
          'Mã số sinh viên (tên đăng nhập) đã tồn tại',
        );
      }

      // 2. Tạo tài khoản
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(data.mssv, salt);

      const newAccount = new TaiKhoan();
      newAccount.ten_dang_nhap = data.mssv;
      newAccount.mat_khau_hash = hashPassword;
      const vaiTroInfo = await manager.findOne(VaiTro, { where: { ma_vai_tro: 'SinhVien' } });
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
        let khoa = await manager.findOne(KhoaHoc, { where: { ten_khoa_hoc: data.ten_khoa_hoc } });
        if (!khoa) {
          khoa = new KhoaHoc();
          khoa.ten_khoa_hoc = data.ten_khoa_hoc;
          const match = data.ten_khoa_hoc.match(/\d+/);
          if (match) {
            const soKhoa = parseInt(match[0], 10);
            khoa.ma_khoa_hoc = `K${soKhoa}`;
            khoa.nam_nhap_hoc = 2009 + soKhoa; // Khóa 1 là 2010 => Khóa X là 2009 + X
          } else {
            khoa.ma_khoa_hoc = data.ten_khoa_hoc.replace(/\s+/g, '');
          }
          khoa = await manager.save(KhoaHoc, khoa);
        }
        newStudent.khoa_hoc_id = khoa.id;
      } else {
        const khoa = await manager.findOne(KhoaHoc, { where: {} });
        if (khoa) {
          newStudent.khoa_hoc_id = khoa.id;
        } else {
          throw new BadRequestException('Hệ thống chưa có Khóa Học nào để gán cho sinh viên');
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
      const sv = await manager.findOne(SinhVien, { where: { id }, relations: { taiKhoan: true } });
      if (!sv) throw new NotFoundException('Không tìm thấy sinh viên');

      if (data.mssv !== undefined && data.mssv !== sv.mssv) {
        // Kiểm tra MSSV mới đã tồn tại chưa
        const existUser = await manager.findOne(TaiKhoan, { where: { ten_dang_nhap: data.mssv } });
        if (existUser) {
          throw new BadRequestException('Mã số sinh viên (tên đăng nhập) đã tồn tại');
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
        let khoa = await manager.findOne(KhoaHoc, { where: { ten_khoa_hoc: data.ten_khoa_hoc } });
        if (!khoa) {
          khoa = new KhoaHoc();
          khoa.ten_khoa_hoc = data.ten_khoa_hoc;
          const match = data.ten_khoa_hoc.match(/\d+/);
          if (match) {
            const soKhoa = parseInt(match[0], 10);
            khoa.ma_khoa_hoc = `K${soKhoa}`;
            khoa.nam_nhap_hoc = 2009 + soKhoa;
          } else {
            khoa.ma_khoa_hoc = data.ten_khoa_hoc.replace(/\s+/g, '');
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
    const sv = await this.svRepo.findOne({ where: { id }, relations: { taiKhoan: true } });
    if (!sv) throw new NotFoundException('Không tìm thấy sinh viên');
    const hasRegistrations = await this.phieuRepo.count({ where: { sinh_vien_id: id } });
    if (hasRegistrations > 0) {
      if (sv.taiKhoan) {
        sv.taiKhoan.trang_thai = 'KhoaTaiKhoan';
        await this.taiKhoanRepo.save(sv.taiKhoan);
      }
      return { message: 'Sinh viên đã có dữ liệu đăng ký kiến tập nên không thể xóa cứng — đã khóa tài khoản thay thế' };
    }
    await this.svRepo.remove(sv);
    return { message: 'Xóa sinh viên thành công' };
  }

  async getAccounts(page: number = 1, limit: number = 15, search?: string, vaiTro?: string, trangThai?: string) {
    const qb = this.taiKhoanRepo
      .createQueryBuilder('tk')
      .leftJoin('SinhVien', 'sv', 'sv.taikhoan_id = tk.id')
      .leftJoin('GiangVien', 'gv', 'gv.taikhoan_id = tk.id')
      .select([
        'tk.id AS id',
        'tk.ten_dang_nhap AS ten_dang_nhap',
        'tk.vai_tro AS vai_tro',
        'tk.trang_thai AS trang_thai',
        'tk.lan_dang_nhap_cuoi AS lan_dang_nhap_cuoi',
        'COALESCE(sv.ho_ten, gv.ho_ten, tk.ten_dang_nhap) AS ho_ten',
      ]);

    if (search) {
      qb.andWhere('(tk.ten_dang_nhap LIKE :s OR sv.ho_ten LIKE :s OR gv.ho_ten LIKE :s)', { s: `%${search}%` });
    }
    if (vaiTro) qb.andWhere('tk.vai_tro = :vaiTro', { vaiTro });
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
    return { message: tk.trang_thai === 'KhoaTaiKhoan' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', data: tk };
  }

  async resetAccountPassword(accountId: number) {
    const tk = await this.taiKhoanRepo.findOne({ where: { id: accountId } });
    if (!tk) throw new NotFoundException('Không tìm thấy tài khoản');
    const salt = await bcrypt.genSalt(10);
    tk.mat_khau_hash = await bcrypt.hash(tk.ten_dang_nhap, salt);
    tk.phai_doi_mat_khau = true;
    await this.taiKhoanRepo.save(tk);
    return { message: `Đã đặt lại mật khẩu về mặc định (trùng tên đăng nhập: ${tk.ten_dang_nhap})` };
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
    trangThai?: string
  ) {
    const query = this.dotRepo.createQueryBuilder('dot')
      .leftJoinAndSelect('dot.hocKy', 'hocKy')
      .leftJoinAndSelect('hocKy.namHoc', 'namHoc')
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
      totalPages: Math.ceil(total / limit)
    };
  }
  async createCampaign(data: any) {
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
      if (data.danh_sach_sinh_vien && Array.isArray(data.danh_sach_sinh_vien) && data.danh_sach_sinh_vien.length > 0) {
        // Lấy tất cả mssv từ dữ liệu truyền vào
        const mssvList = data.danh_sach_sinh_vien.map((sv: any) => sv.mssv).filter(Boolean);
        
        // Tìm các sinh viên đã tồn tại trong DB
        const existingStudents = await manager.find(SinhVien, {
          where: { mssv: In(mssvList) }
        });
        
        const existingMssvSet = new Set(existingStudents.map(sv => sv.mssv));
        
        // Lọc ra các sinh viên bị thiếu
        const missingStudents = data.danh_sach_sinh_vien.filter(
          (sv: any) => sv.mssv && !existingMssvSet.has(sv.mssv)
        );

        if (missingStudents.length > 0) {
          throw new BadRequestException({
            message: 'Danh sách sinh viên không hợp lệ (Chưa có trong hệ thống)',
            missingStudents: missingStudents
          });
        }
        
        // Tất cả hợp lệ, tiến hành thêm vào đợt
        for (const sv of existingStudents) {
          const dksvExist = await manager.findOne(DotKienTap_SinhVien, {
            where: { dot_kien_tap_id: savedDot.id, sinh_vien_id: sv.id }
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

  async updateCampaign(id: number, data: any) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const campaign = await manager.findOne(DotKienTap, { where: { id } });
      if (!campaign) throw new NotFoundException('Không tìm thấy đợt kiến tập');
      if (campaign.trang_thai !== 'Nhap') {
        throw new BadRequestException('Chỉ có thể chỉnh sửa đợt kiến tập ở trạng thái Nháp');
      }

      if (data.danh_sach_sinh_vien && Array.isArray(data.danh_sach_sinh_vien)) {
        const mssvList = data.danh_sach_sinh_vien.map((sv: any) => sv.mssv).filter(Boolean);
        const existingStudents = await manager.find(SinhVien, {
          where: { mssv: In(mssvList) }
        });
        const existingMssvSet = new Set(existingStudents.map(sv => sv.mssv));
        const missingStudents = data.danh_sach_sinh_vien.filter(
          (sv: any) => sv.mssv && !existingMssvSet.has(sv.mssv)
        );

        if (missingStudents.length > 0) {
          throw new BadRequestException({
            message: 'Danh sách sinh viên không hợp lệ (Chưa có trong hệ thống)',
            missingStudents: missingStudents
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

      const { danh_sach_sinh_vien, ...updateData } = data;
      Object.assign(campaign, updateData);
      return manager.save(DotKienTap, campaign);
    });
  }

  async deleteCampaign(id: number) {
    const campaign = await this.dotRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Không tìm thấy đợt kiến tập');
    if (campaign.trang_thai !== 'Nhap') {
      throw new BadRequestException('Chỉ có thể xóa đợt kiến tập ở trạng thái Nháp');
    }
    
    // Xóa các liên kết sinh viên - đợt kiến tập trước
    await this.dksvRepo.delete({ dot_kien_tap_id: id });
    
    await this.dotRepo.remove(campaign);
    return { message: 'Xóa đợt kiến tập thành công' };
  }

  async getCampaignStudents(id: number, page: number = 1, limit: number = 10, search?: string) {
    const query = this.dksvRepo.createQueryBuilder('dksv')
      .leftJoinAndSelect('dksv.sinhVien', 'sinhVien')
      .leftJoinAndSelect('sinhVien.khoaHoc', 'khoaHoc')
      .where('dksv.dot_kien_tap_id = :id', { id });

    if (search) {
      query.andWhere(
        '(sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search)',
        { search: `%${search}%` }
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
      totalPages: Math.ceil(total / limit)
    };
  }

  async addStudentToCampaign(id: number, mssv: string) {
    const campaign = await this.dotRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Không tìm thấy đợt kiến tập');

    const sv = await this.svRepo.findOne({ where: { mssv } });
    if (!sv) throw new BadRequestException(`Sinh viên có MSSV ${mssv} không tồn tại trong hệ thống.`);

    const existing = await this.dksvRepo.findOne({
      where: { dot_kien_tap_id: id, sinh_vien_id: sv.id }
    });

    if (existing) throw new BadRequestException('Sinh viên này đã có trong danh sách của đợt.');

    const dksv = new DotKienTap_SinhVien();
    dksv.dot_kien_tap_id = id;
    dksv.sinh_vien_id = sv.id;
    dksv.lan_dang_ky = 1;
    dksv.trang_thai = 'DangThucHien';
    await this.dksvRepo.save(dksv);

    const savedDksv = await this.dksvRepo.findOne({ 
      where: { dot_kien_tap_id: id, sinh_vien_id: sv.id }, 
      relations: { sinhVien: true } 
    });
    return { message: 'Thêm sinh viên thành công', data: savedDksv };
  }

  async removeStudentFromCampaign(id: number, studentId: number) {
    const existing = await this.dksvRepo.findOne({
      where: { dot_kien_tap_id: id, sinh_vien_id: studentId }
    });
    if (!existing) throw new NotFoundException('Sinh viên không nằm trong đợt này.');

    await this.dksvRepo.remove(existing);
    return { message: 'Xóa sinh viên khỏi đợt thành công' };
  }

  // [ĐÃ XÓA] publishCampaign(): Trạng thái đợt kiến tập giờ được tự động
  // chuyển bởi updateDotKienTapStatus() — không còn cho phép nhập tay.
  // Xem updateDotKienTapStatus() bên dưới.

  async getSchedules(userRole?: string) {
    const schedules = await this.lichRepo.find({ relations: { dotKienTap: { khoaHoc: true } } });
    if (userRole === 'QuanLyKhoa') {
      return schedules.filter(s => s.trang_thai !== 'Nhap');
    }
    return schedules;
  }
  async createSchedule(data: any) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const { chuyen_tham_quan_ids, isSubmit, ...lichData } = data;
      
      const newLich = new LichKienTap();
      Object.assign(newLich, lichData);
      newLich.trang_thai = isSubmit ? 'ChoDuyet' : 'Nhap';
      
      const savedLich = await manager.save(LichKienTap, newLich);

      if (chuyen_tham_quan_ids && Array.isArray(chuyen_tham_quan_ids) && chuyen_tham_quan_ids.length > 0) {
        await manager.update(ChuyenThamQuan, 
          { id: In(chuyen_tham_quan_ids) }, 
          { lich_kien_tap_id: savedLich.id }
        );
      }

      return savedLich;
    });
  }

  async updateSchedule(id: number, data: any) {
    const lichCheck = await this.lichRepo.findOne({ where: { id } });
    if (!lichCheck) throw new NotFoundException('Không tìm thấy lịch kiến tập');
    if (lichCheck.trang_thai !== 'Nhap') throw new BadRequestException('Chỉ có thể cập nhật lịch ở trạng thái Nháp');

    try {
      return await this.dataSource.transaction(async (manager: EntityManager) => {
        const { chuyen_tham_quan_ids, ...lichData } = data;
        const lich = await manager.findOne(LichKienTap, { where: { id } });
        if (!lich) throw new NotFoundException('Lịch không tồn tại');
        
        Object.assign(lich, lichData);
        const savedLich = await manager.save(LichKienTap, lich);

        if (chuyen_tham_quan_ids !== undefined) {
          await manager.update(ChuyenThamQuan, { lich_kien_tap_id: id }, { lich_kien_tap_id: null as any });
          if (Array.isArray(chuyen_tham_quan_ids) && chuyen_tham_quan_ids.length > 0) {
            await manager.update(ChuyenThamQuan, { id: In(chuyen_tham_quan_ids) }, { lich_kien_tap_id: id });
          }
        }
        return savedLich;
      });
    } catch (e) {
      require('fs').appendFileSync('error.log', e.stack + '\n');
      throw e;
    }
  }

  async deleteSchedule(id: number) {
    const lich = await this.lichRepo.findOne({ where: { id } });
    if (!lich) throw new NotFoundException('Không tìm thấy lịch kiến tập');
    if (lich.trang_thai !== 'Nhap') throw new BadRequestException('Chỉ có thể xóa lịch ở trạng thái Nháp');
    await this.lichRepo.remove(lich);
    return { message: 'Xóa lịch thành công' };
  }

  async submitScheduleForApproval(id: number, userId?: number) {
    const lich = await this.lichRepo.findOne({ where: { id }, relations: { dotKienTap: true } });
    if (!lich) throw new BadRequestException('Không tìm thấy lịch kiến tập');
    if (lich.trang_thai !== 'Nhap') {
      throw new BadRequestException('Chỉ có thể gửi duyệt các lịch ở trạng thái Nháp');
    }
    lich.trang_thai = 'ChoDuyet';
    await this.lichRepo.save(lich);

    // Cập nhật trạng thái các chuyến tham quan thuộc lịch
    await this.chuyenRepo.update(
      { lich_kien_tap_id: id },
      { trang_thai: 'ChoDuyet' }
    );

    // Gửi thông báo đến Quản lý Khoa
    if (userId) {
      await this.createNotification({
        tieu_de: 'Lịch kiến tập chờ duyệt',
        noi_dung: `Câu lạc bộ đã gửi yêu cầu duyệt cho lịch kiến tập "${lich.ten_lich}". Vui lòng kiểm tra và phản hồi.`,
        nguoi_gui_id: userId,
        khoa_hoc_id: lich.dotKienTap.khoa_hoc_id,
      });
    }

    return lich;
  }

  async approveSchedule(id: number) {
    const lich = await this.lichRepo.findOne({ where: { id } });
    if (!lich) throw new BadRequestException('Không tìm thấy lịch kiến tập');
    if (lich.trang_thai !== 'ChoDuyet') {
      throw new BadRequestException('Lịch không ở trạng thái chờ duyệt');
    }

    const totalStudents = await this.dksvRepo.count({
      where: { dot_kien_tap_id: lich.dot_kien_tap_id, trang_thai: 'DangThucHien' },
    });

    if (totalStudents > 0) {
      const assignedStudentsCount = await this.pcGvhdRepo.createQueryBuilder('pc')
        .innerJoin('pc.dotKienTapSinhVien', 'dksv')
        .where('dksv.dot_kien_tap_id = :dotId', { dotId: lich.dot_kien_tap_id })
        .andWhere('dksv.trang_thai = :status1', { status1: 'DangThucHien' })
        .andWhere('pc.trang_thai = :status2', { status2: 'DangHoatDong' })
        .getCount();

      if (assignedStudentsCount < totalStudents) {
        throw new BadRequestException(
          `Bạn phải hoàn thành phân công GVHD cho toàn bộ sinh viên trong đợt trước khi duyệt lịch (Còn ${totalStudents - assignedStudentsCount}/${totalStudents} SV chưa được phân công).`
        );
      }
    }

    lich.trang_thai = 'DaDuyet';
    lich.ly_do_tu_choi = null as any;
    await this.lichRepo.save(lich);

    // Cập nhật trạng thái các chuyến tham quan thuộc lịch
    await this.chuyenRepo.update(
      { lich_kien_tap_id: id },
      { trang_thai: 'DaDuyet' }
    );
    // Đồng bộ trạng thái đợt kiến tập cha
    await this.updateDotKienTapStatus(lich.dot_kien_tap_id);
    return lich;
  }

  async rejectSchedule(id: number, reason: string) {
    const lich = await this.lichRepo.findOne({ where: { id } });
    if (!lich) throw new BadRequestException('Không tìm thấy lịch kiến tập');
    if (lich.trang_thai !== 'ChoDuyet') {
      throw new BadRequestException('Lịch không ở trạng thái chờ duyệt');
    }
    lich.trang_thai = 'TuChoi';
    lich.ly_do_tu_choi = reason || 'Chưa nhập lý do';
    await this.lichRepo.save(lich);

    // Trả trạng thái các chuyến tham quan thuộc lịch về Nháp
    await this.chuyenRepo.update(
      { lich_kien_tap_id: id },
      { trang_thai: 'Nhap' }
    );
    // Đồng bộ trạng thái đợt kiến tập cha
    await this.updateDotKienTapStatus(lich.dot_kien_tap_id);
    return lich;
  }


  // -------------------------------------------------------------
  // Chuyen Tham Quan & Phieu Dang Ky
  // -------------------------------------------------------------
  async getTrips(unassigned?: boolean) {
    const query = this.chuyenRepo.createQueryBuilder('chuyen')
      .leftJoinAndSelect('chuyen.nhaMay', 'nhaMay')
      .leftJoinAndSelect('chuyen.lichKienTap', 'lichKienTap')
      .leftJoinAndSelect('lichKienTap.dotKienTap', 'dotKienTap')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(phieu.id)', 'count')
          .from(PhieuDangKy, 'phieu')
          .where('phieu.chuyen_tham_quan_id = chuyen.id')
          .andWhere('phieu.trang_thai IN (:...statuses)', { statuses: ['HopLe', 'ChoDuyet'] });
      }, 'dang_ky_count');

    if (unassigned) {
      query.where('chuyen.lich_kien_tap_id IS NULL');
    }

    const trips = await query.getRawAndEntities();
    const tripEntities = trips.entities;

    let assignments: PhanCongGiangVienDanDoan[] = [];
    const tripIds = tripEntities.map(t => t.id);
    if (tripIds.length > 0) {
      assignments = await this.danDoanRepo.find({
        where: { chuyen_tham_quan_id: In(tripIds) },
        relations: { giangVien: true }
      });
    }

    const result = tripEntities.map((ent, idx) => ({
      ...ent,
      dang_ky_count: parseInt(trips.raw[idx].dang_ky_count, 10) || 0,
      giaoVienDanDoan: assignments.filter(a => a.chuyen_tham_quan_id === ent.id)
    }));

    require('fs').writeFileSync('debug_trips.json', JSON.stringify({ assignments, result: result.slice(0, 2) }, null, 2));
    return result;
  }

  async getProposals() {
    return this.deXuatRepo.find({
      relations: { nhaMay: true, lichKienTap: true, sinhVien: true },
      order: { ngay_de_xuat: 'DESC' },
    });
  }

  /**
   * Tự động cập nhật trạng thái DotKienTap dựa trên trạng thái các LichKienTap con.
   * Quy tắc (theo đặc tả nghiệp vụ — KHÔNG cho phép nhập tay):
   *   Nhap → DangTrienKhai : khi có ≥1 LichKienTap đã chốt danh sách trở đi
   *   DangTrienKhai → DaKetThuc : khi TẤT CẢ lịch con đã kết thúc hoặc đã khóa
   *   DaKetThuc → DaKhoa : khi TẤT CẢ lịch con đều đã khóa điểm
   */
  async updateDotKienTapStatus(dotId: number) {
    const dot = await this.dotRepo.findOne({ where: { id: dotId } });
    if (!dot || dot.trang_thai === 'DaHuy') return;

    const liches = await this.lichRepo.find({
      where: { dot_kien_tap_id: dotId },
    });
    if (liches.length === 0) {
      // Chưa có lịch nào → giữ Nhap
      if (dot.trang_thai !== 'Nhap') {
        dot.trang_thai = 'Nhap';
        await this.dotRepo.save(dot);
      }
      return;
    }

    const statuses = liches.map((l) => l.trang_thai);

    // Các trạng thái LichKienTap cho thấy đợt đã "hoạt động" (chốt danh sách trở đi)
    const activeStatuses = ['DaChotDanhSach', 'DangDienRa', 'DaDienRa', 'DaKetThuc', 'DaKhoa'];
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
      newStatus = 'Nhap';
    }

    if (newStatus !== dot.trang_thai) {
      dot.trang_thai = newStatus;
      await this.dotRepo.save(dot);
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

    let bannedFromRegistration = false;
    let demotedPriority = false;
    let remainingBannedTrips = 0;
    let remainingDemotedTrips = 0;

    for (const record of blacklistRecords) {
      const occurredTripsCount = await this.chuyenRepo
        .createQueryBuilder('chuyen')
        .where('chuyen.cach_to_chuc = :type', { type: 'DoKhoaToChuc' })
        .andWhere('chuyen.trang_thai = :status', { status: 'DaDienRa' })
        .andWhere('chuyen.ngay_tham_quan >= :date', {
          date: record.ngay_ghi_nhan,
        })
        .getCount();

      if (record.ly_do === 'HuyKhongMinhChung') {
        const limit = 3;
        if (occurredTripsCount >= limit) {
          record.con_hieu_luc = false;
          await this.blacklistRepo.save(record);
        } else {
          bannedFromRegistration = true;
          remainingBannedTrips = Math.max(
            remainingBannedTrips,
            limit - occurredTripsCount,
          );
        }
      } else if (
        record.ly_do === 'KhongDongPhi' ||
        record.ly_do === 'DangKyKhongThamGia'
      ) {
        const limit = 5;
        if (occurredTripsCount >= limit) {
          record.con_hieu_luc = false;
          await this.blacklistRepo.save(record);
        } else {
          demotedPriority = true;
          remainingDemotedTrips = Math.max(
            remainingDemotedTrips,
            limit - occurredTripsCount,
          );
        }
      }
    }

    return {
      bannedFromRegistration,
      demotedPriority,
      remainingBannedTrips,
      remainingDemotedTrips,
    };
  }

  async assignGvhdToTuDoTrips(sinhVienId: number, giangVienId: number) {
    const phieus = await this.phieuRepo.find({
      where: { sinh_vien_id: sinhVienId, trang_thai: 'HopLe' },
      relations: { chuyenThamQuan: true }
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
        black.con_hieu_luc = true;
        await this.blacklistRepo.save(black);
      }
    }
  }

  async createTrip(data: any) {
    try {
      const date = new Date(data.ngay_tham_quan);
      const startStr = data.gio_bat_dau;

      // TypeORM mssql driver (tedious) requires a Date object for TIME columns
      // Bỏ đuôi Z để hệ thống hiểu đây là Local Time, tránh bị lệch +7 tiếng (11h thành 18h)
      const startDate = new Date(`1970-01-01T${startStr.length === 5 ? startStr + ':00' : startStr}`);

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
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Chi tiết lỗi 500: ${error.message}`);
    }
  }

  async updateTrip(id: number, data: any) {
    const trip = await this.chuyenRepo.findOne({ where: { id } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');
    if (trip.trang_thai !== 'Nhap') {
      throw new BadRequestException('Chỉ có thể cập nhật thông tin khi chuyến tham quan ở trạng thái Nháp');
    }

    try {
      if (data.gio_bat_dau && data.ngay_tham_quan) {
        const date = new Date(data.ngay_tham_quan);
        const startStr = typeof data.gio_bat_dau === 'string' ? data.gio_bat_dau : null;
        
        if (startStr) {
          // Bỏ đuôi Z để không bị parse nhầm thành UTC (gây lệch múi giờ +7 tiếng)
          const startDate = new Date(`1970-01-01T${startStr.length === 5 ? startStr + ':00' : startStr}`);
          
          data.gio_bat_dau = startDate as any;

          const overlap = await this.chuyenRepo.findOne({
            where: {
              nha_may_id: data.nha_may_id || trip.nha_may_id,
              ngay_tham_quan: date,
              gio_bat_dau: startDate as any,
              id: Not(id),
            }
          });
            
          if (overlap) {
            throw new BadRequestException('Đã tồn tại chuyến tham quan trùng khung giờ');
          }
        }
      }

      if (trip.lich_kien_tap_id && data.lich_kien_tap_id !== undefined) {
        delete data.lich_kien_tap_id;
      }

      Object.assign(trip, data);
      return await this.chuyenRepo.save(trip);
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Chi tiết lỗi: ${error.message}`);
    }
  }

  async deleteTrip(id: number) {
    const trip = await this.chuyenRepo.findOne({ where: { id } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

    if (trip.trang_thai !== 'Nhap') {
      throw new BadRequestException('Chỉ có thể xóa chuyến tham quan ở trạng thái Nháp');
    }

    return await this.chuyenRepo.remove(trip);
  }

  async reopenTripRegistration(id: number) {
    const trip = await this.chuyenRepo.findOne({ where: { id } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

    if (trip.trang_thai !== 'DaChotDanhSach') {
      throw new BadRequestException('Chỉ có thể mở đăng ký bổ sung khi chuyến tham quan ở trạng thái Đã chốt danh sách');
    }

    // Kiểm tra số lượng đã đăng ký
    const countHopLe = await this.phieuRepo.count({
      where: { chuyen_tham_quan_id: id, trang_thai: 'HopLe' }
    });

    if (countHopLe >= trip.suc_chua) {
      throw new BadRequestException('Chuyến tham quan đã đủ số lượng, không thể mở bổ sung');
    }

    trip.trang_thai = 'MoDangKy';
    return await this.chuyenRepo.save(trip);
  }


  // Duyet de xuat chuyen tu do cua Sinh Vien
  async approveProposeTrip(
    deXuatId: number,
    approverId: number,
    isApproved: boolean,
  ) {
    const dexuat = await this.deXuatRepo.findOne({
      where: { id: deXuatId },
    });
    if (!dexuat) {
      throw new NotFoundException('Không tìm thấy đề xuất chuyến đi tự do');
    }

    if (isApproved) {
      let finalNhaMayId = dexuat.nha_may_id;
      if (!finalNhaMayId && dexuat.ten_nha_may_de_xuat) {
        const newNhaMay = new NhaMay();
        newNhaMay.ten_nha_may = dexuat.ten_nha_may_de_xuat;
        newNhaMay.dia_chi = dexuat.dia_chi_de_xuat;
        newNhaMay.ho_tro_truc_tiep = dexuat.hinh_thuc === 'TrucTiep';
        newNhaMay.ho_tro_truc_tuyen = dexuat.hinh_thuc === 'TrucTuyen';
        const savedNhaMay = await this.nhaMayRepo.save(newNhaMay);
        finalNhaMayId = savedNhaMay.id;
      }

      // Create ChuyenThamQuan
      const trip = new ChuyenThamQuan();
      trip.nha_may_id = finalNhaMayId;
      trip.lich_kien_tap_id = dexuat.lich_kien_tap_id;
      trip.ngay_tham_quan = dexuat.ngay_tham_quan_de_xuat;
      trip.gio_bat_dau = dexuat.gio_bat_dau_de_xuat;
      trip.hinh_thuc = dexuat.hinh_thuc;
      trip.cach_to_chuc = 'TuDo';
      trip.suc_chua = 1;
      trip.trang_thai = 'MoDangKy';
      trip.le_phi = 0;
      const savedTrip = await this.chuyenRepo.save(trip);

      dexuat.ngay_duyet = new Date();
      dexuat.trang_thai_duyet = 'DaDuyet';
      dexuat.chuyen_tham_quan_id = savedTrip.id;
      await this.deXuatRepo.save(dexuat);

      // Tu dong dang ky luon cho SV nay
      const phieu = new PhieuDangKy();
      phieu.sinh_vien_id = dexuat.sinh_vien_id;
      phieu.chuyen_tham_quan_id = savedTrip.id;
      phieu.trang_thai = 'HopLe';
      const savedPhieu = await this.phieuRepo.save(phieu);

      // Va cap luon phieu tham quan
      const ptq = new PhieuThamQuan();
      ptq.phieu_dang_ky_id = savedPhieu.id;
      ptq.trang_thai = 'HopLe';
      await this.phieuTQRepo.save(ptq);

      const dksv = await this.dksvRepo.findOne({
        where: {
          sinh_vien_id: dexuat.sinh_vien_id,
          trang_thai: 'DangThucHien',
        },
      });
      if (dksv) {
        const pc = await this.pcGvhdRepo.findOne({
          where: {
            dot_kien_tap_sinh_vien_id: dksv.id,
            trang_thai: 'DangHoatDong',
          },
        });
        if (pc) {
          const exist = await this.danDoanRepo.findOne({
            where: {
              chuyen_tham_quan_id: savedTrip.id,
              giang_vien_id: pc.giang_vien_id,
            },
          });
          if (!exist) {
            const addPc = new PhanCongGiangVienDanDoan();
            addPc.chuyen_tham_quan_id = savedTrip.id;
            addPc.giang_vien_id = pc.giang_vien_id;
            addPc.la_truong_doan = true;
            await this.danDoanRepo.save(addPc);
          }
        }
      }
    } else {
      dexuat.ngay_duyet = new Date();
      dexuat.trang_thai_duyet = 'TuChoi';
      await this.deXuatRepo.save(dexuat);
    }

    return {
      message: isApproved
        ? 'Duyệt chuyến đi tự do thành công'
        : 'Từ chối chuyến đi tự do thành công',
    };
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
        relations: { phieuDangKy: true },
      });
      if (!req) throw new NotFoundException('Không tìm thấy yêu cầu hủy');

      req.ngay_duyet = new Date();
      req.trang_thai_duyet = isApproved ? 'DaDuyet' : 'TuChoi';
      await manager.save(YeuCauHuyDangKy, req);

      if (isApproved) {
        req.phieuDangKy.trang_thai = 'DaHuy';
        await manager.save(PhieuDangKy, req.phieuDangKy);
      } else {
        req.phieuDangKy.trang_thai = 'DaHuy';
        await manager.save(PhieuDangKy, req.phieuDangKy);

        const black = new DanhSachDen();
        black.sinh_vien_id = req.phieuDangKy.sinh_vien_id;
        black.ly_do = 'HuyKhongMinhChung';
        black.phieu_dang_ky_id = req.phieu_dang_ky_id;
        black.ngay_ghi_nhan = new Date();
        black.con_hieu_luc = true;
        await manager.save(DanhSachDen, black);
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
        trang_thai: In(['ChoDuyet', 'HopLe']),
      },
      relations: { sinhVien: { khoaHoc: true } },
    });

    if (phieus.length === 0) return { message: 'Không có đăng ký nào cần lọc' };

    const startYearStr =
      trip.lichKienTap.dotKienTap.hocKy.namHoc.ten_nam_hoc.split('-')[0];
    const startYear = parseInt(startYearStr, 10);

    const eligibleStats: {
      phieu: PhieuDangKy;
      penalties: any;
      finishedCount: number;
      courseNumber: number;
    }[] = [];

    for (const p of phieus) {
      const penalties = await this.checkAndUpdatePenalties(p.sinh_vien_id);

      if (penalties.bannedFromRegistration) {
        p.trang_thai = 'BiLoai';
        // await this.phieuRepo.save(p); // Do not save in preview
        continue;
      }

      const studyYear = startYear - p.sinhVien.khoaHoc.nam_nhap_hoc + 1;
      if (studyYear < 2) {
        p.trang_thai = 'BiLoai';
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
        continue;
      }

      const match = p.sinhVien.khoaHoc.ten_khoa_hoc.match(/^\d+/);
      const courseNumber = match ? parseInt(match[0], 10) : 99;

      eligibleStats.push({
        phieu: p,
        penalties,
        finishedCount,
        courseNumber,
      });
    }

    const group1 = eligibleStats.filter(
      (e) =>
        (e.courseNumber === 12 || e.courseNumber === 13) &&
        e.finishedCount === 0 &&
        !e.penalties.demotedPriority,
    );
    const group2 = eligibleStats.filter(
      (e) =>
        e.courseNumber === 14 &&
        e.finishedCount === 0 &&
        !e.penalties.demotedPriority,
    );

    const group3 = eligibleStats.filter(
      (e) =>
        !group1.includes(e) &&
        !group2.includes(e) &&
        !e.penalties.demotedPriority,
    );
    const group4 = eligibleStats.filter((e) => e.penalties.demotedPriority);

    const sortFn = (a: any, b: any) =>
      new Date(a.phieu.ngay_dang_ky).getTime() -
      new Date(b.phieu.ngay_dang_ky).getTime();
    group1.sort(sortFn);
    group2.sort(sortFn);
    group3.sort(sortFn);
    group4.sort(sortFn);
    const sortedList = [...group1, ...group2, ...group3, ...group4];

    const suggestedAccepted: PhieuDangKy[] = [];
    const suggestedRejected: PhieuDangKy[] = [];

    let count = 0;
    const capacity = trip.suc_chua;
    for (const item of sortedList) {
      if (count < capacity) {
        suggestedAccepted.push(item.phieu);
        count++;
      } else {
        suggestedRejected.push(item.phieu);
      }
    }

    const autoRejected = phieus.filter(p => p.trang_thai === 'BiLoai');

    return {
      suggestedAccepted,
      suggestedRejected: [...suggestedRejected, ...autoRejected],
      tripCapacity: capacity,
    };
  }

  async confirmAssignStudents(tripId: number, acceptedStudentIds: number[], deadlineDate?: string) {
    const trip = await this.chuyenRepo.findOne({ 
      where: { id: tripId },
      relations: { nhaMay: true }
    });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến đi');

    // 0. Kiem tra xem CLB da cau hinh thanh toan chua
    const activeConfig = await this.taiKhoanThuHuongRepo.findOne({
      where: { trang_thai: 'HoatDong' },
    });
    if (!activeConfig) {
      throw new BadRequestException('Vui lòng cấu hình tài khoản thanh toán VietQR trước khi chốt danh sách!');
    }

    const phieus = await this.phieuRepo.find({
      where: {
        chuyen_tham_quan_id: tripId,
        trang_thai: In(['ChoDuyet', 'HopLe']),
      },
      relations: { sinhVien: true },
    });

    const result = await this.dataSource.transaction(async (manager: EntityManager) => {
      let count = 0;
      for (const phieu of phieus) {
        if (acceptedStudentIds.includes(phieu.sinh_vien_id)) {
          phieu.trang_thai = 'HopLe';
          await manager.save(PhieuDangKy, phieu);

          // Phat hanh HoaDonLePhi cho sinh vien duoc duyet HopLe
          const existingInvoice = await manager.findOne(HoaDonLePhi, {
            where: { phieu_dang_ky_id: phieu.id },
          });
          if (!existingInvoice) {
            const hoaDon = new HoaDonLePhi();
            hoaDon.phieu_dang_ky_id = phieu.id;
            hoaDon.so_tien = trip.hinh_thuc === 'TrucTiep' ? 150000 : 50000;
            
            // Generate formatted string
            const removeAccents = (str: string) => {
              return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
            };
            
            const nhaMayStr = trip.nhaMay ? removeAccents(trip.nhaMay.ten_nha_may).replace(/\s+/g, '').toUpperCase() : 'UNKNOWN';
            let ngayStr = '0000';
            if (trip.ngay_tham_quan) {
              const d = new Date(trip.ngay_tham_quan);
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              ngayStr = `${day}${month}`;
            }
            const sttStr = (count + 1).toString();
            const mssvStr = phieu.sinhVien.mssv || '0000000';
            const hoTenStr = removeAccents(phieu.sinhVien.ho_ten).replace(/\s+/g, '').toUpperCase();
            
            hoaDon.noi_dung_chuyen_khoan = `${nhaMayStr}_${ngayStr}_${sttStr}_${mssvStr}_${hoTenStr}`;

            let dateLimit = new Date();
            if (deadlineDate) {
              dateLimit = new Date(deadlineDate);
            } else {
              dateLimit.setDate(dateLimit.getDate() + 3);
            }
            hoaDon.han_dong = dateLimit;
            hoaDon.trang_thai = 'ChuaDong';
            await manager.save(HoaDonLePhi, hoaDon);
          }
          count++;
        } else {
          phieu.trang_thai = 'BiLoai';
          await manager.save(PhieuDangKy, phieu);
        }
      }

      trip.trang_thai = 'DaChotDanhSach';
      await manager.save(ChuyenThamQuan, trip);

      return {
        message:
          'Đã hoàn tất lọc danh sách tự động theo thứ tự ưu tiên và phát hành hóa đơn lệ phí',
        accepted: count,
        rejected: phieus.length - count,
        dotKienTapId: trip.lich_kien_tap_id ? (await manager.findOne(LichKienTap, { where: { id: trip.lich_kien_tap_id } }))?.dot_kien_tap_id : null,
      };
    });

    // Đồng bộ trạng thái đợt kiến tập cha sau khi chốt danh sách chuyến
    if (result.dotKienTapId) {
      await this.updateDotKienTapStatus(result.dotKienTapId);
    }
    return result;
  }

  // -------------------------------------------------------------
  // Phan Cong GVHD & GVDD
  // -------------------------------------------------------------
  async assignLecturerGuide(dotKienTapSinhVienId: number, lecturerId: number, checkLimit: boolean = true) {
    const dksv = await this.dksvRepo.findOne({
      where: { id: dotKienTapSinhVienId },
      relations: { dotKienTap: true }
    });
    if (!dksv) throw new NotFoundException('Không tìm thấy đăng ký đợt kiến tập');

    if (dksv.trang_thai !== 'DangThucHien') {
      throw new BadRequestException('Sinh viên không trong trạng thái đang thực hiện kiến tập');
    }

    if (dksv.dotKienTap && (dksv.dotKienTap.trang_thai === 'DaKetThuc' || dksv.dotKienTap.trang_thai === 'DaKhoa')) {
      throw new BadRequestException('Không thể phân công khi đợt kiến tập đã kết thúc hoặc khóa');
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
            trang_thai: 'DangHoatDong'
          }
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

    return { success: true, pc };
  }

  async getLecturersWithWorkload() {
    const lecturers = await this.gvRepo.find();
    const result: any[] = [];
    for (const gv of lecturers) {
      const count = await this.pcGvhdRepo.count({
        where: { giang_vien_id: gv.id, trang_thai: 'DangHoatDong' },
      });
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
      relations: { sinhVien: true }
    });

    const unassignedDksvs: any[] = [];
    for (const dksv of dksvs) {
      const pc = await this.pcGvhdRepo.findOne({
        where: { dot_kien_tap_sinh_vien_id: dksv.id, trang_thai: 'DangHoatDong' }
      });
      if (!pc) unassignedDksvs.push(dksv);
    }

    if (unassignedDksvs.length === 0) {
      return { assignments: [], unassigned: [] };
    }

    const lecturers = await this.getLecturersWithWorkload();
    const availableLecturers = lecturers.filter(gv => !gv.so_sv_toi_da_huong_dan || gv.so_sv_dang_huong_dan < gv.so_sv_toi_da_huong_dan);
    
    const assignments: any[] = [];
    const unassigned: any[] = [];
    
    for (const dksv of unassignedDksvs) {
      availableLecturers.sort((a, b) => (a.so_sv_dang_huong_dan || 0) - (b.so_sv_dang_huong_dan || 0));
      
      const targetGv = availableLecturers[0];
      if (targetGv && (!targetGv.so_sv_toi_da_huong_dan || targetGv.so_sv_dang_huong_dan < targetGv.so_sv_toi_da_huong_dan)) {
        assignments.push({
          dotKienTapSinhVienId: dksv.id,
          sinhVien: dksv.sinhVien,
          lecturerId: targetGv.id,
          lecturer: targetGv
        });
        targetGv.so_sv_dang_huong_dan++;
      } else {
        unassigned.push(dksv);
      }
    }
    
    return { assignments, unassigned };
  }

  async confirmAutoAssignGvhd(assignments: { dotKienTapSinhVienId: number; lecturerId: number }[]) {
    const results = { success: 0, failed: [] as any[] };
    for (const assign of assignments) {
      try {
        await this.assignLecturerGuide(assign.dotKienTapSinhVienId, assign.lecturerId, false);
        results.success++;
      } catch (err) {
        results.failed.push({ id: assign.dotKienTapSinhVienId, reason: err.message });
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
      throw new BadRequestException('Không tìm thấy phân công của giảng viên này trong chuyến');
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
        cach_to_chuc: 'DoKhoaToChuc',
        trang_thai: In(['Nhap', 'ChoDuyet', 'DaDuyet', 'MoDangKy']),
      },
    });

    const currentAssignments = await this.danDoanRepo.find({
      relations: { chuyenThamQuan: true },
    });

    const lecturerStats = new Map<number, { workload: number; busyDates: Set<string> }>();
    for (const l of lecturers) {
      lecturerStats.set(l.id, { workload: 0, busyDates: new Set() });
    }

    const assignedTripIds = new Set<number>();
    for (const a of currentAssignments) {
      if (a.chuyen_tham_quan_id) {
        assignedTripIds.add(a.chuyen_tham_quan_id);
      }
      const stat = lecturerStats.get(a.giang_vien_id);
      if (stat && a.chuyenThamQuan?.ngay_tham_quan) {
        stat.workload += 1;
        stat.busyDates.add(new Date(a.chuyenThamQuan.ngay_tham_quan).toDateString());
      }
    }

    const unassignedTrips = trips.filter((t) => !assignedTripIds.has(t.id));

    let assignedCount = 0;
    const newAssignments: PhanCongGiangVienDanDoan[] = [];

    for (const trip of unassignedTrips) {
      if (!trip.ngay_tham_quan) continue;
      const tripDateStr = new Date(trip.ngay_tham_quan).toDateString();

      const availableLecturers = lecturers.filter((l) => {
        const stat = lecturerStats.get(l.id);
        return stat && !stat.busyDates.has(tripDateStr);
      });

      if (availableLecturers.length > 0) {
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
        stat.busyDates.add(tripDateStr);
        assignedCount += 1;
      }
    }

    if (newAssignments.length > 0) {
      await this.danDoanRepo.save(newAssignments);
    }

    return {
      message: `Đã phân công tự động cho ${assignedCount}/${unassignedTrips.length} chuyến.`,
      assignedCount,
      totalUnassigned: unassignedTrips.length
    };
  }

  // -------------------------------------------------------------
  // Hoi Dong Cham Bao Cao & Tong Ket Diem
  // -------------------------------------------------------------
  async createBoard(
    scheduleId: number,
    name: string,
    date: Date,
    room: string,
  ) {
    const hd = new HoiDongChamBaoCao();
    hd.lich_kien_tap_id = scheduleId;
    hd.ten_hoi_dong = name;
    hd.ngay_bao_cao = date;
    hd.dia_diem = room;
    return this.hdRepo.save(hd);
  }

  async addBoardMember(boardId: number, lecturerId: number, role: string) {
    const m = new HoiDong_ThanhVien();
    m.hoi_dong_id = boardId;
    m.giang_vien_id = lecturerId;
    m.vai_tro = role;
    return this.hdTvRepo.save(m);
  }

  async autoSelectRepresentativeTrips(dksvId: number) {
    const dksv = await this.dksvRepo.findOne({ where: { id: dksvId } });
    if (!dksv) return;

    const exist = await this.boRepo.findOne({
      where: { dot_kien_tap_sinh_vien_id: dksvId },
    });
    if (exist) return;

    const phieus = await this.phieuRepo.find({
      where: {
        sinh_vien_id: dksv.sinh_vien_id,
        trang_thai: In(['HopLe']),
      },
      relations: { chuyenThamQuan: true },
    });

    const directPhieus = phieus.filter(
      (p) => p.chuyenThamQuan.hinh_thuc === 'TrucTiep',
    );
    const onlinePhieus = phieus.filter(
      (p) => p.chuyenThamQuan.hinh_thuc === 'TrucTuyen',
    );

    if (directPhieus.length < 2 || onlinePhieus.length < 1) {
      return;
    }

    const getTripScore = async (phieuId: number) => {
      const phieuTQ = await this.dataSource.manager.findOne('PhieuThamQuan', { where: { phieu_dang_ky_id: phieuId } });
      if (!phieuTQ) return 0;
      const ptqId = (phieuTQ as any).id;

      const score = await this.diemPhieuRepo.findOne({
        where: { phieu_tham_quan_id: ptqId },
      });
      if (!score) return 0;

      const report = await this.baiRepo.findOne({
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
    const savedBo = await this.boRepo.save(bo);

    const selected = [
      directScores[0].phieu.id,
      directScores[1].phieu.id,
      onlineScores[0].phieu.id,
    ];

    for (const rId of selected) {
      const phieuTQ = await this.phieuTQRepo.findOne({ where: { phieu_dang_ky_id: rId } });
      if (phieuTQ) {
        phieuTQ.bo_chuyen_bao_cao_id = savedBo.id;
        await this.phieuTQRepo.save(phieuTQ);
      }
    }
  }

  async lockAndFinalizeGrades(termStudentId: number, userId: number) {
    const dksv = await this.dksvRepo.findOne({
      where: { id: termStudentId },
      relations: { sinhVien: true },
    });
    if (!dksv)
      throw new NotFoundException(
        'Không tìm thấy đợt kiến tập của sinh viên',
      );

    let bo = await this.boRepo.findOne({
      where: { dot_kien_tap_sinh_vien_id: termStudentId },
    });
    if (!bo) {
      await this.autoSelectRepresentativeTrips(termStudentId);
      bo = await this.boRepo.findOne({
        where: { dot_kien_tap_sinh_vien_id: termStudentId },
      });
    }
    if (!bo) {


      dksv.trang_thai = 'KhongDat';
      await this.dksvRepo.save(dksv);

      return {
        message:
          'Sinh viên không có đủ 3 chuyến đi hợp lệ. Học phần được đánh dấu Chưa hoàn thành / Không đạt.',
        ket_qua: 'ChuaHoanThanh',
      };
    }

    const mappings = await this.phieuTQRepo.find({
      where: { bo_chuyen_bao_cao_id: bo.id },
      relations: { phieuDangKy: { chuyenThamQuan: true } },
    });

    if (mappings.length !== 3) {
      throw new BadRequestException(
        'Bộ chuyến báo cáo của sinh viên không đầy đủ 3 chuyến.',
      );
    }

    let sumTripScores = 0;
    for (const phieuTQ of mappings) {
      const score = await this.diemPhieuRepo.findOne({
        where: { phieu_tham_quan_id: phieuTQ.id },
      });
      if (!score) {
        throw new BadRequestException(
          `Chuyến đi có mã phiếu tham quan ${phieuTQ.id} chưa được chấm điểm đầy đủ.`,
        );
      }

      if (
        score.diem_hoi_dong_final === null ||
        score.diem_hoi_dong_final === undefined
      ) {
        throw new BadRequestException(
          `Không thể khóa điểm do hội đồng chưa chấm xong điểm báo cáo TQNM cho chuyến đi của phiếu tham quan ${phieuTQ.id}.`,
        );
      }

      const report = await this.baiRepo.findOne({
        where: { phieu_tham_quan_id: phieuTQ.id },
        order: { ngay_nop: 'DESC' },
      });

      const tripDate = new Date(phieuTQ.phieuDangKy.chuyenThamQuan.ngay_tham_quan);
      let diffDays = 999;
      if (report) {
        const diffTime = report.ngay_nop.getTime() - tripDate.getTime();
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const diemChuanBi = Number(score.diem_chuan_bi || 0);
      const diemThuHoach = Number(score.diem_thu_hoach || 0);
      const diemBaoCao = Number(score.diem_hoi_dong_final || 0);
      const diemCong = Number(score.diem_cong_final || 0);

      let tripScore =
        diemChuanBi * 0.3 +
        diemThuHoach * 0.3 +
        diemBaoCao * 0.4 +
        diemCong;

      if (diffDays > 20) {
        tripScore = 0;
      } else if (diffDays > 10) {
        tripScore = Math.max(0, tripScore - 1.0);
      }

      sumTripScores += tripScore;

      score.da_khoa = true;
      score.ngay_khoa = new Date();
      await this.diemPhieuRepo.save(score);
    }

    const finalScore = Number((sumTripScores / 3).toFixed(2));



    dksv.trang_thai = finalScore >= 5.0 ? 'Dat' : 'KhongDat';
    await this.dksvRepo.save(dksv);

    return {
      message: 'Khóa điểm và tổng kết học phần thành công',
      finalScore,
      ket_qua: dksv.trang_thai,
    };
  }

  async getRetakeStudentsReport() {
    return this.svRepo.find({
      where: { hoc_lai: true },
      relations: { khoaHoc: true },
    });
  }

  async getFinalResultsReport(dotKienTapId: number) {
    const enrollments = await this.dksvRepo.find({
      where: { dot_kien_tap_id: dotKienTapId },
      relations: {
        sinhVien: true,
      },
    });

    if (enrollments.length === 0) return [];

    const diemList = await this.diemPhieuRepo.find({
      where: {
        phieuThamQuan: {
          phieuDangKy: {
            sinh_vien_id: In(enrollments.map(e => e.sinh_vien_id)),
            chuyenThamQuan: {
              lichKienTap: {
                dot_kien_tap_id: dotKienTapId
              }
            }
          }
        }
      },
      relations: {
        phieuThamQuan: {
          phieuDangKy: true
        }
      }
    });

    const diemMap = new Map();
    for (const d of diemList) {
      const svId = d.phieuThamQuan?.phieuDangKy?.sinh_vien_id;
      if (svId) {
        diemMap.set(svId, d);
      }
    }

    return enrollments.map(e => {
      const diem = diemMap.get(e.sinh_vien_id);
      return {
        ...e,
        diem_chuan_bi: diem?.diem_chuan_bi ?? null,
        diem_thu_hoach: diem?.diem_thu_hoach ?? null,
        diem_hoi_dong_final: diem?.diem_hoi_dong_final ?? null,
        diem_cong_final: diem?.diem_cong_final ?? null,
        diem_tong_chuyen: diem?.diem_tong_chuyen ?? null,
        diem_tong_ket: diem?.diem_tong_chuyen ?? null, // Backward compatibility
        trang_thai: e.trang_thai // Merge status
      };
    });
  }

  async getVisitedStudentsReport(lichKienTapId?: number, dotKienTapId?: number) {
    const phieus = await this.phieuRepo.find({
      where: {
        trang_thai: In(['HopLe']),
        ...(lichKienTapId ? { chuyenThamQuan: { lich_kien_tap_id: lichKienTapId } } : {}),
        ...(dotKienTapId ? { chuyenThamQuan: { lichKienTap: { dot_kien_tap_id: dotKienTapId } } } : {}),
      },
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

    const visitedStudents = await this.getVisitedStudentsReport(undefined, dotKienTapId);
    const visitedSet = new Set(visitedStudents.map((sv) => sv.id));

    const notVisited: any[] = [];
    const seen = new Set();
    for (const en of enrollments) {
      if (en.sinhVien && !visitedSet.has(en.sinhVien.id) && !seen.has(en.sinhVien.id)) {
        notVisited.push(en.sinhVien);
        seen.add(en.sinhVien.id);
      }
    }
    return notVisited;
  }

  async getEligibleStudentsReport(lichKienTapId?: number) {
    const phieus = await this.phieuRepo.find({
      where: {
        trang_thai: In(['HopLe']),
        ...(lichKienTapId ? { chuyenThamQuan: { lich_kien_tap_id: lichKienTapId } } : {}),
      },
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

    const eligible: any[] = [];
    for (const stats of svStats.values()) {
      if (stats.direct >= 2 && stats.online >= 1) {
        eligible.push(stats.sv);
      }
    }
    return eligible;
  }

  // Dashboard overview stats
  async getDashboardStats() {
    const studentCount = await this.svRepo.count();
    const lecturerCount = await this.gvRepo.count();
    const factoryCount = await this.nhaMayRepo.count();
    const campaignCount = await this.dotRepo.count();

    const pendingCancelCount = await this.huyRepo.count({
      where: { trang_thai_duyet: 'ChoDuyet' },
    });

    const pendingRefundCount = await this.hoanPhiRepo.count({
      where: { trang_thai: 'ChoXuLy' },
    });

    return {
      studentCount,
      lecturerCount,
      factoryCount,
      campaignCount,
      pendingCancelCount,
      pendingRefundCount,
    };
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
      .leftJoinAndSelect('phieu.hoaDon', 'hoaDon');

    if (search) {
      queryBuilder.andWhere(
        '(sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search OR nhaMay.ten_nha_may LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status && status !== 'All') {
      queryBuilder.andWhere('phieu.trang_thai = :status', { status });
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
  async getEnrollments(page: number = 1, limit: number = 10, search?: string, dotKienTapId?: number) {
    const queryBuilder = this.dksvRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.sinhVien', 'sinhVien')
      .leftJoinAndSelect('enrollment.dotKienTap', 'dot');

    if (dotKienTapId) {
      queryBuilder.andWhere('enrollment.dot_kien_tap_id = :dotKienTapId', { dotKienTapId });
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

    if (data.length > 0 && dotKienTapId) {
      const sinhVienIds = data.map((e) => e.sinh_vien_id);
      const phieus = await this.phieuRepo.find({
        where: {
          sinh_vien_id: In(sinhVienIds),
          trang_thai: 'HopLe',
          chuyenThamQuan: {
            lichKienTap: { dot_kien_tap_id: dotKienTapId }
          },
        },
        relations: {
          chuyenThamQuan: {
            nhaMay: true,
          },
          phieuThamQuan: {
            diemPhieuThamQuan: true,
          },
        },
        order: {
          chuyenThamQuan: {
            ngay_tham_quan: 'ASC',
          },
        },
      });

      data.forEach((e: any) => {
        const studentTrips = phieus.filter((p) => p.sinh_vien_id === e.sinh_vien_id);
        e.trips = studentTrips.map((p) => ({
          nhaMay: p.chuyenThamQuan?.nhaMay?.ten_nha_may,
          diem_chuan_bi: p.phieuThamQuan?.diemPhieuThamQuan?.diem_chuan_bi,
          diem_bao_cao: p.phieuThamQuan?.diemPhieuThamQuan?.diem_thu_hoach,
          diem_van_dap: p.phieuThamQuan?.diemPhieuThamQuan?.diem_hoi_dong_final,
          diem_cong: p.phieuThamQuan?.diemPhieuThamQuan?.diem_cong_final,
          diem_tong_nm: p.phieuThamQuan?.diemPhieuThamQuan?.diem_tong_chuyen,
        }));
      });
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get all notifications
  async getNotifications() {
    return this.thongBaoRepo.find({
      relations: {
        nguoiGui: true,
        khoaHoc: true,
      },
      order: { ngay_gui: 'DESC' },
    });
  }

  // Create a new notification
  async createNotification(data: {
    tieu_de: string;
    noi_dung: string;
    nguoi_gui_id: number;
    khoa_hoc_id?: number;
    file_url?: string;
    file_name?: string;
  }) {
    const notif = new ThongBao();
    notif.tieu_de = data.tieu_de;
    notif.noi_dung = data.noi_dung;
    notif.nguoi_gui_id = data.nguoi_gui_id;
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
    }

    // Queue background jobs for email and reminder notification
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

    return savedNotif;
  }

  async bulkConfirmPayments(records: { noi_dung_chuyen_khoan: string; so_tien?: number }[]) {
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
      }
      successCount++;
    }
    return { message: `Đối chiếu xong: ${successCount} hóa đơn cập nhật, ${notFoundCount} không tìm thấy nội dung chuyển khoản khớp.` };
  }

  async confirmManualPayment(hoaDonId: number) {
    const hd = await this.hoaDonRepo.findOne({
      where: { id: hoaDonId },
      relations: { phieuDangKy: true },
    });
    if (!hd) throw new NotFoundException('Không tìm thấy hóa đơn');
    if (hd.trang_thai !== 'ChuaDong') {
      throw new BadRequestException('Hóa đơn này đã được xử lý thanh toán trước đó');
    }
    
    const now = new Date();
    hd.trang_thai = (hd.han_dong && now > hd.han_dong) ? 'DaDongTreHan' : 'DaDongDungHan';
    hd.ngay_dong_thuc_te = now;
    await this.hoaDonRepo.save(hd);
    
    if (hd.phieuDangKy) {
      hd.phieuDangKy.trang_thai = 'HopLe';
      await this.phieuRepo.save(hd.phieuDangKy);
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
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    // Ghep thanh 1 chuoi duy nhat, loai bo dau cach, viet hoa
    const fileText = rows
      .map((row) => row.join('|'))
      .join('\n')
      .replace(/\s+/g, '')
      .toUpperCase();

    // 2. Lay danh sach HoaDon ChuaDong
    const chuaDongs = await this.hoaDonRepo.find({
      where: { trang_thai: 'ChuaDong' },
    });

    let countSuccess = 0;
    const updatedInvoices: HoaDonLePhi[] = [];

    // 3. Quet
    for (const hd of chuaDongs) {
      if (hd.noi_dung_chuyen_khoan) {
        const code = hd.noi_dung_chuyen_khoan.replace(/\s+/g, '').toUpperCase();
        if (code && fileText.includes(code)) {
          hd.trang_thai = 'DaDong';
          updatedInvoices.push(hd);
          countSuccess++;
        }
      }
    }

    if (updatedInvoices.length > 0) {
      await this.hoaDonRepo.save(updatedInvoices);
    }

    return {
      message: 'Hoàn tất quét sao kê',
      success: countSuccess,
      totalUnpaidChecked: chuaDongs.length,
    };
  }
}
