import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/models/app_models.dart';

// Helper validator class extracting the exact business logic from NopBaiThuHoachSVScreen
class RepresentativeTripsValidator {
  static String? validateSelection({
    required List<String> selectedTripIds,
    required List<Submission> allSubmissions,
    required bool isLockedByKhoa,
    String? lockReason,
    DateTime? currentDate,
  }) {
    if (isLockedByKhoa) {
      if (lockReason == 'COUNCIL_ASSIGNED') {
        return 'Bạn đã được Khoa phân công vào Hội đồng bảo vệ. Không thể thay đổi bộ chuyến đi.';
      } else if (lockReason == 'GRADES_LOCKED') {
        return 'Điểm báo cáo của bộ chuyến đã được chốt/khóa sổ. Không thể thay đổi.';
      }
      return 'Khoa đã chốt danh sách hội đồng. Không thể thay đổi bộ chuyến đi.';
    }

    if (selectedTripIds.length != 3) {
      return 'Vui lòng chọn đúng chính xác 3 chuyến tham quan báo cáo.';
    }

    final selectedSubs = allSubmissions.where((s) => selectedTripIds.contains(s.id)).toList();

    // Kiểm tra mốc 18 tháng tính từ ngày tham quan theo quy chế HUIT
    final now = currentDate ?? DateTime.now();
    final eighteenMonthsAgo = DateTime(now.year, now.month - 18, now.day);
    for (final s in selectedSubs) {
      DateTime? tripDate = s.tripDate;
      if (tripDate == null && s.dateText.isNotEmpty) {
        final parts = s.dateText.split(RegExp(r'[/.-]'));
        if (parts.length == 3) {
          if (parts[0].length == 4) {
            tripDate = DateTime.tryParse('${parts[0]}-${parts[1].padLeft(2, '0')}-${parts[2].padLeft(2, '0')}');
          } else {
            tripDate = DateTime.tryParse('${parts[2]}-${parts[1].padLeft(2, '0')}-${parts[0].padLeft(2, '0')}');
          }
        }
      }
      if (tripDate != null && tripDate.isBefore(eighteenMonthsAgo)) {
        return 'Chuyến đi "${s.tripName}" (${s.dateText}) đã quá 18 tháng kể từ ngày tham quan, không được phép đưa vào Bộ 3 chuyến báo cáo theo quy chế HUIT.';
      }
    }
    
    // Kiểm tra tối thiểu 2 chuyến trực tiếp
    final directCount = selectedSubs.where((s) {
      final lower = s.typeText.toLowerCase();
      return lower.contains('trực tiếp') || lower.contains('tructiep');
    }).length;
    if (directCount < 2) {
      return 'Quy định: Cần tối thiểu 2 chuyến kiến tập trực tiếp.';
    }

    // Kiểm tra không trùng lặp nhà máy
    final uniqueTripNames = selectedSubs.map((s) => s.tripName.trim().toLowerCase()).toSet();
    if (uniqueTripNames.length < 3) {
      return 'Các chuyến tham quan được chọn không được trùng nhà máy.';
    }

    return null; // Valid
  }
}

