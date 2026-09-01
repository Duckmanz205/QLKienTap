import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, Check, ChevronRight, UploadCloud, Search, DollarSign
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { khoaApi } from '../../services/api';

export default function QuanLyLePhi_Khoa() {
  const [schedules, setSchedules] = useState([]);
  const [fees, setFees] = useState([]);
  const [viewingDetail, setViewingDetail] = useState(null);
  const fileInputRef = useRef(null);
  
  // Dropdown States for Filters
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ["Tất cả", "Chưa đóng", "Đã đóng", "Hủy - Chờ hoàn", "Đã hoàn phí"];

  useEffect(() => {
    fetchSchedules();
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
      setFees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
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
    const statusMap = {
      'PENDING': 'Chưa đóng',
      'PAID': 'Đã đóng',
      'CANCELLED_WAITING_REFUND': 'Hủy - Chờ hoàn',
      'REFUNDED': 'Đã hoàn phí'
    };
    const currentStatus = statusMap[f.trang_thai_thanh_toan] || 'Chưa đóng';
    if (selectedStatus && selectedStatus !== 'Tất cả' && currentStatus !== selectedStatus) return false;
    return true;
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        const records = data.map(row => ({
          noi_dung_chuyen_khoan: String(row['Nội dung chuyển khoản'] || row['noi_dung_chuyen_khoan'] || ''),
          so_tien: row['Số tiền'] || row['so_tien'] ? Number(row['Số tiền'] || row['so_tien']) : undefined
        })).filter(r => r.noi_dung_chuyen_khoan && r.noi_dung_chuyen_khoan.trim() !== '');

        if (records.length === 0) {
          alert('Không tìm thấy dữ liệu "Nội dung chuyển khoản" hợp lệ trong file.');
          return;
        }

        const res = await khoaApi.bulkConfirmPayments(records);
        alert(res.data.message || 'Cập nhật thành công');
        fetchFees();
      } catch (err) {
        console.error(err);
        alert('Lỗi đọc file hoặc gọi API cập nhật.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý lệ phí</h1>
        <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="px-5 py-2.5 border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Tải danh sách đã đóng phí
        </button>
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
                const chuyen = f.chuyenKienTap?.nhaMay?.ten_nha_may || 'N/A';
                const statusMap = {
                  'PENDING': 'Chưa đóng',
                  'PAID': 'Đã đóng',
                  'CANCELLED_WAITING_REFUND': 'Hủy - Chờ hoàn',
                  'REFUNDED': 'Đã hoàn phí'
                };
                const status = statusMap[f.trang_thai_thanh_toan] || 'Chưa đóng';
                
                return (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{sv.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{sv.ho_ten}</td>
                    <td className="p-4 font-medium text-slate-600">{chuyen}</td>
                    <td className="p-4 font-bold text-[#89B449]">{f.chuyenKienTap?.chi_phi?.toLocaleString('vi-VN')} VNĐ</td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1.5 bg-[#E7E0C4]/50 rounded-lg border border-[#E7E0C4] font-mono text-[11px] font-bold text-slate-700 shadow-sm">
                        {sv.mssv} LPHI TQNM
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{f.ngay_thanh_toan ? new Date(f.ngay_thanh_toan).toLocaleDateString('vi-VN') : '--'}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(status)}
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
