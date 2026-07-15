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
  Activity
} from 'lucide-react';

export default function DashBoard_Khoa() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    studentCount: 520,
    lecturerCount: 24,
    factoryCount: 18,
    campaignCount: 4,
    scheduleCount: 8,
    pendingCancelCount: 15,
    pendingRefundCount: 6,
  });
  const [loading, setLoading] = useState(true);

  // Loaded user profile details
  const [userProfile, setUserProfile] = useState({ ho_ten: 'Trưởng Khoa CNTP' });

  useEffect(() => {
    fetchStats();
    // Load manager name if present
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
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
          // If the backend doesn't return these fields, keep the mocked defaults
          scheduleCount: res.data.scheduleCount || 8,
          pendingCancelCount: res.data.pendingCancelCount || 15,
        }));
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock timeline for "Lịch trình hôm nay"
  const todayDepartures = [
    {
      id: 1,
      factoryName: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk) - Nhà máy sữa Thống Nhất',
      time: '08:00 - 11:30',
      studentCount: 45,
      lecturer: 'ThS. Nguyễn Văn A',
      status: 'Đang di chuyển',
      statusColor: 'bg-[#89B449] text-white', // Secondary Green
    },
    {
      id: 2,
      factoryName: 'Công ty Cổ phần Acecook Việt Nam - Chi nhánh TP.HCM',
      time: '13:30 - 16:30',
      studentCount: 40,
      lecturer: 'ThS. Lê Thị B',
      status: 'Sắp xuất phát',
      statusColor: 'bg-[#DBD468] text-slate-800', // Warning Yellow
    },
    {
      id: 3,
      factoryName: 'Công ty TNHH Yakult Việt Nam - Nhà máy Bình Dương',
      time: '15:00 - 17:30',
      studentCount: 35,
      lecturer: 'TS. Trần Văn C',
      status: 'Chờ xuất phát',
      statusColor: 'bg-[#E7E0C4] text-slate-700', // Muted Surface
    }
  ];

  // Mock student distribution data by major/division
  const distributionData = [
    { name: 'Công nghệ thực phẩm', count: 312, percent: 60, color: 'bg-[#407F3E]' },
    { name: 'Đảm bảo chất lượng & An toàn thực phẩm', count: 130, percent: 25, color: 'bg-[#89B449]' },
    { name: 'Quản lý dịch vụ ăn uống & Lữ hành', count: 78, percent: 15, color: 'bg-[#DBD468]' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Panel */}
      <div className="bg-gradient-to-r from-[#407F3E] via-[#407F3E]/90 to-[#89B449]/80 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass size={180} className="animate-spin-slow text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 text-white text-[11px] px-3 py-1 rounded-full font-bold tracking-wide uppercase">
            HỆ THỐNG QUẢN LÝ KIẾN TẬP - KHOA CÔNG NGHỆ THỰC PHẨM
          </span>
          <h1 className="text-3xl font-black font-sans tracking-tight mt-3 text-white">
            Tổng quan Hoạt động Kiến tập Khoa
          </h1>
          <p className="text-white/90 text-sm mt-2 leading-relaxed font-medium">
            Chào mừng Thầy/Cô <strong className="text-white font-bold">{userProfile.ho_ten}</strong>. Hệ thống quản lý thông tin kiến tập hiện tại đang được theo dõi và giám sát chặt chẽ. Dưới đây là thống kê tình hình đợt kiến tập và hành trình hôm nay.
          </p>
        </div>
      </div>

      {/* 2x2 Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Đợt kiến tập */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
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
        <div className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lịch kiến tập</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">
              {loading ? '...' : stats.scheduleCount}
            </h3>
            <span className="text-[#89B449] text-xs font-bold flex items-center mt-1.5 gap-1">
              Đã lập kế hoạch chi tiết
            </span>
          </div>
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity size={22} />
          </div>
        </div>

        {/* Card 3: Sinh viên đã đăng ký */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SV đã đăng ký</p>
            <h3 className="text-3xl font-black text-[#89B449] mt-1">
              {loading ? '...' : stats.studentCount}
            </h3>
            <span className="text-slate-500 text-xs font-semibold flex items-center mt-1.5 gap-1">
              <TrendingUp size={14} className="text-[#89B449]" /> Tăng trưởng ổn định
            </span>
          </div>
          <div className="w-12 h-12 bg-[#89B449]/10 text-[#89B449] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={22} />
          </div>
        </div>

        {/* Card 4: Sinh viên vắng/vi phạm */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SV vắng / vi phạm</p>
            <h3 className="text-3xl font-black text-[#E68A8C] mt-1">
              {loading ? '...' : stats.pendingCancelCount}
            </h3>
            <span className="text-[#E68A8C] text-xs font-bold flex items-center mt-1.5 gap-1">
              <AlertTriangle size={14} /> Cần rà soát xử lý
            </span>
          </div>
          <div className="w-12 h-12 bg-[#E68A8C]/10 text-[#E68A8C] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (60%): Lịch trình hôm nay */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E7E0C4] shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E0C4]">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Lịch trình hôm nay</h3>
              <p className="text-slate-400 text-xs mt-0.5">Tiến độ xuất phát và di chuyển của các chuyến tham quan trong ngày</p>
            </div>
            <span className="text-xs text-[#407F3E] bg-[#E7E0C4]/30 border border-[#E7E0C4] px-3 py-1 rounded-full font-bold">
              Hôm nay
            </span>
          </div>

          <div className="mt-6 space-y-6">
            {todayDepartures.map((item, idx) => (
              <div key={item.id} className="relative flex items-start gap-4 group">
                {/* Timeline connector lines */}
                {idx !== todayDepartures.length - 1 && (
                  <span className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-[#E7E0C4]" />
                )}
                
                {/* Timeline Icon Node */}
                <div className="w-10 h-10 rounded-full bg-[#E7E0C4]/30 flex items-center justify-center border border-[#E7E0C4] text-[#407F3E] shrink-0">
                  <Clock size={16} />
                </div>

                {/* Departure Card */}
                <div className="flex-1 bg-[#E7E0C4]/10 border border-[#E7E0C4]/50 rounded-xl p-4 hover:bg-[#E7E0C4]/20 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug">
                      {item.factoryName}
                    </h4>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      <span>{item.time}</span>
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
            ))}
          </div>
        </div>

        {/* Right Column (40%): Biểu đồ phân bố sinh viên */}
        <div className="bg-white p-6 rounded-2xl border border-[#E7E0C4] shadow-sm flex flex-col h-full">
          <div className="pb-4 border-b border-[#E7E0C4] mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Phân bố sinh viên</h3>
            <p className="text-slate-400 text-xs mt-0.5">Tỷ lệ sinh viên đăng ký tham gia phân bổ theo chuyên ngành</p>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {distributionData.map((major) => (
              <div key={major.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="truncate max-w-[200px]">{major.name}</span>
                  <span>{major.count} SV ({major.percent}%)</span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${major.color}`}
                    style={{ width: `${major.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Panel */}
          <div className="mt-8 pt-4 border-t border-[#E7E0C4] space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thao tác nhanh</h4>
            <button 
              onClick={() => navigate('/khoa/schedules')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#407F3E]/5 hover:bg-[#407F3E]/10 text-[#407F3E] text-xs font-bold transition-all"
            >
              <span>Tạo lịch kiến tập lớp mới</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => navigate('/khoa/refund-approval')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#89B449]/5 hover:bg-[#89B449]/10 text-[#89B449] text-xs font-bold transition-all"
            >
              <span>Phê duyệt hoàn lệ phí</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
