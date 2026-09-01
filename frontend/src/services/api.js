import axios from 'axios';

const isProduction = import.meta.env.PROD;
const rawApiUrl = import.meta.env.VITE_API_BASE_URL;

const resolveApiBaseUrl = (rawUrl) => {
  const trimmed = rawUrl ? String(rawUrl).trim() : '';

  if (isProduction) {
    if (!trimmed) {
      throw new Error(
        'Lỗi cấu hình hệ thống (Production): VUI LÒNG cấu hình VITE_API_BASE_URL trong biến môi trường.'
      );
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      throw new Error(
        `Lỗi cấu hình hệ thống (Production): VITE_API_BASE_URL không phải URL hợp lệ (${trimmed}).`
      );
    }
    if (parsedUrl.protocol !== 'https:') {
      throw new Error(
        `Lỗi cấu hình bảo mật (Production): VITE_API_BASE_URL bắt buộc phải sử dụng HTTPS (${trimmed}).`
      );
    }
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  }

  // Development fallback: http://localhost:3000/api
  const devUrl = trimmed || 'http://localhost:3000/api';
  return devUrl.endsWith('/') ? devUrl.slice(0, -1) : devUrl;
};

const API_BASE_URL = resolveApiBaseUrl(rawApiUrl);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const { token } = JSON.parse(userJson);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing user token', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (ten_dang_nhap, mat_khau) => api.post('/auth/login', { ten_dang_nhap, mat_khau }),
  changePassword: (oldPass, newPass) => api.post('/auth/change-password', { oldPass, newPass }),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userId, sdt, email) => api.put(`/auth/profile/${userId}`, { sdt, email }),
};

export const sinhVienApi = {
  getProfile: (accountId) => api.get(`/sinh-vien/profile/${accountId}`),
  getFactories: () => api.get('/sinh-vien/factories'),
  getAvailableTrips: (studentId) => api.get(`/sinh-vien/available-trips/${studentId}`),
  getRegisteredTrips: (studentId) => api.get(`/sinh-vien/registered-trips/${studentId}`),
  registerTrip: (tripId) => api.post('/sinh-vien/register', { tripId }),
  proposeTrip: (data) => api.post('/sinh-vien/propose-trip', data),
  requestCancel: (data) => api.post('/sinh-vien/request-cancel', data),
  getInvoices: (studentId) => api.get(`/sinh-vien/invoices/${studentId}`),
  payInvoice: (invoiceId) => api.post(`/sinh-vien/pay-invoice/${invoiceId}`),
  requestRefund: (data) => api.post('/sinh-vien/request-refund', data),
  getRefundRequests: (studentId) => api.get(`/sinh-vien/refund-requests/${studentId}`),
  getNotifications: (studentId) => api.get(`/sinh-vien/notifications/${studentId}`),
  markNotificationRead: (notifId) => api.post('/sinh-vien/mark-notification-read', { notifId }),
  submitReport: (data) => api.post('/sinh-vien/submit-report', data),
  selectRepresentativeTrips: (data) => api.post('/sinh-vien/select-representative-trips', data),
  getGrades: (studentId) => api.get(`/sinh-vien/grades/${studentId}`),
  getDashboardStats: (studentId) => api.get(`/sinh-vien/dashboard-stats/${studentId}`),
};

export const giangVienApi = {
  getProfile: (accountId) => api.get(`/giang-vien/profile/${accountId}`),
  getGuidedStudents: (lecturerId) => api.get(`/giang-vien/guided-students/${lecturerId}`),
  getLedTrips: (lecturerId) => api.get(`/giang-vien/led-trips/${lecturerId}`),
  getTripRegistrations: (tripId) => api.get(`/giang-vien/trip-registrations/${tripId}`),
  takeAttendance: (data) => api.post('/giang-vien/take-attendance', data),  // data: {tripId, records: [{phieuId, status, note?}]}
  gradePrepAndBonus: (data) => api.post('/giang-vien/grade-prep-bonus', data),
  getGuidedReports: (lecturerId, params) => api.get(`/giang-vien/guided-reports/${lecturerId}`, { params }),
  gradeReport: (data) => api.post('/giang-vien/grade-report', data),
  getBoardSessions: (lecturerId) => api.get(`/giang-vien/board-sessions/${lecturerId}`),
  submitBoardScore: (data) => api.post('/giang-vien/submit-board-score', data),
  getNotifications: (lecturerId) => api.get(`/giang-vien/notifications/${lecturerId}`),
  markNotificationRead: (notifId, accountId) => api.post(`/giang-vien/notifications/${notifId}/read`, { accountId }),
  markAllNotificationsRead: (lecturerId) => api.post(`/giang-vien/notifications/mark-all-read/${lecturerId}`),
  getDashboardStats: (lecturerId) => api.get(`/giang-vien/dashboard-stats/${lecturerId}`),
};

const getAdminPrefix = () => {
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const parsed = JSON.parse(userJson);
      if (parsed?.user?.vai_tro === 'QuanLyCLB') return '/clb';
    }
  } catch (e) {}
  return '/khoa';
};

