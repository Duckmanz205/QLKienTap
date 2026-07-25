/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ChevronDown, Check, X, Ban, CheckCircle, Save } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { students, updateAttendance, saveGrades } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTour, setSelectedTour] = useState('Vinamilk - hôm nay');
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filter students belonging to this tour
  const tourStudents = students.filter(s => s.tourId === 'vinamilk-today');

  // Filter students based on search query
  const filteredStudents = tourStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.includes(searchQuery)
  );

  // Calculate checked attendance count (present, absent, or excused count as check complete)
  const checkedCount = tourStudents.filter(s => s.attendanceStatus !== 'none').length;
  const totalCount = tourStudents.length;

  // Handles marking all as present
  const handleMarkAllPresent = () => {
    tourStudents.forEach(s => {
      updateAttendance(s.id, 'present');
    });
  };

  // Handle saving attendance
  const handleSave = async () => {
    setIsSaving(true);
    await saveGrades();
    setIsSaving(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col w-full gap-4 relative pb-28">
      {/* Dropdown Selector */}
      <div className="relative">
        <label className="font-label-md text-label-md text-on-surface-variant mb-1 block">
          Chọn chuyến tham quan
        </label>
        <div className="relative">
          <select 
            value={selectedTour}
            onChange={(e) => setSelectedTour(e.target.value)}
            className="w-full h-12 pl-4 pr-10 bg-surface-container-lowest border border-surface-muted rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-on-surface"
          >
            <option>Vinamilk - hôm nay</option>
            <option>Acecook Việt Nam - 18/10</option>
            <option>Suntory Pepsico - 22/10</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline w-5 h-5" />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-10 pr-4 bg-surface-container-lowest border border-surface-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-on-surface placeholder:text-outline-variant" 
          placeholder="Tìm theo MSSV/họ tên"
        />
      </div>

      {/* Quick Action & Summary Status */}
      <div className="flex justify-between items-center pt-1 pb-1">
        <button 
          onClick={handleMarkAllPresent}
          className="px-4 py-2 border border-secondary text-secondary font-label-md text-label-md rounded-lg hover:bg-secondary-container transition-colors active:scale-95 font-bold cursor-pointer"
        >
          Đánh dấu tất cả Có mặt
        </button>
        <span className="font-label-md text-label-md text-on-surface-variant">
          <strong className="text-primary font-bold text-[14px]">{checkedCount}/{totalCount}</strong> đã điểm danh
        </span>
      </div>

      {/* Student Attendance List */}
      <div className="space-y-3">
        {filteredStudents.map(student => {
          const status = student.attendanceStatus;

          return (
            <div 
              key={student.id}
              className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-muted/50 student-row flex flex-col gap-3 transition-all hover:border-outline-variant/50"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-outline font-medium">MSSV: {student.id}</p>
                  <p className="font-headline-sm text-[16px] text-on-surface font-semibold truncate mt-0.5">
                    {student.name}
                  </p>
                </div>

                {/* Segmented Checkboxes */}
                <div className="flex rounded-lg overflow-hidden border border-outline-variant/40 shrink-0">
                  {/* Present/Check */}
                  <button 
                    onClick={() => updateAttendance(student.id, 'present')}
                    className={`w-10 h-10 flex items-center justify-center transition-colors ${
                      status === 'present' 
                        ? 'bg-secondary text-white' 
                        : 'bg-white text-secondary hover:bg-surface-container-low'
                    }`}
                    title="Có mặt"
                  >
                    <Check className="w-5 h-5 font-bold" />
                  </button>

                  {/* Absent/Close */}
                  <button 
                    onClick={() => updateAttendance(student.id, 'absent')}
                    className={`w-10 h-10 flex items-center justify-center transition-colors border-l border-outline-variant/30 ${
                      status === 'absent' 
                        ? 'bg-[#E68A8C] text-white' 
                        : 'bg-white text-[#E68A8C] hover:bg-surface-container-low'
                    }`}
                    title="Vắng mặt"
                  >
                    <X className="w-5 h-5 font-bold" />
                  </button>

                  {/* Excused/Block */}
                  <button 
                    onClick={() => updateAttendance(student.id, 'excused')}
                    className={`w-10 h-10 flex items-center justify-center transition-colors border-l border-outline-variant/30 ${
                      status === 'excused' 
                        ? 'bg-[#ba1a1a] text-white' 
                        : 'bg-white text-[#ba1a1a] hover:bg-surface-container-low'
                    }`}
                    title="Phép"
                  >
                    <Ban className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Attendance Excuse Reason Textbox (Editable in Real-Time for Lê Văn C or any Excused student) */}
              {status === 'excused' && (
                <div className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-lg border border-surface-muted/40 animate-fadeIn">
                  <span className="font-label-md text-label-md text-on-surface-variant font-bold shrink-0">Lý do:</span>
                  <input 
                    type="text" 
                    value={student.excuseReason || ''}
                    onChange={(e) => updateAttendance(student.id, 'excused', e.target.value)}
                    className="bg-transparent border-none p-0 text-body-md focus:ring-0 w-full italic text-on-surface-variant font-medium focus:outline-none"
                    placeholder="Bị ốm, xin nghỉ có phép..."
                  />
                </div>
              )}
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest border border-dashed rounded-xl">
            Không tìm thấy sinh viên nào khớp từ khóa. 🔍
          </div>
        )}
      </div>

      {/* Floating Action Button for saving state */}
      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex flex-col items-center justify-center z-40 active:scale-90 hover:bg-primary-container transition-transform duration-150 cursor-pointer disabled:opacity-85"
      >
        {isSaving ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter leading-none mt-1">Lưu</span>
          </>
        )}
      </button>

      {/* Floating success toast notification */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-secondary-container/20 animate-slideUp">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-label-md text-sm font-bold">Lưu điểm danh thành công!</span>
        </div>
      )}
    </div>
  );
};
