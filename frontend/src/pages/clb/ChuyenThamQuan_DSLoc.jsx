import React, { useState, useEffect } from 'react';
import { 
  Plus, ChevronDown, Check, X, Calendar, Clock, MapPin, 
  ChevronRight, Users, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import { getValidSession } from '../../utils/auth';

export default function ChuyenThamQuan_DSLoc() {
  const [activeTab, setActiveTab] = useState('khoa'); // 'khoa' | 'tudo'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);

  const [tripsKhoa, setTripsKhoa] = useState([]);
  const [tripsTuDo, setTripsTuDo] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const session = getValidSession();
  const currentUser = session?.user;

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
  const [gioKetThuc, setGioKetThuc] = useState('');
  const [sucChua, setSucChua] = useState('');
  
  // Toast Popup State
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    fetchInitialData();
    fetchTrips();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [facRes, schRes] = await Promise.all([
        khoaApi.getFactories(),
        khoaApi.getSchedules()
      ]);
      setNhaMayOptions(facRes.data);
      setLichOptions(schRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await khoaApi.getTrips();
      const allTrips = res.data || [];
      setTripsKhoa(allTrips.filter(t => t.cach_to_chuc === 'DoKhoaToChuc'));
      setTripsTuDo(allTrips.filter(t => t.cach_to_chuc === 'TuDo'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!selectedNhaMay || !selectedLich || !selectedHinhThuc || !ngay || !gioBatDau || !gioKetThuc || !sucChua) {
      showPopup("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    try {
      await khoaApi.createTrip({
        nha_may_id: selectedNhaMay,
        lich_kien_tap_id: selectedLich,
        ngay_tham_quan: ngay,
        gio_bat_dau: gioBatDau,
        gio_ket_thuc: gioKetThuc,
        hinh_thuc: selectedHinhThuc === 'Trực tuyến' ? 'TrucTuyen' : 'TrucTiep',
        suc_chua: Number(sucChua)
      });
      showPopup('Tạo chuyến tham quan thành công', 'success');
      setIsModalOpen(false);
      
      // Reset form
      setSelectedNhaMay('');
      setSelectedLich('');
      setSelectedHinhThuc('');
      setNgay('');
      setGioBatDau('');
      setGioKetThuc('');
      setSucChua('');

      fetchTrips();
    } catch (err) {
      console.error(err);
      showPopup(err.response?.data?.message || 'Lỗi tạo chuyến tham quan', 'error');
    }
  };

  const handleApproveTrip = async (tripId, isApproved) => {
    if (!currentUser) {
      showPopup('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.', 'error');
      return;
    }
    
    // Nếu từ chối, có thể prompt lý do nếu cần (nhưng backend ko nhận field này nên ta chỉ confirm)
    if (!isApproved) {
      const confirmReject = window.confirm('Bạn có chắc chắn muốn từ chối chuyến tham quan này?');
      if (!confirmReject) return;
    }

    try {
      await khoaApi.approveTrip({ tripId, approverId: currentUser.id, isApproved });
      showPopup(isApproved ? 'Duyệt chuyến tham quan thành công' : 'Từ chối chuyến tham quan thành công', 'success');
      fetchTrips();
    } catch (err) {
      console.error(err);
      showPopup(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu', 'error');
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsNhaMayDropdownOpen(false);
    setIsLichDropdownOpen(false);
    setIsHinhThucDropdownOpen(false);
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
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 pointer-events-none">
          <div className="absolute inset-0 bg-transparent pointer-events-auto" onClick={() => setPopup({ ...popup, show: false })}></div>
          <div className={`relative z-10 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto ${popup.type === 'error' ? 'bg-[#E68A8C] text-white' : 'bg-[#407F3E] text-white'}`}>
            <span className="font-bold text-sm">{popup.message}</span>
            <button onClick={() => setPopup({ ...popup, show: false })} className="p-1 hover:bg-white/20 rounded-full transition-colors">
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

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E7E0C4] mb-6">
        <button 
          onClick={() => setActiveTab('khoa')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'khoa' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Chuyến do khoa tổ chức
          {activeTab === 'khoa' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('tudo')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'tudo' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Chuyến tự do chờ duyệt
          <span className="bg-[#DBD468] text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
            {tripsTuDo.length}
          </span>
          {activeTab === 'tudo' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Tab 1: Khoa tổ chức */}
      {activeTab === 'khoa' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-end">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
              className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tạo chuyến tham quan
            </button>
          </div>

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
                    {tripsKhoa.map(t => {
                      const used = t.dang_ky_count || 0;
                      const max = t.suc_chua || 0;
                      const percent = max > 0 ? (used / max) * 100 : 0;
                      return (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-800">{t.nhaMay?.ten_nha_may || 'N/A'}</td>
                          <td className="p-4 font-medium text-slate-600">
                            {new Date(t.ngay).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="p-4 font-medium text-slate-600">{t.gio_bat_dau} - {t.gio_ket_thuc}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${
                              t.hinh_thuc === 'OFFLINE' ? 'bg-[#89B449]/10 text-[#407F3E] border-[#89B449]/20' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {t.hinh_thuc === 'OFFLINE' ? 'Trực tiếp' : 'Trực tuyến'}
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
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm border ${
                              t.trang_thai === 'MO_DANG_KY' ? 'bg-[#89B449] text-white border-[#89B449]/20' : 'bg-[#407F3E] text-white border-[#407F3E]/20'
                            }`}>
                              {t.trang_thai}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <button 
                              className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                              title="Chi tiết"
                              onClick={() => setViewingDetail(t)}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {tripsKhoa.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-500 font-medium">Không tìm thấy chuyến nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tự do chờ duyệt */}
      {activeTab === 'tudo' && (
        <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden mt-10">
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
                  {tripsTuDo.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E7E0C4] text-[#407F3E] flex items-center justify-center font-bold text-xs shadow-sm">
                            {t.sinhVien?.ho_ten?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{t.sinhVien?.ho_ten}</div>
                            <div className="text-xs font-mono text-slate-500">{t.sinhVien?.mssv}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{t.nha_may_tu_do || t.nhaMay?.ten_nha_may}</td>
                      <td className="p-4 font-medium text-slate-600">
                        {new Date(t.ngay).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                          {t.trang_thai}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewingDetail(t)} className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" title="Chi tiết">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleApproveTrip(t.id, true)} className="px-3 py-1.5 bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer">
                            <CheckCircle2 className="w-4 h-4" />
                            Duyệt
                          </button>
                          <button onClick={() => handleApproveTrip(t.id, false)} className="px-3 py-1.5 border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer">
                            <XCircle className="w-4 h-4" />
                            Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tripsTuDo.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-500 font-medium">Không có đề xuất tự do nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
            onSubmit={handleCreateTrip}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#407F3E]" />
                Tạo chuyến tham quan
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
              
              {/* Row 1: Nhà máy & Lịch */}
              <div className="grid grid-cols-2 gap-5 relative">
                {/* Nhà máy */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nhà máy</label>
                  <div 
                    onClick={(e) => handleDropdownClick(e, setIsNhaMayDropdownOpen)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isNhaMayDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium ${selectedNhaMay ? 'text-slate-800' : 'text-slate-400'}`}>
                      {nhaMayOptions.find(o => o.id === selectedNhaMay)?.ten_nha_may || 'Chọn nhà máy'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                  {isNhaMayDropdownOpen && (
                    <div className="absolute top-[70px] left-0 w-full bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden max-h-48 overflow-y-auto animate-in slide-in-from-top-1">
                      {nhaMayOptions.map(opt => (
                        <div 
                          key={opt.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedNhaMay(opt.id); setIsNhaMayDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            selectedNhaMay === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                        >
                          {opt.ten_nha_may}
                          {selectedNhaMay === opt.id && <Check className="w-4 h-4 text-[#407F3E]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lịch kiến tập */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Lịch kiến tập</label>
                  <div 
                    onClick={(e) => handleDropdownClick(e, setIsLichDropdownOpen)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium truncate pr-2 ${selectedLich ? 'text-slate-800' : 'text-slate-400'}`}>
                      {lichOptions.find(o => o.id === selectedLich)?.ten_lich || 'Chọn lịch kiến tập'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                  {isLichDropdownOpen && (
                    <div className="absolute top-[70px] left-0 w-full bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden max-h-48 overflow-y-auto animate-in slide-in-from-top-1">
                      {lichOptions.map(opt => (
                        <div 
                          key={opt.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedLich(opt.id); setIsLichDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            selectedLich === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                        >
                          <span className="truncate pr-2">{opt.ten_lich}</span>
                          {selectedLich === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Date & Time */}
              <div className="grid grid-cols-3 gap-5 relative z-40">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Giờ bắt đầu</label>
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
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Giờ kết thúc</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="time"
                      value={gioKetThuc}
                      onChange={(e) => setGioKetThuc(e.target.value)}
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
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            selectedHinhThuc === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
          ></div>
          
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Chi tiết
              </h2>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {Object.entries(viewingDetail).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) return null;
                return (
                  <div key={key} className="flex flex-col border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{key}</span>
                    <span className="text-sm font-medium text-slate-800 break-words">{String(value)}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end rounded-b-2xl">
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
    </div>
  );
}
