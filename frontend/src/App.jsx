import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';

// Student Pages
import DashBoard_SV from './pages/sinh-vien/DashBoard_SV';
import ChuyenThamQuan_DanhSachDangKy from './pages/sinh-vien/ChuyenThamQuan_DanhSachDangKy';
import NopBaiThuHoach_SV from './pages/sinh-vien/NopBaiThuHoach_SV';
import ThanhToan_SV from './pages/sinh-vien/ThanhToan_SV';
import HoanPhi_SV from './pages/sinh-vien/HoanPhi_SV';
import KetQua_Diem_SV from './pages/sinh-vien/KetQua_Diem_SV';
import ThongBao_SV from './pages/sinh-vien/ThongBao_SV';
import LichTrinhDoan_SV from './pages/sinh-vien/LichTrinhDoan_SV';

// Lecturer Pages
import DashBoard_GV from './pages/giang-vien/DashBoard_GV';
import LichDanDoan_GV from './pages/giang-vien/LichDanDoan_GV';
import DiemDanhSV_GV from './pages/giang-vien/DiemDanhSV_GV';
import DiemChuanBi_DiemCong_GV from './pages/giang-vien/DiemChuanBi_DiemCong_GV';
import SinhVienHuongDan_GV from './pages/giang-vien/SinhVienHuongDan_GV';
import ChamBaiThuHoach_GV from './pages/giang-vien/ChamBaiThuHoach_GV';
import HoiDongChamBaoCao_DSBuoi_GV from './pages/giang-vien/HoiDongChamBaoCao_DSBuoi_GV';
import ThongBao_GV from './pages/giang-vien/ThongBao_GV';

// Khoa / Admin Pages
import DashBoard_Khoa from './pages/khoa/DashBoard_Khoa';
import DashBoard_CLB from './pages/khoa/DashBoard_CLB';
import DanhMuc_SinhVien_Khoa from './pages/khoa/DanhMuc_SinhVien_Khoa';
import DanhMuc_GiangVien_Khoa from './pages/khoa/DanhMuc_GiangVien_Khoa';
import DanhMuc_NhaMay_Khoa from './pages/khoa/DanhMuc_NhaMay_Khoa';
import DanhMucNen_ThemMoiHocKy_Khoa from './pages/khoa/DanhMucNen_ThemMoiHocKy_Khoa';
import LichKienTap_Khoa from './pages/khoa/LichKienTap_Khoa';
import ChuyenThamQuan_DSLoc from './pages/khoa/ChuyenThamQuan_DSLoc';
import HoiDongChamBaoCao_Khoa from './pages/khoa/HoiDongChamBaoCao_Khoa';
import PlanManagement_Khoa from './pages/khoa/PlanManagement_Khoa';
import RegistrationManagement_Khoa from './pages/khoa/RegistrationManagement_Khoa';
import SupervisorAssignment_Khoa from './pages/khoa/SupervisorAssignment_Khoa';
import LeaderAssignment_Khoa from './pages/khoa/LeaderAssignment_Khoa';
import ThongBao_Khoa from './pages/khoa/ThongBao_Khoa';
import BaoCaoThongKe_Khoa from './pages/khoa/BaoCaoThongKe_Khoa';
import TaiKhoanNguoiDung_Khoa from './pages/khoa/TaiKhoanNguoiDung_Khoa';
import QuanLyLePhi_Khoa from './pages/khoa/QuanLyLePhi_Khoa';
import KetQuaKienTap_MaTranDiem_Khoa from './pages/khoa/KetQuaKienTap_MaTranDiem_Khoa';
import DuyetHoanPhi_Khoa from './pages/khoa/DuyetHoanPhi_Khoa';
import XemTruocBaoCaoThamQuan_Khoa from './pages/khoa/XemTruocBaoCaoThamQuan_Khoa';

import ProtectedRoute from './components/ProtectedRoute';
import { getValidSession, getDashboardPathForRole } from './utils/auth';

function LoginGuard() {
  const session = getValidSession();
  if (session) {
    const target = getDashboardPathForRole(session.user.vai_tro);
    return <Navigate to={target} replace />;
  }
  return <Login />;
}

function RootRedirect() {
  const session = getValidSession();
  if (session) {
    const target = getDashboardPathForRole(session.user.vai_tro);
    return <Navigate to={target} replace />;
  }
  return <Navigate to="/login" replace />;
}

