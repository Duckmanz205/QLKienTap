import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, ChevronDown, Check, X, Send, MoreVertical, Edit, Trash2, Search, Lock, Calendar, AlertTriangle
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import { getValidSession } from '../../utils/auth';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function LichKienTap_Khoa() {
  const session = getValidSession();
  const userRole = session?.user?.vai_tro;
  const isKhoa = userRole === 'QuanLyKhoa' || userRole === 'QuanTriVienHeThong';
  const isCLB = userRole === 'QuanLyCLB';

  const [schedules, setSchedules] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [factories, setFactories] = useState([]);
  const [taiKhoanConfigs, setTaiKhoanConfigs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownConfig, setDropdownConfig] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState(null);
  const [promptValue, setPromptValue] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const showConfirm = (title, message, onConfirm, type = 'confirm') => {
    setPromptValue('');
    setConfirmConfig({ title, message, onConfirm, type });
  };

  useEffect(() => {
    if (!openDropdownId) return;

    const handleScroll = () => {
      setOpenDropdownId(null);
      setDropdownConfig(null);
    };

    const handleClickOutside = () => {
      setOpenDropdownId(null);
      setDropdownConfig(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
        setDropdownConfig(null);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdownId]);

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (message, type = 'error') => {
    setToastMessage({ type, text: message });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatDateForInput = (d) => {
    if (!d) return '';
    if (typeof d === 'string') {
      const match = d.match(/^\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
    }
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  // Modal Create States
  const [createForm, setCreateForm] = useState({
    ten_lich: '',
    dot_kien_tap_id: '',
    so_luong_du_kien: '',
    tg_mo_dang_ky_tu: '',
    tg_mo_dang_ky_den: '',
    tai_khoan_thu_huong_id: '',
  });  // Trip Table States for Modal
  const [tripPage, setTripPage] = useState(1);
  const [tripPageSize, setTripPageSize] = useState(15);
  const [tripFilterNhaMay, setTripFilterNhaMay] = useState('');
  const [tripFilterHinhThuc, setTripFilterHinhThuc] = useState('');
  const [tripSearchTerm, setTripSearchTerm] = useState('');
  const [viewingTripDetail, setViewingTripDetail] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);

  // Filter States
  const [filterDot, setFilterDot] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchScheduleTerm, setSearchScheduleTerm] = useState('');

  const STATUS_FILTER_OPTIONS = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'Nhap', label: 'Nháp' },
    { value: 'ChoDuyet', label: 'Lịch gửi duyệt' },
    { value: 'DaDuyet', label: 'Đã duyệt' },
    { value: 'TuChoi', label: 'Từ chối' },
    { value: 'MoDangKy', label: 'Mở đăng ký' },
    { value: 'DangTrienKhai', label: 'Đang diễn ra' },
    { value: 'DaKetThuc', label: 'Đã kết thúc' },
    { value: 'DaKhoa', label: 'Đã khóa' },
    { value: 'DaHuy', label: 'Đã hủy' },
  ];

  const [unassignedTrips, setUnassignedTrips] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [selectedTripIds, setSelectedTripIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schResult, campResult, tripResult, factoryResult, tkResult] = await Promise.allSettled([
        khoaApi.getSchedules({ excludeInactive: false }),
        khoaApi.getCampaigns(),
        khoaApi.getTrips(),
        khoaApi.getFactories(),
        khoaApi.getTaiKhoanThuHuong()
      ]);

      if (schResult.status === 'fulfilled') {
        const schRes = schResult.value;
        setSchedules(schRes.data?.data || schRes.data || []);
      } else {
        console.error('Lỗi tải danh sách lịch kiến tập:', schResult.reason);
      }

      if (campResult.status === 'fulfilled') {
        const campRes = campResult.value;
        setCampaigns(campRes.data?.data || campRes.data || []);
      } else {
        console.error('Lỗi tải danh sách đợt kiến tập:', campResult.reason);
      }

      if (factoryResult.status === 'fulfilled') {
        const factoryRes = factoryResult.value;
        setFactories(factoryRes.data?.data || factoryRes.data || []);
      } else {
        console.error('Lỗi tải danh sách nhà máy:', factoryResult.reason);
      }

      if (tkResult.status === 'fulfilled') {
        const tkRes = tkResult.value;
        setTaiKhoanConfigs(tkRes.data?.data || tkRes.data || []);
      } else {
        console.error('Lỗi tải cấu hình tài khoản thụ hưởng:', tkResult.reason);
      }

      if (tripResult.status === 'fulfilled') {
        const tripRes = tripResult.value;
        const allTripsData = tripRes.data?.data || tripRes.data || [];
        setAllTrips(allTripsData);
        setUnassignedTrips(allTripsData.filter(t => t.trang_thai === 'Nhap' && !t.lich_kien_tap_id));
      } else {
        console.error('Lỗi tải danh sách chuyến kiến tập:', tripResult.reason);
      }
    } catch (err) {
      console.error('Lỗi hệ thống khi tải dữ liệu trang:', err);
    }
  };

  const handleViewDetail = async (schedule) => {
    const rawSchedule = schedules.find(s => s.id === schedule.id) || schedule;
    setViewingDetail(rawSchedule);
  };



  const handleApprove = (id) => {
    showConfirm('Xác nhận duyệt', 'Bạn có chắc chắn muốn duyệt lịch này?', async () => {
      try {
        await khoaApi.approveSchedule(id);
        showToast("Đã duyệt lịch kiến tập thành công", "success");
        fetchData();
      } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || "Lỗi khi duyệt lịch", "error");
      }
    });
  };

  const handleRejectPrompt = (id) => {
    showConfirm('Từ chối duyệt', 'Nhập lý do từ chối:', async (reason) => {
      try {
        await khoaApi.rejectSchedule(id, reason);
        showToast("Đã từ chối lịch kiến tập thành công", "success");
        fetchData();
      } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || "Lỗi khi từ chối lịch", "error");
      }
    }, 'prompt');
  };

  const handleSubmitApproval = (id) => {
    showConfirm('Gửi duyệt lịch', 'Bạn có chắc chắn muốn gửi duyệt lịch này? Sau khi gửi duyệt, bạn sẽ không thể chỉnh sửa cho đến khi có kết quả.', async () => {
      try {
        await khoaApi.submitSchedule(id);
        showToast("Đã gửi duyệt lịch kiến tập", "success");
        fetchData();
      } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || "Lỗi khi gửi duyệt lịch", "error");
      }
    });
  };



  const handleEditSchedule = (s) => {
    setEditingId(s.id);
    setCreateForm({
      ten_lich: s.ten_lich,
      dot_kien_tap_id: s.dot_kien_tap_id,
      so_luong_du_kien: s.so_luong_du_kien || '',
      tg_mo_dang_ky_tu: s.tg_mo_dang_ky_tu ? new Date(new Date(s.tg_mo_dang_ky_tu).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10) : '',
      tai_khoan_thu_huong_id: s.tai_khoan_thu_huong_id || '',
      tg_mo_dang_ky_den: s.tg_mo_dang_ky_den ? new Date(new Date(s.tg_mo_dang_ky_den).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10) : '',
    });

    // Set checked state for trips already assigned to this schedule
    const assignedTripIds = allTrips.filter(t => t.lich_kien_tap_id === s.id).map(t => t.id);
    setSelectedTripIds(assignedTripIds);
    setOpenDropdownId(null);
    setDropdownConfig(null);
    setIsModalOpen(true);
  };

  const handleDeleteSchedule = (id) => {
    showConfirm('Xóa lịch kiến tập', 'Bạn có chắc chắn muốn xóa lịch kiến tập này không?', async () => {
      try {
        await khoaApi.deleteSchedule(id);
        showToast('Xóa lịch kiến tập thành công', 'success');
        await fetchData();
      } catch (err) {
        console.error(err);
        showToast('Có lỗi khi xóa lịch kiến tập: ' + (err.response?.data?.message || err.message), 'error');
      }
      setOpenDropdownId(null);
      setDropdownConfig(null);
    }, 'danger');
  };

  const handleFinalSubmit = async () => {
    if (!createForm.ten_lich || !createForm.dot_kien_tap_id || !createForm.tg_mo_dang_ky_tu || !createForm.tg_mo_dang_ky_den || !createForm.so_luong_du_kien || !createForm.tai_khoan_thu_huong_id) {
      showToast('Vui lòng điền đầy đủ các thông tin lịch (có dấu *)', 'error');
      return;
    }

    const selectedDot = campaigns.find(c => Number(c.id) === Number(createForm.dot_kien_tap_id));
    if (!selectedDot) {
      showToast('Không tìm thấy đợt kiến tập đã chọn', 'error');
      return;
    }

    const dotMin = formatDateForInput(selectedDot.ngay_bat_dau);
    const dotMax = formatDateForInput(selectedDot.ngay_ket_thuc);

    if (createForm.tg_mo_dang_ky_tu < dotMin) {
      const dotStartStr = selectedDot.ngay_bat_dau ? new Date(selectedDot.ngay_bat_dau).toLocaleDateString('vi-VN') : dotMin;
      showToast(`Thời gian Mở đăng ký (từ) không được sớm hơn ngày bắt đầu của đợt kiến tập (${dotStartStr})`, 'error');
      return;
    }

    if (createForm.tg_mo_dang_ky_den > dotMax) {
      const dotEndStr = selectedDot.ngay_ket_thuc ? new Date(selectedDot.ngay_ket_thuc).toLocaleDateString('vi-VN') : dotMax;
      showToast(`Thời gian Mở đăng ký (đến) không được muộn hơn ngày kết thúc của đợt kiến tập (${dotEndStr})`, 'error');
      return;
    }

    const tuString = createForm.tg_mo_dang_ky_tu + 'T00:00:00';
    const denString = createForm.tg_mo_dang_ky_den + 'T23:59:59';
    const t1 = new Date(tuString);
    const t2 = new Date(denString);

    if (t1 > t2 || createForm.tg_mo_dang_ky_tu > createForm.tg_mo_dang_ky_den) {
      showToast('Thời gian Mở đăng ký (từ) không được sau Mở đăng ký (đến)', 'error');
      return;
    }

    // Kiểm tra thời gian đăng ký phải kết thúc TRƯỚC ngày tổ chức của tất cả các chuyến tham quan trong lịch
    if (selectedTripIds && selectedTripIds.length > 0) {
      for (const tripId of selectedTripIds) {
        const trip = allTrips.find(t => t.id === tripId);
        if (trip && trip.ngay_tham_quan) {
          const tripDateStr = formatDateForInput(trip.ngay_tham_quan);
          if (tripDateStr && tripDateStr <= createForm.tg_mo_dang_ky_den) {
            const tripStr = new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN');
            const denStr = new Date(createForm.tg_mo_dang_ky_den).toLocaleDateString('vi-VN');
            showToast(
              `Thời gian kết thúc mở đăng ký (${denStr}) không được sau hoặc bằng ngày tổ chức chuyến tham quan (${tripStr} tại "${trip.nhaMay?.ten_nha_may || 'nhà máy'}"). Chuyến tham quan phải diễn ra sau khi kết thúc đăng ký.`,
              'error'
            );
            return;
          }
        }
      }
    }

    setIsCreating(true);
    try {
      const payload = {
        ...createForm,
        dot_kien_tap_id: Number(createForm.dot_kien_tap_id),
        so_luong_du_kien: Number(createForm.so_luong_du_kien),
        tai_khoan_thu_huong_id: Number(createForm.tai_khoan_thu_huong_id),
        tg_mo_dang_ky_tu: tuString,
        tg_mo_dang_ky_den: denString,
      };

      payload.chuyen_tham_quan_ids = selectedTripIds;

      // Convert empty date strings to undefined to prevent invalid date errors
      if (!payload.tg_mo_dang_ky_tu) delete payload.tg_mo_dang_ky_tu;
      if (!payload.tg_mo_dang_ky_den) delete payload.tg_mo_dang_ky_den;

      if (editingId) {
        await khoaApi.updateSchedule(editingId, payload);
        showToast('Cập nhật lịch kiến tập thành công.', 'success');
      } else {
        await khoaApi.createSchedule(payload);
        showToast('Tạo lịch kiến tập thành công.', 'success');
      }

      setIsModalOpen(false);
      setEditingId(null);
      setSelectedTripIds([]);
      setCreateForm({
        ten_lich: '',
        dot_kien_tap_id: '',
        so_luong_du_kien: '',
        tg_mo_dang_ky_tu: '',
        tg_mo_dang_ky_den: '',
        tai_khoan_thu_huong_id: ''
      });
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(`Có lỗi khi ${editingId ? 'cập nhật' : 'tạo'} lịch kiến tập: ` + (err.response?.data?.message || err.message || 'Lỗi hệ thống'), 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDropdownClick = (e, scheduleId) => {
    e.stopPropagation();
    if (openDropdownId === scheduleId) {
      setDropdownConfig(null);
      setOpenDropdownId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();

    // Check if there's enough space below
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = 130; // Approx height for 3 items
    const isTopAligned = spaceBelow < menuHeight && rect.top > menuHeight;

    setDropdownConfig({
      id: scheduleId,
      top: isTopAligned ? rect.top - menuHeight : rect.bottom + 4,
      left: rect.right - 160,
    });
    setOpenDropdownId(scheduleId);
  };

  const renderDropdownPortal = () => {
    if (!dropdownConfig) return null;
    const s = schedules.find(item => item.id === dropdownConfig.id);
    if (!s) return null;

    return createPortal(
      <div
        className="fixed bg-white border border-slate-200 rounded-xl shadow-lg z-[100] overflow-hidden animate-in fade-in zoom-in-95"
        style={{
          top: dropdownConfig.top,
          left: dropdownConfig.left,
          width: '160px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleEditSchedule(s); }}
            className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Cập nhật
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(s.id); }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Xóa
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setDropdownConfig(null); handleSubmitApproval(s.id); }}
            className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-t border-slate-100"
          >
            <Send className="w-4 h-4" /> Gửi duyệt
          </button>
        </div>
      </div>,
      document.body
    );
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Nháp':
      case 'Nhap':
        return <span className="inline-flex whitespace-nowrap items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Nháp</span>;
      case 'Chờ duyệt':
      case 'ChoDuyet':
        return <span className="inline-flex whitespace-nowrap items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C]/20 text-[#E68A8C] border border-[#E68A8C]/30 shadow-sm">Chờ duyệt</span>;
      case 'Đã duyệt':
      case 'DaDuyet':
        return <span className="inline-flex whitespace-nowrap items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#407F3E]/20 text-[#407F3E] border border-[#407F3E]/30 shadow-sm">Đã duyệt</span>;
      case 'Từ chối':
      case 'TuChoi':
        return <span className="inline-flex whitespace-nowrap items-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-600 border border-red-200 shadow-sm">Từ chối</span>;
      case 'Mở đăng ký':
      case 'MoDangKy':
        return <span className="inline-flex whitespace-nowrap items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white border border-[#89B449]/20 shadow-sm">Mở đăng ký</span>;
      case 'Đang diễn ra':
      case 'DangDienRa':
        return <span className="inline-flex whitespace-nowrap items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#407F3E] text-white border border-[#407F3E]/20 shadow-sm">Đang diễn ra</span>;
      case 'Đã kết thúc':
      case 'DaKetThuc':
        return <span className="inline-flex whitespace-nowrap items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 border border-[#DBD468]/20 shadow-sm">Đã kết thúc</span>;
      case 'Đã khóa':
      case 'DaKhoa':
        return (
          <span className="inline-flex whitespace-nowrap items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#266528] text-white border border-[#266528]/30 shadow-sm">
            <Lock className="w-3 h-3 mr-1 shrink-0" />
            Đã khóa
          </span>
        );
      case 'Đã hủy':
      case 'DaHuy':
        return <span className="inline-flex whitespace-nowrap items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">Đã hủy</span>;
      default:
        return <span className="inline-flex whitespace-nowrap items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  const filteredSchedules = schedules.filter(s => {
    if (filterDot && s.dot_kien_tap_id !== filterDot) return false;
    if (filterStatus && s.trang_thai !== filterStatus) return false;
    if (searchScheduleTerm && !s.ten_lich?.toLowerCase().includes(searchScheduleTerm.toLowerCase())) return false;
    return true;
  });

  const displayData = filteredSchedules.map((s) => {
    return {
      id: s.id,
      ten_lich: s.ten_lich,
      dot_kien_tap: s.dotKienTap?.ten_dot || `Đợt ${s.dot_kien_tap_id}`,
      tg_mo_dang_ky: s.tg_mo_dang_ky_tu && s.tg_mo_dang_ky_den ? `${new Date(s.tg_mo_dang_ky_tu).toLocaleDateString('vi-VN')} - ${new Date(s.tg_mo_dang_ky_den).toLocaleDateString('vi-VN')}` : 'Chưa thiết lập',
      so_luong_du_kien: s.so_luong_du_kien || 0,
      trang_thai: s.trang_thai || 'ChuaXacDinh',
      ly_do_tu_choi: s.ly_do_tu_choi
    };
  });

  // Pagination logic
  const totalPages = Math.ceil(displayData.length / itemsPerPage) || 1;
  const paginatedData = displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDot, filterStatus]);

  // Trip Table Logic
  const availableTripsForModal = allTrips.filter(t =>
    t.trang_thai === 'Nhap' &&
    (!t.lich_kien_tap_id || t.lich_kien_tap_id === editingId)
  );

  const filteredTrips = availableTripsForModal.filter(t => {
    const matchNhaMay = !tripFilterNhaMay || t.nhaMay?.ten_nha_may?.toLowerCase().includes(tripFilterNhaMay.toLowerCase());
    const matchHinhThuc = !tripFilterHinhThuc || t.hinh_thuc === tripFilterHinhThuc;
    const searchString = tripSearchTerm.toLowerCase();
    const matchSearch = !tripSearchTerm ||
      t.nhaMay?.ten_nha_may?.toLowerCase().includes(searchString) ||
      t.dia_diem_tap_trung?.toLowerCase().includes(searchString) ||
      (t.giaoVienDanDoan && t.giaoVienDanDoan.some(gv => gv.giangVien?.ho_ten?.toLowerCase().includes(searchString)));
    return matchNhaMay && matchHinhThuc && matchSearch;
  });

  const tripTotalPages = Math.ceil(filteredTrips.length / tripPageSize) || 1;
  const paginatedTrips = filteredTrips.slice((tripPage - 1) * tripPageSize, tripPage * tripPageSize);

  useEffect(() => {
    setTripPage(1);
  }, [tripFilterNhaMay, tripFilterHinhThuc, tripSearchTerm, tripPageSize]);

  const handleToggleTrip = (id) => {
    const trip = allTrips.find(t => t.id === id);
    if (!trip) return;
    if (!selectedTripIds.includes(id)) {
      if (!trip.giaoVienDanDoan || trip.giaoVienDanDoan.length === 0) {
        showToast("Chuyến tham quan này chưa có giảng viên dẫn đoàn. Vui lòng sang tab Phân công GV dẫn đoàn để phân công trước khi chọn.", "error");
        return;
      }
      if (createForm.tg_mo_dang_ky_den) {
        const tripDateStr = formatDateForInput(trip.ngay_tham_quan);
        if (tripDateStr && tripDateStr <= createForm.tg_mo_dang_ky_den) {
          const tripStr = trip.ngay_tham_quan ? new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN') : tripDateStr;
          const denStr = new Date(createForm.tg_mo_dang_ky_den).toLocaleDateString('vi-VN');
          showToast(`Không thể chọn chuyến tham quan tại "${trip.nhaMay?.ten_nha_may || 'nhà máy'}" vì ngày tổ chức (${tripStr}) diễn ra trước hoặc trong thời gian mở đăng ký (đến ${denStr}).`, "error");
          return;
        }
      }
    }
    setSelectedTripIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleToggleAllTrips = () => {
    if (selectedTripIds.length === filteredTrips.length && filteredTrips.length > 0) {
      setSelectedTripIds([]); // uncheck all
    } else {
      let skippedGvCount = 0;
      let skippedDateCount = 0;
      const validTrips = filteredTrips.filter(t => {
        if (!t.giaoVienDanDoan || t.giaoVienDanDoan.length === 0) {
          skippedGvCount++;
          return false;
        }
        if (createForm.tg_mo_dang_ky_den) {
          const tripDateStr = formatDateForInput(t.ngay_tham_quan);
          if (tripDateStr && tripDateStr <= createForm.tg_mo_dang_ky_den) {
            skippedDateCount++;
            return false;
          }
        }
        if (dotMinDate) {
          const tripDateStr = formatDateForInput(t.ngay_tham_quan);
          if (tripDateStr && tripDateStr < dotMinDate) {
            skippedDateCount++;
            return false;
          }
        }
        return true;
      });

      if (skippedGvCount > 0) {
        showToast(`Có ${skippedGvCount} chuyến chưa có giảng viên dẫn đoàn bị bỏ qua.`, "error");
      }
      if (skippedDateCount > 0) {
        showToast(`Có ${skippedDateCount} chuyến có ngày tổ chức trước hoặc trong thời gian mở đăng ký bị bỏ qua.`, "error");
      }
      setSelectedTripIds(validTrips.map(t => t.id));
    }
  };

  const selectedModalCampaign = campaigns.find(c => Number(c.id) === Number(createForm.dot_kien_tap_id));
  const dotMinDate = formatDateForInput(selectedModalCampaign?.ngay_bat_dau);
  const dotMaxDate = formatDateForInput(selectedModalCampaign?.ngay_ket_thuc);

  // Tính ngày chuyến đi sớm nhất trong các chuyến đã chọn để chặn hạn đăng ký
  const selectedTripsData = allTrips.filter(t => selectedTripIds.includes(t.id));
  const earliestTripDate = selectedTripsData.reduce((earliest, t) => {
    if (!t.ngay_tham_quan) return earliest;
    const dStr = formatDateForInput(t.ngay_tham_quan);
    if (dotMinDate && dStr < dotMinDate) return earliest;
    return !earliest || dStr < earliest ? dStr : earliest;
  }, '');

  // Tính tổng sức chứa của các chuyến tham quan đang được chọn
  const totalCapacity = selectedTripsData.reduce((sum, t) => sum + (Number(t.suc_chua) || 0), 0);
  const isCapacityShortage = Boolean(
    createForm.so_luong_du_kien &&
    Number(createForm.so_luong_du_kien) > 0 &&
    totalCapacity < Number(createForm.so_luong_du_kien)
  );

  const dayBeforeEarliestTrip = earliestTripDate
    ? new Date(new Date(earliestTripDate).getTime() - 86400000).toISOString().slice(0, 10)
    : '';

  const effectiveMaxRegistrationDate = dayBeforeEarliestTrip
    ? (dotMaxDate && dotMaxDate < dayBeforeEarliestTrip ? dotMaxDate : dayBeforeEarliestTrip)
    : dotMaxDate;

  const isDenAfterTrips = Boolean(
    createForm.tg_mo_dang_ky_den &&
    earliestTripDate &&
    createForm.tg_mo_dang_ky_den >= earliestTripDate
  );

  const isTuOutOfRange = Boolean(createForm.tg_mo_dang_ky_tu && (
    (dotMinDate && createForm.tg_mo_dang_ky_tu < dotMinDate) ||
    (dotMaxDate && createForm.tg_mo_dang_ky_tu > dotMaxDate)
  ));
  const isDenOutOfRange = Boolean(createForm.tg_mo_dang_ky_den && (
    (dotMinDate && createForm.tg_mo_dang_ky_den < dotMinDate) ||
    (dotMaxDate && createForm.tg_mo_dang_ky_den > dotMaxDate) ||
    isDenAfterTrips
  ));
  const isDatesOutOfRange = isTuOutOfRange || isDenOutOfRange;

  const handleSelectCampaignInModal = (c) => {
    setCreateForm({ ...createForm, dot_kien_tap_id: c.id });

    const cMin = formatDateForInput(c.ngay_bat_dau);
    const cMax = formatDateForInput(c.ngay_ket_thuc);

    const isOutOfRange =
      Boolean(createForm.tg_mo_dang_ky_tu && (createForm.tg_mo_dang_ky_tu < cMin || createForm.tg_mo_dang_ky_tu > cMax)) ||
      Boolean(createForm.tg_mo_dang_ky_den && (createForm.tg_mo_dang_ky_den < cMin || createForm.tg_mo_dang_ky_den > cMax));

    if (isOutOfRange) {
      const startStr = c.ngay_bat_dau ? new Date(c.ngay_bat_dau).toLocaleDateString('vi-VN') : '';
      const endStr = c.ngay_ket_thuc ? new Date(c.ngay_ket_thuc).toLocaleDateString('vi-VN') : '';
      showToast(
        `Lưu ý: Thời gian đăng ký đã chọn đang nằm ngoài đợt kiến tập mới "${c.ten_dot}" (${startStr} - ${endStr}). Vui lòng kiểm tra và điều chỉnh lại.`,
        'error'
      );
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Lịch kiến tập</h1>
        {isCLB && (
          <button
            onClick={() => {
              setEditingId(null);
              setSelectedTripIds([]);
              setCreateForm({
                ten_lich: '', dot_kien_tap_id: '', so_luong_du_kien: '',
                tg_mo_dang_ky_tu: '', tg_mo_dang_ky_den: ''
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo lịch kiến tập
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-col md:flex-row gap-4 items-center relative z-20">
        {/* Đợt Dropdown */}
        <SearchableDropdown
          options={[
            { value: '', label: 'Tất cả đợt' },
            ...campaigns.map(c => ({ value: c.id, label: c.ten_dot }))
          ]}
          value={filterDot}
          onChange={(val) => {
            setFilterDot(val);
            setCurrentPage(1);
          }}
          placeholder="Tất cả đợt"
          searchPlaceholder="Tìm kiếm đợt..."
          className="w-full md:w-1/4 min-w-[220px]"
        />

        {/* Trạng thái Dropdown */}
        <SearchableDropdown
          options={STATUS_FILTER_OPTIONS}
          value={filterStatus}
          onChange={(val) => {
            setFilterStatus(val);
            setCurrentPage(1);
          }}
          placeholder="Tất cả trạng thái"
          searchPlaceholder="Tìm trạng thái..."
          className="w-full md:w-1/4 min-w-[220px]"
        />

        {/* Search by schedule name */}
        <div className="relative w-full md:w-2/4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm tên lịch kiến tập..."
            value={searchScheduleTerm}
            onChange={(e) => {
              setSearchScheduleTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">Tên lịch</th>
                <th className="p-4">Đợt kiến tập</th>
                <th className="p-4">Thời gian mở đăng ký</th>
                <th className="p-4 text-center">Số lượng SV</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">Không có lịch kiến tập nào.</td>
                </tr>
              ) : (
                paginatedData.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(s)}
                  >
                    <td className="p-4 pl-6 font-bold text-slate-800">{s.ten_lich}</td>
                    <td className="p-4 font-bold text-slate-600">{s.dot_kien_tap}</td>
                    <td className="p-4 text-xs font-medium text-slate-600">{s.tg_mo_dang_ky}</td>
                    <td className="p-4 text-center font-bold text-slate-700">{s.so_luong_du_kien}</td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-center gap-1">
                        {getStatusBadge(s.trang_thai)}
                        {s.trang_thai === 'TuChoi' && s.ly_do_tu_choi && (
                          <span className="text-[10px] text-red-500 font-medium">Lý do: {s.ly_do_tu_choi}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 relative">
                        {isCLB && s.trang_thai === 'Nhap' && (
                          <button
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            onClick={(e) => handleDropdownClick(e, s.id)}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        )}

                        {isKhoa && s.trang_thai === 'ChoDuyet' && (
                          <>
                            <button
                              className="p-1.5 text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer"
                              title="Duyệt lịch"
                              onClick={() => handleApprove(s.id)}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Từ chối"
                              onClick={(e) => { e.stopPropagation(); handleRejectPrompt(s.id); }}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <SearchableDropdown
              value={itemsPerPage}
              onChange={(val) => {
                setItemsPerPage(Number(val));
                setCurrentPage(1);
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
            <span>/ {displayData.length} lịch kiến tập</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Wizard Modal Create */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40  animate-in fade-in duration-200"
            onClick={() => { setIsModalOpen(false); setEditingId(null); setSelectedTripIds([]); }}
          ></div>

          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Cập nhật lịch kiến tập' : 'Tạo lịch kiến tập mới'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); setSelectedTripIds([]); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Tên lịch <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={createForm.ten_lich}
                      onChange={e => setCreateForm({ ...createForm, ten_lich: e.target.value })}
                      className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]"
                      placeholder="Nhập tên lịch kiến tập"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Đợt kiến tập <span className="text-red-500">*</span></label>
                    <SearchableDropdown
                      options={campaigns
                        .filter(c => {
                          const isCurrentEditing = editingId && Number(createForm.dot_kien_tap_id) === c.id;
                          return (c.trang_thai === 'DangTrienKhai' || isCurrentEditing) && c.trang_thai !== 'Nhap';
                        })
                        .map(c => ({ value: c.id, label: c.ten_dot }))
                      }
                      value={createForm.dot_kien_tap_id}
                      onChange={(val) => {
                        const c = campaigns.find(item => item.id === Number(val));
                        if (c) handleSelectCampaignInModal(c);
                      }}
                      placeholder="Chọn đợt kiến tập"
                      searchPlaceholder="Tìm kiếm đợt..."
                    />
                    {selectedModalCampaign && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#407F3E] bg-[#407F3E]/10 border border-[#407F3E]/20 px-3 py-2 rounded-xl">
                        <Calendar className="w-4 h-4 shrink-0 text-[#407F3E]" />
                        <span>
                          Thời gian diễn ra đợt kiến tập: <strong>{new Date(selectedModalCampaign.ngay_bat_dau).toLocaleDateString('vi-VN')}</strong> đến <strong>{new Date(selectedModalCampaign.ngay_ket_thuc).toLocaleDateString('vi-VN')}</strong> (Thời gian mở đăng ký phải nằm trong khoảng này)
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Mở đăng ký (từ) <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      disabled={!createForm.dot_kien_tap_id}
                      min={dotMinDate || undefined}
                      max={createForm.tg_mo_dang_ky_den || dotMaxDate || undefined}
                      value={createForm.tg_mo_dang_ky_tu}
                      onChange={e => setCreateForm({ ...createForm, tg_mo_dang_ky_tu: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#407F3E] disabled:bg-slate-100 disabled:cursor-not-allowed ${isTuOutOfRange ? 'border-amber-400 bg-amber-50/40 text-amber-900 font-medium' : 'border-[#E7E0C4]'
                        }`}
                    />
                    {!createForm.dot_kien_tap_id && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">Vui lòng chọn đợt kiến tập trước</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Mở đăng ký (đến) <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      disabled={!createForm.dot_kien_tap_id}
                      min={createForm.tg_mo_dang_ky_tu || dotMinDate || undefined}
                      max={effectiveMaxRegistrationDate || undefined}
                      value={createForm.tg_mo_dang_ky_den}
                      onChange={e => setCreateForm({ ...createForm, tg_mo_dang_ky_den: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#407F3E] disabled:bg-slate-100 disabled:cursor-not-allowed ${isDenOutOfRange ? 'border-amber-400 bg-amber-50/40 text-amber-900 font-medium' : 'border-[#E7E0C4]'
                        }`}
                    />
                    {!createForm.dot_kien_tap_id && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">Vui lòng chọn đợt kiến tập trước</p>
                    )}
                    {earliestTripDate && (
                      <p className="text-[11px] text-[#407F3E] mt-1 font-medium">
                        Hạn đăng ký tối đa: <strong>{new Date(effectiveMaxRegistrationDate).toLocaleDateString('vi-VN')}</strong> (trước chuyến đi sớm nhất ngày {new Date(earliestTripDate).toLocaleDateString('vi-VN')})
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      * Có thể chọn trùng ngày với ngày mở đăng ký (hệ thống sẽ mở từ 00:00:00 đến 23:59:59 của ngày đó).
                    </p>
                  </div>

                  {isDenAfterTrips ? (
                    <div className="col-span-2 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-300 px-3.5 py-2.5 rounded-xl">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>
                        Thời gian mở đăng ký (đến) không được sau hoặc bằng ngày tổ chức chuyến tham quan trong lịch (chuyến sớm nhất diễn ra ngày {new Date(earliestTripDate).toLocaleDateString('vi-VN')}). Vui lòng điều chỉnh lại.
                      </span>
                    </div>
                  ) : isDatesOutOfRange && selectedModalCampaign ? (
                    <div className="col-span-2 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-300 px-3.5 py-2.5 rounded-xl">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>
                        Thời gian đăng ký hiện tại đang nằm ngoài thời gian diễn ra của đợt kiến tập ({new Date(selectedModalCampaign.ngay_bat_dau).toLocaleDateString('vi-VN')} - {new Date(selectedModalCampaign.ngay_ket_thuc).toLocaleDateString('vi-VN')}). Vui lòng điều chỉnh lại trước khi lưu.
                      </span>
                    </div>
                  ) : null}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Số lượng sinh viên dự kiến <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Nhập số lượng SV..."
                      value={createForm.so_luong_du_kien}
                      onChange={e => setCreateForm({ ...createForm, so_luong_du_kien: e.target.value })}
                      className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Tổng sức chứa các chuyến đã chọn
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={`${totalCapacity} chỗ (${selectedTripIds.length} chuyến đã chọn)`}
                      className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm bg-slate-50 text-slate-800 font-bold cursor-not-allowed"
                    />
                  </div>

                  {isCapacityShortage && (
                    <div className="col-span-2 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-300 px-3.5 py-2.5 rounded-xl">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>
                        <strong>Lưu ý:</strong> Tổng sức chứa các chuyến tham quan đã chọn (<strong>{totalCapacity}</strong> chỗ) đang <strong>thấp hơn</strong> Số lượng sinh viên dự kiến (<strong>{createForm.so_luong_du_kien}</strong> sinh viên). Vui lòng tích chọn thêm chuyến tham quan hoặc điều chỉnh lại số lượng dự kiến.
                      </span>
                    </div>
                  )}
                  <div className="col-span-2 mt-4">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Tài khoản thụ hưởng <span className="text-red-500">*</span></label>
                    <SearchableDropdown
                      options={taiKhoanConfigs.map(tk => ({
                        value: tk.id,
                        label: `${tk.ghi_chu ? `[${tk.ghi_chu}] ` : ''}${tk.ten_ngan_hang} - ${tk.so_tai_khoan} - ${tk.ten_chu_tai_khoan}`
                      }))}
                      value={createForm.tai_khoan_thu_huong_id}
                      onChange={(val) => setCreateForm({ ...createForm, tai_khoan_thu_huong_id: val })}
                      placeholder="Chọn tài khoản VietQR..."
                      searchPlaceholder="Tìm kiếm..."
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Bảng Danh sách Chuyến tham quan */}
                <div className="border border-[#E7E0C4] rounded-xl overflow-hidden mt-6">
                  <div className="bg-[#E7E0C4]/30 px-4 py-3 flex items-center justify-between border-b border-[#E7E0C4]">
                    <h3 className="text-sm font-bold text-slate-800">Danh sách Chuyến tham quan khả dụng</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Tìm kiếm chuyến..."
                          value={tripSearchTerm}
                          onChange={(e) => setTripSearchTerm(e.target.value)}
                          className="w-48 pl-9 pr-3 py-1.5 border border-[#E7E0C4] rounded-lg text-sm bg-white focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                        />
                      </div>
                      <SearchableDropdown
                        value={tripFilterNhaMay}
                        onChange={val => setTripFilterNhaMay(val)}
                        options={[
                          { value: '', label: 'Tất cả Nhà máy' },
                          ...[...new Set(factories.map(f => f.ten_nha_may).filter(Boolean))].map(nm => ({ value: nm, label: nm }))
                        ]}
                        className="min-w-[200px]"
                        placeholder="Tất cả Nhà máy"
                        searchPlaceholder="Tìm kiếm nhà máy..."
                      />
                      <SearchableDropdown
                        value={tripFilterHinhThuc}
                        onChange={val => setTripFilterHinhThuc(val)}
                        options={[
                          { value: '', label: 'Hình thức: Tất cả' },
                          { value: 'TrucTiep', label: 'Trực tiếp' },
                          { value: 'TrucTuyen', label: 'Trực tuyến' }
                        ]}
                        className="min-w-[150px]"
                        searchPlaceholder="Tìm..."
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                          <th className="p-3 pl-4 w-12">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-[#407F3E] rounded border-gray-300 focus:ring-[#407F3E] cursor-pointer"
                              checked={selectedTripIds.length === filteredTrips.length && filteredTrips.length > 0}
                              onChange={handleToggleAllTrips}
                            />
                          </th>
                          <th className="p-3">Nhà máy</th>
                          <th className="p-3">Hình thức</th>
                          <th className="p-3">Ngày & Giờ</th>
                          <th className="p-3 text-center">Sức chứa</th>
                          <th className="p-3 pr-4 text-right">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E0C4]/50">
                        {paginatedTrips.map(trip => (
                          <tr key={trip.id} className={`hover:bg-[#E7E0C4]/10 transition-colors ${selectedTripIds.includes(trip.id) ? 'bg-[#E7E0C4]/20' : ''}`}>
                            <td className="p-3 pl-4">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-[#407F3E] rounded border-gray-300 focus:ring-[#407F3E] cursor-pointer"
                                checked={selectedTripIds.includes(trip.id)}
                                onChange={() => handleToggleTrip(trip.id)}
                              />
                            </td>
                            <td className="p-3 font-semibold text-slate-800 text-sm">
                              {trip.nhaMay?.ten_nha_may || 'Nhà máy chưa rõ'}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${trip.hinh_thuc === 'TrucTiep' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                  {trip.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
                                </span>
                                {trip.trang_thai_sua_doi === 'ChoDuyet' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200 whitespace-nowrap" title="Có sửa đổi đang chờ duyệt">
                                    ⚠️ Đang chờ duyệt sửa
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-sm text-slate-600">
                              <div className="font-medium text-slate-800">{new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN')}</div>
                              <div className="text-xs">{trip.gio_bat_dau?.substring(0, 5)} - {trip.gio_ket_thuc?.substring(0, 5)}</div>
                              {(() => {
                                const tripDateStr = formatDateForInput(trip.ngay_tham_quan);
                                const isBeforeDot = Boolean(dotMinDate && tripDateStr && tripDateStr < dotMinDate);
                                const isBeforeRegEnd = Boolean(createForm.tg_mo_dang_ky_den && tripDateStr && tripDateStr <= createForm.tg_mo_dang_ky_den);
                                if (isBeforeDot) {
                                  return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 whitespace-nowrap mt-1">
                                      ⚠️ Trước đợt kiến tập
                                    </span>
                                  );
                                }
                                if (isBeforeRegEnd) {
                                  return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap mt-1">
                                      ⚠️ Trùng/Trước hạn đăng ký
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </td>
                            <td className="p-3 text-center text-sm font-semibold text-slate-700">
                              {trip.suc_chua}
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <button
                                onClick={(e) => { e.preventDefault(); setViewingTripDetail(trip); }}
                                className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              >
                                <Search className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredTrips.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">Không tìm thấy chuyến tham quan nào</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {filteredTrips.length > 0 && (
                    <div className="px-4 py-3 border-t border-[#E7E0C4] bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Hiển thị</span>
                        <SearchableDropdown
                          value={tripPageSize}
                          onChange={val => setTripPageSize(Number(val))}
                          options={[
                            { value: 15, label: '15' },
                            { value: 30, label: '30' },
                            { value: 50, label: '50' }
                          ]}
                          className="min-w-[80px]"
                          searchPlaceholder="Tìm..."
                          direction="up"
                        />
                        <span className="text-sm text-slate-600">chuyến</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={tripPage === 1}
                          onClick={(e) => { e.preventDefault(); setTripPage(1); }}
                          className="px-2.5 py-1 text-sm border border-[#E7E0C4] rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 cursor-pointer font-medium transition-colors"
                        >
                          Trang đầu
                        </button>
                        <button
                          disabled={tripPage === 1}
                          onClick={(e) => { e.preventDefault(); setTripPage(prev => prev - 1); }}
                          className="px-2.5 py-1 text-sm border border-[#E7E0C4] rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 cursor-pointer font-medium transition-colors"
                        >
                          Trước
                        </button>
                        <span className="px-3 py-1 text-sm font-bold text-[#407F3E]">
                          Trang {tripPage} / {tripTotalPages}
                        </span>
                        <button
                          disabled={tripPage === tripTotalPages}
                          onClick={(e) => { e.preventDefault(); setTripPage(prev => prev + 1); }}
                          className="px-2.5 py-1 text-sm border border-[#E7E0C4] rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 cursor-pointer font-medium transition-colors"
                        >
                          Sau
                        </button>
                        <button
                          disabled={tripPage === tripTotalPages}
                          onClick={(e) => { e.preventDefault(); setTripPage(tripTotalPages); }}
                          className="px-2.5 py-1 text-sm border border-[#E7E0C4] rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 cursor-pointer font-medium transition-colors"
                        >
                          Trang cuối
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
              <button
                onClick={() => { setIsModalOpen(false); setEditingId(null); setSelectedTripIds([]); }}
                disabled={isCreating}
                className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                onClick={handleFinalSubmit}
                disabled={isCreating}
                className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isCreating ? 'Đang xử lý...' : (editingId ? 'Cập nhật lịch' : 'Xác nhận tạo lịch')}
                {!isCreating && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40  animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
          ></div>
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Chi tiết lịch kiến tập
              </h2>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>



            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="bg-white p-6 rounded-xl border border-[#E7E0C4] shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tên lịch kiến tập</label>
                    <div className="text-sm font-bold text-slate-800 text-lg">{viewingDetail.ten_lich}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Đợt kiến tập</label>
                    <div className="text-sm font-semibold text-slate-700">{campaigns.find(c => c.id === viewingDetail.dot_kien_tap_id)?.ten_dot || 'Không xác định'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Mở đăng ký (Từ - Đến)</label>
                    <div className="text-sm font-semibold text-[#407F3E]">
                      {viewingDetail.tg_mo_dang_ky_tu ? new Date(viewingDetail.tg_mo_dang_ky_tu).toLocaleString('vi-VN') : '---'} <br /><span className="text-slate-400 font-medium text-xs">đến</span> {viewingDetail.tg_mo_dang_ky_den ? new Date(viewingDetail.tg_mo_dang_ky_den).toLocaleString('vi-VN') : '---'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Số lượng sinh viên dự kiến</label>
                    <div className="text-sm font-semibold text-slate-700">{viewingDetail.so_luong_du_kien || 0} sinh viên</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tổng sức chứa các chuyến</label>
                    <div className="text-sm font-semibold text-slate-700">
                      {allTrips.filter(t => t.lich_kien_tap_id === viewingDetail.id).reduce((sum, t) => sum + (Number(t.suc_chua) || 0), 0)} chỗ ({allTrips.filter(t => t.lich_kien_tap_id === viewingDetail.id).length} chuyến)
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border border-[#E7E0C4] rounded-xl overflow-hidden shadow-sm bg-white animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#E7E0C4]/30 px-4 py-3 flex items-center justify-between border-b border-[#E7E0C4]">
                  <h3 className="text-sm font-bold text-slate-800">Danh sách Chuyến tham quan đã gắn</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F5E9] text-slate-700 text-[10px] font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                      <th className="p-3 pl-4">Nhà máy</th>
                      <th className="p-3 text-center">Hình thức</th>
                      <th className="p-3 text-center">Ngày & Giờ</th>
                      <th className="p-3 text-center">Sức chứa</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                    {allTrips.filter(t => t.lich_kien_tap_id === viewingDetail.id).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-slate-500 font-medium">Chưa có chuyến tham quan nào được gắn</td>
                      </tr>
                    ) : (
                      allTrips.filter(t => t.lich_kien_tap_id === viewingDetail.id).map(t => (
                        <tr key={t.id} className={`transition-colors ${t.trang_thai === 'Nhap' ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50/50'}`}>
                          <td className="p-3 pl-4 font-bold text-slate-800">
                            <div className="flex items-center gap-2">
                              {t.nhaMay?.ten_nha_may}
                              {t.trang_thai === 'Nhap' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-800 shadow-sm border border-amber-300">MỚI / CÓ THAY ĐỔI</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${t.hinh_thuc === 'TrucTiep' ? 'bg-[#407F3E]/20 text-[#407F3E]' : 'bg-blue-100 text-blue-700'}`}>
                              {t.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
                            </span>
                          </td>
                          <td className="p-3 text-center text-xs font-medium text-slate-600">
                            <span className="text-[#407F3E] font-bold block">{new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN')}</span>
                            {t.gio_bat_dau} - {t.gio_ket_thuc}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700">{t.suc_chua}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3.5 rounded-xl shadow-xl border animate-in slide-in-from-right-8 fade-in duration-300 font-semibold text-sm flex items-center gap-3 text-white ${toastMessage.type === 'error' ? 'bg-red-600 border-red-600 shadow-red-600/20' : 'bg-[#407F3E] border-[#407F3E] shadow-[#407F3E]/20'
          }`}>
          <span className="p-1 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            {toastMessage.type === 'error' ? <X className="w-4 h-4 text-white" /> : <Check className="w-4 h-4 text-white" />}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40  animate-in fade-in duration-200"
            onClick={() => setConfirmConfig(null)}
          ></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 p-6">
            <h3 className={`text-lg font-bold mb-2 ${confirmConfig.type === 'danger' ? 'text-red-600' : 'text-slate-800'}`}>
              {confirmConfig.title}
            </h3>
            <p className="text-slate-600 text-sm mb-6">{confirmConfig.message}</p>

            {confirmConfig.type === 'prompt' && (
              <textarea
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                className="w-full border border-[#E7E0C4] p-3 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] mb-6 resize-none"
                placeholder="Nhập lý do ở đây..."
                rows={3}
                autoFocus
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmConfig(null)}
                className="px-4 py-2 border border-[#E7E0C4] text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmConfig.type === 'prompt' && !promptValue.trim()) {
                    showToast('Vui lòng nhập lý do', 'error');
                    return;
                  }
                  confirmConfig.onConfirm(confirmConfig.type === 'prompt' ? promptValue.trim() : undefined);
                  setConfirmConfig(null);
                }}
                className={`px-4 py-2 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer ${confirmConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#407F3E] hover:bg-[#407F3E]/90'
                  }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Detail Modal */}
      {viewingTripDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 animate-in fade-in duration-200"
            onClick={() => setViewingTripDetail(null)}
          ></div>
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Chi tiết chuyến tham quan</h2>
              <button
                onClick={() => setViewingTripDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nhà máy</label>
                  <p className="text-sm font-semibold text-slate-800">{viewingTripDetail.nhaMay?.ten_nha_may}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ngày tham quan</label>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(viewingTripDetail.ngay_tham_quan).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hình thức</label>
                    <p className="text-sm font-medium text-slate-800">
                      {viewingTripDetail.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Giờ bắt đầu - kết thúc</label>
                    <p className="text-sm font-medium text-slate-800">
                      {viewingTripDetail.gio_bat_dau?.substring(0, 5)} - {viewingTripDetail.gio_ket_thuc?.substring(0, 5)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sức chứa</label>
                    <p className="text-sm font-medium text-slate-800">
                      {viewingTripDetail.suc_chua}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Địa điểm / Link meeting</label>
                  <p className="text-sm text-slate-800 break-words">{viewingTripDetail.dia_diem_tap_trung || 'Không có'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mô tả</label>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{viewingTripDetail.mo_ta || 'Không có'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Giảng viên dẫn đoàn</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {viewingTripDetail.giaoVienDanDoan && viewingTripDetail.giaoVienDanDoan.length > 0 ? (
                      viewingTripDetail.giaoVienDanDoan.map((gv, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                          {gv.giangVien?.ho_ten || 'Giảng viên'}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 italic">Chưa phân công giảng viên</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderDropdownPortal()}
    </div>
  );
}
