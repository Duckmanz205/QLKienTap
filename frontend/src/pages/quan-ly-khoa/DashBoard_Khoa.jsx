import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { khoaApi } from '../../services/api';
import { 
  Users, 
  Compass, 
  Calendar, 
  AlertTriangle,
  Clock,
  MapPin,
  User,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Building2,
  ClipboardList,
  Sparkles
} from 'lucide-react';

export default function DashBoard_Khoa() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    studentCount: 0,
    lecturerCount: 0,
    factoryCount: 0,
    campaignCount: 0,
    scheduleCount: 0,
    pendingCancelCount: 0,
    pendingRefundCount: 0,
    pendingActionCount: 0,
    distributionData: [],
    timeline: []
  });
  const [loading, setLoading] = useState(true);

  // Loaded user profile details
  const [userProfile, setUserProfile] = useState({ ho_ten: 'Quản lý Khoa' });

  useEffect(() => {
    fetchStats();
    // Load manager name if present
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed?.user?.vai_tro === 'QuanTriVienHeThong') {
          navigate('/qtv/accounts', { replace: true });
          return;
        }
        if (parsed.user && parsed.user.ten_hien_thi) {
          setUserProfile({ ho_ten: parsed.user.ten_hien_thi });
        } else if (parsed.ho_ten) {
          setUserProfile({ ho_ten: parsed.ho_ten });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await khoaApi.getDashboardStats();
      if (res.data) {
        setStats(prev => ({
          ...prev,
          ...res.data,
          scheduleCount: res.data.scheduleCount || 0,
          pendingCancelCount: res.data.pendingCancelCount || 0,
          pendingRefundCount: res.data.pendingRefundCount || 0,
          pendingActionCount: res.data.pendingActionCount !== undefined 
            ? res.data.pendingActionCount 
            : ((res.data.pendingCancelCount || 0) + (res.data.pendingRefundCount || 0)),
          distributionData: res.data.distributionData || [],
          timeline: res.data.timeline || [],
        }));
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayDepartures = stats.timeline || [];

  const totalStudents = stats.distributionData.reduce((acc, curr) => acc + curr.value, 0);
  const colors = ['bg-[#407F3E]', 'bg-[#89B449]', 'bg-[#DBD468]', 'bg-[#3b82f6]', 'bg-[#8b5cf6]'];
  const distributionData = stats.distributionData.map((d, idx) => ({
    name: d.name,
    count: d.value,
    percent: totalStudents > 0 ? Math.round((d.value / totalStudents) * 100) : 0,
    color: colors[idx % colors.length]
  }));

  const todayTripsCount = todayDepartures.filter(t => t.isToday).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Panel */}
      <div className="bg-gradient-to-r from-[#407F3E] via-[#407F3E]/90 to-[#89B449]/80 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass size={180} className="animate-spin-slow text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 text-white text-[11px] px-3 py-1 rounded-full font-bold tracking-wide uppercase">
            HỆ THỐNG QUẢN LÝ KIẾN TẬP - KHOA CÔNG NGHỆ THỰC PHẨM
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight mt-3 text-white">
            Tổng quan Hoạt động Kiến tập Khoa
          </h1>
          <p className="text-white/90 text-sm mt-2 leading-relaxed font-medium">
            Chào mừng Thầy/Cô <strong className="text-white font-bold">{userProfile.ho_ten}</strong>. Hệ thống quản lý kiến tập hiện tại đang hoạt động ổn định.
            {todayTripsCount > 0 ? (
              <span> Hôm nay có <strong className="text-[#DBD468] font-bold">{todayTripsCount} chuyến tham quan</strong> đang diễn ra.</span>
            ) : (
              <span> Hiện tại các kế hoạch kiến tập đang được triển khai đúng tiến độ.</span>
            )}
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Đợt kiến tập */}
        <div 
          onClick={() => navigate('/khoa/plans')}
          className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md hover:border-[#407F3E]/50 transition-all duration-200 flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Đợt kiến tập</p>
            <h3 className="text-3xl font-black text-[#407F3E] mt-1">
              {loading ? '...' : stats.campaignCount}
            </h3>
            <span className="text-slate-500 text-xs font-semibold flex items-center mt-1.5 gap-1">
              Học kỳ hiện tại
            </span>
          </div>
          <div className="w-12 h-12 bg-[#407F3E]/10 text-[#407F3E] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar size={22} />
          </div>
        </div>

        {/* Card 2: Lịch kiến tập */}
        <div 
          onClick={() => navigate('/khoa/lich-kien-tap')}
          className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md hover:border-[#89B449]/50 transition-all duration-200 flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lịch kiến tập</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">
              {loading ? '...' : stats.scheduleCount}
            </h3>
            <span className="text-[#407F3E] text-xs font-bold flex items-center mt-1.5 gap-1">
              Kế hoạch chi tiết
            </span>
          </div>
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity size={22} />
          </div>
        </div>

        {/* Card 3: Sinh viên tham gia đợt */}
        <div 
          onClick={() => navigate('/khoa/students')}
          className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md hover:border-[#89B449]/50 transition-all duration-200 flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SV tham gia đợt</p>
            <h3 className="text-3xl font-black text-[#89B449] mt-1">
              {loading ? '...' : stats.studentCount}
            </h3>
            <span className="text-slate-500 text-xs font-semibold flex items-center mt-1.5 gap-1">
              <TrendingUp size={14} className="text-[#89B449]" /> Sinh viên kiến tập
            </span>
          </div>
          <div className="w-12 h-12 bg-[#89B449]/10 text-[#89B449] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={22} />
          </div>
        </div>

        {/* Card 4: Yêu cầu chờ xử lý */}
        <div 
          onClick={() => navigate('/khoa/trips')}
          className={`bg-white p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
            stats.pendingActionCount > 0 
              ? 'border-amber-300 hover:border-amber-400 hover:shadow-md bg-amber-50/20' 
              : 'border-[#E7E0C4] hover:border-[#407F3E]/40 hover:shadow-md'
          }`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Yêu cầu chờ xử lý</p>
            <h3 className={`text-3xl font-black mt-1 ${
              stats.pendingActionCount > 0 ? 'text-amber-600' : 'text-slate-800'
            }`}>
              {loading ? '...' : stats.pendingActionCount}
            </h3>
            <span className={`text-xs font-semibold flex items-center mt-1.5 gap-1 ${
              stats.pendingActionCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-500'
            }`}>
              {stats.pendingActionCount > 0 ? (
                <>
                  <AlertTriangle size={14} className="text-amber-600" /> Cần xem xét xử lý
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} className="text-emerald-600" /> Không có yêu cầu tồn đọng
                </>
              )}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
            stats.pendingActionCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {stats.pendingActionCount > 0 ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (60%): Lịch trình chuyến tham quan */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E7E0C4] shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E0C4]">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Lịch trình chuyến tham quan</h3>
              <p className="text-slate-400 text-xs mt-0.5">Tiến độ các chuyến tham quan hôm nay và sắp tới của Khoa</p>
            </div>
            <button
              onClick={() => navigate('/khoa/trips')}
              className="text-xs text-[#407F3E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {todayDepartures.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">Chưa có chuyến tham quan nào sắp diễn ra</p>
              </div>
            ) : (
              todayDepartures.map((item, idx) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate('/khoa/trips')}
                  className="relative flex items-start gap-4 group cursor-pointer"
                >
                  {/* Timeline connector lines */}
                  {idx !== todayDepartures.length - 1 && (
                    <span className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-[#E7E0C4]" />
                  )}
                  
                  {/* Timeline Icon Node */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${
                    item.isToday 
                      ? 'bg-[#89B449]/20 border-[#89B449] text-[#407F3E]' 
                      : 'bg-[#E7E0C4]/30 border-[#E7E0C4] text-slate-500'
                  }`}>
                    <Clock size={16} />
                  </div>

                  {/* Departure Card */}
                  <div className={`flex-1 border rounded-xl p-4 transition-all ${
                    item.isToday 
                      ? 'bg-emerald-50/30 border-emerald-200 hover:bg-emerald-50/60 hover:shadow-sm' 
                      : 'bg-[#E7E0C4]/10 border-[#E7E0C4]/50 hover:bg-[#E7E0C4]/20'
                  }`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug group-hover:text-[#407F3E] transition-colors">
                        {item.factoryName}
                      </h4>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{item.dateFormatted} ({item.time})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-slate-400" />
                        <span>Sĩ số: <strong className="text-slate-800 font-bold">{item.studentCount} SV</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        <span>GV dẫn đoàn: <strong className="text-slate-800 font-bold">{item.lecturer}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (40%): Biểu đồ phân bố sinh viên theo khóa học */}
        <div className="bg-white p-6 rounded-2xl border border-[#E7E0C4] shadow-sm flex flex-col h-full">
          <div className="pb-4 border-b border-[#E7E0C4] mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Phân bố sinh viên theo khóa học</h3>
            <p className="text-slate-400 text-xs mt-0.5">Tỷ lệ sinh viên tham gia kiến tập phân bổ theo từng khóa học</p>
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {distributionData.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">Chưa có dữ liệu phân bố</div>
            ) : (
              distributionData.map((major) => (
                <div key={major.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="truncate max-w-[200px]">{major.name}</span>
                    <span>{major.count} SV ({major.percent}%)</span>
                  </div>
                  {/* Horizontal Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${major.color}`}
                      style={{ width: `${major.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="mt-8 pt-4 border-t border-[#E7E0C4] space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#407F3E]" /> Lối tắt tác vụ nhanh
            </h4>
            <button 
              onClick={() => navigate('/khoa/lich-kien-tap')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#407F3E]/5 hover:bg-[#407F3E]/10 text-[#407F3E] text-xs font-bold transition-all cursor-pointer"
            >
              <span>Lập lịch kiến tập mới</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => navigate('/khoa/trips')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#89B449]/10 hover:bg-[#89B449]/20 text-[#407F3E] text-xs font-bold transition-all cursor-pointer"
            >
              <span>Quản lý chuyến tham quan</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => navigate('/khoa/boards')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Hội đồng chấm báo cáo</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => navigate('/khoa/supervisors')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Phân công giảng viên hướng dẫn</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

