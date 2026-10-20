export interface FactoryCandidate {
  id: number;
  ten_nha_may: string;
  dia_chi?: string | null;
}

export interface MatchScoreResult {
  score: number;
  brandScore: number;
  locationScore: number;
  inputBrand: string;
  factoryBrand: string;
  details: string;
}

export interface BestMatchResult {
  bestMatch: FactoryCandidate | null;
  score: number;
  brandScore: number;
  locationScore: number;
  details: string;
}

export class CompanyMatcher {
  // Danh mục các địa danh, KCN, quận huyện cụ thể (loại trừ các từ chung chung như tp hcm, ha noi)
  private static readonly SPECIFIC_LOCATIONS: string[] = [
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

  private static readonly GENERIC_CITIES: string[] = [
    'tp hcm',
    'tphcm',
    'ho chi minh',
    'sai gon',
    'ha noi',
    'viet nam',
  ];

  private static readonly ADMIN_WORDS_REGEX =
    /\b(so|duong|quoc lo|ql|tinh lo|tl|khu pho|kp|ap|phuong|p|xa|thi tran|tt|quan|q|huyen|thi xa|tx|tinh|thanh pho|tp|kcn|khu cong nghiep|cum cong nghiep|lo|khu|tang|toa nha)\b/g;

  /**
   * Chuan hoa chuoi thô:
   * 1. Bo dau tieng Viet (NFD + d/D).
   * 2. Nhan dien viet tat co dau cham dac biet (VD: C.P.).
   * 3. Gop cac chu cai don cach nhau boi dau cham (VD: T.N.H.H -> TNHH).
   * 4. Thay the cac dau cau con lai thanh khoang trang.
   * 5. Chuyen chu thuong, rut gon khoang trang thua.
   */
  public static cleanString(str: string): string {
    if (!str) return '';

    let s = str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');

    // Nhan dien C.P. co dau cham de bao ve thuong hieu C.P. (Charoen Pokphand)
    const hasDottedCP = /\bc\.p\b/i.test(s) || /\bc\.p\./i.test(s);

    // Gop cac chu cai don cach nhau boi dau cham (VD: T.N.H.H. -> TNHH)
    s = s.replace(/\b([a-zA-Z])\.(?=[a-zA-Z]\b|\s|$)/g, '$1');

    // Chuyen toan bo ky tu phan tach con lai thanh khoang trang
    s = s.replace(/[.,\-_/&()+:;*"'\\\[\]{}<>?~`!@#$%^=]/g, ' ');

    s = s.toLowerCase().replace(/\s+/g, ' ').trim();

    // Neu ban dau co C.P. co dau cham, danh dau rieng de khong bi xoa boi stopword 'cp'
    if (hasDottedCP) {
      s = s.replace(/\bcp\b/g, 'cp_brand');
    }

    return s;
  }

  /**
   * Bóc tách Từ khóa Thương hiệu Lõi (Core Brand):
   * - Loai bo toan bo Stopwords doanh nghiep (VN & Quoc te).
   * - Bóc tách va loai bo ca hau to chi nhanh neu sinh vien go kem vao ten (VD: "Acecook Tan Binh" -> "acecook").
   * - Co che Fallback: Neu sau khi loc ma chuoi bi rong hoac < 2 ky tu,
   *   fallback ve chuoi chi cat bo tien to doanh nghiep o dau chuoi de giu lai phan than.
   */
  public static extractCoreBrand(name: string): string {
    const cleaned = this.cleanString(name);
    if (!cleaned) return '';

    // Regex tu dung phap ly
    const STOPWORDS_REGEX =
      /\b(cong ty|cty|co phan|ctcp|tnhh|mtv|mot thanh vien|1 thanh vien|1 tv|mot tv|tap doan|doanh nghiep|tong cong ty|tct|nha may|chi nhanh|cn|co so|viet nam|vietnam|vn|jsc|ltd|co ltd|corp|corporation|inc|group|holding|holdings|global)\b/g;

    // Chi loai bo 'cp' neu khong phai la 'cp_brand' va dung sau 'cong ty'/'cty'
    let brand = cleaned.replace(STOPWORDS_REGEX, ' ');

    // Neu co 'co phan' da xuat hien, thi 'cp' con lai la brand chu khong phai loai hinh
    if (!cleaned.includes('co phan')) {
      brand = brand.replace(/\bcp\b/g, ' ');
    }

    brand = brand.replace(/\bcp_brand\b/g, 'cp');
    brand = brand.replace(/\s+/g, ' ').trim();

    // Loai bo cac hau to dia danh chi nhanh nam o cuoi ten (VD: "acecook tan binh" -> "acecook")
    for (const loc of this.SPECIFIC_LOCATIONS) {
      const locPattern = new RegExp(`\\b${loc}\\b$`, 'g');
      if (locPattern.test(brand) && brand.length > loc.length + 3) {
        brand = brand.replace(locPattern, '').trim();
        break;
      }
    }

    if (!brand || brand.length < 2) {
      // Fallback: Chi cat tien to doanh nghiep o dau chuoi
      brand = cleaned
        .replace(/^(cong ty|cty|co phan|cp|ctcp|tnhh|mtv|nha may|chi nhanh|doanh nghiep|tap doan|\s)+/g, '')
        .replace(/\bcp_brand\b/g, 'cp')
        .trim();
    }

    return brand || cleaned;
  }

  /**
   * Rút gọn tên nhà máy dùng cho mã / nội dung chuyển khoản (tối đa maxLength ký tự, mặc định 10)
   * Loại bỏ các từ pháp lý, chi nhánh, ngành nghề phổ biến để giữ lại thương hiệu đặc trưng ngắn gọn.
   */
  public static shortenFactoryName(factoryName: string, maxLength: number = 10): string {
    if (!factoryName) return 'NM';
    let brand = this.extractCoreBrand(factoryName);
    const extraIndustryWords =
      /\b(nuoc giai khat|thuc pham|san xuat|thuong mai|dich vu|che bien|nha may|sua|bia|ruou|banh keo|chan nuoi)\b/gi;
    brand = brand.replace(extraIndustryWords, ' ');
    let clean = brand
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
    if (!clean || clean.length < 2) {
      clean = factoryName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
    }
    return clean.substring(0, maxLength);
  }

  /**
   * Bóc tách cac tu khoa dia danh cu the (KCN, quan huyen, tinh thanh)
   */
  public static extractSpecificLocations(text: string): string[] {
    const cleaned = this.cleanString(text);
    if (!cleaned) return [];

    const matched: string[] = [];
    for (const loc of this.SPECIFIC_LOCATIONS) {
      if (cleaned.includes(loc)) {
        matched.push(loc);
      }
    }
    return matched;
  }

  /**
   * Bóc tách thanh pho / vung chung chung (TP.HCM, Ha Noi)
   */
  public static extractGenericCities(text: string): string[] {
    const cleaned = this.cleanString(text);
    if (!cleaned) return [];

    const matched: string[] = [];
    for (const city of this.GENERIC_CITIES) {
      if (cleaned.includes(city)) {
        matched.push(city);
      }
    }
    return matched;
  }

  /**
   * Bóc tách cac token dong tu dia chi (sau khi loai bo tu hanh chinh pho bien)
   */
  public static extractDynamicAddressTokens(address: string): string[] {
    const cleaned = this.cleanString(address);
    if (!cleaned) return [];

    const withoutAdmin = cleaned.replace(this.ADMIN_WORDS_REGEX, ' ').replace(/\s+/g, ' ').trim();
    if (!withoutAdmin) return [];

    return withoutAdmin
      .split(' ')
      .filter((w) => w.length >= 3 && !/^\d+$/.test(w));
  }

  /**
   * Thuat toan khoang cach Levenshtein giua 2 chuoi
   */
  public static levenshteinDistance(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    let v0 = new Array(b.length + 1);
    let v1 = new Array(b.length + 1);

    for (let i = 0; i <= b.length; i++) {
      v0[i] = i;
    }

    for (let i = 0; i < a.length; i++) {
      v1[0] = i + 1;

      for (let j = 0; j < b.length; j++) {
        const cost = a[i] === b[j] ? 0 : 1;
        v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
      }

      for (let j = 0; j <= b.length; j++) {
        v0[j] = v1[j];
      }
    }

    return v1[b.length];
  }

  /**
   * Do tuong dong Fuzzy Levenshtein [0.0 - 1.0]
   */
  public static fuzzySimilarity(a: string, b: string): number {
    if (!a && !b) return 1.0;
    if (!a || !b) return 0.0;
    if (a === b) return 1.0;

    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1.0;

    const dist = this.levenshteinDistance(a, b);
    return Math.max(0, 1 - dist / maxLen);
  }

  /**
   * Chấm điểm So khớp giua Đề xuất cua SV va mot Nhà máy trong DB:
   * Score = BrandScore * 0.6 + LocationScore * 0.4
   */
  public static calculateMatchScore(
    inputName: string,
    inputAddr: string,
    factory: FactoryCandidate,
    isSingleBranchInDb: boolean,
  ): MatchScoreResult {
    const inputBrand = this.extractCoreBrand(inputName);
    const factoryBrand = this.extractCoreBrand(factory.ten_nha_may);

    // 1. Tinh BrandScore (0 - 100)
    let brandScore = 0;
    const inputWords = inputBrand.split(' ').filter(Boolean);
    const factoryWords = factoryBrand.split(' ').filter(Boolean);
    const wordDiff = Math.abs(inputWords.length - factoryWords.length);

    if (inputBrand === factoryBrand) {
      brandScore = 100;
    } else if (inputWords.length === 1 && factoryWords.includes(inputWords[0])) {
      // Truong hop input la thuong hieu loi don le (VD: 'cp', 'fpt', 'vng') nam tron ven trong ten nha may
      brandScore = 80;
    } else {
      const sim = this.fuzzySimilarity(inputBrand, factoryBrand);
      const simScore = Math.round(sim * 100);

      // Chong gop nham thuong hieu la tap con (VD: "tan a dai thanh" vs "dai thanh")
      if (inputWords.length > factoryWords.length && wordDiff >= 2) {
        brandScore = simScore; // Bat buoc chi lay diem Levenshtein toan chuoi
      } else {
        if (sim >= 0.8) {
          // Xu ly cac loi go sai 1 ky tu (aceook, ajnomoto, yakut...)
          brandScore = Math.max(85, simScore);
        } else if (
          (inputBrand.includes(factoryBrand) || factoryBrand.includes(inputBrand)) &&
          Math.min(inputBrand.length, factoryBrand.length) >= 2
        ) {
          brandScore = 75;
        } else {
          brandScore = simScore;
        }
      }
    }

    // 2. Tinh LocationScore (0 - 100)
    let locationScore = 0;

    // Quet dia danh 2 chieu: Ca tu Ten va Dia chi sinh vien nhap
    const inputFullText = `${inputName} ${inputAddr}`;
    const factoryFullText = `${factory.ten_nha_may} ${factory.dia_chi || ''}`;

    const inputSpecificLocs = this.extractSpecificLocations(inputFullText);
    const factorySpecificLocs = this.extractSpecificLocations(factoryFullText);

    const inputGenericCities = this.extractGenericCities(inputFullText);
    const factoryGenericCities = this.extractGenericCities(factoryFullText);

    // Kiem tra trung dia danh KCN / quan huyen cu the
    const sharedSpecificLocs = inputSpecificLocs.filter((loc) =>
      factorySpecificLocs.includes(loc),
    );

    // Kiem tra mau thuan chi nhanh ro rang (VD: SV nhap Binh Duong nhung NM o Tan Binh TP.HCM, hoac Quan 10 vs Quan 5)
    const hasSpecificLocationConflict =
      inputSpecificLocs.length > 0 &&
      factorySpecificLocs.length > 0 &&
      sharedSpecificLocs.length === 0;

    // Kiem tra trung thanh pho chung chung (TP.HCM, Ha Noi)
    const sharedGenericCity = inputGenericCities.some((c) =>
      factoryGenericCities.includes(c),
    );

    if (hasSpecificLocationConflict) {
      // Uu tien hang dau: Mau thuan chi nhanh ro ret -> 0 diem tuyet doi
      locationScore = 0;
    } else if (sharedSpecificLocs.length > 0) {
      // Khop dia danh chi nhanh / KCN / quan huyen cu the -> 100 diem
      locationScore = 100;
    } else if (sharedGenericCity || isSingleBranchInDb) {
      // Khong mau thuan, chi trung thanh pho chung chung hoac nha may chi co 1 co so -> 50 diem
      locationScore = 50;
    } else {
      locationScore = 30;
    }

    // 3. Tong diem Score
    let finalScore = Math.round(brandScore * 0.6 + locationScore * 0.4);

    // RANG BUOC AN TOAN: Neu BrandScore < 70 (thuong hieu chua tuong dong cao nhu Tan A Dai Thanh vs Dai Thanh),
    // tuyet doi khong duoc vuot nguong auto-match 75 chi vi cung o TP.HCM!
    if (brandScore < 70) {
      finalScore = Math.min(finalScore, 65);
    }

    return {
      score: finalScore,
      brandScore,
      locationScore,
      inputBrand,
      factoryBrand,
      details: `Brand: ${brandScore} (sim: ${inputBrand} vs ${factoryBrand}), Loc: ${locationScore} (conflict: ${hasSpecificLocationConflict}, shared: ${sharedSpecificLocs.join(',')})`,
    };
  }

  /**
   * Tim nha may phu hop nhat tu danh sach cac nha may hoat dong trong DB
   */
  public static findBestMatch(
    inputName: string,
    inputAddr: string,
    factories: FactoryCandidate[],
  ): BestMatchResult {
    if (!inputName || factories.length === 0) {
      return {
        bestMatch: null,
        score: 0,
        brandScore: 0,
        locationScore: 0,
        details: 'No input name or empty factory list',
      };
    }

    // Dem so co so cua tung thuong hieu trong DB de biet co so don hay da co so
    const brandCounts = new Map<string, number>();
    for (const f of factories) {
      const b = this.extractCoreBrand(f.ten_nha_may);
      brandCounts.set(b, (brandCounts.get(b) || 0) + 1);
    }

    let bestMatch: FactoryCandidate | null = null;
    let highestScore = 0;
    let bestBrandScore = 0;
    let bestLocationScore = 0;
    let bestDetails = '';

    for (const factory of factories) {
      const fBrand = this.extractCoreBrand(factory.ten_nha_may);
      const isSingleBranch = (brandCounts.get(fBrand) || 1) === 1;

      const result = this.calculateMatchScore(inputName, inputAddr, factory, isSingleBranch);

      if (result.score > highestScore) {
        highestScore = result.score;
        bestMatch = factory;
        bestBrandScore = result.brandScore;
        bestLocationScore = result.locationScore;
        bestDetails = result.details;
      }
    }

    return {
      bestMatch,
      score: highestScore,
      brandScore: bestBrandScore,
      locationScore: bestLocationScore,
      details: bestDetails,
    };
  }

  /**
   * Helper chuyen ten cong ty ve Title Case (viet hoa chu cai dau moi tu)
   */
  public static toTitleCase(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase())
      .replace(/\s+/g, ' ')
      .trim();
  }
}
