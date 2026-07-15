import React, { useState, useEffect } from 'react';
import { sinhVienApi } from '../../services/api';

export default function ThongBao_SV() {
  const [student, setStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeNotif, setActiveNotif] = useState(null);

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
    setActiveNotif(item);
    if (!item.da_doc) {
      try {
        const userJson = localStorage.getItem('user');
        const { user } = JSON.parse(userJson);
        await sinhVienApi.markNotificationRead(user.id, item.id);
        fetchNotifications(student.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!student) return <div className="text-slate-600 font-medium">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Thông báo từ Khoa</h2>
        <p className="text-slate-500 text-sm">Xem và đọc các thông báo chính thức liên quan đến học phần Kiến tập</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notifications List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 h-[600px] overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Danh sách thông báo</h3>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-slate-500 text-xs">Chưa có thông báo nào.</p>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleRead(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    activeNotif?.id === item.id ? 'border-[#407F3E] bg-[#407F3E]/5' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-xs font-semibold ${item.da_doc ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>
                      {item.tieu_de}
                    </h4>
                    {!item.da_doc && (
                      <span className="w-2.5 h-2.5 bg-[#DBD468] rounded-full shrink-0 mt-0.5 shadow-sm"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {new Date(item.ngay_gui).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notification Detail */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 min-h-[400px]">
          {activeNotif ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">{activeNotif.tieu_de}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Đăng lúc: {new Date(activeNotif.ngay_gui).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
                {activeNotif.noi_dung}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
              <span className="material-symbols-outlined text-4xl mb-2">mark_as_unread</span>
              Chọn một thông báo ở danh sách bên trái để đọc chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
