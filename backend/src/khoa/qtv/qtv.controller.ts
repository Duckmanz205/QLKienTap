import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  Body,
  BadRequestException,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { KhoaService } from '../shared/khoa.service';
import { BackupService } from '../shared/backup.service';
import { GetAccountsQueryDto } from '../shared/dto/khoa.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayloadUser,
} from '../../auth/decorators/user.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

// Cấu hình lưu trữ tạm trên đĩa cho tệp sao lưu phục hồi (.bak)
const restoreUploadStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(process.cwd(), 'temp_restores');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `restore_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const bakFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.bak') {
    return cb(
      new BadRequestException(
        'Định dạng tệp không hợp lệ. Vui lòng tải lên tệp sao lưu có đuôi .bak',
      ),
      false,
    );
  }
  cb(null, true);
};

@UseGuards(AuthGuard, RolesGuard)
@Controller('qtv')
export class QtvController {
  constructor(
    private readonly khoaService: KhoaService,
    private readonly backupService: BackupService,
  ) {}

  @Roles('QuanTriVienHeThong')
  @Get('account')
  async getAccounts(@Query() query: GetAccountsQueryDto) {
    return this.khoaService.getAccounts(
      query.page || 1,
      query.limit || 15,
      query.search,
      query.vaiTro,
      query.trangThai,
    );
  }

  @Roles('QuanTriVienHeThong')
  @Post('account/:id/toggle-lock')
  async toggleAccountLock(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    if (id === user.sub) {
      throw new BadRequestException(
        'Không thể tự khóa tài khoản của chính mình',
      );
    }
    return this.khoaService.toggleAccountLock(id);
  }

  @Roles('QuanTriVienHeThong')
  @Post('account/:id/reset-password')
  async resetAccountPassword(@Param('id', ParseIntPipe) id: number) {
    return this.khoaService.resetAccountPassword(id);
  }

  // -----------------------------------------------------------
  // PHÂN HỆ SAO LƯU & PHỤC HỒI CƠ SỞ DỮ LIỆU (BACKUP & RESTORE)
  // -----------------------------------------------------------

  /**
   * Lấy thông tin tổng quan về CSDL: Tên DB, dung lượng Data/Log, số bảng, v.v.
   */
  @Roles('QuanTriVienHeThong')
  @Get('backup/overview')
  async getDatabaseOverview() {
    return this.backupService.getDatabaseOverview();
  }

  /**
   * Tải về trực tiếp bản sao lưu (.BAK) từ SQL Server về máy khách
   */
  @Roles('QuanTriVienHeThong')
  @Get('backup/download')
  async downloadBackup(@Res() res: Response) {
    return this.backupService.streamDatabaseBackup(res);
  }

  /**
   * Tạo bản sao lưu toàn phần lưu trữ trong thư mục backups/ trên máy chủ
   */
  @Roles('QuanTriVienHeThong')
  @Post('backup/create')
  async createBackupOnServer() {
    return this.backupService.createBackupOnServer();
  }

  /**
   * Lấy danh sách các tệp sao lưu đang lưu trữ trên máy chủ
   */
  @Roles('QuanTriVienHeThong')
  @Get('backup/list')
  async listServerBackups() {
    return this.backupService.listServerBackups();
  }

  /**
   * Tải về một tệp sao lưu cụ thể từ máy chủ
   */
  @Roles('QuanTriVienHeThong')
  @Get('backup/download-file/:fileName')
  async downloadServerBackup(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    return this.backupService.downloadServerBackup(fileName, res);
  }

  /**
   * Xóa một tệp sao lưu khỏi máy chủ
   */
  @Roles('QuanTriVienHeThong')
  @Delete('backup/:fileName')
  async deleteServerBackup(@Param('fileName') fileName: string) {
    return this.backupService.deleteServerBackup(fileName);
  }

  /**
   * Phục hồi cơ sở dữ liệu từ tệp .bak được tải lên từ máy tính của Quản trị viên
   */
  @Roles('QuanTriVienHeThong')
  @Post('restore/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: restoreUploadStorage,
      fileFilter: bakFileFilter,
      limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB
      },
    }),
  )
  async restoreFromUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn tệp sao lưu .bak để phục hồi');
    }
    try {
      return await this.backupService.restoreDatabase(file.path);
    } finally {
      try {
        if (file?.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error('Lỗi khi xóa file upload tạm:', err);
      }
    }
  }

  /**
   * Phục hồi cơ sở dữ liệu từ một bản sao lưu đã có sẵn trên máy chủ
   */
  @Roles('QuanTriVienHeThong')
  @Post('restore/from-server/:fileName')
  async restoreFromServer(@Param('fileName') fileName: string) {
    const sanitized = path.basename(fileName);
    if (!sanitized.toLowerCase().endsWith('.bak')) {
      throw new BadRequestException('Tên tệp sao lưu không hợp lệ');
    }

    const backupDir = path.resolve(process.cwd(), 'backups');
    const targetFilePath = path.join(backupDir, sanitized);

    if (!fs.existsSync(targetFilePath)) {
      throw new NotFoundException('Không tìm thấy tệp sao lưu trên máy chủ');
    }

    return this.backupService.restoreDatabase(targetFilePath);
  }
}
