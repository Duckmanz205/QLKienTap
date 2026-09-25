import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronDown, Check, ChevronRight, Paperclip, 
  CheckCircle2, XCircle, Filter, Download, ArrowLeft, X,
  MapPin, Calendar, Clock, Search, Eye
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import * as XLSX from 'xlsx';

export default function RegistrationManagement_Khoa() {
  const [masterTab, setMasterTab] = useState('trips'); // 'trips' | 'huy'
  const [selectedTripForReg, setSelectedTripForReg] = useState(null);
  
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  const [activeTab, setActiveTab] = useState('danhsach'); // 'danhsach' | 'chot' | 'dachot'
  
  const [registrations, setRegistrations] = useState([]);
  const [globalCancelRequests, setGlobalCancelRequests] = useState([]);
  const [finalizedStudents, setFinalizedStudents] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  
  // Search & Filter for Master Tab 1 (trips)
  const [searchNhaMay, setSearchNhaMay] = useState('');
  const [filterDot, setFilterDot] = useState('ALL');
  const [filterLich, setFilterLich] = useState('ALL');
  const [isDotDropdownOpen, setIsDotDropdownOpen] = useState(false);
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [searchDotDropdown, setSearchDotDropdown] = useState('');
  const [searchLichDropdown, setSearchLichDropdown] = useState('');
  const [currentPageTrips, setCurrentPageTrips] = useState(1);
  const [limitTrips, setLimitTrips] = useState(15);

  // Search & Filter for Master Tab 2 (huy)
  const [searchHuy, setSearchHuy] = useState('');
  const [currentPageHuy, setCurrentPageHuy] = useState(1);
  const [limitHuy, setLimitHuy] = useState(15);

  // Search & Filter for Detail Modal Tab 1 (danhsach)
  const [searchRegStudent, setSearchRegStudent] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchStatusDropdown, setSearchStatusDropdown] = useState('');
  const statusOptions = ["Tất cả", "Chờ duyệt", "Hợp lệ", "Bị loại", "Đã hủy"];
  const [currentPageRegs, setCurrentPageRegs] = useState(1);
  const [limitRegs, setLimitRegs] = useState(15);

  // Search & Filter for Detail Modal Tab 3 (dachot)
  const [searchFinalizedStudent, setSearchFinalizedStudent] = useState('');
  const [currentPageFinalized, setCurrentPageFinalized] = useState(1);
  const [limitFinalized, setLimitFinalized] = useState(15);

  const [viewingDetail, setViewingDetail] = useState(null);

  // Toast Popup State
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 3000);
  };

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const showConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };
  const closeConfirm = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchTrips();
    fetchGlobalCancelRequests();
  }, []);

  useEffect(() => {
    if (selectedTripForReg) {
      if (activeTab === 'danhsach' || activeTab === 'chot') {
        fetchRegistrations(selectedTripForReg.id);
      } else if (activeTab === 'dachot') {
        fetchFinalizedStudents(selectedTripForReg.id);
      }
    }
  }, [selectedTripForReg, activeTab]);

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await khoaApi.getTrips();
      const allTrips = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      // Filter only trips that have opened registration or further
      const openTrips = allTrips.filter(t => ['MoDangKy', 'DaChotDanhSach', 'DaDienRa', 'DaHuy'].includes(t.trang_thai));
      setTrips(openTrips);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const fetchGlobalCancelRequests = async () => {
    setLoadingRegs(true);
    try {
      // Fetch all cancel requests
      const res = await khoaApi.getRegistrations({ hasCancelRequest: true, limit: 1000 });
      const data = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      const filtered = data.filter(r => r.yeuCauHuy && r.yeuCauHuy.trang_thai === 'ChoDuyet');
      setGlobalCancelRequests(filtered);
    } catch (err) {
      console.error(err);
      setGlobalCancelRequests([]);
    } finally {
      setLoadingRegs(false);
    }
  };

  const fetchRegistrations = async (tripId) => {
    setLoadingRegs(true);
    try {
      const res = await khoaApi.getRegistrations({ chuyenThamQuanId: tripId, limit: 1000 });
      const data = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setRegistrations(data);
    } catch (err) {
      console.error(err);
      setRegistrations([]);
    } finally {
      setLoadingRegs(false);
    }
  };

  const fetchFinalizedStudents = async (tripId) => {
    setLoadingRegs(true);
    try {
      const res = await khoaApi.getRegistrations({ chuyenThamQuanId: tripId, status: 'HopLe', limit: 1000 });
      const arr = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setFinalizedStudents(arr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleConfirmAssignStudents = async () => {
    if (!selectedTripForReg) return;
    
    showConfirm("Chốt danh sách", "Bạn có chắc chắn muốn chốt danh sách đăng ký này?", async () => {
      try {
        const acceptedStudentIds = registrations.map(r => r.sinhVien?.id || r.sinh_vien_id).filter(Boolean);
        await khoaApi.confirmAssignStudents({ 
          tripId: selectedTripForReg.id, 
          acceptedStudentIds
        });
        showPopup('Chốt danh sách thành công', 'success');
        fetchTrips();
        setSelectedTripForReg({ ...selectedTripForReg, trang_thai: 'DaChotDanhSach' });
        setActiveTab('dachot');
      } catch (err) {
        console.error(err);
        showPopup(err.response?.data?.message || 'Lỗi khi chốt danh sách', 'error');
      }
    });
  };

  const handleApproveCancel = async (cancelId, isApproved) => {
    showConfirm(
      isApproved ? "Duyệt yêu cầu hủy" : "Từ chối yêu cầu hủy",
      isApproved ? "Bạn có chắc chắn muốn duyệt yêu cầu hủy đăng ký này?" : "Bạn có chắc chắn muốn từ chối yêu cầu hủy đăng ký này?",
      async () => {
        try {
          await khoaApi.approveCancel({ cancelId, isApproved });
          showPopup(isApproved ? 'Đã duyệt yêu cầu hủy' : 'Đã từ chối yêu cầu hủy', 'success');
          fetchGlobalCancelRequests();
          // If we are looking at a trip, we might want to refresh registrations
          if (selectedTripForReg) {
            fetchRegistrations(selectedTripForReg.id);
          }
        } catch (err) {
          console.error(err);
          showPopup('Lỗi khi duyệt', 'error');
        }
      }
    );
  };

  const handleExportExcel = () => {
    if (finalizedStudents.length === 0) return;
    const data = finalizedStudents.map((reg, index) => ({
      'STT': index + 1,
      'MSSV': reg.sinhVien?.mssv || '',
      'Họ tên': reg.sinhVien?.ho_ten || '',
      'Khóa': reg.sinhVien?.khoaHoc?.ten_khoa_hoc || '',
      'Lớp': reg.sinhVien?.ten_lop || '',
      'Thời gian ĐK': reg.ngay_dang_ky ? new Date(reg.ngay_dang_ky).toLocaleString('vi-VN') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachChot");
    XLSX.writeFile(workbook, `DanhSachSinhVienChot_${selectedTripForReg?.id || 'Trip'}.xlsx`);
  };

  const closeAllDropdowns = () => {
    setIsStatusDropdownOpen(false);
    setIsDotDropdownOpen(false);
    setIsLichDropdownOpen(false);
    setSearchDotDropdown('');
    setSearchLichDropdown('');
    setSearchStatusDropdown('');
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(true);
  };

  // Status mapping
  const getStatusBadge = (statusStr) => {
    switch(statusStr) {
      case 'Chờ duyệt': return <span className="bg-[#DBD468] text-slate-800 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></span>Chờ duyệt</span>;
      case 'Hợp lệ': return <span className="bg-[#407F3E] text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Hợp lệ</span>;
      case 'Bị loại': return <span className="bg-[#E68A8C] text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />Bị loại</span>;
      case 'Đã hủy': return <span className="bg-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1">Đã hủy</span>;
      default: return <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">{statusStr || 'Không rõ'}</span>;
    }
  };

  const statusMap = {
    'PENDING': 'Chờ duyệt',
    'ChoDuyet': 'Chờ duyệt',
    'APPROVED': 'Hợp lệ',
    'HopLe': 'Hợp lệ',
    'REJECTED': 'Bị loại',
    'BiLoai': 'Bị loại',
    'CANCELLED': 'Đã hủy',
    'DaHuy': 'Đã hủy',
    'CANCELLED_WAITING_REFUND': 'Đã hủy',
    'REFUNDED': 'Đã hủy'
  };

  // 1. Trips filtering & pagination
  const uniqueDots = Array.from(new Set(trips.map(t => t.lichKienTap?.dotKienTap?.ten_dot).filter(Boolean)));
  const uniqueLichs = Array.from(new Set(trips.map(t => t.lichKienTap?.ten_lich).filter(Boolean)));

  const filteredTrips = trips.filter(t => {
    const nameMatch = (t.nhaMay?.ten_nha_may || '').toLowerCase().includes(searchNhaMay.toLowerCase());
    const dotMatch = filterDot === 'ALL' || t.lichKienTap?.dotKienTap?.ten_dot === filterDot;
    const lichMatch = filterLich === 'ALL' || t.lichKienTap?.ten_lich === filterLich;
    return nameMatch && dotMatch && lichMatch;
  });
  const totalTrips = filteredTrips.length;
  const totalPagesTrips = Math.ceil(totalTrips / limitTrips) || 1;
  const validCurrentPageTrips = Math.min(Math.max(1, currentPageTrips), totalPagesTrips);
  const paginatedTrips = filteredTrips.slice((validCurrentPageTrips - 1) * limitTrips, validCurrentPageTrips * limitTrips);

  // 2. Cancel requests filtering & pagination
  const filteredHuy = globalCancelRequests.filter(r => {
    const s = searchHuy.toLowerCase();
    const mssvMatch = (r.sinhVien?.mssv || '').toLowerCase().includes(s);
    const tenMatch = (r.sinhVien?.ho_ten || '').toLowerCase().includes(s);
    const nhaMayMatch = (r.chuyenKienTap?.nhaMay?.ten_nha_may || '').toLowerCase().includes(s);
    return mssvMatch || tenMatch || nhaMayMatch;
  });
  const totalHuy = filteredHuy.length;
  const totalPagesHuy = Math.ceil(totalHuy / limitHuy) || 1;
  const validCurrentPageHuy = Math.min(Math.max(1, currentPageHuy), totalPagesHuy);
  const paginatedHuy = filteredHuy.slice((validCurrentPageHuy - 1) * limitHuy, validCurrentPageHuy * limitHuy);

  // 3. Trip Registrations filtering & pagination
  const filteredRegistrations = registrations.filter(r => {
    const currentStatus = statusMap[r.trang_thai] || 'Chờ duyệt';
    if (selectedStatus && selectedStatus !== 'Tất cả' && currentStatus !== selectedStatus) return false;
    if (searchRegStudent) {
      const s = searchRegStudent.toLowerCase();
      const mssvMatch = (r.sinhVien?.mssv || '').toLowerCase().includes(s);
      const tenMatch = (r.sinhVien?.ho_ten || '').toLowerCase().includes(s);
      if (!mssvMatch && !tenMatch) return false;
    }
    return true;
  });
  const totalRegs = filteredRegistrations.length;
  const totalPagesRegs = Math.ceil(totalRegs / limitRegs) || 1;
  const validCurrentPageRegs = Math.min(Math.max(1, currentPageRegs), totalPagesRegs);
  const paginatedRegs = filteredRegistrations.slice((validCurrentPageRegs - 1) * limitRegs, validCurrentPageRegs * limitRegs);

  // 4. Finalized students filtering & pagination
  const filteredFinalized = finalizedStudents.filter(r => {
    if (!searchFinalizedStudent) return true;
    const s = searchFinalizedStudent.toLowerCase();
    const mssvMatch = (r.sinhVien?.mssv || '').toLowerCase().includes(s);
    const tenMatch = (r.sinhVien?.ho_ten || '').toLowerCase().includes(s);
    const lopMatch = (r.sinhVien?.ten_lop || '').toLowerCase().includes(s);
    return mssvMatch || tenMatch || lopMatch;
  });
  const totalFinalized = filteredFinalized.length;
  const totalPagesFinalized = Math.ceil(totalFinalized / limitFinalized) || 1;
  const validCurrentPageFinalized = Math.min(Math.max(1, currentPageFinalized), totalPagesFinalized);
  const paginatedFinalized = filteredFinalized.slice((validCurrentPageFinalized - 1) * limitFinalized, validCurrentPageFinalized * limitFinalized);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* ================= MASTER VIEW (LUÔN RENDER) ================= */}
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Quản lý đăng ký</h1>
          <p className="text-slate-500 text-sm mt-1">Chọn một chuyến tham quan để xem và quản lý danh sách đăng ký hoặc duyệt minh chứng hủy</p>
        </div>

        <div className="flex items-center gap-6 border-b border-[#E7E0C4] mb-6 overflow-x-auto whitespace-nowrap">
          <button 
            onClick={() => setMasterTab('trips')}
            className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
              masterTab === 'trips' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Danh sách đăng ký chuyến tham quan
            {masterTab === 'trips' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
            )}
          </button>
          <button 
            onClick={() => setMasterTab('huy')}
            className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              masterTab === 'huy' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Duyệt tổng minh chứng hủy
            <span className="bg-[#DBD468] text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
              {globalCancelRequests.length}
            </span>
            {masterTab === 'huy' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
            )}
          </button>
        </div>

        {masterTab === 'trips' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {/* Thanh công cụ tìm kiếm & lọc */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm nhà máy..." 
                    value={searchNhaMay}
                    onChange={(e) => {
                      setSearchNhaMay(e.target.value);
                      setCurrentPageTrips(1);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#407F3E] focus:border-[#407F3E] transition-shadow"
                  />
                </div>
                
                {/* Popover Filter Đợt */}
                <div className="relative min-w-[170px]" onClick={e => e.stopPropagation()}>
                  <div 
                    onClick={() => {
                      const next = !isDotDropdownOpen;
                      closeAllDropdowns();
                      setIsDotDropdownOpen(next);
                    }}
                    className={`w-full px-4 py-2 bg-white border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isDotDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`truncate pr-2 font-medium ${filterDot !== 'ALL' ? 'text-slate-800' : 'text-slate-600'}`}>
                      {filterDot === 'ALL' ? 'Tất cả đợt' : filterDot}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isDotDropdownOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
                  </div>
                  {isDotDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
                      <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                        <input 
                          type="text" 
                          placeholder="Tìm đợt..." 
                          value={searchDotDropdown}
                          onChange={(e) => setSearchDotDropdown(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <div 
                          onClick={() => {
                            setFilterDot('ALL');
                            setIsDotDropdownOpen(false);
                            setCurrentPageTrips(1);
                            setSearchDotDropdown('');
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            filterDot === 'ALL' ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <span className="truncate pr-2">Tất cả đợt</span>
                          {filterDot === 'ALL' && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                        </div>
                        {uniqueDots
                          .filter(dot => dot.toLowerCase().includes(searchDotDropdown.toLowerCase()))
                          .map(dot => (
                          <div 
                            key={dot}
                            onClick={() => {
                              setFilterDot(dot);
                              setIsDotDropdownOpen(false);
                              setCurrentPageTrips(1);
                              setSearchDotDropdown('');
                            }}
                            className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                              filterDot === dot ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                            }`}
                          >
                            <span className="truncate pr-2">{dot}</span>
                            {filterDot === dot && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                          </div>
                        ))}
                        {uniqueDots.filter(dot => dot.toLowerCase().includes(searchDotDropdown.toLowerCase())).length === 0 && searchDotDropdown && (
                          <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Popover Filter Lịch */}
                <div className="relative min-w-[190px]" onClick={e => e.stopPropagation()}>
                  <div 
                    onClick={() => {
                      const next = !isLichDropdownOpen;
                      closeAllDropdowns();
                      setIsLichDropdownOpen(next);
                    }}
                    className={`w-full px-4 py-2 bg-white border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`truncate pr-2 font-medium ${filterLich !== 'ALL' ? 'text-slate-800' : 'text-slate-600'}`}>
                      {filterLich === 'ALL' ? 'Tất cả lịch' : filterLich}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isLichDropdownOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
                  </div>
                  {isLichDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[220px]">
                      <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                        <input 
                          type="text" 
                          placeholder="Tìm lịch..." 
                          value={searchLichDropdown}
                          onChange={(e) => setSearchLichDropdown(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <div 
                          onClick={() => {
                            setFilterLich('ALL');
                            setIsLichDropdownOpen(false);
                            setCurrentPageTrips(1);
                            setSearchLichDropdown('');
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            filterLich === 'ALL' ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <span className="truncate pr-2">Tất cả lịch</span>
                          {filterLich === 'ALL' && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                        </div>
                        {uniqueLichs
                          .filter(lich => lich.toLowerCase().includes(searchLichDropdown.toLowerCase()))
                          .map(lich => (
                          <div 
                            key={lich}
                            onClick={() => {
                              setFilterLich(lich);
                              setIsLichDropdownOpen(false);
                              setCurrentPageTrips(1);
                              setSearchLichDropdown('');
                            }}
                            className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                              filterLich === lich ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                            }`}
                          >
                            <span className="truncate pr-2">{lich}</span>
                            {filterLich === lich && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                          </div>
                        ))}
                        {uniqueLichs.filter(lich => lich.toLowerCase().includes(searchLichDropdown.toLowerCase())).length === 0 && searchLichDropdown && (
                          <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                      <th className="p-4 pl-6">Đợt / Lịch</th>
                      <th className="p-4">Nhà máy</th>
                      <th className="p-4">Ngày / Giờ</th>
                      <th className="p-4 text-center">Sức chứa</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4 text-right pr-6">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                    {loadingTrips ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-500 text-xs italic">Đang tải dữ liệu...</td>
                      </tr>
                    ) : paginatedTrips.length > 0 ? (
                      paginatedTrips.map(trip => {
                        const used = trip.dang_ky_count || 0;
                        const max = trip.suc_chua || 0;
                        const percent = max > 0 ? (used / max) * 100 : 0;
                        
                        return (
                          <tr key={trip.id} onClick={() => { setSelectedTripForReg(trip); setActiveTab('chot'); }} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                            <td className="p-4 pl-6">
                              <div className="font-bold text-slate-800 mb-0.5">{trip.lichKienTap?.dotKienTap?.ten_dot || 'Chưa xếp đợt'}</div>
                              <div className="text-xs text-slate-500 font-medium">{trip.lichKienTap?.ten_lich || 'Chưa xếp lịch'}</div>
                            </td>
                            <td className="p-4 font-bold text-[#407F3E]">{trip.nhaMay?.ten_nha_may || 'Đang cập nhật'}</td>
                            <td className="p-4">
                              <div className="font-medium text-slate-800 mb-0.5">{trip.ngay_tham_quan ? new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}</div>
                              <div className="text-xs text-slate-500">{trip.gio_bat_dau ? trip.gio_bat_dau.substring(0, 5) : '--'}</div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 text-[11px] font-bold mb-1.5 text-slate-700 justify-center">
                                  <span className={used >= max && max > 0 ? 'text-[#E68A8C]' : 'text-[#407F3E]'}>{used}</span>
                                  <span className="text-slate-400">/</span>
                                  <span>{max}</span>
                                </div>
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto">
                                  <div 
                                    className={`h-full rounded-full transition-all ${percent >= 100 ? 'bg-[#E68A8C]' : 'bg-[#89B449]'}`} 
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {trip.trang_thai === 'MoDangKy' && <span className="bg-[#DBD468] text-slate-800 text-[11px] px-3 py-1.5 rounded-full font-bold shadow-sm">Mở đăng ký</span>}
                              {trip.trang_thai === 'DaChotDanhSach' && <span className="bg-[#407F3E] text-white text-[11px] px-3 py-1.5 rounded-full font-bold shadow-sm">Đã chốt danh sách</span>}
                              {trip.trang_thai === 'DaDienRa' && <span className="bg-[#5A87B6] text-white text-[11px] px-3 py-1.5 rounded-full font-bold shadow-sm">Đã diễn ra</span>}
                              {trip.trang_thai === 'DaHuy' && <span className="bg-[#E68A8C] text-white text-[11px] px-3 py-1.5 rounded-full font-bold shadow-sm border border-[#E68A8C]/20">Đã hủy</span>}
                            </td>
                            <td className="p-4 text-right pr-6">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedTripForReg(trip); setActiveTab('chot'); }}
                                className="px-3 py-1.5 bg-slate-100 text-slate-600 group-hover:bg-[#407F3E] group-hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> Quản lý
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">Không có chuyến tham quan nào phù hợp bộ lọc.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer Trips */}
              <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span>Hiển thị</span>
                  <select
                    value={limitTrips}
                    onChange={e => {
                      setLimitTrips(Number(e.target.value));
                      setCurrentPageTrips(1);
                    }}
                    className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>/ {totalTrips} chuyến</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPageTrips(1)}
                    disabled={validCurrentPageTrips <= 1}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Trang đầu
                  </button>
                  <button
                    onClick={() => setCurrentPageTrips(prev => Math.max(prev - 1, 1))}
                    disabled={validCurrentPageTrips <= 1}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                    Trang {validCurrentPageTrips} / {totalPagesTrips}
                  </span>
                  <button
                    onClick={() => setCurrentPageTrips(prev => Math.min(prev + 1, totalPagesTrips))}
                    disabled={validCurrentPageTrips >= totalPagesTrips}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Sau
                  </button>
                  <button
                    onClick={() => setCurrentPageTrips(totalPagesTrips)}
                    disabled={validCurrentPageTrips >= totalPagesTrips}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Trang cuối
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {masterTab === 'huy' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {/* Search Bar Tab 2 */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-72 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm MSSV, họ tên, chuyến đi..." 
                  value={searchHuy}
                  onChange={(e) => {
                    setSearchHuy(e.target.value);
                    setCurrentPageHuy(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#407F3E] focus:border-[#407F3E] transition-shadow"
                />
              </div>
            </div>

            {/* Bảng danh sách hủy */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                      <th className="p-4 pl-6">MSSV</th>
                      <th className="p-4">Họ tên</th>
                      <th className="p-4">Chuyến tham quan</th>
                      <th className="p-4 max-w-[200px]">Lý do hủy</th>
                      <th className="p-4 text-center">File minh chứng</th>
                      <th className="p-4">Ngày yêu cầu</th>
                      <th className="p-4 text-right pr-6">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                    {loadingRegs ? (
                      <tr><td colSpan="7" className="text-center py-8 text-slate-500 text-xs italic">Đang tải dữ liệu...</td></tr>
                    ) : paginatedHuy.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-8 text-slate-500 font-medium">Không có yêu cầu hủy nào phù hợp.</td></tr>
                    ) : (
                      paginatedHuy.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{r.sinhVien?.mssv}</td>
                          <td className="p-4 font-bold text-slate-800">{r.sinhVien?.ho_ten}</td>
                          <td className="p-4 font-medium text-slate-600">{r.chuyenKienTap?.nhaMay?.ten_nha_may || 'Đang cập nhật'}</td>
                          <td className="p-4 font-medium text-slate-500 max-w-[200px] truncate" title={r.yeuCauHuy?.ly_do}>{r.yeuCauHuy?.ly_do}</td>
                          <td className="p-4 text-center">
                            {r.yeuCauHuy?.minh_chung ? (
                              <a href={r.yeuCauHuy.minh_chung} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#407F3E] hover:underline bg-[#407F3E]/10 px-2 py-1 rounded cursor-pointer">
                                <Paperclip className="w-3.5 h-3.5" />
                                Xem
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">Không có</span>
                            )}
                          </td>
                          <td className="p-4 font-medium text-slate-500">{new Date(r.yeuCauHuy?.ngay_yeu_cau).toLocaleDateString('vi-VN')}</td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleApproveCancel(r.yeuCauHuy?.id, true)}
                                className="px-3 py-1.5 bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Duyệt
                              </button>
                              <button 
                                onClick={() => handleApproveCancel(r.yeuCauHuy?.id, false)}
                                className="px-3 py-1.5 border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                Từ chối
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer Tab Huy */}
              <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span>Hiển thị</span>
                  <select
                    value={limitHuy}
                    onChange={e => {
                      setLimitHuy(Number(e.target.value));
                      setCurrentPageHuy(1);
                    }}
                    className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>/ {totalHuy} yêu cầu</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPageHuy(1)}
                    disabled={validCurrentPageHuy <= 1}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Trang đầu
                  </button>
                  <button
                    onClick={() => setCurrentPageHuy(prev => Math.max(prev - 1, 1))}
                    disabled={validCurrentPageHuy <= 1}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                    Trang {validCurrentPageHuy} / {totalPagesHuy}
                  </span>
                  <button
                    onClick={() => setCurrentPageHuy(prev => Math.min(prev + 1, totalPagesHuy))}
                    disabled={validCurrentPageHuy >= totalPagesHuy}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Sau
                  </button>
                  <button
                    onClick={() => setCurrentPageHuy(totalPagesHuy)}
                    disabled={validCurrentPageHuy >= totalPagesHuy}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Trang cuối
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>

      {/* ================= DETAIL VIEW POPUP (MODAL) ================= */}
      {selectedTripForReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setSelectedTripForReg(null); }}
          ></div>

          <div 
            className="bg-[#f8f9fa] w-full max-w-6xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Title */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm z-20 shrink-0">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#89B449]" />
                Quản lý đăng ký: {selectedTripForReg.nhaMay?.ten_nha_may || 'Đang cập nhật'}
              </h2>
              <button 
                onClick={() => setSelectedTripForReg(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              
              {/* Info Body */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngày khởi hành</label>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                        {selectedTripForReg.ngay_tham_quan ? new Date(selectedTripForReg.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thời gian</label>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                        {selectedTripForReg.gio_bat_dau ? selectedTripForReg.gio_bat_dau.substring(0, 5) : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hình thức</label>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                        {selectedTripForReg.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trạng thái</label>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                        {selectedTripForReg.trang_thai === 'MoDangKy' ? 'Mở đăng ký' : 
                          selectedTripForReg.trang_thai === 'DaChotDanhSach' ? 'Đã chốt danh sách' : 
                          selectedTripForReg.trang_thai === 'DaDienRa' ? 'Đã diễn ra' : 
                          selectedTripForReg.trang_thai === 'DaHuy' ? 'Đã huỷ' : 'Nháp'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto whitespace-nowrap">
                <button 
                  onClick={() => setActiveTab('danhsach')}
                  className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                    activeTab === 'danhsach' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Danh sách đăng ký
                  {activeTab === 'danhsach' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('chot')}
                  className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                    activeTab === 'chot' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Lọc & chốt danh sách
                  {activeTab === 'chot' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
                  )}
                </button>
                {selectedTripForReg.trang_thai === 'DaChotDanhSach' && (
                  <button 
                    onClick={() => setActiveTab('dachot')}
                    className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                      activeTab === 'dachot' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Danh sách sinh viên đã chốt
                    {activeTab === 'dachot' && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
                    )}
                  </button>
                )}
              </div>

              {/* Filter Toolbar (Only for danh sach) */}
              {activeTab === 'danhsach' && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 relative z-20">
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative flex-1 sm:w-64 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm MSSV, họ tên..." 
                        value={searchRegStudent}
                        onChange={(e) => {
                          setSearchRegStudent(e.target.value);
                          setCurrentPageRegs(1);
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#407F3E] focus:border-[#407F3E] transition-shadow"
                      />
                    </div>

                    <div className="relative min-w-[200px]" onClick={e => e.stopPropagation()}>
                      <div 
                        onClick={() => {
                          const next = !isStatusDropdownOpen;
                          closeAllDropdowns();
                          setIsStatusDropdownOpen(next);
                        }}
                        className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-slate-200'}`}
                      >
                        <span className={`truncate pr-2 font-medium ${selectedStatus && selectedStatus !== 'Tất cả' ? 'text-slate-800' : 'text-slate-600'}`}>
                          {selectedStatus || 'Tất cả trạng thái'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isStatusDropdownOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
                      </div>
                      {isStatusDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
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
                            {statusOptions
                              .filter(opt => opt.toLowerCase().includes(searchStatusDropdown.toLowerCase()))
                              .map(opt => (
                              <div 
                                key={opt}
                                onClick={() => {
                                  setSelectedStatus(opt === 'Tất cả' ? '' : opt);
                                  setIsStatusDropdownOpen(false);
                                  setCurrentPageRegs(1);
                                  setSearchStatusDropdown('');
                                }}
                                className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                                  (selectedStatus === opt || (!selectedStatus && opt === 'Tất cả')) ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                                }`}
                              >
                                <span className="truncate pr-2">{opt}</span>
                                {(selectedStatus === opt || (!selectedStatus && opt === 'Tất cả')) && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                              </div>
                            ))}
                            {statusOptions.filter(opt => opt.toLowerCase().includes(searchStatusDropdown.toLowerCase())).length === 0 && searchStatusDropdown && (
                              <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 1: Danh sách đăng ký */}
              {activeTab === 'danhsach' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative z-10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="p-4 pl-6">MSSV</th>
                          <th className="p-4">Họ tên</th>
                          <th className="p-4">Ngày đăng ký</th>
                          <th className="p-4 text-center">Trạng thái</th>
                          <th className="p-4 text-right pr-6">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                        {loadingRegs ? (
                          <tr><td colSpan="5" className="text-center py-8 text-slate-500 text-xs italic">Đang tải dữ liệu...</td></tr>
                        ) : paginatedRegs.length === 0 ? (
                          <tr><td colSpan="5" className="text-center py-8 text-slate-500 font-medium">Không tìm thấy đăng ký nào phù hợp.</td></tr>
                        ) : (
                          paginatedRegs.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{r.sinhVien?.mssv}</td>
                              <td className="p-4 font-bold text-slate-800">{r.sinhVien?.ho_ten}</td>
                              <td className="p-4 font-medium text-slate-500">{new Date(r.ngay_dang_ky).toLocaleDateString('vi-VN')}</td>
                              <td className="p-4 text-center">
                                {getStatusBadge(statusMap[r.trang_thai])}
                              </td>
                              <td className="p-4 text-right pr-6">
                                <button 
                                  className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                                  title="Chi tiết"
                                  onClick={() => setViewingDetail(r)}
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer Tab Regs */}
                  <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <span>Hiển thị</span>
                      <select
                        value={limitRegs}
                        onChange={e => {
                          setLimitRegs(Number(e.target.value));
                          setCurrentPageRegs(1);
                        }}
                        className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
                      >
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>/ {totalRegs} sinh viên</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPageRegs(1)}
                        disabled={validCurrentPageRegs <= 1}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Trang đầu
                      </button>
                      <button
                        onClick={() => setCurrentPageRegs(prev => Math.max(prev - 1, 1))}
                        disabled={validCurrentPageRegs <= 1}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Trước
                      </button>
                      <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                        Trang {validCurrentPageRegs} / {totalPagesRegs}
                      </span>
                      <button
                        onClick={() => setCurrentPageRegs(prev => Math.min(prev + 1, totalPagesRegs))}
                        disabled={validCurrentPageRegs >= totalPagesRegs}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Sau
                      </button>
                      <button
                        onClick={() => setCurrentPageRegs(totalPagesRegs)}
                        disabled={validCurrentPageRegs >= totalPagesRegs}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Trang cuối
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Lọc & chốt danh sách */}
              {activeTab === 'chot' && (
                <div className="space-y-4 relative z-20">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-end gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-600">{registrations.length} đăng ký</span>
                      <button 
                        onClick={handleConfirmAssignStudents}
                        className="px-5 py-2 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Chốt danh sách chính thức
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative z-10">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                            <th className="p-4 pl-6 w-12">
                              <input type="checkbox" className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E]" checked readOnly />
                            </th>
                            <th className="p-4">MSSV</th>
                            <th className="p-4">Họ tên</th>
                            <th className="p-4">Trạng thái hiện tại</th>
                            <th className="p-4 text-right pr-6">Thời điểm đăng ký</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                          {loadingRegs ? (
                            <tr><td colSpan="5" className="text-center py-8 text-slate-500">Đang tải...</td></tr>
                          ) : registrations.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-8 text-slate-500 font-medium">Chưa có đăng ký nào.</td></tr>
                          ) : (
                            registrations.map(r => (
                              <tr key={r.id} className="hover:bg-slate-50 transition-colors bg-[#89B449]/5">
                                <td className="p-4 pl-6">
                                  <input type="checkbox" className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer" checked={true} readOnly />
                                </td>
                                <td className="p-4 font-mono font-bold text-[#407F3E]">{r.sinhVien?.mssv}</td>
                                <td className="p-4 font-bold text-slate-800">{r.sinhVien?.ho_ten}</td>
                                <td className="p-4">
                                  {getStatusBadge(statusMap[r.trang_thai])}
                                </td>
                                <td className="p-4 font-medium text-slate-500 text-right pr-6">{new Date(r.ngay_dang_ky).toLocaleDateString('vi-VN')}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Danh sách đã chốt (Xuất Excel) */}
              {activeTab === 'dachot' && (
                <div className="space-y-4 relative z-20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#407F3E]" />
                        Danh sách sinh viên đã chốt (Hợp lệ)
                      </h4>
                      {finalizedStudents.length > 0 && (
                        <button
                          onClick={handleExportExcel}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#407F3E]/10 text-[#407F3E] hover:bg-[#407F3E]/20 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          Xuất Excel
                        </button>
                      )}
                    </div>

                    <div className="relative w-full sm:w-64 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Tìm MSSV, tên, lớp..." 
                        value={searchFinalizedStudent}
                        onChange={(e) => {
                          setSearchFinalizedStudent(e.target.value);
                          setCurrentPageFinalized(1);
                        }}
                        className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#407F3E] focus:border-[#407F3E] transition-shadow"
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="p-4 pl-6 text-center w-16">STT</th>
                            <th className="p-4">MSSV</th>
                            <th className="p-4">Họ tên</th>
                            <th className="p-4">Lớp</th>
                            <th className="p-4">Khóa</th>
                            <th className="p-4 text-right pr-6">Thời gian ĐK</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                          {loadingRegs ? (
                            <tr><td colSpan="6" className="text-center py-8 text-slate-500 text-xs italic">Đang tải danh sách...</td></tr>
                          ) : paginatedFinalized.length > 0 ? (
                            paginatedFinalized.map((reg, idx) => (
                              <tr key={reg.id} className="hover:bg-slate-50/50">
                                <td className="p-4 pl-6 text-center text-slate-500 font-medium">{(validCurrentPageFinalized - 1) * limitFinalized + idx + 1}</td>
                                <td className="p-4 font-mono font-bold text-slate-700">{reg.sinhVien?.mssv}</td>
                                <td className="p-4 text-slate-800 font-medium">{reg.sinhVien?.ho_ten}</td>
                                <td className="p-4 text-slate-600">{reg.sinhVien?.ten_lop || '-'}</td>
                                <td className="p-4 text-slate-600">{reg.sinhVien?.khoaHoc?.ten_khoa_hoc || '-'}</td>
                                <td className="p-4 text-slate-500 text-right pr-6">{reg.ngay_dang_ky ? new Date(reg.ngay_dang_ky).toLocaleString('vi-VN') : '-'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">Không có sinh viên nào phù hợp.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer Tab Dachot */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <span>Hiển thị</span>
                        <select
                          value={limitFinalized}
                          onChange={e => {
                            setLimitFinalized(Number(e.target.value));
                            setCurrentPageFinalized(1);
                          }}
                          className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
                        >
                          <option value={15}>15</option>
                          <option value={30}>30</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span>/ {totalFinalized} sinh viên</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setCurrentPageFinalized(1)}
                          disabled={validCurrentPageFinalized <= 1}
                          className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Trang đầu
                        </button>
                        <button
                          onClick={() => setCurrentPageFinalized(prev => Math.max(prev - 1, 1))}
                          disabled={validCurrentPageFinalized <= 1}
                          className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Trước
                        </button>
                        <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                          Trang {validCurrentPageFinalized} / {totalPagesFinalized}
                        </span>
                        <button
                          onClick={() => setCurrentPageFinalized(prev => Math.min(prev + 1, totalPagesFinalized))}
                          disabled={validCurrentPageFinalized >= totalPagesFinalized}
                          className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Sau
                        </button>
                        <button
                          onClick={() => setCurrentPageFinalized(totalPagesFinalized)}
                          disabled={validCurrentPageFinalized >= totalPagesFinalized}
                          className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Trang cuối
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Modal - Xem chi tiết phiếu đăng ký (Nằm trên Detail Modal) */}
          {viewingDetail && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
              ></div>
              
              <div 
                className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    Chi tiết phiếu đăng ký
                  </h2>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                    className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {Object.entries(viewingDetail).map(([key, value]) => {
                    if (typeof value === 'object' && value !== null) return null;
                    return (
                      <div key={key} className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{key}</span>
                        <span className="text-sm font-medium text-slate-800 break-words">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end rounded-b-2xl">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                    className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast Popup */}
      {popup.show && createPortal(
        <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-right-8 fade-in duration-300">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold ${
            popup.type === 'success' 
              ? 'bg-white border-[#407F3E]/20 text-[#407F3E]' 
              : 'bg-white border-[#E68A8C]/20 text-[#E68A8C]'
          }`}>
            {popup.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {popup.message}
          </div>
        </div>,
        document.body
      )}

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeConfirm}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-600 text-sm">{confirmDialog.message}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={closeConfirm}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  confirmDialog.onConfirm();
                  closeConfirm();
                }}
                className="px-4 py-2 bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
