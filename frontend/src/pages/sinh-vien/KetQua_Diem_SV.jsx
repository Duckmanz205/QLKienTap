import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, BookOpen, AlertCircle, CheckCircle2, XCircle, Clock, RotateCcw, Calendar, History
} from 'lucide-react';
import { sinhVienApi } from '../../services/api';

export default function KetQua_Diem_SV() {
  const [student, setStudent] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohortIndex, setSelectedCohortIndex] = useState(0);

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
      if (res.data && res.data.length > 0) {
        setCohorts(res.data);
        setSelectedCohortIndex(0); // Luôn mặc định hiển thị đợt học mới nhất
      }
    } catch (err) {
      console.error(err);
    }
  };

  const termGrade = cohorts[selectedCohortIndex] || null;
  const grades = termGrade?.selectedTrips || [];

  const calculateTripScore = (trip) => {
    if (!trip) return '-';
    if (trip.diem_tong_chuyen !== null && trip.diem_tong_chuyen !== undefined) {
      return Number(trip.diem_tong_chuyen).toFixed(1);
    }
    if (trip.diem_chuan_bi === null || trip.diem_bai_thu_hoach === null || trip.diem_bao_cao_tqnm === null) {
      return '-';
    }
    const score = (Number(trip.diem_chuan_bi || 0) * 0.3) + 
                  (Number(trip.diem_bai_thu_hoach || 0) * 0.3) + 
                  (Number(trip.diem_bao_cao_tqnm || 0) * 0.4) + 
                  Number(trip.diem_cong || 0);
    return Math.min(10, score).toFixed(1);
  };

  let finalScore = '-';
  if (termGrade?.diem_tong_ket !== null && termGrade?.diem_tong_ket !== undefined) {
    finalScore = Number(termGrade.diem_tong_ket).toFixed(1);
  } else if (grades.length > 0) {
    const validGrades = grades.filter(t => calculateTripScore(t) !== '-');
    if (validGrades.length > 0) {
      const sum = validGrades.reduce((acc, t) => acc + Number(calculateTripScore(t)), 0);
      finalScore = (sum / validGrades.length).toFixed(1);
    }
  }
  
  const isScoreLocked = termGrade?.diem_tong_ket !== null && termGrade?.diem_tong_ket !== undefined;
  const isPassed =
    termGrade?.trang_thai === 'Dat' ||
    termGrade?.ket_qua === 'Dat' ||
    (finalScore !== '-' && Number(finalScore) >= 5.0);

  const getTripResult = (trip) => {
    if (!trip) return 'ChoDiem';
    
    // 1. Nếu sinh viên có kết quả học phần Đạt: TẤT CẢ các chuyến đều hiển thị Đạt
    const isOverallPassed = 
      termGrade?.trang_thai === 'Dat' || 
      termGrade?.ket_qua === 'Dat' || 
      (isScoreLocked && isPassed) || 
      (finalScore !== '-' && isPassed);

    if (isOverallPassed) {
      return 'Dat';
    }

    // 2. Nếu sinh viên có kết quả học phần Không đạt: TẤT CẢ các chuyến đều hiển thị Không đạt
    const isOverallFailed = 
      termGrade?.trang_thai === 'KhongDat' || 
      termGrade?.ket_qua === 'KhongDat' || 
      (isScoreLocked && !isPassed) || 
      (finalScore !== '-' && !isPassed);

    if (isOverallFailed) {
      return 'KhongDat';
    }

    // 3. Nếu chưa có kết quả chung của đợt: Hiển thị theo tiến độ chấm từng chuyến
    if (trip.ket_qua === 'Dat' || trip.ket_qua === 'KhongDat') {
      return trip.ket_qua;
    }
    const tripScore = calculateTripScore(trip);
    if (tripScore !== '-') {
      return Number(tripScore) >= 5.0 ? 'Dat' : 'KhongDat';
    }
    return 'ChoDiem';
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-bold">
        Đang tải dữ liệu điểm...
      </div>
    );
  }

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      
      {/* Header and Cohort Switcher */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kết quả & điểm</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tiến độ chấm điểm và kết quả tổng kết học phần kiến tập
          </p>
        </div>

        {/* Multi-cohort Tabs / Attempt Switcher */}
        {cohorts.length > 1 && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#E7E0C4] shadow-sm flex-wrap">
            <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#407F3E]" />
              Lần học:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {cohorts.map((c, idx) => {
                const isActive = idx === selectedCohortIndex;
                const isPassed = c.trang_thai === 'Dat' || c.ket_qua === 'Dat';
                const isFailed = c.trang_thai === 'KhongDat' || c.ket_qua === 'KhongDat';
                const label = c.is_hoc_lai ? `Học lại (Lần ${c.lan_dang_ky})` : 'Lần 1';

                return (
                  <button
                    key={c.id || idx}
                    onClick={() => setSelectedCohortIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#407F3E] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {c.is_hoc_lai ? (
                      <RotateCcw className={`w-3 h-3 ${isActive ? 'text-white' : 'text-amber-600'}`} />
                    ) : (
                      <Calendar className="w-3 h-3" />
                    )}
                    <span>{label}</span>
                    {idx === 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#407F3E]/10 text-[#407F3E]'
                      }`}>
                        Mới nhất
                      </span>
                    )}
                    {isPassed && <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#89B449]'}`} />}
                    {isFailed && <XCircle className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-rose-500'}`} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top Summary Card */}
      <div className="bg-[#407F3E] rounded-2xl p-8 lg:p-10 shadow-lg relative overflow-hidden mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Decorative Background Icon */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-8 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex-1">
          {/* Metadata badges of the cohort */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              {termGrade?.ten_dot || 'Đợt kiến tập'}
            </span>
            {termGrade?.ten_hoc_ky && (
              <span className="text-white/90 text-xs font-medium bg-white/10 px-2.5 py-1 rounded-md">
                {termGrade.ten_hoc_ky} {termGrade.nam_hoc ? `(${termGrade.nam_hoc})` : ''}
              </span>
            )}
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-sm ${
              termGrade?.is_hoc_lai ? 'bg-amber-300 text-slate-900' : 'bg-white/20 text-white'
            }`}>
              {termGrade?.is_hoc_lai ? `Học lại (Lần ${termGrade.lan_dang_ky})` : 'Lần học 1'}
            </span>
          </div>

          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">
            Điểm tổng kết học phần
          </p>
          
          <div className="flex items-center flex-wrap gap-4 mt-2">
            {isScoreLocked ? (
              <>
                <span className="text-6xl md:text-7xl font-black text-white leading-none tracking-tighter">
                  {finalScore}
                </span>
                <span className="text-white/50 text-3xl font-black mt-4">/10</span>
                
                {/* Status Pill */}
                <div className={`ml-4 mt-2 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm border border-white/20 ${isPassed ? 'bg-[#89B449] text-white' : 'bg-[#E68A8C] text-white'}`}>
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {isPassed ? 'Đạt' : 'Không đạt'}
                </div>
              </>
            ) : (
              <div className="flex items-center flex-wrap gap-4 mt-2">
                <span className="text-6xl md:text-7xl font-black text-white leading-none tracking-tighter">
                  {finalScore}
                </span>
                <span className="text-white/50 text-3xl font-black mt-4">/10</span>
                
                <div className="ml-4 mt-2 px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm border border-[#DBD468]/30 bg-[#DBD468] text-slate-800">
                  <AlertCircle className="w-5 h-5" />
                  Đang chờ khóa điểm
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info text right */}
        {isScoreLocked && (
          <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white/90 text-sm max-w-[280px]">
            <p className="font-bold mb-1">Quy chế tính điểm:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
              <li>Điểm trung bình cộng các chuyến đi được chọn báo cáo hội đồng.</li>
              <li>Yêu cầu: Tổng điểm &ge; 5.0 để đạt học phần.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Alert banner when viewing past cohort */}
      {selectedCohortIndex > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-4 text-amber-900 text-sm animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span>Bạn đang xem lại lịch sử bảng điểm của <strong>{termGrade?.ten_dot || `Lần ${termGrade?.lan_dang_ky || 1}`}</strong>.</span>
              <p className="text-xs text-amber-700 mt-0.5">Kết quả này thuộc đợt học trước và không ảnh hưởng đến tiến độ của đợt học lại hiện tại.</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCohortIndex(0)}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-[#407F3E] text-white text-xs font-bold hover:bg-[#346632] transition-colors shadow-sm"
          >
            Về đợt hiện tại
          </button>
        </div>
      )}

      {/* Detailed Grades Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="p-6 border-b border-[#E7E0C4] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-800">Chi tiết điểm theo từng chuyến</h2>
          {termGrade?.ten_dot && (
            <span className="text-xs text-slate-500 font-medium">
              Thuộc {termGrade.ten_dot} ({termGrade.is_hoc_lai ? `Học lại lần ${termGrade.lan_dang_ky}` : 'Lần 1'})
            </span>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 pl-6 w-[22%]">Nhà máy</th>
                <th className="p-4 text-center">Điểm chuẩn bị<br/><span className="text-[10px] font-medium text-slate-600 normal-case">(30%)</span></th>
                <th className="p-4 text-center">Điểm bài thu hoạch<br/><span className="text-[10px] font-medium text-slate-600 normal-case">(30%)</span></th>
                <th className="p-4 text-center">Điểm báo cáo TQNM<br/><span className="text-[10px] font-medium text-slate-600 normal-case">(40%)</span></th>
                <th className="p-4 text-center">Điểm cộng</th>
                <th className="p-4 text-center bg-[#E7E0C4]/70">Điểm chuyến</th>
                <th className="p-4 text-center pr-6">Kết quả</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {grades.map((trip) => {
                const tripScore = calculateTripScore(trip);
                const result = getTripResult(trip);
                return (
                  <tr key={trip.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-slate-800">
                      {trip.ten_nha_may || 'Chưa xác định'}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {trip.diem_chuan_bi !== null && trip.diem_chuan_bi !== undefined ? (
                        <span className="font-semibold text-slate-800">{Number(trip.diem_chuan_bi).toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-400 font-normal text-xs" title="Chờ giảng viên dẫn đoàn chốt điểm">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {trip.diem_bai_thu_hoach !== null && trip.diem_bai_thu_hoach !== undefined ? (
                        <span className="font-semibold text-slate-800">{Number(trip.diem_bai_thu_hoach).toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-400 font-normal text-xs" title="Chờ giảng viên hướng dẫn chốt điểm">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {trip.diem_bao_cao_tqnm !== null && trip.diem_bao_cao_tqnm !== undefined ? (
                        <span className="font-semibold text-slate-800">{Number(trip.diem_bao_cao_tqnm).toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-400 font-normal text-xs" title="Chờ hội đồng chấm báo cáo">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {trip.diem_cong !== null && trip.diem_cong !== undefined ? (
                        Number(trip.diem_cong) > 0 ? (
                          <span className="text-[#407F3E] font-bold">+{Number(trip.diem_cong).toFixed(1)}</span>
                        ) : (
                          <span className="text-slate-600 font-medium">0</span>
                        )
                      ) : (
                        <span className="text-slate-400 font-normal text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                      <span className="text-xl font-black text-[#407F3E]">
                        {tripScore}
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      {result === 'Dat' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#89B449]/15 text-[#407F3E] border border-[#89B449]/30 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đạt
                        </span>
                      )}
                      {result === 'KhongDat' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 shadow-sm">
                          <XCircle className="w-3.5 h-3.5" />
                          Không đạt
                        </span>
                      )}
                      {result === 'ChoDiem' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                          <Clock className="w-3.5 h-3.5" />
                          Chờ chốt điểm
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State Fallback */}
        {grades.length === 0 && (
          <div className="p-10 text-center flex flex-col items-center justify-center bg-slate-50">
            <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">Chưa có dữ liệu chuyến đi cho đợt này.</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng hoàn thành nộp bài báo cáo để giảng viên chấm điểm.</p>
          </div>
        )}
      </div>

    </div>
  );
}
