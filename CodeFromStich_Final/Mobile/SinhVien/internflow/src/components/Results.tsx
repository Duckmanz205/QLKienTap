import React, { useState } from 'react';
import { Trip, Payment, RefundRequest } from '../types';
import { FileText, Award, CreditCard, Receipt, FileUp, PlusCircle, CheckCircle, AlertOctagon, HelpCircle, ArrowRight, Check, Copy, Clock } from 'lucide-react';

interface ResultsProps {
  trips: Trip[];
  payments: Payment[];
  refunds: RefundRequest[];
  onPayFee: (id: string) => void;
  onAddRefund: (invoiceName: string, amountText: string) => void;
}

export const Results: React.FC<ResultsProps> = ({
  trips,
  payments,
  refunds,
  onPayFee,
  onAddRefund
}) => {
  const [subTab, setSubTab] = useState<'scores' | 'finance'>('scores');
  const [financeTab, setFinanceTab] = useState<'pay' | 'refund'>('pay');
  
  // Refund form states
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  // Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Payment mock
  const [payingId, setPayingId] = useState<string | null>(null);
  const handlePayFee = (id: string, amount: number) => {
    const confirmPay = window.confirm(`Bạn có muốn thanh toán lệ phí ${amount.toLocaleString('vi-VN')}đ cho hóa đơn này không?`);
    if (confirmPay) {
      setPayingId(id);
      setTimeout(() => {
        onPayFee(id);
        setPayingId(null);
        alert('Thanh toán thành công qua cổng liên kết ngân hàng nhà trường!');
      }, 1000);
    }
  };

  // Handle refund request submission
  const handleSendRefund = () => {
    if (!selectedInvoice) {
      alert('Vui lòng chọn hóa đơn cần hoàn tiền.');
      return;
    }
    if (!uploadedFile) {
      alert('Vui lòng tải lên file đơn được BCN khoa duyệt.');
      return;
    }

    setIsSubmittingRefund(true);
    setTimeout(() => {
      const invoiceLabel = selectedInvoice === '1' ? 'HĐ: KCN Tân Bình' : 'HĐ: Khác';
      const amountText = selectedInvoice === '1' ? '30.000đ' : '50.000đ';
      onAddRefund(invoiceLabel, amountText);
      setIsSubmittingRefund(false);
      setSelectedInvoice('');
      setUploadedFile(null);
      alert('Gửi yêu cầu hoàn phí thành công! Khoa sẽ xử lý trong vòng 5-7 ngày làm việc.');
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-6">
      {/* Upper-level Main Tab switches */}
      <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner">
        <button 
          onClick={() => setSubTab('scores')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'scores'
              ? 'bg-white text-[#266528] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award size={14} />
          <span>Kết quả học tập</span>
        </button>
        <button 
          onClick={() => setSubTab('finance')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'finance'
              ? 'bg-white text-[#266528] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard size={14} />
          <span>Kinh phí chuyến đi</span>
        </button>
      </div>

      {/* VIEW A: SCORE MODULE (Screen B) */}
      {subTab === 'scores' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* SUMMARY SCORE CARD */}
          <section className="bg-[#407f3e] rounded-2xl p-6 text-white flex flex-col items-center justify-center shadow-md relative overflow-hidden">
            {/* Dotted background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            
            <div className="relative z-10 text-center">
              <p className="text-[#e5ffdc]/85 text-xs font-semibold uppercase tracking-wider mb-1.5">Điểm tổng kết học phần</p>
              <h2 className="text-5xl font-extrabold mb-3 tracking-tight">8.4</h2>
              <span className="inline-flex items-center px-4 py-1.5 bg-[#c3f17e] text-[#105217] rounded-full font-bold text-xs shadow-xs">
                Đạt
              </span>
            </div>
          </section>

          {/* TRIP RESULTS DETAIL LIST */}
          <section className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-sm px-1">Chi tiết điểm chuyến đi</h3>

            {/* Trip 1: Vinamilk (With grades) */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-4.5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm">Nhà máy Vinamilk</h4>
                <span className="p-1.5 bg-slate-50 text-[#266528] rounded-lg">
                  <Award size={16} />
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Điểm chuẩn bị</span>
                  <span className="font-bold text-slate-800 text-xs">8.5</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Bài thu hoạch</span>
                  <span className="font-bold text-slate-800 text-xs">8.0</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Báo cáo TQNM</span>
                  <span className="font-bold text-slate-800 text-xs">9.0</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Điểm cộng</span>
                  <span className="font-bold text-[#446900] text-xs">+0.5</span>
                </div>
              </div>
              
              <div className="pt-3.5 border-t border-slate-100 flex justify-end items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Điểm chuyến:</span>
                <span className="text-lg text-[#266528] font-black">8.7</span>
              </div>
            </div>

            {/* Trip 2: Acecook (Pending) */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-4.5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-bold text-slate-800 text-sm">Công ty Acecook</h4>
                  <span className="inline-flex items-center px-2 py-0.5 bg-[#DBD468]/25 text-slate-800 rounded-full text-[9px] font-bold w-fit">
                    Đang chờ khóa điểm
                  </span>
                </div>
                <span className="p-1.5 bg-slate-50 text-slate-400 rounded-lg">
                  <HelpCircle size={16} />
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 opacity-60">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Điểm chuẩn bị</span>
                  <span className="font-bold text-slate-800 text-xs">9.0</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Bài thu hoạch</span>
                  <span className="font-bold text-slate-800 text-xs">--</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Báo cáo TQNM</span>
                  <span className="font-bold text-slate-800 text-xs">--</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Điểm cộng</span>
                  <span className="font-bold text-[#446900] text-xs">--</span>
                </div>
              </div>
              
              <div className="pt-3.5 border-t border-slate-100 flex justify-end items-center gap-2 opacity-60">
                <span className="text-xs text-slate-500 font-semibold">Điểm chuyến:</span>
                <span className="text-lg text-slate-500 font-black">--</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* VIEW B: FINANCE MODULE (Screen D) */}
      {subTab === 'finance' && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          {/* Segmented control for Finance */}
          <div className="flex p-1 bg-[#ecefe6] rounded-xl">
            <button 
              onClick={() => setFinanceTab('pay')}
              className={`flex-1 py-1.5 text-center rounded-lg font-bold text-xs transition-all ${
                financeTab === 'pay'
                  ? 'bg-[#266528] text-white shadow-xs'
                  : 'text-[#41493e] hover:bg-slate-200/50'
              }`}
            >
              Thanh toán
            </button>
            <button 
              onClick={() => setFinanceTab('refund')}
              className={`flex-1 py-1.5 text-center rounded-lg font-bold text-xs transition-all ${
                financeTab === 'refund'
                  ? 'bg-[#266528] text-white shadow-xs'
                  : 'text-[#41493e] hover:bg-slate-200/50'
              }`}
            >
              Hoàn phí
            </button>
          </div>

          {/* TAB: PAYMENTS */}
          {financeTab === 'pay' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {payments.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-xs p-5 flex flex-col gap-3 border border-slate-200/80">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{p.name}</h3>
                      <button 
                        onClick={() => handleCopyCode(p.code, p.id)}
                        className="flex items-center gap-1.5 bg-[#f2f5ec] px-2.5 py-1 rounded-lg w-fit text-left active:bg-emerald-100 transition-colors"
                      >
                        <span className="text-[10px] font-bold text-slate-600 leading-none">{p.code}</span>
                        {copiedId === p.id ? (
                          <Check size={11} className="text-emerald-600" />
                        ) : (
                          <Copy size={11} className="text-slate-400" />
                        )}
                      </button>
                    </div>
                    <span className="font-extrabold text-base text-[#266528] shrink-0">
                      {p.amount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Clock size={14} />
                      <span>Hạn đóng: {p.dueDate}</span>
                    </div>
                    
                    {p.status === 'Chưa đóng' && (
                      <button
                        onClick={() => handlePayFee(p.id, p.amount)}
                        disabled={payingId === p.id}
                        className="px-3.5 py-1.5 rounded-full bg-[#DBD468] hover:bg-[#c2bc5a] text-slate-800 font-bold text-[10px] shadow-xs active:scale-95 transition-all"
                      >
                        {payingId === p.id ? '...' : 'Chưa đóng'}
                      </button>
                    )}
                    {p.status === 'Đã đóng đúng hạn' && (
                      <span className="px-3.5 py-1 bg-[#a8d565]/35 text-[#324f00] rounded-full font-bold text-[10px]">
                        Đã đóng đúng hạn
                      </span>
                    )}
                    {p.status === 'Vi phạm' && (
                      <span className="px-3.5 py-1 bg-[#E68A8C]/35 text-red-800 rounded-full font-bold text-[10px]">
                        Vi phạm
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: REFUND */}
          {financeTab === 'refund' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Form container */}
              <div className="bg-white rounded-2xl shadow-xs p-5 border border-slate-200/80 flex flex-col gap-4">
                <h3 className="font-bold text-slate-800 text-sm">Biểu mẫu yêu cầu</h3>
                
                {/* Select invoice */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn hóa đơn vi phạm</label>
                  <select 
                    value={selectedInvoice}
                    onChange={(e) => setSelectedInvoice(e.target.value)}
                    className="w-full bg-slate-50 outline-none font-medium text-xs text-slate-700 py-3 px-3.5 rounded-xl border border-slate-200 focus:border-[#266528] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Chọn hóa đơn...</option>
                    <option value="1">KCN Tân Bình - 30.000đ</option>
                  </select>
                </div>

                {/* Upload File */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File đơn được BCN khoa duyệt</label>
                  {uploadedFile ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-[#266528]">
                      <span className="text-xs font-semibold text-slate-700 truncate w-[180px]">{uploadedFile}</span>
                      <button onClick={() => setUploadedFile(null)} className="text-red-500 text-xs hover:underline">Hủy</button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setUploadedFile('don_hoan_tien_sv123_approved.pdf')}
                      className="flex flex-col items-center justify-center gap-2 py-7 rounded-xl cursor-pointer bg-[#f8faf1]/50 hover:bg-[#ecefe6] border-2 border-dashed border-slate-200 transition-colors"
                    >
                      <div className="p-2 bg-slate-100 text-[#266528] rounded-full">
                        <FileUp size={18} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 text-center px-4">Nhấn để tải lên file đính kèm (PDF, JPG)</span>
                    </div>
                  )}
                </div>

                {/* Submit request button */}
                <button 
                  onClick={handleSendRefund}
                  disabled={isSubmittingRefund}
                  className="w-full bg-[#266528] hover:bg-[#105217] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1 transition-colors mt-2 active:scale-95 shadow-sm"
                >
                  {isSubmittingRefund ? 'Đang gửi...' : 'Gửi yêu cầu hoàn phí'}
                </button>
              </div>

              {/* History */}
              <div className="flex flex-col gap-3.5">
                <h3 className="font-bold text-slate-800 text-sm px-1">Lịch sử yêu cầu</h3>
                
                {refunds.map((ref) => (
                  <div key={ref.id} className="bg-white rounded-2xl shadow-xs p-5 flex flex-col gap-2 border border-slate-200/80">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-800 text-xs">{ref.invoiceName}</span>
                        <span className="text-[10px] text-slate-500">{ref.dateText} • {ref.amountText}</span>
                      </div>
                      
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                        ref.status === 'Chờ xử lý'
                          ? 'bg-[#DBD468]/30 text-slate-800'
                          : 'bg-[#a8d565]/40 text-[#324f00]'
                      }`}>
                        {ref.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
