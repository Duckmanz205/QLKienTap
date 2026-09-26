import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RotateCcw, Plus, UploadCloud, X, Check, AlertCircle, Search, ChevronDown
} from 'lucide-react';
import api, { sinhVienApi } from '../../services/api';

export default function HoanPhi_SV() {
  const navigate = useNavigate();
  const activeTab = 'hoanPhi';

  const [student, setStudent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [refunds, setRefunds] = useState([]);

  // Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [searchStatusDropdown, setSearchStatusDropdown] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [fileScanUrl, setFileScanUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

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
      setRefunds(refRes.data);
    } catch (err) {
      console.error('Error fetching refund data:', err);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước tệp vượt quá hạn mức 5MB.');
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
        alert('Tải lên minh chứng thất bại.');
        setUploadedFileName('');
      } finally {
        setUploading(false);
      }
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
      const fileName = fileScanUrl || `Don_hoan_phi_${selectedInvoiceId}_${student?.mssv}.pdf`;
      const res = await sinhVienApi.requestRefund({
        invoiceId: Number(selectedInvoiceId),
        fileScanUrl: fileName
      });

      setMessage(res.data.message);
      setIsModalOpen(false);
      setSelectedInvoiceId('');
      setFileScanUrl('');
      setUploadedFileName('');
      fetchData(student.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi yêu cầu hoàn phí thất bại.');
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
      const note = r.ghi_chu_phan_hoi || '';
      const matchSearch = !searchQuery || invoiceName.toLowerCase().includes(q) || note.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || r.trang_thai === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [refunds, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredRefunds.length / limit) || 1;
  const paginatedRefunds = filteredRefunds.slice((currentPage - 1) * limit, currentPage * limit);

  const existingRefundInvoiceIds = refunds.map(r => r.hoa_don_id);
  const eligibleInvoices = invoices.filter(i => 
    i.trang_thai === 'ViPham' && !existingRefundInvoiceIds.includes(i.id)
  );

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative" onClick={() => setIsStatusDropdownOpen(false)}>
      
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
            placeholder="Tìm theo nhà máy, nội dung..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] transition-all text-slate-800 font-medium"
          />
        </div>

        {/* Status Popover Dropdown */}
        <div className="relative min-w-[180px]" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="truncate pr-2 font-medium text-slate-700">
              {statusFilter === 'ALL' && 'Tất cả trạng thái'}
              {statusFilter === 'ChoXuLy' && 'Chờ xử lý'}
              {statusFilter === 'DaHoanTien' && 'Đã hoàn tiền'}
              {statusFilter === 'TuChoi' && 'Từ chối'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isStatusDropdownOpen && (
            <div className="absolute top-full right-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm trạng thái..." 
                  value={searchStatusDropdown}
                  onChange={(e) => setSearchStatusDropdown(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {[
                  { id: 'ALL', label: 'Tất cả trạng thái' },
                  { id: 'ChoXuLy', label: 'Chờ xử lý' },
                  { id: 'DaHoanTien', label: 'Đã hoàn tiền' },
                  { id: 'TuChoi', label: 'Từ chối' },
                ]
                  .filter(opt => opt.label.toLowerCase().includes(searchStatusDropdown.toLowerCase()))
                  .map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => {
                        setStatusFilter(opt.id);
                        setIsStatusDropdownOpen(false);
                        setSearchStatusDropdown('');
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        statusFilter === opt.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {statusFilter === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                    </div>
                  ))}
                {[
                  { id: 'ALL', label: 'Tất cả trạng thái' },
                  { id: 'ChoXuLy', label: 'Chờ xử lý' },
                  { id: 'DaHoanTien', label: 'Đã hoàn tiền' },
                  { id: 'TuChoi', label: 'Từ chối' },
                ].filter(opt => opt.label.toLowerCase().includes(searchStatusDropdown.toLowerCase())).length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                )}
              </div>
            </div>
          )}
        </div>

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
              {paginatedRefunds.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 font-medium italic">
                    Không có dữ liệu yêu cầu hoàn phí phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedRefunds.map(refund => (
                  <tr key={refund.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-medium text-slate-600">
                      {new Date(refund.ngay_nop).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {refund.hoaDon?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || `Hóa đơn #${refund.hoaDon?.id}`}
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      {refund.ghi_chu_phan_hoi || refund.file_don_da_duyet || '-'}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(refund.trang_thai)}
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
            <select 
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                setCurrentPage(1);
              }}
              className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>/ {filteredRefunds.length} yêu cầu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {currentPage} / {totalPages}
            </span>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
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

            <form onSubmit={handleRefundSubmit}>
              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Chọn hóa đơn vi phạm <span className="text-[#E68A8C]">*</span></label>
                  <select 
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium appearance-none cursor-pointer"
                  >
                    <option value="">-- Chọn hóa đơn --</option>
                    {eligibleInvoices.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || `Hóa đơn #${i.id}`} ({Number(i.so_tien).toLocaleString()}đ)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    File đơn đã được BCN khoa duyệt <span className="text-[#E68A8C]">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-[#E7E0C4] bg-white hover:border-[#407F3E] hover:bg-[#407F3E]/5 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer group">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      accept="application/pdf,image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required={!fileScanUrl}
                    />
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#407F3E] mb-3 transition-colors" />
                    <p className="text-sm font-bold text-slate-700 text-center mb-1">
                      {uploadedFileName ? uploadedFileName : "Kéo thả File minh chứng vào đây"}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">Định dạng JPG, PNG, PDF (Tối đa 5MB)</p>
                  </div>
                  {uploading && <p className="text-xs text-amber-600 font-bold mt-2">Đang tải lên tệp tin...</p>}
                  {fileScanUrl && <p className="text-xs text-[#407F3E] font-bold mt-2">✓ Đã tải lên thành công</p>}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-[#E7E0C4] flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-white border border-[#E7E0C4] hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
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
