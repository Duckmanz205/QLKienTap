import { Controller, Get, Post, Param, ParseIntPipe, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { KhoaService } from '../shared/khoa.service';
import { GetAccountsQueryDto } from '../shared/dto/khoa.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser, JwtPayloadUser } from '../../auth/decorators/user.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Controller('qtv')
export class QtvController {
  constructor(private readonly khoaService: KhoaService) {}

  @Roles('QuanTriVienHeThong')
  @Get('account')
  async getAccounts(@Query() query: GetAccountsQueryDto) {
    return this.khoaService.getAccounts(
      query.page || 1, query.limit || 15, query.search, query.vaiTro, query.trangThai,
    );
  }

  @Roles('QuanTriVienHeThong')
  @Post('account/:id/toggle-lock')
  async toggleAccountLock(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    if (id === user.sub) {
      throw new BadRequestException('Không thể tự khóa tài khoản của chính mình');
    }
    return this.khoaService.toggleAccountLock(id);
  }

  @Roles('QuanTriVienHeThong')
  @Post('account/:id/reset-password')
  async resetAccountPassword(@Param('id', ParseIntPipe) id: number) {
    return this.khoaService.resetAccountPassword(id);
  }
}
