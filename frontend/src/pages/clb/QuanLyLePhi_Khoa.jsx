import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown, Check, ChevronRight, UploadCloud, Search, DollarSign, X, Download, FileText, Eye, Plus, Edit
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { khoaApi } from '../../services/api';
import Toast from '../../components/Toast';
import SearchableDropdown from '../../components/SearchableDropdown';

function convertNumberToWords(amount) {
  if (amount === 0) return "Không đồng";

  const units = ["", " nghìn", " triệu", " tỷ"];
  const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

  function readGroupOfThree(num, isFirstGroup) {
    let str = "";
    let hundred = Math.floor(num / 100);
    let ten = Math.floor((num % 100) / 10);
    let unit = num % 10;

    if (hundred > 0 || !isFirstGroup) {
      str += digits[hundred] + " trăm ";
    }

    if (ten === 0 && unit > 0 && (hundred > 0 || !isFirstGroup)) {
      str += "lẻ ";
    } else if (ten === 1) {
      str += "mười ";
    } else if (ten > 1) {
      str += digits[ten] + " mươi ";
    }

    if (unit === 1 && ten > 1) {
      str += "mốt ";
    } else if (unit === 5 && ten > 0) {
      str += "lăm ";
    } else if (unit > 0 && (ten !== 1 || unit !== 1)) {
      str += digits[unit] + " ";
    }

    return str.trim();
  }

  let numStr = amount.toString();
  let groups = [];
  while (numStr.length > 0) {
    groups.push(parseInt(numStr.slice(-3)));
    numStr = numStr.slice(0, -3);
  }

  let result = "";
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] > 0) {
      const isFirstGroup = (i === groups.length - 1);
      const groupWords = readGroupOfThree(groups[i], isFirstGroup);
      if (groupWords) {
        result = groupWords + units[i] + " " + result;
      }
    }
  }

  result = result.trim();
  result = result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
  return result;
}

