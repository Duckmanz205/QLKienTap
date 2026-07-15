import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaiKhoan, SinhVien, GiangVien } from '../entities/qlkt.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TaiKhoan)
    private taiKhoanRepo: Repository<TaiKhoan>,
    @InjectRepository(SinhVien)
    private sinhVienRepo: Repository<SinhVien>,
    @InjectRepository(GiangVien)
    private giangVienRepo: Repository<GiangVien>,
  ) {}

  async login(ten_dang_nhap: string, mat_khau: string) {
    const user = await this.taiKhoanRepo.findOne({ where: { ten_dang_nhap } });
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    if (user.trang_thai === 'KhoaTaiKhoan') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // Luu y: Trong moi truong thuc te su dung bcrypt. O day so sanh truc tiep mat khau
    // vi du lieu import dang luu dang plaintext hoac hash don gian.
    const isPasswordValid = 
      user.mat_khau_hash === mat_khau ||
      (user.mat_khau_hash === '$2b$10$hash_placeholder' && (
        (user.vai_tro === 'SinhVien' && mat_khau === 'SvHuit2025') ||
        (user.vai_tro === 'GiangVien' && mat_khau === 'GvHuit2025') ||
        (user.vai_tro === 'QuanLyKhoa' && mat_khau === 'AdminHuit2025')
      ));
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    // Cap nhat ngay dang nhap cuoi
    user.lan_dang_nhap_cuoi = new Date();
    await this.taiKhoanRepo.save(user);

    // Lay thong tin chi tiet tuy vai tro
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
      token: `mock-jwt-token-for-user-${user.id}`,
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

    if (user.mat_khau_hash !== oldPass) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    user.mat_khau_hash = newPass;
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
