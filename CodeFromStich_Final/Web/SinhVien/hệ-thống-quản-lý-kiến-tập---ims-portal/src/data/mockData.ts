import { Trip, Submission, Student, PaymentItem, RefundItem, NotificationItem, TripDetailSchedule } from '../types';

export const initialTrips: Trip[] = [
  {
    id: 'acecook-2023',
    title: 'Nhà máy Acecook Việt Nam',
    date: '25/10/2023',
    time: '08:00 - 11:30',
    type: 'Trực tiếp',
    category: 'SẢN XUẤT CÔNG NGHIỆP',
    venue: 'KCN VSIP 1, Thuận An, Bình Dương',
    slotsRemaining: 15,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFK91n1Xh6vIhZRC6c92b4DgWQgWVYDoYo30QsxwNMOKJEj6bLGjLQISwQWGsQ42eWUXUr8AIJuACZ90AzgTRQBHCY8LvzVXsUtKl7uU_enDQDcBEG-5prR-wprfNWHQXEqKL4djOQia-JmW8V6-aOw1Bkwwhvr9owcXqdyp1RNvB-3rA9YZi_WXgu7taxDfLrHi5J3jqHe92x0OReznFrbLX7pMNs1czzXRRmYGIaZYWxNpv9KWl_-w',
    registered: true,
    status: 'Hợp lệ',
    participantsCount: 45
  },
  {
    id: 'yakult-2023',
    title: 'Nhà máy Yakult Việt Nam',
    date: '25/10/2023',
    time: '08:00 - 11:30',
    type: 'Trực tiếp',
    category: 'SẢN XUẤT CÔNG NGHIỆP',
    venue: 'KCN VSIP 1, Phường Bình Hòa, Thuận An, Bình Dương',
    slotsRemaining: 15,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeddRjCt-NNpswvmWspj49JBsPofBcjU6tuoM1_NarZHiLlqElxJja3B2j08OgDqH1E9uSqhbaoae7buZBP_8hhh5E4xpOnpDGQdsrOM9bvXODX9jgnvIAYzCHeTcy5X-Ou6-z1CrwDzyjA1nac700LPkIhG2z8gGZoUfBTjUYJrTRqb7iriTcdZRMFJsp7-iIRalC1Yhqi3RAT6CMW6Ch2c7Vvb_ljsdRSLmdlae1FYUimEqNpvKWiw',
    registered: true,
    status: 'Hoàn thành',
    participantsCount: 45
  },
  {
    id: 'samsung-hcmc',
    title: 'Samsung HCMC',
    date: '30/10/2023',
    time: '13:00 - 16:30',
    type: 'Trực tuyến',
    category: 'CÔNG NGHỆ CAO',
    venue: 'Microsoft Teams',
    slotsRemaining: 120,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb1Y2AEmz3E6OxeBzNsA5F3Ikxci1wrim2P9lXrDqDl8L9jPgV2Zgw9JQm2rjwj_bXx_LE12hsb49JRjBRrhQ001qY5DQpHFLUhdZ-LX__mcaiCuhhhn3j4ql-hz0W67Az5FxsJ0OuF0NDyy5LNNl-0xjiRHOgl7AcVelL9Bp4ESC7eLJazzTWai8j5vQDrP-NhapH5S1rWcurQmOiiy3J4HxXHBGzxbFRzJyxWfNORm-C2LQOdTK2Jw',
    registered: true,
    status: 'Chờ duyệt',
    participantsCount: 80
  },
  {
    id: 'fpt-software',
    title: 'FPT Software',
    date: '05/10/2023',
    time: '08:30 - 12:00',
    type: 'Trực tiếp',
    category: 'CÔNG NGHỆ CAO',
    venue: 'Khu CNC, Quận 9, TP.HCM',
    slotsRemaining: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpxbNdPhUrGoOAeLrDls_ghJT1WE6JZGCFXwNufde6l5qm6H6oOjeH5aGhwFz5uJOf_IRl8sdR6Q3pZsRpjIGEqPzVSopTetnn6bP2VkslA53AM39m1CGRHRLI8g9boDhXIs60SArt1QXXevVGNzw0NsAIdYgnH1xG7ddI3hLAddPPUafiLOqtHgkcCrnjVqq1Nq8L4hQYI9ufJZ3qGzTiZ6lY1OMwuXQld84_n5Yh_lUBZNGzn_QO2w',
    registered: true,
    status: 'Vắng mặt',
    participantsCount: 45
  }
];

