import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Gavel, Search, Sparkles, X, ChevronDown, Check, UserPlus } from 'lucide-react';

const initialMockBoards = [
  { 
    id: 'HD-01', 
    name: 'HĐ Chấm Báo Cáo Công Nghệ Thực Phẩm - Nhóm 1', 
    scheduleName: 'Lịch kiến tập HK1 2026-2027', 
    date: '2026-11-15 08:00', 
    location: 'Phòng A.101 - Cơ sở chính', 
    members: ['ThS. Nguyễn Văn A', 'TS. Trần Thị B', 'ThS. Lê Minh Tuấn'], 
    numStudents: 25, 
    status: 'Sắp diễn ra' 
  },
  { 
    id: 'HD-02', 
    name: 'HĐ Chấm Báo Cáo Công Nghệ Thực Phẩm - Nhóm 2', 
    scheduleName: 'Lịch kiến tập HK1 2026-2027', 
    date: '2026-11-15 13:30', 
    location: 'Phòng A.102 - Cơ sở chính', 
    members: ['TS. Lê Thị B', 'ThS. Trần Văn C'], 
    numStudents: 20, 
    status: 'Đang diễn ra' 
  },
  { 
    id: 'HD-03', 
    name: 'HĐ Báo Cáo Đợt Sớm - K14 Công Nghệ Thực Phẩm', 
    scheduleName: 'Lịch kiến tập K14 - Học kỳ phụ', 
    date: '2026-11-10 08:00', 
    location: 'Phòng B.201 - Cơ sở chính', 
    members: ['TS. Nguyễn Tiến Dũng', 'ThS. Đỗ Minh Phương'], 
    numStudents: 18, 
    status: 'Đã kết thúc' 
  }
];

const mockStudents = [
  { mssv: '2001200123', name: 'Nguyễn Văn Nam', class: '14ĐHTP01' },
  { mssv: '2001200124', name: 'Trần Thị Thu Thủy', class: '14ĐHTP01' },
  { mssv: '2001200125', name: 'Phạm Hữu Đạt', class: '14ĐHTP02' },
  { mssv: '2001200126', name: 'Lê Hoài Bảo', class: '14ĐHTP02' },
  { mssv: '2001200127', name: 'Đặng Minh Khang', class: '14ĐHTP03' },
  { mssv: '2001200128', name: 'Vũ Thị Minh Ngọc', class: '14ĐHTP03' }
];

