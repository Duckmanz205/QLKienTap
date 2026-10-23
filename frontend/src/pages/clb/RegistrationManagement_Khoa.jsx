import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronDown, Check, ChevronRight, Paperclip, 
  CheckCircle2, XCircle, Filter, Download, X,
  MapPin, Calendar, Clock, Search, Eye, ArrowUp, ArrowDown, ArrowUpDown,
  User, Building2, FileText, AlertCircle, Laptop, Banknote, Info,
  AlertTriangle, CreditCard
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import * as XLSX from 'xlsx';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function RegistrationManagement_Khoa() {
  const [masterTab, setMasterTab] = useState('trips'); // 'trips' | 'huy'
  const [selectedTripForReg, setSelectedTripForReg] = useState(null);
  
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  const [activeTab, setActiveTab] = useState('danhsach'); // 'danhsach' | 'chot' | 'dachot'
  const [registrations, setRegistrations] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [rejectedStudentIds, setRejectedStudentIds] = useState(new Set());
  const [isFiltering, setIsFiltering] = useState(false);
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
  const statusOptions = ["Tất cả", "Chờ duyệt", "Hợp lệ", "Đã tham gia", "Hoàn thành", "Vắng mặt", "Bị loại", "Đã hủy"];
  const [currentPageRegs, setCurrentPageRegs] = useState(1);
  const [limitRegs, setLimitRegs] = useState(15);

  // Search, Filter, Sort & Pagination for Detail Modal Tab 2 (chot)
  const [searchChot, setSearchChot] = useState('');
  const [filterChotStatus, setFilterChotStatus] = useState('ALL'); // 'ALL' | 'ACCEPTED' | 'REJECTED'
  const [sortChotTime, setSortChotTime] = useState('ASC'); // 'ASC' (sớm nhất trước) | 'DESC' (mới nhất trước)
  const [currentPageChot, setCurrentPageChot] = useState(1);
  const [limitChot, setLimitChot] = useState(15);

  const toggleSortChotTime = () => {
    setSortChotTime(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    setCurrentPageChot(1);
  };

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
      if (activeTab === 'danhsach') {
        fetchRegistrations(selectedTripForReg.id);
      } else if (activeTab === 'chot') {
        setSearchChot('');
        setFilterChotStatus('ALL');
        setSortChotTime('ASC');
        setCurrentPageChot(1);
        fetchRegistrationsAndPreview(selectedTripForReg.id);
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
      setSelectedStudentIds(new Set(data.map(r => r.sinhVien?.id || r.sinh_vien_id)));
    } catch (err) {
      console.error(err);
      setRegistrations([]);
    } finally {
      setLoadingRegs(false);
    }
  };

  const fetchRegistrationsAndPreview = async (tripId) => {
    setLoadingRegs(true);
    setIsFiltering(true);
    try {
      const [regRes, previewRes] = await Promise.all([
        khoaApi.getRegistrations({ chuyenThamQuanId: tripId, limit: 1000 }),
        khoaApi.previewAssignStudents({ tripId })
      ]);
      const data = regRes.data?.data || regRes.data?.items || (Array.isArray(regRes.data) ? regRes.data : []);
      const accepted = previewRes.data?.suggestedAccepted || [];
      const rejected = previewRes.data?.suggestedRejected || [];

      const reasonMap = {};
      rejected.forEach(r => {
        if (r.ly_do_loai) reasonMap[r.sinh_vien_id || r.sinhVien?.id] = r.ly_do_loai;
      });

      const enrichedData = data.map(r => ({
        ...r,
        ly_do_loai: reasonMap[r.sinhVien?.id || r.sinh_vien_id] || ''
      }));

      setRegistrations(enrichedData);
      
      const acceptedSet = new Set(accepted.map(r => r.sinhVien?.id || r.sinh_vien_id));
      const rejectedSet = new Set(rejected.map(r => r.sinhVien?.id || r.sinh_vien_id));
      
      setSelectedStudentIds(acceptedSet);
      setRejectedStudentIds(rejectedSet);
    } catch (err) {
      console.error(err);
      showPopup('Lỗi khi tải dữ liệu lọc dự kiến', 'error');
    } finally {
      setLoadingRegs(false);
      setIsFiltering(false);
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
    if (selectedTripForReg.trang_thai === 'DaDienRa' || selectedTripForReg.trang_thai === 'DaHuy') {
      showPopup('Chuyến đi đã diễn ra hoặc đã bị hủy, không thể chốt lại danh sách', 'error');
      return;
    }
    
    const maxCapacity = selectedTripForReg?.suc_chua || 0;
    if (maxCapacity > 0 && selectedStudentIds.size > maxCapacity) {
      showPopup(
        `Số lượng sinh viên hợp lệ (${selectedStudentIds.size} SV) vượt quá sức chứa tối đa của chuyến (${maxCapacity} SV). Vui lòng loại bớt ${selectedStudentIds.size - maxCapacity} sinh viên trước khi chốt danh sách!`,
        'error'
      );
      return;
    }

    showConfirm("Chốt danh sách", `Bạn có chắc chắn muốn chốt danh sách với ${selectedStudentIds.size} sinh viên được chọn? Những sinh viên không được chọn sẽ bị loại.`, async () => {
      try {
        const acceptedStudentIds = Array.from(selectedStudentIds).filter(Boolean);
        await khoaApi.confirmAssignStudents({ 
          tripId: selectedTripForReg.id, 
          acceptedStudentIds,
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


  const moveStudent = (studentId, toAccepted) => {
    if (toAccepted) {
      const maxCapacity = selectedTripForReg?.suc_chua || 0;
      if (maxCapacity > 0 && selectedStudentIds.size >= maxCapacity) {
        showPopup(
          `Không thể thêm sinh viên vào danh sách hợp lệ vì đã đạt sức chứa tối đa (${maxCapacity}/${maxCapacity} SV). Vui lòng loại bớt một sinh viên khác trước khi thêm!`,
          'error'
        );
        return;
      }
      setRejectedStudentIds(prev => { const s = new Set(prev); s.delete(studentId); return s; });
      setSelectedStudentIds(prev => { const s = new Set(prev); s.add(studentId); return s; });
      showPopup('Đã thêm sinh viên vào danh sách Hợp lệ dự kiến', 'success');
    } else {
      setSelectedStudentIds(prev => { const s = new Set(prev); s.delete(studentId); return s; });
      setRejectedStudentIds(prev => { const s = new Set(prev); s.add(studentId); return s; });
      showPopup('Đã chuyển sinh viên sang danh sách Bị loại dự kiến', 'success');
    }
  };

  // Status mapping
  const getStatusBadge = (statusStr) => {
    switch(statusStr) {
      case 'Chờ duyệt': return <span className="bg-[#DBD468] text-slate-800 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></span>Chờ duyệt</span>;
      case 'Hợp lệ': return <span className="bg-[#407F3E] text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Hợp lệ</span>;
      case 'Đã tham gia':
      case 'DaThamGia': return <span className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Đã tham gia</span>;
      case 'Hoàn thành':
      case 'HoanThanh': return <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Hoàn thành</span>;
      case 'Vắng mặt':
      case 'VangMat': return <span className="bg-amber-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1">Vắng mặt</span>;
      case 'Bị loại': return <span className="bg-[#E68A8C] text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />Bị loại</span>;
      case 'Đã hủy': return <span className="bg-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1">Đã hủy</span>;
      default: return <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">{statusStr || 'Không rõ'}</span>;
    }
  };

  const statusMap = {
    'PENDING': 'Chờ duyệt',
    'ChoDuyet': 'Chờ duyệt',
    'APPROVED': 'Hợp lệ',
    'HopLe': 'Hợp lệ',
    'DaThamGia': 'Đã tham gia',
    'ATTENDED': 'Đã tham gia',
    'HoanThanh': 'Hoàn thành',
    'COMPLETED': 'Hoàn thành',
    'VangMat': 'Vắng mặt',
    'ABSENT': 'Vắng mặt',
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
    const currentStatus = statusMap[r.trang_thai] || r.trang_thai || 'Chờ duyệt';
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

  // 5. Chot (Filter & Finalize) students filtering, sorting & pagination
  const filteredChotList = registrations.filter(r => {
    const studentId = r.sinhVien?.id || r.sinh_vien_id;
    const isAccepted = selectedStudentIds.has(studentId);
    const isRejected = rejectedStudentIds.has(studentId);

    // 1. Filter theo tab status
    if (filterChotStatus === 'ACCEPTED' && !isAccepted) return false;
    if (filterChotStatus === 'REJECTED' && !isRejected) return false;

    // 2. Filter theo từ khóa tìm kiếm
    if (searchChot) {
      const s = searchChot.toLowerCase().trim();
      const mssvMatch = (r.sinhVien?.mssv || '').toLowerCase().includes(s);
      const tenMatch = (r.sinhVien?.ho_ten || '').toLowerCase().includes(s);
      const lopMatch = (r.sinhVien?.ten_lop || '').toLowerCase().includes(s);
      if (!mssvMatch && !tenMatch && !lopMatch) return false;
    }
    return true;
  });

  // Sắp xếp theo thời điểm đăng ký (ngay_dang_ky)
  const sortedChotList = [...filteredChotList].sort((a, b) => {
    const timeA = a.ngay_dang_ky ? new Date(a.ngay_dang_ky).getTime() : 0;
    const timeB = b.ngay_dang_ky ? new Date(b.ngay_dang_ky).getTime() : 0;
    return sortChotTime === 'ASC' ? timeA - timeB : timeB - timeA;
  });

  const totalChot = sortedChotList.length;
  const totalPagesChot = Math.ceil(totalChot / limitChot) || 1;
  const validCurrentPageChot = Math.min(Math.max(1, currentPageChot), totalPagesChot);
  const paginatedChotList = sortedChotList.slice(
    (validCurrentPageChot - 1) * limitChot,
    validCurrentPageChot * limitChot
  );

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
                          <tr 
                            key={trip.id} 
                            onClick={() => { 
                              setSelectedTripForReg(trip); 
                              const defaultTab = ['DaChotDanhSach', 'DaDienRa'].includes(trip.trang_thai) ? 'dachot' : 'danhsach';
                              setActiveTab(defaultTab); 
                            }} 
                            className="hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
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
                              {trip.trang_thai === 'MoDangKy' && <span className="bg-[#DBD468] text-slate-800 text-[11px] px-3 py-1.5 rounded-full font-bold shadow-sm whitespace-nowrap">Mở đăng ký</span>}
                              {trip.trang_thai === 'DaChotDanhSach' && <span className="bg-[#407F3E] text-white text-[11px] px-3 py-1.5 rounded-full font-bold shadow-sm whitespace-nowrap">Đã chốt danh sách</span>}
                              {trip.trang_thai === 'DaDienRa' && <span className="bg-[#5A87B6] text-white text-[11px] px-3 py-1.5 rounded-full font-bold shadow-sm whitespace-nowrap">Đã diễn ra</span>}
                              {trip.trang_thai === 'DaHuy' && <span className="bg-[#E68A8C] text-white text-[11px] px-3 py-1.5 rounded-full font-bold shadow-sm border border-[#E68A8C]/20 whitespace-nowrap">Đã hủy</span>}
                            </td>
                            <td className="p-4 text-right pr-6">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSelectedTripForReg(trip); 
                                  const defaultTab = ['DaChotDanhSach', 'DaDienRa'].includes(trip.trang_thai) ? 'dachot' : 'danhsach';
                                  setActiveTab(defaultTab); 
                                }}
                                className="px-3 py-1.5 bg-slate-100 text-slate-600 group-hover:bg-[#407F3E] group-hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
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
                  <SearchableDropdown
                    value={limitTrips}
                    onChange={val => {
                      setLimitTrips(Number(val));
                      setCurrentPageTrips(1);
                    }}
                    options={[
                      { value: 15, label: '15' },
                      { value: 30, label: '30' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' }
                    ]}
                    className="min-w-[80px]"
                    searchPlaceholder="Tìm..."
                    direction="up"
                  />
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
                  <SearchableDropdown
                    value={limitHuy}
                    onChange={val => {
                      setLimitHuy(Number(val));
                      setCurrentPageHuy(1);
                    }}
                    options={[
                      { value: 15, label: '15' },
                      { value: 30, label: '30' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' }
                    ]}
                    className="min-w-[80px]"
                    searchPlaceholder="Tìm..."
                    direction="up"
                  />
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
                {['DaChotDanhSach', 'DaDienRa'].includes(selectedTripForReg.trang_thai) && (
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
                                {getStatusBadge(statusMap[r.trang_thai] || r.trang_thai)}
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
                      <SearchableDropdown 
                        options={[
                          { value: 15, label: '15' },
                          { value: 30, label: '30' },
                          { value: 50, label: '50' },
                          { value: 100, label: '100' }
                        ]}
                        value={limitRegs}
                        onChange={(newLimit) => {
                          setLimitRegs(newLimit);
                          setCurrentPageRegs(1);
                        }}
                        searchPlaceholder="Tìm số lượng..."
                        className="min-w-[80px]"
                        direction="up"
                      />
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
                  {/* Header Top Summary & Action Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#407F3E]" />
                        Kết quả lọc dự kiến:
                      </h4>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
                        Tổng: {registrations.length} đăng ký
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        selectedTripForReg?.suc_chua && selectedStudentIds.size > selectedTripForReg.suc_chua
                          ? 'bg-red-100 text-red-700 border-red-300 font-extrabold animate-pulse'
                          : selectedStudentIds.size === selectedTripForReg?.suc_chua
                            ? 'bg-[#407F3E]/10 text-[#407F3E] border-[#407F3E]/20'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        Hợp lệ: {selectedStudentIds.size} / {selectedTripForReg?.suc_chua || 0} SV (Sức chứa)
                      </span>
                      <span className="px-2.5 py-1 bg-[#E68A8C]/15 text-[#E68A8C] rounded-lg text-xs font-bold border border-[#E68A8C]/30">
                        Bị loại: {rejectedStudentIds.size} SV
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {selectedTripForReg?.trang_thai === 'DaDienRa' ? (
                        <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 flex items-center gap-2 cursor-not-allowed">
                          <CheckCircle2 className="w-4 h-4 text-slate-400" />
                          Chuyến đã diễn ra (Đã khóa danh sách)
                        </span>
                      ) : (
                        <button 
                          onClick={handleConfirmAssignStudents}
                          className="px-5 py-2 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Chốt danh sách chính thức ({selectedStudentIds.size} SV)
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedTripForReg?.trang_thai === 'DaDienRa' && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3.5 text-xs sm:text-sm flex items-center gap-2.5">
                      <Info className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        Chuyến tham quan này <strong>đã diễn ra</strong>. Danh sách sinh viên đã được chốt và khóa cố định, không thể thay đổi. Vui lòng chuyển sang tab <strong>"Danh sách sinh viên đã chốt"</strong> để xem hoặc xuất Excel danh sách sinh viên chính thức.
                      </span>
                    </div>
                  )}

                  {/* Filter Toolbar: Search + Filter Tabs (Đã loại bỏ nút sort thừa) */}
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-72 min-w-[220px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm MSSV, họ tên, lớp..." 
                        value={searchChot}
                        onChange={(e) => {
                          setSearchChot(e.target.value);
                          setCurrentPageChot(1);
                        }}
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#407F3E] focus:border-[#407F3E] transition-shadow"
                      />
                      {searchChot && (
                        <button 
                          onClick={() => { setSearchChot(''); setCurrentPageChot(1); }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                          title="Xóa tìm kiếm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => { setFilterChotStatus('ALL'); setCurrentPageChot(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          filterChotStatus === 'ALL'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Tất cả ({registrations.length})
                      </button>
                      <button
                        onClick={() => { setFilterChotStatus('ACCEPTED'); setCurrentPageChot(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          filterChotStatus === 'ACCEPTED'
                            ? 'bg-white text-[#407F3E] shadow-sm'
                            : 'text-slate-600 hover:text-[#407F3E]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#407F3E]" />
                        Hợp lệ dự kiến ({selectedStudentIds.size})
                      </button>
                      <button
                        onClick={() => { setFilterChotStatus('REJECTED'); setCurrentPageChot(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          filterChotStatus === 'REJECTED'
                            ? 'bg-white text-[#E68A8C] shadow-sm'
                            : 'text-slate-600 hover:text-[#E68A8C]'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5 text-[#E68A8C]" />
                        Bị loại dự kiến ({rejectedStudentIds.size})
                      </button>
                    </div>
                  </div>

                  {/* Main Unified Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative z-10">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[950px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 select-none">
                            <th className="py-3 pl-4 pr-2 text-center w-12 whitespace-nowrap">STT</th>
                            <th className="py-3 px-3 whitespace-nowrap">MSSV</th>
                            <th className="py-3 px-3 whitespace-nowrap">Họ tên</th>
                            <th className="py-3 px-3 whitespace-nowrap">Lớp</th>
                            <th className="py-3 px-3 text-center whitespace-nowrap">Trạng thái hiện tại</th>
                            <th className="py-3 px-3 whitespace-nowrap">Kết quả lọc dự kiến</th>
                            <th 
                              onClick={toggleSortChotTime}
                              className="py-3 px-3 text-center cursor-pointer select-none group hover:bg-slate-100 transition-colors whitespace-nowrap"
                              title={`Nhấp để sắp xếp theo thời điểm đăng ký (${sortChotTime === 'ASC' ? 'Đang: Sớm nhất trước - Nhấp để đảo chiều' : 'Đang: Mới nhất trước - Nhấp để đảo chiều'})`}
                            >
                              <div className="inline-flex items-center justify-center gap-1">
                                <span className="group-hover:text-[#407F3E] transition-colors">Thời điểm đăng ký</span>
                                {sortChotTime === 'ASC' ? (
                                  <ArrowUp className="w-3.5 h-3.5 text-[#407F3E] transition-transform group-hover:-translate-y-0.5" />
                                ) : (
                                  <ArrowDown className="w-3.5 h-3.5 text-[#407F3E] transition-transform group-hover:translate-y-0.5" />
                                )}
                              </div>
                            </th>
                            <th className="py-3 pr-6 pl-3 text-right w-28 whitespace-nowrap">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                          {isFiltering ? (
                            <tr><td colSpan="8" className="text-center py-10 text-slate-500 italic">Đang lọc dự kiến...</td></tr>
                          ) : paginatedChotList.length === 0 ? (
                            <tr><td colSpan="8" className="text-center py-10 text-slate-500 font-medium">Không tìm thấy sinh viên nào phù hợp với bộ lọc.</td></tr>
                          ) : (
                            paginatedChotList.map((r, idx) => {
                              const studentId = r.sinhVien?.id || r.sinh_vien_id;
                              const isAccepted = selectedStudentIds.has(studentId);

                              return (
                                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-3 pl-4 pr-2 text-center text-slate-500 font-medium">
                                    {(validCurrentPageChot - 1) * limitChot + idx + 1}
                                  </td>
                                  <td className="py-3 px-3 font-mono font-bold text-[#407F3E] whitespace-nowrap">
                                    {r.sinhVien?.mssv}
                                  </td>
                                  <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                                    {r.sinhVien?.ho_ten}
                                  </td>
                                  <td className="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">
                                    {r.sinhVien?.ten_lop || '--'}
                                  </td>
                                  <td className="py-3 px-3 text-center whitespace-nowrap">
                                    {getStatusBadge(statusMap[r.trang_thai] || r.trang_thai)}
                                  </td>
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    {isAccepted ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#407F3E]/10 text-[#407F3E] border border-[#407F3E]/20">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ dự kiến
                                      </span>
                                    ) : (
                                      <div className="flex flex-col gap-0.5">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E68A8C]/15 text-[#E68A8C] border border-[#E68A8C]/30 w-fit">
                                          <XCircle className="w-3.5 h-3.5" /> Bị loại dự kiến
                                        </span>
                                        {r.ly_do_loai && (
                                          <span className="text-[11px] text-slate-400 italic truncate max-w-[200px]" title={r.ly_do_loai}>
                                            Lý do: {r.ly_do_loai}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 font-medium text-slate-500 text-center text-xs whitespace-nowrap">
                                    {r.ngay_dang_ky ? new Date(r.ngay_dang_ky).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '--'}
                                  </td>
                                  <td className="py-3 pr-6 pl-3 text-right">
                                    {selectedTripForReg?.trang_thai !== 'DaDienRa' && (
                                      isAccepted ? (
                                        <button 
                                          onClick={() => moveStudent(studentId, false)}
                                          className="px-3 py-1.5 bg-[#E68A8C]/10 text-[#E68A8C] hover:bg-[#E68A8C]/20 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 ml-auto cursor-pointer"
                                          title="Chuyển sang danh sách bị loại"
                                        >
                                          Loại <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={() => moveStudent(studentId, true)}
                                          className="px-3 py-1.5 bg-[#407F3E]/10 text-[#407F3E] hover:bg-[#407F3E]/20 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 ml-auto cursor-pointer"
                                          title="Chuyển vào danh sách hợp lệ"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5" /> Hợp lệ
                                        </button>
                                      )
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer Tab Chot */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <span>Hiển thị</span>
                        <SearchableDropdown 
                          options={[
                            { value: 15, label: '15' },
                            { value: 30, label: '30' },
                            { value: 50, label: '50' },
                            { value: 100, label: '100' }
                          ]}
                          value={limitChot}
                          onChange={(newLimit) => {
                            setLimitChot(newLimit);
                            setCurrentPageChot(1);
                          }}
                          searchPlaceholder="Tìm số lượng..."
                          className="min-w-[80px]"
                          direction="up"
                        />
                        <span>/ {totalChot} sinh viên</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setCurrentPageChot(1)}
                          disabled={validCurrentPageChot <= 1}
                          className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Trang đầu
                        </button>
                        <button
                          onClick={() => setCurrentPageChot(prev => Math.max(prev - 1, 1))}
                          disabled={validCurrentPageChot <= 1}
                          className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Trước
                        </button>
                        <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                          Trang {validCurrentPageChot} / {totalPagesChot}
                        </span>
                        <button
                          onClick={() => setCurrentPageChot(prev => Math.min(prev + 1, totalPagesChot))}
                          disabled={validCurrentPageChot >= totalPagesChot}
                          className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Sau
                        </button>
                        <button
                          onClick={() => setCurrentPageChot(totalPagesChot)}
                          disabled={validCurrentPageChot >= totalPagesChot}
                          className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Trang cuối
                        </button>
                      </div>
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
                        <SearchableDropdown
                          value={limitFinalized}
                          onChange={val => {
                            setLimitFinalized(Number(val));
                            setCurrentPageFinalized(1);
                          }}
                          options={[
                            { value: 15, label: '15' },
                            { value: 30, label: '30' },
                            { value: 50, label: '50' },
                            { value: 100, label: '100' }
                          ]}
                          className="min-w-[80px]"
                          searchPlaceholder="Tìm..."
                          direction="up"
                        />
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
          {viewingDetail && (() => {
            const student = viewingDetail.sinhVien || {};
            const trip = viewingDetail.chuyenThamQuan || selectedTripForReg || {};
            const cancelReq = viewingDetail.yeuCauHuy || null;
            const isRejected = viewingDetail.trang_thai === 'BiLoai' || viewingDetail.trang_thai === 'REJECTED';
            const displayStatus = statusMap[viewingDetail.trang_thai] || viewingDetail.trang_thai || 'Chờ duyệt';

            return (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div 
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                  onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                ></div>
                
                <div 
                  className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[88vh] overflow-hidden border border-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-[#E7E0C4]/30 via-white to-transparent flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#407F3E]/10 border border-[#407F3E]/20 text-[#407F3E] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-black text-slate-800">
                            Chi tiết phiếu đăng ký
                          </h2>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            #{viewingDetail.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 font-medium">
                          <span>Chuyến #{trip.id || viewingDetail.chuyen_tham_quan_id || '--'}</span>
                          <span>&bull;</span>
                          <span className="text-slate-700 font-semibold">{trip.nhaMay?.ten_nha_may || 'Đang cập nhật'}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div>
                        {getStatusBadge(displayStatus)}
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                        className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
                        title="Đóng modal"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Body */}
                  <div className="p-6 space-y-4 overflow-y-auto bg-slate-50/50 flex-1">
                    {/* Alert Box nếu bị loại */}
                    {isRejected && (
                      <div className="bg-rose-50/90 border border-rose-200 text-rose-900 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1 text-sm">
                          <p className="font-bold text-rose-900 mb-0.5">Sinh viên không đủ điều kiện / Bị loại</p>
                          <p className="text-rose-700 text-xs font-medium leading-relaxed">
                            <span className="font-semibold">Lý do: </span>
                            {viewingDetail.ly_do_loai || 'Không nằm trong danh sách được chọn khi chốt danh sách do vượt quá số lượng tối đa hoặc tiêu chí ưu tiên.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Alert Box nếu có yêu cầu hủy */}
                    {cancelReq && (
                      <div className="bg-amber-50/90 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-amber-900 mb-0.5">Yêu cầu hủy phiếu đăng ký</p>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              {cancelReq.trang_thai === 'DaDuyet' ? 'Đã duyệt hủy' : cancelReq.trang_thai === 'TuChoi' ? 'Đã từ chối' : 'Chờ duyệt'}
                            </span>
                          </div>
                          <p className="text-amber-800 text-xs font-medium mt-1 leading-relaxed">
                            <span className="font-semibold">Lý do hủy: </span>
                            {cancelReq.ly_do_huy || 'Sinh viên nộp minh chứng xin hủy chuyến.'}
                          </p>
                          {cancelReq.ngay_yeu_cau && (
                            <p className="text-[11px] text-amber-600 mt-1">
                              Ngày gửi yêu cầu: {new Date(cancelReq.ngay_yeu_cau).toLocaleString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Card 1: Thông tin sinh viên */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                        <User className="w-4 h-4 text-[#407F3E]" />
                        <span>Thông tin sinh viên</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Họ và tên</span>
                          <span className="text-sm font-bold text-slate-800 block mt-0.5 truncate">{student.ho_ten || '--'}</span>
                        </div>
                        
                        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mã số sinh viên (MSSV)</span>
                          <span className="text-sm font-mono font-bold text-[#407F3E] block mt-0.5">{student.mssv || '--'}</span>
                        </div>

                        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lớp / Khóa học</span>
                          <span className="text-sm font-medium text-slate-700 block mt-0.5 truncate">
                            {student.ten_lop || '--'} {student.khoaHoc?.ten_khoa_hoc ? `(${student.khoaHoc.ten_khoa_hoc})` : ''}
                          </span>
                        </div>

                        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 sm:col-span-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
                          <span className="text-xs font-medium text-slate-700 block mt-1 truncate" title={student.email}>
                            {student.email || '--'}
                          </span>
                        </div>

                        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số điện thoại</span>
                          <span className="text-xs font-medium text-slate-700 block mt-1">
                            {student.sdt || '--'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Thông tin chuyến tham quan */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                        <Building2 className="w-4 h-4 text-[#89B449]" />
                        <span>Thông tin chuyến tham quan</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 sm:col-span-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nhà máy / Doanh nghiệp</span>
                          <span className="text-sm font-bold text-slate-800 block mt-0.5">{trip.nhaMay?.ten_nha_may || 'Đang cập nhật'}</span>
                        </div>

                        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thời gian diễn ra</span>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{trip.gio_bat_dau ? trip.gio_bat_dau.slice(0, 5) : '--'}</span>
                            <span>&bull;</span>
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{trip.ngay_tham_quan ? new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hình thức & Cách tổ chức</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {trip.hinh_thuc === 'TrucTuyen' ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                              {trip.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp'}
                            </span>
                            <span className="text-xs text-slate-600 font-medium">
                              {trip.cach_to_chuc === 'LopTuToChuc' ? 'Lớp tự tổ chức' : 'Khoa tổ chức'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 sm:col-span-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Địa điểm tập trung / Tham quan</span>
                          <p className="text-xs font-medium text-slate-700 mt-1 leading-relaxed">
                            {trip.hinh_thuc === 'TrucTuyen' 
                              ? 'Tham quan trực tuyến qua hệ thống hội thảo số của nhà trường/doanh nghiệp'
                              : (trip.dia_diem_tap_trung || trip.nhaMay?.dia_chi || 'Theo thông báo của ban tổ chức')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end rounded-b-2xl shrink-0">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                      className="px-6 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Toast Popup */}
      {popup.show && createPortal(
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-right-8 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-semibold text-white ${
            popup.type === 'success' 
              ? 'bg-[#407F3E] border-[#407F3E] shadow-[#407F3E]/20' 
              : 'bg-red-600 border-red-600 shadow-red-600/20'
          }`}>
            <span className="p-1 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              {popup.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-white" />}
            </span>
            <span>{popup.message}</span>
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
