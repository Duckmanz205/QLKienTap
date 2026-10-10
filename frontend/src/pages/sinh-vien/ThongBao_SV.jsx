import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, FileText, CheckCircle, AlertCircle, Paperclip, 
  CreditCard, Compass, Search, ChevronDown, Check
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function ThongBao_SV() {
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [student, setStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);

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

  const handleRead = async (item) => {
    if (!item.da_doc) {
      try {
        await sinhVienApi.markNotificationRead(item.id);
        fetchNotifications(student.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        (n.tieu_de && n.tieu_de.toLowerCase().includes(q)) ||
        (n.noi_dung && n.noi_dung.toLowerCase().includes(q));
      const matchFilter = filter === 'all' || (filter === 'unread' && !n.da_doc);
      const matchType = selectedType === 'ALL' || n.type === selectedType;
      return matchSearch && matchFilter && matchType;
    });
  }, [notifications, searchQuery, filter, selectedType]);

  const totalPages = Math.ceil(filteredNotifications.length / limit) || 1;
  const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * limit, currentPage * limit);

  const unreadCount = notifications.filter(n => !n.da_doc).length;

  const getIconForType = (type) => {
    switch (type) {
      case 'reminder':
        return <AlertCircle className="w-5 h-5 text-indigo-500" />;
      case 'financial':
        return <CreditCard className="w-5 h-5 text-[#89B449]" />;
      case 'trip':
        return <Compass className="w-5 h-5 text-[#407F3E]" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-[#E68A8C]" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'reminder':
        return 'bg-indigo-50 border-indigo-100';
      case 'financial':
        return 'bg-[#89B449]/10 border-[#89B449]/20';
      case 'trip':
        return 'bg-[#407F3E]/10 border-[#407F3E]/20';
      case 'alert':
        return 'bg-[#E68A8C]/10 border-[#E68A8C]/20';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 flex justify-center relative" onClick={() => setIsTypeDropdownOpen(false)}>
      
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#407F3E]" /> Thông báo
          </h1>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center justify-between relative z-20">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm theo tiêu đề, nội dung..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all text-slate-800 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex bg-[#E7E0C4]/50 p-1 rounded-lg border border-[#E7E0C4]">
              <button 
                onClick={() => {
                  setFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  filter === 'all' ? 'bg-[#407F3E] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => {
                  setFilter('unread');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filter === 'unread' ? 'bg-[#407F3E] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Chưa đọc
                {unreadCount > 0 && <span className="w-4 h-4 rounded-full bg-[#DBD468] text-slate-800 text-[9px] flex items-center justify-center">{unreadCount}</span>}
              </button>
            </div>

            {/* Type Popover Dropdown */}
            {/* Type Popover Dropdown */}
            <SearchableDropdown
              options={[
                { value: 'ALL', label: 'Tất cả loại' },
                { value: 'reminder', label: 'Nhắc nhở' },
                { value: 'financial', label: 'Tài chính / Lệ phí' },
                { value: 'trip', label: 'Chuyến đi' },
                { value: 'alert', label: 'Cảnh báo' },
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
              {paginatedNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleRead(notif)}
                  className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 cursor-pointer ${
                    !notif.da_doc ? 'bg-[#E7E0C4]/10' : 'bg-white'
                  }`}
                >
                  {/* Unread Dot */}
                  <div className="pt-2 shrink-0 flex items-center justify-center w-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${!notif.da_doc ? 'bg-[#DBD468]' : 'bg-transparent'}`}></div>
                  </div>

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${getIconBg(notif.type)}`}>
                    {getIconForType(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className={`text-base leading-tight pr-4 ${!notif.da_doc ? 'font-black text-slate-800' : 'font-bold text-slate-700'}`}>
                        {notif.tieu_de}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                        {new Date(notif.ngay_gui).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    
                    <p className={`text-sm leading-relaxed ${!notif.da_doc ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                      {notif.noi_dung}
                    </p>

                    {/* Attachment Chip */}
                    {notif.file_dinh_kem && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:border-[#407F3E] hover:bg-[#407F3E]/5 hover:text-[#407F3E] transition-colors w-fit">
                        <Paperclip className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{notif.file_dinh_kem}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                searchPlaceholder="Tìm số lượng..."
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
    </div>
  );
}
