import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'secure_storage.dart';

class ApiService {
  static String baseUrl = 'http://10.0.2.2:3000'; // Default Android Emulator localhost forwarding port
  static String? token;
  static int? userId;
  static String? role;

  // Centralized callback when API returns 401 Unauthorized
  static VoidCallback? onUnauthorized;

  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  // Restore session from SecureStorage on app startup
  static Future<bool> initSessionFromStorage() async {
    try {
      final savedToken = await SecureStorage.read('token');
      final savedUserIdStr = await SecureStorage.read('userId');
      final savedRole = await SecureStorage.read('role');

      if (savedToken != null && savedUserIdStr != null && savedRole != null) {
        token = savedToken;
        userId = int.tryParse(savedUserIdStr);
        role = savedRole;
        return true;
      }
    } catch (e) {
      print('Failed to restore session from SecureStorage: $e');
    }
    return false;
  }

  static Future<dynamic> get(String path) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/$path'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        onUnauthorized?.call();
        throw Exception('Phiên làm việc hết hạn. Vui lòng đăng nhập lại (401).');
      } else {
        throw Exception('API Server returned code ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('ApiService GET $path failed: $e');
      rethrow;
    }
  }

  static Future<dynamic> post(String path, Map<String, dynamic> body) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/$path'),
        headers: _headers,
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200 || response.statusCode == 210 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        onUnauthorized?.call();
        throw Exception('Phiên làm việc hết hạn. Vui lòng đăng nhập lại (401).');
      } else {
        throw Exception('API Server returned code ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('ApiService POST $path failed: $e');
      rethrow;
    }
  }

  static Future<dynamic> put(String path, Map<String, dynamic> body) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/$path'),
        headers: _headers,
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        onUnauthorized?.call();
        throw Exception('Phiên làm việc hết hạn. Vui lòng đăng nhập lại (401).');
      } else {
        throw Exception('API Server returned code ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('ApiService PUT $path failed: $e');
      rethrow;
    }
  }

  // Auth
  static Future<Map<String, dynamic>> login(String username, String password) async {
    final result = await post('auth/login', {
      'ten_dang_nhap': username,
      'mat_khau': password,
    });
    
    token = result['token'];
    userId = result['user']['id'];
    role = result['user']['vai_tro'];

    // Save encrypted values to SecureStorage
    if (token != null) {
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

  static Future<dynamic> changePassword(int uId, String oldPass, String newPass) async {
    return await post('auth/change-password', {
      'userId': uId,
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

  static Future<dynamic> registerTrip(int studentId, int tripId) async {
    return await post('sinh-vien/register', {
      'studentId': studentId,
      'tripId': tripId,
    });
  }

  static Future<dynamic> submitReport(int studentId, int registrationId, String fileBaoCaoUrl, String? fileXacNhanUrl) async {
    return await post('sinh-vien/submit-report', {
      'studentId': studentId,
      'registrationId': registrationId,
      'fileBaoCaoUrl': fileBaoCaoUrl,
      if (fileXacNhanUrl != null) 'fileXacNhanUrl': fileXacNhanUrl,
    });
  }

  static Future<dynamic> selectRepresentativeTrips(int studentId, int termStudentId, List<int> registrationIds) async {
    return await post('sinh-vien/select-representative-trips', {
      'studentId': studentId,
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

  static Future<dynamic> requestRefund(int invoiceId, String fileScanUrl) async {
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

  static Future<dynamic> markStudentNotificationRead(int accountId, int notifId) async {
    return await post('sinh-vien/mark-notification-read', {
      'accountId': accountId,
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
  static Future<dynamic> takeAttendance(int lecturerId, int tripId, List<Map<String, dynamic>> records) async {
    return await post('giang-vien/take-attendance', {
      'lecturerId': lecturerId,
      'tripId': tripId,
      'records': records,
    });
  }

  // Lecturer grade preparation and bonus
  static Future<dynamic> gradePrepAndBonus(int lecturerId, int phieuId, double diemChuanBi, double diemCong) async {
    return await post('giang-vien/grade-prep-bonus', {
      'lecturerId': lecturerId,
      'phieuId': phieuId,
      'diemChuanBi': diemChuanBi,
      'diemCong': diemCong,
    });
  }

  // Lecturer guided reports
  static Future<dynamic> getGuidedReports(int lecturerId, {String? search, String? status}) async {
    final queryParams = <String, String>{
      if (search != null) 'search': search,
      if (status != null) 'status': status,
    };
    final uri = Uri.parse('$baseUrl/giang-vien/guided-reports/$lecturerId').replace(queryParameters: queryParams);
    try {
      final response = await http.get(uri, headers: _headers).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('API Server returned code ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('ApiService GET guided-reports failed: $e');
      rethrow;
    }
  }

  // Lecturer grade report
  static Future<dynamic> gradeReport(int lecturerId, int reportId, double score, String comment) async {
    return await post('giang-vien/grade-report', {
      'lecturerId': lecturerId,
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
  static Future<dynamic> submitBoardScore(int lecturerId, int memberId, int phieuId, double score) async {
    return await post('giang-vien/submit-board-score', {
      'lecturerId': lecturerId,
      'memberId': memberId,
      'phieuId': phieuId,
      'score': score,
    });
  }
}
