import React, { useState } from 'react';
import { 
  ChevronDown, Check, Info, Search, ChevronRight, UserCircle, UserPlus
} from 'lucide-react';

export default function SupervisorAssignment_Khoa() {
  // Dropdown States for Filters
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');
  const lichOptions = ["Đợt kiến tập - Học kỳ 1 - 2025-2026", "Đợt kiến tập - Học kỳ 2 - 2024-2025"];

  const [selectAll, setSelectAll] = useState(false);
  
  // Specific inline dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(2); // Keep row 2 open to match mockup requirement

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
    setOpenDropdownId(null);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(true);
  };

  const toggleInlineDropdown = (e, id) => {
    e.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setIsLichDropdownOpen(false);
      setOpenDropdownId(id);
    }
  }

  // Mock Data
  const listSv = [
    { id: 1, mssv: '2001215001', ten: 'Nguyễn Văn An', lop: '14DHTP1', gvhd: 'Lê Minh Tuấn', checked: false },
    { id: 2, mssv: '2001215002', ten: 'Trần Thị Bình', lop: '14DHTP1', gvhd: null, checked: selectAll },
    { id: 3, mssv: '2001215003', ten: 'Lê Hoàng Cường', lop: '14DHTP2', gvhd: null, checked: selectAll },
    { id: 4, mssv: '2001215004', ten: 'Phạm Duy Khang', lop: '14DHTP2', gvhd: 'Đỗ Minh Phương', checked: false },
    { id: 5, mssv: '2001215005', ten: 'Vũ Quốc Huy', lop: '14DHTP3', gvhd: null, checked: selectAll },
  ];

  const gvOptions = [
    { id: 1, name: 'Nguyễn Văn A', load: '12/15 SV', full: false },
    { id: 2, name: 'Trần Thị B', load: '8/15 SV', full: false },
    { id: 3, name: 'Lê Văn C', load: '15/15 SV - đầy', full: true },
  ];

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Phân công GVHD</h1>
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

      {/* Bulk Action Bar */}
      <div className="bg-[#E7E0C4]/50 border border-[#E7E0C4] rounded-t-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 pl-2">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer"
            checked={selectAll}
            onChange={() => setSelectAll(!selectAll)}
          />
          <span className="text-sm font-bold text-slate-700">Chọn tất cả</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Info className="w-4 h-4" />
            <span className="text-[11px] font-medium">Chờ khoa cấu hình số lượng SV tối đa/GV</span>
          </div>
          <button 
            disabled
            className="px-4 py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 cursor-not-allowed"
          >
            Phân công tự động
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-b-xl shadow-sm border border-[#E7E0C4] border-t-0 overflow-visible relative z-10">
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-5 w-12"></th>
                <th className="p-4">MSSV</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Lớp</th>
                <th className="p-4">GVHD hiện tại</th>
                <th className="p-4 text-right pr-6 w-[250px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {listSv.map(sv => (
                <tr key={sv.id} className={`hover:bg-slate-50 transition-colors ${sv.checked ? 'bg-[#89B449]/5' : ''}`}>
                  <td className="p-4 pl-5">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer" 
                      checked={sv.checked} 
                      readOnly 
                    />
                  </td>
                  <td className={`p-4 font-mono font-bold ${sv.checked ? 'text-[#407F3E]' : 'text-slate-500'}`}>{sv.mssv}</td>
                  <td className="p-4 font-bold text-slate-800">{sv.ten}</td>
                  <td className="p-4 font-medium text-slate-600">{sv.lop}</td>
                  <td className="p-4">
                    {sv.gvhd ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E7E0C4]/40 text-slate-700 border border-[#E7E0C4]">
                        <UserCircle className="w-4 h-4 text-[#407F3E]" />
                        {sv.gvhd}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                        Chưa phân công
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right pr-6 relative">
                    <button 
                      onClick={(e) => toggleInlineDropdown(e, sv.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-end gap-2 ml-auto ${
                        openDropdownId === sv.id 
                          ? 'bg-[#407F3E] text-white shadow-sm' 
                          : 'bg-slate-50 border border-slate-200 text-[#407F3E] hover:bg-[#407F3E]/10'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Phân công
                    </button>

                    {/* Inline Dropdown */}
                    {openDropdownId === sv.id && (
                      <div 
                        className="absolute top-full right-6 mt-1 w-[260px] bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 origin-top-right text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-2 border-b border-[#E7E0C4] bg-slate-50">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input 
                              type="text" 
                              placeholder="Tìm kiếm GVHD..." 
                              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                            />
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto py-1">
                          {gvOptions.map(gv => (
                            <div 
                              key={gv.id}
                              className={`px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                                gv.full 
                                  ? 'opacity-50 cursor-not-allowed bg-slate-50' 
                                  : 'cursor-pointer hover:bg-[#E7E0C4]/30'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${gv.full ? 'bg-slate-300' : 'bg-[#407F3E]'}`}>
                                  {gv.name.charAt(0)}
                                </div>
                                <span className={`font-bold ${gv.full ? 'text-slate-500' : 'text-slate-800'}`}>{gv.name}</span>
                              </div>
                              <span className={`font-medium ${gv.full ? 'text-slate-400' : 'text-slate-500'}`}>{gv.load}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
