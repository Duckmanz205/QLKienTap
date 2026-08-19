import React, { useState } from 'react';
import { 
  Bell, FileText, CheckCircle2, AlertTriangle, 
  Paperclip, Clock, Trash2, Check
} from 'lucide-react';

export default function ThongBao_GV() {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' or 'unread'

  const mockNotifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Nhắc nhở: Sinh viên trễ hạn nộp bài',
      preview: 'Có 3 sinh viên thuộc nhóm hướng dẫn của bạn (Nguyễn Văn An, Lê Hoàng Cường...) vẫn chưa nộp bài báo cáo thu hoạch chuyến đi Yakult HCM. Hạn chót là 12:00 ngày hôm nay.',
      time: '10 phút trước',
      isRead: false,
      hasAttachment: false
    },
    {
      id: 2,
      type: 'assignment',
      title: 'Phân công Hội đồng chấm báo cáo TQNM',
      preview: 'Bạn đã được phân công tham gia Hội đồng Báo cáo TQNM Nhóm 1. Thời gian: 08:00 ngày 25/09/2026. Địa điểm: B.301. Vui lòng xem quyết định đính kèm.',
      time: '2 giờ trước',
      isRead: false,
      hasAttachment: true,
      attachmentName: 'QuyetDinh_ThanhLapHoiDong.pdf'
    },
    {
      id: 3,
      type: 'success',
      title: 'Sinh viên đã nộp bài thu hoạch',
      preview: 'Sinh viên Trần Thị Bình (2022220002) vừa nộp bài báo cáo thu hoạch. Vui lòng truy cập trang Sinh viên hướng dẫn để xem và chấm điểm.',
      time: 'Hôm qua',
      isRead: true,
      hasAttachment: false
    },
    {
      id: 4,
      type: 'system',
      title: 'Kế hoạch tổ chức kiến tập Học kỳ 1 - 2026',
      preview: 'Khoa CN Thực phẩm thông báo kế hoạch tổ chức chuyến tham quan kiến tập cho học kỳ 1 năm học 2026-2027. Các GV vui lòng đăng ký lịch dẫn đoàn.',
      time: '3 ngày trước',
      isRead: true,
      hasAttachment: true,
      attachmentName: 'KeHoach_KienTap_HK1.pdf'
    }
  ];

  const filteredNotifications = mockNotifications.filter(
    n => activeFilter === 'all' || (activeFilter === 'unread' && !n.isRead)
  );

  const getIcon = (type) => {
    switch(type) {
      case 'warning': return <div className="w-10 h-10 rounded-full bg-[#DBD468]/20 text-[#8b8433] flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5" /></div>;
      case 'assignment': return <div className="w-10 h-10 rounded-full bg-[#407F3E]/10 text-[#407F3E] flex items-center justify-center shrink-0"><FileText className="w-5 h-5" /></div>;
      case 'success': return <div className="w-10 h-10 rounded-full bg-[#89B449]/20 text-[#476d01] flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5" /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><Bell className="w-5 h-5" /></div>;
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      
      <div className="max-w-4xl mx-auto">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#407F3E]" /> Thông báo
            </h1>
            
            {/* Filter Pills */}
            <div className="flex bg-[#E7E0C4]/50 p-1 rounded-lg border border-[#E7E0C4]">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeFilter === 'all' ? 'bg-[#407F3E] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setActiveFilter('unread')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'unread' ? 'bg-[#407F3E] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Chưa đọc
                <span className="w-4 h-4 rounded-full bg-[#DBD468] text-slate-800 text-[9px] flex items-center justify-center">2</span>
              </button>
            </div>
          </div>

          <button className="text-xs font-bold text-slate-500 hover:text-[#407F3E] transition-colors flex items-center gap-1">
            <Check className="w-4 h-4" /> Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Notifications Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#E7E0C4]/30 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-700 font-bold">Không có thông báo nào.</h3>
              <p className="text-sm text-slate-500 mt-1">Bạn đã cập nhật tất cả thông tin mới nhất.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredNotifications.map((notif, index) => (
                <div 
                  key={notif.id} 
                  className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 group ${
                    index !== filteredNotifications.length - 1 ? 'border-b border-[#E7E0C4]/60' : ''
                  } ${!notif.isRead ? 'bg-[#fdfcf8]' : 'opacity-70 hover:opacity-100'}`}
                >
                  
                  {/* Unread Indicator & Icon */}
                  <div className="relative shrink-0">
                    {!notif.isRead && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#DBD468] rounded-full border-2 border-white shadow-sm z-10"></div>
                    )}
                    {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-1 mb-1">
                      <h3 className={`text-sm truncate pr-4 ${!notif.isRead ? 'font-black text-slate-800' : 'font-bold text-slate-700'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {notif.time}
                      </span>
                    </div>
                    
                    <p className={`text-xs line-clamp-2 leading-relaxed mb-3 ${!notif.isRead ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                      {notif.preview}
                    </p>

                    {/* Attachment Chip */}
                    {notif.hasAttachment && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7E0C4]/30 hover:bg-[#E7E0C4] border border-[#E7E0C4] rounded-lg cursor-pointer transition-colors w-fit">
                        <Paperclip className="w-3.5 h-3.5 text-[#407F3E]" />
                        <span className="text-[11px] font-bold text-slate-700">{notif.attachmentName}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions (Hover) */}
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                    <button className="p-2 text-slate-300 hover:text-[#E68A8C] hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Xóa thông báo">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
