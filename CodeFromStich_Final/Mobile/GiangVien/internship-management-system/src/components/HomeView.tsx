/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flag, 
  Clock, 
  Calendar, 
  GraduationCap, 
  ChevronRight, 
  FileText, 
  Hand,
  Users,
  BookOpen,
  Award
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { students, setScreen } = useApp();

  // Dynamically compute ungraded students count
  const ungradedStudents = students.filter(s => !s.isGraded);
  const totalGuided = students.length;

  // Specific students for the quick grading queue
  const queueStudents = students.filter(s => ['2110432', '2110435', '2110438'].includes(s.id));

  return (
    <div className="flex flex-col w-full gap-6 pb-24 text-on-surface">
      {/* Welcome Message */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
          <Hand className="w-6 h-6 text-on-secondary-container z-10 transition-transform group-hover:rotate-12 duration-300" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-secondary/10 to-transparent animate-pulse"></div>
        </div>
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Chào thầy!</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Hôm nay có <strong className="text-primary">{ungradedStudents.length}</strong> sinh viên đang đợi chấm bài.
          </p>
        </div>
      </div>

      {/* Horizontal Pill Toggles (Working Navigation Shortcuts) */}
      <div className="flex items-center gap-2 overflow-x-auto snap-x hide-scrollbar pb-1">
        <button 
          onClick={() => setScreen('schedule')}
          className="snap-start flex-shrink-0 px-5 py-2.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md shadow-sm transition-transform active:scale-95 flex items-center gap-2"
        >
          <Users className="w-4.5 h-4.5" />
          Dẫn đoàn
        </button>
        <button 
          onClick={() => setScreen('guided')}
          className="snap-start flex-shrink-0 px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md transition-transform active:scale-95 flex items-center gap-2 hover:bg-surface-variant"
        >
          <BookOpen className="w-4.5 h-4.5" />
          Hướng dẫn
        </button>
        <button 
          onClick={() => setScreen('council')}
          className="snap-start flex-shrink-0 px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md transition-transform active:scale-95 flex items-center gap-2 hover:bg-surface-variant"
        >
          <Award className="w-4.5 h-4.5" />
          Hội đồng
        </button>
      </div>

      {/* Stat Cards (2x2 Grid with Interactive Redirects) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: Tours */}
        <div 
          onClick={() => setScreen('schedule')}
          className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden group cursor-pointer border border-surface-muted/30 hover:border-secondary/40 transition-all active:scale-[0.98]"
        >
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-secondary/5 rounded-full transition-transform group-hover:scale-150 duration-300"></div>
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mb-1">
            <Flag className="w-4 h-4" />
          </div>
          <span className="font-headline-md text-headline-md text-on-surface">1</span>
          <span className="font-body-sm text-body-md text-on-surface-variant leading-tight">Đoàn đang dẫn</span>
        </div>

        {/* Card 2: Need Grading */}
        <div 
          onClick={() => setScreen('grades')}
          className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden group cursor-pointer border border-surface-muted/30 hover:border-primary/40 transition-all active:scale-[0.98]"
        >
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#DBD468]/10 rounded-full transition-transform group-hover:scale-150 duration-300"></div>
          <div className="w-8 h-8 rounded-full bg-[#DBD468]/20 flex items-center justify-center text-on-surface mb-1">
            <Clock className="w-4 h-4 text-text-slate" />
          </div>
          <span className="font-headline-md text-headline-md text-on-surface">{ungradedStudents.length}</span>
          <span className="font-body-sm text-body-md text-on-surface-variant leading-tight">SV cần chấm bài</span>
        </div>

        {/* Card 3: Defense Sessions */}
        <div 
          onClick={() => setScreen('council')}
          className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden group cursor-pointer border border-surface-muted/30 hover:border-tertiary/40 transition-all active:scale-[0.98]"
        >
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-tertiary/5 rounded-full transition-transform group-hover:scale-150 duration-300"></div>
          <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container mb-1">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="font-headline-md text-headline-md text-on-surface">2</span>
          <span className="font-body-sm text-body-md text-on-surface-variant leading-tight">Buổi báo cáo tới</span>
        </div>

        {/* Card 4: Guided Count */}
        <div 
          onClick={() => setScreen('guided')}
          className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden group cursor-pointer border border-surface-muted/30 hover:border-primary/40 transition-all active:scale-[0.98]"
        >
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full transition-transform group-hover:scale-150 duration-300"></div>
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container mb-1">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-headline-lg text-headline-lg text-primary">{totalGuided}</span>
          <span className="font-body-sm text-body-md text-on-surface-variant leading-tight">Tổng SV hướng dẫn</span>
        </div>
      </div>

      {/* Schedule Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-muted/40 flex flex-col overflow-hidden">
        <div className="px-5 py-4 bg-surface-container-low flex justify-between items-center border-b border-surface-muted/30">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Lịch trong tuần</h3>
          <button 
            onClick={() => setScreen('schedule')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col divide-y divide-surface-muted/20">
          {/* Row 1 */}
          <div 
            onClick={() => setScreen('schedule')}
            className="px-5 py-4 flex gap-4 items-start relative group cursor-pointer hover:bg-surface-container-low/40 transition-colors"
          >
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container relative z-10 flex-shrink-0">
              <span className="font-label-md text-[10px] uppercase font-bold">T5</span>
              <span className="font-headline-sm text-lg leading-none">25</span>
            </div>
            <div className="flex flex-col relative z-10">
              <span className="font-label-md text-label-md text-secondary mb-0.5">[Dẫn đoàn] Tham quan</span>
              <span className="font-body-lg text-body-lg text-on-surface font-semibold">Vinamilk</span>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-body-md text-[13px]">08:00</span>
              </div>
            </div>
          </div>
          {/* Row 2 */}
          <div 
            onClick={() => setScreen('council')}
            className="px-5 py-4 flex gap-4 items-start relative group cursor-pointer hover:bg-surface-container-low/40 transition-colors"
          >
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container relative z-10 flex-shrink-0">
              <span className="font-label-md text-[10px] uppercase font-bold">T6</span>
              <span className="font-headline-sm text-lg leading-none">26</span>
            </div>
            <div className="flex flex-col relative z-10">
              <span className="font-label-md text-label-md text-tertiary mb-0.5">[Hội đồng] Chấm báo cáo</span>
              <span className="font-body-lg text-body-lg text-on-surface font-semibold">Khóa 46</span>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-body-md text-[13px]">13:30</span>
              </div>
            </div>
          </div>
          {/* Row 3 */}
          <div 
            onClick={() => setScreen('schedule')}
            className="px-5 py-4 flex gap-4 items-start relative group cursor-pointer hover:bg-surface-container-low/40 transition-colors"
          >
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container relative z-10 flex-shrink-0">
              <span className="font-label-md text-[10px] uppercase font-bold">T7</span>
              <span className="font-headline-sm text-lg leading-none">27</span>
            </div>
            <div className="flex flex-col relative z-10">
              <span className="font-label-md text-label-md text-secondary mb-0.5">[Dẫn đoàn] Tham quan</span>
              <span className="font-body-lg text-body-lg text-on-surface font-semibold">Acecook</span>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-body-md text-[13px]">08:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grading Queue Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-muted/40 flex flex-col overflow-hidden mb-8">
        <div className="px-5 py-4 bg-surface-container-low flex justify-between items-center border-b border-surface-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Bài chờ chấm</h3>
            {ungradedStudents.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-md text-[10px] font-bold">
                {Math.min(ungradedStudents.length, 3)} Cần gấp
              </span>
            )}
          </div>
          <button 
            onClick={() => setScreen('guided')}
            className="text-primary font-label-md text-label-md hover:underline font-bold"
          >
            Xem tất cả
          </button>
        </div>
        <div className="flex flex-col divide-y divide-surface-muted/10">
          {queueStudents.map(student => (
            <div 
              key={student.id}
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative group hover:bg-surface-container-low/10 transition-colors"
            >
              <div className="flex gap-3 items-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline-sm text-lg flex-shrink-0 font-bold overflow-hidden">
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-lg text-body-lg text-on-surface font-semibold truncate">
                    {student.name}
                  </span>
                  <span className="font-body-md text-[13px] text-on-surface-variant truncate">
                    {student.company} • Nộp {student.submittedDate}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setScreen('evaluation', student.id)}
                className="relative z-10 self-start sm:self-auto px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2 active:scale-95 transition-transform shadow-sm hover:bg-primary-container"
              >
                <FileText className="w-4 h-4" />
                Chấm ngay
              </button>
            </div>
          ))}

          {queueStudents.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant">
              Không có bài chờ chấm nào. Tất cả đã được chấm đầy đủ! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
