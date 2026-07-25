export type UserRole = 'Quản lý khoa' | 'Giảng viên' | 'Sinh viên';
export type UserStatus = 'Hoạt động' | 'Khóa tài khoản';

export interface UserAccount {
  username: string;
  fullname: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

export interface CommitteeMember {
  name: string;
  role: string;
  avatar?: string;
  initial?: string;
}

export interface ReporterStudent {
  name: string;
  mssv: string;
  topic: string;
}

export interface CommitteeBoard {
  id: string;
  name: string;
  internshipPlan: string;
  datetime: string;
  time: string;
  location: string;
  members: CommitteeMember[];
  numStudents: number;
  status: 'Sắp diễn ra' | 'Đang diễn ra' | 'Đã hoàn thành';
  reporters: ReporterStudent[];
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  recipients: string[];
  dateSent: string;
  readCount: string;
  readPercentage: number;
  isStarred?: boolean;
  content?: string;
}

export interface FeeRecord {
  mssv: string;
  fullname: string;
  tripName: string;
  amount: number;
  paymentContent: string;
  deadline: string;
  actualPayDate: string;
  status: 'Đã đóng đúng hạn' | 'Chưa đóng' | 'Vi phạm' | 'Đã hoàn phí';
}

export interface FactorySubGrade {
  cb: number | '-'; // chuẩn bị
  th: number | '-'; // thực hành
  bc: number | '-'; // báo cáo
  t: number | '-'; // tổng
}

export interface ResultRecord {
  mssv: string;
  fullname: string;
  cp: FactorySubGrade;
  acecook: FactorySubGrade;
  ajinomoto: FactorySubGrade;
  finalGpa: number | '-';
  resultStatus: 'Đạt' | 'Không đạt' | 'Đang thực hiện' | 'Chưa hoàn thành';
}

export interface RefundRecord {
  mssv: string;
  fullname: string;
  department: string;
  relatedInvoice: string;
  fileUrl: string;
  dateSubmitted: string;
  status: 'Chờ xử lý' | 'Đã hoàn tiền' | 'Từ chối';
  processedDate?: string;
  avatar?: string;
}

export interface TripDetail {
  id: string;
  name: string;
  factory: string;
  date: string;
  registeredCount: number;
  actualCount: number | '-';
  status: 'Đã hoàn thành' | 'Đang diễn ra' | 'Đã hủy';
}
