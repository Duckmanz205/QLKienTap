import { Controller, Post, Body, Get, Param, Put, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { ten_dang_nhap: string; mat_khau: string }) {
    return this.authService.login(body.ten_dang_nhap, body.mat_khau);
  }

  @Post('change-password')
  async changePassword(
    @Body() body: { userId: number; oldPass: string; newPass: string },
  ) {
    return this.authService.changePassword(body.userId, body.oldPass, body.newPass);
  }

  @Get('profile/:userId')
  async getProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.authService.getProfile(userId);
  }

  @Put('profile/:userId')
  async updateProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { sdt: string; email: string },
  ) {
    return this.authService.updateProfile(userId, body.sdt, body.email);
  }
}
