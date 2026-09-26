import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsIn,
  IsBoolean,
  Matches,
  Length,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateYearDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên năm học không được để trống' })
  @Length(1, 50)
  ten_nam_hoc: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ngay_bat_dau?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ngay_ket_thuc?: Date;
}

export class CreateTermDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên học kỳ không được để trống' })
  @Length(1, 50)
  ten_hoc_ky: string;

  @IsInt()
  @Min(1)
  nam_hoc_id: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ngay_bat_dau?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ngay_ket_thuc?: Date;
}

// (v11) Đổi tên trường: ma_khoa → ma_khoa_hoc, ten_khoa → ten_khoa_hoc
export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã khóa học không được để trống' })
  @Length(1, 50)
  ma_khoa_hoc: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên khóa học không được để trống' })
  @Length(1, 200)
  ten_khoa_hoc: string;

  @IsOptional()
  @IsInt()
  nam_nhap_hoc?: number;
}

// (v10) Thêm nguoi_lien_he, sdt_lien_he
export class CreateFactoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên nhà máy không được để trống' })
  ten_nha_may: string;

  @IsOptional()
  @IsString()
  dia_chi?: string;

  @IsOptional()
  @IsString()
  nhom_nganh?: string;

  @IsOptional()
  @IsString()
  nguoi_lien_he?: string;

  @IsOptional()
  @IsString()
  sdt_lien_he?: string;

  @IsOptional()
  @IsBoolean()
  ho_tro_truc_tiep?: boolean;

  @IsOptional()
  @IsBoolean()
  ho_tro_truc_tuyen?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['HoatDong', 'NgungHopTac'])
  trang_thai?: string;
}

export class UpdateFactoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ten_nha_may?: string;

  @IsOptional()
  @IsString()
  dia_chi?: string;

  @IsOptional()
  @IsString()
  nhom_nganh?: string;

  @IsOptional()
  @IsString()
  nguoi_lien_he?: string;

  @IsOptional()
  @IsString()
  sdt_lien_he?: string;

  @IsOptional()
  @IsBoolean()
  ho_tro_truc_tiep?: boolean;

  @IsOptional()
  @IsBoolean()
  ho_tro_truc_tuyen?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['HoatDong', 'NgungHopTac'])
  trang_thai?: string;
}

// (v6) khoa_id → khoa_hoc_id
export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên đợt kiến tập không được để trống' })
  ten_dot: string;

  @IsInt()
  @Min(1)
  hoc_ky_id: number;

  @IsInt()
  @Min(1)
  khoa_hoc_id: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ngay_bat_dau?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ngay_ket_thuc?: Date;

  @IsOptional()
  @IsArray()
  danh_sach_sinh_vien?: any[];
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  ten_dot?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  hoc_ky_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  khoa_hoc_id?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ngay_bat_dau?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ngay_ket_thuc?: Date;

  @IsOptional()
  @IsString()
  @IsIn(['Nhap', 'DangTrienKhai', 'DaKetThuc', 'DaKhoa', 'DaHuy'])
  trang_thai?: string;

  @IsOptional()
  @IsArray()
  danh_sach_sinh_vien?: any[];
}

// (v12) Bỏ tg_dien_ra_tu/den, han_chot_nop_bao_cao, han_chot_diem
// (v6) Thêm so_luong_du_kien
export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên lịch không được để trống' })
  ten_lich: string;

  @IsInt()
  @Min(1)
  dot_kien_tap_id: number;

  @IsInt()
  @Min(1)
  so_luong_du_kien: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  tg_mo_dang_ky_tu?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  tg_mo_dang_ky_den?: Date;

  @IsOptional()
  @IsString()
  @IsIn(['Nhap', 'MoDangKy', 'DangDienRa', 'DaKetThuc', 'DaKhoa'])
  trang_thai?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  chuyen_tham_quan_ids?: number[];

  @IsOptional()
  @IsBoolean()
  isSubmit?: boolean;
}

export class ImportStudentsDto {
  @IsInt()
  @Min(1)
  lichId: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'Danh sách ID sinh viên không được rỗng' })
  @IsInt({ each: true })
  @Min(1, { each: true })
  studentIds: number[];
}

// (v6) lich_kien_tap_id nay optional (nullable)
export class CreateTripDto {
  @IsInt({ message: 'Nhà máy không hợp lệ' })
  @Min(1, { message: 'Nhà máy không hợp lệ' })
  nha_may_id: number;

  @IsOptional()
  @IsInt({ message: 'Lịch kiến tập không hợp lệ' })
  @Min(1, { message: 'Lịch kiến tập không hợp lệ' })
  lich_kien_tap_id?: number;

  @Type(() => Date)
  @IsDate({ message: 'Ngày tham quan không hợp lệ' })
  ngay_tham_quan: Date;

  @IsString({ message: 'Giờ bắt đầu phải là chuỗi' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ bắt đầu phải theo định dạng HH:mm',
  })
  gio_bat_dau: string;


  @IsString({ message: 'Hình thức không hợp lệ' })
  @IsIn(['TrucTiep', 'TrucTuyen'], { message: 'Hình thức phải là TrucTiep hoặc TrucTuyen' })
  hinh_thuc: string;

  @IsOptional()
  @IsString({ message: 'Cách tổ chức không hợp lệ' })
  @IsIn(['DoKhoaToChuc', 'TuDo'], { message: 'Cách tổ chức phải là DoKhoaToChuc hoặc TuDo' })
  cach_to_chuc?: string;

