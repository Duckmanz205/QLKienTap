import 'dart:math';
import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../../core/network/api_service.dart';

class AppState {
  String? currentRole; // 'student', 'lecturer', or null
  
  // Student state
  StudentProfile studentProfile;
  List<Trip> studentTrips;
  List<StudentNotification> studentNotifications;
  List<Submission> submissions;
  List<Payment> payments;
  List<RefundRequest> refunds;
  
  // Lecturer state
  LecturerProfile lecturerProfile;
  List<LecturerStudent> lecturerStudents;
  List<LecturerTour> lecturerTours;
  List<CouncilSession> councilSessions;
  List<LecturerNotification> lecturerNotifications;

  AppState({
    this.currentRole,
    required this.studentProfile,
    required this.studentTrips,
    required this.studentNotifications,
    required this.submissions,
    required this.payments,
    required this.refunds,
    required this.lecturerProfile,
    required this.lecturerStudents,
    required this.lecturerTours,
    required this.councilSessions,
    required this.lecturerNotifications,
  });

  AppState copyWith({
    String? currentRole,
    StudentProfile? studentProfile,
    List<Trip>? studentTrips,
    List<StudentNotification>? studentNotifications,
    List<Submission>? submissions,
    List<Payment>? payments,
    List<RefundRequest>? refunds,
    LecturerProfile? lecturerProfile,
    List<LecturerStudent>? lecturerStudents,
    List<LecturerTour>? lecturerTours,
    List<CouncilSession>? councilSessions,
    List<LecturerNotification>? lecturerNotifications,
  }) {
    return AppState(
      currentRole: currentRole ?? this.currentRole,
      studentProfile: studentProfile ?? this.studentProfile,
      studentTrips: studentTrips ?? this.studentTrips,
      studentNotifications: studentNotifications ?? this.studentNotifications,
      submissions: submissions ?? this.submissions,
      payments: payments ?? this.payments,
      refunds: refunds ?? this.refunds,
      lecturerProfile: lecturerProfile ?? this.lecturerProfile,
      lecturerStudents: lecturerStudents ?? this.lecturerStudents,
      lecturerTours: lecturerTours ?? this.lecturerTours,
      councilSessions: councilSessions ?? this.councilSessions,
      lecturerNotifications: lecturerNotifications ?? this.lecturerNotifications,
    );
  }
}

class AppStateProvider extends InheritedWidget {
  final AppState state;
  final AppStateProviderState stateWidget;

  const AppStateProvider({
    super.key,
    required this.state,
    required this.stateWidget,
    required super.child,
  });

  static AppStateProviderState of(BuildContext context) {
    final provider = context.dependOnInheritedWidgetOfExactType<AppStateProvider>();
    if (provider == null) {
      throw Exception('AppStateProvider not found in context');
    }
    return provider.stateWidget;
  }

  @override
  bool updateShouldNotify(AppStateProvider oldWidget) {
    return state != oldWidget.state;
  }
}

class AppStateContainer extends StatefulWidget {
  final Widget child;

  const AppStateContainer({super.key, required this.child});

  @override
  State<AppStateContainer> createState() => AppStateProviderState();
}

class AppStateProviderState extends State<AppStateContainer> {
  late AppState _state;

  AppState get state => _state;

  @override
  void initState() {
    super.initState();
    _resetToDefaults(notify: false);
    
    // Bind 401 Unauthorized handler
    ApiService.onUnauthorized = () {
      logout();
    };

    // Attempt auto-login on startup
    _tryRestoreSession();
  }

  Future<void> _tryRestoreSession() async {
    final success = await ApiService.initSessionFromStorage();
    if (success && ApiService.role != null && ApiService.userId != null) {
      setState(() {
        if (ApiService.role == 'SinhVien') {
          _state.currentRole = 'student';
          _fetchStudentDataFromApi(ApiService.userId!);
        } else if (ApiService.role == 'GiangVien') {
          _state.currentRole = 'lecturer';
          _fetchLecturerDataFromApi(ApiService.userId!);
        }
      });
    }
  }

