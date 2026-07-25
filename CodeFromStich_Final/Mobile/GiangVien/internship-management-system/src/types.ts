/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string; // MSSV (Student ID)
  name: string;
  className: string;
  avatar: string;
  company: string;
  submittedDate: string;
  tourId: string;
  completedTours: string; // e.g. "3/3"
  papersLeft: number; // e.g. 0, 1, 2
  attendanceStatus: 'present' | 'absent' | 'excused' | 'none';
  excuseReason?: string;
  prelimGrade: number; // Điểm chuẩn bị
  extraGrade: number; // Điểm cộng
  gvhdGrade: number; // Điểm GVHD (0.0 if not graded)
  isGraded: boolean;
  comment: string;
  aiSuggestedGrade: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  isUnread: boolean;
  type: 'assignment' | 'schedule' | 'warning' | 'campaign' | 'fact_check';
  attachment?: string;
}

export interface Tour {
  id: string;
  name: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  date: string;
  timeRange: string;
  type: 'direct' | 'online'; // Trực tiếp | Trực tuyến
  registeredCount: number;
  maxCount: number;
}

export interface CouncilSession {
  id: string;
  name: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  timeRange: string;
  date: string;
  room: string;
  studentCount: number;
}

// Highly realistic avatar URLs from Google user content profiles included in original app designs
export const AVATARS = {
  lecturer: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvBvjsdIGR5Fkqd06s0i3cimMx4ImyR51EJ9VfsmrucFoVxaoYE_vxCX0AwizGMqAQnZobGTdTSpbPaLXMTkik7zIVv-6_CXRJfSZBK_A5LopeWHEQwGcufkajShlaQPzXtgVilJsWFSxdztfT9ulDHiWECR5tUPcS5H27N1ZL4kN1QwF4fukO1caoCDeyqVX8azL6wAMmIh_zF0wnIRk3rHE79-UnjWynapzII2uZHhVDqvT9W9dYDw",
  lecturerFemale: "https://lh3.googleusercontent.com/aida-public/AB6AXuAi5czpGiGhKlq2V4hIRdu9LnQXdxorZ5uSqzQifSKV78KJQjab3VaZOwnhB8xgAAwqPpEqYRfZbkIEdM7IKyJV9MJmta8BYkPnY4YsswcPhTz6HYFzJZJZ39aMFqF9irqGCuKQ2xz-81GOnyUsy9M2OVcZwK4YiVUZGj-5SyN7LGRwDjz1otaf6NDyisdcM7-Ns7EMKg2VTu2h4J8wT9Tpj0S1Y2PbrHKgx1GWpm4gCbSo_AAtbmw4CA",
  studentA: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiNgM6J_V2LHFwWwdaAokFCE7APacNg0FI1lRDt__yi4fNuDQSL96rPPagJq2Rxjl1oCfbbRZkXfuEf_20Td0fN-AZ1FAQkSCsC7dBMv0UFemMnxUXM1Oz7FCyfof02xqQAR5hxlpU9tROwUCkydf3vHwe-4uJwa3B6aCUDWtsgLmY75nDQTlZ1KKdJmKZtWqx50KXJu2JRHsuy9gKCTGoqCNNOl1N_xdIQdsTDQ-Y4CzB4XroAF_QNw",
  studentB: "https://lh3.googleusercontent.com/aida-public/AB6AXuAF_44Ulf9m2a5EsNxJaQzVBjdCDS4nB7L-_3VK5L2T8pxXwdR4wCqDiFP475LsCkQXzvC3f5J__zCCHIMYfL11HgITWPeJXTgZsfleIP8Wy7pTKjN7EVxYm7nH2s03DpDb3v3SaKlkkDeT4E0KK-DCLCupPbPnhkfFGscC4xDANxMHO6TmdeRQPBXgcORE41rrnkExSmrdghg_d_5K4Qb6-wSyko5C8fUnll5KGrCX2P0rRNb9z3ZE_g",
  studentC: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5FbeWyEPdnpTgQOQ3CcobwRVZA88mT0eLRkBoqI4tDYFOAkU0UJs2vzKaQE1UOYJqDX0V_WBCSsZ-zFOpLphf-n-FpPKdSIwb6h_6uXqARD2nzyyIW_56eAdI4HmOSrqLl0Uy-gsltsPYi7QpuE7YLl3HRDeW13xt8YkoHClqSRXmw1N-bQTjQbVjnJjSKF0A-jPN7J58vrdBDwXbyJhXPW6KODpkg-GN5aiQjLZP8g2UNTXLmnXDRg",
  studentD: "https://lh3.googleusercontent.com/aida-public/AB6AXuBy8AxCbQbey0wlGsaOh6IWoXMj1jriuGyHbUBFwNtO957A6Iu3l1Tml2DUgDFGM01rCcv5DN3cAy4a2qRIbFyapueldqkqD0g4-wZRLRdLKxOGZYkiqAk96EPVlY3aWperIS2R9S-H3caNsscCluY4nMcnmC4JtYfpOaFldgrH8NuIfFndONE2fmo3tITRZxQBCUhI3frM9wvFfICRZAj4FZHht0EEHwxnmgzBOwNWqoCn7gmECVS86Q",
  studentE: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsCnsT0YbzMAMeQNagv6KJRHzCeslQSRd8ycsSKV2B4A3Sb9By-eY3ig9CAzZJ5GkZSJxDFG03sqwLt-ZVMaQPN4hAtocnv5rOtQWwZrDr35NbnHDrDQscdIXHP688WhM4Al9EcwVpXifkJ19-lmTRaHxk-EJzPdpFvTKMEeoZHOnNuyWE-Ahp1aqCQBUCepECEEuJ6Ixdq4dz74uFWVCuCHCmG3gRucrw8z_0xPlVVzwN_DC_zV0ZrQ",
  studentF: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2GGjVBo3B1PqjQ-bR89ujHkuRmdtpKAUcr5cgT2pfX9LAiVzlUpMc-yLGfAiWt2VXrMZiAzzjWEP16u1sjH4mePxNbg8mEmM9KRRyQYyKZxHfj4isgTx6cQE0_1obrOKbIGxGAOoOJiq-luwW6V4IgLgq5nbPOuy1TWH-GmM0bl2xvJ0YHIF93XzkYA6uUKyPHB0f-Wc75ZBIP4mQ45MZb7QE4uQvxJ4ULgB9e3M6iFlMwdXV_5QxPg",
  studentG: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK4t_UUtsJDfMYEuxHzV7y5_RAT7TusKbd0zVQqzOxlJJ0zLvhFtBadqBUjzul03erWrvHbQar5i7strxYhrEOr7l1aWS10g0AWw2nI6ZYIAdzQUSZSNXIZFeATPqwfoMGoYEWa4Bj-G_w7rHJOHgAp7tWEka0aDHHJTt1EjAdH3aeZLZvEi7BwhkZC3gtRRwK2dRmycaVXGkKLmnOFPsSRJtR4q6h9CJaUfTezLnzU3QPzM0ncZ6i1g"
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "2110432",
    name: "Nguyễn Văn A",
    className: "21DCNTP1",
    avatar: AVATARS.studentA,
    company: "Vinamilk",
    submittedDate: "15/10/2023",
    tourId: "vinamilk-today",
    completedTours: "3/3",
    papersLeft: 0,
    attendanceStatus: "present",
    prelimGrade: 8.5,
    extraGrade: 0.5,
    gvhdGrade: 0.0,
    isGraded: false,
    comment: "",
    aiSuggestedGrade: 8.0
  },
  {
    id: "2110435",
    name: "Trần Thị B",
    className: "21DCNTP1",
    avatar: AVATARS.studentC,
    company: "Acecook Việt Nam",
    submittedDate: "24/10/2023",
    tourId: "vinamilk-today",
    completedTours: "2/3",
    papersLeft: 2,
    attendanceStatus: "present",
    prelimGrade: 7.0,
    extraGrade: 1.0,
    gvhdGrade: 0.0,
    isGraded: false,
    comment: "",
    aiSuggestedGrade: 7.5
  },
  {
    id: "2110438",
    name: "Lê Văn C",
    className: "21DCNTP2",
    avatar: AVATARS.studentE,
    company: "Suntory Pepsico",
    submittedDate: "23/10/2023",
    tourId: "vinamilk-today",
    completedTours: "3/3",
    papersLeft: 1,
    attendanceStatus: "excused",
    excuseReason: "Bị ốm",
    prelimGrade: 0.0,
    extraGrade: 0.0,
    gvhdGrade: 0.0,
    isGraded: false,
    comment: "",
    aiSuggestedGrade: 5.0
  },
  {
    id: "2110441",
    name: "Phạm Minh D",
    className: "21DCNTP2",
    avatar: AVATARS.studentD,
    company: "Suntory Pepsico",
    submittedDate: "23/10/2023",
    tourId: "vinamilk-today",
    completedTours: "3/3",
    papersLeft: 0,
    attendanceStatus: "absent",
    prelimGrade: 5.5,
    extraGrade: 0.0,
    gvhdGrade: 0.0,
    isGraded: false,
    comment: "",
    aiSuggestedGrade: 6.0
  },
  {
    id: "2110554",
    name: "Trần Thị Bích Ngọc",
    className: "21DCNTP1",
    avatar: AVATARS.studentF,
    company: "Acecook Việt Nam",
    submittedDate: "24/10/2023",
    tourId: "acecook-today",
    completedTours: "3/3",
    papersLeft: 1,
    attendanceStatus: "none",
    prelimGrade: 7.0,
    extraGrade: 1.0,
    gvhdGrade: 0.0,
    isGraded: false,
    comment: "",
    aiSuggestedGrade: 7.0
  },
  {
    id: "2110981",
    name: "Lê Hoàng Nam",
    className: "21DCNTP2",
    avatar: AVATARS.studentG,
    company: "Suntory Pepsico",
    submittedDate: "25/10/2023",
    tourId: "suntory-today",
    completedTours: "3/3",
    papersLeft: 0,
    attendanceStatus: "none",
    prelimGrade: 0.0,
    extraGrade: 0.0,
    gvhdGrade: 0.0,
    isGraded: false,
    comment: "",
    aiSuggestedGrade: 8.5
  }
];

