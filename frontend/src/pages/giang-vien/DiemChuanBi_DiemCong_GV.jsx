import React, { useState, useEffect, useMemo } from 'react';
import { 
  Info, ChevronDown, Check, Save, Plus, Minus, Search
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function DiemChuanBi_DiemCong_GV() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tripSearch, setTripSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  
  const [lecturer, setLecturer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchTrips(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchTrips = async (gvId) => {
    try {
      const res = await giangVienApi.getLedTrips(gvId);
      const tripsData = res.data || [];
      const formattedTrips = tripsData.map(t => ({
        id: t.id,
        name: `${t.nhaMay?.ten_nha_may || 'Chuyến đi'} (${new Date(t.ngay_tham_quan || t.ngay_khoi_hanh || Date.now()).toLocaleDateString('vi-VN')})`
      }));
      setTrips(formattedTrips);
      if (formattedTrips.length > 0) {
        setSelectedTrip(formattedTrips[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedTrip) {
      fetchStudents(selectedTrip.id);
      setCurrentPage(1);
    }
  }, [selectedTrip]);

  const fetchStudents = async (tripId) => {
    try {
      setLoading(true);
      const res = await giangVienApi.getTripRegistrations(tripId);
      const data = res.data || [];
      
      const mapped = data.map(phieu => ({
        id: phieu.id, // phieuId
        mssv: phieu.sinhVien?.mssv,
        name: phieu.sinhVien?.ho_ten,
        diemChuanBi: phieu.diem_chuan_bi !== null ? String(phieu.diem_chuan_bi) : '',
        diemCong: phieu.diem_cong !== null ? Number(phieu.diem_cong) : 0,
        ghiChu: '' // not stored in DB currently based on API, but keep in UI
      }));
      
      setStudents(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (id, field, value) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleBonusChange = (id, delta) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        let newBonus = s.diemCong + delta;
        if (newBonus > 1.0) newBonus = 1.0;
        if (newBonus < 0) newBonus = 0;
        return { ...s, diemCong: newBonus };
      }
      return s;
    }));
  };

  const handleSaveScores = async () => {
    if (students.length === 0) return;
    try {
      setLoading(true);
      const promises = students.map(student => {
        return giangVienApi.gradePrepAndBonus({
          phieuId: student.id,
          diemChuanBi: student.diemChuanBi ? Number(student.diemChuanBi) : 0,
          diemCong: Number(student.diemCong)
        });
      });
      await Promise.all(promises);
      alert('Đã lưu điểm chuẩn bị & điểm cộng thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu điểm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Paginated logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (s.name && s.name.toLowerCase().includes(q)) || (s.mssv && s.mssv.includes(q));
    });
  }, [students, searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / limit) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative" onClick={() => setIsDropdownOpen(false)}>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Điểm chuẩn bị & điểm cộng</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo MSSV/họ tên..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all text-slate-800 font-medium"
          />
        </div>

        {/* Trip Selector Popover */}
        <div className="relative min-w-[280px] flex-1" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="truncate pr-2 font-medium text-slate-700">
              {selectedTrip ? selectedTrip.name : 'Đang tải chuyến...'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isDropdownOpen && trips.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1 max-h-64 flex flex-col">
              <div className="p-2 border-b border-[#E7E0C4] sticky top-0 bg-white z-10">
                <input
                  type="text"
                  placeholder="Tìm chuyến đi..."
                  value={tripSearch}
                  onChange={(e) => setTripSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-[#E7E0C4] rounded-lg focus:outline-none focus:border-[#407F3E]"
                />
              </div>
              <div className="overflow-y-auto">
                {trips
                  .filter(t => !tripSearch || t.name.toLowerCase().includes(tripSearch.toLowerCase()))
                  .map(trip => (
                    <div 
                      key={trip.id}
                      onClick={() => {
                        setSelectedTrip(trip);
                        setIsDropdownOpen(false);
                        setTripSearch('');
                      }}
                      className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        selectedTrip?.id === trip.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-2">{trip.name}</span>
                      {selectedTrip?.id === trip.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                {trips.filter(t => !tripSearch || t.name.toLowerCase().includes(tripSearch.toLowerCase())).length === 0 && (
                  <div className="px-4 py-3 text-xs text-slate-500 text-center">Không tìm thấy chuyến đi</div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Info Banner */}
      <div className="bg-[#E7E0C4] rounded-xl p-4 flex items-start gap-3 shadow-sm border border-[#E7E0C4]/50 mb-8">
        <Info className="w-5 h-5 text-[#407F3E] shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-slate-700 leading-relaxed">
          <strong className="text-slate-800">Lưu ý:</strong> Điểm chuẩn bị lấy từ bài kiểm tra tổ chức ngoài hệ thống (Google Form/Kahoot...). 
          Với chuyến tự do, đây là bài do GVHD tổ chức riêng. Điểm cộng tối đa là 1.0 điểm/chuyến.
        </p>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible pb-24 md:pb-0">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 min-w-[120px]">MSSV</th>
                <th className="p-4 min-w-[200px]">Họ tên</th>
                <th className="p-4 text-center min-w-[150px]">Điểm chuẩn bị<br/><span className="text-[10px] text-slate-500 font-medium normal-case">(Hệ số 10)</span></th>
                <th className="p-4 text-center min-w-[180px]">Điểm cộng</th>
                <th className="p-4 pr-6 min-w-[200px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Không tìm thấy sinh viên nào.</td>
                </tr>
              ) : (
                paginatedStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    
                    <td className="p-4 pl-6 font-mono font-bold text-slate-600">{student.mssv}</td>
                    
                    <td className="p-4 font-bold text-slate-800">{student.name}</td>
                    
                    <td className="p-4">
                      <div className="flex justify-center">
                        <input 
                          type="number" 
                          min="0" max="10" step="0.1"
                          value={student.diemChuanBi}
                          onChange={(e) => handleScoreChange(student.id, 'diemChuanBi', e.target.value)}
                          placeholder="--"
                          className="w-20 px-3 py-2 text-center bg-white border border-[#E7E0C4] rounded-lg text-sm font-bold text-[#407F3E] focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all placeholder-slate-300"
                        />
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <button 
                            onClick={() => handleBonusChange(student.id, -0.5)}
                            disabled={student.diemCong <= 0}
                            className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="w-16 text-center font-bold text-xs">
                            <span className={student.diemCong > 0 ? "text-[#89B449]" : "text-slate-500"}>
                              {student.diemCong > 0 ? `+${student.diemCong.toFixed(1)}` : '0.0'}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => handleBonusChange(student.id, 0.5)}
                            disabled={student.diemCong >= 1.0}
                            className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:text-[#407F3E] hover:border-[#407F3E] hover:bg-[#407F3E]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xs group"
                          >
                            <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">Tối đa 1.0 đ</span>
                      </div>
                    </td>
                    
                    <td className="p-4 pr-6">
                      <input 
                        type="text" 
                        value={student.ghiChu}
                        onChange={(e) => handleScoreChange(student.id, 'ghiChu', e.target.value)}
                        placeholder="Ghi chú (tùy chọn)..."
                        className="w-full px-3 py-2 bg-transparent border-b border-transparent hover:border-[#E7E0C4] focus:bg-white focus:border-[#E7E0C4] focus:outline-none focus:ring-1 focus:ring-[#E7E0C4] rounded-none focus:rounded-md text-xs text-slate-700 placeholder-slate-300 transition-all"
                      />
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <select 
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                setCurrentPage(1);
              }}
              className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>/ {filteredStudents.length} sinh viên</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {currentPage} / {totalPages}
            </span>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-6 duration-500 delay-300">
        <button 
          onClick={handleSaveScores}
          disabled={loading || students.length === 0}
          className="flex items-center gap-2 px-8 py-3.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer font-bold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          Lưu điểm
        </button>
      </div>

    </div>
  );
}
