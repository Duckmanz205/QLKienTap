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
import { CurrentUser, JwtPayloadUser } from '../../auth/decorators/user.decorator';
import { KhoaService } from '../shared/khoa.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { TaskQueueService } from '../../queue/task-queue.service';
import {
  CreateYearDto,
  CreateTermDto,
  CreateCourseDto,
  CreateFactoryDto,
  UpdateFactoryDto,
  CreateCampaignDto,
  UpdateCampaignDto,
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
} from '../shared/dto/khoa.dto';

@Controller('khoa')
@UseGuards(AuthGuard, RolesGuard)
@Roles('QuanLyKhoa')
export class KhoaController {
  constructor(
    private readonly khoaService: KhoaService,
    private readonly taskQueueService: TaskQueueService,
  ) {}

  @Roles('QuanLyKhoa')
  @Get('years')
  async getYears() {
    return this.khoaService.getYears();
  }

  @Roles('QuanLyKhoa')
  @Post('years')
  async createYear(@Body() body: CreateYearDto) {
    try {
      return await this.khoaService.createYear(body);
    } catch (error) {
      throw new BadRequestException(error.message || 'Lỗi tạo năm học');
    }
  }

  @Roles('QuanLyKhoa')
  @Get('terms')
  async getTerms() {
    return this.khoaService.getTerms();
  }

  @Roles('QuanLyKhoa')
  @Post('terms')
  async createTerm(@Body() body: CreateTermDto) {
    return this.khoaService.createTerm(body);
  }

  @Roles('QuanLyKhoa', 'QuanLyCLB')
  @Get('courses')
  async getCourses() {
    return this.khoaService.getCourses();
  }

  @Roles('QuanLyKhoa')
  @Post('courses')
  async createCourse(@Body() body: CreateCourseDto) {
    return this.khoaService.createCourse(body);
  }

  @Roles('QuanLyKhoa')
  @Put('years/:id')
  async updateYear(@Param('id') id: number, @Body() body: Partial<any>) {
    return this.khoaService.updateYear(+id, body);
  }
  @Roles('QuanLyKhoa')
  @Delete('years/:id')
  async deleteYear(@Param('id') id: number) {
    return this.khoaService.deleteYear(+id);
  }

  @Roles('QuanLyKhoa')
  @Put('terms/:id')
  async updateTerm(@Param('id') id: number, @Body() body: Partial<any>) {
    return this.khoaService.updateTerm(+id, body);
  }
  @Roles('QuanLyKhoa')
  @Delete('terms/:id')
  async deleteTerm(@Param('id') id: number) {
    return this.khoaService.deleteTerm(+id);
  }

  @Roles('QuanLyKhoa')
  @Put('courses/:id')
  async updateCourse(@Param('id') id: number, @Body() body: Partial<any>) {
    return this.khoaService.updateCourse(+id, body);
  }
  @Roles('QuanLyKhoa')
  @Delete('courses/:id')
  async deleteCourse(@Param('id') id: number) {
    return this.khoaService.deleteCourse(+id);
  }

  @Roles('QuanLyKhoa')
  @Get('factories')
  async getFactories() {
    return this.khoaService.getFactories();
  }

  @Roles('QuanLyKhoa')
  @Get('factories/industry-groups')
  async getFactoryIndustryGroups() {
    return this.khoaService.getFactoryIndustryGroups();
  }

  @Roles('QuanLyCLB')
  @Post('factories')
  async createFactory(@Body() body: CreateFactoryDto) {
    return this.khoaService.createFactory(body);
  }

