import React, { useState } from 'react';
import { 
  ChevronDown, Check, ChevronRight, UploadCloud, Search, DollarSign
} from 'lucide-react';

export default function QuanLyLePhi_Khoa() {
  // Dropdown States for Filters
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');
  const lichOptions = ["Đợt kiến tập - Học kỳ 1 - 2025-2026", "Đợt kiến tập - Học kỳ 2 - 2024-2025"];

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ["Tất cả", "Chưa đóng", "Đã đóng đúng hạn", "Vi phạm", "Đã hoàn phí"];

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

  // Mock Data
  const fees = [
    { id: 1, mssv: '2001215001', ten: 'Nguyễn Văn An', chuyen: 'Vinamilk Bình Dương', soTien: '150,000 VNĐ', noiDung: '2001215001 LPHI TQNM', hanDong: '25/08/2026', ngayDong: '22/08/2026', trangThai: 'Đã đóng đúng hạn' },
    { id: 2, mssv: '2001215002', ten: 'Trần Thị Bình', chuyen: 'Acecook HCM', soTien: '200,000 VNĐ', noiDung: '2001215002 LPHI', hanDong: '25/08/2026', ngayDong: '--', trangThai: 'Chưa đóng' },
    { id: 3, mssv: '2001215003', ten: 'Lê Hoàng Cường', chuyen: 'Vinamilk Bình Dương', soTien: '150,000 VNĐ', noiDung: '2001215003 LPHI TQNM', hanDong: '25/08/2026', ngayDong: '28/08/2026', trangThai: 'Vi phạm' },
    { id: 4, mssv: '2001215004', ten: 'Phạm Duy Khang', chuyen: 'Yakult HCM', soTien: '180,000 VNĐ', noiDung: '2001215004 LPHI TQNM', hanDong: '30/08/2026', ngayDong: '25/08/2026', trangThai: 'Đã đóng đúng hạn' },
    { id: 5, mssv: '2001215005', ten: 'Vũ Quốc Huy', chuyen: 'CP Group Việt Nam', soTien: '250,000 VNĐ', noiDung: '2001215005 LPHI TQNM', hanDong: '10/09/2026', ngayDong: '05/09/2026', trangThai: 'Đã hoàn phí' },
  ];

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đã đóng đúng hạn':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Chưa đóng':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Vi phạm':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status}</span>;
      case 'Đã hoàn phí':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý lệ phí</h1>
        <button className="px-5 py-2.5 border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
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
            <span className={`truncate pr-2 font-medium ${selectedLich ? 'text-slate-700' : 'text-slate-400'}`}>{selectedLich || 'Chọn lịch kiến tập'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isLichDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {lichOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setSelectedLich(opt); setIsLichDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedLich === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {selectedLich === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
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
                  onClick={() => { setSelectedStatus(opt); setIsStatusDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedStatus === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {selectedStatus === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
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
                <th className="p-4">Hạn đóng</th>
                <th className="p-4">Ngày đóng thực tế</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right pr-6 w-16">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {fees.map(f => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{f.mssv}</td>
                  <td className="p-4 font-bold text-slate-800">{f.ten}</td>
                  <td className="p-4 font-medium text-slate-600">{f.chuyen}</td>
                  <td className="p-4 font-bold text-[#89B449]">{f.soTien}</td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-3 py-1.5 bg-[#E7E0C4]/50 rounded-lg border border-[#E7E0C4] font-mono text-[11px] font-bold text-slate-700 shadow-sm">
                      {f.noiDung}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-500">{f.hanDong}</td>
                  <td className="p-4 font-medium text-slate-700">{f.ngayDong}</td>
                  <td className="p-4 text-center">
                    {getStatusBadge(f.trangThai)}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button 
                      className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                      title="Xem chi tiết"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
