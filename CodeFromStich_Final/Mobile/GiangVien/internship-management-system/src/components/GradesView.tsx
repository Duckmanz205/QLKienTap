/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, Info, Save, CheckCircle, RotateCcw } from 'lucide-react';

export const GradesView: React.FC = () => {
  const { students, updateStudentGrade, saveGrades } = useApp();
  const [selectedTour, setSelectedTour] = useState('Vinamilk - 15/10/2023');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Filter students who have grades for this general view
  const gradedStudents = students.filter(s => ['2110432', '2110554', '2110981'].includes(s.id));

  // Handle preparation grade update
  const handlePrelimGradeChange = (studentId: string, value: string) => {
    let parsedVal = parseFloat(value);
    if (isNaN(parsedVal)) parsedVal = 0;
    // Cap between 0 and 10
    parsedVal = Math.max(0, Math.min(10, parsedVal));
    updateStudentGrade(studentId, { prelimGrade: parsedVal });
  };

  // Handle incrementing extra credit stepper (+0.5)
  const handleIncrementExtraGrade = (studentId: string, current: number) => {
    const nextVal = Math.min(1.0, current + 0.5);
    updateStudentGrade(studentId, { extraGrade: nextVal });
  };

  // Handle save action
  const handleSaveAll = async () => {
    setSaveState('saving');
    await saveGrades();
    setSaveState('saved');
    setTimeout(() => {
      setSaveState('idle');
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-28 text-on-surface">
      {/* Dropdown Selector */}
      <div className="relative">
        <label className="block font-label-md text-on-surface-variant mb-2 ml-1">
          Chọn chuyến tham quan
        </label>
        <div className="relative group">
          <select 
            value={selectedTour}
            onChange={(e) => setSelectedTour(e.target.value)}
            className="w-full bg-white border border-surface-muted rounded-lg py-3 px-4 appearance-none focus:ring-2 focus:ring-primary focus:border-primary font-body-lg text-text-slate shadow-sm focus:outline-none"
          >
            <option>Vinamilk - 15/10/2023</option>
            <option>Acecook Việt Nam - 18/10/2023</option>
            <option>Suntory Pepsico - 22/10/2023</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline w-5 h-5" />
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 mb-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <p className="font-body-md text-on-surface-variant leading-relaxed text-[13px]">
          Điểm chuẩn bị lấy từ bài kiểm tra ngoài hệ thống. Chuyến tự do: bài do GVHD tổ chức riêng.
        </p>
      </div>

      {/* Student Grades List */}
      <div className="space-y-4">
        {gradedStudents.map(student => {
          const isMaxExtra = student.extraGrade >= 1.0;

          return (
            <div 
              key={student.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-surface-muted/50 transition-all hover:border-outline-variant/40"
            >
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/20">
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-label-md text-on-surface-variant font-medium text-[11px]">MSSV: {student.id}</p>
                  <h3 className="font-headline-sm text-text-slate text-[16px] font-semibold">{student.name}</h3>
                </div>
              </div>

              {/* Grade Controls */}
              <div className="flex items-center justify-between gap-4">
                {/* Preparation Grade Input */}
                <div className="flex-1">
                  <label className="block font-label-md text-outline mb-1 text-[11px] font-bold uppercase">
                    Điểm chuẩn bị
                  </label>
                  <input 
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={student.prelimGrade === 0 ? '' : student.prelimGrade}
                    placeholder="0.0"
                    onChange={(e) => handlePrelimGradeChange(student.id, e.target.value)}
                    className="w-full bg-surface-container-lowest border border-surface-muted rounded-lg px-3 py-2 font-body-md text-center focus:ring-primary focus:border-primary text-on-surface focus:outline-none focus:ring-1"
                  />
                </div>

                {/* Stepper Extra Grade Control */}
                <div className="flex-1">
                  <label className="block font-label-md text-outline mb-1 text-[11px] font-bold uppercase">
                    Điểm cộng
                  </label>
                  <div className="flex items-center bg-surface-container border border-surface-muted rounded-lg overflow-hidden h-[42px]">
                    <button 
                      onClick={() => handleIncrementExtraGrade(student.id, student.extraGrade)}
                      disabled={isMaxExtra}
                      className={`flex-1 h-full font-label-md transition-colors font-bold text-xs ${
                        isMaxExtra 
                          ? 'bg-surface-dim text-outline cursor-not-allowed' 
                          : 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed active:scale-95'
                      }`}
                    >
                      <span>+0.5</span>
                    </button>
                    <div className={`px-2 font-label-md whitespace-nowrap text-[11px] font-semibold ${isMaxExtra ? 'text-outline font-medium' : 'text-on-surface'}`}>
                      {student.extraGrade.toFixed(1)} / 1.0
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB with full state machinery (Saved, saving, idle) */}
      <button 
        onClick={handleSaveAll}
        disabled={saveState === 'saving'}
        className={`fixed bottom-24 right-6 flex items-center gap-2 px-6 py-4 rounded-full shadow-xl active:scale-95 transition-all z-40 group cursor-pointer ${
          saveState === 'saved' 
            ? 'bg-secondary text-white' 
            : 'bg-primary text-on-primary hover:bg-primary-container'
        }`}
      >
        {saveState === 'idle' && (
          <>
            <Save className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-label-md uppercase tracking-wider font-bold">Lưu điểm</span>
          </>
        )}
        {saveState === 'saving' && (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-label-md uppercase tracking-wider font-bold">Đang lưu...</span>
          </>
        )}
        {saveState === 'saved' && (
          <>
            <CheckCircle className="w-5 h-5 animate-bounce" />
            <span className="font-label-md uppercase tracking-wider font-bold">Đã lưu!</span>
          </>
        )}
      </button>
    </div>
  );
};
