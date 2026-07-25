/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, Student, Trip, SystemNotification, CouncilMeeting } from './types';
import { 
  initialStudents, 
  initialTrips, 
  initialNotifications, 
  initialCouncilMeetings 
} from './initialData';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardLecturer from './components/DashboardLecturer';
import StudentListGrade from './components/StudentListGrade';
import GradingDetail from './components/GradingDetail';
import AttendanceManager from './components/AttendanceManager';
import PrepAndBonusGrades from './components/PrepAndBonusGrades';
import CouncilGrading from './components/CouncilGrading';
import NotificationCenter from './components/NotificationCenter';
import StudentCalendarView from './components/StudentCalendarView';
import StudentReportSubmission from './components/StudentReportSubmission';
import StudentHomeAndFinance from './components/StudentHomeAndFinance';

export default function App() {
  // --- Persistent State management ---
  const [role, setRole] = useState<UserRole>(() => {
    const cached = localStorage.getItem('ims_role');
    return (cached as UserRole) || 'lecturer';
  });

  const [activeView, setActiveView] = useState<string>(() => {
    const cached = localStorage.getItem('ims_active_view');
    if (cached) return cached;
    return 'dashboard';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const cached = localStorage.getItem('ims_students');
    return cached ? JSON.parse(cached) : initialStudents;
  });

  const [trips] = useState<Trip[]>(() => {
    const cached = localStorage.getItem('ims_trips');
    return cached ? JSON.parse(cached) : initialTrips;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const cached = localStorage.getItem('ims_notifications');
    return cached ? JSON.parse(cached) : initialNotifications;
  });

  const [selectedStudentMssv, setSelectedStudentMssv] = useState<string | null>(() => {
    return localStorage.getItem('ims_selected_student_mssv') || '20123456';
  });

  // --- Synchronization to localStorage ---
  useEffect(() => {
    localStorage.setItem('ims_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('ims_active_view', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('ims_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('ims_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (selectedStudentMssv) {
      localStorage.setItem('ims_selected_student_mssv', selectedStudentMssv);
    } else {
      localStorage.removeItem('ims_selected_student_mssv');
    }
  }, [selectedStudentMssv]);

  // --- State setters/handlers ---
  const handleSaveGrade = (mssv: string, score: number, comments: string) => {
    setStudents(prev => 
      prev.map(s => 
        s.mssv === mssv 
          ? { 
              ...s, 
              preparatoryGrade: score, 
              notes: comments, 
              gradeStatus: 'completed' as const 
            } 
          : s
      )
    );
  };

  const handleUpdateGrades = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleToggleNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n)
    );
  };

  // --- Dynamic Title mapping ---
  const getViewTitle = () => {
    const isLecturer = role === 'lecturer';
    if (isLecturer) {
      switch (activeView) {
        case 'dashboard':
          return 'Giảng viên - Trang chủ';
        case 'lich-dan-doan-lecturer':
          return 'Lịch dẫn đoàn kiến tập';
        case 'diem-danh-sinh-vien':
          return 'Điểm danh sinh viên';
        case 'diem-chuan-bi-diem-cong':
          return 'Nhập điểm chuẩn bị & cộng';
        case 'sinh-vien-huong-dan':
          return 'Sinh viên thầy cô hướng dẫn';
        case 'buoi-bao-cao-tqnm':
          return 'Hội đồng chấm báo cáo';
        case 'cham-bai-detail':
          return 'Chấm bài chi tiết sinh viên';
        case 'thong-bao':
          return 'Thông báo hệ thống';
        default:
          return 'Quản lý Kiến tập';
      }
    } else {
      switch (activeView) {
        case 'student-dashboard':
          return 'Sinh viên - Trang chủ';
        case 'chuyen-tham-quan':
          return 'Danh sách chuyến tham quan';
        case 'lich-trinh-doan':
          return 'Lịch trình đoàn kiến tập';
        case 'nop-bai-thu-hoach':
          return 'Cổng nộp bài thu hoạch';
        case 'ket-qua-diem':
          return 'Bảng kết quả & điểm số';
        case 'thanh-toan':
          return 'Thanh toán lệ phí học phần';
        case 'hoan-phi':
          return 'Yêu cầu hoàn trả chi phí';
        case 'thong-bao':
          return 'Thông báo học tập';
        default:
          return 'IMS Student Portal';
      }
    }
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(n => n.unread).length;

  // Active student for grading detail
  const gradingStudentObj = students.find(s => s.mssv === selectedStudentMssv) || students[0];

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      {/* Sidebar navigation */}
      <Sidebar 
        role={role}
        activeView={activeView}
        onViewChange={setActiveView}
        unreadCount={unreadCount}
      />

      {/* Main workspace area */}
      <div className="flex-1 flex flex-col pl-[260px] min-h-screen">
        {/* Header toolbar */}
        <Header 
          role={role}
          onRoleChange={setRole}
          unreadCount={unreadCount}
          onViewChange={setActiveView}
          title={getViewTitle()}
        />

        {/* Content canvas container */}
        <main className="flex-1 pt-[64px] pb-12">
          {/* LECTURER VIEWS */}
          {role === 'lecturer' && (
            <>
              {activeView === 'dashboard' && (
                <DashboardLecturer 
                  students={students}
                  trips={trips}
                  onViewChange={setActiveView}
                  onSelectStudentForGrading={setSelectedStudentMssv}
                />
              )}
              {activeView === 'lich-dan-doan-lecturer' && (
                <StudentCalendarView 
                  trips={trips}
                  onViewChange={setActiveView}
                />
              )}
              {activeView === 'diem-danh-sinh-vien' && (
                <AttendanceManager 
                  students={students}
                  trips={trips}
                />
              )}
              {activeView === 'diem-chuan-bi-diem-cong' && (
                <PrepAndBonusGrades 
                  students={students}
                  onUpdateGrades={handleUpdateGrades}
                />
              )}
              {activeView === 'sinh-vien-huong-dan' && (
                <StudentListGrade 
                  students={students}
                  onViewChange={setActiveView}
                  onSelectStudentForGrading={setSelectedStudentMssv}
                />
              )}
              {activeView === 'cham-bai-detail' && gradingStudentObj && (
                <GradingDetail 
                  student={gradingStudentObj}
                  onSaveGrade={handleSaveGrade}
                  onBack={() => setActiveView('sinh-vien-huong-dan')}
                />
              )}
              {activeView === 'buoi-bao-cao-tqnm' && (
                <CouncilGrading 
                  meetings={initialCouncilMeetings}
                  students={students}
                />
              )}
            </>
          )}

          {/* STUDENT VIEWS */}
          {role === 'student' && (
            <>
              {(activeView === 'student-dashboard' || 
                activeView === 'chuyen-tham-quan' || 
                activeView === 'ket-qua-diem' || 
                activeView === 'thanh-toan' || 
                activeView === 'hoan-phi') && (
                <StudentHomeAndFinance 
                  view={activeView}
                  trips={trips}
                  onViewChange={setActiveView}
                />
              )}
              {activeView === 'lich-trinh-doan' && (
                <StudentCalendarView 
                  trips={trips}
                  onViewChange={setActiveView}
                />
              )}
              {activeView === 'nop-bai-thu-hoach' && (
                <StudentReportSubmission />
              )}
            </>
          )}

          {/* COMMON VIEWS */}
          {activeView === 'thong-bao' && (
            <NotificationCenter 
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onToggleRead={handleToggleNotificationRead}
            />
          )}
        </main>
      </div>
    </div>
  );
}
