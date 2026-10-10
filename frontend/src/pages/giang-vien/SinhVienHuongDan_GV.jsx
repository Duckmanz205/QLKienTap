import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ChevronDown, Check, Eye, Edit3, X, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { giangVienApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function SinhVienHuongDan_GV() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [lecturer, setLecturer] = useState(null);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);

  // Filter Popover States
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [searchClassDropdown, setSearchClassDropdown] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [searchStatusDropdown, setSearchStatusDropdown] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const closeAllDropdowns = () => {
    setIsClassDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchData(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchData = async (gvId) => {
    try {
      setLoading(true);
      const [studentsRes, reportsRes] = await Promise.all([
        giangVienApi.getGuidedStudents(gvId),
        giangVienApi.getGuidedReports(gvId, { limit: 1000 })
      ]);
      
      const stData = studentsRes.data || [];
      const rpData = reportsRes.data?.data || reportsRes.data || [];
      
      setReports(rpData);
      
      // Map to UI model
      const mappedStudents = stData.map(st => {
        const sv = st.sinhVien || {};
        
        // Find reports for this student
        const studentReports = rpData.filter(r => (r.phieuThamQuan?.phieuDangKy?.sinhVien?.id === sv.id) || (r.phieuDangKy?.sinhVien?.id === sv.id));
        const pendingReports = studentReports.filter(r => r.diem_thu_hoach === null);
        
        return {
          id: st.id,
          mssv: sv.mssv,
          name: sv.ho_ten,
          lop: sv.ten_lop || '--',
          soChuyenHT: studentReports.length, 
          soChuyenYC: 3, 
          baiChoCham: pendingReports.length,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sv.ho_ten || 'SV')}&background=f1f5f9&color=475569`,
          rawSv: sv,
          studentReports: studentReports
        };
      });
      
      // Deduplicate by student ID in case a student is assigned multiple times
      const uniqueStudentsMap = new Map();
      mappedStudents.forEach(st => {
        if (!uniqueStudentsMap.has(st.mssv)) {
          uniqueStudentsMap.set(st.mssv, st);
        }
      });
      
      setStudents(Array.from(uniqueStudentsMap.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique class list
  const classList = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      if (s.lop && s.lop !== '--') set.add(s.lop);
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtered & Paginated logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = !searchQuery || 
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (s.mssv && s.mssv.includes(searchQuery));
      const matchClass = selectedClass === 'ALL' || s.lop === selectedClass;
      const matchStatus = selectedStatus === 'ALL' || 
        (selectedStatus === 'PENDING' && s.baiChoCham > 0) || 
        (selectedStatus === 'DONE' && s.baiChoCham === 0);
      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchQuery, selectedClass, selectedStatus]);

  const totalPages = Math.ceil(filteredStudents.length / limit) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Sinh viên hướng dẫn</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo MSSV/họ tên..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all text-slate-800 font-medium"
          />
        </div>

        {/* Lớp Dropdown */}
        <div className="relative min-w-[200px]" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => {
              setIsClassDropdownOpen(!isClassDropdownOpen);
              setIsStatusDropdownOpen(false);
            }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isClassDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="truncate pr-2 font-medium text-slate-700">
              {selectedClass === 'ALL' ? 'Tất cả lớp' : selectedClass}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isClassDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[220px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm lớp..." 
                  value={searchClassDropdown}
                  onChange={(e) => setSearchClassDropdown(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div 
                  onClick={() => { setSelectedClass('ALL'); setIsClassDropdownOpen(false); setSearchClassDropdown(''); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedClass === 'ALL' ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span>Tất cả lớp</span>
                  {selectedClass === 'ALL' && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
                {classList
                  .filter(l => l.toLowerCase().includes(searchClassDropdown.toLowerCase()))
                  .map(lop => (
                  <div 
                    key={lop}
                    onClick={() => { setSelectedClass(lop); setIsClassDropdownOpen(false); setSearchClassDropdown(''); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      selectedClass === lop ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{lop}</span>
                    {selectedClass === lop && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                  </div>
                ))}
                {classList.filter(l => l.toLowerCase().includes(searchClassDropdown.toLowerCase())).length === 0 && (
                  <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy lớp</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Trạng thái bài thu hoạch Dropdown */}
        <div className="relative min-w-[200px]" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => {
              setIsStatusDropdownOpen(!isStatusDropdownOpen);
              setIsClassDropdownOpen(false);
            }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="truncate pr-2 font-medium text-slate-700">
              {selectedStatus === 'ALL' ? 'Tất cả trạng thái' : selectedStatus === 'PENDING' ? 'Bài chờ chấm' : 'Đã chấm đủ'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isStatusDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm trạng thái..." 
                  value={searchStatusDropdown}
                  onChange={(e) => setSearchStatusDropdown(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {[
                  { id: 'ALL', name: 'Tất cả trạng thái' },
                  { id: 'PENDING', name: 'Bài chờ chấm' },
                  { id: 'DONE', name: 'Đã chấm đủ' }
                ]
                  .filter(opt => opt.name.toLowerCase().includes(searchStatusDropdown.toLowerCase()))
                  .map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => { setSelectedStatus(opt.id); setIsStatusDropdownOpen(false); setSearchStatusDropdown(''); setCurrentPage(1); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        selectedStatus === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                      }`}
                    >
                      <span>{opt.name}</span>
                      {selectedStatus === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                {[
                  { id: 'ALL', name: 'Tất cả trạng thái' },
                  { id: 'PENDING', name: 'Bài chờ chấm' },
                  { id: 'DONE', name: 'Đã chấm đủ' }
                ].filter(opt => opt.name.toLowerCase().includes(searchStatusDropdown.toLowerCase())).length === 0 && (
                  <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 w-[15%]">MSSV</th>
                <th className="p-4 w-[25%]">Họ tên</th>
                <th className="p-4 w-[15%]">Lớp</th>
                <th className="p-4 text-center w-[15%]">Số chuyến đã đi</th>
                <th className="p-4 text-center w-[15%]">Bài chờ chấm</th>
                <th className="p-4 pr-6 text-right w-[15%]">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-medium italic">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-medium italic">
                    Không tìm thấy sinh viên nào.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => {
                  const hasPendingReports = student.baiChoCham > 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      
                      <td className="p-4 pl-6 font-mono font-bold text-slate-600 truncate">{student.mssv}</td>
                      <td className="p-4 font-bold text-slate-800 truncate">{student.name}</td>
                      <td className="p-4 font-medium text-slate-500 truncate">{student.lop}</td>
                      
                      {/* Số chuyến hoàn thành */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
                          student.soChuyenHT > 0 
                            ? 'bg-[#89B449] text-white border-[#89B449]/20' 
                            : 'bg-[#DBD468] text-slate-800 border-[#DBD468]/20'
                        }`}>
                          {student.soChuyenHT}
                        </span>
                      </td>

                      {/* Bài thu hoạch chờ chấm */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
                          hasPendingReports 
                            ? 'bg-[#DBD468] text-slate-800 border-[#DBD468]/20' 
                            : 'bg-[#89B449] text-white border-[#89B449]/20'
                        }`}>
                          {hasPendingReports ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></div>
                              Còn {student.baiChoCham} bài
                            </>
                          ) : (
                            'Đã chấm đủ'
                          )}
                        </span>
                      </td>

                      {/* Hành động */}
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={() => setSelectedStudentProfile(student)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Hồ sơ kiến tập
                        </button>
                      </td>

                    </tr>
                  );
                })
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

      {/* Hồ sơ kiến tập Modal */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedStudentProfile(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <img src={selectedStudentProfile.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedStudentProfile.name}</h2>
                  <p className="text-sm text-slate-500 font-medium">MSSV: {selectedStudentProfile.mssv} • Lớp: {selectedStudentProfile.lop}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentProfile(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
              
              {/* Section 1: Lịch sử chuyến đi */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-[#89B449] rounded-full"></div>
                  Lịch sử chuyến tham quan ({selectedStudentProfile.soChuyenHT}/3)
                </h3>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="p-4 font-bold">Nhà máy</th>
                        <th className="p-4 font-bold">Ngày đi</th>
                        <th className="p-4 font-bold text-center">Điểm danh</th>
                        <th className="p-4 font-bold text-center">Điểm chuẩn bị</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStudentProfile.studentReports.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-slate-500">Chưa tham gia chuyến đi nào.</td></tr>
                      ) : (
                        selectedStudentProfile.studentReports.map((report, idx) => {
                          const nhaMay = report.phieuThamQuan?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'N/A';
                          const thoiGian = report.phieuThamQuan?.phieuDangKy?.chuyenThamQuan?.ngay_tham_quan;
                          const diemDanh = report.phieuThamQuan?.diemDanh?.trang_thai;
                          const diemChuanBi = report.phieuThamQuan?.diemPhieuThamQuan?.diem_chuan_bi;
                          
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-4 font-bold text-slate-700">{nhaMay}</td>
                              <td className="p-4 text-slate-600">{thoiGian ? new Date(thoiGian).toLocaleDateString('vi-VN') : '--'}</td>
                              <td className="p-4 text-center">
                                {diemDanh === 'CoMat' ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">Có mặt</span>
                                ) : diemDanh === 'Vang' ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">Vắng</span>
                                ) : diemDanh === 'TuChoiThamGia' ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">Từ chối</span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-500 text-xs font-bold">Chưa ĐD</span>
                                )}
                              </td>
                              <td className="p-4 text-center font-bold text-slate-700">
                                {diemChuanBi !== undefined && diemChuanBi !== null ? diemChuanBi : '--'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Tiến độ bài thu hoạch */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-[#407F3E] rounded-full"></div>
                  Tiến độ bài thu hoạch
                </h3>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="p-4 font-bold">Tên bài báo cáo</th>
                        <th className="p-4 font-bold text-center">Trạng thái</th>
                        <th className="p-4 font-bold text-center">Điểm số</th>
                        <th className="p-4 font-bold">Nhận xét</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStudentProfile.studentReports.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-slate-500">Chưa nộp bài thu hoạch nào.</td></tr>
                      ) : (
                        selectedStudentProfile.studentReports.map((report, idx) => {
                          const tenBai = report.file_bao_cao?.split('/').pop() || 'Báo cáo chưa rõ tên';
                          const trangThai = report.diem_thu_hoach !== null ? 'Đã chấm' : 'Chờ chấm';
                          
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-4 text-slate-700 font-medium truncate max-w-[200px]" title={tenBai}>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-[#407F3E] shrink-0" />
                                  <span className="truncate">{tenBai}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                  trangThai === 'Đã chấm' ? 'bg-[#89B449]/20 text-[#407F3E]' : 'bg-[#DBD468]/30 text-slate-700'
                                }`}>
                                  {trangThai}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="font-black text-lg text-[#407F3E]">
                                  {report.diem_thu_hoach !== null ? report.diem_thu_hoach : '--'}
                                </span>
                              </td>
                              <td className="p-4 text-slate-600 text-xs italic max-w-[250px] truncate" title={report.nhan_xet}>
                                {report.nhan_xet || 'Chưa có nhận xét'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