export const initialAvailableTrips: Trip[] = [
  {
    id: 'yakult-avail',
    title: 'Nhà máy Yakult Việt Nam',
    date: '25/10/2023',
    time: '08:00 - 11:30',
    type: 'Trực tiếp',
    category: 'SẢN XUẤT CÔNG NGHIỆP',
    venue: 'KCN VSIP 1, Bình Dương',
    slotsRemaining: 15,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeddRjCt-NNpswvmWspj49JBsPofBcjU6tuoM1_NarZHiLlqElxJja3B2j08OgDqH1E9uSqhbaoae7buZBP_8hhh5E4xpOnpDGQdsrOM9bvXODX9jgnvIAYzCHeTcy5X-Ou6-z1CrwDzyjA1nac700LPkIhG2z8gGZoUfBTjUYJrTRqb7iriTcdZRMFJsp7-iIRalC1Yhqi3RAT6CMW6Ch2c7Vvb_ljsdRSLmdlae1FYUimEqNpvKWiw',
    registered: false,
    status: 'Hợp lệ',
    participantsCount: 30
  },
  {
    id: 'acecook-avail',
    title: 'Công ty CP Acecook Việt Nam',
    date: '28/10/2023',
    time: '13:30 - 16:30',
    type: 'Trực tuyến',
    category: 'SẢN XUẤT CÔNG NGHIỆP',
    venue: 'Microsoft Teams',
    slotsRemaining: 9999, // Unbounded
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFK91n1Xh6vIhZRC6c92b4DgWQgWVYDoYo30QsxwNMOKJEj6bLGjLQISwQWGsQ42eWUXUr8AIJuACZ90AzgTRQBHCY8LvzVXsUtKl7uU_enDQDcBEG-5prR-wprfNWHQXEqKL4djOQia-JmW8V6-aOw1Bkwwhvr9owcXqdyp1RNvB-3rA9YZi_WXgu7taxDfLrHi5J3jqHe92x0OReznFrbLX7pMNs1czzXRRmYGIaZYWxNpv9KWl_-w',
    registered: false,
    status: 'Hợp lệ',
    participantsCount: 150
  },
  {
    id: 'fpt-avail',
    title: 'Khu công nghệ cao FPT Software',
    date: '02/11/2023',
    time: '08:30 - 12:00',
    type: 'Trực tiếp',
    category: 'CÔNG NGHỆ CAO',
    venue: 'Khu CNC, Quận 9, TP.HCM',
    slotsRemaining: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpxbNdPhUrGoOAeLrDls_ghJT1WE6JZGCFXwNufde6l5qm6H6oOjeH5aGhwFz5uJOf_IRl8sdR6Q3pZsRpjIGEqPzVSopTetnn6bP2VkslA53AM39m1CGRHRLI8g9boDhXIs60SArt1QXXevVGNzw0NsAIdYgnH1xG7ddI3hLAddPPUafiLOqtHgkcCrnjVqq1Nq8L4hQYI9ufJZ3qGzTiZ6lY1OMwuXQld84_n5Yh_lUBZNGzn_QO2w',
    registered: false,
    status: 'Hợp lệ',
    participantsCount: 42
  }
];

