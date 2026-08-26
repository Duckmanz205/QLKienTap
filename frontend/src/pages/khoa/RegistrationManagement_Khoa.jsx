import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, Check, ChevronRight, Paperclip, 
  CheckCircle2, XCircle, Filter, Download
} from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function RegistrationManagement_Khoa() {
  const [activeTab, setActiveTab] = useState('danhsach'); // 'danhsach' | 'huy' | 'chot'
  const [schedules, setSchedules] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [cancelRequests, setCancelRequests] = useState([]);
  const [viewingDetail, setViewingDetail] = useState(null);

  // Dropdown States for Filters
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');

  const [isChuyenDropdownOpen, setIsChuyenDropdownOpen] = useState(false);
  const [selectedChuyen, setSelectedChuyen] = useState('');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ["Chờ duyệt", "Hợp lệ", "Bị loại", "Đã hủy", "Đã tham gia", "Vắng mặt", "Hoàn thành", "Không đạt", "Tất cả"];

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (selectedLich) {
      if (activeTab === 'danhsach' || activeTab === 'chot') {
        fetchRegistrations();
      } else if (activeTab === 'huy') {
        fetchCancelRequests();
      }
    }
  }, [selectedLich, activeTab]);

  const fetchSchedules = async () => {
    try {
      const res = await khoaApi.getSchedules();
      setSchedules(res.data);
      if (res.data.length > 0) {
        setSelectedLich(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const res = await khoaApi.getRegistrations({ lichKienTapId: selectedLich });
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCancelRequests = async () => {
    try {
      const res = await khoaApi.getRegistrations({ lichKienTapId: selectedLich, hasCancelRequest: true });
      // If there's a specific endpoint for cancel requests or refund requests, we can use it.
      // Here using getRegistrations and filtering out locally just in case if the query parameter isn't supported.
      const filtered = (res.data || []).filter(r => r.yeuCauHuy && r.yeuCauHuy.trang_thai === 'ChoDuyet');
      setCancelRequests(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveCancel = async (cancelId, isApproved) => {
    try {
      await khoaApi.approveCancel({ cancelId, isApproved });
      alert(isApproved ? 'Đã duyệt yêu cầu hủy' : 'Đã từ chối yêu cầu hủy');
      fetchCancelRequests();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi duyệt');
    }
  };

  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
    setIsChuyenDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(true);
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hợp lệ':
      case 'Đã tham gia':
      case 'Hoàn thành':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Chờ duyệt':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Bị loại':
      case 'Không đạt':
      case 'Vắng mặt':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status}</span>;
      case 'Đã hủy':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status || 'Chưa rõ'}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Danh sách đen':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E68A8C] text-white border border-[#E68A8C]/20">{priority}</span>;
      case 'K12-K13 ưu tiên':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#407F3E] text-white border border-[#407F3E]/20">{priority}</span>;
      case 'K14 ưu tiên':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#89B449] text-white border border-[#89B449]/20">{priority}</span>;
      case 'Theo thứ tự đăng ký':
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{priority || 'N/A'}</span>;
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const chuyenName = r.chuyenKienTap?.nhaMay?.ten_nha_may;
    if (selectedChuyen && selectedChuyen !== 'Tất cả chuyến' && chuyenName !== selectedChuyen) return false;
    
    const statusMap = {
      'PENDING': 'Chờ duyệt',
      'APPROVED': 'Hợp lệ',
      'REJECTED': 'Bị loại',
      'CANCELLED': 'Đã hủy',
      'CANCELLED_WAITING_REFUND': 'Đã hủy',
      'REFUNDED': 'Đã hủy'
    };
    const currentStatus = statusMap[r.trang_thai] || 'Chờ duyệt';
    if (selectedStatus && selectedStatus !== 'Tất cả' && currentStatus !== selectedStatus) return false;
    
    return true;
  });

  const uniqueChuyenList = Array.from(new Set(registrations.map(r => r.chuyenKienTap?.nhaMay?.ten_nha_may).filter(Boolean)));

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý đăng ký</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E7E0C4] mb-6 overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('danhsach')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'danhsach' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Danh sách đăng ký
          {activeTab === 'danhsach' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('huy')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'huy' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Duyệt minh chứng hủy
          <span className="bg-[#DBD468] text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
            {cancelRequests.length}
          </span>
          {activeTab === 'huy' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('chot')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'chot' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Lọc & chốt danh sách
          {activeTab === 'chot' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Common Lịch Selector for All Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 relative z-20 mb-6">
        <div className="relative min-w-[300px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Lịch kiến tập</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsLichDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedLich ? 'text-slate-700' : 'text-slate-400'}`}>
              {schedules.find(s => s.id === selectedLich)?.ten_lich || 'Chọn lịch kiến tập'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isLichDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {schedules.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => { setSelectedLich(opt.id); setIsLichDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
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

        {activeTab === 'danhsach' && (
          <>
            {/* Chuyến Dropdown */}
            <div className="relative min-w-[200px] flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Chuyến tham quan</label>
              <div 
                onClick={(e) => handleDropdownClick(e, setIsChuyenDropdownOpen)}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isChuyenDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
              >
                <span className={`truncate pr-2 font-medium ${selectedChuyen ? 'text-slate-700' : 'text-slate-400'}`}>{selectedChuyen || 'Tất cả chuyến'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              {isChuyenDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
                  <div 
                    onClick={() => { setSelectedChuyen(''); setIsChuyenDropdownOpen(false); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${!selectedChuyen ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50'}`}
                  >
                    Tất cả chuyến
                  </div>
                  {uniqueChuyenList.map(opt => (
                    <div 
                      key={opt}
                      onClick={() => { setSelectedChuyen(opt); setIsChuyenDropdownOpen(false); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        selectedChuyen === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      {selectedChuyen === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trạng thái Dropdown */}
            <div className="relative min-w-[180px] flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Trạng thái</label>
              <div 
                onClick={(e) => handleDropdownClick(e, setIsStatusDropdownOpen)}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
              >
                <span className={`truncate pr-2 font-medium ${selectedStatus ? 'text-slate-700' : 'text-slate-400'}`}>{selectedStatus || 'Tất cả trạng thái'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
                  {statusOptions.map(opt => (
                    <div 
                      key={opt}
                      onClick={() => { setSelectedStatus(opt === 'Tất cả' ? '' : opt); setIsStatusDropdownOpen(false); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        (selectedStatus === opt || (!selectedStatus && opt === 'Tất cả')) ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      {(selectedStatus === opt || (!selectedStatus && opt === 'Tất cả')) && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Tab 1: Danh sách đăng ký */}
      {activeTab === 'danhsach' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                    <th className="p-4 pl-6">MSSV</th>
                    <th className="p-4">Họ tên</th>
                    <th className="p-4">Chuyến tham quan</th>
                    <th className="p-4">Ngày đăng ký</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                  {filteredRegistrations.map(r => {
                    const statusMap = {
                      'PENDING': 'Chờ duyệt',
                      'APPROVED': 'Hợp lệ',
                      'REJECTED': 'Bị loại',
                      'CANCELLED': 'Đã hủy',
                      'CANCELLED_WAITING_REFUND': 'Đã hủy',
                      'REFUNDED': 'Đã hủy'
                    };
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{r.sinhVien?.mssv}</td>
                        <td className="p-4 font-bold text-slate-800">{r.sinhVien?.ho_ten}</td>
                        <td className="p-4 font-medium text-slate-600">{r.chuyenKienTap?.nhaMay?.ten_nha_may || 'Đang cập nhật'}</td>
                        <td className="p-4 font-medium text-slate-500">{new Date(r.ngay_dang_ky).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4 text-center">
                          {getStatusBadge(statusMap[r.trang_thai])}
                        </td>
                        <td className="p-4 text-right pr-6">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                            title="Chi tiết"
                            onClick={() => setViewingDetail(r)}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">Không tìm thấy đăng ký nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Duyệt minh chứng hủy */}
      {activeTab === 'huy' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                    <th className="p-4 pl-6">MSSV</th>
                    <th className="p-4">Họ tên</th>
                    <th className="p-4">Chuyến tham quan</th>
                    <th className="p-4 max-w-[200px]">Lý do hủy</th>
                    <th className="p-4 text-center">File minh chứng</th>
                    <th className="p-4">Ngày yêu cầu</th>
                    <th className="p-4 text-right pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                  {cancelRequests.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{r.sinhVien?.mssv}</td>
                      <td className="p-4 font-bold text-slate-800">{r.sinhVien?.ho_ten}</td>
                      <td className="p-4 font-medium text-slate-600">{r.chuyenKienTap?.nhaMay?.ten_nha_may || 'Đang cập nhật'}</td>
                      <td className="p-4 font-medium text-slate-500 max-w-[200px] truncate" title={r.yeuCauHuy?.ly_do}>{r.yeuCauHuy?.ly_do}</td>
                      <td className="p-4 text-center">
                        {r.yeuCauHuy?.minh_chung ? (
                          <a href={r.yeuCauHuy.minh_chung} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#407F3E] hover:underline bg-[#407F3E]/10 px-2 py-1 rounded">
                            <Paperclip className="w-3.5 h-3.5" />
                            Xem minh chứng
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Không có</span>
                        )}
                      </td>
                      <td className="p-4 font-medium text-slate-500">{new Date(r.yeuCauHuy?.ngay_yeu_cau).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleApproveCancel(r.yeuCauHuy?.id, true)}
                            className="px-3 py-1.5 bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Duyệt
                          </button>
                          <button 
                            onClick={() => handleApproveCancel(r.yeuCauHuy?.id, false)}
                            className="px-3 py-1.5 border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {cancelRequests.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-500 font-medium">Không có yêu cầu hủy nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Lọc & chốt danh sách */}
      {activeTab === 'chot' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 relative z-20">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="relative min-w-[300px] bg-white p-2 rounded-xl shadow-sm border border-[#E7E0C4]">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 pl-2 uppercase tracking-wider">Chọn chuyến tham quan</label>
              <div 
                onClick={(e) => { e.stopPropagation(); setIsChuyenDropdownOpen(!isChuyenDropdownOpen); }}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isChuyenDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
              >
                <span className={`truncate pr-2 font-medium ${selectedChuyen ? 'text-slate-800' : 'text-slate-400'}`}>{selectedChuyen || 'Chọn chuyến'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              {isChuyenDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
                  {uniqueChuyenList.map(opt => (
                    <div 
                      key={opt}
                      onClick={() => { setSelectedChuyen(opt); setIsChuyenDropdownOpen(false); }}
                      className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        selectedChuyen === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      {selectedChuyen === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-600">{filteredRegistrations.length} đã chọn</span>
              <button className="px-5 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                <CheckCircle2 className="w-4 h-4" />
                Chốt danh sách chính thức
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                    <th className="p-4 pl-6 w-12">
                      <input type="checkbox" className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E]" checked readOnly />
                    </th>
                    <th className="p-4">MSSV</th>
                    <th className="p-4">Họ tên</th>
                    <th className="p-4">Nhóm ưu tiên</th>
                    <th className="p-4 text-right pr-6">Thời điểm đăng ký</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                  {filteredRegistrations.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors bg-[#89B449]/5">
                      <td className="p-4 pl-6">
                        <input type="checkbox" className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer" checked={true} readOnly />
                      </td>
                      <td className="p-4 font-mono font-bold text-[#407F3E]">{r.sinhVien?.mssv}</td>
                      <td className="p-4 font-bold text-slate-800">{r.sinhVien?.ho_ten}</td>
                      <td className="p-4">
                        {getPriorityBadge('Theo thứ tự đăng ký')}
                      </td>
                      <td className="p-4 font-medium text-slate-500 text-right pr-6">{new Date(r.ngay_dang_ky).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Vui lòng chọn chuyến tham quan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