export const INITIAL_TOURS: Tour[] = [
  {
    id: "vinamilk-today",
    name: "Nhà máy Vinamilk",
    status: "upcoming",
    date: "15/10/2023",
    timeRange: "08:00 - 11:30",
    type: "direct",
    registeredCount: 12,
    maxCount: 15
  },
  {
    id: "acecook-today",
    name: "Acecook Việt Nam",
    status: "ongoing",
    date: "18/10/2023",
    timeRange: "13:30 - 17:00",
    type: "direct",
    registeredCount: 20,
    maxCount: 20
  },
  {
    id: "suntory-today",
    name: "Suntory Pepsico",
    status: "completed",
    date: "22/10/2023",
    timeRange: "08:30 - 12:00",
    type: "online",
    registeredCount: 15,
    maxCount: 15
  }
];

export const INITIAL_COUNCILS: CouncilSession[] = [
  {
    id: "hd1",
    name: "Hội đồng 1 - Khóa 46",
    status: "upcoming",
    date: "15/10/2024",
    timeRange: "08:00 - 11:30",
    room: "Phòng A1.204",
    studentCount: 15
  },
  {
    id: "hd2",
    name: "Hội đồng 2 - Khóa 45",
    status: "ongoing",
    date: "14/10/2024",
    timeRange: "13:30 - 17:00",
    room: "Phòng B2.101",
    studentCount: 12
  },
  {
    id: "hd3",
    name: "Hội đồng 3 - Khóa 45",
    status: "completed",
    date: "10/10/2024",
    timeRange: "08:00 - 11:30",
    room: "Phòng C1.305",
    studentCount: 18
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "Nộp báo cáo thực tập tuần 4",
    body: "Sinh viên Nguyễn Văn A đã nộp báo cáo thực tập tuần 4. Vui lòng xem xét và đánh giá trước hạn chót vào Thứ 6 tuần này.",
    time: "2 giờ trước",
    isUnread: true,
    type: "assignment",
    attachment: "baocao_tuan4_A.pdf"
  },
  {
    id: "notif-2",
    title: "Thay đổi lịch họp chuyên môn",
    body: "Cuộc họp chuyên môn định kỳ với các doanh nghiệp đối tác được dời sang 14:00 ngày 25/10 tại Phòng Hội thảo 1.",
    time: "Hôm qua",
    isUnread: true,
    type: "schedule"
  },
  {
    id: "notif-3",
    title: "Cảnh báo: Sinh viên vắng mặt",
    body: "Hệ thống ghi nhận sinh viên Trần Thị B vắng mặt tại điểm thực tập quá 3 ngày không phép. Cần liên hệ ngay với công ty.",
    time: "2 ngày trước",
    isUnread: false,
    type: "warning"
  },
  {
    id: "notif-4",
    title: "Cập nhật tài liệu hướng dẫn",
    body: "Phòng Đào tạo đã cập nhật quy chế thực tập mới nhất cho học kỳ 1 năm học 2024-2025. Vui lòng tham khảo tài liệu đính kèm.",
    time: "20 Th10",
    isUnread: false,
    type: "campaign",
    attachment: "QuyCheThucTap_2024.pdf"
  },
  {
    id: "notif-5",
    title: "Nhắc nhở chấm điểm giữa kỳ",
    body: "Xin lưu ý, thời hạn nhập điểm đánh giá giữa kỳ cho sinh viên thực tập sẽ kết thúc vào cuối tuần này.",
    time: "15 Th10",
    isUnread: false,
    type: "fact_check"
  }
];
