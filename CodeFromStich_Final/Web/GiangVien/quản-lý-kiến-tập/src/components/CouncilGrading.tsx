import React, { useState } from 'react';
import { CouncilMeeting, Student } from '../types';

interface CouncilGradingProps {
  meetings: CouncilMeeting[];
  students: Student[];
}

export default function CouncilGrading({ meetings, students }: CouncilGradingProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'grading'>('list');
  const [selectedMeeting, setSelectedMeeting] = useState<CouncilMeeting | null>(meetings[0]);
  const [selectedStudentMssv, setSelectedStudentMssv] = useState<string>('20123456');

  // Council grading states
  const [score1, setScore1] = useState('8.0');
  const [score2, setScore2] = useState('9.0');
  const [score3, setScore3] = useState('8.5');
  const [councilNotes, setCouncilNotes] = useState(
    'Sinh viên trả lời lưu loát các câu hỏi phản biện của hội đồng về quy trình chiết rót tự động. Bản slide thuyết trình thiết kế trực quan.'
  );

  const [studentGrades, setStudentGrades] = useState<Record<string, { avg: number; completed: boolean }>>({
    '20123456': { avg: 8.5, completed: true },
    '20110002': { avg: 0, completed: false },
    '20110003': { avg: 0, completed: false },
    '20110004': { avg: 7.5, completed: true }
  });

  const [showToast, setShowToast] = useState(false);

  const handleStartGrading = (meeting: CouncilMeeting) => {
    setSelectedMeeting(meeting);
    setActiveTab('grading');
  };

  const activeStudent = students.find(s => s.mssv === selectedStudentMssv) || students[0];

  const handleSaveCouncilGrade = () => {
    const s1 = parseFloat(score1) || 0;
    const s2 = parseFloat(score2) || 0;
    const s3 = parseFloat(score3) || 0;
    const finalAvg = Math.round(((s1 * 0.4) + (s2 * 0.3) + (s3 * 0.3)) * 10) / 10;

    setStudentGrades(prev => ({
      ...prev,
      [selectedStudentMssv]: {
        avg: finalAvg,
        completed: true
      }
    }));

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in select-none relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 right-8 bg-[#266528] text-white px-6 py-3.5 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-semibold animate-bounce border-2 border-white/20">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          Đã lưu điểm hội đồng cho {activeStudent.name}!
        </div>
      )}

      {/* Header section with tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Hội đồng bảo cáo TQNM</h1>
          <p className="text-on-surface-variant font-medium mt-1">Nơi hội đồng chuyên môn đánh giá đồ án thu hoạch và báo cáo thực tế của sinh viên</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#ecefe6] rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-[#266528] text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-[#e6e9e0]'
            }`}
          >
            Danh sách buổi họp
          </button>
          <button
            onClick={() => setActiveTab('grading')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'grading'
                ? 'bg-[#266528] text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-[#e6e9e0]'
            }`}
          >
            Màn hình chấm điểm
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        /* List Tab View (Screen 7) */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-on-surface-variant mb-4">Các hội đồng được phân công</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <div 
                  key={meeting.id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border transition-all relative overflow-hidden flex flex-col justify-between h-[230px] ${
                    meeting.status === 'ongoing'
                      ? 'border-[#266528] ring-1 ring-[#266528]/30 shadow-md'
                      : 'border-slate-150'
                  }`}
                >
                  <div>
                    {/* Badge */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        meeting.status === 'ongoing'
                          ? 'bg-green-50 text-green-700'
                          : meeting.status === 'upcoming'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {meeting.status === 'ongoing' ? 'Đang diễn ra' : meeting.status === 'upcoming' ? 'Sắp diễn ra' : 'Đã hoàn thành'}
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {meeting.room}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-on-surface leading-tight mb-2">
                      {meeting.name}
                    </h3>

                    <div className="space-y-1.5 text-xs font-medium text-on-surface-variant">
                      <p className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                        Chủ tịch: <strong className="text-on-surface">{meeting.chairman}</strong>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                        Thời gian: <span>{meeting.date} tại {meeting.time}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">groups</span>
                        Sinh viên báo cáo: <span className="font-bold">{meeting.studentCount} sinh viên</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    {meeting.status === 'ongoing' ? (
                      <button
                        onClick={() => handleStartGrading(meeting)}
                        className="w-full py-2.5 bg-[#266528] hover:bg-[#1f5121] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">co_present</span>
                        Vào chấm điểm ngay
                      </button>
                    ) : meeting.status === 'upcoming' ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-100 border border-slate-200 text-slate-400 font-extrabold text-xs rounded-xl cursor-not-allowed"
                      >
                        Chưa đến giờ
                      </button>
                    ) : (
                      <button
                        onClick={() => { setSelectedMeeting(meeting); setActiveTab('grading'); }}
                        className="w-full py-2.5 border border-[#266528] text-[#266528] hover:bg-[#266528]/5 font-extrabold text-xs rounded-xl transition-all"
                      >
                        Xem điểm đã chấm
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Workspace Tab View (Screen 8) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel: Students List inside Council (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[650px]">
            <div className="p-4 bg-slate-50 border-b border-slate-150">
              <h3 className="font-extrabold text-xs text-on-surface-variant uppercase tracking-wider">
                Hội đồng sinh viên ({selectedMeeting?.name || 'Hội đồng số 1'})
              </h3>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase">Lớp báo cáo: K46_DULICH_01</p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {students.slice(0, 5).map((student) => {
                const isSelected = student.mssv === selectedStudentMssv;
                const statusInfo = studentGrades[student.mssv] || { avg: 0, completed: false };

                return (
                  <div
                    key={student.mssv}
                    onClick={() => {
                      setSelectedStudentMssv(student.mssv);
                      // load default scores
                      if (student.mssv === '20123456') {
                        setScore1('8.0'); setScore2('9.0'); setScore3('8.5');
                      } else {
                        setScore1('7.5'); setScore2('8.0'); setScore3('8.0');
                      }
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#266528]/10 border-2 border-[#266528] shadow-xs'
                        : 'hover:bg-slate-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">
                        {student.name.split(' ').pop()?.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-on-surface truncate">{student.name}</p>
                        <p className="text-[10px] font-mono font-medium text-on-surface-variant mt-0.5">{student.mssv}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {statusInfo.completed ? (
                        <div className="flex flex-col items-end">
                          <span className="px-2 py-0.5 bg-green-50 text-[#266528] rounded font-bold text-[9px] uppercase border border-green-200">Đã chấm</span>
                          <span className="text-xs font-mono font-bold text-primary mt-1">{statusInfo.avg.toFixed(1)} đ</span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-[#7c7515] rounded font-bold text-[9px] uppercase border border-amber-200">Chờ chấm</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Evaluation form (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6 flex flex-col h-[650px] justify-between">
            <div>
              {/* Header */}
              <div className="border-b border-slate-150 pb-4">
                <div className="text-xs font-semibold text-on-surface-variant mb-1 flex items-center gap-1">
                  <span>Hội đồng: {selectedMeeting?.name}</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-on-surface">Phiếu đánh giá</span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">{activeStudent.name}</h2>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">MSSV: <strong className="font-mono text-on-surface">{activeStudent.mssv}</strong> <span className="text-slate-300 mx-1">|</span> Lớp: <strong className="font-mono text-on-surface">{activeStudent.class}</strong></p>
                  </div>
                  {studentGrades[activeStudent.mssv]?.completed && (
                    <div className="text-right bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                      <p className="text-[10px] font-bold text-[#266528] uppercase">Điểm trung bình</p>
                      <p className="text-xl font-black text-primary font-mono">{studentGrades[activeStudent.mssv].avg.toFixed(1)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Content Scrollable */}
              <div className="py-4 space-y-5 overflow-y-auto max-h-[380px] pr-2">
                {/* Score 1 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-dashed border-slate-100 pb-3">
                  <div className="md:col-span-8">
                    <h4 className="font-bold text-xs text-on-surface">Tiêu chí 1: Chất lượng thuyết trình &amp; Slide (Hệ số 40%)</h4>
                    <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-0.5">Trình bày lưu loát, bố cục khoa học, thời lượng chuẩn.</p>
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    <div className="relative max-w-[120px]">
                      <input 
                        type="number" 
                        min="0" max="10" step="0.5"
                        value={score1}
                        onChange={(e) => setScore1(e.target.value)}
                        className="w-full px-3 py-1.5 font-mono font-bold text-sm text-center text-primary bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ 10</span>
                    </div>
                  </div>
                </div>

                {/* Score 2 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-dashed border-slate-100 pb-3">
                  <div className="md:col-span-8">
                    <h4 className="font-bold text-xs text-on-surface">Tiêu chí 2: Trả lời câu hỏi phản biện hội đồng (Hệ số 30%)</h4>
                    <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-0.5">Nắm vững quy trình kỹ thuật, giải thích logic dòng chất chảy.</p>
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    <div className="relative max-w-[120px]">
                      <input 
                        type="number" 
                        min="0" max="10" step="0.5"
                        value={score2}
                        onChange={(e) => setScore2(e.target.value)}
                        className="w-full px-3 py-1.5 font-mono font-bold text-sm text-center text-primary bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ 10</span>
                    </div>
                  </div>
                </div>

                {/* Score 3 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-dashed border-slate-100 pb-3">
                  <div className="md:col-span-8">
                    <h4 className="font-bold text-xs text-on-surface">Tiêu chí 3: Bản thu hoạch nhật ký thực địa (Hệ số 30%)</h4>
                    <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-0.5">Nhật ký chi tiết, đầy đủ hình minh họa sơ đồ thực tế.</p>
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    <div className="relative max-w-[120px]">
                      <input 
                        type="number" 
                        min="0" max="10" step="0.5"
                        value={score3}
                        onChange={(e) => setScore3(e.target.value)}
                        className="w-full px-3 py-1.5 font-mono font-bold text-sm text-center text-primary bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ 10</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ý kiến kết luận của Hội đồng</label>
                  <textarea
                    rows={3}
                    value={councilNotes}
                    onChange={(e) => setCouncilNotes(e.target.value)}
                    placeholder="Nhập biên bản họp/góp ý của hội đồng dành cho sinh viên..."
                    className="w-full p-3 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary/50 transition-all font-medium leading-relaxed resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Form Footer Buttons */}
            <div className="pt-4 border-t border-slate-150 flex justify-end gap-3">
              <button
                onClick={() => setActiveTab('list')}
                className="px-5 py-2.5 text-xs text-on-surface-variant font-extrabold hover:text-on-surface border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Quay lại danh sách
              </button>
              <button
                onClick={handleSaveCouncilGrade}
                className="px-6 py-2.5 bg-primary hover:bg-[#1a4b1c] text-white font-extrabold text-xs rounded-xl shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                Lưu điểm Hội đồng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
