import React, { useState, useEffect } from 'react';
import { 
  MapPin, Laptop, Calendar, Clock, Image as ImageIcon, Users, ChevronDown, Check, Search, X, Banknote, Map,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sinhVienApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function ChuyenThamQuan_DanhSachDangKy() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('coTheDangKy');
  const [student, setStudent] = useState(null);
  const [factories, setFactories] = useState([]);
  
  const [availableTrips, setAvailableTrips] = useState([]);
  const [registeredTrips, setRegisteredTrips] = useState([]);
  const [proposals, setProposals] = useState([]);
  
  // Tab 1 filters & pagination
  const [searchTripTerm, setSearchTripTerm] = useState('');
  const [selectedFactory, setSelectedFactory] = useState('');
  const [isFilterFactoryOpen, setIsFilterFactoryOpen] = useState(false);
  const [filterFactorySearchTerm, setFilterFactorySearchTerm] = useState('');
  const [pageAvailable, setPageAvailable] = useState(1);
  const [limitAvailable, setLimitAvailable] = useState(6);

  // Tab 2 filters & pagination
  const [searchRegTerm, setSearchRegTerm] = useState('');
  const [filterRegStatus, setFilterRegStatus] = useState('');
  const [isFilterRegStatusOpen, setIsFilterRegStatusOpen] = useState(false);
  const [searchRegStatusDropdown, setSearchRegStatusDropdown] = useState('');
  const [pageRegistered, setPageRegistered] = useState(1);
  const [limitRegistered, setLimitRegistered] = useState(15);

  // Form states for Propose (Smart Autocomplete)
  const [selectedPartnerFactory, setSelectedPartnerFactory] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchingFactory, setIsSearchingFactory] = useState(false);
  const [showFactorySuggestions, setShowFactorySuggestions] = useState(false);
  const [customFactory, setCustomFactory] = useState({
    tenNhaMayDeXuat: '',
    diaChiDeXuat: '',
    nguoiLienHeDeXuat: '',
    sdtLienHeDeXuat: '',
  });
  const [ngayThamQuan, setNgayThamQuan] = useState('');
  const [gioBatDau, setGioBatDau] = useState('');
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

  // Debounced search for partner factories in proposal form (>= 3 chars)
  useEffect(() => {
    if (selectedPartnerFactory) {
      setSearchSuggestions([]);
      setShowFactorySuggestions(false);
      return;
    }

    const query = customFactory.tenNhaMayDeXuat?.trim();
    if (!query || query.length < 3) {
      setSearchSuggestions([]);
      setShowFactorySuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingFactory(true);
      try {
        const res = await sinhVienApi.searchFactories(query);
        setSearchSuggestions(res.data || []);
        setShowFactorySuggestions(true);
      } catch (err) {
        console.error('Lỗi tìm kiếm nhà máy:', err);
        setSearchSuggestions([]);
      } finally {
        setIsSearchingFactory(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customFactory.tenNhaMayDeXuat, selectedPartnerFactory]);

  const handleSelectFactorySuggestion = (factory) => {
    setSelectedPartnerFactory(factory);
    setCustomFactory(prev => ({
      ...prev,
      tenNhaMayDeXuat: factory.ten_nha_may,
      diaChiDeXuat: factory.dia_chi || prev.diaChiDeXuat || '',
      nguoiLienHeDeXuat: '',
      sdtLienHeDeXuat: '',
    }));
    setShowFactorySuggestions(false);
    setSearchSuggestions([]);
  };

  const handleClearSelectedPartner = () => {
    setSelectedPartnerFactory(null);
    setShowFactorySuggestions(false);
    setSearchSuggestions([]);
    setCustomFactory({
      tenNhaMayDeXuat: '',
      diaChiDeXuat: '',
      nguoiLienHeDeXuat: '',
      sdtLienHeDeXuat: '',
    });
    setNgayThamQuan('');
    setGioBatDau('');
    setHinhThuc('TrucTiep');
  };

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

  const handleCancelProposal = (proposalId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hủy phiếu đề xuất',
      message: 'Bạn có chắc chắn muốn hủy phiếu đề xuất chuyến tham quan tự do này?',
      type: 'cancel_proposal',
      targetId: proposalId,
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
        await sinhVienApi.requestCancel({ registrationId: confirmModal.targetId, lyDo: confirmModal.reason });
        showPopup('Đã gửi yêu cầu hủy đăng ký', 'success');
        fetchData(student.id);
      } catch (err) {
        showPopup(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
      }
    } else if (confirmModal.type === 'cancel_proposal') {
      try {
        await sinhVienApi.cancelProposal(confirmModal.targetId);
        showPopup('Đã hủy đề xuất chuyến tham quan thành công!', 'success');
        fetchData(student.id);
      } catch (err) {
        showPopup(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đề xuất', 'error');
      }
    }
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!customFactory.tenNhaMayDeXuat.trim()) {
      showPopup('Vui lòng nhập tên nhà máy đề xuất!', 'error');
      return;
    }
    if (!customFactory.diaChiDeXuat.trim()) {
      showPopup('Vui lòng nhập địa chỉ nhà máy!', 'error');
      return;
    }
    if (!customFactory.nguoiLienHeDeXuat.trim()) {
      showPopup('Vui lòng nhập người liên hệ!', 'error');
      return;
    }
    if (!customFactory.sdtLienHeDeXuat.trim()) {
      showPopup('Vui lòng nhập số điện thoại liên hệ!', 'error');
      return;
    }
    if (!ngayThamQuan) {
      showPopup('Vui lòng chọn ngày dự kiến tham quan!', 'error');
      return;
    }

    try {
      const payload = {
        ngayThamQuan,
        gioBatDau: gioBatDau || undefined,
        hinhThuc,
        tenNhaMayDeXuat: customFactory.tenNhaMayDeXuat.trim(),
        diaChiDeXuat: customFactory.diaChiDeXuat.trim(),
        nguoiLienHeDeXuat: customFactory.nguoiLienHeDeXuat.trim(),
        sdtLienHeDeXuat: customFactory.sdtLienHeDeXuat.trim(),
      };
      if (selectedPartnerFactory?.id) {
        payload.nhaMayId = selectedPartnerFactory.id;
      }
      await sinhVienApi.proposeTrip(payload);
      showPopup('Đã gửi đề xuất chuyến đi tự do thành công!', 'success');
      setSelectedPartnerFactory(null);
      setCustomFactory({
        tenNhaMayDeXuat: '',
        diaChiDeXuat: '',
        nguoiLienHeDeXuat: '',
        sdtLienHeDeXuat: '',
      });
      setNgayThamQuan('');
      setGioBatDau('');
      setShowFactorySuggestions(false);
      fetchData(student.id);
    } catch (err) {
      showPopup(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đề xuất', 'error');
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

  const getProposalStatusBadge = (status) => {
    switch (status) {
      case 'ChoDuyet':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">Chờ CLB duyệt</span>;
      case 'ChoKhoaDuyet':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 shadow-sm border border-blue-200">Chờ Khoa duyệt</span>;
      case 'DaDuyet':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">Đã phê duyệt</span>;
      case 'TuChoi':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">Đã từ chối</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div 
      className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative"
      onClick={() => {
        setIsFilterFactoryOpen(false);
        setIsFilterRegStatusOpen(false);
        setShowFactorySuggestions(false);
      }}
    >
      
      {/* Custom Popup Toast */}
      {popup.show && (
        <div className="fixed top-6 right-6 z-[9999] pointer-events-none">
          <div className={`relative z-10 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-right-8 fade-in duration-300 pointer-events-auto ${popup.type === 'error' ? 'bg-[#E68A8C] text-white' : 'bg-[#407F3E] text-white'}`}>
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
                className={`px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer ${confirmModal.type === 'cancel' || confirmModal.type === 'cancel_proposal' ? 'bg-[#E68A8C] hover:bg-[#E68A8C]/90' : 'bg-[#407F3E] hover:bg-[#407F3E]/90'}`}
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
            {/* Search Bar & Popover Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo tên công ty, nhà máy..."
                  value={searchTripTerm}
                  onChange={e => {
                    setSearchTripTerm(e.target.value);
                    setPageAvailable(1);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E7E0C4] rounded-2xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] shadow-sm transition-all"
                />
              </div>

              {/* Popover Filter Nhà máy */}
              <div className="w-full sm:w-72 relative" onClick={e => e.stopPropagation()}>
                <div 
                  onClick={() => setIsFilterFactoryOpen(!isFilterFactoryOpen)}
                  className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm flex justify-between items-center cursor-pointer transition-all shadow-sm ${
                    isFilterFactoryOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'
                  }`}
                >
                  <span className={`font-medium truncate pr-2 ${selectedFactory ? 'text-slate-800' : 'text-slate-600'}`}>
                    {selectedFactory ? (
                      availableTrips.find(t => t.nhaMay?.id?.toString() === selectedFactory)?.nhaMay?.ten_nha_may || 'Đã chọn 1 nhà máy'
                    ) : 'Tất cả nhà máy'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isFilterFactoryOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
                </div>

                {isFilterFactoryOpen && (
                  <div className="absolute top-full right-0 w-full mt-1.5 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-40 py-1 overflow-hidden animate-in slide-in-from-top-1 max-h-64 flex flex-col">
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Lọc danh sách nhà máy..."
                          value={filterFactorySearchTerm}
                          onChange={e => setFilterFactorySearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#407F3E]"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-48 py-1">
                      <div
                        onClick={() => {
                          setSelectedFactory('');
                          setIsFilterFactoryOpen(false);
                          setFilterFactorySearchTerm('');
                          setPageAvailable(1);
                        }}
                        className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          selectedFactory === '' ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Tất cả nhà máy</span>
                        {selectedFactory === '' && <Check className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />}
                      </div>

                      {Array.from(new Set(availableTrips.filter(t => t.nhaMay).map(t => t.nhaMay.id)))
                        .map(factoryId => availableTrips.find(t => t.nhaMay?.id === factoryId)?.nhaMay)
                        .filter(f => f && f.ten_nha_may?.toLowerCase().includes(filterFactorySearchTerm.toLowerCase()))
                        .map(factory => {
                          const isSelected = selectedFactory === factory.id.toString();
                          return (
                            <div
                              key={factory.id}
                              onClick={() => {
                                setSelectedFactory(factory.id.toString());
                                setIsFilterFactoryOpen(false);
                                setFilterFactorySearchTerm('');
                                setPageAvailable(1);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                                isSelected ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="truncate pr-2">{factory.ten_nha_may}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(() => {
              const filteredTrips = availableTrips.filter(t => {
                const matchSearch = t.nhaMay?.ten_nha_may?.toLowerCase().includes(searchTripTerm.toLowerCase());
                const matchFactory = selectedFactory === '' || t.nhaMay?.id.toString() === selectedFactory;
                return matchSearch && matchFactory;
              });

              const totalAvailable = filteredTrips.length;
              const totalPagesAvailable = Math.ceil(totalAvailable / limitAvailable) || 1;
              const currentAvailablePage = Math.min(pageAvailable, totalPagesAvailable);
              const paginatedTrips = filteredTrips.slice((currentAvailablePage - 1) * limitAvailable, currentAvailablePage * limitAvailable);

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedTrips.length === 0 ? (
                      <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-2xl border border-[#E7E0C4]">
                        Hiện không có chuyến đi nào mở đăng ký phù hợp.
                      </div>
                    ) : (
                      paginatedTrips.map(trip => {
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

                  {/* Pagination Footer Tab 1 */}
                  <div className="p-4 bg-white rounded-xl border border-[#E7E0C4] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span>Hiển thị</span>
                      <SearchableDropdown
                        value={limitAvailable}
                        onChange={val => {
                          setLimitAvailable(Number(val));
                          setPageAvailable(1);
                        }}
                        options={[
                          { value: 6, label: '6 chuyến' },
                          { value: 12, label: '12 chuyến' },
                          { value: 24, label: '24 chuyến' },
                          { value: 48, label: '48 chuyến' }
                        ]}
                        className="min-w-[120px]"
                        searchPlaceholder="Tìm..."
                      />
                      <span>/ tổng số <strong className="text-slate-800">{totalAvailable}</strong> chuyến mở</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPageAvailable(1)}
                        disabled={currentAvailablePage <= 1}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
                      >
                        Trang đầu
                      </button>
                      <button
                        onClick={() => setPageAvailable(prev => Math.max(prev - 1, 1))}
                        disabled={currentAvailablePage <= 1}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
                      >
                        Trước
                      </button>
                      <span className="text-xs font-bold text-white bg-[#407F3E] px-4 py-1.5 rounded-lg shadow-sm mx-1">
                        Trang {currentAvailablePage} / {totalPagesAvailable}
                      </span>
                      <button
                        onClick={() => setPageAvailable(prev => Math.min(prev + 1, totalPagesAvailable))}
                        disabled={currentAvailablePage >= totalPagesAvailable}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
                      >
                        Sau
                      </button>
                      <button
                        onClick={() => setPageAvailable(totalPagesAvailable)}
                        disabled={currentAvailablePage >= totalPagesAvailable}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
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

        {/* TAB 2: Đã đăng ký */}
        {activeTab === 'daDangKy' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Search and Status filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo tên nhà máy đã đăng ký..."
                  value={searchRegTerm}
                  onChange={e => {
                    setSearchRegTerm(e.target.value);
                    setPageRegistered(1);
                  }}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] shadow-sm transition-all"
                />
              </div>

              {/* Popover Filter Trạng thái */}
              <div className="w-full sm:w-60 relative" onClick={e => e.stopPropagation()}>
                <div 
                  onClick={() => setIsFilterRegStatusOpen(!isFilterRegStatusOpen)}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all shadow-sm ${
                    isFilterRegStatusOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'
                  }`}
                >
                  <span className="font-medium truncate pr-2 text-slate-700">
                    {filterRegStatus ? (
                      filterRegStatus === 'ChoDuyet' ? 'Chờ duyệt' :
                      filterRegStatus === 'HopLe' ? 'Hợp lệ' :
                      filterRegStatus === 'TuChoi' ? 'Từ chối' :
                      filterRegStatus === 'BiLoai' ? 'Bị loại' :
                      filterRegStatus === 'VangMat' ? 'Vắng mặt' :
                      filterRegStatus === 'KhongDat' ? 'Không đạt' :
                      filterRegStatus === 'DaHuy' ? 'Đã hủy' : filterRegStatus
                    ) : 'Tất cả trạng thái'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isFilterRegStatusOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
                </div>

                {isFilterRegStatusOpen && (
                  <div className="absolute top-full right-0 w-full mt-1.5 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-40 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
                    <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                      <input 
                        type="text" 
                        placeholder="Tìm trạng thái..." 
                        value={searchRegStatusDropdown}
                        onChange={(e) => setSearchRegStatusDropdown(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {[
                        { value: '', label: 'Tất cả trạng thái' },
                        { value: 'ChoDuyet', label: 'Chờ duyệt' },
                        { value: 'HopLe', label: 'Hợp lệ' },
                        { value: 'TuChoi', label: 'Từ chối' },
                        { value: 'BiLoai', label: 'Bị loại' },
                        { value: 'VangMat', label: 'Vắng mặt' },
                        { value: 'KhongDat', label: 'Không đạt' },
                        { value: 'DaHuy', label: 'Đã hủy' },
                      ]
                        .filter(st => st.label.toLowerCase().includes(searchRegStatusDropdown.toLowerCase()))
                        .map(st => (
                          <div
                            key={st.value}
                            onClick={() => {
                              setFilterRegStatus(st.value);
                              setIsFilterRegStatusOpen(false);
                              setSearchRegStatusDropdown('');
                              setPageRegistered(1);
                            }}
                            className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                              filterRegStatus === st.value ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{st.label}</span>
                            {filterRegStatus === st.value && <Check className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />}
                          </div>
                        ))}
                      {[
                        { value: '', label: 'Tất cả trạng thái' },
                        { value: 'ChoDuyet', label: 'Chờ duyệt' },
                        { value: 'HopLe', label: 'Hợp lệ' },
                        { value: 'TuChoi', label: 'Từ chối' },
                        { value: 'BiLoai', label: 'Bị loại' },
                        { value: 'VangMat', label: 'Vắng mặt' },
                        { value: 'KhongDat', label: 'Không đạt' },
                        { value: 'DaHuy', label: 'Đã hủy' },
                      ].filter(st => st.label.toLowerCase().includes(searchRegStatusDropdown.toLowerCase())).length === 0 && (
                        <div className="px-3 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(() => {
              const filteredRegistered = registeredTrips.filter(reg => {
                const trip = reg.chuyenThamQuan;
                const matchSearch = trip?.nhaMay?.ten_nha_may?.toLowerCase().includes(searchRegTerm.toLowerCase());
                const matchStatus = !filterRegStatus || reg.trang_thai === filterRegStatus;
                return matchSearch && matchStatus;
              });

              const totalReg = filteredRegistered.length;
              const totalPagesReg = Math.ceil(totalReg / limitRegistered) || 1;
              const currentRegPage = Math.min(pageRegistered, totalPagesReg);
              const paginatedReg = filteredRegistered.slice((currentRegPage - 1) * limitRegistered, currentRegPage * limitRegistered);

              return (
                <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
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
                        {paginatedReg.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-500 italic">
                              {registeredTrips.length === 0 ? 'Bạn chưa đăng ký chuyến kiến tập nào.' : 'Không tìm thấy chuyến kiến tập đã đăng ký phù hợp.'}
                            </td>
                          </tr>
                        ) : (
                          paginatedReg.map(reg => {
                            const trip = reg.chuyenThamQuan;
                            const isOnline = trip?.hinh_thuc === 'TrucTuyen';
                            const tripDate = trip?.ngay_tham_quan ? new Date(trip.ngay_tham_quan) : null;
                            const isPastTrip = tripDate ? new Date(tripDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) : false;
                            const canCancel = (reg.trang_thai === 'ChoDuyet' || reg.trang_thai === 'HopLe') && !isPastTrip && trip?.trang_thai !== 'DaDienRa';

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
                                        reg.hoaDon.trang_thai === 'DaDongDungHan' ? 'bg-[#89B449]/20 text-[#407F3E]' :
                                        reg.hoaDon.trang_thai === 'ViPham' ? 'bg-red-100 text-red-600' :
                                        'bg-slate-100 text-slate-600'
                                      }`}>
                                        {reg.hoaDon.trang_thai === 'ChuaDong' ? 'Chưa đóng' :
                                         reg.hoaDon.trang_thai === 'DaDongDungHan' ? 'Đã đóng' : 
                                         reg.hoaDon.trang_thai === 'ViPham' ? 'Quá hạn' : 
                                         reg.hoaDon.trang_thai === 'DaHoanPhi' ? 'Đã hoàn phí' : reg.hoaDon.trang_thai}
                                      </span>
                                    </div>
                                  ) : (
                                    reg.chuyenThamQuan?.cach_to_chuc === 'TuDo' ? (
                                      <span className="text-[10px] font-bold text-[#407F3E] bg-[#89B449]/20 px-2 py-0.5 rounded-full">Miễn phí (Tự túc)</span>
                                    ) : (
                                      <span className="text-xs text-slate-400 italic">Chưa có</span>
                                    )
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
                                    ) : isPastTrip || trip?.trang_thai === 'DaDienRa' ? (
                                      <span className="text-xs font-medium text-slate-400 italic">Đã diễn ra</span>
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

                  {/* Pagination Footer Tab 2 */}
                  <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span>Hiển thị</span>
                      <SearchableDropdown
                        value={limitRegistered}
                        onChange={val => {
                          setLimitRegistered(Number(val));
                          setPageRegistered(1);
                        }}
                        options={[
                          { value: 15, label: '15 mục' },
                          { value: 30, label: '30 mục' },
                          { value: 50, label: '50 mục' },
                          { value: 100, label: '100 mục' }
                        ]}
                        className="min-w-[120px]"
                        searchPlaceholder="Tìm..."
                      />
                      <span>/ tổng số <strong className="text-slate-800">{totalReg}</strong> đơn đăng ký</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPageRegistered(1)}
                        disabled={currentRegPage <= 1}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
                      >
                        Trang đầu
                      </button>
                      <button
                        onClick={() => setPageRegistered(prev => Math.max(prev - 1, 1))}
                        disabled={currentRegPage <= 1}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
                      >
                        Trước
                      </button>
                      <span className="text-xs font-bold text-white bg-[#407F3E] px-4 py-1.5 rounded-lg shadow-sm mx-1">
                        Trang {currentRegPage} / {totalPagesReg}
                      </span>
                      <button
                        onClick={() => setPageRegistered(prev => Math.min(prev + 1, totalPagesReg))}
                        disabled={currentRegPage >= totalPagesReg}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
                      >
                        Sau
                      </button>
                      <button
                        onClick={() => setPageRegistered(totalPagesReg)}
                        disabled={currentRegPage >= totalPagesReg}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
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

        {/* TAB 3: Đề xuất chuyến đi tự do */}
        {activeTab === 'deXuatTuDo' && (
          <div className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm p-6 lg:p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="border-b border-[#E7E0C4] pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">Biểu mẫu Đề xuất Sinh viên đi tự do</h2>
              <p className="text-xs text-slate-500 mt-1">
                Nhập tên nhà máy bạn muốn đi kiến tập tự do. Nếu nhà máy đã liên kết với trường, thông tin sẽ tự động được gợi ý.
              </p>
            </div>

            <form onSubmit={handleProposalSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Tên nhà máy đề xuất với Smart Autocomplete */}
                <div className="md:col-span-2 relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tên Nhà máy đề xuất <span className="text-[#E68A8C]">*</span>
                    </label>
                    {selectedPartnerFactory && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#89B449]/20 text-[#407F3E] border border-[#89B449]/30">
                        <Check className="w-3 h-3" /> Đã liên kết CLB
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      value={customFactory.tenNhaMayDeXuat}
                      onChange={(e) => {
                        if (!selectedPartnerFactory) {
                          setCustomFactory({ ...customFactory, tenNhaMayDeXuat: e.target.value });
                        }
                      }}
                      onFocus={() => {
                        if (!selectedPartnerFactory && searchSuggestions.length > 0) {
                          setShowFactorySuggestions(true);
                        }
                      }}
                      readOnly={!!selectedPartnerFactory}
                      required
                      placeholder="Nhập tối thiểu 3 ký tự để tìm kiếm hoặc tự điền tên mới..."
                      className={`w-full px-4 py-3 border rounded-xl text-sm transition-all font-medium pr-10 ${
                        selectedPartnerFactory 
                          ? 'bg-slate-100/80 border-[#407F3E]/40 text-slate-800 cursor-not-allowed font-semibold' 
                          : 'bg-slate-50 border-[#E7E0C4] focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] text-slate-800'
                      }`}
                    />
                    
                    {/* Spinner or Clear button */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {isSearchingFactory && (
                        <div className="w-4 h-4 border-2 border-[#407F3E] border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {selectedPartnerFactory && (
                        <button
                          type="button"
                          onClick={handleClearSelectedPartner}
                          title="Đổi cơ sở khác hoặc tự nhập lại"
                          className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedPartnerFactory && (
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500 bg-[#89B449]/10 px-3 py-2 rounded-lg border border-[#89B449]/20">
                      <span className="font-medium text-[#407F3E]">
                        {selectedPartnerFactory.dia_chi 
                          ? 'Đã chọn nhà máy liên kết trong hệ thống. Địa chỉ đã được khóa theo cơ sở liên kết.'
                          : 'Đã chọn nhà máy liên kết. Cơ sở này chưa có sẵn địa chỉ trong hệ thống, vui lòng nhập địa chỉ bên dưới.'}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearSelectedPartner}
                        className="font-bold text-[#407F3E] hover:underline cursor-pointer ml-2 shrink-0"
                      >
                        ✕ Nhập lại / Đổi cơ sở khác
                      </button>
                    </div>
                  )}

                  {/* Autocomplete Dropdown overlay */}
                  {showFactorySuggestions && !selectedPartnerFactory && (
                    <div 
                      className="absolute top-full left-0 w-full mt-1.5 bg-white border border-[#E7E0C4] rounded-2xl shadow-xl z-30 py-2 max-h-72 overflow-y-auto animate-in slide-in-from-top-1 fade-in duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {searchSuggestions.length > 0 ? (
                        <>
                          <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            Gợi ý nhà máy liên kết phù hợp ({searchSuggestions.length})
                          </div>
                          {searchSuggestions.map((f) => (
                            <div
                              key={f.id}
                              onClick={() => handleSelectFactorySuggestion(f)}
                              className="px-4 py-3 hover:bg-[#E7E0C4]/25 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-sm text-slate-800">{f.ten_nha_may}</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#89B449]/20 text-[#407F3E] shrink-0">
                                  Đã liên kết CLB
                                </span>
                              </div>
                              <div className="flex items-start gap-1.5 text-xs mt-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span className={`line-clamp-1 ${f.dia_chi ? 'text-slate-600 font-medium' : 'text-amber-600/80 italic'}`}>
                                  {f.dia_chi || '(Chưa cập nhật địa chỉ cơ sở)'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-3 text-xs text-slate-500 text-center italic">
                          Không tìm thấy nhà máy liên kết phù hợp với từ khóa "{customFactory.tenNhaMayDeXuat}".
                        </div>
                      )}

                      {/* Bottom option for free typing */}
                      <div 
                        onClick={() => {
                          setShowFactorySuggestions(false);
                        }}
                        className="px-4 py-2.5 text-xs font-bold text-[#407F3E] hover:bg-[#89B449]/10 cursor-pointer flex items-center gap-2 border-t border-slate-100 mt-1 transition-colors"
                      >
                        <span>+ Không tìm thấy hoặc khác cơ sở? Tiếp tục tự nhập thông tin mới</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Địa chỉ */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Địa chỉ <span className="text-[#E68A8C]">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={customFactory.diaChiDeXuat}
                    onChange={(e) => {
                      if (!selectedPartnerFactory || !selectedPartnerFactory.dia_chi) {
                        setCustomFactory({...customFactory, diaChiDeXuat: e.target.value});
                      }
                    }}
                    readOnly={!!selectedPartnerFactory && !!selectedPartnerFactory.dia_chi}
                    required
                    placeholder={
                      selectedPartnerFactory && !selectedPartnerFactory.dia_chi
                        ? "Nhà máy chưa có sẵn địa chỉ, vui lòng nhập địa chỉ cơ sở..."
                        : "Nhập địa chỉ nhà máy/chi nhánh..."
                    }
                    className={`w-full px-4 py-3 border rounded-xl text-sm transition-all font-medium ${
                      selectedPartnerFactory && selectedPartnerFactory.dia_chi
                        ? 'bg-slate-100/80 border-[#E7E0C4] text-slate-700 cursor-not-allowed'
                        : 'bg-slate-50 border-[#E7E0C4] focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] text-slate-800'
                    }`} 
                  />
                </div>

                {/* Người liên hệ */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Người liên hệ <span className="text-[#E68A8C]">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={customFactory.nguoiLienHeDeXuat}
                    onChange={(e) => setCustomFactory({...customFactory, nguoiLienHeDeXuat: e.target.value})}
                    required
                    placeholder="Họ tên người liên hệ..."
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                  />
                </div>

                {/* Số điện thoại liên hệ */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Số điện thoại liên hệ <span className="text-[#E68A8C]">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={customFactory.sdtLienHeDeXuat}
                    onChange={(e) => setCustomFactory({...customFactory, sdtLienHeDeXuat: e.target.value})}
                    required
                    placeholder="SĐT người liên hệ..."
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                  />
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
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" 
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Hình thức <span className="text-[#E68A8C]">*</span></label>
                  <SearchableDropdown
                    value={hinhThuc}
                    onChange={(val) => setHinhThuc(val)}
                    options={[
                      { value: 'TrucTiep', label: 'Trực tiếp' },
                      { value: 'TrucTuyen', label: 'Trực tuyến' }
                    ]}
                    className="w-full"
                    searchPlaceholder="Tìm..."
                  />
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
                      <th className="p-4 text-center min-w-[120px]">Trạng thái</th>
                      <th className="p-4 text-right pr-6 min-w-[120px]">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                    {proposals.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500 italic">
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
                            <td className="p-4 text-center">
                              {getProposalStatusBadge(p.trang_thai_duyet)}
                            </td>
                            <td className="p-4 text-right pr-6">
                              {['ChoDuyet', 'ChoKhoaDuyet'].includes(p.trang_thai_duyet) ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelProposal(p.id)}
                                  className="text-xs font-bold text-[#E68A8C] hover:text-[#E68A8C]/70 hover:underline transition-colors cursor-pointer"
                                >
                                  Hủy đề xuất
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400 italic">--</span>
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

          </div>
        )}

      </div>
    </div>
  );
}
