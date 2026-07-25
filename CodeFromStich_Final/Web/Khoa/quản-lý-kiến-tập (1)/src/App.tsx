/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AcademicYear, 
  Semester, 
  InternshipPlan, 
  Student, 
  Lecturer, 
  FactoryVisit, 
  Registration, 
  UserAccount,
  RegistrationStatus
} from './types';
import { 
  defaultYears, 
  defaultSemesters, 
  defaultPlans, 
  defaultLecturers, 
  defaultStudents, 
  defaultVisits, 
  defaultRegistrations, 
  defaultAccounts,
  loadData,
  saveData
} from './data';

// Sub-components
import DashboardView from './components/DashboardView';
import CategoryView from './components/CategoryView';
import StudentView from './components/StudentView';
import PlanView from './components/PlanView';
import VisitView from './components/VisitView';
import RegistrationView from './components/RegistrationView';
import SupervisorAssignmentView from './components/SupervisorAssignmentView';
import LeaderAssignmentView from './components/LeaderAssignmentView';
import AccountView from './components/AccountView';

import { 
  Compass, 
  Layers, 
  Calendar, 
  Building, 
  Users, 
  FileCheck, 
  UserCheck, 
  ShieldAlert, 
  Menu, 
  X, 
  Activity, 
  Bell,
  GraduationCap
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global Datastore State
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [plans, setPlans] = useState<InternshipPlan[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [visits, setVisits] = useState<FactoryVisit[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);

  // Initialize State from LocalStorage or Defaults
  useEffect(() => {
    setYears(loadData<AcademicYear[]>('years', defaultYears));
    setSemesters(loadData<Semester[]>('semesters', defaultSemesters));
    setPlans(loadData<InternshipPlan[]>('plans', defaultPlans));
    setLecturers(loadData<Lecturer[]>('lecturers', defaultLecturers));
    setStudents(loadData<Student[]>('students', defaultStudents));
    setVisits(loadData<FactoryVisit[]>('visits', defaultVisits));
    setRegistrations(loadData<Registration[]>('registrations', defaultRegistrations));
    setAccounts(loadData<UserAccount[]>('accounts', defaultAccounts));
  }, []);

  // Save State to LocalStorage whenever they change
  useEffect(() => {
    if (years.length > 0) saveData('years', years);
  }, [years]);

  useEffect(() => {
    if (semesters.length > 0) saveData('semesters', semesters);
  }, [semesters]);

  useEffect(() => {
    if (plans.length > 0) saveData('plans', plans);
  }, [plans]);

  useEffect(() => {
    if (lecturers.length > 0) saveData('lecturers', lecturers);
  }, [lecturers]);

  useEffect(() => {
    if (students.length > 0) saveData('students', students);
  }, [students]);

  useEffect(() => {
    if (visits.length > 0) saveData('visits', visits);
  }, [visits]);

  useEffect(() => {
    if (registrations.length > 0) saveData('registrations', registrations);
  }, [registrations]);

  useEffect(() => {
    if (accounts.length > 0) saveData('accounts', accounts);
  }, [accounts]);

  // --- STATE HANDLERS ---

  // 1. Categories
  const handleAddYear = (name: string) => {
    const newYear: AcademicYear = {
      id: 'y_' + Date.now(),
      name,
      status: 'inactive'
    };
    setYears([...years, newYear]);
  };

  const handleAddSemester = (name: string, yearId: string, startDate: string, endDate: string) => {
    const newSem: Semester = {
      id: 's_' + Date.now(),
      name,
      yearId,
      startDate,
      endDate
    };
    setSemesters([...semesters, newSem]);
  };

  const handleDeleteYear = (id: string) => {
    setYears(years.filter(y => y.id !== id));
    setSemesters(semesters.filter(s => s.yearId !== id));
  };

  const handleDeleteSemester = (id: string) => {
    setSemesters(semesters.filter(s => s.id !== id));
  };

  const handleToggleYearStatus = (id: string) => {
    setYears(years.map(y => y.id === id ? { ...y, status: y.status === 'active' ? 'inactive' : 'active' } : y));
  };

  // 2. Plans
  const handleAddPlan = (name: string, yearId: string, semesterId: string, startDate: string, endDate: string) => {
    const newPlan: InternshipPlan = {
      id: 'p_' + Date.now(),
      name,
      yearId,
      semesterId,
      startDate,
      endDate,
      status: 'planning'
    };
    setPlans([newPlan, ...plans]);
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  // 3. Students
  const handleAddStudent = (student: Student) => {
    setStudents([student, ...students]);
  };

  const handleBulkImportStudents = (newStudents: Student[]) => {
    // filter out duplicates by mssv
    const existingMssvs = new Set(students.map(s => s.mssv));
    const uniqueNew = newStudents.filter(ns => !existingMssvs.has(ns.mssv));
    setStudents([...uniqueNew, ...students]);
  };

  const handleDeleteStudent = (mssv: string) => {
    setStudents(students.filter(s => s.mssv !== mssv));
  };

  // 4. Visits
  const handleAddVisit = (visit: FactoryVisit) => {
    setVisits([visit, ...visits]);
  };

  // 5. Registrations
  const handleUpdateRegistrationStatus = (id: string, status: RegistrationStatus) => {
    setRegistrations(registrations.map(r => {
      if (r.id !== id) return r;
      
      // Update registered count of visits accordingly if state shifts to valid or cancelled
      const visit = visits.find(v => v.id === r.visitId);
      if (visit) {
        let diff = 0;
        if (status === 'valid' && r.status !== 'valid') {
          diff = 1;
        } else if (status === 'cancelled' && r.status === 'valid') {
          diff = -1;
        }
        
        if (diff !== 0) {
          setVisits(visits.map(v => v.id === r.visitId ? { ...v, registeredCount: Math.max(0, v.registeredCount + diff) } : v));
        }
      }

      return { ...r, status };
    }));
  };

  const handleUpdateRegistrationFeeStatus = (id: string, feeStatus: 'unpaid' | 'pending' | 'verified') => {
    setRegistrations(registrations.map(r => r.id === id ? { ...r, feeStatus } : r));
  };

  const handleFreezeVisitList = (visitId: string) => {
    // Mark all 'pending' registrations for this visit as 'valid' and lock
    setRegistrations(registrations.map(r => {
      if (r.visitId === visitId && r.status === 'pending') {
        return { ...r, status: 'valid' };
      }
      return r;
    }));
    
    // Set visit registered count to full
    setVisits(visits.map(v => {
      if (v.id === visitId) {
        const matchingCount = registrations.filter(r => r.visitId === visitId && (r.status === 'pending' || r.status === 'valid')).length;
        return { ...v, registeredCount: Math.min(matchingCount, v.capacity) };
      }
      return v;
    }));
  };

  // 6. Supervisor Assignment
  const handleAssignSupervisor = (mssv: string, lecturerId: string) => {
    // Update student's supervisor
    const oldStudent = students.find(s => s.mssv === mssv);
    const oldLectId = oldStudent?.supervisorId;

    setStudents(students.map(s => s.mssv === mssv ? { ...s, supervisorId: lecturerId } : s));

    // Update lecturers student count load
    setLecturers(lecturers.map(l => {
      let currentStudents = l.currentStudents;
      if (l.id === lecturerId && oldLectId !== lecturerId) {
        currentStudents = Math.min(l.maxStudents, currentStudents + 1);
      } else if (oldLectId && l.id === oldLectId && oldLectId !== lecturerId) {
        currentStudents = Math.max(0, currentStudents - 1);
      }
      return { ...l, currentStudents };
    }));
  };

  const handleAutoAssignSupervisors = (planId: string) => {
    // Collect all unassigned students in active plan
    const unassignedStudents = students.filter(s => s.planId === planId && !s.supervisorId);
    if (unassignedStudents.length === 0) return;

    let lecturerIndex = 0;
    const availableLecturers = [...lecturers];
    const updatedStudents = [...students];

    unassignedStudents.forEach(stud => {
      // Find a lecturer who is not yet full
      let loops = 0;
      while (loops < availableLecturers.length) {
        const lect = availableLecturers[lecturerIndex];
        if (lect.currentStudents < lect.maxStudents) {
          // Assign student
          const targetStudIdx = updatedStudents.findIndex(s => s.mssv === stud.mssv);
          updatedStudents[targetStudIdx] = { ...stud, supervisorId: lect.id };
          lect.currentStudents += 1;
          
          // Advance index
          lecturerIndex = (lecturerIndex + 1) % availableLecturers.length;
          break;
        }
        lecturerIndex = (lecturerIndex + 1) % availableLecturers.length;
        loops += 1;
      }
    });

    setStudents(updatedStudents);
    setLecturers(availableLecturers);
  };

  // 7. Tour Leader Assignment
  const handleAssignLeader = (visitId: string, leaderId: string) => {
    setVisits(visits.map(v => v.id === visitId ? { ...v, leaderId } : v));
  };

  // 8. User Accounts
  const handleAddAccount = (account: UserAccount) => {
    setAccounts([account, ...accounts]);
  };

  const handleToggleAccountStatus = (id: string) => {
    setAccounts(accounts.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'locked' : 'active' } : a));
  };

  const handleResetAccountPassword = (id: string) => {
    alert('Mật khẩu của tài khoản đã được đưa về trạng thái khởi tạo mặc định "UITHCM@2026" thành công!');
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  // Count active pending cancellation proofs for notification badges
  const pendingCancelCount = registrations.filter(r => r.status === 'cancelled_pending_approval').length;
  const pendingRefundCount = registrations.filter(r => r.feeStatus === 'pending').length;

  // Sidebar Menu Configuration
  const menuItems = [
    { id: 'dashboard', label: 'Trang chủ / Tổng quan', icon: Compass },
    { id: 'category', label: 'Danh mục nền', icon: Layers },
    { id: 'plans', label: 'Đợt kiến tập', icon: Calendar },
    { id: 'visits', label: 'Chuyến tham quan', icon: Building },
    { id: 'students', label: 'Sinh viên & Lịch lớp', icon: Users },
    { id: 'registrations', label: 'Quản lý đăng ký', icon: FileCheck, badge: pendingCancelCount },
    { id: 'supervisors', label: 'Phân công GVHD', icon: GraduationCap },
    { id: 'leaders', label: 'Phân công GV dẫn đoàn', icon: UserCheck },
    { id: 'accounts', label: 'Tài khoản người dùng', icon: ShieldAlert }
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex text-slate-800 antialiased">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white p-5 border-r border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md font-extrabold text-base">
            KT
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-100 uppercase">Khoa CNTT</h1>
            <span className="text-[10px] text-slate-400 font-medium block">Hệ thống Quản lý Kiến tập</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-extrabold text-xs text-white uppercase">
              NK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-slate-200 truncate">Nguyễn Văn Khoa</p>
              <span className="text-[9px] text-slate-500 font-mono block truncate">khoanv@uit.edu.vn</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER & DRAWER */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-slate-900 lg:bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40 select-none">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-1 text-slate-400 lg:hidden hover:bg-slate-800/20 rounded"
            >
              {mobileSidebarOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white lg:text-slate-700" />}
            </button>
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md font-extrabold text-xs">KT</div>
              <h1 className="font-extrabold text-xs text-white">Quản lý Kiến tập</h1>
            </div>
            
            {/* Desktop header title */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Activity size={14} className="text-indigo-500" />
              <span>Học kỳ 1, Năm học 2025-2026</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">UIT-HCM</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification icons */}
            <div className="relative cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-full">
              <Bell size={18} />
              {(pendingCancelCount + pendingRefundCount) > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              )}
            </div>

            {/* User display */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-700">PGS. TS. Nguyễn Văn Khoa</p>
                <span className="text-[10px] text-slate-400 font-semibold block">Trưởng ban Kiến tập</span>
              </div>
            </div>
          </div>
        </header>

        {/* MOBILE DRAWER BACKDROP & PANEL */}
        {mobileSidebarOpen && (
          <>
            <div 
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-fade-in"
            ></div>
            <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white p-5 border-r border-slate-800 z-50 flex flex-col animate-slide-right select-none">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">KT</div>
                  <h1 className="font-extrabold text-sm tracking-tight text-slate-100 uppercase">Quản lý Kiến tập</h1>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 hover:text-slate-200 font-bold">×</button>
              </div>

              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-800 mt-auto">
                <p className="text-xs font-bold text-slate-200">Nguyễn Văn Khoa</p>
                <span className="text-[10px] text-slate-500 block">khoanv@uit.edu.vn</span>
              </div>
            </aside>
          </>
        )}

        {/* MAIN VIEWS SWITCHBOARD CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView 
              onNavigate={(tab) => setActiveTab(tab)} 
              pendingRefundCount={pendingRefundCount}
              pendingCancelCount={pendingCancelCount}
            />
          )}

          {activeTab === 'category' && (
            <CategoryView 
              years={years}
              semesters={semesters}
              onAddYear={handleAddYear}
              onAddSemester={handleAddSemester}
              onDeleteYear={handleDeleteYear}
              onDeleteSemester={handleDeleteSemester}
              onToggleYearStatus={handleToggleYearStatus}
            />
          )}

          {activeTab === 'plans' && (
            <PlanView 
              plans={plans}
              years={years}
              semesters={semesters}
              onAddPlan={handleAddPlan}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {activeTab === 'visits' && (
            <VisitView 
              visits={visits}
              plans={plans}
              onAddVisit={handleAddVisit}
            />
          )}

          {activeTab === 'students' && (
            <StudentView 
              students={students}
              plans={plans}
              onAddStudent={handleAddStudent}
              onBulkImport={handleBulkImportStudents}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'registrations' && (
            <RegistrationView 
              registrations={registrations}
              plans={plans}
              visits={visits}
              onUpdateStatus={handleUpdateRegistrationStatus}
              onUpdateFeeStatus={handleUpdateRegistrationFeeStatus}
              onFreezeList={handleFreezeVisitList}
            />
          )}

          {activeTab === 'supervisors' && (
            <SupervisorAssignmentView 
              students={students}
              lecturers={lecturers}
              plans={plans}
              onAssignSupervisor={handleAssignSupervisor}
              onAutoAssign={handleAutoAssignSupervisors}
            />
          )}

          {activeTab === 'leaders' && (
            <LeaderAssignmentView 
              visits={visits}
              lecturers={lecturers}
              plans={plans}
              onAssignLeader={handleAssignLeader}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountView 
              accounts={accounts}
              onAddAccount={handleAddAccount}
              onToggleStatus={handleToggleAccountStatus}
              onResetPassword={handleResetAccountPassword}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
        </main>
      </div>
    </div>
  );
}
