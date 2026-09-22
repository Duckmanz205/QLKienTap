import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronDown, Check, Search, MapPin, 
  UserCircle, UserPlus, Calendar, Clock, AlertCircle, Star,
  Trash2, XCircle, CheckCircle2, Zap, Lock, Edit3
} from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function LeaderAssignment_Khoa() {
  const [schedules, setSchedules] = useState([]);
  const [trips, setTrips] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [userRole, setUserRole] = useState('QuanLyCLB');

  // Dropdown States for Filters
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ["Tất cả", "Đã phân công", "Chưa phân công"];

  const [openDropdownId, setOpenDropdownId] = useState(null); 
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [isTruongDoan, setIsTruongDoan] = useState(true);
  const [searchLecturer, setSearchLecturer] = useState('');

  // Toast Popup State
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 3000);
  };

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const showConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };
  const closeConfirm = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const parsed = JSON.parse(userJson);
        if (parsed?.user?.vai_tro) setUserRole(parsed.user.vai_tro);
      }
    } catch (e) {}
    fetchInitialData();
  }, []);

  const isTripLocked = (trip) => {
    if (!trip.lichKienTap) return false;
    const tt = trip.lichKienTap.trang_thai;
    return tt !== 'Nhap' && tt !== 'ChoDuyet';
  };

  const fetchInitialData = async () => {
    try {
      const [schRes, lecRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getLecturers()
      ]);
      setSchedules(schRes.data);
      setLecturers(lecRes.data);
      // Removed auto-selecting the first schedule so it defaults to "Tất cả"
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
      showPopup("Vui lòng chọn giảng viên", "error");
      return;
    }

    const trip = trips.find(t => t.id === tripId);
    if (trip && isTripLocked(trip) && userRole !== 'QuanLyCLB') {
      showConfirm(
        "⚠️ Cảnh báo nghiêm ngặt",
        "Lịch kiến tập này đã được duyệt. Việc thay đổi Giảng viên dẫn đoàn lúc này có thể gây xáo trộn và ảnh hưởng đến thông báo đã gửi. Bạn có chắc chắn muốn CHUYỂN ĐỔI không?",
        async () => {
          await executeAssign(tripId);
        }
      );
      return;
    }
    
    await executeAssign(tripId);
  };

  const executeAssign = async (tripId) => {
    try {
      await khoaApi.assignGvdd({
        tripId: tripId,
        lecturerId: selectedLecturerId,
        laTruongDoan: true // Always true as requested
      });
      showPopup('Phân công thành công!', 'success');
      setOpenDropdownId(null);
      setSelectedLecturerId('');
      fetchTrips();
    } catch (err) {
      console.error(err);
      showPopup(err.response?.data?.message || 'Lỗi khi phân công', 'error');
    }
  };

  const handleUnassign = (trip, lecturerId, lecturerName) => {
    if (isTripLocked(trip) && userRole !== 'QuanLyCLB') {
      showConfirm(
        "⚠️ Cảnh báo nghiêm ngặt",
        `Lịch kiến tập này đã được duyệt. Việc gỡ Giảng viên dẫn đoàn lúc này có thể gây thiếu sót nhân sự. Bạn có chắc chắn muốn gỡ phân công giảng viên ${lecturerName}?`,
        () => executeUnassign(trip.id, lecturerId)
      );
      return;
    }

    showConfirm(
      "Gỡ phân công",
      `Bạn có chắc chắn muốn gỡ phân công giảng viên ${lecturerName} khỏi chuyến đi này?`,
      () => executeUnassign(trip.id, lecturerId)
    );
  };

  const executeUnassign = async (tripId, lecturerId) => {
    try {
      await khoaApi.unassignGvdd(tripId, lecturerId);
      showPopup('Đã gỡ phân công thành công', 'success');
      fetchTrips();
    } catch (err) {
      console.error(err);
      showPopup(err.response?.data?.message || 'Lỗi khi gỡ phân công', 'error');
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
      setSearchLecturer('');
    }
  };

  const isLecturerBusy = (lecturerId, dateStr) => {
    if (!dateStr) return false;
    const dateToCompare = new Date(dateStr).toDateString();
    return trips.some(trip => {
      if (!trip.ngay_tham_quan) return false;
      return new Date(trip.ngay_tham_quan).toDateString() === dateToCompare
        && trip.giaoVienDanDoan?.some(g => g.giang_vien_id === lecturerId);
    });
  };

  const getLecturerWorkload = (lecturerId) => {
    return trips.filter(trip => trip.giaoVienDanDoan?.some(g => g.giang_vien_id === lecturerId)).length;
  };

  const handleAutoAssign = () => {
    showConfirm(
      "Phân công tự động",
      "Hệ thống sẽ tự động phân công Giảng viên dẫn đoàn cho tất cả các chuyến đi 'Do khoa tổ chức' chưa có giảng viên, ưu tiên những người ít việc và không trùng lịch. Bạn có chắc chắn muốn thực hiện?",
      async () => {
        try {
          const res = await khoaApi.autoAssignGvdd();
          showPopup(res.data?.message || 'Đã phân công tự động', 'success');
          fetchTrips();
        } catch (err) {
          showPopup(err.response?.data?.message || 'Lỗi khi phân công tự động', 'error');
        }
      }
    );
  };

  const filteredTrips = trips.filter(t => {
    if (t.cach_to_chuc === 'TuDo') return false; // Hide self-organized trips
    if (selectedLich && t.lich_kien_tap_id !== selectedLich) return false;
    const gvdd = t.giaoVienDanDoan || [];
    if (selectedStatus === 'Đã phân công' && gvdd.length === 0) return false;
    if (selectedStatus === 'Chưa phân công' && gvdd.length > 0) return false;
    return true;
  });

  const doKhoaTrips = trips.filter(t => t.cach_to_chuc === 'DoKhoaToChuc');
  const totalTrips = doKhoaTrips.length;
  const assignedTrips = doKhoaTrips.filter(t => t.giaoVienDanDoan && t.giaoVienDanDoan.length > 0).length;
  const unassignedTrips = totalTrips - assignedTrips;

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Phân công GV dẫn đoàn</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Tổng chuyến (Khoa tổ chức)</p>
            <p className="text-2xl font-black text-slate-800">{totalTrips}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Đã phân công</p>
            <p className="text-2xl font-black text-slate-800">{assignedTrips}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Cần phân công</p>
            <p className="text-2xl font-black text-slate-800">{unassignedTrips}</p>
          </div>
        </div>
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
              {selectedLich ? schedules.find(s => s.id === selectedLich)?.ten_dot : 'Tất cả lịch kiến tập'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isLichDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 max-h-[300px] overflow-y-auto">
              <div 
                onClick={() => { setSelectedLich(''); setIsLichDropdownOpen(false); }}
                className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                  selectedLich === '' ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                }`}
              >
                <span className="truncate pr-2">Tất cả lịch kiến tập (Bao gồm chuyến nháp)</span>
                {selectedLich === '' && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
              </div>
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

        <div className="ml-auto flex items-end">
          <button 
            onClick={handleAutoAssign}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/30 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            Phân công tự động
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible relative z-10">
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4]/50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">Chuyến tham quan</th>
                <th className="p-4 text-center">Hình thức</th>
                <th className="p-4 text-center">Cách tổ chức</th>
                <th className="p-4">GV dẫn đoàn hiện tại</th>
                <th className="p-4 text-right pr-6 w-[200px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {filteredTrips.map(t => {
                const isKhoa = t.cach_to_chuc === 'DoKhoaToChuc';
                const hinhThuc = t.hinh_thuc === 'OFFLINE' ? 'Trực tiếp' : 'Trực tuyến';
                const gvdd = t.giaoVienDanDoan || [];
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-4 h-4 text-[#407F3E]" />
                        {t.nhaMay?.ten_nha_may || 'Đang cập nhật'}
                        {isTripLocked(t) && <span title="Lịch kiến tập đã duyệt, bị khóa phân công" className="text-slate-400"><Lock className="w-3.5 h-3.5" /></span>}
                      </div>
                      <div className="text-xs font-medium text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.gio_bat_dau}</span>
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
                      {gvdd.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {gvdd.map(l => (
                            <div key={l.id} className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-slate-800">{l.giangVien?.ho_ten}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-orange-50 text-orange-600 text-xs font-bold border border-orange-200">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          Chưa phân công
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6 relative">
                      {!(userRole === 'QuanLyCLB' && isTripLocked(t)) && (
                        <div className="flex items-center justify-end gap-2">
                          {gvdd.length === 0 ? (
                            <button 
                              onClick={(e) => toggleInlineDropdown(e, t.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all shadow-sm bg-[#407F3E] text-white hover:bg-[#346632]"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Phân công
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={(e) => toggleInlineDropdown(e, t.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                                title="Cập nhật giảng viên"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnassign(t, gvdd[0].giang_vien_id, gvdd[0].giangVien?.ho_ten);
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                                title="Gỡ phân công"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Inline Dropdown */}
                      {openDropdownId === t.id && !(userRole === 'QuanLyCLB' && isTripLocked(t)) && (
                        <div 
                          className="absolute top-full right-6 mt-1 w-[260px] bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 origin-top-right text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-3 border-b border-[#E7E0C4] bg-slate-50">
                            <label className="block text-xs font-bold text-slate-700 mb-2">Chọn giảng viên (Trưởng đoàn):</label>
                            <div className="relative">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input 
                                type="text"
                                placeholder="Tìm kiếm theo tên..."
                                value={searchLecturer}
                                onChange={(e) => setSearchLecturer(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#407F3E] focus:border-[#407F3E]"
                              />
                            </div>
                          </div>
                          <div className="max-h-[200px] overflow-y-auto py-1">
                            {lecturers.filter(gv => gv.ho_ten.toLowerCase().includes(searchLecturer.toLowerCase())).map(gv => {
                              const isBusy = isLecturerBusy(gv.id, t.ngay_tham_quan);
                              const workload = getLecturerWorkload(gv.id);
                              return (
                                <div 
                                  key={gv.id}
                                  onClick={() => { if (!isBusy) setSelectedLecturerId(gv.id) }}
                                  className={`px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${isBusy ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-[#E7E0C4]/30'} ${selectedLecturerId === gv.id ? 'bg-[#E7E0C4]/50' : ''}`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${isBusy ? 'bg-slate-400' : 'bg-[#407F3E]'}`}>
                                      {gv.ho_ten?.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-800">{gv.ho_ten}</span>
                                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                        Đã nhận: {workload} chuyến
                                        {isBusy && <span className="text-red-500 font-bold ml-1">(Trùng lịch)</span>}
                                      </span>
                                    </div>
                                  </div>
                                  {selectedLecturerId === gv.id && <Check className="w-4 h-4 text-[#407F3E]" />}
                                </div>
                              );
                            })}
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

      {/* Toast Popup */}
      {popup.show && createPortal(
        <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-right-8 fade-in duration-300">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold ${
            popup.type === 'success' 
              ? 'bg-white border-[#407F3E]/20 text-[#407F3E]' 
              : 'bg-white border-[#E68A8C]/20 text-[#E68A8C]'
          }`}>
            {popup.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {popup.message}
          </div>
        </div>,
        document.body
      )}

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeConfirm}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-600 text-sm">{confirmDialog.message}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={closeConfirm}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  confirmDialog.onConfirm();
                  closeConfirm();
                }}
                className="px-4 py-2 bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
