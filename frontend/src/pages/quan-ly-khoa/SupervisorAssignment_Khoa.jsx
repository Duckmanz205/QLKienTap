import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronDown, Check, Info, Search, UserCircle, RefreshCw, X, Filter, AlertCircle, ChevronLeft, ChevronRight, UserPlus, Users, Download, FileSpreadsheet, Upload, CheckCircle2, AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { khoaApi } from '../../services/api';
import Toast from '../../components/Toast';
import EdgeToEdgeContainer from '../../components/EdgeToEdgeContainer';
import SearchableDropdown from '../../components/SearchableDropdown';
import { exportPhanCongGVHD, exportPhanCongGVHDTemplate } from '../../utils/exportExcel';
import useClickOutside from '../../hooks/useClickOutside';

export default function SupervisorAssignment_Khoa() {
  const [campaigns, setCampaigns] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Search & Pagination States for Students
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(30);

  // Filter States
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const [selectAll, setSelectAll] = useState(false);

  // Lecturer Right Panel State
  const [lecturerSearch, setLecturerSearch] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState(null);

  // Auto assign state
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
  const [autoAssignPreview, setAutoAssignPreview] = useState(null);
  const [loadingAutoAssign, setLoadingAutoAssign] = useState(false);

  // Auto assign modal pagination & search state
  const [autoAssignSearchTerm, setAutoAssignSearchTerm] = useState('');
  const [autoAssignCurrentPage, setAutoAssignCurrentPage] = useState(1);
  const [autoAssignLimit, setAutoAssignLimit] = useState(30);
  const [openLecturerDropdownId, setOpenLecturerDropdownId] = useState(null);
  const [lecturerDropdownSearchTerm, setLecturerDropdownSearchTerm] = useState('');

  // Confirm Dialog State for Export Excel
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const showConfirm = (title, message, onConfirm) => setConfirmDialog({ isOpen: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });

  // Export Menu State
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportMenuRef = useClickOutside(() => setIsExportDropdownOpen(false), isExportDropdownOpen);

  // Import Excel State
  const fileInputRef = useRef(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importParsedList, setImportParsedList] = useState([]);
  const [importWorkloadList, setImportWorkloadList] = useState([]);
  const [importActiveTab, setImportActiveTab] = useState('students'); // 'students' | 'workload'
  const [importFilterStatus, setImportFilterStatus] = useState('ALL'); // 'ALL' | 'VALID' | 'UNCHANGED' | 'ERROR'
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [campRes, lecRes] = await Promise.allSettled([
        khoaApi.getCampaigns({ limit: 100 }),
        khoaApi.getLecturersWithWorkload()
      ]);

      const camps = campRes.status === 'fulfilled' ? (campRes.value.data?.data || campRes.value.data || []) : [];
      const lecs = lecRes.status === 'fulfilled' ? (lecRes.value.data || []) : [];

      setCampaigns(camps);
      setLecturers(lecs);

      if (camps.length > 0) {
        setSelectedCampaign(camps[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể tải dữ liệu ban đầu', 'error');
    }
  };

  // Format options cho dropdown Đợt kiến tập
  const campaignOptions = useMemo(() => {
    return campaigns.map(c => {
      const hocKyText = c.hocKy?.ten_hoc_ky || '';
      const namHocText = c.hocKy?.namHoc?.ten_nam_hoc ? ` (${c.hocKy.namHoc.ten_nam_hoc})` : '';
      const hocKyFull = hocKyText ? `${hocKyText}${namHocText}` : '';
      const rawKhoa = c.khoaHoc?.ten_khoa_hoc || c.khoaHoc?.ma_khoa_hoc || '';
      const khoaText = rawKhoa
        ? (rawKhoa.toLowerCase().includes('khóa') ? rawKhoa : `Khóa ${rawKhoa}`)
        : '';
      const subLabel = [hocKyFull, khoaText].filter(Boolean).join(' • ');
      return {
        value: c.id,
        label: c.ten_dot,
        subLabel: subLabel
      };
    });
  }, [campaigns]);

  // Tự động đồng bộ đợt kiến tập nếu danh sách đợt thay đổi
  useEffect(() => {
    if (campaigns.length > 0) {
      const exists = campaigns.some(c => c.id === Number(selectedCampaign));
      if (!exists) {
        setSelectedCampaign(campaigns[0].id);
        setCurrentPage(1);
      }
    } else {
      setSelectedCampaign('');
      setEnrollments([]);
    }
  }, [campaigns]);

  useEffect(() => {
    if (selectedCampaign) {
      fetchEnrollments();
    }
  }, [selectedCampaign]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await khoaApi.getEnrollments({ dotKienTapId: selectedCampaign, limit: 10000 });
      const enrolls = res.data?.data || res.data;
      setEnrollments(enrolls.map(e => ({ ...e, checked: false })));
      setSelectAll(false);
      // Also refresh workload
      const lecRes = await khoaApi.getLecturersWithWorkload(selectedCampaign);
      setLecturers(lecRes.data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách sinh viên', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleBulkAssign = async (gvId) => {
    const selectedIds = enrollments.filter(e => e.checked).map(e => e.id);
    if (selectedIds.length === 0) return;

    try {
      const res = await khoaApi.batchAssignGvhd({
        dotKienTapSinhVienIds: selectedIds,
        lecturerId: gvId
      });
      const { success, failed } = res.data;
      if (failed.length > 0) {
        showToast(`Phân công ${success} thành công, ${failed.length} thất bại`, 'warning');
      } else {
        showToast(`Phân công thành công cho ${success} sinh viên`);
      }
      setSelectedLecturer(null);
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      showToast('Lỗi phân công', 'error');
    }
  };

  const handlePreviewAutoAssign = async () => {
    if (!selectedCampaign) return;
    setLoadingAutoAssign(true);
    try {
      const campaign = campaigns.find(s => s.id === selectedCampaign);
      if (!campaign) return;
      const res = await khoaApi.previewAutoAssignGvhd({ dotKienTapId: campaign.id });
      setAutoAssignPreview(res.data);
      setIsAutoAssignModalOpen(true);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xem trước phân công tự động', 'error');
    } finally {
      setLoadingAutoAssign(false);
    }
  };

  const handleConfirmAutoAssign = async () => {
    if (!autoAssignPreview || autoAssignPreview.assignments.length === 0) return;
    try {
      setLoadingAutoAssign(true);
      const res = await khoaApi.confirmAutoAssignGvhd({
        assignments: autoAssignPreview.assignments.map(a => ({
          dotKienTapSinhVienId: a.dotKienTapSinhVienId,
          lecturerId: a.lecturerId
        }))
      });
      const { success, failed } = res.data;
      if (failed.length > 0) {
        showToast(`Phân công ${success} thành công, ${failed.length} thất bại`, 'warning');
      } else {
        showToast(`Tự động phân công thành công cho ${success} sinh viên`);
      }
      setIsAutoAssignModalOpen(false);
      setAutoAssignPreview(null);
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      showToast('Lỗi xác nhận phân công tự động', 'error');
    } finally {
      setLoadingAutoAssign(false);
    }
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);

    // Only toggle the visible filtered items, or all items? Usually all filtered items.
    const filteredIds = new Set(filteredEnrollments.map(e => e.id));
    setEnrollments(enrollments.map(e => filteredIds.has(e.id) ? { ...e, checked: newValue } : e));
  };

  const toggleSelect = (id) => {
    setEnrollments(enrollments.map(e => e.id === id ? { ...e, checked: !e.checked } : e));
  };

  const filteredLecturers = lecturers.filter(gv =>
    gv.ho_ten.toLowerCase().includes(lecturerSearch.toLowerCase()) ||
    gv.ma_gv.toLowerCase().includes(lecturerSearch.toLowerCase())
  );

  const classList = Array.from(new Set(enrollments.map(e => e.sinhVien?.ten_lop).filter(Boolean)));

  const filteredEnrollments = enrollments.filter(e => {
    const sv = e.sinhVien || {};
    const currentAdvisor = sv.details?.giangVienHuongDan?.ho_ten || e.giangVienHuongDan?.ho_ten || e.gvhd;

    if (selectedStatus === 'Đã phân công' && !currentAdvisor) return false;
    if (selectedStatus === 'Chưa phân công' && currentAdvisor) return false;
    if (selectedClass && sv.ten_lop !== selectedClass) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchMssv = sv.mssv?.toLowerCase().includes(term);
      const matchName = sv.ho_ten?.toLowerCase().includes(term);
      const matchClass = sv.ten_lop?.toLowerCase().includes(term);
      const matchAdvisor = currentAdvisor?.toLowerCase().includes(term);
      if (!matchMssv && !matchName && !matchClass && !matchAdvisor) return false;
    }
    return true;
  });

  const totalItems = filteredEnrollments.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages) || 1;
  const paginatedEnrollments = filteredEnrollments.slice((validCurrentPage - 1) * limit, validCurrentPage * limit);

  const selectedCount = enrollments.filter(e => e.checked).length;

  // Stats
  const rawTotalStudents = enrollments.length;
  const rawAssignedStudents = enrollments.filter(e => e.sinhVien?.details?.giangVienHuongDan || e.giangVienHuongDan || e.gvhd).length;
  const rawUnassignedStudents = rawTotalStudents - rawAssignedStudents;
  const progressPercent = rawTotalStudents === 0 ? 0 : Math.round((rawAssignedStudents / rawTotalStudents) * 100);

  const handleExportOption = (type) => {
    setIsExportDropdownOpen(false);
    let listToExport = [];
    let suffix = '';

    if (type === 'all') {
      listToExport = enrollments;
      suffix = 'TatCa';
    } else if (type === 'assigned') {
      listToExport = enrollments.filter(e => e.sinhVien?.details?.giangVienHuongDan || e.giangVienHuongDan || e.gvhd);
      suffix = 'DaPhanCong';
    } else if (type === 'unassigned') {
      listToExport = enrollments.filter(e => !(e.sinhVien?.details?.giangVienHuongDan || e.giangVienHuongDan || e.gvhd));
      suffix = 'ChuaPhanCong';
    } else if (type === 'filtered') {
      listToExport = filteredEnrollments;
      suffix = 'DangLoc';
    }

    if (listToExport.length === 0) {
      showToast('Không có dữ liệu sinh viên phù hợp để xuất danh sách', 'warning');
      return;
    }

    const currentCampaign = campaigns.find(c => c.id === Number(selectedCampaign));
    const campaignName = currentCampaign?.ten_dot ? `${currentCampaign.ten_dot}_${suffix}` : suffix;

    if (type === 'all' && rawUnassignedStudents > 0) {
      showConfirm(
        'Chưa hoàn tất phân công GVHD',
        `Hiện còn ${rawUnassignedStudents}/${rawTotalStudents} sinh viên chưa được phân công Giảng viên Hướng dẫn. Bạn có chắc chắn muốn xuất danh sách không?`,
        () => {
          exportPhanCongGVHD(listToExport, campaignName);
          showToast(`Đã xuất danh sách ${listToExport.length} sinh viên phân công GVHD thành công!`);
        }
      );
      return;
    }

    exportPhanCongGVHD(listToExport, campaignName);
    showToast(`Đã xuất danh sách ${listToExport.length} sinh viên phân công GVHD thành công!`);
  };

  // Auto Assign Pagination & Search Logic
  const filteredAutoAssign = (autoAssignPreview?.assignments || []).filter(a => {
    if (!autoAssignSearchTerm) return true;
    const term = autoAssignSearchTerm.toLowerCase();
    return (
      (a.sinhVien?.mssv || '').toLowerCase().includes(term) ||
      (a.sinhVien?.ho_ten || '').toLowerCase().includes(term) ||
      (a.sinhVien?.ten_lop || '').toLowerCase().includes(term)
    );
  });

  const totalAutoAssignPages = Math.ceil(filteredAutoAssign.length / autoAssignLimit) || 1;
  const paginatedAutoAssign = filteredAutoAssign.slice(
    (autoAssignCurrentPage - 1) * autoAssignLimit,
    autoAssignCurrentPage * autoAssignLimit
  );

  // Helper chuẩn hóa họ tên giảng viên (loại bỏ học hàm/học vị)
  const normalizeLecturerName = (name) => {
    return (name || '')
      .replace(/\b(PGS\.TS\.|PGS\.|GS\.TS\.|GS\.|TS\.|ThS\.|CN\.|KS\.|ThS|TS|PGS|GS|Thạc sĩ|Tiến sĩ)\b/gi, '')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  // Helper nhận diện giảng viên từ text
  const matchLecturer = (rawId, allLecturers) => {
    const clean = (rawId || '').trim();
    if (!clean) return { lecturer: null, error: 'Chưa có thông tin giảng viên' };

    // Case 1: Chuỗi kết hợp "Mã GV - Tên GV"
    const dashParts = clean.split(/[-:]/);
    if (dashParts.length >= 2) {
      const potentialCode = dashParts[0].trim().toUpperCase();
      const foundByCode = allLecturers.find(g => (g.ma_gv || '').trim().toUpperCase() === potentialCode);
      if (foundByCode) return { lecturer: foundByCode, error: null };
    }

    // Case 2: Khớp theo Mã GV chính xác
    const upperClean = clean.toUpperCase();
    const byCode = allLecturers.find(g => (g.ma_gv || '').trim().toUpperCase() === upperClean);
    if (byCode) return { lecturer: byCode, error: null };

    // Case 3: Khớp theo Họ tên (loại bỏ học hàm/học vị)
    const normInput = normalizeLecturerName(clean);
    const matched = allLecturers.filter(g => normalizeLecturerName(g.ho_ten || '') === normInput);

    if (matched.length === 1) {
      return { lecturer: matched[0], error: null };
    }
    if (matched.length > 1) {
      return {
        lecturer: null,
        error: `Có ${matched.length} giảng viên trùng tên "${clean}". Vui lòng ghi kèm Mã GV (Ví dụ: ${matched[0].ma_gv} - ${matched[0].ho_ten})`
      };
    }

    return { lecturer: null, error: `Không tìm thấy giảng viên "${clean}" trong danh sách khoa` };
  };

  // Tải file mẫu phân công GVHD
  const handleDownloadTemplate = () => {
    if (!selectedCampaign) {
      showToast('Vui lòng chọn đợt kiến tập trước khi tải file mẫu', 'warning');
      return;
    }
    const currentCamp = campaigns.find(c => c.id === Number(selectedCampaign));
    exportPhanCongGVHDTemplate(enrollments, currentCamp?.ten_dot || '');
    showToast('Đã tải xuống file mẫu phân công GVHD (.xlsx)');
  };

  // Xử lý đọc và phân tích file Excel
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedCampaign) {
      showToast('Vui lòng chọn đợt kiến tập trước khi nhập file Excel', 'warning');
      e.target.value = '';
      return;
    }

    setImportFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (!rawRows || rawRows.length === 0) {
        showToast('File Excel trống không có dữ liệu', 'warning');
        e.target.value = '';
        return;
      }

      // Quét tìm dòng tiêu đề chứa MSSV
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(rawRows.length, 25); i++) {
        const rowStr = (rawRows[i] || []).map(cell => String(cell || '').toLowerCase().trim()).join(' ');
        if (rowStr.includes('mssv') || rowStr.includes('mã hs-sv') || rowStr.includes('mã sv') || rowStr.includes('mã sinh viên')) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        showToast('Không tìm thấy dòng tiêu đề chứa cột MSSV trong file Excel', 'error');
        e.target.value = '';
        return;
      }

      const headers = (rawRows[headerRowIndex] || []).map(cell => String(cell || '').toLowerCase().trim());
      const colMssv = headers.findIndex(h => h.includes('mssv') || h.includes('mã hs-sv') || h.includes('mã sinh viên') || h.includes('mã sv'));
      const colName = headers.findIndex(h => h.includes('họ và tên') || h.includes('họ tên') || h.includes('tên sinh viên'));
      const colClass = headers.findIndex(h => h.includes('lớp') || h.includes('tên lớp') || h.includes('mã lớp'));
      const colGvCode = headers.findIndex(h => h === 'mã gv' || h.includes('mã gv') || h.includes('mã giảng viên') || h.includes('magv'));
      const colGvName = headers.findIndex(h => h.includes('giảng viên hướng dẫn') || h.includes('gvhd') || h.includes('tên gv') || h.includes('giảng viên'));

      const dataRows = rawRows.slice(headerRowIndex + 1);

      // Tạo map enrollment hiện tại theo MSSV
      const enrollmentMap = new Map();
      enrollments.forEach(en => {
        if (en.sinhVien?.mssv) {
          enrollmentMap.set(String(en.sinhVien.mssv).trim().toUpperCase(), en);
        }
      });

      // Khởi tạo map tải trọng giảng viên
      const workloadMap = {};
      lecturers.forEach(gv => {
        workloadMap[gv.id] = {
          id: gv.id,
          ma_gv: gv.ma_gv,
          ho_ten: gv.ho_ten,
          currentCount: gv.so_sv_dang_huong_dan || 0,
          delta: 0,
          projectedCount: gv.so_sv_dang_huong_dan || 0,
          maxQuota: gv.so_sv_toi_da_huong_dan || 40,
          hasQuotaLimit: Boolean(gv.so_sv_toi_da_huong_dan),
          isOverloaded: false
        };
      });

      const parsedList = [];

      for (let idx = 0; idx < dataRows.length; idx++) {
        const row = dataRows[idx];
        const rawMssv = colMssv !== -1 ? String(row[colMssv] || '').trim() : '';
        if (!rawMssv) continue; // Bỏ qua dòng trống MSSV

        const rowName = colName !== -1 ? String(row[colName] || '').trim() : '';
        const rowClass = colClass !== -1 ? String(row[colClass] || '').trim() : '';
        const rowGvCode = colGvCode !== -1 ? String(row[colGvCode] || '').trim() : '';
        const rowGvName = colGvName !== -1 ? String(row[colGvName] || '').trim() : '';

        const mssvKey = rawMssv.toUpperCase();
        const en = enrollmentMap.get(mssvKey);

        const svName = en?.sinhVien?.ho_ten || rowName || 'Chưa rõ';
        const svClass = en?.sinhVien?.ten_lop || rowClass || 'N/A';

        // Lấy GV hiện tại của sinh viên
        const currentAdvisorObj = en?.sinhVien?.details?.giangVienHuongDan || en?.giangVienHuongDan;
        const currentAdvisorName = currentAdvisorObj?.ho_ten || en?.gvhd || 'Chưa phân công';
        const currentAdvisorId = currentAdvisorObj?.id || null;

        // Xác định thông tin giảng viên chỉ định trong file
        const rawGvText = (rowGvCode ? `${rowGvCode}${rowGvName ? ' - ' + rowGvName : ''}` : rowGvName).trim();

        if (!en) {
          parsedList.push({
            id: `row-${idx}`,
            mssv: rawMssv,
            ho_ten: svName,
            ten_lop: svClass,
            currentAdvisor: currentAdvisorName,
            assignedGvText: rawGvText || '—',
            status: 'ERROR',
            reason: 'Sinh viên không thuộc đợt kiến tập này',
            matchedLecturer: null
          });
          continue;
        }

        if (!rawGvText) {
          // Bỏ qua / giữ nguyên phân công hiện tại
          parsedList.push({
            id: `row-${idx}`,
            mssv: rawMssv,
            ho_ten: svName,
            ten_lop: svClass,
            currentAdvisor: currentAdvisorName,
            assignedGvText: '—',
            status: 'UNCHANGED',
            reason: 'Không chỉ định GVHD (Giữ nguyên phân công hiện tại)',
            matchedLecturer: null
          });
          continue;
        }

        // Nhận diện giảng viên
        const matchRes = matchLecturer(rowGvCode || rowGvName || rawGvText, lecturers);
        if (matchRes.error || !matchRes.lecturer) {
          parsedList.push({
            id: `row-${idx}`,
            mssv: rawMssv,
            ho_ten: svName,
            ten_lop: svClass,
            currentAdvisor: currentAdvisorName,
            assignedGvText: rawGvText,
            status: 'ERROR',
            reason: matchRes.error || `Không tìm thấy giảng viên "${rawGvText}"`,
            matchedLecturer: null
          });
          continue;
        }

        const newLec = matchRes.lecturer;

        // Nếu sinh viên đã có GVHD và GV mới đúng bằng GV cũ
        if (currentAdvisorId === newLec.id) {
          parsedList.push({
            id: `row-${idx}`,
            mssv: rawMssv,
            ho_ten: svName,
            ten_lop: svClass,
            currentAdvisor: currentAdvisorName,
            assignedGvText: `${newLec.ma_gv} - ${newLec.ho_ten}`,
            status: 'UNCHANGED',
            reason: 'Giữ nguyên (Đã được phân công cho GV này)',
            matchedLecturer: newLec
          });
          continue;
        }

        // Nếu đổi sang GVHD mới: Kiểm tra khóa điểm bài thu hoạch
        if (en.isHarvestGradeLocked) {
          parsedList.push({
            id: `row-${idx}`,
            mssv: rawMssv,
            ho_ten: svName,
            ten_lop: svClass,
            currentAdvisor: currentAdvisorName,
            assignedGvText: `${newLec.ma_gv} - ${newLec.ho_ten}`,
            status: 'ERROR',
            reason: 'Đã khóa điểm bài thu hoạch, không thể đổi GVHD',
            matchedLecturer: newLec
          });
          continue;
        }

        // Hợp lệ -> đưa vào danh sách để mô phỏng tải
        parsedList.push({
          id: `row-${idx}`,
          mssv: rawMssv,
          ho_ten: svName,
          ten_lop: svClass,
          currentAdvisor: currentAdvisorName,
          assignedGvText: `${newLec.ma_gv} - ${newLec.ho_ten}`,
          status: 'VALID',
          reason: 'Hợp lệ',
          matchedLecturer: newLec,
          oldLecturerId: currentAdvisorId
        });
      }

      if (parsedList.length === 0) {
        showToast('Không đọc được dữ liệu sinh viên nào từ file Excel', 'warning');
        e.target.value = '';
        return;
      }

      // Mô phỏng tải trọng (Delta workload)
      parsedList.forEach(item => {
        if (item.status === 'VALID' && item.matchedLecturer) {
          if (item.oldLecturerId && workloadMap[item.oldLecturerId]) {
            workloadMap[item.oldLecturerId].delta -= 1;
          }
          if (workloadMap[item.matchedLecturer.id]) {
            workloadMap[item.matchedLecturer.id].delta += 1;
          }
        }
      });

      // Kiểm tra định mức sau khi cộng dồn
      let anyOverload = false;
      Object.values(workloadMap).forEach(w => {
        w.projectedCount = w.currentCount + w.delta;
        const quota = w.maxQuota || 40;
        if (w.projectedCount > quota) {
          w.isOverloaded = true;
          anyOverload = true;
        }
      });

      // Nếu có GV bị vượt định mức -> Đánh dấu lỗi cho các sinh viên được gán vào GV đó
      if (anyOverload) {
        parsedList.forEach(item => {
          if (item.status === 'VALID' && item.matchedLecturer) {
            const gvWork = workloadMap[item.matchedLecturer.id];
            if (gvWork && gvWork.isOverloaded) {
              item.status = 'ERROR';
              item.reason = `Lỗi vượt định mức: GV ${item.matchedLecturer.ho_ten} vượt tải (${gvWork.projectedCount}/${gvWork.maxQuota || 40} SV)`;
            }
          }
        });
      }

      setImportParsedList(parsedList);
      setImportWorkloadList(Object.values(workloadMap));
      setImportActiveTab('students');
      setImportFilterStatus('ALL');
      setIsImportModalOpen(true);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi đọc file Excel: ' + (err.message || 'File không đúng định dạng'), 'error');
    } finally {
      e.target.value = '';
    }
  };

  // Xác nhận phân công từ file Excel
  const handleConfirmImport = async () => {
    const validItems = importParsedList.filter(item => item.status === 'VALID' && item.matchedLecturer);
    if (validItems.length === 0) {
      showToast('Không có bản ghi hợp lệ nào để phân công', 'warning');
      return;
    }

    try {
      setIsImporting(true);
      const payload = {
        dotKienTapId: Number(selectedCampaign),
        assignments: validItems.map(item => ({
          mssv: item.mssv,
          lecturerIdentifier: item.matchedLecturer.ma_gv || String(item.matchedLecturer.id)
        }))
      };

      const res = await khoaApi.importGvhdAssignments(payload);
      const data = res.data;
      showToast(`Nhập dữ liệu thành công: Đã phân công ${data?.success || validItems.length} sinh viên!`, 'success');
      setIsImportModalOpen(false);
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi nhập phân công từ Excel';
      showToast(typeof msg === 'string' ? msg : 'Lỗi khi nhập phân công từ Excel', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <EdgeToEdgeContainer className="bg-[#E7E0C4]/20 animate-in fade-in duration-300">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}

      {/* Header & Filter */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Phân công GVHD</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý và phân bổ sinh viên cho giảng viên hướng dẫn</p>
          </div>

          <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
            {/* Input file ẩn cho Import Excel */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept=".xlsx, .xls"
              className="hidden"
            />

            {/* Nút Nhập Excel gọn gàng cạnh Xuất báo cáo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedCampaign || loading}
              className="px-4 py-2 bg-white text-[#407F3E] border border-[#407F3E] hover:bg-[#407F3E]/5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title="Nhập danh sách phân công GVHD từ file Excel"
            >
              <Upload className="w-4 h-4" />
              Nhập Excel
            </button>

            {/* Nút Xuất báo cáo (Đồng bộ chuẩn theo trang Kết quả kiến tập) */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportDropdownOpen(prev => !prev)}
                disabled={enrollments.length === 0}
                className={`px-4 py-2 bg-white text-[#407F3E] border border-[#407F3E] hover:bg-[#407F3E]/5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Xuất file Excel danh sách phân công GVHD"
              >
                <Download className="w-4 h-4" />
                Xuất báo cáo
                <ChevronDown className={`w-4 h-4 opacity-70 transition-transform duration-200 ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E7E0C4] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn mẫu xuất</p>
                  </div>
                  <button
                    onClick={() => handleExportOption('all')}
                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#407F3E] shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">Mẫu 1: Toàn bộ danh sách</div>
                      <div className="text-[11px] text-slate-400">Tất cả {rawTotalStudents} sinh viên trong đợt</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExportOption('assigned')}
                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#407F3E] shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">Mẫu 2: Đã phân công GVHD</div>
                      <div className="text-[11px] text-slate-400">{rawAssignedStudents} sinh viên đã có GVHD</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExportOption('unassigned')}
                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#407F3E] shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">Mẫu 3: Chưa phân công GVHD</div>
                      <div className="text-[11px] text-slate-400">{rawUnassignedStudents} sinh viên chưa có GVHD</div>
                    </div>
                  </button>
                  {(searchTerm || selectedClass || selectedStatus) && (
                    <button
                      onClick={() => handleExportOption('filtered')}
                      className="w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors cursor-pointer border-t border-slate-100"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-[#407F3E] shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">Xuất theo bộ lọc đang xem</div>
                        <div className="text-[11px] text-slate-400">{filteredEnrollments.length} sinh viên phù hợp</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* Bộ lọc Đợt kiến tập */}
            <div className="w-full sm:w-[300px]">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Đợt kiến tập</label>
              <SearchableDropdown
                options={campaignOptions}
                value={selectedCampaign}
                onChange={(val) => {
                  setSelectedCampaign(val);
                  setCurrentPage(1);
                }}
                placeholder={campaignOptions.length === 0 ? "Không có đợt kiến tập" : "Chọn đợt kiến tập..."}
                searchPlaceholder="Tìm đợt kiến tập..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Split View Container */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 md:gap-6 relative z-20">

        {/* ================= LEFT PANEL: SINH VIÊN ================= */}
        <div className="w-full lg:w-2/3 xl:w-[68%] bg-white rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col h-full overflow-hidden">
          {/* Header & Filters */}
          <div className="p-3 border-b border-[#E7E0C4] bg-slate-50/50 rounded-t-xl flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#407F3E]/10 p-2 rounded-lg text-[#407F3E]">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-800">Danh sách Sinh viên</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviewAutoAssign}
                disabled={rawUnassignedStudents === 0 || loadingAutoAssign || !selectedCampaign}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer ${rawUnassignedStudents === 0 || loadingAutoAssign || !selectedCampaign
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-white border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E] hover:text-white'
                  }`}
              >
                {loadingAutoAssign ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Info className="w-3.5 h-3.5" />}
                Phân công tự động
              </button>
            </div>
          </div>

          <div className="p-3 border-b border-[#E7E0C4] flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm MSSV, Tên, Lớp..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all"
              />
            </div>

            {/* Lớp Filter */}
            <div className="min-w-[150px]">
              <SearchableDropdown
                options={[
                  { value: '', label: 'Tất cả lớp' },
                  ...classList.map(cls => ({ value: cls, label: cls }))
                ]}
                value={selectedClass}
                onChange={(val) => {
                  setSelectedClass(val);
                  setCurrentPage(1);
                }}
                placeholder="Tất cả lớp"
                searchPlaceholder="Tìm lớp..."
                className="w-full"
              />
            </div>

            {/* Trạng thái Filter */}
            <div className="min-w-[170px]">
              <SearchableDropdown
                options={[
                  { value: '', label: 'Tất cả trạng thái' },
                  { value: 'Đã phân công', label: 'Đã phân công' },
                  { value: 'Chưa phân công', label: 'Chưa phân công' }
                ]}
                value={selectedStatus}
                onChange={(val) => {
                  setSelectedStatus(val);
                  setCurrentPage(1);
                }}
                placeholder="Tất cả trạng thái"
                searchPlaceholder="Tìm trạng thái..."
                className="w-full"
              />
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto bg-white relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 gap-2 bg-white/50 backdrop-blur-sm z-10">
                <RefreshCw className="animate-spin w-5 h-5 text-[#407F3E]" />
                <span className="font-medium text-sm">Đang tải danh sách...</span>
              </div>
            ) : null}

            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#E7E0C4]/40 backdrop-blur-md text-slate-800 text-[10px] font-bold uppercase tracking-wider z-20 shadow-sm">
                <tr>
                  <th className="p-3 pl-4 w-10">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-3">MSSV</th>
                  <th className="p-3">Họ tên sinh viên</th>
                  <th className="p-3">Lớp</th>
                  <th className="p-3">Trạng thái / GVHD</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                {paginatedEnrollments.map(sv => {
                  const currentAdvisorName = sv.sinhVien?.details?.giangVienHuongDan?.ho_ten || sv.giangVienHuongDan?.ho_ten || sv.gvhd;
                  return (
                    <tr
                      key={sv.id}
                      onClick={() => toggleSelect(sv.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${sv.checked ? 'bg-[#89B449]/10' : ''}`}
                    >
                      <td className="p-3 pl-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 text-[#407F3E] border-slate-300 rounded focus:ring-[#407F3E] cursor-pointer"
                          checked={sv.checked}
                          onChange={() => toggleSelect(sv.id)}
                        />
                      </td>
                      <td className={`p-3 font-mono font-bold text-xs ${sv.checked ? 'text-[#407F3E]' : 'text-slate-500'}`}>{sv.sinhVien?.mssv}</td>
                      <td className="p-3 font-bold text-slate-800 text-xs">{sv.sinhVien?.ho_ten}</td>
                      <td className="p-3 font-medium text-slate-600 text-xs">{sv.sinhVien?.ten_lop}</td>
                      <td className="p-3">
                        {currentAdvisorName ? (
                          <div className="flex items-center gap-1.5 w-max px-2.5 py-1 rounded-md bg-[#E7E0C4]/40 border border-[#E7E0C4]">
                            <UserCircle className="w-3.5 h-3.5 text-[#407F3E]" />
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]" title={currentAdvisorName}>{currentAdvisorName}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200 uppercase tracking-wide">
                            Trống
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {paginatedEnrollments.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-500">
                      {!selectedCampaign ? (
                        <div className="flex flex-col items-center">
                          <Search className="w-10 h-10 mb-3 opacity-20" />
                          <span className="text-sm font-medium">Vui lòng chọn đợt kiến tập</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">Không tìm thấy sinh viên nào.</span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {selectedCampaign && (
            <div className="p-3 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span>Hiển thị</span>
                <SearchableDropdown
                  options={[
                    { value: 15, label: '15' },
                    { value: 30, label: '30' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' }
                  ]}
                  value={limit}
                  onChange={(newLimit) => {
                    setLimit(newLimit);
                    setCurrentPage(1);
                  }}
                  searchPlaceholder="Tìm số lượng..."
                  className="min-w-[80px]"
                  direction="up"
                />
                <span>/ {totalItems} sinh viên</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Trang đầu
                </button>
                <button
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Trước
                </button>

                <span className="px-3 py-1 rounded-lg bg-[#407F3E] text-white text-xs font-bold shadow-sm cursor-default mx-0.5">
                  Trang {validCurrentPage} / {totalPages || 1}
                </span>

                <button
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Sau
                </button>
                <button
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Trang cuối
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT PANEL: GIẢNG VIÊN ================= */}
        <div className="w-full lg:w-1/3 xl:w-[32%] bg-white rounded-xl shadow-lg border border-[#E7E0C4] flex flex-col h-full relative overflow-hidden">
          {/* Right Panel Header */}
          <div className="p-2.5 bg-gradient-to-br from-[#407F3E] to-[#2c6b2d] text-white flex justify-between items-center shrink-0">
            <h2 className="font-bold text-sm flex items-center gap-1.5">
              <UserCircle className="w-4 h-4 opacity-80" />
              Giảng viên HD
            </h2>
            <div className="flex items-center gap-2 text-xs bg-white/10 rounded px-2 py-1 backdrop-blur-sm border border-white/10">
              <span className="font-medium opacity-90">Đang chọn:</span>
              <span className="font-bold bg-white text-[#407F3E] px-1.5 rounded-sm shadow-sm">
                {selectedCount}
              </span>
            </div>
          </div>

          <div className="p-3 border-b border-[#E7E0C4] bg-slate-50 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={lecturerSearch}
                onChange={(e) => setLecturerSearch(e.target.value)}
                placeholder="Tìm tên hoặc mã giảng viên..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Lecturer List */}
          <div className="flex-1 overflow-y-auto p-3 bg-slate-50 space-y-3 relative">
            {filteredLecturers.map(gv => {
              const isFull = gv.so_sv_toi_da_huong_dan && gv.so_sv_dang_huong_dan >= gv.so_sv_toi_da_huong_dan;
              const isSelected = selectedLecturer === gv.id;

              return (
                <div
                  key={gv.id}
                  onClick={() => {
                    if (!isFull) setSelectedLecturer(isSelected ? null : gv.id);
                  }}
                  className={`relative p-3 rounded-lg border transition-all duration-200 bg-white shadow-sm flex flex-col gap-2.5 ${isFull ? 'border-red-100 bg-red-50/30 cursor-not-allowed opacity-70' :
                      isSelected ? 'border-[#407F3E] ring-1 ring-[#407F3E] bg-[#407F3E]/5 cursor-pointer shadow-md transform scale-[1.01]' :
                        'border-[#E7E0C4] hover:border-[#407F3E] cursor-pointer'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-2 flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-[#407F3E] bg-[#407F3E] text-white' : 'border-slate-300 bg-white'
                        }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm truncate ${isSelected ? 'text-[#407F3E]' : 'text-slate-800'}`} title={gv.ho_ten}>{gv.ho_ten}</div>
                        <div className="text-[10px] text-slate-500 font-medium font-mono mt-0.5">{gv.ma_gv}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">SV Đang HD</div>
                      <div className={`text-sm font-black leading-none ${isFull ? 'text-red-500' : 'text-[#407F3E]'}`}>
                        {gv.so_sv_dang_huong_dan || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredLecturers.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-medium flex flex-col items-center">
                <Search className="w-10 h-10 mb-3 opacity-20" />
                Không tìm thấy giảng viên
              </div>
            )}
          </div>

          {/* Master Action Button */}
          <div className="p-3 border-t border-[#E7E0C4] bg-white shrink-0">
            <button
              onClick={() => handleBulkAssign(selectedLecturer)}
              disabled={selectedCount === 0 || !selectedLecturer}
              className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${selectedCount === 0 || !selectedLecturer
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  : 'bg-[#407F3E] text-white shadow-md hover:bg-[#2b5829] hover:shadow-lg'
                }`}
            >
              <UserPlus className="w-4 h-4" />
              {selectedCount === 0
                ? 'Vui lòng chọn Sinh viên'
                : !selectedLecturer
                  ? 'Vui lòng chọn 1 Giảng viên'
                  : `Phân công ${selectedCount} SV cho GV này`}
            </button>
          </div>
        </div>

      </div>

      {/* Auto Assign Preview Modal (Giữ nguyên) */}
      {isAutoAssignModalOpen && autoAssignPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Xác nhận phân công tự động</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Thuật toán chia đều SV cho các GV còn slot trống</p>
              </div>
              <button onClick={() => setIsAutoAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[65vh] overflow-y-auto">
              {autoAssignPreview.unassigned?.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Có {autoAssignPreview.unassigned.length} sinh viên không thể phân công do tất cả giảng viên đã đủ định mức hướng dẫn.</span>
                </div>
              )}

              {autoAssignPreview.assignments.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Danh sách phân công dự kiến ({autoAssignPreview.assignments.length} sinh viên)
                    </h4>
                    <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tìm MSSV, Tên, Lớp..."
                        value={autoAssignSearchTerm}
                        onChange={e => { setAutoAssignSearchTerm(e.target.value); setAutoAssignCurrentPage(1); }}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#407F3E]"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="border border-[#E7E0C4]/50 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="overflow-y-auto max-h-[50vh]">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#E7E0C4]/40 backdrop-blur-md text-slate-800 text-[10px] font-bold uppercase tracking-wider z-20 shadow-sm">
                          <tr>
                            <th className="p-3 pl-4">MSSV</th>
                            <th className="p-3">Họ tên sinh viên</th>
                            <th className="p-3">Lớp</th>
                            <th className="p-3">Giảng viên nhận</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {paginatedAutoAssign.map((a, i) => {
                            const originalIndex = autoAssignPreview.assignments.findIndex(item => item.sinhVien.id === a.sinhVien.id);
                            return (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 pl-4 font-mono font-bold text-xs text-slate-500">{a.sinhVien.mssv}</td>
                                <td className="p-3 font-bold text-slate-800 text-xs">{a.sinhVien.ho_ten}</td>
                                <td className="p-3 font-medium text-slate-600 text-xs">{a.sinhVien.ten_lop || 'N/A'}</td>
                                <td className="p-2 font-bold text-[#407F3E] relative" onClick={e => e.stopPropagation()}>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenLecturerDropdownId(openLecturerDropdownId === a.sinhVien.id ? null : a.sinhVien.id);
                                      setLecturerDropdownSearchTerm('');
                                    }}
                                    className="flex justify-between items-center w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:border-[#407F3E]"
                                  >
                                    <span className="truncate pr-2">{a.lecturer?.ho_ten || 'Chọn giảng viên'}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ${openLecturerDropdownId === a.sinhVien.id ? 'rotate-180' : ''}`} />
                                  </div>
                                  {openLecturerDropdownId === a.sinhVien.id && (
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1" onClick={e => e.stopPropagation()}>
                                      <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                                        <input
                                          type="text"
                                          placeholder="Tìm giảng viên..."
                                          value={lecturerDropdownSearchTerm}
                                          onChange={(e) => setLecturerDropdownSearchTerm(e.target.value)}
                                          className="w-full px-2 py-1 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E]"
                                          onClick={(e) => e.stopPropagation()}
                                          autoFocus
                                        />
                                      </div>
                                      <div className="max-h-48 overflow-y-auto">
                                        {lecturers.filter(l => l.ho_ten.toLowerCase().includes(lecturerDropdownSearchTerm.toLowerCase())).map(gv => (
                                          <div
                                            key={gv.id}
                                            onClick={() => {
                                              if (originalIndex !== -1) {
                                                const newAssignments = [...autoAssignPreview.assignments];
                                                newAssignments[originalIndex].lecturer = gv;
                                                newAssignments[originalIndex].lecturerId = gv.id;
                                                setAutoAssignPreview({
                                                  ...autoAssignPreview,
                                                  assignments: newAssignments
                                                });
                                              }
                                              setOpenLecturerDropdownId(null);
                                            }}
                                            className={`px-3 py-1.5 text-xs cursor-pointer flex justify-between items-center hover:bg-slate-50 ${a.lecturerId === gv.id ? 'font-bold text-[#407F3E] bg-[#407F3E]/5' : 'text-slate-700'}`}
                                          >
                                            <span>{gv.ho_ten}</span>
                                            {a.lecturerId === gv.id && <Check className="w-3.5 h-3.5 text-[#407F3E]" />}
                                          </div>
                                        ))}
                                        {lecturers.filter(l => l.ho_ten.toLowerCase().includes(lecturerDropdownSearchTerm.toLowerCase())).length === 0 && (
                                          <div className="px-3 py-2 text-xs text-slate-400 text-center">Không tìm thấy giảng viên</div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination Footer */}
                    <div className="bg-[#F8F9FA] px-4 py-3 border-t border-[#E7E0C4]/50 flex items-center justify-between text-xs shrink-0">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        Hiển thị
                        <SearchableDropdown
                          options={[
                            { value: 10, label: '10' },
                            { value: 30, label: '30' },
                            { value: 50, label: '50' },
                            { value: 100, label: '100' }
                          ]}
                          value={autoAssignLimit}
                          onChange={(newLimit) => {
                            setAutoAssignLimit(newLimit);
                            setAutoAssignCurrentPage(1);
                          }}
                          searchPlaceholder="Tìm số lượng..."
                          className="min-w-[80px]"
                          direction="up"
                        />
                        / {filteredAutoAssign.length} sinh viên
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setAutoAssignCurrentPage(1)}
                          disabled={autoAssignCurrentPage === 1}
                          className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >Trang đầu</button>
                        <button
                          onClick={() => setAutoAssignCurrentPage(p => Math.max(1, p - 1))}
                          disabled={autoAssignCurrentPage === 1}
                          className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >Trước</button>
                        <span className="px-3 py-1 rounded bg-[#407F3E] text-white font-bold shadow-sm">Trang {autoAssignCurrentPage} / {totalAutoAssignPages}</span>
                        <button
                          onClick={() => setAutoAssignCurrentPage(p => Math.min(totalAutoAssignPages, p + 1))}
                          disabled={autoAssignCurrentPage === totalAutoAssignPages}
                          className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >Sau</button>
                        <button
                          onClick={() => setAutoAssignCurrentPage(totalAutoAssignPages)}
                          disabled={autoAssignCurrentPage === totalAutoAssignPages}
                          className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >Trang cuối</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsAutoAssignModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmAutoAssign}
                disabled={loadingAutoAssign || autoAssignPreview.assignments.length === 0}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#407F3E] border border-[#407F3E] hover:bg-[#2b5829] transition-all flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAutoAssign ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Xác nhận phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Preview Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#407F3E]" />
                  Xem trước phân công GVHD từ Excel
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  File: <span className="font-semibold text-slate-700">{importFileName}</span> • Tổng số: <span className="font-semibold text-slate-700">{importParsedList.length}</span> dòng
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-white border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="Tải file Excel mẫu chuẩn"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải file mẫu (.xlsx)
                </button>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Switchable Tabs & Filter Pills */}
            <div className="px-5 pt-3 pb-2 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImportActiveTab('students')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    importActiveTab === 'students'
                      ? 'bg-[#407F3E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Danh sách sinh viên ({importParsedList.length})
                </button>
                <button
                  onClick={() => setImportActiveTab('workload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    importActiveTab === 'workload'
                      ? 'bg-[#407F3E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <UserCircle className="w-3.5 h-3.5" />
                  Tải trọng giảng viên ({importWorkloadList.length})
                  {importWorkloadList.some(w => w.isOverloaded) && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Có giảng viên vượt định mức"></span>
                  )}
                </button>
              </div>

              {/* Filter Pills when on Tab 1 */}
              {importActiveTab === 'students' && (
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => setImportFilterStatus('ALL')}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                      importFilterStatus === 'ALL'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả ({importParsedList.length})
                  </button>
                  <button
                    onClick={() => setImportFilterStatus('VALID')}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                      importFilterStatus === 'VALID'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Hợp lệ ({importParsedList.filter(i => i.status === 'VALID').length})
                  </button>
                  <button
                    onClick={() => setImportFilterStatus('UNCHANGED')}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                      importFilterStatus === 'UNCHANGED'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Giữ nguyên ({importParsedList.filter(i => i.status === 'UNCHANGED').length})
                  </button>
                  <button
                    onClick={() => setImportFilterStatus('ERROR')}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                      importFilterStatus === 'ERROR'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    Lỗi ({importParsedList.filter(i => i.status === 'ERROR').length})
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              {importActiveTab === 'students' ? (
                /* Tab 1: Danh sách sinh viên */
                <div className="border border-[#E7E0C4] rounded-xl overflow-hidden shadow-xs bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#E7E0C4]/40 backdrop-blur-md text-slate-800 text-[10px] font-bold uppercase tracking-wider z-20 shadow-xs">
                      <tr>
                        <th className="p-3 pl-4 w-12 text-center">STT</th>
                        <th className="p-3 w-28">MSSV</th>
                        <th className="p-3">Họ tên sinh viên</th>
                        <th className="p-3 w-24">Lớp</th>
                        <th className="p-3">GVHD Hiện tại</th>
                        <th className="p-3">GVHD Chỉ định</th>
                        <th className="p-3">Trạng thái / Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                      {importParsedList
                        .filter(item => {
                          if (importFilterStatus === 'ALL') return true;
                          return item.status === importFilterStatus;
                        })
                        .map((item, idx) => {
                          let badgeBg = 'bg-slate-100 text-slate-600 border-slate-200';
                          let badgeText = item.reason;
                          let icon = null;

                          if (item.status === 'VALID') {
                            badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                            badgeText = 'Hợp lệ';
                            icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
                          } else if (item.status === 'UNCHANGED') {
                            badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
                            badgeText = item.reason || 'Giữ nguyên';
                            icon = <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
                          } else if (item.status === 'ERROR') {
                            badgeBg = 'bg-red-50 text-red-700 border-red-200';
                            badgeText = item.reason || 'Lỗi';
                            icon = <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />;
                          }

                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 pl-4 text-center font-medium text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-mono font-bold text-slate-700">{item.mssv}</td>
                              <td className="p-3 font-bold text-slate-800">{item.ho_ten}</td>
                              <td className="p-3 text-slate-600">{item.ten_lop}</td>
                              <td className="p-3 text-slate-600">
                                <span className="truncate block max-w-[140px]" title={item.currentAdvisor}>
                                  {item.currentAdvisor}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-[#407F3E]">
                                <span className="truncate block max-w-[160px]" title={item.assignedGvText}>
                                  {item.assignedGvText}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium ${badgeBg}`}>
                                  {icon}
                                  <span>{badgeText}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Tab 2: Tải trọng giảng viên */
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Bảng tải trọng mô phỏng số lượng sinh viên thay đổi cho từng giảng viên nếu xác nhận import danh sách hợp lệ.
                    </span>
                  </div>
                  <div className="border border-[#E7E0C4] rounded-xl overflow-hidden shadow-xs bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#E7E0C4]/40 backdrop-blur-md text-slate-800 text-[10px] font-bold uppercase tracking-wider z-20 shadow-xs">
                        <tr>
                          <th className="p-3 pl-4 w-12 text-center">STT</th>
                          <th className="p-3 w-28">Mã GV</th>
                          <th className="p-3">Họ tên giảng viên</th>
                          <th className="p-3 text-center">SV Hiện tại</th>
                          <th className="p-3 text-center">Thay đổi (+/-)</th>
                          <th className="p-3 text-center">Dự kiến sau import</th>
                          <th className="p-3 text-center">Định mức</th>
                          <th className="p-3 text-center">Trạng thái tải</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                        {importWorkloadList.map((gv, idx) => {
                          const quota = gv.maxQuota || 40;
                          let loadBadge = (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              An toàn
                            </span>
                          );

                          if (gv.isOverloaded) {
                            loadBadge = (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                Vượt định mức
                              </span>
                            );
                          } else if (gv.projectedCount === quota) {
                            loadBadge = (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Đầy tải ({quota}/{quota})
                              </span>
                            );
                          }

                          return (
                            <tr key={gv.id} className={`hover:bg-slate-50 transition-colors ${gv.isOverloaded ? 'bg-red-50/40' : ''}`}>
                              <td className="p-3 pl-4 text-center font-medium text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-mono font-bold text-slate-700">{gv.ma_gv}</td>
                              <td className="p-3 font-bold text-slate-800">{gv.ho_ten}</td>
                              <td className="p-3 text-center font-semibold text-slate-600">{gv.currentCount}</td>
                              <td className="p-3 text-center font-bold">
                                {gv.delta > 0 ? (
                                  <span className="text-emerald-600">+{gv.delta}</span>
                                ) : gv.delta < 0 ? (
                                  <span className="text-amber-600">{gv.delta}</span>
                                ) : (
                                  <span className="text-slate-400">0</span>
                                )}
                              </td>
                              <td className="p-3 text-center font-bold text-[#407F3E]">
                                {gv.projectedCount}
                              </td>
                              <td className="p-3 text-center text-slate-600 font-medium">
                                {gv.maxQuota || '40'}
                              </td>
                              <td className="p-3 text-center">
                                {loadBadge}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Pinned at bottom) */}
            <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-600">
                Tổng cộng: <strong className="text-emerald-600">{importParsedList.filter(i => i.status === 'VALID').length} hợp lệ</strong>,{' '}
                <strong className="text-blue-600">{importParsedList.filter(i => i.status === 'UNCHANGED').length} giữ nguyên</strong>
                {importParsedList.filter(i => i.status === 'ERROR').length > 0 && (
                  <>, <strong className="text-red-600">{importParsedList.filter(i => i.status === 'ERROR').length} lỗi</strong></>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={
                    isImporting ||
                    importParsedList.filter(i => i.status === 'VALID').length === 0 ||
                    importWorkloadList.some(w => w.isOverloaded)
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm ${
                    isImporting ||
                    importParsedList.filter(i => i.status === 'VALID').length === 0 ||
                    importWorkloadList.some(w => w.isOverloaded)
                      ? 'bg-slate-300 border border-slate-300 cursor-not-allowed opacity-70'
                      : 'bg-[#407F3E] border border-[#407F3E] hover:bg-[#2b5829] cursor-pointer'
                  }`}
                >
                  {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Xác nhận phân công ({importParsedList.filter(i => i.status === 'VALID').length} hợp lệ)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all scale-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">{confirmDialog.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  closeConfirm();
                  if (action) action();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#407F3E] hover:bg-[#407F3E]/90 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Vẫn xuất file
              </button>
            </div>
          </div>
        </div>
      )}
    </EdgeToEdgeContainer>
  );
}
