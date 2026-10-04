import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, ChevronRight, Lock,
  ArrowLeft, Search, ZoomIn, ZoomOut, AlertTriangle, Send, Maximize2, Minimize2
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';
import Toast from '../../components/Toast';

export default function NopBaiThuHoach_SV() {
  const [student, setStudent] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, tripId: null });

  const showPopup = (message, type = 'error') => {
    setPopup({ show: true, message, type });
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
        const baiThuHoach = trip.phieuThamQuan?.baiThuHoach;
        if (baiThuHoach) status = 'Đã nộp';
        
        let hanNopStr = 'Chưa xác định';
        if (trip.chuyenThamQuan?.ngay_tham_quan) {
          const dateObj = new Date(trip.chuyenThamQuan.ngay_tham_quan);
          dateObj.setDate(dateObj.getDate() + 10);
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
          baiThuHoach: baiThuHoach,
          cachToChuc: trip.chuyenThamQuan?.cach_to_chuc,
          hoaDonStatus: trip.hoaDon?.trang_thai,
          hasPhieuThamQuan: !!trip.phieuThamQuan,
          diemDanhStatus: trip.phieuThamQuan?.diemDanh?.trang_thai
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
      const previewUrl = URL.createObjectURL(file);
      
      setUploadedFile({
        name: res.data.fileName || res.data.originalName || file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        text: res.data.extractedText || "",
        url: url,
        previewUrl: previewUrl,
        rawFile: file
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
        extractedText: uploadedFile.text,
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
              const isDoKhoa = trip.cachToChuc === 'DoKhoaToChuc';
              let canSubmit = true;
              let disabledReason = '';
              
              if (isDoKhoa) {
                if (!trip.hasPhieuThamQuan) {
                  canSubmit = false;
                  disabledReason = trip.hoaDonStatus === 'ChuaDong' ? 'Chưa đóng lệ phí' : 'Chưa có PTQ';
                } else if (trip.diemDanhStatus !== 'CoMat') {
                  canSubmit = false;
                  disabledReason = 'Chưa điểm danh';
                }
              } else {
                if (!trip.hasPhieuThamQuan) {
                  canSubmit = false;
                  disabledReason = 'Chưa cấp PTQ';
                }
              }
              
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
                        canSubmit ? (
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
                          <div className="flex flex-col items-end">
                            <button disabled className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 bg-slate-200 text-slate-400 cursor-not-allowed">
                              Nộp bài <ChevronRight className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wide">{disabledReason}</span>
                          </div>
                        )
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setConfirmDelete({ show: true, tripId: trip.id })}
                            className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer shadow-sm border border-red-100"
                          >
                            Nộp lại <UploadCloud className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={async () => {
                              setSelectedTrip(trip);
                            if (trip.baiThuHoach) {
                              const dbPath = trip.baiThuHoach.file_bao_cao;
                              let apiPath = '';
                              if (dbPath) {
                                if (dbPath.startsWith('reports/')) {
                                  apiPath = `/upload/file/${dbPath}`;
                                } else {
                                  apiPath = `/upload/file/reports/${dbPath}`;
                                }
                              }

                              // Fetch PDF and TXT via axiosClient (auto-attaches JWT)
                              let blobUrl = '';
                              let extractedText = 'Đây là nội dung bài làm đã nộp (đã được lưu trên hệ thống).';

                              if (apiPath) {
                                try {
                                  const { default: api } = await import('../../services/axiosClient');
                                  
                                  // 1. Fetch PDF
                                  const respPdf = await api.get(apiPath, { responseType: 'blob' });
                                  if (respPdf.data) {
                                    blobUrl = URL.createObjectURL(respPdf.data);
                                  }

                                  // 2. Fetch Text File (.txt)
                                  const txtApiPath = apiPath.replace(/\.\w+$/, '.txt');
                                  try {
                                    const respTxt = await api.get(txtApiPath, { responseType: 'text' });
                                    if (respTxt.data) {
                                      extractedText = respTxt.data;
                                    }
                                  } catch (txtErr) {
                                    console.warn('Không tìm thấy file text trích xuất:', txtErr);
                                    // Fallback if older report has it in DB
                                    if (trip.baiThuHoach.noi_dung_trich_xuat) {
                                      extractedText = trip.baiThuHoach.noi_dung_trich_xuat;
                                    }
                                  }
                                } catch (err) {
                                  console.error('Lỗi tải file preview:', err);
                                }
                              }
                              
                              setUploadedFile({
                                name: trip.baiThuHoach.file_bao_cao_url || 'BaoCao_ThuHoach.pdf',
                                size: 'Đã nộp',
                                text: extractedText,
                                previewUrl: blobUrl,
                                url: apiPath
                              });
                            }
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Xem lại <FileText className="w-4 h-4" />
                        </button>
                        </div>
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
                onClick={() => toast.error('Chức năng đăng ký hội đồng đang được cập nhật (UI mới)')}
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
            onClick={() => { setSelectedTrip(null); setUploadedFile(null); }} 
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
            <div className="flex gap-2">
              <button 
                onClick={() => setUploadedFile(null)}
                className="px-3 py-1 rounded-md font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Chọn file khác
              </button>
              <button 
                onClick={handleSubmit}
                className="px-3 py-1 rounded-md font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Xác nhận & Nộp bài
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-slate-100 relative">
        <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
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
            <div className="flex-1 flex flex-col h-full w-full bg-[#E7E0C4]/20">
              {uploadedFile.previewUrl ? (
                <iframe 
                  src={uploadedFile.previewUrl} 
                  className="w-full h-full border-0" 
                  title="PDF Preview" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  Không thể hiển thị bản xem trước
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  return (
    <div className={selectedTrip ? '' : 'bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300'}>
      {/* Custom Popup Toast */}
      <Toast 
        message={popup.show ? popup.message : ''}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
      />

      {/* Confirm Delete Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Xác nhận nộp lại</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Bạn có chắc chắn muốn xóa bài thu hoạch này để nộp lại không? Dữ liệu và file báo cáo cũ sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setConfirmDelete({ show: false, tripId: null })}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={async () => {
                  try {
                    await sinhVienApi.deleteReport(confirmDelete.tripId);
                    showPopup('Đã xóa bài thu hoạch thành công', 'success');
                    setConfirmDelete({ show: false, tripId: null });
                    if (student) fetchTrips(student.id);
                  } catch (err) {
                    console.error(err);
                    showPopup(err.response?.data?.message || 'Có lỗi xảy ra khi xóa bài thu hoạch', 'error');
                    setConfirmDelete({ show: false, tripId: null });
                  }
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTrip ? renderSubmissionView() : renderListView()}
    </div>
  );
}
