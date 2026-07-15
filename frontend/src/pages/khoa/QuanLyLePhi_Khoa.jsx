import React, { useState } from 'react';
import { CreditCard, Search, Upload, Download, Check, Info, DollarSign, Clock, AlertTriangle, X } from 'lucide-react';

const initialFeeRecords = [
  { mssv: '2001200123', name: 'Nguyễn Văn Nam', class: '14ĐHTP01', amount: 1500000, payDate: '2026-10-12', payMethod: 'Chuyển khoản', status: 'Đã nộp' },
  { mssv: '2001200124', name: 'Trần Thị Thu Thủy', class: '14ĐHTP01', amount: 1500000, payDate: '-', payMethod: '-', status: 'Chưa nộp' },
  { mssv: '2001200125', name: 'Phạm Hữu Đạt', class: '14ĐHTP02', amount: 1500000, payDate: '2026-10-20', payMethod: 'Tiền mặt', status: 'Vi phạm' },
  { mssv: '2001200126', name: 'Lê Hoài Bảo', class: '14ĐHTP02', amount: 1500000, payDate: '2026-10-14', payMethod: 'Chuyển khoản', status: 'Đã nộp' },
  { mssv: '2001200127', name: 'Đặng Minh Khang', class: '14ĐHTP03', amount: 1500000, payDate: '-', payMethod: '-', status: 'Hủy chuyến - Chờ hoàn phí' },
  { mssv: '2001200128', name: 'Vũ Thị Minh Ngọc', class: '14ĐHTP03', amount: 1500000, payDate: '-', payMethod: '-', status: 'Chưa nộp' }
];

