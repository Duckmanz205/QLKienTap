import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, ChevronRight, ChevronDown, Check, X, Upload, CloudUpload, ArrowLeft, Send, MoreVertical, Edit, Trash2, Search, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { khoaApi } from '../../services/api';
import { getValidSession } from '../../utils/auth';

export default function LichKienTap_Khoa() {
  const session = getValidSession();
  const userRole = session?.user?.vai_tro;
  const isKhoa = userRole === 'QuanLyKhoa' || userRole === 'QuanTriVienHeThong';
  const isCLB = userRole === 'QuanLyCLB';

  const [schedules, setSchedules] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [courses, setCourses] = useState([]);
  const [factories, setFactories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownConfig, setDropdownConfig] = useState(null);
  
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [promptValue, setPromptValue] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const showConfirm = (title, message, onConfirm, type = 'confirm') => {
    setPromptValue('');
    setConfirmConfig({ title, message, onConfirm, type });
  };

  useEffect(() => {
    if (!openDropdownId) return;

    const handleScroll = () => {
      setOpenDropdownId(null);
      setDropdownConfig(null);
    };

    const handleClickOutside = () => {
      setOpenDropdownId(null);
      setDropdownConfig(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
        setDropdownConfig(null);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdownId]);

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (message, type = 'error') => {
    setToastMessage({ type, text: message });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modal Create States
  const [createForm, setCreateForm] = useState({
    ten_lich: '',
    dot_kien_tap_id: '',
    so_luong_du_kien: '',
    tg_mo_dang_ky_tu: '',
    tg_mo_dang_ky_den: '',
  });  // Trip Table States for Modal
  const [tripPage, setTripPage] = useState(1);
  const [tripPageSize, setTripPageSize] = useState(15);
  const [tripFilterNhaMay, setTripFilterNhaMay] = useState('');
  const [tripFilterHinhThuc, setTripFilterHinhThuc] = useState('');
  const [viewingTripDetail, setViewingTripDetail] = useState(null);
  const [isTripFactoryDropdownOpen, setIsTripFactoryDropdownOpen] = useState(false);
  const [tripFactorySearchTerm, setTripFactorySearchTerm] = useState('');

  const [isCreating, setIsCreating] = useState(false);

  // Detail Modal States
  const [viewingDetail, setViewingDetail] = useState(null);

  // Filter States
  const [filterDot, setFilterDot] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchScheduleTerm, setSearchScheduleTerm] = useState('');
  const [isDotDropdownOpen, setIsDotDropdownOpen] = useState(false);
  const [dotSearchTermFilter, setDotSearchTermFilter] = useState('');
  const [isDotModalDropdownOpen, setIsDotModalDropdownOpen] = useState(false);
  const [dotSearchTermModal, setDotSearchTermModal] = useState('');
  const [isKhoaDropdownOpen, setIsKhoaDropdownOpen] = useState(false);
  const [khoaSearchTerm, setKhoaSearchTerm] = useState('');
  const [unassignedTrips, setUnassignedTrips] = useState([]);
  const [selectedTripIds, setSelectedTripIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schRes, campRes, courseRes, tripRes, factoryRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getCampaigns(),
        khoaApi.getCourses(),
        khoaApi.getTrips({ status: 'Nhap' }),
        khoaApi.getFactories()
      ]);
      setSchedules(schRes.data?.data || schRes.data || []);
      setCampaigns(campRes.data?.data || campRes.data || []);
      setCourses(courseRes.data?.data || courseRes.data || []);
      setFactories(factoryRes.data?.data || factoryRes.data || []);
      setUnassignedTrips(tripRes.data?.data || tripRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetail = async (schedule) => {
    const rawSchedule = schedules.find(s => s.id === schedule.id) || schedule;
    setViewingDetail(rawSchedule);
  };



  const handleApprove = (id) => {
    showConfirm('Xác nhận duyệt', 'Bạn có chắc chắn muốn duyệt lịch này?', async () => {
      try {
        await khoaApi.approveSchedule(id);
        showToast("Đã duyệt lịch kiến tập thành công", "success");
        fetchData();
      } catch (err) {
        console.error(err);
        showToast("Lỗi khi duyệt lịch", "error");
      }
    });
  };

  const handleRejectPrompt = (id) => {
    showConfirm('Từ chối duyệt', 'Nhập lý do từ chối:', async (reason) => {
      try {
        await khoaApi.rejectSchedule(id, reason);
        showToast("Đã từ chối lịch kiến tập thành công", "success");
        fetchData();
      } catch (err) {
        console.error(err);
        showToast("Lỗi khi từ chối lịch", "error");
      }
    }, 'prompt');
  };

  const handleSubmitApproval = (id) => {
    showConfirm('Gửi duyệt lịch', 'Bạn có chắc chắn muốn gửi duyệt lịch này? Sau khi gửi duyệt, bạn sẽ không thể chỉnh sửa cho đến khi có kết quả.', async () => {
      try {
        await khoaApi.submitSchedule(id);
        showToast("Đã gửi duyệt lịch kiến tập", "success");
        fetchData();
      } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || "Lỗi khi gửi duyệt lịch", "error");
      }
    });
  };



  const handleEditSchedule = (s) => {
    setEditingId(s.id);
    setCreateForm({
      ten_lich: s.ten_lich,
      dot_kien_tap_id: s.dot_kien_tap_id,
      so_luong_du_kien: s.so_luong_du_kien || '',
      tg_mo_dang_ky_tu: new Date(new Date(s.tg_mo_dang_ky_tu).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
      tg_mo_dang_ky_den: new Date(new Date(s.tg_mo_dang_ky_den).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
    });
    setOpenDropdownId(null);
    setDropdownConfig(null);
    setIsModalOpen(true);
  };

  const handleDeleteSchedule = (id) => {
    showConfirm('Xóa lịch kiến tập', 'Bạn có chắc chắn muốn xóa lịch kiến tập này không?', async () => {
      try {
        await khoaApi.deleteSchedule(id);
        showToast('Xóa lịch kiến tập thành công', 'success');
        await fetchData();
      } catch (err) {
        console.error(err);
        showToast('Có lỗi khi xóa lịch kiến tập: ' + (err.response?.data?.message || err.message), 'error');
      }
      setOpenDropdownId(null);
      setDropdownConfig(null);
    }, 'danger');
  };

  const handleFinalSubmit = async () => {
    if (!createForm.ten_lich || !createForm.dot_kien_tap_id || !createForm.tg_mo_dang_ky_tu || !createForm.tg_mo_dang_ky_den || !createForm.so_luong_du_kien) {
      showToast('Vui lòng điền đầy đủ các thông tin lịch (có dấu *)', 'error');
      return;
    }
    const tuString = createForm.tg_mo_dang_ky_tu + 'T00:00:00';
    const denString = createForm.tg_mo_dang_ky_den + 'T23:59:59';
    const t1 = new Date(tuString);
    const t2 = new Date(denString);

    if (t1 >= t2) {
      showToast('Thời gian Mở đăng ký (từ) phải TRƯỚC Mở đăng ký (đến)', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        ...createForm,
        dot_kien_tap_id: Number(createForm.dot_kien_tap_id),
        so_luong_du_kien: Number(createForm.so_luong_du_kien),
        tg_mo_dang_ky_tu: tuString,
        tg_mo_dang_ky_den: denString,
      };

      payload.chuyen_tham_quan_ids = selectedTripIds;

      // Convert empty date strings to undefined to prevent invalid date errors
      if (!payload.tg_mo_dang_ky_tu) delete payload.tg_mo_dang_ky_tu;
      if (!payload.tg_mo_dang_ky_den) delete payload.tg_mo_dang_ky_den;

      if (editingId) {
        await khoaApi.updateSchedule(editingId, payload);
        showToast('Cập nhật lịch kiến tập thành công.', 'success');
      } else {
        await khoaApi.createSchedule(payload);
        showToast('Tạo lịch kiến tập thành công.', 'success');
      }
      
      await fetchData();
      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      showToast(`Có lỗi khi ${editingId ? 'cập nhật' : 'tạo'} lịch kiến tập: ` + (err.response?.data?.message || err.message || 'Lỗi hệ thống'), 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDropdownClick = (e, scheduleId) => {
    e.stopPropagation();
    if (openDropdownId === scheduleId) {
      setDropdownConfig(null);
      setOpenDropdownId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Check if there's enough space below
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = 130; // Approx height for 3 items
    const isTopAligned = spaceBelow < menuHeight && rect.top > menuHeight;

    setDropdownConfig({
      id: scheduleId,
      top: isTopAligned ? rect.top - menuHeight : rect.bottom + 4,
      left: rect.right - 160,
    });
    setOpenDropdownId(scheduleId);
  };

  const renderDropdownPortal = () => {
    if (!dropdownConfig) return null;
    const s = schedules.find(item => item.id === dropdownConfig.id);
    if (!s) return null;

    return createPortal(
      <div 
        className="fixed bg-white border border-slate-200 rounded-xl shadow-lg z-[100] overflow-hidden animate-in fade-in zoom-in-95"
        style={{ 
          top: dropdownConfig.top, 
          left: dropdownConfig.left,
          width: '160px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleEditSchedule(s); }}
            className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Cập nhật
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(s.id); }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Xóa
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setDropdownConfig(null); handleSubmitApproval(s.id); }}
            className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-t border-slate-100"
          >
            <Send className="w-4 h-4" /> Gửi duyệt
          </button>
        </div>
      </div>,
      document.body
    );
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Nháp':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Nháp</span>;
      case 'Chờ duyệt':
      case 'ChoDuyet':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C]/20 text-[#E68A8C] border border-[#E68A8C]/30 shadow-sm">Chờ duyệt</span>;
      case 'Đã duyệt':
      case 'DaDuyet':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#407F3E]/20 text-[#407F3E] border border-[#407F3E]/30 shadow-sm">Đã duyệt</span>;
      case 'Từ chối':
      case 'TuChoi':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-600 border border-red-200 shadow-sm">Từ chối</span>;
      case 'Mở đăng ký':
      case 'MoDangKy':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white border border-[#89B449]/20 shadow-sm">Mở đăng ký</span>;
      case 'Đang diễn ra':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#407F3E] text-white border border-[#407F3E]/20 shadow-sm">Đang diễn ra</span>;
      case 'Đã kết thúc':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 border border-[#DBD468]/20 shadow-sm">Đã kết thúc</span>;
      case 'Đã khóa':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-white shadow-sm">Đã khóa</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  const filteredSchedules = schedules.filter(s => {
    if (filterDot && s.dot_kien_tap_id !== filterDot) return false;
    if (filterStatus && s.trang_thai !== filterStatus) return false;
    if (searchScheduleTerm && !s.ten_lich?.toLowerCase().includes(searchScheduleTerm.toLowerCase())) return false;
    return true;
  });

  const displayData = filteredSchedules.map((s, index) => {
    const statuses = ['Nháp', 'Mở đăng ký', 'Đang diễn ra', 'Đã kết thúc', 'Đã khóa'];
    // In real app, calculate status based on dates. Here we mock if status is null.
    const mockStatus = s.trang_thai || statuses[index % statuses.length];

    return {
      id: s.id,
      ten_lich: s.ten_lich,
      dot_kien_tap: s.dotKienTap?.ten_dot || `Đợt ${s.dot_kien_tap_id}`,
      tg_mo_dang_ky: s.tg_mo_dang_ky_tu && s.tg_mo_dang_ky_den ? `${new Date(s.tg_mo_dang_ky_tu).toLocaleDateString('vi-VN')} - ${new Date(s.tg_mo_dang_ky_den).toLocaleDateString('vi-VN')}` : 'Chưa thiết lập',
      so_luong_du_kien: s.so_luong_du_kien || 0,
      trang_thai: s.trang_thai || 'Nhap',
      ly_do_tu_choi: s.ly_do_tu_choi
    };
  });

  // Pagination logic
  const totalPages = Math.ceil(displayData.length / itemsPerPage) || 1;
  const paginatedData = displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDot]);

  // Trip Table Logic
  const filteredTrips = unassignedTrips.filter(t => {
    const matchNhaMay = !tripFilterNhaMay || t.nhaMay?.ten_nha_may?.toLowerCase().includes(tripFilterNhaMay.toLowerCase());
    const matchHinhThuc = !tripFilterHinhThuc || t.hinh_thuc === tripFilterHinhThuc;
    return matchNhaMay && matchHinhThuc;
  });

  const tripTotalPages = Math.ceil(filteredTrips.length / tripPageSize) || 1;
  const paginatedTrips = filteredTrips.slice((tripPage - 1) * tripPageSize, tripPage * tripPageSize);

  useEffect(() => {
    setTripPage(1);
  }, [tripFilterNhaMay, tripFilterHinhThuc, tripPageSize]);

  const handleToggleTrip = (id) => {
    const trip = unassignedTrips.find(t => t.id === id);
    if (!selectedTripIds.includes(id)) {
      if (!trip.giaoVienDanDoan || trip.giaoVienDanDoan.length === 0) {
        showToast("Chuyến tham quan này chưa có giảng viên dẫn đoàn. Vui lòng sang tab Phân công GV dẫn đoàn để phân công trước khi chọn.", "error");
        return;
      }
    }
    setSelectedTripIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleToggleAllTrips = () => {
    if (selectedTripIds.length === filteredTrips.length && filteredTrips.length > 0) {
      setSelectedTripIds([]); // uncheck all
    } else {
      const validTrips = filteredTrips.filter(t => t.giaoVienDanDoan && t.giaoVienDanDoan.length > 0);
      if (validTrips.length < filteredTrips.length) {
        showToast(`Có ${filteredTrips.length - validTrips.length} chuyến chưa có giảng viên dẫn đoàn bị bỏ qua. Vui lòng phân công trước.`, "error");
      }
      setSelectedTripIds(validTrips.map(t => t.id)); // check all valid
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Lịch kiến tập</h1>
        {isCLB && (
          <button 
            onClick={() => {
              setEditingId(null);
              setCreateForm({
                ten_lich: '', dot_kien_tap_id: '', so_luong_du_kien: '', 
                tg_mo_dang_ky_tu: '', tg_mo_dang_ky_den: ''
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo lịch kiến tập
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-col gap-4 relative z-20">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          {/* Đợt Dropdown */}
          <div className="relative w-full md:w-1/3 min-w-[250px]">
            <div 
              onClick={() => setIsDotDropdownOpen(!isDotDropdownOpen)}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isDotDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
            >
              <span className="text-slate-700 font-medium truncate pr-2">
                {filterDot ? campaigns.find(c => c.id === filterDot)?.ten_dot : 'Tất cả đợt'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isDotDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 max-h-60 overflow-y-auto animate-in slide-in-from-top-1">
                <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm đợt..."
                    value={dotSearchTermFilter}
                    onChange={e => setDotSearchTermFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E]"
                  />
                </div>
                <div 
                  onClick={() => { setFilterDot(''); setIsDotDropdownOpen(false); setDotSearchTermFilter(''); }}
                  className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    !filterDot ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">Tất cả đợt</span>
                  {!filterDot && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
                {campaigns
                  .filter(opt => opt.ten_dot?.toLowerCase().includes(dotSearchTermFilter.toLowerCase()))
                  .map(opt => (
                  <div 
                    key={opt.id}
                    onClick={() => { setFilterDot(opt.id); setIsDotDropdownOpen(false); setDotSearchTermFilter(''); }}
                    className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      (filterDot === opt.id) 
                        ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                        : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{opt.ten_dot}</span>
                    {filterDot === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                  </div>
                ))}
                {campaigns.filter(opt => opt.ten_dot?.toLowerCase().includes(dotSearchTermFilter.toLowerCase())).length === 0 && (
                  <div className="px-4 py-3 text-sm text-slate-500 text-center">Không tìm thấy đợt kiến tập nào</div>
                )}
              </div>
            )}
          </div>
          
          {/* Search by schedule name */}
          <div className="relative w-full md:w-2/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tên lịch kiến tập..."
              value={searchScheduleTerm}
              onChange={(e) => setSearchScheduleTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
            />
          </div>
        </div>

        {/* Filter Status Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {[
            { label: 'Tất cả trạng thái', value: '' },
            { label: 'Nháp', value: 'Nhap' },
            { label: 'Lịch gửi duyệt', value: 'ChoDuyet' },
            { label: 'Đã duyệt', value: 'DaDuyet' },
            { label: 'Từ chối', value: 'TuChoi' },
            { label: 'Mở đăng ký', value: 'MoDangKy' },
            { label: 'Đang diễn ra', value: 'DangTrienKhai' },
            { label: 'Đã kết thúc', value: 'DaKetThuc' },
            { label: 'Đã khóa', value: 'DaKhoa' },
          ].map(status => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === status.value 
                  ? 'bg-[#407F3E] text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">Tên lịch</th>
                <th className="p-4">Đợt kiến tập</th>
                <th className="p-4">Thời gian mở đăng ký</th>
                <th className="p-4 text-center">Số lượng SV</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">Không có lịch kiến tập nào.</td>
                </tr>
              ) : (
                paginatedData.map(s => (
                  <tr 
                    key={s.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(s)}
                  >
                    <td className="p-4 pl-6 font-bold text-slate-800">{s.ten_lich}</td>
                    <td className="p-4 font-bold text-slate-600">{s.dot_kien_tap}</td>
                    <td className="p-4 text-xs font-medium text-slate-600">{s.tg_mo_dang_ky}</td>
                    <td className="p-4 text-center font-bold text-slate-700">{s.so_luong_du_kien}</td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-center gap-1">
                        {getStatusBadge(s.trang_thai)}
                        {s.trang_thai === 'TuChoi' && s.ly_do_tu_choi && (
                          <span className="text-[10px] text-red-500 font-medium">Lý do: {s.ly_do_tu_choi}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 relative">
                        {isCLB && s.trang_thai === 'Nhap' && (
                          <button 
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" 
                            onClick={(e) => handleDropdownClick(e, s.id)}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        )}

                        {isKhoa && s.trang_thai === 'ChoDuyet' && (
                          <>
                            <button
                              className="p-1.5 text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer"
                              title="Duyệt lịch"
                              onClick={() => handleApprove(s.id)}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Từ chối"
                              onClick={(e) => { e.stopPropagation(); handleRejectPrompt(s.id); }}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>/ {displayData.length} lịch kiến tập</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Wizard Modal Create */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40  animate-in fade-in duration-200"
            onClick={() => { setIsModalOpen(false); setEditingId(null); }}
          ></div>
          
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Cập nhật lịch kiến tập' : 'Tạo lịch kiến tập mới'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Tên lịch <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        value={createForm.ten_lich}
                        onChange={e => setCreateForm({...createForm, ten_lich: e.target.value})}
                        className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]"
                        placeholder="Nhập tên lịch kiến tập"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Đợt kiến tập <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div 
                          onClick={() => setIsDotModalDropdownOpen(!isDotModalDropdownOpen)}
                          className={`w-full px-4 py-2 border rounded-xl text-sm flex justify-between items-center cursor-pointer bg-white transition-colors ${isDotModalDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                        >
                          <span className={createForm.dot_kien_tap_id ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                            {createForm.dot_kien_tap_id ? campaigns.find(c => c.id === Number(createForm.dot_kien_tap_id))?.ten_dot : 'Chọn đợt kiến tập'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </div>
                        {isDotModalDropdownOpen && (
                          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-1">
                            <div className="p-2 border-b border-slate-100">
                              <input 
                                type="text" 
                                placeholder="Tìm kiếm đợt..."
                                value={dotSearchTermModal}
                                onChange={e => setDotSearchTermModal(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E]"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {campaigns
                                .filter(c => c.ten_dot?.toLowerCase().includes(dotSearchTermModal.toLowerCase()))
                                .map(c => (
                                  <div 
                                    key={c.id}
                                    onClick={() => { setCreateForm({...createForm, dot_kien_tap_id: c.id}); setIsDotModalDropdownOpen(false); setDotSearchTermModal(''); }}
                                    className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#E7E0C4]/50 transition-colors ${createForm.dot_kien_tap_id === c.id ? 'bg-[#E7E0C4] font-bold text-slate-800' : 'text-slate-700'}`}
                                  >
                                    {c.ten_dot}
                                  </div>
                              ))}
                              {campaigns.filter(c => c.ten_dot?.toLowerCase().includes(dotSearchTermModal.toLowerCase())).length === 0 && (
                                <div className="px-4 py-3 text-sm text-slate-500 text-center">Không tìm thấy đợt nào</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Mở đăng ký (từ) <span className="text-red-500">*</span></label>
                      <input type="date" value={createForm.tg_mo_dang_ky_tu} onChange={e => setCreateForm({...createForm, tg_mo_dang_ky_tu: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Mở đăng ký (đến) <span className="text-red-500">*</span></label>
                      <input type="date" value={createForm.tg_mo_dang_ky_den} onChange={e => setCreateForm({...createForm, tg_mo_dang_ky_den: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Số lượng sinh viên kiến tập <span className="text-red-500">*</span></label>
                      <input type="number" min="1" value={createForm.so_luong_du_kien} onChange={e => setCreateForm({...createForm, so_luong_du_kien: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]" />
                    </div>
                  </div>
                  
                  {/* Bảng Danh sách Chuyến tham quan */}
                    <div className="border border-[#E7E0C4] rounded-xl overflow-hidden mt-6">
                      <div className="bg-[#E7E0C4]/30 px-4 py-3 flex items-center justify-between border-b border-[#E7E0C4]">
                      <h3 className="text-sm font-bold text-slate-800">Danh sách Chuyến tham quan khả dụng</h3>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div 
                            onClick={() => setIsTripFactoryDropdownOpen(!isTripFactoryDropdownOpen)}
                            className={`min-w-[200px] px-3 py-1.5 border rounded-lg text-sm flex justify-between items-center cursor-pointer bg-white transition-colors ${isTripFactoryDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                          >
                            <span className={tripFilterNhaMay ? 'text-slate-800' : 'text-slate-600'}>
                              {tripFilterNhaMay || 'Tất cả Nhà máy'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </div>
                          {isTripFactoryDropdownOpen && (
                            <div className="absolute top-full right-0 w-64 mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-1">
                              <div className="p-2 border-b border-slate-100">
                                <input 
                                  type="text" 
                                  placeholder="Tìm kiếm nhà máy..."
                                  value={tripFactorySearchTerm}
                                  onChange={e => setTripFactorySearchTerm(e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E]"
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                <div 
                                  onClick={() => { setTripFilterNhaMay(''); setIsTripFactoryDropdownOpen(false); setTripFactorySearchTerm(''); }}
                                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#E7E0C4]/50 transition-colors ${tripFilterNhaMay === '' ? 'bg-[#E7E0C4] font-bold text-slate-800' : 'text-slate-700'}`}
                                >
                                  Tất cả Nhà máy
                                </div>
                                {[...new Set(factories.map(f => f.ten_nha_may).filter(Boolean))]
                                  .filter(nm => nm.toLowerCase().includes(tripFactorySearchTerm.toLowerCase()))
                                  .map((nm, idx) => (
                                    <div 
                                      key={idx}
                                      onClick={() => { setTripFilterNhaMay(nm); setIsTripFactoryDropdownOpen(false); setTripFactorySearchTerm(''); }}
                                      className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#E7E0C4]/50 transition-colors ${tripFilterNhaMay === nm ? 'bg-[#E7E0C4] font-bold text-slate-800' : 'text-slate-700'}`}
                                    >
                                      {nm}
                                    </div>
                                ))}
                                {[...new Set(factories.map(f => f.ten_nha_may).filter(Boolean))].filter(nm => nm.toLowerCase().includes(tripFactorySearchTerm.toLowerCase())).length === 0 && (
                                  <div className="px-4 py-3 text-sm text-slate-500 text-center">Không tìm thấy nhà máy</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <select
                          className="px-3 py-1.5 border border-[#E7E0C4] rounded-lg text-sm bg-white focus:outline-none focus:border-[#407F3E]"
                          value={tripFilterHinhThuc}
                          onChange={e => setTripFilterHinhThuc(e.target.value)}
                        >
                          <option value="">Hình thức: Tất cả</option>
                          <option value="TrucTiep">Trực tiếp</option>
                          <option value="TrucTuyen">Trực tuyến</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                            <th className="p-3 pl-4 w-12">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 text-[#407F3E] rounded border-gray-300 focus:ring-[#407F3E] cursor-pointer"
                                checked={selectedTripIds.length === filteredTrips.length && filteredTrips.length > 0}
                                onChange={handleToggleAllTrips}
                              />
                            </th>
                            <th className="p-3">Nhà máy</th>
                            <th className="p-3">Hình thức</th>
                            <th className="p-3">Ngày & Giờ</th>
                            <th className="p-3 text-center">Sức chứa</th>
                            <th className="p-3 pr-4 text-right">Chi tiết</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7E0C4]/50">
                          {paginatedTrips.map(trip => (
                            <tr key={trip.id} className={`hover:bg-[#E7E0C4]/10 transition-colors ${selectedTripIds.includes(trip.id) ? 'bg-[#E7E0C4]/20' : ''}`}>
                              <td className="p-3 pl-4">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 text-[#407F3E] rounded border-gray-300 focus:ring-[#407F3E] cursor-pointer"
                                  checked={selectedTripIds.includes(trip.id)}
                                  onChange={() => handleToggleTrip(trip.id)}
                                />
                              </td>
                              <td className="p-3 font-semibold text-slate-800 text-sm">
                                {trip.nhaMay?.ten_nha_may || 'Nhà máy chưa rõ'}
                              </td>
                              <td className="p-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${trip.hinh_thuc === 'TrucTiep' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                  {trip.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
                                </span>
                              </td>
                              <td className="p-3 text-sm text-slate-600">
                                <div className="font-medium text-slate-800">{new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN')}</div>
                                <div className="text-xs">{trip.gio_bat_dau?.substring(0, 5)} - {trip.gio_ket_thuc?.substring(0, 5)}</div>
                              </td>
                              <td className="p-3 text-center text-sm font-semibold text-slate-700">
                                {trip.suc_chua}
                              </td>
                              <td className="p-3 pr-4 text-right">
                                <button 
                                  onClick={(e) => { e.preventDefault(); setViewingTripDetail(trip); }}
                                  className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                                >
                                  <Search className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredTrips.length === 0 && (
                            <tr>
                              <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">Không tìm thấy chuyến tham quan nào</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    {filteredTrips.length > 0 && (
                      <div className="px-4 py-3 border-t border-[#E7E0C4] bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">Hiển thị</span>
                          <select 
                            className="px-2 py-1 border border-[#E7E0C4] rounded-lg text-sm bg-white focus:outline-none focus:border-[#407F3E]"
                            value={tripPageSize}
                            onChange={e => setTripPageSize(Number(e.target.value))}
                          >
                            <option value={15}>15</option>
                            <option value={30}>30</option>
                            <option value={50}>50</option>
                          </select>
                          <span className="text-sm text-slate-600">chuyến</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            disabled={tripPage === 1} 
                            onClick={(e) => { e.preventDefault(); setTripPage(1); }}
                            className="px-2.5 py-1 text-sm border border-[#E7E0C4] rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 cursor-pointer font-medium transition-colors"
                          >
                            Trang đầu
                          </button>
                          <button 
                            disabled={tripPage === 1} 
                            onClick={(e) => { e.preventDefault(); setTripPage(prev => prev - 1); }}
                            className="px-2.5 py-1 text-sm border border-[#E7E0C4] rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 cursor-pointer font-medium transition-colors"
                          >
                            Trước
                          </button>
                          <span className="px-3 py-1 text-sm font-bold text-[#407F3E]">
                            Trang {tripPage} / {tripTotalPages}
                          </span>
                          <button 
                            disabled={tripPage === tripTotalPages} 
                            onClick={(e) => { e.preventDefault(); setTripPage(prev => prev + 1); }}
                            className="px-2.5 py-1 text-sm border border-[#E7E0C4] rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 cursor-pointer font-medium transition-colors"
                          >
                            Sau
                          </button>
                          <button 
                            disabled={tripPage === tripTotalPages} 
                            onClick={(e) => { e.preventDefault(); setTripPage(tripTotalPages); }}
                            className="px-2.5 py-1 text-sm border border-[#E7E0C4] rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 cursor-pointer font-medium transition-colors"
                          >
                            Trang cuối
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
              <button 
                onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                disabled={isCreating}
                className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              
              <button 
                onClick={handleFinalSubmit}
                disabled={isCreating}
                className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isCreating ? 'Đang xử lý...' : (editingId ? 'Cập nhật lịch' : 'Xác nhận tạo lịch')}
                {!isCreating && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40  animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
          ></div>
          <div 
            className="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Chi tiết lịch kiến tập
              </h2>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            


            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                <div className="bg-white p-6 rounded-xl border border-[#E7E0C4] shadow-sm animate-in fade-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tên lịch kiến tập</label>
                      <div className="text-sm font-bold text-slate-800 text-lg">{viewingDetail.ten_lich}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Đợt kiến tập</label>
                      <div className="text-sm font-semibold text-slate-700">{campaigns.find(c => c.id === viewingDetail.dot_kien_tap_id)?.ten_dot || 'Không xác định'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Số lượng sinh viên kiến tập</label>
                      <div className="text-sm font-semibold text-slate-700">{viewingDetail.so_luong_du_kien || 0}</div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Mở đăng ký (Từ - Đến)</label>
                      <div className="text-sm font-semibold text-[#407F3E]">
                        {viewingDetail.tg_mo_dang_ky_tu ? new Date(viewingDetail.tg_mo_dang_ky_tu).toLocaleString('vi-VN') : '---'} <br/><span className="text-slate-400 font-medium text-xs">đến</span> {viewingDetail.tg_mo_dang_ky_den ? new Date(viewingDetail.tg_mo_dang_ky_den).toLocaleString('vi-VN') : '---'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border border-[#E7E0C4] rounded-xl overflow-hidden shadow-sm bg-white animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-[#E7E0C4]/30 px-4 py-3 flex items-center justify-between border-b border-[#E7E0C4]">
                    <h3 className="text-sm font-bold text-slate-800">Danh sách Chuyến tham quan đã gắn</h3>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F5E9] text-slate-700 text-[10px] font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                        <th className="p-3 pl-4">Nhà máy</th>
                        <th className="p-3 text-center">Hình thức</th>
                        <th className="p-3 text-center">Ngày & Giờ</th>
                        <th className="p-3 text-center">Sức chứa</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                      {unassignedTrips.filter(t => t.lich_kien_tap_id === viewingDetail.id).length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-slate-500 font-medium">Chưa có chuyến tham quan nào được gắn</td>
                        </tr>
                      ) : (
                        unassignedTrips.filter(t => t.lich_kien_tap_id === viewingDetail.id).map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 pl-4 font-bold text-slate-800">{t.nhaMay?.ten_nha_may}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${t.hinh_thuc === 'TrucTiep' ? 'bg-[#407F3E]/20 text-[#407F3E]' : 'bg-blue-100 text-blue-700'}`}>
                                {t.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
                              </span>
                            </td>
                            <td className="p-3 text-center text-xs font-medium text-slate-600">
                              <span className="text-[#407F3E] font-bold block">{new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN')}</span>
                              {t.gio_bat_dau} - {t.gio_ket_thuc}
                            </td>
                            <td className="p-3 text-center font-bold text-slate-700">{t.suc_chua}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
          </div>
        </div>
      )}


      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-[9999] px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-right-8 fade-in duration-300 font-semibold text-sm flex items-center gap-3 ${
          toastMessage.type === 'error' ? 'bg-white text-red-600 border-red-100' : 'bg-[#407F3E] text-white border-[#407F3E]'
        }`}>
          {toastMessage.type === 'error' ? <X className="w-5 h-5 p-1 bg-red-100 rounded-full" /> : <Check className="w-5 h-5 p-1 bg-white/20 text-white rounded-full" />}
          {toastMessage.text}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40  animate-in fade-in duration-200"
            onClick={() => setConfirmConfig(null)}
          ></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 p-6">
            <h3 className={`text-lg font-bold mb-2 ${confirmConfig.type === 'danger' ? 'text-red-600' : 'text-slate-800'}`}>
              {confirmConfig.title}
            </h3>
            <p className="text-slate-600 text-sm mb-6">{confirmConfig.message}</p>
            
            {confirmConfig.type === 'prompt' && (
              <textarea 
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                className="w-full border border-[#E7E0C4] p-3 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] mb-6 resize-none"
                placeholder="Nhập lý do ở đây..."
                rows={3}
                autoFocus
              />
            )}

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmConfig(null)}
                className="px-4 py-2 border border-[#E7E0C4] text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  if (confirmConfig.type === 'prompt' && !promptValue.trim()) {
                    showToast('Vui lòng nhập lý do', 'error');
                    return;
                  }
                  confirmConfig.onConfirm(confirmConfig.type === 'prompt' ? promptValue.trim() : undefined);
                  setConfirmConfig(null);
                }}
                className={`px-4 py-2 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer ${
                  confirmConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#407F3E] hover:bg-[#407F3E]/90'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Detail Modal */}
      {viewingTripDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40 animate-in fade-in duration-200"
            onClick={() => setViewingTripDetail(null)}
          ></div>
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Chi tiết chuyến tham quan</h2>
              <button 
                onClick={() => setViewingTripDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nhà máy</label>
                  <p className="text-sm font-semibold text-slate-800">{viewingTripDetail.nhaMay?.ten_nha_may}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ngày tham quan</label>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(viewingTripDetail.ngay_tham_quan).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hình thức</label>
                    <p className="text-sm font-medium text-slate-800">
                      {viewingTripDetail.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Giờ bắt đầu - kết thúc</label>
                    <p className="text-sm font-medium text-slate-800">
                      {viewingTripDetail.gio_bat_dau?.substring(0, 5)} - {viewingTripDetail.gio_ket_thuc?.substring(0, 5)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sức chứa</label>
                    <p className="text-sm font-medium text-slate-800">
                      {viewingTripDetail.suc_chua}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Địa điểm / Link meeting</label>
                  <p className="text-sm text-slate-800 break-words">{viewingTripDetail.dia_diem_tap_trung || 'Không có'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mô tả</label>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{viewingTripDetail.mo_ta || 'Không có'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderDropdownPortal()}
    </div>
  );
}
