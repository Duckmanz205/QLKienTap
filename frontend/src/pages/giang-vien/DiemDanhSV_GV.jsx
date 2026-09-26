import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ChevronDown, Check, CheckCircle2, XCircle, FileWarning, Save
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function DiemDanhSV_GV() {
  const [isTripDropdownOpen, setIsTripDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchStatusDropdown, setSearchStatusDropdown] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tripSearch, setTripSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [lecturer, setLecturer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [students, setStudents] = useState([]);

  const closeAllDropdowns = () => {
    setIsTripDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

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
        id: phieu.id,
        mssv: phieu.sinhVien?.mssv,
        name: phieu.sinhVien?.ho_ten,
        status: phieu.trang_thai_diem_danh || null,
        note: phieu.ghi_chu_diem_danh || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(phieu.sinhVien?.ho_ten || 'SV')}&background=f1f5f9&color=475569`
      }));
      
      setStudents(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, status: newStatus, note: newStatus === 'TuChoiThamGia' ? s.note : '' };
      }
      return s;
    }));
  };

  const handleNoteChange = (studentId, newNote) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, note: newNote } : s));
  };

  const handleMarkAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'CoMat', note: '' })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedTrip || students.length === 0) return;
    try {
      setLoading(true);
      const records = students.map(s => ({
        phieuId: s.id,
        status: s.status || 'CoMat',
        note: s.note
      }));
      
      await giangVienApi.takeAttendance({
        tripId: selectedTrip.id,
        records
      });
      alert('Đã lưu điểm danh thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu điểm danh');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Paginated logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = !searchQuery || 
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (s.mssv && s.mssv.includes(searchQuery));
      const matchStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ChuaDiemDanh' && !s.status) ||
        (s.status === statusFilter);
      return matchSearch && matchStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / limit) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * limit, currentPage * limit);

  const attendedCount = students.filter(s => s.status !== null).length;
  const totalCount = students.length;

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Điểm danh sinh viên</h1>
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
        <div className="relative min-w-[260px] flex-1" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => {
              setIsTripDropdownOpen(!isTripDropdownOpen);
              setIsStatusDropdownOpen(false);
            }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isTripDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="truncate pr-2 font-medium text-slate-700">
              {selectedTrip ? selectedTrip.name : 'Đang tải chuyến...'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isTripDropdownOpen && trips.length > 0 && (
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
                        setIsTripDropdownOpen(false);
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

        {/* Status Filter Popover */}
        <div className="relative min-w-[200px]" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => {
              setIsStatusDropdownOpen(!isStatusDropdownOpen);
              setIsTripDropdownOpen(false);
            }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="truncate pr-2 font-medium text-slate-700">
              {statusFilter === 'ALL' && 'Tất cả trạng thái'}
              {statusFilter === 'CoMat' && 'Có mặt'}
              {statusFilter === 'Vang' && 'Vắng'}
              {statusFilter === 'TuChoiThamGia' && 'Từ chối tham gia'}
              {statusFilter === 'ChuaDiemDanh' && 'Chưa điểm danh'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isStatusDropdownOpen && (
            <div className="absolute top-full right-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
              <div className="p-2 border-b border-[#E7E0C4]">
                <input
                  type="text"
                  placeholder="Tìm trạng thái..."
                  value={searchStatusDropdown}
                  onChange={(e) => setSearchStatusDropdown(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-[#E7E0C4] rounded-lg focus:outline-none focus:border-[#407F3E]"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {[
                  { id: 'ALL', label: 'Tất cả trạng thái' },
                  { id: 'CoMat', label: 'Có mặt' },
                  { id: 'Vang', label: 'Vắng' },
                  { id: 'TuChoiThamGia', label: 'Từ chối tham gia' },
                  { id: 'ChuaDiemDanh', label: 'Chưa điểm danh' },
                ]
                  .filter(opt => !searchStatusDropdown || opt.label.toLowerCase().includes(searchStatusDropdown.toLowerCase()))
                  .map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => {
                        setStatusFilter(opt.id);
                        setIsStatusDropdownOpen(false);
                        setSearchStatusDropdown('');
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        statusFilter === opt.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {statusFilter === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                {[
                  { id: 'ALL', label: 'Tất cả trạng thái' },
                  { id: 'CoMat', label: 'Có mặt' },
                  { id: 'Vang', label: 'Vắng' },
                  { id: 'TuChoiThamGia', label: 'Từ chối tham gia' },
                  { id: 'ChuaDiemDanh', label: 'Chưa điểm danh' },
                ].filter(opt => !searchStatusDropdown || opt.label.toLowerCase().includes(searchStatusDropdown.toLowerCase())).length === 0 && (
                  <div className="px-4 py-3 text-xs text-slate-500 text-center">Không tìm thấy trạng thái</div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Quick Action Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-[#E7E0C4] shadow-sm mb-6">
        <button 
          onClick={handleMarkAllPresent}
          className="w-full sm:w-auto px-5 py-2 border-2 border-[#89B449] text-[#89B449] hover:bg-[#89B449] hover:text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" /> Đánh dấu tất cả Có mặt
        </button>
        <div className="mt-3 sm:mt-0 text-sm font-bold text-slate-600">
          Đã điểm danh: <span className="text-[#407F3E] text-base">{attendedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible pb-20 md:pb-0">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 w-12 text-center">Ảnh</th>
                <th className="p-4 min-w-[120px]">MSSV</th>
                <th className="p-4 min-w-[180px]">Họ tên</th>
                <th className="p-4 text-center min-w-[320px]">Trạng thái điểm danh</th>
                <th className="p-4 pr-6 min-w-[200px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium italic">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium italic">
                    Không tìm thấy sinh viên nào.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    
                    <td className="p-4 pl-6 text-center">
                      <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden mx-auto shrink-0">
                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    
                    <td className="p-4 font-mono font-bold text-slate-600">{student.mssv}</td>
                    
                    <td className="p-4 font-bold text-slate-800">{student.name}</td>
                    
                    <td className="p-4">
                      {/* Segmented Toggle Buttons */}
                      <div className="flex justify-center bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit mx-auto">
                        
                        <button 
                          onClick={() => handleStatusChange(student.id, 'CoMat')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            student.status === 'CoMat' 
                              ? 'bg-[#89B449] text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Có mặt
                        </button>
                        
                        <button 
                          onClick={() => handleStatusChange(student.id, 'Vang')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all mx-1 cursor-pointer ${
                            student.status === 'Vang' 
                              ? 'bg-[#E68A8C] text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Vắng
                        </button>
                        
                        <button 
                          onClick={() => handleStatusChange(student.id, 'TuChoiThamGia')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            student.status === 'TuChoiThamGia' 
                              ? 'bg-white border-2 border-[#E68A8C] text-[#E68A8C] shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border-2 border-transparent'
                          }`}
                        >
                          <FileWarning className="w-3.5 h-3.5" /> Từ chối tham gia
                        </button>

                      </div>
                    </td>
                    
                    <td className="p-4 pr-6">
                      {student.status === 'TuChoiThamGia' ? (
                        <input 
                          type="text" 
                          value={student.note}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          placeholder="Lý do từ chối..."
                          className="w-full px-3 py-2 bg-white border border-[#E68A8C] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#E68A8C] text-slate-800 placeholder-slate-400 shadow-sm animate-in fade-in duration-200"
                          autoFocus
                        />
                      ) : (
                        <span className="text-xs text-slate-300 italic px-3 block text-center md:text-left">Không có ghi chú</span>
                      )}
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
          onClick={handleSaveAttendance}
          disabled={loading || students.length === 0}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          Lưu điểm danh
        </button>
      </div>

    </div>
  );
}
