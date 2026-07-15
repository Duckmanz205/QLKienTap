import React, { useState, useEffect } from 'react';
import { Bell, Search, RefreshCw, MailOpen, Mail } from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function ThongBao_GV() {
  const [lecturer, setLecturer] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      tieu_de: 'Phân công hội đồng chấm báo cáo kiến tập Học kỳ 1',
      ngay_gui: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      da_doc: false,
      noi_dung: 'Kính gửi quý Thầy/Cô,\n\nKhoa đã hoàn thành phân công hội đồng chấm báo cáo kiến tập cho Học kỳ 1, Năm học 2025-2026. Kính mời quý Thầy/Cô truy cập phân hệ Giảng viên -> Hội đồng chấm báo cáo để kiểm tra danh sách sinh viên và nhập điểm.\n\nTrân trọng cảm ơn.'
    },
    {
      id: 2,
      tieu_de: 'Thông báo hạn cuối chấm bài thu hoạch kiến tập',
      ngay_gui: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      da_doc: false,
      noi_dung: 'Kính gửi quý Thầy/Cô,\n\nHạn cuối để hoàn thành việc chấm điểm bài thu hoạch kiến tập trên hệ thống là ngày 30/11/2025. Quý Thầy/Cô vui lòng đôn đốc sinh viên nộp bài đúng hạn và tiến hành chấm điểm sớm.\n\nMọi thắc mắc xin vui lòng liên hệ Văn phòng Khoa để được hỗ trợ.'
    },
    {
      id: 3,
      tieu_de: 'Triển khai đợt kiến tập nhà máy Acecook Việt Nam',
      ngay_gui: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      da_doc: true,
      noi_dung: 'Kính gửi quý Thầy/Cô,\n\nKhoa triển khai đợt tham quan kiến tập thực tế tại Nhà máy Acecook Việt Nam cho sinh viên khóa 12. Danh sách phân công giảng viên dẫn đoàn đã được cập nhật. Kính đề nghị quý Thầy/Cô có tên trong danh sách chủ động liên hệ trưởng đoàn để chuẩn bị công tác dẫn đoàn tốt nhất.'
    }
  ]);
  const [activeNotif, setActiveNotif] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
      }).catch(err => console.error(err));
    }
    setActiveNotif(notifications[0]);
  }, []);

  const handleRead = (item) => {
    setActiveNotif(item);
    setNotifications(prev => 
      prev.map(n => n.id === item.id ? { ...n, da_doc: true } : n)
    );
  };

  if (!lecturer) return <div className="text-slate-600 font-medium">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Thông báo của Giảng viên</h2>
        <p className="text-slate-500 text-sm">Xem và theo dõi các thông báo, quyết định phân công từ Khoa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notifications List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 h-[600px] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800">Danh sách thông báo</h3>
            <span className="bg-red-100 text-red-650 font-bold text-[10px] px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.da_doc).length} chưa đọc
            </span>
          </div>
          
          <div className="space-y-3">
            {notifications.map(item => (
              <div
                key={item.id}
                onClick={() => handleRead(item)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  activeNotif?.id === item.id 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-2">
                    {item.da_doc ? (
                      <MailOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    )}
                    <h4 className={`text-xs font-bold ${item.da_doc ? 'text-slate-600' : 'text-slate-900'}`}>
                      {item.tieu_de}
                    </h4>
                  </div>
                  {!item.da_doc && (
                    <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1"></span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1 pl-6">
                  {new Date(item.ngay_gui).toLocaleDateString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Detail */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 min-h-[400px]">
          {activeNotif ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{activeNotif.tieu_de}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Đăng lúc: {new Date(activeNotif.ngay_gui).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${activeNotif.da_doc ? 'bg-slate-100 text-slate-600' : 'bg-primary/10 text-primary'}`}>
                  {activeNotif.da_doc ? 'Đã đọc' : 'Mới'}
                </span>
              </div>
              <div className="text-slate-650 text-sm whitespace-pre-line leading-relaxed">
                {activeNotif.noi_dung}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-20">
              <Bell className="w-10 h-10 mb-2 text-slate-300" />
              Chọn một thông báo ở danh sách bên trái để đọc chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
