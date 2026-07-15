import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Clock, 
  Users, 
  Calendar, 
  MapPin, 
  CheckSquare, 
  AlertTriangle 
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function DashBoard_GV() {
  const navigate = useNavigate();
  const [lecturer, setLecturer] = useState(null);
  const [students, setStudents] = useState([]);
  const [trips, setTrips] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchData(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchData = async (gvId) => {
    try {
      const studentsRes = await giangVienApi.getGuidedStudents(gvId);
      setStudents(studentsRes.data);

      const tripsRes = await giangVienApi.getLedTrips(gvId);
      setTrips(tripsRes.data);

      const reportsRes = await giangVienApi.getGuidedReports(gvId);
      setReports(reportsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!lecturer) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải trang tổng quan giảng viên...
      </div>
    );
  }

  // Calculations
  const ongoingTrips = trips.filter(t => t.trang_thai === 'MoDangKy' || t.trang_thai === 'ChoDuyet');
  const ledTripsCount = trips.length;
  const pendingGradingCount = reports.filter(r => !r.diem_bai_thu_hoach).length;
  const guidedCount = students.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">Khu vực Giảng viên</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">
          Xin chào, <span className="text-primary font-bold">{lecturer.ho_ten}</span>. Quản lý sinh viên hướng dẫn, chấm bài thu hoạch và điểm danh đoàn kiến tập.
        </p>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        
        {/* Card 1: Chuyến đi dẫn đoàn */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-variant/40 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e5ffdc] text-primary flex items-center justify-center shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Chuyến đi dẫn đoàn</p>
            <p className="text-[#191d17] font-black text-3xl mt-1">{ledTripsCount}</p>
          </div>
        </div>

        {/* Card 2: Bài thu hoạch cần chấm */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-variant/40 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
          {pendingGradingCount > 0 && (
            <div className="absolute top-4 right-4 bg-warning-yellow/20 text-on-surface border border-warning-yellow/40 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-on-surface-variant" />
              <span>Cần xử lý</span>
            </div>
          )}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-warning-yellow/5 rounded-full blur-xl"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-inner border border-amber-100">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Bài cần chấm điểm</p>
            <p className="text-[#191d17] font-black text-3xl mt-1">{pendingGradingCount}</p>
          </div>
        </div>

        {/* Card 3: Đợt đang hướng dẫn */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-variant/40 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-xl"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-inner border border-blue-100">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Đoàn đang triển khai</p>
            <p className="text-[#191d17] font-black text-3xl mt-1">{ongoingTrips.length}</p>
          </div>
        </div>

        {/* Card 4: Tổng sinh viên hướng dẫn */}
        <div className="bg-primary text-white rounded-3xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-xs">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Sinh viên hướng dẫn</p>
            <p className="text-white font-black text-4xl mt-1">{guidedCount}</p>
          </div>
        </div>

      </div>

      {/* Two-Column Grid: Leading Trips & Awaiting Grading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Column: Lịch dẫn đoàn */}
        <div className="bg-white rounded-3xl shadow-sm border border-surface-variant/40 flex flex-col overflow-hidden relative">
          <div className="p-6 pb-4 bg-[#f8faf1] border-b border-surface-variant/40 flex justify-between items-center">
            <h2 className="font-bold text-base text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Chuyến đi dẫn đoàn gần đây</span>
            </h2>
          </div>
          
          <div className="flex-1 p-6 space-y-4 bg-white">
            {trips.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Bạn chưa được phân công dẫn đoàn chuyến nào.</p>
            ) : (
              trips.slice(0, 3).map((trip) => (
                <div 
                  key={trip.id}
                  onClick={() => navigate('/giang-vien/schedule')}
                  className="flex gap-4 p-4 rounded-2xl bg-[#f8faf1] hover:bg-[#f2f5ec] transition-colors group cursor-pointer relative overflow-hidden border border-slate-100"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"></div>
                  <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-slate-200 pr-4 select-none">
                    <span className="text-[#191d17] font-black text-2xl">
                      {new Date(trip.ngay_tham_quan).getDate()}
                    </span>
                    <span className="text-on-surface-variant text-[10px] font-bold uppercase">
                      Tháng {new Date(trip.ngay_tham_quan).getMonth() + 1}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 bg-[#e5ffdc] text-primary font-bold rounded-full text-[10px] uppercase tracking-wider">
                        {trip.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp'}
                      </span>
                      <span className="text-on-surface-variant font-medium flex items-center gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5" /> {trip.gio_bat_dau.slice(0, 5)} - {trip.gio_ket_thuc.slice(0, 5)}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors">
                      {trip.nhaMay?.ten_nha_may}
                    </h3>
                    <p className="text-on-surface-variant font-semibold text-xs flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {trip.nhaMay?.dia_chi}
                    </p>
                  </div>
                </div>
              ))
            )}

            <button 
              onClick={() => navigate('/giang-vien/schedule')}
              className="w-full py-3 mt-2 text-primary hover:bg-primary/5 rounded-xl transition-colors font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <span>Xem toàn bộ danh sách dẫn đoàn</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Column: Bài chờ chấm */}
        <div className="bg-white rounded-3xl shadow-sm border border-surface-variant/40 flex flex-col overflow-hidden relative">
          <div className="p-6 pb-4 bg-[#f8faf1] border-b border-surface-variant/40 flex justify-between items-center">
            <h2 className="font-bold text-base text-primary flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              <span>Báo cáo bài thu hoạch chờ chấm</span>
            </h2>
            <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
              {pendingGradingCount} bài chờ
            </span>
          </div>
          
          <div className="flex-1 p-6 space-y-4 bg-white">
            {reports.filter(r => !r.diem_bai_thu_hoach).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Tuyệt vời! Không còn bài thu hoạch nào chờ chấm.</p>
            ) : (
              reports.filter(r => !r.diem_bai_thu_hoach).slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#f8faf1] hover:bg-[#f2f5ec] transition-colors group border border-slate-50"
                >
                  <div className="w-10 h-10 rounded-full bg-[#e5ffdc] flex items-center justify-center text-primary font-bold shadow-inner">
                    {item.phieuDangKy?.sinhVien?.ho_ten?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-bold text-sm text-on-surface truncate pr-2">
                        {item.phieuDangKy?.sinhVien?.ho_ten}
                      </h3>
                      <span className="text-on-surface-variant text-[9px] bg-slate-100 px-2 py-0.5 rounded font-bold whitespace-nowrap">
                        {new Date(item.ngay_nop).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-on-surface-variant font-semibold text-xs truncate flex items-center gap-1">
                      <span>MSSV: {item.phieuDangKy?.sinhVien?.mssv}</span>
                      <span>•</span>
                      <span>{item.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may}</span>
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/giang-vien/grading')}
                    className="shrink-0 px-4 py-2 bg-primary text-white hover:bg-primary-container font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Chấm điểm</span>
                  </button>
                </div>
              ))
            )}

            <button 
              onClick={() => navigate('/giang-vien/grading')}
              className="w-full py-3 mt-2 text-primary hover:bg-primary/5 rounded-xl transition-colors font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <span>Đi đến giao diện chấm bài thu hoạch</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
