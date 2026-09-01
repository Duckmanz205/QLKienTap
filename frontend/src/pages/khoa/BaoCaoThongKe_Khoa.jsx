import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, Check, Eye, Download, 
  BarChart2, Users, UserX, CheckCircle, XOctagon, FileCheck, X
} from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function BaoCaoThongKe_Khoa() {
  // Dropdown States for Filters
  const [isNamHocDropdownOpen, setIsNamHocDropdownOpen] = useState(false);
  const [selectedNamHoc, setSelectedNamHoc] = useState('');
  const namHocOptions = ["2025-2026", "2024-2025", "2023-2024"];

  const [isKhoaDropdownOpen, setIsKhoaDropdownOpen] = useState(false);
  const [selectedKhoa, setSelectedKhoa] = useState('');
  const khoaOptions = ["Khóa 14", "Khóa 13", "Khóa 12"];

  const [isLichDropdownOpen, setIsLichDropdownOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState('');
  const [schedules, setSchedules] = useState([]);

  // View modal state
  const [viewingReportData, setViewingReportData] = useState(null);
  const [viewingReportTitle, setViewingReportTitle] = useState('');
  const [viewingReportType, setViewingReportType] = useState(''); // 'retake' | 'final' | 'students'

  const navigate = useNavigate();

  useEffect(() => {
    khoaApi.getSchedules().then(res => setSchedules(res.data || [])).catch(console.error);
  }, []);

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsNamHocDropdownOpen(false);
    setIsKhoaDropdownOpen(false);
    setIsLichDropdownOpen(false);
  };

  const handleDropdownClick = (e, setter) => {
    e.stopPropagation();
    closeAllDropdowns();
    setter(true);
  };

  // Mock Report Types
  const reports = [
    {
      id: 1,
      name: 'Tổng hợp dữ liệu tham quan',
      desc: 'Báo cáo tổng quan về số lượng chuyến đi, số sinh viên tham gia và thống kê theo từng doanh nghiệp liên kết.',
      icon: <BarChart2 className="w-6 h-6 text-[#407F3E]" />,
      bgIcon: 'bg-[#407F3E]/10'
    },
    {
      id: 2,
      name: 'Danh sách SV đã tham quan',
      desc: 'Danh sách chi tiết các sinh viên đã hoàn thành tối thiểu 1 chuyến tham quan thực tế tại doanh nghiệp.',
      icon: <Users className="w-6 h-6 text-[#89B449]" />,
      bgIcon: 'bg-[#89B449]/10'
    },
    {
      id: 3,
      name: 'Danh sách SV chưa tham quan',
      desc: 'Danh sách các sinh viên đăng ký môn học nhưng chưa tham gia hoặc vắng mặt trong các chuyến đi.',
      icon: <UserX className="w-6 h-6 text-[#DBD468]" />,
      bgIcon: 'bg-[#DBD468]/15'
    },
    {
      id: 4,
      name: 'Danh sách SV đủ điều kiện báo cáo',
      desc: 'Sinh viên đã đáp ứng đủ các tiêu chí: đóng phí đầy đủ và tham gia ít nhất 1 chuyến tham quan để làm báo cáo.',
      icon: <CheckCircle className="w-6 h-6 text-teal-600" />,
      bgIcon: 'bg-teal-50'
    },
    {
      id: 5,
      name: 'Danh sách SV không thực hiện',
      desc: 'Những sinh viên vi phạm quy chế hoặc bị cấm thi, không đủ điều kiện làm báo cáo thu hoạch cuối kỳ (Sinh viên học lại).',
      icon: <XOctagon className="w-6 h-6 text-[#E68A8C]" />,
      bgIcon: 'bg-[#E68A8C]/10'
    },
    {
      id: 6,
      name: 'Danh sách SV đạt/không đạt',
      desc: 'Bảng điểm tổng kết cuối cùng, hiển thị rõ trạng thái Đạt hoặc Không Đạt của từng sinh viên.',
      icon: <FileCheck className="w-6 h-6 text-indigo-600" />,
      bgIcon: 'bg-indigo-50'
    }
  ];

  const exportToCSV = (data, reportType) => {
    if (!data || data.length === 0) { 
      alert('Không có dữ liệu.'); 
      return; 
    }
    
    let csvContent = '\uFEFF'; // BOM for UTF-8
    
    if (reportType === 'retake') {
      csvContent += 'MSSV,Họ tên,Lớp,Email,Khoa\n';
      data.forEach(s => { 
        csvContent += `"${s.mssv}","${s.ho_ten}","${s.ten_lop || ''}","${s.email || ''}","${s.khoa?.ten_khoa || ''}"\n`; 
      });
    } else if (reportType === 'final') {
      csvContent += 'MSSV,Họ tên,Điểm tổng kết,Kết quả\n';
      data.forEach(r => {
        let lbl = r.ket_qua || 'Đang học';
        if (r.ket_qua === 'Dat') lbl = 'Đạt';
        else if (r.ket_qua === 'KhongDat') lbl = 'Không Đạt';
        
        csvContent += `"${r.lichKienTapSinhVien?.sinhVien?.mssv}","${r.lichKienTapSinhVien?.sinhVien?.ho_ten}","${r.diem_tong_ket !== null ? Number(r.diem_tong_ket).toFixed(2) : 'Chưa chốt'}","${lbl}"\n`; 
      });
    } else if (reportType === 'students') {
      csvContent += 'MSSV,Họ tên,Lớp,Khóa\n';
      data.forEach(s => { 
        csvContent += `"${s.mssv}","${s.ho_ten}","${s.lop || ''}","${s.khoa?.ten_khoa || ''}"\n`; 
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url;
    link.download = `BaoCao_${reportType}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async (reportId) => {
    try {
      if (reportId === 5) {
        // Sinh viên học lại
        const res = await khoaApi.getRetakeReport();
        exportToCSV(res.data || [], 'retake');
      } else if (reportId === 6) {
        if (!selectedLich) {
          alert('Vui lòng chọn lịch kiến tập trước khi xuất báo cáo này!');
          return;
        }
        const res = await khoaApi.getFinalResultsReport(selectedLich);
        exportToCSV(res.data || [], 'final');
      } else if (reportId === 2) {
        if (!selectedLich) { alert('Vui lòng chọn lịch kiến tập trước khi xem/xuất báo cáo này!'); return; }
        const res = await khoaApi.getVisitedStudentsReport({ lichKienTapId: selectedLich });
        exportToCSV(res.data || [], 'students');
      } else if (reportId === 3) {
        if (!selectedLich) { alert('Vui lòng chọn lịch kiến tập trước khi xem/xuất báo cáo này!'); return; }
        const res = await khoaApi.getNotVisitedStudentsReport({ lichKienTapId: selectedLich });
        exportToCSV(res.data || [], 'students');
      } else if (reportId === 4) {
        if (!selectedLich) { alert('Vui lòng chọn lịch kiến tập trước khi xem/xuất báo cáo này!'); return; }
        const res = await khoaApi.getEligibleStudentsReport({ lichKienTapId: selectedLich });
        exportToCSV(res.data || [], 'students');
      } else {
        alert('Tính năng xuất Excel cho báo cáo này đang phát triển!');
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi lấy dữ liệu báo cáo!');
    }
  };

  const handleView = async (reportId) => {
    if (reportId === 1) {
      navigate('/khoa/visit-report');
      return;
    }
    
    try {
      if (reportId === 5) {
        const res = await khoaApi.getRetakeReport();
        setViewingReportData(res.data || []);
        setViewingReportTitle('Danh sách sinh viên học lại');
        setViewingReportType('retake');
      } else if (reportId === 6) {
        if (!selectedLich) {
          alert('Vui lòng chọn lịch kiến tập trước khi xem/xuất báo cáo này!');
          return;
        }
        const res = await khoaApi.getFinalResultsReport(selectedLich);
        setViewingReportData(res.data || []);
        setViewingReportTitle('Danh sách SV đạt/không đạt');
        setViewingReportType('final');
      } else if (reportId === 2) {
        if (!selectedLich) { alert('Vui lòng chọn lịch kiến tập trước khi xem/xuất báo cáo này!'); return; }
        const res = await khoaApi.getVisitedStudentsReport({ lichKienTapId: selectedLich });
        setViewingReportData(res.data || []);
        setViewingReportTitle('Danh sách SV đã tham quan');
        setViewingReportType('students');
      } else if (reportId === 3) {
        if (!selectedLich) { alert('Vui lòng chọn lịch kiến tập trước khi xem/xuất báo cáo này!'); return; }
        const res = await khoaApi.getNotVisitedStudentsReport({ lichKienTapId: selectedLich });
        setViewingReportData(res.data || []);
        setViewingReportTitle('Danh sách SV chưa tham quan');
        setViewingReportType('students');
      } else if (reportId === 4) {
        if (!selectedLich) { alert('Vui lòng chọn lịch kiến tập trước khi xem/xuất báo cáo này!'); return; }
        const res = await khoaApi.getEligibleStudentsReport({ lichKienTapId: selectedLich });
        setViewingReportData(res.data || []);
        setViewingReportTitle('Danh sách SV đủ điều kiện báo cáo');
        setViewingReportType('students');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi tải dữ liệu!');
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative" onClick={closeAllDropdowns}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Báo cáo thống kê</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] flex items-center gap-4 relative z-20 mb-8">
        
        {/* Năm học Dropdown */}
        <div className="relative min-w-[250px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Năm học</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsNamHocDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isNamHocDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedNamHoc ? 'text-slate-700' : 'text-slate-400'}`}>{selectedNamHoc || 'Chọn năm học'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isNamHocDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {namHocOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setSelectedNamHoc(opt); setIsNamHocDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedNamHoc === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {selectedNamHoc === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Khóa Dropdown */}
        <div className="relative min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Khóa</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsKhoaDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isKhoaDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedKhoa ? 'text-slate-700' : 'text-slate-400'}`}>{selectedKhoa || 'Chọn khóa'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isKhoaDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {khoaOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setSelectedKhoa(opt); setIsKhoaDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedKhoa === opt ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {selectedKhoa === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lịch kiến tập Dropdown */}
        <div className="relative min-w-[250px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Lịch kiến tập</label>
          <div 
            onClick={(e) => handleDropdownClick(e, setIsLichDropdownOpen)}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isLichDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className={`truncate pr-2 font-medium ${selectedLich ? 'text-slate-700' : 'text-slate-400'}`}>
              {selectedLich ? schedules.find(s => s.id === selectedLich)?.ten_lich || selectedLich : 'Chọn lịch kiến tập'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isLichDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-y-auto max-h-60 animate-in slide-in-from-top-1">
              {schedules.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => { setSelectedLich(opt.id); setIsLichDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedLich === opt.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{opt.ten_lich}</span>
                  {selectedLich === opt.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10">
        {reports.map(report => (
          <div key={report.id} className="bg-white rounded-2xl p-6 border border-[#E7E0C4] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.bgIcon}`}>
                  {report.icon}
                </div>
                <h3 className="text-lg font-black text-slate-800">{report.name}</h3>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
                {report.desc}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-[#E7E0C4]/50">
              <button 
                onClick={() => handleView(report.id)}
                className="flex-1 py-2.5 border border-[#E7E0C4] hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Xem
              </button>
              <button 
                onClick={() => handleExportExcel(report.id)}
                className="flex-1 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Xuất Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Data Modal */}
      {viewingReportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setViewingReportData(null)}
          ></div>
          <div 
            className="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {viewingReportTitle}
              </h2>
              <button 
                type="button"
                onClick={() => setViewingReportData(null)}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {viewingReportData.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-medium">Không có dữ liệu.</div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                        <th className="p-4 pl-6">MSSV</th>
                        <th className="p-4">Họ và tên</th>
                        {viewingReportType === 'final' ? (
                          <>
                            <th className="p-4">Điểm tổng kết</th>
                            <th className="p-4">Kết quả</th>
                          </>
                        ) : (
                          <>
                            <th className="p-4">Lớp</th>
                            <th className="p-4">Khóa</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                      {viewingReportData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-[#407F3E]">
                            {viewingReportType === 'final' ? item.lichKienTapSinhVien?.sinhVien?.mssv : item.mssv}
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            {viewingReportType === 'final' ? item.lichKienTapSinhVien?.sinhVien?.ho_ten : item.ho_ten}
                          </td>
                          {viewingReportType === 'final' ? (
                            <>
                              <td className="p-4 font-medium text-slate-600">
                                {item.diem_tong_ket !== null ? Number(item.diem_tong_ket).toFixed(2) : 'Chưa chốt'}
                              </td>
                              <td className="p-4 font-bold text-slate-800">
                                {item.ket_qua === 'Dat' ? 'Đạt' : item.ket_qua === 'KhongDat' ? 'Không Đạt' : 'Đang học'}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-4 font-medium text-slate-600">{item.lop || item.ten_lop}</td>
                              <td className="p-4 font-medium text-slate-600">{item.khoa?.ten_khoa}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
