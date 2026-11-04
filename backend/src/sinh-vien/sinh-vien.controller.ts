import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { SinhVienService } from './sinh-vien.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtPayloadUser } from '../auth/decorators/user.decorator';
import {
  RegisterTripDto,
  ProposeTripDto,
  RequestCancelDto,
  RequestRefundDto,
  SubmitReportDto,
  SubmitConfirmationPaperDto,
  SelectRepresentativeTripsDto,
} from './dto/sinh-vien.dto';

@Controller('sinh-vien')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SinhVien')
export class SinhVienController {
  constructor(private readonly svService: SinhVienService) { }

  /**
   * Helper: Lấy profileId từ JWT payload (tiết kiệm 1 query DB trên mỗi request),
   * fallback gọi getStudentByAccountId nếu token cũ chưa có profileId.
   */
  private async resolveStudentId(user: JwtPayloadUser): Promise<number> {
    if (user.profileId) {
      return user.profileId;
    }
    const student = await this.svService.getStudentByAccountId(user.sub);
    return student.id;
  }

  @Get('profile')
  async getMyProfile(@CurrentUser() user: JwtPayloadUser) {
    return this.svService.getStudentByAccountId(user.sub);
  }

  @Get('profile/:accountId')
  async getProfile(
    @CurrentUser() user: JwtPayloadUser,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    // Ep buoc luon lay profile cua sinh vien dang dang nhap de chong IDOR
    return this.svService.getStudentByAccountId(user.sub);
  }

  @Get('factories/search')
  async searchFactories(@Query('q') query: string) {
    return this.svService.searchFactories(query || '');
  }

  @Get('factories')
  async getFactories() {
    return this.svService.getFactories();
  }

  @Get('available-trips')
  async getMyAvailableTrips(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getAvailableTrips(studentId);
  }

  @Get('available-trips/:studentId')
  async getAvailableTrips(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getAvailableTrips(studentId);
  }

  @Get('payment-config')
  async getPaymentConfig() {
    return this.svService.getPaymentConfig();
  }

  @Get('registered-trips')
  async getMyRegisteredTrips(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getStudentRegisteredTrips(studentId);
  }

  @Get('registered-trips/:studentId')
  async getRegisteredTrips(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getStudentRegisteredTrips(studentId);
  }

  @Get('trip-info/:tripId')
  async getTripInfo(
    @CurrentUser() user: JwtPayloadUser,
    @Param('tripId', ParseIntPipe) tripId: number,
  ) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getTripInfo(studentId, tripId);
  }

  @Get('proposal-portal-status')
  async getProposalPortalStatus(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getProposalPortalStatus(studentId);
  }

  @Get('proposals')
  async getMyProposals(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getStudentProposals(studentId);
  }

  @Delete('proposals/:id')
  async cancelProposal(
    @CurrentUser() user: JwtPayloadUser,
    @Param('id', ParseIntPipe) proposalId: number,
  ) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.cancelProposal(studentId, proposalId);
  }

  @Post('register')
  async registerTrip(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: RegisterTripDto,
  ) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.registerTrip(studentId, body.tripId);
  }

  @Post('propose-trip')
  async proposeTrip(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: ProposeTripDto,
  ) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.proposeTrip(
      studentId,
      body.ngayThamQuan,
      body.gioBatDau,
      body.hinhThuc,
      body.nhaMayId,
      body.tenNhaMayDeXuat,
      body.diaChiDeXuat,
      body.nguoiLienHeDeXuat,
      body.sdtLienHeDeXuat,
    );
  }

  @Post('request-cancel')
  async requestCancel(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: RequestCancelDto,
  ) {
    const studentId = await this.resolveStudentId(user);
    const regId = body.registrationId || body.dangKyId;
    if (!regId) {
      throw new BadRequestException('Mã phiếu đăng ký không hợp lệ');
    }
    return this.svService.requestCancel(
      studentId,
      regId,
      body.lyDo,
      body.fileMinhChung || '',
    );
  }

  @Get('invoices')
  async getMyInvoices(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getInvoices(studentId);
  }

  @Get('invoices/:studentId')
  async getInvoices(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getInvoices(studentId);
  }

  @Post('pay-invoice/:invoiceId')
  async payInvoice(
    @CurrentUser() user: JwtPayloadUser,
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
  ) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.payInvoiceForStudent(studentId, invoiceId);
  }

  @Post('request-refund')
  async requestRefund(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: RequestRefundDto,
  ) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.requestRefundForStudent(
      studentId,
      body.invoiceId,
      body.fileScanUrl,
      body.nganHangNhan,
      body.soTaiKhoanNhan,
      body.tenChuTaiKhoanNhan,
    );
  }

  @Get('refund-requests')
  async getMyRefundRequests(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getRefundRequests(studentId);
  }

  @Get('refund-requests/:studentId')
  async getRefundRequests(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getRefundRequests(studentId);
  }

  @Get('notifications')
  async getMyNotifications(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getNotifications(studentId);
  }

  @Get('notifications/:studentId')
  async getNotifications(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getNotifications(studentId);
  }

  @Post('submit-report')
  async submitReport(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: SubmitReportDto,
  ) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.submitReport(
      studentId,
      body.registrationId,
      body.fileBaoCaoUrl,
      body.fileXacNhanUrl,
      body.extractedText,
    );
  }

  @Post('submit-confirmation-paper')
  async submitConfirmationPaper(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: SubmitConfirmationPaperDto,
  ) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.submitConfirmationPaper(
      studentId,
      body.registrationId,
      body.fileXacNhanUrl,
    );
  }

  @Delete('report/:registrationId')
  async deleteReport(
    @CurrentUser() user: JwtPayloadUser,
    @Param('registrationId', ParseIntPipe) registrationId: number,
  ) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.deleteReport(studentId, registrationId);
  }

  @Get('representative-trips-status')
  async getRepresentativeTripsStatus(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getRepresentativeTripsStatus(studentId);
  }

  @Post('select-representative-trips')
  async selectRepresentativeTrips(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: SelectRepresentativeTripsDto,
  ) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.selectRepresentativeTrips(
      studentId,
      body.termStudentId,
      body.registrationIds,
    );
  }

  @Get('grades')
  async getMyGrades(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    try {
      return await this.svService.getStudentGrades(studentId);
    } catch (e) {
      console.error('API ERROR:', e);
      throw e;
    }
  }

  @Get('grades/:studentId')
  async getGrades(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    try {
      return await this.svService.getStudentGrades(studentId);
    } catch (e) {
      console.error('API FATAL ERROR:', e);
      throw e;
    }
  }

  @Get('dashboard-stats')
  async getMyDashboardStats(@CurrentUser() user: JwtPayloadUser) {
    const studentId = await this.resolveStudentId(user);
    return this.svService.getDashboardStats(studentId);
  }

  @Get('dashboard-stats/:studentId')
  async getDashboardStats(@CurrentUser() user: JwtPayloadUser) {
    // Luon lay stats cua sinh vien dang dang nhap de chong IDOR
    const studentId = await this.resolveStudentId(user);
    return this.svService.getDashboardStats(studentId);
  }
}
