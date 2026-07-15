import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  GiangVien,
  LichKienTap_SinhVien,
  PhanCongGVHD,
  ChuyenThamQuan,
  ChuyenThamQuan_GiangVienDanDoan,
  PhieuDangKy,
  DiemDanh,
  DiemPhieuDangKy,
  NhatKyDiemCong,
  BaiThuHoach,
  HoiDong_ThanhVien,
  DiemHoiDong_ChiTiet,
  HoiDongChamBaoCao,
} from '../entities/qlkt.entity';

@Injectable()
export class GiangVienService {
  constructor(
    @InjectRepository(GiangVien) private gvRepo: Repository<GiangVien>,
    @InjectRepository(PhanCongGVHD) private phanCongRepo: Repository<PhanCongGVHD>,
    @InjectRepository(ChuyenThamQuan_GiangVienDanDoan) private danDoanRepo: Repository<ChuyenThamQuan_GiangVienDanDoan>,
    @InjectRepository(ChuyenThamQuan) private chuyenRepo: Repository<ChuyenThamQuan>,
    @InjectRepository(PhieuDangKy) private phieuRepo: Repository<PhieuDangKy>,
    @InjectRepository(DiemDanh) private diemDanhRepo: Repository<DiemDanh>,
    @InjectRepository(DiemPhieuDangKy) private diemPhieuRepo: Repository<DiemPhieuDangKy>,
    @InjectRepository(NhatKyDiemCong) private diemCongRepo: Repository<NhatKyDiemCong>,
    @InjectRepository(BaiThuHoach) private baiThuRepo: Repository<BaiThuHoach>,
    @InjectRepository(HoiDong_ThanhVien) private hoiDongThanhVienRepo: Repository<HoiDong_ThanhVien>,
    @InjectRepository(DiemHoiDong_ChiTiet) private diemHoiDongRepo: Repository<DiemHoiDong_ChiTiet>,
    @InjectRepository(HoiDongChamBaoCao) private hoiDongRepo: Repository<HoiDongChamBaoCao>,
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
    return assignments.map(a => a.lichKienTapSinhVien);
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
    return mappings.map(m => ({
      ...m.chuyenThamQuan,
      la_truong_doan: m.la_truong_doan,
    }));
  }

  // Lay danh sach SV trong chuyen tham quan de diem danh/nhap diem
  async getTripRegistrations(tripId: number) {
    const phieus = await this.phieuRepo.find({
      where: {
        chuyen_tham_quan_id: tripId,
        trang_thai: In(['HopLe', 'ChoDuyet', 'DaThamGia', 'VangMat']),
      },
      relations: { sinhVien: true },
    });

    if (phieus.length === 0) return [];

    const phieuIds = phieus.map((p) => p.id);

    const diemDanhs = await this.diemDanhRepo.find({
      where: { phieu_dang_ky_id: In(phieuIds) },
    });

    const diems = await this.diemPhieuRepo.find({
      where: { phieu_dang_ky_id: In(phieuIds) },
    });

    return phieus.map((p) => {
      const dd = diemDanhs.find((d) => d.phieu_dang_ky_id === p.id);
      const score = diems.find((d) => d.phieu_dang_ky_id === p.id);
      return {
        ...p,
        diemDanh: dd ? { id: dd.id, trang_thai: dd.trang_thai, ghi_chu: dd.ghi_chu } : null,
        diemPhieuDangKy: score ? { id: score.id, diem_chuan_bi: score.diem_chuan_bi, diem_cong: score.diem_cong } : null,
      };
    });
  }

  // Diem danh sinh vien
  async takeAttendance(
    lecturerId: number,
    tripId: number,
    records: { phieuId: number; status: string; note?: string }[],
  ) {
    const trip = await this.chuyenRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Không tìm thấy chuyến tham quan');

    for (const record of records) {
      const phieu = await this.phieuRepo.findOne({ where: { id: record.phieuId } });
      if (!phieu) continue;

      let dd = await this.diemDanhRepo.findOne({ where: { phieu_dang_ky_id: record.phieuId } });
      if (!dd) {
        dd = new DiemDanh();
        dd.phieu_dang_ky_id = record.phieuId;
      }
      dd.trang_thai = record.status; // 'CoMat' | 'Vang' | 'TuChoiThamGia'
      dd.ghi_chu = (record.note || null) as any;
      dd.nguoi_diem_danh_id = lecturerId;
      dd.ngay_diem_danh = new Date();
      await this.diemDanhRepo.save(dd);

      // Dong bo lai trang thai cua phieu dang ky
      if (record.status === 'CoMat') {
        phieu.trang_thai = 'DaThamGia';
      } else if (record.status === 'Vang' || record.status === 'TuChoiThamGia') {
        phieu.trang_thai = 'VangMat';
      }
      await this.phieuRepo.save(phieu);
    }

    // Cap nhat chuyen di sang DaDienRa
    trip.trang_thai = 'DaDienRa';
    await this.chuyenRepo.save(trip);

    return { message: 'Ghi nhận điểm danh thành công' };
  }

