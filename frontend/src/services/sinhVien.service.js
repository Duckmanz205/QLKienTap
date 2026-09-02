import api from './axiosClient';

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
