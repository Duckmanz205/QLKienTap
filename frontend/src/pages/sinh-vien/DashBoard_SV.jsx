import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Bell,
  Laptop,
  FileText,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function DashBoard_SV() {
  const navigate = useNavigate();

  // 1. Đọc user từ session đồng bộ (0ms UI Init)
  const sessionUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u)?.user : null;
    } catch {
      return null;
    }
  })();

  // 2. Đọc SWR cache từ sessionStorage để hiển thị tức thì khi chuyển tab
  const cacheKey = sessionUser?.id ? `sv_dashboard_cache_${sessionUser.id}` : null;
  const cachedData = (() => {
    if (!cacheKey) return null;
    try {
      const data = sessionStorage.getItem(cacheKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const [student, setStudent] = useState(() => {
    return (
      cachedData?.student ||
      sessionUser?.details ||
      (sessionUser?.vai_tro === 'SinhVien'
        ? { id: sessionUser.id, ho_ten: sessionUser.ten_dang_nhap }
        : null)
    );
  });
  const [trips, setTrips] = useState(() => cachedData?.trips || []);
  const [notifications, setNotifications] = useState(() => cachedData?.notifications || []);
  const [stats, setStats] = useState(() => cachedData?.stats || {
    totalTrips: 0,
    registered: 0,
    completed: 0,
    submittedReports: 0,
    pendingReports: 0,
    unpaidInvoicesCount: 0,
    totalUnpaidAmount: 0,
    bannedTripsCount: 0,
    isBlacklisted: false,
    blacklistReason: null,
    avgScore: 'Chưa có',
    termStatus: 'DangThucHien',
    boChuyenStatus: null,
  });
  const [loading, setLoading] = useState(!cachedData);
  const [errorState, setErrorState] = useState(null);

  useEffect(() => {
    loadAllDashboardData();
  }, []);

  const loadAllDashboardData = async () => {
    if (!sessionUser) {
      setErrorState('Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    try {
      const accountId = sessionUser.id;
      const knownSvId = sessionUser.details?.id;

      // Kịch bản A: Đã có ID sinh viên trong session -> Chạy song song cả 4 API ngay từ 0ms!
      if (knownSvId) {
        const [profileRes, tripsRes, notifsRes, statsRes] = await Promise.allSettled([
          sinhVienApi.getProfile(accountId),
          sinhVienApi.getRegisteredTrips(knownSvId),
          sinhVienApi.getNotifications(knownSvId, { limit: 5 }),
          sinhVienApi.getDashboardStats(knownSvId),
        ]);

        let freshStudent = student;
        if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
          freshStudent = profileRes.value.data;
          setStudent(freshStudent);
          // Đồng bộ ngược lại details vào localStorage để tăng tốc toàn app
          try {
            const raw = JSON.parse(localStorage.getItem('user') || '{}');
            raw.user = { ...raw.user, details: freshStudent };
            localStorage.setItem('user', JSON.stringify(raw));
          } catch (e) {
            console.error('Failed to sync details to localStorage:', e);
          }
        }

        let freshTrips = trips;
        if (tripsRes.status === 'fulfilled') {
          freshTrips = tripsRes.value?.data || [];
          setTrips(freshTrips);
        }

        let freshNotifs = notifications;
        if (notifsRes.status === 'fulfilled') {
          freshNotifs = notifsRes.value?.data || [];
          setNotifications(freshNotifs);
        }

        let freshStats = stats;
        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          freshStats = statsRes.value.data;
          setStats(freshStats);
        }

        // Lưu vào sessionStorage (SWR cache)
        if (cacheKey) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              student: freshStudent,
              trips: freshTrips,
              notifications: freshNotifs,
              stats: freshStats,
            }));
          } catch (e) {
            console.error('Failed to sync cache to sessionStorage:', e);
          }
        }
      } else {
        // Kịch bản B: Chưa có ID sinh viên trong session -> Nạp Profile trước, sau đó nạp song song 3 API
        const pRes = await sinhVienApi.getProfile(accountId);
        const svData = pRes.data;
        if (!svData || !svData.id) {
          throw new Error('Không tìm thấy thông tin hồ sơ sinh viên');
        }
        setStudent(svData);

        try {
          const raw = JSON.parse(localStorage.getItem('user') || '{}');
          raw.user = { ...raw.user, details: svData };
          localStorage.setItem('user', JSON.stringify(raw));
        } catch (e) {}

        const [tripsRes, notifsRes, statsRes] = await Promise.allSettled([
          sinhVienApi.getRegisteredTrips(svData.id),
          sinhVienApi.getNotifications(svData.id, { limit: 5 }),
          sinhVienApi.getDashboardStats(svData.id),
        ]);

        const freshTrips = tripsRes.status === 'fulfilled' ? (tripsRes.value?.data || []) : [];
        const freshNotifs = notifsRes.status === 'fulfilled' ? (notifsRes.value?.data || []) : [];
        const freshStats = statsRes.status === 'fulfilled' && statsRes.value?.data ? statsRes.value.data : stats;

        setTrips(freshTrips);
        setNotifications(freshNotifs);
        setStats(freshStats);

        if (cacheKey) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              student: svData,
              trips: freshTrips,
              notifications: freshNotifs,
              stats: freshStats,
            }));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu trang Dashboard sinh viên:', err);
      if (!student) {
        setErrorState(err.response?.data?.message || err.message || 'Không thể tải dữ liệu học tập.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Màn hình báo lỗi thân thiện kèm nút Thử lại khi không có bất kỳ dữ liệu sinh viên nào
  if (errorState && !student) {
    return (
      <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 flex items-center justify-center animate-in fade-in duration-300">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-200 max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Không thể tải dữ liệu học tập</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">{errorState}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setErrorState(null);
                setLoading(true);
                loadAllDashboardData();
              }}
              className="px-5 py-2.5 bg-[#407F3E] hover:bg-[#346632] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Thử lại ngay
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                sessionStorage.clear();
                navigate('/login');
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter & sort upcoming trips chronologically (from today onwards)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = trips
    .filter(t => {
      if (!t.chuyenThamQuan?.ngay_tham_quan) return false;
      const tripDate = new Date(t.chuyenThamQuan.ngay_tham_quan);
      tripDate.setHours(23, 59, 59, 999);
      const isFutureOrToday = tripDate >= today;
      const isValidStatus = ['HopLe', 'ChoDuyet', 'DaThamGia', 'HoanThanh'].includes(t.trang_thai);
      return isFutureOrToday && isValidStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.chuyenThamQuan.ngay_tham_quan).getTime();
      const dateB = new Date(b.chuyenThamQuan.ngay_tham_quan).getTime();
      return dateA - dateB;
    })
    .slice(0, 4);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang chủ</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Chào mừng quay trở lại, {student?.ho_ten || sessionUser?.ten_dang_nhap || 'Sinh viên'}!
          </p>
        </div>
      </div>

      {/* Unpaid Invoices Warning (if any) */}
      {!loading && stats.unpaidInvoicesCount > 0 && (
        <div
          onClick={() => navigate('/sinh-vien/payment')}
          className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-amber-100/60 transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Bạn có {stats.unpaidInvoicesCount} chuyến tham quan chưa hoàn tất đóng lệ phí
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Vui lòng thanh toán trước hạn để hệ thống không tự động hủy phiếu đăng ký.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shrink-0">
            Thanh toán ngay <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* Row of 4 essential stat cards */}
      {loading && !cachedData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-2.5 bg-slate-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Số chuyến tham quan */}
          <div
            onClick={() => navigate('/sinh-vien/schedule')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 hover:border-[#407F3E]/40 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#407F3E]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-[#407F3E]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1">Số chuyến tham quan</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold text-slate-800 leading-none">{stats.totalTrips || stats.registered || 0}</p>
                <span className="text-xs text-slate-500">chuyến</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 truncate">
                {(stats.completed || 0) > 0 ? `Đã hoàn thành ${stats.completed} chuyến` : 'Đã đăng ký tham gia'}
              </p>
            </div>
          </div>

          {/* Card 2: Bài thu hoạch chưa nộp */}
          <div
            onClick={() => navigate('/sinh-vien/reports')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 hover:border-[#407F3E]/40 transition-all cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${(stats.pendingReports || 0) > 0 ? 'bg-amber-100/70 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1">Bài thu hoạch chưa nộp</p>
              <div className="flex items-baseline gap-1.5">
                <p className={`text-2xl font-bold leading-none ${(stats.pendingReports || 0) > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {stats.pendingReports || 0}
                </p>
                <span className="text-xs text-slate-500">bài</span>
              </div>
              <p className={`text-xs mt-2 truncate ${(stats.pendingReports || 0) > 0 ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                {(stats.pendingReports || 0) > 0
                  ? `Đã nộp ${stats.submittedReports || 0} bài`
                  : 'Đã hoàn tất nộp các bài'}
              </p>
            </div>
          </div>

          {/* Card 3: Lệ phí chưa đóng */}
          <div
            onClick={() => navigate('/sinh-vien/payment')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 hover:border-[#407F3E]/40 transition-all cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${stats.unpaidInvoicesCount > 0 ? 'bg-amber-100/60' : 'bg-slate-100'}`}>
              <CreditCard className={`w-6 h-6 ${stats.unpaidInvoicesCount > 0 ? 'text-amber-600' : 'text-slate-600'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1">Lệ phí chưa đóng</p>
              <div className="flex items-baseline gap-1.5">
                <p className={`text-2xl font-bold leading-none ${stats.unpaidInvoicesCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {stats.unpaidInvoicesCount || 0}
                </p>
                <span className="text-xs text-slate-500">khoản</span>
              </div>
              <p className={`text-xs mt-2 truncate ${stats.unpaidInvoicesCount > 0 ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                {stats.unpaidInvoicesCount > 0 ? 'Cần thanh toán lệ phí' : 'Đã hoàn tất thanh toán'}
              </p>
            </div>
          </div>

          {/* Card 4: Số chuyến bị cấm (trong danh sách đen) */}
          <div
            className="bg-white p-5 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 hover:border-[#407F3E]/40 transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${stats.bannedTripsCount > 0 || stats.isBlacklisted ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
              {stats.bannedTripsCount > 0 || stats.isBlacklisted ? (
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-slate-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1" title="Trong danh sách đen">
                Số chuyến bị cấm
              </p>
              <div className="flex items-baseline gap-1.5">
                <p className={`text-2xl font-bold leading-none ${stats.bannedTripsCount > 0 || stats.isBlacklisted ? 'text-rose-600' : 'text-slate-800'}`}>
                  {stats.bannedTripsCount || 0}
                </p>
                <span className="text-xs text-slate-500">chuyến</span>
              </div>
              <p className={`text-xs mt-2 truncate ${stats.bannedTripsCount > 0 || stats.isBlacklisted ? 'text-rose-600 font-medium' : 'text-slate-400'}`}>
                {stats.bannedTripsCount > 0 || stats.isBlacklisted ? 'Trong danh sách đen vi phạm' : 'Không vi phạm quy chế'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left card: Chuyến tham quan sắp tới */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#407F3E]" />
              Chuyến tham quan sắp tới
            </h2>
            <button
              onClick={() => navigate('/sinh-vien/schedule')}
              className="text-xs font-bold text-[#407F3E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {loading && !cachedData ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#E7E0C4]/10 rounded-xl p-4 border border-[#E7E0C4] space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : upcomingTrips.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Compass className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-bold">Không có chuyến đi sắp tới nào</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E7E0C4]">
                {upcomingTrips.map((trip) => {
                  const isOnline = trip.chuyenThamQuan?.hinh_thuc === 'TrucTuyen';
                  return (
                    <div
                      key={trip.id}
                      onClick={() => navigate('/sinh-vien/schedule')}
                      className="relative flex flex-col cursor-pointer group"
                    >
                      <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-[#407F3E] ring-4 ring-white z-10 group-hover:scale-125 transition-transform"></div>
                      <div className="bg-[#E7E0C4]/10 rounded-xl p-4 border border-[#E7E0C4] hover:border-[#407F3E]/50 hover:bg-[#E7E0C4]/20 transition-all">
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-[#407F3E] transition-colors">
                            {trip.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chưa xác định'}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${isOnline ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-[#89B449]/10 text-[#407F3E]'}`}>
                            {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {isOnline ? 'Trực tuyến' : 'Trực tiếp'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {trip.chuyenThamQuan?.ngay_tham_quan ? new Date(trip.chuyenThamQuan.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {trip.chuyenThamQuan?.gio_bat_dau?.slice(0, 5) || '--'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right card: Thông báo gần đây */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#DBD468]" />
              Thông báo gần đây
            </h2>
            <button
              onClick={() => navigate('/sinh-vien/notifications')}
              className="text-xs font-bold text-[#407F3E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
            {loading && !cachedData ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-[#E7E0C4] space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-5/6" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Bell className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-bold">Chưa có thông báo nào</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => navigate('/sinh-vien/notifications')}
                  className="flex gap-4 p-4 rounded-xl border border-[#E7E0C4] hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="mt-1 shrink-0 flex flex-col items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${!notif.da_doc ? 'bg-[#DBD468]' : 'bg-transparent'}`}></div>
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold mb-1 group-hover:text-[#407F3E] transition-colors line-clamp-2 ${!notif.da_doc ? 'text-slate-800' : 'text-slate-600'}`}>
                      {notif.tieu_de}
                    </h4>
                    <p className="text-xs font-medium text-slate-400">
                      {notif.ngay_gui ? new Date(notif.ngay_gui).toLocaleDateString('vi-VN') : '--'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
