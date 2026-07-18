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
  async getTrips() { return this.chuyenRepo.find({ relations: { nhaMay: true, lichKienTap: true, deXuatBoi: true } }); }

  async updateDotKienTapStatus(dotId: number) {
    const dot = await this.dotRepo.findOne({ where: { id: dotId } });
    if (!dot) return;

    const liches = await this.lichRepo.find({ where: { dot_kien_tap_id: dotId } });
    if (liches.length === 0) {
      dot.trang_thai = 'Nhap';
      await this.dotRepo.save(dot);
      return;
    }

    const statuses = liches.map(l => l.trang_thai);

    if (statuses.every(s => s === 'DaKhoa')) {
      dot.trang_thai = 'DaKhoa';
    } else if (statuses.every(s => s === 'DaKetThuc' || s === 'DaKhoa')) {
      dot.trang_thai = 'DaKetThuc';
    } else if (statuses.some(s => s === 'MoDangKy' || s === 'DangDienRa')) {
      dot.trang_thai = 'DangTrienKhai';
    } else if (statuses.every(s => s === 'Nhap')) {
      dot.trang_thai = 'Nhap';
    }

    await this.dotRepo.save(dot);
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
        .andWhere('chuyen.ngay_tham_quan >= :date', { date: record.ngay_ghi_nhan })
        .getCount();

      if (record.ly_do === 'HuyKhongMinhChung') {
        const limit = 3;
        if (occurredTripsCount >= limit) {
          record.con_hieu_luc = false;
          await this.blacklistRepo.save(record);
        } else {
          bannedFromRegistration = true;
          remainingBannedTrips = Math.max(remainingBannedTrips, limit - occurredTripsCount);
        }
      } else if (record.ly_do === 'KhongDongPhi' || record.ly_do === 'DangKyKhongThamGia') {
        const limit = 5;
        if (occurredTripsCount >= limit) {
          record.con_hieu_luc = false;
          await this.blacklistRepo.save(record);
        } else {
          demotedPriority = true;
          remainingDemotedTrips = Math.max(remainingDemotedTrips, limit - occurredTripsCount);
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
    const trips = await this.chuyenRepo.find({
      where: {
        de_xuat_boi_id: sinhVienId,
        cach_to_chuc: 'TuDo',
        trang_thai_duyet_tudo: 'DaDuyet',
      }
    });

    for (const trip of trips) {
      const exists = await this.danDoanRepo.findOne({
        where: { chuyen_tham_quan_id: trip.id }
      });
      if (!exists) {
        const dd = new ChuyenThamQuan_GiangVienDanDoan();
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
    const date = new Date(data.ngay_tham_quan);
    const startStr = data.gio_bat_dau;
    const endStr = data.gio_ket_thuc;

    const overlap = await this.chuyenRepo.findOne({
      where: {
        nha_may_id: data.nha_may_id,
        ngay_tham_quan: date,
        gio_bat_dau: startStr,
        gio_ket_thuc: endStr,
      }
    });
    if (overlap) {
      throw new BadRequestException('Đã tồn tại chuyến tham quan tại nhà máy này trong cùng ngày và khung giờ này');
    }

    const nhaMay = await this.nhaMayRepo.findOne({ where: { id: data.nha_may_id } });
    if (!nhaMay) throw new NotFoundException('Không tìm thấy nhà máy');
    if (data.hinh_thuc === 'TrucTuyen' && !nhaMay.ho_tro_truc_tuyen) {
      throw new BadRequestException('Nhà máy này không hỗ trợ tham quan trực tuyến');
    }
    if (data.hinh_thuc === 'TrucTiep' && !nhaMay.ho_tro_truc_tiep) {
      throw new BadRequestException('Nhà máy này không hỗ trợ tham quan trực tiếp');
    }

    if (data.cach_to_chuc === 'TuDo' && data.suc_chua !== 1) {
      throw new BadRequestException('Mỗi chuyến tự do chỉ phục vụ đúng 1 sinh viên (sức chứa phải bằng 1)');
    }

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

    if (isApproved) {
      const lksv = await this.lksvRepo.findOne({
        where: { sinh_vien_id: trip.de_xuat_boi_id, trang_thai: 'DangThucHien' }
      });
      if (lksv) {
        const pc = await this.pcGvhdRepo.findOne({
          where: { lich_kien_tap_sinh_vien_id: lksv.id, trang_thai: 'DangHoatDong' }
        });
        if (pc) {
          const exist = await this.danDoanRepo.findOne({
            where: { chuyen_tham_quan_id: trip.id, giang_vien_id: pc.giang_vien_id }
          });
          if (!exist) {
            const dd = new ChuyenThamQuan_GiangVienDanDoan();
            dd.chuyen_tham_quan_id = trip.id;
            dd.giang_vien_id = pc.giang_vien_id;
            dd.la_truong_doan = true;
            await this.danDoanRepo.save(dd);
          }
        }
      }
    }

    return { message: isApproved ? 'Duyệt chuyến đi tự do thành công' : 'Từ chối chuyến đi tự do thành công' };
  }

  // Duyet thanh toan dang ky cua Sinh Vien
  async approveRegistrationPayment(registrationId: number, isApproved: boolean) {
    const phieu = await this.phieuRepo.findOne({
      where: { id: registrationId },
      relations: { hoaDon: true }
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

  // Duyet yeu cau huy dang ky cua Sinh Vien
  async approveCancelRequest(requestId: number, approverId: number, isApproved: boolean) {
    const req = await this.huyRepo.findOne({ where: { id: requestId }, relations: { phieuDangKy: true } });
    if (!req) throw new NotFoundException('Không tìm thấy yêu cầu hủy');

    req.nguoi_duyet_id = approverId;
    req.ngay_duyet = new Date();
    req.trang_thai_duyet = isApproved ? 'DaDuyet' : 'TuChoi';
    await this.huyRepo.save(req);

    if (isApproved) {
      req.phieuDangKy.trang_thai = 'DaHuy';
      await this.phieuRepo.save(req.phieuDangKy);

      const hd = await this.hoaDonRepo.findOne({ where: { phieu_dang_ky_id: req.phieu_dang_ky_id } });
      if (hd && hd.trang_thai === 'DaDongDungHan') {
        hd.trang_thai = 'DaHoanPhi';
        await this.hoaDonRepo.save(hd);
      }
    } else {
      req.phieuDangKy.trang_thai = 'DaHuy';
      await this.phieuRepo.save(req.phieuDangKy);

      const black = new DanhSachDen();
      black.sinh_vien_id = req.phieuDangKy.sinh_vien_id;
      black.ly_do = 'HuyKhongMinhChung';
      black.phieu_dang_ky_id = req.phieu_dang_ky_id;
      black.ngay_ghi_nhan = new Date();
      black.con_hieu_luc = true;
      await this.blacklistRepo.save(black);
    }

    return { message: 'Xử lý yêu cầu hủy thành công' };
  }

  // -------------------------------------------------------------
  // Phieu Dang Ky & Lọc Danh Sach Tu Dong (3 Tầng ưu tiên + Trùng Lịch / Quá Số Lượng)
  // -------------------------------------------------------------
  async filterAndAssignStudents(tripId: number) {
    const trip = await this.chuyenRepo.findOne({
      where: { id: tripId },
      relations: { lichKienTap: { dotKienTap: { namHoc: true } } }
    });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến đi');

    await this.scanAndMarkLatePayments();

    const phieus = await this.phieuRepo.find({
      where: { chuyen_tham_quan_id: tripId, trang_thai: In(['ChoDuyet', 'HopLe']) },
      relations: { sinhVien: { khoa: true } },
    });

    if (phieus.length === 0) return { message: 'Không có đăng ký nào cần lọc' };

    const startYearStr = trip.lichKienTap.dotKienTap.namHoc.ten_nam_hoc.split('-')[0];
    const startYear = parseInt(startYearStr, 10);

    const eligibleStats: { phieu: PhieuDangKy; penalties: any; finishedCount: number; courseNumber: number }[] = [];

    for (const p of phieus) {
      const penalties = await this.checkAndUpdatePenalties(p.sinh_vien_id);
      
      if (penalties.bannedFromRegistration) {
        p.trang_thai = 'BiLoai';
        await this.phieuRepo.save(p);
        continue;
      }

      const studyYear = startYear - p.sinhVien.khoa.nam_nhap_hoc + 1;
      if (studyYear < 2) {
        p.trang_thai = 'BiLoai';
        await this.phieuRepo.save(p);
        continue;
      }

      const finishedCount = await this.phieuRepo.count({
        where: {
          sinh_vien_id: p.sinh_vien_id,
          trang_thai: In(['HoanThanh', 'DaThamGia', 'HopLe'])
        }
      });
      if (finishedCount >= 3) {
        p.trang_thai = 'BiLoai';
        await this.phieuRepo.save(p);
        continue;
      }

      const sameDayRegistered = await this.phieuRepo.find({
        where: {
          sinh_vien_id: p.sinh_vien_id,
          trang_thai: In(['HopLe', 'DaThamGia', 'HoanThanh'])
        },
        relations: { chuyenThamQuan: true }
      });
      const overlap = sameDayRegistered.some(
        reg => reg.chuyen_tham_quan_id !== tripId &&
               new Date(reg.chuyenThamQuan.ngay_tham_quan).toDateString() === new Date(trip.ngay_tham_quan).toDateString()
      );
      if (overlap) {
        p.trang_thai = 'BiLoai';
        await this.phieuRepo.save(p);
        continue;
      }

      const match = p.sinhVien.khoa.ten_khoa.match(/^\d+/);
      const courseNumber = match ? parseInt(match[0], 10) : 99;

      eligibleStats.push({
        phieu: p,
        penalties,
        finishedCount,
        courseNumber
      });
    }

    const group1 = eligibleStats.filter(e => (e.courseNumber === 12 || e.courseNumber === 13) && e.finishedCount === 0 && !e.penalties.demotedPriority);
    const group2 = eligibleStats.filter(e => e.courseNumber === 14 && e.finishedCount === 0 && !e.penalties.demotedPriority);

    const group3 = eligibleStats.filter(e => !group1.includes(e) && !group2.includes(e) && !e.penalties.demotedPriority);
    const group4 = eligibleStats.filter(e => e.penalties.demotedPriority);

    const sortFn = (a: any, b: any) => new Date(a.phieu.ngay_dang_ky).getTime() - new Date(b.phieu.ngay_dang_ky).getTime();
    group1.sort(sortFn);
    group2.sort(sortFn);
    group3.sort(sortFn);
    group4.sort(sortFn);
    const sortedList = [...group1, ...group2, ...group3, ...group4];

    let count = 0;
    const capacity = trip.suc_chua;
    for (const item of sortedList) {
      if (count < capacity) {
        item.phieu.trang_thai = 'HopLe';
        count++;
      } else {
        item.phieu.trang_thai = 'BiLoai';
      }
      await this.phieuRepo.save(item.phieu);
    }

    trip.trang_thai = 'DaChotDanhSach';
    await this.chuyenRepo.save(trip);

    return { message: 'Đã hoàn tất lọc danh sách tự động theo thứ tự ưu tiên', accepted: count };
  }

  // -------------------------------------------------------------
  // Phan Cong GVHD & GVDD
  // -------------------------------------------------------------
  async assignLecturerGuide(lichKienTapSinhVienId: number, lecturerId: number) {
    const lksv = await this.lksvRepo.findOne({ where: { id: lichKienTapSinhVienId } });
    if (!lksv) throw new NotFoundException('Không tìm thấy đăng ký học phần');

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

    await this.assignGvhdToTuDoTrips(lksv.sinh_vien_id, lecturerId);

    return { success: true, pc };
  }

  async assignTourLeader(tripId: number, lecturerId: number, laTruongDoan: boolean) {
    const trip = await this.chuyenRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

    if (trip.trang_thai === 'DaDienRa' || trip.trang_thai === 'DaHuy') {
      throw new BadRequestException('Không thể cập nhật giảng viên dẫn đoàn sau khi chuyến tham quan đã diễn ra hoặc bị hủy');
    }

    const sameDayLedTrips = await this.danDoanRepo.find({
      where: { giang_vien_id: lecturerId },
      relations: { chuyenThamQuan: true }
    });
    const overlap = sameDayLedTrips.some(
      (m) =>
        m.chuyen_tham_quan_id !== tripId &&
        new Date(m.chuyenThamQuan.ngay_tham_quan).toDateString() === new Date(trip.ngay_tham_quan).toDateString()
    );
    if (overlap) {
      throw new BadRequestException('Giảng viên đã được phân công dẫn đoàn cho một chuyến tham quan khác trong cùng ngày');
    }

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

  async autoSelectRepresentativeTrips(lksvId: number) {
    const lksv = await this.lksvRepo.findOne({ where: { id: lksvId } });
    if (!lksv) return;

    const exist = await this.boRepo.findOne({ where: { lich_kien_tap_sinh_vien_id: lksvId } });
    if (exist) return;

    const phieus = await this.phieuRepo.find({
      where: {
        sinh_vien_id: lksv.sinh_vien_id,
        trang_thai: In(['DaThamGia', 'HoanThanh', 'HopLe'])
      },
      relations: { chuyenThamQuan: true }
    });

    const directPhieus = phieus.filter(p => p.chuyenThamQuan.hinh_thuc === 'TrucTiep');
    const onlinePhieus = phieus.filter(p => p.chuyenThamQuan.hinh_thuc === 'TrucTuyen');

    if (directPhieus.length < 2 || onlinePhieus.length < 1) {
      return;
    }

    const getTripScore = async (phieuId: number) => {
      const score = await this.diemPhieuRepo.findOne({ where: { phieu_dang_ky_id: phieuId } });
      if (!score) return 0;

      const report = await this.baiRepo.findOne({
        where: { phieu_dang_ky_id: phieuId },
        order: { ngay_nop: 'DESC' }
      });
      const isLate = report?.trang_thai === 'TreHan';

      const prep = Number(score.diem_chuan_bi || 0);
      const reportScore = Number(score.diem_bai_thu_hoach || 0);
      const reportFinal = Math.max(0, reportScore - (isLate ? 1.0 : 0));
      const board = Number(score.diem_bao_cao_tqnm || 0);
      const bonus = Number(score.diem_cong || 0);

      return prep * 0.3 + reportFinal * 0.3 + board * 0.4 + bonus;
    };

    const directScores = [];
    for (const p of directPhieus) {
      const scoreVal = await getTripScore(p.id);
      directScores.push({ phieu: p, score: scoreVal });
    }
    directScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.phieu.chuyenThamQuan.ngay_tham_quan).getTime() - new Date(b.phieu.chuyenThamQuan.ngay_tham_quan).getTime();
    });

    const onlineScores = [];
    for (const p of onlinePhieus) {
      const scoreVal = await getTripScore(p.id);
      onlineScores.push({ phieu: p, score: scoreVal });
    }
    onlineScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.phieu.chuyenThamQuan.ngay_tham_quan).getTime() - new Date(b.phieu.chuyenThamQuan.ngay_tham_quan).getTime();
    });

    const bo = new BoChuyenBaoCao();
    bo.lich_kien_tap_sinh_vien_id = lksvId;
    bo.ngay_chon = new Date();
    bo.tu_dong = true;
    const savedBo = await this.boRepo.save(bo);

    const selected = [
      directScores[0].phieu.id,
      directScores[1].phieu.id,
      onlineScores[0].phieu.id
    ];

    for (const rId of selected) {
      const bcc = new BoChuyenBaoCao_Chuyen();
      bcc.bo_chuyen_bao_cao_id = savedBo.id;
      bcc.phieu_dang_ky_id = rId;
      await this.boCRepo.save(bcc);
    }
  }

  async lockAndFinalizeGrades(termStudentId: number, userId: number) {
    const lksv = await this.lksvRepo.findOne({ where: { id: termStudentId }, relations: { sinhVien: true } });
    if (!lksv) throw new NotFoundException('Không tìm thấy học phần đăng ký của sinh viên');

    let bo = await this.boRepo.findOne({ where: { lich_kien_tap_sinh_vien_id: termStudentId } });
    if (!bo) {
      await this.autoSelectRepresentativeTrips(termStudentId);
      bo = await this.boRepo.findOne({ where: { lich_kien_tap_sinh_vien_id: termStudentId } });
    }
    if (!bo) {
      let kq = await this.kqRepo.findOne({ where: { lich_kien_tap_sinh_vien_id: termStudentId } });
      if (!kq) {
        kq = new KetQuaHocPhan();
        kq.lich_kien_tap_sinh_vien_id = termStudentId;
      }
      kq.diem_tong_ket = null as any;
      kq.ket_qua = 'ChuaHoanThanh';
      kq.ngay_khoa = new Date();
      kq.nguoi_khoa_id = userId;
      await this.kqRepo.save(kq);

      lksv.trang_thai = 'KhongDat';
      await this.lksvRepo.save(lksv);

      return { message: 'Sinh viên không có đủ 3 chuyến đi hợp lệ. Học phần được đánh dấu Chưa hoàn thành / Không đạt.', ket_qua: 'ChuaHoanThanh' };
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

      if (score.diem_bao_cao_tqnm === null || score.diem_bao_cao_tqnm === undefined) {
        throw new BadRequestException(`Không thể khóa điểm do hội đồng chưa chấm xong điểm báo cáo TQNM cho chuyến đi của phiếu đăng ký ${map.phieu_dang_ky_id}.`);
      }

      const report = await this.baiRepo.findOne({
        where: { phieu_dang_ky_id: map.phieu_dang_ky_id },
        order: { ngay_nop: 'DESC' }
      });
      const isLate = report?.trang_thai === 'TreHan';

      const diemChuanBi = Number(score.diem_chuan_bi || 0);
      const diemThuHoach = Number(score.diem_bai_thu_hoach || 0);
      const diemThuHoachFinal = Math.max(0, diemThuHoach - (isLate ? 1.0 : 0));
      const diemBaoCao = Number(score.diem_bao_cao_tqnm || 0);
      const diemCong = Number(score.diem_cong || 0);

      const tripScore = (diemChuanBi * 0.3) + (diemThuHoachFinal * 0.3) + (diemBaoCao * 0.4) + diemCong;
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
    await this.scanAndMarkLatePayments();
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
