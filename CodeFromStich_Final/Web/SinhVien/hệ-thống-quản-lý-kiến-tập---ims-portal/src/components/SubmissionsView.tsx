import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Trash2, 
  Upload, 
  ArrowRight,
  ShieldCheck,
  Check,
  Building,
  Laptop
} from 'lucide-react';
import { Submission } from '../types';

interface SubmissionsViewProps {
  submissions: Submission[];
  onUploadReport: (subId: string, fileName: string, fileSize: string, proofName?: string, proofSize?: string) => void;
  onSelectCouncilReport: (subId: string, isChecked: boolean) => void;
  selectedCouncilReportIds: string[];
}

export default function SubmissionsView({ 
  submissions, 
  onUploadReport,
  onSelectCouncilReport,
  selectedCouncilReportIds
}: SubmissionsViewProps) {
  // Upload Simulator State
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [simulatedFile, setSimulatedFile] = useState<string>('');
  const [simulatedProofFile, setSimulatedProofFile] = useState<string>('');

  // Council modal state
  const [showCouncilModal, setShowCouncilModal] = useState(false);

  // Stats
  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter(s => s.status === 'Đã nộp').length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const startUploadSimulation = (sub: Submission) => {
    setActiveUploadId(sub.id);
    setUploadProgress(0);
    
    // Auto populate realistic filenames if empty
    const fileBase = sub.tripTitle.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    setSimulatedFile(`Bao_cao_${fileBase}_NguyenVanA.pdf`);
    
    if (sub.type === 'Tự do') {
      setSimulatedProofFile(`Xac_nhan_doanh_nghiep_${fileBase}.jpg`);
    }

    // Interval animation simulation
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onUploadReport(
              sub.id, 
              `Bao_cao_${fileBase}_NguyenVanA.pdf`, 
              '2.4 MB', 
              sub.type === 'Tự do' ? `Xac_nhan_doanh_nghiep_${fileBase}.jpg` : undefined,
              sub.type === 'Tự do' ? '1.8 MB' : undefined
            );
            setActiveUploadId(null);
            setUploadProgress(0);
            alert('Tải lên bài thu hoạch thành công!');
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Council Criteria checking
  const selectedReports = submissions.filter(s => selectedCouncilReportIds.includes(s.id));
  const directSelectedCount = selectedReports.filter(s => s.type === 'Trực tiếp').length;
  const onlineSelectedCount = selectedReports.filter(s => s.type === 'Trực tuyến').length;

  // Rule check
  const isDirectCriteriaMet = directSelectedCount >= 2;
  const isOnlineCriteriaMet = onlineSelectedCount >= 1;
  const isEligibleForCouncil = isDirectCriteriaMet && isOnlineCriteriaMet;

  const handleCouncilConfirm = () => {
    if (!isEligibleForCouncil) return;
    setShowCouncilModal(true);
  };

  return (
    <div className="space-y-6">
      {/* View Title */}
      <div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">Nộp bài thu hoạch</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">Nộp báo cáo thu hoạch chuyến tham quan, đính kèm xác nhận thực địa, và lựa chọn báo cáo trình diện trước hội đồng khoa.</p>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: List of Submissions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Banner */}
          <div className="bg-white rounded-2xl border border-surface-muted/40 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#e5ffdc] flex items-center justify-center text-primary shadow-inner">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm text-on-surface">Tiến độ hoàn thành</h3>
                <p className="text-xs text-on-surface-variant font-semibold mt-0.5">Đã nộp {submittedCount} trên tổng số {totalSubmissions} báo cáo kiến tập.</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{submittedCount}</span>
              <span className="text-xs text-on-surface-variant font-bold"> / {totalSubmissions} chuyến</span>
            </div>
          </div>

          {/* Submission cards list */}
          <div className="space-y-4">
            {submissions.map((sub) => {
              const isSubmitted = sub.status === 'Đã nộp';
              const isLate = sub.status === 'Trễ hạn';
              const isDirect = sub.type === 'Trực tiếp';
              const isOnline = sub.type === 'Trực tuyến';
              const isFree = sub.type === 'Tự do';
              
              const isUploadingThis = activeUploadId === sub.id;

              return (
                <div 
                  key={sub.id} 
                  className={`bg-white rounded-2xl shadow-sm border p-6 transition-all duration-300 relative overflow-hidden group ${
                    isSubmitted 
                      ? 'border-primary/20 bg-primary/2/10' 
                      : isLate 
                        ? 'border-red-200' 
                        : 'border-surface-muted/50 hover:border-primary/20 hover:shadow-md'
                  }`}
                >
                  {/* Status Indicator Top Bar */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#89b449] font-bold text-[10px] uppercase tracking-widest block">
                        Đợt kiến tập 2023
                      </span>
                      <h3 className="font-black text-base text-on-surface group-hover:text-primary transition-colors">
                        {sub.tripTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isDirect 
                          ? 'bg-[#c0ef7c]/20 text-[#476d01]' 
                          : isOnline 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-amber-50 text-amber-700'
                      }`}>
                        {isDirect ? <Building className="w-3 h-3" /> : isOnline ? <Laptop className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        <span>{sub.type}</span>
                      </span>

                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isSubmitted 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : isLate 
                            ? 'bg-red-50 text-red-600 border border-red-200' 
                            : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                      }`}>
                        {isSubmitted ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : isLate ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span>{sub.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Submission Info / Attached Files details */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-[#f8faf1]/60 p-4 rounded-xl border border-surface-muted/20">
                    <div className="space-y-1 text-xs font-semibold text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-outline" />
                        <span>Hạn chót nộp: <span className="font-bold text-[#ba1a1a]">{sub.deadline}</span></span>
                      </div>
                      {isSubmitted && sub.submittedDate && (
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <CheckCircle className="w-4 h-4" />
                          <span>Đã nộp vào: {sub.submittedDate}</span>
                        </div>
                      )}
                    </div>

                    {isSubmitted && sub.fileName && (
                      <div className="flex flex-col gap-1 items-end w-full sm:w-auto">
                        <span className="text-[10px] text-outline uppercase font-black">Tập tin đính kèm</span>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-surface-muted/60 text-xs font-bold text-on-surface">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="truncate max-w-[180px]">{sub.fileName}</span>
                          <span className="text-outline text-[10px]">({sub.fileSize})</span>
                        </div>
                        {sub.proofFileName && (
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-surface-muted/60 text-xs font-bold text-on-surface mt-1">
                            <ShieldCheck className="w-4 h-4 text-[#446900]" />
                            <span className="truncate max-w-[180px]">{sub.proofFileName}</span>
                            <span className="text-outline text-[10px]">({sub.proofFileSize})</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upload Simulator Container on Click */}
                  {isUploadingThis ? (
                    <div className="mt-4 p-5 bg-[#f8faf1] border border-dashed border-primary/40 rounded-xl flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                        <span>Đang tải tệp tin lên...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-on-surface-variant font-medium">
                        Simulating upload: {simulatedFile} {isFree && `+ ${simulatedProofFile}`}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex justify-end gap-2">
                      {!isSubmitted && (
                        <button
                          onClick={() => startUploadSimulation(sub)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                            isLate 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-primary text-white hover:bg-primary-container'
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                          <span>{isLate ? 'Nộp trễ (Trừ 2đ)' : isFree ? 'Nộp bài & Minh chứng' : 'Nộp bài'}</span>
                        </button>
                      )}
                      {isSubmitted && (
                        <button
                          onClick={() => startUploadSimulation(sub)}
                          className="px-4 py-2 border border-[#89b449] text-[#476d01] hover:bg-primary/5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Nộp lại bài</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Council Selection (Sidebar) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-muted/40 p-6 flex flex-col sticky top-24">
            <h2 className="font-bold text-base text-on-surface flex items-center gap-2 border-b border-surface-container pb-4 mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Đăng ký báo cáo Hội đồng</span>
            </h2>

            <p className="text-xs text-on-surface-variant leading-relaxed font-semibold mb-4">
              Sinh viên tự do ứng cử báo cáo xuất sắc trước hội đồng khoa nếu thỏa mãn tiêu chí:
            </p>

            {/* Criteria Checklist Cards */}
            <div className="space-y-2 mb-6">
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                isDirectCriteriaMet 
                  ? 'bg-primary/5 border-primary/20 text-primary' 
                  : 'bg-[#f8faf1] border-surface-muted/60 text-on-surface-variant'
              }`}>
                <span>Chọn ít nhất 2 chuyến Trực tiếp</span>
                <span className="font-black shrink-0">{directSelectedCount} / 2</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                isOnlineCriteriaMet 
                  ? 'bg-primary/5 border-primary/20 text-primary' 
                  : 'bg-[#f8faf1] border-surface-muted/60 text-on-surface-variant'
              }`}>
                <span>Chọn ít nhất 1 chuyến Trực tuyến</span>
                <span className="font-black shrink-0">{onlineSelectedCount} / 1</span>
              </div>
            </div>

            {/* Selection Ticks */}
            <div className="space-y-3 mb-6">
              <span className="text-[10px] font-black text-outline uppercase tracking-wider block mb-2">Chọn từ báo cáo đã nộp</span>
              {submissions.map((sub) => {
                const isNop = sub.status === 'Đã nộp';
                const isChecked = selectedCouncilReportIds.includes(sub.id);

                return (
                  <label 
                    key={sub.id} 
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      !isNop 
                        ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100' 
                        : isChecked 
                          ? 'bg-secondary/5 border-secondary text-[#446900]' 
                          : 'bg-[#f8faf1]/80 hover:bg-[#ecefe6] border-surface-muted/50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      disabled={!isNop}
                      checked={isChecked}
                      onChange={(e) => onSelectCouncilReport(sub.id, e.target.checked)}
                      className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary accent-[#446900]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-on-surface font-bold leading-tight">{sub.tripTitle}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 uppercase tracking-wider">{sub.type}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Status Indicator & Button */}
            <div className="mt-auto space-y-4">
              {isEligibleForCouncil ? (
                <div className="p-3 bg-primary/10 rounded-xl text-xs text-primary font-bold text-center border border-primary/20">
                  🎉 Bạn đã đạt điều kiện trình bày hội đồng!
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700 font-bold text-center border border-amber-100">
                  ⚠️ Cần nộp và tích chọn đủ số lượng yêu cầu
                </div>
              )}

              <button
                disabled={!isEligibleForCouncil}
                onClick={handleCouncilConfirm}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                  isEligibleForCouncil 
                    ? 'bg-[#89B449] hover:bg-secondary text-white' 
                    : 'bg-gray-100 text-outline-variant/60 border border-gray-200 cursor-not-allowed shadow-none'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Xác nhận lựa chọn</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Council Success Registration Popup Modal */}
      {showCouncilModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-surface-container animate-scale-up text-center p-8">
            <div className="w-16 h-16 bg-[#e5ffdc] rounded-full flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            
            <h3 className="font-black text-xl text-on-surface">Đăng ký Hội đồng thành công!</h3>
            <p className="text-sm text-on-surface-variant font-semibold mt-2 leading-relaxed px-2">
              Bộ hồ sơ báo cáo của bạn đã được tiếp nhận làm ứng cử viên báo cáo trực diện. Ban cố vấn khoa sẽ liên hệ lịch phản biện sớm qua email.
            </p>

            <div className="my-5 p-4 bg-[#f8faf1] rounded-2xl border border-surface-muted text-left space-y-2">
              <span className="text-[10px] text-outline font-black uppercase tracking-wider block">Bài báo cáo đề xuất</span>
              {selectedReports.map((r, i) => (
                <div key={r.id} className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>{i + 1}. {r.tripTitle}</span>
                  <span className="text-[#89b449] uppercase tracking-wide text-[10px] shrink-0 font-black"># {r.type}</span>
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
