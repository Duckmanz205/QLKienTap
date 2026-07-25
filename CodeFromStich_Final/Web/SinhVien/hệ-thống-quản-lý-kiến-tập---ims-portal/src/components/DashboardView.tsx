import React from 'react';
import { 
  Compass, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  ArrowRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Bell, 
  Laptop
} from 'lucide-react';
import { Trip, Submission, NotificationItem } from '../types';

interface DashboardViewProps {
  trips: Trip[];
  submissions: Submission[];
  notifications: NotificationItem[];
  setActiveView: (view: string) => void;
}

export default function DashboardView({ trips, submissions, notifications, setActiveView }: DashboardViewProps) {
  // Calculations
  const registeredCount = trips.filter(t => t.registered).length;
  const completedCount = trips.filter(t => t.registered && t.status === 'Hoàn thành').length;
  const pendingReportsCount = submissions.filter(s => s.status === 'Chưa nộp' || s.status === 'Trễ hạn').length;
  
  // Progress bar calculation
  const completionPercentage = registeredCount > 0 ? (completedCount / registeredCount) * 100 : 0;

  // Upcoming Trips Filter (not completed)
  const upcomingTrips = trips.filter(t => t.registered && t.status !== 'Hoàn thành').slice(0, 3);
  
  // Recent Notifications
  const recentNotifications = notifications.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-muted/30 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Chuyến đã đăng ký</span>
            <div className="w-10 h-10 rounded-full bg-[#e5ffdc] flex items-center justify-center text-primary">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-on-surface leading-none">{registeredCount}</span>
            <span className="text-on-surface-variant text-sm">chuyến</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-muted/30 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Đã hoàn thành</span>
            <div className="w-10 h-10 rounded-full bg-[#c0ef7c]/20 flex items-center justify-center text-[#446900]">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-on-surface leading-none">{completedCount}</span>
            <span className="text-on-surface-variant text-sm">chuyến</span>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-on-surface-variant mb-1 font-semibold">
              <span>Tiến độ hoàn thành</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-muted/30 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Bài cần nộp</span>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#ba1a1a] leading-none">{pendingReportsCount}</span>
            <span className="text-on-surface-variant text-sm">báo cáo</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-muted/30 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Điểm trung bình</span>
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-primary leading-none">8.5</span>
            <span className="text-on-surface-variant text-sm">/ 10</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Upcoming Trips */}
        <div className="bg-white rounded-2xl border border-surface-muted/40 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              <span>Chuyến tham quan sắp tới</span>
            </h2>
            <button 
              onClick={() => setActiveView('chuyen-tham-quan')}
              className="text-primary hover:text-primary-container text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingTrips.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f2f5ec]/50 rounded-2xl border border-dashed border-outline-variant/50">
              <Compass className="w-12 h-12 text-outline/40 mb-3" />
              <p className="text-sm font-bold text-on-surface-variant">Không có chuyến đi sắp tới nào</p>
              <p className="text-xs text-outline mt-1">Đăng ký chuyến tham quan mới để theo dõi lộ trình của bạn</p>
            </div>
          ) : (
            <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container">
              {upcomingTrips.map((trip) => {
                const isOnline = trip.type === 'Trực tuyến';
                return (
                  <div key={trip.id} className="relative flex gap-4 group">
                    {/* Circle Indicator */}
                    <div className={`absolute -left-[19px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white z-10 transition-colors ${
                      trip.status === 'Hợp lệ' ? 'bg-primary' : 'bg-amber-500'
                    }`}></div>

                    <div className="flex-1 bg-[#f8faf1] rounded-2xl p-4 border border-surface-muted/30 hover:shadow-md hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {trip.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                          isOnline 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {isOnline ? (
                            <Laptop className="w-3 h-3" />
                          ) : (
                            <MapPin className="w-3 h-3" />
                          )}
                          <span>{trip.type}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-on-surface-variant font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-outline" />
                          <span>{trip.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-outline" />
                          <span>{trip.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Card: Recent Notifications */}
        <div className="bg-white rounded-2xl border border-surface-muted/40 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <Bell className="w-5 h-5 text-secondary" />
              <span>Thông báo gần đây</span>
            </h2>
            <button 
              onClick={() => setActiveView('thong-bao')}
              className="text-primary hover:text-primary-container text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {recentNotifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => setActiveView('thong-bao')}
                className="p-4 rounded-xl bg-[#f8faf1]/80 hover:bg-[#f2f5ec] transition-all cursor-pointer flex gap-4 items-start border border-surface-muted/20 group shadow-sm hover:scale-[1.01]"
              >
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  notif.isRead ? 'bg-transparent' : 'bg-warning-yellow'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant line-clamp-1 mt-1 font-medium">
                    {notif.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-outline">
                    <Clock className="w-3 h-3" />
                    <span>{notif.timeRelative}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span className="capitalize font-semibold text-[#89b449]">
                      # {notif.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
