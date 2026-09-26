import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, MapPin, Laptop, ChevronLeft, ChevronRight, Eye,
  Search, ChevronDown, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { giangVienApi } from '../../services/api';

export default function LichDanDoan_GV() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lecturer, setLecturer] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [searchStatusDropdown, setSearchStatusDropdown] = useState('');

  const [selectedHinhThuc, setSelectedHinhThuc] = useState('ALL');
  const [isHinhThucDropdownOpen, setIsHinhThucDropdownOpen] = useState(false);
  const [searchHinhThucDropdown, setSearchHinhThucDropdown] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const closeAllDropdowns = () => {
    setIsStatusDropdownOpen(false);
    setIsHinhThucDropdownOpen(false);
  };

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
        return <span className="inline-flex items-center px-2.5 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Đang diễn ra':
        return <span className="inline-flex items-center px-2.5 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Đã hoàn thành':
        return <span className="inline-flex items-center px-2.5 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
      default:
        return null;
    }
  };

  // Mini-calendar generation logic
  const renderMiniCalendar = () => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
    
    // Check which days have trips
    const tripDays = new Set();
    trips.forEach(trip => {
      const tripDate = new Date(trip.ngay_tham_quan || trip.ngay_khoi_hanh || Date.now());
      if (tripDate.getFullYear() === year && tripDate.getMonth() === month) {
        tripDays.add(tripDate.getDate());
      }
    });

    const dates = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({
        date: i,
        active: tripDays.has(i),
        today: isCurrentMonth && now.getDate() === i
      });
    }

    const paddingCells = 42 - (firstDayIndex + daysInMonth); // Max 6 weeks

    return (
      <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-white mt-4">
        <div className="flex items-center justify-between mb-4 text-slate-800">
          <button 
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold">Tháng {month + 1}, {year}</span>
          <button 
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {days.map(d => <div key={d} className="text-[10px] font-bold text-slate-500">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-medium">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-start-${i}`} className="flex items-center justify-center h-8"></div>
          ))}
          {dates.map((d, idx) => (
            <div key={idx} className="flex items-center justify-center relative h-8">
              <span className={`w-7 h-7 flex items-center justify-center rounded-full z-10 ${
                d.today ? 'bg-[#407F3E] text-white font-bold shadow-sm' : 'text-slate-700'
              }`}>
                {d.date}
              </span>
              {d.active && !d.today && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#DBD468]"></span>
              )}
            </div>
          ))}
          {Array.from({ length: paddingCells }).map((_, i) => (
            <div key={`empty-end-${i}`} className="flex items-center justify-center h-8"></div>
          ))}
        </div>
      </div>
    );
  };

  // Filter & Pagination logic
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

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300" onClick={closeAllDropdowns}>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Lịch dẫn đoàn</h1>
        
        {/* Toggle */}
        <div className="flex bg-[#E7E0C4]/50 p-1 rounded-lg border border-[#E7E0C4]">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-[#407F3E] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Danh sách
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'calendar' ? 'bg-[#407F3E] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Lịch
          </button>
        </div>
      </div>

      {/* Filter Bar (Only in list view) */}
      {viewMode === 'list' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">
          {/* Search Input */}
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
          <div className="relative min-w-[180px]" onClick={(e) => e.stopPropagation()}>
            <div 
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsHinhThucDropdownOpen(false);
              }}
              className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
            >
              <span className="truncate pr-2 font-medium text-slate-700">
                {selectedStatus === 'ALL' ? 'Tất cả trạng thái' : selectedStatus}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isStatusDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                  <input 
                    type="text" 
                    placeholder="Tìm trạng thái..." 
                    value={searchStatusDropdown}
                    onChange={(e) => setSearchStatusDropdown(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {[
                    { id: 'ALL', name: 'Tất cả trạng thái' },
                    { id: 'Sắp diễn ra', name: 'Sắp diễn ra' },
                    { id: 'Đang diễn ra', name: 'Đang diễn ra' },
                    { id: 'Đã hoàn thành', name: 'Đã hoàn thành' }
                  ]
                    .filter(opt => opt.name.toLowerCase().includes(searchStatusDropdown.toLowerCase()))
                    .map(opt => (
                      <div 
                        key={opt.id}
                        onClick={() => { setSelectedStatus(opt.id); setIsStatusDropdownOpen(false); setSearchStatusDropdown(''); setCurrentPage(1); }}
                        className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                          selectedStatus === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {selectedStatus === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                      </div>
                    ))}
                  {[
                    { id: 'ALL', name: 'Tất cả trạng thái' },
                    { id: 'Sắp diễn ra', name: 'Sắp diễn ra' },
                    { id: 'Đang diễn ra', name: 'Đang diễn ra' },
                    { id: 'Đã hoàn thành', name: 'Đã hoàn thành' }
                  ].filter(opt => opt.name.toLowerCase().includes(searchStatusDropdown.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hình thức Dropdown */}
          <div className="relative min-w-[180px]" onClick={(e) => e.stopPropagation()}>
            <div 
              onClick={() => {
                setIsHinhThucDropdownOpen(!isHinhThucDropdownOpen);
                setIsStatusDropdownOpen(false);
              }}
              className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isHinhThucDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
            >
              <span className="truncate pr-2 font-medium text-slate-700">
                {selectedHinhThuc === 'ALL' ? 'Tất cả hình thức' : selectedHinhThuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isHinhThucDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                  <input 
                    type="text" 
                    placeholder="Tìm hình thức..." 
                    value={searchHinhThucDropdown}
                    onChange={(e) => setSearchHinhThucDropdown(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {[
                    { id: 'ALL', name: 'Tất cả hình thức' },
                    { id: 'TrucTiep', name: 'Trực tiếp' },
                    { id: 'TrucTuyen', name: 'Trực tuyến' }
                  ]
                    .filter(opt => opt.name.toLowerCase().includes(searchHinhThucDropdown.toLowerCase()))
                    .map(opt => (
                      <div 
                        key={opt.id}
                        onClick={() => { setSelectedHinhThuc(opt.id); setIsHinhThucDropdownOpen(false); setSearchHinhThucDropdown(''); setCurrentPage(1); }}
                        className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                          selectedHinhThuc === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {selectedHinhThuc === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                      </div>
                    ))}
                  {[
                    { id: 'ALL', name: 'Tất cả hình thức' },
                    { id: 'TrucTiep', name: 'Trực tiếp' },
                    { id: 'TrucTuyen', name: 'Trực tuyến' }
                  ].filter(opt => opt.name.toLowerCase().includes(searchHinhThucDropdown.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main Content: Table View */}
        <div className="xl:col-span-3 order-2 xl:order-1">
          {viewMode === 'list' ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                      <th className="p-4 pl-6 min-w-[200px]">Nhà máy</th>
                      <th className="p-4 min-w-[120px]">Ngày tham quan</th>
                      <th className="p-4 min-w-[120px]">Giờ</th>
                      <th className="p-4 text-center min-w-[120px]">Hình thức</th>
                      <th className="p-4 text-center min-w-[120px]">Số lượng</th>
                      <th className="p-4 text-center min-w-[150px]">Trạng thái</th>
                      <th className="p-4 text-right pr-6 min-w-[100px]">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-500 font-medium">Đang tải dữ liệu...</td>
                      </tr>
                    ) : filteredTrips.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-500 font-medium italic">
                          Không tìm thấy chuyến tham quan nào.
                        </td>
                      </tr>
                    ) : (
                      paginatedTrips.map(trip => {
                        const isOnline = trip.hinh_thuc === 'TrucTuyen';
                        const hinhThucText = isOnline ? 'Trực tuyến' : 'Trực tiếp';
                        const dateText = new Date(trip.ngay_tham_quan || trip.ngay_khoi_hanh || Date.now()).toLocaleDateString('vi-VN');
                        const statusText = getStatus(trip);

                        return (
                          <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-slate-800">{trip.nhaMay?.ten_nha_may || 'Chuyến tham quan'}</td>
                            <td className="p-4 font-medium text-slate-600">{dateText}</td>
                            <td className="p-4 font-medium text-slate-600">{trip.gio_bat_dau ? trip.gio_bat_dau.slice(0, 5) : '--:--'}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                isOnline ? 'bg-slate-100 text-slate-600' : 'bg-[#89B449]/10 text-[#407F3E]'
                              }`}>
                                {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                {hinhThucText}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-bold text-slate-600">
                                {trip.so_luong_dang_ky_hien_tai || 0}/{trip.so_luong_sinh_vien_toi_da || 0}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {getStatusBadge(statusText)}
                            </td>
                            <td className="p-4 text-right pr-6">
                              <button 
                                onClick={() => navigate('/giang-vien')}
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
                  <select 
                    value={limit}
                    onChange={(e) => {
                      const newLimit = Number(e.target.value);
                      setLimit(newLimit);
                      setCurrentPage(1);
                    }}
                    className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
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
                  <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
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
            <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] p-12 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[400px]">
              <CalendarIcon className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-bold text-slate-700">Chế độ xem lịch lớn (Đang phát triển)</p>
              <p className="text-sm font-medium text-slate-500 mt-2">Tính năng này sẽ cho phép kéo thả sự kiện.</p>
            </div>
          )}
        </div>

        {/* Right Side: Mini Calendar */}
        <div className="xl:col-span-1 order-1 xl:order-2">
          <div className="bg-[#E7E0C4] rounded-2xl p-6 shadow-md border-2 border-white/50 relative overflow-hidden h-fit">
            <h2 className="text-lg font-black text-[#407F3E] mb-2">Lịch tháng này</h2>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#DBD468]"></div> Có chuyến dẫn đoàn
            </p>
            
            {renderMiniCalendar()}

          </div>
        </div>

      </div>
    </div>
  );
}
