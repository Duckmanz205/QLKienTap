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
  Patch,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KhoaService } from '../shared/khoa.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { TaskQueueService } from '../../queue/task-queue.service';
import {
  CreateFactoryDto,
  UpdateFactoryDto,
  ImportStudentsDto,
  CreateTripDto,
  ApproveTripDto,
  ApproveCancelDto,
  FilterAssignStudentsDto,
  ApproveRefundDto,
  CreateKhoaNotificationDto,
  CreateScheduleDto,
  ExportStudentListDto,
  GetStudentsQueryDto,
  GetRegistrationsQueryDto,
  GetRefundRequestsQueryDto,
  CreateStudentDto,
  UpdateStudentDto,
  GetEnrollmentsQueryDto,
  AssignGvddDto,
  LockGradesDto,
} from '../shared/dto/khoa.dto';

@Controller('clb')
@UseGuards(AuthGuard, RolesGuard)
@Roles('QuanLyCLB')
export class ClbController {
  constructor(
    private readonly khoaService: KhoaService,
    private readonly taskQueueService: TaskQueueService,
  ) { }

  @Get('factories')
  async getFactories() {
    return this.khoaService.getFactories();
  }

  @Get('factories/industry-groups')
  async getFactoryIndustryGroups() {
    return this.khoaService.getFactoryIndustryGroups();
  }

  @Get('campaigns')
  async getCampaigns() {
    return this.khoaService.getCampaigns();
  }

  @Get('courses')
  async getCourses() {
    return this.khoaService.getCourses();
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



  @Get('trips')
  async getTrips() {
    return this.khoaService.getTrips();
  }

  @Get('proposals')
  async getProposals() {
    return this.khoaService.getProposals();
  }

  @Post('trips')
  async createTrip(@Body() body: CreateTripDto) {
    return this.khoaService.createTrip(body);
  }

  @Put('trips/:id')
  async updateTrip(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.khoaService.updateTrip(id, body);
  }

  @Delete('trips/:id')
  async deleteTrip(@Param('id', ParseIntPipe) id: number) {
    return this.khoaService.deleteTrip(id);
  }
  @Patch('trips/:id/reopen')
  async reopenTripRegistration(@Param('id', ParseIntPipe) id: number) {
    return this.khoaService.reopenTripRegistration(id);
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

  @Get('lecturers')
  async getLecturers() {
    return this.khoaService.getLecturers();
  }

  @Post('assign-gvdd')
  async assignGvdd(@Body() body: AssignGvddDto) {
    return this.khoaService.assignTourLeader(
      body.tripId,
      body.lecturerId,
      body.laTruongDoan,
    );
  }

  @Delete('assign-gvdd/:tripId/:lecturerId')
  async unassignGvdd(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('lecturerId', ParseIntPipe) lecturerId: number,
  ) {
    return this.khoaService.unassignTourLeader(tripId, lecturerId);
  }

  @Post('auto-assign-gvdd')
  async autoAssignGvdd() {
    return this.khoaService.autoAssignGvdd();
  }

  @Post('approve-cancel')
  async approveCancel(@Body() body: ApproveCancelDto) {
    return this.khoaService.approveCancelRequest(
      body.requestId,
      body.approverId,
      body.isApproved,
    );
  }

  @Post('preview-assign-students')
  async previewAssignStudents(@Body() body: FilterAssignStudentsDto) {
    return this.khoaService.previewAssignStudents(body.tripId);
  }

  @Post('confirm-assign-students')
  async confirmAssignStudents(@Body() body: { tripId: number, acceptedStudentIds: number[], deadlineDate?: string }) {
    return this.khoaService.confirmAssignStudents(body.tripId, body.acceptedStudentIds, body.deadlineDate);
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
      query.hasCancelRequest,
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

  @Post('confirm-payment/:id')
  async confirmManualPayment(@Param('id') id: number) {
    return this.khoaService.confirmManualPayment(id);
  }


  @Get('config')
  async getConfig() {
    return this.khoaService.getTaiKhoanThuHuong();
  }

  @Post('config')
  async saveConfig(@Body() body: any) {
    return this.khoaService.saveTaiKhoanThuHuong(body);
  }

  @Post('upload-payments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPayments(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return this.khoaService.uploadPaidStudents(file.buffer);
  }

  @Get('schedules')
  async getSchedules() {
    return this.khoaService.getSchedules('QuanLyCLB');
  }

  @Post('schedules')
  async createSchedule(@Body() body: CreateScheduleDto) {
    return this.khoaService.createSchedule(body);
  }

  @Put('schedules/:id')
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateScheduleDto,
  ) {
    return this.khoaService.updateSchedule(id, body);
  }

  @Delete('schedules/:id')
  async deleteSchedule(@Param('id', ParseIntPipe) id: number) {
    return this.khoaService.deleteSchedule(id);
  }

  @Post('schedules/:id/submit')
  async submitSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ) {
    return this.khoaService.submitScheduleForApproval(id, req.user?.sub || req.user?.id);
  }

  @Post('lock-grades')
  async lockGrades(@Body() body: LockGradesDto) {
    return this.khoaService.lockAndFinalizeGrades(
      body.termStudentId,
      body.userId,
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
}
