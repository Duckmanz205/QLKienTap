import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SinhVienService } from './sinh-vien.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sinh-vien')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SinhVien')
export class SinhVienController {
  constructor(private readonly svService: SinhVienService) {}

  @Get('profile/:accountId')
  async getProfile(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.svService.getStudentByAccountId(accountId);
  }

  @Get('factories')
  async getFactories() {
    return this.svService.getFactories();
  }

  @Get('available-trips/:studentId')
  async getAvailableTrips(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.svService.getAvailableTrips(studentId);
  }

  @Get('registered-trips/:studentId')
  async getRegisteredTrips(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.svService.getStudentRegisteredTrips(studentId);
  }

  @Post('register')
  async registerTrip(@Body() body: { studentId: number; tripId: number }) {
    return this.svService.registerTrip(body.studentId, body.tripId);
  }

  @Post('propose-trip')
  async proposeTrip(
    @Body() body: {
      studentId: number;
      nhaMayId: number;
      ngayThamQuan: Date;
      gioBatDau: string;
      gioKetThuc: string;
      hinhThuc: string;
    },
  ) {
    return this.svService.proposeTrip(
      body.studentId,
      body.nhaMayId,
      body.ngayThamQuan,
      body.gioBatDau,
      body.gioKetThuc,
      body.hinhThuc,
    );
  }

  @Post('request-cancel')
  async requestCancel(
    @Body() body: {
      studentId: number;
      registrationId: number;
      lyDo: string;
      fileMinhChung: string;
    },
  ) {
    return this.svService.requestCancel(
      body.studentId,
      body.registrationId,
      body.lyDo,
      body.fileMinhChung,
    );
  }

  @Get('invoices/:studentId')
  async getInvoices(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.svService.getInvoices(studentId);
  }

  @Post('pay-invoice/:invoiceId')
  async payInvoice(@Param('invoiceId', ParseIntPipe) invoiceId: number) {
    return this.svService.payInvoice(invoiceId);
  }

  @Post('request-refund')
  async requestRefund(@Body() body: { invoiceId: number; fileScanUrl: string }) {
    return this.svService.requestRefund(body.invoiceId, body.fileScanUrl);
  }

  @Get('refund-requests/:studentId')
  async getRefundRequests(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.svService.getRefundRequests(studentId);
  }

  @Get('notifications/:studentId')
  async getNotifications(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.svService.getNotifications(studentId);
  }

  @Post('mark-notification-read')
  async markNotificationRead(@Body() body: { accountId: number; notifId: number }) {
    return this.svService.markNotificationRead(body.accountId, body.notifId);
  }

  @Post('submit-report')
  async submitReport(
    @Body() body: {
      studentId: number;
      registrationId: number;
      fileBaoCaoUrl: string;
      fileXacNhanUrl?: string;
    },
  ) {
    return this.svService.submitReport(
      body.studentId,
      body.registrationId,
      body.fileBaoCaoUrl,
      body.fileXacNhanUrl,
    );
  }

  @Post('select-representative-trips')
  async selectRepresentativeTrips(
    @Body() body: {
      studentId: number;
      termStudentId: number;
      registrationIds: number[];
    },
  ) {
    return this.svService.selectRepresentativeTrips(
      body.studentId,
      body.termStudentId,
      body.registrationIds,
    );
  }

  @Get('grades/:studentId')
  async getGrades(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.svService.getStudentGrades(studentId);
  }
}
