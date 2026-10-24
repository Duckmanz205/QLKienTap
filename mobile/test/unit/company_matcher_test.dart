import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/utils/company_matcher.dart';

void main() {
  group('Kiểm thử Thuật toán thông minh CompanyMatcher (Mobile Client)', () {
    test('1. cleanString: Chuẩn hóa, bỏ dấu tiếng Việt và bảo vệ thương hiệu C.P.', () {
      expect(
        CompanyMatcher.cleanString('Công ty T.N.H.H. Acecook Việt Nam'),
        'cong ty tnhh acecook viet nam',
      );

      // C.P. có dấu chấm bảo vệ thương hiệu
      expect(
        CompanyMatcher.cleanString('Công ty Cổ phần Chăn nuôi C.P. Việt Nam'),
        'cong ty co phan chan nuoi cp_brand viet nam',
      );
    });

    test('2. extractCoreBrand: Loại bỏ chính xác stopwords pháp lý doanh nghiệp', () {
      // Acecook
      expect(
        CompanyMatcher.extractCoreBrand('Công ty TNHH Acecook Việt Nam'),
        'acecook',
      );

      // C.P. Việt Nam (bảo vệ thương hiệu C.P.)
      expect(
        CompanyMatcher.extractCoreBrand('Công ty Cổ phần C.P. Việt Nam'),
        'cp',
      );
      expect(
        CompanyMatcher.extractCoreBrand('Công ty Cổ phần Chăn nuôi C.P. Việt Nam'),
        'chan nuoi cp',
      );

      // Vinamilk
      expect(
        CompanyMatcher.extractCoreBrand('Công ty Cổ phần Vinamilk'),
        'vinamilk',
      );
      expect(
        CompanyMatcher.extractCoreBrand('Công ty Cổ phần Sữa Việt Nam (Vinamilk)'),
        'sua vinamilk',
      );

      // Loại bỏ chi nhánh KCN ở cuối tên (Acecook Tân Bình -> acecook)
      expect(
        CompanyMatcher.extractCoreBrand('Công ty Cổ phần Acecook Tân Bình'),
        'acecook',
      );
    });

    test('3. shortenFactoryName: Sinh mã rút gọn thương hiệu chuẩn <= 10 ký tự', () {
      expect(
        CompanyMatcher.shortenFactoryName('Công ty TNHH Acecook Việt Nam'),
        'ACECOOK',
      );
      expect(
        CompanyMatcher.shortenFactoryName('Công ty Cổ phần Chăn nuôi C.P. Việt Nam'),
        'CP',
      );
    });

    test('4. extractSpecificLocations: Nhận diện chính xác KCN và Quận Huyện', () {
      final locs = CompanyMatcher.extractSpecificLocations(
        'Lô II-3, Đường số 11, KCN Tân Bình, Phường Tây Thạnh, Quận Tân Phú, TP.HCM',
      );
      expect(locs.contains('tan binh'), isTrue);
      expect(locs.contains('tay thanh'), isTrue);
      expect(locs.contains('tan phu'), isTrue);
    });

    test('5. levenshteinDistance & fuzzySimilarity: Bắt lỗi gõ sai chính tả', () {
      // Sai 1 ký tự: aceook vs acecook
      final dist = CompanyMatcher.levenshteinDistance('aceook', 'acecook');
      expect(dist, 1);

      final sim = CompanyMatcher.fuzzySimilarity('aceook', 'acecook');
      expect(sim, greaterThanOrEqualTo(0.85));

      // Ajinomoto vs Ajnomoto
      final simAji = CompanyMatcher.fuzzySimilarity('ajnomoto', 'ajinomoto');
      expect(simAji, greaterThanOrEqualTo(0.85));
    });

    test('6. calculateMatchScore: Khớp hoàn hảo cùng thương hiệu + cùng địa điểm (Score >= 90)', () {
      const candidate = FactoryCandidate(
        id: 1,
        tenNhaMay: 'Công ty Cổ phần Acecook Việt Nam',
        diaChi: 'KCN Tân Bình, Tân Phú, TP.HCM',
      );

      final result = CompanyMatcher.calculateMatchScore(
        'Acecook Tân Bình',
        'KCN Tân Bình',
        candidate,
        true,
      );

      expect(result.brandScore, 100);
      expect(result.locationScore, 100);
      expect(result.score, greaterThanOrEqualTo(90));
    });

    test('7. calculateMatchScore: Phát hiện Mâu thuẫn Chi nhánh (LocationConflict -> LocationScore = 0)', () {
      const candidate = FactoryCandidate(
        id: 2,
        tenNhaMay: 'Công ty TNHH Nước giải khát Suntory PepsiCo Việt Nam - Chi nhánh Cần Thơ',
        diaChi: 'KCN Trà Nóc, Cần Thơ',
      );

      // Sinh viên nhập PepsiCo ở Hóc Môn / TP.HCM
      final result = CompanyMatcher.calculateMatchScore(
        'PepsiCo Hóc Môn',
        'Huyện Hóc Môn, TP.HCM',
        candidate,
        false,
      );

      // Mâu thuẫn rõ ràng: Cần Thơ vs Hóc Môn
      expect(result.locationScore, 0);
      expect(result.score, lessThan(75)); // Không được tự động auto-match
    });

    test('8. findBestMatch: Tìm đúng nhà máy trong danh sách DB và vượt ngưỡng chống trùng lặp (>= 75)', () {
      final factories = [
        const FactoryCandidate(id: 1, tenNhaMay: 'Công ty Cổ phần Acecook Việt Nam', diaChi: 'KCN Tân Bình, TP.HCM'),
        const FactoryCandidate(id: 2, tenNhaMay: 'Công ty Cổ phần Sữa Vinamilk', diaChi: 'Quận 7, TP.HCM'),
        const FactoryCandidate(id: 3, tenNhaMay: 'Công ty TNHH Suntory PepsiCo', diaChi: 'Hóc Môn, TP.HCM'),
      ];

      final match = CompanyMatcher.findBestMatch(
        'Cty TNHH Acecook VN',
        'Tân Bình, Hồ Chí Minh',
        factories,
      );

      expect(match.bestMatch, isNotNull);
      expect(match.bestMatch!.id, 1);
      expect(match.score, greaterThanOrEqualTo(75)); // Ngưỡng kích hoạt auto-link ngăn trùng lặp
    });

    test('9. toTitleCase: Chuẩn hóa chữ hoa đầu từ cho doanh nghiệp mới', () {
      expect(
        CompanyMatcher.toTitleCase('công ty tnhh sản xuất thương mại abc'),
        'Công Ty Tnhh Sản Xuất Thương Mại Abc',
      );
    });
  });
}
