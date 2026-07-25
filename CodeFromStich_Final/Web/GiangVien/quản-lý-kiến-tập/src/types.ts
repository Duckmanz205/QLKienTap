export type UserRole = 'lecturer' | 'student';

export interface Student {
  mssv: string;
  name: string;
  class: string;
  avatar?: string;
  completedTrips: number;
  totalTrips: number;
  pendingReports: number;
  gradeStatus: 'completed' | 'pending' | 'none';
  preparatoryGrade?: number; // Điểm chuẩn bị
  bonusGrade?: number; // Điểm cộng
  notes?: string;
}

export interface Trip {
  id: string;
  factoryName: string;
  date: string;
  time: string;
  type: 'direct' | 'online'; // Trực tiếp | Trực tuyến
  address: string;
  studentCount: number;
  maxStudents: number;
  status: 'completed' | 'ongoing' | 'upcoming'; // Đã hoàn thành | Đang diễn ra | Sắp diễn ra
  image?: string;
}

export interface AttendanceRecord {
  mssv: string;
  status: 'present' | 'absent' | 'rejected'; // Có mặt | Vắng | Từ chối
  note?: string;
}

export interface TripAttendance {
  tripId: string;
  records: Record<string, AttendanceRecord>; // key: mssv
  lastSaved?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  time: string;
  description: string;
  type: 'assignment' | 'event_change' | 'student_add' | 'announcement' | 'success' | 'reminder';
  unread: boolean;
  attachment?: string;
}

export interface CouncilMeeting {
  id: string;
  name: string;
  chairman: string;
  date: string;
  time: string;
  room: string;
  studentCount: number;
  status: 'ongoing' | 'upcoming' | 'completed';
}

export interface StudentReportGrading {
  mssv: string;
  tripId: string;
  score?: number;
  comments?: string;
  gradedByCouncil: {
    [member: string]: boolean; // key is name, value is completed
  };
  hasMyGrade: boolean;
}
