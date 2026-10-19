import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/models/app_models.dart';

void main() {
  group('Kiểm thử công thức tính điểm (Score Calculation Tests)', () {
    test('Tính đúng điểm chuyến đi theo trọng số: 30% Chuẩn bị + 30% Thu hoạch + 40% Báo cáo TQNM', () {
      final tripGrade = TripGradeItem(
        id: 1,
        tenNhaMay: 'Nhà máy Acecook',
        hinhThuc: 'Trực tiếp',
        diemChuanBi: 8.0,      // 8.0 * 0.3 = 2.4
        diemBaiThuHoach: 9.0,  // 9.0 * 0.3 = 2.7
        diemBaoCaoTQNM: 7.5,   // 7.5 * 0.4 = 3.0
        diemCong: 0.5,         // + 0.5 = 8.6
      );

      final calculated = tripGrade.calculateCalculatedScore();
      expect(calculated, isNotNull);
      expect(calculated! >= 8.59 && calculated <= 8.61, isTrue); // 8.6
    });

    test('Giới hạn (cap) điểm tối đa là 10.0 khi có điểm cộng lớn', () {
      final tripGrade = TripGradeItem(
        id: 2,
        tenNhaMay: 'Nhà máy Vinamilk',
        hinhThuc: 'Trực tiếp',
        diemChuanBi: 10.0,     // 3.0
        diemBaiThuHoach: 10.0, // 3.0
        diemBaoCaoTQNM: 10.0,  // 4.0 -> Tổng 10.0
        diemCong: 2.0,         // + 2.0 = 12.0 -> phải được cap về 10.0
      );

      final calculated = tripGrade.calculateCalculatedScore();
      expect(calculated, equals(10.0));
    });

    test('Trả về null nếu thiếu bất kỳ cột điểm thành phần nào', () {
      final missingPrep = TripGradeItem(
        id: 3,
        tenNhaMay: 'Nhà máy Yakult',
        diemChuanBi: null,
        diemBaiThuHoach: 8.0,
        diemBaoCaoTQNM: 8.0,
      );
      expect(missingPrep.calculateCalculatedScore(), isNull);

      final missingReport = TripGradeItem(
        id: 4,
        tenNhaMay: 'Nhà máy Yakult',
        diemChuanBi: 8.0,
        diemBaiThuHoach: null,
        diemBaoCaoTQNM: 8.0,
      );
      expect(missingReport.calculateCalculatedScore(), isNull);
    });

    test('Xác định kết quả Đạt (isPassed >= 5.0) cho học phần kiến tập', () {
      final passedTerm = StudentTermGrade(
        diemTongKet: 7.2,
        isScoreLocked: true,
        tripGrades: [],
      );
      expect(passedTerm.isPassed, isTrue);

      final failedTerm = StudentTermGrade(
        diemTongKet: 4.8,
        isScoreLocked: true,
        tripGrades: [],
      );
      expect(failedTerm.isPassed, isFalse);
    });

    test('Tự động tính isPassed trung bình các chuyến khi chưa có điểm tổng kết chốt', () {
      final trip1 = TripGradeItem(
        id: 1,
        tenNhaMay: 'NM 1',
        diemChuanBi: 8.0,
        diemBaiThuHoach: 8.0,
        diemBaoCaoTQNM: 8.0, // 8.0
      );
      final trip2 = TripGradeItem(
        id: 2,
        tenNhaMay: 'NM 2',
        diemChuanBi: 6.0,
        diemBaiThuHoach: 6.0,
        diemBaoCaoTQNM: 6.0, // 6.0
      );

      final term = StudentTermGrade(
        diemTongKet: null,
        isScoreLocked: false,
        tripGrades: [trip1, trip2], // Trung bình = 7.0 >= 5.0
      );

      expect(term.isPassed, isTrue);
    });
  });
}
