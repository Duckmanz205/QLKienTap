import toast from 'react-hot-toast';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Info, ChevronDown, Check, Save, Plus, Minus, Search, Lock,
  FileSpreadsheet, UploadCloud, Download, AlertCircle, CheckCircle2, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { giangVienApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import { exportPrepGradesTemplate } from '../../utils/exportExcel';

export default function DiemChuanBi_DiemCong_GV() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [lecturer, setLecturer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [students, setStudents] = useState([]);

  // State cho Modal Nhập nhanh Excel
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [isSavingImport, setIsSavingImport] = useState(false);
  const [modifiedStudentIds, setModifiedStudentIds] = useState(new Set());
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchTrips(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchTrips = async (gvId) => {
    try {
      const res = await giangVienApi.getLedTrips(gvId);
      const tripsData = res.data || [];
      const formattedTrips = tripsData.map(t => ({
        id: t.id,
        name: `${t.nhaMay?.ten_nha_may || 'Chuyến đi'} (${new Date(t.ngay_tham_quan || t.ngay_khoi_hanh || Date.now()).toLocaleDateString('vi-VN')})`
      }));
      setTrips(formattedTrips);
      if (formattedTrips.length > 0) {
        setSelectedTrip(formattedTrips[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedTrip) {
      fetchStudents(selectedTrip.id);
      setCurrentPage(1);
    }
  }, [selectedTrip]);

  const fetchStudents = async (tripId) => {
    try {
      setLoading(true);
      const res = await giangVienApi.getTripRegistrations(tripId);
      const data = res.data || [];

      const mapped = data.map(phieu => ({
        id: phieu.id, // phieuId
        mssv: phieu.sinhVien?.mssv,
        name: phieu.sinhVien?.ho_ten,
        diemChuanBi: phieu.diemPhieuThamQuan?.diem_chuan_bi !== undefined && phieu.diemPhieuThamQuan.diem_chuan_bi !== null ? String(phieu.diemPhieuThamQuan.diem_chuan_bi) : '',
        diemCong: phieu.diemPhieuThamQuan?.diem_cong !== undefined && phieu.diemPhieuThamQuan.diem_cong !== null ? Number(phieu.diemPhieuThamQuan.diem_cong) : 0,
        da_khoa: phieu.diemPhieuThamQuan?.da_khoa ?? false,
        da_khoa_chuan_bi: phieu.diemPhieuThamQuan?.da_khoa_chuan_bi ?? false,
        ngay_khoa_chuan_bi: phieu.diemPhieuThamQuan?.ngay_khoa_chuan_bi ?? null,
        ghiChu: '' // not stored in DB currently based on API, but keep in UI
      }));

      setStudents(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (id, field, value) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleBonusChange = (id, delta) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        let newBonus = s.diemCong + delta;
        if (newBonus > 1.0) newBonus = 1.0;
        if (newBonus < 0) newBonus = 0;
        return { ...s, diemCong: newBonus };
      }
      return s;
    }));
  };

  const isTripLocked = useMemo(() => {
    if (students.length === 0) return false;
    return students.every(s => s.da_khoa || s.da_khoa_chuan_bi);
  }, [students]);

  const lockDate = useMemo(() => {
    const s = students.find(s => s.ngay_khoa_chuan_bi);
    return s?.ngay_khoa_chuan_bi ? new Date(s.ngay_khoa_chuan_bi).toLocaleDateString('vi-VN') : null;
  }, [students]);

  const handleLockScores = async () => {
    if (students.length === 0 || !selectedTrip) return;
    const missing = students.filter(s => s.diemChuanBi === '' || s.diemChuanBi === null || s.diemChuanBi === undefined);
    if (missing.length > 0) {
      toast.error(`Còn ${missing.length} sinh viên chưa có điểm chuẩn bị. Vui lòng nhập điểm trước khi nộp lên Khoa.`);
      return;
    }

    try {
      setLoading(true);
      // Auto save scores first using batch API
      const records = students.map(student => ({
        phieuId: student.id,
        diemChuanBi: Number(student.diemChuanBi),
        diemCong: Number(student.diemCong || 0)
      }));
      await giangVienApi.gradePrepAndBonusBatch({
        tripId: selectedTrip.id,
        records
      });

      // Call lock API
      const res = await giangVienApi.lockTripPrepGrades({ tripId: selectedTrip.id });
      toast.success(res.data?.message || 'Đã khóa và nộp điểm chuyến đi lên Khoa thành công!');
      fetchStudents(selectedTrip.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi nộp điểm lên Khoa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScores = async () => {
    if (students.length === 0 || !selectedTrip) return;
    try {
      setLoading(true);
      const records = students.map(student => ({
        phieuId: student.id,
        diemChuanBi: student.diemChuanBi !== '' && student.diemChuanBi !== null && student.diemChuanBi !== undefined ? Number(student.diemChuanBi) : 0,
        diemCong: Number(student.diemCong || 0)
      }));
      await giangVienApi.gradePrepAndBonusBatch({
        tripId: selectedTrip.id,
        records
      });
      toast.success('Đã lưu điểm chuẩn bị & điểm cộng thành công!');
      setModifiedStudentIds(new Set());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu điểm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tải file mẫu Excel
  const handleDownloadTemplate = () => {
    if (!selectedTrip || students.length === 0) {
      toast.error('Vui lòng chọn chuyến tham quan có sinh viên để tải mẫu');
      return;
    }
    exportPrepGradesTemplate(selectedTrip.name, students);
    toast.success('Đã tải xuống file Excel mẫu thành công!');
  };

  // Đọc và phân tích file Excel
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setIsParsing(true);
    setImportPreview(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        if (!ws) {
          toast.error('File Excel không có dữ liệu bảng tính');
          setIsParsing(false);
          return;
        }

        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (!rawRows || rawRows.length === 0) {
          toast.error('File Excel rỗng');
          setIsParsing(false);
          return;
        }

        let headerRowIdx = -1;
        let mssvColIdx = -1;
        let prepColIdx = -1;
        let bonusColIdx = -1;

        for (let i = 0; i < Math.min(10, rawRows.length); i++) {
          const row = rawRows[i];
          if (!Array.isArray(row)) continue;
          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || '').trim().toLowerCase();
            if (
              cell === 'mssv' || cell === 'mã sv' || cell === 'mã sinh viên' ||
              cell === 'ma sv' || cell === 'masv' || cell.includes('mssv') || cell === 'student id'
            ) {
              if (mssvColIdx === -1) mssvColIdx = j;
            }
            if (
              cell.includes('chuẩn bị') || cell.includes('chuan bi') ||
              cell === 'điểm' || cell === 'diem' || cell === 'score' || cell === 'prelim'
            ) {
              if (prepColIdx === -1) prepColIdx = j;
            }
            if (
              cell.includes('cộng') || cell.includes('cong') ||
              cell === 'bonus' || cell === 'extra'
            ) {
              if (bonusColIdx === -1) bonusColIdx = j;
            }
          }
          if (mssvColIdx !== -1 && prepColIdx !== -1) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1 || mssvColIdx === -1 || prepColIdx === -1) {
          for (let i = 0; i < Math.min(10, rawRows.length); i++) {
            const row = rawRows[i];
            if (!Array.isArray(row)) continue;
            const colIdx = row.findIndex(c => String(c || '').toLowerCase().includes('mssv'));
            if (colIdx !== -1) {
              headerRowIdx = i;
              mssvColIdx = colIdx;
              prepColIdx = row.findIndex((c, idx) =>
                idx !== mssvColIdx && (
                  String(c || '').toLowerCase().includes('điểm') ||
                  String(c || '').toLowerCase().includes('diem') ||
                  String(c || '').toLowerCase().includes('score')
                )
              );
              if (prepColIdx === -1 && row.length > mssvColIdx + 2) {
                prepColIdx = mssvColIdx + 2;
              }
              break;
            }
          }
        }

        if (mssvColIdx === -1 || prepColIdx === -1) {
          toast.error('Không tìm thấy cột MSSV hoặc Điểm chuẩn bị trong file. Vui lòng kiểm tra lại tiêu đề cột.');
          setIsParsing(false);
          return;
        }

        const parseScore = (val) => {
          if (val === undefined || val === null || val === '') return null;
          if (typeof val === 'number') return isNaN(val) ? null : val;
          const str = String(val).trim().replace(',', '.');
          const num = parseFloat(str);
          return isNaN(num) ? null : num;
        };

        const studentMap = new Map();
        students.forEach(s => {
          if (s.mssv) studentMap.set(String(s.mssv).trim().toLowerCase(), s);
        });

        const matched = [];
        const unmatched = [];
        const invalid = [];

        for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!Array.isArray(row) || row.length === 0) continue;

          const rawMssv = String(row[mssvColIdx] || '').trim();
          if (!rawMssv) continue;

          const rawPrep = row[prepColIdx];
          const parsedPrep = parseScore(rawPrep);

          if (parsedPrep === null || parsedPrep < 0 || parsedPrep > 10) {
            invalid.push({
              row: i + 1,
              mssv: rawMssv,
              rawScore: rawPrep,
              reason: 'Điểm chuẩn bị phải là số từ 0 đến 10'
            });
            continue;
          }

          let parsedBonus = 0;
          if (bonusColIdx !== -1 && row[bonusColIdx] !== undefined) {
            const b = parseScore(row[bonusColIdx]);
            if (b !== null && b >= 0 && b <= 1) {
              parsedBonus = Math.min(1.0, Math.max(0, b));
            }
          }

          const targetStudent = studentMap.get(rawMssv.toLowerCase());
          if (!targetStudent) {
            unmatched.push({
              row: i + 1,
              mssv: rawMssv,
              score: parsedPrep
            });
            continue;
          }

          matched.push({
            id: targetStudent.id,
            mssv: targetStudent.mssv,
            name: targetStudent.name,
            oldDiemChuanBi: targetStudent.diemChuanBi,
            newDiemChuanBi: String(parsedPrep),
            oldDiemCong: targetStudent.diemCong,
            newDiemCong: parsedBonus
          });
        }

        setImportPreview({
          totalRows: rawRows.length - (headerRowIdx + 1),
          matched,
          unmatched,
          invalid
        });
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi đọc file Excel');
      } finally {
        setIsParsing(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // Áp dụng điểm vào bảng điểm trên giao diện
  const handleApplyImport = () => {
    if (!importPreview || importPreview.matched.length === 0) {
      toast.error('Không có sinh viên hợp lệ để áp dụng');
      return;
    }

    const matchedMap = new Map(importPreview.matched.map(m => [m.id, m]));
    const newlyModified = new Set(modifiedStudentIds);

    setStudents(prev => prev.map(s => {
      const match = matchedMap.get(s.id);
      if (match) {
        newlyModified.add(s.id);
        return {
          ...s,
          diemChuanBi: match.newDiemChuanBi,
          diemCong: match.newDiemCong
        };
      }
      return s;
    }));

    setModifiedStudentIds(newlyModified);
    setIsImportModalOpen(false);
    toast.success(`Đã áp dụng điểm từ file Excel cho ${importPreview.matched.length} sinh viên! Bấm "Lưu điểm" để hoàn tất.`);
  };

  // Áp dụng và lưu điểm ngay lập tức lên máy chủ
  const handleApplyAndSaveImmediately = async () => {
    if (!importPreview || importPreview.matched.length === 0 || !selectedTrip) {
      toast.error('Không có sinh viên hợp lệ để lưu');
      return;
    }

    try {
      setIsSavingImport(true);
      const records = importPreview.matched.map(m => ({
        phieuId: m.id,
        diemChuanBi: Number(m.newDiemChuanBi),
        diemCong: Number(m.newDiemCong || 0)
      }));

      await giangVienApi.gradePrepAndBonusBatch({
        tripId: selectedTrip.id,
        records
      });

      const matchedMap = new Map(importPreview.matched.map(m => [m.id, m]));
      setStudents(prev => prev.map(s => {
        const match = matchedMap.get(s.id);
        if (match) {
          return {
            ...s,
            diemChuanBi: match.newDiemChuanBi,
            diemCong: match.newDiemCong
          };
        }
        return s;
      }));

      toast.success(`Đã cập nhật và lưu thành công điểm cho ${records.length} sinh viên lên hệ thống!`);
      setIsImportModalOpen(false);
      setModifiedStudentIds(new Set());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu điểm vào hệ thống');
      console.error(err);
    } finally {
      setIsSavingImport(false);
    }
  };

  // Filtered & Paginated logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (s.name && s.name.toLowerCase().includes(q)) || (s.mssv && s.mssv.includes(q));
    });
  }, [students, searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / limit) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative">

      {/* Header with Title and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Điểm chuẩn bị & điểm cộng</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Quản lý và nhập điểm chuẩn bị, điểm cộng cho sinh viên tham gia chuyến đi</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {isTripLocked ? (
            <div className="px-4 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl shadow-xs flex items-center gap-2 text-xs font-bold">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Đã nộp điểm lên Khoa {lockDate ? `ngày ${lockDate}` : ''}</span>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                disabled={loading || students.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Nhập nhanh điểm từ file Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Nhập từ Excel
              </button>
              <button
                onClick={handleSaveScores}
                disabled={loading || students.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 text-slate-500" />
                Lưu điểm
              </button>
              <button
                onClick={handleLockScores}
                disabled={loading || students.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                Khóa & Nộp điểm chuyến đi
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">

        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo MSSV/họ tên..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all text-slate-800 font-medium"
          />
        </div>

        {/* Trip Selector Dropdown */}
        <SearchableDropdown
          options={trips.map(t => ({
            value: t.id,
            label: t.name
          }))}
          value={selectedTrip?.id || ''}
          onChange={(val) => {
            const found = trips.find(t => t.id === val);
            if (found) setSelectedTrip(found);
          }}
          placeholder={trips.length > 0 ? "Chọn chuyến đi..." : "Đang tải chuyến..."}
          searchPlaceholder="Tìm chuyến đi..."
          className="min-w-[280px] flex-1"
        />

      </div>

      {/* Info Banner */}
      <div className="bg-[#E7E0C4] rounded-xl p-4 flex items-start gap-3 shadow-sm border border-[#E7E0C4]/50 mb-8">
        <Info className="w-5 h-5 text-[#407F3E] shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-slate-700 leading-relaxed">
          <strong className="text-slate-800">Lưu ý:</strong> Điểm chuẩn bị lấy từ bài kiểm tra tổ chức ngoài hệ thống (Google Form/Kahoot...). Điểm cộng tối đa là 1.0 điểm/chuyến.
        </p>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 min-w-[120px]">MSSV</th>
                <th className="p-4 min-w-[200px]">Họ tên</th>
                <th className="p-4 text-center min-w-[150px]">Điểm chuẩn bị<br /><span className="text-[10px] text-slate-500 font-medium normal-case">(Hệ số 10)</span></th>
                <th className="p-4 text-center min-w-[180px]">Điểm cộng</th>
                <th className="p-4 pr-6 min-w-[200px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Không tìm thấy sinh viên nào.</td>
                </tr>
              ) : (
                paginatedStudents.map(student => (
                  <tr
                    key={student.id}
                    className={`transition-colors group ${
                      modifiedStudentIds.has(student.id)
                        ? 'bg-emerald-50/70 hover:bg-emerald-100/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >

                    <td className="p-4 pl-6 font-mono font-bold text-slate-600">{student.mssv}</td>

                    <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                      {student.name}
                      {modifiedStudentIds.has(student.id) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Excel
                        </span>
                      )}
                      {student.da_khoa && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E68A8C]/10 text-[#E68A8C] border border-[#E68A8C]/20">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center">
                        <input
                          type="number"
                          min="0" max="10" step="0.1"
                          disabled={isTripLocked || student.da_khoa}
                          value={student.diemChuanBi}
                          onChange={(e) => handleScoreChange(student.id, 'diemChuanBi', e.target.value)}
                          placeholder="--"
                          className={`w-20 px-3 py-2 text-center rounded-lg text-sm font-bold transition-all placeholder-slate-300 ${
                            isTripLocked || student.da_khoa
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-white border border-[#E7E0C4] text-[#407F3E] focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]'
                          }`}
                        />
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <button
                            onClick={() => handleBonusChange(student.id, -0.5)}
                            disabled={student.diemCong <= 0 || isTripLocked || student.da_khoa}
                            className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <div className="w-16 text-center font-bold text-xs">
                            <span className={student.diemCong > 0 ? "text-[#89B449]" : "text-slate-500"}>
                              {student.diemCong > 0 ? `+${student.diemCong.toFixed(1)}` : '0.0'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleBonusChange(student.id, 0.5)}
                            disabled={student.diemCong >= 1.0 || isTripLocked || student.da_khoa}
                            className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:text-[#407F3E] hover:border-[#407F3E] hover:bg-[#407F3E]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xs group"
                          >
                            <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">Tối đa 1.0 đ</span>
                      </div>
                    </td>

                    <td className="p-4 pr-6">
                      <input
                        type="text"
                        value={student.ghiChu}
                        onChange={(e) => handleScoreChange(student.id, 'ghiChu', e.target.value)}
                        placeholder="Ghi chú (tùy chọn)..."
                        className="w-full px-3 py-2 bg-transparent border-b border-transparent hover:border-[#E7E0C4] focus:bg-white focus:border-[#E7E0C4] focus:outline-none focus:ring-1 focus:ring-[#E7E0C4] rounded-none focus:rounded-md text-xs text-slate-700 placeholder-slate-300 transition-all"
                      />
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
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
            <span>/ {filteredStudents.length} sinh viên</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>

      {/* Modal Nhập nhanh điểm từ file Excel */}
      {isImportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => {
            if (!isSavingImport) {
              setIsImportModalOpen(false);
              setImportPreview(null);
              setImportFile(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Nhập nhanh điểm chuẩn bị từ file Excel</h3>
                  <p className="text-xs text-slate-500 font-medium">Chuyến: {selectedTrip?.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isSavingImport) {
                    setIsImportModalOpen(false);
                    setImportPreview(null);
                    setImportFile(null);
                  }
                }}
                disabled={isSavingImport}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Instructions & Template download */}
              <div className="bg-[#E7E0C4]/30 border border-[#E7E0C4] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-[#407F3E] shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-bold">Quy chuẩn file Excel:</p>
                    <p>• Cột bắt buộc: <strong className="text-slate-900">MSSV</strong> (hoặc Mã SV) và <strong className="text-slate-900">Điểm chuẩn bị</strong> (thang điểm 0–10).</p>
                    <p>• Cột tùy chọn: <strong className="text-slate-900">Điểm cộng</strong> (tối đa 1.0 điểm).</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="shrink-0 flex items-center gap-2 px-3 py-2 bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Tải file mẫu Excel
                </button>
              </div>

              {/* Upload Dropzone */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#407F3E] bg-slate-50/50 hover:bg-[#407F3E]/5 rounded-xl p-6 text-center transition-all cursor-pointer group"
                >
                  <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-[#407F3E] mx-auto mb-2 transition-colors" />
                  <p className="text-sm font-bold text-slate-700 group-hover:text-[#407F3E] transition-colors">
                    {importFile ? importFile.name : 'Bấm để chọn file Excel (.xlsx, .xls) từ máy tính'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {importFile ? `${(importFile.size / 1024).toFixed(1)} KB — Bấm để chọn tệp khác` : 'Hệ thống tự động so khớp MSSV và cập nhật điểm tương ứng'}
                  </p>
                </div>
              </div>

              {/* Parsing status */}
              {isParsing && (
                <div className="p-4 text-center text-slate-500 text-sm font-medium animate-pulse">
                  Đang đọc và phân tích dữ liệu file Excel...
                </div>
              )}

              {/* Preview result */}
              {importPreview && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Summary badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-lg font-black text-emerald-800">
                          {importPreview.matched.length} / {students.length}
                        </div>
                        <div className="text-xs font-medium text-emerald-700">Sinh viên khớp danh sách</div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                      <div>
                        <div className="text-lg font-black text-amber-800">
                          {importPreview.unmatched.length}
                        </div>
                        <div className="text-xs font-medium text-amber-700">Ngoài danh sách chuyến</div>
                      </div>
                    </div>

                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-3">
                      <X className="w-6 h-6 text-rose-600 shrink-0" />
                      <div>
                        <div className="text-lg font-black text-rose-800">
                          {importPreview.invalid.length}
                        </div>
                        <div className="text-xs font-medium text-rose-700">Dòng có điểm lỗi</div>
                      </div>
                    </div>
                  </div>

                  {/* Warning lists if any */}
                  {importPreview.invalid.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 max-h-28 overflow-y-auto">
                      <p className="font-bold mb-1">Cảnh báo dòng lỗi (bị bỏ qua):</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {importPreview.invalid.map((inv, idx) => (
                          <li key={idx}>Dòng {inv.row} (MSSV: {inv.mssv}): {inv.reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importPreview.unmatched.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 max-h-24 overflow-y-auto">
                      <p className="font-bold mb-1">MSSV không thuộc chuyến tham quan này (bị bỏ qua):</p>
                      <p className="text-slate-600">
                        {importPreview.unmatched.map(u => u.mssv).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Matched Preview Table */}
                  {importPreview.matched.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Xem trước dữ liệu cập nhật:</h4>
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                            <tr>
                              <th className="p-2.5 pl-4">MSSV</th>
                              <th className="p-2.5">Họ tên</th>
                              <th className="p-2.5 text-center">Điểm chuẩn bị mới</th>
                              <th className="p-2.5 text-center">Điểm cộng</th>
                              <th className="p-2.5 pr-4 text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {importPreview.matched.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50">
                                <td className="p-2.5 pl-4 font-mono font-bold text-slate-700">{item.mssv}</td>
                                <td className="p-2.5 text-slate-800 font-bold">{item.name}</td>
                                <td className="p-2.5 text-center">
                                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                    {item.newDiemChuanBi}
                                  </span>
                                  {item.oldDiemChuanBi && item.oldDiemChuanBi !== item.newDiemChuanBi && (
                                    <span className="text-slate-400 text-[10px] ml-1 line-through">
                                      ({item.oldDiemChuanBi})
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 text-center font-bold text-slate-600">
                                  {item.newDiemCong > 0 ? `+${item.newDiemCong}` : '0.0'}
                                </td>
                                <td className="p-2.5 pr-4 text-center">
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold">
                                    <Check className="w-3 h-3 text-emerald-600" /> Hợp lệ
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreview(null);
                  setImportFile(null);
                }}
                disabled={isSavingImport}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyImport}
                  disabled={!importPreview || importPreview.matched.length === 0 || isSavingImport}
                  className="px-4 py-2 bg-white text-[#407F3E] hover:bg-[#407F3E]/10 border border-[#407F3E] font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Áp dụng vào bảng điểm
                </button>
                <button
                  type="button"
                  onClick={handleApplyAndSaveImmediately}
                  disabled={!importPreview || importPreview.matched.length === 0 || isSavingImport}
                  className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSavingImport ? 'Đang lưu...' : 'Áp dụng & Lưu ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
