import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Check, Eye, Edit3, X, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { giangVienApi } from '../../services/api';

export default function SinhVienHuongDan_GV() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [lecturer, setLecturer] = useState(null);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Semesters/Schedules (Mock for now, or extracted from students)
  const semesters = [
    { id: 'all', name: 'Tất cả sinh viên' }
  ];
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);

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
        const studentReports = rpData.filter(r => r.phieuDangKy?.sinhVien?.id === sv.id);
        const pendingReports = studentReports.filter(r => r.diem_bai_thu_hoach === null);
        
        return {
          id: st.id,
          mssv: sv.mssv,
          name: sv.ho_ten,
          lop: sv.lop || '--',
          soChuyenHT: studentReports.length, 
          soChuyenYC: 3, 
          baiChoCham: pendingReports.length,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sv.ho_ten || 'SV')}&background=f1f5f9&color=475569`,
          rawSv: sv
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

  // Filter states
  const [filterKhoa, setFilterKhoa] = useState('All');
  const [isKhoaDropdownOpen, setIsKhoaDropdownOpen] = useState(false);
  const [filterClass, setFilterClass] = useState('All');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  const normalizeKhoa = (str) => {
    if (!str) return '';
    const match = String(str).match(/\d+/);
    return match ? match[0] : String(str).trim().toLowerCase();
  };

  const extractKhoa = (ten_lop, rawSv) => {
    if (rawSv && rawSv.ten_khoa) return rawSv.ten_khoa;
    if (rawSv && rawSv.khoa && rawSv.khoa.ten_khoa) return rawSv.khoa.ten_khoa;
    if (!ten_lop || ten_lop === '--') return 'Khác';
    const match = String(ten_lop).match(/^(\d+)/);
    return match ? `Khóa ${match[1]}` : 'Khác';
  };

  const uniqueKhoaList = Array.from(new Set(students.map(s => extractKhoa(s.lop, s.rawSv)).filter(Boolean)));
  const uniqueClassList = Array.from(new Set(students.map(s => s.lop).filter(l => l && l !== '--')));

  const khoaOptions = ["Tất cả khóa", ...uniqueKhoaList];
  const lopOptions = ["Tất cả lớp", ...uniqueClassList];

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (s.mssv && s.mssv.includes(searchQuery));
    const k = extractKhoa(s.lop, s.rawSv);
    const matchesKhoa = filterKhoa === 'All' || filterKhoa === "Tất cả khóa" || 
      normalizeKhoa(k) === normalizeKhoa(filterKhoa) ||
      (filterKhoa && k && String(k).toLowerCase().includes(String(filterKhoa).toLowerCase()));
    const matchesClass = filterClass === 'All' || filterClass === "Tất cả lớp" || s.lop === filterClass;
    return matchesSearch && matchesKhoa && matchesClass;
  });

  const closeAllDropdowns = () => {
    setIsDropdownOpen(false);
    setIsKhoaDropdownOpen(false);
    setIsClassDropdownOpen(false);
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Sinh viên hướng dẫn</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 flex-wrap">
        
        {/* Semester Selector */}
        <div className="relative min-w-[200px] flex-1">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Lịch kiến tập</label>
          <div 
            onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setIsDropdownOpen(!isDropdownOpen); }}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all shadow-sm ${isDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="font-bold text-slate-800 truncate pr-2">{selectedSemester.name}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {semesters.map(sem => (
                <div 
                  key={sem.id}
                  onClick={() => { setSelectedSemester(sem); setIsDropdownOpen(false); }}
                  className={`px-4 py-3 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedSemester.id === sem.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{sem.name}</span>
                  {selectedSemester.id === sem.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Khóa Filter Dropdown */}
        <div className="relative min-w-[180px] flex-1">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Khóa</label>
          <div 
            onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setIsKhoaDropdownOpen(!isKhoaDropdownOpen); }}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all shadow-sm ${isKhoaDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="font-medium text-slate-700 truncate pr-2">{filterKhoa === 'All' ? 'Tất cả khóa' : filterKhoa}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isKhoaDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 max-h-48 overflow-y-auto animate-in slide-in-from-top-1">
              {khoaOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setFilterKhoa(opt); setIsKhoaDropdownOpen(false); }}
                  className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    (filterKhoa === opt || (filterKhoa === 'All' && opt === 'Tất cả khóa')) ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {(filterKhoa === opt || (filterKhoa === 'All' && opt === 'Tất cả khóa')) && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lớp Filter Dropdown */}
        <div className="relative min-w-[180px] flex-1">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Lớp</label>
          <div 
            onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setIsClassDropdownOpen(!isClassDropdownOpen); }}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all shadow-sm ${isClassDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="font-medium text-slate-700 truncate pr-2">{filterClass === 'All' ? 'Tất cả lớp' : filterClass}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isClassDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 max-h-48 overflow-y-auto animate-in slide-in-from-top-1">
              {lopOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setFilterClass(opt); setIsClassDropdownOpen(false); }}
                  className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    (filterClass === opt || (filterClass === 'All' && opt === 'Tất cả lớp')) ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {(filterClass === opt || (filterClass === 'All' && opt === 'Tất cả lớp')) && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="min-w-[220px] flex-1 mt-0 md:mt-5 relative">
          <input 
            type="text" 
            placeholder="Tìm theo MSSV/họ tên..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 w-12 text-center">Ảnh</th>
                <th className="p-4 min-w-[120px]">MSSV</th>
                <th className="p-4 min-w-[200px]">Họ tên</th>
                <th className="p-4 min-w-[120px]">Lớp</th>
                <th className="p-4 text-center min-w-[160px]">Số chuyến đã đi</th>
                <th className="p-4 text-center min-w-[200px]">Bài thu hoạch chờ chấm</th>
                <th className="p-4 pr-6 text-right min-w-[150px]">Hành động</th>
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
                filteredStudents.map(student => {
                  const hasPendingReports = student.baiChoCham > 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      
                      <td className="p-4 pl-6 text-center">
                        <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden mx-auto shrink-0">
                          <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      
                      <td className="p-4 font-mono font-bold text-slate-600">{student.mssv}</td>
                      <td className="p-4 font-bold text-slate-800">{student.name}</td>
                      <td className="p-4 font-medium text-slate-500">{student.lop}</td>
                      
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
                          onClick={() => navigate('/giang-vien/grading')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                        >
                          {hasPendingReports ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          Xem & chấm
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {filteredStudents.length > 0 && (
          <div className="p-4 border-t border-[#E7E0C4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select 
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
              <span>/ {filteredStudents.length} sinh viên</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(1)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trang đầu
              </button>
              <button 
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trước
              </button>
              <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                Trang {page} / {Math.ceil(filteredStudents.length / limit) || 1}
              </span>
              <button 
                disabled={page >= Math.ceil(filteredStudents.length / limit)}
                onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(filteredStudents.length / limit)))}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Sau
              </button>
              <button 
                disabled={page >= Math.ceil(filteredStudents.length / limit)}
                onClick={() => setPage(Math.ceil(filteredStudents.length / limit))}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trang cuối
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
