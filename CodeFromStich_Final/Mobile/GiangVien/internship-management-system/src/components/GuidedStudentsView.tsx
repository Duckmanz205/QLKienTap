/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ChevronDown, CheckCircle, HelpCircle, AlertTriangle, Edit3 } from 'lucide-react';

export const GuidedStudentsView: React.FC = () => {
  const { students, setScreen } = useApp();
  const [selectedTerm, setSelectedTerm] = useState('Đợt 1 - Học kỳ 1 (2023-2024)');
  const [searchQuery, setSearchQuery] = useState('');

  // We have detailed profiles for guided students matching the original applet:
  // - Nguyễn Văn A: 2110432, 21DCNTP1, 3/3, graded/not graded
  // - Trần Thị B: 2110435, 21DCNTP1, 2/3, 2 papers left
  // - Lê Văn C: 2110438, 21DCNTP2, 3/3, 1 paper left
  const guidedStudents = students.filter(s => ['2110432', '2110435', '2110438'].includes(s.id));

  // Filter list
  const filteredStudents = guidedStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.includes(searchQuery)
  );

  return (
    <div className="flex flex-col gap-4 text-on-surface">
      {/* Filter Section */}
      <section className="flex flex-col gap-3">
        {/* Term Dropdown Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface-variant px-1 font-bold">
            Lịch kiến tập
          </label>
          <div className="relative">
            <select 
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full h-12 pl-4 pr-10 bg-surface-container-lowest border border-outline-variant rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-text-slate focus:outline-none"
            >
              <option>Đợt 1 - Học kỳ 1 (2023-2024)</option>
              <option>Đợt 2 - Học kỳ 1 (2023-2024)</option>
              <option>Đợt 1 - Học kỳ 2 (2023-2024)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-5 h-5" />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md focus:outline-none placeholder:text-outline-variant" 
            placeholder="Tìm theo MSSV/họ tên"
          />
        </div>
      </section>

      {/* Guided Student Cards Stack */}
      <section className="flex flex-col gap-4 pb-8">
        {filteredStudents.map(student => {
          // Compute status states dynamically
          const isCompleteTour = student.completedTours === "3/3";
          
          // Mimic original static mockup badges
          let tourStatusBadgeText = `Số chuyến hoàn thành: ${student.completedTours}`;
          let paperStatusBadgeText = '';
          let paperBadgeColor = '';

          // Hardcoded conditions to mirror original images perfectly:
          if (student.id === '2110432') {
            tourStatusBadgeText = "Số chuyến hoàn thành: 3/3";
            paperStatusBadgeText = student.isGraded ? "Đã chấm đủ" : "Còn 1 bài"; // or "Đã chấm đủ" based on isGraded
            paperBadgeColor = student.isGraded ? "bg-secondary text-white" : "bg-warning-yellow text-text-slate";
          } else if (student.id === '2110435') {
            tourStatusBadgeText = "Số chuyến hoàn thành: 2/3";
            paperStatusBadgeText = "Còn 2 bài";
            paperBadgeColor = "bg-warning-yellow text-text-slate";
          } else {
            tourStatusBadgeText = "Số chuyến hoàn thành: 3/3";
            paperStatusBadgeText = "Còn 1 bài";
            paperBadgeColor = "bg-warning-yellow text-text-slate";
          }

          return (
            <div 
              key={student.id}
              className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container flex flex-col gap-4 transition-all hover:shadow-md"
            >
              {/* Profile header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-high border border-outline-variant/30">
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-primary tracking-wide font-bold">
                    {student.id}
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {student.name}
                  </h2>
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Lớp: {student.className}
                  </span>
                </div>
              </div>

              {/* Status Badges Row */}
              <div className="flex flex-wrap gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                  isCompleteTour ? 'bg-secondary text-white' : 'bg-warning-yellow text-text-slate'
                }`}>
                  <CheckCircle className="w-4 h-4 font-bold shrink-0" />
                  <span className="font-label-md text-[11px] font-bold">{tourStatusBadgeText}</span>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${paperBadgeColor}`}>
                  {paperStatusBadgeText === "Đã chấm đủ" ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span className="font-label-md text-[11px] font-bold">{paperStatusBadgeText}</span>
                </div>
              </div>

              {/* View Details / Action Button */}
              <button 
                onClick={() => setScreen('evaluation', student.id)}
                className="w-full h-12 bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-bold rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
              >
                <Edit3 className="w-4.5 h-4.5" />
                Xem &amp; chấm
              </button>
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest border rounded-xl">
            Không tìm thấy sinh viên nào trong danh sách. 🔍
          </div>
        )}
      </section>
    </div>
  );
};
