import React, { useState } from 'react';
import { Student, Trip } from '../types';

interface AttendanceManagerProps {
  students: Student[];
  trips: Trip[];
}

export default function AttendanceManager({ students, trips }: AttendanceManagerProps) {
  // Select active trip state
  const [selectedTripId, setSelectedTripId] = useState('trip-2'); // default: Vinamilk (ongoing)
  
  // Track attendance records state
  // key format: `${tripId}_${mssv}` => 'present' | 'absent' | 'rejected'
  const [attendance, setAttendance] = useState<Record<string, { status: 'present' | 'absent' | 'rejected'; note: string }>>(() => {
    // Initial state setup
    const initial: Record<string, { status: 'present' | 'absent' | 'rejected'; note: string }> = {};
    students.forEach((s, idx) => {
      // mix of initial status values for Vinamilk
      let status: 'present' | 'absent' | 'rejected' = 'present';
      let note = '';
      if (idx === 2) {
        status = 'absent';
        note = 'Có phép, sốt cao';
      } else if (idx === 5) {
        status = 'rejected';
        note = 'Không mặc đồng phục';
      }
      initial[`trip-2_${s.mssv}`] = { status, note };
      
      // Heineken (completed) has all present
      initial[`trip-1_${s.mssv}`] = { status: 'present', note: '' };

      // Acecook (upcoming) has none marked
      initial[`trip-3_${s.mssv}`] = { status: 'present', note: '' };
    });
    return initial;
  });

  const [showToast, setShowToast] = useState(false);

  const activeTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  const handleStatusChange = (mssv: string, status: 'present' | 'absent' | 'rejected') => {
    const key = `${selectedTripId}_${mssv}`;
    setAttendance(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status
      }
    }));
  };

  const handleNoteChange = (mssv: string, note: string) => {
    const key = `${selectedTripId}_${mssv}`;
    setAttendance(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        note
      }
    }));
  };

  const handleMarkAllPresent = () => {
    setAttendance(prev => {
      const updated = { ...prev };
      students.forEach(s => {
        const key = `${selectedTripId}_${s.mssv}`;
        updated[key] = {
          ...updated[key],
          status: 'present'
        };
      });
      return updated;
    });
  };

  const handleSaveAttendance = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Stats calculation
  const totalStudents = students.length;
  const presentCount = students.filter(s => attendance[`${selectedTripId}_${s.mssv}`]?.status === 'present').length;
  const absentCount = students.filter(s => attendance[`${selectedTripId}_${s.mssv}`]?.status === 'absent').length;
  const rejectedCount = students.filter(s => attendance[`${selectedTripId}_${s.mssv}`]?.status === 'rejected').length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in select-none relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 right-8 bg-[#266528] text-white px-6 py-3.5 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-semibold animate-bounce border-2 border-white/20">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          Đã lưu kết quả điểm danh thành công!
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Điểm danh sinh viên</h1>
          <p className="text-on-surface-variant font-medium mt-1">Ghi nhận trạng thái tham gia của sinh viên tại các chuyến tham quan thực tế</p>
        </div>

        {/* Trip Picker Dropdown */}
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200">
          <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Chuyến đi:</span>
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="text-sm font-bold text-primary focus:outline-none bg-transparent cursor-pointer"
          >
            {trips.map(t => (
              <option key={t.id} value={t.id}>{t.factoryName} ({t.date})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Trip Info and Stats Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Info (8 cols) */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
          <div>
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
              activeTrip.status === 'completed' 
                ? 'bg-green-50 text-green-700' 
                : activeTrip.status === 'ongoing' 
                ? 'bg-amber-50 text-amber-700' 
                : 'bg-blue-50 text-blue-700'
            }`}>
              {activeTrip.status === 'completed' ? 'Đã hoàn thành' : activeTrip.status === 'ongoing' ? 'Đang diễn ra' : 'Sắp diễn ra'}
            </span>
            <h2 className="text-xl font-extrabold text-on-surface mt-2">{activeTrip.factoryName}</h2>
            <p className="text-xs text-on-surface-variant font-semibold mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {activeTrip.address}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold text-on-surface-variant">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-slate-400">person_pin_circle</span> Giảng viên dẫn đoàn: Nguyễn Văn A</span>
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full hidden sm:inline"></span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span> {activeTrip.date}</span>
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full hidden sm:inline"></span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span> {activeTrip.time}</span>
          </div>
        </div>

        {/* Right Stats (4 cols) */}
        <div className="lg:col-span-4 p-6 bg-slate-50/50 flex flex-col justify-center">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 text-center lg:text-left">Thống kê điểm danh</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-150 text-center shadow-xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Có mặt</p>
              <p className="text-lg font-black text-[#266528] mt-1">{presentCount}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-150 text-center shadow-xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Vắng</p>
              <p className="text-lg font-black text-[#8f3d5e] mt-1">{absentCount}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-150 text-center shadow-xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Từ chối</p>
              <p className="text-lg font-black text-amber-600 mt-1">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roster & Grid Attendance */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Top Actions */}
        <div className="p-4 bg-[#f2f5ec] border-b border-[#ecefe6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <span className="text-xs font-bold text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">group</span>
            Danh sách điểm danh ({totalStudents} sinh viên)
          </span>

          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-white hover:bg-[#f8faf1] border border-slate-200 text-primary hover:text-[#205522] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">select_all</span>
            Đánh dấu tất cả có mặt
          </button>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-on-surface-variant font-bold text-xs uppercase tracking-wider select-none border-b border-slate-100">
                <th className="py-4 px-6 w-1/3">Sinh viên</th>
                <th className="py-4 px-6 text-center w-1/3">Trạng thái điểm danh</th>
                <th className="py-4 px-6 w-1/3">Ghi chú chuyến đi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f5ec]">
              {students.map((student) => {
                const record = attendance[`${selectedTripId}_${student.mssv}`] || { status: 'present', note: '' };

                return (
                  <tr key={student.mssv} className="hover:bg-[#f8faf1]/50 transition-colors">
                    {/* Student Identity */}
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

                    {/* Attendance Status Picker */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 max-w-[280px] mx-auto">
                        {/* Có mặt */}
                        <button
                          onClick={() => handleStatusChange(student.mssv, 'present')}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                            record.status === 'present'
                              ? 'bg-[#266528] border-[#266528] text-white shadow-sm scale-105'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-[#266528]/5 hover:text-[#266528]'
                          }`}
                        >
                          Có mặt
                        </button>

                        {/* Vắng */}
                        <button
                          onClick={() => handleStatusChange(student.mssv, 'absent')}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                            record.status === 'absent'
                              ? 'bg-red-600 border-red-600 text-white shadow-sm scale-105'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          Vắng
                        </button>

                        {/* Từ chối */}
                        <button
                          onClick={() => handleStatusChange(student.mssv, 'rejected')}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                            record.status === 'rejected'
                              ? 'bg-amber-600 border-amber-600 text-white shadow-sm scale-105'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                          }`}
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>

                    {/* Note input field */}
                    <td className="py-4 px-6">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                          edit_note
                        </span>
                        <input
                          type="text"
                          value={record.note}
                          onChange={(e) => handleNoteChange(student.mssv, e.target.value)}
                          placeholder="Nhập lý do vắng, đi trễ, trang phục..."
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 transition-colors font-medium"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSaveAttendance}
            className="px-6 py-2.5 bg-primary hover:bg-[#1f5121] text-white font-bold text-sm rounded-xl shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">save_alt</span>
            Lưu điểm danh chuyến đi
          </button>
        </div>
      </div>
    </div>
  );
}
