import React, { useState } from 'react';
import { Lock, Unlock, Search, Calendar, Award, CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const initialMockScores = [
  { 
    mssv: '2001200123', 
    name: 'Nguyễn Văn Nam', 
    class: '14ĐHTP01', 
    prepGrade: 8.0, 
    attendance: '3/3', 
    reportGrade: 8.5, 
    presentationGrade: 9.0, 
    bonusGrade: 0.5, 
    finalGrade: 8.8, 
    status: 'Đạt' 
  },
  { 
    mssv: '2001200124', 
    name: 'Trần Thị Thu Thủy', 
    class: '14ĐHTP01', 
    prepGrade: 7.5, 
    attendance: '3/3', 
    reportGrade: 8.0, 
    presentationGrade: 8.0, 
    bonusGrade: 1.0, 
    finalGrade: 8.1, 
    status: 'Đạt' 
  },
  { 
    mssv: '2001200125', 
    name: 'Phạm Hữu Đạt', 
    class: '14ĐHTP02', 
    prepGrade: 4.0, 
    attendance: '2/3', 
    reportGrade: 5.0, 
    presentationGrade: 4.5, 
    bonusGrade: 0.0, 
    finalGrade: 4.5, 
    status: 'Không đạt' 
  },
  { 
    mssv: '2001200126', 
    name: 'Lê Hoài Bảo', 
    class: '14ĐHTP02', 
    prepGrade: 9.0, 
    attendance: '3/3', 
    reportGrade: 8.0, 
    presentationGrade: 8.5, 
    bonusGrade: 0.5, 
    finalGrade: 8.5, 
    status: 'Đạt' 
  },
  { 
    mssv: '2001200127', 
    name: 'Đặng Minh Khang', 
    class: '14ĐHTP03', 
    prepGrade: 6.0, 
    attendance: '2/3', 
    reportGrade: 5.0, 
    presentationGrade: 0.0, 
    bonusGrade: 0.0, 
    finalGrade: 3.8, 
    status: 'Không đạt' 
  },
  { 
    mssv: '2001200128', 
    name: 'Vũ Thị Minh Ngọc', 
    class: '14ĐHTP03', 
    prepGrade: 8.0, 
    attendance: '2/3', 
    reportGrade: 0.0, 
    presentationGrade: 0.0, 
    bonusGrade: 0.0, 
    finalGrade: 2.4, 
    status: 'Chưa hoàn thành' 
  }
];

export default function KetQuaKienTap_MaTranDiem_Khoa() {
  const [scores, setScores] = useState(initialMockScores);
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('Tất cả');
  const [classFilter, setClassFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [isLocked, setIsLocked] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const getStatusBadgeClass = (status) => {
    if (status === 'Đạt') return 'bg-[#89B449] text-white'; // Secondary green
    if (status === 'Không đạt') return 'bg-[#E68A8C] text-white'; // Danger coral
    return 'bg-[#DBD468] text-slate-805'; // Warning yellow
  };

  const handleToggleLock = () => {
    if (isLocked) {
      if (confirm("Mở khóa điểm học phần của học kỳ này?")) {
        setIsLocked(false);
      }
    } else {
      if (confirm("Khóa điểm học phần của học kỳ này? Cán bộ/Giảng viên sẽ không thể sửa đổi điểm.")) {
        setIsLocked(true);
      }
    }
  };

  const filteredScores = scores.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.mssv.includes(searchTerm);
    const matchesClass = classFilter === 'Tất cả' || student.class === classFilter;
    const matchesStatus = statusFilter === 'Tất cả' || student.status === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Title & Lock Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Kết quả kiến tập - Ma trận điểm
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Xem, giám sát và quản lý ma trận điểm tổng kết học phần kiến tập của sinh viên các lớp.
          </p>
        </div>
        <button
          onClick={handleToggleLock}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm self-start sm:self-center ${
            isLocked
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-white border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/5'
          }`}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span>{isLocked ? 'Khóa điểm học phần (Đã khóa)' : 'Khóa điểm học phần'}</span>
        </button>
      </div>

      {/* Filter Bar Card */}
      <div className="bg-white rounded-2xl border border-[#E7E0C4] p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Lịch kiến tập */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Lịch kiến tập
            </label>
            <select
              value={scheduleFilter}
              onChange={e => setScheduleFilter(e.target.value)}
              className="w-full bg-[#E7E0C4]/10 border border-[#E7E0C4] rounded-xl px-3 py-2.5 text-sm text-slate-700 font-bold hover:bg-[#E7E0C4]/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            >
              <option value="Tất cả">Tất cả lịch kiến tập</option>
              <option value="HK1 2026-2027">Lịch HK1 2026-2027</option>
              <option value="HK2 2026-2027">Lịch HK2 2026-2027</option>
            </select>
          </div>

          {/* Nhóm lớp */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Nhóm lớp
            </label>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="w-full bg-[#E7E0C4]/10 border border-[#E7E0C4] rounded-xl px-3 py-2.5 text-sm text-slate-700 font-bold hover:bg-[#E7E0C4]/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            >
              <option value="Tất cả">Tất cả nhóm lớp</option>
              <option value="14ĐHTP01">14ĐHTP01</option>
              <option value="14ĐHTP02">14ĐHTP02</option>
              <option value="14ĐHTP03">14ĐHTP03</option>
            </select>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-[#E7E0C4]/10 border border-[#E7E0C4] rounded-xl px-3 py-2.5 text-sm text-slate-700 font-bold hover:bg-[#E7E0C4]/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option value="Đạt">Đạt</option>
              <option value="Không đạt">Không đạt</option>
              <option value="Chưa hoàn thành">Chưa hoàn thành</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Tìm kiếm
            </label>
            <div className="relative flex items-center bg-[#E7E0C4]/10 rounded-xl border border-[#E7E0C4] focus-within:ring-2 focus-within:ring-[#407F3E]/20 transition-all">
              <Search className="absolute left-4 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm theo MSSV, tên..."
                className="w-full bg-transparent text-sm text-slate-800 pl-11 pr-4 py-2.5 outline-none placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grade Matrix Table */}
      <div className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-[#E7E0C4]">
              <tr>
                <th className="px-5 py-4 font-bold border-r border-[#E7E0C4]/40">MSSV</th>
                <th className="px-5 py-4 font-bold border-r border-[#E7E0C4]/40">Họ tên</th>
                <th className="px-4 py-4 font-bold border-r border-[#E7E0C4]/40">Lớp</th>
                <th className="px-3 py-4 font-bold text-center border-r border-[#E7E0C4]/40">Điểm CB (10)</th>
                <th className="px-3 py-4 font-bold text-center border-r border-[#E7E0C4]/40">Chuyên cần</th>
                <th className="px-3 py-4 font-bold text-center border-r border-[#E7E0C4]/40">Điểm bài TH</th>
                <th className="px-3 py-4 font-bold text-center border-r border-[#E7E0C4]/40">Điểm báo cáo TQ</th>
                <th className="px-3 py-4 font-bold text-center border-r border-[#E7E0C4]/40">Điểm cộng</th>
                <th className="px-4 py-4 font-bold text-center border-r border-[#E7E0C4]/40 text-[#407F3E]">Tổng kết</th>
                <th className="px-4 py-4 font-bold">Trạng thái</th>
                <th className="px-4 py-4 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0C4]/40 text-slate-800 font-medium">
              {filteredScores.map((student) => (
                <tr key={student.mssv} className="hover:bg-[#E7E0C4]/10 transition-colors duration-200">
                  <td className="px-5 py-3.5 font-bold font-mono text-[#407F3E] border-r border-[#E7E0C4]/40">{student.mssv}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-700 border-r border-[#E7E0C4]/40">{student.name}</td>
                  <td className="px-4 py-3.5 text-slate-500 border-r border-[#E7E0C4]/40">{student.class}</td>
                  <td className="px-3 py-3.5 text-center font-mono text-slate-600 border-r border-[#E7E0C4]/40">{student.prepGrade.toFixed(1)}</td>
                  <td className="px-3 py-3.5 text-center font-bold text-[#89B449] border-r border-[#E7E0C4]/40">{student.attendance}</td>
                  <td className="px-3 py-3.5 text-center font-mono text-slate-600 border-r border-[#E7E0C4]/40">{student.reportGrade.toFixed(1)}</td>
                  <td className="px-3 py-3.5 text-center font-mono text-slate-600 border-r border-[#E7E0C4]/40">{student.presentationGrade.toFixed(1)}</td>
                  <td className="px-3 py-3.5 text-center font-mono text-slate-600 border-r border-[#E7E0C4]/40">+{student.bonusGrade.toFixed(1)}</td>
                  <td className="px-4 py-3.5 text-center font-black font-mono text-sm border-r border-[#E7E0C4]/40 text-[#407F3E] bg-[#407F3E]/5">
                    {student.finalGrade.toFixed(1)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${getStatusBadgeClass(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className="px-3 py-1.5 border border-[#E7E0C4] text-slate-650 hover:text-[#407F3E] hover:bg-[#E7E0C4]/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
              {filteredScores.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-400 font-bold text-sm">
                    Không tìm thấy dữ liệu sinh viên nào khớp với bộ lọc!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#E7E0C4] bg-[#E7E0C4]/30 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-[#407F3E]" />
                <span>Chi tiết điểm sinh viên</span>
              </h2>
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="text-slate-450 hover:text-slate-800 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm font-semibold text-slate-650">
              <div className="flex items-center gap-3 bg-[#E7E0C4]/15 p-3 rounded-xl border border-[#E7E0C4]/40">
                <div className="w-10 h-10 rounded-full bg-[#407F3E] flex items-center justify-center text-white font-bold text-base shadow-sm">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-slate-800 font-bold text-base leading-tight">{selectedStudent.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">MSSV: {selectedStudent.mssv} | Lớp: {selectedStudent.class}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Điểm chuẩn bị:</span>
                  <span className="text-slate-800 font-bold font-mono">{selectedStudent.prepGrade.toFixed(1)} / 10.0</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Điểm chuyên cần:</span>
                  <span className="text-[#89B449] font-bold">{selectedStudent.attendance} chuyến</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Điểm bài thu hoạch:</span>
                  <span className="text-slate-800 font-bold font-mono">{selectedStudent.reportGrade.toFixed(1)} / 10.0</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Điểm báo cáo TQNM:</span>
                  <span className="text-slate-800 font-bold font-mono">{selectedStudent.presentationGrade.toFixed(1)} / 10.0</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Điểm cộng chuyên cần/nỗ lực:</span>
                  <span className="text-slate-800 font-bold font-mono">+{selectedStudent.bonusGrade.toFixed(1)}</span>
                </div>
                <div className="flex justify-between pt-1.5 text-base">
                  <span className="text-[#407F3E] font-extrabold">Điểm tổng kết học phần:</span>
                  <span className="text-[#407F3E] font-black font-mono">{selectedStudent.finalGrade.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-[#E7E0C4] flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="px-5 py-2 bg-slate-750 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
