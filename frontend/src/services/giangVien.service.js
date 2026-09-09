import api from './axiosClient';

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
