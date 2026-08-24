import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, FileText, CheckCircle2, Save, Search, ChevronRight,
  ZoomIn, ZoomOut, Download, Sparkles, MessageSquareWarning, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { giangVienApi } from '../../services/api';

export default function ChamBaiThuHoach_GV() {
  const navigate = useNavigate();
  
  const [lecturer, setLecturer] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Grading states
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);

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
    try {
      const res = await giangVienApi.getGuidedReports(gvId, { limit: 100 });
      // Depending on API, reports are in res.data or res.data.data
      const data = res.data.data ? res.data.data : res.data;
      setReports(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setScore(report.diem_bai_thu_hoach !== null ? report.diem_bai_thu_hoach : '');
    setComments(report.nhan_xet_cua_giang_vien || '');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!score || score < 0 || score > 10) {
      alert("Vui lòng nhập điểm hợp lệ (0-10)");
      return;
    }
    try {
      await giangVienApi.gradeReport({
        reportId: selectedReport.id,
        score: parseFloat(score),
        comment: comments
      });
      alert('Đã lưu điểm thành công!');
      setSelectedReport(null);
      if (lecturer) fetchReports(lecturer.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi chấm điểm');
    }
  };

  // ---------------------------------------------------------
  // VIEW 1: LIST OF REPORTS
  // ---------------------------------------------------------
  const renderReportList = () => (
    <div className="space-y-6">
      {/* Header & Back Button */}
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

      {/* Grid of Report Cards */}
      {reports.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-[#E7E0C4]">
          Không có bài thu hoạch nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const isGraded = report.diem_bai_thu_hoach !== null;
            const sv = report.phieuDangKy?.sinhVien || {};
            const nhaMay = report.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi';
            
            return (
              <div 
                key={report.id} 
                onClick={() => handleSelectReport(report)}
                className="bg-white border border-[#E7E0C4] rounded-2xl overflow-hidden shadow-sm hover:border-[#407F3E] hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
              >
                {/* Card Header */}
                <div className={`px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between ${isGraded ? 'bg-slate-50/50' : 'bg-[#DBD468]/10'}`}>
                  <div className="flex items-center gap-3 truncate">
                    <h2 className="font-black text-slate-800 text-lg group-hover:text-[#407F3E] transition-colors truncate">{nhaMay}</h2>
                  </div>
                </div>
                
                {/* Card Body */}
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

  // ---------------------------------------------------------
  // VIEW 2: GRADING A SINGLE REPORT (PDF + Sidebar)
  // ---------------------------------------------------------
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
          
          {/* Left Side: Document Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* PDF Toolbar */}
            <div className="h-12 bg-white/80 backdrop-blur-sm border-b border-[#E7E0C4] flex items-center justify-between px-4 shrink-0 absolute top-0 left-0 right-0 z-10">
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
            <div className="flex-1 overflow-y-auto p-8 pt-20 flex justify-center custom-scrollbar">
              <div 
                className="bg-white w-full max-w-[700px] h-fit min-h-[900px] shadow-lg text-slate-800 p-12 lg:p-16 relative"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#E7E0C4]/50 rounded-bl-3xl"></div>
                
                <div className="text-center mb-12">
                  <h3 className="font-bold text-sm uppercase tracking-widest mb-1">TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP.HCM</h3>
                  <p className="font-bold text-sm uppercase tracking-widest">KHOA CÔNG NGHỆ THỰC PHẨM</p>
                  <div className="w-20 h-[1px] bg-slate-300 mx-auto my-6"></div>
                  <h1 className="text-xl font-black uppercase tracking-wider mb-2">BÁO CÁO THU HOẠCH KIẾN TẬP</h1>
                  <h2 className="text-lg font-bold uppercase tracking-wider">TẠI {nhaMay.toUpperCase()}</h2>
                </div>

                <div className="space-y-4 max-w-sm mx-auto mb-16 font-medium text-sm">
                  <div className="flex">
                    <span className="w-40 font-bold">Sinh viên thực hiện:</span>
                    <span>{sv.ho_ten}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 font-bold">MSSV:</span>
                    <span>{sv.mssv}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 font-bold">Lớp:</span>
                    <span>{sv.lop || '--'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 font-bold">Ngày nộp:</span>
                    <span>{new Date(selectedReport.ngay_nop).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="space-y-6 text-justify text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedReport.file_url_bao_cao 
                    ? `[Hệ thống sẽ hiển thị file PDF thực tế ở đây: ${selectedReport.file_url_bao_cao}]\n\n(Nội dung mô phỏng bài thu hoạch...)` 
                    : '(Không tìm thấy nội dung bài thu hoạch)'}
                </div>

                {/* Watermark Draft */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  <span className="text-9xl font-black -rotate-45">HUIT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Grading Sidebar */}
          <div className="w-full md:w-[350px] lg:w-[400px] bg-[#fdfcf8] border-l border-[#E7E0C4] flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 overflow-y-auto custom-scrollbar p-5 space-y-5">
            
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

            {/* AI Suggestion Card */}
            <div className="bg-[#E7E0C4]/40 rounded-xl p-5 border border-[#E7E0C4]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#407F3E]" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI đề xuất điểm</h4>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#407F3E] leading-none">--</span>
                  <span className="text-sm font-bold text-slate-500">/ 10</span>
                </div>
                <button className="text-xs font-bold text-[#407F3E] hover:underline cursor-pointer">
                  (Tính năng thử nghiệm)
                </button>
              </div>
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
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
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

// Missing icon component definition for the new UI
const Edit3Icon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
  </svg>
);
