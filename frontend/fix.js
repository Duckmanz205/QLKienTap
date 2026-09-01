const fs = require('fs');
let content = fs.readFileSync('e:/Khoa_Luan/CodeDoAn/frontend/src/services/api.js', 'utf8');

const startIndex = content.indexOf('export const khoaApi = {');
const preContent = content.substring(0, startIndex);

const newKhoaApi = \export const khoaApi = {
  getYears: () => api.get(\\\\\\/years\\\),
  createYear: (data) => api.post(\\\\\\/years\\\, data),
  updateYear: (id, data) => api.put(\\\\\\/years/\\\\\\, data),
  deleteYear: (id) => api.delete(\\\\\\/years/\\\\\\),
  getTerms: () => api.get(\\\\\\/terms\\\),
  createTerm: (data) => api.post(\\\\\\/terms\\\, data),
  updateTerm: (id, data) => api.put(\\\\\\/terms/\\\\\\, data),
  deleteTerm: (id) => api.delete(\\\\\\/terms/\\\\\\),
  getCourses: () => api.get(\\\\\\/courses\\\),
  createCourse: (data) => api.post(\\\\\\/courses\\\, data),
  updateCourse: (id, data) => api.put(\\\\\\/courses/\\\\\\, data),
  deleteCourse: (id) => api.delete(\\\\\\/courses/\\\\\\),
  getFactories: () => api.get(\\\\\\/factories\\\),
  getFactoryIndustryGroups: () => api.get(\\\\\\/factories/industry-groups\\\),
  createFactory: (data) => api.post(\\\\\\/factories\\\, data),
  updateFactory: (id, data) => api.put(\\\\\\/factories/\\\\\\, data),
  getLecturers: () => api.get(\\\\\\/lecturers\\\),
  createLecturer: (data) => api.post(\\\\\\/lecturers\\\, data),
  updateLecturer: (id, data) => api.put(\\\\\\/lecturers/\\\\\\, data),
  updateLecturerBoardEligibility: (id, duDkHoiDong) => api.patch(\\\\\\/lecturers/\\\/board-eligibility\\\, { du_dk_hoi_dong: duDkHoiDong }),
  getStudents: (params) => api.get(\\\\\\/students\\\, { params }),
  createStudent: (data) => api.post(\\\\\\/students\\\, data),
  updateStudent: (id, data) => api.put(\\\\\\/students/\\\\\\, data),
  deleteStudent: (id) => api.delete(\\\\\\/students/\\\\\\),
  getAccounts: (params) => api.get(\\\\\\/accounts\\\, { params }),
  toggleAccountLock: (id) => api.post(\\\\\\/accounts/\\\/toggle-lock\\\),
  resetAccountPassword: (id) => api.post(\\\\\\/accounts/\\\/reset-password\\\),
  getCampaigns: () => api.get(\\\\\\/campaigns\\\),
  createCampaign: (data) => api.post(\\\\\\/campaigns\\\, data),
  getSchedules: () => api.get(\\\\\\/schedules\\\),
  createSchedule: (data) => api.post(\\\\\\/schedules\\\, data),
  importStudents: (data) => api.post(\\\\\\/import-students\\\, data),
  getTrips: () => api.get(\\\\\\/trips\\\),
  createTrip: (data) => api.post(\\\\\\/trips\\\, data),
  approveTrip: (data) => api.post(\\\\\\/approve-trip\\\, data),
  approveCancel: (data) => api.post(\\\\\\/approve-cancel\\\, data),
  filterAssignStudents: (data) => api.post(\\\\\\/filter-assign-students\\\, data),
  assignGvhd: (data) => api.post(\\\\\\/assign-gvhd\\\, data),
  assignGvdd: (data) => api.post(\\\\\\/assign-gvdd\\\, data),
  createBoard: (data) => api.post(\\\\\\/create-board\\\, data),
  addBoardMember: (data) => api.post(\\\\\\/add-board-member\\\, data),
  lockGrades: (data) => api.post(\\\\\\/lock-grades\\\, data),
  getDashboardStats: () => api.get(\\\\\\/dashboard-stats\\\),
  getRegistrations: (params) => api.get(\\\\\\/registrations\\\, { params }),
  getRefundRequests: (params) => api.get(\\\\\\/refund-requests\\\, { params }),
  approveRefund: (data) => api.post(\\\\\\/approve-refund\\\, data),
  getEnrollments: (params) => api.get(\\\\\\/enrollments\\\, { params }),
  getNotifications: () => api.get(\\\\\\/notifications\\\),
  createNotification: (data) => api.post(\\\\\\/notifications\\\, data),
  getRetakeReport: () => api.get(\\\\\\/retake-students-report\\\),
  getFinalResultsReport: (lichKienTapId) => api.get(\\\\\\/final-results-report/\\\\\\),
  getVisitedStudentsReport: (params) => api.get(\\\\\\/report/visited-students\\\, { params }),
  getNotVisitedStudentsReport: (params) => api.get(\\\\\\/report/not-visited-students\\\, { params }),
  getEligibleStudentsReport: (params) => api.get(\\\\\\/report/eligible-students\\\, { params }),
  bulkConfirmPayments: (records) => api.post(\\\\\\/bulk-confirm-payments\\\, { records }),
};

export default api;
\;

fs.writeFileSync('e:/Khoa_Luan/CodeDoAn/frontend/src/services/api.js', preContent + newKhoaApi);
