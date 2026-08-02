import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'secure_storage.dart';

class ApiService {
  static const String _envApiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: kDebugMode ? 'http://10.0.2.2:3001/api' : '',
  );

  static String? _cachedBaseUrl;

  static String get baseUrl {
    if (_cachedBaseUrl != null) {
      return _cachedBaseUrl!;
    }
    _cachedBaseUrl = _validateAndResolveApiUrl(_envApiBaseUrl);
    return _cachedBaseUrl!;
  }

  static String _validateAndResolveApiUrl(String rawUrl) {
    final trimmed = rawUrl.trim();
    if (trimmed.isEmpty) {
      throw StateError(
        'Lỗi cấu hình hệ thống: Chưa cấu hình API_BASE_URL. Vui lòng truyền via --dart-define=API_BASE_URL=...',
      );
    }

    final uri = Uri.tryParse(trimmed);
    if (uri == null || !uri.hasAbsolutePath || !uri.hasScheme) {
      throw StateError(
        'Lỗi cấu hình hệ thống: API_BASE_URL không hợp lệ ($trimmed).',
      );
    }

    if (kReleaseMode && uri.scheme != 'https') {
      throw StateError(
        'Lỗi cấu hình bảo mật: Trong môi trường Release/Production, API_BASE_URL phải sử dụng HTTPS ($trimmed).',
      );
    }

    return trimmed.endsWith('/')
        ? trimmed.substring(0, trimmed.length - 1)
        : trimmed;
  }

  static String? token;
  static int? userId;
  static String? role;

  // Centralized callback when API returns 401 Unauthorized
  static VoidCallback? onUnauthorized;

  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  static Future<void> _handleUnauthorized() async {
    await clearSession();
    onUnauthorized?.call();
  }

  static Exception _handleErrorResponse(http.Response response) {
    String errorMessage =
        'Yêu cầu không thành công (HTTP ${response.statusCode}).';
    try {
      final bodyJson = jsonDecode(response.body);
      if (bodyJson is Map && bodyJson.containsKey('message')) {
        final msg = bodyJson['message'];
        if (msg is String && msg.isNotEmpty) {
          errorMessage = msg;
        } else if (msg is List && msg.isNotEmpty) {
          errorMessage = msg.join(', ');
        }
      }
    } catch (_) {}
    return Exception(errorMessage);
  }

  // Restore session from SecureStorage on app startup
  static Future<bool> initSessionFromStorage() async {
    try {
      final savedToken = await SecureStorage.read('token');
      final savedUserIdStr = await SecureStorage.read('userId');
      final savedRole = await SecureStorage.read('role');

      if (savedToken != null &&
          savedToken.isNotEmpty &&
          savedUserIdStr != null &&
          savedRole != null &&
          (savedRole == 'SinhVien' || savedRole == 'GiangVien')) {
        final parsedUserId = int.tryParse(savedUserIdStr);
        if (parsedUserId != null && parsedUserId > 0) {
          token = savedToken;
          userId = parsedUserId;
          role = savedRole;
          return true;
        }
      }
    } catch (e) {
      // Ignore
    }

    // Invalid session data -> clear session
    token = null;
    userId = null;
    role = null;
    await SecureStorage.clearAll();
    return false;
  }

  static Future<dynamic> get(String path) async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl/$path'),
            headers: _headers,
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        await _handleUnauthorized();
        throw Exception(
            'Phiên làm việc hết hạn. Vui lòng đăng nhập lại (401).');
      } else {
        throw _handleErrorResponse(response);
      }
    } catch (e) {
      rethrow;
    }
  }

  static Future<dynamic> post(String path, Map<String, dynamic> body) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/$path'),
            headers: _headers,
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200 ||
          response.statusCode == 210 ||
          response.statusCode == 201) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        await _handleUnauthorized();
        throw Exception(
            'Phiên làm việc hết hạn. Vui lòng đăng nhập lại (401).');
      } else {
        throw _handleErrorResponse(response);
      }
    } catch (e) {
      rethrow;
    }
  }

  static Future<dynamic> put(String path, Map<String, dynamic> body) async {
    try {
      final response = await http
          .put(
            Uri.parse('$baseUrl/$path'),
            headers: _headers,
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        await _handleUnauthorized();
        throw Exception(
            'Phiên làm việc hết hạn. Vui lòng đăng nhập lại (401).');
      } else {
        throw _handleErrorResponse(response);
      }
    } catch (e) {
      rethrow;
    }
  }

  // Auth
  static Future<Map<String, dynamic>> login(
      String username, String password) async {
    final result = await post('auth/login', {
      'ten_dang_nhap': username,
      'mat_khau': password,
    });

    token = result['token'];
    userId = result['user']?['id'];
    role = result['user']?['vai_tro'];

    // Save values to SecureStorage
    if (token != null && userId != null && role != null) {
      await SecureStorage.write('token', token!);
      await SecureStorage.write('userId', userId.toString());
      await SecureStorage.write('role', role!);
    }

    return result;
  }

  static Future<void> clearSession() async {
    token = null;
    userId = null;
    role = null;
    await SecureStorage.clearAll();
  }

  static Future<dynamic> changePassword(
      String oldPass, String newPass) async {
    return await post('auth/change-password', {
      'oldPass': oldPass,
      'newPass': newPass,
    });
  }

  // Student profile
  static Future<dynamic> getStudentProfile(int accountId) async {
    return await get('sinh-vien/profile/$accountId');
  }

  // Student trips
  static Future<dynamic> getAvailableTrips(int studentId) async {
    return await get('sinh-vien/available-trips/$studentId');
  }

  static Future<dynamic> getRegisteredTrips(int studentId) async {
    return await get('sinh-vien/registered-trips/$studentId');
  }

  static Future<dynamic> registerTrip(int tripId) async {
    return await post('sinh-vien/register', {
      'tripId': tripId,
    });
  }

  static Future<dynamic> submitReport(int registrationId,
      String fileBaoCaoUrl, String? fileXacNhanUrl) async {
    return await post('sinh-vien/submit-report', {
      'registrationId': registrationId,
      'fileBaoCaoUrl': fileBaoCaoUrl,
      if (fileXacNhanUrl != null) 'fileXacNhanUrl': fileXacNhanUrl,
    });
  }

  static Future<dynamic> selectRepresentativeTrips(
      int termStudentId, List<int> registrationIds) async {
    return await post('sinh-vien/select-representative-trips', {
      'termStudentId': termStudentId,
      'registrationIds': registrationIds,
    });
  }

  // Student finance
  static Future<dynamic> getInvoices(int studentId) async {
    return await get('sinh-vien/invoices/$studentId');
  }

  static Future<dynamic> payInvoice(int invoiceId) async {
    return await post('sinh-vien/pay-invoice/$invoiceId', {});
  }

  static Future<dynamic> requestRefund(
      int invoiceId, String fileScanUrl) async {
    return await post('sinh-vien/request-refund', {
      'invoiceId': invoiceId,
      'fileScanUrl': fileScanUrl,
    });
  }

  static Future<dynamic> getRefundRequests(int studentId) async {
    return await get('sinh-vien/refund-requests/$studentId');
  }

  // Student notifications
  static Future<dynamic> getStudentNotifications(int studentId) async {
    return await get('sinh-vien/notifications/$studentId');
  }

  static Future<dynamic> markStudentNotificationRead(
      int notifId) async {
    return await post('sinh-vien/mark-notification-read', {
      'notifId': notifId,
    });
  }

  // Student grades
  static Future<dynamic> getStudentGrades(int studentId) async {
    return await get('sinh-vien/grades/$studentId');
  }

  // Lecturer profile
  static Future<dynamic> getLecturerProfile(int accountId) async {
    return await get('giang-vien/profile/$accountId');
  }

  // Lecturer guided students
  static Future<dynamic> getGuidedStudents(int lecturerId) async {
    return await get('giang-vien/guided-students/$lecturerId');
  }

  // Lecturer led trips
  static Future<dynamic> getLedTrips(int lecturerId) async {
    return await get('giang-vien/led-trips/$lecturerId');
  }

  static Future<dynamic> getTripRegistrations(int tripId) async {
    return await get('giang-vien/trip-registrations/$tripId');
  }

  // Lecturer take attendance
  static Future<dynamic> takeAttendance(int tripId,
      List<Map<String, dynamic>> records) async {
    return await post('giang-vien/take-attendance', {
      'tripId': tripId,
      'records': records,
    });
  }

  // Lecturer grade preparation and bonus
  static Future<dynamic> gradePrepAndBonus(int phieuId,
      double diemChuanBi, double diemCong) async {
    return await post('giang-vien/grade-prep-bonus', {
      'phieuId': phieuId,
      'diemChuanBi': diemChuanBi,
      'diemCong': diemCong,
    });
  }

  // Lecturer guided reports
  static Future<dynamic> getGuidedReports(int lecturerId,
      {String? search, String? status}) async {
    final queryParams = <String, String>{
      if (search != null) 'search': search,
      if (status != null) 'status': status,
    };
    final uri = Uri.parse('$baseUrl/giang-vien/guided-reports/$lecturerId')
        .replace(queryParameters: queryParams);
    try {
      final response =
          await http.get(uri, headers: _headers).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        await _handleUnauthorized();
        throw Exception(
            'Phiên làm việc hết hạn. Vui lòng đăng nhập lại (401).');
      } else {
        throw _handleErrorResponse(response);
      }
    } catch (e) {
      rethrow;
    }
  }

  // Lecturer grade report
  static Future<dynamic> gradeReport(
      int reportId, double score, String comment) async {
    return await post('giang-vien/grade-report', {
      'reportId': reportId,
      'score': score,
      'comment': comment,
    });
  }

  // Lecturer board sessions
  static Future<dynamic> getBoardSessions(int lecturerId) async {
    return await get('giang-vien/board-sessions/$lecturerId');
  }

  // Lecturer submit board score
  static Future<dynamic> submitBoardScore(
      int memberId, int phieuId, double score) async {
    return await post('giang-vien/submit-board-score', {
      'memberId': memberId,
      'phieuId': phieuId,
      'score': score,
    });
  }

  // File Upload Helper
  static Future<Map<String, dynamic>> uploadFile(
      String path, String filePath, String fieldName) async {
    try {
      final request =
          http.MultipartRequest('POST', Uri.parse('$baseUrl/$path'));
      request.headers.addAll(_headers);
      request.files.add(await http.MultipartFile.fromPath(fieldName, filePath));

      final streamedResponse =
          await request.send().timeout(const Duration(seconds: 15));
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        await _handleUnauthorized();
        throw Exception(
            'Phiên làm việc hết hạn. Vui lòng đăng nhập lại (401).');
      } else {
        throw _handleErrorResponse(response);
      }
    } catch (e) {
      rethrow;
    }
  }
}

