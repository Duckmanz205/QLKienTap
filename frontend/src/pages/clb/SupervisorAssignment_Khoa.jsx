import toast from 'react-hot-toast';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronDown, Check, Info, Search, UserCircle, UserPlus, RefreshCw, AlertCircle, X, Users, Calendar, Download
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import { exportPhanCongGVHD } from '../../utils/exportExcel';

export default function SupervisorAssignment_Khoa() {
  const [campaigns, setCampaigns] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Filter States
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const [selectAll, setSelectAll] = useState(false);
  
  // Specific inline dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState('down');
  const [searchLecturerTerm, setSearchLecturerTerm] = useState('');

  // Bulk Assign States
  const [selectedBatchLecturer, setSelectedBatchLecturer] = useState('');
  const [loadingBatchAssign, setLoadingBatchAssign] = useState(false);

  // Auto Assign Modal States
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
  const [autoAssignPreview, setAutoAssignPreview] = useState(null);
  const [loadingAutoAssign, setLoadingAutoAssign] = useState(false);
  const [autoAssignSearch, setAutoAssignSearch] = useState('');

  // Confirm Dialog State for Export Excel
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const showConfirm = (title, message, onConfirm) => setConfirmDialog({ isOpen: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    if (!openDropdownId) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.inline-assign-dropdown') && !e.target.closest('.assign-btn')) {
        setOpenDropdownId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenDropdownId(null);
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdownId]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchEnrollments();
    } else {
      setEnrollments([]);
    }
  }, [selectedCampaign]);

  const fetchInitialData = async () => {
    try {
      const [campRes, lecRes] = await Promise.allSettled([
        khoaApi.getCampaigns({ limit: 100 }),
        khoaApi.getLecturers()
      ]);

      const camps = campRes.status === 'fulfilled' ? (campRes.value.data?.data || campRes.value.data || []) : [];
      const lecs = lecRes.status === 'fulfilled' ? (lecRes.value.data?.data || lecRes.value.data || []) : [];

      setCampaigns(camps);
      setLecturers(lecs);

      if (camps.length > 0) {
        setSelectedCampaign(camps[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu ban đầu:', err);
      toast.error('Không thể tải danh sách đợt kiến tập');
    }
  };

  // Format options cho dropdown Đợt kiến tập với phụ đề học kỳ & năm học
  const campaignOptions = useMemo(() => {
    return campaigns.map(c => {
      const hocKyText = c.hocKy?.ten_hoc_ky || '';
      const namHocText = c.hocKy?.namHoc?.ten_nam_hoc ? ` (${c.hocKy.namHoc.ten_nam_hoc})` : '';
      const hocKyFull = hocKyText ? `${hocKyText}${namHocText}` : '';
      const rawKhoa = c.khoaHoc?.ten_khoa_hoc || c.khoaHoc?.ma_khoa_hoc || '';
      const khoaText = rawKhoa
        ? (rawKhoa.toLowerCase().includes('khóa') ? rawKhoa : `Khóa ${rawKhoa}`)
        : '';
      const subLabel = [hocKyFull, khoaText].filter(Boolean).join(' • ');
      return {
        value: c.id,
        label: c.ten_dot,
        subLabel: subLabel
      };
    });
  }, [campaigns]);

  // Tự động đồng bộ đợt kiến tập khi danh sách đợt thay đổi
  useEffect(() => {
    if (campaigns.length > 0) {
      const stillExists = campaigns.some(c => c.id === Number(selectedCampaign));
      if (!stillExists) {
        setSelectedCampaign(campaigns[0].id);
        setCurrentPage(1);
      }
    } else {
      setSelectedCampaign('');
      setEnrollments([]);
    }
  }, [campaigns]);

  const fetchEnrollments = async () => {
    if (!selectedCampaign) return;
    setLoading(true);
    try {
      const res = await khoaApi.getEnrollments({ dotKienTapId: selectedCampaign, limit: 10000 });
      const enrolls = res.data?.data || res.data || [];
      setEnrollments(enrolls.map(e => ({ ...e, checked: false })));
      setSelectAll(false);
    } catch (err) {
      console.error('Lỗi tải danh sách sinh viên:', err);
      toast.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  // Phân công 1 sinh viên (sửa chuẩn DTO: lichKienTapSinhVienId, lecturerId)
  const handleAssign = async (enrollmentId, gvId) => {
    try {
      await khoaApi.assignGvhd({ 
        lichKienTapSinhVienId: Number(enrollmentId), 
        lecturerId: Number(gvId) 
      });
      toast.success('Phân công GVHD thành công');
      fetchEnrollments();
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Lỗi phân công GVHD:', err);
      const errMsg = err.response?.data?.message || 'Lỗi phân công GVHD';
      toast.error(errMsg);
    }
  };

  // Phân công hàng loạt cho các SV đã chọn
  const handleBatchAssign = async () => {
    const selectedIds = enrollments.filter(e => e.checked).map(e => e.id);
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sinh viên');
      return;
    }
    if (!selectedBatchLecturer) {
      toast.error('Vui lòng chọn Giảng viên hướng dẫn');
      return;
    }

    setLoadingBatchAssign(true);
    try {
      const res = await khoaApi.batchAssignGvhd({
        dotKienTapSinhVienIds: selectedIds,
        lecturerId: Number(selectedBatchLecturer)
      });
      const { success, failed } = res.data || {};
      if (failed && failed.length > 0) {
        toast.success(`Phân công thành công ${success} sinh viên, thất bại ${failed.length}`);
      } else {
        toast.success(`Phân công thành công cho ${success || selectedIds.length} sinh viên`);
      }
      setSelectedBatchLecturer('');
      fetchEnrollments();
    } catch (err) {
      console.error('Lỗi phân công hàng loạt:', err);
      const errMsg = err.response?.data?.message || 'Lỗi khi phân công hàng loạt';
      toast.error(errMsg);
    } finally {
      setLoadingBatchAssign(false);
    }
  };

  // Xem trước phân công tự động
  const handlePreviewAutoAssign = async () => {
    if (!selectedCampaign) {
      toast.error('Vui lòng chọn Đợt kiến tập');
      return;
    }
    setLoadingAutoAssign(true);
    try {
      const res = await khoaApi.previewAutoAssignGvhd({ dotKienTapId: Number(selectedCampaign) });
      setAutoAssignPreview(res.data);
      setAutoAssignSearch('');
      setIsAutoAssignModalOpen(true);
    } catch (err) {
      console.error('Lỗi xem trước phân công tự động:', err);
      toast.error(err.response?.data?.message || 'Lỗi xem trước phân công tự động');
    } finally {
      setLoadingAutoAssign(false);
    }
  };

  // Xác nhận lưu phân công tự động
  const handleConfirmAutoAssign = async () => {
    if (!autoAssignPreview || !autoAssignPreview.assignments || autoAssignPreview.assignments.length === 0) {
      toast.error('Không có phân công nào để xác nhận');
      return;
    }
    setLoadingAutoAssign(true);
    try {
      const res = await khoaApi.confirmAutoAssignGvhd({
        assignments: autoAssignPreview.assignments.map(a => ({
          dotKienTapSinhVienId: a.dotKienTapSinhVienId,
          lecturerId: a.lecturerId
        }))
      });
      const { success, failed } = res.data || {};
      if (failed && failed.length > 0) {
        toast.success(`Đã tự động phân công ${success} sinh viên, thất bại ${failed.length}`);
      } else {
        toast.success(`Tự động phân công thành công cho ${success || autoAssignPreview.assignments.length} sinh viên`);
      }
      setIsAutoAssignModalOpen(false);
      setAutoAssignPreview(null);
      fetchEnrollments();
    } catch (err) {
      console.error('Lỗi xác nhận phân công tự động:', err);
      toast.error(err.response?.data?.message || 'Lỗi xác nhận phân công tự động');
    } finally {
      setLoadingAutoAssign(false);
    }
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setEnrollments(enrollments.map(e => ({ ...e, checked: newValue })));
  };

  const toggleSelect = (id) => {
    setEnrollments(enrollments.map(e => e.id === id ? { ...e, checked: !e.checked } : e));
  };

  const toggleInlineDropdown = (e, id) => {
    e.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setSearchLecturerTerm('');
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownPosition(spaceBelow < 330 ? 'up' : 'down');
      setOpenDropdownId(id);
      setSearchLecturerTerm('');
    }
  };

  const classList = Array.from(new Set(enrollments.map(e => e.sinhVien?.ten_lop).filter(Boolean)));

  const filteredEnrollments = enrollments.filter(e => {
    const sv = e.sinhVien || {};
    const currentAdvisor = sv.details?.giangVienHuongDan?.ho_ten || e.giangVienHuongDan?.ho_ten || e.gvhd;

    if (selectedStatus === 'Đã phân công' && !currentAdvisor) return false;
    if (selectedStatus === 'Chưa phân công' && currentAdvisor) return false;
    if (selectedClass && sv.ten_lop !== selectedClass) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchMssv = sv.mssv?.toLowerCase().includes(term);
      const matchName = sv.ho_ten?.toLowerCase().includes(term);
      const matchClass = sv.ten_lop?.toLowerCase().includes(term);
      const matchAdvisor = currentAdvisor?.toLowerCase().includes(term);
      if (!matchMssv && !matchName && !matchClass && !matchAdvisor) return false;
    }
    return true;
  });

  const selectedCount = enrollments.filter(e => e.checked).length;
  const rawTotalStudents = enrollments.length;
  const rawAssignedStudents = enrollments.filter(e => e.sinhVien?.details?.giangVienHuongDan || e.giangVienHuongDan || e.gvhd).length;
  const rawUnassignedStudents = rawTotalStudents - rawAssignedStudents;

  const executeExportExcel = () => {
    const currentCampaign = campaigns.find(c => c.id === Number(selectedCampaign));
    const listToExport = filteredEnrollments.length > 0 ? filteredEnrollments : enrollments;
    exportPhanCongGVHD(listToExport, currentCampaign?.ten_dot || '');
    toast.success(`Đã xuất danh sách ${listToExport.length} sinh viên phân công GVHD thành công!`);
  };

  const handleExportClick = () => {
    if (enrollments.length === 0) {
      toast.error('Không có dữ liệu sinh viên để xuất danh sách');
      return;
    }

    if (rawUnassignedStudents > 0) {
      showConfirm(
        'Chưa hoàn tất phân công GVHD',
        `Hiện còn ${rawUnassignedStudents}/${rawTotalStudents} sinh viên chưa được phân công Giảng viên Hướng dẫn. Bạn có chắc chắn muốn xuất danh sách không?`,
        () => executeExportExcel()
      );
      return;
    }

    executeExportExcel();
  };

  const totalItems = filteredEnrollments.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages) || 1;
  const paginatedEnrollments = filteredEnrollments.slice((validCurrentPage - 1) * limit, validCurrentPage * limit);

  const statusOptions = ['Tất cả', 'Đã phân công', 'Chưa phân công'];

  const filteredLecturers = lecturers.filter(gv => 
    gv.ho_ten?.toLowerCase().includes(searchLecturerTerm.toLowerCase()) ||
    gv.ma_gv?.toLowerCase().includes(searchLecturerTerm.toLowerCase())
  );

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 sm:p-6 animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Phân công Giảng viên Hướng dẫn</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Gán và quản lý giảng viên hướng dẫn bài thu hoạch / đồ án kiến tập cho sinh viên
          </p>
        </div>

        {/* Nút Xuất danh sách & Phân công tự động */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportClick}
            disabled={enrollments.length === 0}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
              enrollments.length === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-white border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E] hover:text-white shadow-sm'
            }`}
            title="Xuất file Excel danh sách phân công GVHD"
          >
            <Download className="w-4 h-4" />
            Xuất danh sách
          </button>
          <button 
            onClick={handlePreviewAutoAssign}
            disabled={rawUnassignedStudents === 0 || loadingAutoAssign || !selectedCampaign}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
              rawUnassignedStudents === 0 || loadingAutoAssign || !selectedCampaign
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-[#407F3E] text-white hover:bg-[#2b5829] shadow-md hover:shadow-lg cursor-pointer'
            }`}
          >
            {loadingAutoAssign ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Phân công tự động ({rawUnassignedStudents} SV chưa gán)
          </button>
        </div>
      </div>

      {/* Filter Bar: Đợt kiến tập + Tìm kiếm + Bộ lọc lớp/trạng thái */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-center gap-3 relative z-20 mb-6">
        
        {/* Đợt kiến tập Dropdown */}
        <div className="min-w-[280px] sm:min-w-[320px]">
          <SearchableDropdown
            options={campaignOptions}
            value={selectedCampaign}
            onChange={(val) => {
              setSelectedCampaign(val);
              setCurrentPage(1);
            }}
            placeholder={campaignOptions.length === 0 ? "Không có đợt kiến tập" : "Chọn đợt kiến tập..."}
            searchPlaceholder="Tìm đợt kiến tập..."
            className="w-full"
          />
        </div>

        {/* Tìm kiếm */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo MSSV, Họ tên, Lớp, GVHD..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
          />
        </div>

        {/* Lớp Dropdown */}
        <div className="min-w-[150px]">
          <SearchableDropdown
            options={[
              { value: '', label: 'Tất cả lớp' },
              ...classList.map(cls => ({ value: cls, label: cls }))
            ]}
            value={selectedClass}
            onChange={(val) => {
              setSelectedClass(val);
              setCurrentPage(1);
            }}
            placeholder="Tất cả lớp"
            searchPlaceholder="Tìm lớp..."
            className="w-full"
          />
        </div>

        {/* Trạng thái Dropdown */}
        <div className="min-w-[170px]">
          <SearchableDropdown
            options={statusOptions.map(opt => ({
              value: opt === 'Tất cả' ? '' : opt,
              label: opt
            }))}
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            }}
            placeholder="Tất cả trạng thái"
            searchPlaceholder="Tìm trạng thái..."
            className="w-full"
          />
        </div>
      </div>

      {/* Bulk Action Bar (Đã sửa lỗi thẻ đóng div thừa và kích hoạt tính năng Phân công hàng loạt) */}
      <div className={`border border-[#E7E0C4] rounded-t-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        selectedCount > 0 ? 'bg-[#89B449]/15 border-[#89B449]' : 'bg-[#E7E0C4]/40'
      }`}>
        <div className="flex items-center gap-2 pl-2">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer"
            checked={selectAll}
            onChange={toggleSelectAll}
          />
          <span className="text-sm font-bold text-slate-700">Chọn tất cả</span>
          {selectedCount > 0 && (
            <span className="text-xs font-black bg-[#407F3E] text-white px-2 py-0.5 rounded-full shadow-sm ml-1">
              Đã chọn: {selectedCount}
            </span>
          )}
        </div>

        {/* Khu vực phân công hàng loạt */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="min-w-[220px]">
            <SearchableDropdown
              options={lecturers.map(gv => ({
                value: gv.id,
                label: `${gv.ho_ten} (${gv.ma_gv})`
              }))}
              value={selectedBatchLecturer}
              onChange={(val) => setSelectedBatchLecturer(val)}
              placeholder="Chọn GVHD hàng loạt..."
              searchPlaceholder="Tìm GVHD..."
              className="w-full"
            />
          </div>
          <button 
            onClick={handleBatchAssign}
            disabled={selectedCount === 0 || !selectedBatchLecturer || loadingBatchAssign}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              selectedCount === 0 || !selectedBatchLecturer || loadingBatchAssign
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-[#407F3E] text-white shadow-md hover:bg-[#2b5829] cursor-pointer'
            }`}
          >
            {loadingBatchAssign ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            Phân công cho {selectedCount} SV
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-b-xl shadow-sm border border-[#E7E0C4] border-t-0 overflow-visible relative z-10">
        <div className="overflow-visible">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin w-5 h-5 text-[#407F3E]" />
              Đang tải danh sách sinh viên...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                  <th className="p-4 pl-5 w-12"></th>
                  <th className="p-4">MSSV</th>
                  <th className="p-4">Họ tên</th>
                  <th className="p-4">Lớp</th>
                  <th className="p-4">GVHD hiện tại</th>
                  <th className="p-4 text-right pr-6 w-[250px]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                {paginatedEnrollments.map(sv => {
                  const currentAdvisorName = sv.sinhVien?.details?.giangVienHuongDan?.ho_ten || sv.giangVienHuongDan?.ho_ten || sv.gvhd;
                  return (
                    <tr key={sv.id} className={`hover:bg-slate-50 transition-colors ${sv.checked ? 'bg-[#89B449]/10' : ''}`}>
                      <td className="p-4 pl-5">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer" 
                          checked={sv.checked} 
                          onChange={() => toggleSelect(sv.id)}
                        />
                      </td>
                      <td className={`p-4 font-mono font-bold ${sv.checked ? 'text-[#407F3E]' : 'text-slate-600'}`}>{sv.sinhVien?.mssv}</td>
                      <td className="p-4 font-bold text-slate-800">{sv.sinhVien?.ho_ten}</td>
                      <td className="p-4 font-medium text-slate-600">{sv.sinhVien?.ten_lop}</td>
                      <td className="p-4">
                        {currentAdvisorName ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E7E0C4]/40 text-slate-700 border border-[#E7E0C4]">
                            <UserCircle className="w-4 h-4 text-[#407F3E]" />
                            {currentAdvisorName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                            Chưa phân công
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6 relative">
                        <button 
                          onClick={(e) => toggleInlineDropdown(e, sv.id)}
                          className={`assign-btn px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-end gap-2 ml-auto cursor-pointer ${
                            openDropdownId === sv.id 
                              ? 'bg-[#407F3E] text-white shadow-sm' 
                              : 'bg-slate-50 border border-slate-200 text-[#407F3E] hover:bg-[#407F3E]/10'
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Phân công
                        </button>

                        {/* Inline Dropdown */}
                        {openDropdownId === sv.id && (
                          <div 
                            className={`inline-assign-dropdown absolute right-6 w-[280px] bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 text-left ${
                              dropdownPosition === 'up'
                                ? 'bottom-full mb-2 origin-bottom-right'
                                : 'top-full mt-2 origin-top-right'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 border-b border-[#E7E0C4] bg-slate-50">
                              <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input 
                                  type="text" 
                                  placeholder="Tìm kiếm GVHD..." 
                                  value={searchLecturerTerm}
                                  onChange={(e) => setSearchLecturerTerm(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                                />
                              </div>
                            </div>
                            <div className="max-h-[220px] overflow-y-auto py-1">
                              {filteredLecturers.map(gv => (
                                <div 
                                  key={gv.id}
                                  onClick={() => handleAssign(sv.id, gv.id)}
                                  className="px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer hover:bg-[#E7E0C4]/30"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="font-bold text-slate-800">{gv.ho_ten}</span>
                                  </div>
                                  <span className="font-medium text-slate-500 font-mono text-[10px]">{gv.ma_gv}</span>
                                </div>
                              ))}
                              {filteredLecturers.length === 0 && (
                                <div className="px-3 py-3 text-xs text-center text-slate-400">Không tìm thấy giảng viên</div>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {paginatedEnrollments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-500 font-medium">
                      {!selectedCampaign ? 'Vui lòng chọn đợt kiến tập để xem danh sách sinh viên.' : 'Không tìm thấy sinh viên nào phù hợp.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {selectedCampaign && (
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
              <span>/ {totalItems} sinh viên</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trang đầu
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={validCurrentPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trước
              </button>
              <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                Trang {validCurrentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={validCurrentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Sau
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trang cuối
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auto Assign Preview Modal */}
      {isAutoAssignModalOpen && autoAssignPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="bg-slate-50 border-b border-[#E7E0C4] p-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Xác nhận phân công tự động</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Thuật toán tự động cân bằng số lượng sinh viên cho các giảng viên còn chỉ tiêu
                </p>
              </div>
              <button 
                onClick={() => setIsAutoAssignModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Thống kê */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#407F3E]/10 border border-[#407F3E]/20 rounded-xl p-3 text-center">
                  <div className="text-xs text-[#407F3E] font-bold uppercase tracking-wider">Có thể phân công</div>
                  <div className="text-2xl font-black text-[#407F3E] mt-1">{autoAssignPreview.assignments?.length || 0} SV</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tổng SV chưa gán</div>
                  <div className="text-2xl font-black text-slate-700 mt-1">{rawUnassignedStudents} SV</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">Chưa thể phân công</div>
                  <div className="text-2xl font-black text-amber-800 mt-1">{autoAssignPreview.unassigned?.length || 0} SV</div>
                </div>
              </div>

              {autoAssignPreview.unassigned?.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    Có {autoAssignPreview.unassigned.length} sinh viên chưa thể phân công do tất cả giảng viên đã đạt giới hạn hướng dẫn.
                  </span>
                </div>
              )}

              {/* Tìm kiếm trong modal */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Tìm theo MSSV, Họ tên, Lớp, GV phân công..."
                  value={autoAssignSearch}
                  onChange={(e) => setAutoAssignSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E]"
                />
              </div>

              {/* Bảng xem trước */}
              <div className="border border-[#E7E0C4] rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#E7E0C4]/60 backdrop-blur-sm text-slate-800 font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                    <tr>
                      <th className="p-3">MSSV</th>
                      <th className="p-3">Họ tên sinh viên</th>
                      <th className="p-3">Lớp</th>
                      <th className="p-3">GVHD đề xuất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(autoAssignPreview.assignments || [])
                      .filter(a => {
                        if (!autoAssignSearch.trim()) return true;
                        const term = autoAssignSearch.toLowerCase();
                        const sv = a.sinhVien || {};
                        return sv.mssv?.toLowerCase().includes(term) ||
                               sv.ho_ten?.toLowerCase().includes(term) ||
                               sv.ten_lop?.toLowerCase().includes(term) ||
                               a.lecturerName?.toLowerCase().includes(term);
                      })
                      .map((a, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-[#407F3E]">{a.sinhVien?.mssv}</td>
                          <td className="p-3 font-bold text-slate-800">{a.sinhVien?.ho_ten}</td>
                          <td className="p-3 text-slate-600 font-medium">{a.sinhVien?.ten_lop}</td>
                          <td className="p-3 font-bold text-[#407F3E] flex items-center gap-1.5">
                            <UserCircle className="w-3.5 h-3.5" />
                            {a.lecturerName || a.giangVien?.ho_ten}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-[#E7E0C4] p-4 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsAutoAssignModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAutoAssign}
                disabled={loadingAutoAssign || !autoAssignPreview.assignments?.length}
                className="px-5 py-2 rounded-lg bg-[#407F3E] text-white hover:bg-[#2b5829] text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingAutoAssign ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Xác nhận lưu phân công
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all scale-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">{confirmDialog.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  closeConfirm();
                  if (action) action();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#407F3E] hover:bg-[#407F3E]/90 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Vẫn xuất file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