export const khoaApi = {
  getYears: () => api.get(`${getAdminPrefix()}/years`),
  createYear: (data) => api.post(`${getAdminPrefix()}/years`, data),
  updateYear: (id, data) => api.put(`${getAdminPrefix()}/years/${id}`, data),
  deleteYear: (id) => api.delete(`${getAdminPrefix()}/years/${id}`),
  getTerms: () => api.get(`${getAdminPrefix()}/terms`),
  createTerm: (data) => api.post(`${getAdminPrefix()}/terms`, data),
  updateTerm: (id, data) => api.put(`${getAdminPrefix()}/terms/${id}`, data),
  deleteTerm: (id) => api.delete(`${getAdminPrefix()}/terms/${id}`),
  getCourses: () => api.get(`${getAdminPrefix()}/courses`),
  createCourse: (data) => api.post(`${getAdminPrefix()}/courses`, data),
  updateCourse: (id, data) => api.put(`${getAdminPrefix()}/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`${getAdminPrefix()}/courses/${id}`),
  getFactories: () => api.get(`${getAdminPrefix()}/factories`),
  getFactoryIndustryGroups: () => api.get(`${getAdminPrefix()}/factories/industry-groups`),
  createFactory: (data) => api.post(`${getAdminPrefix()}/factories`, data),
  updateFactory: (id, data) => api.put(`${getAdminPrefix()}/factories/${id}`, data),
  getLecturers: () => api.get(`${getAdminPrefix()}/lecturers`),
  createLecturer: (data) => api.post(`${getAdminPrefix()}/lecturers`, data),
  updateLecturer: (id, data) => api.put(`${getAdminPrefix()}/lecturers/${id}`, data),
  updateLecturerBoardEligibility: (id, duDkHoiDong) => api.patch(`${getAdminPrefix()}/lecturers/${id}/board-eligibility`, { du_dk_hoi_dong: duDkHoiDong }),
  getStudents: (params) => api.get(`${getAdminPrefix()}/students`, { params }),
  createStudent: (data) => api.post(`${getAdminPrefix()}/students`, data),
  updateStudent: (id, data) => api.put(`${getAdminPrefix()}/students/${id}`, data),
  deleteStudent: (id) => api.delete(`${getAdminPrefix()}/students/${id}`),
  getAccounts: (params) => api.get(`${getAdminPrefix()}/accounts`, { params }),
  toggleAccountLock: (id) => api.post(`${getAdminPrefix()}/accounts/${id}/toggle-lock`),
  resetAccountPassword: (id) => api.post(`${getAdminPrefix()}/accounts/${id}/reset-password`),
  getCampaigns: () => api.get(`${getAdminPrefix()}/campaigns`),
  createCampaign: (data) => api.post(`${getAdminPrefix()}/campaigns`, data),
  getSchedules: () => api.get(`${getAdminPrefix()}/schedules`),
  createSchedule: (data) => api.post(`${getAdminPrefix()}/schedules`, data),
  importStudents: (data) => api.post(`${getAdminPrefix()}/import-students`, data),
  getTrips: () => api.get(`${getAdminPrefix()}/trips`),
  createTrip: (data) => api.post(`${getAdminPrefix()}/trips`, data),
  approveTrip: (data) => api.post(`${getAdminPrefix()}/approve-trip`, data),
  approveCancel: (data) => api.post(`${getAdminPrefix()}/approve-cancel`, data),
  filterAssignStudents: (data) => api.post(`${getAdminPrefix()}/filter-assign-students`, data),
  assignGvhd: (data) => api.post(`${getAdminPrefix()}/assign-gvhd`, data),
  assignGvdd: (data) => api.post(`${getAdminPrefix()}/assign-gvdd`, data),
  createBoard: (data) => api.post(`${getAdminPrefix()}/create-board`, data),
  addBoardMember: (data) => api.post(`${getAdminPrefix()}/add-board-member`, data),
  lockGrades: (data) => api.post(`${getAdminPrefix()}/lock-grades`, data),
  getDashboardStats: () => api.get(`${getAdminPrefix()}/dashboard-stats`),
  getRegistrations: (params) => api.get(`${getAdminPrefix()}/registrations`, { params }),
  getRefundRequests: (params) => api.get(`${getAdminPrefix()}/refund-requests`, { params }),
  approveRefund: (data) => api.post(`${getAdminPrefix()}/approve-refund`, data),
  getEnrollments: (params) => api.get(`${getAdminPrefix()}/enrollments`, { params }),
  getNotifications: () => api.get(`${getAdminPrefix()}/notifications`),
  createNotification: (data) => api.post(`${getAdminPrefix()}/notifications`, data),
  getRetakeReport: () => api.get(`${getAdminPrefix()}/retake-students-report`),
  getFinalResultsReport: (lichKienTapId) => api.get(`${getAdminPrefix()}/final-results-report/${lichKienTapId}`),
  getVisitedStudentsReport: (params) => api.get(`${getAdminPrefix()}/report/visited-students`, { params }),
  getNotVisitedStudentsReport: (params) => api.get(`${getAdminPrefix()}/report/not-visited-students`, { params }),
  getEligibleStudentsReport: (params) => api.get(`${getAdminPrefix()}/report/eligible-students`, { params }),
  bulkConfirmPayments: (records) => api.post(`${getAdminPrefix()}/bulk-confirm-payments`, { records }),
};

export default api;
