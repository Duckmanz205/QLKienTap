export interface Trip {
  id: string;
  name: string;
  type: 'Trực tiếp' | 'Trực tuyến' | 'Tự do';
  industry: string;
  date: string;
  time: string;
  location: string;
  description: string;
  reminders?: string[];
  heroImage: string;
  isRegistered: boolean;
  isCompleted: boolean;
  gradeDetails?: {
    preparation: number; // Điểm chuẩn bị
    report: number; // Bài thu hoạch
    evaluation: number; // Báo cáo TQNM (Thực tế doanh nghiệp)
    bonus: number; // Điểm cộng
    total: number; // Điểm chuyến
  };
}

export interface Notification {
  id: string;
  title: string;
  type: 'Lịch trình thay đổi' | 'Kết quả báo cáo' | 'Cập nhật tài liệu' | 'Nhắc nhở đóng phí';
  content: string;
  timeText: string;
  isRead: boolean;
  attachment?: string | null;
}

export interface Submission {
  id: string;
  tripName: string;
  typeText: string;
  dateText: string;
  status: 'Chưa nộp' | 'Đã nộp' | 'Trễ hạn - trừ điểm';
  fileName?: string | null;
  fileSize?: string | null;
  submittedAt?: string | null;
  hasConfirmationFile?: boolean;
  confirmationFileName?: string | null;
}

export interface Payment {
  id: string;
  tripId: string;
  name: string;
  code: string;
  amount: number;
  dueDate: string;
  status: 'Chưa đóng' | 'Đã đóng đúng hạn' | 'Vi phạm';
}

export interface RefundRequest {
  id: string;
  invoiceName: string;
  dateText: string;
  amountText: string;
  status: 'Chờ xử lý' | 'Đã hoàn tiền';
}

export interface StudentProfile {
  name: string;
  email: string;
  studentId: string;
  class: string;
  major: string;
  avatar: string;
}
