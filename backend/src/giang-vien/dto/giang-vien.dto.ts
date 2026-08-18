import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
  Max,
  IsNumber,
  IsString,
  IsOptional,
  IsIn,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';

export class TakeAttendanceRecordDto {
  @IsInt()
  @Min(1)
  phieuId: number;

  @IsString()
  @IsIn(['CoMat', 'Vang', 'TuChoiThamGia'], {
    message: 'Trạng thái điểm danh phải là CoMat, Vang hoặc TuChoiThamGia',
  })
  status: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class TakeAttendanceDto {
  @IsInt()
  @Min(1)
  tripId: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'Danh sách điểm danh không được rỗng' })
  @ValidateNested({ each: true })
  @Type(() => TakeAttendanceRecordDto)
  records: TakeAttendanceRecordDto[];
}

export class GradePrepBonusDto {
  @IsInt()
  @Min(1)
  phieuId: number;

  @IsNumber()
  @Min(0, { message: 'Điểm chuẩn bị không được bé hơn 0' })
  @Max(10, { message: 'Điểm chuẩn bị không được lớn hơn 10' })
  diemChuanBi: number;

  @IsNumber()
  @Min(0, { message: 'Điểm cộng không được bé hơn 0' })
  @Max(1, { message: 'Điểm cộng không được lớn hơn 1' })
  diemCong: number;
}

export class GradeReportDto {
  @IsInt()
  @Min(1)
  reportId: number;

  @IsNumber()
  @Min(0, { message: 'Điểm báo cáo không được bé hơn 0' })
  @Max(10, { message: 'Điểm báo cáo không được lớn hơn 10' })
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class SubmitBoardScoreDto {
  @IsInt()
  @Min(1)
  memberId: number;

  @IsInt()
  @Min(1)
  phieuId: number;

  @IsNumber()
  @Min(0, { message: 'Điểm hội đồng không được bé hơn 0' })
  @Max(10, { message: 'Điểm hội đồng không được lớn hơn 10' })
  score: number;
}

export class GuidedReportsQueryDto {
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
}
