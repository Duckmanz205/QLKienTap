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
  Key
} from 'lucide-react';
import { sinhVienApi } from '../services/api';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
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

  const userJson = localStorage.getItem('user');
  
  useEffect(() => {
    if (!userJson) {
      navigate('/login');
    }
  }, [userJson, navigate]);

  if (!userJson) return null;

  const { user } = JSON.parse(userJson);
  const { vai_tro, ten_dang_nhap, details } = user;
  const fullName = details?.ho_ten || ten_dang_nhap;

  // Poll notifications for student count badge
  useEffect(() => {
    if (vai_tro === 'SinhVien' && details?.id) {
      sinhVienApi.getNotifications(details.id).then(res => {
        const unread = res.data.filter(n => !n.da_doc).length;
        setUnreadNotificationsCount(unread);
      }).catch(err => console.error(err));
    }
  }, [vai_tro, details]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

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
    if (path === '/khoa/schedules') return 'Danh mục nền';
    if (path === '/khoa/students') return 'Quản lý Sinh viên';
    if (path === '/khoa/plans') return 'Đợt kiến tập';
    if (path === '/khoa/registrations') return 'Quản lý đăng ký';
    if (path === '/khoa/supervisors') return 'Phân công GVHD';
    if (path === '/khoa/leaders') return 'Phân công GV dẫn đoàn';
    if (path === '/khoa/notifications') return 'Thông báo';
    if (path === '/khoa/reports') return 'Báo cáo thống kê';
    if (path === '/khoa/accounts') return 'Tài khoản người dùng';
    if (path === '/khoa/fees') return 'Quản lý lệ phí';
    if (path === '/khoa/results') return 'Kết quả kiến tập';
    if (path === '/khoa/refund-approval') return 'Duyệt hoàn phí';
    if (path === '/khoa/visit-report') return 'Báo cáo tham quan';
    return 'IMS Portal';
  };

  // --- 1. STUDENT SIDEBAR AND LAYOUT ---
  if (vai_tro === 'SinhVien') {
    const studentMenuItems = [
      { to: '/sinh-vien', label: 'Trang chủ', icon: Home, category: 'TRANG CHỦ' },
      { to: '/sinh-vien/register', label: 'Chuyến tham quan', icon: Compass, category: 'KIẾN TẬP CỦA TÔI' },
      { to: '/sinh-vien/schedule', label: 'Lịch trình đoàn', icon: Calendar, category: 'KIẾN TẬP CỦA TÔI' },
      { to: '/sinh-vien/reports', label: 'Nộp bài thu hoạch', icon: UploadCloud, category: 'KIẾN TẬP CỦA TÔI' },
      { to: '/sinh-vien/grades', label: 'Kết quả & điểm', icon: GraduationCap, category: 'KIẾN TẬP CỦA TÔI' },
      { to: '/sinh-vien/payment', label: 'Thanh toán', icon: CreditCard, category: 'TÀI CHÍNH' },
      { to: '/sinh-vien/refund', label: 'Hoàn phí', icon: RotateCcw, category: 'TÀI CHÍNH' },
      { to: '/sinh-vien/notifications', label: 'Thông báo', icon: Bell, category: 'THÔNG BÁO', badge: unreadNotificationsCount }
    ];

    const studentCategories = ['TRANG CHỦ', 'KIẾN TẬP CỦA TÔI', 'TÀI CHÍNH', 'THÔNG BÁO'];

    return (
      <div className="min-h-screen bg-[#f8faf1] flex font-sans">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#407F3E] text-white z-50 flex flex-col shadow-xl border-r border-[#2c6b2d]/10">
          <div className="p-6 flex flex-col gap-3 items-center border-b border-white/10 bg-[#2c6b2d]/15">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="font-bold text-[16px] leading-tight text-white uppercase tracking-wider block">
                Quản lý kiến tập
              </span>
              <span className="text-[11px] text-[#e5ffdc]/70 font-semibold tracking-widest block uppercase mt-0.5">
                Khoa CNTP
              </span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
            {studentCategories.map((cat) => {
              const items = studentMenuItems.filter((item) => item.category === cat);
              return (
                <div key={cat} className="space-y-1">
                  <p className="px-4 text-[10px] font-bold tracking-widest uppercase text-[#e5ffdc]/50 mb-2">
                    {cat}
                  </p>
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
                          <Icon className="w-[18px] h-[18px]" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="bg-[#DBD468] text-[#191d17] font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 bg-[#2c6b2d]/10 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-white/20 font-bold text-white">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold text-sm truncate">{fullName}</span>
                <span className="text-[#e5ffdc]/60 text-xs">Sinh viên</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all text-sm font-bold border border-red-500/20 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col pl-[260px] min-w-0">
          {/* Header */}
          <header className="fixed top-0 left-[260px] right-0 h-16 bg-white border-b border-surface-variant/60 z-40 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
              <Link to="/sinh-vien" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span>IMS Portal</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-outline/50" />
              <span className="text-on-surface font-semibold">{getActiveViewLabel()}</span>
            </div>

            <div className="flex items-center gap-6">
              <Link 
                to="/sinh-vien/notifications"
                className="relative p-2 text-on-surface-variant hover:bg-[#ecefe6] hover:text-primary rounded-full transition-all"
                title="Thông báo"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
                )}
              </Link>

              <div className="flex items-center gap-3 bg-[#f2f5ec] pl-3 pr-1 py-1 rounded-full border border-surface-variant">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-on-surface leading-tight">{fullName}</p>
                  <p className="text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase">Sinh viên</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto pt-24 pb-8 px-6 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // --- 2. LECTURER SIDEBAR AND LAYOUT ---
  if (vai_tro === 'GiangVien') {
    const gvMenuItems = [
      { to: '/giang-vien', label: 'Trang chủ', icon: Home, category: 'TRANG CHỦ' },
      { to: '/giang-vien/led-trips', label: 'Lịch dẫn đoàn', icon: Calendar, category: 'DẪN ĐOÀN' },
      { to: '/giang-vien/attendance', label: 'Điểm danh sinh viên', icon: UserCheck, category: 'DẪN ĐOÀN' },
      { to: '/giang-vien/preparation', label: 'Điểm chuẩn bị & Cộng', icon: Star, category: 'DẪN ĐOÀN' },
      { to: '/giang-vien/guided-students', label: 'Sinh viên hướng dẫn', icon: User, category: 'HƯỚNG DẪN' },
      { to: '/giang-vien/board', label: 'Buổi báo cáo TQNM', icon: Presentation, category: 'HỘI ĐỒNG' },
      { to: '/giang-vien/notifications', label: 'Thông báo', icon: Bell, category: 'THÔNG BÁO' }
    ];

    const gvCategories = ['TRANG CHỦ', 'DẪN ĐOÀN', 'HƯỚNG DẪN', 'HỘI ĐỒNG', 'THÔNG BÁO'];

    return (
      <div className="min-h-screen bg-[#f8faf1] flex font-sans">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#407F3E] text-white z-50 flex flex-col shadow-xl border-r border-[#2c6b2d]/10">
          <div className="p-6 flex flex-col gap-3 items-center border-b border-white/10 bg-[#2c6b2d]/15">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="font-bold text-[16px] leading-tight text-white uppercase tracking-wider block">
                Quản lý kiến tập
              </span>
              <span className="text-[11px] text-[#e5ffdc]/70 font-semibold tracking-widest block uppercase mt-0.5">
                Giảng viên
              </span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
            {gvCategories.map((cat) => {
              const items = gvMenuItems.filter((item) => item.category === cat);
              return (
                <div key={cat} className="space-y-1">
                  <p className="px-4 text-[10px] font-bold tracking-widest uppercase text-[#e5ffdc]/50 mb-2">
                    {cat}
                  </p>
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
                          <Icon className="w-[18px] h-[18px]" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 bg-[#2c6b2d]/10 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-white/20 font-bold text-white">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold text-sm truncate">{fullName}</span>
                <span className="text-[#e5ffdc]/60 text-xs">Giảng viên</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all text-sm font-bold border border-red-500/20 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col pl-[260px] min-w-0">
          {/* Header */}
          <header className="fixed top-0 left-[260px] right-0 h-16 bg-white border-b border-surface-variant/60 z-40 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
              <Link to="/giang-vien" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span>IMS Portal</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-outline/50" />
              <span className="text-on-surface font-semibold">{getActiveViewLabel()}</span>
            </div>

            <div className="flex items-center gap-6">
              <Link 
                to="/giang-vien/notifications"
                className="relative p-2 text-on-surface-variant hover:bg-[#ecefe6] hover:text-primary rounded-full transition-all"
                title="Thông báo"
              >
                <Bell className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-3 bg-[#f2f5ec] pl-3 pr-1 py-1 rounded-full border border-surface-variant">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-on-surface leading-tight">{fullName}</p>
                  <p className="text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase">Giảng viên</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto pt-24 pb-8 px-6 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // --- 3. KHOA/ADMIN SIDEBAR AND LAYOUT ---
  const khoaMenuItems = [
    { to: '/khoa', label: 'Trang chủ', icon: Home, category: 'TRANG CHỦ' },
    // DANH MỤC HỆ THỐNG
    { to: '/khoa/schedules', label: 'Danh mục nền', icon: Layers, category: 'DANH MỤC HỆ THỐNG' },
    { to: '/khoa/students', label: 'Sinh viên', icon: Users, category: 'DANH MỤC HỆ THỐNG' },
    { to: '/khoa/lecturers', label: 'Giảng viên', icon: User, category: 'DANH MỤC HỆ THỐNG' },
    { to: '/khoa/factories', label: 'Nhà máy', icon: Compass, category: 'DANH MỤC HỆ THỐNG' },
    { to: '/khoa/accounts', label: 'Tài khoản người dùng', icon: Key, category: 'DANH MỤC HỆ THỐNG' },
    // KẾ HOẠCH KIẾN TẬP
    { to: '/khoa/plans', label: 'Đợt kiến tập', icon: Calendar, category: 'KẾ HOẠCH KIẾN TẬP' },
    { to: '/khoa/schedules', label: 'Lịch kiến tập', icon: Layers, category: 'KẾ HOẠCH KIẾN TẬP' },
    { to: '/khoa/trips', label: 'Chuyến tham quan', icon: Compass, category: 'KẾ HOẠCH KIẾN TẬP' },
    // ĐĂNG KÝ & PHÂN CÔNG
    { to: '/khoa/registrations', label: 'Quản lý đăng ký', icon: FileCheck, category: 'ĐĂNG KÝ & PHÂN CÔNG' },
    { to: '/khoa/supervisors', label: 'Phân công GVHD', icon: GraduationCap, category: 'ĐĂNG KÝ & PHÂN CÔNG' },
    { to: '/khoa/leaders', label: 'Phân công GV dẫn đoàn', icon: UserCheck, category: 'ĐĂNG KÝ & PHÂN CÔNG' },
    // ĐÁNH GIÁ & KẾT QUẢ
    { to: '/khoa/boards', label: 'Hội đồng chấm báo cáo', icon: Presentation, category: 'ĐÁNH GIÁ & KẾT QUẢ' },
    { to: '/khoa/results', label: 'Kết quả kiến tập', icon: Award, category: 'ĐÁNH GIÁ & KẾT QUẢ' },
    // TÀI CHÍNH
    { to: '/khoa/fees', label: 'Quản lý lệ phí', icon: CreditCard, category: 'TÀI CHÍNH' },
    { to: '/khoa/refund-approval', label: 'Duyệt hoàn phí', icon: RotateCcw, category: 'TÀI CHÍNH' },
    // Standalone top-levels below the groups
    { to: '/khoa/notifications', label: 'Thông báo', icon: Bell, category: 'NONE', badge: true },
    { to: '/khoa/reports', label: 'Báo cáo thống kê', icon: Activity, category: 'NONE' }
  ];

  useEffect(() => {
    // Automatically expand the group containing the active path on navigation
    const currentPath = location.pathname;
    const activeItem = khoaMenuItems.find(item => item.to === currentPath);
    if (activeItem && activeItem.category && activeItem.category !== 'NONE' && activeItem.category !== 'TRANG CHỦ') {
      setCollapsedGroups(prev => ({
        ...prev,
        [activeItem.category]: false
      }));
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#E7E0C4]/30 flex font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[264px] bg-[#407F3E] text-white z-50 flex flex-col shadow-xl border-r border-[#2c6b2d]/10">
        <div className="p-6 flex flex-col gap-3 items-center border-b border-white/10 bg-white/5">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <div className="text-center">
            <span className="font-bold text-[16px] leading-tight text-white uppercase tracking-wider block">
              Quản lý kiến tập
            </span>
            <span className="text-[11px] text-[#e5ffdc]/70 font-semibold tracking-widest block uppercase mt-0.5">
              Quản lý Khoa
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {/* Top-level item: Trang chủ */}
          {(() => {
            const homeItem = khoaMenuItems.find(i => i.to === '/khoa' && i.category === 'TRANG CHỦ');
            if (homeItem) {
              const Icon = homeItem.icon;
              const isActive = location.pathname === homeItem.to;
              return (
                <Link
                  to={homeItem.to}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#407F3E] shadow-md font-bold scale-[1.02]'
                      : 'text-white hover:bg-[#89B449]/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{homeItem.label}</span>
                  </div>
                </Link>
              );
            }
            return null;
          })()}

          {/* Collapsible Groups */}
          {['DANH MỤC HỆ THỐNG', 'KẾ HOẠCH KIẾN TẬP', 'ĐĂNG KÝ & PHÂN CÔNG', 'ĐÁNH GIÁ & KẾT QUẢ', 'TÀI CHÍNH'].map((group) => {
            const items = khoaMenuItems.filter((item) => item.category === group);
            const isCollapsed = collapsedGroups[group];

            return (
              <div key={group} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold tracking-wider uppercase text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{group}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="pl-2 space-y-1 transition-all duration-300">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.to;
                      return (
                        <Link
                          key={item.to + '-' + item.label}
                          to={item.to}
                          className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-white text-[#407F3E] shadow-md font-bold scale-[1.02]'
                              : 'text-white/80 hover:bg-[#89B449]/20 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-[18px] h-[18px]" />
                            <span>{item.label}</span>
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
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#407F3E] shadow-md font-bold scale-[1.02]'
                        : 'text-white hover:bg-[#89B449]/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-[18px] h-[18px]" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-[#DBD468] text-[#191d17] font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                        Mới
                      </span>
                    )}
                  </Link>
                );
              })}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 bg-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/20 font-bold text-white">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white font-bold text-sm truncate">{fullName}</span>
              <span className="text-[#e5ffdc]/60 text-xs">Quản lý Khoa</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all text-sm font-bold border border-red-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col pl-[264px] min-w-0">
        {/* Header */}
        <header className="fixed top-0 left-[264px] right-0 h-16 bg-white border-b border-[#E7E0C4] z-40 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
            <Link to="/khoa" className="hover:text-[#407F3E] transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>IMS Portal</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-semibold">{getActiveViewLabel()}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              to="/khoa/notifications"
              className="relative p-2 text-slate-600 hover:bg-[#E7E0C4]/30 hover:text-[#407F3E] rounded-full transition-all"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DBD468] rounded-full"></span>
            </Link>

            <div className="flex items-center gap-3 bg-[#E7E0C4]/30 pl-3 pr-1 py-1 rounded-full border border-[#E7E0C4]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{fullName}</p>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Quản lý Khoa</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#407F3E] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto pt-24 pb-8 px-6 md:px-8 bg-[#E7E0C4]/10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
