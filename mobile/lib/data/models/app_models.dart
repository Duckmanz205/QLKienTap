import 'package:flutter/material.dart';

// --- Smart Reminders & Entities ---

enum ReminderSeverity { info, warning, urgent }

class SmartReminderItem {
  final String id;
  final String title;
  final String message;
  final ReminderSeverity severity;
  final IconData icon;
  final String? actionLabel;
  final String? actionType;
  final String? targetId;
  final DateTime? deadline;

  SmartReminderItem({
    required this.id,
    required this.title,
    required this.message,
    required this.severity,
    required this.icon,
    this.actionLabel,
    this.actionType,
    this.targetId,
    this.deadline,
  });
}

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
  final String? cachToChuc;
  final String? fileXacNhanUrl;
  final String? diaDiemTapTrung;
  final String? gioBatDau;
  final String? gioKetThuc;
  final String? hinhThuc;
  final DateTime? rawNgayThamQuan;

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
    this.cachToChuc,
    this.fileXacNhanUrl,
    this.diaDiemTapTrung,
    this.gioBatDau,
    this.gioKetThuc,
    this.hinhThuc,
    this.rawNgayThamQuan,
  });

  bool get isTuDo => cachToChuc == 'TuDo' || type == 'Tự do' || type.toLowerCase().contains('tự do');

  Trip copyWith({
    bool? isRegistered,
    bool? isCompleted,
    GradeDetail? gradeDetails,
    String? registrationId,
    bool? daTungDangKy,
    String? trangThaiCu,
    String? registrationStatus,
    String? tripStatus,
    String? cachToChuc,
    String? fileXacNhanUrl,
    String? diaDiemTapTrung,
    String? gioBatDau,
    String? gioKetThuc,
    String? hinhThuc,
    DateTime? rawNgayThamQuan,
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
      cachToChuc: cachToChuc ?? this.cachToChuc,
      fileXacNhanUrl: fileXacNhanUrl ?? this.fileXacNhanUrl,
      diaDiemTapTrung: diaDiemTapTrung ?? this.diaDiemTapTrung,
      gioBatDau: gioBatDau ?? this.gioBatDau,
      gioKetThuc: gioKetThuc ?? this.gioKetThuc,
      hinhThuc: hinhThuc ?? this.hinhThuc,
      rawNgayThamQuan: rawNgayThamQuan ?? this.rawNgayThamQuan,
    );
  }
}

class StudentNotification {
  final String id;
  final String title;
  final String content;
  final String timeText;
  final bool isRead;
  final String? type;
  final String? attachment;
  final String? fileUrl;
  final String? senderName;
  final String? targetAudience;
  final bool isEdited;
  final String? editedAt;

  StudentNotification({
    required this.id,
    required this.title,
    required this.content,
    required this.timeText,
    this.isRead = false,
    this.type,
    this.attachment,
    this.fileUrl,
    this.senderName,
    this.targetAudience,
    this.isEdited = false,
    this.editedAt,
  });

  StudentNotification copyWith({
    bool? isRead,
    String? fileUrl,
    String? type,
    String? senderName,
    String? targetAudience,
    bool? isEdited,
    String? editedAt,
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
      senderName: senderName ?? this.senderName,
      targetAudience: targetAudience ?? this.targetAudience,
      isEdited: isEdited ?? this.isEdited,
      editedAt: editedAt ?? this.editedAt,
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
  final double? reportScore;
  final String? gvhdComment;
  final String? gvhdName;
  final bool isScoreLocked;
  final String? gradedAt;
  final String? deadlineText;
  final String? cachToChuc;
  final String? diemDanhStatus;
  final bool hasPhieuThamQuan;
  final String? hoaDonStatus;
  final String? reportStatus;
  final DateTime? hanNopDate;
  final DateTime? hanKhoaDate;
  final bool isExtended;
  final DateTime? diemDanhNgay;
  final String? diemDanhNguoi;
  final String? diemDanhGhiChu;
  final int? lanNop;
  final String? diaDiemTapTrung;

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
    this.reportScore,
    this.gvhdComment,
    this.gvhdName,
    this.isScoreLocked = false,
    this.gradedAt,
    this.deadlineText,
    this.cachToChuc,
    this.diemDanhStatus,
    this.hasPhieuThamQuan = true,
    this.hoaDonStatus,
    this.reportStatus,
    this.hanNopDate,
    this.hanKhoaDate,
    this.isExtended = false,
    this.diemDanhNgay,
    this.diemDanhNguoi,
    this.diemDanhGhiChu,
    this.lanNop,
    this.diaDiemTapTrung,
  });

