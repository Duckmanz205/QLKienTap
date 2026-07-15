import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TaiKhoan, SinhVien, GiangVien } from '../entities/qlkt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaiKhoan, SinhVien, GiangVien])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
