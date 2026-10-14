import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  Lock, ChevronDown, Check, AlertTriangle, 
  CheckCircle2, XCircle, Clock, Ban, Search, Download, FileSpreadsheet,
  GraduationCap, Bus, FileText, Unlock, RotateCw
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import { getValidSession } from '../../utils/auth';
import { exportDiemQuaTrinh, exportDanhSachPhang, exportTongHopKienTap } from '../../utils/exportExcel';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function KetQuaKienTap_Khoa() {
  const session = getValidSession();
  const isKhoa = session?.user?.vai_tro === 'QuanLyKhoa' || session?.user?.vai_tro === 'Khoa';
  
  // Tab state
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'gvdd' | 'gvhd'

  // Schedule & Student Results states
  const [schedules, setSchedules] = useState([]);
  const [selectedLich, setSelectedLich] = useState('');
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [searchLich, setSearchLich] = useState('');
  const [results, setResults] = useState([]);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Tab 2: Điểm GVDĐ
  const [tripStatuses, setTripStatuses] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [searchTrip, setSearchTrip] = useState('');

  // Tab 3: Điểm GVHD
  const [supervisorStatuses, setSupervisorStatuses] = useState([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [searchSupervisor, setSearchSupervisor] = useState('');

  // Unlock Modal states
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState(null); // { type: 'GVDD' | 'GVHD', item: any }
  const [unlockReason, setUnlockReason] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Confirm Lock Modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [unsubmittedLecturers, setUnsubmittedLecturers] = useState([]);
  const [loadingCheckLock, setLoadingCheckLock] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  // Search & Filter & Pagination states (Tab 1: Students)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [searchLopDropdown, setSearchLopDropdown] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (selectedLich) {
      if (activeTab === 'students') {
        fetchEnrollments();
      } else if (activeTab === 'gvdd') {
        fetchTripGradingStatuses();
      } else if (activeTab === 'gvhd') {
        fetchSupervisorGradingStatuses();
      }
    }
  }, [selectedLich, activeTab]);

  const fetchSchedules = async () => {
    try {
      const res = await khoaApi.getSchedules();
      setSchedules(res.data);
      if (res.data.length > 0) {
        setSelectedLich(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await khoaApi.getEnrollments({ lichKienTapId: selectedLich, limit: 1000 });
      setResults(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTripGradingStatuses = async () => {
    if (!selectedLich) return;
    setLoadingTrips(true);
    try {
      const res = await khoaApi.getTripGradingStatuses(selectedLich);
      setTripStatuses(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách nộp điểm GVDĐ');
    } finally {
      setLoadingTrips(false);
    }
  };

  const fetchSupervisorGradingStatuses = async () => {
    if (!selectedLich) return;
    setLoadingSupervisors(true);
    try {
      const res = await khoaApi.getSupervisorGradingStatuses(selectedLich);
      setSupervisorStatuses(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách nộp điểm GVHD');
    } finally {
      setLoadingSupervisors(false);
    }
  };

  const handleOpenLockModal = async (e) => {
    e.stopPropagation();
    if (!selectedLich) {
      toast.error('Vui lòng chọn lịch kiến tập!');
      return;
    }
    setLoadingCheckLock(true);
    try {
      const res = await khoaApi.getUnsubmittedLecturers(selectedLich);
      setUnsubmittedLecturers(res.data?.chua_nop || []);
      setIsConfirmModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Không thể kiểm tra tiến độ nộp điểm');
    } finally {
      setLoadingCheckLock(false);
    }
  };

  const handleLockGrades = async (e) => {
    e.stopPropagation();
    setIsLocking(true);
    try {
      await khoaApi.lockGrades({ lichKienTapId: selectedLich });
      toast.success('Đã khóa điểm đợt này thành công! Sinh viên chưa có điểm đã được tự động tính 0đ.');
      setIsConfirmModalOpen(false);
      fetchEnrollments();
      if (activeTab === 'gvdd') fetchTripGradingStatuses();
      if (activeTab === 'gvhd') fetchSupervisorGradingStatuses();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Khóa điểm thất bại');
    } finally {
      setIsLocking(false);
    }
  };

  const handleOpenUnlockModal = (type, item) => {
    setUnlockTarget({ type, item });
    setUnlockReason('');
    setUnlockModalOpen(true);
  };

  const handleConfirmUnlock = async () => {
    if (!unlockReason.trim()) {
      toast.error('Vui lòng nhập lý do mở khóa theo đơn của giảng viên!');
      return;
    }
    setIsUnlocking(true);
    try {
      if (unlockTarget.type === 'GVDD') {
        await khoaApi.unlockTripPrepGrades({
          tripId: unlockTarget.item.chuyen_id,
          lyDo: unlockReason.trim()
        });
        toast.success(`Đã mở khóa điểm chuyến ${unlockTarget.item.ten_nha_may} cho GVDĐ!`);
        fetchTripGradingStatuses();
      } else if (unlockTarget.type === 'GVHD') {
        await khoaApi.unlockLecturerReportGrades({
          dotKienTapId: unlockTarget.item.dot_kien_tap_id,
          giangVienId: unlockTarget.item.giang_vien_id,
          lyDo: unlockReason.trim()
        });
        toast.success(`Đã mở khóa bảng điểm cho GVHD ${unlockTarget.item.ho_ten}!`);
        fetchSupervisorGradingStatuses();
      }
      setUnlockModalOpen(false);
      setUnlockTarget(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Mở khóa điểm thất bại');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
    setIsClassDropdownOpen(false);
    setIsExportDropdownOpen(false);
  };

  const handleDropdownClick = (e, setter, currentVal) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(!currentVal);
  };

  // Class list extraction
  const classList = useMemo(() => {
    const set = new Set();
    results.forEach(r => {
      const lop = r.sinhVien?.ten_lop || r.sinhVien?.lop;
      if (lop) set.add(lop);
    });
    return Array.from(set).sort();
  }, [results]);

  // Filtered & Paginated results (Tab 1)
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const sv = r.sinhVien || {};
      const matchSearch = !searchTerm || 
        sv.mssv?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sv.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase());
      const lop = sv.ten_lop || sv.lop;
      const matchClass = selectedClass === 'ALL' || lop === selectedClass;
      return matchSearch && matchClass;
    });
  }, [results, searchTerm, selectedClass]);

  const totalPages = Math.ceil(filteredResults.length / limit) || 1;
  const paginatedResults = filteredResults.slice((currentPage - 1) * limit, currentPage * limit);

  // Tab 2 filter
  const filteredTripStatuses = useMemo(() => {
    if (!searchTrip) return tripStatuses;
    const q = searchTrip.toLowerCase();
    return tripStatuses.filter(t => 
      t.ten_nha_may?.toLowerCase().includes(q) ||
      t.gvdd?.ho_ten?.toLowerCase().includes(q) ||
      t.gvdd?.ma_giang_vien?.toLowerCase().includes(q)
    );
  }, [tripStatuses, searchTrip]);

  // Tab 3 filter
  const filteredSupervisorStatuses = useMemo(() => {
    if (!searchSupervisor) return supervisorStatuses;
    const q = searchSupervisor.toLowerCase();
    return supervisorStatuses.filter(s =>
      s.ho_ten?.toLowerCase().includes(q) ||
      s.ma_giang_vien?.toLowerCase().includes(q) ||
      s.bo_mon?.toLowerCase().includes(q)
    );
  }, [supervisorStatuses, searchSupervisor]);

  // Helpers
  const getHoDemAndTen = (hoTen = '') => {
    if (!hoTen) return { hoDem: '--', ten: '--' };
    const parts = hoTen.trim().split(/\s+/);
    if (parts.length === 1) return { hoDem: '', ten: parts[0] };
    const ten = parts.pop() || '';
    const hoDem = parts.join(' ');
    return { hoDem, ten };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Stats calculation
  const statDaDat = results.filter(r => r.trang_thai === 'Đạt' || r.trang_thai === 'Dat').length;
  const statKhongDat = results.filter(r => r.trang_thai === 'Không đạt' || r.trang_thai === 'KhongDat').length;
  const statDangThucHien = results.filter(r => ['Đang thực hiện', 'DangThucHien'].includes(r.trang_thai) || (!['Đạt', 'Dat', 'Không đạt', 'KhongDat'].includes(r.trang_thai))).length; 
  const statChuaHoanThanh = results.filter(r => r.du_dieu_kien_nm === false).length;

  // Calculate max trips dynamically
  const maxTrips = useMemo(() => {
    if (!results || results.length === 0) return 3;
    const max = Math.max(0, ...results.map(r => r.trips?.length || 0));
    return Math.max(3, max);
  }, [results]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đạt':
      case 'Dat':
        return <span className="font-bold text-emerald-700">Đạt</span>;
      case 'Không đạt':
      case 'KhongDat':
        return <span className="font-bold text-red-600 underline">Không đạt</span>;
      default:
        return <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">{status || 'Đang thực hiện'}</span>;
    }
  };

  // Shared Lịch Dropdown renderer
  const renderLichDropdown = () => (
    <div className="relative min-w-[280px] flex-1">
      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Lịch kiến tập</label>
      <div 
        onClick={(e) => handleDropdownClick(e, setIsLichDropdownOpen, isLichDropdownOpen)}
        className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
      >
        <span className={`truncate pr-2 font-medium ${selectedLich ? 'text-slate-700' : 'text-slate-400'}`}>
          {schedules.find(s => s.id === selectedLich)?.ten_lich || 'Chọn lịch kiến tập'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </div>
      {isLichDropdownOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col">
          <div className="px-2 pb-1 border-b border-[#E7E0C4]/50">
            <input
              type="text"
              placeholder="Tìm kiếm lịch..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
              value={searchLich}
              onChange={(e) => setSearchLich(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {schedules.filter(opt => opt.ten_lich?.toLowerCase().includes(searchLich.toLowerCase())).length > 0 ? (
              schedules.filter(opt => opt.ten_lich?.toLowerCase().includes(searchLich.toLowerCase())).map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => { setSelectedLich(opt.id); setIsLichDropdownOpen(false); setSearchLich(''); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedLich === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt.ten_lich}</span>
                  {selectedLich === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-400 italic text-center">Không tìm thấy lịch kiến tập</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kết quả kiến tập</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý kết quả kiến tập, ma trận điểm và tiến độ nộp điểm của giảng viên</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setIsExportDropdownOpen(!isExportDropdownOpen); }}
              className="px-5 py-2.5 bg-white text-[#407F3E] border border-[#407F3E] hover:bg-[#407F3E]/5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Xuất báo cáo
              <ChevronDown className="w-4 h-4 opacity-70" />
            </button>
            {isExportDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E7E0C4] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn mẫu xuất</p>
                </div>
                <button
                  onClick={() => {
                    const tenLich = schedules.find(s => s.id === selectedLich)?.ten_lich || 'TongHop';
                    exportDiemQuaTrinh(results, tenLich);
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#407F3E]" />
                  <span>Mẫu 1: Điểm quá trình</span>
                </button>
                <button
                  onClick={() => {
                    const tenLich = schedules.find(s => s.id === selectedLich)?.ten_lich || 'TongHop';
                    exportDanhSachPhang(results, tenLich);
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#407F3E]" />
                  <span>Mẫu 2: DS sinh viên TQNM</span>
                </button>
                <button
                  onClick={() => {
                    const tenLich = schedules.find(s => s.id === selectedLich)?.ten_lich || 'TongHop';
                    exportTongHopKienTap(results, tenLich);
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#407F3E]" />
                  <span>Mẫu 3: Tổng hợp (Nhiều Sheet)</span>
                </button>
              </div>
            )}
          </div>
          {isKhoa && (
            <button 
              onClick={handleOpenLockModal}
              disabled={loadingCheckLock}
              className="px-5 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 disabled:opacity-50 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              {loadingCheckLock ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Khóa điểm đợt này</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 3 Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#E7E0C4] pb-3">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-[#407F3E] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E7E0C4]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Kết quả sinh viên</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'students' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {results.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('gvdd')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'gvdd'
              ? 'bg-[#407F3E] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E7E0C4]'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Điểm GVDĐ (Chuyến tham quan)</span>
          {tripStatuses.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeTab === 'gvdd' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tripStatuses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('gvhd')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === 'gvhd'
              ? 'bg-[#407F3E] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E7E0C4]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Điểm GVHD (Bài thu hoạch)</span>
          {supervisorStatuses.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeTab === 'gvhd' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {supervisorStatuses.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: KẾT QUẢ SINH VIÊN (MA TRẬN ĐIỂM) */}
      {activeTab === 'students' && (
        <div className="animate-in fade-in duration-200">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-end gap-4 relative z-20 mb-6">
            {renderLichDropdown()}

            {/* Lớp Dropdown */}
            <div className="relative w-64">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Lớp</label>
              <div 
                onClick={(e) => handleDropdownClick(e, setIsClassDropdownOpen, isClassDropdownOpen)}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isClassDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
              >
                <span className="truncate pr-2 font-medium text-slate-700">
                  {selectedClass === 'ALL' ? 'Tất cả lớp' : selectedClass}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              {isClassDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col">
                  <div className="px-2 pb-1 border-b border-[#E7E0C4]/50">
                    <input
                      type="text"
                      placeholder="Tìm lớp..."
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                      value={searchLopDropdown}
                      onChange={(e) => setSearchLopDropdown(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="overflow-y-auto max-h-48">
                    <div 
                      onClick={() => { setSelectedClass('ALL'); setIsClassDropdownOpen(false); setSearchLopDropdown(''); setCurrentPage(1); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        selectedClass === 'ALL' ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                      }`}
                    >
                      <span>Tất cả lớp</span>
                      {selectedClass === 'ALL' && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                    {classList.filter(l => l.toLowerCase().includes(searchLopDropdown.toLowerCase())).map(lop => (
                      <div 
                        key={lop}
                        onClick={() => { setSelectedClass(lop); setIsClassDropdownOpen(false); setSearchLopDropdown(''); setCurrentPage(1); }}
                        className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                          selectedClass === lop ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                        }`}
                      >
                        <span className="truncate pr-2">{lop}</span>
                        {selectedClass === lop && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tìm kiếm</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Tìm theo MSSV, họ tên..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-[#E7E0C4] rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-[#407F3E] text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Summary Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Đã đạt */}
            <div className="bg-[#89B449]/10 border border-[#89B449]/20 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-[#89B449] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#89B449] uppercase tracking-wider mb-0.5">Đã đạt</div>
                <div className="text-2xl font-black text-slate-800">{statDaDat}</div>
              </div>
            </div>

            {/* Đang thực hiện */}
            <div className="bg-[#DBD468]/15 border border-[#DBD468]/30 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-[#DBD468] rounded-full flex items-center justify-center text-slate-800 shadow-sm shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-yellow-700 uppercase tracking-wider mb-0.5">Đang thực hiện</div>
                <div className="text-2xl font-black text-slate-800">{statDangThucHien}</div>
              </div>
            </div>

            {/* Chưa đủ điều kiện NM */}
            <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 shadow-sm shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Chưa đủ điều kiện NM</div>
                <div className="text-2xl font-black text-slate-800">{statChuaHoanThanh}</div>
              </div>
            </div>

            {/* Không đạt */}
            <div className="bg-[#E68A8C]/10 border border-[#E68A8C]/20 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-[#E68A8C] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#E68A8C] uppercase tracking-wider mb-0.5">Không đạt</div>
                <div className="text-2xl font-black text-slate-800">{statKhongDat}</div>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1400px]">
                <thead>
                  <tr className="bg-[#E7E0C4] text-slate-800 text-[11px] font-bold uppercase tracking-wider border-b border-white">
                    <th className="p-2 border-r border-white text-center w-12" rowSpan={2}>STT</th>
                    <th className="p-2 border-r border-white text-center min-w-[110px]" rowSpan={2}>Mã HS-SV</th>
                    <th className="p-2 border-r border-white text-center min-w-[140px]" rowSpan={2}>Họ đệm</th>
                    <th className="p-2 border-r border-white text-center min-w-[80px]" rowSpan={2}>Tên</th>
                    <th className="p-2 border-r border-white text-center min-w-[95px]" rowSpan={2}>Lớp học</th>
                    <th className="p-2 border-r border-white text-center min-w-[160px]" rowSpan={2}>Giảng viên Hướng dẫn</th>
                    <th className="p-2 border-r border-white text-center min-w-[90px]" rowSpan={2}>Kết quả</th>
                    <th className="p-2 border-r border-white text-center bg-[#FFF2CC] text-[#407F3E] min-w-[90px]" rowSpan={2}>Điểm tổng kết</th>

                    {/* Group Thống kê Nhà máy */}
                    <th className="p-2 border-r border-white text-center bg-[#FCE4D6] text-amber-950 font-extrabold" colSpan={5}>
                      THỐNG KÊ SỐ LƯỢNG NHÀ MÁY
                    </th>

                    {/* Dynamic Trip Columns */}
                    {Array.from({ length: maxTrips }).map((_, i) => (
                      <th key={i} className="p-2 border-r border-white text-center bg-[#E2EFDA] text-emerald-950 font-extrabold" colSpan={6}>
                        NHÀ MÁY THỨ {i + 1}
                      </th>
                    ))}
                  </tr>

                  {/* Subheaders */}
                  <tr className="bg-[#E7E0C4]/70 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    {/* Subheaders for Thống kê Nhà máy */}
                    <th className="p-1.5 border-r border-white text-center bg-[#FCE4D6]/70 min-w-[70px]">NM Thực tế</th>
                    <th className="p-1.5 border-r border-white text-center bg-[#FCE4D6]/70 min-w-[70px]">NM Online</th>
                    <th className="p-1.5 border-r border-white text-center bg-[#FCE4D6]/70 min-w-[70px]">Tổng NM</th>
                    <th className="p-1.5 border-r border-white text-center bg-[#FCE4D6]/70 min-w-[75px]">Tiêu chuẩn</th>
                    <th className="p-1.5 border-r border-white text-center bg-[#FCE4D6]/70 min-w-[80px]">Đủ ĐK NM</th>

                    {/* Subheaders for Each Trip */}
                    {Array.from({ length: maxTrips }).map((_, i) => (
                      <React.Fragment key={i}>
                        <th className="p-1.5 border-r border-white text-center bg-[#E2EFDA]/70 min-w-[160px]">Tên Công ty/NM</th>
                        <th className="p-1.5 border-r border-white text-center bg-[#E2EFDA]/70 min-w-[80px]">Hình thức</th>
                        <th className="p-1.5 border-r border-white text-center bg-[#E2EFDA]/70 min-w-[55px]">Điểm CB</th>
                        <th className="p-1.5 border-r border-white text-center bg-[#E2EFDA]/70 min-w-[55px]">Điểm TH</th>
                        <th className="p-1.5 border-r border-white text-center bg-[#E2EFDA]/70 min-w-[55px]">Điểm Cộng</th>
                        <th className="p-1.5 border-r border-white text-center bg-[#E2EFDA]/70 min-w-[55px]">Tổng Điểm</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0C4]/50 text-xs">
                  {paginatedResults.length === 0 ? (
                    <tr>
                      <td colSpan={13 + maxTrips * 6} className="p-8 text-center text-slate-400 italic">
                        Không có dữ liệu sinh viên phù hợp.
                      </td>
                    </tr>
                  ) : (
                    paginatedResults.map((r, index) => {
                      const { hoDem, ten } = getHoDemAndTen(r.sinhVien?.ho_ten);
                      const trips = r.trips || [];

                      return (
                        <tr key={r.sinh_vien_id || index} className="hover:bg-[#E7E0C4]/15 transition-colors">
                          <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-bold text-slate-500">
                            {(currentPage - 1) * limit + index + 1}
                          </td>
                          <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-bold text-slate-800">
                            {r.sinhVien?.mssv || '--'}
                          </td>
                          <td className="p-2 border-r border-[#E7E0C4]/50 text-slate-700 whitespace-nowrap">
                            {hoDem}
                          </td>
                          <td className="p-2 border-r border-[#E7E0C4]/50 text-slate-800 font-bold whitespace-nowrap">
                            {ten}
                          </td>
                          <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-600 font-medium">
                            {r.sinhVien?.ten_lop || r.sinhVien?.lop || '--'}
                          </td>
                          <td className="p-2 border-r border-[#E7E0C4]/50 text-slate-700 font-medium whitespace-nowrap">
                            {r.giangVienHuongDan?.ho_ten || '--'}
                          </td>
                          <td className="p-2 text-center border-r border-[#E7E0C4]/50">
                            {getStatusBadge(r.trang_thai)}
                          </td>
                          <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-black text-sm bg-[#FFF2CC]/40 text-[#407F3E]">
                            {r.diem_tong_ket != null ? Number(r.diem_tong_ket).toFixed(1) : '--'}
                          </td>

                          {/* Data Thống kê Nhà máy */}
                          <td className="p-2 text-center border-r border-[#E7E0C4]/50 bg-[#FCE4D6]/20 font-bold text-slate-700">
                            {r.nm_thuc_te != null ? r.nm_thuc_te : '--'}
                          </td>
                          <td className="p-2 text-center border-r border-[#E7E0C4]/50 bg-[#FCE4D6]/20 font-bold text-slate-700">
                            {r.nm_online != null ? r.nm_online : '--'}
                          </td>
                          <td className="p-2 text-center border-r border-[#E7E0C4]/50 bg-[#FCE4D6]/30 font-black text-slate-800">
                            {r.tong_nm != null ? r.tong_nm : '--'}
                          </td>
                          <td className="p-2 text-center border-r border-[#E7E0C4]/50 bg-[#FCE4D6]/20 text-slate-500 font-semibold">
                            &gt;= 3
                          </td>
                          <td className="p-2 text-center border-r border-[#E7E0C4]/50 bg-[#FCE4D6]/30">
                            {r.du_dieu_kien_nm ? (
                              <span className="font-bold text-emerald-700">Đủ ĐK</span>
                            ) : (
                              <span className="font-bold text-red-600">Chưa đủ</span>
                            )}
                          </td>

                          {/* Dynamic Trip Columns Data */}
                          {Array.from({ length: maxTrips }).map((_, tripIdx) => {
                            const trip = trips[tripIdx];
                            if (trip) {
                              return (
                                <React.Fragment key={tripIdx}>
                                  <td className="p-2 border-r border-[#E7E0C4]/50 font-medium text-slate-800 text-[11px] max-w-[200px] truncate" title={trip.ten_chuyen || trip.ten_nha_may}>
                                    {trip.ten_chuyen || trip.ten_nha_may || '--'}
                                  </td>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-600 text-[11px]">
                                    {trip.hinh_thuc === 'Online' ? (
                                      <span className="text-blue-600 font-semibold">Online</span>
                                    ) : (
                                      <span className="text-slate-700 font-medium">Trực tiếp</span>
                                    )}
                                  </td>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-700 font-medium">
                                    {trip.diem_chuan_bi != null ? Number(trip.diem_chuan_bi).toFixed(1) : '--'}
                                  </td>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-700 font-medium">
                                    {trip.diem_thu_hoach != null ? Number(trip.diem_thu_hoach).toFixed(1) : '--'}
                                  </td>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-700 font-medium">
                                    {trip.diem_cong != null ? Number(trip.diem_cong).toFixed(1) : '--'}
                                  </td>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-bold bg-[#E2EFDA]/30 text-emerald-900">
                                    {trip.diem_tong != null ? Number(trip.diem_tong).toFixed(1) : '--'}
                                  </td>
                                </React.Fragment>
                              );
                            } else {
                              return (
                                <React.Fragment key={tripIdx}>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-300">--</td>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-300">--</td>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-300">--</td>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-300">--</td>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-300">--</td>
                                  <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-slate-300">--</td>
                                </React.Fragment>
                              );
                            }
                          })}
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
                />
                <span>/ {filteredResults.length} sinh viên</span>
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
        </div>
      )}

      {/* TAB 2: ĐIỂM GVDĐ (CHUYẾN THAM QUAN) */}
      {activeTab === 'gvdd' && (
        <div className="animate-in fade-in duration-200 space-y-6">
          {/* Tab 2 Toolbar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-end gap-4 relative z-20">
            {renderLichDropdown()}
            
            {/* Search Chuyến / GVDĐ */}
            <div className="relative min-w-[280px] flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tìm kiếm chuyến / GVDĐ</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Tìm theo nhà máy, tên GVDĐ, mã GV..."
                  value={searchTrip}
                  onChange={(e) => setSearchTrip(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#E7E0C4] rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-[#407F3E] text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Button Làm mới */}
            <div>
              <button
                onClick={fetchTripGradingStatuses}
                disabled={loadingTrips}
                className="px-4 py-2 border border-[#E7E0C4] bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
                title="Tải lại dữ liệu"
              >
                <RotateCw className={`w-4 h-4 ${loadingTrips ? 'animate-spin text-[#407F3E]' : 'text-slate-500'}`} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* Tab 2 Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E7E0C4] rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tổng số chuyến đi</div>
                <div className="text-2xl font-black text-slate-800">{tripStatuses.length}</div>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-[#407F3E] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#407F3E] uppercase tracking-wider mb-0.5">Đã khóa & nộp điểm</div>
                <div className="text-2xl font-black text-[#407F3E]">
                  {tripStatuses.filter(t => t.da_khoa_chuan_bi).length}
                </div>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Chưa nộp điểm</div>
                <div className="text-2xl font-black text-amber-800">
                  {tripStatuses.filter(t => !t.da_khoa_chuan_bi).length}
                </div>
              </div>
            </div>
          </div>

          {/* Tab 2 Table */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
            <div className="p-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/60">
              <div>
                <h2 className="text-base font-bold text-slate-800">Danh sách chuyến tham quan & Điểm GVDĐ</h2>
                <p className="text-xs text-slate-500 mt-0.5">Theo dõi điểm chuẩn bị và điểm cộng chuyên cần do Giảng viên dẫn đoàn chấm</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Hiển thị {filteredTripStatuses.length} / {tripStatuses.length} chuyến
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider">
                    <th className="p-3 text-center w-12 border-r border-white">STT</th>
                    <th className="p-3 border-r border-white min-w-[240px]">Nhà máy & Thời gian</th>
                    <th className="p-3 border-r border-white min-w-[240px]">Giảng viên dẫn đoàn</th>
                    <th className="p-3 border-r border-white text-center min-w-[140px]">Sinh viên</th>
                    <th className="p-3 border-r border-white text-center min-w-[170px]">Trạng thái nộp điểm</th>
                    <th className="p-3 text-center min-w-[150px]">Thao tác Khoa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0C4]/60 text-sm">
                  {loadingTrips ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <RotateCw className="w-5 h-5 animate-spin text-[#407F3E]" />
                          <span>Đang tải danh sách chuyến đi...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTripStatuses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                        Không tìm thấy chuyến tham quan nào phù hợp trong đợt này.
                      </td>
                    </tr>
                  ) : (
                    filteredTripStatuses.map((trip, idx) => (
                      <tr key={trip.chuyen_id} className="hover:bg-[#E7E0C4]/15 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-500 border-r border-[#E7E0C4]/40">
                          {idx + 1}
                        </td>
                        <td className="p-3 border-r border-[#E7E0C4]/40">
                          <div className="font-bold text-slate-800">{trip.ten_nha_may}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(trip.ngay_tham_quan)}</span>
                          </div>
                        </td>
                        <td className="p-3 border-r border-[#E7E0C4]/40">
                          {trip.gvdd ? (
                            <div>
                              <div className="font-bold text-slate-800">{trip.gvdd.ho_ten}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{trip.gvdd.ma_giang_vien}</span>
                                {trip.gvdd.so_dien_thoai && <span>{trip.gvdd.so_dien_thoai}</span>}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Chưa phân công GVDĐ</span>
                          )}
                        </td>
                        <td className="p-3 text-center border-r border-[#E7E0C4]/40">
                          <div className="font-bold text-slate-700">
                            {trip.so_sv_co_diem} / {trip.so_luong_sv}
                          </div>
                          <div className="text-[11px] text-slate-400">sinh viên có điểm</div>
                        </td>
                        <td className="p-3 text-center border-r border-[#E7E0C4]/40">
                          {trip.da_khoa_chuan_bi ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Đã khóa & nộp
                              </span>
                              {trip.ngay_khoa_chuan_bi && (
                                <span className="text-[11px] text-slate-400 mt-0.5">
                                  {formatDateTime(trip.ngay_khoa_chuan_bi)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Chưa nộp điểm
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isKhoa && trip.da_khoa_chuan_bi ? (
                            <button
                              onClick={() => handleOpenUnlockModal('GVDD', trip)}
                              className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                              title="Mở khóa để GVDĐ chỉnh sửa điểm theo đơn"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Mở khóa điểm</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              {trip.da_khoa_chuan_bi ? '--' : 'Đang cho phép nhập'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ĐIỂM GVHD (BÀI THU HOẠCH) */}
      {activeTab === 'gvhd' && (
        <div className="animate-in fade-in duration-200 space-y-6">
          {/* Tab 3 Toolbar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-end gap-4 relative z-20">
            {renderLichDropdown()}
            
            {/* Search GVHD */}
            <div className="relative min-w-[280px] flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tìm kiếm GVHD / Bộ môn</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Tìm theo họ tên GV, mã GV, bộ môn..."
                  value={searchSupervisor}
                  onChange={(e) => setSearchSupervisor(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#E7E0C4] rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-[#407F3E] text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Button Làm mới */}
            <div>
              <button
                onClick={fetchSupervisorGradingStatuses}
                disabled={loadingSupervisors}
                className="px-4 py-2 border border-[#E7E0C4] bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
                title="Tải lại dữ liệu"
              >
                <RotateCw className={`w-4 h-4 ${loadingSupervisors ? 'animate-spin text-[#407F3E]' : 'text-slate-500'}`} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* Tab 3 Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E7E0C4] rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tổng số Giảng viên HD</div>
                <div className="text-2xl font-black text-slate-800">{supervisorStatuses.length}</div>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-[#407F3E] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#407F3E] uppercase tracking-wider mb-0.5">Đã khóa & nộp bảng điểm</div>
                <div className="text-2xl font-black text-[#407F3E]">
                  {supervisorStatuses.filter(s => s.da_khoa_thu_hoach).length}
                </div>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Chưa nộp bảng điểm</div>
                <div className="text-2xl font-black text-amber-800">
                  {supervisorStatuses.filter(s => !s.da_khoa_thu_hoach).length}
                </div>
              </div>
            </div>
          </div>

          {/* Tab 3 Table */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
            <div className="p-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/60">
              <div>
                <h2 className="text-base font-bold text-slate-800">Danh sách Giảng viên hướng dẫn & Điểm bài thu hoạch</h2>
                <p className="text-xs text-slate-500 mt-0.5">Theo dõi tiến độ chấm bài thu hoạch và nộp điểm của Giảng viên hướng dẫn</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Hiển thị {filteredSupervisorStatuses.length} / {supervisorStatuses.length} giảng viên
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider">
                    <th className="p-3 text-center w-12 border-r border-white">STT</th>
                    <th className="p-3 border-r border-white min-w-[260px]">Giảng viên hướng dẫn</th>
                    <th className="p-3 border-r border-white min-w-[180px]">Bộ môn / Khoa</th>
                    <th className="p-3 border-r border-white text-center min-w-[150px]">Tiến độ chấm</th>
                    <th className="p-3 border-r border-white text-center min-w-[170px]">Trạng thái nộp điểm</th>
                    <th className="p-3 text-center min-w-[150px]">Thao tác Khoa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0C4]/60 text-sm">
                  {loadingSupervisors ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <RotateCw className="w-5 h-5 animate-spin text-[#407F3E]" />
                          <span>Đang tải danh sách giảng viên hướng dẫn...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSupervisorStatuses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                        Không tìm thấy giảng viên hướng dẫn nào trong đợt này.
                      </td>
                    </tr>
                  ) : (
                    filteredSupervisorStatuses.map((sup, idx) => (
                      <tr key={sup.giang_vien_id} className="hover:bg-[#E7E0C4]/15 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-500 border-r border-[#E7E0C4]/40">
                          {idx + 1}
                        </td>
                        <td className="p-3 border-r border-[#E7E0C4]/40">
                          <div className="font-bold text-slate-800">{sup.ho_ten}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{sup.ma_giang_vien}</span>
                            {sup.email && <span>{sup.email}</span>}
                          </div>
                        </td>
                        <td className="p-3 border-r border-[#E7E0C4]/40">
                          <span className="font-medium text-slate-700">{sup.bo_mon || 'Khoa CNTT'}</span>
                        </td>
                        <td className="p-3 text-center border-r border-[#E7E0C4]/40">
                          <div className="font-bold text-slate-700">
                            {sup.so_sv_da_cham} / {sup.so_luong_sv}
                          </div>
                          <div className="text-[11px] text-slate-400">sinh viên đã chấm</div>
                        </td>
                        <td className="p-3 text-center border-r border-[#E7E0C4]/40">
                          {sup.da_khoa_thu_hoach ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Đã khóa & nộp
                              </span>
                              {sup.ngay_khoa_thu_hoach && (
                                <span className="text-[11px] text-slate-400 mt-0.5">
                                  {formatDateTime(sup.ngay_khoa_thu_hoach)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Chưa nộp điểm
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isKhoa && sup.da_khoa_thu_hoach ? (
                            <button
                              onClick={() => handleOpenUnlockModal('GVHD', sup)}
                              className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                              title="Mở khóa để GVHD chỉnh sửa điểm theo đơn"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Mở khóa điểm</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              {sup.da_khoa_thu_hoach ? '--' : 'Đang cho phép nhập'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Grade Modal */}
      {unlockModalOpen && unlockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
            onClick={() => { if (!isUnlocking) setUnlockModalOpen(false); }}
          ></div>
          <div 
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {unlockTarget.type === 'GVDD' ? 'Mở khóa điểm Giảng viên dẫn đoàn' : 'Mở khóa bảng điểm Giảng viên hướng dẫn'}
                </h3>
                <p className="text-xs text-slate-500">
                  Cho phép giảng viên chỉnh sửa lại điểm sau khi đã nộp
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 text-xs space-y-1.5 text-slate-700">
              {unlockTarget.type === 'GVDD' ? (
                <>
                  <div><span className="font-bold text-slate-500">Chuyến tham quan:</span> <span className="font-semibold text-slate-800">{unlockTarget.item.ten_nha_may}</span> ({formatDate(unlockTarget.item.ngay_tham_quan)})</div>
                  <div><span className="font-bold text-slate-500">Giảng viên dẫn đoàn:</span> <span className="font-semibold text-slate-800">{unlockTarget.item.gvdd?.ho_ten || '--'}</span> ({unlockTarget.item.gvdd?.ma_giang_vien || '--'})</div>
                  <div><span className="font-bold text-slate-500">Nội dung điểm:</span> Điểm chuẩn bị và Điểm cộng chuyên cần</div>
                  <div><span className="font-bold text-slate-500">Thời gian GVDĐ đã nộp:</span> {formatDateTime(unlockTarget.item.ngay_khoa_chuan_bi)}</div>
                </>
              ) : (
                <>
                  <div><span className="font-bold text-slate-500">Giảng viên hướng dẫn:</span> <span className="font-semibold text-slate-800">{unlockTarget.item.ho_ten}</span> ({unlockTarget.item.ma_giang_vien})</div>
                  <div><span className="font-bold text-slate-500">Bộ môn / Khoa:</span> {unlockTarget.item.bo_mon || 'Khoa CNTT'}</div>
                  <div><span className="font-bold text-slate-500">Số lượng sinh viên hướng dẫn:</span> {unlockTarget.item.so_sv_da_cham} / {unlockTarget.item.so_luong_sv} SV</div>
                  <div><span className="font-bold text-slate-500">Nội dung điểm:</span> Bảng điểm bài thu hoạch kiến tập</div>
                  <div><span className="font-bold text-slate-500">Thời gian GVHD đã nộp:</span> {formatDateTime(unlockTarget.item.ngay_khoa_thu_hoach)}</div>
                </>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Lý do mở khóa (Dựa trên đơn đề nghị của GV) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="Ví dụ: Giảng viên gửi đơn số 05/ĐX ngày 15/10 đề nghị cập nhật lại điểm cho sinh viên..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1 italic">
                Lý do này sẽ được ghi nhận vào nhật ký hệ thống để phục vụ công tác thanh tra/kiểm tra.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                disabled={isUnlocking}
                onClick={() => setUnlockModalOpen(false)}
                className="px-4 py-2 border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition"
              >
                Hủy
              </button>
              <button
                disabled={isUnlocking || !unlockReason.trim()}
                onClick={handleConfirmUnlock}
                className="px-5 py-2 bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
              >
                {isUnlocking ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Xác nhận mở khóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Lock Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dimmed Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); if (!isLocking) setIsConfirmModalOpen(false); }}
          ></div>
          
          {/* Modal Content */}
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 p-6 flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {unsubmittedLecturers.length > 0 ? (
              <>
                <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mb-3 border border-amber-500/20 text-amber-600">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">Cảnh báo: Có giảng viên chưa nộp điểm</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Đợt kiến tập này còn <span className="font-bold text-amber-600">{unsubmittedLecturers.length}</span> giảng viên chưa nộp điểm:
                </p>
                
                <div className="w-full max-h-44 overflow-y-auto bg-amber-50/70 border border-amber-200 rounded-xl p-3 mb-3 divide-y divide-amber-100 text-left">
                  {unsubmittedLecturers.map((gv, idx) => (
                    <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{gv.ten_giang_vien}</span>
                        <span className="text-slate-500 ml-1.5 font-medium">({gv.vai_tro})</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded">Chưa nộp</span>
                    </div>
                  ))}
                </div>

                <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-left">
                  <p className="text-xs text-red-700 font-medium leading-relaxed">
                    ⚠️ <strong>Lưu ý:</strong> Khi bạn xác nhận khóa điểm, tất cả sinh viên chưa có điểm sẽ <strong>tự động nhận 0 điểm</strong> và toàn bộ điểm số của đợt này sẽ được chốt chính thức.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 border border-emerald-500/20 text-[#407F3E]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">Xác nhận khóa điểm toàn đợt</h3>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Tất cả giảng viên đã hoàn thành nộp điểm. Sau khi khóa, bảng điểm sẽ được chốt chính thức và sinh viên chưa có điểm (nếu có) sẽ tự động nhận 0 điểm.
                </p>
              </>
            )}
            
            <div className="flex items-center gap-3 w-full">
              <button 
                disabled={isLocking}
                onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(false); }}
                className="flex-1 py-2.5 border border-[#E7E0C4] bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                disabled={isLocking}
                onClick={handleLockGrades}
                className="flex-1 py-2.5 bg-[#E68A8C] text-white hover:bg-[#E68A8C]/90 disabled:opacity-50 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isLocking ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Đang khóa...</span>
                  </>
                ) : (
                  <span>Xác nhận khóa điểm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