  // Nhap diem chuan bi va diem cong
  async gradePrepAndBonus(
    lecturerId: number,
    phieuId: number,
    diemChuanBi: number,
    diemCong: number,
  ) {
    let diem = await this.diemPhieuRepo.findOne({ where: { phieu_dang_ky_id: phieuId } });
    if (!diem) {
      diem = new DiemPhieuDangKy();
      diem.phieu_dang_ky_id = phieuId;
    }

    diem.diem_chuan_bi = diemChuanBi;
    diem.ngay_lam_bai_chuan_bi = new Date();
    diem.diem_cong = Math.min(1.0, Math.max(0.0, diemCong)); // Gioi han 0.0 den 1.0
    await this.diemPhieuRepo.save(diem);

    // Ghi nhan lich su nhat ky diem cong neu co diem cong
    if (diemCong > 0) {
      const nhatKy = new NhatKyDiemCong();
      nhatKy.phieu_dang_ky_id = phieuId;
      nhatKy.diem = diemCong;
      nhatKy.giang_vien_ghi_nhan_id = lecturerId;
      nhatKy.ngay_ghi_nhan = new Date();
      await this.diemCongRepo.save(nhatKy);
    }

    return { message: 'Cập nhật điểm chuẩn bị và điểm cộng thành công', diem };
  }

  // Lay danh sach bai thu hoach can cham
  async getGuidedStudentReports(lecturerId: number) {
    // Tim tat ca sinh vien duoc huong dan
    const guidedSvIds = (await this.phanCongRepo.find({
      where: { giang_vien_id: lecturerId, trang_thai: 'DangHoatDong' },
      relations: { lichKienTapSinhVien: true },
    })).map(a => a.lichKienTapSinhVien.sinh_vien_id);

    if (guidedSvIds.length === 0) return [];

    // Lay tat ca phieu dang ky cua cac sinh vien nay
    const phieus = await this.phieuRepo.find({
      where: { sinh_vien_id: In(guidedSvIds) },
    });
    const phieuIds = phieus.map(p => p.id);
    if (phieuIds.length === 0) return [];

    // Lay tat ca bai thu hoach
    return this.baiThuRepo.find({
      where: { phieu_dang_ky_id: In(phieuIds) },
      relations: {
        phieuDangKy: {
          sinhVien: true,
          chuyenThamQuan: {
            nhaMay: true,
          },
        },
      },
      order: { ngay_nop: 'DESC' },
    });
  }

  // Cham diem bai thu hoach
  async gradeReport(lecturerId: number, reportId: number, score: number, comment: string) {
    const report = await this.baiThuRepo.findOne({
      where: { id: reportId },
      relations: { phieuDangKy: true },
    });
    if (!report) throw new NotFoundException('Không tìm thấy bài thu hoạch');

    const phieuId = report.phieu_dang_ky_id;
    let diem = await this.diemPhieuRepo.findOne({ where: { phieu_dang_ky_id: phieuId } });
    if (!diem) {
      diem = new DiemPhieuDangKy();
      diem.phieu_dang_ky_id = phieuId;
    }

    diem.diem_bai_thu_hoach = score;
    diem.nhan_xet_bai_thu_hoach = comment;
    diem.giang_vien_cham_id = lecturerId;
    diem.ngay_cham_bai_thu_hoach = new Date();
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
          trang_thai: In(['DaThamGia', 'HoanThanh']),
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
  async submitBoardScore(lecturerId: number, memberId: number, phieuId: number, score: number) {
    const member = await this.hoiDongThanhVienRepo.findOne({ where: { id: memberId } });
    if (!member || member.giang_vien_id !== lecturerId) {
      throw new BadRequestException('Giảng viên không phải thành viên hội đồng này');
    }

    let item = await this.diemHoiDongRepo.findOne({
      where: { phieu_dang_ky_id: phieuId, hoi_dong_thanhvien_id: memberId },
    });

    if (!item) {
      item = new DiemHoiDong_ChiTiet();
      item.phieu_dang_ky_id = phieuId;
      item.hoi_dong_thanhvien_id = memberId;
    }

    item.diem = score;
    item.ngay_cham = new Date();
    await this.diemHoiDongRepo.save(item);

    // Tinh diem trung binh cua tat ca thanh vien trong hoi dong cho phieu nay
    const allScores = await this.diemHoiDongRepo.find({
      where: { phieu_dang_ky_id: phieuId },
    });

    if (allScores.length > 0) {
      const sum = allScores.reduce((acc, curr) => acc + Number(curr.diem), 0);
      const avg = sum / allScores.length;

      let diemPhieu = await this.diemPhieuRepo.findOne({ where: { phieu_dang_ky_id: phieuId } });
      if (!diemPhieu) {
        diemPhieu = new DiemPhieuDangKy();
        diemPhieu.phieu_dang_ky_id = phieuId;
      }
      diemPhieu.diem_bao_cao_tqnm = Number(avg.toFixed(2));
      await this.diemPhieuRepo.save(diemPhieu);
    }

    return { message: 'Ghi nhận điểm hội đồng thành công', score: item };
  }
}
