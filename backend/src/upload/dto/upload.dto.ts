import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class GetSignedUrlQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'Tham số bucket không được để trống' })
  bucket: string;

  @IsString()
  @IsNotEmpty({ message: 'Tham số key không được để trống' })
  key: string;
}

export class ServeFileParamDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['reports', 'excels', 'payments', 'attachments', 'templates'], {
    message: 'Loại thư mục không hợp lệ',
  })
  type: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên file không được để trống' })
  filename: string;
}

