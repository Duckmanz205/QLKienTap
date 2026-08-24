import React, { useState, useEffect } from 'react';
import { 
  Plus, ChevronRight, ChevronDown, Check, X, Upload, CloudUpload
} from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function LichKienTap_Khoa() {
  const [schedules, setSchedules] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Detail Modal States
  const [viewingDetail, setViewingDetail] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

  // Import Modal States
  const [importingLich, setImportingLich] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Filter States
  const [filterDot, setFilterDot] = useState('');
  const [isDotDropdownOpen, setIsDotDropdownOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schRes, campRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getCampaigns()
      ]);
      setSchedules(schRes.data);
      setCampaigns(campRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetail = async (schedule) => {
    setViewingDetail(schedule);
    setIsLoadingEnrollments(true);
    try {
      const res = await khoaApi.getEnrollments({ lichKienTapId: schedule.id, limit: 1000 });
      setEnrollments(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      setEnrollments([]);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  const handleOpenImport = async (schedule) => {
    setImportingLich(schedule);
    setIsLoadingStudents(true);
    setSelectedStudentIds([]);
    setStudentSearchTerm('');
    try {
      const res = await khoaApi.getStudents({ limit: 1000 });
      setAllStudents(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      setAllStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleImportSubmit = async () => {
    if (selectedStudentIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sinh viên");
      return;
    }
    try {
      await khoaApi.importStudents({
        lichId: importingLich.id,
        studentIds: selectedStudentIds
      });
      await fetchData();
      alert("Tải danh sách SV thành công");
      setImportingLich(null);
      setSelectedStudentIds([]);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải danh sách SV");
    }
  };
  
  const filteredStudents = allStudents.filter(st => {
    if (!studentSearchTerm) return true;
    const term = studentSearchTerm.toLowerCase();
    return st.mssv?.toLowerCase().includes(term) || st.ho_ten?.toLowerCase().includes(term);
  });

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Nháp':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Nháp</span>;
      case 'Mở đăng ký':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white border border-[#89B449]/20 shadow-sm">Mở đăng ký</span>;
      case 'Đang diễn ra':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#407F3E] text-white border border-[#407F3E]/20 shadow-sm">Đang diễn ra</span>;
      case 'Đã kết thúc':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 border border-[#DBD468]/20 shadow-sm">Đã kết thúc</span>;
      case 'Đã khóa':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-white shadow-sm">Đã khóa</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  const filteredSchedules = schedules.filter(s => {
    if (filterDot && s.dot_kien_tap_id !== filterDot) return false;
    return true;
  });

  const displayData = filteredSchedules.map((s, index) => {
    const statuses = ['Nháp', 'Mở đăng ký', 'Đang diễn ra', 'Đã kết thúc', 'Đã khóa'];
    // In real app, calculate status based on dates. Here we mock if status is null.
    const mockStatus = s.trang_thai || statuses[index % statuses.length];

    return {
      id: s.id,
      ten_lich: s.ten_lich,
      khoa: s.khoa?.ten_khoa || '14ĐHTP',
      tg_mo_dang_ky: `${new Date(s.tg_mo_dang_ky_tu).toLocaleDateString('vi-VN')} - ${new Date(s.tg_mo_dang_ky_den).toLocaleDateString('vi-VN')}`,
      tg_dien_ra: `${new Date(s.tg_dien_ra_tu).toLocaleDateString('vi-VN')} - ${new Date(s.tg_dien_ra_den).toLocaleDateString('vi-VN')}`,
      han_bao_cao: new Date(s.han_chot_nop_bao_cao).toLocaleDateString('vi-VN'),
      han_diem: new Date(s.han_chot_diem).toLocaleDateString('vi-VN'),
      trang_thai: mockStatus
    };
  });

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Lịch kiến tập</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo lịch kiến tập
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex items-center relative z-20">
        {/* Đợt Dropdown */}
        <div className="relative min-w-[320px]">
          <div 
            onClick={() => setIsDotDropdownOpen(!isDotDropdownOpen)}
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isDotDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="text-slate-700 font-medium truncate pr-2">
              {filterDot ? campaigns.find(c => c.id === filterDot)?.ten_dot : 'Tất cả đợt'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isDotDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 max-h-60 overflow-y-auto animate-in slide-in-from-top-1">
              <div 
                onClick={() => { setFilterDot(''); setIsDotDropdownOpen(false); }}
                className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                  !filterDot ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                }`}
              >
                <span className="truncate pr-2">Tất cả đợt</span>
                {!filterDot && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
              </div>
              {campaigns.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => { setFilterDot(opt.id); setIsDotDropdownOpen(false); }}
                  className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    (filterDot === opt.id) 
                      ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                      : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt.ten_dot}</span>
                  {filterDot === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">Tên lịch</th>
                <th className="p-4">Khóa</th>
                <th className="p-4">Thời gian mở đăng ký</th>
                <th className="p-4">Thời gian diễn ra</th>
                <th className="p-4">Hạn nộp báo cáo</th>
                <th className="p-4">Hạn chốt điểm</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">Không có lịch kiến tập nào.</td>
                </tr>
              ) : (
                displayData.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-800">{s.ten_lich}</td>
                    <td className="p-4 font-bold text-slate-600">{s.khoa}</td>
                    <td className="p-4 text-xs font-medium text-slate-600">{s.tg_mo_dang_ky}</td>
                    <td className="p-4 text-xs font-medium text-slate-600">{s.tg_dien_ra}</td>
                    <td className="p-4 text-xs font-medium text-[#E68A8C]">{s.han_bao_cao}</td>
                    <td className="p-4 text-xs font-medium text-[#E68A8C]">{s.han_diem}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(s.trang_thai)}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                          title="Tải danh sách SV"
                          onClick={() => handleOpenImport(s)}
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                          title="Xem chi tiết"
                          onClick={() => handleViewDetail(s)}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Step Wizard Modal Mockup - "+ Tạo lịch kiến tập" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dimmed Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Tạo lịch kiến tập</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              
              {/* Stepper */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-[#407F3E] -z-10"></div>
                
                {/* Step 1: Done */}
                <div className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className="w-8 h-8 rounded-full bg-[#407F3E] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#407F3E]">1. Thông tin lịch</span>
                </div>

                {/* Step 2: Active */}
                <div className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-[#407F3E] text-[#407F3E] font-bold flex items-center justify-center shadow-sm">
                    2
                  </div>
                  <span className="text-xs font-bold text-slate-800">2. Tải danh sách SV</span>
                </div>

                {/* Step 3: Upcoming */}
                <div className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-bold flex items-center justify-center">
                    3
                  </div>
                  <span className="text-xs font-bold text-slate-400">3. Đối chiếu & xác nhận</span>
                </div>
              </div>

              {/* Step 2 Content */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Khóa</label>
                  <div className="w-full px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm flex justify-between items-center cursor-not-allowed opacity-80">
                    <span className="text-slate-800 font-bold">14ĐHTP</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Tải lên danh sách sinh viên</label>
                  <div className="border-2 border-dashed border-[#E7E0C4] rounded-xl p-8 bg-slate-50 flex flex-col items-center justify-center text-center hover:bg-slate-100 hover:border-[#89B449] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <CloudUpload className="w-6 h-6 text-[#89B449]" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                      Kéo thả file Excel danh sách sinh viên đăng ký học phần vào đây, hoặc bấm để chọn file
                    </p>
                    <p className="text-xs text-slate-400">Hỗ trợ định dạng .xlsx, .xls</p>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="bg-white border border-[#E7E0C4] rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-slate-50 border-b border-[#E7E0C4] flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Xem trước dữ liệu (3 dòng)</span>
                    <span className="text-xs font-bold text-[#89B449] flex items-center gap-1">
                      <Check className="w-3 h-3" /> File hợp lệ
                    </span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-white border-b border-slate-100 text-slate-500 font-medium">
                        <th className="px-4 py-2">MSSV</th>
                        <th className="px-4 py-2">Họ tên</th>
                        <th className="px-4 py-2">Lớp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700 font-semibold">
                      <tr>
                        <td className="px-4 py-2 text-[#407F3E]">2001215001</td>
                        <td className="px-4 py-2">Nguyễn Văn An</td>
                        <td className="px-4 py-2">14DHTP1</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-[#407F3E]">2001215002</td>
                        <td className="px-4 py-2">Trần Thị Bé</td>
                        <td className="px-4 py-2">14DHTP1</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-[#407F3E]">2001215003</td>
                        <td className="px-4 py-2">Lê Hoàng Cường</td>
                        <td className="px-4 py-2">14DHTP2</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Quay lại
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-2"
              >
                Tiếp tục
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
          ></div>
          <div 
            className="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Danh sách sinh viên - {viewingDetail.ten_lich}
              </h2>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {isLoadingEnrollments ? (
                <div className="text-center py-8 text-slate-500 font-medium">Đang tải dữ liệu...</div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-medium">Chưa có sinh viên nào trong lịch này.</div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                        <th className="p-4 pl-6">MSSV</th>
                        <th className="p-4">Họ và tên</th>
                        <th className="p-4">Lớp</th>
                        <th className="p-4">Ngành</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                      {enrollments.map((en, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-[#407F3E]">{en.sinhVien?.mssv}</td>
                          <td className="p-4 font-bold text-slate-800">{en.sinhVien?.ho_ten}</td>
                          <td className="p-4 font-medium text-slate-600">{en.sinhVien?.lop}</td>
                          <td className="p-4 font-medium text-slate-600">{en.sinhVien?.nganh}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Students Modal */}
      {importingLich && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setImportingLich(null); }}
          ></div>
          <div 
            className="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Tải danh sách SV - {importingLich.ten_lich}
              </h2>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setImportingLich(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col overflow-hidden bg-slate-50">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm MSSV, Họ tên..."
                  value={studentSearchTerm}
                  onChange={e => setStudentSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]"
                />
              </div>

              <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-[#E7E0C4]">
                {isLoadingStudents ? (
                  <div className="text-center py-8 text-slate-500 font-medium">Đang tải dữ liệu...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 font-medium">Không tìm thấy sinh viên nào.</div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="sticky top-0 bg-[#E7E0C4] z-10 shadow-sm">
                      <tr className="text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                        <th className="p-4 pl-6 w-12 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E]"
                            checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudentIds(filteredStudents.map(s => s.id));
                              } else {
                                setSelectedStudentIds([]);
                              }
                            }}
                          />
                        </th>
                        <th className="p-4">MSSV</th>
                        <th className="p-4">Họ và tên</th>
                        <th className="p-4">Lớp</th>
                        <th className="p-4">Ngành</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                      {filteredStudents.map((st) => {
                        const isChecked = selectedStudentIds.includes(st.id);
                        return (
                          <tr 
                            key={st.id} 
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => {
                              if (isChecked) {
                                setSelectedStudentIds(selectedStudentIds.filter(id => id !== st.id));
                              } else {
                                setSelectedStudentIds([...selectedStudentIds, st.id]);
                              }
                            }}
                          >
                            <td className="p-4 pl-6 text-center">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E]"
                                checked={isChecked}
                                readOnly
                              />
                            </td>
                            <td className="p-4 font-bold text-[#407F3E]">{st.mssv}</td>
                            <td className="p-4 font-bold text-slate-800">{st.ho_ten}</td>
                            <td className="p-4 font-medium text-slate-600">{st.lop}</td>
                            <td className="p-4 font-medium text-slate-600">{st.nganh}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
              <div className="text-sm font-bold text-[#407F3E]">
                Đã chọn: {selectedStudentIds.length} sinh viên
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImportingLich(null); }}
                  className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleImportSubmit(); }}
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Xác nhận tải
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
