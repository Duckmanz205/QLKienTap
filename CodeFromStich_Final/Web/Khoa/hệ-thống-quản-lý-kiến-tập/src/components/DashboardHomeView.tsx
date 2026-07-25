import React from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  Bell, 
  ArrowRight, 
  Gavel, 
  Sparkles, 
  CheckCircle,
  Landmark,
  Compass
} from 'lucide-react';
import { CommitteeBoard, SystemAnnouncement } from '../types';

interface DashboardHomeViewProps {
  setView: (view: string) => void;
  boards: CommitteeBoard[];
  announcements: SystemAnnouncement[];
}

export default function DashboardHomeView({ setView, boards, announcements }: DashboardHomeViewProps) {
  const activeBoards = boards.filter(b => b.status !== 'Đã hoàn thành');
  const recentAnnouncements = announcements.slice(0, 2);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#407F3E] to-[#446900] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-y-12"></div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#c0ef7c]" />
            <span>Khoa Công Nghệ Thực Phẩm</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Hệ thống Quản lý Kiến tập Thực tế
          </h2>
          <p className="text-sm md:text-base text-white/85 font-medium leading-relaxed">
            Hệ thống cổng thông tin tích hợp quản lý hồ sơ, tài chính học phí, kết quả điểm số thực tập, và hội đồng bảo vệ chuyên đề bảo cáo cuối khóa cho sinh viên.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setView('ket-qua-kien-tap')}
              className="px-5 py-2.5 bg-white text-[#407F3E] hover:bg-slate-50 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              Xem kết quả điểm
            </button>
            <button
              onClick={() => setView('tai-khoan')}
              className="px-5 py-2.5 bg-[#c0ef7c] text-slate-900 hover:bg-[#aef4a5] font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              Quản lý người dùng
            </button>
          </div>
        </div>
      </div>

      {/* Grid of widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Quick Actions & Committee List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3.5 bg-[#407F3E]/10 rounded-xl text-primary-container shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hợp tác Nhà máy</p>
                <h4 className="text-xl font-black text-slate-800">3 Đối tác lớn</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">CP, Acecook, Ajinomoto</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3.5 bg-secondary-container-green text-[#446900] rounded-xl shrink-0">
                <Gavel className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hội đồng chấm</p>
                <h4 className="text-xl font-black text-slate-800">{boards.length} Tổ chức</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Bảo vệ & kiểm tra</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3.5 bg-yellow-50 text-amber-700 rounded-xl shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lượt thực tế</p>
                <h4 className="text-xl font-black text-slate-800">128 sinh viên</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Khóa 13, 14 Đại học</p>
              </div>
            </div>
          </div>

          {/* List of upcoming committee boards */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Hội đồng bảo vệ sắp diễn ra</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Danh sách lịch bảo vệ đã lên kế hoạch</p>
              </div>
              <button
                onClick={() => setView('hoi-dong-cham')}
                className="text-xs font-bold text-primary-container hover:text-[#346732] flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {activeBoards.map(board => (
                <div key={board.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{board.name}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {board.datetime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        {board.time}
                      </span>
                      <span className="text-slate-700 font-extrabold bg-[#E7E0C4] px-1.5 py-0.2 rounded text-[10px]">
                        {board.location}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-bold shadow-sm shrink-0">
                    {board.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 col: System Announcements Feed & Guide */}
        <div className="space-y-8">
          {/* Feed announcements */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-container shrink-0" />
                  <h3 className="font-extrabold text-slate-800 text-base">Thông báo mới</h3>
                </div>
                <button
                  onClick={() => setView('thong-bao')}
                  className="text-xs font-bold text-primary-container hover:text-[#346732] flex items-center gap-1 cursor-pointer"
                >
                  <span>Tất cả</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {recentAnnouncements.map(ann => (
                  <div 
                    key={ann.id} 
                    onClick={() => setView('thong-bao')}
                    className="p-3.5 bg-slate-50 border border-slate-100 hover:border-[#407F3E]/20 hover:bg-[#407F3E]/5 rounded-xl transition-all cursor-pointer space-y-1.5"
                  >
                    <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">
                      {ann.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold font-mono">{ann.dateSent}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick interactive guide */}
            <div className="p-4 bg-secondary-container-green/20 border border-[#c0ef7c]/50 rounded-xl mt-6 space-y-2">
              <span className="inline-block px-2 py-0.5 bg-secondary-container-green text-on-secondary-container-green text-[9px] font-extrabold rounded-full tracking-wider uppercase">
                Mẹo thao tác
              </span>
              <p className="text-xs text-[#266528] leading-relaxed font-semibold">
                Sử dụng <b>Bộ chuyển đổi Vai trò (Role Switcher)</b> ở góc trên bên phải thanh tiêu đề để trải nghiệm giao diện góc nhìn của Giảng viên chấm điểm hoặc Sinh viên tra cứu điểm/lệ phí.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
