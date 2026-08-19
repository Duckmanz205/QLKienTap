import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
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
  MarkNotificationReadDto,
  SubmitReportDto,
  SelectRepresentativeTripsDto,
} from './dto/sinh-vien.dto';

@Controller('sinh-vien')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SinhVien')
export class SinhVienController {
  constructor(private readonly svService: SinhVienService) {}

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

  @Get('factories')
  async getFactories() {
    return this.svService.getFactories();
  }

  @Get('available-trips')
  async getMyAvailableTrips(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getAvailableTrips(student.id);
  }

  @Get('available-trips/:studentId')
  async getAvailableTrips(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getAvailableTrips(student.id);
  }

  @Get('registered-trips')
  async getMyRegisteredTrips(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getStudentRegisteredTrips(student.id);
  }

  @Get('registered-trips/:studentId')
  async getRegisteredTrips(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getStudentRegisteredTrips(student.id);
  }

  @Post('register')
  async registerTrip(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: RegisterTripDto,
  ) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.registerTrip(student.id, body.tripId);
  }

  @Post('propose-trip')
  async proposeTrip(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: ProposeTripDto,
  ) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.proposeTrip(
      student.id,
      body.nhaMayId,
      body.ngayThamQuan,
      body.gioBatDau,
      body.gioKetThuc,
      body.hinhThuc,
    );
  }

  @Post('request-cancel')
  async requestCancel(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: RequestCancelDto,
  ) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.requestCancel(
      student.id,
      body.registrationId,
      body.lyDo,
      body.fileMinhChung || '',
    );
  }

  @Get('invoices')
  async getMyInvoices(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getInvoices(student.id);
  }

  @Get('invoices/:studentId')
  async getInvoices(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getInvoices(student.id);
  }

  @Post('pay-invoice/:invoiceId')
  async payInvoice(
    @CurrentUser() user: JwtPayloadUser,
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
  ) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.payInvoiceForStudent(student.id, invoiceId);
  }

  @Post('request-refund')
  async requestRefund(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: RequestRefundDto,
  ) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.requestRefundForStudent(
      student.id,
      body.invoiceId,
      body.fileScanUrl,
    );
  }

  @Get('refund-requests')
  async getMyRefundRequests(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getRefundRequests(student.id);
  }

  @Get('refund-requests/:studentId')
  async getRefundRequests(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getRefundRequests(student.id);
  }

  @Get('notifications')
  async getMyNotifications(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getNotifications(student.id);
  }

  @Get('notifications/:studentId')
  async getNotifications(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getNotifications(student.id);
  }

  @Post('mark-notification-read')
  async markNotificationRead(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: MarkNotificationReadDto,
  ) {
    return this.svService.markNotificationRead(user.sub, body.notifId);
  }

  @Post('submit-report')
  async submitReport(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: SubmitReportDto,
  ) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.submitReport(
      student.id,
      body.registrationId,
      body.fileBaoCaoUrl,
      body.fileXacNhanUrl,
    );
  }

  @Post('select-representative-trips')
  async selectRepresentativeTrips(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: SelectRepresentativeTripsDto,
  ) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.selectRepresentativeTrips(
      student.id,
      body.termStudentId,
      body.registrationIds,
    );
  }

  @Get('grades')
  async getMyGrades(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getStudentGrades(student.id);
  }

  @Get('grades/:studentId')
  async getGrades(@CurrentUser() user: JwtPayloadUser) {
    const student = await this.svService.getStudentByAccountId(user.sub);
    return this.svService.getStudentGrades(student.id);
  }
}
