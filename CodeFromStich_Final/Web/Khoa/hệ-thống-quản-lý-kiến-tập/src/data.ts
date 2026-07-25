import { 
  UserAccount, 
  CommitteeBoard, 
  SystemAnnouncement, 
  FeeRecord, 
  ResultRecord, 
  RefundRecord, 
  TripDetail 
} from './types';

export const initialUserAccounts: UserAccount[] = [
  {
    username: 'admin_khoa',
    fullname: 'Nguyễn Văn A',
    role: 'Quản lý khoa',
    status: 'Hoạt động',
    lastLogin: '10:30 / 25/05/2024'
  },
  {
    username: 'gv_tuan',
    fullname: 'Lê Minh Tuấn',
    role: 'Giảng viên',
    status: 'Hoạt động',
    lastLogin: '08:15 / 24/05/2024'
  },
  {
    username: 'sv_hoa',
    fullname: 'Phạm Thị Hoa',
    role: 'Sinh viên',
    status: 'Khóa tài khoản',
    lastLogin: '15:45 / 20/05/2024'
  },
  {
    username: 'gv_lan',
    fullname: 'Trần Thị Lan',
    role: 'Giảng viên',
    status: 'Hoạt động',
    lastLogin: '11:00 / 24/05/2024'
  },
  {
    username: 'sv_hung',
    fullname: 'Nguyễn Duy Hưng',
    role: 'Sinh viên',
    status: 'Hoạt động',
    lastLogin: '09:30 / 23/05/2024'
  },
  {
    username: 'sv_dung',
    fullname: 'Lê Tiến Dũng',
    role: 'Sinh viên',
    status: 'Hoạt động',
    lastLogin: '16:15 / 22/05/2024'
  },
  {
    username: 'admin_audit',
    fullname: 'Vũ Quốc Huy',
    role: 'Quản lý khoa',
    status: 'Hoạt động',
    lastLogin: '14:20 / 21/05/2024'
  },
  {
    username: 'gv_phuong',
    fullname: 'Đỗ Minh Phương',
    role: 'Giảng viên',
    status: 'Khóa tài khoản',
    lastLogin: '10:05 / 19/05/2024'
  }
];

export const initialCommitteeBoards: CommitteeBoard[] = [
  {
    id: 'HD-2023-01',
    name: 'HĐ Bảo vệ Đợt 1',
    internshipPlan: 'HK1 2023-2024',
    datetime: '2023-11-15',
    time: '08:00',
    location: 'Phòng A101',
    members: [
      { name: 'Nguyễn Văn A', role: 'Trưởng ban', initial: 'A' },
      { name: 'Trần Thị B', role: 'Ủy viên', initial: 'B' },
      { name: 'Lê Văn C', role: 'Thư ký', initial: 'C' }
    ],
    numStudents: 15,
    status: 'Sắp diễn ra',
    reporters: [
      { name: 'Phạm Hữu D', mssv: 'SV20201234', topic: 'Tối ưu hóa quy trình X' },
      { name: 'Hoàng Thị E', mssv: 'SV20205678', topic: 'Phân tích dữ liệu Y' },
      { name: 'Vũ Minh F', mssv: 'SV20209012', topic: 'Ứng dụng Z trong thực tiễn' }
    ]
  },
  {
    id: 'HD-2023-02',
    name: 'HĐ Bảo vệ Đợt 2',
    internshipPlan: 'HK1 2023-2024',
    datetime: '2023-11-15',
    time: '13:30',
    location: 'Phòng A102',
    members: [
      { name: 'Trần Minh Tuấn', role: 'Trưởng ban', initial: 'T' },
      { name: 'Phan Thị Diễm', role: 'Ủy viên', initial: 'D' }
    ],
    numStudents: 12,
    status: 'Đang diễn ra',
    reporters: [
      { name: 'Nguyễn Văn Minh', mssv: 'SV20202244', topic: 'Nghiên cứu thị trường sữa' },
      { name: 'Trần Bảo Ngọc', mssv: 'SV20203355', topic: 'Dây chuyền sản xuất khép kín' }
    ]
  },
  {
    id: 'HD-2023-00',
    name: 'HĐ Báo cáo Sớm',
    internshipPlan: 'HK1 2023-2024',
    datetime: '2023-11-10',
    time: '08:00',
    location: 'Phòng B201',
    members: [
      { name: 'Nguyễn Tiến Dũng', role: 'Trưởng ban', initial: 'D' },
      { name: 'Vũ Thị Lan', role: 'Ủy viên', initial: 'L' },
      { name: 'Bùi Minh Đức', role: 'Ủy viên', initial: 'Đ' }
    ],
    numStudents: 18,
    status: 'Đã hoàn thành',
    reporters: [
      { name: 'Lương Thế Vinh', mssv: 'SV20201100', topic: 'Học tập thực tế tại Vinamilk' }
    ]
  }
];

