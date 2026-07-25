/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InternshipPlan, AcademicYear, Semester } from '../types';
import { Plus, Calendar, CheckCircle2, Hourglass, Archive, Trash2 } from 'lucide-react';

interface PlanViewProps {
  plans: InternshipPlan[];
  years: AcademicYear[];
  semesters: Semester[];
  onAddPlan: (name: string, yearId: string, semesterId: string, startDate: string, endDate: string) => void;
  onDeletePlan: (id: string) => void;
}

export default function PlanView({
  plans,
  years,
  semesters,
  onAddPlan,
  onDeletePlan
}: PlanViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [yearId, setYearId] = useState(years[0]?.id || '');
  const [semId, setSemId] = useState(semesters[0]?.id || '');
  const [start, setStart] = useState('2025-09-10');
  const [end, setEnd] = useState('2025-12-20');

  const filteredSemesters = semesters.filter(s => s.yearId === yearId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !yearId || !semId) return;
    onAddPlan(name, yearId, semId, start, end);
    setName('');
    setShowModal(false);
  };

  const getStatusBadge = (status: 'planning' | 'active' | 'completed') => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            <CheckCircle2 size={12} /> Đang hoạt động
          </span>
        );
      case 'planning':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            <Hourglass size={12} /> Đang lên kế hoạch
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            <Archive size={12} /> Đã hoàn tất
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cấu hình Đợt Kiến tập</h2>
          <p className="text-xs text-slate-500">Khai báo và theo dõi tiến độ tổng của các chiến dịch thực tập, kiến tập khoa</p>
        </div>
        <button 
          id="btn-create-plan"
          onClick={() => {
            if (years.length > 0) setYearId(years[0].id);
            if (semesters.length > 0) setSemId(semesters[0].id);
            setShowModal(true);
          }}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={14} /> Tạo đợt kiến tập mới
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3 pl-4">Đợt Kiến tập</th>
                <th className="p-3">Năm học</th>
                <th className="p-3">Học kỳ</th>
                <th className="p-3">Ngày bắt đầu</th>
                <th className="p-3">Ngày kết thúc</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right pr-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">Chưa có Đợt kiến tập nào được khai báo. Hãy tạo đợt mới!</td>
                </tr>
              ) : (
                plans.map((p) => {
                  const linkedYear = years.find(y => y.id === p.yearId);
                  const linkedSem = semesters.find(s => s.id === p.semesterId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 pl-4 font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-500" />
                        {p.name}
                      </td>
                      <td className="p-3">
                        <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                          {linkedYear ? linkedYear.name : 'Unknown'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-600">{linkedSem ? linkedSem.name : 'Unknown'}</td>
                      <td className="p-3 font-mono text-slate-500">{p.startDate}</td>
                      <td className="p-3 font-mono text-slate-500">{p.endDate}</td>
                      <td className="p-3">{getStatusBadge(p.status)}</td>
                      <td className="p-3 text-right pr-4">
                        <button 
                          onClick={() => {
                            if (confirm('Bạn chắc chắn muốn xóa đợt kiến tập này? Việc xóa sẽ ảnh hưởng tới phân công và đăng ký liên quan.')) {
                              onDeletePlan(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          title="Xóa đợt kiến tập"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Creating Plan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Tạo đợt kiến tập mới</h4>
                <p className="text-[10px] text-slate-400">Khai báo thông số thời gian đợt kiến tập mới</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên đợt kiến tập</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Kiến tập Cơ sở ngành - HK1 2025-2026" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Chọn Năm học</label>
                  <select 
                    required
                    value={yearId}
                    onChange={(e) => {
                      setYearId(e.target.value);
                      const filtered = semesters.filter(s => s.yearId === e.target.value);
                      if (filtered.length > 0) setSemId(filtered[0].id);
                    }}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {years.map(y => (
                      <option key={y.id} value={y.id}>Năm học {y.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Chọn Học kỳ</label>
                  <select 
                    required
                    value={semId}
                    onChange={(e) => setSemId(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {filteredSemesters.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    {filteredSemesters.length === 0 && (
                      <option value="">Chưa có học kỳ trong năm</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    required
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày kết thúc</label>
                  <input 
                    type="date" 
                    required
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
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
                  disabled={!yearId || !semId}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg shadow-sm"
                >
                  Tạo đợt kiến tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
