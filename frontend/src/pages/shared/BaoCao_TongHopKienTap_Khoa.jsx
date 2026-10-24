import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, FileSpreadsheet, ChevronRight, CheckCircle2, AlertCircle, Clock, Users, UserCheck, Check, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import { exportTongHopKienTap } from '../../utils/exportExcel';

export default function BaoCao_TongHopKienTap_Khoa() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dotOrLichId = searchParams.get('dotKienTapId') || searchParams.get('lichKienTapId');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [campaignName, setCampaignName] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [searchClassInput, setSearchClassInput] = useState('');

  const [selectedGVHD, setSelectedGVHD] = useState('All');
  const [isGVHDDropdownOpen, setIsGVHDDropdownOpen] = useState(false);
  const [searchGVHDInput, setSearchGVHDInput] = useState('');

  const [progressFilter, setProgressFilter] = useState('All'); // 'All' | 'DuDieuKien' | 'ThieuOffline' | 'ThieuBaoCao'
  const [isProgressDropdownOpen, setIsProgressDropdownOpen] = useState(false);

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
      const enrollParams = { limit: 10000 };
      if (searchParams.get('dotKienTapId')) {
        enrollParams.dotKienTapId = Number(searchParams.get('dotKienTapId'));
      } else if (searchParams.get('lichKienTapId')) {
        enrollParams.lichKienTapId = Number(searchParams.get('lichKienTapId'));
      } else if (dotOrLichId) {
        enrollParams.dotKienTapId = Number(dotOrLichId);
      }

      const [campaignsRes, enrollmentsRes] = await Promise.all([
        khoaApi.getCampaigns({ limit: 1000 }),
        khoaApi.getEnrollments(enrollParams)
      ]);

      const campaigns = campaignsRes.data?.data || campaignsRes.data || [];
      const currentCampaign = campaigns.find(c => String(c.id) === String(dotOrLichId));
      if (currentCampaign) {
        setCampaignName(currentCampaign.ten_dot);
      }

      const rawEnrollments = enrollmentsRes.data?.data || enrollmentsRes.data || [];

      const processed = rawEnrollments.map(e => {
        const sv = e.sinhVien || {};
        const trips = e.trips || [];
        const offlineTrips = trips.filter(t => t.hinh_thuc === 'TrucTiep' || String(t.hinh_thuc).toLowerCase().includes('off'));
        const onlineTrips = trips.filter(t => t.hinh_thuc === 'TrucTuyen' || String(t.hinh_thuc).toLowerCase().includes('onl'));
        const reportsCount = trips.filter(t => t.diem_thu_hoach != null || t.diem_bao_cao != null || t.hasReport).length;
        const gvhd = e.giangVienHuongDan?.ho_ten || sv.details?.giangVienHuongDan?.ho_ten || e.gvhd || '';
        
        const soNMOffline = e.so_nm_off !== undefined ? e.so_nm_off : offlineTrips.length;
        const soNMOnline = e.so_nm_onl !== undefined ? e.so_nm_onl : onlineTrips.length;
        const tongNM = e.tong_nm !== undefined ? e.tong_nm : (soNMOffline + soNMOnline);
        const isDuDieuKien = soNMOffline >= 2 && soNMOnline >= 1 && reportsCount >= 3;

        return {
          id: e.id || sv.id || Math.random(),
          raw: e,
          sinhVien: sv,
          mssv: sv.mssv,
          ho_ten: sv.ho_ten,
          lop: sv.ten_lop || sv.lop || '',
          gvhd: gvhd || 'Chưa phân công',
          so_nm_off: soNMOffline,
          so_nm_onl: soNMOnline,
          tong_nm: tongNM,
          so_bao_cao: reportsCount,
          isDuDieuKien,
          trang_thai: e.trang_thai,
          trips: trips,
          ghi_chu: e.ghi_chu || ''
        };
      });

      setData(processed);
    } catch (error) {
      console.error('Error fetching review progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = data.length;
    const duDieuKien = data.filter(d => d.isDuDieuKien).length;
    const thieuChuyen = data.filter(d => d.so_nm_off < 2 || d.so_nm_onl < 1).length;
    const thieuBaoCao = data.filter(d => d.so_bao_cao < 3).length;
    const coGVHD = data.filter(d => d.gvhd && d.gvhd !== 'Chưa phân công').length;

    return { total, duDieuKien, thieuChuyen, thieuBaoCao, coGVHD };
  }, [data]);

  // Dropdown list options
  const classes = useMemo(() => {
    return [...new Set(data.map(d => d.lop).filter(Boolean))].sort();
  }, [data]);

  const gvhdList = useMemo(() => {
    return [...new Set(data.map(d => d.gvhd).filter(Boolean))].sort();
  }, [data]);

  // Filter & Sort
  const filteredData = useMemo(() => {
    return data.filter(d => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || 
        d.mssv?.toLowerCase().includes(q) || 
        d.ho_ten?.toLowerCase().includes(q);

      const matchClass = selectedClass === 'All' || d.lop === selectedClass;
      const matchGVHD = selectedGVHD === 'All' || d.gvhd === selectedGVHD;

      let matchProgress = true;
      if (progressFilter === 'DuDieuKien') matchProgress = d.isDuDieuKien;
      else if (progressFilter === 'ThieuOffline') matchProgress = d.so_nm_off < 2;
      else if (progressFilter === 'ThieuBaoCao') matchProgress = d.so_bao_cao < 3;

      return matchSearch && matchClass && matchGVHD && matchProgress;
    });
  }, [data, searchTerm, selectedClass, selectedGVHD, progressFilter]);

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

  const handleExport = () => {
    const exportRawList = filteredData.map(d => d.raw || d);
    exportTongHopKienTap(exportRawList, campaignName);
  };

  const handleBack = () => {
    const isCLB = window.location.pathname.includes('/clb');
    navigate(isCLB ? '/clb/reports' : '/khoa/reports');
  };

  const closeDropdowns = () => {
    setIsClassDropdownOpen(false);
    setIsGVHDDropdownOpen(false);
    setIsProgressDropdownOpen(false);
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300" onClick={closeDropdowns}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6 print:hidden">
        <span className="cursor-pointer hover:text-[#407F3E] transition-colors" onClick={handleBack}>
          Báo cáo thống kê
        </span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#407F3E]">Tổng hợp kết quả học phần Kiến tập (Gửi SV kiểm tra)</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack} 
            className="p-2.5 bg-white border border-[#E7E0C4] hover:border-[#407F3E] text-slate-600 hover:text-[#407F3E] rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Tổng hợp kết quả học phần Kiến tập
              </h1>
              {campaignName && (
                <span className="px-3 py-1 bg-[#407F3E]/10 text-[#407F3E] text-xs font-bold rounded-full border border-[#407F3E]/20">
                  {campaignName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Bảng tiến độ chi tiết (số nhà máy, số bài nộp, GVHD) phục vụ rà soát và gửi sinh viên kiểm tra trước khi chốt kết quả.
            </p>
          </div>
        </div>

        <button 
          onClick={handleExport} 
          className="flex items-center gap-2 px-5 py-2.5 bg-[#407F3E] hover:bg-[#346632] text-white rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer hover:shadow-md"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Excel (Chuẩn 4 Sheet)</span>
        </button>
      </div>

      {/* KPIs Summary */}
      {!loading && kpis.total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:hidden">
          <div className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng sinh viên</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{kpis.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#407F3E] uppercase tracking-wider">Đủ điều kiện kiểm tra</p>
              <h3 className="text-2xl font-black text-[#407F3E] mt-1">{kpis.duDieuKien}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">&ge; 2 TT, &ge; 1 TL, 3 bài nộp</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#407F3E]/10 flex items-center justify-center text-[#407F3E]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#E68A8C] uppercase tracking-wider">Cần bổ sung</p>
              <h3 className="text-2xl font-black text-[#E68A8C] mt-1">{kpis.thieuChuyen + kpis.thieuBaoCao > 0 ? kpis.total - kpis.duDieuKien : 0}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Thiếu chuyến đi hoặc bài nộp</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#E68A8C]/10 flex items-center justify-center text-[#E68A8C]">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">Đã phân công GVHD</p>
              <h3 className="text-2xl font-black text-teal-700 mt-1">{kpis.coGVHD}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Trên tổng số {kpis.total} SV</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-center gap-4 mb-6 relative z-20 print:hidden">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo MSSV hoặc Họ tên..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Lớp filter */}
        <div className="relative min-w-[170px]">
          <div 
            onClick={(e) => { e.stopPropagation(); setIsClassDropdownOpen(!isClassDropdownOpen); setIsGVHDDropdownOpen(false); setIsProgressDropdownOpen(false); }}
            className={`w-full px-3.5 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isClassDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="text-slate-700 font-medium truncate">{selectedClass === 'All' ? 'Tất cả lớp' : selectedClass}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>
          {isClassDropdownOpen && (
            <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 w-56 mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              <div className="p-2 border-b border-[#E7E0C4]">
                <input 
                  type="text" 
                  placeholder="Tìm lớp..." 
                  value={searchClassInput} 
                  onChange={(e) => setSearchClassInput(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-[#E7E0C4] rounded text-xs focus:outline-none focus:border-[#407F3E]"
                />
              </div>
              <div className="max-h-56 overflow-y-auto">
                {['All', ...classes]
                  .filter(c => c === 'All' ? 'tất cả lớp'.includes(searchClassInput.toLowerCase()) : c.toLowerCase().includes(searchClassInput.toLowerCase()))
                  .map(c => (
                    <div 
                      key={c}
                      onClick={() => { setSelectedClass(c); setIsClassDropdownOpen(false); setSearchClassInput(''); setCurrentPage(1); }}
                      className={`px-3.5 py-2 text-xs cursor-pointer flex justify-between items-center hover:bg-[#E7E0C4]/40 ${selectedClass === c ? 'bg-[#E7E0C4] font-bold text-slate-800' : 'text-slate-700'}`}
                    >
                      <span>{c === 'All' ? 'Tất cả lớp' : c}</span>
                      {selectedClass === c && <Check className="w-3.5 h-3.5 text-[#407F3E]" />}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* GVHD filter */}
        <div className="relative min-w-[200px]">
          <div 
            onClick={(e) => { e.stopPropagation(); setIsGVHDDropdownOpen(!isGVHDDropdownOpen); setIsClassDropdownOpen(false); setIsProgressDropdownOpen(false); }}
            className={`w-full px-3.5 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isGVHDDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="text-slate-700 font-medium truncate">{selectedGVHD === 'All' ? 'Tất cả GVHD' : selectedGVHD}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>
          {isGVHDDropdownOpen && (
            <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 w-64 mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              <div className="p-2 border-b border-[#E7E0C4]">
                <input 
                  type="text" 
                  placeholder="Tìm GVHD..." 
                  value={searchGVHDInput} 
                  onChange={(e) => setSearchGVHDInput(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-[#E7E0C4] rounded text-xs focus:outline-none focus:border-[#407F3E]"
                />
              </div>
              <div className="max-h-56 overflow-y-auto">
                {['All', ...gvhdList]
                  .filter(g => g === 'All' ? 'tất cả gvhd'.includes(searchGVHDInput.toLowerCase()) : g.toLowerCase().includes(searchGVHDInput.toLowerCase()))
                  .map(g => (
                    <div 
                      key={g}
                      onClick={() => { setSelectedGVHD(g); setIsGVHDDropdownOpen(false); setSearchGVHDInput(''); setCurrentPage(1); }}
                      className={`px-3.5 py-2 text-xs cursor-pointer flex justify-between items-center hover:bg-[#E7E0C4]/40 ${selectedGVHD === g ? 'bg-[#E7E0C4] font-bold text-slate-800' : 'text-slate-700'}`}
                    >
                      <span className="truncate">{g === 'All' ? 'Tất cả GVHD' : g}</span>
                      {selectedGVHD === g && <Check className="w-3.5 h-3.5 text-[#407F3E]" />}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Tình trạng tiến độ */}
        <div className="min-w-[210px]">
          <SearchableDropdown
            options={[
              { value: 'All', label: 'Tất cả tiến độ' },
              { value: 'DuDieuKien', label: 'Đủ điều kiện kiểm tra' },
              { value: 'ThieuOffline', label: 'Thiếu chuyến Offline (< 2)' },
              { value: 'ThieuBaoCao', label: 'Thiếu bài nộp (< 3)' }
            ]}
            value={progressFilter}
            onChange={(val) => {
              setProgressFilter(val);
              setCurrentPage(1);
            }}
            placeholder="Tất cả tiến độ"
            searchPlaceholder="Tìm tiến độ..."
            className="w-full"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden flex flex-col relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 w-16 text-center">STT</th>
                <th className="p-4">Mã HS-SV</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Lớp học</th>
                <th className="p-4">GVHD</th>
                <th className="p-4 text-center">Số NM Offline</th>
                <th className="p-4 text-center">Số bài nộp</th>
                <th className="p-4 text-center">Tiến độ</th>
                <th className="p-4">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-44"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-24 mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-semibold text-base text-slate-500">Không tìm thấy sinh viên nào theo bộ lọc</p>
                      <p className="text-sm mt-1">Thay đổi điều kiện lọc hoặc chọn đợt kiến tập khác.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 text-center text-slate-400 font-mono text-xs">
                      {(currentPage - 1) * limit + idx + 1}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#407F3E]">{s.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{s.ho_ten}</td>
                    <td className="p-4 font-medium text-slate-600">{s.lop || '-'}</td>
                    <td className="p-4 font-medium text-slate-700">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                        s.gvhd && s.gvhd !== 'Chưa phân công' ? 'bg-slate-100 text-slate-700' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {s.gvhd}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs ${
                        s.so_nm_off >= 2 ? 'bg-[#407F3E]/10 text-[#407F3E]' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {s.so_nm_off} / 2
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs ${
                        s.so_bao_cao >= 3 ? 'bg-[#407F3E]/10 text-[#407F3E]' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {s.so_bao_cao} / 3
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {s.isDuDieuKien ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#407F3E]/10 text-[#407F3E] border border-[#407F3E]/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đủ điều kiện</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C]/15 text-[#c25154] border border-[#E68A8C]/30">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Chưa đủ chuyến / bài</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-xs italic">
                      {s.ghi_chu || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
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
              searchPlaceholder="Số lượng..."
              className="min-w-[80px]"
              direction="up"
            />
            <span>/ {filteredData.length} sinh viên</span>
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
