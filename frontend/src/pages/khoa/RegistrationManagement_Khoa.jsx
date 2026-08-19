import React, { useState } from 'react';
import { 
  ChevronDown, Check, ChevronRight, Paperclip, 
  CheckCircle2, XCircle, Filter, Download
} from 'lucide-react';

export default function RegistrationManagement_Khoa() {
  const [activeTab, setActiveTab] = useState('danhsach'); // 'danhsach' | 'huy' | 'chot'

  // Dropdown States for Filters
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');
  const lichOptions = ["Đợt 1 - 2025-2026", "Đợt 2 - 2025-2026"];

  const [isChuyenDropdownOpen, setIsChuyenDropdownOpen] = useState(false);
  const [selectedChuyen, setSelectedChuyen] = useState('');
  const chuyenOptions = ["Vinamilk Bình Dương", "Acecook HCM"];

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ["Chờ duyệt", "Hợp lệ", "Bị loại", "Đã hủy", "Đã tham gia", "Vắng mặt", "Hoàn thành", "Không đạt"];

  const [isChotChuyenDropdownOpen, setIsChotChuyenDropdownOpen] = useState(false);
  const [selectedChotChuyen, setSelectedChotChuyen] = useState('');

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
    setIsChuyenDropdownOpen(false);
    setIsStatusDropdownOpen(false);
    setIsChotChuyenDropdownOpen(false);
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
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
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
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{priority}</span>;
    }
  };

  // Mock Data
  const regs = [
    { id: 1, mssv: '2001215001', ten: 'Nguyễn Văn An', chuyen: 'Vinamilk Bình Dương', ngay: '20/08/2026', trangThai: 'Hợp lệ' },
    { id: 2, mssv: '2001215002', ten: 'Trần Thị Bình', chuyen: 'Acecook HCM', ngay: '21/08/2026', trangThai: 'Chờ duyệt' },
    { id: 3, mssv: '2001215003', ten: 'Lê Hoàng Cường', chuyen: 'Vinamilk Bình Dương', ngay: '22/08/2026', trangThai: 'Bị loại' },
    { id: 4, mssv: '2001215004', ten: 'Phạm Duy Khang', chuyen: 'Yakult HCM', ngay: '23/08/2026', trangThai: 'Đã hủy' },
    { id: 5, mssv: '2001215005', ten: 'Vũ Quốc Huy', chuyen: 'Vinamilk Bình Dương', ngay: '24/08/2026', trangThai: 'Hợp lệ' },
  ];

  const cancelRequests = [
    { id: 1, mssv: '2001215111', ten: 'Hoàng Thị Yến', chuyen: 'Acecook HCM', lydo: 'Bệnh đột xuất, phải nhập viện điều trị...', file: 'Giay_xac_nhan_bv.pdf', ngay: '25/08/2026' },
    { id: 2, mssv: '2001215112', ten: 'Trần Tuấn Anh', chuyen: 'Vinamilk Bình Dương', lydo: 'Gia đình có việc gấp ở quê không thể...', file: 'Don_xin_phep.docx', ngay: '26/08/2026' },
  ];

  const chotList = [
    { id: 1, mssv: '2001210001', ten: 'Đinh Hữu Lộc', priority: 'K12-K13 ưu tiên', time: '15/08/2026 08:00', checked: true },
    { id: 2, mssv: '2001210002', ten: 'Nguyễn Bích Ngọc', priority: 'K14 ưu tiên', time: '15/08/2026 08:05', checked: true },
    { id: 3, mssv: '2001210003', ten: 'Trần Đại Nghĩa', priority: 'Theo thứ tự đăng ký', time: '15/08/2026 08:30', checked: true },
    { id: 4, mssv: '2001210004', ten: 'Lý Tiểu Long', priority: 'Danh sách đen', time: '15/08/2026 09:15', checked: false },
    { id: 5, mssv: '2001210005', ten: 'Phan Thị Mai', priority: 'Theo thứ tự đăng ký', time: '16/08/2026 10:00', checked: false },
  ];

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý đăng ký</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E7E0C4] mb-6">
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
            2
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

      {/* Tab 1: Danh sách đăng ký */}
      {activeTab === 'danhsach' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 relative z-20">
            {/* Lịch Dropdown */}
            <div className="relative min-w-[200px] flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Lịch kiến tập</label>
              <div 
                onClick={(e) => handleDropdownClick(e, setIsLichDropdownOpen)}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
              >
                <span className={`truncate pr-2 font-medium ${selectedLich ? 'text-slate-700' : 'text-slate-400'}`}>{selectedLich || 'Tất cả lịch'}</span>
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
                  {chuyenOptions.map(opt => (
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

          {/* Table */}
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
                  {regs.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{r.mssv}</td>
                      <td className="p-4 font-bold text-slate-800">{r.ten}</td>
                      <td className="p-4 font-medium text-slate-600">{r.chuyen}</td>
                      <td className="p-4 font-medium text-slate-500">{r.ngay}</td>
                      <td className="p-4 text-center">
                        {getStatusBadge(r.trangThai)}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                          title="Chi tiết"
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
                      <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{r.mssv}</td>
                      <td className="p-4 font-bold text-slate-800">{r.ten}</td>
                      <td className="p-4 font-medium text-slate-600">{r.chuyen}</td>
                      <td className="p-4 font-medium text-slate-500 max-w-[200px] truncate" title={r.lydo}>{r.lydo}</td>
                      <td className="p-4 text-center">
                        <a href="#" className="inline-flex items-center gap-1 text-xs font-bold text-[#407F3E] hover:underline bg-[#407F3E]/10 px-2 py-1 rounded">
                          <Paperclip className="w-3.5 h-3.5" />
                          {r.file}
                        </a>
                      </td>
                      <td className="p-4 font-medium text-slate-500">{r.ngay}</td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-3 py-1.5 bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer">
                            <CheckCircle2 className="w-4 h-4" />
                            Duyệt
                          </button>
                          <button className="px-3 py-1.5 border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer">
                            <XCircle className="w-4 h-4" />
                            Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                onClick={(e) => handleDropdownClick(e, setIsChotChuyenDropdownOpen)}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isChotChuyenDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
              >
                <span className={`truncate pr-2 font-medium ${selectedChotChuyen ? 'text-slate-800' : 'text-slate-400'}`}>{selectedChotChuyen || 'Vinamilk Bình Dương (25/08/2026)'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              {isChotChuyenDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
                  {["Vinamilk Bình Dương (25/08/2026)", "Acecook HCM (26/08/2026)"].map(opt => (
                    <div 
                      key={opt}
                      onClick={() => { setSelectedChotChuyen(opt); setIsChotChuyenDropdownOpen(false); }}
                      className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        selectedChotChuyen === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      {selectedChotChuyen === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-600">18/20 đã chọn</span>
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
                  {chotList.map(r => (
                    <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${r.checked ? 'bg-[#89B449]/5' : ''}`}>
                      <td className="p-4 pl-6">
                        <input type="checkbox" className="w-4 h-4 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer" checked={r.checked} readOnly />
                      </td>
                      <td className={`p-4 font-mono font-bold ${r.checked ? 'text-[#407F3E]' : 'text-slate-500'}`}>{r.mssv}</td>
                      <td className="p-4 font-bold text-slate-800">{r.ten}</td>
                      <td className="p-4">
                        {getPriorityBadge(r.priority)}
                      </td>
                      <td className="p-4 font-medium text-slate-500 text-right pr-6">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
