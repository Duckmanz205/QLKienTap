import React from 'react';
import { Bell, ChevronRight, User, Home } from 'lucide-react';

interface HeaderProps {
  activeViewLabel: string;
  setActiveView: (view: string) => void;
  unreadNotificationsCount: number;
}

export default function Header({ activeViewLabel, setActiveView, unreadNotificationsCount }: HeaderProps) {
  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-white border-b border-surface-muted/60 z-40 flex items-center justify-between px-6 shadow-sm">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
        <button 
          onClick={() => setActiveView('trang-chu')}
          className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>IMS Portal</span>
        </button>
        <ChevronRight className="w-3 h-3 text-outline/50" />
        <span className="text-on-surface font-semibold">{activeViewLabel}</span>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button 
          onClick={() => setActiveView('thong-bao')}
          className="relative p-2 text-on-surface-variant hover:bg-[#ecefe6] hover:text-primary rounded-full transition-all cursor-pointer"
          title="Thông báo"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
          )}
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3 bg-[#f2f5ec] pl-3 pr-1 py-1 rounded-full border border-surface-container-high hover:border-primary/20 transition-all cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface leading-tight">Nguyễn Văn A</p>
            <p className="text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase">Sinh viên</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
