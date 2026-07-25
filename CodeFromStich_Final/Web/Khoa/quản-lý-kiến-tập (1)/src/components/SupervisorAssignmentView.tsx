/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Lecturer, InternshipPlan } from '../types';
import { UserCheck, Check, Sparkles, UserPlus, Filter, HelpCircle } from 'lucide-react';

interface SupervisorAssignmentViewProps {
  students: Student[];
  lecturers: Lecturer[];
  plans: InternshipPlan[];
  onAssignSupervisor: (mssv: string, lecturerId: string) => void;
  onAutoAssign: (planId: string) => void;
}

export default function SupervisorAssignmentView({
  students,
  lecturers,
  plans,
  onAssignSupervisor,
  onAutoAssign
}: SupervisorAssignmentViewProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  const [filterSupervisor, setFilterSupervisor] = useState<'all' | 'unassigned' | 'assigned'>('all');
  
  // Selection states for bulk actions
  const [selectedMssvs, setSelectedMssvs] = useState<string[]>([]);
  const [activeSelectLecturerId, setActiveSelectLecturerId] = useState<string | null>(null);

  // Filter students by selected plan
  const planStudents = students.filter(s => s.planId === selectedPlanId);
  const filteredStudents = planStudents.filter(s => {
    if (filterSupervisor === 'unassigned') return !s.supervisorId;
    if (filterSupervisor === 'assigned') return !!s.supervisorId;
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMssvs(filteredStudents.map(s => s.mssv));
    } else {
      setSelectedMssvs([]);
    }
  };

  const handleSelectRow = (mssv: string) => {
    if (selectedMssvs.includes(mssv)) {
      setSelectedMssvs(selectedMssvs.filter(m => m !== mssv));
    } else {
      setSelectedMssvs([...selectedMssvs, mssv]);
    }
  };

  const handleBulkAssign = (lecturerId: string) => {
    if (selectedMssvs.length === 0) return;
    selectedMssvs.forEach(mssv => {
      onAssignSupervisor(mssv, lecturerId);
    });
    setSelectedMssvs([]);
    alert(`Đã phân công hướng dẫn ${selectedMssvs.length} sinh viên sang giảng viên được chọn!`);
  };

  const handleAutoAssignAction = () => {
    onAutoAssign(selectedPlanId);
    alert('Thuật toán tự động phân chia thông minh đã phân bổ đều các sinh viên chưa có người hướng dẫn cho các giảng viên còn trống chỉ tiêu (max 15 SV/GV)!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Phân công Giảng viên Hướng dẫn (GVHD)</h2>
          <p className="text-xs text-slate-500">Phân phối sinh viên tham gia khóa kiến tập cơ sở ngành cho các thầy cô cố vấn học tập</p>
        </div>
        <div>
          <select 
            value={selectedPlanId} 
            onChange={(e) => {
              setSelectedPlanId(e.target.value);
              setSelectedMssvs([]);
            }}
            className="border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 font-bold text-indigo-950 focus:outline-none"
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions and filters */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Bulk controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            id="btn-auto-assign"
            onClick={handleAutoAssignAction}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Sparkles size={14} className="animate-pulse" /> Phân công tự động (AI)
          </button>

          {selectedMssvs.length > 0 && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-300">
              <span className="text-xs font-semibold text-slate-600">Đã chọn ({selectedMssvs.length}):</span>
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAssign(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-600"
              >
                <option value="">-- Phân công chung cho GV --</option>
                {lecturers.map(l => (
                  <option key={l.id} value={l.id}>{l.fullName} ({l.currentStudents}/{l.maxStudents})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-xs font-semibold flex items-center gap-1">
            <Filter size={13} /> Lọc SV:
          </span>
          <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex">
            <button 
              onClick={() => setFilterSupervisor('all')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${
                filterSupervisor === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Tất cả ({planStudents.length})
            </button>
            <button 
              onClick={() => setFilterSupervisor('unassigned')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${
                filterSupervisor === 'unassigned' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Chưa phân công ({planStudents.filter(s => !s.supervisorId).length})
            </button>
            <button 
              onClick={() => setFilterSupervisor('assigned')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${
                filterSupervisor === 'assigned' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Đã phân công ({planStudents.filter(s => !!s.supervisorId).length})
            </button>
          </div>
        </div>
      </div>

      {/* Students List for Assignment */}
      <div className="bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3 pl-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredStudents.length > 0 && selectedMssvs.length === filteredStudents.length}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-3">MSSV</th>
                <th className="p-3">Họ và Tên</th>
                <th className="p-3">Lớp Sinh hoạt</th>
                <th className="p-3">Giảng viên hướng dẫn hiện tại</th>
                <th className="p-3 text-right pr-4">Thao tác phân công</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">Không tìm thấy sinh viên nào khớp bộ lọc phân công</td>
                </tr>
              ) : (
                filteredStudents.map((stud) => {
                  const linkedLecturer = lecturers.find(l => l.id === stud.supervisorId);
                  const isMenuOpen = activeSelectLecturerId === stud.mssv;

                  return (
                    <tr key={stud.mssv} className="hover:bg-slate-50/55 transition-colors">
                      <td className="p-3 pl-4">
                        <input 
                          type="checkbox" 
                          checked={selectedMssvs.includes(stud.mssv)}
                          onChange={() => handleSelectRow(stud.mssv)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">{stud.mssv}</td>
                      <td className="p-3 font-semibold text-slate-800">{stud.fullName}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {stud.class}
                        </span>
                      </td>
                      <td className="p-3">
                        {linkedLecturer ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <UserCheck size={12} className="text-indigo-600" />
                            {linkedLecturer.fullName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-bold">
                            Chưa phân công
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right pr-4 relative">
                        {/* Selector Dropdown with capacity verification */}
                        <div className="inline-block text-left">
                          <button 
                            id={`btn-dropdown-${stud.mssv}`}
                            onClick={() => setActiveSelectLecturerId(isMenuOpen ? null : stud.mssv)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center gap-1.5 transition-colors"
                          >
                            {linkedLecturer ? 'Đổi GVHD' : 'Phân công'}
                          </button>

                          {isMenuOpen && (
                            <>
                              {/* Overlay click catcher */}
                              <div className="fixed inset-0 z-10" onClick={() => setActiveSelectLecturerId(null)}></div>
                              
                              <div className="absolute right-0 mt-1 w-64 rounded-xl shadow-lg bg-white border border-slate-200 z-20 overflow-hidden divide-y divide-slate-100 animate-scale-up origin-top-right">
                                <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Danh sách Giảng viên cố vấn</div>
                                <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                                  {lecturers.map(l => {
                                    const isCurrent = stud.supervisorId === l.id;
                                    const isFull = l.currentStudents >= l.maxStudents;

                                    return (
                                      <button
                                        key={l.id}
                                        disabled={isFull && !isCurrent}
                                        onClick={() => {
                                          onAssignSupervisor(stud.mssv, l.id);
                                          setActiveSelectLecturerId(null);
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                          isCurrent 
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                                            : isFull 
                                              ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' 
                                              : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                      >
                                        <div className="flex flex-col">
                                          <span>{l.fullName}</span>
                                          <span className="text-[10px] text-slate-400 font-normal">{l.department}</span>
                                        </div>
                                        <span className={`text-[10px] font-semibold font-mono ${
                                          isCurrent ? 'text-indigo-600' : isFull ? 'text-rose-500' : 'text-slate-500'
                                        }`}>
                                          {l.currentStudents}/{l.maxStudents} SV
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
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
  );
}
