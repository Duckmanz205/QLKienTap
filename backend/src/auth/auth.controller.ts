import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser, JwtPayloadUser } from './decorators/user.decorator';
import { LoginDto, ChangePasswordDto, UpdateProfileDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.ten_dang_nhap, body.mat_khau);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: ChangePasswordDto,
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
    @Body() body: UpdateProfileDto,
  ) {
    if (!body.sdt && !body.email) {
      throw new BadRequestException(
        'Request phải chứa ít nhất sdt hoặc email để cập nhật',
      );
    }
    return this.authService.updateProfile(user.sub, body.sdt, body.email);
  }

  @UseGuards(AuthGuard)
  @Put('profile/:userId')
  async updateProfile(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: UpdateProfileDto,
  ) {
    // Luon cap nhat profile cua user dang dang nhap de chong IDOR
    if (!body.sdt && !body.email) {
      throw new BadRequestException(
        'Request phải chứa ít nhất sdt hoặc email để cập nhật',
      );
    }
    return this.authService.updateProfile(user.sub, body.sdt, body.email);
  }
}
