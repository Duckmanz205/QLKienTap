/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core System Categories
export interface AcademicYear {
  id: string;
  name: string; // e.g., "2025-2026", "2024-2025"
  status: 'active' | 'inactive';
}

export interface Semester {
  id: string;
  name: string; // e.g., "Học kỳ 1", "Học kỳ 2"
  yearId: string;
  startDate: string;
  endDate: string;
}

// Internship Plan (Đợt kiến tập)
export interface InternshipPlan {
  id: string;
  name: string; // e.g., "Kiến tập Cơ sở ngành", "Thực tập Tốt nghiệp"
  yearId: string;
  semesterId: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
}

// Student (Sinh viên)
export interface Student {
  mssv: string;
  fullName: string;
  email: string;
  class: string;
  phone: string;
  planId?: string; // assigned internship plan
  supervisorId?: string; // assigned lecturer
}

// Lecturer (Giảng viên)
export interface Lecturer {
  id: string;
  fullName: string;
  email: string;
  department: string;
  maxStudents: number;
  currentStudents: number;
}

// Factory Visit (Chuyến tham quan kiến tập)
export interface FactoryVisit {
  id: string;
  planId: string;
  factoryName: string; // e.g., "Vinamilk", "Acecook", "Intel Products"
  date: string;
  startTime: string;
  endTime: string;
  mode: 'direct' | 'online'; // Direct or Online
  organizer: 'department' | 'self'; // Organized by department or self-organized
  capacity: number;
  registeredCount: number;
  leaderId?: string; // assigned tour leader (GV dẫn đoàn)
  address?: string;
  notes?: string;
}

// Registration Record
export type RegistrationStatus = 
  | 'pending' 
  | 'valid' 
  | 'rejected' 
  | 'cancelled_pending_approval' 
  | 'cancelled' 
  | 'attended' 
  | 'absent' 
  | 'completed' 
  | 'failed';

export interface Registration {
  id: string;
  mssv: string;
  studentName: string;
  studentClass: string;
  visitId: string;
  visitName: string;
  registeredAt: string;
  status: RegistrationStatus;
  cancellationReason?: string;
  cancellationProofUrl?: string; // file name or base64 placeholder
  feePaid: boolean;
  feeReceiptUrl?: string;
  feeStatus: 'unpaid' | 'pending' | 'verified';
}

// User Account
export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'lecturer' | 'student';
  status: 'active' | 'locked';
  lastLogin: string;
  email: string;
}

// System Statistics
export interface SystemStats {
  activeStudents: number;
  openVisits: number;
  pendingRefunds: number;
  feeCompletionRate: number;
}
