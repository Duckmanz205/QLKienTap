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

  /**
   * Helper: Lấy profileId từ JWT payload (tiết kiệm 1 query DB trên mỗi request),
   * fallback gọi getLecturerByAccountId nếu token cũ chưa có profileId.
   */
  private async resolveLecturerId(user: JwtPayloadUser): Promise<number> {
    if (user.profileId) {
      return user.profileId;
    }
    const gv = await this.gvService.getLecturerByAccountId(user.sub);
    return gv.id;
  }

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
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.getGuidedStudents(lecturerId);
  }

  @Get('guided-students/:lecturerId')
  async getGuidedStudents(@CurrentUser() user: JwtPayloadUser) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.getGuidedStudents(lecturerId);
  }

  @Get('led-trips')
  async getMyLedTrips(@CurrentUser() user: JwtPayloadUser) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.getLedTrips(lecturerId);
  }

  @Get('led-trips/:lecturerId')
  async getLedTrips(@CurrentUser() user: JwtPayloadUser) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.getLedTrips(lecturerId);
  }

  @Get('trip-registrations/:tripId')
  async getTripRegistrations(
    @CurrentUser() user: JwtPayloadUser,
    @Param('tripId', ParseIntPipe) tripId: number,
  ) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.getTripRegistrations(lecturerId, tripId);
  }

  @Post('take-attendance')
  async takeAttendance(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: TakeAttendanceDto,
  ) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.takeAttendance(lecturerId, body.tripId, body.records);
  }

  @Post('grade-prep-bonus')
  async gradePrepAndBonus(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: GradePrepBonusDto,
  ) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.gradePrepAndBonus(
      lecturerId,
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
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.gradePrepAndBonusBatch(
      lecturerId,
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
    const lecturerId = await this.resolveLecturerId(user);
    const { buffer, fileName } = await this.gvService.getPrepGradesTemplate(
      lecturerId,
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
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.importPrepGradesExcel(
      lecturerId,
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
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.lockTripPrepGrades(lecturerId, body.tripId);
  }

  @Post('lock-guided-reports-grades')
  async lockGuidedReportsGrades(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: LockGuidedReportsGradesDto,
  ) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.lockGuidedReportsGrades(lecturerId, body.dotKienTapId);
  }

  @Get('guided-reports')
  async getMyGuidedReports(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: GuidedReportsQueryDto,
  ) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.getGuidedStudentReports(
      lecturerId,
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
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.getGuidedStudentReports(
      lecturerId,
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
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.gradeReport(
      lecturerId,
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
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.saveAIGrade(
      lecturerId,
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
    const lecturerId = await this.resolveLecturerId(user);
    // Gọi hàm chạy ngầm (Fire-and-forget), không dùng await để tránh block frontend
    this.gvService.processBulkAiGradingInBackground(lecturerId, reportIds).catch(err => {
      console.error('Lỗi khi chạy background chấm AI:', err);
    });
    return { message: 'Đã đưa danh sách bài vào hàng đợi chấm AI dưới nền' };
  }

  @Post('evaluate-ai')
  async evaluateAi(
    @CurrentUser() user: JwtPayloadUser,
    @Body('document_text') documentText: string,
  ) {
    if (!documentText || documentText.trim().length < 50) {
      throw new BadRequestException(
        'Văn bản bài thu hoạch quá ngắn hoặc không hợp lệ để chấm AI (tối thiểu 50 ký tự).',
      );
    }
    await this.resolveLecturerId(user);
    return this.gvService.evaluateTextWithAi(documentText);
  }

  @Get('board-sessions')
  async getMyBoardSessions(@CurrentUser() user: JwtPayloadUser) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.getBoardSessions(lecturerId);
  }

  @Get('board-sessions/:lecturerId')
  async getBoardSessions(@CurrentUser() user: JwtPayloadUser) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.getBoardSessions(lecturerId);
  }

  @Post('submit-board-score')
  async submitBoardScore(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: SubmitBoardScoreDto,
  ) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.submitBoardScore(
      lecturerId,
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
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.submitBoardScoresBatch(
      lecturerId,
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
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.lockCouncilGrade(lecturerId, body);
  }

  @Put('council-student-note')
  async updateCouncilStudentNote(
    @CurrentUser() user: JwtPayloadUser,
    @Body() body: UpdateCouncilStudentNoteDto,
  ) {
    const lecturerId = await this.resolveLecturerId(user);
    return this.gvService.updateCouncilStudentNote(lecturerId, body);
  }

  @Get('notifications/:lecturerId')
  async getNotifications(
    @CurrentUser() user: JwtPayloadUser,
    @Param('lecturerId') lecturerId: number,
  ) {
    const resolvedId = await this.resolveLecturerId(user);
    return this.gvService.getNotifications(resolvedId);
  }

  @Get('dashboard-stats/:lecturerId')
  async getDashboardStats(
    @CurrentUser() user: JwtPayloadUser,
    @Param('lecturerId') lecturerId: number,
  ) {
    const resolvedId = await this.resolveLecturerId(user);
    return this.gvService.getDashboardStats(resolvedId);
  }
}
