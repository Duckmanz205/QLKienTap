import React, { useState } from 'react';
import { 
  GraduationCap, BookOpen, AlertCircle, CheckCircle2, XCircle
} from 'lucide-react';

export default function KetQua_Diem_SV() {
  
  // Mock Data
  const isScoreLocked = true; // Toggle this to false to see the "Đang chờ khóa điểm" state
  const finalScore = 8.4;
  const isPassed = finalScore >= 5.0;

  const tripGrades = [
    {
      id: 1,
      nhaMay: 'Nhà máy Yakult HCM',
      diemChuanBi: 8.0,
      diemBaiThuHoach: 8.5,
      diemBaoCao: 8.0,
      diemCong: 0.5,
    },
    {
      id: 2,
      nhaMay: 'Acecook Việt Nam',
      diemChuanBi: 9.0,
      diemBaiThuHoach: 7.5,
      diemBaoCao: 8.5,
      diemCong: 0.0,
    },
    {
      id: 3,
      nhaMay: 'Vinamilk Bình Dương',
      diemChuanBi: 8.5,
      diemBaiThuHoach: 9.0,
      diemBaoCao: 9.0,
      diemCong: 1.0,
    }
  ];

  // Logic to calculate individual trip score
  // Assuming weights: Chuẩn bị (30%), Bài thu hoạch (30%), Báo cáo (40%) + Điểm cộng
  const calculateTripScore = (trip) => {
    const score = (trip.diemChuanBi * 0.3) + (trip.diemBaiThuHoach * 0.3) + (trip.diemBaoCao * 0.4) + trip.diemCong;
    return score > 10 ? 10 : score.toFixed(1);
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Kết quả & điểm</h1>
      </div>

      {/* Top Summary Card */}
      <div className="bg-[#407F3E] rounded-2xl p-8 lg:p-10 shadow-lg relative overflow-hidden mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Decorative Background Icon */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-8 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex-1">
          <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Điểm tổng kết học phần
          </p>
          
          <div className="flex items-center flex-wrap gap-4 mt-2">
            {isScoreLocked ? (
              <>
                <span className="text-6xl md:text-7xl font-black text-white leading-none tracking-tighter">
                  {finalScore.toFixed(1)}
                </span>
                <span className="text-white/50 text-3xl font-black mt-4">/10</span>
                
                {/* Status Pill */}
                <div className={`ml-4 mt-2 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm border border-white/20 ${isPassed ? 'bg-[#89B449] text-white' : 'bg-[#E68A8C] text-white'}`}>
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {isPassed ? 'Đạt' : 'Không đạt'}
                </div>
              </>
            ) : (
              <div className="mt-4 px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm border border-[#DBD468]/30 bg-[#DBD468] text-slate-800">
                <AlertCircle className="w-5 h-5" />
                Đang chờ khóa điểm
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

      {/* Detailed Grades Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="p-6 border-b border-[#E7E0C4] bg-white">
          <h2 className="text-lg font-bold text-slate-800">Chi tiết điểm theo từng chuyến</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 pl-6 w-[25%]">Nhà máy</th>
                <th className="p-4 text-center">Điểm chuẩn bị<br/><span className="text-[10px] font-medium text-slate-600 normal-case">(30%)</span></th>
                <th className="p-4 text-center">Điểm bài thu hoạch<br/><span className="text-[10px] font-medium text-slate-600 normal-case">(30%)</span></th>
                <th className="p-4 text-center">Điểm báo cáo TQNM<br/><span className="text-[10px] font-medium text-slate-600 normal-case">(40%)</span></th>
                <th className="p-4 text-center">Điểm cộng</th>
                <th className="p-4 text-center pr-6 bg-[#E7E0C4]/70">Điểm chuyến</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {tripGrades.map((trip) => {
                const tripScore = calculateTripScore(trip);
                return (
                  <tr key={trip.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-slate-800">
                      {trip.nhaMay}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {trip.diemChuanBi ? trip.diemChuanBi.toFixed(1) : '-'}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {trip.diemBaiThuHoach ? trip.diemBaiThuHoach.toFixed(1) : '-'}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {trip.diemBaoCao ? trip.diemBaoCao.toFixed(1) : '-'}
                    </td>
                    <td className="p-4 text-center font-medium text-[#89B449]">
                      {trip.diemCong > 0 ? `+${trip.diemCong.toFixed(1)}` : '-'}
                    </td>
                    <td className="p-4 text-center pr-6 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                      <span className="text-xl font-black text-[#407F3E]">
                        {tripScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State Fallback (Optional, shown if no trips selected yet) */}
        {tripGrades.length === 0 && (
          <div className="p-10 text-center flex flex-col items-center justify-center bg-slate-50">
            <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">Chưa có dữ liệu điểm.</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng hoàn thành nộp bài báo cáo để giảng viên chấm điểm.</p>
          </div>
        )}
      </div>

    </div>
  );
}
