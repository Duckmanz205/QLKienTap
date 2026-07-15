import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';
import { 
  Compass, 
  Users, 
  Check, 
  X, 
  AlertCircle, 
  Calendar, 
  ShieldCheck, 
  DollarSign, 
  Filter, 
  Search, 
  FileText, 
  RefreshCw, 
  UserCheck, 
  PlusCircle,
  Clock,
  MapPin
} from 'lucide-react';

export default function ChuyenThamQuan_DSLoc() {
  const [activeTab, setActiveTab] = useState('trips'); // 'trips' | 'registrations' | 'cancels' | 'refunds' | 'gvhd'

  // Data states
  const [trips, setTrips] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [factories, setFactories] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [enrollments, setEnrollments] = useState([]); // LichKienTap_SinhVien for GVHD assignment

  // Create Trip form state
  const [nhaMayId, setNhaMayId] = useState('');
  const [lichId, setLichId] = useState('');
  const [ngayThamQuan, setNgayThamQuan] = useState('');
  const [gioBD, setGioBD] = useState('');
  const [gioKT, setGioKT] = useState('');
  const [hinhThuc, setHinhThuc] = useState('TrucTiep');
  const [sucChua, setSucChua] = useState('');

  // Assign GVDD/Leader form state
  const [activeLeaderTripId, setActiveLeaderTripId] = useState(null);
  const [leaderLecturerId, setLeaderLecturerId] = useState('');
  const [laTruongDoan, setLaTruongDoan] = useState(true);

  // Assign GVHD/Advisor state
  const [activeGuideEnrollmentId, setActiveGuideEnrollmentId] = useState(null);
  const [guideLecturerId, setGuideLecturerId] = useState('');

  // Filtering states for registrations list
  const [selectedPlanId, setSelectedPlanId] = useState('All');
  const [selectedTripId, setSelectedTripId] = useState('All');
  const [selectedRegStatus, setSelectedRegStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Image/Scan modal details
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);
  const [selectedProofReason, setSelectedProofReason] = useState('');
  const [selectedProofStudent, setSelectedProofStudent] = useState('');

  // UI feedback states
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(1);

  useEffect(() => {
    fetchData();
    // Fetch logged in user ID to pass as approver
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed.user && parsed.user.id) {
          setCurrentUserId(parsed.user.id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      // Load trips
      const tRes = await khoaApi.getTrips(); 
      setTrips(tRes.data);

      // Load plans/schedules
      const sRes = await khoaApi.getSchedules(); 
      setSchedules(sRes.data);

      // Load factories (only active ones)
      const fRes = await khoaApi.getFactories(); 
      setFactories(fRes.data.filter(x => x.trang_thai === 'HoatDong'));

      // Load lecturers
      const lRes = await khoaApi.getLecturers(); 
      setLecturers(lRes.data);

      // Load students
      const svRes = await khoaApi.getStudents(); 
      setStudents(svRes.data);

      // Load registrations (cancellations can be extracted from here)
      const regRes = await khoaApi.getRegistrations();
      setRegistrations(regRes.data);

      // Load refund requests
      const refRes = await khoaApi.getRefundRequests();
      setRefundRequests(refRes.data);

      // Load cohort enrollments for GVHD mapping
      // If we don't have a direct endpoint, let's extract students in active schedules
      const tempEnrollments = [];
      // To simulate cohort enrollment list matching plans
      svRes.data.forEach((sv, index) => {
        // Map to a schedule
        const linkedSch = sRes.data[index % sRes.data.length];
        if (linkedSch) {
          tempEnrollments.push({
            id: sv.id, // using student ID as enrollment placeholder
            sinhVien: sv,
            lichKienTap: linkedSch,
          });
        }
      });
      setEnrollments(tempEnrollments);

    } catch (err) {
      console.error(err);
      setError('Lỗi khi đồng bộ cơ sở dữ liệu từ backend.');
    }
  };

  // Create Trip
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await khoaApi.createTrip({
        nha_may_id: Number(nhaMayId),
        lich_kien_tap_id: Number(lichId),
        ngay_tham_quan: ngayThamQuan,
        gio_bat_dau: gioBD,
        gio_ket_thuc: gioKT,
        hinh_thuc: hinhThuc,
        suc_chua: Number(sucChua),
        cach_to_chuc: 'DoKhoaToChuc',
      });
      setMessage('Tạo chuyến kiến tập chính thức thành công.');
      setNhaMayId(''); 
      setLichId(''); 
      setNgayThamQuan(''); 
      setGioBD(''); 
      setGioKT(''); 
      setSucChua('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Tạo chuyến tham quan thất bại.');
    }
  };

  // Run priority allocation and freeze trip
  const handleFilterAssign = async (tripId) => {
    setMessage('');
    setError('');
    if (!window.confirm('Hành động này sẽ thực hiện bộ lọc tự động 3 tầng ưu tiên, khóa danh sách và chốt sĩ số. Bạn có muốn tiếp tục?')) {
      return;
    }
    try {
      const res = await khoaApi.filterAssignStudents({ tripId });
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Lọc danh sách tự động thất bại.');
    }
  };

  // Assign GVDD (lead lecturer)
  const handleAssignLeader = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await khoaApi.assignGvdd({
        tripId: activeLeaderTripId,
        lecturerId: Number(leaderLecturerId),
        laTruongDoan,
      });
      setMessage('Phân công Giảng viên dẫn đoàn thành công.');
      setActiveLeaderTripId(null);
      setLeaderLecturerId('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Phân công giảng viên dẫn đoàn thất bại.');
    }
  };

  // Assign GVHD (Advisor / Mentor)
  const handleAssignGuide = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await khoaApi.assignGvhd({
        lichKienTapSinhVienId: activeGuideEnrollmentId,
        lecturerId: Number(guideLecturerId),
      });
      setMessage('Phân công Giảng viên hướng dẫn học phần thành công.');
      setActiveGuideEnrollmentId(null);
      setGuideLecturerId('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Phân công giảng viên hướng dẫn thất bại.');
    }
  };

  // Approve cancel request
  const handleApproveCancel = async (requestId, isApproved) => {
    setMessage('');
    setError('');
    try {
      const res = await khoaApi.approveCancel({
        requestId,
        approverId: currentUserId,
        isApproved,
      });
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Không thể xử lý yêu cầu hủy.');
    }
  };

  // Approve refund request
  const handleApproveRefund = async (refundId, isApproved) => {
    setMessage('');
    setError('');
    try {
      const res = await khoaApi.approveRefund({
        refundId,
        approverId: currentUserId,
        isApproved,
      });
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Không thể xử lý phê duyệt hoàn phí.');
    }
  };

  // Filters logic for student registrations list
  const filteredRegs = registrations.filter(r => {
    const matchesPlan = selectedPlanId === 'All' || String(r.chuyenThamQuan?.lich_kien_tap_id) === selectedPlanId;
    const matchesTrip = selectedTripId === 'All' || String(r.chuyen_tham_quan_id) === selectedTripId;
    const matchesStatus = selectedRegStatus === 'All' || r.trang_thai === selectedRegStatus;
    const matchesSearch = r.sinhVien?.ho_ten.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.sinhVien?.mssv.includes(searchQuery) ||
                          (r.sinhVien?.ten_lop && r.sinhVien.ten_lop.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPlan && matchesTrip && matchesStatus && matchesSearch;
  });

  // Filter registrations that have pending cancellation requests
  const pendingCancelRegs = registrations.filter(r => r.yeuCauHuy && r.yeuCauHuy.trang_thai_duyet === 'ChoDuyet');

  // Filter pending refund requests
  const pendingRefunds = refundRequests.filter(ref => ref.trang_thai === 'ChoXuLy');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Hoạt động & Đăng ký</h2>
        <p className="text-slate-500 text-sm">Lập chuyến kiến tập, kiểm soát danh sách sinh viên đăng ký, duyệt hồ sơ hủy/hoàn phí và phân công nhân sự dẫn đoàn.</p>
      </div>

      {/* Alert Banners */}
      {message && (
        <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
          <Check size={16} />
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="border-b border-slate-200 flex flex-wrap gap-1">
        <button 
          onClick={() => setActiveTab('trips')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-2 ${
            activeTab === 'trips' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-55'
          }`}
        >
          <Compass size={14} />
          Chuyến đi & Lọc tự động ({trips.length})
        </button>

        <button 
          onClick={() => setActiveTab('registrations')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-2 ${
            activeTab === 'registrations' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-55'
          }`}
        >
          <Users size={14} />
          Danh sách đăng ký ({registrations.length})
        </button>

        <button 
          onClick={() => setActiveTab('cancels')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-2 ${
            activeTab === 'cancels' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-55'
          }`}
        >
          <AlertCircle size={14} />
          Duyệt minh chứng hủy
          {pendingCancelRegs.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
              {pendingCancelRegs.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('refunds')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-2 ${
            activeTab === 'refunds' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-55'
          }`}
        >
          <DollarSign size={14} />
          Duyệt hoàn lệ phí
          {pendingRefunds.length > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              {pendingRefunds.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('gvhd')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-2 ${
            activeTab === 'gvhd' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-55'
          }`}
        >
          <UserCheck size={14} />
          Phân bổ GVHD (Cố vấn)
        </button>
      </div>

      {/* TAB: Trips Manager */}
      {activeTab === 'trips' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Trip Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 text-xs">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <PlusCircle size={15} className="text-indigo-600" />
              Thiết lập chuyến tham quan mới
            </h3>
            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doanh nghiệp / Nhà máy đối tác</label>
                <select required value={nhaMayId} onChange={e => setNhaMayId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                  <option value="">-- Chọn doanh nghiệp --</option>
                  {factories.map(f => <option key={f.id} value={f.id}>{f.ten_nha_may}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kế hoạch đợt học áp dụng</label>
                <select required value={lichId} onChange={e => setLichId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                  <option value="">-- Chọn kế hoạch lớp --</option>
                  {schedules.map(s => <option key={s.id} value={s.id}>{s.ten_lich}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngày diễn ra tham quan</label>
                <input type="date" required value={ngayThamQuan} onChange={e => setNgayThamQuan(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giờ bắt đầu</label>
                  <input type="time" required value={gioBD} onChange={e => setGioBD(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giờ kết thúc</label>
                  <input type="time" required value={gioKT} onChange={e => setGioKT(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hình thức</label>
                  <select value={hinhThuc} onChange={e => setHinhThuc(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                    <option value="TrucTiep">Trực tiếp (Offline)</option>
                    <option value="TrucTuyen">Trực tuyến (Online)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sức chứa tối đa (Chỗ)</label>
                  <input type="number" required value={sucChua} onChange={e => setSucChua(e.target.value)} placeholder="Ví dụ: 40" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold transition-all shadow-sm">
                Xác nhận tạo chuyến đi
              </button>
            </form>
          </div>

          {/* Trips list */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Hàng đợi điều phối các chuyến tham quan</span>
              <span className="bg-indigo-55 text-indigo-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                {trips.length} chuyến đi
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-500 font-bold text-left">
                  <tr>
                    <th className="px-4 py-3">Doanh nghiệp</th>
                    <th className="px-4 py-3">Lịch kế hoạch</th>
                    <th className="px-4 py-3">Sức chứa</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Điều hành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {trips.map(t => {
                    const activeCount = registrations.filter(r => r.chuyen_tham_quan_id === t.id && (r.trang_thai === 'HopLe' || r.trang_thai === 'DaThamGia')).length;
                    const pendingCount = registrations.filter(r => r.chuyen_tham_quan_id === t.id && r.trang_thai === 'ChoDuyet').length;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{t.nhaMay?.ten_nha_may}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN')} ({t.gio_bat_dau.slice(0, 5)} - {t.gio_ket_thuc.slice(0, 5)})
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-medium">
                          {t.lichKienTap?.ten_lich}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {activeCount} / {t.suc_chua}
                          {pendingCount > 0 && (
                            <span className="text-[10px] text-amber-500 block font-normal">
                              +{pendingCount} chờ duyệt
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            t.trang_thai === 'DaChotDanhSach' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                            {t.trang_thai === 'DaChotDanhSach' ? 'Đã chốt DS' : 'Mở đăng ký'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          {t.trang_thai === 'MoDangKy' && (
                            <button 
                              onClick={() => handleFilterAssign(t.id)} 
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded font-bold shadow-sm"
                              title="Áp dụng bộ lọc 3 tầng và chốt"
                            >
                              Lọc & Chốt
                            </button>
                          )}
                          <button 
                            onClick={() => { setActiveLeaderTripId(t.id); setLeaderLecturerId(''); }} 
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded font-bold"
                          >
                            Phân GVDD
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Registrations list */}
      {activeTab === 'registrations' && (
        <div className="space-y-4 text-xs">
          {/* Filters controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Chọn kế hoạch lớp:</label>
              <select 
                value={selectedPlanId} 
                onChange={(e) => {
                  setSelectedPlanId(e.target.value);
                  setSelectedTripId('All');
                }}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All">Tất cả đợt</option>
                {schedules.map(s => (
                  <option key={s.id} value={s.id}>{s.ten_lich}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Chọn chuyến đi:</label>
              <select 
                value={selectedTripId} 
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All">Tất cả chuyến</option>
                {trips
                  .filter(t => selectedPlanId === 'All' || String(t.lich_kien_tap_id) === selectedPlanId)
                  .map(t => (
                    <option key={t.id} value={t.id}>{t.nhaMay?.ten_nha_may}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Trạng thái hồ sơ:</label>
              <select 
                value={selectedRegStatus} 
                onChange={(e) => setSelectedRegStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="ChoDuyet">Chờ duyệt</option>
                <option value="HopLe">Hợp lệ / Đã duyệt</option>
                <option value="BiLoai">Bị loại</option>
                <option value="DaHuy">Đã hủy</option>
                <option value="DaThamGia">Đã tham gia</option>
                <option value="VangMat">Vắng mặt</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Tìm kiếm sinh viên:</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={13} />
                </span>
                <input 
                  type="text" 
                  placeholder="Nhập MSSV, Lớp, Họ tên..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Main Registrations Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 pl-4">Sinh viên (MSSV)</th>
                    <th className="p-3">Lớp học</th>
                    <th className="p-3">Doanh nghiệp đăng ký</th>
                    <th className="p-3">Thời gian đăng ký</th>
                    <th className="p-3">Lệ phí</th>
                    <th className="p-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRegs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">Không tìm thấy bản ghi đăng ký nào khớp bộ lọc</td>
                    </tr>
                  ) : (
                    filteredRegs.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/30">
                        <td className="p-3 pl-4">
                          <span className="font-bold text-slate-800 block">{reg.sinhVien?.ho_ten}</span>
                          <span className="font-mono text-[10px] text-slate-400 block">{reg.sinhVien?.mssv}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-600">{reg.sinhVien?.ten_lop}</td>
                        <td className="p-3">
                          <span className="font-medium text-slate-800 block">{reg.chuyenThamQuan?.nhaMay?.ten_nha_may}</span>
                          <span className="text-[10px] text-slate-400 block">Hình thức: {reg.chuyenThamQuan?.hinh_thuc}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{new Date(reg.ngay_dang_ky).toLocaleString('vi-VN')}</td>
                        <td className="p-3">
                          {reg.hoaDon?.trang_thai === 'DaDongDungHan' && (
                            <span className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 border border-emerald-100 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              Đã nộp
                            </span>
                          )}
                          {reg.hoaDon?.trang_thai === 'DaHoanPhi' && (
                            <span className="inline-flex items-center gap-0.5 text-slate-500 bg-slate-50 border border-slate-100 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              Đã hoàn phí
                            </span>
                          )}
                          {(!reg.hoaDon || reg.hoaDon?.trang_thai === 'ChuaDong') && (
                            <span className="inline-flex items-center gap-0.5 text-rose-500 bg-rose-50 border border-rose-100 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                              Chưa đóng
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            reg.trang_thai === 'HopLe' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                            reg.trang_thai === 'ChoDuyet' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                            reg.trang_thai === 'DaHuy' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                            'bg-rose-50 text-rose-700 border border-rose-150'
                          }`}>
                            {reg.trang_thai === 'HopLe' ? 'Đã duyệt / Hợp lệ' :
                             reg.trang_thai === 'ChoDuyet' ? 'Chờ duyệt' :
                             reg.trang_thai === 'DaHuy' ? 'Đã hủy' : 'Bị loại / Khác'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Cancel Approvals */}
      {activeTab === 'cancels' && (
        <div className="space-y-4 text-xs">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-950">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Danh sách yêu cầu hủy chuyến kèm minh chứng</p>
              <p className="text-slate-600 mt-0.5">Sinh viên hủy chuyến bắt buộc phải nộp minh chứng (lịch trùng lịch thi, giấy ốm đau...). Khoa cần duyệt để giải phóng chỗ cho sinh viên khác và kích hoạt luồng hoàn trả lệ phí.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Hàng đợi xét duyệt hồ sơ hủy ({pendingCancelRegs.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingCancelRegs.length === 0 ? (
                <div className="p-12 text-center text-slate-400">Hiện tại không có minh chứng hủy chuyến nào cần phê duyệt</div>
              ) : (
                pendingCancelRegs.map((reg) => (
                  <div key={reg.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{reg.sinhVien?.ho_ten}</span>
                        <span className="font-mono text-xs text-slate-500">({reg.sinhVien?.mssv})</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">{reg.sinhVien?.ten_lop}</span>
                      </div>
                      <p className="text-xs text-slate-700">
                        Chuyến kiến tập: <strong className="text-slate-850">{reg.chuyenThamQuan?.nhaMay?.ten_nha_may}</strong>
                      </p>
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 border border-slate-150 rounded-lg mt-2">
                        Lý do báo hủy: "{reg.yeuCauHuy?.ly_do || 'Không cung cấp lý do cụ thể'}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {reg.yeuCauHuy?.file_minh_chung && (
                        <button 
                          onClick={() => {
                            setSelectedProofUrl(reg.yeuCauHuy.file_minh_chung);
                            setSelectedProofReason(reg.yeuCauHuy.ly_do);
                            setSelectedProofStudent(`${reg.sinhVien?.ho_ten} (${reg.sinhVien?.mssv})`);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1"
                        >
                          <FileText size={14} /> Xem minh chứng
                        </button>
                      )}
                      <button 
                        onClick={() => handleApproveCancel(reg.yeuCauHuy.id, true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Check size={14} /> Đồng ý hủy
                      </button>
                      <button 
                        onClick={() => handleApproveCancel(reg.yeuCauHuy.id, false)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg flex items-center gap-1 border border-rose-100"
                      >
                        <X size={14} /> Từ chối
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Refund Approvals */}
      {activeTab === 'refunds' && (
        <div className="space-y-4 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-950">
            <DollarSign size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Danh sách đơn xin hoàn phí của sinh viên</p>
              <p className="text-slate-600 mt-0.5">Sinh viên nộp đơn xin hoàn lại khoản tiền đóng thừa/được miễn trừ do hủy chuyến hợp lệ đã được phê duyệt. Kiểm duyệt tệp đơn và xác nhận giải ngân.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Hàng đợi hoàn trả phí ({pendingRefunds.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingRefunds.length === 0 ? (
                <div className="p-12 text-center text-slate-400">Không có đơn yêu cầu hoàn phí nào chờ xử lý</div>
              ) : (
                pendingRefunds.map((ref) => (
                  <div key={ref.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-55">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{ref.hoaDon?.phieuDangKy?.sinhVien?.ho_ten}</span>
                        <span className="font-mono text-slate-500">({ref.hoaDon?.phieuDangKy?.sinhVien?.mssv})</span>
                      </div>
                      <p className="text-slate-700">
                        Chuyến đi: <strong className="text-slate-850">{ref.hoaDon?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may}</strong>
                      </p>
                      <p className="text-slate-700">
                        Số tiền hoàn: <strong className="text-emerald-600 font-bold">{Number(ref.hoaDon?.so_tien).toLocaleString('vi-VN')} VND</strong>
                      </p>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Nộp đơn ngày: {new Date(ref.ngay_nop).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {ref.file_don_da_duyet && (
                        <a 
                          href={ref.file_don_da_duyet} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1"
                        >
                          <FileText size={14} /> File đơn scan
                        </a>
                      )}
                      <button 
                        onClick={() => handleApproveRefund(ref.id, true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Check size={14} /> Phê duyệt hoàn phí
                      </button>
                      <button 
                        onClick={() => handleApproveRefund(ref.id, false)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg flex items-center gap-1 border border-rose-100"
                      >
                        <X size={14} /> Từ chối
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: GVHD Advisor Allocation */}
      {activeTab === 'gvhd' && (
        <div className="space-y-4 text-xs">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 text-indigo-950">
            <UserCheck size={20} className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Phân công Giảng viên hướng dẫn học phần (GVHD)</p>
              <p className="text-slate-600 mt-0.5">Phân bổ giảng viên cố vấn hỗ trợ chuyên môn cho sinh viên trong suốt học kỳ kiến tập. Giảng viên sẽ là người chấm điểm chuyên cần chuẩn bị và phê duyệt kết quả cuối cùng.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-250">
                <thead className="bg-slate-50 text-slate-600 font-bold text-left">
                  <tr>
                    <th className="px-4 py-3 pl-6">MSSV</th>
                    <th className="px-4 py-3">Họ tên sinh viên</th>
                    <th className="px-4 py-3">Lớp học</th>
                    <th className="px-4 py-3">Lịch học phần</th>
                    <th className="px-4 py-3 text-right pr-6">Phân bổ giảng viên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {enrollments.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 pl-6 font-mono text-slate-500 font-semibold">{e.sinhVien?.mssv}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{e.sinhVien?.ho_ten}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{e.sinhVien?.ten_lop}</td>
                      <td className="px-4 py-3 text-slate-500">{e.lichKienTap?.ten_lich}</td>
                      <td className="px-4 py-3 text-right pr-6">
                        <button 
                          onClick={() => { setActiveGuideEnrollmentId(e.id); setGuideLecturerId(''); }} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                        >
                          Phân GVHD
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign GVDD Leader */}
      {activeLeaderTripId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Phân công Giảng viên dẫn đoàn</h4>
              <button onClick={() => setActiveLeaderTripId(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>
            <form onSubmit={handleAssignLeader} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn giảng viên dẫn đoàn</label>
                <select required value={leaderLecturerId} onChange={e => setLeaderLecturerId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none">
                  <option value="">-- Chọn giảng viên --</option>
                  {lecturers.map(gv => <option key={gv.id} value={gv.id}>{gv.ho_ten} ({gv.ma_gv})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vai trò trong đoàn</label>
                <select value={laTruongDoan ? 'true' : 'false'} onChange={e => setLaTruongDoan(e.target.value === 'true')} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                  <option value="true">Trưởng đoàn dẫn đường</option>
                  <option value="false">Phó đoàn hỗ trợ</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveLeaderTripId(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Lưu phân công</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign GVHD Guide */}
      {activeGuideEnrollmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Chỉ định Giảng viên hướng dẫn (GVHD)</h4>
              <button onClick={() => setActiveGuideEnrollmentId(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>
            <form onSubmit={handleAssignGuide} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn giảng viên cố vấn</label>
                <select required value={guideLecturerId} onChange={e => setGuideLecturerId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none">
                  <option value="">-- Chọn giảng viên --</option>
                  {lecturers.map(gv => <option key={gv.id} value={gv.id}>{gv.ho_ten} ({gv.ma_gv})</option>)}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveGuideEnrollmentId(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Lưu chỉ định</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Cancellation Scan Receipt */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Xem tài liệu minh chứng hủy</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Đối chiếu thông tin xin phép vắng mặt</p>
              </div>
              <button onClick={() => setSelectedProofUrl(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <span className="text-slate-400 font-semibold block">Sinh viên nộp:</span>
                <span className="text-slate-800 font-bold block text-sm">{selectedProofStudent}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Lý do báo cáo:</span>
                <p className="text-slate-750 bg-slate-50 p-3 border border-slate-200 rounded-lg italic">
                  "{selectedProofReason}"
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-1.5">Tệp scan đính kèm:</span>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-100 flex flex-col items-center justify-center min-h-[160px] text-center border-dashed">
                  <FileText size={44} className="text-indigo-600 mb-2" />
                  <span className="text-xs font-mono font-bold text-slate-800">{selectedProofUrl}</span>
                  <a 
                    href={selectedProofUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="mt-3 px-3 py-1 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 shadow-sm"
                  >
                    Mở tệp trong tab mới
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