void main() {
  group('Kiểm thử quy tắc chọn Bộ 3 chuyến tham quan báo cáo', () {
    final subDirect1 = Submission(
      id: 'sub-1',
      tripName: 'Nhà máy Acecook',
      typeText: 'Kiến tập trực tiếp',
      dateText: '15/10/2026',
      status: 'Đã nộp',
    );
    final subDirect2 = Submission(
      id: 'sub-2',
      tripName: 'Nhà máy Vinamilk',
      typeText: 'Kiến tập trực tiếp',
      dateText: '18/10/2026',
      status: 'Đã nộp',
    );
    final subOnline = Submission(
      id: 'sub-3',
      tripName: 'Nhà máy Ajinomoto (Online)',
      typeText: 'Kiến tập trực tuyến',
      dateText: '20/10/2026',
      status: 'Đã nộp',
    );
    final subOnline2 = Submission(
      id: 'sub-4',
      tripName: 'Nhà máy Tiger Beer (Online)',
      typeText: 'Kiến tập trực tuyến',
      dateText: '22/10/2026',
      status: 'Đã nộp',
    );
    final subDirectDuplicate = Submission(
      id: 'sub-5',
      tripName: 'Nhà máy Acecook', // Trùng tên nhà máy với sub-1
      typeText: 'Kiến tập trực tiếp',
      dateText: '25/10/2026',
      status: 'Đã nộp',
    );

    final allSubs = [subDirect1, subDirect2, subOnline, subOnline2, subDirectDuplicate];

    test('Hợp lệ: 2 trực tiếp + 1 trực tuyến, 3 nhà máy khác nhau', () {
      final error = RepresentativeTripsValidator.validateSelection(
        selectedTripIds: ['sub-1', 'sub-2', 'sub-3'],
        allSubmissions: allSubs,
        isLockedByKhoa: false,
      );
      expect(error, isNull);
    });

    test('Hợp lệ: 3 trực tiếp, 3 nhà máy khác nhau', () {
      final subDirect3 = Submission(
        id: 'sub-6',
        tripName: 'Nhà máy CP Việt Nam',
        typeText: 'Kiến tập trực tiếp',
        dateText: '28/10/2026',
        status: 'Đã nộp',
      );
      final error = RepresentativeTripsValidator.validateSelection(
        selectedTripIds: ['sub-1', 'sub-2', 'sub-6'],
        allSubmissions: [...allSubs, subDirect3],
        isLockedByKhoa: false,
      );
      expect(error, isNull);
    });

    test('Không hợp lệ: Chọn ít hơn 3 chuyến', () {
      final error = RepresentativeTripsValidator.validateSelection(
        selectedTripIds: ['sub-1', 'sub-2'],
        allSubmissions: allSubs,
        isLockedByKhoa: false,
      );
      expect(error, contains('chọn đúng chính xác 3 chuyến'));
    });

    test('Không hợp lệ: Chọn nhiều hơn 3 chuyến', () {
      final error = RepresentativeTripsValidator.validateSelection(
        selectedTripIds: ['sub-1', 'sub-2', 'sub-3', 'sub-4'],
        allSubmissions: allSubs,
        isLockedByKhoa: false,
      );
      expect(error, contains('chọn đúng chính xác 3 chuyến'));
    });

    test('Không hợp lệ: Không đủ 2 chuyến trực tiếp (2 trực tuyến + 1 trực tiếp)', () {
      final error = RepresentativeTripsValidator.validateSelection(
        selectedTripIds: ['sub-1', 'sub-3', 'sub-4'],
        allSubmissions: allSubs,
        isLockedByKhoa: false,
      );
      expect(error, contains('tối thiểu 2 chuyến kiến tập trực tiếp'));
    });

    test('Không hợp lệ: Trùng nhà máy giữa các chuyến được chọn', () {
      final error = RepresentativeTripsValidator.validateSelection(
        selectedTripIds: ['sub-1', 'sub-2', 'sub-5'], // sub-1 và sub-5 đều là Acecook
        allSubmissions: allSubs,
        isLockedByKhoa: false,
      );
      expect(error, contains('không được trùng nhà máy'));
    });

    test('Không cho phép chỉnh sửa khi Khoa đã khóa danh sách hội đồng', () {
      final error = RepresentativeTripsValidator.validateSelection(
        selectedTripIds: ['sub-1', 'sub-2', 'sub-3'],
        allSubmissions: allSubs,
        isLockedByKhoa: true,
      );
      expect(error, contains('Khoa đã chốt danh sách hội đồng'));
    });

    test('Không hợp lệ: Chuyến đi đã quá 18 tháng kể từ ngày tham quan theo quy chế HUIT', () {
      final subExpired = Submission(
        id: 'sub-expired',
        tripName: 'Nhà máy Cũ (Đã quá hạn)',
        typeText: 'Kiến tập trực tiếp',
        dateText: '10/01/2024',
        tripDate: DateTime(2024, 1, 10),
        status: 'Đã nộp',
      );
      final testDate = DateTime(2026, 10, 24); // Hiện tại: 24/10/2026 (> 18 tháng so với 10/01/2024)

      final error = RepresentativeTripsValidator.validateSelection(
        selectedTripIds: ['sub-1', 'sub-3', 'sub-expired'],
        allSubmissions: [...allSubs, subExpired],
        isLockedByKhoa: false,
        currentDate: testDate,
      );
      expect(error, contains('đã quá 18 tháng kể từ ngày tham quan'));
    });

    test('Hợp lệ: Chuyến đi diễn ra trong vòng 18 tháng trở lại', () {
      final subWithin18M = Submission(
        id: 'sub-recent',
        tripName: 'Nhà máy Mới Nhất',
        typeText: 'Kiến tập trực tiếp',
        dateText: '01/05/2026',
        tripDate: DateTime(2026, 5, 1),
        status: 'Đã nộp',
      );
      final testDate = DateTime(2026, 10, 24);

      final error = RepresentativeTripsValidator.validateSelection(
        selectedTripIds: ['sub-1', 'sub-3', 'sub-recent'],
        allSubmissions: [...allSubs, subWithin18M],
        isLockedByKhoa: false,
        currentDate: testDate,
      );
      expect(error, isNull);
    });

    test('Thông báo khóa cụ thể khi đã phân công vào Hội đồng bảo vệ', () {
      final error = RepresentativeTripsValidator.validateSelection(
        selectedTripIds: ['sub-1', 'sub-2', 'sub-3'],
        allSubmissions: allSubs,
        isLockedByKhoa: true,
        lockReason: 'COUNCIL_ASSIGNED',
      );
      expect(error, contains('phân công vào Hội đồng bảo vệ'));
    });
  });
}
