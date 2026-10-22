import api from './axiosClient';

export const giangVienApi = {
  getProfile: (accountId) => api.get(`/giang-vien/profile/${accountId}`),
  getGuidedStudents: (lecturerId) => api.get(`/giang-vien/guided-students/${lecturerId}`),
  getLedTrips: (lecturerId) => api.get(`/giang-vien/led-trips/${lecturerId}`),
  getTripRegistrations: (tripId) => api.get(`/giang-vien/trip-registrations/${tripId}`),
  takeAttendance: (data) => api.post('/giang-vien/take-attendance', data),  // data: {tripId, records: [{phieuId, status, note?}]}
  gradePrepAndBonus: (data) => api.post('/giang-vien/grade-prep-bonus', data),
  lockTripPrepGrades: (data) => api.post('/giang-vien/lock-trip-prep-grades', data),
  getGuidedReports: (lecturerId, params) => api.get(`/giang-vien/guided-reports/${lecturerId}`, { params }),
  gradeReport: (data) => api.post('/giang-vien/grade-report', data),
  lockGuidedReportsGrades: (data) => api.post('/giang-vien/lock-guided-reports-grades', data),
  getBoardSessions: (lecturerId) => api.get(`/giang-vien/board-sessions/${lecturerId}`),
  submitBoardScore: (data) => api.post('/giang-vien/submit-board-score', data),
  submitBoardScoresBatch: (data) => api.post('/giang-vien/submit-board-scores-batch', data),
  lockCouncilGrade: (data) => api.post('/giang-vien/lock-council-grade', data),
  updateCouncilStudentNote: (data) => api.put('/giang-vien/council-student-note', data),
  getNotifications: (lecturerId) => api.get(`/giang-vien/notifications/${lecturerId}`),
  getDashboardStats: (lecturerId) => api.get(`/giang-vien/dashboard-stats/${lecturerId}`),
};
