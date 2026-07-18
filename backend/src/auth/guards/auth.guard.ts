import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaiKhoan } from '../../entities/qlkt.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(TaiKhoan)
    private taiKhoanRepo: Repository<TaiKhoan>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Yêu cầu token xác thực');
    }
    try {
      const secret = this.configService.get<string>('JWT_SECRET', 'default_secret_key_123456');
      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      // Query database to check latest user status
      const user = await this.taiKhoanRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }
      
      if (user.trang_thai === 'KhoaTaiKhoan') {
        throw new UnauthorizedException('Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản lý Khoa');
      }
      
      if (user.phai_doi_mat_khau && !request.url.includes('change-password')) {
        throw new UnauthorizedException('Bạn bắt buộc phải đổi mật khẩu ngay lần đăng nhập đầu tiên trước khi thao tác chức năng khác.');
      }

      // Attach user payload to request
      (request as any).user = {
        ...payload,
        phai_doi_mat_khau: user.phai_doi_mat_khau,
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
