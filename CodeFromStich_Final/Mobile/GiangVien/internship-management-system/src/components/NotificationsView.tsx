/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Paperclip, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  Megaphone, 
  CheckCircle2, 
  Trash2,
  BellRing
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsRead, 
    setScreen 
  } = useApp();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Filter list
  const filteredNotifs = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.isUnread;
  });

  // Render appropriate icons
  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-5 h-5 text-primary" />;
      case 'schedule':
        return <Calendar className="w-5 h-5 text-primary" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-error" />;
      case 'campaign':
        return <Megaphone className="w-5 h-5 text-primary" />;
      case 'fact_check':
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      default:
        return <BellRing className="w-5 h-5 text-primary" />;
    }
  };

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    
    // Custom redirect behavior to hook up screens perfectly
    if (notif.id === 'notif-1') {
      setScreen('evaluation', '2110432'); // Nguyễn Văn A
    } else if (notif.id === 'notif-3') {
      setScreen('guided');
    } else if (notif.id === 'notif-5') {
      setScreen('grades');
    }
  };

  return (
    <div className="flex flex-col w-full h-full text-on-surface">
      {/* Segmented Controller Filter inside layout header */}
      <div className="flex justify-between items-center bg-surface-container-low p-1.5 rounded-xl border border-surface-muted/40 mb-4 shadow-sm">
        <button 
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg font-label-md text-label-md text-center transition-all ${
            filter === 'all' 
              ? 'bg-primary text-on-primary shadow-sm font-bold' 
              : 'text-on-surface-variant hover:bg-surface-variant'
          }`}
        >
          Tất cả
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`flex-1 py-1.5 rounded-lg font-label-md text-label-md text-center transition-all ${
            filter === 'unread' 
              ? 'bg-primary text-on-primary shadow-sm font-bold' 
              : 'text-on-surface-variant hover:bg-surface-variant'
          }`}
        >
          Chưa đọc
        </button>
      </div>

      {/* Clear/Mark all read shortcut button */}
      <div className="flex justify-end mb-2">
        <button 
          onClick={markAllNotificationsRead}
          className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          Đánh dấu đã đọc tất cả
        </button>
      </div>

      {/* Main notifications list */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-muted/30 divide-y divide-surface-muted/30 overflow-hidden shadow-sm">
        {filteredNotifs.map(notif => {
          const isWarning = notif.type === 'warning';

          return (
            <div 
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className="relative flex p-4 bg-surface-container-lowest hover:bg-surface-container-low/40 transition-colors cursor-pointer group min-h-[72px]"
            >
              {/* Unread dot indicator */}
              {notif.isUnread && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-warning-yellow ml-2 shadow-sm animate-pulse"></div>
              )}

              {/* Icon Container */}
              <div className="flex-shrink-0 mr-4 ml-2.5 pt-0.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                  isWarning ? 'bg-error-container' : 'bg-surface-container-low'
                }`}>
                  {getIcon(notif.type)}
                </div>
              </div>

              {/* Notification contents */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h2 className={`font-headline-sm text-[15px] text-text-slate truncate pr-2 ${notif.isUnread ? 'font-bold' : 'font-semibold'}`}>
                    {notif.title}
                  </h2>
                  <span className="flex-shrink-0 text-[11px] text-on-surface-variant font-medium font-label-md">
                    {notif.time}
                  </span>
                </div>
                <p className="font-body-md text-on-surface-variant text-sm line-clamp-2 leading-relaxed">
                  {notif.body}
                </p>

                {/* Optional attachment badge */}
                {notif.attachment && (
                  <div className="inline-flex items-center space-x-1 bg-surface border border-outline-variant/40 rounded-md px-2 py-1 shadow-sm mt-2 transition-all group-hover:border-primary-container/40">
                    <Paperclip className="w-3.5 h-3.5 text-outline" />
                    <span className="font-label-md text-[11px] text-on-surface-variant truncate max-w-[150px] font-bold">
                      {notif.attachment}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredNotifs.length === 0 && (
          <div className="p-12 text-center text-outline-variant flex flex-col items-center justify-center gap-2 bg-surface-container-low/20">
            <BellRing className="w-12 h-12 text-outline-variant/50 stroke-1" />
            <p className="text-sm font-semibold">Không có thông báo nào.</p>
          </div>
        )}
      </div>

      {/* End of Feed State */}
      <div className="py-8 text-center flex flex-col items-center justify-center text-outline-variant select-none">
        <CheckCircle2 className="w-10 h-10 mb-2 opacity-50 text-secondary" />
        <p className="font-body-md text-xs font-semibold text-on-surface-variant/70">Bạn đã xem hết thông báo.</p>
      </div>
    </div>
  );
};
