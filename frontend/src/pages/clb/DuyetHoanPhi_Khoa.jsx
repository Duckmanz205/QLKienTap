import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { 
  Paperclip, CheckCircle2, XCircle, AlertTriangle, Search, ChevronDown, Check,
  Copy, CreditCard, Building2, ExternalLink
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function DuyetHoanPhi_Khoa() {
  const [refunds, setRefunds] = useState([]);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Search & Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const res = await khoaApi.getRefundRequests({ page: 1, limit: 10000 });
      setRefunds(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text, label = 'nội dung') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}: ${text}`);
  };

  const handleApprove = async (id) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const approverId = user?.user?.id || user?.id || 1;
      await khoaApi.approveRefund({ 
        refundId: id,
        request_id: id,
        approverId: approverId, 
        isApproved: true,
        status: 'Approved' 
      });
      fetchRefunds();
      toast.success('Duyệt hoàn phí thành công');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi duyệt hoàn phí');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const approverId = user?.user?.id || user?.id || 1;
      await khoaApi.approveRefund({ 
        refundId: rejectionTarget.id,
        request_id: rejectionTarget.id, 
        approverId: approverId, 
        isApproved: false,
        status: 'Rejected', 
        reason: rejectionReason 
      });
      setRejectionTarget(null);
      setRejectionReason('');
      fetchRefunds();
      toast.success('Đã từ chối hoàn phí');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
      case 'DaHoanTien':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">Đã hoàn tiền</span>;
      case 'Pending':
      case 'ChoXuLy':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">Chờ xử lý</span>;
      case 'Rejected':
      case 'TuChoi':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">Từ chối</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'ChoXuLy', label: 'Chờ xử lý' },
    { value: 'DaHoanTien', label: 'Đã hoàn tiền' },
    { value: 'TuChoi', label: 'Từ chối' },
  ];

  const filteredRefunds = refunds.filter(r => {
    const sv = r.hoaDon?.phieuDangKy?.sinhVien || {};
    const factoryName = r.hoaDon?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || '';
    const bankInfo = `${r.ngan_hang_nhan || ''} ${r.so_tai_khoan_nhan || ''} ${r.ten_chu_tai_khoan_nhan || ''}`;
    const hdId = String(r.hoa_don_id || r.hoaDon?.id || '');

    if (selectedStatus && r.trang_thai !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchMssv = sv.mssv?.toLowerCase().includes(term);
      const matchName = sv.ho_ten?.toLowerCase().includes(term);
      const matchFactory = factoryName.toLowerCase().includes(term);
      const matchBank = bankInfo.toLowerCase().includes(term);
      const matchHd = hdId.includes(term);
      if (!matchMssv && !matchName && !matchFactory && !matchBank && !matchHd) return false;
    }
    return true;
  });

  const totalItems = filteredRefunds.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRefunds = filteredRefunds.slice((validCurrentPage - 1) * limit, validCurrentPage * limit);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Duyệt hoàn phí</h1>
        <p className="text-xs text-slate-500 mt-1">
          Xét duyệt và chuyển khoản hoàn tiền cho sinh viên có đơn xin hoàn lệ phí hợp lệ.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex flex-wrap items-center gap-4 relative z-20 mb-6">
        {/* Tìm kiếm */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo MSSV, Họ tên, Nhà máy, Số tài khoản..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
          />
        </div>

        {/* Trạng thái Dropdown */}
        <SearchableDropdown
          options={statusOptions}
          value={selectedStatus}
          onChange={(val) => {
            setSelectedStatus(val);
            setCurrentPage(1);
          }}
          placeholder="Tất cả trạng thái"
          searchPlaceholder="Tìm trạng thái..."
          className="min-w-[200px]"
        />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 min-w-[110px]">MSSV</th>
                <th className="p-4 min-w-[160px]">Họ tên sinh viên</th>
                <th className="p-4 min-w-[200px]">Chuyến đi / Hóa đơn</th>
                <th className="p-4 min-w-[120px]">Số tiền hoàn</th>
                <th className="p-4 min-w-[230px]">Tài khoản nhận tiền</th>
                <th className="p-4 text-center min-w-[110px]">Minh chứng</th>
                <th className="p-4 min-w-[110px]">Ngày nộp</th>
                <th className="p-4 text-center min-w-[120px]">Trạng thái</th>
                <th className="p-4 text-right pr-6 min-w-[180px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {paginatedRefunds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 font-bold text-sm">
                    {refunds.length === 0 ? 'Không có hồ sơ hoàn phí nào!' : 'Không tìm thấy hồ sơ hoàn phí phù hợp.'}
                  </td>
                </tr>
              ) : (
                paginatedRefunds.map(r => {
                  const sv = r.hoaDon?.phieuDangKy?.sinhVien || {};
                  const factoryName = r.hoaDon?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến tham quan';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-[#407F3E] whitespace-nowrap">{sv.mssv || '--'}</td>
                      <td className="p-4 font-bold text-slate-800 whitespace-nowrap">{sv.ho_ten || '--'}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800 line-clamp-1">{factoryName}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Hóa đơn #{r.hoa_don_id}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-[#407F3E] text-sm">
                          {r.hoaDon?.so_tien ? `${Number(r.hoaDon.so_tien).toLocaleString('vi-VN')} đ` : '--'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          <span className="inline-block font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {r.ngan_hang_nhan}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                            <span>{r.so_tai_khoan_nhan}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(r.so_tai_khoan_nhan, 'Số tài khoản')}
                              className="text-slate-400 hover:text-[#407F3E] p-0.5 rounded transition-colors cursor-pointer"
                              title="Copy số tài khoản"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold uppercase">{r.ten_chu_tai_khoan_nhan}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button 
                          onClick={() => window.open(r.file_don_da_duyet, '_blank', 'noopener,noreferrer')}
                          disabled={!r.file_don_da_duyet}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#407F3E] hover:underline bg-[#407F3E]/10 hover:bg-[#407F3E]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                          title={r.file_don_da_duyet || 'Chưa có file'}
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          Xem file
                        </button>
                      </td>
                      <td className="p-4 font-medium text-slate-500 whitespace-nowrap">
                        {new Date(r.ngay_nop).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        {getStatusBadge(r.trang_thai)}
                      </td>
                      <td className="p-4 text-right pr-6 whitespace-nowrap">
                        {r.trang_thai === 'ChoXuLy' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleApprove(r.id)}
                              className="px-3 py-1.5 whitespace-nowrap bg-[#89B449] hover:bg-[#89B449]/90 text-white rounded-lg text-xs uppercase tracking-wider font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Hoàn tiền
                            </button>
                            <button 
                              onClick={() => setRejectionTarget(r)}
                              className="px-3 py-1.5 whitespace-nowrap border border-[#E68A8C] text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Từ chối
                            </button>
                          </div>
                        ) : r.trang_thai === 'TuChoi' ? (
                          <div className="text-right">
                            <span className="text-xs font-bold text-rose-600 block">Đã từ chối</span>
                            {r.ly_do_tu_choi && (
                              <span className="text-[11px] text-slate-400 italic block line-clamp-1 max-w-[160px] ml-auto" title={r.ly_do_tu_choi}>
                                {r.ly_do_tu_choi}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 italic">Đã hoàn tiền</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <SearchableDropdown 
              options={[
                { value: 15, label: '15' },
                { value: 30, label: '30' },
                { value: 50, label: '50' },
                { value: 100, label: '100' }
              ]}
              value={limit}
              onChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
              searchPlaceholder="Tìm số lượng..."
              className="min-w-[80px]"
              direction="up"
            />
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
