/**
 * Session Validation & Navigation Helper
 * 
 * LƯU Ý BẢO MẬT:
 * Việc kiểm tra session ở localStorage chỉ phục vụ trải nghiệm điều hướng người dùng (UX Navigation).
 * localStorage KHÔNG THỂ xem là giải pháp bảo mật tuyệt đối. Backend API Guards (AuthGuard, RolesGuard)
 * vẫn là lớp phân quyền bắt buộc đối với mọi request hệ thống.
 */

export const getDashboardPathForRole = (role) => {
  if (role === 'SinhVien') return '/sinh-vien';
  if (role === 'GiangVien') return '/giang-vien';
  if (role === 'QuanLyKhoa' || role === 'Khoa') return '/khoa';
  if (role === 'QuanTriVienHeThong') return '/qtv/accounts';
  if (role === 'QuanLyCLB') return '/clb';
  return '/login';
};

export const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const getValidSession = () => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;

  try {
    const parsed = JSON.parse(userJson);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.token === 'string' &&
      parsed.token.trim() !== '' &&
      parsed.user &&
      typeof parsed.user === 'object' &&
      typeof parsed.user.vai_tro === 'string' &&
      ['SinhVien', 'GiangVien', 'QuanLyKhoa', 'Khoa', 'QuanLyCLB', 'QuanTriVienHeThong'].includes(parsed.user.vai_tro)
    ) {
      if (isTokenExpired(parsed.token)) {
        localStorage.removeItem('user');
        return null;
      }
      return parsed;
    }
  } catch (e) {
    // Malformed or corrupted JSON in localStorage
  }

  // Clear corrupt or invalid session to prevent application crash
  localStorage.removeItem('user');
  return null;
};

export const clearSession = () => {
  localStorage.removeItem('user');
};
