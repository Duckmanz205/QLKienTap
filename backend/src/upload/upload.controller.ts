import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  FileValidator,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import * as crypto from 'crypto';
import { R2StorageService } from './r2-storage.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtPayloadUser } from '../auth/decorators/user.decorator';
import { SinhVien, GiangVien, PhanCongGVHD } from '../entities/qlkt.entity';

export class CustomFileTypeValidator extends FileValidator<{ fileType: RegExp | string }> {
  buildErrorMessage(): string {
    return `Validation failed (expected type is ${this.validationOptions.fileType})`;
  }
  isValid(file: Express.Multer.File): boolean {
    if (!file) return false;
    if (this.validationOptions.fileType instanceof RegExp) {
      return this.validationOptions.fileType.test(file.mimetype) || this.validationOptions.fileType.test(file.originalname);
    }
    return file.mimetype === this.validationOptions.fileType || file.originalname.endsWith(this.validationOptions.fileType);
  }
}

import { GetSignedUrlQueryDto } from './dto/upload.dto';

const UPLOAD_DIR = './uploads';

// Ensure local upload directory exists (fallback)
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * UploadController — Quản lý upload & cấp signed URL tải file private từ Cloudflare R2 / Local.
 */
@Controller('upload')
@UseGuards(AuthGuard, RolesGuard)
export class UploadController {
  constructor(
    private readonly r2: R2StorageService,
    @InjectRepository(SinhVien)
    private readonly svRepo: Repository<SinhVien>,
    @InjectRepository(GiangVien)
    private readonly gvRepo: Repository<GiangVien>,
    @InjectRepository(PhanCongGVHD)
    private readonly phanCongRepo: Repository<PhanCongGVHD>,
  ) {}

  /**
   * Helper kiểm tra xem giảng viên (theo accountId) có được phân công hướng dẫn sinh viên (theo accountId) hay không.
   */
  private async isLecturerGuidingStudent(
    lecturerAccountId: number,
    studentIdentifier: string,
  ): Promise<boolean> {
    if (!studentIdentifier) return false;

    const gv = await this.gvRepo.findOne({
      where: { taikhoan_id: lecturerAccountId },
    });
    if (!gv) return false;

    // studentIdentifier could be taikhoan_id (number string) or MSSV (string)
    const sv = await this.svRepo.createQueryBuilder('sv')
      .where('sv.taikhoan_id = :identifier OR sv.mssv = :identifier', { identifier: studentIdentifier })
      .getOne();

    if (!sv) return false;

    // 1. Kiểm tra xem có phải giảng viên hướng dẫn chấm điểm không
    const assignment = await this.phanCongRepo.findOne({
      where: {
        giang_vien_id: gv.id,
        trang_thai: 'DangHoatDong',
        dotKienTapSinhVien: {
          sinh_vien_id: sv.id,
        },
      },
      relations: { dotKienTapSinhVien: true },
    });

    if (assignment) return true;

    // 2. Kiểm tra xem có phải giảng viên dẫn đoàn (Lead Lecturer) không
    const isLead = await this.svRepo.manager.query(
      `SELECT TOP 1 1 
       FROM PhanCongGiangVienDanDoan pc 
       JOIN PhieuDangKy pdk ON pc.chuyen_tham_quan_id = pdk.chuyen_tham_quan_id 
       WHERE pc.giang_vien_id = ${gv.id} AND pdk.sinh_vien_id = ${sv.id}`
    );

    if (isLead && isLead.length > 0) return true;

    return false;
  }

  private sendLocalFile(res: any, filePath: string, filename: string) {
    const ext = extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.xlsx')
      contentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (ext === '.xls') contentType = 'application/vnd.ms-excel';
    else if (ext === '.docx')
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === '.doc') contentType = 'application/msword';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.txt') contentType = 'text/plain; charset=utf-8';