export const initialAnnouncements: SystemAnnouncement[] = [
  {
    id: 'ANN-01',
    title: 'Thông báo kế hoạch kiến tập đợt 1 năm 2024',
    recipients: ['Tất cả'],
    dateSent: '12/10/2023 08:30',
    readCount: '45/60',
    readPercentage: 75,
    isStarred: true,
    content: 'Thông báo chi tiết về kế hoạch đi kiến tập thực tế dành cho toàn bộ sinh viên khoa Công nghệ Thực phẩm đợt 1 năm học 2023 - 2024. Đề nghị các bạn theo dõi lịch trình, chuẩn bị đầy đủ trang phục bảo hộ lao động và ghi chép nhật ký đầy đủ.'
  },
  {
    id: 'ANN-02',
    title: 'Yêu cầu nộp báo cáo tiến độ tuần 2',
    recipients: ['14ĐHTP', '13ĐHTP'],
    dateSent: '10/10/2023 14:15',
    readCount: '40/100',
    readPercentage: 40,
    isStarred: false,
    content: 'Yêu cầu toàn bộ sinh viên thuộc các lớp 14ĐHTP và 13ĐHTP khẩn trương nộp file báo cáo tiến độ thực hành kiến tập tuần thứ 2 lên hệ thống. Hạn chót trước 23h59 ngày 15/10/2023.'
  },
  {
    id: 'ANN-03',
    title: 'Cập nhật danh sách giảng viên hướng dẫn',
    recipients: ['Giảng viên'],
    dateSent: '08/10/2023 09:00',
    readCount: '20/20',
    readPercentage: 100,
    isStarred: false,
    content: 'Ban chủ nhiệm khoa thực phẩm đã cập nhật danh sách phân công Giảng viên hướng dẫn chi tiết cho từng nhóm sinh viên. Giảng viên vui lòng đăng nhập vào tài khoản để tải danh sách học viên phụ trách của mình.'
  }
];

export const initialFeeRecords: FeeRecord[] = [
  {
    mssv: '21110001',
    fullname: 'Nguyễn Văn An',
    tripName: 'FPT Software D19',
    amount: 1500000,
    paymentContent: '21110001 NGUYEN VAN AN KT24',
    deadline: '15/10/2023',
    actualPayDate: '12/10/2023',
    status: 'Đã đóng đúng hạn'
  },
  {
    mssv: '21110045',
    fullname: 'Trần Thị Bình',
    tripName: 'KMS Technology',
    amount: 1500000,
    paymentContent: '-',
    deadline: '15/10/2023',
    actualPayDate: '-',
    status: 'Chưa đóng'
  },
  {
    mssv: '21110123',
    fullname: 'Lê Hoàng Nam',
    tripName: 'VNG Campus',
    amount: 1500000,
    paymentContent: '21110123 LE HOANG NAM KT',
    deadline: '15/10/2023',
    actualPayDate: '20/10/2023',
    status: 'Vi phạm'
  },
  {
    mssv: '21110289',
    fullname: 'Phạm Thúy Vi',
    tripName: 'TMA Solutions',
    amount: 1500000,
    paymentContent: 'PHI KT TMA PHAM THUY VI',
    deadline: '15/10/2023',
    actualPayDate: '14/10/2023',
    status: 'Đã đóng đúng hạn'
  },
  {
    mssv: '21110456',
    fullname: 'Vũ Minh Tuấn',
    tripName: 'Viettel Group (Hủy)',
    amount: 1500000,
    paymentContent: 'Hoàn trả STK 1903...',
    deadline: '-',
    actualPayDate: '18/10/2023 (Hoàn)',
    status: 'Đã hoàn phí'
  }
];

