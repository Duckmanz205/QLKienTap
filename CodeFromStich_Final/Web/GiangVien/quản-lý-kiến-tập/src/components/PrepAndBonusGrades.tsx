import React, { useState } from 'react';
import { Student } from '../types';

interface PrepAndBonusGradesProps {
  students: Student[];
  onUpdateGrades: (updatedStudents: Student[]) => void;
}

export default function PrepAndBonusGrades({ students, onUpdateGrades }: PrepAndBonusGradesProps) {
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [showToast, setShowToast] = useState(false);

  const handlePrepGradeChange = (mssv: string, value: string) => {
    let parsed = parseFloat(value);
    if (value === '') {
      parsed = 0;
    }
    setLocalStudents(prev => 
      prev.map(s => 
        s.mssv === mssv 
          ? { ...s, preparatoryGrade: isNaN(parsed) ? undefined : Math.min(10, Math.max(0, parsed)) } 
          : s
      )
    );
  };

  const handleBonusChange = (mssv: string, value: number) => {
    setLocalStudents(prev => 
      prev.map(s => 
        s.mssv === mssv 
          ? { ...s, bonusGrade: value } 
          : s
      )
    );
  };

  const handleNotesChange = (mssv: string, value: string) => {
    setLocalStudents(prev => 
      prev.map(s => 
        s.mssv === mssv 
          ? { ...s, notes: value } 
          : s
      )
    );
  };

  const handleSave = () => {
    onUpdateGrades(localStudents);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in select-none relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 right-8 bg-[#266528] text-white px-6 py-3.5 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-semibold animate-bounce border-2 border-white/20">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          Đã lưu điểm chuẩn bị &amp; điểm cộng thành công!
        </div>
      )}

      {/* Header section */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Điểm chuẩn bị &amp; cộng</h1>
        <p className="text-on-surface-variant font-medium mt-1">Đánh giá quá trình chuẩn bị bài nghiên cứu trước khi kiến tập và các điểm cộng phát biểu xây dựng bài</p>
      </div>

      {/* Quick Grading Guideline banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/10 rounded-2xl p-5 flex items-start gap-4">
        <span className="material-symbols-outlined text-primary text-[28px] shrink-0 mt-0.5">info_i</span>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-primary">Quy định tính điểm quá trình</h3>
          <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
            - <strong>Điểm chuẩn bị:</strong> Chấm theo hệ điểm 10.0 cho slide nghiên cứu tổng quan doanh nghiệp nộp trước chuyến đi.
            <br />- <strong>Điểm cộng xây dựng bài:</strong> Hỗ trợ cộng điểm trực tiếp (+0.0, +0.5, +1.0) cho các sinh viên hăng hái đóng góp ý kiến hoặc đạt điểm Kahoot cao trong buổi thảo luận chuẩn bị.
          </p>
        </div>
      </div>

      {/* Roster Grid and Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Top Header Bar */}
        <div className="p-4 bg-[#f2f5ec] border-b border-[#ecefe6] flex items-center justify-between">
          <span className="text-xs font-bold text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            Bảng nhập điểm quá trình ({localStudents.length} sinh viên)
          </span>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-6 w-1/3">Sinh viên</th>
                <th className="py-4 px-6 text-center w-1/6">Điểm chuẩn bị (0-10)</th>
                <th className="py-4 px-6 text-center w-1/4">Điểm cộng phát biểu</th>
                <th className="py-4 px-6 w-1/4">Ghi chú chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f5ec]">
              {localStudents.map((student) => (
                <tr key={student.mssv} className="hover:bg-[#f8faf1]/40 transition-colors">
                  {/* Student profile info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {student.avatar ? (
                        <div 
                          className="w-10 h-10 rounded-full bg-cover bg-center border border-slate-200 shadow-sm"
                          style={{ backgroundImage: `url('${student.avatar}')` }}
                        ></div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-slate-600 text-xs border border-slate-200">
                          {student.name.split(' ').pop()?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-on-surface">{student.name}</p>
                        <p className="text-[11px] font-mono font-bold text-on-surface-variant mt-0.5">
                          {student.mssv} <span className="text-slate-300 mx-1">|</span> {student.class}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Preparatory Grade input field */}
                  <td className="py-4 px-6 text-center">
                    <div className="relative max-w-[90px] mx-auto">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        placeholder="--"
                        value={student.preparatoryGrade !== undefined ? student.preparatoryGrade : ''}
                        onChange={(e) => handlePrepGradeChange(student.mssv, e.target.value)}
                        className="w-full px-2.5 py-2 font-mono font-bold text-sm text-center text-primary bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </td>

                  {/* Bonus Grade buttons selector */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5 max-w-[180px] mx-auto">
                      {[0.0, 0.5, 1.0].map((val) => {
                        const isActive = student.bonusGrade === val;
                        return (
                          <button
                            key={val}
                            onClick={() => handleBonusChange(student.mssv, val)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                              isActive
                                ? 'bg-secondary-container border-secondary text-on-secondary-container shadow-xs scale-105'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {val > 0 ? `+${val.toFixed(1)}` : '0'}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Note input field */}
                  <td className="py-4 px-6">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                        rate_review
                      </span>
                      <input
                        type="text"
                        value={student.notes || ''}
                        onChange={(e) => handleNotesChange(student.mssv, e.target.value)}
                        placeholder="Nhập ghi chú khen ngợi, đóng góp..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 transition-colors font-medium"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary hover:bg-[#1f5121] text-white font-bold text-sm rounded-xl shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">save_alt</span>
            Lưu điểm quá trình
          </button>
        </div>
      </div>
    </div>
  );
}
