import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, X, ChevronRight, Bold, Italic, List, 
  ChevronDown, Check, UploadCloud, FileText,
  MessageSquare, Search, Paperclip, Download, ExternalLink
} from 'lucide-react';
import api, { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function ThongBao_Khoa() {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);

  // Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterDoiTuong, setSelectedFilterDoiTuong] = useState('ALL');
  const [selectedFilterLoai, setSelectedFilterLoai] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  
  // Compose form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDoiTuong, setSelectedDoiTuong] = useState('Tất cả');
  const [selectedLoaiThongBao, setSelectedLoaiThongBao] = useState('ThongBao');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isDoiTuongDropdownOpen, setIsDoiTuongDropdownOpen] = useState(false);
  const [isLoaiDropdownOpen, setIsLoaiDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);

  const doiTuongOptions = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'STUDENT', label: 'Sinh viên' },
    { value: 'LECTURER', label: 'Giảng viên' },
  ];

  const loaiThongBaoOptions = [
    { value: 'ThongBao', label: 'Thông báo chung' },
    { value: 'NhacNho', label: 'Nhắc nhở' },
    { value: 'PhanCong', label: 'Phân công' },
    { value: 'ChuyenDi', label: 'Chuyến đi' },
    { value: 'TaiChinh', label: 'Tài chính / Lệ phí' },
    { value: 'CanhBao', label: 'Cảnh báo' },
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await khoaApi.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải thông báo:', err);
    }
  };

  const handleAttachmentSelect = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
    e.target.value = null;
  };

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo');
      return;
    }

    try {
      let fileUrl = null;
      let fileName = null;

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

      const userJson = localStorage.getItem('user');
      const currentUser = userJson ? JSON.parse(userJson)?.user : null;

      await khoaApi.createNotification({
        tieu_de: title.trim(),
        noi_dung: content.trim(),
        doi_tuong_nhan: selectedDoiTuong,
        loai_thong_bao: selectedLoaiThongBao,
        nguoi_gui_id: currentUser?.id,
        file_url: fileUrl,
        file_name: fileName,
      });

      toast.success('Gửi thông báo thành công');
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setSelectedDoiTuong('ALL');
      setSelectedLoaiThongBao('ThongBao');
      setAttachedFile(null);
      fetchNotifications();
    } catch (err) {
      console.error(err);
      setIsUploadingAttachment(false);
      toast.error('Gửi thông báo thất bại');
    }
  };

  const getLoaiBadge = (loai) => {
    switch (loai) {
      case 'NhacNho':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Nhắc nhở</span>;
      case 'PhanCong':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#407F3E]/10 text-[#407F3E] border border-[#407F3E]/20">Phân công</span>;
      case 'ChuyenDi':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">Chuyến đi</span>;
      case 'TaiChinh':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#89B449]/15 text-[#476d01] border border-[#89B449]/30">Tài chính</span>;
      case 'CanhBao':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Cảnh báo</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Thông báo</span>;
    }
  };

  const getDoiTuongBadge = (doiTuong) => {
    switch (doiTuong) {
      case 'STUDENT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Sinh viên</span>;
      case 'LECTURER':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Giảng viên</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#89B449]/15 text-[#407F3E] border border-[#89B449]/25">Tất cả</span>;
    }
  };

  const resolveFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Filter & Pagination logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || 
        (n.tieu_de && n.tieu_de.toLowerCase().includes(q)) ||
        (n.noi_dung && n.noi_dung.toLowerCase().includes(q));
      const matchAudience = selectedFilterDoiTuong === 'ALL' || n.doi_tuong_nhan === selectedFilterDoiTuong;
      const matchType = selectedFilterLoai === 'ALL' || (n.loai_thong_bao || 'ThongBao') === selectedFilterLoai;
      return matchSearch && matchAudience && matchType;
    });
  }, [notifications, searchTerm, selectedFilterDoiTuong, selectedFilterLoai]);

  const totalPages = Math.ceil(filteredNotifications.length / limit) || 1;
  const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Thông báo</h1>
          <p className="text-xs text-slate-500 mt-1">Soạn và phân phối thông báo đến Sinh viên, Giảng viên kèm tài liệu đính kèm</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Soạn thông báo
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[280px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-[#E7E0C4] rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-[#407F3E] text-slate-700 font-medium"
            />
          </div>

          {/* Đối tượng Filter Dropdown */}
          <SearchableDropdown
            options={[
              { value: 'ALL', label: 'Tất cả đối tượng' },
              { value: 'STUDENT', label: 'Sinh viên' },
              { value: 'LECTURER', label: 'Giảng viên' }
            ]}
            value={selectedFilterDoiTuong}
            onChange={(val) => {
              setSelectedFilterDoiTuong(val);
              setCurrentPage(1);
            }}
            placeholder="Tất cả đối tượng"
            searchPlaceholder="Tìm đối tượng..."
            className="w-52 z-30"
          />

          {/* Loại thông báo Filter Dropdown */}
          <SearchableDropdown
            options={[
              { value: 'ALL', label: 'Tất cả loại' },
              ...loaiThongBaoOptions
            ]}
            value={selectedFilterLoai}
            onChange={(val) => {
              setSelectedFilterLoai(val);
              setCurrentPage(1);
            }}
            placeholder="Tất cả loại"
            searchPlaceholder="Tìm loại thông báo..."
            className="w-52 z-30"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 max-w-[380px]">Tiêu đề</th>
                <th className="p-4 text-center w-36">Loại</th>
                <th className="p-4 text-center w-36">Đối tượng</th>
                <th className="p-4 text-center w-36">Tệp đính kèm</th>
                <th className="p-4 text-center w-36">Ngày gửi</th>
                <th className="p-4 text-right pr-6 w-24">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {paginatedNotifications.map(n => {
                const hasFile = n.file_url || n.file_dinh_kem || (n.files && n.files.length > 0);
                const fileName = n.file_dinh_kem || (n.files?.[0]?.ten_file) || 'Tệp đính kèm';
                const fileUrl = n.file_url || (n.files?.[0]?.duong_dan);

                return (
                  <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 max-w-[380px]">
                      <div className="font-bold text-slate-800 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-[#407F3E] mt-0.5 shrink-0" />
                        <span className="line-clamp-2 leading-relaxed">{n.tieu_de}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 pl-6">{n.noi_dung}</p>
                    </td>
                    <td className="p-4 text-center">
                      {getLoaiBadge(n.loai_thong_bao)}
                    </td>
                    <td className="p-4 text-center">
                      {getDoiTuongBadge(n.doi_tuong_nhan)}
                    </td>
                    <td className="p-4 text-center">
                      {hasFile ? (
                        <a 
                          href={resolveFileUrl(fileUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-[#407F3E]/10 hover:text-[#407F3E] text-slate-700 rounded-lg text-xs font-semibold transition-colors max-w-[140px] truncate"
                          title={fileName}
                        >
                          <Paperclip className="w-3.5 h-3.5 shrink-0 text-[#407F3E]" />
                          <span className="truncate">{fileName}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-medium text-slate-600 text-xs">
                      {new Date(n.ngay_gui || n.created_at || new Date()).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
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
                );
              })}
              {filteredNotifications.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">
                    Không có thông báo nào phù hợp điều kiện lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <SearchableDropdown 
              options={[
                { value: 15, label: '15' },
                { value: 30, label: '30' },
                { value: 50, label: '50' },
                { value: 100, label: '100' }
              ]}
              value={limit}
              onChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
              searchPlaceholder="Số hàng..."
              className="min-w-[80px]"
            />
            <span>/ {filteredNotifications.length} thông báo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-3 py-1.5 text-sm font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Soạn thông báo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div 
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#407F3E]" />
                Soạn thông báo mới
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
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar" onClick={() => { setIsDoiTuongDropdownOpen(false); setIsLoaiDropdownOpen(false); }}>
                
                {/* Tiêu đề */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tiêu đề thông báo *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề thông báo..."
                    className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                    required
                  />
                </div>

                {/* Đối tượng & Loại */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-30">
                  {/* Đối tượng nhận */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Đối tượng nhận *</label>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setIsDoiTuongDropdownOpen(!isDoiTuongDropdownOpen); setIsLoaiDropdownOpen(false); }}
                      className={`w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isDoiTuongDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4] hover:border-[#407F3E]'}`}
                    >
                      <span className="font-semibold text-slate-800">
                        {doiTuongOptions.find(o => o.value === selectedDoiTuong)?.label || 'Chọn đối tượng'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    {isDoiTuongDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
                        {doiTuongOptions.map(opt => (
                          <div 
                            key={opt.value}
                            onClick={() => { setSelectedDoiTuong(opt.value); setIsDoiTuongDropdownOpen(false); }}
                            className={`px-4 py-2 text-sm cursor-pointer font-medium transition-colors flex justify-between items-center ${
                              selectedDoiTuong === opt.value ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/40'
                            }`}
                          >
                            {opt.label}
                            {selectedDoiTuong === opt.value && <Check className="w-4 h-4 text-[#407F3E]" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Loại thông báo */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Loại thông báo *</label>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setIsLoaiDropdownOpen(!isLoaiDropdownOpen); setIsDoiTuongDropdownOpen(false); }}
                      className={`w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isLoaiDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4] hover:border-[#407F3E]'}`}
                    >
                      <span className="font-semibold text-slate-800">
                        {loaiThongBaoOptions.find(o => o.value === selectedLoaiThongBao)?.label || 'Chọn loại'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    {isLoaiDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
                        {loaiThongBaoOptions.map(opt => (
                          <div 
                            key={opt.value}
                            onClick={() => { setSelectedLoaiThongBao(opt.value); setIsLoaiDropdownOpen(false); }}
                            className={`px-4 py-2 text-sm cursor-pointer font-medium transition-colors flex justify-between items-center ${
                              selectedLoaiThongBao === opt.value ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/40'
                            }`}
                          >
                            {opt.label}
                            {selectedLoaiThongBao === opt.value && <Check className="w-4 h-4 text-[#407F3E]" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Nội dung */}
                <div className="relative z-10">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nội dung chi tiết *</label>
                  <div className="border border-[#E7E0C4] rounded-xl overflow-hidden bg-slate-50 focus-within:border-[#407F3E] focus-within:ring-1 focus-within:ring-[#407F3E] transition-all">
                    <textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                      placeholder="Nhập nội dung chi tiết thông báo..."
                      className="w-full p-4 bg-transparent text-sm focus:outline-none text-slate-800 resize-none font-medium leading-relaxed"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Tệp đính kèm */}
                <div className="relative z-0">
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
                      <p className="text-xs font-medium text-slate-400">Hỗ trợ định dạng: PDF, DOCX, XLSX, Ảnh (Tối đa 10MB)</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end rounded-b-2xl">
                <button 
                  type="submit"
                  disabled={isUploadingAttachment}
                  className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploadingAttachment ? 'Đang tải file...' : 'Gửi thông báo ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Xem chi tiết */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setViewingDetail(null)}
          ></div>
          
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#407F3E]" />
                Chi tiết thông báo
              </h2>
              <button 
                type="button"
                onClick={() => setViewingDetail(null)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap gap-2 items-center">
                {getLoaiBadge(viewingDetail.loai_thong_bao)}
                {getDoiTuongBadge(viewingDetail.doi_tuong_nhan)}
                <span className="text-xs text-slate-400 ml-auto font-medium">
                  {new Date(viewingDetail.ngay_gui || viewingDetail.created_at || new Date()).toLocaleString('vi-VN')}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-snug">{viewingDetail.tieu_de}</h3>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                {viewingDetail.noi_dung}
              </div>

              {/* Tệp đính kèm */}
              {(viewingDetail.file_url || viewingDetail.file_dinh_kem || (viewingDetail.files && viewingDetail.files.length > 0)) && (
                <div className="border border-[#E7E0C4] bg-[#E7E0C4]/15 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#407F3E] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tệp đính kèm</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {viewingDetail.file_dinh_kem || viewingDetail.files?.[0]?.ten_file || 'Tài liệu đính kèm'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={resolveFileUrl(viewingDetail.file_url || viewingDetail.files?.[0]?.duong_dan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải về / Xem
                  </a>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end rounded-b-2xl">
              <button 
                type="button"
                onClick={() => setViewingDetail(null)}
                className="px-6 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
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
