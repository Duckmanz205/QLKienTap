import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, X, ChevronRight, Bold, Italic, List, 
  ChevronDown, Check, UploadCloud, FileText,
  MessageSquare
} from 'lucide-react';
import api, { khoaApi } from '../../services/api';

export default function ThongBao_Khoa() {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDoiTuongDropdownOpen, setIsDoiTuongDropdownOpen] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);
  
  // Compose form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDoiTuong, setSelectedDoiTuong] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const fileInputRef = useRef(null);

  const doiTuongOptions = ["Tất cả", "Sinh viên", "Giảng viên"];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await khoaApi.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
      // Fallback data if api doesn't exist
    }
  };

  const handleAttachmentSelect = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
    e.target.value = null;
  };

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !selectedDoiTuong) {
      alert('Vui lòng nhập đầy đủ tiêu đề, nội dung và đối tượng nhận');
      return;
    }

    try {
      let fileUrl, fileName;
      if (attachedFile) {
        setIsUploadingAttachment(true);
        const formData = new FormData();
        formData.append('file', attachedFile);
        const uploadRes = await api.post('/upload/attachment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        fileUrl = uploadRes.data.url || uploadRes.data.path; 
        fileName = uploadRes.data.originalName || attachedFile.name;
        setIsUploadingAttachment(false);
      }

      await khoaApi.createNotification({
        tieu_de: title,
        noi_dung: content,
        doi_tuong_nhan: selectedDoiTuong === 'Tất cả' ? 'ALL' : selectedDoiTuong === 'Sinh viên' ? 'STUDENT' : 'LECTURER',
        file_url: fileUrl,
        file_name: fileName
      });
      alert('Gửi thông báo thành công');
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setSelectedDoiTuong('');
      setAttachedFile(null);
      fetchNotifications();
    } catch (err) {
      console.error(err);
      setIsUploadingAttachment(false);
      alert('Gửi thông báo thất bại');
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Thông báo</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Soạn thông báo
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 max-w-[400px]">Tiêu đề</th>
                <th className="p-4 text-center">Đối tượng nhận</th>
                <th className="p-4 text-center">Ngày gửi</th>
                <th className="p-4 text-right pr-6 w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {notifications.map(n => {
                let doiTuongLabel = 'Tất cả';
                if (n.doi_tuong_nhan === 'STUDENT') doiTuongLabel = 'Sinh viên';
                if (n.doi_tuong_nhan === 'LECTURER') doiTuongLabel = 'Giảng viên';
                if (n.doi_tuong_nhan === 'CLB') doiTuongLabel = 'Câu lạc bộ';
                if (n.doi_tuong_nhan === 'KHOA') doiTuongLabel = 'Khoa';

                return (
                  <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 max-w-[400px]">
                      <div className="font-bold text-slate-800 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-[#407F3E] mt-0.5 shrink-0" />
                        <span className="line-clamp-2 leading-relaxed">{n.tieu_de}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded text-[11px] font-bold border ${
                        doiTuongLabel === 'Tất cả' ? 'bg-[#89B449]/10 text-[#407F3E] border-[#89B449]/20' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {doiTuongLabel}
                      </span>
                    </td>
                    <td className="p-4 text-center font-medium text-slate-600">
                      {new Date(n.created_at || n.ngay_gui || new Date()).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                        title="Xem chi tiết"
                        onClick={() => setViewingDetail(n)}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">
                    Không có thông báo nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - "+ Soạn thông báo" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dimmed Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/10  animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div 
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#407F3E]" />
                Soạn thông báo
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleComposeSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar" onClick={() => setIsDoiTuongDropdownOpen(false)}>
                
                {/* Tiêu đề & Đối tượng */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-30">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tiêu đề</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tiêu đề thông báo..."
                      className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Đối tượng nhận</label>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setIsDoiTuongDropdownOpen(!isDoiTuongDropdownOpen); }}
                      className={`w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isDoiTuongDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4] hover:border-[#407F3E]'}`}
                    >
                      <span className={`font-medium truncate pr-2 ${selectedDoiTuong ? 'text-slate-800' : 'text-slate-400'}`}>
                        {selectedDoiTuong || 'Chọn đối tượng'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    {isDoiTuongDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
                        {doiTuongOptions.map(opt => (
                          <div 
                            key={opt}
                            onClick={() => { setSelectedDoiTuong(opt); setIsDoiTuongDropdownOpen(false); }}
                            className={`px-4 py-2 text-sm cursor-pointer font-medium transition-colors flex justify-between items-center ${
                              selectedDoiTuong === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                            }`}
                          >
                            {opt}
                            {selectedDoiTuong === opt && <Check className="w-4 h-4 text-[#407F3E]" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Nội dung */}
                <div className="relative z-20">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nội dung</label>
                  <div className="border border-[#E7E0C4] rounded-xl overflow-hidden bg-slate-50 focus-within:border-[#407F3E] focus-within:ring-1 focus-within:ring-[#407F3E] transition-all">
                    {/* Toolbar */}
                    <div className="bg-white border-b border-[#E7E0C4] p-1.5 flex items-center gap-1">
                      <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><Bold className="w-4 h-4" /></button>
                      <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><Italic className="w-4 h-4" /></button>
                      <div className="w-px h-4 bg-slate-300 mx-1"></div>
                      <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><List className="w-4 h-4" /></button>
                    </div>
                    {/* Editor */}
                    <textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                      placeholder="Nhập nội dung chi tiết..."
                      className="w-full p-4 bg-transparent text-sm focus:outline-none text-slate-800 resize-none font-medium"
                    ></textarea>
                  </div>
                </div>

                {/* Tệp đính kèm */}
                <div className="relative z-10">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tệp đính kèm (tùy chọn)</label>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleAttachmentSelect} accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.zip,.rar" />
                  
                  {attachedFile ? (
                    <div className="border border-[#E7E0C4] bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-[#407F3E]" />
                        <div>
                          <p className="text-sm font-bold text-slate-800 line-clamp-1">{attachedFile.name}</p>
                          <p className="text-xs text-slate-500">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="p-2 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#E7E0C4] hover:border-[#89B449] bg-white rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#89B449]/10 transition-colors">
                        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#89B449]" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-1">Kéo thả file vào đây hoặc nhấn để chọn</p>
                      <p className="text-xs font-medium text-slate-400">Hỗ trợ định dạng: PDF, DOCX, XLSX (Tối đa 5MB)</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end rounded-b-2xl z-10">
                <button 
                  type="submit"
                  disabled={isUploadingAttachment}
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isUploadingAttachment ? 'Đang tải file lên...' : 'Gửi thông báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Xem chi tiết */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/10  animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
          ></div>
          
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Chi tiết
              </h2>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {Object.entries({
                'Tiêu đề': viewingDetail.tieu_de,
                'Nội dung': viewingDetail.noi_dung,
                'Đối tượng nhận': viewingDetail.doi_tuong_nhan === 'STUDENT' ? 'Sinh viên' : viewingDetail.doi_tuong_nhan === 'LECTURER' ? 'Giảng viên' : viewingDetail.doi_tuong_nhan === 'CLB' ? 'Câu lạc bộ' : viewingDetail.doi_tuong_nhan === 'KHOA' ? 'Khoa' : 'Tất cả',
                'Ngày gửi': new Date(viewingDetail.created_at || viewingDetail.ngay_gui || new Date()).toLocaleDateString('vi-VN'),
              }).map(([label, value]) => (
                <div key={label} className="flex flex-col border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-medium text-slate-800 break-words whitespace-pre-wrap">{String(value)}</span>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end rounded-b-2xl">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
