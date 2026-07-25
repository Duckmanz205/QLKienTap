import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  FileText, 
  CreditCard, 
  Settings, 
  CheckCheck, 
  Download, 
  Clock,
  HelpCircle,
  Mail,
  ArrowRight
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export default function NotificationsView({ notifications, onMarkAllRead }: NotificationsViewProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Counts
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filter list
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">Trung tâm Thông báo</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">
          Theo dõi các thay đổi đột xuất về lịch trình, công bố kết quả điểm thi báo cáo, hoặc nhắc nhở thanh toán lệ phí đoàn khoa.
        </p>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Notification list feed */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Filter segment selectors */}
          <div className="flex gap-2 bg-white/60 p-1 rounded-xl border border-surface-container self-start">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'all' 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-on-surface-variant hover:bg-white/50'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'unread' 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-on-surface-variant hover:bg-white/50'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* List display */}
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              // Icon selector
              let Icon = Bell;
              let iconBg = 'bg-primary/10 text-primary';
              if (notif.category === 'lịch trình') {
                Icon = Calendar;
                iconBg = 'bg-secondary-container/40 text-[#476d01]';
              } else if (notif.category === 'bài thu hoạch') {
                Icon = FileText;
                iconBg = 'bg-blue-100 text-blue-700';
              } else if (notif.category === 'tài chính') {
                Icon = CreditCard;
                iconBg = 'bg-red-50 text-red-600';
              }

              return (
                <div 
                  key={notif.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all duration-300 relative flex gap-4 items-start group hover:shadow-md hover:scale-[1.005] ${
                    notif.isRead 
                      ? 'border-surface-muted/30 opacity-80' 
                      : 'border-primary/20 bg-primary/2/5 ring-1 ring-primary/5'
                  }`}
                >
                  {/* Category circular icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Main content snippet */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors pr-2">
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-warning-yellow flex-shrink-0 animate-pulse border border-white shadow-sm mt-1.5"></span>
                      )}
                    </div>

                    <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
                      {notif.content}
                    </p>

                    {/* Meta info & Attachment */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container/50 text-[10px] text-outline font-black">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-outline-variant" />
                        <span>{notif.timeRelative}</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                        <span className="uppercase text-[#89b449]"># {notif.category}</span>
                      </div>

                      {notif.attachmentName && (
                        <button 
                          onClick={() => alert(`Bắt đầu tải tài liệu đính kèm: ${notif.attachmentName}`)}
                          className="flex items-center gap-1.5 bg-[#f2f5ec] hover:bg-[#e5ffdc] hover:text-primary px-2.5 py-1 rounded-lg border border-surface-muted transition-all cursor-pointer font-bold text-[10px] text-on-surface"
                        >
                          <Download className="w-3 h-3 text-primary" />
                          <span>{notif.attachmentName} ({notif.attachmentSize})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-outline-variant py-16 text-center max-w-lg mx-auto">
                <Bell className="w-16 h-16 text-outline/40 mx-auto mb-4" />
                <p className="text-base font-bold text-on-surface">Không có thông báo mới</p>
                <p className="text-xs text-on-surface-variant mt-1">Chúc mừng! Bạn đã cập nhật hết tất cả các thông tin từ khoa.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions and Tips side bar */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-muted/40 p-6 flex flex-col sticky top-24 gap-6">
            
            {/* Overview indicator counts */}
            <div className="space-y-4">
              <h2 className="font-bold text-base text-on-surface pb-3 border-b border-surface-container">
                Trạng thái hộp thư
              </h2>
              <div className="flex justify-between items-center bg-[#f8faf1] p-4 rounded-xl border border-surface-muted/60">
                <div>
                  <span className="text-xl font-black text-primary block leading-none">{unreadCount}</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase mt-1 block">Tin nhắn chưa đọc</span>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => {
                      onMarkAllRead();
                      alert('Đã đánh dấu toàn bộ thông báo đã đọc!');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#e5ffdc] hover:bg-primary hover:text-white rounded-lg text-xs font-black text-primary transition-all cursor-pointer border border-primary/20 shadow-sm"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Đọc tất cả</span>
                  </button>
                )}
              </div>
            </div>

            {/* Email notice widget */}
            <div className="bg-gradient-to-br from-primary-container to-[#235824] p-5 rounded-xl text-white shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5">
                <Mail className="w-4.5 h-4.5 text-[#c0ef7c]" />
                <span>Nhận thông báo tức thì</span>
              </h3>
              <p className="text-xs text-[#e5ffdc]/70 leading-relaxed font-medium">
                Kích hoạt chế độ đẩy thông báo khẩn qua thư điện tử sinh viên để không bỏ lỡ các kỳ nộp báo cáo bài thu hoạch từ hội đồng khoa.
              </p>
              <button 
                onClick={() => alert('Đã kích hoạt chế độ đồng bộ thông báo qua email của bạn!')}
                className="w-full mt-4 py-2 bg-white hover:bg-[#e5ffdc] text-primary hover:text-primary-container font-black text-xs uppercase rounded-lg shadow-sm transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Đăng ký nhận email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
