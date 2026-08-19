import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RotateCcw, Plus, UploadCloud, X
} from 'lucide-react';

export default function HoanPhi_SV() {
  const navigate = useNavigate();
  const activeTab = 'hoanPhi';

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Data
  const refunds = [
    {
      id: 1,
      ngayNop: '10/08/2026',
      hoaDonLienQuan: 'HD-Acecook Việt Nam (MSSV123456 ACECOOK)',
      lyDo: 'Bị loại do hủy chuyến',
      trangThai: 'Chờ xử lý'
    },
    {
      id: 2,
      ngayNop: '05/07/2026',
      hoaDonLienQuan: 'HD-KIDO Group (MSSV123456 KIDO)',
      lyDo: 'Khoa thông báo hủy chuyến',
      trangThai: 'Đã hoàn tiền'
    },
    {
      id: 3,
      ngayNop: '12/06/2026',
      hoaDonLienQuan: 'HD-Vinamilk (MSSV123456 VINAMILK)',
      lyDo: 'Lý do cá nhân (không hợp lệ)',
      trangThai: 'Từ chối'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ xử lý':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">{status}</span>;
      case 'Đã hoàn tiền':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">{status}</span>;
      case 'Từ chối':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">{status}</span>;
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

      {/* Tab Content: Hoàn phí */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="p-5 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#407F3E]" />
            Lịch sử yêu cầu hoàn phí
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo đơn hoàn phí
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 min-w-[120px]">Ngày nộp</th>
                <th className="p-4 min-w-[250px]">Hóa đơn liên quan</th>
                <th className="p-4 min-w-[200px]">Lý do / Phản hồi</th>
                <th className="p-4 text-center min-w-[150px]">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 font-medium italic">
                    Không có dữ liệu yêu cầu hoàn phí.
                  </td>
                </tr>
              ) : (
                refunds.map(refund => (
                  <tr key={refund.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-medium text-slate-600">{refund.ngayNop}</td>
                    <td className="p-4 font-bold text-slate-800">{refund.hoaDonLienQuan}</td>
                    <td className="p-4 font-medium text-slate-600">{refund.lyDo}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(refund.trangThai)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tạo đơn hoàn phí */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800">Tạo đơn yêu cầu hoàn phí</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Chọn hóa đơn vi phạm <span className="text-[#E68A8C]">*</span></label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium appearance-none cursor-pointer">
                  <option value="">-- Chọn hóa đơn --</option>
                  <option value="1">HD-Acecook Việt Nam (MSSV123456 ACECOOK)</option>
                  <option value="2">HD-Yakult HCM (MSSV123456 YAKULT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  File đơn đã được BCN khoa duyệt <span className="text-[#E68A8C]">*</span>
                </label>
                <div className="border-2 border-dashed border-[#E7E0C4] bg-white hover:border-[#407F3E] hover:bg-[#407F3E]/5 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer group">
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#407F3E] mb-3 transition-colors" />
                  <p className="text-sm font-bold text-slate-700 text-center mb-1">Kéo thả File minh chứng vào đây</p>
                  <p className="text-[10px] font-medium text-slate-400">Định dạng JPG, PNG, PDF (Tối đa 5MB)</p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E7E0C4] flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-white border border-[#E7E0C4] hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button className="px-6 py-2 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer">
                Gửi yêu cầu
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
