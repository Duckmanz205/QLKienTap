/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp, ScreenType } from './context/AppContext';
import { HomeView } from './components/HomeView';
import { TourScheduleView } from './components/TourScheduleView';
import { AttendanceView } from './components/AttendanceView';
import { GradesView } from './components/GradesView';
import { GuidedStudentsView } from './components/GuidedStudentsView';
import { NotificationsView } from './components/NotificationsView';
import { EvaluationView } from './components/EvaluationView';
import { CouncilView } from './components/CouncilView';
import { AVATARS } from './types';
import { 
  Menu, 
  Bell, 
  Home, 
  Bus, 
  CheckSquare, 
  Award, 
  MoreHorizontal, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Smartphone, 
  BookOpen,
  UserCheck,
  Award as CouncilIcon,
  ShieldAlert,
  X
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeScreen, 
    setScreen, 
    selectedStudentId, 
    unreadNotificationsCount, 
    resetToDefault 
  } = useApp();

  // "Thêm" (More) options panel state
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Map screen key to visual VN headers
  const getHeaderTitle = () => {
    switch (activeScreen) {
      case 'home': return 'Trang Chủ';
      case 'schedule': return 'Lịch dẫn';
      case 'attendance': return 'Điểm danh';
      case 'grades': return 'Điểm số';
      case 'guided': return 'Sinh viên hướng dẫn';
      case 'notifications': return 'Thông báo';
      case 'evaluation': return 'Chấm bài';
      case 'council': return 'Hội đồng';
      default: return 'Trang Chủ';
    }
  };

  // Render active mobile view inside the simulator
  const renderActiveView = () => {
    switch (activeScreen) {
      case 'home': return <HomeView />;
      case 'schedule': return <TourScheduleView />;
      case 'attendance': return <AttendanceView />;
      case 'grades': return <GradesView />;
      case 'guided': return <GuidedStudentsView />;
      case 'notifications': return <NotificationsView />;
      case 'evaluation': return <EvaluationView />;
      case 'council': return <CouncilView />;
      default: return <HomeView />;
    }
  };

  // Handles header back button behavior
  const handleBackClick = () => {
    if (activeScreen === 'evaluation') {
      setScreen('guided');
    } else {
      setScreen('home');
    }
  };

  // True if active view is a nested/detail view that should show back button
  const isDetailView = ['guided', 'notifications', 'evaluation', 'council'].includes(activeScreen);

  return (
    <div className="min-h-screen bg-surface-muted font-sans flex flex-col lg:flex-row">
      
      {/* ==========================================================
          LEFT COLUMN: Developer Control Panel & App Dashboard (Desktop)
          ========================================================== */}
      <aside className="w-full lg:w-[360px] bg-[#1d271f] text-zinc-100 p-6 flex flex-col justify-between shrink-0 border-r border-zinc-800">
        <div className="flex flex-col gap-6">
          {/* Logo Brand Header */}
          <div className="border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2 text-primary-fixed">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <h1 className="font-headline-md text-lg font-bold tracking-tight">IMS Internship</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Khoa Công nghệ Thực phẩm (CNTP)</p>
          </div>

          {/* Quick Switch / Screen Override Deck */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-fixed mb-3 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-secondary-fixed" />
              CHỌN NHANH MÀN HÌNH (8 SCREENS)
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">Click bất kỳ nút nào dưới đây để xem trực tiếp giao diện thiết kế:</p>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => { setScreen('home'); setShowMoreMenu(false); }}
                className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                  activeScreen === 'home' 
                    ? 'bg-primary text-white font-bold' 
                    : 'bg-zinc-800/65 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                1. Trang chủ
              </button>
              <button 
                onClick={() => { setScreen('schedule'); setShowMoreMenu(false); }}
                className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                  activeScreen === 'schedule' 
                    ? 'bg-primary text-white font-bold' 
                    : 'bg-zinc-800/65 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                2. Lịch dẫn
              </button>
              <button 
                onClick={() => { setScreen('attendance'); setShowMoreMenu(false); }}
                className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                  activeScreen === 'attendance' 
                    ? 'bg-primary text-white font-bold' 
                    : 'bg-zinc-800/65 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                3. Điểm danh
              </button>
              <button 
                onClick={() => { setScreen('grades'); setShowMoreMenu(false); }}
                className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                  activeScreen === 'grades' 
                    ? 'bg-primary text-white font-bold' 
                    : 'bg-zinc-800/65 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                4. Điểm số
              </button>
              <button 
                onClick={() => { setScreen('guided'); setShowMoreMenu(false); }}
                className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                  activeScreen === 'guided' 
                    ? 'bg-primary text-white font-bold' 
                    : 'bg-zinc-800/65 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                5. SV hướng dẫn
              </button>
              <button 
                onClick={() => { setScreen('notifications'); setShowMoreMenu(false); }}
                className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                  activeScreen === 'notifications' 
                    ? 'bg-primary text-white font-bold' 
                    : 'bg-zinc-800/65 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                6. Thông báo
              </button>
              <button 
                onClick={() => { setScreen('evaluation', '2110432'); setShowMoreMenu(false); }}
                className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                  activeScreen === 'evaluation' 
                    ? 'bg-primary text-white font-bold' 
                    : 'bg-zinc-800/65 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                7. Chấm bài thu hoạch
              </button>
              <button 
                onClick={() => { setScreen('council'); setShowMoreMenu(false); }}
                className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                  activeScreen === 'council' 
                    ? 'bg-primary text-white font-bold' 
                    : 'bg-zinc-800/65 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                8. Hội đồng chấm
              </button>
            </div>
          </div>

          {/* Interactive Feature Manual */}
          <div className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-2">
            <p className="font-bold text-primary-fixed mb-1 uppercase tracking-wide text-[10px]">Tính năng tương tác:</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-400">
              <li><strong>Liên kết luồng:</strong> Bấm "Chấm ngay" ở Trang chủ để vào chấm bài; Bấm "Xem chi tiết" Vinamilk ở Lịch dẫn để vào Điểm danh.</li>
              <li><strong>Điểm danh:</strong> Tắt/Bật Có mặt, Vắng, Phép. Điều chỉnh lý do phép trực tiếp.</li>
              <li><strong>Thêm Menu:</strong> Tab "Thêm" mở ra panel lối tắt mượt mà.</li>
              <li><strong>Chấm điểm:</strong> Điểm cộng stepper (+0.5) chặn kịch trần; Nút lưu điểm có 3 trạng thái.</li>
            </ul>
          </div>
        </div>

        {/* State Restorer Bottom Deck */}
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <button 
            onClick={resetToDefault}
            className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-bold rounded-lg flex items-center justify-center gap-2 border border-zinc-700/50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Khôi phục dữ liệu gốc
          </button>
        </div>
      </aside>

      {/* ==========================================================
          RIGHT COLUMN: Centered Mobile Device Simulator / Workspace
          ========================================================== */}
      <main className="flex-1 flex items-center justify-center py-4 lg:py-8 px-4">
        
        {/* Immersive Mobile Chassis Frame Container */}
        <div className="w-full max-w-[420px] h-[860px] bg-white lg:rounded-[42px] lg:border-[10px] lg:border-zinc-800 lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col">
          
          {/* Simulated Mobile Camera Notch & Status Bar (Hidden on native mobile views) */}
          <div className="hidden lg:flex justify-between items-center bg-surface-container-lowest text-zinc-900 px-6 pt-3 pb-1 select-none text-xs font-semibold tracking-tight border-b border-surface-muted/10 shrink-0">
            <span>09:41 AM</span>
            <div className="w-24 h-5 bg-zinc-800 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-zinc-800 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-zinc-800 rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* SIMULATED APPBAR / TOPHEADER */}
          <header className="bg-surface-container-lowest border-b border-surface-muted h-[64px] px-4 flex justify-between items-center shrink-0 shadow-sm z-35">
            {/* Left Control (Back vs Menu) */}
            <div className="flex items-center gap-2">
              {isDetailView ? (
                <button 
                  onClick={handleBackClick}
                  aria-label="Back" 
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container text-primary cursor-pointer active:scale-90 transition-transform"
                >
                  <ArrowLeft className="w-5 h-5 font-bold" />
                </button>
              ) : (
                <button 
                  onClick={() => alert("Hệ thống IMS Internship - Đại học CNTP")}
                  aria-label="Menu" 
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant cursor-pointer active:scale-95"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <h1 className="font-headline-sm text-[18px] text-primary font-bold tracking-tight">
                {getHeaderTitle()}
              </h1>
            </div>

            {/* Right Control (Bell notifications + Avatar) */}
            <div className="flex items-center gap-1">
              {/* Notification bell trigger */}
              <button 
                onClick={() => setScreen('notifications')}
                className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant cursor-pointer active:scale-90 transition-transform"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-error text-white text-[8px] font-extrabold flex items-center justify-center rounded-full ring-2 ring-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Dynamic user profile avatar clicker */}
              <div 
                onClick={() => setScreen('guided')}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-fixed bg-cover bg-center shadow-sm cursor-pointer ml-1 active:scale-90 transition-transform"
                style={{ backgroundImage: `url('${AVATARS.lecturer}')` }}
                title="Giảng viên"
              ></div>
            </div>
          </header>

          {/* MAIN SIMULATED CANVAS/VIEWPORT */}
          <main className="flex-1 overflow-y-auto bg-surface p-4 hide-scrollbar relative">
            <div className="animate-fadeIn">
              {renderActiveView()}
            </div>
          </main>

          {/* IMMERSIVE FIXED BOTTOM NAVIGATION BAR */}
          <nav className="bg-surface-container-lowest border-t border-surface-muted h-[72px] px-2 flex justify-around items-center shrink-0 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
            <button 
              onClick={() => { setScreen('home'); setShowMoreMenu(false); }}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all cursor-pointer ${
                activeScreen === 'home' 
                  ? 'text-primary font-extrabold scale-105' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Home className={`w-5 h-5 ${activeScreen === 'home' ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-bold mt-1 tracking-tight">Trang chủ</span>
            </button>

            <button 
              onClick={() => { setScreen('schedule'); setShowMoreMenu(false); }}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all cursor-pointer ${
                activeScreen === 'schedule' 
                  ? 'text-primary font-extrabold scale-105' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Bus className={`w-5 h-5 ${activeScreen === 'schedule' ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-bold mt-1 tracking-tight">Lịch dẫn</span>
            </button>

            <button 
              onClick={() => { setScreen('attendance'); setShowMoreMenu(false); }}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all cursor-pointer ${
                activeScreen === 'attendance' 
                  ? 'text-primary font-extrabold scale-105' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <CheckSquare className={`w-5 h-5 ${activeScreen === 'attendance' ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-bold mt-1 tracking-tight">Điểm danh</span>
            </button>

            <button 
              onClick={() => { setScreen('grades'); setShowMoreMenu(false); }}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all cursor-pointer ${
                activeScreen === 'grades' 
                  ? 'text-primary font-extrabold scale-105' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Award className={`w-5 h-5 ${activeScreen === 'grades' ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-bold mt-1 tracking-tight">Điểm số</span>
            </button>

            <button 
              onClick={() => setShowMoreMenu(prev => !prev)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all cursor-pointer ${
                showMoreMenu 
                  ? 'text-primary font-extrabold scale-105 bg-surface-container-low/50' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <MoreHorizontal className="w-5 h-5 font-bold" />
              <span className="text-[10px] font-bold mt-1 tracking-tight">Thêm</span>
            </button>
          </nav>

          {/* GORGEOUS NATIVE-STYLE MORE SHORTCUT OPTIONS PANEL PANEL */}
          {showMoreMenu && (
            <div className="absolute bottom-[72px] inset-x-0 bg-surface-container-lowest border-t border-surface-muted/80 z-50 p-5 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] animate-fadeIn">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Danh mục lối tắt phụ</span>
                <button 
                  onClick={() => setShowMoreMenu(false)}
                  className="p-1 hover:bg-surface-container rounded-full"
                >
                  <X className="w-5 h-5 text-outline" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                {/* Option 1: Sinh viên hướng dẫn */}
                <div 
                  onClick={() => { setScreen('guided'); setShowMoreMenu(false); }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center mb-1">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-on-surface">SV hướng dẫn</span>
                </div>

                {/* Option 2: Hội đồng chấm */}
                <div 
                  onClick={() => { setScreen('council'); setShowMoreMenu(false); }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center mb-1">
                    <CouncilIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-on-surface">Hội đồng</span>
                </div>

                {/* Option 3: Thông báo */}
                <div 
                  onClick={() => { setScreen('notifications'); setShowMoreMenu(false); }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-[#DBD468]/20 text-[#DBD468] flex items-center justify-center mb-1 relative">
                    <Bell className="w-5 h-5 text-text-slate" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full ring-1 ring-white"></span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-on-surface">Thông báo</span>
                </div>
              </div>
            </div>
          )}

          {/* Phone Bottom Home-Indicator bar (For desktop chassis only) */}
          <div className="hidden lg:block h-5 bg-surface-container-lowest w-full text-center select-none shrink-0 border-t border-surface-muted/10">
            <div className="w-32 h-1 bg-zinc-300 rounded-full mx-auto my-2"></div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
