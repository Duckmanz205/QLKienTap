import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, ChevronRight, ChevronDown, Check, X, Upload, CloudUpload, ArrowLeft
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { khoaApi } from '../../services/api';

export default function LichKienTap_Khoa() {
  const [schedules, setSchedules] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Create States
  const [createStep, setCreateStep] = useState(1);
  const [createForm, setCreateForm] = useState({
    ten_lich: '',
    dot_kien_tap_id: '',
    khoa_id: '',
    tg_mo_dang_ky_tu: '',
    tg_mo_dang_ky_den: '',
    tg_dien_ra_tu: '',
    tg_dien_ra_den: '',
    han_chot_nop_bao_cao: '',
    han_chot_diem: '',
  });
  const [uploadedStudents, setUploadedStudents] = useState([]);
  const [fileError, setFileError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);

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
      const [schRes, campRes, courseRes] = await Promise.all([
        khoaApi.getSchedules(),
        khoaApi.getCampaigns(),
        khoaApi.getCourses()
      ]);
      setSchedules(schRes.data);
      setCampaigns(campRes.data);
      setCourses(courseRes.data);
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        const formatted = data.map(row => ({
          mssv: String(row['MSSV'] || row['mssv'] || ''),
          ho_ten: String(row['Họ tên'] || row['ho_ten'] || ''),
          ten_lop: String(row['Lớp'] || row['ten_lop'] || ''),
        })).filter(r => r.mssv);
        if (formatted.length === 0) {
          setFileError('File không có dữ liệu hợp lệ hoặc sai định dạng mẫu.');
          setUploadedStudents([]);
        } else {
          setFileError('');
          setUploadedStudents(formatted);
        }
      } catch (err) {
        setFileError('Không đọc được file. Vui lòng kiểm tra định dạng .xlsx/.xls.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const handleFinalSubmit = async () => {
    setIsCreating(true);
    try {
      const payload = {
        ...createForm,
        dot_kien_tap_id: Number(createForm.dot_kien_tap_id),
        khoa_id: createForm.khoa_id ? Number(createForm.khoa_id) : undefined,
      };
      // Convert empty date strings to undefined to prevent invalid date errors
      if (!payload.tg_mo_dang_ky_tu) delete payload.tg_mo_dang_ky_tu;
      if (!payload.tg_mo_dang_ky_den) delete payload.tg_mo_dang_ky_den;
      if (!payload.tg_dien_ra_tu) delete payload.tg_dien_ra_tu;
      if (!payload.tg_dien_ra_den) delete payload.tg_dien_ra_den;
      if (!payload.han_chot_nop_bao_cao) delete payload.han_chot_nop_bao_cao;
      if (!payload.han_chot_diem) delete payload.han_chot_diem;

      const createRes = await khoaApi.createSchedule(payload);
      const newLichId = createRes.data?.data?.id || createRes.data?.id; 
      
      let studentIds = [];
      if (uploadedStudents.length > 0) {
        const stRes = await khoaApi.getStudents({ limit: 10000 });
        const allStData = stRes.data?.data || stRes.data || [];
        const mssvToId = {};
        allStData.forEach(st => {
          mssvToId[st.mssv] = st.id;
        });
        
        studentIds = uploadedStudents.map(st => mssvToId[st.mssv]).filter(id => id);
        
        if (studentIds.length > 0) {
          await khoaApi.importStudents({ lichId: newLichId, studentIds });
        }
      }
      
      await fetchData();
      alert(`Tạo lịch kiến tập thành công.${studentIds.length > 0 ? ` Đã gán ${studentIds.length}/${uploadedStudents.length} sinh viên hợp lệ.` : ''}`);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo lịch kiến tập: ' + (err.response?.data?.message || err.message || 'Không xác định'));
    } finally {
      setIsCreating(false);
    }
  };

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
          onClick={() => {
            setCreateStep(1);
            setCreateForm({
              ten_lich: '', dot_kien_tap_id: '', khoa_id: '', 
              tg_mo_dang_ky_tu: '', tg_mo_dang_ky_den: '', tg_dien_ra_tu: '', tg_dien_ra_den: '', 
              han_chot_nop_bao_cao: '', han_chot_diem: ''
            });
            setUploadedStudents([]);
            setFileError('');
            setIsModalOpen(true);
          }}
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

      {/* 3-Step Wizard Modal Create */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Tạo lịch kiến tập</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Stepper */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#407F3E] -z-10 transition-all duration-300"
                  style={{ width: createStep === 1 ? '0%' : createStep === 2 ? '50%' : '100%' }}
                ></div>
                
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                      createStep > step ? 'bg-[#407F3E] text-white' :
                      createStep === step ? 'bg-white border-2 border-[#407F3E] text-[#407F3E] font-bold' :
                      'bg-slate-100 text-slate-400 font-bold'
                    }`}>
                      {createStep > step ? <Check className="w-5 h-5" /> : step}
                    </div>
                    <span className={`text-xs font-bold ${
                      createStep >= step ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {step === 1 ? '1. Thông tin lịch' : step === 2 ? '2. Tải danh sách SV' : '3. Xác nhận'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Content by Step */}
              {createStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Tên lịch <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        value={createForm.ten_lich}
                        onChange={e => setCreateForm({...createForm, ten_lich: e.target.value})}
                        className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E]"
                        placeholder="Nhập tên lịch kiến tập"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Đợt kiến tập <span className="text-red-500">*</span></label>
                      <select 
                        value={createForm.dot_kien_tap_id}
                        onChange={e => setCreateForm({...createForm, dot_kien_tap_id: e.target.value})}
                        className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] bg-white"
                      >
                        <option value="">Chọn đợt kiến tập</option>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.ten_dot}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Mở đăng ký (từ)</label>
                      <input type="datetime-local" value={createForm.tg_mo_dang_ky_tu} onChange={e => setCreateForm({...createForm, tg_mo_dang_ky_tu: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Mở đăng ký (đến)</label>
                      <input type="datetime-local" value={createForm.tg_mo_dang_ky_den} onChange={e => setCreateForm({...createForm, tg_mo_dang_ky_den: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Diễn ra (từ)</label>
                      <input type="date" value={createForm.tg_dien_ra_tu} onChange={e => setCreateForm({...createForm, tg_dien_ra_tu: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Diễn ra (đến)</label>
                      <input type="date" value={createForm.tg_dien_ra_den} onChange={e => setCreateForm({...createForm, tg_dien_ra_den: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Hạn nộp báo cáo</label>
                      <input type="date" value={createForm.han_chot_nop_bao_cao} onChange={e => setCreateForm({...createForm, han_chot_nop_bao_cao: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Hạn chốt điểm</label>
                      <input type="date" value={createForm.han_chot_diem} onChange={e => setCreateForm({...createForm, han_chot_diem: e.target.value})} className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {createStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Khóa <span className="text-red-500">*</span></label>
                    <select 
                      value={createForm.khoa_id}
                      onChange={e => setCreateForm({...createForm, khoa_id: e.target.value})}
                      className="w-full px-4 py-2 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] bg-white"
                    >
                      <option value="">Chọn khóa</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.ten_khoa}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Tải lên danh sách sinh viên</label>
                    <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#E7E0C4] rounded-xl p-8 bg-slate-50 flex flex-col items-center justify-center text-center hover:bg-slate-100 hover:border-[#89B449] transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <CloudUpload className="w-6 h-6 text-[#89B449]" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">
                        Bấm hoặc kéo thả file Excel để tải lên danh sách sinh viên
                      </p>
                      <p className="text-xs text-slate-400">Hỗ trợ định dạng .xlsx, .xls</p>
                    </div>
                    {fileError && <p className="text-red-500 text-xs mt-2 font-semibold">{fileError}</p>}
                  </div>

                  {uploadedStudents.length > 0 && (
                    <div className="bg-white border border-[#E7E0C4] rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-3 bg-slate-50 border-b border-[#E7E0C4] flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Xem trước ({uploadedStudents.length} dòng)</span>
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
                          {uploadedStudents.slice(0, 5).map((st, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 text-[#407F3E]">{st.mssv}</td>
                              <td className="px-4 py-2">{st.ho_ten}</td>
                              <td className="px-4 py-2">{st.ten_lop}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {uploadedStudents.length > 5 && (
                        <div className="text-center py-2 text-xs text-slate-500 font-medium bg-slate-50">
                          ... và {uploadedStudents.length - 5} sinh viên khác
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {createStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-[#E7E0C4] rounded-xl p-4">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Tóm tắt thông tin lịch</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-slate-500">Tên lịch:</div>
                      <div className="font-semibold text-slate-800">{createForm.ten_lich}</div>
                      
                      <div className="text-slate-500">Đợt kiến tập:</div>
                      <div className="font-semibold text-slate-800">{campaigns.find(c => c.id === Number(createForm.dot_kien_tap_id))?.ten_dot || ''}</div>
                      
                      <div className="text-slate-500">Khóa:</div>
                      <div className="font-semibold text-slate-800">{courses.find(c => c.id === Number(createForm.khoa_id))?.ten_khoa || 'Không chọn'}</div>
                      
                      <div className="text-slate-500">Sinh viên sẽ gán:</div>
                      <div className="font-semibold text-[#407F3E]">{uploadedStudents.length} sinh viên</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Bạn có chắc chắn muốn tạo lịch này và tải danh sách sinh viên lên hệ thống?</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
              <button 
                onClick={() => {
                  if (createStep > 1) setCreateStep(createStep - 1);
                  else setIsModalOpen(false);
                }}
                disabled={isCreating}
                className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                {createStep > 1 && <ArrowLeft className="w-4 h-4" />} Quay lại
              </button>
              
              {createStep < 3 ? (
                <button 
                  onClick={() => {
                    if (createStep === 1) {
                      if (!createForm.ten_lich || !createForm.dot_kien_tap_id) {
                        alert('Vui lòng nhập Tên lịch và chọn Đợt kiến tập.');
                        return;
                      }
                      setCreateStep(2);
                    } else if (createStep === 2) {
                      if (uploadedStudents.length === 0) {
                        setFileError('Vui lòng tải lên danh sách sinh viên.');
                        return;
                      }
                      setCreateStep(3);
                    }
                  }}
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                >
                  Tiếp tục
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleFinalSubmit}
                  disabled={isCreating}
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? 'Đang tạo...' : 'Xác nhận tạo lịch'}
                  {!isCreating && <Check className="w-4 h-4" />}
                </button>
              )}
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
