import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { 
  Search, ChevronDown, Check, CheckCircle2, XCircle, FileWarning, Save,
  FileCheck, Eye, ZoomIn, ZoomOut, RotateCw, X, ExternalLink, AlertCircle, Building2, Lock
} from 'lucide-react';
import { giangVienApi } from '../../services/api';
import Toast from '../../components/Toast';
import SearchableDropdown from '../../components/SearchableDropdown';

// Helper lấy YYYY-MM-DD theo giờ địa phương
const toDateStr = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper format ngày hiển thị DD/MM/YYYY
const toDisplayDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

// Helper format giờ hiển thị HH:mm
const toDisplayTime = (timeVal) => {
  if (!timeVal) return '--:--';
  if (typeof timeVal === 'string') {
    if (timeVal.includes('T')) {
      return timeVal.split('T')[1].substring(0, 5);
    }
    return timeVal.substring(0, 5);
  }
  if (timeVal instanceof Date) {
    const hours = String(timeVal.getHours()).padStart(2, '0');
    const mins = String(timeVal.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  }
  return String(timeVal);
};

export default function DiemDanhSV_GV() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const targetTripId = useMemo(() => {
    const fromParam = searchParams.get('tripId');
    if (fromParam) return Number(fromParam);
    if (location.state?.selectedTripId) return Number(location.state.selectedTripId);
    return null;
  }, [searchParams, location.state]);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [lecturer, setLecturer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [students, setStudents] = useState([]);

  // Modal xem minh chứng giấy xác nhận doanh nghiệp
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    student: null,
    fileUrl: '',
    isImage: false,
    isPdf: false,
    loading: false,
  });
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchTrips(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchTrips = async (gvId) => {
    try {
      const res = await giangVienApi.getLedTrips(gvId);
      const tripsData = res.data || [];

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const formattedTrips = tripsData.map(t => {
        const rawDate = t.ngay_tham_quan || t.ngay_khoi_hanh;
        const tripDateStr = toDateStr(rawDate);
        const isToday = tripDateStr === todayStr;
        const isUpcoming = tripDateStr > todayStr;
        const isPast = tripDateStr < todayStr;
        const isLocked = Boolean(t.khoa_so_diem || t.trang_thai === 'DaKhoa');

        let tagPrefix = '';
        let sortGroup = 3; // 1: Today, 2: Upcoming, 3: Past

        if (isToday) {
          tagPrefix = '🔥 [HÔM NAY]';
          sortGroup = 1;
        } else if (isUpcoming) {
          tagPrefix = '📅 [SẮP TỚI]';
          sortGroup = 2;
        } else if (isLocked) {
          tagPrefix = '🔒 [ĐÃ KHÓA]';
          sortGroup = 3;
        } else {
          tagPrefix = '✔ [ĐÃ QUA]';
          sortGroup = 3;
        }

        const cachToChucPrefix = t.cach_to_chuc === 'TuDo' ? '[Tự do] ' : '';
        const factoryName = t.nhaMay?.ten_nha_may || 'Chuyến đi';
        const displayDate = toDisplayDate(rawDate);
        const displayTime = toDisplayTime(t.gio_bat_dau);
        const studentCount = `${t.so_luong_dang_ky_hien_tai ?? 0}/${t.so_luong_sinh_vien_toi_da ?? 0} SV`;
        const lockStatus = isLocked ? 'Đã khóa sổ điểm' : 'Sổ điểm đang mở';

        return {
          id: t.id,
          name: `${factoryName} (${displayDate})`,
          dropdownLabel: `${tagPrefix} ${cachToChucPrefix}${factoryName} (${displayDate})`,
          subLabel: `Khởi hành: ${displayTime} | Sĩ số: ${studentCount} | ${lockStatus}`,
          cachToChuc: t.cach_to_chuc,
          ngayThamQuan: t.ngay_tham_quan,
          gioBatDau: t.gio_bat_dau,
          trangThai: t.trang_thai,
          tripDateStr,
          isToday,
          isUpcoming,
          isPast,
          isLocked,
          sortGroup,
          rawTrip: t,
        };
      });

      // Sắp xếp phân nhóm thông minh:
      // 1. Hôm nay (theo giờ bắt đầu)
      // 2. Sắp tới (tăng dần: gần nhất -> xa hơn)
      // 3. Đã qua / Đã khóa (giảm dần: mới nhất -> cũ hơn)
      formattedTrips.sort((a, b) => {
        if (a.sortGroup !== b.sortGroup) {
          return a.sortGroup - b.sortGroup;
        }
        if (a.sortGroup === 1) {
          return (a.gioBatDau || '').localeCompare(b.gioBatDau || '');
        }
        if (a.sortGroup === 2) {
          if (a.tripDateStr !== b.tripDateStr) {
            return a.tripDateStr.localeCompare(b.tripDateStr);
          }
          return (a.gioBatDau || '').localeCompare(b.gioBatDau || '');
        }
        // Nhóm 3 (Quá khứ / Đã khóa): Mới nhất lên đầu
        if (b.tripDateStr !== a.tripDateStr) {
          return b.tripDateStr.localeCompare(a.tripDateStr);
        }
        return (b.gioBatDau || '').localeCompare(a.gioBatDau || '');
      });

      setTrips(formattedTrips);

      if (formattedTrips.length > 0) {
        // Thuật toán chọn chuyến tối ưu
        let optimal = null;

        // 1. Khớp theo targetTripId nếu có
        if (targetTripId) {
          optimal = formattedTrips.find(t => Number(t.id) === Number(targetTripId));
        }

        // 2. Ưu tiên chuyến HÔM NAY chưa khóa điểm
        if (!optimal) {
          optimal = formattedTrips.find(t => t.isToday && !t.isLocked);
        }

        // 3. Ưu tiên chuyến HÔM NAY bất kỳ
        if (!optimal) {
          optimal = formattedTrips.find(t => t.isToday);
        }

        // 4. Ưu tiên chuyến SẮP TỚI gần nhất (đã sort ASC)
        if (!optimal) {
          optimal = formattedTrips.find(t => t.isUpcoming);
        }

        // 5. Fallback: chuyến đầu tiên trong danh sách
        if (!optimal) {
          optimal = formattedTrips[0];
        }

        setSelectedTrip(optimal);

        // Đồng bộ URL param để khi F5 vẫn giữ chuyến
        if (optimal) {
          setSearchParams({ tripId: optimal.id }, { replace: true });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Đồng bộ khi targetTripId thay đổi từ navigation bên ngoài
  useEffect(() => {
    if (targetTripId && trips.length > 0) {
      const matched = trips.find(t => Number(t.id) === Number(targetTripId));
      if (matched && matched.id !== selectedTrip?.id) {
        setSelectedTrip(matched);
      }
    }
  }, [targetTripId, trips]);

  const tripTimeInfo = useMemo(() => {
    if (!selectedTrip?.ngayThamQuan) return { isStarted: true, formattedDateTime: '', trangThai: '' };

    const dateStr = typeof selectedTrip.ngayThamQuan === 'string'
      ? selectedTrip.ngayThamQuan.split('T')[0]
      : new Date(selectedTrip.ngayThamQuan).toISOString().split('T')[0];

    let timeStr = '00:00:00';
    if (typeof selectedTrip.gioBatDau === 'string') {
      timeStr = selectedTrip.gioBatDau.includes('T')
        ? selectedTrip.gioBatDau.split('T')[1].substring(0, 8)
        : selectedTrip.gioBatDau;
    } else if (selectedTrip.gioBatDau instanceof Date) {
      const hours = selectedTrip.gioBatDau.getUTCHours().toString().padStart(2, '0');
      const mins = selectedTrip.gioBatDau.getUTCMinutes().toString().padStart(2, '0');
      const secs = selectedTrip.gioBatDau.getUTCSeconds().toString().padStart(2, '0');
      timeStr = `${hours}:${mins}:${secs}`;
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const timeParts = timeStr.split(':').map(Number);
    const hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;
    const seconds = timeParts[2] || 0;

    const startDateTime = new Date(year, month - 1, day, hours, minutes, seconds);
    const now = new Date();
    const isStarted = now >= startDateTime;

    const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    return {
      isStarted,
      startDateTime,
      formattedDateTime: `${formattedTime} ngày ${formattedDate}`,
      trangThai: selectedTrip.trangThai,
    };
  }, [selectedTrip]);

  useEffect(() => {
    if (selectedTrip) {
      fetchStudents(selectedTrip.id);
      setCurrentPage(1);
    }
  }, [selectedTrip]);

  const fetchStudents = async (tripId) => {
    try {
      setLoading(true);
      const res = await giangVienApi.getTripRegistrations(tripId);
      const data = res.data || [];
      
      const mapped = data.map(phieu => ({
        id: phieu.id,
        mssv: phieu.sinhVien?.mssv,
        name: phieu.sinhVien?.ho_ten,
        status: phieu.diemDanh?.trang_thai || null,
        note: phieu.diemDanh?.ghi_chu || '',
        fileXacNhan: phieu.file_xac_nhan_tham_quan,
        fileBaoCao: phieu.file_bao_cao,
        ngayNop: phieu.ngay_nop_bao_cao,
        cachToChuc: phieu.cach_to_chuc,
        da_khoa: phieu.diemPhieuThamQuan?.da_khoa ?? (['HoanThanh', 'KhongDat'].includes(phieu.trang_thai)),
        phieuTrangThai: phieu.trang_thai,
      }));
      
      setStudents(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isTripLocked = useMemo(() => {
    if (selectedTrip?.rawTrip?.trang_thai === 'DaKhoa') return true;
    if (selectedTrip?.rawTrip?.lichKienTap?.trang_thai === 'DaKhoa') return true;
    if (selectedTrip?.rawTrip?.lichKienTap?.dotKienTap?.trang_thai === 'DaKhoa') return true;
    if (students.length > 0 && students.every(s => s.da_khoa)) return true;
    return false;
  }, [selectedTrip, students]);

  const handleOpenPreview = async (student) => {
    if (!student.fileXacNhan) return;
    setPreviewModal({
      isOpen: true,
      student,
      fileUrl: '',
      isImage: false,
      isPdf: false,
      loading: true,
    });
    setZoom(100);
    setRotation(0);

    try {
      const { default: api } = await import('../../services/axiosClient');
      let xnPath = student.fileXacNhan;
      if (xnPath.startsWith('/api/')) xnPath = xnPath.substring(5);
      if (xnPath.startsWith('attachments/') || xnPath.startsWith('payments/')) {
        xnPath = `upload/file/${xnPath}`;
      } else if (!xnPath.startsWith('upload/file/')) {
        xnPath = `upload/file/attachments/${xnPath}`;
      }
      if (xnPath.startsWith('/')) xnPath = xnPath.substring(1);

      const res = await api.get('/' + xnPath, { responseType: 'blob' });
      if (res.data) {
        const blobUrl = URL.createObjectURL(res.data);
        const isImg = res.headers['content-type']?.startsWith('image/') || /\.(png|jpe?g)$/i.test(xnPath);
        const isPdfDoc = res.headers['content-type']?.includes('pdf') || /\.pdf$/i.test(xnPath);
        setPreviewModal(prev => ({
          ...prev,
          fileUrl: blobUrl,
          isImage: isImg,
          isPdf: isPdfDoc,
          loading: false,
        }));
      }
    } catch (err) {
      console.error('Lỗi tải giấy xác nhận:', err);
      setToast({ show: true, message: 'Không thể tải tệp giấy xác nhận của sinh viên', type: 'error' });
      setPreviewModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    if (isTripLocked) {
      setToast({
        show: true,
        message: 'Chuyến tham quan hoặc đợt kiến tập đã khóa sổ điểm. Không thể thay đổi trạng thái điểm danh.',
        type: 'error'
      });
      return;
    }
    if (!tripTimeInfo.isStarted) {
      setToast({
        show: true,
        message: `Chưa đến thời gian bắt đầu chuyến tham quan (${tripTimeInfo.formattedDateTime}). Không thể thay đổi trạng thái điểm danh.`,
        type: 'error'
      });
      return;
    }
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, status: newStatus, note: newStatus === 'TuChoiThamGia' ? s.note : '' };
      }
      return s;
    }));
  };

  const handleNoteChange = (studentId, newNote) => {
    if (isTripLocked) return;
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, note: newNote } : s));
  };

  const handleMarkAllPresent = () => {
    if (isTripLocked) {
      setToast({
        show: true,
        message: 'Chuyến tham quan hoặc đợt kiến tập đã khóa sổ điểm. Không thể điểm danh.',
        type: 'error'
      });
      return;
    }
    if (!tripTimeInfo.isStarted) {
      setToast({
        show: true,
        message: `Chưa đến thời gian bắt đầu chuyến tham quan (${tripTimeInfo.formattedDateTime}). Không thể điểm danh.`,
        type: 'error'
      });
      return;
    }
    setStudents(prev => prev.map(s => ({ ...s, status: 'CoMat', note: '' })));
  };

  const handleSaveAttendance = async () => {
    if (isTripLocked) {
      setToast({
        show: true,
        message: 'Chuyến tham quan hoặc đợt kiến tập đã khóa sổ điểm. Không thể lưu điểm danh.',
        type: 'error'
      });
      return;
    }
    if (!selectedTrip || students.length === 0) return;
    if (!tripTimeInfo.isStarted) {
      setToast({
        show: true,
        message: `Chưa đến thời gian bắt đầu chuyến tham quan (${tripTimeInfo.formattedDateTime}). Không thể lưu điểm danh.`,
        type: 'error'
      });
      return;
    }
    try {
      setLoading(true);
      const records = students.map(s => ({
        phieuId: s.id,
        status: s.status || 'CoMat',
        note: s.note
      }));
      
      await giangVienApi.takeAttendance({
        tripId: selectedTrip.id,
        records
      });
      setToast({ show: true, message: 'Đã lưu điểm danh thành công!', type: 'success' });
      await fetchStudents(selectedTrip.id);
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      let errorMsg = 'Có lỗi xảy ra khi lưu điểm danh';
      if (Array.isArray(serverMsg)) {
        errorMsg = serverMsg.join(', ');
      } else if (typeof serverMsg === 'string' && serverMsg.trim()) {
        errorMsg = serverMsg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setToast({ 
        show: true, 
        message: errorMsg, 
        type: 'error' 
      });
      console.error('Lỗi khi lưu điểm danh:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Paginated logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = !searchQuery || 
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (s.mssv && s.mssv.includes(searchQuery));
      const matchStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ChuaDiemDanh' && !s.status) ||
        (s.status === statusFilter);
      return matchSearch && matchStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / limit) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * limit, currentPage * limit);

  const attendedCount = students.filter(s => s.status !== null).length;
  const totalCount = students.length;

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative">
      <Toast 
        message={toast.show ? toast.message : ''} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Điểm danh sinh viên</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo MSSV/họ tên..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all text-slate-800 font-medium"
          />
        </div>

        {/* Trip Selector Dropdown */}
        <SearchableDropdown
          options={trips.map(t => ({
            value: t.id,
            label: t.dropdownLabel || `${t.cachToChuc === 'TuDo' ? '[Tự do] ' : ''}${t.name}`,
            subLabel: t.subLabel,
          }))}
          value={selectedTrip?.id || ''}
          onChange={(val) => {
            const found = trips.find(t => t.id === val);
            if (found) {
              setSelectedTrip(found);
              setSearchParams({ tripId: found.id });
            }
          }}
          placeholder={trips.length > 0 ? "Chọn chuyến đi..." : "Đang tải chuyến..."}
          searchPlaceholder="Tìm chuyến đi..."
          className="min-w-[300px] flex-1"
        />

        {/* Status Filter Dropdown */}
        <SearchableDropdown
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'CoMat', label: 'Có mặt' },
            { value: 'Vang', label: 'Vắng' },
            { value: 'TuChoiThamGia', label: 'Từ chối tham gia' },
            { value: 'ChuaDiemDanh', label: 'Chưa điểm danh' }
          ]}
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
          placeholder="Tất cả trạng thái"
          searchPlaceholder="Tìm trạng thái..."
          className="min-w-[200px]"
        />

      </div>

      {/* Warning Banner khi chưa đến giờ tham quan */}
      {selectedTrip && !tripTimeInfo.isStarted && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3.5 shadow-xs animate-in fade-in duration-300">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-amber-900">
                Chưa đến thời gian bắt đầu chuyến tham quan
              </h4>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-200/70 text-amber-800 rounded-md">
                Chưa diễn ra
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Chuyến tham quan dự kiến khởi hành lúc <span className="font-bold text-amber-950 underline decoration-amber-400">{tripTimeInfo.formattedDateTime}</span>. 
              Giảng viên chỉ có thể thực hiện và lưu điểm danh khi chuyến tham quan đã chính thức bắt đầu.
            </p>
          </div>
        </div>
      )}

      {/* Banner khi chuyến đã khóa sổ điểm */}
      {isTripLocked && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 mb-6 flex items-start gap-3.5 shadow-xs animate-in fade-in duration-300">
          <div className="p-2 bg-slate-200 rounded-lg text-slate-700 shrink-0 mt-0.5">
            <Lock className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">
              Chuyến tham quan đã kết thúc và chốt sổ điểm
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Dữ liệu điểm danh của chuyến tham quan này đã được khóa. Giao diện đang ở chế độ chỉ đọc để tra cứu thông tin và minh chứng.
            </p>
          </div>
        </div>
      )}

      {/* Quick Action Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-[#E7E0C4] shadow-sm mb-6 gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleMarkAllPresent}
            disabled={!tripTimeInfo.isStarted || isTripLocked}
            title={!tripTimeInfo.isStarted ? `Chưa đến thời gian tham quan (${tripTimeInfo.formattedDateTime})` : undefined}
            className={`w-full sm:w-auto px-5 py-2 border-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              !tripTimeInfo.isStarted
                ? 'border-slate-300 text-slate-400 bg-slate-50 cursor-not-allowed opacity-60'
                : 'border-[#89B449] text-[#89B449] hover:bg-[#89B449] hover:text-white cursor-pointer'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Đánh dấu tất cả Có mặt
          </button>
          <div className="text-sm font-bold text-slate-600">
            Đã điểm danh: <span className="text-[#407F3E] text-base">{attendedCount}/{totalCount}</span>
          </div>
        </div>

        <button 
          onClick={handleSaveAttendance}
          disabled={loading || students.length === 0 || !tripTimeInfo.isStarted || isTripLocked}
          title={!tripTimeInfo.isStarted ? `Chưa đến thời gian tham quan (${tripTimeInfo.formattedDateTime})` : undefined}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Lưu điểm danh
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 min-w-[120px]">MSSV</th>
                <th className="p-4 min-w-[180px]">Họ tên</th>
                <th className="p-4 text-center min-w-[180px]">Minh chứng DN</th>
                <th className="p-4 text-center min-w-[320px]">Trạng thái điểm danh</th>
                <th className="p-4 pr-6 min-w-[200px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium italic">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium italic">
                    Không tìm thấy sinh viên nào.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-600">{student.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{student.name}</td>
                    
                    {/* Minh chứng Doanh nghiệp (Chuyến tự do) */}
                    <td className="p-4 text-center">
                      {selectedTrip?.cachToChuc === 'TuDo' || student.cachToChuc === 'TuDo' ? (
                        student.fileXacNhan ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(student)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#407F3E]/10 text-[#407F3E] hover:bg-[#407F3E] hover:text-white transition-all cursor-pointer shadow-xs border border-[#407F3E]/20"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            Xem giấy xác nhận
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            Chưa nộp giấy XN
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Điểm danh trên xe</span>
                      )}
                    </td>

                    <td className="p-4">
                      {/* Segmented Toggle Buttons */}
                      <div className={`flex justify-center bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit mx-auto ${!tripTimeInfo.isStarted ? 'opacity-60' : ''}`}>
                        
                        <button 
                          onClick={() => handleStatusChange(student.id, 'CoMat')}
                          disabled={!tripTimeInfo.isStarted || isTripLocked}
                          title={!tripTimeInfo.isStarted ? `Chưa đến thời gian tham quan (${tripTimeInfo.formattedDateTime})` : undefined}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                            student.status === 'CoMat' 
                              ? 'bg-[#89B449] text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                          } ${!tripTimeInfo.isStarted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Có mặt
                        </button>
                        
                        <button 
                          onClick={() => handleStatusChange(student.id, 'Vang')}
                          disabled={!tripTimeInfo.isStarted || isTripLocked}
                          title={!tripTimeInfo.isStarted ? `Chưa đến thời gian tham quan (${tripTimeInfo.formattedDateTime})` : undefined}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all mx-1 ${
                            student.status === 'Vang' 
                              ? 'bg-[#E68A8C] text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                          } ${!tripTimeInfo.isStarted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Vắng
                        </button>
                        
                        <button 
                          onClick={() => handleStatusChange(student.id, 'TuChoiThamGia')}
                          disabled={!tripTimeInfo.isStarted || isTripLocked}
                          title={!tripTimeInfo.isStarted ? `Chưa đến thời gian tham quan (${tripTimeInfo.formattedDateTime})` : undefined}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                            student.status === 'TuChoiThamGia' 
                              ? 'bg-white border-2 border-[#E68A8C] text-[#E68A8C] shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border-2 border-transparent'
                          } ${!tripTimeInfo.isStarted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <FileWarning className="w-3.5 h-3.5" /> Từ chối tham gia
                        </button>

                      </div>
                    </td>
                    
                    <td className="p-4 pr-6">
                      {student.status === 'TuChoiThamGia' ? (
                        <input 
                          type="text" 
                          value={student.note}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          disabled={isTripLocked || student.da_khoa}
                          placeholder="Lý do từ chối..."
                          className="w-full px-3 py-2 bg-white border border-[#E68A8C] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#E68A8C] text-slate-800 placeholder-slate-400 shadow-sm animate-in fade-in duration-200"
                          autoFocus
                        />
                      ) : (
                        <span className="text-xs text-slate-300 italic px-3 block text-center md:text-left">Không có ghi chú</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
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
            <span>/ {filteredStudents.length} sinh viên</span>
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

      {/* Preview Confirmation Paper Modal */}
      {previewModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#407F3E]/10 flex items-center justify-center text-[#407F3E] shrink-0 font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-800 truncate">
                    Giấy xác nhận tham quan doanh nghiệp
                  </h3>
                  <p className="text-xs text-slate-500 truncate font-medium">
                    Sinh viên: <strong className="text-slate-700">{previewModal.student?.name}</strong> • MSSV: <strong className="text-slate-700">{previewModal.student?.mssv}</strong>
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {previewModal.isImage && (
                  <>
                    <button
                      onClick={() => setZoom(z => Math.max(50, z - 25))}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Thu nhỏ"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-600 min-w-[45px] text-center">
                      {zoom}%
                    </span>
                    <button
                      onClick={() => setZoom(z => Math.min(250, z + 25))}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Phóng to"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRotation(r => (r + 90) % 360)}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Xoay 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-1" />
                  </>
                )}

                {previewModal.fileUrl && (
                  <a
                    href={previewModal.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-slate-500 hover:text-[#407F3E] hover:bg-[#407F3E]/10 transition-colors cursor-pointer"
                    title="Mở tab mới"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center min-h-[350px] max-h-[calc(92vh-140px)]">
              {previewModal.loading ? (
                <div className="text-center p-8 text-slate-500">
                  <div className="w-8 h-8 border-3 border-[#407F3E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium">Đang tải minh chứng giấy xác nhận...</p>
                </div>
              ) : previewModal.fileUrl ? (
                previewModal.isPdf ? (
                  <iframe
                    src={previewModal.fileUrl}
                    title="Giấy xác nhận tham quan"
                    className="w-full h-[65vh] rounded-lg border border-slate-300 bg-white"
                  />
                ) : (
                  <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-2">
                    <img
                      src={previewModal.fileUrl}
                      alt="Giấy xác nhận tham quan"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="max-h-[62vh] object-contain rounded-lg shadow-md border border-slate-200 bg-white"
                    />
                  </div>
                )
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">Không thể hiển thị tài liệu.</p>
                </div>
              )}
            </div>

            {/* Modal Footer with quick roll-call */}
            <div className="p-4 px-6 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Kiểm tra mộc đỏ, chữ ký đại diện doanh nghiệp và ngày thực tế của sinh viên.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (previewModal.student) {
                      handleStatusChange(previewModal.student.id, 'CoMat');
                      setPreviewModal(prev => ({ ...prev, isOpen: false }));
                      setToast({ show: true, message: `Đã đánh dấu Có mặt cho ${previewModal.student.name}. Hãy bấm "Lưu điểm danh"!`, type: 'success' });
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#89B449] text-white hover:bg-[#89B449]/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Xác nhận Có mặt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (previewModal.student) {
                      handleStatusChange(previewModal.student.id, 'TuChoiThamGia');
                      setPreviewModal(prev => ({ ...prev, isOpen: false }));
                      setToast({ show: true, message: `Đã đánh dấu Từ chối cho ${previewModal.student.name}.`, type: 'error' });
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileWarning className="w-4 h-4" /> Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
