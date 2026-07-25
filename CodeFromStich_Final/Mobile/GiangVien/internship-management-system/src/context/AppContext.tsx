/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Student, 
  Tour, 
  CouncilSession, 
  Notification, 
  INITIAL_STUDENTS, 
  INITIAL_TOURS, 
  INITIAL_COUNCILS, 
  INITIAL_NOTIFICATIONS 
} from '../types';

export type ScreenType = 
  | 'home' 
  | 'schedule' 
  | 'attendance' 
  | 'grades' 
  | 'guided' 
  | 'notifications' 
  | 'evaluation' 
  | 'council';

interface AppContextType {
  activeScreen: ScreenType;
  setScreen: (screen: ScreenType, studentId?: string) => void;
  selectedStudentId: string | null;
  students: Student[];
  tours: Tour[];
  councils: CouncilSession[];
  notifications: Notification[];
  unreadNotificationsCount: number;
  updateAttendance: (id: string, status: Student['attendanceStatus'], reason?: string) => void;
  updateStudentGrade: (id: string, updates: Partial<Student>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  saveGrades: () => Promise<void>;
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Initialize states with local storage caching for stability
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('ims_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [tours, setTours] = useState<Tour[]>(() => {
    const saved = localStorage.getItem('ims_tours');
    return saved ? JSON.parse(saved) : INITIAL_TOURS;
  });

  const [councils, setCouncils] = useState<CouncilSession[]>(() => {
    const saved = localStorage.getItem('ims_councils');
    return saved ? JSON.parse(saved) : INITIAL_COUNCILS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('ims_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ims_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('ims_tours', JSON.stringify(tours));
  }, [tours]);

  useEffect(() => {
    localStorage.setItem('ims_councils', JSON.stringify(councils));
  }, [councils]);

  useEffect(() => {
    localStorage.setItem('ims_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const setScreen = (screen: ScreenType, studentId?: string) => {
    setActiveScreen(screen);
    if (studentId) {
      setSelectedStudentId(studentId);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => n.isUnread).length;

  const updateAttendance = (id: string, status: Student['attendanceStatus'], reason?: string) => {
    setStudents(prev => 
      prev.map(s => {
        if (s.id === id) {
          const updated = { ...s, attendanceStatus: status };
          if (reason !== undefined) {
            updated.excuseReason = reason;
          }
          return updated;
        }
        return s;
      })
    );
  };

  const updateStudentGrade = (id: string, updates: Partial<Student>) => {
    setStudents(prev => 
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const saveGrades = async () => {
    // Mimic API post delay
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const resetToDefault = () => {
    setStudents(INITIAL_STUDENTS);
    setTours(INITIAL_TOURS);
    setCouncils(INITIAL_COUNCILS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveScreen('home');
    setSelectedStudentId(null);
    localStorage.removeItem('ims_students');
    localStorage.removeItem('ims_tours');
    localStorage.removeItem('ims_councils');
    localStorage.removeItem('ims_notifications');
  };

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        setScreen,
        selectedStudentId,
        students,
        tours,
        councils,
        notifications,
        unreadNotificationsCount,
        updateAttendance,
        updateStudentGrade,
        markNotificationAsRead,
        markAllNotificationsRead,
        saveGrades,
        resetToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
