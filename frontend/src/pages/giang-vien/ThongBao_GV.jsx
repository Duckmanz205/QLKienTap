import React, { useState, useEffect } from 'react';
import { 
  Bell, FileText, CheckCircle2, AlertTriangle, 
  Paperclip, Clock, Trash2, Check
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function ThongBao_GV() {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' or 'unread'
  const [notifications, setNotifications] = useState([]);
  const [lecturer, setLecturer] = useState(null);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchNotifications(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchNotifications = async (gvId) => {
    try {
      const res = await giangVienApi.getNotifications(gvId);
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (notif) => {
    if (notif.da_doc || !lecturer) return;
    try {
      await giangVienApi.markNotificationRead(notif.id, lecturer.taikhoan_id);
      setNotifications(prev => prev.map(n => 
        n.id === notif.id ? { ...n, da_doc: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!lecturer) return;
    try {
      await giangVienApi.markAllNotificationsRead(lecturer.id);
      setNotifications(prev => prev.map(n => ({ ...n, da_doc: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = (e, notifId) => {
    e.stopPropagation();
    setDismissedIds(prev => [...prev, notifId]);
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.includes(n.id));

  const filteredNotifications = visibleNotifications.filter(
    n => activeFilter === 'all' || (activeFilter === 'unread' && !n.da_doc)
  );

  const unreadCount = visibleNotifications.filter(n => !n.da_doc).length;

  const getIcon = (type) => {
    switch(type) {
      case 'CanhBao': return <div className="w-10 h-10 rounded-full bg-[#DBD468]/20 text-[#8b8433] flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5" /></div>;
      case 'PhanCong': return <div className="w-10 h-10 rounded-full bg-[#407F3E]/10 text-[#407F3E] flex items-center justify-center shrink-0"><FileText className="w-5 h-5" /></div>;
      case 'ThanhCong': return <div className="w-10 h-10 rounded-full bg-[#89B449]/20 text-[#476d01] flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5" /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><Bell className="w-5 h-5" /></div>;
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      
      <div className="max-w-4xl mx-auto">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#407F3E]" /> Thông báo
            </h1>
            
            {/* Filter Pills */}
            <div className="flex bg-[#E7E0C4]/50 p-1 rounded-lg border border-[#E7E0C4]">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'all' ? 'bg-[#407F3E] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setActiveFilter('unread')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'unread' ? 'bg-[#407F3E] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Chưa đọc
                {unreadCount > 0 && <span className="w-4 h-4 rounded-full bg-[#DBD468] text-slate-800 text-[9px] flex items-center justify-center">{unreadCount}</span>}
              </button>
            </div>
          </div>

          <button 
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-slate-500 hover:text-[#407F3E] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Notifications Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#E7E0C4]/30 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-700 font-bold">Không có thông báo nào.</h3>
              <p className="text-sm text-slate-500 mt-1">Bạn đã cập nhật tất cả thông tin mới nhất.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredNotifications.map((notif, index) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleMarkAsRead(notif)}
                  className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 group cursor-pointer ${
                    index !== filteredNotifications.length - 1 ? 'border-b border-[#E7E0C4]/60' : ''
                  } ${!notif.da_doc ? 'bg-[#fdfcf8]' : 'opacity-70 hover:opacity-100'}`}
                >
                  
                  {/* Unread Indicator & Icon */}
                  <div className="relative shrink-0">
                    {!notif.da_doc && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#DBD468] rounded-full border-2 border-white shadow-sm z-10"></div>
                    )}
                    {getIcon(notif.loai_thong_bao)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-1 mb-1">
                      <h3 className={`text-sm truncate pr-4 ${!notif.da_doc ? 'font-black text-slate-800' : 'font-bold text-slate-700'}`}>
                        {notif.tieu_de}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {new Date(notif.ngay_gui || Date.now()).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    <p className={`text-xs line-clamp-2 leading-relaxed mb-3 ${!notif.da_doc ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                      {notif.noi_dung}
                    </p>

                    {/* Attachment Chip */}
                    {notif.file_dinh_kem && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7E0C4]/30 hover:bg-[#E7E0C4] border border-[#E7E0C4] rounded-lg cursor-pointer transition-colors w-fit">
                        <Paperclip className="w-3.5 h-3.5 text-[#407F3E]" />
                        <span className="text-[11px] font-bold text-slate-700">Tệp đính kèm</span>
                      </div>
                    )}
                  </div>

                  {/* Actions (Hover) */}
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                    <button 
                      onClick={(e) => handleDismiss(e, notif.id)}
                      className="p-2 text-slate-300 hover:text-[#E68A8C] hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                      title="Ẩn thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
