import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Clock, 
  Laptop, 
  Users, 
  Trash2, 
  Check, 
  AlertTriangle,
  Info,
  Building,
  Plus
} from 'lucide-react';
import { sinhVienApi, khoaApi } from '../../services/api';

export default function ChuyenThamQuan_DanhSachDangKy() {
  const [student, setStudent] = useState(null);
  const [registeredTrips, setRegisteredTrips] = useState([]);
  const [availableTrips, setAvailableTrips] = useState([]);
  const [factories, setFactories] = useState([]);
  
  const [subTab, setSubTab] = useState('available');
  const [showProposalModal, setShowProposalModal] = useState(false);

  // Proposal Form State
  const [factoryId, setFactoryId] = useState('');
  const [ngayThamQuan, setNgayThamQuan] = useState('');
  const [gioBatDau, setGioBatDau] = useState('08:00');
  const [gioKetThuc, setGioKetThuc] = useState('11:30');
  const [hinhThuc, setHinhThuc] = useState('TrucTiep');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchData(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchData = async (svId) => {
    try {
      // 1. Fetch Registered
      const regRes = await sinhVienApi.getRegisteredTrips(svId);
      setRegisteredTrips(regRes.data);

      // 2. Fetch Available
      const avRes = await sinhVienApi.getAvailableTrips(svId);
      setAvailableTrips(avRes.data);

      // 3. Fetch Factories for Proposal
      const facRes = await sinhVienApi.getFactories();
      setFactories(facRes.data);
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  const handleRegister = async (trip) => {
    setMessage('');
    setError('');
    try {
      const res = await sinhVienApi.registerTrip(student.id, trip.id);
      setMessage(res.data.message);
      fetchData(student.id);
      setSubTab('registered');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký chuyến đi thất bại.');
    }
  };

  const handleCancelRegistration = async (phieuId) => {
    const lyDo = prompt('Vui lòng nhập lý do hủy đăng ký:');
    if (lyDo === null) return; // User cancelled prompt
    if (!lyDo.trim()) {
      alert('Lý do hủy là bắt buộc!');
      return;
    }

    setMessage('');
    setError('');
    try {
      const res = await sinhVienApi.requestCancel({
        studentId: student.id,
        phieuId,
        lyDo
      });
      setMessage(res.data.message);
      fetchData(student.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Yêu cầu hủy đăng ký thất bại.');
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!factoryId || !ngayThamQuan) {
      alert('Vui lòng chọn Nhà máy và Ngày đề xuất.');
      return;
    }

    setMessage('');
    setError('');
    try {
      const res = await sinhVienApi.proposeTrip({
        studentId: student.id,
        nhaMayId: Number(factoryId),
        ngayThamQuan: new Date(ngayThamQuan),
        gioBatDau,
        gioKetThuc,
        hinhThuc
      });
      setMessage(res.data.message);
      setShowProposalModal(false);
      // Reset form
      setFactoryId('');
      setNgayThamQuan('');
      setGioBatDau('08:00');
      setGioKetThuc('11:30');
      setHinhThuc('TrucTiep');
      fetchData(student.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Đề xuất chuyến đi thất bại.');
    }
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải danh sách chuyến đi...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header with Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Chuyến tham quan</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Đăng ký tham gia các chuyến kiến tập bổ ích hoặc đề xuất chuyến đi tự do để học hỏi.
          </p>
        </div>
        <button 
          onClick={() => setShowProposalModal(true)}
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs tracking-wider uppercase shadow-md hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Đề xuất chuyến đi</span>
        </button>
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

      {/* Tabs */}
      <div className="flex gap-8 border-b border-surface-variant/60 relative z-10">
        <button 
          onClick={() => setSubTab('available')}
          className={`relative pb-3 font-bold text-md transition-colors cursor-pointer ${
            subTab === 'available' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Có thể đăng ký</span>
          {subTab === 'available' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
          )}
        </button>
        <button 
          onClick={() => setSubTab('registered')}
          className={`relative pb-3 font-bold text-md transition-colors cursor-pointer ${
            subTab === 'registered' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Đã đăng ký ({registeredTrips.length})</span>
          {subTab === 'registered' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Available Trips Tab */}
      {subTab === 'available' && (
        <div className="relative z-10 animate-fade-in">
          {availableTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-outline-variant p-12 text-center max-w-lg mx-auto mt-6">
              <Compass className="w-16 h-16 text-outline/40 mx-auto mb-4" />
              <p className="text-lg font-bold text-on-surface">Không còn chuyến đi nào khả dụng</p>
              <p className="text-sm text-on-surface-variant mt-2">
                Hiện tại không có chuyến kiến tập nào mở đăng ký phù hợp với bạn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTrips.map((trip) => {
                const isOnline = trip.hinh_thuc === 'TrucTuyen';
                const isFull = trip.suc_chua !== null && trip.registeredCount >= trip.suc_chua;
                const slotsRemaining = trip.suc_chua - trip.registeredCount;

                return (
                  <div 
                    key={trip.id} 
                    className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img 
                        src={`https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60`} 
                        alt={trip.nhaMay?.ten_nha_may} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 bg-secondary text-white`}>
                          {isOnline ? <Laptop className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                          <span>{isOnline ? 'Trực tuyến' : 'Trực tiếp'}</span>
                        </span>
                        {slotsRemaining <= 5 && slotsRemaining > 0 && (
                          <span className="px-3 py-1 bg-warning-yellow text-on-surface rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Sắp đầy</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-[#89b449] font-bold text-[10px] uppercase tracking-widest block mb-1">
                        {trip.cach_to_chuc === 'DoKhoaToChuc' ? 'Khoa tổ chức' : 'Tự do'}
                      </span>
                      <h3 className="font-black text-base text-on-surface mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                        {trip.nhaMay?.ten_nha_may}
                      </h3>

                      <div className="space-y-2 text-xs text-on-surface-variant font-semibold mb-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-outline" />
                          <span>{new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN')} | {trip.gio_bat_dau.slice(0, 5)} - {trip.gio_ket_thuc.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-outline shrink-0" />
                          <span className="truncate">{trip.nhaMay?.dia_chi}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-surface-variant flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <Users className="w-4.5 h-4.5 text-primary" />
                          <span className="text-xs font-bold">
                            {isFull ? (
                              <span className="text-[#ba1a1a]">Hết chỗ</span>
                            ) : (
                              `Còn ${slotsRemaining} chỗ`
                            )}
                          </span>
                        </div>
                        <span className="text-[11px] text-outline font-bold bg-[#f2f5ec] px-2.5 py-1 rounded-md">
                          Lệ phí: {trip.hinh_thuc === 'TrucTiep' ? '150k' : '50k'}
                        </span>
                      </div>

                      <button
                        disabled={isFull}
                        onClick={() => handleRegister(trip)}
                        className={`w-full mt-6 py-3 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isFull 
                            ? 'bg-gray-150 text-outline/50 cursor-not-allowed border border-gray-200'
                            : 'bg-primary-container text-on-primary-container hover:bg-primary shadow-sm active:scale-98'
                        }`}
                      >
                        <Compass className="w-4.5 h-4.5" />
                        <span>Đăng ký ngay</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Registered Trips Tab */}
      {subTab === 'registered' && (
        <div className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm overflow-hidden animate-fade-in relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-variant">
                  <th className="py-4 px-6">Nhà máy / Đối tác</th>
                  <th className="py-4 px-6">Ngày tham quan</th>
                  <th className="py-4 px-6">Hình thức</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold divide-y divide-slate-100">
                {registeredTrips.map((reg) => {
                  const isOnline = reg.chuyenThamQuan.hinh_thuc === 'TrucTuyen';
                  
                  // Status translation
                  let displayStatus = 'Chờ duyệt';
                  let badgeClass = 'bg-warning-yellow/15 text-yellow-700 border border-warning-yellow/40';
                  
                  if (reg.trang_thai === 'HopLe') {
                    displayStatus = 'Đã chốt / Hợp lệ';
                    badgeClass = 'bg-primary/10 text-primary border border-primary/20';
                  } else if (reg.trang_thai === 'DaThamGia' || reg.trang_thai === 'HoanThanh') {
                    displayStatus = 'Hoàn thành';
                    badgeClass = 'bg-secondary-container/40 text-[#446900] border border-secondary-container/60';
                  } else if (reg.trang_thai === 'YeuCauHuy') {
                    displayStatus = 'Chờ hủy';
                    badgeClass = 'bg-amber-100 text-amber-700 border border-amber-200';
                  } else if (reg.trang_thai === 'DaHuy') {
                    displayStatus = 'Đã hủy';
                    badgeClass = 'bg-red-50 text-red-700 border border-red-200';
                  }

                  const canCancel = reg.trang_thai === 'HopLe' || reg.trang_thai === 'ChoDuyet';

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f2f5ec] flex items-center justify-center text-primary shrink-0 shadow-inner">
                            <Building className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                            {reg.chuyenThamQuan.nhaMay?.ten_nha_may}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant font-medium">
                        {new Date(reg.chuyenThamQuan.ngay_tham_quan).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c0ef7c]/20 text-[#476d01]`}>
                          {isOnline ? 'Trực tuyến' : 'Trực tiếp'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
                          {(reg.trang_thai === 'DaThamGia' || reg.trang_thai === 'HoanThanh') && <Check className="w-3.5 h-3.5 mr-0.5" />}
                          <span>{displayStatus}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {canCancel ? (
                          <button
                            onClick={() => handleCancelRegistration(reg.id)}
                            className="text-red-550 hover:text-red-700 hover:underline inline-flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hủy đăng ký</span>
                          </button>
                        ) : (
                          <span className="text-outline/40 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suggest Destination Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-surface-variant animate-scale-up">
            <div className="p-6 bg-primary text-white flex justify-between items-center">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Compass className="w-5 h-5 text-white" />
                <span>Đề xuất chuyến đi tự do</span>
              </h3>
              <button 
                onClick={() => setShowProposalModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProposalSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Chọn nhà máy đề xuất <span className="text-red-500">*</span>
                </label>
                <select
                  value={factoryId}
                  onChange={(e) => setFactoryId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">-- Chọn Nhà máy --</option>
                  {factories.map((f) => (
                    <option key={f.id} value={f.id}>{f.ten_nha_may}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Ngày tham quan dự kiến <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={ngayThamQuan}
                  onChange={(e) => setNgayThamQuan(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                    Giờ bắt đầu
                  </label>
                  <input 
                    type="time" 
                    value={gioBatDau}
                    onChange={(e) => setGioBatDau(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                    Giờ kết thúc
                  </label>
                  <input 
                    type="time" 
                    value={gioKetThuc}
                    onChange={(e) => setGioKetThuc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Hình thức
                </label>
                <select 
                  value={hinhThuc}
                  onChange={(e) => setHinhThuc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none"
                >
                  <option value="TrucTiep">Trực tiếp</option>
                  <option value="TrucTuyen">Trực tuyến</option>
                </select>
              </div>

              <div className="pt-4 border-t border-surface-variant flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-[#ecefe6] rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-container shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Gửi đề xuất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
