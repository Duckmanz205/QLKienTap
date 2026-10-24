import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/models/app_models.dart';

// Helper validator class extracting the exact business logic from NopBaiThuHoachSVScreen
class RepresentativeTripsValidator {
  static String? validateSelection({
    required List<String> selectedTripIds,
    required List<Submission> allSubmissions,
    required bool isLockedByKhoa,
  }) {
    if (isLockedByKhoa) {
      return 'Khoa đã chốt danh sách hội đồng. Không thể thay đổi bộ chuyến đi.';
    }

    if (selectedTripIds.length != 3) {
      return 'Vui lòng chọn đúng chính xác 3 chuyến tham quan báo cáo.';
    }

    final selectedSubs = allSubmissions.where((s) => selectedTripIds.contains(s.id)).toList();
    
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
  });
}
