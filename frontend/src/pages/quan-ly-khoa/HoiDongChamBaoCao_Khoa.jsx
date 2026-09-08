import React, { useState, useEffect } from 'react';
import { 
  Plus, ChevronDown, Check, X, Search, ChevronRight, Calendar, MapPin
} from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function HoiDongChamBaoCao_Khoa() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);

  // Modal Dropdown States
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false); // To show the open state

  // Form States
  const [boardName, setBoardName] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [room, setRoom] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]); // if needed

  // Data
  const [schedules, setSchedules] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schRes, lecRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getLecturers()
      ]);
      setSchedules(schRes.data);
      setLecturers(lecRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!selectedSchedule || !boardName || !dateTime || !room) {
      alert('Vui lòng điền đủ thông tin bắt buộc');
      return;
    }
    try {
      const res = await khoaApi.createBoard({
        lichKienTapId: selectedSchedule,
        tenHoiDong: boardName,
        ngayBaoCao: dateTime,
        diaDiem: room
      });
      
      const boardId = res.data.id;
      
      // add board members
      for (const memberId of selectedMembers) {
        await khoaApi.addBoardMember({
          boardId,
          lecturerId: memberId,
          vaiTro: 'Thành viên'
        });
      }
      
      alert('Tạo hội đồng thành công!');
      setIsModalOpen(false);
      setBoardName('');
      setSelectedSchedule('');
      setDateTime('');
      setRoom('');
      setSelectedMembers([]);
    } catch (err) {
      console.error(err);
      alert('Lỗi tạo hội đồng');
    }
  };

  // Close all modal dropdowns
  const closeAllModalDropdowns = () => {
    setIsLichDropdownOpen(false);
    setIsMembersOpen(false);
    setIsStudentsOpen(false);
  };

  const handleModalDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllModalDropdowns();
    setter(true);
  };

  // Mock Data for table display (since no getBoards API in khoaApi)
  const committees = [
    { 
      id: 1, 
      ten: 'HĐ Bảo vệ TQNM - K14 H1', 
      lich: 'Đợt kiến tập - Học kỳ 1 - 2025-2026', 
      ngay: '10/09/2026', 
      gio: '08:00', 
      diaDiem: 'Phòng A.101', 
      members: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3', 'https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5'],
      sv: 15, 
      trangThai: 'Sắp diễn ra' 
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Sắp diễn ra':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Đang diễn ra':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Đã hoàn thành':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Hội đồng chấm báo cáo</h1>
        <button 
          onClick={() => { setIsModalOpen(true); }} 
          className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo buổi hội đồng
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">Tên hội đồng</th>
                <th className="p-4">Lịch kiến tập</th>
                <th className="p-4">Ngày giờ</th>
                <th className="p-4">Địa điểm</th>
                <th className="p-4">Thành viên</th>
                <th className="p-4 text-center">Số SV báo cáo</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {committees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">Không có hội đồng nào.</td>
                </tr>
              ) : (
                committees.map(c => {
                  const displayMembers = c.members.slice(0, 3);
                  const extraMembers = c.members.length - 3;
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800">{c.ten}</td>
                      <td className="p-4 font-medium text-slate-600">{c.lich}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700">{c.ngay}</div>
                        <div className="text-xs text-slate-500">{c.gio}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">{c.diaDiem}</td>
                      <td className="p-4">
                        <div className="flex items-center -space-x-2">
                          {displayMembers.map((m, idx) => (
                            <img key={idx} src={m} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white shadow-sm z-10 relative" style={{ zIndex: 10 - idx }} />
                          ))}
                          {extraMembers > 0 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 relative z-0">
                              +{extraMembers}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-[#407F3E]">{c.sv}</td>
                      <td className="p-4 text-center">
                        {getStatusBadge(c.trangThai)}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                          title="Chi tiết"
                          onClick={() => setViewingDetail(c)}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mockup - "+ Tạo buổi hội đồng" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dimmed Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div 
            className="bg-white w-full max-w-3xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 overflow-visible flex flex-col"
            onClick={closeAllModalDropdowns}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#407F3E]" />
                Tạo buổi hội đồng
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateBoard} className="flex flex-col">
              <div className="p-6 space-y-5">
                
                {/* Row 1: Tên & Lịch */}
                <div className="grid grid-cols-2 gap-5 relative z-30">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tên hội đồng *</label>
                    <input
                      type="text"
                      required
                      value={boardName}
                      onChange={e => setBoardName(e.target.value)}
                      placeholder="Nhập tên hội đồng..."
                      className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Lịch kiến tập *</label>
                    <div 
                      onClick={(e) => handleModalDropdownClick(e, setIsLichDropdownOpen)}
                      className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all hover:border-[#407F3E]"
                    >
                      <span className="text-slate-800 font-medium truncate pr-2">
                        {selectedSchedule ? schedules.find(s => s.id === selectedSchedule)?.ten_dot || 'Đã chọn' : 'Chọn lịch kiến tập'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    {isLichDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
                        {schedules.map(sch => (
                          <div 
                            key={sch.id}
                            onClick={() => { setSelectedSchedule(sch.id); setIsLichDropdownOpen(false); }}
                            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            {sch.ten_dot} ({sch.namHoc?.nam_bat_dau}-{sch.namHoc?.nam_ket_thuc})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Ngày giờ & Địa điểm */}
                <div className="grid grid-cols-2 gap-5 relative z-20">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày giờ *</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        required
                        value={dateTime}
                        onChange={e => setDateTime(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Địa điểm *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={room}
                        onChange={e => setRoom(e.target.value)}
                        placeholder="VD: Phòng A.101"
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Thành viên & Sinh viên */}
                <div className="grid grid-cols-2 gap-5 relative z-40">
                  {/* Multi-select Thành viên */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Thành viên hội đồng</label>
                    <div 
                      onClick={(e) => handleModalDropdownClick(e, setIsMembersOpen)}
                      className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm flex justify-between items-center cursor-pointer hover:border-[#407F3E]"
                    >
                      <span className="text-slate-800 font-bold truncate pr-2">
                        {selectedMembers.length > 0 ? `Đã chọn ${selectedMembers.length} GV` : 'Chọn giảng viên'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    {isMembersOpen && (
                      <div 
                        className="absolute bottom-full left-0 w-full mb-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-2 max-h-48 overflow-y-auto animate-in slide-in-from-bottom-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {lecturers.map(lec => {
                          const isChecked = selectedMembers.includes(lec.id);
                          return (
                            <div 
                              key={lec.id}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedMembers(selectedMembers.filter(id => id !== lec.id));
                                } else {
                                  setSelectedMembers([...selectedMembers, lec.id]);
                                }
                              }}
                              className="px-4 py-1.5 text-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50"
                            >
                              <input 
                                type="checkbox" 
                                className="w-3.5 h-3.5 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E]" 
                                checked={isChecked} 
                                readOnly 
                              />
                              <span className={isChecked ? "font-bold text-slate-800" : "font-medium text-slate-600"}>
                                {lec.ho_ten} ({lec.ma_gv})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Multi-select Sinh viên */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Sinh viên báo cáo</label>
                    <div 
                      onClick={(e) => alert('Tính năng chọn sinh viên báo cáo đang phát triển')}
                      className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm flex justify-between items-center cursor-pointer hover:border-[#407F3E]"
                    >
                      <span className="text-slate-400 font-medium truncate pr-2">Chọn sinh viên (mock)</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end gap-3 rounded-b-2xl z-10">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Xem chi tiết */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
          ></div>
          
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Chi tiết
              </h2>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {Object.entries(viewingDetail).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) return null;
                return (
                  <div key={key} className="flex flex-col border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{key}</span>
                    <span className="text-sm font-medium text-slate-800 break-words">{String(value)}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end rounded-b-2xl">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
