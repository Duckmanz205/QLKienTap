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
  DotKienTap_SinhVien,
  PhanCongGVHD,
  ChuyenThamQuan,
  PhanCongGiangVienDanDoan,
  PhieuDangKy,
  DiemDanh,
  PhieuThamQuan,
  DiemPhieuThamQuan,
  BaiThuHoach,
  HoiDong_ThanhVien,
  DiemHoiDong_ChiTiet,
  HoiDongChamBaoCao,
  DanhSachDen,
  ThongBao,
} from '../entities/qlkt.entity';

import { R2StorageService } from '../upload/r2-storage.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GiangVienService {
  constructor(
    @InjectRepository(GiangVien) private gvRepo: Repository<GiangVien>,
    @InjectRepository(PhanCongGVHD)
    private phanCongRepo: Repository<PhanCongGVHD>,
    @InjectRepository(PhanCongGiangVienDanDoan)
    private danDoanRepo: Repository<PhanCongGiangVienDanDoan>,
    @InjectRepository(ChuyenThamQuan)
    private chuyenRepo: Repository<ChuyenThamQuan>,
    @InjectRepository(PhieuDangKy) private phieuRepo: Repository<PhieuDangKy>,
    @InjectRepository(DiemDanh) private diemDanhRepo: Repository<DiemDanh>,
    @InjectRepository(DiemPhieuThamQuan)
    private diemPhieuRepo: Repository<DiemPhieuThamQuan>,
    @InjectRepository(PhieuThamQuan)
    private phieuTQRepo: Repository<PhieuThamQuan>,
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
    private dataSource: DataSource,
    private r2Storage: R2StorageService,
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
        dotKienTapSinhVien: {
          sinhVien: true,
          dotKienTap: true,
        },
      },
    });
    return assignments.map((a) => a.dotKienTapSinhVien);
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

    return await Promise.all(
      mappings.map(async (m) => {
        const count = await this.phieuRepo.count({
          where: {
            chuyen_tham_quan_id: m.chuyen_tham_quan_id,
            trang_thai: In(['ChoDuyet', 'HopLe', 'DaThamGia', 'HoanThanh']),
          },
        });

        return {
          ...m.chuyenThamQuan,
          la_truong_doan: m.la_truong_doan,
          so_luong_dang_ky_hien_tai: count,
          so_luong_sinh_vien_toi_da: m.chuyenThamQuan?.suc_chua || 0,
        };
      }),
    );
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
        trang_thai: In(['HopLe', 'ChoDuyet', 'DaThamGia', 'VangMat']),
      },
      relations: { sinhVien: true },
    });

    if (phieus.length === 0) return [];

    const phieuIds = phieus.map((p) => p.id);

    const phieuTQs = await this.phieuTQRepo.find({
      where: { phieu_dang_ky_id: In(phieuIds) },
    });
    const phieuTQIds = phieuTQs.map((ptq) => ptq.id);
    const phieuTQMap = new Map(
      phieuTQs.map((ptq) => [ptq.phieu_dang_ky_id, ptq]),
    );

    const diemDanhs = await this.diemDanhRepo.find({
      where: { phieu_tham_quan_id: In(phieuTQIds) },
    });

    const diems = await this.diemPhieuRepo.find({
      where: { phieu_tham_quan_id: In(phieuTQIds) },
    });

    const baiThuHoachs = await this.baiThuRepo.find({
      where: { phieu_tham_quan_id: In(phieuTQIds) },
    });
    const baiThuMap = new Map(
      baiThuHoachs.map((b) => [b.phieu_tham_quan_id, b]),
    );

    return phieus.map((p) => {
      const ptq = phieuTQMap.get(p.id);
      const dd = ptq
        ? diemDanhs.find((d) => d.phieu_tham_quan_id === ptq.id)
        : null;
      const score = ptq
        ? diems.find((d) => d.phieu_tham_quan_id === ptq.id)
        : null;
      const bth = ptq ? baiThuMap.get(ptq.id) : null;

      return {
        ...p,
        cach_to_chuc: trip.cach_to_chuc,
        file_xac_nhan_tham_quan: bth?.file_xac_nhan_tham_quan || null,
        file_bao_cao: bth?.file_bao_cao || null,
        ngay_nop_bao_cao: bth?.ngay_nop || null,
        trang_thai_bao_cao: bth?.trang_thai || null,
        diemDanh: dd
          ? { id: dd.id, trang_thai: dd.trang_thai, ghi_chu: dd.ghi_chu }
          : null,
        diemPhieuThamQuan: score
          ? {
              id: score.id,
              diem_chuan_bi: score.diem_chuan_bi,
              diem_cong: score.diem_cong_final,
              da_khoa: score.da_khoa,
              da_khoa_chuan_bi: score.da_khoa_chuan_bi,
              ngay_khoa_chuan_bi: score.ngay_khoa_chuan_bi,
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
      const isLead = await manager.findOne(PhanCongGiangVienDanDoan, {
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
      const phieuTQIds = phieuTQs.map((ptq) => ptq.id);
      const ptqMapByPhieuId = new Map(
        phieuTQs.map((ptq) => [ptq.phieu_dang_ky_id, ptq]),
      );

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

        let ptq = ptqMapByPhieuId.get(record.phieuId);
        if (!ptq) {
          // Tự động cấp phiếu tham quan nếu database bị thiếu do lỗi data/seed
          ptq = new PhieuThamQuan();
          ptq.phieu_dang_ky_id = record.phieuId;
          ptq.trang_thai = 'HopLe';
          await manager.save(PhieuThamQuan, ptq);
          ptqMapByPhieuId.set(record.phieuId, ptq);
        }

        let dd: DiemDanh | undefined = diemDanhMap.get(ptq.id);
        if (!dd) {
          dd = new DiemDanh();
          dd.phieu_tham_quan_id = ptq.id;
        }
        dd.trang_thai = record.status; // 'CoMat' | 'Vang' | 'TuChoiThamGia'
        dd.ghi_chu = (record.note || null) as any;
        dd.nguoi_diem_danh_id = lecturerId;
        dd.ngay_diem_danh = new Date();
        await manager.save(DiemDanh, dd);

        if (record.status === 'CoMat') {
          phieu.trang_thai = 'DaThamGia';
        } else if (record.status === 'Vang' || record.status === 'TuChoiThamGia') {
          phieu.trang_thai = 'VangMat';

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

    const phieuTQ = await this.phieuTQRepo.findOne({
      where: { phieu_dang_ky_id: phieuId },
    });
    if (!phieuTQ) {
      throw new NotFoundException('Không tìm thấy phiếu tham quan');
    }

    let diem = await this.diemPhieuRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });
    if (diem && (diem.da_khoa || diem.da_khoa_chuan_bi)) {
      throw new BadRequestException(
        'Điểm chuẩn bị của chuyến đi này đã được nộp/khóa, không thể chỉnh sửa',
      );
    }
    if (!diem) {
      diem = new DiemPhieuThamQuan();
      diem.phieu_tham_quan_id = phieuTQ.id;
    }

    diem.diem_chuan_bi = diemChuanBi;
    diem.diem_cong_final = Math.min(1.0, Math.max(0.0, diemCong));
    diem.giang_vien_dan_doan_id = lecturerId;
    diem.ngay_cham_chuan_bi = new Date();
    await this.diemPhieuRepo.save(diem);

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
    const guidedSvIds = (
      await this.phanCongRepo.find({
        where: { giang_vien_id: lecturerId, trang_thai: 'DangHoatDong' },
        relations: { dotKienTapSinhVien: true },
      })
    ).map((a) => a.dotKienTapSinhVien.sinh_vien_id);

    const ledTripIds = (
      await this.danDoanRepo.find({
        where: { giang_vien_id: lecturerId },
      })
    ).map(a => a.chuyen_tham_quan_id);

    if (guidedSvIds.length === 0 && ledTripIds.length === 0)
      return { data: [], total: 0, page, limit, totalPages: 0 };

    const queryBuilder = this.baiThuRepo
      .createQueryBuilder('baiThu')
      .leftJoinAndSelect('baiThu.phieuThamQuan', 'phieuTQ')
      .leftJoinAndSelect('phieuTQ.phieuDangKy', 'phieu')
      .leftJoinAndSelect('phieu.sinhVien', 'sinhVien')
      .leftJoinAndSelect('phieu.chuyenThamQuan', 'chuyen')
      .leftJoinAndSelect('chuyen.nhaMay', 'nhaMay')
      .leftJoinAndSelect('chuyen.lichKienTap', 'lich')
      .leftJoinAndSelect('lich.dotKienTap', 'dot')
      .leftJoinAndSelect('phieuTQ.diemPhieuThamQuan', 'diemPhieu')
      .leftJoinAndMapOne(
        'phieuTQ.diemDanh',
        DiemDanh,
        'diemDanh',
        'diemDanh.phieu_tham_quan_id = phieuTQ.id',
      )
      .where('phieu.sinh_vien_id IN (:...guidedSvIds)', { guidedSvIds })
      .andWhere('CURRENT_TIMESTAMP > phieuTQ.han_nop_bao_cao');

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

    const mappedData = data.map((report) => ({
      ...report,
      diem_thu_hoach:
        report.phieuThamQuan?.diemPhieuThamQuan?.diem_thu_hoach ?? null,
      diem_ai_de_xuat:
        report.phieuThamQuan?.diemPhieuThamQuan?.diem_ai_de_xuat ?? null,
      nhan_xet_ai_de_xuat:
        report.phieuThamQuan?.diemPhieuThamQuan?.nhan_xet_ai_de_xuat ?? null,
      nhan_xet_cua_giang_vien:
        report.phieuThamQuan?.diemPhieuThamQuan?.nhan_xet_thu_hoach ?? null,
      da_khoa:
        report.phieuThamQuan?.diemPhieuThamQuan?.da_khoa ?? false,
      da_khoa_thu_hoach:
        report.phieuThamQuan?.diemPhieuThamQuan?.da_khoa_thu_hoach ?? false,
      ngay_khoa_thu_hoach:
        report.phieuThamQuan?.diemPhieuThamQuan?.ngay_khoa_thu_hoach ?? null,
    }));

    return {
      data: mappedData,
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
        dotKienTapSinhVien: {
          sinh_vien_id: studentId,
        },
      },
      relations: { dotKienTapSinhVien: true },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'Bạn không được phân công hướng dẫn sinh viên sở hữu bài thu hoạch này',
      );
    }

    const phieuTQ = await this.phieuTQRepo.findOne({
      where: { phieu_dang_ky_id: phieuId },
    });
    if (!phieuTQ) {
      throw new NotFoundException('Không tìm thấy phiếu tham quan');
    }

    let diem = await this.diemPhieuRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });
    if (diem && (diem.da_khoa || diem.da_khoa_thu_hoach)) {
      throw new BadRequestException(
        'Điểm bài thu hoạch này đã được nộp/khóa lên Khoa, không thể chỉnh sửa',
      );
    }
    if (!diem) {
      diem = new DiemPhieuThamQuan();
      diem.phieu_tham_quan_id = phieuTQ.id;
    }

    diem.diem_thu_hoach = score;
    diem.giang_vien_hd_id = lecturerId;
    diem.ngay_cham_thu_hoach = new Date();
    diem.nhan_xet_thu_hoach = comment;
    await this.diemPhieuRepo.save(diem);

    return { message: 'Chấm điểm bài thu hoạch thành công', diem };
  }

  // Luu diem de xuat cua AI
  async saveAIGrade(
    lecturerId: number,
    reportId: number,
    score: number,
    aiResponseJson: string, // Changed from comment to aiResponseJson
  ) {
    if (
      typeof score !== 'number' ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 10
    ) {
      throw new BadRequestException(
        'Điểm đề xuất không hợp lệ (phải từ 0 đến 10)',
      );
    }

    const report = await this.baiThuRepo.findOne({
      where: { id: reportId },
      relations: { phieuThamQuan: { phieuDangKy: true } },
    });
    if (!report) throw new NotFoundException('Không tìm thấy bài thu hoạch');

    const phieuId = report.phieuThamQuan.phieu_dang_ky_id;
    const studentId = report.phieuThamQuan.phieuDangKy.sinh_vien_id;

    const assignment = await this.phanCongRepo.findOne({
      where: {
        giang_vien_id: lecturerId,
        trang_thai: 'DangHoatDong',
        dotKienTapSinhVien: {
          sinh_vien_id: studentId,
        },
      },
      relations: { dotKienTapSinhVien: true },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'Bạn không được phân công hướng dẫn sinh viên sở hữu bài thu hoạch này',
      );
    }

    const phieuTQ = await this.phieuTQRepo.findOne({
      where: { phieu_dang_ky_id: phieuId },
    });
    if (!phieuTQ) {
      throw new NotFoundException('Không tìm thấy phiếu tham quan');
    }

    let diem = await this.diemPhieuRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });
    if (diem && (diem.da_khoa || diem.da_khoa_thu_hoach)) {
      throw new BadRequestException(
        'Điểm bài thu hoạch này đã được nộp/khóa lên Khoa, không thể chỉnh sửa',
      );
    }
    if (!diem) {
      diem = new DiemPhieuThamQuan();
      diem.phieu_tham_quan_id = phieuTQ.id;
    }

    diem.diem_ai_de_xuat = score;
    diem.nhan_xet_ai_de_xuat = aiResponseJson;
    await this.diemPhieuRepo.save(diem);

    return { message: 'Lưu điểm AI đề xuất thành công', diem };
  }

  // Chạy ngầm chấm điểm AI hàng loạt
  async processBulkAiGradingInBackground(lecturerId: number, reportIds: number[]) {
    for (const reportId of reportIds) {
      try {
        const report = await this.baiThuRepo.findOne({ where: { id: reportId } });
        if (!report || !report.file_bao_cao) continue;

        let txtKeyOrPath = report.file_bao_cao.replace(/\.\w+$/, '.txt');
        let textToAnalyze = '';

        if (this.r2Storage.isReady() && report.file_bao_cao.startsWith('reports/')) {
          try {
            const { stream } = await this.r2Storage.getFileStream(this.r2Storage.BUCKET_REPORTS, txtKeyOrPath);
            for await (const chunk of stream) {
              textToAnalyze += chunk;
            }
          } catch (r2Error) {
            console.error(`Lỗi đọc file TXT từ R2 cho report ${reportId}:`, r2Error);
          }
        } else {
          // Fallback local
          const localPath = path.join(process.cwd(), 'uploads', txtKeyOrPath);
          if (fs.existsSync(localPath)) {
            textToAnalyze = fs.readFileSync(localPath, 'utf8');
          }
        }

        if (!textToAnalyze || textToAnalyze.length < 50) continue;

        // Gọi AI Service
        const aiRes = await fetch('http://127.0.0.1:8000/grade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer satori_2026_secure_key' // Giả sử key bảo mật nội bộ
          },
          body: JSON.stringify({ document_text: textToAnalyze })
        });

        if (!aiRes.ok) {
          console.error(`AI Service trả về lỗi cho report ${reportId}`);
          continue;
        }

        const aiData = await aiRes.json();

        // Lưu nguyên cục JSON vào DB
        const aiResponseJson = JSON.stringify(aiData);

        await this.saveAIGrade(lecturerId, reportId, aiData.diem_bao_cao_cuoi_cung, aiResponseJson);
        console.log(`Đã chấm ngầm AI xong cho report ${reportId}`);
      } catch (err) {
        console.error(`Lỗi quá trình chấm AI ngầm cho report ${reportId}:`, err);
      }
    }
  }

  // Lay danh sach buoi bao cao hoi dong của giang vien
  async getBoardSessions(lecturerId: number) {
    const mappings = await this.hoiDongThanhVienRepo.find({
      where: { giang_vien_id: lecturerId },
      relations: {
        hoiDong: {
          dotKienTap: true,
        },
      },
    });

    const results: any[] = [];
    for (const map of mappings) {
      // Fetch all committee members for this board
      const committeeMembers = await this.hoiDongThanhVienRepo.find({
        where: { hoi_dong_id: map.hoi_dong_id },
        relations: { giangVien: true },
      });

      // Lay danh sach cac phieu tham quan thuoc bo chuyen bao cao duoc gan cho hoi dong nay
      const phieuTQs = await this.phieuTQRepo
        .createQueryBuilder('ptq')
        .innerJoin('ptq.boChuyenBaoCao', 'bo')
        .where('bo.hoi_dong_id = :boardId', { boardId: map.hoi_dong_id })
        .leftJoinAndSelect('ptq.phieuDangKy', 'pdk')
        .leftJoinAndSelect('pdk.chuyenThamQuan', 'ctq')
        .leftJoinAndSelect('ctq.nhaMay', 'nm')
        .leftJoinAndSelect('pdk.sinhVien', 'sv')
        .leftJoinAndSelect('ptq.diemPhieuThamQuan', 'dptq')
        .leftJoinAndSelect('ptq.baiThuHoach', 'bth')
        .getMany();

      // Giữ nguyên cấu trúc mảng phieus cho logic bên dưới (loại bỏ tham chiếu vòng lặp)
      const phieus = phieuTQs
        .map((ptq) => {
          if (!ptq.phieuDangKy) return null;
          const { phieuDangKy, ...cleanPtq } = ptq;
          if (cleanPtq.diemPhieuThamQuan) {
            delete cleanPtq.diemPhieuThamQuan.phieuThamQuan;
          }
          if (cleanPtq.baiThuHoach) {
            delete cleanPtq.baiThuHoach.phieuThamQuan;
          }
          return {
            ...phieuDangKy,
            phieuThamQuan: cleanPtq,
            boChuyenBaoCaoId: ptq.bo_chuyen_bao_cao_id,
          };
        })
        .filter((p): p is NonNullable<typeof p> => Boolean(p));

      const phieuTQIds = phieus
        .map((p) => p.phieuThamQuan?.id)
        .filter((id) => id);
      let allScores: any[] = [];
      if (phieuTQIds.length > 0) {
        allScores = await this.diemHoiDongRepo
          .createQueryBuilder('diem')
          .where('diem.phieu_tham_quan_id IN (:...ids)', { ids: phieuTQIds })
          .getMany();
      }

      // Map registrations with committee scores
      const registrationsWithScores = phieus.map((phieu) => {
        const pTqId = phieu.phieuThamQuan?.id;
        const committee = committeeMembers.map((cm) => {
          const scoreRecord = allScores.find(
            (s) =>
              s.phieu_tham_quan_id === pTqId &&
              s.hoi_dong_thanhvien_id === cm.id,
          );
          return {
            id: cm.id,
            name: cm.giangVien?.ho_ten || 'Giảng viên',
            ma_gv: cm.giangVien?.ma_gv || '',
            vai_tro: cm.vai_tro,
            score: scoreRecord ? scoreRecord.diem : null,
            status: scoreRecord ? 'Đã chấm' : 'Chưa chấm',
          };
        });

        return {
          ...phieu,
          committee, // Attach committee array to each registration
        };
      });

      // Group registrations by student for neat UI display
      const studentMap = new Map<number, any>();
      for (const reg of registrationsWithScores) {
        const sv = reg.sinhVien;
        if (!sv) continue;
        if (!studentMap.has(sv.id)) {
          studentMap.set(sv.id, {
            sinhVien: sv,
            boChuyenId: reg.boChuyenBaoCaoId,
            reports: [],
          });
        }
        studentMap.get(sv.id).reports.push(reg);
      }

      const students = Array.from(studentMap.values()).map((st) => {
        const trips = st.reports.map((reg: any) => {
          const myScoreRecord = reg.committee?.find((c: any) => c.id === map.id);
          const ptq = reg.phieuThamQuan;
          const ctq = reg.chuyenThamQuan;
          return {
            phieuThamQuanId: ptq?.id,
            phieuDangKyId: reg.id,
            boChuyenId: reg.boChuyenBaoCaoId,
            tenNhaMay: ctq?.nhaMay?.ten_nha_may || 'Chuyến tham quan',
            diaChiNhaMay: ctq?.nhaMay?.dia_chi || '',
            hinhThuc: ctq?.hinh_thuc || 'TrucTiep',
            ngayThamQuan: ctq?.ngay_tham_quan || null,
            gioBatDau: ctq?.gio_bat_dau || null,
            baiThuHoach: ptq?.baiThuHoach || null,
            daKhoa: ptq?.diemPhieuThamQuan?.da_khoa || false,
            diemHoiDongFinal: ptq?.diemPhieuThamQuan?.diem_hoi_dong_final ?? null,
            myScore: myScoreRecord?.score != null ? Number(myScoreRecord.score) : null,
            status: myScoreRecord?.score != null ? 'Đã chấm' : 'Chưa chấm',
            committee: reg.committee,
          };
        });

        const scoredTrips = trips.filter((t: any) => t.myScore != null);
        const totalTrips = trips.length;
        const isFullyScored = totalTrips > 0 && scoredTrips.length === totalTrips;
        const overallMyAvg = scoredTrips.length > 0
          ? Number((scoredTrips.reduce((acc: number, curr: any) => acc + curr.myScore, 0) / scoredTrips.length).toFixed(2))
          : null;

        return {
          ...st,
          trips,
          totalTrips,
          scoredCount: scoredTrips.length,
          isFullyScored,
          overallMyAvg,
          myScore: overallMyAvg, // For backward compatibility
          committee: trips[0]?.committee || [],
        };
      });

      results.push({
        session: map.hoiDong,
        vai_tro: map.vai_tro,
        memberId: map.id,
        committeeMembers: committeeMembers,
        scores: allScores,
        registrations: registrationsWithScores,
        students,
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

    // Ưu tiên tìm chính xác theo id của PhieuThamQuan (ID do giao diện chấm điểm gửi lên)
    let phieuTQ = await this.phieuTQRepo.findOne({
      where: { id: phieuId },
      relations: { boChuyenBaoCao: true },
    });

    // Fallback: Nếu không tìm thấy hoặc phiếu không thuộc hội đồng, kiểm tra xem phieuId có phải là phieu_dang_ky_id không
    if (!phieuTQ || phieuTQ.boChuyenBaoCao?.hoi_dong_id !== member.hoi_dong_id) {
      const altPhieuTQ = await this.phieuTQRepo.findOne({
        where: { phieu_dang_ky_id: phieuId },
        relations: { boChuyenBaoCao: true },
      });
      if (altPhieuTQ && altPhieuTQ.boChuyenBaoCao?.hoi_dong_id === member.hoi_dong_id) {
        phieuTQ = altPhieuTQ;
      }
    }

    if (!phieuTQ) {
      throw new NotFoundException('Không tìm thấy phiếu tham quan');
    }

    if (
      !phieuTQ.bo_chuyen_bao_cao_id ||
      phieuTQ.boChuyenBaoCao?.hoi_dong_id !== member.hoi_dong_id
    ) {
      throw new ForbiddenException(
        'Phiếu tham quan không thuộc sinh viên được phân công cho hội đồng này',
      );
    }

    const diemPhieuCheck = await this.diemPhieuRepo.findOne({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });
    if (diemPhieuCheck && (diemPhieuCheck.da_khoa || diemPhieuCheck.da_khoa_hoi_dong)) {
      throw new BadRequestException(
        'Điểm hội đồng của phiếu tham quan này đã được khóa, không thể chỉnh sửa',
      );
    }

    // Lưu điểm hội đồng chi tiết cho riêng chuyến tham quan / nhà máy này
    let item = await this.diemHoiDongRepo.findOne({
      where: {
        phieu_tham_quan_id: phieuTQ.id,
        hoi_dong_thanhvien_id: memberId,
      },
    });

    if (!item) {
      item = new DiemHoiDong_ChiTiet();
      item.phieu_tham_quan_id = phieuTQ.id;
      item.hoi_dong_thanhvien_id = memberId;
    }

    item.diem = score;
    item.ngay_cham = new Date();
    await this.diemHoiDongRepo.save(item);

    // Tính điểm trung bình của tất cả thành viên trong hội đồng cho riêng chuyến tham quan này
    const allScores = await this.diemHoiDongRepo.find({
      where: { phieu_tham_quan_id: phieuTQ.id },
    });

    if (allScores.length > 0) {
      const sum = allScores.reduce((acc, curr) => acc + Number(curr.diem), 0);
      const avg = sum / allScores.length;

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

    return { message: 'Ghi nhận điểm hội đồng thành công', score: item };
  }

  // Nhap diem hoi dong chi tiet hang loat (ap dung cho nhieu chuyen / ca 3 chuyen)
  async submitBoardScoresBatch(
    lecturerId: number,
    memberId: number,
    phieuIds: number[],
    score: number,
  ) {
    if (!Array.isArray(phieuIds) || phieuIds.length === 0) {
      throw new BadRequestException('Danh sách phiếu tham quan không hợp lệ');
    }

    const results: any[] = [];
    for (const phieuId of phieuIds) {
      const res = await this.submitBoardScore(lecturerId, memberId, phieuId, score);
      results.push(res);
    }

    return {
      message: `Đã chấm điểm hội đồng thành công cho ${phieuIds.length} chuyến tham quan`,
      count: phieuIds.length,
      results,
    };
  }

  // (v13) Newsfeed — không còn ThongBaoDaDoc
  async getNotifications(_lecturerId: number) {
    const list = await this.thongBaoRepo.find({
      where: {
        doi_tuong_nhan: In(['ALL', 'LECTURER']),
      },
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
        relations: { dotKienTapSinhVien: true },
      })
    ).map((a) => a.dotKienTapSinhVien.sinh_vien_id);

    let baiCanCham = 0;
    if (guidedSvIds.length > 0) {
      baiCanCham = await this.baiThuRepo
        .createQueryBuilder('baiThu')
        .leftJoin('baiThu.phieuThamQuan', 'phieuTQ')
        .leftJoin('phieuTQ.phieuDangKy', 'phieu')
        .leftJoin(
          'DiemPhieuThamQuan',
          'diem',
          'diem.phieu_tham_quan_id = phieuTQ.id',
        )
        .where('phieu.sinh_vien_id IN (:...guidedSvIds)', { guidedSvIds })
        .andWhere('diem.diem_thu_hoach IS NULL')
        .getCount();
    }

    const tongSvHuongDan = await this.phanCongRepo.count({
      where: { giang_vien_id: lecturerId, trang_thai: 'DangHoatDong' },
    });

    return { doanDangDan, buoiBaoCao, baiCanCham, tongSvHuongDan };
  }

  // Khoa va Nop diem chuan bi & diem cong cho chuyen di (GVDD)
  async lockTripPrepGrades(lecturerId: number, tripId: number) {
    const isLead = await this.danDoanRepo.findOne({
      where: { chuyen_tham_quan_id: tripId, giang_vien_id: lecturerId },
      relations: { chuyenThamQuan: { nhaMay: true } },
    });
    if (!isLead) {
      throw new ForbiddenException(
        'Bạn không phải giảng viên dẫn đoàn của chuyến tham quan này',
      );
    }

    const phieus = await this.phieuRepo.find({
      where: {
        chuyen_tham_quan_id: tripId,
        trang_thai: In(['HopLe', 'ChoDuyet', 'DaThamGia', 'HoanThanh']),
      },
    });

    if (phieus.length === 0) {
      throw new BadRequestException('Chuyến đi chưa có sinh viên đăng ký hợp lệ');
    }

    const phieuIds = phieus.map((p) => p.id);
    const phieuTQs = await this.phieuTQRepo.find({
      where: { phieu_dang_ky_id: In(phieuIds) },
    });

    if (phieuTQs.length === 0) {
      throw new BadRequestException('Chưa có phiếu tham quan nào được tạo');
    }

    const ptqIds = phieuTQs.map((ptq) => ptq.id);
    const diems = await this.diemPhieuRepo.find({
      where: { phieu_tham_quan_id: In(ptqIds) },
    });

    const diemMap = new Map(diems.map((d) => [d.phieu_tham_quan_id, d]));
    const now = new Date();
    const toSave: DiemPhieuThamQuan[] = [];

    let missingCount = 0;
    for (const ptq of phieuTQs) {
      let d = diemMap.get(ptq.id);
      if (!d) {
        d = new DiemPhieuThamQuan();
        d.phieu_tham_quan_id = ptq.id;
        d.diem_chuan_bi = 0;
        d.diem_cong_final = 0;
        d.giang_vien_dan_doan_id = lecturerId;
      }
      if (d.diem_chuan_bi === null || d.diem_chuan_bi === undefined) {
        missingCount++;
      }
      d.da_khoa_chuan_bi = true;
      d.ngay_khoa_chuan_bi = now;
      toSave.push(d);
    }

    if (missingCount > 0) {
      throw new BadRequestException(
        `Còn ${missingCount} sinh viên chưa có điểm chuẩn bị. Vui lòng nhập điểm trước khi nộp lên Khoa.`,
      );
    }

    await this.diemPhieuRepo.save(toSave);

    return {
      message: `Đã khóa và nộp điểm chuẩn bị thành công cho chuyến tham quan (${toSave.length} sinh viên).`,
      ngay_khoa: now,
    };
  }

  // Khoa va Nop bang diem thu hoach (GVHD)
  async lockGuidedReportsGrades(lecturerId: number, dotKienTapId?: number) {
    const assignments = await this.phanCongRepo.find({
      where: { giang_vien_id: lecturerId, trang_thai: 'DangHoatDong' },
      relations: { dotKienTapSinhVien: true },
    });

    let filteredAssignments = assignments;
    if (dotKienTapId) {
      filteredAssignments = assignments.filter(
        (a) => a.dotKienTapSinhVien?.dot_kien_tap_id === dotKienTapId,
      );
    }

    const guidedSvIds = filteredAssignments.map(
      (a) => a.dotKienTapSinhVien.sinh_vien_id,
    );

    if (guidedSvIds.length === 0) {
      throw new BadRequestException(
        'Bạn không có sinh viên hướng dẫn nào trong đợt này',
      );
    }

    const reports = await this.baiThuRepo
      .createQueryBuilder('baiThu')
      .leftJoinAndSelect('baiThu.phieuThamQuan', 'phieuTQ')
      .leftJoinAndSelect('phieuTQ.phieuDangKy', 'phieu')
      .leftJoinAndSelect('phieuTQ.diemPhieuThamQuan', 'diem')
      .where('phieu.sinh_vien_id IN (:...guidedSvIds)', { guidedSvIds })
      .getMany();

    if (reports.length === 0) {
      throw new BadRequestException(
        'Chưa có bài thu hoạch nào được nộp bởi các sinh viên bạn hướng dẫn',
      );
    }

    const unGraded = reports.filter(
      (r) =>
        !r.phieuThamQuan?.diemPhieuThamQuan ||
        r.phieuThamQuan.diemPhieuThamQuan.diem_thu_hoach === null ||
        r.phieuThamQuan.diemPhieuThamQuan.diem_thu_hoach === undefined,
    );

    if (unGraded.length > 0) {
      throw new BadRequestException(
        `Còn ${unGraded.length} bài thu hoạch chưa được chấm điểm. Vui lòng chấm hết trước khi nộp lên Khoa.`,
      );
    }

    const now = new Date();
    const toSave: DiemPhieuThamQuan[] = [];

    for (const r of reports) {
      let d = r.phieuThamQuan?.diemPhieuThamQuan;
      if (!d) {
        d = new DiemPhieuThamQuan();
        d.phieu_tham_quan_id = r.phieu_tham_quan_id;
        d.giang_vien_hd_id = lecturerId;
      }
      d.da_khoa_thu_hoach = true;
      d.ngay_khoa_thu_hoach = now;
      toSave.push(d);
    }

    await this.diemPhieuRepo.save(toSave);

    return {
      message: `Đã khóa và nộp bảng điểm thu hoạch thành công (${toSave.length} bài thu hoạch).`,
      ngay_khoa: now,
    };
  }
}

