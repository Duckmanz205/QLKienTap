import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, 
  User, 
  Calendar, 
  Users, 
  Save, 
  Check, 
  AlertTriangle,
  FileSpreadsheet,
  Gavel,
  ClipboardList,
  Search,
  ChevronDown
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function HoiDongChamBaoCao_DSBuoi_GV() {
  const [lecturer, setLecturer] = useState(null);
  const [boards, setBoards] = useState([]);
  
  // Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchRoleDropdown, setSearchRoleDropdown] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);

  // Scoring state
  const [activeTab, setActiveTab] = useState('list');
  const [activeBoard, setActiveBoard] = useState(null);
  const [selectedReg, setSelectedReg] = useState(null);

  // Rubric details
  const [score1, setScore1] = useState('8.0');
  const [score2, setScore2] = useState('8.0');
  const [score3, setScore3] = useState('8.0');
  const [comments, setComments] = useState('Sinh viên trả lời lưu loát các câu hỏi phản biện của hội đồng.');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchBoards(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchBoards = async (gvId) => {
    try {
      const res = await giangVienApi.getBoardSessions(gvId);
      setBoards(res.data);
      if (res.data.length > 0) {
        setActiveBoard(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenGrading = (board, reg) => {
    setMessage('');
    setError('');
    setActiveBoard(board);
    setSelectedReg(reg);
    
    // Default starting rubrics
    setScore1('8.0');
    setScore2('8.0');
    setScore3('8.0');
    setComments('Sinh viên trả lời lưu loát các câu hỏi phản biện của hội đồng.');
    setActiveTab('grading');
  };

  const handleSaveCouncilGrade = async (e) => {
    e.preventDefault();
    if (!selectedReg || !activeBoard) return;

    setMessage('');
    setError('');
    setLoading(true);

    const s1 = parseFloat(score1) || 0;
    const s2 = parseFloat(score2) || 0;
    const s3 = parseFloat(score3) || 0;
    const finalAvg = Math.round(((s1 * 0.4) + (s2 * 0.3) + (s3 * 0.3)) * 10) / 10;

    try {
      const res = await giangVienApi.submitBoardScore({
        memberId: activeBoard.memberId,
        phieuId: selectedReg.id,
        score: finalAvg
      });
      setMessage(res.data.message);
      fetchBoards(lecturer.id);
      
      // Clear selection after short delay
      setTimeout(() => {
        setSelectedReg(null);
        setActiveTab('list');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Chấm điểm hội đồng thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (!lecturer) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải thông tin hội đồng...
      </div>
    );
  }

  // Derived filter & pagination logic
  const availableRoles = useMemo(() => {
    return Array.from(new Set(boards.map(b => b.vai_tro).filter(Boolean)));
  }, [boards]);

  const filteredBoards = useMemo(() => {
    return boards.filter(b => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        (b.session?.ten_hoi_dong && b.session.ten_hoi_dong.toLowerCase().includes(q)) ||
        (b.session?.dia_diem && b.session.dia_diem.toLowerCase().includes(q));
      const matchRole = selectedRole === 'ALL' || b.vai_tro === selectedRole;
      return matchSearch && matchRole;
    });
  }, [boards, searchQuery, selectedRole]);

  const totalPages = Math.ceil(filteredBoards.length / limit) || 1;
  const paginatedBoards = filteredBoards.slice((currentPage - 1) * limit, currentPage * limit);

  // Calculated average helper
  const currentAvg = Math.round(((parseFloat(score1) || 0) * 0.4 + (parseFloat(score2) || 0) * 0.3 + (parseFloat(score3) || 0) * 0.3) * 10) / 10;

  return (
    <div className="space-y-6 animate-fade-in relative" onClick={() => setIsRoleDropdownOpen(false)}>
      {/* Header section with tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight font-display">Hội đồng chấm báo cáo</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Nơi hội đồng chuyên môn đánh giá đồ án thu hoạch và báo cáo thực tế của sinh viên.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#ecefe6] rounded-xl p-1 shadow-sm shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'list' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:bg-[#e6e9e0]'
            }`}
          >
            Danh sách buổi họp
          </button>
          <button
            onClick={() => {
              if (!selectedReg) {
                alert('Vui lòng chọn sinh viên cần chấm điểm từ danh sách hội đồng trước.');
                return;
              }
              setActiveTab('grading');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'grading' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:bg-[#e6e9e0]'
            }`}
          >
            Màn hình chấm điểm
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-[#e5ffdc] border border-primary/20 text-[#476d01] px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-750 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'list' ? (
        /* Board meetings overview list */
        <div className="space-y-6 relative z-10">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap gap-4 items-center relative z-20">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm tên hội đồng, địa điểm..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all text-slate-800 font-medium"
              />
            </div>

            {/* Role Filter Popover */}
            <div className="relative min-w-[200px]" onClick={(e) => e.stopPropagation()}>
              <div 
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isRoleDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
              >
                <span className="truncate pr-2 font-medium text-slate-700">
                  {selectedRole === 'ALL' ? 'Tất cả vai trò' : selectedRole}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              {isRoleDropdownOpen && (
                <div className="absolute top-full right-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
                  <div className="p-2 border-b border-[#E7E0C4]">
                    <input
                      type="text"
                      placeholder="Tìm vai trò..."
                      value={searchRoleDropdown}
                      onChange={(e) => setSearchRoleDropdown(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-[#E7E0C4] rounded-lg focus:outline-none focus:border-[#407F3E]"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {['ALL', ...availableRoles]
                      .filter(role => {
                        const label = role === 'ALL' ? 'Tất cả vai trò' : role;
                        return !searchRoleDropdown || label.toLowerCase().includes(searchRoleDropdown.toLowerCase());
                      })
                      .map(role => (
                        <div 
                          key={role}
                          onClick={() => {
                            setSelectedRole(role);
                            setIsRoleDropdownOpen(false);
                            setSearchRoleDropdown('');
                            setCurrentPage(1);
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            selectedRole === role ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <span>{role === 'ALL' ? 'Tất cả vai trò' : role}</span>
                          {selectedRole === role && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                        </div>
                      ))}
                    {['ALL', ...availableRoles].filter(role => {
                      const label = role === 'ALL' ? 'Tất cả vai trò' : role;
                      return !searchRoleDropdown || label.toLowerCase().includes(searchRoleDropdown.toLowerCase());
                    }).length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-500 text-center">Không tìm thấy vai trò</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-variant/40">
            <h2 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-6 flex items-center gap-1.5">
              <ClipboardList className="w-5 h-5 text-primary" />
              <span>Các hội đồng được phân công chấm điểm</span>
            </h2>
            
            {paginatedBoards.length === 0 ? (
              <p className="text-slate-500 text-xs py-4">Không tìm thấy hội đồng nào phù hợp.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBoards.map((b, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-surface-variant/40 transition-all flex flex-col justify-between hover:border-primary"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                          {b.vai_tro}
                        </span>
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          {b.session?.dia_diem}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-on-surface leading-tight mb-3">
                        {b.session?.ten_hoi_dong}
                      </h3>

                      <div className="space-y-2 text-xs font-medium text-on-surface-variant">
                        <p className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Chủ tịch: <strong className="text-on-surface font-semibold">Thầy/Cô Hội đồng</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Lịch báo cáo: {new Date(b.session?.ngay_bao_cao).toLocaleDateString('vi-VN')}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>Số lượng đăng ký: <strong className="text-on-surface">{b.registrations?.length} sinh viên</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                      <h4 className="font-bold text-xs text-on-surface">Sinh viên báo cáo:</h4>
                      {b.registrations.length === 0 ? (
                        <p className="text-slate-400 text-xs italic">Chưa có sinh viên nào đăng ký.</p>
                      ) : (
                        <div className="divide-y divide-slate-100 max-h-[150px] overflow-y-auto pr-1">
                          {b.registrations.map(reg => (
                            <div key={reg.id} className="py-2 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-on-surface">{reg.sinhVien?.ho_ten}</span>
                                <span className="text-slate-400 ml-1.5 font-mono">({reg.sinhVien?.mssv})</span>
                                <p className="text-[10px] text-slate-500 font-medium">{reg.chuyenThamQuan?.nhaMay?.ten_nha_may}</p>
                              </div>
                              <button
                                onClick={() => handleOpenGrading(b, reg)}
                                className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-lg font-black uppercase tracking-wider text-[9px] cursor-pointer transition-colors"
                              >
                                Chấm điểm
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Pagination Footer */}
            <div className="mt-6 pt-4 border-t border-[#E7E0C4] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span>Hiển thị</span>
                <select 
                  value={limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    setLimit(newLimit);
                    setCurrentPage(1);
                  }}
                  className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
                <span>/ {filteredBoards.length} hội đồng</span>
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
      ) : (
        /* Workspace Tab View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Left panel: Students List inside Council */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-surface-variant/40 overflow-hidden flex flex-col h-[550px]">
            <div className="p-4 bg-slate-50 border-b border-surface-variant/45">
              <h3 className="font-bold text-xs text-on-surface-variant uppercase tracking-wider">
                Sinh viên báo cáo ({activeBoard?.session?.ten_hoi_dong || 'Hội đồng'})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {activeBoard?.registrations.map((reg) => {
                const isSelected = reg.id === selectedReg?.id;
                return (
                  <div
                    key={reg.id}
                    onClick={() => handleOpenGrading(activeBoard, reg)}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between border-2 ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-xs'
                        : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-105 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                        {reg.sinhVien?.ho_ten?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-on-surface truncate">{reg.sinhVien?.ho_ten}</p>
                        <p className="text-[10px] font-mono font-bold text-on-surface-variant mt-0.5">{reg.sinhVien?.mssv}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-yellow-750 border border-warning-yellow/30 rounded font-bold text-[9px] uppercase tracking-wider shrink-0">
                      Chọn
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Evaluation form */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-surface-variant/40 p-6 flex flex-col h-[550px] justify-between">
            {selectedReg ? (
              <form onSubmit={handleSaveCouncilGrade} className="flex flex-col h-full justify-between">
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-on-surface">{selectedReg.sinhVien?.ho_ten}</h2>
                      <p className="text-xs text-on-surface-variant font-semibold mt-0.5">
                        MSSV: <span className="font-mono text-on-surface">{selectedReg.sinhVien?.mssv}</span> | Lớp: <span className="text-on-surface">{selectedReg.sinhVien?.lop}</span>
                      </p>
                    </div>

                    <div className="text-right bg-[#e5ffdc] px-4 py-2 rounded-xl border border-primary/20">
                      <p className="text-[9px] font-bold text-[#476d01] uppercase tracking-wider">Điểm tổng đề xuất</p>
                      <p className="text-xl font-black text-primary font-mono">{currentAvg.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* Criteria Inputs */}
                  <div className="space-y-4 overflow-y-auto max-h-[280px] pr-2">
                    
                    {/* Score 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-dashed border-slate-100 pb-3">
                      <div className="md:col-span-8">
                        <h4 className="font-bold text-xs text-on-surface">Tiêu chí 1: Slide & Thuyết trình chuyên đề (Hệ số 40%)</h4>
                        <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Trình bày lưu loát, bố cục khoa học, thời lượng chuẩn.</p>
                      </div>
                      <div className="md:col-span-4 flex justify-end">
                        <div className="relative max-w-[120px]">
                          <input 
                            type="number" 
                            min="0" max="10" step="0.5"
                            value={score1}
                            onChange={(e) => setScore1(e.target.value)}
                            className="w-full px-3 py-1.5 font-mono font-bold text-sm text-center text-primary bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-primary/50"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ 10</span>
                        </div>
                      </div>
                    </div>

                    {/* Score 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-dashed border-slate-100 pb-3">
                      <div className="md:col-span-8">
                        <h4 className="font-bold text-xs text-on-surface">Tiêu chí 2: Trả lời vấn đáp phản biện (Hệ số 30%)</h4>
                        <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Nắm vững quy trình kỹ thuật tại nhà máy, giải thích mạch lạc.</p>
                      </div>
                      <div className="md:col-span-4 flex justify-end">
                        <div className="relative max-w-[120px]">
                          <input 
                            type="number" 
                            min="0" max="10" step="0.5"
                            value={score2}
                            onChange={(e) => setScore2(e.target.value)}
                            className="w-full px-3 py-1.5 font-mono font-bold text-sm text-center text-primary bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-primary/50"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ 10</span>
                        </div>
                      </div>
                    </div>

                    {/* Score 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-dashed border-slate-100 pb-3">
                      <div className="md:col-span-8">
                        <h4 className="font-bold text-xs text-on-surface">Tiêu chí 3: Bản thu hoạch nhật ký thực tế (Hệ số 30%)</h4>
                        <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Nhật ký chi tiết, đầy đủ hình minh họa sơ đồ thực tế.</p>
                      </div>
                      <div className="md:col-span-4 flex justify-end">
                        <div className="relative max-w-[120px]">
                          <input 
                            type="number" 
                            min="0" max="10" step="0.5"
                            value={score3}
                            onChange={(e) => setScore3(e.target.value)}
                            className="w-full px-3 py-1.5 font-mono font-bold text-sm text-center text-primary bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-primary/50"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ 10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Footer Action */}
                <div className="pt-4 border-t border-slate-105 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-5 py-2.5 text-xs text-on-surface-variant font-extrabold hover:text-on-surface border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>Lưu điểm Hội đồng</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-450 text-sm font-semibold text-center">
                <Gavel className="w-12 h-12 mb-2 text-slate-350" />
                <span>Vui lòng chọn sinh viên cần chấm điểm từ danh sách hội đồng bên trái.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

