import api from './axiosClient';

export const qtvApi = {
  getAccounts: (params) => api.get('/qtv/account', { params }),
  toggleAccountLock: (id) => api.post(`/qtv/account/${id}/toggle-lock`),
  resetAccountPassword: (id) => api.post(`/qtv/account/${id}/reset-password`),
};
