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
  nam_hoc: string;

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

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã khoa không được để trống' })
  @Length(1, 50)
  ma_khoa: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên khoa không được để trống' })
  @Length(1, 200)
  ten_khoa: string;
}

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

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên đợt kiến tập không được để trống' })
  ten_dot: string;

  @IsInt()
  @Min(1)
  hoc_ky_id: number;

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
  @IsIn(['Draft', 'Publish', 'Finished'])
  trang_thai?: string;
}

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên lịch không được để trống' })
  ten_lich: string;

  @IsInt()
  @Min(1)
  dot_kien_tap_id: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  tg_dien_ra_tu?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  tg_dien_ra_den?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  han_chot_nop_bao_cao?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  han_chot_diem?: Date;

  @IsOptional()
  @IsString()
  @IsIn(['Nhap', 'MoDangKy', 'DangDienRa', 'DaKetThuc', 'DaKhoa'])
  trang_thai?: string;
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

export class CreateTripDto {
  @IsInt()
  @Min(1)
  nha_may_id: number;

  @IsInt()
  @Min(1)
  lich_kien_tap_id: number;

  @Type(() => Date)
  @IsDate()
  ngay_tham_quan: Date;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ bắt đầu phải theo định dạng HH:mm',
  })
  gio_bat_dau: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ kết thúc phải theo định dạng HH:mm',
  })
  gio_ket_thuc: string;

  @IsString()
  @IsIn(['TrucTiep', 'TrucTuyen'])
  hinh_thuc: string;

  @IsOptional()
  @IsString()
  @IsIn(['DoKhoaToChuc', 'TuDo'])
  cach_to_chuc?: string;

  @IsInt()
  @Min(1)
  suc_chua: number;

  @IsOptional()
  @IsString()
  @IsIn(['Nhap', 'MoDangKy', 'DaChotDanhSach', 'DaDienRa', 'DaHuy'])
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
  khoa_id?: number;
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
}

