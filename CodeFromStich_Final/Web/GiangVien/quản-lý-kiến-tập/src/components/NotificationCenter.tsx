import React from 'react';
import { SystemNotification } from '../types';

interface NotificationCenterProps {
  notifications: SystemNotification[];
  onMarkAllAsRead: () => void;
  onToggleRead: (id: string) => void;
}

export default function NotificationCenter({ 
  notifications, 
  onMarkAllAsRead, 
  onToggleRead 
}: NotificationCenterProps) {
  
  const unreadCount = notifications.filter(n => n.unread).length;

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return { icon: 'assignment_turned_in', bg: 'bg-green-50 text-green-700 border-green-150' };
      case 'event_change':
        return { icon: 'campaign', bg: 'bg-amber-50 text-[#7c7515] border-amber-150' };
      case 'student_add':
        return { icon: 'person_add', bg: 'bg-blue-50 text-blue-700 border-blue-150' };
      case 'success':
        return { icon: 'check_circle', bg: 'bg-emerald-50 text-emerald-700 border-emerald-150' };
      case 'reminder':
        return { icon: 'alarm', bg: 'bg-pink-50 text-pink-700 border-pink-150' };
      default:
        return { icon: 'notifications', bg: 'bg-slate-50 text-slate-700 border-slate-150' };
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in select-none">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Thông báo hệ thống</h1>
          {unreadCount > 0 && (
            <span className="bg-[#DBD468] text-[#191d17] font-black text-xs px-3 py-1 rounded-full shadow-sm animate-pulse shrink-0">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="px-4 py-2 border border-[#266528] text-[#266528] hover:bg-[#266528]/5 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Roster list */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((item) => {
            const style = getIconAndColor(item.type);

            return (
              <div
                key={item.id}
                onClick={() => onToggleRead(item.id)}
                className={`p-5 rounded-2xl border transition-all relative flex gap-4 cursor-pointer select-none group ${
                  item.unread
                    ? 'bg-white border-primary shadow-sm hover:shadow-md'
                    : 'bg-white/60 border-slate-150 opacity-80 hover:opacity-100 hover:bg-white'
                }`}
              >
                {/* Left Dot Indicator */}
                {item.unread && (
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 w-2 h-2 bg-[#DBD468] rounded-full shadow-md animate-pulse"></div>
                )}

                {/* Category Icon Wrapper */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${style.bg} ${item.unread ? 'scale-105 shadow-xs' : ''}`}>
                  <span className="material-symbols-outlined text-[22px]">{style.icon}</span>
                </div>

                {/* Content body */}
                <div className="flex-1 space-y-1.5 pl-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className={`text-sm leading-tight text-on-surface ${item.unread ? 'font-black' : 'font-bold'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-on-surface-variant font-mono font-medium whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-on-surface-variant text-xs font-semibold leading-relaxed">
                    {item.description}
                  </p>

                  {/* Attachment card */}
                  {item.attachment && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Đang tải tệp đính kèm: ${item.attachment}`);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f8faf1] hover:bg-[#f2f5ec] border border-slate-200 rounded-lg text-[11px] font-bold text-primary transition-all cursor-pointer mt-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">attachment</span>
                      <span>{item.attachment}</span>
                      <span className="material-symbols-outlined text-[14px] text-slate-400">download</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl py-12 text-center border border-slate-100 shadow-xs">
            <span className="material-symbols-outlined text-[48px] text-slate-300">notifications_off</span>
            <p className="text-on-surface-variant text-sm font-bold mt-2">Hộp thư thông báo trống rỗng!</p>
          </div>
        )}
      </div>
    </div>
  );
}
