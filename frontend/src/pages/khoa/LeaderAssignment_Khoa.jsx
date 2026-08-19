import React, { useState } from 'react';
import { 
  ChevronDown, Check, Search, MapPin, 
  UserCircle, UserPlus, Calendar, Clock
} from 'lucide-react';

export default function LeaderAssignment_Khoa() {
  // Dropdown States for Filters
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');
  const lichOptions = ["Đợt kiến tập - Học kỳ 1 - 2025-2026", "Đợt kiến tập - Học kỳ 2 - 2024-2025"];

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ["Tất cả", "Đã phân công", "Chờ phân công"];

  // Specific inline dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(1); // Keep row 1 open to match mockup requirement

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
    setIsStatusDropdownOpen(false);
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
      closeAllDropdowns();
      setOpenDropdownId(id);
    }
  }

  // Mock Data
  const trips = [
    { 
      id: 1, 
      nhaMay: 'Vinamilk Bình Dương', 
      ngay: '25/08/2026', 
      gio: '07:30 - 11:30', 
      hinhThuc: 'Trực tiếp', 
      toChuc: 'Do khoa tổ chức', 
      gv: null 
    },
    { 
      id: 2, 
      nhaMay: 'Acecook HCM', 
      ngay: '26/08/2026', 
      gio: '13:00 - 16:30', 
      hinhThuc: 'Trực tiếp', 
      toChuc: 'Do khoa tổ chức', 
      gv: 'Lê Minh Tuấn' 
    },
    { 
      id: 3, 
      nhaMay: 'CP Group Việt Nam', 
      ngay: '30/08/2026', 
      gio: '08:00 - 16:00', 
      hinhThuc: 'Trực tiếp', 
      toChuc: 'Tự do', 
      gv: 'Nguyễn Văn A' 
    },
    { 
      id: 4, 
      nhaMay: 'Nutifood Bình Dương', 
      ngay: '05/09/2026', 
      gio: '08:00 - 11:30', 
      hinhThuc: 'Trực tuyến', 
      toChuc: 'Do khoa tổ chức', 
      gv: null 
    },
  ];

  const gvOptions = [
    { id: 1, name: 'Phạm Thị D', status: 'free' },
    { id: 2, name: 'Hoàng Văn E', status: 'conflict' },
    { id: 3, name: 'Vũ Thị F', status: 'free' },
  ];

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Phân công GV dẫn đoàn</h1>
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

        {/* Trạng thái Dropdown */}
        <div className="relative min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Trạng thái phân công</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsStatusDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedStatus ? 'text-slate-700' : 'text-slate-400'}`}>{selectedStatus || 'Tất cả'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isStatusDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
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
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">Chuyến tham quan</th>
                <th className="p-4 text-center">Hình thức</th>
                <th className="p-4 text-center">Cách tổ chức</th>
                <th className="p-4">GV dẫn đoàn hiện tại</th>
                <th className="p-4 text-right pr-6 w-[200px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {trips.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-4 h-4 text-[#407F3E]" />
                      {t.nhaMay}
                    </div>
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {t.ngay}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.gio}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${
                      t.hinhThuc === 'Trực tiếp' ? 'bg-[#89B449]/10 text-[#407F3E] border-[#89B449]/20' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {t.hinhThuc}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold border ${
                      t.toChuc === 'Do khoa tổ chức' ? 'bg-[#407F3E]/10 text-[#407F3E] border-[#407F3E]/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {t.toChuc}
                    </span>
                  </td>
                  <td className="p-4">
                    {t.toChuc === 'Do khoa tổ chức' ? (
                      t.gv ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E7E0C4]/40 text-slate-700 border border-[#E7E0C4]">
                          <UserCircle className="w-4 h-4 text-[#407F3E]" />
                          {t.gv}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                          Chưa phân công
                        </span>
                      )
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E7E0C4]/40 text-slate-700 border border-[#E7E0C4]">
                          <UserCircle className="w-4 h-4 text-[#407F3E]" />
                          {t.gv}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          Tự động (GVHD)
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right pr-6 relative">
                    {t.toChuc === 'Do khoa tổ chức' && (
                      <>
                        <button 
                          onClick={(e) => toggleInlineDropdown(e, t.id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-end gap-2 ml-auto ${
                            openDropdownId === t.id 
                              ? 'bg-[#407F3E] text-white shadow-sm' 
                              : 'bg-slate-50 border border-slate-200 text-[#407F3E] hover:bg-[#407F3E]/10'
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Phân công
                        </button>

                        {/* Inline Dropdown */}
                        {openDropdownId === t.id && (
                          <div 
                            className="absolute top-full right-6 mt-1 w-[240px] bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 origin-top-right text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 border-b border-[#E7E0C4] bg-slate-50">
                              <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input 
                                  type="text" 
                                  placeholder="Tìm kiếm Giảng viên..." 
                                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                                />
                              </div>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto py-1">
                              {gvOptions.map(gv => (
                                <div 
                                  key={gv.id}
                                  className="px-4 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer hover:bg-[#E7E0C4]/30"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#407F3E]">
                                      {gv.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-slate-800">{gv.name}</span>
                                  </div>
                                  <div 
                                    className={`w-2.5 h-2.5 rounded-full shadow-sm ${gv.status === 'free' ? 'bg-[#89B449]' : 'bg-[#E68A8C]'}`}
                                    title={gv.status === 'free' ? 'Khả dụng' : 'Trùng lịch'}
                                  ></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
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