export default function QuanLyLePhi_Khoa() {
  const [feeRecords, setFeeRecords] = useState(initialFeeRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [confirmingRecord, setConfirmingRecord] = useState(null);
  const [confirmMethod, setConfirmMethod] = useState('Chuyển khoản');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Đã nộp') return 'bg-[#89B449] text-white'; // Secondary green
    if (status === 'Chưa nộp') return 'bg-[#DBD468] text-slate-800'; // Warning yellow
    if (status === 'Hủy chuyến - Chờ hoàn phí') return 'bg-[#E68A8C] text-white'; // Danger coral
    if (status === 'Vi phạm') return 'bg-[#E68A8C] text-white'; // Danger coral
    return 'bg-slate-100 text-slate-600';
  };

  const filteredRecords = feeRecords.filter(rec => {
    const matchesSearch = rec.name.toLowerCase().includes(searchTerm.toLowerCase()) || rec.mssv.includes(searchTerm);
    const matchesStatus = statusFilter === 'Tất cả' || 
      (statusFilter === 'Đã nộp' && rec.status === 'Đã nộp') ||
      (statusFilter === 'Chưa nộp' && rec.status === 'Chưa nộp') ||
      (statusFilter === 'Hủy chuyến - Chờ hoàn phí' && rec.status === 'Hủy chuyến - Chờ hoàn phí') ||
      (statusFilter === 'Vi phạm/Trễ hạn' && rec.status === 'Vi phạm');
    return matchesSearch && matchesStatus;
  });

  const handleConfirmPaymentSubmit = (e) => {
    e.preventDefault();
    if (!confirmingRecord) return;
    setFeeRecords(prev => prev.map(rec => {
      if (rec.mssv === confirmingRecord.mssv) {
        return {
          ...rec,
          status: 'Đã nộp',
          payDate: new Date().toISOString().split('T')[0],
          payMethod: confirmMethod
        };
      }
      return rec;
    }));
    setConfirmingRecord(null);
    alert(`Đã xác nhận đóng lệ phí cho sinh viên ${confirmingRecord.name} thành công.`);
  };

  const handleExcelUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .csv';
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        alert(`Đã nhận file ${e.target.files[0].name}. Tiến hành đối soát giao dịch nộp lệ phí kiến tập.`);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Title & Top-Right Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý lệ phí
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi, nhập tệp đối soát ngân hàng và xác nhận thu lệ phí tham quan của sinh viên.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleExcelUploadClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#407F3E] hover:bg-[#407F3E]/95 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Nhập Excel đối soát</span>
          </button>
          <button
            onClick={() => alert("Xuất báo cáo danh sách thu chi lệ phí kiến tập.")}
            className="flex items-center gap-2 px-4 py-2 border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm bg-white"
          >
            <Download className="w-4 h-4" />
            <span>Kết xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Tổng dự kiến */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng thu dự kiến</span>
            <div className="p-2 bg-slate-50 text-slate-650 rounded-lg"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 font-mono">{formatCurrency(feeRecords.length * 1500000)}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">{feeRecords.length} sinh viên đăng ký</p>
          </div>
        </div>

        {/* Card 2: Đã thu */}
        <div className="bg-[#407F3E]/5 border border-[#407F3E]/20 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#407F3E] uppercase tracking-wider">Lệ phí đã thu</span>
            <div className="p-2 bg-[#407F3E]/10 text-[#407F3E] rounded-lg"><Check className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-[#407F3E] font-mono">
              {formatCurrency(feeRecords.filter(r => r.status === 'Đã nộp').length * 1500000)}
            </h3>
            <p className="text-xs text-[#407F3E] font-bold mt-1">
              {feeRecords.filter(r => r.status === 'Đã nộp').length} SV đã đóng đúng hạn
            </p>
          </div>
        </div>

        {/* Card 3: Chưa nộp */}
        <div className="bg-[#DBD468]/5 border border-[#DBD468]/20 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Chưa đóng</span>
            <div className="p-2 bg-[#DBD468]/10 text-amber-600 rounded-lg"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-amber-800 font-mono">
              {formatCurrency(feeRecords.filter(r => r.status === 'Chưa nộp').length * 1500000)}
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-1">
              {feeRecords.filter(r => r.status === 'Chưa nộp').length} sinh viên chờ xác nhận
            </p>
          </div>
        </div>

        {/* Card 4: Chờ hoàn / Vi phạm */}
        <div className="bg-[#E68A8C]/5 border border-[#E68A8C]/20 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-red-650 uppercase tracking-wider">Chờ hoàn / Vi phạm</span>
            <div className="p-2 bg-[#E68A8C]/10 text-red-500 rounded-lg"><AlertTriangle className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-red-650 font-mono">
              {formatCurrency(feeRecords.filter(r => r.status === 'Hủy chuyến - Chờ hoàn phí' || r.status === 'Vi phạm').length * 1500000)}
            </h3>
            <p className="text-xs text-slate-550 font-bold mt-1">
              {feeRecords.filter(r => r.status === 'Hủy chuyến - Chờ hoàn phí' || r.status === 'Vi phạm').length} sinh viên vi phạm / hủy chuyến
            </p>
          </div>
        </div>
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

          {/* Trạng thái nộp */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Trạng thái nộp
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-[#E7E0C4]/10 border border-[#E7E0C4] rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold hover:bg-[#E7E0C4]/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option value="Đã nộp">Đã nộp</option>
              <option value="Chưa nộp">Chưa nộp</option>
              <option value="Hủy chuyến - Chờ hoàn phí">Hủy chuyến - Chờ hoàn phí</option>
              <option value="Vi phạm/Trễ hạn">Vi phạm/Trễ hạn</option>
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
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Số tiền nộp</th>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Ngày nộp</th>
                <th className="px-6 py-4 font-bold border-r border-[#E7E0C4]/40">Hình thức</th>
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
                  <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500 border-r border-[#E7E0C4]/40">{rec.payDate}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500 border-r border-[#E7E0C4]/40">{rec.payMethod}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${getStatusBadgeClass(rec.status)}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* Confirm payment */}
                      {rec.status !== 'Đã nộp' && rec.status !== 'Hủy chuyến - Chờ hoàn phí' && (
                        <button
                          onClick={() => setConfirmingRecord(rec)}
                          className="p-1.5 text-[#89B449] hover:bg-[#89B449]/10 rounded-xl transition-all cursor-pointer"
                          title="Xác nhận nộp"
                        >
                          <Check className="w-5 h-5 font-black" />
                        </button>
                      )}
                      {/* Details */}
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                        title="Chi tiết"
                      >
                        <Info className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record detail dialog */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#E7E0C4] bg-[#E7E0C4]/30 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-850 text-base uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-5 h-5 text-[#407F3E]" />
                <span>Chi tiết lệ phí sinh viên</span>
              </h3>
              <button 
                onClick={() => setSelectedRecord(null)} 
                className="text-slate-450 hover:text-slate-700 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm font-semibold text-slate-650">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Sinh viên:</span>
                <span className="font-bold text-slate-800">{selectedRecord.name} ({selectedRecord.mssv})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Lớp hành chính:</span>
                <span className="text-slate-800">{selectedRecord.class}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Lệ phí phải nộp:</span>
                <span className="font-bold text-[#407F3E] font-mono">{formatCurrency(selectedRecord.amount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Ngày nộp tiền:</span>
                <span className="font-mono text-slate-800">{selectedRecord.payDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Hình thức nộp:</span>
                <span className="text-slate-800">{selectedRecord.payMethod}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Trạng thái:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeClass(selectedRecord.status)}`}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-[#E7E0C4] flex justify-end">
              <button 
                onClick={() => setSelectedRecord(null)} 
                className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash/Wire Confirm Modal */}
      {confirmingRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#E7E0C4] bg-white flex items-center justify-between">
              <h3 className="font-bold text-slate-805 text-base uppercase tracking-wider flex items-center gap-1.5">
                <span>Xác nhận nộp lệ phí</span>
              </h3>
              <button 
                onClick={() => setConfirmingRecord(null)} 
                className="text-slate-450 hover:text-slate-750 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleConfirmPaymentSubmit} className="p-6 space-y-4 font-semibold text-sm">
              <p className="text-slate-600 leading-relaxed">
                Bạn đang thực hiện xác nhận đóng tiền học phần kiến tập cho sinh viên <strong className="text-slate-800">{confirmingRecord.name} ({confirmingRecord.mssv})</strong>.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Hình thức thanh toán
                </label>
                <select
                  value={confirmMethod}
                  onChange={e => setConfirmMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E7E0C4] bg-slate-50 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                  <option value="Tiền mặt">Tiền mặt tại văn phòng khoa</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E7E0C4]">
                <button 
                  type="button" 
                  onClick={() => setConfirmingRecord(null)} 
                  className="px-5 py-2.5 border border-[#E7E0C4] rounded-xl text-slate-650 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/95 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Xác nhận đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
