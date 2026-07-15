import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  CheckCircle, 
  Award, 
  Star, 
  Building,
  BarChart2,
  Info
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function KetQua_Diem_SV() {
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedTermIndex, setSelectedTermIndex] = useState(0);
  const [selectedTripIndex, setSelectedTripIndex] = useState(0);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchGrades(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchGrades = async (svId) => {
    try {
      const res = await sinhVienApi.getGrades(svId);
      setGrades(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải kết quả học tập...
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-surface-variant/40 p-12 text-center max-w-lg mx-auto mt-6">
        <GraduationCap className="w-16 h-16 text-outline/40 mx-auto mb-4" />
        <p className="text-lg font-bold text-on-surface">Chưa có kết quả học tập</p>
        <p className="text-sm text-on-surface-variant mt-2">
          Hiện tại bạn chưa được phân vào lịch kiến tập nào hoặc đợt kiến tập chưa công bố điểm.
        </p>
      </div>
    );
  }

  const activeTerm = grades[selectedTermIndex] || grades[0];
  const trips = activeTerm.selectedTrips || [];
  const activeTrip = trips[selectedTripIndex] || trips[0];

  // Calculate total score for a trip
  const calculateTripTotal = (t) => {
    if (!t) return 0;
    const prep = Number(t.diem_chuan_bi || 0);
    const rep = Number(t.diem_bai_thu_hoach || 0);
    const pres = Number(t.diem_bao_cao_tqnm || 0);
    const bonus = Number(t.diem_cong || 0);
    return Math.min(10, prep * 0.3 + rep * 0.3 + pres * 0.4 + bonus);
  };

  const isPassed = activeTerm.diem_tong_ket !== null && Number(activeTerm.diem_tong_ket) >= 5.0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Kết quả & điểm</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Theo dõi bảng tổng kết điểm kiến tập học phần thực địa của bạn, bao gồm điểm chuẩn bị, bài thu hoạch, báo cáo tại nhà máy và điểm cộng.
          </p>
        </div>

        {/* Term Selector Dropdown */}
        {grades.length > 1 && (
          <select
            value={selectedTermIndex}
            onChange={(e) => {
              setSelectedTermIndex(Number(e.target.value));
              setSelectedTripIndex(0);
            }}
            className="px-4 py-2.5 bg-white border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none font-bold text-on-surface shadow-sm"
          >
            {grades.map((g, idx) => (
              <option key={idx} value={idx}>{g.ten_lich}</option>
            ))}
          </select>
        )}
      </div>

      {/* Overview GPA Card Panel */}
      <div className="bg-white rounded-3xl border border-surface-variant/40 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-primary/5 rounded-full blur-2xl group-hover:scale-120 transition-transform duration-700"></div>
        
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#e5ffdc] flex items-center justify-center text-primary shadow-inner">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div>
            <div className="text-[10px] text-on-surface-variant font-black tracking-widest uppercase mb-1">Tổng kết học phần</div>
            <h2 className="text-xl md:text-2xl font-black text-on-surface flex items-baseline gap-2">
              <span>Điểm tổng kết:</span>
              <span className="text-3xl text-primary font-black">
                {activeTerm.diem_tong_ket !== null ? Number(activeTerm.diem_tong_ket).toFixed(2) : 'Chưa có'}
              </span>
              {activeTerm.diem_tong_ket !== null && <span className="text-sm text-on-surface-variant">/ 10</span>}
            </h2>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">{activeTerm.ten_lich}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {activeTerm.diem_tong_ket !== null ? (
            <>
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black tracking-wider uppercase shadow-sm border ${
                isPassed 
                  ? 'bg-[#e5ffdc] text-primary border-primary/20' 
                  : 'bg-red-50 text-red-750 border-red-200'
              }`}>
                <CheckCircle className="w-4 h-4" />
                <span>{isPassed ? 'ĐẠT HỌC PHẦN' : 'CHƯA ĐẠT'}</span>
              </span>
              {Number(activeTerm.diem_tong_ket) >= 8.5 && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-warning-yellow/15 text-yellow-750 border border-warning-yellow/30 rounded-2xl text-xs font-black tracking-wider uppercase shadow-sm">
                  <Award className="w-4 h-4" />
                  <span>XUẤT SẮC (Top 5%)</span>
                </span>
              )}
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-705 border border-amber-200 rounded-2xl text-xs font-black tracking-wider uppercase shadow-sm">
              <Star className="w-4 h-4" />
              <span>ĐANG TIẾN HÀNH</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Score Table Left, Visualization Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Grade Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-surface-variant/40 shadow-sm p-6 flex flex-col">
          <h2 className="font-bold text-base text-on-surface flex items-center gap-2 mb-6">
            <Building className="w-5 h-5 text-primary" />
            <span>Chi tiết điểm bộ 3 chuyến đi đại diện</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-variant">
                  <th className="py-4 px-4">Nhà máy</th>
                  <th className="py-4 px-4 text-center">Chuẩn bị (30%)</th>
                  <th className="py-4 px-4 text-center">Báo cáo (30%)</th>
                  <th className="py-4 px-4 text-center">Báo cáo NM (40%)</th>
                  <th className="py-4 px-4 text-center">Cộng</th>
                  <th className="py-4 px-4 text-center">Tổng điểm</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold divide-y divide-slate-100">
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      Chưa chốt bộ chuyến đi đại diện để hiển thị chi tiết điểm.
                    </td>
                  </tr>
                ) : (
                  trips.map((item, index) => {
                    const isSelected = selectedTripIndex === index;
                    const total = calculateTripTotal(item);
                    return (
                      <tr 
                        key={index}
                        onClick={() => setSelectedTripIndex(index)}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-primary/5 hover:bg-primary/10 font-black' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-inner ${
                              isSelected ? 'bg-primary text-white' : 'bg-[#f2f5ec] text-outline'
                            }`}>
                              <Building className="w-3.5 h-3.5" />
                            </div>
                            <span className={`text-on-surface max-w-[180px] truncate ${
                              isSelected ? 'text-primary' : ''
                            }`}>{item.ten_nha_may}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-medium text-on-surface-variant">{Number(item.diem_chuan_bi || 0).toFixed(1)}</td>
                        <td className="py-4 px-4 text-center font-medium text-on-surface-variant">{Number(item.diem_bai_thu_hoach || 0).toFixed(1)}</td>
                        <td className="py-4 px-4 text-center font-medium text-on-surface-variant">{Number(item.diem_bao_cao_tqnm || 0).toFixed(1)}</td>
                        <td className="py-4 px-4 text-center text-[#476d01]">{item.diem_cong > 0 ? `+${Number(item.diem_cong).toFixed(1)}` : '0'}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 bg-[#e5ffdc] text-primary rounded-lg shadow-sm border border-primary/10">
                            {total.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-on-surface-variant font-bold bg-[#f8faf1]/50 p-3 rounded-xl">
            <span className="flex items-center gap-1">
              <Info className="w-4 h-4 text-primary animate-pulse" />
              <span>Công thức tính: Tổng điểm = (Chuẩn bị * 0.3) + (Báo cáo * 0.3) + (Báo cáo tại NM * 0.4) + Điểm cộng</span>
            </span>
          </div>
        </div>

        {/* Right Column: Visualization Custom Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-surface-variant/40 shadow-sm p-6 flex flex-col justify-between">
          {activeTrip ? (
            <div>
              <h2 className="font-bold text-base text-on-surface flex items-center gap-2 mb-2">
                <BarChart2 className="w-5 h-5 text-secondary" />
                <span>Phân bổ điểm chi tiết</span>
              </h2>
              <p className="text-xs text-on-surface-variant font-semibold mb-6">
                Xem tỷ trọng và so sánh điểm thành phần của chuyến: <span className="font-black text-primary uppercase">{activeTrip.ten_nha_may}</span>
              </p>

              {/* Custom Interactive Bars */}
              <div className="space-y-5">
                {/* Factor 1: Chuẩn bị */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                    <span>Chuẩn bị (Tác phong, chuyên cần) - 30%</span>
                    <span className="text-primary font-black">{Number(activeTrip.diem_chuan_bi || 0).toFixed(1)} / 10</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    <div 
                      className="h-full bg-[#89B449] rounded-full transition-all duration-505 flex items-center justify-end pr-2" 
                      style={{ width: `${(activeTrip.diem_chuan_bi || 0) * 10}%` }}
                    >
                      {activeTrip.diem_chuan_bi > 0 && (
                        <span className="text-[9px] text-white font-black leading-none">{(activeTrip.diem_chuan_bi * 10).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Factor 2: Báo cáo */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                    <span>Bài báo cáo thu hoạch - 30%</span>
                    <span className="text-primary font-black">{Number(activeTrip.diem_bai_thu_hoach || 0).toFixed(1)} / 10</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-505 flex items-center justify-end pr-2" 
                      style={{ width: `${(activeTrip.diem_bai_thu_hoach || 0) * 10}%` }}
                    >
                      {activeTrip.diem_bai_thu_hoach > 0 && (
                        <span className="text-[9px] text-white font-black leading-none">{(activeTrip.diem_bai_thu_hoach * 10).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Factor 3: Báo cáo NM */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                    <span>Báo cáo thực địa tại Nhà máy - 40%</span>
                    <span className="text-primary font-black">{Number(activeTrip.diem_bao_cao_tqnm || 0).toFixed(1)} / 10</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    <div 
                      className="h-full bg-secondary rounded-full transition-all duration-505 flex items-center justify-end pr-2" 
                      style={{ width: `${(activeTrip.diem_bao_cao_tqnm || 0) * 10}%` }}
                    >
                      {activeTrip.diem_bao_cao_tqnm > 0 && (
                        <span className="text-[9px] text-white font-black leading-none">{(activeTrip.diem_bao_cao_tqnm * 10).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Factor 4: Điểm cộng */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                    <span>Điểm cộng (Chuyên cần / Đóng góp xuất sắc)</span>
                    <span className="text-primary font-black">+{Number(activeTrip.diem_cong || 0).toFixed(1)} điểm</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    <div 
                      className="h-full bg-warning-yellow rounded-full transition-all duration-505 flex items-center justify-end pr-2" 
                      style={{ width: `${Math.min(100, (activeTrip.diem_cong || 0) * 20)}%` }}
                    >
                      {activeTrip.diem_cong > 0 && (
                        <span className="text-[9px] text-[#191d17] font-black leading-none">+{activeTrip.diem_cong}đ</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-[#f8faf1] border border-surface-variant p-4 rounded-2xl">
                <h3 className="font-bold text-xs text-on-surface mb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-warning-yellow fill-warning-yellow" />
                  <span>Đánh giá chung của giáo viên hướng dẫn</span>
                </h3>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic">
                  {calculateTripTotal(activeTrip) >= 8.5 
                    ? '"Sinh viên tham gia đầy đủ, tác phong nghiêm túc và có đóng góp tích cực cho nội dung báo cáo kiến tập. Bài viết rất chi tiết và đạt chất lượng cao."'
                    : '"Sinh viên hoàn thành các yêu cầu của đợt thực tập, nộp báo cáo đúng hạn và đạt kết quả ở mức khá."'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400 font-medium">
              <BarChart2 className="w-12 h-12 mb-2 text-slate-300" />
              <span>Chọn một chuyến đi để xem biểu đồ chi tiết</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
