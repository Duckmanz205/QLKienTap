/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AcademicYear, 
  Semester, 
  InternshipPlan, 
  Student, 
  Lecturer, 
  FactoryVisit, 
  Registration, 
  UserAccount 
} from './types';

// Initial Mock Seeds
export const defaultYears: AcademicYear[] = [
  { id: 'y1', name: '2025-2026', status: 'active' },
  { id: 'y2', name: '2024-2025', status: 'inactive' }
];

export const defaultSemesters: Semester[] = [
  { id: 's1', name: 'Học kỳ 1', yearId: 'y1', startDate: '2025-09-01', endDate: '2026-01-15' },
  { id: 's2', name: 'Học kỳ 2', yearId: 'y1', startDate: '2026-02-15', endDate: '2026-06-30' },
  { id: 's3', name: 'Học kỳ 1', yearId: 'y2', startDate: '2024-09-01', endDate: '2025-01-15' },
  { id: 's4', name: 'Học kỳ 2', yearId: 'y2', startDate: '2025-02-15', endDate: '2025-06-30' }
];

export const defaultPlans: InternshipPlan[] = [
  { id: 'p1', name: 'Kiến tập Cơ sở ngành - HK1 2025-2026', yearId: 'y1', semesterId: 's1', startDate: '2025-09-10', endDate: '2025-12-20', status: 'active' },
  { id: 'p2', name: 'Thực tập Tốt nghiệp - HK2 2024-2025', yearId: 'y2', semesterId: 's4', startDate: '2025-02-20', endDate: '2025-06-15', status: 'completed' },
  { id: 'p3', name: 'Kiến tập Chuyên ngành - HK2 2025-2026', yearId: 'y1', semesterId: 's2', startDate: '2026-03-01', endDate: '2026-05-30', status: 'planning' }
];

export const defaultLecturers: Lecturer[] = [
  { id: 'l1', fullName: 'ThS. Nguyễn Văn A', email: 'vana@uit.edu.vn', department: 'Công nghệ Phần mềm', maxStudents: 15, currentStudents: 12 },
  { id: 'l2', fullName: 'ThS. Lê Thị B', email: 'lethib@uit.edu.vn', department: 'Khoa học Máy tính', maxStudents: 15, currentStudents: 8 },
  { id: 'l3', fullName: 'TS. Phạm Thị D', email: 'phamthid@uit.edu.vn', department: 'Hệ thống Thông tin', maxStudents: 15, currentStudents: 5 },
  { id: 'l4', fullName: 'ThS. Hoàng Văn E', email: 'vane@uit.edu.vn', department: 'Mạng máy tính & Truyền thông', maxStudents: 15, currentStudents: 15 },
  { id: 'l5', fullName: 'TS. Trần Thị C', email: 'tranthic@uit.edu.vn', department: 'Kỹ thuật Máy tính', maxStudents: 15, currentStudents: 0 }
];

export const defaultStudents: Student[] = [
  { mssv: '22520120', fullName: 'Nguyễn Hoàng Long', email: 'longnh@gmail.com', class: 'KHMT2022', phone: '0901234567', planId: 'p1', supervisorId: 'l1' },
  { mssv: '22520340', fullName: 'Trần Thị Thu Thảo', email: 'thaott@gmail.com', class: 'KHMT2022', phone: '0901234568', planId: 'p1', supervisorId: 'l1' },
  { mssv: '22520442', fullName: 'Phạm Minh Quân', email: 'quanpm@gmail.com', class: 'CNPM2022', phone: '0901234569', planId: 'p1', supervisorId: 'l2' },
  { mssv: '22520555', fullName: 'Lê Hoài Nam', email: 'namlh@gmail.com', class: 'HTTT2022', phone: '0901234570', planId: 'p1', supervisorId: '' },
  { mssv: '22520678', fullName: 'Vũ Hoàng Anh', email: 'anhvh@gmail.com', class: 'HTTT2022', phone: '0901234571', planId: 'p1', supervisorId: '' },
  { mssv: '22520790', fullName: 'Đặng Minh Khôi', email: 'khoidm@gmail.com', class: 'CNPM2022', phone: '0901234572', planId: 'p1', supervisorId: 'l3' },
  { mssv: '22520801', fullName: 'Hoàng Bảo Trâm', email: 'tramhb@gmail.com', class: 'CNPM2022', phone: '0901234573', planId: 'p1', supervisorId: '' },
  { mssv: '22520912', fullName: 'Đỗ Tiến Đạt', email: 'datdt@gmail.com', class: 'KHMT2022', phone: '0901234574', planId: 'p1', supervisorId: 'l4' },
  { mssv: '22521033', fullName: 'Nguyễn Mai Chi', email: 'chinm@gmail.com', class: 'KTPM2022', phone: '0901234575', planId: 'p1', supervisorId: '' },
  { mssv: '22521154', fullName: 'Phan Văn Đức', email: 'ducpv@gmail.com', class: 'KTPM2022', phone: '0901234576', planId: 'p1', supervisorId: 'l2' }
];

