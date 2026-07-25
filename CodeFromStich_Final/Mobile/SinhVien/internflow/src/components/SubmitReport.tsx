import React, { useState } from 'react';
import { Submission } from '../types';
import { FileText, Calendar, CloudUpload, Upload, FileCheck, Edit3, CheckSquare, Square, CheckCircle2, FileUp } from 'lucide-react';

interface SubmitReportProps {
  submissions: Submission[];
  onUploadReport: (id: string, fileName: string, fileSize: string) => void;
}

export const SubmitReport: React.FC<SubmitReportProps> = ({
  submissions,
  onUploadReport
}) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [checkedIds, setCheckedIds] = useState<string[]>(['sub-fpt']); // FPT checked by default as in screen E

  // Handle mock file uploading
  const handleMockUpload = (id: string, fileLabel: string) => {
    setUploadingId(id);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onUploadReport(id, `${fileLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sv123.pdf`, '3.2 MB');
            setUploadingId(null);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Toggle checklist
  const handleToggleCheck = (id: string, status: string) => {
    if (status === 'Chưa nộp') return; // Cannot check if report isn't submitted yet
    
    setCheckedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Requirements checks: "Chọn tối thiểu 2 trực tiếp + 1 trực tuyến"
  // Let's check how many are submitted and selected
  const hasVinamilk = checkedIds.includes('sub-vinamilk');
  const hasFpt = checkedIds.includes('sub-fpt');
  const hasCatLai = checkedIds.includes('sub-catlai');

  // Since we only have 3 available, we can enable confirm when at least 2 are selected
  const requirementsMet = checkedIds.length >= 2;

  const handleConfirmSelection = () => {
    alert('Bộ chuyến báo cáo đã được khoa ghi nhận thành công! Kết quả sẽ được công bố sau khi hội đồng duyệt.');
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-6">
      {/* List of Submissions */}
      <section className="flex flex-col gap-5">
        {submissions.map((sub) => {
          const isVinamilk = sub.id === 'sub-vinamilk';
          const isFpt = sub.id === 'sub-fpt';
          const isCatLai = sub.id === 'sub-catlai';

          return (
            <div 
              key={sub.id} 
              className="bg-white rounded-xl shadow-xs border border-slate-200/85 p-5 relative overflow-hidden"
            >
              {/* Header inside card */}
              <div className="flex justify-between items-start gap-3 mb-3.5">
                <div className="min-w-0">
                  <h2 className="font-bold text-slate-800 text-sm leading-tight mb-1">{sub.tripName}</h2>
                  <p className="text-slate-500 text-xs flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{sub.dateText} - {sub.typeText}</span>
                  </p>
                </div>
                
                {/* Status Badges precisely colored as requested */}
                {sub.status === 'Chưa nộp' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full font-bold text-[10px] bg-[#DBD468] text-slate-700 shadow-xs shrink-0">
                    Chưa nộp
                  </span>
                )}
                {sub.status === 'Đã nộp' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full font-bold text-[10px] bg-[#266528] text-white shadow-xs shrink-0">
                    Đã nộp
                  </span>
                )}
                {sub.status === 'Trễ hạn - trừ điểm' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full font-bold text-[10px] bg-[#E68A8C] text-slate-900 shadow-xs shrink-0">
                    Trễ hạn - trừ điểm
                  </span>
                )}
              </div>

              {/* Action/Upload zone */}
              {sub.status === 'Chưa nộp' && (
                <div className="mt-4">
                  {uploadingId === sub.id ? (
                    <div className="border-2 border-dashed border-[#266528] bg-[#f8faf1] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 border-4 border-[#266528] border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-xs font-bold text-[#266528]">Đang tải lên tài liệu... {uploadProgress}%</p>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleMockUpload(sub.id, 'baocao_vinamilk')}
                      className="border-2 border-dashed border-slate-300 bg-[#f8faf1] hover:bg-[#ecefe6] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                    >
                      <CloudUpload size={32} className="text-[#407f3e] mb-2" />
                      <p className="text-xs font-bold text-slate-700">Bấm để chọn file PDF</p>
                      <p className="text-[10px] text-slate-500 mt-1">Tối đa 10MB</p>
                    </div>
                  )}
                </div>
              )}

              {sub.status === 'Đã nộp' && (
                <div className="mt-4 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between bg-[#f8faf1]/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-700 truncate w-[160px]">{sub.fileName}</span>
                      <span className="text-[10px] text-slate-500">{sub.fileSize || '2.4 MB'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleMockUpload(sub.id, sub.fileName?.replace('.pdf','') || 'baocao')}
                    className="text-[#266528] hover:bg-[#ecefe6] p-2 rounded-full transition-colors active:scale-90 shrink-0"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
              )}

              {sub.status === 'Trễ hạn - trừ điểm' && (
                <div className="mt-4 flex flex-col gap-3">
                  {/* Two separate files for self-guided */}
                  {sub.fileName ? (
                    <div className="border border-slate-200/80 rounded-xl p-3 flex items-center justify-between bg-[#f8faf1]/80">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-[#266528]" />
                        <span className="text-xs font-semibold text-slate-700 truncate w-[180px]">{sub.fileName}</span>
                      </div>
                      <span className="text-[10px] bg-[#266528] text-white px-2 py-0.5 rounded-sm">Đã tải lên</span>
                    </div>
                  ) : uploadingId === `${sub.id}-report` ? (
                    <div className="border border-dashed border-[#266528] rounded-xl p-3 text-center text-xs text-[#266528] font-bold">
                      Đang nộp...
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleMockUpload(`${sub.id}-report`, 'baocao_catlai')}
                      className="border-2 border-dashed border-slate-200 bg-[#f2f5ec]/70 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#ecefe6] transition-colors"
                    >
                      <CloudUpload size={20} className="text-[#407f3e] mb-1" />
                      <p className="text-xs font-medium text-slate-700">Bài thu hoạch (PDF)</p>
                    </div>
                  )}

                  {sub.hasConfirmationFile ? (
                    <div className="border border-slate-200/80 rounded-xl p-3 flex items-center justify-between bg-[#f8faf1]/80">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-[#266528]" />
                        <span className="text-xs font-semibold text-slate-700 truncate w-[180px]">{sub.confirmationFileName}</span>
                      </div>
                      <span className="text-[10px] bg-[#266528] text-white px-2 py-0.5 rounded-sm">Đã tải lên</span>
                    </div>
                  ) : uploadingId === `${sub.id}-confirm` ? (
                    <div className="border border-dashed border-[#266528] rounded-xl p-3 text-center text-xs text-[#266528] font-bold">
                      Đang nộp...
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleMockUpload(`${sub.id}-confirm`, 'giay_xac_nhan_catlai')}
                      className="border-2 border-dashed border-slate-200 bg-[#f2f5ec]/70 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#ecefe6] transition-colors"
                    >
                      <FileUp size={20} className="text-[#407f3e] mb-1" />
                      <p className="text-xs font-medium text-slate-700">Giấy xác nhận tham quan (bắt buộc)</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Selection Box: "Chọn bộ chuyến báo cáo" precisely rendered as requested */}
      <section className="mt-2">
        <div className="bg-[#E7E0C4] border-2 border-[#407f3e] rounded-xl shadow-xs p-5">
          <div className="mb-3.5">
            <h2 className="font-bold text-slate-800 text-sm">Chọn bộ chuyến báo cáo</h2>
            <p className="text-[11px] text-[#334155] font-semibold mt-0.5">Chọn tối thiểu 2 trực tiếp + 1 trực tuyến</p>
          </div>
          
          <div className="space-y-2 mb-5 bg-white p-3.5 rounded-lg border border-slate-300/60">
            {submissions.map((sub) => {
              const isSelected = checkedIds.includes(sub.id);
              const isDisabled = sub.status === 'Chưa nộp';

              return (
                <label 
                  key={sub.id}
                  onClick={() => handleToggleCheck(sub.id, sub.status)}
                  className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                    isDisabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${isDisabled ? 'text-slate-300' : 'text-[#266528]'}`}>
                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-800 leading-tight block">
                      {sub.tripName} ({sub.typeText.split(' ')[1] || 'Tự do'})
                      {isDisabled && (
                        <span className="text-[#41493e] text-[10px] italic font-normal ml-1"> - Chưa nộp</span>
                      )}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          <button 
            disabled={!requirementsMet}
            onClick={handleConfirmSelection}
            className={`w-full font-bold text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-150 ${
              requirementsMet 
                ? 'bg-[#266528] text-white hover:bg-[#105217] shadow-sm active:scale-[0.98]'
                : 'bg-[#e0e4db] text-[#41493e]/60 cursor-not-allowed opacity-70'
            }`}
          >
            <CheckSquare size={16} />
            <span>Xác nhận lựa chọn</span>
          </button>
        </div>
      </section>
    </div>
  );
};
