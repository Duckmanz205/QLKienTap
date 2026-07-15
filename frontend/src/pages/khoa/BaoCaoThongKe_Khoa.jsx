import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';
import { FileSpreadsheet, Search, BarChart3, Download, RefreshCw, Layers } from 'lucide-react';

export default function BaoCaoThongKe_Khoa() {
  const [activeReportTab, setActiveReportTab] = useState('retake'); // 'retake' | 'final'
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  // Data states
  const [retakeStudents, setRetakeStudents] = useState([]);
  const [finalResults, setFinalResults] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSchedules();
    fetchRetakeReport();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await khoaApi.getSchedules();
      setSchedules(res.data);
      if (res.data.length > 0) {
        setSelectedScheduleId(String(res.data[0].id));
      }
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
    if (activeReportTab === 'final' && selectedScheduleId) {
      fetchFinalReport(selectedScheduleId);
    }
  }, [activeReportTab, selectedScheduleId]);

  // Export to CSV simulation
  const exportToCSV = (data, fileName) => {
    if (data.length === 0) {
      alert('Không có dữ liệu để xuất.');
      return;
    }
    
    let csvContent = '\uFEFF'; // UTF-8 BOM
    if (activeReportTab === 'retake') {
      csvContent += 'Mã số sinh viên,Họ và tên,Lớp,Email,Điện thoại,Khoa\n';
      data.forEach(s => {
        csvContent += `"${s.mssv}","${s.ho_ten}","${s.ten_lop || ''}","${s.email || ''}","${s.sdt || ''}","${s.khoa?.ten_khoa || ''}"\n`;
      });
    } else {
      csvContent += 'Mã số sinh viên,Họ và tên,Điểm tổng kết,Kết quả\n';
      data.forEach(r => {
        csvContent += `"${r.lichKienTapSinhVien?.sinhVien?.mssv}","${r.lichKienTapSinhVien?.sinhVien?.ho_ten}","${r.diem_tong_ket || 'Chưa khóa'}","${r.ket_qua || 'Đang thực hiện'}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-primary w-6 h-6" />
            Báo cáo & Thống kê Tổng hợp
          </h2>
          <p className="text-slate-500 text-sm">Xuất báo cáo kết quả điểm học phần kiến tập của sinh viên dạng bảng tính Excel</p>
        </div>

        <button
          onClick={() => {
            const dataToExport = activeReportTab === 'retake' ? filteredRetake : filteredFinal;
            const prefix = activeReportTab === 'retake' ? 'BaoCao_HocLai' : 'BaoCao_KetQua';
            exportToCSV(dataToExport, prefix);
          }}
          className="bg-primary hover:bg-[#2c6b2d] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Xuất Excel (CSV)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveReportTab('retake');
            setSearchTerm('');
          }}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeReportTab === 'retake' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Báo cáo Sinh viên Học lại ({retakeStudents.length})
        </button>
        <button
          onClick={() => {
            setActiveReportTab('final');
            setSearchTerm('');
          }}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'final' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Kết quả học phần kiến tập ({finalResults.length})
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm space-y-4">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {activeReportTab === 'final' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span>Chọn đợt kiến tập:</span>
                <select
                  value={selectedScheduleId}
                  onChange={e => setSelectedScheduleId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium bg-white"
                >
                  {schedules.map(sch => (
                    <option key={sch.id} value={sch.id}>{sch.ten_lich}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Mã SV, họ tên..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary font-semibold"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin w-5 h-5 text-primary" />
              Đang tổng hợp dữ liệu báo cáo...
            </div>
          ) : activeReportTab === 'retake' ? (
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="bg-[#f8faf1] text-slate-700 font-bold text-left">
                  <th className="px-4 py-3 rounded-l-xl">MSSV</th>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Lớp học</th>
                  <th className="px-4 py-3">Email liên hệ</th>
                  <th className="px-4 py-3 rounded-r-xl">Ngành / Khoa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold">
                {filteredRetake.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-800">{s.mssv}</td>
                    <td className="px-4 py-3.5 text-slate-800 font-bold">{s.ho_ten}</td>
                    <td className="px-4 py-3.5">{s.ten_lop}</td>
                    <td className="px-4 py-3.5">{s.email || 'N/A'}</td>
                    <td className="px-4 py-3.5 text-primary">{s.khoa?.ten_khoa}</td>
                  </tr>
                ))}
                {filteredRetake.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400 font-medium">
                      Không có dữ liệu sinh viên học lại
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="bg-[#f8faf1] text-slate-700 font-bold text-left">
                  <th className="px-4 py-3 rounded-l-xl">MSSV</th>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Điểm tổng kết</th>
                  <th className="px-4 py-3 rounded-r-xl text-center">Kết quả học phần</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold">
                {filteredFinal.map(r => {
                  let resClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  let resLabel = r.ket_qua || 'Đang học';
                  if (r.ket_qua === 'Dat') {
                    resLabel = 'Đạt (Qua môn)';
                    resClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (r.ket_qua === 'KhongDat') {
                    resLabel = 'Không Đạt';
                    resClass = 'bg-rose-50 text-rose-700 border-rose-200';
                  }

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {r.lichKienTapSinhVien?.sinhVien?.mssv}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-bold">
                        {r.lichKienTapSinhVien?.sinhVien?.ho_ten}
                      </td>
                      <td className="px-4 py-3.5 text-primary font-bold">
                        {r.diem_tong_ket !== null ? Number(r.diem_tong_ket).toFixed(2) : 'Chưa chốt'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${resClass}`}>
                          {resLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredFinal.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">
                      Không tìm thấy bản ghi kết quả nào cho đợt này
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
