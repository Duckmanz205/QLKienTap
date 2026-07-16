import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import { TaskQueueService } from '../queue/task-queue.service';
import {
  NamHoc,
  HocKy,
  Khoa,
  TaiKhoan,
  SinhVien,
  GiangVien,
  NhaMay,
  ThongBao,
  ThongBaoFile,
  DotKienTap,
  LichKienTap,
  LichKienTap_SinhVien,
  ChuyenThamQuan,
  ChuyenThamQuan_GiangVienDanDoan,
  PhieuDangKy,
  YeuCauHuyDangKy,
  DanhSachDen,
  HoaDonLePhi,
  DonHoanPhi,
  PhanCongGVHD,
  DiemDanh,
  BaiThuHoach,
  DiemPhieuDangKy,
  HoiDongChamBaoCao,
  HoiDong_ThanhVien,
  DiemHoiDong_ChiTiet,
  BoChuyenBaoCao,
  BoChuyenBaoCao_Chuyen,
  KetQuaHocPhan,
} from '../entities/qlkt.entity';

@Injectable()
export class KhoaService {
  constructor(
    @InjectRepository(NamHoc) private namHocRepo: Repository<NamHoc>,
    @InjectRepository(HocKy) private hocKyRepo: Repository<HocKy>,
    @InjectRepository(Khoa) private khoaRepo: Repository<Khoa>,
    @InjectRepository(TaiKhoan) private taiKhoanRepo: Repository<TaiKhoan>,
    @InjectRepository(SinhVien) private svRepo: Repository<SinhVien>,
    @InjectRepository(GiangVien) private gvRepo: Repository<GiangVien>,
    @InjectRepository(NhaMay) private nhaMayRepo: Repository<NhaMay>,
    @InjectRepository(ThongBao) private thongBaoRepo: Repository<ThongBao>,
    @InjectRepository(ThongBaoFile) private tbFileRepo: Repository<ThongBaoFile>,
    @InjectRepository(DotKienTap) private dotRepo: Repository<DotKienTap>,
    @InjectRepository(LichKienTap) private lichRepo: Repository<LichKienTap>,
    @InjectRepository(LichKienTap_SinhVien) private lksvRepo: Repository<LichKienTap_SinhVien>,
    @InjectRepository(ChuyenThamQuan) private chuyenRepo: Repository<ChuyenThamQuan>,
    @InjectRepository(ChuyenThamQuan_GiangVienDanDoan) private danDoanRepo: Repository<ChuyenThamQuan_GiangVienDanDoan>,
    @InjectRepository(PhieuDangKy) private phieuRepo: Repository<PhieuDangKy>,
    @InjectRepository(YeuCauHuyDangKy) private huyRepo: Repository<YeuCauHuyDangKy>,
    @InjectRepository(DanhSachDen) private blacklistRepo: Repository<DanhSachDen>,
    @InjectRepository(HoaDonLePhi) private hoaDonRepo: Repository<HoaDonLePhi>,
    @InjectRepository(DonHoanPhi) private hoanPhiRepo: Repository<DonHoanPhi>,
    @InjectRepository(PhanCongGVHD) private pcGvhdRepo: Repository<PhanCongGVHD>,
    @InjectRepository(DiemDanh) private diemDanhRepo: Repository<DiemDanh>,
    @InjectRepository(BaiThuHoach) private baiRepo: Repository<BaiThuHoach>,
    @InjectRepository(DiemPhieuDangKy) private diemPhieuRepo: Repository<DiemPhieuDangKy>,
    @InjectRepository(HoiDongChamBaoCao) private hdRepo: Repository<HoiDongChamBaoCao>,
    @InjectRepository(HoiDong_ThanhVien) private hdTvRepo: Repository<HoiDong_ThanhVien>,
    @InjectRepository(DiemHoiDong_ChiTiet) private hdCtRepo: Repository<DiemHoiDong_ChiTiet>,
    @InjectRepository(BoChuyenBaoCao) private boRepo: Repository<BoChuyenBaoCao>,
    @InjectRepository(BoChuyenBaoCao_Chuyen) private boCRepo: Repository<BoChuyenBaoCao_Chuyen>,
    @InjectRepository(KetQuaHocPhan) private kqRepo: Repository<KetQuaHocPhan>,
    private readonly taskQueueService: TaskQueueService,
  ) {}

