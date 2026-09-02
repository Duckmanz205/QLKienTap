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
    khoa_hoc_id: '',
    tg_mo_dang_ky_tu: '',
    tg_mo_dang_ky_den: '',
    tg_dien_ra_tu: '',
    tg_dien_ra_den: '',
    han_chot_nop_bao_cao: '',
    han_chot_diem: '',
  });
  const [uploadedStudents, setUploadedStudents] = useState([]);
  const [selectedFileInfo, setSelectedFileInfo] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);

  // Detail Modal States
  const [viewingDetail, setViewingDetail] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('thong_tin');
  const [enrollments, setEnrollments] = useState([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

  const [importingLich, setImportingLich] = useState(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schRes, campRes, courseRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getCampaigns(),
        khoaApi.getCourses()
      ]);
      setSchedules(schRes.data);
      setCampaigns(campRes.data);
      setCourses(courseRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetail = async (schedule) => {
    const rawSchedule = schedules.find(s => s.id === schedule.id) || schedule;
    setViewingDetail(rawSchedule);
    setActiveDetailTab('thong_tin');

    setIsLoadingEnrollments(true);
    try {
      const res = await khoaApi.getEnrollments({ lichKienTapId: schedule.id, limit: 1000 });
      setEnrollments(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      setEnrollments([]);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  const handleOpenImport = (schedule) => {
    setImportingLich(schedule);
    setUploadedStudents([]);
    setFileError('');
  };

  const handleImportSubmit = async () => {
    if (uploadedStudents.length === 0) {
      showToast("Vui lòng tải lên danh sách sinh viên", 'error');
      return;
    }
    
    setIsLoadingStudents(true);
    try {
      // Find IDs for the uploaded students by mapping MSSV
      const stRes = await khoaApi.getStudents({ limit: 10000 });
      const allStData = stRes.data?.data || stRes.data || [];
      const mssvToId = {};
      allStData.forEach(st => {
        mssvToId[st.mssv] = st.id;
      });
      
      const studentIds = uploadedStudents.map(st => mssvToId[st.mssv]).filter(id => id);
      
      if (studentIds.length === 0) {
        showToast("Không tìm thấy sinh viên hợp lệ trong hệ thống khớp với file", 'error');
        setIsLoadingStudents(false);
        return;
      }
      
      await khoaApi.importStudents({
        lichId: importingLich.id,
        studentIds: studentIds
      });
      await fetchData();
      showToast(`Tải danh sách SV thành công. Đã gán ${studentIds.length}/${uploadedStudents.length} sinh viên.`, 'success');
      setImportingLich(null);
      setUploadedStudents([]);
    } catch (err) {
      console.error(err);
      showToast("Lỗi tải danh sách SV: " + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsLoadingStudents(false);
    }
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        const formatted = data.map(row => ({
          mssv: String(row['MSSV'] || row['mssv'] || ''),
          ho_ten: String(row['Họ tên'] || row['ho_ten'] || ''),
          ten_lop: String(row['Lớp'] || row['ten_lop'] || ''),
        })).filter(r => r.mssv);
        if (formatted.length === 0) {
          setFileError('File không có dữ liệu hợp lệ hoặc sai định dạng mẫu.');
          setUploadedStudents([]);
          setSelectedFileInfo(null);
        } else {
          setFileError('');
          setUploadedStudents(formatted);
          setSelectedFileInfo({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB'
          });
        }
      } catch (err) {
        setFileError('Đã xảy ra lỗi khi đọc file.');
        setUploadedStudents([]);
        setSelectedFileInfo(null);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const handleResetFile = () => {
    setUploadedStudents([]);
    setSelectedFileInfo(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadSampleFile = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'MSSV': '2001202244', 'Họ tên': 'Nguyễn Văn A', 'Lớp': '11DHTP1' },
      { 'MSSV': '2001202245', 'Họ tên': 'Trần Thị B', 'Lớp': '11DHTP2' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachSinhVien");
    XLSX.writeFile(wb, "Mau_DanhSachSinhVien.xlsx");
  };

  const handleEditSchedule = (s) => {
    setEditingId(s.id);
    setCreateForm({
      ten_lich: s.ten_lich,
      dot_kien_tap_id: s.dot_kien_tap_id,
      khoa_hoc_id: s.khoa_id, // Vì khoa_id đang map với khóa học
      tg_mo_dang_ky_tu: new Date(new Date(s.tg_mo_dang_ky_tu).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
      tg_mo_dang_ky_den: new Date(new Date(s.tg_mo_dang_ky_den).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
      tg_dien_ra_tu: s.tg_dien_ra_tu.split('T')[0],
      tg_dien_ra_den: s.tg_dien_ra_den.split('T')[0],
      han_chot_nop_bao_cao: s.han_chot_nop_bao_cao.split('T')[0],
      han_chot_diem: s.han_chot_diem.split('T')[0]
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
    if (!createForm.ten_lich || !createForm.dot_kien_tap_id || !createForm.tg_mo_dang_ky_tu || !createForm.tg_mo_dang_ky_den || !createForm.tg_dien_ra_tu || !createForm.tg_dien_ra_den || !createForm.han_chot_nop_bao_cao || !createForm.han_chot_diem) {
      showToast('Vui lòng điền đầy đủ các thông tin lịch (có dấu *)', 'error');
      return;
    }
    
    const t1 = new Date(createForm.tg_mo_dang_ky_tu);
    const t2 = new Date(createForm.tg_mo_dang_ky_den);
    const t3 = new Date(createForm.tg_dien_ra_tu);
    const t4 = new Date(createForm.tg_dien_ra_den);
    const t5 = new Date(createForm.han_chot_nop_bao_cao);
    const t6 = new Date(createForm.han_chot_diem);

    if (t1 >= t2) {
      showToast('Thời gian Mở đăng ký (từ) phải TRƯỚC Mở đăng ký (đến)', 'error');
      return;
    }
    if (t2 > t3) {
      showToast('Thời gian Mở đăng ký (đến) phải TRƯỚC HOẶC BẰNG ngày Diễn ra (từ)', 'error');
      return;
    }
    if (t3 >= t4) {
      showToast('Ngày Diễn ra (từ) phải TRƯỚC ngày Diễn ra (đến)', 'error');
      return;
    }
    if (t5 >= t6) {
      showToast('Hạn nộp báo cáo phải TRƯỚC Hạn chốt điểm', 'error');
      return;
    }

    if (!createForm.khoa_hoc_id) {
      showToast('Vui lòng chọn Khóa trước khi tiếp tục.', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        ...createForm,
        dot_kien_tap_id: Number(createForm.dot_kien_tap_id),
        khoa_id: Number(createForm.khoa_hoc_id),
      };
      delete payload.khoa_hoc_id;

      // Convert empty date strings to undefined to prevent invalid date errors
      if (!payload.tg_mo_dang_ky_tu) delete payload.tg_mo_dang_ky_tu;
      if (!payload.tg_mo_dang_ky_den) delete payload.tg_mo_dang_ky_den;
      if (!payload.tg_dien_ra_tu) delete payload.tg_dien_ra_tu;
      if (!payload.tg_dien_ra_den) delete payload.tg_dien_ra_den;
      if (!payload.han_chot_nop_bao_cao) delete payload.han_chot_nop_bao_cao;
      if (!payload.han_chot_diem) delete payload.han_chot_diem;

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
      khoa: s.khoa?.ten_khoa || '14ĐHTP',
      tg_mo_dang_ky: `${new Date(s.tg_mo_dang_ky_tu).toLocaleDateString('vi-VN')} - ${new Date(s.tg_mo_dang_ky_den).toLocaleDateString('vi-VN')}`,
      tg_dien_ra: `${new Date(s.tg_dien_ra_tu).toLocaleDateString('vi-VN')} - ${new Date(s.tg_dien_ra_den).toLocaleDateString('vi-VN')}`,
      han_bao_cao: new Date(s.han_chot_nop_bao_cao).toLocaleDateString('vi-VN'),
      han_diem: new Date(s.han_chot_diem).toLocaleDateString('vi-VN'),
      trang_thai: mockStatus
    };
  });

  // Pagination logic
  const totalPages = Math.ceil(displayData.length / itemsPerPage) || 1;
  const paginatedData = displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDot]);

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
                ten_lich: '', dot_kien_tap_id: '', khoa_id: '', 
                tg_mo_dang_ky_tu: '', tg_mo_dang_ky_den: '', tg_dien_ra_tu: '', tg_dien_ra_den: '', 
                han_chot_nop_bao_cao: '', han_chot_diem: ''
              });
              setUploadedStudents([]);
              setFileError('');
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
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">Tên lịch</th>
                <th className="p-4">Khóa</th>
                <th className="p-4">Thời gian mở đăng ký</th>
                <th className="p-4">Thời gian diễn ra</th>
                <th className="p-4">Hạn nộp báo cáo</th>
                <th className="p-4">Hạn chốt điểm</th>
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
                    <td className="p-4 font-bold text-slate-600">{s.khoa}</td>
                    <td className="p-4 text-xs font-medium text-slate-600">{s.tg_mo_dang_ky}</td>
                    <td className="p-4 text-xs font-medium text-slate-600">{s.tg_dien_ra}</td>
                    <td className="p-4 text-xs font-medium text-[#E68A8C]">{s.han_bao_cao}</td>
                    <td className="p-4 text-xs font-medium text-[#E68A8C]">{s.han_diem}</td>
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
                        {(s.trang_thai === 'DaDuyet' || s.trang_thai === 'MoDangKy' || s.trang_thai === 'DangDienRa') && (
                          <button 
                            className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                            title="Tải danh sách SV"
                            onClick={(e) => { e.stopPropagation(); handleOpenImport(s); }}
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}

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
        <div className="px-6 py-4 border-t border-[#E7E0C4] flex items-center justify-between bg-white rounded-b-2xl">
          <div className="flex items-center text-sm text-slate-600">
            <span>Hiển thị</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="mx-2 px-2 py-1 border border-[#E7E0C4] rounded-lg bg-white focus:outline-none focus:border-[#407F3E] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>/ {displayData.length} lịch kiến tập</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-[#E7E0C4] rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Trang đầu
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-[#E7E0C4] rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Trước
            </button>
            <div className="px-4 py-1.5 text-sm font-bold bg-[#407F3E] text-white rounded-lg shadow-sm">
              Trang {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-[#E7E0C4] rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Sau
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-[#E7E0C4] rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
          
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
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
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Khóa <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div 
                          onClick={() => setIsKhoaDropdownOpen(!isKhoaDropdownOpen)}
                          className={`w-full px-4 py-2 border rounded-xl text-sm flex justify-between items-center cursor-pointer bg-white transition-colors ${isKhoaDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                        >
                          <span className={createForm.khoa_hoc_id ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                            {createForm.khoa_hoc_id ? courses.find(c => c.id === Number(createForm.khoa_hoc_id))?.ten_khoa : 'Chọn khóa'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </div>
                        {isKhoaDropdownOpen && (
                          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-1">
                            <div className="p-2 border-b border-slate-100">
                              <input 
                                type="text" 
                                placeholder="Tìm kiếm khóa..."
                                value={khoaSearchTerm}
                                onChange={e => setKhoaSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E]"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {courses
                                .filter(c => c.ten_khoa?.toLowerCase().includes(khoaSearchTerm.toLowerCase()))
                                .map(c => (
                                  <div 
                                    key={c.id}
                                    onClick={() => { setCreateForm({...createForm, khoa_hoc_id: c.id}); setIsKhoaDropdownOpen(false); setKhoaSearchTerm(''); }}
                                    className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#E7E0C4]/50 transition-colors ${createForm.khoa_hoc_id === c.id ? 'bg-[#E7E0C4] font-bold text-slate-800' : 'text-slate-700'}`}
                                  >
                                    {c.ten_khoa}
                                  </div>
                              ))}
                              {courses.filter(c => c.ten_khoa?.toLowerCase().includes(khoaSearchTerm.toLowerCase())).length === 0 && (
                                <div className="px-4 py-3 text-sm text-slate-500 text-center">Không tìm thấy khóa nào</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Mở đăng ký (từ) <span className="text-red-500">*</span></label>
                      <input type="datetime-local" value={createForm.tg_mo_dang_ky_tu} onChange={e => setCreateForm({...createForm, tg_mo_dang_ky_tu: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Mở đăng ký (đến) <span className="text-red-500">*</span></label>
                      <input type="datetime-local" value={createForm.tg_mo_dang_ky_den} onChange={e => setCreateForm({...createForm, tg_mo_dang_ky_den: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Diễn ra (từ) <span className="text-red-500">*</span></label>
                      <input type="date" value={createForm.tg_dien_ra_tu} onChange={e => setCreateForm({...createForm, tg_dien_ra_tu: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Diễn ra (đến) <span className="text-red-500">*</span></label>
                      <input type="date" value={createForm.tg_dien_ra_den} onChange={e => setCreateForm({...createForm, tg_dien_ra_den: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Hạn nộp báo cáo <span className="text-red-500">*</span></label>
                      <input type="date" value={createForm.han_chot_nop_bao_cao} onChange={e => setCreateForm({...createForm, han_chot_nop_bao_cao: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Hạn chốt điểm <span className="text-red-500">*</span></label>
                      <input type="date" value={createForm.han_chot_diem} onChange={e => setCreateForm({...createForm, han_chot_diem: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]" />
                    </div>
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
            
            <div className="flex border-b border-[#E7E0C4] px-6 mt-2 gap-6 bg-white">
               <button 
                 onClick={(e) => { e.stopPropagation(); setActiveDetailTab('thong_tin'); }}
                 className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeDetailTab === 'thong_tin' ? 'border-[#407F3E] text-[#407F3E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                 1. Thông tin lịch
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); setActiveDetailTab('sinh_vien'); }}
                 className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeDetailTab === 'sinh_vien' ? 'border-[#407F3E] text-[#407F3E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                 2. Danh sách sinh viên
               </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {activeDetailTab === 'thong_tin' ? (
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
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Khóa</label>
                      <div className="text-sm font-semibold text-slate-700">{courses.find(c => c.id === viewingDetail.khoa_id)?.ten_khoa || 'Không xác định'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Mở đăng ký (Từ - Đến)</label>
                      <div className="text-sm font-semibold text-[#407F3E]">
                        {new Date(viewingDetail.tg_mo_dang_ky_tu).toLocaleString('vi-VN')} <br/><span className="text-slate-400 font-medium text-xs">đến</span> {new Date(viewingDetail.tg_mo_dang_ky_den).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Thời gian diễn ra (Từ - Đến)</label>
                      <div className="text-sm font-semibold text-[#407F3E]">
                        {new Date(viewingDetail.tg_dien_ra_tu).toLocaleDateString('vi-VN')} <br/><span className="text-slate-400 font-medium text-xs">đến</span> {new Date(viewingDetail.tg_dien_ra_den).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Hạn nộp báo cáo</label>
                      <div className="text-sm font-bold text-[#E68A8C]">
                        {new Date(viewingDetail.han_chot_nop_bao_cao).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Hạn chốt điểm</label>
                      <div className="text-sm font-bold text-[#E68A8C]">
                        {new Date(viewingDetail.han_chot_diem).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  {isLoadingEnrollments ? (
                    <div className="text-center py-8 text-slate-500 font-medium">Đang tải dữ liệu...</div>
                  ) : enrollments.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 font-medium">Chưa có sinh viên nào trong lịch này.</div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                            <th className="p-4 pl-6">MSSV</th>
                            <th className="p-4">Họ và tên</th>
                            <th className="p-4">Lớp</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">SĐT</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                          {enrollments.map((en, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 pl-6 font-bold text-[#407F3E]">{en.sinhVien?.mssv}</td>
                              <td className="p-4 font-bold text-slate-800">{en.sinhVien?.ho_ten}</td>
                              <td className="p-4 font-medium text-slate-600">{en.sinhVien?.ten_lop || '-'}</td>
                              <td className="p-4 font-medium text-slate-600">{en.sinhVien?.email || '-'}</td>
                              <td className="p-4 font-medium text-slate-600">{en.sinhVien?.sdt || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Students Modal */}
      {importingLich && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40  animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setImportingLich(null); }}
          ></div>
          <div 
            className="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Tải danh sách SV - {importingLich.ten_lich}
              </h2>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setImportingLich(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col min-h-0 bg-slate-50">
              <div className="mb-6 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tải lên file danh sách sinh viên</label>
                  <button 
                    type="button"
                    onClick={handleDownloadSampleFile}
                    className="text-xs font-bold text-[#407F3E] hover:underline hover:text-[#89B449] transition-colors"
                  >
                    Tải file mẫu (.xlsx)
                  </button>
                </div>
                <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                
                {!selectedFileInfo ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E7E0C4] rounded-xl p-8 bg-white flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-[#89B449] transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <CloudUpload className="w-6 h-6 text-[#89B449]" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                      Bấm hoặc kéo thả file Excel để tải lên danh sách sinh viên
                    </p>
                    <p className="text-xs text-slate-400">Hỗ trợ định dạng .xlsx, .xls</p>
                  </div>
                ) : (
                  <div className="bg-white border border-[#E7E0C4] rounded-xl p-3 flex items-center justify-between transition-all duration-300">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative">
                        <FileSpreadsheet className="w-10 h-10 text-[#407F3E]" />
                        <span className="absolute -bottom-1 -right-1 bg-white border border-[#407F3E] text-[#407F3E] text-[10px] font-bold px-1 rounded">
                          XLSX
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-sm font-bold text-slate-800 truncate">{selectedFileInfo.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{selectedFileInfo.size}</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs font-bold text-[#407F3E] flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> {uploadedStudents.length} hợp lệ
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleResetFile}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-[#E7E0C4] rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" /> Đổi file
                    </button>
                  </div>
                )}
                {fileError && <p className="text-red-500 text-xs mt-2 font-semibold">{fileError}</p>}
              </div>

              {uploadedStudents.length > 0 && (
                <div className="bg-white border border-[#E7E0C4] rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
                  <div className="px-4 py-3 bg-slate-50 border-b border-[#E7E0C4] flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Xem trước danh sách tải lên</span>
                    <span className="text-xs font-bold text-[#89B449] flex items-center gap-1">
                      <Check className="w-3 h-3" /> {uploadedStudents.length} hợp lệ
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-white shadow-sm z-10">
                        <tr className="bg-white border-b border-slate-100 text-slate-500 font-medium">
                          <th className="px-4 py-3">STT</th>
                          <th className="px-4 py-3">MSSV</th>
                          <th className="px-4 py-3">Họ tên</th>
                          <th className="px-4 py-3">Lớp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                        {uploadedStudents.map((st, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                            <td className="px-4 py-2 text-[#407F3E] font-bold">{st.mssv}</td>
                            <td className="px-4 py-2 text-slate-800">{st.ho_ten}</td>
                            <td className="px-4 py-2">{st.ten_lop}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
              <div className="text-sm font-bold text-[#407F3E]">
                {uploadedStudents.length > 0 ? `Đã tải lên: ${uploadedStudents.length} sinh viên` : 'Chưa tải file'}
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImportingLich(null); }}
                  disabled={isLoadingStudents}
                  className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleImportSubmit(); }}
                  disabled={isLoadingStudents || uploadedStudents.length === 0}
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoadingStudents ? 'Đang tải lên...' : 'Xác nhận tải'}
                  {!isLoadingStudents && <Check className="w-4 h-4" />}
                </button>
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

      {renderDropdownPortal()}
    </div>
  );
}