  bool get isGraded => reportScore != null;
  bool get isTuDo => cachToChuc == 'TuDo' || typeText.toLowerCase().contains('tự do') || typeText.toLowerCase().contains('tudo');
  bool get isChoDuyetDiemDanh => status == 'Chờ duyệt điểm danh';
  bool get isPastLock => hanKhoaDate != null && DateTime.now().isAfter(hanKhoaDate!);
  bool get isPastOnTime => hanNopDate != null && DateTime.now().isAfter(hanNopDate!);
  bool get canSubmitReport {
    if (!hasPhieuThamQuan) return false;
    if (isPastLock) return false;
    if (isTuDo) return true;
    return diemDanhStatus == 'CoMat';
  }
  String? get disabledReason {
    if (!hasPhieuThamQuan) {
      return (hoaDonStatus == 'ChuaDong' ? 'Chưa đóng phí' : 'Chưa có PTQ');
    }
    if (isPastLock) {
      return 'Đã khóa cổng';
    }
    if (!isTuDo && diemDanhStatus != 'CoMat') {
      return 'Chưa điểm danh';
    }
    return null;
  }

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
    double? reportScore,
    String? gvhdComment,
    String? gvhdName,
    bool? isScoreLocked,
    String? gradedAt,
    String? deadlineText,
    String? cachToChuc,
    String? diemDanhStatus,
    bool? hasPhieuThamQuan,
    String? hoaDonStatus,
    String? reportStatus,
    DateTime? hanNopDate,
    DateTime? hanKhoaDate,
    bool? isExtended,
    DateTime? diemDanhNgay,
    String? diemDanhNguoi,
    String? diemDanhGhiChu,
    int? lanNop,
    String? diaDiemTapTrung,
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
      reportScore: reportScore ?? this.reportScore,
      gvhdComment: gvhdComment ?? this.gvhdComment,
      gvhdName: gvhdName ?? this.gvhdName,
      isScoreLocked: isScoreLocked ?? this.isScoreLocked,
      gradedAt: gradedAt ?? this.gradedAt,
      deadlineText: deadlineText ?? this.deadlineText,
      cachToChuc: cachToChuc ?? this.cachToChuc,
      diemDanhStatus: diemDanhStatus ?? this.diemDanhStatus,
      hasPhieuThamQuan: hasPhieuThamQuan ?? this.hasPhieuThamQuan,
      hoaDonStatus: hoaDonStatus ?? this.hoaDonStatus,
      reportStatus: reportStatus ?? this.reportStatus,
      hanNopDate: hanNopDate ?? this.hanNopDate,
      hanKhoaDate: hanKhoaDate ?? this.hanKhoaDate,
      isExtended: isExtended ?? this.isExtended,
      diemDanhNgay: diemDanhNgay ?? this.diemDanhNgay,
      diemDanhNguoi: diemDanhNguoi ?? this.diemDanhNguoi,
      diemDanhGhiChu: diemDanhGhiChu ?? this.diemDanhGhiChu,
      lanNop: lanNop ?? this.lanNop,
      diaDiemTapTrung: diaDiemTapTrung ?? this.diaDiemTapTrung,
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
  final String? lyDoTuChoi;

