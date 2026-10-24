import 'dart:math';

class FactoryCandidate {
  final int id;
  final String tenNhaMay;
  final String? diaChi;

  const FactoryCandidate({
    required this.id,
    required this.tenNhaMay,
    this.diaChi,
  });

  factory FactoryCandidate.fromMap(Map<String, dynamic> map) {
    return FactoryCandidate(
      id: map['id'] is int ? map['id'] as int : int.tryParse(map['id']?.toString() ?? '0') ?? 0,
      tenNhaMay: map['ten_nha_may']?.toString() ?? map['tenNhaMay']?.toString() ?? '',
      diaChi: map['dia_chi']?.toString() ?? map['diaChi']?.toString(),
    );
  }
}

class MatchScoreResult {
  final int score;
  final int brandScore;
  final int locationScore;
  final String inputBrand;
  final String factoryBrand;
  final String details;

  const MatchScoreResult({
    required this.score,
    required this.brandScore,
    required this.locationScore,
    required this.inputBrand,
    required this.factoryBrand,
    required this.details,
  });
}

class BestMatchResult {
  final FactoryCandidate? bestMatch;
  final int score;
  final int brandScore;
  final int locationScore;
  final String details;

  const BestMatchResult({
    required this.bestMatch,
    required this.score,
    required this.brandScore,
    required this.locationScore,
    required this.details,
  });
}

class CompanyMatcher {
  // Danh mục các địa danh, KCN, quận huyện cụ thể (loại trừ các từ chung chung như tp hcm, ha noi)
  static const List<String> specificLocations = [
    'tan binh',
    'tan phu',
    'thuan an',
    'binh duong',
    'bien hoa',
    'dong nai',
    'long thanh',
    'vung tau',
    'ba ria',
    'phu my',
    'my xuan',
    'tien giang',
    'long hau',
    'can giuoc',
    'long an',
    'quan 9',
    'thu duc',
    'tan thuan',
    'cu chi',
    'vsip',
    'hiep phuoc',
    'song than',
    'amata',
    'hoc mon',
    'binh chanh',
    'nha be',
    'quan 7',
    'quan 1',
    'quan 2',
    'quan 3',
    'quan 4',
    'quan 5',
    'quan 6',
    'quan 8',
    'quan 10',
    'quan 11',
    'quan 12',
    'binh tan',
    'tay thanh',
    'can tho',
    'da nang',
    'hai phong',
    'bac ninh',
    'hung yen',
  ];

  static const List<String> genericCities = [
    'tp hcm',
    'tphcm',
    'ho chi minh',
    'sai gon',
    'ha noi',
    'viet nam',
  ];

  static final RegExp adminWordsRegex = RegExp(
    r'\b(so|duong|quoc lo|ql|tinh lo|tl|khu pho|kp|ap|phuong|p|xa|thi tran|tt|quan|q|huyen|thi xa|tx|tinh|thanh pho|tp|kcn|khu cong nghiep|cum cong nghiep|lo|khu|tang|toa nha)\b',
    caseSensitive: false,
  );

  static final RegExp stopwordsRegex = RegExp(
    r'\b(cong ty|cty|co phan|ctcp|tnhh|mtv|mot thanh vien|1 thanh vien|1 tv|mot tv|tap doan|doanh nghiep|tong cong ty|tct|nha may|chi nhanh|cn|co so|viet nam|vietnam|vn|jsc|ltd|co ltd|corp|corporation|inc|group|holding|holdings|global)\b',
    caseSensitive: false,
  );

