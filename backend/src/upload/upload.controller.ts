import {
  Controller, Post, Get, Param, Res, Query,
  UseInterceptors, UploadedFile, ParseFilePipe,
  MaxFileSizeValidator, FileTypeValidator,
  BadRequestException, NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import * as crypto from 'crypto';
import { R2StorageService } from './r2-storage.service';

const UPLOAD_DIR = './uploads';

// Ensure local upload directory exists (fallback)
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * UploadController — Quản lý upload file.
 *
 * Chiến lược hybrid:
 *   - Nếu R2 đã cấu hình → upload thẳng lên Cloudflare R2
 *   - Nếu R2 chưa cấu hình → lưu local disk (fallback cho dev)
 *
 * Endpoints:
 *   POST /api/upload/report     → Bài thu hoạch SV (PDF/DOCX, max 5MB)
 *   POST /api/upload/excel      → File Excel import danh sách (XLSX/XLS, max 5MB)
 *   POST /api/upload/payment    → Minh chứng thanh toán (JPG/PNG, max 2MB)
 *   POST /api/upload/attachment → File đính kèm thông báo/hoàn phí (tất cả loại, max 5MB)
 *   GET  /api/upload/signed-url → Lấy signed URL để download file private từ R2
 *   GET  /api/upload/file/:type/:filename → Serve file local (fallback)
 */
@Controller('upload')
export class UploadController {
  constructor(private readonly r2: R2StorageService) {}

  // ============================================================
  //   UPLOAD BÀI THU HOẠCH (UC29)
  // ============================================================
  @Post('report')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const dest = `${UPLOAD_DIR}/reports`;
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req: any, file: any, cb: any) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `report-${crypto.randomUUID()}${ext}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
  }))
  async uploadReport(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(pdf|docx|doc)$/i }),
        ],
      })
    ) file: any,
  ) {
    if (!file) throw new BadRequestException('Tệp tải lên không hợp lệ.');

    // Nếu R2 sẵn sàng → upload lên cloud, xóa file local
    if (this.r2.isReady()) {
      const key = this.r2.generateKey('reports', 'sv', file.originalname);
      const result = await this.r2.uploadFile(
        this.r2.BUCKET_REPORTS,
        key,
        require('fs').readFileSync(file.path),
        file.mimetype,
        this.r2.PUBLIC_URL_REPORTS,
      );
      // Xóa file local sau khi upload thành công
      try { require('fs').unlinkSync(file.path); } catch {}
      return {
        message: 'Tải lên bài thu hoạch thành công (R2).',
        storage: 'cloudflare-r2',
        originalName: file.originalname,
        key: result.key,
        url: result.url,
      };
    }

    // Fallback: lưu local
    return {
      message: 'Tải lên bài thu hoạch thành công (local).',
      storage: 'local',
      originalName: file.originalname,
      fileName: file.filename,
      url: `/api/upload/file/reports/${file.filename}`,
    };
  }

  // ============================================================
  //   UPLOAD FILE EXCEL IMPORT (UC7 — Import danh sách SV)
  // ============================================================
  @Post('excel')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const dest = `${UPLOAD_DIR}/excels`;
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req: any, file: any, cb: any) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `import-${crypto.randomUUID()}${ext}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
  }))
  async uploadExcel(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(xlsx|xls)$/i }),
        ],
      })
    ) file: any,
  ) {
    if (!file) throw new BadRequestException('Tệp tải lên không hợp lệ.');

    // Excel thường xử lý tại backend rồi xóa → không cần upload R2
    return {
      message: 'Tải lên tệp Excel thành công.',
      storage: 'local',
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      url: `/api/upload/file/excels/${file.filename}`,
    };
  }

  // ============================================================
  //   UPLOAD MINH CHỨNG THANH TOÁN (UC30)
  // ============================================================
  @Post('payment')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const dest = `${UPLOAD_DIR}/payments`;
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req: any, file: any, cb: any) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `pay-${crypto.randomUUID()}${ext}`);
      }
    }),
    limits: { fileSize: 2 * 1024 * 1024 }
  }))
  async uploadPayment(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/i }),
        ],
      })
    ) file: any,
  ) {
    if (!file) throw new BadRequestException('Tệp tải lên không hợp lệ.');

    if (this.r2.isReady()) {
      const key = this.r2.generateKey('payments', 'sv', file.originalname);
      const result = await this.r2.uploadFile(
        this.r2.BUCKET_PAYMENTS,
        key,
        require('fs').readFileSync(file.path),
        file.mimetype,
        this.r2.PUBLIC_URL_PAYMENTS,
      );
      try { require('fs').unlinkSync(file.path); } catch {}
      return {
        message: 'Tải lên minh chứng thanh toán thành công (R2).',
        storage: 'cloudflare-r2',
        originalName: file.originalname,
        key: result.key,
        url: result.url,
      };
    }

    return {
      message: 'Tải lên minh chứng thanh toán thành công (local).',
      storage: 'local',
      originalName: file.originalname,
      fileName: file.filename,
      url: `/api/upload/file/payments/${file.filename}`,
    };
  }

  // ============================================================
  //   UPLOAD FILE ĐÍNH KÈM (UC6 thông báo, UC16 hủy ĐK, UC32 hoàn phí)
  // ============================================================
  @Post('attachment')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const dest = `${UPLOAD_DIR}/attachments`;
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req: any, file: any, cb: any) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `attach-${crypto.randomUUID()}${ext}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
  }))
  async uploadAttachment(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
      })
    ) file: any,
  ) {
    if (!file) throw new BadRequestException('Tệp tải lên không hợp lệ.');

    if (this.r2.isReady()) {
      const key = this.r2.generateKey('attachments', 'general', file.originalname);
      const result = await this.r2.uploadFile(
        this.r2.BUCKET_ATTACHMENTS,
        key,
        require('fs').readFileSync(file.path),
        file.mimetype,
        this.r2.PUBLIC_URL_ATTACHMENTS,
      );
      try { require('fs').unlinkSync(file.path); } catch {}
      return {
        message: 'Tải lên file đính kèm thành công (R2).',
        storage: 'cloudflare-r2',
        originalName: file.originalname,
        key: result.key,
        url: result.url,
      };
    }

    return {
      message: 'Tải lên file đính kèm thành công (local).',
      storage: 'local',
      originalName: file.originalname,
      fileName: file.filename,
      url: `/api/upload/file/attachments/${file.filename}`,
    };
  }

  // ============================================================
  //   SIGNED URL — Download file private từ R2
  // ============================================================
  @Get('signed-url')
  async getSignedUrl(
    @Query('bucket') bucket: string,
    @Query('key') key: string,
  ) {
    if (!bucket || !key) {
      throw new BadRequestException('Thiếu tham số bucket hoặc key.');
    }
    if (!this.r2.isReady()) {
      throw new BadRequestException('R2 Storage chưa được cấu hình.');
    }

    const url = await this.r2.getSignedUrl(bucket, key, 3600);
    return { url, expiresIn: 3600 };
  }

  // ============================================================
  //   SERVE FILE LOCAL (fallback khi không dùng R2)
  // ============================================================
  @Get('file/:type/:filename')
  async serveFile(
    @Param('type') type: string,
    @Param('filename') filename: string,
    @Res() res: any,
  ) {
    if (filename.includes('..') || type.includes('..')) {
      throw new BadRequestException('Yêu cầu không hợp lệ.');
    }
    const safeTypes = ['reports', 'excels', 'payments', 'attachments'];
    if (!safeTypes.includes(type)) {
      throw new BadRequestException('Loại thư mục không hợp lệ.');
    }

    const filePath = join(process.cwd(), 'uploads', type, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Tệp không tồn tại.');
    }

    const ext = extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (ext === '.xls') contentType = 'application/vnd.ms-excel';
    else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === '.doc') contentType = 'application/msword';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    if (['.xlsx', '.xls', '.docx', '.doc'].includes(ext)) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    }
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }
}
