import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, CheckCircle, Clock, FileSpreadsheet, ChevronLeft, ChevronRight, Check, X, Users, Percent, FileText, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { khoaApi } from '../../services/api';

export default function BaoCao_SVDuDieuKien_Khoa() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const lichKienTapId = searchParams.get('lichKienTapId');

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [scheduleName, setScheduleName] = useState('');
  
  const [stats, setStats] = useState({
    totalEligible: 0,
    totalEnrolled: 0,
    submittedReport: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [searchLopDropdown, setSearchLopDropdown] = useState('');
  const [classes, setClasses] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    if (lichKienTapId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [lichKienTapId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, eligibleRes, enrollmentsRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getEligibleStudentsReport({ lichKienTapId }),
        khoaApi.getEnrollments(1, 10000, '', lichKienTapId)
      ]);

      const schedules = schedulesRes.data || [];
      const currentSchedule = schedules.find(s => String(s.id) === String(lichKienTapId));
      
      if (currentSchedule) {
        setScheduleName(currentSchedule.ten_lich);
      }

      const eligibleData = eligibleRes.data || [];
      const enrollData = enrollmentsRes.data?.data || [];

      // Link enrollment data to students to check submitted reports if possible
      // Actually we just map over eligibleData
      const processedStudents = eligibleData.map(sv => {
        const en = enrollData.find(e => e.sinh_vien_id === sv.id);
        return {
          ...sv,
          hasPaid: true, // Eligible means they paid and visited
          hasVisited: true,
          hasSubmitted: !!(en && en.file_bao_cao)
        };
      });

      setStudents(processedStudents);

      // Stats
      const totalEnrolled = enrollData.length;
      const totalEligible = processedStudents.length;
      const submittedReport = processedStudents.filter(s => s.hasSubmitted).length;
      
      const uniqueClasses = [...new Set(processedStudents.map(s => s.lop || s.ten_lop).filter(Boolean))];
      setClasses(uniqueClasses);

      setStats({
        totalEligible,
        totalEnrolled,
        submittedReport
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = (s.mssv?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchClass = selectedClass === 'All' || (s.lop || s.ten_lop) === selectedClass;
    return matchSearch && matchClass;
  });

  const totalPages = Math.ceil(filteredStudents.length / limit) || 1;
  const paginatedData = filteredStudents.slice((currentPage - 1) * limit, currentPage * limit);

  const exportExcel = () => {
    let csvContent = '\uFEFF';
    csvContent += 'STT,MSSV,Họ và tên,Lớp,Khóa,Đã đóng phí,Đã tham quan,Trạng thái\n';
    filteredStudents.forEach((s, idx) => {
      csvContent += `"${idx + 1}","${s.mssv}","${s.ho_ten}","${s.lop || s.ten_lop || ''}","${s.khoaHoc?.ten_khoa_hoc || ''}","Có","Có","Đủ điều kiện"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `DanhSachSV_DuDieuKien_${scheduleName || 'Report'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    navigate(window.location.pathname.includes('/clb') ? '/clb/reports' : '/khoa/reports');
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300" onClick={() => setIsClassDropdownOpen(false)}>
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6">
        <span className="cursor-pointer hover:text-teal-600 transition-colors" onClick={handleBack}>Báo cáo thống kê</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-teal-600">Danh sách SV đủ điều kiện báo cáo</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 bg-white border border-[#E7E0C4] hover:border-teal-600 text-slate-500 hover:text-teal-600 rounded-xl transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Danh sách SV đủ điều kiện báo cáo</h1>
              {scheduleName && (
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-200">
                  {scheduleName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shrink-0 relative z-10 border border-teal-200">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tổng SV đủ điều kiện</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalEligible} <span className="text-sm text-slate-400 font-medium">SV</span></h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shrink-0 relative z-10 border border-teal-200">
            <Percent className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tỷ lệ so với tổng đăng ký</p>
            <h3 className="text-3xl font-black text-slate-800">
              {stats.totalEnrolled > 0 ? ((stats.totalEligible / stats.totalEnrolled) * 100).toFixed(1) : 0}%
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shrink-0 relative z-10 border border-teal-200">
            <FileText className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Đã nộp báo cáo</p>
            <h3 className="text-3xl font-black text-slate-800">
              {stats.submittedReport} <span className="text-sm text-slate-400 font-medium">/ {stats.totalEligible} SV</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col md:flex-row items-center gap-4 mb-6 relative z-20">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo MSSV hoặc Họ tên..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>

        {/* Lớp Dropdown */}
        <div className="relative min-w-[200px] w-full md:w-auto">
          <div 
            onClick={(e) => { e.stopPropagation(); setIsClassDropdownOpen(!isClassDropdownOpen); }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isClassDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="text-slate-700 font-medium">{selectedClass === 'All' ? 'Tất cả lớp' : selectedClass}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
          </div>
          {isClassDropdownOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full right-0 w-full md:w-56 mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col"
            >
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm lớp..." 
                  value={searchLopDropdown}
                  onChange={(e) => setSearchLopDropdown(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {['All', ...classes]
                  .filter(opt => opt === 'All' ? 'tất cả lớp'.includes(searchLopDropdown.toLowerCase()) : opt.toLowerCase().includes(searchLopDropdown.toLowerCase()))
                  .map(opt => (
                    <div 
                      key={opt}
                      onClick={() => { setSelectedClass(opt); setIsClassDropdownOpen(false); setSearchLopDropdown(''); setCurrentPage(1); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        selectedClass === opt 
                          ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                          : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                      }`}
                    >
                      <span>{opt === 'All' ? 'Tất cả lớp' : opt}</span>
                      {selectedClass === opt && <Check className="w-4 h-4 text-[#407F3E]" />}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <button 
            onClick={() => navigate('/khoa/council-list')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Phân công hội đồng</span>
          </button>

          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-[#E7E0C4] text-slate-700 rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 text-[#407F3E]" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#E7E0C4]/40 text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 w-16 text-center">STT</th>
                <th className="p-4">MSSV</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Lớp</th>
                <th className="p-4 text-center">Đã đóng phí</th>
                <th className="p-4 text-center">Đã tham quan</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                // Loading Skeleton
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-6 w-6 bg-slate-200 rounded-full mx-auto"></div></td>
                    <td className="p-4"><div className="h-6 w-6 bg-slate-200 rounded-full mx-auto"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-semibold text-base text-slate-500">Chưa có sinh viên nào đủ điều kiện</p>
                      <p className="text-sm mt-1">Vui lòng kiểm tra lại điều kiện lọc hoặc chọn lịch kiến tập khác.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 text-center text-slate-400 font-mono">
                      {(currentPage - 1) * limit + idx + 1}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">{s.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{s.ho_ten}</td>
                    <td className="p-4 font-medium text-slate-600">{s.lop || s.ten_lop}</td>
                    
                    {/* Đã đóng phí */}
                    <td className="p-4">
                      <div className="flex justify-center">
                        {s.hasPaid ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-100 border border-red-200 flex items-center justify-center">
                            <X className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Đã tham quan */}
                    <td className="p-4">
                      <div className="flex justify-center">
                        {s.hasVisited ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-100 border border-red-200 flex items-center justify-center">
                            <X className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        Đủ điều kiện
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <select 
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                setCurrentPage(1);
              }}
              className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>/ {filteredStudents.length} sinh viên</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {currentPage} / {totalPages}
            </span>
            
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
