import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Edit3, Presentation, GraduationCap, 
  MapPin, Calendar, Clock, ArrowRight, User
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function DashBoard_GV() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('DanDoan'); // 'DanDoan', 'HuongDan', 'HoiDong'

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

  const scheduleInWeek = [
    ...trips.map(t => ({
      id: `trip_${t.id}`,
      type: 'DanDoan',
      title: t.nhaMay?.ten_nha_may || 'Chuyến tham quan',
      date: t.ngay_tham_quan ? new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN') : '--',
      time: `${(t.gio_bat_dau || '--').slice(0, 5)} - ${(t.gio_ket_thuc || '--').slice(0, 5)}`,
      rawDate: new Date(t.ngay_tham_quan)
    })),
    ...boards.map(b => ({
      id: `board_${b.session?.id}`,
      type: 'HoiDong',
      title: `Hội đồng Bảo vệ - Nhóm ${b.session?.id}`,
      date: b.session?.ngay_bao_cao ? new Date(b.session.ngay_bao_cao).toLocaleDateString('vi-VN') : '--',
      time: `${(b.session?.gio_bat_dau || '--').slice(0, 5)} - ${(b.session?.gio_ket_thuc || '--').slice(0, 5)}`,
      rawDate: b.session?.ngay_bao_cao ? new Date(b.session.ngay_bao_cao) : new Date(0)
    }))
  ].sort((a, b) => a.rawDate - b.rawDate).slice(0, 5);

  const pendingReports = reports.filter(r => r.trang_thai !== 'DaCham');

  const getTagStyle = (type) => {
    if (type === 'DanDoan') {
      return 'bg-[#407F3E]/10 text-[#407F3E] border-[#407F3E]/20';
    }
    if (type === 'HoiDong') {
      return 'bg-[#89B449]/10 text-[#407F3E] border-[#89B449]/30'; 
    }
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getTagLabel = (type) => {
    if (type === 'DanDoan') return 'Dẫn đoàn';
    if (type === 'HoiDong') return 'Hội đồng';
    return 'Khác';
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang chủ</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Xin chào Giảng viên, {lecturer.ho_ten}!</p>
        </div>
        
        {/* Role Toggles */}
        <div className="flex bg-white p-1 rounded-full border border-[#E7E0C4] shadow-sm w-fit">
          <button 
            onClick={() => setActiveRole('DanDoan')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeRole === 'DanDoan' ? 'bg-[#89B449] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dẫn đoàn
          </button>
          <button 
            onClick={() => setActiveRole('HuongDan')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeRole === 'HuongDan' ? 'bg-[#89B449] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hướng dẫn
          </button>
          <button 
            onClick={() => setActiveRole('HoiDong')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeRole === 'HoiDong' ? 'bg-[#89B449] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hội đồng
          </button>
        </div>
      </div>

      {/* Row of 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-5 group hover:border-[#407F3E]/30 transition-colors">
          <div className="w-14 h-14 rounded-full bg-[#407F3E]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-[#407F3E]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đoàn đang dẫn</p>
            <p className="text-3xl font-black text-slate-800 leading-none">{stats.doanDangDan}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-5 group hover:border-[#DBD468]/30 transition-colors">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${stats.baiCanCham > 0 ? 'bg-[#DBD468]/20' : 'bg-slate-100'}`}>
            <Edit3 className={`w-6 h-6 ${stats.baiCanCham > 0 ? 'text-[#DBD468]' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sinh viên cần chấm bài</p>
            <p className={`text-3xl font-black leading-none ${stats.baiCanCham > 0 ? 'text-[#DBD468]' : 'text-slate-800'}`}>{stats.baiCanCham}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-5 group hover:border-[#89B449]/30 transition-colors">
          <div className="w-14 h-14 rounded-full bg-[#89B449]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Presentation className="w-6 h-6 text-[#89B449]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Buổi báo cáo sắp tới</p>
            <p className="text-3xl font-black text-slate-800 leading-none">{stats.buoiBaoCao}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex items-center gap-5 group hover:border-[#407F3E]/30 transition-colors">
          <div className="w-14 h-14 rounded-full bg-[#407F3E]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6 text-[#407F3E]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng SV đang hướng dẫn</p>
            <p className="text-3xl font-black text-[#407F3E] leading-none">{stats.tongSvHuongDan}</p>
          </div>
        </div>
        
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left card: Lịch trong tuần */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E0C4] flex flex-col h-[420px]">
          <div className="flex items-center justify-between mb-6 shrink-0 border-b border-[#E7E0C4] pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#407F3E]" />
              Lịch trình sắp tới
            </h2>
            <button 
              onClick={() => navigate('/giang-vien/led-trips')}
              className="text-xs font-bold text-[#407F3E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
            {scheduleInWeek.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500 font-medium">Không có lịch trình sắp tới.</div>
            ) : (
              scheduleInWeek.map((schedule) => (
                <div key={schedule.id} className="relative flex gap-4 p-4 rounded-xl border border-[#E7E0C4] hover:border-[#89B449]/50 hover:bg-[#89B449]/5 transition-colors group cursor-pointer">
                  <div className="mt-1 flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#407F3E] ring-4 ring-white group-hover:ring-[#89B449]/20 transition-all"></div>
                    <div className="w-px h-full bg-[#E7E0C4] mt-2 group-last:hidden"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#407F3E] transition-colors">{schedule.title}</h4>
                      <span className={`inline-block px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${getTagStyle(schedule.type)}`}>
                        {getTagLabel(schedule.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {schedule.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between mb-6 shrink-0 border-b border-[#E7E0C4] pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#DBD468]" />
              Bài chờ chấm ({stats.baiCanCham})
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
              </div>
            ) : (
              pendingReports.slice(0, 5).map((report) => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#E7E0C4] hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#E7E0C4]/30 text-[#407F3E] font-bold border border-[#E7E0C4] flex items-center justify-center shrink-0">
                      {report.phieuThamQuan?.phieuDangKy?.sinhVien?.ho_ten?.charAt(0) || 'S'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{report.phieuThamQuan?.phieuDangKy?.sinhVien?.ho_ten}</h4>
                      <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                        <MapPin className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                        {report.phieuThamQuan?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Đã nộp bài'} • {new Date(report.ngay_nop || Date.now()).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/giang-vien/grading')}
                    className="ml-4 shrink-0 px-3 py-1.5 bg-[#407F3E]/10 text-[#407F3E] hover:bg-[#407F3E] hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-[#407F3E]/20"
                  >
                    Chấm ngay
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
