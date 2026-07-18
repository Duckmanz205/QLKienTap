// --- Entities & Models ---

class StudentProfile {
  final String name;
  final String email;
  final String studentId;
  final String className;
  final String major;
  final String avatar;

  StudentProfile({
    required this.name,
    required this.email,
    required this.studentId,
    required this.className,
    required this.major,
    required this.avatar,
  });
}

class LecturerProfile {
  final String name;
  final String email;
  final String teacherId;
  final String avatar;
  final String department;

  LecturerProfile({
    required this.name,
    required this.email,
    required this.teacherId,
    required this.avatar,
    required this.department,
  });
}

class GradeDetail {
  final double preparation; // Điểm chuẩn bị
  final double report;      // Điểm bài thu hoạch
  final double evaluation;  // Điểm đánh giá (báo cáo hội đồng)
  final double bonus;       // Điểm cộng chuyên cần
  final double total;       // Điểm tổng

  GradeDetail({
    required this.preparation,
    required this.report,
    required this.evaluation,
    required this.bonus,
    required this.total,
  });
}

class Trip {
  final String id;
  final String name;
  final String date;
  final String time;
  final String type; // 'Trực tiếp' or 'Trực tuyến' or 'tự do'
  final String location;
  final String industry;
  final String description;
  final String heroImage;
  final bool isRegistered;
  final bool isCompleted;
  final GradeDetail? gradeDetails;

  Trip({
    required this.id,
    required this.name,
    required this.date,
    required this.time,
    required this.type,
    required this.location,
    required this.industry,
    required this.description,
    required this.heroImage,
    required this.isRegistered,
    required this.isCompleted,
    this.gradeDetails,
  });

  Trip copyWith({
    bool? isRegistered,
    bool? isCompleted,
    GradeDetail? gradeDetails,
  }) {
    return Trip(
      id: id,
      name: name,
      date: date,
      time: time,
      type: type,
      location: location,
      industry: industry,
      description: description,
      heroImage: heroImage,
      isRegistered: isRegistered ?? this.isRegistered,
      isCompleted: isCompleted ?? this.isCompleted,
      gradeDetails: gradeDetails ?? this.gradeDetails,
    );
  }
}

class StudentNotification {
  final String id;
  final String title;
  final String content;
  final String timeText;
  final bool isRead;
  final String? attachment;

  StudentNotification({
    required this.id,
    required this.title,
    required this.content,
    required this.timeText,
    required this.isRead,
    this.attachment,
  });

  StudentNotification copyWith({
    bool? isRead,
  }) {
    return StudentNotification(
      id: id,
      title: title,
      content: content,
      timeText: timeText,
      isRead: isRead ?? this.isRead,
      attachment: attachment,
    );
  }
}

class Submission {
  final String id;
  final String tripName;
  final String typeText;
  final String dateText;
  final String status; // 'Chưa nộp', 'Đã nộp', 'Trễ hạn - trừ điểm'
  final String? fileName;
  final String? fileSize;
  final String? submittedAt;
  final bool hasConfirmationFile;
  final String? confirmationFileName;

  Submission({
    required this.id,
    required this.tripName,
    required this.typeText,
    required this.dateText,
    required this.status,
    this.fileName,
    this.fileSize,
    this.submittedAt,
    this.hasConfirmationFile = false,
    this.confirmationFileName,
  });

  Submission copyWith({
    String? status,
    String? fileName,
    String? fileSize,
    String? submittedAt,
    bool? hasConfirmationFile,
    String? confirmationFileName,
  }) {
    return Submission(
      id: id,
      tripName: tripName,
      typeText: typeText,
      dateText: dateText,
      status: status ?? this.status,
      fileName: fileName ?? this.fileName,
      fileSize: fileSize ?? this.fileSize,
      submittedAt: submittedAt ?? this.submittedAt,
      hasConfirmationFile: hasConfirmationFile ?? this.hasConfirmationFile,
      confirmationFileName: confirmationFileName ?? this.confirmationFileName,
    );
  }
}

class Payment {
  final String id;
  final String tripId;
  final String name;
  final String code; // Syntax KT2026-XXX
  final double amount;
  final String dueDate;
  final String status; // 'Chưa đóng', 'Đã đóng đúng hạn', 'Vi phạm', 'Đã hoàn phí'

