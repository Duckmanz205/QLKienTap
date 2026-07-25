import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { R2StorageService } from './r2-storage.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [R2StorageService],
  exports: [R2StorageService],
})
export class UploadModule {}
