import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { GiangVienService } from './giang-vien.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtPayloadUser } from '../auth/decorators/user.decorator';
import {
  TakeAttendanceDto,
  GradePrepBonusDto,
  GradePrepBonusBatchDto,
  GradeReportDto,
  SubmitBoardScoreDto,
  SubmitBoardScoresBatchDto,
  GuidedReportsQueryDto,
  LockTripPrepGradesDto,
  LockGuidedReportsGradesDto,
  LockCouncilGradeDto,
  UpdateCouncilStudentNoteDto,
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

  @Post('grade-prep-bonus-batch')
  async gradePrepAndBonusBatch(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: GradePrepBonusBatchDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.gradePrepAndBonusBatch(
      gv.id,
      body.tripId,
      body.records,
    );
  }

  @Get('prep-grades-template/:tripId')
  async getPrepGradesTemplate(
    @CurrentUser() user: JwtPayloadUser,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Res() res: Response,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    const { buffer, fileName } = await this.gvService.getPrepGradesTemplate(
      gv.id,
      tripId,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    res.send(buffer);
  }

  @Post('import-prep-grades-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importPrepGradesExcel(
    @CurrentUser() user: JwtPayloadUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('tripId') rawTripId: any,
    @Body('saveImmediately') rawSaveImmediately: any,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file Excel');
    }
    const tripId = parseInt(rawTripId, 10);
    if (isNaN(tripId) || tripId <= 0) {
      throw new BadRequestException('Mã chuyến tham quan (tripId) không hợp lệ');
    }
    const saveImmediately =
      rawSaveImmediately === true || rawSaveImmediately === 'true';
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.importPrepGradesExcel(
      gv.id,
      tripId,
      file.buffer,
      saveImmediately,
    );
  }

  @Post('lock-trip-prep-grades')
  async lockTripPrepGrades(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: LockTripPrepGradesDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.lockTripPrepGrades(gv.id, body.tripId);
  }

  @Post('lock-guided-reports-grades')
  async lockGuidedReportsGrades(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: LockGuidedReportsGradesDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.lockGuidedReportsGrades(gv.id, body.dotKienTapId);
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

  @Post('save-ai-grade')
  async saveAIGrade(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: GradeReportDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.saveAIGrade(
      gv.id,
      body.reportId,
      body.score,
      body.comment || '',
    );
  }

  @Post('bulk-grade-ai')
  async bulkGradeAi(
    @CurrentUser() user: JwtPayloadUser,
    @Body('reportIds') reportIds: number[],
  ) {
    if (!reportIds || !reportIds.length) {
      throw new BadRequestException('Danh sách bài thu hoạch không được trống');
    }
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    // Gọi hàm chạy ngầm (Fire-and-forget), không dùng await để tránh block frontend
    this.gvService.processBulkAiGradingInBackground(gv.id, reportIds).catch(err => {
      console.error('Lỗi khi chạy background chấm AI:', err);
    });
    return { message: 'Đã đưa danh sách bài vào hàng đợi chấm AI dưới nền' };
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

  @Post('submit-board-scores-batch')
  async submitBoardScoresBatch(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: SubmitBoardScoresBatchDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.submitBoardScoresBatch(
      gv.id,
      body.memberId,
      body.phieuIds,
      body.score,
    );
  }

  @Post('lock-council-grade')
  async lockCouncilGrade(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: LockCouncilGradeDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.lockCouncilGrade(gv.id, body);
  }

  @Put('council-student-note')
  async updateCouncilStudentNote(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: UpdateCouncilStudentNoteDto,
  ) {
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return this.gvService.updateCouncilStudentNote(gv.id, body);
  }

  @Get('notifications/:lecturerId')
  async getNotifications(@Param('lecturerId') lecturerId: number) {
    return this.gvService.getNotifications(+lecturerId);
  }

  @Get('dashboard-stats/:lecturerId')
  async getDashboardStats(@Param('lecturerId') lecturerId: number) {
    return this.gvService.getDashboardStats(+lecturerId);
  }
}
