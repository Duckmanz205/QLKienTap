import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Copy, CheckCircle2, Eye
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function ThanhToan_SV() {
  const navigate = useNavigate();
  const activeTab = 'thanhToan';

  const [copiedId, setCopiedId] = useState(null);
  const [student, setStudent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [viewingPayment, setViewingPayment] = useState(null);

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
                      {payment.han_dong_tien ? new Date(payment.han_dong_tien).toLocaleDateString('vi-VN') : '--'}
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-[#E7E0C4]/20">
              <h2 className="text-lg font-bold text-slate-800">Chi tiết hóa đơn</h2>
              <button 
                onClick={() => setViewingPayment(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <span className="font-bold text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {Object.entries(viewingPayment).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null) return null;
                  return (
                    <div key={key} className="flex flex-col border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{key}</span>
                      <span className="text-sm font-medium text-slate-800 break-words">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-[#E7E0C4] flex justify-end">
              <button 
                onClick={() => setViewingPayment(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-sm transition-colors cursor-pointer"
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
