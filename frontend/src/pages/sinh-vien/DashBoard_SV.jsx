import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  ArrowRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Bell, 
  Laptop
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function DashBoard_SV() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [trips, setTrips] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [grades, setGrades] = useState([]);
  const [stats, setStats] = useState({
    registered: 0,
    completed: 0,
    pendingReports: 0,
    avgScore: 'Chưa có'
  });

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchDashboardData(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchDashboardData = async (svId) => {
    try {
      const tripsRes = await sinhVienApi.getRegisteredTrips(svId);
      const tripsList = tripsRes.data || [];
      setTrips(tripsList);

      const notifsRes = await sinhVienApi.getNotifications(svId);
      setNotifications(notifsRes.data || []);

      const gradesRes = await sinhVienApi.getGrades(svId);
      setGrades(gradesRes.data || []);

      const statsRes = await sinhVienApi.getDashboardStats(svId);
      setStats(statsRes.data);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      
      // MOCK DATA FALLBACK for UI testing if API fails
      setStats({
        registered: 3,
        completed: 1,
        pendingReports: 1,
        avgScore: '8.5'
      });
      setTrips([
        { id: 1, trang_thai: 'HopLe', chuyenThamQuan: { hinh_thuc: 'TrucTiep', nhaMay: { ten_nha_may: 'Yakult HCM' }, ngay_tham_quan: '2026-09-10', gio_bat_dau: '08:00', gio_ket_thuc: '11:00' } },
        { id: 2, trang_thai: 'HopLe', chuyenThamQuan: { hinh_thuc: 'TrucTuyen', nhaMay: { ten_nha_may: 'Vinamilk Bình Dương' }, ngay_tham_quan: '2026-09-15', gio_bat_dau: '13:00', gio_ket_thuc: '16:00' } }
      ]);
      setNotifications([
        { id: 1, da_doc: false, tieu_de: 'Nhắc nhở nộp bài thu hoạch chuyến đi Yakult', ngay_gui: '2026-08-19' },
        { id: 2, da_doc: true, tieu_de: 'Lịch tham quan mới đã được cập nhật', ngay_gui: '2026-08-15' },
        { id: 3, da_doc: true, tieu_de: 'Hoàn tất thủ tục thanh toán lệ phí', ngay_gui: '2026-08-10' }
      ]);
      setStudent({ ho_ten: 'Sinh viên Demo' });
    }
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-bold">
        Đang tải dữ liệu học tập...
      </div>
    );
  }

  const upcomingTrips = trips
    .filter(t => t.trang_thai === 'HopLe' || t.trang_thai === 'ChoDuyet')
    .slice(0, 4);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Trang chủ</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Chào mừng quay trở lại, {student.ho_ten}!</p>
      </div>

      {/* Row of 4 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chuyến đã đăng ký</p>
            <p className="text-3xl font-black text-slate-800 leading-none">{stats.registered}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#89B449]/10 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-[#89B449]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chuyến đã hoàn thành</p>
            <p className="text-3xl font-black text-slate-800 leading-none">{stats.completed}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-5">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${stats.pendingReports > 0 ? 'bg-[#DBD468]/20' : 'bg-slate-100'}`}>
            <AlertCircle className={`w-6 h-6 ${stats.pendingReports > 0 ? 'text-[#DBD468]' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bài thu hoạch cần nộp</p>
            <p className={`text-3xl font-black leading-none ${stats.pendingReports > 0 ? 'text-[#DBD468]' : 'text-slate-800'}`}>{stats.pendingReports}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#407F3E]/10 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-[#407F3E]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Điểm trung bình hiện tại</p>
            <p className="text-3xl font-black text-[#407F3E] leading-none">{stats.avgScore}</p>
          </div>
        </div>
      </div>

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
            {upcomingTrips.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Compass className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-bold">Không có chuyến đi sắp tới nào</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E7E0C4]">
                {upcomingTrips.map((trip) => {
                  const isOnline = trip.chuyenThamQuan?.hinh_thuc === 'TrucTuyen';
                  return (
                    <div key={trip.id} className="relative flex flex-col">
                      <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-[#407F3E] ring-4 ring-white z-10"></div>
                      <div className="bg-[#E7E0C4]/10 rounded-xl p-4 border border-[#E7E0C4] hover:border-[#407F3E]/50 transition-colors">
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <h3 className="font-bold text-sm text-slate-800 line-clamp-1">
                            {trip.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chưa xác định'}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            isOnline ? 'bg-slate-100 text-slate-600' : 'bg-[#89B449]/10 text-[#407F3E]'
                          }`}>
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
                            {trip.chuyenThamQuan?.gio_bat_dau?.slice(0, 5) || '--'} - {trip.chuyenThamQuan?.gio_ket_thuc?.slice(0, 5) || '--'}
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
            {recentNotifications.length === 0 ? (
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
