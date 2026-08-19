import React, { useState } from 'react';
import { 
  Lock, ChevronDown, Check, ChevronRight, AlertTriangle, 
  CheckCircle2, XCircle, Clock, Ban
} from 'lucide-react';

export default function KetQuaKienTap_Khoa() {
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');
  const lichOptions = ["Đợt kiến tập - Học kỳ 1 - 2025-2026", "Đợt kiến tập - Học kỳ 2 - 2024-2025"];

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // To show the confirm modal mockup

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(!isLichDropdownOpen);
  };

  // Mock Data
  const results = [
    { id: 1, mssv: '2001215001', ten: 'Nguyễn Văn An', diem: '8.5', trangThai: 'Đã đạt' },
    { id: 2, mssv: '2001215002', ten: 'Trần Thị Bình', diem: '9.2', trangThai: 'Đã đạt' },
    { id: 3, mssv: '2001215003', ten: 'Lê Hoàng Cường', diem: '4.5', trangThai: 'Không đạt' },
    { id: 4, mssv: '2001215004', ten: 'Phạm Duy Khang', diem: null, trangThai: 'Đang thực hiện' },
    { id: 5, mssv: '2001215005', ten: 'Vũ Quốc Huy', diem: null, trangThai: 'Chưa hoàn thành' },
    { id: 6, mssv: '2001215006', ten: 'Hoàng Quốc Việt', diem: '7.8', trangThai: 'Đã đạt' },
  ];

  // Stats
  const statDaDat = results.filter(r => r.trangThai === 'Đã đạt').length;
  const statKhongDat = results.filter(r => r.trangThai === 'Không đạt').length;
  const statDangThucHien = results.filter(r => r.trangThai === 'Đang thực hiện').length;
  const statChuaHoanThanh = results.filter(r => r.trangThai === 'Chưa hoàn thành').length;

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đã đạt':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Đang thực hiện':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Không đạt':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status}</span>;
      case 'Chưa hoàn thành':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Kết quả kiến tập</h1>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(true); }}
          className="px-5 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          Khóa điểm đợt này
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 relative z-20 mb-6">
        {/* Lịch Dropdown */}
        <div className="relative min-w-[350px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Lịch kiến tập</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsLichDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedLich ? 'text-slate-700' : 'text-slate-400'}`}>{selectedLich || 'Chọn lịch kiến tập'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isLichDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
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
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Đã đạt */}
        <div className="bg-[#89B449]/10 border border-[#89B449]/20 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-[#89B449] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#89B449] uppercase tracking-wider mb-0.5">Đã đạt</div>
            <div className="text-2xl font-black text-slate-800">{statDaDat}</div>
          </div>
        </div>

        {/* Đang thực hiện */}
        <div className="bg-[#DBD468]/15 border border-[#DBD468]/30 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-[#DBD468] rounded-full flex items-center justify-center text-slate-800 shadow-sm shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-yellow-700 uppercase tracking-wider mb-0.5">Đang thực hiện</div>
            <div className="text-2xl font-black text-slate-800">{statDangThucHien}</div>
          </div>
        </div>

        {/* Chưa hoàn thành */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 shadow-sm shrink-0">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Chưa hoàn thành</div>
            <div className="text-2xl font-black text-slate-800">{statChuaHoanThanh}</div>
          </div>
        </div>

        {/* Không đạt */}
        <div className="bg-[#E68A8C]/10 border border-[#E68A8C]/20 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-[#E68A8C] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#E68A8C] uppercase tracking-wider mb-0.5">Không đạt</div>
            <div className="text-2xl font-black text-slate-800">{statKhongDat}</div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible">
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">MSSV</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4 text-center">Điểm tổng kết</th>
                <th className="p-4 text-center">Kết quả</th>
                <th className="p-4 text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Không có kết quả nào.</td>
                </tr>
              ) : (
                results.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{r.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{r.ten}</td>
                    <td className="p-4 text-center">
                      {r.diem ? (
                        <span className="font-bold text-lg text-slate-800">{r.diem}</span>
                      ) : (
                        <span className="text-slate-400 font-bold">--</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(r.trangThai)}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                        title="Xem chi tiết điểm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Lock Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dimmed Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(false); }}
          ></div>
          
          {/* Modal Content */}
          <div 
            className="bg-white w-full max-w-sm rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 p-6 flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-[#E68A8C]/15 rounded-full flex items-center justify-center mb-4 border border-[#E68A8C]/30 shadow-sm">
              <AlertTriangle className="w-8 h-8 text-[#E68A8C]" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Xác nhận khóa điểm</h3>
            <p className="text-slate-500 font-medium mb-8">Sau khi khóa, không thể chỉnh sửa điểm.<br/>Bạn có chắc chắn?</p>
            
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(false); }}
                className="flex-1 py-3 border border-[#E7E0C4] bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(false); }}
                className="flex-1 py-3 bg-[#E68A8C] text-white hover:bg-[#E68A8C]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Xác nhận khóa điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
