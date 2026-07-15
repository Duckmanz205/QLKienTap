import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';
import { Bell, PlusCircle, Send, Search, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';

export default function ThongBao_Khoa() {
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedKhoaId, setSelectedKhoaId] = useState(''); // Empty means all departments

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchData();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed.user) {
          setCurrentUser(parsed.user);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      const notRes = await khoaApi.getNotifications();
      setNotifications(notRes.data);

      const courseRes = await khoaApi.getCourses();
      setCourses(courseRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Bạn cần đăng nhập để thực hiện hành động này.');
      return;
    }
    try {
      setError('');
      setMessage('');
      await khoaApi.createNotification({
        tieu_de: title,
        noi_dung: content,
        nguoi_gui_id: currentUser.id,
        khoa_id: selectedKhoaId ? Number(selectedKhoaId) : undefined,
      });
      setMessage('Đăng thông báo lên bảng tin thành công!');
      setTitle('');
      setContent('');
      setSelectedKhoaId('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Lỗi khi gửi thông báo.');
    }
  };

  const filteredNotifications = notifications.filter(n => 
    n.tieu_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.noi_dung.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Bell className="text-primary w-6 h-6 animate-bounce" />
          Bảng tin & Thông báo Khoa
        </h2>
        <p className="text-slate-500 text-sm">Gửi thông báo khẩn cấp, nhắc nhở hoặc quy chế học tập trực tiếp đến ứng dụng của sinh viên và giảng viên</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-500/30 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-500/30 text-rose-800 px-4 py-3 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Announcement Form */}
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm space-y-4 lg:col-span-1 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PlusCircle className="text-primary w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800">Tạo thông báo mới</h3>
          </div>
          <form onSubmit={handleSendNotification} className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1">Tiêu đề thông báo</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ví dụ: Lịch nộp báo cáo kiến tập chính thức"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <div>
              <label className="block mb-1">Đối tượng nhận tin</label>
              <select
                value={selectedKhoaId}
                onChange={e => setSelectedKhoaId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
              >
                <option value="">Gửi toàn bộ Sinh viên & Giảng viên</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>Chỉ gửi khoa: {c.ten_khoa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Nội dung chi tiết</label>
              <textarea
                required
                rows="6"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Nhập nội dung thông tin cần truyền tải..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-[#2c6b2d] text-white py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-sm"
            >
              <Send className="w-4 h-4" /> Đăng thông báo
            </button>
          </form>
        </div>

        {/* Bulletins list */}
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Volume2 className="text-secondary w-5 h-5" />
              Lịch sử các thông báo đã đăng
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nội dung thông báo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary font-semibold"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredNotifications.map(n => (
              <div 
                key={n.id} 
                className="p-4 rounded-xl bg-slate-50 hover:bg-[#f8faf1]/40 border border-slate-100 hover:border-primary/10 transition-all space-y-2.5"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 text-sm">{n.tieu_de}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                      <span>Người gửi: {n.nguoiGui?.ten_hien_thi || 'Văn phòng khoa'}</span>
                      <span>•</span>
                      <span>{new Date(n.ngay_gui).toLocaleString('vi-VN')}</span>
                      {n.khoa && (
                        <>
                          <span>•</span>
                          <span className="text-[#89B449]">Phạm vi: {n.khoa.ten_khoa}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                  {n.noi_dung}
                </p>
              </div>
            ))}
            {filteredNotifications.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-medium">
                Không tìm thấy thông báo nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
