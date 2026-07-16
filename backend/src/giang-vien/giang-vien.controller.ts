import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { GiangVienService } from './giang-vien.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('giang-vien')
@UseGuards(AuthGuard, RolesGuard)
@Roles('GiangVien')
export class GiangVienController {
  constructor(private readonly gvService: GiangVienService) {}

  @Get('profile/:accountId')
  async getProfile(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.gvService.getLecturerByAccountId(accountId);
  }

  @Get('guided-students/:lecturerId')
  async getGuidedStudents(@Param('lecturerId', ParseIntPipe) lecturerId: number) {
    return this.gvService.getGuidedStudents(lecturerId);
  }

  @Get('led-trips/:lecturerId')
  async getLedTrips(@Param('lecturerId', ParseIntPipe) lecturerId: number) {
    return this.gvService.getLedTrips(lecturerId);
  }

  @Get('trip-registrations/:tripId')
  async getTripRegistrations(@Param('tripId', ParseIntPipe) tripId: number) {
    return this.gvService.getTripRegistrations(tripId);
  }

  @Post('take-attendance')
  async takeAttendance(
    @Body() body: {
      lecturerId: number;
      tripId: number;
      records: { phieuId: number; status: string; note?: string }[];
    },
  ) {
    return this.gvService.takeAttendance(body.lecturerId, body.tripId, body.records);
  }

  @Post('grade-prep-bonus')
  async gradePrepAndBonus(
    @Body() body: {
      lecturerId: number;
      phieuId: number;
      diemChuanBi: number;
      diemCong: number;
    },
  ) {
    return this.gvService.gradePrepAndBonus(
      body.lecturerId,
      body.phieuId,
      body.diemChuanBi,
      body.diemCong,
    );
  }

  @Get('guided-reports/:lecturerId')
  async getGuidedReports(
    @Param('lecturerId', ParseIntPipe) lecturerId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.gvService.getGuidedStudentReports(
      lecturerId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
      status,
    );
  }

  @Post('grade-report')
  async gradeReport(
    @Body() body: {
      lecturerId: number;
      reportId: number;
      score: number;
      comment: string;
    },
  ) {
    return this.gvService.gradeReport(body.lecturerId, body.reportId, body.score, body.comment);
  }

  @Get('board-sessions/:lecturerId')
  async getBoardSessions(@Param('lecturerId', ParseIntPipe) lecturerId: number) {
    return this.gvService.getBoardSessions(lecturerId);
  }

  @Post('submit-board-score')
  async submitBoardScore(
    @Body() body: {
      lecturerId: number;
      memberId: number;
      phieuId: number;
      score: number;
    },
  ) {
    return this.gvService.submitBoardScore(
      body.lecturerId,
      body.memberId,
      body.phieuId,
      body.score,
    );
  }
}
