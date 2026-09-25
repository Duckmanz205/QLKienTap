import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, ChevronRight, ChevronDown, Check, X, PlusCircle, Folder, Search,
  Edit2, Trash2, Rocket, MoreVertical, Download
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import Toast from '../../components/Toast';
import * as XLSX from 'xlsx';

export default function PlanManagement_Khoa() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [campaigns, setCampaigns] = useState([]);
  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New States for Student Management & Errors
  const [missingStudentsError, setMissingStudentsError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [campaignStudents, setCampaignStudents] = useState([]);

  // Campaign Pagination & Filter States
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignLimit, setCampaignLimit] = useState(15);
  const [campaignTotalPages, setCampaignTotalPages] = useState(1);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [filterNamHoc, setFilterNamHoc] = useState('');
  const [filterHocKy, setFilterHocKy] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');

  // Filter Popover Dropdown States
  const [isNamHocDropdownOpen, setIsNamHocDropdownOpen] = useState(false);
  const [searchNamHocDropdown, setSearchNamHocDropdown] = useState('');
  const [isHocKyDropdownOpen, setIsHocKyDropdownOpen] = useState(false);
  const [searchHocKyDropdown, setSearchHocKyDropdown] = useState('');
  const [isTrangThaiDropdownOpen, setIsTrangThaiDropdownOpen] = useState(false);
  const [searchTrangThaiDropdown, setSearchTrangThaiDropdown] = useState('');

  const closeFilterDropdowns = () => {
    setIsNamHocDropdownOpen(false);
    setIsHocKyDropdownOpen(false);
    setIsTrangThaiDropdownOpen(false);
  };
    
  // Student Pagination & Search State
  const [studentPage, setStudentPage] = useState(1);
  const [studentLimit, setStudentLimit] = useState(15);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [studentTotal, setStudentTotal] = useState(0);

  // Manual Add Student State
  const [newStudentMssv, setNewStudentMssv] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('');
  const [newStudentCourse, setNewStudentCourse] = useState('');
  const [isConfirmReplaceOpen, setIsConfirmReplaceOpen] = useState(false);
  const [pendingExcelData, setPendingExcelData] = useState(null);
  const [pendingExcelFileName, setPendingExcelFileName] = useState('');

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!activeDropdown) return;

    const handleScroll = (e) => {
      // Bỏ qua cuộn trong chính menu (nếu có)
      if (e.target.closest?.('.dropdown-menu-portal')) return;
      setActiveDropdown(null);
    };
    
    const handleClickOutside = (e) => {
      if (e.target.closest?.('.dropdown-trigger') || e.target.closest?.('.dropdown-menu-portal')) return;
      setActiveDropdown(null);
    };
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('click', handleClickOutside, true);
    window.addEventListener('keydown', handleEsc, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('click', handleClickOutside, true);
      window.removeEventListener('keydown', handleEsc, true);
    };
  }, [activeDropdown]);

  const handleDropdownClick = (e, c) => {
    e.stopPropagation();
    if (activeDropdown?.id === c.id) {
      setActiveDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 150;
    
    let top = rect.bottom;
    if (window.innerHeight - rect.bottom < menuHeight) {
      top = rect.top - menuHeight;
    }
    
    setDropdownPos({
      top: top,
      left: rect.right - 192,
    });
    setActiveDropdown(c);
  };

  // Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Delete Confirm State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Delete Student Confirm State
  const [isDeleteStudentConfirmOpen, setIsDeleteStudentConfirmOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState(null);

  // Modal Form States
  const [campaignName, setCampaignName] = useState('');
  const [campaignBD, setCampaignBD] = useState('');
  const [campaignKT, setCampaignKT] = useState('');
  const [importData, setImportData] = useState([]);
  const [fileName, setFileName] = useState('');
  
  // Custom Dropdown for Năm học
  const [selectedYear, setSelectedYear] = useState('');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Custom Dropdown for Học kỳ
  const [selectedTerm, setSelectedTerm] = useState('');
  const [isTermDropdownOpen, setIsTermDropdownOpen] = useState(false);

  // Custom Dropdown for Khóa
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [campaignPage, campaignLimit, searchTerm, filterNamHoc, filterHocKy, filterTrangThai]);

  const fetchCampaigns = async () => {
    try {
      const res = await khoaApi.getCampaigns({
        page: campaignPage,
        limit: campaignLimit,
        search: searchTerm,
        namHoc: filterNamHoc,
        hocKy: filterHocKy,
        trangThai: filterTrangThai
      });
      if (res.data?.data) {
        setCampaigns(res.data.data);
        setCampaignTotal(res.data.total);
        setCampaignTotalPages(res.data.totalPages);
      } else {
        // Fallback if backend hasn't updated yet
        setCampaigns(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [yearsRes, termsRes, coursesRes] = await Promise.all([
        khoaApi.getYears(),
        khoaApi.getTerms(),
        khoaApi.getCourses()
      ]);
      setYears(yearsRes.data);
      setTerms(termsRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setCampaignName('');
    setSelectedYear('');
    setSelectedTerm('');
    setSelectedCourse('');
    setCampaignBD('');
    setCampaignKT('');
    setImportData([]);
    setFileName('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const formattedData = data.map(row => {
        return {
          mssv: String(row['MSSV'] || row['mssv'] || ''),
          ho_ten: String(row['Họ tên'] || row['ho_ten'] || ''),
          email: String(row['Email'] || row['email'] || ''),
          sdt: String(row['SĐT'] || row['sdt'] || ''),
          ten_lop: String(row['Lớp'] || row['ten_lop'] || '').trim(),
          ten_khoa_hoc: String(row['Khóa'] || row['ten_khoa_hoc'] || '').trim(),
        };
      }).filter(r => r.mssv);

      if (isEditMode) {
        setPendingExcelData(formattedData);
        setPendingExcelFileName(file.name);
        setIsConfirmReplaceOpen(true);
      } else {
        setImportData(formattedData);
        setFileName(file.name);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const confirmReplaceStudents = () => {
    setImportData(pendingExcelData);
    setFileName(pendingExcelFileName);
    setIsConfirmReplaceOpen(false);
    setPendingExcelData(null);
    setPendingExcelFileName('');
  };

  const cancelReplaceStudents = () => {
    setIsConfirmReplaceOpen(false);
    setPendingExcelData(null);
    setPendingExcelFileName('');
  };

  const handleSaveCampaign = async () => {
    if (!campaignName || !selectedTerm || !selectedCourse || !campaignBD || !campaignKT) {
      setToast({ show: true, message: 'Vui lòng điền đầy đủ thông tin', type: 'error' });
      return;
    }
    
    try {
      const payload = {
        ten_dot: campaignName,
        hoc_ky_id: parseInt(selectedTerm),
        khoa_hoc_id: parseInt(selectedCourse),
        ngay_bat_dau: campaignBD,
        ngay_ket_thuc: campaignKT,
        danh_sach_sinh_vien: importData.length > 0 ? importData : undefined
      };

      if (isEditMode) {
        await khoaApi.updateCampaign(editingId, payload);
        setToast({ show: true, message: 'Cập nhật đợt kiến tập thành công', type: 'success' });
      } else {
        await khoaApi.createCampaign(payload);
        setToast({ show: true, message: 'Tạo đợt kiến tập thành công', type: 'success' });
      }
      resetForm();
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.missingStudents) {
        setMissingStudentsError({
          message: err.response.data.message || 'Một số sinh viên không tồn tại trong hệ thống.',
          list: err.response.data.missingStudents
        });
        return; // Dừng lại, không show toast, sẽ show modal lỗi
      }

      let errorMsg = 'Lỗi khi lưu đợt kiến tập';
      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMsg = err.response.data.message.join(', ');
        } else {
          errorMsg = err.response.data.message;
        }
      }
      
      // Việt hóa một số lỗi chung của hệ thống
      if (errorMsg.toLowerCase() === 'request entity too large' || err.response?.status === 413) {
        errorMsg = 'Kích thước dữ liệu quá lớn (vượt quá giới hạn cho phép).';
      }

      setToast({ show: true, message: errorMsg, type: 'error' });
    }
  };

  const fetchCampaignStudents = async (campaignId, page = 1, search = '', limit = studentLimit) => {
    try {
      const res = await khoaApi.getCampaignStudents(campaignId, { page, limit, search });
      console.log("getCampaignStudents response:", res.data);
      if (Array.isArray(res.data)) {
        setCampaignStudents(res.data);
        setStudentTotal(res.data.length);
        setStudentPage(1);
        setStudentTotalPages(1);
      } else {
        setCampaignStudents(res.data?.data || []);
        setStudentTotal(res.data?.total || 0);
        setStudentPage(res.data?.page || 1);
        setStudentTotalPages(res.data?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Lỗi tải danh sách sinh viên', type: 'error' });
    }
  };

  const handleEditClick = async (c) => {
    setCampaignName(c.ten_dot);
    setSelectedYear(c.nam_hoc_id || '');
    setSelectedTerm(c.hoc_ky_id || '');
    setSelectedCourse(c.khoa_hoc_id || '');
    setCampaignBD(c.raw_bat_dau);
    setCampaignKT(c.raw_ket_thuc);
    setEditingId(c.id);
    setIsEditMode(true);
    setIsModalOpen(true);
    setActiveTab('info');
    
    setStudentPage(1);
    setStudentSearch('');
    await fetchCampaignStudents(c.id, 1, '');
  };

  const handleViewDetail = async (c) => {
    setViewingDetail(c);
    setStudentPage(1);
    setStudentSearch('');
    await fetchCampaignStudents(c.id, 1, '');
  };

  const handleAddStudent = async () => {
    if (!newStudentMssv || !newStudentName || !newStudentClass || !newStudentCourse) {
      setToast({ show: true, message: 'Vui lòng nhập đầy đủ thông tin (MSSV, Họ tên, Lớp, Khóa)', type: 'error' });
      return;
    }
    try {
      const payload = {
        mssv: newStudentMssv.trim(),
        ho_ten: newStudentName.trim(),
        ten_lop: newStudentClass.trim(),
        khoa_hoc_id: newStudentCourse
      };
      await khoaApi.addStudentToCampaign(editingId, payload);
      setToast({ show: true, message: 'Thêm sinh viên thành công', type: 'success' });
      await fetchCampaignStudents(editingId, studentPage, studentSearch);
      setNewStudentMssv('');
      setNewStudentName('');
      setNewStudentClass('');
      setNewStudentCourse('');
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.response?.data?.message || 'Có lỗi xảy ra khi thêm sinh viên', type: 'error' });
    }
  };

  const handleRemoveStudentClick = (studentId) => {
    setDeletingStudentId(studentId);
    setIsDeleteStudentConfirmOpen(true);
  };

  const confirmRemoveStudent = async () => {
    try {
      await khoaApi.removeStudentFromCampaign(editingId, deletingStudentId);
      setToast({ show: true, message: 'Đã xóa sinh viên khỏi đợt', type: 'success' });
      await fetchCampaignStudents(editingId, studentPage, studentSearch, studentLimit);
      setIsDeleteStudentConfirmOpen(false);
      setDeletingStudentId(null);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.response?.data?.message || 'Có lỗi xảy ra khi xóa sinh viên', type: 'error' });
      setIsDeleteStudentConfirmOpen(false);
      setDeletingStudentId(null);
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await khoaApi.deleteCampaign(deletingId);
      setToast({ show: true, message: 'Xóa đợt kiến tập thành công', type: 'success' });
      setIsDeleteConfirmOpen(false);
      setDeletingId(null);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.response?.data?.message || 'Lỗi khi xóa đợt kiến tập', type: 'error' });
    }
  };

  const handleSendToClub = async (id) => {
    try {
      await khoaApi.updateCampaign(id, { trang_thai: 'DangTrienKhai' });
      setToast({ show: true, message: 'Đã gửi đợt kiến tập cho Câu lạc bộ lập lịch!', type: 'success' });
      fetchCampaigns();
      setActiveDropdown(null);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.response?.data?.message || 'Có lỗi xảy ra khi gửi cho CLB', type: 'error' });
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Nháp':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Nháp</span>;
      case 'Đang triển khai':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white border border-[#89B449]/20 shadow-sm">Đang triển khai</span>;
      case 'Đã kết thúc':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 border border-[#DBD468]/20 shadow-sm">Đã kết thúc</span>;
      case 'Đã khóa':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#407F3E] text-white border border-[#407F3E]/20 shadow-sm">Đã khóa</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  // Mock data mapping to fit the columns perfectly
  const displayData = campaigns.map(c => {
    let rawStatus = c.trang_thai || 'Nhap';
    let displayStatus = 'Nháp';
    if (rawStatus === 'Nhap') displayStatus = 'Nháp';
    else if (rawStatus === 'DangTrienKhai') displayStatus = 'Đang triển khai';
    else if (rawStatus === 'DaKetThuc') displayStatus = 'Đã kết thúc';
    else if (rawStatus === 'DaKhoa') displayStatus = 'Đã khóa';
    else if (rawStatus === 'DaHuy') displayStatus = 'Đã hủy';

    return {
      id: c.id,
      ten_dot: c.ten_dot,
      nam_hoc: c.hocKy?.namHoc?.ten_nam_hoc || 'Đang cập nhật',
      nam_hoc_id: c.hocKy?.namHoc?.id,
      hoc_ky: c.hocKy?.ten_hoc_ky || 'Đang cập nhật',
      hoc_ky_id: c.hocKy?.id,
      tg_bat_dau: c.ngay_bat_dau ? new Date(c.ngay_bat_dau).toLocaleDateString('vi-VN') : 'Đang cập nhật',
      tg_ket_thuc: c.ngay_ket_thuc ? new Date(c.ngay_ket_thuc).toLocaleDateString('vi-VN') : 'Đang cập nhật',
      raw_bat_dau: c.ngay_bat_dau ? c.ngay_bat_dau.split('T')[0] : '',
      raw_ket_thuc: c.ngay_ket_thuc ? c.ngay_ket_thuc.split('T')[0] : '',
      trang_thai: displayStatus,
      raw_trang_thai: rawStatus
    };
  });

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeFilterDropdowns}>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      {/* Header section */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">Đợt kiến tập</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo đợt kiến tập
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-[#E7E0C4] relative z-20">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm đợt..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCampaignPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all font-medium text-slate-700"
            />
          </div>
          
          {/* Năm học Dropdown */}
          <div className="relative min-w-[170px]" onClick={(e) => e.stopPropagation()}>
            <div 
              onClick={() => {
                setIsNamHocDropdownOpen(!isNamHocDropdownOpen);
                setIsHocKyDropdownOpen(false);
                setIsTrangThaiDropdownOpen(false);
              }}
              className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isNamHocDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
            >
              <span className="truncate pr-2 font-medium text-slate-700">
                {filterNamHoc ? (years.find(y => String(y.id) === String(filterNamHoc))?.ten_nam_hoc || 'Năm học') : 'Tất cả năm học'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isNamHocDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                  <input 
                    type="text" 
                    placeholder="Tìm năm học..." 
                    value={searchNamHocDropdown}
                    onChange={(e) => setSearchNamHocDropdown(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div 
                    onClick={() => { setFilterNamHoc(''); setIsNamHocDropdownOpen(false); setSearchNamHocDropdown(''); setCampaignPage(1); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      !filterNamHoc ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                    }`}
                  >
                    <span>Tất cả năm học</span>
                    {!filterNamHoc && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                  </div>
                  {years
                    .filter(y => y.ten_nam_hoc?.toLowerCase().includes(searchNamHocDropdown.toLowerCase()))
                    .map(y => (
                    <div 
                      key={y.id}
                      onClick={() => { setFilterNamHoc(y.id); setIsNamHocDropdownOpen(false); setSearchNamHocDropdown(''); setCampaignPage(1); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        String(filterNamHoc) === String(y.id) ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                      }`}
                    >
                      <span className="truncate pr-2">{y.ten_nam_hoc}</span>
                      {String(filterNamHoc) === String(y.id) && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                  {years.filter(y => y.ten_nam_hoc?.toLowerCase().includes(searchNamHocDropdown.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Học kỳ Dropdown */}
          <div className="relative min-w-[160px]" onClick={(e) => e.stopPropagation()}>
            <div 
              onClick={() => {
                setIsHocKyDropdownOpen(!isHocKyDropdownOpen);
                setIsNamHocDropdownOpen(false);
                setIsTrangThaiDropdownOpen(false);
              }}
              className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isHocKyDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
            >
              <span className="truncate pr-2 font-medium text-slate-700">
                {filterHocKy ? (terms.find(t => String(t.id) === String(filterHocKy))?.ten_hoc_ky || 'Học kỳ') : 'Tất cả học kỳ'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isHocKyDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                  <input 
                    type="text" 
                    placeholder="Tìm học kỳ..." 
                    value={searchHocKyDropdown}
                    onChange={(e) => setSearchHocKyDropdown(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div 
                    onClick={() => { setFilterHocKy(''); setIsHocKyDropdownOpen(false); setSearchHocKyDropdown(''); setCampaignPage(1); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      !filterHocKy ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                    }`}
                  >
                    <span>Tất cả học kỳ</span>
                    {!filterHocKy && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                  </div>
                  {terms
                    .filter(t => t.ten_hoc_ky?.toLowerCase().includes(searchHocKyDropdown.toLowerCase()))
                    .map(t => (
                    <div 
                      key={t.id}
                      onClick={() => { setFilterHocKy(t.id); setIsHocKyDropdownOpen(false); setSearchHocKyDropdown(''); setCampaignPage(1); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        String(filterHocKy) === String(t.id) ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                      }`}
                    >
                      <span className="truncate pr-2">{t.ten_hoc_ky}</span>
                      {String(filterHocKy) === String(t.id) && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                  {terms.filter(t => t.ten_hoc_ky?.toLowerCase().includes(searchHocKyDropdown.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Trạng thái Dropdown */}
          <div className="relative min-w-[170px]" onClick={(e) => e.stopPropagation()}>
            <div 
              onClick={() => {
                setIsTrangThaiDropdownOpen(!isTrangThaiDropdownOpen);
                setIsNamHocDropdownOpen(false);
                setIsHocKyDropdownOpen(false);
              }}
              className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isTrangThaiDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
            >
              <span className="truncate pr-2 font-medium text-slate-700">
                {filterTrangThai === '' ? 'Tất cả trạng thái' : 
                 filterTrangThai === 'Nhap' ? 'Nháp' :
                 filterTrangThai === 'DangTrienKhai' ? 'Đang triển khai' :
                 filterTrangThai === 'DaKetThuc' ? 'Đã kết thúc' :
                 filterTrangThai === 'DaKhoa' ? 'Đã khóa' :
                 filterTrangThai === 'DaHuy' ? 'Đã hủy' : filterTrangThai}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isTrangThaiDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                  <input 
                    type="text" 
                    placeholder="Tìm trạng thái..." 
                    value={searchTrangThaiDropdown}
                    onChange={(e) => setSearchTrangThaiDropdown(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {[
                    { value: '', label: 'Tất cả trạng thái' },
                    { value: 'Nhap', label: 'Nháp' },
                    { value: 'DangTrienKhai', label: 'Đang triển khai' },
                    { value: 'DaKetThuc', label: 'Đã kết thúc' },
                    { value: 'DaKhoa', label: 'Đã khóa' },
                    { value: 'DaHuy', label: 'Đã hủy' }
                  ]
                    .filter(opt => !searchTrangThaiDropdown || opt.label.toLowerCase().includes(searchTrangThaiDropdown.toLowerCase()))
                    .map(opt => (
                      <div 
                        key={opt.value}
                        onClick={() => { 
                          setFilterTrangThai(opt.value); 
                          setIsTrangThaiDropdownOpen(false); 
                          setSearchTrangThaiDropdown('');
                          setCampaignPage(1); 
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                          filterTrangThai === opt.value ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {filterTrangThai === opt.value && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                      </div>
                    ))}
                  {[
                    { value: '', label: 'Tất cả trạng thái' },
                    { value: 'Nhap', label: 'Nháp' },
                    { value: 'DangTrienKhai', label: 'Đang triển khai' },
                    { value: 'DaKetThuc', label: 'Đã kết thúc' },
                    { value: 'DaKhoa', label: 'Đã khóa' },
                    { value: 'DaHuy', label: 'Đã hủy' }
                  ].filter(opt => !searchTrangThaiDropdown || opt.label.toLowerCase().includes(searchTrangThaiDropdown.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">Tên đợt</th>
                <th className="p-4">Năm học</th>
                <th className="p-4">Học kỳ</th>
                <th className="p-4">Ngày bắt đầu</th>
                <th className="p-4">Ngày kết thúc</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">Không có đợt kiến tập nào.</td>
                </tr>
              ) : (
                displayData.map(c => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => handleViewDetail(c)}
                  >
                    <td className="p-4 pl-6 font-bold text-slate-800">{c.ten_dot}</td>
                    <td className="p-4 font-medium text-slate-600">{c.nam_hoc}</td>
                    <td className="p-4 font-medium text-slate-600">{c.hoc_ky}</td>
                    <td className="p-4 font-medium text-slate-600">{c.tg_bat_dau}</td>
                    <td className="p-4 font-medium text-slate-600">{c.tg_ket_thuc}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(c.trang_thai)}
                    </td>
                    <td className="p-4 text-right pr-6 relative" onClick={(e) => e.stopPropagation()}>
                      {c.raw_trang_thai === 'Nhap' ? (
                        <button 
                          onClick={(e) => handleDropdownClick(e, c)}
                          className="dropdown-trigger p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      ) : (
                        <div className="w-8 h-8 inline-block"></div> // Placeholder for alignment
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-xl">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span>Hiển thị</span>
              <select
                value={campaignLimit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setCampaignLimit(newLimit);
                  setCampaignPage(1);
                }}
                className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>/ {campaignTotal} đợt</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={campaignPage === 1}
                onClick={() => setCampaignPage(1)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trang đầu
              </button>
              <button
                disabled={campaignPage === 1}
                onClick={() => setCampaignPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trước
              </button>
              <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                Trang {campaignPage} / {campaignTotalPages}
              </span>
              <button
                disabled={campaignPage === campaignTotalPages}
                onClick={() => setCampaignPage(p => Math.min(campaignTotalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Sau
              </button>
              <button
                disabled={campaignPage === campaignTotalPages}
                onClick={() => setCampaignPage(campaignTotalPages)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trang cuối
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Mockup - "+ Tạo đợt kiến tập" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dimmed Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {isEditMode ? <Edit2 className="w-5 h-5 text-[#407F3E]" /> : <Plus className="w-5 h-5 text-[#407F3E]" />}
                {isEditMode ? 'Sửa đợt kiến tập' : 'Tạo đợt kiến tập'}
              </h2>
              <button 
                onClick={resetForm}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isEditMode && (
              <div className="flex px-6 pt-3 border-b border-slate-100 gap-6">
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'info' ? 'text-[#407F3E] border-b-2 border-[#407F3E]' : 'text-slate-400 hover:text-slate-600'}`}
                >Thông tin đợt</button>
                <button 
                  onClick={() => setActiveTab('students')}
                  className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'students' ? 'text-[#407F3E] border-b-2 border-[#407F3E]' : 'text-slate-400 hover:text-slate-600'}`}
                >Danh sách sinh viên</button>
              </div>
            )}

            {/* Modal Body */}
            <div className={`p-6 space-y-5 overflow-y-auto max-h-[60vh] ${(!isEditMode || activeTab === 'info') ? 'block' : 'hidden'}`}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tên đợt</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Đợt kiến tập - Học kỳ 1 - 2025-2026"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Năm học custom dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Năm học</label>
                  <div 
                    onClick={() => { setIsYearDropdownOpen(!isYearDropdownOpen); setIsTermDropdownOpen(false); setIsCourseDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isYearDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium truncate ${selectedYear ? 'text-slate-800' : 'text-slate-400'}`}>
                      {years.find(y => y.id === selectedYear)?.ten_nam_hoc || 'Chọn năm học'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                  </div>
                  {isYearDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
                      {years.map(opt => (
                        <div 
                          key={opt.id}
                          onClick={() => { setSelectedYear(opt.id); setIsYearDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            (selectedYear === opt.id) 
                              ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                              : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                        >
                          {opt.ten_nam_hoc}
                          {selectedYear === opt.id && <Check className="w-4 h-4 text-[#407F3E]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Học kỳ custom dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Học kỳ</label>
                  <div 
                    onClick={() => { setIsTermDropdownOpen(!isTermDropdownOpen); setIsYearDropdownOpen(false); setIsCourseDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isTermDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium truncate ${selectedTerm ? 'text-slate-800' : 'text-slate-400'}`}>
                      {terms.find(t => t.id === selectedTerm)?.ten_hoc_ky || 'Chọn học kỳ'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                  </div>
                  {isTermDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
                      {terms.map(opt => (
                        <div 
                          key={opt.id}
                          onClick={() => { setSelectedTerm(opt.id); setIsTermDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            (selectedTerm === opt.id) 
                              ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                              : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                        >
                          {opt.ten_hoc_ky}
                          {selectedTerm === opt.id && <Check className="w-4 h-4 text-[#407F3E]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Khóa custom dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Khóa</label>
                  <div 
                    onClick={() => { setIsCourseDropdownOpen(!isCourseDropdownOpen); setIsTermDropdownOpen(false); setIsYearDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isCourseDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium truncate ${selectedCourse ? 'text-slate-800' : 'text-slate-400'}`}>
                      {courses.find(c => c.id === selectedCourse)?.ten_khoa_hoc || 'Chọn khóa'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                  </div>
                  {isCourseDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 max-h-60 overflow-y-auto">
                      {courses.map(opt => (
                        <div 
                          key={opt.id}
                          onClick={() => { setSelectedCourse(opt.id); setIsCourseDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            (selectedCourse === opt.id) 
                              ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                              : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                        >
                          {opt.ten_khoa_hoc}
                          {selectedCourse === opt.id && <Check className="w-4 h-4 text-[#407F3E]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={campaignBD}
                    onChange={(e) => setCampaignBD(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={campaignKT}
                    onChange={(e) => setCampaignKT(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* Upload danh sách sinh viên */}
              {!isEditMode && (
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <span>Danh sách sinh viên ưu tiên (Excel)</span>
                    <a href="/Mau_DanhSachSinhVien.xlsx" download className="text-[#407F3E] hover:underline normal-case font-medium flex items-center gap-1">
                      <Download className="w-3 h-3"/> Tải file mẫu
                    </a>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#E7E0C4] hover:border-[#407F3E] hover:bg-slate-50 transition-colors rounded-xl cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Folder className="w-6 h-6 text-slate-400 mb-2" />
                      <p className="mb-1 text-sm text-slate-500 font-medium">
                        {fileName ? fileName : <><span className="font-bold text-[#407F3E]">Nhấn để tải lên</span> hoặc kéo thả file</>}
                      </p>
                      <p className="text-xs text-slate-400">{importData.length > 0 ? `Đã nhận diện ${importData.length} sinh viên` : 'Chỉ hỗ trợ file .xlsx, .xls'}</p>
                    </div>
                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                  </label>
                </div>
              )}
              
            </div>

            {isEditMode && activeTab === 'students' && (
              <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh] block">
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <span>Import đè danh sách mới (Excel)</span>
                    <a href="/Mau_DanhSachSinhVien.xlsx" download className="text-[#407F3E] hover:underline normal-case font-medium flex items-center gap-1">
                      <Download className="w-3 h-3"/> Tải file mẫu
                    </a>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-[#E7E0C4] hover:border-[#407F3E] hover:bg-slate-50 transition-colors rounded-xl cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                      <Folder className="w-5 h-5 text-slate-400 mb-1" />
                      <p className="mb-1 text-sm text-slate-500 font-medium">
                        {fileName ? fileName : <><span className="font-bold text-[#407F3E]">Nhấn để tải lên</span> danh sách mới (sẽ xóa DS cũ)</>}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Thêm sinh viên thủ công</label>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <input
                      type="text"
                      placeholder="MSSV..."
                      value={newStudentMssv}
                      onChange={(e) => setNewStudentMssv(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                    />
                    <input
                      type="text"
                      placeholder="Họ tên..."
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                    />
                    <input
                      type="text"
                      placeholder="Lớp..."
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newStudentCourse}
                        onChange={(e) => setNewStudentCourse(e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] cursor-pointer appearance-none"
                      >
                        <option value="">Chọn khóa...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.ten_khoa_hoc}</option>)}
                      </select>
                      <button 
                        onClick={handleAddStudent}
                        className="px-4 py-2 bg-[#407F3E] text-white rounded-xl text-sm font-bold hover:bg-[#407F3E]/90 transition-colors"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Danh sách sinh viên hiện tại ({studentTotal})
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Tìm MSSV/Họ tên..." 
                        value={studentSearch}
                        onChange={(e) => {
                          setStudentSearch(e.target.value);
                          fetchCampaignStudents(editingId, 1, e.target.value);
                        }}
                        className="pl-9 pr-4 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                      />
                    </div>
                  </div>
                  {campaignStudents.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <tr>
                            <th className="px-4 py-2 w-32">MSSV</th>
                            <th className="px-4 py-2">Họ tên</th>
                            <th className="px-4 py-2 w-32">Lớp</th>
                            <th className="px-4 py-2 w-32">Khóa</th>
                            <th className="px-4 py-2 text-center w-16">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {campaignStudents.map(cs => (
                            <tr key={cs.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2">{cs.sinhVien?.mssv}</td>
                              <td className="px-4 py-2 font-medium">{cs.sinhVien?.ho_ten}</td>
                              <td className="px-4 py-2">{cs.sinhVien?.ten_lop || '-'}</td>
                              <td className="px-4 py-2">{cs.sinhVien?.khoaHoc?.ten_khoa_hoc || '-'}</td>
                              <td className="px-4 py-2 text-center">
                                <button 
                                  onClick={() => handleRemoveStudentClick(cs.sinh_vien_id)}
                                  className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {studentTotalPages > 1 && (
                        <div className="p-3 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span>Hiển thị</span>
                            <select
                              value={studentLimit}
                              onChange={(e) => {
                                const newLimit = Number(e.target.value);
                                setStudentLimit(newLimit);
                                fetchCampaignStudents(editingId, 1, studentSearch, newLimit);
                              }}
                              className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm text-xs"
                            >
                              <option value="15">15</option>
                              <option value="30">30</option>
                              <option value="50">50</option>
                              <option value="100">100</option>
                            </select>
                            <span>/ {studentTotal} sinh viên</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              disabled={studentPage === 1}
                              onClick={() => fetchCampaignStudents(editingId, 1, studentSearch)}
                              className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Trang đầu
                            </button>
                            <button
                              disabled={studentPage === 1}
                              onClick={() => fetchCampaignStudents(editingId, studentPage - 1, studentSearch)}
                              className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Trước
                            </button>
                            <span className="px-3 py-1 rounded-lg bg-[#407F3E] text-white text-xs font-bold shadow-sm cursor-default mx-0.5">
                              Trang {studentPage} / {studentTotalPages}
                            </span>
                            <button
                              disabled={studentPage === studentTotalPages}
                              onClick={() => fetchCampaignStudents(editingId, studentPage + 1, studentSearch)}
                              className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Sau
                            </button>
                            <button
                              disabled={studentPage === studentTotalPages}
                              onClick={() => fetchCampaignStudents(editingId, studentTotalPages, studentSearch)}
                              className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Trang cuối
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-slate-50 rounded-xl text-slate-500 text-sm">
                      Không tìm thấy sinh viên nào.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={resetForm}
                className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveCampaign}
                className="px-5 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Xem chi tiết */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
          ></div>
          
          <div 
            className="bg-white w-full max-w-5xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Chi tiết
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
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                {Object.entries({
                  'Tên đợt': viewingDetail.ten_dot,
                  'Năm học': viewingDetail.nam_hoc,
                  'Học kỳ': viewingDetail.hoc_ky,
                  'Ngày bắt đầu': viewingDetail.tg_bat_dau,
                  'Ngày kết thúc': viewingDetail.tg_ket_thuc,
                  'Trạng thái': viewingDetail.trang_thai,
                }).map(([label, value]) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
                    <span className="text-sm font-medium text-slate-800 break-words">{String(value)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Danh sách sinh viên ưu tiên ({studentTotal})
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Tìm MSSV/Họ tên..." 
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        fetchCampaignStudents(viewingDetail.id, 1, e.target.value);
                      }}
                      className="pl-9 pr-4 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                    />
                  </div>
                </div>
                {campaignStudents.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="px-4 py-2 w-32">MSSV</th>
                          <th className="px-4 py-2">Họ tên</th>
                          <th className="px-4 py-2 w-32">Lớp</th>
                          <th className="px-4 py-2 w-32">Khóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {campaignStudents.map(cs => (
                          <tr key={cs.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-medium">{cs.sinhVien?.mssv}</td>
                            <td className="px-4 py-2 text-slate-700">{cs.sinhVien?.ho_ten}</td>
                            <td className="px-4 py-2 text-slate-700">{cs.sinhVien?.ten_lop || '-'}</td>
                            <td className="px-4 py-2 text-slate-700">{cs.sinhVien?.khoaHoc?.ten_khoa_hoc || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {studentTotalPages > 1 && (
                      <div className="p-3 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span>Hiển thị</span>
                          <select
                            value={studentLimit}
                            onChange={(e) => {
                              const newLimit = Number(e.target.value);
                              setStudentLimit(newLimit);
                              fetchCampaignStudents(viewingDetail.id, 1, studentSearch, newLimit);
                            }}
                            className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm text-xs"
                          >
                            <option value="15">15</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </select>
                          <span>/ {studentTotal} sinh viên</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            disabled={studentPage === 1}
                            onClick={() => fetchCampaignStudents(viewingDetail.id, 1, studentSearch)}
                            className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Trang đầu
                          </button>
                          <button
                            disabled={studentPage === 1}
                            onClick={() => fetchCampaignStudents(viewingDetail.id, studentPage - 1, studentSearch)}
                            className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Trước
                          </button>
                          <span className="px-3 py-1 rounded-lg bg-[#407F3E] text-white text-xs font-bold shadow-sm cursor-default mx-0.5">
                            Trang {studentPage} / {studentTotalPages}
                          </span>
                          <button
                            disabled={studentPage === studentTotalPages}
                            onClick={() => fetchCampaignStudents(viewingDetail.id, studentPage + 1, studentSearch)}
                            className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Sau
                          </button>
                          <button
                            disabled={studentPage === studentTotalPages}
                            onClick={() => fetchCampaignStudents(viewingDetail.id, studentTotalPages, studentSearch)}
                            className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Trang cuối
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-50 rounded-xl text-slate-500 text-sm">
                    Không tìm thấy sinh viên nào.
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end rounded-b-2xl">
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

      {/* Delete Campaign Confirm Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setIsDeleteConfirmOpen(false)}></div>
          <div className="bg-white p-6 rounded-2xl shadow-xl z-10 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Xóa đợt kiến tập</h3>
            <p className="text-sm text-slate-600 mb-6">Bạn có chắc chắn muốn xóa đợt kiến tập này? Thao tác này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold cursor-pointer">Hủy</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold cursor-pointer">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Confirm Modal */}
      {isDeleteStudentConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setIsDeleteStudentConfirmOpen(false)}></div>
          <div className="bg-white p-6 rounded-2xl shadow-xl z-10 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Xóa sinh viên</h3>
            <p className="text-sm text-slate-600 mb-6">Bạn có chắc chắn muốn xóa sinh viên này khỏi đợt? Thao tác này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteStudentConfirmOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold cursor-pointer">Hủy</button>
              <button onClick={confirmRemoveStudent} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold cursor-pointer">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Replace Students Modal */}
      {isConfirmReplaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={cancelReplaceStudents}></div>
          <div className="bg-white p-6 rounded-2xl shadow-xl z-10 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận ghi đè danh sách</h3>
            <p className="text-sm text-slate-600 mb-6">
              Bạn đang tải lên danh sách gồm <b>{pendingExcelData?.length}</b> sinh viên từ file <b>{pendingExcelFileName}</b>.
              <br/><br/>
              Hành động này sẽ <b>xóa sạch</b> danh sách sinh viên hiện tại của đợt này và thay bằng danh sách mới khi bạn bấm Lưu. Bạn có chắc chắn muốn tiếp tục?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelReplaceStudents} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold">Hủy bỏ</button>
              <button onClick={confirmReplaceStudents} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-bold">Đồng ý</button>
            </div>
          </div>
        </div>
      )}

      {/* Missing Students Error Modal */}
      {missingStudentsError && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"></div>
          <div className="bg-white p-6 rounded-2xl shadow-xl z-10 max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Lỗi Import Sinh Viên</h3>
                <p className="text-sm text-slate-600">{missingStudentsError.message}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-[200px] border border-slate-200 rounded-xl mb-6">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                  <tr>
                    <th className="px-4 py-3">MSSV</th>
                    <th className="px-4 py-3">Họ Tên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {missingStudentsError.list.map((sv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-red-600">{sv.mssv}</td>
                      <td className="px-4 py-2 text-slate-700">{sv.ho_ten || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button 
                onClick={() => setMissingStudentsError(null)} 
                className="px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 font-bold transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Portal Dropdown Menu */}
      {activeDropdown && createPortal(
        <div 
          className="dropdown-menu-portal fixed w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {activeDropdown?.raw_trang_thai === 'Nhap' && (
            <button 
              onClick={() => { handleSendToClub(activeDropdown.id); }} 
              className="flex items-center w-full px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors border-b border-slate-100 cursor-pointer"
            >
              <Rocket className="w-4 h-4 mr-3 text-green-500" /> Gửi CLB lên lịch
            </button>
          )}

          <button 
            onClick={() => { handleEditClick(activeDropdown); setActiveDropdown(null); }} 
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4 mr-3 text-blue-500" /> Sửa
          </button>

          <button 
            onClick={() => { handleDeleteClick(activeDropdown.id); setActiveDropdown(null); }} 
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-3 text-red-500" /> Xóa
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
