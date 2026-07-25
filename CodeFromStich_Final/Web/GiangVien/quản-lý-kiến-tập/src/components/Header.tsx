import React, { useState } from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  unreadCount: number;
  onViewChange: (view: string) => void;
  title?: string;
}

export default function Header({ role, onRoleChange, unreadCount, onViewChange, title = 'Quản lý Kiến tập' }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isLecturer = role === 'lecturer';

  const handleRoleToggle = () => {
    const newRole = isLecturer ? 'student' : 'lecturer';
    onRoleChange(newRole);
    onViewChange(newRole === 'lecturer' ? 'dashboard' : 'student-dashboard');
    setDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-[260px] right-0 h-[64px] bg-white border-b border-[#E7E0C4] z-40 px-6 flex items-center justify-between shadow-sm">
      <h1 className="text-xl font-bold text-primary select-none">{title}</h1>

      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div 
          onClick={() => onViewChange('thong-bao')}
          className="relative group cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[24px]">notifications</span>
          {unreadCount > 0 && (
            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-warning-yellow border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-on-surface">
              {unreadCount}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-8 w-[1px] bg-slate-200"></div>

        {/* User Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-1.5 rounded-lg transition-colors select-none"
          >
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm text-on-surface leading-none mb-1">Nguyễn Văn A</p>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                isLecturer 
                  ? 'bg-surface-muted text-on-surface-variant' 
                  : 'bg-secondary-container text-on-secondary-container'
              }`}>
                {isLecturer ? 'Giảng viên' : 'Sinh viên'}
              </span>
            </div>

            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm border-2 border-surface-container">
              <span className="material-symbols-outlined text-white text-[22px]">person</span>
            </div>
            
            <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-150 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-on-surface text-sm">Nguyễn Văn A</p>
                <p className="text-xs text-on-surface-variant">khangvaphuc2005@gmail.com</p>
              </div>
              <div className="p-2 border-b border-slate-100">
                <button
                  onClick={handleRoleToggle}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-primary hover:bg-primary/5 transition-colors flex items-center gap-2 font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">cached</span>
                  Chuyển sang vai trò: <strong className="underline">{isLecturer ? 'Sinh viên' : 'Giảng viên'}</strong>
                </button>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setDropdownOpen(false); alert('Tính năng hồ sơ cá nhân đang phát triển.'); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">account_circle</span>
                  Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); alert('Bạn đã đăng xuất.'); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
