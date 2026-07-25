import { Controller, Post, Body, Get, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser, JwtPayloadUser } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { ten_dang_nhap: string; mat_khau: string }) {
    return this.authService.login(body.ten_dang_nhap, body.mat_khau);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: { oldPass: string; newPass: string },
  ) {
    return this.authService.changePassword(
      user.sub,
      body.oldPass,
      body.newPass,
    );
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getMyProfile(@CurrentUser() user: JwtPayloadUser) {
    return this.authService.getProfile(user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('profile/:userId')
  async getProfile(@CurrentUser() user: JwtPayloadUser) {
    // Luon tra ve profile cua user dang dang nhap de chong IDOR
    return this.authService.getProfile(user.sub);
  }

  @UseGuards(AuthGuard)
  @Put('profile')
  async updateMyProfile(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: { sdt: string; email: string },
  ) {
    return this.authService.updateProfile(user.sub, body.sdt, body.email);
  }

  @UseGuards(AuthGuard)
  @Put('profile/:userId')
  async updateProfile(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: { sdt: string; email: string },
  ) {
    // Luon cap nhat profile cua user dang dang nhap de chong IDOR
    return this.authService.updateProfile(user.sub, body.sdt, body.email);
  }
}