export const initialSubmissions: Submission[] = [
  {
    id: 'sub-1',
    tripId: 'acecook-2023',
    tripTitle: 'Nhà máy Acecook Việt Nam',
    type: 'Trực tiếp',
    status: 'Chưa nộp',
    date: '15/10/2023',
    deadline: '22/10/2023',
    deadlineTimestamp: new Date('2023-10-22').getTime()
  },
  {
    id: 'sub-2',
    tripId: 'techcombank-datacenter',
    tripTitle: 'Hội thảo Techcombank Data Center',
    type: 'Trực tuyến',
    status: 'Đã nộp',
    date: '02/10/2023',
    deadline: '08/10/2023',
    deadlineTimestamp: new Date('2023-10-08').getTime(),
    submittedDate: '05/10/2023 14:30',
    fileName: 'Bao_cao_Techcombank_NguyenVanA.pdf',
    fileSize: '2.4 MB'
  },
  {
    id: 'sub-3',
    tripId: 'samsung-bacninh',
    tripTitle: 'Khu công nghệ cao Samsung Bắc Ninh',
    type: 'Trực tiếp',
    status: 'Trễ hạn',
    date: '10/09/2023',
    deadline: '28/09/2023',
    deadlineTimestamp: new Date('2023-09-28').getTime(),
    latePenalty: true
  },
  {
    id: 'sub-4',
    tripId: 'fsoft-free',
    tripTitle: 'Công ty Phần mềm FPT (FSoft)',
    type: 'Tự do',
    status: 'Chưa nộp',
    date: '20/10/2023',
    deadline: '27/10/2023',
    deadlineTimestamp: new Date('2023-10-27').getTime()
  }
];

export const initialStudents: Student[] = [
  { id: 'sv-1', name: 'Nguyễn Thái An', studentId: '21110001', isLeader: true, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-2', name: 'Lê Văn B', studentId: '21110002', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-3', name: 'Trần Thị C', studentId: '21110003', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-4', name: 'Phạm Văn D', studentId: '21110004', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-5', name: 'Hoàng Thị E', studentId: '21110005', isLeader: false, hasMedicalNotes: true, medicalNotes: 'Dị ứng hải sản nặng, hen suyễn', checkedIn: false },
  { id: 'sv-6', name: 'Vũ Văn F', studentId: '21110006', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-7', name: 'Đặng Thị G', studentId: '21110007', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-8', name: 'Bùi Văn H', studentId: '21110008', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-9', name: 'Đỗ Thị I', studentId: '21110009', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-10', name: 'Hồ Văn K', studentId: '21110010', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-11', name: 'Ngô Thị L', studentId: '21110011', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-12', name: 'Dương Văn M', studentId: '21110012', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-13', name: 'Lý Thị N', studentId: '21110013', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-14', name: 'Đoàn Văn P', studentId: '21110014', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-15', name: 'Lâm Thị Q', studentId: '21110015', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-16', name: 'Trịnh Văn R', studentId: '21110016', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-17', name: 'Mai Thị S', studentId: '21110017', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-18', name: 'Đào Văn T', studentId: '21110018', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-19', name: 'Phan Thị U', studentId: '21110019', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-20', name: 'Võ Văn V', studentId: '21110020', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-21', name: 'Nguyễn Văn Đạt', studentId: '21110021', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-22', name: 'Trương Hoàng Giang', studentId: '21110022', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-23', name: 'Hồ Thanh Hải', studentId: '21110023', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-24', name: 'Lê Minh Khánh', studentId: '21110024', isLeader: false, hasMedicalNotes: false, checkedIn: false },
  { id: 'sv-25', name: 'Nguyễn Thị Loan', studentId: '21110025', isLeader: false, hasMedicalNotes: false, checkedIn: false }
];

