import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown, Check, Eye, Download,
  BarChart2, Users, UserX, CheckCircle, XOctagon, FileCheck, X,
  Award, FileSpreadsheet, CreditCard, Bus, Search, Loader2, Calendar, MapPin, RotateCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { khoaApi } from '../../services/api';
import { getValidSession } from '../../utils/auth';
import ConfirmModal from '../../components/ConfirmModal';
import SearchableDropdown from '../../components/SearchableDropdown';
import {
  exportDiemQuaTrinh,
  exportDanhSachPhang,
  exportTongHopKienTap,
  exportDanhSachChuyenThamQuan,
  exportDanhSachDatKhongDat,
  exportDanhSachDuDieuKien,
  exportDanhSachChuaThamQuan,
  exportDanhSachHocLai,
  exportBaoCaoTongHopChuyenThamQuan,
  formatDate
} from '../../utils/exportExcel';

export default function BaoCaoThongKe_Khoa() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getValidSession();
  const isCLB = location.pathname.startsWith('/clb') || session?.user?.vai_tro === 'QuanLyCLB';
  const rolePrefix = isCLB ? '/clb' : '/khoa';

  // Dropdown States for Filters
  const [selectedNamHoc, setSelectedNamHoc] = useState(() => sessionStorage.getItem('report_selectedNamHoc') || 'Tất cả');
  const [namHocOptions, setNamHocOptions] = useState(["Tất cả"]);

  const [selectedKhoa, setSelectedKhoa] = useState(() => sessionStorage.getItem('report_selectedKhoa') || 'Tất cả');
  const [khoaOptions, setKhoaOptions] = useState(["Tất cả"]);

  // Đợt kiến tập (Campaigns / Đợt học phần)
  const [campaigns, setCampaigns] = useState([]);
  const [selectedDot, setSelectedDot] = useState(() => sessionStorage.getItem('report_selectedDot') || '');
  const [searchDot, setSearchDot] = useState('');

  // Alert Modal
  const [alertMessage, setAlertMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (selectedNamHoc) sessionStorage.setItem('report_selectedNamHoc', selectedNamHoc);
    else sessionStorage.removeItem('report_selectedNamHoc');
  }, [selectedNamHoc]);

  useEffect(() => {
    if (selectedKhoa) sessionStorage.setItem('report_selectedKhoa', selectedKhoa);
    else sessionStorage.removeItem('report_selectedKhoa');
  }, [selectedKhoa]);

  useEffect(() => {
    if (selectedDot) sessionStorage.setItem('report_selectedDot', selectedDot);
    else sessionStorage.removeItem('report_selectedDot');
  }, [selectedDot]);

  // Lọc Đợt kiến tập theo Năm học, Khóa và từ khóa tìm kiếm
  const filteredCampaigns = campaigns.filter(c => {
    let matchNamHoc = true;
    let matchKhoa = true;

    if (selectedNamHoc && selectedNamHoc !== "Tất cả") {
      matchNamHoc = c.hocKy?.namHoc?.ten_nam_hoc === selectedNamHoc || c.ten_dot?.includes(selectedNamHoc);
    }
    if (selectedKhoa && selectedKhoa !== "Tất cả") {
      matchKhoa = c.khoaHoc?.ten_khoa_hoc === selectedKhoa || c.ten_dot?.includes(selectedKhoa);
    }

    let matchSearch = true;
    if (searchDot) {
      matchSearch = c.ten_dot?.toLowerCase().includes(searchDot.toLowerCase());
    }

    return matchNamHoc && matchKhoa && matchSearch;
  });

  useEffect(() => {
    if (selectedDot && campaigns.length > 0) {
      const stillExists = filteredCampaigns.some(c => String(c.id) === String(selectedDot));
      if (!stillExists) {
        setSelectedDot('');
      }
    }
  }, [filteredCampaigns, selectedDot, campaigns.length]);

  useEffect(() => {
    khoaApi.getCampaigns({ limit: 1000 }).then(res => {
      const list = res.data?.data || res.data || [];
      setCampaigns(list);
    }).catch(console.error);

    khoaApi.getYears().then(res => setNamHocOptions(["Tất cả", ...(res.data || []).map(y => y.ten_nam_hoc)])).catch(console.error);
    khoaApi.getCourses().then(res => setKhoaOptions(["Tất cả", ...(res.data || []).map(c => c.ten_khoa_hoc)])).catch(console.error);
  }, []);

  const showAlert = (msg) => setAlertMessage(msg);

  // 1. BÁO CÁO DÀNH CHO QUẢN LÝ KHOA (Điểm số & Học vụ)
  const khoaReports = [
    {
      id: 11,
      name: 'Bảng điểm quá trình TQNM (Ma trận điểm)',
      desc: 'Bảng ma trận điểm chi tiết toàn bộ các chuyến tham quan (Điểm chuẩn bị, Điểm thu hoạch, Điểm hội đồng, Điểm cộng) của từng sinh viên theo mẫu chuẩn HUIT.',
      icon: <Award className="w-6 h-6 text-[#407F3E]" />,
      bgIcon: 'bg-[#407F3E]/10',
      group: 'Đánh giá & Điểm số'
    },
    {
      id: 12,
      name: 'Tổng hợp kết quả học phần Kiến tập (Gửi SV kiểm tra)',
      desc: 'Bảng tổng hợp tiến độ học phần kiến tập: Số nhà máy tham gia, số bài nộp, GVHD, điểm tổng kết để rà soát và gửi sinh viên kiểm tra theo đợt.',
      icon: <FileSpreadsheet className="w-6 h-6 text-[#89B449]" />,
      bgIcon: 'bg-[#89B449]/10',
      group: 'Đánh giá & Điểm số'
    },
    {
      id: 6,
      name: 'Danh sách SV đạt / không đạt (Đậu / Rớt)',
      desc: 'Bảng điểm tổng kết cuối cùng, phân loại trạng thái Đạt hoặc Không Đạt và thống kê tỷ lệ hoàn thành học phần theo toàn đợt kiến tập.',
      icon: <FileCheck className="w-6 h-6 text-indigo-600" />,
      bgIcon: 'bg-indigo-50',
      group: 'Đánh giá & Điểm số'
    },
    {
      id: 4,
      name: 'Danh sách SV đủ điều kiện báo cáo',
      desc: 'Sinh viên đã đáp ứng đủ các tiêu chuẩn học vụ: hoàn thành tối thiểu 2 chuyến trực tiếp + 1 chuyến trực tuyến và hoàn thành lệ phí.',
      icon: <CheckCircle className="w-6 h-6 text-teal-600" />,
      bgIcon: 'bg-teal-50',
      group: 'Điều kiện học vụ & Học lại'
    },
    {
      id: 5,
      name: 'Danh sách sinh viên nợ môn',
      desc: 'Thống kê sinh viên các khóa cũ (cũ hơn khóa hiện tại) chưa đạt hoặc còn nợ học phần kiến tập để Khoa và Phòng Đào tạo mở lớp học lại.',
      icon: <RotateCcw className="w-6 h-6 text-amber-600" />,
      bgIcon: 'bg-amber-50',
      group: 'Điều kiện học vụ & Học lại'
    }
  ];

  // 2. BÁO CÁO DÀNH CHO CÂU LẠC BỘ (Chuyến tham quan & Vận hành)
  const clbReports = [
    {
      id: 1,
      name: 'Tổng hợp dữ liệu tham quan & Doanh nghiệp',
      desc: 'Báo cáo tổng quan về số lượng chuyến đi đã tổ chức, số sinh viên tham gia, thống kê tỷ lệ có mặt và danh sách các doanh nghiệp đối tác.',
      icon: <BarChart2 className="w-6 h-6 text-[#407F3E]" />,
      bgIcon: 'bg-[#407F3E]/10',
      group: 'Vận hành chuyến đi'
    },
    {
      id: 7,
      name: 'Danh sách SV theo Chuyến tham quan (In danh sách đoàn)',
      desc: 'Chọn chuyến tham quan cụ thể để xem danh sách sinh viên đăng ký, thông tin liên hệ và cột chữ ký phục vụ điểm danh thực tế tại nhà máy.',
      icon: <Bus className="w-6 h-6 text-[#89B449]" />,
      bgIcon: 'bg-[#89B449]/10',
      group: 'Vận hành chuyến đi'
    },
    {
      id: 2,
      name: 'Danh sách SV đã tham quan (Tích lũy)',
      desc: 'Danh sách chi tiết các sinh viên đã hoàn thành tối thiểu 1 chuyến tham quan thực tế tại doanh nghiệp trong đợt kiến tập.',
      icon: <Users className="w-6 h-6 text-teal-600" />,
      bgIcon: 'bg-teal-50',
      group: 'Tiến độ Sinh viên & Tài chính'
    },
    {
      id: 3,
      name: 'Danh sách SV chưa tham quan',
      desc: 'Danh sách các sinh viên đăng ký môn học nhưng chưa tham gia hoặc vắng mặt trong các chuyến đi để Ban chủ nhiệm CLB đôn đốc, nhắc nhở.',
      icon: <UserX className="w-6 h-6 text-[#DBD468]" />,
      bgIcon: 'bg-[#DBD468]/15',
      group: 'Tiến độ Sinh viên & Tài chính'
    },
    {
      id: 8,
      name: 'Báo cáo Thu - Chi Lệ phí & Hoàn phí',
      desc: 'Thống kê tổng hợp việc nộp lệ phí tham quan của sinh viên theo từng chuyến/đợt và tình trạng duyệt hoàn phí cho các trường hợp hủy chuyến hợp lệ.',
      icon: <CreditCard className="w-6 h-6 text-indigo-600" />,
      bgIcon: 'bg-indigo-50',
      group: 'Tiến độ Sinh viên & Tài chính'
    }
  ];

  const currentReports = isCLB ? clbReports : khoaReports;
  const groups = Array.from(new Set(currentReports.map(r => r.group)));

  // Xử lý XEM báo cáo
  const handleView = async (reportId) => {
    const rolePrefix = isCLB ? '/clb' : '/khoa';

    // CLB Views
    if (reportId === 1) {
      navigate('/clb/visit-report');
      return;
    }
    if (reportId === 7) {
      const dotParam = selectedDot ? `?dotKienTapId=${selectedDot}` : '';
      navigate(`${rolePrefix}/trip-roster${dotParam}`);
      return;
    }
    if (reportId === 2) {
      if (!selectedDot) {
        showAlert('Vui lòng chọn đợt kiến tập trước khi xem báo cáo này!');
        return;
      }
      navigate(`${rolePrefix}/visited-students?dotKienTapId=${selectedDot}`);
      return;
    }
    if (reportId === 3) {
      if (!selectedDot) {
        showAlert('Vui lòng chọn đợt kiến tập trước khi xem báo cáo này!');
        return;
      }
      navigate(`${rolePrefix}/not-visited-students?dotKienTapId=${selectedDot}`);
      return;
    }
    if (reportId === 8) {
      navigate('/clb/fees');
      return;
    }

    // Khoa Views
    if (reportId === 11) {
      if (selectedDot) {
        navigate(`/khoa/results?dotKienTapId=${selectedDot}`);
      } else {
        navigate('/khoa/results');
      }
      return;
    }
    // 2. Khoa: Tổng hợp kết quả học phần Kiến tập (Gửi SV kiểm tra)
    if (reportId === 12) {
      if (!selectedDot) {
        showAlert('Vui lòng chọn đợt kiến tập trước khi xem báo cáo này!');
        return;
      }
      navigate(`${rolePrefix}/review-progress?dotKienTapId=${selectedDot}`);
      return;
    }

    // 3. Khoa: Danh sách SV Đạt / Không đạt (Đậu / Rớt)
    if (reportId === 6) {
      if (!selectedDot) {
        showAlert('Vui lòng chọn đợt kiến tập trước khi xem báo cáo này!');
        return;
      }
      navigate(`${rolePrefix}/final-results?dotKienTapId=${selectedDot}`);
      return;
    }
    if (reportId === 4) {
      if (!selectedDot) {
        showAlert('Vui lòng chọn đợt kiến tập trước khi xem báo cáo này!');
        return;
      }
      navigate(`/khoa/eligible-students?dotKienTapId=${selectedDot}`);
      return;
    }
    if (reportId === 5) {
      navigate('/khoa/retake-students');
      return;
    }
  };

  // Xử lý XUẤT EXCEL báo cáo
  const handleExportExcel = async (reportId) => {
    const tenDot = campaigns.find(c => String(c.id) === String(selectedDot))?.ten_dot || 'DotKienTap';
    setIsExporting(true);

    try {
      // 1. Khoa: Bảng điểm quá trình TQNM (Mẫu 1)
      if (reportId === 11) {
        if (!selectedDot) {
          showAlert('Vui lòng chọn đợt kiến tập trước khi xuất báo cáo này!');
          setIsExporting(false);
          return;
        }
        const res = await khoaApi.getEnrollments({ dotKienTapId: selectedDot, limit: 1000 });
        const enrollments = res.data?.data || [];
        if (enrollments.length === 0) {
          toast.error('Không tìm thấy dữ liệu kết quả học phần trong đợt này.');
          setIsExporting(false);
          return;
        }
        exportDiemQuaTrinh(enrollments, tenDot);
        toast.success('Xuất file Điểm quá trình thành công!');
        setIsExporting(false);
        return;
      }

      // 2. Khoa: Tổng hợp kết quả học phần Kiến tập (Mẫu 2)
      if (reportId === 12) {
        if (!selectedDot) {
          showAlert('Vui lòng chọn đợt kiến tập trước khi xuất báo cáo này!');
          setIsExporting(false);
          return;
        }
        const res = await khoaApi.getEnrollments({ dotKienTapId: selectedDot, limit: 1000 });
        const enrollments = res.data?.data || [];
        if (enrollments.length === 0) {
          toast.error('Không tìm thấy dữ liệu sinh viên trong đợt này.');
          setIsExporting(false);
          return;
        }
        exportTongHopKienTap(enrollments, tenDot);
        toast.success('Xuất file Tổng hợp Kiến tập (Nhiều Sheet) thành công!');
        setIsExporting(false);
        return;
      }

      // 3. Khoa: Danh sách SV Đạt / Không đạt
      if (reportId === 6) {
        if (!selectedDot) {
          showAlert('Vui lòng chọn đợt kiến tập trước khi xuất báo cáo này!');
          setIsExporting(false);
          return;
        }
        const res = await khoaApi.getFinalResultsReport(selectedDot);
        const data = res.data || [];
        if (data.length === 0) {
          toast.error('Chưa có dữ liệu chốt kết quả đợt này.');
          setIsExporting(false);
          return;
        }
        exportDanhSachDatKhongDat(data, tenDot);
        toast.success('Xuất file SV Đạt/Không đạt thành công!');
        setIsExporting(false);
        return;
      }

      // 4. Khoa: Danh sách SV đủ điều kiện báo cáo
      if (reportId === 4) {
        if (!selectedDot) {
          showAlert('Vui lòng chọn đợt kiến tập trước khi xuất báo cáo này!');
          setIsExporting(false);
          return;
        }
        const res = await khoaApi.getEligibleStudentsReport({ dotKienTapId: selectedDot });
        const data = res.data || [];
        if (data.length === 0) {
          toast.error('Không có sinh viên đủ điều kiện trong đợt này.');
          setIsExporting(false);
          return;
        }
        exportDanhSachDuDieuKien(data, tenDot);
        toast.success('Xuất file SV Đủ điều kiện thành công!');
        setIsExporting(false);
        return;
      }

      // 5. Khoa: Danh sách sinh viên nợ môn
      if (reportId === 5) {
        const res = await khoaApi.getRetakeReport();
        const data = res.data || [];
        if (data.length === 0) {
          toast.error('Không có sinh viên nợ môn nào.');
          setIsExporting(false);
          return;
        }
        exportDanhSachHocLai(data);
        toast.success('Xuất file Danh sách sinh viên nợ môn thành công!');
        setIsExporting(false);
        return;
      }

      // 6. CLB: Tổng hợp dữ liệu chuyến tham quan
      if (reportId === 1) {
        const res = await khoaApi.getTrips();
        const trips = res.data?.data || res.data || [];
        if (trips.length === 0) {
          toast.error('Chưa có dữ liệu chuyến tham quan.');
          setIsExporting(false);
          return;
        }
        exportBaoCaoTongHopChuyenThamQuan(trips.map(t => ({
          id: `CTQ-${String(t.id).padStart(3, '0')}`,
          name: t.ten_chuyen || `Tham quan ${t.nhaMay?.ten_nha_may || 'Doanh nghiệp'}`,
          date: t.ngay_tham_quan ? formatDate(t.ngay_tham_quan) : '',
          gio_bat_dau: t.gio_bat_dau || '',
          hinh_thuc: t.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến',
          sucChua: t.suc_chua || 0,
          registeredCount: t.dang_ky_count || 0,
          actualCount: t.dang_ky_count || 0,
          status: t.trang_thai === 'DaKetThuc' ? 'Hoàn thành' : (t.trang_thai === 'DangDienRas' ? 'Đang diễn ra' : 'Sắp diễn ra')
        })));
        toast.success('Xuất file Tổng hợp chuyến tham quan thành công!');
        setIsExporting(false);
        return;
      }

      // 7. CLB: Danh sách theo chuyến tham quan cụ thể (In danh sách đoàn)
      if (reportId === 7) {
        setIsExporting(false);
        const dotParam = selectedDot ? `?dotKienTapId=${selectedDot}` : '';
        navigate(`${rolePrefix}/trip-roster${dotParam}`);
        return;
      }

      // 8. CLB: Danh sách SV đã tham quan
      if (reportId === 2) {
        if (!selectedDot) {
          showAlert('Vui lòng chọn đợt kiến tập trước khi xuất báo cáo này!');
          setIsExporting(false);
          return;
        }
        const res = await khoaApi.getVisitedStudentsReport({ dotKienTapId: selectedDot });
        const data = res.data || [];
        if (data.length === 0) {
          toast.error('Không có dữ liệu sinh viên đã tham quan trong đợt này.');
          setIsExporting(false);
          return;
        }
        const formatted = data.map((s, idx) => ({
          'STT': idx + 1,
          'MSSV': s.mssv,
          'Họ tên': s.ho_ten,
          'Lớp': s.ten_lop || s.lop || '',
          'Khóa': s.khoaHoc?.ten_khoa_hoc || '',
          'Số lần tham quan': s.visitsCount || 1
        }));
        const ws = XLSX.utils.json_to_sheet(formatted);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'SV_DaThamQuan');
        XLSX.writeFile(wb, `SV_DaThamQuan_${tenDot}.xlsx`);
        toast.success('Xuất file SV Đã tham quan thành công!');
        setIsExporting(false);
        return;
      }

      // 9. CLB: Danh sách SV chưa tham quan
      if (reportId === 3) {
        if (!selectedDot) {
          showAlert('Vui lòng chọn đợt kiến tập trước khi xuất báo cáo này!');
          setIsExporting(false);
          return;
        }
        const res = await khoaApi.getNotVisitedStudentsReport({ dotKienTapId: selectedDot });
        const data = res.data || [];
        if (data.length === 0) {
          toast.error('Không có sinh viên chưa tham quan trong đợt này.');
          setIsExporting(false);
          return;
        }
        exportDanhSachChuaThamQuan(data, tenDot);
        toast.success('Xuất file SV Chưa tham quan thành công!');
        setIsExporting(false);
        return;
      }

      // 10. CLB: Báo cáo Lệ phí & Hoàn phí
      if (reportId === 8) {
        navigate('/clb/fees');
        setIsExporting(false);
        return;
      }

    } catch (error) {
      console.error(error);
      showAlert('Có lỗi xảy ra khi trích xuất dữ liệu báo cáo!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {isCLB ? 'Báo cáo Thống kê Chuyến tham quan & Vận hành' : 'Báo cáo Thống kê Điểm số & Học vụ'}
            </h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-2xs ${
              isCLB 
                ? 'bg-[#89B449]/15 text-[#407F3E] border-[#89B449]/30' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              {isCLB ? 'Phân hệ CLB Kiến tập' : 'Phân hệ Quản lý Khoa'}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {isCLB 
              ? 'Thống kê vận hành thực tế các chuyến đi, đối tác doanh nghiệp, danh sách đoàn và thu lệ phí.'
              : 'Thống kê kết quả đánh giá, ma trận điểm quá trình, chuẩn đầu ra và danh sách học lại theo đợt kiến tập.'}
          </p>
        </div>

        {isExporting && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#407F3E] text-[#407F3E] rounded-xl text-sm font-bold shadow-sm animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang trích xuất Excel...</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-center gap-4 relative z-20 mb-8">
        {/* Năm học Dropdown */}
        <div className="min-w-[200px] flex-1 md:flex-none">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Năm học</label>
          <SearchableDropdown
            options={namHocOptions.map(opt => ({ value: opt, label: opt }))}
            value={selectedNamHoc || 'Tất cả'}
            onChange={(val) => setSelectedNamHoc(val)}
            placeholder="Tất cả năm học"
            searchPlaceholder="Tìm năm học..."
            className="w-full"
          />
        </div>

        {/* Khóa Dropdown */}
        <div className="min-w-[180px] flex-1 md:flex-none">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Khóa đào tạo</label>
          <SearchableDropdown
            options={khoaOptions.map(opt => ({ value: opt, label: opt }))}
            value={selectedKhoa || 'Tất cả'}
            onChange={(val) => setSelectedKhoa(val)}
            placeholder="Tất cả khóa"
            searchPlaceholder="Tìm khóa..."
            className="w-full"
          />
        </div>

        {/* Đợt kiến tập Dropdown (Thay thế Lịch kiến tập) */}
        <div className="min-w-[280px] flex-1">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            {isCLB ? 'Đợt kiến tập (Lọc chuyến)' : 'Đợt kiến tập (Bắt buộc cho báo cáo)'}
          </label>
          <SearchableDropdown
            options={filteredCampaigns.map(opt => ({ value: opt.id, label: opt.ten_dot }))}
            value={selectedDot}
            onChange={(val) => setSelectedDot(val)}
            placeholder="Chọn đợt kiến tập..."
            searchPlaceholder="Tìm kiếm tên đợt..."
            className="w-full"
          />
        </div>
      </div>

      {/* Reports Grid Rendered by Group */}
      <div className="space-y-10">
        {groups.map(groupName => {
          const groupReports = currentReports.filter(r => r.group === groupName);
          const isAcademic = groupName.includes('Điểm') || groupName.includes('học');
          
          return (
            <div key={groupName} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-6 rounded-full ${isAcademic ? 'bg-indigo-600' : 'bg-[#407F3E]'}`}></div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">{groupName}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
                {groupReports.map(report => (
                  <div
                    key={report.id}
                    className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group/card hover:border-[#407F3E]/40"
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${report.bgIcon}`}>
                          {report.icon}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800 group-hover/card:text-[#407F3E] transition-colors leading-snug">
                            {report.name}
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">
                        {report.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#E7E0C4]/50">
                      <button
                        onClick={() => handleView(report.id)}
                        className="flex-1 py-2.5 border border-[#E7E0C4] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span>Xem chi tiết</span>
                      </button>
                      <button
                        onClick={() => handleExportExcel(report.id)}
                        className="flex-1 py-2.5 bg-[#407F3E] hover:bg-[#346832] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Xuất Excel</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Dialog */}
      <ConfirmModal
        isOpen={!!alertMessage}
        title="Thông báo"
        message={alertMessage}
        confirmText="Đóng"
        actionType="default"
        onConfirm={() => setAlertMessage('')}
        onCancel={() => setAlertMessage('')}
        isAlert={true}
      />
    </div>
  );
}
