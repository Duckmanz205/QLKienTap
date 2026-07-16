import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { KhoaService } from './khoa.service';
import { NamHoc, HocKy, Khoa, NhaMay, DotKienTap, LichKienTap, ChuyenThamQuan } from '../entities/qlkt.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TaskQueueService } from '../queue/task-queue.service';

@Controller('khoa')
@UseGuards(AuthGuard, RolesGuard)
@Roles('Khoa')
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
  async createYear(@Body() body: Partial<NamHoc>) {
    return this.khoaService.createYear(body);
  }

  @Get('terms')
  async getTerms() {
    return this.khoaService.getTerms();
  }

  @Post('terms')
  async createTerm(@Body() body: Partial<HocKy>) {
    return this.khoaService.createTerm(body);
  }

  @Get('courses')
  async getCourses() {
    return this.khoaService.getCourses();
  }

  @Post('courses')
  async createCourse(@Body() body: Partial<Khoa>) {
    return this.khoaService.createCourse(body);
  }

  @Get('factories')
  async getFactories() {
    return this.khoaService.getFactories();
  }

  @Post('factories')
  async createFactory(@Body() body: Partial<NhaMay>) {
    return this.khoaService.createFactory(body);
  }

  @Put('factories/:id')
  async updateFactory(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<NhaMay>) {
    return this.khoaService.updateFactory(id, body);
  }

  @Get('lecturers')
  async getLecturers() {
    return this.khoaService.getLecturers();
  }

  @Get('students')
  async getStudents(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.khoaService.getStudents(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  @Get('campaigns')
  async getCampaigns() {
    return this.khoaService.getCampaigns();
  }

  @Post('campaigns')
  async createCampaign(@Body() body: Partial<DotKienTap>) {
    return this.khoaService.createCampaign(body);
  }

  @Get('schedules')
  async getSchedules() {
    return this.khoaService.getSchedules();
  }

  @Post('schedules')
  async createSchedule(@Body() body: Partial<LichKienTap>) {
    return this.khoaService.createSchedule(body);
  }

  @Post('import-students')
  async importStudents(@Body() body: { lichId: number; studentIds: number[] }) {
    return this.khoaService.importStudentsToSchedule(body.lichId, body.studentIds);
  }

  @Get('trips')
  async getTrips() {
    return this.khoaService.getTrips();
  }

  @Post('trips')
  async createTrip(@Body() body: Partial<ChuyenThamQuan>) {
    return this.khoaService.createTrip(body);
  }

  @Post('approve-trip')
  async approveTrip(@Body() body: { tripId: number; approverId: number; isApproved: boolean }) {
    return this.khoaService.approveProposeTrip(body.tripId, body.approverId, body.isApproved);
  }

  @Post('approve-cancel')
  async approveCancel(@Body() body: { requestId: number; approverId: number; isApproved: boolean }) {
    return this.khoaService.approveCancelRequest(body.requestId, body.approverId, body.isApproved);
  }

  @Post('filter-assign-students')
  async filterAssignStudents(@Body() body: { tripId: number }) {
    return this.khoaService.filterAndAssignStudents(body.tripId);
  }

  @Post('assign-gvhd')
  async assignGvhd(@Body() body: { lichKienTapSinhVienId: number; lecturerId: number }) {
    return this.khoaService.assignLecturerGuide(body.lichKienTapSinhVienId, body.lecturerId);
  }

  @Post('assign-gvdd')
  async assignGvdd(@Body() body: { tripId: number; lecturerId: number; laTruongDoan: boolean }) {
    return this.khoaService.assignTourLeader(body.tripId, body.lecturerId, body.laTruongDoan);
  }

  @Post('create-board')
  async createBoard(@Body() body: { scheduleId: number; name: string; date: Date; room: string }) {
    return this.khoaService.createBoard(body.scheduleId, body.name, body.date, body.room);
  }

  @Post('add-board-member')
  async addBoardMember(@Body() body: { boardId: number; lecturerId: number; role: string }) {
    return this.khoaService.addBoardMember(body.boardId, body.lecturerId, body.role);
  }

  @Post('lock-grades')
  async lockGrades(@Body() body: { termStudentId: number; userId: number }) {
    return this.khoaService.lockAndFinalizeGrades(body.termStudentId, body.userId);
  }

  @Get('retake-students-report')
  async getRetakeStudentsReport() {
    return this.khoaService.getRetakeStudentsReport();
  }

  @Get('final-results-report/:lichKienTapId')
  async getFinalResultsReport(@Param('lichKienTapId', ParseIntPipe) lichKienTapId: number) {
    return this.khoaService.getFinalResultsReport(lichKienTapId);
  }

  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.khoaService.getDashboardStats();
  }

  @Get('registrations')
  async getRegistrations(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('lichKienTapId') lichKienTapId?: number,
    @Query('chuyenThamQuanId') chuyenThamQuanId?: number,
  ) {
    return this.khoaService.getRegistrations(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
      status,
      lichKienTapId ? Number(lichKienTapId) : undefined,
      chuyenThamQuanId ? Number(chuyenThamQuanId) : undefined,
    );
  }

  @Get('refund-requests')
  async getRefundRequests(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.khoaService.getRefundRequests(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  @Post('approve-refund')
  async approveRefund(@Body() body: { refundId: number; approverId: number; isApproved: boolean }) {
    return this.khoaService.approveRefund(body.refundId, body.approverId, body.isApproved);
  }

  @Get('enrollments')
  async getEnrollments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.khoaService.getEnrollments(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  @Get('notifications')
  async getNotifications() {
    return this.khoaService.getNotifications();
  }

  @Post('notifications')
  async createNotification(@Body() body: { tieu_de: string; noi_dung: string; nguoi_gui_id: number; khoa_id?: number }) {
    return this.khoaService.createNotification(body);
  }

  @Post('export-student-list')
  async exportStudentList(@Body() body: { campaignId?: number }) {
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
