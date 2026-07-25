import React, { useState } from 'react';
import { 
  RotateCcw, 
  User, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { RefundRecord } from '../types';

interface RefundApprovalViewProps {
  refundRecords: RefundRecord[];
  setRefundRecords: React.Dispatch<React.SetStateAction<RefundRecord[]>>;
}

export default function RefundApprovalView({ refundRecords, setRefundRecords }: RefundApprovalViewProps) {
  const [selectedRecord, setSelectedRecord] = useState<RefundRecord | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<RefundRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleApprove = (mssv: string) => {
    setRefundRecords(prev => prev.map(rec => {
      if (rec.mssv === mssv) {
        return {
          ...rec,
          status: 'Đã hoàn tiền',
          processedDate: new Date().toLocaleDateString('vi-VN')
        };
      }
      return rec;
    }));
    alert('Đã phê duyệt hoàn phí thành công! Giao dịch chi hoàn đã được gửi sang phòng Kế hoạch Tài chính.');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionTarget) return;

    setRefundRecords(prev => prev.map(rec => {
      if (rec.mssv === rejectionTarget.mssv) {
        return {
          ...rec,
          status: 'Từ chối',
          processedDate: new Date().toLocaleDateString('vi-VN'),
          relatedInvoice: `${rec.relatedInvoice} (Từ chối: ${rejectionReason || 'Hóa đơn không hợp lệ'})`
        };
      }
      return rec;
    }));

    setRejectionTarget(null);
    setRejectionReason('');
    alert(`Đã từ chối đơn yêu cầu hoàn phí của sinh viên: ${rejectionTarget.fullname}`);
  };

  // Metrics calculation
  const pendingCount = refundRecords.filter(r => r.status === 'Chờ xử lý').length;
  const approvedCount = refundRecords.filter(r => r.status === 'Đã hoàn tiền').length;
  const approvedFund = approvedCount * 1500000; // Multiply by constant refund fee

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-primary-container tracking-tight">
          Duyệt hoàn phí kiến tập
        </h1>
        <p className="text-sm text-slate-500">
          Xét duyệt và xử lý các hồ sơ yêu cầu hoàn trả lệ phí cho sinh viên thuộc diện miễn giảm hoặc hủy đợt tham quan thực tế.
        </p>
      </div>

      {/* Quick stats box matching bento-grid */}
      <div className="bg-[#E7E0C4] rounded-2xl p-6 flex flex-col md:flex-row items-stretch justify-between gap-6 border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#407F3E] text-white rounded-full flex items-center justify-center shadow-md">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Thống kê hồ sơ hoàn trả</h3>
            <p className="text-xs text-slate-500 font-medium">Quá trình xét duyệt và hoàn quỹ tự động</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 sm:gap-12 md:self-center">
          <div className="flex flex-col items-center md:items-end">
            <span className="text-2xl font-black text-amber-700">{pendingCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center md:text-right">Chờ xử lý</span>
          </div>
          <div className="w-px h-10 bg-slate-300 self-center hidden sm:block"></div>
          <div className="flex flex-col items-center md:items-end">
            <span className="text-2xl font-black text-green-700">{approvedCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center md:text-right">Đã hoàn tiền</span>
          </div>
          <div className="w-px h-10 bg-slate-300 self-center hidden sm:block"></div>
          <div className="flex flex-col items-center md:items-end">
            <span className="text-2xl font-black text-[#407F3E] font-mono">{formatCurrency(approvedFund)}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center md:text-right">Tổng quỹ chi hoàn</span>
          </div>
        </div>
      </div>

      {/* Table of Refund Requests */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Sinh viên</th>
                <th className="px-6 py-4 font-bold">Khoa / Lớp</th>
                <th className="px-6 py-4 font-bold">Hóa đơn liên quan</th>
                <th className="px-6 py-4 font-bold">Tệp chứng từ</th>
                <th className="px-6 py-4 font-bold">Ngày gửi yêu cầu</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 text-right font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-sm font-medium">
              {refundRecords.map((rec) => (
                <tr key={rec.mssv} className="hover:bg-slate-50/50 transition-colors">
                  {/* Name and avatar column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {rec.avatar ? (
                        <img 
                          src={rec.avatar} 
                          alt={rec.fullname} 
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                          {rec.fullname.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{rec.fullname}</p>
                        <p className="text-[10px] text-slate-400 font-bold font-mono">MSSV: {rec.mssv}</p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 font-semibold text-slate-500">
                    {rec.department}
                  </td>

                  {/* Invoice Description */}
                  <td className="px-6 py-4 font-semibold text-slate-700 truncate max-w-[200px]">
                    {rec.relatedInvoice}
                  </td>

                  {/* Document link */}
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => alert(`Mở tệp hóa đơn đính kèm: ${rec.fileUrl}. Đảm bảo định dạng chứng từ hợp lệ.`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-[#407F3E]/10 hover:text-primary-container text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 shrink-0 text-[#407F3E]" />
                      <span className="truncate max-w-[120px]">{rec.fileUrl}</span>
                    </button>
                  </td>

                  {/* Submitted Date */}
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 font-mono">
                    {rec.dateSubmitted}
                  </td>

                  {/* Status Badging */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                      rec.status === 'Chờ xử lý' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : rec.status === 'Đã hoàn tiền'
                          ? 'bg-secondary-container-green text-on-secondary-container-green border border-secondary'
                          : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        rec.status === 'Chờ xử lý' 
                          ? 'bg-amber-500' 
                          : rec.status === 'Đã hoàn tiền' 
                            ? 'bg-[#446900]' 
                            : 'bg-red-500'
                      }`}></span>
                      {rec.status}
                    </span>
                  </td>

                  {/* Action utilities */}
                  <td className="px-6 py-4 text-right">
                    {rec.status === 'Chờ xử lý' ? (
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => setRejectionTarget(rec)}
                          className="px-3 py-1.5 bg-white border border-red-100 hover:bg-red-50 text-red-500 text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleApprove(rec.mssv)}
                          className="px-3 py-1.5 bg-[#407F3E] hover:bg-[#346732] text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                        >
                          Xác nhận
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 font-semibold italic">
                        {rec.processedDate ? `Đã xử lý: ${rec.processedDate}` : 'Đã duyệt'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection input dialog */}
      {rejectionTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span>Lý do từ chối hoàn phí</span>
              </h3>
              <button 
                onClick={() => setRejectionTarget(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Sinh viên: <span className="font-bold text-slate-800">{rejectionTarget.fullname} ({rejectionTarget.mssv})</span>
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Lý do từ chối cụ thể *
                </label>
                <textarea 
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Ví dụ: Chứng từ hóa đơn không khớp thông tin tài khoản hoặc bị mờ nhạt."
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectionTarget(null)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-md cursor-pointer"
                >
                  Xác nhận Từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
