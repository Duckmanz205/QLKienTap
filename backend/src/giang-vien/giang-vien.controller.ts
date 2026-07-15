import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { GiangVienService } from './giang-vien.service';

@Controller('giang-vien')
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
  async getGuidedReports(@Param('lecturerId', ParseIntPipe) lecturerId: number) {
    return this.gvService.getGuidedStudentReports(lecturerId);
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
