import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, CheckCircle, FileSpreadsheet, ChevronRight, Check, X, Users, Percent, FileText, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import { exportDanhSachDuDieuKien } from '../../utils/exportExcel';

export default function BaoCao_SVDuDieuKien_Khoa() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dotKienTapId = searchParams.get('dotKienTapId');
  const lichKienTapId = searchParams.get('lichKienTapId');
  const dotOrLichId = dotKienTapId || lichKienTapId;

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [scheduleName, setScheduleName] = useState('');
  
  const [stats, setStats] = useState({
    totalEligible: 0,
    totalEnrolled: 0,
    assignedCount: 0,
    submittedReport: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [searchLopDropdown, setSearchLopDropdown] = useState('');
  const [classes, setClasses] = useState([]);

  // Board Status Filter
  const [selectedBoardStatus, setSelectedBoardStatus] = useState('All'); // 'All' | 'Assigned' | 'Unassigned'
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    if (dotOrLichId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [dotOrLichId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const reportParams = {};
      if (dotKienTapId) {
        reportParams.dotKienTapId = Number(dotKienTapId);
      } else if (lichKienTapId) {
        reportParams.lichKienTapId = Number(lichKienTapId);
      }

      const enrollParams = { limit: 10000 };
      if (dotKienTapId) enrollParams.dotKienTapId = Number(dotKienTapId);
      else if (lichKienTapId) enrollParams.lichKienTapId = Number(lichKienTapId);

      const [campaignsRes, schedulesRes, eligibleRes, enrollmentsRes] = await Promise.allSettled([
        khoaApi.getCampaigns({ limit: 1000 }),
        khoaApi.getSchedules(),
        khoaApi.getEligibleStudentsReport(reportParams),
        khoaApi.getEnrollments(enrollParams)
      ]);

      const campaigns = campaignsRes.status === 'fulfilled' ? (campaignsRes.value.data?.data || campaignsRes.value.data || []) : [];
      const currentCampaign = campaigns.find(c => String(c.id) === String(dotOrLichId));
      if (currentCampaign) {
        setScheduleName(currentCampaign.ten_dot);
      } else {
        const schedules = schedulesRes.status === 'fulfilled' ? (schedulesRes.value.data || []) : [];
        const currentSchedule = schedules.find(s => String(s.id) === String(dotOrLichId));
        if (currentSchedule) {
          setScheduleName(currentSchedule.ten_lich);
        }
      }

      const eligibleData = eligibleRes.status === 'fulfilled' ? (eligibleRes.value.data || []) : [];
      const enrollData = enrollmentsRes.status === 'fulfilled' ? (enrollmentsRes.value.data?.data || enrollmentsRes.value.data || []) : [];

      // Link enrollment data to students to ensure all details are consistent
      const processedStudents = eligibleData.map(sv => {
        const en = enrollData.find(e => e.sinh_vien_id === sv.id);
        const soNMOff = sv.so_nm_off !== undefined ? sv.so_nm_off : (en?.so_nm_off || 0);
        const soNMOnl = sv.so_nm_onl !== undefined ? sv.so_nm_onl : (en?.so_nm_onl || 0);
        const gvhd = sv.gvhd && sv.gvhd !== 'Chưa phân công' 
          ? sv.gvhd 
          : (en?.giangVienHuongDan?.ho_ten || en?.gvhd || 'Chưa phân công');
        const soBaiNop = sv.so_bai_nop !== undefined 
          ? sv.so_bai_nop 
          : (en?.trips ? en.trips.filter(t => t.diem_thu_hoach != null || t.diem_bao_cao != null || t.hasReport).length : 0);

        return {
          ...sv,
          lop: sv.ten_lop || sv.lop || '',
          so_nm_off: soNMOff,
          so_nm_onl: soNMOnl,
          tong_nm: soNMOff + soNMOnl,
          gvhd,
          hoi_dong: sv.hoi_dong || null,
          dia_diem_hd: sv.dia_diem_hd || null,
          ngay_bao_cao_hd: sv.ngay_bao_cao_hd || null,
          so_bai_nop: soBaiNop,
          hasSubmitted: sv.hasSubmitted !== undefined ? sv.hasSubmitted : (soBaiNop > 0 || !!(en && en.file_bao_cao)),
          isDuDieuKien: true
        };
      });

      setStudents(processedStudents);

      // Stats
      const totalEnrolled = enrollData.length;
      const totalEligible = processedStudents.length;
      const assignedCount = processedStudents.filter(s => !!s.hoi_dong).length;
      const submittedReport = processedStudents.filter(s => s.hasSubmitted || s.so_bai_nop > 0).length;
      
      const uniqueClasses = [...new Set(processedStudents.map(s => s.lop).filter(Boolean))];
      setClasses(uniqueClasses);

      setStats({
        totalEligible,
        totalEnrolled,
        assignedCount,
        submittedReport
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || 
        s.mssv?.toLowerCase().includes(q) || 
        s.ho_ten?.toLowerCase().includes(q);

      const matchClass = selectedClass === 'All' || s.lop === selectedClass;

      let matchBoard = true;
      if (selectedBoardStatus === 'Assigned') matchBoard = !!s.hoi_dong;
      else if (selectedBoardStatus === 'Unassigned') matchBoard = !s.hoi_dong;

      return matchSearch && matchClass && matchBoard;
    });
  }, [students, searchTerm, selectedClass, selectedBoardStatus]);

  const totalPages = Math.ceil(filteredStudents.length / limit) || 1;
  const paginatedData = filteredStudents.slice((currentPage - 1) * limit, currentPage * limit);

  const exportExcel = () => {
    exportDanhSachDuDieuKien(filteredStudents, scheduleName);
  };

  const handleBack = () => {
    navigate(window.location.pathname.includes('/clb') ? '/clb/reports' : '/khoa/reports');
  };

  const closeDropdowns = () => {
    setIsClassDropdownOpen(false);
    setIsBoardDropdownOpen(false);
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300" onClick={closeDropdowns}>
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6">
        <span className="cursor-pointer hover:text-[#407F3E] transition-colors" onClick={handleBack}>Báo cáo thống kê</span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="text-[#407F3E] font-bold">Danh sách SV đủ điều kiện báo cáo</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 bg-white border border-[#E7E0C4] hover:border-[#407F3E] text-slate-500 hover:text-[#407F3E] rounded-xl transition-all shadow-sm cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Danh sách SV đủ điều kiện báo cáo</h1>
              {scheduleName && (
                <span className="px-3 py-1 bg-[#407F3E]/10 text-[#407F3E] text-xs font-bold rounded-full border border-[#407F3E]/20">
                  {scheduleName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Rà soát điều kiện chuyến tham quan, bài thu hoạch và giảng viên hướng dẫn để sẵn sàng lập hội đồng chấm báo cáo.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* KPI 1: Tổng đủ điều kiện */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#407F3E]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-[#407F3E]/10 rounded-2xl flex items-center justify-center text-[#407F3E] shrink-0 relative z-10 border border-[#407F3E]/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tổng SV đủ điều kiện</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalEligible} <span className="text-sm text-slate-400 font-medium">SV</span></h3>
            <p className="text-[11px] text-slate-400 mt-0.5">&ge; 2 trực tiếp, &ge; 1 trực tuyến</p>
          </div>
        </div>

        {/* KPI 2: Đã phân công hội đồng */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#89B449]/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-[#89B449]/15 rounded-2xl flex items-center justify-center text-[#407F3E] shrink-0 relative z-10 border border-[#89B449]/25">
            <Users className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Đã phân công Hội đồng</p>
            <h3 className="text-3xl font-black text-slate-800">
              {stats.assignedCount} <span className="text-sm text-slate-400 font-medium">/ {stats.totalEligible} SV</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats.totalEligible - stats.assignedCount > 0 
                ? `Còn ${stats.totalEligible - stats.assignedCount} SV chưa có hội đồng` 
                : '100% đã được gán hội đồng'}
            </p>
          </div>
        </div>

        {/* KPI 3: Đã nộp bài báo cáo */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#407F3E]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-[#407F3E]/10 rounded-2xl flex items-center justify-center text-[#407F3E] shrink-0 relative z-10 border border-[#407F3E]/20">
            <FileText className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Đã nộp bài thu hoạch</p>
            <h3 className="text-3xl font-black text-slate-800">
              {stats.submittedReport} <span className="text-sm text-slate-400 font-medium">/ {stats.totalEligible} SV</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sẵn sàng để Hội đồng chấm điểm</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 mb-6 relative z-20">
        <div className="relative min-w-[260px] flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo MSSV hoặc Họ tên..." 
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Lớp Dropdown */}
          <div className="relative min-w-[170px] w-full md:w-auto">
            <div 
              onClick={(e) => { e.stopPropagation(); setIsClassDropdownOpen(!isClassDropdownOpen); setIsBoardDropdownOpen(false); }}
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isClassDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
            >
              <span className="text-slate-700 font-medium truncate pr-1">{selectedClass === 'All' ? 'Tất cả lớp' : selectedClass}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
            </div>
            {isClassDropdownOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full right-0 w-full md:w-56 mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col"
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

          {/* Trạng thái Hội đồng Dropdown */}
          <div className="min-w-[190px] w-full md:w-auto">
            <SearchableDropdown
              options={[
                { value: 'All', label: 'Tất cả Hội đồng' },
                { value: 'Assigned', label: 'Đã phân hội đồng' },
                { value: 'Unassigned', label: 'Chưa phân công' }
              ]}
              value={selectedBoardStatus}
              onChange={(val) => {
                setSelectedBoardStatus(val);
                setCurrentPage(1);
              }}
              placeholder="Tất cả Hội đồng"
              searchPlaceholder="Tìm hội đồng..."
              className="w-full"
            />
          </div>

          <button 
            onClick={() => navigate(window.location.pathname.includes('/clb') ? '/clb/boards' : `/khoa/boards${dotOrLichId ? `?dotKienTapId=${dotOrLichId}` : ''}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#407F3E] hover:bg-[#346632] text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Users className="w-4 h-4" />
            <span>Lập hội đồng</span>
          </button>

          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-[#E7E0C4] text-slate-700 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-[#407F3E]" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#D8D0B0] whitespace-nowrap">
                <th className="py-3.5 px-4 text-center w-14">STT</th>
                <th className="py-3.5 px-4 min-w-[125px]">MSSV</th>
                <th className="py-3.5 px-4 min-w-[185px]">Họ và tên</th>
                <th className="py-3.5 px-4 min-w-[110px]">Lớp</th>
                <th className="py-3.5 px-4 min-w-[160px]">GVHD</th>
                <th className="py-3.5 px-4 text-center min-w-[145px]">Điều kiện báo cáo</th>
                <th className="py-3.5 px-4 text-center min-w-[180px]">Hội đồng phân công</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                // Loading Skeleton
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-44"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="p-4"><div className="h-6 w-24 bg-slate-200 rounded-full mx-auto"></div></td>
                    <td className="p-4"><div className="h-6 w-28 bg-slate-200 rounded-full mx-auto"></div></td>
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
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">
                      {(currentPage - 1) * limit + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{s.mssv}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{s.ho_ten}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{s.lop}</td>
                    
                    {/* GVHD */}
                    <td className="py-3.5 px-4">
                      {s.gvhd && s.gvhd !== 'Chưa phân công' ? (
                        <span className="font-semibold text-slate-700">{s.gvhd}</span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa phân công</span>
                      )}
                    </td>

                    {/* Điều kiện báo cáo */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#407F3E]/10 text-[#407F3E] border border-[#407F3E]/25 whitespace-nowrap">
                        Đủ điều kiện
                      </span>
                    </td>

                    {/* Hội đồng phân công */}
                    <td className="py-3.5 px-4 text-center">
                      {s.hoi_dong ? (
                        <span 
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#407F3E] text-white shadow-sm whitespace-nowrap"
                          title={s.dia_diem_hd ? `Địa điểm: Phòng ${s.dia_diem_hd}` : ''}
                        >
                          <span>Hội đồng {s.hoi_dong}</span>
                          {s.dia_diem_hd && <span className="opacity-90 font-normal">({s.dia_diem_hd})</span>}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          Chưa phân công
                        </span>
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
              onChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
              searchPlaceholder="Tìm số lượng..."
              className="min-w-[80px]"
              direction="up"
            />
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
