import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { TaiKhoan, SinhVien, GiangVien } from '../entities/qlkt.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private failedAttempts = new Map<string, { count: number; lockUntil: Date | null }>();

  constructor(
    @InjectRepository(TaiKhoan)
    private taiKhoanRepo: Repository<TaiKhoan>,
    @InjectRepository(SinhVien)
    private sinhVienRepo: Repository<SinhVien>,
    @InjectRepository(GiangVien)
    private giangVienRepo: Repository<GiangVien>,
    private jwtService: JwtService,
  ) {}

  async login(ten_dang_nhap: string, mat_khau: string) {
    if (!ten_dang_nhap || !mat_khau) {
      throw new BadRequestException('Vui lòng nhập đầy đủ thông tin');
    }

    const now = new Date();
    const failedInfo = this.failedAttempts.get(ten_dang_nhap);
    if (failedInfo && failedInfo.lockUntil && failedInfo.lockUntil > now) {
      const remainingSeconds = Math.ceil((failedInfo.lockUntil.getTime() - now.getTime()) / 1000);
      throw new UnauthorizedException(`Tài khoản của bạn đã bị khóa tạm thời trong 5 phút do nhập sai 5 lần liên tiếp. Vui lòng thử lại sau ${remainingSeconds} giây.`);
    }

    const user = await this.taiKhoanRepo.findOne({ where: { ten_dang_nhap } });

    const recordFailedAttempt = () => {
      const current = this.failedAttempts.get(ten_dang_nhap) || { count: 0, lockUntil: null };
      current.count += 1;
      if (current.count >= 5) {
        current.lockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes lock
        this.failedAttempts.set(ten_dang_nhap, current);
        throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác. Tài khoản của bạn đã bị khóa tạm thời trong 5 phút do nhập sai 5 lần liên tiếp.');
      } else {
        this.failedAttempts.set(ten_dang_nhap, current);
        throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
      }
    };

    if (!user) {
      recordFailedAttempt();
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    if (user.trang_thai === 'KhoaTaiKhoan') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản lý Khoa');
    }

    const isPasswordValid = await bcrypt.compare(mat_khau, user.mat_khau_hash);
    if (!isPasswordValid) {
      recordFailedAttempt();
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    this.failedAttempts.delete(ten_dang_nhap);

    user.lan_dang_nhap_cuoi = new Date();
    await this.taiKhoanRepo.save(user);

    let details: any = null;
    if (user.vai_tro === 'SinhVien') {
      details = await this.sinhVienRepo.findOne({
        where: { taikhoan_id: user.id },
        relations: { khoa: true },
      });
    } else if (user.vai_tro === 'GiangVien') {
      details = await this.giangVienRepo.findOne({
        where: { taikhoan_id: user.id },
      });
    }

    const payload = { sub: user.id, username: user.ten_dang_nhap, role: user.vai_tro };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        ten_dang_nhap: user.ten_dang_nhap,
        vai_tro: user.vai_tro,
        phai_doi_mat_khau: user.phai_doi_mat_khau,
        details,
      },
    };
  }

  async changePassword(userId: number, oldPass: string, newPass: string) {
    const user = await this.taiKhoanRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    const isOldPassValid = await bcrypt.compare(oldPass, user.mat_khau_hash);
    if (!isOldPassValid) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPass)) {
      throw new BadRequestException('Mật khẩu mới phải đạt độ phức tạp tối thiểu (tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số).');
    }

    const salt = await bcrypt.genSalt(10);
    user.mat_khau_hash = await bcrypt.hash(newPass, salt);
    user.phai_doi_mat_khau = false;
    await this.taiKhoanRepo.save(user);

    return { message: 'Đổi mật khẩu thành công' };
  }

  async getProfile(userId: number) {
    const user = await this.taiKhoanRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    let details: any = null;
    if (user.vai_tro === 'SinhVien') {
      details = await this.sinhVienRepo.findOne({
        where: { taikhoan_id: user.id },
        relations: { khoa: true },
      });
    } else if (user.vai_tro === 'GiangVien') {
      details = await this.giangVienRepo.findOne({
        where: { taikhoan_id: user.id },
      });
    }

    return {
      id: user.id,
      ten_dang_nhap: user.ten_dang_nhap,
      vai_tro: user.vai_tro,
      details,
    };
  }

  async updateProfile(userId: number, sdt: string, email: string) {
    const user = await this.taiKhoanRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    if (user.vai_tro === 'SinhVien') {
      const sv = await this.sinhVienRepo.findOne({ where: { taikhoan_id: userId } });
      if (sv) {
        sv.sdt = sdt;
        sv.email = email;
        await this.sinhVienRepo.save(sv);
      }
    } else if (user.vai_tro === 'GiangVien') {
      const gv = await this.giangVienRepo.findOne({ where: { taikhoan_id: userId } });
      if (gv) {
        gv.sdt = sdt;
        gv.email = email;
        await this.giangVienRepo.save(gv);
      }
    }

    return { message: 'Cập nhật thông tin thành công' };
  }
}