  Payment({
    required this.id,
    required this.tripId,
    required this.name,
    required this.code,
    required this.amount,
    required this.dueDate,
    required this.status,
  });

  Payment copyWith({
    String? status,
  }) {
    return Payment(
      id: id,
      tripId: tripId,
      name: name,
      code: code,
      amount: amount,
      dueDate: dueDate,
      status: status ?? this.status,
    );
  }
}

class RefundRequest {
  final String id;
  final String invoiceName;
  final String dateText;
  final String amountText;
  final String status; // 'Chờ xử lý', 'Đã hoàn tiền', 'Từ chối'

  RefundRequest({
    required this.id,
    required this.invoiceName,
    required this.dateText,
    required this.amountText,
    required this.status,
  });
}

// --- Lecturer Specific Entities ---

class LecturerStudent {
  final String id; // MSSV
  final String name;
  final String className;
  final String company;
  final String completedTours;
  final int papersLeft;
  final String avatar;
  final String submittedDate;
  final String attendanceStatus; // 'present', 'absent', 'excused', 'none'
  final String? excuseReason;
  final double prelimGrade; // Điểm chuẩn bị
  final double extraGrade;  // Điểm cộng (max 1.0)
  final double gvhdGrade;   // Điểm GVHD chấm
  final double aiSuggestedGrade;
  final String? comment;
  final bool isGraded;
  final String tourId;

  LecturerStudent({
    required this.id,
    required this.name,
    required this.className,
    required this.company,
    required this.completedTours,
    required this.papersLeft,
    required this.avatar,
    required this.submittedDate,
    required this.attendanceStatus,
    this.excuseReason,
    required this.prelimGrade,
    required this.extraGrade,
    required this.gvhdGrade,
    required this.aiSuggestedGrade,
    this.comment,
    required this.isGraded,
    required this.tourId,
  });

  LecturerStudent copyWith({
    String? attendanceStatus,
    String? excuseReason,
    double? prelimGrade,
    double? extraGrade,
    double? gvhdGrade,
    String? comment,
    bool? isGraded,
  }) {
    return LecturerStudent(
      id: id,
      name: name,
      className: className,
      company: company,
      completedTours: completedTours,
      papersLeft: papersLeft,
      avatar: avatar,
      submittedDate: submittedDate,
      attendanceStatus: attendanceStatus ?? this.attendanceStatus,
      excuseReason: excuseReason ?? this.excuseReason,
      prelimGrade: prelimGrade ?? this.prelimGrade,
      extraGrade: extraGrade ?? this.extraGrade,
      gvhdGrade: gvhdGrade ?? this.gvhdGrade,
      aiSuggestedGrade: aiSuggestedGrade,
      comment: comment ?? this.comment,
      isGraded: isGraded ?? this.isGraded,
      tourId: tourId,
    );
  }
}

class LecturerTour {
  final String id;
  final String name;
  final String date;
  final String timeRange;
  final int registeredCount;
  final int maxCount;
  final String status; // 'upcoming', 'ongoing', 'completed'

  LecturerTour({
    required this.id,
    required this.name,
    required this.date,
    required this.timeRange,
    required this.registeredCount,
    required this.maxCount,
    required this.status,
  });
}

class CouncilSession {
  final String id;
  final String name;
  final String date;
  final String timeRange;
  final String room;
  final int studentCount;
  final String status; // 'upcoming', 'ongoing', 'completed'

  CouncilSession({
    required this.id,
    required this.name,
    required this.date,
    required this.timeRange,
    required this.room,
    required this.studentCount,
    required this.status,
  });
}

class LecturerNotification {
  final String id;
  final String title;
  final String body;
  final String time;
  final bool isUnread;
  final String? attachment;

  LecturerNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.time,
    required this.isUnread,
    this.attachment,
  });

  LecturerNotification copyWith({
    bool? isUnread,
  }) {
    return LecturerNotification(
      id: id,
      title: title,
      body: body,
      time: time,
      isUnread: isUnread ?? this.isUnread,
      attachment: attachment,
    );
  }
}

// --- Pre-populated Mock Database (Initial Dataset) ---

