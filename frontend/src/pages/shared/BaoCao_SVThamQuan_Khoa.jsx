import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Users, CheckCircle, BarChart2, FileSpreadsheet, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { khoaApi } from '../../services/api';

export default function BaoCao_SVThamQuan_Khoa() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const lichKienTapId = searchParams.get('lichKienTapId');

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [scheduleName, setScheduleName] = useState('');
  
  const [stats, setStats] = useState({
    totalVisited: 0,
    totalEnrolled: 0,
    classCount: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [classes, setClasses] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      const [schedulesRes, visitedRes, enrollmentsRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getVisitedStudentsReport({ lichKienTapId }),
        khoaApi.getEnrollments(1, 10000, '', lichKienTapId)
      ]);

      const schedules = schedulesRes.data || [];
      const currentSchedule = schedules.find(s => s.id === Number(lichKienTapId));
      if (currentSchedule) setScheduleName(currentSchedule.ten_lich);

      const visitedData = visitedRes.data || [];
      setStudents(visitedData);

      // Stats
      const enrollData = enrollmentsRes.data?.data || [];
      const totalEnrolled = enrollData.length;
      const totalVisited = visitedData.length;
      
      const uniqueClasses = [...new Set(visitedData.map(s => s.lop || s.ten_lop).filter(Boolean))];
      setClasses(uniqueClasses);

      setStats({
        totalVisited,
        totalEnrolled,
        classCount: uniqueClasses.length
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

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportExcel = () => {
    let csvContent = '\uFEFF';
    csvContent += 'STT,MSSV,Họ và tên,Lớp,Khóa,Số lần tham quan\n';
    filteredStudents.forEach((s, idx) => {
      csvContent += `"${idx + 1}","${s.mssv}","${s.ho_ten}","${s.lop || s.ten_lop || ''}","${s.khoa?.ten_khoa || ''}","${s.visitsCount || 1}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `DanhSachSVThamQuan_${scheduleName || 'Report'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    navigate(window.location.pathname.includes('/clb') ? '/clb/reports' : '/khoa/reports');
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6">
        <span className="cursor-pointer hover:text-[#407F3E] transition-colors" onClick={handleBack}>Báo cáo thống kê</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#407F3E]">Danh sách SV đã tham quan</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 bg-white border border-[#E7E0C4] hover:border-[#407F3E] text-slate-500 hover:text-[#407F3E] rounded-xl transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#407F3E] tracking-tight">Danh sách sinh viên đã tham quan</h1>
              {scheduleName && (
                <span className="px-3 py-1 bg-[#E7E0C4] text-[#407F3E] text-xs font-bold rounded-full border border-[#d6cc9a]">
                  {scheduleName}
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={exportExcel} className="flex items-center gap-2 px-5 py-2.5 bg-[#407F3E] hover:bg-[#346832] text-white rounded-xl text-sm font-bold shadow-sm transition-colors">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#407F3E]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-[#407F3E]/10 rounded-2xl flex items-center justify-center text-[#407F3E] shrink-0 relative z-10">
            <Users className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tổng SV tham quan</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalVisited} <span className="text-sm text-slate-400 font-medium">SV</span></h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 relative z-10">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tỷ lệ tham gia</p>
            <h3 className="text-3xl font-black text-slate-800">
              {stats.totalEnrolled > 0 ? ((stats.totalVisited / stats.totalEnrolled) * 100).toFixed(1) : 0}%
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0 relative z-10">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Số lớp có SV</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.classCount} <span className="text-sm text-slate-400 font-medium">Lớp</span></h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo MSSV hoặc Họ tên..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#407F3E]/20 focus:border-[#407F3E] transition-all"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            className="px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            value={selectedClass}
            onChange={(e) => {setSelectedClass(e.target.value); setCurrentPage(1);}}
          >
            <option value="All">Tất cả các lớp</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 w-16 text-center">STT</th>
                <th className="p-4">MSSV</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Lớp</th>
                <th className="p-4">Khóa</th>
                <th className="p-4 text-center">Số lần tham quan</th>
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
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-semibold text-base text-slate-500">Chưa có sinh viên nào tham quan trong lịch này</p>
                      <p className="text-sm mt-1">Vui lòng kiểm tra lại điều kiện lọc hoặc chọn lịch kiến tập khác.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 text-center text-slate-400 font-mono">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#407F3E]">{s.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{s.ho_ten}</td>
                    <td className="p-4 font-medium text-slate-600">{s.lop || s.ten_lop}</td>
                    <td className="p-4 font-medium text-slate-600">{s.khoa?.ten_khoa}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E7E0C4]/40 text-[#407F3E] font-bold font-mono text-sm border border-[#E7E0C4]">
                        {s.visitsCount || 1}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        {!loading && filteredStudents.length > 0 && (
          <div className="p-4 border-t border-[#E7E0C4]/50 bg-white flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">
              Hiển thị <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> trong tổng số <span className="text-slate-800">{filteredStudents.length}</span> sinh viên
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E7E0C4] text-slate-500 hover:bg-slate-50 hover:text-[#407F3E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-[#407F3E] text-white shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-[#407F3E]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E7E0C4] text-slate-500 hover:bg-slate-50 hover:text-[#407F3E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
