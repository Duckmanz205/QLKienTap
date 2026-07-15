import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { KhoaService } from './khoa.service';
import { NamHoc, HocKy, Khoa, NhaMay, DotKienTap, LichKienTap, ChuyenThamQuan } from '../entities/qlkt.entity';

@Controller('khoa')
export class KhoaController {
  constructor(private readonly khoaService: KhoaService) {}

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
  async getStudents() {
    return this.khoaService.getStudents();
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
  async getRegistrations() {
    return this.khoaService.getRegistrations();
  }

  @Get('refund-requests')
  async getRefundRequests() {
    return this.khoaService.getRefundRequests();
  }

  @Post('approve-refund')
  async approveRefund(@Body() body: { refundId: number; approverId: number; isApproved: boolean }) {
    return this.khoaService.approveRefund(body.refundId, body.approverId, body.isApproved);
  }

  @Get('enrollments')
  async getEnrollments() {
    return this.khoaService.getEnrollments();
  }

  @Get('notifications')
  async getNotifications() {
    return this.khoaService.getNotifications();
  }

  @Post('notifications')
  async createNotification(@Body() body: { tieu_de: string; noi_dung: string; nguoi_gui_id: number; khoa_id?: number }) {
    return this.khoaService.createNotification(body);
  }
}
