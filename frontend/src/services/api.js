import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  login: (ten_dang_nhap, mat_khau) => api.post('/auth/login', { ten_dang_nhap, mat_khau }),
  changePassword: (userId, oldPass, newPass) => api.post('/auth/change-password', { userId, oldPass, newPass }),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userId, sdt, email) => api.put(`/auth/profile/${userId}`, { sdt, email }),
};

export const sinhVienApi = {
  getProfile: (accountId) => api.get(`/sinh-vien/profile/${accountId}`),
  getAvailableTrips: (studentId) => api.get(`/sinh-vien/available-trips/${studentId}`),
  getRegisteredTrips: (studentId) => api.get(`/sinh-vien/registered-trips/${studentId}`),
  registerTrip: (studentId, tripId) => api.post('/sinh-vien/register', { studentId, tripId }),
  proposeTrip: (data) => api.post('/sinh-vien/propose-trip', data),
  requestCancel: (data) => api.post('/sinh-vien/request-cancel', data),
  getInvoices: (studentId) => api.get(`/sinh-vien/invoices/${studentId}`),
  payInvoice: (invoiceId) => api.post(`/sinh-vien/pay-invoice/${invoiceId}`),
  requestRefund: (data) => api.post('/sinh-vien/request-refund', data),
  getRefundRequests: (studentId) => api.get(`/sinh-vien/refund-requests/${studentId}`),
  getNotifications: (studentId) => api.get(`/sinh-vien/notifications/${studentId}`),
  markNotificationRead: (accountId, notifId) => api.post('/sinh-vien/mark-notification-read', { accountId, notifId }),
  submitReport: (data) => api.post('/sinh-vien/submit-report', data),
  selectRepresentativeTrips: (data) => api.post('/sinh-vien/select-representative-trips', data),
  getGrades: (studentId) => api.get(`/sinh-vien/grades/${studentId}`),
};

export const giangVienApi = {
  getProfile: (accountId) => api.get(`/giang-vien/profile/${accountId}`),
  getGuidedStudents: (lecturerId) => api.get(`/giang-vien/guided-students/${lecturerId}`),
  getLedTrips: (lecturerId) => api.get(`/giang-vien/led-trips/${lecturerId}`),
  getTripRegistrations: (tripId) => api.get(`/giang-vien/trip-registrations/${tripId}`),
  takeAttendance: (data) => api.post('/giang-vien/take-attendance', data),
  gradePrepAndBonus: (data) => api.post('/giang-vien/grade-prep-bonus', data),
  getGuidedReports: (lecturerId) => api.get(`/giang-vien/guided-reports/${lecturerId}`),
  gradeReport: (data) => api.post('/giang-vien/grade-report', data),
  getBoardSessions: (lecturerId) => api.get(`/giang-vien/board-sessions/${lecturerId}`),
  submitBoardScore: (data) => api.post('/giang-vien/submit-board-score', data),
};

export const khoaApi = {
  getYears: () => api.get('/khoa/years'),
  createYear: (data) => api.post('/khoa/years', data),
  getTerms: () => api.get('/khoa/terms'),
  createTerm: (data) => api.post('/khoa/terms', data),
  getCourses: () => api.get('/khoa/courses'),
  createCourse: (data) => api.post('/khoa/courses', data),
  getFactories: () => api.get('/khoa/factories'),
  createFactory: (data) => api.post('/khoa/factories', data),
  updateFactory: (id, data) => api.put(`/khoa/factories/${id}`, data),
  getLecturers: () => api.get('/khoa/lecturers'),
  getStudents: () => api.get('/khoa/students'),
  getCampaigns: () => api.get('/khoa/campaigns'),
  createCampaign: (data) => api.post('/khoa/campaigns', data),
  getSchedules: () => api.get('/khoa/schedules'),
  createSchedule: (data) => api.post('/khoa/schedules', data),
  importStudents: (data) => api.post('/khoa/import-students', data),
  getTrips: () => api.get('/khoa/trips'),
  createTrip: (data) => api.post('/khoa/trips', data),
  approveTrip: (data) => api.post('/khoa/approve-trip', data),
  approveCancel: (data) => api.post('/khoa/approve-cancel', data),
  filterAssignStudents: (data) => api.post('/khoa/filter-assign-students', data),
  assignGvhd: (data) => api.post('/khoa/assign-gvhd', data),
  assignGvdd: (data) => api.post('/khoa/assign-gvdd', data),
  createBoard: (data) => api.post('/khoa/create-board', data),
  addBoardMember: (data) => api.post('/khoa/add-board-member', data),
  lockGrades: (data) => api.post('/khoa/lock-grades', data),
  getDashboardStats: () => api.get('/khoa/dashboard-stats'),
  getRegistrations: () => api.get('/khoa/registrations'),
  getRefundRequests: () => api.get('/khoa/refund-requests'),
  approveRefund: (data) => api.post('/khoa/approve-refund', data),
  getEnrollments: () => api.get('/khoa/enrollments'),
  getNotifications: () => api.get('/khoa/notifications'),
  createNotification: (data) => api.post('/khoa/notifications', data),
  getRetakeReport: () => api.get('/khoa/retake-students-report'),
  getFinalResultsReport: (lichKienTapId) => api.get(`/khoa/final-results-report/${lichKienTapId}`),
};

export default api;
