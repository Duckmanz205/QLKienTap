import React, { useState } from 'react';
import { 
  MapPin, Laptop, Calendar, Clock, Image as ImageIcon, Users
} from 'lucide-react';

export default function ChuyenThamQuan_DanhSachDangKy() {
  const [activeTab, setActiveTab] = useState('coTheDangKy');

  // Mock Data
  const availableTrips = [
    {
      id: 1,
      nhaMay: 'Nhà máy Yakult HCM',
      ngayThamQuan: '10/09/2026',
      gioBatDau: '08:00',
      gioKetThuc: '11:00',
      hinhThuc: 'Trực tiếp',
      conTrong: 15
    },
    {
      id: 2,
      nhaMay: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)',
      ngayThamQuan: '15/09/2026',
      gioBatDau: '13:00',
      gioKetThuc: '16:00',
      hinhThuc: 'Trực tuyến',
      conTrong: 120
    },
    {
      id: 3,
      nhaMay: 'Tập đoàn C.P Việt Nam',
      ngayThamQuan: '20/09/2026',
      gioBatDau: '08:00',
      gioKetThuc: '12:00',
      hinhThuc: 'Trực tiếp',
      conTrong: 5
    },
    {
      id: 4,
      nhaMay: 'Acecook Việt Nam',
      ngayThamQuan: '25/09/2026',
      gioBatDau: '14:00',
      gioKetThuc: '17:00',
      hinhThuc: 'Trực tiếp',
      conTrong: 20
    }
  ];

  const registeredTrips = [
    {
      id: 101,
      nhaMay: 'Nhà máy Ajinomoto Biên Hòa',
      ngayThamQuan: '05/09/2026',
      hinhThuc: 'Trực tiếp',
      trangThai: 'Chờ duyệt',
      canCancel: true
    },
    {
      id: 102,
      nhaMay: 'Heineken Việt Nam',
      ngayThamQuan: '01/09/2026',
      hinhThuc: 'Trực tiếp',
      trangThai: 'Hợp lệ',
      canCancel: false
    },
    {
      id: 103,
      nhaMay: 'KIDO Group',
      ngayThamQuan: '15/08/2026',
      hinhThuc: 'Trực tuyến',
      trangThai: 'Đã tham gia',
      canCancel: false
    },
    {
      id: 104,
      nhaMay: 'Nestlé Trị An',
      ngayThamQuan: '10/08/2026',
      hinhThuc: 'Trực tiếp',
      trangThai: 'Đã hủy',
      canCancel: false
    },
    {
      id: 105,
      nhaMay: 'Suntory PepsiCo',
      ngayThamQuan: '05/08/2026',
      hinhThuc: 'Trực tiếp',
      trangThai: 'Vắng mặt',
      canCancel: false
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ duyệt':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Hợp lệ':
      case 'Đã tham gia':
      case 'Hoàn thành':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Bị loại':
      case 'Vắng mặt':
      case 'Không đạt':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status}</span>;
      case 'Đã hủy':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Chuyến tham quan</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7E0C4] mb-8">
        <button
          onClick={() => setActiveTab('coTheDangKy')}
          className={`px-6 py-3 font-bold text-sm transition-colors relative cursor-pointer ${
            activeTab === 'coTheDangKy' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Có thể đăng ký
          {activeTab === 'coTheDangKy' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] animate-in slide-in-from-left-4"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('daDangKy')}
          className={`px-6 py-3 font-bold text-sm transition-colors relative cursor-pointer ${
            activeTab === 'daDangKy' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Đã đăng ký
          {activeTab === 'daDangKy' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] animate-in slide-in-from-right-4"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('deXuatTuDo')}
          className={`px-6 py-3 font-bold text-sm transition-colors relative cursor-pointer ${
            activeTab === 'deXuatTuDo' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Đề xuất chuyến đi tự do
          {activeTab === 'deXuatTuDo' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] animate-in slide-in-from-right-4"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="relative z-10">
        
        {/* TAB 1: Có thể đăng ký */}
        {activeTab === 'coTheDangKy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {availableTrips.map(trip => {
              const isOnline = trip.hinhThuc === 'Trực tuyến';
              return (
                <div key={trip.id} className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
                  {/* Image Placeholder */}
                  <div className="h-40 bg-slate-100 flex items-center justify-center border-b border-[#E7E0C4] relative overflow-hidden group-hover:bg-[#89B449]/5 transition-colors">
                    <ImageIcon className="w-10 h-10 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                        isOnline ? 'bg-slate-800 text-white' : 'bg-[#E7E0C4] text-slate-800'
                      }`}>
                        {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {trip.hinhThuc}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 mb-4 line-clamp-2 leading-tight group-hover:text-[#407F3E] transition-colors">{trip.nhaMay}</h3>
                    
                    <div className="space-y-3 mb-6 mt-auto">
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-slate-400" />
                        </div>
                        {trip.ngayThamQuan}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-slate-400" />
                        </div>
                        {trip.gioBatDau} - {trip.gioKetThuc}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 text-[#89B449]" />
                        </div>
                        Còn <span className="font-bold text-[#89B449]">{trip.conTrong}</span> chỗ
                      </div>
                    </div>

                    <button className="w-full py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer">
                      Đăng ký
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Đã đăng ký */}
        {activeTab === 'daDangKy' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                    <th className="p-4 pl-6 min-w-[250px]">Nhà máy</th>
                    <th className="p-4 min-w-[150px]">Ngày tham quan</th>
                    <th className="p-4 text-center">Hình thức</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right pr-6 min-w-[120px]">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                  {registeredTrips.map(trip => {
                    const isOnline = trip.hinhThuc === 'Trực tuyến';
                    return (
                      <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-800">{trip.nhaMay}</td>
                        <td className="p-4 font-medium text-slate-600">{trip.ngayThamQuan}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            isOnline ? 'bg-slate-100 text-slate-600' : 'bg-[#89B449]/10 text-[#407F3E]'
                          }`}>
                            {isOnline ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {trip.hinhThuc}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(trip.trangThai)}
                        </td>
                        <td className="p-4 text-right pr-6">
                          {trip.canCancel ? (
                            <button className="text-xs font-bold text-[#E68A8C] hover:text-[#E68A8C]/70 hover:underline transition-colors cursor-pointer">
                              Hủy đăng ký
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-slate-300 italic">Không thể hủy</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Đề xuất chuyến đi tự do */}
        {activeTab === 'deXuatTuDo' && (
          <div className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm p-6 lg:p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-[#E7E0C4] pb-4">Biểu mẫu Đề xuất Sinh viên đi tự do</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Tên doanh nghiệp / Đơn vị tiếp nhận <span className="text-[#E68A8C]">*</span></label>
                  <input type="text" placeholder="Nhập tên doanh nghiệp..." className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Địa chỉ <span className="text-[#E68A8C]">*</span></label>
                  <input type="text" placeholder="Nhập địa chỉ đầy đủ..." className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Họ tên người liên hệ <span className="text-[#E68A8C]">*</span></label>
                  <input type="text" placeholder="Người phụ trách tại DN" className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Số điện thoại liên hệ <span className="text-[#E68A8C]">*</span></label>
                  <input type="tel" placeholder="09xxxxxxx" className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Ngày dự kiến tham quan <span className="text-[#E68A8C]">*</span></label>
                  <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium" />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E7E0C4] flex justify-end">
                <button type="button" className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer">
                  Gửi đề xuất
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