export const initialResultRecords: ResultRecord[] = [
  {
    mssv: '20123456',
    fullname: 'Nguyễn Văn An',
    cp: { cb: 2.0, th: 3.5, bc: 4.0, t: 9.5 },
    acecook: { cb: 1.5, th: 3.0, bc: 3.5, t: 8.0 },
    ajinomoto: { cb: 2.0, th: 4.0, bc: 3.0, t: 9.0 },
    finalGpa: 8.8,
    resultStatus: 'Đạt'
  },
  {
    mssv: '20123457',
    fullname: 'Trần Thị Bình',
    cp: { cb: 0.5, th: 1.5, bc: 2.0, t: 4.0 },
    acecook: { cb: 1.0, th: 2.0, bc: 2.0, t: 5.0 },
    ajinomoto: { cb: 0.0, th: '-', bc: '-', t: 0.0 },
    finalGpa: 3.0,
    resultStatus: 'Không đạt'
  },
  {
    mssv: '20123458',
    fullname: 'Lê Văn Cường',
    cp: { cb: 2.0, th: 3.0, bc: 3.5, t: 8.5 },
    acecook: { cb: 1.5, th: 3.5, bc: '-', t: 5.0 },
    ajinomoto: { cb: '-', th: '-', bc: '-', t: '-' },
    finalGpa: '-',
    resultStatus: 'Đang thực hiện'
  },
  {
    mssv: '20123459',
    fullname: 'Đặng Quốc Bảo',
    cp: { cb: 1.5, th: 3.5, bc: 4.0, t: 9.0 },
    acecook: { cb: 2.0, th: 3.0, bc: 3.5, t: 8.5 },
    ajinomoto: { cb: 1.5, th: '-', bc: '-', t: 5.0 },
    finalGpa: '-',
    resultStatus: 'Chưa hoàn thành'
  }
];

export const initialRefundRecords: RefundRecord[] = [
  {
    mssv: '2012345',
    fullname: 'Trần Văn Thanh',
    department: 'Khoa CNTT',
    relatedInvoice: 'Khu CN Cao Q9 - Đợt 1',
    fileUrl: 'hoadon_tranthanh.pdf',
    dateSubmitted: '12/10/2023',
    status: 'Chờ xử lý',
    avatar: undefined
  },
  {
    mssv: '1956789',
    fullname: 'Nguyễn Thị Mai',
    department: 'Khoa Kinh Tế',
    relatedInvoice: 'Nhà máy Vinamilk Bình Dương',
    fileUrl: 'bill_mainguyen.pdf',
    dateSubmitted: '10/10/2023',
    status: 'Đã hoàn tiền',
    processedDate: '11/10/2023',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
  },
  {
    mssv: '2109876',
    fullname: 'Lê Hoàng Nam',
    department: 'Khoa Cơ Khí',
    relatedInvoice: 'Cảng Cát Lái',
    fileUrl: 'hoa_don_lehoangnam.pdf',
    dateSubmitted: '08/10/2023',
    status: 'Từ chối',
    processedDate: '09/10/2023',
    avatar: undefined
  },
  {
    mssv: '2033445',
    fullname: 'Phạm Hữu Trí',
    department: 'Khoa CNTT',
    relatedInvoice: 'Khu CN Cao Q9 - Đợt 2',
    fileUrl: 'invoice_huutri.pdf',
    dateSubmitted: '14/10/2023',
    status: 'Chờ xử lý',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  }
];

export const initialTripDetails: TripDetail[] = [
  {
    id: 'CTQ-001',
    name: 'Kiến tập Hệ thống dây chuyền sữa',
    factory: 'Nhà máy Vinamilk Bình Dương',
    date: '15/10/2023',
    registeredCount: 120,
    actualCount: 118,
    status: 'Đã hoàn thành'
  },
  {
    id: 'CTQ-002',
    name: 'Khảo sát Quy trình Đóng gói Mì',
    factory: 'Acecook Hồ Chí Minh',
    date: '18/10/2023',
    registeredCount: 80,
    actualCount: 80,
    status: 'Đã hoàn thành'
  },
  {
    id: 'CTQ-003',
    name: 'Kiến tập Quy trình Lên men & Đóng chai',
    factory: 'Nhà máy Suntory Pepsico',
    date: '22/10/2023',
    registeredCount: 150,
    actualCount: 142,
    status: 'Đang diễn ra'
  },
  {
    id: 'CTQ-004',
    name: 'Tham quan Trung tâm Nghiên cứu Phần mềm',
    factory: 'FPT Software Campus',
    date: '25/10/2023',
    registeredCount: 200,
    actualCount: '-',
    status: 'Đang diễn ra'
  },
  {
    id: 'CTQ-005',
    name: 'Hệ thống phân phối Co.opmart',
    factory: 'Saigon Co.op',
    date: '25/10/2023',
    registeredCount: 60,
    actualCount: 12,
    status: 'Đã hủy'
  }
];
