import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { R2StorageService } from './r2-storage.service';
import { AuthModule } from '../auth/auth.module';
import { SinhVien, GiangVien, PhanCongGVHD } from '../entities/qlkt.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([SinhVien, GiangVien, PhanCongGVHD]),
  ],
  controllers: [UploadController],
  providers: [R2StorageService],
  exports: [R2StorageService],
})
export class UploadModule {}
