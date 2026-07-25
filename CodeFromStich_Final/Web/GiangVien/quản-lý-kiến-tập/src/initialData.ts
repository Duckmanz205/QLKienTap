import { Student, Trip, SystemNotification, CouncilMeeting, StudentReportGrading } from './types';

export const initialStudents: Student[] = [
  {
    mssv: '20123456',
    name: 'Nguyễn Thị Thu Hà',
    class: 'K46_DULICH_01',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC5uuYcQijwPp1UTkTkuyfgRzQR9EaZyD3gGunrobe3L1ROBdOYDlsC-MvAqVoyIp60FN_wJHeuZJIaV3rLd7-ElZV4jKAfHtoFlIRz5GOwj4Kh_t1UYCqttwvzUhuuad1dA0ZHMB2-Vw0pGEiZl-VuABWqI3SgVBmziSyPmCE_nKwf3BJYAyFjKyrVeDqQ7GiJuQ7yTz6F1qjXMZXFa4H92TrbZ49-NWpmPODbDfKJwm8Kevq9CdK_A',
    completedTrips: 3,
    totalTrips: 3,
    pendingReports: 0,
    gradeStatus: 'completed',
    preparatoryGrade: 8.5,
    bonusGrade: 0.5,
    notes: 'Tích cực phát biểu, đóng góp ý kiến'
  },
  {
    mssv: '20110002',
    name: 'Trần Thị B',
    class: 'K46_DULICH_02',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzsny1xDYp9snlnajU6IA9K15YxTCb3XS2A-xbaEO0pe9mAzGjL659WlvyMdNhNiHWMtF_n675KIX__TbN_0XgBe9HEqjgwZXA7FwcJbxKPtxE4xLqdHLqbkIrkgi7YlF4x2DrqSa2kYvMpTmnbhag_EpokJftlR2HLO6Ju-JgTSwFcfPU0G00oAD7SRoNDKJhT_S34ovwtRnyOwym_TRpMdSmkdEU_jygFjvQ67swf3Q9O3vx7EHMYw',
    completedTrips: 3,
    totalTrips: 3,
    pendingReports: 1,
    gradeStatus: 'pending',
    preparatoryGrade: 9.0,
    bonusGrade: 1.0,
    notes: 'Điểm kahoot cao nhất lớp chuẩn bị'
  },
  {
    mssv: '20110003',
    name: 'Lê Văn C',
    class: 'K46_DULICH_01',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeWp9OnGXQCA1P6uskmcQ_zmBjzbASFqMMWFOKMdu432e8ZKhmS52jzODQ4kovYZPzr1tVwgc-Cvu2Q1dfSVb98gnXu0Dr_09VTpr2Kq29r5lXIM2hokKP8ESrhCvJ53bFkICVcR4aTtThiAyoXB2jV4nT-ddmqVGdm-as5rkjUkAZTDHo0CbSghfU6WoWu3rNkbGnRohoPH3K7Y6VCuMHUB1MAujPkUeSWWZYmppEanoYCdA0495hoQ',
    completedTrips: 2,
    totalTrips: 3,
    pendingReports: 1,
    gradeStatus: 'pending',
    preparatoryGrade: undefined,
    bonusGrade: 0.0,
    notes: ''
  },
  {
    mssv: '20110004',
    name: 'Phạm Thị D',
    class: 'K46_DULICH_03',
    completedTrips: 3,
    totalTrips: 3,
    pendingReports: 0,
    gradeStatus: 'completed',
    preparatoryGrade: 7.0,
    bonusGrade: 0.0,
    notes: ''
  },
  {
    mssv: '20123489',
    name: 'Trần Việt Hoàng',
    class: 'K46_DULICH_02',
    completedTrips: 2,
    totalTrips: 3,
    pendingReports: 1,
    gradeStatus: 'pending',
    preparatoryGrade: 8.0,
    bonusGrade: 0.5,
    notes: 'Chuẩn bị bài khá chu đáo'
  },
  {
    mssv: '20123512',
    name: 'Lê Quang Khải',
    class: 'K46_DULICH_01',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjNWqNJ_l_Z38vU3nIWvfJdQxmn19R7Y6xYGv9JQDxB4EFlkCI_2QJoudlGKhXt8kzMu8yOMiqyHc9i_eCHkbglmOHgb06q4VsgQsI71kFXKPhLQkTfRj_3zmJ57Ja3APhAA5He9r6hv278HhJSJRRed8CBRWS5iZrhvf0NCo-MdcZgtQxkC47FP1SSySMVCRjhm9NceAdfcg17OCyxc-MJcgwV4KsdyzZlihC3KWEkjdi5xpUNJ16SA',
    completedTrips: 1,
    totalTrips: 3,
    pendingReports: 2,
    gradeStatus: 'pending',
    preparatoryGrade: 6.5,
    bonusGrade: 0.0,
    notes: 'Cần tích cực hơn'
  },
  {
    mssv: '20123605',
    name: 'Phạm Phương Anh',
    class: 'K46_DULICH_03',
    completedTrips: 3,
    totalTrips: 3,
    pendingReports: 0,
    gradeStatus: 'completed',
    preparatoryGrade: 8.0,
    bonusGrade: 0.5,
    notes: ''
  },
  {
    mssv: '20110001',
    name: 'Nguyễn Văn A',
    class: 'K46_DULICH_01',
    completedTrips: 3,
    totalTrips: 3,
    pendingReports: 0,
    gradeStatus: 'completed',
    preparatoryGrade: 8.5,
    bonusGrade: 0.5,
    notes: 'Tích cực phát biểu'
  },
  {
    mssv: '20110005',
    name: 'Nguyễn Thùy Dương',
    class: 'K46_DULICH_03',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXmEb6Wb4HJbIYZ6UCRlXEPKIDt1iERBICt_lHKb-uvbiRphpbPuDjrj0CWfohzPSX0K9KjS8OJfP-I7mtpP3k4HW5sSHjmGGgkXR2nFfCB9nD4qPQil1JD1O3SCMp_6AKN3Nwd1MtsSVqlaV7n_9zekzrHVX53cYRzzPuZzPpRtZ99Y8QAmsdB9Lv9FAZK9tIA806RsgoKadJpWY4QRKPEFS4npH9_vzC0FI19gFMzhI6qL7MThuNCg',
    completedTrips: 3,
    totalTrips: 3,
    pendingReports: 0,
    gradeStatus: 'completed',
    preparatoryGrade: 7.5,
    bonusGrade: 0.0,
    notes: ''
  }
];

