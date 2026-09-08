import React, { useState, useEffect } from 'react';
import { 
  Bell, FileText, CheckCircle, AlertCircle, Paperclip, 
  CreditCard, Compass
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function ThongBao_SV() {
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
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
      setNotifications(res.data);
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
    // You can also add modal or expanded state here if you want to show full details
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.da_doc) 
    : notifications;

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
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 flex justify-center">
      
      <div className="w-full max-w-4xl">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Thông báo</h1>
          
          <div className="flex bg-[#E7E0C4]/50 p-1 rounded-full border border-[#E7E0C4]">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === 'all' ? 'bg-[#89B449] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === 'unread' ? 'bg-[#89B449] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Chưa đọc
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden flex flex-col">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-12 h-12 text-[#89B449] mb-3 opacity-80" />
              <p className="text-slate-800 font-bold text-lg">Tuyệt vời!</p>
              <p className="text-slate-500 font-medium text-sm mt-1">Bạn đã đọc hết tất cả thông báo.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E7E0C4]/70">
              {filteredNotifications.map((notif) => (
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
        </div>
      </div>
    </div>
  );
}
