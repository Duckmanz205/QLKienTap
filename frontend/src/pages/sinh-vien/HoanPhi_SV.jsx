import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RotateCcw, Plus, UploadCloud, X, Check, AlertCircle
} from 'lucide-react';
import api, { sinhVienApi } from '../../services/api';

export default function HoanPhi_SV() {
  const navigate = useNavigate();
  const activeTab = 'hoanPhi';

  const [student, setStudent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [refunds, setRefunds] = useState([]);

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

  const existingRefundInvoiceIds = refunds.map(r => r.hoa_don_id);
  const eligibleInvoices = invoices.filter(i => 
    i.trang_thai === 'ViPham' && !existingRefundInvoiceIds.includes(i.id)
  );

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