  // -------------------------------------------------------------
  // Danh Muc Nen CRUD
  // -------------------------------------------------------------
  async getYears() { return this.namHocRepo.find(); }
  async createYear(data: Partial<NamHoc>) { return this.namHocRepo.save(data); }

  async getTerms() { return this.hocKyRepo.find({ relations: { namHoc: true } }); }
  async createTerm(data: Partial<HocKy>) { return this.hocKyRepo.save(data); }

  async getCourses() { return this.khoaRepo.find(); }
  async createCourse(data: Partial<Khoa>) { return this.khoaRepo.save(data); }

  async getFactories() { return this.nhaMayRepo.find(); }
  async createFactory(data: Partial<NhaMay>) { return this.nhaMayRepo.save(data); }
  async updateFactory(id: number, data: Partial<NhaMay>) {
    await this.nhaMayRepo.update(id, data);
    return this.nhaMayRepo.findOne({ where: { id } });
  }

  // -------------------------------------------------------------
  // Giang Vien & Sinh Vien
  // -------------------------------------------------------------
  async getLecturers() { return this.gvRepo.find(); }
  async getStudents(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.svRepo.createQueryBuilder('sinhVien')
      .leftJoinAndSelect('sinhVien.khoa', 'khoa');

    if (search) {
      queryBuilder.where('sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search', { search: `%${search}%` });
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

  // -------------------------------------------------------------
  // Dot Kien Tap & Lich Kien Tap
  // -------------------------------------------------------------
  async getCampaigns() { return this.dotRepo.find({ relations: { namHoc: true, hocKy: true } }); }
  async createCampaign(data: Partial<DotKienTap>) { return this.dotRepo.save(data); }

  async getSchedules() { return this.lichRepo.find({ relations: { dotKienTap: true, khoa: true } }); }
  async createSchedule(data: Partial<LichKienTap>) { return this.lichRepo.save(data); }

  // Import Sinh Vien vao Lich Kien Tap
  async importStudentsToSchedule(lichId: number, studentIds: number[]) {
    for (const svId of studentIds) {
      const exist = await this.lksvRepo.findOne({ where: { lich_kien_tap_id: lichId, sinh_vien_id: svId } });
      if (!exist) {
        const item = new LichKienTap_SinhVien();
        item.lich_kien_tap_id = lichId;
        item.sinh_vien_id = svId;
        item.lan_dang_ky = 1;
        item.trang_thai = 'DangThucHien';
        await this.lksvRepo.save(item);
      }
    }
    return { success: true };
  }

  // -------------------------------------------------------------
  // Chuyen Tham Quan & Phieu Dang Ky
  // -------------------------------------------------------------
  async getTrips() { return this.chuyenRepo.find({ relations: { nhaMay: true, lichKienTap: true } }); }
  
  async createTrip(data: Partial<ChuyenThamQuan>) {
    return this.chuyenRepo.save(data);
  }

  // Duyet de xuat chuyen tu do cua Sinh Vien
  async approveProposeTrip(tripId: number, approverId: number, isApproved: boolean) {
    const trip = await this.chuyenRepo.findOne({ where: { id: tripId }, relations: { deXuatBoi: true } });
    if (!trip || trip.cach_to_chuc !== 'TuDo') {
      throw new NotFoundException('Không tìm thấy chuyến đi tự do');
    }

    trip.nguoi_duyet_id = approverId;
    trip.ngay_duyet = new Date();
    trip.trang_thai_duyet_tudo = isApproved ? 'DaDuyet' : 'TuChoi';
    trip.trang_thai = isApproved ? 'MoDangKy' : 'DaHuy';
    await this.chuyenRepo.save(trip);

    // Duyet phieu dang ky kem theo
    const phieu = await this.phieuRepo.findOne({ where: { chuyen_tham_quan_id: tripId, sinh_vien_id: trip.de_xuat_boi_id } });
    if (phieu) {
      phieu.trang_thai = isApproved ? 'HopLe' : 'BiLoai';
      await this.phieuRepo.save(phieu);
    }

    return { message: isApproved ? 'Duyệt chuyến đi tự do thành công' : 'Từ chối chuyến đi tự do thành công' };
  }

  // Duyet yeu cau huy dang ky cua Sinh Vien
  async approveCancelRequest(requestId: number, approverId: number, isApproved: boolean) {
    const req = await this.huyRepo.findOne({ where: { id: requestId }, relations: { phieuDangKy: true } });
    if (!req) throw new NotFoundException('Không tìm thấy yêu cầu hủy');

    req.nguoi_duyet_id = approverId;
    req.ngay_duyet = new Date();
    req.trang_thai_duyet = isApproved ? 'DaDuyet' : 'TuChoi';
    await this.huyRepo.save(req);

    if (isApproved) {
      // Cho phep huy
      req.phieuDangKy.trang_thai = 'DaHuy';
      await this.phieuRepo.save(req.phieuDangKy);

      // Hoan phi
      const hd = await this.hoaDonRepo.findOne({ where: { phieu_dang_ky_id: req.phieu_dang_ky_id } });
      if (hd && hd.trang_thai === 'DaDongDungHan') {
        hd.trang_thai = 'DaHoanPhi';
        await this.hoaDonRepo.save(hd);
      }
    } else {
      // Phạt: dua vao danh sach den do huy khong minh chung hop le
      const black = new DanhSachDen();
      black.sinh_vien_id = req.phieuDangKy.sinh_vien_id;
      black.ly_do = 'HuyKhongMinhChung';
      black.phieu_dang_ky_id = req.phieu_dang_ky_id;
      black.ngay_ghi_nhan = new Date();
      black.con_hieu_luc = true;
      await this.blacklistRepo.save(black);

      // Phieu chuyen sang vi pham hoac BiLoai
      req.phieuDangKy.trang_thai = 'BiLoai';
      await this.phieuRepo.save(req.phieuDangKy);
    }

    return { message: 'Xử lý yêu cầu hủy thành công' };
  }

  // -------------------------------------------------------------
  // Phieu Dang Ky & Lọc Danh Sach Tu Dong (3 Tầng ưu tiên)
  // -------------------------------------------------------------
  async filterAndAssignStudents(tripId: number) {
    const trip = await this.chuyenRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến đi');

    // 1. Lay tat ca cac phieu dang ky cua chuyen nay o trang thai ChoDuyet hoac HopLe
    const phieus = await this.phieuRepo.find({
      where: { chuyen_tham_quan_id: tripId, trang_thai: In(['ChoDuyet', 'HopLe']) },
      relations: { sinhVien: { khoa: true } },
    });

    if (phieus.length === 0) return { message: 'Không có đăng ký nào cần lọc' };

    // 2. Lay danh sach den dang hoat dong
    const activeBlacklist = await this.blacklistRepo.find({ where: { con_hieu_luc: true } });
    const blacklistedSvIds = activeBlacklist.map(b => b.sinh_vien_id);

    // 3. Phân chia va sap xep theo 3 tang uu tien
    // Tầng 1: Loại sinh viên trong Blacklist
    const validPhieus = phieus.filter(p => !blacklistedSvIds.includes(p.sinh_vien_id));
    const rejectedPhieus = phieus.filter(p => blacklistedSvIds.includes(p.sinh_vien_id));

    // Đánh dấu cac phieu bi loai khoi chuyen
    for (const rp of rejectedPhieus) {
      rp.trang_thai = 'BiLoai';
      await this.phieuRepo.save(rp);
    }

    // Tầng 2 & 3: Phân nhóm va sap xep
    const studentStats = [];
    for (const vp of validPhieus) {
      const finishedCount = await this.phieuRepo.count({
        where: { sinh_vien_id: vp.sinh_vien_id, trang_thai: In(['HoanThanh', 'DaThamGia']) },
      });
      studentStats.push({
        phieu: vp,
        sinhVien: vp.sinhVien,
        finishedCount,
      });
    }

    studentStats.sort((a, b) => {
      // 1. Uu tien hoc lai/khoa cu chua di chuyen nao
      const aIsOldAndNoTrips = a.sinhVien.hoc_lai && a.finishedCount === 0;
      const bIsOldAndNoTrips = b.sinhVien.hoc_lai && b.finishedCount === 0;
      if (aIsOldAndNoTrips && !bIsOldAndNoTrips) return -1;
      if (!aIsOldAndNoTrips && bIsOldAndNoTrips) return 1;

      // 2. Uu tien sinh vien khoa dung hang nhung chua di chuyen nao
      const aIsCurrentAndNoTrips = !a.sinhVien.hoc_lai && a.finishedCount === 0;
      const bIsCurrentAndNoTrips = !b.sinhVien.hoc_lai && b.finishedCount === 0;
      if (aIsCurrentAndNoTrips && !bIsCurrentAndNoTrips) return -1;
      if (!aIsCurrentAndNoTrips && bIsCurrentAndNoTrips) return 1;

      // 3. Sap xep theo thoi gian dang ky tang dan
      return new Date(a.phieu.ngay_dang_ky).getTime() - new Date(b.phieu.ngay_dang_ky).getTime();
    });

    // 4. Duyet va gan trang thai HopLe cho den khi het suc chua, con lai BiLoai
    let count = 0;
    const capacity = trip.suc_chua;
    for (const item of studentStats) {
      if (count < capacity) {
        item.phieu.trang_thai = 'HopLe';
        count++;
      } else {
        item.phieu.trang_thai = 'BiLoai';
      }
      await this.phieuRepo.save(item.phieu);
    }

    // Chốt danh sach chuyen đi
    trip.trang_thai = 'DaChotDanhSach';
    await this.chuyenRepo.save(trip);

    return { message: 'Đã hoàn tất lọc danh sách tự động theo thứ tự ưu tiên', accepted: count };
  }

  // -------------------------------------------------------------
  // Phan Cong GVHD & GVDD
  // -------------------------------------------------------------
  async assignLecturerGuide(lichKienTapSinhVienId: number, lecturerId: number) {
    const current = await this.pcGvhdRepo.findOne({
      where: { lich_kien_tap_sinh_vien_id: lichKienTapSinhVienId, trang_thai: 'DangHoatDong' },
    });
    if (current) {
      current.trang_thai = 'DaGo';
      await this.pcGvhdRepo.save(current);
    }

    const pc = new PhanCongGVHD();
    pc.lich_kien_tap_sinh_vien_id = lichKienTapSinhVienId;
    pc.giang_vien_id = lecturerId;
    pc.trang_thai = 'DangHoatDong';
    pc.ngay_phan_cong = new Date();
    await this.pcGvhdRepo.save(pc);

    return { success: true, pc };
  }

  async assignTourLeader(tripId: number, lecturerId: number, laTruongDoan: boolean) {
    const exist = await this.danDoanRepo.findOne({
      where: { chuyen_tham_quan_id: tripId, giang_vien_id: lecturerId },
    });
    if (exist) {
      exist.la_truong_doan = laTruongDoan;
      return this.danDoanRepo.save(exist);
    }

    const dd = new ChuyenThamQuan_GiangVienDanDoan();
    dd.chuyen_tham_quan_id = tripId;
    dd.giang_vien_id = lecturerId;
    dd.la_truong_doan = laTruongDoan;
    return this.danDoanRepo.save(dd);
  }

  // -------------------------------------------------------------
  // Hoi Dong Cham Bao Cao & Tong Ket Diem
  // -------------------------------------------------------------
  async createBoard(scheduleId: number, name: string, date: Date, room: string) {
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

  async lockAndFinalizeGrades(termStudentId: number, userId: number) {
    const lksv = await this.lksvRepo.findOne({ where: { id: termStudentId }, relations: { sinhVien: true } });
    if (!lksv) throw new NotFoundException('Không tìm thấy học phần đăng ký của sinh viên');

    const bo = await this.boRepo.findOne({ where: { lich_kien_tap_sinh_vien_id: termStudentId } });
    if (!bo) {
      throw new BadRequestException('Sinh viên chưa chọn bộ 3 chuyến báo cáo đại diện.');
    }

    const mappings = await this.boCRepo.find({
      where: { bo_chuyen_bao_cao_id: bo.id },
      relations: { phieuDangKy: true },
    });

    if (mappings.length !== 3) {
      throw new BadRequestException('Bộ chuyến báo cáo của sinh viên không đầy đủ 3 chuyến.');
    }

    let sumTripScores = 0;
    for (const map of mappings) {
      const score = await this.diemPhieuRepo.findOne({ where: { phieu_dang_ky_id: map.phieu_dang_ky_id } });
      if (!score) {
        throw new BadRequestException(`Chuyến đi ${map.phieu_dang_ky_id} chưa được chấm điểm đầy đủ.`);
      }

      const diemChuanBi = Number(score.diem_chuan_bi || 0);
      const diemThuHoach = Number(score.diem_bai_thu_hoach || 0);
      const diemBaoCao = Number(score.diem_bao_cao_tqnm || 0);
      const diemCong = Number(score.diem_cong || 0);

      const tripScore = (diemChuanBi * 0.3) + (diemThuHoach * 0.3) + (diemBaoCao * 0.4) + diemCong;
      sumTripScores += tripScore;

      score.da_khoa = true;
      await this.diemPhieuRepo.save(score);
    }

    const finalScore = Number((sumTripScores / 3).toFixed(2));

    let kq = await this.kqRepo.findOne({ where: { lich_kien_tap_sinh_vien_id: termStudentId } });
    if (!kq) {
      kq = new KetQuaHocPhan();
      kq.lich_kien_tap_sinh_vien_id = termStudentId;
    }
    kq.bo_chuyen_bao_cao_id = bo.id;
    kq.diem_tong_ket = finalScore;
    kq.ket_qua = finalScore >= 5.0 ? 'Dat' : 'KhongDat';
    kq.ngay_khoa = new Date();
    kq.nguoi_khoa_id = userId;
    await this.kqRepo.save(kq);

    lksv.trang_thai = finalScore >= 5.0 ? 'Dat' : 'KhongDat';
    await this.lksvRepo.save(lksv);

    return { message: 'Khóa điểm và tổng kết học phần thành công', finalScore, ket_qua: kq.ket_qua };
  }

  async getRetakeStudentsReport() {
    return this.svRepo.find({
      where: { hoc_lai: true },
      relations: { khoa: true },
    });
  }

  async getFinalResultsReport(lichKienTapId: number) {
    return this.kqRepo.find({
      where: { lichKienTapSinhVien: { lich_kien_tap_id: lichKienTapId } },
      relations: { lichKienTapSinhVien: { sinhVien: true }, boChuyenBaoCao: true },
    });
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
  ) {
    const queryBuilder = this.phieuRepo.createQueryBuilder('phieu')
      .leftJoinAndSelect('phieu.sinhVien', 'sinhVien')
      .leftJoinAndSelect('sinhVien.khoa', 'khoa')
      .leftJoinAndSelect('phieu.chuyenThamQuan', 'chuyen')
      .leftJoinAndSelect('chuyen.nhaMay', 'nhaMay')
      .leftJoinAndSelect('chuyen.lichKienTap', 'lich')
      .leftJoinAndSelect('phieu.yeuCauHuy', 'yeuCauHuy')
      .leftJoinAndSelect('phieu.hoaDon', 'hoaDon');

    if (search) {
      queryBuilder.andWhere('(sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search OR nhaMay.ten_nha_may LIKE :search)', { search: `%${search}%` });
    }

    if (status && status !== 'All') {
      queryBuilder.andWhere('phieu.trang_thai = :status', { status });
    }

    if (lichKienTapId) {
      queryBuilder.andWhere('chuyen.lich_kien_tap_id = :lichKienTapId', { lichKienTapId });
    }

    if (chuyenThamQuanId) {
      queryBuilder.andWhere('phieu.chuyen_tham_quan_id = :chuyenThamQuanId', { chuyenThamQuanId });
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
  async getRefundRequests(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.hoanPhiRepo.createQueryBuilder('don')
      .leftJoinAndSelect('don.hoaDon', 'hoaDon')
      .leftJoinAndSelect('hoaDon.phieuDangKy', 'phieu')
      .leftJoinAndSelect('phieu.sinhVien', 'sinhVien')
      .leftJoinAndSelect('phieu.chuyenThamQuan', 'chuyen')
      .leftJoinAndSelect('chuyen.nhaMay', 'nhaMay');

    if (search) {
      queryBuilder.andWhere('(sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search)', { search: `%${search}%` });
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
  async approveRefund(refundId: number, approverId: number, isApproved: boolean) {
    const don = await this.hoanPhiRepo.findOne({ where: { id: refundId }, relations: { hoaDon: true } });
    if (!don) throw new NotFoundException('Không tìm thấy đơn hoàn phí');

    don.nguoi_xu_ly_id = approverId;
    don.ngay_xu_ly = new Date();
    don.trang_thai = isApproved ? 'DaHoanTien' : 'TuChoi';
    await this.hoanPhiRepo.save(don);

    if (isApproved && don.hoaDon) {
      don.hoaDon.trang_thai = 'DaHoanPhi';
      await this.hoaDonRepo.save(don.hoaDon);
    }

    return { message: isApproved ? 'Phê duyệt hoàn phí thành công' : 'Từ chối hoàn phí thành công' };
  }

  // Get student enrollments for advisor assignment with pagination
  async getEnrollments(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.lksvRepo.createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.sinhVien', 'sinhVien')
      .leftJoinAndSelect('enrollment.lichKienTap', 'lich');

    if (search) {
      queryBuilder.andWhere('(sinhVien.mssv LIKE :search OR sinhVien.ho_ten LIKE :search)', { search: `%${search}%` });
    }

    const take = limit;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .orderBy('enrollment.id', 'DESC')
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

  // Get all notifications
  async getNotifications() {
    return this.thongBaoRepo.find({
      relations: {
        nguoiGui: true,
        khoa: true,
      },
      order: { ngay_gui: 'DESC' },
    });
  }

  // Create a new notification
  async createNotification(data: { tieu_de: string; noi_dung: string; nguoi_gui_id: number; khoa_id?: number }) {
    const notif = new ThongBao();
    notif.tieu_de = data.tieu_de;
    notif.noi_dung = data.noi_dung;
    notif.nguoi_gui_id = data.nguoi_gui_id;
    if (data.khoa_id) {
      notif.khoa_id = data.khoa_id;
    }
    notif.ngay_gui = new Date();
    notif.da_chinh_sua = false;
    
    const savedNotif = await this.thongBaoRepo.save(notif);

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
}
