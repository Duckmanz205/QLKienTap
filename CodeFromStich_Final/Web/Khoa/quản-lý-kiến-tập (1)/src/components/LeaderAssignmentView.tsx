/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FactoryVisit, Lecturer, InternshipPlan } from '../types';
import { 
  Compass, 
  UserCheck, 
  Users, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  Edit3, 
  Search, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface LeaderAssignmentViewProps {
  visits: FactoryVisit[];
  lecturers: Lecturer[];
  plans: InternshipPlan[];
  onAssignLeader: (visitId: string, leaderId: string) => void;
}

export default function LeaderAssignmentView({
  visits,
  lecturers,
  plans,
  onAssignLeader
}: LeaderAssignmentViewProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'assigned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track open assignment dropdown per visit
  const [activeVisitDropId, setActiveVisitDropId] = useState<string | null>(null);

  // Active plan visits
  const planVisits = visits.filter(v => v.planId === selectedPlanId);

  // Filters logic
  const filteredVisits = planVisits.filter(v => {
    const matchesSearch = v.factoryName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const needsLeader = v.organizer === 'department' && v.mode === 'direct';
    const isAssigned = !!v.leaderId;

    let matchesFilter = true;
    if (assignmentFilter === 'pending') {
      matchesFilter = needsLeader && !isAssigned;
    } else if (assignmentFilter === 'assigned') {
      matchesFilter = isAssigned;
    }

    return matchesSearch && matchesFilter;
  });

  // Calculate statistics for the progress indicators
  const totalDepartmentVisits = planVisits.filter(v => v.organizer === 'department' && v.mode === 'direct');
  const assignedVisitsCount = totalDepartmentVisits.filter(v => !!v.leaderId).length;
  const assignmentRate = totalDepartmentVisits.length > 0 
    ? Math.round((assignedVisitsCount / totalDepartmentVisits.length) * 100) 
    : 100;

  // Check if a lecturer is already busy on a given date (overlap schedule check)
  const isLecturerBusyOnDate = (lecturerId: string, dateStr: string, currentVisitId: string) => {
    return visits.some(v => v.id !== currentVisitId && v.leaderId === lecturerId && v.date === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Progress Dashboard */}
      <div className="bg-white rounded-xl border border-slate-150 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg font-bold text-slate-800">Phân công Giảng viên dẫn đoàn</h2>
          <p className="text-xs text-slate-500">Giám sát các chuyến đi thực tế của sinh viên, đảm bảo có giảng viên đi kèm bảo trợ an toàn, đưa đón và điểm danh đúng thời gian.</p>
        </div>
        
        {/* Ring representation / Progress Meter */}
        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
              <circle cx="32" cy="32" r="28" stroke="#4f46e5" strokeWidth="6" fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - assignmentRate / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-indigo-950">{assignmentRate}%</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Tiến độ phân công</span>
            <h4 className="text-sm font-bold text-slate-800 mt-0.5">{assignedVisitsCount} / {totalDepartmentVisits.length} chuyến đi</h4>
            <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">Yêu cầu bảo trợ thực địa</span>
          </div>
        </div>
      </div>

      {/* Control filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Chọn Đợt Kiến tập:</label>
          <select 
            value={selectedPlanId} 
            onChange={(e) => {
              setSelectedPlanId(e.target.value);
              setActiveVisitDropId(null);
            }}
            className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Trạng thái phân dẫn đoàn:</label>
          <select 
            value={assignmentFilter} 
            onChange={(e) => setAssignmentFilter(e.target.value as 'all' | 'pending' | 'assigned')}
            className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">Tất cả chuyến đi</option>
            <option value="pending">Chờ phân công GV dẫn đoàn</option>
            <option value="assigned">Đã phân công GV dẫn đoàn</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Tìm nhà máy:</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </span>
            <input 
              type="text" 
              placeholder="Nhập tên doanh nghiệp..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3 pl-4">Chuyến tham quan</th>
                <th className="p-3">Ngày & Thời gian</th>
                <th className="p-3">Hình thức & Đưa đón</th>
                <th className="p-3">Giảng viên dẫn đoàn</th>
                <th className="p-3 text-right pr-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">Không tìm thấy chuyến tham quan nào phù hợp tiêu chí lọc</td>
                </tr>
              ) : (
                filteredVisits.map((visit) => {
                  const needsLeader = visit.organizer === 'department' && visit.mode === 'direct';
                  const assignedLeader = lecturers.find(l => l.id === visit.leaderId);
                  const isMenuOpen = activeVisitDropId === visit.id;

                  return (
                    <tr key={visit.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-3 pl-4">
                        <span className="font-bold text-slate-800 block">{visit.factoryName.split(' - ')[0]}</span>
                        <span className="text-[10px] text-slate-400 leading-normal block">{visit.factoryName}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-slate-700 font-semibold font-mono">
                          <Calendar size={13} className="text-slate-400" />
                          {visit.date}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{visit.startTime} - {visit.endTime}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold w-max ${
                            visit.mode === 'direct' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-cyan-50 text-cyan-700 border border-cyan-150'
                          }`}>
                            {visit.mode === 'direct' ? 'Đi thực tế' : 'Trực tuyến (Online)'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {visit.organizer === 'department' ? 'Khoa đưa đón' : 'SV tự túc / Tự liên hệ'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        {!needsLeader ? (
                          <span className="text-slate-400 italic text-[11px]">Không yêu cầu phân dẫn đoàn</span>
                        ) : assignedLeader ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold">
                            <UserCheck size={13} className="text-indigo-600" />
                            {assignedLeader.fullName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">
                            Đang chờ phân dẫn đoàn
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right pr-4 relative">
                        {needsLeader && (
                          <div className="inline-block text-left">
                            <button 
                              id={`btn-leader-menu-${visit.id}`}
                              onClick={() => setActiveVisitDropId(isMenuOpen ? null : visit.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center gap-1.5 transition-all"
                            >
                              {assignedLeader ? <Edit3 size={11} /> : null}
                              {assignedLeader ? 'Thay đổi' : 'Giao nhiệm vụ'}
                            </button>

                            {isMenuOpen && (
                              <>
                                {/* Overlay catcher */}
                                <div className="fixed inset-0 z-10" onClick={() => setActiveVisitDropId(null)}></div>
                                
                                <div className="absolute right-0 mt-1 w-64 rounded-xl shadow-lg bg-white border border-slate-200 z-20 overflow-hidden divide-y divide-slate-100 animate-scale-up origin-top-right text-left">
                                  <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chọn Giảng viên dẫn đoàn</div>
                                  <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                                    {lecturers.map(l => {
                                      const isCurrent = visit.leaderId === l.id;
                                      const hasOverlap = isLecturerBusyOnDate(l.id, visit.date, visit.id);

                                      return (
                                        <button
                                          key={l.id}
                                          disabled={hasOverlap && !isCurrent}
                                          onClick={() => {
                                            onAssignLeader(visit.id, l.id);
                                            setActiveVisitDropId(null);
                                          }}
                                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                            isCurrent 
                                              ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                                              : hasOverlap 
                                                ? 'opacity-60 bg-red-50/50 text-rose-500 cursor-not-allowed' 
                                                : 'hover:bg-slate-50 text-slate-700'
                                          }`}
                                        >
                                          <div className="flex flex-col">
                                            <span>{l.fullName}</span>
                                            <span className="text-[10px] text-slate-400 font-normal">{l.department}</span>
                                          </div>
                                          {isCurrent ? (
                                            <span className="text-[10px] font-bold text-indigo-600">Hiện tại</span>
                                          ) : hasOverlap ? (
                                            <span className="inline-flex items-center gap-0.5 text-rose-600 bg-rose-50 text-[9px] px-1.5 py-0.5 rounded font-extrabold border border-rose-200 animate-pulse">
                                              Trùng lịch
                                            </span>
                                          ) : null}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
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
