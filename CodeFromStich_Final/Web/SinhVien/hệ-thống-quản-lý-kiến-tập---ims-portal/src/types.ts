export interface Trip {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'Trực tiếp' | 'Trực tuyến';
  category: string;
  venue: string;
  slotsRemaining: number;
  image: string;
  registered: boolean;
  status: 'Hợp lệ' | 'Hoàn thành' | 'Chờ duyệt' | 'Vắng mặt';
  participantsCount: number;
  remainingDays?: number;
}

export interface Submission {
  id: string;
  tripId: string;
  tripTitle: string;
  type: 'Trực tiếp' | 'Trực tuyến' | 'Tự do';
  status: 'Chưa nộp' | 'Đã nộp' | 'Trễ hạn';
  date: string;
  deadline: string;
  deadlineTimestamp: number;
  submittedDate?: string;
  fileName?: string;
  fileSize?: string;
  proofFileName?: string;
  proofFileSize?: string;
  latePenalty?: boolean;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  isLeader: boolean;
  hasMedicalNotes: boolean;
  medicalNotes?: string;
  avatar?: string;
  checkedIn: boolean;
}

export interface Lecturer {
  name: string;
  degree: string;
  department: string;
  phone: string;
  avatar: string;
}

export interface RouteActivity {
  time: string;
  title: string;
  location?: string;
  details?: string[];
  transport?: string;
  isHighlight?: boolean;
}

export interface TripDetailSchedule {
  tripId: string;
  lecturer: Lecturer;
  vehicle: string;
  route: RouteActivity[];
}

export interface PaymentItem {
  id: string;
  tripId: string;
  tripTitle: string;
  code: string;
  amount: number;
  deadline: string;
  status: 'Đã đóng đúng hạn' | 'Chưa đóng' | 'Vi phạm' | 'Đã hoàn phí';
  payDate?: string;
}

export interface RefundItem {
  id: string;
  date: string;
  invoiceName: string;
  amount: number;
  status: 'Đã hoàn tiền' | 'Chờ xử lý' | 'Từ chối';
  note?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  timeRelative: string;
  isRead: boolean;
  category: 'lịch trình' | 'bài thu hoạch' | 'tài chính' | 'hệ thống';
  attachmentName?: string;
  attachmentSize?: string;
}
