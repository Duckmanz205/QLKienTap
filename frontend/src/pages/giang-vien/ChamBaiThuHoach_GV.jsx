import React, { useState } from 'react';
import { 
  ArrowLeft, FileText, CheckCircle2, Save, Search, ChevronRight,
  ZoomIn, ZoomOut, Download, Sparkles, MessageSquareWarning
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChamBaiThuHoach_GV() {
  const navigate = useNavigate();
  
  // State to manage whether we are viewing the list of reports or grading a specific one
  const [selectedReport, setSelectedReport] = useState(null);

  // Mock Student Data
  const student = {
    id: 101,
    mssv: '2022220001',
    name: 'Nguyễn Văn An',
    lop: '12DHTH01',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=f1f5f9&color=475569'
  };

  const [reports, setReports] = useState([
    {
      id: 1,
      nhaMay: 'Nhà máy Yakult HCM',
      ngayNop: '10/09/2026',
      fileName: 'BaoCao_Yakult_NguyenVanAn.pdf',
      fileSize: '2.4 MB',
      isGraded: true,
      score: '8.5',
      comment: 'Bài làm tốt, cấu trúc rõ ràng.'
    },
    {
      id: 2,
      nhaMay: 'Acecook Việt Nam',
      ngayNop: '12/09/2026',
      fileName: 'BaoCao_Acecook_NguyenVanAn.pdf',
      fileSize: '1.8 MB',
      isGraded: false,
      score: '',
      comment: ''
    }
  ]);

  const handleScoreChange = (newScore) => {
    setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, score: newScore } : r));
    setSelectedReport(prev => ({...prev, score: newScore}));
  };

  const handleCommentChange = (newComment) => {
    setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, comment: newComment } : r));
    setSelectedReport(prev => ({...prev, comment: newComment}));
  };

  const handleSaveGrade = () => {
    // In real app, make API call here
    setSelectedReport(null); // Go back to list
  };

  // ---------------------------------------------------------
  // VIEW 1: LIST OF REPORTS FOR THIS STUDENT
  // ---------------------------------------------------------
  const renderReportList = () => (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={() => navigate('/giang-vien/guided-students')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-[#407F3E] font-bold text-sm mb-2 transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sinh viên
          </button>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Bài thu hoạch của <span className="text-[#407F3E]">{student.name}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[#E7E0C4] shadow-sm w-fit">
          <img src={student.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200" />
          <div>
            <p className="text-sm font-bold text-slate-800">{student.name}</p>
            <p className="text-[11px] font-medium text-slate-500">MSSV: {student.mssv} • Lớp: {student.lop}</p>
          </div>
        </div>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div 
            key={report.id} 
            onClick={() => setSelectedReport(report)}
            className="bg-white border border-[#E7E0C4] rounded-2xl overflow-hidden shadow-sm hover:border-[#407F3E] hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
          >
            {/* Card Header */}
            <div className={`px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between ${report.isGraded ? 'bg-slate-50/50' : 'bg-[#DBD468]/10'}`}>
              <div className="flex items-center gap-3">
                <h2 className="font-black text-slate-800 text-lg group-hover:text-[#407F3E] transition-colors">{report.nhaMay}</h2>
              </div>
            </div>
            
            {/* Card Body */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái:</span>
                  {report.isGraded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#89B449]/10 text-[#407F3E]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã chấm ({report.score}/10)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#DBD468] text-slate-800 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></div> Vừa nộp
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                  <FileText className="w-8 h-8 text-[#407F3E]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{report.fileName}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">{report.ngayNop} • {report.fileSize}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end text-[#407F3E] font-bold text-sm mt-4">
                {report.isGraded ? 'Xem lại bài làm' : 'Bắt đầu chấm bài'} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // VIEW 2: GRADING A SINGLE REPORT (PDF + Sidebar)
  // ---------------------------------------------------------
  const renderGradingView = () => (
    <div className="h-[calc(100vh-80px)] flex flex-col animate-in fade-in zoom-in-95 duration-300 -m-6">
      
      {/* Top Breadcrumb Bar */}
      <div className="h-14 bg-white border-b border-[#E7E0C4] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
          <button onClick={() => setSelectedReport(null)} className="hover:text-[#407F3E] transition-colors">
            Bài thu hoạch
          </button>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-[#407F3E]">{selectedReport.nhaMay}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-[#E7E0C4]/20">
        
        {/* Left Side: Document Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* PDF Toolbar */}
          <div className="h-12 bg-white/80 backdrop-blur-sm border-b border-[#E7E0C4] flex items-center justify-between px-4 shrink-0 absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center gap-3 text-slate-600">
              <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-xs font-bold">100%</span>
              <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ZoomIn className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <span>Trang 1 / 12</span>
              <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
            </div>
          </div>

          {/* PDF Canvas (Simulated) */}
          <div className="flex-1 overflow-y-auto p-8 pt-20 flex justify-center custom-scrollbar">
            <div className="bg-white w-full max-w-[700px] h-fit min-h-[900px] shadow-lg text-slate-800 p-12 lg:p-16 relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#E7E0C4]/50 rounded-bl-3xl"></div>
              
              <div className="text-center mb-12">
                <h3 className="font-bold text-sm uppercase tracking-widest mb-1">TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP.HCM</h3>
                <p className="font-bold text-sm uppercase tracking-widest">KHOA CÔNG NGHỆ THỰC PHẨM</p>
                <div className="w-20 h-[1px] bg-slate-300 mx-auto my-6"></div>
                <h1 className="text-xl font-black uppercase tracking-wider mb-2">BÁO CÁO THU HOẠCH KIẾN TẬP</h1>
                <h2 className="text-lg font-bold uppercase tracking-wider">TẠI {selectedReport.nhaMay.toUpperCase()}</h2>
              </div>

              <div className="space-y-4 max-w-sm mx-auto mb-16 font-medium text-sm">
                <div className="flex">
                  <span className="w-40 font-bold">Sinh viên thực hiện:</span>
                  <span>{student.name}</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-bold">MSSV:</span>
                  <span>{student.mssv}</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-bold">Giảng viên hướng dẫn:</span>
                  <span>TS. Nguyễn Văn A</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-bold">Thời gian:</span>
                  <span>{selectedReport.ngayNop}</span>
                </div>
              </div>

              <div className="space-y-6 text-justify text-sm leading-relaxed">
                <p>
                  <strong>1.</strong> Mở đầu, em xin chân thành cảm ơn nhà trường và công ty {selectedReport.nhaMay} đã tạo điều kiện cho chúng em được tham quan và tìm hiểu quy trình sản xuất...
                </p>
                <h4 className="font-bold uppercase border-b border-slate-200 pb-2 mt-8">I. Giới thiệu về {selectedReport.nhaMay}</h4>
                <p>
                  Nhà máy tọa lạc tại KCN Tân Bình, với diện tích lớn. Là một trong những nhà máy sản xuất tự động lớn nhất khu vực...
                </p>
                <p>
                  Trong buổi kiến tập, đoàn được dẫn đi tham quan các khu vực: Khu xử lý nguyên liệu, khu vực chiên, đóng gói và kho thành phẩm. Quy trình diễn ra hoàn toàn tự động khép kín, đảm bảo vệ sinh an toàn thực phẩm.
                </p>
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
            <img src={student.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-slate-200" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{student.name}</h3>
              <p className="text-[11px] font-medium text-slate-500 mb-1">MSSV: {student.mssv}</p>
              <p className="text-[11px] font-medium text-[#407F3E] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {selectedReport.nhaMay}
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
                <span className="text-4xl font-black text-[#407F3E] leading-none">8.0</span>
                <span className="text-sm font-bold text-slate-500">/ 10</span>
              </div>
              <button className="text-xs font-bold text-[#407F3E] hover:underline cursor-pointer">
                Xem giải thích →
              </button>
            </div>
          </div>

          {/* Grading Form */}
          <div className="bg-white rounded-xl p-5 border border-[#E7E0C4] shadow-sm flex-1">
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
                    value={selectedReport.score}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    placeholder="--"
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
                  <button className="text-[10px] font-bold text-[#407F3E] bg-[#89B449]/10 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer">
                    <Sparkles className="w-3 h-3" /> Chèn mẫu
                  </button>
                </div>
                <textarea 
                  rows={6}
                  value={selectedReport.comment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  placeholder="Nhận xét về nội dung, hình thức và tính thực tiễn của bài thu hoạch..."
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-700 shadow-sm resize-none custom-scrollbar"
                />
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button 
                onClick={handleSaveGrade}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" /> Lưu điểm
              </button>
              
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/5 rounded-lg text-sm font-bold transition-all cursor-pointer">
                <MessageSquareWarning className="w-4 h-4" /> Yêu cầu bổ sung
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );

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
