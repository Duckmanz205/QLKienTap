import React, { useState } from 'react';
import { Bell, Search, Plus, RotateCcw, Trash2, X, Sparkles, Check, Clock } from 'lucide-react';

const initialMockAnnouncements = [
  { 
    id: 1, 
    title: 'Cập nhật lịch xuất phát chuyến tham quan Nhà máy Sữa Vinamilk Bình Dương', 
    createdAt: '2026-10-12 08:30', 
    recipients: ['Sinh viên'], 
    status: 'Đang hiển thị' 
  },
  { 
    id: 2, 
    title: 'Họp hội đồng xét duyệt đề cương kiến tập học kỳ phụ năm học 2026-2027', 
    createdAt: '2026-10-10 14:15', 
    recipients: ['Giảng viên'], 
    status: 'Lên lịch',
    scheduledAt: '2026-10-18 09:00' 
  },
  { 
    id: 3, 
    title: 'Thông báo nộp học phí và hoàn tất hồ sơ đăng ký kiến tập tự do khóa 14', 
    createdAt: '2026-10-08 10:00', 
    recipients: ['Sinh viên', 'Giảng viên'], 
    status: 'Bản nháp' 
  }
];

export default function ThongBao_Khoa() {
  const [announcements, setAnnouncements] = useState(initialMockAnnouncements);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('Tất cả');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState(null);

  // Compose form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState(['Sinh viên']);
  const [sendMethod, setSendMethod] = useState('now'); // now or schedule
  const [scheduleTime, setScheduleTime] = useState('');
  const [classFilter, setClassFilter] = useState('Tất cả');

  const getRecipientBadgeClass = (rec) => {
    if (rec.includes('Sinh viên') && rec.includes('Giảng viên')) return 'bg-slate-500 text-white';
    if (rec.includes('Sinh viên')) return 'bg-[#89B449] text-white'; // Secondary green
    return 'bg-[#407F3E] text-white'; // Primary green
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Đang hiển thị') return 'bg-[#89B449] text-white'; // Secondary green
    if (status === 'Lên lịch') return 'bg-[#DBD468] text-slate-800'; // Warning yellow
    return 'bg-[#E7E0C4] text-slate-700'; // Muted gray
  };

  const handleComposeSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
      return;
    }
    const newAnn = {
      id: announcements.length + 1,
      title,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      recipients: selectedRecipients,
      status: sendMethod === 'now' ? 'Đang hiển thị' : 'Lên lịch',
      scheduledAt: sendMethod === 'schedule' ? scheduleTime : undefined
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setShowAddModal(false);
    // Reset form
    setTitle('');
    setContent('');
    setSelectedRecipients(['Sinh viên']);
    setSendMethod('now');
    setScheduleTime('');
  };

  const handleDelete = (id, titleStr) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thông báo: "${titleStr}"?`)) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleResend = (ann) => {
    if (ann.status === 'Đang hiển thị') {
      if (confirm(`Thu hồi thông báo "${ann.title}"?`)) {
        setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, status: 'Bản nháp' } : a));
      }
    } else {
      if (confirm(`Gửi lại thông báo "${ann.title}" ngay bây giờ?`)) {
        setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, status: 'Đang hiển thị' } : a));
      }
    }
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = recipientFilter === 'Tất cả' || 
      (recipientFilter === 'Sinh viên' && ann.recipients.includes('Sinh viên')) ||
      (recipientFilter === 'Giảng viên' && ann.recipients.includes('Giảng viên'));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Thông báo
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tạo và gửi thông báo quan trọng đến sinh viên hoặc giảng viên dẫn đoàn, theo dõi lịch chấm bài.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/95 text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo thông báo mới</span>
        </button>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-[#E7E0C4] p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {/* Đối tượng nhận */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Đối tượng nhận
            </label>
            <select
              value={recipientFilter}
              onChange={e => setRecipientFilter(e.target.value)}
              className="w-full bg-[#E7E0C4]/10 border border-[#E7E0C4] rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold hover:bg-[#E7E0C4]/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            >
              <option value="Tất cả">Tất cả đối tượng</option>
              <option value="Sinh viên">Sinh viên</option>
              <option value="Giảng viên">Giảng viên</option>
            </select>
          </div>

          {/* Tìm kiếm */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Tìm kiếm
            </label>
            <div className="relative flex items-center bg-[#E7E0C4]/10 rounded-xl border border-[#E7E0C4] focus-within:ring-2 focus-within:ring-[#407F3E]/20 transition-all">
              <Search className="absolute left-4 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm thông báo..."
                className="w-full bg-transparent text-sm text-slate-800 pl-11 pr-4 py-2.5 outline-none placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-[#E7E0C4]">
              <tr>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Tiêu đề thông báo</th>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Ngày tạo</th>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Đối tượng nhận</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0C4]/40 text-slate-800 font-medium">
              {filteredAnnouncements.map((ann) => (
                <tr key={ann.id} className="hover:bg-[#E7E0C4]/10 transition-colors duration-200">
                  <td className="px-6 py-4 border-r border-[#E7E0C4]/40 max-w-sm truncate" title={ann.title}>
                    <button 
                      onClick={() => setSelectedAnn(ann)}
                      className="font-bold text-slate-805 hover:text-[#407F3E] text-sm text-left transition-colors"
                    >
                      {ann.title}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500 border-r border-[#E7E0C4]/40">{ann.createdAt}</td>
                  <td className="px-6 py-4 border-r border-[#E7E0C4]/40">
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${getRecipientBadgeClass(ann.recipients)}`}>
                      {ann.recipients.join(' & ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${getStatusBadgeClass(ann.status)}`}>
                      {ann.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* Resend / Recall */}
                      <button
                        onClick={() => handleResend(ann)}
                        className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                        title={ann.status === 'Đang hiển thị' ? "Thu hồi thông báo" : "Gửi lại thông báo"}
                      >
                        <RotateCcw className="w-4.5 h-4.5" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(ann.id, ann.title)}
                        className="p-1.5 text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-xl transition-all cursor-pointer"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Dialog */}
      {selectedAnn && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#E7E0C4] bg-[#E7E0C4]/30 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#407F3E]" />
                <span>Chi tiết thông báo</span>
              </h2>
              <button 
                onClick={() => setSelectedAnn(null)} 
                className="text-slate-450 hover:text-slate-700 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm font-semibold text-slate-650">
              <h3 className="text-lg font-black text-slate-850 leading-snug">{selectedAnn.title}</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 font-bold py-2 border-y border-slate-100">
                <span>Ngày tạo: {selectedAnn.createdAt}</span>
                <span>Người nhận: {selectedAnn.recipients.join(' & ')}</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line py-2">
                Nội dung chi tiết thông báo sẽ được lưu trữ trên bảng tin của IMS portal để sinh viên và giảng viên truy cập trực tuyến.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-[#E7E0C4] flex justify-end">
              <button 
                onClick={() => setSelectedAnn(null)} 
                className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating compose modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#E7E0C4] bg-white flex items-center justify-between">
              <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#407F3E]" />
                <span>+ Soạn thông báo mới</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-450 hover:text-slate-700 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleComposeSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 font-semibold text-sm">
              {/* Tiêu đề thông báo */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tiêu đề thông báo *
                </label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Nhập tiêu đề thông báo..." 
                  required 
                  className="w-full px-4 py-2.5 border border-[#E7E0C4] bg-slate-50 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700" 
                />
              </div>

              {/* Nội dung thông báo */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nội dung thông báo *
                </label>
                <textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="Nhập nội dung thông báo..." 
                  required 
                  rows={4} 
                  className="w-full px-4 py-2.5 border border-[#E7E0C4] bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700"
                ></textarea>
              </div>

              {/* Select multichip dropdown: Đối tượng nhận */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Đối tượng nhận
                </label>
                <div className="flex gap-4">
                  {['Sinh viên', 'Giảng viên'].map(role => (
                    <label key={role} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedRecipients.includes(role)} 
                        onChange={() => {
                          setSelectedRecipients(prev => 
                            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
                          );
                        }} 
                        className="rounded border-slate-350 text-[#407F3E] focus:ring-[#407F3E]/25" 
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Radio group Phương thức gửi */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Phương thức gửi
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-xs">
                    <input 
                      type="radio" 
                      name="sendMethod" 
                      value="now" 
                      checked={sendMethod === 'now'} 
                      onChange={() => setSendMethod('now')} 
                      className="text-[#407F3E] focus:ring-[#407F3E]/20" 
                    />
                    <span>Gửi ngay</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-xs">
                    <input 
                      type="radio" 
                      name="sendMethod" 
                      value="schedule" 
                      checked={sendMethod === 'schedule'} 
                      onChange={() => setSendMethod('schedule')} 
                      className="text-[#407F3E] focus:ring-[#407F3E]/20" 
                    />
                    <span>Lên lịch gửi</span>
                  </label>
                </div>
                {sendMethod === 'schedule' && (
                  <div className="mt-3 animate-fade-in">
                    <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Thời gian gửi dự kiến</label>
                    <input 
                      type="datetime-local" 
                      value={scheduleTime} 
                      onChange={e => setScheduleTime(e.target.value)} 
                      required 
                      className="px-4 py-2 border border-[#E7E0C4] bg-slate-50 rounded-xl text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                )}
              </div>

              {/* Select multichip: Lọc theo lớp/chuyến */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Lọc theo lớp/chuyến (Tùy chọn)
                </label>
                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E7E0C4] bg-slate-50 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="Tất cả">Tất cả lớp / chuyến tham quan</option>
                  <option value="14ĐHTP01">14ĐHTP01</option>
                  <option value="14ĐHTP02">14ĐHTP02</option>
                  <option value="14ĐHTP03">14ĐHTP03</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E7E0C4]">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-5 py-2.5 border border-[#E7E0C4] rounded-xl text-slate-650 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/95 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Gửi thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
