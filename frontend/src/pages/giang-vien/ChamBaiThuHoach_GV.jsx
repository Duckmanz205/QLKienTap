import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, FileText, CheckCircle2, Save, Search, ChevronRight,
  ZoomIn, ZoomOut, Download, Sparkles, MessageSquareWarning, User,
  CheckSquare, Check, AlertTriangle, Info, ExternalLink, CheckCircle,
  FileSpreadsheet, Loader2, Bot, Building, Laptop, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { giangVienApi } from '../../services/api';

export default function ChamBaiThuHoach_GV() {
  const navigate = useNavigate();
  
  const [lecturer, setLecturer] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Grading states
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);

  // STATE: Quản lý đoạn text OCR để giáo viên có thể chỉnh sửa/mồi dữ liệu test
  const [editableOcrText, setEditableOcrText] = useState('');

  // STATE TÍCH HỢP AI GRADER
  const [isAIGrading, setIsAIGrading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const TEMPLATE_COMMENT = `1. Giới thiệu tổng quan nhà máy: ...
2. Thuyết minh quy trình công nghệ sản xuất: ...
3. Đánh giá thực trạng điều kiện đảm bảo VSATTP: ...`;

  const handleInsertTemplate = () => {
    setComments(prev => prev ? prev + '\n\n' + TEMPLATE_COMMENT : TEMPLATE_COMMENT);
  };

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchReports(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchReports = async (gvId) => {
    if (!gvId) return;
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
      const res = await giangVienApi.getGuidedReports(gvId, { limit: 100 });
      const data = res.data.data ? res.data.data : res.data;
      setReports([mockReport, ...(data || [])]);
    } catch (err) {
      console.error("Lỗi lấy danh sách, ÉP HIỆN MOCK DATA", err);
      setReports([mockReport]);
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setScore(report.diem_bai_thu_hoach !== null && report.diem_bai_thu_hoach !== undefined ? report.diem_bai_thu_hoach : '');
    setComments(report.nhan_xet_cua_giang_vien || report.nhan_xet_gv || '');
    
    // Nạp dữ liệu vào ô Test
    setEditableOcrText(report.noi_dung_text || '');

    setMessage('');
    setError('');
    setAiResult(null);
    setIsAIGrading(false);
  };

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
      alert("Vui lòng nhập điểm hợp lệ (0-10)");
      return;
    }
    setLoading(true);
    try {
      await giangVienApi.gradeReport({
        reportId: selectedReport.id,
        score: numScore,
        comment: comments
      });
      alert('Đã lưu điểm thành công!');
      setSelectedReport(null);
      if (lecturer) fetchReports(lecturer.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi chấm điểm');
    } finally {
      setLoading(false);
    }
  };

  const renderReportList = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={() => navigate('/giang-vien')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-[#407F3E] font-bold text-sm mb-2 transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
          </button>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Danh sách Bài thu hoạch
          </h1>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-[#E7E0C4]">
          Không có bài thu hoạch nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const isGraded = report.diem_bai_thu_hoach !== null && report.diem_bai_thu_hoach !== undefined;
            const sv = report.phieuDangKy?.sinhVien || {};
            const nhaMay = report.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi';
            
            return (
              <div 
                key={report.id} 
                onClick={() => handleSelectReport(report)}
                className="bg-white border border-[#E7E0C4] rounded-2xl overflow-hidden shadow-sm hover:border-[#407F3E] hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className={`px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between ${isGraded ? 'bg-slate-50/50' : 'bg-[#DBD468]/10'}`}>
                  <div className="flex items-center gap-3 truncate">
                    <h2 className="font-black text-slate-800 text-lg group-hover:text-[#407F3E] transition-colors truncate">{nhaMay}</h2>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#E7E0C4]/30 text-[#407F3E] font-bold border border-[#E7E0C4] flex items-center justify-center shrink-0">
                        {sv.ho_ten?.charAt(0) || <User className="w-4 h-4"/>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{sv.ho_ten}</p>
                        <p className="text-[10px] font-medium text-slate-500">MSSV: {sv.mssv}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái:</span>
                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#89B449]/10 text-[#407F3E]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã chấm ({report.diem_bai_thu_hoach}/10)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#DBD468] text-slate-800 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></div> Chờ chấm
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                      <FileText className="w-8 h-8 text-[#407F3E]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{report.file_url_bao_cao || 'BaoCao.pdf'}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{new Date(report.ngay_nop).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-[#407F3E] font-bold text-sm mt-4">
                    {isGraded ? 'Xem lại bài làm' : 'Bắt đầu chấm bài'} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderGradingView = () => {
    const sv = selectedReport.phieuDangKy?.sinhVien || {};
    const nhaMay = selectedReport.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi';

    return (
      <div className="h-[calc(100vh-80px)] flex flex-col animate-in fade-in zoom-in-95 duration-300 -m-6">
        
        {/* Top Breadcrumb Bar */}
        <div className="h-14 bg-white border-b border-[#E7E0C4] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <button onClick={() => setSelectedReport(null)} className="hover:text-[#407F3E] transition-colors">
              Bài thu hoạch
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-[#407F3E]">{nhaMay}</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden bg-[#E7E0C4]/20">
          
          {/* Left Side: Document Viewer & OCR Editor */}
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative space-y-4 p-4">
            
            {/* PDF Toolbar */}
            <div className="bg-white/80 backdrop-blur-sm border border-[#E7E0C4] rounded-xl flex items-center justify-between p-2 shrink-0 shadow-sm z-10 sticky top-0">
              <div className="flex items-center gap-3 text-slate-600">
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold w-10 text-center">{zoomLevel}%</span>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                <span>Trang 1 / 1</span>
                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
              </div>
            </div>

            {/* PDF Canvas (Simulated) */}
            <div className="flex justify-center">
              <div 
                className="bg-white w-full max-w-[700px] h-fit shadow-md text-slate-800 p-8 relative rounded-xl border border-slate-200"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
              >
                <div className="text-center mb-6">
                  <h3 className="font-bold text-xs uppercase tracking-widest mb-1">TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP.HCM</h3>
                  <p className="font-bold text-xs uppercase tracking-widest">KHOA CÔNG NGHỆ THỰC PHẨM</p>
                  <div className="w-12 h-[1px] bg-slate-300 mx-auto my-4"></div>
                  <h1 className="text-lg font-black uppercase tracking-wider mb-2">BÁO CÁO THU HOẠCH KIẾN TẬP</h1>
                </div>
                <div className="space-y-4 max-w-sm mx-auto mb-8 font-medium text-xs">
                  <div className="flex"><span className="w-32 font-bold">Sinh viên:</span><span>{sv.ho_ten}</span></div>
                  <div className="flex"><span className="w-32 font-bold">MSSV:</span><span>{sv.mssv}</span></div>
                </div>
                <div className="text-justify text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedReport.file_url_bao_cao 
                    ? `[Hệ thống sẽ hiển thị file PDF thực tế ở đây: ${selectedReport.file_url_bao_cao}]\n\n(Nội dung mô phỏng bài thu hoạch...)` 
                    : '(Không tìm thấy nội dung bài thu hoạch)'}
                </div>
              </div>
            </div>

            {/* OCR Textarea */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col mt-6 max-w-[700px] mx-auto w-full">
              <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold rounded-t-xl">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#89B449]" />
                  <span className="uppercase tracking-wider">Trình mồi dữ liệu OCR (Dùng để Test AI)</span>
                </div>
              </div>
              <textarea
                value={editableOcrText}
                onChange={(e) => setEditableOcrText(e.target.value)}
                placeholder="Dán nội dung báo cáo của sinh viên vào đây để mô phỏng dữ liệu OCR..."
                className="p-4 bg-slate-50 overflow-y-auto font-mono text-xs leading-relaxed text-slate-700 whitespace-pre-wrap w-full h-[200px] resize-none focus:outline-none focus:bg-white rounded-b-xl border-t-0"
              />
            </div>
            
          </div>

          {/* Right Side: Grading Sidebar */}
          <div className="w-full md:w-[350px] lg:w-[400px] bg-[#fdfcf8] border-l border-[#E7E0C4] flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 overflow-y-auto custom-scrollbar p-5 space-y-5">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-750 p-3 rounded-xl text-xs font-bold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Student Info Card */}
            <div className="bg-white rounded-xl p-4 border border-[#E7E0C4] shadow-sm flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E7E0C4]/30 text-[#407F3E] font-bold border border-[#E7E0C4] flex items-center justify-center shrink-0 text-lg">
                {sv.ho_ten?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{sv.ho_ten}</h3>
                <p className="text-[11px] font-medium text-slate-500 mb-1">MSSV: {sv.mssv}</p>
                <p className="text-[11px] font-medium text-[#407F3E] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {nhaMay}
                </p>
              </div>
            </div>

            {/* AI Suggestion Card (Active) */}
            <div className="bg-gradient-to-br from-[#89B449]/10 to-[#407F3E]/10 rounded-xl p-5 border border-[#89B449]/30 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <Sparkles className="w-4 h-4 text-[#407F3E]" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hội Đồng AI Chấm Điểm</h4>
              </div>

              {isAIGrading ? (
                <div className="flex flex-col items-center justify-center py-4 relative z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[#407F3E] mb-2" />
                  <p className="text-[10px] font-bold text-[#407F3E]">Đang phân tích...</p>
                </div>
              ) : !aiResult ? (
                <div className="space-y-3 relative z-10">
                  <p className="text-[#407F3E] text-xs font-medium">Sử dụng AI để đối chiếu Rubric tự động.</p>
                  <button
                    type="button"
                    onClick={handleAIGrading}
                    className="w-full py-2 bg-[#407F3E] hover:bg-[#346832] text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" /> Kích hoạt AI
                  </button>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#407F3E] leading-none">{aiResult.diem_bao_cao_cuoi_cung.toFixed(1)}</span>
                      <span className="text-sm font-bold text-[#407F3E]/70">/ 10</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAIGrading}
                      className="px-2 py-1 bg-white hover:bg-slate-50 text-[#407F3E] rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-1 shadow-sm border border-[#E7E0C4]"
                    >
                      <RefreshCw className="w-3 h-3" /> Thử lại
                    </button>
                  </div>
                  
                  {/* Mini Rubric Accordion / List */}
                  <div className="space-y-2 mt-3 pt-3 border-t border-[#89B449]/20">
                    <div className="text-[10px]">
                      <div className="flex justify-between font-bold text-[#407F3E]">
                        <span>Hình thức:</span>
                        <span>{aiResult.hinh_thuc_tong_quan?.diem_hinh_thuc}/10 đ</span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 italic">{aiResult.hinh_thuc_tong_quan?.ly_do_hinh_thuc}</p>
                    </div>
                    <div className="text-[10px]">
                      <div className="flex justify-between font-bold text-[#407F3E]">
                        <span>Quy trình:</span>
                        <span>{aiResult.quy_trinh_cong_nghe?.diem_quy_trinh}/10 đ</span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 italic">{aiResult.quy_trinh_cong_nghe?.ly_do_quy_trinh}</p>
                    </div>
                    <div className="text-[10px]">
                      <div className="flex justify-between font-bold text-[#407F3E]">
                        <span>VSATTP:</span>
                        <span>{aiResult.vsattp?.diem_vsattp}/10 đ</span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 italic">{aiResult.vsattp?.ly_do_vsattp}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Grading Form */}
            <form onSubmit={handleSaveGrade} className="bg-white rounded-xl p-5 border border-[#E7E0C4] shadow-sm flex-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Edit3Icon className="w-4 h-4 text-[#407F3E]" /> Đánh giá & Chấm điểm
              </h4>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Điểm GVHD <span className="text-[#E68A8C]">*</span>
                  </label>
                  <div className="relative w-28">
                    <input 
                      type="number" min="0" max="10" step="0.1" 
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="--"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-lg focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] font-black text-[#407F3E] transition-all text-center shadow-sm"
                    />
                    <span className="absolute -right-8 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">/ 10</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Nhận xét chi tiết
                    </label>
                    <button 
                      type="button" 
                      onClick={handleInsertTemplate}
                      className="text-[10px] font-bold text-[#407F3E] bg-[#89B449]/10 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-[#89B449]/20 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" /> Chèn mẫu
                    </button>
                  </div>
                  <textarea 
                    rows={6}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Nhận xét về nội dung, hình thức và tính thực tiễn của bài thu hoạch..."
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-700 shadow-sm resize-none custom-scrollbar"
                  />
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Lưu điểm
                </button>
                
                <button type="button" className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/5 rounded-lg text-sm font-bold transition-all cursor-pointer">
                  <MessageSquareWarning className="w-4 h-4" /> Yêu cầu bổ sung
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={selectedReport ? '' : 'bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300'}>
      {selectedReport ? renderGradingView() : renderReportList()}
    </div>
  );
}

const Edit3Icon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
  </svg>
);
