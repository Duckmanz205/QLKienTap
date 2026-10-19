import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Edit3, Presentation, GraduationCap, 
  MapPin, Calendar, Clock, ArrowRight, User,
  CheckCircle2, Award, ClipboardCheck, Building2,
  ChevronRight, Sparkles
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function DashBoard_GV() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('TatCa'); // 'TatCa', 'DanDoan', 'HuongDan', 'HoiDong'

  const [lecturer, setLecturer] = useState({ hoTen: 'Giảng viên', id: null });
  const [trips, setTrips] = useState([]);
  const [reports, setReports] = useState([]);
  const [boards, setBoards] = useState([]);
  const [guidedStudentsCount, setGuidedStudentsCount] = useState(0);
  const [stats, setStats] = useState({
    doanDangDan: 0,
    baiCanCham: 0,
    buoiBaoCao: 0,
    tongSvHuongDan: 0
  });

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchDashboardData(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchDashboardData = async (gvId) => {
    try {
      const [studentsRes, tripsRes, reportsRes, boardsRes, statsRes] = await Promise.all([
        giangVienApi.getGuidedStudents(gvId),
        giangVienApi.getLedTrips(gvId),
        giangVienApi.getGuidedReports(gvId),
        giangVienApi.getBoardSessions(gvId),
        giangVienApi.getDashboardStats(gvId)
      ]);
      
      setGuidedStudentsCount((studentsRes.data || []).length);
      setTrips(tripsRes.data || []);
      setReports(reportsRes.data?.data || []);
      setBoards(boardsRes.data || []);
      setStats(statsRes.data || { doanDangDan: 0, baiCanCham: 0, buoiBaoCao: 0, tongSvHuongDan: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Tổng hợp tất cả các sự kiện lịch trình
  const allSchedules = [
    ...trips.map(t => {
      const tripDate = t.ngay_tham_quan ? new Date(t.ngay_tham_quan) : new Date(0);
      return {
        id: `trip_${t.id}`,
        tripId: t.id,
        type: 'DanDoan',
        title: t.nhaMay?.ten_nha_may || 'Chuyến tham quan',
        date: t.ngay_tham_quan ? new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN') : '--',
        time: `${(t.gio_bat_dau || '--').slice(0, 5)}`,
        rawDate: tripDate,
        isPast: tripDate < today
      };
    }),
    ...boards.map(b => {
      const boardDate = b.session?.ngay_bao_cao ? new Date(b.session.ngay_bao_cao) : new Date(0);
      return {
        id: `board_${b.session?.id}`,
        boardId: b.session?.id,
        type: 'HoiDong',
        title: b.session?.ten_buoi || `Hội đồng Bảo vệ - Nhóm ${b.session?.id}`,
        date: b.session?.ngay_bao_cao ? new Date(b.session.ngay_bao_cao).toLocaleDateString('vi-VN') : '--',
        time: `${(b.session?.gio_bat_dau || '--').slice(0, 5)}`,
        rawDate: boardDate,
        isPast: boardDate < today
      };
    })
  ];

  // Lọc theo Role Toggle
  const filteredSchedules = allSchedules.filter(item => {
    if (activeRole === 'DanDoan') return item.type === 'DanDoan';
    if (activeRole === 'HoiDong') return item.type === 'HoiDong';
    return true; // 'TatCa' hoặc 'HuongDan'
  });

  // Sắp xếp: Ưu tiên sự kiện hôm nay và tương lai, sau đó tới sự kiện gần nhất trong quá khứ
  const upcomingSchedules = filteredSchedules
    .filter(s => !s.isPast)
    .sort((a, b) => a.rawDate - b.rawDate);

  const pastSchedules = filteredSchedules
    .filter(s => s.isPast)
    .sort((a, b) => b.rawDate - a.rawDate);

  const displaySchedules = [...upcomingSchedules, ...pastSchedules].slice(0, 5);

  const pendingReports = reports.filter(r => {
    const hasScore = (r.diem_thu_hoach !== null && r.diem_thu_hoach !== undefined) ||
                     (r.phieuThamQuan?.diemPhieuThamQuan?.diem_thu_hoach !== null && 
                      r.phieuThamQuan?.diemPhieuThamQuan?.diem_thu_hoach !== undefined);
    return !hasScore && r.trang_thai !== 'DaCham';
  });
  const actualPendingCount = stats.baiCanCham !== undefined ? stats.baiCanCham : pendingReports.length;

  const getTagStyle = (type, isPast) => {
    if (isPast) {
      return 'bg-slate-100 text-slate-500 border-slate-200';
    }
    if (type === 'DanDoan') {
      return 'bg-[#407F3E]/10 text-[#407F3E] border-[#407F3E]/20';
    }
    if (type === 'HoiDong') {
      return 'bg-[#89B449]/10 text-[#407F3E] border-[#89B449]/30'; 
    }
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getTagLabel = (type, isPast) => {
    if (isPast) return 'Đã diễn ra';
    if (type === 'DanDoan') return 'Dẫn đoàn';
    if (type === 'HoiDong') return 'Hội đồng';
    return 'Khác';
  };

  const handleScheduleClick = (schedule) => {
    if (schedule.type === 'DanDoan') {
      navigate('/giang-vien/led-trips');
    } else if (schedule.type === 'HoiDong') {
      navigate('/giang-vien/board');
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang chủ</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Xin chào Giảng viên, {lecturer.ho_ten}!</p>
        </div>
        
        {/* Role Toggles (Active Filter) */}
        <div className="flex bg-white p-1 rounded-full border border-[#E7E0C4] shadow-sm w-fit flex-wrap">
          <button 
            onClick={() => setActiveRole('TatCa')}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeRole === 'TatCa' ? 'bg-[#407F3E] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setActiveRole('DanDoan')}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeRole === 'DanDoan' ? 'bg-[#89B449] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dẫn đoàn
          </button>
          <button 
            onClick={() => setActiveRole('HuongDan')}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeRole === 'HuongDan' ? 'bg-[#89B449] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hướng dẫn
          </button>
          <button 
            onClick={() => setActiveRole('HoiDong')}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeRole === 'HoiDong' ? 'bg-[#89B449] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hội đồng
          </button>
        </div>
      </div>

      {/* Row of 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        
        {/* Card 1: Đoàn đang dẫn */}
        <div 
          onClick={() => navigate('/giang-vien/led-trips')}
          className={`bg-white p-5 rounded-2xl shadow-sm border transition-all cursor-pointer group flex items-center gap-4 ${
            activeRole === 'DanDoan' 
              ? 'border-[#407F3E] ring-2 ring-[#407F3E]/20 bg-[#407F3E]/[0.02]' 
              : 'border-[#E7E0C4] hover:border-[#407F3E]/40 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#407F3E]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6 text-[#407F3E]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-500 mb-1">Đoàn đang dẫn</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-bold text-slate-800 leading-none">{stats.doanDangDan || 0}</p>
              <span className="text-xs text-slate-500">đoàn</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 truncate">Chuyến tham quan phụ trách</p>
          </div>
        </div>

        {/* Card 2: Sinh viên cần chấm bài */}
        <div 
          onClick={() => navigate('/giang-vien/grading')}
          className={`bg-white p-5 rounded-2xl shadow-sm border transition-all cursor-pointer group flex items-center gap-4 ${
            activeRole === 'HuongDan' 
              ? 'border-[#DBD468] ring-2 ring-[#DBD468]/30 bg-[#DBD468]/[0.03]' 
              : 'border-[#E7E0C4] hover:border-[#DBD468]/60 hover:shadow-md'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
            actualPendingCount > 0 ? 'bg-[#DBD468]/20 text-[#a09a39]' : 'bg-slate-100 text-slate-400'
          }`}>
            <Edit3 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-500 mb-1">Bài chờ chấm</p>
            <div className="flex items-baseline gap-1.5">
              <p className={`text-2xl font-bold leading-none ${actualPendingCount > 0 ? 'text-[#9c9535]' : 'text-slate-800'}`}>
                {actualPendingCount}
              </p>
              <span className="text-xs text-slate-500">bài</span>
            </div>
            <p className={`text-xs mt-2 truncate ${actualPendingCount > 0 ? 'text-amber-700 font-medium' : 'text-slate-400'}`}>
              {actualPendingCount > 0 ? 'Cần chấm bài thu hoạch' : 'Đã chấm hết bài nộp'}
            </p>
          </div>
        </div>

        {/* Card 3: Buổi báo cáo sắp tới */}
        <div 
          onClick={() => navigate('/giang-vien/board')}
          className={`bg-white p-5 rounded-2xl shadow-sm border transition-all cursor-pointer group flex items-center gap-4 ${
            activeRole === 'HoiDong' 
              ? 'border-[#89B449] ring-2 ring-[#89B449]/30 bg-[#89B449]/[0.02]' 
              : 'border-[#E7E0C4] hover:border-[#89B449]/50 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#89B449]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Presentation className="w-6 h-6 text-[#89B449]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-500 mb-1">Buổi báo cáo sắp tới</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-bold text-slate-800 leading-none">{stats.buoiBaoCao || 0}</p>
              <span className="text-xs text-slate-500">buổi</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 truncate">Hội đồng chấm báo cáo</p>
          </div>
        </div>

        {/* Card 4: Tổng SV đang hướng dẫn */}
        <div 
          onClick={() => navigate('/giang-vien/guided-students')}
          className={`bg-white p-5 rounded-2xl shadow-sm border transition-all cursor-pointer group flex items-center gap-4 ${
            activeRole === 'HuongDan' 
              ? 'border-[#407F3E] ring-2 ring-[#407F3E]/20 bg-[#407F3E]/[0.02]' 
              : 'border-[#E7E0C4] hover:border-[#407F3E]/40 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#407F3E]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-[#407F3E]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-500 mb-1">Tổng SV hướng dẫn</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-bold text-[#407F3E] leading-none">{stats.tongSvHuongDan || guidedStudentsCount || 0}</p>
              <span className="text-xs text-slate-500">sinh viên</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 truncate">Trong đợt kiến tập hiện tại</p>
          </div>
        </div>
        
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E0C4] shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#407F3E]" /> Lối tắt tác vụ nhanh
          </p>
          <span className="text-[11px] font-medium text-slate-400">Truy cập 1 chạm vào các nhiệm vụ</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/giang-vien/attendance')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer group ${
              activeRole === 'DanDoan'
                ? 'border-[#407F3E] bg-[#407F3E]/5 text-[#407F3E]'
                : 'border-[#E7E0C4] hover:border-[#407F3E]/50 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#407F3E]/10 flex items-center justify-center text-[#407F3E] shrink-0 group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Điểm danh sinh viên</p>
              <p className="text-[10px] text-slate-400 truncate">Đoàn tham quan</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/giang-vien/preparation')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer group ${
              activeRole === 'DanDoan'
                ? 'border-[#407F3E] bg-[#407F3E]/5 text-[#407F3E]'
                : 'border-[#E7E0C4] hover:border-[#407F3E]/50 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#89B449]/15 flex items-center justify-center text-[#407F3E] shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Điểm chuẩn bị & cộng</p>
              <p className="text-[10px] text-slate-400 truncate">Đánh giá thái độ</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/giang-vien/grading')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer group ${
              activeRole === 'HuongDan'
                ? 'border-[#DBD468] bg-[#DBD468]/10 text-slate-800'
                : 'border-[#E7E0C4] hover:border-[#DBD468]/60 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#DBD468]/20 flex items-center justify-center text-[#9c9535] shrink-0 group-hover:scale-105 transition-transform">
              <Edit3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Chấm bài thu hoạch</p>
              <p className="text-[10px] text-slate-400 truncate">Sinh viên hướng dẫn</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/giang-vien/board')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer group ${
              activeRole === 'HoiDong'
                ? 'border-[#89B449] bg-[#89B449]/10 text-slate-800'
                : 'border-[#E7E0C4] hover:border-[#89B449]/50 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#89B449]/15 flex items-center justify-center text-[#407F3E] shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Hội đồng chấm báo cáo</p>
              <p className="text-[10px] text-slate-400 truncate">Buổi bảo vệ</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left card: Lịch trình sắp tới */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex flex-col h-[420px]">
          <div className="flex items-center justify-between mb-4 shrink-0 border-b border-[#E7E0C4] pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#407F3E]" />
              Lịch trình {activeRole === 'DanDoan' ? 'dẫn đoàn' : activeRole === 'HoiDong' ? 'hội đồng' : 'sắp tới'}
            </h2>
            <button 
              onClick={() => navigate(activeRole === 'HoiDong' ? '/giang-vien/board' : '/giang-vien/led-trips')}
              className="text-xs font-bold text-[#407F3E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
            {displaySchedules.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Calendar className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-bold">Không có lịch trình phù hợp</p>
              </div>
            ) : (
              displaySchedules.map((schedule) => (
                <div 
                  key={schedule.id} 
                  onClick={() => handleScheduleClick(schedule)}
                  className={`relative flex gap-3 p-3.5 rounded-xl border transition-all group cursor-pointer ${
                    schedule.isPast 
                      ? 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 opacity-80' 
                      : 'border-[#E7E0C4] hover:border-[#89B449]/50 hover:bg-[#89B449]/5 hover:shadow-sm'
                  }`}
                >
                  <div className="mt-1 flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white transition-all ${
                      schedule.isPast ? 'bg-slate-400' : 'bg-[#407F3E] group-hover:ring-[#89B449]/20'
                    }`}></div>
                    <div className="w-px h-full bg-[#E7E0C4] mt-2 group-last:hidden"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#407F3E] transition-colors">
                        {schedule.title}
                      </h4>
                      <span className={`inline-block px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${getTagStyle(schedule.type, schedule.isPast)}`}>
                        {getTagLabel(schedule.type, schedule.isPast)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {schedule.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {schedule.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right card: Bài chờ chấm */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex flex-col h-[420px]">
          <div className="flex items-center justify-between mb-4 shrink-0 border-b border-[#E7E0C4] pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#DBD468]" />
              Bài chờ chấm ({actualPendingCount})
            </h2>
            <button 
              onClick={() => navigate('/giang-vien/grading')}
              className="text-xs font-bold text-[#407F3E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Đến trang chấm điểm <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
            {pendingReports.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Edit3 className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-bold">Không có bài nào chờ chấm</p>
                <p className="text-xs text-slate-400 mt-1">Tất cả sinh viên đã được chấm điểm đầy đủ</p>
              </div>
            ) : (
              pendingReports.slice(0, 5).map((report) => {
                const sv = report.phieuThamQuan?.phieuDangKy?.sinhVien;
                const nhaMayTen = report.phieuThamQuan?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may;
                return (
                  <div 
                    key={report.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[#E7E0C4] hover:bg-slate-50 hover:border-slate-300 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-800 truncate">
                            {sv?.ho_ten || 'Sinh viên'}
                          </h4>
                          {sv?.mssv && (
                            <span className="text-[11px] font-semibold text-slate-500 font-mono">
                              ({sv.mssv})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                          <MapPin className="w-3 h-3 inline-block mr-1 -mt-0.5 text-slate-400" />
                          {nhaMayTen || 'Bài thu hoạch kiến tập'} • {new Date(report.ngay_nop || Date.now()).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/giang-vien/grading', { state: { filterMssv: sv?.mssv } })}
                      className="ml-3 shrink-0 px-3 py-1.5 bg-[#407F3E]/10 text-[#407F3E] hover:bg-[#407F3E] hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-[#407F3E]/20 hover:shadow-sm"
                    >
                      Chấm ngay
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

