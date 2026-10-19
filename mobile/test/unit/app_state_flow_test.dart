import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/models/app_models.dart';
import 'package:mobile/data/state/app_state.dart';

void main() {
  group('Kiểm thử chuyển đổi trạng thái AppState (AppState Flow Tests)', () {
    late AppState state;

    setUp(() {
      state = AppState(
        currentRole: 'student',
        studentProfile: StudentProfile(
          name: 'Nguyễn Văn A',
          email: 'student@hutech.edu.vn',
          studentId: '2026001',
          className: '20DTHA1',
          major: 'Công nghệ thực phẩm',
          avatar: '',
        ),
        studentTrips: [
          Trip(
            id: 'trip-1',
            name: 'Nhà máy Acecook',
            date: '20/10/2026',
            time: '08:00 - 11:30',
            type: 'Trực tiếp',
            location: 'KCN Tân Bình',
            industry: 'Thực phẩm',
            description: 'Mô tả',
            heroImage: '',
            isRegistered: false,
            isCompleted: false,
          ),
          Trip(
            id: 'trip-2',
            name: 'Nhà máy Vinamilk',
            date: '25/10/2026',
            time: '08:00 - 11:30',
            type: 'Trực tiếp',
            location: 'KCN Bình Dương',
            industry: 'Sữa',
            description: 'Mô tả',
            heroImage: '',
            isRegistered: true,
            isCompleted: true,
          ),
        ],
        studentNotifications: [
          StudentNotification(
            id: 'notif-1',
            title: 'Lịch tham quan mới',
            content: 'Có chuyến tham quan mới vừa được mở đăng ký.',
            timeText: 'Vừa xong',
            isRead: false,
            type: 'ChuyenDi',
          ),
        ],
        submissions: [],
        payments: [
          Payment(
            id: 'pay-1',
            tripId: 'trip-2',
            name: 'Chuyến: Vinamilk',
            code: 'KT2026-VNM-12345',
            amount: 50000,
            dueDate: '15/12/2026',
            status: 'Chưa đóng',
          ),
        ],
        refunds: [],
        lecturerProfile: LecturerProfile(
          name: 'TS. Trần Văn B',
          email: 'lecturer@hutech.edu.vn',
          teacherId: 'GV001',
          avatar: '',
          department: 'Khoa CN Thực Phẩm',
        ),
        lecturerStudents: [
          LecturerStudent(
            id: 'sv-1',
            name: 'Lê Thị C',
            className: '20DTHA1',
            company: 'Vinamilk',
            completedTours: '3/3',
            papersLeft: 0,
            avatar: '',
            submittedDate: '20/10/2026',
            attendanceStatus: 'absent',
            prelimGrade: 8.0,
            extraGrade: 0.5,
            gvhdGrade: 8.5,
            isGraded: false,
            tourId: 'trip-2',
          ),
        ],
        lecturerTours: [],
        councilSessions: [],
        lecturerNotifications: [],
      );
    });

    test('Thay đổi vai trò người dùng (Role Switch)', () {
      expect(state.currentRole, equals('student'));

      final lecturerState = state.copyWith(currentRole: 'lecturer');
      expect(lecturerState.currentRole, equals('lecturer'));

      final studentState = lecturerState.copyWith(currentRole: 'student');
      expect(studentState.currentRole, equals('student'));
    });

    test('Đăng ký chuyến tham quan cập nhật isRegistered', () {
      final updatedTrips = state.studentTrips.map((t) {
        if (t.id == 'trip-1') {
          return t.copyWith(isRegistered: true);
        }
        return t;
      }).toList();

      final newState = state.copyWith(studentTrips: updatedTrips);
      final registeredTrip = newState.studentTrips.firstWhere((t) => t.id == 'trip-1');
      expect(registeredTrip.isRegistered, isTrue);
    });

    test('Thanh toán hóa đơn chuyển trạng thái sang Đã đóng đúng hạn', () {
      final updatedPayments = state.payments.map((p) {
        if (p.id == 'pay-1') {
          return p.copyWith(status: 'Đã đóng đúng hạn');
        }
        return p;
      }).toList();

      final newState = state.copyWith(payments: updatedPayments);
      expect(newState.payments.first.status, equals('Đã đóng đúng hạn'));
    });

    test('Cập nhật điểm danh sinh viên 3 trạng thái: Có mặt, Vắng, Từ chối', () {
      // 1. Chuyển sang có mặt (present)
      var updatedStudents = state.lecturerStudents.map((s) {
        if (s.id == 'sv-1') return s.copyWith(attendanceStatus: 'present');
        return s;
      }).toList();
      var newState = state.copyWith(lecturerStudents: updatedStudents);
      expect(newState.lecturerStudents.first.attendanceStatus, equals('present'));

      // 2. Chuyển sang từ chối (excused)
      updatedStudents = state.lecturerStudents.map((s) {
        if (s.id == 'sv-1') return s.copyWith(attendanceStatus: 'excused', excuseReason: 'Bị ốm');
        return s;
      }).toList();
      newState = state.copyWith(lecturerStudents: updatedStudents);
      expect(newState.lecturerStudents.first.attendanceStatus, equals('excused'));
      expect(newState.lecturerStudents.first.excuseReason, equals('Bị ốm'));
    });

    test('Đánh dấu thông báo đã đọc', () {
      expect(state.studentNotifications.first.isRead, isFalse);

      final updatedNotifs = state.studentNotifications.map((n) {
        if (n.id == 'notif-1') return n.copyWith(isRead: true);
        return n;
      }).toList();

      final newState = state.copyWith(studentNotifications: updatedNotifs);
      expect(newState.studentNotifications.first.isRead, isTrue);
    });
  });
}
