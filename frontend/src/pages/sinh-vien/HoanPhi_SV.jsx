import toast from 'react-hot-toast';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RotateCcw, Plus, UploadCloud, X, Check, AlertCircle, Search, ChevronDown,
  Paperclip, ExternalLink, Building2, CreditCard, User
} from 'lucide-react';
import api, { sinhVienApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

const POPULAR_BANKS = [
  'Vietcombank',
  'MB Bank',
  'Techcombank',
  'BIDV',
  'VietinBank',
  'Agribank',
  'VPBank',
  'ACB',
  'TPBank',
  'Sacombank',
  'VIB',
  'HDBank',
  'OCB',
  'MSB',
  'SeABank',
  'SHB',
  'Khác'
];

export default function HoanPhi_SV() {
  const navigate = useNavigate();
  const activeTab = 'hoanPhi';

  const [student, setStudent] = useState(() => {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const parsed = JSON.parse(userJson);
        return parsed?.user?.details || null;
      }
    } catch {
      return null;
    }
    return null;
  });
  const [invoices, setInvoices] = useState([]);
  const [refunds, setRefunds] = useState([]);

  // Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [fileScanUrl, setFileScanUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Bank Info State
  const [nganHangNhan, setNganHangNhan] = useState('Vietcombank');
  const [customBankName, setCustomBankName] = useState('');
  const [soTaiKhoanNhan, setSoTaiKhoanNhan] = useState('');
  const [tenChuTaiKhoanNhan, setTenChuTaiKhoanNhan] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const parsed = JSON.parse(userJson);
        const userObj = parsed?.user;
        const accountId = userObj?.id;
        const cachedStudentId = userObj?.details?.id;

        if (cachedStudentId) {
          fetchData(cachedStudentId);
        }

        if (accountId) {
          sinhVienApi.getProfile(accountId).then(res => {
            if (res.data) {
              setStudent(res.data);
              if (!cachedStudentId || cachedStudentId !== res.data.id) {
                fetchData(res.data.id);
              }
              if (userObj && (!userObj.details || userObj.details.id !== res.data.id)) {
                localStorage.setItem('user', JSON.stringify({
                  ...parsed,
                  user: { ...userObj, details: res.data }
                }));
              }
            }
          }).catch(err => console.error('Lỗi khi tải thông tin sinh viên:', err));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchData = async (svId) => {
    try {
      const invRes = await sinhVienApi.getInvoices(svId);
      setInvoices(invRes.data || []);

      const refRes = await sinhVienApi.getRefundRequests(svId);
      setRefunds(refRes.data || []);
    } catch (err) {
      console.error('Error fetching refund data:', err);
    }
  };

  const handleOpenModal = () => {
    setSelectedInvoiceId('');
    setFileScanUrl('');
    setUploadedFileName('');
    setNganHangNhan('Vietcombank');
    setCustomBankName('');
    setSoTaiKhoanNhan('');
    setTenChuTaiKhoanNhan(student?.ho_ten ? student.ho_ten.toUpperCase() : '');
    setIsModalOpen(true);
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước tệp vượt quá hạn mức 5MB.');
        return;
      }
      
      setUploading(true);
      setUploadedFileName(file.name);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await api.post('/upload/attachment', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        setFileScanUrl(uploadRes.data.url);
      } catch (err) {
        console.error(err);
        toast.error('Tải lên minh chứng thất bại.');
        setUploadedFileName('');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      toast.error('Vui lòng chọn hóa đơn cần xin hoàn phí.');
      return;
    }

    const finalBank = nganHangNhan === 'Khác' ? customBankName.trim() : nganHangNhan.trim();
    if (!finalBank) {
      toast.error('Vui lòng chọn hoặc nhập tên ngân hàng nhận tiền hoàn.');
      return;
    }

    if (!soTaiKhoanNhan?.trim()) {
      toast.error('Vui lòng nhập số tài khoản nhận tiền hoàn.');
      return;
    }

    if (!tenChuTaiKhoanNhan?.trim()) {
      toast.error('Vui lòng nhập tên chủ tài khoản nhận tiền hoàn.');
      return;
    }

    if (!fileScanUrl) {
      toast.error('Vui lòng tải lên file đơn xin hoàn phí đã được BCN khoa duyệt.');
      return;
    }

    setMessage('');
    setError('');
    try {
      const res = await sinhVienApi.requestRefund({
        invoiceId: Number(selectedInvoiceId),
        fileScanUrl: fileScanUrl,
        nganHangNhan: finalBank,
        soTaiKhoanNhan: soTaiKhoanNhan.trim(),
        tenChuTaiKhoanNhan: tenChuTaiKhoanNhan.trim().toUpperCase(),
      });

      toast.success(res.data?.message || 'Gửi yêu cầu hoàn phí thành công!');
      setMessage(res.data?.message || 'Gửi yêu cầu hoàn phí thành công!');
      setIsModalOpen(false);
      setSelectedInvoiceId('');
      setFileScanUrl('');
      setUploadedFileName('');
      setSoTaiKhoanNhan('');
      if (student?.id) fetchData(student.id);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gửi yêu cầu hoàn phí thất bại.';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ChoXuLy':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm border border-[#DBD468]/20">Chờ xử lý</span>;
      case 'DaHoanTien':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm border border-[#89B449]/20">Đã hoàn tiền</span>;
      case 'TuChoi':
      case 'TuChi':
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-[#E68A8C] text-white shadow-sm border border-[#E68A8C]/20">Từ chối</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 whitespace-nowrap rounded-full text-[11px] font-bold bg-slate-200 text-slate-700 shadow-sm">{status}</span>;
    }
  };

  const filteredRefunds = useMemo(() => {
    return refunds.filter(r => {
      const q = searchQuery.toLowerCase();
      const invoiceName = r.hoaDon?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || `Hóa đơn #${r.hoaDon?.id}`;
      const bankInfo = `${r.ngan_hang_nhan || ''} ${r.so_tai_khoan_nhan || ''} ${r.ten_chu_tai_khoan_nhan || ''}`;
      const reason = r.ly_do_tu_choi || '';
      const matchSearch = !searchQuery || invoiceName.toLowerCase().includes(q) || bankInfo.toLowerCase().includes(q) || reason.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || r.trang_thai === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [refunds, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredRefunds.length / limit) || 1;
  const paginatedRefunds = filteredRefunds.slice((currentPage - 1) * limit, currentPage * limit);

  // Lọc các hóa đơn đủ điều kiện xin hoàn phí
  const existingRefundInvoiceIds = useMemo(() => refunds.map(r => r.hoa_don_id), [refunds]);
  const eligibleInvoices = useMemo(() => {
    return invoices.filter(i => {
      const isChuyenDaHuy = i.phieuDangKy?.chuyenThamQuan?.trang_thai === 'DaHuy';
      const isViPham = i.trang_thai === 'ViPham';
      const isPaidCancelled = i.trang_thai === 'DaDongDungHan' && isChuyenDaHuy;
      return (isViPham || isPaidCancelled) && !existingRefundInvoiceIds.includes(i.id) && i.trang_thai !== 'DaHoanPhi';
    });
  }, [invoices, existingRefundInvoiceIds]);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative">
      
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

      {message && (
        <div className="bg-[#e5ffdc] border border-[#89B449]/20 text-[#407F3E] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 mb-6 shadow-sm">
          <Check className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-[#FFEAEA] border border-[#E68A8C]/20 text-[#E68A8C] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 mb-6 shadow-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center justify-between relative z-20">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo nhà máy, số tài khoản, lý do..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all text-slate-800 font-medium"
          />
        </div>

        {/* Status Popover Dropdown */}
        <SearchableDropdown
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'ChoXuLy', label: 'Chờ xử lý' },
            { value: 'DaHoanTien', label: 'Đã hoàn tiền' },
            { value: 'TuChoi', label: 'Từ chối' }
          ]}
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
          placeholder="Tất cả trạng thái"
          searchPlaceholder="Tìm trạng thái..."
          className="min-w-[180px]"
        />

      </div>

      {/* Tab Content: Hoàn phí */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="p-5 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#407F3E]" />
            Lịch sử yêu cầu hoàn phí
          </h2>
          <button 
            onClick={handleOpenModal}
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
                <th className="p-4 pl-6 min-w-[110px]">Ngày nộp</th>
                <th className="p-4 min-w-[200px]">Chuyến đi / Hóa đơn</th>
                <th className="p-4 min-w-[120px]">Số tiền hoàn</th>
                <th className="p-4 min-w-[220px]">Tài khoản nhận tiền</th>
                <th className="p-4 text-center min-w-[110px]">Minh chứng</th>
                <th className="p-4 text-center min-w-[120px]">Trạng thái</th>
                <th className="p-4 min-w-[180px]">Phản hồi / Ghi chú</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {paginatedRefunds.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-medium italic">
                    Không có dữ liệu yêu cầu hoàn phí phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedRefunds.map(refund => (
                  <tr key={refund.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-medium text-slate-600 whitespace-nowrap">
                      {new Date(refund.ngay_nop).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 line-clamp-1">
                        {refund.hoaDon?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến tham quan'}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Hóa đơn #{refund.hoa_don_id}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap font-bold text-[#407F3E]">
                      {refund.hoaDon?.so_tien ? `${Number(refund.hoaDon.so_tien).toLocaleString('vi-VN')} đ` : '--'}
                    </td>
                    <td className="p-4">
                      <div className="text-xs">
                        <span className="inline-block font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mb-1">
                          {refund.ngan_hang_nhan}
                        </span>
                        <p className="font-mono font-bold text-slate-800">{refund.so_tai_khoan_nhan}</p>
                        <p className="text-[11px] text-slate-500 font-semibold uppercase">{refund.ten_chu_tai_khoan_nhan}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {refund.file_don_da_duyet ? (
                        <button
                          type="button"
                          onClick={() => window.open(refund.file_don_da_duyet, '_blank', 'noopener,noreferrer')}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#407F3E] hover:underline bg-[#407F3E]/10 hover:bg-[#407F3E]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Xem file đơn đã nộp"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          Xem file
                        </button>
                      ) : (
                        <span className="text-slate-300 italic text-xs">Không có</span>
                      )}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {getStatusBadge(refund.trang_thai)}
                    </td>
                    <td className="p-4 text-xs">
                      {refund.trang_thai === 'TuChoi' ? (
                        <span className="font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 inline-block">
                          {refund.ly_do_tu_choi || 'Bị từ chối hoàn phí'}
                        </span>
                      ) : refund.trang_thai === 'DaHoanTien' ? (
                        <span className="font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block">
                          Đã chuyển khoản hoàn tất
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Đang chờ BCN xét duyệt</span>
                      )}
                    </td>
                  </tr>
                ))
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
              className="w-20"
            />
            <span>/ {filteredRefunds.length} yêu cầu</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-[#E7E0C4] rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            <span className="text-sm font-bold text-slate-700 px-2">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-[#E7E0C4] rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tạo đơn hoàn phí */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#407F3E]" />
                Tạo đơn yêu cầu hoàn phí
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="flex-1 overflow-y-auto">
              {/* Modal Body */}
              <div className="p-6 space-y-4">
                
                {/* 1. Chọn hóa đơn */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Hóa đơn cần hoàn phí <span className="text-[#E68A8C]">*</span>
                  </label>
                  {eligibleInvoices.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      Hiện tại bạn không có hóa đơn nào đủ điều kiện xin hoàn phí (hóa đơn vi phạm hoặc chuyến đi bị hủy).
                    </div>
                  ) : (
                    <SearchableDropdown
                      options={eligibleInvoices.map(i => {
                        const factoryName = i.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến tham quan';
                        const reasonText = i.phieuDangKy?.chuyenThamQuan?.trang_thai === 'DaHuy' ? 'Chuyến bị hủy' : 'Vi phạm đóng trễ/sai';
                        return {
                          value: i.id,
                          label: `${factoryName} (${Number(i.so_tien).toLocaleString('vi-VN')} đ) - [${reasonText}]`,
                          subLabel: `Mã HĐ #${i.id} | Hạn đóng: ${new Date(i.han_dong).toLocaleDateString('vi-VN')}`
                        };
                      })}
                      value={selectedInvoiceId}
                      onChange={(val) => setSelectedInvoiceId(val)}
                      placeholder="-- Chọn hóa đơn --"
                      searchPlaceholder="Tìm kiếm hóa đơn..."
                    />
                  )}
                </div>

                {/* 2. Cụm Thông tin tài khoản nhận tiền */}
                <div className="bg-slate-50 p-4 rounded-xl border border-[#E7E0C4] space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-[#E7E0C4]/60 pb-2">
                    <CreditCard className="w-4 h-4 text-[#407F3E]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Tài khoản ngân hàng nhận tiền hoàn
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Ngân hàng nhận */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ngân hàng <span className="text-[#E68A8C]">*</span>
                      </label>
                      <SearchableDropdown
                        options={POPULAR_BANKS.map(b => ({ value: b, label: b }))}
                        value={nganHangNhan}
                        onChange={(val) => setNganHangNhan(val)}
                        placeholder="Chọn ngân hàng"
                        searchPlaceholder="Tìm ngân hàng..."
                      />
                    </div>

                    {/* Số tài khoản nhận */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số tài khoản <span className="text-[#E68A8C]">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={soTaiKhoanNhan}
                        onChange={(e) => setSoTaiKhoanNhan(e.target.value.replace(/\s+/g, ''))}
                        placeholder="Nhập số tài khoản..."
                        required
                        className="w-full px-3 py-2 bg-white border border-[#E7E0C4] rounded-lg text-sm font-mono focus:outline-none focus:border-[#407F3E] text-slate-800"
                      />
                    </div>
                  </div>

                  {nganHangNhan === 'Khác' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên ngân hàng khác <span className="text-[#E68A8C]">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={customBankName}
                        onChange={(e) => setCustomBankName(e.target.value)}
                        placeholder="Nhập tên ngân hàng của bạn..."
                        required
                        className="w-full px-3 py-2 bg-white border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] text-slate-800"
                      />
                    </div>
                  )}

                  {/* Tên chủ tài khoản */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên chủ tài khoản (Người thụ hưởng) <span className="text-[#E68A8C]">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={tenChuTaiKhoanNhan}
                      onChange={(e) => setTenChuTaiKhoanNhan(e.target.value.toUpperCase())}
                      placeholder="VD: NGUYEN VAN A"
                      required
                      className="w-full px-3 py-2 bg-white border border-[#E7E0C4] rounded-lg text-sm font-bold uppercase focus:outline-none focus:border-[#407F3E] text-slate-800"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 italic">
                      * Vui lòng nhập đúng họ tên chủ tài khoản để tiền hoàn được chuyển chính xác.
                    </p>
                  </div>
                </div>

                {/* 3. Tải file đơn đã được BCN khoa duyệt */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    File đơn đã được BCN khoa duyệt <span className="text-[#E68A8C]">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-[#E7E0C4] bg-white hover:border-[#407F3E] hover:bg-[#407F3E]/5 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer group">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      accept="application/pdf,image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required={!fileScanUrl}
                    />
                    <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-[#407F3E] mb-2 transition-colors" />
                    <p className="text-xs font-bold text-slate-700 text-center mb-0.5">
                      {uploadedFileName ? uploadedFileName : "Kéo thả hoặc nhấp để tải file minh chứng"}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">Hỗ trợ PDF, JPG, PNG (Tối đa 5MB)</p>
                  </div>
                  {uploading && <p className="text-xs text-amber-600 font-bold mt-1.5">Đang tải lên tệp tin...</p>}
                  {fileScanUrl && <p className="text-xs text-[#407F3E] font-bold mt-1.5">✓ Đã tải lên file minh chứng thành công</p>}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-[#E7E0C4] flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-white border border-[#E7E0C4] hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || eligibleInvoices.length === 0}
                  className="px-6 py-2 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}

    </div>
  );
}
