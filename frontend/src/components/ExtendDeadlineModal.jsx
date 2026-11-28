import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, X, Check, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { giangVienApi } from '../services/api';

export default function ExtendDeadlineModal({
  isOpen,
  onClose,
  phieuThamQuanId,
  currentDeadline,
  studentName,
  studentMssv,
  tripName,
  onSuccess,
}) {
  const [loaiGiaHan, setLoaiGiaHan] = useState('DungHan'); // 'DungHan' | 'Khoa'
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [ngayGiaHanMoi, setNgayGiaHanMoi] = useState(tomorrowStr);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isValidPtq = Boolean(phieuThamQuanId && Number(phieuThamQuanId) >= 1);

  const currentDeadlineFormatted = currentDeadline 
    ? new Date(currentDeadline).toLocaleDateString('vi-VN') 
    : 'Chưa xác định';

  const currentLockFormatted = currentDeadline
    ? new Date(new Date(currentDeadline).getTime() + 10 * 86400000).toLocaleDateString('vi-VN')
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidPtq) {
      toast.error('Chuyến đi chưa có Phiếu tham quan hợp lệ, không thể gia hạn!');
      return;
    }
    if (!ngayGiaHanMoi) {
      toast.error('Vui lòng chọn ngày gia hạn mới!');
      return;
    }

    try {
      setLoading(true);
      const res = await giangVienApi.extendReportDeadline({
        phieuThamQuanId: Number(phieuThamQuanId),
        loaiGiaHan,
        ngayGiaHanMoi,
      });

      toast.success(res.data?.message || 'Gia hạn nộp bài thành công!');
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi gia hạn nộp bài!';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] border border-slate-100 flex flex-col my-auto overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Cố định ở đỉnh) */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#fdfcf8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#89B449]/20 flex items-center justify-center text-[#407F3E]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Gia hạn nộp bài thu hoạch</h2>
              <p className="text-xs text-slate-500 font-medium">Điều chỉnh thời hạn nộp bài linh hoạt cho sinh viên</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Target Student & Trip Info */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Sinh viên:</span>
              <span className="font-bold text-slate-800">{studentName} ({studentMssv})</span>
            </div>
            {tripName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Chuyến đi:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[280px]">{tripName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Hạn đúng hạn hiện tại:</span>
              <span className="font-bold text-[#407F3E]">
                {currentDeadlineFormatted !== 'Chưa xác định' ? `23:59 ngày ${currentDeadlineFormatted}` : 'Chưa xác định'}
              </span>
            </div>
            {currentLockFormatted && (
              <div className="flex justify-between">
                <span className="text-slate-500">Hạn đóng cổng nộp bù:</span>
                <span className="font-bold text-amber-700">23:59 ngày {currentLockFormatted}</span>
              </div>
            )}
            {!isValidPtq && (
              <div className="mt-2 p-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Chuyến đi chưa được cấp Phiếu tham quan (chưa diễn ra hoặc chưa hoàn tất thủ tục). Không thể gia hạn.</span>
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Chế độ gia hạn <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLoaiGiaHan('DungHan')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  loaiGiaHan === 'DungHan'
                    ? 'border-[#407F3E] bg-[#407F3E]/5 text-[#407F3E] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">1. Gia hạn Đúng hạn</span>
                  {loaiGiaHan === 'DungHan' && <Check className="w-4 h-4 text-[#407F3E]" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Kéo dài hạn nộp Đúng hạn. Cổng nộp bài (Trễ hạn) tự động lùi thêm 10 ngày sau mốc này.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLoaiGiaHan('Khoa')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  loaiGiaHan === 'Khoa'
                    ? 'border-amber-600 bg-amber-500/5 text-amber-700 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">2. Mở khóa Nộp bù</span>
                  {loaiGiaHan === 'Khoa' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Mở lại cổng nộp bài cho SV đã bị khóa. Bài nộp trong thời gian này ghi nhận Trễ hạn.
                </p>
              </button>
            </div>
          </div>

          {/* New Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {loaiGiaHan === 'DungHan' ? 'Hạn Đúng hạn mới (đến 23:59)' : 'Hạn đóng cổng Nộp bù mới (đến 23:59)'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min={tomorrowStr}
                value={ngayGiaHanMoi}
                onChange={(e) => setNgayGiaHanMoi(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#407F3E] focus:bg-white transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Thời hạn sẽ có hiệu lực đến 23:59:59 của ngày được chọn.
            </p>
          </div>

          {/* Notice info */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {loaiGiaHan === 'DungHan' ? (
                <span>Các bài nộp trước mốc mới sẽ được tự động chuyển về trạng thái <strong>Đúng hạn</strong>. Cổng nộp bài trễ hạn mở tiếp đến ngày <strong>{new Date(new Date(ngayGiaHanMoi).getTime() + 10 * 86400000).toLocaleDateString('vi-VN')}</strong>.</span>
              ) : (
                <span>Cổng nộp bù sẽ mở đến 23:59 ngày <strong>{new Date(ngayGiaHanMoi).toLocaleDateString('vi-VN')}</strong>. Bài nộp sẽ được gắn cờ <strong>Trễ hạn</strong>.</span>
              )}
            </div>
          </div>

          </div>

          {/* Modal Footer Buttons (Cố định ở đáy modal, không bao giờ bị tràn/cắt cụt) */}
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-[#fdfcf8]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !isValidPtq}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 ${
                !isValidPtq
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#407F3E] hover:bg-[#407F3E]/90 cursor-pointer disabled:opacity-50'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Xác nhận gia hạn
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

