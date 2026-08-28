import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { CurrentUser, JwtPayloadUser } from '../auth/decorators/user.decorator';
import { KhoaService } from './khoa.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TaskQueueService } from '../queue/task-queue.service';
import {
  CreateYearDto,
  CreateTermDto,
  CreateCourseDto,
  CreateFactoryDto,
  UpdateFactoryDto,
  CreateCampaignDto,
  CreateScheduleDto,
  ImportStudentsDto,
  CreateTripDto,
  ApproveTripDto,
  ApproveCancelDto,
  FilterAssignStudentsDto,
  AssignGvhdDto,
  AssignGvddDto,
  CreateBoardDto,
  AddBoardMemberDto,
  LockGradesDto,
  ApproveRefundDto,
  CreateKhoaNotificationDto,
  ExportStudentListDto,
  GetStudentsQueryDto,
  GetRegistrationsQueryDto,
  GetRefundRequestsQueryDto,
  GetEnrollmentsQueryDto,
  CreateStudentDto,
  UpdateStudentDto,
  GetAccountsQueryDto,
  CreateLecturerDto,
  UpdateLecturerDto,
} from './dto/khoa.dto';

@Controller('khoa')
@UseGuards(AuthGuard, RolesGuard)
@Roles('QuanLyKhoa', 'Khoa')
export class KhoaController {
  constructor(
    private readonly khoaService: KhoaService,
    private readonly taskQueueService: TaskQueueService,
  ) {}

  @Get('years')
  async getYears() {
    return this.khoaService.getYears();
  }

  @Post('years')
  async createYear(@Body() body: CreateYearDto) {
    return this.khoaService.createYear(body);
  }

  @Get('terms')
  async getTerms() {
    return this.khoaService.getTerms();
  }

  @Post('terms')
  async createTerm(@Body() body: CreateTermDto) {
    return this.khoaService.createTerm(body);
  }

  @Get('courses')
  async getCourses() {
    return this.khoaService.getCourses();
  }

  @Post('courses')
  async createCourse(@Body() body: CreateCourseDto) {
    return this.khoaService.createCourse(body);
  }

  @Put('years/:id')
  async updateYear(@Param('id') id: number, @Body() body: Partial<any>) {
    return this.khoaService.updateYear(+id, body);
  }
  @Delete('years/:id')
  async deleteYear(@Param('id') id: number) {
    return this.khoaService.deleteYear(+id);
  }

  @Put('terms/:id')
  async updateTerm(@Param('id') id: number, @Body() body: Partial<any>) {
    return this.khoaService.updateTerm(+id, body);
  }
  @Delete('terms/:id')
  async deleteTerm(@Param('id') id: number) {
    return this.khoaService.deleteTerm(+id);
  }

  @Put('courses/:id')
  async updateCourse(@Param('id') id: number, @Body() body: Partial<any>) {
    return this.khoaService.updateCourse(+id, body);
  }
  @Delete('courses/:id')
  async deleteCourse(@Param('id') id: number) {
    return this.khoaService.deleteCourse(+id);
  }

  @Get('factories')
  async getFactories() {
    return this.khoaService.getFactories();
  }

  @Get('factories/industry-groups')
  async getFactoryIndustryGroups() {
    return this.khoaService.getFactoryIndustryGroups();
  }

  @Post('factories')
  async createFactory(@Body() body: CreateFactoryDto) {
    return this.khoaService.createFactory(body);
  }

