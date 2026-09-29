import 'dart:math';
import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../../core/network/api_service.dart';

class AppState {
  String? currentRole; // 'student', 'lecturer', or null
  bool? phaiDoiMatKhau;
  
  // Student state
  StudentProfile studentProfile;
  StudentDashboardStats? studentDashboardStats;
  List<Trip> studentTrips;
  List<StudentNotification> studentNotifications;
  List<Submission> submissions;
  List<Payment> payments;
  List<RefundRequest> refunds;
  
  // Lecturer state
  LecturerProfile lecturerProfile;
  LecturerDashboardStats? lecturerDashboardStats;
  List<LecturerStudent> lecturerStudents;
  List<LecturerTour> lecturerTours;
  List<CouncilSession> councilSessions;
  List<LecturerNotification> lecturerNotifications;

  AppState({
    this.currentRole,
    this.phaiDoiMatKhau,
    required this.studentProfile,
    this.studentDashboardStats,
    required this.studentTrips,
    required this.studentNotifications,
    required this.submissions,
    required this.payments,
    required this.refunds,
    required this.lecturerProfile,
    this.lecturerDashboardStats,
    required this.lecturerStudents,
    required this.lecturerTours,
    required this.councilSessions,
    required this.lecturerNotifications,
  });

  AppState copyWith({
    String? currentRole,
    bool? phaiDoiMatKhau,
    StudentProfile? studentProfile,
    StudentDashboardStats? studentDashboardStats,
    List<Trip>? studentTrips,
    List<StudentNotification>? studentNotifications,
    List<Submission>? submissions,
    List<Payment>? payments,
    List<RefundRequest>? refunds,
    LecturerProfile? lecturerProfile,
    LecturerDashboardStats? lecturerDashboardStats,
    List<LecturerStudent>? lecturerStudents,
    List<LecturerTour>? lecturerTours,
    List<CouncilSession>? councilSessions,
    List<LecturerNotification>? lecturerNotifications,
  }) {
    return AppState(
      currentRole: currentRole ?? this.currentRole,
      phaiDoiMatKhau: phaiDoiMatKhau ?? this.phaiDoiMatKhau,
      studentProfile: studentProfile ?? this.studentProfile,
      studentDashboardStats: studentDashboardStats ?? this.studentDashboardStats,
      studentTrips: studentTrips ?? this.studentTrips,
      studentNotifications: studentNotifications ?? this.studentNotifications,
      submissions: submissions ?? this.submissions,
      payments: payments ?? this.payments,
      refunds: refunds ?? this.refunds,
      lecturerProfile: lecturerProfile ?? this.lecturerProfile,
      lecturerDashboardStats: lecturerDashboardStats ?? this.lecturerDashboardStats,
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
    return true;
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
          fetchStudentDataFromApi(ApiService.userId!);
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
      phaiDoiMatKhau: null,
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

  Future<void> fetchStudentDataFromApi(int studentId) async {
    try {
      // 1. Fetch all available trips and registered trips
      final List<dynamic> availableTripsJson = await ApiService.getAvailableTrips(studentId);
      final List<dynamic> regTripsJson = await ApiService.getRegisteredTrips(studentId);
      
      final Map<int, dynamic> regTripsMap = {
        for (var t in regTripsJson)
          if (t['chuyenThamQuan'] != null) t['chuyenThamQuan']['id']: t
      };

      // Combine available and registered to form the studentTrips list
      List<Trip> realTrips = [];
      
      // Process available trips (not registered yet)
      for (var t in availableTripsJson) {
        if (!regTripsMap.containsKey(t['id'])) {
          realTrips.add(_mapJsonToTrip(t, isRegistered: false));
        }
      }
      
      // Process registered trips
      for (var reg in regTripsJson) {
        if (reg['chuyenThamQuan'] != null) {
          final trip = _mapJsonToTrip(reg['chuyenThamQuan'], isRegistered: true);
          final status = reg['trang_thai'];
          final isCompleted = status == 'HoanThanh' || status == 'DaChamDiem' || trip.isCompleted;
          realTrips.add(trip.copyWith(isRegistered: true, isCompleted: isCompleted, registrationId: reg['id'].toString()));
        }
      }

      setState(() {
        _state.studentTrips = realTrips;
      });

      // 2. Fetch Invoices
      final List<dynamic> invoicesJson = await ApiService.getInvoices(studentId);
      if (invoicesJson.isNotEmpty) {
        setState(() {
          _state.payments = invoicesJson.map((inv) {
            final chuyen = inv['chuyen_di'] ?? inv['phieuDangKy']?['chuyenThamQuan'] ?? {};
            return Payment(
              id: inv['id'].toString(),
              tripId: chuyen['id']?.toString() ?? '',
              name: 'Đoàn: ${chuyen['ten_chuyen_di'] ?? 'Kiến tập'}',
              code: inv['ma_hoa_don'] ?? inv['ma_giao_dich'] ?? 'KT-TRANSFER',
              amount: double.tryParse(inv['so_tien']?.toString() ?? '50000') ?? 50000,
              dueDate: inv['han_thanh_toan'] != null ? DateTime.tryParse(inv['han_thanh_toan'])?.toLocal().toString().substring(0, 10) ?? '15/12/2026' : '15/12/2026',
              status: inv['trang_thai'] == 'DaThanhToan' ? 'Đã đóng đúng hạn' : 'Chưa đóng',
            );
          }).toList();
        });
      }

      // 3. Fetch Refund Requests
      try {
        final List<dynamic> refundsJson = await ApiService.getRefundRequests(studentId);
        setState(() {
          _state.refunds = refundsJson.map((ref) {
            final invoice = ref['hoaDon'] ?? {};
            String mappedStatus = 'Chờ xử lý';
            if (ref['trang_thai'] == 'Approved') mappedStatus = 'Đã hoàn tiền';
            if (ref['trang_thai'] == 'Rejected') mappedStatus = 'Từ chối';
            
            return RefundRequest(
              id: ref['id'].toString(),
              invoiceName: invoice['ma_hoa_don'] ?? 'Hóa đơn #${invoice['id']}',
              dateText: ref['ngay_yeu_cau'] != null ? DateTime.tryParse(ref['ngay_yeu_cau'])?.toLocal().toString().substring(0, 10) ?? 'N/A' : 'N/A',
              amountText: invoice['so_tien']?.toString() ?? '50000',
              status: mappedStatus,
            );
          }).toList();
        });
      } catch (e) {
        print('Error fetching refund requests: $e');
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

      final Map<String, dynamic> statsJson = await ApiService.getStudentDashboardStats(studentId);
      setState(() {
        _state.studentDashboardStats = StudentDashboardStats(
          registered: statsJson['registered'] ?? 0,
          completed: statsJson['completed'] ?? 0,
          pendingReports: statsJson['pendingReports'] ?? 0,
          avgScore: statsJson['avgScore']?.toString() ?? 'Chưa có',
        );
      });

    } catch (e) {
      print('Failed to load student data from backend, staying with in-memory mock data: $e');
    }
  }

  Trip _mapJsonToTrip(Map<String, dynamic> json, {required bool isRegistered}) {
    final nhaMay = json['nhaMay'] ?? {};
    
    return Trip(
      id: json['id'].toString(),
      name: nhaMay['ten_nha_may'] ?? json['ten_chuyen_di'] ?? 'Chuyến tham quan',
      date: json['ngay_tham_quan'] != null ? DateTime.tryParse(json['ngay_tham_quan'])?.toLocal().toString().substring(0, 10) ?? 'N/A' : 'N/A',
      time: '${json['gio_bat_dau']?.toString().substring(0, 5) ?? '08:00'} - ${json['gio_ket_thuc']?.toString().substring(0, 5) ?? '12:00'}',
      type: json['hinh_thuc'] ?? 'Trực tiếp',
      location: nhaMay['dia_chi'] ?? 'Địa chỉ chưa cập nhật',
      industry: 'Công nghệ thực phẩm',
      description: nhaMay['mo_ta'] ?? 'Chuyến tham quan thực tế doanh nghiệp',
      heroImage: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=500', // Default image
      isRegistered: isRegistered,
      isCompleted: json['trang_thai'] == 'DaDienRa' || json['trang_thai'] == 'HoanThanh',
    );
  }

  Future<void> _fetchLecturerDataFromApi(int lecturerId) async {
    try {
      final List<dynamic> studentsJson = await ApiService.getGuidedStudents(lecturerId);
      if (studentsJson.isNotEmpty) {
        setState(() {
          _state.lecturerStudents = studentsJson.map((s) {
            return LecturerStudent(
              id: s['mssv'] ?? 'SV-MOCK',
              phieuId: s['phieu_id'] ?? s['phieu_dang_ky_id'] ?? s['id'],
              reportId: s['report_id'] ?? s['bai_thu_hoach_id'],
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

      final Map<String, dynamic> statsJson = await ApiService.getLecturerDashboardStats(lecturerId);
      setState(() {
        _state.lecturerDashboardStats = LecturerDashboardStats(
          doanDangDan: statsJson['doanDangDan'] ?? 0,
          baiCanCham: statsJson['baiCanCham'] ?? 0,
          buoiBaoCao: statsJson['buoiBaoCao'] ?? 0,
          tongSvHuongDan: statsJson['tongSvHuongDan'] ?? 0,
        );
      });

    } catch (e) {
      print('Failed to load lecturer data from backend, staying with in-memory mock data: $e');
    }
  }

  // Auth Operations
  Future<void> login(String username, String password, {required VoidCallback onSuccess, required Function(String) onError}) async {
    try {
      final res = await ApiService.login(username, password);
      final user = res['user'];
      final userRole = user?['vai_tro'];
      final details = user?['details'];
      
      final bool requiresPasswordChange = user?['phai_doi_mat_khau'] == 1 || user?['phai_doi_mat_khau'] == true;

      if (userRole == 'SinhVien') {
        setState(() {
          _state.currentRole = 'student';
          _state.phaiDoiMatKhau = requiresPasswordChange;
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
        });
        
        if (!requiresPasswordChange) {
          final studentId = (details != null && details['id'] is int) ? details['id'] as int : ApiService.userId;
          if (studentId != null) {
            fetchStudentDataFromApi(studentId);
          }
        }
        onSuccess();
      } else if (userRole == 'GiangVien') {
        setState(() {
          _state.currentRole = 'lecturer';
          _state.phaiDoiMatKhau = requiresPasswordChange;
          if (details != null) {
            _state.lecturerProfile = LecturerProfile(
              name: details['ho_ten'] ?? 'Giảng viên',
              email: details['email'] ?? 'lecturer@example.com',
              teacherId: details['msgv'] ?? username,
              avatar: details['avatar'] ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
              department: details['khoa'] ?? 'Khoa Công nghệ Thực phẩm',
            );
          }
        });
        
        if (!requiresPasswordChange) {
          final lecturerId = (details != null && details['id'] is int) ? details['id'] as int : ApiService.userId;
          if (lecturerId != null) {
            _fetchLecturerDataFromApi(lecturerId);
          }
        }
        onSuccess();
      } else {
        onError('Tài khoản không có quyền truy cập ứng dụng di động.');
      }
    } catch (e) {
      final msg = e.toString().replaceAll('Exception: ', '');
      onError(msg.isNotEmpty
          ? msg
          : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin tài khoản hoặc kết nối mạng.');
    }
  }

  void completePasswordChange() {
    setState(() {
      _state.phaiDoiMatKhau = false;
    });
    if (_state.currentRole == 'student' && ApiService.userId != null) {
      fetchStudentDataFromApi(ApiService.userId!);
    } else if (_state.currentRole == 'lecturer' && ApiService.userId != null) {
      _fetchLecturerDataFromApi(ApiService.userId!);
    }
  }

  void logout() {
    ApiService.clearSession();
    setState(() {
      _resetToDefaults(notify: true);
      _state.currentRole = null;
      _state.phaiDoiMatKhau = null;
    });
  }

  void resetData() {
    _resetToDefaults();
  }

  // Student Operations
  Future<void> registerTrip(String tripId) async {
    final tId = int.tryParse(tripId);
    if (tId == null) {
      throw Exception('Mã chuyến đi không hợp lệ ($tripId).');
    }

    await ApiService.registerTrip(tId);

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
  }

  Future<void> proposeTrip(String companyName, String address, String description) async {
    if (ApiService.userId == null) {
      throw Exception('Chưa đăng nhập');
    }
    await ApiService.proposeTrip(ApiService.userId!, companyName, address, description);
    // You could optionally fetch proposals or add it to local state, 
    // but typically a success message is enough for proposals.
  }

  Future<void> cancelTripRegistration(String tripId, String? registrationId, {required String lyDo, String? fileMinhChung}) async {
    final regId = int.tryParse(registrationId ?? '');
    if (regId == null) {
      throw Exception('Không tìm thấy mã phiếu đăng ký hợp lệ cho chuyến này.');
    }

    String? fileReference;
    if (fileMinhChung != null) {
      try {
        final uploadRes = await ApiService.uploadFile('upload/attachment', fileMinhChung, 'file');
        fileReference = uploadRes['key'] ?? uploadRes['url'] ?? fileMinhChung;
      } catch (e) {
        print('uploadConfirmationFile file upload failed: $e');
        fileReference = fileMinhChung;
      }
    }

    await ApiService.post('sinh-vien/request-cancel', {
      'registrationId': regId,
      'lyDo': lyDo,
      if (fileReference != null) 'fileMinhChung': fileReference,
    });

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
  }

  Future<bool> uploadReport(String submissionId, String localPath, String fileName, String fileSize) async {
    final regId = int.tryParse(submissionId);
    if (regId == null) {
      throw Exception('Mã bài nộp không hợp lệ ($submissionId).');
    }

    String fileReference = fileName;
    try {
      final uploadRes = await ApiService.uploadFile('upload/report', localPath, 'file');
      fileReference = uploadRes['key'] ?? uploadRes['url'] ?? fileName;
    } catch (e) {
      print('uploadReport file upload failed: $e');
      rethrow;
    }

    await ApiService.submitReport(regId, fileReference, null);

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

    return true;
  }

  Future<bool> uploadConfirmationFile(String submissionId, String localPath, String fileName) async {
    final regId = int.tryParse(submissionId);
    if (regId == null) {
      throw Exception('Mã bài nộp không hợp lệ ($submissionId).');
    }

    String fileReference = fileName;
    try {
      final uploadRes = await ApiService.uploadFile('upload/payment', localPath, 'file');
      fileReference = uploadRes['key'] ?? uploadRes['url'] ?? fileName;
    } catch (e) {
      print('uploadConfirmationFile file upload failed: $e');
      rethrow;
    }

    final sub = _state.submissions.firstWhere((s) => s.id == submissionId);
    await ApiService.submitReport(regId, sub.fileName ?? 'baocao.pdf', fileReference);

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

    return true;
  }

  Future<void> payFee(String paymentId) async {
    final payId = int.tryParse(paymentId);
    if (payId == null) {
      throw Exception('Mã hóa đơn thanh toán không hợp lệ ($paymentId).');
    }

    await ApiService.payInvoice(payId);

    setState(() {
      _state.payments = _state.payments.map((p) {
        if (p.id == paymentId) {
          return p.copyWith(status: 'Đã đóng đúng hạn');
        }
        return p;
      }).toList();
    });
  }

  Future<bool> addRefund(String invoiceName, String amountText, {String? localPath, String? fileName}) async {
    final invoiceId = int.tryParse(invoiceName.replaceAll(RegExp(r'\D'), ''));
    if (invoiceId == null) {
      throw Exception('Không tìm thấy mã hóa đơn cần hoàn phí.');
    }

    String fileReference = fileName ?? 'hoadon_daquet.pdf';
    if (localPath != null) {
      final uploadRes = await ApiService.uploadFile('upload/attachment', localPath, 'file');
      fileReference = uploadRes['key'] ?? uploadRes['url'] ?? fileReference;
    }

    await ApiService.requestRefund(invoiceId, fileReference);

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

    if (ApiService.userId != null) {
      fetchStudentDataFromApi(ApiService.userId!);
    }

    return true;
  }

  void markStudentNotificationRead(String id) {
    final notifId = int.tryParse(id);
    if (notifId != null) {
      ApiService.markStudentNotificationRead(notifId).catchError((e) {
        print('markStudentNotificationRead API call failed: $e');
      });
    }

    setState(() {
      _state.studentNotifications = _state.studentNotifications.map((n) {
        if (n.id == id) {
          return n.copyWith(isRead: true);
        }
        return n;
      }).toList();
    });
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
    final student = _state.lecturerStudents.firstWhere(
      (s) => s.id == studentId,
      orElse: () => throw Exception('Không tìm thấy sinh viên $studentId trong danh sách.'),
    );

    final tId = int.tryParse(student.tourId);
    if (tId == null) {
      throw Exception('Mã chuyến tham quan không hợp lệ (${student.tourId}).');
    }

    final phieuId = student.phieuId ?? int.tryParse(studentId);
    if (phieuId == null) {
      throw Exception('Không xác định được mã phiếu đăng ký của sinh viên $studentId.');
    }

    // Ánh xạ trạng thái điểm danh khớp đúng với DTO backend (CoMat, Vang, TuChoiThamGia)
    final String backendStatus = status == 'present'
        ? 'CoMat'
        : (status == 'absent' ? 'Vang' : 'TuChoiThamGia');

    await ApiService.takeAttendance(tId, [
      {
        'phieuId': phieuId,
        'status': backendStatus,
        if (reason != null && reason.isNotEmpty) 'note': reason,
      }
    ]);

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
  }

  Future<void> updateStudentGrade(String studentId, {double? prelimGrade, double? extraGrade, double? gvhdGrade, String? comment, bool? isGraded}) async {
    final student = _state.lecturerStudents.firstWhere(
      (s) => s.id == studentId,
      orElse: () => throw Exception('Không tìm thấy sinh viên $studentId trong danh sách.'),
    );

    final phieuId = student.phieuId ?? int.tryParse(studentId);
    if ((prelimGrade != null || extraGrade != null) && phieuId == null) {
      throw Exception('Không xác định được mã phiếu đăng ký để nhập điểm quá trình.');
    }

    if (prelimGrade != null || extraGrade != null) {
      await ApiService.gradePrepAndBonus(
        phieuId!,
        prelimGrade ?? student.prelimGrade,
        extraGrade ?? student.extraGrade,
      );
    }

    if (gvhdGrade != null || comment != null) {
      final reportId = student.reportId ?? phieuId;
      if (reportId == null) {
        throw Exception('Không xác định được mã bài thu hoạch để chấm điểm.');
      }
      await ApiService.gradeReport(
        reportId,
        gvhdGrade ?? student.gvhdGrade,
        comment ?? student.comment ?? '',
      );
    }

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
