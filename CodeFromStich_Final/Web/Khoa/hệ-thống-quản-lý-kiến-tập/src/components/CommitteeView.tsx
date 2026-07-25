import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Gavel, Search, Sparkles, AlertCircle, X, ChevronRight } from 'lucide-react';
import { CommitteeBoard, CommitteeMember, ReporterStudent } from '../types';

interface CommitteeViewProps {
  boards: CommitteeBoard[];
  setBoards: React.Dispatch<React.SetStateAction<CommitteeBoard[]>>;
}

export default function CommitteeView({ boards, setBoards }: CommitteeViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('Tất cả');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBoardDetails, setSelectedBoardDetails] = useState<CommitteeBoard | null>(null);

  // Form states for creating a board
  const [boardName, setBoardName] = useState('');
  const [plan, setPlan] = useState('HK1 2023-2024');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  // Faculty list for selection (checkboxes)
  const availableFaculty = [
    { name: 'Nguyễn Văn A', role: 'Trưởng ban', initial: 'A' },
    { name: 'Lê Minh Tuấn', role: 'Ủy viên', initial: 'T' },
    { name: 'Trần Thị Lan', role: 'Thư ký', initial: 'L' },
    { name: 'Vũ Quốc Huy', role: 'Ủy viên', initial: 'H' }
  ];
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>(['Nguyễn Văn A']);

  // Student list for selection
  const availableStudents = [
    { name: 'Phạm Hữu D', mssv: 'SV20201234', topic: 'Tối ưu hóa dây chuyền cấp đông Thủy sản' },
    { name: 'Hoàng Thị E', mssv: 'SV20205678', topic: 'Khảo sát chất lượng vi sinh trong sữa tiệt trùng' },
    { name: 'Vũ Minh F', mssv: 'SV20209012', topic: 'Chiết xuất pectin từ vỏ bưởi năm roi' },
    { name: 'Lương Thế Vinh', mssv: 'SV20201100', topic: 'Thiết kế quy trình sấy thăng hoa chuối' }
  ];
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['SV20201234', 'SV20205678']);

  const filteredBoards = boards.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'Tất cả' || b.internshipPlan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName || !location || !date || !time) {
      alert('Vui lòng điền đầy đủ các trường thông tin hội đồng!');
      return;
    }

    const assignedMembers: CommitteeMember[] = availableFaculty
      .filter(f => selectedFaculty.includes(f.name))
      .map((f, i) => ({
        name: f.name,
        role: i === 0 ? 'Trưởng ban' : i === 1 ? 'Thư ký' : 'Ủy viên',
        initial: f.initial
      }));

    const assignedStudents: ReporterStudent[] = availableStudents
      .filter(s => selectedStudents.includes(s.mssv))
      .map(s => ({
        name: s.name,
        mssv: s.mssv,
        topic: s.topic
      }));

    const newBoard: CommitteeBoard = {
      id: `HD-2023-${Math.floor(10 + Math.random() * 90)}`,
      name: boardName,
      internshipPlan: plan,
      datetime: date,
      time: time,
      location: location,
      members: assignedMembers,
      numStudents: assignedStudents.length,
      status: 'Sắp diễn ra',
      reporters: assignedStudents
    };

    setBoards(prev => [newBoard, ...prev]);
    setShowAddModal(false);

    // Reset forms
    setBoardName('');
    setLocation('');
    setDate('');
    setTime('');
    setSelectedFaculty(['Nguyễn Văn A']);
    setSelectedStudents(['SV20201234']);
  };

  const handleDeleteBoard = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa hội đồng "${name}" này không?`)) {
      setBoards(prev => prev.filter(b => b.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đang diễn ra':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'Đã hoàn thành':
        return 'bg-secondary-container-green text-on-secondary-container-green border border-secondary';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-container tracking-tight">
            Hội đồng chấm báo cáo
          </h1>
          <p className="text-sm text-slate-500">
            Tổ chức và quản lý các buổi bảo vệ, đánh giá báo cáo kết quả kiến tập.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#407F3E] hover:bg-[#346732] text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg self-start cursor-pointer transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo buổi hội đồng mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm hội đồng theo tên hoặc phòng học..."
            className="w-full bg-slate-50 text-slate-800 text-sm pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#407F3E]/20 outline-none font-medium"
          />
        </div>

        {/* Dropdown filter */}
        <div className="w-full md:w-64">
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="w-full bg-slate-50 text-slate-700 text-sm px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer outline-none font-medium"
          >
            <option value="Tần cả">Đợt kiến tập: Tất cả</option>
            <option value="HK1 2023-2024">HK1 2023-2024</option>
            <option value="HK2 2023-2024">HK2 2023-2024</option>
          </select>
        </div>
      </div>

      {/* Grid of Committee Boards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBoards.map(board => (
          <div 
            key={board.id} 
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
          >
            {/* Header portion */}
            <div className="p-6 pb-4 border-b border-slate-50 flex flex-col gap-2 relative">
              <span className={`self-start text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider ${getStatusBadge(board.status)}`}>
                {board.status}
              </span>
              <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-primary-container transition-colors mt-1">
                {board.name}
              </h3>
              <p className="text-xs text-slate-400 font-bold">Mã HĐ: {board.id}</p>
            </div>

            {/* Content portion */}
            <div className="p-6 py-4 flex-1 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700">{board.datetime}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{board.time}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-700">{board.location}</span>
              </div>
              
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-bold">{board.numStudents} sinh viên báo cáo</span>
                </div>
              </div>

              {/* Committee Members listing */}
              <div className="pt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Thành viên hội đồng</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {board.members.map((member, i) => (
                    <div 
                      key={i} 
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      title={`${member.name} (${member.role})`}
                    >
                      <div className="w-4 h-4 bg-primary-container text-white rounded-full text-[9px] font-black flex items-center justify-center">
                        {member.initial || member.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-700">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions portion */}
            <div className="p-6 pt-2 pb-5 border-t border-slate-50 bg-slate-50/50 flex gap-2">
              <button
                onClick={() => setSelectedBoardDetails(board)}
                className="flex-1 py-2 text-center bg-white border border-slate-200 hover:border-[#407F3E] text-slate-700 hover:text-primary-container text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Chi tiết
              </button>
              <button
                onClick={() => alert('Tính năng sửa đổi lịch hội đồng đã được gửi đến quản lý đợt.')}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                title="Sửa"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDeleteBoard(board.id, board.name)}
                className="px-3 py-2 bg-white border border-red-100 hover:bg-red-50 text-red-500 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                title="Xóa"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Board Detail View Panel */}
      {selectedBoardDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-[#E7E0C4] flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Gavel className="w-5 h-5 text-primary-container animate-pulse" />
                <h2 className="font-extrabold text-lg">{selectedBoardDetails.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedBoardDetails(null)}
                className="text-slate-500 hover:text-slate-800 p-1 bg-white/50 hover:bg-white rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Top metadata row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đợt kiến tập</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedBoardDetails.internshipPlan}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ngày báo cáo</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedBoardDetails.datetime}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thời gian</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedBoardDetails.time}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Địa điểm</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedBoardDetails.location}</p>
                </div>
              </div>

              {/* Committee Members list */}
              <div>
                <h3 className="font-bold text-slate-700 text-sm mb-3">Ban Hội đồng chấm ({selectedBoardDetails.members.length} thành viên)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedBoardDetails.members.map((member, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                      <div className="w-10 h-10 rounded-full bg-[#407F3E] text-white flex items-center justify-center font-bold">
                        {member.initial || member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-500 font-semibold text-primary-container">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reporters List */}
              <div>
                <h3 className="font-bold text-slate-700 text-sm mb-3">Danh sách sinh viên báo cáo ({selectedBoardDetails.reporters.length})</h3>
                <div className="space-y-2">
                  {selectedBoardDetails.reporters.map((rep, i) => (
                    <div key={i} className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{rep.name}</span>
                          <span className="text-xs text-slate-400 font-mono">MSSV: {rep.mssv}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium italic">Đề tài: {rep.topic}</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-50 text-amber-700 rounded-lg text-xs font-bold border border-yellow-200 flex items-center gap-1 self-start sm:self-center">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Chờ chấm</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBoardDetails(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-sm"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-[#E7E0C4] flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Sparkles className="w-5 h-5 text-primary-container" />
                <h2 className="font-extrabold text-lg">Tạo buổi hội đồng mới</h2>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateBoard} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tên hội đồng bảo vệ *
                </label>
                <input
                  type="text"
                  value={boardName}
                  onChange={e => setBoardName(e.target.value)}
                  placeholder="Ví dụ: Hội đồng bảo vệ đồ án ngành TP"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700"
                />
              </div>

              {/* Row plan + location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Đợt kiến tập
                  </label>
                  <select
                    value={plan}
                    onChange={e => setPlan(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none text-slate-700 cursor-pointer"
                  >
                    <option value="HK1 2023-2024">HK1 2023-2024</option>
                    <option value="HK2 2023-2024">HK2 2023-2024</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phòng học / Địa điểm *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Phòng A101"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700"
                  />
                </div>
              </div>

              {/* Row date + time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Ngày chấm bảo cáo *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Giờ bắt đầu *
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none text-slate-700"
                  />
                </div>
              </div>

              {/* Faculty checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Phân công giảng viên hội đồng (Chọn nhiều)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                  {availableFaculty.map(f => (
                    <label key={f.name} className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFaculty.includes(f.name)}
                        onChange={() => {
                          if (selectedFaculty.includes(f.name)) {
                            setSelectedFaculty(prev => prev.filter(item => item !== f.name));
                          } else {
                            setSelectedFaculty(prev => [...prev, f.name]);
                          }
                        }}
                        className="rounded border-slate-300 text-[#407F3E] focus:ring-[#407F3E]/20"
                      />
                      <span>{f.name} ({f.role})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Students checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Chỉ định sinh viên bảo cáo (Chọn nhiều)
                </label>
                <div className="space-y-1.5 border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                  {availableStudents.map(s => (
                    <label key={s.mssv} className="flex items-start gap-2 text-xs text-slate-700 p-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s.mssv)}
                        onChange={() => {
                          if (selectedStudents.includes(s.mssv)) {
                            setSelectedStudents(prev => prev.filter(item => item !== s.mssv));
                          } else {
                            setSelectedStudents(prev => [...prev, s.mssv]);
                          }
                        }}
                        className="rounded border-slate-300 text-[#407F3E] focus:ring-[#407F3E]/20 mt-0.5"
                      />
                      <div>
                        <span className="font-bold">{s.name}</span> <span className="text-slate-400">({s.mssv})</span>
                        <p className="text-[10px] text-slate-500 leading-tight italic">{s.topic}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#407F3E] hover:bg-[#346732] text-white rounded-xl text-sm font-semibold shadow-md cursor-pointer"
                >
                  Tạo hội đồng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