  @IsInt({ message: 'Sức chứa phải là số' })
  @Min(1, { message: 'Sức chứa tối thiểu là 1' })
  suc_chua: number;

  @IsOptional()
  @IsInt({ message: 'Lệ phí phải là số nguyên' })
  @Min(0, { message: 'Lệ phí không được âm' })
  le_phi?: number;

  @IsOptional()
  @IsString({ message: 'Địa điểm tập trung phải là chuỗi' })
  dia_diem_tap_trung?: string;

  @IsOptional()
  @IsString({ message: 'Trạng thái không hợp lệ' })
  @IsIn(['Nhap', 'ChoDuyet', 'DaDuyet', 'MoDangKy', 'DaChotDanhSach', 'DaDienRa', 'DaHuy'], { message: 'Trạng thái phải thuộc danh sách hợp lệ' })
  trang_thai?: string;
}

export class ApproveTripDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  tripId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  approverId?: number;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  registrationId?: number;

  @IsOptional()
  @IsString()
  hanhDong?: string;
}

export class ApproveCancelDto {
  @IsInt()
  @Min(1)
  requestId: number;

  @IsInt()
  @Min(1)
  approverId: number;

  @IsBoolean()
  isApproved: boolean;
}

export class FilterAssignStudentsDto {
  @IsInt()
  @Min(1)
  tripId: number;
}

export class AssignGvhdDto {
  @IsInt()
  @Min(1)
  lichKienTapSinhVienId: number;

  @IsInt()
  @Min(1)
  lecturerId: number;
}

export class AssignGvddDto {
  @IsInt()
  @Min(1)
  tripId: number;

  @IsInt()
  @Min(1)
  lecturerId: number;

  @IsBoolean()
  laTruongDoan: boolean;
}

export class CreateBoardDto {
  @IsInt()
  @Min(1)
  scheduleId: number;

  @IsString()
  @IsNotEmpty({ message: 'Tên hội đồng không được để trống' })
  name: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  @IsNotEmpty({ message: 'Phòng hội đồng không được để trống' })
  room: string;
}

export class AddBoardMemberDto {
  @IsInt()
  @Min(1)
  boardId: number;

  @IsInt()
  @Min(1)
  lecturerId: number;

  @IsString()
  @IsIn(['ChuTich', 'ThuKy', 'ThanhVien'], {
    message: 'Vai trò phải là ChuTich, ThuKy hoặc ThanhVien',
  })
  role: string;
}

export class LockGradesDto {
  @IsInt()
  @Min(1)
  termStudentId: number;

  @IsInt()
  @Min(1)
  userId: number;
}

export class ApproveRefundDto {
  @IsInt()
  @Min(1)
  refundId: number;

  @IsInt()
  @Min(1)
  approverId: number;

  @IsBoolean()
  isApproved: boolean;
}

// (v11) khoa_id → khoa_hoc_id
export class CreateKhoaNotificationDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề thông báo không được để trống' })
  tieu_de: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung thông báo không được để trống' })
  noi_dung: string;

  @IsInt()
  @Min(1)
  nguoi_gui_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  khoa_hoc_id?: number;

  @IsOptional()
  @IsString()
  file_url?: string;

  @IsOptional()
  @IsString()
  file_name?: string;
}

export class ExportStudentListDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  campaignId?: number;
}

export class GetStudentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}

export class GetRegistrationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lichKienTapId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  chuyenThamQuanId?: number;

  @IsOptional()
  @IsString()
  hasCancelRequest?: string;
}

export class GetRefundRequestsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}

export class GetEnrollmentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lichKienTapId?: number;
}

// (v11) khoa_id → khoa_hoc_id, ten_khoa → ten_khoa_hoc
export class CreateStudentDto {
  @IsString()
  @IsNotEmpty({ message: 'MSSV không được để trống' })
  mssv: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  ho_ten: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  sdt?: string;

  @IsOptional()
  @IsString()
  ten_lop?: string;

  @IsOptional()
  @IsInt()
  khoa_hoc_id?: number;

  @IsOptional()
  @IsString()
  ten_khoa_hoc?: string;
}

export class UpdateStudentDto {
  @IsOptional() @IsString() mssv?: string;
  @IsOptional() @IsString() ho_ten?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() sdt?: string;
  @IsOptional() @IsString() ten_lop?: string;
  @IsOptional() @IsString() ten_khoa_hoc?: string;
}

export class GetAccountsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  vaiTro?: string;

  @IsOptional()
  @IsString()
  trangThai?: string;
}

export class CreateLecturerDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã giảng viên không được để trống' })
  ma_gv: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  ho_ten: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  sdt?: string;

  @IsOptional()
  @IsInt()
  so_sv_toi_da_huong_dan?: number;
}

export class UpdateLecturerDto {
  @IsOptional() @IsString() ma_gv?: string;
  @IsOptional() @IsString() ho_ten?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() sdt?: string;
  @IsOptional() @IsInt() so_sv_toi_da_huong_dan?: number;
}

export class BatchAssignGvhdDto {
  @IsArray()
  @IsInt({ each: true })
  dotKienTapSinhVienIds: number[];

  @IsInt()
  @Min(1)
  lecturerId: number;
}

export class AutoAssignGvhdDto {
  @IsInt()
  @Min(1)
  dotKienTapId: number;
}

export class ConfirmAutoAssignGvhdDto {
  @IsArray()
  assignments: { dotKienTapSinhVienId: number; lecturerId: number }[];
}
