/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FactoryVisit, InternshipPlan } from '../types';
import { Plus, Calendar, Clock, MapPin, Laptop, Users, Building, AlertCircle } from 'lucide-react';

interface VisitViewProps {
  visits: FactoryVisit[];
  plans: InternshipPlan[];
  onAddVisit: (visit: FactoryVisit) => void;
}

export default function VisitView({ visits, plans, onAddVisit }: VisitViewProps) {
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [factoryName, setFactoryName] = useState('');
  const [date, setDate] = useState('2025-10-25');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('11:30');
  const [mode, setMode] = useState<'direct' | 'online'>('direct');
  const [organizer, setOrganizer] = useState<'department' | 'self'>('department');
  const [capacity, setCapacity] = useState(80);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryName.trim() || !planId) return;

    onAddVisit({
      id: 'v_' + Date.now(),
      planId,
      factoryName,
      date,
      startTime,
      endTime,
      mode,
      organizer,
      capacity,
      registeredCount: 0,
      address,
      notes
    });

    setFactoryName('');
    setAddress('');
    setNotes('');
    setShowModal(false);
  };

  const getCapacityColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 1.0) return 'bg-rose-500';
    if (ratio >= 0.8) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Chuyến tham quan Kiến tập</h2>
          <p className="text-xs text-slate-500">Lập kế hoạch tổ chức, định lượng quy mô và công bố danh sách nhà máy mở đăng ký</p>
        </div>
        <button 
          id="btn-create-visit"
          onClick={() => {
            if (plans.length > 0) setPlanId(plans[0].id);
            setShowModal(true);
          }}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={14} /> Tạo chuyến tham quan mới
        </button>
      </div>

      {/* Grid of Visits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visits.map((visit) => {
          const fullness = Math.round((visit.registeredCount / visit.capacity) * 100);
          const isFull = visit.registeredCount >= visit.capacity;
          const plan = plans.find(p => p.id === visit.planId);

          return (
            <div 
              key={visit.id} 
              className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                isFull ? 'border-amber-200' : 'border-slate-150'
              }`}
            >
              {/* Top Banner Accent */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${isFull ? 'bg-amber-400' : 'bg-indigo-600'}`}></div>

              <div>
                <div className="flex justify-between items-start gap-2 mb-2.5">
                  <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                    visit.mode === 'direct' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                  }`}>
                    {visit.mode === 'direct' ? 'Trực tiếp' : 'Trực tuyến'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {plan ? plan.name.split(' - ')[0] : 'Đang lập lịch'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm leading-snug mb-3 hover:text-indigo-600 cursor-pointer">
                  {visit.factoryName}
                </h3>

                {/* Details list */}
                <div className="space-y-2 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="font-medium font-mono text-slate-700">{visit.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span className="font-mono">{visit.startTime} - {visit.endTime}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="leading-tight">{visit.address || 'Địa điểm chưa công bố'}</span>
                  </div>
                </div>
              </div>

              {/* Progress and Bottom controls */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                {/* Visual Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users size={12} /> Sĩ số: {visit.registeredCount}/{visit.capacity} SV
                    </span>
                    <span className={isFull ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                      {isFull ? 'ĐÃ ĐẦY 100%' : `${fullness}%`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getCapacityColor(visit.registeredCount, visit.capacity)}`} 
                      style={{ width: `${Math.min(fullness, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Notes if available */}
                {visit.notes && (
                  <p className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded border border-slate-100 leading-normal italic">
                    * {visit.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Tạo Chuyến tham quan Kiến tập mới</h4>
                <p className="text-[10px] text-slate-400">Thiết lập lộ trình nhà máy và mốc thời gian tổ chức</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chọn Đợt kiến tập chủ quản</label>
                <select 
                  required
                  value={planId} 
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên Nhà máy / Doanh nghiệp Tiếp nhận</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Công ty Cổ phần Sữa Vinamilk - Nhà máy Bình Dương" 
                  value={factoryName}
                  onChange={(e) => setFactoryName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày tham quan</label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số lượng SV tối đa</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Giờ tập trung / Bắt đầu</label>
                  <input 
                    type="time" 
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Giờ kết thúc dự kiến</label>
                  <input 
                    type="time" 
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hình thức tham quan</label>
                  <select 
                    value={mode} 
                    onChange={(e) => setMode(e.target.value as 'direct' | 'online')}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="direct">Trực tiếp (Đi thực tế)</option>
                    <option value="online">Trực tuyến (Qua MS Teams / Zoom)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phương thức tổ chức</label>
                  <select 
                    value={organizer} 
                    onChange={(e) => setOrganizer(e.target.value as 'department' | 'self')}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="department">Khoa chủ trì (Có đưa đón)</option>
                    <option value="self">Sinh viên tự liên hệ chuyến tự do</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Địa điểm / Địa chỉ đón</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Lô I2, Đường D1, Khu Công Nghệ Cao, Quận 9, TP. HCM" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ghi chú / Quy định chuyến đi (Dặn dò trang phục, thẻ SV...)</label>
                <textarea 
                  rows={2}
                  placeholder="Yêu cầu mặc đồng phục trường, đi giày ba-ta hoặc giày quai hậu..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
