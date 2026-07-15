import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  FileText, 
  Check, 
  Search, 
  Eye, 
  Undo,
  X
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function HoanPhi_SV() {
  const [student, setStudent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [fileScanUrl, setFileScanUrl] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchData(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchData = async (svId) => {
    try {
      const invRes = await sinhVienApi.getInvoices(svId);
      setInvoices(invRes.data);

      const refRes = await sinhVienApi.getRefundRequests(svId);
      setRefundRequests(refRes.data);
    } catch (err) {
      console.error('Error fetching refund data:', err);
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

      setMessage(res.data.message);
      setShowRefundModal(false);
      setSelectedInvoiceId('');
      setFileScanUrl('');
      fetchData(student.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi yêu cầu hoàn phí thất bại.');
    }
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải dữ liệu hoàn phí...
      </div>
    );
  }

  // Calculate stats
  const refundedSum = refundRequests
    .filter(r => r.trang_thai === 'DaHoanTien')
    .reduce((acc, r) => acc + Number(r.hoaDon?.so_tien || 0), 0);

  const processingSum = refundRequests
    .filter(r => r.trang_thai === 'ChoXuLy')
    .reduce((acc, r) => acc + Number(r.hoaDon?.so_tien || 0), 0);

  const rejectedSum = refundRequests
    .filter(r => r.trang_thai === 'TuChoi')
    .reduce((acc, r) => acc + Number(r.hoaDon?.so_tien || 0), 0);

  // Filter requests by search
  const filteredRequests = refundRequests.filter(r => {
    const factory = r.hoaDon?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || '';
    return factory.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Invoices eligible for refund: paid, and not already requested
  const existingRefundInvoiceIds = refundRequests.map(r => r.hoa_don_id);
  const eligibleInvoices = invoices.filter(i => 
    i.trang_thai === 'DaDongDungHan' && !existingRefundInvoiceIds.includes(i.id)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header with Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight font-headline-lg">Hoàn phí kiến tập</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Gửi yêu cầu hoàn trả lệ phí cho các chuyến đi bị hủy hoặc phát sinh sai sót thông tin biên lai.
          </p>
        </div>
        <button 
          onClick={() => {
            if (eligibleInvoices.length === 0) {
              alert('Bạn không có hóa đơn nào đủ điều kiện (đã thanh toán thành công và chưa tạo đơn hoàn phí).');
              return;
            }
            setShowRefundModal(true);
          }}
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs tracking-wider uppercase shadow-md hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đơn hoàn phí</span>
        </button>
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

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Card 1: Refunded */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="space-y-2 relative z-10">
            <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-wider">Tổng Đã Hoàn</span>
            <p className="text-3xl font-black text-primary">{refundedSum.toLocaleString()}đ</p>
            <p className="text-xs text-on-surface-variant font-semibold">
              {refundRequests.filter(r => r.trang_thai === 'DaHoanTien').length} đơn thành công
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#e5ffdc] flex items-center justify-center text-primary relative z-10 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Processing */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="space-y-2 relative z-10">
            <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-wider">Đang Xử Lý</span>
            <p className="text-3xl font-black text-amber-605">{processingSum.toLocaleString()}đ</p>
            <p className="text-xs text-on-surface-variant font-semibold">
              {refundRequests.filter(r => r.trang_thai === 'ChoXuLy').length} đơn chờ duyệt
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 relative z-10 shrink-0 border border-amber-100">
            <RotateCcw className="w-6 h-6 animate-spin-slow" />
          </div>
        </div>

        {/* Card 3: Rejected */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/30 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="space-y-2 relative z-10">
            <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-wider">Từ Chối</span>
            <p className="text-3xl font-black text-red-600">{rejectedSum.toLocaleString()}đ</p>
            <p className="text-xs text-on-surface-variant font-semibold">
              {refundRequests.filter(r => r.trang_thai === 'TuChi' || r.trang_thai === 'TuChoi').length} đơn bị từ chối
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-650 relative z-10 shrink-0 border border-red-100">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Request History */}
      <div className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm overflow-hidden relative z-10">
        <div className="p-6 border-b border-slate-100 bg-[#f8faf1]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-on-surface">Lịch sử Yêu cầu</h2>
            <p className="text-xs text-on-surface-variant font-semibold mt-0.5">
              Danh sách các yêu cầu hoàn phí đã tạo trên hệ thống
            </p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Tìm theo nhà máy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f8faf1] border border-surface-variant rounded-xl text-xs focus:border-primary focus:outline-none font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-variant">
                <th className="py-4 px-6 pl-8">Ngày nộp</th>
                <th className="py-4 px-6">Hóa đơn liên quan</th>
                <th className="py-4 px-6 text-right">Số tiền</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6">Tập tin minh chứng</th>
                <th className="py-4 px-6">Ghi chú phản hồi</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    Chưa có lịch sử yêu cầu hoàn phí nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((ref) => {
                  let statusClass = '';
                  let statusText = '';
                  if (ref.trang_thai === 'DaHoanTien') {
                    statusClass = 'bg-primary/10 text-primary border border-primary/20';
                    statusText = 'Đã hoàn tiền';
                  } else if (ref.trang_thai === 'ChoXuLy') {
                    statusClass = 'bg-warning-yellow/15 text-yellow-750 border border-warning-yellow/40';
                    statusText = 'Chờ xử lý';
                  } else {
                    statusClass = 'bg-red-50 text-red-650 border border-red-200';
                    statusText = 'Từ chối';
                  }

                  return (
                    <tr key={ref.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6 pl-8 font-bold text-on-surface">
                        {new Date(ref.ngay_nop).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-6 font-bold text-on-surface group-hover:text-primary transition-colors">
                        {ref.hoaDon?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Đơn hoàn phí'}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-on-surface">
                        {Number(ref.hoaDon?.so_tien || 0).toLocaleString()}đ
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                          <span>{statusText}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-on-surface-variant font-mono">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-150 inline-flex max-w-[180px] truncate">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>{ref.file_don_da_duyet}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs italic text-on-surface-variant max-w-[200px] truncate font-medium">
                        {ref.ghi_chu_phan_hoi || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggest/Create Refund Request Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-surface-variant animate-scale-up">
            <div className="p-6 bg-primary text-white flex justify-between items-center">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Undo className="w-5 h-5 text-white" />
                <span>Tạo đơn yêu cầu hoàn lệ phí</span>
              </h3>
              <button 
                onClick={() => setShowRefundModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer font-bold text-sm"
              >
                <X className="w-5 h-5" />
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
                  {eligibleInvoices.map((i) => (
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
