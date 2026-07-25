import React from 'react';
import { Trip } from '../types';

interface StudentCalendarViewProps {
  trips: Trip[];
  onViewChange: (view: string) => void;
}

export default function StudentCalendarView({ trips, onViewChange }: StudentCalendarViewProps) {
  // Calendar dates mock
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const tripDates = [15, 22, 30]; // Highlighted trip days in October

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in select-none">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Lịch trình đoàn kiến tập</h1>
        <p className="text-on-surface-variant font-medium mt-1">Lịch trình chi tiết các chuyến tham quan thực tế doanh nghiệp được phân công trong học kỳ</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">directions_bus</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Đã tham gia</p>
              <p className="text-[#191d17] text-3xl font-extrabold mt-1">2 chuyến</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">Hoàn thành</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">schedule</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Sắp diễn ra</p>
              <p className="text-[#191d17] text-3xl font-extrabold mt-1">1 chuyến</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">Chuẩn bị</span>
        </div>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Timeline list (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-150">
              <h3 className="font-extrabold text-xs text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">list_alt</span>
                Chi tiết các điểm đến
              </h3>
            </div>

            <div className="p-5 space-y-4 bg-white">
              {trips.map((trip) => (
                <div 
                  key={trip.id}
                  className="p-4 rounded-xl border border-slate-150 hover:border-primary/40 hover:bg-[#f8faf1]/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Factory Visual Banner */}
                    <div 
                      className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-slate-200"
                      style={{ backgroundImage: `url('${trip.image}')` }}
                    ></div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          trip.status === 'completed'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : trip.status === 'ongoing'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {trip.status === 'completed' ? 'Đã đi' : trip.status === 'ongoing' ? 'Hôm nay' : 'Sắp đi'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-on-surface-variant">
                          {trip.date} lúc {trip.time}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-on-surface leading-snug">{trip.factoryName}</h4>
                      <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {trip.address}
                      </p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="shrink-0 flex items-center gap-2 self-end md:self-auto">
                    {trip.status === 'completed' ? (
                      <button 
                        onClick={() => onViewChange('nop-bai-thu-hoach')}
                        className="px-3.5 py-1.5 font-bold text-xs border border-primary text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        Nộp bài thu hoạch
                      </button>
                    ) : trip.status === 'ongoing' ? (
                      <span className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-[10px] uppercase rounded-lg shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] fill-current">check_circle</span>
                        Đã điểm danh
                      </span>
                    ) : (
                      <button 
                        onClick={() => alert('Vui lòng hoàn thành slide nghiên cứu trước chuyến đi và tải lên phần Nộp bài.')}
                        className="px-3.5 py-1.5 font-bold text-xs bg-primary text-white hover:bg-[#1a4b1c] rounded-lg shadow-sm transition-all"
                      >
                        Chuẩn bị tài liệu
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Calendar Grid & Map preview (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Calendar block */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            <h3 className="font-extrabold text-xs text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              Tháng 10, 2023
            </h3>

            {/* Calendar grid layout */}
            <div className="grid grid-cols-7 gap-1 text-center select-none text-xs">
              {['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'CN'].map(d => (
                <div key={d} className="font-bold text-on-surface-variant text-[10px] uppercase py-1">{d}</div>
              ))}
              {/* Offset days (start of October was Sunday - 1st) */}
              <div className="text-slate-300 py-2"></div>
              <div className="text-slate-300 py-2"></div>
              <div className="text-slate-300 py-2"></div>
              <div className="text-slate-300 py-2"></div>
              <div className="text-slate-300 py-2"></div>
              <div className="text-slate-300 py-2"></div>

              {daysInMonth.map(day => {
                const isTripDay = tripDates.includes(day);
                return (
                  <div 
                    key={day} 
                    className={`py-2 rounded-lg font-bold transition-all relative ${
                      isTripDay 
                        ? 'bg-secondary text-white font-black shadow-sm ring-2 ring-secondary-container scale-105 cursor-pointer' 
                        : 'text-on-surface hover:bg-slate-50'
                    }`}
                  >
                    {day}
                    {isTripDay && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-warning-yellow rounded-full"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Route preview box */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h3 className="font-extrabold text-xs text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">map</span>
              Lộ trình di chuyển
            </h3>

            {/* Beautiful Custom CSS Map visualization block */}
            <div className="bg-[#e4ebdb] rounded-xl h-44 overflow-hidden relative border border-slate-200 p-4 flex flex-col justify-between">
              {/* Custom maps mock background lines */}
              <div className="absolute inset-0 opacity-25">
                <div className="absolute top-1/3 left-0 right-0 h-4 bg-white/60 transform -rotate-12"></div>
                <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-white/60 transform rotate-45"></div>
                <div className="absolute top-0 bottom-0 left-2/3 w-5 bg-white/60 transform -rotate-45"></div>
              </div>

              {/* Map Pins and Path */}
              <div className="absolute inset-4 flex flex-col justify-between items-center relative z-10">
                {/* School Pin */}
                <div className="self-start flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[16px] fill-current">school</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-xs px-2 py-1 rounded shadow-xs text-[10px] font-bold">
                    Đại học ABC (Cơ sở 1)
                  </div>
                </div>

                {/* Path Dotted Line */}
                <div className="flex-1 w-0.5 border-l-2 border-dashed border-secondary my-1"></div>

                {/* Factory Pin */}
                <div className="self-end flex items-center gap-2">
                  <div className="bg-white/90 backdrop-blur-xs px-2 py-1 rounded shadow-xs text-[10px] font-bold">
                    Vinamilk Mega Factory
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#8f3d5e] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[16px] fill-current">home_pin</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
              * Tuyến xe đưa đón phục vụ xuất phát đúng giờ từ cổng chính Cơ sở 1. Sinh viên chuẩn bị mặc đúng trang phục lịch sự và mang theo thẻ sinh viên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
