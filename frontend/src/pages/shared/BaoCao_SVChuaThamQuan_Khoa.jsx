import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, UserX, CheckCircle, Clock, FileSpreadsheet, ChevronLeft, ChevronRight, Bell, Percent } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { khoaApi } from '../../services/api';

export default function BaoCao_SVChuaThamQuan_Khoa() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const lichKienTapId = searchParams.get('lichKienTapId');

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [scheduleName, setScheduleName] = useState('');
  
  const [stats, setStats] = useState({
    totalNotVisited: 0,
    totalEnrolled: 0,
    daysRemaining: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [classes, setClasses] = useState([]);

  // Checkbox state for bulk actions
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

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
      const [schedulesRes, notVisitedRes, enrollmentsRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getNotVisitedStudentsReport({ lichKienTapId }),
        khoaApi.getEnrollments(1, 10000, '', lichKienTapId)
      ]);

      const schedules = schedulesRes.data || [];
      const currentSchedule = schedules.find(s => s.id === Number(lichKienTapId));
      
      let daysRemaining = null;
      if (currentSchedule) {
        setScheduleName(currentSchedule.ten_lich);
        if (currentSchedule.ngay_ket_thuc) {
          const diffTime = new Date(currentSchedule.ngay_ket_thuc) - new Date();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }

      const notVisitedData = notVisitedRes.data || [];
      setStudents(notVisitedData);

      // Stats
      const enrollData = enrollmentsRes.data?.data || [];
      const totalEnrolled = enrollData.length;
      const totalNotVisited = notVisitedData.length;
      
      const uniqueClasses = [...new Set(notVisitedData.map(s => s.lop || s.ten_lop).filter(Boolean))];
      setClasses(uniqueClasses);

      setStats({
        totalNotVisited,
        totalEnrolled,
        daysRemaining
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(new Set(paginatedData.map(s => s.id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleSelectStudent = (id) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudentIds(newSelected);
  };

  const handleSendReminder = () => {
    if (selectedStudentIds.size === 0) {
      alert("Vui lòng chọn ít nhất một sinh viên để nhắc nhở!");
      return;
    }
    alert(`Đã gửi thông báo nhắc nhở đến ${selectedStudentIds.size} sinh viên! (Tính năng mô phỏng)`);
    setSelectedStudentIds(new Set());
  };

  const exportExcel = () => {
    let csvContent = '\uFEFF';
    csvContent += 'STT,MSSV,Họ và tên,Lớp,Khóa,Trạng thái\n';
    filteredStudents.forEach((s, idx) => {
      csvContent += `"${idx + 1}","${s.mssv}","${s.ho_ten}","${s.lop || s.ten_lop || ''}","${s.khoa?.ten_khoa || ''}","Chưa tham quan"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `DanhSachSV_ChuaThamQuan_${scheduleName || 'Report'}.csv`;
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
        <span className="cursor-pointer hover:text-[#b0a944] transition-colors" onClick={handleBack}>Báo cáo thống kê</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#b0a944]">Danh sách SV chưa tham quan</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 bg-white border border-[#E7E0C4] hover:border-[#DBD468] text-slate-500 hover:text-[#b0a944] rounded-xl transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Danh sách SV chưa tham quan</h1>
              {scheduleName && (
                <span className="px-3 py-1 bg-[#DBD468]/20 text-[#8f882a] text-xs font-bold rounded-full border border-[#DBD468]/50">
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
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#DBD468]/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-[#DBD468]/20 rounded-2xl flex items-center justify-center text-[#9b942e] shrink-0 relative z-10 border border-[#DBD468]/30">
            <UserX className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tổng SV chưa tham quan</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalNotVisited} <span className="text-sm text-slate-400 font-medium">SV</span></h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#DBD468]/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-[#DBD468]/20 rounded-2xl flex items-center justify-center text-[#9b942e] shrink-0 relative z-10 border border-[#DBD468]/30">
            <Percent className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tỷ lệ chưa hoàn thành</p>
            <h3 className="text-3xl font-black text-slate-800">
              {stats.totalEnrolled > 0 ? ((stats.totalNotVisited / stats.totalEnrolled) * 100).toFixed(1) : 0}%
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0 relative z-10 border border-rose-100">
            <Clock className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Thời gian còn lại</p>
            <h3 className="text-3xl font-black text-slate-800">
              {stats.daysRemaining !== null 
                ? (stats.daysRemaining > 0 ? `${stats.daysRemaining} ` : 'Hết hạn') 
                : '-'}
              {stats.daysRemaining > 0 && <span className="text-sm text-slate-400 font-medium">Ngày</span>}
            </h3>
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
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DBD468]/30 focus:border-[#DBD468] transition-all"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select 
            className="px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#DBD468]/30"
            value={selectedClass}
            onChange={(e) => {setSelectedClass(e.target.value); setCurrentPage(1);}}
          >
            <option value="All">Tất cả các lớp</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button 
            onClick={handleSendReminder}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Gửi nhắc nhở {selectedStudentIds.size > 0 ? `(${selectedStudentIds.size})` : ''}</span>
          </button>

          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-[#E7E0C4] text-slate-600 rounded-xl text-sm font-bold shadow-sm transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#E7E0C4]/40 text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-[#DBD468] focus:ring-[#DBD468]/50"
                    onChange={handleSelectAll}
                    checked={paginatedData.length > 0 && selectedStudentIds.size === paginatedData.length}
                  />
                </th>
                <th className="p-4 w-16 text-center">STT</th>
                <th className="p-4">MSSV</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Lớp</th>
                <th className="p-4">Khóa</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                // Loading Skeleton
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-4 mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                // Empty State (Positive)
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-emerald-600">
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5 border-4 border-emerald-100">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                      </div>
                      <h3 className="font-black text-xl mb-2">Tất cả sinh viên đã hoàn thành tham quan 🎉</h3>
                      <p className="text-emerald-700/80 font-medium">Không có sinh viên nào vắng mặt hoặc chưa đăng ký đợt này.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-[#DBD468] focus:ring-[#DBD468]/50"
                        checked={selectedStudentIds.has(s.id)}
                        onChange={() => handleSelectStudent(s.id)}
                      />
                    </td>
                    <td className="p-4 text-center text-slate-400 font-mono">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">{s.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{s.ho_ten}</td>
                    <td className="p-4 font-medium text-slate-600">{s.lop || s.ten_lop}</td>
                    <td className="p-4 font-medium text-slate-600">{s.khoa?.ten_khoa}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Chưa tham quan
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
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E7E0C4] text-slate-500 hover:bg-slate-50 hover:text-[#b0a944] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        ? 'bg-[#DBD468] text-[#6d661b] shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-[#b0a944]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E7E0C4] text-slate-500 hover:bg-slate-50 hover:text-[#b0a944] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
