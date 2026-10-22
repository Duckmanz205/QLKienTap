import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, ChevronRight, Lock, Unlock,
  ArrowLeft, Search, ZoomIn, ZoomOut, AlertTriangle, Send, Maximize2, Minimize2,
  Star, Check, Building2, Monitor, RefreshCw, Calendar, MapPin, Users, Award, ShieldAlert,
  FileCheck, ExternalLink, Image as ImageIcon, RotateCcw, Layers
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';
import Toast from '../../components/Toast';

export default function NopBaiThuHoach_SV() {
  const [student, setStudent] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedConfirmationFile, setUploadedConfirmationFile] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('report'); // 'report' | 'confirmation'
  const [zoomLevel, setZoomLevel] = useState(100);
  const [uploading, setUploading] = useState(false);
  const [uploadingConfirmation, setUploadingConfirmation] = useState(false);
  const fileInputRef = useRef(null);
  const confirmationFileInputRef = useRef(null);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, tripId: null });

  // State quản lý Bộ 3 chuyến báo cáo & Hội đồng
  const [repStatus, setRepStatus] = useState(null);
  const [loadingRepStatus, setLoadingRepStatus] = useState(false);
  const [selectedTripsForReport, setSelectedTripsForReport] = useState([]);
  const [isEditingReportSelection, setIsEditingReportSelection] = useState(false);
  const [isSubmittingRepTrips, setIsSubmittingRepTrips] = useState(false);

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
        fetchRepStatus();
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchRepStatus = async () => {
    try {
      setLoadingRepStatus(true);
      const res = await sinhVienApi.getRepresentativeTripsStatus();
      const data = res.data;
      setRepStatus(data);
      if (data?.selectedRegistrationIds?.length === 3) {
        setSelectedTripsForReport(data.selectedRegistrationIds);
        setIsEditingReportSelection(false);
      } else {
        setIsEditingReportSelection(true);
      }
    } catch (err) {
      console.error('Lỗi lấy trạng thái bộ 3 chuyến:', err);
    } finally {
      setLoadingRepStatus(false);
    }
  };

  const fetchTrips = async (svId) => {
    try {
      const res = await sinhVienApi.getRegisteredTrips(svId);
      const validTrips = (res.data || []).filter(t => t.trang_thai === 'HopLe' || t.trang_thai === 'DaThamGia' || t.trang_thai === 'HoanThanh');
      setTrips(validTrips.map(trip => {
        let status = 'Chưa nộp';
        const baiThuHoach = trip.phieuThamQuan?.baiThuHoach;
        const isTuDo = trip.chuyenThamQuan?.cach_to_chuc === 'TuDo' || trip.chuyenThamQuan?.loai_chuyen === 'tu_do';
        const diemDanhStatus = trip.phieuThamQuan?.diemDanh?.trang_thai;

        if (baiThuHoach?.file_bao_cao) {
          if (isTuDo && diemDanhStatus !== 'CoMat') {
            status = 'Chờ duyệt điểm danh';
          } else {
            status = 'Đã nộp';
          }
        } else if (baiThuHoach?.file_xac_nhan_tham_quan) {
          status = 'Chờ duyệt điểm danh';
        }
        
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
          diemDanhStatus: diemDanhStatus
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
      case 'Chờ duyệt điểm danh':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-sm border border-indigo-500"><FileCheck className="w-3.5 h-3.5" />{status}</span>;
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


  const handleConfirmationFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isImage && !isPdf) {
      showPopup('Giấy xác nhận chỉ chấp nhận định dạng PDF hoặc hình ảnh (JPG, PNG).', 'error');
      if (confirmationFileInputRef.current) confirmationFileInputRef.current.value = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showPopup('Dung lượng giấy xác nhận tối đa là 5MB.', 'error');
      if (confirmationFileInputRef.current) confirmationFileInputRef.current.value = null;
      return;
    }

    setUploadingConfirmation(true);
    try {
      const res = await sinhVienApi.uploadAttachment(file);
      const previewUrl = URL.createObjectURL(file);
      setUploadedConfirmationFile({
        name: res.data.fileName || res.data.originalName || file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        url: res.data.url,
        key: res.data.key,
        previewUrl: previewUrl,
        isImage,
        isPdf,
        rawFile: file
      });
      showPopup('Đã tải lên giấy xác nhận tham quan!', 'success');
    } catch (err) {
      console.error(err);
      showPopup(err.response?.data?.message || 'Lỗi tải tệp giấy xác nhận lên. Xin thử lại.', 'error');
    } finally {
      setUploadingConfirmation(false);
      if (confirmationFileInputRef.current) confirmationFileInputRef.current.value = null;
    }
  };

  const handleSaveConfirmationOnly = async () => {
    if (!uploadedConfirmationFile) {
      showPopup('Vui lòng tải lên Giấy xác nhận tham quan', 'error');
      return;
    }
    try {
      await sinhVienApi.submitConfirmationPaper({
        registrationId: selectedTrip.id,
        fileXacNhanUrl: uploadedConfirmationFile.url || uploadedConfirmationFile.key,
      });
      showPopup('Đã gửi giấy xác nhận thành công! Vui lòng chờ Giảng viên duyệt điểm danh.', 'success');
      setUploadedFile(null);
      setUploadedConfirmationFile(null);
      setSelectedTrip(null);
      if (student) {
        fetchTrips(student.id);
        fetchRepStatus();
      }
    } catch (err) {
      console.error(err);
      showPopup(err.response?.data?.message || 'Có lỗi xảy ra khi gửi giấy xác nhận', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      showPopup('Vui lòng tải lên file bài thu hoạch', 'error');
      return;
    }

    const isTuDo = selectedTrip?.cachToChuc === 'TuDo' || selectedTrip?.loaiChuyen === 'tu_do';
    if (isTuDo && !uploadedConfirmationFile) {
      showPopup('Chuyến tham quan tự do bắt buộc phải tải lên Giấy xác nhận tham quan doanh nghiệp (có dấu mộc đỏ)', 'error');
      return;
    }

    try {
      await sinhVienApi.submitReport({
        registrationId: selectedTrip.id,
        fileBaoCaoUrl: uploadedFile.url || uploadedFile.name,
        fileXacNhanUrl: uploadedConfirmationFile ? (uploadedConfirmationFile.url || uploadedConfirmationFile.key) : null,
        extractedText: uploadedFile.text,
      });
      showPopup(
        isTuDo 
          ? "Nộp bài thành công! Giấy xác nhận đã được gửi cho Giảng viên duyệt điểm danh." 
          : "Nộp bài thành công!", 
        "success"
      );
      setUploadedFile(null);
      setUploadedConfirmationFile(null);
      setSelectedTrip(null);
      if (student) {
        fetchTrips(student.id);
        fetchRepStatus();
      }
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
              const isTuDo = trip.cachToChuc === 'TuDo' || trip.loaiChuyen === 'tu_do';
              const isDoKhoa = trip.cachToChuc === 'DoKhoaToChuc';
              let canSubmit = true;
              let disabledReason = '';
              
              if (!trip.hasPhieuThamQuan) {
                canSubmit = false;
                disabledReason = isDoKhoa && trip.hoaDonStatus === 'ChuaDong' ? 'Chưa đóng lệ phí' : 'Chưa có PTQ';
              } else if (isDoKhoa && trip.diemDanhStatus !== 'CoMat') {
                canSubmit = false;
                disabledReason = 'Chưa điểm danh';
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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] uppercase tracking-wider font-bold">
                            <Building2 className="w-3 h-3 text-indigo-600" />
                            Chuyến tự do • Kèm giấy xác nhận tham quan
                          </span>
                        )}
                        {repStatus?.selectedRegistrationIds?.includes(trip.id) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-700 text-[10px] uppercase tracking-wider font-extrabold shadow-xs">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Bộ 3 báo cáo
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      {getStatusBadge(trip.trangThai)}
                      {trip.trangThai === 'Đã nộp' || trip.trangThai === 'Chờ duyệt điểm danh' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setConfirmDelete({ show: true, tripId: trip.id })}
                            className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer shadow-sm border border-red-100"
                          >
                            {trip.trangThai === 'Đã nộp' ? 'Nộp lại' : 'Gửi lại'} <UploadCloud className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={async () => {
                              setSelectedTrip(trip);
                              setUploadedConfirmationFile(null);
                              setActivePreviewTab(trip.baiThuHoach?.file_bao_cao ? 'report' : 'confirmation');
                              if (trip.baiThuHoach) {
                                const dbPath = trip.baiThuHoach.file_bao_cao;
                                let apiPath = '';
                                if (dbPath) {
                                  if (dbPath.startsWith('/api/')) {
                                    apiPath = dbPath;
                                  } else if (dbPath.startsWith('reports/')) {
                                    apiPath = `/upload/file/${dbPath}`;
                                  } else {
                                    apiPath = `/upload/file/reports/${dbPath}`;
                                  }
                                }

                                // Fetch PDF and TXT via axiosClient (auto-attaches JWT)
                                let blobUrl = '';
                                let extractedText = 'Đây là nội dung bài làm đã nộp (đã được lưu trên hệ thống).';

                                try {
                                  const { default: api } = await import('../../services/axiosClient');
                                  
                                  if (apiPath) {
                                    const cleanPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
                                    // 1. Fetch PDF
                                    const respPdf = await api.get(cleanPath, { responseType: 'blob' });
                                    if (respPdf.data) {
                                      blobUrl = URL.createObjectURL(respPdf.data);
                                    }

                                    // 2. Fetch Text File (.txt)
                                    const txtApiPath = cleanPath.replace(/\.\w+$/, '.txt');
                                    try {
                                      const respTxt = await api.get(txtApiPath, { responseType: 'text' });
                                      if (respTxt.data) {
                                        extractedText = respTxt.data;
                                      }
                                    } catch (txtErr) {
                                      console.warn('Không tìm thấy file text trích xuất:', txtErr);
                                      if (trip.baiThuHoach.noi_dung_trich_xuat) {
                                        extractedText = trip.baiThuHoach.noi_dung_trich_xuat;
                                      }
                                    }
                                  }

                                  // 3. Fetch Confirmation File nếu có
                                  const xacNhanPath = trip.baiThuHoach.file_xac_nhan_tham_quan;
                                  if (xacNhanPath) {
                                    let xnApiPath = '';
                                    if (xacNhanPath.startsWith('/api/')) {
                                      xnApiPath = xacNhanPath;
                                    } else if (xacNhanPath.startsWith('attachments/') || xacNhanPath.startsWith('payments/')) {
                                      xnApiPath = `/upload/file/${xacNhanPath}`;
                                    } else {
                                      xnApiPath = `/upload/file/attachments/${xacNhanPath}`;
                                    }

                                    try {
                                      const cleanXnPath = xnApiPath.startsWith('/') ? xnApiPath : `/${xnApiPath}`;
                                      const respXn = await api.get(cleanXnPath, { responseType: 'blob' });
                                      if (respXn.data) {
                                        const xnBlobUrl = URL.createObjectURL(respXn.data);
                                        const cType = respXn.headers['content-type'] || '';
                                        const isImage = cType.startsWith('image/') || /\.(png|jpe?g)$/i.test(xacNhanPath);
                                        const isPdf = cType.includes('pdf') || /\.pdf$/i.test(xacNhanPath);
                                        setUploadedConfirmationFile({
                                          name: xacNhanPath.split('/').pop() || 'Giay_xac_nhan_DN',
                                          size: 'Đã nộp',
                                          previewUrl: xnBlobUrl,
                                          isImage,
                                          isPdf,
                                          url: cleanXnPath
                                        });
                                      }
                                    } catch (xnErr) {
                                      console.warn('Không tải được file xác nhận preview:', xnErr);
                                    }
                                  }
                                } catch (err) {
                                  console.error('Lỗi tải file preview:', err);
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
                      ) : (
                        canSubmit ? (
                          <button 
                            onClick={() => {
                              setSelectedTrip(trip);
                              setUploadedFile(null);
                              setUploadedConfirmationFile(null);
                              setActivePreviewTab('report');
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
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Committee & Representative Trips Selection Card */}
        <div className="lg:col-span-1">
          {(() => {
            const completedTripsList = trips.filter(t => t.trangThai === 'Đã nộp');
            const directCompleted = completedTripsList.filter(t => t.hinhThuc === 'Trực tiếp');
            const onlineCompleted = completedTripsList.filter(t => t.hinhThuc === 'Trực tuyến');

            const selectedTripsObjs = trips.filter(t => selectedTripsForReport.includes(t.id));
            const selectedDirectCount = selectedTripsObjs.filter(t => t.hinhThuc === 'Trực tiếp').length;
            const selectedOnlineCount = selectedTripsObjs.filter(t => t.hinhThuc === 'Trực tuyến').length;
            const isSelectionValid = selectedTripsForReport.length === 3 && selectedDirectCount === 2 && selectedOnlineCount === 1;

            const handleToggleTripSelection = (tripId) => {
              if (repStatus?.isLockedByKhoa) {
                toast.error('Quản lý Khoa đã khóa cổng đăng ký / thay đổi bộ chuyến');
                return;
              }
              if (selectedTripsForReport.includes(tripId)) {
                setSelectedTripsForReport(prev => prev.filter(id => id !== tripId));
              } else {
                if (selectedTripsForReport.length >= 3) {
                  toast.error('Chỉ được chọn đúng 3 chuyến làm bộ chuyến báo cáo');
                  return;
                }
                const targetTrip = trips.find(t => t.id === tripId);
                if (!targetTrip) return;

                if (targetTrip.hinhThuc === 'Trực tiếp' && selectedDirectCount >= 2) {
                  toast.error('Bạn đã chọn đủ 2 chuyến Trực tiếp. Vui lòng bỏ chọn chuyến khác trước.');
                  return;
                }
                if (targetTrip.hinhThuc === 'Trực tuyến' && selectedOnlineCount >= 1) {
                  toast.error('Bạn đã chọn đủ 1 chuyến Trực tuyến. Vui lòng bỏ chọn chuyến khác trước.');
                  return;
                }

                const existingFactoryTrip = selectedTripsObjs.find(t => t.nhaMay.toLowerCase() === targetTrip.nhaMay.toLowerCase());
                if (existingFactoryTrip) {
                  toast.error(`Trùng nhà máy "${targetTrip.nhaMay}". Quy định yêu cầu chọn 3 nhà máy khác nhau!`);
                  return;
                }

                setSelectedTripsForReport(prev => [...prev, tripId]);
              }
            };

            const handleSaveRepresentativeTrips = async () => {
              if (!isSelectionValid) {
                toast.error('Vui lòng chọn đúng 2 chuyến Trực tiếp và 1 chuyến Trực tuyến tại 3 nhà máy khác nhau.');
                return;
              }
              try {
                setIsSubmittingRepTrips(true);
                const res = await sinhVienApi.selectRepresentativeTrips({
                  registrationIds: selectedTripsForReport
                });
                toast.success(res.data?.message || 'Đăng ký Bộ 3 chuyến báo cáo thành công!');
                setIsEditingReportSelection(false);
                fetchRepStatus();
              } catch (err) {
                toast.error(err.response?.data?.message || 'Lỗi khi đăng ký bộ chuyến');
              } finally {
                setIsSubmittingRepTrips(false);
              }
            };

            return (
              <div className="bg-white rounded-2xl p-5 text-slate-800 shadow-sm flex flex-col border border-[#E7E0C4] h-full">
                <div className="flex-1 flex flex-col">
                  {/* Card Title & Header Status */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[#E7E0C4]/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#407F3E]/10 border border-[#407F3E]/20 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4 text-[#407F3E]" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-800 tracking-wide truncate">
                          Bộ 3 chuyến báo cáo
                        </h2>
                        <p className="text-[11px] text-slate-500 truncate">Bảo vệ trước Hội đồng chấm điểm</p>
                      </div>
                    </div>

                    {repStatus?.isLockedByKhoa ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        <Lock className="w-3 h-3 text-slate-500" /> Đã khóa
                      </span>
                    ) : repStatus?.hasSelectedBoChuyen ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#407F3E]/10 text-[#407F3E] border border-[#407F3E]/20 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Đã chọn
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300 shrink-0">
                        Chưa chọn
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    Cơ cấu yêu cầu: <strong className="text-slate-800 font-bold">2 trực tiếp + 1 trực tuyến</strong> tại <strong className="text-slate-800 font-bold">3 nhà máy khác nhau</strong>.
                  </p>

                  {/* Checklist Cơ Cấu Học Phần */}
                  <div className="bg-[#f8faf1] rounded-xl p-3.5 mb-4 border border-[#407F3E]/20 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                      <span>Tiến độ bài thu hoạch:</span>
                      <span className="font-bold text-slate-800">
                        {repStatus?.completedTripsCount || 0} bài đã nộp
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${
                        repStatus?.requirementDetails?.directOk
                          ? 'bg-white border-[#407F3E]/30 text-[#407F3E] shadow-2xs font-semibold'
                          : 'bg-white/70 border-slate-200 text-slate-400 font-medium'
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 opacity-80" /> Trực tiếp:
                        </span>
                        <span className="font-bold font-mono">
                          {repStatus?.directCount || 0}/2 {repStatus?.requirementDetails?.directOk ? '✓' : ''}
                        </span>
                      </div>

                      <div className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${
                        repStatus?.requirementDetails?.onlineOk
                          ? 'bg-white border-[#407F3E]/30 text-[#407F3E] shadow-2xs font-semibold'
                          : 'bg-white/70 border-slate-200 text-slate-400 font-medium'
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5 opacity-80" /> Trực tuyến:
                        </span>
                        <span className="font-bold font-mono">
                          {repStatus?.onlineCount || 0}/1 {repStatus?.requirementDetails?.onlineOk ? '✓' : ''}
                        </span>
                      </div>
                    </div>

                    <div className={`text-[11px] p-2 rounded-lg border flex items-center justify-between transition-colors ${
                      repStatus?.requirementDetails?.factoriesOk
                        ? 'bg-white border-[#407F3E]/30 text-[#407F3E] shadow-2xs font-semibold'
                        : 'bg-white/70 border-slate-200 text-slate-400 font-medium'
                    }`}>
                      <span className="flex items-center gap-1.5">Số nhà máy khác nhau:</span>
                      <span className="font-bold font-mono">
                        {repStatus?.distinctFactoryCount || 0}/3 {repStatus?.requirementDetails?.factoriesOk ? '✓ Đạt' : 'Chưa đạt'}
                      </span>
                    </div>
                  </div>

                  {/* Body: Các trạng thái */}
                  {loadingRepStatus ? (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#407F3E]" />
                      <span>Đang tải thông tin...</span>
                    </div>
                  ) : !repStatus?.isEligible ? (
                    /* TRẠNG THÁI 1: CHƯA ĐỦ ĐIỀU KIỆN */
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex flex-col items-center text-center gap-2">
                      <ShieldAlert className="w-8 h-8 text-amber-600" />
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Chưa đủ điều kiện báo cáo</h4>
                      <p className="text-xs text-amber-800/90 leading-relaxed">
                        Theo quy định của học phần, sinh viên phải hoàn thành ít nhất <strong>2 nhà máy trực tiếp</strong> và <strong>1 nhà máy trực tuyến</strong> (tại 3 nhà máy khác nhau) để đủ điều kiện chọn bộ 3 chuyến.
                      </p>
                    </div>
                  ) : isEditingReportSelection || !repStatus?.hasSelectedBoChuyen ? (
                    /* TRẠNG THÁI 2: ĐỦ ĐIỀU KIỆN & CHỌN NGUYỆN VỌNG */
                    <div className="space-y-3 flex-1 flex flex-col">
                      {repStatus?.isLockedByKhoa ? (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
                          <Lock className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
                          <div>
                            <strong className="block font-semibold text-slate-800">Cổng chọn bộ chuyến đã khóa</strong>
                            Quản lý Khoa đã khóa cổng đăng ký cho đợt này. Bạn không thể thực hiện chọn hoặc thay đổi bộ chuyến.
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">Chọn chuyến theo nguyện vọng:</span>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#f8faf1] border border-[#407F3E]/20 text-[#407F3E] font-bold">
                              {selectedTripsForReport.length}/3 chuyến
                            </span>
                          </div>

                          {/* Nhóm 1: Trực tiếp */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px] text-slate-700 font-semibold">
                              <span className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-[#407F3E]" /> Trực tiếp (chọn 2):
                              </span>
                              <span className={`font-mono font-bold ${selectedDirectCount === 2 ? 'text-[#407F3E]' : 'text-slate-400'}`}>
                                {selectedDirectCount}/2
                              </span>
                            </div>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {directCompleted.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic py-2">Chưa có chuyến trực tiếp nào đã nộp bài.</p>
                              ) : (
                                directCompleted.map(trip => {
                                  const isChecked = selectedTripsForReport.includes(trip.id);
                                  return (
                                    <div
                                      key={trip.id}
                                      onClick={() => handleToggleTripSelection(trip.id)}
                                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                                        isChecked
                                          ? 'bg-[#407F3E]/10 border-[#407F3E]/60 text-slate-900 font-semibold shadow-xs'
                                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="min-w-0 flex-1 truncate">
                                        <div className="truncate font-semibold text-slate-800">{trip.nhaMay}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{trip.ngayThamQuan}</div>
                                      </div>
                                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                                        isChecked ? 'bg-[#407F3E] border-[#407F3E] text-white' : 'border-slate-300 bg-white'
                                      }`}>
                                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Nhóm 2: Trực tuyến */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px] text-slate-700 font-semibold">
                              <span className="flex items-center gap-1.5">
                                <Monitor className="w-3.5 h-3.5 text-teal-600" /> Trực tuyến (chọn 1):
                              </span>
                              <span className={`font-mono font-bold ${selectedOnlineCount === 1 ? 'text-[#407F3E]' : 'text-slate-400'}`}>
                                {selectedOnlineCount}/1
                              </span>
                            </div>
                            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                              {onlineCompleted.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic py-2">Chưa có chuyến trực tuyến nào đã nộp bài.</p>
                              ) : (
                                onlineCompleted.map(trip => {
                                  const isChecked = selectedTripsForReport.includes(trip.id);
                                  return (
                                    <div
                                      key={trip.id}
                                      onClick={() => handleToggleTripSelection(trip.id)}
                                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                                        isChecked
                                          ? 'bg-[#407F3E]/10 border-[#407F3E]/60 text-slate-900 font-semibold shadow-xs'
                                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="min-w-0 flex-1 truncate">
                                        <div className="truncate font-semibold text-slate-800">{trip.nhaMay}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{trip.ngayThamQuan}</div>
                                      </div>
                                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                                        isChecked ? 'bg-[#407F3E] border-[#407F3E] text-white' : 'border-slate-300 bg-white'
                                      }`}>
                                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Buttons */}
                          <div className="pt-2 space-y-2 mt-auto">
                            <button
                              type="button"
                              onClick={handleSaveRepresentativeTrips}
                              disabled={!isSelectionValid || isSubmittingRepTrips}
                              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                                isSelectionValid && !isSubmittingRepTrips
                                  ? 'bg-[#407F3E] hover:bg-[#326631] text-white active:scale-[0.99]'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              }`}
                            >
                              {isSubmittingRepTrips ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Đang lưu...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Xác nhận Bộ 3 chuyến báo cáo</span>
                                </>
                              )}
                            </button>

                            {repStatus?.hasSelectedBoChuyen && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTripsForReport(repStatus.selectedRegistrationIds || []);
                                  setIsEditingReportSelection(false);
                                }}
                                className="w-full py-2 bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
                              >
                                Hủy bỏ thay đổi
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* TRẠNG THÁI 3 & 4: ĐÃ ĐĂNG KÝ THÀNH CÔNG (HIỂN THỊ BASIC & GỌN GÀNG) */
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span>3 chuyến đại diện đã đăng ký:</span>
                          {!repStatus?.isLockedByKhoa && (
                            <span className="text-[11px] text-[#407F3E] font-medium">Có thể thay đổi</span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {selectedTripsObjs.map((trip, idx) => (
                            <div
                              key={trip.id}
                              className="p-3 bg-[#f8faf1] hover:bg-[#407F3E]/5 rounded-xl border border-[#407F3E]/20 flex items-center justify-between gap-3 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="w-5 h-5 rounded-md bg-[#407F3E] text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0 shadow-2xs">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1 truncate">
                                  <div className="text-xs font-bold truncate text-slate-800">
                                    {trip.nhaMay}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                    <span>{trip.ngayThamQuan}</span>
                                    <span>•</span>
                                    <span className={trip.hinhThuc === 'Trực tiếp' ? 'text-[#407F3E] font-semibold' : 'text-teal-700 font-semibold'}>
                                      {trip.hinhThuc}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Nút thay đổi bộ 3 chuyến rõ ràng và lịch thiệp */}
                        {!repStatus?.isLockedByKhoa ? (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTripsForReport(repStatus.selectedRegistrationIds || []);
                                setIsEditingReportSelection(true);
                              }}
                              className="w-full py-2.5 px-3 rounded-xl border border-[#407F3E]/30 hover:border-[#407F3E] bg-white hover:bg-[#407F3E]/5 text-xs font-bold text-[#407F3E] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.99]"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#407F3E]" />
                              <span>Thay đổi bộ 3 chuyến</span>
                            </button>
                            <p className="text-[10px] text-slate-400 text-center mt-1.5 italic">
                              * Bạn có thể chọn lại các chuyến khác trước khi Khoa chốt danh sách hoặc khóa cổng.
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 text-center mt-2 italic flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Khoa đã khóa cổng đăng ký. Bộ chuyến không thể thay đổi.</span>
                          </p>
                        )}
                      </div>

                      {/* Thông tin Lịch Hội đồng do Khoa phân công */}
                      <div className="mt-auto pt-3 border-t border-[#E7E0C4]/80">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Lịch bảo vệ Hội đồng
                        </div>

                        {!repStatus?.assignedCouncil ? (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Chờ Khoa phân công Hội đồng</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Khoa đang lập danh sách Hội đồng và xếp phòng. Lịch chính thức sẽ hiển thị tại đây khi hoàn tất.
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-[#f8faf1] border border-[#407F3E]/25 rounded-xl space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#407F3E]">
                                {repStatus.assignedCouncil.tenHoiDong}
                              </span>
                              {repStatus.assignedCouncil.daKhoa ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                                  🔒 Đã khóa điểm
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#407F3E]/10 text-[#407F3E] border border-[#407F3E]/20">
                                  ✓ Đã có lịch
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />
                                <span>
                                  {repStatus.assignedCouncil.ngayBaoCao
                                    ? new Date(repStatus.assignedCouncil.ngayBaoCao).toLocaleString('vi-VN')
                                    : 'Chưa xếp thời gian'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />
                                <span>{repStatus.assignedCouncil.diaDiem || 'Chưa xếp phòng'}</span>
                              </div>
                            </div>

                            {repStatus.assignedCouncil.thanhVien?.length > 0 && (
                              <div className="pt-2 border-t border-[#407F3E]/15 space-y-1">
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Hội đồng chấm:</span>
                                {repStatus.assignedCouncil.thanhVien.map((tv, i) => (
                                  <div key={i} className="text-[11px] text-slate-700 flex items-center justify-between">
                                    <span className="font-medium">{tv.hoTen}</span>
                                    <span className="text-[10px] text-slate-500 font-medium">{tv.vaiTro}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );


  // ---------------------------------------------------------
  // VIEW 2: SPLIT-PANE UPLOAD & COMPARISON VIEW
  // ---------------------------------------------------------
  const renderSubmissionView = () => {
    const isTuDo = selectedTrip?.cachToChuc === 'TuDo' || selectedTrip?.loaiChuyen === 'tu_do';
    const isSubmitted = selectedTrip?.trangThai === 'Đã nộp';
    const canSubmitNow = uploadedFile && (!isTuDo || uploadedConfirmationFile);

    return (
      <div className="flex flex-col h-[calc(100vh-64px)] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Breadcrumb & Control Bar */}
        <div className="h-12 bg-white border-b border-[#E7E0C4] flex items-center justify-between px-4 shrink-0 z-10 shadow-sm gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button 
              onClick={() => { 
                setSelectedTrip(null); 
                setUploadedFile(null); 
                setUploadedConfirmationFile(null);
                setActivePreviewTab('report');
              }} 
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-[#407F3E] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0 truncate">
              <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <span>{isSubmitted ? 'Xem lại bài nộp' : 'Nộp báo cáo'}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[#407F3E] text-sm truncate font-black">{selectedTrip.nhaMay}</span>
              </h2>
            </div>
            {isTuDo && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                <Building2 className="w-3 h-3 text-indigo-600" />
                Chuyến tự do
              </span>
            )}
          </div>

          {/* Center: Preview Tab Selector (if multiple files or TuDo view) */}
          {(isTuDo || (isSubmitted && uploadedConfirmationFile)) && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setActivePreviewTab('report')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePreviewTab === 'report'
                    ? 'bg-white text-[#407F3E] shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bài thu hoạch</span>
                {uploadedFile && <Check className="w-3 h-3 text-[#407F3E]" />}
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('confirmation')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePreviewTab === 'confirmation'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Giấy xác nhận tham quan</span>
                {uploadedConfirmationFile && <Check className="w-3 h-3 text-indigo-600" />}
              </button>
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="shrink-0 flex items-center gap-2">
            {isSubmitted ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Bài nộp đã được ghi nhận
              </span>
            ) : (
              <div className="flex items-center gap-2">
                {(uploadedFile || uploadedConfirmationFile) && (
                  <button 
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadedConfirmationFile(null);
                    }}
                    className="px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer border border-slate-200"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" /> Chọn lại
                  </button>
                )}
                {isTuDo && uploadedConfirmationFile && !uploadedFile && (
                  <button
                    type="button"
                    onClick={handleSaveConfirmationOnly}
                    disabled={uploadingConfirmation}
                    className="px-3.5 py-1.5 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {uploadingConfirmation ? 'Đang gửi...' : 'Gửi riêng giấy XN'}
                  </button>
                )}
                <button 
                  onClick={handleSubmit}
                  disabled={!canSubmitNow || uploading || uploadingConfirmation}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 ${
                    canSubmitNow && !uploading && !uploadingConfirmation
                      ? 'bg-[#407F3E] hover:bg-[#407F3E]/90 text-white cursor-pointer shadow-xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {uploading || uploadingConfirmation ? 'Đang xử lý...' : 'Xác nhận & Nộp bài'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange} 
        />
        <input 
          type="file" 
          ref={confirmationFileInputRef} 
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleConfirmationFileChange} 
        />

        {/* Main Body */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
          {isSubmitted ? (
            /* VIEW MODE: Bản xem trước file đã nộp */
            <div className="flex-1 flex flex-col h-full w-full bg-[#E7E0C4]/20 p-4">
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {activePreviewTab === 'report' ? (
                  uploadedFile?.previewUrl ? (
                    <iframe 
                      src={uploadedFile.previewUrl} 
                      className="w-full h-full border-0" 
                      title="Bản xem trước Bài thu hoạch" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                      <FileText className="w-10 h-10 text-slate-300" />
                      <span>Không thể hiển thị bản xem trước bài thu hoạch</span>
                    </div>
                  )
                ) : (
                  uploadedConfirmationFile?.previewUrl ? (
                    uploadedConfirmationFile.isImage ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900/5 overflow-auto">
                        <div className="relative group max-w-2xl max-h-full">
                          <img 
                            src={uploadedConfirmationFile.previewUrl} 
                            alt="Giấy xác nhận tham quan doanh nghiệp" 
                            className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg border border-slate-200 bg-white"
                          />
                          <a
                            href={uploadedConfirmationFile.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-lg backdrop-blur-sm transition-all flex items-center gap-1.5 opacity-90 hover:opacity-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Xem kích thước gốc
                          </a>
                        </div>
                      </div>
                    ) : (
                      <iframe 
                        src={uploadedConfirmationFile.previewUrl} 
                        className="w-full h-full border-0" 
                        title="Bản xem trước Giấy xác nhận tham quan" 
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                      <Building2 className="w-10 h-10 text-slate-300" />
                      <span>Không tìm thấy giấy xác nhận tham quan đính kèm</span>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : isTuDo ? (
            /* SUBMIT MODE: Chuyến tự do (2 khối tải file song song) */
            <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-6">
              
              {/* Informational Banner */}
              <div className="max-w-5xl mx-auto w-full p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3">
                <Building2 className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 leading-relaxed">
                  <span className="font-extrabold uppercase tracking-wide">Quy định chuyến tham quan tự do:</span> Bạn cần tải lên đầy đủ <strong>(1) Bài thu hoạch kiến tập</strong> và <strong>(2) Giấy xác nhận tham quan có chữ ký & con dấu mộc đỏ của doanh nghiệp</strong> để hệ thống ghi nhận có mặt và gửi bài cho giảng viên hướng dẫn.
                </div>
              </div>

              {/* 2-Card Upload Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto w-full">
                
                {/* Card 1: Bài thu hoạch cá nhân */}
                <div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  uploadedFile 
                    ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200' 
                    : 'bg-white border-slate-200 shadow-sm hover:border-[#407F3E]/40'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#407F3E] flex items-center justify-center font-bold">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">1. Bài thu hoạch kiến tập</h4>
                          <span className="text-[11px] font-semibold text-slate-500">Báo cáo nội dung tham quan</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Bắt buộc
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Định dạng hỗ trợ: <strong>.pdf, .docx, .doc</strong> (Dung lượng tối đa 15MB).
                    </p>

                    {uploadedFile ? (
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3 mb-4 shadow-2xs">
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#407F3E] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{uploadedFile.name}</p>
                            <p className="text-[10px] text-slate-400">{uploadedFile.size}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#407F3E] text-white shrink-0">
                          Đã tải lên
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {uploadedFile ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActivePreviewTab('report')}
                          className="flex-1 py-2 px-3 rounded-xl border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/5 text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          Xem trước file
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          Đổi file khác
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#407F3E] hover:bg-[#407F3E]/90 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4" />
                        {uploading ? 'Đang tải lên...' : 'Chọn file Bài thu hoạch'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Card 2: Giấy xác nhận tham quan doanh nghiệp */}
                <div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  uploadedConfirmationFile 
                    ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-200' 
                    : 'bg-white border-slate-200 shadow-sm hover:border-indigo-400/40'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">2. Giấy xác nhận tham quan</h4>
                          <span className="text-[11px] font-semibold text-slate-500">Minh chứng có mộc đỏ DN</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                        Cần mộc đỏ
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      File scan PDF hoặc hình ảnh (<strong>.pdf, .jpg, .png</strong>) có chữ ký & con dấu tròn doanh nghiệp (tối đa 5MB).
                    </p>

                    {uploadedConfirmationFile ? (
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 flex items-center justify-between gap-3 mb-4 shadow-2xs">
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{uploadedConfirmationFile.name}</p>
                            <p className="text-[10px] text-slate-400">{uploadedConfirmationFile.size}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-600 text-white shrink-0">
                          Đã tải lên
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {uploadedConfirmationFile ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActivePreviewTab('confirmation')}
                          className="flex-1 py-2 px-3 rounded-xl border border-indigo-600 text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          Xem trước giấy XN
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmationFileInputRef.current?.click()}
                          disabled={uploadingConfirmation}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          Đổi file khác
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => confirmationFileInputRef.current?.click()}
                        disabled={uploadingConfirmation}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4" />
                        {uploadingConfirmation ? 'Đang tải lên...' : 'Chọn Giấy xác nhận tham quan'}
                      </button>
                    )}
                  </div>

                  {uploadedConfirmationFile && !uploadedFile && (
                    <button
                      type="button"
                      onClick={handleSaveConfirmationOnly}
                      disabled={uploadingConfirmation}
                      className="w-full mt-3 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {uploadingConfirmation ? 'Đang gửi...' : 'Gửi riêng giấy xác nhận tham quan trước để GV duyệt điểm danh'}
                    </button>
                  )}
                </div>

              </div>

              {/* Preview Container below cards */}
              {(uploadedFile || uploadedConfirmationFile) && (
                <div className="max-w-5xl mx-auto w-full flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[460px]">
                  <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      {activePreviewTab === 'report' ? (
                        <>
                          <FileText className="w-4 h-4 text-[#407F3E]" /> Bản xem trước Bài thu hoạch
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4 text-indigo-600" /> Bản xem trước Giấy xác nhận tham quan
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {activePreviewTab === 'report' ? uploadedFile?.name : uploadedConfirmationFile?.name}
                    </span>
                  </div>

                  <div className="flex-1 p-4 bg-slate-50 flex items-center justify-center">
                    {activePreviewTab === 'report' ? (
                      uploadedFile?.previewUrl ? (
                        <iframe 
                          src={uploadedFile.previewUrl} 
                          className="w-full h-full min-h-[400px] border border-slate-200 rounded-xl bg-white shadow-2xs" 
                          title="Bản xem trước Bài thu hoạch" 
                        />
                      ) : (
                        <div className="text-center text-slate-400 py-12">
                          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="text-xs">Chưa chọn file bài thu hoạch để xem trước</p>
                        </div>
                      )
                    ) : (
                      uploadedConfirmationFile?.previewUrl ? (
                        uploadedConfirmationFile.isImage ? (
                          <div className="flex flex-col items-center justify-center p-4">
                            <img 
                              src={uploadedConfirmationFile.previewUrl} 
                              alt="Bản xem trước Giấy xác nhận" 
                              className="max-h-[380px] w-auto object-contain rounded-xl shadow-md border border-slate-200 bg-white"
                            />
                          </div>
                        ) : (
                          <iframe 
                            src={uploadedConfirmationFile.previewUrl} 
                            className="w-full h-full min-h-[400px] border border-slate-200 rounded-xl bg-white shadow-2xs" 
                            title="Bản xem trước Giấy xác nhận" 
                          />
                        )
                      ) : (
                        <div className="text-center text-slate-400 py-12">
                          <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="text-xs">Chưa chọn giấy xác nhận tham quan để xem trước</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* SUBMIT MODE: Chuyến do Khoa tổ chức (1 file bài thu hoạch) */
            <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
              {!uploadedFile ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#E7E0C4]/20">
                  <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 w-full max-w-lg text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                      <UploadCloud className="w-10 h-10 text-[#407F3E]" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Tải lên File PDF</h3>
                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-xs leading-relaxed">
                      Kéo thả file báo cáo thu hoạch của bạn vào đây, hoặc nhấn nút bên dưới để chọn file (Tối đa 15MB).
                    </p>
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
                <div className="flex-1 flex flex-col h-full w-full bg-[#E7E0C4]/20 p-4">
                  <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    {uploadedFile.previewUrl ? (
                      <iframe 
                        src={uploadedFile.previewUrl} 
                        className="w-full h-full border-0" 
                        title="Bản xem trước Bài thu hoạch" 
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
          )}
        </div>
      </div>
    );
  };
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
                    if (student) {
                      fetchTrips(student.id);
                      fetchRepStatus();
                    }
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
