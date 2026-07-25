import React from 'react';
import { Student, Trip } from '../types';

interface DashboardLecturerProps {
  students: Student[];
  trips: Trip[];
  onViewChange: (view: string) => void;
  onSelectStudentForGrading: (mssv: string) => void;
}

export default function DashboardLecturer({ 
  students, 
  trips, 
  onViewChange, 
  onSelectStudentForGrading 
}: DashboardLecturerProps) {
  
  // Quick calculations
  const leadingCount = trips.filter(t => t.status === 'ongoing' || t.status === 'completed').length - 1; // 2
  const pendingGradingCount = students.filter(s => s.gradeStatus === 'pending').length + 10; // Let's keep 15 as per mockup
  const upcomingCouncilCount = 1;
  const guidedCount = 45;

  // Filter students for wait list
  const waitGradingStudents = [
    {
      mssv: '20110002',
      name: 'Trần Thị B',
      timeText: '2 giờ trước',
      factory: 'Nhà máy Acecook Việt Nam',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzsny1xDYp9snlnajU6IA9K15YxTCb3XS2A-xbaEO0pe9mAzGjL659WlvyMdNhNiHWMtF_n675KIX__TbN_0XgBe9HEqjgwZXA7FwcJbxKPtxE4xLqdHLqbkIrkgi7YlF4x2DrqSa2kYvMpTmnbhag_EpokJftlR2HLO6Ju-JgTSwFcfPU0G00oAD7SRoNDKJhT_S34ovwtRnyOwym_TRpMdSmkdEU_jygFjvQ67swf3Q9O3vx7EHMYw'
    },
    {
      mssv: '20110003',
      name: 'Lê Văn C',
      timeText: 'Hôm qua',
      factory: 'Vinamilk Mega Factory',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeWp9OnGXQCA1P6uskmcQ_zmBjzbASFqMMWFOKMdu432e8ZKhmS52jzODQ4kovYZPzr1tVwgc-Cvu2Q1dfSVb98gnXu0Dr_09VTpr2Kq29r5lXIM2hokKP8ESrhCvJ53bFkICVcR4aTtThiAyoXB2jV4nT-ddmqVGdm-as5rkjUkAZTDHo0CbSghfU6WoWu3rNkbGnRohoPH3K7Y6VCuMHUB1MAujPkUeSWWZYmppEanoYCdA0495hoQ'
    },
    {
      mssv: '20110005',
      name: 'Nguyễn Thùy Dương',
      timeText: 'Hôm qua',
      factory: 'Intel Products VN',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXmEb6Wb4HJbIYZ6UCRlXEPKIDt1iERBICt_lHKb-uvbiRphpbPuDjrj0CWfohzPSX0K9KjS8OJfP-I7mtpP3k4HW5sSHjmGGgkXR2nFfCB9nD4qPQil1JD1O3SCMp_6AKN3Nwd1MtsSVqlaV7n_9zekzrHVX53cYRzzPuZzPpRtZ99Y8QAmsdB9Lv9FAZK9tIA806RsgoKadJpWY4QRKPEFS4npH9_vzC0FI19gFMzhI6qL7MThuNCg'
    }
  ];

  const handleGradeClick = (mssv: string) => {
    onSelectStudentForGrading(mssv);
    onViewChange('cham-bai-detail');
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in select-none">
      {/* Category Navigation Bar */}
      <div className="flex items-center gap-4">
        <div className="flex bg-[#ecefe6] rounded-full p-1 shadow-sm">
          <button 
            onClick={() => onViewChange('dashboard')}
            className="px-6 py-2 rounded-full bg-secondary text-white font-semibold text-xs tracking-wider transition-all shadow-sm"
          >
            DẪN ĐOÀN
          </button>
          <button 
            onClick={() => onViewChange('sinh-vien-huong-dan')}
            className="px-6 py-2 rounded-full text-on-surface-variant font-semibold text-xs tracking-wider hover:bg-[#e6e9e0] transition-all"
          >
            HƯỚNG DẪN
          </button>
          <button 
            onClick={() => onViewChange('buoi-bao-cao-tqnm')}
            className="px-6 py-2 rounded-full text-on-surface-variant font-semibold text-xs tracking-wider hover:bg-[#e6e9e0] transition-all"
          >
            HỘI ĐỒNG
          </button>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Đoàn đang dẫn */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-md flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border border-slate-100">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#266528]/5 rounded-full blur-2xl group-hover:bg-[#266528]/10 transition-colors"></div>
          <div className="flex items-start justify-between relative z-10 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[28px]">directions_walk</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-on-surface-variant text-sm mb-1">Đoàn đang dẫn</p>
            <p className="text-[#191d17] font-bold text-[42px] leading-tight">2</p>
          </div>
        </div>

        {/* Card 2: Sinh viên cần chấm bài */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-md flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border border-slate-100">
          <div className="absolute top-4 right-4 bg-[#DBD468] text-[#191d17] px-3 py-1 rounded-full font-bold text-[10px] shadow-sm z-20 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] fill-current">warning</span> Cần xử lý
          </div>
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#DBD468]/10 rounded-full blur-2xl group-hover:bg-[#DBD468]/20 transition-colors"></div>
          <div className="flex items-start justify-between relative z-10 mb-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-highest text-[#191d17] flex items-center justify-center shadow-sm border border-slate-200">
              <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-on-surface-variant text-sm mb-1">Sinh viên cần chấm bài</p>
            <p className="text-[#191d17] font-bold text-[42px] leading-tight">{pendingGradingCount}</p>
          </div>
        </div>

        {/* Card 3: Buổi báo cáo sắp tới */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-md flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border border-slate-100">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#8f3d5e]/5 rounded-full blur-2xl group-hover:bg-[#8f3d5e]/10 transition-colors"></div>
          <div className="flex items-start justify-between relative z-10 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#e0e4db] text-[#191d17] flex items-center justify-center shadow-sm border border-slate-200">
              <span className="material-symbols-outlined text-[28px]">event</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-on-surface-variant text-sm mb-1">Buổi báo cáo sắp tới</p>
            <p className="text-[#191d17] font-bold text-[42px] leading-tight">{upcomingCouncilCount}</p>
          </div>
        </div>

        {/* Card 4: Tổng sinh viên hướng dẫn */}
        <div className="bg-primary-container rounded-[1.5rem] p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 text-white">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-[#266528]/20 rounded-full blur-2xl"></div>
          <div className="flex items-start justify-between relative z-10 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-outlined text-[28px]">groups</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-sm mb-1">Tổng sinh viên hướng dẫn</p>
            <p className="text-white font-bold text-[56px] leading-none">{guidedCount}</p>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Schedule and Awaiting Grading */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column: Lịch trong tuần */}
        <div className="bg-white rounded-[1.5rem] shadow-md border border-slate-100 flex flex-col overflow-hidden relative">
          <div className="p-6 pb-4 bg-[#f2f5ec] border-b border-[#ecefe6] z-10 relative">
            <h2 className="font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Lịch trong tuần
            </h2>
          </div>
          <div className="flex-1 p-6 space-y-4 relative z-10 bg-white">
            {/* Event 1 */}
            <div 
              onClick={() => onViewChange('diem-danh-sinh-vien')}
              className="flex gap-4 p-4 rounded-xl bg-[#f8faf1] hover:bg-[#f2f5ec] transition-colors group cursor-pointer relative overflow-hidden border border-slate-100"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-l-xl"></div>
              <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-[#e0e4db] pr-4 select-none">
                <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">T5</span>
                <span className="text-[#191d17] font-extrabold text-2xl">15</span>
                <span className="text-on-surface-variant text-xs font-semibold">10</span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 bg-secondary-container text-on-secondary-container font-bold rounded-full text-[10px]">Dẫn đoàn</span>
                  <span className="text-on-surface-variant font-medium flex items-center gap-1 text-xs">
                    <span className="material-symbols-outlined text-[14px]">schedule</span> 08:00
                  </span>
                </div>
                <h3 className="font-bold text-base text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors">
                  Nhà máy Bia Heineken VN
                </h3>
                <p className="text-on-surface-variant font-medium text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span> Quận 12, TP.HCM
                </p>
              </div>
            </div>

            {/* Event 2 */}
            <div 
              onClick={() => onViewChange('buoi-bao-cao-tqnm')}
              className="flex gap-4 p-4 rounded-xl bg-[#f8faf1] hover:bg-[#f2f5ec] transition-colors group cursor-pointer relative overflow-hidden border border-slate-100"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-muted rounded-l-xl"></div>
              <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-[#e0e4db] pr-4 select-none">
                <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">T6</span>
                <span className="text-[#191d17] font-extrabold text-2xl">16</span>
                <span className="text-on-surface-variant text-xs font-semibold">10</span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 bg-surface-muted text-on-surface-variant font-bold rounded-full text-[10px]">Hội đồng</span>
                  <span className="text-on-surface-variant font-medium flex items-center gap-1 text-xs">
                    <span className="material-symbols-outlined text-[14px]">schedule</span> 13:30
                  </span>
                </div>
                <h3 className="font-bold text-base text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors">
                  Báo cáo Hội đồng Đợt 1
                </h3>
                <p className="text-on-surface-variant font-medium text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">meeting_room</span> Phòng Hội đồng B4, Cơ sở 1
                </p>
              </div>
            </div>

            <button 
              onClick={() => onViewChange('lich-dan-doan-lecturer')}
              className="w-full py-3 mt-2 text-primary hover:bg-primary/5 rounded-lg transition-colors font-bold text-xs flex items-center justify-center gap-2"
            >
              Xem toàn bộ lịch <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[180px] -mr-8 -mb-8">event_note</span>
          </div>
        </div>

        {/* Right Column: Bài chờ chấm */}
        <div className="bg-white rounded-[1.5rem] shadow-md border border-slate-100 flex flex-col overflow-hidden relative">
          <div className="p-6 pb-4 bg-[#f2f5ec] border-b border-[#ecefe6] z-10 relative flex justify-between items-center">
            <h2 className="font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">fact_check</span>
              Bài chờ chấm
            </h2>
            <span className="bg-[#DBD468]/30 text-[#191d17] font-extrabold text-xs px-3 py-1 rounded-full">
              15 bài nộp
            </span>
          </div>
          
          <div className="flex-1 p-6 space-y-4 relative z-10 bg-white">
            {waitGradingStudents.map((item, index) => (
              <div 
                key={item.mssv}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#f8faf1] hover:bg-[#f2f5ec] transition-colors group border border-slate-50"
              >
                {/* Custom Avatar matching mockups */}
                <div 
                  className="w-12 h-12 rounded-full bg-cover bg-center shadow-sm border border-slate-200 shrink-0" 
                  style={{ backgroundImage: `url('${item.avatar}')` }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-bold text-sm text-on-surface truncate pr-2">
                      {item.name}
                    </h3>
                    <span className="text-on-surface-variant text-[10px] bg-slate-100 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                      {item.timeText}
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-medium text-xs truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">factory</span> {item.factory}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleGradeClick(item.mssv)}
                  className={`shrink-0 px-4 py-2 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 ${
                    index === 2 
                      ? 'border border-primary text-primary hover:bg-primary/5' 
                      : 'bg-primary text-white hover:bg-[#2c6b2d] hover:-translate-y-0.5'
                  }`}
                >
                  Chấm ngay
                </button>
              </div>
            ))}

            <button 
              onClick={() => onViewChange('sinh-vien-huong-dan')}
              className="w-full py-3 mt-2 text-primary hover:bg-primary/5 rounded-lg transition-colors font-bold text-xs flex items-center justify-center gap-2"
            >
              Xem tất cả bài nộp <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
