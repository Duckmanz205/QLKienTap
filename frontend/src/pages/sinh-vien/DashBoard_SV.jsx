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
  Laptop,
  BookOpen
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
      // 1. Fetch Registered Trips
      const tripsRes = await sinhVienApi.getRegisteredTrips(svId);
      const tripsList = tripsRes.data;
      setTrips(tripsList);

      // 2. Fetch Notifications
      const notifsRes = await sinhVienApi.getNotifications(svId);
      setNotifications(notifsRes.data);

      // 3. Fetch Grades
      const gradesRes = await sinhVienApi.getGrades(svId);
      setGrades(gradesRes.data);

      // Calculations
      const registered = tripsList.length;
      const completed = tripsList.filter(t => t.trang_thai === 'DaThamGia' || t.trang_thai === 'HoanThanh').length;
      
      // Calculate pending reports (completed trips but without a score or report flag)
      const pendingReports = tripsList.filter(t => 
        (t.trang_thai === 'DaThamGia' || t.trang_thai === 'HoanThanh') && !t.baiThuHoach
      ).length;

      // Calculate avg score
      let avgScore = 'Chưa có';
      if (gradesRes.data && gradesRes.data.length > 0) {
        const currentTerm = gradesRes.data[0];
        if (currentTerm.diem_tong_ket !== null) {
          avgScore = Number(currentTerm.diem_tong_ket).toFixed(1);
        } else if (currentTerm.selectedTrips && currentTerm.selectedTrips.length > 0) {
          const scores = currentTerm.selectedTrips.map(trip => {
            return (
              Number(trip.diem_chuan_bi || 0) * 0.3 +
              Number(trip.diem_bai_thu_hoach || 0) * 0.3 +
              Number(trip.diem_bao_cao_tqnm || 0) * 0.4 +
              Number(trip.diem_cong || 0)
            );
          });
          const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
          avgScore = avg.toFixed(1);
        }
      }

      setStats({
        registered,
        completed,
        pendingReports,
        avgScore
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải dữ liệu học tập...
      </div>
    );
  }

  const completionPercentage = stats.registered > 0 ? (stats.completed / stats.registered) * 100 : 0;
  
  // Upcoming trips: filter trips scheduled for today/future or not yet completed
  const upcomingTrips = trips
    .filter(t => t.trang_thai === 'HopLe' || t.trang_thai === 'ChoDuyet')
    .slice(0, 3);

  const recentNotifications = notifications.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary to-primary-container rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
          <BookOpen className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-wider uppercase">
            Cổng Thông Tin IMS
          </span>
          <h2 className="text-2xl md:text-3xl font-black mt-3">Chào mừng quay trở lại, {student.ho_ten}!</h2>
          <p className="mt-2 text-on-primary-container text-sm leading-relaxed">
            Học phần kiến tập thực tế doanh nghiệp giúp bạn tích lũy kiến thức thực tiễn và định hướng nghề nghiệp. Hãy kiểm tra lịch trình, nộp bài thu hoạch đúng hạn để hoàn thành học phần tốt nhất.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold">
            <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
              Mã SV: {student.mssv}
            </div>
            <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
              Lớp: {student.ten_lop}
            </div>
            <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
              Ngành: {student.khoa?.ten_khoa}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Chuyến đã đăng ký</span>
            <div className="w-10 h-10 rounded-full bg-[#e5ffdc] flex items-center justify-center text-primary">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-on-surface leading-none">{stats.registered}</span>
            <span className="text-on-surface-variant text-sm">chuyến</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Đã hoàn thành</span>
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-on-surface leading-none">{stats.completed}</span>
            <span className="text-on-surface-variant text-sm">chuyến</span>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-on-surface-variant mb-1 font-semibold">
              <span>Tiến độ hoàn thành</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Báo cáo cần nộp</span>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#ba1a1a] leading-none">{stats.pendingReports}</span>
            <span className="text-on-surface-variant text-sm">báo cáo</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Điểm tổng kết</span>
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-550" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-primary leading-none">{stats.avgScore}</span>
            {stats.avgScore !== 'Chưa có' && <span className="text-on-surface-variant text-sm">/ 10</span>}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Upcoming Trips */}
        <div className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              <span>Chuyến tham quan sắp tới</span>
            </h2>
            <button 
              onClick={() => navigate('/sinh-vien/register')}
              className="text-primary hover:text-primary-container text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingTrips.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f2f5ec]/50 rounded-2xl border border-dashed border-outline-variant/50">
              <Compass className="w-12 h-12 text-outline/40 mb-3" />
              <p className="text-sm font-bold text-on-surface-variant">Không có chuyến đi sắp tới nào</p>
              <p className="text-xs text-outline mt-1">Đăng ký chuyến tham quan mới để bắt đầu học tập thực tế</p>
            </div>
          ) : (
            <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {upcomingTrips.map((trip) => {
                const isOnline = trip.chuyenThamQuan.hinh_thuc === 'TrucTuyen';
                return (
                  <div key={trip.id} className="relative flex gap-4 group">
                    <div className={`absolute -left-[19px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white z-10 transition-colors ${
                      trip.trang_thai === 'HopLe' ? 'bg-primary' : 'bg-amber-500'
                    }`}></div>

                    <div className="flex-1 bg-[#f8faf1] rounded-2xl p-4 border border-surface-variant/30 hover:shadow-md hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {trip.chuyenThamQuan.nhaMay?.ten_nha_may}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                          isOnline 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          <span>{isOnline ? 'Trực tuyến' : 'Trực tiếp'}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-on-surface-variant font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-outline" />
                          <span>{new Date(trip.chuyenThamQuan.ngay_tham_quan).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-outline" />
                          <span>{trip.chuyenThamQuan.gio_bat_dau.slice(0, 5)} - {trip.chuyenThamQuan.gio_ket_thuc.slice(0, 5)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Card: Recent Notifications */}
        <div className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <Bell className="w-5 h-5 text-secondary" />
              <span>Thông báo gần đây</span>
            </h2>
            <button 
              onClick={() => navigate('/sinh-vien/notifications')}
              className="text-primary hover:text-primary-container text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {recentNotifications.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-450 text-xs">
                Chưa có thông báo nào.
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => navigate('/sinh-vien/notifications')}
                  className="p-4 rounded-xl bg-[#f8faf1]/80 hover:bg-[#f2f5ec] transition-all cursor-pointer flex gap-4 items-start border border-surface-variant/20 group shadow-sm hover:scale-[1.01]"
                >
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    notif.da_doc ? 'bg-transparent' : 'bg-[#DBD468]'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {notif.tieu_de}
                    </h4>
                    <p className="text-xs text-on-surface-variant line-clamp-1 mt-1 font-medium">
                      {notif.noi_dung}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-outline">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.ngay_gui).toLocaleDateString('vi-VN')}</span>
                    </div>
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
