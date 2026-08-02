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
} from '@nestjs/common';
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

  @Get('factories')
  async getFactories() {
    return this.khoaService.getFactories();
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

  @Get('students')
  async getStudents(@Query() query: GetStudentsQueryDto) {
    return this.khoaService.getStudents(
      query.page || 1,
      query.limit || 10,
      query.search,
    );
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
}

