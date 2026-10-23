import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, ChevronDown, Check, X, Calendar, Clock, MapPin,
  ChevronRight, Users, CheckCircle2, XCircle, RefreshCw, Search,
  MoreVertical, Edit, PlayCircle, Trash2, CheckCircle, RotateCcw, Download, ArrowRight,
  UserCheck, Building2, Phone, Mail, User, Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { khoaApi } from '../../services/api';
import { getValidSession } from '../../utils/auth';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function ChuyenThamQuan_DSLoc() {
  const [activeTab, setActiveTab] = useState('khoa'); // 'khoa' | 'tudo'
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditingTrip, setCurrentEditingTrip] = useState(null);
  const [viewingDetail, setViewingDetail] = useState(null);

  const [tripsKhoa, setTripsKhoa] = useState([]);
  const [tripsTuDo, setTripsTuDo] = useState([]);
  const [allSystemTrips, setAllSystemTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tab 1 filters & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isFilterStatusOpen, setIsFilterStatusOpen] = useState(false);
  const [searchStatusKhoa, setSearchStatusKhoa] = useState('');
  const [currentPageKhoa, setCurrentPageKhoa] = useState(1);
  const [limitKhoa, setLimitKhoa] = useState(15);

  // Tab 2 filters & pagination
  const [searchQueryTuDo, setSearchQueryTuDo] = useState('');
  const [filterStatusTuDo, setFilterStatusTuDo] = useState('ALL');
  const [isFilterStatusTuDoOpen, setIsFilterStatusTuDoOpen] = useState(false);
  const [searchStatusTuDo, setSearchStatusTuDo] = useState('');
  const [currentPageTuDo, setCurrentPageTuDo] = useState(1);
  const [limitTuDo, setLimitTuDo] = useState(15);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  const session = getValidSession();
  const currentUser = session?.user;
  const isAdmin = currentUser?.vai_tro?.ten_vai_tro === 'QuanLyKhoa' || currentUser?.vai_tro === 'QuanLyKhoa';

  // Modal Data
  const [nhaMayOptions, setNhaMayOptions] = useState([]);
  const [lichOptions, setLichOptions] = useState([]);

  // Dropdown States for Modal
  const [isNhaMayDropdownOpen, setIsNhaMayDropdownOpen] = useState(false);
  const [selectedNhaMay, setSelectedNhaMay] = useState('');

  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');

  const [isHinhThucDropdownOpen, setIsHinhThucDropdownOpen] = useState(false);
  const [selectedHinhThuc, setSelectedHinhThuc] = useState('');
  const hinhThucOptions = ["Trực tiếp", "Trực tuyến"];

  // Form states
  const [ngay, setNgay] = useState('');
  const [gioBatDau, setGioBatDau] = useState('');
  const [sucChua, setSucChua] = useState('');
  const [lePhi, setLePhi] = useState(0);
  const [diaDiemTapTrung, setDiaDiemTapTrung] = useState('');
  const [hanDongLePhi, setHanDongLePhi] = useState('');

  // Toast Popup State
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 3000);
  };

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const showConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };
  const closeConfirm = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });

  // Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState({
    tripId: null,
    tripCapacity: 0,
    suggestedAccepted: [],
    suggestedRejected: []
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Cancel Trip State
  const [cancelTripId, setCancelTripId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Approve Trip Modal States
  const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false); // Cho CLB chọn giảng viên
  const [isKhoaConfirmModalOpen, setIsKhoaConfirmModalOpen] = useState(false); // Cho Khoa xác nhận phê duyệt
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [pendingApprovalTripId, setPendingApprovalTripId] = useState(null);
  const [pendingApprovalTrip, setPendingApprovalTrip] = useState(null);
  const [lecturerSearchTerm, setLecturerSearchTerm] = useState('');
  const selectedLecturer = lecturers.find(g => String(g.id) === String(selectedLecturerId));

  // State gộp chuyến tham quan tự do
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchingTripsData, setMatchingTripsData] = useState([]);
  const [otherPendingProposalsData, setOtherPendingProposalsData] = useState([]);
  const [approvalMode, setApprovalMode] = useState('new'); // 'new' | 'merge_existing'
  const [selectedMergeTripId, setSelectedMergeTripId] = useState(null);
  const [selectedBatchProposalIds, setSelectedBatchProposalIds] = useState([]);

  const isLecturerBusyOnDate = useCallback((lecturerId, dateStr) => {
    if (!dateStr || !lecturerId) return false;
    const targetDate = new Date(dateStr).toDateString();
    return allSystemTrips.some(trip => {
      if (!trip.ngay_tham_quan || trip.trang_thai === 'DaHuy') return false;
      return new Date(trip.ngay_tham_quan).toDateString() === targetDate &&
        trip.giaoVienDanDoan?.some(g => String(g.giang_vien_id) === String(lecturerId));
    });
  }, [allSystemTrips]);

  const targetDateForModal = pendingApprovalTrip?.ngay_tham_quan_de_xuat;

  const busyModalLecturersCount = useMemo(() => {
    if (!targetDateForModal) return 0;
    return lecturers.filter(gv => isLecturerBusyOnDate(gv.id, targetDateForModal)).length;
  }, [lecturers, targetDateForModal, isLecturerBusyOnDate]);

  const filteredModalLecturers = useMemo(() => {
    // 1. Ẩn các giảng viên đã có lịch dẫn đoàn trong cùng ngày
    let list = lecturers;
    if (targetDateForModal) {
      list = list.filter(gv => !isLecturerBusyOnDate(gv.id, targetDateForModal));
    }
    // 2. Tìm kiếm theo từ khóa
    if (!lecturerSearchTerm.trim()) return list;
    const q = lecturerSearchTerm.toLowerCase();
    return list.filter(gv => 
      gv.ho_ten?.toLowerCase().includes(q) ||
      gv.ma_gv?.toLowerCase().includes(q) ||
      gv.magv?.toLowerCase().includes(q) ||
      gv.ma_giang_vien?.toLowerCase().includes(q) ||
      gv.bo_mon?.toLowerCase().includes(q) ||
      gv.email?.toLowerCase().includes(q)
    );
  }, [lecturers, lecturerSearchTerm, targetDateForModal, isLecturerBusyOnDate]);


  useEffect(() => {
    fetchInitialData();
    fetchTrips();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [facRes, schRes, lecRes] = await Promise.all([
        khoaApi.getFactories(),
        khoaApi.getSchedules(),
        khoaApi.getLecturers()
      ]);
      setNhaMayOptions(facRes.data);
      setLichOptions(schRes.data);
      setLecturers(lecRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const [tripsRes, proposalsRes] = await Promise.all([
        khoaApi.getTrips(),
        khoaApi.getProposals()
      ]);
      const rawTrips = tripsRes.data || [];
      setAllSystemTrips(rawTrips);
      let allTrips = rawTrips;
      if (isAdmin) {
        const approvedLich = ['DaDuyet', 'MoDangKy', 'DangDienRa', 'DaKetThuc', 'DaKhoa'];
        allTrips = allTrips.filter(t => t.lichKienTap && approvedLich.includes(t.lichKienTap.trang_thai));
      }
      setTripsKhoa(allTrips);
      setTripsTuDo(proposalsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedNhaMay('');
    setSelectedHinhThuc('');
    setNgay('');
    setGioBatDau('');
    setSucChua('');
    setLePhi(0);
    setDiaDiemTapTrung('');
    setHanDongLePhi('');
    setIsEditMode(false);
    setCurrentEditingTrip(null);
  };

  const handleAddClick = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (t) => {
    setIsEditMode(true);
    setCurrentEditingTrip(t);
    setSelectedNhaMay(t.nha_may_id);
    setSelectedHinhThuc(t.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến');
    setNgay(t.ngay_tham_quan ? new Date(t.ngay_tham_quan).toISOString().split('T')[0] : '');
    setGioBatDau(t.gio_bat_dau ? t.gio_bat_dau.substring(0, 5) : '');
    setSucChua(t.suc_chua);
    setLePhi(t.le_phi || 0);
    setDiaDiemTapTrung(t.dia_diem_tap_trung || '');
    setHanDongLePhi(t.han_dong_le_phi ? new Date(t.han_dong_le_phi).toISOString().slice(0, 16) : '');
    setIsModalOpen(true);
  };

  const handleSubmitTrip = async (e) => {
    e.preventDefault();
    if (!selectedNhaMay || !selectedHinhThuc || !ngay || !gioBatDau || !sucChua) {
      showPopup("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    const payload = {
      nha_may_id: selectedNhaMay,
      ngay_tham_quan: ngay,
      gio_bat_dau: gioBatDau,
      hinh_thuc: selectedHinhThuc === 'Trực tuyến' ? 'TrucTuyen' : 'TrucTiep',
      suc_chua: Number(sucChua),
      le_phi: Number(lePhi),
      dia_diem_tap_trung: diaDiemTapTrung,
      han_dong_le_phi: hanDongLePhi || null
    };

    try {
      if (isEditMode) {
        await khoaApi.updateTrip(currentEditingTrip.id, payload);
        showPopup('Cập nhật chuyến tham quan thành công', 'success');
      } else {
        await khoaApi.createTrip(payload);
        showPopup('Tạo chuyến tham quan thành công', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      fetchTrips();
    } catch (err) {
      console.error(err);
      showPopup(err.response?.data?.message || 'Lỗi lưu chuyến tham quan', 'error');
    }
  };

  const handleDeleteTrip = (id) => {
    showConfirm("Xác nhận xóa", "Bạn có chắc chắn muốn xóa chuyến tham quan này không?", async () => {
      try {
        await khoaApi.deleteTrip(id);
        showPopup('Xóa chuyến tham quan thành công', 'success');
        fetchTrips();
      } catch (err) {
        showPopup(err.response?.data?.message || 'Lỗi khi xóa chuyến tham quan', 'error');
      }
    });
  };

  const handleCancelTrip = (id) => {
    setCancelTripId(id);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const confirmCancelTrip = async () => {
    if (!cancelReason || cancelReason.trim().length < 5) {
      showPopup('Vui lòng nhập lý do hủy (ít nhất 5 ký tự)', 'error');
      return;
    }
    try {
      const res = await khoaApi.cancelTrip(cancelTripId, cancelReason.trim());
      showPopup(
        `Đã hủy chuyến thành công. ${res.data.cancelledRegistrations} phiếu đăng ký bị ảnh hưởng.`,
        'success',
      );
      setIsCancelModalOpen(false);
      setCancelTripId(null);
      setCancelReason('');
      fetchTrips();
    } catch (err) {
      showPopup(err.response?.data?.message || 'Lỗi khi hủy chuyến tham quan', 'error');
    }
  };

  const handlePreviewAssignStudents = async (tripId) => {
    try {
      const currentTrip = tripsKhoa.find(t => t.id === tripId) || tripsTuDo.find(t => t.id === tripId);
      if (currentTrip && currentTrip.han_dong_le_phi) {
        setDeadlineDate(new Date(currentTrip.han_dong_le_phi).toISOString().slice(0, 16));
      } else {
        setDeadlineDate('');
      }

      const res = await khoaApi.previewAssignStudents({ tripId });
      setPreviewData({
        tripId,
        tripCapacity: res.data.tripCapacity,
        suggestedAccepted: res.data.suggestedAccepted,
        suggestedRejected: res.data.suggestedRejected
      });
      setSelectedStudentIds(res.data.suggestedAccepted.map(p => p.sinh_vien_id));
      setIsPreviewModalOpen(true);
    } catch (err) {
      showPopup(err.response?.data?.message || 'Lỗi khi lấy danh sách dự kiến', 'error');
    }
  };

  const handleConfirmAssignStudents = async () => {
    if (!deadlineDate) {
      showPopup('Vui lòng chọn hạn chót nộp lệ phí', 'error');
      return;
    }
    try {
      await khoaApi.confirmAssignStudents({
        tripId: previewData.tripId,
        acceptedStudentIds: selectedStudentIds,
        deadlineDate
      });
      showPopup('Chốt danh sách thành công', 'success');
      setIsPreviewModalOpen(false);
      fetchTrips();
    } catch (err) {
      showPopup(err.response?.data?.message || 'Lỗi khi chốt danh sách', 'error');
    }
  };

  const handleReopenRegistration = (tripId) => {
    showConfirm("Mở đăng ký bổ sung", "Bạn có chắc chắn muốn mở lại cổng đăng ký cho chuyến này để tuyển thêm sinh viên?", async () => {
      try {
        await khoaApi.reopenTripRegistration(tripId);
        showPopup('Đã mở đăng ký bổ sung', 'success');
        fetchTrips();
      } catch (err) {
        showPopup(err.response?.data?.message || 'Lỗi khi mở đăng ký', 'error');
      }
    });
  };

  const handleApproveEmergencyEdit = (tripId, isApproved) => {
    const actionText = isApproved ? "duyệt" : "từ chối";
    const action = async () => {
      try {
        await khoaApi.approveEmergencyEdit(tripId, isApproved);
        showPopup(`${isApproved ? 'Duyệt' : 'Từ chối'} yêu cầu sửa đổi thành công`, 'success');
        fetchTrips();
      } catch (err) {
        console.error(err);
        showPopup(err.response?.data?.message || `Có lỗi xảy ra khi xử lý yêu cầu`, 'error');
      }
    };
    showConfirm(`Xác nhận ${actionText}`, `Bạn có chắc chắn muốn ${actionText} yêu cầu sửa đổi thông tin cho chuyến tham quan này?`, action);
  };

  const fetchMatchingTrips = async (proposalId) => {
    setMatchingLoading(true);
    try {
      const res = await khoaApi.getMatchingTrips(proposalId);
      const matches = res.data?.matchingTrips || [];
      const others = res.data?.otherPendingProposals || [];
      setMatchingTripsData(matches);
      setOtherPendingProposalsData(others);
      if (matches.length > 0) {
        setSelectedMergeTripId(matches[0].id);
      }
    } catch (err) {
      console.error('Lỗi khi lấy thông tin chuyến trùng khớp:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleApproveTrip = (tripOrId, isApproved) => {
    if (!currentUser) {
      showPopup('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.', 'error');
      return;
    }

    const tripObj = typeof tripOrId === 'object' && tripOrId !== null
      ? tripOrId
      : tripsTuDo.find(t => t.id === tripOrId) || null;
    const tripId = tripObj?.id || tripOrId;

    if (isApproved) {
      setPendingApprovalTrip(tripObj);
      setPendingApprovalTripId(tripId);

      // Nếu là Quản lý Khoa: Mở Modal xác nhận phê duyệt (Read-only, không chọn GV)
      if (isAdmin) {
        setIsKhoaConfirmModalOpen(true);
        return;
      }

      // Nếu là CLB: Mở Modal chọn giảng viên / Gộp chuyến
      const initialGvId = tripObj?.giang_vien_id || tripObj?.giangVien?.id;
      const isInitialBusy = initialGvId && isLecturerBusyOnDate(initialGvId, tripObj?.ngay_tham_quan_de_xuat);
      setSelectedLecturerId(isInitialBusy ? '' : (initialGvId ? String(initialGvId) : ''));
      setLecturerSearchTerm('');
      setApprovalMode('new');
      setSelectedMergeTripId(null);
      setSelectedBatchProposalIds([]);
      setMatchingTripsData([]);
      setOtherPendingProposalsData([]);
      fetchMatchingTrips(tripId);
      setIsLecturerModalOpen(true);
      return;
    }

    const action = async () => {
      try {
        const res = await khoaApi.approveTrip({ tripId, approverId: currentUser.id, isApproved: false });
        showPopup(res.data?.message || (isAdmin ? 'Khoa đã từ chối chuyến tham quan tự do' : 'CLB đã từ chối chuyến tham quan'), 'success');
        fetchTrips();
      } catch (err) {
        console.error(err);
        showPopup(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu', 'error');
      }
    };

    showConfirm("Xác nhận từ chối", "Bạn có chắc chắn muốn từ chối chuyến tham quan này?", action);
  };

  // Xác nhận Phê Duyệt từ Quản lý Khoa (Không gửi giảng viên, chỉ duyệt/từ chối)
  const submitKhoaApprove = async () => {
    try {
      const res = await khoaApi.approveTrip({ 
        tripId: pendingApprovalTripId, 
        approverId: currentUser.id, 
        isApproved: true
      });
      showPopup(res.data?.message || 'Khoa đã phê duyệt chính thức chuyến tham quan tự do thành công', 'success');
      setIsKhoaConfirmModalOpen(false);
      fetchTrips();
    } catch (err) {
      console.error(err);
      showPopup(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu phê duyệt', 'error');
    }
  };

  // Xác nhận Duyệt Sơ Bộ từ CLB (Hỗ trợ Tạo mới hoặc Gộp vào chuyến tự do đã có)
  const submitApproveWithLecturer = async () => {
    if (approvalMode === 'merge_existing') {
      if (!selectedMergeTripId) {
        showPopup('Vui lòng chọn chuyến tham quan tự do muốn gộp vào', 'error');
        return;
      }
      try {
        const res = await khoaApi.approveTrip({ 
          tripId: pendingApprovalTripId, 
          approverId: currentUser.id, 
          isApproved: true,
          gopVaoChuyenId: Number(selectedMergeTripId),
          gopCacPhieuDeXuatIds: selectedBatchProposalIds.length > 0 ? selectedBatchProposalIds : undefined,
        });
        showPopup(res.data?.message || 'Đã gộp đề xuất vào chuyến tham quan thành công', 'success');
        setIsLecturerModalOpen(false);
        fetchTrips();
      } catch (err) {
        console.error(err);
        showPopup(err.response?.data?.message || 'Có lỗi xảy ra khi gộp chuyến', 'error');
      }
      return;
    }

    // Chế độ 'new'
    if (!selectedLecturerId) {
      showPopup('Vui lòng chọn giảng viên dẫn đoàn', 'error');
      return;
    }
    if (isLecturerBusyOnDate(selectedLecturerId, pendingApprovalTrip?.ngay_tham_quan_de_xuat)) {
      showPopup('Giảng viên đã chọn đã có lịch dẫn đoàn cho chuyến tham quan khác trong cùng ngày', 'error');
      return;
    }
    
    try {
      const res = await khoaApi.approveTrip({ 
        tripId: pendingApprovalTripId, 
        approverId: currentUser.id, 
        isApproved: true,
        giangVienId: parseInt(selectedLecturerId),
        gopCacPhieuDeXuatIds: selectedBatchProposalIds.length > 0 ? selectedBatchProposalIds : undefined,
      });
      showPopup(res.data?.message || 'CLB đã duyệt sơ bộ đề xuất thành công', 'success');
      setIsLecturerModalOpen(false);
      fetchTrips();
    } catch (err) {
      console.error(err);
      let errMsg = err.response?.data?.message;
      if (typeof errMsg === 'string' && (errMsg.includes('selection conditions') || errMsg.includes('single row'))) {
        errMsg = 'Không thể xác định đợt kiến tập để tiếp nhận chuyến đi tự do. Vui lòng kiểm tra lại đợt kiến tập.';
      }
      showPopup(errMsg || 'Có lỗi xảy ra khi xử lý yêu cầu', 'error');
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsNhaMayDropdownOpen(false);
    setIsLichDropdownOpen(false);
    setIsHinhThucDropdownOpen(false);
    setIsFilterStatusOpen(false);
    setIsFilterStatusTuDoOpen(false);
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleScroll = (e) => {
      if (activeDropdown && !e.target.closest?.('.dropdown-menu-container')) {
        setActiveDropdown(null);
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [activeDropdown]);

  const handleActionClick = (e, tripId) => {
    e.stopPropagation();
    if (activeDropdown === tripId) {
      setActiveDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = 135;
    let top = rect.bottom + 4;
    if (spaceBelow < menuHeight) {
      top = rect.top - menuHeight - 4;
    }
    setDropdownPosition({
      top,
      right: window.innerWidth - rect.right
    });
    setActiveDropdown(tripId);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(true);
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>

      {/* Custom Popup Toast */}
      {popup.show && (
        <div className="fixed top-6 right-6 z-[9999] pointer-events-none">
          <div className={`relative z-10 px-5 py-3.5 rounded-xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300 pointer-events-auto text-white font-semibold text-sm ${
            popup.type === 'error' ? 'bg-red-600 border-red-600 shadow-red-600/20' : 'bg-[#407F3E] border-[#407F3E] shadow-[#407F3E]/20'
          }`}>
            <span className="p-1 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              {popup.type === 'error' ? <XCircle className="w-4 h-4 text-white" /> : <CheckCircle2 className="w-4 h-4 text-white" />}
            </span>
            <span className="flex-1">{popup.message}</span>
            <button onClick={() => setPopup({ ...popup, show: false })} className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
              <span className="sr-only">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 relative z-0">
        <h1 className="text-2xl font-bold text-slate-800">Chuyến tham quan</h1>
      </div>

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeConfirm}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{confirmDialog.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={closeConfirm} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer">Hủy</button>
              <button onClick={() => { confirmDialog.onConfirm(); closeConfirm(); }} className="px-4 py-2 bg-[#407F3E] text-white rounded-xl text-sm font-bold hover:bg-[#407F3E]/90 transition-colors cursor-pointer shadow-sm">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E7E0C4] mb-6">
        <button
          onClick={() => setActiveTab('khoa')}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'khoa' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          {isAdmin ? 'Danh sách chuyến tham quan' : 'Chuyến do khoa tổ chức'}
          {activeTab === 'khoa' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('tudo')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'tudo' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Đề xuất chuyến tự do
          <span className="bg-[#DBD468] text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
            {isAdmin
              ? tripsTuDo.filter(t => t.trang_thai_duyet === 'ChoKhoaDuyet').length
              : tripsTuDo.filter(t => t.trang_thai_duyet === 'ChoDuyet').length}
          </span>
          {activeTab === 'tudo' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Tab 1: Khoa tổ chức */}
      {activeTab === 'khoa' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhà máy..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPageKhoa(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#407F3E] focus:border-[#407F3E] transition-shadow"
                />
              </div>

              {/* Popover Filter Trạng thái Tab 1 */}
              <div className="relative min-w-[200px]" onClick={e => e.stopPropagation()}>
                <div
                  onClick={() => setIsFilterStatusOpen(!isFilterStatusOpen)}
                  className={`w-full px-4 py-2 bg-white border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isFilterStatusOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                >
                  <span className={`truncate pr-2 font-medium ${filterStatus !== 'ALL' ? 'text-slate-800' : 'text-slate-600'}`}>
                    {filterStatus === 'ALL' ? 'Tất cả trạng thái' :
                      filterStatus === 'Nhap' ? 'Nháp' :
                        filterStatus === 'MoDangKy' ? 'Mở đăng ký' :
                          filterStatus === 'DaChotDanhSach' ? 'Đã chốt danh sách' :
                            filterStatus === 'DaDienRa' ? 'Đã diễn ra' :
                              filterStatus === 'DaHuy' ? 'Đã huỷ' : filterStatus}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isFilterStatusOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
                </div>
                {isFilterStatusOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
                    <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                      <input
                        type="text"
                        placeholder="Tìm trạng thái..."
                        value={searchStatusKhoa}
                        onChange={(e) => setSearchStatusKhoa(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {[
                        { value: 'ALL', label: 'Tất cả trạng thái' },
                        { value: 'Nhap', label: 'Nháp' },
                        { value: 'MoDangKy', label: 'Mở đăng ký' },
                        { value: 'DaChotDanhSach', label: 'Đã chốt danh sách' },
                        { value: 'DaDienRa', label: 'Đã diễn ra' },
                        { value: 'DaHuy', label: 'Đã huỷ' },
                      ]
                        .filter(opt => opt.label.toLowerCase().includes(searchStatusKhoa.toLowerCase()))
                        .map(opt => (
                          <div
                            key={opt.value}
                            onClick={() => {
                              setFilterStatus(opt.value);
                              setIsFilterStatusOpen(false);
                              setCurrentPageKhoa(1);
                              setSearchStatusKhoa('');
                            }}
                            className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${filterStatus === opt.value ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                              }`}
                          >
                            <span className="truncate pr-2">{opt.label}</span>
                            {filterStatus === opt.value && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                          </div>
                        ))}
                      {[
                        { value: 'ALL', label: 'Tất cả trạng thái' },
                        { value: 'Nhap', label: 'Nháp' },
                        { value: 'MoDangKy', label: 'Mở đăng ký' },
                        { value: 'DaChotDanhSach', label: 'Đã chốt danh sách' },
                        { value: 'DaDienRa', label: 'Đã diễn ra' },
                        { value: 'DaHuy', label: 'Đã huỷ' },
                      ].filter(opt => opt.label.toLowerCase().includes(searchStatusKhoa.toLowerCase())).length === 0 && searchStatusKhoa && (
                          <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); handleAddClick(); }}
                className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Tạo chuyến tham quan
              </button>
            )}
          </div>

          {(() => {
            const filteredTripsKhoa = tripsKhoa.filter(t => {
              const tenNhaMay = t.nhaMay?.ten_nha_may || '';
              const matchSearch = tenNhaMay.toLowerCase().includes(searchQuery.toLowerCase());
              const matchStatus = filterStatus === 'ALL' || t.trang_thai === filterStatus;
              return matchSearch && matchStatus;
            });
            const totalKhoa = filteredTripsKhoa.length;
            const totalPagesKhoa = Math.ceil(totalKhoa / limitKhoa) || 1;
            const validCurrentPageKhoa = Math.min(currentPageKhoa, totalPagesKhoa);
            const paginatedTripsKhoa = filteredTripsKhoa.slice((validCurrentPageKhoa - 1) * limitKhoa, validCurrentPageKhoa * limitKhoa);

            return (
              <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin w-5 h-5 text-[#407F3E]" />
                      Đang tải...
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                          <th className="p-4 pl-6">Nhà máy</th>
                          <th className="p-4">Ngày tham quan</th>
                          <th className="p-4">Giờ</th>
                          <th className="p-4 text-center">Hình thức</th>
                          <th className="p-4">Sức chứa</th>
                          <th className="p-4 text-center">Trạng thái</th>
                          <th className="p-4 text-right pr-6">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                        {paginatedTripsKhoa.map(t => {
                          const used = t.dang_ky_count || 0;
                          const max = t.suc_chua || 0;
                          const percent = max > 0 ? (used / max) * 100 : 0;

                          const formatTime = (timeStr) => {
                            if (!timeStr) return '';
                            return timeStr.substring(0, 5);
                          };

                          return (
                            <tr key={t.id} onClick={() => setViewingDetail(t)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                              <td className="p-4 pl-6 font-bold text-slate-800">{t.nhaMay?.ten_nha_may || 'N/A'}</td>
                              <td className="p-4 font-medium text-slate-600">
                                {new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="p-4 font-medium text-slate-600">{formatTime(t.gio_bat_dau)}</td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${t.hinh_thuc === 'TrucTiep' ? 'bg-[#89B449]/10 text-[#407F3E] border-[#89B449]/20' : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                  {t.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-between text-xs font-bold mb-1 text-slate-700">
                                  <span>{used}/{max}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${percent >= 100 ? 'bg-[#E68A8C]' : 'bg-[#89B449]'}`}
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm border whitespace-nowrap ${t.trang_thai === 'MoDangKy' ? 'bg-[#89B449] text-white border-[#89B449]/20' :
                                    t.trang_thai === 'Nhap' ? 'bg-slate-400 text-white border-slate-400/20' :
                                      t.trang_thai === 'DaHuy' ? 'bg-[#E68A8C] text-white border-[#E68A8C]/20' :
                                        'bg-[#407F3E] text-white border-[#407F3E]/20'
                                    }`}>
                                    {t.trang_thai === 'MoDangKy' ? 'Mở đăng ký' :
                                      t.trang_thai === 'DaChotDanhSach' ? 'Đã chốt danh sách' :
                                        t.trang_thai === 'DaDienRa' ? 'Đã diễn ra' :
                                          t.trang_thai === 'DaHuy' ? 'Đã huỷ' : 'Nháp'}
                                  </span>
                                  {t.trang_thai_sua_doi === 'ChoDuyet' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200 whitespace-nowrap" title="Có sửa đổi đang chờ duyệt">
                                      ⚠️ Đang chờ duyệt sửa
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right pr-6 relative">
                                <button
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${activeDropdown === t.id ? 'bg-[#407F3E]/10 text-[#407F3E]' : 'text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10'}`}
                                  title="Thao tác"
                                  onClick={(e) => handleActionClick(e, t.id)}
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>

                                {activeDropdown === t.id && createPortal(
                                  <div
                                    className="dropdown-menu-container fixed w-48 bg-white rounded-xl shadow-lg border border-[#E7E0C4] overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-200"
                                    style={{ top: dropdownPosition.top, right: dropdownPosition.right }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {isAdmin ? (
                                      <>
                                        {t.trang_thai_sua_doi === 'ChoDuyet' ? (
                                          <>
                                            <button onClick={(e) => { e.stopPropagation(); handleApproveEmergencyEdit(t.id, true); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#407F3E] hover:bg-green-50 flex items-center gap-2 transition-colors border-b border-slate-100">
                                              <CheckCircle className="w-4 h-4" /> Duyệt sửa đổi
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleApproveEmergencyEdit(t.id, false); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#E68A8C] hover:bg-red-50 flex items-center gap-2 transition-colors border-b border-slate-100">
                                              <XCircle className="w-4 h-4" /> Từ chối sửa đổi
                                            </button>
                                          </>
                                        ) : (
                                          <div className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-400">
                                            Không có thao tác
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {t.trang_thai === 'Nhap' && (
                                          <>
                                            <button onClick={(e) => { e.stopPropagation(); handleEditClick(t); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                              <Edit className="w-4 h-4 text-[#89B449]" /> Cập nhật
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTrip(t.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#E68A8C] hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-100">
                                              <Trash2 className="w-4 h-4" /> Xóa
                                            </button>
                                          </>
                                        )}

                                        {t.trang_thai === 'MoDangKy' && (
                                          <>
                                            {t.trang_thai_sua_doi !== 'ChoDuyet' && (
                                              <button onClick={(e) => { e.stopPropagation(); handleEditClick(t); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors border-b border-slate-100">
                                                <Edit className="w-4 h-4 text-orange-500" /> Sửa đổi khẩn cấp
                                              </button>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); handleCancelTrip(t.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#E68A8C] hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-100">
                                              <Trash2 className="w-4 h-4" /> Hủy chuyến
                                            </button>
                                          </>
                                        )}

                                        {t.trang_thai === 'DaChotDanhSach' && (
                                          <>
                                            {t.trang_thai_sua_doi !== 'ChoDuyet' && (
                                              <button onClick={(e) => { e.stopPropagation(); handleEditClick(t); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors border-b border-slate-100">
                                                <Edit className="w-4 h-4 text-orange-500" /> Sửa đổi khẩn cấp
                                              </button>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); handleReopenRegistration(t.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors">
                                              <RotateCcw className="w-4 h-4" /> Mở đăng ký bổ sung
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleCancelTrip(t.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#E68A8C] hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-100">
                                              <Trash2 className="w-4 h-4" /> Hủy chuyến
                                            </button>
                                          </>
                                        )}

                                        {t.trang_thai === 'DaDuyet' && (
                                          <>
                                            {t.trang_thai_sua_doi !== 'ChoDuyet' && (
                                              <button onClick={(e) => { e.stopPropagation(); handleEditClick(t); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors border-b border-slate-100">
                                                <Edit className="w-4 h-4 text-orange-500" /> Sửa đổi khẩn cấp
                                              </button>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); handleCancelTrip(t.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#E68A8C] hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-100">
                                              <Trash2 className="w-4 h-4" /> Hủy chuyến
                                            </button>
                                          </>
                                        )}

                                        {t.trang_thai !== 'Nhap' && t.trang_thai !== 'MoDangKy' && t.trang_thai !== 'DaDuyet' && t.trang_thai !== 'DaChotDanhSach' && (
                                          <div className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-400">
                                            Không có thao tác
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>,
                                  document.body
                                )}
                              </td>
                            </tr>
                          )
                        })}
                        {paginatedTripsKhoa.length === 0 && (
                          <tr>
                            <td colSpan="7" className="text-center py-8 text-slate-500 font-medium">Không tìm thấy chuyến nào</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination Footer Tab 1 */}
                <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <span>Hiển thị</span>
                    <SearchableDropdown
                      value={limitKhoa}
                      onChange={val => {
                        setLimitKhoa(Number(val));
                        setCurrentPageKhoa(1);
                      }}
                      options={[
                        { value: 15, label: '15' },
                        { value: 30, label: '30' },
                        { value: 50, label: '50' },
                        { value: 100, label: '100' }
                      ]}
                      className="min-w-[80px]"
                      searchPlaceholder="Tìm..."
                      direction="up"
                    />
                    <span>/ {totalKhoa} chuyến</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPageKhoa(1)}
                      disabled={validCurrentPageKhoa <= 1}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Trang đầu
                    </button>
                    <button
                      onClick={() => setCurrentPageKhoa(prev => Math.max(prev - 1, 1))}
                      disabled={validCurrentPageKhoa <= 1}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                      Trang {validCurrentPageKhoa} / {totalPagesKhoa}
                    </span>
                    <button
                      onClick={() => setCurrentPageKhoa(prev => Math.min(prev + 1, totalPagesKhoa))}
                      disabled={validCurrentPageKhoa >= totalPagesKhoa}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Sau
                    </button>
                    <button
                      onClick={() => setCurrentPageKhoa(totalPagesKhoa)}
                      disabled={validCurrentPageKhoa >= totalPagesKhoa}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Trang cuối
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 2: Tự do chờ duyệt */}
      {activeTab === 'tudo' && (
        <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          {/* Filter Bar Tab 2 */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-64 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo SV, MSSV, Nhà máy..."
                value={searchQueryTuDo}
                onChange={(e) => {
                  setSearchQueryTuDo(e.target.value);
                  setCurrentPageTuDo(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#407F3E] focus:border-[#407F3E] transition-shadow"
              />
            </div>

            {/* Popover Filter Trạng thái Tab 2 */}
            <div className="relative min-w-[180px]" onClick={e => e.stopPropagation()}>
              <div
                onClick={() => setIsFilterStatusTuDoOpen(!isFilterStatusTuDoOpen)}
                className={`w-full px-4 py-2 bg-white border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isFilterStatusTuDoOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
              >
                <span className={`truncate pr-2 font-medium ${filterStatusTuDo !== 'ALL' ? 'text-slate-800' : 'text-slate-600'}`}>
                  {filterStatusTuDo === 'ALL' ? 'Tất cả trạng thái' :
                    filterStatusTuDo === 'ChoDuyet' ? 'Chờ CLB duyệt' :
                      filterStatusTuDo === 'ChoKhoaDuyet' ? 'Chờ Khoa duyệt' :
                        filterStatusTuDo === 'DaDuyet' ? 'Đã duyệt' :
                          filterStatusTuDo === 'TuChoi' ? 'Từ chối' : filterStatusTuDo}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isFilterStatusTuDoOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
              </div>
              {isFilterStatusTuDoOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
                  <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                    <input
                      type="text"
                      placeholder="Tìm trạng thái..."
                      value={searchStatusTuDo}
                      onChange={(e) => setSearchStatusTuDo(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {[
                      { value: 'ALL', label: 'Tất cả trạng thái' },
                      { value: 'ChoDuyet', label: 'Chờ CLB duyệt' },
                      { value: 'ChoKhoaDuyet', label: 'Chờ Khoa duyệt' },
                      { value: 'DaDuyet', label: 'Đã duyệt' },
                      { value: 'TuChoi', label: 'Từ chối' },
                    ]
                      .filter(opt => opt.label.toLowerCase().includes(searchStatusTuDo.toLowerCase()))
                      .map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setFilterStatusTuDo(opt.value);
                            setIsFilterStatusTuDoOpen(false);
                            setCurrentPageTuDo(1);
                            setSearchStatusTuDo('');
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${filterStatusTuDo === opt.value ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                            }`}
                        >
                          <span className="truncate pr-2">{opt.label}</span>
                          {filterStatusTuDo === opt.value && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                        </div>
                      ))}
                    {[
                      { value: 'ALL', label: 'Tất cả trạng thái' },
                      { value: 'ChoDuyet', label: 'Chờ CLB duyệt' },
                      { value: 'ChoKhoaDuyet', label: 'Chờ Khoa duyệt' },
                      { value: 'DaDuyet', label: 'Đã duyệt' },
                      { value: 'TuChoi', label: 'Từ chối' },
                    ].filter(opt => opt.label.toLowerCase().includes(searchStatusTuDo.toLowerCase())).length === 0 && searchStatusTuDo && (
                        <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {(() => {
            const filteredTripsTuDo = tripsTuDo.filter(t => {
              const sv = t.sinhVien || {};
              const factory = t.ten_nha_may_de_xuat || t.nhaMay?.ten_nha_may || '';
              const matchSearch = (sv.ho_ten || '').toLowerCase().includes(searchQueryTuDo.toLowerCase()) ||
                (sv.mssv || '').toLowerCase().includes(searchQueryTuDo.toLowerCase()) ||
                factory.toLowerCase().includes(searchQueryTuDo.toLowerCase());
              const matchStatus = filterStatusTuDo === 'ALL' || t.trang_thai_duyet === filterStatusTuDo;
              return matchSearch && matchStatus;
            });
            const totalTuDo = filteredTripsTuDo.length;
            const totalPagesTuDo = Math.ceil(totalTuDo / limitTuDo) || 1;
            const validCurrentPageTuDo = Math.min(currentPageTuDo, totalPagesTuDo);
            const paginatedTripsTuDo = filteredTripsTuDo.slice((validCurrentPageTuDo - 1) * limitTuDo, validCurrentPageTuDo * limitTuDo);

            return (
              <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                        <th className="p-4 pl-6">Sinh viên đề xuất</th>
                        <th className="p-4">Nhà máy đề xuất</th>
                        <th className="p-4">Ngày tham quan</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-right pr-6">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                      {paginatedTripsTuDo.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-bold text-slate-800">{t.sinhVien?.ho_ten}</div>
                                <div className="text-xs font-mono text-slate-500">{t.sinhVien?.mssv}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-800">{t.ten_nha_may_de_xuat || t.nhaMay?.ten_nha_may || 'N/A'}</td>
                          <td className="p-4 font-medium text-slate-600">
                            {t.ngay_tham_quan_de_xuat ? new Date(t.ngay_tham_quan_de_xuat).toLocaleDateString('vi-VN') : 'N/A'}
                          </td>
                          <td className="p-4">
                            {t.trang_thai_duyet === 'ChoDuyet' && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-[#DBD468]/20 text-[#8B8000] text-[10px] font-bold border border-[#DBD468]/40 whitespace-nowrap">
                                Chờ CLB duyệt
                              </span>
                            )}
                            {t.trang_thai_duyet === 'ChoKhoaDuyet' && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-200 whitespace-nowrap">
                                Chờ Khoa duyệt
                              </span>
                            )}
                            {t.trang_thai_duyet === 'DaDuyet' && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-[#89B449]/15 text-[#407F3E] text-[10px] font-bold border border-[#89B449]/30 whitespace-nowrap">
                                Đã duyệt
                              </span>
                            )}
                            {t.trang_thai_duyet === 'TuChoi' && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-rose-50 text-rose-500 text-[10px] font-bold border border-rose-200 whitespace-nowrap">
                                Đã từ chối
                              </span>
                            )}
                            {!['ChoDuyet', 'ChoKhoaDuyet', 'DaDuyet', 'TuChoi'].includes(t.trang_thai_duyet) && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 whitespace-nowrap">
                                {t.trang_thai_duyet}
                              </span>
                            )}

                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setViewingDetail(t)} className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" title="Chi tiết">
                                <ChevronRight className="w-5 h-5" />
                              </button>

                              {/* CLB Duyệt sơ bộ */}
                              {!isAdmin && t.trang_thai_duyet === 'ChoDuyet' && (
                                <>
                                  <button onClick={() => handleApproveTrip(t, true)} className="px-3 py-1.5 bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Duyệt sơ bộ
                                  </button>
                                  <button onClick={() => handleApproveTrip(t, false)} className="px-3 py-1.5 border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer">
                                    <XCircle className="w-4 h-4" />
                                    Từ chối
                                  </button>
                                </>
                              )}

                              {/* Khoa Phê duyệt chính thức */}
                              {isAdmin && t.trang_thai_duyet === 'ChoKhoaDuyet' && (
                                <>
                                  <button onClick={() => handleApproveTrip(t, true)} className="px-3 py-1.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Phê duyệt
                                  </button>
                                  <button onClick={() => handleApproveTrip(t, false)} className="px-3 py-1.5 border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer">
                                    <XCircle className="w-4 h-4" />
                                    Từ chối
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedTripsTuDo.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-slate-500 font-medium">Không có đề xuất tự do nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer Tab 2 */}
                <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <span>Hiển thị</span>
                    <SearchableDropdown
                      value={limitTuDo}
                      onChange={val => {
                        setLimitTuDo(Number(val));
                        setCurrentPageTuDo(1);
                      }}
                      options={[
                        { value: 15, label: '15' },
                        { value: 30, label: '30' },
                        { value: 50, label: '50' },
                        { value: 100, label: '100' }
                      ]}
                      className="min-w-[80px]"
                      searchPlaceholder="Tìm..."
                      direction="up"
                    />
                    <span>/ {totalTuDo} đề xuất</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPageTuDo(1)}
                      disabled={validCurrentPageTuDo <= 1}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Trang đầu
                    </button>
                    <button
                      onClick={() => setCurrentPageTuDo(prev => Math.max(prev - 1, 1))}
                      disabled={validCurrentPageTuDo <= 1}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                      Trang {validCurrentPageTuDo} / {totalPagesTuDo}
                    </span>
                    <button
                      onClick={() => setCurrentPageTuDo(prev => Math.min(prev + 1, totalPagesTuDo))}
                      disabled={validCurrentPageTuDo >= totalPagesTuDo}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Sau
                    </button>
                    <button
                      onClick={() => setCurrentPageTuDo(totalPagesTuDo)}
                      disabled={validCurrentPageTuDo >= totalPagesTuDo}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Trang cuối
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Modal - Tạo chuyến tham quan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
          ></div>

          <form
            onSubmit={handleSubmitTrip}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#407F3E]" />
                {isEditMode ? 'Cập nhật chuyến tham quan' : 'Tạo chuyến tham quan'}
              </h2>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-visible">

              {/* Row 1: Nhà máy */}
              <div className="grid grid-cols-1 gap-5 relative">
                {/* Nhà máy */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nhà máy</label>
                  <SearchableDropdown
                    options={nhaMayOptions.map(o => ({ value: o.id, label: o.ten_nha_may }))}
                    value={selectedNhaMay}
                    onChange={(val) => setSelectedNhaMay(val)}
                    placeholder="Chọn nhà máy"
                    searchPlaceholder="Tìm nhà máy..."
                    className="w-full"
                  />
                </div>
              </div>

              {/* Row 2: Date & Time */}
              <div className="grid grid-cols-2 gap-5 relative z-40">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày tham quan</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={ngay}
                      onChange={(e) => setNgay(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium cursor-pointer"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Giờ tham quan</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="time"
                      value={gioBatDau}
                      onChange={(e) => setGioBatDau(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Hình thức & Sức chứa */}
              <div className="grid grid-cols-2 gap-5 relative z-30">
                {/* Hình thức */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Hình thức</label>
                  <div
                    onClick={(e) => handleDropdownClick(e, setIsHinhThucDropdownOpen)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isHinhThucDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium ${selectedHinhThuc ? 'text-slate-800' : 'text-slate-400'}`}>
                      {selectedHinhThuc || 'Chọn hình thức'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                  {isHinhThucDropdownOpen && (
                    <div className="absolute top-[70px] left-0 w-full bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
                      {hinhThucOptions.map(opt => (
                        <div
                          key={opt}
                          onClick={(e) => { e.stopPropagation(); setSelectedHinhThuc(opt); setIsHinhThucDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${selectedHinhThuc === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                            }`}
                        >
                          {opt}
                          {selectedHinhThuc === opt && <Check className="w-4 h-4 text-[#407F3E]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sức chứa */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Sức chứa</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      value={sucChua}
                      onChange={(e) => setSucChua(e.target.value)}
                      placeholder="VD: 40"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Lệ phí & Địa điểm */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-20">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Lệ phí (VNĐ)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={lePhi}
                      onChange={(e) => setLePhi(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Địa điểm tập trung</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={diaDiemTapTrung}
                      onChange={(e) => setDiaDiemTapTrung(e.target.value)}
                      placeholder="Vd: Sảnh C, HUIT"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Hạn đóng lệ phí</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={hanDongLePhi}
                      onChange={(e) => setHanDongLePhi(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end gap-3 rounded-b-2xl z-10">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Xem chi tiết */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
          ></div>

          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#E7E0C4]/40 to-transparent">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#89B449]" />
                Chi tiết chuyến tham quan
              </h2>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Factory Name */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Tên nhà máy</label>
                <p className="font-black text-slate-800 text-lg">
                  {viewingDetail.nhaMay?.ten_nha_may || viewingDetail.ten_nha_may_de_xuat || 'N/A'}
                </p>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  {(() => {
                    const oldNgay = viewingDetail.ngay_tham_quan ? new Date(viewingDetail.ngay_tham_quan).toLocaleDateString('vi-VN') : (viewingDetail.ngay_tham_quan_de_xuat ? new Date(viewingDetail.ngay_tham_quan_de_xuat).toLocaleDateString('vi-VN') : '--');
                    const newNgay = viewingDetail.ngay_tham_quan_moi ? new Date(viewingDetail.ngay_tham_quan_moi).toLocaleDateString('vi-VN') : null;
                    const isChanged = viewingDetail.trang_thai_sua_doi === 'ChoDuyet' && newNgay && oldNgay !== newNgay;
                    return (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 block">
                          Ngày tham quan
                          {isChanged && <span className="text-orange-500 font-bold lowercase">yêu cầu đổi</span>}
                        </label>
                        <div className="text-sm font-medium text-slate-700 mt-0.5 flex items-center gap-2">
                          <span className={isChanged ? 'line-through text-slate-400' : ''}>
                            {oldNgay}
                          </span>
                          {isChanged && (
                            <>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                              <span className="text-[#407F3E] font-bold">{newNgay}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  {(() => {
                    const oldGio = (viewingDetail.gio_bat_dau || viewingDetail.gio_bat_dau_de_xuat || '--').substring(0, 5);
                    const newGio = viewingDetail.gio_bat_dau_moi ? viewingDetail.gio_bat_dau_moi.substring(0, 5) : null;
                    const isChanged = viewingDetail.trang_thai_sua_doi === 'ChoDuyet' && newGio && oldGio !== newGio;
                    return (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 block">
                          Thời gian
                          {isChanged && <span className="text-orange-500 font-bold lowercase">yêu cầu đổi</span>}
                        </label>
                        <div className="text-sm font-medium text-slate-700 mt-0.5 flex items-center gap-2">
                          <span className={isChanged ? 'line-through text-slate-400' : ''}>
                            {oldGio}
                          </span>
                          {isChanged && (
                            <>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                              <span className="text-[#407F3E] font-bold">{newGio}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hình thức</label>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {viewingDetail.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cách tổ chức</label>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {viewingDetail.cach_to_chuc === 'DoKhoaToChuc' ? 'Khoa tổ chức' : 'Tự do'}
                    </p>
                  </div>
                </div>

                {viewingDetail.cach_to_chuc === 'DoKhoaToChuc' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    {(() => {
                      const oldSucChua = viewingDetail.suc_chua || 0;
                      const newSucChua = viewingDetail.suc_chua_moi;
                      const isChanged = viewingDetail.trang_thai_sua_doi === 'ChoDuyet' && newSucChua && Number(oldSucChua) !== Number(newSucChua);
                      return (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 block">
                            Sức chứa (Đã ĐK / Tổng)
                            {isChanged && <span className="text-orange-500 font-bold lowercase">yêu cầu đổi</span>}
                          </label>
                          <div className="text-sm font-medium text-slate-700 mt-0.5 flex items-center gap-2">
                            <span className={isChanged ? 'line-through text-slate-400' : ''}>
                              <span className="text-[#407F3E] font-bold">{viewingDetail.dang_ky_count || 0}</span> / {oldSucChua}
                            </span>
                            {isChanged && (
                              <>
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                <span className="text-[#407F3E] font-bold">{viewingDetail.dang_ky_count || 0} / {newSucChua}</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {viewingDetail.cach_to_chuc === 'DoKhoaToChuc' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    {(() => {
                      const oldHan = viewingDetail.han_dong_le_phi ? new Date(viewingDetail.han_dong_le_phi).toLocaleDateString('vi-VN') + ' ' + new Date(viewingDetail.han_dong_le_phi).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '--';
                      const newHan = viewingDetail.han_dong_le_phi_moi ? new Date(viewingDetail.han_dong_le_phi_moi).toLocaleDateString('vi-VN') + ' ' + new Date(viewingDetail.han_dong_le_phi_moi).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : null;
                      const isChanged = viewingDetail.trang_thai_sua_doi === 'ChoDuyet' && newHan && oldHan !== newHan;
                      return (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 block">
                            Hạn đóng lệ phí
                            {isChanged && <span className="text-orange-500 font-bold lowercase">yêu cầu đổi</span>}
                          </label>
                          <div className="text-sm font-medium text-slate-700 mt-0.5 flex items-center gap-2">
                            <span className={isChanged ? 'line-through text-slate-400' : ''}>
                              {oldHan}
                            </span>
                            {isChanged && (
                              <>
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                <span className="text-[#407F3E] font-bold">{newHan}</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Người liên hệ doanh nghiệp / cơ sở đề xuất */}
                {(viewingDetail.trang_thai_duyet || viewingDetail.nguoi_lien_he_de_xuat || viewingDetail.nhaMay?.nguoi_lien_he) && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Người liên hệ</label>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {viewingDetail.nguoi_lien_he_de_xuat || viewingDetail.nhaMay?.nguoi_lien_he || 'Chưa cập nhật'}
                      </p>
                      <span className="text-xs text-slate-500 block">Đại diện doanh nghiệp / điểm đến</span>
                    </div>
                  </div>
                )}

                {/* Số điện thoại liên hệ doanh nghiệp */}
                {(viewingDetail.trang_thai_duyet || viewingDetail.sdt_lien_he_de_xuat || viewingDetail.nhaMay?.sdt_lien_he) && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số điện thoại liên hệ</label>
                      <p className="text-sm font-bold text-slate-800 mt-0.5 font-mono">
                        {viewingDetail.sdt_lien_he_de_xuat || viewingDetail.nhaMay?.sdt_lien_he || 'Chưa cập nhật'}
                      </p>
                      <span className="text-xs text-slate-500 block">SĐT liên hệ doanh nghiệp</span>
                    </div>
                  </div>
                )}

                {/* Địa chỉ nơi tham quan */}
                {(viewingDetail.dia_chi_de_xuat || viewingDetail.nhaMay?.dia_chi) && (
                  <div className="flex gap-3 md:col-span-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Địa chỉ nơi tham quan</label>
                      <p className="text-sm font-medium text-slate-700 mt-0.5 leading-relaxed">
                        {viewingDetail.dia_chi_de_xuat || viewingDetail.nhaMay?.dia_chi || (viewingDetail.hinh_thuc === 'TrucTuyen' ? 'Tham quan trực tuyến' : 'Chưa cập nhật')}
                      </p>
                    </div>
                  </div>
                )}

                {viewingDetail.trang_thai_duyet && viewingDetail.sinhVien && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sinh viên đề xuất</label>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {viewingDetail.sinhVien.ho_ten} ({viewingDetail.sinhVien.mssv})
                      </p>
                      <span className="text-xs text-slate-500 block">
                        Lớp: {viewingDetail.sinhVien.ten_lop || viewingDetail.sinhVien.lop || '--'}
                        {viewingDetail.sinhVien.sdt && ` • SĐT SV: ${viewingDetail.sinhVien.sdt}`}
                        {viewingDetail.sinhVien.email && ` • ${viewingDetail.sinhVien.email}`}
                      </span>
                    </div>
                  </div>
                )}

                {viewingDetail.giangVien && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Giảng viên dẫn đoàn đề cử</label>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {viewingDetail.giangVien.ho_ten}
                      </p>
                      <span className="text-xs text-slate-500 block">
                        {viewingDetail.giangVien.bo_mon ? `Bộ môn: ${viewingDetail.giangVien.bo_mon}` : ''}
                        {viewingDetail.giangVien.email ? ` • ${viewingDetail.giangVien.email}` : ''}
                      </span>
                    </div>
                  </div>
                )}

                {viewingDetail.ngay_clb_duyet && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thời điểm CLB duyệt sơ bộ</label>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                        {new Date(viewingDetail.ngay_clb_duyet).toLocaleDateString('vi-VN')} {new Date(viewingDetail.ngay_clb_duyet).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trạng thái</label>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">
                      {
                        viewingDetail.trang_thai_duyet ? (
                          viewingDetail.trang_thai_duyet === 'ChoDuyet' ? 'Chờ CLB duyệt' :
                            viewingDetail.trang_thai_duyet === 'ChoKhoaDuyet' ? 'Chờ Khoa duyệt' :
                              viewingDetail.trang_thai_duyet === 'DaDuyet' ? 'Đã duyệt' :
                                viewingDetail.trang_thai_duyet === 'TuChoi' ? 'Đã từ chối' : viewingDetail.trang_thai_duyet
                        ) : (
                          viewingDetail.trang_thai === 'MoDangKy' ? 'Mở đăng ký' :
                            viewingDetail.trang_thai === 'DaChotDanhSach' ? 'Đã chốt danh sách' :
                              viewingDetail.trang_thai === 'DaDienRa' ? 'Đã diễn ra' :
                                viewingDetail.trang_thai === 'DaHuy' ? 'Đã huỷ' : 'Nháp'
                        )
                      }
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
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

      {/* Preview Modal for Assigning Students */}
      {isPreviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E7E0C4] bg-slate-50/50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#407F3E]" />
                  Xét duyệt danh sách tham quan
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Đã chọn: <span className="font-bold text-[#407F3E]">{selectedStudentIds.length}</span> / {previewData.tripCapacity} sinh viên (Sức chứa tối đa)
                </p>
                <div className="w-64 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${selectedStudentIds.length > previewData.tripCapacity ? 'bg-red-500' : 'bg-[#407F3E]'}`}
                    style={{ width: `${Math.min((selectedStudentIds.length / previewData.tripCapacity) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#407F3E]"></span>
                    Danh sách ĐƯỢC CHỌN (Gợi ý bởi hệ thống)
                  </h4>
                  <div className="border border-[#E7E0C4] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-[#E7E0C4]">
                        <tr>
                          <th className="p-3 w-12 text-center">Chọn</th>
                          <th className="p-3">MSSV</th>
                          <th className="p-3">Họ tên</th>
                          <th className="p-3">Khóa</th>
                          <th className="p-3">Ngày ĐK</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E0C4]">
                        {previewData.suggestedAccepted.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E] cursor-pointer"
                                checked={selectedStudentIds.includes(p.sinh_vien_id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudentIds(prev => [...prev, p.sinh_vien_id]);
                                  } else {
                                    setSelectedStudentIds(prev => prev.filter(id => id !== p.sinh_vien_id));
                                  }
                                }}
                              />
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-700">{p.sinhVien?.mssv}</td>
                            <td className="p-3 text-slate-800 font-medium">{p.sinhVien?.ho_ten}</td>
                            <td className="p-3 text-slate-600">{p.sinhVien?.khoaHoc?.ten_khoa_hoc}</td>
                            <td className="p-3 text-slate-500 text-xs">{new Date(p.ngay_dang_ky).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        ))}
                        {previewData.suggestedAccepted.length === 0 && (
                          <tr><td colSpan="5" className="p-4 text-center text-slate-500 italic">Không có ai.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    Danh sách BỊ LOẠI (Gợi ý bởi hệ thống)
                  </h4>
                  <div className="border border-[#E7E0C4] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-[#E7E0C4]">
                        <tr>
                          <th className="p-3 w-12 text-center">Chọn</th>
                          <th className="p-3">MSSV</th>
                          <th className="p-3">Họ tên</th>
                          <th className="p-3">Khóa</th>
                          <th className="p-3">Lý do</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E0C4]">
                        {previewData.suggestedRejected.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E] cursor-pointer"
                                checked={selectedStudentIds.includes(p.sinh_vien_id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudentIds(prev => [...prev, p.sinh_vien_id]);
                                  } else {
                                    setSelectedStudentIds(prev => prev.filter(id => id !== p.sinh_vien_id));
                                  }
                                }}
                              />
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-700">{p.sinhVien?.mssv}</td>
                            <td className="p-3 text-slate-800 font-medium">{p.sinhVien?.ho_ten}</td>
                            <td className="p-3 text-slate-600">{p.sinhVien?.khoaHoc?.ten_khoa_hoc}</td>
                            <td className="p-3 text-red-500 text-xs font-medium">
                              {p.trang_thai === 'BiLoai' ? 'Vi phạm/Không đủ ĐK' : 'Hết chỗ (Thuật toán)'}
                            </td>
                          </tr>
                        ))}
                        {previewData.suggestedRejected.length === 0 && (
                          <tr><td colSpan="5" className="p-4 text-center text-slate-500 italic">Không có ai.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-red-50 border-t border-[#E7E0C4]">
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Hạn chót nộp lệ phí <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full sm:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#407F3E]"
              />
              <p className="text-xs text-slate-500 mt-1">Sau thời gian này, các sinh viên chưa đóng lệ phí sẽ tự động bị hệ thống đánh dấu vi phạm.</p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-[#E7E0C4] flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-500">
                <span className="text-red-500 font-bold">* Lưu ý:</span> Nếu bạn xác nhận, hệ thống sẽ chốt cứng danh sách và xuất hóa đơn lệ phí ngay lập tức.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmAssignStudents}
                  disabled={selectedStudentIds.length > previewData.tripCapacity}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2 ${selectedStudentIds.length > previewData.tripCapacity
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#407F3E] text-white hover:bg-[#407F3E]/90 cursor-pointer'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận chốt danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Trip Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCancelModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                Xác nhận Hủy chuyến tham quan
              </h3>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-5">
                <p className="text-sm text-orange-800 font-medium flex items-start gap-2">
                  Cảnh báo: Hành động này không thể hoàn tác. Tất cả phiếu đăng ký sẽ bị hủy và sinh viên sẽ nhận được thông báo hủy chuyến nội bộ trên hệ thống.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Lý do hủy chuyến <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết để thông báo cho sinh viên (ít nhất 5 ký tự)..."
                  className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-colors resize-none"
                ></textarea>
                <p className="text-xs text-slate-500 mt-2">Lý do này sẽ được gửi trực tiếp đến hộp thư trên app của các sinh viên đã đăng ký.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setCancelReason('');
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmCancelTrip}
                  className="px-6 py-2.5 rounded-xl font-bold bg-[#E68A8C] text-white hover:bg-red-500 transition-colors shadow-sm cursor-pointer"
                >
                  Xác nhận hủy chuyến
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLB Duyệt Sơ Bộ: Modal Chọn Giảng Viên / Gộp Chuyến Tự Do */}
      {!isAdmin && isLecturerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col border border-slate-200 overflow-hidden max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#89B449]/15 border border-[#89B449]/30 flex items-center justify-center text-[#407F3E]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    CLB duyệt sơ bộ & Phân bổ Chuyến tham quan
                  </h2>
                  <p className="text-xs text-slate-500">
                    Thẩm định đề xuất tự do, gộp chuyến thông minh hoặc phân công giảng viên dẫn đoàn
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLecturerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Banner: Gợi ý gộp chuyến nếu có chuyến trùng hợp */}
            {matchingTripsData.length > 0 && (
              <div className="mx-6 mt-3 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shrink-0">
                <span className="text-base leading-none">💡</span>
                <div className="flex-1">
                  <div className="font-bold">
                    Phát hiện có {matchingTripsData.length} chuyến tự do đến cùng nhà máy trong ngày này!
                  </div>
                  <div className="text-amber-800 text-[11px] mt-0.5">
                    Bạn có thể chọn <strong>"Gộp vào chuyến đã có"</strong> để tránh tạo thêm chuyến mới làm loãng danh sách.
                  </div>
                </div>
                {approvalMode !== 'merge_existing' && (
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalMode('merge_existing');
                      if (matchingTripsData.length > 0 && !selectedMergeTripId) {
                        setSelectedMergeTripId(matchingTripsData[0].id);
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    Chuyển sang gộp chuyến
                  </button>
                )}
              </div>
            )}

            {/* Segmented Mode Selector */}
            <div className="px-6 pt-3 shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setApprovalMode('new')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  approvalMode === 'new'
                    ? 'bg-[#89B449] border-[#89B449] text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>⚡ Tạo chuyến mới</span>
                {selectedBatchProposalIds.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px]">
                    +{selectedBatchProposalIds.length} SV
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setApprovalMode('merge_existing');
                  if (matchingTripsData.length > 0 && !selectedMergeTripId) {
                    setSelectedMergeTripId(matchingTripsData[0].id);
                  }
                }}
                disabled={matchingTripsData.length === 0}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  matchingTripsData.length === 0
                    ? 'opacity-40 border-dashed border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50'
                    : approvalMode === 'merge_existing'
                    ? 'bg-[#407F3E] border-[#407F3E] text-white shadow-xs cursor-pointer'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <span>🔗 Gộp vào chuyến tự do đã có</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  approvalMode === 'merge_existing' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {matchingTripsData.length}
                </span>
              </button>
            </div>
            
            {/* Modal Body - 2 Columns */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto min-h-0">
              {/* Cột trái: Tóm tắt thông tin đề xuất & Các đề xuất cùng ngày chờ gom */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
                  <div className="pb-2.5 border-b border-slate-200">
                    <span className="text-slate-500 block text-[11px] mb-0.5">Sinh viên đề xuất</span>
                    <div className="font-bold text-slate-800 text-sm">
                      {pendingApprovalTrip?.sinhVien?.ho_ten || 'Sinh viên'}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {pendingApprovalTrip?.sinhVien?.mssv || '--'} • {pendingApprovalTrip?.sinhVien?.ten_lop || pendingApprovalTrip?.sinhVien?.lop || '--'}
                    </div>
                  </div>

                  <div className="space-y-2 text-slate-700 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Doanh nghiệp / Nhà máy:</span>
                      <span className="font-bold text-slate-800 text-xs">
                        {pendingApprovalTrip?.ten_nha_may_de_xuat || pendingApprovalTrip?.nhaMay?.ten_nha_may || 'Chưa cập nhật'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Hình thức:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold mt-0.5 ${
                          pendingApprovalTrip?.hinh_thuc === 'TrucTiep' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {pendingApprovalTrip?.hinh_thuc === 'TrucTiep' ? 'Trực tiếp (Offline)' : 'Trực tuyến (Online)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Thời gian:</span>
                        <span className="font-semibold text-slate-800 mt-0.5 block">
                          {pendingApprovalTrip?.ngay_tham_quan_de_xuat ? new Date(pendingApprovalTrip.ngay_tham_quan_de_xuat).toLocaleDateString('vi-VN') : '--'}
                          {pendingApprovalTrip?.gio_bat_dau_de_xuat && ` (${String(pendingApprovalTrip.gio_bat_dau_de_xuat).substring(0, 5)})`}
                        </span>
                      </div>
                    </div>

                    {pendingApprovalTrip?.nguoi_lien_he_de_xuat && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Người liên hệ DN:</span>
                        <span className="font-medium text-slate-700">
                          {pendingApprovalTrip?.nguoi_lien_he_de_xuat}
                          {pendingApprovalTrip?.sdt_lien_he_de_xuat && ` - ${pendingApprovalTrip.sdt_lien_he_de_xuat}`}
                        </span>
                      </div>
                    )}

                    {pendingApprovalTrip?.dia_chi_de_xuat && (
                      <div className="pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-500">
                        <span className="text-slate-400 block mb-0.5">Địa chỉ:</span>
                        <span className="line-clamp-2">{pendingApprovalTrip.dia_chi_de_xuat}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Danh sách các đề xuất tự do khác cùng ngày & nhà máy có thể gom duyệt cùng lúc */}
                {otherPendingProposalsData.length > 0 && (
                  <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[#407F3E] text-xs flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Gom thêm đề xuất cùng ngày ({otherPendingProposalsData.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedBatchProposalIds.length === otherPendingProposalsData.length) {
                            setSelectedBatchProposalIds([]);
                          } else {
                            setSelectedBatchProposalIds(otherPendingProposalsData.map(p => p.id));
                          }
                        }}
                        className="text-[11px] text-[#407F3E] hover:underline font-semibold cursor-pointer"
                      >
                        {selectedBatchProposalIds.length === otherPendingProposalsData.length ? 'Bỏ chọn' : 'Chọn tất cả'}
                      </button>
                    </div>

                    <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                      {otherPendingProposalsData.map((p) => {
                        const isChecked = selectedBatchProposalIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedBatchProposalIds(prev => 
                                isChecked ? prev.filter(id => id !== p.id) : [...prev, p.id]
                              );
                            }}
                            className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                              isChecked
                                ? 'bg-white border-[#89B449] shadow-xs'
                                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-slate-800 truncate">
                                {p.ho_ten || 'Sinh viên'}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {p.ma_sinh_vien} • {p.lop || '--'} {p.gio_bat_dau_de_xuat ? `(${p.gio_bat_dau_de_xuat.substring(0, 5)})` : ''}
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-[#89B449] focus:ring-[#89B449] accent-[#89B449] cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Cột phải: Thay đổi theo Mode */}
              {approvalMode === 'merge_existing' ? (
                /* CHẾ ĐỘ 1: Chọn Chuyến Tham Quan Tự Do Đã Có Để Gộp Vào */
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Chọn chuyến tự do muốn gộp vào <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {matchingTripsData.length} chuyến khả dụng
                    </span>
                  </div>

                  <div className="h-[280px] overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    {matchingTripsData.map((t) => {
                      const isSelected = selectedMergeTripId === t.id;
                      const gvText = t.giang_vien_dan_doan?.length > 0
                        ? t.giang_vien_dan_doan.map(g => g.ho_ten).join(', ')
                        : 'Chưa có GV';
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedMergeTripId(t.id)}
                          className={`p-3 rounded-xl cursor-pointer transition-all border text-xs ${
                            isSelected
                              ? 'bg-emerald-50 border-[#407F3E] shadow-xs'
                              : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                                  #{t.id}
                                </span>
                                <span>{t.ten_nha_may}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                                <span>🕒 {t.gio_bat_dau ? String(t.gio_bat_dau).substring(0, 5) : '--'}</span>
                                <span>•</span>
                                <span>👥 Hiện tại: <strong>{t.so_luong_hien_tai}/{t.suc_chua}</strong> SV</span>
                              </div>
                              <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                                <span className="text-slate-400">GV dẫn đoàn:</span>
                                <span className="font-medium text-slate-700 truncate">{gvText}</span>
                              </div>
                            </div>

                            <div className="shrink-0 mt-1">
                              {isSelected ? (
                                <span className="w-5 h-5 rounded-full bg-[#407F3E] text-white flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-slate-300 block" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 italic">
                    ℹ️ Khi gộp, hệ thống sẽ tự động tăng sức chứa của chuyến tham quan và liên kết tất cả sinh viên được chọn vào chuyến này.
                  </p>
                </div>
              ) : (
                /* CHẾ ĐỘ 2: Tạo Chuyến Mới & Chọn Giảng Viên Dẫn Đoàn */
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Giảng viên dẫn đoàn <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {filteredModalLecturers.length}/{lecturers.length} khả dụng
                    </span>
                  </div>

                  {busyModalLecturersCount > 0 && (
                    <div className="mb-2 px-2.5 py-1.5 bg-amber-50 border border-amber-200/80 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>Đã ẩn <strong>{busyModalLecturersCount}</strong> giảng viên do có lịch dẫn đoàn ở chuyến khác cùng ngày.</span>
                    </div>
                  )}

                  {/* Input tìm kiếm nhanh */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc mã giảng viên..."
                      value={lecturerSearchTerm}
                      onChange={(e) => setLecturerSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#89B449] focus:bg-white text-slate-800 transition-colors"
                    />
                  </div>

                  {/* Danh sách giảng viên trực quan cuộn bên trong */}
                  <div className="h-[230px] overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-1.5 bg-slate-50/50">
                    {filteredModalLecturers.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                        Không tìm thấy giảng viên phù hợp
                      </div>
                    ) : (
                      filteredModalLecturers.map((gv) => {
                        const isSelected = String(selectedLecturerId) === String(gv.id);
                        return (
                          <div
                            key={gv.id}
                            onClick={() => setSelectedLecturerId(gv.id)}
                            className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs ${
                              isSelected
                                ? 'bg-emerald-50 border border-[#89B449] text-slate-900 font-medium'
                                : 'bg-white hover:bg-slate-100 border border-slate-200/60 text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-slate-800 truncate">
                                {gv.ho_ten}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono">{gv.ma_gv || gv.magv || gv.ma_giang_vien || '--'}</span>
                                {gv.bo_mon && <span>• {gv.bo_mon}</span>}
                              </div>
                            </div>

                            <div className="shrink-0">
                              {isSelected ? (
                                <span className="w-4 h-4 rounded-full bg-[#89B449] text-white flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="w-4 h-4 rounded-full border border-slate-300 block" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-3 shrink-0">
              <div className="text-xs text-slate-500">
                {approvalMode === 'merge_existing' ? (
                  <span>Đang chọn: <strong>Chuyến #{selectedMergeTripId || '--'}</strong> (Gộp {1 + selectedBatchProposalIds.length} sinh viên)</span>
                ) : (
                  <span>Tạo chuyến mới cho <strong>{1 + selectedBatchProposalIds.length}</strong> sinh viên</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsLecturerModalOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={submitApproveWithLecturer}
                  disabled={approvalMode === 'merge_existing' ? !selectedMergeTripId : !selectedLecturerId}
                  className={`px-6 py-2 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs ${
                    approvalMode === 'merge_existing'
                      ? 'bg-[#407F3E] hover:bg-[#407F3E]/90'
                      : 'bg-[#89B449] hover:bg-[#89B449]/90'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {approvalMode === 'merge_existing'
                    ? 'Xác nhận gộp vào chuyến tham quan đã chọn'
                    : selectedBatchProposalIds.length > 0
                    ? `Xác nhận duyệt gom ${1 + selectedBatchProposalIds.length} đề xuất`
                    : 'Xác nhận duyệt sơ bộ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Khoa Phê Duyệt: Modal Xác Nhận (Read-Only Giảng Viên, Không Cho Chọn GV) */}
      {isAdmin && isKhoaConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#407F3E]/15 border border-[#407F3E]/30 flex items-center justify-center text-[#407F3E]">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Xác nhận phê duyệt chuyến tham quan tự do
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kiểm tra thông tin chuyến tham quan và giảng viên do CLB đề cử
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsKhoaConfirmModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Thông tin sinh viên */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold mb-1">
                  Sinh viên đề xuất
                </span>
                <div className="font-bold text-slate-800 text-sm">
                  {pendingApprovalTrip?.sinhVien?.ho_ten || 'Sinh viên'}
                </div>
                <div className="text-slate-500 font-mono mt-0.5">
                  {pendingApprovalTrip?.sinhVien?.mssv || '--'} • Lớp: {pendingApprovalTrip?.sinhVien?.ten_lop || pendingApprovalTrip?.sinhVien?.lop || '--'}
                </div>
              </div>

              {/* Thông tin doanh nghiệp & chuyến đi */}
              <div className="space-y-2.5 bg-white border border-slate-200 rounded-xl p-3.5">
                <div>
                  <span className="text-slate-400 block text-[11px]">Doanh nghiệp tiếp nhận:</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {pendingApprovalTrip?.ten_nha_may_de_xuat || pendingApprovalTrip?.nhaMay?.ten_nha_may || 'Chưa cập nhật'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Thời gian tham quan:</span>
                    <span className="font-semibold text-slate-700">
                      {pendingApprovalTrip?.ngay_tham_quan_de_xuat ? new Date(pendingApprovalTrip.ngay_tham_quan_de_xuat).toLocaleDateString('vi-VN') : '--'}
                      {pendingApprovalTrip?.gio_bat_dau_de_xuat && ` (${String(pendingApprovalTrip.gio_bat_dau_de_xuat).substring(0, 5)})`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hình thức:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold mt-0.5 ${
                      pendingApprovalTrip?.hinh_thuc === 'TrucTiep' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {pendingApprovalTrip?.hinh_thuc === 'TrucTiep' ? 'Trực tiếp (Offline)' : 'Trực tuyến (Online)'}
                    </span>
                  </div>
                </div>

                {pendingApprovalTrip?.dia_chi_de_xuat && (
                  <div className="pt-1 text-slate-500">
                    <span className="text-slate-400 block text-[11px]">Địa chỉ:</span>
                    <span className="line-clamp-2">{pendingApprovalTrip.dia_chi_de_xuat}</span>
                  </div>
                )}
              </div>

              {/* Thông tin Giảng viên dẫn đoàn (READ-ONLY) */}
              <div className="rounded-xl p-3.5 border border-[#407F3E]/30 bg-emerald-50/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[#407F3E] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Giảng viên dẫn đoàn (CLB đã phân công)
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Chỉ xem
                  </span>
                </div>

                {pendingApprovalTrip?.giangVien ? (
                  <div className="mt-1">
                    <div className="font-bold text-slate-900 text-sm">
                      {pendingApprovalTrip.giangVien.ho_ten}
                    </div>
                    <div className="text-slate-600 flex items-center gap-2 mt-0.5 text-xs">
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {pendingApprovalTrip.giangVien.ma_gv || pendingApprovalTrip.giangVien.magv || '--'}
                      </span>
                      {pendingApprovalTrip.giangVien.bo_mon && (
                        <span>Bộ môn: {pendingApprovalTrip.giangVien.bo_mon}</span>
                      )}
                    </div>
                    {pendingApprovalTrip.giangVien.email && (
                      <div className="text-slate-500 mt-1">
                        Email: {pendingApprovalTrip.giangVien.email}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                    <span className="font-bold">Lưu ý:</span> Đề xuất này chưa có giảng viên dẫn đoàn được phân công từ trước. Hệ thống sẽ tự động gán giảng viên phụ trách khi bạn xác nhận phê duyệt.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end items-center gap-3 shrink-0">
              <button
                onClick={() => setIsKhoaConfirmModalOpen(false)}
                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={submitKhoaApprove}
                className="px-6 py-2 text-sm font-bold text-white bg-[#407F3E] hover:bg-[#407F3E]/90 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
