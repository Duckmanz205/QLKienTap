import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeView: string;
  onViewChange: (view: string) => void;
  unreadCount: number;
}

export default function Sidebar({ role, activeView, onViewChange, unreadCount }: SidebarProps) {
  const isLecturer = role === 'lecturer';

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-primary-container z-50 flex flex-col shadow-lg select-none text-white">
      {/* Brand logo */}
      <div className="h-[64px] flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-container text-[22px] font-bold">school</span>
          </div>
          <span className="font-bold text-lg tracking-tight">
            {isLecturer ? 'Quản lý Kiến tập' : 'IMS Portal'}
          </span>
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLecturer ? (
          <>
            <div className="space-y-1">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'dashboard'
                    ? 'bg-white text-[#266528] font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                Trang chủ
              </button>
            </div>

            <div className="space-y-1">
              <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white/50">Dẫn đoàn</div>
              <button
                onClick={() => onViewChange('lich-dan-doan-lecturer')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'lich-dan-doan-lecturer'
                    ? 'bg-white text-[#266528] font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                Lịch dẫn đoàn
              </button>
              <button
                onClick={() => onViewChange('diem-danh-sinh-vien')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'diem-danh-sinh-vien'
                    ? 'bg-white text-[#266528] font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                Điểm danh sinh viên
              </button>
              <button
                onClick={() => onViewChange('diem-chuan-bi-diem-cong')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'diem-chuan-bi-diem-cong'
                    ? 'bg-white text-[#266528] font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">star_half</span>
                Điểm chuẩn bị &amp; cộng
              </button>
            </div>

            <div className="space-y-1">
              <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white/50">Hướng dẫn</div>
              <button
                onClick={() => onViewChange('sinh-vien-huong-dan')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'sinh-vien-huong-dan' || activeView === 'cham-bai-detail'
                    ? 'bg-white text-[#266528] font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                Sinh viên hướng dẫn
              </button>
            </div>

            <div className="space-y-1">
              <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white/50">Hội đồng</div>
              <button
                onClick={() => onViewChange('buoi-bao-cao-tqnm')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'buoi-bao-cao-tqnm'
                    ? 'bg-white text-[#266528] font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">co_present</span>
                Buổi báo cáo TQNM
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white/50">Trang Chủ</div>
              <button
                onClick={() => onViewChange('student-dashboard')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'student-dashboard'
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                Trang chủ
              </button>
            </div>

            <div className="space-y-1">
              <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white/50">Kiến Tập Của Tôi</div>
              <button
                onClick={() => onViewChange('chuyen-tham-quan')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'chuyen-tham-quan'
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">explore</span>
                Chuyến tham quan
              </button>
              <button
                onClick={() => onViewChange('lich-trinh-doan')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'lich-trinh-doan'
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">event_note</span>
                Lịch trình đoàn
              </button>
              <button
                onClick={() => onViewChange('nop-bai-thu-hoach')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'nop-bai-thu-hoach'
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                Nộp bài thu hoạch
              </button>
              <button
                onClick={() => onViewChange('ket-qua-diem')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'ket-qua-diem'
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">grading</span>
                Kết quả &amp; điểm
              </button>
            </div>

            <div className="space-y-1">
              <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white/50">Tài Chính</div>
              <button
                onClick={() => onViewChange('thanh-toan')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'thanh-toan'
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">payments</span>
                Thanh toán
              </button>
              <button
                onClick={() => onViewChange('hoan-phi')}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 ${
                  activeView === 'hoan-phi'
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">place_item</span>
                Hoàn phí
              </button>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-white/10 mt-4 space-y-1">
          <button
            onClick={() => onViewChange('thong-bao')}
            className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all gap-3 relative ${
              activeView === 'thong-bao'
                ? isLecturer
                  ? 'bg-white text-[#266528] font-bold shadow-md'
                  : 'bg-secondary-container text-on-secondary-container font-bold shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            Thông báo
            {unreadCount > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-warning-yellow rounded-full shadow-sm"></span>
            )}
          </button>
        </div>
      </nav>

      {/* Logout at bottom */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <button
          onClick={() => alert('Bạn đã đăng xuất khỏi hệ thống.')}
          className="w-full flex items-center px-4 py-3 text-white/80 hover:bg-[#E68A8C]/20 hover:text-[#E68A8C] transition-all gap-3 rounded-lg text-sm font-medium"
        >
          <span className="material-symbols-outlined">logout</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
