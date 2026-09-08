import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @Length(1, 100)
  ten_dang_nhap: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @Length(1, 100)
  mat_khau: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  @Length(1, 100)
  oldPass: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @Length(6, 100, { message: 'Mật khẩu mới phải từ 6 ký tự trở lên' })
  newPass: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được là chuỗi rỗng' })
  @Matches(/^[0-9\s+()-]{7,20}$/, { message: 'Số điện thoại không hợp lệ' })
  sdt?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được là chuỗi rỗng' })
  email?: string;
}
