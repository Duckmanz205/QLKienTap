import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Compass, 
  User, 
  Phone, 
  MessageSquare, 
  Truck, 
  Star, 
  Search, 
  Filter, 
  Download,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  Map
} from 'lucide-react';
import { Trip, Student, TripDetailSchedule } from '../types';

interface ScheduleViewProps {
  trips: Trip[];
  schedules: TripDetailSchedule[];
  students: Student[];
  onToggleCheckIn: (studentId: string) => void;
}

export default function ScheduleView({ trips, schedules, students, onToggleCheckIn }: ScheduleViewProps) {
  // Only schedules of trips that are actually registered
  const registeredTrips = trips.filter(t => t.registered);
  
  // State for selected trip
  const [selectedTripId, setSelectedTripId] = useState<string>(
    registeredTrips.length > 0 ? registeredTrips[0].id : 'yakult-2023'
  );

  // State for student search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'leader' | 'medical'>('all');

  // Find active schedule detail
  const activeSchedule = schedules.find(s => s.tripId === selectedTripId) || schedules[0];
  const activeTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  // Filtering students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.studentId.includes(searchTerm);
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'leader' ? student.isLeader :
      filterType === 'medical' ? student.hasMedicalNotes : true;
    
    return matchesSearch && matchesFilter;
  });

  const checkedInCount = students.filter(s => s.checkedIn).length;
  const totalStudents = students.length;

  return (
    <div className="space-y-6">
      {/* Dropdown Trip Selector */}
      <div className="flex items-center gap-4 bg-white rounded-2xl p-3 max-w-md shadow-sm border border-surface-muted/50 relative z-10 group transition-all hover:shadow-md">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#f2f5ec] flex items-center justify-center text-primary shadow-inner">
          <Truck className="w-5 h-5" />
        </div>
        <div className="flex-1 flex flex-col justify-center pr-4">
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-0.5">
            Chọn chuyến tham quan
          </span>
          <select 
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="bg-transparent text-sm font-bold text-on-surface outline-none cursor-pointer w-full pr-4 appearance-none"
          >
            {registeredTrips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} - {t.date}
              </option>
            ))}
            {registeredTrips.length === 0 && (
              <option value="yakult-2023">Nhà máy Yakult Việt Nam - 25/10/2023</option>
            )}
          </select>
        </div>
      </div>

      {/* Main Schedule Hero Info Panel */}
      {activeTrip && (
        <div className="bg-white rounded-3xl border border-surface-muted/40 shadow-sm overflow-hidden relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between p-6 md:p-8 gap-8 items-center">
            
            {/* Trip Main Information */}
            <div className="flex flex-col gap-4 max-w-2xl w-full">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{activeTrip.type}</span>
                </span>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{activeTrip.category}</span>
                </span>
              </div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
                  {activeTrip.title}
                </h1>
                <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 mt-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{activeTrip.venue}</span>
                </p>
              </div>

              {/* Overview Details Cards Grid */}
              <div className="flex flex-wrap gap-4 mt-2 p-4 bg-[#f8faf1] rounded-2xl border-l-4 border-primary shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#e5ffdc] flex items-center justify-center text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider leading-none">Ngày đi</div>
                    <div className="text-xs font-black text-on-surface mt-1">{activeTrip.date}</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-surface-muted hidden sm:block"></div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider leading-none">Thời gian</div>
                    <div className="text-xs font-black text-on-surface mt-1">{activeTrip.time}</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-surface-muted hidden sm:block"></div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider leading-none">Phương tiện</div>
                    <div className="text-xs font-black text-on-surface mt-1 truncate max-w-[150px]">
                      {activeSchedule ? activeSchedule.vehicle : 'Xe đoàn trường'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lecturer Teacher Profile Card */}
            {activeSchedule && (
              <div className="bg-[#f8faf1]/80 p-5 rounded-2xl border border-surface-muted/30 shadow-sm min-w-[280px] w-full md:w-auto flex flex-col gap-4">
                <div className="text-[10px] font-black text-on-surface-variant tracking-wider flex items-center gap-1.5 uppercase">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> Giảng viên dẫn đoàn
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={activeSchedule.lecturer.avatar} 
                      alt={activeSchedule.lecturer.name} 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary ring-offset-2"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-secondary text-white w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center shadow-md">
                      <Star className="w-2.5 h-2.5 fill-white text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-on-surface">
                      {activeSchedule.lecturer.name}
                    </div>
                    <div className="text-xs text-on-surface-variant font-semibold">
                      {activeSchedule.lecturer.department}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`tel:${activeSchedule.lecturer.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-[#ecefe6] border border-surface-muted rounded-xl text-on-surface text-xs font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{activeSchedule.lecturer.phone}</span>
                  </a>
                  <button 
                    onClick={() => alert(`Bắt đầu chat với giảng viên ${activeSchedule.lecturer.name}`)}
                    className="flex items-center justify-center w-9 h-9 bg-[#e5ffdc] hover:bg-primary hover:text-white rounded-xl text-primary transition-all cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid: Left Schedule Timeline, Right Student Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-muted/40 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                <span>Lộ trình chi tiết</span>
              </h2>
              <span className="text-[10px] font-black bg-[#f2f5ec] text-[#476d01] px-3 py-1 rounded-full uppercase tracking-wider">
                {activeSchedule ? activeSchedule.route.length : 0} hoạt động
              </span>
            </div>

            {activeSchedule && (
              <div className="relative pl-6 space-y-8 before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-[#ecefe6]">
                {activeSchedule.route.map((item, index) => (
                  <div key={index} className="relative group">
                    {/* Bullet circle indicator */}
                    {item.isHighlight ? (
                      <div className="absolute -left-[27px] w-6 h-6 bg-primary rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 animate-pulse">
                        <Star className="w-2.5 h-2.5 fill-white text-white" />
                      </div>
                    ) : (
                      <div className="absolute -left-[25px] w-5 h-5 bg-white rounded-full border-4 border-[#c0c9bb] group-hover:border-primary transition-colors flex items-center justify-center z-10">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-start">
                      <div className="w-14 flex-shrink-0 text-xs font-black text-on-surface-variant mt-1">
                        {item.time}
                      </div>
                      <div className={`flex-1 rounded-2xl p-4 shadow-sm border transition-all ${
                        item.isHighlight 
                          ? 'bg-primary/5 border-primary/25' 
                          : 'bg-[#f8faf1]/50 border-surface-muted/30 hover:shadow-md'
                      }`}>
                        <h3 className="font-black text-sm text-on-surface mb-1">
                          {item.title}
                        </h3>
                        {item.location && (
                          <p className="text-xs text-on-surface-variant font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary/60" />
                            <span>{item.location}</span>
                          </p>
                        )}
                        {item.details && item.details.length > 0 && (
                          <ul className="text-xs text-on-surface-variant space-y-1.5 pl-4 list-disc marker:text-primary/40 mt-3 font-semibold">
                            {item.details.map((detail, dIndex) => (
                              <li key={dIndex}>{detail}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map display placeholder widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-surface-muted/40 p-5 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
              <Map className="w-4.5 h-4.5 text-primary" />
              <span>Bản đồ hành trình</span>
            </h3>
            <div className="h-44 rounded-xl overflow-hidden relative group shadow-inner border border-surface-container">
              <div 
                className="w-full h-full bg-cover bg-center transition-all duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDr8a-wN1IkBn0i-5MFGOU_LpGXtkJRFyMJ160PnR1QlK8JLO4ZfFK-uBt-hdOR4BnUIIePFI-sa12SMvTiS0vY_MR0nOu9ee0Dmxw5v9UBGkf2AmNCPCboZXeEhMrWE6VNllUov-154QwPyTiAQ5-I7fU8zcwKso_AUbYHifzuXMNLwXHtI16-QENwoeKCbeDqH9UXHyJ1eebCalVjrwcDnedFaSVZyBeSBVzQWufOCk5DdY0g6TXFWQ')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none flex items-end p-4">
                <span className="text-white text-xs font-bold tracking-wide flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#89b449]" />
                  <span>KCN VSIP 1, Bình Dương</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-muted/40 p-6 h-full flex flex-col">
            
            {/* Header section with Filter controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <span>Danh sách đoàn sinh viên</span>
                </h2>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Lớp QTKD-K45A • Lãnh đạo dẫn đoàn
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {/* Search box */}
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên, MSSV..."
                    className="pl-9 pr-4 py-1.5 bg-[#f8faf1] border border-surface-muted rounded-xl text-xs w-full focus:outline-none focus:border-primary font-medium"
                  />
                </div>
                <button 
                  onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                  className="p-1.5 bg-[#f8faf1] border border-surface-muted rounded-xl text-on-surface-variant hover:text-primary hover:bg-[#ecefe6] transition-colors cursor-pointer"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCwIcon className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Quick Segmented Toggle buttons */}
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  filterType === 'all' 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-[#f2f5ec]/70 text-on-surface-variant hover:bg-[#f2f5ec]'
                }`}
              >
                Tất cả ({students.length})
              </button>
              <button 
                onClick={() => setFilterType('leader')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  filterType === 'leader' 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-[#f2f5ec]/70 text-on-surface-variant hover:bg-[#f2f5ec]'
                }`}
              >
                Trưởng nhóm ({students.filter(s => s.isLeader).length})
              </button>
              <button 
                onClick={() => setFilterType('medical')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  filterType === 'medical' 
                    ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' 
                    : 'bg-[#f2f5ec]/70 text-on-surface-variant hover:bg-[#f2f5ec]'
                }`}
              >
                Lưu ý y tế ({students.filter(s => s.hasMedicalNotes).length})
              </button>
            </div>

            {/* Student Grid list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1 max-h-[450px]">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => onToggleCheckIn(student.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer group hover:scale-[1.01] ${
                    student.checkedIn 
                      ? 'bg-primary/5 border-primary/25' 
                      : 'bg-white border-surface-muted/50 hover:border-outline-variant hover:bg-[#f8faf1]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black text-sm flex items-center justify-center border border-primary/25 shadow-inner">
                      {student.name.split(' ').pop()?.[0]}
                    </div>
                    {student.isLeader && (
                      <div className="absolute -bottom-1 -right-1 bg-warning-yellow rounded-full w-4 h-4 border border-white flex items-center justify-center shadow-md">
                        <Star className="w-2.5 h-2.5 fill-on-surface text-on-surface" />
                      </div>
                    )}
                  </div>

                  {/* Student Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-on-surface truncate group-hover:text-primary transition-colors">
                      {student.name}
                    </div>
                    <div className="text-[10px] text-on-surface-variant font-bold mt-0.5">
                      {student.studentId}
                    </div>
                  </div>

                  {/* Badges / Checkboxes */}
                  <div className="shrink-0 flex items-center gap-1">
                    {student.hasMedicalNotes && (
                      <div 
                        className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center" 
                        title={student.medicalNotes}
                        onClick={(e) => { e.stopPropagation(); alert(`Lưu ý y tế cho ${student.name}: ${student.medicalNotes}`); }}
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shadow-inner transition-all ${
                      student.checkedIn 
                        ? 'bg-primary border-primary text-white' 
                        : 'border-outline-variant text-transparent bg-white group-hover:border-primary'
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>
                </div>
              ))}

              {filteredStudents.length === 0 && (
                <div className="col-span-full py-12 text-center text-on-surface-variant bg-[#f8faf1]/50 rounded-2xl border border-dashed border-outline-variant">
                  <HelpCircle className="w-10 h-10 text-outline mx-auto mb-2" />
                  <p className="font-bold text-sm">Không tìm thấy sinh viên</p>
                  <p className="text-xs text-outline mt-0.5">Thử đổi từ khóa tìm kiếm hoặc bộ lọc khác</p>
                </div>
              )}
            </div>

            {/* Footer Summary details */}
            <div className="mt-6 pt-5 border-t border-surface-container flex flex-wrap gap-4 items-center justify-between text-xs text-on-surface-variant font-bold">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning-yellow shadow-inner"></span>
                  <span>Trưởng nhóm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] shadow-inner"></span>
                  <span>Lưu ý y tế</span>
                </div>
              </div>
              <div className="bg-[#e5ffdc] text-primary px-3 py-1 rounded-full border border-primary/20">
                Đã điểm danh: <span className="font-black">{checkedInCount}</span>/{totalStudents} sinh viên
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Inline fallback for RotateCw icon from Lucide if there is import discrepancy
function RotateCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
