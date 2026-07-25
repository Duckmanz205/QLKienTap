import React from 'react';
import { 
  Home, 
  Compass, 
  Calendar, 
  UploadCloud, 
  GraduationCap, 
  CreditCard, 
  RotateCcw, 
  Bell, 
  LogOut,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  unreadNotificationsCount: number;
}

export default function Sidebar({ activeView, setActiveView, unreadNotificationsCount }: SidebarProps) {
  const menuItems = [
    { id: 'trang-chu', label: 'Trang chủ', icon: Home, category: 'TRANG CHỦ' },
    { id: 'chuyen-tham-quan', label: 'Chuyến tham quan', icon: Compass, category: 'KIẾN TẬP CỦA TÔI' },
    { id: 'lich-trinh-doan', label: 'Lịch trình đoàn', icon: Calendar, category: 'KIẾN TẬP CỦA TÔI' },
    { id: 'nop-bai-thu-hoach', label: 'Nộp bài thu hoạch', icon: UploadCloud, category: 'KIẾN TẬP CỦA TÔI' },
    { id: 'ket-qua-diem', label: 'Kết quả & điểm', icon: GraduationCap, category: 'KIẾN TẬP CỦA TÔI' },
    { id: 'thanh-toan', label: 'Thanh toán', icon: CreditCard, category: 'TÀI CHÍNH' },
    { id: 'hoan-phi', label: 'Hoàn phí', icon: RotateCcw, category: 'TÀI CHÍNH' },
    { id: 'thong-bao', label: 'Thông báo', icon: Bell, category: 'THÔNG BÁO', badge: unreadNotificationsCount }
  ];

  const categories = ['TRANG CHỦ', 'KIẾN TẬP CỦA TÔI', 'TÀI CHÍNH', 'THÔNG BÁO'];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-primary-container text-white z-50 flex flex-col shadow-xl border-r border-[#2c6b2d]/10">
      {/* Brand Header */}
      <div className="p-6 flex flex-col gap-3 items-center border-b border-white/10 bg-[#2c6b2d]/15">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
          <BookOpen className="text-white w-6 h-6" />
        </div>
        <div className="text-center">
          <span className="font-bold text-[16px] leading-tight text-white uppercase tracking-wider block">
            Quản lý kiến tập
          </span>
          <span className="text-[11px] text-[#e5ffdc]/70 font-semibold tracking-widest block uppercase mt-0.5">
            Khoa CNTP
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {categories.map((cat) => {
          const items = menuItems.filter((item) => item.category === cat);
          return (
            <div key={cat} className="space-y-1">
              <p className="px-4 text-[10px] font-bold tracking-widest uppercase text-[#e5ffdc]/50 mb-2">
                {cat}
              </p>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#89B449] text-white shadow-md font-bold scale-[1.02]'
                        : 'text-[#e5ffdc]/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-[18px] h-[18px]" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-warning-yellow text-[#191d17] font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Information & Logout */}
      <div className="p-4 border-t border-white/10 bg-[#2c6b2d]/10 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-white/20">
            <span className="font-bold text-sm text-white">A</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-bold text-sm truncate">Nguyễn Văn A</span>
            <span className="text-[#e5ffdc]/60 text-xs">Sinh viên</span>
          </div>
        </div>
        <button 
          onClick={() => alert('Đăng xuất thành công! Bạn sẽ quay lại sau.')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all text-sm font-bold border border-red-500/20 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
