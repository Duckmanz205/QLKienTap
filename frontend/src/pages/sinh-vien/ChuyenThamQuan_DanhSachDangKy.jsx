import React, { useState, useEffect } from 'react';
import { 
  MapPin, Laptop, Calendar, Clock, Image as ImageIcon, Users
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function ChuyenThamQuan_DanhSachDangKy() {
  const [activeTab, setActiveTab] = useState('coTheDangKy');
  const [student, setStudent] = useState(null);
  const [factories, setFactories] = useState([]);
  
  const [availableTrips, setAvailableTrips] = useState([]);
  const [registeredTrips, setRegisteredTrips] = useState([]);

  // Form states for Propose
  const [factoryId, setFactoryId] = useState('');
  const [ngayThamQuan, setNgayThamQuan] = useState('');
  const [gioBatDau, setGioBatDau] = useState('');
  const [gioKetThuc, setGioKetThuc] = useState('');
  const [hinhThuc, setHinhThuc] = useState('TrucTiep');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchData(res.data.id);
      }).catch(err => console.error(err));
    }
    sinhVienApi.getFactories().then(res => setFactories(res.data || [])).catch(err => console.error(err));
  }, []);

  const fetchData = async (svId) => {
    try {
      const [availRes, regRes] = await Promise.all([
        sinhVienApi.getAvailableTrips(svId),
        sinhVienApi.getRegisteredTrips(svId)
      ]);
      setAvailableTrips(availRes.data || []);
      setRegisteredTrips(regRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (tripId) => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng ký chuyến kiến tập này?")) return;
    try {
      await sinhVienApi.registerTrip(tripId);
      alert('Đăng ký thành công!');
      fetchData(student.id);
      setActiveTab('daDangKy');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    const reason = window.prompt("Nhập lý do hủy đăng ký:");
    if (!reason) return;
    try {
      await sinhVienApi.requestCancel({ dangKyId: registrationId, lyDo: reason });
      alert('Đã gửi yêu cầu hủy đăng ký');
      fetchData(student.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    try {
      await sinhVienApi.proposeTrip({
        nhaMayId: parseInt(factoryId),
        ngayThamQuan,
        gioBatDau,
        gioKetThuc,
        hinhThuc
      });
      alert('Đã gửi đề xuất chuyến đi tự do thành công!');
      setFactoryId('');
      setNgayThamQuan('');
      setGioBatDau('');
      setGioKetThuc('');
      setActiveTab('coTheDangKy');
      fetchData(student.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ChoDuyet':
      case 'ChoHuy':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status === 'ChoDuyet' ? 'Chờ duyệt' : 'Chờ hủy'}</span>;
      case 'HopLe':
      case 'DaThamGia':
      case 'HoanThanh':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status === 'HopLe' ? 'Hợp lệ' : (status === 'DaThamGia' ? 'Đã tham gia' : 'Hoàn thành')}</span>;
      case 'BiLoai':
      case 'VangMat':
      case 'KhongDat':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status === 'BiLoai' ? 'Bị loại' : (status === 'VangMat' ? 'Vắng mặt' : 'Không đạt')}</span>;
      case 'DaHuy':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Đã hủy</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Chuyến tham quan</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7E0C4] mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('coTheDangKy')}
          className={`px-6 py-3 font-bold text-sm transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === 'coTheDangKy' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Có thể đăng ký
          {activeTab === 'coTheDangKy' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] animate-in slide-in-from-left-4"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('daDangKy')}
          className={`px-6 py-3 font-bold text-sm transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === 'daDangKy' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Đã đăng ký
          {activeTab === 'daDangKy' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] animate-in slide-in-from-right-4"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('deXuatTuDo')}
          className={`px-6 py-3 font-bold text-sm transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === 'deXuatTuDo' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Đề xuất chuyến đi tự do
          {activeTab === 'deXuatTuDo' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] animate-in slide-in-from-right-4"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="relative z-10">
        
        {/* TAB 1: Có thể đăng ký */}
        {activeTab === 'coTheDangKy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {availableTrips.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-2xl border border-[#E7E0C4]">
                Hiện không có chuyến đi nào mở đăng ký.
              </div>
            ) : (
              availableTrips.map(trip => {
                const isOnline = trip.hinh_thuc === 'TrucTuyen';
                return (
                  <div key={trip.id} className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
                    {/* Image Placeholder */}
                    <div className="h-40 bg-slate-100 flex items-center justify-center border-b border-[#E7E0C4] relative overflow-hidden group-hover:bg-[#89B449]/5 transition-colors">
                      <ImageIcon className="w-10 h-10 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                          isOnline ? 'bg-slate-800 text-white' : 'bg-[#E7E0C4] text-slate-800'
                        }`}>
                          {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {isOnline ? 'Trực tuyến' : 'Trực tiếp'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-black text-slate-800 mb-4 line-clamp-2 leading-tight group-hover:text-[#407F3E] transition-colors">{trip.nhaMay?.ten_nha_may}</h3>
                      
                      <div className="space-y-3 mb-6 mt-auto">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-slate-400" />
                          </div>
                          {trip.ngay_tham_quan ? new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-slate-400" />
                          </div>
                          {(trip.gio_bat_dau || '--').slice(0, 5)} - {(trip.gio_ket_thuc || '--').slice(0, 5)}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-[#89B449]" />
                          </div>
                          Còn <span className="font-bold text-[#89B449]">{Math.max(0, trip.so_luong_sinh_vien - (trip.da_dang_ky || 0))}</span> chỗ
                        </div>
                      </div>

                      <button 
                        onClick={() => handleRegister(trip.id)}
                        className="w-full py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                      >
                        Đăng ký
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: Đã đăng ký */}
        {activeTab === 'daDangKy' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                    <th className="p-4 pl-6 min-w-[250px]">Nhà máy</th>
                    <th className="p-4 min-w-[150px]">Ngày tham quan</th>
                    <th className="p-4 text-center">Hình thức</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right pr-6 min-w-[120px]">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                  {registeredTrips.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                        Bạn chưa đăng ký chuyến kiến tập nào.
                      </td>
                    </tr>
                  ) : (
                    registeredTrips.map(reg => {
                      const trip = reg.chuyenThamQuan;
                      const isOnline = trip?.hinh_thuc === 'TrucTuyen';
                      const canCancel = reg.trang_thai === 'ChoDuyet' || reg.trang_thai === 'HopLe';

                      return (
                        <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-800">{trip?.nhaMay?.ten_nha_may || 'Chưa rõ'}</td>
                          <td className="p-4 font-medium text-slate-600">{trip?.ngay_tham_quan ? new Date(trip.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                              isOnline ? 'bg-slate-100 text-slate-600' : 'bg-[#89B449]/10 text-[#407F3E]'
                            }`}>
                              {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                              {isOnline ? 'Trực tuyến' : 'Trực tiếp'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {getStatusBadge(reg.trang_thai)}
                          </td>
                          <td className="p-4 text-right pr-6">
                            {canCancel ? (
                              <button 
                                onClick={() => handleCancelRegistration(reg.id)}
                                className="text-xs font-bold text-[#E68A8C] hover:text-[#E68A8C]/70 hover:underline transition-colors cursor-pointer"
                              >
                                Hủy đăng ký
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-slate-300 italic">Không thể hủy</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Đề xuất chuyến đi tự do */}
        {activeTab === 'deXuatTuDo' && (
          <div className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm p-6 lg:p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-[#E7E0C4] pb-4">Biểu mẫu Đề xuất Sinh viên đi tự do</h2>
            
            <form onSubmit={handleProposalSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Chọn Nhà máy <span className="text-[#E68A8C]">*</span></label>
                  <select 
                    value={factoryId}
                    onChange={(e) => setFactoryId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                  >
                    <option value="">-- Chọn Nhà máy đã có trên hệ thống --</option>
                    {factories.map(f => (
                      <option key={f.id} value={f.id}>{f.ten_nha_may}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Ngày dự kiến tham quan <span className="text-[#E68A8C]">*</span></label>
                  <input 
                    type="date" 
                    value={ngayThamQuan}
                    onChange={(e) => setNgayThamQuan(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Giờ bắt đầu</label>
                  <input 
                    type="time" 
                    value={gioBatDau}
                    onChange={(e) => setGioBatDau(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Giờ kết thúc</label>
                  <input 
                    type="time" 
                    value={gioKetThuc}
                    onChange={(e) => setGioKetThuc(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Hình thức <span className="text-[#E68A8C]">*</span></label>
                  <select 
                    value={hinhThuc}
                    onChange={(e) => setHinhThuc(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                  >
                    <option value="TrucTiep">Trực tiếp</option>
                    <option value="TrucTuyen">Trực tuyến</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E7E0C4] flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer">
                  Gửi đề xuất
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
