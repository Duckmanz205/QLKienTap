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
  const [isTextMaximized, setIsTextMaximized] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const [isAlertExpanded, setIsAlertExpanded] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, tripId: null });
  const [rightFontSize, setRightFontSize] = useState(14);
  const rightScrollRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(1);
  const [matchCount, setMatchCount] = useState(0);
  const [indexInput, setIndexInput] = useState("1");
  const contentEditableRef = useRef(null);
  const lastCaretOffset = useRef(0);

  const getCaretCharacterOffsetWithin = (element) => {
    let caretOffset = 0;
    const doc = element.ownerDocument || element.document;
    const win = doc.defaultView || doc.parentWindow;
    let sel;
    if (typeof win.getSelection !== "undefined") {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
        const range = win.getSelection().getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    }
    return caretOffset;
  };

  useEffect(() => {
    if (!searchText.trim() || !uploadedFile?.text) {
      setMatchCount(0);
      setCurrentMatchIndex(1);
      setIndexInput("1");
      return;
    }
    
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegExp(searchText), 'gi');
    let matches = [];
    let match;
    while ((match = regex.exec(uploadedFile.text)) !== null) {
      matches.push(match.index);
    }
    
    const count = matches.length;
    setMatchCount(count);
    
    if (count > 0) {
      let closestIdx = 1;
      let minDiff = Infinity;
      matches.forEach((pos, idx) => {
        const diff = Math.abs(pos - lastCaretOffset.current);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx + 1;
        }
      });
      // Only set closest index if we are just starting a search
      // To avoid resetting it while navigating, we can check if matchCount changed from 0 or just let it reset on search change
      setCurrentMatchIndex(closestIdx);
      setIndexInput(closestIdx.toString());
    } else {
      setCurrentMatchIndex(1);
      setIndexInput("1");
    }
  }, [searchText, uploadedFile?.text]);

  useEffect(() => {
    if (matchCount > 0) {
      const el = document.getElementById('current-search-match');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatchIndex, matchCount]);


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

  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractText = async () => {
    if (!uploadedFile || !uploadedFile.rawFile) {
        showPopup('Vui lòng chọn file trước khi trích xuất', 'error');
        return;
    }
    setIsExtracting(true);
    try {
        const formData = new FormData();
        formData.append('file', uploadedFile.rawFile);
        
        const response = await fetch('http://localhost:8000/process-pdf', {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`API lỗi: ${response.status}`);
        }
        
        const data = await response.json();
        setUploadedFile(prev => ({
            ...prev,
            text: data.extracted_text || "Không tìm thấy nội dung."
        }));
        showPopup('Trích xuất thành công!', 'success');
    } catch (err) {
        console.error("Lỗi OCR:", err);
        showPopup('Lỗi trích xuất văn bản AI', 'error');
    } finally {
        setIsExtracting(false);
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

  const getHighlightedHtml = () => {
    if (!uploadedFile?.text) return { __html: '' };
    const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    if (!searchText.trim()) {
      return { __html: escapeHtml(uploadedFile.text) };
    }

    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapeRegExp(searchText)})`, 'gi');
    const parts = uploadedFile.text.split(regex);
    let matchIdx = 0;

    const htmlParts = parts.map((part) => {
      if (part.toLowerCase() === searchText.toLowerCase()) {
        matchIdx++;
        const isCurrent = matchIdx === currentMatchIndex;
        if (isCurrent) {
          return `<span id="current-search-match" class="bg-green-400 text-white font-bold shadow-sm rounded px-0.5">${escapeHtml(part)}</span>`;
        } else {
          return `<span class="bg-green-200 text-slate-800 rounded px-0.5">${escapeHtml(part)}</span>`;
        }
      }
      return escapeHtml(part);
    });

    return { __html: htmlParts.join('') };
  };

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
            <div className="flex gap-2">
              <button 
                onClick={() => {
                   setUploadedFile(null);
                   setIsConfirmed(false);
                }}
                className="px-3 py-1 rounded-md font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Chọn file khác
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!isConfirmed}
                className={`px-3 py-1 rounded-md font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 ${isConfirmed ? 'bg-[#407F3E] hover:bg-[#407F3E]/90 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                <Send className="w-3.5 h-3.5" /> Xác nhận & Nộp bài
              </button>
            </div>
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
                {uploadedFile.previewUrl ? (
                  <iframe 
                    src={uploadedFile.previewUrl} 
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
                  <input 
                    type="text" 
                    placeholder="Tìm từ khóa..." 
                    className="text-xs focus:outline-none w-20" 
                    value={searchText} 
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const next = currentMatchIndex < matchCount ? currentMatchIndex + 1 : 1;
                            setCurrentMatchIndex(next);
                            setIndexInput(next.toString());
                        }
                    }}
                  />
                  {searchText && matchCount > 0 && (
                    <div className="flex items-center text-[10px] text-slate-500 border-l border-slate-200 pl-1 ml-1">
                        <input 
                            type="text" 
                            className="w-5 text-center focus:outline-none bg-transparent font-medium"
                            value={indexInput}
                            onChange={(e) => setIndexInput(e.target.value)}
                            onBlur={() => {
                                let val = parseInt(indexInput);
                                if (isNaN(val) || val < 1) val = 1;
                                if (val > matchCount) val = matchCount;
                                setCurrentMatchIndex(val);
                                setIndexInput(val.toString());
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.target.blur();
                                }
                            }}
                        />
                        <span>/ {matchCount}</span>
                    </div>
                  )}
                  {searchText && matchCount === 0 && (
                      <span className="text-[10px] text-red-400 border-l border-slate-200 pl-1 ml-1">0/0</span>
                  )}
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
              
              {!uploadedFile.text || uploadedFile.text.includes("Không tìm thấy nội dung") ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Trích xuất văn bản bằng AI</h4>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">Hệ thống AI sẽ quét và đọc nội dung từ file PDF (kể cả ảnh scan hoặc chữ viết tay) để đối chiếu.</p>
                  </div>
                  <button onClick={handleExtractText} disabled={isExtracting} className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {isExtracting ? 'Đang trích xuất...' : 'Trích xuất text'}
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden mb-6">
                  <div className="bg-slate-100 text-slate-400 text-[10px] uppercase font-bold px-4 py-1.5 border-b border-slate-200 flex justify-between">
                    <span>Trang 1</span>
                  </div>
                  <div 
                    ref={contentEditableRef}
                    className="p-6 whitespace-pre-wrap leading-loose text-slate-900 font-sans tracking-wide focus:outline-none focus:bg-slate-50 transition-colors"
                    style={{ fontSize: `${rightFontSize}px` }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (e.target.innerText !== uploadedFile.text) {
                          setUploadedFile({...uploadedFile, text: e.target.innerText});
                      }
                    }}
                    onKeyUp={() => {
                        if (contentEditableRef.current) lastCaretOffset.current = getCaretCharacterOffsetWithin(contentEditableRef.current);
                    }}
                    onClick={() => {
                        if (contentEditableRef.current) lastCaretOffset.current = getCaretCharacterOffsetWithin(contentEditableRef.current);
                    }}
                    dangerouslySetInnerHTML={getHighlightedHtml()}
                  />
                </div>
              )}
              
            </div>

            {/* Checkbox Footer */}
            {uploadedFile.text && !uploadedFile.text.includes("Không tìm thấy nội dung") && (
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
            )}
            
          </div>
        )}
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
