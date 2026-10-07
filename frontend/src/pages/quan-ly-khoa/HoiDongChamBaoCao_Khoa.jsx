import toast from 'react-hot-toast';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, ChevronDown, Check, X, Search, ChevronRight, Calendar, MapPin
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function HoiDongChamBaoCao_Khoa() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);

  // Modal Dropdown States
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false); // To show the open state

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchStatusDropdown, setSearchStatusDropdown] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Form States
  const [boardName, setBoardName] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [room, setRoom] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]); // if needed

  // Data
  const [campaigns, setCampaigns] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [committees, setCommittees] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campRes, lecRes, boardRes] = await Promise.all([
        khoaApi.getCampaigns({ limit: 100 }),
        khoaApi.getLecturers(),
        khoaApi.getBoards()
      ]);
      setCampaigns(campRes.data?.data || campRes.data || []);
      setLecturers(lecRes.data);
      
      const formattedBoards = boardRes.data.map(b => ({
        id: b.id,
        ten: b.ten_hoi_dong,
        lich: b.dotKienTap?.ten_dot || 'Đợt kiến tập',
        ngay: b.ngay_bao_cao ? new Date(b.ngay_bao_cao).toLocaleDateString('vi-VN') : '',
        gio: b.ngay_bao_cao ? new Date(b.ngay_bao_cao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
        diaDiem: b.dia_diem,
        members: b.members || [],
        sv: b.sv || 0,
        trangThai: new Date(b.ngay_bao_cao) > new Date() ? 'Sắp diễn ra' : 'Đã hoàn thành'
      }));
      setCommittees(formattedBoards);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!selectedSchedule || !boardName || !dateTime || !room) {
      toast.success('Vui lòng điền đủ thông tin bắt buộc');
      return;
    }
    try {
      const res = await khoaApi.createBoard({
        dotKienTapId: selectedSchedule,
        name: boardName,
        date: dateTime,
        room: room
      });
      
      const boardId = res.data.id;
      
      // add board members
      for (const member of selectedMembers) {
        await khoaApi.addBoardMember({
          boardId,
          lecturerId: member.id,
          role: member.role
        });
      }

      toast.success('Tạo hội đồng thành công!');
      setIsModalOpen(false);
      setBoardName('');
      setSelectedSchedule('');
      setDateTime('');
      setRoom('');
      setSelectedMembers([]);
      fetchData();

    } catch (err) {
      console.error(err);
      toast.error('Lỗi tạo hội đồng');
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

  // Filter & Pagination logic
  const filteredCommittees = useMemo(() => {
    return committees.filter(c => {
      const matchSearch = !searchTerm || 
        c.ten?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.lich?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.diaDiem?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === 'ALL' || c.trangThai === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [committees, searchTerm, selectedStatus]);

  const totalPages = Math.ceil(filteredCommittees.length / limit) || 1;
  const paginatedCommittees = filteredCommittees.slice((currentPage - 1) * limit, currentPage * limit);

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

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[280px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm theo tên hội đồng, lịch, địa điểm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-[#E7E0C4] rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-[#407F3E] text-slate-700 font-medium"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative w-56" onClick={(e) => e.stopPropagation()}>
            <div 
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
            >
              <span className="truncate pr-2 font-medium text-slate-700">
                {selectedStatus === 'ALL' ? 'Tất cả trạng thái' : selectedStatus}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isStatusDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
                <div className="p-2 border-b border-[#E7E0C4]">
                  <input
                    type="text"
                    placeholder="Tìm trạng thái..."
                    value={searchStatusDropdown}
                    onChange={(e) => setSearchStatusDropdown(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-[#E7E0C4] rounded-md focus:outline-none focus:border-[#407F3E]"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {[
                    { id: 'ALL', name: 'Tất cả trạng thái' },
                    { id: 'Sắp diễn ra', name: 'Sắp diễn ra' },
                    { id: 'Đang diễn ra', name: 'Đang diễn ra' },
                    { id: 'Đã hoàn thành', name: 'Đã hoàn thành' }
                  ]
                    .filter(opt => !searchStatusDropdown || opt.name.toLowerCase().includes(searchStatusDropdown.toLowerCase()))
                    .map(opt => (
                      <div 
                        key={opt.id}
                        onClick={() => { 
                          setSelectedStatus(opt.id); 
                          setIsStatusDropdownOpen(false); 
                          setSearchStatusDropdown('');
                          setCurrentPage(1); 
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                          selectedStatus === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {selectedStatus === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                      </div>
                    ))}
                  {[
                    { id: 'ALL', name: 'Tất cả trạng thái' },
                    { id: 'Sắp diễn ra', name: 'Sắp diễn ra' },
                    { id: 'Đang diễn ra', name: 'Đang diễn ra' },
                    { id: 'Đã hoàn thành', name: 'Đã hoàn thành' }
                  ].filter(opt => !searchStatusDropdown || opt.name.toLowerCase().includes(searchStatusDropdown.toLowerCase())).length === 0 && (
                    <div className="px-4 py-3 text-xs text-slate-500 text-center">Không tìm thấy</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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
              {filteredCommittees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">Không có hội đồng nào phù hợp.</td>
                </tr>
              ) : (
                paginatedCommittees.map(c => {
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
                            <img key={idx} src={m.giangVien?.anh_dai_dien || `https://i.pravatar.cc/150?u=${m.giang_vien_id}`} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white shadow-sm z-10 relative bg-slate-50" style={{ zIndex: 10 - idx }} />
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <SearchableDropdown 
              options={[
                { value: 15, label: '15' },
                { value: 30, label: '30' },
                { value: 50, label: '50' },
                { value: 100, label: '100' }
              ]}
              value={limit}
              onChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
              searchPlaceholder="Tìm số lượng..."
              className="min-w-[80px]"
            />
            <span>/ {filteredCommittees.length} hội đồng</span>
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

                  <div className="relative z-50">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Đợt kiến tập *</label>
                    <div 
                      onClick={(e) => handleModalDropdownClick(e, setIsLichDropdownOpen)}
                      className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm flex justify-between items-center cursor-pointer hover:border-[#407F3E]"
                    >
                      <span className="text-slate-800 font-bold truncate pr-2">
                        {selectedSchedule 
                          ? campaigns.find(c => c.id === selectedSchedule)?.ten_dot 
                          : 'Chọn đợt kiến tập'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    {isLichDropdownOpen && (
                      <div 
                        className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl py-2 max-h-48 overflow-y-auto animate-in slide-in-from-top-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {campaigns.map(camp => (
                          <div 
                            key={camp.id}
                            onClick={() => {
                              setSelectedSchedule(camp.id);
                              setIsLichDropdownOpen(false);
                            }}
                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0"
                          >
                            <div className="font-bold text-slate-800">{camp.ten_dot}</div>
                            <div className="text-xs font-medium text-slate-500 mt-0.5">{(camp.khoaHoc && camp.hocKy) ? `${camp.hocKy.ten_hoc_ky} - Khóa ${camp.khoaHoc.nien_khoa}` : ''}</div>
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

                {/* Row 3: Thành viên */}
                <div className="grid grid-cols-1 gap-5 relative z-40">
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
                          const isChecked = selectedMembers.some(m => m.id === lec.id);
                          return (
                            <div 
                              key={lec.id}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedMembers(selectedMembers.filter(m => m.id !== lec.id));
                                } else {
                                  setSelectedMembers([...selectedMembers, { id: lec.id, role: 'Thành viên' }]);
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
                    {selectedMembers.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2">
                        {selectedMembers.map(m => {
                          const lec = lecturers.find(l => l.id === m.id);
                          return (
                            <div key={m.id} className="flex items-center justify-between p-2 bg-slate-50 border border-[#E7E0C4] rounded-lg">
                              <span className="text-sm font-semibold text-slate-800">{lec?.ho_ten}</span>
                              <select
                                value={m.role}
                                onChange={(e) => {
                                  const newRole = e.target.value;
                                  setSelectedMembers(selectedMembers.map(item => item.id === m.id ? { ...item, role: newRole } : item));
                                }}
                                className="text-xs px-2 py-1.5 border border-slate-200 rounded font-bold text-slate-700 bg-white focus:outline-none focus:border-[#407F3E]"
                              >
                                <option value="Chủ tịch">Chủ tịch</option>
                                <option value="Thư ký">Thư ký</option>
                                <option value="Thành viên">Thành viên</option>
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Removed mock student selection as students are automatically mapped via Schedule */}

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
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Chi tiết Hội đồng
              </h2>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-[#407F3E] mb-4">{viewingDetail.ten}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Đợt kiến tập</span>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{viewingDetail.lich}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Trạng thái</span>
                    <p className="mt-1">{getStatusBadge(viewingDetail.trangThai)}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Ngày giờ</span>
                    <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-slate-800">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {viewingDetail.ngay} - {viewingDetail.gio}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Địa điểm</span>
                    <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-slate-800">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {viewingDetail.diaDiem}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  Danh sách Giảng viên
                  <span className="bg-[#E7E0C4] text-slate-800 px-2 py-0.5 rounded-full text-xs">{viewingDetail.members?.length || 0}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingDetail.members?.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-[#407F3E] transition-colors bg-white">
                      <img src={m.giangVien?.anh_dai_dien || `https://i.pravatar.cc/150?u=${m.giang_vien_id}`} alt="avatar" className="w-10 h-10 rounded-full border border-slate-200 object-cover bg-slate-50" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{m.giangVien?.ho_ten || 'Giảng viên'}</p>
                        <p className={`text-xs font-bold mt-0.5 ${m.vai_tro === 'Chủ tịch' ? 'text-red-500' : m.vai_tro === 'Thư ký' ? 'text-blue-500' : 'text-slate-500'}`}>{m.vai_tro}</p>
                      </div>
                    </div>
                  ))}
                  {(!viewingDetail.members || viewingDetail.members.length === 0) && (
                    <div className="col-span-2 text-sm text-slate-500 text-center py-4 italic border border-slate-200 rounded-xl border-dashed">Chưa có thành viên</div>
                  )}
                </div>
              </div>
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
