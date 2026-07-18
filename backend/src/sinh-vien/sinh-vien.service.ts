import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
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

@Injectable()
export class SinhVienService {
  constructor(
    @InjectRepository(SinhVien) private svRepo: Repository<SinhVien>,
    @InjectRepository(ChuyenThamQuan) private chuyenRepo: Repository<ChuyenThamQuan>,
    @InjectRepository(PhieuDangKy) private phieuRepo: Repository<PhieuDangKy>,
    @InjectRepository(YeuCauHuyDangKy) private huyRepo: Repository<YeuCauHuyDangKy>,
    @InjectRepository(HoaDonLePhi) private hoaDonRepo: Repository<HoaDonLePhi>,
    @InjectRepository(DonHoanPhi) private hoanPhiRepo: Repository<DonHoanPhi>,
    @InjectRepository(BaiThuHoach) private baiThuRepo: Repository<BaiThuHoach>,
    @InjectRepository(DiemPhieuDangKy) private diemPhieuRepo: Repository<DiemPhieuDangKy>,
    @InjectRepository(LichKienTap_SinhVien) private lksvRepo: Repository<LichKienTap_SinhVien>,
    @InjectRepository(BoChuyenBaoCao) private boChuyenRepo: Repository<BoChuyenBaoCao>,
    @InjectRepository(BoChuyenBaoCao_Chuyen) private boChuyenChuyenRepo: Repository<BoChuyenBaoCao_Chuyen>,
    @InjectRepository(KetQuaHocPhan) private kqRepo: Repository<KetQuaHocPhan>,
    @InjectRepository(NhaMay) private nhaMayRepo: Repository<NhaMay>,
    @InjectRepository(ThongBao) private thongBaoRepo: Repository<ThongBao>,
    @InjectRepository(ThongBaoDaDoc) private daDocRepo: Repository<ThongBaoDaDoc>,
    @InjectRepository(DanhSachDen) private blackListRepo: Repository<DanhSachDen>,
  ) {}

