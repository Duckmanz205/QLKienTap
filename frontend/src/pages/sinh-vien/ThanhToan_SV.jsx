import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  Plus, 
  Building
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function ThanhToan_SV() {
  const [student, setStudent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [tab, setTab] = useState('payment');

  // Refund State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [fileScanUrl, setFileScanUrl] = useState('');
  const [refundRequests, setRefundRequests] = useState([
    {
      id: 1,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
      invoiceName: 'Hóa đơn Heineken - Đợt 1',
      amount: 150000,
      status: 'Đã hoàn tiền',
      note: 'Đối chiếu thành công, hoàn trả qua thẻ SV'
    }
  ]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchInvoices(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchInvoices = async (svId) => {
    try {
      const res = await sinhVienApi.getInvoices(svId);
      setInvoices(res.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePayFee = async (invoiceId) => {
    setMessage('');
    setError('');
    try {
      const res = await sinhVienApi.payInvoice(invoiceId);
      setMessage(res.data.message);
      fetchInvoices(student.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Thanh toán thất bại.');
    }
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      alert('Vui lòng chọn hóa đơn liên quan.');
      return;
    }

    setMessage('');
    setError('');
    try {
      const fileName = fileScanUrl || `Don_hoan_phi_${selectedInvoiceId}_${student.mssv}.pdf`;
      const res = await sinhVienApi.requestRefund({
        invoiceId: Number(selectedInvoiceId),
        fileScanUrl: fileName
      });

      // Find selected invoice to show in the list
      const matchedInvoice = invoices.find(i => i.id === Number(selectedInvoiceId));
      const newRefund = {
        id: Date.now(),
        date: new Date().toLocaleDateString('vi-VN'),
        invoiceName: matchedInvoice?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Yêu cầu hoàn lệ phí',
        amount: matchedInvoice?.so_tien || 150000,
        status: 'Chờ xử lý',
        note: 'Đã nộp đơn qua hệ thống'
      };

      setRefundRequests(prev => [newRefund, ...prev]);
      setMessage(res.data.message);
      setShowRefundModal(false);
      setSelectedInvoiceId('');
      setFileScanUrl('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi yêu cầu hoàn phí thất bại.');
    }
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải dữ liệu tài chính...
      </div>
    );
  }

  // Calculations
  const totalDue = invoices
    .filter(p => p.trang_thai === 'ChuaDong' || p.trang_thai === 'ViPham')
    .reduce((acc, p) => acc + Number(p.so_tien), 0);

  const totalPaid = invoices
    .filter(p => p.trang_thai === 'DaDongDungHan')
    .reduce((acc, p) => acc + Number(p.so_tien), 0);

  const defaultTransferCode = `${student.mssv}_IMS`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Quản lý Tài chính</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Theo dõi chi phí đóng cho các chuyến thực tế ngoài trường, quản lý biên lai và yêu cầu hoàn trả nếu xảy ra chênh lệch.
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

      {/* Messages */}
      {message && (
        <div className="bg-[#e5ffdc] border border-primary/20 text-[#476d01] px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-750 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-8 border-b border-surface-variant/60 relative z-10">
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
          <span>Yêu cầu hoàn phí ({refundRequests.length})</span>
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30 flex items-center justify-between">
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
                Lệ phí chuyến chưa đóng
              </div>
            </div>

            {/* Total paid indicator card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30 flex items-center justify-between">
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
          <div className="bg-white rounded-2xl border border-primary/20 shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-center bg-gradient-to-br from-white to-[#f8faf1]/30">
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
                  <span>{defaultTransferCode}</span>
                  <button 
                    onClick={() => handleCopyCode(defaultTransferCode)}
                    className="text-white hover:text-[#c0ef7c] cursor-pointer"
                    title="Sao chép cú pháp"
                  >
                    {copiedCode === defaultTransferCode ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <div className="text-[9px] text-[#e5ffdc]/50 uppercase">Sinh viên nộp</div>
                  <div className="text-xs font-black">{student.ho_ten}</div>
                </div>
                <span className="text-[11px] font-bold text-[#c0ef7c]">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Payment Log Table */}
          <div className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-variant">
                    <th className="py-4 px-6">Chuyến kiến tập</th>
                    <th className="py-4 px-6">Nội dung chuyển khoản</th>
                    <th className="py-4 px-6">Lệ phí</th>
                    <th className="py-4 px-6">Hạn đóng</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold divide-y divide-slate-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        Chưa phát sinh hóa đơn lệ phí kiến tập.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((pay) => {
                      let badgeClass = '';
                      let statusText = 'Chưa đóng';
                      if (pay.trang_thai === 'DaDongDungHan') {
                        badgeClass = 'bg-primary/10 text-primary border border-primary/20';
                        statusText = 'Đã đóng';
                      } else if (pay.trang_thai === 'ChuaDong') {
                        badgeClass = 'bg-[#DBD468]/20 text-slate-700 border border-[#DBD468]/60';
                        statusText = 'Chưa đóng';
                      } else if (pay.trang_thai === 'ViPham') {
                        badgeClass = 'bg-red-50 text-red-700 border border-red-200';
                        statusText = 'Trễ hạn / Vi phạm';
                      } else {
                        badgeClass = 'bg-slate-100 text-slate-600 border border-slate-200';
                        statusText = pay.trang_thai;
                      }

                      const canPay = pay.trang_thai === 'ChuaDong' || pay.trang_thai === 'ViPham';

                      return (
                        <tr key={pay.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-4 px-6 font-bold text-on-surface group-hover:text-primary transition-colors">
                            {pay.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi'}
                          </td>
                          <td className="py-4 px-6 text-xs font-mono font-bold text-on-surface-variant">
                            {pay.noi_dung_chuyen_khoan}
                          </td>
                          <td className="py-4 px-6 font-black text-on-surface">{Number(pay.so_tien).toLocaleString()}đ</td>
                          <td className="py-4 px-6 text-on-surface-variant font-medium">
                            {new Date(pay.han_dong).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                              <span>{statusText}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {canPay ? (
                              <button
                                onClick={() => handlePayFee(pay.id)}
                                className="px-3.5 py-1.5 bg-primary text-white hover:bg-primary-container rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all active:scale-95 flex items-center gap-1 inline-flex"
                              >
                                <span>Thanh toán</span>
                              </button>
                            ) : pay.trang_thai === 'DaDongDungHan' ? (
                              <span className="text-xs text-primary font-bold">
                                {pay.ngay_dong_thuc_te ? `Ngày đóng: ${new Date(pay.ngay_dong_thuc_te).toLocaleDateString('vi-VN')}` : 'Đã xác nhận'}
                              </span>
                            ) : (
                              <span className="text-outline/40 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Refund requests sub-tab */
        <div className="space-y-6 animate-fade-in relative z-10">
          
          {/* Overview Refund Summary Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30">
              <div className="text-xs font-bold text-on-surface-variant uppercase">Tổng đã hoàn tiền</div>
              <p className="text-xl font-black text-primary mt-2">150.000đ</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30">
              <div className="text-xs font-bold text-on-surface-variant uppercase">Đang đối soát / xử lý</div>
              <p className="text-xl font-black text-yellow-600 mt-2">
                {refundRequests.filter(r => r.status === 'Chờ xử lý').reduce((acc, r) => acc + r.amount, 0).toLocaleString()}đ
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30">
              <div className="text-xs font-bold text-on-surface-variant uppercase">Từ chối bồi hoàn</div>
              <p className="text-xl font-black text-red-600 mt-2">0đ</p>
            </div>
          </div>

          {/* Refund Requests History Table */}
          <div className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-variant">
                    <th className="py-4 px-6">Ngày gửi</th>
                    <th className="py-4 px-6">Hóa đơn liên quan</th>
                    <th className="py-4 px-6">Số tiền</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6">Ghi chú từ khoa</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold divide-y divide-slate-100">
                  {refundRequests.map((ref) => {
                    let statusClass = '';
                    if (ref.status === 'Đã hoàn tiền') statusClass = 'bg-primary/10 text-primary border border-primary/25';
                    else if (ref.status === 'Chờ xử lý') statusClass = 'bg-[#DBD468]/20 text-slate-700 border border-[#DBD468]/60';
                    else statusClass = 'bg-red-50 text-red-650 border border-red-200';

                    return (
                      <tr key={ref.id} className="hover:bg-slate-50 transition-colors group">
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
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-surface-variant animate-scale-up">
            <div className="p-6 bg-primary text-white flex justify-between items-center">
              <h3 className="font-black text-lg flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-white" />
                <span>Tạo đơn yêu cầu hoàn lệ phí</span>
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
                  Chọn hóa đơn đã đóng <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">-- Chọn Hóa đơn --</option>
                  {invoices.filter(i => i.trang_thai === 'DaDongDungHan').map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || `Hóa đơn #${i.id}`} ({Number(i.so_tien).toLocaleString()}đ)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Tập tin minh chứng hoàn tiền (file biên lai / đơn) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={fileScanUrl}
                  onChange={(e) => setFileScanUrl(e.target.value)}
                  placeholder="Ví dụ: Scan_bien_lai_vietcombank.pdf"
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-surface-variant flex justify-end gap-3">
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
