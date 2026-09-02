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

export default api;