  @Put('factories/:id')
  async updateFactory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFactoryDto,
  ) {
    return this.khoaService.updateFactory(id, body);
  }

  @Get('lecturers')
  async getLecturers() {
    return this.khoaService.getLecturers();
  }

  @Post('lecturers')
  async createLecturer(@Body() body: CreateLecturerDto) {
    return this.khoaService.createLecturer(body);
  }

  @Put('lecturers/:id')
  async updateLecturer(@Param('id') id: number, @Body() body: UpdateLecturerDto) {
    return this.khoaService.updateLecturer(+id, body);
  }

  @Patch('lecturers/:id/board-eligibility')
  async updateLecturerBoardEligibility(@Param('id') id: number, @Body('du_dk_hoi_dong') duDkHoiDong: boolean) {
    return this.khoaService.updateLecturerBoardEligibility(+id, duDkHoiDong);
  }

  @Get('students')
  async getStudents(@Query() query: GetStudentsQueryDto) {
    return this.khoaService.getStudents(
      query.page || 1,
      query.limit || 10,
      query.search,
    );
  }

  @Post('students')
  async createStudent(@Body() body: CreateStudentDto) {
    return this.khoaService.createStudent(body);
  }

  @Put('students/:id')
  async updateStudent(@Param('id') id: number, @Body() body: UpdateStudentDto) {
    return this.khoaService.updateStudent(+id, body);
  }

  @Delete('students/:id')
  async deleteStudent(@Param('id') id: number) {
    return this.khoaService.deleteStudent(+id);
  }

  @Get('accounts')
  async getAccounts(@Query() query: GetAccountsQueryDto) {
    return this.khoaService.getAccounts(
      query.page || 1, query.limit || 15, query.search, query.vaiTro, query.trangThai,
    );
  }

  @Post('accounts/:id/toggle-lock')
  async toggleAccountLock(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    if (id === user.sub) {
      throw new BadRequestException('Không thể tự khóa tài khoản của chính mình');
    }
    return this.khoaService.toggleAccountLock(id);
  }

  @Post('accounts/:id/reset-password')
  async resetAccountPassword(@Param('id', ParseIntPipe) id: number) {
    return this.khoaService.resetAccountPassword(id);
  }

  @Get('campaigns')
  async getCampaigns() {
    return this.khoaService.getCampaigns();
  }

  @Post('campaigns')
  async createCampaign(@Body() body: CreateCampaignDto) {
    return this.khoaService.createCampaign(body);
  }

  @Get('schedules')
  async getSchedules() {
    return this.khoaService.getSchedules();
  }

  @Post('schedules')
  async createSchedule(@Body() body: CreateScheduleDto) {
    return this.khoaService.createSchedule(body);
  }

  @Post('import-students')
  async importStudents(@Body() body: ImportStudentsDto) {
    return this.khoaService.importStudentsToSchedule(
      body.lichId,
      body.studentIds,
    );
  }

  @Get('trips')
  async getTrips() {
    return this.khoaService.getTrips();
  }

  @Post('trips')
  async createTrip(@Body() body: CreateTripDto) {
    return this.khoaService.createTrip(body);
  }

  @Post('approve-trip')
  async approveTrip(@Body() body: ApproveTripDto) {
    if (body.registrationId) {
      const isApproved = body.hanhDong === 'DuyetThanhToan';
      return this.khoaService.approveRegistrationPayment(
        body.registrationId,
        isApproved,
      );
    }
    return this.khoaService.approveProposeTrip(
      body.tripId!,
      body.approverId!,
      body.isApproved!,
    );
  }

  @Post('approve-cancel')
  async approveCancel(@Body() body: ApproveCancelDto) {
    return this.khoaService.approveCancelRequest(
      body.requestId,
      body.approverId,
      body.isApproved,
    );
  }

  @Post('filter-assign-students')
  async filterAssignStudents(@Body() body: FilterAssignStudentsDto) {
    return this.khoaService.filterAndAssignStudents(body.tripId);
  }

  @Post('assign-gvhd')
  async assignGvhd(@Body() body: AssignGvhdDto) {
    return this.khoaService.assignLecturerGuide(
      body.lichKienTapSinhVienId,
      body.lecturerId,
    );
  }

  @Post('assign-gvdd')
  async assignGvdd(@Body() body: AssignGvddDto) {
    return this.khoaService.assignTourLeader(
      body.tripId,
      body.lecturerId,
      body.laTruongDoan,
    );
  }

  @Post('create-board')
  async createBoard(@Body() body: CreateBoardDto) {
    return this.khoaService.createBoard(
      body.scheduleId,
      body.name,
      body.date,
      body.room,
    );
  }

  @Post('add-board-member')
  async addBoardMember(@Body() body: AddBoardMemberDto) {
    return this.khoaService.addBoardMember(
      body.boardId,
      body.lecturerId,
      body.role,
    );
  }

  @Post('lock-grades')
  async lockGrades(@Body() body: LockGradesDto) {
    return this.khoaService.lockAndFinalizeGrades(
      body.termStudentId,
      body.userId,
    );
  }

  @Get('retake-students-report')
  async getRetakeStudentsReport() {
    return this.khoaService.getRetakeStudentsReport();
  }

  @Get('final-results-report/:lichKienTapId')
  async getFinalResultsReport(
    @Param('lichKienTapId', ParseIntPipe) lichKienTapId: number,
  ) {
    return this.khoaService.getFinalResultsReport(lichKienTapId);
  }

  @Get('report/visited-students')
  async getVisitedStudentsReport(
    @Query('lichKienTapId') lichKienTapId?: string,
  ) {
    return this.khoaService.getVisitedStudentsReport(lichKienTapId ? parseInt(lichKienTapId) : undefined);
  }

  @Get('report/not-visited-students')
  async getNotVisitedStudentsReport(
    @Query('lichKienTapId') lichKienTapId?: string,
  ) {
    return this.khoaService.getNotVisitedStudentsReport(lichKienTapId ? parseInt(lichKienTapId) : undefined);
  }

  @Get('report/eligible-students')
  async getEligibleStudentsReport(
    @Query('lichKienTapId') lichKienTapId?: string,
  ) {
    return this.khoaService.getEligibleStudentsReport(lichKienTapId ? parseInt(lichKienTapId) : undefined);
  }

  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.khoaService.getDashboardStats();
  }

  @Get('registrations')
  async getRegistrations(@Query() query: GetRegistrationsQueryDto) {
    return this.khoaService.getRegistrations(
      query.page || 1,
      query.limit || 10,
      query.search,
      query.status,
      query.lichKienTapId,
      query.chuyenThamQuanId,
    );
  }

  @Get('refund-requests')
  async getRefundRequests(@Query() query: GetRefundRequestsQueryDto) {
    return this.khoaService.getRefundRequests(
      query.page || 1,
      query.limit || 10,
      query.search,
    );
  }

  @Post('approve-refund')
  async approveRefund(@Body() body: ApproveRefundDto) {
    return this.khoaService.approveRefund(
      body.refundId,
      body.approverId,
      body.isApproved,
    );
  }

  @Get('enrollments')
  async getEnrollments(@Query() query: GetEnrollmentsQueryDto) {
    return this.khoaService.getEnrollments(
      query.page || 1,
      query.limit || 10,
      query.search,
      query.lichKienTapId,
    );
  }

  @Get('notifications')
  async getNotifications() {
    return this.khoaService.getNotifications();
  }

  @Post('notifications')
  async createNotification(@Body() body: CreateKhoaNotificationDto) {
    return this.khoaService.createNotification(body);
  }

  @Post('export-student-list')
  async exportStudentList(@Body() body: ExportStudentListDto) {
    const fileName = `student_export_${Date.now()}.xlsx`;

    // Add job to background queue
    await this.taskQueueService.addJob('export-file', {
      type: 'student_list',
      filter: { campaignId: body.campaignId },
      outputFileName: fileName,
    });

    return {
      message: 'Yêu cầu xuất file đã được đưa vào hàng đợi xử lý nền.',
      fileName,
      downloadUrl: `/api/upload/file/excels/${fileName}`,
    };
  }

  @Post('bulk-confirm-payments')
  async bulkConfirmPayments(@Body('records') records: any[]) {
    return this.khoaService.bulkConfirmPayments(records);
  }
}
