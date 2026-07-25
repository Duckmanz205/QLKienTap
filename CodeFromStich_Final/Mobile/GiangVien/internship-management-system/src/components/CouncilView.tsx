/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, Users, HelpCircle, GraduationCap, ArrowRight, CheckCircle } from 'lucide-react';

export const CouncilView: React.FC = () => {
  const { councils } = useApp();
  const [activeTab, setActiveTab] = useState<'sessions' | 'grading'>('sessions');
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Quick mock presentation grades for the "Chấm điểm" tab
  const [grades, setGrades] = useState({
    p1: '8.5',
    p2: '7.0',
    p3: '9.0'
  });

  const handleGradeChange = (key: string, val: string) => {
    setGrades(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveGrades = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }, 800);
  };

  return (
    <div className="flex flex-col w-full text-on-surface">
      {/* Segmented Control */}
      <div className="bg-surface-container-low p-1 rounded-full flex w-full mb-6 border border-surface-muted shadow-sm shrink-0">
        <button 
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-2 px-4 rounded-full font-label-md text-label-md text-center shadow-sm transition-all duration-200 cursor-pointer ${
            activeTab === 'sessions' 
              ? 'bg-primary text-on-primary font-bold' 
              : 'text-on-surface-variant hover:bg-surface-variant'
          }`}
        >
          Danh sách buổi
        </button>
        <button 
          onClick={() => setActiveTab('grading')}
          className={`flex-1 py-2 px-4 rounded-full font-label-md text-label-md text-center transition-all duration-200 cursor-pointer ${
            activeTab === 'grading' 
              ? 'bg-primary text-on-primary font-bold' 
              : 'text-on-surface-variant hover:bg-surface-variant'
          }`}
        >
          Chấm điểm
        </button>
      </div>

      {activeTab === 'sessions' ? (
        /* Cards List (Active Tab Content) */
        <div className="flex flex-col gap-4">
          {councils.map(session => {
            // Determine status labels and colors
            let statusText = '';
            let statusStyle = '';

            if (session.status === 'upcoming') {
              statusText = 'Sắp diễn ra';
              statusStyle = 'bg-warning-yellow text-on-background';
            } else if (session.status === 'ongoing') {
              statusText = 'Đang diễn ra';
              statusStyle = 'bg-secondary-fixed-dim text-on-secondary-fixed-variant animate-pulse';
            } else {
              statusText = 'Đã hoàn thành';
              statusStyle = 'bg-surface-variant text-on-surface-variant';
            }

            return (
              <div 
                key={session.id}
                className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-muted p-5 relative overflow-hidden transition-all hover:border-outline-variant/50 group"
              >
                {session.status === 'ongoing' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-fixed-dim"></div>
                )}
                <div className={`flex justify-between items-start mb-3 ${session.status === 'ongoing' ? 'pl-2' : ''}`}>
                  <h2 className="font-headline-sm text-[16px] text-on-surface font-semibold truncate pr-2">
                    {session.name}
                  </h2>
                  <span className={`font-label-md text-[10px] font-bold px-3 py-1 rounded-full flex-shrink-0 ${statusStyle}`}>
                    {statusText}
                  </span>
                </div>

                <div className={`flex flex-col gap-2 mb-4 font-body-md text-body-md text-on-surface-variant ${session.status === 'ongoing' ? 'pl-2' : ''}`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-outline" />
                    <span>{session.timeRange} | {session.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-outline" />
                    <span>{session.room}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4 text-outline" />
                    <span className="font-semibold text-on-surface text-xs">Số SV báo cáo: {session.studentCount}</span>
                  </div>
                </div>

                {/* Conditional Actions based on status */}
                {session.status === 'upcoming' && (
                  <button 
                    onClick={() => setActiveTab('grading')}
                    className="w-full py-2.5 rounded-lg border-2 border-primary text-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container hover:text-on-primary transition-colors duration-200 font-bold active:scale-[0.98]"
                  >
                    Vào chấm điểm
                  </button>
                )}

                {session.status === 'ongoing' && (
                  <button 
                    onClick={() => setActiveTab('grading')}
                    className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:opacity-90 transition-opacity duration-200 font-bold active:scale-[0.98]"
                  >
                    Tiếp tục chấm
                  </button>
                )}

                {session.status === 'completed' && (
                  <button 
                    onClick={() => alert(`Đang tải bảng điểm kết quả Hội đồng 3 (${session.room})`)}
                    className="w-full py-2.5 rounded-lg border border-outline text-outline font-label-md text-label-md uppercase tracking-wider hover:bg-surface-variant transition-colors duration-200 font-bold active:scale-[0.98]"
                  >
                    Xem kết quả
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Grading presentation panels sub-view */
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-surface-muted/40 shadow-sm flex flex-col gap-5">
          <div className="border-b pb-2">
            <h3 className="font-headline-sm text-sm text-primary font-bold uppercase">Nhập Điểm Hội Đồng (Khóa 45/46)</h3>
            <p className="text-xs text-on-surface-variant">Nhập trực tiếp điểm thuyết trình và trả lời câu hỏi của hội đồng phản biện.</p>
          </div>

          <div className="space-y-4">
            {/* Student 1 */}
            <div className="flex items-center justify-between gap-3 bg-surface-container-low/40 p-3 rounded-lg border border-surface-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0">A</div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Nguyễn Văn A</p>
                  <p className="text-[10px] text-outline">MSSV: 2110432</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  max="10"
                  value={grades.p1}
                  onChange={(e) => handleGradeChange('p1', e.target.value)}
                  className="w-16 text-center border rounded px-1.5 py-1 text-sm bg-white font-bold text-primary focus:outline-none"
                />
                <span className="text-xs text-outline font-semibold">/10</span>
              </div>
            </div>

            {/* Student 2 */}
            <div className="flex items-center justify-between gap-3 bg-surface-container-low/40 p-3 rounded-lg border border-surface-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0">B</div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Trần Thị B</p>
                  <p className="text-[10px] text-outline">MSSV: 2110435</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  max="10"
                  value={grades.p2}
                  onChange={(e) => handleGradeChange('p2', e.target.value)}
                  className="w-16 text-center border rounded px-1.5 py-1 text-sm bg-white font-bold text-primary focus:outline-none"
                />
                <span className="text-xs text-outline font-semibold">/10</span>
              </div>
            </div>

            {/* Student 3 */}
            <div className="flex items-center justify-between gap-3 bg-surface-container-low/40 p-3 rounded-lg border border-surface-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0">C</div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Lê Văn C</p>
                  <p className="text-[10px] text-outline">MSSV: 2110438</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  max="10"
                  value={grades.p3}
                  onChange={(e) => handleGradeChange('p3', e.target.value)}
                  className="w-16 text-center border rounded px-1.5 py-1 text-sm bg-white font-bold text-primary focus:outline-none"
                />
                <span className="text-xs text-outline font-semibold">/10</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSaveGrades}
            disabled={isSaving}
            className="w-full py-3 bg-primary text-white rounded-lg font-bold font-label-md uppercase tracking-wide hover:bg-primary-container transition-all shadow-md active:scale-[0.98] mt-2 flex justify-center items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Lưu Điểm Hội Đồng'
            )}
          </button>
        </div>
      )}

      {/* Presentation Save Success Toast */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-y-1/2 z-50 bg-secondary text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-secondary-container/20 animate-slideUp">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-label-md text-sm font-bold">Lưu điểm hội đồng thành công!</span>
        </div>
      )}
    </div>
  );
};
