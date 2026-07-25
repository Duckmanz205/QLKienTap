import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { Menu, Bell, Smartphone, Monitor, ChevronRight, LayoutGrid, CheckCircle2, RefreshCw } from 'lucide-react';

interface MobileFrameProps {
  profile: StudentProfile;
  unreadNotifCount: number;
  currentScreen: string;
  onNavigate: (screen: string, params?: any) => void;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  profile,
  unreadNotifCount,
  currentScreen,
  onNavigate,
  children
}) => {
  const [deviceTime, setDeviceTime] = useState('08:00');

  // Dynamic time simulator matching Vietnam timezone format
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strHours = hours < 10 ? `0${hours}` : `${hours}`;
      const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setDeviceTime(`${strHours}:${strMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Screen descriptions for the desk controller
  const SCREENS_LIST = [
    { id: 'dashboard', label: 'Screen H: Trang chủ / Dashboard', desc: 'Bento stats, upcoming list & alerts' },
    { id: 'trips', label: 'Screen F: Chuyến tham quan / List', desc: 'Tabs for available vs. registered' },
    { id: 'trip-detail', label: 'Screen A: Chi tiết chuyến / Detail', desc: 'Banner, criteria & register action', params: { tripId: 'vinamilk-hiep-phuoc' } },
    { id: 'timeline', label: 'Screen G: Lịch trình đoàn / Timeline', desc: 'Trip selection, lecturer info & group' },
    { id: 'submit', label: 'Screen E: Nộp bài thu hoạch / Submit', desc: 'Pending uploads & report checklist' },
    { id: 'results', label: 'Screen B: Kết quả & điểm / Scores', desc: '8.4 GPA summary & complete report cards' },
    { id: 'finance', label: 'Screen D: Thanh toán & Hoàn phí', desc: 'Invoices copy, mock payment, refund form' },
    { id: 'notifications', label: 'Screen C: Danh sách thông báo / Alert', desc: 'Read/unread filter, PDF attachments' }
  ];

  return (
    <div className="min-h-screen bg-[#E7E0C4]/40 flex flex-col lg:flex-row items-center justify-center p-0 lg:p-8 font-sans">
      
      {/* LEFT PANEL: Professional Desk Controller (Only shown on Desktop) */}
      <aside className="hidden lg:flex flex-col w-[350px] bg-white border border-slate-200 shadow-sm rounded-3xl p-6 mr-10 h-[720px] justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <LayoutGrid className="text-[#266528]" size={24} />
            <div>
              <h1 className="font-extrabold text-[#266528] text-base leading-none">InternFlow</h1>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">HỆ THỐNG KIẾN TẬP & THỰC TẬP</p>
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-xs font-bold text-slate-400 mb-2.5 uppercase tracking-wider">Bộ chọn màn hình nhanh</p>
            <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
              {SCREENS_LIST.map((scr) => {
                const isActive = currentScreen === scr.id || 
                  (scr.id === 'finance' && currentScreen === 'results'); // results houses both tabs

                return (
                  <button
                    key={scr.id}
                    onClick={() => {
                      if (scr.id === 'finance') {
                        onNavigate('results');
                        // Force change inside results via localStorage or active sub-tab
                        setTimeout(() => {
                          const tabBtn = document.querySelector('button[id="finance-tab"]');
                          if (tabBtn) (tabBtn as HTMLButtonElement).click();
                        }, 50);
                      } else {
                        onNavigate(scr.id, scr.params);
                      }
                    }}
                    className={`flex flex-col items-start text-left p-3 rounded-xl border text-xs transition-all duration-150 ${
                      isActive 
                        ? 'bg-[#266528]/10 border-[#266528] shadow-xs' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className={`font-bold ${isActive ? 'text-[#266528]' : 'text-slate-700'}`}>{scr.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{scr.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Informational Footer */}
        <div className="bg-[#f8faf1] border border-[#aef4a5]/40 rounded-2xl p-4 flex flex-col gap-1.5 mt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giao diện tương tác</p>
          <p className="text-xs text-slate-600 leading-normal">
            Nhấp trực tiếp vào các nút bấm, ô nhập tệp, tab nộp bài và các thẻ thông tin trên mock-phone bên phải để trải nghiệm tương tác học phần thời gian thực.
          </p>
        </div>
      </aside>

      {/* CENTRAL / RIGHT AREA: Simulated Smartphone Frame (Full viewport on Mobile) */}
      <div className="relative">
        
        {/* Decorative elements of the desk (Only on desktop) */}
        <div className="hidden lg:block absolute -inset-4 bg-slate-800/10 rounded-[48px] blur-xl -z-10"></div>
        
        {/* SMARTPHONE DEVICE WRAPPER */}
        <div className="w-full max-w-[390px] min-h-screen lg:min-h-[760px] lg:h-[760px] bg-[#f8faf1] flex flex-col relative overflow-hidden lg:rounded-[36px] lg:shadow-2xl border-0 lg:border-[10px] lg:border-slate-800">
          
          {/* Mock Camera Notch + Status Bar (Only shown on Desktop mock wrapper) */}
          <div className="bg-white px-5 pt-2 pb-1 flex items-center justify-between shrink-0 select-none z-50">
            {/* Clock */}
            <span className="text-[11px] font-bold text-slate-800 tracking-tight leading-none">
              {deviceTime}
            </span>
            
            {/* Speaker Notch */}
            <div className="hidden lg:block w-20 h-4 bg-slate-800 rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 shadow-inner"></div>
            
            {/* Icons */}
            <div className="flex items-center gap-1">
              {/* Cellular */}
              <div className="flex items-end gap-0.5 h-2.5">
                <span className="w-[2px] h-[3px] bg-slate-800 rounded-xs"></span>
                <span className="w-[2px] h-[5px] bg-slate-800 rounded-xs"></span>
                <span className="w-[2px] h-[7px] bg-slate-800 rounded-xs"></span>
                <span className="w-[2px] h-[9px] bg-slate-800 rounded-xs"></span>
              </div>
              {/* Wi-Fi symbol representation */}
              <span className="w-3.5 h-2.5 flex items-center justify-center text-slate-800 shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.384 6.115a.485.485 0 0 0-.047-.736A12.444 12.444 0 0 0 8 3 12.44 12.44 0 0 0 .663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164a.517.517 0 0 0 .668-.049z"/>
                  <path d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.577 1.336c.205.132.48.108.652-.065zm-2.183 2.183c.226-.208.204-.572-.047-.736A7.444 7.444 0 0 0 8 8a7.443 7.443 0 0 0-2.999 1.718c-.25.164-.273.528-.047.736.19.176.482.16.657-.035A6.444 6.444 0 0 1 8 9a6.443 6.443 0 0 1 2.39 1.22c.174.194.467.21.656.034z"/>
                </svg>
              </span>
              {/* Battery */}
              <div className="w-5 h-2.5 border border-slate-700 rounded-sm p-[1px] flex items-center shrink-0">
                <div className="w-full h-full bg-slate-800 rounded-[1px]"></div>
              </div>
            </div>
          </div>

          {/* APP BODY CONTAINER (Main navigation bar is embedded here inside the scroll container) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24">
            {children}
          </div>

        </div>
      </div>
      
    </div>
  );
};
