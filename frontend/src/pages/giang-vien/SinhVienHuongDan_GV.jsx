import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ChevronDown, Check, Eye, Edit3, X, FileText, Calendar, Clock, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { giangVienApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import ExtendDeadlineModal from '../../components/ExtendDeadlineModal';

export default function SinhVienHuongDan_GV() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [lecturer, setLecturer] = useState(null);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [studentTrips, setStudentTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedTripForExtend, setSelectedTripForExtend] = useState(null);

  // Filter Popover States
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const handleOpenProfile = async (student) => {
    setSelectedStudentProfile(student);
    if (!student?.rawSv?.id) return;
    setLoadingTrips(true);
    try {
      const res = await giangVienApi.getGuidedStudentTrips(student.rawSv.id);
      setStudentTrips(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử chuyến đi của sinh viên:', err);
      setStudentTrips([]);
    } finally {
      setLoadingTrips(false);
    }
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
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative">
      
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
        <SearchableDropdown
          options={[
            { value: 'ALL', label: 'Tất cả lớp' },
            ...classList.map(lop => ({ value: lop, label: lop }))
          ]}
          value={selectedClass}
          onChange={(val) => {
            setSelectedClass(val);
            setCurrentPage(1);
          }}
          placeholder="Tất cả lớp"
          searchPlaceholder="Tìm lớp..."
          className="min-w-[200px]"
        />

        {/* Trạng thái bài thu hoạch Dropdown */}
        <SearchableDropdown
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'PENDING', label: 'Bài chờ chấm' },
            { value: 'DONE', label: 'Đã chấm đủ' }
          ]}
          value={selectedStatus}
          onChange={(val) => {
            setSelectedStatus(val);
            setCurrentPage(1);
          }}
          placeholder="Tất cả trạng thái"
          searchPlaceholder="Tìm trạng thái..."
          className="min-w-[200px]"
        />
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
                          onClick={() => handleOpenProfile(student)}
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

      {/* Hồ sơ kiến tập Modal */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedStudentProfile(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedStudentProfile.name}</h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">MSSV: {selectedStudentProfile.mssv} • Lớp: {selectedStudentProfile.lop}</p>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-[#89B449] rounded-full"></div>
                    Lịch sử chuyến tham quan ({studentTrips.length > 0 ? studentTrips.length : selectedStudentProfile.soChuyenHT}/3)
                  </h3>
                  {loadingTrips && (
                    <span className="text-xs text-slate-400 italic">Đang cập nhật dữ liệu...</span>
                  )}
                </div>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="p-4 font-bold">Nhà máy / Chuyến đi</th>
                        <th className="p-4 font-bold">Ngày đi</th>
                        <th className="p-4 font-bold text-center">Điểm danh</th>
                        <th className="p-4 font-bold text-center">Điểm chuẩn bị</th>
                        <th className="p-4 font-bold">Hạn nộp bài</th>
                        <th className="p-4 font-bold text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingTrips ? (
                        <tr><td colSpan="6" className="p-6 text-center text-slate-400 italic">Đang tải lịch sử chuyến đi...</td></tr>
                      ) : studentTrips.length === 0 ? (
                        <tr><td colSpan="6" className="p-6 text-center text-slate-500">Chưa tham gia chuyến đi nào.</td></tr>
                      ) : (
                        studentTrips.map((trip, idx) => {
                          const nhaMay = trip.tenNhaMay || trip.tenChuyen || 'N/A';
                          const thoiGian = trip.ngayThamQuan;
                          const diemDanh = trip.trangThaiDiemDanh;
                          const diemChuanBi = trip.diemChuanBi;
                          const isLocked = trip.daKhoaThuHoach || trip.daKhoa;
                          
                          // Deadline badge calculation
                          let deadlineBadge = <span className="text-slate-400 text-xs italic">Chưa xác định</span>;
                          if (trip.hanNopBaoCao) {
                            const deadline = new Date(trip.hanNopBaoCao);
                            const now = new Date();
                            const deadlineLock = new Date(deadline.getTime() + 10 * 86400000);
                            const dStr = deadline.toLocaleDateString('vi-VN');
                            const lStr = deadlineLock.toLocaleDateString('vi-VN');

                            if (now <= deadline) {
                              deadlineBadge = (
                                <div className="flex flex-col gap-0.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                                    <Clock className="w-3 h-3 text-green-600" /> Đúng hạn: 23:59 {dStr}
                                  </span>
                                  <span className="text-[10px] text-slate-400">Khóa cổng: 23:59 {lStr}</span>
                                </div>
                              );
                            } else if (now <= deadlineLock) {
                              deadlineBadge = (
                                <div className="flex flex-col gap-0.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" /> Nộp bù: đến 23:59 {lStr}
                                  </span>
                                  <span className="text-[10px] text-slate-400">Đã hết hạn đúng ({dStr})</span>
                                </div>
                              );
                            } else {
                              deadlineBadge = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                  <Lock className="w-3 h-3 text-red-500" /> Khóa cổng ({lStr})
                                </span>
                              );
                            }
                          }

                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 font-bold text-slate-700">{nhaMay}</td>
                              <td className="p-4 text-slate-600 whitespace-nowrap">{thoiGian ? new Date(thoiGian).toLocaleDateString('vi-VN') : '--'}</td>
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
                              <td className="p-4">
                                {deadlineBadge}
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  type="button"
                                  disabled={isLocked}
                                  onClick={() => {
                                    setSelectedTripForExtend(trip);
                                    setExtendModalOpen(true);
                                  }}
                                  title={isLocked ? 'Điểm bài thu hoạch đã bị khóa, không thể gia hạn' : 'Gia hạn nộp bài'}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    isLocked
                                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                      : 'bg-[#407F3E]/10 border border-[#407F3E]/30 text-[#407F3E] hover:bg-[#407F3E] hover:text-white cursor-pointer'
                                  }`}
                                >
                                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                                  <span>Gia hạn</span>
                                </button>
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
                      {loadingTrips ? (
                        <tr><td colSpan="4" className="p-6 text-center text-slate-400 italic">Đang tải tiến độ...</td></tr>
                      ) : studentTrips.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-slate-500">Chưa nộp bài thu hoạch nào.</td></tr>
                      ) : (
                        studentTrips.map((trip, idx) => {
                          const bth = trip.baiThuHoach;
                          const tenBai = bth?.fileBaoCao?.split('/').pop() || `${trip.tenNhaMay || trip.tenChuyen} (Chưa nộp)`;
                          const daNop = !!bth;
                          const isTreHan = bth?.trangThai === 'TreHan';
                          
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 text-slate-700 font-medium truncate max-w-[200px]" title={tenBai}>
                                <div className="flex items-center gap-2">
                                  <FileText className={`w-4 h-4 shrink-0 ${daNop ? 'text-[#407F3E]' : 'text-slate-400'}`} />
                                  <span className="truncate">{tenBai}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                {!daNop ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-500">
                                    Chưa nộp
                                  </span>
                                ) : isTreHan ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700">
                                    Trễ hạn
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                                    Đúng hạn
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <span className="font-black text-lg text-[#407F3E]">
                                  {trip.diemThuHoach !== null && trip.diemThuHoach !== undefined ? trip.diemThuHoach : '--'}
                                </span>
                              </td>
                              <td className="p-4 text-slate-600 text-xs italic max-w-[250px] truncate" title={bth?.nhanXet || ''}>
                                {bth?.nhanXet || 'Chưa có nhận xét'}
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

      {/* Modal Gia hạn nộp bài */}
      {extendModalOpen && selectedTripForExtend && (
        <ExtendDeadlineModal
          isOpen={extendModalOpen}
          onClose={() => {
            setExtendModalOpen(false);
            setSelectedTripForExtend(null);
          }}
          phieuThamQuanId={selectedTripForExtend.phieuThamQuanId}
          currentDeadline={selectedTripForExtend.hanNopBaoCao}
          studentName={selectedStudentProfile?.name}
          studentMssv={selectedStudentProfile?.mssv}
          tripName={selectedTripForExtend.tenNhaMay || selectedTripForExtend.tenChuyen}
          onSuccess={() => {
            if (selectedStudentProfile) {
              handleOpenProfile(selectedStudentProfile);
            }
            if (lecturer) {
              fetchData(lecturer.id);
            }
          }}
        />
      )}

    </div>
  );
}
