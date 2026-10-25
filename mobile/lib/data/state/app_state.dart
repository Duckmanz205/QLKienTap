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
  List<TripProposal> proposals;
  StudentTermGrade? termGrade;
  RepresentativeTripsStatus? repStatus;
  
  // Lecturer state
  LecturerProfile lecturerProfile;
  LecturerDashboardStats? lecturerDashboardStats;
  List<LecturerStudent> lecturerStudents;
  List<LecturerTour> lecturerTours;
  List<CouncilSession> councilSessions;
  List<LecturerNotification> lecturerNotifications;
  Map<int, List<TripRegistrationStudent>> tripStudentsCache;
  List<CouncilBoardItem> councilBoards;

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
    this.proposals = const [],
    this.termGrade,
    this.repStatus,
    required this.lecturerProfile,
    this.lecturerDashboardStats,
    required this.lecturerStudents,
    required this.lecturerTours,
    required this.councilSessions,
    required this.lecturerNotifications,
    this.tripStudentsCache = const {},
    this.councilBoards = const [],
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
    List<TripProposal>? proposals,
    StudentTermGrade? termGrade,
    RepresentativeTripsStatus? repStatus,
    LecturerProfile? lecturerProfile,
    LecturerDashboardStats? lecturerDashboardStats,
    List<LecturerStudent>? lecturerStudents,
    List<LecturerTour>? lecturerTours,
    List<CouncilSession>? councilSessions,
    List<LecturerNotification>? lecturerNotifications,
    Map<int, List<TripRegistrationStudent>>? tripStudentsCache,
    List<CouncilBoardItem>? councilBoards,
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
      proposals: proposals ?? this.proposals,
      termGrade: termGrade ?? this.termGrade,
      repStatus: repStatus ?? this.repStatus,
      lecturerProfile: lecturerProfile ?? this.lecturerProfile,
      lecturerDashboardStats: lecturerDashboardStats ?? this.lecturerDashboardStats,
      lecturerStudents: lecturerStudents ?? this.lecturerStudents,
      lecturerTours: lecturerTours ?? this.lecturerTours,
      councilSessions: councilSessions ?? this.councilSessions,
      lecturerNotifications: lecturerNotifications ?? this.lecturerNotifications,
      tripStudentsCache: tripStudentsCache ?? this.tripStudentsCache,
      councilBoards: councilBoards ?? this.councilBoards,
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
        name: '',
        email: '',
        studentId: '',
        className: '',
        major: '',
        avatar: '',
      ),
      studentTrips: [],
      studentNotifications: [],
      submissions: [],
      payments: [],
      refunds: [],
      proposals: [],
      termGrade: null,
      repStatus: null,
      lecturerProfile: LecturerProfile(
        name: '',
        email: '',
        teacherId: '',
        avatar: '',
        department: '',
      ),
      lecturerStudents: [],
      lecturerTours: [],
      councilSessions: [],
      lecturerNotifications: [],
      tripStudentsCache: {},
      councilBoards: [],
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
      List<Submission> realSubmissions = [];
      for (var reg in regTripsJson) {
        if (reg['chuyenThamQuan'] != null) {
          final trip = _mapJsonToTrip(reg['chuyenThamQuan'], isRegistered: true);
          final status = reg['trang_thai'];
          final isCompleted = status == 'HoanThanh' || status == 'DaChamDiem' || trip.isCompleted;
          realTrips.add(trip.copyWith(isRegistered: true, isCompleted: isCompleted, registrationId: reg['id'].toString()));
          
          if (isCompleted) {
             final bth = reg['baiThuHoach'];
             realSubmissions.add(Submission(
               id: reg['id'].toString(),
               registrationId: reg['id'],
               tripName: trip.name,
               typeText: (trip.type == 'TuDo' || trip.type == 'Tự do')
                   ? 'Kiến tập tự do'
                   : (trip.type == 'Trực tuyến' || trip.type == 'TrucTuyen')
                       ? 'Kiến tập trực tuyến'
                       : 'Kiến tập trực tiếp',
               dateText: trip.date,
               status: bth != null ? 'Đã nộp' : 'Chưa nộp',
               fileName: bth?['file_bao_cao']?.split('/').last ?? (bth != null ? 'baocao.pdf' : null),
               fileSize: bth != null ? 'N/A' : null,
               submittedAt: bth?['ngay_nop'] != null ? DateTime.tryParse(bth['ngay_nop'].toString())?.toLocal().toString().substring(0,16) : null,
               hasConfirmationFile: bth != null && bth['file_xac_nhan_tham_quan'] != null,
               confirmationFileName: bth?['file_xac_nhan_tham_quan']?.split('/').last,
               fileBaoCaoUrl: bth?['file_bao_cao'],
               fileXacNhanUrl: bth?['file_xac_nhan_tham_quan'],
             ));
          }
        }
      }

      setState(() {
        _state.studentTrips = realTrips;
        _state.submissions = realSubmissions;
      });

      // 2. Fetch Invoices
      final List<dynamic> invoicesJson = await ApiService.getInvoices(studentId);
      setState(() {
        if (invoicesJson.isNotEmpty) {
          _state.payments = invoicesJson.map((inv) {
            final chuyen = inv['chuyen_di'] ?? inv['phieuDangKy']?['chuyenThamQuan'] ?? {};
            return Payment(
              id: inv['id'].toString(),
              tripId: chuyen['id']?.toString() ?? '',
              name: 'Đoàn: ${chuyen['ten_chuyen_di'] ?? 'Kiến tập'}',
              code: inv['ma_hoa_don'] ?? inv['ma_giao_dich'] ?? 'KT-TRANSFER',
              amount: double.tryParse(inv['so_tien']?.toString() ?? '50000') ?? 50000,
              dueDate: inv['han_thanh_toan'] != null ? DateTime.tryParse(inv['han_thanh_toan'])?.toLocal().toString().substring(0, 10) ?? '15/12/2026' : '15/12/2026',
              status: inv['trang_thai'] == 'ViPham' ? 'Vi phạm'
                  : inv['trang_thai'] == 'DaHoanPhi' ? 'Đã hoàn phí'
                  : (inv['trang_thai'] == 'DaDongDungHan' || inv['trang_thai'] == 'DaDongTreHan') ? 'Đã đóng đúng hạn' 
                  : 'Chưa đóng',
            );
          }).toList();
        } else {
          _state.payments = [];
        }
      });

      // 3. Fetch Refund Requests
      try {
        final List<dynamic> refundsJson = await ApiService.getRefundRequests(studentId);
        setState(() {
          if (refundsJson.isNotEmpty) {
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
          } else {
            _state.refunds = [];
          }
        });
      } catch (e) {
        print('Error fetching refund requests: $e');
      }

      final List<dynamic> notifsJson = await ApiService.getStudentNotifications(studentId);
      setState(() {
        if (notifsJson.isNotEmpty) {
          _state.studentNotifications = notifsJson.map((n) {
            final rawDate = n['ngay_gui'] ?? n['created_at'];
            String formattedTime = 'Vừa xong';
            if (rawDate != null) {
              final dt = DateTime.tryParse(rawDate.toString())?.toLocal();
              if (dt != null) {
                formattedTime = '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
              }
            }

            return StudentNotification(
              id: n['id'].toString(),
              title: n['tieu_de'] ?? 'Thông báo',
              content: n['noi_dung'] ?? '',
              timeText: formattedTime,
              isRead: n['da_doc'] ?? false,
              attachment: n['file_dinh_kem'] ?? (n['files'] != null && (n['files'] as List).isNotEmpty ? n['files'][0]['ten_file'] : null),
              fileUrl: n['file_url'] ?? (n['files'] != null && (n['files'] as List).isNotEmpty ? n['files'][0]['duong_dan'] : null),
              type: n['loai_thong_bao'] ?? n['type'] ?? 'ThongBao',
            );
          }).toList();
        } else {
          _state.studentNotifications = [];
        }
      });

      final Map<String, dynamic> statsJson = await ApiService.getStudentDashboardStats(studentId);
      setState(() {
        _state.studentDashboardStats = StudentDashboardStats(
          registered: statsJson['registered'] ?? 0,
          completed: statsJson['completed'] ?? 0,
          pendingReports: statsJson['pendingReports'] ?? 0,
          avgScore: statsJson['avgScore']?.toString() ?? 'Chưa có',
        );
      });

      // Fetch Proposals, Grades & Representative Trips Status
      await fetchStudentProposals(studentId);
      await fetchStudentGrades(studentId);
      await fetchRepresentativeTripsStatus();

    } catch (e) {
      print('Failed to load student data from backend: $e');
    }
  }

  Trip _mapJsonToTrip(Map<String, dynamic> json, {required bool isRegistered}) {
    final nhaMay = json['nhaMay'] ?? {};
    
    return Trip(
      id: json['id'].toString(),
      name: nhaMay['ten_nha_may'] ?? json['ten_chuyen_di'] ?? 'Chuyến tham quan',
      date: json['ngay_tham_quan'] != null ? DateTime.tryParse(json['ngay_tham_quan'])?.toLocal().toString().substring(0, 10) ?? 'N/A' : 'N/A',
      time: '${json['gio_bat_dau']?.toString().substring(0, 5) ?? '08:00'} - ${json['gio_ket_thuc']?.toString().substring(0, 5) ?? '12:00'}',
      type: (json['hinh_thuc'] == 'TrucTuyen' || json['hinh_thuc'] == 'Trực tuyến')
          ? 'Trực tuyến'
          : (json['hinh_thuc'] == 'TuDo' || json['hinh_thuc'] == 'Tự do')
              ? 'Tự do'
              : 'Trực tiếp',
      location: nhaMay['dia_chi'] ?? 'Địa chỉ chưa cập nhật',
      industry: 'Công nghệ thực phẩm',
      description: nhaMay['mo_ta'] ?? 'Chuyến tham quan thực tế doanh nghiệp',
      heroImage: '',
      isRegistered: isRegistered,
      isCompleted: json['trang_thai'] == 'DaDienRa' || json['trang_thai'] == 'HoanThanh',
    );
  }

  Future<void> _fetchLecturerDataFromApi(int lecturerId) async {
    try {
      final reportsRes = await ApiService.getGuidedReports(lecturerId, limit: 100);
      final List<dynamic> reportsJson = reportsRes['data'] ?? [];
      
      setState(() {
        _state.lecturerStudents = reportsJson.map((r) {
          final phieuTQ = r['phieuThamQuan'] ?? {};
          final phieu = phieuTQ['phieuDangKy'] ?? {};
          final sv = phieu['sinhVien'] ?? {};
          final chuyen = phieu['chuyenThamQuan'] ?? {};
          final diem = phieuTQ['diemPhieuThamQuan'] ?? {};
          
          final mssv = sv['mssv'] ?? sv['id']?.toString() ?? 'SV';
          final uniqueId = r['id'] != null ? '${mssv}_${r['id']}' : mssv;
          
          return LecturerStudent(
            id: uniqueId,
            phieuId: phieu['id'],
            reportId: r['id'],
            name: sv['ho_ten'] ?? 'Sinh viên',
            className: sv['lop'] ?? 'N/A',
            company: chuyen['nhaMay']?['ten_nha_may'] ?? 'Doanh nghiệp',
            completedTours: '1/1',
            papersLeft: 0,
            avatar: sv['avatar'] ?? '',
            submittedDate: r['ngay_nop'] != null ? DateTime.tryParse(r['ngay_nop'].toString())?.toLocal().toString().substring(0, 10) ?? 'N/A' : 'N/A',
            attendanceStatus: phieuTQ['diemDanh']?['trang_thai'] == 'CoMat' ? 'present' : (phieuTQ['diemDanh']?['trang_thai'] == 'Vang' ? 'absent' : 'none'),
            excuseReason: phieuTQ['diemDanh']?['ly_do_vang'],
            prelimGrade: double.tryParse(diem['diem_chuan_bi']?.toString() ?? '0') ?? 0,
            extraGrade: double.tryParse(diem['diem_cong']?.toString() ?? '0') ?? 0,
            gvhdGrade: double.tryParse(r['diem_thu_hoach']?.toString() ?? '0') ?? 0,
            aiSuggestedGrade: diem['diem_ai_de_xuat'] != null ? double.tryParse(diem['diem_ai_de_xuat'].toString()) : null,
            comment: r['nhan_xet_cua_giang_vien'],
            isGraded: r['trang_thai'] == 'DaCham',
            tourId: chuyen['id']?.toString() ?? '',
            reportFileUrl: r['file_bao_cao'],
            confirmationFileUrl: r['file_xac_nhan_tham_quan'],
          );
        }).toList();
      });

      final List<dynamic> tripsJson = await ApiService.getLedTrips(lecturerId);
      setState(() {
        _state.lecturerTours = tripsJson.map((t) {
          return LecturerTour(
            id: t['id'].toString(),
            name: t['ten_chuyen_di'] ?? 'Chuyến tham quan',
            date: t['ngay_tham_quan'] != null ? t['ngay_tham_quan'].substring(0, 10) : 'N/A',
            timeRange: '${t['gio_bat_dau'] ?? '08:00'} - ${t['gio_ket_thuc'] ?? '12:00'}',
            registeredCount: t['so_luong_dang_ky'] ?? 0,
            maxCount: t['so_luong_toi_da'] ?? 0,
            status: t['trang_thai'] == 'HoanThanh' ? 'completed' : 'upcoming',
          );
        }).toList();
      });

      final Map<String, dynamic> statsJson = await ApiService.getLecturerDashboardStats(lecturerId);
      setState(() {
        _state.lecturerDashboardStats = LecturerDashboardStats(
          doanDangDan: statsJson['doanDangDan'] ?? 0,
          baiCanCham: statsJson['baiCanCham'] ?? 0,
          buoiBaoCao: statsJson['buoiBaoCao'] ?? 0,
          tongSvHuongDan: statsJson['tongSvHuongDan'] ?? 0,
        );
      });

      try {
        final notifsJson = await ApiService.getLecturerNotifications(lecturerId);
        if (notifsJson is List && notifsJson.isNotEmpty) {
          setState(() {
            _state.lecturerNotifications = notifsJson.map((n) {
              final rawDate = n['ngay_gui'] ?? n['created_at'];
              String formattedTime = 'Vừa xong';
              if (rawDate != null) {
                final dt = DateTime.tryParse(rawDate.toString())?.toLocal();
                if (dt != null) {
                  formattedTime = '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
                }
              }

              return LecturerNotification(
                id: n['id'].toString(),
                title: n['tieu_de'] ?? 'Thông báo',
                body: n['noi_dung'] ?? '',
                time: formattedTime,
                isUnread: !(n['da_doc'] == true),
                attachment: n['file_dinh_kem'] ?? (n['files'] != null && (n['files'] as List).isNotEmpty ? n['files'][0]['ten_file'] : null),
                fileUrl: n['file_url'] ?? (n['files'] != null && (n['files'] as List).isNotEmpty ? n['files'][0]['duong_dan'] : null),
                type: n['loai_thong_bao'] ?? n['type'] ?? 'ThongBao',
              );
            }).toList();
          });
        }
      } catch (e) {
        print('Error fetching notifications: $e');
      }

      try {
        await fetchBoardSessions(lecturerId);
      } catch (e) {
        print('Error fetching board sessions: $e');
      }

    } catch (e) {
      print('Failed to load lecturer data from backend: $e');
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
              avatar: details['avatar'] ?? '',
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
              avatar: details['avatar'] ?? '',
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
        final trip = _state.studentTrips.firstWhere(
          (t) => t.id == tripId,
          orElse: () => Trip(
            id: tripId,
            name: 'Chuyến tham quan',
            date: '',
            time: '',
            type: 'Trực tiếp',
            location: '',
            industry: '',
            description: '',
            heroImage: '',
            isRegistered: true,
            isCompleted: false,
          ),
        );
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

  Future<void> proposeTrip({
    int? factoryId,
    String? companyName,
    String? address,
    String? description,
    String? contactPerson,
    String? contactPhone,
    DateTime? visitDate,
    String? startTime,
    String? type,
  }) async {
    if (ApiService.userId == null) {
      throw Exception('Chưa đăng nhập');
    }
    final vDate = visitDate ?? DateTime.now().add(const Duration(days: 7));
    final sTime = startTime ?? '08:00';
    final tType = type ?? 'TrucTiep';

    await ApiService.proposeTrip(
      nhaMayId: factoryId,
      tenNhaMayDeXuat: companyName,
      diaChiDeXuat: address,
      nguoiLienHeDeXuat: contactPerson,
      sdtLienHeDeXuat: contactPhone,
      ngayThamQuan: vDate.toIso8601String().substring(0, 10),
      gioBatDau: sTime,
      hinhThuc: tType,
    );

    await fetchStudentProposals(ApiService.userId!);
  }

  Future<void> cancelStudentProposal(int proposalId) async {
    await ApiService.cancelProposal(proposalId);
    setState(() {
      _state.proposals = _state.proposals.where((p) => p.id != proposalId).toList();
    });
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
      if (fileReference != null && fileReference.isNotEmpty) 'fileMinhChung': fileReference,
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

  Future<bool> uploadReport(String submissionId, String localPath, String fileName, String fileSize, {String? extractedText}) async {
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

    final sub = _state.submissions.firstWhere(
      (s) => s.id == submissionId,
      orElse: () => Submission(
        id: submissionId,
        tripName: '',
        typeText: 'Trực tiếp',
        dateText: '',
        status: 'Chưa nộp',
        hasConfirmationFile: false,
      ),
    );
    await ApiService.submitReport(regId, fileReference, sub.fileXacNhanUrl, extractedText: extractedText);

    setState(() {
      _state.submissions = _state.submissions.map((s) {
        if (s.id == submissionId) {
          return s.copyWith(
            fileName: fileName,
            fileSize: fileSize,
            fileBaoCaoUrl: fileReference,
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

    final sub = _state.submissions.firstWhere(
      (s) => s.id == submissionId,
      orElse: () => Submission(
        id: submissionId,
        tripName: '',
        typeText: 'Trực tiếp',
        dateText: '',
        status: 'Chưa nộp',
        hasConfirmationFile: false,
      ),
    );
    await ApiService.submitReport(regId, sub.fileBaoCaoUrl ?? '', fileReference);

    setState(() {
      _state.submissions = _state.submissions.map((s) {
        if (s.id == submissionId) {
          return s.copyWith(
            hasConfirmationFile: true,
            confirmationFileName: fileName,
            fileXacNhanUrl: fileReference,
            status: s.fileBaoCaoUrl != null ? 'Đã nộp' : 'Chưa nộp',
          );
        }
        return s;
      }).toList();
    });

    return true;
  }

  Future<void> deleteReport(String submissionId) async {
    final regId = int.tryParse(submissionId);
    if (regId != null) {
      await ApiService.deleteReport(regId);
      if (ApiService.userId != null) {
        await fetchStudentDataFromApi(ApiService.userId!);
      }
    }
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

  Future<bool> addRefund(String paymentId, String invoiceName, String amountText, {String? localPath, String? fileName, String? bankName, String? accountNumber, String? accountName, String? reason}) async {
    final invoiceId = int.tryParse(paymentId);
    if (invoiceId == null) {
      throw Exception('Không tìm thấy mã hóa đơn cần hoàn phí.');
    }

    String fileReference = fileName ?? 'hoadon_daquet.pdf';
    if (localPath != null) {
      final uploadRes = await ApiService.uploadFile('upload/attachment', localPath, 'file');
      fileReference = uploadRes['key'] ?? uploadRes['url'] ?? fileReference;
    }

    await ApiService.requestRefund(invoiceId, fileReference, bankName: bankName, accountNumber: accountNumber, accountName: accountName, reason: reason);

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

  Future<void> fetchStudentProposals(int studentId) async {
    try {
      final res = await ApiService.getProposals();
      if (res is List) {
        setState(() {
          _state.proposals = res.map((p) {
            final nhaMay = p['nhaMay'] ?? {};
            return TripProposal(
              id: p['id'] ?? 0,
              tenDoanhNghiep: nhaMay['ten_nha_may'] ?? p['ten_nha_may_de_xuat'] ?? 'Doanh nghiệp đề xuất',
              diaChi: nhaMay['dia_chi'] ?? p['dia_chi_de_xuat'],
              ngayThamQuan: (p['ngay_tham_quan_de_xuat'] ?? p['ngay_tham_quan']) != null
                  ? DateTime.tryParse((p['ngay_tham_quan_de_xuat'] ?? p['ngay_tham_quan']).toString())?.toLocal().toString().substring(0, 10)
                  : null,
              gioBatDau: (p['gio_bat_dau_de_xuat'] ?? p['gio_bat_dau'])?.toString().substring(0, 5),
              hinhThuc: p['hinh_thuc'] == 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp',
              trangThai: p['trang_thai_duyet'] ?? p['trang_thai'] ?? 'ChoDuyet',
              lyDo: p['ly_do'],
              phanHoi: p['phan_hoi'],
            );
          }).toList();
        });
      }
    } catch (_) {
      // Giữ nguyên danh sách hiện tại
    }
  }

  Future<void> fetchStudentGrades(int studentId) async {
    try {
      final gradesRes = await ApiService.getStudentGrades(studentId);
      if (gradesRes is List && gradesRes.isNotEmpty) {
        final termData = gradesRes[0];
        final List<dynamic> rawTrips = termData['selectedTrips'] ?? [];
        
        final tripGrades = rawTrips.map((t) {
          return TripGradeItem(
            id: t['id'] ?? 0,
            tenNhaMay: t['ten_nha_may'] ?? 'Doanh nghiệp',
            hinhThuc: t['hinh_thuc'] == 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp',
            diemChuanBi: t['diem_chuan_bi'] != null ? double.tryParse(t['diem_chuan_bi'].toString()) : null,
            diemBaiThuHoach: t['diem_bai_thu_hoach'] != null ? double.tryParse(t['diem_bai_thu_hoach'].toString()) : null,
            diemBaoCaoTQNM: t['diem_bao_cao_tqnm'] != null ? double.tryParse(t['diem_bao_cao_tqnm'].toString()) : null,
            diemCong: t['diem_cong'] != null ? double.tryParse(t['diem_cong'].toString()) : null,
            diemTongChuyen: t['diem_tong_chuyen'] != null ? double.tryParse(t['diem_tong_chuyen'].toString()) : null,
            ketQua: t['ket_qua'],
            nhanXetGvhd: t['nhan_xet_gvhd'],
            nhanXetHoiDong: t['nhan_xet_hoi_dong'],
            daKhoaChuanBi: t['da_khoa_chuan_bi'] == true,
            daKhoaThuHoach: t['da_khoa_thu_hoach'] == true,
            daKhoaHoiDong: t['da_khoa_hoi_dong'] == true,
            daKhoa: t['da_khoa'] == true,
          );
        }).toList();

        final double? dtk = termData['diem_tong_ket'] != null ? double.tryParse(termData['diem_tong_ket'].toString()) : null;
        setState(() {
          _state.termGrade = StudentTermGrade(
            diemTongKet: dtk,
            trangThai: termData['trang_thai'] ?? termData['ket_qua'],
            isScoreLocked: dtk != null,
            tripGrades: tripGrades,
          );
        });
      }
    } catch (e) {
      // Fallback
    }
  }

  Future<void> fetchRepresentativeTripsStatus() async {
    try {
      final res = await ApiService.getRepresentativeTripsStatus();
      if (res != null) {
        final List<dynamic> regIds = res['selectedRegistrationIds'] ?? [];
        final council = res['hoiDong'] ?? res['council'];
        final List<dynamic> members = council?['thanhVien'] ?? [];
        
        setState(() {
          _state.repStatus = RepresentativeTripsStatus(
            selectedRegistrationIds: regIds.map((id) => int.tryParse(id.toString()) ?? 0).where((id) => id > 0).toList(),
            isLockedByKhoa: res['isLockedByKhoa'] == true,
            councilSessionName: council?['ten_hoi_dong'] ?? council?['ten_buoi'],
            councilRoom: council?['phong'],
            councilTime: council?['thoi_gian'],
            councilMembers: members.map((m) => m['ho_ten']?.toString() ?? '').where((m) => m.isNotEmpty).toList(),
          );
        });
      }
    } catch (e) {
      print('Failed to fetch representative trips status: $e');
    }
  }

  Future<void> selectRepresentativeTrips(List<int> registrationIds) async {
    await ApiService.selectRepresentativeTrips(registrationIds);
    await fetchRepresentativeTripsStatus();
  }

  Future<List<TripRegistrationStudent>> fetchTripRegistrations(int tripId) async {
    try {
      final res = await ApiService.getTripRegistrations(tripId);
      if (res is List) {
        final list = res.map((r) {
          final sv = r['sinhVien'] ?? {};
          final phieuTQ = r['phieuThamQuan'] ?? {};
          final diemDanh = phieuTQ['diemDanh'] ?? {};
          final diem = phieuTQ['diemPhieuThamQuan'] ?? {};
          final hoaDon = r['hoaDon'] ?? {};

          return TripRegistrationStudent(
            phieuId: r['id'] ?? 0,
            sinhVienId: sv['id'] ?? 0,
            mssv: sv['mssv'] ?? '',
            hoTen: sv['ho_ten'] ?? 'Sinh viên',
            className: sv['lop'] ?? 'N/A',
            soDienThoai: sv['so_dien_thoai'],
            email: sv['email'],
            avatar: sv['avatar'] ?? '',
            feeStatus: hoaDon['trang_thai'] ?? 'ChuaDong',
            attendanceStatus: diemDanh['trang_thai'] ?? 'ChuaDiemDanh',
            excuseReason: diemDanh['ly_do_vang'],
            prelimGrade: double.tryParse(diem['diem_chuan_bi']?.toString() ?? '0') ?? 0.0,
            extraGrade: double.tryParse(diem['diem_cong']?.toString() ?? '0') ?? 0.0,
            isLockedPrep: phieuTQ['is_locked_prep'] == true || phieuTQ['trang_thai_khoa_diem_chuan_bi'] == true,
          );
        }).toList();

        setState(() {
          final newCache = Map<int, List<TripRegistrationStudent>>.from(_state.tripStudentsCache);
          newCache[tripId] = list;
          _state.tripStudentsCache = newCache;
        });
        return list;
      }
    } catch (e) {
      print('Failed to fetch trip registrations: $e');
    }
    return _state.tripStudentsCache[tripId] ?? [];
  }

  Future<TripBusInfo?> fetchTripBusInfo(int tripId) async {
    try {
      final res = await ApiService.getTripInfo(tripId);
      if (res != null) {
        final chuyen = res['chuyenThamQuan'] ?? res;
        final List<dynamic> rawStudents = res['students'] ?? [];
        final List<dynamic> rawLecturers = res['lecturers'] ?? [];
        
        final students = rawStudents.map((s) => TripBusMember(
          id: s['id'] ?? 0,
          hoTen: s['ho_ten'] ?? s['name'] ?? '',
          mssv: s['mssv'] ?? '',
          isLeader: s['truong_nhom'] == true,
        )).toList();

        final leadGv = rawLecturers.isNotEmpty ? rawLecturers[0] : null;

        return TripBusInfo(
          tripId: tripId,
          tenChuyenDi: chuyen['ten_chuyen_di'] ?? 'Chuyến tham quan',
          gioBatDau: chuyen['gio_bat_dau']?.toString().substring(0, 5) ?? '08:00',
          gioKetThuc: chuyen['gio_ket_thuc']?.toString().substring(0, 5) ?? '12:00',
          hinhThuc: chuyen['hinh_thuc'] ?? 'TrucTiep',
          lecturerName: leadGv?['ho_ten'],
          lecturerPhone: leadGv?['so_dien_thoai'],
          students: students,
        );
      }
    } catch (e) {
      print('Failed to fetch trip bus info: $e');
    }
    return null;
  }

  Future<void> lockTripPrepGrades(int tripId) async {
    await ApiService.lockTripPrepGrades(tripId);
    await fetchTripRegistrations(tripId);
  }

  Future<void> saveTripPrepGradesBatch(int tripId, List<Map<String, dynamic>> records) async {
    await ApiService.gradePrepAndBonusBatch(tripId, records);
    await fetchTripRegistrations(tripId);
  }

  Future<Map<String, dynamic>> importPrepGradesExcel(int tripId, String filePath, {bool saveImmediately = false}) async {
    final res = await ApiService.importPrepGradesExcel(tripId, filePath, saveImmediately: saveImmediately);
    if (saveImmediately) {
      await fetchTripRegistrations(tripId);
    }
    return res;
  }

  Future<void> lockGuidedReportsGrades(int dotKienTapId) async {
    await ApiService.lockGuidedReportsGrades(dotKienTapId);
    if (ApiService.userId != null) {
      await _fetchLecturerDataFromApi(ApiService.userId!);
    }
  }

  Future<void> fetchBoardSessions(int lecturerId) async {
    try {
      final res = await ApiService.getBoardSessions(lecturerId);
      if (res is List) {
        final boards = res.map((b) {
          final session = b['session'] ?? {};
          final isBoardLocked = b['isBoardLocked'] == true || session['isBoardLocked'] == true;
          final List<dynamic> rawStudents = b['students'] ?? b['registrations'] ?? [];

          final students = rawStudents.map((st) {
            final List<dynamic> rawTrips = st['trips'] ?? [];
            final trips = rawTrips.map((t) => CouncilStudentTripItem(
              phieuId: t['phieuThamQuanId'] ?? t['id'] ?? 0,
              tenNhaMay: t['tenNhaMay'] ?? t['ten_nha_may'] ?? 'Doanh nghiệp',
              hinhThuc: t['hinh_thuc'] ?? 'TrucTiep',
              myScore: t['myScore'] != null ? double.tryParse(t['myScore'].toString()) : null,
              diemTong: t['diem_bao_cao_tqnm'] != null ? double.tryParse(t['diem_bao_cao_tqnm'].toString()) : null,
              isLocked: isBoardLocked || t['daKhoa'] == true || t['daKhoaHoiDong'] == true,
            )).toList();

            final isStudentLocked = isBoardLocked ||
                st['daKhoaHoiDong'] == true ||
                st['da_khoa_hoi_dong'] == true ||
                st['isGradeLocked'] == true;

            return CouncilStudentItem(
              studentId: st['id'] ?? 0,
              mssv: st['mssv'] ?? '',
              hoTen: st['ho_ten'] ?? st['name'] ?? 'Sinh viên',
              className: st['lop'] ?? 'N/A',
              topic: st['de_tai'] ?? st['topic'],
              trips: trips,
              isGradeLocked: isStudentLocked,
              councilNote: st['ghi_chu_hoi_dong'] ?? st['councilNote'] ?? st['ghiChu'],
              boChuyenId: st['boChuyenId'] ?? st['bo_chuyen_id'] ?? st['id'],
            );
          }).toList();

          return CouncilBoardItem(
            sessionId: session['id'] ?? 0,
            memberId: b['memberId'] ?? 0,
            sessionName: session['ten_buoi'] ?? session['ten_hoi_dong'] ?? 'Buổi chấm hội đồng',
            room: session['phong'] ?? 'Phòng bảo vệ',
            date: session['ngay_bao_cao'] != null ? session['ngay_bao_cao'].toString().substring(0, 10) : 'N/A',
            timeRange: '${session['gio_bat_dau']?.toString().substring(0, 5) ?? '08:00'} - ${session['gio_ket_thuc']?.toString().substring(0, 5) ?? '11:30'}',
            role: b['role'] ?? 'Ủy viên',
            status: session['trang_thai'] == 'HoanThanh' ? 'completed' : (session['trang_thai'] == 'DangDienRa' ? 'ongoing' : 'upcoming'),
            isBoardLocked: isBoardLocked,
            students: students,
          );
        }).toList();

        setState(() {
          _state.councilBoards = boards;
        });
      }
    } catch (_) {
      // Bỏ qua lỗi mạng khi load background
    }
  }

  Future<void> submitBoardScore(int memberId, int phieuId, double score) async {
    await ApiService.submitBoardScore(memberId, phieuId, score);
    if (ApiService.userId != null) {
      await fetchBoardSessions(ApiService.userId!);
    }
  }

  Future<void> submitBoardScoresBatch(int memberId, List<int> phieuIds, double score) async {
    await ApiService.submitBoardScoresBatch(memberId, phieuIds, score);
    if (ApiService.userId != null) {
      await fetchBoardSessions(ApiService.userId!);
    }
  }

  Future<void> lockCouncilGrade({required int boardId, int? boChuyenId}) async {
    await ApiService.lockCouncilGrade({
      'boardId': boardId,
      'boChuyenId': ?boChuyenId,
    });
    if (ApiService.userId != null) {
      await fetchBoardSessions(ApiService.userId!);
    }
  }

  Future<void> updateCouncilStudentNote({required int boardId, required int boChuyenId, required String ghiChu}) async {
    await ApiService.updateCouncilStudentNote({
      'boardId': boardId,
      'boChuyenId': boChuyenId,
      'ghiChu': ghiChu,
    });
    if (ApiService.userId != null) {
      await fetchBoardSessions(ApiService.userId!);
    }
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
