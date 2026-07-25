import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Download, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HelpCircle,
  Sparkles,
  FileSpreadsheet,
  Edit
} from 'lucide-react';
import { ResultRecord } from '../types';

interface InternshipResultsViewProps {
  results: ResultRecord[];
  setResults: React.Dispatch<React.SetStateAction<ResultRecord[]>>;
}

export default function InternshipResultsView({ results, setResults }: InternshipResultsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [isLocked, setIsLocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<ResultRecord | null>(null);

  // Form states for temporary score editing
  const [cpT, setCpT] = useState<number | '-'>('-');
  const [aceT, setAceT] = useState<number | '-'>('-');
  const [ajiT, setAjiT] = useState<number | '-'>('-');

  const filteredResults = results.filter(rec => {
    const matchesSearch = rec.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rec.mssv.includes(searchTerm);
    const matchesStatus = statusFilter === 'Tất cả' || rec.resultStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLockGrades = () => {
    setIsLocked(true);
    setShowLockModal(false);
    alert('Đã khóa bảng điểm đợt này thành công! Hệ thống đã gửi báo cáo đồng bộ điểm trực tiếp sang cổng dữ liệu Portal đào tạo.');
  };

  const handleUnlockGrades = () => {
    if (confirm('Bạn có chắc chắn muốn mở khóa bảng điểm này? Hành động này sẽ cho phép giảng viên chỉnh sửa lại điểm số.')) {
      setIsLocked(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đạt':
        return 'bg-secondary-container-green text-on-secondary-container-green border border-secondary';
      case 'Không đạt':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'Đang thực hiện':
        return 'bg-yellow-50 text-amber-700 border border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đạt':
        return <CheckCircle className="w-3.5 h-3.5 text-[#446900]" />;
      case 'Không đạt':
        return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      case 'Đang thực hiện':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const handleEditGradesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setResults(prev => prev.map(rec => {
      if (rec.mssv === editingStudent.mssv) {
        // Calculate new finalGpa
        const cpVal = cpT === '-' ? 0 : cpT;
        const aceVal = aceT === '-' ? 0 : aceT;
        const ajiVal = ajiT === '-' ? 0 : ajiT;
        
        let validCount = 0;
        let sum = 0;
        if (cpT !== '-') { sum += cpVal; validCount++; }
        if (aceT !== '-') { sum += aceVal; validCount++; }
        if (ajiT !== '-') { sum += ajiVal; validCount++; }

        const calculatedGpa = validCount > 0 ? parseFloat((sum / validCount).toFixed(1)) : '-';
        const finalStatus = calculatedGpa === '-' 
          ? 'Đang thực hiện' 
          : calculatedGpa >= 5.0 
            ? 'Đạt' 
            : 'Không đạt';

        return {
          ...rec,
          cp: { ...rec.cp, t: cpT },
          acecook: { ...rec.acecook, t: aceT },
          ajinomoto: { ...rec.ajinomoto, t: ajiT },
          finalGpa: calculatedGpa,
          resultStatus: finalStatus
        };
      }
      return rec;
    }));

    setEditingStudent(null);
    alert('Đã cập nhật điểm số kiến tập của sinh viên thành công!');
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-container tracking-tight">
            Kết quả kiến tập đợt này
          </h1>
          <p className="text-sm text-slate-500">
            Bảng tổng hợp điểm số đánh giá từ các nhà máy tham quan thực tế và kết luận điều kiện đạt.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {isLocked ? (
            <button
              onClick={handleUnlockGrades}
              className="flex items-center gap-2 px-5 py-2.5 bg-yellow-50 border border-yellow-300 hover:bg-yellow-100 text-amber-800 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Unlock className="w-4.5 h-4.5 text-amber-600" />
              <span>Mở khóa bảng điểm</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLockModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer transform hover:-translate-y-0.5"
            >
              <Lock className="w-4.5 h-4.5" />
              <span>Khóa điểm đợt này</span>
            </button>
          )}

          <button
            onClick={() => alert('Đang kết xuất bảng điểm kiến tập sang định dạng CSV...')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-[#407F3E] text-slate-700 hover:text-primary-container rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4.5 h-4.5" />
            <span>Kết xuất bảng điểm (.csv)</span>
          </button>
        </div>
      </div>

      {/* Lock Info Notification Banner */}
      {isLocked && (
        <div className="bg-[#446900]/10 border border-[#446900]/30 text-slate-800 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <Lock className="w-5 h-5 text-[#446900] mt-0.5 shrink-0" />
          <div>
            <p className="font-extrabold text-[#446900] text-sm">BẢNG ĐIỂM ĐÃ ĐƯỢC KHÓA AN TOÀN</p>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Toàn bộ điểm số trong đợt này đã bị đóng băng. Giảng viên và cán bộ không thể thay đổi thông số trực tiếp ngoại trừ khi yêu cầu phúc khảo/mở khóa được phê duyệt bởi Ban Chủ nhiệm Khoa.
            </p>
          </div>
        </div>
      )}

      {/* Filter Roster Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sinh viên theo tên hoặc mã số sinh viên (MSSV)..."
            className="w-full bg-slate-50 text-slate-800 text-sm pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#407F3E]/20 outline-none font-medium"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 text-slate-700 text-sm px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer outline-none font-medium"
          >
            <option value="Tất cả">Trạng thái: Tất cả</option>
            <option value="Đạt">Đạt kết quả</option>
            <option value="Không đạt">Không đạt</option>
            <option value="Đang thực hiện">Đang thực hiện</option>
            <option value="Chưa hoàn thành">Chưa hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Grading Multi-column Sheet */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center whitespace-nowrap border-collapse">
            <thead>
              {/* Main headers */}
              <tr className="bg-[#E7E0C4] text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <th rowSpan={2} className="px-5 py-4 text-left border-r border-slate-200/50">MSSV</th>
                <th rowSpan={2} className="px-5 py-4 text-left border-r border-slate-200/50">Họ tên sinh viên</th>
                <th colSpan={4} className="px-4 py-2 border-r border-slate-200/50">Nhà máy CP</th>
                <th colSpan={4} className="px-4 py-2 border-r border-slate-200/50">Nhà máy Acecook</th>
                <th colSpan={4} className="px-4 py-2 border-r border-slate-200/50">Nhà máy Ajinomoto</th>
                <th rowSpan={2} className="px-4 py-4 font-black text-primary-container border-r border-slate-200/50">Điểm tổng kết</th>
                <th rowSpan={2} className="px-5 py-4">Kết luận</th>
                {!isLocked && <th rowSpan={2} className="px-4 py-4 w-12 text-right"></th>}
              </tr>
              {/* Sub headers (CB, TH, BC, T) */}
              <tr className="bg-slate-50 text-slate-500 font-bold text-[10px] border-b border-slate-200">
                {/* CP sub */}
                <th className="px-2 py-2">CB</th>
                <th className="px-2 py-2">TH</th>
                <th className="px-2 py-2">BC</th>
                <th className="px-2 py-2 font-bold text-slate-700 border-r border-slate-200/50">T</th>
                {/* Ace sub */}
                <th className="px-2 py-2">CB</th>
                <th className="px-2 py-2">TH</th>
                <th className="px-2 py-2">BC</th>
                <th className="px-2 py-2 font-bold text-slate-700 border-r border-slate-200/50">T</th>
                {/* Aji sub */}
                <th className="px-2 py-2">CB</th>
                <th className="px-2 py-2">TH</th>
                <th className="px-2 py-2">BC</th>
                <th className="px-2 py-2 font-bold text-slate-700 border-r border-slate-200/50">T</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-semibold">
              {filteredResults.map(rec => (
                <tr key={rec.mssv} className="hover:bg-slate-50/50 transition-colors">
                  {/* Student IDs */}
                  <td className="px-5 py-3.5 text-left font-mono font-bold text-[#407F3E] border-r border-slate-100">
                    {rec.mssv}
                  </td>
                  {/* Name */}
                  <td className="px-5 py-3.5 text-left font-bold text-slate-800 border-r border-slate-100">
                    {rec.fullname}
                  </td>

                  {/* CP subscores */}
                  <td className="px-2 py-3.5 text-slate-400 font-mono text-xs">{rec.cp.cb}</td>
                  <td className="px-2 py-3.5 text-slate-400 font-mono text-xs">{rec.cp.th}</td>
                  <td className="px-2 py-3.5 text-slate-400 font-mono text-xs">{rec.cp.bc}</td>
                  <td className="px-2 py-3.5 font-bold text-slate-700 font-mono text-xs border-r border-slate-100 bg-slate-50/30">
                    {rec.cp.t}
                  </td>

                  {/* Acecook subscores */}
                  <td className="px-2 py-3.5 text-slate-400 font-mono text-xs">{rec.acecook.cb}</td>
                  <td className="px-2 py-3.5 text-slate-400 font-mono text-xs">{rec.acecook.th}</td>
                  <td className="px-2 py-3.5 text-slate-400 font-mono text-xs">{rec.acecook.bc}</td>
                  <td className="px-2 py-3.5 font-bold text-slate-700 font-mono text-xs border-r border-slate-100 bg-slate-50/30">
                    {rec.acecook.t}
                  </td>

                  {/* Ajinomoto subscores */}
                  <td className="px-2 py-3.5 text-slate-400 font-mono text-xs">{rec.ajinomoto.cb}</td>
                  <td className="px-2 py-3.5 text-slate-400 font-mono text-xs">{rec.ajinomoto.th}</td>
                  <td className="px-2 py-3.5 text-slate-400 font-mono text-xs">{rec.ajinomoto.bc}</td>
                  <td className="px-2 py-3.5 font-bold text-slate-700 font-mono text-xs border-r border-slate-100 bg-slate-50/30">
                    {rec.ajinomoto.t}
                  </td>

                  {/* Final GPA */}
                  <td className="px-4 py-3.5 font-black text-[#407F3E] font-mono text-sm border-r border-slate-100 bg-green-50/20">
                    {rec.finalGpa}
                  </td>

                  {/* Status Badges */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(rec.resultStatus)}`}>
                      {getStatusIcon(rec.resultStatus)}
                      <span>{rec.resultStatus}</span>
                    </span>
                  </td>

                  {/* Direct Grade Editor Button if not locked */}
                  {!isLocked && (
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setEditingStudent(rec);
                          setCpT(rec.cp.t);
                          setAceT(rec.acecook.t);
                          setAjiT(rec.ajinomoto.t);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-[#407F3E] rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa điểm nhanh"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Explainer Note */}
      <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-500 uppercase tracking-wide">Ghi chú ký hiệu các cột thành phần:</p>
        <p>• <b>CB</b>: Chuẩn bị lý thuyết / An toàn lao động (Tối đa 2.0 điểm)</p>
        <p>• <b>TH</b>: Nhật ký thực hành thực tế tại nhà máy (Tối đa 4.0 điểm)</p>
        <p>• <b>BC</b>: Báo cáo thu hoạch nhóm cuối chuyến đi (Tối đa 4.0 điểm)</p>
        <p>• <b>T</b>: Tổng điểm nhà máy tương ứng (CB + TH + BC, tối đa 10.0 điểm)</p>
        <p>• <b>Điểm tổng kết</b>: Điểm trung bình cộng của các chuyến tham quan thực tế đạt chuẩn.</p>
      </div>

      {/* Lock Grades Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 bg-red-50 flex items-center justify-between text-red-700">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-5 h-5" />
                <span>Xác nhận Khóa điểm đợt này</span>
              </h3>
              <button 
                onClick={() => setShowLockModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-3.5">
              <p className="text-sm font-bold text-slate-800">
                Xác nhận khóa vĩnh viễn bảng điểm kiến tập Học kỳ 1 năm học 2023-2024?
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Sau khi khóa bảng điểm, tất cả giảng viên hướng dẫn sẽ <b>không thể thay đổi</b> điểm thành phần của sinh viên. Kết quả sẽ được phê duyệt chính thức và tự động đồng bộ sang Portal Đào tạo chung của trường Đại học.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowLockModal(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleLockGrades}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-md cursor-pointer"
              >
                Khóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quick Score Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-[#E7E0C4] border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-primary-container" />
                <span>Cập nhật tổng điểm nhanh</span>
              </h3>
              <button 
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditGradesSubmit} className="p-6 space-y-4">
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                Sinh viên: <span className="text-slate-800 font-extrabold">{editingStudent.fullname} ({editingStudent.mssv})</span>
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tổng điểm CP (Thang 10)
                </label>
                <input 
                  type="text" 
                  value={cpT} 
                  onChange={e => {
                    const val = e.target.value;
                    setCpT(val === '' || val === '-' ? '-' : parseFloat(val) || 0);
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tổng điểm Acecook (Thang 10)
                </label>
                <input 
                  type="text" 
                  value={aceT} 
                  onChange={e => {
                    const val = e.target.value;
                    setAceT(val === '' || val === '-' ? '-' : parseFloat(val) || 0);
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tổng điểm Ajinomoto (Thang 10)
                </label>
                <input 
                  type="text" 
                  value={ajiT} 
                  onChange={e => {
                    const val = e.target.value;
                    setAjiT(val === '' || val === '-' ? '-' : parseFloat(val) || 0);
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none text-slate-700"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#407F3E] hover:bg-[#346732] text-white rounded-xl text-sm font-semibold shadow-md cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
