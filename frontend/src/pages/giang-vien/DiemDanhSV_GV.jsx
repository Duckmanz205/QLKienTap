import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ChevronDown, Check, CheckCircle2, XCircle, FileWarning, Save,
  FileCheck, Eye, ZoomIn, ZoomOut, RotateCw, X, ExternalLink, AlertCircle, Building2
} from 'lucide-react';
import { giangVienApi } from '../../services/api';
import Toast from '../../components/Toast';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function DiemDanhSV_GV() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isTripDropdownOpen, setIsTripDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchStatusDropdown, setSearchStatusDropdown] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tripSearch, setTripSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [lecturer, setLecturer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [students, setStudents] = useState([]);

  // Modal xem minh chứng giấy xác nhận doanh nghiệp
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    student: null,
    fileUrl: '',
    isImage: false,
    isPdf: false,
    loading: false,
  });
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const closeAllDropdowns = () => {
    setIsTripDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchTrips(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchTrips = async (gvId) => {
    try {
      const res = await giangVienApi.getLedTrips(gvId);
      const tripsData = res.data || [];
      const formattedTrips = tripsData.map(t => ({
        id: t.id,
        name: `${t.nhaMay?.ten_nha_may || 'Chuyến đi'} (${new Date(t.ngay_tham_quan || t.ngay_khoi_hanh || Date.now()).toLocaleDateString('vi-VN')})`,
        cachToChuc: t.cach_to_chuc,
      }));
      setTrips(formattedTrips);
      if (formattedTrips.length > 0) {
        setSelectedTrip(formattedTrips[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedTrip) {
      fetchStudents(selectedTrip.id);
      setCurrentPage(1);
    }
  }, [selectedTrip]);

  const fetchStudents = async (tripId) => {
    try {
      setLoading(true);
      const res = await giangVienApi.getTripRegistrations(tripId);
      const data = res.data || [];
      
      const mapped = data.map(phieu => ({
        id: phieu.id,
        mssv: phieu.sinhVien?.mssv,
        name: phieu.sinhVien?.ho_ten,
        status: phieu.diemDanh?.trang_thai || null,
        note: phieu.diemDanh?.ghi_chu || '',
        fileXacNhan: phieu.file_xac_nhan_tham_quan,
        fileBaoCao: phieu.file_bao_cao,
        ngayNop: phieu.ngay_nop_bao_cao,
        cachToChuc: phieu.cach_to_chuc,
      }));
      
      setStudents(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = async (student) => {
    if (!student.fileXacNhan) return;
    setPreviewModal({
      isOpen: true,
      student,
      fileUrl: '',
      isImage: false,
      isPdf: false,
      loading: true,
    });
    setZoom(100);
    setRotation(0);

    try {
      const { default: api } = await import('../../services/axiosClient');
      let xnPath = student.fileXacNhan;
      if (xnPath.startsWith('/api/')) xnPath = xnPath.substring(5);
      if (xnPath.startsWith('attachments/') || xnPath.startsWith('payments/')) {
        xnPath = `upload/file/${xnPath}`;
      } else if (!xnPath.startsWith('upload/file/')) {
        xnPath = `upload/file/attachments/${xnPath}`;
      }
      if (xnPath.startsWith('/')) xnPath = xnPath.substring(1);

      const res = await api.get('/' + xnPath, { responseType: 'blob' });
      if (res.data) {
        const blobUrl = URL.createObjectURL(res.data);
        const isImg = res.headers['content-type']?.startsWith('image/') || /\.(png|jpe?g)$/i.test(xnPath);
        const isPdfDoc = res.headers['content-type']?.includes('pdf') || /\.pdf$/i.test(xnPath);
        setPreviewModal(prev => ({
          ...prev,
          fileUrl: blobUrl,
          isImage: isImg,
          isPdf: isPdfDoc,
          loading: false,
        }));
      }
    } catch (err) {
      console.error('Lỗi tải giấy xác nhận:', err);
      setToast({ show: true, message: 'Không thể tải tệp giấy xác nhận của sinh viên', type: 'error' });
      setPreviewModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, status: newStatus, note: newStatus === 'TuChoiThamGia' ? s.note : '' };
      }
      return s;
    }));
  };

  const handleNoteChange = (studentId, newNote) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, note: newNote } : s));
  };

  const handleMarkAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'CoMat', note: '' })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedTrip || students.length === 0) return;
    try {
      setLoading(true);
      const records = students.map(s => ({
        phieuId: s.id,
        status: s.status || 'CoMat',
        note: s.note
      }));
      
      await giangVienApi.takeAttendance({
        tripId: selectedTrip.id,
        records
      });
      setToast({ show: true, message: 'Đã lưu điểm danh thành công!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Có lỗi xảy ra khi lưu điểm danh', type: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Paginated logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = !searchQuery || 
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (s.mssv && s.mssv.includes(searchQuery));
      const matchStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ChuaDiemDanh' && !s.status) ||
        (s.status === statusFilter);
      return matchSearch && matchStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / limit) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * limit, currentPage * limit);

  const attendedCount = students.filter(s => s.status !== null).length;
  const totalCount = students.length;

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      <Toast 
        message={toast.show ? toast.message : ''} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Điểm danh sinh viên</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
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

        {/* Trip Selector Popover */}
        <div className="relative min-w-[260px] flex-1" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => {
              setIsTripDropdownOpen(!isTripDropdownOpen);
              setIsStatusDropdownOpen(false);
            }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isTripDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="truncate pr-2 font-medium text-slate-700 flex items-center gap-2">
              {selectedTrip?.cachToChuc === 'TuDo' && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-700 font-bold shrink-0">
                  Tự do
                </span>
              )}
              <span className="truncate">{selectedTrip ? selectedTrip.name : 'Đang tải chuyến...'}</span>
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isTripDropdownOpen && trips.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1 max-h-64 flex flex-col">
              <div className="p-2 border-b border-[#E7E0C4] sticky top-0 bg-white z-10">
                <input
                  type="text"
                  placeholder="Tìm chuyến đi..."
                  value={tripSearch}
                  onChange={(e) => setTripSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-[#E7E0C4] rounded-lg focus:outline-none focus:border-[#407F3E]"
                />
              </div>
              <div className="overflow-y-auto">
                {trips
                  .filter(t => !tripSearch || t.name.toLowerCase().includes(tripSearch.toLowerCase()))
                  .map(trip => (
                    <div 
                      key={trip.id}
                      onClick={() => {
                        setSelectedTrip(trip);
                        setIsTripDropdownOpen(false);
                        setTripSearch('');
                      }}
                      className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        selectedTrip?.id === trip.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {trip.cachToChuc === 'TuDo' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-700 font-bold shrink-0">
                            Tự do
                          </span>
                        )}
                        <span className="truncate">{trip.name}</span>
                      </div>
                      {selectedTrip?.id === trip.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                {trips.filter(t => !tripSearch || t.name.toLowerCase().includes(tripSearch.toLowerCase())).length === 0 && (
                  <div className="px-4 py-3 text-xs text-slate-500 text-center">Không tìm thấy chuyến đi</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Filter Popover */}
        <div className="relative min-w-[200px]" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => {
              setIsStatusDropdownOpen(!isStatusDropdownOpen);
              setIsTripDropdownOpen(false);
            }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="truncate pr-2 font-medium text-slate-700">
              {statusFilter === 'ALL' && 'Tất cả trạng thái'}
              {statusFilter === 'CoMat' && 'Có mặt'}
              {statusFilter === 'Vang' && 'Vắng'}
              {statusFilter === 'TuChoiThamGia' && 'Từ chối tham gia'}
              {statusFilter === 'ChuaDiemDanh' && 'Chưa điểm danh'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isStatusDropdownOpen && (
            <div className="absolute top-full right-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
              <div className="p-2 border-b border-[#E7E0C4]">
                <input
                  type="text"
                  placeholder="Tìm trạng thái..."
                  value={searchStatusDropdown}
                  onChange={(e) => setSearchStatusDropdown(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-[#E7E0C4] rounded-lg focus:outline-none focus:border-[#407F3E]"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {[
                  { id: 'ALL', label: 'Tất cả trạng thái' },
                  { id: 'CoMat', label: 'Có mặt' },
                  { id: 'Vang', label: 'Vắng' },
                  { id: 'TuChoiThamGia', label: 'Từ chối tham gia' },
                  { id: 'ChuaDiemDanh', label: 'Chưa điểm danh' },
                ]
                  .filter(opt => !searchStatusDropdown || opt.label.toLowerCase().includes(searchStatusDropdown.toLowerCase()))
                  .map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => {
                        setStatusFilter(opt.id);
                        setIsStatusDropdownOpen(false);
                        setSearchStatusDropdown('');
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        statusFilter === opt.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {statusFilter === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                {[
                  { id: 'ALL', label: 'Tất cả trạng thái' },
                  { id: 'CoMat', label: 'Có mặt' },
                  { id: 'Vang', label: 'Vắng' },
                  { id: 'TuChoiThamGia', label: 'Từ chối tham gia' },
                  { id: 'ChuaDiemDanh', label: 'Chưa điểm danh' },
                ].filter(opt => !searchStatusDropdown || opt.label.toLowerCase().includes(searchStatusDropdown.toLowerCase())).length === 0 && (
                  <div className="px-4 py-3 text-xs text-slate-500 text-center">Không tìm thấy trạng thái</div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Quick Action Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-[#E7E0C4] shadow-sm mb-6">
        <button 
          onClick={handleMarkAllPresent}
          className="w-full sm:w-auto px-5 py-2 border-2 border-[#89B449] text-[#89B449] hover:bg-[#89B449] hover:text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" /> Đánh dấu tất cả Có mặt
        </button>
        <div className="mt-3 sm:mt-0 text-sm font-bold text-slate-600">
          Đã điểm danh: <span className="text-[#407F3E] text-base">{attendedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible pb-20 md:pb-0">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 min-w-[120px]">MSSV</th>
                <th className="p-4 min-w-[180px]">Họ tên</th>
                <th className="p-4 text-center min-w-[180px]">Minh chứng DN</th>
                <th className="p-4 text-center min-w-[320px]">Trạng thái điểm danh</th>
                <th className="p-4 pr-6 min-w-[200px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium italic">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium italic">
                    Không tìm thấy sinh viên nào.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-600">{student.mssv}</td>
                    <td className="p-4 font-bold text-slate-800">{student.name}</td>
                    
                    {/* Minh chứng Doanh nghiệp (Chuyến tự do) */}
                    <td className="p-4 text-center">
                      {selectedTrip?.cachToChuc === 'TuDo' || student.cachToChuc === 'TuDo' ? (
                        student.fileXacNhan ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(student)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#407F3E]/10 text-[#407F3E] hover:bg-[#407F3E] hover:text-white transition-all cursor-pointer shadow-xs border border-[#407F3E]/20"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            Xem giấy xác nhận
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            Chưa nộp giấy XN
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Điểm danh trên xe</span>
                      )}
                    </td>

                    <td className="p-4">
                      {/* Segmented Toggle Buttons */}
                      <div className="flex justify-center bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit mx-auto">
                        
                        <button 
                          onClick={() => handleStatusChange(student.id, 'CoMat')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            student.status === 'CoMat' 
                              ? 'bg-[#89B449] text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Có mặt
                        </button>
                        
                        <button 
                          onClick={() => handleStatusChange(student.id, 'Vang')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all mx-1 cursor-pointer ${
                            student.status === 'Vang' 
                              ? 'bg-[#E68A8C] text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Vắng
                        </button>
                        
                        <button 
                          onClick={() => handleStatusChange(student.id, 'TuChoiThamGia')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            student.status === 'TuChoiThamGia' 
                              ? 'bg-white border-2 border-[#E68A8C] text-[#E68A8C] shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border-2 border-transparent'
                          }`}
                        >
                          <FileWarning className="w-3.5 h-3.5" /> Từ chối tham gia
                        </button>

                      </div>
                    </td>
                    
                    <td className="p-4 pr-6">
                      {student.status === 'TuChoiThamGia' ? (
                        <input 
                          type="text" 
                          value={student.note}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          placeholder="Lý do từ chối..."
                          className="w-full px-3 py-2 bg-white border border-[#E68A8C] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#E68A8C] text-slate-800 placeholder-slate-400 shadow-sm animate-in fade-in duration-200"
                          autoFocus
                        />
                      ) : (
                        <span className="text-xs text-slate-300 italic px-3 block text-center md:text-left">Không có ghi chú</span>
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

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-6 duration-500 delay-300">
        <button 
          onClick={handleSaveAttendance}
          disabled={loading || students.length === 0}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          Lưu điểm danh
        </button>
      </div>

      {/* Preview Confirmation Paper Modal */}
      {previewModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#407F3E]/10 flex items-center justify-center text-[#407F3E] shrink-0 font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-800 truncate">
                    Giấy xác nhận tham quan doanh nghiệp
                  </h3>
                  <p className="text-xs text-slate-500 truncate font-medium">
                    Sinh viên: <strong className="text-slate-700">{previewModal.student?.name}</strong> • MSSV: <strong className="text-slate-700">{previewModal.student?.mssv}</strong>
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {previewModal.isImage && (
                  <>
                    <button
                      onClick={() => setZoom(z => Math.max(50, z - 25))}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Thu nhỏ"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-600 min-w-[45px] text-center">
                      {zoom}%
                    </span>
                    <button
                      onClick={() => setZoom(z => Math.min(250, z + 25))}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Phóng to"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRotation(r => (r + 90) % 360)}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Xoay 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-1" />
                  </>
                )}

                {previewModal.fileUrl && (
                  <a
                    href={previewModal.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-slate-500 hover:text-[#407F3E] hover:bg-[#407F3E]/10 transition-colors cursor-pointer"
                    title="Mở tab mới"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center min-h-[350px] max-h-[calc(92vh-140px)]">
              {previewModal.loading ? (
                <div className="text-center p-8 text-slate-500">
                  <div className="w-8 h-8 border-3 border-[#407F3E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium">Đang tải minh chứng giấy xác nhận...</p>
                </div>
              ) : previewModal.fileUrl ? (
                previewModal.isPdf ? (
                  <iframe
                    src={previewModal.fileUrl}
                    title="Giấy xác nhận doanh nghiệp"
                    className="w-full h-[65vh] rounded-lg border border-slate-300 bg-white"
                  />
                ) : (
                  <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-2">
                    <img
                      src={previewModal.fileUrl}
                      alt="Giấy xác nhận doanh nghiệp"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="max-h-[62vh] object-contain rounded-lg shadow-md border border-slate-200 bg-white"
                    />
                  </div>
                )
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">Không thể hiển thị tài liệu.</p>
                </div>
              )}
            </div>

            {/* Modal Footer with quick roll-call */}
            <div className="p-4 px-6 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Kiểm tra mộc đỏ, chữ ký đại diện doanh nghiệp và ngày thực tế của sinh viên.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (previewModal.student) {
                      handleStatusChange(previewModal.student.id, 'CoMat');
                      setPreviewModal(prev => ({ ...prev, isOpen: false }));
                      setToast({ show: true, message: `Đã đánh dấu Có mặt cho ${previewModal.student.name}. Hãy bấm "Lưu điểm danh"!`, type: 'success' });
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#89B449] text-white hover:bg-[#89B449]/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Xác nhận Có mặt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (previewModal.student) {
                      handleStatusChange(previewModal.student.id, 'TuChoiThamGia');
                      setPreviewModal(prev => ({ ...prev, isOpen: false }));
                      setToast({ show: true, message: `Đã đánh dấu Từ chối cho ${previewModal.student.name}.`, type: 'error' });
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileWarning className="w-4 h-4" /> Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
