import React, { useState } from 'react';
import { RotateCcw, FileText, CheckCircle, XCircle, Search, Clock, Check, X, AlertTriangle } from 'lucide-react';

const initialRefundRecords = [
  { mssv: '2001200123', name: 'Nguyễn Văn Nam', class: '14ĐHTP01', amount: 1500000, reason: 'Trùng lịch thi học phần quân sự', fileUrl: 'chung_tu_quan_su.pdf', status: 'Chờ phê duyệt' },
  { mssv: '2001200124', name: 'Trần Thị Thu Thủy', class: '14ĐHTP01', amount: 1500000, reason: 'Sức khỏe không đảm bảo (có giấy chứng nhận y tế)', fileUrl: 'giay_vien_viet_duc.pdf', status: 'Đã hoàn phí', processedDate: '2026-10-15' },
  { mssv: '2001200125', name: 'Phạm Hữu Đạt', class: '14ĐHTP02', amount: 1500000, reason: 'Tự ý hủy chuyến không có lý do chính đáng', fileUrl: 'don_xin_huy.pdf', status: 'Từ chối', processedDate: '2026-10-14' },
  { mssv: '2001200127', name: 'Đặng Minh Khang', class: '14ĐHTP03', amount: 1500000, reason: 'Điện thoại hỏng không cập nhật được lịch', fileUrl: 'don_loi_cap_nhat.pdf', status: 'Chờ phê duyệt' }
];

