import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
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
  PhanCongGiangVienDanDoan,
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
  HoiDongChamBaoCao,
  HoiDong_ThanhVien,
} from '../entities/qlkt.entity';
import { R2StorageService } from '../upload/r2-storage.service';
import { BoChuyenLockManager } from '../common/bo-chuyen-lock.util';
import { CompanyMatcher } from '../common/company-matcher.util';

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
    @InjectRepository(DiemPhieuThamQuan)
    private diemPhieuRepo: Repository<DiemPhieuThamQuan>,
    @InjectRepository(PhieuThamQuan)
    private phieuTQRepo: Repository<PhieuThamQuan>,
    @InjectRepository(PhieuDeXuatChuyenThamQuan)
    private deXuatRepo: Repository<PhieuDeXuatChuyenThamQuan>,
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
    @InjectRepository(TaiKhoanThuHuong)
    private taiKhoanThuHuongRepo: Repository<TaiKhoanThuHuong>,
    private readonly r2Storage: R2StorageService,
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

  async searchFactories(query: string) {
    if (!query || query.trim().length < 3) {
      return [];
    }
    const q = query.trim();
    const activeFactories = await this.nhaMayRepo.find({
      where: { trang_thai: 'HoatDong' },
    });

    // So khớp mờ và tính điểm qua CompanyMatcher trên bộ nhớ
    const scored = activeFactories.map((f) => {
      const match = CompanyMatcher.calculateMatchScore(q, '', f, true);
      return { factory: f, score: match.score, brandScore: match.brandScore };
    });

    const matched = scored
      .filter((item) => item.score >= 40 || item.brandScore >= 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.factory);

    if (matched.length > 0) {
      return matched;
    }

    // Fallback QueryBuilder với các token đã làm sạch
    const cleaned = CompanyMatcher.cleanString(q);
    const tokens = cleaned ? cleaned.split(' ').filter((t) => t.length > 1) : [];
    const qb = this.nhaMayRepo
      .createQueryBuilder('nm')
      .where('nm.trang_thai = :status', { status: 'HoatDong' });

    if (tokens.length > 0) {
      tokens.forEach((token, idx) => {
        qb.andWhere(
          `(nm.ten_nha_may COLLATE SQL_Latin1_General_CP1_CI_AI LIKE :t${idx} OR ISNULL(nm.dia_chi, '') COLLATE SQL_Latin1_General_CP1_CI_AI LIKE :t${idx})`,
          { [`t${idx}`]: `%${token}%` },
        );
      });
    }

    return qb.take(5).getMany();
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

    // Lay danh sach cac chuyen SV da dang ky de loai bo khoi ket qua
    const studentPhieus = await this.phieuRepo.find({
      where: { sinh_vien_id: studentId },
      relations: { chuyenThamQuan: true },
    });
    const registeredTripIds = new Set(studentPhieus.map(p => p.chuyen_tham_quan_id));
    const activeLichIds = new Set(
      studentPhieus
        .filter(p => ['ChoDuyet', 'HopLe'].includes(p.trang_thai))
        .map(p => p.chuyenThamQuan.lich_kien_tap_id)
    );

    // Dem so SV da dang ky tung chuyen va chi hien thi cac chuyen hop le
    const results: any[] = [];
    for (const trip of trips) {
      // Bo qua neu da dang ky chuyen nay (bat ky trang thai nao)
      if (registeredTripIds.has(trip.id)) continue;
      // Bo qua neu da co 1 dang ky khac (dang cho duyet hoac hop le) trong cung lich
      if (activeLichIds.has(trip.lich_kien_tap_id)) continue;
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
    const phieus = await this.phieuRepo.find({
      where: { sinh_vien_id: studentId },
      relations: {
        chuyenThamQuan: { nhaMay: true },
        phieuThamQuan: { baiThuHoach: true },
        hoaDon: true,
        yeuCauHuy: true,
      },
      order: { ngay_dang_ky: 'DESC' },
    });

    const ptqIds = phieus
      .map((p) => p.phieuThamQuan?.id)
      .filter((id) => id != null);

    if (ptqIds.length > 0) {
      const diemDanhs = await this.dataSource.manager.find('DiemDanh', {
        where: { phieu_tham_quan_id: In(ptqIds) },
      });
      const ddMap = new Map();
      for (const dd of diemDanhs) {
        ddMap.set((dd as any).phieu_tham_quan_id, dd);
      }
      for (const phieu of phieus) {
        if (phieu.phieuThamQuan) {
          phieu.phieuThamQuan.diemDanh = ddMap.get(phieu.phieuThamQuan.id);
        }
      }
    }

    return phieus;
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

      // Kiem tra khong duoc dang ky qua 1 chuyen trong cung 1 lich kien tap
      const existingInLich = await manager.find(PhieuDangKy, {
        where: {
          sinh_vien_id: studentId,
          trang_thai: In(['ChoDuyet', 'HopLe']),
        },
        relations: { chuyenThamQuan: true },
      });
      const hasSameLich = existingInLich.some(
        (p) =>
          p.chuyenThamQuan.lich_kien_tap_id === trip.lich_kien_tap_id,
      );
      if (hasSameLich) {
        throw new BadRequestException(
          'Bạn chỉ được phép đăng ký tối đa 1 chuyến trong cùng một Lịch kiến tập.',
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
    // Lịch kiến tập sẽ được Stored Procedure tự động gán khi Khoa duyệt

    if (!nhaMayId && !tenNhaMayDeXuat) {
      throw new BadRequestException(
        'Vui lòng chọn nhà máy hoặc nhập thông tin nhà máy đề xuất',
      );
    }

    // Tự động đối chiếu thông minh nếu sinh viên tự gõ tên nhà máy
    if (!nhaMayId && tenNhaMayDeXuat) {
      const activeFactories = await this.nhaMayRepo.find({
        where: { trang_thai: 'HoatDong' },
      });
      const matchResult = CompanyMatcher.findBestMatch(
        tenNhaMayDeXuat,
        diaChiDeXuat || '',
        activeFactories,
      );

      if (matchResult.bestMatch && matchResult.score >= 75) {
        nhaMayId = matchResult.bestMatch.id;
      } else if (matchResult.score < 50 && tenNhaMayDeXuat) {
        tenNhaMayDeXuat = CompanyMatcher.toTitleCase(tenNhaMayDeXuat);
      }
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
    deXuat.nha_may_id = nhaMayId || null;
    deXuat.ten_nha_may_de_xuat = tenNhaMayDeXuat || null;
    deXuat.dia_chi_de_xuat = diaChiDeXuat || null;
    deXuat.nguoi_lien_he_de_xuat = nguoiLienHeDeXuat || null;
    deXuat.sdt_lien_he_de_xuat = sdtLienHeDeXuat || null;

    deXuat.lich_kien_tap_id = null;
    deXuat.ngay_tham_quan_de_xuat = ngayThamQuan;
    const startTimeDate = new Date(
      `1970-01-01T${gioBatDau.length === 5 ? gioBatDau + ':00' : gioBatDau}`,
    );
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

  async cancelProposal(studentId: number, proposalId: number) {
    const proposal = await this.deXuatRepo.findOne({
      where: { id: proposalId, sinh_vien_id: studentId },
      relations: { chuyenThamQuan: true },
    });
    if (!proposal) {
      throw new NotFoundException('Không tìm thấy phiếu đề xuất');
    }

    const isChoDuyet = proposal.trang_thai_duyet === 'ChoDuyet';
    const isChoKhoaDuyet =
      proposal.trang_thai_duyet === 'DaDuyet' &&
      proposal.chuyenThamQuan?.trang_thai === 'ChoDuyet';

    if (!isChoDuyet && !isChoKhoaDuyet) {
      throw new BadRequestException(
        'Chỉ có thể hủy đề xuất khi đang ở trạng thái Chờ duyệt hoặc Chờ Khoa duyệt',
      );
    }

    if (isChoKhoaDuyet && proposal.chuyen_tham_quan_id) {
      const tripId = proposal.chuyen_tham_quan_id;
      // 1. Xóa phân công giảng viên
      await this.dataSource
        .getRepository(PhanCongGiangVienDanDoan)
        .delete({ chuyen_tham_quan_id: tripId });

      // 2. Xóa phiếu đề xuất
      await this.deXuatRepo.remove(proposal);

      // 3. Xóa chuyến đi nháp
      await this.chuyenRepo.delete(tripId);
    } else {
      await this.deXuatRepo.remove(proposal);
    }

    return {
      message: 'Đã hủy đề xuất chuyến tham quan thành công',
    };
  }

  async getStudentProposals(studentId: number) {
    const proposals = await this.deXuatRepo.find({
      where: { sinh_vien_id: studentId },
      relations: { nhaMay: true, chuyenThamQuan: true },
      order: { id: 'DESC' },
    });

    const tripIds = proposals
      .map((p) => p.chuyen_tham_quan_id)
      .filter((id): id is number => typeof id === 'number' && id > 0);

    let assignments: PhanCongGiangVienDanDoan[] = [];
    if (tripIds.length > 0) {
      assignments = await this.dataSource
        .getRepository(PhanCongGiangVienDanDoan)
        .find({
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

    // Leader's logic: if registration is still open, cancel immediately without approval or blacklist
    if (trip.trang_thai === 'MoDangKy') {
      phieu.trang_thai = 'DaHuy';
      await this.phieuRepo.save(phieu);
      return {
        message: 'Đã hủy đăng ký thành công (Chuyến đi đang mở đăng ký)',
      };
    }

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

    if (phieu.trang_thai === 'ChoDuyet') {
      phieu.trang_thai = 'DaHuy';
      await this.phieuRepo.save(phieu);
      return {
        message: 'Đã hủy đăng ký thành công (Rút đơn tự do, không bị phạt)',
      };
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
          'Đã hủy đăng ký thành công (Không có minh chứng, bạn bị đưa vào danh sách đen)',
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

        let ptq = await manager.findOne(PhieuThamQuan, {
          where: { phieu_dang_ky_id: hd.phieu_dang_ky_id },
        });
        if (!ptq) {
          ptq = new PhieuThamQuan();
          ptq.phieu_dang_ky_id = hd.phieu_dang_ky_id;
          ptq.trang_thai = 'HopLe';
          await manager.save(PhieuThamQuan, ptq);
        }
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
      relations: { phieuDangKy: { chuyenThamQuan: true } },
    });
    if (!hd) throw new NotFoundException('Không tìm thấy hóa đơn');

    hd.ngay_dong_thuc_te = new Date();
    
    let isDungHan = false;
    if (hd.phieuDangKy?.chuyenThamQuan) {
      const ctq = hd.phieuDangKy.chuyenThamQuan;
      if (ctq.ngay_tham_quan && ctq.gio_bat_dau) {
        const dateStr = typeof ctq.ngay_tham_quan === 'string' ? ctq.ngay_tham_quan : ctq.ngay_tham_quan.toISOString().split('T')[0];
        const departureTime = new Date(`${dateStr}T${ctq.gio_bat_dau}`);
        const deadline = new Date(departureTime.getTime() - 24 * 60 * 60 * 1000);
        isDungHan = hd.ngay_dong_thuc_te <= deadline;
      } else {
        isDungHan = hd.han_dong ? (hd.ngay_dong_thuc_te <= hd.han_dong) : true;
      }
    } else {
      isDungHan = hd.han_dong ? (hd.ngay_dong_thuc_te <= hd.han_dong) : true;
    }

    if (isDungHan) {
      hd.trang_thai = 'DaDongDungHan';
      hd.phieuDangKy.trang_thai = 'HopLe';
      await this.phieuRepo.save(hd.phieuDangKy);

      let ptq = await this.phieuTQRepo.findOne({
        where: { phieu_dang_ky_id: hd.phieu_dang_ky_id },
      });
      if (!ptq) {
        ptq = new PhieuThamQuan();
        ptq.phieu_dang_ky_id = hd.phieu_dang_ky_id;
        ptq.trang_thai = 'HopLe';
        await this.phieuTQRepo.save(ptq);
      }
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
    nganHangNhan: string,
    soTaiKhoanNhan: string,
    tenChuTaiKhoanNhan: string,
  ) {
    const hd = await this.hoaDonRepo.findOne({
      where: { id: invoiceId },
      relations: { phieuDangKy: { sinhVien: true } },
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
    don.ngan_hang_nhan = 'Ngân hàng mặc định (Thiếu trên UI)';
    don.so_tai_khoan_nhan = '000000000';
    don.ten_chu_tai_khoan_nhan = hd.phieuDangKy?.sinhVien?.ho_ten ?? 'Sinh viên ẩn danh';
    don.ngay_nop = new Date();
    don.trang_thai = 'ChoXuLy';
    don.ngan_hang_nhan = nganHangNhan;
    don.so_tai_khoan_nhan = soTaiKhoanNhan;
    don.ten_chu_tai_khoan_nhan = tenChuTaiKhoanNhan;
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
    
    const targetAudience = In(['ALL', 'STUDENT']);
    const list = await this.thongBaoRepo.find({
      where: [
        { khoa_hoc_id: IsNull(), doi_tuong_nhan: targetAudience },
        { khoa_hoc_id: sv.khoa_hoc_id, doi_tuong_nhan: targetAudience },
      ],
      relations: {
        nguoiGui: true,
        files: true,
      },
      order: { ngay_gui: 'DESC' },
    });

    return list.map((n) => ({
      ...n,
      type: n.loai_thong_bao,
      file_dinh_kem: n.files && n.files.length > 0 ? n.files[0].ten_file : null,
      file_url: n.files && n.files.length > 0 ? n.files[0].duong_dan : null,
      nguoi_gui: n.nguoiGui?.ten_dang_nhap || 'Khoa / CLB',
    }));
  }

  private sanitizeAndValidateFileRef(
    fileRef: string,
    expectedType: 'reports' | 'payments' | 'attachments',
    accountId: number,
    mssv?: string,
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
        ownerId !== mssv &&
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
    extractedText?: string,
  ) {
    const phieu = await this.phieuRepo.findOne({
      where: { id: registrationId, sinh_vien_id: studentId },
      relations: { chuyenThamQuan: true, sinhVien: true },
    });
    if (!phieu) throw new NotFoundException('Không tìm thấy phiếu đăng ký');

    const accountId = phieu.sinhVien?.taikhoan_id || 0;
    const mssv = phieu.sinhVien?.mssv;

    const validBaoCaoRef = this.sanitizeAndValidateFileRef(
      fileBaoCaoUrl,
      'reports',
      accountId,
      mssv,
    );

    let validXacNhanRef: string | undefined = undefined;
    if (fileXacNhanUrl) {
      try {
        validXacNhanRef = this.sanitizeAndValidateFileRef(
          fileXacNhanUrl,
          'attachments',
          accountId,
          mssv,
        );
      } catch {
        // Fallback to payments if uploaded via legacy payments endpoint
        validXacNhanRef = this.sanitizeAndValidateFileRef(
          fileXacNhanUrl,
          'payments',
          accountId,
          mssv,
        );
      }
    }

    const isTuDo = phieu.chuyenThamQuan?.cach_to_chuc === 'TuDo';

    const phieuTQ = await this.phieuTQRepo.findOne({
      where: { phieu_dang_ky_id: registrationId },
      relations: { baiThuHoach: true },
    });
    if (!phieuTQ) {
      const hd = await this.dataSource.manager.findOne('HoaDonLePhi', {
        where: { phieu_dang_ky_id: registrationId },
      });
      if (hd && (hd as any).trang_thai === 'ChuaDong') {
        throw new BadRequestException(
          'Bạn chưa thanh toán lệ phí cho chuyến đi này nên chưa được cấp Phiếu tham quan',
        );
      }
      throw new BadRequestException(
        'Chuyến đi này chưa được cấp phiếu tham quan',
      );
    }

    let existingReport = phieuTQ.baiThuHoach;
    if (!existingReport) {
      existingReport = await this.baiThuRepo.findOne({
        where: { phieu_tham_quan_id: phieuTQ.id },
      });
    }

    if (isTuDo && !validXacNhanRef && !existingReport?.file_xac_nhan_tham_quan) {
      throw new BadRequestException(
        'Chuyến tham quan tự do bắt buộc phải nộp kèm file xác nhận tham quan của doanh nghiệp',
      );
    }

    // Đối với chuyến do Khoa tổ chức, bắt buộc giảng viên dẫn đoàn phải điểm danh Có mặt trên xe
    if (!isTuDo) {
      const dd = await this.dataSource.manager.findOne('DiemDanh', {
        where: { phieu_tham_quan_id: phieuTQ.id },
      });
      if (!dd || (dd as any).trang_thai !== 'CoMat') {
        throw new BadRequestException(
          'Bạn chưa được điểm danh Có mặt cho chuyến tham quan này nên chưa thể nộp bài thu hoạch',
        );
      }
    }

    let report = existingReport;
    if (!report) {
      report = new BaiThuHoach();
      report.phieu_tham_quan_id = phieuTQ.id;
    }
    report.file_bao_cao = validBaoCaoRef;
    if (validXacNhanRef) {
      report.file_xac_nhan_tham_quan = validXacNhanRef as any;
    }
    report.ngay_nop = new Date();
    report.trang_thai = 'DaNop';

    try {
      await this.baiThuRepo.save(report);

      // Cập nhật file .txt lên Cloudflare nếu có extractedText (trường hợp fallback)
      if (extractedText && extractedText.length >= 50 && this.r2Storage.isReady()) {
        const txtKey = validBaoCaoRef.replace(/\.\w+$/, '.txt');
        const txtBuffer = Buffer.from('\uFEFF' + extractedText, 'utf-8');
        try {
          await this.r2Storage.uploadFile(
            this.r2Storage.BUCKET_REPORTS,
            txtKey,
            txtBuffer,
            'text/plain; charset=utf-8',
          );
        } catch (r2Error) {
          console.error('Lỗi khi ghi đè file text lên R2:', r2Error);
        }
      } else if (this.r2Storage.isReady()) {
        // Kích hoạt tiến trình chạy ngầm
        this.runBackgroundExtraction(validBaoCaoRef).catch(e => 
          console.error('Lỗi khi khởi chạy tiến trình trích xuất ngầm:', e)
        );
      }
      // OCR text extraction is now handled in the background by UploadController
    } catch (error: any) {
      if (error.message && error.message.includes('quá thời hạn')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    // Không tự động ghi nhận điểm danh cho chuyến tự do:
    // Giảng viên dẫn đoàn sẽ trực tiếp kiểm tra Giấy xác nhận doanh nghiệp và điểm danh trên màn hình Điểm danh.

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

  // Tải riêng giấy xác nhận tham quan doanh nghiệp (chuyến tự do) để GV điểm danh
  async submitConfirmationPaper(
    studentId: number,
    registrationId: number,
    fileXacNhanUrl: string,
  ) {
    const phieu = await this.phieuRepo.findOne({
      where: { id: registrationId, sinh_vien_id: studentId },
      relations: { chuyenThamQuan: true, sinhVien: true },
    });
    if (!phieu) {
      throw new NotFoundException('Không tìm thấy phiếu đăng ký');
    }

    const isTuDo = phieu.chuyenThamQuan?.cach_to_chuc === 'TuDo';
    if (!isTuDo) {
      throw new BadRequestException(
        'Chỉ chuyến tham quan tự do mới nộp giấy xác nhận tham quan của doanh nghiệp',
      );
    }

    const phieuTQ = await this.phieuTQRepo.findOne({
      where: { phieu_dang_ky_id: registrationId },
    });
    if (!phieuTQ) {
      throw new BadRequestException(
        'Chuyến đi này chưa được cấp phiếu tham quan',
      );
    }

    const accountId = phieu.sinhVien?.taikhoan_id;
    const mssv = phieu.sinhVien?.mssv;

    let validXacNhanRef = '';
    try {
      validXacNhanRef = this.sanitizeAndValidateFileRef(
        fileXacNhanUrl,
        'attachments',
        accountId,
        mssv,
      );
    } catch {
      validXacNhanRef = this.sanitizeAndValidateFileRef(
        fileXacNhanUrl,
        'payments',
        accountId,
        mssv,
      );
    }

    let report = await this.baiThuRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });
    if (!report) {
      report = new BaiThuHoach();
      report.phieu_tham_quan_id = phieuTQ.id;
      report.file_bao_cao = '';
      report.trang_thai = 'ChoDiemDanh';
      report.ngay_nop = new Date();
    }
    report.file_xac_nhan_tham_quan = validXacNhanRef as any;
    await this.baiThuRepo.save(report);

    return {
      message: 'Tải lên giấy xác nhận doanh nghiệp thành công. Đang chờ Giảng viên duyệt điểm danh.',
      fileXacNhan: validXacNhanRef,
    };
  }

  // Sinh vien xoa bai thu hoach
  async deleteReport(studentId: number, registrationId: number) {
    const phieuTQ = await this.phieuTQRepo.findOne({
      where: { phieu_dang_ky_id: registrationId },
      relations: { baiThuHoach: true },
    });

    if (!phieuTQ || !phieuTQ.baiThuHoach) {
      throw new NotFoundException('Không tìm thấy bài thu hoạch cần xóa');
    }

    const report = phieuTQ.baiThuHoach;

    if (phieuTQ.han_nop_bao_cao && new Date() > phieuTQ.han_nop_bao_cao) {
      throw new BadRequestException(
        'Đã hết hạn 10 ngày để chỉnh sửa. Bài nộp đã được gửi cho giảng viên và không thể thu hồi.',
      );
    }

    // Kiểm tra xem đã có điểm chưa
    const diem = await this.diemPhieuRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });

    if (
      diem &&
      (diem.diem_chuan_bi != null ||
        diem.diem_thu_hoach != null ||
        diem.diem_hoi_dong_final != null)
    ) {
      throw new BadRequestException(
        'Bài thu hoạch này đã được chấm điểm, không thể xóa để nộp lại.',
      );
    }

    // Xóa file trên R2
    if (this.r2Storage.isReady()) {
      if (report.file_bao_cao) {
        try {
          await this.r2Storage.deleteFile(
            this.r2Storage.BUCKET_REPORTS,
            report.file_bao_cao,
          );

          // Xóa file .txt tương ứng
          const txtKey = report.file_bao_cao.replace(/\.\w+$/, '.txt');
          await this.r2Storage.deleteFile(
            this.r2Storage.BUCKET_REPORTS,
            txtKey,
          );
        } catch (e) {
          console.error('Lỗi khi xóa file báo cáo trên R2:', e);
        }
      }

      if (report.file_xac_nhan_tham_quan) {
        try {
          const bucket = report.file_xac_nhan_tham_quan.includes('attachments')
            ? this.r2Storage.BUCKET_ATTACHMENTS
            : this.r2Storage.BUCKET_PAYMENTS;
          await this.r2Storage.deleteFile(
            bucket,
            report.file_xac_nhan_tham_quan,
          );
        } catch (e) {
          console.error('Lỗi khi xóa file xác nhận trên R2:', e);
        }
      }
    }

    // Xóa bản ghi trong DB
    await this.baiThuRepo.remove(report);

    return { message: 'Xóa bài thu hoạch thành công' };
  }

  // Chot bo 3 chuyen bao cao dai dien theo nguyen vong
  async selectRepresentativeTrips(
    studentId: number,
    termStudentId: number | undefined,
    registrationIds: number[],
  ) {
    if (!registrationIds || registrationIds.length !== 3) {
      throw new BadRequestException(
        'Bộ chuyến báo cáo đại diện phải gồm chính xác 3 chuyến đi.',
      );
    }

    // Tu dong tim termStudentId neu frontend khong truyen
    if (!termStudentId) {
      const dksv = await this.dksvRepo.findOne({
        where: { sinh_vien_id: studentId },
        order: { id: 'DESC' },
      });
      if (!dksv) {
        throw new BadRequestException(
          'Không tìm thấy thông tin đăng ký đợt kiến tập của sinh viên.',
        );
      }
      termStudentId = dksv.id;
    }

    const dksv = await this.dksvRepo.findOne({ where: { id: termStudentId } });
    if (!dksv) {
      throw new BadRequestException('Thông tin đợt kiến tập không hợp lệ.');
    }

    // 1. Kiem tra xem Khoa co dang Khoa cong chon bo chuyen cua dot khong
    if (BoChuyenLockManager.isLocked(dksv.dot_kien_tap_id)) {
      throw new BadRequestException(
        'Quản lý Khoa đã khóa cổng đăng ký / thay đổi Bộ 3 chuyến báo cáo cho đợt này (Đã chốt danh sách báo cáo).',
      );
    }

    // 2. Kiem tra xem sinh vien da duoc Khoa phan cong vao Hoi dong chua
    const currentBo = await this.boChuyenRepo.findOne({
      where: { dot_kien_tap_sinh_vien_id: termStudentId },
      relations: { hoiDong: true },
    });
    if (currentBo && currentBo.hoi_dong_id) {
      throw new BadRequestException(
        `Bạn đã được Quản lý Khoa phân công vào Hội đồng "${currentBo.hoiDong?.ten_hoi_dong || 'bảo vệ'}", không thể tự ý thay đổi bộ 3 chuyến báo cáo.`,
      );
    }

    // 3. Kiem tra 3 phieu dang ky phai thuoc dung sinh vien va da nop bai thu hoach
    const phieus = await this.phieuRepo.find({
      where: { id: In(registrationIds), sinh_vien_id: studentId },
      relations: {
        chuyenThamQuan: { nhaMay: true },
        phieuThamQuan: { baiThuHoach: true, diemPhieuThamQuan: true },
      },
    });

    if (phieus.length !== 3) {
      throw new BadRequestException(
        'Danh sách chuyến chọn không hợp lệ hoặc không thuộc quyền sở hữu của bạn.',
      );
    }

    for (const phieu of phieus) {
      if (
        phieu.trang_thai === 'VangMat' ||
        phieu.trang_thai === 'BiLoai' ||
        phieu.trang_thai === 'DaHuy' ||
        phieu.trang_thai === 'KhongDat'
      ) {
        throw new BadRequestException(
          `Chuyến đi "${phieu.chuyenThamQuan?.nhaMay?.ten_nha_may || phieu.id}" ở trạng thái ${phieu.trang_thai}, không thể chọn để báo cáo.`,
        );
      }
      if (
        phieu.phieuThamQuan?.trang_thai === 'DaHuy' ||
        phieu.phieuThamQuan?.trang_thai === 'KhongDat'
      ) {
        throw new BadRequestException(
          `Chuyến đi "${phieu.chuyenThamQuan?.nhaMay?.ten_nha_may || phieu.id}" có phiếu tham quan không hợp lệ (${phieu.phieuThamQuan.trang_thai}), không thể chọn để báo cáo.`,
        );
      }
      // Không cho phép tái sử dụng chuyến tham quan thuộc đợt kiến tập trước đã bị 'KhongDat'
      if (
        phieu.chuyenThamQuan?.lichKienTap?.dot_kien_tap_id &&
        phieu.chuyenThamQuan.lichKienTap.dot_kien_tap_id !== dksv.dot_kien_tap_id
      ) {
        const oldDksv = await this.dksvRepo.findOne({
          where: {
            sinh_vien_id: studentId,
            dot_kien_tap_id: phieu.chuyenThamQuan.lichKienTap.dot_kien_tap_id,
          },
        });
        if (oldDksv && oldDksv.trang_thai === 'KhongDat') {
          throw new BadRequestException(
            `Chuyến đi "${phieu.chuyenThamQuan?.nhaMay?.ten_nha_may || phieu.id}" thuộc đợt kiến tập trước đã có kết quả Không đạt, không thể tái sử dụng cho đợt này.`,
          );
        }
      }
      if (!phieu.phieuThamQuan || !phieu.phieuThamQuan.baiThuHoach) {
        throw new BadRequestException(
          `Chuyến đi "${phieu.chuyenThamQuan?.nhaMay?.ten_nha_may || phieu.id}" chưa nộp bài thu hoạch, không thể chọn để báo cáo.`,
        );
      }
      if (phieu.phieuThamQuan?.diemPhieuThamQuan?.da_khoa) {
        throw new BadRequestException(
          `Chuyến đi "${phieu.chuyenThamQuan?.nhaMay?.ten_nha_may || phieu.id}" đã bị khóa điểm, không thể thay đổi.`,
        );
      }
    }

    // 4. Kiem tra co cau bat buoc cua hoc phan: 3 nha may khac nhau
    const nhaMayIds = new Set(
      phieus.map((p) => p.chuyenThamQuan?.nha_may_id).filter(Boolean),
    );
    if (nhaMayIds.size !== 3) {
      throw new BadRequestException(
        'Theo quy định chính thức của học phần, Bộ 3 chuyến báo cáo phải thuộc 3 nhà máy khác nhau.',
      );
    }

    // 5. Kiem tra co cau hinh thuc: dung 2 truc tiep va 1 truc tuyen
    const directCount = phieus.filter(
      (p) => p.chuyenThamQuan?.hinh_thuc === 'TrucTiep',
    ).length;
    const onlineCount = phieus.filter(
      (p) => p.chuyenThamQuan?.hinh_thuc === 'TrucTuyen',
    ).length;

    if (directCount !== 2 || onlineCount !== 1) {
      throw new BadRequestException(
        'Theo quy định chính thức của học phần, cơ cấu báo cáo bắt buộc phải gồm đúng 2 chuyến Trực tiếp (Offline) và 1 chuyến Trực tuyến (Online/Webinar).',
      );
    }

    // 6. Luu hoac cap nhat BoChuyenBaoCao
    let savedBo: BoChuyenBaoCao;
    if (currentBo) {
      // Go bo FK cu tren cac phieu tham quan
      await this.phieuTQRepo.update(
        { bo_chuyen_bao_cao_id: currentBo.id },
        { bo_chuyen_bao_cao_id: null as any },
      );
      currentBo.ngay_chon = new Date();
      savedBo = await this.boChuyenRepo.save(currentBo);
    } else {
      const bo = new BoChuyenBaoCao();
      bo.dot_kien_tap_sinh_vien_id = termStudentId;
      bo.ngay_chon = new Date();
      savedBo = await this.boChuyenRepo.save(bo);
    }

    // Gan bo_chuyen_bao_cao_id truc tiep tren PhieuThamQuan
    for (const rId of registrationIds) {
      const phieuTQ = await this.phieuTQRepo.findOne({
        where: { phieu_dang_ky_id: rId },
      });
      if (phieuTQ) {
        phieuTQ.bo_chuyen_bao_cao_id = savedBo.id;
        await this.phieuTQRepo.save(phieuTQ);
      }
    }

    return { message: 'Đăng ký Bộ 3 chuyến báo cáo theo nguyện vọng thành công' };
  }

  // Lay trang thai va tien do dang ky bo 3 chuyen bao cao cua sinh vien
  async getRepresentativeTripsStatus(studentId: number) {
    const dksv = await this.dksvRepo.findOne({
      where: { sinh_vien_id: studentId },
      relations: { dotKienTap: true },
      order: { id: 'DESC' },
    });

    const dotId = dksv?.dot_kien_tap_id;
    const isFacultyMasterLocked = dotId
      ? BoChuyenLockManager.isLocked(dotId)
      : false;

    const phieus = await this.phieuRepo.find({
      where: { sinh_vien_id: studentId },
      relations: {
        chuyenThamQuan: { nhaMay: true },
        phieuThamQuan: { baiThuHoach: true, diemPhieuThamQuan: true },
      },
      order: { ngay_dang_ky: 'DESC' },
    });

    // Cac chuyen da nop bai thu hoach hop le (khong bi danh KhongDat)
    const completedTrips = phieus.filter(
      (p) =>
        ['HopLe', 'DaThamGia', 'HoanThanh'].includes(p.trang_thai) &&
        p.trang_thai !== 'KhongDat' &&
        p.phieuThamQuan?.trang_thai === 'HopLe' &&
        p.phieuThamQuan?.baiThuHoach != null,
    );

    const directTrips = completedTrips.filter(
      (p) => p.chuyenThamQuan?.hinh_thuc === 'TrucTiep',
    );
    const onlineTrips = completedTrips.filter(
      (p) => p.chuyenThamQuan?.hinh_thuc === 'TrucTuyen',
    );

    const distinctFactoryIds = new Set(
      completedTrips.map((p) => p.chuyenThamQuan?.nha_may_id).filter(Boolean),
    );

    const directCount = directTrips.length;
    const onlineCount = onlineTrips.length;
    const distinctFactoryCount = distinctFactoryIds.size;

    const directOk = directCount >= 2;
    const onlineOk = onlineCount >= 1;
    const factoriesOk = distinctFactoryCount >= 3;
    const isEligible = directOk && onlineOk && factoriesOk;

    // Tim BoChuyenBaoCao hien tai
    const bo = dksv
      ? await this.boChuyenRepo.findOne({
          where: { dot_kien_tap_sinh_vien_id: dksv.id },
          relations: { hoiDong: true },
        })
      : null;

    let selectedRegistrationIds: number[] = [];
    let isGradesLocked = false;

    if (bo) {
      const ptqs = await this.phieuTQRepo.find({
        where: { bo_chuyen_bao_cao_id: bo.id },
        relations: { diemPhieuThamQuan: true },
      });
      selectedRegistrationIds = ptqs
        .map((p) => p.phieu_dang_ky_id)
        .filter(Boolean);
      isGradesLocked = ptqs.some(
        (p) => p.diemPhieuThamQuan?.da_khoa === true,
      );
    }

    let assignedCouncil: any = null;
    if (bo && bo.hoiDong) {
      const members = await this.dataSource.manager.find(HoiDong_ThanhVien, {
        where: { hoi_dong_id: bo.hoi_dong_id },
        relations: { giangVien: true },
      });

      assignedCouncil = {
        id: bo.hoiDong.id,
        tenHoiDong: bo.hoiDong.ten_hoi_dong,
        ngayBaoCao: bo.hoiDong.ngay_bao_cao,
        diaDiem: bo.hoiDong.dia_diem,
        daKhoa: isGradesLocked,
        thanhVien: members.map((m) => ({
          id: m.giangVien?.id,
          hoTen: m.giangVien?.ho_ten || 'Giảng viên',
          vaiTro: m.vai_tro,
          email: m.giangVien?.email,
        })),
      };
    }

    const isAssignedToCouncil = !!(bo && bo.hoi_dong_id);
    const isLockedByKhoa =
      isFacultyMasterLocked || isAssignedToCouncil || isGradesLocked;

    let lockReason: string | null = null;
    if (isGradesLocked) {
      lockReason = 'GRADES_LOCKED';
    } else if (isAssignedToCouncil) {
      lockReason = 'ASSIGNED_TO_BOARD';
    } else if (isFacultyMasterLocked) {
      lockReason = 'KHOA_LOCKED';
    }

    const canEdit = isEligible && !isLockedByKhoa;

    return {
      studentId,
      termStudentId: dksv?.id || null,
      dotKienTapId: dotId || null,
      tenDot: dksv?.dotKienTap?.ten_dot || null,
      completedTripsCount: completedTrips.length,
      directCount,
      onlineCount,
      distinctFactoryCount,
      isEligible,
      requirementDetails: {
        directOk,
        onlineOk,
        factoriesOk,
        requiredDirect: 2,
        requiredOnline: 1,
        requiredDistinctFactories: 3,
      },
      hasSelectedBoChuyen: !!(bo && selectedRegistrationIds.length === 3),
      selectedRegistrationIds,
      boChuyen: bo
        ? {
            id: bo.id,
            ngayChon: bo.ngay_chon,
            hoiDongId: bo.hoi_dong_id,
          }
        : null,
      isLockedByKhoa,
      lockReason,
      assignedCouncil,
      canEdit,
    };
  }

  // Xem diem cua sinh vien
  async getStudentGrades(studentId: number) {
    const dksvs = await this.dksvRepo.find({
      where: { sinh_vien_id: studentId },
      relations: { dotKienTap: { hocKy: true } },
    });

    const results: any[] = [];
    for (const dksv of dksvs) {
      const selectedTrips: any[] = [];

      // Tính điểm tổng kết học phần từ 3 chuyến đại diện đã khóa hoặc đã có điểm
      let calculatedTermScore: number | null = null;
      const bo = await this.boChuyenRepo.findOne({
        where: { dot_kien_tap_sinh_vien_id: dksv.id },
      });
      if (bo) {
        const repTrips = await this.phieuTQRepo.find({
          where: { bo_chuyen_bao_cao_id: bo.id },
          relations: { diemPhieuThamQuan: true },
        });
        if (repTrips.length === 3) {
          const tripScores = repTrips.map((t) => {
            const d = t.diemPhieuThamQuan;
            if (!d) return null;
            if (d.diem_tong_chuyen !== null && d.diem_tong_chuyen !== undefined) {
              return Number(d.diem_tong_chuyen);
            }
            const isChuanBiLocked =
              d.da_khoa_chuan_bi === true || d.da_khoa === true;
            const isThuHoachLocked =
              d.da_khoa_thu_hoach === true || d.da_khoa === true;
            const isHoiDongLocked =
              d.da_khoa_hoi_dong === true || d.da_khoa === true;

            if (
              isChuanBiLocked &&
              isThuHoachLocked &&
              isHoiDongLocked &&
              d.diem_chuan_bi !== null &&
              d.diem_thu_hoach !== null &&
              d.diem_hoi_dong_final !== null
            ) {
              const sc =
                Number(d.diem_chuan_bi) * 0.3 +
                Number(d.diem_thu_hoach) * 0.3 +
                Number(d.diem_hoi_dong_final) * 0.4 +
                Number(d.diem_cong_final || 0);
              return Number(Math.min(10, sc).toFixed(2));
            }
            return null;
          });
          if (tripScores.every((s) => s !== null)) {
            calculatedTermScore = Number(
              (tripScores.reduce((a, b) => a! + b!, 0)! / 3).toFixed(2),
            );
          }
        }
      }

      // Xác định kết quả học phần chung của sinh viên:
      let termOutcome: 'Dat' | 'KhongDat' | 'DangThucHien' = 'DangThucHien';
      if (dksv.trang_thai === 'Dat' || dksv.trang_thai === 'KhongDat') {
        termOutcome = dksv.trang_thai as any;
      } else if (calculatedTermScore !== null) {
        termOutcome = calculatedTermScore >= 5.0 ? 'Dat' : 'KhongDat';
      }

      const pdks = await this.phieuRepo.find({
        where: [
          {
            sinh_vien_id: studentId,
            chuyenThamQuan: {
              lichKienTap: {
                dot_kien_tap_id: dksv.dot_kien_tap_id,
              },
            },
          },
          {
            sinh_vien_id: studentId,
            chuyenThamQuan: {
              lich_kien_tap_id: IsNull(),
            },
          },
        ],
        relations: {
          chuyenThamQuan: { nhaMay: true, lichKienTap: true },
          phieuThamQuan: true,
        },
      });

      for (const pdk of pdks) {
        if (!pdk.phieuThamQuan || pdk.phieuThamQuan.trang_thai !== 'HopLe') {
          continue;
        }
        if (pdk.trang_thai === 'BiLoai' || pdk.trang_thai === 'DaHuy') {
          continue;
        }
        const phieuTQ = pdk.phieuThamQuan;
        let score = await this.diemPhieuRepo.findOne({
          where: { phieu_tham_quan_id: phieuTQ.id },
        });

        if (!score) {
          score = new DiemPhieuThamQuan();
          score.phieu_tham_quan_id = phieuTQ.id;
          score.diem_cong_final = 0;
          score = await this.diemPhieuRepo.save(score);
        }

        // Điểm chuẩn bị và điểm cộng: Hiển thị khi Giảng viên dẫn đoàn đã chốt (da_khoa_chuan_bi) hoặc Khoa đã khóa (da_khoa)
        const isChuanBiLocked =
          score.da_khoa_chuan_bi === true || score.da_khoa === true;
        // Điểm bài thu hoạch: Hiển thị khi Giảng viên hướng dẫn đã chốt (da_khoa_thu_hoach) hoặc Khoa đã khóa (da_khoa)
        const isThuHoachLocked =
          score.da_khoa_thu_hoach === true || score.da_khoa === true;
        // Điểm báo cáo hội đồng: Hiển thị khi Hội đồng đã khóa (da_khoa_hoi_dong) hoặc Khoa đã khóa (da_khoa)
        const isBaoCaoLocked =
          score.da_khoa_hoi_dong === true || score.da_khoa === true;

        const diemChuanBi = isChuanBiLocked ? (score.diem_chuan_bi ?? null) : null;
        const diemCong = isChuanBiLocked ? (score.diem_cong_final ?? null) : null;
        const diemThuHoach = isThuHoachLocked ? (score.diem_thu_hoach ?? null) : null;
        const diemBaoCao = isBaoCaoLocked ? (score.diem_hoi_dong_final ?? null) : null;

        let diemTongChuyen: number | null = null;
        if (score.diem_tong_chuyen !== null && score.diem_tong_chuyen !== undefined) {
          diemTongChuyen = Number(score.diem_tong_chuyen);
        } else if (diemChuanBi !== null && diemThuHoach !== null && diemBaoCao !== null) {
          const total =
            Number(diemChuanBi) * 0.3 +
            Number(diemThuHoach) * 0.3 +
            Number(diemBaoCao) * 0.4 +
            Number(diemCong || 0);
          diemTongChuyen = Number(Math.min(10, total).toFixed(2));
        }

        // Nếu sinh viên được đánh Đạt -> tất cả các chuyến đều Đạt
        // Nếu sinh viên bị đánh Không đạt -> tất cả các chuyến đều Không đạt
        // Nếu đang thực hiện -> tính theo điểm chuyến (nếu đủ điểm) hoặc Chờ chốt điểm
        let ketQua = 'ChoDiem';
        if (termOutcome === 'Dat') {
          ketQua = 'Dat';
        } else if (termOutcome === 'KhongDat') {
          ketQua = 'KhongDat';
        } else if (diemTongChuyen !== null) {
          ketQua = diemTongChuyen >= 5.0 ? 'Dat' : 'KhongDat';
        }

        selectedTrips.push({
          id: phieuTQ.id,
          phieu_dang_ky_id: pdk.id,
          ten_nha_may: pdk.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chưa cập nhật',
          hinh_thuc: pdk.chuyenThamQuan?.hinh_thuc || 'N/A',
          diem_chuan_bi: diemChuanBi,
          diem_bai_thu_hoach: diemThuHoach,
          diem_bao_cao_tqnm: diemBaoCao,
          diem_cong: diemCong,
          diem_tong_chuyen: diemTongChuyen,
          ket_qua: ketQua,
          da_khoa_chuan_bi: score.da_khoa_chuan_bi ?? false,
          da_khoa_thu_hoach: score.da_khoa_thu_hoach ?? false,
          da_khoa_hoi_dong: score.da_khoa_hoi_dong ?? false,
          da_khoa: score.da_khoa ?? false,
        });
      }

      results.push({
        id: dksv.id,
        dot_kien_tap_id: dksv.dot_kien_tap_id,
        dotKienTap: dksv.dotKienTap,
        lan_dang_ky: dksv.lan_dang_ky,
        trang_thai: termOutcome === 'DangThucHien' ? dksv.trang_thai : termOutcome,
        diem_tong_ket: calculatedTermScore,
        ket_qua: termOutcome === 'DangThucHien' ? dksv.trang_thai : termOutcome,
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
        t.phieuThamQuan &&
        t.trang_thai === 'HopLe' &&
        (!t.phieuThamQuan?.baiThuHoach ||
          Object.keys(t.phieuThamQuan.baiThuHoach).length === 0),
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
              if (!diem) continue;
              if (diem.diem_tong_chuyen !== null && diem.diem_tong_chuyen !== undefined) {
                scores.push(Number(diem.diem_tong_chuyen));
              } else {
                const isChuanBiLocked =
                  diem.da_khoa_chuan_bi === true || diem.da_khoa === true;
                const isThuHoachLocked =
                  diem.da_khoa_thu_hoach === true || diem.da_khoa === true;
                const isHoiDongLocked =
                  diem.da_khoa_hoi_dong === true || diem.da_khoa === true;

                if (
                  isChuanBiLocked &&
                  isThuHoachLocked &&
                  isHoiDongLocked &&
                  diem.diem_chuan_bi !== null &&
                  diem.diem_thu_hoach !== null &&
                  diem.diem_hoi_dong_final !== null
                ) {
                  scores.push(
                    Number(diem.diem_chuan_bi) * 0.3 +
                      Number(diem.diem_thu_hoach) * 0.3 +
                      Number(diem.diem_hoi_dong_final) * 0.4 +
                      Number(diem.diem_cong_final || 0),
                  );
                }
              }
            }
            if (scores.length === phieuTQs.length && scores.length > 0) {
              const avg =
                scores.reduce((sum, val) => sum + val, 0) / scores.length;
              avgScore = avg.toFixed(1);
            }
          }
        }
      }
    }

    return { registered, completed, pendingReports, avgScore };
  }

  async getTripInfo(studentId: number, tripId: number) {
    const isRegistered = await this.phieuRepo.findOne({
      where: {
        sinh_vien_id: studentId,
        chuyen_tham_quan_id: tripId,
        trang_thai: In(['HopLe', 'DaThamGia', 'HoanThanh']),
      },
    });

    if (!isRegistered) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin chuyến tham quan này');
    }

    const phanCongs = await this.dataSource.manager.find('PhanCongGiangVienDanDoan', {
      where: { chuyen_tham_quan_id: tripId },
      relations: { giangVien: true },
    } as any);

    const lecturers = phanCongs
      .filter((pc: any) => pc.giangVien != null)
      .map((pc: any) => ({
        id: pc.giangVien.id,
        ho_ten: pc.giangVien.ho_ten,
        email: pc.giangVien.email,
        so_dien_thoai: pc.giangVien.so_dien_thoai,
        la_truong_doan: pc.la_truong_doan,
      }));

    const dsSinhVien = await this.phieuRepo.find({
      where: {
        chuyen_tham_quan_id: tripId,
        trang_thai: In(['HopLe', 'DaThamGia', 'HoanThanh']),
      },
      relations: { sinhVien: true },
    });

    const students = dsSinhVien.map(p => ({
      id: p.sinhVien.id,
      mssv: p.sinhVien.mssv,
      ho_ten: p.sinhVien.ho_ten,
      email: p.sinhVien.email,
      sdt: p.sinhVien.sdt,
      truong_nhom: false,
    }));

    // Sắp xếp theo MSSV
    students.sort((a, b) => {
      return a.mssv.localeCompare(b.mssv);
    });

    return { lecturers, students };
  }

  private async runBackgroundExtraction(validBaoCaoRef: string) {
    try {
      console.log(`[Background AI OCR] Đang tiến hành trích xuất ngầm cho: ${validBaoCaoRef}`);
      
      const keyRegex = /^\/api\/upload\/file\/reports\/(.+)$/;
      const match = validBaoCaoRef.match(keyRegex);
      if (!match) return;

      const r2Key = match[1];

      // 1. Download file
      const signedUrl = await this.r2Storage.getSignedUrl(
        this.r2Storage.BUCKET_REPORTS,
        r2Key,
        3600,
      );
      
      const fileRes = await fetch(signedUrl);
      if (!fileRes.ok) {
        console.error(`[Background AI OCR] Không thể tải file từ R2: ${fileRes.status}`);
        return;
      }
      
      const pdfBuffer = await fileRes.arrayBuffer();
      const fileName = r2Key.split('/').pop() || 'report.pdf';

      // 2. Gọi Python OCR
      const formData = new FormData();
      const fileBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
      formData.append('file', fileBlob, fileName);

      const aiResponse = await fetch('http://127.0.0.1:8000/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        if (aiData.extracted_text) {
          const extractedText = aiData.extracted_text.trim();
          console.log(`[Background AI OCR] Trích xuất thành công: ${r2Key}`);
          
          // 3. Upload file txt lên R2
          const txtKey = r2Key.replace(/\.\w+$/, '.txt');
          const txtBuffer = Buffer.from('\uFEFF' + extractedText, 'utf-8');
          
          await this.r2Storage.uploadFile(
            this.r2Storage.BUCKET_REPORTS,
            txtKey,
            txtBuffer,
            'text/plain; charset=utf-8',
          );
        }
      } else {
        console.error('[Background AI OCR] Lỗi OCR service:', await aiResponse.text());
      }
    } catch (err) {
      console.error('[Background AI OCR] Lỗi quá trình trích xuất ngầm:', err);
    }
  }
}





