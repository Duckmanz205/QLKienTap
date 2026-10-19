import * as XLSX from 'xlsx';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const getHoDemAndTen = (hoTen = '') => {
  const parts = hoTen.trim().split(' ');
  const ten = parts.pop() || '';
  const hoDem = parts.join(' ');
  return { hoDem, ten };
};

// Mẫu 1: Dữ liệu điểm quá trình TQNM
export const exportDiemQuaTrinh = (results, tenLich = '') => {
  const maxTrips = Math.max(1, ...results.map(r => r.trips?.length || 0));

  // Prepare header rows
  const header1 = ['STT', 'MSSV', 'Họ đệm', 'Tên', 'Lớp'];
  const header2 = ['(1)', '(2)', '(3)', '(4)', '(5)'];
  
  for (let i = 0; i < maxTrips; i++) {
    header1.push('TÊN', 'THỜI GIAN', 'HÌNH THỨC', 'ĐIỂM CB', 'ĐIỂM TH', 'ĐIỂM BC HỘI ĐỒNG', 'ĐIỂM CỘNG', 'TỔNG ĐIỂM');
    header2.push('', '', '', '', '', '', '', '');
  }

  const data = [header1, header2];

  results.forEach((r, idx) => {
    const sv = r.sinhVien || {};
    const { hoDem, ten } = getHoDemAndTen(sv.ho_ten);
    const row = [
      idx + 1,
      sv.mssv,
      hoDem,
      ten,
      sv.ten_lop || ''
    ];

    const trips = r.trips || [];
    for (let i = 0; i < maxTrips; i++) {
      const trip = trips[i];
      if (trip) {
        row.push(
          trip.ten_nha_may || trip.nhaMay || '',
          trip.ngay_tham_quan ? formatDate(trip.ngay_tham_quan) : '',
          trip.hinh_thuc === 'TrucTiep' ? 'Offline' : (trip.hinh_thuc === 'TrucTuyen' || trip.hinh_thuc === 'Online' ? 'Online' : trip.hinh_thuc || ''),
          trip.diem_chuan_bi ?? '',
          trip.diem_thu_hoach ?? trip.diem_bao_cao ?? '',
          trip.diem_bao_cao_hoi_dong ?? trip.diem_hoi_dong ?? trip.diem_hoi_dong_final ?? '',
          trip.diem_cong ?? '',
          trip.diem_tong ?? trip.diem_tong_nm ?? ''
        );
      } else {
        row.push('', '', '', '', '', '', '', '');
      }
    }
    data.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DiemQuaTrinh');
  XLSX.writeFile(wb, `DiemQuaTrinh_${tenLich.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
};

// Mẫu 2: Danh sách phẳng TQNM
export const exportDanhSachPhang = (results, tenLich = '') => {
  const data = [];
  // Headers
  data.push(['DANH SÁCH SINH VIÊN THAM QUAN NHÀ MÁY']);
  data.push([]);
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
      const maNM = tenNM ? tenNM.substring(0, 5).toUpperCase().replace(/[^A-Z]/g, '') : '';
      const gv = r.giangVienHuongDan?.ho_ten || sv.details?.giangVienHuongDan?.ho_ten || r.gvhd || ''; // Fallback GVHD
      const hasReport = trip.diem_thu_hoach != null || trip.diem_bao_cao != null;
      
      data.push([
        stt++,
        sv.mssv,
        sv.ho_ten,
        sv.ten_lop || '',
        '', // Chữ kí
        maNM,
        trip.ngay_tham_quan ? formatDate(trip.ngay_tham_quan) : '',
        trip.ma_chuyen_tham_quan || '', // Mã chuyến
        tenNM,
        `${sv.mssv}-${maNM}`,
        trip.diem_chuan_bi ?? '',
        trip.diem_thu_hoach ?? trip.diem_bao_cao ?? '',
        trip.diem_bao_cao_hoi_dong ?? trip.diem_hoi_dong ?? trip.diem_hoi_dong_final ?? '',
        trip.diem_cong ?? '',
        hasReport ? 'Đã nộp' : 'Chưa nộp',
        trip.hinh_thuc === 'TrucTiep' ? 'trực tiếp (offline)' : (trip.hinh_thuc === 'TrucTuyen' || trip.hinh_thuc === 'Online' ? 'trực tuyến (online)' : trip.hinh_thuc || ''),
        gv, // Tạm mượn GVHD
        '' // Kết quả lọc
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachTQNM');
  XLSX.writeFile(wb, `DanhSachTQNM_${tenLich.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
};

// Mẫu 3: Tổng hợp 24-25
export const exportTongHopKienTap = (results, tenLich = '') => {
  const data = [];
  
  data.push([`DANH SÁCH SINH VIÊN THỰC HIỆN HỌC PHẦN KIẾN TẬP`]);
  data.push([tenLich]);
  data.push([]);
  data.push([
    'STT', 'Mã HS-SV', 'Họ đệm', 'Tên', 'Ngày sinh', 'Lớp học', 'GVHD', 
    'Số nhà máy TQ offline do khoa tổ chức', 'Số lần nộp báo cáo', 'Ghi chú'
  ]);

  results.forEach((r, idx) => {
    const sv = r.sinhVien || {};
    const { hoDem, ten } = getHoDemAndTen(sv.ho_ten);
    const trips = r.trips || [];
    
    const offlineTrips = trips.filter(t => t.hinh_thuc === 'TrucTiep' || t.hinh_thuc?.toLowerCase().includes('offline'));
    const reportsCount = trips.filter(t => t.diem_thu_hoach != null || t.diem_bao_cao != null).length;
    const gvhd = r.giangVienHuongDan?.ho_ten || sv.details?.giangVienHuongDan?.ho_ten || r.gvhd || '';

    data.push([
      idx + 1,
      sv.mssv,
      hoDem,
      ten,
      '', // Ngày sinh is omitted
      sv.ten_lop || '',
      gvhd,
      offlineTrips.length,
      reportsCount,
      ''
    ]);
  });

  // Sheet 2: Danh sách đủ điều kiện
  const dsDuDieuKienData = [
    ['DANH SÁCH SINH VIÊN ĐỦ ĐIỀU KIỆN (ĐẠT)'],
    ['STT', 'MSSV', 'Họ tên', 'Lớp', 'Điểm tổng kết', 'Trạng thái']
  ];
  
  const datResults = results.filter(r => r.trang_thai === 'Đạt');
  datResults.forEach((r, idx) => {
    const sv = r.sinhVien || {};
    dsDuDieuKienData.push([idx + 1, sv.mssv, sv.ho_ten, sv.ten_lop, r.diem_tong_ket, r.trang_thai]);
  });

  // Sheet 3: Danh sách rớt
  const dsKhongDatData = [
    ['DANH SÁCH SINH VIÊN KHÔNG ĐẠT'],
    ['STT', 'MSSV', 'Họ tên', 'Lớp', 'Điểm tổng kết', 'Trạng thái']
  ];
  const rTResults = results.filter(r => r.trang_thai === 'Không đạt');
  rTResults.forEach((r, idx) => {
    const sv = r.sinhVien || {};
    dsKhongDatData.push([idx + 1, sv.mssv, sv.ho_ten, sv.ten_lop, r.diem_tong_ket, r.trang_thai]);
  });
  
  // Sheet 4: Chưa tham quan / Không thực hiện
  const dsKhongThucHienData = [
    ['DANH SÁCH SINH VIÊN KHÔNG THAM GIA KIẾN TẬP'],
    ['STT', 'MSSV', 'Họ tên', 'Lớp', 'Trạng thái']
  ];
  const chuaDiResults = results.filter(r => !r.trips || r.trips.length === 0);
  chuaDiResults.forEach((r, idx) => {
    const sv = r.sinhVien || {};
    dsKhongThucHienData.push([idx + 1, sv.mssv, sv.ho_ten, sv.ten_lop, 'Không có chuyến đi']);
  });

  const wb = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Tổng hợp');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dsDuDieuKienData), 'Đủ điều kiện');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dsKhongDatData), 'Không đạt');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dsKhongThucHienData), 'Không thực hiện');

  XLSX.writeFile(wb, `TongHopKienTap_${tenLich.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
};