  /// Bỏ dấu tiếng Việt chính xác và đồng nhất với backend
  static String removeVietnameseDiacritics(String str) {
    if (str.isEmpty) return '';
    var res = str;
    const vietnameseMap = {
      'a': 'áàảãạăắằẳẵặâấầẩẫậ',
      'A': 'ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ',
      'd': 'đ',
      'D': 'Đ',
      'e': 'éèẻẽẹêếềểễệ',
      'E': 'ÉÈẺẼẸÊẾỀỂỄỆ',
      'i': 'íìỉĩị',
      'I': 'ÍÌỈĨỊ',
      'o': 'óòỏõọôốồổỗộơớờởỡợ',
      'O': 'ÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ',
      'u': 'úùủũụưứừửữự',
      'U': 'ÚÙỦŨỤƯỨỪỬỮỰ',
      'y': 'ýỳỷỹỵ',
      'Y': 'ÝỲỶỸỴ',
    };

    for (final entry in vietnameseMap.entries) {
      for (var i = 0; i < entry.value.length; i++) {
        res = res.replaceAll(entry.value[i], entry.key);
      }
    }
    return res;
  }

  /// Chuẩn hóa chuỗi thô:
  /// 1. Bỏ dấu tiếng Việt.
  /// 2. Nhận diện viết tắt có dấu chấm đặc biệt (VD: C.P.).
  /// 3. Gộp các chữ cái đơn cách nhau bởi dấu chấm (VD: T.N.H.H -> TNHH).
  /// 4. Thay thế các dấu câu còn lại thành khoảng trắng.
  /// 5. Chuyển chữ thường, rút gọn khoảng trắng thừa.
  static String cleanString(String str) {
    if (str.isEmpty) return '';

    var s = removeVietnameseDiacritics(str);

    // Nhận diện C.P. có dấu chấm để bảo vệ thương hiệu C.P. (Charoen Pokphand)
    final hasDottedCP = RegExp(r'\bc\.p\b', caseSensitive: false).hasMatch(s) ||
        RegExp(r'\bc\.p\.', caseSensitive: false).hasMatch(s);

    // Gộp các chữ cái đơn cách nhau bởi dấu chấm (VD: T.N.H.H. -> TNHH)
    s = s.replaceAllMapped(
      RegExp(r'\b([a-zA-Z])\.(?=[a-zA-Z]\b|\s|$)'),
      (match) => match.group(1) ?? '',
    );

    // Chuyển toàn bộ ký tự phân tách còn lại thành khoảng trắng
    s = s.replaceAll(RegExp(r'''[.,\-_/&()+:;*"'\\\[\]{}<>?~`!@#$%^=]'''), ' ');

    s = s.toLowerCase().replaceAll(RegExp(r'\s+'), ' ').trim();

    // Nếu ban đầu có C.P. có dấu chấm, đánh dấu riêng để không bị xóa bởi stopword 'cp'
    if (hasDottedCP) {
      s = s.replaceAll(RegExp(r'\bcp\b'), 'cp_brand');
    }

    return s;
  }

  /// Bóc tách Từ khóa Thương hiệu Lõi (Core Brand):
  /// - Loại bỏ toàn bộ Stopwords doanh nghiệp (VN & Quốc tế).
  /// - Bóc tách và loại bỏ cả hậu tố chi nhánh nếu sinh viên gõ kèm vào tên (VD: "Acecook Tan Binh" -> "acecook").
  /// - Cơ chế Fallback: Nếu sau khi lọc mà chuỗi bị rỗng hoặc < 2 ký tự,
  ///   fallback về chuỗi chỉ cắt bỏ tiền tố doanh nghiệp ở đầu chuỗi để giữ lại phần thân.
  static String extractCoreBrand(String name) {
    final cleaned = cleanString(name);
    if (cleaned.isEmpty) return '';

    // Loại bỏ stopwords pháp lý
    var brand = cleaned.replaceAll(stopwordsRegex, ' ');

    // Nếu có 'co phan' đã xuất hiện, thì 'cp' còn lại là brand chứ không phải loại hình
    if (!cleaned.contains('co phan')) {
      brand = brand.replaceAll(RegExp(r'\bcp\b'), ' ');
    }

    brand = brand.replaceAll(RegExp(r'\bcp_brand\b'), 'cp');
    brand = brand.replaceAll(RegExp(r'\s+'), ' ').trim();

    // Loại bỏ các hậu tố địa danh chi nhánh nằm ở cuối tên (VD: "acecook tan binh" -> "acecook")
    for (final loc in specificLocations) {
      final locPattern = RegExp('\\b$loc\\b\$');
      if (locPattern.hasMatch(brand) && brand.length > loc.length + 3) {
        brand = brand.replaceAll(locPattern, '').trim();
        break;
      }
    }

    if (brand.isEmpty || brand.length < 2) {
      // Fallback: Chỉ cắt tiền tố doanh nghiệp ở đầu chuỗi
      brand = cleaned
          .replaceAll(
            RegExp(r'^(cong ty|cty|co phan|cp|ctcp|tnhh|mtv|nha may|chi nhanh|doanh nghiep|tap doan|\s)+'),
            '',
          )
          .replaceAll(RegExp(r'\bcp_brand\b'), 'cp')
          .trim();
    }

    return brand.isNotEmpty ? brand : cleaned;
  }

