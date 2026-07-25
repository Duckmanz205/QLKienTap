import { Trip, Notification, Submission, Payment, RefundRequest, StudentProfile } from './types';

export const INITIAL_PROFILE: StudentProfile = {
  name: 'Nguyễn Lâm Lan Ngọc',
  email: 'lanngoc.cntp@student.edu.vn',
  studentId: 'SV20261234',
  class: 'CNTP21-02',
  major: 'Công nghệ Thực phẩm',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzz-2Kk6JrWvcjecuYrS3KVtKRysBBQAUKkZcvwjnqPdjqSp9X1wR4M62tcCHkR-tXC5EEQ1GVqVreY2gJleWwpuuCgdSgJCVKgzwCdUQwvMVD8Lqw5gCB-hwIU-l8c_iT35ysKlFnNFq6v7NKpO5j6fgcoWXBnsXssASUIEoF6_mJippxQLxGnfYdhOkzIcMAz2G_jliVXRHsmxQmpVkU1N7Q-EHBLdmi3ke45qzUaN9B2pHmJFNSEg'
};

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'vinamilk-hiep-phuoc',
    name: 'Nhà máy Vinamilk',
    type: 'Trực tiếp',
    industry: 'Công nghiệp thực phẩm',
    date: '25/10/2025',
    time: '08:00 - 11:30',
    location: 'KCN Hiệp Phước, TP. Hồ Chí Minh',
    description: 'Nhà máy sữa Việt Nam (Vinamilk) sở hữu hệ thống sản xuất khép kín hiện đại bậc nhất khu vực. Sinh viên sẽ được tham quan quy trình chế biến sữa tiệt trùng và hệ thống kho thông minh tự động hóa 100%.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB227cm5lxHx8xVFT-ZVMGvC05dQnC7GmKyuZjjzHkA71UmDPbFSPXZHMRhEqIcHwI1W9Z7liClxyzeMn15Gz5CGOR7VE3d1v5oiFW0Gd_n-cdW7vW1YRVLM02WdCh4ydyzhvObybNM7TFT8twlvd2nz0Qytq7ycPjn5ru37Qaf8_UGWIkRXDYyLFyemzpMV07AS8M-4Rb38JXoQaH5VYEU6COjuQK7a5cACl2AMENrqy4FHyP9OjPfOA',
    isRegistered: true,
    isCompleted: true,
    gradeDetails: {
      preparation: 8.5,
      report: 8.0,
      evaluation: 9.0,
      bonus: 0.5,
      total: 8.7
    }
  },
  {
    id: 'acecook-vietnam',
    name: 'Công ty Acecook Việt Nam',
    type: 'Trực tuyến',
    industry: 'Công nghiệp thực phẩm',
    date: '26/10/2025',
    time: '13:00 - 16:30',
    location: 'Tham quan trực tuyến (MS Teams)',
    description: 'Tham quan quy trình sản xuất khép kín theo tiêu chuẩn Nhật Bản tại các nhà máy Acecook. Tìm hiểu sâu sắc về công nghệ sấy và dây chuyền đóng gói mì ăn liền tự động đạt chất lượng quốc tế.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbj5se-06jXf0lRrjhn71eleT9RQzvtZ_0u6VicSmhVo1xDKe4UV6IgAlXXGC_kAU_LCg83jt4cJJG7LoFEudmc7W1S5kzb3yYNgx_313q8Bv6Dr9K_YF6_jGkAC89mwhrwqerqD7vkyRy4hrFeTHa4ZyQgh9PXG8sfvtq0F7Ss55siwt4HYlTRprYCJTmR4kW7wv1s5QsDIm9NvJxVL5QmTNFC3WMyymdbMsrq7CGR9fT8sEC0L6NwQ',
    isRegistered: false,
    isCompleted: false,
    gradeDetails: {
      preparation: 9.0,
      report: 0,
      evaluation: 0,
      bonus: 0,
      total: 0
    } // Đang chờ khóa điểm
  },
  {
    id: 'fpt-software',
    name: 'Công ty TNHH Phần mềm FPT',
    type: 'Trực tuyến',
    industry: 'Công nghệ thông tin',
    date: '10/10/2023',
    time: '09:00 - 11:30',
    location: 'Hội thảo trực tuyến (Zoom)',
    description: 'Hội thảo giới thiệu quy trình làm việc chuẩn Agile/Scrum, các công nghệ chuyển đổi số và xu hướng nghề nghiệp mới trong ngành CNTT tại Việt Nam và khu vực.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsEmfGZKoTTCe26vcATMbcrEZJsPOFgEqPGnsR75OKyLQ-DLgNp-zN_AU-eGb25k0PVWCb_uakpQ7nnHvfUVwmWjCUlUZJbBQJXk8BRhjJCPR_pTVwGoh-YXVzmWzA6DEF-tNfilIf_zYgV1jxjcFbQWl5kEntqHXDZP2Lpy3h96lUToUFmkzPAXvEhwFVi3MyHfEHIEGYu-BXqTMCft85bR1gI0vC0CnVAwKdCxw1MFpXnd6mQn0C9Q',
    isRegistered: true,
    isCompleted: true
  },
  {
    id: 'cat-lai-port',
    name: 'Cảng Cát Lái - Tân Cảng Sài Gòn',
    type: 'Tự do',
    industry: 'Logistics & Vận tải',
    date: '05/10/2023',
    time: 'Tự sắp xếp lịch',
    location: 'Cảng Cát Lái, TP. Thủ Đức, TP. Hồ Chí Minh',
    description: 'Khảo sát thực tế tại cảng container hiện đại và lớn nhất Việt Nam. Sinh viên quan sát quy trình bốc dỡ hàng, vận hành cẩu trục và phân luồng container thông minh.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsEmfGZKoTTCe26vcATMbcrEZJsPOFgEqPGnsR75OKyLQ-DLgNp-zN_AU-eGb25k0PVWCb_uakpQ7nnHvfUVwmWjCUlUZJbBQJXk8BRhjJCPR_pTVwGoh-YXVzmWzA6DEF-tNfilIf_zYgV1jxjcFbQWl5kEntqHXDZP2Lpy3h96lUToUFmkzPAXvEhwFVi3MyHfEHIEGYu-BXqTMCft85bR1gI0vC0CnVAwKdCxw1MFpXnd6mQn0C9Q',
    isRegistered: true,
    isCompleted: true
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Lịch trình thay đổi',
    type: 'Lịch trình thay đổi',
    content: 'Chuyến đi Vinamilk dời sang 8:00 sáng. Vui lòng tập trung tại sảnh chính cơ sở 1 đúng giờ và mặc đồng phục áo khoa chỉnh tề.',
    timeText: '2 giờ trước',
    isRead: false
  },
  {
    id: 'notif-2',
    title: 'Kết quả báo cáo',
    type: 'Kết quả báo cáo',
    content: 'Giảng viên đã chấm bài thu hoạch đợt 1. Bạn có thể xem nhận xét và điểm số chi tiết của chuyến đi Vinamilk tại tab Kết quả.',
    timeText: '5 giờ trước',
    isRead: true,
    attachment: 'Diem_Dot_1.pdf'
  },
  {
    id: 'notif-3',
    title: 'Cập nhật tài liệu',
    type: 'Cập nhật tài liệu',
    content: 'Vui lòng xem hướng dẫn an toàn tại nhà máy Acecook trước khi tham gia chuyến tham quan thực tế để đáp ứng quy định bảo hộ lao động.',
    timeText: '1 ngày trước',
    isRead: false,
    attachment: 'HD_AnToan.pdf'
  },
  {
    id: 'notif-4',
    title: 'Nhắc nhở đóng phí',
    type: 'Nhắc nhở đóng phí',
    content: 'Hạn chót đóng phí tham quan cho chuyến đi KCN Tân Bình là ngày 10/05. Vui lòng hoàn tất nộp lệ phí để ban tổ chức đặt xe di chuyển.',
    timeText: '3 ngày trước',
    isRead: true
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-vinamilk',
    tripName: 'Nhà máy Vinamilk Bình Dương',
    typeText: 'Tham quan trực tiếp',
    dateText: '15/10/2023',
    status: 'Chưa nộp'
  },
  {
    id: 'sub-fpt',
    tripName: 'Công ty TNHH Phần mềm FPT',
    typeText: 'Hội thảo trực tuyến',
    dateText: '10/10/2023',
    status: 'Đã nộp',
    fileName: 'baocao_fpt_sv123.pdf',
    fileSize: '2.4 MB',
    submittedAt: '12/10/2023 14:30'
  },
  {
    id: 'sub-catlai',
    tripName: 'Cảng Cát Lái - Tân Cảng Sài Gòn',
    typeText: 'Tham quan tự do',
    dateText: '05/10/2023',
    status: 'Trễ hạn - trừ điểm',
    fileName: null,
    fileSize: null
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-vnm',
    tripId: 'vinamilk-hiep-phuoc',
    name: 'Nhà máy Sữa Vinamilk',
    code: 'KT2026-VNM-12345',
    amount: 50000,
    dueDate: '15/07/2026',
    status: 'Chưa đóng'
  },
  {
    id: 'pay-vng',
    tripId: 'vng-campus',
    name: 'Công ty TNHH VNG',
    code: 'KT2026-VNG-98765',
    amount: 120000,
    dueDate: '01/06/2026',
    status: 'Đã đóng đúng hạn'
  },
  {
    id: 'pay-ktb',
    tripId: 'tan-binh-iz',
    name: 'KCN Tân Bình',
    code: 'KT2026-KTB-55555',
    amount: 30000,
    dueDate: '10/05/2026',
    status: 'Vi phạm'
  }
];

export const INITIAL_REFUNDS: RefundRequest[] = [
  {
    id: 'ref-fpt',
    invoiceName: 'HĐ: FPT Software',
    dateText: '10/08/2026',
    amountText: '150.000đ',
    status: 'Chờ xử lý'
  },
  {
    id: 'ref-intel',
    invoiceName: 'HĐ: Intel Products',
    dateText: '15/05/2026',
    amountText: '80.000đ',
    status: 'Đã hoàn tiền'
  }
];

// LocalStorage helpers
export const loadState = <T>(key: string, defaultValue: T): T => {
  try {
    const serialized = localStorage.getItem(`internflow_${key}`);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (err) {
    console.error('Error loading state from localStorage', err);
    return defaultValue;
  }
};

export const saveState = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`internflow_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error('Error saving state to localStorage', err);
  }
};