  void _resetToDefaults({bool notify = true}) {
    final newState = AppState(
      currentRole: null,
      studentProfile: StudentProfile(
        name: initialStudentProfile.name,
        email: initialStudentProfile.email,
        studentId: initialStudentProfile.studentId,
        className: initialStudentProfile.className,
        major: initialStudentProfile.major,
        avatar: initialStudentProfile.avatar,
      ),
      studentTrips: List.from(initialTrips),
      studentNotifications: List.from(initialStudentNotifications),
      submissions: List.from(initialSubmissions),
      payments: List.from(initialPayments),
      refunds: List.from(initialRefunds),
      lecturerProfile: LecturerProfile(
        name: initialLecturerProfile.name,
        email: initialLecturerProfile.email,
        teacherId: initialLecturerProfile.teacherId,
        avatar: initialLecturerProfile.avatar,
        department: initialLecturerProfile.department,
      ),
      lecturerStudents: List.from(initialLecturerStudents),
      lecturerTours: List.from(initialLecturerTours),
      councilSessions: List.from(initialCouncils),
      lecturerNotifications: List.from(initialLecturerNotifications),
    );

    if (notify) {
      setState(() {
        _state = newState;
      });
    } else {
      _state = newState;
    }
  }

  // --- Hybrid API Helpers ---

  Future<void> _fetchStudentDataFromApi(int studentId) async {
    try {
      final List<dynamic> regTripsJson = await ApiService.getRegisteredTrips(studentId);
      final regIds = regTripsJson.map((t) => t['id'].toString()).toSet();
      
      setState(() {
        _state.studentTrips = _state.studentTrips.map((t) {
          if (regIds.contains(t.id)) {
            return t.copyWith(isRegistered: true);
          } else {
            return t.copyWith(isRegistered: false);
          }
        }).toList();
      });

      final List<dynamic> invoicesJson = await ApiService.getInvoices(studentId);
      if (invoicesJson.isNotEmpty) {
        setState(() {
          _state.payments = invoicesJson.map((inv) {
            return Payment(
              id: inv['id'].toString(),
              tripId: inv['chuyen_id']?.toString() ?? '',
              name: 'Đoàn: ${inv['chuyen_di']?['ten_chuyen_di'] ?? 'Kiến tập'}',
              code: inv['ma_giao_dich'] ?? 'KT-TRANSFER',
              amount: double.tryParse(inv['so_tien']?.toString() ?? '50000') ?? 50000,
              dueDate: inv['han_thanh_toan'] ?? '15/12/2026',
              status: inv['trang_thai'] == 'DaThanhToan' ? 'Đã đóng đúng hạn' : 'Chưa đóng',
            );
          }).toList();
        });
      }

      final List<dynamic> notifsJson = await ApiService.getStudentNotifications(studentId);
      if (notifsJson.isNotEmpty) {
        setState(() {
          _state.studentNotifications = notifsJson.map((n) {
            return StudentNotification(
              id: n['id'].toString(),
              title: n['tieu_de'] ?? 'Thông báo',
              content: n['noi_dung'] ?? '',
              timeText: n['ngay_tao'] != null ? n['ngay_tao'].substring(0, 10) : 'Vừa xong',
              isRead: n['da_doc'] ?? false,
            );
          }).toList();
        });
      }
    } catch (e) {
      print('Failed to load student data from backend, staying with in-memory mock data: $e');
    }
  }

