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

  // New states for UI interactions
  const [isTeacherCommentExpanded, setIsTeacherCommentExpanded] = useState(false);
  const [expandedAiFrame, setExpandedAiFrame] = useState(null); // 'hinh_thuc', 'quy_trinh', 'vsattp'
  const [ocrZoomLevel, setOcrZoomLevel] = useState(100);

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

  // STATE: Tabs for Left Pane
  const [activeTab, setActiveTab] = useState('pdf');

  // ... (giữ nguyên các đoạn code từ useEffect đến hết renderReportList, chỉ thay đổi renderGradingView)
  
  const renderGradingView = () => {
    const sv = selectedReport.phieuDangKy?.sinhVien || {};
    const nhaMay = selectedReport.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi';

    return (
      <div className="h-[calc(100vh-80px)] flex flex-col animate-in fade-in zoom-in-95 duration-300 -m-6">
        
        {/* Top Breadcrumb Bar */}
        <div className="h-14 bg-white border-b border-[#E7E0C4] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <button onClick={() => setSelectedReport(null)} className="hover:text-[#407F3E] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Bài thu hoạch</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-[#407F3E]">{nhaMay}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E7E0C4] flex items-center justify-center text-[#407F3E] font-bold text-xs">{sv.ho_ten?.charAt(0) || 'S'}</div>
                <div>
                   <div className="text-xs font-bold text-slate-800">{sv.ho_ten}</div>
                   <div className="text-[10px] text-slate-500">MSSV: {sv.mssv}</div>
                </div>
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
          
          {/* CỘT 1: BẢN GỐC PDF */}
          <div className="flex-1 flex flex-col overflow-hidden relative border-r border-[#E7E0C4] bg-[#E7E0C4]/10 min-w-[300px]">
            <div className="bg-white border-b border-[#E7E0C4] px-4 py-3 flex items-center gap-2 shrink-0 shadow-sm z-10">
              <FileText className="w-5 h-5 text-[#407F3E]" />
              <span className="font-bold text-slate-700 text-sm">Tài liệu Báo cáo gốc</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="flex flex-col items-center h-full">
                {/* PDF Toolbar */}
                <div className="bg-white border border-[#E7E0C4] rounded-xl flex items-center justify-between p-2 shadow-sm w-full max-w-[800px] mb-4 shrink-0">
                  <div className="flex items-center gap-3 text-slate-600">
                    <button onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><ZoomOut className="w-4 h-4" /></button>
                    <span className="text-xs font-bold w-12 text-center bg-slate-50 py-1 rounded">{zoomLevel}%</span>
                    <button onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><ZoomIn className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                    <span>Trang 1 / 14</span>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* PDF Canvas (Simulated) */}
                <div className="flex justify-center w-full max-w-[800px] flex-1 pb-10">
                  <div 
                    className="bg-white w-full h-fit shadow-md text-slate-800 p-10 relative rounded-xl border border-slate-200 min-h-[800px]"
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
                  >
                    <div className="text-center mb-8">
                      <h3 className="font-bold text-sm uppercase tracking-widest mb-1 text-slate-600">TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP.HCM</h3>
                      <p className="font-bold text-sm uppercase tracking-widest text-slate-600">KHOA CÔNG NGHỆ THỰC PHẨM</p>
                      <div className="w-16 h-[2px] bg-slate-300 mx-auto my-5"></div>
                      <h1 className="text-xl font-black uppercase tracking-wider mb-2 text-[#407F3E]">BÁO CÁO THU HOẠCH KIẾN TẬP</h1>
                    </div>
                    <div className="space-y-4 max-w-md mx-auto mb-10 font-bold text-sm border-2 border-[#407F3E] p-6 rounded-xl bg-[#407F3E]/5">
                      <div className="flex justify-between border-b border-[#407F3E]/20 pb-2"><span className="text-slate-500">Sinh viên thực hiện:</span><span className="text-slate-800">{sv.ho_ten}</span></div>
                      <div className="flex justify-between border-b border-[#407F3E]/20 pb-2"><span className="text-slate-500">Mã số sinh viên:</span><span className="text-slate-800">{sv.mssv}</span></div>
                      <div className="flex justify-between pb-2"><span className="text-slate-500">Cơ sở kiến tập:</span><span className="text-slate-800 text-right w-1/2 line-clamp-2">{nhaMay}</span></div>
                    </div>
                    <div className="text-justify text-sm leading-relaxed whitespace-pre-wrap text-slate-500 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center min-h-[300px]">
                      {selectedReport.file_url_bao_cao 
                        ? `Hệ thống sẽ hiển thị file PDF thực tế ở đây: ${selectedReport.file_url_bao_cao}` 
                        : '(Mô phỏng: Tại đây sẽ hiển thị iframe của trình xem PDF)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT 2: DỮ LIỆU OCR */}
          <div className="flex-1 flex flex-col overflow-hidden relative border-r border-[#E7E0C4] bg-[#E7E0C4]/10 min-w-[300px]">
            <div className="bg-white border-b border-[#E7E0C4] px-4 py-3 flex items-center gap-2 shrink-0 shadow-sm z-10">
              <FileSpreadsheet className="w-5 h-5 text-[#407F3E]" />
              <span className="font-bold text-slate-700 text-sm">Dữ liệu chữ đã quét (OCR)</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="flex flex-col items-center h-full">
                {/* OCR Toolbar */}
                <div className="bg-white border border-[#E7E0C4] rounded-xl flex items-center justify-between p-2 shadow-sm w-full max-w-[800px] mb-4 shrink-0">
                  <div className="flex items-center gap-3 text-slate-600">
                    <button onClick={() => setOcrZoomLevel(prev => Math.max(50, prev - 10))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><ZoomOut className="w-4 h-4" /></button>
                    <span className="text-xs font-bold w-12 text-center bg-slate-50 py-1 rounded">{ocrZoomLevel}%</span>
                    <button onClick={() => setOcrZoomLevel(prev => Math.min(200, prev + 10))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><ZoomIn className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* OCR Editor (Simulating PDF page) */}
                <div className="flex justify-center w-full max-w-[800px] flex-1 pb-10">
                  <div 
                    className="bg-white w-full shadow-md relative rounded-xl border border-slate-200 min-h-[800px] flex flex-col"
                    style={{ transform: `scale(${ocrZoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
                  >
                    <textarea
                      value={editableOcrText}
                      onChange={(e) => setEditableOcrText(e.target.value)}
                      placeholder="Dán hoặc chỉnh sửa nội dung OCR ở đây..."
                      className="flex-1 w-full p-10 bg-transparent text-sm font-mono text-slate-700 resize-none focus:outline-none custom-scrollbar leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT 3: TRỢ LÝ AI & CHẤM ĐIỂM */}
          <div className="bg-white flex flex-col shrink-0 z-20 overflow-hidden shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.05)] border-l border-[#E7E0C4] w-[320px] lg:w-[350px]">
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 flex items-center justify-between shrink-0 text-white shadow-sm z-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#DBD468]" />
                  <span className="font-bold text-sm">Trợ lý AI & Chấm điểm</span>
                </div>
              </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                  {/* Phần AI */}
                  <div className="space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-750 p-3 rounded-lg text-xs font-bold flex items-start gap-2 shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    {!aiResult && !isAIGrading && (
                      <button 
                        onClick={handleAIGrading} 
                        className="w-full py-3 bg-[#89B449] hover:bg-[#78a03c] text-white rounded-xl text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Bot className="w-5 h-5"/> Kích hoạt AI Chấm Điểm
                      </button>
                    )}

                    {isAIGrading && (
                       <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="relative mb-3">
                           <div className="w-10 h-10 border-4 border-[#89B449]/30 rounded-full"></div>
                           <div className="w-10 h-10 border-4 border-[#407F3E] rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                           <Sparkles className="w-4 h-4 text-[#89B449] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                         </div>
                         <p className="text-xs font-bold text-[#407F3E] uppercase tracking-widest">Đang phân tích...</p>
                       </div>
                    )}

                    {aiResult && !isAIGrading && (
                      <div className="flex flex-col animate-in fade-in duration-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-slate-700 text-sm">Kết quả AI phân tích</span>
                          <button onClick={handleAIGrading} className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-xs font-bold flex items-center gap-1 transition-colors text-slate-600">
                            <RefreshCw className="w-3 h-3"/> Chấm lại
                          </button>
                        </div>
                        <p className="text-[10px] italic text-[#407F3E] font-medium mb-3 bg-[#89B449]/10 py-1.5 px-2 rounded border border-[#89B449]/30 text-center">💡 Nhấn vào khung bên dưới để xem chi tiết nhận xét</p>
                        
                        {/* Collapsible Frames */}
                        <div className="space-y-2.5">
                           {/* Hình thức */}
                           <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-300 transition-colors cursor-pointer select-none" onClick={() => setExpandedAiFrame(prev => prev === 'hinh_thuc' ? null : 'hinh_thuc')}>
                             <div className="flex justify-between items-center">
                               <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Hình thức & Tổng quan</span>
                               <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{aiResult.hinh_thuc_tong_quan?.diem_hinh_thuc}/10</span>
                             </div>
                             {expandedAiFrame === 'hinh_thuc' && (
                               <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 leading-relaxed">{aiResult.hinh_thuc_tong_quan?.ly_do_hinh_thuc}</p>
                             )}
                           </div>
                           
                           {/* Quy trình */}
                           <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-purple-300 transition-colors cursor-pointer select-none" onClick={() => setExpandedAiFrame(prev => prev === 'quy_trinh' ? null : 'quy_trinh')}>
                             <div className="flex justify-between items-center">
                               <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Quy trình công nghệ</span>
                               <span className="font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-xs">{aiResult.quy_trinh_cong_nghe?.diem_quy_trinh}/10</span>
                             </div>
                             {expandedAiFrame === 'quy_trinh' && (
                               <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 leading-relaxed">{aiResult.quy_trinh_cong_nghe?.ly_do_quy_trinh}</p>
                             )}
                           </div>
                           
                           {/* VSATTP */}
                           <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-orange-300 transition-colors cursor-pointer select-none" onClick={() => setExpandedAiFrame(prev => prev === 'vsattp' ? null : 'vsattp')}>
                             <div className="flex justify-between items-center">
                               <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Đảm bảo VSATTP</span>
                               <span className="font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs">{aiResult.vsattp?.diem_vsattp}/10</span>
                             </div>
                             {expandedAiFrame === 'vsattp' && (
                               <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 leading-relaxed">{aiResult.vsattp?.ly_do_vsattp}</p>
                             )}
                           </div>
                        </div>

                        <button 
                          type="button"
                          onClick={() => {
                            const newComments = `[ĐÁNH GIÁ TỪ TRỢ LÝ AI]

🔹 Hình thức & Tổng quan (${aiResult.hinh_thuc_tong_quan?.diem_hinh_thuc}/10):
${aiResult.hinh_thuc_tong_quan?.ly_do_hinh_thuc}

🔹 Quy trình công nghệ (${aiResult.quy_trinh_cong_nghe?.diem_quy_trinh}/10):
${aiResult.quy_trinh_cong_nghe?.ly_do_quy_trinh}

🔹 Đảm bảo VSATTP (${aiResult.vsattp?.diem_vsattp}/10):
${aiResult.vsattp?.ly_do_vsattp}
`;
                            setComments(prev => prev ? prev + '\n\n' + newComments : newComments);
                            setScore(aiResult.diem_bao_cao_cuoi_cung.toString());
                          }}
                          className="mt-4 w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shrink-0"
                        >
                          <CheckCircle className="w-4 h-4" /> Dùng Điểm ({aiResult.diem_bao_cao_cuoi_cung.toFixed(1)}) & Nhận Xét
                        </button>
                      </div>
                    )}
                  </div>

                  <hr className="border-slate-200" />

                  {/* Form Chấm điểm */}
                  <form id="grading-form" onSubmit={handleSaveGrade} className="space-y-4">
                     <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm số (0-10) <span className="text-red-500">*</span></label>
                       <input 
                         type="number" min="0" max="10" step="0.1" 
                         value={score}
                         onChange={(e) => setScore(e.target.value)}
                         placeholder="0.0"
                         required
                         className="w-20 px-2 py-1.5 bg-white border-2 border-slate-300 rounded-lg text-lg focus:outline-none focus:border-[#407F3E] focus:ring-4 focus:ring-[#407F3E]/20 font-black text-[#407F3E] transition-all text-center shadow-inner"
                       />
                     </div>

                     <div>
                       {!isTeacherCommentExpanded ? (
                         <div 
                           onClick={() => setIsTeacherCommentExpanded(true)}
                           className="w-full px-4 py-3 bg-[#DBD468]/10 border-2 border-[#DBD468]/50 border-dashed rounded-xl text-sm font-medium hover:bg-[#DBD468]/20 transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                         >
                           <MessageSquareWarning className="w-4 h-4 text-[#89B449]" />
                           <span className="text-[#407F3E] font-bold">Nhấn vào đây để thêm nhận xét</span>
                         </div>
                       ) : (
                         <div className="animate-in fade-in zoom-in-95 duration-200">
                           <div className="flex items-center justify-between mb-2">
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nhận xét của GV</label>
                             <div className="flex items-center gap-2">
                               <button type="button" onClick={handleInsertTemplate} className="text-[10px] font-bold text-[#407F3E] bg-[#407F3E]/10 px-2 py-1 rounded hover:bg-[#407F3E]/20 transition-colors">+ Mẫu</button>
                               <button type="button" onClick={() => setIsTeacherCommentExpanded(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                 </svg>
                               </button>
                             </div>
                           </div>
                           <textarea 
                             value={comments}
                             onChange={(e) => setComments(e.target.value)}
                             placeholder="Nhập nhận xét chi tiết..."
                             rows={6}
                             className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:bg-white focus:ring-4 focus:ring-[#407F3E]/10 text-slate-700 resize-none custom-scrollbar leading-relaxed shadow-inner"
                           />
                         </div>
                       )}
                     </div>
                  </form>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
                   <button 
                     type="submit" form="grading-form" disabled={loading}
                     className="w-full flex items-center justify-center gap-1.5 py-3 bg-[#407F3E] text-white hover:bg-[#346832] rounded-xl text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                   >
                     <Save className="w-4 h-4 shrink-0" /> {loading ? 'Đang lưu...' : 'Lưu Điểm'}
                   </button>
                </div>
              </div>
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