export const initialSchedules: TripDetailSchedule[] = [
  {
    tripId: 'yakult-2023',
    lecturer: {
      name: 'ThS. Nguyễn Văn A',
      degree: 'ThS',
      department: 'Khoa Quản trị Kinh doanh',
      phone: '0901.234.567',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZY_tdzsi08ZpG3mFpLO7TSohwQd5SW_sMvxnmjuK-IXMNN--aKPbgrAiQXIVRdIjgpuuaSPWHhiZvQek-5hWxBZyRUUm35IMBlj7rQtEF09lbgt97auxJLJobBX-oLrIdpos1AIhPnPIXoHBuaDil_rA0LFa1XMNIvLhzYA_DXmwKDPnhDVjznQpBqyQq8LFYYkkmI8jBdf1aRhmEFhXBcq3_Wgf9nNHDVsLHV1D1RYcd-dIOhVagDA'
    },
    vehicle: 'Xe 45 chỗ (Biển số 51B-123.45)',
    route: [
      {
        time: '07:00',
        title: 'Tập trung điểm danh',
        location: 'Cổng chính Cơ sở 1',
        details: ['Sinh viên mặc đồng phục trường', 'Trưởng nhóm kiểm tra danh số thành viên']
      },
      {
        time: '07:30',
        title: 'Xuất phát di chuyển',
        details: ['Thời gian di chuyển dự kiến: 60 phút', 'Sinh viên giữ trật tự và an toàn trên xe']
      },
      {
        time: '08:30',
        title: 'Đến nhà máy & Tham quan',
        isHighlight: true,
        details: [
          'Nghe giới thiệu về lịch sử công ty',
          'Tham quan dây chuyền sản xuất khép kín',
          'Thưởng thức sản phẩm Yakult',
          'Q&A với đại diện nhà máy'
        ]
      },
      {
        time: '11:00',
        title: 'Chụp ảnh lưu niệm',
        details: ['Tập trung tại sảnh chính nhà máy', 'Tặng quà lưu niệm đại diện phía Yakult']
      },
      {
        time: '11:30',
        title: 'Kết thúc chuyến đi',
        location: 'Di chuyển về lại trường',
        details: ['Xe đón và trả sinh viên về điểm xuất phát ban đầu']
      }
    ]
  },
  {
    tripId: 'acecook-2023',
    lecturer: {
      name: 'TS. Lê Thị B',
      degree: 'TS',
      department: 'Khoa Công nghệ Thực phẩm',
      phone: '0988.765.432',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZY_tdzsi08ZpG3mFpLO7TSohwQd5SW_sMvxnmjuK-IXMNN--aKPbgrAiQXIVRdIjgpuuaSPWHhiZvQek-5hWxBZyRUUm35IMBlj7rQtEF09lbgt97auxJLJobBX-oLrIdpos1AIhPnPIXoHBuaDil_rA0LFa1XMNIvLhzYA_DXmwKDPnhDVjznQpBqyQq8LFYYkkmI8jBdf1aRhmEFhXBcq3_Wgf9nNHDVsLHV1D1RYcd-dIOhVagDA'
    },
    vehicle: 'Xe 45 chỗ (Biển số 51B-999.99)',
    route: [
      {
        time: '07:30',
        title: 'Tập trung và khởi hành',
        location: 'Sảnh nhà H, Cơ sở 1',
        details: ['Có mặt trước 15 phút', 'Đem theo sổ tay ghi chép kiến tập']
      },
      {
        time: '09:00',
        title: 'Tham quan xưởng sản xuất sợi mì',
        isHighlight: true,
        details: [
          'Quan sát quy trình cán bột, cắt sợi',
          'Quy trình chiên húp chân không hiện đại',
          'Đóng gói tự động hóa 100%'
        ]
      },
      {
        time: '11:00',
        title: 'Dùng thử sản phẩm & Thảo luận',
        details: ['Thử nghiệm dòng mì mới', 'Giải đáp cơ chế quản trị chất lượng HACCP']
      },
      {
        time: '12:00',
        title: 'Lên xe ra về',
        location: 'Trở lại Cơ sở 1'
      }
    ]
  }
];

