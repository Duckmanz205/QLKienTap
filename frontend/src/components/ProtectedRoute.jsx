import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getValidSession, getDashboardPathForRole } from '../utils/auth';

/**
 * ProtectedRoute / RoleRoute Component
 * 
 * LƯU Ý BẢO MẬT:
 * Guard điều hướng tại Router chỉ là giải pháp trải nghiệm giao diện (UX).
 * Backend vẫn là lớp thực thi xác thực và phân quyền chính thức.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const session = getValidSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const { vai_tro } = session.user;

  if (allowedRoles && !allowedRoles.includes(vai_tro)) {
    const targetDashboard = getDashboardPathForRole(vai_tro);
    return <Navigate to={targetDashboard} replace />;
  }

  return <Outlet />;
}
