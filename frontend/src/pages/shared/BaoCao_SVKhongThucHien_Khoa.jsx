import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  RotateCcw,
  FileSpreadsheet,
  ChevronRight,
  Mail,
  AlertTriangle,
  ChevronDown,
  Check,
  Users,
  Clock,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import { exportDanhSachHocLai } from '../../utils/exportExcel';

export default function BaoCao_SVKhongThucHien_Khoa() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    k12: 0,
    k11: 0,
    k10: 0,
    pct12: '0.0',
    pct11: '0.0',
    pct10: '0.0',
    classesCount: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedKhoaFilter, setSelectedKhoaFilter] = useState('All');

  const [classes, setClasses] = useState([]);
  const [khoas, setKhoas] = useState([]);

  // Dropdown UI states
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
  const [limit, setLimit] = useState(15);

  // Tải dữ liệu báo cáo danh sách sinh viên nợ môn (các khóa cũ chưa đạt)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await khoaApi.getRetakeReport();
      const debtData = res.data || [];
      setStudents(debtData);

      // Thống kê phân loại theo khóa
      const total = debtData.length;
      let count12 = 0;
      let count11 = 0;
      let count10 = 0;

      debtData.forEach((s) => {
        const kName = s.khoaHoc?.ten_khoa_hoc || '';
        if (kName.includes('12')) count12++;
        else if (kName.includes('11')) count11++;
        else if (kName.includes('10')) count10++;
        else count10++; // Các khóa cũ hơn nếu có
      });

      const uniqueClasses = [...new Set(debtData.map((s) => s.lop || s.ten_lop).filter(Boolean))].sort();
      setClasses(uniqueClasses);

      const uniqueKhoas = [...new Set(debtData.map((s) => s.khoaHoc?.ten_khoa_hoc).filter(Boolean))].sort();
      setKhoas(uniqueKhoas);

      setStats({
        total,
        k12: count12,
        k11: count11,
        k10: count10,
        pct12: total > 0 ? ((count12 / total) * 100).toFixed(1) : '0.0',
        pct11: total > 0 ? ((count11 / total) * 100).toFixed(1) : '0.0',
        pct10: total > 0 ? ((count10 / total) * 100).toFixed(1) : '0.0',
        classesCount: uniqueClasses.length
      });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo sinh viên nợ môn:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      s.mssv?.toLowerCase().includes(term) ||
      s.ho_ten?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      (s.lop || s.ten_lop)?.toLowerCase().includes(term);

    const matchClass = selectedClass === 'All' || (s.lop || s.ten_lop) === selectedClass;
    const matchKhoa = selectedKhoaFilter === 'All' || s.khoaHoc?.ten_khoa_hoc === selectedKhoaFilter;

    return matchSearch && matchClass && matchKhoa;
  });

  const totalPages = Math.ceil(filteredStudents.length / limit) || 1;
  const paginatedData = filteredStudents.slice((currentPage - 1) * limit, currentPage * limit);

  const exportExcel = () => {
    exportDanhSachHocLai(filteredStudents);
  };

  const handleBack = () => {
    navigate(window.location.pathname.includes('/clb') ? '/clb/reports' : '/khoa/reports');
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6 flex-wrap">
        <span className="cursor-pointer hover:text-[#407F3E] transition-colors" onClick={handleBack}>Báo cáo thống kê</span>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-[#407F3E] font-bold">Danh sách sinh viên nợ môn</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 bg-white border border-[#E7E0C4] hover:border-[#407F3E] text-slate-500 hover:text-[#407F3E] rounded-xl transition-all shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Danh sách sinh viên nợ môn</h1>
              <span className="px-3 py-1 bg-[#407F3E]/10 border border-[#407F3E]/30 text-[#407F3E] text-xs font-bold rounded-full">
                Khóa cũ chưa đạt
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Thống kê toàn bộ sinh viên thuộc các khóa cũ (cũ hơn khóa hiện tại) chưa đạt hoặc còn nợ học phần kiến tập doanh nghiệp.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards: Bố cục tầng hiện đại chống rớt dòng chữ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Tổng SV nợ môn */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E0C4] shadow-sm flex flex-col justify-between hover:border-[#407F3E] transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Tổng SV nợ môn
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#407F3E]/10 flex items-center justify-center text-[#407F3E] shrink-0 border border-[#407F3E]/20">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {stats.total} <span className="text-xs font-medium text-slate-400">SV</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Toàn thể các khóa cũ chưa đạt</p>
          </div>
        </div>

        {/* Card 2: Khóa 12 */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider whitespace-nowrap">
              Khóa 12 (Nợ môn)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700 tracking-tight">
              {stats.k12} <span className="text-xs font-medium text-amber-400">SV</span>
            </div>
            <p className="text-xs text-amber-600/80 mt-1 font-medium">Chiếm {stats.pct12}% tổng SV nợ môn</p>
          </div>
        </div>

        {/* Card 3: Khóa 11 */}
        <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider whitespace-nowrap">
              Khóa 11 (Nợ môn)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-700 tracking-tight">
              {stats.k11} <span className="text-xs font-medium text-indigo-400">SV</span>
            </div>
            <p className="text-xs text-indigo-600/80 mt-1 font-medium">Chiếm {stats.pct11}% tổng SV nợ môn</p>
          </div>
        </div>

        {/* Card 4: Khóa 10 & cũ hơn */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm flex flex-col justify-between hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider whitespace-nowrap">
              Khóa 10 (Nợ môn)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-700 tracking-tight">
              {stats.k10} <span className="text-xs font-medium text-rose-400">SV</span>
            </div>
            <p className="text-xs text-rose-500/80 mt-1 font-medium">Ưu tiên trả nợ gấp ({stats.pct10}%)</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative min-w-[260px] flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm MSSV, họ tên, lớp, email..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#407F3E]/30 focus:border-[#407F3E] transition-all"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dropdown Khóa */}
          <div className="relative min-w-[170px]">
            <div
              onClick={(e) => { e.stopPropagation(); setIsKhoaDropdownOpen(!isKhoaDropdownOpen); setIsClassDropdownOpen(false); }}
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isKhoaDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]/30' : 'border-[#E7E0C4]'}`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <GraduationCap className="w-4 h-4 text-[#407F3E] shrink-0" />
                <span className={`truncate font-medium ${selectedKhoaFilter !== 'All' ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                  {selectedKhoaFilter === 'All' ? 'Tất cả Khóa' : selectedKhoaFilter}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isKhoaDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[180px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4]/50">
                  <input
                    type="text"
                    placeholder="Tìm khóa..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-[#407F3E]"
                    value={searchKhoa}
                    onChange={(e) => setSearchKhoa(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="overflow-y-auto max-h-56">
                  {['All', ...khoas].filter(opt => opt === 'All' || opt.toLowerCase().includes(searchKhoa.toLowerCase())).map(opt => (
                    <div
                      key={opt}
                      onClick={() => { setSelectedKhoaFilter(opt); setIsKhoaDropdownOpen(false); setSearchKhoa(''); setCurrentPage(1); }}
                      className={`px-3.5 py-2 text-xs cursor-pointer flex justify-between items-center transition-colors ${selectedKhoaFilter === opt ? 'bg-[#E7E0C4]/50 text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/20'}`}
                    >
                      <span className="truncate pr-2">{opt === 'All' ? 'Tất cả Khóa' : opt}</span>
                      {selectedKhoaFilter === opt && <Check className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dropdown Lớp */}
          <div className="relative min-w-[170px]">
            <div
              onClick={(e) => { e.stopPropagation(); setIsClassDropdownOpen(!isClassDropdownOpen); setIsKhoaDropdownOpen(false); }}
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isClassDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]/30' : 'border-[#E7E0C4]'}`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span className={`truncate font-medium ${selectedClass !== 'All' ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                  {selectedClass === 'All' ? 'Tất cả Lớp' : selectedClass}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isClassDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4]/50">
                  <input
                    type="text"
                    placeholder="Tìm lớp..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-[#407F3E]"
                    value={searchClass}
                    onChange={(e) => setSearchClass(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="overflow-y-auto max-h-56">
                  {['All', ...classes].filter(opt => opt === 'All' || opt.toLowerCase().includes(searchClass.toLowerCase())).map(opt => (
                    <div
                      key={opt}
                      onClick={() => { setSelectedClass(opt); setIsClassDropdownOpen(false); setSearchClass(''); setCurrentPage(1); }}
                      className={`px-3.5 py-2 text-xs cursor-pointer flex justify-between items-center transition-colors ${selectedClass === opt ? 'bg-[#E7E0C4]/50 text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/20'}`}
                    >
                      <span className="truncate pr-2">{opt === 'All' ? 'Tất cả Lớp' : opt}</span>
                      {selectedClass === opt && <Check className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Excel Button */}
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-[#407F3E] hover:bg-[#346832] text-white rounded-xl text-sm font-bold shadow-sm transition-colors ml-auto shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4] whitespace-nowrap">
                <th className="py-3.5 px-4 text-center w-14">STT</th>
                <th className="py-3.5 px-4 min-w-[125px]">MSSV</th>
                <th className="py-3.5 px-4 min-w-[185px]">Họ và tên</th>
                <th className="py-3.5 px-4 min-w-[110px]">Lớp</th>
                <th className="py-3.5 px-4 min-w-[110px]">Khóa</th>
                <th className="py-3.5 px-4 min-w-[180px]">Email</th>
                <th className="py-3.5 px-4 min-w-[140px]">Tình trạng</th>
                <th className="py-3.5 px-4 min-w-[240px]">Ghi chú / Tình trạng học vụ</th>
                <th className="py-3.5 px-4 text-center w-16">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                // Loading Skeleton
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-6 mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-14"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="p-4"><div className="h-8 w-8 bg-slate-200 rounded-lg mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={9} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <AlertTriangle className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-semibold text-base text-slate-600">Không có dữ liệu sinh viên phù hợp</p>
                      <p className="text-sm mt-1 text-slate-400">Hệ thống chưa ghi nhận sinh viên nợ môn nào thuộc bộ lọc đã chọn.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((s, idx) => (
                  <tr key={s.id || idx} className="hover:bg-slate-50/80 transition-colors whitespace-nowrap">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">
                      {(currentPage - 1) * limit + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{s.mssv}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{s.ho_ten}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{s.lop || s.ten_lop}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{s.khoaHoc?.ten_khoa_hoc}</td>
                    <td className="py-3.5 px-4">
                      {s.email ? (
                        <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[140px] block" title={s.email}>{s.email}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Chưa cập nhật</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                        <RotateCcw className="w-3 h-3" />
                        <span>Nợ môn kiến tập</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-slate-700">
                        {s.ly_do || 'Nợ học phần kiến tập (Cần học lại)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.email ? (
                        <a
                          href={`mailto:${s.email}?subject=Thông báo nhắc nhở học phần Kiến tập HUIT`}
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <SearchableDropdown
              options={[
                { value: 15, label: '15' },
                { value: 30, label: '30' },
                { value: 50, label: '50' },
                { value: 100, label: '100' }
              ]}
              value={limit}
              onChange={(val) => { setLimit(Number(val)); setCurrentPage(1); }}
              className="w-20"
              direction="up"
            />
            <span>/ tổng <strong className="text-slate-800">{filteredStudents.length}</strong> sinh viên nợ môn</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-[#E7E0C4] rounded-lg text-xs font-bold text-slate-600 hover:bg-[#E7E0C4]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Trang đầu
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-[#E7E0C4] rounded-lg text-xs font-bold text-slate-600 hover:bg-[#E7E0C4]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Trước
            </button>
            <div className="px-3.5 py-1.5 bg-[#407F3E] text-white rounded-lg text-xs font-bold shadow-xs mx-0.5">
              Trang {currentPage} / {totalPages}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 border border-[#E7E0C4] rounded-lg text-xs font-bold text-slate-600 hover:bg-[#E7E0C4]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Sau
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 border border-[#E7E0C4] rounded-lg text-xs font-bold text-slate-600 hover:bg-[#E7E0C4]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