  // Lay thong tin SV bang TaiKhoan ID
  async getStudentByAccountId(accountId: number) {
    const sv = await this.svRepo.findOne({
      where: { taikhoan_id: accountId },
      relations: { khoa: true },
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
        .andWhere('chuyen.ngay_tham_quan >= :date', { date: record.ngay_ghi_nhan })
        .getCount();

      if (record.ly_do === 'HuyKhongMinhChung') {
        const limit = 3;
        if (occurredTripsCount >= limit) {
          record.con_hieu_luc = false;
          await this.blackListRepo.save(record);
        } else {
          bannedFromRegistration = true;
          remainingBannedTrips = Math.max(remainingBannedTrips, limit - occurredTripsCount);
        }
      } else if (record.ly_do === 'KhongDongPhi' || record.ly_do === 'DangKyKhongThamGia') {
        const limit = 5;
        if (occurredTripsCount >= limit) {
          record.con_hieu_luc = false;
          await this.blackListRepo.save(record);
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

  // Lay cac chuyen tham quan co the dang ky
  async getAvailableTrips(studentId: number) {
    // 1. Tim LichKienTap hien tai cua SV
    const currentLksv = await this.lksvRepo.findOne({
      where: { sinh_vien_id: studentId, trang_thai: 'DangThucHien' },
      relations: { lichKienTap: true },
    });

    if (!currentLksv) return [];

    const lichId = currentLksv.lichKienTap.id;

    // Kiểm tra xem sinh viên có bị khóa đăng ký
    const penalties = await this.checkAndUpdatePenalties(studentId);
    if (penalties.bannedFromRegistration) {
      throw new BadRequestException(`Bạn đang bị cấm đăng ký do vi phạm quy chế kiến tập (còn lại ${penalties.remainingBannedTrips} chuyến).`);
    }

    // Lấy danh sách chuyến đi của lịch này đang mở đăng ký
    const trips = await this.chuyenRepo.find({
      where: {
        lich_kien_tap_id: lichId,
        trang_thai: 'MoDangKy',
        cach_to_chuc: 'DoKhoaToChuc',
      },
      relations: { nhaMay: true },
    });

    // Dem so SV da dang ky tung chuyen
    const results = [];
    for (const trip of trips) {
      const count = await this.phieuRepo.count({
        where: { chuyen_tham_quan_id: trip.id, trang_thai: In(['HopLe', 'ChoDuyet', 'HoanThanh']) },
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
        baiThuHoach: true
      },
      order: { ngay_dang_ky: 'DESC' },
    });
  }

  // Dang ky chuyen tham quan
  async registerTrip(studentId: number, tripId: number) {
    // Kiem tra danh sach den
    const penalties = await this.checkAndUpdatePenalties(studentId);
    if (penalties.bannedFromRegistration) {
      throw new BadRequestException(`Bạn đang bị cấm đăng ký do vi phạm quy chế kiến tập (còn lại ${penalties.remainingBannedTrips} chuyến).`);
    }

    const student = await this.svRepo.findOne({ where: { id: studentId }, relations: { khoa: true } });
    if (!student) throw new NotFoundException('Không tìm thấy sinh viên');

    const trip = await this.chuyenRepo.findOne({
      where: { id: tripId },
      relations: { lichKienTap: { dotKienTap: { namHoc: true } } },
    });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');
    if (trip.trang_thai !== 'MoDangKy') {
      throw new BadRequestException('Chuyến đi này hiện đang đóng đăng ký');
    }

    const startYearStr = trip.lichKienTap.dotKienTap.namHoc.ten_nam_hoc.split('-')[0];
    const startYear = parseInt(startYearStr, 10);
    const studyYear = startYear - student.khoa.nam_nhap_hoc + 1;
    if (studyYear < 2) {
      throw new BadRequestException('Chỉ sinh viên từ năm thứ 2 trở lên mới được phép đăng ký kiến tập');
    }

    // Kiem tra suc chua
    const currentRegs = await this.phieuRepo.count({
      where: { chuyen_tham_quan_id: tripId, trang_thai: In(['HopLe', 'ChoDuyet', 'HoanThanh']) },
    });
    if (currentRegs >= trip.suc_chua) {
      throw new BadRequestException('Chuyến đi đã đủ số lượng sinh viên');
    }

    // Kiem tra da dang ky chuyen nay chua
    const exist = await this.phieuRepo.findOne({
      where: { sinh_vien_id: studentId, chuyen_tham_quan_id: tripId },
    });
    if (exist) {
      throw new BadRequestException('Bạn đã đăng ký chuyến đi này rồi');
    }

    // Kiem tra khong trung ngay voi bat ky chuyen nao khac da dang ky va chua bi huy/loai
    const existingSameDay = await this.phieuRepo.find({
      where: {
        sinh_vien_id: studentId,
        trang_thai: In(['ChoDuyet', 'HopLe', 'DaThamGia', 'HoanThanh'])
      },
      relations: { chuyenThamQuan: true }
    });
    const hasSameDay = existingSameDay.some(
      p => new Date(p.chuyenThamQuan.ngay_tham_quan).toDateString() === new Date(trip.ngay_tham_quan).toDateString()
    );
    if (hasSameDay) {
      throw new BadRequestException('Bạn không được đăng ký hai chuyến đi trùng ngày');
    }

    // Tao PhieuDangKy
    const newPhieu = new PhieuDangKy();
    newPhieu.sinh_vien_id = studentId;
    newPhieu.chuyen_tham_quan_id = tripId;
    newPhieu.trang_thai = 'ChoDuyet'; // Cho khoa chốt duyet
    newPhieu.ngay_dang_ky = new Date();
    const savedPhieu = await this.phieuRepo.save(newPhieu);

    // Tao HoaDonLePhi
    const hoaDon = new HoaDonLePhi();
    hoaDon.phieu_dang_ky_id = savedPhieu.id;
    hoaDon.so_tien = trip.hinh_thuc === 'TrucTiep' ? 150000 : 50000;
    hoaDon.noi_dung_chuyen_khoan = `${student.mssv}_DK${trip.id}`;
    
    // Han dong: 3 ngay sau dang ky
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + 3);
    hoaDon.han_dong = dateLimit;
    hoaDon.trang_thai = 'ChuaDong';
    await this.hoaDonRepo.save(hoaDon);

    return { message: 'Đăng ký thành công, vui lòng thanh toán lệ phí', phieu: savedPhieu };
  }

  // De xuat chuyen tu do
  async proposeTrip(
    studentId: number,
    nhaMayId: number,
    ngayThamQuan: Date,
    gioBatDau: string,
    gioKetThuc: string,
    hinhThuc: string,
  ) {
    const currentLksv = await this.lksvRepo.findOne({
      where: { sinh_vien_id: studentId, trang_thai: 'DangThucHien' },
    });
    if (!currentLksv) {
      throw new BadRequestException('Bạn không nằm trong lịch kiến tập đang triển khai');
    }

    const nhaMay = await this.nhaMayRepo.findOne({ where: { id: nhaMayId } });
    if (!nhaMay) throw new NotFoundException('Không tìm thấy nhà máy');

    if (hinhThuc === 'TrucTuyen' && !nhaMay.ho_tro_truc_tuyen) {
      throw new BadRequestException('Nhà máy này không hỗ trợ tham quan trực tuyến');
    }
    if (hinhThuc === 'TrucTiep' && !nhaMay.ho_tro_truc_tiep) {
      throw new BadRequestException('Nhà máy này không hỗ trợ tham quan trực tiếp');
    }

    const newChuyen = new ChuyenThamQuan();
    newChuyen.nha_may_id = nhaMayId;
    newChuyen.lich_kien_tap_id = currentLksv.lich_kien_tap_id;
    newChuyen.ngay_tham_quan = ngayThamQuan;
    newChuyen.gio_bat_dau = gioBatDau;
    newChuyen.gio_ket_thuc = gioKetThuc;
    newChuyen.hinh_thuc = hinhThuc;
    newChuyen.cach_to_chuc = 'TuDo';
    newChuyen.suc_chua = 1;
    newChuyen.trang_thai = 'Nhap';
    newChuyen.de_xuat_boi_id = studentId;
    newChuyen.trang_thai_duyet_tudo = 'ChoDuyet';

    const saved = await this.chuyenRepo.save(newChuyen);

    // Tu dong dang ky luon cho SV nay
    const phieu = new PhieuDangKy();
    phieu.sinh_vien_id = studentId;
    phieu.chuyen_tham_quan_id = saved.id;
    phieu.trang_thai = 'ChoDuyet';
    await this.phieuRepo.save(phieu);

    return { message: 'Đề xuất chuyến đi tự do thành công, đang chờ Khoa duyệt', chuyen: saved };
  }

  // Yeu cau huy dang ky
  async requestCancel(studentId: number, registrationId: number, lyDo: string, fileMinhChung: string) {
    const phieu = await this.phieuRepo.findOne({
      where: { id: registrationId, sinh_vien_id: studentId },
    });
    if (!phieu) throw new NotFoundException('Không tìm thấy phiếu đăng ký');
    if (phieu.trang_thai === 'DaHuy' || phieu.trang_thai === 'BiLoai') {
      throw new BadRequestException('Phiếu đăng ký này đã được hủy hoặc bị loại');
    }

    const trip = await this.chuyenRepo.findOne({ where: { id: phieu.chuyen_tham_quan_id } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');
    const now = new Date();
    
    if (trip.trang_thai === 'DaDienRa' || new Date(trip.ngay_tham_quan) < now) {
      throw new BadRequestException('Không thể hủy chuyến tham quan đã diễn ra');
    }

    const tripDeparture = new Date(trip.ngay_tham_quan);
    const [hours, minutes] = trip.gio_bat_dau.toString().split(':');
    tripDeparture.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    const timeDiffMs = tripDeparture.getTime() - now.getTime();
    if (timeDiffMs < 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Không thể hủy trong vòng 24 giờ trước giờ khởi hành');
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

      return { message: 'Đã hủy đăng ký thành công (Không có minh chứng, bạn bị mất quyền đăng ký trong 3 chuyến tiếp theo)' };
    }

    const currentReq = await this.huyRepo.findOne({ where: { phieu_dang_ky_id: registrationId } });
    if (currentReq) {
      throw new BadRequestException('Bạn đã gửi yêu cầu hủy cho chuyến đi này rồi');
    }

    const cancelReq = new YeuCauHuyDangKy();
    cancelReq.phieu_dang_ky_id = registrationId;
    cancelReq.ly_do = lyDo;
    cancelReq.file_minh_chung = fileMinhChung;
    cancelReq.ngay_yeu_cau = new Date();
    cancelReq.trang_thai_duyet = 'ChoDuyet';
    await this.huyRepo.save(cancelReq);

    return { message: 'Gửi yêu cầu hủy đăng ký thành công, chờ Khoa xét duyệt' };
  }

  // Hoa don le phi cua SV
  async getInvoices(studentId: number) {
    const phieus = await this.phieuRepo.find({ where: { sinh_vien_id: studentId } });
    const phieuIds = phieus.map(p => p.id);
    if (phieuIds.length === 0) return [];

    return this.hoaDonRepo.find({
      where: { phieu_dang_ky_id: In(phieuIds) },
      relations: { phieuDangKy: { chuyenThamQuan: { nhaMay: true } } },
    });
  }

  // Gia lap thanh toan (thuc te se quet QR doi chieu)
  async payInvoice(invoiceId: number) {
    const hd = await this.hoaDonRepo.findOne({
      where: { id: invoiceId },
      relations: { phieuDangKy: true },
    });
    if (!hd) throw new NotFoundException('Không tìm thấy hóa đơn');

    hd.ngay_dong_thuc_te = new Date();
    if (hd.ngay_dong_thuc_te <= hd.han_dong) {
      hd.trang_thai = 'DaDongDungHan';
      // Cap nhat phieu dang ky sang HopLe
      hd.phieuDangKy.trang_thai = 'HopLe';
      await this.phieuRepo.save(hd.phieuDangKy);
    } else {
      hd.trang_thai = 'ViPham';
    }
    await this.hoaDonRepo.save(hd);

    return { message: 'Thanh toán hóa đơn thành công', hoaDon: hd };
  }

  // Gui yeu cau hoan le phi
  async requestRefund(invoiceId: number, fileScanUrl: string) {
    const hd = await this.hoaDonRepo.findOne({ where: { id: invoiceId } });
    if (!hd) throw new NotFoundException('Không tìm thấy hóa đơn');
    if (hd.trang_thai !== 'DaDongDungHan') {
      throw new BadRequestException('Hóa đơn chưa thanh toán hoặc vi phạm, không thể xin hoàn');
    }

    const exist = await this.hoanPhiRepo.findOne({ where: { hoa_don_id: invoiceId } });
    if (exist) {
      throw new BadRequestException('Bạn đã gửi đơn xin hoàn phí cho hóa đơn này rồi');
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
    const phieus = await this.phieuRepo.find({ where: { sinh_vien_id: studentId } });
    const phieuIds = phieus.map(p => p.id);
    if (phieuIds.length === 0) return [];

    const hds = await this.hoaDonRepo.find({
      where: { phieu_dang_ky_id: In(phieuIds) },
    });
    const hdIds = hds.map(hd => hd.id);
    if (hdIds.length === 0) return [];

    return this.hoanPhiRepo.find({
      where: { hoa_don_id: In(hdIds) },
      relations: { hoaDon: { phieuDangKy: { chuyenThamQuan: { nhaMay: true } } } },
      order: { ngay_nop: 'DESC' },
    });
  }

  // Xem thong bao gui toi khoa/SV
  async getNotifications(studentId: number) {
    const sv = await this.svRepo.findOne({ where: { id: studentId } });
    if (!sv) throw new NotFoundException('Không tìm thấy sinh viên');
    // Thong bao chung (khoa_id IS NULL) hoac thong bao cho rieng khoa của SV này
    const list = await this.thongBaoRepo.find({
      where: [
        { khoa_id: IsNull() },
        { khoa_id: sv.khoa_id },
      ],
      order: { ngay_gui: 'DESC' },
    });

    const docIds = (await this.daDocRepo.find({ where: { taikhoan_id: sv.taikhoan_id } })).map(d => d.thongbao_id);

    return list.map(item => ({
      ...item,
      da_doc: docIds.includes(item.id),
    }));
  }

  // Doc thong bao
  async markNotificationRead(accountId: number, notifId: number) {
    const exist = await this.daDocRepo.findOne({ where: { taikhoan_id: accountId, thongbao_id: notifId } });
    if (!exist) {
      const read = new ThongBaoDaDoc();
      read.taikhoan_id = accountId;
      read.thongbao_id = notifId;
      read.ngay_doc = new Date();
      await this.daDocRepo.save(read);
    }
    return { success: true };
  }


  // Sinh vien nop bai thu hoach
  async submitReport(studentId: number, registrationId: number, fileBaoCaoUrl: string, fileXacNhanUrl?: string) {
    const phieu = await this.phieuRepo.findOne({
      where: { id: registrationId, sinh_vien_id: studentId },
      relations: { chuyenThamQuan: true },
    });
    if (!phieu) throw new NotFoundException('Không tìm thấy phiếu đăng ký');

    if (phieu.chuyenThamQuan.cach_to_chuc === 'TuDo' && !fileXacNhanUrl) {
      throw new BadRequestException('Chuyến tham quan tự do bắt buộc phải nộp kèm file xác nhận tham quan của doanh nghiệp');
    }

    const tripDate = new Date(phieu.chuyenThamQuan.ngay_tham_quan);
    const now = new Date();
    const diffTime = now.getTime() - tripDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 21) {
      throw new BadRequestException('Đã quá hạn chót nộp bài thu hoạch (hạn chót là 21 ngày kể từ ngày tham quan). Bạn phải đăng ký tham quan lại.');
    }

    const report = new BaiThuHoach();
    report.phieu_dang_ky_id = registrationId;
    report.file_bao_cao = fileBaoCaoUrl;
    report.file_xac_nhan_tham_quan = (fileXacNhanUrl || null) as any;
    report.ngay_nop = now;
    
    if (diffDays > 10) {
      report.trang_thai = 'TreHan';
    } else {
      report.trang_thai = 'DaNop';
    }
    await this.baiThuRepo.save(report);

    // Khoi tao ban ghi diem neu chua co
    let diem = await this.diemPhieuRepo.findOne({ where: { phieu_dang_ky_id: registrationId } });
    if (!diem) {
      diem = new DiemPhieuDangKy();
      diem.phieu_dang_ky_id = registrationId;
    }
    diem.diem_bai_thu_hoach_ai = Number((7.0 + Math.random() * 2.0).toFixed(2));
    await this.diemPhieuRepo.save(diem);

    return { message: 'Nộp bài thu hoạch thành công', report };
  }

  // Chot bo 3 chuyen bao cao dai dien
  async selectRepresentativeTrips(studentId: number, termStudentId: number, registrationIds: number[]) {
    if (registrationIds.length !== 3) {
      throw new BadRequestException('Bộ chuyến báo cáo đại diện phải gồm chính xác 3 chuyến đi.');
    }

    // Kiem tra xem 3 phieu dang ky nay co dung cua sinh vien va thuoc lich kien tap do khong
    const phieus = await this.phieuRepo.find({
      where: { id: In(registrationIds), sinh_vien_id: studentId },
      relations: { chuyenThamQuan: true },
    });

    if (phieus.length !== 3) {
      throw new BadRequestException('Danh sách chuyến chọn không hợp lệ hoặc không thuộc quyền sở hữu của bạn.');
    }

    // Kiem tra dieu kien: >=2 truc tiep va >=1 truc tuyen
    const directCount = phieus.filter(p => p.chuyenThamQuan.hinh_thuc === 'TrucTiep').length;
    const onlineCount = phieus.filter(p => p.chuyenThamQuan.hinh_thuc === 'TrucTuyen').length;

    if (directCount < 2 || onlineCount < 1) {
      throw new BadRequestException('Bộ chuyến báo cáo đại diện phải chứa tối thiểu 2 chuyến Trực tiếp (Offline) và 1 chuyến Trực tuyến (Online/Webinar).');
    }

    // Check xem cac chuyen nay da hoàn thành / có điểm chưa
    for (const phieu of phieus) {
      if (phieu.trang_thai === 'VangMat' || phieu.trang_thai === 'BiLoai' || phieu.trang_thai === 'DaHuy') {
        throw new BadRequestException(`Chuyến đi ${phieu.chuyenThamQuan.id} ở trạng thái ${phieu.trang_thai}, không thể chọn để báo cáo.`);
      }
    }

    // Xoa bo cu neu co
    const currentBo = await this.boChuyenRepo.findOne({ where: { lich_kien_tap_sinh_vien_id: termStudentId } });
    if (currentBo) {
      await this.boChuyenChuyenRepo.delete({ bo_chuyen_bao_cao_id: currentBo.id });
      await this.boChuyenRepo.remove(currentBo);
    }

    // Tao bo moi
    const bo = new BoChuyenBaoCao();
    bo.lich_kien_tap_sinh_vien_id = termStudentId;
    bo.ngay_chon = new Date();
    bo.tu_dong = false; // Do nguoi dung chon thu cong
    const savedBo = await this.boChuyenRepo.save(bo);

    for (const rId of registrationIds) {
      const bcc = new BoChuyenBaoCao_Chuyen();
      bcc.bo_chuyen_bao_cao_id = savedBo.id;
      bcc.phieu_dang_ky_id = rId;
      await this.boChuyenChuyenRepo.save(bcc);
    }

    return { message: 'Chốt bộ 3 chuyến báo cáo thành công' };
  }

  // Xem diem cua sinh vien
  async getStudentGrades(studentId: number) {
    const lksvs = await this.lksvRepo.find({
      where: { sinh_vien_id: studentId },
      relations: { lichKienTap: { dotKienTap: true } },
    });

    const results = [];
    for (const lksv of lksvs) {
      const boChuyen = await this.boChuyenRepo.findOne({
        where: { lich_kien_tap_sinh_vien_id: lksv.id },
      });

      let selectedTrips = [];
      if (boChuyen) {
        const mapping = await this.boChuyenChuyenRepo.find({
          where: { bo_chuyen_bao_cao_id: boChuyen.id },
          relations: { phieuDangKy: { chuyenThamQuan: { nhaMay: true } } },
        });

        for (const map of mapping) {
          const score = await this.diemPhieuRepo.findOne({
            where: { phieu_dang_ky_id: map.phieu_dang_ky_id },
          });
          selectedTrips.push({
            phieu_dang_ky_id: map.phieu_dang_ky_id,
            ten_nha_may: map.phieuDangKy.chuyenThamQuan.nhaMay.ten_nha_may,
            hinh_thuc: map.phieuDangKy.chuyenThamQuan.hinh_thuc,
            diem_chuan_bi: score?.diem_chuan_bi || 0,
            diem_bai_thu_hoach: score?.diem_bai_thu_hoach || 0,
            diem_bao_cao_tqnm: score?.diem_bao_cao_tqnm || 0,
            diem_cong: score?.diem_cong || 0,
          });
        }
      }

      const kq = await this.kqRepo.findOne({
        where: { lich_kien_tap_sinh_vien_id: lksv.id },
      });

      results.push({
        id: lksv.id,
        lich_kien_tap_id: lksv.lich_kien_tap_id,
        ten_lich: lksv.lichKienTap.ten_lich,
        lan_dang_ky: lksv.lan_dang_ky,
        trang_thai: lksv.trang_thai,
        diem_tong_ket: kq?.diem_tong_ket || null,
        ket_qua: kq?.ket_qua || 'DangThucHien',
        selectedTrips,
      });
    }

    return results;
  }
}
