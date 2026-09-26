import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, ChevronRight, Lock,
  ArrowLeft, Search, ZoomIn, ZoomOut, AlertTriangle, Send, Maximize2, Minimize2
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function NopBaiThuHoach_SV() {
  const [student, setStudent] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isTextMaximized, setIsTextMaximized] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const [isAlertExpanded, setIsAlertExpanded] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [rightFontSize, setRightFontSize] = useState(14);
  const rightScrollRef = useRef(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const container = document.getElementById('split-pane-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const newWidth = (offsetX / rect.width) * 100;
        if (newWidth > 20 && newWidth < 80) {
          setLeftWidth(newWidth);
        }
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging]);


  const showPopup = (message, type = 'error') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: 'success' }), 3500);
  };


  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchTrips(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchTrips = async (svId) => {
    try {
      const res = await sinhVienApi.getRegisteredTrips(svId);
      const validTrips = (res.data || []).filter(t => t.trang_thai === 'HopLe' || t.trang_thai === 'DaThamGia' || t.trang_thai === 'HoanThanh');
      setTrips(validTrips.map(trip => {
        let status = 'Chưa nộp';
        if (trip.baiThuHoach) status = 'Đã nộp';
        
        let hanNopStr = 'Chưa xác định';
        if (trip.chuyenThamQuan?.ngay_tham_quan) {
          const dateObj = new Date(trip.chuyenThamQuan.ngay_tham_quan);
          dateObj.setDate(dateObj.getDate() + 7);
          hanNopStr = dateObj.toLocaleDateString('vi-VN');
        }

        return {
          id: trip.id,
          nhaMay: trip.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chưa xác định',
          ngayThamQuan: trip.chuyenThamQuan?.ngay_tham_quan ? new Date(trip.chuyenThamQuan.ngay_tham_quan).toLocaleDateString('vi-VN') : '--',
          loaiChuyen: trip.chuyenThamQuan?.loai_chuyen || 'khoa',
          hinhThuc: trip.chuyenThamQuan?.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp',
          trangThai: status,
          hanNop: hanNopStr,
          baiThuHoach: trip.baiThuHoach
        };
      }));
    } catch (err) {
      console.error(err);
    }
  };
  
  // Logic for the final committee selection card
  const completedTrips = trips.filter(t => t.trangThai === 'Đã nộp');
  const hasEnoughTrips = completedTrips.length >= 3; 

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đã nộp':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20"><CheckCircle2 className="w-3.5 h-3.5" />{status}</span>;
      case 'Chưa nộp':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20"><AlertCircle className="w-3.5 h-3.5" />{status}</span>;
      case 'Trễ hạn - trừ điểm':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20"><AlertCircle className="w-3.5 h-3.5" />{status}</span>;
      default:
        return null;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const res = await sinhVienApi.uploadReport(file);
      const url = res.data.url;
      setUploadedFile({
        name: res.data.fileName || res.data.originalName || file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        text: res.data.extractedText || "Không thể trích xuất văn bản từ tệp PDF này. Vui lòng đảm bảo file PDF không bị khóa.",
        url: url
      });
    } catch (err) {
      console.error(err);
      showPopup('Lỗi tải tệp lên. Xin thử lại.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    try {
      await sinhVienApi.submitReport({
        registrationId: selectedTrip.id,
        fileBaoCaoUrl: uploadedFile.url || uploadedFile.name,
        fileXacNhanUrl: null,
      });
      showPopup("Nộp bài thành công!", "success");
      setUploadedFile(null);
      setSelectedTrip(null);
      if (student) fetchTrips(student.id);
    } catch (err) {
      console.error(err);
      showPopup(err.response?.data?.message || "Có lỗi xảy ra khi nộp bài", "error");
    }
  };

  // ---------------------------------------------------------
  // VIEW 1: LIST OF TRIPS
  // ---------------------------------------------------------
  const renderListView = () => (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Nộp bài thu hoạch</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Gửi báo cáo cá nhân và xác nhận số chuyến để bảo vệ hội đồng.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List of trips */}
        <div className="lg:col-span-2 space-y-5">
          {trips.length === 0 ? (
             <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-2xl border border-[#E7E0C4]">
               Chưa có chuyến kiến tập nào hợp lệ.
             </div>
          ) : (
            trips.map(trip => {
              const isTuDo = trip.loaiChuyen === 'tu_do';
              
              return (
                <div key={trip.id} className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm overflow-hidden flex flex-col transition-all hover:border-[#407F3E]/50 group">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-slate-800 truncate mb-1 group-hover:text-[#407F3E] transition-colors">{trip.nhaMay}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                        <span>Ngày đi: <strong>{trip.ngayThamQuan}</strong></span>
                        <span>Hạn nộp: <strong>{trip.hanNop}</strong></span>
                        <span className="inline-block px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider">{trip.hinhThuc}</span>
                        {isTuDo && (
                          <span className="inline-block px-1.5 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] uppercase tracking-wider font-bold">Chuyến tự do</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      {getStatusBadge(trip.trangThai)}
                      {trip.trangThai !== 'Đã nộp' ? (
                        <button 
                          onClick={() => {
                            setSelectedTrip(trip);
                            setUploadedFile(null);
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 shadow-sm transition-colors cursor-pointer"
                        >
                          Nộp bài <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedTrip(trip);
                            if (trip.baiThuHoach) {
                              setUploadedFile({
                                name: trip.baiThuHoach.file_bao_cao_url || 'BaoCao_ThuHoach.pdf',
                                size: 'Đã nộp',
                                text: trip.baiThuHoach.noi_dung_trich_xuat || 'Đây là nội dung bài làm đã nộp (đã được lưu trên hệ thống).'
                              });
                            }
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Xem lại <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Committee Selection Card */}
        <div className="lg:col-span-1">
          <div className="bg-[#407F3E] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 flex-1">
              <h2 className="text-lg font-black uppercase tracking-wider mb-2">Đăng ký Hội đồng</h2>
              
              <div className="mb-6 pb-6 border-b border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/80">Số chuyến đã hoàn thành:</span>
                  <span className="text-2xl font-black">{completedTrips.length} / 3</span>
                </div>
                
                <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-[#DBD468] h-2.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((completedTrips.length / 3) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {!hasEnoughTrips ? (
                <div className="bg-black/20 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <Lock className="w-8 h-8 text-white/50" />
                  <p className="text-sm font-bold">Chưa đủ điều kiện</p>
                  <p className="text-xs text-white/70">Bạn cần hoàn thành báo cáo cho ít nhất 3 chuyến kiến tập để mở khóa chức năng này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-white/90">Bạn đã đủ điều kiện để bảo vệ. Vui lòng chọn hội đồng phù hợp với lịch trình của bạn.</p>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider">Chọn đợt bảo vệ</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl text-sm font-bold appearance-none cursor-pointer border-none focus:ring-4 focus:ring-[#DBD468]/50 outline-none">
                        <option>Đợt 1 (15/10/2026 - Phòng B.301)</option>
                        <option>Đợt 2 (20/10/2026 - Phòng C.105)</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasEnoughTrips && (
              <button 
                onClick={() => alert('Chức năng đăng ký hội đồng đang được cập nhật (UI mới)')}
                className="w-full mt-6 py-3.5 bg-[#DBD468] hover:bg-[#c9c256] text-slate-900 rounded-xl font-black text-sm uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                Đăng ký Hội đồng ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // VIEW 2: SPLIT-PANE UPLOAD & COMPARISON VIEW
  // ---------------------------------------------------------
  const renderSubmissionView = () => (
    <div className="flex flex-col h-[calc(100vh-64px)] animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Breadcrumb Bar */}
      <div className="h-10 bg-white border-b border-[#E7E0C4] flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedTrip(null); setUploadedFile(null); setIsConfirmed(false); }} 
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-[#407F3E] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              Nộp báo cáo <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> <span className="text-[#407F3E] text-sm">{selectedTrip.nhaMay}</span>
            </h2>
          </div>
        </div>
        <div>
          {!uploadedFile ? (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Hạn nộp: {selectedTrip.hanNop}
            </span>
          ) : selectedTrip.trangThai === 'Đã nộp' ? (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Bài nộp đã được ghi nhận
            </span>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!isConfirmed}
              className={`px-3 py-1 rounded-md font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 ${isConfirmed ? 'bg-[#407F3E] hover:bg-[#407F3E]/90 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              <Send className="w-3.5 h-3.5" /> Xác nhận & Nộp bài
            </button>
          )}
        </div>
      </div>

      {/* Global Warning Banner */}
      {uploadedFile && (
        <div className="bg-[#DBD468]/10 border-b border-[#DBD468]/30 shrink-0">
          <div 
            className="px-6 py-2 flex items-center justify-between cursor-pointer hover:bg-[#DBD468]/20 transition-colors"
            onClick={() => setIsAlertExpanded(!isAlertExpanded)}
          >
            <div className="flex items-center gap-2 text-[#8b8433]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Văn bản được AI trích xuất tự động — vui lòng đối chiếu với bản gốc trước khi nộp
              </span>
            </div>
            <ChevronRight className={`w-4 h-4 text-[#8b8433] transition-transform ${isAlertExpanded ? 'rotate-90' : ''}`} />
          </div>
          {isAlertExpanded && (
            <div className="px-6 pb-3 pt-1 text-xs font-medium text-slate-700 leading-snug">
              Hệ thống AI đã cố gắng đọc chữ từ file PDF của bạn. Hãy kiểm tra các vùng được <span className="bg-yellow-200 px-1 rounded">tô vàng</span> (độ tin cậy thấp). Nếu nội dung bị trống hoặc sai lệch quá nhiều (do file scan quá mờ hoặc chữ viết tay khó đọc), AI sẽ không thể hỗ trợ giảng viên chấm điểm chính xác.
            </div>
          )}
        </div>
      )}

      {/* Split Pane Content */}
      <div id="split-pane-container" className="flex-1 flex overflow-hidden bg-slate-100 relative flex-col md:flex-row">
        
        {/* Left Side: PDF Viewer / Uploader */}
        <div 
          className="border-[#E7E0C4] flex flex-col relative overflow-hidden bg-white md:border-r"
          style={{ width: isTextMaximized ? '0%' : (uploadedFile ? `${leftWidth}%` : '100%') }}
        >
          {!uploadedFile ? (
            // Upload State
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#E7E0C4]/20">
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 w-full max-w-lg text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <UploadCloud className="w-10 h-10 text-[#407F3E]" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Tải lên File PDF</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 max-w-xs leading-relaxed">
                  Kéo thả file báo cáo thu hoạch của bạn vào đây, hoặc nhấn nút bên dưới để chọn file (Tối đa 15MB).
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-8 py-3.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Đang tải lên...' : 'Chọn file từ máy tính'}
                </button>
              </div>
            </div>
          ) : (
            // PDF Preview State
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 flex w-full h-full bg-[#E7E0C4]/20">
                {uploadedFile.url ? (
                  <iframe 
                    src={uploadedFile.url} 
                    className={`w-full h-full border-0 ${isDragging ? 'pointer-events-none' : ''}`} 
                    title="PDF Preview" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    Không thể hiển thị bản xem trước
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resizer */}
        {uploadedFile && !isTextMaximized && (
          <div 
            className="hidden md:flex w-2 bg-slate-100 hover:bg-[#407F3E]/20 cursor-col-resize items-center justify-center shrink-0 z-10 border-r border-[#E7E0C4] transition-colors"
            onMouseDown={() => setIsDragging(true)}
          >
            <div className="h-8 w-1 bg-slate-300 rounded-full"></div>
          </div>
        )}

        {/* Right Side: Text Verification */}
        {uploadedFile && (
          <div 
            className="bg-white flex flex-col h-full overflow-hidden"
            style={{ width: isTextMaximized ? '100%' : `${100 - leftWidth}%` }}
          >
            {/* AI Text Header */}
            <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
              <span className="text-xs font-bold text-[#8b8433] uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Văn bản AI trích xuất
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-0.5">
                  <Search className="w-3 h-3 text-slate-400 mr-1" />
                  <input type="text" placeholder="Tìm từ khóa..." className="text-xs focus:outline-none w-20" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </div>
                <div className="flex items-center gap-1 border border-slate-200 rounded bg-white">
                  <button onClick={() => setRightFontSize(Math.max(10, rightFontSize - 2))} className="p-1 hover:bg-slate-100"><ZoomOut className="w-3 h-3" /></button>
                  <span className="text-[10px] w-6 text-center">{rightFontSize}</span>
                  <button onClick={() => setRightFontSize(Math.min(24, rightFontSize + 2))} className="p-1 hover:bg-slate-100"><ZoomIn className="w-3 h-3" /></button>
                </div>
                <button 
                  onClick={() => setIsTextMaximized(!isTextMaximized)}
                  className="p-1 text-slate-500 hover:text-[#407F3E] rounded transition-colors border border-slate-200 bg-white"
                  title={isTextMaximized ? "Thu nhỏ" : "Phóng to"}
                >
                  {isTextMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* AI Text Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50 relative" ref={rightScrollRef}>
              
              {!uploadedFile.text || uploadedFile.text.includes("Không thể trích xuất") ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-[#E68A8C]" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Không thể trích xuất văn bản</h4>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">File PDF có thể là dạng ảnh scan quá mờ, chữ viết tay khó đọc, hoặc bị khóa bảo mật không cho phép copy nội dung.</p>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-[#E68A8C] text-[#E68A8C] rounded-lg font-bold text-sm hover:bg-red-50 transition-colors">
                    Thử trích xuất lại
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden mb-6">
                  <div className="bg-slate-100 text-slate-400 text-[10px] uppercase font-bold px-4 py-1.5 border-b border-slate-200 flex justify-between">
                    <span>Trang 1</span>
                  </div>
                  <div 
                    className="p-6 whitespace-pre-wrap leading-relaxed text-slate-800 font-serif focus:outline-none focus:bg-slate-50 transition-colors"
                    style={{ fontSize: `${rightFontSize}px` }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setUploadedFile({...uploadedFile, text: e.target.innerText})}
                  >
                    {/* Mock Highlight logic: random highlight for demonstration */}
                    {uploadedFile.text.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {i % 45 === 0 && i > 0 ? <span className="bg-yellow-200 px-0.5 rounded cursor-help" title="Độ tin cậy thấp - Cần kiểm tra lại">{word}</span> : word}{' '}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
              
            </div>

            {/* Checkbox Footer */}
            <div className="h-16 border-t border-slate-200 bg-white flex items-center px-6 shrink-0 justify-between mt-auto">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isConfirmed ? 'bg-[#407F3E] border-[#407F3E]' : 'border-slate-300 bg-white group-hover:border-[#407F3E]'}`}>
                  {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={isConfirmed} 
                  onChange={(e) => setIsConfirmed(e.target.checked)} 
                />
                <span className="text-sm font-bold text-slate-700 select-none group-hover:text-[#407F3E] transition-colors">
                  Tôi đã đối chiếu văn bản trích xuất với file gốc và xác nhận nội dung chính xác
                </span>
              </label>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
  return (
    <div className={selectedTrip ? '' : 'bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300'}>
      {/* Custom Popup Toast */}
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 pointer-events-none">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-auto" onClick={() => setPopup({ ...popup, show: false })}></div>
          <div className={`relative z-10 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto ${popup.type === 'error' ? 'bg-[#E68A8C] text-white' : 'bg-[#407F3E] text-white'}`}>
            <span className="font-bold text-sm">{popup.message}</span>
            <button onClick={() => setPopup({ ...popup, show: false })} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {selectedTrip ? renderSubmissionView() : renderListView()}
    </div>
  );
}