export const initialTrips: Trip[] = [
  {
    id: 'trip-1',
    factoryName: 'Nhà máy Bia Heineken VN',
    date: '15/10/2023',
    time: '08:00',
    type: 'direct',
    address: 'Quận 12, TP.HCM',
    studentCount: 15,
    maxStudents: 15,
    status: 'completed',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc5iH8xZkYaPp3mJY0isrvPEWHj3ERcwFRlr7p1ozewJrHUmowIuatA7RCK1m_mjvb_hroOJdExCI52arRirnwFZoNwpVdT1jFq0WoPyv6eIeblqwLAElS_B3OfFy-H_Rr26_LhFGKwV5vt0qAgpeJoUOQaMYHJU13LPvUXQC2MbXI2PA8zp7cK3BFYMeuEmk_jbRnITZYHPNFuNehf6u2Gi3Uowc4vPmWbCX9eXZ6jKAFHdpuvdGujg'
  },
  {
    id: 'trip-2',
    factoryName: 'Công ty CP Vinamilk',
    date: '22/10/2023',
    time: '13:30',
    type: 'direct',
    address: 'Vinamilk Mega Factory',
    studentCount: 45,
    maxStudents: 50,
    status: 'ongoing',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAsiLcszjL6AWBxVKaw3B2hMSWvf09nRLQuT52IZg09bjvVaESntzktEAvMR35OgUjyD1Jc8uCIphKmCh4I6AQfru9RwSXqgAGX8PZR0CCg6Bn9oM5J5OQzc5P_WKGD3Q_llyw-fFgRRq3dZdELlCcDlN1Wlan__zCD9qnJhmwBqdExQKqEruSj0g6s3K_DQKstM6Wznraa6eWB63-W3jrmBk30vm7lRGSJVr0C_P3G1k1xRyabSjjYg'
  },
  {
    id: 'trip-3',
    factoryName: 'Acecook Việt Nam',
    date: '30/10/2023',
    time: '09:00',
    type: 'online',
    address: 'Văn phòng Trực tuyến Acecook',
    studentCount: 12,
    maxStudents: 15,
    status: 'upcoming',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKVMXxkv-GD6kCsH-p4E3KVe4lCB9TM9O4rzs7hvh4hkX4dIOzgKuRuqJHHqfPpE3XH5F4XH40QGnHTQrMR5vPJL-c7b_aaEcQd8gCHjeKUmMo4Cc3THlouILXnbqXMtu7KIwNApfeo6y9D1oY37E2FmwTOjVvAKU011M5KhLfwg2hiJtaNbzQzy9LdJidcD9smteyVp4HIqaPOUD4BMmFohITX_2DkM6dXBzs4WVI1RMp-UrLq--mtw'
  }
];