function NotFoundRedirect() {
  const session = getValidSession();
  if (session) {
    const target = getDashboardPathForRole(session.user.vai_tro);
    return <Navigate to={target} replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<LoginGuard />} />

        {/* Root path redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Unified Application shell layout */}
        <Route element={<Layout />}>
          {/* Student Portal Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SinhVien']} />}>
            <Route path="sinh-vien" element={<DashBoard_SV />} />
            <Route path="sinh-vien/register" element={<ChuyenThamQuan_DanhSachDangKy />} />
            <Route path="sinh-vien/schedule" element={<LichTrinhDoan_SV />} />
            <Route path="sinh-vien/reports" element={<NopBaiThuHoach_SV />} />
            <Route path="sinh-vien/payment" element={<ThanhToan_SV />} />
            <Route path="sinh-vien/refund" element={<HoanPhi_SV />} />
            <Route path="sinh-vien/grades" element={<KetQua_Diem_SV />} />
            <Route path="sinh-vien/notifications" element={<ThongBao_SV />} />
          </Route>

          {/* Lecturer Portal Routes */}
          <Route element={<ProtectedRoute allowedRoles={['GiangVien']} />}>
            <Route path="giang-vien" element={<DashBoard_GV />} />
            <Route path="giang-vien/led-trips" element={<LichDanDoan_GV />} />
            <Route path="giang-vien/attendance" element={<DiemDanhSV_GV />} />
            <Route path="giang-vien/preparation" element={<DiemChuanBi_DiemCong_GV />} />
            <Route path="giang-vien/guided-students" element={<SinhVienHuongDan_GV />} />
            <Route path="giang-vien/grading" element={<ChamBaiThuHoach_GV />} />
            <Route path="giang-vien/board" element={<HoiDongChamBaoCao_DSBuoi_GV />} />
            <Route path="giang-vien/notifications" element={<ThongBao_GV />} />
          </Route>

          {/* Khoa Portal Routes */}
          <Route element={<ProtectedRoute allowedRoles={['QuanLyKhoa', 'QuanTriVienHeThong']} />}>
            <Route path="khoa" element={<DashBoard_Khoa />} />
            <Route path="khoa/danh-muc-nen" element={<DanhMucNen_ThemMoiHocKy_Khoa />} />
            <Route path="khoa/lich-kien-tap" element={<LichKienTap_Khoa />} />
            <Route path="khoa/lecturers" element={<DanhMuc_GiangVien_Khoa />} />
            <Route path="khoa/students" element={<DanhMuc_SinhVien_Khoa />} />
            <Route path="khoa/boards" element={<HoiDongChamBaoCao_Khoa />} />
            <Route path="khoa/accounts" element={<TaiKhoanNguoiDung_Khoa />} />
            <Route path="khoa/results" element={<KetQuaKienTap_MaTranDiem_Khoa />} />
            <Route path="khoa/notifications" element={<ThongBao_Khoa />} />
            <Route path="khoa/reports" element={<BaoCaoThongKe_Khoa />} />
          </Route>

          {/* CLB Portal Routes */}
          <Route element={<ProtectedRoute allowedRoles={['QuanLyCLB']} />}>
            <Route path="clb" element={<DashBoard_CLB />} />
            <Route path="clb/students" element={<DanhMuc_SinhVien_Khoa />} />
            <Route path="clb/factories" element={<DanhMuc_NhaMay_Khoa />} />
            <Route path="clb/trips" element={<ChuyenThamQuan_DSLoc />} />
            <Route path="clb/plans" element={<PlanManagement_Khoa />} />
            <Route path="clb/registrations" element={<RegistrationManagement_Khoa />} />
            <Route path="clb/supervisors" element={<SupervisorAssignment_Khoa />} />
            <Route path="clb/leaders" element={<LeaderAssignment_Khoa />} />
            <Route path="clb/fees" element={<QuanLyLePhi_Khoa />} />
            <Route path="clb/refund-approval" element={<DuyetHoanPhi_Khoa />} />
            <Route path="clb/visit-report" element={<XemTruocBaoCaoThamQuan_Khoa />} />
            <Route path="clb/results" element={<KetQuaKienTap_MaTranDiem_Khoa />} />
            <Route path="clb/notifications" element={<ThongBao_Khoa />} />
            <Route path="clb/reports" element={<BaoCaoThongKe_Khoa />} />
          </Route>
        </Route>

        {/* Fallback wildcard route */}
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

