import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, IsNull } from 'typeorm';
import {
  GiangVien,
  LichKienTap_SinhVien,
  PhanCongGVHD,
  ChuyenThamQuan,
  ChuyenThamQuan_GiangVienDanDoan,
  PhieuDangKy,
  DiemDanh,
  PhieuThamQuan,
  DiemPhieuThamQuan,
  NhatKyDiemCong,
  BaiThuHoach,
  HoiDong_ThanhVien,
  DiemHoiDong_ChiTiet,
  HoiDongChamBaoCao,
  DanhSachDen,
  ThongBao,
  ThongBaoDaDoc,
} from '../entities/qlkt.entity';

@Injectable()
export class GiangVienService {
  constructor(
    @InjectRepository(GiangVien) private gvRepo: Repository<GiangVien>,
    @InjectRepository(PhanCongGVHD)
    private phanCongRepo: Repository<PhanCongGVHD>,
    @InjectRepository(ChuyenThamQuan_GiangVienDanDoan)
    private danDoanRepo: Repository<ChuyenThamQuan_GiangVienDanDoan>,
    @InjectRepository(ChuyenThamQuan)
    private chuyenRepo: Repository<ChuyenThamQuan>,
    @InjectRepository(PhieuDangKy) private phieuRepo: Repository<PhieuDangKy>,
    @InjectRepository(DiemDanh) private diemDanhRepo: Repository<DiemDanh>,
    @InjectRepository(DiemPhieuThamQuan)
    private diemPhieuRepo: Repository<DiemPhieuThamQuan>,
    @InjectRepository(PhieuThamQuan)
    private phieuTQRepo: Repository<PhieuThamQuan>,
    @InjectRepository(NhatKyDiemCong)
    private diemCongRepo: Repository<NhatKyDiemCong>,
    @InjectRepository(BaiThuHoach) private baiThuRepo: Repository<BaiThuHoach>,
    @InjectRepository(HoiDong_ThanhVien)
    private hoiDongThanhVienRepo: Repository<HoiDong_ThanhVien>,
    @InjectRepository(DiemHoiDong_ChiTiet)
    private diemHoiDongRepo: Repository<DiemHoiDong_ChiTiet>,
    @InjectRepository(HoiDongChamBaoCao)
    private hoiDongRepo: Repository<HoiDongChamBaoCao>,
    @InjectRepository(DanhSachDen)
    private blacklistRepo: Repository<DanhSachDen>,
    @InjectRepository(ThongBao) private thongBaoRepo: Repository<ThongBao>,
    @InjectRepository(ThongBaoDaDoc) private daDocRepo: Repository<ThongBaoDaDoc>,
    private dataSource: DataSource,
  ) {}

  // Lay thong tin GV bang TaiKhoan ID
  async getLecturerByAccountId(accountId: number) {
    const gv = await this.gvRepo.findOne({ where: { taikhoan_id: accountId } });
    if (!gv) throw new NotFoundException('Không tìm thấy giảng viên');
    return gv;
  }

  // Danh sach sinh vien huong dan (GVHD)
  async getGuidedStudents(lecturerId: number) {
    const assignments = await this.phanCongRepo.find({
      where: { giang_vien_id: lecturerId, trang_thai: 'DangHoatDong' },
      relations: {
        lichKienTapSinhVien: {
          sinhVien: true,
          lichKienTap: true,
        },
      },
    });
    return assignments.map((a) => a.lichKienTapSinhVien);
  }

  // Danh sach chuyến dan doan cua giang vien
  async getLedTrips(lecturerId: number) {
    const mappings = await this.danDoanRepo.find({
      where: { giang_vien_id: lecturerId },
      relations: {
        chuyenThamQuan: {
          nhaMay: true,
          lichKienTap: true,
        },
      },
    });
    return mappings.map((m) => ({
      ...m.chuyenThamQuan,
      la_truong_doan: m.la_truong_doan,
    }));
  }

  // Lay danh sach SV trong chuyen tham quan de diem danh/nhap diem
  async getTripRegistrations(lecturerId: number, tripId: number) {
    const trip = await this.chuyenRepo.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('Không tìm thấy chuyến tham quan');
    }

    const isLead = await this.danDoanRepo.findOne({
      where: { chuyen_tham_quan_id: tripId, giang_vien_id: lecturerId },
    });
    if (!isLead) {
      throw new ForbiddenException(
        'Bạn không được phân công dẫn đoàn cho chuyến tham quan này',
      );
    }

