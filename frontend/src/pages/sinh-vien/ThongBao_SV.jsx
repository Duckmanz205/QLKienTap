import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, FileText, CheckCircle, AlertCircle, Paperclip, 
  CreditCard, Compass, Search, ChevronDown, Check,
  Download, X, Clock, User
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function ThongBao_SV() {
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [student, setStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [viewingDetail, setViewingDetail] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchNotifications(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchNotifications = async (svId) => {
    try {
      const res = await sinhVienApi.getNotifications(svId);
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardClick = (notif) => {
    setViewingDetail(notif);
  };

  const resolveFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        (n.tieu_de && n.tieu_de.toLowerCase().includes(q)) ||
        (n.noi_dung && n.noi_dung.toLowerCase().includes(q));
      const nType = n.loai_thong_bao || n.type || 'ThongBao';
      const matchType = selectedType === 'ALL' || nType === selectedType;
      return matchSearch && matchType;
    });
  }, [notifications, searchQuery, selectedType]);

  const totalPages = Math.ceil(filteredNotifications.length / limit) || 1;
  const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * limit, currentPage * limit);

  const getIconForType = (type) => {
    switch (type) {
      case 'NhacNho':
      case 'reminder':
        return <AlertCircle className="w-5 h-5 text-indigo-500" />;
      case 'TaiChinh':
      case 'financial':
        return <CreditCard className="w-5 h-5 text-[#89B449]" />;
      case 'ChuyenDi':
      case 'trip':
        return <Compass className="w-5 h-5 text-[#407F3E]" />;
      case 'CanhBao':
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-[#E68A8C]" />;
      case 'PhanCong':
        return <FileText className="w-5 h-5 text-[#407F3E]" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'NhacNho':
      case 'reminder':
        return 'bg-indigo-50 border-indigo-100';
      case 'TaiChinh':
      case 'financial':
        return 'bg-[#89B449]/10 border-[#89B449]/20';
      case 'ChuyenDi':
      case 'trip':
        return 'bg-[#407F3E]/10 border-[#407F3E]/20';
      case 'CanhBao':
      case 'alert':
        return 'bg-[#E68A8C]/10 border-[#E68A8C]/20';
      case 'PhanCong':
        return 'bg-[#407F3E]/10 border-[#407F3E]/20';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'NhacNho':
      case 'reminder':
        return 'Nhắc nhở';
      case 'TaiChinh':
      case 'financial':
        return 'Tài chính / Lệ phí';
      case 'ChuyenDi':
      case 'trip':
        return 'Chuyến đi';
      case 'CanhBao':
      case 'alert':
        return 'Cảnh báo';
      case 'PhanCong':
        return 'Phân công';
      default:
        return 'Thông báo chung';
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 flex justify-center relative">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#407F3E]" /> Thông báo sinh viên
            </h1>
            <p className="text-xs text-slate-500 mt-1">Cập nhật tin tức, lịch trình chuyến đi và các lưu ý từ Khoa / CLB</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center justify-between relative z-20">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm thông báo..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-[#E7E0C4] rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-[#407F3E] text-slate-700 font-medium"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Type Popover Dropdown */}
            <SearchableDropdown
              options={[
                { value: 'ALL', label: 'Tất cả loại' },
                { value: 'ThongBao', label: 'Thông báo chung' },
                { value: 'NhacNho', label: 'Nhắc nhở' },
                { value: 'PhanCong', label: 'Phân công' },
                { value: 'ChuyenDi', label: 'Chuyến đi' },
                { value: 'TaiChinh', label: 'Tài chính / Lệ phí' },
                { value: 'CanhBao', label: 'Cảnh báo' },
              ]}
              value={selectedType}
              onChange={(val) => {
                setSelectedType(val);
                setCurrentPage(1);
              }}
              placeholder="Tất cả loại"
              searchPlaceholder="Tìm loại..."
              className="min-w-[170px]"
            />
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden flex flex-col">
          {paginatedNotifications.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-12 h-12 text-[#89B449] mb-3 opacity-80" />
              <p className="text-slate-800 font-bold text-lg">Không có thông báo phù hợp.</p>
              <p className="text-slate-500 font-medium text-sm mt-1">Không tìm thấy thông báo nào khớp với điều kiện lọc.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E7E0C4]/70">
              {paginatedNotifications.map((notif) => {
                const notifType = notif.loai_thong_bao || notif.type || 'ThongBao';
                const hasFile = notif.file_url || notif.file_dinh_kem || (notif.files && notif.files.length > 0);
                const fileName = notif.file_dinh_kem || notif.files?.[0]?.ten_file || 'Tệp đính kèm';
                const fileUrl = notif.file_url || notif.files?.[0]?.duong_dan;

                return (
                  <div 
                    key={notif.id} 
                    onClick={() => handleCardClick(notif)}
                    className="p-5 flex gap-4 transition-colors hover:bg-slate-50 cursor-pointer bg-white"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${getIconBg(notifType)}`}>
                      {getIconForType(notifType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 inline-block">
                            {getTypeLabel(notifType)}
                          </span>
                          <h3 className="text-base leading-tight pr-4 font-bold text-slate-800">
                            {notif.tieu_de}
                          </h3>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                          {new Date(notif.ngay_gui || notif.created_at || new Date()).toLocaleString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm leading-relaxed line-clamp-2 text-slate-600 font-normal">
                        {notif.noi_dung}
                      </p>

                      {/* Attachment Chip */}
                      {hasFile && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(resolveFileUrl(fileUrl), '_blank');
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:border-[#407F3E] hover:bg-[#407F3E]/5 hover:text-[#407F3E] transition-colors w-fit"
                          title="Bấm để tải về hoặc xem tệp"
                        >
                          <Paperclip className="w-3.5 h-3.5 shrink-0 text-[#407F3E]" />
                          <span className="truncate max-w-[200px] sm:max-w-xs">{fileName}</span>
                          <Download className="w-3 h-3 shrink-0 ml-1 opacity-70" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
              <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                Trang {currentPage} / {totalPages}
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
      </div>

      {/* Modal - Xem chi tiết thông báo */}
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
                <Bell className="w-5 h-5 text-[#407F3E]" />
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#407F3E]/10 text-[#407F3E] border border-[#407F3E]/20">
                  {getTypeLabel(viewingDetail.loai_thong_bao || viewingDetail.type)}
                </span>
                <span className="text-xs text-slate-400 ml-auto font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(viewingDetail.ngay_gui || viewingDetail.created_at || new Date()).toLocaleString('vi-VN')}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-snug">{viewingDetail.tieu_de}</h3>
                {viewingDetail.nguoi_gui && (
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Người gửi: {viewingDetail.nguoi_gui}
                  </p>
                )}
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
