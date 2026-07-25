import React, { useState } from 'react';
import { Notification } from '../types';
import { ArrowLeft, CheckCircle, FileText, Download, Calendar, MailOpen, AlertCircle, Sparkles } from 'lucide-react';

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllRead: () => void;
  onGoBack: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllRead,
  onGoBack
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Filter list
  const filteredNotifs = notifications.filter(notif => {
    if (filter === 'all') return true;
    return !notif.isRead;
  });

  const handleDownload = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation(); // Avoid marking as read if clicked on attachment only
    alert(`Đã tải xuống tệp đính kèm: ${fileName}`);
  };

  return (
    <div className="flex flex-col animate-fadeIn pb-6">
      {/* Top sticky bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xs py-3 flex items-center justify-between border-b border-slate-100 -mx-4 px-4 mb-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={onGoBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-extrabold text-base text-slate-800">Thông báo</h2>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#ecefe6] rounded-full p-0.5 shadow-inner">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full font-bold text-[10px] transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#266528] text-white'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full font-bold text-[10px] transition-all whitespace-nowrap ${
              filter === 'unread'
                ? 'bg-[#266528] text-white'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            Chưa đọc
          </button>
        </div>
      </div>

      {/* Trigger all read */}
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-xs text-slate-400 font-medium">Có {notifications.filter(n => !n.isRead).length} thông báo mới</span>
        <button 
          onClick={() => { onMarkAllRead(); alert('Đã đánh dấu đọc tất cả thông báo!'); }}
          className="text-xs font-bold text-[#266528] hover:underline flex items-center gap-1"
        >
          <MailOpen size={13} />
          <span>Đọc tất cả</span>
        </button>
      </div>

      {/* Row list */}
      <div className="flex flex-col bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
              <CheckCircle size={32} />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Bạn đã xem hết thông báo</h4>
            <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">Không có thông báo mới nào vào lúc này. Hãy quay lại sau nhé.</p>
          </div>
        ) : (
          filteredNotifs.map((notif, idx) => {
            let iconColorClass = 'text-amber-500 bg-amber-50';
            if (notif.type === 'Kết quả báo cáo') {
              iconColorClass = 'text-pink-600 bg-pink-50';
            } else if (notif.type === 'Cập nhật tài liệu') {
              iconColorClass = 'text-emerald-600 bg-emerald-50';
            } else if (notif.type === 'Nhắc nhở đóng phí') {
              iconColorClass = 'text-rose-500 bg-rose-50';
            }

            return (
              <div 
                key={notif.id}
                onClick={() => { onMarkAsRead(notif.id); }}
                className={`relative px-4 py-4 flex gap-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                  !notif.isRead ? 'bg-[#f8faf1]/40' : ''
                } ${idx === filteredNotifs.length - 1 ? 'border-b-0' : ''}`}
              >
                {/* Yellow status indicator inside card margin exactly like Screen C */}
                {!notif.isRead && (
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#DBD468]"></div>
                )}
                
                <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${iconColorClass} ml-1`}>
                  <AlertCircle size={20} />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm leading-tight text-slate-800 truncate pr-2 ${!notif.isRead ? 'font-bold' : 'font-semibold'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">{notif.timeText}</span>
                  </div>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                    {notif.content}
                  </p>
                  
                  {/* Attachment card block */}
                  {notif.attachment && (
                    <div 
                      onClick={(e) => handleDownload(e, notif.attachment!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2f5ec] hover:bg-[#ecefe6] text-slate-600 font-semibold text-[10px] border border-slate-200/50 w-fit active:scale-95 transition-transform"
                    >
                      <Download size={12} className="text-[#266528]" />
                      <span>{notif.attachment}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
