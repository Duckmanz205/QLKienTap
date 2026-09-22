import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Copy, CheckCircle2, Eye, X
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function ThanhToan_SV() {
  const navigate = useNavigate();
  const activeTab = 'thanhToan';

  const [copiedId, setCopiedId] = useState(null);
  const [student, setStudent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchInvoices(res.data.id);
      }).catch(err => console.error(err));
      
      sinhVienApi.getPaymentConfig().then(res => {
        if(res.data) setPaymentConfig(res.data);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchInvoices = async (svId) => {
    try {
      const res = await sinhVienApi.getInvoices(svId);
      setInvoices(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ChuaDong': return 'Chưa đóng';
      case 'DaDongDungHan': return 'Đã đóng đúng hạn';
      case 'DaDongTreHan': return 'Đã đóng trễ hạn';
      case 'ViPham': return 'Vi phạm';
      case 'DaHoanPhi': return 'Đã hoàn phí';
      default: return status;
    }
  };

  const getStatusBadge = (statusStr) => {
    const status = getStatusText(statusStr);
    switch (status) {
      case 'Chưa đóng':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Đã đóng đúng hạn':
      case 'Đã đóng trễ hạn':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Vi phạm':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status}</span>;
      case 'Đã hoàn phí':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tài chính</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7E0C4] mb-8">
        <button
          onClick={() => navigate('/sinh-vien/payment')}
          className={`px-6 py-3 font-bold text-sm transition-colors relative cursor-pointer ${
            activeTab === 'thanhToan' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Thanh toán
          {activeTab === 'thanhToan' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] animate-in slide-in-from-left-4"></div>
          )}
        </button>
        <button
          onClick={() => navigate('/sinh-vien/refund')}
          className={`px-6 py-3 font-bold text-sm transition-colors relative cursor-pointer ${
            activeTab === 'hoanPhi' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Hoàn phí
          {activeTab === 'hoanPhi' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#89B449] animate-in slide-in-from-right-4"></div>
          )}
        </button>
      </div>

      {/* Tab Content: Thanh toán */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="p-5 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#407F3E]" />
            Lịch sử hóa đơn thanh toán
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 min-w-[200px]">Chuyến tham quan</th>
                <th className="p-4 min-w-[120px]">Số tiền</th>
                <th className="p-4 min-w-[250px]">Nội dung chuyển khoản</th>
                <th className="p-4 min-w-[120px]">Hạn đóng</th>
                <th className="p-4 text-center min-w-[150px]">Trạng thái</th>
                <th className="p-4 text-right pr-6 min-w-[120px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">Chưa có hóa đơn thanh toán nào.</td>
                </tr>
              ) : (
                invoices.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-800">
                      {payment.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chưa xác định'}
                    </td>
                    <td className="p-4 font-bold text-[#407F3E]">
                      {Number(payment.so_tien).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="p-4">
                      {payment.noi_dung_chuyen_khoan ? (
                        <div 
                          onClick={() => handleCopy(payment.noi_dung_chuyen_khoan, payment.id)}
                          className="inline-flex items-center gap-2 bg-[#E7E0C4]/50 hover:bg-[#E7E0C4] px-3 py-1.5 rounded-lg border border-[#E7E0C4] cursor-pointer transition-colors group relative"
                        >
                          <span className="font-mono font-bold text-xs text-slate-700 tracking-wider select-all">{payment.noi_dung_chuyen_khoan}</span>
                          {copiedId === payment.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#407F3E]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-medium">Chưa có</span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      {payment.han_dong ? new Date(payment.han_dong).toLocaleDateString('vi-VN') : '--'}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(payment.trang_thai)}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        onClick={() => setViewingPayment(payment)}
                        className="text-xs font-bold text-[#407F3E] hover:text-[#407F3E]/80 hover:underline transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem chi tiết */}
      {viewingPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-[#E7E0C4]/20 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Chi tiết hóa đơn lệ phí</h2>
              <button 
                onClick={() => setViewingPayment(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cột trái: Thông tin hóa đơn */}
                <div className="space-y-6">
                  {/* Thông tin chuyến đi */}
                  <div className="bg-white border border-[#E7E0C4] rounded-xl p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      Thông tin chuyến kiến tập
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Doanh nghiệp</span>
                        <span className="text-sm font-bold text-slate-800">
                          {viewingPayment.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || '--'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Ngày tham quan</span>
                          <span className="text-sm font-bold text-slate-800">
                            {viewingPayment.phieuDangKy?.chuyenThamQuan?.ngay_tham_quan ? new Date(viewingPayment.phieuDangKy.chuyenThamQuan.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Hình thức</span>
                          <span className="text-sm font-bold text-slate-800">
                            {viewingPayment.phieuDangKy?.chuyenThamQuan?.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 
                             viewingPayment.phieuDangKy?.chuyenThamQuan?.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : '--'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trạng thái thanh toán */}
                  <div className="bg-white border border-[#E7E0C4] rounded-xl p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      Tình trạng lệ phí
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Trạng thái</span>
                        <div className="mt-1">{getStatusBadge(viewingPayment.trang_thai)}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Hạn thu phí</span>
                          <span className="text-sm font-bold text-[#E68A8C]">
                            {viewingPayment.han_dong ? new Date(viewingPayment.han_dong).toLocaleString('vi-VN') : '--'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Ngày nộp thực tế</span>
                          <span className="text-sm font-bold text-slate-800">
                            {viewingPayment.ngay_dong_thuc_te ? new Date(viewingPayment.ngay_dong_thuc_te).toLocaleString('vi-VN') : '--'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col border-t border-dashed border-slate-200 pt-3 mt-3">
                        <span className="text-[11px] font-bold text-slate-500 uppercase mb-1">Tổng tiền cần đóng</span>
                        <span className="text-xl font-black text-[#407F3E]">
                          {Number(viewingPayment.so_tien).toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Thông tin chuyển khoản */}
                <div className="bg-white border border-[#407F3E]/30 rounded-xl p-5 shadow-sm flex flex-col h-full">
                  <h3 className="text-xs font-bold text-[#407F3E] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Thông tin thanh toán
                  </h3>

                  {viewingPayment.trang_thai === 'ChuaDong' && paymentConfig && paymentConfig.ma_ngan_hang && paymentConfig.so_tai_khoan ? (
                    <div className="flex flex-col items-center flex-1">
                      {/* Mã QR */}
                      <div className="bg-white p-2 rounded-2xl shadow-md border border-[#407F3E]/20 mb-5 w-48 h-48 flex items-center justify-center overflow-hidden shrink-0">
                        <img 
                          src={`https://img.vietqr.io/image/${paymentConfig.ma_ngan_hang}-${paymentConfig.so_tai_khoan}-compact.png?amount=${viewingPayment.so_tien}&addInfo=${encodeURIComponent(viewingPayment.noi_dung_chuyen_khoan)}&accountName=${encodeURIComponent(paymentConfig.ten_chu_tai_khoan)}`}
                          alt="VietQR"
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      
                      <p className="text-xs text-slate-500 text-center mb-4 italic">
                        Mở app Ngân hàng của bạn để quét mã QR bên trên, hoặc sao chép thông tin bên dưới.
                      </p>

                      <div className="w-full space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Ngân hàng thụ hưởng</span>
                          <span className="text-sm font-bold text-slate-800">{paymentConfig.ten_ngan_hang}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Chủ tài khoản</span>
                          <span className="text-sm font-bold text-slate-800">{paymentConfig.ten_chu_tai_khoan}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Số tài khoản</span>
                          <div className="flex items-center gap-2 group mt-0.5">
                            <span className="text-base font-bold text-[#407F3E] font-mono tracking-wider">{paymentConfig.so_tai_khoan}</span>
                            <button 
                              onClick={() => handleCopy(paymentConfig.so_tai_khoan, 'stk')}
                              className="p-1.5 rounded-md hover:bg-[#407F3E]/10 text-slate-400 hover:text-[#407F3E] transition-colors"
                              title="Sao chép STK"
                            >
                              {copiedId === 'stk' ? <CheckCircle2 className="w-4 h-4 text-[#407F3E]" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-bold text-red-500 uppercase mb-1">Nội dung chuyển khoản BẮT BUỘC</span>
                          <div className="flex items-center gap-2 group">
                            <span className="text-sm font-bold text-slate-800 font-mono break-all">{viewingPayment.noi_dung_chuyen_khoan}</span>
                            <button 
                              onClick={() => handleCopy(viewingPayment.noi_dung_chuyen_khoan, viewingPayment.id)}
                              className="p-1.5 shrink-0 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                              title="Sao chép nội dung"
                            >
                              {copiedId === viewingPayment.id ? <CheckCircle2 className="w-4 h-4 text-[#407F3E]" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : viewingPayment.trang_thai === 'ChuaDong' && (!paymentConfig || !paymentConfig.ma_ngan_hang) ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                        <CreditCard className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-base font-bold text-slate-700 mb-1">Chưa có thông tin thanh toán</p>
                      <p className="text-sm text-slate-500 px-4">
                        Câu lạc bộ chưa thiết lập cấu hình tài khoản thụ hưởng cho đợt này. Vui lòng quay lại kiểm tra sau.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm ${
                        viewingPayment.trang_thai === 'DaDongDungHan' ? 'bg-[#407F3E]/10' : 
                        viewingPayment.trang_thai === 'ViPham' ? 'bg-red-100' : 'bg-slate-100'
                      }`}>
                        {viewingPayment.trang_thai === 'DaDongDungHan' ? (
                          <CheckCircle2 className="w-8 h-8 text-[#407F3E]" />
                        ) : viewingPayment.trang_thai === 'ViPham' ? (
                          <X className="w-8 h-8 text-red-500" />
                        ) : (
                          <CreditCard className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <p className="text-base font-bold text-slate-700 mb-1">
                        {viewingPayment.trang_thai === 'DaDongDungHan' ? 'Đã hoàn tất thanh toán' : 
                         viewingPayment.trang_thai === 'ViPham' ? 'Hóa đơn vi phạm hạn nộp' : 'Không có thông tin thanh toán'}
                      </p>
                      <p className="text-sm text-slate-500 px-4">
                        {viewingPayment.trang_thai === 'DaDongDungHan' ? 'Cảm ơn bạn đã nộp lệ phí đúng hạn.' : 
                         viewingPayment.trang_thai === 'ViPham' ? 'Bạn đã quá hạn nộp lệ phí. Nếu có sai sót, vui lòng liên hệ Câu lạc bộ.' : ''}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-[#E7E0C4] flex justify-end shrink-0">
              <button 
                onClick={() => setViewingPayment(null)}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
