import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Calendar,
  UploadCloud,
  GraduationCap,
  CreditCard,
  RotateCcw,
  Bell,
  LogOut,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User,
  UserCheck,
  Star,
  Activity,
  Presentation,
  Layers,
  FileCheck,
  Users,
  Award,
  Eye,
  EyeOff,
  Key,
  Database,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sinhVienApi, authApi, qtvApi } from '../services/api';

import { getValidSession, clearSession } from '../utils/auth';
import ChangePasswordModal from './ChangePasswordModal';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({
    'DANH MỤC HỆ THỐNG': true,
    'KẾ HOẠCH KIẾN TẬP': true,
    'ĐĂNG KÝ & PHÂN CÔNG': true,
    'ĐÁNH GIÁ & KẾT QUẢ': true,
    'TÀI CHÍNH': true,
  });

  const toggleGroup = (groupName) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const session = getValidSession();

  // Redirect if unauthenticated
  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true });
    }
  }, [session, navigate]);

  const user = session?.user;
  const token = session?.token;
  const vai_tro = user?.vai_tro;
  const ten_dang_nhap = user?.ten_dang_nhap;
  const details = user?.details;
  const phai_doi_mat_khau = user?.phai_doi_mat_khau;
  const fullName = details?.ho_ten || ten_dang_nhap || 'Người dùng';

  const getAvatarInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    const first = words[0][0];
    const last = words[words.length - 1][0];
    return `${first}${last}`.toUpperCase();
  };

  // Determine roles and metadata
  const isStudent = vai_tro === 'SinhVien';
  const isLecturer = vai_tro === 'GiangVien';
  const isAdmin = vai_tro === 'QuanTriVienHeThong';
  const isKhoa = vai_tro === 'QuanLyKhoa' || vai_tro === 'Khoa';
  const isClb = vai_tro === 'QuanLyCLB';

  const roleDisplayName = isStudent
    ? 'Sinh viên'
    : isLecturer
    ? 'Giảng viên'
    : isAdmin
    ? 'Admin Hệ thống'
    : isKhoa
    ? 'Quản lý Khoa'
    : 'Quản lý CLB';

  const roleSubtitle = isStudent
    ? 'HUIT — Khoa CNTP'
    : isLecturer
    ? 'HUIT — Giảng viên'
    : isAdmin
    ? 'HUIT — Admin Hệ thống'
    : isKhoa
    ? 'HUIT — Quản lý Khoa'
    : 'HUIT — Quản lý CLB';

  const roleHomePath = isStudent
    ? '/sinh-vien'
    : isLecturer
    ? '/giang-vien'
    : isAdmin
    ? '/qtv/accounts'
    : isKhoa
    ? '/khoa'
    : '/clb';

  const roleNotifPath = isStudent
    ? '/sinh-vien/notifications'
    : isLecturer
    ? '/giang-vien/notifications'
    : isAdmin
    ? '/qtv/accounts'
    : isKhoa
    ? '/khoa/notifications'
    : '/clb/notifications';

  // Poll notifications for student count badge
  useEffect(() => {
    if (isStudent && details?.id && !phai_doi_mat_khau) {
      sinhVienApi.getNotifications(details.id).then(res => {
        const unread = res.data?.filter(n => !n.da_doc)?.length || 0;
        setUnreadNotificationsCount(unread);
      }).catch(err => console.error(err));
    }
  }, [isStudent, details, phai_doi_mat_khau]);

  // Menu items for Sinh Vien
  const studentMenuItems = [
    { to: '/sinh-vien', label: 'Trang chủ', icon: Home, category: 'TRANG CHỦ' },
    { to: '/sinh-vien/register', label: 'Chuyến tham quan', icon: Compass, category: 'NONE' },
    { to: '/sinh-vien/schedule', label: 'Lịch trình đoàn', icon: Calendar, category: 'NONE' },
    { to: '/sinh-vien/reports', label: 'Nộp bài thu hoạch', icon: UploadCloud, category: 'NONE' },
    { to: '/sinh-vien/grades', label: 'Kết quả & điểm', icon: GraduationCap, category: 'NONE' },
    { to: '/sinh-vien/payment', label: 'Thanh toán', icon: CreditCard, category: 'NONE' },
    { to: '/sinh-vien/refund', label: 'Hoàn phí', icon: RotateCcw, category: 'NONE' },
    { to: '/sinh-vien/notifications', label: 'Thông báo', icon: Bell, category: 'NONE', badge: unreadNotificationsCount }
  ];

  // Menu items for Giang Vien
  const gvMenuItems = [
    { to: '/giang-vien', label: 'Trang chủ', icon: Home, category: 'TRANG CHỦ' },
    { to: '/giang-vien/led-trips', label: 'Lịch dẫn đoàn', icon: Calendar, category: 'NHIỆM VỤ DẪN ĐOÀN' },
    { to: '/giang-vien/attendance', label: 'Điểm danh sinh viên', icon: UserCheck, category: 'NHIỆM VỤ DẪN ĐOÀN' },
    { to: '/giang-vien/preparation', label: 'Điểm chuẩn bị & Cộng', icon: Star, category: 'NHIỆM VỤ DẪN ĐOÀN' },
    { to: '/giang-vien/guided-students', label: 'Sinh viên hướng dẫn', icon: User, category: 'CHUYÊN MÔN & HỘI ĐỒNG' },
    { to: '/giang-vien/grading', label: 'Chấm bài thu hoạch', icon: FileCheck, category: 'CHUYÊN MÔN & HỘI ĐỒNG' },
    { to: '/giang-vien/board', label: 'Buổi báo cáo TQNM', icon: Presentation, category: 'CHUYÊN MÔN & HỘI ĐỒNG' },
    { to: '/giang-vien/notifications', label: 'Thông báo', icon: Bell, category: 'THÔNG BÁO' }
  ];
  const gvCategories = ['TRANG CHỦ', 'NHIỆM VỤ DẪN ĐOÀN', 'CHUYÊN MÔN & HỘI ĐỒNG', 'THÔNG BÁO'];

  // Menu items for Khoa, CLB, Admin
  let khoaMenuItems = [];
  if (isAdmin) {
    khoaMenuItems = [
      { to: '/qtv/accounts', label: 'Tài khoản người dùng', icon: Key, category: 'DANH MỤC HỆ THỐNG' },
      { to: '/qtv/backup', label: 'Sao lưu & Phục hồi', icon: Database, category: 'DANH MỤC HỆ THỐNG' },
    ];
  } else if (isKhoa) {
    khoaMenuItems = [
      { to: '/khoa', label: 'Trang chủ', icon: Home, category: 'TRANG CHỦ' },
      { to: '/khoa/danh-muc', label: 'Danh mục', icon: Layers, category: 'QUẢN LÝ DANH MỤC' },
      { to: '/khoa/students', label: 'Sinh viên', icon: Users, category: 'QUẢN LÝ DANH MỤC' },
      { to: '/khoa/lecturers', label: 'Giảng viên', icon: User, category: 'QUẢN LÝ DANH MỤC' },
      { to: '/khoa/plans', label: 'Đợt kiến tập', icon: Calendar, category: 'TỔ CHỨC KIẾN TẬP' },
      { to: '/khoa/lich-kien-tap', label: 'Lịch kiến tập', icon: Layers, category: 'TỔ CHỨC KIẾN TẬP' },
      { to: '/khoa/trips', label: 'Duyệt chuyến khẩn cấp', icon: Compass, category: 'TỔ CHỨC KIẾN TẬP' },
      { to: '/khoa/supervisors', label: 'Phân công GVHD', icon: GraduationCap, category: 'TỔ CHỨC KIẾN TẬP' },
      { to: '/khoa/boards', label: 'Hội đồng chấm báo cáo', icon: Presentation, category: 'ĐÁNH GIÁ & KẾT QUẢ' },
      { to: '/khoa/results', label: 'Kết quả kiến tập', icon: Award, category: 'ĐÁNH GIÁ & KẾT QUẢ' },
      { to: '/khoa/notifications', label: 'Thông báo', icon: Bell, category: 'NONE', badge: true },
      { to: '/khoa/reports', label: 'Báo cáo thống kê', icon: Activity, category: 'NONE' }
    ];
  } else if (isClb) {
    khoaMenuItems = [
      { to: '/clb', label: 'Trang chủ', icon: Home, category: 'TRANG CHỦ' },
      { to: '/clb/students', label: 'Sinh viên', icon: Users, category: 'QUẢN LÝ DANH MỤC' },
      { to: '/clb/factories', label: 'Nhà máy', icon: Compass, category: 'QUẢN LÝ DANH MỤC' },
      { to: '/clb/lich-kien-tap', label: 'Lịch kiến tập', icon: Calendar, category: 'VẬN HÀNH KIẾN TẬP' },
      { to: '/clb/trips', label: 'Chuyến tham quan', icon: Compass, category: 'VẬN HÀNH KIẾN TẬP' },
      { to: '/clb/registrations', label: 'Quản lý đăng ký', icon: FileCheck, category: 'VẬN HÀNH KIẾN TẬP' },
      { to: '/clb/leaders', label: 'Phân công GV dẫn đoàn', icon: UserCheck, category: 'VẬN HÀNH KIẾN TẬP' },
      { to: '/clb/fees', label: 'Quản lý lệ phí', icon: CreditCard, category: 'TÀI CHÍNH' },
      { to: '/clb/refund-approval', label: 'Duyệt hoàn phí', icon: RotateCcw, category: 'TÀI CHÍNH' },
      { to: '/clb/notifications', label: 'Thông báo', icon: Bell, category: 'NONE', badge: true },
      { to: '/clb/reports', label: 'Báo cáo thống kê', icon: Activity, category: 'NONE' }
    ];
  }

  // Automatically expand active group on navigation for Khoa/CLB/Admin
  useEffect(() => {
    if (!isAdmin && !isKhoa && !isClb) return;
    const currentPath = location.pathname;
    const activeItem = khoaMenuItems.find(item => item.to === currentPath);
    if (activeItem && activeItem.category && activeItem.category !== 'NONE' && activeItem.category !== 'TRANG CHỦ') {
      setCollapsedGroups(prev => ({
        ...prev,
        [activeItem.category]: false
      }));
    }
  }, [location.pathname, isAdmin, isKhoa, isClb]);

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const executeLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const renderLogoutModal = () => {
    if (!showLogoutModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 w-[400px] max-w-[90vw] shadow-xl">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận đăng xuất</h3>
          <p className="text-slate-600 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100 font-semibold transition-colors">Hủy</button>
            <button onClick={executeLogout} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 font-semibold transition-colors">Đăng xuất</button>
          </div>
        </div>
      </div>
    );
  };

  if (!session) return null;

  if (phai_doi_mat_khau) {
    return (
      <ForceChangePasswordView
        user={user}
        onPasswordChanged={(updatedUser) => {
          localStorage.setItem('user', JSON.stringify({ user: updatedUser, token }));
          window.location.reload();
        }}
        onLogout={executeLogout}
      />
    );
  }

  const getActiveViewLabel = () => {
    const path = location.pathname;
    if (path === '/sinh-vien') return 'Trang chủ';
    if (path === '/sinh-vien/register') return 'Chuyến tham quan';
    if (path === '/sinh-vien/schedule') return 'Lịch trình đoàn';
    if (path === '/sinh-vien/reports') return 'Nộp bài thu hoạch';
    if (path === '/sinh-vien/grades') return 'Kết quả & điểm';
    if (path === '/sinh-vien/payment') return 'Thanh toán';
    if (path === '/sinh-vien/refund') return 'Hoàn phí';
    if (path === '/sinh-vien/notifications') return 'Thông báo';

    if (path === '/giang-vien') return 'Trang chủ';
    if (path === '/giang-vien/led-trips') return 'Lịch dẫn đoàn';
    if (path === '/giang-vien/attendance') return 'Điểm danh sinh viên';
    if (path === '/giang-vien/preparation') return 'Điểm chuẩn bị & Cộng';
    if (path === '/giang-vien/guided-students') return 'Sinh viên hướng dẫn';
    if (path === '/giang-vien/grading') return 'Chấm bài thu hoạch';
    if (path === '/giang-vien/board') return 'Hội đồng chấm báo cáo';
    if (path === '/giang-vien/notifications') return 'Thông báo';

    if (path === '/khoa') return 'Trang chủ';
    if (path === '/khoa/danh-muc') return 'Danh mục';
    if (path === '/khoa/lich-kien-tap') return 'Lịch kiến tập';
    if (path === '/khoa/students') return 'Quản lý Sinh viên';
    if (path === '/khoa/lecturers') return 'Quản lý Giảng viên';
    if (path === '/khoa/plans') return 'Đợt kiến tập';
    if (path === '/khoa/trips') return 'Duyệt chuyến khẩn cấp';
    if (path === '/khoa/registrations') return 'Quản lý đăng ký';
    if (path === '/khoa/supervisors') return 'Phân công GVHD';
    if (path === '/khoa/leaders') return 'Phân công GV dẫn đoàn';
    if (path === '/khoa/boards') return 'Hội đồng chấm báo cáo';
    if (path === '/khoa/notifications') return 'Thông báo';
    if (path === '/khoa/reports') return 'Báo cáo thống kê';
    if (path === '/qtv/accounts') return 'Tài khoản người dùng';
    if (path === '/qtv/backup') return 'Sao lưu & Phục hồi cơ sở dữ liệu';
    if (path === '/khoa/fees') return 'Quản lý lệ phí';
    if (path === '/khoa/results') return 'Kết quả kiến tập';
    if (path === '/khoa/refund-approval') return 'Duyệt hoàn phí';
    if (path === '/khoa/visit-report') return 'Báo cáo tham quan';

    if (path === '/clb') return 'Trang chủ';
    if (path === '/clb/students') return 'Quản lý Sinh viên';
    if (path === '/clb/lich-kien-tap') return 'Lịch kiến tập';
    if (path === '/clb/registrations') return 'Quản lý đăng ký';
    if (path === '/clb/supervisors') return 'Phân công GVHD';
    if (path === '/clb/leaders') return 'Phân công GV dẫn đoàn';
    if (path === '/clb/fees') return 'Quản lý lệ phí';
    if (path === '/clb/refund-approval') return 'Duyệt hoàn phí';
    if (path === '/clb/visit-report') return 'Báo cáo tham quan';
    if (path === '/clb/factories') return 'Nhà máy';
    if (path === '/clb/trips') return 'Chuyến tham quan';
    if (path === '/clb/notifications') return 'Thông báo';
    if (path === '/clb/reports') return 'Báo cáo thống kê';

    return 'IMS Portal';
  };

  // Render Sidebar Navigation based on Role
  const renderSidebarNav = () => {
    if (isStudent) {
      return (
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 sidebar-scrollbar">
          {studentMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#407F3E] shadow-md font-bold scale-[1.02]'
                    : 'text-white/80 hover:bg-[#89B449]/25 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>
                {item.badge !== undefined && item.badge > 0 && !isSidebarCollapsed && (
                  <span className="bg-[#DBD468] text-[#191d17] font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      );
    }

    if (isLecturer) {
      return (
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-5 sidebar-scrollbar">
          {gvCategories.map((cat) => {
            const items = gvMenuItems.filter((item) => item.category === cat);
            return (
              <div key={cat} className="space-y-1">
                {!isSidebarCollapsed && (
                  <p className="px-4 text-[10px] font-bold tracking-widest uppercase text-[#e5ffdc]/50 mb-2">
                    {cat}
                  </p>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-white text-[#407F3E] shadow-md font-bold scale-[1.02]'
                          : 'text-white/80 hover:bg-[#89B449]/25 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      );
    }

    // Khoa / CLB / Admin Navigation
    return (
      <nav className="flex-1 overflow-y-auto px-3.5 pt-4 pb-6 space-y-3.5 sidebar-scrollbar overscroll-contain">
        {/* Top-level item: Trang chủ */}
        {(() => {
          const homeItem = khoaMenuItems.find(i => i.to === roleHomePath && i.category === 'TRANG CHỦ');
          if (homeItem) {
            const Icon = homeItem.icon;
            const isActive = location.pathname === homeItem.to;
            return (
              <Link
                to={homeItem.to}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white font-bold border-l-4 border-[#DBD468] pl-3 shadow-xs'
                    : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 shrink-0 stroke-[1.8]" />
                  {!isSidebarCollapsed && <span className="text-[13.5px] truncate">{homeItem.label}</span>}
                </div>
              </Link>
            );
          }
          return null;
        })()}

        {/* Collapsible Groups */}
        {['QUẢN LÝ DANH MỤC', 'TỔ CHỨC KIẾN TẬP', 'VẬN HÀNH KIẾN TẬP', 'ĐÁNH GIÁ & KẾT QUẢ', 'TÀI CHÍNH', 'DANH MỤC HỆ THỐNG'].map((group) => {
          const items = khoaMenuItems.filter((item) => item.category === group);
          if (items.length === 0) return null;
          const isCollapsed = collapsedGroups[group];

          return (
            <div key={group} className="space-y-1">
              <button
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center justify-between px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-white/50 hover:text-white/85 transition-colors cursor-pointer select-none"
              >
                <span>{group}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                )}
              </button>

              {!isCollapsed && (
                <div className="pl-1.5 space-y-1 transition-all duration-300">
                  {items.map((item) => {
                    const Icon = item.icon;
                    if (item.isAction) {
                      return (
                        <button
                          key={item.id || item.label}
                          type="button"
                          onClick={() => setShowBackupModal(true)}
                          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer text-white/80 hover:bg-white/10 hover:text-white font-medium"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 shrink-0 stroke-[1.8]" />
                            {!isSidebarCollapsed && <span className="text-[13.5px] truncate">{item.label}</span>}
                          </div>
                        </button>
                      );
                    }
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to + '-' + item.label}
                        to={item.to}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-white/15 text-white font-bold border-l-4 border-[#DBD468] pl-3 shadow-xs'
                            : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 shrink-0 stroke-[1.8]" />
                          {!isSidebarCollapsed && <span className="text-[13.5px] truncate">{item.label}</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Top-level items below the groups */}
        <div className="pt-2 border-t border-white/10 space-y-1">
          {khoaMenuItems
            .filter((item) => item.category === 'NONE')
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to + '-' + item.label}
                  to={item.to}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white/15 text-white font-bold border-l-4 border-[#DBD468] pl-3 shadow-xs'
                      : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0 stroke-[1.8]" />
                    {!isSidebarCollapsed && <span className="text-[13.5px] truncate">{item.label}</span>}
                  </div>
                  {item.badge && !isSidebarCollapsed && (
                    <span className="bg-[#DBD468] text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-2xs leading-none">
                      Mới
                    </span>
                  )}
                </Link>
              );
            })}
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8faf1] flex font-sans">
      {/* Unified Sidebar for all 4 roles */}
      <aside className={`fixed left-0 top-0 h-screen transition-transform duration-300 bg-[#407F3E] w-[260px] ${isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'} text-white z-50 flex flex-col shadow-xl border-r border-[#2c6b2d]/10`}>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute -right-3.5 top-6 w-7 h-7 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-[#407F3E] transition-all z-[100] ${isSidebarCollapsed ? 'translate-x-[20px]' : ''}`}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Sidebar Brand / Logo */}
        <div className="flex flex-col border-b border-white/10 bg-[#2c6b2d]/15">
          <div className="h-16 flex items-center justify-center px-4">
            {isSidebarCollapsed ? (
              <div className="font-black text-2xl tracking-tighter">HUIT</div>
            ) : (
              <img src="/huit-logo.png" alt="Logo HUIT" className="w-44 max-w-full h-auto object-contain brightness-0 invert opacity-95 shrink-0" />
            )}
          </div>
          <div className="pb-3.5 px-4 flex flex-col items-center text-center gap-0.5">
            {!isSidebarCollapsed && (
              <span className="font-extrabold text-[15px] leading-tight text-white uppercase tracking-wider block">
                Quản lý kiến tập
              </span>
            )}
            {!isSidebarCollapsed && (
              <span className="text-[10px] text-[#e5ffdc]/70 font-semibold tracking-widest block uppercase">
                {roleSubtitle}
              </span>
            )}
          </div>
        </div>

        {/* Navigation list */}
        {renderSidebarNav()}

        {/* Sidebar Footer with User Info & Actions */}
        <div className="p-4 border-t border-white/10 bg-[#2c6b2d]/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/20 font-bold text-white text-sm shrink-0 select-none">
              {getAvatarInitials(fullName)}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold text-sm truncate">{fullName}</span>
                <span className="text-[#e5ffdc]/60 text-xs">{roleDisplayName}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-all text-sm font-bold border border-white/10 cursor-pointer"
              title="Đổi mật khẩu"
            >
              <Key className="w-4 h-4 text-[#DBD468] shrink-0" />
              {!isSidebarCollapsed && <span>Đổi mật khẩu</span>}
            </button>
            <button
              onClick={confirmLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all text-sm font-bold border border-red-500/20 cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'pl-0' : 'pl-[260px]'} min-w-0`}>
        {/* Unified Top Header for all 4 roles */}
        <header className={`fixed top-0 right-0 h-16 bg-white border-b border-[#E7E0C4] z-40 flex items-center justify-between px-6 shadow-sm transition-all duration-300 ${isSidebarCollapsed ? 'left-0' : 'left-[260px]'}`}>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm truncate">
            <Link to={roleHomePath} className="hover:text-[#407F3E] transition-colors flex items-center gap-2 font-semibold shrink-0">
              <Home className="w-4 h-4" />
              <span>IMS Portal</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-bold truncate">{getActiveViewLabel()}</span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications Link */}
            <Link
              to={roleNotifPath}
              className="relative p-2 text-slate-600 hover:text-[#407F3E] hover:bg-[#ecefe6] rounded-full transition-all cursor-pointer"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {isStudent && unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
              )}
              {(isKhoa || isClb) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#DBD468] rounded-full border-2 border-white"></span>
              )}
            </Link>

            <div className="w-px h-6 bg-[#E7E0C4]"></div>

            {/* User Dropdown Pill */}
            <div className="relative">
              <div 
                className="flex items-center gap-3 cursor-pointer py-1 px-2 rounded-full hover:bg-slate-50 transition-colors"
                onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(!isUserMenuOpen); }}
              >
                <div className="w-8 h-8 rounded-full bg-[#E7E0C4] text-[#407F3E] flex items-center justify-center font-bold text-xs shadow-xs border border-[#407F3E]/20 shrink-0 select-none">
                  {getAvatarInitials(fullName)}
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 truncate max-w-[170px]">{fullName}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-[#407F3E]/10 text-[#407F3E] text-[10px] font-bold rounded-full uppercase tracking-wider border border-[#407F3E]/20 shrink-0">
                    {roleDisplayName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#E7E0C4] text-[#407F3E] flex items-center justify-center font-bold text-xs border border-[#407F3E]/20 shrink-0 select-none">
                        {getAvatarInitials(fullName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{fullName}</p>
                        <p className="text-[11px] text-slate-500 font-medium truncate">{session?.user?.ten_dang_nhap || roleDisplayName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-[#407F3E]/10 hover:text-[#407F3E] rounded-xl font-medium transition-colors cursor-pointer text-left"
                    >
                      <Key className="w-4 h-4 text-[#407F3E]" />
                      <span>Đổi mật khẩu</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        confirmLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 flex flex-col pt-16 bg-[#f8faf1] min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Global Change Password Modal for all 4 roles */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Logout confirmation modal */}
      {renderLogoutModal()}
    </div>
  );
}

function ForceChangePasswordView({ user, onPasswordChanged, onLogout }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const hasMinLength = newPass.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPass);
  const hasLowerCase = /[a-z]/.test(newPass);
  const hasNumber = /[0-9]/.test(newPass);
  const isMatch = newPass === confirmPass && confirmPass !== '';
  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && isMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);

    try {
      await authApi.changePassword(oldPass, newPass);
      setSuccess(true);
      setTimeout(() => {
        onPasswordChanged({ ...user, phai_doi_mat_khau: false });
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf1] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-[#e5ffdc] text-[#407F3E] rounded-2xl flex items-center justify-center shadow-inner mb-4">
            <Key className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Yêu cầu đổi mật khẩu</h2>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Tài khoản của bạn đang sử dụng mật khẩu mặc định. Để bảo vệ dữ liệu học tập và thông tin cá nhân, vui lòng đổi mật khẩu mới để tiếp tục.
          </p>
        </div>

        {success ? (
          <div className="bg-[#e5ffdc] border border-[#407F3E]/20 text-[#407F3E] p-6 rounded-2xl text-center space-y-2">
            <div className="w-10 h-10 bg-[#407F3E] text-white rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-base">Đổi mật khẩu thành công!</h3>
            <p className="text-xs text-[#407F3E]/80">Đang chuyển hướng vào hệ thống...</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-[#ba1a1a] px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Mật khẩu hiện tại (Mặc định)
              </label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  required
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#407F3E]/50 focus:border-transparent text-sm transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3.5 top-3 text-slate-450 hover:text-slate-600 cursor-pointer"
                >
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#407F3E]/50 focus:border-transparent text-sm transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-3 text-slate-450 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#407F3E]/50 focus:border-transparent text-sm transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-3 text-slate-450 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Requirements list */}
            <div className="bg-[#f8faf1] rounded-2xl p-4 border border-[#e5ffdc] space-y-2">
              <p className="text-[10px] font-bold text-[#407F3E] uppercase tracking-wider mb-1">
                Yêu cầu mật khẩu phức tạp:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-[#407F3E]' : 'bg-red-400'}`}></span>
                  <span className={hasMinLength ? 'text-[#407F3E]' : 'text-slate-500'}>Tối thiểu 8 ký tự</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${hasUpperCase ? 'bg-[#407F3E]' : 'bg-red-400'}`}></span>
                  <span className={hasUpperCase ? 'text-[#407F3E]' : 'text-slate-500'}>Ít nhất 1 chữ hoa (A-Z)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${hasLowerCase ? 'bg-[#407F3E]' : 'bg-red-400'}`}></span>
                  <span className={hasLowerCase ? 'text-[#407F3E]' : 'text-slate-500'}>Ít nhất 1 chữ thường (a-z)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-[#407F3E]' : 'bg-red-400'}`}></span>
                  <span className={hasNumber ? 'text-[#407F3E]' : 'text-slate-500'}>Ít nhất 1 chữ số (0-9)</span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isMatch ? 'bg-[#407F3E]' : 'bg-red-400'}`}></span>
                  <span className={isMatch ? 'text-[#407F3E]' : 'text-slate-500'}>Mật khẩu xác nhận trùng khớp</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading || !isValid}
                className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#407F3E] hover:bg-[#2c6b2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#407F3E] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
