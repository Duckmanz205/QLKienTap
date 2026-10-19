import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Clock, Laptop, Phone, 
  ChevronDown, Check, User, Users, Building2,
  ArrowRight, AlertCircle, CheckCircle2, XCircle, FileText,
  Search, X
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function LichTrinhDoan_SV() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTripDropdown, setSearchTripDropdown] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [student, setStudent] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [students, setStudents] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [enterpriseContact, setEnterpriseContact] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchTrips(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchTrips = async (svId) => {
    try {
      const res = await sinhVienApi.getRegisteredTrips(svId);
      const validTrips = (res.data || []).filter(t => 
        t.trang_thai === 'HopLe' || 
        t.trang_thai === 'DaThamGia' || 
        t.trang_thai === 'HoanThanh'
      );
      setTrips(validTrips);
      if (validTrips.length > 0) {
        setSelectedTrip(validTrips[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedTrip?.chuyenThamQuan?.id) {
      setSearchStudent('');
      sinhVienApi.getTripInfo(selectedTrip.chuyenThamQuan.id).then(res => {
        const listSv = (res.data.students || []).map(r => ({
          id: r.id,
          name: r.ho_ten,
          mssv: r.mssv,
          role: 'Sinh viên'
        }));
        setStudents(listSv);
        setLecturers(res.data.lecturers || []);
        if (res.data.enterpriseContact) {
          setEnterpriseContact(res.data.enterpriseContact);
        }
      }).catch(err => console.error(err));
    } else {
      setStudents([]);
      setLecturers([]);
      setEnterpriseContact(null);
      setSearchStudent('');
    }
  }, [selectedTrip]);

  // Format Helper: [DD/MM/YYYY] Tên nhà máy (Trực tiếp / Trực tuyến)
  const formatTripLabel = (trip) => {
    if (!trip || !trip.chuyenThamQuan) return 'Chưa có chuyến tham quan';
    const ctq = trip.chuyenThamQuan;
    const dateStr = ctq.ngay_tham_quan
      ? new Date(ctq.ngay_tham_quan).toLocaleDateString('vi-VN')
      : '--/--/----';
    const tenNhaMay = ctq.nhaMay?.ten_nha_may || 'Chưa xác định';
    const hinhThuc = ctq.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp';
    return `[${dateStr}] ${tenNhaMay} (${hinhThuc})`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--/--/----';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '--/--/----' : d.toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateVal) => {
    if (!dateVal) return '--';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '--';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  };

  // Badge Status Mappers
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'HopLe':
      case 'HOPLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đủ điều kiện tham gia
          </span>
        );
      case 'DaThamGia':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-300 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Đã tham gia
          </span>
        );
      case 'HoanThanh':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Đã hoàn thành
          </span>
        );
      case 'VangMat':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 shadow-sm">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Vắng mặt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-white/60 text-slate-700 border border-slate-300 shadow-sm">
            {status}
          </span>
        );
    }
  };

  const renderToChucBadge = (cachToChuc) => {
    if (cachToChuc === 'TuDo') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-sm">
          Chuyến tự do
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
        Do Khoa/CLB tổ chức
      </span>
    );
  };

  if (!student) return <div className="p-6 text-slate-600">Đang tải dữ liệu...</div>;

  const ctq = selectedTrip?.chuyenThamQuan;
  const ptq = selectedTrip?.phieuThamQuan;
  const diemDanh = ptq?.diemDanh;
  const baiThuHoach = ptq?.baiThuHoach;

  // Contact resolution for enterprise
  const nguoiLienHeDN =
    ctq?.dauMoiDoanhNghiep?.nguoi_lien_he ||
    enterpriseContact?.nguoi_lien_he ||
    ctq?.nhaMay?.nguoi_lien_he ||
    null;

  const sdtLienHeDN =
    ctq?.dauMoiDoanhNghiep?.sdt_lien_he ||
    enterpriseContact?.sdt_lien_he ||
    ctq?.nhaMay?.sdt_lien_he ||
    null;

  // Start Date Time & Time comparisons
  const getTripStartDateTime = () => {
    if (!ctq || !ctq.ngay_tham_quan) return null;
    const dStr = typeof ctq.ngay_tham_quan === 'string'
      ? ctq.ngay_tham_quan.split('T')[0]
      : new Date(ctq.ngay_tham_quan).toISOString().split('T')[0];
    const timeStr = ctq.gio_bat_dau ? ctq.gio_bat_dau.slice(0, 5) : '08:00';
    return new Date(`${dStr}T${timeStr}:00`);
  };

  const startDateTime = getTripStartDateTime();
  const now = new Date();
  const isPastStart = startDateTime ? now >= startDateTime : false;

  const isPastTripDay = () => {
    if (!ctq || !ctq.ngay_tham_quan) return false;
    const d = new Date(ctq.ngay_tham_quan);
    d.setHours(23, 59, 59, 999);
    return now > d;
  };
  const isPastDay = isPastTripDay();

  const isSameDayTrip = () => {
    if (!ctq || !ctq.ngay_tham_quan) return false;
    const d = new Date(ctq.ngay_tham_quan);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };
  const isToday = isSameDayTrip();

  // Report Deadline: ptq.han_nop_bao_cao or trip date + 10 days at 23:59:59
  const getReportDeadline = () => {
    if (ptq?.han_nop_bao_cao) {
      return new Date(ptq.han_nop_bao_cao);
    }
    if (ctq?.ngay_tham_quan) {
      const d = new Date(ctq.ngay_tham_quan);
      d.setDate(d.getDate() + 10);
      d.setHours(23, 59, 59, 999);
      return d;
    }
    return null;
  };
  const reportDeadline = getReportDeadline();
  const isOverdueReport = reportDeadline ? now > reportDeadline : false;

  // Filter students by name and MSSV
  const filteredStudents = students.filter((st) => {
    const q = searchStudent.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (st.name || '').toLowerCase().includes(q);
    const mssvMatch = (st.mssv || '').toLowerCase().includes(q);
    return nameMatch || mssvMatch;
  });

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative" onClick={() => setIsDropdownOpen(false)}>
      
      {/* Header & Dropdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch trình & thông tin đoàn</h1>
          <p className="text-xs text-slate-500 mt-1">Theo dõi tiến trình thực tế của chuyến kiến tập từ khi xuất phát đến khi nộp báo cáo.</p>
        </div>
        
        {/* Trip Selector */}
        <div className="relative w-full md:w-[420px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Chọn chuyến tham quan</label>
          <div 
            onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all shadow-sm ${isDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="font-bold text-slate-800 truncate pr-2">
              {selectedTrip ? formatTripLabel(selectedTrip) : 'Chưa có chuyến tham quan'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {isDropdownOpen && trips.length > 0 && (
            <div className="absolute top-full right-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[320px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm theo ngày, tên nhà máy..." 
                  value={searchTripDropdown}
                  onChange={(e) => setSearchTripDropdown(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {trips
                  .filter(trip => formatTripLabel(trip).toLowerCase().includes(searchTripDropdown.toLowerCase()))
                  .map(trip => (
                    <div 
                      key={trip.id}
                      onClick={() => { setSelectedTrip(trip); setIsDropdownOpen(false); setSearchTripDropdown(''); }}
                      className={`px-4 py-3 text-sm cursor-pointer flex justify-between items-center transition-colors border-b border-slate-50 last:border-0 ${
                        selectedTrip?.id === trip.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-2">{formatTripLabel(trip)}</span>
                      {selectedTrip?.id === trip.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                {trips.filter(trip => formatTripLabel(trip).toLowerCase().includes(searchTripDropdown.toLowerCase())).length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-500 text-center">Không tìm thấy chuyến phù hợp</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTrip ? (
        <>
          {/* Overview Info Card */}
          <div className="bg-[#E7E0C4] rounded-2xl p-6 shadow-sm mb-8 flex flex-col lg:flex-row gap-8 lg:items-start justify-between border border-[#DBD468]/40">
            
            {/* Left Side: Trip Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider text-white shadow-sm ${ctq?.hinh_thuc === 'TrucTuyen' ? 'bg-sky-600' : 'bg-[#407F3E]'}`}>
                  {ctq?.hinh_thuc === 'TrucTuyen' ? <Laptop className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                  {ctq?.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp'}
                </span>
                {renderStatusBadge(selectedTrip.trang_thai)}
                {renderToChucBadge(ctq?.cach_to_chuc)}
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-3">{ctq?.nhaMay?.ten_nha_may || 'Chưa xác định'}</h2>
              
              <div className="space-y-2.5 text-sm font-medium text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                  <span className="leading-snug">{ctq?.nhaMay?.dia_chi || 'Đang cập nhật địa chỉ'}</span>
                </div>

                {ctq?.hinh_thuc === 'TrucTiep' && ctq?.dia_diem_tap_trung && (
                  <div className="inline-flex items-start gap-2 px-3 py-1.5 rounded-lg bg-white/70 border border-white text-xs font-semibold text-slate-800">
                    <span className="text-[#407F3E] font-bold shrink-0">📍 Địa điểm tập trung:</span>
                    <span>{ctq.dia_diem_tap_trung}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>{formatDate(ctq?.ngay_tham_quan)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Bắt đầu: {ctq?.gio_bat_dau?.slice(0, 5) || '--:--'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-px self-stretch bg-white/60"></div>

            {/* Right Side: Contact Cards (Giảng viên + Đầu mối Doanh nghiệp) */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[300px]">
              
              {/* Mentors */}
              <div className="bg-white/60 rounded-xl p-4 border border-white/80 shadow-sm flex-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#407F3E]" />
                  Giảng viên dẫn đoàn
                </p>
                {lecturers.length > 0 ? lecturers.map((gv, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/80 border border-white mb-2 last:mb-0">
                    <div className="w-8 h-8 rounded-lg bg-[#407F3E]/10 text-[#407F3E] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-xs leading-tight flex items-center gap-1.5">
                        <span className="truncate">{gv.ho_ten}</span>
                        {gv.la_truong_doan && <span className="px-1 py-0.2 rounded bg-[#407F3E]/10 text-[#407F3E] text-[9px] uppercase font-black shrink-0">Trưởng đoàn</span>}
                      </h4>
                      <p className="text-[10px] text-[#407F3E] font-semibold mt-0.5">Giảng viên dẫn đoàn</p>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{gv.so_dien_thoai || '--'}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-xs text-slate-500 italic">Chờ phân công giảng viên dẫn đoàn.</div>
                )}
              </div>

              {/* Enterprise Contact */}
              <div className="bg-white/60 rounded-xl p-4 border border-white/80 shadow-sm flex-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#407F3E]" />
                  Đầu mối doanh nghiệp
                </p>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/80 border border-white">
                  <div className="w-8 h-8 rounded-lg bg-[#89B449]/15 text-[#407F3E] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-xs leading-tight truncate">
                      {nguoiLienHeDN || 'Đang cập nhật'}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{sdtLienHeDN || '--'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: 5-Step Real Database Timeline */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#E7E0C4]">
              <div className="flex items-center justify-between border-b border-[#E7E0C4] pb-4 mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#407F3E]" />
                  Tiến trình chuyến đi thực tế (5 bước)
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  Dữ liệu thực tế từ hệ thống
                </span>
              </div>
              
              <div className="relative pl-3">
                {/* Vertical Line */}
                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-[#E7E0C4]"></div>
                
                <div className="space-y-8">
                  
                  {/* BƯỚC 1: Tập trung & Chuẩn bị */}
                  <div className="relative flex items-start gap-6 group">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-105 ${
                      isPastStart 
                        ? 'bg-[#407F3E] text-white ring-4 ring-[#407F3E]/20' 
                        : 'bg-white border-2 border-[#407F3E] text-[#407F3E]'
                    }`}>
                      {isPastStart ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-2.5 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          Trước giờ đi
                        </span>
                        <h4 className="font-bold text-slate-800 text-base">Tập trung & Chuẩn bị</h4>
                      </div>
                      
                      <div className="text-sm font-medium text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        {ctq?.hinh_thuc === 'TrucTuyen' ? (
                          <p>
                            Sinh viên chuẩn bị thiết bị, kiểm tra kết nối mạng và truy cập phòng họp trực tuyến trước giờ bắt đầu 15 phút (đổi tên theo cú pháp <strong className="text-slate-800">MSSV - Họ tên</strong>).
                          </p>
                        ) : ctq?.cach_to_chuc === 'TuDo' ? (
                          <p>
                            <span className="text-[#407F3E] font-bold">Chuyến đi tự túc:</span> Sinh viên chủ động phương tiện di chuyển và có mặt trước cổng doanh nghiệp (<strong className="text-slate-800">Địa chỉ: {ctq?.nhaMay?.dia_chi || 'Theo thông tin nhà máy'}</strong>) tối thiểu 15 phút trước giờ bắt đầu.
                          </p>
                        ) : (
                          <p>
                            Sinh viên có mặt trước 15–30 phút tại địa điểm tập trung: <strong className="text-slate-800">{ctq?.dia_diem_tap_trung || 'Theo thông báo của đoàn kiến tập'}</strong> để điểm danh trước khi khởi hành.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BƯỚC 2: Bắt đầu tham quan tại Doanh nghiệp */}
                  <div className="relative flex items-start gap-6 group">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-105 ${
                      isPastDay 
                        ? 'bg-[#407F3E] text-white ring-4 ring-[#407F3E]/20' 
                        : isToday 
                        ? 'bg-[#407F3E] text-white ring-4 ring-[#89B449]/40 animate-pulse' 
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}>
                      {isPastDay ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-2.5 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-[#407F3E] border border-emerald-200">
                          {ctq?.gio_bat_dau?.slice(0, 5) || '08:00'} — {formatDate(ctq?.ngay_tham_quan)}
                        </span>
                        <h4 className="font-bold text-slate-800 text-base">Bắt đầu tham quan tại Doanh nghiệp</h4>
                      </div>
                      
                      <div className="text-sm font-medium text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        Thời gian chính thức bắt đầu buổi kiến tập tại <strong className="text-slate-800">{ctq?.nhaMay?.ten_nha_may || 'Doanh nghiệp'}</strong>. 
                        Đầu mối đón tiếp tại doanh nghiệp: <strong className="text-slate-800">{nguoiLienHeDN || 'Đại diện công ty'}</strong> ({sdtLienHeDN || '--'}).
                      </div>
                    </div>
                  </div>

                  {/* BƯỚC 3: Hoạt động & Xin xác nhận */}
                  <div className="relative flex items-start gap-6 group">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-105 ${
                      isPastDay || diemDanh?.trang_thai === 'CoMat'
                        ? 'bg-[#407F3E] text-white ring-4 ring-[#407F3E]/20' 
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}>
                      {isPastDay || diemDanh?.trang_thai === 'CoMat' ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-2.5 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          Tại doanh nghiệp
                        </span>
                        <h4 className="font-bold text-slate-800 text-base">Tìm hiểu quy trình & Xin xác nhận tham quan</h4>
                      </div>
                      
                      <div className="text-sm font-medium text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        Nghe phổ biến nội quy an toàn, quan sát quy trình công nghệ sản xuất và trao đổi chuyên môn. 
                        <div className="mt-2 p-2.5 bg-amber-50/80 rounded-lg border border-amber-200/80 text-amber-900 text-xs">
                          <strong>Lưu ý quan trọng:</strong> Sinh viên ghi chép số liệu thực tế và xin chữ ký/đóng dấu vào <strong>Giấy xác nhận tham quan</strong> (nếu đi trực tiếp) để đính kèm khi nộp bài thu hoạch.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BƯỚC 4: Điểm danh (Dữ liệu thật từ DiemDanh) */}
                  <div className="relative flex items-start gap-6 group">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-105 ${
                      diemDanh?.trang_thai === 'CoMat'
                        ? 'bg-[#407F3E] text-white ring-4 ring-[#407F3E]/20'
                        : diemDanh?.trang_thai === 'Vang' || diemDanh?.trang_thai === 'TuChoiThamGia'
                        ? 'bg-rose-500 text-white ring-4 ring-rose-200'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}>
                      {diemDanh?.trang_thai === 'CoMat' ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : diemDanh?.trang_thai === 'Vang' || diemDanh?.trang_thai === 'TuChoiThamGia' ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        '4'
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-2.5 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          Điểm danh
                        </span>
                        <h4 className="font-bold text-slate-800 text-base">Xác nhận tham gia (Điểm danh)</h4>
                      </div>
                      
                      <div className="text-sm font-medium text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        {!diemDanh ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 w-fit">
                              ⏳ Chờ Giảng viên dẫn đoàn điểm danh
                            </span>
                            <span className="text-xs text-slate-500">Điểm danh trực tiếp tại buổi tham quan</span>
                          </div>
                        ) : diemDanh.trang_thai === 'CoMat' ? (
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Đã điểm danh: Có mặt
                              </span>
                              <span className="text-xs text-slate-500">
                                ({formatDateTime(diemDanh.ngay_diem_danh)})
                              </span>
                            </div>
                            {diemDanh.nguoiDiemDanh?.ho_ten && (
                              <p className="text-xs text-slate-600">
                                Người điểm danh: <strong className="text-slate-800">{diemDanh.nguoiDiemDanh.ho_ten}</strong>
                              </p>
                            )}
                            {diemDanh.ghi_chu && (
                              <p className="text-xs text-slate-500 italic">
                                Ghi chú: {diemDanh.ghi_chu}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Vắng mặt / Không tham gia
                              </span>
                              <span className="text-xs text-slate-500">
                                ({formatDateTime(diemDanh.ngay_diem_danh)})
                              </span>
                            </div>
                            <p className="text-xs text-rose-600 font-semibold">
                              Lý do/Ghi chú: {diemDanh.ghi_chu || 'Không có ghi chú chi tiết'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BƯỚC 5: Hạn chót & Nộp bài thu hoạch */}
                  <div className="relative flex items-start gap-6 group">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-105 ${
                      baiThuHoach 
                        ? 'bg-[#407F3E] text-white ring-4 ring-[#407F3E]/20' 
                        : isOverdueReport
                        ? 'bg-rose-500 text-white ring-4 ring-rose-200'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}>
                      {baiThuHoach ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : isOverdueReport ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        '5'
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-2.5 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider border ${
                          isOverdueReport && !baiThuHoach 
                            ? 'bg-rose-50 text-rose-700 border-rose-300' 
                            : 'bg-emerald-50 text-[#407F3E] border-emerald-200'
                        }`}>
                          Hạn chót: {formatDateTime(reportDeadline)}
                        </span>
                        <h4 className="font-bold text-slate-800 text-base">Hoàn thành Bài thu hoạch</h4>
                      </div>
                      
                      <div className="text-sm font-medium text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        <p className="text-xs text-slate-600 mb-3">
                          Thời hạn nộp bài thu hoạch kiến tập chính thức (10 ngày kể từ ngày tham quan). Sinh viên hoàn thành báo cáo và đính kèm giấy xác nhận tham quan đúng hạn.
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                          <div>
                            {!baiThuHoach ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  Chưa nộp bài
                                </span>
                                {isOverdueReport && (
                                  <span className="text-xs text-rose-600 font-bold">
                                    (Đã quá hạn nộp)
                                  </span>
                                )}
                              </div>
                            ) : baiThuHoach.trang_thai === 'TreHan' ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  ⚠️ Đã nộp trễ hạn (Lần {baiThuHoach.lan_nop || 1})
                                </span>
                                <div className="text-[11px] text-slate-500">
                                  Ngày nộp: {formatDateTime(baiThuHoach.ngay_nop)}
                                </div>
                              </div>
                            ) : baiThuHoach.trang_thai === 'ChoBoSung' ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
                                  🔄 Chờ bổ sung (Lần {baiThuHoach.lan_nop || 1})
                                </span>
                                <div className="text-[11px] text-slate-500">
                                  Ngày nộp: {formatDateTime(baiThuHoach.ngay_nop)}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Đã nộp thành công (Lần {baiThuHoach.lan_nop || 1})
                                </span>
                                <div className="text-[11px] text-slate-500">
                                  Ngày nộp: {formatDateTime(baiThuHoach.ngay_nop)}
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            {!baiThuHoach ? (
                              <button
                                onClick={() => navigate('/sinh-vien/reports')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#407F3E] hover:bg-[#326430] text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                              >
                                Nộp bài thu hoạch ngay
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate('/sinh-vien/reports')}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#407F3E] hover:underline cursor-pointer"
                              >
                                Xem chi tiết bài nộp
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right: Students in Delegation List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E0C4] h-fit">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-[#E7E0C4] pb-4">
                <Users className="w-5 h-5 text-[#89B449]" />
                Danh sách sinh viên trong đoàn ({students.length})
              </h3>
              
              {/* Search by MSSV / Name */}
              <div className="relative mb-5">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo MSSV, họ tên..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
                />
                {searchStudent && (
                  <button
                    onClick={() => setSearchStudent('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-6 justify-start">
                {filteredStudents.map((st) => (
                  <div key={st.id} className="flex flex-col items-center w-[74px] group">
                    <div className="w-12 h-12 rounded-full bg-[#E7E0C4]/30 border border-[#E7E0C4] flex items-center justify-center mb-2 overflow-hidden group-hover:border-[#89B449] transition-colors relative">
                      <User className="w-5 h-5 text-slate-400 group-hover:text-[#89B449] transition-colors" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 text-center leading-tight line-clamp-2" title={`${st.name} ${st.mssv ? `(${st.mssv})` : ''}`}>
                      {st.name}
                    </span>
                    {st.mssv && (
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {st.mssv}
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-[#407F3E] mt-0.5">
                      Sinh viên
                    </span>
                  </div>
                ))}
                {students.length > 0 && filteredStudents.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center w-full py-4">Không tìm thấy sinh viên phù hợp.</p>
                )}
                {students.length === 0 && (
                  <p className="text-xs text-slate-500 italic">Chưa có sinh viên nào.</p>
                )}
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="flex items-center justify-center p-12 text-slate-500 bg-white rounded-2xl shadow-sm border border-[#E7E0C4]">
          Bạn chưa có chuyến đi nào hợp lệ để xem lịch trình.
        </div>
      )}
    </div>
  );
}
