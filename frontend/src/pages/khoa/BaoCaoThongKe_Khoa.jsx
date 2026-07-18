import React, { useState, useEffect } from 'react';
import api, { khoaApi } from '../../services/api';
import { FileSpreadsheet, BarChart3, ArrowRight, CheckCircle, AlertTriangle, Users, Download, Calendar, Layers, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BaoCaoThongKe_Khoa() {
  const navigate = useNavigate();
  const [activeReportTab, setActiveReportTab] = useState('overview');
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [retakeStudents, setRetakeStudents] = useState([]);
  const [finalResults, setFinalResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    fetchSchedules(); 
    fetchRetakeReport(); 
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await khoaApi.getSchedules(); 
      setSchedules(res.data);
      if (res.data.length > 0) setSelectedScheduleId(String(res.data[0].id));
    } catch (err) { 
      console.error(err); 
    }
  };

  const fetchRetakeReport = async () => {
    try { 
      setLoading(true); 
      const res = await khoaApi.getRetakeReport(); 
      setRetakeStudents(res.data); 
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchFinalReport = async (schId) => {
    if (!schId) return;
    try { 
      setLoading(true); 
      const res = await khoaApi.getFinalResultsReport(Number(schId)); 
      setFinalResults(res.data); 
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (activeReportTab === 'final' && selectedScheduleId) fetchFinalReport(selectedScheduleId); 
  }, [activeReportTab, selectedScheduleId]);

  const exportToCSV = (data, fileName) => {
    if (data.length === 0) { 
      alert('Không có dữ liệu.'); 
      return; 
    }
    let csvContent = '\uFEFF';
    if (activeReportTab === 'retake') {
      csvContent += 'MSSV,Họ tên,Lớp,Email,Khoa\n';
      data.forEach(s => { 
        csvContent += `"${s.mssv}","${s.ho_ten}","${s.ten_lop || ''}","${s.email || ''}","${s.khoa?.ten_khoa || ''}"\n`; 
      });
    } else {
      csvContent += 'MSSV,Họ tên,Điểm,Kết quả\n';
      data.forEach(r => { 
        csvContent += `"${r.lichKienTapSinhVien?.sinhVien?.mssv}","${r.lichKienTapSinhVien?.sinhVien?.ho_ten}","${r.diem_tong_ket || ''}","${r.ket_qua || ''}"\n`; 
      });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `${fileName}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
  };

  const availableReports = [
    { 
      id: 'REP-01', 
      title: 'Tổng hợp dữ liệu tham quan thực tế', 
      desc: 'Báo cáo tổng hợp số lượng đăng ký và tham quan thực tế tại nhà máy.', 
      icon: <BarChart3 className="w-5 h-5 text-[#407F3E]" />, 
      actionLabel: 'Xem biểu đồ & chi tiết', 
      actionPath: '/khoa/visit-report', 
      isExcelReady: true 
    },
    { 
      id: 'REP-02', 
      title: 'Danh sách SV đã tham quan đủ chuẩn', 
      desc: 'Roster chi tiết toàn bộ sinh viên đã tham quan tối thiểu theo quy định.', 
      icon: <CheckCircle className="w-5 h-5 text-[#89B449]" />, 
      actionLabel: 'Tải Excel (.xlsx)', 
      isExcelReady: true 
    },
    { 
      id: 'REP-03', 
      title: 'DS SV chưa tham quan thực tế', 
      desc: 'Roster chi tiết sinh viên chưa đăng ký hoặc chưa hoàn thành đợt đi.', 
      icon: <AlertTriangle className="w-5 h-5 text-[#DBD468]" />, 
      actionLabel: 'Tải Excel (.xlsx)', 
      isExcelReady: true 
    },
    { 
      id: 'REP-04', 
      title: 'DS SV đủ điều kiện thành lập HĐ', 
      desc: 'Danh sách sinh viên hoàn thành chuyên đề, sẵn sàng báo cáo hội đồng.', 
      icon: <Users className="w-5 h-5 text-[#407F3E]" />, 
      actionLabel: 'Tải Excel (.xlsx)', 
      isExcelReady: true 
    },
    { 
      id: 'REP-05', 
      title: 'Kiểm toán lệ phí & hoàn phí', 
      desc: 'Thống kê tình hình nộp lệ phí thực tế, hoàn tiền và các vi phạm.', 
      icon: <Layers className="w-5 h-5 text-[#E68A8C]" />, 
      actionLabel: 'Tải Excel (.xlsx)', 
      isExcelReady: true 
    }
  ];

  const downloadReport = async (reportId, reportTitle) => {
    try {
      setLoading(true);
      const res = await khoaApi.getRegistrations({ limit: 10000 });
      const regs = res.data.data || [];
      
      let csvContent = '\uFEFF';
      let fileName = reportId;
      
      if (reportId === 'REP-02') {
        csvContent += 'MSSV,Họ tên,Lớp,Chuyến đi,Nhà máy,Hình thức,Trạng thái\n';
        const filtered = regs.filter(r => r.trang_thai === 'DaThamGia' || r.trang_thai === 'HoanThanh' || r.trang_thai === 'HopLe');
        filtered.forEach(r => {
          csvContent += `"${r.sinhVien?.mssv || ''}","${r.sinhVien?.ho_ten || ''}","${r.sinhVien?.ten_lop || ''}","${r.chuyenThamQuan?.ten_chuyen || ''}","${r.chuyenThamQuan?.nhaMay?.ten_nha_may || ''}","${r.chuyenThamQuan?.hinh_thuc || ''}","${r.trang_thai}"\n`;
        });
      } else if (reportId === 'REP-03') {
        csvContent += 'MSSV,Họ tên,Lớp,Chuyến đi,Nhà máy,Trạng thái\n';
        const filtered = regs.filter(r => r.trang_thai === 'ChoDuyet' || r.trang_thai === 'BiLoai' || r.trang_thai === 'DaHuy' || r.trang_thai === 'VangMat');
        filtered.forEach(r => {
          csvContent += `"${r.sinhVien?.mssv || ''}","${r.sinhVien?.ho_ten || ''}","${r.sinhVien?.ten_lop || ''}","${r.chuyenThamQuan?.ten_chuyen || ''}","${r.chuyenThamQuan?.nhaMay?.ten_nha_may || ''}","${r.trang_thai}"\n`;
        });
      } else if (reportId === 'REP-04') {
        const studentRegCount = {};
        regs.forEach(r => {
          if (r.trang_thai === 'DaThamGia' || r.trang_thai === 'HoanThanh' || r.trang_thai === 'HopLe') {
            const sv = r.sinhVien;
            if (sv) {
              if (!studentRegCount[sv.mssv]) {
                studentRegCount[sv.mssv] = { name: sv.ho_ten, class: sv.ten_lop, count: 0 };
              }
              studentRegCount[sv.mssv].count += 1;
            }
          }
        });
        
        csvContent += 'MSSV,Họ tên,Lớp,Số chuyến đã tham quan,Đủ điều kiện HĐ\n';
        Object.keys(studentRegCount).forEach(mssv => {
          const item = studentRegCount[mssv];
          if (item.count >= 3) {
            csvContent += `"${mssv}","${item.name}","${item.class || ''}","${item.count}","Đủ điều kiện"\n`;
          }
        });
      } else if (reportId === 'REP-05') {
        csvContent += 'MSSV,Họ tên,Lớp,Chuyến đi,Lệ phí cần đóng,Đã đóng,Trạng thái hóa đơn\n';
        regs.forEach(r => {
          const fee = r.hoaDon?.so_tien || 0;
          const paid = r.hoaDon?.trang_thai === 'DaDongDungHan' || r.hoaDon?.trang_thai === 'DaDongTreHan' ? fee : 0;
          const statusLabel = r.hoaDon?.trang_thai || 'ChuaTao';
          csvContent += `"${r.sinhVien?.mssv || ''}","${r.sinhVien?.ho_ten || ''}","${r.sinhVien?.ten_lop || ''}","${r.chuyenThamQuan?.ten_chuyen || ''}","${fee}","${paid}","${statusLabel}"\n`;
        });
      } else {
        alert('Loại báo cáo không hợp lệ hoặc đang được cập nhật.');
        return;
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); 
      link.href = url; 
      link.download = `${fileName}_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link); 
      link.click(); 
      document.body.removeChild(link);
      
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi tải dữ liệu báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = (rep) => {
    if (rep.actionPath) navigate(rep.actionPath);
    else downloadReport(rep.id, rep.title);
  };

  const filteredRetake = retakeStudents.filter(s => 
    s.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.mssv.includes(searchTerm)
  );
  
  const filteredFinal = finalResults.filter(r => 
    r.lichKienTapSinhVien?.sinhVien?.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.lichKienTapSinhVien?.sinhVien?.mssv.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Báo cáo & Thống kê
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Xuất dữ liệu báo cáo chuyên ngành và phân tích chi tiết kết quả học phần kiến tập của sinh viên.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-[#E7E0C4] bg-white rounded-xl p-1 shadow-sm gap-1 self-start">
        {[
          ['overview', 'Tổng quan báo cáo'], 
          ['retake', `SV Học lại (${retakeStudents.length})`], 
          ['final', `Kết quả học phần (${finalResults.length})`]
        ].map(([key, label]) => (
          <button 
            key={key} 
            onClick={() => { setActiveReportTab(key); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-bold transition-all rounded-lg cursor-pointer ${
              activeReportTab === key 
                ? 'bg-[#407F3E] text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeReportTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableReports.map(rep => (
              <div key={rep.id} className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-[#E7E0C4]/20 border border-[#E7E0C4]/60 rounded-xl group-hover:bg-[#407F3E]/5 transition-colors">
                      {rep.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{rep.id}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-base mt-4 leading-snug group-hover:text-[#407F3E] transition-colors">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed">
                    {rep.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E7E0C4]/40 flex items-center justify-between">
                  <button 
                    onClick={() => handleReportAction(rep)} 
                    className="flex items-center gap-1.5 text-xs font-bold text-[#407F3E] hover:text-[#407F3E]/95 cursor-pointer"
                  >
                    <span>{rep.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {rep.isExcelReady && (
                    <button 
                      onClick={() => downloadReport(rep.id, rep.title)} 
                      className="p-2 hover:bg-[#E7E0C4]/20 text-slate-400 hover:text-[#407F3E] rounded-xl transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#E7E0C4]/20 border border-[#E7E0C4] p-5 rounded-2xl flex items-start gap-4 shadow-sm">
            <Calendar className="w-5 h-5 text-[#407F3E] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Thời gian cập nhật dữ liệu báo cáo</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                Các tệp Excel được trích xuất hoàn toàn tự động tuân thủ cấu trúc dữ liệu nhà trường. Số liệu làm mới sau mỗi 15 phút.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Retake / Final Tabs */}
      {(activeReportTab === 'retake' || activeReportTab === 'final') && (
        <div className="bg-white p-6 rounded-2xl border border-[#E7E0C4] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {activeReportTab === 'final' && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>Lịch kiến tập:</span>
                  <select 
                    value={selectedScheduleId} 
                    onChange={e => setSelectedScheduleId(e.target.value)} 
                    className="px-3.5 py-2 rounded-xl border border-[#E7E0C4] bg-white font-bold text-slate-700 cursor-pointer outline-none"
                  >
                    {schedules.map(sch => <option key={sch.id} value={sch.id}>{sch.ten_lich}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm sinh viên..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2 border border-[#E7E0C4] bg-[#E7E0C4]/10 rounded-xl text-xs outline-none font-bold text-slate-750 placeholder:text-slate-400" 
                />
              </div>
              <button 
                onClick={() => { 
                  const data = activeReportTab === 'retake' ? filteredRetake : filteredFinal; 
                  exportToCSV(data, activeReportTab === 'retake' ? 'BaoCao_HocLai' : 'BaoCao_KetQua'); 
                }} 
                className="bg-[#407F3E] hover:bg-[#407F3E]/95 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" /> 
                <span>Xuất file CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center gap-2">
                <RefreshCw className="animate-spin w-5 h-5 text-[#407F3E]" />
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : activeReportTab === 'retake' ? (
              <table className="min-w-full divide-y divide-[#E7E0C4]/30 text-xs text-left">
                <thead className="bg-[#E7E0C4] text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-r border-[#E7E0C4]/40">MSSV</th>
                    <th className="px-4 py-3 border-r border-[#E7E0C4]/40">Họ tên</th>
                    <th className="px-4 py-3 border-r border-[#E7E0C4]/40">Lớp</th>
                    <th className="px-4 py-3 border-r border-[#E7E0C4]/40">Email</th>
                    <th className="px-4 py-3">Khoa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0C4]/30 font-semibold text-slate-800 bg-white">
                  {filteredRetake.map(s => (
                    <tr key={s.id} className="hover:bg-[#E7E0C4]/10 transition-colors">
                      <td className="px-4 py-3.5 font-bold font-mono text-[#407F3E] border-r border-[#E7E0C4]/40">{s.mssv}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-700 border-r border-[#E7E0C4]/40">{s.ho_ten}</td>
                      <td className="px-4 py-3.5 text-slate-500 border-r border-[#E7E0C4]/40">{s.ten_lop}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-500 border-r border-[#E7E0C4]/40">{s.email || 'N/A'}</td>
                      <td className="px-4 py-3.5 text-[#407F3E]">{s.khoa?.ten_khoa}</td>
                    </tr>
                  ))}
                  {filteredRetake.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400 font-bold">Không có dữ liệu sinh viên học lại</td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y divide-[#E7E0C4]/30 text-xs text-left">
                <thead className="bg-[#E7E0C4] text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-r border-[#E7E0C4]/40">MSSV</th>
                    <th className="px-4 py-3 border-r border-[#E7E0C4]/40">Họ tên</th>
                    <th className="px-4 py-3 border-r border-[#E7E0C4]/40">Điểm tổng kết</th>
                    <th className="px-4 py-3 text-center">Kết luận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0C4]/30 font-semibold text-slate-850 bg-white">
                  {filteredFinal.map(r => {
                    let cls = 'bg-slate-100 text-slate-700', lbl = r.ket_qua || 'Đang học';
                    if (r.ket_qua === 'Dat') { 
                      lbl = 'Đạt'; 
                      cls = 'bg-[#89B449] text-white'; 
                    } else if (r.ket_qua === 'KhongDat') { 
                      lbl = 'Không Đạt'; 
                      cls = 'bg-[#E68A8C] text-white'; 
                    }
                    return (
                      <tr key={r.id} className="hover:bg-[#E7E0C4]/10 transition-colors">
                        <td className="px-4 py-3.5 font-bold font-mono text-[#407F3E] border-r border-[#E7E0C4]/40">{r.lichKienTapSinhVien?.sinhVien?.mssv}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-700 border-r border-[#E7E0C4]/40">{r.lichKienTapSinhVien?.sinhVien?.ho_ten}</td>
                        <td className="px-4 py-3.5 text-[#407F3E] font-black font-mono border-r border-[#E7E0C4]/40">
                          {r.diem_tong_ket !== null ? Number(r.diem_tong_ket).toFixed(2) : 'Chưa chốt'}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${cls}`}>
                            {lbl}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFinal.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400 font-bold">Không có dữ liệu kết quả học phần</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
