import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, CheckCircle, Clock, XCircle, FileSpreadsheet, Award, Users, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { khoaApi } from '../../services/api';

export default function XemTruocBaoCaoThamQuan_Khoa() {
  const navigate = useNavigate();

  const [tripsData, setTripsData] = useState([]);
  const [topFactoriesData, setTopFactoriesData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [stats, setStats] = useState({ 
    totalTrips: 0, 
    totalStudents: 0, 
    totalCompanies: 0, 
    attendanceRate: 0 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tripsRes, regsRes] = await Promise.all([
        khoaApi.getTrips(),
        khoaApi.getRegistrations({ limit: 10000 })
      ]);

      const trips = tripsRes.data?.data || tripsRes.data || [];
      const regs = regsRes.data?.data || [];

      const tripsMap = {};
      const factorySet = new Set();
      
      trips.forEach(t => {
        const factory = t.nhaMay?.ten_nha_may || 'Chưa rõ';
        if (t.nhaMay?.id) factorySet.add(t.nhaMay.id);

        tripsMap[t.id] = {
          rawId: t.id,
          id: `CTQ-${String(t.id).padStart(3, '0')}`,
          name: t.ten_chuyen || `Tham quan ${factory}`,
          factory: factory,
          date: t.ngay_tham_quan ? new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN') : '-',
          rawDate: t.ngay_tham_quan,
          registeredCount: 0,
          actualCount: 0,
          status: (t.trang_thai === 'DaKetThuc' || t.trang_thai === 'DaKhoa' || t.trang_thai === 'DaDienRa') 
            ? 'Hoàn thành' 
            : (t.trang_thai === 'DangDienRa' ? 'Đang diễn ra' : (t.trang_thai === 'DaHuy' ? 'Đã hủy' : 'Sắp diễn ra')),
        };
      });

      regs.forEach(r => {
        const tId = r.chuyen_tham_quan_id;
        if (tripsMap[tId]) {
          if (['ChoDuyet', 'HopLe', 'DaThamGia', 'HoanThanh'].includes(r.trang_thai)) {
            tripsMap[tId].registeredCount++;
          }
          const isTuDo = r.chuyenThamQuan?.cach_to_chuc === 'TuDo';
          if (isTuDo) {
            if (['DaThamGia', 'HoanThanh'].includes(r.trang_thai)) {
              tripsMap[tId].actualCount++;
            }
          } else {
            if (r.diemDanh?.trang_thai === 'CoMat') {
              tripsMap[tId].actualCount++;
            }
          }
        }
      });

      const processedTrips = Object.values(tripsMap);
      
      let tStudents = 0;
      let tRegs = 0;
      const factoryAgg = {};
      const timeAgg = {};

      processedTrips.forEach(t => {
        tStudents += t.actualCount;
        tRegs += t.registeredCount;

        // Factory aggregation
        if (!factoryAgg[t.factory]) {
          factoryAgg[t.factory] = { name: t.factory, students: 0 };
        }
        factoryAgg[t.factory].students += t.actualCount;

        // Time aggregation (by Month/Year)
        if (t.rawDate) {
          const d = new Date(t.rawDate);
          const monthYear = `T${d.getMonth()+1}/${d.getFullYear()}`;
          if (!timeAgg[monthYear]) {
            timeAgg[monthYear] = { name: monthYear, SV: 0, timeVal: d.getTime() };
          }
          timeAgg[monthYear].SV += t.actualCount;
        }
      });

      setTripsData(processedTrips);
      
      setStats({
        totalTrips: processedTrips.length,
        totalStudents: tStudents,
        totalCompanies: factorySet.size,
        attendanceRate: tRegs > 0 ? ((tStudents / tRegs) * 100).toFixed(1) : 0
      });

      setTopFactoriesData(
        Object.values(factoryAgg)
          .sort((a,b) => b.students - a.students)
          .slice(0, 10)
      );

      setTimeSeriesData(
        Object.values(timeAgg)
          .sort((a,b) => a.timeVal - b.timeVal)
          .map(({ name, SV }) => ({ name, SV }))
      );

    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Hoàn thành') return 'bg-[#dce8c4] text-[#446900] border border-[#89B449]';
    if (status === 'Sắp diễn ra') return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (status === 'Đang diễn ra') return 'bg-amber-50 text-amber-800 border border-amber-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'Hoàn thành') return <CheckCircle className="w-3.5 h-3.5 text-[#446900]" />;
    if (status === 'Sắp diễn ra') return <Clock className="w-3.5 h-3.5 text-blue-500" />;
    if (status === 'Đang diễn ra') return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  };

  const handleExportExcel = () => {
    let csvContent = '\uFEFF';
    csvContent += 'Tên doanh nghiệp,Ngày,Số SV đăng ký,Số SV thực tham gia,Tỷ lệ tham dự (%),Trạng thái\n';
    
    tripsData.forEach((trip) => {
      const rate = trip.registeredCount > 0 ? ((trip.actualCount / trip.registeredCount) * 100).toFixed(1) : 0;
      csvContent += `"${trip.factory}","${trip.date}","${trip.registeredCount}","${trip.actualCount}","${rate}%","${trip.status}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `BaoCaoTongHopKienTap_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Custom Line Chart Component
  const LineChart = ({ data }) => {
    if (data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400">Không có dữ liệu</div>;
    const maxVal = Math.max(...data.map(d => d.SV), 10);
    const points = data.map((d, i) => {
      const x = (i / (data.length > 1 ? data.length - 1 : 1)) * 100;
      const y = 100 - (d.SV / maxVal) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="relative h-64 w-full pt-4 pb-8 pl-8">
        {/* Y-Axis labels */}
        <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between text-[10px] text-slate-400 font-mono">
          <span>{maxVal}</span>
          <span>{Math.round(maxVal/2)}</span>
          <span>0</span>
        </div>
        
        {/* Grid lines */}
        <div className="absolute left-8 right-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
          <div className="border-t border-dashed border-slate-200 w-full h-0"></div>
          <div className="border-t border-dashed border-slate-200 w-full h-0"></div>
          <div className="border-t border-slate-300 w-full h-0"></div>
        </div>

        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline 
            points={points} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="3" 
            vectorEffect="non-scaling-stroke" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {data.map((d, i) => {
            const x = (i / (data.length > 1 ? data.length - 1 : 1)) * 100;
            const y = 100 - (d.SV / maxVal) * 100;
            return (
              <circle key={i} cx={x} cy={y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            )
          })}
        </svg>

        <div className="absolute left-8 right-0 bottom-0 h-6">
          {data.map((d, i) => (
            <div 
              key={i} 
              className="absolute bottom-0 text-[10px] font-bold text-slate-500 whitespace-nowrap transform -translate-x-1/2" 
              style={{ left: `${(i / (data.length > 1 ? data.length - 1 : 1)) * 100}%` }}
            >
              {d.name}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-8 print:bg-white print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/khoa/reports')} className="p-2 bg-white border border-slate-200 hover:border-[#407F3E] text-slate-500 hover:text-[#407F3E] rounded-xl transition-all cursor-pointer shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#407F3E] tracking-tight">Tổng hợp dữ liệu tham quan</h1>
            <p className="text-sm text-slate-500">Báo cáo tổng quan về hoạt động kiến tập và doanh nghiệp.</p>
          </div>
        </div>
        <button 
          onClick={handleExportExcel} 
          className="flex items-center gap-2 px-5 py-2.5 bg-[#407F3E] hover:bg-[#346832] text-white rounded-xl text-sm font-semibold shadow-sm cursor-pointer self-start transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Excel tổng hợp</span>
        </button>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block text-center mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-800">BÁO CÁO TỔNG HỢP KIẾN TẬP</h1>
        <p className="text-slate-500 mt-2 font-medium">Thống kê dữ liệu tham quan thực tế tại doanh nghiệp</p>
      </div>

      <div className="flex flex-col gap-8 print:gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 print:border-slate-300 print:shadow-none">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 print:border print:border-blue-200">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tổng chuyến đi</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.totalTrips}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 print:border-slate-300 print:shadow-none">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 print:border print:border-emerald-200">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">SV tham gia</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.totalStudents}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 print:border-slate-300 print:shadow-none">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0 print:border print:border-purple-200">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">DN liên kết</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.totalCompanies}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 print:border-slate-300 print:shadow-none">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 print:border print:border-amber-200">
              <Percent className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tỷ lệ tham dự</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.attendanceRate}%</h3>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:break-inside-avoid">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col print:border-slate-300 print:shadow-none">
            <div className="mb-6">
              <h3 className="font-extrabold text-slate-800 text-base">Top Doanh nghiệp thu hút sinh viên</h3>
              <p className="text-xs text-slate-400 font-semibold">10 doanh nghiệp có số lượng sinh viên tham gia cao nhất</p>
            </div>
            <div className="flex h-64 items-end gap-2 px-2 mt-auto">
              {topFactoriesData.length === 0 ? (
                <div className="w-full flex items-center justify-center text-slate-400">Không có dữ liệu</div>
              ) : (
                topFactoriesData.map((f, idx) => {
                  const maxVal = topFactoriesData[0]?.students || 1;
                  const heightPercent = Math.max((f.students / maxVal) * 100, 5); // min 5% height
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 gap-2 group h-full justify-end">
                      <div className="text-[10px] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity print:opacity-100">{f.students}</div>
                      <div className="w-full bg-[#407F3E] rounded-t-sm transition-all duration-500 print:bg-slate-800" style={{ height: `${heightPercent}%` }}></div>
                      <div className="text-[9px] text-slate-600 font-semibold truncate w-full text-center" title={f.name}>{f.name.substring(0, 8)}..</div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col print:border-slate-300 print:shadow-none">
            <div className="mb-2">
              <h3 className="font-extrabold text-slate-800 text-base">Biểu đồ lượt tham quan theo thời gian</h3>
              <p className="text-xs text-slate-400 font-semibold">Số lượng sinh viên đi thực tế theo các tháng</p>
            </div>
            <div className="mt-auto">
              <LineChart data={timeSeriesData} />
            </div>
          </div>
        </div>

        {/* Table Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print:border-slate-300 print:shadow-none mt-4">
          <div className="p-6 border-b border-slate-50 print:border-slate-300">
            <h3 className="font-extrabold text-slate-800 text-base">Chi tiết các chuyến tham quan</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Bảng liệt kê danh sách hành trình, số lượng đăng ký và tỷ lệ có mặt thực tế</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 print:bg-white print:text-black">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Tên doanh nghiệp</th>
                  <th className="px-6 py-4 border-b border-slate-200">Ngày</th>
                  <th className="px-6 py-4 text-center border-b border-slate-200">Đăng ký</th>
                  <th className="px-6 py-4 text-center border-b border-slate-200">Tham gia</th>
                  <th className="px-6 py-4 text-center border-b border-slate-200">Tỷ lệ (%)</th>
                  <th className="px-6 py-4 border-b border-slate-200">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-semibold print:divide-slate-300 print:text-black">
                {tripsData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">Không có dữ liệu chuyến tham quan</td>
                  </tr>
                )}
                {tripsData.map((trip, idx) => {
                  const rate = trip.registeredCount > 0 ? ((trip.actualCount / trip.registeredCount) * 100).toFixed(1) : 0;
                  return (
                    <tr key={trip.rawId} className="hover:bg-slate-50 transition-colors print:break-inside-avoid">
                      <td className="px-6 py-4 font-bold max-w-[200px] truncate" title={trip.factory}>{trip.factory}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500 font-mono print:text-black">{trip.date}</td>
                      <td className="px-6 py-4 text-center font-mono">{trip.registeredCount}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-slate-800 print:text-black">{trip.actualCount}</td>
                      <td className="px-6 py-4 text-center font-mono text-[#407F3E] font-bold print:text-black">{rate}%</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold print:border print:border-slate-300 print:bg-white print:text-black ${getStatusBadge(trip.status)}`}>
                          <span className="print:hidden">{getStatusIcon(trip.status)}</span>
                          <span>{trip.status}</span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
