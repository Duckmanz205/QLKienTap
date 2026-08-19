import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ChevronDown, Check,
  Edit2, Building2, Wifi, Users
} from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function DanhMuc_NhaMay_Khoa() {
  const [factories, setFactories] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNhomNganh, setFilterNhomNganh] = useState('Tất cả nhóm ngành');
  const [isNhomNganhDropdownOpen, setIsNhomNganhDropdownOpen] = useState(false);
  
  const [filterTrangThai, setFilterTrangThai] = useState('Tất cả');
  const [isTrangThaiDropdownOpen, setIsTrangThaiDropdownOpen] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    fetchFactories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterNhomNganh, filterTrangThai]);

  const fetchFactories = async () => {
    try {
      const res = await khoaApi.getFactories();
      setFactories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const nhomNganhOptions = [
    "Tất cả nhóm ngành", "Đồ uống", "Sữa - dầu - chất béo", "Đường - bánh - kẹo", 
    "Trà - cà phê - ca cao", "Lương thực - bột mì - mì ăn liền", "Nước chấm - gia vị", 
    "Chế biến thủy sản", "Trung tâm phân tích - kiểm nghiệm"
  ];

  const trangThaiOptions = ["Tất cả", "Hoạt động", "Ngừng hợp tác"];

  const filteredFactories = factories.filter(f => {
    const matchesSearch = f.ten_nha_may?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesNganh = true;
    if (filterNhomNganh !== "Tất cả nhóm ngành") {
      matchesNganh = f.nhom_nganh === filterNhomNganh;
    }

    let matchesTrangThai = true;
    if (filterTrangThai === "Hoạt động") matchesTrangThai = f.trang_thai === 'HoatDong';
    if (filterTrangThai === "Ngừng hợp tác") matchesTrangThai = f.trang_thai !== 'HoatDong';
    
    return matchesSearch && matchesNganh && matchesTrangThai;
  });

  const totalFactories = filteredFactories.length;
  const totalPages = Math.ceil(totalFactories / limit) || 1;
  const paginatedFactories = filteredFactories.slice((page - 1) * limit, page * limit);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-2 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Nhà máy</h1>
        <button className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" />
          Thêm nhà máy
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo tên nhà máy"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
          />
        </div>

        {/* Nhóm ngành Dropdown */}
        <div className="relative min-w-[220px]">
          <div 
            onClick={() => { setIsNhomNganhDropdownOpen(!isNhomNganhDropdownOpen); setIsTrangThaiDropdownOpen(false); }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isNhomNganhDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="text-slate-700 font-medium truncate pr-2">{filterNhomNganh}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isNhomNganhDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 max-h-[300px] overflow-y-auto">
              {nhomNganhOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setFilterNhomNganh(opt); setIsNhomNganhDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    (filterNhomNganh === opt) 
                      ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                      : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {filterNhomNganh === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trạng thái Dropdown */}
        <div className="relative min-w-[160px]">
          <div 
            onClick={() => { setIsTrangThaiDropdownOpen(!isTrangThaiDropdownOpen); setIsNhomNganhDropdownOpen(false); }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isTrangThaiDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="text-slate-700 font-medium">{filterTrangThai}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          {isTrangThaiDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {trangThaiOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setFilterTrangThai(opt); setIsTrangThaiDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    (filterTrangThai === opt) 
                      ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                      : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                  }`}
                >
                  {opt}
                  {filterTrangThai === opt && <Check className="w-4 h-4 text-[#407F3E]" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="relative z-10 space-y-6">
        {paginatedFactories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] p-12 text-center text-slate-500 font-medium">
            Không tìm thấy nhà máy nào khớp điều kiện
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedFactories.map(f => {
              const isHoatDong = f.trang_thai === 'HoatDong';
              return (
                <div key={f.id} className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden group hover:shadow-md transition-all relative flex flex-col">
                  {/* Placeholder Image Header */}
                  <div className="h-32 bg-slate-100 w-full flex items-center justify-center relative overflow-hidden">
                    <Building2 className="w-12 h-12 text-slate-300" />
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#407F3E 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                    
                    {/* Status Pill */}
                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border ${
                      isHoatDong 
                        ? 'bg-[#89B449] text-white border-[#407F3E]/20' 
                        : 'bg-slate-200 text-slate-500 border-slate-300'
                    }`}>
                      {isHoatDong ? 'Hoạt động' : 'Ngừng hợp tác'}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{f.ten_nha_may}</h3>
                    <p className="text-xs text-slate-500 mb-4 flex-1">{f.dia_chi}</p>
                    
                    <div className="space-y-3">
                      {/* Nhóm ngành tag */}
                      <div>
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold border border-slate-200 truncate max-w-full">
                          {f.nhom_nganh}
                        </span>
                      </div>

                      {/* Capabilities badges & Edit action */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#E7E0C4]/50">
                        <div className="flex gap-2">
                          {/* Trực tiếp Badge */}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                            f.ho_tro_truc_tiep 
                              ? 'bg-[#89B449]/20 text-[#407F3E] border border-[#89B449]/30' 
                              : 'bg-white text-slate-400 border border-slate-200'
                          }`}>
                            <Users className="w-3 h-3" />
                            Trực tiếp
                          </div>
                          
                          {/* Trực tuyến Badge */}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                            f.ho_tro_truc_tuyen 
                              ? 'bg-[#89B449]/20 text-[#407F3E] border border-[#89B449]/30' 
                              : 'bg-white text-slate-400 border border-slate-200'
                          }`}>
                            <Wifi className="w-3 h-3" />
                            Trực tuyến
                          </div>
                        </div>

                        {/* Edit Button */}
                        <button className="p-2 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" title="Chỉnh sửa thông tin">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {paginatedFactories.length > 0 && (
          <div className="p-4 border border-[#E7E0C4] bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span>Hiển thị</span>
              <select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>/ {totalFactories} nhà máy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(1)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trang đầu
              </button>
              <button 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trước
              </button>
              
              <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                Trang {page} / {totalPages}
              </span>
              
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Sau
              </button>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trang cuối
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