export default function DuyetHoanPhi_Khoa() {
  const [refundRecords, setRefundRecords] = useState(initialRefundRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleApprove = (mssv) => {
    if (confirm("Xác nhận phê duyệt hoàn tiền lệ phí cho sinh viên này?")) {
      setRefundRecords(prev => prev.map(rec => 
        rec.mssv === mssv ? { ...rec, status: 'Đã hoàn phí', processedDate: new Date().toISOString().split('T')[0] } : rec
      ));
      alert('Đã phê duyệt hoàn phí thành công!');
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionTarget) return;
    setRefundRecords(prev => prev.map(rec => 
      rec.mssv === rejectionTarget.mssv 
        ? { ...rec, status: 'Từ chối', processedDate: new Date().toISOString().split('T')[0], reason: `${rec.reason} (Từ chối: ${rejectionReason})` } 
        : rec
    ));
    setRejectionTarget(null);
    setRejectionReason('');
    alert('Đã từ chối đơn yêu cầu hoàn phí.');
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Đã hoàn phí') return 'bg-[#89B449] text-white'; // Secondary green
    if (status === 'Chờ phê duyệt') return 'bg-[#DBD468] text-slate-800'; // Warning yellow
    if (status === 'Từ chối') return 'bg-[#E68A8C] text-white'; // Danger coral
    return 'bg-slate-105 text-slate-600';
  };

  const filteredRecords = refundRecords.filter(rec => {
    const matchesSearch = rec.name.toLowerCase().includes(searchTerm.toLowerCase()) || rec.mssv.includes(searchTerm);
    const matchesStatus = statusFilter === 'Tất cả' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Duyệt hoàn phí
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Tiếp nhận và xét duyệt minh chứng xin hoàn trả lệ phí kiến tập của sinh viên nghỉ học có lý do.
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-[#E7E0C4] p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Lịch kiến tập */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Lịch kiến tập
            </label>
            <select
              value={scheduleFilter}
              onChange={e => setScheduleFilter(e.target.value)}
              className="w-full bg-[#E7E0C4]/10 border border-[#E7E0C4] rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold hover:bg-[#E7E0C4]/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            >
              <option value="Tất cả">Tất cả lịch kiến tập</option>
              <option value="Lịch kiến tập HK1 2026-2027">Lịch kiến tập HK1 2026-2027</option>
            </select>
          </div>

          {/* Trạng thái phê duyệt */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Trạng thái phê duyệt
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-[#E7E0C4]/10 border border-[#E7E0C4] rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold hover:bg-[#E7E0C4]/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option value="Chờ phê duyệt">Chờ phê duyệt</option>
              <option value="Đã hoàn phí">Đã hoàn phí</option>
              <option value="Từ chối">Từ chối</option>
            </select>
          </div>

          {/* Tìm sinh viên */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Tìm sinh viên
            </label>
            <div className="relative flex items-center bg-[#E7E0C4]/10 rounded-xl border border-[#E7E0C4] focus-within:ring-2 focus-within:ring-[#407F3E]/20 transition-all">
              <Search className="absolute left-4 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm sinh viên..."
                className="w-full bg-transparent text-sm text-slate-800 pl-11 pr-4 py-2.5 outline-none placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-[#E7E0C4]">
              <tr>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">MSSV</th>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Họ tên</th>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Lớp</th>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Số tiền hoàn</th>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Lý do hủy chuyến</th>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Chứng từ</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0C4]/40 text-slate-800 font-medium">
              {filteredRecords.map((rec) => (
                <tr key={rec.mssv} className="hover:bg-[#E7E0C4]/10 transition-colors duration-200">
                  <td className="px-6 py-4 font-bold font-mono text-[#407F3E] border-r border-[#E7E0C4]/40">{rec.mssv}</td>
                  <td className="px-6 py-4 font-bold text-slate-700 border-r border-[#E7E0C4]/40">{rec.name}</td>
                  <td className="px-6 py-4 text-slate-500 border-r border-[#E7E0C4]/40">{rec.class}</td>
                  <td className="px-6 py-4 font-bold font-mono text-slate-700 border-r border-[#E7E0C4]/40">{formatCurrency(rec.amount)}</td>
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-[200px] truncate border-r border-[#E7E0C4]/40" title={rec.reason}>
                    {rec.reason}
                  </td>
                  <td className="px-6 py-4 border-r border-[#E7E0C4]/40">
                    <button 
                      onClick={() => {
                        if (rec.fileUrl && (rec.fileUrl.startsWith('http') || rec.fileUrl.startsWith('/') || rec.fileUrl.startsWith('blob:'))) {
                          const url = rec.fileUrl.startsWith('http') || rec.fileUrl.startsWith('/') 
                            ? rec.fileUrl 
                            : `/api/upload/file/payments/${rec.fileUrl}`;
                          window.open(url, '_blank');
                        } else {
                          const blob = new Blob(['Mock PDF proof document content'], { type: 'application/pdf' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = rec.fileUrl || 'minhchinh.pdf';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs text-[#407F3E] hover:underline font-bold"
                    >
                      <FileText size={14} />
                      <span>Xem chứng từ</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${getStatusBadgeClass(rec.status)}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {rec.status === 'Chờ phê duyệt' ? (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleApprove(rec.mssv)}
                          className="p-1.5 text-[#89B449] hover:bg-[#89B449]/10 rounded-xl transition-all cursor-pointer"
                          title="Duyệt hoàn phí"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setRejectionTarget(rec)}
                          className="p-1.5 text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-xl transition-all cursor-pointer"
                          title="Từ chối"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {rec.processedDate ? `Đã xử lý: ${rec.processedDate}` : 'Đã duyệt'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-bold text-sm">
                    Không có hồ sơ hoàn phí nào khớp bộ lọc!
                  </td>
                </tr>
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
              <h3 className="font-bold text-slate-805 text-base uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-[#E68A8C]" />
                <span>Từ chối hoàn phí</span>
              </h3>
              <button 
                onClick={() => setRejectionTarget(null)} 
                className="text-slate-450 hover:text-slate-700 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 font-semibold text-sm">
              <p className="text-xs text-slate-500">
                Sinh viên: <span className="font-bold text-slate-800">{rejectionTarget.name} ({rejectionTarget.mssv})</span>
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
                  className="px-5 py-2.5 border border-[#E7E0C4] rounded-xl text-slate-650 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#E68A8C] hover:bg-red-650 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
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
