import React, { useState, useEffect } from 'react';
import { 
  Paperclip, CheckCircle2, XCircle, AlertTriangle, Search, ChevronDown, Check
} from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function DuyetHoanPhi_Khoa() {
  const [refunds, setRefunds] = useState([]);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Search & Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusSearchTerm, setStatusSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

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

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'Pending', label: 'Chờ xử lý' },
    { value: 'Approved', label: 'Đã hoàn tiền' },
    { value: 'Rejected', label: 'Từ chối' },
  ];

  const filteredStatusOptions = statusOptions.filter(opt =>
    opt.label.toLowerCase().includes(statusSearchTerm.toLowerCase())
  );

  const filteredRefunds = refunds.filter(r => {
    const sv = r.hoaDon?.phieuDangKy?.sinhVien || {};
    const maHd = r.hoaDon?.ma_hoa_don || '';

    if (selectedStatus && r.trang_thai !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchMssv = sv.mssv?.toLowerCase().includes(term);
      const matchName = sv.ho_ten?.toLowerCase().includes(term);
      const matchHd = maHd.toLowerCase().includes(term);
      if (!matchMssv && !matchName && !matchHd) return false;
    }
    return true;
  });

  const totalItems = filteredRefunds.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRefunds = filteredRefunds.slice((validCurrentPage - 1) * limit, validCurrentPage * limit);

  return (
    <div 
      className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300"
      onClick={() => {
        setIsStatusDropdownOpen(false);
        setStatusSearchTerm('');
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Duyệt hoàn phí</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-center gap-4 relative z-20 mb-6">
        {/* Tìm kiếm */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo MSSV, Họ tên, Mã hóa đơn..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
          />
        </div>

        {/* Trạng thái Dropdown */}
        <div className="relative min-w-[200px]" onClick={e => e.stopPropagation()}>
          <div 
            onClick={() => {
              setIsStatusDropdownOpen(!isStatusDropdownOpen);
              setStatusSearchTerm('');
            }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedStatus ? 'text-slate-700' : 'text-slate-400'}`}>
              {selectedStatus === 'Pending' ? 'Chờ xử lý' :
               selectedStatus === 'Approved' ? 'Đã hoàn tiền' :
               selectedStatus === 'Rejected' ? 'Từ chối' : 'Tất cả trạng thái'}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isStatusDropdownOpen ? 'rotate-180 text-[#407F3E]' : ''}`} />
          </div>
          {isStatusDropdownOpen && (
            <div className="absolute top-full right-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm trạng thái..." 
                  value={statusSearchTerm}
                  onChange={(e) => setStatusSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredStatusOptions.map(opt => (
                  <div 
                    key={opt.value}
                    onClick={() => { setSelectedStatus(opt.value); setIsStatusDropdownOpen(false); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      selectedStatus === opt.value ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/30 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {selectedStatus === opt.value && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                  </div>
                ))}
                {filteredStatusOptions.length === 0 && (
                  <div className="px-4 py-2 text-xs text-slate-400 text-center">Không tìm thấy trạng thái</div>
                )}
              </div>
            </div>
          )}
        </div>
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
              {paginatedRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-bold text-sm">
                    {refunds.length === 0 ? 'Không có hồ sơ hoàn phí nào!' : 'Không tìm thấy hồ sơ hoàn phí phù hợp.'}
                  </td>
                </tr>
              ) : (
                paginatedRefunds.map(r => {
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <select
              value={limit}
              onChange={e => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm text-sm"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>/ tổng số <strong className="text-slate-800">{totalItems}</strong> hồ sơ</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={validCurrentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {validCurrentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={validCurrentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
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