export const defaultVisits: FactoryVisit[] = [
  { 
    id: 'v1', 
    planId: 'p1', 
    factoryName: 'Công ty Cổ phần Sữa Vinamilk - Nhà máy Bình Dương', 
    date: '2025-10-12', 
    startTime: '08:00', 
    endTime: '11:30', 
    mode: 'direct', 
    organizer: 'department', 
    capacity: 150, 
    registeredCount: 150, 
    leaderId: 'l1',
    address: 'KCN Mỹ Phước, Bến Cát, Bình Dương',
    notes: 'Trang phục chỉnh tề, quần dài, giày ba-ta hoặc giày quai hậu, mang theo thẻ sinh viên.'
  },
  { 
    id: 'v2', 
    planId: 'p1', 
    factoryName: 'Công ty Cổ phần Acecook Việt Nam - Tham quan Online', 
    date: '2025-10-15', 
    startTime: '14:00', 
    endTime: '16:00', 
    mode: 'online', 
    organizer: 'self', 
    capacity: 120, 
    registeredCount: 120, 
    address: 'Phòng MS Teams',
    notes: 'Chuyến online tự do đăng ký cho SV không thể đi thực tế.'
  },
  { 
    id: 'v3', 
    planId: 'p1', 
    factoryName: 'Công ty TNHH Intel Products Việt Nam - KCNC Quận 9', 
    date: '2025-10-19', 
    startTime: '08:30', 
    endTime: '12:00', 
    mode: 'direct', 
    organizer: 'department', 
    capacity: 80, 
    registeredCount: 40, 
    leaderId: 'l3',
    address: 'Lô I2, Đường D1, Khu Công Nghệ Cao, Quận 9, TP. HCM',
    notes: 'Đưa đón bằng xe trường tại cơ sở Linh Trung lúc 07:30.'
  },
  { 
    id: 'v4', 
    planId: 'p1', 
    factoryName: 'Công ty Cổ phần Thực phẩm Dinh dưỡng NutiFood', 
    date: '2025-10-24', 
    startTime: '13:30', 
    endTime: '17:00', 
    mode: 'direct', 
    organizer: 'department', 
    capacity: 100, 
    registeredCount: 95, 
    leaderId: 'l2',
    address: 'KCN Mỹ Phước, Bến Cát, Bình Dương',
    notes: 'Yêu cầu đúng giờ, đeo khẩu trang suốt chuyến tham quan.'
  }
];

