import React, { useState } from 'react';
import { 
  ChevronDown, Check, Eye, Download, 
  BarChart2, Users, UserX, CheckCircle, XOctagon, FileCheck
} from 'lucide-react';

export default function BaoCaoThongKe_Khoa() {
  // Dropdown States for Filters
  const [isNamHocDropdownOpen, setIsNamHocDropdownOpen] = useState(false);
  const [selectedNamHoc, setSelectedNamHoc] = useState('');
  const namHocOptions = ["2025-2026", "2024-2025", "2023-2024"];

  const [isKhoaDropdownOpen, setIsKhoaDropdownOpen] = useState(false);
  const [selectedKhoa, setSelectedKhoa] = useState('');
  const khoaOptions = ["Khóa 14", "Khóa 13", "Khóa 12"];

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsNamHocDropdownOpen(false);
    setIsKhoaDropdownOpen(false);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(true);
  };

  // Mock Report Types
  const reports = [
    {
      id: 1,
      name: 'Tổng hợp dữ liệu tham quan',
      desc: 'Báo cáo tổng quan về số lượng chuyến đi, số sinh viên tham gia và thống kê theo từng doanh nghiệp liên kết.',
      icon: <BarChart2 className="w-6 h-6 text-[#407F3E]" />,
      bgIcon: 'bg-[#407F3E]/10'
    },
    {
      id: 2,
      name: 'Danh sách SV đã tham quan',
      desc: 'Danh sách chi tiết các sinh viên đã hoàn thành tối thiểu 1 chuyến tham quan thực tế tại doanh nghiệp.',
      icon: <Users className="w-6 h-6 text-[#89B449]" />,
      bgIcon: 'bg-[#89B449]/10'
    },
    {
      id: 3,
      name: 'Danh sách SV chưa tham quan',
      desc: 'Danh sách các sinh viên đăng ký môn học nhưng chưa tham gia hoặc vắng mặt trong các chuyến đi.',
      icon: <UserX className="w-6 h-6 text-[#DBD468]" />,
      bgIcon: 'bg-[#DBD468]/15'
    },
    {
      id: 4,
      name: 'Danh sách SV đủ điều kiện báo cáo',
      desc: 'Sinh viên đã đáp ứng đủ các tiêu chí: đóng phí đầy đủ và tham gia ít nhất 1 chuyến tham quan để làm báo cáo.',
      icon: <CheckCircle className="w-6 h-6 text-teal-600" />,
      bgIcon: 'bg-teal-50'
    },
    {
      id: 5,
      name: 'Danh sách SV không thực hiện',
      desc: 'Những sinh viên vi phạm quy chế hoặc bị cấm thi, không đủ điều kiện làm báo cáo thu hoạch cuối kỳ.',
      icon: <XOctagon className="w-6 h-6 text-[#E68A8C]" />,
      bgIcon: 'bg-[#E68A8C]/10'
    },
    {
      id: 6,
      name: 'Danh sách SV đạt/không đạt',
      desc: 'Bảng điểm tổng kết cuối cùng, hiển thị rõ trạng thái Đạt hoặc Không Đạt của từng sinh viên.',
      icon: <FileCheck className="w-6 h-6 text-indigo-600" />,
      bgIcon: 'bg-indigo-50'
    }
  ];

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Báo cáo thống kê</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 relative z-20 mb-8">
        
        {/* Năm học Dropdown */}
        <div className="relative min-w-[250px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Năm học</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsNamHocDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isNamHocDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedNamHoc ? 'text-slate-700' : 'text-slate-400'}`}>{selectedNamHoc || 'Chọn năm học'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isNamHocDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {namHocOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setSelectedNamHoc(opt); setIsNamHocDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedNamHoc === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {selectedNamHoc === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Khóa Dropdown */}
        <div className="relative min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Khóa</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsKhoaDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isKhoaDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedKhoa ? 'text-slate-700' : 'text-slate-400'}`}>{selectedKhoa || 'Chọn khóa'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isKhoaDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {khoaOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setSelectedKhoa(opt); setIsKhoaDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedKhoa === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {selectedKhoa === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10">
        {reports.map(report => (
          <div key={report.id} className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.bgIcon}`}>
                  {report.icon}
                </div>
                <h3 className="text-lg font-black text-slate-800">{report.name}</h3>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
                {report.desc}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-[#E7E0C4]/50">
              <button className="flex-1 py-2.5 border border-[#E7E0C4] hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Eye className="w-4 h-4" />
                Xem
              </button>
              <button className="flex-1 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer">
                <Download className="w-4 h-4" />
                Xuất Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
