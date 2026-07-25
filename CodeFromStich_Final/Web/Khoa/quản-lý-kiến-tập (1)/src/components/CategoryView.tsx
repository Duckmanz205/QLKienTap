/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AcademicYear, Semester } from '../types';
import { Plus, Trash2, Calendar, FileText, CheckCircle, HelpCircle } from 'lucide-react';

interface CategoryViewProps {
  years: AcademicYear[];
  semesters: Semester[];
  onAddYear: (name: string) => void;
  onAddSemester: (name: string, yearId: string, startDate: string, endDate: string) => void;
  onDeleteYear: (id: string) => void;
  onDeleteSemester: (id: string) => void;
  onToggleYearStatus: (id: string) => void;
}

export default function CategoryView({
  years,
  semesters,
  onAddYear,
  onAddSemester,
  onDeleteYear,
  onDeleteSemester,
  onToggleYearStatus
}: CategoryViewProps) {
  // Modal toggle states
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSemModal, setShowSemModal] = useState(false);

  // Form states
  const [newYearName, setNewYearName] = useState('');
  const [semName, setSemName] = useState('Học kỳ 1');
  const [semYearId, setSemYearId] = useState(years[0]?.id || '');
  const [semStart, setSemStart] = useState('2025-09-01');
  const [semEnd, setSemEnd] = useState('2026-01-15');

  const handleYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) return;
    onAddYear(newYearName);
    setNewYearName('');
    setShowYearModal(false);
  };

  const handleSemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semName.trim() || !semYearId) return;
    onAddSemester(semName, semYearId, semStart, semEnd);
    setShowSemModal(false);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Danh mục nền hệ thống</h2>
          <p className="text-xs text-slate-500">Thiết lập chu kỳ năm học và mốc thời gian học kỳ chính thức của Khoa</p>
        </div>
        <div className="flex gap-2">
          <button 
            id="btn-add-year"
            onClick={() => setShowYearModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Thêm Năm học
          </button>
          <button 
            id="btn-add-sem"
            onClick={() => {
              if (years.length > 0) {
                setSemYearId(years[0].id);
              }
              setShowSemModal(true)}
            }
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus size={14} /> Thêm Học kỳ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Years Card */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Danh sách Năm học</h3>
            <p className="text-[11px] text-slate-400">Nhấn nút trạng thái để kích hoạt / vô hiệu năm học</p>
          </div>
          <div className="p-2 divide-y divide-slate-100 overflow-y-auto max-h-[450px]">
            {years.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Chưa có dữ liệu Năm học</div>
            ) : (
              years.map((year) => (
                <div key={year.id} className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg group transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-mono text-xs font-bold">
                      {year.name.slice(2, 4)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Năm học {year.name}</h4>
                      <button 
                        onClick={() => onToggleYearStatus(year.id)}
                        className={`text-[10px] font-medium mt-0.5 px-2 py-0.5 rounded-full inline-block transition-all ${
                          year.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {year.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Xóa năm học này sẽ ảnh hưởng tới dữ liệu học kỳ liên quan. Bạn có chắc chắn?')) {
                        onDeleteYear(year.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Xóa năm học"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Semesters Card */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Cấu hình Học kỳ</h3>
            <p className="text-[11px] text-slate-400">Danh mục mốc thời gian bắt đầu và kết thúc học kỳ</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3 pl-4">Học kỳ</th>
                  <th className="p-3">Năm học</th>
                  <th className="p-3">Ngày bắt đầu</th>
                  <th className="p-3">Ngày kết thúc</th>
                  <th className="p-3 text-right pr-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {semesters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">Chưa có dữ liệu Học kỳ</td>
                  </tr>
                ) : (
                  semesters.map((sem) => {
                    const linkedYear = years.find(y => y.id === sem.yearId);
                    return (
                      <tr key={sem.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 pl-4 font-bold text-slate-800 flex items-center gap-2">
                          <Calendar size={14} className="text-indigo-500" />
                          {sem.name}
                        </td>
                        <td className="p-3">
                          <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px]">
                            {linkedYear ? linkedYear.name : 'Unknown'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{sem.startDate}</td>
                        <td className="p-3 font-mono text-slate-600">{sem.endDate}</td>
                        <td className="p-3 text-right pr-4">
                          <button 
                            onClick={() => {
                              if (confirm('Bạn chắc chắn muốn xóa học kỳ này?')) {
                                onDeleteSemester(sem.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Xóa học kỳ"
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
      </div>

      {/* Year Modal */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Thêm Năm học mới</h4>
              <button onClick={() => setShowYearModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>
            <form onSubmit={handleYearSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên Năm học (Ví dụ: 2026-2027)</label>
                <input 
                  type="text" 
                  required
                  placeholder="2026-2027" 
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowYearModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Tạo Năm học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Semester Modal */}
      {showSemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Thêm mới Học kỳ</h4>
                <p className="text-[10px] text-slate-400">Thiết lập cấu hình khoảng thời gian học kỳ trong năm học</p>
              </div>
              <button onClick={() => setShowSemModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleSemSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên học kỳ</label>
                <select 
                  value={semName} 
                  onChange={(e) => setSemName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Học kỳ 1">Học kỳ 1</option>
                  <option value="Học kỳ 2">Học kỳ 2</option>
                  <option value="Học kỳ 3">Học kỳ phụ (Hè)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chọn Năm học</label>
                <select 
                  required
                  value={semYearId} 
                  onChange={(e) => setSemYearId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  {years.map(y => (
                    <option key={y.id} value={y.id}>Năm học {y.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    required
                    value={semStart}
                    onChange={(e) => setSemStart(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày kết thúc</label>
                  <input 
                    type="date" 
                    required
                    value={semEnd}
                    onChange={(e) => setSemEnd(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowSemModal(false)}
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
