import toast from 'react-hot-toast';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, ChevronDown, Check, X, Search, ChevronRight, ChevronLeft, Calendar, MapPin, Users,
  Edit2, Trash2, Lock, Unlock, UserMinus, AlertCircle, RefreshCw, Award, MoreVertical, Eye, ArrowLeft, UserPlus,
  FileSpreadsheet
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import { exportDanhSachHoiDongTheoDot } from '../../utils/exportExcel';

export default function HoiDongChamBaoCao_Khoa() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);

  // Modal Dropdown States (Create)
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [activeRoleDropdown, setActiveRoleDropdown] = useState(null); // { id: memberId, context: 'create' | 'edit' }
  const [roleDropdownPos, setRoleDropdownPos] = useState({ top: 0, left: 0 });

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState('');
  const [editSelectedSchedule, setEditSelectedSchedule] = useState('');
  const [editDateTime, setEditDateTime] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editSelectedMembers, setEditSelectedMembers] = useState([]);
  const [editMemberSearchTerm, setEditMemberSearchTerm] = useState('');
  const [isEditLichDropdownOpen, setIsEditLichDropdownOpen] = useState(false);
  const [isEditMembersOpen, setIsEditMembersOpen] = useState(false);
  const [editBoardStudentCount, setEditBoardStudentCount] = useState(0);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Detail Modal Students & Assign Tab States
  const [boardStudents, setBoardStudents] = useState([]);
  const [isFetchingStudentsDetail, setIsFetchingStudentsDetail] = useState(false);
  const [isLockingBoard, setIsLockingBoard] = useState(false);
  const [detailActiveTab, setDetailActiveTab] = useState('list'); // 'list' | 'assign'

  // Assign Students States (Tab 2: Bảng Thêm sinh viên)
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedAvailableStudents, setSelectedAvailableStudents] = useState([]);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);
  const [availableSearchTerm, setAvailableSearchTerm] = useState('');
  const [availableClassFilter, setAvailableClassFilter] = useState('');
  const [availableCurrentPage, setAvailableCurrentPage] = useState(1);
  const [availableItemsPerPage, setAvailableItemsPerPage] = useState(15);

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

  // Lock Bo Chuyen & Export State
  const [selectedDotForLock, setSelectedDotForLock] = useState(null);
  const [isBoChuyenLocked, setIsBoChuyenLocked] = useState(false);
  const [isTogglingLock, setIsTogglingLock] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const dotId = selectedDotForLock ? Number(selectedDotForLock) : undefined;
      const dot = campaigns.find(c => c.id === dotId);

      const res = await khoaApi.getBoardsExportData(dotId ? { dotKienTapId: dotId } : undefined);
      const data = res.data || [];
      if (data.length === 0) {
        toast.error('Không có hội đồng nào trong đợt này để xuất dữ liệu');
        return;
      }

      exportDanhSachHoiDongTheoDot(dot, data);
      toast.success(`Đã xuất danh sách ${data.length} hội đồng thành công!`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi xuất danh sách hội đồng');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSingleBoard = async (board) => {
    if (!board) return;
    try {
      setIsExporting(true);
      const studentsRes = await khoaApi.getBoardStudents(board.id);
      const dot = campaigns.find(c => c.id === board.dot_kien_tap_id);
      const boardWithStudents = {
        ...board,
        students: studentsRes.data || []
      };
      exportDanhSachHoiDongTheoDot(dot, [boardWithStudents]);
      toast.success(`Đã xuất danh sách hội đồng "${board.ten}" thành công!`);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xuất dữ liệu hội đồng');
    } finally {
      setIsExporting(false);
    }
  };

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
      setMemberSearchTerm('');
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
    setEditSelectedSchedule(board.dot_kien_tap_id || '');
    setEditBoardStudentCount(board.sv || 0);
    if (board.raw_ngay_bao_cao) {
      const d = new Date(board.raw_ngay_bao_cao);
      const pad = num => String(num).padStart(2, '0');
      const formattedDt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setEditDateTime(formattedDt);
    } else {
      setEditDateTime('');
    }
    setEditRoom(board.diaDiem || '');
    const currentMembers = (board.members || []).map(m => ({
      id: m.giang_vien_id || m.giangVien?.id || m.id,
      role: m.vai_tro || 'ThanhVien',
    }));
    setEditSelectedMembers(currentMembers);
    setEditMemberSearchTerm('');
    setIsEditLichDropdownOpen(false);
    setIsEditMembersOpen(false);
    setActiveRoleDropdown(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateBoard = async (e) => {
    e.preventDefault();
    if (!editBoardName || !editSelectedSchedule || !editDateTime || !editRoom) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc');
      return;
    }
    try {
      setIsSubmittingEdit(true);
      await khoaApi.updateBoard(editingBoardId, {
        name: editBoardName,
        dotKienTapId: Number(editSelectedSchedule),
        date: editDateTime,
        room: editRoom,
        members: editSelectedMembers.map(m => ({
          lecturerId: m.id,
          role: m.role || 'ThanhVien'
        }))
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

  const loadBoardStudents = async (boardId) => {
    setIsFetchingStudentsDetail(true);
    try {
      const res = await khoaApi.getBoardStudents(boardId);
      setBoardStudents(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách sinh viên của hội đồng');
    } finally {
      setIsFetchingStudentsDetail(false);
    }
  };

  const loadAvailableStudents = async (dotKienTapId) => {
    if (!dotKienTapId) return;
    setIsFetchingStudents(true);
    try {
      const res = await khoaApi.getAvailableStudentsForBoard(dotKienTapId);
      setAvailableStudents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingStudents(false);
    }
  };

  const handleOpenDetail = (board) => {
    setViewingDetail(board);
    setDetailActiveTab('list');
    setSelectedAvailableStudents([]);
    setAvailableSearchTerm('');
    setAvailableClassFilter('');
    setAvailableCurrentPage(1);
    loadBoardStudents(board.id);
    loadAvailableStudents(board.dot_kien_tap_id);
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
          await Promise.all([
            loadBoardStudents(viewingDetail.id),
            loadAvailableStudents(viewingDetail.dot_kien_tap_id),
            fetchData()
          ]);
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

  const handleUnlockBoard = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Mở khóa điểm hội đồng',
      message: `Xác nhận mở khóa điểm hội đồng "${viewingDetail.ten}"? Giảng viên trong hội đồng sẽ có thể tiếp tục chỉnh sửa điểm.`,
      type: 'warning',
      confirmText: 'Mở khóa điểm',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          setIsLockingBoard(true);
          const res = await khoaApi.unlockBoard(viewingDetail.id);
          toast.success(res.data?.message || 'Mở khóa điểm hội đồng thành công!');
          const updatedStudents = await khoaApi.getBoardStudents(viewingDetail.id);
          setBoardStudents(updatedStudents.data || []);
          fetchData();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Lỗi mở khóa điểm hội đồng');
        } finally {
          setIsLockingBoard(false);
        }
      }
    });
  };

  const isBoardLocked = useMemo(() => {
    return boardStudents.length > 0 && boardStudents.every(s =>
      s.trips && s.trips.length > 0 && s.trips.every(t => t.daKhoa)
    );
  }, [boardStudents]);

  // Close all modal dropdowns
  const closeAllModalDropdowns = () => {
    setIsLichDropdownOpen(false);
    setIsMembersOpen(false);
    setMemberSearchTerm('');
    setIsEditLichDropdownOpen(false);
    setIsEditMembersOpen(false);
    setEditMemberSearchTerm('');
    setActiveRoleDropdown(null);
  };

  const handleOpenRoleDropdown = (e, memberId, context = 'create') => {
    e.stopPropagation();
    if (activeRoleDropdown?.id === memberId && activeRoleDropdown?.context === context) {
      setActiveRoleDropdown(null);
      return;
    }
    closeAllModalDropdowns();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 120;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < menuHeight + 10 ? rect.top - menuHeight - 4 : rect.bottom + 4;
    const menuWidth = 144;
    const left = Math.max(10, rect.right - menuWidth);

    setRoleDropdownPos({ top, left });
    setActiveRoleDropdown({ id: memberId, context });
  };

  useEffect(() => {
    const handleOutside = () => setActiveRoleDropdown(null);
    if (activeRoleDropdown) {
      window.addEventListener('click', handleOutside);
      window.addEventListener('resize', handleOutside);
      return () => {
        window.removeEventListener('click', handleOutside);
        window.removeEventListener('resize', handleOutside);
      };
    }
  }, [activeRoleDropdown]);

  const handleAssignStudents = async () => {
    if (!viewingDetail || selectedAvailableStudents.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sinh viên');
      return;
    }
    try {
      setIsSubmittingAssign(true);
      await khoaApi.assignStudentsToBoard(viewingDetail.id, selectedAvailableStudents);
      toast.success(`Đã thêm ${selectedAvailableStudents.length} sinh viên vào hội đồng thành công!`);
      setSelectedAvailableStudents([]);
      setDetailActiveTab('list');

      await Promise.all([
        loadBoardStudents(viewingDetail.id),
        loadAvailableStudents(viewingDetail.dot_kien_tap_id),
        fetchData()
      ]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi thêm sinh viên vào hội đồng');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Memos cho Bảng Sinh viên khả dụng (Tab 2)
  const uniqueAvailableClasses = useMemo(() => {
    const classes = availableStudents
      .map(s => s.dotKienTapSinhVien?.sinhVien?.ten_lop || s.dotKienTapSinhVien?.sinhVien?.lop)
      .filter(Boolean);
    return Array.from(new Set(classes)).sort();
  }, [availableStudents]);

  const filteredAvailableStudents = useMemo(() => {
    return availableStudents.filter(item => {
      const sv = item.dotKienTapSinhVien?.sinhVien;
      if (!sv) return false;
      const term = availableSearchTerm.toLowerCase().trim();
      const matchSearch = !term ||
        sv.ho_ten?.toLowerCase().includes(term) ||
        sv.mssv?.toLowerCase().includes(term) ||
        sv.ma_sv?.toLowerCase().includes(term);

      const studentClass = sv.ten_lop || sv.lop || '';
      const matchClass = !availableClassFilter || studentClass === availableClassFilter;

      return matchSearch && matchClass;
    });
  }, [availableStudents, availableSearchTerm, availableClassFilter]);

  const totalAvailablePages = Math.max(1, Math.ceil(filteredAvailableStudents.length / availableItemsPerPage));

  const paginatedAvailableStudents = useMemo(() => {
    const start = (availableCurrentPage - 1) * availableItemsPerPage;
    return filteredAvailableStudents.slice(start, start + availableItemsPerPage);
  }, [filteredAvailableStudents, availableCurrentPage, availableItemsPerPage]);

  const isAllCurrentPageSelected = useMemo(() => {
    if (paginatedAvailableStudents.length === 0) return false;
    return paginatedAvailableStudents.every(s => selectedAvailableStudents.includes(s.id));
  }, [paginatedAvailableStudents, selectedAvailableStudents]);

  const handleToggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      const pageIds = new Set(paginatedAvailableStudents.map(s => s.id));
      setSelectedAvailableStudents(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const newSelected = new Set([...selectedAvailableStudents, ...paginatedAvailableStudents.map(s => s.id)]);
      setSelectedAvailableStudents(Array.from(newSelected));
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
      const matchDot = !selectedDotForLock || c.dot_kien_tap_id === Number(selectedDotForLock);
      const matchSearch = !searchTerm ||
        c.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lich?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.diaDiem?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDot && matchSearch;
    });
  }, [committees, searchTerm, selectedDotForLock]);

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
                    const val = e.target.value ? Number(e.target.value) : '';
                    setSelectedDotForLock(val || null);
                    if (val) {
                      checkBoChuyenLock(val);
                    } else {
                      setIsBoChuyenLocked(false);
                    }
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                >
                  <option value="">Tất cả các đợt</option>
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
                className={`ml-1 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isBoChuyenLocked
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

          {/* Nút Xuất danh sách Excel (Phương án A: 2 Sheet) */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting || isLoading}
            className="px-3.5 py-2 border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-[#407F3E] rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Xuất file Excel danh sách hội đồng gồm 2 Sheet: Tổng quan Hội đồng và Chi tiết Sinh viên báo cáo"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#407F3E]" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-[#407F3E]" />
            )}
            <span>{isExporting ? 'Đang xuất file...' : 'Xuất danh sách'}</span>
          </button>

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
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${actionMenu?.board?.id === c.id
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
                direction="up"
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
          className="w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-1 text-left animate-in fade-in zoom-in-95 duration-150"
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
            <Users className="w-3.5 h-3.5 text-[#407F3E]" />
            <span>Quản lý sinh viên và khóa điểm</span>
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
          <button
            type="button"
            onClick={async () => {
              const b = actionMenu.board;
              setActionMenu(null);
              await handleExportSingleBoard(b);
            }}
            className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất danh sách hội đồng này</span>
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
            className="bg-white w-[92vw] max-w-5xl xl:max-w-6xl h-[88vh] rounded-2xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
            onClick={closeAllModalDropdowns}
          >
            {/* Header cố định */}
            <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#407F3E]" />
                Tạo buổi hội đồng
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form với Body cuộn độc lập và Footer cố định */}
            <form onSubmit={handleCreateBoard} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" onScroll={() => setActiveRoleDropdown(null)}>
                {/* Hàng 1: Tên hội đồng & Đợt kiến tập */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-30">
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
                        className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-2 max-h-48 overflow-y-auto animate-in slide-in-from-top-1 z-50"
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

                {/* Hàng 2: Ngày giờ & Địa điểm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày giờ *</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        required
                        value={dateTime}
                        onChange={e => setDateTime(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
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

                {/* Hàng 3: Thành viên hội đồng */}
                <div className="relative z-10 pt-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Thành viên hội đồng</label>
                  <div className="relative">
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
                        className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 max-h-52 overflow-hidden flex flex-col animate-in slide-in-from-top-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 pb-2 pt-1 border-b border-slate-100">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={memberSearchTerm}
                              onChange={(e) => setMemberSearchTerm(e.target.value)}
                              placeholder="Tìm tên hoặc mã GV..."
                              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E]"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto max-h-40 py-1">
                          {lecturers
                            .filter(lec =>
                              !memberSearchTerm ||
                              lec.ho_ten?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                              lec.ma_gv?.toLowerCase().includes(memberSearchTerm.toLowerCase())
                            )
                            .map(lec => {
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
                                  className="px-4 py-1.5 text-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E] cursor-pointer"
                                    checked={isChecked}
                                    readOnly
                                  />
                                  <span className={isChecked ? "font-bold text-slate-800" : "font-medium text-slate-600"}>
                                    {lec.ho_ten} {lec.ma_gv ? `(${lec.ma_gv})` : ''}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Danh sách thành viên đã chọn có max-h và nút xóa nhanh */}
                  {selectedMembers.length > 0 && (
                    <div className="mt-2.5 max-h-72 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-1">
                      {selectedMembers.map(m => {
                        const lec = lecturers.find(l => l.id === m.id);
                        return (
                          <div key={m.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <div className="w-7 h-7 rounded-lg bg-[#407F3E]/10 text-[#407F3E] flex items-center justify-center font-bold text-xs shrink-0">
                                {lec?.ho_ten?.charAt(0) || 'G'}
                              </div>
                              <div className="truncate">
                                <span className="text-sm font-semibold text-slate-800 truncate block">{lec?.ho_ten}</span>
                                {lec?.ma_gv && <span className="text-xs text-slate-400 block font-normal">{lec.ma_gv}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleOpenRoleDropdown(e, m.id, 'create')}
                                className={`px-2.5 py-1.5 bg-white border rounded-lg text-xs font-bold flex items-center justify-between gap-1.5 cursor-pointer shadow-2xs transition-all ${activeRoleDropdown?.id === m.id && activeRoleDropdown?.context === 'create'
                                  ? 'border-[#407F3E] ring-1 ring-[#407F3E] text-[#407F3E]'
                                  : 'border-slate-200 text-slate-700 hover:border-[#407F3E]'
                                  }`}
                              >
                                <span>{getRoleLabel(m.role)}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeRoleDropdown?.id === m.id && activeRoleDropdown?.context === 'create' ? 'rotate-180' : ''}`} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (activeRoleDropdown?.id === m.id && activeRoleDropdown?.context === 'create') setActiveRoleDropdown(null);
                                  setSelectedMembers(selectedMembers.filter(item => item.id !== m.id));
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Xóa thành viên"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer CỐ ĐỊNH Ở ĐÁY - LUÔN HIỂN THỊ */}
              <div className="shrink-0 px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-end gap-3 rounded-b-2xl">
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
                  <span>Xác nhận tạo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal - Chỉnh sửa thông tin hội đồng */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          ></div>

          <div
            className="bg-white w-[92vw] max-w-5xl xl:max-w-6xl h-[88vh] rounded-2xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
            onClick={closeAllModalDropdowns}
          >
            {/* Header cố định */}
            <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#407F3E]" />
                Chỉnh sửa thông tin hội đồng
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form với Body cuộn độc lập và Footer cố định */}
            <form onSubmit={handleUpdateBoard} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" onScroll={() => setActiveRoleDropdown(null)}>
                {/* Hàng 1: Tên hội đồng & Đợt kiến tập */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-30">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tên hội đồng *</label>
                    <input
                      type="text"
                      required
                      value={editBoardName}
                      onChange={e => setEditBoardName(e.target.value)}
                      placeholder="Nhập tên hội đồng..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                    />
                  </div>

                  <div className="relative z-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Đợt kiến tập *</label>
                      {editBoardStudentCount > 0 && (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          Đã có {editBoardStudentCount} SV (khóa đổi đợt)
                        </span>
                      )}
                    </div>
                    <div
                      onClick={(e) => {
                        if (editBoardStudentCount > 0) {
                          toast('Hội đồng đã có sinh viên được phân công. Để đổi đợt kiến tập, vui lòng gỡ phân công các sinh viên trước.', { icon: 'ℹ️' });
                          return;
                        }
                        handleModalDropdownClick(e, setIsEditLichDropdownOpen);
                      }}
                      className={`w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm flex justify-between items-center transition-all ${editBoardStudentCount > 0
                        ? 'opacity-85 cursor-not-allowed bg-slate-100'
                        : 'cursor-pointer hover:border-[#407F3E]'
                        }`}
                    >
                      <span className="text-slate-800 font-bold truncate pr-2">
                        {editSelectedSchedule
                          ? campaigns.find(c => c.id === Number(editSelectedSchedule))?.ten_dot
                          : 'Chọn đợt kiến tập'}
                      </span>
                      {editBoardStudentCount > 0 ? (
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                    {isEditLichDropdownOpen && editBoardStudentCount === 0 && (
                      <div
                        className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-2 max-h-48 overflow-y-auto animate-in slide-in-from-top-1 z-50"
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
                                setEditSelectedSchedule(camp.id);
                                setIsEditLichDropdownOpen(false);
                              }}
                              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0 ${Number(editSelectedSchedule) === camp.id ? 'bg-[#407F3E]/5' : ''
                                }`}
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

                {/* Hàng 2: Ngày giờ & Địa điểm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày giờ *</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        required
                        value={editDateTime}
                        onChange={e => setEditDateTime(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
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
                        value={editRoom}
                        onChange={e => setEditRoom(e.target.value)}
                        placeholder="VD: Phòng A.101"
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Hàng 3: Thành viên hội đồng */}
                <div className="relative z-10 pt-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Thành viên hội đồng</label>
                  <div className="relative">
                    <div
                      onClick={(e) => handleModalDropdownClick(e, setIsEditMembersOpen)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm flex justify-between items-center cursor-pointer hover:border-[#407F3E]"
                    >
                      <span className="text-slate-800 font-bold truncate pr-2">
                        {editSelectedMembers.length > 0 ? `Đã chọn ${editSelectedMembers.length} GV` : 'Chọn giảng viên'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    {isEditMembersOpen && (
                      <div
                        className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 max-h-52 overflow-hidden flex flex-col animate-in slide-in-from-top-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 pb-2 pt-1 border-b border-slate-100">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={editMemberSearchTerm}
                              onChange={(e) => setEditMemberSearchTerm(e.target.value)}
                              placeholder="Tìm tên hoặc mã GV..."
                              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E]"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto max-h-40 py-1">
                          {lecturers
                            .filter(lec =>
                              !editMemberSearchTerm ||
                              lec.ho_ten?.toLowerCase().includes(editMemberSearchTerm.toLowerCase()) ||
                              lec.ma_gv?.toLowerCase().includes(editMemberSearchTerm.toLowerCase())
                            )
                            .map(lec => {
                              const isChecked = editSelectedMembers.some(m => m.id === lec.id);
                              return (
                                <div
                                  key={lec.id}
                                  onClick={() => {
                                    if (isChecked) {
                                      setEditSelectedMembers(editSelectedMembers.filter(m => m.id !== lec.id));
                                    } else {
                                      setEditSelectedMembers([...editSelectedMembers, { id: lec.id, role: 'ThanhVien' }]);
                                    }
                                  }}
                                  className="px-4 py-1.5 text-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E] cursor-pointer"
                                    checked={isChecked}
                                    readOnly
                                  />
                                  <span className={isChecked ? "font-bold text-slate-800" : "font-medium text-slate-600"}>
                                    {lec.ho_ten} {lec.ma_gv ? `(${lec.ma_gv})` : ''}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Danh sách thành viên đã chọn có max-h và nút xóa nhanh */}
                  {editSelectedMembers.length > 0 && (
                    <div className="mt-2.5 max-h-72 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-1">
                      {editSelectedMembers.map(m => {
                        const lec = lecturers.find(l => l.id === m.id);
                        return (
                          <div key={m.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <div className="w-7 h-7 rounded-lg bg-[#407F3E]/10 text-[#407F3E] flex items-center justify-center font-bold text-xs shrink-0">
                                {lec?.ho_ten?.charAt(0) || 'G'}
                              </div>
                              <div className="truncate">
                                <span className="text-sm font-semibold text-slate-800 truncate block">{lec?.ho_ten}</span>
                                {lec?.ma_gv && <span className="text-xs text-slate-400 block font-normal">{lec.ma_gv}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleOpenRoleDropdown(e, m.id, 'edit')}
                                className={`px-2.5 py-1.5 bg-white border rounded-lg text-xs font-bold flex items-center justify-between gap-1.5 cursor-pointer shadow-2xs transition-all ${activeRoleDropdown?.id === m.id && activeRoleDropdown?.context === 'edit'
                                  ? 'border-[#407F3E] ring-1 ring-[#407F3E] text-[#407F3E]'
                                  : 'border-slate-200 text-slate-700 hover:border-[#407F3E]'
                                  }`}
                              >
                                <span>{getRoleLabel(m.role)}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeRoleDropdown?.id === m.id && activeRoleDropdown?.context === 'edit' ? 'rotate-180' : ''}`} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (activeRoleDropdown?.id === m.id && activeRoleDropdown?.context === 'edit') {
                                    setActiveRoleDropdown(null);
                                  }
                                  setEditSelectedMembers(editSelectedMembers.filter(item => item.id !== m.id));
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Xóa thành viên"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer CỐ ĐỊNH Ở ĐÁY - LUÔN HIỂN THỊ */}
              <div className="shrink-0 px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-end gap-3 rounded-b-2xl">
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
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#326631] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingEdit && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Lưu thay đổi</span>
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
                  Quản lý sinh viên và khóa điểm
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
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${m.vai_tro === 'ChuTich'
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

              {/* Tab Navigation */}
              <div className="flex items-center gap-4 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setDetailActiveTab('list')}
                  className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    detailActiveTab === 'list'
                      ? 'border-[#407F3E] text-[#407F3E]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Sinh viên trong hội đồng</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    detailActiveTab === 'list'
                      ? 'bg-[#407F3E]/10 text-[#407F3E]'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {boardStudents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDetailActiveTab('assign');
                    if (availableStudents.length === 0 && viewingDetail?.dot_kien_tap_id) {
                      loadAvailableStudents(viewingDetail.dot_kien_tap_id);
                    }
                  }}
                  className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    detailActiveTab === 'assign'
                      ? 'border-[#407F3E] text-[#407F3E]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Thêm sinh viên vào hội đồng</span>
                  {availableStudents.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                      detailActiveTab === 'assign'
                        ? 'bg-[#407F3E] text-white'
                        : 'bg-emerald-50 text-[#407F3E] border border-emerald-200'
                    }`}>
                      {availableStudents.length} khả dụng
                    </span>
                  )}
                </button>
              </div>

              {/* Tab 1: Sinh viên trong hội đồng */}
              {detailActiveTab === 'list' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <span>Danh sách sinh viên báo cáo</span>
                      <span className="bg-[#407F3E] text-white px-2 py-0.5 rounded-full text-xs font-mono">{boardStudents.length}</span>
                    </h4>
                  </div>

                  {isFetchingStudentsDetail ? (
                    <div className="text-center py-12 text-slate-500 font-medium flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#407F3E]" />
                      <span>Đang tải danh sách sinh viên...</span>
                    </div>
                  ) : boardStudents.length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-600 font-semibold text-sm">Chưa có sinh viên nào được phân công vào hội đồng này</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Bấm vào tab "Thêm sinh viên vào hội đồng" hoặc nút bên dưới để chọn sinh viên đủ điều kiện báo cáo.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setDetailActiveTab('assign');
                          if (availableStudents.length === 0 && viewingDetail?.dot_kien_tap_id) {
                            loadAvailableStudents(viewingDetail.dot_kien_tap_id);
                          }
                        }}
                        className="mt-4 px-4 py-2 bg-[#407F3E] hover:bg-[#326631] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Thêm sinh viên ngay</span>
                      </button>
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
                                    disabled={isLocked}
                                    onClick={() => handleUnassignStudent(item.boChuyenId)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                                    title={isLocked ? "Không thể hủy phân công sinh viên khi điểm đã bị khóa" : "Hủy phân công sinh viên khỏi hội đồng"}
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
              )}

              {/* Tab 2: Thêm sinh viên vào hội đồng (Bảng Table) */}
              {detailActiveTab === 'assign' && (
                <div className="space-y-4">
                  {/* Toolbar lọc và tìm kiếm */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                    <div className="flex flex-1 items-center gap-2.5">
                      {/* Search box */}
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Tìm sinh viên theo họ tên, MSSV..."
                          value={availableSearchTerm}
                          onChange={(e) => {
                            setAvailableSearchTerm(e.target.value);
                            setAvailableCurrentPage(1);
                          }}
                          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#407F3E] transition-all"
                        />
                        {availableSearchTerm && (
                          <button
                            type="button"
                            onClick={() => {
                              setAvailableSearchTerm('');
                              setAvailableCurrentPage(1);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Class filter dropdown */}
                      {uniqueAvailableClasses.length > 0 && (
                        <div className="w-44 sm:w-48 shrink-0">
                          <SearchableDropdown
                            options={[
                              { value: '', label: 'Tất cả các lớp' },
                              ...uniqueAvailableClasses.map(cls => ({ value: cls, label: `Lớp ${cls}` }))
                            ]}
                            value={availableClassFilter}
                            onChange={(val) => {
                              setAvailableClassFilter(val);
                              setAvailableCurrentPage(1);
                            }}
                            searchPlaceholder="Tìm lớp..."
                            placeholder="Lọc theo lớp"
                          />
                        </div>
                      )}
                    </div>

                    {/* Stats & Quick Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-xs sm:text-sm text-slate-600">
                        Đã chọn: <span className="font-bold text-[#407F3E] font-mono">{selectedAvailableStudents.length}</span> SV
                      </div>
                      <div className="flex items-center gap-2">
                        {filteredAvailableStudents.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedAvailableStudents.length === filteredAvailableStudents.length) {
                                setSelectedAvailableStudents([]);
                              } else {
                                setSelectedAvailableStudents(filteredAvailableStudents.map(s => s.id));
                              }
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#407F3E] border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          >
                            {selectedAvailableStudents.length === filteredAvailableStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả kết quả'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Table Available Students */}
                  {isFetchingStudents ? (
                    <div className="text-center py-12 text-slate-500 font-medium flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#407F3E]" />
                      <span>Đang tải danh sách sinh viên khả dụng...</span>
                    </div>
                  ) : availableStudents.length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-700 font-bold text-sm">Không còn sinh viên nào chưa được phân công</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Tất cả sinh viên có bộ 3 chuyến trong đợt này đã được phân công vào các hội đồng chấm báo cáo.
                      </p>
                      <button
                        type="button"
                        onClick={() => setDetailActiveTab('list')}
                        className="mt-4 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        Quay lại danh sách hội đồng
                      </button>
                    </div>
                  ) : filteredAvailableStudents.length === 0 ? (
                    <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <p className="text-slate-600 font-semibold text-sm">Không tìm thấy sinh viên phù hợp với bộ lọc</p>
                      <button
                        type="button"
                        onClick={() => {
                          setAvailableSearchTerm('');
                          setAvailableClassFilter('');
                        }}
                        className="mt-2 text-xs font-bold text-[#407F3E] hover:underline cursor-pointer"
                      >
                        Xóa bộ lọc tìm kiếm
                      </button>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <div className="overflow-x-auto max-h-[48vh]">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
                            <tr>
                              <th className="p-3 pl-4 w-12 text-center">
                                <input
                                  type="checkbox"
                                  checked={isAllCurrentPageSelected}
                                  onChange={handleToggleSelectAllCurrentPage}
                                  className="w-4 h-4 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E] cursor-pointer"
                                  title={isAllCurrentPageSelected ? "Bỏ chọn trang này" : "Chọn toàn bộ trang này"}
                                />
                              </th>
                              <th className="p-3.5 pl-2 whitespace-nowrap">Sinh viên</th>
                              <th className="p-3.5 whitespace-nowrap">Mã sinh viên</th>
                              <th className="p-3.5 whitespace-nowrap">Lớp</th>
                              <th className="p-3.5 whitespace-nowrap">Email / SĐT</th>
                              <th className="p-3.5 text-center whitespace-nowrap">Trạng thái hồ sơ</th>
                              <th className="p-3.5 text-right pr-4 whitespace-nowrap">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {paginatedAvailableStudents.map((item) => {
                              const sv = item.dotKienTapSinhVien?.sinhVien;
                              if (!sv) return null;
                              const isChecked = selectedAvailableStudents.includes(item.id);

                              return (
                                <tr
                                  key={item.id}
                                  onClick={() => {
                                    if (isChecked) {
                                      setSelectedAvailableStudents(prev => prev.filter(id => id !== item.id));
                                    } else {
                                      setSelectedAvailableStudents(prev => [...prev, item.id]);
                                    }
                                  }}
                                  className={`transition-colors cursor-pointer ${
                                    isChecked
                                      ? 'bg-emerald-50/70 hover:bg-emerald-50'
                                      : 'hover:bg-slate-50/80'
                                  }`}
                                >
                                  <td className="p-3 pl-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setSelectedAvailableStudents(prev => prev.filter(id => id !== item.id));
                                        } else {
                                          setSelectedAvailableStudents(prev => [...prev, item.id]);
                                        }
                                      }}
                                      className="w-4 h-4 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E] cursor-pointer"
                                    />
                                  </td>
                                  <td className="p-3 pl-2">
                                    <div className="font-bold text-slate-800">{sv.ho_ten}</div>
                                  </td>
                                  <td className="p-3 font-mono font-medium text-slate-600 text-xs">
                                    {sv.mssv || sv.ma_sv || '—'}
                                  </td>
                                  <td className="p-3 font-medium text-slate-600 text-xs">
                                    {sv.ten_lop || sv.lop || '—'}
                                  </td>
                                  <td className="p-3 text-xs text-slate-500">
                                    <div>{sv.email || '—'}</div>
                                    {sv.so_dien_thoai && <div className="text-[11px] text-slate-400">{sv.so_dien_thoai}</div>}
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#407F3E] border border-emerald-200">
                                      <Check className="w-3 h-3" /> Đủ 3 chuyến
                                    </span>
                                  </td>
                                  <td className="p-3 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isChecked) {
                                          setSelectedAvailableStudents(prev => prev.filter(id => id !== item.id));
                                        } else {
                                          setSelectedAvailableStudents(prev => [...prev, item.id]);
                                        }
                                      }}
                                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        isChecked
                                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                          : 'bg-[#407F3E]/10 text-[#407F3E] hover:bg-[#407F3E] hover:text-white'
                                      }`}
                                    >
                                      {isChecked ? 'Bỏ chọn' : 'Chọn'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Phân trang Bảng Thêm sinh viên */}
                      <div className="p-3 sm:px-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                          <span>Hiển thị</span>
                          <SearchableDropdown
                            options={[
                              { value: 15, label: '15' },
                              { value: 30, label: '30' },
                              { value: 50, label: '50' }
                            ]}
                            value={availableItemsPerPage}
                            onChange={(newVal) => {
                              setAvailableItemsPerPage(newVal);
                              setAvailableCurrentPage(1);
                            }}
                            searchPlaceholder="Số lượng..."
                            className="min-w-[76px]"
                            direction="up"
                          />
                          <span>/ tổng <strong className="text-slate-700">{filteredAvailableStudents.length}</strong> SV</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={availableCurrentPage <= 1}
                            onClick={() => setAvailableCurrentPage(p => Math.max(1, p - 1))}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                          >
                            Trước
                          </button>
                          <span className="px-2.5 py-1 rounded-lg bg-[#407F3E] text-white text-xs font-bold shadow-xs cursor-default">
                            {availableCurrentPage} / {totalAvailablePages}
                          </span>
                          <button
                            type="button"
                            disabled={availableCurrentPage >= totalAvailablePages}
                            onClick={() => setAvailableCurrentPage(p => Math.min(totalAvailablePages, p + 1))}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                          >
                            Sau
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Detail modal footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between rounded-b-2xl">
              {detailActiveTab === 'list' ? (
                <>
                  <div className="flex items-center gap-2">
                    {isBoardLocked ? (
                      <button
                        type="button"
                        disabled={isLockingBoard || boardStudents.length === 0}
                        onClick={handleUnlockBoard}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        title="Mở khóa điểm hội đồng để giảng viên có thể tiếp tục chấm"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{isLockingBoard ? 'Đang mở khóa...' : 'Mở khóa điểm Hội đồng'}</span>
                      </button>
                    ) : (
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
                    )}
                    <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                      {isBoardLocked
                        ? '* Điểm hội đồng hiện đang bị khóa. Sinh viên đã xem được điểm.'
                        : '* Khóa điểm sẽ tính trung bình điểm các GV chấm và lưu vào điểm chính thức của phiếu'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                      className="px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDetailActiveTab('list')}
                      className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Quay lại danh sách SV</span>
                    </button>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      Đã chọn: <strong className="text-[#407F3E] font-bold font-mono">{selectedAvailableStudents.length}</strong> sinh viên để thêm vào hội đồng
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDetailActiveTab('list')}
                      className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      disabled={selectedAvailableStudents.length === 0 || isSubmittingAssign || isFetchingStudents}
                      onClick={handleAssignStudents}
                      className="px-5 py-2 bg-[#407F3E] hover:bg-[#326631] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      {isSubmittingAssign ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang lưu phân công...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Lưu phân công ({selectedAvailableStudents.length} SV)</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
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
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${confirmModal.type === 'danger'
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
                  className={`px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5 ${confirmModal.type === 'danger'
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

      {/* Portal Dropdown Menu cho chọn vai trò thành viên hội đồng */}
      {activeRoleDropdown && createPortal(
        <div
          className="fixed w-36 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-[9999] py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ top: roleDropdownPos.top, left: roleDropdownPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { value: 'ChuTich', label: 'Chủ tịch' },
            { value: 'ThuKy', label: 'Thư ký' },
            { value: 'ThanhVien', label: 'Thành viên' },
          ].map((opt) => {
            const memberList = activeRoleDropdown.context === 'create' ? selectedMembers : editSelectedMembers;
            const currentMember = memberList.find(m => m.id === activeRoleDropdown.id);
            const isSelected = currentMember?.role === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  if (activeRoleDropdown.context === 'create') {
                    setSelectedMembers(prev => prev.map(item => item.id === activeRoleDropdown.id ? { ...item, role: opt.value } : item));
                  } else {
                    setEditSelectedMembers(prev => prev.map(item => item.id === activeRoleDropdown.id ? { ...item, role: opt.value } : item));
                  }
                  setActiveRoleDropdown(null);
                }}
                className={`px-3.5 py-2 text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors ${isSelected
                  ? 'bg-[#E7E0C4]/60 text-slate-900 font-bold'
                  : 'text-slate-700 hover:bg-[#E7E0C4]/25 hover:text-slate-900'
                  }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />}
              </div>
            );
          })}
        </div>,
        document.body
      )}

    </div>
  );
}
