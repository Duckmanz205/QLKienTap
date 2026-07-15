import React from 'react';
import { BarChart3, ArrowLeft, Building2, CheckCircle, Clock, XCircle, FileSpreadsheet, Sparkles, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const initialTripDetails = [
  { id: 'CTQ-001', name: 'Kiến tập Hệ thống dây chuyền sữa', factory: 'Nhà máy Vinamilk Bình Dương', date: '15/10/2023', registeredCount: 120, actualCount: 118, status: 'Đã hoàn thành' },
  { id: 'CTQ-002', name: 'Khảo sát Quy trình Đóng gói Mì', factory: 'Acecook Hồ Chí Minh', date: '18/10/2023', registeredCount: 80, actualCount: 80, status: 'Đã hoàn thành' },
  { id: 'CTQ-003', name: 'Kiến tập Quy trình Lên men & Đóng chai', factory: 'Nhà máy Suntory Pepsico', date: '22/10/2023', registeredCount: 150, actualCount: 142, status: 'Đang diễn ra' },
  { id: 'CTQ-004', name: 'Tham quan Trung tâm Nghiên cứu Phần mềm', factory: 'FPT Software Campus', date: '25/10/2023', registeredCount: 200, actualCount: '-', status: 'Đang diễn ra' },
  { id: 'CTQ-005', name: 'Hệ thống phân phối Co.opmart', factory: 'Saigon Co.op', date: '25/10/2023', registeredCount: 60, actualCount: 12, status: 'Đã hủy' }
];

const factoriesData = [
  { name: 'Nhà máy CP Việt Nam', count: 120, percentage: 34, color: 'bg-primary' },
  { name: 'Acecook Hồ Chí Minh', count: 80, percentage: 23, color: 'bg-[#446900]' },
  { name: 'Nhà máy Ajinomoto', count: 150, percentage: 43, color: 'bg-[#2c6b2d]' }
];

export default function XemTruocBaoCaoThamQuan_Khoa() {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    if (status === 'Đã hoàn thành') return 'bg-[#dce8c4] text-[#446900] border border-[#89B449]';
    if (status === 'Đang diễn ra') return 'bg-amber-50 text-amber-800 border border-amber-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };
  const getStatusIcon = (status) => {
    if (status === 'Đã hoàn thành') return <CheckCircle className="w-3.5 h-3.5 text-[#446900]" />;
    if (status === 'Đang diễn ra') return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/khoa/reports')} className="p-2 bg-white border border-slate-200 hover:border-primary text-slate-500 hover:text-primary rounded-xl transition-all cursor-pointer shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">Tổng hợp dữ liệu tham quan</h1>
            <p className="text-sm text-slate-500">Thống kê phân bổ sinh viên đăng ký tham quan thực tế tại các nhà máy.</p>
          </div>
        </div>
        <button onClick={() => alert('Xuất Excel...')} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#2c6b2d] text-white rounded-xl text-sm font-semibold shadow-sm cursor-pointer self-start">
          <FileSpreadsheet className="w-4 h-4" /><span>Xuất Excel thống kê</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-primary"><Award className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng SV tham gia</p><h3 className="text-2xl font-black text-slate-800">120 sinh viên</h3></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Building2 className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng số chuyến đi</p><h3 className="text-2xl font-black text-slate-800">5 chuyến kiến tập</h3></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600"><CheckCircle className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đã hoàn thành</p><h3 className="text-2xl font-black text-slate-800">3 chuyến</h3></div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2 flex flex-col gap-6">
          <div><h3 className="font-extrabold text-slate-800 text-base">Phân bổ sinh viên theo nhà máy</h3><p className="text-xs text-slate-400 font-semibold">Tỷ lệ phân phối dựa trên lượt đăng ký</p></div>
          <div className="space-y-5 flex-1 flex flex-col justify-center py-4">
            {factoriesData.map(f => (
              <div key={f.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-2"><span className={`w-3 h-3 rounded ${f.color}`}></span>{f.name}</span>
                  <span className="font-mono">{f.count} SV ({f.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden shadow-inner">
                  <div className={`h-full ${f.color} rounded-lg transition-all duration-1000`} style={{ width: `${f.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#E7E0C4]/60 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /><h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Đánh giá chung</h3></div>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">Nhà máy <b>Ajinomoto</b> nhận được sự quan tâm lớn nhất với <b>43%</b> (150 SV).</p>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">Chuyến đi <b>Vinamilk Bình Dương</b> đạt tỉ lệ tham gia cao nhất: <b>118/120</b> SV.</p>
          </div>
          <div className="pt-4 border-t border-slate-300">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cập nhật lúc: 15/10/2023 - 17:30</span>
          </div>
        </div>
      </div>

      {/* Trip Details Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-extrabold text-slate-800 text-base">Chi tiết các chuyến tham quan thực tế</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Bảng liệt kê danh sách hành trình và tỉ lệ có mặt</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-12 text-center">STT</th><th className="px-6 py-4">Mã chuyến</th><th className="px-6 py-4">Tên chuyến</th><th className="px-6 py-4">Nhà máy</th><th className="px-6 py-4">Ngày</th><th className="px-6 py-4 text-center">Đăng ký</th><th className="px-6 py-4 text-center">Thực tế</th><th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-sm font-semibold">
              {initialTripDetails.map((trip, idx) => (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-center text-slate-400 font-mono">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-4 font-mono font-bold text-primary">{trip.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{trip.name}</td>
                  <td className="px-6 py-4 text-slate-500">{trip.factory}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 font-mono">{trip.date}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-600">{trip.registeredCount} SV</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-800 bg-slate-50/30">{trip.actualCount}{trip.actualCount !== '-' ? ' SV' : ''}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(trip.status)}`}>{getStatusIcon(trip.status)}<span>{trip.status}</span></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