    res.setHeader('Content-Type', contentType);
    if (['.xlsx', '.xls', '.docx', '.doc'].includes(ext)) {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
    } else {
      res.setHeader('Content-Security-Policy', "default-src 'none'");
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    }

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  // ============================================================
  //   UPLOAD BÀI THU HOẠCH (UC29) — Chỉ SinhVien được upload
  // ============================================================
  @Post('report')
  @Roles('SinhVien')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const userSub = req.user?.sub || 'general';
          const dest = `${UPLOAD_DIR}/reports/${userSub}`;
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req: any, file: any, cb: any) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `report-${crypto.randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadReport(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new CustomFileTypeValidator({ fileType: /(pdf|docx|doc)$/i }),
        ],
      }),
    )
    file: any,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    if (!file) throw new BadRequestException('Tệp tải lên không hợp lệ.');

    const sv = await this.svRepo.findOne({ where: { taikhoan_id: user.sub } });
    const userIdentifier = sv ? sv.mssv : String(user.sub);

    // Bước 1: Trích xuất text từ PDF
    let extractedText: string | null = null;
    if (file.originalname.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfParse = require('pdf-parse');
        const pdfBuffer = require('fs').readFileSync(file.path);
        const data = await pdfParse(pdfBuffer);
        extractedText = data.text?.trim();

        // Fallback: Nếu pdf-parse không đọc được text (ví dụ PDF scan từ ảnh), gọi AI OCR service
        if (!extractedText || extractedText.length < 50) {
          try {
            console.log('Văn bản PDF quá ngắn hoặc trống, đang gọi AI OCR service để trích xuất...');
            const formData = new FormData();
            const fileBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
            formData.append('file', fileBlob, file.originalname);

            const aiResponse = await fetch('http://127.0.0.1:8000/process-pdf', {
              method: 'POST',
              body: formData,
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              if (aiData.extracted_text) {
                extractedText = aiData.extracted_text.trim();
                console.log('AI OCR trích xuất thành công.');
              }
            } else {
              console.error('AI OCR service lỗi:', await aiResponse.text());
            }
          } catch (aiErr) {
            console.error('Không thể kết nối đến AI service:', aiErr.message);
          }
        }
      } catch (err) {
        console.error('PDF parsing error:', err);
      }
    }

    // Bước 2: Chuyển file sang thư mục MSSV (từ thư mục user.sub tạo bởi multer)
    const newDest = `${UPLOAD_DIR}/reports/${userIdentifier}`;
    if (!existsSync(newDest)) {
      mkdirSync(newDest, { recursive: true });
    }
    const newPath = join(newDest, file.filename);
    require('fs').renameSync(file.path, newPath);

    // Bước 3: Tạo file .txt chứa text AI trích xuất
    // Prepend UTF-8 BOM (\uFEFF) để trình duyệt luôn nhận diện đúng encoding
    // khi truy cập trực tiếp qua R2 public URL (tránh lỗi mojibake tiếng Việt)
    const txtFilename = file.filename.replace(/\.\w+$/, '.txt');
    const txtPath = join(newDest, txtFilename);
    const txtContent = extractedText || 'Không thể trích xuất văn bản từ file này.';
    require('fs').writeFileSync(txtPath, '\uFEFF' + txtContent, 'utf-8');

    // Bước 4: Xử lý Cloudflare R2
    if (this.r2.isReady()) {
      const keyPdf = this.r2.generateKey(
        'reports',
        userIdentifier,
        file.originalname,
      );
      const keyTxt = keyPdf.replace(/\.\w+$/, '.txt');

      await Promise.all([
        this.r2.uploadFile(
          this.r2.BUCKET_REPORTS,
          keyPdf,
          require('fs').readFileSync(newPath),
          file.mimetype,
        ),
        this.r2.uploadFile(
          this.r2.BUCKET_REPORTS,
          keyTxt,
          require('fs').readFileSync(txtPath),
          'text/plain; charset=utf-8',
        )
      ]);

      // Bài thu hoạch là dữ liệu nhạy cảm → trả signed URL có thời hạn ngắn (1 giờ) thay vì public URL
      const signedUrl = await this.r2.getSignedUrl(
        this.r2.BUCKET_REPORTS,
        keyPdf,
        3600,
      );

      try {
        require('fs').unlinkSync(newPath);
        require('fs').unlinkSync(txtPath);
      } catch {}

      return {
        message: 'Tải lên bài thu hoạch thành công (R2).',
        storage: 'cloudflare-r2',
        originalName: file.originalname,
        key: keyPdf,
        url: signedUrl,
      };
    }

    // Fallback: lưu local theo folder MSSV
    return {
      message: 'Tải lên bài thu hoạch thành công (local).',
      storage: 'local',
      originalName: file.originalname,
      fileName: file.filename,
      url: `/api/upload/file/reports/${userIdentifier}/${file.filename}`,
    };
  }

  // ============================================================
  //   UPLOAD FILE EXCEL IMPORT (UC7) — Chỉ QuanLyKhoa hoặc Khoa được upload
  // ============================================================
  @Post('excel')
  @Roles('QuanLyKhoa', 'Khoa')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const userSub = req.user?.sub || 'general';
          const dest = `${UPLOAD_DIR}/excels/${userSub}`;
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req: any, file: any, cb: any) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `import-${crypto.randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadExcel(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new CustomFileTypeValidator({ fileType: /(xlsx|xls)$/i }),
        ],
      }),
    )
    file: any,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    if (!file) throw new BadRequestException('Tệp tải lên không hợp lệ.');

    return {
      message: 'Tải lên tệp Excel thành công.',
      storage: 'local',
      originalName: file.originalname,
      fileName: file.filename,
      url: `/api/upload/file/excels/${user.sub}/${file.filename}`,
    };
  }

  // ============================================================
  //   UPLOAD MINH CHỨNG THANH TOÁN (UC30) — Chỉ SinhVien được upload
  // ============================================================
  @Post('payment')
  @Roles('SinhVien')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const userSub = req.user?.sub || 'general';
          const dest = `${UPLOAD_DIR}/payments/${userSub}`;
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req: any, file: any, cb: any) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `pay-${crypto.randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadPayment(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new CustomFileTypeValidator({ fileType: /(jpg|jpeg|png)$/i }),
        ],
      }),
    )
    file: any,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    if (!file) throw new BadRequestException('Tệp tải lên không hợp lệ.');

    if (this.r2.isReady()) {
      let sv = await this.svRepo.findOne({ where: { taikhoan_id: user.sub } });
      const folderName = sv ? sv.mssv : String(user.sub);

      const key = this.r2.generateKey(
        'payments',
        folderName,
        file.originalname,
      );
      await this.r2.uploadFile(
        this.r2.BUCKET_PAYMENTS,
        key,
        require('fs').readFileSync(file.path),
        file.mimetype,
      );

      // Minh chứng thanh toán là dữ liệu nhạy cảm → chỉ sinh signed URL 1 giờ
      const signedUrl = await this.r2.getSignedUrl(
        this.r2.BUCKET_PAYMENTS,
        key,
        3600,
      );

      try {
        require('fs').unlinkSync(file.path);
      } catch {}

      return {
        message: 'Tải lên minh chứng thanh toán thành công (R2).',
        storage: 'cloudflare-r2',
        originalName: file.originalname,
        key,
        url: signedUrl,
      };
    }

    return {
      message: 'Tải lên minh chứng thanh toán thành công (local).',
      storage: 'local',
      originalName: file.originalname,
      fileName: file.filename,
      url: `/api/upload/file/payments/${user.sub}/${file.filename}`,
    };
  }

  // ============================================================
  //   UPLOAD FILE ĐÍNH KÈM (UC6 thông báo, UC16 hủy ĐK, UC32 hoàn phí)
  //   Shared endpoint cho tất cả vai trò đã đăng nhập
  // ============================================================
  @Post('attachment')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const userSub = req.user?.sub || 'general';
          const dest = `${UPLOAD_DIR}/attachments/${userSub}`;
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req: any, file: any, cb: any) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `attach-${crypto.randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAttachment(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new CustomFileTypeValidator({
            fileType: /(pdf|doc|docx|xlsx|xls|png|jpg|jpeg|zip|rar)$/i,
          }),
        ],
      }),
    )
    file: any,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    if (!file) throw new BadRequestException('Tệp tải lên không hợp lệ.');

    if (this.r2.isReady()) {
      let sv = await this.svRepo.findOne({ where: { taikhoan_id: user.sub } });
      const folderName = sv ? sv.mssv : String(user.sub);

      const key = this.r2.generateKey(
        'attachments',
        folderName,
        file.originalname,
      );
      const result = await this.r2.uploadFile(
        this.r2.BUCKET_ATTACHMENTS,
        key,
        require('fs').readFileSync(file.path),
        file.mimetype,
      );
      try {
        require('fs').unlinkSync(file.path);
      } catch {}
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
      url: `/api/upload/file/attachments/${user.sub}/${file.filename}`,
    };
  }

  // ============================================================
  //   SIGNED URL — Download file private từ R2 với phân quyền sở hữu tối thiểu
  // ============================================================
  @Get('signed-url')
  async getSignedUrl(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: GetSignedUrlQueryDto,
  ) {
    const { bucket, key } = query;

    // Sanitization & Validation kiểm tra key
    if (
      key.includes('..') ||
      key.includes('\\') ||
      key.includes('\0') ||
      key.startsWith('/') ||
      key.includes('://') ||
      key.includes('http:') ||
      key.includes('https:')
    ) {
      throw new BadRequestException('Key không hợp lệ.');
    }

    const KEY_REGEX =
      /^(reports|excels|payments|attachments)\/([a-zA-Z0-9_-]+)\/[a-zA-Z0-9_.-]+$/;
    if (!KEY_REGEX.test(key)) {
      throw new BadRequestException('Định dạng key không hợp lệ.');
    }

    // Allow-list Bucket check
    const allowedBuckets = [
      this.r2.BUCKET_REPORTS,
      this.r2.BUCKET_PAYMENTS,
      this.r2.BUCKET_ATTACHMENTS,
    ];
    if (!allowedBuckets.includes(bucket)) {
      throw new BadRequestException(
        'Bucket không nằm trong danh sách cho phép.',
      );
    }

    // Kiểm tra prefix trong key có tương thích với bucket đã chọn hay không
    const parts = key.split('/');
    const keyPrefix = parts[0];
    const keyOwner = parts[1]; // e.g. "15", "sv", "general"

    if (
      (bucket === this.r2.BUCKET_REPORTS && keyPrefix !== 'reports') ||
      (bucket === this.r2.BUCKET_PAYMENTS && keyPrefix !== 'payments') ||
      (bucket === this.r2.BUCKET_ATTACHMENTS && keyPrefix !== 'attachments')
    ) {
      throw new BadRequestException(
        'Key không tương thích với bucket đã chọn.',
      );
    }

    if (!this.r2.isReady()) {
      throw new BadRequestException('R2 Storage chưa được cấu hình.');
    }

    // Kiểm tra Ownership & Phân quyền truy cập
    const userRole = user?.role;
    const userSubStr = String(user?.sub);

    if (userRole === 'SinhVien') {
      // Sinh viên chỉ được truy cập file do chính mình upload (owner prefix = user.sub)
      if (keyOwner !== userSubStr) {
        throw new ForbiddenException('Bạn không có quyền truy cập file này.');
      }
    } else if (userRole === 'GiangVien') {
      // Giảng viên không được phép tải minh chứng thanh toán của bất kỳ sinh viên nào
      if (keyPrefix === 'payments') {
        throw new ForbiddenException(
          'Giảng viên không có quyền truy cập minh chứng thanh toán.',
        );
      } else if (keyPrefix === 'reports') {
        // Giảng viên được tải báo cáo của chính mình hoặc của sinh viên do mình hướng dẫn
        if (keyOwner === userSubStr) {
          // File do chính giảng viên upload
        } else if (/^\d+$/.test(keyOwner)) {
          const isGuiding = await this.isLecturerGuidingStudent(
            user.sub,
            keyOwner,
          );
          if (!isGuiding) {
            throw new ForbiddenException(
              'Bạn không được phân công hướng dẫn sinh viên sở hữu bài thu hoạch này.',
            );
          }
        } else {
          // Key legacy không rõ owner -> deny by default đối với Giảng viên
          throw new ForbiddenException(
            'Không thể xác minh quyền sở hữu bài thu hoạch legacy này.',
          );
        }
      } else if (keyPrefix === 'attachments') {
        // File đính kèm: chỉ cho phép file của chính giảng viên hoặc sinh viên do giảng viên hướng dẫn
        if (keyOwner === userSubStr) {
          // File của chính mình
        } else if (/^\d+$/.test(keyOwner)) {
          const isGuiding = await this.isLecturerGuidingStudent(
            user.sub,
            keyOwner,
          );
          if (!isGuiding) {
            throw new ForbiddenException(
              'Bạn không có quyền truy cập file đính kèm này.',
            );
          }
        } else {
          // File đính kèm legacy không xác định -> deny by default
          throw new ForbiddenException(
            'Không thể xác minh quyền sở hữu file đính kèm legacy này.',
          );
        }
      } else {
        throw new ForbiddenException('Bạn không có quyền truy cập file này.');
      }
    } else if (userRole === 'QuanLyKhoa' || userRole === 'Khoa' || userRole === 'QuanLyCLB') {
      // QuanLyKhoa/Khoa/QuanLyCLB có quyền tải file hợp lệ trong các bucket nghiệp vụ (bao gồm cả file legacy 'sv', 'general')
    } else {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này.',
      );
    }

    const url = await this.r2.getSignedUrl(bucket, key, 3600);
    return { url, expiresIn: 3600 };
  }

  // ============================================================
  //   SERVE FILE LOCAL (fallback khi không dùng R2)
  //   Bảo vệ theo ownership tương đương signed-url
  // ============================================================
  // ============================================================
  @Get(['file/:type/:param1', 'file/:type/:param1/:param2'])
  async serveFile(
    @Param('type') type: string,
    @Param('param1') param1: string,
    @Param('param2') param2: string | undefined,
    @CurrentUser() user: JwtPayloadUser,
    @Res() res: any,
  ) {
    let ownerId: string | null = null;
    let filename: string;

    if (param2) {
      ownerId = param1;
      filename = param2;
    } else {
      filename = param1;
    }

    if (
      !type ||
      !filename ||
      type.includes('..') ||
      type.includes('\\') ||
      type.includes('\0') ||
      filename.includes('..') ||
      filename.includes('\\') ||
      filename.includes('\0') ||
      (ownerId &&
        (ownerId.includes('..') ||
          ownerId.includes('\\') ||
          ownerId.includes('\0')))
    ) {
      throw new BadRequestException('Yêu cầu không hợp lệ.');
    }

    const ALLOWED_TYPES = [
      'reports',
      'excels',
      'payments',
      'attachments',
      'templates',
    ];
    if (!ALLOWED_TYPES.includes(type)) {
      throw new BadRequestException('Loại thư mục không hợp lệ.');
    }

    if (type === 'templates') {
      const templatePath = join(
        process.cwd(),
        'uploads',
        'templates',
        filename,
      );
      if (!existsSync(templatePath)) {
        throw new NotFoundException('Tệp không tồn tại.');
      }
      return this.sendLocalFile(res, templatePath, filename);
    }

    const userRole = user?.role;
    const userSubStr = String(user?.sub);
    let userMssv = '';

    if (userRole === 'SinhVien') {
      const sv = await this.svRepo.findOne({ where: { taikhoan_id: user.sub } });
      if (sv) userMssv = sv.mssv;
    }

    if (userRole === 'SinhVien') {
      if (!ownerId || (ownerId !== userSubStr && ownerId !== userMssv)) {
        throw new ForbiddenException('Bạn không có quyền truy cập file này.');
      }
    } else if (userRole === 'GiangVien') {
      if (type === 'payments' || type === 'excels') {
        throw new ForbiddenException(
          'Giảng viên không có quyền truy cập file này.',
        );
      } else if (type === 'reports' || type === 'attachments') {
        if (!ownerId) {
          throw new ForbiddenException(
            'Không thể xác minh quyền sở hữu file legacy này.',
          );
        }
        if (ownerId !== userSubStr) {
          const isGuiding = await this.isLecturerGuidingStudent(
            user.sub,
            ownerId,
          );
          if (!isGuiding) {
            throw new ForbiddenException(
              'Bạn không có quyền truy cập file này.',
            );
          }
        }
      } else {
        throw new ForbiddenException('Bạn không có quyền truy cập file này.');
      }
    } else if (userRole === 'QuanLyKhoa' || userRole === 'Khoa' || userRole === 'QuanLyCLB') {
    } else {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này.',
      );
    }

    const filePath = ownerId
      ? join(process.cwd(), 'uploads', type, ownerId, filename)
      : join(process.cwd(), 'uploads', type, filename);

    if (!existsSync(filePath)) {
      if (this.r2.isReady()) {
        const key = ownerId ? `${type}/${ownerId}/${filename}` : `${type}/${filename}`;
        let bucketName = this.r2.BUCKET_ATTACHMENTS;
        if (type === 'reports') bucketName = this.r2.BUCKET_REPORTS;
        if (type === 'payments') bucketName = this.r2.BUCKET_PAYMENTS;
        
        try {
          const { stream, contentType, contentLength } = await this.r2.getFileStream(bucketName, key);
          let finalContentType = contentType || 'application/octet-stream';
          if (extname(filename).toLowerCase() === '.txt' && finalContentType === 'text/plain') {
            finalContentType = 'text/plain; charset=utf-8';
          }
          res.setHeader('Content-Type', finalContentType);
          if (contentLength) {
            res.setHeader('Content-Length', contentLength);
          }
          if (['.xlsx', '.xls', '.docx', '.doc'].includes(extname(filename).toLowerCase())) {
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          } else {
            res.setHeader('Content-Security-Policy', "default-src 'none'");
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
          }
          return stream.pipe(res);
        } catch (err) {
          throw new NotFoundException('Tệp không tồn tại trên lưu trữ R2.');
        }
      }
      throw new NotFoundException('Tệp không tồn tại.');
    }

    return this.sendLocalFile(res, filePath, filename);
  }
}
