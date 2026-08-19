import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Copy, CheckCircle2, Eye
} from 'lucide-react';

export default function ThanhToan_SV() {
  const navigate = useNavigate();
  const activeTab = 'thanhToan';

  const [copiedId, setCopiedId] = useState(null);

  // Mock Data
  const payments = [
    {
      id: 1,
      chuyenThamQuan: 'Nhà máy Yakult HCM',
      soTien: '150.000 VNĐ',
      noiDungCK: 'MSSV123456 YAKULT',
      hanDong: '17/09/2026',
      trangThai: 'Chưa đóng'
    },
    {
      id: 2,
      chuyenThamQuan: 'Vinamilk Bình Dương',
      soTien: '200.000 VNĐ',
      noiDungCK: 'MSSV123456 VINAMILK',
      hanDong: '15/08/2026',
      trangThai: 'Đã đóng đúng hạn'
    },
    {
      id: 3,
      chuyenThamQuan: 'Acecook Việt Nam',
      soTien: '150.000 VNĐ',
      noiDungCK: 'MSSV123456 ACECOOK',
      hanDong: '01/08/2026',
      trangThai: 'Vi phạm'
    },
    {
      id: 4,
      chuyenThamQuan: 'KIDO Group',
      soTien: '150.000 VNĐ',
      noiDungCK: 'MSSV123456 KIDO',
      hanDong: '10/07/2026',
      trangThai: 'Đã hoàn phí'
    }
  ];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chưa đóng':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Đã đóng đúng hạn':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Vi phạm':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status}</span>;
      case 'Đã hoàn phí':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
      default:
        return null;
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
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-800">{payment.chuyenThamQuan}</td>
                  <td className="p-4 font-bold text-[#407F3E]">{payment.soTien}</td>
                  <td className="p-4">
                    <div 
                      onClick={() => handleCopy(payment.noiDungCK, payment.id)}
                      className="inline-flex items-center gap-2 bg-[#E7E0C4]/50 hover:bg-[#E7E0C4] px-3 py-1.5 rounded-lg border border-[#E7E0C4] cursor-pointer transition-colors group relative"
                    >
                      <span className="font-mono font-bold text-xs text-slate-700 tracking-wider select-all">{payment.noiDungCK}</span>
                      {copiedId === payment.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#407F3E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-600">{payment.hanDong}</td>
                  <td className="p-4 text-center">
                    {getStatusBadge(payment.trangThai)}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button className="text-xs font-bold text-[#407F3E] hover:text-[#407F3E]/80 hover:underline transition-colors cursor-pointer inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
