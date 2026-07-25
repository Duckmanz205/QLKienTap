import React, { useState, useRef } from 'react';
import { 
  Bell, 
  Star, 
  Trash2, 
  Send, 
  FileText, 
  UploadCloud, 
  Paperclip, 
  X, 
  Sparkles, 
  CheckCircle,
  Eye
} from 'lucide-react';
import { SystemAnnouncement } from '../types';

interface AnnouncementViewProps {
  announcements: SystemAnnouncement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<SystemAnnouncement[]>>;
}

export default function AnnouncementView({ announcements, setAnnouncements }: AnnouncementViewProps) {
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<SystemAnnouncement | null>(null);

  // Form states for compose
  const [title, setTitle] = useState('');
  const [recipients, setRecipients] = useState<string[]>(['Tất cả']);
  const [content, setContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleStar = (id: string) => {
    setAnnouncements(prev => prev.map(ann => {
      if (ann.id === id) {
        return { ...ann, isStarred: !ann.isStarred };
      }
      return ann;
    }));
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Bạn muốn xóa thông báo "${title}" này không?`)) {
      setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    }
  };

  // Drag and drop events for uploader
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!');
      return;
    }

    const newAnn: SystemAnnouncement = {
      id: `ANN-${Math.floor(10 + Math.random() * 90)}`,
      title,
      recipients: recipients.length > 0 ? recipients : ['Tất cả'],
      dateSent: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      readCount: '0/80',
      readPercentage: 0,
      isStarred: false,
      content
    };

    setAnnouncements(prev => [newAnn, ...prev]);
    setShowComposeModal(false);
    
    // Reset forms
    setTitle('');
    setContent('');
    setRecipients(['Tất cả']);
    setUploadedFile(null);
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return 'bg-[#407F3E]';
    if (pct >= 50) return 'bg-[#DBD468]';
    return 'bg-red-400';
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-container tracking-tight">
            Thông báo Hệ thống
          </h1>
          <p className="text-sm text-slate-500">
            Gửi và lưu trữ các thông báo chung từ ban chủ nhiệm khoa đến giảng viên, sinh viên.
          </p>
        </div>
        <button
          onClick={() => setShowComposeModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#407F3E] hover:bg-[#346732] text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg self-start cursor-pointer transform hover:-translate-y-0.5 animate-pulse"
        >
          <Send className="w-4 h-4" />
          <span>Soạn thông báo mới</span>
        </button>
      </div>

      {/* Announcements List Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 w-10 text-center"></th>
                <th className="px-6 py-4">Tiêu đề thông báo</th>
                <th className="px-6 py-4">Đối tượng nhận</th>
                <th className="px-6 py-4">Ngày gửi</th>
                <th className="px-6 py-4">Số lượt đọc</th>
                <th className="px-6 py-4">Tỷ lệ đọc</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {announcements.map(ann => (
                <tr key={ann.id} className="hover:bg-slate-50/50 transition-colors duration-200 group">
                  <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => handleToggleStar(ann.id)}
                      className="cursor-pointer text-slate-300 hover:text-amber-400 transition-colors"
                    >
                      <Star className={`w-5 h-5 ${ann.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col max-w-sm sm:max-w-md truncate">
                      <button 
                        onClick={() => setSelectedAnnouncement(ann)}
                        className="font-bold text-slate-800 text-sm hover:text-primary-container text-left outline-none"
                      >
                        {ann.title}
                      </button>
                      <span className="text-[10px] text-slate-400 font-bold">Mã thông báo: {ann.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {ann.recipients.map((rec, idx) => (
                        <span key={idx} className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {rec}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-semibold font-mono">
                    {ann.dateSent}
                  </td>
                  <td className="px-6 py-4 text-slate-700 text-xs font-bold font-mono">
                    {ann.readCount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner shrink-0">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${getPercentageColor(ann.readPercentage)}`}
                          style={{ width: `${ann.readPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600 font-mono">{ann.readPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedAnnouncement(ann)}
                        className="p-2 text-slate-400 hover:text-[#407F3E] hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(ann.id, ann.title)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-[#E7E0C4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-container animate-bounce" />
                <span className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Thông báo chi tiết</span>
              </div>
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h2 className="text-xl font-black text-slate-800 leading-snug">
                {selectedAnnouncement.title}
              </h2>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 font-bold py-2 border-y border-slate-100">
                <span>Người gửi: Ban Chủ Nhiệm Khoa</span>
                <span>Ngày gửi: {selectedAnnouncement.dateSent}</span>
                <span>Mã số: {selectedAnnouncement.id}</span>
              </div>

              <div className="text-sm text-slate-600 leading-relaxed py-2 font-medium">
                {selectedAnnouncement.content || 'Đề nghị toàn bộ sinh viên, cán bộ giảng viên thuộc khoa cập nhật lịch trình và nội dung tương ứng để đảm bảo tiến độ học tập và kiểm tra.'}
              </div>

              {/* Mock attached file */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#407F3E]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">ke_hoach_kien_tap_chi_tiet_ky_1_2024.pdf</p>
                  <p className="text-[10px] text-slate-400">Dung lượng: 2.4 MB • Định dạng PDF</p>
                </div>
                <button 
                  onClick={() => alert('Bắt đầu tải tệp đính kèm về thiết bị...')}
                  className="px-3 py-1 bg-white hover:bg-[#407F3E] hover:text-white border border-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Tải xuống
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-sm"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Announcement Modal with File Upload Pattern */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-[#E7E0C4] flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#407F3E]" />
                <span>Soạn thông báo hệ thống mới</span>
              </h2>
              <button 
                onClick={() => setShowComposeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleComposeSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Recipients options */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Đối tượng nhận thông báo
                </label>
                <div className="flex gap-4">
                  {['Tất cả', 'Giảng viên', 'Lớp 14ĐHTP', 'Lớp 13ĐHTP'].map(role => (
                    <label key={role} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={recipients.includes(role)}
                        onChange={() => {
                          if (role === 'Tất cả') {
                            setRecipients(['Tất cả']);
                          } else {
                            let updated = recipients.filter(r => r !== 'Tất cả');
                            if (updated.includes(role)) {
                              updated = updated.filter(r => r !== role);
                            } else {
                              updated.push(role);
                            }
                            setRecipients(updated.length === 0 ? ['Tất cả'] : updated);
                          }
                        }}
                        className="rounded border-slate-300 text-[#407F3E] focus:ring-[#407F3E]/20"
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tiêu đề thông báo *
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề ngắn gọn súc tích..." 
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700"
                />
              </div>

              {/* Content text */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nội dung chi tiết *
                </label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Nhập nội dung văn bản thông báo chung gửi đến các đối tượng..." 
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700"
                ></textarea>
              </div>

              {/* Interactive File Uploader Zone - Drag and Drop Pattern */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Tệp đính kèm (Tài liệu đính kèm)
                </label>
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 bg-slate-50/50 ${
                    isDragging 
                      ? 'border-[#407F3E] bg-[#407F3E]/5' 
                      : uploadedFile 
                        ? 'border-green-400 bg-green-50/30' 
                        : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                  />

                  {uploadedFile ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">{uploadedFile.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Sẵn sàng đính kèm
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                        className="mt-2 text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1 border border-red-100 hover:bg-red-50 rounded-lg transition-all"
                      >
                        Xóa file đính kèm
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-[#407F3E]' : 'text-slate-400'}`} />
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">Kéo & thả tệp đính kèm vào đây</p>
                        <p className="text-xs text-slate-400 mt-0.5">hoặc nhấp chuột để duyệt file từ máy tính</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 px-2.5 py-0.5 bg-slate-100 rounded">PDF, DOCX, XLSX (Tối đa 15MB)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy soạn
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#407F3E] hover:bg-[#346732] text-white rounded-xl text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Phát hành thông báo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
