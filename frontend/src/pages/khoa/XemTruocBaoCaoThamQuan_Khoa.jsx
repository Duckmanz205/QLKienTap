import React, { useState, useEffect } from 'react';
import { BarChart3, ArrowLeft, Building2, CheckCircle, Clock, XCircle, FileSpreadsheet, Sparkles, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { khoaApi } from '../../services/api';

export default function XemTruocBaoCaoThamQuan_Khoa() {
  const navigate = useNavigate();
  const [tripsData, setTripsData] = useState([]);
  const [factoriesData, setFactoriesData] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalTrips: 0, completedTrips: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tripsRes, regsRes] = await Promise.all([
        khoaApi.getTrips(),
        khoaApi.getRegistrations({ limit: 10000 })
      ]);

      const trips = tripsRes.data.data || tripsRes.data || [];
      const regs = regsRes.data.data || [];

      let tStudents = 0;
      let cTrips = 0;
      
      const tripsMap = {};
      trips.forEach(t => {
        const factory = t.nhaMay?.ten_nha_may || 'Chưa rõ';
        tripsMap[t.id] = {
          rawId: t.id,
          id: `CTQ-${String(t.id).padStart(3, '0')}`,
          name: `Tham quan ${factory}`,
          factory: factory,
          date: t.ngay_tham_quan ? new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN') : '-',
          registeredCount: 0,
          actualCount: 0,
          status: (t.trang_thai === 'DaKetThuc' || t.trang_thai === 'DaKhoa' || t.trang_thai === 'DaDienRa') 
            ? 'Đã hoàn thành' 
            : (t.trang_thai === 'DangDienRa' ? 'Đang diễn ra' : (t.trang_thai === 'DaHuy' ? 'Đã hủy' : 'Chưa diễn ra')),
        };
        if (t.trang_thai === 'DaKetThuc' || t.trang_thai === 'DaKhoa' || t.trang_thai === 'DaDienRa') {
          cTrips++;
        }
      });

      regs.forEach(r => {
        const tId = r.chuyen_tham_quan_id;
        if (tripsMap[tId]) {
          if (['ChoDuyet', 'HopLe', 'DaThamGia', 'HoanThanh'].includes(r.trang_thai)) {
            tripsMap[tId].registeredCount++;
          }
          const isTuDo = r.chuyenThamQuan?.cach_to_chuc === 'TuDo';
          if (isTuDo) {
            // Chuyến tự do không có DiemDanh — dùng trạng thái phiếu đăng ký làm căn cứ "đã hoàn thành"
            if (['DaThamGia', 'HoanThanh'].includes(r.trang_thai)) {
              tripsMap[tId].actualCount++;
            }
          } else {
            // Chuyến do khoa tổ chức — dùng đúng dữ liệu điểm danh thật, không suy đoán từ hóa đơn
            if (r.diemDanh?.trang_thai === 'CoMat') {
              tripsMap[tId].actualCount++;
            }
          }
        }
      });

      const processedTrips = Object.values(tripsMap);
      processedTrips.forEach(t => { tStudents += t.actualCount; });
      setTripsData(processedTrips);
      setStats({
        totalStudents: tStudents,
        totalTrips: processedTrips.length,
        completedTrips: cTrips
      });

      const factoryCount = {};
      regs.forEach(r => {
        if (['ChoDuyet', 'HopLe', 'DaThamGia', 'HoanThanh'].includes(r.trang_thai)) {
          const factoryName = r.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chưa rõ';
          factoryCount[factoryName] = (factoryCount[factoryName] || 0) + 1;
        }
      });
      const totalRegs = Object.values(factoryCount).reduce((a,b) => a+b, 0);
      const colors = ['bg-primary', 'bg-[#446900]', 'bg-[#2c6b2d]', 'bg-blue-600', 'bg-amber-500'];
      const fData = Object.entries(factoryCount).map(([name, count], i) => ({
        name,
        count,
        percentage: totalRegs > 0 ? Math.round((count / totalRegs) * 100) : 0,
        color: colors[i % colors.length]
      })).sort((a,b) => b.count - a.count);
      
      setFactoriesData(fData);

    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Đã hoàn thành') return 'bg-[#dce8c4] text-[#446900] border border-[#89B449]';
    if (status === 'Đang diễn ra') return 'bg-amber-50 text-amber-800 border border-amber-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };
  const getStatusIcon = (status) => {
    if (status === 'Đã hoàn thành') return <CheckCircle className="w-3.5 h-3.5 text-[#446900]" />;
    if (status === 'Đang diễn ra') return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  };

  const exportExcel = () => {
    let csvContent = '\uFEFF';
    csvContent += 'Mã chuyến,Tên chuyến,Nhà máy,Ngày,Đăng ký,Thực tế,Trạng thái\n';
    tripsData.forEach(t => {
      csvContent += `"${t.id}","${t.name}","${t.factory}","${t.date}","${t.registeredCount}","${t.actualCount}","${t.status}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `ThongKeTripDetails_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/khoa/reports')} className="p-2 bg-white border border-slate-200 hover:border-primary text-slate-500 hover:text-primary rounded-xl transition-all cursor-pointer shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">Tổng hợp dữ liệu tham quan</h1>
            <p className="text-sm text-slate-500">Thống kê phân bổ sinh viên đăng ký tham quan thực tế tại các nhà máy.</p>
          </div>
        </div>
        <button onClick={exportExcel} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#2c6b2d] text-white rounded-xl text-sm font-semibold shadow-sm cursor-pointer self-start">
          <FileSpreadsheet className="w-4 h-4" /><span>Xuất Excel thống kê</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-primary"><Award className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng SV tham gia (TT)</p><h3 className="text-2xl font-black text-slate-800">{stats.totalStudents} sinh viên</h3></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Building2 className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng số chuyến đi</p><h3 className="text-2xl font-black text-slate-800">{stats.totalTrips} chuyến</h3></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600"><CheckCircle className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đã hoàn thành</p><h3 className="text-2xl font-black text-slate-800">{stats.completedTrips} chuyến</h3></div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2 flex flex-col gap-6">
          <div><h3 className="font-extrabold text-slate-800 text-base">Phân bổ sinh viên theo nhà máy</h3><p className="text-xs text-slate-400 font-semibold">Tỷ lệ phân phối dựa trên lượt đăng ký</p></div>
          <div className="space-y-5 flex-1 flex flex-col justify-center py-4">
            {factoriesData.map(f => (
              <div key={f.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-2"><span className={`w-3 h-3 rounded ${f.color}`}></span>{f.name}</span>
                  <span className="font-mono">{f.count} SV ({f.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden shadow-inner">
                  <div className={`h-full ${f.color} rounded-lg transition-all duration-1000`} style={{ width: `${f.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#E7E0C4]/60 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /><h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Đánh giá chung</h3></div>
            {factoriesData.length > 0 ? (
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">Nhà máy <b>{factoriesData[0].name}</b> nhận được sự quan tâm lớn nhất với <b>{factoriesData[0].percentage}%</b> ({factoriesData[0].count} SV).</p>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">Chưa có dữ liệu thống kê nhà máy.</p>
            )}
            {tripsData.length > 0 && tripsData.some(t => t.registeredCount > 0) ? (
              (() => {
                const maxTrip = [...tripsData].sort((a,b) => (b.actualCount/b.registeredCount || 0) - (a.actualCount/a.registeredCount || 0))[0];
                return <p className="text-xs text-slate-600 leading-relaxed font-semibold">Chuyến đi <b>{maxTrip.factory}</b> đạt tỉ lệ tham gia cao: <b>{maxTrip.actualCount}/{maxTrip.registeredCount}</b> SV.</p>
              })()
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">Chưa có dữ liệu chuyến đi thực tế.</p>
            )}
          </div>
          <div className="pt-4 border-t border-slate-300">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cập nhật lúc: 15/10/2023 - 17:30</span>
          </div>
        </div>
      </div>

      {/* Trip Details Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-extrabold text-slate-800 text-base">Chi tiết các chuyến tham quan thực tế</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Bảng liệt kê danh sách hành trình và tỉ lệ có mặt</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-12 text-center">STT</th><th className="px-6 py-4">Mã chuyến</th><th className="px-6 py-4">Tên chuyến</th><th className="px-6 py-4">Nhà máy</th><th className="px-6 py-4">Ngày</th><th className="px-6 py-4 text-center">Đăng ký</th><th className="px-6 py-4 text-center">Thực tế</th><th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-sm font-semibold">
              {tripsData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-slate-400">Không có dữ liệu chuyến tham quan</td>
                </tr>
              )}
              {tripsData.map((trip, idx) => (
                <tr key={trip.rawId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-center text-slate-400 font-mono">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-4 font-mono font-bold text-primary">{trip.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{trip.name}</td>
                  <td className="px-6 py-4 text-slate-500">{trip.factory}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 font-mono">{trip.date}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-600">{trip.registeredCount} SV</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-800 bg-slate-50/30">{trip.actualCount}{trip.actualCount !== '-' ? ' SV' : ''}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(trip.status)}`}>{getStatusIcon(trip.status)}<span>{trip.status}</span></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
