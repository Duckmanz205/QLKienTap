import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, Check, Info, Search, UserCircle, UserPlus, RefreshCw, X
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import Toast from '../../components/Toast';

export default function SupervisorAssignment_Khoa() {
  const [schedules, setSchedules] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Dropdown States for Filters
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');

  const [selectAll, setSelectAll] = useState(false);
  
  // Specific inline dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [lecturerSearch, setLecturerSearch] = useState('');

  // Bulk assign state
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [bulkLecturerSearch, setBulkLecturerSearch] = useState('');

  // Auto assign state
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
  const [autoAssignPreview, setAutoAssignPreview] = useState(null);
  const [loadingAutoAssign, setLoadingAutoAssign] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedLich) {
      fetchEnrollments();
    }
  }, [selectedLich]);

  const fetchInitialData = async () => {
    try {
      const [schRes, lecRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getLecturersWithWorkload()
      ]);
      setSchedules(schRes.data);
      setLecturers(lecRes.data);
      if (schRes.data.length > 0) {
        setSelectedLich(schRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể tải dữ liệu ban đầu', 'error');
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await khoaApi.getEnrollments({ lichKienTapId: selectedLich });
      setEnrollments(res.data.map(e => ({ ...e, checked: false })));
      setSelectAll(false);
      // Also refresh workload
      const lecRes = await khoaApi.getLecturersWithWorkload();
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

  const handleAssign = async (enrollmentId, gvId) => {
    try {
      await khoaApi.assignGvhd({ lichKienTapSinhVienId: enrollmentId, lecturerId: gvId });
      showToast('Phân công GVHD thành công');
      fetchEnrollments();
      setOpenDropdownId(null);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Lỗi phân công GVHD', 'error');
    }
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
      setIsBulkAssignOpen(false);
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      showToast('Lỗi phân công hàng loạt', 'error');
    }
  };

  const handlePreviewAutoAssign = async () => {
    if (!selectedLich) return;
    setLoadingAutoAssign(true);
    try {
      const schedule = schedules.find(s => s.id === selectedLich);
      if(!schedule) return;
      const res = await khoaApi.previewAutoAssignGvhd({ dotKienTapId: schedule.dot_kien_tap_id });
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
    setEnrollments(enrollments.map(e => ({ ...e, checked: newValue })));
  };

  const toggleSelect = (id) => {
    setEnrollments(enrollments.map(e => e.id === id ? { ...e, checked: !e.checked } : e));
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
    setOpenDropdownId(null);
    setIsBulkAssignOpen(false);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(true);
  };

  const toggleInlineDropdown = (e, id) => {
    e.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setIsLichDropdownOpen(false);
      setIsBulkAssignOpen(false);
      setLecturerSearch('');
      setOpenDropdownId(id);
    }
  };

  const toggleBulkDropdown = (e) => {
    e.stopPropagation();
    if (isBulkAssignOpen) {
      setIsBulkAssignOpen(false);
    } else {
      closeAllDropdowns();
      setBulkLecturerSearch('');
      setIsBulkAssignOpen(true);
    }
  };

  const filteredLecturers = (search) => lecturers.filter(gv => 
    gv.ho_ten.toLowerCase().includes(search.toLowerCase()) || 
    gv.ma_gv.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCount = enrollments.filter(e => e.checked).length;

  // Stats
  const totalStudents = enrollments.length;
  const assignedStudents = enrollments.filter(e => e.sinhVien?.details?.giangVienHuongDan).length;
  const unassignedStudents = totalStudents - assignedStudents;
  const progressPercent = totalStudents === 0 ? 0 : Math.round((assignedStudents / totalStudents) * 100);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Phân công GVHD</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center justify-between gap-4 relative z-20 mb-6">
        {/* Lịch Dropdown */}
        <div className="relative min-w-[350px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Lịch kiến tập</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsLichDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedLich ? 'text-slate-700' : 'text-slate-400'}`}>
              {schedules.find(s => s.id === selectedLich)?.ten_lich || 'Chọn lịch kiến tập'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isLichDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {schedules.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => { setSelectedLich(opt.id); setIsLichDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedLich === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt.ten_lich}</span>
                  {selectedLich === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <div className="flex items-center gap-6 pr-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-slate-700">{totalStudents}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng SV</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-[#407F3E]">{assignedStudents}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đã phân công</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-red-500">{unassignedStudents}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chưa phân công</span>
          </div>
          <div className="ml-4 flex flex-col justify-center min-w-[100px]">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tiến độ</span>
              <span className="text-xs font-bold text-[#407F3E]">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div className="bg-[#407F3E] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <div className="bg-[#E7E0C4]/50 border border-[#E7E0C4] rounded-t-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 pl-2">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer"
              checked={selectAll}
              onChange={toggleSelectAll}
            />
            <span className="text-sm font-bold text-slate-700">Chọn tất cả</span>
          </div>
          
          {selectedCount > 0 && (
            <div className="relative">
              <button 
                onClick={toggleBulkDropdown}
                className="px-4 py-1.5 bg-[#407F3E] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#2b5829] transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Phân công {selectedCount} SV đã chọn
              </button>
              
              {isBulkAssignOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-[260px] bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2 border-b border-[#E7E0C4] bg-slate-50">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={bulkLecturerSearch}
                        onChange={(e) => setBulkLecturerSearch(e.target.value)}
                        placeholder="Tìm kiếm GVHD..." 
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto py-1">
                    {filteredLecturers(bulkLecturerSearch).map(gv => {
                      const isFull = gv.so_sv_toi_da_huong_dan && gv.so_sv_dang_huong_dan >= gv.so_sv_toi_da_huong_dan;
                      return (
                        <div 
                          key={gv.id}
                          onClick={() => !isFull && handleBulkAssign(gv.id)}
                          className={`px-3 py-2 text-xs flex items-center justify-between transition-colors ${isFull ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-[#E7E0C4]/30'}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#407F3E]">
                              {gv.ho_ten.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800 truncate max-w-[100px]">{gv.ho_ten}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-slate-500 text-[10px]">{gv.ma_gv}</span>
                            <span className={`text-[10px] font-bold ${isFull ? 'text-red-500' : 'text-[#407F3E]'}`}>
                              ({gv.so_sv_dang_huong_dan || 0}/{gv.so_sv_toi_da_huong_dan || '∞'})
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {filteredLecturers(bulkLecturerSearch).length === 0 && (
                      <div className="px-3 py-2 text-xs text-center text-slate-400">Không có giảng viên</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePreviewAutoAssign}
            disabled={unassignedStudents === 0 || loadingAutoAssign}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
              unassignedStudents === 0 || loadingAutoAssign
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-white border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/5'
            }`}
          >
            {loadingAutoAssign ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Info className="w-4 h-4" />}
            Phân công tự động
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-b-xl shadow-sm border border-[#E7E0C4] border-t-0 overflow-visible relative z-10">
        <div className="overflow-visible">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin w-5 h-5 text-[#407F3E]" />
              Đang kết nối cơ sở dữ liệu...
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
                {enrollments.map(sv => {
                  const currentAdvisorName = sv.sinhVien?.details?.giangVienHuongDan?.ho_ten;
                  return (
                    <tr key={sv.id} className={`hover:bg-slate-50 transition-colors ${sv.checked ? 'bg-[#89B449]/5' : ''}`}>
                      <td className="p-4 pl-5">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer" 
                          checked={sv.checked} 
                          onChange={() => toggleSelect(sv.id)}
                        />
                      </td>
                      <td className={`p-4 font-mono font-bold ${sv.checked ? 'text-[#407F3E]' : 'text-slate-500'}`}>{sv.sinhVien?.mssv}</td>
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
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-end gap-2 ml-auto ${
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
                            className="absolute top-full right-6 mt-1 w-[260px] bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 origin-top-right text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 border-b border-[#E7E0C4] bg-slate-50">
                              <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input 
                                  type="text" 
                                  value={lecturerSearch}
                                  onChange={(e) => setLecturerSearch(e.target.value)}
                                  placeholder="Tìm kiếm GVHD..." 
                                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                                />
                              </div>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto py-1">
                              {filteredLecturers(lecturerSearch).map(gv => {
                                const isFull = gv.so_sv_toi_da_huong_dan && gv.so_sv_dang_huong_dan >= gv.so_sv_toi_da_huong_dan;
                                return (
                                  <div 
                                    key={gv.id}
                                    onClick={() => !isFull && handleAssign(sv.id, gv.id)}
                                    className={`px-3 py-2 text-xs flex items-center justify-between transition-colors ${isFull ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-[#E7E0C4]/30'}`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#407F3E]">
                                        {gv.ho_ten.charAt(0)}
                                      </div>
                                      <span className="font-bold text-slate-800 truncate max-w-[100px]">{gv.ho_ten}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="font-medium text-slate-500 text-[10px]">{gv.ma_gv}</span>
                                      <span className={`text-[10px] font-bold ${isFull ? 'text-red-500' : 'text-[#407F3E]'}`}>
                                        ({gv.so_sv_dang_huong_dan || 0}/{gv.so_sv_toi_da_huong_dan || '∞'})
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                              {filteredLecturers(lecturerSearch).length === 0 && (
                                <div className="px-3 py-2 text-xs text-center text-slate-400">Không có giảng viên</div>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">Không tìm thấy sinh viên nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Auto Assign Preview Modal */}
      {isAutoAssignModalOpen && autoAssignPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Xem trước kết quả phân công tự động</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Thuật toán chia đều SV cho các GV còn slot trống</p>
              </div>
              <button onClick={() => setIsAutoAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 bg-green-50 p-3 rounded-xl border border-green-200">
                  <div className="text-sm font-bold text-green-700 mb-1">Dự kiến phân công</div>
                  <div className="text-2xl font-black text-green-600">{autoAssignPreview.assignments.length} <span className="text-sm font-bold">SV</span></div>
                </div>
                <div className="flex-1 bg-red-50 p-3 rounded-xl border border-red-200">
                  <div className="text-sm font-bold text-red-700 mb-1">Không thể phân công</div>
                  <div className="text-2xl font-black text-red-600">{autoAssignPreview.unassigned.length} <span className="text-sm font-bold">SV</span></div>
                  <div className="text-[10px] text-red-500 mt-1">Do tất cả GV đã đầy</div>
                </div>
              </div>

              {autoAssignPreview.assignments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Danh sách phân công dự kiến</h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                        <tr>
                          <th className="p-3">Sinh viên</th>
                          <th className="p-3">Giảng viên nhận</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {autoAssignPreview.assignments.slice(0, 10).map((a, i) => (
                          <tr key={i}>
                            <td className="p-3 font-medium text-slate-800">{a.sinhVien.mssv} - {a.sinhVien.ho_ten}</td>
                            <td className="p-3 font-bold text-[#407F3E]">{a.lecturer.ho_ten}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {autoAssignPreview.assignments.length > 10 && (
                      <div className="p-2 text-center text-xs font-bold text-slate-500 bg-slate-50">
                        ... và {autoAssignPreview.assignments.length - 10} sinh viên khác
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setIsAutoAssignModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-bold bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmAutoAssign}
                disabled={loadingAutoAssign || autoAssignPreview.assignments.length === 0}
                className="px-6 py-2 bg-[#407F3E] text-white font-bold rounded-lg shadow-sm hover:bg-[#2b5829] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loadingAutoAssign && <RefreshCw className="w-4 h-4 animate-spin" />}
                Xác nhận phân công
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
