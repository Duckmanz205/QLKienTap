import { Controller, Post, Get, Param, Res, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException, NotFoundException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import * as crypto from 'crypto';

const UPLOAD_DIR = './uploads';

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller('upload')
@UseGuards(AuthGuard, RolesGuard)
export class UploadController {
  @Post('report')
  @Roles('SinhVien', 'Khoa')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const dest = `${UPLOAD_DIR}/reports`;
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req: any, file: any, cb: any) => {
        const uniqueSuffix = crypto.randomUUID();
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `report-${uniqueSuffix}${ext}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  }))
  async uploadReport(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /(pdf|docx|doc)$/i }),
      ],
    })
  ) file: any) {
    if (!file) {
      throw new BadRequestException('Tệp tải lên không hợp lệ.');
    }
    return {
      message: 'Tải lên tệp báo cáo thành công.',
      originalName: file.originalname,
      fileName: file.filename,
      url: `/api/upload/file/reports/${file.filename}`
    };
  }

  @Post('excel')
  @Roles('Khoa')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const dest = `${UPLOAD_DIR}/excels`;
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req: any, file: any, cb: any) => {
        const uniqueSuffix = crypto.randomUUID();
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `import-${uniqueSuffix}${ext}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  }))
  async uploadExcel(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /(xlsx|xls)$/i }),
      ],
    })
  ) file: any) {
    if (!file) {
      throw new BadRequestException('Tệp tải lên không hợp lệ.');
    }
    return {
      message: 'Tải lên tệp Excel thành công.',
      originalName: file.originalname,
      fileName: file.filename,
      url: `/api/upload/file/excels/${file.filename}`
    };
  }

  @Post('payment')
  @Roles('SinhVien', 'Khoa')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const dest = `${UPLOAD_DIR}/payments`;
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req: any, file: any, cb: any) => {
        const uniqueSuffix = crypto.randomUUID();
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `pay-${uniqueSuffix}${ext}`);
      }
    }),
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
  }))
  async uploadPayment(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/i }),
      ],
    })
  ) file: any) {
    if (!file) {
      throw new BadRequestException('Tệp tải lên không hợp lệ.');
    }
    return {
      message: 'Tải lên tệp minh chứng thanh toán thành công.',
      originalName: file.originalname,
      fileName: file.filename,
      url: `/api/upload/file/payments/${file.filename}`
    };
  }

  @Get('file/:type/:filename')
  async serveFile(
    @Param('type') type: string,
    @Param('filename') filename: string,
    @Res() res: any
  ) {
    if (filename.includes('..') || type.includes('..')) {
      throw new BadRequestException('Yêu cầu không hợp lệ.');
    }
    const safeTypes = ['reports', 'excels', 'payments'];
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
    if (['xlsx', 'xls', 'docx', 'doc'].some(x => ext.endsWith(x))) {
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
