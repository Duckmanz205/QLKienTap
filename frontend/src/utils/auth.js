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
  return '/login';
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
      ['SinhVien', 'GiangVien', 'QuanLyKhoa', 'Khoa'].includes(parsed.user.vai_tro)
    ) {
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
