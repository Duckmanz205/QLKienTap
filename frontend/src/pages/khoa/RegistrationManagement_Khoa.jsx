import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';
import { 
  FileCheck, Search, Filter, Check, X, Eye, 
  DollarSign, AlertTriangle, FileText, CheckCircle2 
} from 'lucide-react';

export default function RegistrationManagement_Khoa() {
  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' | 'cancels' | 'refunds'
  const [registrations, setRegistrations] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [trips, setTrips] = useState([]);

  // Filtering states
  const [selectedPlanId, setSelectedPlanId] = useState('All');
  const [selectedTripId, setSelectedTripId] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for view proof
  const [selectedProof, setSelectedProof] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(1);

  useEffect(() => {
    fetchData();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed.user?.id) {
          setCurrentUserId(parsed.user.id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      const reg = await khoaApi.getRegistrations(); setRegistrations(reg.data);
      const ref = await khoaApi.getRefundRequests(); setRefundRequests(ref.data);
      const sch = await khoaApi.getSchedules(); setSchedules(sch.data);
      const t = await khoaApi.getTrips(); setTrips(t.data);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải dữ liệu đăng ký');
    }
  };

  const handleApproveCancel = async (requestId, isApproved) => {
    try {
      setError('');
      setMessage('');
      const res = await khoaApi.approveCancel({
        requestId,
        approverId: currentUserId,
        isApproved,
      });
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Hành động duyệt yêu cầu hủy thất bại');
    }
  };

  const handleApproveRefund = async (refundId, isApproved) => {
    try {
      setError('');
      setMessage('');
      const res = await khoaApi.approveRefund({
        refundId,
        approverId: currentUserId,
        isApproved,
      });
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Hành động duyệt hoàn phí thất bại');
    }
  };

  const handleUpdatePaymentStatus = async (regId, isPaid) => {
    try {
      setError('');
      setMessage('');
      await khoaApi.approveTrip({
        registrationId: regId,
        vaiTroNguoiDuyet: 'Khoa',
        hanhDong: isPaid ? 'DuyetThanhToan' : 'TuChoiThanhToan',
      });
      setMessage('Cập nhật trạng thái thanh toán thành công.');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Không thể cập nhật trạng thái thanh toán.');
    }
  };

  // Filter registrations
  const filteredRegs = registrations.filter(r => {
    const matchesPlan = selectedPlanId === 'All' || String(r.chuyenThamQuan?.lich_kien_tap_id) === selectedPlanId;
    const matchesTrip = selectedTripId === 'All' || String(r.chuyen_tham_quan_id) === selectedTripId;
    const matchesStatus = selectedStatus === 'All' || r.trang_thai === selectedStatus;
    const matchesSearch = r.sinhVien?.ho_ten.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.sinhVien?.mssv.includes(searchQuery) ||
                          (r.sinhVien?.ten_lop && r.sinhVien.ten_lop.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPlan && matchesTrip && matchesStatus && matchesSearch;
  });

  const pendingCancels = registrations.filter(r => r.yeuCauHuy && r.yeuCauHuy.trang_thai_duyet === 'ChoDuyet');
  const allRefunds = refundRequests;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileCheck className="text-primary w-6 h-6" />
          Quản lý Đăng ký & Học phí
        </h2>
        <p className="text-slate-500 text-sm">Phê duyệt hồ sơ đăng ký kiến tập, xác nhận lệ phí, xử lý đơn hủy chuyến và yêu cầu hoàn phí</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-500/30 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-500/30 text-rose-800 px-4 py-3 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'registrations' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Danh sách Đăng ký ({filteredRegs.length})
        </button>
        <button
          onClick={() => setActiveTab('cancels')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'cancels' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Yêu cầu Hủy chuyến ({pendingCancels.length})
          {pendingCancels.length > 0 && (
            <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {pendingCancels.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'refunds' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Yêu cầu Hoàn phí ({allRefunds.filter(r => r.trang_thai === 'ChoXuLy').length})
          {allRefunds.filter(r => r.trang_thai === 'ChoXuLy').length > 0 && (
            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {allRefunds.filter(r => r.trang_thai === 'ChoXuLy').length}
            </span>
          )}
        </button>
      </div>

      {/* Tabs Content */}
      {activeTab === 'registrations' && (
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1">Đợt/Lịch kiến tập</label>
              <select
                value={selectedPlanId}
                onChange={e => setSelectedPlanId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
              >
                <option value="All">Tất cả lịch</option>
                {schedules.map(sch => (
                  <option key={sch.id} value={sch.id}>{sch.ten_lich}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Chuyến tham quan</label>
              <select
                value={selectedTripId}
                onChange={e => setSelectedTripId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
              >
                <option value="All">Tất cả chuyến</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nhaMay?.ten_nha_may} ({new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN')})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Trạng thái đăng ký</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="ChoDuyet">Chờ duyệt học phí</option>
                <option value="DaDangKy">Đã đăng ký (Chờ lọc)</option>
                <option value="ChinhThuc">Chính thức tham gia</option>
                <option value="DaHuy">Đã hủy</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Tìm kiếm sinh viên</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tên, MSSV, Lớp..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="bg-[#f8faf1] text-slate-700 font-bold text-left">
                  <th className="px-4 py-3 rounded-l-xl">Sinh viên</th>
                  <th className="px-4 py-3">Lớp học</th>
                  <th className="px-4 py-3">Chuyến tham quan</th>
                  <th className="px-4 py-3">Lệ phí</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 rounded-r-xl text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold">
                {filteredRegs.map(r => {
                  let statusClass = 'bg-slate-50 text-slate-600 border-slate-200/50';
                  let statusLabel = r.trang_thai;
                  if (r.trang_thai === 'ChoDuyet') {
                    statusLabel = 'Chờ duyệt học phí';
                    statusClass = 'bg-amber-50 text-amber-700 border-amber-250/50';
                  } else if (r.trang_thai === 'DaDangKy') {
                    statusLabel = 'Đăng ký tạm';
                    statusClass = 'bg-blue-50 text-blue-700 border-blue-250/50';
                  } else if (r.trang_thai === 'ChinhThuc') {
                    statusLabel = 'Chính thức';
                    statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-250/50';
                  } else if (r.trang_thai === 'DaHuy') {
                    statusLabel = 'Đã hủy';
                    statusClass = 'bg-rose-50 text-rose-700 border-rose-250/50';
                  }

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{r.sinhVien?.ho_ten}</div>
                        <div className="text-[10px] text-slate-400">MSSV: {r.sinhVien?.mssv}</div>
                      </td>
                      <td className="px-4 py-3.5">{r.sinhVien?.ten_lop}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{r.chuyenThamQuan?.nhaMay?.ten_nha_may}</div>
                        <div className="text-[10px] text-slate-400">
                          {r.chuyenThamQuan?.ngay_tham_quan && new Date(r.chuyenThamQuan.ngay_tham_quan).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className={r.le_phi_da_dong > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            Đã đóng: {Number(r.le_phi_da_dong).toLocaleString('vi-VN')}đ
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Còn nợ: {Number(r.le_phi_con_no).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {r.trang_thai === 'ChoDuyet' && (
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleUpdatePaymentStatus(r.id, true)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded-lg transition-colors cursor-pointer"
                              title="Duyệt thanh toán"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdatePaymentStatus(r.id, false)}
                              className="bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-lg transition-colors cursor-pointer"
                              title="Từ chối"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {r.trang_thai !== 'ChoDuyet' && (
                          <span className="text-slate-400 text-[10px]">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredRegs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400 font-medium">
                      Không tìm thấy bản ghi đăng ký nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cancels' && (
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="text-amber-500 w-4 h-4" />
            Danh sách yêu cầu hủy chuyến của sinh viên
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="bg-[#f8faf1] text-slate-700 font-bold text-left">
                  <th className="px-4 py-3 rounded-l-xl">Sinh viên</th>
                  <th className="px-4 py-3">Lớp học</th>
                  <th className="px-4 py-3">Lý do hủy</th>
                  <th className="px-4 py-3">Minh chứng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 rounded-r-xl text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold">
                {pendingCancels.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">{r.sinhVien?.ho_ten}</div>
                      <div className="text-[10px] text-slate-400">MSSV: {r.sinhVien?.mssv}</div>
                    </td>
                    <td className="px-4 py-3.5">{r.sinhVien?.ten_lop}</td>
                    <td className="px-4 py-3.5 text-slate-700">{r.yeuCauHuy?.ly_do}</td>
                    <td className="px-4 py-3.5">
                      {r.yeuCauHuy?.minh_chung_url ? (
                        <button
                          onClick={() => setSelectedProof(r.yeuCauHuy.minh_chung_url)}
                          className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem ảnh
                        </button>
                      ) : (
                        <span className="text-slate-450 font-medium italic">Không có</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full border text-[10px] bg-amber-50 text-amber-700 border-amber-250/50">
                        Chờ duyệt
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleApproveCancel(r.yeuCauHuy.id, true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Duyệt
                        </button>
                        <button
                          onClick={() => handleApproveCancel(r.yeuCauHuy.id, false)}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingCancels.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400 font-medium">
                      Không có yêu cầu hủy nào đang chờ duyệt
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'refunds' && (
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <DollarSign className="text-emerald-600 w-4 h-4" />
            Danh sách yêu cầu hoàn lệ phí đăng ký
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="bg-[#f8faf1] text-slate-700 font-bold text-left">
                  <th className="px-4 py-3 rounded-l-xl">Sinh viên</th>
                  <th className="px-4 py-3">Lý do hoàn phí</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Tài khoản nhận</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 rounded-r-xl text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold">
                {allRefunds.map(ref => {
                  let statusClass = 'bg-amber-50 text-amber-700 border-amber-250/50';
                  let statusLabel = 'Chờ xử lý';
                  if (ref.trang_thai === 'DaDuyet') {
                    statusLabel = 'Đã duyệt';
                    statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-250/50';
                  } else if (ref.trang_thai === 'TuChoi') {
                    statusLabel = 'Từ chối';
                    statusClass = 'bg-rose-50 text-rose-700 border-rose-250/50';
                  }

                  return (
                    <tr key={ref.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{ref.sinhVien?.ho_ten}</div>
                        <div className="text-[10px] text-slate-400">MSSV: {ref.sinhVien?.mssv}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{ref.ly_do_hoan_tien}</td>
                      <td className="px-4 py-3.5 text-emerald-600 font-bold">
                        {Number(ref.so_tien_hoan_tra).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3.5">
                        <div>STK: {ref.so_tai_khoan}</div>
                        <div className="text-[10px] text-slate-400">{ref.ten_ngan_hang} - {ref.ten_chu_tai_khoan}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {ref.trang_thai === 'ChoXuLy' ? (
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleApproveRefund(ref.id, true)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleApproveRefund(ref.id, false)}
                              className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Đã xong</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {allRefunds.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400 font-medium">
                      Không có yêu cầu hoàn phí nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal view image proof */}
      {selectedProof && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Hình ảnh Minh chứng Vắng mặt</h3>
              <button
                onClick={() => setSelectedProof(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center bg-slate-50 p-2 rounded-xl border border-slate-100">
              <img
                src={selectedProof}
                alt="Minh chứng"
                className="max-h-[350px] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x300/e2e8f0/475569?text=Minh+Ch%E1%BB%A9ng+Kh%C3%B4ng+T%E1%BB%93n+T%E1%BA%A1i';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
