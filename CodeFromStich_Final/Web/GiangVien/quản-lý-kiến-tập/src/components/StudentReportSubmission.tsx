import React, { useState, useRef } from 'react';

interface SubmittedFile {
  name: string;
  size: string;
  time: string;
  status: 'graded' | 'pending' | 'draft';
  score?: number;
}

export default function StudentReportSubmission() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<SubmittedFile[]>([
    { name: 'BaoCao_KienTap_Heineken_NguyenThiThuHa.pdf', size: '2.4 MB', time: '15/10/2023, 14:30', status: 'graded', score: 8.5 },
    { name: 'Slide_ThuyetTrinh_Heineken_Nhom4.pptx', size: '12.8 MB', time: '15/10/2023, 14:45', status: 'graded', score: 8.0 }
  ]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            setFiles(current => [
              {
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                time: new Date().toLocaleString('vi-VN'),
                status: 'pending'
              },
              ...current
            ]);
            alert('Tải lên báo cáo mới thành công! Đang chờ giảng viên chấm bài.');
          }, 500);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Nộp bài thu hoạch</h1>
        <p className="text-on-surface-variant font-medium mt-1">Nộp slide chuẩn bị, slide thuyết trình nhóm và báo cáo cá nhân sau chuyến đi</p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-3 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          dragActive 
            ? 'border-secondary bg-secondary-container/10' 
            : 'border-slate-300 bg-white hover:border-primary/50'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.pptx,.ppt"
          onChange={handleFileSelect}
          className="hidden" 
        />

        <div className="w-14 h-14 rounded-full bg-secondary-container/30 text-on-secondary-container flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[36px]">cloud_upload</span>
        </div>

        <p className="font-bold text-sm text-on-surface mb-1">
          Kéo và thả tệp của bạn vào đây, hoặc <span className="text-primary hover:underline font-extrabold">bấm để chọn từ máy tính</span>
        </p>
        <p className="text-[11px] text-on-surface-variant font-medium">
          Hỗ trợ PDF, Word, PowerPoint (Tối đa 25MB)
        </p>

        {uploading && (
          <div className="w-full max-w-xs mt-6 space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center text-xs font-bold text-primary">
              <span>Đang tải lên tệp...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Submitted Files list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-150">
          <h3 className="font-extrabold text-xs text-on-surface-variant uppercase tracking-wider">Lịch sử bài nộp</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {files.map((file, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-on-surface truncate pr-2">{file.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                    Dung lượng: {file.size} <span className="text-slate-300 mx-1">|</span> Nộp lúc: {file.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {file.status === 'graded' ? (
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-green-50 text-[#266528] rounded font-bold text-[9px] uppercase border border-green-200">Đã chấm</span>
                    <p className="font-mono font-bold text-xs text-primary mt-1">Lớp: {file.score?.toFixed(1)} đ</p>
                  </div>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-50 text-[#7c7515] rounded font-bold text-[9px] uppercase border border-amber-200">Đang chờ chấm</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
