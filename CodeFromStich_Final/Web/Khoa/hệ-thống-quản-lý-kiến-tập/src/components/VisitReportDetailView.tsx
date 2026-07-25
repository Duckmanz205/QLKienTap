import React from 'react';
import { 
  BarChart3, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileSpreadsheet, 
  Sparkles,
  Award
} from 'lucide-react';
import { TripDetail } from '../types';

interface VisitReportDetailViewProps {
  trips: TripDetail[];
  setView: (view: string) => void;
}

export default function VisitReportDetailView({ trips, setView }: VisitReportDetailViewProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đã hoàn thành':
        return 'bg-secondary-container-green text-on-secondary-container-green border border-secondary';
      case 'Đang diễn ra':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      default:
        return 'bg-red-50 text-red-700 border border-red-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đã hoàn thành':
        return <CheckCircle className="w-3.5 h-3.5 text-[#446900]" />;
      case 'Đang diễn ra':
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    }
  };

  // Factory distribution stats for the visual analytics
  const factoriesData = [
    { name: 'Nhà máy CP Việt Nam', count: 120, percentage: 34, color: 'bg-[#407F3E]' },
    { name: 'Acecook Hồ Chí Minh', count: 80, percentage: 23, color: 'bg-[#446900]' },
    { name: 'Nhà máy Ajinomoto', count: 150, percentage: 43, color: 'bg-primary-container' }
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header and Back navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('bao-cao-thong-ke')}
            className="p-2 bg-white border border-slate-200 hover:border-[#407F3E] text-slate-500 hover:text-primary-container rounded-xl transition-all cursor-pointer shadow-sm"
            title="Quay lại danh sách báo cáo"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-primary-container tracking-tight">
              Tổng hợp dữ liệu tham quan
            </h1>
            <p className="text-sm text-slate-500">
              Thống kê phân bổ sinh viên đăng ký tham quan thực tế tại các nhà máy đối tác chuyên đề.
            </p>
          </div>
        </div>
        <button
          onClick={() => alert('Đang xuất bảng tổng hợp tham quan chi tiết sang Excel...')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#407F3E] hover:bg-[#346732] text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer self-start"
        >
          <FileSpreadsheet className="w-4.5 h-4.5" />
          <span>Xuất Excel thống kê</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-[#407F3E]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng SV tham gia</p>
            <h3 className="text-2xl font-black text-slate-800">120 sinh viên</h3>
          </div>
        </div>

        <div className="w-px h-12 bg-slate-200 self-center hidden sm:block"></div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng số chuyến đi</p>
            <h3 className="text-2xl font-black text-slate-800">5 chuyến kiến tập</h3>
          </div>
        </div>

        <div className="w-px h-12 bg-slate-200 self-center hidden sm:block"></div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đã hoàn thành</p>
            <h3 className="text-2xl font-black text-slate-800">3 chuyến</h3>
          </div>
        </div>
      </div>

      {/* Analytical Charts Block representing exact mockup visual components */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bar charts representation of student distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2 flex flex-col gap-6">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Phân bổ sinh viên theo nhà máy</h3>
            <p className="text-xs text-slate-400 font-semibold">Tỷ lệ phân phối dựa trên lượt đăng ký học tập</p>
          </div>

          {/* Bar Chart Mockup */}
          <div className="space-y-5 flex-1 flex flex-col justify-center py-4">
            {factoriesData.map((fact) => (
              <div key={fact.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded ${fact.color}`}></span>
                    {fact.name}
                  </span>
                  <span className="font-mono">{fact.count} SV ({fact.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden shadow-inner relative group">
                  <div 
                    className={`h-full ${fact.color} rounded-lg transition-all duration-1000 origin-left hover:brightness-105`}
                    style={{ width: `${fact.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Pie distribution metrics info card */}
        <div className="bg-[#E7E0C4]/60 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-container" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Đánh giá chung</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Nhà máy <b>Ajinomoto</b> nhận được sự quan tâm lớn nhất từ sinh viên khoa Công nghệ Thực phẩm với tỉ lệ <b>43%</b>, tương ứng 150 sinh viên đăng ký báo cáo chuyên đề.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Chuyến đi tại nhà máy <b>Vinamilk Bình Dương</b> đạt tỉ lệ tham gia thực tế cao nhất với <b>118/120</b> sinh viên hiện diện đầy đủ, ghi chép đúng chuẩn nhật ký ISO.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-300">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Độ chính xác dữ liệu</span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Cập nhật lúc: 15/10/2023 - 17:30</p>
          </div>
        </div>
      </div>

      {/* Chi tiết chuyến tham quan Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-extrabold text-slate-800 text-base">Chi tiết các chuyến tham quan thực tế</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Bảng liệt kê danh sách hành trình và tỉ lệ có mặt</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-12 text-center">STT</th>
                <th className="px-6 py-4">Mã chuyến đi</th>
                <th className="px-6 py-4">Tên chuyến kiến tập</th>
                <th className="px-6 py-4">Nhà máy đối tác</th>
                <th className="px-6 py-4">Ngày thực hiện</th>
                <th className="px-6 py-4 text-center">Lượt đăng ký</th>
                <th className="px-6 py-4 text-center">Thực tế đi</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-sm font-semibold">
              {trips.map((trip, idx) => (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-center text-slate-400 font-mono">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-[#407F3E]">
                    {trip.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {trip.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {trip.factory}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 font-mono">
                    {trip.date}
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-600">
                    {trip.registeredCount} SV
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-800 bg-slate-50/30">
                    {trip.actualCount} {trip.actualCount !== '-' ? 'SV' : ''}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(trip.status)}`}>
                      {getStatusIcon(trip.status)}
                      <span>{trip.status}</span>
                    </span>
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
