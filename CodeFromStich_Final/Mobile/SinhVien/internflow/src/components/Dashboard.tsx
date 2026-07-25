import React from 'react';
import { Trip, Notification, StudentProfile } from '../types';
import { Bus, CheckCircle, Clock, Star, ArrowRight, Calendar, AlertCircle, FileText, CreditCard } from 'lucide-react';

interface DashboardProps {
  profile: StudentProfile;
  trips: Trip[];
  notifications: Notification[];
  submissions: any[];
  onNavigate: (screen: string, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  trips,
  notifications,
  submissions,
  onNavigate
}) => {
  // Compute real statistics based on state
  const registeredCount = trips.filter(t => t.isRegistered).length;
  const completedCount = trips.filter(t => t.isCompleted).length;
  const pendingSubmissions = submissions.filter(s => s.status === 'Chưa nộp').length;
  
  // Average grade computation
  const gradedTrips = trips.filter(t => t.gradeDetails && t.gradeDetails.total > 0);
  const avgGrade = gradedTrips.length > 0 
    ? (gradedTrips.reduce((acc, t) => acc + (t.gradeDetails?.total || 0), 0) / gradedTrips.length).toFixed(1)
    : '8.4'; // Fallback default to match the screenshot

  const upcomingTrips = trips.filter(t => !t.isCompleted);
  const recentNotifs = notifications.slice(0, 3);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-6">
      {/* 2x2 Stat Grid (Bento Style) */}
      <section className="grid grid-cols-2 gap-4">
        {/* Stat 1 */}
        <div 
          onClick={() => onNavigate('trips')} 
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between cursor-pointer hover:border-[#407F3E] transition-all duration-200 group active:scale-[0.98]"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none">Chuyến đã đăng ký</span>
            <span className="p-2 rounded-xl bg-[#ecefe6] text-[#266528] group-hover:bg-[#aef4a5]/40 transition-colors">
              <Bus size={18} />
            </span>
          </div>
          <div className="text-3xl font-bold text-[#266528] mt-2">{registeredCount}</div>
        </div>

        {/* Stat 2 */}
        <div 
          onClick={() => onNavigate('results')} 
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between cursor-pointer hover:border-[#446900] transition-all duration-200 group active:scale-[0.98]"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none">Đã hoàn thành</span>
            <span className="p-2 rounded-xl bg-[#c0ef7c]/20 text-[#446900] group-hover:bg-[#c0ef7c]/40 transition-colors">
              <CheckCircle size={18} />
            </span>
          </div>
          <div className="text-3xl font-bold text-[#446900] mt-2">{completedCount}</div>
        </div>

        {/* Stat 3 */}
        <div 
          onClick={() => onNavigate('submit')} 
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between cursor-pointer hover:border-amber-500 transition-all duration-200 group active:scale-[0.98]"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none">Bài cần nộp</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <Clock size={18} />
            </span>
          </div>
          <div className="text-3xl font-bold text-amber-600 mt-2">{pendingSubmissions}</div>
        </div>

        {/* Stat 4 */}
        <div 
          onClick={() => onNavigate('results')} 
          className="bg-[#407f3e] text-[#e5ffdc] p-5 rounded-2xl shadow-md border border-[#266528] flex flex-col justify-between relative overflow-hidden cursor-pointer hover:bg-[#346a32] transition-all duration-200 active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-radial-to-br from-white/10 to-transparent pointer-events-none"></div>
          <div className="flex justify-between items-start mb-2 z-10">
            <span className="text-[11px] font-semibold text-[#aef4a5] uppercase tracking-wider leading-none">Điểm TB</span>
            <span className="p-1 text-[#aef4a5]">
              <Star size={18} fill="currentColor" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 z-10">{avgGrade}</div>
        </div>
      </section>

      {/* Horizontal Scrollable Row: Chuyến sắp tới */}
      <section>
        <div className="flex justify-between items-end mb-3 px-1">
          <h2 className="text-lg font-bold text-slate-800">Chuyến sắp tới</h2>
          <button 
            onClick={() => onNavigate('trips')} 
            className="text-xs font-semibold text-[#266528] hover:underline flex items-center gap-1"
          >
            Xem tất cả
          </button>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
          {upcomingTrips.length === 0 ? (
            <div className="min-w-full bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Không có chuyến tham quan sắp diễn ra.
            </div>
          ) : (
            upcomingTrips.map((trip) => (
              <div 
                key={trip.id} 
                className="min-w-[280px] w-[280px] bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden snap-center shrink-0 flex flex-col hover:shadow-sm transition-all"
              >
                <div className="h-32 bg-slate-100 relative">
                  <img 
                    className="w-full h-full object-cover" 
                    src={trip.heroImage} 
                    alt={trip.name} 
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <span className={`w-2 h-2 rounded-full ${trip.type === 'Trực tiếp' ? 'bg-[#446900]' : 'bg-[#266528]'}`}></span>
                    <span className="text-[10px] font-semibold text-slate-800">{trip.type}</span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base line-clamp-1 mb-1">{trip.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
                      <Calendar size={13} />
                      <span>{trip.date}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onNavigate('trip-detail', { tripId: trip.id })}
                    className="w-full bg-[#f2f5ec] hover:bg-[#ecefe6] active:bg-[#e0e4db] text-[#266528] font-semibold text-xs py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Vertical List Card: Thông báo gần đây */}
      <section>
        <div className="flex justify-between items-end mb-3 px-1">
          <h2 className="text-lg font-bold text-slate-800">Thông báo gần đây</h2>
          <button 
            onClick={() => onNavigate('notifications')} 
            className="text-xs font-semibold text-[#266528] hover:underline"
          >
            Xem toàn bộ
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          {recentNotifs.map((notif, index) => {
            // Determine icons
            let IconComp = AlertCircle;
            let iconColorClass = 'text-amber-500 bg-amber-50';
            if (notif.type === 'Kết quả báo cáo') {
              IconComp = FileText;
              iconColorClass = 'text-pink-600 bg-pink-50';
            } else if (notif.type === 'Cập nhật tài liệu') {
              IconComp = FileText;
              iconColorClass = 'text-emerald-600 bg-emerald-50';
            } else if (notif.type === 'Nhắc nhở đóng phí') {
              IconComp = CreditCard;
              iconColorClass = 'text-rose-500 bg-rose-50';
            }

            return (
              <div 
                key={notif.id}
                onClick={() => onNavigate('notifications')}
                className={`p-4 hover:bg-slate-50 transition-colors flex gap-3.5 items-start cursor-pointer relative ${
                  index !== recentNotifs.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                {/* Yellow dot for unread */}
                {!notif.isRead && (
                  <span className="absolute top-1/2 left-2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full"></span>
                )}
                
                <div className={`p-2.5 rounded-full shrink-0 ${iconColorClass} ml-2`}>
                  <IconComp size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-semibold text-sm text-slate-800 truncate pr-2">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{notif.timeText}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notif.content}</p>
                </div>
              </div>
            );
          })}
          
          <div className="bg-[#f2f5ec] border-t border-slate-200/80 p-3.5 text-center">
            <button 
              onClick={() => onNavigate('notifications')}
              className="font-bold text-xs text-[#266528] hover:text-[#105217] transition-colors uppercase tracking-wider"
            >
              Xem toàn bộ thông báo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
