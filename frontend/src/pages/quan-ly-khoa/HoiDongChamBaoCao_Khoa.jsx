import toast from 'react-hot-toast';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, ChevronDown, Check, X, Search, ChevronRight, ChevronLeft, Calendar, MapPin, Users,
  Edit2, Trash2, Lock, Unlock, UserMinus, AlertCircle, RefreshCw, Award, MoreVertical, Eye
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function HoiDongChamBaoCao_Khoa() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);

  // Modal Dropdown States (Create)
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState('');
  const [editDateTime, setEditDateTime] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Detail Modal Students & Lock State
  const [boardStudents, setBoardStudents] = useState([]);
  const [isFetchingStudentsDetail, setIsFetchingStudentsDetail] = useState(false);
  const [isLockingBoard, setIsLockingBoard] = useState(false);

  // Assign Students Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningBoard, setAssigningBoard] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedAvailableStudents, setSelectedAvailableStudents] = useState([]);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [actionMenu, setActionMenu] = useState(null);

  useEffect(() => {
    const handleClose = () => {
      setActionMenu(null);
    };
    if (actionMenu) {
      window.addEventListener('click', handleClose);
      window.addEventListener('scroll', handleClose, true);
      window.addEventListener('resize', handleClose);
      return () => {
        window.removeEventListener('click', handleClose);
        window.removeEventListener('scroll', handleClose, true);
        window.removeEventListener('resize', handleClose);
      };
    }
  }, [actionMenu]);

  // Form States (Create)
  const [boardName, setBoardName] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [room, setRoom] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSubmittingBoard, setIsSubmittingBoard] = useState(false);

  // Data
  const [campaigns, setCampaigns] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lock Bo Chuyen State
  const [selectedDotForLock, setSelectedDotForLock] = useState(null);
  const [isBoChuyenLocked, setIsBoChuyenLocked] = useState(false);
  const [isTogglingLock, setIsTogglingLock] = useState(false);

  // Confirmation Modal State (Popup thay thế cho alert/confirm mặc định)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning', // 'warning' | 'danger' | 'info'
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    onConfirm: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const checkBoChuyenLock = async (dotId) => {
    if (!dotId) return;
    try {
      const res = await khoaApi.getBoChuyenLockStatus(dotId);
      setIsBoChuyenLocked(res.data?.isLocked || false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLockBoChuyen = () => {
    if (!selectedDotForLock) {
      toast.error('Vui lòng chọn đợt kiến tập');
      return;
    }
    const dot = campaigns.find(c => c.id === Number(selectedDotForLock));
    const dotName = dot?.ten_dot || `Đợt #${selectedDotForLock}`;
    const nextLocked = !isBoChuyenLocked;

    setConfirmModal({
      isOpen: true,
      title: nextLocked ? 'Khóa chọn bộ 3 chuyến' : 'Mở khóa chọn bộ 3 chuyến',
      message: nextLocked
        ? `Xác nhận KHÓA cổng đăng ký Bộ 3 chuyến cho "${dotName}"? Toàn bộ sinh viên trong đợt này sẽ không thể đăng ký mới hoặc thay đổi bộ chuyến.`
        : `Xác nhận MỞ KHÓA cổng đăng ký Bộ 3 chuyến cho "${dotName}"? Sinh viên đủ điều kiện sẽ có thể đăng ký hoặc thay đổi bộ 3 chuyến theo nguyện vọng.`,
      type: nextLocked ? 'warning' : 'info',
      confirmText: nextLocked ? 'Khóa cổng' : 'Mở khóa',
      cancelText: 'Hủy bỏ',
      onConfirm: async () => {
        try {
          setIsTogglingLock(true);
          const res = await khoaApi.toggleLockBoChuyen(selectedDotForLock, { isLocked: nextLocked });
          setIsBoChuyenLocked(nextLocked);
          toast.success(res.data?.message || (nextLocked ? 'Đã khóa cổng đăng ký bộ chuyến' : 'Đã mở khóa cổng đăng ký bộ chuyến'));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi thao tác khóa cổng');
        } finally {
          setIsTogglingLock(false);
        }
      }
    });
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [campRes, lecRes, boardRes] = await Promise.all([
        khoaApi.getCampaigns({ limit: 100 }),
        khoaApi.getLecturers(),
        khoaApi.getBoards()
      ]);
      const camps = campRes.data?.data || campRes.data || [];
      setCampaigns(camps);
      setLecturers(lecRes.data || []);

      if (camps.length > 0) {
        setSelectedDotForLock(prev => {
          const activeId = prev || camps[0].id;
          checkBoChuyenLock(activeId);
          return activeId;
        });
      }
      
      const formattedBoards = (boardRes.data || []).map(b => ({
        id: b.id,
        dot_kien_tap_id: b.dot_kien_tap_id,
        raw_ngay_bao_cao: b.ngay_bao_cao,
        ten: b.ten_hoi_dong,
        lich: b.dotKienTap?.ten_dot || 'Đợt kiến tập',
        ngay: b.ngay_bao_cao ? new Date(b.ngay_bao_cao).toLocaleDateString('vi-VN') : '',
        gio: b.ngay_bao_cao ? new Date(b.ngay_bao_cao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
        diaDiem: b.dia_diem,
        members: b.members || [],
        sv: b.sv || 0,
      }));
      setCommittees(formattedBoards);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải dữ liệu hội đồng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!selectedSchedule || !boardName || !dateTime || !room) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc');
      return;
    }
    try {
      setIsSubmittingBoard(true);
      const res = await khoaApi.createBoard({
        dotKienTapId: selectedSchedule,
        name: boardName,
        date: dateTime,
        room: room
      });
      
      const boardId = res.data.id;
      
      // add board members
      for (const member of selectedMembers) {
        await khoaApi.addBoardMember({
          boardId,
          lecturerId: member.id,
          role: member.role
        });
      }

      toast.success('Tạo hội đồng thành công!');
      setIsModalOpen(false);
      setBoardName('');
      setSelectedSchedule('');
      setDateTime('');
      setRoom('');
      setSelectedMembers([]);
      fetchData();

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi tạo hội đồng');
    } finally {
      setIsSubmittingBoard(false);
    }
  };

  const handleOpenEdit = (board) => {
    setEditingBoardId(board.id);
    setEditBoardName(board.ten);
    if (board.raw_ngay_bao_cao) {
      const d = new Date(board.raw_ngay_bao_cao);
      const pad = num => String(num).padStart(2, '0');
      const formattedDt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setEditDateTime(formattedDt);
    } else {
      setEditDateTime('');
    }
    setEditRoom(board.diaDiem || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateBoard = async (e) => {
    e.preventDefault();
    if (!editBoardName || !editDateTime || !editRoom) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc');
      return;
    }
    try {
      setIsSubmittingEdit(true);
      await khoaApi.updateBoard(editingBoardId, {
        name: editBoardName,
        date: editDateTime,
        room: editRoom
      });
      toast.success('Cập nhật thông tin hội đồng thành công!');
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi cập nhật hội đồng');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteBoard = (board) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa buổi hội đồng',
      message: `Bạn có chắc chắn muốn xóa hội đồng "${board.ten}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      confirmText: 'Xóa hội đồng',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          await khoaApi.deleteBoard(board.id);
          toast.success('Đã xóa hội đồng thành công!');
          fetchData();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Không thể xóa hội đồng (có thể đã có giảng viên chấm điểm)');
        }
      }
    });
  };

  const handleOpenDetail = async (board) => {
    setViewingDetail(board);
    setIsFetchingStudentsDetail(true);
    setBoardStudents([]);
    try {
      const res = await khoaApi.getBoardStudents(board.id);
      setBoardStudents(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách sinh viên của hội đồng');
    } finally {
      setIsFetchingStudentsDetail(false);
    }
  };

  const handleUnassignStudent = (boChuyenId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hủy phân công sinh viên',
      message: 'Bạn có chắc chắn muốn hủy phân công sinh viên này khỏi hội đồng?',
      type: 'warning',
      confirmText: 'Hủy phân công',
      cancelText: 'Đóng',
      onConfirm: async () => {
        try {
          await khoaApi.unassignStudentsFromBoard(viewingDetail.id, [boChuyenId]);
          toast.success('Đã hủy phân công sinh viên khỏi hội đồng');
          const res = await khoaApi.getBoardStudents(viewingDetail.id);
          setBoardStudents(res.data || []);
          fetchData();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Lỗi hủy phân công');
        }
      }
    });
  };

  const handleLockBoard = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Khóa điểm hội đồng',
      message: `Xác nhận khóa điểm hội đồng "${viewingDetail.ten}"? Điểm hội đồng của các sinh viên sẽ được chốt và đồng bộ.`,
      type: 'warning',
      confirmText: 'Khóa điểm',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          setIsLockingBoard(true);
          const res = await khoaApi.lockBoard(viewingDetail.id);
          toast.success(res.data?.message || 'Khóa điểm hội đồng thành công!');
          const updatedStudents = await khoaApi.getBoardStudents(viewingDetail.id);
          setBoardStudents(updatedStudents.data || []);
          fetchData();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Lỗi khóa điểm hội đồng');
        } finally {
          setIsLockingBoard(false);
        }
      }
    });
  };

  // Close all modal dropdowns
  const closeAllModalDropdowns = () => {
    setIsLichDropdownOpen(false);
    setIsMembersOpen(false);
  };

  const handleOpenAssignModal = async (board) => {
    setAssigningBoard(board);
    setIsAssignModalOpen(true);
    setSelectedAvailableStudents([]);
    setIsFetchingStudents(true);
    try {
      const res = await khoaApi.getAvailableStudentsForBoard(board.dot_kien_tap_id);
      setAvailableStudents(res.data || []);
    } catch (err) {
      toast.error('Lỗi tải danh sách sinh viên');
    } finally {
      setIsFetchingStudents(false);
    }
  };

  const handleAssignStudents = async (e) => {
    e.preventDefault();
    if (selectedAvailableStudents.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sinh viên');
      return;
    }
    try {
      await khoaApi.assignStudentsToBoard(assigningBoard.id, selectedAvailableStudents);
      toast.success('Phân công sinh viên thành công!');
      setIsAssignModalOpen(false);

      // Nếu Modal chi tiết đang mở cho hội đồng này, cập nhật ngay danh sách sinh viên
      if (viewingDetail && viewingDetail.id === assigningBoard?.id) {
        setIsFetchingStudentsDetail(true);
        try {
          const res = await khoaApi.getBoardStudents(viewingDetail.id);
          const studentList = res.data || [];
          setBoardStudents(studentList);
          setViewingDetail(prev => prev ? { ...prev, sv: studentList.length } : null);
        } catch (detailErr) {
          console.error('Lỗi cập nhật danh sách sinh viên sau phân công:', detailErr);
        } finally {
          setIsFetchingStudentsDetail(false);
        }
      }

      fetchData();
    } catch (err) {
      toast.error('Lỗi phân công sinh viên');
    }
  };

  const handleModalDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllModalDropdowns();
    setter(true);
  };

  // Filter & Pagination logic
  const filteredCommittees = useMemo(() => {
    return committees.filter(c => {
      const matchSearch = !searchTerm || 
        c.ten?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.lich?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.diaDiem?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [committees, searchTerm]);

  const totalPages = Math.ceil(filteredCommittees.length / limit) || 1;
  const paginatedCommittees = filteredCommittees.slice((currentPage - 1) * limit, currentPage * limit);

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ChuTich': return 'Chủ tịch';
      case 'ThuKy': return 'Thư ký';
      case 'ThanhVien': return 'Thành viên';
      default: return role || 'Thành viên';
    }
  };

  return (
    <div 
      className="min-h-[calc(100vh-64px)] p-6 lg:p-8 space-y-6 relative"
      onClick={() => {
        setActionMenu(null);
        setIsStatusDropdownOpen(false);
      }}
    >
      {/* Header section: Tiêu đề bên trái, nhóm hành động cùng một hàng bên phải */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hội đồng chấm báo cáo</h1>
          <p className="text-sm text-slate-500 font-normal mt-1">Quản lý các buổi hội đồng báo cáo chuyên đề và phân công chấm điểm khóa luận/kiến tập</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Selector Đợt tích hợp nút Khóa cổng thành 1 khối pill tinh gọn */}
          {campaigns.length > 0 && (
            <div className="inline-flex items-center bg-white rounded-xl border border-slate-200 shadow-2xs p-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600">
                <span className="text-slate-400 font-semibold">Đợt:</span>
                <select
                  value={selectedDotForLock || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSelectedDotForLock(val);
                    checkBoChuyenLock(val);
                  }}
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                >
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.ten_dot || `Đợt #${c.id}`}</option>
                  ))}
                </select>
              </div>

              <div className="h-4 w-px bg-slate-200"></div>

              <button
                type="button"
                onClick={handleToggleLockBoChuyen}
                disabled={isTogglingLock}
                className={`ml-1 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isBoChuyenLocked
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                } active:scale-[0.98] disabled:opacity-50`}
                title={isBoChuyenLocked ? 'Nhấn để mở khóa cho sinh viên chọn bộ chuyến' : 'Nhấn để khóa không cho sinh viên chọn bộ chuyến'}
              >
                {isBoChuyenLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mở khóa bộ chuyến</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Khóa chọn bộ chuyến</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Nút chính: Tạo buổi hội đồng */}
          <button 
            onClick={() => { setIsModalOpen(true); }} 
            className="px-4 py-2 bg-[#407F3E] hover:bg-[#326631] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo buổi hội đồng</span>
          </button>
        </div>
      </div>

      {/* Card thống nhất: Gộp Toolbar bộ lọc + Bảng danh sách + Phân trang */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Toolbar bộ lọc */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          {/* Ô tìm kiếm co giãn flex-1 */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm theo tên hội đồng, lịch, địa điểm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-10 pr-9 border border-slate-200 rounded-xl text-sm bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#407F3E]/20 focus:border-[#407F3E] text-slate-700 font-medium placeholder:text-slate-400 transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Skeleton loading khi tải */}
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-14 bg-slate-100/70 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredCommittees.length === 0 ? (
          /* Trạng thái rỗng: Căn giữa, có icon minh họa, thông điệp và nút hành động tương ứng */
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
            {searchTerm ? (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3.5 shadow-2xs">
                  <Search className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Không tìm thấy kết quả phù hợp</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-4 font-normal">
                  Không tìm thấy hội đồng nào khớp với từ khóa tìm kiếm của bạn. Hãy thử tìm từ khóa khác.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Xóa tìm kiếm
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#407F3E]/10 border border-[#407F3E]/20 flex items-center justify-center text-[#407F3E] mb-3.5 shadow-2xs">
                  <Calendar className="w-8 h-8 stroke-[1.75]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Chưa có hội đồng nào</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-4 font-normal">
                  Hãy tạo buổi hội đồng đầu tiên cho đợt này để phân công thành viên và xếp lịch chấm điểm.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-[#407F3E] hover:bg-[#326631] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo buổi hội đồng</span>
                </button>
              </>
            )}
          </div>
        ) : (
          /* Bảng dữ liệu: Bố cục hợp lý, không cuộn ngang trên desktop */
          <div className="overflow-x-auto min-h-[140px]">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[12px] font-bold uppercase tracking-wider text-slate-700 select-none">
                  <th className="py-3.5 px-4 pl-6 font-bold">Tên hội đồng</th>
                  <th className="py-3.5 px-4 font-bold">Lịch kiến tập</th>
                  <th className="py-3.5 px-4 font-bold">Ngày giờ</th>
                  <th className="py-3.5 px-4 font-bold">Địa điểm</th>
                  <th className="py-3.5 px-4 font-bold">Thành viên</th>
                  <th className="py-3.5 px-3 text-center font-bold whitespace-nowrap">Số SV</th>
                  <th className="py-3.5 px-4 pr-6 text-right font-bold w-14 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {paginatedCommittees.map(c => {
                  const displayMembers = c.members.slice(0, 3);
                  const extraMembers = c.members.length - 3;
                  
                  return (
                    <tr 
                      key={c.id} 
                      onClick={() => handleOpenDetail(c)}
                      className="hover:bg-slate-50/80 transition-colors h-14 cursor-pointer group"
                      title="Nhấp để xem chi tiết hội đồng"
                    >
                      <td className="py-3 px-4 pl-6 font-bold text-slate-800">
                        <div className="line-clamp-2 group-hover:text-[#407F3E] transition-colors" title={c.ten}>{c.ten}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        <div className="text-xs sm:text-sm line-clamp-1" title={c.lich}>{c.lich}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700 text-xs sm:text-sm">{c.ngay}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{c.gio}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px]" title={c.diaDiem}>{c.diaDiem}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {c.members.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">Chưa phân công</span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <Users className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />
                              <span>{c.members.length} giảng viên</span>
                            </div>
                            <div 
                              className="text-[11px] text-slate-500 truncate max-w-[150px]" 
                              title={c.members.map(m => `${m.giangVien?.ho_ten || 'GV'} (${getRoleLabel(m.vai_tro)})`).join(', ')}
                            >
                              {c.members.map(m => m.giangVien?.ho_ten).filter(Boolean).join(', ')}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#407F3E]/10 text-[#407F3E]">
                          {c.sv}
                        </span>
                      </td>
                      <td className="py-3 px-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (actionMenu?.board?.id === c.id) {
                                setActionMenu(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const isDropup = spaceBelow < 220;

                                setActionMenu({
                                  board: c,
                                  top: isDropup ? rect.top - 6 : rect.bottom + 6,
                                  right: window.innerWidth - rect.right,
                                  isDropup,
                                });
                              }
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              actionMenu?.board?.id === c.id 
                                ? 'bg-slate-100 text-slate-800' 
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Tùy chọn thao tác"
                            aria-label="Tùy chọn thao tác"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Thanh phân trang: Gọn gàng và chỉ hiển thị khi có dữ liệu */}
        {!isLoading && filteredCommittees.length > 0 && (
          <div className="p-4 sm:px-6 border-t border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2">
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
                searchPlaceholder="Số lượng..."
                className="min-w-[76px]"
              />
              <span>/ tổng <strong className="text-slate-700">{filteredCommittees.length}</strong> hội đồng</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
                aria-label="Trang trước"
              >
                Trước
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-[#407F3E] text-white text-xs sm:text-sm font-bold shadow-xs cursor-default">
                {currentPage} / {totalPages}
              </span>
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
                aria-label="Trang sau"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Dropdown Menu - Vị trí fixed không bị clip bởi overflow của bảng */}
      {actionMenu && (
        <div 
          style={{
            position: 'fixed',
            top: actionMenu.isDropup ? undefined : `${actionMenu.top}px`,
            bottom: actionMenu.isDropup ? `${window.innerHeight - actionMenu.top}px` : undefined,
            right: `${actionMenu.right}px`,
          }}
          className="w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-1 text-left animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              const b = actionMenu.board;
              setActionMenu(null);
              handleOpenDetail(b);
            }}
            className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Chi tiết & Khóa điểm</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const b = actionMenu.board;
              setActionMenu(null);
              handleOpenEdit(b);
            }}
            className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Chỉnh sửa thông tin</span>
          </button>
          <div className="h-px bg-slate-100 my-1"></div>
          <button
            type="button"
            onClick={() => {
              const b = actionMenu.board;
              setActionMenu(null);
              handleDeleteBoard(b);
            }}
            className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Xóa hội đồng</span>
          </button>
        </div>
      )}

      {/* Modal - "+ Tạo buổi hội đồng" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div 
            className="bg-white w-full max-w-3xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 overflow-visible flex flex-col"
            onClick={closeAllModalDropdowns}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#407F3E]" />
                Tạo buổi hội đồng
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="flex flex-col">
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5 relative z-30">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tên hội đồng *</label>
                    <input
                      type="text"
                      required
                      value={boardName}
                      onChange={e => setBoardName(e.target.value)}
                      placeholder="Nhập tên hội đồng..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                    />
                  </div>

                  <div className="relative z-50">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Đợt kiến tập *</label>
                    <div 
                      onClick={(e) => handleModalDropdownClick(e, setIsLichDropdownOpen)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm flex justify-between items-center cursor-pointer hover:border-[#407F3E]"
                    >
                      <span className="text-slate-800 font-bold truncate pr-2">
                        {selectedSchedule 
                          ? campaigns.find(c => c.id === selectedSchedule)?.ten_dot 
                          : 'Chọn đợt kiến tập'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    {isLichDropdownOpen && (
                      <div 
                        className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-2 max-h-48 overflow-y-auto animate-in slide-in-from-top-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {campaigns.map(camp => {
                          const hocKyText = camp.hocKy?.ten_hoc_ky || '';
                          const namHocText = camp.hocKy?.namHoc?.ten_nam_hoc ? ` (${camp.hocKy.namHoc.ten_nam_hoc})` : '';
                          const hocKyFull = hocKyText ? `${hocKyText}${namHocText}` : '';

                          const rawKhoa = camp.khoaHoc?.ten_khoa_hoc || camp.khoaHoc?.ma_khoa_hoc || '';
                          const khoaText = rawKhoa
                            ? (rawKhoa.toLowerCase().includes('khóa') ? rawKhoa : `Khóa ${rawKhoa}`)
                            : '';

                          const subLabel = [hocKyFull, khoaText].filter(Boolean).join(' • ');

                          return (
                            <div 
                              key={camp.id}
                              onClick={() => {
                                setSelectedSchedule(camp.id);
                                setIsLichDropdownOpen(false);
                              }}
                              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0"
                            >
                              <div className="font-bold text-slate-800">{camp.ten_dot}</div>
                              {subLabel && (
                                <div className="text-xs font-medium text-slate-500 mt-0.5">{subLabel}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 relative z-20">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày giờ *</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        required
                        value={dateTime}
                        onChange={e => setDateTime(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Địa điểm *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={room}
                        onChange={e => setRoom(e.target.value)}
                        placeholder="VD: Phòng A.101"
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 relative z-40">
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Thành viên hội đồng</label>
                    <div 
                      onClick={(e) => handleModalDropdownClick(e, setIsMembersOpen)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm flex justify-between items-center cursor-pointer hover:border-[#407F3E]"
                    >
                      <span className="text-slate-800 font-bold truncate pr-2">
                        {selectedMembers.length > 0 ? `Đã chọn ${selectedMembers.length} GV` : 'Chọn giảng viên'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    {isMembersOpen && (
                      <div 
                        className="absolute bottom-full left-0 w-full mb-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 max-h-48 overflow-y-auto animate-in slide-in-from-bottom-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {lecturers.map(lec => {
                          const isChecked = selectedMembers.some(m => m.id === lec.id);
                          return (
                            <div 
                              key={lec.id}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedMembers(selectedMembers.filter(m => m.id !== lec.id));
                                } else {
                                  setSelectedMembers([...selectedMembers, { id: lec.id, role: 'ThanhVien' }]);
                                }
                              }}
                              className="px-4 py-1.5 text-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50"
                            >
                              <input 
                                type="checkbox" 
                                className="w-3.5 h-3.5 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E]" 
                                checked={isChecked} 
                                readOnly 
                              />
                              <span className={isChecked ? "font-bold text-slate-800" : "font-medium text-slate-600"}>
                                {lec.ho_ten} ({lec.ma_gv})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {selectedMembers.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2">
                        {selectedMembers.map(m => {
                          const lec = lecturers.find(l => l.id === m.id);
                          return (
                            <div key={m.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                              <span className="text-sm font-semibold text-slate-800">{lec?.ho_ten}</span>
                              <SearchableDropdown
                                options={[
                                  { value: 'ChuTich', label: 'Chủ tịch' },
                                  { value: 'ThuKy', label: 'Thư ký' },
                                  { value: 'ThanhVien', label: 'Thành viên' }
                                ]}
                                value={m.role}
                                onChange={(val) => {
                                  setSelectedMembers(selectedMembers.map(item => item.id === m.id ? { ...item, role: val } : item));
                                }}
                                searchPlaceholder="Tìm..."
                                className="min-w-[140px]"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3 rounded-b-2xl z-10">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingBoard}
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#326631] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingBoard && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Lưu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Chỉnh sửa hội đồng */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          
          <div 
            className="bg-white w-full max-w-xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#407F3E]" />
                Chỉnh sửa hội đồng
              </h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBoard} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tên hội đồng *</label>
                <input
                  type="text"
                  required
                  value={editBoardName}
                  onChange={e => setEditBoardName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày giờ *</label>
                <input
                  type="datetime-local"
                  required
                  value={editDateTime}
                  onChange={e => setEditDateTime(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Địa điểm *</label>
                <input
                  type="text"
                  required
                  value={editRoom}
                  onChange={e => setEditRoom(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] text-slate-800 font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#326631] disabled:opacity-50 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
                >
                  {isSubmittingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Xem chi tiết & Danh sách sinh viên & Khóa điểm */}
      {viewingDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
          ></div>
          
          <div 
            className="bg-white w-[95vw] max-w-7xl xl:max-w-[1440px] rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Chi tiết Hội đồng báo cáo
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{viewingDetail.ten}</p>
              </div>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Board info summary */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đợt kiến tập</span>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{viewingDetail.lich}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thời gian báo cáo</span>
                    <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-slate-800">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {viewingDetail.ngay} - {viewingDetail.gio}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Địa điểm / Phòng</span>
                    <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-slate-800">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {viewingDetail.diaDiem}
                    </div>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span>Thành viên hội đồng</span>
                  <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full text-xs">{viewingDetail.members?.length || 0}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {viewingDetail.members?.map((m, idx) => (
                    <div key={idx} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{m.giangVien?.ho_ten || 'Giảng viên'}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{m.giangVien?.ma_gv || m.giangVien?.email || 'Giảng viên'}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                        m.vai_tro === 'ChuTich' 
                          ? 'bg-emerald-50 text-[#407F3E] border border-emerald-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {getRoleLabel(m.vai_tro)}
                      </span>
                    </div>
                  ))}
                  {(!viewingDetail.members || viewingDetail.members.length === 0) && (
                    <div className="col-span-3 text-sm text-slate-500 text-center py-4 italic border border-slate-200 rounded-xl border-dashed">Chưa có thành viên hội đồng</div>
                  )}
                </div>
              </div>

              {/* Assigned Students */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <span>Sinh viên báo cáo</span>
                    <span className="bg-[#407F3E] text-white px-2 py-0.5 rounded-full text-xs font-mono">{boardStudents.length}</span>
                  </h4>
                  <button 
                    onClick={() => handleOpenAssignModal(viewingDetail)}
                    className="text-xs font-bold text-[#407F3E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    + Thêm sinh viên
                  </button>
                </div>

                {isFetchingStudentsDetail ? (
                  <div className="text-center py-8 text-slate-500 font-medium">Đang tải danh sách sinh viên...</div>
                ) : boardStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm italic border-2 border-dashed border-slate-200 rounded-xl">
                    Chưa có sinh viên nào được phân công vào hội đồng này. Bấm nút "Thêm sinh viên" hoặc biểu tượng phân công để thêm.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3.5 pl-4 whitespace-nowrap">Sinh viên</th>
                          <th className="p-3.5 whitespace-nowrap">Lớp</th>
                          <th className="p-3.5 whitespace-nowrap">Chuyến đi đại diện</th>
                          <th className="p-3.5 text-center whitespace-nowrap">Điểm HĐ</th>
                          <th className="p-3.5 text-center whitespace-nowrap">Trạng thái khóa</th>
                          <th className="p-3.5 text-right pr-4 whitespace-nowrap">Hủy phân công</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {boardStudents.map((item) => {
                          const sv = item.sinhVien;
                          const trips = item.trips || [];
                          const scoredTrips = trips.filter(t => t.diemHoiDong != null);
                          const avgCouncilGrade = scoredTrips.length > 0
                            ? (scoredTrips.reduce((acc, t) => acc + Number(t.diemHoiDong), 0) / scoredTrips.length)
                            : null;
                          const isLocked = trips.some(t => t.daKhoa);

                          return (
                            <tr key={item.boChuyenId} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3 pl-4">
                                <div className="font-bold text-slate-800">{sv?.ho_ten || 'Sinh viên'}</div>
                                <div className="text-xs font-mono text-slate-500">{sv?.mssv || sv?.ma_sv || '—'}</div>
                              </td>
                              <td className="p-3 font-medium text-slate-600">{sv?.ten_lop || sv?.lop || '—'}</td>
                              <td className="p-3">
                                <div className="space-y-1.5">
                                  {trips.map((t, idx) => (
                                    <div key={idx} className="text-xs text-slate-700 flex items-center justify-between gap-3 max-w-md">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.hinhThuc === 'TrucTiep' ? 'bg-[#407F3E]' : 'bg-blue-500'}`}></span>
                                        <span className="font-medium truncate" title={t.nhaMay}>{t.nhaMay}</span>
                                      </div>
                                      {t.diemHoiDong != null ? (
                                        <span className="font-mono font-bold text-slate-800 text-[11px] shrink-0">
                                          {Number(t.diemHoiDong).toFixed(1)}đ
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-slate-400 italic shrink-0">Chưa chấm</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                {avgCouncilGrade != null ? (
                                  <div>
                                    <span className="font-mono text-sm font-bold text-[#407F3E]">
                                      {Number(avgCouncilGrade).toFixed(1)}
                                    </span>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      TB ({scoredTrips.length}/{trips.length})
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">
                                    Chưa chấm
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {isLocked ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                                    <Lock className="w-3.5 h-3.5 text-slate-500" /> Đã khóa
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    Chưa khóa
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right pr-4">
                                <button
                                  type="button"
                                  onClick={() => handleUnassignStudent(item.boChuyenId)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hủy phân công sinh viên khỏi hội đồng"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            
            {/* Detail modal footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between rounded-b-2xl">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isLockingBoard || boardStudents.length === 0}
                  onClick={handleLockBoard}
                  className="px-4 py-2 bg-[#407F3E] hover:bg-[#326631] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Chốt điểm hội đồng cho toàn bộ sinh viên đã được phân công"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isLockingBoard ? 'Đang khóa điểm...' : 'Khóa điểm Hội đồng'}</span>
                </button>
                <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                  * Khóa điểm sẽ tính trung bình điểm các GV chấm và lưu vào điểm chính thức của phiếu
                </span>
              </div>

              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal - Phân công sinh viên */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={(e) => { e.stopPropagation(); setIsAssignModalOpen(false); }}
          ></div>
          
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#407F3E]" />
                Phân công Sinh viên vào {assigningBoard?.ten || 'Hội đồng'}
              </h2>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsAssignModalOpen(false); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {isFetchingStudents ? (
                <div className="text-center py-8 text-slate-500 font-medium">Đang tải danh sách sinh viên...</div>
              ) : availableStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-xl">
                  Không còn sinh viên nào chưa được phân công trong đợt này.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">Chọn sinh viên tham gia báo cáo:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedAvailableStudents.length === availableStudents.length) {
                          setSelectedAvailableStudents([]);
                        } else {
                          setSelectedAvailableStudents(availableStudents.map(s => s.id));
                        }
                      }}
                      className="text-xs font-bold text-[#407F3E] hover:underline cursor-pointer"
                    >
                      {selectedAvailableStudents.length === availableStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                  {availableStudents.map(student => {
                    const sv = student.dotKienTapSinhVien?.sinhVien;
                    if (!sv) return null;
                    const isChecked = selectedAvailableStudents.includes(student.id);
                    return (
                      <div 
                        key={student.id} 
                        onClick={() => {
                          if (isChecked) {
                            setSelectedAvailableStudents(prev => prev.filter(id => id !== student.id));
                          } else {
                            setSelectedAvailableStudents(prev => [...prev, student.id]);
                          }
                        }}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${isChecked ? 'border-[#407F3E] bg-[#407F3E]/5' : 'border-slate-200 hover:border-[#407F3E]'}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          readOnly
                          className="w-4 h-4 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E]" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800">{sv.ho_ten}</p>
                          <p className="text-xs font-medium text-slate-500">{sv.mssv || sv.ma_sv || '—'} - {sv.ten_lop || sv.lop || 'Chưa cập nhật lớp'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between rounded-b-2xl">
              <div className="text-sm font-semibold text-slate-600">
                Đã chọn: <span className="font-bold text-[#407F3E]">{selectedAvailableStudents.length}</span> SV
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsAssignModalOpen(false); }}
                  className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="button"
                  disabled={selectedAvailableStudents.length === 0 || isFetchingStudents}
                  onClick={handleAssignStudents}
                  className="px-6 py-2.5 bg-[#407F3E] hover:bg-[#326631] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Popup thay thế cho alert / window.confirm) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          ></div>

          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmModal.type === 'danger'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                    : confirmModal.type === 'warning'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                    : 'bg-emerald-50 text-[#407F3E] border border-emerald-200/60'
                }`}>
                  {confirmModal.type === 'danger' ? (
                    <AlertCircle className="w-6 h-6 stroke-[2]" />
                  ) : confirmModal.type === 'warning' ? (
                    <Lock className="w-6 h-6 stroke-[2]" />
                  ) : (
                    <Unlock className="w-6 h-6 stroke-[2]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-base font-bold text-slate-800 leading-snug">
                    {confirmModal.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  {confirmModal.cancelText || 'Hủy'}
                </button>
                <button
                  type="button"
                  disabled={isTogglingLock || isLockingBoard}
                  onClick={() => {
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                  }}
                  className={`px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5 ${
                    confirmModal.type === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : confirmModal.type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#407F3E] hover:bg-[#326631]'
                  }`}
                >
                  {(isTogglingLock || isLockingBoard) && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{confirmModal.confirmText || 'Xác nhận'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
