import React, { useState, useEffect } from 'react';
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
  Calendar
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function NopBaiThuHoach_SV() {
  const [student, setStudent] = useState(null);
  const [registeredTrips, setRegisteredTrips] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedCouncilReportIds, setSelectedCouncilReportIds] = useState([]);

  // Upload Simulator State
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [simulatedFile, setSimulatedFile] = useState('');
  const [simulatedProofFile, setSimulatedProofFile] = useState('');

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

  const fetchData = async (svId) => {
    try {
      const regRes = await sinhVienApi.getRegisteredTrips(svId);
      // Only show trips that are DaThamGia, HopLe, or HoanThanh
      const filtered = regRes.data.filter(t => 
        t.trang_thai === 'DaThamGia' || t.trang_thai === 'HopLe' || t.trang_thai === 'HoanThanh'
      );
      setRegisteredTrips(filtered);

      const gradesRes = await sinhVienApi.getGrades(svId);
      setGrades(gradesRes.data);

      // Pre-select already chosen representative trips if they exist
      if (gradesRes.data && gradesRes.data.length > 0) {
        const currentTerm = gradesRes.data[0];
        if (currentTerm.selectedTrips) {
          setSelectedCouncilReportIds(currentTerm.selectedTrips.map(t => t.phieu_dang_ky_id));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startUploadSimulation = (reg) => {
    setActiveUploadId(reg.id);
    setUploadProgress(0);
    
    const fileBase = reg.chuyenThamQuan.nhaMay?.ten_nha_may
      .toLowerCase()
      .replace(/ /g, '_')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    const pdfName = `Bao_cao_${fileBase}_${student.mssv}.pdf`;
    setSimulatedFile(pdfName);
    
    const isFree = reg.chuyenThamQuan.cach_to_chuc === 'TuDo';
    const proofName = isFree ? `Minh_chung_doanh_nghiep_${fileBase}.jpg` : '';
    if (isFree) {
      setSimulatedProofFile(proofName);
    }

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            try {
              await sinhVienApi.submitReport({
                studentId: student.id,
                registrationId: reg.id,
                fileBaoCaoUrl: pdfName,
                fileXacNhanUrl: isFree ? proofName : undefined
              });
              
              setMessage('Tải lên bài thu hoạch thành công!');
              setActiveUploadId(null);
              setUploadProgress(0);
              fetchData(student.id);
            } catch (err) {
              setError(err.response?.data?.message || 'Lỗi khi nộp bài thu hoạch.');
              setActiveUploadId(null);
              setUploadProgress(0);
            }
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
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
        studentId: student.id,
        termStudentId: currentGrade.id,
        registrationIds: selectedCouncilReportIds
      });
      setShowCouncilModal(true);
      fetchData(student.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Chốt bộ chuyến báo cáo thất bại.');
    }
  };

  // Calculations for Council Criteria
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
        <div className="bg-red-50 border border-red-200 text-red-755 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: List of Submissions */}
        <div className="lg:col-span-8 space-y-6">
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
                const isOnline = reg.chuyenThamQuan.hinh_thuc === 'TrucTuyen';
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
                          {reg.baiThuHoach.file_xac_nhan_tham_quan && (
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-surface-variant/65 text-xs font-bold text-on-surface mt-1">
                              <ShieldCheck className="w-4 h-4 text-[#446900]" />
                              <span className="truncate max-w-[180px]">{reg.baiThuHoach.file_xac_nhan_tham_quan}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Progress upload indicator */}
                    {isUploadingThis ? (
                      <div className="mt-4 p-5 bg-[#f8faf1] border border-dashed border-primary/40 rounded-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                          <span>Đang tải tệp tin lên...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-medium">
                          Tập tin: {simulatedFile} {isFree && `| Xác nhận: ${simulatedProofFile}`}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          onClick={() => startUploadSimulation(reg)}
                          className="px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-1.5 bg-primary text-white hover:bg-primary-container shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{isSubmitted ? 'Nộp lại bài' : isFree ? 'Nộp bài & Xác nhận DN' : 'Nộp bài'}</span>
                        </button>
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

            {/* Criteria Checklist Cards */}
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

            {/* Selection Ticks */}
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

            {/* Status Indicator & Button */}
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

            <div className="my-5 p-4 bg-[#f8faf1] rounded-2xl border border-surface-variant text-left space-y-2">
              <span className="text-[10px] text-outline font-black uppercase tracking-wider block">
                Chuyến đi đã chốt đại diện
              </span>
              {selectedReports.map((r, i) => (
                <div key={r.id} className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>{i + 1}. {r.chuyenThamQuan.nhaMay?.ten_nha_may}</span>
                  <span className="text-[#89b449] uppercase tracking-wide text-[10px] shrink-0 font-black">
                    {r.chuyenThamQuan.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp'}
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowCouncilModal(false)}
              className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-container shadow-md cursor-pointer transition-all active:scale-95"
            >
              Hoàn tất & Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
