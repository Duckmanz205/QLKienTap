import { Injectable, NestMiddleware } from '@nestjs/common';
import { RoleDataSourceService } from './role-datasource.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleContextMiddleware implements NestMiddleware {
  constructor(
    private readonly roleDataSourceService: RoleDataSourceService,
    private readonly jwtService: JwtService,
  ) {}

  use(req: any, res: any, next: () => void) {
    let role: string | undefined = undefined;
    let userId: number | undefined = undefined;

    // 1. Trích xuất Role từ Authorization Bearer Token
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded: any = this.jwtService.decode(token);
        if (decoded) {
          role = decoded.role || decoded.vai_tro;
          userId = decoded.sub || decoded.id;
        }
      } catch {
        // bỏ qua lỗi decode token
      }
    }

    // 2. Fallback dựa trên routing URL nếu chưa có token (hoặc trước khi guard chạy)
    if (!role) {
      const url = req.originalUrl || req.url || '';
      if (url.includes('/khoa/clb')) {
        role = 'QuanLyCLB';
      } else if (url.includes('/khoa/quan-ly-khoa') || url.includes('/khoa/')) {
        role = 'QuanLyKhoa';
      } else if (url.includes('/giang-vien')) {
        role = 'GiangVien';
      } else if (url.includes('/sinh-vien')) {
        role = 'SinhVien';
      }
    }

    this.roleDataSourceService.runWithContext({ role, userId }, () => {
      next();
    });
  }
}
