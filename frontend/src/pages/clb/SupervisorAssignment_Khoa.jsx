import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, Check, Info, Search, UserCircle, UserPlus, RefreshCw, AlertCircle
} from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function SupervisorAssignment_Khoa() {
  const [schedules, setSchedules] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Dropdown States for Filters
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');
  const [searchLichTerm, setSearchLichTerm] = useState('');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchStatusTerm, setSearchStatusTerm] = useState('');

  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchClassTerm, setSearchClassTerm] = useState('');

  const [selectAll, setSelectAll] = useState(false);
  
  // Specific inline dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [searchLecturerTerm, setSearchLecturerTerm] = useState('');

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
        khoaApi.getLecturers()
      ]);
      setSchedules(schRes.data);
      setLecturers(lecRes.data);
      if (schRes.data.length > 0) {
        setSelectedLich(schRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await khoaApi.getEnrollments({ lichKienTapId: selectedLich });
      // add checked property
      setEnrollments(res.data.map(e => ({ ...e, checked: false })));
      setSelectAll(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (enrollmentId, gvId) => {
    try {
      await khoaApi.assignGvhd({ dang_ky_id: enrollmentId, giang_vien_id: gvId });
      alert('Phân công GVHD thành công');
      fetchEnrollments();
      setOpenDropdownId(null);
    } catch (err) {
      console.error(err);
      alert('Lỗi phân công GVHD');
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
    setIsStatusDropdownOpen(false);
    setIsClassDropdownOpen(false);
    setOpenDropdownId(null);
    setSearchLichTerm('');
    setSearchClassTerm('');
    setSearchStatusTerm('');
    setSearchLecturerTerm('');
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
      closeAllDropdowns();
      setOpenDropdownId(id);
      setSearchLecturerTerm('');
    }
  };

  const classList = Array.from(new Set(enrollments.map(e => e.sinhVien?.ten_lop).filter(Boolean)));

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
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEnrollments = filteredEnrollments.slice((validCurrentPage - 1) * limit, validCurrentPage * limit);

  const filteredSchedules = schedules.filter(s => 
    s.ten_lich?.toLowerCase().includes(searchLichTerm.toLowerCase())
  );

  const filteredClassList = classList.filter(cls => 
    cls.toLowerCase().includes(searchClassTerm.toLowerCase())
  );

  const statusOptions = ['Tất cả', 'Đã phân công', 'Chưa phân công'];
  const filteredStatusOptions = statusOptions.filter(opt => 
    opt.toLowerCase().includes(searchStatusTerm.toLowerCase())
  );

  const filteredLecturers = lecturers.filter(gv => 
    gv.ho_ten?.toLowerCase().includes(searchLecturerTerm.toLowerCase()) ||
    gv.ma_gv?.toLowerCase().includes(searchLecturerTerm.toLowerCase())
  );

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Phân công GVHD</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-center gap-4 relative z-20 mb-6">
        {/* Tìm kiếm */}
        <div className="relative flex-1 min-w-[240px]">
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

        {/* Lịch Dropdown */}
        <div className="relative min-w-[260px]">
          <div 
            onClick={(e) => handleDropdownClick(e, setIsLichDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedLich ? 'text-slate-700' : 'text-slate-400'}`}>
              {schedules.find(s => s.id === selectedLich)?.ten_lich || 'Chọn lịch kiến tập'}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isLichDropdownOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
          </div>
          {isLichDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[260px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm lịch kiến tập..." 
                  value={searchLichTerm}
                  onChange={(e) => setSearchLichTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredSchedules.map(opt => (
                  <div 
                    key={opt.id}
                    onClick={() => { setSelectedLich(opt.id); setIsLichDropdownOpen(false); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      selectedLich === opt.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/30 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{opt.ten_lich}</span>
                    {selectedLich === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                  </div>
                ))}
                {filteredSchedules.length === 0 && (
                  <div className="px-4 py-2 text-xs text-slate-400 text-center">Không tìm thấy lịch nào</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lớp Dropdown */}
        <div className="relative min-w-[160px]">
          <div 
            onClick={(e) => handleDropdownClick(e, setIsClassDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isClassDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedClass ? 'text-slate-700' : 'text-slate-400'}`}>{selectedClass || 'Tất cả lớp'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isClassDropdownOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
          </div>
          {isClassDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[180px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm lớp..." 
                  value={searchClassTerm}
                  onChange={(e) => setSearchClassTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div 
                  onClick={() => { setSelectedClass(''); setIsClassDropdownOpen(false); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedClass === '' ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/30 font-medium'
                  }`}
                >
                  <span>Tất cả lớp</span>
                  {selectedClass === '' && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
                {filteredClassList.map(cls => (
                  <div 
                    key={cls}
                    onClick={() => { setSelectedClass(cls); setIsClassDropdownOpen(false); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      selectedClass === cls ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/30 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{cls}</span>
                    {selectedClass === cls && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                  </div>
                ))}
                {filteredClassList.length === 0 && searchClassTerm && (
                  <div className="px-4 py-2 text-xs text-slate-400 text-center">Không tìm thấy lớp</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Trạng thái Dropdown */}
        <div className="relative min-w-[180px]">
          <div 
            onClick={(e) => handleDropdownClick(e, setIsStatusDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedStatus ? 'text-slate-700' : 'text-slate-400'}`}>{selectedStatus || 'Tất cả trạng thái'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isStatusDropdownOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
          </div>
          {isStatusDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[180px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm trạng thái..." 
                  value={searchStatusTerm}
                  onChange={(e) => setSearchStatusTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredStatusOptions.map(opt => (
                  <div 
                    key={opt}
                    onClick={() => { setSelectedStatus(opt === 'Tất cả' ? '' : opt); setIsStatusDropdownOpen(false); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      (selectedStatus === opt || (!selectedStatus && opt === 'Tất cả')) ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/30 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    {(selectedStatus === opt || (!selectedStatus && opt === 'Tất cả')) && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                  </div>
                ))}
                {filteredStatusOptions.length === 0 && (
                  <div className="px-4 py-2 text-xs text-slate-400 text-center">Không tìm thấy trạng thái</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      <div className="bg-[#E7E0C4]/50 border border-[#E7E0C4] rounded-t-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 pl-2">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer"
            checked={selectAll}
            onChange={toggleSelectAll}
          />
          <span className="text-sm font-bold text-slate-700">Chọn tất cả</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Info className="w-4 h-4" />
            <span className="text-[11px] font-medium">Chờ khoa cấu hình số lượng SV tối đa/GV</span>
          </div>
          <button 
            disabled
            className="px-4 py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 cursor-not-allowed"
          >
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
                {paginatedEnrollments.map(sv => {
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
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-end gap-2 ml-auto cursor-pointer ${
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
                                  placeholder="Tìm kiếm GVHD..." 
                                  value={searchLecturerTerm}
                                  onChange={(e) => setSearchLecturerTerm(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                                />
                              </div>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto py-1">
                              {filteredLecturers.map(gv => (
                                <div 
                                  key={gv.id}
                                  onClick={() => handleAssign(sv.id, gv.id)}
                                  className="px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer hover:bg-[#E7E0C4]/30"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#407F3E]">
                                      {gv.ho_ten.charAt(0)}
                                    </div>
                                    <span className="font-bold text-slate-800">{gv.ho_ten}</span>
                                  </div>
                                  <span className="font-medium text-slate-500">{gv.ma_gv}</span>
                                </div>
                              ))}
                              {filteredLecturers.length === 0 && (
                                <div className="px-3 py-2 text-xs text-center text-slate-400">Không tìm thấy giảng viên</div>
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
                    <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">Không tìm thấy sinh viên nào phù hợp.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <select
              value={limit}
              onChange={e => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
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
      </div>
    </div>
  );
}
