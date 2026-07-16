import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { R2StorageService } from './r2-storage.service';

@Module({
  controllers: [UploadController],
  providers: [R2StorageService],
  exports: [R2StorageService], // Export để các module khác (SinhVien, Khoa...) có thể dùng
})
export class UploadModule {}
