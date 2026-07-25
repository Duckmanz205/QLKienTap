import React from 'react';
import { 
  Home, 
  Grid, 
  Users, 
  Calendar, 
  FileCheck, 
  Gavel, 
  CreditCard, 
  RotateCcw, 
  Bell, 
  BarChart3, 
  LogOut, 
  GraduationCap
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  userRole: UserRole;
  unreadCount: number;
  onLogout: () => void;
}

export default function Sidebar({ currentView, setView, userRole, unreadCount, onLogout }: SidebarProps) {
  // Navigation structure based on screenshots
  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-primary-container text-white z-50 flex flex-col shadow-xl select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-primary-container shadow-inner">
          <GraduationCap className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight">Quản lý Kiến tập</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {/* Trang chủ */}
        <button
          onClick={() => setView('trang-chu')}
          className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all gap-3 text-left ${
            currentView === 'trang-chu'
              ? 'bg-white text-[#407F3E] font-bold shadow-md'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium">Trang chủ</span>
        </button>

        {/* SYSTEM CATALOGUE */}
        <div className="pt-4 pb-1 px-4 text-white/50 text-[11px] font-bold tracking-wider uppercase">
          Danh mục hệ thống
        </div>
        
        <button
          onClick={() => setView('tai-khoan')}
          className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all gap-3 text-left ${
            currentView === 'tai-khoan'
              ? 'bg-white text-[#407F3E] font-bold shadow-md'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">Tài khoản người dùng</span>
        </button>

        <button
          onClick={() => setView('sinh-vien')}
          className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all gap-3 text-left ${
            currentView === 'sinh-vien'
              ? 'bg-white text-[#407F3E] font-bold shadow-md'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-sm font-medium">Danh mục nền</span>
        </button>

        {/* INTERNSHIP PLAN */}
        <div className="pt-4 pb-1 px-4 text-white/50 text-[11px] font-bold tracking-wider uppercase">
          Kế hoạch kiến tập
        </div>
        
        <button
          onClick={() => setView('ket-qua-kien-tap')}
          className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all gap-3 text-left ${
            currentView === 'ket-qua-kien-tap'
              ? 'bg-white text-[#407F3E] font-bold shadow-md'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <FileCheck className="w-5 h-5" />
          <span className="text-sm font-medium">Kết quả kiến tập</span>
        </button>

        {/* EVALUATION BOARDS */}
        <div className="pt-4 pb-1 px-4 text-white/50 text-[11px] font-bold tracking-wider uppercase">
          Hội đồng & Đánh giá
        </div>

        <button
          onClick={() => setView('hoi-dong-cham')}
          className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all gap-3 text-left ${
            currentView === 'hoi-dong-cham'
              ? 'bg-white text-[#407F3E] font-bold shadow-md'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Gavel className="w-5 h-5" />
          <span className="text-sm font-medium">Hội đồng bảo vệ</span>
        </button>

        {/* FINANCE */}
        <div className="pt-4 pb-1 px-4 text-white/50 text-[11px] font-bold tracking-wider uppercase">
          Tài chính & Lệ phí
        </div>

        <button
          onClick={() => setView('quan-ly-le-phi')}
          className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all gap-3 text-left ${
            currentView === 'quan-ly-le-phi'
              ? 'bg-white text-[#407F3E] font-bold shadow-md'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-sm font-medium">Quản lý lệ phí</span>
        </button>

        <button
          onClick={() => setView('duyet-hoan-phi')}
          className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all gap-3 text-left ${
            currentView === 'duyet-hoan-phi'
              ? 'bg-white text-[#407F3E] font-bold shadow-md'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-sm font-medium">Duyệt hoàn phí</span>
        </button>

        {/* MESSAGES & REPORTS */}
        <div className="pt-4 pb-1 border-t border-white/10 mt-4"></div>

        <button
          onClick={() => setView('thong-bao')}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-left ${
            currentView === 'thong-bao'
              ? 'bg-white text-[#407F3E] font-bold shadow-md'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">Thông báo</span>
          </div>
          {unreadCount > 0 && (
            <span className="bg-[#DBD468] text-[#191d17] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setView('bao-cao-thong-ke')}
          className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all gap-3 text-left ${
            currentView === 'bao-cao-thong-ke' || currentView === 'tong-hop-tham-quan'
              ? 'bg-white text-[#407F3E] font-bold shadow-md'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm font-medium">Báo cáo thống kê</span>
        </button>
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-white/75 hover:text-white hover:bg-red-500/10 rounded-lg transition-all text-left"
        >
          <LogOut className="w-5 h-5 text-red-300" />
          <span className="text-sm font-medium font-bold">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
