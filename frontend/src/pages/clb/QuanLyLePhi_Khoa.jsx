import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, Check, ChevronRight, UploadCloud, Search, DollarSign, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { khoaApi } from '../../services/api';
import Toast from '../../components/Toast';

export default function QuanLyLePhi_Khoa() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [schedules, setSchedules] = useState([]);
  const [fees, setFees] = useState([]);
  const [viewingDetail, setViewingDetail] = useState(null);
  const fileInputRef = useRef(null);
  
  // Config States
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({
    ma_ngan_hang: '',
    ten_ngan_hang: '',
    so_tai_khoan: '',
    ten_chu_tai_khoan: ''
  });
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');
  const [bankList, setBankList] = useState([]);
  
  const [confirmPaymentModal, setConfirmPaymentModal] = useState({ show: false, hoaDonId: null });
  
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ["Tất cả", "Chưa đóng", "Đã đóng", "Hủy - Chờ hoàn", "Đã hoàn phí"];

  useEffect(() => {
    fetchSchedules();
    fetchConfig();
    
    // Lấy danh sách ngân hàng từ VietQR API
    fetch('https://api.vietqr.io/v2/banks')
      .then(res => res.json())
      .then(data => {
        if (data.code === '00' && data.data) {
          setBankList(data.data);
        }
      })
      .catch(err => console.error("Lỗi khi tải danh sách ngân hàng:", err));
  }, []);

  useEffect(() => {
    if (selectedLich) {
      fetchFees();
    }
  }, [selectedLich]);

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

  const fetchFees = async () => {
    try {
      const res = await khoaApi.getRegistrations({ lichKienTapId: selectedLich });
      setFees(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await khoaApi.getTaiKhoanThuHuong();
      if (res.data && res.data.length > 0) {
        setPaymentConfig(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await khoaApi.saveTaiKhoanThuHuong(paymentConfig);
      setToast({ show: true, message: 'Đã lưu cấu hình thanh toán', type: 'success' });
      setIsConfigModalOpen(false);
      fetchConfig();
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Lỗi lưu cấu hình', type: 'error' });
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
    setIsStatusDropdownOpen(false);
    setIsBankDropdownOpen(false);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(true);
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đã đóng':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Chưa đóng':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Hủy - Chờ hoàn':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status}</span>;
      case 'Đã hoàn phí':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status || 'Chưa đóng'}</span>;
    }
  };

  const filteredFees = fees.filter(f => {
    const hoaDon = f.hoaDon || {};
    const currentStatus = hoaDon.trang_thai || 'ChuaDong';
    
    let displayStatus = 'Chưa đóng';
    if (currentStatus.startsWith('DaDong')) displayStatus = 'Đã đóng';
    else if (currentStatus === 'ViPham') displayStatus = 'Vi phạm';
    else if (currentStatus === 'DaHoanPhi') displayStatus = 'Đã hoàn phí';
    else if (currentStatus === 'ChuaDong') displayStatus = 'Chưa đóng';
    
    if (selectedStatus && selectedStatus !== 'Tất cả' && displayStatus !== selectedStatus) return false;
    return true;
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await khoaApi.uploadPaidStudents(file);
      setToast({ show: true, message: `Đã cập nhật ${res.data.success} hóa đơn thành công!`, type: 'success' });
      fetchFees();
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Lỗi upload file sao kê', type: 'error' });
    }
    e.target.value = null;
  };
  const requestConfirmPayment = (hoaDonId) => {
    setConfirmPaymentModal({ show: true, hoaDonId });
  };

  const handleConfirmManualPayment = async () => {
    const hoaDonId = confirmPaymentModal.hoaDonId;
    if (!hoaDonId) return;
    try {
      await khoaApi.confirmManualPayment(hoaDonId);
      setToast({ show: true, message: 'Đã xác nhận thanh toán thủ công', type: 'success' });
      setViewingDetail(null);
      setConfirmPaymentModal({ show: false, hoaDonId: null });
      fetchFees();
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.response?.data?.message || 'Lỗi khi xác nhận', type: 'error' });
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý lệ phí</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsConfigModalOpen(true)}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
          >
            Cấu hình thanh toán
          </button>
          <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Tải lên sao kê (Duyệt nhanh)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 relative z-20 mb-6">
        {/* Lịch Dropdown */}
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
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
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

        {/* Trạng thái Dropdown */}
        <div className="relative min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Trạng thái</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsStatusDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedStatus ? 'text-slate-700' : 'text-slate-400'}`}>{selectedStatus || 'Tất cả'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isStatusDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
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
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">MSSV</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Chuyến tham quan</th>
                <th className="p-4">Số tiền</th>
                <th className="p-4 text-center">Nội dung chuyển khoản</th>
                <th className="p-4">Ngày đóng thực tế</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right pr-6 w-16">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {filteredFees.map(f => {
                const sv = f.sinhVien || {};
                const chuyen = f.chuyenThamQuan?.nhaMay?.ten_nha_may || 'N/A';
                const hoaDon = f.hoaDon || {};
                
                const currentStatus = hoaDon.trang_thai || 'ChuaDong';
                let displayStatus = 'Chưa đóng';
                if (currentStatus.startsWith('DaDong')) displayStatus = 'Đã đóng';
                else if (currentStatus === 'ViPham') displayStatus = 'Vi phạm';
                else if (currentStatus === 'DaHoanPhi') displayStatus = 'Đã hoàn phí';
                else if (currentStatus === 'ChuaDong') displayStatus = 'Chưa đóng';
                
                return (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{sv.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{sv.ho_ten}</td>
                    <td className="p-4 font-medium text-slate-600">{chuyen}</td>
                    <td className="p-4 font-bold text-[#89B449]">
                      {hoaDon.so_tien ? Number(hoaDon.so_tien).toLocaleString('vi-VN') : '0'} VNĐ
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1.5 bg-[#E7E0C4]/50 rounded-lg border border-[#E7E0C4] font-mono text-[11px] font-bold text-slate-700 shadow-sm whitespace-nowrap">
                        {hoaDon.noi_dung_chuyen_khoan || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 text-center">
                      {hoaDon.ngay_dong_thuc_te ? new Date(hoaDon.ngay_dong_thuc_te).toLocaleDateString('vi-VN') : '--'}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(displayStatus)}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                        title="Xem chi tiết"
                        onClick={() => setViewingDetail(f)}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 font-medium">Không tìm thấy dữ liệu lệ phí.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Thông tin Sinh viên */}
              <div>
                <h3 className="text-sm font-bold text-[#407F3E] uppercase tracking-wider mb-3 border-b border-[#E7E0C4] pb-2">Thông tin Sinh viên</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">MSSV</span>
                    <span className="text-sm font-bold text-slate-800">{viewingDetail.sinhVien?.mssv || '--'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Họ và tên</span>
                    <span className="text-sm font-bold text-slate-800">{viewingDetail.sinhVien?.ho_ten || '--'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Khóa học</span>
                    <span className="text-sm font-bold text-slate-800">{viewingDetail.sinhVien?.khoaHoc?.ten_khoa_hoc || '--'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Lớp</span>
                    <span className="text-sm font-bold text-slate-800">{viewingDetail.sinhVien?.ten_lop || '--'}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin Chuyến tham quan */}
              <div>
                <h3 className="text-sm font-bold text-[#407F3E] uppercase tracking-wider mb-3 border-b border-[#E7E0C4] pb-2">Chuyến kiến tập</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col col-span-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Doanh nghiệp</span>
                    <span className="text-sm font-bold text-slate-800">{viewingDetail.chuyenThamQuan?.nhaMay?.ten_nha_may || '--'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Lịch kiến tập</span>
                    <span className="text-sm font-bold text-slate-800">{viewingDetail.chuyenThamQuan?.lichKienTap?.ten_lich || '--'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Hình thức</span>
                    <span className="text-sm font-bold text-slate-800">{viewingDetail.chuyenThamQuan?.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin Thanh toán */}
              <div>
                <h3 className="text-sm font-bold text-[#407F3E] uppercase tracking-wider mb-3 border-b border-[#E7E0C4] pb-2">Trạng thái lệ phí</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Lệ phí (VNĐ)</span>
                    <span className="text-sm font-bold text-[#89B449]">{viewingDetail.hoaDon?.so_tien ? Number(viewingDetail.hoaDon.so_tien).toLocaleString('vi-VN') : '0'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Trạng thái</span>
                    <span className="text-sm font-bold text-slate-800 mt-1">
                      {getStatusBadge(
                        viewingDetail.hoaDon?.trang_thai?.startsWith('DaDong') ? 'Đã đóng' :
                        viewingDetail.hoaDon?.trang_thai === 'ViPham' ? 'Vi phạm' :
                        viewingDetail.hoaDon?.trang_thai === 'DaHoanPhi' ? 'Đã hoàn phí' : 'Chưa đóng'
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Mã / Nội dung chuyển khoản</span>
                    <span className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded mt-1 inline-block w-max">
                      {viewingDetail.hoaDon?.noi_dung_chuyen_khoan || '--'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Hạn thu phí</span>
                    <span className="text-sm font-bold text-[#E68A8C]">
                      {viewingDetail.hoaDon?.han_dong ? new Date(viewingDetail.hoaDon.han_dong).toLocaleString('vi-VN') : '--'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Ngày nộp thực tế</span>
                    <span className="text-sm font-bold text-slate-800">
                      {viewingDetail.hoaDon?.ngay_dong_thuc_te ? new Date(viewingDetail.hoaDon.ngay_dong_thuc_te).toLocaleString('vi-VN') : '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end rounded-b-2xl gap-3">
              {viewingDetail.hoaDon?.trang_thai === 'ChuaDong' && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); requestConfirmPayment(viewingDetail.hoaDon?.id); }}
                  className="px-6 py-2.5 bg-[#89B449] text-white hover:bg-[#89B449]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Xác nhận đã thu phí
                </button>
              )}
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Cấu hình thanh toán */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setIsConfigModalOpen(false); }}
          ></div>
          
          <div 
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Cấu hình thanh toán VietQR</h2>
              <button 
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-1">Ngân hàng thụ hưởng</label>
                <div 
                  onClick={(e) => { e.stopPropagation(); setIsBankDropdownOpen(!isBankDropdownOpen); setBankSearchTerm(''); }}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className={`truncate ${!paymentConfig.ma_ngan_hang ? 'text-slate-400' : 'text-slate-700'}`}>
                    {paymentConfig.ma_ngan_hang 
                      ? `${bankList.find(b => b.bin === paymentConfig.ma_ngan_hang)?.shortName || paymentConfig.ten_ngan_hang} (${paymentConfig.ma_ngan_hang})`
                      : '-- Chọn ngân hàng --'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                {isBankDropdownOpen && (
                  <div 
                    className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col animate-in slide-in-from-top-1 max-h-64"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2 border-b border-slate-100 shrink-0 sticky top-0 bg-white z-10">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Tìm ngân hàng (Tên hoặc mã BIN)..."
                          value={bankSearchTerm}
                          onChange={(e) => setBankSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#407F3E]"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar relative z-0">
                      {bankList.filter(b => 
                        b.shortName.toLowerCase().includes(bankSearchTerm.toLowerCase()) || 
                        b.name.toLowerCase().includes(bankSearchTerm.toLowerCase()) || 
                        b.bin.includes(bankSearchTerm)
                      ).map(bank => (
                        <div 
                          key={bank.bin}
                          onClick={() => {
                            setPaymentConfig({
                              ...paymentConfig, 
                              ma_ngan_hang: bank.bin,
                              ten_ngan_hang: bank.shortName
                            });
                            setIsBankDropdownOpen(false);
                          }}
                          className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-3 transition-colors ${paymentConfig.ma_ngan_hang === bank.bin ? 'bg-slate-50 font-bold text-[#407F3E]' : 'text-slate-700'}`}
                        >
                          {bank.logo && (
                            <img src={bank.logo} alt={bank.shortName} className="w-8 h-8 object-contain shrink-0 rounded bg-white border border-slate-100" />
                          )}
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate font-medium">{bank.shortName} ({bank.bin})</span>
                            <span className="text-[11px] text-slate-400 truncate font-normal leading-tight mt-0.5">{bank.name}</span>
                          </div>
                        </div>
                      ))}
                      {bankList.filter(b => b.shortName.toLowerCase().includes(bankSearchTerm.toLowerCase()) || b.name.toLowerCase().includes(bankSearchTerm.toLowerCase()) || b.bin.includes(bankSearchTerm)).length === 0 && (
                        <div className="p-4 text-center text-sm text-slate-500">
                          Không tìm thấy ngân hàng phù hợp.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Số Tài Khoản</label>
                <input 
                  type="text" 
                  value={paymentConfig.so_tai_khoan}
                  onChange={(e) => setPaymentConfig({...paymentConfig, so_tai_khoan: e.target.value})}
                  placeholder="Nhập số tài khoản" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#407F3E]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tên Chủ Tài Khoản (In hoa không dấu)</label>
                <input 
                  type="text" 
                  value={paymentConfig.ten_chu_tai_khoan}
                  onChange={(e) => setPaymentConfig({...paymentConfig, ten_chu_tai_khoan: e.target.value})}
                  placeholder="VD: NGUYEN VAN A" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#407F3E]"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-[#E7E0C4] flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-sm transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-lg font-bold text-sm transition-colors cursor-pointer"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận thu phí thủ công */}
      {confirmPaymentModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setConfirmPaymentModal({ show: false, hoaDonId: null })}
          ></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận thu phí</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn xác nhận đã thu phí sinh viên này thủ công? Hệ thống sẽ ghi nhận sinh viên này đã đóng tiền hợp lệ.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-[#E7E0C4] flex items-center justify-center gap-3">
              <button 
                onClick={() => setConfirmPaymentModal({ show: false, hoaDonId: null })}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors cursor-pointer w-full"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmManualPayment}
                className="px-5 py-2.5 bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer w-full"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: '', type: 'success' })} 
      />
    </div>
  );
}
