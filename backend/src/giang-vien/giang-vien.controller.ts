import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GiangVienService } from './giang-vien.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtPayloadUser } from '../auth/decorators/user.decorator';
import {
  TakeAttendanceDto,
  GradePrepBonusDto,
  GradeReportDto,
  SubmitBoardScoreDto,
  GuidedReportsQueryDto,
} from './dto/giang-vien.dto';

@Controller('giang-vien')
@UseGuards(AuthGuard, RolesGuard)
@Roles('GiangVien')
export class GiangVienController {
  constructor(private readonly gvService: GiangVienService) {}

  @Get('profile')
  async getMyProfile(@CurrentUser() user: JwtPayloadUser) {
    return this.gvService.getLecturerByAccountId(user.sub);
  }

  @Get('profile/:accountId')
  async getProfile(@CurrentUser() user: JwtPayloadUser) {
    return this.gvService.getLecturerByAccountId(user.sub);
  }

  @Get('guided-students')
  async getMyGuidedStudents(@CurrentUser() user: JwtPayloadUser) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.getGuidedStudents(gv.id);
  }

  @Get('guided-students/:lecturerId')
  async getGuidedStudents(@CurrentUser() user: JwtPayloadUser) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.getGuidedStudents(gv.id);
  }

  @Get('led-trips')
  async getMyLedTrips(@CurrentUser() user: JwtPayloadUser) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.getLedTrips(gv.id);
  }

  @Get('led-trips/:lecturerId')
  async getLedTrips(@CurrentUser() user: JwtPayloadUser) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.getLedTrips(gv.id);
  }

  @Get('trip-registrations/:tripId')
  async getTripRegistrations(
    @CurrentUser() user: JwtPayloadUser,
    @Param('tripId', ParseIntPipe) tripId: number,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.getTripRegistrations(gv.id, tripId);
  }

  @Post('take-attendance')
  async takeAttendance(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: TakeAttendanceDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.takeAttendance(gv.id, body.tripId, body.records);
  }

  @Post('grade-prep-bonus')
  async gradePrepAndBonus(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: GradePrepBonusDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.gradePrepAndBonus(
      gv.id,
      body.phieuId,
      body.diemChuanBi,
      body.diemCong,
    );
  }

  @Get('guided-reports')
  async getMyGuidedReports(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: GuidedReportsQueryDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.getGuidedStudentReports(
      gv.id,
      query.page || 1,
      query.limit || 10,
      query.search,
      query.status,
    );
  }

  @Get('guided-reports/:lecturerId')
  async getGuidedReports(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: GuidedReportsQueryDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.getGuidedStudentReports(
      gv.id,
      query.page || 1,
      query.limit || 10,
      query.search,
      query.status,
    );
  }

  @Post('grade-report')
  async gradeReport(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: GradeReportDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.gradeReport(
      gv.id,
      body.reportId,
      body.score,
      body.comment || '',
    );
  }

  @Get('board-sessions')
  async getMyBoardSessions(@CurrentUser() user: JwtPayloadUser) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.getBoardSessions(gv.id);
  }

  @Get('board-sessions/:lecturerId')
  async getBoardSessions(@CurrentUser() user: JwtPayloadUser) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.getBoardSessions(gv.id);
  }

  @Post('submit-board-score')
  async submitBoardScore(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: SubmitBoardScoreDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.submitBoardScore(
      gv.id,
      body.memberId,
      body.phieuId,
      body.score,
    );
  }
}
