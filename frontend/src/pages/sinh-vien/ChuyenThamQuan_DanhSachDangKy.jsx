import React, { useState, useEffect } from 'react';
import { 
  MapPin, Laptop, Calendar, Clock, Image as ImageIcon, Users, ChevronDown, Check, Search, X, Banknote, Map
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sinhVienApi } from '../../services/api';

export default function ChuyenThamQuan_DanhSachDangKy() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('coTheDangKy');
  const [student, setStudent] = useState(null);
  const [factories, setFactories] = useState([]);
  
  const [availableTrips, setAvailableTrips] = useState([]);
  const [registeredTrips, setRegisteredTrips] = useState([]);
  const [proposals, setProposals] = useState([]);
  
  const [searchTripTerm, setSearchTripTerm] = useState('');
  const [selectedFactory, setSelectedFactory] = useState('');

  // Form states for Propose
  const [proposalType, setProposalType] = useState('system'); // 'system' or 'custom'
  const [factoryId, setFactoryId] = useState('');
  const [isFactoryDropdownOpen, setIsFactoryDropdownOpen] = useState(false);
  const [factorySearchTerm, setFactorySearchTerm] = useState('');
  const [customFactory, setCustomFactory] = useState({
    tenNhaMayDeXuat: '',
    diaChiDeXuat: '',
    nguoiLienHeDeXuat: '',
    sdtLienHeDeXuat: '',
  });
  const [ngayThamQuan, setNgayThamQuan] = useState('');
  const [gioBatDau, setGioBatDau] = useState('');
  const [gioKetThuc, setGioKetThuc] = useState('');
  const [hinhThuc, setHinhThuc] = useState('TrucTiep');

  // Popup state
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: '', // 'register' | 'cancel'
    targetId: null,
    reason: ''
  });
  const [viewingTrip, setViewingTrip] = useState(null);

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup(prev => ({ ...prev, show: false }));
    }, 3000);
  };

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
      const [availRes, regRes, propRes] = await Promise.all([
        sinhVienApi.getAvailableTrips(svId),
        sinhVienApi.getRegisteredTrips(svId),
        sinhVienApi.getProposals()
      ]);
      setAvailableTrips(availRes.data || []);
      setRegisteredTrips(regRes.data || []);
      setProposals(propRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = (tripId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận đăng ký',
      message: 'Bạn có chắc chắn muốn đăng ký chuyến kiến tập này?',
      type: 'register',
      targetId: tripId,
      reason: ''
    });
  };

  const handleCancelRegistration = (registrationId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hủy đăng ký',
      message: 'Vui lòng nhập lý do hủy đăng ký chuyến kiến tập này:',
      type: 'cancel',
      targetId: registrationId,
      reason: ''
    });
  };

  const handleConfirmAction = async () => {
    if (confirmModal.type === 'register') {
      try {
        await sinhVienApi.registerTrip(confirmModal.targetId);
        showPopup('Đăng ký thành công!', 'success');
        fetchData(student.id);
        setActiveTab('daDangKy');
      } catch (err) {
        showPopup(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
      }
    } else if (confirmModal.type === 'cancel') {
      if (!confirmModal.reason.trim()) {
        showPopup('Vui lòng nhập lý do hủy', 'error');
        return;
      }
      try {
        await sinhVienApi.requestCancel({ dangKyId: confirmModal.targetId, lyDo: confirmModal.reason });
        showPopup('Đã gửi yêu cầu hủy đăng ký', 'success');
        fetchData(student.id);
      } catch (err) {
        showPopup(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
      }
    }
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (proposalType === 'system' && !factoryId) {
      showPopup('Vui lòng chọn nhà máy!', 'error');
      return;
    }
    try {
      const payload = {
        ngayThamQuan,
        gioBatDau,
        gioKetThuc,
        hinhThuc
      };
      if (proposalType === 'system') {
        payload.nhaMayId = parseInt(factoryId);
      } else {
        payload.tenNhaMayDeXuat = customFactory.tenNhaMayDeXuat;
        payload.diaChiDeXuat = customFactory.diaChiDeXuat;
        payload.nguoiLienHeDeXuat = customFactory.nguoiLienHeDeXuat;
        payload.sdtLienHeDeXuat = customFactory.sdtLienHeDeXuat;
      }
      await sinhVienApi.proposeTrip(payload);
      showPopup('Đã gửi đề xuất chuyến đi tự do thành công!', 'success');
      setFactoryId('');
      setCustomFactory({
        tenNhaMayDeXuat: '',
        diaChiDeXuat: '',
        nguoiLienHeDeXuat: '',
        sdtLienHeDeXuat: '',
      });
      setNgayThamQuan('');
      setGioBatDau('');
      setGioKetThuc('');
      fetchData(student.id);
    } catch (err) {
      showPopup(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
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
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative">
      
      {/* Custom Popup Toast */}
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 pointer-events-none">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-auto" onClick={() => setPopup({ ...popup, show: false })}></div>
          <div className={`relative z-10 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto ${popup.type === 'error' ? 'bg-[#E68A8C] text-white' : 'bg-[#407F3E] text-white'}`}>
            <span className="font-bold text-sm">{popup.message}</span>
            <button onClick={() => setPopup({ ...popup, show: false })} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">{confirmModal.title}</h2>
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">{confirmModal.message}</p>
              {confirmModal.type === 'cancel' && (
                <textarea
                  autoFocus
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all mb-2 min-h-[100px]"
                  placeholder="Nhập lý do chi tiết..."
                  value={confirmModal.reason}
                  onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                ></textarea>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-5 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmAction}
                className={`px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer ${confirmModal.type === 'cancel' ? 'bg-[#E68A8C] hover:bg-[#E68A8C]/90' : 'bg-[#407F3E] hover:bg-[#407F3E]/90'}`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Details Modal */}
      {viewingTrip && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewingTrip(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#E7E0C4]/40 to-transparent">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#89B449]" />
                Chi tiết chuyến tham quan
              </h2>
              <button 
                onClick={() => setViewingTrip(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Factory Name */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Tên nhà máy</label>
                <p className="font-black text-slate-800 text-lg">{viewingTrip.nhaMay?.ten_nha_may || '--'}</p>
              </div>

              {/* Trip Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Map className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Địa chỉ tham quan</label>
                    <p className="text-sm font-medium text-slate-700 mt-0.5 leading-tight">
                      {viewingTrip.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : (viewingTrip.nhaMay?.dia_chi || 'Chưa cập nhật')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thời gian tham quan</label>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {viewingTrip.gio_bat_dau ? viewingTrip.gio_bat_dau.slice(0,5) : '--'} - {viewingTrip.ngay_tham_quan ? new Date(viewingTrip.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số lượng dự tính</label>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {viewingTrip.suc_chua ? `${viewingTrip.suc_chua} sinh viên` : '--'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phí tổ chức</label>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {viewingTrip.le_phi ? `${viewingTrip.le_phi.toLocaleString('vi-VN')} VNĐ` : <span className="text-[#89B449] font-bold">Miễn phí</span>}
                    </p>
                  </div>
                </div>

              </div>

              {/* Gathering Place (Full width if offline) */}
              {viewingTrip.hinh_thuc !== 'TrucTuyen' && (
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#E7E0C4]/50 text-[#89B449] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Địa điểm tập trung</label>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {viewingTrip.dia_diem_tap_trung || 'Đang cập nhật'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setViewingTrip(null)}
                className="px-6 py-2.5 bg-white border border-[#E7E0C4] text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm"
              >
                Đóng
              </button>
              {availableTrips.some(t => t.id === viewingTrip.id) && (
                <button 
                  onClick={() => {
                    handleRegister(viewingTrip.id);
                    setViewingTrip(null);
                  }}
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Đăng ký ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 relative z-0">
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Search Bar & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo tên công ty, nhà máy..."
                  value={searchTripTerm}
                  onChange={e => setSearchTripTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E7E0C4] rounded-2xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] shadow-sm transition-all"
                />
              </div>
              <div className="w-full sm:w-64 relative">
                <select 
                  value={selectedFactory}
                  onChange={e => setSelectedFactory(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 appearance-none bg-white border border-[#E7E0C4] rounded-2xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] shadow-sm transition-all text-slate-700 font-medium cursor-pointer"
                >
                  <option value="">Tất cả nhà máy</option>
                  {Array.from(new Set(availableTrips.filter(t => t.nhaMay).map(t => t.nhaMay.id))).map(factoryId => {
                    const factory = availableTrips.find(t => t.nhaMay?.id === factoryId)?.nhaMay;
                    return (
                      <option key={factoryId} value={factoryId}>
                        {factory?.ten_nha_may}
                      </option>
                    )
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {(() => {
              const filteredTrips = availableTrips.filter(t => {
                const matchSearch = t.nhaMay?.ten_nha_may?.toLowerCase().includes(searchTripTerm.toLowerCase());
                const matchFactory = selectedFactory === '' || t.nhaMay?.id.toString() === selectedFactory;
                return matchSearch && matchFactory;
              });

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTrips.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-2xl border border-[#E7E0C4]">
                      Hiện không có chuyến đi nào mở đăng ký phù hợp.
                    </div>
                  ) : (
                    filteredTrips.map(trip => {
                      const isOnline = trip.hinh_thuc === 'TrucTuyen';
                      return (
                        <div 
                          key={trip.id} 
                          className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col group p-6 relative overflow-hidden cursor-pointer duration-300"
                          onClick={() => {
                            if(trip.nhaMay) setViewingTrip(trip);
                          }}
                        >
                          
                          {/* Top row: Name & Badge */}
                          <div className="flex justify-between items-start gap-4 mb-5">
                            <h3 className="text-lg font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-[#407F3E] transition-colors flex-1">
                              {trip.nhaMay?.ten_nha_may}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                              isOnline ? 'bg-slate-800 text-white' : 'bg-[#E7E0C4]/50 text-slate-800'
                            }`}>
                              {isOnline ? <Laptop className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                              {isOnline ? 'Trực tuyến' : 'Trực tiếp'}
                            </span>
                          </div>
                          
                          {/* Info list */}
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
                              {(trip.gio_bat_dau || '--').slice(0, 5)}
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                <Map className="w-4 h-4 text-slate-400" />
                              </div>
                              <span className="line-clamp-1" title={trip.dia_diem_tap_trung || 'Đang cập nhật'}>
                                {trip.dia_diem_tap_trung || 'Đang cập nhật'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                <Banknote className="w-4 h-4 text-slate-400" />
                              </div>
                              {trip.le_phi ? `${trip.le_phi.toLocaleString('vi-VN')} VNĐ` : <span className="text-[#89B449] font-bold">Miễn phí</span>}
                            </div>
                          </div>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegister(trip.id);
                            }}
                            className="w-full py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer mt-4"
                          >
                            Đăng ký
                          </button>
                        </div>
                      );
                  })
                )}
              </div>
            );
          })()}
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
                    <th className="p-4 text-center min-w-[180px]">Thanh toán</th>
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
                          <td className="p-4 pl-6">
                            <span 
                              className="font-bold text-slate-800 cursor-pointer hover:text-[#407F3E] transition-colors"
                              onClick={() => {
                                if(trip?.nhaMay) setViewingTrip(trip);
                              }}
                            >
                              {trip?.nhaMay?.ten_nha_may || 'Chưa rõ'}
                            </span>
                          </td>
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
                          <td className="p-4 text-center">
                            {reg.hoaDon ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-bold text-slate-800 text-xs">{reg.hoaDon.so_tien?.toLocaleString('vi-VN')} VNĐ</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  reg.hoaDon.trang_thai === 'ChuaDong' ? 'bg-orange-100 text-orange-600' :
                                  reg.hoaDon.trang_thai === 'DaDong' ? 'bg-[#89B449]/20 text-[#407F3E]' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {reg.hoaDon.trang_thai === 'ChuaDong' ? 'Chưa đóng' :
                                   reg.hoaDon.trang_thai === 'DaDong' ? 'Đã đóng' : 'Quá hạn'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Chưa có</span>
                            )}
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex flex-col items-end gap-2">
                              {reg.hoaDon && reg.hoaDon.trang_thai === 'ChuaDong' && (
                                <button 
                                  onClick={() => navigate('/sinh-vien/payment')}
                                  className="text-xs font-bold text-[#407F3E] hover:text-[#407F3E]/70 hover:underline transition-colors cursor-pointer"
                                >
                                  Thanh toán ngay
                                </button>
                              )}
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
                            </div>
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
            
            <div className="flex gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="proposalType" 
                  value="system" 
                  checked={proposalType === 'system'} 
                  onChange={() => setProposalType('system')}
                  className="accent-[#407F3E]"
                />
                <span className="text-sm font-bold text-slate-700">Công ty liên kết với CLB</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="proposalType" 
                  value="custom" 
                  checked={proposalType === 'custom'} 
                  onChange={() => setProposalType('custom')}
                  className="accent-[#407F3E]"
                />
                <span className="text-sm font-bold text-slate-700">Điền thông tin tự do</span>
              </label>
            </div>

            <form onSubmit={handleProposalSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {proposalType === 'system' ? (
                  <div className="md:col-span-2 relative">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Chọn Nhà máy <span className="text-[#E68A8C]">*</span></label>
                    <div 
                      onClick={() => setIsFactoryDropdownOpen(!isFactoryDropdownOpen)}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isFactoryDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                    >
                      <span className={`font-medium truncate pr-2 ${factoryId ? 'text-slate-800' : 'text-slate-500'}`}>
                        {factoryId ? factories.find(f => f.id === parseInt(factoryId))?.ten_nha_may : '-- Chọn Nhà máy đã có trên hệ thống --'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    {isFactoryDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 max-h-60 overflow-y-auto animate-in slide-in-from-top-1">
                        <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                              type="text" 
                              placeholder="Tìm kiếm nhà máy..."
                              value={factorySearchTerm}
                              onChange={e => setFactorySearchTerm(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E]"
                            />
                          </div>
                        </div>
                        {factories
                          .filter(f => f.ten_nha_may?.toLowerCase().includes(factorySearchTerm.toLowerCase()))
                          .map(f => (
                          <div 
                            key={f.id}
                            onClick={() => { setFactoryId(f.id); setIsFactoryDropdownOpen(false); setFactorySearchTerm(''); }}
                            className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                              (parseInt(factoryId) === f.id) 
                                ? 'bg-[#E7E0C4]/50 text-slate-800 font-bold' 
                                : 'text-slate-700 hover:bg-[#E7E0C4]/30 font-medium'
                            }`}
                          >
                            <span className="truncate pr-2">{f.ten_nha_may}</span>
                            {parseInt(factoryId) === f.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                          </div>
                        ))}
                        {factories.filter(f => f.ten_nha_may?.toLowerCase().includes(factorySearchTerm.toLowerCase())).length === 0 && (
                          <div className="px-4 py-3 text-sm text-slate-500 text-center">Không tìm thấy nhà máy nào</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Tên Nhà máy đề xuất <span className="text-[#E68A8C]">*</span></label>
                      <input 
                        type="text" 
                        value={customFactory.tenNhaMayDeXuat}
                        onChange={(e) => setCustomFactory({...customFactory, tenNhaMayDeXuat: e.target.value})}
                        required
                        placeholder="Nhập tên nhà máy, công ty..."
                        className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Địa chỉ <span className="text-[#E68A8C]">*</span></label>
                      <input 
                        type="text" 
                        value={customFactory.diaChiDeXuat}
                        onChange={(e) => setCustomFactory({...customFactory, diaChiDeXuat: e.target.value})}
                        required
                        placeholder="Nhập địa chỉ..."
                        className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Người liên hệ <span className="text-[#E68A8C]">*</span></label>
                      <input 
                        type="text" 
                        value={customFactory.nguoiLienHeDeXuat}
                        onChange={(e) => setCustomFactory({...customFactory, nguoiLienHeDeXuat: e.target.value})}
                        required
                        placeholder="Họ tên người liên hệ..."
                        className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Số điện thoại liên hệ <span className="text-[#E68A8C]">*</span></label>
                      <input 
                        type="text" 
                        value={customFactory.sdtLienHeDeXuat}
                        onChange={(e) => setCustomFactory({...customFactory, sdtLienHeDeXuat: e.target.value})}
                        required
                        placeholder="SĐT..."
                        className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                      />
                    </div>
                  </>
                )}
                
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
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Giờ kết thúc</label>
                  <input 
                    type="time" 
                    value={gioKetThuc}
                    onChange={(e) => setGioKetThuc(e.target.value)}
                    required
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

            {/* Lịch sử đề xuất */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-[#E7E0C4] pb-4">Lịch sử đề xuất của bạn</h2>
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#E7E0C4]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                      <th className="p-4 pl-6 min-w-[200px]">Tên nhà máy</th>
                      <th className="p-4 min-w-[120px]">Ngày đề xuất đi</th>
                      <th className="p-4 text-center">Hình thức</th>
                      <th className="p-4 text-center pr-6 min-w-[120px]">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                    {proposals.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500 italic">
                          Bạn chưa có đề xuất nào.
                        </td>
                      </tr>
                    ) : (
                      proposals.map(p => {
                        const isOnline = p.hinh_thuc === 'TrucTuyen';
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-slate-800">
                              {p.nha_may_id ? p.nhaMay?.ten_nha_may : p.ten_nha_may_de_xuat}
                            </td>
                            <td className="p-4 font-medium text-slate-600">
                              {p.ngay_tham_quan_de_xuat ? new Date(p.ngay_tham_quan_de_xuat).toLocaleDateString('vi-VN') : '--'}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                isOnline ? 'bg-slate-100 text-slate-600' : 'bg-[#89B449]/10 text-[#407F3E]'
                              }`}>
                                {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                {isOnline ? 'Trực tuyến' : 'Trực tiếp'}
                              </span>
                            </td>
                            <td className="p-4 text-center pr-6">
                              {getStatusBadge(p.trang_thai_duyet)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
