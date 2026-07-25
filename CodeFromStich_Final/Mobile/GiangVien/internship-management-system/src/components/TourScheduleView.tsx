/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, List, MapPin, Users, ArrowRight, Video } from 'lucide-react';

export const TourScheduleView: React.FC = () => {
  const { tours, setScreen } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  return (
    <div className="flex flex-col w-full px-1 py-2 gap-4">
      {/* Top Selector (List vs Calendar) */}
      <div className="flex justify-end mb-2">
        <div className="flex bg-surface-container rounded-full p-1 shadow-sm border border-surface-muted/30">
          <button 
            onClick={() => setViewMode('list')}
            aria-label="Danh sách" 
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              viewMode === 'list' 
                ? 'bg-secondary text-on-secondary shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            aria-label="Lịch" 
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              viewMode === 'calendar' 
                ? 'bg-secondary text-on-secondary shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="flex flex-col gap-4">
          {tours.map(tour => {
            // Determine badge colors based on status
            let statusText = '';
            let statusStyle = '';

            if (tour.status === 'upcoming') {
              statusText = 'Sắp diễn ra';
              statusStyle = 'bg-warning-yellow text-text-slate';
            } else if (tour.status === 'ongoing') {
              statusText = 'Đang diễn ra';
              statusStyle = 'bg-secondary text-on-secondary animate-pulse';
            } else {
              statusText = 'Đã hoàn thành';
              statusStyle = 'bg-surface-muted text-on-surface-variant';
            }

            const percentRegistered = Math.round((tour.registeredCount / tour.maxCount) * 100);

            return (
              <div 
                key={tour.id}
                className={`bg-surface-container-lowest rounded-xl shadow-sm p-4 relative overflow-hidden group border border-surface-muted/40 transition-all ${
                  tour.status === 'completed' ? 'opacity-85' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface pr-2 font-semibold">
                    {tour.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full font-label-md text-[10px] font-bold whitespace-nowrap ${statusStyle}`}>
                    {statusText}
                  </span>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
                    <Calendar className="w-4 h-4 text-outline" />
                    <span>{tour.date} | {tour.timeRange}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tour.type === 'direct' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-muted text-text-slate font-label-md text-[10px] font-bold">
                        <MapPin className="w-3 h-3" /> Trực tiếp
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-container/20 text-primary font-label-md text-[10px] font-bold">
                        <Video className="w-3 h-3" /> Trực tuyến
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-body-md text-body-md text-on-surface-variant">Số SV đăng ký:</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      {tour.registeredCount}/{tour.maxCount}
                    </span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        tour.status === 'completed' ? 'bg-outline' : 'bg-primary-container'
                      }`}
                      style={{ width: `${percentRegistered}%` }}
                    ></div>
                  </div>
                </div>

                {/* View Details / Action Button */}
                <button 
                  onClick={() => {
                    // Clicking on Vinamilk directly navigates to Attendance screen!
                    if (tour.id === 'vinamilk-today') {
                      setScreen('attendance');
                    } else if (tour.id === 'acecook-today') {
                      setScreen('grades');
                    } else {
                      setScreen('guided');
                    }
                  }}
                  className="w-full py-2.5 rounded-lg bg-transparent border border-primary text-primary font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors active:scale-[0.98] font-bold"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar view visualization */
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-muted shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-surface-muted pb-2">
            <h4 className="font-headline-sm text-[16px] text-primary font-bold">Tháng 10 / 2023</h4>
            <div className="text-xs text-on-surface-variant">Hôm nay: 15/10/2023</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-outline">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center font-body-md">
            {/* Calendar grid items */}
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={`empty-${i}`} className="text-outline-variant p-1"></span>
            ))}
            
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">1</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">2</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">3</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">4</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">5</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">6</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">7</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">8</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">9</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">10</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">11</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">12</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">13</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">14</span>
            
            {/* 15: Vinamilk (Upcoming) */}
            <span 
              onClick={() => setScreen('attendance')}
              className="p-1 bg-warning-yellow/30 border border-warning-yellow text-text-slate font-bold rounded cursor-pointer relative"
              title="Nhà máy Vinamilk"
            >
              15
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-warning-yellow rounded-full"></span>
            </span>

            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">16</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">17</span>

            {/* 18: Acecook (Ongoing) */}
            <span 
              onClick={() => setScreen('grades')}
              className="p-1 bg-secondary-container/40 border border-secondary text-primary font-bold rounded cursor-pointer relative"
              title="Acecook Việt Nam"
            >
              18
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full"></span>
            </span>

            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">19</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">20</span>
            <span className="p-1 hover:bg-surface-variant rounded cursor-pointer">21</span>

            {/* 22: Suntory Pepsico (Completed) */}
            <span 
              onClick={() => setScreen('guided')}
              className="p-1 bg-surface-muted/40 border border-outline text-on-surface-variant rounded cursor-pointer"
              title="Suntory Pepsico"
            >
              22
            </span>

            {Array.from({ length: 9 }).map((_, i) => (
              <span key={`next-${i}`} className="p-1 text-on-surface-variant hover:bg-surface-variant rounded cursor-pointer">{23 + i}</span>
            ))}
          </div>
          <div className="text-xs text-on-surface-variant mt-2 border-t pt-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-warning-yellow"></span>
              <span>15/10: Nhà máy Vinamilk (Sắp diễn ra)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
              <span>18/10: Acecook Việt Nam (Đang diễn ra)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
              <span>22/10: Suntory Pepsico (Đã hoàn thành)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
