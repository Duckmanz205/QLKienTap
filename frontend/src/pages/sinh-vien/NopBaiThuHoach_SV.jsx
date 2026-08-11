import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  ShieldCheck,
  Check,
  Building,
  Laptop,
  Calendar,
  Sparkles,
  Edit3,
  X,
  Loader2
} from 'lucide-react';
import api, { sinhVienApi } from '../../services/api';

export default function NopBaiThuHoach_SV() {
  const [student, setStudent] = useState(null);
  const [registeredTrips, setRegisteredTrips] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedCouncilReportIds, setSelectedCouncilReportIds] = useState([]);

  // Upload Simulator & OCR States
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [simulatedFile, setSimulatedFile] = useState('');
  const [simulatedProofFile, setSimulatedProofFile] = useState('');

  // OCR Modal States (TÍCH HỢP AI)
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [pendingPdfFile, setPendingPdfFile] = useState(null);

  // Council modal state
  const [showCouncilModal, setShowCouncilModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchData(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  // const fetchData = async (svId) => {
  //   try {
  //     const regRes = await sinhVienApi.getRegisteredTrips(svId);
  //     const filtered = regRes.data.filter(t =>
  //       t.trang_thai === 'DaThamGia' || t.trang_thai === 'HopLe' || t.trang_thai === 'HoanThanh'
  //     );
  //     setRegisteredTrips(filtered);
  //
  //     const gradesRes = await sinhVienApi.getGrades(svId);
  //     setGrades(gradesRes.data);
  //
  //     if (gradesRes.data && gradesRes.data.length > 0) {
  //       const currentTerm = gradesRes.data[0];
  //       if (currentTerm.selectedTrips) {
  //         setSelectedCouncilReportIds(currentTerm.selectedTrips.map(t => t.phieu_dang_ky_id));
  //       }
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const fetchData = async (svId) => {
    // 🚨 MOCK DATA BẤT TỬ: Khởi tạo sẵn dữ liệu giả
    const mockTrip = {
      id: 9999, // ID giả không tồn tại trong DB
      trang_thai: 'DaThamGia',
      chuyenThamQuan: {
        hinh_thuc: 'TrucTiep',
        cach_to_chuc: 'DoKhoaToChuc',
        ngay_tham_quan: new Date().toISOString(),
        nhaMay: { ten_nha_may: '🏭 [MOCK DATA] Nhà máy Acecook (Test AI)' }
      },
      baiThuHoach: null // Chưa nộp bài
    };

    try {
      const regRes = await sinhVienApi.getRegisteredTrips(svId);
      const filtered = regRes.data.filter(t =>
        t.trang_thai === 'DaThamGia' || t.trang_thai === 'HopLe' || t.trang_thai === 'HoanThanh'
      );

      // Nếu API thành công, ta nhét thêm cục Mock Data vào đầu danh sách
      setRegisteredTrips([mockTrip, ...filtered]);

      const gradesRes = await sinhVienApi.getGrades(svId);
      setGrades(gradesRes.data);

      if (gradesRes.data && gradesRes.data.length > 0) {
        const currentTerm = gradesRes.data[0];
        if (currentTerm.selectedTrips) {
          setSelectedCouncilReportIds(currentTerm.selectedTrips.map(t => t.phieu_dang_ky_id));
        }
      }
    } catch (err) {
      console.error("Backend báo lỗi không có dữ liệu, nhưng ta vẫn ép hiện Mock Data!", err);
      // Nếu API sập/lỗi do DB rỗng, VẪN ÉP HIỂN THỊ CỤC MOCK DATA NÀY!
      setRegisteredTrips([mockTrip]);
    }
  };

  // =========================================================================
  // BƯỚC 1: XỬ LÝ CHỌN FILE PDF & KÍCH HOẠT QUÉT OCR
  // =========================================================================
  const handleRealUpload = async (event, reg) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước tệp báo cáo vượt quá hạn mức 5MB.');
      return;
    }

    setActiveUploadId(reg.id);
    setIsOcrScanning(true);
    setMessage('');
    setError('');
    setSimulatedFile(file.name);

    try {
      // Gửi file PDF tới Microservice AI (:8000/process-pdf)
      const ocrFormData = new FormData();
      ocrFormData.append('file', file);

      const ocrResponse = await axios.post('http://localhost:8000/process-pdf', ocrFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const extractedText = ocrResponse.data.extracted_text || '';

      // Mở Modal kiểm duyệt cho sinh viên xem và chỉnh sửa
      setOcrText(extractedText);
      setPendingRegistration(reg);
      setPendingPdfFile(file);
      setShowOcrModal(true);

    } catch (err) {
      console.error('Lỗi kết nối AI OCR:', err);
      setError('Không thể trích xuất văn bản từ AI OCR. Vui lòng đảm bảo server AI (:8000) đang chạy.');
    } finally {
      setIsOcrScanning(false);
      setActiveUploadId(null);
    }
  };

  // =========================================================================
  // BƯỚC 2: XÁC NHẬN NỘP BÀI (GỬI PDF + VĂN BẢN ĐÃ CHỈNH SỬA)
  // =========================================================================
  const handleConfirmFinalSubmission = async () => {
    if (!pendingPdfFile || !pendingRegistration) return;

    const reg = pendingRegistration;
    const file = pendingPdfFile;

    setActiveUploadId(reg.id);
    setUploadProgress(10);
    setMessage('');
    setError('');

    try {
      // 1. Tải file báo cáo PDF lên NestJS backend
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/upload/report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const fileBaoCaoUrl = uploadRes.data.key || uploadRes.data.url;
      let fileXacNhanUrl = undefined;

      // 2. Nếu là chuyến tự do -> Đính kèm minh chứng doanh nghiệp
      const isFree = reg.chuyenThamQuan.cach_to_chuc === 'TuDo';
      if (isFree) {
        const confirmUploadProof = window.confirm('Đây là chuyến tự chọn. Bạn cần đính kèm tệp minh chứng/xác nhận tham quan từ doanh nghiệp (định dạng JPG, JPEG, PNG, dưới 2MB). Bạn có muốn chọn tệp ngay bây giờ?');
        if (confirmUploadProof) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';

          const proofFile = await new Promise((resolve) => {
            input.onchange = (e) => resolve(e.target.files[0]);
            input.click();
          });

          if (proofFile) {
            if (proofFile.size > 2 * 1024 * 1024) {
              alert('Kích thước tệp minh chứng vượt quá hạn mức 2MB.');
              setActiveUploadId(null);
              return;
            }

            setSimulatedProofFile(proofFile.name);
            const proofFormData = new FormData();
            proofFormData.append('file', proofFile);

            const proofRes = await api.post('/upload/payment', proofFormData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            fileXacNhanUrl = proofRes.data.key || proofRes.data.url;
          }
        }
      }

      // 3. Đệ trình bài thu hoạch kèm theo VĂN BẢN ĐÃ CHỈNH SỬA (noiDungText)
      await sinhVienApi.submitReport({
        registrationId: reg.id,
        fileBaoCaoUrl,
        fileXacNhanUrl,
        noiDungText: ocrText  // <-- ĐÍNH KÈM NỘI DUNG OCR
      });

      setMessage('Đã nộp bài thu hoạch và xác nhận nội dung OCR thành công!');
      setShowOcrModal(false);
      fetchData(student.id);
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

  const handleSelectCouncilReport = (regId, isChecked) => {
    if (isChecked) {
      if (selectedCouncilReportIds.length >= 3) {
        alert('Chỉ được chọn tối đa 3 chuyến đi đại diện!');
        return;
      }
      setSelectedCouncilReportIds([...selectedCouncilReportIds, regId]);
    } else {
      setSelectedCouncilReportIds(selectedCouncilReportIds.filter(id => id !== regId));
    }
  };

  const handleCouncilConfirm = async () => {
    if (selectedCouncilReportIds.length !== 3) {
      alert('Vui lòng chọn đúng 3 chuyến báo cáo đại diện.');
      return;
    }

    const currentGrade = grades[0];
    if (!currentGrade) {
      alert('Không tìm thấy đợt học phần đang diễn ra.');
      return;
    }

    setMessage('');
    setError('');
    try {
      await sinhVienApi.selectRepresentativeTrips({
        termStudentId: currentGrade.id,
        registrationIds: selectedCouncilReportIds
      });
      setShowCouncilModal(true);
      fetchData(student.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Chốt bộ chuyến báo cáo thất bại.');
    }
  };

  const selectedReports = registeredTrips.filter(t => selectedCouncilReportIds.includes(t.id));
  const directSelectedCount = selectedReports.filter(t => t.chuyenThamQuan.hinh_thuc === 'TrucTiep').length;
  const onlineSelectedCount = selectedReports.filter(t => t.chuyenThamQuan.hinh_thuc === 'TrucTuyen').length;

  const isDirectCriteriaMet = directSelectedCount >= 2;
  const isOnlineCriteriaMet = onlineSelectedCount >= 1;
  const isEligibleForCouncil = isDirectCriteriaMet && isOnlineCriteriaMet && selectedCouncilReportIds.length === 3;

  const totalSubmissions = registeredTrips.length;
  const submittedCount = registeredTrips.filter(t => t.baiThuHoach).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">Nộp bài thu hoạch</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">
          Nộp báo cáo thu hoạch chuyến tham quan, đính kèm xác nhận thực địa, và lựa chọn bộ 3 báo cáo để chốt điểm học phần.
        </p>
      </div>

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

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        {/* Left Column: List of Submissions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Templates download section */}
          <div className="bg-[#f0f9ff] border border-blue-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Tài liệu hướng dẫn & Biểu mẫu mẫu
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed font-semibold">
              Để đảm bảo các báo cáo của bạn được duyệt nhanh chóng, vui lòng tải các tài liệu hướng dẫn và mẫu nhật ký bên dưới:
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="http://localhost:3000/api/upload/file/templates/huong_dan_viet_bao_cao.pdf"
                download
                className="px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <span>📄 Quy chuẩn viết báo cáo (PDF)</span>
              </a>
              <a
                href="http://localhost:3000/api/upload/file/templates/mau_nhat_ky_thuc_tap.xlsx"
                download
                className="px-4 py-2 bg-white text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <span>📊 Mẫu Nhật ký tuần (Excel)</span>
              </a>
            </div>
          </div>

          {/* Progress Banner */}
          <div className="bg-white rounded-2xl border border-surface-variant/40 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#e5ffdc] flex items-center justify-center text-primary shadow-inner">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm text-on-surface">Tiến độ hoàn thành</h3>
                <p className="text-xs text-on-surface-variant font-semibold mt-0.5">
                  Đã nộp {submittedCount} trên tổng số {totalSubmissions} chuyến đi đã đăng ký.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{submittedCount}</span>
              <span className="text-xs text-on-surface-variant font-bold"> / {totalSubmissions} chuyến</span>
            </div>
          </div>

          {/* Submission cards list */}
          <div className="space-y-4">
            {registeredTrips.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
                Chưa có chuyến đi nào đủ điều kiện nộp bài thu hoạch.
              </div>
            ) : (
              registeredTrips.map((reg) => {
                const isSubmitted = !!reg.baiThuHoach;
                const isDirect = reg.chuyenThamQuan.hinh_thuc === 'TrucTiep';
                const isFree = reg.chuyenThamQuan.cach_to_chuc === 'TuDo';
                const isUploadingThis = activeUploadId === reg.id;

                return (
                  <div
                    key={reg.id}
                    className={`bg-white rounded-2xl shadow-sm border p-6 transition-all duration-300 relative overflow-hidden group ${
                      isSubmitted ? 'border-primary/20 bg-primary/2/10' : 'border-surface-variant/50 hover:border-primary/20 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#89b449] font-bold text-[10px] uppercase tracking-widest block">
                          {reg.chuyenThamQuan.cach_to_chuc === 'DoKhoaToChuc' ? 'Theo đợt khoa' : 'Đề xuất tự do'}
                        </span>
                        <h3 className="font-black text-base text-on-surface group-hover:text-primary transition-colors">
                          {reg.chuyenThamQuan.nhaMay?.ten_nha_may}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isDirect ? 'bg-[#c0ef7c]/20 text-[#476d01]' : 'bg-blue-50 text-blue-705'
                        }`}>
                          {isDirect ? <Building className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
                          <span>{isDirect ? 'Trực tiếp' : 'Trực tuyến'}</span>
                        </span>

                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isSubmitted ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-amber-500/10 text-amber-705 border border-amber-500/20'
                        }`}>
                          {isSubmitted ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          <span>{isSubmitted ? 'Đã nộp' : 'Chưa nộp'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Info bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-[#f8faf1]/60 p-4 rounded-xl border border-surface-variant/20">
                      <div className="space-y-1 text-xs font-semibold text-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-outline" />
                          <span>Ngày đi: {new Date(reg.chuyenThamQuan.ngay_tham_quan).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {isSubmitted && (
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <CheckCircle className="w-4 h-4" />
                            <span>Đã nộp: {new Date(reg.baiThuHoach.ngay_nop).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                      </div>

                      {isSubmitted && reg.baiThuHoach.file_bao_cao && (
                        <div className="flex flex-col gap-1 items-end w-full sm:w-auto">
                          <span className="text-[10px] text-outline uppercase font-black">Tập tin đính kèm</span>
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-surface-variant/65 text-xs font-bold text-on-surface">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="truncate max-w-[180px]">{reg.baiThuHoach.file_bao_cao}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress upload / OCR Scanning indicator */}
                    {isUploadingThis ? (
                      <div className="mt-4 p-5 bg-[#f8faf1] border border-dashed border-primary/40 rounded-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                          <span className="flex items-center gap-2">
                            {isOcrScanning ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : null}
                            {isOcrScanning ? '🤖 Đang kết nối AI quét văn bản OCR...' : 'Đang tải tệp tin lên...'}
                          </span>
                          {!isOcrScanning && <span>{uploadProgress}%</span>}
                        </div>
                        {!isOcrScanning && (
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-200"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 flex justify-end gap-2">
                        <label className="px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-1.5 bg-primary text-white hover:bg-primary-container shadow-sm active:scale-95 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>{isSubmitted ? 'Nộp lại bài' : isFree ? 'Nộp bài & Xác nhận DN' : 'Nộp bài'}</span>
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => handleRealUpload(e, reg)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Council Selection (Sidebar) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-variant/40 p-6 flex flex-col sticky top-24">
            <h2 className="font-bold text-base text-on-surface flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Chốt bộ 3 chuyến báo cáo</span>
            </h2>

            <p className="text-xs text-on-surface-variant leading-relaxed font-semibold mb-4">
              Chọn chính xác 3 chuyến đi đã nộp báo cáo để làm bộ đại diện tính điểm tổng kết học phần:
            </p>

            <div className="space-y-2 mb-6">
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                isDirectCriteriaMet 
                  ? 'bg-primary/5 border-primary/20 text-primary' 
                  : 'bg-[#f8faf1] border-surface-variant/60 text-on-surface-variant'
              }`}>
                <span>Chọn ít nhất 2 chuyến Trực tiếp</span>
                <span className="font-black shrink-0">{directSelectedCount} / 2</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                isOnlineCriteriaMet 
                  ? 'bg-primary/5 border-primary/20 text-primary' 
                  : 'bg-[#f8faf1] border-surface-variant/60 text-on-surface-variant'
              }`}>
                <span>Chọn ít nhất 1 chuyến Trực tuyến</span>
                <span className="font-black shrink-0">{onlineSelectedCount} / 1</span>
              </div>
            </div>

            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
              <span className="text-[10px] font-black text-outline uppercase tracking-wider block mb-2">
                Danh sách báo cáo đã nộp
              </span>
              {registeredTrips.filter(t => t.baiThuHoach).length === 0 ? (
                <p className="text-xs text-slate-400">Bạn chưa có báo cáo nào đã nộp để chốt bộ.</p>
              ) : (
                registeredTrips.filter(t => t.baiThuHoach).map((reg) => {
                  const isChecked = selectedCouncilReportIds.includes(reg.id);
                  const isOnline = reg.chuyenThamQuan.hinh_thuc === 'TrucTuyen';

                  return (
                    <label
                      key={reg.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-secondary/5 border-secondary text-[#446900]' 
                          : 'bg-[#f8faf1]/80 hover:bg-[#ecefe6] border-surface-variant/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleSelectCouncilReport(reg.id, e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary accent-[#446900]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-on-surface font-bold leading-tight">
                          {reg.chuyenThamQuan.nhaMay?.ten_nha_may}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 uppercase tracking-wider">
                          {isOnline ? 'Trực tuyến' : 'Trực tiếp'}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="mt-auto space-y-4">
              {isEligibleForCouncil ? (
                <div className="p-3 bg-primary/10 rounded-xl text-xs text-primary font-bold text-center border border-primary/20">
                  🎉 Bộ chuyến chọn đã hợp lệ!
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700 font-bold text-center border border-amber-100">
                  ⚠️ Hãy chọn đúng 2 Trực tiếp và 1 Trực tuyến
                </div>
              )}

              <button
                disabled={!isEligibleForCouncil}
                onClick={handleCouncilConfirm}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                  isEligibleForCouncil 
                    ? 'bg-[#89B449] hover:bg-secondary text-white' 
                    : 'bg-gray-100 text-outline-variant/60 border border-gray-250 cursor-not-allowed shadow-none'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Chốt bộ đại diện</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL MỚI: KIỂM DUYỆT & CHỈNH SỬA VĂN BẢN OCR TỪ AI                        */}
      {/* ========================================================================= */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-surface-variant animate-scale-up flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="p-6 bg-[#f8faf1] border-b border-surface-variant flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-on-surface">Kiểm duyệt văn bản trích xuất OCR (AI)</h3>
                  <p className="text-xs text-on-surface-variant font-semibold">
                    Đoạn văn bản dưới đây sẽ được AI sử dụng để chấm điểm. Vui lòng chỉnh sửa các từ bị đọc sai chính tả (nếu có).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOcrModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Textarea */}
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant">
                <span className="flex items-center gap-1.5 text-primary">
                  <Edit3 className="w-4 h-4" />
                  <span>Trình soạn thảo văn bản báo cáo</span>
                </span>
                <span>Tự động phát hiện bởi Qwen-VL-OCR</span>
              </div>

              <textarea
                rows={14}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Nội dung báo cáo quét được sẽ hiển thị ở đây..."
                className="w-full p-4 text-xs font-mono bg-[#f8faf1] border border-surface-variant rounded-2xl focus:outline-none focus:border-primary text-on-surface leading-relaxed resize-none shadow-inner"
              />

              <p className="text-[11px] text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Mẹo: Bạn có thể sửa trực tiếp nội dung bên trên trước khi bấm gửi. Hệ thống AI có tính năng "Kháng thể OCR" tự động bỏ qua các lỗi gõ sai nhỏ.</span>
              </p>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-100 bg-[#f8faf1]/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowOcrModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmFinalSubmission}
                className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Xác nhận & Nộp bài chính thức</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Council Success Registration Popup Modal */}
      {showCouncilModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-surface-variant animate-scale-up text-center p-8">
            <div className="w-16 h-16 bg-[#e5ffdc] rounded-full flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h3 className="font-black text-xl text-on-surface">Chốt bộ báo cáo thành công!</h3>
            <p className="text-sm text-on-surface-variant font-semibold mt-2 leading-relaxed px-2">
              Lựa chọn của bạn đã được ghi nhận trên hệ thống. Giảng viên phụ trách và hội đồng chấm điểm sẽ tiến hành chấm điểm dựa trên bộ 3 chuyến đi đại diện này.
            </p>

            <button
              onClick={() => setShowCouncilModal(false)}
              className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-container shadow-md cursor-pointer transition-all active:scale-95 mt-6"
            >
              Hoàn tất & Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}