  /// Rút gọn tên nhà máy dùng cho mã / nội dung chuyển khoản (tối đa maxLength ký tự, mặc định 10)
  static String shortenFactoryName(String factoryName, {int maxLength = 10}) {
    if (factoryName.isEmpty) return 'NM';
    var brand = extractCoreBrand(factoryName);
    const extraIndustryWords =
        r'\b(nuoc giai khat|thuc pham|san xuat|thuong mai|dich vu|che bien|nha may|sua|bia|ruou|banh keo|chan nuoi)\b';
    brand = brand.replaceAll(RegExp(extraIndustryWords, caseSensitive: false), ' ');
    var clean = removeVietnameseDiacritics(brand)
        .replaceAll(RegExp(r'[^a-zA-Z0-9]'), '')
        .toUpperCase();
    if (clean.length < 2) {
      clean = removeVietnameseDiacritics(factoryName)
          .replaceAll(RegExp(r'[^a-zA-Z0-9]'), '')
          .toUpperCase();
    }
    return clean.length > maxLength ? clean.substring(0, maxLength) : clean;
  }

  /// Bóc tách các từ khóa địa danh cụ thể (KCN, quận huyện, tỉnh thành)
  static List<String> extractSpecificLocations(String text) {
    final cleaned = cleanString(text);
    if (cleaned.isEmpty) return [];

    final matched = <String>[];
    for (final loc in specificLocations) {
      if (cleaned.contains(loc)) {
        matched.add(loc);
      }
    }
    return matched;
  }

  /// Bóc tách thành phố / vùng chung chung (TP.HCM, Hà Nội)
  static List<String> extractGenericCities(String text) {
    final cleaned = cleanString(text);
    if (cleaned.isEmpty) return [];

    final matched = <String>[];
    for (final city in genericCities) {
      if (cleaned.contains(city)) {
        matched.add(city);
      }
    }
    return matched;
  }

  /// Bóc tách các token động từ địa chỉ (sau khi loại bỏ từ hành chính phổ biến)
  static List<String> extractDynamicAddressTokens(String address) {
    final cleaned = cleanString(address);
    if (cleaned.isEmpty) return [];

    final withoutAdmin = cleaned.replaceAll(adminWordsRegex, ' ').replaceAll(RegExp(r'\s+'), ' ').trim();
    if (withoutAdmin.isEmpty) return [];

    return withoutAdmin
        .split(' ')
        .where((w) => w.length >= 3 && !RegExp(r'^\d+$').hasMatch(w))
        .toList();
  }

  /// Thuật toán khoảng cách Levenshtein giữa 2 chuỗi
  static int levenshteinDistance(String a, String b) {
    if (a == b) return 0;
    if (a.isEmpty) return b.length;
    if (b.isEmpty) return a.length;

    var v0 = List<int>.generate(b.length + 1, (i) => i);
    var v1 = List<int>.filled(b.length + 1, 0);

    for (var i = 0; i < a.length; i++) {
      v1[0] = i + 1;

      for (var j = 0; j < b.length; j++) {
        final cost = a[i] == b[j] ? 0 : 1;
        v1[j + 1] = min(v1[j] + 1, min(v0[j + 1] + 1, v0[j] + cost));
      }

      for (var j = 0; j <= b.length; j++) {
        v0[j] = v1[j];
      }
    }

    return v1[b.length];
  }

