import React, { useState } from 'react';
import { Student } from '../types';

interface StudentListGradeProps {
  students: Student[];
  onViewChange: (view: string) => void;
  onSelectStudentForGrading: (mssv: string) => void;
}

export default function StudentListGrade({ 
  students, 
  onViewChange, 
  onSelectStudentForGrading 
}: StudentListGradeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Stats
  const completedCount = 30; // matching screenshot
  const pendingCount = 10;
  const noneCount = 5;

  // Filter students based on UI selections
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.mssv.includes(searchTerm);
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    
    let matchesStatus = true;
    if (selectedStatus === 'completed') {
      matchesStatus = student.gradeStatus === 'completed';
    } else if (selectedStatus === 'pending') {
      matchesStatus = student.gradeStatus === 'pending';
    } else if (selectedStatus === 'none') {
      matchesStatus = student.gradeStatus === 'none';
    }

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Extract unique classes for filter
  const classes = Array.from(new Set(students.map(s => s.class)));

  const handleActionClick = (mssv: string) => {
    onSelectStudentForGrading(mssv);
    onViewChange('cham-bai-detail');
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Sinh viên hướng dẫn</h1>
        <p className="text-on-surface-variant font-medium mt-1">Danh sách 45 sinh viên thầy/cô phụ trách hướng dẫn kiến tập học kỳ này</p>
      </div>

      {/* Roster Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#266528] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px] fill-current">check_circle</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Đã chấm đủ</p>
              <p className="text-[#191d17] text-3xl font-extrabold mt-1">{completedCount}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#266528] bg-green-100/60 px-2.5 py-1 rounded-full">30 SV</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#DBD468] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">pending</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Chờ chấm bài</p>
              <p className="text-[#191d17] text-3xl font-extrabold mt-1">{pendingCount}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#7c7515] bg-[#DBD468]/30 px-2.5 py-1 rounded-full">10 SV</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">hourglass_empty</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Chưa nộp bài</p>
              <p className="text-[#191d17] text-3xl font-extrabold mt-1">{noneCount}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">5 SV</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mssv..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-[#f8faf1] border border-slate-200 rounded-xl focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Class select */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-2.5 text-sm bg-[#f8faf1] border border-slate-200 rounded-xl focus:outline-none font-medium text-on-surface-variant"
          >
            <option value="all">Tất cả lớp</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 text-sm bg-[#f8faf1] border border-slate-200 rounded-xl focus:outline-none font-medium text-on-surface-variant"
          >
            <option value="all">Tất cả bài nộp</option>
            <option value="completed">Đã chấm đủ</option>
            <option value="pending">Chờ chấm bài</option>
            <option value="none">Chưa nộp bài</option>
          </select>
        </div>
      </div>

      {/* Main Student Roster Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f5ec] text-on-surface-variant font-bold text-xs uppercase tracking-wider select-none border-b border-[#ecefe6]">
                <th className="py-4 px-6">Họ và tên</th>
                <th className="py-4 px-6">Lớp</th>
                <th className="py-4 px-6 text-center">Số chuyến tham gia</th>
                <th className="py-4 px-6 text-center">Điểm chuẩn bị</th>
                <th className="py-4 px-6 text-center">Trạng thái bài nộp</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f5ec]">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.mssv} className="hover:bg-[#f8faf1]/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {student.avatar ? (
                          <div 
                            className="w-10 h-10 rounded-full bg-cover bg-center border border-slate-200 shadow-sm"
                            style={{ backgroundImage: `url('${student.avatar}')` }}
                          ></div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-slate-600 text-sm border border-slate-200">
                            {student.name.split(' ').pop()?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-on-surface">{student.name}</p>
                          <p className="text-[11px] font-mono font-medium text-on-surface-variant mt-0.5">{student.mssv}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-mono font-bold text-on-surface-variant bg-slate-100 px-2.5 py-1 rounded">
                        {student.class}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        student.completedTrips === student.totalTrips 
                          ? 'bg-green-50 text-[#266528]' 
                          : 'bg-amber-50 text-[#7c7515]'
                      }`}>
                        {student.completedTrips}/{student.totalTrips} chuyến
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-sm">
                      {student.preparatoryGrade !== undefined ? (
                        <span className="text-primary">{student.preparatoryGrade.toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${
                        student.gradeStatus === 'completed'
                          ? 'bg-green-50 border-green-200 text-[#266528]'
                          : student.gradeStatus === 'pending'
                          ? 'bg-amber-50 border-amber-200 text-[#7c7515]'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {student.gradeStatus === 'completed' 
                          ? 'Đã chấm đủ' 
                          : student.gradeStatus === 'pending' 
                          ? 'Chờ chấm bài' 
                          : 'Chưa nộp bài'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {student.gradeStatus === 'none' ? (
                        <button 
                          disabled 
                          className="px-3.5 py-2 font-bold text-xs bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed select-none border border-slate-200"
                        >
                          Nhắc nộp bài
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActionClick(student.mssv)}
                          className={`px-3.5 py-2 font-bold text-xs rounded-lg shadow-sm transition-all inline-flex items-center gap-1 ${
                            student.gradeStatus === 'completed'
                              ? 'border border-[#266528] text-[#266528] hover:bg-[#266528]/5'
                              : 'bg-primary text-white hover:bg-[#205522] hover:-translate-y-0.5'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">edit_document</span>
                          {student.gradeStatus === 'completed' ? 'Xem bài & sửa' : 'Xem & chấm'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant font-medium">
                    Không tìm thấy sinh viên phù hợp. Vui lòng thử lại!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
