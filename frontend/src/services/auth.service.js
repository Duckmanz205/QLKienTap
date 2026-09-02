import api from './axiosClient';

export const authApi = {
  login: (ten_dang_nhap, mat_khau) => api.post('/auth/login', { ten_dang_nhap, mat_khau }),
  changePassword: (oldPass, newPass) => api.post('/auth/change-password', { oldPass, newPass }),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userId, sdt, email) => api.put(`/auth/profile/${userId}`, { sdt, email }),
};