export const initialNotifications: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Bài thu hoạch mới cần chấm',
    time: '2 giờ trước',
    description: 'Sinh viên Nguyễn Thị B (MSSV: 20123456) vừa nộp bài thu hoạch kiến tập doanh nghiệp đợt 1. Vui lòng chấm điểm trước ngày 15/11/2023.',
    type: 'assignment',
    unread: true
  },
  {
    id: 'notif-2',
    title: 'Lịch họp hội đồng thay đổi',
    time: '5 giờ trước',
    description: 'Buổi báo cáo Thực tập nghề nghiệp Hội đồng 3 dự kiến vào sáng thứ 6 sẽ chuyển sang chiều thứ 6 (13:30). Phòng họp không đổi.',
    type: 'event_change',
    unread: true
  },
  {
    id: 'notif-3',
    title: 'Cập nhật danh sách sinh viên hướng dẫn',
    time: 'Hôm qua',
    description: 'Khoa đã bổ sung thêm 3 sinh viên vào nhóm hướng dẫn của thầy/cô trong học kỳ này. Chi tiết vui lòng xem file đính kèm.',
    type: 'student_add',
    unread: true,
    attachment: 'danh_sach_bs_2023.pdf'
  },
  {
    id: 'notif-4',
    title: 'Thông báo kế hoạch kiến tập đợt 2',
    time: '2 ngày trước',
    description: 'Kế hoạch chi tiết cho đợt kiến tập số 2 đã được phê duyệt. Các giảng viên phụ trách chuẩn bị liên hệ với doanh nghiệp.',
    type: 'announcement',
    unread: false
  },
  {
    id: 'notif-5',
    title: 'Xác nhận điểm danh thành công',
    time: '1 tuần trước',
    description: 'Hệ thống đã ghi nhận kết quả điểm danh chuyến đi thực tế tại FPT Software ngày 01/11/2023.',
    type: 'success',
    unread: false,
    attachment: 'export_diemdanh.xlsx'
  },
  {
    id: 'notif-6',
    title: 'Nhắc nhở nộp điểm chuẩn bị',
    time: '2 tuần trước',
    description: 'Hạn chót nhập điểm chuẩn bị cho sinh viên đợt 1 là 23:59 ngày 25/10/2023. Hệ thống sẽ tự động khóa sau thời gian này.',
    type: 'reminder',
    unread: false
  }
];

export const initialCouncilMeetings: CouncilMeeting[] = [
  {
    id: 'council-1',
    name: 'Hội đồng số 1 - HK1/2023',
    chairman: 'TS. Nguyễn Trọng A',
    date: '25/10/2023',
    time: '08:00',
    room: 'Phòng họp B4',
    studentCount: 15,
    status: 'ongoing'
  },
  {
    id: 'council-2',
    name: 'Hội đồng số 2 - HK1/2023',
    chairman: 'PGS.TS. Trần Văn B',
    date: '26/10/2023',
    time: '13:30',
    room: 'Phòng họp A2',
    studentCount: 12,
    status: 'upcoming'
  },
  {
    id: 'council-3',
    name: 'Hội đồng số 3 (Đợt 1)',
    chairman: 'TS. Lê Thị C',
    date: '20/10/2023',
    time: '08:00',
    room: 'Phòng họp C1',
    studentCount: 18,
    status: 'completed'
  }
];

export const initialReportGradings: StudentReportGrading[] = [
  {
    mssv: '20123456',
    tripId: 'trip-1',
    score: 8.5,
    comments: 'Bài làm rất tốt, phân tích chi tiết quy trình chiên và đóng gói.',
    gradedByCouncil: {
      'Thầy Sơn': true,
      'Cô Hoa': true
    },
    hasMyGrade: false
  },
  {
    mssv: '20110002',
    tripId: 'trip-1',
    score: undefined,
    comments: '',
    gradedByCouncil: {
      'Thầy Sơn': false,
      'Cô Hoa': false
    },
    hasMyGrade: false
  }
];