export default function HoiDongChamBaoCao_Khoa() {
  const [boards, setBoards] = useState(initialMockBoards);
  const [scheduleFilter, setScheduleFilter] = useState('Tất cả');
  const [boardFilter, setBoardFilter] = useState('Tất cả');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  // Form states
  const [boardName, setBoardName] = useState('');
  const [appliedSchedule, setAppliedSchedule] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [room, setRoom] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(['ThS. Nguyễn Văn A', 'TS. Trần Thị B']);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Available lecturers for selection
  const availableLecturers = ['ThS. Nguyễn Văn A', 'TS. Trần Thị B', 'ThS. Lê Minh Tuấn', 'TS. Lê Thị B', 'ThS. Trần Văn C', 'TS. Nguyễn Tiến Dũng', 'ThS. Đỗ Minh Phương'];

  const getStatusBadgeClass = (status) => {
    if (status === 'Sắp diễn ra') return 'bg-[#DBD468] text-slate-800'; // Warning yellow
    if (status === 'Đang diễn ra') return 'bg-[#89B449] text-white'; // Secondary green
    return 'bg-[#E7E0C4] text-slate-700'; // Muted gray
  };

  const handleCreateBoardSubmit = (e) => {
    e.preventDefault();
    if (!boardName || !dateTime || !room) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    const newBoard = {
      id: `HD-0${boards.length + 1}`,
      name: boardName,
      scheduleName: appliedSchedule || 'Chưa chọn',
      date: dateTime.replace('T', ' '),
      location: room,
      members: selectedMembers,
      numStudents: selectedStudents.length || 15,
      status: 'Sắp diễn ra'
    };
    setBoards(prev => [newBoard, ...prev]);
    setShowAddModal(false);
    // Reset states
    setBoardName('');
    setDateTime('');
    setRoom('');
    setSelectedStudents([]);
  };

  const toggleStudentSelection = (mssv) => {
    setSelectedStudents(prev => 
      prev.includes(mssv) ? prev.filter(id => id !== mssv) : [...prev, mssv]
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title block with "+ Tạo buổi báo cáo" button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Hội đồng chấm báo cáo
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Thiết lập và quản lý danh sách các hội đồng đánh giá báo cáo tham quan nhà máy của sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/95 text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo buổi báo cáo</span>
        </button>
      </div>

      {/* Filter Bar Card */}
      <div className="bg-white rounded-2xl border border-[#E7E0C4] p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lịch kiến tập filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Lịch kiến tập
            </label>
            <select
              value={scheduleFilter}
              onChange={e => setScheduleFilter(e.target.value)}
              className="w-full bg-[#E7E0C4]/10 border border-[#E7E0C4] rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold hover:bg-[#E7E0C4]/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            >
              <option value="Tất cả">Tất cả lịch kiến tập</option>
              <option value="Lịch kiến tập HK1 2026-2027">Lịch kiến tập HK1 2026-2027</option>
              <option value="Lịch kiến tập K14 - Học kỳ phụ">Lịch kiến tập K14 - Học kỳ phụ</option>
            </select>
          </div>

          {/* Hội đồng filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Hội đồng
            </label>
            <select
              value={boardFilter}
              onChange={e => setBoardFilter(e.target.value)}
              className="w-full bg-[#E7E0C4]/10 border border-[#E7E0C4] rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold hover:bg-[#E7E0C4]/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            >
              <option value="Tất cả">Tất cả hội đồng</option>
              <option value="Sắp diễn ra">Sắp diễn ra</option>
              <option value="Đang diễn ra">Đang diễn ra</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-[#E7E0C4]">
              <tr>
                <th className="px-6 py-4 font-bold">Tên buổi báo cáo</th>
                <th className="px-6 py-4 font-bold">Ngày báo cáo</th>
                <th className="px-6 py-4 font-bold">Địa điểm</th>
                <th className="px-6 py-4 font-bold">Danh sách hội đồng</th>
                <th className="px-6 py-4 font-bold">Danh sách SV</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0C4]/40 text-slate-800 font-medium">
              {boards
                .filter(b => scheduleFilter === 'Tất cả' || b.scheduleName === scheduleFilter)
                .filter(b => boardFilter === 'Tất cả' || b.status === boardFilter)
                .map((board) => (
                  <tr key={board.id} className="hover:bg-[#E7E0C4]/10 transition-colors duration-250">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{board.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">{board.scheduleName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{board.date}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#407F3E]">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{board.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {board.members.map((mem, idx) => (
                          <span key={idx} className="inline-block bg-[#E7E0C4]/40 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-[#E7E0C4]/80">
                            {mem}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => alert(`Xem danh sách ${board.numStudents} sinh viên báo cáo buổi: ${board.name}`)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#407F3E] hover:underline font-bold"
                      >
                        <Users size={14} />
                        <span>Xem DS ({board.numStudents})</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${getStatusBadgeClass(board.status)}`}>
                        {board.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedBoard(board)}
                        className="px-3 py-1.5 border border-[#E7E0C4] text-slate-600 hover:text-[#407F3E] hover:bg-[#E7E0C4]/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBoard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#E7E0C4] bg-[#E7E0C4]/30 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Gavel className="w-5 h-5 text-[#407F3E]" />
                <span>Chi tiết buổi hội đồng</span>
              </h2>
              <button 
                onClick={() => setSelectedBoard(null)} 
                className="text-slate-450 hover:text-slate-800 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm font-semibold text-slate-650">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tên buổi báo cáo</p>
                <p className="text-slate-800 font-bold text-base mt-0.5">{selectedBoard.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lịch áp dụng</p>
                  <p className="text-slate-700 font-bold mt-0.5">{selectedBoard.scheduleName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thời gian</p>
                  <p className="text-slate-700 font-bold mt-0.5">{selectedBoard.date}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phòng báo cáo</p>
                <p className="text-slate-700 font-bold mt-0.5">{selectedBoard.location}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Danh sách giám khảo</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBoard.members.map((m, idx) => (
                    <span key={idx} className="bg-[#407F3E]/10 text-[#407F3E] text-xs px-3 py-1 rounded-full font-bold border border-[#407F3E]/20">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-[#E7E0C4] flex justify-end">
              <button 
                onClick={() => setSelectedBoard(null)} 
                className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating "+ Tạo buổi báo cáo" Modal Mockup */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#E7E0C4] bg-white flex items-center justify-between">
              <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#407F3E]" />
                <span>+ Tạo buổi báo cáo</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-450 hover:text-slate-700 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBoardSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Tên buổi báo cáo */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tên buổi báo cáo *
                </label>
                <input 
                  type="text" 
                  value={boardName} 
                  onChange={e => setBoardName(e.target.value)} 
                  placeholder="Ví dụ: Buổi bảo vệ báo cáo tham quan Vinamilk - HĐ1" 
                  required 
                  className="w-full px-4 py-2.5 border border-[#E7E0C4] bg-slate-50 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700" 
                />
              </div>

              {/* Lịch kiến tập áp dụng */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Lịch kiến tập áp dụng
                </label>
                <select 
                  value={appliedSchedule} 
                  onChange={e => setAppliedSchedule(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-[#E7E0C4] bg-slate-50 rounded-xl text-sm font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700"
                >
                  <option value="Lịch kiến tập HK1 2026-2027">Lịch kiến tập HK1 2026-2027</option>
                  <option value="Lịch kiến tập K14 - Học kỳ phụ">Lịch kiến tập K14 - Học kỳ phụ</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ngày báo cáo (date-time picker) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Ngày báo cáo *
                  </label>
                  <input 
                    type="datetime-local" 
                    value={dateTime} 
                    onChange={e => setDateTime(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 border border-[#E7E0C4] bg-slate-50 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-750" 
                  />
                </div>
                {/* Địa điểm */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Địa điểm *
                  </label>
                  <input 
                    type="text" 
                    value={room} 
                    onChange={e => setRoom(e.target.value)} 
                    placeholder="Ví dụ: Phòng A.101" 
                    required 
                    className="w-full px-4 py-2.5 border border-[#E7E0C4] bg-slate-50 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700" 
                  />
                </div>
              </div>

              {/* Select multichip dropdown: Chọn thành viên hội đồng */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Chọn thành viên hội đồng
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 border border-[#E7E0C4] rounded-xl bg-slate-50/50 mb-2 min-h-[44px]">
                  {selectedMembers.map((m) => (
                    <span key={m} className="inline-flex items-center gap-1 bg-[#407F3E] text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      {m}
                      <button 
                        type="button" 
                        onClick={() => setSelectedMembers(prev => prev.filter(x => x !== m))}
                        className="hover:text-red-200 font-bold ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  {selectedMembers.length === 0 && (
                    <span className="text-slate-400 text-xs italic font-semibold">Chưa chọn thành viên nào</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-1">
                  {availableLecturers.map((lec) => {
                    const isSelected = selectedMembers.includes(lec);
                    return (
                      <button
                        key={lec}
                        type="button"
                        onClick={() => {
                          setSelectedMembers(prev => 
                            isSelected ? prev.filter(x => x !== lec) : [...prev, lec]
                          );
                        }}
                        className={`text-left px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-[#407F3E] bg-[#407F3E]/5 text-[#407F3E]' 
                            : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        <span>{lec}</span>
                        {isSelected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checklist Chọn sinh viên báo cáo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Chọn sinh viên báo cáo * ({selectedStudents.length} đã chọn)
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (selectedStudents.length === mockStudents.length) {
                        setSelectedStudents([]);
                      } else {
                        setSelectedStudents(mockStudents.map(s => s.mssv));
                      }
                    }}
                    className="text-xs text-[#407F3E] hover:underline font-bold"
                  >
                    {selectedStudents.length === mockStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>
                <div className="border border-[#E7E0C4] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-[#E7E0C4]/60 text-slate-600 font-bold uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-center w-10">Chọn</th>
                        <th className="px-4 py-2">MSSV</th>
                        <th className="px-4 py-2">Họ tên</th>
                        <th className="px-4 py-2">Lớp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E0C4]/40 font-semibold text-slate-700 bg-white">
                      {mockStudents.map((st) => {
                        const isChecked = selectedStudents.includes(st.mssv);
                        return (
                          <tr 
                            key={st.mssv} 
                            onClick={() => toggleStudentSelection(st.mssv)}
                            className={`hover:bg-[#E7E0C4]/10 cursor-pointer transition-colors ${isChecked ? 'bg-[#407F3E]/5' : ''}`}
                          >
                            <td className="px-4 py-2 text-center" onClick={e => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => toggleStudentSelection(st.mssv)}
                                className="rounded text-[#407F3E] focus:ring-[#407F3E]/20"
                              />
                            </td>
                            <td className="px-4 py-2 font-mono text-[#407F3E]">{st.mssv}</td>
                            <td className="px-4 py-2 font-bold">{st.name}</td>
                            <td className="px-4 py-2 text-slate-500">{st.class}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E7E0C4]">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-5 py-2.5 border border-[#E7E0C4] rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/95 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Tạo buổi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
