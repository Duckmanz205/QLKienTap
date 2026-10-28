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

class StudentDashboardStats {
  final int registered;
  final int completed;
  final int pendingReports;
  final String avgScore;

  StudentDashboardStats({
    required this.registered,
    required this.completed,
    required this.pendingReports,
    required this.avgScore,
  });
}

class LecturerDashboardStats {
  final int doanDangDan;
  final int baiCanCham;
  final int buoiBaoCao;
  final int tongSvHuongDan;

  LecturerDashboardStats({
    required this.doanDangDan,
    required this.baiCanCham,
    required this.buoiBaoCao,
    required this.tongSvHuongDan,
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
  final String? registrationId;
  final bool daTungDangKy;
  final String? trangThaiCu;
  final String? registrationStatus;
  final String? tripStatus;

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
    this.registrationId,
    this.daTungDangKy = false,
    this.trangThaiCu,
    this.registrationStatus,
    this.tripStatus,
  });

  Trip copyWith({
    bool? isRegistered,
    bool? isCompleted,
    GradeDetail? gradeDetails,
    String? registrationId,
    bool? daTungDangKy,
    String? trangThaiCu,
    String? registrationStatus,
    String? tripStatus,
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
      registrationId: registrationId ?? this.registrationId,
      daTungDangKy: daTungDangKy ?? this.daTungDangKy,
      trangThaiCu: trangThaiCu ?? this.trangThaiCu,
      registrationStatus: registrationStatus ?? this.registrationStatus,
      tripStatus: tripStatus ?? this.tripStatus,
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
  final String? fileUrl;
  final String? type;

  StudentNotification({
    required this.id,
    required this.title,
    required this.content,
    required this.timeText,
    required this.isRead,
    this.attachment,
    this.fileUrl,
    this.type,
  });

  StudentNotification copyWith({
    bool? isRead,
    String? fileUrl,
    String? type,
  }) {
    return StudentNotification(
      id: id,
      title: title,
      content: content,
      timeText: timeText,
      isRead: isRead ?? this.isRead,
      attachment: attachment,
      fileUrl: fileUrl ?? this.fileUrl,
      type: type ?? this.type,
    );
  }
}

class Submission {
  final String id;
  final int? registrationId;
  final String tripName;
  final String typeText;
  final String dateText;
  final String status; // 'Chưa nộp', 'Đã nộp', 'Trễ hạn - trừ điểm'
  final String? fileName;
  final String? fileSize;
  final String? submittedAt;
  final bool hasConfirmationFile;
  final String? confirmationFileName;
  final String? fileBaoCaoUrl;
  final String? fileXacNhanUrl;
  final DateTime? tripDate;

  Submission({
    required this.id,
    this.registrationId,
    required this.tripName,
    required this.typeText,
    required this.dateText,
    required this.status,
    this.fileName,
    this.fileSize,
    this.submittedAt,
    this.hasConfirmationFile = false,
    this.confirmationFileName,
    this.fileBaoCaoUrl,
    this.fileXacNhanUrl,
    this.tripDate,
  });

  Submission copyWith({
    int? registrationId,
    String? status,
    String? fileName,
    String? fileSize,
    String? submittedAt,
    bool? hasConfirmationFile,
    String? confirmationFileName,
    String? fileBaoCaoUrl,
    String? fileXacNhanUrl,
    DateTime? tripDate,
  }) {
    return Submission(
      id: id,
      registrationId: registrationId ?? this.registrationId,
      tripName: tripName,
      typeText: typeText,
      dateText: dateText,
      status: status ?? this.status,
      fileName: fileName ?? this.fileName,
      fileSize: fileSize ?? this.fileSize,
      submittedAt: submittedAt ?? this.submittedAt,
      hasConfirmationFile: hasConfirmationFile ?? this.hasConfirmationFile,
      confirmationFileName: confirmationFileName ?? this.confirmationFileName,
      fileBaoCaoUrl: fileBaoCaoUrl ?? this.fileBaoCaoUrl,
      fileXacNhanUrl: fileXacNhanUrl ?? this.fileXacNhanUrl,
      tripDate: tripDate ?? this.tripDate,
    );
  }
}

class Payment {
  final String id;
  final String tripId;
  final String name;
  final String code;
  final double amount;
  final String dueDate;
  final String status; // 'Chưa đóng', 'Đã đóng đúng hạn', 'Đã đóng trễ hạn', 'Vi phạm', 'Đã hoàn phí'
  final String? rawStatus;
  final String? tripDate;
  final String? tripType;
  final String? paidDate;

  Payment({
    required this.id,
    required this.tripId,
    required this.name,
    required this.code,
    required this.amount,
    required this.dueDate,
    required this.status,
    this.rawStatus,
    this.tripDate,
    this.tripType,
    this.paidDate,
  });

  Payment copyWith({
    String? status,
    String? rawStatus,
    String? tripDate,
    String? tripType,
    String? paidDate,
  }) {
    return Payment(
      id: id,
      tripId: tripId,
      name: name,
      code: code,
      amount: amount,
      dueDate: dueDate,
      status: status ?? this.status,
      rawStatus: rawStatus ?? this.rawStatus,
      tripDate: tripDate ?? this.tripDate,
      tripType: tripType ?? this.tripType,
      paidDate: paidDate ?? this.paidDate,
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

// --- Proposal Entity ---
class TripProposal {
  final int id;
  final String tenDoanhNghiep;
  final String? diaChi;
  final String? ngayThamQuan;
  final String? gioBatDau;
  final String? hinhThuc;
  final String trangThai; // 'ChoDuyet', 'ChoKhoaDuyet', 'DaDuyet', 'TuChoi'
  final String? lyDo;
  final String? phanHoi;

  TripProposal({
    required this.id,
    required this.tenDoanhNghiep,
    this.diaChi,
    this.ngayThamQuan,
    this.gioBatDau,
    this.hinhThuc,
    required this.trangThai,
    this.lyDo,
    this.phanHoi,
  });

  bool get isPending => trangThai == 'ChoDuyet' || trangThai == 'ChoKhoaDuyet';
  bool get isApproved => trangThai == 'DaDuyet' || trangThai == 'ChapNhan' || trangThai == 'Approved';
  bool get isRejected => trangThai == 'TuChoi' || trangThai == 'Rejected';
  bool get isCancelable => isPending;
}

// --- Term Grade & Trip Grades Entities ---
class TripGradeItem {
  final int id;
  final String tenNhaMay;
  final String hinhThuc;
  final double? diemChuanBi;
  final double? diemBaiThuHoach;
  final double? diemBaoCaoTQNM;
  final double? diemCong;
  final double? diemTongChuyen;
  final String? ketQua; // 'Dat', 'KhongDat', 'ChoDiem'
  final String? nhanXetGvhd;
  final String? nhanXetHoiDong;
  final bool daKhoaChuanBi;
  final bool daKhoaThuHoach;
  final bool daKhoaHoiDong;
  final bool daKhoa;

  TripGradeItem({
    required this.id,
    required this.tenNhaMay,
    this.hinhThuc = 'Trực tiếp',
    this.diemChuanBi,
    this.diemBaiThuHoach,
    this.diemBaoCaoTQNM,
    this.diemCong,
    this.diemTongChuyen,
    this.ketQua,
    this.nhanXetGvhd,
    this.nhanXetHoiDong,
    this.daKhoaChuanBi = false,
    this.daKhoaThuHoach = false,
    this.daKhoaHoiDong = false,
    this.daKhoa = false,
  });

  double? calculateCalculatedScore() {
    if (diemTongChuyen != null) return diemTongChuyen;
    if (diemChuanBi == null || diemBaiThuHoach == null || diemBaoCaoTQNM == null) {
      return null;
    }
    final score = (diemChuanBi! * 0.3) +
        (diemBaiThuHoach! * 0.3) +
        (diemBaoCaoTQNM! * 0.4) +
        (diemCong ?? 0);
    return score > 10.0 ? 10.0 : score;
  }
}

class StudentTermGrade {
  final double? diemTongKet;
  final String? trangThai; // 'Dat', 'KhongDat', 'ChoDiem'
  final bool isScoreLocked;
  final List<TripGradeItem> tripGrades;

  StudentTermGrade({
    this.diemTongKet,
    this.trangThai,
    required this.isScoreLocked,
    required this.tripGrades,
  });

  bool get isPassed {
    if (diemTongKet != null) {
      return diemTongKet! >= 5.0;
    }
    final validGrades = tripGrades
        .map((t) => t.calculateCalculatedScore())
        .where((s) => s != null)
        .toList();
    if (validGrades.isNotEmpty) {
      final avg = validGrades.fold<double>(0, (acc, s) => acc + s!) / validGrades.length;
      return avg >= 5.0;
    }
    return false;
  }
}

// --- Representative Trips Status & Committee Info ---
class RepresentativeTripsStatus {
  final List<int> selectedRegistrationIds;
  final bool isLockedByKhoa;
  final String? lockReason;
  final bool canEdit;
  final String? councilSessionName;
  final String? councilRoom;
  final String? councilTime;
  final List<String> councilMembers;

  RepresentativeTripsStatus({
    this.selectedRegistrationIds = const [],
    this.isLockedByKhoa = false,
    this.lockReason,
    this.canEdit = true,
    this.councilSessionName,
    this.councilRoom,
    this.councilTime,
    this.councilMembers = const [],
  });
}

// --- Trip Bus Info & Members ---
class TripBusMember {
  final int id;
  final String hoTen;
  final String mssv;
  final bool isLeader;

  TripBusMember({
    required this.id,
    required this.hoTen,
    required this.mssv,
    this.isLeader = false,
  });
}

class TripBusInfo {
  final int tripId;
  final String tenChuyenDi;
  final String gioBatDau;
  final String gioKetThuc;
  final String hinhThuc;
  final String? lecturerName;
  final String? lecturerPhone;
  final List<TripBusMember> students;

  TripBusInfo({
    required this.tripId,
    required this.tenChuyenDi,
    required this.gioBatDau,
    required this.gioKetThuc,
    required this.hinhThuc,
    this.lecturerName,
    this.lecturerPhone,
    required this.students,
  });
}

// --- Trip Registration Student (For Lecturer Led Trip) ---
class TripRegistrationStudent {
  final int phieuId;
  final int sinhVienId;
  final String mssv;
  final String hoTen;
  final String className;
  final String? soDienThoai;
  final String? email;
  final String avatar;
  final String feeStatus; // 'DaDongDungHan', 'ChuaDong', 'ViPham'
  final String attendanceStatus; // 'CoMat', 'Vang', 'TuChoiThamGia', 'ChuaDiemDanh'
  final String? excuseReason;
  final double prelimGrade; // Điểm chuẩn bị
  final double extraGrade;  // Điểm cộng
  final bool isLockedPrep;

  TripRegistrationStudent({
    required this.phieuId,
    required this.sinhVienId,
    required this.mssv,
    required this.hoTen,
    required this.className,
    this.soDienThoai,
    this.email,
    required this.avatar,
    required this.feeStatus,
    required this.attendanceStatus,
    this.excuseReason,
    this.prelimGrade = 0.0,
    this.extraGrade = 0.0,
    this.isLockedPrep = false,
  });

  TripRegistrationStudent copyWith({
    String? attendanceStatus,
    String? excuseReason,
    double? prelimGrade,
    double? extraGrade,
    bool? isLockedPrep,
  }) {
    return TripRegistrationStudent(
      phieuId: phieuId,
      sinhVienId: sinhVienId,
      mssv: mssv,
      hoTen: hoTen,
      className: className,
      soDienThoai: soDienThoai,
      email: email,
      avatar: avatar,
      feeStatus: feeStatus,
      attendanceStatus: attendanceStatus ?? this.attendanceStatus,
      excuseReason: excuseReason ?? this.excuseReason,
      prelimGrade: prelimGrade ?? this.prelimGrade,
      extraGrade: extraGrade ?? this.extraGrade,
      isLockedPrep: isLockedPrep ?? this.isLockedPrep,
    );
  }
}

// --- Council Board Session Models ---
class CouncilStudentTripItem {
  final int phieuId;
  final String tenNhaMay;
  final String hinhThuc;
  final double? myScore;
  final double? diemTong;
  final bool isLocked;

  CouncilStudentTripItem({
    required this.phieuId,
    required this.tenNhaMay,
    required this.hinhThuc,
    this.myScore,
    this.diemTong,
    this.isLocked = false,
  });
}

class CouncilStudentItem {
  final int studentId;
  final String mssv;
  final String hoTen;
  final String className;
  final String? topic;
  final List<CouncilStudentTripItem> trips;
  final bool isGradeLocked;
  final String? councilNote;
  final int? boChuyenId;

  CouncilStudentItem({
    required this.studentId,
    required this.mssv,
    required this.hoTen,
    required this.className,
    this.topic,
    required this.trips,
    this.isGradeLocked = false,
    this.councilNote,
    this.boChuyenId,
  });

  CouncilStudentItem copyWith({
    int? studentId,
    String? mssv,
    String? hoTen,
    String? className,
    String? topic,
    List<CouncilStudentTripItem>? trips,
    bool? isGradeLocked,
    String? councilNote,
    int? boChuyenId,
  }) {
    return CouncilStudentItem(
      studentId: studentId ?? this.studentId,
      mssv: mssv ?? this.mssv,
      hoTen: hoTen ?? this.hoTen,
      className: className ?? this.className,
      topic: topic ?? this.topic,
      trips: trips ?? this.trips,
      isGradeLocked: isGradeLocked ?? this.isGradeLocked,
      councilNote: councilNote ?? this.councilNote,
      boChuyenId: boChuyenId ?? this.boChuyenId,
    );
  }
}

class CouncilBoardItem {
  final int sessionId;
  final int memberId;
  final String sessionName;
  final String room;
  final String date;
  final String timeRange;
  final String role; // 'ChuTich', 'ThuKy', 'UyVien'
  final String status; // 'upcoming', 'ongoing', 'completed'
  final bool isBoardLocked;
  final List<CouncilStudentItem> students;

  CouncilBoardItem({
    required this.sessionId,
    required this.memberId,
    required this.sessionName,
    required this.room,
    required this.date,
    required this.timeRange,
    required this.role,
    required this.status,
    this.isBoardLocked = false,
    required this.students,
  });
}

// --- Lecturer Specific Entities ---

class LecturerStudent {
  final String id; // MSSV
  final int? phieuId; // Mã phiếu đăng ký thực tế từ DB
  final int? reportId; // Mã bài thu hoạch thực tế từ DB
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
  final double? aiSuggestedGrade;
  final String? comment;
  final bool isGraded;
  final String tourId;
  final String? reportFileUrl;
  final String? confirmationFileUrl;

  LecturerStudent({
    required this.id,
    this.phieuId,
    this.reportId,
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
    this.aiSuggestedGrade,
    this.comment,
    required this.isGraded,
    required this.tourId,
    this.reportFileUrl,
    this.confirmationFileUrl,
  });

  LecturerStudent copyWith({
    int? phieuId,
    int? reportId,
    String? attendanceStatus,
    String? excuseReason,
    double? prelimGrade,
    double? extraGrade,
    double? gvhdGrade,
    String? comment,
    bool? isGraded,
    String? reportFileUrl,
    String? confirmationFileUrl,
  }) {
    return LecturerStudent(
      id: id,
      phieuId: phieuId ?? this.phieuId,
      reportId: reportId ?? this.reportId,
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
      reportFileUrl: reportFileUrl ?? this.reportFileUrl,
      confirmationFileUrl: confirmationFileUrl ?? this.confirmationFileUrl,
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
  final String role;

  CouncilSession({
    required this.id,
    required this.name,
    required this.date,
    required this.timeRange,
    required this.room,
    required this.studentCount,
    required this.status,
    required this.role,
  });
}

class LecturerNotification {
  final String id;
  final String title;
  final String body;
  final String time;
  final bool isUnread;
  final String? attachment;
  final String? fileUrl;
  final String? type;

  LecturerNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.time,
    required this.isUnread,
    this.attachment,
    this.fileUrl,
    this.type,
  });

  LecturerNotification copyWith({
    bool? isUnread,
    String? fileUrl,
    String? type,
  }) {
    return LecturerNotification(
      id: id,
      title: title,
      body: body,
      time: time,
      isUnread: isUnread ?? this.isUnread,
      attachment: attachment,
      fileUrl: fileUrl ?? this.fileUrl,
      type: type ?? this.type,
    );
  }
}
