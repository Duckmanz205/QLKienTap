import toast from 'react-hot-toast';
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
  ChevronDown,
  Layers,
  FileText,
  CheckCircle2,
  LayoutGrid,
  List,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { giangVienApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function HoiDongChamBaoCao_DSBuoi_GV() {
  const [lecturer, setLecturer] = useState(null);
  const [boards, setBoards] = useState([]);
  
  // Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Workspace Student Filter state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL'); // 'ALL' | 'UNSCORED' | 'SCORED'

  // Scoring state
  const [activeTab, setActiveTab] = useState('list');
  const [activeBoard, setActiveBoard] = useState(null);
  const [selectedReg, setSelectedReg] = useState(null);
  // Map of tripId -> string score value (e.g. { 12: '8.5', 13: '' })
  const [tripScores, setTripScores] = useState({});

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
      const data = res.data || [];
      setBoards(data);
      if (data.length > 0) {
        setActiveBoard(prev => {
          if (!prev) return data[0];
          return data.find(b => b.session?.id === prev.session?.id) || data[0];
        });
      }
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleOpenGrading = (board, item = null) => {
    setMessage('');
    setError('');
    setActiveBoard(board);

    const studentList = (board.students && board.students.length > 0) ? board.students : (board.registrations || []);
    // If item is not specified, prioritize picking first student with unscored trips
    const targetItem = item || studentList.find(st => {
      const trips = st.trips || [];
      const total = st.totalTrips || trips.length || 3;
      const scored = st.scoredCount ?? trips.filter(t => t.myScore != null).length;
      return total > 0 && scored < total;
    }) || studentList[0] || null;

    setSelectedReg(targetItem);

    if (targetItem) {
      const trips = targetItem.trips || [];
      const initialScores = {};
      trips.forEach(t => {
        const id = t.phieuThamQuanId || t.id;
        initialScores[id] = t.myScore != null ? t.myScore.toString() : '';
      });
      setTripScores(initialScores);
    } else {
      setTripScores({});
    }

    setActiveTab('grading');
  };

  const handleTripScoreChange = (tripId, value) => {
    setTripScores(prev => ({
      ...prev,
      [tripId]: value
    }));
  };

  const handleSaveAllCouncilGrades = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedReg || !activeBoard) return;

    const trips = selectedReg.trips || [];
    const toSave = [];

    for (const trip of trips) {
      const tripId = trip.phieuThamQuanId || trip.id;
      const rawVal = tripScores[tripId];
      if (rawVal !== undefined && rawVal !== null && rawVal.toString().trim() !== '') {
        const num = parseFloat(rawVal);
        if (isNaN(num) || num < 0 || num > 10) {
          toast.error(`Điểm chuyến "${trip.tenNhaMay}" phải nằm trong thang điểm từ 0 đến 10`);
          return;
        }
        toSave.push({
          tripId,
          score: Math.round(num * 10) / 10,
          tenNhaMay: trip.tenNhaMay
        });
      }
    }

    if (toSave.length === 0) {
      toast.error('Vui lòng nhập điểm cho ít nhất một chuyến tham quan');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    try {
      await Promise.all(
        toSave.map(item => 
          giangVienApi.submitBoardScore({
            memberId: activeBoard.memberId,
            phieuId: item.tripId,
            score: item.score
          })
        )
      );

      const succMsg = `Đã lưu điểm hội đồng cho ${toSave.length} chuyến của ${selectedReg.sinhVien?.ho_ten}!`;
      setMessage(succMsg);
      toast.success(succMsg);

      const refreshedBoards = await fetchBoards(lecturer.id);
      const currentBoard = refreshedBoards.find(b => b.session?.id === activeBoard.session?.id);
      if (currentBoard) {
        const freshStudent = currentBoard.students?.find(
          st => (selectedReg.boChuyenId && st.boChuyenId === selectedReg.boChuyenId) ||
                (st.sinhVien?.id === selectedReg.sinhVien?.id)
        );
        if (freshStudent) {
          setSelectedReg(freshStudent);
          const updatedScores = {};
          (freshStudent.trips || []).forEach(t => {
            const id = t.phieuThamQuanId || t.id;
            updatedScores[id] = t.myScore != null ? t.myScore.toString() : '';
          });
          setTripScores(updatedScores);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Chấm điểm hội đồng thất bại.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

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

  // Derived students inside active council for grading tab
  const activeCouncilStudents = useMemo(() => {
    if (!activeBoard) return [];
    return (activeBoard.students && activeBoard.students.length > 0) ? activeBoard.students : (activeBoard.registrations || []);
  }, [activeBoard]);

  const filteredCouncilStudents = useMemo(() => {
    return activeCouncilStudents.filter(st => {
      const sv = st.sinhVien;
      const q = studentSearch.trim().toLowerCase();
      const nameMatch = !q || 
        (sv?.ho_ten && sv.ho_ten.toLowerCase().includes(q)) || 
        (sv?.mssv && sv.mssv.toLowerCase().includes(q)) || 
        (sv?.ma_sv && sv.ma_sv.toLowerCase().includes(q));
      
      if (!nameMatch) return false;

      const trips = st.trips || [];
      const totalTrips = st.totalTrips || trips.length || 3;
      const scoredCount = st.scoredCount ?? trips.filter(t => t.myScore != null).length;
      const isFully = st.isFullyScored || (totalTrips > 0 && scoredCount === totalTrips);

      if (studentStatusFilter === 'UNSCORED') return !isFully;
      if (studentStatusFilter === 'SCORED') return isFully;
      return true;
    });
  }, [activeCouncilStudents, studentSearch, studentStatusFilter]);

  if (!lecturer) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải thông tin hội đồng...
      </div>
    );
  }

  // Calculated live average helper across all trips for the selected student
  const currentStudentTrips = selectedReg?.trips || [];
  const enteredTripValues = currentStudentTrips
    .map(t => {
      const id = t.phieuThamQuanId || t.id;
      const v = tripScores[id];
      return (v !== undefined && v !== null && v.toString().trim() !== '') ? parseFloat(v) : null;
    })
    .filter(v => v !== null && !isNaN(v) && v >= 0 && v <= 10);

  const projectedAvg = enteredTripValues.length > 0
    ? (enteredTripValues.reduce((a, b) => a + b, 0) / enteredTripValues.length).toFixed(1)
    : null;

  const hasAnyValidScore = enteredTripValues.length > 0;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header section with tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hội đồng chấm báo cáo</h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Nơi hội đồng chuyên môn đánh giá đồ án thu hoạch và báo cáo thực tế của sinh viên.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-2xs shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'list' ? 'bg-[#407F3E] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Danh sách buổi họp
          </button>
          <button
            onClick={() => {
              if (!selectedReg) {
                if (boards.length > 0) {
                  handleOpenGrading(activeBoard || boards[0]);
                  return;
                }
                toast.success('Vui lòng chọn sinh viên cần chấm điểm từ danh sách hội đồng trước.');
                return;
              }
              setActiveTab('grading');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'grading' ? 'bg-[#407F3E] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Màn hình chấm điểm
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#407F3E] px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'list' ? (
        /* Board meetings overview list */
        <div className="space-y-6 relative z-10">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap gap-4 items-center justify-between relative z-20">
            <div className="flex flex-wrap gap-4 items-center flex-1">
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
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:bg-white transition-all text-slate-800 font-medium"
                />
              </div>

              <div className="min-w-[200px]">
                <SearchableDropdown
                  value={selectedRole}
                  onChange={val => {
                    setSelectedRole(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 'ALL', label: 'Tất cả vai trò' },
                    ...availableRoles.map(role => ({ 
                      value: role, 
                      label: role === 'ChuTich' ? 'Chủ tịch' : role === 'ThuKy' ? 'Thư ký' : role === 'ThanhVien' ? 'Thành viên' : role 
                    }))
                  ]}
                  className="w-full"
                  searchPlaceholder="Tìm vai trò..."
                />
              </div>
            </div>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#407F3E] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng thẻ lưới"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Lưới</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#407F3E] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng bảng"
              >
                <List className="w-3.5 h-3.5" />
                <span>Bảng</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#407F3E]" />
                <span>Các hội đồng được phân công chấm điểm ({filteredBoards.length})</span>
              </h2>
            </div>
            
            {paginatedBoards.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <ClipboardList className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  {searchQuery ? 'Không tìm thấy hội đồng phù hợp' : 'Chưa có hội đồng được phân công'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {searchQuery 
                    ? 'Không có buổi hội đồng nào khớp với từ khóa tìm kiếm của bạn.' 
                    : 'Bạn chưa được phân công tham gia hội đồng chấm báo cáo nào trong đợt này. Vui lòng liên hệ Quản lý Khoa để được xếp lịch.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW: Compact, balanced cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBoards.map((b, idx) => {
                  const studentList = (b.students && b.students.length > 0) ? b.students : (b.registrations || []);
                  const totalStudents = studentList.length;
                  const fullyScoredStudents = studentList.filter(st => {
                    const trips = st.trips || [];
                    const total = st.totalTrips || trips.length || 3;
                    const scored = st.scoredCount ?? trips.filter(t => t.myScore != null).length;
                    return total > 0 && scored === total;
                  }).length;
                  const totalTripsCouncil = studentList.reduce((acc, st) => acc + (st.totalTrips || st.trips?.length || 3), 0);
                  const totalScoredCouncil = studentList.reduce((acc, st) => acc + (st.scoredCount ?? (st.trips?.filter(t => t.myScore != null).length || 0)), 0);
                  const percent = totalTripsCouncil > 0 ? Math.round((totalScoredCouncil / totalTripsCouncil) * 100) : 0;
                  const isAllDone = totalStudents > 0 && fullyScoredStudents === totalStudents;

                  return (
                    <div 
                      key={b.session?.id || idx}
                      className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 transition-all flex flex-col justify-between hover:border-[#407F3E] hover:shadow-sm"
                    >
                      <div>
                        {/* Header: Role + Room */}
                        <div className="flex justify-between items-center mb-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.vai_tro === 'ChuTich' || b.vai_tro === 'Chủ tịch'
                              ? 'bg-emerald-50 text-[#407F3E] border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {b.vai_tro === 'ChuTich' ? 'Chủ tịch' : b.vai_tro === 'ThuKy' ? 'Thư ký' : b.vai_tro === 'ThanhVien' ? 'Thành viên' : b.vai_tro}
                          </span>
                          <span className="text-xs font-bold text-slate-500 font-mono flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {b.session?.dia_diem || 'Chưa xếp phòng'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-base text-slate-800 leading-tight mb-2.5">
                          {b.session?.ten_hoi_dong}
                        </h3>

                        {/* Metadata details */}
                        <div className="space-y-1.5 text-xs font-medium text-slate-600 mb-3.5">
                          <p className="flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">Đợt: <strong className="text-slate-800 font-semibold">{b.session?.dotKienTap?.ten_dot || 'Chưa cập nhật'}</strong></span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Lịch báo cáo: <strong className="text-slate-800">{b.session?.ngay_bao_cao ? new Date(b.session.ngay_bao_cao).toLocaleDateString('vi-VN') : 'Chưa xếp'}</strong></span>
                          </p>
                        </div>

                        {/* Progress Bar Section */}
                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 mb-3.5">
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-slate-600 font-medium">Tiến độ chấm điểm:</span>
                            <span className={`font-mono font-bold ${isAllDone ? 'text-emerald-700' : 'text-slate-700'}`}>
                              {fullyScoredStudents}/{totalStudents} SV ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${isAllDone ? 'bg-emerald-600' : 'bg-[#407F3E]'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
                            <span>Đã chấm: {totalScoredCouncil}/{totalTripsCouncil} chuyến</span>
                            {isAllDone && (
                              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Compact Student List (max 3 preview) */}
                        <div className="space-y-1.5 mb-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              Sinh viên báo cáo ({totalStudents})
                            </span>
                          </div>
                          {totalStudents === 0 ? (
                            <p className="text-slate-400 text-xs italic py-1">Chưa có sinh viên nào được phân công.</p>
                          ) : (
                            <div className="space-y-1">
                              {studentList.slice(0, 3).map((st, sIdx) => {
                                const sv = st.sinhVien;
                                const trips = st.trips || [];
                                const totalTrips = st.totalTrips || trips.length || 3;
                                const scoredCount = st.scoredCount ?? trips.filter(t => t.myScore != null).length;
                                const isFully = st.isFullyScored || (totalTrips > 0 && scoredCount === totalTrips);

                                return (
                                  <div key={st.boChuyenId || st.id || sIdx} className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                                    <div className="truncate pr-2">
                                      <span className="font-semibold text-slate-800">{sv?.ho_ten}</span>
                                      <span className="text-slate-400 text-[11px] font-mono ml-1">({sv?.mssv || sv?.ma_sv || '—'})</span>
                                    </div>
                                    {isFully ? (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono shrink-0">
                                        {st.overallMyAvg != null ? `${Number(st.overallMyAvg).toFixed(1)}đ` : `${totalTrips}/${totalTrips}`}
                                      </span>
                                    ) : scoredCount > 0 ? (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono shrink-0">
                                        {scoredCount}/{totalTrips} chuyến
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 font-mono shrink-0">
                                        0/{totalTrips}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                              {totalStudents > 3 && (
                                <p className="text-[11px] text-slate-400 italic text-right pr-1">
                                  + {totalStudents - 3} sinh viên khác...
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Single Primary Action */}
                      <div className="pt-3 border-t border-slate-100 mt-2">
                        <button
                          onClick={() => handleOpenGrading(b)}
                          className="w-full py-2.5 px-4 bg-[#407F3E] hover:bg-[#326631] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
                        >
                          <Gavel className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                          <span>{isAllDone ? 'Xem lại kết quả chấm' : 'Vào phòng chấm điểm'}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW: Compact tabular layout */
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tên hội đồng</th>
                      <th className="py-3 px-4">Phòng họp</th>
                      <th className="py-3 px-4">Đợt kiến tập</th>
                      <th className="py-3 px-4">Lịch báo cáo</th>
                      <th className="py-3 px-4">Vai trò</th>
                      <th className="py-3 px-4 text-center">Số SV</th>
                      <th className="py-3 px-4 min-w-[180px]">Tiến độ chấm</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedBoards.map((b, idx) => {
                      const studentList = (b.students && b.students.length > 0) ? b.students : (b.registrations || []);
                      const totalStudents = studentList.length;
                      const fullyScoredStudents = studentList.filter(st => {
                        const trips = st.trips || [];
                        const total = st.totalTrips || trips.length || 3;
                        const scored = st.scoredCount ?? trips.filter(t => t.myScore != null).length;
                        return total > 0 && scored === total;
                      }).length;
                      const totalTripsCouncil = studentList.reduce((acc, st) => acc + (st.totalTrips || st.trips?.length || 3), 0);
                      const totalScoredCouncil = studentList.reduce((acc, st) => acc + (st.scoredCount ?? (st.trips?.filter(t => t.myScore != null).length || 0)), 0);
                      const percent = totalTripsCouncil > 0 ? Math.round((totalScoredCouncil / totalTripsCouncil) * 100) : 0;
                      const isAllDone = totalStudents > 0 && fullyScoredStudents === totalStudents;

                      return (
                        <tr key={b.session?.id || idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {b.session?.ten_hoi_dong}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                            {b.session?.dia_diem || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {b.session?.dotKienTap?.ten_dot || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {b.session?.ngay_bao_cao ? new Date(b.session.ngay_bao_cao).toLocaleDateString('vi-VN') : 'Chưa xếp'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.vai_tro === 'ChuTich' || b.vai_tro === 'Chủ tịch'
                                ? 'bg-emerald-50 text-[#407F3E] border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {b.vai_tro === 'ChuTich' ? 'Chủ tịch' : b.vai_tro === 'ThuKy' ? 'Thư ký' : b.vai_tro === 'ThanhVien' ? 'Thành viên' : b.vai_tro}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                            {totalStudents}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-semibold text-slate-700">{fullyScoredStudents}/{totalStudents} SV</span>
                                <span className="font-mono text-slate-500">{percent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isAllDone ? 'bg-emerald-600' : 'bg-[#407F3E]'}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenGrading(b)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#407F3E] hover:bg-[#326631] text-white rounded-lg font-bold text-[11px] uppercase tracking-wider shadow-2xs transition-all cursor-pointer"
                            >
                              <Gavel className="w-3 h-3" />
                              <span>{isAllDone ? 'Xem lại' : 'Chấm điểm'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span>Hiển thị</span>
                <SearchableDropdown 
                  options={[
                    { value: 6, label: '6' },
                    { value: 12, label: '12' },
                    { value: 24, label: '24' },
                    { value: 48, label: '48' }
                  ]}
                  value={limit}
                  onChange={(newLimit) => {
                    setLimit(newLimit);
                    setCurrentPage(1);
                  }}
                  searchPlaceholder="Tìm số lượng..."
                  className="min-w-[80px]"
                />
                <span>/ {filteredBoards.length} hội đồng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  Trang đầu
                </button>
                <button 
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  Trước
                </button>
                <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-xs cursor-default mx-1">
                  Trang {currentPage} / {totalPages}
                </span>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  Sau
                </button>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  Trang cuối
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Workspace Tab View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* Left panel: Students List inside Council */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-[580px]">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider truncate max-w-[200px]" title={activeBoard?.session?.ten_hoi_dong}>
                  SV báo cáo ({activeCouncilStudents.length})
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {activeBoard?.session?.dia_diem || 'Chưa xếp'}
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên hoặc MSSV..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E] transition-all"
                />
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('ALL')}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                    studentStatusFilter === 'ALL'
                      ? 'bg-[#407F3E] text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({activeCouncilStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('UNSCORED')}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                    studentStatusFilter === 'UNSCORED'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Chưa xong ({activeCouncilStudents.filter(st => {
                    const trips = st.trips || [];
                    const total = st.totalTrips || trips.length || 3;
                    const scored = st.scoredCount ?? trips.filter(t => t.myScore != null).length;
                    return !(st.isFullyScored || (total > 0 && scored === total));
                  }).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('SCORED')}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                    studentStatusFilter === 'SCORED'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Đã xong ({activeCouncilStudents.filter(st => {
                    const trips = st.trips || [];
                    const total = st.totalTrips || trips.length || 3;
                    const scored = st.scoredCount ?? trips.filter(t => t.myScore != null).length;
                    return st.isFullyScored || (total > 0 && scored === total);
                  }).length})
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {filteredCouncilStudents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 italic">
                  Không tìm thấy sinh viên phù hợp.
                </div>
              ) : (
                filteredCouncilStudents.map((st, idx) => {
                  const sv = st.sinhVien;
                  const isSelected = (selectedReg?.boChuyenId && selectedReg.boChuyenId === st.boChuyenId) || (selectedReg?.id === st.id) || (selectedReg?.sinhVien?.id === sv?.id);
                  const trips = st.trips || [];
                  const totalTrips = st.totalTrips || trips.length || 3;
                  const scoredCount = st.scoredCount ?? trips.filter(t => t.myScore != null).length;
                  const isFully = st.isFullyScored || (totalTrips > 0 && scoredCount === totalTrips);

                  return (
                    <div
                      key={st.boChuyenId || st.id || idx}
                      onClick={() => handleOpenGrading(activeBoard, st)}
                      className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between border-2 ${
                        isSelected
                          ? 'bg-[#407F3E]/5 border-[#407F3E] shadow-2xs'
                          : 'hover:bg-slate-50 border-transparent'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-xs text-slate-800 truncate">{sv?.ho_ten}</p>
                        <p className="text-[10px] font-mono font-medium text-slate-500 mt-0.5">{sv?.mssv || sv?.ma_sv || '—'} - {sv?.ten_lop || sv?.lop || ''}</p>
                      </div>
                      {isFully ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold text-[9px] uppercase tracking-wider shrink-0 font-mono">
                          {st.overallMyAvg != null ? `${Number(st.overallMyAvg).toFixed(1)}đ` : `${totalTrips}/${totalTrips}`}
                        </span>
                      ) : scoredCount > 0 ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold text-[9px] uppercase tracking-wider shrink-0 font-mono">
                          {scoredCount}/{totalTrips} chuyến
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded font-bold text-[9px] uppercase tracking-wider shrink-0 font-mono">
                          0/{totalTrips} chuyến
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: Evaluation form */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col h-[580px] justify-between">
            {selectedReg ? (() => {
              const trips = selectedReg.trips || [];
              const totalTrips = selectedReg.totalTrips || trips.length || 3;
              const scoredCount = selectedReg.scoredCount ?? trips.filter(t => t.myScore != null).length;

              return (
                <form onSubmit={handleSaveAllCouncilGrades} className="flex flex-col h-full justify-between">
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">{selectedReg.sinhVien?.ho_ten}</h2>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          MSSV: <span className="font-mono text-slate-800">{selectedReg.sinhVien?.mssv || selectedReg.sinhVien?.ma_sv}</span> | Lớp: <span className="text-slate-800">{selectedReg.sinhVien?.ten_lop || selectedReg.sinhVien?.lop || 'Chưa cập nhật'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tiến độ chấm</p>
                          <p className="text-sm font-bold text-slate-800 font-mono">
                            {scoredCount} / {totalTrips} chuyến
                          </p>
                        </div>
                        <div className="text-right bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
                          <p className="text-[9px] font-bold text-[#407F3E] uppercase tracking-wider">ĐTB các chuyến</p>
                          <p className="text-sm font-black text-[#407F3E] font-mono">
                            {selectedReg.overallMyAvg != null ? `${Number(selectedReg.overallMyAvg).toFixed(1)}đ` : (projectedAvg ? `${projectedAvg}đ` : '—')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section title */}
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#407F3E]" />
                        <span>Chấm điểm báo cáo các chuyến tham quan ({trips.length} chuyến):</span>
                      </label>
                      <span className="text-[10px] text-slate-400 italic">
                        * Nhập điểm trực tiếp từ 0 đến 10 cho từng chuyến
                      </span>
                    </div>

                    {/* All 3 trips list on the same screen */}
                    <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
                      {trips.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4 text-center">Sinh viên chưa có chuyến tham quan nào.</p>
                      ) : (
                        trips.map((trip, idx) => {
                          const tripId = trip.phieuThamQuanId || trip.id;
                          const currentScore = tripScores[tripId] ?? '';
                          const hasScore = trip.myScore != null;

                          return (
                            <div
                              key={tripId || idx}
                              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              {/* Left: Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="w-5 h-5 rounded-md bg-slate-200/80 text-slate-700 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                                    #{idx + 1}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    trip.hinhThuc === 'TrucTiep' 
                                      ? 'bg-emerald-100 text-[#407F3E]' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${trip.hinhThuc === 'TrucTiep' ? 'bg-[#407F3E]' : 'bg-blue-600'}`}></span>
                                    {trip.hinhThuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
                                  </span>
                                  {hasScore ? (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono font-bold text-[10px]">
                                      Đã chấm: {Number(trip.myScore).toFixed(1)}đ
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium text-[10px]">
                                      Chưa chấm
                                    </span>
                                  )}
                                </div>

                                <h4 className="font-bold text-sm text-slate-800 truncate" title={trip.tenNhaMay}>
                                  {trip.tenNhaMay}
                                </h4>
                                {trip.diaDiem && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                    {trip.diaDiem}
                                  </p>
                                )}
                              </div>

                              {/* Right: Score input */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <span className="text-xs font-bold text-slate-600 hidden sm:inline">Điểm:</span>
                                <div className="relative w-28">
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    placeholder="—"
                                    value={currentScore}
                                    onChange={(e) => handleTripScoreChange(tripId, e.target.value)}
                                    className="w-full pl-3 pr-9 py-2 font-mono font-bold text-base text-center text-[#407F3E] bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#407F3E] focus:ring-2 focus:ring-[#407F3E]/20 shadow-2xs transition-all"
                                  />
                                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ 10</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Form Footer Action */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="px-4 py-2.5 text-xs text-slate-600 font-bold hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                    >
                      Hủy bỏ
                    </button>

                    <div className="flex items-center gap-3">
                      {projectedAvg && (
                        <span className="text-xs font-semibold text-slate-600">
                          ĐTB dự kiến: <strong className="font-mono text-emerald-700 text-sm font-black">{projectedAvg}đ</strong>
                        </span>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !hasAnyValidScore}
                        className="px-6 py-2.5 bg-[#407F3E] hover:bg-[#326631] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Gavel className="w-4 h-4" />
                        <span>
                          {loading 
                            ? 'Đang lưu...' 
                            : 'Lưu điểm hội đồng'}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              );
            })() : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm font-semibold text-center">
                <Gavel className="w-12 h-12 mb-2 text-slate-300" />
                <span>Vui lòng chọn sinh viên cần chấm điểm từ danh sách hội đồng bên trái.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
