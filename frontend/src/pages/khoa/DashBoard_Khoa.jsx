import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { khoaApi } from '../../services/api';
import { 
  Users, 
  Compass, 
  DollarSign, 
  Percent, 
  AlertCircle, 
  ChevronRight, 
  Calendar, 
  Bell, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

export default function DashBoard_Khoa() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    studentCount: 0,
    lecturerCount: 0,
    factoryCount: 0,
    campaignCount: 0,
    pendingCancelCount: 0,
    pendingRefundCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Loaded user profile details
  const [userProfile, setUserProfile] = useState({ ho_ten: 'Người quản lý Khoa' });

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
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock monthly registrations data for the SVG chart
  const chartData = [
    { name: 'Tháng 1', batBuoc: 120, tuDo: 50 },
    { name: 'Tháng 2', batBuoc: 150, tuDo: 70 },
    { name: 'Tháng 3', batBuoc: 210, tuDo: 90 },
    { name: 'Tháng 4', batBuoc: 180, tuDo: 85 },
    { name: 'Tháng 5', batBuoc: 240, tuDo: 110 },
    { name: 'Tháng 6', batBuoc: 280, tuDo: 140 },
  ];

  const maxVal = 450; // for chart scaling

  return (
    <div className="space-y-6">
      {/* Top Welcome Panel */}
      <div className="bg-gradient-to-r from-primary via-[#407f3e] to-primary-container rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass size={180} className="animate-spin-slow text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 text-[#e5ffdc] text-xs px-3 py-1 rounded-full font-medium tracking-wide">
            HỆ THỐNG QUẢN LÝ KIẾN TẬP - KHOA CÔNG NGHỆ THỰC PHẨM HUIT
          </span>
          <h1 className="text-3xl font-black font-sans tracking-tight mt-3 text-white">
            Tổng quan Hoạt động Kiến tập Khoa
          </h1>
          <p className="text-[#e5ffdc]/95 text-sm mt-2 leading-relaxed font-semibold">
            Chào mừng Thầy/Cô <strong className="text-white font-bold">{userProfile.ho_ten}</strong>. Hệ thống đang ghi nhận hoạt động kiến tập cơ sở ngành tích cực cho năm học hiện tại. Theo dõi tiến độ đăng ký, phê duyệt hủy chuyến và phân công hướng dẫn bên dưới.
          </p>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">SV Đang thực hiện</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {loading ? '...' : stats.studentCount}
            </h3>
            <span className="text-secondary text-xs font-medium flex items-center mt-1.5 gap-1">
              <TrendingUp size={14} /> +12% so với HK trước
            </span>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={22} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Doanh nghiệp đối tác</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {loading ? '...' : stats.factoryCount}
            </h3>
            <span className="text-[#89B449] text-xs font-medium flex items-center mt-1.5 gap-1">
              Đang hoạt động & liên kết
            </span>
          </div>
          <div className="w-12 h-12 bg-secondary/10 text-[#89B449] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Compass size={22} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hoàn phí chờ duyệt</p>
            <h3 className={`text-2xl font-bold mt-1 ${stats.pendingRefundCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
              {loading ? '...' : stats.pendingRefundCount}
            </h3>
            <span className="text-slate-500 text-xs mt-1.5 block">Yêu cầu hoàn trả lệ phí</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đợt đang triển khai</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {loading ? '...' : stats.campaignCount}
            </h3>
            <span className="text-slate-500 text-xs mt-1.5 block">Kế hoạch kiến tập lớp học</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Percent size={22} />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration volume chart using clean interactive SVG */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Thống kê Đăng ký Kiến tập</h3>
                <p className="text-slate-400 text-xs">Biểu đồ biểu diễn lượng đăng ký theo tháng phân loại chuyến</p>
              </div>
              <span className="text-xs text-[#2c6b2d] bg-[#f8faf1] border border-primary/20 px-2.5 py-1 rounded-full font-bold">Năm học 2025-2026</span>
            </div>

            {/* Custom interactive SVG Bar Chart */}
            <div className="relative w-full h-72 bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
              <div className="flex-1 flex items-end justify-between pt-4 pb-2 px-6">
                {chartData.map((d, i) => {
                  const bbHeight = (d.batBuoc / maxVal) * 100;
                  const tdHeight = (d.tuDo / maxVal) * 100;
                  const isHovered = hoveredBar === i;

                  return (
                    <div key={i} className="flex flex-col items-center gap-2 group w-12 relative">
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-12 z-20 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg border border-slate-700 w-28 text-center pointer-events-none transition-all">
                          <p className="font-bold text-slate-305 mb-0.5">{d.name}</p>
                          <p className="text-primary font-bold">Bắt buộc: {d.batBuoc}</p>
                          <p className="text-secondary font-bold">Tự do: {d.tuDo}</p>
                        </div>
                      )}

                      <div 
                        className="w-full flex justify-center gap-1.5 items-end h-44 cursor-pointer"
                        onMouseEnter={() => setHoveredBar(i)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {/* Bắt buộc Bar */}
                        <div 
                          style={{ height: `${bbHeight}%` }} 
                          className={`w-3.5 bg-primary rounded-t transition-all duration-300 ${isHovered ? 'brightness-110 scale-x-110 shadow' : ''}`}
                        />
                        {/* Tự do Bar */}
                        <div 
                          style={{ height: `${tdHeight}%` }} 
                          className={`w-3.5 bg-secondary rounded-t transition-all duration-300 ${isHovered ? 'brightness-110 scale-x-110 shadow' : ''}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">{d.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legends */}
              <div className="border-t border-slate-200/50 pt-3 flex items-center justify-center gap-6 text-xs text-slate-500 font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span>Chuyến bắt buộc</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <span>Chuyến tự do</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel and Notifications */}
        <div className="space-y-6">
          {/* Pending tasks panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <AlertCircle size={18} className="text-primary animate-pulse animate-duration-1000" />
              <h3 className="font-bold text-slate-800 text-sm">Hồ sơ chờ phê duyệt ({stats.pendingCancelCount + stats.pendingRefundCount})</h3>
            </div>
            <div className="space-y-3">
              {/* Trip Cancel requests */}
              <div 
                onClick={() => navigate('/khoa/registrations')}
                className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 hover:bg-amber-50 border border-amber-100/30 cursor-pointer transition-all group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-amber-950">{stats.pendingCancelCount} minh chứng hủy chờ duyệt</span>
                  <span className="text-[10px] text-amber-600/70 font-semibold">Xác thực lý do vắng mặt của sinh viên</span>
                </div>
                <ChevronRight size={16} className="text-amber-600 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Refund requests */}
              <div 
                onClick={() => navigate('/khoa/registrations')}
                className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/30 cursor-pointer transition-all group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-950">{stats.pendingRefundCount} đơn hoàn phí chờ duyệt</span>
                  <span className="text-[10px] text-emerald-600/70 font-semibold">Hồ sơ xin hoàn lệ phí đóng thừa</span>
                </div>
                <ChevronRight size={16} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Quick Navigation to Year planner */}
              <div 
                onClick={() => navigate('/khoa/schedules')}
                className="flex items-center justify-between p-3 rounded-lg bg-[#f8faf1] hover:bg-[#ecefe6] border border-primary/20 cursor-pointer transition-all group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#2c6b2d]">Thiết lập học kỳ & đợt mới</span>
                  <span className="text-[10px] text-secondary font-semibold">Mở đợt & lập kế hoạch lớp học</span>
                </div>
                <ChevronRight size={16} className="text-[#2c6b2d] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Bulletin/Notice Card */}
          <div className="bg-[#f8faf1]/60 p-5 rounded-xl border border-primary/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-primary" />
                <span className="text-xs font-bold text-[#2c6b2d] uppercase tracking-wide">Thông báo mới</span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                Cập nhật Quy định Kiến tập cho Khối ngành Kỹ thuật Công nghệ năm 2026
              </p>
              <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed font-semibold">
                Kể từ Học kỳ này, toàn bộ sinh viên khi tham gia kiến tập trực tiếp bắt buộc phải nộp chứng nhận an toàn lao động điện tử được cấp bởi Ban Đảm bảo chất lượng.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-450 font-mono">Đăng ngày: 12/07/2026</span>
              <button 
                onClick={() => alert('Quy định chi tiết về an toàn lao động và chế độ bảo hiểm sẽ được cập nhật bản đầy đủ tại văn phòng khoa!')}
                className="text-primary hover:text-[#2c6b2d] text-xs font-bold inline-flex items-center gap-1 group"
              >
                Đọc thêm <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