export default function QuanLyLePhi_Khoa() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [schedules, setSchedules] = useState([]);
  const [fees, setFees] = useState([]);
  const [viewingDetail, setViewingDetail] = useState(null);
  const fileInputRef = useRef(null);
  const invoiceRef = useRef(null);
  const [invoiceDataForPDF, setInvoiceDataForPDF] = useState(null);

  const handleExportExcel = () => {
    if (!fees || fees.length === 0) {
      setToast({ show: true, message: 'Không có dữ liệu để xuất', type: 'error' });
      return;
    }

    const exportData = filteredFees.map((f, index) => {
      const sv = f.sinhVien || {};
      const chuyen = f.chuyenThamQuan?.nhaMay?.ten_nha_may || '';
      const hoaDon = f.hoaDon || {};

      let trangThai = hoaDon.trang_thai;
      if (trangThai === 'ChuaDong') trangThai = 'Chưa đóng';
      else if (trangThai === 'DaDong') trangThai = 'Đã đóng';
      else if (trangThai === 'Huy_ChoHoanPhi') trangThai = 'Hủy - Chờ hoàn phí';
      else if (trangThai === 'DaHoanPhi') trangThai = 'Đã hoàn phí';

      return {
        'STT': index + 1,
        'MSSV': sv.mssv || '',
        'Họ và tên': sv.ho_ten || '',
        'Chuyến tham quan': chuyen,
        'Số tiền (VNĐ)': hoaDon.so_tien || 0,
        'Nội dung CK (Mã hóa đơn)': hoaDon.noi_dung_chuyen_khoan || '',
        'Trạng thái': trangThai,
        'Ngày đóng thực tế': hoaDon.ngay_dong_thuc_te ? new Date(hoaDon.ngay_dong_thuc_te).toLocaleString('vi-VN') : ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LePhi");

    const wscols = [
      { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 30 },
      { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Danh_Sach_Le_Phi_${new Date().getTime()}.xlsx`);
    setToast({ show: true, message: 'Xuất file Excel thành công', type: 'success' });
  };

  const handleExportPDF = (feeData) => {
    setInvoiceDataForPDF(feeData);

    setTimeout(async () => {
      const element = invoiceRef.current;
      if (!element) return;

      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`HoaDon_${feeData.sinhVien?.mssv || 'unknown'}.pdf`);
        setToast({ show: true, message: 'Tải Hóa đơn PDF thành công', type: 'success' });
      } catch (err) {
        console.error(err);
        setToast({ show: true, message: 'Lỗi tạo PDF', type: 'error' });
      } finally {
        setInvoiceDataForPDF(null);
      }
    }, 500);
  };


  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Config States
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [paymentConfigs, setPaymentConfigs] = useState([]);
  const [configViewMode, setConfigViewMode] = useState('list'); // 'list' or 'form'
  const [configSearchTerm, setConfigSearchTerm] = useState('');
  const [paymentConfig, setPaymentConfig] = useState({
    id: null,
    ma_ngan_hang: '',
    ten_ngan_hang: '',
    so_tai_khoan: '',
    ten_chu_tai_khoan: '',
    ghi_chu: ''
  });
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');
  const [searchLichTerm, setSearchLichTerm] = useState('');
  const [bankList, setBankList] = useState([]);

  const [confirmPaymentModal, setConfirmPaymentModal] = useState({ show: false, hoaDonId: null });

  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchStatusTerm, setSearchStatusTerm] = useState('');
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
      if (res.data) {
        setPaymentConfigs(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await khoaApi.saveTaiKhoanThuHuong(paymentConfig);
      setToast({ show: true, message: 'Đã lưu cấu hình thanh toán', type: 'success' });
      setConfigViewMode('list');
      fetchConfig();
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Lỗi lưu cấu hình', type: 'error' });
    }
  };

  const handleOpenConfigModal = () => {
    setConfigViewMode('list');
    setIsConfigModalOpen(true);
  };

  const handleCreateNewConfig = () => {
    setPaymentConfig({ id: null, ma_ngan_hang: '', ten_ngan_hang: '', so_tai_khoan: '', ten_chu_tai_khoan: '', ghi_chu: '' });
    setConfigViewMode('form');
  };

  const handleEditConfig = (config) => {
    setPaymentConfig(config);
    setConfigViewMode('form');
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
    setIsStatusDropdownOpen(false);
    setIsBankDropdownOpen(false);
    setSearchLichTerm('');
    setSearchStatusTerm('');
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
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20 whitespace-nowrap">{status}</span>;
      case 'Chưa đóng':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20 whitespace-nowrap">{status}</span>;
      case 'Hủy - Chờ hoàn':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20 whitespace-nowrap">{status}</span>;
      case 'Đã hoàn phí':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">{status || 'Chưa đóng'}</span>;
    }
  };

  const filteredFees = fees.filter(f => {
    const sv = f.sinhVien || {};
    const chuyen = f.chuyenThamQuan?.nhaMay?.ten_nha_may || '';
    const hoaDon = f.hoaDon || {};

    const currentStatus = hoaDon.trang_thai || 'ChuaDong';
    let displayStatus = 'Chưa đóng';
    if (currentStatus.startsWith('DaDong')) displayStatus = 'Đã đóng';
    else if (currentStatus === 'ViPham') displayStatus = 'Vi phạm';
    else if (currentStatus === 'DaHoanPhi') displayStatus = 'Đã hoàn phí';
    else if (currentStatus === 'ChuaDong') displayStatus = 'Chưa đóng';

    if (selectedStatus && selectedStatus !== 'Tất cả' && displayStatus !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchMssv = sv.mssv?.toLowerCase().includes(term);
      const matchName = sv.ho_ten?.toLowerCase().includes(term);
      const matchTrip = chuyen.toLowerCase().includes(term);
      const matchCk = hoaDon.noi_dung_chuyen_khoan?.toLowerCase().includes(term);
      if (!matchMssv && !matchName && !matchTrip && !matchCk) return false;
    }

    return true;
  });

  const totalItems = filteredFees.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedFees = filteredFees.slice((validCurrentPage - 1) * limit, validCurrentPage * limit);

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
            onClick={handleOpenConfigModal}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
          >
            Cấu hình thanh toán
          </button>
          <button
            onClick={handleExportExcel}
            className="px-5 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-center gap-4 relative z-20 mb-6">
        {/* Tìm kiếm */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo MSSV, Họ tên, Chuyến đi, Nội dung CK..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
          />
        </div>

        {/* Lịch Dropdown */}
        <div className="relative min-w-[260px]">
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
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[260px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input
                  type="text"
                  placeholder="Tìm lịch..."
                  value={searchLichTerm}
                  onChange={(e) => setSearchLichTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {schedules
                  .filter(opt => opt.ten_lich?.toLowerCase().includes(searchLichTerm.toLowerCase()))
                  .map(opt => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setSelectedLich(opt.id);
                        setIsLichDropdownOpen(false);
                        setCurrentPage(1);
                        setSearchLichTerm('');
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${selectedLich === opt.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                    >
                      <span className="truncate pr-2">{opt.ten_lich}</span>
                      {selectedLich === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                {schedules.filter(opt => opt.ten_lich?.toLowerCase().includes(searchLichTerm.toLowerCase())).length === 0 && searchLichTerm && (
                  <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Trạng thái Dropdown */}
        <div className="relative min-w-[180px]">
          <div
            onClick={(e) => handleDropdownClick(e, setIsStatusDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedStatus ? 'text-slate-700' : 'text-slate-400'}`}>{selectedStatus || 'Tất cả trạng thái'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isStatusDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[190px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input
                  type="text"
                  placeholder="Tìm trạng thái..."
                  value={searchStatusTerm}
                  onChange={(e) => setSearchStatusTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {statusOptions
                  .filter(opt => opt.toLowerCase().includes(searchStatusTerm.toLowerCase()))
                  .map(opt => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedStatus(opt === 'Tất cả' ? '' : opt);
                        setIsStatusDropdownOpen(false);
                        setCurrentPage(1);
                        setSearchStatusTerm('');
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${(selectedStatus === opt || (!selectedStatus && opt === 'Tất cả')) ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      {(selectedStatus === opt || (!selectedStatus && opt === 'Tất cả')) && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                {statusOptions.filter(opt => opt.toLowerCase().includes(searchStatusTerm.toLowerCase())).length === 0 && searchStatusTerm && (
                  <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                )}
              </div>
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
                <th className="p-4 pl-6 whitespace-nowrap">MSSV</th>
                <th className="p-4 whitespace-nowrap">Họ tên</th>
                <th className="p-4 whitespace-nowrap">Chuyến tham quan</th>
                <th className="p-4 whitespace-nowrap">Số tiền</th>
                <th className="p-4 text-center whitespace-nowrap">Nội dung chuyển khoản</th>
                <th className="p-4 whitespace-nowrap">Ngày đóng thực tế</th>
                <th className="p-4 text-center whitespace-nowrap">Trạng thái</th>
                <th className="p-4 text-right pr-6 w-16 whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {paginatedFees.map(f => {
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
                      <div className="flex flex-col items-end gap-2 w-[105px] ml-auto">
                        {currentStatus.startsWith('DaDong') && (
                          <button
                            className="flex items-center justify-center w-full gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            title="Tải Hóa đơn PDF"
                            onClick={() => handleExportPDF(f)}
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span>Xuất PDF</span>
                          </button>
                        )}
                        <button
                          className="flex items-center justify-center w-full gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                          title="Xem chi tiết"
                          onClick={() => setViewingDetail(f)}
                        >
                          <Eye className="w-4 h-4 shrink-0" />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginatedFees.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 font-medium">Không tìm thấy dữ liệu lệ phí phù hợp.</td>
                </tr>
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
              onChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
              searchPlaceholder="Tìm số lượng..."
              className="min-w-[80px]"
            />
            <span>/ {totalItems} sinh viên</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={validCurrentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {validCurrentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={validCurrentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
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
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {configViewMode === 'list' ? 'Danh sách Tài khoản thanh toán' : (paymentConfig.id ? 'Cập nhật cấu hình' : 'Thêm cấu hình thanh toán')}
              </h2>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {configViewMode === 'list' ? (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm cấu hình..."
                      value={configSearchTerm}
                      onChange={(e) => setConfigSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#407F3E]"
                    />
                  </div>
                  <button
                    onClick={handleCreateNewConfig}
                    className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm cấu hình mới
                  </button>
                </div>
                
                {paymentConfigs.length > 0 ? (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {paymentConfigs.filter(c => 
                      (c.ghi_chu || '').toLowerCase().includes(configSearchTerm.toLowerCase()) || 
                      c.ten_chu_tai_khoan.toLowerCase().includes(configSearchTerm.toLowerCase()) || 
                      c.so_tai_khoan.includes(configSearchTerm) ||
                      (c.ten_ngan_hang || '').toLowerCase().includes(configSearchTerm.toLowerCase())
                    ).map(config => (
                      <div key={config.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-[#407F3E]/50 transition-colors bg-slate-50 shadow-sm">
                        <div className="flex flex-col">
                          {config.ghi_chu && (
                            <span className="text-sm font-bold text-[#407F3E] mb-1">{config.ghi_chu}</span>
                          )}
                          <span className="font-bold text-slate-800 text-base">{config.ten_chu_tai_khoan}</span>
                          <span className="text-sm text-slate-600 font-mono mt-1">{config.so_tai_khoan}</span>
                          <span className="text-xs text-slate-500 font-medium mt-1">{bankList.find(b => b.bin === config.ma_ngan_hang)?.shortName || config.ten_ngan_hang}</span>
                        </div>
                        <button
                          onClick={() => handleEditConfig(config)}
                          className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-[#407F3E] hover:border-[#407F3E] hover:bg-[#E7E0C4]/20 rounded-lg transition-all cursor-pointer shadow-sm"
                          title="Sửa cấu hình"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {paymentConfigs.filter(c => 
                      (c.ghi_chu || '').toLowerCase().includes(configSearchTerm.toLowerCase()) || 
                      c.ten_chu_tai_khoan.toLowerCase().includes(configSearchTerm.toLowerCase()) || 
                      c.so_tai_khoan.includes(configSearchTerm) ||
                      (c.ten_ngan_hang || '').toLowerCase().includes(configSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="py-8 text-center text-slate-500 text-sm">
                        Không tìm thấy cấu hình phù hợp với từ khóa tìm kiếm.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="font-medium text-slate-600">Chưa có cấu hình thanh toán nào.</p>
                    <p className="text-sm mt-1">Vui lòng thêm tài khoản để sinh viên có thể nộp lệ phí.</p>
                  </div>
                )}
              </div>
            ) : (
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
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, so_tai_khoan: e.target.value })}
                    placeholder="Nhập số tài khoản"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#407F3E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tên Chủ Tài Khoản (In hoa không dấu)</label>
                  <input
                    type="text"
                    value={paymentConfig.ten_chu_tai_khoan}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, ten_chu_tai_khoan: e.target.value })}
                    placeholder="VD: NGUYEN VAN A"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#407F3E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Ghi chú / Tên gợi nhớ (Tùy chọn)</label>
                  <input
                    type="text"
                    value={paymentConfig.ghi_chu || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, ghi_chu: e.target.value })}
                    placeholder="VD: Tài khoản quỹ CLB năm 2026"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#407F3E]"
                  />
                </div>
              </div>
            )}

            <div className="px-6 py-4 bg-slate-50 border-t border-[#E7E0C4] flex justify-end gap-3 rounded-b-2xl">
              {configViewMode === 'form' ? (
                <>
                  <button
                    onClick={() => setConfigViewMode('list')}
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="px-5 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Lưu cấu hình
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              )}
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

      {/* Hidden Invoice Template for PDF Export */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div
          ref={invoiceRef}
          style={{
            width: '210mm',
            padding: '40px',
            backgroundColor: 'white',
            fontFamily: '"Times New Roman", Times, serif',
            color: '#000'
          }}
        >
          {invoiceDataForPDF && (() => {
            const sv = invoiceDataForPDF.sinhVien || {};
            const hk = invoiceDataForPDF.hoaDon || {};
            const ctq = invoiceDataForPDF.chuyenThamQuan?.nhaMay?.ten_nha_may || '';
            const dt = hk.ngay_dong_thuc_te ? new Date(hk.ngay_dong_thuc_te) : new Date();

            return (
              <div style={{ border: '1px solid #000', padding: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ width: '25%', textAlign: 'center' }}>
                    <img src="/LogoHuit_Tron.svg" alt="HUIT Logo" style={{ width: '110px', height: 'auto', marginBottom: '10px' }} />
                  </div>
                  <div style={{ width: '75%', textAlign: 'left', paddingLeft: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>BỘ CÔNG THƯƠNG</h3>
                    <h2 style={{ margin: '4px 0', fontSize: '18px', fontWeight: 'bold', color: '#e60000' }}>TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG THÀNH PHỐ HỒ CHÍ MINH</h2>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>Địa chỉ: 140 Lê Trọng Tấn, Phường Tây Thạnh, Quận Tân Phú, Thành Phố Hồ Chí Minh, Việt Nam</p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>Điện thoại: (028)38161673</p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>Mã số thuế: <strong>0305401461</strong></p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ margin: '2px 0', fontSize: '13px' }}>Email: accountdpm@huit.edu.vn</p>
                      <p style={{ margin: '2px 0', fontSize: '13px', paddingRight: '20px' }}>Website: khtc.huit.edu.vn</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ margin: '2px 0', fontSize: '13px' }}>Số tài khoản: {paymentConfig.so_tai_khoan}</p>
                      <p style={{ margin: '2px 0', fontSize: '13px', paddingRight: '20px' }}>Tại Ngân Hàng: {paymentConfig.ten_ngan_hang}</p>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '2px solid #000', borderBottom: '1px solid #000', margin: '15px 0', height: '3px' }}></div>

                {/* Title */}
                <div style={{ textAlign: 'center', margin: '24px 0 16px 0', position: 'relative' }}>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#e60000' }}>BIÊN LAI THU LỆ PHÍ KIẾN TẬP</h1>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>Bản thể hiện của biên lai điện tử</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontStyle: 'italic' }}>Ngày {("0" + dt.getDate()).slice(-2)} tháng {("0" + (dt.getMonth() + 1)).slice(-2)} năm {dt.getFullYear()}</p>
                </div>

                {/* Student Info */}
                <table style={{ width: '100%', fontSize: '14px', lineHeight: '1.8', marginBottom: '16px', border: 'none' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '25%' }}>Họ tên người nộp tiền:</td>
                      <td style={{ width: '75%', fontWeight: 'bold' }}>{sv.ho_ten}</td>
                    </tr>
                    <tr>
                      <td>Mã số sinh viên:</td>
                      <td style={{ fontWeight: 'bold' }}>{sv.mssv}</td>
                    </tr>
                    <tr>
                      <td>Lớp:</td>
                      <td style={{ fontWeight: 'bold' }}>{sv.ten_lop || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Hình thức thanh toán:</td>
                      <td style={{ fontWeight: 'bold' }}>Chuyển khoản</td>
                    </tr>
                  </tbody>
                </table>

                {/* Fee Table */}
                <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', marginBottom: '0' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '50px' }}>STT</th>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '200px' }}>Mã giao dịch</th>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Tên khoản thu</th>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '150px' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>1</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{hk.noi_dung_chuyen_khoan || 'N/A'}</td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>Lệ phí Kiến tập - {ctq}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                        {hk.so_tien ? Number(hk.so_tien).toLocaleString('vi-VN') : '0'}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Tổng cộng tiền thanh toán:</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                        {hk.so_tien ? Number(hk.so_tien).toLocaleString('vi-VN') : '0'}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '8px', fontSize: '14px' }}>
                  <strong>Số tiền viết bằng chữ: </strong>
                  <span>{convertNumberToWords(hk.so_tien || 0)}</span>
                </div>

                {/* Footer Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '0 40px 40px 40px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Người nộp tiền</p>
                    <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Người thu phí</p>
                    <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</p>
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ textAlign: 'center', color: '#e60000', fontSize: '13px', fontWeight: 'bold' }}>
                        <p style={{ margin: 0 }}>Ký bởi Câu lạc bộ</p>
                        <p style={{ margin: 0 }}>TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG THÀNH PHỐ HỒ CHÍ MINH</p>
                        <p style={{ margin: 0 }}>Ký ngày {("0" + dt.getDate()).slice(-2)}/{("0" + (dt.getMonth() + 1)).slice(-2)}/{dt.getFullYear()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

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