export const initialPayments: PaymentItem[] = [
  {
    id: 'pay-1',
    tripId: 'acecook-2023',
    tripTitle: 'Nhà máy Acecook Việt Nam',
    code: 'KT-SV123',
    amount: 150000,
    deadline: '20/10/2023',
    status: 'Đã đóng đúng hạn',
    payDate: '18/10/2023'
  },
  {
    id: 'pay-2',
    tripId: 'vinamilk-2023',
    tripTitle: 'Công ty CP Vinamilk',
    code: 'KT-SV456',
    amount: 200000,
    deadline: '15/11/2023',
    status: 'Chưa đóng'
  },
  {
    id: 'pay-3',
    tripId: 'heineken-2023',
    tripTitle: 'Nhà máy Bia Heineken',
    code: 'KT-SV789',
    amount: 180000,
    deadline: '01/09/2023',
    status: 'Vi phạm'
  },
  {
    id: 'pay-4',
    tripId: 'samsung-hcmc',
    tripTitle: 'Samsung HCMC',
    code: 'KT-SV001',
    amount: 250000,
    deadline: '05/10/2023',
    status: 'Đã hoàn phí',
    payDate: '04/10/2023'
  }
];

export const initialRefundRequests: RefundItem[] = [
  {
    id: 'ref-1',
    date: '10/11/2023 14:22',
    invoiceName: 'Hóa đơn Heineken - 01/09',
    amount: 180000,
    status: 'Đã hoàn tiền',
    note: 'Hoàn trả do lỗi hệ thống'
  },
  {
    id: 'ref-2',
    date: '22/11/2023 09:15',
    invoiceName: 'Hóa đơn Vinamilk - 15/11',
    amount: 200000,
    status: 'Chờ xử lý'
  },
  {
    id: 'ref-3',
    date: '05/10/2023 16:45',
    invoiceName: 'Hóa đơn Samsung - 05/10',
    amount: 250000,
    status: 'Từ chối',
    note: 'Thiếu xác nhận của BCN Khoa'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Cập nhật lịch trình tham quan Nhà máy Yakult',
    content: 'Lịch trình chuyến đi tham quan Nhà máy Yakult vào ngày 15/10 đã được cập nhật. Vui lòng xem chi tiết trong file đính kèm để nắm rõ thời gian tập trung và lộ trình di chuyển mới nhất.',
    time: '2 giờ trước',
    timeRelative: '2 giờ trước',
    isRead: false,
    category: 'lịch trình',
    attachmentName: 'Lich_trinh_chi_tiet.pdf',
    attachmentSize: '1.2 MB'
  },
  {
    id: 'notif-2',
    title: 'Kết quả điểm bài thu hoạch chuyến đi Acecook',
    content: 'Điểm số bài thu hoạch cho chuyến tham quan thực tế tại Acecook đã được công bố. Sinh viên vui lòng kiểm tra bảng điểm tổng hợp để biết kết quả của nhóm mình.',
    time: 'Hôm qua',
    timeRelative: 'Hôm qua',
    isRead: true,
    category: 'bài thu hoạch',
    attachmentName: 'Bang_diem_tong_hop.pdf',
    attachmentSize: '850 KB'
  },
  {
    id: 'notif-3',
    title: 'Nhắc nhở nộp lệ phí kiến tập đợt 1',
    content: 'Hạn chót nộp lệ phí kiến tập đợt 1 đang đến gần (10/10). Vui lòng hoàn thành việc thanh toán qua cổng Portal để đảm bảo danh sách được chốt đúng hạn.',
    time: '3 giờ trước',
    timeRelative: '3 giờ trước',
    isRead: false,
    category: 'tài chính'
  },
  {
    id: 'notif-4',
    title: 'Xác nhận đăng ký thành công chuyến đi VNG Campus',
    content: 'Bạn đã đăng ký thành công chuyến tham quan thực tế tại VNG Campus. Vui lòng theo dõi thông báo để cập nhật lịch trình chi tiết trong thời gian tới.',
    time: '2 ngày trước',
    timeRelative: '2 ngày trước',
    isRead: true,
    category: 'hệ thống'
  }
];

export const gradeItems = [
  { id: '1', factory: 'Nhà máy Bia Heineken VN', prepare: 9.0, report: 8.5, feedback: 8.0, bonus: 0.5, total: 8.7 },
  { id: '2', factory: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)', prepare: 8.5, report: 8.0, feedback: 8.5, bonus: 0, total: 8.3 },
  { id: '3', factory: 'Acecook Việt Nam', prepare: 8.0, report: 7.5, feedback: 8.0, bonus: 0, total: 7.8 }
];