  @Roles('QuanLyCLB')
  @Put('factories/:id')
  async updateFactory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFactoryDto,
  ) {
    return this.khoaService.updateFactory(id, body);
  }

  @Roles('QuanLyKhoa')
  @Get('lecturers')
  async getLecturers() {
    return this.khoaService.getLecturers();
  }

  @Roles('QuanLyKhoa')
  @Post('lecturers')
  async createLecturer(@Body() body: CreateLecturerDto) {
    return this.khoaService.createLecturer(body);
  }

  @Roles('QuanLyKhoa')
  @Put('lecturers/:id')
  async updateLecturer(@Param('id') id: number, @Body() body: UpdateLecturerDto) {
    return this.khoaService.updateLecturer(+id, body);
  }

  @Roles('QuanLyKhoa')
  @Patch('lecturers/:id/board-eligibility')
  async updateLecturerBoardEligibility(@Param('id') id: number, @Body('du_dk_hoi_dong') duDkHoiDong: boolean) {
    return this.khoaService.updateLecturerBoardEligibility(+id, duDkHoiDong);
  }

  @Roles('QuanLyKhoa')
  @Get('students/classes')
  async getUniqueClasses() {
    return this.khoaService.getUniqueClasses();
  }

  @Roles('QuanLyKhoa', 'QuanLyCLB')
  @Get('students')
  async getStudents(@Query() query: GetStudentsQueryDto) {
    return this.khoaService.getStudents(
      query.page || 1,
      query.limit || 10,
      query.search,
    );
  }

  @Roles('QuanLyKhoa')
  @Post('students')
  async createStudent(@Body() body: CreateStudentDto) {
    return this.khoaService.createStudent(body);
  }

  @Roles('QuanLyKhoa')
  @Put('students/:id')
  async updateStudent(@Param('id') id: number, @Body() body: UpdateStudentDto) {
    return this.khoaService.updateStudent(+id, body);
  }

  @Roles('QuanLyKhoa')
  @Delete('students/:id')
  async deleteStudent(@Param('id') id: number) {
    return this.khoaService.deleteStudent(+id);
  }


  @Roles('QuanLyKhoa', 'QuanLyCLB')
  @Get('campaigns')
  async getCampaigns(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('namHoc') namHoc?: string,
    @Query('hocKy') hocKy?: string,
    @Query('trangThai') trangThai?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 15;
    return this.khoaService.getCampaigns(pageNum, limitNum, search, namHoc, hocKy, trangThai);
  }

  @Roles('QuanLyKhoa')
  @Post('campaigns')
  async createCampaign(@Body() body: CreateCampaignDto) {
    return this.khoaService.createCampaign(body);
  }

  @Roles('QuanLyKhoa')
  @Put('campaigns/:id')
  async updateCampaign(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCampaignDto) {
    return this.khoaService.updateCampaign(id, body);
  }

  @Roles('QuanLyKhoa')
  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id', ParseIntPipe) id: number) {
    return this.khoaService.deleteCampaign(id);
  }

  @Roles('QuanLyKhoa')
  @Get('campaigns/:id/students')
  async getCampaignStudents(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.khoaService.getCampaignStudents(id, pageNum, limitNum, search);
  }

  @Roles('QuanLyKhoa')
  @Post('campaigns/:id/students')
  async addStudentToCampaign(@Param('id', ParseIntPipe) id: number, @Body('mssv') mssv: string) {
    if (!mssv) throw new BadRequestException('Vui lòng cung cấp MSSV');
    return this.khoaService.addStudentToCampaign(id, mssv);
  }

  @Roles('QuanLyKhoa')
  @Delete('campaigns/:id/students/:studentId')
  async removeStudentFromCampaign(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number
  ) {
    return this.khoaService.removeStudentFromCampaign(id, studentId);
  }


  // [ĐÃ XÓA] POST campaigns/:id/publish — trạng thái đợt kiến tập
  // giờ được tự động chuyển bởi updateDotKienTapStatus() khi trạng thái
  // LichKienTap thay đổi, không còn cho phép nhập tay.

  @Roles('QuanLyKhoa', 'QuanLyCLB')
  @Get('schedules')
  async getSchedules() {
    return this.khoaService.getSchedules('QuanLyKhoa');
  }

  @Roles('QuanLyKhoa', 'QuanLyCLB')
  @Post('schedules')
  async createSchedule(@Body() body: CreateScheduleDto) {
    return this.khoaService.createSchedule(body);
  }

  @Roles('QuanLyKhoa')
  @Put('schedules/:id')
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateScheduleDto,
  ) {
    return this.khoaService.updateSchedule(id, body);
  }

  @Roles('QuanLyKhoa')
  @Delete('schedules/:id')
  async deleteSchedule(@Param('id', ParseIntPipe) id: number) {
    return this.khoaService.deleteSchedule(id);
  }

  @Roles('QuanLyKhoa')
  @Post('schedules/:id/approve')
  async approveSchedule(@Param('id', ParseIntPipe) id: number) {
    return this.khoaService.approveSchedule(id);
  }

  @Roles('QuanLyKhoa')
  @Post('schedules/:id/reject')
  async rejectSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body('lyDo') lyDo: string,
  ) {
    return this.khoaService.rejectSchedule(id, lyDo);
  }



  @Roles('QuanLyKhoa', 'QuanLyCLB')
  @Get('trips')
  async getTrips(@Query('unassigned') unassigned?: string) {
    const isUnassigned = unassigned === 'true';
    return this.khoaService.getTrips(isUnassigned);
  }

  @Roles('QuanLyKhoa', 'QuanLyCLB')
  @Get('proposals')
  async getProposals() {
    return this.khoaService.getProposals();
  }

  @Roles('QuanLyCLB')
  @Post('trips')
  async createTrip(@Body() body: CreateTripDto) {
    return this.khoaService.createTrip(body);
  }

  @Roles('QuanLyCLB')
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

  @Roles('QuanLyCLB')
  @Post('approve-cancel')
  async approveCancel(@Body() body: ApproveCancelDto) {
    return this.khoaService.approveCancelRequest(
      body.requestId,
      body.approverId,
      body.isApproved,
    );
  }

  @Roles('QuanLyCLB', 'QuanLyKhoa')
  @Post('preview-assign-students')
  async previewAssignStudents(@Body() body: FilterAssignStudentsDto) {
    return this.khoaService.previewAssignStudents(body.tripId);
  }

  @Roles('QuanLyCLB', 'QuanLyKhoa')
  @Post('confirm-assign-students')
  async confirmAssignStudents(@Body() body: { tripId: number, acceptedStudentIds: number[] }) {
    return this.khoaService.confirmAssignStudents(body.tripId, body.acceptedStudentIds);
  }

  @Roles('QuanLyKhoa')
  @Post('assign-gvhd')
  async assignGvhd(@Body() body: AssignGvhdDto) {
    return this.khoaService.assignLecturerGuide(
      body.lichKienTapSinhVienId,
      body.lecturerId,
    );
  }

  @Roles('QuanLyKhoa')
  @Post('assign-gvdd')
  async assignGvdd(@Body() body: AssignGvddDto) {
    return this.khoaService.assignTourLeader(
      body.tripId,
      body.lecturerId,
      body.laTruongDoan,
    );
  }

  @Roles('QuanLyKhoa')
  @Delete('assign-gvdd/:tripId/:lecturerId')
  async unassignGvdd(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('lecturerId', ParseIntPipe) lecturerId: number,
  ) {
    return this.khoaService.unassignTourLeader(tripId, lecturerId);
  }

  @Roles('QuanLyKhoa')
  @Post('auto-assign-gvdd')
  async autoAssignGvdd() {
    return this.khoaService.autoAssignGvdd();
  }

  @Roles('QuanLyKhoa')
  @Post('create-board')
  async createBoard(@Body() body: CreateBoardDto) {
    return this.khoaService.createBoard(
      body.scheduleId,
      body.name,
      body.date,
      body.room,
    );
  }

  @Roles('QuanLyKhoa')
  @Post('add-board-member')
  async addBoardMember(@Body() body: AddBoardMemberDto) {
    return this.khoaService.addBoardMember(
      body.boardId,
      body.lecturerId,
      body.role,
    );
  }

  @Roles('QuanLyKhoa')
  @Post('lock-grades')
  async lockGrades(@Body() body: LockGradesDto) {
    return this.khoaService.lockAndFinalizeGrades(
      body.termStudentId,
      body.userId,
    );
  }

  @Roles('QuanLyKhoa')
  @Get('retake-students-report')
  async getRetakeStudentsReport() {
    return this.khoaService.getRetakeStudentsReport();
  }

  @Roles('QuanLyKhoa')
  @Get('final-results-report/:lichKienTapId')
  async getFinalResultsReport(
    @Param('lichKienTapId', ParseIntPipe) lichKienTapId: number,
  ) {
    return this.khoaService.getFinalResultsReport(lichKienTapId);
  }

  @Roles('QuanLyKhoa')
  @Get('report/visited-students')
  async getVisitedStudentsReport(
    @Query('lichKienTapId') lichKienTapId?: string,
  ) {
    return this.khoaService.getVisitedStudentsReport(lichKienTapId ? parseInt(lichKienTapId) : undefined);
  }

  @Roles('QuanLyKhoa')
  @Get('report/not-visited-students')
  async getNotVisitedStudentsReport(
    @Query('lichKienTapId') lichKienTapId?: string,
  ) {
    return this.khoaService.getNotVisitedStudentsReport(lichKienTapId ? parseInt(lichKienTapId) : undefined);
  }

  @Roles('QuanLyKhoa')
  @Get('report/eligible-students')
  async getEligibleStudentsReport(
    @Query('lichKienTapId') lichKienTapId?: string,
  ) {
    return this.khoaService.getEligibleStudentsReport(lichKienTapId ? parseInt(lichKienTapId) : undefined);
  }

  @Roles('QuanLyKhoa')
  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.khoaService.getDashboardStats();
  }

  @Roles('QuanLyCLB')
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

  @Roles('QuanLyCLB')
  @Get('refund-requests')
  async getRefundRequests(@Query() query: GetRefundRequestsQueryDto) {
    return this.khoaService.getRefundRequests(
      query.page || 1,
      query.limit || 10,
      query.search,
    );
  }

  @Roles('QuanLyCLB')
  @Post('approve-refund')
  async approveRefund(@Body() body: ApproveRefundDto) {
    return this.khoaService.approveRefund(
      body.refundId,
      body.approverId,
      body.isApproved,
    );
  }

  @Roles('QuanLyKhoa')
  @Get('enrollments')
  async getEnrollments(@Query() query: GetEnrollmentsQueryDto) {
    return this.khoaService.getEnrollments(
      query.page || 1,
      query.limit || 10,
      query.search,
      query.lichKienTapId,
    );
  }

  @Roles('QuanLyKhoa')
  @Get('notifications')
  async getNotifications() {
    return this.khoaService.getNotifications();
  }

  @Roles('QuanLyKhoa')
  @Post('notifications')
  async createNotification(@Body() body: CreateKhoaNotificationDto) {
    return this.khoaService.createNotification(body);
  }

  @Roles('QuanLyKhoa')
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

  @Roles('QuanLyCLB')
  @Post('bulk-confirm-payments')
  async bulkConfirmPayments(@Body('records') records: any[]) {
    return this.khoaService.bulkConfirmPayments(records);
  }
}