final initialStudentProfile = StudentProfile(
  name: 'Tăng Thị Lan Ngọc',
  email: 'lannogoc.tang2026@hufi.edu.vn',
  studentId: 'SV20261234',
  className: '22DHFood02',
  major: 'Công nghệ Thực phẩm',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
);

final initialLecturerProfile = LecturerProfile(
  name: 'Nguyễn Văn A',
  email: 'anv@hufi.edu.vn',
  teacherId: 'GV2110432',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  department: 'Bộ môn Công nghệ sinh học & thực phẩm',
);

final List<Trip> initialTrips = [
  Trip(
    id: 'vinamilk-today',
    name: 'Nhà máy Sữa Vinamilk Bình Dương',
    date: '15/10/2026',
    time: '08:00 - 12:00',
    type: 'Trực tiếp',
    location: 'Đường Tự Do, KCN Việt Nam - Singapore I, Thuận An, Bình Dương',
    industry: 'Chế biến Sữa & Nước giải khát',
    description: 'Tham quan nhà máy sữa hiện đại bậc nhất Việt Nam. Sinh viên được trải nghiệm dây chuyền sản xuất tự động hóa khép kín, quy trình kiểm soát chất lượng chuẩn ISO 22000 và hệ thống kho thông minh.',
    heroImage: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=500',
    isRegistered: false,
    isCompleted: false,
  ),
  Trip(
    id: 'acecook-nextweek',
    name: 'Công ty Cổ phần Acecook Việt Nam',
    date: '18/10/2026',
    time: '13:30 - 17:00',
    type: 'Trực tiếp',
    location: 'Đường số 11, KCN Tân Bình, Tân Phú, TP. Hồ Chí Minh',
    industry: 'Sản xuất Mì ăn liền & Thực phẩm đóng gói',
    description: 'Khám phá quy trình sản xuất mì ăn liền hàng đầu Việt Nam. Sinh viên sẽ được tìm hiểu công nghệ sấy và chiên tự động, quy trình kiểm nghiệm chất lượng nghiêm ngặt của Nhật Bản.',
    heroImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
    isRegistered: false,
    isCompleted: false,
  ),
  Trip(
    id: 'yakult-online',
    name: 'Công ty Yakult Việt Nam (Trực tuyến)',
    date: '20/10/2026',
    time: '09:00 - 11:00',
    type: 'Trực tuyến',
    location: 'Tham quan qua nền tảng Zoom Cloud Meetings',
    industry: 'Sản xuất sữa uống lên men',
    description: 'Chương trình kiến tập trực tuyến. Tham quan mô phỏng 3D phòng lên men vi khuẩn sữa L.casei Shirota, trao đổi cùng chuyên gia QA về công nghệ tiệt trùng sữa.',
    heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500',
    isRegistered: true,
    isCompleted: true,
    gradeDetails: GradeDetail(
      preparation: 9.0,
      report: 8.5,
      evaluation: 8.0,
      bonus: 0.5,
      total: 8.6,
    ),
  ),
  Trip(
    id: 'cailai-free',
    name: 'Cảng Cát Lái (Kiến tập tự do)',
    date: '12/09/2026',
    time: 'Tự chọn',
    type: 'Trực tiếp',
    location: 'Cảng Cát Lái, Nguyễn Thị Định, Quận 2, TP. Hồ Chí Minh',
    industry: 'Logistics chuỗi cung ứng lạnh thực phẩm',
    description: 'Kiến tập tự do. Sinh viên tự liên hệ đơn vị tiếp nhận để tìm hiểu quy trình bảo quản lạnh container nông sản xuất khẩu, viết báo cáo thu hoạch độc lập.',
    heroImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500',
    isRegistered: true,
    isCompleted: true,
    gradeDetails: GradeDetail(
      preparation: 8.0,
      report: 8.0,
      evaluation: 8.5,
      bonus: 0.0,
      total: 8.2,
    ),
  ),
];

