import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, Check, Search, MapPin, 
  UserCircle, UserPlus, Calendar, Clock, AlertCircle, Star
} from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function LeaderAssignment_Khoa() {
  const [schedules, setSchedules] = useState([]);
  const [trips, setTrips] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  // Dropdown States for Filters
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ["Tất cả", "Đã phân công", "Chưa phân công"];

  // Specific inline dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(null); 
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [isTruongDoan, setIsTruongDoan] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [schRes, lecRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getLecturers()
      ]);
      setSchedules(schRes.data);
      setLecturers(lecRes.data);
      if (schRes.data.length > 0) {
        setSelectedLich(schRes.data[0].id);
      }
      fetchTrips();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await khoaApi.getTrips();
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (tripId) => {
    if (!selectedLecturerId) {
      alert("Vui lòng chọn giảng viên");
      return;
    }
    try {
      await khoaApi.assignGvdd({
        chuyenKienTapId: tripId,
        lecturerId: selectedLecturerId,
        laTruongDoan: isTruongDoan
      });
      alert('Phân công thành công!');
      setOpenDropdownId(null);
      setSelectedLecturerId('');
      fetchTrips();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi phân công');
    }
  };

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
  };

  const filteredTrips = trips.filter(t => {
    if (selectedLich && t.lich_kien_tap_id !== selectedLich) return false;
    const gvdd = t.giaoVienDanDoan || [];
    if (selectedStatus === 'Đã phân công' && gvdd.length === 0) return false;
    if (selectedStatus === 'Chưa phân công' && gvdd.length > 0) return false;
    return true;
  });

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
            <span className={`truncate pr-2 font-medium ${selectedLich ? 'text-slate-700' : 'text-slate-400'}`}>
              {schedules.find(s => s.id === selectedLich)?.ten_dot || 'Chọn lịch kiến tập'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isLichDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {schedules.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => { setSelectedLich(opt.id); setIsLichDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedLich === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt.ten_dot}</span>
                  {selectedLich === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
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
                  onClick={() => { setSelectedStatus(opt === 'Tất cả' ? '' : opt); setIsStatusDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedStatus === opt || (selectedStatus === '' && opt === 'Tất cả') ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {(selectedStatus === opt || (selectedStatus === '' && opt === 'Tất cả')) && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
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
              {filteredTrips.map(t => {
                const isKhoa = t.to_chuc === 'KHOA';
                const hinhThuc = t.hinh_thuc === 'OFFLINE' ? 'Trực tiếp' : 'Trực tuyến';
                const gvdd = t.giaoVienDanDoan || [];
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-4 h-4 text-[#407F3E]" />
                        {t.nhaMay?.ten_nha_may || 'Đang cập nhật'}
                      </div>
                      <div className="text-xs font-medium text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.gio_bat_dau} - {t.gio_ket_thuc}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${
                        hinhThuc === 'Trực tiếp' ? 'bg-[#89B449]/10 text-[#407F3E] border-[#89B449]/20' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {hinhThuc}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold border ${
                        isKhoa ? 'bg-[#407F3E]/10 text-[#407F3E] border-[#407F3E]/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {isKhoa ? 'Do khoa tổ chức' : 'Tự do'}
                      </span>
                    </td>
                    <td className="p-4">
                      {isKhoa ? (
                        gvdd.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {gvdd.map(l => (
                              <div key={l.id} className="flex items-center gap-1">
                                {l.la_truong_doan ? (
                                  <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[9px] px-1 py-0.5 rounded font-bold flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Trưởng đoàn
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] px-1 py-0.5 rounded font-bold">
                                    Phó đoàn
                                  </span>
                                )}
                                <span className="font-bold text-slate-800">{l.giangVien?.ho_ten}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                            Chưa phân công
                          </span>
                        )
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          {gvdd.length > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E7E0C4]/40 text-slate-700 border border-[#E7E0C4]">
                              <UserCircle className="w-4 h-4 text-[#407F3E]" />
                              {gvdd[0].giangVien?.ho_ten}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                              Chưa phân công
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            Tự động (GVHD)
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6 relative">
                      {isKhoa && (
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
                              className="absolute top-full right-6 mt-1 w-[260px] bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 origin-top-right text-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="p-3 border-b border-[#E7E0C4] bg-slate-50">
                                <label className="block text-xs font-bold text-slate-700 mb-2">Chọn vai trò:</label>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-1 text-sm font-medium cursor-pointer">
                                    <input type="radio" checked={isTruongDoan} onChange={() => setIsTruongDoan(true)} className="text-[#407F3E] focus:ring-[#407F3E]" />
                                    Trưởng đoàn
                                  </label>
                                  <label className="flex items-center gap-1 text-sm font-medium cursor-pointer">
                                    <input type="radio" checked={!isTruongDoan} onChange={() => setIsTruongDoan(false)} className="text-[#407F3E] focus:ring-[#407F3E]" />
                                    Phó đoàn
                                  </label>
                                </div>
                              </div>
                              <div className="max-h-[200px] overflow-y-auto py-1">
                                {lecturers.map(gv => (
                                  <div 
                                    key={gv.id}
                                    onClick={() => setSelectedLecturerId(gv.id)}
                                    className={`px-4 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer hover:bg-[#E7E0C4]/30 ${selectedLecturerId === gv.id ? 'bg-[#E7E0C4]/50' : ''}`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#407F3E]">
                                        {gv.ho_ten?.charAt(0)}
                                      </div>
                                      <span className="font-bold text-slate-800">{gv.ho_ten}</span>
                                    </div>
                                    {selectedLecturerId === gv.id && <Check className="w-4 h-4 text-[#407F3E]" />}
                                  </div>
                                ))}
                              </div>
                              <div className="p-2 border-t border-[#E7E0C4] bg-slate-50 flex justify-end">
                                <button 
                                  onClick={() => handleAssign(t.id)}
                                  className="px-3 py-1.5 bg-[#407F3E] text-white rounded text-xs font-bold w-full"
                                >
                                  Lưu phân công
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">
                    Không tìm thấy chuyến đi nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
