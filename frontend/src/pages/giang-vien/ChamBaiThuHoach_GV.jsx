import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CheckSquare,
  FileText,
  Sparkles,
  ArrowLeft,
  Download,
  Check,
  AlertTriangle,
  Info,
  ExternalLink,
  Search,
  CheckCircle,
  FileSpreadsheet,
  Loader2,
  Bot,
  Building,
  Laptop,
  RefreshCw
} from 'lucide-react';
import api, { giangVienApi } from '../../services/api';

export default function ChamBaiThuHoach_GV() {
  const [lecturer, setLecturer] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Grading states
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');

  // STATE: Quản lý đoạn text OCR để giáo viên có thể chỉnh sửa/mồi dữ liệu test
  const [editableOcrText, setEditableOcrText] = useState('');

  // STATE TÍCH HỢP AI GRADER
  const [isAIGrading, setIsAIGrading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchReports(res.data.id, 1, searchTerm, statusFilter);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchReports = async (gvId = lecturer?.id, pageVal = page, search = searchTerm, status = statusFilter) => {
    if (!gvId) return;

    // 🚨 MOCK DATA: BÀI BÁO CÁO ẢO CHỨA "TEXT OCR" ĐỂ TEST AI
    const mockReport = {
      id: 8888,
      trang_thai: 'ChoCham',
      ngay_nop: new Date().toISOString(),
      file_bao_cao: 'BaoCao_Mock_KienTap.pdf',
      diem_bai_thu_hoach: null,
      nhan_xet_gv: '',
      noi_dung_text: "I. Tổng quan nhà máy: Công ty Acecook hoạt động rất lớn, sản xuất mì tôm. II. Quy trình công nghệ: 1. Trộn bột, 2. Cán sợi, 3. Chiên, 4. Đóng gói. III. Đánh giá VSATTP: Yêu cầu 1 đồ bảo hộ: Thực trạng có trang bị, Đạt. Yêu cầu 2 rửa tay: Thực trạng sát khuẩn bằng cồn, Đạt. Sinh viên cảm thấy bài học rất bổ ích.",
      phieuDangKy: {
        sinhVien: { ho_ten: '[MOCK] Nguyễn Văn Test AI', mssv: '20010099', lop: '10DHTP1' },
        chuyenThamQuan: { nhaMay: { ten_nha_may: '🏭 [MOCK] Nhà máy Acecook' } }
      }
    };

    try {
      const res = await giangVienApi.getGuidedReports(gvId, {
        page: pageVal,
        limit,
        search: search || undefined,
        status: status !== 'all' ? status : undefined
      });

      setReports([mockReport, ...(res.data.data || [])]);
      setTotal((res.data.total || 0) + 1);
      setTotalPages(res.data.totalPages || 1);
      setPage(pageVal);
    } catch (err) {
      console.error("Lỗi lấy danh sách, ÉP HIỆN MOCK DATA", err);
      setReports([mockReport]);
    }
  };

  useEffect(() => {
    if (lecturer) {
      const delayDebounceFn = setTimeout(() => {
        fetchReports(lecturer.id, 1, searchTerm, statusFilter);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, statusFilter, lecturer]);

  const handleSelectReport = (rep) => {
    setSelectedReport(rep);
    setScore(rep.diem_bai_thu_hoach !== null && rep.diem_bai_thu_hoach !== undefined ? rep.diem_bai_thu_hoach.toString() : '');
    setComments(rep.nhan_xet_gv || '');

    // Nạp dữ liệu vào ô Test
    setEditableOcrText(rep.noi_dung_text || '');

    setMessage('');
    setError('');
    setAiResult(null);
    setIsAIGrading(false);
  };

  // =========================================================================
  // GỌI API HỘI ĐỒNG CHẤM ĐIỂM TỰ ĐỘNG (:8000/grade)
  // =========================================================================
  const handleAIGrading = async () => {
    if (!editableOcrText || editableOcrText.trim() === '') {
      setError('Bạn cần cung cấp đoạn văn bản báo cáo để AI có thể chấm điểm!');
      return;
    }

    setIsAIGrading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/grade',
        { document_text: editableOcrText },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer satori_2026_secure_key'
          }
        }
      );

      setAiResult(response.data);
      setScore(response.data.diem_bao_cao_cuoi_cung.toString());
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối Hội đồng AI Grader. Vui lòng kiểm tra server cổng :8000.');
    } finally {
      setIsAIGrading(false);
    }
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    if (selectedReport.id === 8888) {
      alert("Bạn vừa chấm điểm thành công cho tài khoản Mock Data!");
      setSelectedReport(null);
      return;
    }

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      alert('Vui lòng nhập điểm hợp lệ từ 0 đến 10.');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await giangVienApi.gradeReport({
        reportId: selectedReport.id,
        score: numScore,
        comment: comments
      });
      setMessage(res.data.message);

      fetchReports(lecturer.id);
      setTimeout(() => {
        setSelectedReport(null);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu điểm báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  if (!lecturer) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải danh sách bài thu hoạch...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      {!selectedReport && (
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Chấm bài thu hoạch</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Đánh giá, nhận xét các bài báo cáo thu hoạch kiến tập sau chuyến đi của sinh viên bạn hướng dẫn.
          </p>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className="bg-[#e5ffdc] border border-primary/20 text-[#476d01] px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-750 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      {/* List vs Detail View Toggle */}
      {!selectedReport ? (
        /* Report List View */
        <div className="space-y-6 relative z-10">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-surface-variant/40 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm sinh viên, MSSV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f8faf1] border border-surface-variant rounded-xl text-xs focus:border-primary focus:outline-none font-semibold text-on-surface"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${statusFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-[#f8faf1] border border-surface-variant text-slate-600 hover:bg-[#ecefe6]'}`}
              >Tất cả</button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${statusFilter === 'pending' ? 'bg-primary text-white shadow-sm' : 'bg-[#f8faf1] border border-surface-variant text-slate-600 hover:bg-[#ecefe6]'}`}
              >Chờ chấm</button>
              <button
                onClick={() => setStatusFilter('graded')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${statusFilter === 'graded' ? 'bg-primary text-white shadow-sm' : 'bg-[#f8faf1] border border-surface-variant text-slate-600 hover:bg-[#ecefe6]'}`}
              >Đã chấm</button>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-variant">
                    <th className="py-4 px-6">Sinh viên</th>
                    <th className="py-4 px-6">MSSV / Lớp</th>
                    <th className="py-4 px-6">Chuyến kiến tập</th>
                    <th className="py-4 px-6">Tập tin</th>
                    <th className="py-4 px-6">Ngày nộp</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        Không tìm thấy bài thu hoạch nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    reports.map((r) => {
                      const isGraded = r.trang_thai === 'DaCham';
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-4 px-6">
                            <span className="font-bold text-on-surface">{r.phieuDangKy?.sinhVien?.ho_ten}</span>
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant font-mono text-xs">
                            {r.phieuDangKy?.sinhVien?.mssv} | {r.phieuDangKy?.sinhVien?.lop}
                          </td>
                          <td className="py-4 px-6 font-bold text-on-surface group-hover:text-primary transition-colors">
                            {r.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may}
                          </td>
                          <td className="py-4 px-6 text-xs text-primary font-mono truncate max-w-[150px]" title={r.file_bao_cao}>
                            {r.file_bao_cao ? r.file_bao_cao.split('/').pop() : 'Báo cáo.pdf'}
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant font-medium">
                            {new Date(r.ngay_nop).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isGraded 
                                ? 'bg-primary/10 text-primary border border-primary/20' 
                                : 'bg-warning-yellow/15 text-yellow-750 border border-warning-yellow/30'
                            }`}>
                              <span>{isGraded ? `Đã chấm (${r.diem_bai_thu_hoach})` : 'Chờ chấm'}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleSelectReport(r)}
                              className="px-3.5 py-1.5 bg-primary text-white hover:bg-primary-container rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all active:scale-95 flex items-center gap-1 inline-flex"
                            >
                              <span>{isGraded ? 'Xem lại' : 'Chấm bài'}</span>
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
        </div>
      ) : (
        /* Report Grading Detail View */
        <div className="space-y-6 animate-fade-in relative z-10">
          {/* Breadcrumbs / Back navigation */}
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-surface-variant/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-md border border-primary/20 shadow-inner">
                {selectedReport.phieuDangKy?.sinhVien?.ho_ten?.charAt(0) || 'S'}
              </div>
              <div>
                <h2 className="font-bold text-base text-on-surface">{selectedReport.phieuDangKy?.sinhVien?.ho_ten}</h2>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  MSSV: <span className="font-mono text-on-surface font-semibold">{selectedReport.phieuDangKy?.sinhVien?.mssv}</span> | Lớp: <span className="text-on-surface font-semibold">{selectedReport.phieuDangKy?.sinhVien?.lop}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedReport(null)}
              className="px-4 py-2 border border-slate-200 text-on-surface-variant hover:text-on-surface font-bold text-xs rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>

          {/* Grid: Document viewer vs Grade form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* 🔴 CỘT TRÁI: Dữ liệu OCR (Textarea) và Bảng Rubric */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Box Textarea */}
              <div className="bg-white rounded-2xl shadow-sm border border-surface-variant/40 overflow-hidden flex flex-col">
                <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between text-xs font-semibold shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="truncate max-w-[280px] uppercase tracking-wider">Trình mồi dữ liệu OCR (Dùng để Test)</span>
                  </div>
                </div>

                {/* Textarea cố định chiều cao, cuộn nội bộ */}
                <textarea
                  value={editableOcrText}
                  onChange={(e) => setEditableOcrText(e.target.value)}
                  placeholder="Dán nội dung báo cáo của sinh viên vào đây để mô phỏng dữ liệu OCR..."
                  className="p-6 bg-slate-50 overflow-y-auto font-mono text-xs leading-relaxed text-slate-700 whitespace-pre-wrap w-full h-[350px] resize-none focus:outline-none focus:bg-white focus:ring-inset focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Rubric Box (Sẽ hiện ra DƯỚI textarea khi chấm xong) */}
              {aiResult && (
                <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden flex flex-col animate-fade-in">
                  <div className="bg-emerald-850 text-white px-6 py-3 flex items-center justify-between text-xs font-semibold shrink-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span className="uppercase tracking-wider">Chi Tiết Bảng Điểm Rubric - Hội Đồng AI</span>
                    </div>
                  </div>

                  {/* Vùng cuộn cố định chiều cao cho các nhận xét Rubric */}
                  <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto bg-[#f8faf1]">
                    {/* Card 1: Hình thức & Tổng quan */}
                    <div className="p-4 bg-white border border-[#d1dec0] shadow-sm rounded-xl space-y-3">
                      <div className="flex justify-between font-black text-sm text-on-surface border-b border-surface-variant/40 pb-2">
                        <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#89B449]"/>1. Hình thức & Cấu trúc</span>
                        <span className="text-emerald-800 font-mono bg-emerald-100 px-2 py-0.5 rounded-md">
                          {aiResult.hinh_thuc_tong_quan?.diem_hinh_thuc}/10 đ
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic border-l-2 border-emerald-300 pl-3">
                        {aiResult.hinh_thuc_tong_quan?.ly_do_hinh_thuc}
                      </p>

                      <div className="flex justify-between font-black text-sm text-on-surface border-b border-surface-variant/40 pb-2 pt-2">
                        <span className="flex items-center gap-2"><Building className="w-4 h-4 text-[#89B449]"/>2. Tổng quan doanh nghiệp</span>
                        <span className="text-emerald-800 font-mono bg-emerald-100 px-2 py-0.5 rounded-md">
                          {aiResult.hinh_thuc_tong_quan?.diem_tong_quan}/10 đ
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic border-l-2 border-emerald-300 pl-3">
                        {aiResult.hinh_thuc_tong_quan?.ly_do_tong_quan}
                      </p>
                    </div>

                    {/* Card 2: Quy trình công nghệ */}
                    <div className="p-4 bg-white border border-[#d1dec0] shadow-sm rounded-xl space-y-3">
                      <div className="flex justify-between font-black text-sm text-on-surface border-b border-surface-variant/40 pb-2">
                        <span className="flex items-center gap-2"><Laptop className="w-4 h-4 text-[#89B449]"/>3. Quy trình công nghệ quan sát</span>
                        <span className="text-emerald-800 font-mono bg-emerald-100 px-2 py-0.5 rounded-md">
                          {aiResult.quy_trinh_cong_nghe?.diem_quy_trinh}/10 đ
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic border-l-2 border-emerald-300 pl-3">
                        {aiResult.quy_trinh_cong_nghe?.ly_do_quy_trinh}
                      </p>
                    </div>

                    {/* Card 3: Đánh giá VSATTP */}
                    <div className="p-4 bg-white border border-[#d1dec0] shadow-sm rounded-xl space-y-3">
                      <div className="flex justify-between font-black text-sm text-on-surface border-b border-surface-variant/40 pb-2">
                        <span className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-[#89B449]"/>4. Đánh giá thực trạng VSATTP</span>
                        <span className="text-emerald-800 font-mono bg-emerald-100 px-2 py-0.5 rounded-md">
                          {aiResult.vsattp?.diem_vsattp}/10 đ
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic border-l-2 border-emerald-300 pl-3">
                        {aiResult.vsattp?.ly_do_vsattp}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 🔴 CỘT PHẢI: Bảng điều khiển AI & Form Nhập điểm */}
            <div className="lg:col-span-5 space-y-6">

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-emerald-200 shadow-sm relative overflow-hidden min-h-[160px] flex flex-col justify-center">
                <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
                  <Sparkles className="w-32 h-32 text-primary" />
                </div>

                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-800 flex items-center justify-center shadow-inner">
                    <Bot className="w-5 h-5 text-emerald-800" />
                  </div>
                  <h2 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wider">Hội Đồng AI Chấm Điểm</h2>
                </div>

                {isAIGrading ? (
                  <div className="flex flex-col items-center justify-center py-4 relative z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                    <p className="text-xs font-bold text-emerald-800">🧠 Đang đối chiếu Rubric & Phân tích...</p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">(Quá trình này mất khoảng 10 - 15 giây)</p>
                  </div>
                ) : !aiResult ? (
                  <div className="relative z-10 space-y-4">
                    <p className="text-emerald-900 text-xs font-semibold leading-relaxed">
                      Sử dụng mô hình ngôn ngữ lớn (Qwen-Max) để tự động đối chiếu văn bản báo cáo với tiêu chuẩn Rubric của Khoa.
                    </p>
                    <button
                      onClick={handleAIGrading}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Kích hoạt AI Đánh Giá</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative z-10 animate-fade-in">
                    <div className="flex items-baseline justify-between mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-emerald-800 leading-none">{aiResult.diem_bao_cao_cuoi_cung.toFixed(1)}</span>
                        <span className="text-emerald-600 text-sm font-bold">/ 10</span>
                      </div>

                      {/* NÚT CHẤM LẠI */}
                      <button
                        onClick={handleAIGrading}
                        className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Chấm lại</span>
                      </button>
                    </div>

                    <p className="text-emerald-900 text-xs font-semibold leading-relaxed mb-4">
                      Phân tích hoàn tất. Hệ thống đã đánh giá đủ 3 tiêu chí: Hình thức, Công nghệ và VSATTP. Xem chi tiết nhận xét Rubric ở bên trái.
                    </p>
                  </div>
                )}
              </div>

              {/* Grading input form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/40 space-y-6">
                <h3 className="font-bold text-sm text-[#191d17] uppercase tracking-wider">Phiếu quyết định điểm</h3>

                <form onSubmit={handleSaveGrade} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Điểm báo cáo thu hoạch (0 - 10) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative max-w-[140px]">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-full px-4 py-3 font-mono font-black text-xl text-primary bg-[#f8faf1] border border-surface-variant rounded-xl focus:outline-none focus:border-primary/50 text-center"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">/ 10</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Nhận xét (Sẽ gửi cho sinh viên)
                    </label>
                    <textarea
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Ghi chú thêm nếu bạn chỉnh sửa điểm do AI gợi ý..."
                      className="w-full p-4 text-xs bg-[#f8faf1] border border-surface-variant rounded-xl focus:outline-none focus:border-primary/50 text-on-surface font-semibold leading-relaxed resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-[#ecefe6] rounded-xl cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Xác nhận điểm số
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}