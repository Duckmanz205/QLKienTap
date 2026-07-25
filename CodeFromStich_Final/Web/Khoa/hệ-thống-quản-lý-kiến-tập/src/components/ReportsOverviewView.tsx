import React from 'react';
import { 
  FileSpreadsheet, 
  BarChart3, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Download,
  Calendar,
  Layers
} from 'lucide-react';

interface ReportsOverviewViewProps {
  setView: (view: string) => void;
}

export default function ReportsOverviewView({ setView }: ReportsOverviewViewProps) {
  const availableReports = [
    {
      id: 'REP-01',
      title: 'Tổng hợp dữ liệu tham quan thực tế',
      desc: 'Báo cáo tổng hợp số lượng đăng ký và tham quan thực tế của sinh viên tại các nhà máy.',
      icon: <BarChart3 className="w-6 h-6 text-[#407F3E]" />,
      actionLabel: 'Xem biểu đồ & chi tiết',
      actionView: 'tong-hop-tham-quan',
      isExcelReady: true
    },
    {
      id: 'REP-02',
      title: 'Danh sách SV đã tham quan đủ chuẩn',
      desc: 'Roster chi tiết toàn bộ sinh viên đã tham quan tối thiểu 2 nhà máy và hợp lệ nộp báo cáo.',
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      actionLabel: 'Tải Excel (.xlsx)',
      isExcelReady: true
    },
    {
      id: 'REP-03',
      title: 'Danh sách SV chưa tham quan thực tế',
      desc: 'Roster cảnh cáo sinh viên chưa đăng ký hoặc chưa đi tham quan bất kỳ nhà máy nào.',
      icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
      actionLabel: 'Tải Excel (.xlsx)',
      isExcelReady: true
    },
    {
      id: 'REP-04',
      title: 'Danh sách SV đủ điều kiện thành lập HĐ',
      desc: 'Tổng hợp sinh viên hoàn thành toàn bộ chuyên đề thực tế và sẵn sàng chuyển lên hội đồng bảo vệ.',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      actionLabel: 'Tải Excel (.xlsx)',
      isExcelReady: true
    },
    {
      id: 'REP-05',
      title: 'Báo cáo kiểm toán lệ phí & hoàn phí',
      desc: 'Thống kê tổng hợp số tiền thu thực tế, các yêu cầu hoàn phí đã thanh toán và dư nợ lệ phí.',
      icon: <Layers className="w-6 h-6 text-red-600" />,
      actionLabel: 'Tải Excel (.xlsx)',
      isExcelReady: true
    }
  ];

  const handleAction = (report: typeof availableReports[0]) => {
    if (report.actionView) {
      setView(report.actionView);
    } else {
      alert(`Bắt đầu kết xuất trực tiếp tệp Excel cấu trúc báo cáo: "${report.title}" thành công!`);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Title section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-primary-container tracking-tight">
          Báo cáo thống kê chuyên đề
        </h1>
        <p className="text-sm text-slate-500">
          Xuất dữ liệu báo cáo và phân tích kết quả đợt kiến tập thực tế phục vụ kiểm định chất lượng đào tạo.
        </p>
      </div>

      {/* Grid structure of template reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableReports.map((rep) => (
          <div 
            key={rep.id} 
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#407F3E]/20 transition-all p-6 flex flex-col justify-between group"
          >
            <div>
              {/* Top icon and header */}
              <div className="flex items-center justify-between">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-[#407F3E]/5 transition-colors">
                  {rep.icon}
                </div>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{rep.id}</span>
              </div>
              
              <h3 className="font-extrabold text-slate-800 text-base mt-4 leading-snug group-hover:text-primary-container transition-colors">
                {rep.title}
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed">
                {rep.desc}
              </p>
            </div>

            {/* Bottom buttons */}
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleAction(rep)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  rep.actionView 
                    ? 'text-primary-container hover:text-[#346732]' 
                    : 'text-slate-600 hover:text-primary-container'
                }`}
              >
                <span>{rep.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>

              {rep.isExcelReady && (
                <button 
                  onClick={() => alert(`Tải xuống mẫu Excel thô cho biểu mẫu ${rep.id}...`)}
                  className="p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg text-slate-400 hover:text-[#407F3E] transition-all cursor-pointer"
                  title="Xuất file mẫu nhanh"
                >
                  <FileSpreadsheet className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Summary Notice */}
      <div className="bg-[#E7E0C4]/60 border border-slate-200 p-5 rounded-2xl flex items-start gap-4">
        <Calendar className="w-6 h-6 text-primary-container mt-0.5 shrink-0" />
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Chu kỳ kiểm tra số liệu báo cáo</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
            Mọi tệp Excel kết xuất từ hệ thống đều tuân thủ chuẩn ISO của Đại học về định dạng kiểm định. Số liệu được làm mới tự động cứ sau mỗi 10 phút hoặc lập tức khi Giảng viên / Quản lý khoa ấn nút Khóa điểm số học phần.
          </p>
        </div>
      </div>
    </div>
  );
}