  /// Độ tương đồng Fuzzy Levenshtein [0.0 - 1.0]
  static double fuzzySimilarity(String a, String b) {
    if (a.isEmpty && b.isEmpty) return 1.0;
    if (a.isEmpty || b.isEmpty) return 0.0;
    if (a == b) return 1.0;

    final maxLen = max(a.length, b.length);
    if (maxLen == 0) return 1.0;

    final dist = levenshteinDistance(a, b);
    return max(0.0, 1.0 - (dist / maxLen));
  }

  /// Chấm điểm So khớp giữa Đề xuất của SV và một Nhà máy trong DB:
  /// Score = BrandScore * 0.6 + LocationScore * 0.4
  static MatchScoreResult calculateMatchScore(
    String inputName,
    String inputAddr,
    FactoryCandidate factory,
    bool isSingleBranchInDb,
  ) {
    final inputBrand = extractCoreBrand(inputName);
    final factoryBrand = extractCoreBrand(factory.tenNhaMay);

    // 1. Tính BrandScore (0 - 100)
    int brandScore = 0;
    final inputWords = inputBrand.split(' ').where((w) => w.isNotEmpty).toList();
    final factoryWords = factoryBrand.split(' ').where((w) => w.isNotEmpty).toList();
    final wordDiff = (inputWords.length - factoryWords.length).abs();

    if (inputBrand == factoryBrand) {
      brandScore = 100;
    } else if (inputWords.length == 1 && factoryWords.contains(inputWords[0])) {
      // Trường hợp input là thương hiệu lõi đơn lẻ (VD: 'cp', 'fpt', 'vng') nằm trọn vẹn trong tên nhà máy
      brandScore = 80;
    } else {
      final sim = fuzzySimilarity(inputBrand, factoryBrand);
      final simScore = (sim * 100).round();

      // Chống gộp nhầm thương hiệu là tập con (VD: "tân á đại thành" vs "đại thành")
      if (inputWords.length > factoryWords.length && wordDiff >= 2) {
        brandScore = simScore; // Bắt buộc chỉ lấy điểm Levenshtein toàn chuỗi
      } else {
        if (sim >= 0.8) {
          // Xử lý các lỗi gõ sai 1 ký tự (aceook, ajnomoto, yakut...)
          brandScore = max(85, simScore);
        } else if ((inputBrand.contains(factoryBrand) || factoryBrand.contains(inputBrand)) &&
            min(inputBrand.length, factoryBrand.length) >= 2) {
          brandScore = 75;
        } else {
          brandScore = simScore;
        }
      }
    }

    // 2. Tính LocationScore (0 - 100)
    int locationScore = 0;

    // Quét địa danh 2 chiều: Cả từ Tên và Địa chỉ sinh viên nhập
    final inputFullText = '$inputName $inputAddr';
    final factoryFullText = '${factory.tenNhaMay} ${factory.diaChi ?? ''}';

    final inputSpecificLocs = extractSpecificLocations(inputFullText);
    final factorySpecificLocs = extractSpecificLocations(factoryFullText);

    final inputGenericCities = extractGenericCities(inputFullText);
    final factoryGenericCities = extractGenericCities(factoryFullText);

    // Kiểm tra trùng địa danh KCN / quận huyện cụ thể
    final sharedSpecificLocs = inputSpecificLocs.where((loc) => factorySpecificLocs.contains(loc)).toList();

    // Kiểm tra mâu thuẫn chi nhánh rõ ràng (VD: SV nhập Bình Dương nhưng NM ở Tân Bình TP.HCM, hoặc Quận 10 vs Quận 5)
    final hasSpecificLocationConflict =
        inputSpecificLocs.isNotEmpty && factorySpecificLocs.isNotEmpty && sharedSpecificLocs.isEmpty;

    // Kiểm tra trùng thành phố chung chung (TP.HCM, Hà Nội)
    final sharedGenericCity = inputGenericCities.any((c) => factoryGenericCities.contains(c));

    if (hasSpecificLocationConflict) {
      // Ưu tiên hàng đầu: Mâu thuẫn chi nhánh rõ rệt -> 0 điểm tuyệt đối
      locationScore = 0;
    } else if (sharedSpecificLocs.isNotEmpty) {
      // Khớp địa danh chi nhánh / KCN / quận huyện cụ thể -> 100 điểm
      locationScore = 100;
    } else if (sharedGenericCity || isSingleBranchInDb) {
      // Không mâu thuẫn, chỉ trùng thành phố chung chung hoặc nhà máy chỉ có 1 cơ sở -> 50 điểm
      locationScore = 50;
    } else {
      locationScore = 30;
    }

    // 3. Tổng điểm Score
    var finalScore = (brandScore * 0.6 + locationScore * 0.4).round();

    // RÀNG BUỘC AN TOÀN: Nếu BrandScore < 70 (thương hiệu chưa tương đồng cao),
    // tuyệt đối không được vượt ngưỡng auto-match 75 chỉ vì cùng ở TP.HCM!
    if (brandScore < 70) {
      finalScore = min(finalScore, 65);
    }

    return MatchScoreResult(
      score: finalScore,
      brandScore: brandScore,
      locationScore: locationScore,
      inputBrand: inputBrand,
      factoryBrand: factoryBrand,
      details: 'Brand: $brandScore (sim: $inputBrand vs $factoryBrand), Loc: $locationScore (conflict: $hasSpecificLocationConflict, shared: ${sharedSpecificLocs.join(',')})',
    );
  }

