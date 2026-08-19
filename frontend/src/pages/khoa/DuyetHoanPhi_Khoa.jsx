import React from 'react';
import { Paperclip, CheckCircle2, XCircle } from 'lucide-react';

export default function DuyetHoanPhi_Khoa() {
  // Mock Data
  const refunds = [
    { 
      id: 1, 
      mssv: '2001215001', 
      ten: 'Nguyễn Văn An', 
      hoaDon: 'Vinamilk Bình Dương', 
      file: 'Don_xin_hoan_phi_An.pdf', 
      ngayNop: '26/08/2026', 
      trangThai: 'Chờ xử lý' 
    },
    { 
      id: 2, 
      mssv: '2001215004', 
      ten: 'Phạm Duy Khang', 
      hoaDon: 'Yakult HCM', 
      file: 'Giay_xac_nhan.jpg', 
      ngayNop: '24/08/2026', 
      trangThai: 'Đã hoàn tiền' 
    },
    { 
      id: 3, 
      mssv: '2001215005', 
      ten: 'Vũ Quốc Huy', 
      hoaDon: 'CP Group Việt Nam', 
      file: 'Don_Huy.pdf', 
      ngayNop: '28/08/2026', 
      trangThai: 'Từ chối' 
    },
    { 
      id: 4, 
      mssv: '2001215008', 
      ten: 'Lê Hữu Đạt', 
      hoaDon: 'Acecook HCM', 
      file: 'Minh_chung_sck.pdf', 
      ngayNop: '01/09/2026', 
      trangThai: 'Chờ xử lý' 
    },
  ];

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đã hoàn tiền':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Chờ xử lý':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Từ chối':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Duyệt hoàn phí</h1>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">MSSV</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Hóa đơn liên quan</th>
                <th className="p-4 text-center">File đơn đã duyệt</th>
                <th className="p-4">Ngày nộp</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right pr-6 min-w-[220px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {refunds.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{r.mssv}</td>
                  <td className="p-4 font-bold text-slate-800">{r.ten}</td>
                  <td className="p-4 font-medium text-slate-600">{r.hoaDon}</td>
                  <td className="p-4 text-center">
                    <a href="#" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#407F3E] hover:underline bg-[#407F3E]/10 px-2 py-1 rounded transition-colors" title={r.file}>
                      <Paperclip className="w-3.5 h-3.5" />
                      Xem file
                    </a>
                  </td>
                  <td className="p-4 font-medium text-slate-500">{r.ngayNop}</td>
                  <td className="p-4 text-center">
                    {getStatusBadge(r.trangThai)}
                  </td>
                  <td className="p-4 text-right pr-6">
                    {r.trangThai === 'Chờ xử lý' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-2.5 py-1 whitespace-nowrap bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-lg text-[11px] uppercase tracking-wider font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Hoàn tiền
                        </button>
                        <button className="px-2.5 py-1 whitespace-nowrap border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-colors flex items-center gap-1 cursor-pointer">
                          <XCircle className="w-3.5 h-3.5" />
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-300 italic">Đã xử lý</span>
                    )}
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
