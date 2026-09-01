import React, { useState, useEffect } from 'react';
import { Paperclip, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function DuyetHoanPhi_Khoa() {
  const [refunds, setRefunds] = useState([]);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const res = await khoaApi.getRefundRequests();
      setRefunds(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await khoaApi.approveRefund({ request_id: id, status: 'Approved' });
      fetchRefunds();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      await khoaApi.approveRefund({ 
        request_id: rejectionTarget.id, 
        status: 'Rejected', 
        reason: rejectionReason 
      });
      setRejectionTarget(null);
      setRejectionReason('');
      fetchRefunds();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">Đã hoàn tiền</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">Chờ xử lý</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">Từ chối</span>;
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
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-bold text-sm">
                    Không có hồ sơ hoàn phí nào!
                  </td>
                </tr>
              ) : (
                refunds.map(r => {
                  const sv = r.hoaDon?.phieuDangKy?.sinhVien || {};
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-[#407F3E]">{sv.mssv}</td>
                      <td className="p-4 font-bold text-slate-800">{sv.ho_ten}</td>
                      <td className="p-4 font-medium text-slate-600">{r.hoaDon?.ma_hoa_don || 'Hóa đơn'}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => window.open(r.file_don_da_duyet, '_blank', 'noopener,noreferrer')}
                          disabled={!r.file_don_da_duyet}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#407F3E] hover:underline bg-[#407F3E]/10 px-2 py-1 rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                          title={r.file_don_da_duyet || 'Chưa có file'}
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          Xem file
                        </button>
                      </td>
                      <td className="p-4 font-medium text-slate-500">{new Date(r.ngay_yeu_cau).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-center">
                        {getStatusBadge(r.trang_thai)}
                      </td>
                      <td className="p-4 text-right pr-6">
                        {r.trang_thai === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleApprove(r.id)}
                              className="px-2.5 py-1 whitespace-nowrap bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-lg text-[11px] uppercase tracking-wider font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Hoàn tiền
                            </button>
                            <button 
                              onClick={() => setRejectionTarget(r)}
                              className="px-2.5 py-1 whitespace-nowrap border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-300 italic">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-[#E7E0C4] bg-white flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-[#E68A8C]" />
                <span>Từ chối hoàn phí</span>
              </h3>
              <button 
                onClick={() => setRejectionTarget(null)} 
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 font-semibold text-sm">
              <p className="text-xs text-slate-500">
                Sinh viên: <span className="font-bold text-slate-800">{rejectionTarget.hoaDon?.phieuDangKy?.sinhVien?.ho_ten} ({rejectionTarget.hoaDon?.phieuDangKy?.sinhVien?.mssv})</span>
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Lý do từ chối *
                </label>
                <textarea 
                  value={rejectionReason} 
                  onChange={e => setRejectionReason(e.target.value)} 
                  placeholder="Nhập lý do từ chối yêu cầu hoàn lệ phí..." 
                  required 
                  rows={3} 
                  className="w-full px-4 py-2.5 border border-[#E7E0C4] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#407F3E]/20 text-slate-700"
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E7E0C4]">
                <button 
                  type="button" 
                  onClick={() => setRejectionTarget(null)} 
                  className="px-5 py-2.5 border border-[#E7E0C4] rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#E68A8C] hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Từ chối yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
