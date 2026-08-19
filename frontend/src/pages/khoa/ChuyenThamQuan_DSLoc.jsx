import React, { useState } from 'react';
import { 
  Plus, ChevronDown, Check, X, Calendar, Clock, MapPin, 
  ChevronRight, Users, CheckCircle2, XCircle
} from 'lucide-react';

export default function ChuyenThamQuan_DSLoc() {
  const [activeTab, setActiveTab] = useState('khoa'); // 'khoa' | 'tudo'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dropdown States for Modal
  const [isNhaMayDropdownOpen, setIsNhaMayDropdownOpen] = useState(false);
  const [selectedNhaMay, setSelectedNhaMay] = useState('');
  const nhaMayOptions = ["Vinamilk", "Acecook", "Nutifood", "Yakult", "Kewpie"];

  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');
  const lichOptions = ["Đợt kiến tập - Học kỳ 1 - 2025-2026", "Đợt kiến tập - Học kỳ 2 - 2024-2025"];

  const [isHinhThucDropdownOpen, setIsHinhThucDropdownOpen] = useState(false);
  const [selectedHinhThuc, setSelectedHinhThuc] = useState('');
  const hinhThucOptions = ["Trực tiếp", "Trực tuyến"];

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsNhaMayDropdownOpen(false);
    setIsLichDropdownOpen(false);
    setIsHinhThucDropdownOpen(false);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(true);
  };

  // Mock Data
  const tripsKhoa = [
    { id: 1, nhaMay: 'Vinamilk Bình Dương', ngay: '25/08/2026', gio: '07:30 - 11:30', hinhThuc: 'Trực tiếp', used: 12, max: 20, trangThai: 'Mở đăng ký' },
    { id: 2, nhaMay: 'Yakult Hồ Chí Minh', ngay: '28/08/2026', gio: '13:00 - 16:30', hinhThuc: 'Trực tiếp', used: 40, max: 40, trangThai: 'Đã chốt DS' },
    { id: 3, nhaMay: 'Nhà máy Ajinomoto', ngay: '05/09/2026', gio: '08:00 - 11:00', hinhThuc: 'Trực tuyến', used: 45, max: 100, trangThai: 'Mở đăng ký' },
  ];

  const tripsTuDo = [
    { id: 1, svName: 'Nguyễn Văn An', svMssv: '2001215001', svAvatar: 'https://i.pravatar.cc/150?u=1', nhaMay: 'CP Group Việt Nam', ngay: '30/08/2026', gvhd: 'Lê Minh Tuấn' },
    { id: 2, svName: 'Trần Thị Hoa', svMssv: '2001215002', svAvatar: 'https://i.pravatar.cc/150?u=2', nhaMay: 'FrieslandCampina Hà Nam', ngay: '02/09/2026', gvhd: null },
    { id: 3, svName: 'Phạm Duy Khang', svMssv: '2001215003', svAvatar: 'https://i.pravatar.cc/150?u=3', nhaMay: 'Heineken Việt Nam', ngay: '10/09/2026', gvhd: 'Trần Thị Lan' },
    { id: 4, svName: 'Lê Tiến Dũng', svMssv: '2001215004', svAvatar: 'https://i.pravatar.cc/150?u=4', nhaMay: 'Suntory PepsiCo', ngay: '12/09/2026', gvhd: null },
    { id: 5, svName: 'Hoàng Quốc Việt', svMssv: '2001215005', svAvatar: 'https://i.pravatar.cc/150?u=5', nhaMay: 'Masan Consumer', ngay: '15/09/2026', gvhd: 'Đỗ Minh Phương' },
  ];

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Chuyến tham quan</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E7E0C4] mb-6">
        <button 
          onClick={() => setActiveTab('khoa')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'khoa' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Chuyến do khoa tổ chức
          {activeTab === 'khoa' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('tudo')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'tudo' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Chuyến tự do chờ duyệt
          <span className="bg-[#DBD468] text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
            5
          </span>
          {activeTab === 'tudo' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Tab 1: Khoa tổ chức */}
      {activeTab === 'khoa' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-end">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
              className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tạo chuyến tham quan
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                    <th className="p-4 pl-6">Nhà máy</th>
                    <th className="p-4">Ngày tham quan</th>
                    <th className="p-4">Giờ</th>
                    <th className="p-4 text-center">Hình thức</th>
                    <th className="p-4">Sức chứa</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                  {tripsKhoa.map(t => {
                    const percent = (t.used / t.max) * 100;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-800">{t.nhaMay}</td>
                        <td className="p-4 font-medium text-slate-600">{t.ngay}</td>
                        <td className="p-4 font-medium text-slate-600">{t.gio}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${
                            t.hinhThuc === 'Trực tiếp' ? 'bg-[#89B449]/10 text-[#407F3E] border-[#89B449]/20' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {t.hinhThuc}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-between text-xs font-bold mb-1 text-slate-700">
                            <span>{t.used}/{t.max}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${percent >= 100 ? 'bg-[#E68A8C]' : 'bg-[#89B449]'}`} 
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm border ${
                            t.trangThai === 'Mở đăng ký' ? 'bg-[#89B449] text-white border-[#89B449]/20' : 'bg-[#407F3E] text-white border-[#407F3E]/20'
                          }`}>
                            {t.trangThai}
                          </span>
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
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tự do chờ duyệt */}
      {activeTab === 'tudo' && (
        <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden mt-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                    <th className="p-4 pl-6">Sinh viên đề xuất</th>
                    <th className="p-4">Nhà máy đề xuất</th>
                    <th className="p-4">Ngày tham quan</th>
                    <th className="p-4">GVHD hiện tại</th>
                    <th className="p-4 text-right pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                  {tripsTuDo.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img src={t.svAvatar} alt={t.svName} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                          <div>
                            <div className="font-bold text-slate-800">{t.svName}</div>
                            <div className="text-xs font-mono text-slate-500">{t.svMssv}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{t.nhaMay}</td>
                      <td className="p-4 font-medium text-slate-600">{t.ngay}</td>
                      <td className="p-4">
                        {t.gvhd ? (
                          <span className="font-bold text-[#407F3E] flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {t.gvhd}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                            Chưa có GVHD
                          </span>
                        )}
                      </td>
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

      {/* Modal - Tạo chuyến tham quan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
          ></div>
          
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()} // Stop click from propagating to overlay
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#407F3E]" />
                Tạo chuyến tham quan
              </h2>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-visible">
              
              {/* Row 1: Nhà máy & Lịch */}
              <div className="grid grid-cols-2 gap-5 relative">
                {/* Nhà máy */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nhà máy</label>
                  <div 
                    onClick={(e) => handleDropdownClick(e, setIsNhaMayDropdownOpen)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isNhaMayDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium ${selectedNhaMay ? 'text-slate-800' : 'text-slate-400'}`}>
                      {selectedNhaMay || 'Chọn nhà máy'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                  {isNhaMayDropdownOpen && (
                    <div className="absolute top-[70px] left-0 w-full bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
                      {nhaMayOptions.map(opt => (
                        <div 
                          key={opt}
                          onClick={(e) => { e.stopPropagation(); setSelectedNhaMay(opt); setIsNhaMayDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            selectedNhaMay === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                        >
                          {opt}
                          {selectedNhaMay === opt && <Check className="w-4 h-4 text-[#407F3E]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lịch kiến tập */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Lịch kiến tập</label>
                  <div 
                    onClick={(e) => handleDropdownClick(e, setIsLichDropdownOpen)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium truncate pr-2 ${selectedLich ? 'text-slate-800' : 'text-slate-400'}`}>
                      {selectedLich || 'Chọn lịch kiến tập'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                  {isLichDropdownOpen && (
                    <div className="absolute top-[70px] left-0 w-full bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
                      {lichOptions.map(opt => (
                        <div 
                          key={opt}
                          onClick={(e) => { e.stopPropagation(); setSelectedLich(opt); setIsLichDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
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

              {/* Row 2: Date & Time */}
              <div className="grid grid-cols-3 gap-5 relative z-40">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày tham quan</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium cursor-pointer"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Giờ bắt đầu</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="time"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium cursor-pointer"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Giờ kết thúc</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="time"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Hình thức & Sức chứa */}
              <div className="grid grid-cols-2 gap-5 relative z-30">
                {/* Hình thức */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Hình thức</label>
                  <div 
                    onClick={(e) => handleDropdownClick(e, setIsHinhThucDropdownOpen)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isHinhThucDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium ${selectedHinhThuc ? 'text-slate-800' : 'text-slate-400'}`}>
                      {selectedHinhThuc || 'Chọn hình thức'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                  {isHinhThucDropdownOpen && (
                    <div className="absolute top-[70px] left-0 w-full bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
                      {hinhThucOptions.map(opt => (
                        <div 
                          key={opt}
                          onClick={(e) => { e.stopPropagation(); setSelectedHinhThuc(opt); setIsHinhThucDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            selectedHinhThuc === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                        >
                          {opt}
                          {selectedHinhThuc === opt && <Check className="w-4 h-4 text-[#407F3E]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sức chứa */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Sức chứa</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      placeholder="VD: 40"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end gap-3 rounded-b-2xl z-10">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