export const defaultRegistrations: Registration[] = [
  {
    id: 'r1',
    mssv: '22520120',
    studentName: 'Nguyễn Hoàng Long',
    studentClass: 'KHMT2022',
    visitId: 'v1',
    visitName: 'Vinamilk Bình Dương',
    registeredAt: '2025-10-01 08:30:15',
    status: 'completed',
    feePaid: true,
    feeStatus: 'verified'
  },
  {
    id: 'r2',
    mssv: '22520340',
    studentName: 'Trần Thị Thu Thảo',
    studentClass: 'KHMT2022',
    visitId: 'v1',
    visitName: 'Vinamilk Bình Dương',
    registeredAt: '2025-10-01 08:31:00',
    status: 'valid',
    feePaid: true,
    feeStatus: 'verified'
  },
  {
    id: 'r3',
    mssv: '22520442',
    studentName: 'Phạm Minh Quân',
    studentClass: 'CNPM2022',
    visitId: 'v2',
    visitName: 'Acecook Online',
    registeredAt: '2025-10-02 09:15:22',
    status: 'cancelled_pending_approval',
    cancellationReason: 'Trùng lịch thi học kỳ bổ sung môn Đại số',
    cancellationProofUrl: 'minh_chung_thi.jpg',
    feePaid: true,
    feeStatus: 'pending'
  },
  {
    id: 'r4',
    mssv: '22520555',
    studentName: 'Lê Hoài Nam',
    studentClass: 'HTTT2022',
    visitId: 'v3',
    visitName: 'Intel Products Việt Nam',
    registeredAt: '2025-10-03 10:05:40',
    status: 'pending',
    feePaid: false,
    feeStatus: 'unpaid'
  },
  {
    id: 'r5',
    mssv: '22520678',
    studentName: 'Vũ Hoàng Anh',
    studentClass: 'HTTT2022',
    visitId: 'v3',
    visitName: 'Intel Products Việt Nam',
    registeredAt: '2025-10-03 10:12:11',
    status: 'valid',
    feePaid: true,
    feeStatus: 'verified'
  },
  {
    id: 'r6',
    mssv: '22520790',
    studentName: 'Đặng Minh Khôi',
    studentClass: 'CNPM2022',
    visitId: 'v4',
    visitName: 'NutiFood Bình Dương',
    registeredAt: '2025-10-01 11:30:00',
    status: 'valid',
    feePaid: true,
    feeStatus: 'pending' // pending refund approval representation
  },
  {
    id: 'r7',
    mssv: '22520801',
    studentName: 'Hoàng Bảo Trâm',
    studentClass: 'CNPM2022',
    visitId: 'v1',
    visitName: 'Vinamilk Bình Dương',
    registeredAt: '2025-10-01 08:35:40',
    status: 'rejected',
    feePaid: false,
    feeStatus: 'unpaid'
  },
  {
    id: 'r8',
    mssv: '22520912',
    studentName: 'Đỗ Tiến Đạt',
    studentClass: 'KHMT2022',
    visitId: 'v2',
    visitName: 'Acecook Online',
    registeredAt: '2025-10-02 14:20:00',
    status: 'attended',
    feePaid: true,
    feeStatus: 'verified'
  },
  {
    id: 'r9',
    mssv: '22521033',
    studentName: 'Nguyễn Mai Chi',
    studentClass: 'KTPM2022',
    visitId: 'v4',
    visitName: 'NutiFood Bình Dương',
    registeredAt: '2025-10-04 15:30:12',
    status: 'cancelled',
    feePaid: true,
    feeStatus: 'verified'
  },
  {
    id: 'r10',
    mssv: '22521154',
    studentName: 'Phan Văn Đức',
    studentClass: 'KTPM2022',
    visitId: 'v3',
    visitName: 'Intel Products Việt Nam',
    registeredAt: '2025-10-03 16:45:00',
    status: 'valid',
    feePaid: true,
    feeStatus: 'verified'
  }
];

export const defaultAccounts: UserAccount[] = [
  { id: 'u1', username: 'admin_khoa', fullName: 'PGS. TS. Nguyễn Văn Khoa', role: 'admin', status: 'active', lastLogin: '2026-07-15 08:30', email: 'khoanv@uit.edu.vn' },
  { id: 'u2', username: 'gv_nguyen_a', fullName: 'ThS. Nguyễn Văn A', role: 'lecturer', status: 'active', lastLogin: '2026-07-14 15:45', email: 'vana@uit.edu.vn' },
  { id: 'u3', username: 'gv_le_b', fullName: 'ThS. Lê Thị B', role: 'lecturer', status: 'active', lastLogin: '2026-07-12 10:20', email: 'lethib@uit.edu.vn' },
  { id: 'u4', username: 'sv_hoanglong', fullName: 'Nguyễn Hoàng Long', role: 'student', status: 'active', lastLogin: '2026-07-15 09:12', email: 'longnh@gmail.com' },
  { id: 'u5', username: 'sv_thuthao', fullName: 'Trần Thị Thu Thảo', role: 'student', status: 'active', lastLogin: '2026-07-11 14:02', email: 'thaott@gmail.com' },
  { id: 'u6', username: 'gv_hoang_e', fullName: 'ThS. Hoàng Văn E', role: 'lecturer', status: 'locked', lastLogin: '2026-05-20 11:30', email: 'vane@uit.edu.vn' }
];

// LocalStorage helpers
export const loadData = <T>(key: string, defaultVal: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
};
