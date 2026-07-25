import React, { useState } from 'react';
import { Bell, User, ChevronDown, Landmark, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  title: string;
}

export default function Header({ currentRole, onRoleChange, title }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleLabelColor = (role: UserRole) => {
    switch (role) {
      case 'Quản lý khoa':
        return 'bg-[#E7E0C4] text-[#41493e] border border-[#c0c9bb]';
      case 'Giảng viên':
        return 'bg-secondary-container-green text-on-secondary-container-green border border-secondary';
      case 'Sinh viên':
        return 'bg-[#e5ffdc] text-[#266528] border border-[#aef4a5]';
    }
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'Quản lý khoa':
        return 'Nguyễn Văn A';
      case 'Giảng viên':
        return 'Lê Minh Tuấn';
      case 'Sinh viên':
        return 'Phạm Thị Hoa';
    }
  };

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-white border-b border-surface-muted z-40 flex items-center justify-between px-6 shadow-[0_1px_8px_rgba(0,0,0,0.03)] select-none">
      {/* View Title */}
      <div className="flex items-center gap-3">
        <Landmark className="w-5 h-5 text-primary-container" />
        <span className="font-bold text-slate text-base tracking-tight">{title}</span>
      </div>

      {/* Header Utilities */}
      <div className="flex items-center gap-6">
        {/* Interactive Simulation Notice */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-amber-800 rounded-full text-xs font-semibold animate-pulse border border-amber-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Môi trường thử nghiệm đầy đủ tính năng</span>
        </div>

        {/* Notifications */}
        <div className="relative p-2 hover:bg-slate-100 rounded-full cursor-pointer transition-colors group">
          <Bell className="w-5 h-5 text-slate-600 group-hover:text-[#407F3E]" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#DBD468] rounded-full border-2 border-white animate-bounce"></span>
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

        {/* Role Selector & Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-2 pr-1 py-1.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {getRoleName(currentRole)}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 inline-block ${getRoleLabelColor(currentRole)}`}>
                {currentRole}
              </p>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-[#407F3E] flex items-center justify-center border-2 border-[#aef4a5] text-white shadow-sm font-bold">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Role Changer Dropdown */}
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-20 origin-top-right transition-all">
                <div className="px-4 py-2 border-b border-slate-100 mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đổi vai trò hệ thống</p>
                  <p className="text-xs text-slate-500">Giúp xem các màn hình khác nhau</p>
                </div>
                
                <button
                  onClick={() => {
                    onRoleChange('Quản lý khoa');
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex flex-col ${
                    currentRole === 'Quản lý khoa' ? 'bg-[#407F3E]/5 border-l-4 border-[#407F3E]' : ''
                  }`}
                >
                  <span className="text-sm font-bold text-slate-800">Quản lý khoa (Nguyễn Văn A)</span>
                  <span className="text-xs text-slate-400">Xem toàn bộ báo cáo, người dùng, hoàn phí</span>
                </button>

                <button
                  onClick={() => {
                    onRoleChange('Giảng viên');
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex flex-col ${
                    currentRole === 'Giảng viên' ? 'bg-[#407F3E]/5 border-l-4 border-[#407F3E]' : ''
                  }`}
                >
                  <span className="text-sm font-bold text-slate-800">Giảng viên (Lê Minh Tuấn)</span>
                  <span className="text-xs text-slate-400">Xem hội đồng báo cáo, kết quả kiến tập</span>
                </button>

                <button
                  onClick={() => {
                    onRoleChange('Sinh viên');
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex flex-col ${
                    currentRole === 'Sinh viên' ? 'bg-[#407F3E]/5 border-l-4 border-[#407F3E]' : ''
                  }`}
                >
                  <span className="text-sm font-bold text-slate-800">Sinh viên (Phạm Thị Hoa)</span>
                  <span className="text-xs text-slate-400">Xem kết quả cá nhân, lệ phí cá nhân</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
