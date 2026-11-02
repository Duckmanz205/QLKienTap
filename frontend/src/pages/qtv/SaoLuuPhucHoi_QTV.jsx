import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Download,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  RefreshCw,
  X,
  FileCheck,
  HelpCircle,
} from 'lucide-react';
import { qtvApi } from '../../services/api';
import Toast from '../../components/Toast';

export default function SaoLuuPhucHoi_QTV() {
  // Thống kê tổng quan CSDL
  const [overview, setOverview] = useState({
    databaseName: 'QLKienTap',
    serverVersion: 'SQL Server',
    edition: 'Microsoft SQL Server',
    status: 'ONLINE',
    tableCount: 0,
    dataSizeMb: 0,
    logSizeMb: 0,
    totalSizeMb: 0,
    lastBackupDate: null,
  });
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Trạng thái các tác vụ
  const [directDownloadLoading, setDirectDownloadLoading] = useState(false);

  // Trạng thái Phục hồi (Restore)
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  // Modal xác nhận khôi phục nguy hiểm
  const [hazardModal, setHazardModal] = useState({
    isOpen: false,
    fileName: '',
    confirmText: '',
    hasConfirmedRisk: false,
  });

  // Toast thông báo
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fileInputRef = useRef(null);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      const res = await qtvApi.getDatabaseOverview();
      setOverview(res.data);
    } catch (err) {
      console.error('Lỗi khi tải thông tin CSDL:', err);
    } finally {
      setOverviewLoading(false);
    }
  };

  // Định dạng kích thước file từ byte
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // -------------------------------------------------------------
  // 1. TÁC VỤ SAO LƯU (BACKUP)
  // -------------------------------------------------------------

  // Tải về bản sao lưu trực tiếp (.bak)
  const handleDirectBackupDownload = async () => {
    setDirectDownloadLoading(true);
    try {
      const res = await qtvApi.downloadBackup();
      const blob = new Blob([res.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const fileName = `${overview.databaseName || 'QLKienTap'}_Backup_${timestamp}.bak`;

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setToast({
        show: true,
        message: 'Tải về bản sao lưu thành công!',
        type: 'success',
      });
      fetchOverview();
    } catch (err) {
      console.error('Lỗi khi tải bản sao lưu:', err);
      setToast({
        show: true,
        message: err.response?.data?.message || 'Không thể tải bản sao lưu',
        type: 'error',
      });
    } finally {
      setDirectDownloadLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 2. TÁC VỤ PHỤC HỒI (RESTORE)
  // -------------------------------------------------------------

  // Xử lý chọn file upload qua drag & drop hoặc input
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.bak')) {
        setToast({
          show: true,
          message: 'Vui lòng chọn tệp sao lưu có định dạng .bak của Microsoft SQL Server',
          type: 'error',
        });
        return;
      }
      setSelectedUploadFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.bak')) {
        setToast({
          show: true,
          message: 'Vui lòng chọn tệp sao lưu có định dạng .bak của Microsoft SQL Server',
          type: 'error',
        });
        return;
      }
      setSelectedUploadFile(file);
    }
  };

  // Mở modal xác nhận nguy hiểm khi phục hồi từ Upload
  const openUploadRestoreModal = () => {
    if (!selectedUploadFile) {
      setToast({
        show: true,
        message: 'Vui lòng chọn hoặc kéo thả tệp .bak trước khi phục hồi',
        type: 'error',
      });
      return;
    }
    setHazardModal({
      isOpen: true,
      fileName: selectedUploadFile.name,
      confirmText: '',
      hasConfirmedRisk: false,
    });
  };

  // Thực thi phục hồi sau khi người dùng đã vượt qua xác nhận 2 lớp
  const executeRestore = async () => {
    setHazardModal((prev) => ({ ...prev, isOpen: false }));
    setRestoreLoading(true);
    setRestoreProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedUploadFile);

      const res = await qtvApi.restoreFromUpload(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setRestoreProgress(percent);
        }
      });

      setToast({
        show: true,
        message: res.data?.message || 'Khôi phục cơ sở dữ liệu thành công!',
        type: 'success',
      });
      setSelectedUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      await fetchOverview();
    } catch (err) {
      console.error('Lỗi khi khôi phục cơ sở dữ liệu:', err);
      setToast({
        show: true,
        message:
          err.response?.data?.message ||
          'Khôi phục cơ sở dữ liệu thất bại. Vui lòng kiểm tra lại tính hợp lệ của tệp sao lưu.',
        type: 'error',
      });
    } finally {
      setRestoreLoading(false);
      setRestoreProgress(0);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-[calc(100vh-80px)] p-4 md:p-6 animate-in fade-in duration-300">
      {/* Toast thông báo */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />

      {/* Header trang */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#407F3E]/10 text-[#407F3E] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Sao lưu & Phục hồi cơ sở dữ liệu
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản trị sao lưu snapshot an toàn và khôi phục toàn phần dữ liệu Microsoft SQL Server cho hệ thống.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOverview}
            disabled={overviewLoading}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E7E0C4] text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${overviewLoading ? 'animate-spin text-[#407F3E]' : 'text-slate-500'}`}
            />
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Grid 2 Panel Chính: Sao lưu & Phục hồi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* PANEL 1: SAO LƯU CƠ SỞ DỮ LIỆU */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E7E0C4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#407F3E] flex items-center justify-center border border-emerald-100">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Sao lưu dữ liệu</h2>
                  <p className="text-xs text-slate-500">Tạo bản sao lưu toàn phần (Full Backup)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#407F3E] border border-emerald-200">
                Copy-Only Snapshot
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Thực hiện sao lưu toàn phần dữ liệu CSDL <strong>{overview.databaseName}</strong> sang tệp nhị phân <code>.BAK</code>. Bản sao lưu sử dụng cơ chế <em>Copy-Only</em> kèm kiểm tra toàn vẹn mã hóa <em>Checksum</em>, không gây ảnh hưởng đến chuỗi log định kỳ hay gián đoạn phiên làm việc của người dùng.
            </p>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5 mb-6">
              <ShieldCheck className="w-4 h-4 text-[#407F3E] shrink-0 mt-0.5" />
              <span>
                <strong>Khuyến nghị an toàn:</strong> Bạn nên sao lưu dữ liệu trước khi thực hiện các đợt phân công lớn, chốt điểm đánh giá, kết thúc học kỳ hoặc trước khi chạy phục hồi CSDL.
              </span>
            </div>
          </div>

          <div className="pt-2">
            {/* Tải về trực tiếp máy tính */}
            <button
              type="button"
              disabled={directDownloadLoading || restoreLoading}
              onClick={handleDirectBackupDownload}
              className="w-full py-3.5 px-4 rounded-xl bg-[#407F3E] hover:bg-[#326631] text-white font-bold text-xs transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {directDownloadLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang trích xuất & tải về máy tính...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Tải về bản sao lưu ngay (.BAK)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PANEL 2: PHỤC HỒI CƠ SỞ DỮ LIỆU */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E7E0C4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Phục hồi cơ sở dữ liệu</h2>
                  <p className="text-xs text-slate-500">Khôi phục từ tệp sao lưu (.BAK)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
                Thao tác ghi đè
              </span>
            </div>

            {/* Dropzone Upload file .bak */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".bak"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedUploadFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all mb-4 ${
                  isDragOver
                    ? 'border-[#407F3E] bg-[#407F3E]/5'
                    : 'border-[#E7E0C4] hover:border-[#407F3E] hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
                  <UploadCloud className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Kéo thả tệp <span className="text-[#407F3E]">.BAK</span> vào đây hoặc bấm để chọn tệp
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Chỉ chấp nhận tệp sao lưu Microsoft SQL Server (.bak) tối đa 500MB
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 border border-[#E7E0C4] rounded-xl flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#407F3E] flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {selectedUploadFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatBytes(selectedUploadFile.size)} • Sẵn sàng phục hồi
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUploadFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Hủy chọn tệp"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Cảnh báo an toàn */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5 mb-6">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Cảnh báo ghi đè:</strong> Dữ liệu hiện có của CSDL{' '}
                <code>{overview.databaseName}</code> sẽ bị thay thế hoàn toàn bởi dữ liệu trong tệp sao lưu. Vui lòng kiểm tra kỹ tệp trước khi thực hiện.
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={!selectedUploadFile || restoreLoading || directDownloadLoading}
              onClick={openUploadRestoreModal}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Bắt đầu khôi phục từ tệp tải lên (.BAK)</span>
            </button>
          </div>
        </div>
      </div>

      {/* HƯỚNG DẪN AN TOÀN VÀ NGUYÊN TẮC VẬN HÀNH (SAFETY GUIDE) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E7E0C4] shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-[#407F3E]" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Cẩm nang an toàn Quản trị Cơ sở dữ liệu
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-800 mb-1">1. Luôn sao lưu trước khi phục hồi</p>
            <p>
              Trước khi nạp bất kỳ bản sao lưu cũ nào vào hệ thống, hãy luôn bấm nút "Tải về bản sao lưu ngay (.BAK)" để lưu lại dữ liệu hiện tại làm điểm rollback an toàn.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-800 mb-1">2. Thời điểm phục hồi tối ưu</p>
            <p>
              Phục hồi CSDL sẽ tạm thời ngắt kết nối mọi phiên người dùng đang hoạt động (Sinh viên, Giảng viên, Khoa, CLB). Do đó hãy thực hiện vào khung giờ bảo trì hoặc thông báo trước cho người dùng.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-800 mb-1">3. Lưu trữ ngoại vi (Off-site)</p>
            <p>
              Quản trị viên nên tải các tệp .BAK định kỳ về lưu trữ trên ổ cứng vật lý độc lập hoặc dịch vụ lưu trữ an toàn để phòng ngừa sự cố phần cứng.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN NGUY HIỂM 2 LỚP KHI PHỤC HỒI (HAZARD CONFIRMATION MODAL) */}
      {hazardModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-[480px] max-w-[95vw] shadow-2xl border border-red-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác nhận khôi phục cơ sở dữ liệu
                </h3>
                <p className="text-xs text-red-600 font-semibold">
                  Thao tác nguy hiểm: Ghi đè toàn bộ dữ liệu
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-5 text-xs text-slate-600 leading-relaxed bg-red-50/60 border border-red-200/80 p-3.5 rounded-xl">
              <p>
                Bạn chuẩn bị khôi phục cơ sở dữ liệu <strong>{overview.databaseName}</strong> từ tệp:
              </p>
              <div className="font-mono text-xs font-bold text-slate-800 bg-white p-2 rounded border border-red-200 break-all">
                {hazardModal.fileName}
              </div>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>Toàn bộ dữ liệu hiện tại sẽ bị xóa và thay thế bằng dữ liệu trong tệp này.</li>
                <li>Các phiên kết nối hiện tại của người dùng sẽ bị đóng tạm thời.</li>
                <li>Thao tác này KHÔNG THỂ HOÀN TÁC nếu không có bản sao lưu trước đó.</li>
              </ul>
            </div>

            {/* Checkbox xác nhận 1 */}
            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer mb-4 select-none">
              <input
                type="checkbox"
                checked={hazardModal.hasConfirmedRisk}
                onChange={(e) =>
                  setHazardModal((prev) => ({
                    ...prev,
                    hasConfirmedRisk: e.target.checked,
                  }))
                }
                className="mt-0.5 rounded text-[#407F3E] focus:ring-[#407F3E] cursor-pointer"
              />
              <span className="font-medium">
                Tôi hiểu rõ dữ liệu hiện tại sẽ bị ghi đè hoàn toàn và tự chịu trách nhiệm về thao tác này.
              </span>
            </label>

            {/* Ô nhập xác thực 2 */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nhập chính xác chữ <span className="text-red-600 font-mono">XACNHAN</span> để mở khóa:
              </label>
              <input
                type="text"
                placeholder="XACNHAN"
                value={hazardModal.confirmText}
                onChange={(e) =>
                  setHazardModal((prev) => ({
                    ...prev,
                    confirmText: e.target.value.toUpperCase(),
                  }))
                }
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setHazardModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={
                  !hazardModal.hasConfirmedRisk ||
                  hazardModal.confirmText.trim() !== 'XACNHAN'
                }
                onClick={executeRestore}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tiến hành khôi phục CSDL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY TIẾN TRÌNH KHÔI PHỤC TOÀN MÀN HÌNH (RESTORE LOADING OVERLAY) */}
      {restoreLoading && (
        <div className="fixed inset-0 bg-slate-900/80 z-[99999] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300 select-none">
          <div className="bg-white rounded-2xl p-8 w-[420px] max-w-[90vw] text-center shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <RotateCcw className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Đang khôi phục cơ sở dữ liệu...
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Vui lòng không tắt trình duyệt hoặc khởi động lại máy chủ trong thời gian này.
            </p>

            {restoreProgress > 0 && restoreProgress < 100 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1">
                  <span>Tải lên tệp sao lưu</span>
                  <span>{restoreProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#407F3E] transition-all duration-200"
                    style={{ width: `${restoreProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Kiểm tra tính toàn vẹn Checksum (.BAK)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Ngắt kết nối an toàn (Single User Mode)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span>Trích xuất cấu trúc và dữ liệu Microsoft SQL Server</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