  RefundRequest({
    required this.id,
    required this.invoiceName,
    required this.dateText,
    required this.amountText,
    required this.status,
    this.lyDoTuChoi,
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
  final String? lyDoTuChoi;

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
    this.lyDoTuChoi,
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
  final int? dotKienTapId;
  final String? tenDot;
  final String? namHoc;
  final String? hocKy;
  final int? lanDangKy;
  final double? diemTongKet;
  final String? trangThai; // 'Dat', 'KhongDat', 'ChoDiem'
  final bool isScoreLocked;
  final List<TripGradeItem> tripGrades;

  StudentTermGrade({
    this.dotKienTapId,
    this.tenDot,
    this.namHoc,
    this.hocKy,
    this.lanDangKy,
    this.diemTongKet,
    this.trangThai,
    required this.isScoreLocked,
    required this.tripGrades,
  });

  bool get isPassed {
    if (trangThai == 'Dat') return true;
    if (trangThai == 'KhongDat') return false;
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
class TripLecturer {
  final int id;
  final String hoTen;
  final String? email;
  final String? soDienThoai;
  final bool laTruongDoan;
  final String? vaiTro;

  TripLecturer({
    required this.id,
    required this.hoTen,
    this.email,
    this.soDienThoai,
    this.laTruongDoan = false,
    this.vaiTro,
  });

  factory TripLecturer.fromJson(Map<String, dynamic> json) {
    return TripLecturer(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      hoTen: json['ho_ten']?.toString() ?? json['name']?.toString() ?? '',
      email: json['email']?.toString(),
      soDienThoai: json['so_dien_thoai']?.toString() ?? json['sdt']?.toString() ?? json['phone']?.toString(),
      laTruongDoan: json['la_truong_doan'] == true,
      vaiTro: json['vai_tro']?.toString() ?? 'Giảng viên dẫn đoàn',
    );
  }
}

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
  final List<TripLecturer> lecturers;
  final List<TripBusMember> students;
  final String? enterpriseContactPerson;
  final String? enterpriseContactPhone;
  final String? enterpriseContactEmail;
  final String? diaDiemTapTrung;
  final String? ngayThamQuan;
  final String? diaChiNhaMay;
  final String? cachToChuc;

  TripBusInfo({
    required this.tripId,
    required this.tenChuyenDi,
    required this.gioBatDau,
    required this.gioKetThuc,
    required this.hinhThuc,
    this.lecturerName,
    this.lecturerPhone,
    this.lecturers = const [],
    required this.students,
    this.enterpriseContactPerson,
    this.enterpriseContactPhone,
    this.enterpriseContactEmail,
    this.diaDiemTapTrung,
    this.ngayThamQuan,
    this.diaChiNhaMay,
    this.cachToChuc,
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
  final double? prelimGrade; // Điểm chuẩn bị
  final double extraGrade;  // Điểm cộng
  final bool isLockedPrep;
  final String? fileXacNhanUrl;
  final String? cachToChuc;

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
    this.prelimGrade,
    this.extraGrade = 0.0,
    this.isLockedPrep = false,
    this.fileXacNhanUrl,
    this.cachToChuc,
  });

  TripRegistrationStudent copyWith({
    String? attendanceStatus,
    String? excuseReason,
    double? prelimGrade,
    double? extraGrade,
    bool? isLockedPrep,
    String? fileXacNhanUrl,
    String? cachToChuc,
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
      fileXacNhanUrl: fileXacNhanUrl ?? this.fileXacNhanUrl,
      cachToChuc: cachToChuc ?? this.cachToChuc,
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
  final double? prelimGrade; // Điểm chuẩn bị
  final double extraGrade;  // Điểm cộng (max 1.0)
  final double gvhdGrade;   // Điểm GVHD chấm
  final double? aiSuggestedGrade;
  final String? comment;
  final bool isGraded;
  final String tourId;
  final int? dotKienTapId;
  final String? termName;
  final String? reportFileUrl;
  final String? confirmationFileUrl;
  final bool isScoreLocked;
  final int? phieuThamQuanId;
  final String? hanNopBaoCao;
  final String? trangThaiNop;

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
    this.prelimGrade,
    required this.extraGrade,
    required this.gvhdGrade,
    this.aiSuggestedGrade,
    this.comment,
    required this.isGraded,
    required this.tourId,
    this.dotKienTapId,
    this.termName,
    this.reportFileUrl,
    this.confirmationFileUrl,
    this.isScoreLocked = false,
    this.phieuThamQuanId,
    this.hanNopBaoCao,
    this.trangThaiNop,
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
    int? papersLeft,
    int? dotKienTapId,
    String? termName,
    String? reportFileUrl,
    String? confirmationFileUrl,
    bool? isScoreLocked,
    int? phieuThamQuanId,
    String? hanNopBaoCao,
    String? trangThaiNop,
  }) {
    return LecturerStudent(
      id: id,
      phieuId: phieuId ?? this.phieuId,
      reportId: reportId ?? this.reportId,
      name: name,
      className: className,
      company: company,
      completedTours: completedTours,
      papersLeft: papersLeft ?? this.papersLeft,
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
      dotKienTapId: dotKienTapId ?? this.dotKienTapId,
      termName: termName ?? this.termName,
      reportFileUrl: reportFileUrl ?? this.reportFileUrl,
      confirmationFileUrl: confirmationFileUrl ?? this.confirmationFileUrl,
      isScoreLocked: isScoreLocked ?? this.isScoreLocked,
      phieuThamQuanId: phieuThamQuanId ?? this.phieuThamQuanId,
      hanNopBaoCao: hanNopBaoCao ?? this.hanNopBaoCao,
      trangThaiNop: trangThaiNop ?? this.trangThaiNop,
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
  final DateTime? rawTripDate;
  final String? rawStartTime;
  final String? rawStatus;
  final String? companyName;

  LecturerTour({
    required this.id,
    required this.name,
    required this.date,
    required this.timeRange,
    required this.registeredCount,
    required this.maxCount,
    required this.status,
    this.rawTripDate,
    this.rawStartTime,
    this.rawStatus,
    this.companyName,
  });

  bool get isStarted {
    if (rawTripDate == null) return true;
    final d = rawTripDate!;
    int hours = 0;
    int minutes = 0;
    if (rawStartTime != null && rawStartTime!.isNotEmpty) {
      final cleanTime = rawStartTime!.contains('T')
          ? rawStartTime!.split('T')[1].substring(0, 8)
          : rawStartTime!;
      final parts = cleanTime.split(':');
      if (parts.isNotEmpty) hours = int.tryParse(parts[0]) ?? 0;
      if (parts.length > 1) minutes = int.tryParse(parts[1]) ?? 0;
    }
    final start = DateTime(d.year, d.month, d.day, hours, minutes);
    return DateTime.now().isAfter(start) || DateTime.now().isAtSameMomentAs(start);
  }

  String get formattedStartDateTime {
    if (rawTripDate == null) return date;
    final d = rawTripDate!;
    final dateStr = '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
    String timeStr = '08:00';
    if (rawStartTime != null && rawStartTime!.isNotEmpty) {
      final cleanTime = rawStartTime!.contains('T')
          ? rawStartTime!.split('T')[1].substring(0, 5)
          : rawStartTime!;
      timeStr = cleanTime.length >= 5 ? cleanTime.substring(0, 5) : cleanTime;
    }
    return '$timeStr ngày $dateStr';
  }
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
  final String? type;
  final String? attachment;
  final String? fileUrl;
  final String? senderName;
  final String? targetAudience;
  final bool isEdited;
  final String? editedAt;

  LecturerNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.time,
    this.isUnread = false,
    this.type,
    this.attachment,
    this.fileUrl,
    this.senderName,
    this.targetAudience,
    this.isEdited = false,
    this.editedAt,
  });

  LecturerNotification copyWith({
    bool? isUnread,
    String? fileUrl,
    String? type,
    String? senderName,
    String? targetAudience,
    bool? isEdited,
    String? editedAt,
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
      senderName: senderName ?? this.senderName,
      targetAudience: targetAudience ?? this.targetAudience,
      isEdited: isEdited ?? this.isEdited,
      editedAt: editedAt ?? this.editedAt,
    );
  }
}
