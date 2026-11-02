import api from './axiosClient';

export const qtvApi = {
  // Quản lý tài khoản
  getAccounts: (params) => api.get('/qtv/account', { params }),
  toggleAccountLock: (id) => api.post(`/qtv/account/${id}/toggle-lock`),
  resetAccountPassword: (id) => api.post(`/qtv/account/${id}/reset-password`),

  // Quản lý cơ sở dữ liệu: Sao lưu & Phục hồi (Backup & Restore)
  getDatabaseOverview: () => api.get('/qtv/backup/overview'),

  // Tải trực tiếp file .bak về máy khách
  downloadBackup: () =>
    api.get('/qtv/backup/download', {
      responseType: 'blob',
    }),

  // Phục hồi cơ sở dữ liệu từ file .bak tải lên
  restoreFromUpload: (formData, onUploadProgress) =>
    api.post('/qtv/restore/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
};
