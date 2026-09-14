import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, XOctagon, FileSpreadsheet, ChevronLeft, ChevronRight, Mail, AlertTriangle, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { khoaApi } from '../../services/api';

export default function BaoCao_SVKhongThucHien_Khoa() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  
  const [stats, setStats] = useState({
    totalRetake: 0,
    byKhoa: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedKhoaFilter, setSelectedKhoaFilter] = useState('All');
  
  const [classes, setClasses] = useState([]);
  const [khoas, setKhoas] = useState([]);
  
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [searchClass, setSearchClass] = useState('');
  
  const [isKhoaDropdownOpen, setIsKhoaDropdownOpen] = useState(false);
  const [searchKhoa, setSearchKhoa] = useState('');

  const closeAllDropdowns = () => {
    setIsClassDropdownOpen(false);
    setIsKhoaDropdownOpen(false);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // getRetakeReport usually returns all students who are marked as retaking/failed
      const res = await khoaApi.getRetakeReport();
      const retakeData = res.data || [];
      setStudents(retakeData);

      // Stats
      const totalRetake = retakeData.length;
      
      const uniqueClasses = [...new Set(retakeData.map(s => s.lop || s.ten_lop).filter(Boolean))];
      setClasses(uniqueClasses);

      const uniqueKhoas = [...new Set(retakeData.map(s => s.khoa?.ten_khoa).filter(Boolean))];
      setKhoas(uniqueKhoas);

      // Aggregate by Khoa for mini bar chart
      const khoaMap = {};
      retakeData.forEach(s => {
        const kName = s.khoa?.ten_khoa || 'Chưa rõ';
        khoaMap[kName] = (khoaMap[kName] || 0) + 1;
      });
      
      const byKhoaArr = Object.keys(khoaMap).map(k => ({
        name: k,
        count: khoaMap[k]
      })).sort((a, b) => b.count - a.count).slice(0, 3); // top 3 for UI

      setStats({
        totalRetake,
        byKhoa: byKhoaArr
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchSearch = (
      s.mssv?.toLowerCase().includes(term) || 
      s.ho_ten?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
    const matchClass = selectedClass === 'All' || (s.lop || s.ten_lop) === selectedClass;
    const matchKhoa = selectedKhoaFilter === 'All' || (s.khoa?.ten_khoa) === selectedKhoaFilter;
    
    return matchSearch && matchClass && matchKhoa;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportExcel = () => {
    let csvContent = '\uFEFF';
    csvContent += 'STT,MSSV,Họ và tên,Lớp,Khóa,Email,Lý do\n';
    filteredStudents.forEach((s, idx) => {
      csvContent += `"${idx + 1}","${s.mssv}","${s.ho_ten}","${s.lop || s.ten_lop || ''}","${s.khoa?.ten_khoa || ''}","${s.email || ''}","Không đủ chuyến"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `DanhSachSV_HocLai.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    navigate(window.location.pathname.includes('/clb') ? '/clb/reports' : '/khoa/reports');
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6">
        <span className="cursor-pointer hover:text-[#407F3E] transition-colors" onClick={handleBack}>Báo cáo thống kê</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#407F3E]">Danh sách SV không thực hiện</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 bg-white border border-[#E7E0C4] hover:border-[#407F3E] text-slate-500 hover:text-[#407F3E] rounded-xl transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Danh sách SV không thực hiện (Học lại)</h1>
            <p className="text-sm text-slate-500 mt-1">Danh sách toàn khoa các sinh viên vi phạm quy chế hoặc không đủ điều kiện.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Total Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#407F3E]/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-[#407F3E]/15 rounded-2xl flex items-center justify-center text-[#407F3E] shrink-0 relative z-10 border border-[#407F3E]/30">
            <XOctagon className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tổng SV không thực hiện</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalRetake} <span className="text-sm text-slate-400 font-medium">SV</span></h3>
          </div>
        </div>

        {/* By Khoa Mini Bar Chart Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm relative overflow-hidden group">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">Phân bổ theo Khóa (Top 3)</p>
          <div className="flex flex-col gap-3">
            {stats.byKhoa.length > 0 ? stats.byKhoa.map((k, i) => {
              const maxCount = stats.byKhoa[0].count;
              const widthPct = (k.count / maxCount) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 text-sm font-semibold text-slate-700 truncate">{k.name}</div>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#407F3E] rounded-full" 
                      style={{ width: `${widthPct}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-right text-xs font-bold text-slate-500">{k.count}</div>
                </div>
              );
            }) : (
              <div className="text-sm text-slate-400 italic">Không có dữ liệu phân bổ.</div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm MSSV, tên, email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#407F3E]/30 focus:border-[#407F3E] transition-all"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Khoa Custom Dropdown */}
          <div className="relative min-w-[200px]">
            <div
              onClick={(e) => { e.stopPropagation(); setIsKhoaDropdownOpen(!isKhoaDropdownOpen); setIsClassDropdownOpen(false); }}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isKhoaDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]/30' : 'border-[#E7E0C4]'}`}
            >
              <span className={`truncate pr-2 font-medium ${selectedKhoaFilter !== 'All' ? 'text-slate-700' : 'text-slate-500'}`}>{selectedKhoaFilter === 'All' ? 'Tất cả Khóa' : selectedKhoaFilter}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isKhoaDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col">
                <div className="px-2 pb-1 border-b border-[#E7E0C4]/50">
                  <input 
                    type="text"
                    placeholder="Tìm khóa..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]/50"
                    value={searchKhoa}
                    onChange={(e) => setSearchKhoa(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="overflow-y-auto max-h-60">
                  {['All', ...khoas].filter(opt => opt === 'All' || opt.toLowerCase().includes(searchKhoa.toLowerCase())).map(opt => (
                    <div
                      key={opt}
                      onClick={() => { setSelectedKhoaFilter(opt); setIsKhoaDropdownOpen(false); setSearchKhoa(''); setCurrentPage(1); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${selectedKhoaFilter === opt ? 'bg-[#E7E0C4]/50 text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/30 font-medium'}`}
                    >
                      <span className="truncate pr-2">{opt === 'All' ? 'Tất cả Khóa' : opt}</span>
                      {selectedKhoaFilter === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Class Custom Dropdown */}
          <div className="relative min-w-[200px]">
            <div
              onClick={(e) => { e.stopPropagation(); setIsClassDropdownOpen(!isClassDropdownOpen); setIsKhoaDropdownOpen(false); }}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isClassDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]/30' : 'border-[#E7E0C4]'}`}
            >
              <span className={`truncate pr-2 font-medium ${selectedClass !== 'All' ? 'text-slate-700' : 'text-slate-500'}`}>{selectedClass === 'All' ? 'Tất cả Lớp' : selectedClass}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isClassDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col">
                <div className="px-2 pb-1 border-b border-[#E7E0C4]/50">
                  <input 
                    type="text"
                    placeholder="Tìm lớp..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]/50"
                    value={searchClass}
                    onChange={(e) => setSearchClass(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="overflow-y-auto max-h-60">
                  {['All', ...classes].filter(opt => opt === 'All' || opt.toLowerCase().includes(searchClass.toLowerCase())).map(opt => (
                    <div
                      key={opt}
                      onClick={() => { setSelectedClass(opt); setIsClassDropdownOpen(false); setSearchClass(''); setCurrentPage(1); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${selectedClass === opt ? 'bg-[#E7E0C4]/50 text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/30 font-medium'}`}
                    >
                      <span className="truncate pr-2">{opt === 'All' ? 'Tất cả Lớp' : opt}</span>
                      {selectedClass === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2.5 bg-[#407F3E] hover:bg-[#346832] text-white rounded-xl text-sm font-bold shadow-sm transition-colors ml-auto">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 w-16 text-center">STT</th>
                <th className="p-4">MSSV</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Lớp</th>
                <th className="p-4">Khóa</th>
                <th className="p-4">Email</th>
                <th className="p-4">Lý do</th>
                <th className="p-4 text-center w-16">Thao tác</th>
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
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="p-4"><div className="h-8 w-8 bg-slate-200 rounded-full mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={8} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <AlertTriangle className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-semibold text-base text-slate-500">Không có dữ liệu sinh viên vi phạm</p>
                      <p className="text-sm mt-1">Hệ thống chưa ghi nhận trường hợp cấm thi hoặc vi phạm nào theo bộ lọc.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 text-center text-slate-400 font-mono">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">{s.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{s.ho_ten}</td>
                    <td className="p-4 font-medium text-slate-600">{s.lop || s.ten_lop}</td>
                    <td className="p-4 font-medium text-slate-600">{s.khoa?.ten_khoa}</td>
                    <td className="p-4">
                      {s.email ? (
                        <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px] block" title={s.email}>{s.email}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Chưa cập nhật</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Không đủ chuyến
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {s.email ? (
                        <a 
                          href={`mailto:${s.email}?subject=Thông báo từ Ban Quản Lý Kiến Tập`}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-[#407F3E] hover:text-white transition-colors"
                          title="Gửi email nhắc nhở"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      ) : (
                        <button disabled className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-slate-50 text-slate-300 cursor-not-allowed">
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
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
