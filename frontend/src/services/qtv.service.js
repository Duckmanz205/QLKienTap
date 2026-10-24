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

  // Tạo bản sao lưu lưu trữ trên máy chủ
  createBackupOnServer: () => api.post('/qtv/backup/create'),

  // Lấy danh sách các bản sao lưu lưu trên máy chủ
  getServerBackups: () => api.get('/qtv/backup/list'),

  // Tải bản sao lưu từ máy chủ về máy khách
  downloadServerBackup: (fileName) =>
    api.get(`/qtv/backup/download-file/${encodeURIComponent(fileName)}`, {
      responseType: 'blob',
    }),

  // Xóa bản sao lưu trên máy chủ
  deleteServerBackup: (fileName) =>
    api.delete(`/qtv/backup/${encodeURIComponent(fileName)}`),

  // Phục hồi cơ sở dữ liệu từ file .bak tải lên
  restoreFromUpload: (formData, onUploadProgress) =>
    api.post('/qtv/restore/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),

  // Phục hồi cơ sở dữ liệu từ bản sao lưu lưu trên máy chủ
  restoreFromServer: (fileName) =>
    api.post(`/qtv/restore/from-server/${encodeURIComponent(fileName)}`),
};
