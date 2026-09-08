import api from './axiosClient';

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
  getUniqueClasses: () => api.get(`${getAdminPrefix()}/students/classes`),
  createStudent: (data) => api.post(`${getAdminPrefix()}/students`, data),
  updateStudent: (id, data) => api.put(`${getAdminPrefix()}/students/${id}`, data),
  deleteStudent: (id) => api.delete(`${getAdminPrefix()}/students/${id}`),
  getCampaigns: () => api.get(`${getAdminPrefix()}/campaigns`),
  createCampaign: (data) => api.post(`${getAdminPrefix()}/campaigns`, data),
  updateCampaign: (id, data) => api.put(`${getAdminPrefix()}/campaigns/${id}`, data),
  deleteCampaign: (id) => api.delete(`${getAdminPrefix()}/campaigns/${id}`),
  publishCampaign: (id) => api.post(`${getAdminPrefix()}/campaigns/${id}/publish`),
  getSchedules: () => api.get(`${getAdminPrefix()}/schedules`),
  createSchedule: (data) => api.post(`${getAdminPrefix()}/schedules`, data),
  updateSchedule: (id, data) => api.put(`${getAdminPrefix()}/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`${getAdminPrefix()}/schedules/${id}`),
  submitSchedule: (id) => api.post(`${getAdminPrefix()}/schedules/${id}/submit`),
  approveSchedule: (id) => api.post(`${getAdminPrefix()}/schedules/${id}/approve`),
  rejectSchedule: (id, lyDo) => api.post(`${getAdminPrefix()}/schedules/${id}/reject`, { lyDo }),
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
