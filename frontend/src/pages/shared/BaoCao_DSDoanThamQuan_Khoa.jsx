import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Bus,
  FileSpreadsheet,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  CreditCard,
  ChevronDown,
  Check,
  Loader2,
  Building2,
  Phone,
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import { exportDanhSachChuyenThamQuan, formatDate } from '../../utils/exportExcel';

export default function BaoCao_DSDoanThamQuan_Khoa() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDotId = searchParams.get('dotKienTapId');

  // Loading states
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Data states
  const [campaigns, setCampaigns] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [selectedDot, setSelectedDot] = useState(urlDotId || '');
  const [selectedTripId, setSelectedTripId] = useState('');
  const [registrations, setRegistrations] = useState([]);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAttendance, setFilterAttendance] = useState('All');
  const [filterFee, setFilterFee] = useState('All');

  // Dropdown states
  const [isDotDropdownOpen, setIsDotDropdownOpen] = useState(false);
  const [searchDot, setSearchDot] = useState('');
  const [isTripDropdownOpen, setIsTripDropdownOpen] = useState(false);
  const [searchTrip, setSearchTrip] = useState('');
  const [isAttendanceDropdownOpen, setIsAttendanceDropdownOpen] = useState(false);
  const [isFeeDropdownOpen, setIsFeeDropdownOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const closeAllDropdowns = () => {
    setIsDotDropdownOpen(false);
    setIsTripDropdownOpen(false);
    setIsAttendanceDropdownOpen(false);
    setIsFeeDropdownOpen(false);
  };

  // 1. Tải danh sách đợt kiến tập và chuyến tham quan
  useEffect(() => {
    const initData = async () => {
      setLoadingTrips(true);
      try {
        const [campsRes, tripsRes] = await Promise.all([
          khoaApi.getCampaigns({ limit: 1000 }),
          khoaApi.getTrips()
        ]);

        const dots = campsRes.data?.data || campsRes.data || [];
        setCampaigns(dots);

        const trips = tripsRes.data?.data || tripsRes.data || [];
        setAllTrips(trips);

        // Lọc chuyến theo đợt nếu có selectedDot
        const initialFiltered = selectedDot
          ? trips.filter(t => {
              const dId = t.lichKienTap?.dot_kien_tap_id || t.lichKienTap?.dotKienTap?.id;
              return !dId || String(dId) === String(selectedDot);
            })
          : trips;

        setFilteredTrips(initialFiltered);

        if (initialFiltered.length > 0) {
          setSelectedTripId(String(initialFiltered[0].id));
        } else {
          setSelectedTripId('');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu khởi tạo:', err);
      } finally {
        setLoadingTrips(false);
      }
    };

    initData();
  }, []);

  // 2. Khi selectedDot thay đổi -> Cập nhật danh sách chuyến
  useEffect(() => {
    if (allTrips.length === 0) return;

    const trips = selectedDot
      ? allTrips.filter(t => {
          const dId = t.lichKienTap?.dot_kien_tap_id || t.lichKienTap?.dotKienTap?.id;
          return !dId || String(dId) === String(selectedDot);
        })
      : allTrips;

    setFilteredTrips(trips);

    // Nếu chuyến đang chọn không thuộc đợt mới, chọn chuyến đầu tiên
    const currentStillExists = trips.some(t => String(t.id) === String(selectedTripId));
    if (!currentStillExists) {
      if (trips.length > 0) {
        setSelectedTripId(String(trips[0].id));
      } else {
        setSelectedTripId('');
        setRegistrations([]);
      }
    }
  }, [selectedDot, allTrips]);

  // 3. Khi selectedTripId thay đổi -> Tải danh sách sinh viên đăng ký
  useEffect(() => {
    if (!selectedTripId) {
      setRegistrations([]);
      return;
    }

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await khoaApi.getRegistrations({ chuyenThamQuanId: selectedTripId, limit: 1000 });
        setRegistrations(res.data?.data || []);
        setCurrentPage(1);
      } catch (err) {
        console.error('Lỗi tải danh sách sinh viên chuyến:', err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedTripId]);

  // Thông tin chuyến đang chọn
  const selectedTrip = allTrips.find(t => String(t.id) === String(selectedTripId));

  // Lọc sinh viên theo bộ lọc
  const filteredRegistrations = registrations.filter(r => {
    const sv = r.sinhVien || {};
    const term = searchTerm.toLowerCase();
    const matchSearch =
      sv.mssv?.toLowerCase().includes(term) ||
      sv.ho_ten?.toLowerCase().includes(term) ||
      (sv.ten_lop || sv.lop)?.toLowerCase().includes(term) ||
      (sv.so_dien_thoai || sv.sdt)?.includes(term);

    // Lọc điểm danh
    let matchAtt = true;
    if (filterAttendance === 'CoMat') matchAtt = r.diemDanh?.trang_thai === 'CoMat';
    else if (filterAttendance === 'Vang') matchAtt = r.diemDanh?.trang_thai === 'Vang';
    else if (filterAttendance === 'ChuaDiemDanh') matchAtt = !r.diemDanh || !r.diemDanh?.trang_thai || r.diemDanh?.trang_thai === 'ChuaDiemDanh';

    // Lọc lệ phí
    let matchFee = true;
    const isPaid = r.hoaDon?.trang_thai?.startsWith('DaDong') || selectedTrip?.le_phi === 0;
    if (filterFee === 'DaDong') matchFee = isPaid;
    else if (filterFee === 'ChuaDong') matchFee = !isPaid;

    return matchSearch && matchAtt && matchFee;
  });

  // Thống kê KPI
  const totalRegistrations = registrations.length;
  const presentCount = registrations.filter(r => r.diemDanh?.trang_thai === 'CoMat').length;
  const paidCount = registrations.filter(r => r.hoaDon?.trang_thai?.startsWith('DaDong') || selectedTrip?.le_phi === 0).length;
  const capacity = selectedTrip?.suc_chua || 0;
  const fillRate = capacity > 0 ? ((totalRegistrations / capacity) * 100).toFixed(0) : '100';

  // Pagination
  const totalPages = Math.ceil(filteredRegistrations.length / limit) || 1;
  const paginatedData = filteredRegistrations.slice((currentPage - 1) * limit, currentPage * limit);

  // Xử lý xuất Excel
  const handleExportExcel = () => {
    if (!selectedTrip) return;
    if (registrations.length === 0) {
      alert('Chuyến tham quan này chưa có sinh viên đăng ký!');
      return;
    }
    exportDanhSachChuyenThamQuan(selectedTrip, filteredRegistrations);
  };

  const handleBack = () => {
    navigate(location.pathname.includes('/clb') ? '/clb/reports' : '/khoa/reports');
  };

  const handleSelectDot = (dotId) => {
    setSelectedDot(dotId);
    if (dotId) {
      setSearchParams({ dotKienTapId: dotId });
    } else {
      setSearchParams({});
    }
    setIsDotDropdownOpen(false);
    setSearchDot('');
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6 flex-wrap">
        <span className="cursor-pointer hover:text-[#407F3E] transition-colors" onClick={handleBack}>Báo cáo thống kê</span>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-[#407F3E] font-bold">Danh sách SV theo Chuyến tham quan</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 bg-white border border-[#E7E0C4] hover:border-[#407F3E] text-slate-500 hover:text-[#407F3E] rounded-xl transition-all shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Danh sách SV theo Chuyến tham quan</h1>
              <span className="px-3 py-1 bg-[#407F3E]/10 border border-[#407F3E]/30 text-[#407F3E] text-xs font-bold rounded-full">
                Danh Sách Đoàn
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Danh sách chi tiết sinh viên đăng ký theo từng chuyến tham quan, thông tin liên hệ, trạng thái điểm danh và nộp lệ phí.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Thẻ KPI: Bố cục tầng hiện đại chống rớt chữ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Tổng SV đăng ký */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E0C4] shadow-sm flex flex-col justify-between hover:border-[#407F3E] transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Tổng SV đăng ký
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#407F3E]/10 flex items-center justify-center text-[#407F3E] shrink-0 border border-[#407F3E]/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {totalRegistrations} <span className="text-xs font-medium text-slate-400">/ {capacity || '∞'} SV</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Sĩ số đăng ký thực tế của đoàn</p>
          </div>
        </div>

        {/* Card 2: Điểm danh có mặt */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider whitespace-nowrap">
              Điểm danh có mặt
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {presentCount} <span className="text-xs font-medium text-emerald-400">SV</span>
            </div>
            <p className="text-xs text-emerald-600/80 mt-1 font-medium">
              Đạt {totalRegistrations > 0 ? ((presentCount / totalRegistrations) * 100).toFixed(0) : 0}% tỷ lệ có mặt
            </p>
          </div>
        </div>

        {/* Card 3: Lệ phí đã nộp */}
        <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider whitespace-nowrap">
              Lệ phí đã nộp
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-200">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-700 tracking-tight">
              {paidCount} <span className="text-xs font-medium text-indigo-400">SV</span>
            </div>
            <p className="text-xs text-indigo-600/80 mt-1 font-medium">
              Đạt {totalRegistrations > 0 ? ((paidCount / totalRegistrations) * 100).toFixed(0) : 0}% hoàn thành lệ phí
            </p>
          </div>
        </div>

        {/* Card 4: Tỷ lệ lấp đầy */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider whitespace-nowrap">
              Tỷ lệ lấp đầy xe
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700 tracking-tight">
              {fillRate}%
            </div>
            <p className="text-xs text-amber-600/80 mt-1 font-medium">
              {capacity ? `${totalRegistrations}/${capacity} chỗ ngồi` : 'Không giới hạn sức chứa'}
            </p>
          </div>
        </div>
      </div>

      {/* Banner thông tin chi tiết Chuyến tham quan */}
      {selectedTrip && (
        <div className="bg-[#f8faf1] p-5 rounded-2xl border border-[#407F3E]/20 shadow-xs mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#407F3E] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#407F3E] px-2 py-0.5 bg-[#407F3E]/10 rounded-md border border-[#407F3E]/20">
                    {selectedTrip.id ? `CTQ-${String(selectedTrip.id).padStart(3, '0')}` : 'CTQ'}
                  </span>
                  <h2 className="text-lg font-black text-slate-800">
                    {selectedTrip.nhaMay?.ten_nha_may || selectedTrip.ten_chuyen}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedTrip.hinh_thuc === 'TrucTiep' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {selectedTrip.hinh_thuc === 'TrucTiep' ? 'Trực tiếp (Offline)' : 'Trực tuyến (Online)'}
                  </span>
                </div>
                <div className="flex items-center gap-5 mt-2 flex-wrap text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#407F3E]" />
                    <span>Ngày đi: <strong>{selectedTrip.ngay_tham_quan ? formatDate(selectedTrip.ngay_tham_quan) : 'Chưa định ngày'}</strong></span>
                  </span>
                  {selectedTrip.gio_bat_dau && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#407F3E]" />
                      <span>Giờ xuất phát: <strong>{selectedTrip.gio_bat_dau}</strong></span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#407F3E]" />
                    <span>Điểm tập trung: <strong>{selectedTrip.dia_diem_tap_trung || 'Trường ĐH Công Thương TP.HCM'}</strong></span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#407F3E]" />
                    <span>GV dẫn đoàn: <strong>{selectedTrip.assignments?.[0]?.giangVien?.ho_ten || selectedTrip.giangVienDanDoan || 'Ban tổ chức CLB'}</strong></span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#407F3E] hover:bg-[#346832] text-white rounded-xl text-sm font-bold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel Danh sách đoàn (In điểm danh)</span>
            </button>
          </div>
        </div>
      )}

      {/* Toolbar: Chọn Đợt, Chọn Chuyến, Tìm kiếm, Lọc điểm danh, Lọc lệ phí */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 mb-6">
        {/* Search Input */}
        <div className="relative min-w-[260px] flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm MSSV, họ tên, lớp, SĐT..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#407F3E]/30 focus:border-[#407F3E] transition-all"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dropdown Đợt kiến tập */}
          <div className="relative min-w-[190px]">
            <div
              onClick={(e) => { e.stopPropagation(); setIsDotDropdownOpen(!isDotDropdownOpen); setIsTripDropdownOpen(false); setIsAttendanceDropdownOpen(false); setIsFeeDropdownOpen(false); }}
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isDotDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]/30' : 'border-[#E7E0C4]'}`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <Calendar className="w-4 h-4 text-[#407F3E] shrink-0" />
                <span className={`truncate font-medium ${selectedDot ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                  {selectedDot ? (campaigns.find(c => String(c.id) === String(selectedDot))?.ten_dot || `Đợt #${selectedDot}`) : 'Tất cả Đợt'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isDotDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[220px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4]/50">
                  <input
                    type="text"
                    placeholder="Tìm đợt..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-[#407F3E]"
                    value={searchDot}
                    onChange={(e) => setSearchDot(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="overflow-y-auto max-h-56">
                  <div
                    onClick={() => handleSelectDot('')}
                    className={`px-3 py-2 text-xs cursor-pointer flex justify-between items-center transition-colors ${!selectedDot ? 'bg-[#E7E0C4]/50 text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/20'}`}
                  >
                    <span>Tất cả Đợt</span>
                    {!selectedDot && <Check className="w-3.5 h-3.5 text-[#407F3E]" />}
                  </div>
                  {campaigns
                    .filter(c => !searchDot || c.ten_dot?.toLowerCase().includes(searchDot.toLowerCase()))
                    .map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectDot(String(c.id))}
                        className={`px-3 py-2 text-xs cursor-pointer flex justify-between items-center transition-colors ${String(selectedDot) === String(c.id) ? 'bg-[#E7E0C4]/50 text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/20'}`}
                      >
                        <span className="truncate pr-2">{c.ten_dot}</span>
                        {String(selectedDot) === String(c.id) && <Check className="w-3.5 h-3.5 text-[#407F3E]" />}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Dropdown Chọn Chuyến tham quan */}
          <div className="relative min-w-[280px]">
            <div
              onClick={(e) => { e.stopPropagation(); setIsTripDropdownOpen(!isTripDropdownOpen); setIsDotDropdownOpen(false); setIsAttendanceDropdownOpen(false); setIsFeeDropdownOpen(false); }}
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isTripDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]/30' : 'border-[#E7E0C4]'}`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <Bus className="w-4 h-4 text-[#89B449] shrink-0" />
                <span className={`truncate font-medium ${selectedTrip ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                  {selectedTrip 
                    ? `[CTQ-${String(selectedTrip.id).padStart(3, '0')}] ${selectedTrip.nhaMay?.ten_nha_may || selectedTrip.ten_chuyen}` 
                    : (filteredTrips.length === 0 ? 'Không có chuyến nào' : 'Chọn chuyến tham quan')}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isTripDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[320px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4]/50">
                  <input
                    type="text"
                    placeholder="Tìm chuyến hoặc nhà máy..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-[#407F3E]"
                    value={searchTrip}
                    onChange={(e) => setSearchTrip(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="overflow-y-auto max-h-60">
                  {filteredTrips.length === 0 && (
                    <div className="px-3 py-4 text-xs text-center text-slate-400 italic">
                      Không có chuyến tham quan nào phù hợp đợt này
                    </div>
                  )}
                  {filteredTrips
                    .filter(t => {
                      const name = (t.nhaMay?.ten_nha_may || t.ten_chuyen || '').toLowerCase();
                      const code = `ctq-${t.id}`;
                      return !searchTrip || name.includes(searchTrip.toLowerCase()) || code.includes(searchTrip.toLowerCase());
                    })
                    .map(t => (
                      <div
                        key={t.id}
                        onClick={() => { setSelectedTripId(String(t.id)); setIsTripDropdownOpen(false); setSearchTrip(''); }}
                        className={`px-3 py-2 text-xs cursor-pointer flex justify-between items-center transition-colors ${String(selectedTripId) === String(t.id) ? 'bg-[#E7E0C4]/50 text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/20'}`}
                      >
                        <div className="truncate pr-2">
                          <span className="font-mono font-bold text-[#407F3E] mr-1.5">[CTQ-{String(t.id).padStart(3, '0')}]</span>
                          <span>{t.nhaMay?.ten_nha_may || t.ten_chuyen}</span>
                          <span className="text-slate-400 text-[11px] block mt-0.5">
                            {t.ngay_tham_quan ? formatDate(t.ngay_tham_quan) : 'Chưa định ngày'} ({t.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Online'})
                          </span>
                        </div>
                        {String(selectedTripId) === String(t.id) && <Check className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Dropdown Lọc Điểm danh */}
          <div className="relative min-w-[150px]">
            <div
              onClick={(e) => { e.stopPropagation(); setIsAttendanceDropdownOpen(!isAttendanceDropdownOpen); setIsDotDropdownOpen(false); setIsTripDropdownOpen(false); setIsFeeDropdownOpen(false); }}
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isAttendanceDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]/30' : 'border-[#E7E0C4]'}`}
            >
              <span className={`truncate pr-2 font-medium ${filterAttendance !== 'All' ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                {filterAttendance === 'All' ? 'Điểm danh: Tất cả' : (filterAttendance === 'CoMat' ? 'Có mặt' : (filterAttendance === 'Vang' ? 'Vắng mặt' : 'Chưa điểm danh'))}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isAttendanceDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[160px]">
                {[
                  { value: 'All', label: 'Tất cả điểm danh' },
                  { value: 'CoMat', label: 'Có mặt' },
                  { value: 'Vang', label: 'Vắng mặt' },
                  { value: 'ChuaDiemDanh', label: 'Chưa điểm danh' }
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => { setFilterAttendance(opt.value); setIsAttendanceDropdownOpen(false); setCurrentPage(1); }}
                    className={`px-3.5 py-2 text-xs cursor-pointer flex justify-between items-center transition-colors ${filterAttendance === opt.value ? 'bg-[#E7E0C4]/50 text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/20'}`}
                  >
                    <span>{opt.label}</span>
                    {filterAttendance === opt.value && <Check className="w-3.5 h-3.5 text-[#407F3E]" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown Lọc Lệ phí */}
          <div className="relative min-w-[140px]">
            <div
              onClick={(e) => { e.stopPropagation(); setIsFeeDropdownOpen(!isFeeDropdownOpen); setIsDotDropdownOpen(false); setIsTripDropdownOpen(false); setIsAttendanceDropdownOpen(false); }}
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isFeeDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]/30' : 'border-[#E7E0C4]'}`}
            >
              <span className={`truncate pr-2 font-medium ${filterFee !== 'All' ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                {filterFee === 'All' ? 'Lệ phí: Tất cả' : (filterFee === 'DaDong' ? 'Đã đóng' : 'Chưa đóng')}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isFeeDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[150px]">
                {[
                  { value: 'All', label: 'Tất cả lệ phí' },
                  { value: 'DaDong', label: 'Đã đóng' },
                  { value: 'ChuaDong', label: 'Chưa đóng' }
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => { setFilterFee(opt.value); setIsFeeDropdownOpen(false); setCurrentPage(1); }}
                    className={`px-3.5 py-2 text-xs cursor-pointer flex justify-between items-center transition-colors ${filterFee === opt.value ? 'bg-[#E7E0C4]/50 text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/20'}`}
                  >
                    <span>{opt.label}</span>
                    {filterFee === opt.value && <Check className="w-3.5 h-3.5 text-[#407F3E]" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table: Danh sách sinh viên đoàn */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4] whitespace-nowrap">
                <th className="py-3.5 px-4 text-center w-14">STT</th>
                <th className="py-3.5 px-4 min-w-[120px]">MSSV</th>
                <th className="py-3.5 px-4 min-w-[180px]">Họ và tên</th>
                <th className="py-3.5 px-4 min-w-[110px]">Lớp</th>
                <th className="py-3.5 px-4 min-w-[130px]">Số điện thoại</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Điểm danh</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Lệ phí</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loadingStudents ? (
                // Loading Skeleton
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-6 mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-20 mx-auto"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredRegistrations.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-semibold text-base text-slate-600">Chưa có sinh viên nào trong danh sách đoàn</p>
                      <p className="text-sm mt-1 text-slate-400">Chuyến tham quan này hiện chưa ghi nhận sinh viên đăng ký hoặc không có kết quả phù hợp bộ lọc.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((r, idx) => {
                  const sv = r.sinhVien || {};
                  const isPaid = r.hoaDon?.trang_thai?.startsWith('DaDong');
                  const isPresent = r.diemDanh?.trang_thai === 'CoMat';
                  const isAbsent = r.diemDanh?.trang_thai === 'Vang';
                  const isRefused = r.diemDanh?.trang_thai === 'TuChoiThamGia';

                  return (
                    <tr key={r.id || idx} className="hover:bg-slate-50/80 transition-colors whitespace-nowrap">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">
                        {(currentPage - 1) * limit + idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{sv.mssv}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{sv.ho_ten}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{sv.ten_lop || sv.lop || '-'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {sv.so_dien_thoai || sv.sdt ? (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{sv.so_dien_thoai || sv.sdt}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Chưa cập nhật</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isPresent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            <span>Có mặt</span>
                          </span>
                        )}
                        {isAbsent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span>Vắng mặt</span>
                          </span>
                        )}
                        {isRefused && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span>Từ chối</span>
                          </span>
                        )}
                        {!isPresent && !isAbsent && !isRefused && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Chưa điểm danh
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {selectedTrip?.le_phi === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Miễn phí
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            <CreditCard className="w-3 h-3" />
                            <span>Đã đóng</span>
                          </span>
                        ) : r.hoaDon?.trang_thai === 'DaHoanPhi' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Đã hoàn phí
                          </span>
                        ) : r.hoaDon?.trang_thai === 'ViPham' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Vi phạm
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Chưa đóng
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
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
              onChange={(val) => { setLimit(Number(val)); setCurrentPage(1); }}
              className="w-20"
            />
            <span>trên tổng số <strong className="text-slate-800">{filteredRegistrations.length}</strong> sinh viên đoàn</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-[#E7E0C4] rounded-lg text-xs font-bold text-slate-600 hover:bg-[#E7E0C4]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Trang trước
            </button>
            <div className="px-3 py-1.5 bg-[#407F3E] text-white rounded-lg text-xs font-bold">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 border border-[#E7E0C4] rounded-lg text-xs font-bold text-slate-600 hover:bg-[#E7E0C4]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
