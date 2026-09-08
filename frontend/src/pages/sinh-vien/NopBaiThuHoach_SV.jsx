import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, ChevronRight, Lock,
  ArrowLeft, Search, ZoomIn, ZoomOut, AlertTriangle, Send, Maximize2, Minimize2,
  CheckCircle, Clock, Upload, ShieldCheck, Check, Building, Laptop, Calendar,
  Sparkles, Edit3, X, Loader2
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function NopBaiThuHoach_SV() {
  const [student, setStudent] = useState(null);
  
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isTextMaximized, setIsTextMaximized] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Upload Simulator & OCR States (AI)
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [pendingPdfFile, setPendingPdfFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeUploadId, setActiveUploadId] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
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
    const mockTrip = {
      id: 9999,
      nhaMay: '🏭 [MOCK DATA] Nhà máy Acecook (Test AI)',
      ngayThamQuan: new Date().toISOString(),
      loaiChuyen: 'khoa',
      hinhThuc: 'Trực tiếp',
      trangThai: 'Chưa nộp',
      hanNop: '1 tuần sau chuyến đi',
      baiThuHoach: null
    };

    try {
      const res = await sinhVienApi.getRegisteredTrips(svId);
      const validTrips = (res.data || []).filter(t => t.trang_thai === 'HopLe' || t.trang_thai === 'DaThamGia' || t.trang_thai === 'HoanThanh');
      
      const mapped = validTrips.map(trip => {
        let status = 'Chưa nộp';
        if (trip.baiThuHoach) status = 'Đã nộp';
        
        return {
          id: trip.id,
          nhaMay: trip.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chưa xác định',
          ngayThamQuan: trip.chuyenThamQuan?.ngay_tham_quan ? new Date(trip.chuyenThamQuan.ngay_tham_quan).toLocaleDateString('vi-VN') : '--',
          loaiChuyen: trip.chuyenThamQuan?.loai_chuyen || 'khoa',
          hinhThuc: trip.chuyenThamQuan?.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp',
          trangThai: status,
          hanNop: '1 tuần sau chuyến đi',
          baiThuHoach: trip.baiThuHoach,
          rawTrip: trip // Keep raw for AI submission logic
        };
      });
      setTrips([mockTrip, ...mapped]);
    } catch (err) {
      console.error("Backend báo lỗi, ÉP HIỆN MOCK DATA", err);
      setTrips([mockTrip]);
    }
  };

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

  // OCR TRIGGER
  const handleRealUpload = async (event, trip) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước tệp báo cáo vượt quá hạn mức 5MB.');
      return;
    }
    
    setIsOcrScanning(true);
    setActiveUploadId(trip.id);
    setMessage('');
    setError('');

    try {
      const ocrFormData = new FormData();
      ocrFormData.append('file', file);

      const ocrResponse = await axios.post('http://localhost:8000/process-pdf', ocrFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const extractedText = ocrResponse.data.extracted_text || '';

      setOcrText(extractedText);
      setPendingRegistration(trip);
      setPendingPdfFile(file);
      setShowOcrModal(true);
    } catch (err) {
      console.error('Lỗi kết nối AI OCR:', err);
      setError('Không thể trích xuất văn bản từ AI OCR. Vui lòng đảm bảo server AI (:8000) đang chạy.');
      
      // Fallback cho phép nộp mà không cần OCR
      setPendingRegistration(trip);
      setPendingPdfFile(file);
      setShowOcrModal(true);
    } finally {
      setIsOcrScanning(false);
      setActiveUploadId(null);
    }
  };

  const handleConfirmFinalSubmission = async () => {
    if (!pendingPdfFile || !pendingRegistration) return;

    const reg = pendingRegistration;
    const file = pendingPdfFile;

    setActiveUploadId(reg.id);
    setUploadProgress(10);
    setMessage('');
    setError('');

    try {
      // MOCK UPLOAD TO STORAGE
      const uploadRes = { data: { url: file.name } }; 
      const fileBaoCaoUrl = uploadRes.data.key || uploadRes.data.url;

      await sinhVienApi.submitReport({
        registrationId: reg.id,
        fileBaoCaoUrl,
        fileXacNhanUrl: null,
        noiDungText: ocrText
      });

      setMessage('Đã nộp bài thu hoạch và xác nhận nội dung OCR thành công!');
      setShowOcrModal(false);
      
      // Update local state to show PDF viewer
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        text: ocrText
      });
      
      fetchTrips(student.id);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Không thể tải tệp lên. Vui lòng kiểm tra lại định dạng tệp.');
    } finally {
      setActiveUploadId(null);
      setUploadProgress(0);
      setPendingPdfFile(null);
      setPendingRegistration(null);
    }
  };

  const renderListView = () => (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Nộp bài thu hoạch</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Gửi báo cáo cá nhân và xác nhận số chuyến để bảo vệ hội đồng.</p>
      </div>

      {message && (
        <div className="bg-[#e5ffdc] border border-green-200 text-[#476d01] px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 mb-6">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-750 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 mb-6">
          <AlertTriangle className="w-4 h-4 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                text: trip.baiThuHoach.noi_dung_trich_xuat || 'Đây là nội dung bài làm đã nộp.'
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
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubmissionView = () => (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="h-16 bg-white border-b border-[#E7E0C4] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setSelectedTrip(null); setUploadedFile(null); }} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-[#407F3E] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Nộp báo cáo <ChevronRight className="w-4 h-4 text-slate-400" /> <span className="text-[#407F3E] text-base">{selectedTrip.nhaMay}</span>
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
          ) : null}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-[#E7E0C4]/20 relative">
        <div className={`border-r border-[#E7E0C4] flex flex-col relative overflow-hidden bg-slate-100 transition-all duration-300 ${isTextMaximized ? 'w-0 opacity-0' : 'flex-1'}`}>
          {!uploadedFile ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 w-full max-w-lg text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  {isOcrScanning ? <Loader2 className="w-10 h-10 text-[#407F3E] animate-spin" /> : <UploadCloud className="w-10 h-10 text-[#407F3E]" />}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">
                  {isOcrScanning ? "Đang kết nối AI quét OCR..." : "Tải lên File PDF"}
                </h3>
                <p className="text-sm font-medium text-slate-500 mb-8 max-w-xs leading-relaxed">
                  Kéo thả file báo cáo thu hoạch của bạn vào đây, hoặc nhấn nút bên dưới để chọn file (Tối đa 15MB).
                </p>
                <label className="px-8 py-3.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer inline-block">
                  Chọn file từ máy tính
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleRealUpload(e, selectedTrip)} disabled={isOcrScanning} />
                </label>
              </div>
            </div>
          ) : (
            <>
              <div className="h-12 bg-white/90 backdrop-blur border-b border-[#E7E0C4] flex items-center justify-center gap-6 shrink-0 absolute top-0 left-0 right-0 z-10 shadow-sm">
                <button onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 cursor-pointer">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 w-10 text-center">{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 cursor-pointer">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 pt-16 flex justify-center custom-scrollbar">
                <div 
                  className="bg-white w-full max-w-[600px] min-h-[800px] shadow-xl border border-slate-200 p-10 relative"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
                >
                  <h1 className="text-lg font-black uppercase tracking-wider text-center mb-8 border-b-2 border-slate-900 pb-2 inline-block relative left-1/2 -translate-x-1/2">BÁO CÁO THU HOẠCH KIẾN TẬP</h1>
                  <div className="whitespace-pre-wrap text-sm text-slate-800 leading-loose text-justify font-serif">
                    {uploadedFile.text}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={`bg-white flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 transition-all duration-300 ${isTextMaximized ? 'w-full flex-1' : 'w-full md:w-[400px] lg:w-[450px]'}`}>
          <div className="px-4 py-3 border-b border-[#E7E0C4] bg-[#DBD468]/10 flex items-start gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#8b8433] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#8b8433] text-xs uppercase tracking-wider mb-0.5">Hệ thống AI hỗ trợ chấm điểm</h3>
              <p className="text-[10px] font-medium text-slate-700 leading-snug">
                Văn bản được trích xuất tự động từ file PDF. Vui lòng đối chiếu với bản gốc. Nếu văn bản trống hoặc lỗi, AI sẽ không thể phân tích để hỗ trợ giảng viên đánh giá bài làm.
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nội dung văn bản được trích xuất</label>
              {uploadedFile && (
                <button onClick={() => setIsTextMaximized(!isTextMaximized)} className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-[#407F3E] rounded-md transition-colors cursor-pointer" title={isTextMaximized ? "Thu nhỏ" : "Phóng to"}>
                  {isTextMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
            </div>
            <textarea 
              value={uploadedFile ? uploadedFile.text : ''}
              onChange={(e) => setUploadedFile({ ...uploadedFile, text: e.target.value })}
              placeholder={uploadedFile ? '' : 'Văn bản sẽ hiển thị ở đây sau khi bạn tải file PDF lên...'}
              className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed font-mono text-slate-700 focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] resize-none custom-scrollbar shadow-inner transition-colors"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={selectedTrip ? '' : 'bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300'}>
      {selectedTrip ? renderSubmissionView() : renderListView()}

      {/* OCR Editor Modal */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-6 bg-[#f8faf1] border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#89B449]/20 text-[#407F3E] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-800">Kiểm duyệt văn bản trích xuất OCR (AI)</h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Đoạn văn bản dưới đây sẽ được AI sử dụng để chấm điểm. Vui lòng chỉnh sửa các lỗi nếu có.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowOcrModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-3 bg-white">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5 text-[#407F3E]">
                  <Edit3 className="w-4 h-4" />
                  <span>Trình soạn thảo văn bản báo cáo</span>
                </span>
                <span>Tự động phát hiện bởi Qwen-VL-OCR</span>
              </div>
              <textarea
                rows={12}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Nội dung báo cáo quét được sẽ hiển thị ở đây..."
                className="w-full p-4 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#407F3E] text-slate-800 leading-relaxed resize-none shadow-inner"
              />
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setShowOcrModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors">
                Hủy bỏ
              </button>
              <button type="button" onClick={handleConfirmFinalSubmission} className="px-6 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Xác nhận & Nộp bài chính thức</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