    const phieus = await this.phieuRepo.find({
      where: {
        chuyen_tham_quan_id: tripId,
        trang_thai: In(['HopLe', 'ChoDuyet']),
      },
      relations: { sinhVien: true },
    });

    if (phieus.length === 0) return [];

    const phieuIds = phieus.map((p) => p.id);

    const phieuTQs = await this.phieuTQRepo.find({
      where: { phieu_dang_ky_id: In(phieuIds) }
    });
    const phieuTQIds = phieuTQs.map(ptq => ptq.id);
    const phieuTQMap = new Map(phieuTQs.map(ptq => [ptq.phieu_dang_ky_id, ptq]));

    const diemDanhs = await this.diemDanhRepo.find({
      where: { phieu_tham_quan_id: In(phieuTQIds) },
    });

    const diems = await this.diemPhieuRepo.find({
      where: { phieu_tham_quan_id: In(phieuTQIds) },
    });

    return phieus.map((p) => {
      const ptq = phieuTQMap.get(p.id);
      const dd = ptq ? diemDanhs.find((d) => d.phieu_tham_quan_id === ptq.id) : null;
      const score = ptq ? diems.find((d) => d.phieu_tham_quan_id === ptq.id) : null;
      return {
        ...p,
        diemDanh: dd
          ? { id: dd.id, trang_thai: dd.trang_thai, ghi_chu: dd.ghi_chu }
          : null,
        diemPhieuThamQuan: score
          ? {
              id: score.id,
              diem_chuan_bi: score.diem_chuan_bi_final,
              diem_cong: score.diem_cong_final,
            }
          : null,
      };
    });
  }

  // Diem danh sinh vien - Atomic Transaction
  async takeAttendance(
    lecturerId: number,
    tripId: number,
    records: { phieuId: number; status: string; note?: string }[],
  ) {
    if (!records || records.length === 0) {
      throw new BadRequestException('Không có bản ghi điểm danh');
    }

    // 1. Validate trùng lặp phieuId trong payload request
    const phieuIds = records.map((r) => r.phieuId);
    const uniquePhieuIds = new Set(phieuIds);
    if (uniquePhieuIds.size !== phieuIds.length) {
      throw new BadRequestException(
        'Danh sách điểm danh chứa phiếu đăng ký trùng lặp',
      );
    }

    // 2. Validate giá trị trạng thái trước khi thực hiện ghi dữ liệu
    const VALID_STATUSES = ['CoMat', 'Vang', 'TuChoiThamGia'];
    for (const record of records) {
      if (
        !record.phieuId ||
        typeof record.phieuId !== 'number' ||
        record.phieuId < 1
      ) {
        throw new BadRequestException('Mã phiếu đăng ký không hợp lệ');
      }
      if (!record.status || !VALID_STATUSES.includes(record.status)) {
        throw new BadRequestException(
          `Trạng thái điểm danh '${record.status}' không hợp lệ. Chỉ chấp nhận CoMat, Vang, TuChoiThamGia`,
        );
      }
    }

    // 3. Thực hiện toàn bộ logic trong một TypeORM Transaction
    return await this.dataSource.transaction(async (manager) => {
      // 3a. Kiểm tra tồn tại của chuyến tham quan trong transaction
      const trip = await manager.findOne(ChuyenThamQuan, {
        where: { id: tripId },
      });
      if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

      // 3b. Kiểm tra quyền giảng viên dẫn đoàn trong transaction
      const isLead = await manager.findOne(ChuyenThamQuan_GiangVienDanDoan, {
        where: { chuyen_tham_quan_id: tripId, giang_vien_id: lecturerId },
      });
      if (!isLead) {
        throw new ForbiddenException(
          'Bạn không được phân công dẫn đoàn cho chuyến tham quan này',
        );
      }

      // 3c. Preload tất cả phiếu đăng ký theo nhóm & validate mối quan hệ với chuyến đi
      const phieus = await manager.find(PhieuDangKy, {
        where: { id: In(Array.from(uniquePhieuIds)) },
      });

      if (phieus.length !== uniquePhieuIds.size) {
        throw new NotFoundException('Có phiếu đăng ký không tồn tại');
      }

      const phieuMap = new Map<number, PhieuDangKy>();
      for (const phieu of phieus) {
        if (phieu.chuyen_tham_quan_id !== tripId) {
          throw new BadRequestException(
            `Phiếu đăng ký #${phieu.id} không thuộc chuyến tham quan này`,
          );
        }
        phieuMap.set(phieu.id, phieu);
      }

      // 3d. Preload batch Điểm Danh và Danh Sách Đen còn hiệu lực để xử lý hiệu quả & tránh n+1
      const phieuTQs = await manager.find(PhieuThamQuan, {
        where: { phieu_dang_ky_id: In(Array.from(uniquePhieuIds)) },
      });
      const phieuTQIds = phieuTQs.map(ptq => ptq.id);
      const ptqMapByPhieuId = new Map(phieuTQs.map(ptq => [ptq.phieu_dang_ky_id, ptq]));

      const existingDiemDanhs = await manager.find(DiemDanh, {
        where: { phieu_tham_quan_id: In(phieuTQIds) },
      });
      const diemDanhMap = new Map<number, DiemDanh>();
      for (const dd of existingDiemDanhs) {
        diemDanhMap.set(dd.phieu_tham_quan_id, dd);
      }

      const existingBlacklists = await manager.find(DanhSachDen, {
        where: {
          phieu_dang_ky_id: In(Array.from(uniquePhieuIds)),
          ly_do: 'DangKyKhongThamGia',
          con_hieu_luc: true,
        },
      });
      const blacklistSet = new Set<number>(
        existingBlacklists.map((b) => b.phieu_dang_ky_id),
      );

      // 3e. Cập nhật từng bản ghi điểm danh, trạng thái phiếu & sinh blacklist nếu cần
      for (const record of records) {
        const phieu = phieuMap.get(record.phieuId)!;

        const ptq = ptqMapByPhieuId.get(record.phieuId);
        if (!ptq) throw new BadRequestException('Không tìm thấy phiếu tham quan cho phiếu đăng ký ' + record.phieuId);

        let dd = diemDanhMap.get(ptq.id);
        if (!dd) {
          dd = new DiemDanh();
          dd.phieu_tham_quan_id = ptq.id;
        }
        dd.trang_thai = record.status; // 'CoMat' | 'Vang' | 'TuChoiThamGia'
        dd.ghi_chu = (record.note || null) as any;
        dd.nguoi_diem_danh_id = lecturerId;
        dd.ngay_diem_danh = new Date();
        await manager.save(DiemDanh, dd);

        if (
          record.status === 'Vang' ||
          record.status === 'TuChoiThamGia'
        ) {

          // Chỉ tự động thêm vào blacklist nếu chưa có blacklist DangKyKhongThamGia còn hiệu lực cho phiếu này
          if (!blacklistSet.has(phieu.id)) {
            const black = new DanhSachDen();
            black.sinh_vien_id = phieu.sinh_vien_id;
            black.ly_do = 'DangKyKhongThamGia';
            black.phieu_dang_ky_id = phieu.id;
            black.ngay_ghi_nhan = new Date();
            black.con_hieu_luc = true;
            await manager.save(DanhSachDen, black);

            // Đánh dấu đã tồn tại blacklist trong bộ nhớ transaction
            blacklistSet.add(phieu.id);
          }
        }
        await manager.save(PhieuDangKy, phieu);
      }

      // 3f. Cập nhật chuyến đi sang trạng thái DaDienRa sau khi toàn bộ bản ghi đã cập nhật xong
      trip.trang_thai = 'DaDienRa';
      await manager.save(ChuyenThamQuan, trip);

      return { message: 'Ghi nhận điểm danh thành công' };
    });
  }

  // Nhap diem chuan bi va diem cong
  async gradePrepAndBonus(
    lecturerId: number,
    phieuId: number,
    diemChuanBi: number,
    diemCong: number,
  ) {
    if (
      typeof diemChuanBi !== 'number' ||
      !Number.isFinite(diemChuanBi) ||
      diemChuanBi < 0 ||
      diemChuanBi > 10
    ) {
      throw new BadRequestException(
        'Điểm chuẩn bị không hợp lệ (phải từ 0 đến 10)',
      );
    }

    if (
      typeof diemCong !== 'number' ||
      !Number.isFinite(diemCong) ||
      diemCong < 0 ||
      diemCong > 1
    ) {
      throw new BadRequestException('Điểm cộng không hợp lệ (phải từ 0 đến 1)');
    }

    const phieu = await this.phieuRepo.findOne({ where: { id: phieuId } });
    if (!phieu) {
      throw new NotFoundException('Không tìm thấy phiếu đăng ký');
    }

    const isLead = await this.danDoanRepo.findOne({
      where: {
        chuyen_tham_quan_id: phieu.chuyen_tham_quan_id,
        giang_vien_id: lecturerId,
      },
    });
    if (!isLead) {
      throw new ForbiddenException(
        'Bạn không phải giảng viên dẫn đoàn của chuyến tham quan này',
      );
    }

    const phieuTQ = await this.phieuTQRepo.findOne({ where: { phieu_dang_ky_id: phieuId } });
    if (!phieuTQ) {
      throw new NotFoundException('Không tìm thấy phiếu tham quan');
    }

    let diem = await this.diemPhieuRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });
    if (diem && diem.da_khoa) {
      throw new BadRequestException('Điểm của chuyến đi này đã được khóa, không thể chỉnh sửa');
    }
    if (!diem) {
      diem = new DiemPhieuThamQuan();
      diem.phieu_tham_quan_id = phieuTQ.id;
    }

    diem.diem_chuan_bi_final = diemChuanBi;
    diem.diem_cong_final = Math.min(1.0, Math.max(0.0, diemCong));
    await this.diemPhieuRepo.save(diem);

    // Ghi nhan lich su nhat ky diem cong neu co diem cong
    if (diemCong > 0) {
      const nhatKy = new NhatKyDiemCong();
      nhatKy.phieu_tham_quan_id = phieuTQ.id;
      nhatKy.diem = diemCong;
      nhatKy.giang_vien_ghi_nhan_id = lecturerId;
      nhatKy.ngay_ghi_nhan = new Date();
      await this.diemCongRepo.save(nhatKy);
    }

    return { message: 'Cập nhật điểm chuẩn bị và điểm cộng thành công', diem };
  }

  // Lay danh sach bai thu hoach can cham với phân trang
  async getGuidedStudentReports(
    lecturerId: number,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ) {
    // Tim tat ca sinh vien duoc huong dan
    const guidedSvIds = (
      await this.phanCongRepo.find({
        where: { giang_vien_id: lecturerId, trang_thai: 'DangHoatDong' },
        relations: { lichKienTapSinhVien: true },
      })
    ).map((a) => a.lichKienTapSinhVien.sinh_vien_id);

    if (guidedSvIds.length === 0)
      return { data: [], total: 0, page, limit, totalPages: 0 };

    const queryBuilder = this.baiThuRepo
      .createQueryBuilder('baiThu')
      .leftJoinAndSelect('baiThu.phieuThamQuan', 'phieuTQ')
      .leftJoinAndSelect('phieuTQ.phieuDangKy', 'phieu')
      .leftJoinAndSelect('phieu.sinhVien', 'sinhVien')
      .leftJoinAndSelect('phieu.chuyenThamQuan', 'chuyen')
      .leftJoinAndSelect('chuyen.nhaMay', 'nhaMay')
      .where('phieu.sinh_vien_id IN (:...guidedSvIds)', { guidedSvIds });

    if (search) {
      queryBuilder.andWhere(
        '(sinhVien.ho_ten LIKE :search OR sinhVien.mssv LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status && status !== 'all') {
      if (status === 'graded') {
        queryBuilder.andWhere('baiThu.trang_thai = :statusVal', {
          statusVal: 'DaCham',
        });
      } else if (status === 'pending') {
        queryBuilder.andWhere('baiThu.trang_thai != :statusVal', {
          statusVal: 'DaCham',
        });
      }
    }

    const take = limit;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .orderBy('baiThu.ngay_nop', 'DESC')
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

  // Cham diem bai thu hoach
  async gradeReport(
    lecturerId: number,
    reportId: number,
    score: number,
    comment: string,
  ) {
    if (
      typeof score !== 'number' ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 10
    ) {
      throw new BadRequestException(
        'Điểm bài thu hoạch không hợp lệ (phải từ 0 đến 10)',
      );
    }

    const report = await this.baiThuRepo.findOne({
      where: { id: reportId },
      relations: { phieuThamQuan: { phieuDangKy: true } },
    });
    if (!report) throw new NotFoundException('Không tìm thấy bài thu hoạch');

    const phieuId = report.phieuThamQuan.phieu_dang_ky_id;
    const studentId = report.phieuThamQuan.phieuDangKy.sinh_vien_id;

    // Kiểm tra giảng viên có được phân công GVHD cho sinh viên sở hữu bài thu hoạch này hay không
    const assignment = await this.phanCongRepo.findOne({
      where: {
        giang_vien_id: lecturerId,
        trang_thai: 'DangHoatDong',
        lichKienTapSinhVien: {
          sinh_vien_id: studentId,
        },
      },
      relations: { lichKienTapSinhVien: true },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'Bạn không được phân công hướng dẫn sinh viên sở hữu bài thu hoạch này',
      );
    }

    const phieuTQ = await this.phieuTQRepo.findOne({ where: { phieu_dang_ky_id: phieuId } });
    if (!phieuTQ) {
      throw new NotFoundException('Không tìm thấy phiếu tham quan');
    }

    let diem = await this.diemPhieuRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });
    if (diem && diem.da_khoa) {
      throw new BadRequestException('Điểm của phiếu tham quan này đã được khóa, không thể chỉnh sửa');
    }
    if (!diem) {
      diem = new DiemPhieuThamQuan();
      diem.phieu_tham_quan_id = phieuTQ.id;
    }

    diem.diem_thu_hoach_final = score;
    await this.diemPhieuRepo.save(diem);

    return { message: 'Chấm điểm bài thu hoạch thành công', diem };
  }

  // Lay danh sach buoi bao cao hoi dong của giang vien
  async getBoardSessions(lecturerId: number) {
    const mappings = await this.hoiDongThanhVienRepo.find({
      where: { giang_vien_id: lecturerId },
      relations: {
        hoiDong: {
          lichKienTap: true,
        },
      },
    });

    const results = [];
    for (const map of mappings) {
      // Lay danh sach cac phieu dang ky thuoc lich kien tap cua hoi dong nay
      const phieus = await this.phieuRepo.find({
        where: {
          chuyenThamQuan: {
            lich_kien_tap_id: map.hoiDong.lich_kien_tap_id,
          },
          trang_thai: 'HopLe',
        },
        relations: {
          sinhVien: true,
          chuyenThamQuan: {
            nhaMay: true,
          },
        },
      });

      results.push({
        session: map.hoiDong,
        vai_tro: map.vai_tro,
        memberId: map.id,
        registrations: phieus,
      });
    }

    return results;
  }

  // Nhap diem hoi dong chi tiet
  async submitBoardScore(
    lecturerId: number,
    memberId: number,
    phieuId: number,
    score: number,
  ) {
    // Thang điểm 0..10 theo quy chế chấm điểm hội đồng
    if (
      typeof score !== 'number' ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 10
    ) {
      throw new BadRequestException(
        'Điểm hội đồng không hợp lệ (phải từ 0 đến 10)',
      );
    }

    const member = await this.hoiDongThanhVienRepo.findOne({
      where: { id: memberId },
      relations: { hoiDong: true },
    });
    if (!member) {
      throw new NotFoundException('Không tìm thấy thành viên hội đồng');
    }

    if (member.giang_vien_id !== lecturerId) {
      throw new ForbiddenException(
        'Giảng viên không phải thành viên hội đồng này',
      );
    }

    const phieu = await this.phieuRepo.findOne({
      where: { id: phieuId },
      relations: { chuyenThamQuan: true },
    });
    if (!phieu) {
      throw new NotFoundException('Không tìm thấy phiếu đăng ký');
    }

    if (
      phieu.chuyenThamQuan?.lich_kien_tap_id !==
      member.hoiDong?.lich_kien_tap_id
    ) {
      throw new ForbiddenException(
        'Phiếu đăng ký không thuộc kế hoạch kiến tập của hội đồng này',
      );
    }

    const phieuTQ = await this.phieuTQRepo.findOne({ where: { phieu_dang_ky_id: phieuId } });
    if (!phieuTQ) {
      throw new NotFoundException('Không tìm thấy phiếu tham quan');
    }

    const diemPhieuCheck = await this.diemPhieuRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });
    if (diemPhieuCheck && diemPhieuCheck.da_khoa) {
      throw new BadRequestException('Điểm của phiếu tham quan này đã được khóa, không thể chỉnh sửa');
    }

    let item = await this.diemHoiDongRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id, hoi_dong_thanhvien_id: memberId },
    });

    if (!item) {
      item = new DiemHoiDong_ChiTiet();
      item.phieu_tham_quan_id = phieuTQ.id;
      item.hoi_dong_thanhvien_id = memberId;
    }

    item.diem = score;
    item.ngay_cham = new Date();
    await this.diemHoiDongRepo.save(item);

    // Tinh diem trung binh cua tat ca thanh vien trong hoi dong cho phieu nay
    const allScores = await this.diemHoiDongRepo.find({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });

    if (allScores.length > 0) {
      const sum = allScores.reduce((acc, curr) => acc + Number(curr.diem), 0);
      const avg = sum / allScores.length;

      const phieuTQ = await this.phieuTQRepo.findOne({ where: { phieu_dang_ky_id: phieuId } });
      if (phieuTQ) {
        let diemPhieu = await this.diemPhieuRepo.findOne({
          where: { phieu_tham_quan_id: phieuTQ.id },
        });
        if (!diemPhieu) {
          diemPhieu = new DiemPhieuThamQuan();
          diemPhieu.phieu_tham_quan_id = phieuTQ.id;
        }
        diemPhieu.diem_hoi_dong_final = Number(avg.toFixed(2));
        await this.diemPhieuRepo.save(diemPhieu);
      }
    }

    return { message: 'Ghi nhận điểm hội đồng thành công', score: item };
  }

  async getNotifications(lecturerId: number) {
    const gv = await this.gvRepo.findOne({ where: { id: lecturerId } });
    if (!gv) throw new NotFoundException('Không tìm thấy giảng viên');

    const list = await this.thongBaoRepo.find({
      where: { khoa_id: IsNull() },
      order: { ngay_gui: 'DESC' },
    });

    const docIds = (
      await this.daDocRepo.find({ where: { taikhoan_id: gv.taikhoan_id } })
    ).map((d) => d.thongbao_id);

    return list.map((item) => ({ ...item, da_doc: docIds.includes(item.id) }));
  }

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

  async markAllNotificationsRead(lecturerId: number) {
    const gv = await this.gvRepo.findOne({ where: { id: lecturerId } });
    if (!gv) throw new NotFoundException('Không tìm thấy giảng viên');
    const list = await this.getNotifications(lecturerId);
    const unread = list.filter((n) => !n.da_doc);
    for (const n of unread) {
      await this.markNotificationRead(gv.taikhoan_id, n.id);
    }
    return { success: true, count: unread.length };
  }

  // Dashboard Stats
  async getDashboardStats(lecturerId: number) {
    const gv = await this.gvRepo.findOne({ where: { id: lecturerId } });
    if (!gv) throw new NotFoundException('Không tìm thấy giảng viên');

    const now = new Date();

    const doanDangDan = await this.danDoanRepo
      .createQueryBuilder('danDoan')
      .leftJoin('danDoan.chuyenThamQuan', 'chuyen')
      .where('danDoan.giang_vien_id = :lecturerId', { lecturerId })
      .andWhere('chuyen.ngay_tham_quan >= :now', { now })
      .getCount();

    const buoiBaoCao = await this.hoiDongThanhVienRepo
      .createQueryBuilder('thanhVien')
      .leftJoin('thanhVien.hoiDong', 'hoiDong')
      .where('thanhVien.giang_vien_id = :lecturerId', { lecturerId })
      .andWhere('hoiDong.ngay_bao_cao >= :now', { now })
      .getCount();

    const guidedSvIds = (
      await this.phanCongRepo.find({
        where: { giang_vien_id: lecturerId, trang_thai: 'DangHoatDong' },
        relations: { lichKienTapSinhVien: true },
      })
    ).map((a) => a.lichKienTapSinhVien.sinh_vien_id);

    let baiCanCham = 0;
    if (guidedSvIds.length > 0) {
      baiCanCham = await this.baiThuRepo
        .createQueryBuilder('baiThu')
        .leftJoin('baiThu.phieuThamQuan', 'phieuTQ')
        .leftJoin('phieuTQ.phieuDangKy', 'phieu')
        .leftJoin('DiemPhieuThamQuan', 'diem', 'diem.phieu_tham_quan_id = phieuTQ.id')
        .where('phieu.sinh_vien_id IN (:...guidedSvIds)', { guidedSvIds })
        .andWhere('diem.diem_thu_hoach_final IS NULL')
        .getCount();
    }

    const tongSvHuongDan = await this.phanCongRepo.count({
      where: { giang_vien_id: lecturerId, trang_thai: 'DangHoatDong' },
    });

    return { doanDangDan, buoiBaoCao, baiCanCham, tongSvHuongDan };
  }
}
