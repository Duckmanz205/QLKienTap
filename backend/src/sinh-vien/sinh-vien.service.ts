import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, DataSource, EntityManager } from 'typeorm';
import {
  SinhVien,
  ChuyenThamQuan,
  PhieuDangKy,
  YeuCauHuyDangKy,
  HoaDonLePhi,
  DonHoanPhi,
  PhieuThamQuan,
  PhieuDeXuatChuyenThamQuan,
  DiemPhieuThamQuan,
  BaiThuHoach,
  DanhSachDen,
  BoChuyenBaoCao,
  DiemDanh,
  DotKienTap_SinhVien,
  NhaMay,
  ThongBao,
  LichKienTap,
  TaiKhoanThuHuong,
} from '../entities/qlkt.entity';

@Injectable()
export class SinhVienService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(SinhVien) private svRepo: Repository<SinhVien>,
    @InjectRepository(ChuyenThamQuan)
    private chuyenRepo: Repository<ChuyenThamQuan>,
    @InjectRepository(PhieuDangKy) private phieuRepo: Repository<PhieuDangKy>,
    @InjectRepository(YeuCauHuyDangKy)
    private huyRepo: Repository<YeuCauHuyDangKy>,
    @InjectRepository(HoaDonLePhi) private hoaDonRepo: Repository<HoaDonLePhi>,
    @InjectRepository(DonHoanPhi) private hoanPhiRepo: Repository<DonHoanPhi>,
    @InjectRepository(DiemDanh) private diemDanhRepo: Repository<DiemDanh>,
    @InjectRepository(DiemPhieuThamQuan) private diemPhieuRepo: Repository<DiemPhieuThamQuan>,
    @InjectRepository(PhieuThamQuan) private phieuTQRepo: Repository<PhieuThamQuan>,
    @InjectRepository(PhieuDeXuatChuyenThamQuan) private deXuatRepo: Repository<PhieuDeXuatChuyenThamQuan>,
    @InjectRepository(BaiThuHoach) private baiThuRepo: Repository<BaiThuHoach>,
    @InjectRepository(DotKienTap_SinhVien)
    private dksvRepo: Repository<DotKienTap_SinhVien>,
    @InjectRepository(BoChuyenBaoCao)
    private boChuyenRepo: Repository<BoChuyenBaoCao>,

    @InjectRepository(NhaMay) private nhaMayRepo: Repository<NhaMay>,
    @InjectRepository(ThongBao) private thongBaoRepo: Repository<ThongBao>,
    @InjectRepository(DanhSachDen)
    private blackListRepo: Repository<DanhSachDen>,
    @InjectRepository(LichKienTap) private lichRepo: Repository<LichKienTap>,
    @InjectRepository(TaiKhoanThuHuong) private taiKhoanThuHuongRepo: Repository<TaiKhoanThuHuong>,
  ) {}

  // Lay thong tin SV bang TaiKhoan ID
  async getStudentByAccountId(accountId: number) {
    const sv = await this.svRepo.findOne({
      where: { taikhoan_id: accountId },
      relations: { khoaHoc: true },
    });
    if (!sv) throw new NotFoundException('Không tìm thấy sinh viên');
    return sv;
  }

  async getFactories() {
    return this.nhaMayRepo.find();
  }

  async checkAndUpdatePenalties(studentId: number): Promise<{
    bannedFromRegistration: boolean;
    demotedPriority: boolean;
    remainingBannedTrips: number;
    remainingDemotedTrips: number;
  }> {
    const blacklistRecords = await this.blackListRepo.find({
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
          await this.blackListRepo.save(record);
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
          await this.blackListRepo.save(record);
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

  // Lay cac chuyen tham quan co the dang ky
  async getAvailableTrips(studentId: number) {
    // 1. Kiểm tra điều kiện sinh viên (Tối thiểu Năm 2)
    const sv = await this.svRepo.findOne({
      where: { id: studentId },
      relations: { khoaHoc: true },
    });
    if (!sv || !sv.khoaHoc) return [];

    const currentYear = new Date().getFullYear();
    const namHocThu = currentYear - sv.khoaHoc.nam_nhap_hoc + 1;
    if (namHocThu < 2) {
      // Chỉ năm 2 trở lên mới thấy chuyến
      return [];
    }

    // 2. Kiểm tra xem sinh viên có bị khóa đăng ký không
    const penalties = await this.checkAndUpdatePenalties(studentId);
    if (penalties.bannedFromRegistration) {
      throw new BadRequestException(
        `Bạn đang bị cấm đăng ký do vi phạm quy chế kiến tập (còn lại ${penalties.remainingBannedTrips} chuyến).`,
      );
    }

    // 3. Lấy danh sách TẤT CẢ chuyến đi của các lịch đang mở đăng ký
    const trips = await this.chuyenRepo.find({
      where: {
        trang_thai: 'MoDangKy',
        cach_to_chuc: 'DoKhoaToChuc',
      },
      relations: { nhaMay: true, lichKienTap: true },
    });

    // Dem so SV da dang ky tung chuyen
    const results: any[] = [];
    for (const trip of trips) {
      const count = await this.phieuRepo.count({
        where: {
          chuyen_tham_quan_id: trip.id,
          trang_thai: In(['HopLe', 'ChoDuyet']),
        },
      });
      results.push({
        ...trip,
        so_cho_da_dang_ky: count,
        con_trong: trip.suc_chua - count,
      });
    }

    return results;
  }

  // Lay lich su chuyến đi cua SV
  async getStudentRegisteredTrips(studentId: number) {
    return this.phieuRepo.find({
      where: { sinh_vien_id: studentId },
      relations: {
        chuyenThamQuan: { nhaMay: true },
        phieuThamQuan: { baiThuHoach: true },
        hoaDon: true,
        yeuCauHuy: true,
      },
      order: { ngay_dang_ky: 'DESC' },
    });
  }

  // Dang ky chuyen tham quan (Mo hinh Đang ky theo Khung gio & Xet duyet hang loat)
  async registerTrip(studentId: number, tripId: number) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. Kiem tra danh sach den
      const penalties = await this.checkAndUpdatePenalties(studentId);
      if (penalties.bannedFromRegistration) {
        throw new BadRequestException(
          `Bạn đang bị cấm đăng ký do vi phạm quy chế kiến tập (còn lại ${penalties.remainingBannedTrips} chuyến).`,
        );
      }

      const student = await manager.findOne(SinhVien, {
        where: { id: studentId },
        relations: { khoaHoc: true },
      });
      if (!student) throw new NotFoundException('Không tìm thấy sinh viên');

      const trip = await manager.findOne(ChuyenThamQuan, {
        where: { id: tripId },
        relations: { lichKienTap: { dotKienTap: { hocKy: { namHoc: true } } } },
      });
      if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');
      if (trip.trang_thai !== 'MoDangKy') {
        throw new BadRequestException('Chuyến đi này hiện đang đóng đăng ký');
      }


      const startYearStr =
        trip.lichKienTap.dotKienTap.hocKy.namHoc.ten_nam_hoc.split('-')[0];
      const startYear = parseInt(startYearStr, 10);
      const studyYear = startYear - student.khoaHoc.nam_nhap_hoc + 1;
      if (studyYear < 2) {
        throw new BadRequestException(
          'Chỉ sinh viên từ năm thứ 2 trở lên mới được phép đăng ký kiến tập',
        );
      }

      // Kiem tra da dang ky chuyen nay chua
      const exist = await manager.findOne(PhieuDangKy, {
        where: { sinh_vien_id: studentId, chuyen_tham_quan_id: tripId },
      });
      if (exist) {
        throw new BadRequestException('Bạn đã đăng ký chuyến đi này rồi');
      }

      // Kiem tra khong trung ngay voi bat ky chuyen nao khac da dang ky va chua bi huy/loai
      const existingSameDay = await manager.find(PhieuDangKy, {
        where: {
          sinh_vien_id: studentId,
          trang_thai: In(['ChoDuyet', 'HopLe']),
        },
        relations: { chuyenThamQuan: true },
      });
      const hasSameDay = existingSameDay.some(
        (p) =>
          new Date(p.chuyenThamQuan.ngay_tham_quan).toDateString() ===
          new Date(trip.ngay_tham_quan).toDateString(),
      );
      if (hasSameDay) {
        throw new BadRequestException(
          'Bạn không được đăng ký hai chuyến đi trùng ngày',
        );
      }

      // Giai doan 1: Ghi nhan PhieuDangKy o trang thai ChoDuyet.
      // Trong mo hinh nay, tat ca dang ky hop le trong khung gio deu duoc tiep nhan.
      // Sau khi het gio, Khoa se loc top N (N = suc_chua) de chuyen sang HopLe va phat hanh hoa don.
      const newPhieu = new PhieuDangKy();
      newPhieu.sinh_vien_id = studentId;
      newPhieu.chuyen_tham_quan_id = tripId;
      newPhieu.trang_thai = 'ChoDuyet';
      newPhieu.ngay_dang_ky = new Date();
      const savedPhieu = await manager.save(PhieuDangKy, newPhieu);

      return {
        message:
          'Đã ghi nhận yêu cầu đăng ký thành công. Vui lòng chờ Khoa chốt danh sách sau khi kết thúc đợt đăng ký.',
        phieu: savedPhieu,
      };
    });
  }

  // De xuat chuyen tu do
  async proposeTrip(
    studentId: number,
    ngayThamQuan: Date,
    gioBatDau: string,
    hinhThuc: string,
    nhaMayId?: number,
    tenNhaMayDeXuat?: string,
    diaChiDeXuat?: string,
    nguoiLienHeDeXuat?: string,
    sdtLienHeDeXuat?: string,
  ) {
    // Tìm đợt kiến tập đang mở đăng ký để gắn đề xuất vào
    const activeLich = await this.lichRepo.findOne({
      where: { trang_thai: 'MoDangKy' },
      relations: { dotKienTap: true }
    });
    
    if (!activeLich) {
      throw new BadRequestException(
        'Hiện tại không có lịch kiến tập nào đang mở đăng ký để nhận đề xuất',
      );
    }

    if (!nhaMayId && !tenNhaMayDeXuat) {
      throw new BadRequestException('Vui lòng chọn nhà máy hoặc nhập thông tin nhà máy đề xuất');
    }

    if (nhaMayId) {
      const nhaMay = await this.nhaMayRepo.findOne({ where: { id: nhaMayId } });
      if (!nhaMay) throw new NotFoundException('Không tìm thấy nhà máy');

      if (hinhThuc === 'TrucTuyen' && !nhaMay.ho_tro_truc_tuyen) {
        throw new BadRequestException(
          'Nhà máy này không hỗ trợ tham quan trực tuyến',
        );
      }
      if (hinhThuc === 'TrucTiep' && !nhaMay.ho_tro_truc_tiep) {
        throw new BadRequestException(
          'Nhà máy này không hỗ trợ tham quan trực tiếp',
        );
      }
    }

    const deXuat = new PhieuDeXuatChuyenThamQuan();
    if (nhaMayId) {
      deXuat.nha_may_id = nhaMayId;
    } else {
      deXuat.ten_nha_may_de_xuat = tenNhaMayDeXuat || '';
      deXuat.dia_chi_de_xuat = diaChiDeXuat || '';
      deXuat.nguoi_lien_he_de_xuat = nguoiLienHeDeXuat || '';
      deXuat.sdt_lien_he_de_xuat = sdtLienHeDeXuat || '';
    }
    
    deXuat.lich_kien_tap_id = activeLich.id;
    deXuat.ngay_tham_quan_de_xuat = ngayThamQuan;
    const startTimeDate = new Date(`1970-01-01T${gioBatDau.length === 5 ? gioBatDau + ':00' : gioBatDau}`);
    deXuat.gio_bat_dau_de_xuat = startTimeDate as any;
    deXuat.hinh_thuc = hinhThuc;
    deXuat.sinh_vien_id = studentId;
    deXuat.trang_thai_duyet = 'ChoDuyet';

    const saved = await this.deXuatRepo.save(deXuat);

    return {
      message: 'Đề xuất chuyến đi tự do thành công, đang chờ Khoa duyệt',
      chuyen: saved,
    };
  }

  async getStudentProposals(studentId: number) {
    return this.deXuatRepo.find({
      where: { sinh_vien_id: studentId },
      relations: { nhaMay: true },
      order: { id: 'DESC' },
    });
  }

  // Get Payment Config for student
  async getPaymentConfig() {
    const config = await this.taiKhoanThuHuongRepo.findOne({
      where: { trang_thai: 'HoatDong' },
      order: { id: 'DESC' },
    });
    return config || null;
  }

  // Yeu cau huy dang ky
  async requestCancel(
    studentId: number,
    registrationId: number,
    lyDo: string,
    fileMinhChung: string,
  ) {
    const phieu = await this.phieuRepo.findOne({
      where: { id: registrationId, sinh_vien_id: studentId },
    });
    if (!phieu) throw new NotFoundException('Không tìm thấy phiếu đăng ký');
    if (phieu.trang_thai === 'DaHuy' || phieu.trang_thai === 'BiLoai') {
      throw new BadRequestException(
        'Phiếu đăng ký này đã được hủy hoặc bị loại',
      );
    }

    const trip = await this.chuyenRepo.findOne({
      where: { id: phieu.chuyen_tham_quan_id },
    });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');
    const now = new Date();

    if (trip.trang_thai === 'DaDienRa' || new Date(trip.ngay_tham_quan) < now) {
      throw new BadRequestException(
        'Không thể hủy chuyến tham quan đã diễn ra',
      );
    }

    const tripDeparture = new Date(trip.ngay_tham_quan);
    const [hours, minutes] = trip.gio_bat_dau.toString().split(':');
    tripDeparture.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    const timeDiffMs = tripDeparture.getTime() - now.getTime();
    if (timeDiffMs < 24 * 60 * 60 * 1000) {
      throw new BadRequestException(
        'Không thể hủy trong vòng 24 giờ trước giờ khởi hành',
      );
    }

    if (!fileMinhChung || fileMinhChung.trim() === '') {
      phieu.trang_thai = 'DaHuy';
      await this.phieuRepo.save(phieu);

      const black = new DanhSachDen();
      black.sinh_vien_id = studentId;
      black.ly_do = 'HuyKhongMinhChung';
      black.phieu_dang_ky_id = registrationId;
      black.ngay_ghi_nhan = new Date();
      black.con_hieu_luc = true;
      await this.blackListRepo.save(black);

      return {
        message:
          'Đã hủy đăng ký thành công (Không có minh chứng, bạn bị mất quyền đăng ký trong 3 chuyến tiếp theo)',
      };
    }

    const currentReq = await this.huyRepo.findOne({
      where: { phieu_dang_ky_id: registrationId },
    });
    if (currentReq) {
      throw new BadRequestException(
        'Bạn đã gửi yêu cầu hủy cho chuyến đi này rồi',
      );
    }

    const cancelReq = new YeuCauHuyDangKy();
    cancelReq.phieu_dang_ky_id = registrationId;
    cancelReq.ly_do = lyDo;
    cancelReq.file_minh_chung = fileMinhChung;
    cancelReq.ngay_yeu_cau = new Date();
    cancelReq.trang_thai_duyet = 'ChoDuyet';
    await this.huyRepo.save(cancelReq);

    return {
      message: 'Gửi yêu cầu hủy đăng ký thành công, chờ Khoa xét duyệt',
    };
  }

  // Hoa don le phi cua SV
  async getInvoices(studentId: number) {
    const phieus = await this.phieuRepo.find({
      where: { sinh_vien_id: studentId },
    });
    const phieuIds = phieus.map((p) => p.id);
    if (phieuIds.length === 0) return [];

    return this.hoaDonRepo.find({
      where: { phieu_dang_ky_id: In(phieuIds) },
      relations: { phieuDangKy: { chuyenThamQuan: { nhaMay: true } } },
    });
  }

  // Gia lap thanh toan co kiem tra ownership va transaction
  async payInvoiceForStudent(studentId: number, invoiceId: number) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const hd = await manager.findOne(HoaDonLePhi, {
        where: { id: invoiceId },
        relations: { phieuDangKy: true },
      });
      if (!hd) throw new NotFoundException('Không tìm thấy hóa đơn');
      if (hd.phieuDangKy.sinh_vien_id !== studentId) {
        throw new BadRequestException(
          'Bạn không có quyền thanh toán hóa đơn của sinh viên khác',
        );
      }

      hd.ngay_dong_thuc_te = new Date();
      if (hd.ngay_dong_thuc_te <= hd.han_dong) {
        hd.trang_thai = 'DaDongDungHan';
        hd.phieuDangKy.trang_thai = 'HopLe';
        await manager.save(PhieuDangKy, hd.phieuDangKy);
      } else {
        hd.trang_thai = 'ViPham';
      }
      await manager.save(HoaDonLePhi, hd);

      return { message: 'Thanh toán hóa đơn thành công', hoaDon: hd };
    });
  }

  async payInvoice(invoiceId: number) {
    const hd = await this.hoaDonRepo.findOne({
      where: { id: invoiceId },
      relations: { phieuDangKy: true },
    });
    if (!hd) throw new NotFoundException('Không tìm thấy hóa đơn');

    hd.ngay_dong_thuc_te = new Date();
    if (hd.ngay_dong_thuc_te <= hd.han_dong) {
      hd.trang_thai = 'DaDongDungHan';
      hd.phieuDangKy.trang_thai = 'HopLe';
      await this.phieuRepo.save(hd.phieuDangKy);
    } else {
      hd.trang_thai = 'ViPham';
    }
    await this.hoaDonRepo.save(hd);

    return { message: 'Thanh toán hóa đơn thành công', hoaDon: hd };
  }

  // Gui yeu cau hoan le phi kiem tra ownership
  async requestRefundForStudent(
    studentId: number,
    invoiceId: number,
    fileScanUrl: string,
  ) {
    const hd = await this.hoaDonRepo.findOne({
      where: { id: invoiceId },
      relations: { phieuDangKy: true },
    });
    if (!hd) throw new NotFoundException('Không tìm thấy hóa đơn');
    if (hd.phieuDangKy.sinh_vien_id !== studentId) {
      throw new BadRequestException(
        'Bạn không có quyền yêu cầu hoàn phí cho hóa đơn của người khác',
      );
    }
    if (hd.trang_thai !== 'ViPham') {
      throw new BadRequestException(
        'Xin hoàn phí chỉ áp dụng cho hóa đơn vi phạm (trễ hạn/sai nội dung)',
      );
    }

    const exist = await this.hoanPhiRepo.findOne({
      where: { hoa_don_id: invoiceId },
    });
    if (exist) {
      throw new BadRequestException(
        'Bạn đã gửi đơn xin hoàn phí cho hóa đơn này rồi',
      );
    }

    const don = new DonHoanPhi();
    don.hoa_don_id = invoiceId;
    don.file_don_da_duyet = fileScanUrl;
    don.ngay_nop = new Date();
    don.trang_thai = 'ChoXuLy';
    await this.hoanPhiRepo.save(don);

    return { message: 'Nộp đơn xin hoàn lệ phí thành công' };
  }

  // Xem danh sach don xin hoan le phi
  async getRefundRequests(studentId: number) {
    const phieus = await this.phieuRepo.find({
      where: { sinh_vien_id: studentId },
    });
    const phieuIds = phieus.map((p) => p.id);
    if (phieuIds.length === 0) return [];

    const hds = await this.hoaDonRepo.find({
      where: { phieu_dang_ky_id: In(phieuIds) },
    });
    const hdIds = hds.map((hd) => hd.id);
    if (hdIds.length === 0) return [];

    return this.hoanPhiRepo.find({
      where: { hoa_don_id: In(hdIds) },
      relations: {
        hoaDon: { phieuDangKy: { chuyenThamQuan: { nhaMay: true } } },
      },
      order: { ngay_nop: 'DESC' },
    });
  }

  // Xem thong bao gui toi khoa/SV (v13: newsfeed, không còn ThongBaoDaDoc)
  async getNotifications(studentId: number) {
    const sv = await this.svRepo.findOne({ where: { id: studentId } });
    if (!sv) throw new NotFoundException('Không tìm thấy sinh viên');
    // Thong bao chung (khoa_hoc_id IS NULL) hoac thong bao cho rieng khoa của SV này
    const list = await this.thongBaoRepo.find({
      where: [{ khoa_hoc_id: IsNull() }, { khoa_hoc_id: sv.khoa_hoc_id }],
      order: { ngay_gui: 'DESC' },
    });

    return list;
  }

  // (v13) ThongBaoDaDoc đã bị xóa — newsfeed không cần đánh dấu đã đọc
  async markNotificationRead(_accountId: number, _notifId: number) {
    return { success: true };
  }

  private sanitizeAndValidateFileRef(
    fileRef: string,
    expectedType: 'reports' | 'payments' | 'attachments',
    accountId: number,
  ): string {
    if (!fileRef || typeof fileRef !== 'string') {
      throw new BadRequestException('File reference không hợp lệ');
    }

    let cleaned = fileRef.trim();

    // Strip query parameters if present (e.g. signed URL tokens)
    if (cleaned.includes('?')) {
      cleaned = cleaned.split('?')[0];
    }

    // Check if full URL was sent
    if (cleaned.includes('://')) {
      try {
        const parsed = new URL(cleaned);
        cleaned = parsed.pathname.startsWith('/')
          ? parsed.pathname.slice(1)
          : parsed.pathname;
        if (cleaned.startsWith('api/upload/file/')) {
          cleaned = cleaned.replace(/^api\/upload\/file\//, '');
        }
      } catch {
        throw new BadRequestException('File reference URL không hợp lệ');
      }
    }

    // Path traversal check
    if (
      cleaned.includes('..') ||
      cleaned.includes('\\') ||
      cleaned.includes('\0')
    ) {
      throw new BadRequestException('Path reference không an toàn');
    }

    // Check key format
    const keyRegex = new RegExp(
      `^(?:\\/api\\/upload\\/file\\/)?${expectedType}\\/([a-zA-Z0-9_-]+)\\/.+$`,
    );
    const match = cleaned.match(keyRegex);

    if (match) {
      const ownerId = match[1];
      if (
        ownerId !== String(accountId) &&
        ownerId !== 'sv' &&
        ownerId !== 'general'
      ) {
        throw new BadRequestException(
          'File reference không thuộc sở hữu của tài khoản hiện tại',
        );
      }
    }

    return cleaned;
  }

  // Sinh vien nop bai thu hoach
  async submitReport(
    studentId: number,
    registrationId: number,
    fileBaoCaoUrl: string,
    fileXacNhanUrl?: string,
  ) {
    const phieu = await this.phieuRepo.findOne({
      where: { id: registrationId, sinh_vien_id: studentId },
      relations: { chuyenThamQuan: true, sinhVien: true },
    });
    if (!phieu) throw new NotFoundException('Không tìm thấy phiếu đăng ký');

    const accountId = phieu.sinhVien?.taikhoan_id || 0;
    const validBaoCaoRef = this.sanitizeAndValidateFileRef(
      fileBaoCaoUrl,
      'reports',
      accountId,
    );

    let validXacNhanRef: string | undefined = undefined;
    if (fileXacNhanUrl) {
      validXacNhanRef = this.sanitizeAndValidateFileRef(
        fileXacNhanUrl,
        'payments',
        accountId,
      );
    }

    if (phieu.chuyenThamQuan.cach_to_chuc === 'TuDo' && !validXacNhanRef) {
      throw new BadRequestException(
        'Chuyến tham quan tự do bắt buộc phải nộp kèm file xác nhận tham quan của doanh nghiệp',
      );
    }

    const phieuTQ = await this.phieuTQRepo.findOne({
      where: { phieu_dang_ky_id: registrationId },
    });
    if (!phieuTQ) {
      throw new BadRequestException('Chuyến đi này chưa được cấp phiếu tham quan');
    }

    if (phieu.chuyenThamQuan.cach_to_chuc === 'DoKhoaToChuc') {
      const dd = await this.dataSource.manager.findOne('DiemDanh', {
        where: { phieu_tham_quan_id: phieuTQ.id },
      });
      if (!dd || (dd as any).trang_thai !== 'CoMat') {
        throw new BadRequestException(
          'Bạn chưa được điểm danh Có mặt cho chuyến tham quan này nên chưa thể nộp bài thu hoạch',
        );
      }
    }

    const tripDate = new Date(phieu.chuyenThamQuan.ngay_tham_quan);
    const now = new Date();
    const diffTime = now.getTime() - tripDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 20) {
      throw new BadRequestException(
        'Đã quá hạn chót nộp bài thu hoạch (hạn chót là 20 ngày kể từ ngày tham quan). Điểm bài thu hoạch của bạn sẽ là 0 và chuyến đi sẽ không được tính điểm.',
      );
    }

    const report = new BaiThuHoach();
    report.phieu_tham_quan_id = phieuTQ.id;
    report.file_bao_cao = validBaoCaoRef;
    report.file_xac_nhan_tham_quan = (validXacNhanRef || null) as any;
    report.ngay_nop = now;

    if (diffDays > 10) {
      report.trang_thai = 'TreHan';
    } else {
      report.trang_thai = 'DaNop';
    }
    await this.baiThuRepo.save(report);

    // Khoi tao ban ghi diem neu chua co
    let diem = await this.diemPhieuRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });
    if (!diem) {
      diem = new DiemPhieuThamQuan();
      diem.phieu_tham_quan_id = phieuTQ.id;
      await this.diemPhieuRepo.save(diem);
    }

    return { message: 'Nộp bài thu hoạch thành công', report };
  }

  // Chot bo 3 chuyen bao cao dai dien
  async selectRepresentativeTrips(
    studentId: number,
    termStudentId: number,
    registrationIds: number[],
  ) {
    if (registrationIds.length !== 3) {
      throw new BadRequestException(
        'Bộ chuyến báo cáo đại diện phải gồm chính xác 3 chuyến đi.',
      );
    }

    // Kiem tra xem 3 phieu dang ky nay co dung cua sinh vien va thuoc lich kien tap do khong
    const phieus = await this.phieuRepo.find({
      where: { id: In(registrationIds), sinh_vien_id: studentId },
      relations: { chuyenThamQuan: true },
    });

    if (phieus.length !== 3) {
      throw new BadRequestException(
        'Danh sách chuyến chọn không hợp lệ hoặc không thuộc quyền sở hữu của bạn.',
      );
    }

    const nhaMayIds = new Set(phieus.map((p) => p.chuyenThamQuan.nha_may_id));
    if (nhaMayIds.size !== 3) {
      throw new BadRequestException(
        'Bộ chuyến báo cáo phải thuộc 3 nhà máy khác nhau',
      );
    }

    // Kiem tra dieu kien: >=2 truc tiep va >=1 truc tuyen
    const directCount = phieus.filter(
      (p) => p.chuyenThamQuan.hinh_thuc === 'TrucTiep',
    ).length;
    const onlineCount = phieus.filter(
      (p) => p.chuyenThamQuan.hinh_thuc === 'TrucTuyen',
    ).length;

    if (directCount < 2 || onlineCount < 1) {
      throw new BadRequestException(
        'Bộ chuyến báo cáo đại diện phải chứa tối thiểu 2 chuyến Trực tiếp (Offline) và 1 chuyến Trực tuyến (Online/Webinar).',
      );
    }

    // Check xem cac chuyen nay da hoàn thành / có điểm chưa
    for (const phieu of phieus) {
      if (
        phieu.trang_thai === 'VangMat' ||
        phieu.trang_thai === 'BiLoai' ||
        phieu.trang_thai === 'DaHuy'
      ) {
        throw new BadRequestException(
          `Chuyến đi ${phieu.chuyenThamQuan.id} ở trạng thái ${phieu.trang_thai}, không thể chọn để báo cáo.`,
        );
      }
    }

    // Xoa bo cu neu co
    const lichKienTapId = phieus[0].chuyenThamQuan.lich_kien_tap_id;
    const countBoard = await this.dataSource.manager.count('HoiDongChamBaoCao', {
      where: { lich_kien_tap_id: lichKienTapId },
    });
    if (countBoard > 0) {
      throw new BadRequestException(
        'Không thể thay đổi bộ chuyến báo cáo sau khi Khoa đã lên lịch buổi báo cáo Hội đồng',
      );
    }

    // (v11) Xóa bộ cũ nếu có — bỏ BoChuyenBaoCao_Chuyen, dùng PhieuThamQuan.bo_chuyen_bao_cao_id
    const currentBo = await this.boChuyenRepo.findOne({
      where: { dot_kien_tap_sinh_vien_id: termStudentId },
    });
    if (currentBo) {
      // Gỡ FK bo_chuyen_bao_cao_id trên các phiếu tham quan cũ
      await this.phieuTQRepo.update(
        { bo_chuyen_bao_cao_id: currentBo.id },
        { bo_chuyen_bao_cao_id: null as any },
      );
      await this.boChuyenRepo.remove(currentBo);
    }

    // Tao bo moi
    const bo = new BoChuyenBaoCao();
    bo.dot_kien_tap_sinh_vien_id = termStudentId;
    bo.ngay_chon = new Date();

    const savedBo = await this.boChuyenRepo.save(bo);

    // Gán bo_chuyen_bao_cao_id trực tiếp trên PhieuThamQuan
    for (const rId of registrationIds) {
      const phieuTQ = await this.phieuTQRepo.findOne({ where: { phieu_dang_ky_id: rId } });
      if (phieuTQ) {
        phieuTQ.bo_chuyen_bao_cao_id = savedBo.id;
        await this.phieuTQRepo.save(phieuTQ);
      }
    }

    return { message: 'Chốt bộ 3 chuyến báo cáo thành công' };
  }

  // Xem diem cua sinh vien
  async getStudentGrades(studentId: number) {
    const dksvs = await this.dksvRepo.find({
      where: { sinh_vien_id: studentId },
      relations: { dotKienTap: { hocKy: true } },
    });

    const results: any[] = [];
    for (const dksv of dksvs) {
      const boChuyen = await this.boChuyenRepo.findOne({
        where: { dot_kien_tap_sinh_vien_id: dksv.id },
      });

      const selectedTrips: any[] = [];
      if (boChuyen) {
        // (v11) Truy vấn trực tiếp qua PhieuThamQuan.bo_chuyen_bao_cao_id
        const phieuTQs = await this.phieuTQRepo.find({
          where: { bo_chuyen_bao_cao_id: boChuyen.id },
          relations: { phieuDangKy: { chuyenThamQuan: { nhaMay: true } } },
        });

        for (const phieuTQ of phieuTQs) {
          const score = await this.diemPhieuRepo.findOne({
            where: { phieu_tham_quan_id: phieuTQ.id },
          });
          selectedTrips.push({
            phieu_dang_ky_id: phieuTQ.phieu_dang_ky_id,
            ten_nha_may: phieuTQ.phieuDangKy.chuyenThamQuan.nhaMay.ten_nha_may,
            hinh_thuc: phieuTQ.phieuDangKy.chuyenThamQuan.hinh_thuc,
            diem_chuan_bi: score?.diem_chuan_bi || 0,
            diem_bai_thu_hoach: score?.diem_thu_hoach || 0,
            diem_bao_cao_tqnm: score?.diem_hoi_dong_final || 0,
            diem_cong: score?.diem_cong_final || 0,
          });
        }
      }

      results.push({
        id: dksv.id,
        dot_kien_tap_id: dksv.dot_kien_tap_id,
        dotKienTap: dksv.dotKienTap,
        lan_dang_ky: dksv.lan_dang_ky,
        trang_thai: dksv.trang_thai,
        diem_tong_ket: dksv.trang_thai === 'Dat' ? 5.0 : null,
        ket_qua: dksv.trang_thai,
        selectedTrips,
      });
    }

    return results;
  }

  // Dashboard Stats
  async getDashboardStats(studentId: number) {
    const sv = await this.svRepo.findOne({ where: { id: studentId } });
    if (!sv) throw new NotFoundException('Không tìm thấy sinh viên');

    const trips = await this.phieuRepo.find({
      where: { sinh_vien_id: studentId },
      relations: { phieuThamQuan: { baiThuHoach: true } },
    });

    const registered = trips.length;
    const completed = trips.filter(
      (t) => t.phieuThamQuan && t.trang_thai === 'HopLe',
    ).length;

    const pendingReports = trips.filter(
      (t) =>
        t.phieuThamQuan && t.trang_thai === 'HopLe' &&
        (!t.phieuThamQuan?.baiThuHoach || Object.keys(t.phieuThamQuan.baiThuHoach).length === 0),
    ).length;

    let avgScore = 'Chưa có';
    const dksvs = await this.dksvRepo.find({
      where: { sinh_vien_id: studentId },
      order: { id: 'DESC' },
    });

    if (dksvs.length > 0) {
      const latestDksv = dksvs[0];
      if (latestDksv.trang_thai === 'Dat') {
        avgScore = '5.0';
      } else {
        const boChuyen = await this.boChuyenRepo.findOne({
          where: { dot_kien_tap_sinh_vien_id: latestDksv.id },
        });

        if (boChuyen) {
          // (v11) Truy vấn trực tiếp qua PhieuThamQuan.bo_chuyen_bao_cao_id
          const phieuTQs = await this.phieuTQRepo.find({
            where: { bo_chuyen_bao_cao_id: boChuyen.id },
          });

            if (phieuTQs.length > 0) {
              const scores: number[] = [];
              for (const ptq of phieuTQs) {
              const diem = await this.diemPhieuRepo.findOne({
                where: { phieu_tham_quan_id: ptq.id },
              });
              scores.push(
                Number(diem?.diem_chuan_bi || 0) * 0.3 +
                Number(diem?.diem_thu_hoach || 0) * 0.3 +
                Number(diem?.diem_hoi_dong_final || 0) * 0.4 +
                Number(diem?.diem_cong_final || 0)
              );
            }
            const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
            avgScore = avg.toFixed(1);
          }
        }
      }
    }

    return { registered, completed, pendingReports, avgScore };
  }
}
