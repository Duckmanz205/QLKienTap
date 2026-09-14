import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsIn,
  Matches,
  Length,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class RegisterTripDto {
  @IsInt()
  @Min(1)
  tripId: number;
}

export class ProposeTripDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  nhaMayId?: number;

  @IsOptional()
  @IsString()
  tenNhaMayDeXuat?: string;

  @IsOptional()
  @IsString()
  diaChiDeXuat?: string;

  @IsOptional()
  @IsString()
  nguoiLienHeDeXuat?: string;

  @IsOptional()
  @IsString()
  sdtLienHeDeXuat?: string;

  @Type(() => Date)
  @IsDate()
  ngayThamQuan: Date;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ bắt đầu phải theo định dạng HH:mm',
  })
  gioBatDau: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ kết thúc phải theo định dạng HH:mm',
  })
  gioKetThuc: string;

  @IsString()
  @IsIn(['TrucTiep', 'TrucTuyen'], {
    message: 'Hình thức phải là TrucTiep hoặc TrucTuyen',
  })
  hinhThuc: string;
}

export class RequestCancelDto {
  @IsInt()
  @Min(1)
  registrationId: number;

  @IsString()
  @IsNotEmpty({ message: 'Lý do hủy không được để trống' })
  @Length(1, 500)
  lyDo: string;

  @IsOptional()
  @IsString()
  fileMinhChung?: string;
}

export class RequestRefundDto {
  @IsInt()
  @Min(1)
  invoiceId: number;

  @IsString()
  @IsNotEmpty({ message: 'Đường dẫn file scan không được để trống' })
  fileScanUrl: string;
}

export class MarkNotificationReadDto {
  @IsInt()
  @Min(1)
  notifId: number;
}

export class SubmitReportDto {
  @IsInt()
  @Min(1)
  registrationId: number;

  @IsString()
  @IsNotEmpty({ message: 'Đường dẫn file báo cáo không được để trống' })
  fileBaoCaoUrl: string;

  @IsOptional()
  @IsString()
  fileXacNhanUrl?: string;
}

export class SelectRepresentativeTripsDto {
  @IsInt()
  @Min(1)
  termStudentId: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'Danh sách phiếu đăng ký không được rỗng' })
  @IsInt({ each: true })
  @Min(1, { each: true })
  registrationIds: number[];
}