final List<StudentNotification> initialStudentNotifications = [
  StudentNotification(
    id: 'notif-1',
    title: 'Nhắc nhở nộp lệ phí kiến tập Vinamilk',
    content: 'Thời hạn đóng phí 50.000đ cho chuyến đi nhà máy Vinamilk ngày 15/10/2026 sắp kết thúc. Đề nghị sinh viên khẩn trương hoàn thành thanh toán để được duyệt đi chính thức.',
    timeText: '10:00 - 13/10/2026',
    isRead: false,
    attachment: 'Quy_dinh_le_phi.pdf',
  ),
  StudentNotification(
    id: 'notif-2',
    title: 'Thông báo danh sách xe và sơ đồ chỗ ngồi đoàn Vinamilk',
    content: 'Đoàn kiến tập nhà máy Vinamilk sẽ xuất phát lúc 07:00 ngày 15/10/2026 tại Cổng 1 cơ sở chính. Chi tiết danh sách phân chia xe bus và sơ đồ chỗ ngồi đính kèm dưới đây.',
    timeText: '16:30 - 12/10/2026',
    isRead: true,
    attachment: 'Danh_sach_xe_Vinamilk.pdf',
  ),
  StudentNotification(
    id: 'notif-3',
    title: 'Công bố điểm chính thức chuyến Yakult trực tuyến',
    content: 'Khoa Công nghệ thực phẩm đã cập nhật điểm chính thức của chuyến Yakult ngày 20/09. Sinh viên vui lòng truy cập tab "Kết quả" để xem điểm chi tiết.',
    timeText: '09:00 - 25/09/2026',
    isRead: true,
  ),
];

final List<Submission> initialSubmissions = [
  Submission(
    id: 'sub-vinamilk-today',
    tripName: 'Chuyến đi nhà máy Vinamilk',
    typeText: 'Kiến tập trực tiếp',
    dateText: '15/10/2026',
    status: 'Chưa nộp',
  ),
  Submission(
    id: 'sub-yakult-online',
    tripName: 'Chuyến đi Yakult Việt Nam',
    typeText: 'Kiến tập trực tuyến',
    dateText: '20/10/2026',
    status: 'Đã nộp',
    fileName: 'baocao_yakult_ngoc.pdf',
    fileSize: '1.2 MB',
    submittedAt: '15:30 - 22/10/2026',
  ),
  Submission(
    id: 'sub-cailai-free',
    tripName: 'Kiến tập tự do Cảng Cát Lái',
    typeText: 'Kiến tập tự do',
    dateText: '12/09/2026',
    status: 'Đã nộp',
    fileName: 'baocao_cailai_ngoc.pdf',
    fileSize: '2.5 MB',
    submittedAt: '11:00 - 15/09/2026',
    hasConfirmationFile: true,
    confirmationFileName: 'giay_xac_nhan_cang_cat_lai.pdf',
  ),
];

final List<Payment> initialPayments = [
  Payment(
    id: 'pay-vinamilk',
    tripId: 'vinamilk-today',
    name: 'Chuyến: Nhà máy Sữa Vinamilk',
    code: 'KT2026-VINAMILK-58902',
    amount: 50000,
    dueDate: '15/10/2026',
    status: 'Chưa đóng',
  ),
  Payment(
    id: 'pay-yakult',
    tripId: 'yakult-online',
    name: 'Chuyến: Yakult Việt Nam',
    code: 'KT2026-YAKULT-41221',
    amount: 50000,
    dueDate: '20/10/2026',
    status: 'Đã đóng đúng hạn',
  ),
  Payment(
    id: 'pay-cailai',
    tripId: 'cailai-free',
    name: 'Chuyến: Cảng Cát Lái (Tự do)',
    code: 'KT2026-CATLAI-12903',
    amount: 50000,
    dueDate: '12/09/2026',
    status: 'Vi phạm',
  ),
];

final List<RefundRequest> initialRefunds = [
  RefundRequest(
    id: 'ref-1',
    invoiceName: 'HĐ: Cảng Cát Lái (Tự do)',
    dateText: '18/09/2026',
    amountText: '50.000đ',
    status: 'Đã hoàn tiền',
  ),
  RefundRequest(
    id: 'ref-2',
    invoiceName: 'HĐ: Công ty Yakult Việt Nam',
    dateText: '25/10/2026',
    amountText: '50.000đ',
    status: 'Từ chối',
  ),
];

