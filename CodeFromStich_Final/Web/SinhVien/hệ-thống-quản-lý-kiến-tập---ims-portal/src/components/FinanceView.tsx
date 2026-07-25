import React, { useState } from 'react';
import { 
  CreditCard, 
  RotateCcw, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  Plus, 
  FileText, 
  ArrowRight,
  Info
} from 'lucide-react';
import { PaymentItem, RefundItem } from '../types';

interface FinanceViewProps {
  payments: PaymentItem[];
  refundRequests: RefundItem[];
  onPayFee: (paymentId: string) => void;
  onAddRefundRequest: (refund: Omit<RefundItem, 'id' | 'date'>) => void;
  initialTab?: 'payment' | 'refund';
}

export default function FinanceView({ 
  payments, 
  refundRequests, 
  onPayFee, 
  onAddRefundRequest,
  initialTab = 'payment'
}: FinanceViewProps) {
  const [tab, setTab] = useState<'payment' | 'refund'>(initialTab);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Refund Proposal Form State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [invoiceName, setInvoiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Computations
  const totalDue = payments
    .filter(p => p.status === 'Chưa đóng' || p.status === 'Vi phạm')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPaid = payments
    .filter(p => p.status === 'Đã đóng đúng hạn')
    .reduce((acc, p) => acc + p.amount, 0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceName || !amount) {
      alert('Vui lòng điền các thông tin bắt buộc (*)');
      return;
    }
    onAddRefundRequest({
      invoiceName,
      amount: Number(amount),
      status: 'Chờ xử lý',
      note: note || undefined
    });
    setInvoiceName('');
    setAmount('');
    setNote('');
    setShowRefundModal(false);
    alert('Nộp đơn yêu cầu hoàn phí thành công! Khoa sẽ đối chiếu trong 7-10 ngày.');
  };

  return (
    <div className="space-y-6">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Quản lý Tài chính</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Theo dõi chi phí đóng đóng cho các chuyến thực tế ngoài trường, quản lý biên lai và yêu cầu bồi hoàn/hoàn trả nếu xảy ra chênh lệch.
          </p>
        </div>
        {tab === 'refund' && (
          <button 
            onClick={() => setShowRefundModal(true)}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs tracking-wider uppercase shadow-md hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đơn hoàn phí</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-surface-muted/60 relative z-10">
        <button 
          onClick={() => setTab('payment')}
          className={`relative pb-3 font-bold text-md transition-colors cursor-pointer ${
            tab === 'payment' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Thanh toán kiến tập</span>
          {tab === 'payment' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
          )}
        </button>
        <button 
          onClick={() => setTab('refund')}
          className={`relative pb-3 font-bold text-md transition-colors cursor-pointer ${
            tab === 'refund' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Yêu cầu hoàn phí</span>
          {tab === 'refund' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Content Section */}
      {tab === 'payment' ? (
        <div className="space-y-6 animate-fade-in relative z-10">
          
          {/* Top Indicators Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Total unpaid indicator card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-wider">Tổng phí cần nộp</h3>
                  <p className="text-2xl font-black text-[#ba1a1a] mt-1">{totalDue.toLocaleString()}đ</p>
                </div>
              </div>
              <div className="text-right text-[11px] font-bold text-on-surface-variant">
                Lệ phí chuyến kiến tập sắp đi
              </div>
            </div>

            {/* Total paid indicator card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#e5ffdc] flex items-center justify-center text-primary">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-wider">Đã đóng tổng cộng</h3>
                  <p className="text-2xl font-black text-primary mt-1">{totalPaid.toLocaleString()}đ</p>
                </div>
              </div>
              <div className="text-right text-[11px] font-bold text-on-surface-variant">
                An toàn • Minh bạch
              </div>
            </div>

          </div>

          {/* Bank Transfer Guide Card & Transfer Code */}
          <div className="bg-white rounded-2xl border border-[#89b449]/20 shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-center bg-gradient-to-br from-white to-[#f8faf1]/30">
            <div className="space-y-2 max-w-lg">
              <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#89B449]"></span> Thông tin tài khoản khoa
              </div>
              <h3 className="font-black text-base text-on-surface">Cổng thanh toán tự động Vietcombank</h3>
              <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
                Quét mã QR chuyển khoản ngân hàng hoặc nộp thủ công qua thông tin bên dưới. Hệ thống sẽ ghi nhận trạng thái giao dịch tự động trong 5-15 phút.
              </p>
              
              <div className="pt-2 flex flex-col gap-1 text-xs font-bold text-on-surface">
                <div>Ngân hàng: <span className="text-primary font-black">VIETCOMBANK - CN Sài Gòn</span></div>
                <div>Số tài khoản: <span className="text-primary font-black">1023 9845 7721</span></div>
                <div>Chủ tài khoản: <span className="font-black">KHOA CONG NGHE THUC PHAM - IMS</span></div>
              </div>
            </div>

            {/* Bank Card Widget */}
            <div className="w-72 rounded-2xl bg-primary-container p-5 text-white flex flex-col justify-between shadow-lg relative overflow-hidden shrink-0 border border-white/10">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[10px] font-black tracking-widest text-[#e5ffdc]/70">BANKING CARD</span>
                <CreditCard className="w-5 h-5 text-white/80" />
              </div>
              <div className="mb-4 relative z-10">
                <div className="text-xs text-[#e5ffdc]/50 font-medium">Cú pháp chuyển khoản mẫu</div>
                <div className="text-md font-mono font-black mt-1 flex items-center justify-between bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/15">
                  <span>KT_SV123_SAMSUNG</span>
                  <button 
                    onClick={() => handleCopyCode('KT_SV123_SAMSUNG')}
                    className="text-white hover:text-[#c0ef7c] cursor-pointer"
                    title="Sao chép cú pháp"
                  >
                    {copiedCode === 'KT_SV123_SAMSUNG' ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <div className="text-[9px] text-[#e5ffdc]/50 uppercase">Sinh viên nộp</div>
                  <div className="text-xs font-black">NGUYỄN VĂN A</div>
                </div>
                <span className="text-[11px] font-bold text-[#c0ef7c]">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Payment Log Table */}
          <div className="bg-white rounded-2xl border border-surface-muted/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-container">
                    <th className="py-4 px-6">Chuyến kiến tập</th>
                    <th className="py-4 px-6">Mã biên lai</th>
                    <th className="py-4 px-6">Lệ phí</th>
                    <th className="py-4 px-6">Hạn đóng</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold divide-y divide-surface-container/50">
                  {payments.map((pay) => {
                    let badgeClass = '';
                    if (pay.status === 'Đã đóng đúng hạn') badgeClass = 'bg-primary/10 text-primary border border-primary/20';
                    else if (pay.status === 'Chưa đóng') badgeClass = 'bg-warning-yellow/15 text-yellow-700 border border-warning-yellow/40';
                    else if (pay.status === 'Vi phạm') badgeClass = 'bg-red-50 text-red-700 border border-red-200';
                    else badgeClass = 'bg-blue-50 text-blue-700 border border-blue-200';

                    const canPay = pay.status === 'Chưa đóng' || pay.status === 'Vi phạm';

                    return (
                      <tr key={pay.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 px-6 font-bold text-on-surface group-hover:text-primary transition-colors">
                          {pay.tripTitle}
                        </td>
                        <td className="py-4 px-6 text-xs font-mono font-bold text-on-surface-variant">{pay.code}</td>
                        <td className="py-4 px-6 font-black text-on-surface">{pay.amount.toLocaleString()}đ</td>
                        <td className="py-4 px-6 text-on-surface-variant font-medium">{pay.deadline}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                            <span>{pay.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {canPay ? (
                            <button
                              onClick={() => {
                                onPayFee(pay.id);
                                alert(`Đã kích hoạt giả lập thanh toán biên lai ${pay.code} thành công!`);
                              }}
                              className="px-3.5 py-1.5 bg-primary text-white hover:bg-primary-container rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all active:scale-95 flex items-center gap-1 inline-flex"
                            >
                              <span>Thanh toán</span>
                            </button>
                          ) : pay.status === 'Đã đóng đúng hạn' && pay.payDate ? (
                            <span className="text-xs text-outline font-semibold">Đã đóng: {pay.payDate}</span>
                          ) : (
                            <span className="text-outline/40 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Refund requests sub-tab Screen 7 */
        <div className="space-y-6 animate-fade-in relative z-10">
          
          {/* Overview Refund Summary Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-muted/30">
              <div className="text-xs font-bold text-on-surface-variant uppercase">Tổng đã hoàn tiền</div>
              <p className="text-xl font-black text-primary mt-2">180.000đ</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-muted/30">
              <div className="text-xs font-bold text-on-surface-variant uppercase">Đang đối soát / xử lý</div>
              <p className="text-xl font-black text-yellow-600 mt-2">
                {refundRequests.filter(r => r.status === 'Chờ xử lý').reduce((acc, r) => acc + r.amount, 0).toLocaleString()}đ
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-muted/30">
              <div className="text-xs font-bold text-on-surface-variant uppercase">Từ chối bồi hoàn</div>
              <p className="text-xl font-black text-red-600 mt-2">250.000đ</p>
            </div>
          </div>

          {/* Refund Requests History Table */}
          <div className="bg-white rounded-2xl border border-surface-muted/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-container">
                    <th className="py-4 px-6">Ngày gửi</th>
                    <th className="py-4 px-6">Tên hóa đơn liên quan</th>
                    <th className="py-4 px-6">Số tiền</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6">Ghi chú từ khoa</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold divide-y divide-surface-container/50">
                  {refundRequests.map((ref) => {
                    let statusClass = '';
                    if (ref.status === 'Đã hoàn tiền') statusClass = 'bg-primary/10 text-primary border border-primary/25';
                    else if (ref.status === 'Chờ xử lý') statusClass = 'bg-warning-yellow/15 text-yellow-700 border border-warning-yellow/40';
                    else statusClass = 'bg-red-50 text-red-600 border border-red-200';

                    return (
                      <tr key={ref.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 px-6 text-on-surface-variant font-medium">{ref.date}</td>
                        <td className="py-4 px-6 font-bold text-on-surface group-hover:text-primary transition-colors">
                          {ref.invoiceName}
                        </td>
                        <td className="py-4 px-6 font-black text-on-surface">{ref.amount.toLocaleString()}đ</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                            <span>{ref.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant text-xs italic font-semibold max-w-[200px] truncate">
                          {ref.note || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Suggest/Create Refund Request Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-surface-container animate-scale-up">
            <div className="p-6 bg-[#446900] text-white flex justify-between items-center">
              <h3 className="font-black text-lg flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-white" />
                <span>Tạo đơn yêu cầu hoàn phí kiến tập</span>
              </h3>
              <button 
                onClick={() => setShowRefundModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Tên hóa đơn / Chuyến đi liên quan <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={invoiceName}
                  onChange={(e) => setInvoiceName(e.target.value)}
                  placeholder="Ví dụ: Hóa đơn Heineken - 01/09..."
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-muted/60 rounded-xl text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Số tiền đề xuất hoàn (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ví dụ: 180000"
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-muted/60 rounded-xl text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Lý do yêu cầu bồi hoàn <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Trùng hóa đơn nộp, lỗi ngân hàng báo trùng, hoãn chuyến do trường..."
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-muted/60 rounded-xl text-sm focus:border-primary focus:outline-none resize-none"
                  required
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Đính kèm biên lai / Minh chứng chuyển khoản
                </label>
                <div className="border border-dashed border-surface-muted/60 rounded-xl p-4 bg-[#f8faf1] text-center cursor-pointer hover:bg-[#ecefe6] transition-colors">
                  <span className="text-xs text-on-surface-variant font-semibold block">Tải hóa đơn PDF hoặc hình chụp chuyển khoản</span>
                  <span className="text-[10px] text-outline mt-1 block">Hỗ trợ JPG, PNG, PDF (Tối đa 5MB)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-container flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-[#ecefe6] rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-container shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Nộp đơn hoàn phí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