  /// Tìm nhà máy phù hợp nhất từ danh sách các nhà máy hoạt động trong DB
  static BestMatchResult findBestMatch(
    String inputName,
    String inputAddr,
    List<FactoryCandidate> factories,
  ) {
    if (inputName.trim().isEmpty || factories.isEmpty) {
      return const BestMatchResult(
        bestMatch: null,
        score: 0,
        brandScore: 0,
        locationScore: 0,
        details: 'No input name or empty factory list',
      );
    }

    // Đếm số cơ sở của từng thương hiệu trong DB để biết cơ sở đơn hay đa cơ sở
    final brandCounts = <String, int>{};
    for (final f in factories) {
      final b = extractCoreBrand(f.tenNhaMay);
      brandCounts[b] = (brandCounts[b] ?? 0) + 1;
    }

    FactoryCandidate? bestMatch;
    int highestScore = 0;
    int bestBrandScore = 0;
    int bestLocationScore = 0;
    String bestDetails = '';

    for (final factory in factories) {
      final fBrand = extractCoreBrand(factory.tenNhaMay);
      final isSingleBranch = (brandCounts[fBrand] ?? 1) == 1;

      final result = calculateMatchScore(inputName, inputAddr, factory, isSingleBranch);

      if (result.score > highestScore) {
        highestScore = result.score;
        bestMatch = factory;
        bestBrandScore = result.brandScore;
        bestLocationScore = result.locationScore;
        bestDetails = result.details;
      }
    }

    return BestMatchResult(
      bestMatch: bestMatch,
      score: highestScore,
      brandScore: bestBrandScore,
      locationScore: bestLocationScore,
      details: bestDetails,
    );
  }

  /// Helper chuyển tên công ty về Title Case (viết hoa chữ cái đầu mỗi từ)
  static String toTitleCase(String str) {
    if (str.trim().isEmpty) return '';
    return str
        .toLowerCase()
        .replaceAllMapped(
          RegExp(r'(?:^|\s)\S'),
          (match) => match.group(0)?.toUpperCase() ?? '',
        )
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }
}
