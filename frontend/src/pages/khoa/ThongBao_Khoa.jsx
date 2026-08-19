import React, { useState } from 'react';
import { 
  Plus, X, ChevronRight, Bold, Italic, List, 
  ChevronDown, Check, UploadCloud, FileText,
  MessageSquare
} from 'lucide-react';

export default function ThongBao_Khoa() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDoiTuongDropdownOpen, setIsDoiTuongDropdownOpen] = useState(false);
  const [selectedDoiTuong, setSelectedDoiTuong] = useState('');
  
  const doiTuongOptions = ["Tất cả", "14ĐHTP", "13ĐHTP", "12ĐHTP"];

  // Mock Data
  const notifications = [
    { 
      id: 1, 
      tieuDe: 'Nhắc nhở hoàn thành lệ phí kiến tập trước hạn chót', 
      doiTuong: '14ĐHTP', 
      ngayGui: '28/08/2026', 
      daDoc: 120, 
      tong: 150 
    },
    { 
      id: 2, 
      tieuDe: 'Thông báo về việc chuẩn bị thẻ sinh viên khi tham quan nhà máy', 
      doiTuong: 'Tất cả', 
      ngayGui: '26/08/2026', 
      daDoc: 450, 
      tong: 500 
    },
    { 
      id: 3, 
      tieuDe: 'Quyết định thành lập hội đồng bảo vệ báo cáo kiến tập đợt 1', 
      doiTuong: '13ĐHTP', 
      ngayGui: '20/08/2026', 
      daDoc: 60, 
      tong: 60 
    },
    { 
      id: 4, 
      tieuDe: 'Hướng dẫn viết báo cáo thu hoạch kiến tập doanh nghiệp', 
      doiTuong: 'Tất cả', 
      ngayGui: '15/08/2026', 
      daDoc: 412, 
      tong: 500 
    },
  ];

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Thông báo</h1>
        <button 
          onClick={() => { setIsModalOpen(true); setIsDoiTuongDropdownOpen(true); }} // Open dropdown for mockup
          className="px-5 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Soạn thông báo
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 max-w-[400px]">Tiêu đề</th>
                <th className="p-4 text-center">Đối tượng nhận</th>
                <th className="p-4 text-center">Ngày gửi</th>
                <th className="p-4 text-right pr-6 w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {notifications.map(n => {
                return (
                  <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 max-w-[400px]">
                      <div className="font-bold text-slate-800 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-[#407F3E] mt-0.5 shrink-0" />
                        <span className="line-clamp-2 leading-relaxed">{n.tieuDe}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded text-[11px] font-bold border ${
                        n.doiTuong === 'Tất cả' ? 'bg-[#89B449]/10 text-[#407F3E] border-[#89B449]/20' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {n.doiTuong}
                      </span>
                    </td>
                    <td className="p-4 text-center font-medium text-slate-600">{n.ngayGui}</td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                        title="Xem chi tiết"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mockup - "+ Soạn thông báo" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dimmed Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div 
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#407F3E]" />
                Soạn thông báo
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar" onClick={() => setIsDoiTuongDropdownOpen(false)}>
              
              {/* Tiêu đề & Đối tượng */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-30">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tiêu đề</label>
                  <input
                    type="text"
                    placeholder="Nhập tiêu đề thông báo..."
                    className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Đối tượng nhận</label>
                  <div 
                    onClick={(e) => { e.stopPropagation(); setIsDoiTuongDropdownOpen(!isDoiTuongDropdownOpen); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all hover:border-[#407F3E]"
                  >
                    <span className="text-slate-400 font-medium truncate pr-2">Chọn đối tượng</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                  {isDoiTuongDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
                      {doiTuongOptions.map(opt => (
                        <div 
                          key={opt}
                          className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Nội dung */}
              <div className="relative z-20">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nội dung</label>
                <div className="border border-[#E7E0C4] rounded-xl overflow-hidden bg-slate-50 focus-within:border-[#407F3E] focus-within:ring-1 focus-within:ring-[#407F3E] transition-all">
                  {/* Toolbar */}
                  <div className="bg-white border-b border-[#E7E0C4] p-1.5 flex items-center gap-1">
                    <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><Bold className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><Italic className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><List className="w-4 h-4" /></button>
                  </div>
                  {/* Editor */}
                  <textarea 
                    rows={6}
                    placeholder="Nhập nội dung chi tiết..."
                    className="w-full p-4 bg-transparent text-sm focus:outline-none text-slate-800 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Tệp đính kèm */}
              <div className="relative z-10">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tệp đính kèm (tùy chọn)</label>
                <div className="border-2 border-dashed border-[#E7E0C4] hover:border-[#89B449] bg-white rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#89B449]/10 transition-colors">
                    <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#89B449]" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">Kéo thả file vào đây hoặc nhấn để chọn</p>
                  <p className="text-xs font-medium text-slate-400">Hỗ trợ định dạng: PDF, DOCX, XLSX (Tối đa 10MB)</p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end rounded-b-2xl z-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
