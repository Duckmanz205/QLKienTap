import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, Check, Info, Search, UserCircle, RefreshCw, X, Filter, AlertCircle, ChevronLeft, ChevronRight, UserPlus, Users
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import Toast from '../../components/Toast';
import EdgeToEdgeContainer from '../../components/EdgeToEdgeContainer';

export default function SupervisorAssignment_Khoa() {
  const [campaigns, setCampaigns] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Search & Pagination States for Students
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(30);

  // Dropdown States for Filters
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [searchCampaignTerm, setSearchCampaignTerm] = useState('');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchClassTerm, setSearchClassTerm] = useState('');

  const [selectAll, setSelectAll] = useState(false);
  
  // Lecturer Right Panel State
  const [lecturerSearch, setLecturerSearch] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState(null);

  // Auto assign state
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
  const [autoAssignPreview, setAutoAssignPreview] = useState(null);
  const [loadingAutoAssign, setLoadingAutoAssign] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchEnrollments();
    }
  }, [selectedCampaign]);

  const fetchInitialData = async () => {
    try {
      const [campRes, lecRes] = await Promise.all([
        khoaApi.getCampaigns({ limit: 100 }),
        khoaApi.getLecturersWithWorkload(selectedCampaign)
      ]);
      const camps = campRes.data?.data || campRes.data;
      setCampaigns(camps);
      setLecturers(lecRes.data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải dữ liệu ban đầu', 'error');
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await khoaApi.getEnrollments({ lichKienTapId: selectedCampaign, limit: 10000 });
      const enrolls = res.data?.data || res.data;
      setEnrollments(enrolls.map(e => ({ ...e, checked: false })));
      setSelectAll(false);
      // Also refresh workload
      const lecRes = await khoaApi.getLecturersWithWorkload(selectedCampaign);
      setLecturers(lecRes.data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách sinh viên', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleBulkAssign = async (gvId) => {
    const selectedIds = enrollments.filter(e => e.checked).map(e => e.id);
    if (selectedIds.length === 0) return;

    try {
      const res = await khoaApi.batchAssignGvhd({
        dotKienTapSinhVienIds: selectedIds,
        lecturerId: gvId
      });
      const { success, failed } = res.data;
      if (failed.length > 0) {
        showToast(`Phân công ${success} thành công, ${failed.length} thất bại`, 'warning');
      } else {
        showToast(`Phân công thành công cho ${success} sinh viên`);
      }
      setSelectedLecturer(null);
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      showToast('Lỗi phân công', 'error');
    }
  };

  const handlePreviewAutoAssign = async () => {
    if (!selectedCampaign) return;
    setLoadingAutoAssign(true);
    try {
      const campaign = campaigns.find(s => s.id === selectedCampaign);
      if(!campaign) return;
      const res = await khoaApi.previewAutoAssignGvhd({ dotKienTapId: campaign.id });
      setAutoAssignPreview(res.data);
      setIsAutoAssignModalOpen(true);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xem trước phân công tự động', 'error');
    } finally {
      setLoadingAutoAssign(false);
    }
  };

  const handleConfirmAutoAssign = async () => {
    if (!autoAssignPreview || autoAssignPreview.assignments.length === 0) return;
    try {
      setLoadingAutoAssign(true);
      const res = await khoaApi.confirmAutoAssignGvhd({
        assignments: autoAssignPreview.assignments.map(a => ({
          dotKienTapSinhVienId: a.dotKienTapSinhVienId,
          lecturerId: a.lecturerId
        }))
      });
      const { success, failed } = res.data;
      if (failed.length > 0) {
        showToast(`Phân công ${success} thành công, ${failed.length} thất bại`, 'warning');
      } else {
        showToast(`Tự động phân công thành công cho ${success} sinh viên`);
      }
      setIsAutoAssignModalOpen(false);
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      showToast('Lỗi xác nhận phân công tự động', 'error');
    } finally {
      setLoadingAutoAssign(false);
    }
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    
    // Only toggle the visible filtered items, or all items? Usually all filtered items.
    const filteredIds = new Set(filteredEnrollments.map(e => e.id));
    setEnrollments(enrollments.map(e => filteredIds.has(e.id) ? { ...e, checked: newValue } : e));
  };

  const toggleSelect = (id) => {
    setEnrollments(enrollments.map(e => e.id === id ? { ...e, checked: !e.checked } : e));
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsCampaignDropdownOpen(false);
    setIsClassDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(true);
  };

  const filteredLecturers = lecturers.filter(gv => 
    gv.ho_ten.toLowerCase().includes(lecturerSearch.toLowerCase()) || 
    gv.ma_gv.toLowerCase().includes(lecturerSearch.toLowerCase())
  );

  const filteredCampaigns = campaigns.filter(s => 
    s.ten_dot?.toLowerCase().includes(searchCampaignTerm.toLowerCase())
  );

  const classList = Array.from(new Set(enrollments.map(e => e.sinhVien?.ten_lop).filter(Boolean)));
  const filteredClassList = classList.filter(cls => 
    cls.toLowerCase().includes(searchClassTerm.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(e => {
    const sv = e.sinhVien || {};
    const currentAdvisor = sv.details?.giangVienHuongDan?.ho_ten;

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

  const totalItems = filteredEnrollments.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages) || 1;
  const paginatedEnrollments = filteredEnrollments.slice((validCurrentPage - 1) * limit, validCurrentPage * limit);

  const selectedCount = enrollments.filter(e => e.checked).length;

  // Stats
  const rawTotalStudents = enrollments.length;
  const rawAssignedStudents = enrollments.filter(e => e.sinhVien?.details?.giangVienHuongDan).length;
  const rawUnassignedStudents = rawTotalStudents - rawAssignedStudents;
  const progressPercent = rawTotalStudents === 0 ? 0 : Math.round((rawAssignedStudents / rawTotalStudents) * 100);

  return (
    <EdgeToEdgeContainer className="bg-[#E7E0C4]/20 animate-in fade-in duration-300" onClick={closeAllDropdowns}>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}
      
      {/* Header & Stats (Compact) */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Phân công GVHD</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý và phân bổ sinh viên cho giảng viên hướng dẫn</p>
          </div>
          
          <div className="relative min-w-[300px] z-30">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Đợt kiến tập</label>
            <div 
              onClick={(e) => handleDropdownClick(e, setIsCampaignDropdownOpen)}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all shadow-sm ${isCampaignDropdownOpen ? 'border-[#407F3E] ring-2 ring-[#407F3E]/20' : 'border-[#E7E0C4] hover:border-[#407F3E]/50'}`}
            >
              <span className={`truncate pr-2 font-medium ${selectedCampaign ? 'text-slate-800' : 'text-slate-400'}`}>
                {campaigns.find(s => s.id === selectedCampaign)?.ten_dot || 'Chọn đợt kiến tập...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isCampaignDropdownOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
            </div>
            {isCampaignDropdownOpen && (
              <div className="absolute top-full right-0 w-full mt-2 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-40 py-1 overflow-hidden animate-in slide-in-from-top-2 max-h-[300px] flex flex-col">
                <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                  <input 
                    type="text" 
                    placeholder="Tìm đợt kiến tập..." 
                    value={searchCampaignTerm}
                    onChange={(e) => setSearchCampaignTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                  />
                </div>
                <div className="overflow-y-auto">
                  {filteredCampaigns.map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => { setSelectedCampaign(opt.id); setIsCampaignDropdownOpen(false); setCurrentPage(1); }}
                      className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        selectedCampaign === opt.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-2">{opt.ten_dot}</span>
                      {selectedCampaign === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Split View Container */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 md:gap-6 relative z-20">
        
        {/* ================= LEFT PANEL: SINH VIÊN ================= */}
        <div className="w-full lg:w-2/3 xl:w-[68%] bg-white rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col h-full overflow-hidden">
          {/* Header & Filters */}
          <div className="p-3 border-b border-[#E7E0C4] bg-slate-50/50 rounded-t-xl flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#407F3E]/10 p-2 rounded-lg text-[#407F3E]">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-800">Danh sách Sinh viên</h2>
            </div>
            <button 
              onClick={handlePreviewAutoAssign}
              disabled={rawUnassignedStudents === 0 || loadingAutoAssign || !selectedCampaign}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                rawUnassignedStudents === 0 || loadingAutoAssign || !selectedCampaign
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-white border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E] hover:text-white'
              }`}
            >
              {loadingAutoAssign ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Info className="w-3.5 h-3.5" />}
              Phân công tự động
            </button>
          </div>

          <div className="p-3 border-b border-[#E7E0C4] flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm MSSV, Tên, Lớp..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all"
              />
            </div>
            
            {/* Lớp Filter */}
            <div className="relative min-w-[140px]">
              <div 
                onClick={(e) => handleDropdownClick(e, setIsClassDropdownOpen)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm flex justify-between items-center cursor-pointer hover:border-[#407F3E]"
              >
                <Filter className="w-3 h-3 text-slate-400 mr-1.5" />
                <span className={`truncate pr-2 font-medium flex-1 text-xs ${selectedClass ? 'text-slate-700' : 'text-slate-400'}`}>{selectedClass || 'Tất cả lớp'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isClassDropdownOpen && (
                <div className="absolute top-full right-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 flex flex-col min-w-[160px]">
                  <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                    <input 
                      type="text" 
                      placeholder="Tìm lớp..." 
                      value={searchClassTerm}
                      onChange={(e) => setSearchClassTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E]"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <div 
                      onClick={() => { setSelectedClass(''); setIsClassDropdownOpen(false); setCurrentPage(1); }}
                      className="px-3 py-1.5 text-xs cursor-pointer flex justify-between items-center hover:bg-slate-50 text-slate-700"
                    >
                      <span>Tất cả lớp</span>
                      {selectedClass === '' && <Check className="w-3.5 h-3.5 text-[#407F3E]" />}
                    </div>
                    {filteredClassList.map(cls => (
                      <div 
                        key={cls}
                        onClick={() => { setSelectedClass(cls); setIsClassDropdownOpen(false); setCurrentPage(1); }}
                        className="px-3 py-1.5 text-xs cursor-pointer flex justify-between items-center hover:bg-slate-50 text-slate-700"
                      >
                        <span className="truncate">{cls}</span>
                        {selectedClass === cls && <Check className="w-3.5 h-3.5 text-[#407F3E]" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trạng thái Filter */}
            <div className="relative min-w-[150px]">
              <div 
                onClick={(e) => handleDropdownClick(e, setIsStatusDropdownOpen)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm flex justify-between items-center cursor-pointer hover:border-[#407F3E]"
              >
                <span className={`truncate pr-2 font-medium flex-1 text-xs ${selectedStatus ? 'text-slate-700' : 'text-slate-400'}`}>{selectedStatus || 'Tất cả trạng thái'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isStatusDropdownOpen && (
                <div className="absolute top-full right-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 min-w-[160px]">
                  {['Tất cả', 'Đã phân công', 'Chưa phân công'].map(opt => (
                    <div 
                      key={opt}
                      onClick={() => { setSelectedStatus(opt === 'Tất cả' ? '' : opt); setIsStatusDropdownOpen(false); setCurrentPage(1); }}
                      className="px-3 py-1.5 text-xs cursor-pointer flex justify-between items-center hover:bg-slate-50 text-slate-700"
                    >
                      <span>{opt}</span>
                      {(selectedStatus === opt || (!selectedStatus && opt === 'Tất cả')) && <Check className="w-3.5 h-3.5 text-[#407F3E]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto bg-white relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 gap-2 bg-white/50 backdrop-blur-sm z-10">
                <RefreshCw className="animate-spin w-5 h-5 text-[#407F3E]" />
                <span className="font-medium text-sm">Đang tải danh sách...</span>
              </div>
            ) : null}
            
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#E7E0C4]/40 backdrop-blur-md text-slate-800 text-[10px] font-bold uppercase tracking-wider z-20 shadow-sm">
                <tr>
                  <th className="p-3 pl-4 w-10">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-3">MSSV</th>
                  <th className="p-3">Họ tên sinh viên</th>
                  <th className="p-3">Lớp</th>
                  <th className="p-3">Trạng thái / GVHD</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                {paginatedEnrollments.map(sv => {
                  const currentAdvisorName = sv.sinhVien?.details?.giangVienHuongDan?.ho_ten;
                  return (
                    <tr 
                      key={sv.id} 
                      onClick={() => toggleSelect(sv.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${sv.checked ? 'bg-[#89B449]/10' : ''}`}
                    >
                      <td className="p-3 pl-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer" 
                          checked={sv.checked} 
                          onChange={() => toggleSelect(sv.id)}
                        />
                      </td>
                      <td className={`p-3 font-mono font-bold text-xs ${sv.checked ? 'text-[#407F3E]' : 'text-slate-500'}`}>{sv.sinhVien?.mssv}</td>
                      <td className="p-3 font-bold text-slate-800 text-xs">{sv.sinhVien?.ho_ten}</td>
                      <td className="p-3 font-medium text-slate-600 text-xs">{sv.sinhVien?.ten_lop}</td>
                      <td className="p-3">
                        {currentAdvisorName ? (
                          <div className="flex items-center gap-1.5 w-max px-2.5 py-1 rounded-md bg-[#E7E0C4]/40 border border-[#E7E0C4]">
                            <UserCircle className="w-3.5 h-3.5 text-[#407F3E]" />
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]" title={currentAdvisorName}>{currentAdvisorName}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200 uppercase tracking-wide">
                            Trống
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {paginatedEnrollments.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-500">
                      {!selectedCampaign ? (
                        <div className="flex flex-col items-center">
                          <Search className="w-10 h-10 mb-3 opacity-20" />
                          <span className="text-sm font-medium">Vui lòng chọn đợt kiến tập</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">Không tìm thấy sinh viên nào.</span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {selectedCampaign && (
            <div className="p-3 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span>Hiển thị</span>
                <select 
                  value={limit}
                  onChange={e => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>/ {totalItems} sinh viên</span>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button 
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Trang đầu
                </button>
                <button 
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Trước
                </button>
                
                <span className="px-3 py-1 rounded-lg bg-[#407F3E] text-white text-xs font-bold shadow-sm cursor-default mx-0.5">
                  Trang {validCurrentPage} / {totalPages || 1}
                </span>
                
                <button 
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Sau
                </button>
                <button 
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Trang cuối
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT PANEL: GIẢNG VIÊN ================= */}
        <div className="w-full lg:w-1/3 xl:w-[32%] bg-white rounded-xl shadow-lg border border-[#E7E0C4] flex flex-col h-full relative overflow-hidden">
          {/* Right Panel Header */}
          <div className="p-2.5 bg-gradient-to-br from-[#407F3E] to-[#2c6b2d] text-white flex justify-between items-center shrink-0">
            <h2 className="font-bold text-sm flex items-center gap-1.5">
              <UserCircle className="w-4 h-4 opacity-80" />
              Giảng viên HD
            </h2>
            <div className="flex items-center gap-2 text-xs bg-white/10 rounded px-2 py-1 backdrop-blur-sm border border-white/10">
              <span className="font-medium opacity-90">Đang chọn:</span>
              <span className="font-bold bg-white text-[#407F3E] px-1.5 rounded-sm shadow-sm">
                {selectedCount}
              </span>
            </div>
          </div>

          <div className="p-3 border-b border-[#E7E0C4] bg-slate-50 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={lecturerSearch}
                onChange={(e) => setLecturerSearch(e.target.value)}
                placeholder="Tìm tên hoặc mã giảng viên..." 
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Lecturer List */}
          <div className="flex-1 overflow-y-auto p-3 bg-slate-50 space-y-3 relative">
            {filteredLecturers.map(gv => {
              const isFull = gv.so_sv_toi_da_huong_dan && gv.so_sv_dang_huong_dan >= gv.so_sv_toi_da_huong_dan;
              const isSelected = selectedLecturer === gv.id;
              
              return (
                <div 
                  key={gv.id}
                  onClick={() => {
                    if (!isFull) setSelectedLecturer(isSelected ? null : gv.id);
                  }}
                  className={`relative p-3 rounded-lg border transition-all duration-200 bg-white shadow-sm flex flex-col gap-2.5 ${
                    isFull ? 'border-red-100 bg-red-50/30 cursor-not-allowed opacity-70' : 
                    isSelected ? 'border-[#407F3E] ring-1 ring-[#407F3E] bg-[#407F3E]/5 cursor-pointer shadow-md transform scale-[1.01]' : 
                    'border-[#E7E0C4] hover:border-[#407F3E] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-2 flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-[#407F3E] bg-[#407F3E] text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm truncate ${isSelected ? 'text-[#407F3E]' : 'text-slate-800'}`} title={gv.ho_ten}>{gv.ho_ten}</div>
                        <div className="text-[10px] text-slate-500 font-medium font-mono mt-0.5">{gv.ma_gv}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">SV Đang HD</div>
                      <div className={`text-sm font-black leading-none ${isFull ? 'text-red-500' : 'text-[#407F3E]'}`}>
                        {gv.so_sv_dang_huong_dan || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredLecturers.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-medium flex flex-col items-center">
                <Search className="w-10 h-10 mb-3 opacity-20" />
                Không tìm thấy giảng viên
              </div>
            )}
          </div>

          {/* Master Action Button */}
          <div className="p-3 border-t border-[#E7E0C4] bg-white shrink-0">
            <button
              onClick={() => handleBulkAssign(selectedLecturer)}
              disabled={selectedCount === 0 || !selectedLecturer}
              className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                selectedCount === 0 || !selectedLecturer
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  : 'bg-[#407F3E] text-white shadow-md hover:bg-[#2b5829] hover:shadow-lg'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {selectedCount === 0 
                ? 'Vui lòng chọn Sinh viên' 
                : !selectedLecturer 
                  ? 'Vui lòng chọn 1 Giảng viên' 
                  : `Phân công ${selectedCount} SV cho GV này`}
            </button>
          </div>
        </div>

      </div>

      {/* Auto Assign Preview Modal (Giữ nguyên) */}
      {isAutoAssignModalOpen && autoAssignPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Xác nhận phân công tự động</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Thuật toán chia đều SV cho các GV còn slot trống</p>
              </div>
              <button onClick={() => setIsAutoAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
                  <div className="text-sm font-bold text-green-700 mb-1 uppercase tracking-wider">Dự kiến phân công</div>
                  <div className="text-3xl font-black text-green-600">{autoAssignPreview.assignments.length} <span className="text-base font-bold">SV</span></div>
                </div>
                <div className="flex-1 bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                  <div className="text-sm font-bold text-red-700 mb-1 uppercase tracking-wider">Không thể phân công</div>
                  <div className="text-3xl font-black text-red-600">{autoAssignPreview.unassigned.length} <span className="text-base font-bold">SV</span></div>
                  <div className="text-[10px] font-bold text-red-500 mt-1 uppercase">Do tất cả GV đã đầy</div>
                </div>
              </div>

              {autoAssignPreview.assignments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Danh sách phân công dự kiến (Top 10)
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <tr>
                          <th className="p-3 pl-4">Sinh viên</th>
                          <th className="p-3">Giảng viên nhận</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {autoAssignPreview.assignments.slice(0, 10).map((a, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 pl-4 font-medium text-slate-800">
                              <span className="font-mono text-slate-500 mr-2">{a.sinhVien.mssv}</span>
                              {a.sinhVien.ho_ten}
                            </td>
                            <td className="p-3 font-bold text-[#407F3E] flex items-center gap-2">
                              <UserCircle className="w-4 h-4" />
                              {a.lecturer.ho_ten}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {autoAssignPreview.assignments.length > 10 && (
                      <div className="p-3 text-center text-xs font-bold text-slate-500 bg-slate-50 border-t border-slate-200">
                        ... và {autoAssignPreview.assignments.length - 10} sinh viên khác
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsAutoAssignModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmAutoAssign}
                disabled={loadingAutoAssign || autoAssignPreview.assignments.length === 0}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#407F3E] border border-[#407F3E] hover:bg-[#2b5829] transition-all flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAutoAssign ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Xác nhận phân công
              </button>
            </div>
          </div>
        </div>
      )}
    </EdgeToEdgeContainer>
  );
}
