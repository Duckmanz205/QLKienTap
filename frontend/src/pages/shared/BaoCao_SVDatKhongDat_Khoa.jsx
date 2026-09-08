import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, FileCheck, CheckCircle, XCircle, Clock, FileSpreadsheet, ChevronLeft, ChevronRight, BarChart2, PieChart, ArrowDownUp, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { khoaApi } from '../../services/api';

export default function BaoCao_SVDatKhongDat_Khoa() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const lichKienTapId = searchParams.get('lichKienTapId');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [scheduleName, setScheduleName] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState('All'); // 'All' | 'Dat' | 'KhongDat' | 'DangHoc'
  const [sortOrder, setSortOrder] = useState(null); // null | 'asc' | 'desc'

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
      const [schedulesRes, reportRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getFinalResultsReport(lichKienTapId)
      ]);

      const schedules = schedulesRes.data || [];
      const currentSchedule = schedules.find(s => String(s.id) === String(lichKienTapId));
      if (currentSchedule) {
        setScheduleName(currentSchedule.ten_lich);
      }

      const rawData = reportRes.data || [];
      
      const processed = rawData.map(r => {
        const sv = r.lichKienTapSinhVien?.sinhVien || {};
        let resultLabel = 'Đang học';
        let resultValue = 'DangHoc';
        if (r.ket_qua === 'Dat') {
          resultLabel = 'Đạt';
          resultValue = 'Dat';
        } else if (r.ket_qua === 'KhongDat') {
          resultLabel = 'Không Đạt';
          resultValue = 'KhongDat';
        }
        
        return {
          id: r.id || sv.id || Math.random(),
          mssv: sv.mssv,
          ho_ten: sv.ho_ten,
          lop: sv.lop || sv.ten_lop,
          khoa: sv.khoa?.ten_khoa,
          diem: r.diem_tong_ket !== null ? Number(r.diem_tong_ket) : null,
          resultLabel,
          resultValue
        };
      });

      setData(processed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const { stats, donutSegments, histogram } = useMemo(() => {
    let dat = 0, khongDat = 0, dangHoc = 0;
    const ranges = { '0-4': 0, '4-5': 0, '5-6.5': 0, '6.5-8': 0, '8-10': 0 };

    data.forEach(d => {
      if (d.resultValue === 'Dat') dat++;
      else if (d.resultValue === 'KhongDat') khongDat++;
      else dangHoc++;

      if (d.diem !== null) {
        if (d.diem < 4) ranges['0-4']++;
        else if (d.diem < 5) ranges['4-5']++;
        else if (d.diem < 6.5) ranges['5-6.5']++;
        else if (d.diem < 8) ranges['6.5-8']++;
        else ranges['8-10']++;
      }
    });

    const total = dat + khongDat + dangHoc;
    
    // Donut logic (SVG circle stroke-dasharray)
    // Circumference of r=16 is ~100
    let currentOffset = 0;
    const segments = [];
    if (total > 0) {
      const pDat = (dat / total) * 100;
      const pKhongDat = (khongDat / total) * 100;
      const pDangHoc = (dangHoc / total) * 100;
      
      segments.push({ color: '#407F3E', value: pDat, offset: currentOffset });
      currentOffset += pDat;
      segments.push({ color: '#E68A8C', value: pKhongDat, offset: currentOffset });
      currentOffset += pKhongDat;
      segments.push({ color: '#cbd5e1', value: pDangHoc, offset: currentOffset });
    }

    const histArr = Object.entries(ranges).map(([label, count]) => ({ label, count }));
    const maxHist = Math.max(...histArr.map(h => h.count), 1);

    return {
      stats: { total, dat, khongDat, dangHoc },
      donutSegments: segments,
      histogram: { data: histArr, max: maxHist }
    };
  }, [data]);

  const filteredAndSorted = useMemo(() => {
    let filtered = data.filter(d => {
      const term = searchTerm.toLowerCase();
      const matchSearch = (d.mssv?.toLowerCase().includes(term) || d.ho_ten?.toLowerCase().includes(term));
      const matchResult = resultFilter === 'All' || d.resultValue === resultFilter;
      return matchSearch && matchResult;
    });

    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const valA = a.diem === null ? -1 : a.diem;
        const valB = b.diem === null ? -1 : b.diem;
        if (sortOrder === 'asc') return valA - valB;
        return valB - valA;
      });
    }

    return filtered;
  }, [data, searchTerm, resultFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage) || 1;
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = () => {
    if (sortOrder === null) setSortOrder('desc');
    else if (sortOrder === 'desc') setSortOrder('asc');
    else setSortOrder(null);
  };

  const exportExcel = () => {
    let csvContent = '\uFEFF';
    csvContent += 'STT,MSSV,Họ và tên,Lớp,Điểm tổng kết,Kết quả\n';
    filteredAndSorted.forEach((s, idx) => {
      const d = s.diem !== null ? s.diem.toFixed(2) : 'Chưa chốt';
      csvContent += `"${idx + 1}","${s.mssv}","${s.ho_ten}","${s.lop || ''}","${d}","${s.resultLabel}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `DanhSachSV_Diem_KetQua.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    navigate(window.location.pathname.includes('/clb') ? '/clb/reports' : '/khoa/reports');
  };

  const getResultBadge = (val) => {
    if (val === 'Dat') return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#e8f3e7] text-[#407F3E] border border-[#407F3E]/20">Đạt</span>;
    if (val === 'KhongDat') return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#fce8e8] text-[#E68A8C] border border-[#E68A8C]/20">Không Đạt</span>;
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Đang học</span>;
  };

  return (
    <div className="bg-slate-50/50 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6 print:hidden">
        <span className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={handleBack}>Báo cáo thống kê</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-indigo-600">Danh sách SV đạt/không đạt</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 bg-white border border-slate-200 hover:border-indigo-600 text-slate-500 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Danh sách SV đạt/không đạt</h1>
              {scheduleName && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                  {scheduleName}
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={exportExcel} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Excel / PDF</span>
        </button>
      </div>

      {/* Visualizations */}
      {!loading && stats.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 print:hidden">
          
          {/* Donut & KPIs (Col span 7) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    r="15.91549430918954"
                    cx="18"
                    cy="18"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="4"
                    strokeDasharray={`${seg.value} ${100 - seg.value}`}
                    strokeDashoffset={-seg.offset}
                    className="transition-all duration-1000 ease-out"
                  />
                ))}
                <circle r="12" cx="18" cy="18" fill="white" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <PieChart className="w-6 h-6 text-indigo-200 mb-1" />
                <span className="text-xs font-bold text-slate-400">Tỷ lệ</span>
              </div>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#e8f3e7]/50 rounded-xl border border-[#407F3E]/10 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-6 h-6 text-[#407F3E] mb-2" />
                <h4 className="text-2xl font-black text-[#407F3E]">{stats.dat}</h4>
                <p className="text-[11px] font-bold text-[#407F3E]/70 uppercase tracking-wider mt-1">Đạt</p>
              </div>
              <div className="p-4 bg-[#fce8e8]/50 rounded-xl border border-[#E68A8C]/10 flex flex-col items-center justify-center text-center">
                <XCircle className="w-6 h-6 text-[#E68A8C] mb-2" />
                <h4 className="text-2xl font-black text-[#E68A8C]">{stats.khongDat}</h4>
                <p className="text-[11px] font-bold text-[#E68A8C]/70 uppercase tracking-wider mt-1">Không Đạt</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                <Clock className="w-6 h-6 text-slate-400 mb-2" />
                <h4 className="text-2xl font-black text-slate-600">{stats.dangHoc}</h4>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Đang học</p>
              </div>
            </div>
          </div>

          {/* Histogram (Col span 5) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Phổ điểm</h3>
            </div>
            <div className="flex-1 flex items-end gap-2 h-32 mt-auto">
              {histogram.data.map((h, i) => {
                const heightPct = (h.count / histogram.max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group relative">
                    <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                      {h.count}
                    </div>
                    <div 
                      className="w-full bg-indigo-100 hover:bg-indigo-400 rounded-t-sm transition-all duration-500 max-w-[40px]"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    ></div>
                    <div className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">
                      {h.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 print:hidden">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo MSSV hoặc Họ tên..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            value={resultFilter}
            onChange={(e) => {setResultFilter(e.target.value); setCurrentPage(1);}}
          >
            <option value="All">Tất cả kết quả</option>
            <option value="Dat">Đạt</option>
            <option value="KhongDat">Không đạt</option>
            <option value="DangHoc">Đang học (Chưa chốt)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 pl-6 w-16 text-center">STT</th>
                <th className="p-4">MSSV</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group" onClick={toggleSort}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Điểm tổng kết</span>
                    {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : 
                     sortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5 text-indigo-600" /> : 
                     <ArrowDownUp className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400" />}
                  </div>
                </th>
                <th className="p-4 text-center">Kết quả</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-20 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <FileCheck className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-semibold text-base text-slate-500">Chưa có kết quả nào được chốt cho lịch kiến tập này</p>
                      <p className="text-sm mt-1">Thay đổi bộ lọc hoặc chọn lịch khác.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 pl-6 text-center text-slate-400 font-mono">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="p-4 font-mono font-bold text-indigo-900">{s.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{s.ho_ten}</td>
                    <td className={`p-4 text-right font-mono text-[15px] ${s.diem !== null ? 'font-bold text-slate-800 tabular-nums' : 'text-slate-400 italic text-sm'}`}>
                      {s.diem !== null ? s.diem.toFixed(2) : 'Chưa chốt'}
                    </td>
                    <td className="p-4 text-center">
                      {getResultBadge(s.resultValue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        {!loading && filteredAndSorted.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between print:hidden">
            <span className="text-sm font-semibold text-slate-500">
              Hiển thị <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}</span> / <span className="text-slate-800">{filteredAndSorted.length}</span> SV
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  if (totalPages > 5 && i > 1 && i < totalPages - 2 && Math.abs(i + 1 - currentPage) > 1) {
                    if (i === 2 || i === totalPages - 3) return <span key={i} className="px-1 text-slate-400">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        currentPage === i + 1 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
