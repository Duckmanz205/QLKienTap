import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, MapPin, Laptop, ChevronLeft, ChevronRight, Eye,
  Search, ChevronDown, Check, X, ExternalLink, Clock, Phone, Building2,
  Users, CheckCircle2, LayoutGrid, List, Copy, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { giangVienApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function LichDanDoan_GV() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar' - mặc định calendar theo ảnh
  const [calendarSubView, setCalendarSubView] = useState('grid'); // 'grid' | 'agenda'
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lecturer, setLecturer] = useState(null);

  // Calendar Navigation & Date Selection
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal & Popover States
  const [selectedTripModal, setSelectedTripModal] = useState(null);
  const [overflowPopover, setOverflowPopover] = useState(null); // { dateStr, trips, targetRect }
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Calendar Sidebar Filters
  const [calendarFilters, setCalendarFilters] = useState({
    sapDienRa: true,
    dangDienRa: true,
    daHoanThanh: true,
    trucTiep: true,
    trucTuyen: true
  });

  // Filter & Pagination states (Tab Danh sách)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedHinhThuc, setSelectedHinhThuc] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchTrips(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchTrips = async (gvId) => {
    try {
      setLoading(true);
      const res = await giangVienApi.getLedTrips(gvId);
      setTrips(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (trip) => {
    const date = new Date(trip.ngay_tham_quan || trip.ngay_khoi_hanh || Date.now());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date < today) return 'Đã hoàn thành';
    if (date > today) return 'Sắp diễn ra';
    return 'Đang diễn ra';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Sắp diễn ra':
        return <span className="inline-flex items-center px-2.5 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-xs border border-[#DBD468]/30">{status}</span>;
      case 'Đang diễn ra':
        return <span className="inline-flex items-center px-2.5 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-xs border border-[#89B449]/30">{status}</span>;
      case 'Đã hoàn thành':
        return <span className="inline-flex items-center px-2.5 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
      default:
        return null;
    }
  };

  // Helper chuyển đổi Date sang key YYYY-MM-DD
  const toDateKey = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Chuyến đi áp dụng bộ lọc Calendar Sidebar
  const calendarFilteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const status = getStatus(trip);
      if (status === 'Sắp diễn ra' && !calendarFilters.sapDienRa) return false;
      if (status === 'Đang diễn ra' && !calendarFilters.dangDienRa) return false;
      if (status === 'Đã hoàn thành' && !calendarFilters.daHoanThanh) return false;

      const isOnline = trip.hinh_thuc === 'TrucTuyen';
      if (isOnline && !calendarFilters.trucTuyen) return false;
      if (!isOnline && !calendarFilters.trucTiep) return false;

      return true;
    });
  }, [trips, calendarFilters]);

  // Map nhóm các chuyến đi theo YYYY-MM-DD
  const tripsByDate = useMemo(() => {
    const map = new Map();
    calendarFilteredTrips.forEach(trip => {
      const key = toDateKey(trip.ngay_tham_quan || trip.ngay_khoi_hanh);
      if (key) {
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(trip);
      }
    });
    return map;
  }, [calendarFilteredTrips]);

  // Các chuyến đi của ngày được chọn (selectedDate)
  const selectedDateKey = toDateKey(selectedDate);
  const selectedDayTrips = useMemo(() => {
    return tripsByDate.get(selectedDateKey) || [];
  }, [tripsByDate, selectedDateKey]);

  // Các chuyến đi trong tháng hiện tại (dành cho chế độ Lịch biểu Agenda)
  const currentMonthAgendaTrips = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return calendarFilteredTrips
      .filter(trip => {
        const d = new Date(trip.ngay_tham_quan || trip.ngay_khoi_hanh || Date.now());
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .sort((a, b) => {
        const dateA = new Date(a.ngay_tham_quan || a.ngay_khoi_hanh || 0);
        const dateB = new Date(b.ngay_tham_quan || b.ngay_khoi_hanh || 0);
        return dateA - dateB;
      });
  }, [calendarFilteredTrips, currentMonth]);

  // Quay về tháng & ngày hôm nay
  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Mở Google Maps
  const handleOpenGoogleMaps = (address) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Sao chép số điện thoại
  const handleCopyPhone = (phone) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Mini-calendar generation logic
  const renderMiniCalendar = () => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    const now = new Date();
    const isCurrentMonthNow = now.getFullYear() === year && now.getMonth() === month;
    
    // Check which days have trips (theo filter)
    const tripDays = new Set();
    calendarFilteredTrips.forEach(trip => {
      const tripDate = new Date(trip.ngay_tham_quan || trip.ngay_khoi_hanh || Date.now());
      if (tripDate.getFullYear() === year && tripDate.getMonth() === month) {
        tripDays.add(tripDate.getDate());
      }
    });

    const dates = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const thisDate = new Date(year, month, i);
      const isSelected = selectedDate && 
        selectedDate.getFullYear() === year && 
        selectedDate.getMonth() === month && 
        selectedDate.getDate() === i;

      dates.push({
        date: i,
        fullDate: thisDate,
        active: tripDays.has(i),
        today: isCurrentMonthNow && now.getDate() === i,
        selected: isSelected
      });
    }

    const paddingCells = 42 - (firstDayIndex + daysInMonth);

    return (
      <div className="bg-white rounded-xl p-4 shadow-xs border border-white mt-4">
        <div className="flex items-center justify-between mb-3 text-slate-800">
          <button 
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-600"
            title="Tháng trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-800">Tháng {month + 1}, {year}</span>
          <button 
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-600"
            title="Tháng sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {days.map(d => <div key={d} className="text-[10px] font-bold text-slate-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs font-medium">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-start-${i}`} className="flex items-center justify-center h-7"></div>
          ))}
          {dates.map((d, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedDate(d.fullDate)}
              className="flex items-center justify-center relative h-7 cursor-pointer"
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs transition-all ${
                d.today 
                  ? 'bg-[#407F3E] text-white font-bold shadow-xs' 
                  : d.selected 
                    ? 'ring-2 ring-[#407F3E] font-bold text-[#407F3E] bg-[#E7E0C4]/40' 
                    : 'text-slate-700 hover:bg-slate-100'
              }`}>
                {d.date}
              </span>
              {d.active && !d.today && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#DBD468]"></span>
              )}
            </div>
          ))}
          {Array.from({ length: paddingCells }).map((_, i) => (
            <div key={`empty-end-${i}`} className="flex items-center justify-center h-7"></div>
          ))}
        </div>
      </div>
    );
  };

  // Filter & Pagination logic cho Tab Danh sách (List View)
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const nhaMay = trip.nhaMay?.ten_nha_may || 'Chuyến tham quan';
      const matchSearch = !searchTerm || nhaMay.toLowerCase().includes(searchTerm.toLowerCase());
      const statusText = getStatus(trip);
      const matchStatus = selectedStatus === 'ALL' || statusText === selectedStatus;
      const isOnline = trip.hinh_thuc === 'TrucTuyen';
      const matchHinhThuc = selectedHinhThuc === 'ALL' || 
        (selectedHinhThuc === 'TrucTuyen' && isOnline) || 
        (selectedHinhThuc === 'TrucTiep' && !isOnline);
      return matchSearch && matchStatus && matchHinhThuc;
    });
  }, [trips, searchTerm, selectedStatus, selectedHinhThuc]);

  const totalPages = Math.ceil(filteredTrips.length / limit) || 1;
  const paginatedTrips = filteredTrips.slice((currentPage - 1) * limit, currentPage * limit);

  // Tính toán lưới lịch 7 cột (Calendar Grid)
  const calendarGridData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0: CN, 1: T2,...
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Ngày của tháng trước (Padding cells trước)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const fullDate = new Date(year, month - 1, dayNum);
      const key = toDateKey(fullDate);
      cells.push({
        dayNum,
        fullDate,
        dateKey: key,
        isCurrentMonth: false,
        trips: tripsByDate.get(key) || []
      });
    }

    // Ngày của tháng hiện tại
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const fullDate = new Date(year, month, i);
      const key = toDateKey(fullDate);
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;
      cells.push({
        dayNum: i,
        fullDate,
        dateKey: key,
        isCurrentMonth: true,
        isToday,
        trips: tripsByDate.get(key) || []
      });
    }

    // Ngày của tháng sau (Padding cells sau cho đủ bội số của 7)
    const remainingCells = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const fullDate = new Date(year, month + 1, i);
      const key = toDateKey(fullDate);
      cells.push({
        dayNum: i,
        fullDate,
        dateKey: key,
        isCurrentMonth: false,
        trips: tripsByDate.get(key) || []
      });
    }

    return cells;
  }, [currentMonth, tripsByDate]);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            Lịch dẫn đoàn
            {lecturer && (
              <span className="text-sm font-semibold text-slate-500">
                — {lecturer.ho_ten} ({lecturer.ma_gv || 'GV'})
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi kế hoạch dẫn đoàn tham quan doanh nghiệp và điều hướng tác vụ nhanh
          </p>
        </div>
        
        {/* Main View Toggle: Danh sách / Lịch */}
        <div className="flex bg-[#E7E0C4]/50 p-1 rounded-xl border border-[#E7E0C4] shadow-2xs">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'list' ? 'bg-[#407F3E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Danh sách
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'calendar' ? 'bg-[#407F3E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Lịch
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. FILTER BAR (Chỉ hiển thị khi ở tab Danh Sách) */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm theo tên nhà máy, chuyến đi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all font-medium text-slate-700"
            />
          </div>

          {/* Trạng thái Dropdown */}
          <SearchableDropdown
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'Sắp diễn ra', label: 'Sắp diễn ra' },
              { value: 'Đang diễn ra', label: 'Đang diễn ra' },
              { value: 'Đã hoàn thành', label: 'Đã hoàn thành' }
            ]}
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            }}
            placeholder="Tất cả trạng thái"
            searchPlaceholder="Tìm trạng thái..."
            className="min-w-[180px]"
          />

          {/* Hình thức Dropdown */}
          <SearchableDropdown
            options={[
              { value: 'ALL', label: 'Tất cả hình thức' },
              { value: 'TrucTiep', label: 'Trực tiếp' },
              { value: 'TrucTuyen', label: 'Trực tuyến' }
            ]}
            value={selectedHinhThuc}
            onChange={(val) => {
              setSelectedHinhThuc(val);
              setCurrentPage(1);
            }}
            placeholder="Tất cả hình thức"
            searchPlaceholder="Tìm hình thức..."
            className="min-w-[180px]"
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT LAYOUT (Left Content + Right Sidebar) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* CỘT TRÁI (3 Cột): Danh Sách HOẶC Lưới Lịch Lớn */}
        <div className="xl:col-span-3 space-y-4 order-2 xl:order-1">
          {viewMode === 'list' ? (
            /* --- BẢNG DANH SÁCH (List View) --- */
            <div className="bg-white rounded-2xl shadow-xs border border-[#E7E0C4] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E7E0C4] bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4 pl-6">Địa điểm / Nhà máy</th>
                      <th className="p-4">Hình thức</th>
                      <th className="p-4">Thời gian</th>
                      <th className="p-4 text-center">Sinh viên</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4 text-right pr-6">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E0C4]/60">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-400">Đang tải dữ liệu...</td>
                      </tr>
                    ) : paginatedTrips.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-400">Không tìm thấy chuyến tham quan nào</td>
                      </tr>
                    ) : (
                      paginatedTrips.map((t) => {
                        const status = getStatus(t);
                        const isOnline = t.hinh_thuc === 'TrucTuyen';
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 pl-6 font-bold text-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="line-clamp-1">{t.nhaMay?.ten_nha_may || 'Chưa cập nhật'}</span>
                              </div>
                              <div className="text-[11px] font-normal text-slate-500 line-clamp-1 mt-0.5">
                                {t.nhaMay?.dia_chi || '--'}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isOnline 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                {isOnline ? 'Trực tuyến' : 'Trực tiếp'}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-600 font-medium">
                              <div>{t.ngay_tham_quan ? new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}</div>
                              <div className="text-slate-400 mt-0.5">{t.gio_bat_dau ? String(t.gio_bat_dau).substring(0, 5) : '--'}</div>
                            </td>
                            <td className="p-4 text-center font-semibold text-slate-700">
                              {t.so_luong_dang_ky ?? t.so_luong_sv ?? 0} SV
                            </td>
                            <td className="p-4 text-center">
                              {getStatusBadge(status)}
                            </td>
                            <td className="p-4 text-right pr-6">
                              <button 
                                onClick={() => setSelectedTripModal(t)}
                                className="text-xs font-bold text-[#407F3E] hover:text-[#407F3E]/80 hover:underline transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> Chi tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span>Hiển thị</span>
                  <SearchableDropdown 
                    options={[
                      { value: 15, label: '15' },
                      { value: 30, label: '30' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' }
                    ]}
                    value={limit}
                    onChange={(newLimit) => {
                      setLimit(newLimit);
                      setCurrentPage(1);
                    }}
                    searchPlaceholder="Tìm số lượng..."
                    className="min-w-[80px]"
                    direction="up"
                  />
                  <span>/ {filteredTrips.length} chuyến</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(1)}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Trang đầu
                  </button>
                  <button 
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-2xs cursor-default mx-1">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button 
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Sau
                  </button>
                  <button 
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Trang cuối
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- KHUNG LỊCH LỚN (Google Calendar Style) --- */
            <div className="bg-white rounded-2xl shadow-xs border border-[#E7E0C4] overflow-hidden flex flex-col">
              
              {/* Calendar Toolbar */}
              <div className="p-4 border-b border-[#E7E0C4] bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGoToToday}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E7E0C4] text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                  >
                    Hôm nay
                  </button>

                  <div className="flex items-center border border-[#E7E0C4] rounded-lg bg-white shadow-2xs overflow-hidden">
                    <button
                      onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer border-r border-[#E7E0C4]"
                      title="Tháng trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="Tháng sau"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-base font-black text-slate-800 ml-2">
                    Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
                  </span>
                </div>

                {/* Sub-view switcher: Tháng (Grid) vs Lịch biểu (Agenda) */}
                <div className="flex bg-[#E7E0C4]/40 p-1 rounded-lg border border-[#E7E0C4] text-xs">
                  <button
                    onClick={() => setCalendarSubView('grid')}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      calendarSubView === 'grid' ? 'bg-[#407F3E] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Tháng
                  </button>
                  <button
                    onClick={() => setCalendarSubView('agenda')}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      calendarSubView === 'agenda' ? 'bg-[#407F3E] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    Lịch biểu
                  </button>
                </div>
              </div>

              {/* VIEW 1: LƯỚI THÁNG 7 CỘT (Grid View) */}
              {calendarSubView === 'grid' && (
                <div className="flex flex-col">
                  {/* Thứ trong tuần */}
                  <div className="grid grid-cols-7 border-b border-[#E7E0C4] bg-[#E7E0C4]/25 text-center py-2.5">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                      <div key={d} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Lưới ô ngày */}
                  <div className="grid grid-cols-7 bg-[#E7E0C4]/30 gap-px">
                    {calendarGridData.map((cell, idx) => {
                      const isSelected = selectedDateKey === cell.dateKey;
                      const hasTrips = cell.trips.length > 0;
                      const visibleTrips = cell.trips.slice(0, 2);
                      const overflowCount = cell.trips.length - 2;

                      return (
                        <div
                          key={idx}
                          data-day-cell
                          onClick={() => {
                            setSelectedDate(cell.fullDate);
                            setOverflowPopover(null);
                          }}
                          className={`min-h-[115px] p-1.5 flex flex-col justify-between transition-colors relative cursor-pointer ${
                            cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/60'
                          } ${isSelected ? 'ring-2 ring-inset ring-[#407F3E] bg-[#E7E0C4]/15' : ''}`}
                        >
                          {/* Header ô ngày */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-slate-400">
                              {/* Có thể để badge nhỏ nếu cần */}
                            </span>
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                              cell.isToday 
                                ? 'bg-[#407F3E] text-white shadow-xs' 
                                : cell.isCurrentMonth 
                                  ? 'text-slate-700' 
                                  : 'text-slate-300'
                            }`}>
                              {cell.dayNum}
                            </span>
                          </div>

                          {/* Danh sách Event Pills */}
                          <div className="space-y-1 flex-1 overflow-hidden">
                            {visibleTrips.map(trip => {
                              const status = getStatus(trip);
                              const isOnline = trip.hinh_thuc === 'TrucTuyen';

                              let colorStyle = 'border-l-[#DBD468] bg-[#DBD468]/20 text-slate-800 hover:bg-[#DBD468]/30'; // Sắp diễn ra
                              if (status === 'Đang diễn ra') {
                                colorStyle = 'border-l-[#89B449] bg-[#89B449]/20 text-[#407F3E] hover:bg-[#89B449]/30';
                              } else if (status === 'Đã hoàn thành') {
                                colorStyle = 'border-l-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200';
                              }

                              return (
                                <div
                                  key={trip.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTripModal(trip);
                                  }}
                                  className={`border-l-4 rounded-md py-1 px-1.5 text-[11px] font-bold truncate flex items-center gap-1 shadow-2xs transition-transform hover:scale-[1.01] cursor-pointer ${colorStyle}`}
                                  title={`${trip.gio_bat_dau?.substring(0, 5) || ''} - ${trip.nhaMay?.ten_nha_may || 'Chuyến đi'}`}
                                >
                                  {isOnline ? (
                                    <Laptop className="w-3 h-3 shrink-0 text-blue-600" />
                                  ) : (
                                    <MapPin className="w-3 h-3 shrink-0 text-emerald-600" />
                                  )}
                                  <span className="font-mono text-[10px] shrink-0">
                                    {trip.gio_bat_dau ? String(trip.gio_bat_dau).substring(0, 5) : ''}
                                  </span>
                                  <span className="truncate">
                                    {trip.nhaMay?.ten_nha_may || 'Chuyến tham quan'}
                                  </span>
                                </div>
                              );
                            })}

                            {/* Nút tràn +X chuyến khác */}
                            {overflowCount > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDate(cell.fullDate);
                                  
                                  const cellEl = e.currentTarget.closest('[data-day-cell]') || e.currentTarget;
                                  const rect = cellEl.getBoundingClientRect();
                                  
                                  const popoverWidth = 280;
                                  const popoverMaxHeight = 280;
                                  
                                  // Căn chỉnh ngang chống tràn phải/trái
                                  let left = rect.left - 4;
                                  if (left + popoverWidth > window.innerWidth - 16) {
                                    left = window.innerWidth - popoverWidth - 16;
                                  }
                                  if (left < 16) left = 16;
                                  
                                  // Căn chỉnh dọc chống tràn đáy màn hình: neo ngay trên đỉnh ô ngày
                                  let top = rect.top - 6;
                                  if (top + popoverMaxHeight > window.innerHeight - 16) {
                                    top = Math.max(16, window.innerHeight - popoverMaxHeight - 16);
                                  }
                                  
                                  setOverflowPopover({
                                    dateStr: cell.dateKey,
                                    trips: cell.trips,
                                    dateDisplay: cell.fullDate.toLocaleDateString('vi-VN'),
                                    top,
                                    left
                                  });
                                }}
                                className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-extrabold text-[#407F3E] hover:bg-[#407F3E]/10 transition-colors cursor-pointer"
                              >
                                +{overflowCount} chuyến khác...
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 2: LỊCH BIỂU (Agenda Timeline View) */}
              {calendarSubView === 'agenda' && (
                <div className="p-6 divide-y divide-[#E7E0C4]/60 max-h-[700px] overflow-y-auto">
                  {currentMonthAgendaTrips.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-600 text-sm">Không có chuyến dẫn đoàn nào trong tháng này</p>
                      <p className="text-xs text-slate-400 mt-1">Hãy thử kiểm tra bộ lọc hoặc chuyển sang tháng khác</p>
                    </div>
                  ) : (
                    currentMonthAgendaTrips.map(trip => {
                      const tripDate = new Date(trip.ngay_tham_quan || trip.ngay_khoi_hanh || Date.now());
                      const status = getStatus(trip);
                      const isOnline = trip.hinh_thuc === 'TrucTuyen';

                      return (
                        <div key={trip.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {/* Khối Ngày to */}
                            <div className="w-14 h-14 rounded-2xl bg-[#E7E0C4]/40 border border-[#E7E0C4] flex flex-col items-center justify-center text-center shrink-0">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                T.{tripDate.getMonth() + 1}
                              </span>
                              <span className="text-xl font-black text-[#407F3E] leading-none">
                                {tripDate.getDate()}
                              </span>
                            </div>

                            {/* Thông tin chuyến đi */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {getStatusBadge(status)}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isOnline ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                  {isOnline ? 'Trực tuyến' : 'Trực tiếp'}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-slate-800">
                                {trip.nhaMay?.ten_nha_may || 'Chưa cập nhật'}
                              </h3>
                              <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {trip.gio_bat_dau ? String(trip.gio_bat_dau).substring(0, 5) : '--'}
                                <span>•</span>
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span className="line-clamp-1">{trip.nhaMay?.dia_chi || 'Tại trường / DN'}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedTripModal(trip)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#407F3E] hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Xem chi tiết
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CỘT PHẢI (1 Cột): Mini Calendar + Bộ Lọc Hiển Thị + Danh Sách Chuyến Trong Ngày */}
        <div className="xl:col-span-1 space-y-5 order-1 xl:order-2">
          
          {/* Card Khung Cột Phải */}
          <div className="bg-[#E7E0C4] rounded-2xl p-5 shadow-sm border border-white/60 relative overflow-hidden space-y-5">
            <div>
              <h2 className="text-base font-black text-[#407F3E] mb-1">Lịch tháng này</h2>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#DBD468] shadow-2xs"></div>
                Có chuyến dẫn đoàn
              </div>
              {renderMiniCalendar()}
            </div>

            {/* Bộ lọc hiển thị (Calendar Filters) */}
            <div className="pt-4 border-t border-white/60 space-y-3">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Bộ lọc lịch hiển thị
              </span>
              
              {/* Trạng thái */}
              <div className="space-y-1.5 text-xs text-slate-700 font-semibold">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={calendarFilters.dangDienRa}
                    onChange={(e) => setCalendarFilters(p => ({ ...p, dangDienRa: e.target.checked }))}
                    className="rounded text-[#89B449] focus:ring-[#89B449] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="w-2 h-2 rounded-full bg-[#89B449]"></span>
                  Đang diễn ra (Hôm nay)
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={calendarFilters.sapDienRa}
                    onChange={(e) => setCalendarFilters(p => ({ ...p, sapDienRa: e.target.checked }))}
                    className="rounded text-[#DBD468] focus:ring-[#DBD468] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="w-2 h-2 rounded-full bg-[#DBD468]"></span>
                  Sắp diễn ra
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={calendarFilters.daHoanThanh}
                    onChange={(e) => setCalendarFilters(p => ({ ...p, daHoanThanh: e.target.checked }))}
                    className="rounded text-slate-400 focus:ring-slate-400 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Đã hoàn thành
                </label>
              </div>

              {/* Hình thức */}
              <div className="pt-2 border-t border-white/40 flex items-center gap-3 text-xs text-slate-700 font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={calendarFilters.trucTiep}
                    onChange={(e) => setCalendarFilters(p => ({ ...p, trucTiep: e.target.checked }))}
                    className="rounded text-[#407F3E] focus:ring-[#407F3E] w-3.5 h-3.5 cursor-pointer"
                  />
                  Trực tiếp
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={calendarFilters.trucTuyen}
                    onChange={(e) => setCalendarFilters(p => ({ ...p, trucTuyen: e.target.checked }))}
                    className="rounded text-[#407F3E] focus:ring-[#407F3E] w-3.5 h-3.5 cursor-pointer"
                  />
                  Trực tuyến
                </label>
              </div>
            </div>

            {/* Danh sách chuyến trong ngày đang chọn */}
            <div className="pt-4 border-t border-white/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Lịch ngày {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : '--'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-600">
                  {selectedDayTrips.length} chuyến
                </span>
              </div>

              {selectedDayTrips.length === 0 ? (
                <div className="p-3 bg-white/60 rounded-xl text-center text-xs text-slate-500 font-medium">
                  Không có chuyến dẫn đoàn nào trong ngày này
                </div>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {selectedDayTrips.map(trip => {
                    const status = getStatus(trip);
                    return (
                      <div
                        key={trip.id}
                        onClick={() => setSelectedTripModal(trip)}
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-white/80 transition-all shadow-2xs cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-[11px] font-bold text-[#407F3E]">
                            {trip.gio_bat_dau ? String(trip.gio_bat_dau).substring(0, 5) : '--'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {trip.hinh_thuc === 'TrucTuyen' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 line-clamp-1">
                          {trip.nhaMay?.ten_nha_may || 'Chưa cập nhật'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. POPOVER XEM ĐẦY ĐỦ KHI BẤM "+X CHUYẾN KHÁC" */}
      {/* ========================================================= */}
      {overflowPopover && (
        <>
          {/* Backdrop trong suốt click-outside để đóng popover */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setOverflowPopover(null)} 
          />
          
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'fixed',
              top: `${overflowPopover.top}px`, 
              left: `${overflowPopover.left}px`,
              width: '280px'
            }}
            className="z-50 bg-white border border-[#E7E0C4] rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E7E0C4]">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#407F3E]" />
                <span className="text-xs font-black text-slate-800">
                  Ngày {overflowPopover.dateDisplay}
                </span>
              </div>
              <button
                onClick={() => setOverflowPopover(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
              {overflowPopover.trips.map(trip => {
                const status = getStatus(trip);
                let pillColor = 'border-l-4 border-l-[#DBD468] bg-[#DBD468]/20 text-slate-800';
                if (status === 'Đang diễn ra') pillColor = 'border-l-4 border-l-[#89B449] bg-[#89B449]/20 text-[#407F3E]';
                else if (status === 'Đã hoàn thành') pillColor = 'border-l-4 border-l-slate-300 bg-slate-100 text-slate-600';

                return (
                  <div
                    key={trip.id}
                    onClick={() => {
                      setSelectedTripModal(trip);
                      setOverflowPopover(null);
                    }}
                    className={`p-2 rounded-lg text-xs font-bold truncate flex items-center justify-between transition-colors hover:brightness-95 cursor-pointer ${pillColor}`}
                  >
                    <span className="truncate pr-2">
                      {trip.gio_bat_dau?.substring(0, 5)} - {trip.nhaMay?.ten_nha_may}
                    </span>
                    <Eye className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL CHI TIẾT CHUYẾN ĐI (Event Preview Modal) */}
      {/* ========================================================= */}
      {selectedTripModal && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedTripModal(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-[#E7E0C4] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#407F3E]/15 border border-[#407F3E]/30 flex items-center justify-center text-[#407F3E] shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 leading-tight">
                    {selectedTripModal.nhaMay?.ten_nha_may || 'Chi tiết chuyến tham quan'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(getStatus(selectedTripModal))}
                    <span className="text-[11px] font-semibold text-slate-500">
                      {selectedTripModal.cach_to_chuc === 'TuDo' ? 'Chuyến tự do' : 'Khoa tổ chức'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTripModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              {/* Thời gian & Hình thức */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#E7E0C4]/15 border border-[#E7E0C4]/60">
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold uppercase mb-0.5">
                    Thời gian
                  </span>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedTripModal.ngay_tham_quan ? new Date(selectedTripModal.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}
                  </div>
                  <div className="text-slate-500 font-mono mt-0.5">
                    {selectedTripModal.gio_bat_dau ? String(selectedTripModal.gio_bat_dau).substring(0, 5) : '--'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] font-bold uppercase mb-0.5">
                    Hình thức tổ chức
                  </span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedTripModal.hinh_thuc === 'TrucTuyen'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {selectedTripModal.hinh_thuc === 'TrucTuyen' ? <Laptop className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                      {selectedTripModal.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến (Online)' : 'Trực tiếp (Offline)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Địa điểm & Bản đồ Google Maps */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[11px] block">Địa chỉ nhà máy:</span>
                      <span className="font-medium text-slate-800">
                        {selectedTripModal.nhaMay?.dia_chi || 'Chưa cập nhật địa chỉ'}
                      </span>
                    </div>
                  </div>

                  {selectedTripModal.nhaMay?.dia_chi && (
                    <button
                      onClick={() => handleOpenGoogleMaps(selectedTripModal.nhaMay?.dia_chi)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      title="Mở trên Google Maps"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Google Maps
                    </button>
                  )}
                </div>

                {selectedTripModal.dia_diem_tap_trung && (
                  <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[11px] block">Địa điểm tập trung:</span>
                      <span className="font-medium text-slate-700">
                        {selectedTripModal.dia_diem_tap_trung}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Doanh nghiệp & Liên hệ */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[11px] block mb-0.5">Người liên hệ DN:</span>
                  <span className="font-bold text-slate-800">
                    {selectedTripModal.nhaMay?.nguoi_lien_he || selectedTripModal.nguoi_lien_he_de_xuat || '--'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block mb-0.5">Số điện thoại:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 font-mono">
                      {selectedTripModal.nhaMay?.sdt_lien_he || selectedTripModal.sdt_lien_he_de_xuat || '--'}
                    </span>
                    {(selectedTripModal.nhaMay?.sdt_lien_he || selectedTripModal.sdt_lien_he_de_xuat) && (
                      <button
                        onClick={() => handleCopyPhone(selectedTripModal.nhaMay?.sdt_lien_he || selectedTripModal.sdt_lien_he_de_xuat)}
                        className="text-slate-400 hover:text-[#407F3E] transition-colors p-0.5 cursor-pointer"
                        title="Sao chép SĐT"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {copiedPhone && <span className="text-[10px] text-emerald-600 font-bold">Đã sao chép</span>}
                  </div>
                </div>
              </div>

              {/* Thông tin số lượng sinh viên */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Sinh viên tham gia:</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedTripModal.so_luong_dang_ky ?? selectedTripModal.so_luong_sv ?? 0}
                  {selectedTripModal.suc_chua ? ` / ${selectedTripModal.suc_chua} SV` : ' SV'}
                </span>
              </div>
            </div>

            {/* Modal Footer (Cụm nút nghiệp vụ Giảng viên) */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedTripModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  const tripId = selectedTripModal.id;
                  setSelectedTripModal(null);
                  navigate('/giang-vien/preparation', { state: { selectedTripId: tripId } });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-[#DBD468]/30 hover:bg-[#DBD468]/60 border border-[#DBD468] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                Chấm điểm chuẩn bị & Cộng
              </button>

              <button
                onClick={() => {
                  const tripId = selectedTripModal.id;
                  setSelectedTripModal(null);
                  navigate('/giang-vien/attendance', { state: { selectedTripId: tripId } });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#407F3E] hover:bg-[#407F3E]/90 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Users className="w-3.5 h-3.5" />
                Điểm danh sinh viên
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
