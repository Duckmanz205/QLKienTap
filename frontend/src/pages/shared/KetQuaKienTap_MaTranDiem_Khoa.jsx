import React, { useState, useEffect } from 'react';
import { 
  Lock, ChevronDown, Check, ChevronRight, AlertTriangle, 
  CheckCircle2, XCircle, Clock, Ban, Award
} from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function KetQuaKienTap_Khoa() {
  const [schedules, setSchedules] = useState([]);
  const [selectedLich, setSelectedLich] = useState('');
  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [searchLich, setSearchLich] = useState('');
  const [results, setResults] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (selectedLich) {
      fetchEnrollments();
    }
  }, [selectedLich]);

  const fetchSchedules = async () => {
    try {
      const res = await khoaApi.getSchedules();
      setSchedules(res.data);
      if (res.data.length > 0) {
        setSelectedLich(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await khoaApi.getEnrollments({ lichKienTapId: selectedLich, limit: 1000 });
      setResults(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLockGrades = async (e) => {
    e.stopPropagation();
    try {
      await khoaApi.lockGrades({ lichKienTapId: selectedLich });
      alert('Đã khóa điểm đợt này thành công!');
      setIsConfirmModalOpen(false);
      fetchEnrollments(); // refresh state if needed
    } catch (err) {
      console.error(err);
      alert('Khóa điểm thất bại');
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLichDropdownOpen(false);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(!isLichDropdownOpen);
  };

  // Stats calculation
  const statDaDat = results.filter(r => r.trang_thai === 'Đạt').length;
  const statKhongDat = results.filter(r => r.trang_thai === 'Không đạt').length;
  const statDangThucHien = results.filter(r => !r.trang_thai).length; // or mapped by other logic

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đạt':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Không đạt':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status || 'Chưa HT'}</span>;
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Kết quả kiến tập</h1>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(true); }}
          className="px-5 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          Khóa điểm đợt này
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 relative z-20 mb-6">
        {/* Lịch Dropdown */}
        <div className="relative min-w-[350px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Lịch kiến tập</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsLichDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedLich ? 'text-slate-700' : 'text-slate-400'}`}>
              {schedules.find(s => s.id === selectedLich)?.ten_lich || 'Chọn lịch kiến tập'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isLichDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col">
              <div className="px-2 pb-1 border-b border-[#E7E0C4]/50">
                <input
                  type="text"
                  placeholder="Tìm kiếm lịch..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                  value={searchLich}
                  onChange={(e) => setSearchLich(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="overflow-y-auto max-h-48">
                {schedules.filter(opt => opt.ten_lich?.toLowerCase().includes(searchLich.toLowerCase())).length > 0 ? (
                  schedules.filter(opt => opt.ten_lich?.toLowerCase().includes(searchLich.toLowerCase())).map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => { setSelectedLich(opt.id); setIsLichDropdownOpen(false); setSearchLich(''); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        selectedLich === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                      }`}
                    >
                      <span className="truncate pr-2">{opt.ten_lich}</span>
                      {selectedLich === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-400 italic text-center">Không tìm thấy lịch kiến tập</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Đã đạt */}
        <div className="bg-[#89B449]/10 border border-[#89B449]/20 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-[#89B449] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#89B449] uppercase tracking-wider mb-0.5">Đã đạt</div>
            <div className="text-2xl font-black text-slate-800">{statDaDat}</div>
          </div>
        </div>

        {/* Đang thực hiện (Mock) */}
        <div className="bg-[#DBD468]/15 border border-[#DBD468]/30 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-[#DBD468] rounded-full flex items-center justify-center text-slate-800 shadow-sm shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-yellow-700 uppercase tracking-wider mb-0.5">Đang thực hiện</div>
            <div className="text-2xl font-black text-slate-800">{statDangThucHien}</div>
          </div>
        </div>

        {/* Chưa hoàn thành (Mock) */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 shadow-sm shrink-0">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Chưa hoàn thành</div>
            <div className="text-2xl font-black text-slate-800">0</div>
          </div>
        </div>

        {/* Không đạt */}
        <div className="bg-[#E68A8C]/10 border border-[#E68A8C]/20 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-[#E68A8C] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#E68A8C] uppercase tracking-wider mb-0.5">Không đạt</div>
            <div className="text-2xl font-black text-slate-800">{statKhongDat}</div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-[10px] font-bold uppercase tracking-wider border-b border-white">
                <th className="p-2 pl-4 border-r border-white text-center" rowSpan={2}>MSSV</th>
                <th className="p-2 border-r border-white text-center" rowSpan={2}>Họ tên</th>
                <th className="p-2 border-r border-white text-center" rowSpan={2}>Lớp</th>
                
                <th className="p-2 border-r border-white text-center bg-[#FCE4D6]" colSpan={5}>NM1</th>
                <th className="p-2 border-r border-white text-center bg-[#DDEBF7]" colSpan={5}>NM2</th>
                <th className="p-2 border-r border-white text-center bg-[#E2EFDA]" colSpan={5}>NM3</th>

                <th className="p-2 text-center bg-[#FFF2CC] text-[#407F3E]" rowSpan={2}>Tổng kết</th>
                <th className="p-2 text-center border-l border-white" rowSpan={2}>Kết quả</th>
                <th className="p-2 pr-4 text-center border-l border-white" rowSpan={2}>Chi tiết</th>
              </tr>
              <tr className="bg-[#E7E0C4] text-slate-800 text-[9px] font-bold uppercase tracking-tighter border-b border-white">
                {/* NM1 */}
                <th className="p-1 border-r border-white text-center bg-[#FCE4D6]">Chuẩn bị</th>
                <th className="p-1 border-r border-white text-center bg-[#FCE4D6]">Báo cáo</th>
                <th className="p-1 border-r border-white text-center bg-[#FCE4D6]">Vấn đáp</th>
                <th className="p-1 border-r border-white text-center bg-[#FCE4D6]">Cộng</th>
                <th className="p-1 border-r border-white text-center bg-[#FCE4D6]">Tổng NM1</th>
                {/* NM2 */}
                <th className="p-1 border-r border-white text-center bg-[#DDEBF7]">Chuẩn bị</th>
                <th className="p-1 border-r border-white text-center bg-[#DDEBF7]">Báo cáo</th>
                <th className="p-1 border-r border-white text-center bg-[#DDEBF7]">Vấn đáp</th>
                <th className="p-1 border-r border-white text-center bg-[#DDEBF7]">Cộng</th>
                <th className="p-1 border-r border-white text-center bg-[#DDEBF7]">Tổng NM2</th>
                {/* NM3 */}
                <th className="p-1 border-r border-white text-center bg-[#E2EFDA]">Chuẩn bị</th>
                <th className="p-1 border-r border-white text-center bg-[#E2EFDA]">Báo cáo</th>
                <th className="p-1 border-r border-white text-center bg-[#E2EFDA]">Vấn đáp</th>
                <th className="p-1 border-r border-white text-center bg-[#E2EFDA]">Cộng</th>
                <th className="p-1 border-r border-white text-center bg-[#E2EFDA]">Tổng NM3</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={21} className="p-8 text-center text-slate-500 font-medium border-b border-[#E7E0C4]/50">Không có kết quả nào.</td>
                </tr>
              ) : (
                results.map((r, index) => {
                  const sv = r.sinhVien || {};
                  const trips = r.trips || [];
                  const t1 = trips[0] || {};
                  const t2 = trips[1] || {};
                  const t3 = trips[2] || {};
                  
                  return (
                    <tr key={r.id} className={`hover:bg-slate-50 transition-colors border-b border-[#E7E0C4]/50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="p-2 pl-4 font-mono font-bold text-[#407F3E] border-r border-[#E7E0C4]/50 text-center">{sv.mssv}</td>
                      <td className="p-2 font-bold text-slate-800 border-r border-[#E7E0C4]/50 whitespace-nowrap">{sv.ho_ten}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 text-[10px] text-slate-500">{sv.ten_lop || '--'}</td>

                      {/* NM1 */}
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono">{t1.diem_chuan_bi ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono text-blue-600">{t1.diem_bao_cao ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono text-red-600">{t1.diem_van_dap ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono text-green-600">{t1.diem_cong ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono font-bold">{t1.diem_tong_nm ?? '--'}</td>
                      
                      {/* NM2 */}
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono">{t2.diem_chuan_bi ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono text-blue-600">{t2.diem_bao_cao ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono text-red-600">{t2.diem_van_dap ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono text-green-600">{t2.diem_cong ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono font-bold">{t2.diem_tong_nm ?? '--'}</td>

                      {/* NM3 */}
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono">{t3.diem_chuan_bi ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono text-blue-600">{t3.diem_bao_cao ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono text-red-600">{t3.diem_van_dap ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono text-green-600">{t3.diem_cong ?? '--'}</td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 font-mono font-bold">{t3.diem_tong_nm ?? '--'}</td>

                      {/* TỔNG */}
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50 bg-[#FFF2CC]/30">
                        {r.diem_tong_ket !== null ? (
                          <span className="font-bold text-sm text-[#407F3E]">{r.diem_tong_ket}</span>
                        ) : (
                          <span className="text-slate-400 font-bold">--</span>
                        )}
                      </td>
                      <td className="p-2 text-center border-r border-[#E7E0C4]/50">
                        {getStatusBadge(r.trang_thai)}
                      </td>
                      <td className="p-2 text-center pr-4">
                        <button 
                          onClick={() => setSelectedStudent(r)}
                          className="p-1 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer inline-flex justify-center" 
                          title="Xem chi tiết điểm"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60  z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E7E0C4] bg-[#E7E0C4]/30 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-[#407F3E]" />
                <span>Chi tiết điểm sinh viên</span>
              </h2>
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="text-slate-400 hover:text-slate-800 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm font-semibold text-slate-600">
              <div className="flex items-center gap-3 bg-[#E7E0C4]/15 p-3 rounded-xl border border-[#E7E0C4]/40">
                <div className="w-10 h-10 rounded-full bg-[#407F3E] flex items-center justify-center text-white font-bold text-base shadow-sm">
                  {selectedStudent.sinhVien?.ho_ten?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-slate-800 font-bold text-base leading-tight">{selectedStudent.sinhVien?.ho_ten}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">MSSV: {selectedStudent.sinhVien?.mssv}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Điểm quá trình (Chuyên cần, Bài TH):</span>
                  <span className="text-slate-800 font-bold font-mono">{selectedStudent.diem_chuan_bi ?? '--'} / 10.0</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Điểm cộng chuyên cần:</span>
                  <span className="text-slate-800 font-bold font-mono">+{selectedStudent.diem_cong ?? '0'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Điểm báo cáo TQNM:</span>
                  <span className="text-slate-800 font-bold font-mono">{selectedStudent.diem_bao_cao ?? '--'} / 10.0</span>
                </div>
                <div className="flex justify-between pt-1.5 text-base">
                  <span className="text-[#407F3E] font-extrabold">Điểm tổng kết học phần:</span>
                  <span className="text-[#407F3E] font-black font-mono">{selectedStudent.diem_tong_ket ?? '--'}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-[#E7E0C4] flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Lock Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dimmed Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60  animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(false); }}
          ></div>
          
          {/* Modal Content */}
          <div 
            className="bg-white w-full max-w-sm rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 p-6 flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-[#E68A8C]/15 rounded-full flex items-center justify-center mb-4 border border-[#E68A8C]/30 shadow-sm">
              <AlertTriangle className="w-8 h-8 text-[#E68A8C]" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Xác nhận khóa điểm</h3>
            <p className="text-slate-500 font-medium mb-8">Sau khi khóa, không thể chỉnh sửa điểm.<br/>Bạn có chắc chắn?</p>
            
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(false); }}
                className="flex-1 py-3 border border-[#E7E0C4] bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={handleLockGrades}
                className="flex-1 py-3 bg-[#E68A8C] text-white hover:bg-[#E68A8C]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Xác nhận khóa điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
