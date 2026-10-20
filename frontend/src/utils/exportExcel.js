import * as XLSX from 'xlsx';

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export const getHoDemAndTen = (hoTen = '') => {
  const parts = String(hoTen || '').trim().split(' ');
  const ten = parts.pop() || '';
  const hoDem = parts.join(' ');
  return { hoDem, ten };
};

const sanitizeFileName = (name = '') => {
  return String(name).replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1EA0-\u1EF9]/gi, '_');
};

/**
 * MẪU 1: Dữ liệu điểm quá trình TQNM (Ma trận điểm)
 * Bám sát file mẫu: Dữ liệu điểm quá trình TQNM 2024-2025.xlsx
 */
export const exportDiemQuaTrinh = (results, tenLich = '') => {
  const maxTrips = Math.max(1, ...results.map(r => r.trips?.length || 0));

  // Tiêu đề trường viện
  const row0 = ['BỘ CÔNG THƯƠNG', '', '', '', '', '', 'TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH - KHOA CÔNG NGHỆ THỰC PHẨM'];
  const row1 = [' ', ' ', 'TỔNG HỢP TÌNH HÌNH SINH VIÊN THAM QUAN NHÀ MÁY'];
  const row2 = [' ', ' ', tenLich ? `Lịch kiến tập / Đợt: ${tenLich}` : ''];

  // Hàng tiêu đề 1 (Row index 3)
  const header1 = ['STT', 'MSSV', 'HỌ VÀ TÊN', '', 'LỚP', 'SỐ LƯỢNG'];
  // Hàng tiêu đề 2 (Row index 4)
  const header2 = ['', '', '', '', '', ''];
  // Hàng đánh số cột (Row index 5)
  const header3 = ['(1)', '(2)', '(3)', '', '(4)', '(5)'];

  for (let i = 0; i < maxTrips; i++) {
    header1.push(`NHÀ MÁY THAM QUAN ${i + 1}`, '', '', '', '');
    header2.push('TÊN', 'THỜI GIAN', 'HÌNH THỨC', 'ĐIỂM', 'ĐIỂM CỘNG');
    header3.push(`(${6 + i * 5})`, '', '', '', '');
  }

  const data = [row0, row1, row2, header1, header2, header3];
  const merges = [
    { s: { r: 1, c: 2 }, e: { r: 1, c: 10 } }, // Merge Title
    { s: { r: 2, c: 2 }, e: { r: 2, c: 10 } }, // Merge Subtitle
    { s: { r: 3, c: 2 }, e: { r: 3, c: 3 } }, // Merge "HỌ VÀ TÊN"
    { s: { r: 5, c: 2 }, e: { r: 5, c: 3 } },
  ];

  for (let i = 0; i < maxTrips; i++) {
    const startCol = 6 + i * 5;
    merges.push({
      s: { r: 3, c: startCol },
      e: { r: 3, c: startCol + 4 }
    });
  }

  results.forEach((r, idx) => {
    const sv = r.sinhVien || {};
    const { hoDem, ten } = getHoDemAndTen(sv.ho_ten);
    const trips = r.trips || [];

    const row = [
      idx + 1,
      sv.mssv,
      hoDem,
      ten,
      sv.ten_lop || sv.lop || '',
      trips.length
    ];

    for (let i = 0; i < maxTrips; i++) {
      const trip = trips[i];
      if (trip) {
        const diemTongHop = trip.diem_chuan_bi ?? trip.diem_tong ?? trip.diem_tong_chuyen ?? '';
        row.push(
          trip.ten_nha_may || trip.nhaMay || '',
          trip.ngay_tham_quan ? formatDate(trip.ngay_tham_quan) : '',
          trip.hinh_thuc === 'TrucTiep' ? 'Offline' : (trip.hinh_thuc === 'TrucTuyen' || trip.hinh_thuc === 'Online' ? 'Online' : trip.hinh_thuc || ''),
          diemTongHop,
          trip.diem_cong ?? ''
        );
      } else {
        row.push('', '', '', '', '');
      }
    }
    data.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!merges'] = merges;
  
  // Thiết lập độ rộng cột
  const cols = [
    { wch: 6 },  // STT
    { wch: 14 }, // MSSV
    { wch: 18 }, // Họ đệm
    { wch: 10 }, // Tên
    { wch: 14 }, // Lớp
    { wch: 10 }, // Số lượng
  ];
  for (let i = 0; i < maxTrips; i++) {
    cols.push(
      { wch: 28 }, // Tên nhà máy
      { wch: 14 }, // Thời gian
      { wch: 12 }, // Hình thức
      { wch: 10 }, // Điểm
      { wch: 12 }  // Điểm cộng
    );
  }
  ws['!cols'] = cols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DiemQuaTrinh');
  XLSX.writeFile(wb, `DiemQuaTrinh_${sanitizeFileName(tenLich || 'TongHop')}.xlsx`);
};

/**
 * MẪU 2: Danh sách phẳng TQNM
 * Bám sát file mẫu: Mau chuan 15.3.26.xlsx (Sheet Dang ky_off)
 */
export const exportDanhSachPhang = (results, tenLich = '') => {
  const data = [];
  data.push(['DANH SÁCH SINH VIÊN THAM QUAN NHÀ MÁY']);
  data.push([tenLich ? `Lịch kiến tập: ${tenLich}` : '']);
  data.push([
    'STT', 'MSSV', 'Họ và tên', 'Lớp', 'Chữ kí', 'Mã nhà máy', 'Ngày TQNM', 
    'Mã chuyến', 'Tên NM', 'Khoá chính (MASV+MANM)', 'Điểm chuẩn bị', 'Điểm thu hoạch', 'Điểm BC hội đồng', 
    'Điểm thưởng', 'Tình trạng nộp BC', 'Hình thức đi', 'GV dẫn đoàn', 'Kết quả lọc'
  ]);

  let stt = 1;
  results.forEach((r) => {
    const sv = r.sinhVien || {};
    const trips = r.trips || [];
    
    trips.forEach(trip => {
      const tenNM = trip.ten_nha_may || trip.nhaMay || '';
      const maNM = trip.ma_nha_may || (tenNM ? tenNM.substring(0, 5).toUpperCase().replace(/[^A-Z]/g, '') : '');
      const gv = r.giangVienHuongDan?.ho_ten || sv.details?.giangVienHuongDan?.ho_ten || r.gvhd || '';
      const hasReport = trip.diem_thu_hoach != null || trip.diem_bao_cao != null;
      
      data.push([
        stt++,
        sv.mssv,
        sv.ho_ten,
        sv.ten_lop || sv.lop || '',
        '', // Chữ kí
        maNM,
        trip.ngay_tham_quan ? formatDate(trip.ngay_tham_quan) : '',
        trip.ma_chuyen_tham_quan || trip.ma_chuyen || '',
        tenNM,
        `${sv.mssv}-${maNM}`,
        trip.diem_chuan_bi ?? '',
        trip.diem_thu_hoach ?? trip.diem_bao_cao ?? '',
        trip.diem_bao_cao_hoi_dong ?? trip.diem_hoi_dong ?? trip.diem_hoi_dong_final ?? '',
        trip.diem_cong ?? '',
        hasReport ? 'Đã nộp' : 'Chưa nộp',
        trip.hinh_thuc === 'TrucTiep' ? 'trực tiếp (offline)' : (trip.hinh_thuc === 'TrucTuyen' || trip.hinh_thuc === 'Online' ? 'trực tuyến (online)' : trip.hinh_thuc || ''),
        trip.giangVienDanDoan || gv || '',
        'Hợp lệ'
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 10 },
    { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 22 },
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 16 },
    { wch: 20 }, { wch: 22 }, { wch: 14 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DangKy_TQNM');
  XLSX.writeFile(wb, `DanhSachTQNM_${sanitizeFileName(tenLich || 'TongHop')}.xlsx`);
};

/**
 * MẪU 3: Tổng hợp kết quả Kiến tập (Gửi SV kiểm tra)
 * Bám sát 100% cấu trúc 4 Sheet của file mẫu:
 * TaiLieu/Dữ liệu Kien tap 24-25 (Gửi SV kiểm tra).xlsx
 */
export const exportTongHopKienTap = (results = [], tenLich = '') => {
  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------------------
  // SHEET 1: Tổng 24-25 (DANH SÁCH SINH VIÊN THỰC HIỆN HỌC PHẦN KIẾN TẬP)
  // -------------------------------------------------------------------------
  const sheet1Data = [];
  sheet1Data.push(['DANH SÁCH SINH VIÊN THỰC HIỆN HỌC PHẦN KIẾN TẬP']);
  sheet1Data.push([tenLich ? `Đợt kiến tập: ${tenLich}` : 'Năm học 2024-2025']);
  sheet1Data.push([
    'STT', 'Mã HS-SV', 'Họ đệm', 'Tên', 'Lớp học', 'GVHD', 
    'Số nhà máy TQ offline do khoa tổ chức', 'Số lần nộp báo cáo', 'Ghi chú'
  ]);

  results.forEach((r, idx) => {
    const sv = r.sinhVien || r;
    const { hoDem, ten } = getHoDemAndTen(sv.ho_ten);
    const trips = r.trips || [];
    
    const offlineTrips = trips.filter(t => t.hinh_thuc === 'TrucTiep' || String(t.hinh_thuc).toLowerCase().includes('off'));
    const soNMOffline = r.so_nm_off !== undefined ? r.so_nm_off : offlineTrips.length;
    const reportsCount = trips.filter(t => t.diem_thu_hoach != null || t.diem_bao_cao != null || t.hasReport).length;
    const gvhd = r.giangVienHuongDan?.ho_ten || sv.details?.giangVienHuongDan?.ho_ten || r.gvhd || '';

    sheet1Data.push([
      idx + 1,
      sv.mssv || '',
      hoDem,
      ten,
      sv.ten_lop || sv.lop || '',
      gvhd,
      soNMOffline,
      reportsCount,
      r.ghi_chu || ''
    ]);
  });

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }
  ];
  ws1['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Mã HS-SV
    { wch: 18 }, // Họ đệm
    { wch: 10 }, // Tên
    { wch: 14 }, // Lớp học
    { wch: 22 }, // GVHD
    { wch: 36 }, // Số NM offline
    { wch: 22 }, // Số lần nộp BC
    { wch: 20 }  // Ghi chú
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Tổng 24-25');

  // -------------------------------------------------------------------------
  // SHEET 2: Dữ liệu TQNM (TỔNG HỢP TÌNH HÌNH SINH VIÊN THAM QUAN NHÀ MÁY)
  // -------------------------------------------------------------------------
  const sheet2Data = [];
  sheet2Data.push(['TỔNG HỢP TÌNH HÌNH SINH VIÊN THAM QUAN NHÀ MÁY']);
  sheet2Data.push([]);
  
  // Header tầng 1
  sheet2Data.push([
    'STT', 'MSSV', 'Họ đệm', 'Tên', 'LỚP', 'SỐ LƯỢNG',
    'NHÀ MÁY THAM QUAN 1', '', '', '', '',
    'NHÀ MÁY THAM QUAN 2', '', '', '', '',
    'NHÀ MÁY THAM QUAN 3', '', '', '', '',
    'NHÀ MÁY THAM QUAN 4', '', '', '', '',
    'NHÀ MÁY THAM QUAN 5', '', '', '', ''
  ]);
  // Header tầng 2
  sheet2Data.push([
    '', '', '', '', '', '',
    'TÊN', 'THỜI GIAN', 'HÌNH THỨC', 'ĐIỂM', 'ĐIỂM CỘNG',
    'TÊN', 'THỜI GIAN', 'HÌNH THỨC', 'ĐIỂM', 'ĐIỂM CỘNG',
    'TÊN', 'THỜI GIAN', 'HÌNH THỨC', 'ĐIỂM', 'ĐIỂM CỘNG',
    'TÊN', 'THỜI GIAN', 'HÌNH THỨC', 'ĐIỂM', 'ĐIỂM CỘNG',
    'TÊN', 'THỜI GIAN', 'HÌNH THỨC', 'ĐIỂM', 'ĐIỂM CỘNG'
  ]);

  results.forEach((r, idx) => {
    const sv = r.sinhVien || r;
    const { hoDem, ten } = getHoDemAndTen(sv.ho_ten);
    const trips = r.trips || [];

    const row = [
      idx + 1,
      sv.mssv || '',
      hoDem,
      ten,
      sv.ten_lop || sv.lop || '',
      trips.length
    ];

    // Điền dữ liệu tối đa 5 nhà máy
    for (let i = 0; i < 5; i++) {
      const trip = trips[i];
      if (trip) {
        const factory = trip.nhaMay || trip.ten_nha_may || trip.ten_chuyen || '';
        const tripDate = trip.ngay_tham_quan ? formatDate(trip.ngay_tham_quan) : '';
        const formStr = trip.hinh_thuc === 'TrucTiep' ? 'Offline' : (trip.hinh_thuc === 'TrucTuyen' ? 'Online' : trip.hinh_thuc || '');
        const score = trip.diem_tong ?? trip.diem_tong_chuyen ?? (trip.diem_thu_hoach != null ? trip.diem_thu_hoach : '');
        const bonus = trip.diem_cong ?? '';
        row.push(factory, tripDate, formStr, score, bonus);
      } else {
        row.push('', '', '', '', '');
      }
    }
    sheet2Data.push(row);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } },
    { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
    { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
    { s: { r: 2, c: 2 }, e: { r: 3, c: 2 } },
    { s: { r: 2, c: 3 }, e: { r: 3, c: 3 } },
    { s: { r: 2, c: 4 }, e: { r: 3, c: 4 } },
    { s: { r: 2, c: 5 }, e: { r: 3, c: 5 } },
    { s: { r: 2, c: 6 }, e: { r: 2, c: 10 } },
    { s: { r: 2, c: 11 }, e: { r: 2, c: 15 } },
    { s: { r: 2, c: 16 }, e: { r: 2, c: 20 } },
    { s: { r: 2, c: 21 }, e: { r: 2, c: 25 } },
    { s: { r: 2, c: 26 }, e: { r: 2, c: 30 } }
  ];
  ws2['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 10 },
    { wch: 24 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 10 },
    { wch: 24 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 10 },
    { wch: 24 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 10 },
    { wch: 24 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 10 },
    { wch: 24 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 10 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Dữ liệu TQNM');

  // -------------------------------------------------------------------------
  // SHEET 3: Nộp báo cáo (CHI TIẾT TỪNG BÀI NỘP THU HOẠCH)
  // -------------------------------------------------------------------------
  const sheet3Data = [];
  sheet3Data.push([`Dữ liệu xuất lúc ${new Date().toLocaleDateString('vi-VN')} - Đợt: ${tenLich || 'Kiến tập'}`]);
  sheet3Data.push([
    'MSSV', 'Họ và tên', 'Lớp', 'Giảng viên hướng dẫn', 
    'Tên nhà máy', 'Loại hình chuyến TQNM', 'Hình thức tham quan nhà máy'
  ]);

  results.forEach(r => {
    const sv = r.sinhVien || r;
    const gvhd = r.giangVienHuongDan?.ho_ten || sv.details?.giangVienHuongDan?.ho_ten || r.gvhd || '';
    const trips = r.trips || [];

    trips.forEach(trip => {
      const factory = trip.nhaMay || trip.ten_nha_may || trip.ten_chuyen || '';
      const formStr = trip.hinh_thuc === 'TrucTiep' ? 'trực tiếp (offline)' : 'trực tuyến (online)';

      sheet3Data.push([
        sv.mssv || '',
        sv.ho_ten || '',
        sv.ten_lop || sv.lop || '',
        gvhd,
        factory,
        'do Trường tổ chức',
        formStr
      ]);
    });
  });

  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
  ws3['!cols'] = [
    { wch: 14 }, // MSSV
    { wch: 24 }, // Họ và tên
    { wch: 14 }, // Lớp
    { wch: 22 }, // GVHD
    { wch: 36 }, // Tên nhà máy
    { wch: 20 }, // Loại hình
    { wch: 24 }  // Hình thức
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Nộp báo cáo');

  // -------------------------------------------------------------------------
  // SHEET 4: Danh sach kem GV (GOM THEO GIẢNG VIÊN HƯỚNG DẪN)
  // -------------------------------------------------------------------------
  const sheet4Data = [];
  sheet4Data.push(['STT', 'Mã SV', 'Họ đệm', 'Tên', 'Tên lớp', 'GVHD', 'Ghi chú']);

  // Sắp xếp sinh viên theo GVHD
  const sortedByGV = [...results].sort((a, b) => {
    const gvA = a.giangVienHuongDan?.ho_ten || a.gvhd || '';
    const gvB = b.giangVienHuongDan?.ho_ten || b.gvhd || '';
    return gvA.localeCompare(gvB, 'vi');
  });

  sortedByGV.forEach((r, idx) => {
    const sv = r.sinhVien || r;
    const { hoDem, ten } = getHoDemAndTen(sv.ho_ten);
    const gvhd = r.giangVienHuongDan?.ho_ten || sv.details?.giangVienHuongDan?.ho_ten || r.gvhd || 'Chưa phân công';

    sheet4Data.push([
      idx + 1,
      sv.mssv || '',
      hoDem,
      ten,
      sv.ten_lop || sv.lop || '',
      gvhd,
      r.ghi_chu || ''
    ]);
  });

  const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
  ws4['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Mã SV
    { wch: 18 }, // Họ đệm
    { wch: 10 }, // Tên
    { wch: 14 }, // Tên lớp
    { wch: 24 }, // GVHD
    { wch: 20 }  // Ghi chú
  ];
  XLSX.utils.book_append_sheet(wb, ws4, 'Danh sach kem GV');

  // Xuất file
  XLSX.writeFile(wb, `DuLieuKienTap_${sanitizeFileName(tenLich || 'GuiSV')}.xlsx`);
};

/**
 * MẪU 4: Danh sách sinh viên theo Chuyến tham quan cụ thể (Danh sách đoàn / In điểm danh)
 * Dành cho CLB & Giảng viên dẫn đoàn
 * Bám sát form mẫu: Mau chuan 15.3.26.xlsx (Sheet Dang ky_off)
 */
export const exportDanhSachChuyenThamQuan = (trip = {}, registrations = []) => {
  const data = [];
  const factory = trip.nhaMay?.ten_nha_may || trip.ten_chuyen || 'Chuyến tham quan';
  const tripDate = trip.ngay_tham_quan ? formatDate(trip.ngay_tham_quan) : 'Chưa định ngày';
  const startTime = trip.gio_bat_dau ? ` (${trip.gio_bat_dau})` : '';
  const formStr = trip.hinh_thuc === 'TrucTiep' ? 'Trực tiếp (Offline)' : 'Trực tuyến (Online)';
  const gvdd = trip.assignments?.[0]?.giangVien?.ho_ten || trip.giangVienDanDoan || 'Ban tổ chức CLB';

  data.push(['BỘ CÔNG THƯƠNG', '', '', '', 'TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH - CLB KIẾN TẬP']);
  data.push(['DANH SÁCH SINH VIÊN THAM QUAN NHÀ MÁY (DANH SÁCH ĐOÀN)']);
  data.push([`Doanh nghiệp: ${factory} | Ngày khởi hành: ${tripDate}${startTime} | Hình thức: ${formStr}`]);
  data.push([`Giảng viên dẫn đoàn: ${gvdd} | Điểm tập trung: ${trip.dia_diem_tap_trung || 'Trường ĐH Công Thương TP.HCM'}`]);
  data.push([]);
  data.push([
    'STT', 'MSSV', 'Họ đệm', 'Tên', 'Lớp', 'Số điện thoại', 'Chữ kí xác nhận', 
    'Mã chuyến', 'Tên nhà máy', 'Trạng thái điểm danh', 'Lệ phí', 'Ghi chú'
  ]);

  registrations.forEach((reg, idx) => {
    const sv = reg.sinhVien || {};
    const { hoDem, ten } = getHoDemAndTen(sv.ho_ten);
    const diemDanhStatus = reg.diemDanh?.trang_thai === 'CoMat' 
      ? 'Có mặt' 
      : (reg.diemDanh?.trang_thai === 'Vang' ? 'Vắng mặt' : (reg.diemDanh?.trang_thai === 'TuChoiThamGia' ? 'Từ chối' : 'Chưa điểm danh'));
    const lePhiStatus = trip.le_phi === 0 
      ? 'Miễn phí' 
      : (reg.hoaDon?.trang_thai?.startsWith('DaDong') ? 'Đã nộp' : (reg.hoaDon?.trang_thai === 'DaHoanPhi' ? 'Đã hoàn phí' : 'Chưa nộp'));

    data.push([
      idx + 1,
      sv.mssv || '',
      hoDem,
      ten,
      sv.ten_lop || sv.lop || '',
      sv.so_dien_thoai || sv.sdt || '',
      '', // Cột trống để in danh sách cho SV ký tên
      trip.id ? `CTQ-${String(trip.id).padStart(3, '0')}` : '',
      factory,
      diemDanhStatus,
      lePhiStatus,
      reg.ghi_chu || ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!merges'] = [
    { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 11 } }
  ];
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // MSSV
    { wch: 18 }, // Họ đệm
    { wch: 10 }, // Tên
    { wch: 14 }, // Lớp
    { wch: 14 }, // SĐT
    { wch: 16 }, // Chữ ký
    { wch: 14 }, // Mã chuyến
    { wch: 30 }, // Tên NM
    { wch: 18 }, // Điểm danh
    { wch: 14 }, // Lệ phí
    { wch: 20 }  // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachDoan');
  XLSX.writeFile(wb, `DanhSachDoan_${sanitizeFileName(factory)}_${sanitizeFileName(tripDate)}.xlsx`);
};

/**
 * MẪU 5: Báo cáo danh sách SV Đạt / Không đạt
 */
export const exportDanhSachDatKhongDat = (data = [], tenLich = '') => {
  const rows = [];
  rows.push(['TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH - KHOA CÔNG NGHỆ THỰC PHẨM']);
  rows.push(['BẢNG TỔNG KẾT KẾT QUẢ HỌC PHẦN KIẾN TẬP (ĐẠT / KHÔNG ĐẠT)']);
  rows.push([tenLich ? `Đợt / Lịch kiến tập: ${tenLich}` : '']);
  rows.push([]);
  rows.push(['STT', 'MSSV', 'Họ và tên', 'Lớp', 'Điểm trung bình', 'Kết quả', 'Ghi chú']);

  data.forEach((r, idx) => {
    const sv = r.sinhVien || r;
    const mssv = sv.mssv || r.mssv || '';
    const hoTen = sv.ho_ten || r.ho_ten || '';
    const lop = sv.ten_lop || sv.lop || r.lop || '';

    let lbl = 'Đang học';
    const kq = r.resultValue || r.ket_qua || r.trang_thai;
    if (kq === 'Dat' || kq === 'Đạt') lbl = 'Đạt';
    else if (kq === 'KhongDat' || kq === 'Không đạt') lbl = 'Không Đạt';
    else if (r.resultLabel) lbl = r.resultLabel;

    const diemRaw = r.diem !== null && r.diem !== undefined ? r.diem : r.diem_tong_ket;
    const diemStr = diemRaw !== null && diemRaw !== undefined && !isNaN(diemRaw)
      ? Number(diemRaw).toFixed(2)
      : (lbl === 'Không Đạt' ? '0.00' : 'Chưa chốt');

    rows.push([
      idx + 1,
      mssv,
      hoTen,
      lop,
      diemStr,
      lbl,
      r.ghi_chu || ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!merges'] = [
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }
  ];
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // MSSV
    { wch: 24 }, // Họ và tên
    { wch: 14 }, // Lớp
    { wch: 18 }, // Điểm trung bình
    { wch: 14 }, // Kết quả
    { wch: 20 }  // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'KetQua_Dat_KhongDat');
  XLSX.writeFile(wb, `KetQuaKienTap_${sanitizeFileName(tenLich || 'BaoCao')}.xlsx`);
};

/**
 * MẪU 6: Báo cáo danh sách SV Đủ điều kiện làm báo cáo (>= 2 trực tiếp + >= 1 trực tuyến)
 */
export const exportDanhSachDuDieuKien = (students = [], tenLich = '') => {
  const rows = [];
  rows.push(['TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH - KHOA CÔNG NGHỆ THỰC PHẨM']);
  rows.push(['DANH SÁCH SINH VIÊN ĐỦ ĐIỀU KIỆN LÀM BÁO CÁO VÀ CHẤM HỘI ĐỒNG']);
  rows.push([tenLich ? `Đợt kiến tập: ${tenLich}` : '']);
  rows.push([]);
  rows.push([
    'STT', 'MSSV', 'Họ tên', 'Lớp', 'GVHD', 'Điều kiện báo cáo', 'Hội đồng phân công'
  ]);

  students.forEach((s, idx) => {
    const hdStr = s.hoi_dong 
      ? `Hội đồng ${s.hoi_dong}${s.dia_diem_hd ? ` (${s.dia_diem_hd})` : ''}` 
      : 'Chưa phân công';

    rows.push([
      idx + 1,
      s.mssv || '',
      s.ho_ten || '',
      s.ten_lop || s.lop || '',
      s.gvhd || 'Chưa phân công',
      'Đủ điều kiện (>= 2 TT + >= 1 TL)',
      hdStr
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!merges'] = [
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }
  ];
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // MSSV
    { wch: 24 }, // Họ tên
    { wch: 14 }, // Lớp
    { wch: 22 }, // GVHD
    { wch: 28 }, // Điều kiện báo cáo
    { wch: 24 }  // Hội đồng
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DuDieuKienBaoCao');
  XLSX.writeFile(wb, `DuDieuKien_${sanitizeFileName(tenLich || 'Report')}.xlsx`);
};

/**
 * MẪU 7: Báo cáo danh sách SV Chưa tham quan
 */
export const exportDanhSachChuaThamQuan = (students = [], tenLich = '') => {
  const rows = [];
  rows.push(['TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH - CLB KIẾN TẬP']);
  rows.push(['DANH SÁCH SINH VIÊN CHƯA THAM GIA CHUYẾN THAM QUAN NÀO']);
  rows.push([tenLich ? `Đợt / Lịch: ${tenLich}` : '']);
  rows.push([]);
  rows.push(['STT', 'MSSV', 'Họ tên', 'Lớp', 'Khóa học', 'Email', 'Số điện thoại', 'Tình trạng']);

  students.forEach((s, idx) => {
    rows.push([
      idx + 1,
      s.mssv || '',
      s.ho_ten || '',
      s.ten_lop || s.lop || '',
      s.khoaHoc?.ten_khoa_hoc || '',
      s.email || '',
      s.so_dien_thoai || s.sdt || '',
      'Chưa tham gia chuyến nào (Cần nhắc nhở)'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 16 }, { wch: 28 }, { wch: 16 }, { wch: 30 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ChuaThamQuan');
  XLSX.writeFile(wb, `ChuaThamQuan_${sanitizeFileName(tenLich || 'Report')}.xlsx`);
};

/**
 * MẪU 8: Báo cáo danh sách SV Nợ môn học phần kiến tập (Các khóa cũ chưa đạt)
 */
export const exportDanhSachHocLai = (students = [], tenDot = '') => {
  const rows = [];
  rows.push(['TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH - KHOA CÔNG NGHỆ THỰC PHẨM']);
  rows.push(['DANH SÁCH SINH VIÊN NỢ MÔN HỌC PHẦN KIẾN TẬP (CÁC KHÓA CŨ CHƯA ĐẠT)']);
  rows.push(['Phạm vi: Toàn thể sinh viên các khóa cũ chưa hoàn thành học phần']);
  rows.push([]);
  rows.push(['STT', 'MSSV', 'Họ và tên', 'Lớp', 'Khóa học', 'Email', 'Tình trạng', 'Ghi chú / Tình trạng học vụ']);

  students.forEach((s, idx) => {
    rows.push([
      idx + 1,
      s.mssv || '',
      s.ho_ten || '',
      s.ten_lop || s.lop || '',
      s.khoaHoc?.ten_khoa_hoc || '',
      s.email || '',
      s.phan_loai_label || 'Nợ môn',
      s.ly_do || 'Nợ học phần kiến tập (Cần học lại)'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!merges'] = [
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }
  ];
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // MSSV
    { wch: 24 }, // Họ và tên
    { wch: 14 }, // Lớp
    { wch: 16 }, // Khóa
    { wch: 28 }, // Email
    { wch: 16 }, // Tình trạng
    { wch: 42 }  // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SV_NoMon_KienTap');
  XLSX.writeFile(wb, `DanhSach_SinhVien_NoMon_KienTap.xlsx`);
};

/**
 * MẪU 9: Báo cáo tổng hợp Chuyến tham quan (CLB)
 */
export const exportBaoCaoTongHopChuyenThamQuan = (trips = []) => {
  const rows = [];
  rows.push(['TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH - CLB KIẾN TẬP']);
  rows.push(['BÁO CÁO TỔNG HỢP VẬN HÀNH CÁC CHUYẾN THAM QUAN']);
  rows.push([]);
  rows.push(['STT', 'Mã chuyến', 'Tên chuyến / Doanh nghiệp', 'Ngày tham quan', 'Giờ', 'Hình thức', 'Sức chứa', 'Đã đăng ký', 'Thực tế tham gia', 'Trạng thái']);

  trips.forEach((t, idx) => {
    rows.push([
      idx + 1,
      t.id || `CTQ-${t.rawId}`,
      t.name || t.factory || '',
      t.date || '',
      t.gio_bat_dau || '',
      t.hinh_thuc || 'Trực tiếp',
      t.sucChua || t.suc_chua || '',
      t.registeredCount ?? '',
      t.actualCount ?? '',
      t.status || ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 32 }, { wch: 16 }, { wch: 10 },
    { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 16 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'TongHopChuyen');
  XLSX.writeFile(wb, `BaoCaoTongHopChuyenThamQuan.xlsx`);
};