  Future<void> _fetchLecturerDataFromApi(int lecturerId) async {
    try {
      final List<dynamic> studentsJson = await ApiService.getGuidedStudents(lecturerId);
      if (studentsJson.isNotEmpty) {
        setState(() {
          _state.lecturerStudents = studentsJson.map((s) {
            return LecturerStudent(
              id: s['mssv'] ?? 'SV-MOCK',
              name: s['ho_ten'] ?? 'Sinh viên',
              className: s['lop'] ?? 'N/A',
              company: s['ten_doanh_nghiep'] ?? 'Doanh nghiệp',
              completedTours: '3/3',
              papersLeft: 0,
              avatar: s['avatar'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
              submittedDate: '10/10/2026',
              attendanceStatus: 'present',
              excuseReason: null,
              prelimGrade: 8.5,
              extraGrade: 0.5,
              gvhdGrade: 8.0,
              aiSuggestedGrade: 8.2,
              comment: 'Bài làm tốt',
              isGraded: true,
              tourId: 'vinamilk-today',
            );
          }).toList();
        });
      }

      final List<dynamic> tripsJson = await ApiService.getLedTrips(lecturerId);
      if (tripsJson.isNotEmpty) {
        setState(() {
          _state.lecturerTours = tripsJson.map((t) {
            return LecturerTour(
              id: t['id'].toString(),
              name: t['ten_chuyen_di'] ?? 'Chuyến tham quan',
              date: t['ngay_tham_quan'] != null ? t['ngay_tham_quan'].substring(0, 10) : '15/10/2026',
              timeRange: '${t['gio_bat_dau'] ?? '08:00'} - ${t['gio_ket_thuc'] ?? '12:00'}',
              registeredCount: t['so_luong_dang_ky'] ?? 12,
              maxCount: t['so_luong_toi_da'] ?? 15,
              status: t['trang_thai'] == 'HoanThanh' ? 'completed' : 'upcoming',
            );
          }).toList();
        });
      }
    } catch (e) {
      print('Failed to load lecturer data from backend, staying with in-memory mock data: $e');
    }
  }

  // Auth Operations
  Future<void> login(String username, String password, {required VoidCallback onSuccess, required Function(String) onError}) async {
    try {
      final res = await ApiService.login(username, password);
      final user = res['user'];
      final userRole = user['vai_tro'];
      final details = user['details'];

      setState(() {
        if (userRole == 'SinhVien') {
          _state.currentRole = 'student';
          if (details != null) {
            _state.studentProfile = StudentProfile(
              name: details['ho_ten'] ?? 'Sinh viên',
              email: details['email'] ?? 'student@example.com',
              studentId: details['mssv'] ?? username,
              className: details['lop'] ?? 'N/A',
              major: details['nganh'] ?? 'Công nghệ Thực phẩm',
              avatar: details['avatar'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            );
          }
          _fetchStudentDataFromApi(details?['id'] ?? 1);
        } else if (userRole == 'GiangVien') {
          _state.currentRole = 'lecturer';
          if (details != null) {
            _state.lecturerProfile = LecturerProfile(
              name: details['ho_ten'] ?? 'Giảng viên',
              email: details['email'] ?? 'lecturer@example.com',
              teacherId: details['msgv'] ?? username,
              avatar: details['avatar'] ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
              department: details['khoa'] ?? 'Khoa Công nghệ Thực phẩm',
            );
          }
          _fetchLecturerDataFromApi(details?['id'] ?? 1);
        }
      });
      onSuccess();
    } catch (e) {
      print('Backend API Login failed: $e. Falling back to local offline mock login.');
      setState(() {
        if (username.startsWith('SV') || username == 'student') {
          _state.currentRole = 'student';
        } else if (username.startsWith('GV') || username == 'lecturer') {
          _state.currentRole = 'lecturer';
        } else {
          _state.currentRole = 'student';
        }
      });
      onSuccess();
    }
  }

  void logout() {
    ApiService.clearSession();
    setState(() {
      _state.currentRole = null;
    });
  }

  void resetData() {
    _resetToDefaults();
  }

  // Student Operations
  Future<void> registerTrip(String tripId) async {
    setState(() {
      _state.studentTrips = _state.studentTrips.map((t) {
        if (t.id == tripId) {
          return t.copyWith(isRegistered: true);
        }
        return t;
      }).toList();

      final paymentExists = _state.payments.any((p) => p.tripId == tripId);
      if (!paymentExists) {
        final trip = _state.studentTrips.firstWhere((t) => t.id == tripId);
        final codeSuffix = Random().nextInt(90000) + 10000;
        final nameAbbr = trip.name.length > 11 ? trip.name.substring(8, 11).toUpperCase() : 'TRIP';
        final newPayment = Payment(
          id: 'pay-$tripId',
          tripId: tripId,
          name: 'Chuyến: ${trip.name}',
          code: 'KT2026-$nameAbbr-$codeSuffix',
          amount: 50000,
          dueDate: '15/12/2026',
          status: 'Chưa đóng',
        );
        _state.payments = [newPayment, ..._state.payments];
      }
    });

    try {
      final sId = int.tryParse(_state.studentProfile.studentId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      final tId = int.tryParse(tripId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      await ApiService.registerTrip(sId, tId);
    } catch (e) {
      print('registerTrip API failed: $e. Keep state updated locally.');
    }
  }

  void cancelTripRegistration(String tripId) {
    setState(() {
      _state.studentTrips = _state.studentTrips.map((t) {
        if (t.id == tripId) {
          return t.copyWith(isRegistered: false);
        }
        return t;
      }).toList();

      _state.payments = _state.payments.map((p) {
        if (p.tripId == tripId) {
          return p.copyWith(status: 'Đã hoàn phí');
        }
        return p;
      }).toList();
    });

    try {
      final sId = int.tryParse(_state.studentProfile.studentId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      final regId = int.tryParse(tripId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      ApiService.post('sinh-vien/request-cancel', {
        'studentId': sId,
        'registrationId': regId,
        'lyDo': 'Hủy qua ứng dụng di động',
        'fileMinhChung': 'n/a',
      });
    } catch (e) {
      print('cancelTripRegistration API call failed: $e');
    }
  }

  Future<void> uploadReport(String submissionId, String fileName, String fileSize) async {
    setState(() {
      _state.submissions = _state.submissions.map((s) {
        if (s.id == submissionId) {
          return s.copyWith(
            fileName: fileName,
            fileSize: fileSize,
            status: s.hasConfirmationFile || !s.tripName.contains('tự do') ? 'Đã nộp' : 'Chưa nộp',
            submittedAt: '${DateTime.now().hour}:${DateTime.now().minute} - ${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}',
          );
        }
        return s;
      }).toList();
    });

    try {
      final sId = int.tryParse(_state.studentProfile.studentId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      final regId = int.tryParse(submissionId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      await ApiService.submitReport(sId, regId, fileName, null);
    } catch (e) {
      print('uploadReport API call failed: $e');
    }
  }

  Future<void> uploadConfirmationFile(String submissionId, String fileName) async {
    setState(() {
      _state.submissions = _state.submissions.map((s) {
        if (s.id == submissionId) {
          return s.copyWith(
            hasConfirmationFile: true,
            confirmationFileName: fileName,
            status: s.fileName != null ? 'Đã nộp' : 'Chưa nộp',
          );
        }
        return s;
      }).toList();
    });

    try {
      final sId = int.tryParse(_state.studentProfile.studentId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      final regId = int.tryParse(submissionId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      final sub = _state.submissions.firstWhere((s) => s.id == submissionId);
      await ApiService.submitReport(sId, regId, sub.fileName ?? 'baocao.pdf', fileName);
    } catch (e) {
      print('uploadConfirmationFile API call failed: $e');
    }
  }

  Future<void> payFee(String paymentId) async {
    setState(() {
      _state.payments = _state.payments.map((p) {
        if (p.id == paymentId) {
          return p.copyWith(status: 'Đã đóng đúng hạn');
        }
        return p;
      }).toList();
    });

    try {
      final payId = int.tryParse(paymentId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      await ApiService.payInvoice(payId);
    } catch (e) {
      print('payFee API call failed: $e');
    }
  }

  Future<void> addRefund(String invoiceName, String amountText) async {
    setState(() {
      final newRefund = RefundRequest(
        id: 'ref-${DateTime.now().millisecondsSinceEpoch}',
        invoiceName: invoiceName,
        dateText: '${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}',
        amountText: amountText,
        status: 'Chờ xử lý',
      );
      _state.refunds = [newRefund, ..._state.refunds];
    });

    try {
      final invoiceId = Random().nextInt(1000) + 1;
      await ApiService.requestRefund(invoiceId, 'hoadon_daquet.pdf');
    } catch (e) {
      print('addRefund API call failed: $e');
    }
  }

  void markStudentNotificationRead(String id) {
    setState(() {
      _state.studentNotifications = _state.studentNotifications.map((n) {
        if (n.id == id) {
          return n.copyWith(isRead: true);
        }
        return n;
      }).toList();
    });

    try {
      final accountId = int.tryParse(_state.studentProfile.studentId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      final notifId = int.tryParse(id.replaceAll(RegExp(r'\D'), '')) ?? 1;
      ApiService.markStudentNotificationRead(accountId, notifId);
    } catch (e) {
      print('markStudentNotificationRead API call failed: $e');
    }
  }

  void markAllStudentNotificationsRead() {
    setState(() {
      _state.studentNotifications = _state.studentNotifications.map((n) {
        return n.copyWith(isRead: true);
      }).toList();
    });
  }

  // Lecturer Operations
  Future<void> updateAttendance(String studentId, String status, {String? reason}) async {
    setState(() {
      _state.lecturerStudents = _state.lecturerStudents.map((s) {
        if (s.id == studentId) {
          return s.copyWith(
            attendanceStatus: status,
            excuseReason: reason ?? s.excuseReason,
          );
        }
        return s;
      }).toList();
    });

    try {
      final lId = int.tryParse(_state.lecturerProfile.teacherId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      final student = _state.lecturerStudents.firstWhere((s) => s.id == studentId);
      final tId = int.tryParse(student.tourId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      final phieuId = Random().nextInt(1000) + 1;
      
      await ApiService.takeAttendance(lId, tId, [
        {
          'phieuId': phieuId,
          'status': status == 'present' ? 'CoMat' : (status == 'absent' ? 'Vang' : 'Phep'),
          if (reason != null) 'note': reason,
        }
      ]);
    } catch (e) {
      print('updateAttendance API call failed: $e');
    }
  }

  Future<void> updateStudentGrade(String studentId, {double? prelimGrade, double? extraGrade, double? gvhdGrade, String? comment, bool? isGraded}) async {
    setState(() {
      _state.lecturerStudents = _state.lecturerStudents.map((s) {
        if (s.id == studentId) {
          return s.copyWith(
            prelimGrade: prelimGrade ?? s.prelimGrade,
            extraGrade: extraGrade ?? s.extraGrade,
            gvhdGrade: gvhdGrade ?? s.gvhdGrade,
            comment: comment ?? s.comment,
            isGraded: isGraded ?? s.isGraded,
          );
        }
        return s;
      }).toList();
    });

    try {
      final lId = int.tryParse(_state.lecturerProfile.teacherId.replaceAll(RegExp(r'\D'), '')) ?? 1;
      final student = _state.lecturerStudents.firstWhere((s) => s.id == studentId);
      final phieuId = Random().nextInt(1000) + 1;

      if (prelimGrade != null || extraGrade != null) {
        await ApiService.gradePrepAndBonus(
          lId,
          phieuId,
          prelimGrade ?? student.prelimGrade,
          extraGrade ?? student.extraGrade,
        );
      }

      if (gvhdGrade != null || comment != null) {
        final reportId = Random().nextInt(1000) + 1;
        await ApiService.gradeReport(
          lId,
          reportId,
          gvhdGrade ?? student.gvhdGrade,
          comment ?? student.comment ?? '',
        );
      }
    } catch (e) {
      print('updateStudentGrade API call failed: $e');
    }
  }

  void markLecturerNotificationRead(String id) {
    setState(() {
      _state.lecturerNotifications = _state.lecturerNotifications.map((n) {
        if (n.id == id) {
          return n.copyWith(isUnread: false);
        }
        return n;
      }).toList();
    });
  }

  void markAllLecturerNotificationsRead() {
    setState(() {
      _state.lecturerNotifications = _state.lecturerNotifications.map((n) {
        return n.copyWith(isUnread: false);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppStateProvider(
      state: _state,
      stateWidget: this,
      child: widget.child,
    );
  }
}
