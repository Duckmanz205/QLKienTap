/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  Compass, 
  DollarSign, 
  Percent, 
  AlertCircle, 
  ChevronRight, 
  Calendar, 
  Bell, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  pendingRefundCount: number;
  pendingCancelCount: number;
}

const chartData = [
  { name: 'Tháng 1', 'Chuyến bắt buộc': 120, 'Chuyến tự do': 50 },
  { name: 'Tháng 2', 'Chuyến bắt buộc': 150, 'Chuyến tự do': 70 },
  { name: 'Tháng 3', 'Chuyến bắt buộc': 210, 'Chuyến tự do': 90 },
  { name: 'Tháng 4', 'Chuyến bắt buộc': 180, 'Chuyến tự do': 85 },
  { name: 'Tháng 5', 'Chuyến bắt buộc': 240, 'Chuyến tự do': 110 },
  { name: 'Tháng 6', 'Chuyến bắt buộc': 280, 'Chuyến tự do': 140 },
];

export default function DashboardView({ onNavigate, pendingRefundCount, pendingCancelCount }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Welcome Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass size={180} className="animate-spin-slow" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-indigo-500/30 text-indigo-200 text-xs px-3 py-1 rounded-full font-medium tracking-wide">
            HỆ THỐNG QUẢN LÝ KIẾN TẬP - ĐHQG TP.HCM
          </span>
          <h1 className="text-3xl font-bold font-sans tracking-tight mt-3 text-slate-100">
            Tổng quan Hoạt động Kiến tập Khoa
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Chào mừng PGS. TS. Nguyễn Văn Khoa. Hệ thống đang ghi nhận hoạt động kiến tập cơ sở ngành tích cực cho Học kỳ 1. Theo dõi tiến độ đăng ký, phê duyệt hủy chuyến và phân công hướng dẫn bên dưới.
          </p>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">SV Đang thực hiện</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">1,240</h3>
            <span className="text-emerald-500 text-xs font-medium flex items-center mt-1.5 gap-1">
              <TrendingUp size={14} /> +12% so với HK trước
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chuyến đang mở ĐK</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">8</h3>
            <span className="text-indigo-600 text-xs font-medium flex items-center mt-1.5 gap-1">
              4 chuyến bắt buộc, 4 chuyến tự do
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Compass size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hoàn phí chờ duyệt</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingRefundCount}</h3>
            <span className="text-slate-500 text-xs mt-1.5 block">Yêu cầu hoàn tiền đóng dư</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tỷ lệ hoàn thành HP</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">92%</h3>
            <span className="text-slate-500 text-xs mt-1.5 block">Mục tiêu đạt 95% cuối đợt</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Percent size={22} />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration volume chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Thống kê Đăng ký Kiến tập</h3>
              <p className="text-slate-400 text-xs">Biểu đồ biểu diễn lượng đăng ký theo tháng phân loại chuyến</p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">Năm học 2025-2026</span>
          </div>
          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Chuyến bắt buộc" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Chuyến tự do" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Panel and Notifications */}
        <div className="space-y-6">
          {/* Pending tasks panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <AlertCircle size={18} className="text-indigo-600 animate-pulse" />
              <h3 className="font-bold text-slate-800 text-sm">Hồ sơ chờ phê duyệt ({5 + pendingCancelCount + pendingRefundCount})</h3>
            </div>
            <div className="space-y-3">
              <div 
                onClick={() => onNavigate('visits')}
                className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/30 cursor-pointer transition-all group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-indigo-950">5 chuyến tự do chờ duyệt</span>
                  <span className="text-[10px] text-indigo-600/70">Yêu cầu tổ chức tự phát</span>
                </div>
                <ChevronRight size={16} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <div 
                onClick={() => onNavigate('registrations')}
                className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 hover:bg-amber-50 border border-amber-100/30 cursor-pointer transition-all group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-amber-950">{pendingCancelCount} minh chứng hủy chờ duyệt</span>
                  <span className="text-[10px] text-amber-600/70">Xác thực lý do vắng mặt</span>
                </div>
                <ChevronRight size={16} className="text-amber-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <div 
                onClick={() => onNavigate('registrations')}
                className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/30 cursor-pointer transition-all group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-emerald-950">{pendingRefundCount} đơn hoàn phí chờ duyệt</span>
                  <span className="text-[10px] text-emerald-600/70">Hồ sơ đóng thừa/bồi hoàn</span>
                </div>
                <ChevronRight size={16} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Bulletin/Notice Card */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Thông báo mới</span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                Cập nhật Quy định Kiến tập cho Khối ngành Kỹ thuật Công nghệ năm 2026
              </p>
              <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
                Kể từ Học kỳ này, toàn bộ sinh viên khi tham gia kiến tập trực tiếp bắt buộc phải nộp chứng nhận an toàn lao động điện tử được cấp bởi Ban Đảm bảo chất lượng.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Đăng ngày: 12/07/2026</span>
              <button 
                onClick={() => alert('Chi tiết thông báo quy chế kiến tập mới sẽ được mở ra!')}
                className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold inline-flex items-center gap-1 group"
              >
                Đọc thêm <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