// --- Lecturer Specific Mock Database ---

final List<LecturerStudent> initialLecturerStudents = [
  LecturerStudent(
    id: 'SV20261234',
    name: 'Tăng Thị Lan Ngọc',
    className: '22DHFood02',
    company: 'Acecook Việt Nam',
    completedTours: '3/3',
    papersLeft: 0,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    submittedDate: '10/10/2026',
    attendanceStatus: 'present',
    excuseReason: null,
    prelimGrade: 8.5,
    extraGrade: 0.5,
    gvhdGrade: 8.0,
    aiSuggestedGrade: 8.2,
    comment: 'Báo cáo trình bày chi tiết, có phân tích quy trình chiên sấy chất lượng.',
    isGraded: true,
    tourId: 'vinamilk-today',
  ),
  LecturerStudent(
    id: 'SV20269988',
    name: 'Trần Minh Hoàng',
    className: '22DHFood02',
    company: 'Vinamilk Bình Dương',
    completedTours: '2/3',
    papersLeft: 1,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    submittedDate: '12/10/2026',
    attendanceStatus: 'none',
    excuseReason: null,
    prelimGrade: 0.0,
    extraGrade: 0.0,
    gvhdGrade: 0.0,
    aiSuggestedGrade: 7.5,
    comment: null,
    isGraded: false,
    tourId: 'vinamilk-today',
  ),
  LecturerStudent(
    id: 'SV20267766',
    name: 'Nguyễn Thị Hoa',
    className: '22DHFood01',
    company: 'Yakult Việt Nam',
    completedTours: '3/3',
    papersLeft: 1,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    submittedDate: '14/10/2026',
    attendanceStatus: 'excused',
    excuseReason: 'Bị ốm có giấy khám sức khỏe bệnh viện',
    prelimGrade: 9.0,
    extraGrade: 1.0,
    gvhdGrade: 0.0,
    aiSuggestedGrade: 9.0,
    comment: null,
    isGraded: false,
    tourId: 'vinamilk-today',
  ),
];

final List<LecturerTour> initialLecturerTours = [
  LecturerTour(
    id: 'vinamilk-today',
    name: 'Đoàn 01 - Nhà máy Sữa Vinamilk',
    date: '15/10/2026',
    timeRange: '08:00 - 12:00',
    registeredCount: 12,
    maxCount: 15,
    status: 'ongoing',
  ),
  LecturerTour(
    id: 'acecook-nextweek',
    name: 'Đoàn 02 - Acecook Việt Nam',
    date: '18/10/2026',
    timeRange: '13:30 - 17:00',
    registeredCount: 15,
    maxCount: 15,
    status: 'upcoming',
  ),
];

final List<CouncilSession> initialCouncils = [
  CouncilSession(
    id: 'counc-1',
    name: 'Hội đồng chấm báo cáo thực tập tốt nghiệp đợt 1',
    date: '15/10/2026',
    timeRange: '13:30 - 17:00',
    room: 'Phòng học A1.204',
    studentCount: 8,
    status: 'upcoming',
  ),
];

final List<LecturerNotification> initialLecturerNotifications = [
  LecturerNotification(
    id: 'notif-gv-1',
    title: 'Phân công hướng dẫn đợt 1 năm học 2026-2027',
    body: 'Kính gửi quý thầy cô, danh sách sinh viên khoa phân công hướng dẫn kiến tập thực tế đợt 1 đã được phê duyệt. Vui lòng kiểm tra chi tiết trong tab "Sinh viên hướng dẫn" để theo dõi kế hoạch.',
    time: '08:00 - 05/10/2026',
    isUnread: true,
    attachment: 'Quyet_dinh_huong_dan_dot_1.pdf',
  ),
  LecturerNotification(
    id: 'notif-gv-2',
    title: 'Thông báo họp Hội đồng chuẩn bị chấm tốt nghiệp',
    body: 'Kính mời thầy/cô tham dự buổi họp chuẩn bị hội đồng chấm báo cáo thực tế tốt nghiệp vào lúc 14:00 ngày 12/10/2026 tại Văn phòng Khoa Công nghệ thực phẩm.',
    time: '14:30 - 10/10/2026',
    isUnread: false,
  ),
];
