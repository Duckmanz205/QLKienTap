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
  getStudents: (params) => api.get('/khoa/students', { params }),
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
  getRegistrations: (params) => api.get('/khoa/registrations', { params }),
  getRefundRequests: (params) => api.get('/khoa/refund-requests', { params }),
  approveRefund: (data) => api.post('/khoa/approve-refund', data),
  getEnrollments: (params) => api.get('/khoa/enrollments', { params }),
  getNotifications: () => api.get('/khoa/notifications'),
  createNotification: (data) => api.post('/khoa/notifications', data),
  getRetakeReport: () => api.get('/khoa/retake-students-report'),
  getFinalResultsReport: (lichKienTapId) => api.get(`/khoa/final-results-report/${lichKienTapId}`),
};

export default api;
