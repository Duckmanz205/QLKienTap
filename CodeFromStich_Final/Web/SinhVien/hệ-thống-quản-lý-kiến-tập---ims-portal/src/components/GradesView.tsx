import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle, 
  Award, 
  Star, 
  ChevronRight, 
  Building,
  BarChart2,
  Info
} from 'lucide-react';
import { gradeItems } from '../data/mockData';

export default function GradesView() {
  const [selectedTripId, setSelectedTripId] = useState<string>('1');

  // GPA calculation
  const totalScore = gradeItems.reduce((acc, item) => acc + item.total, 0);
  const averageGPA = (totalScore / gradeItems.length).toFixed(2);

  const activeGrade = gradeItems.find(g => g.id === selectedTripId) || gradeItems[0];

  return (
    <div className="space-y-6">
      {/* View Title */}
      <div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">Kết quả & điểm</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">
          Theo dõi bảng tổng kết điểm kiến tập học phần thực địa của bạn, bao gồm các thành phần chuẩn bị, viết báo cáo thu hoạch và điểm cộng tham gia chuyên cần.
        </p>
      </div>

      {/* Overview GPA Card Panel */}
      <div className="bg-white rounded-3xl border border-surface-muted/40 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-primary/5 rounded-full blur-2xl group-hover:scale-120 transition-transform duration-700"></div>
        
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#e5ffdc] flex items-center justify-center text-primary shadow-inner">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div>
            <div className="text-[10px] text-on-surface-variant font-black tracking-widest uppercase mb-1">Tổng kết học phần</div>
            <h2 className="text-xl md:text-2xl font-black text-on-surface flex items-baseline gap-2">
              <span>Điểm tổng kết:</span>
              <span className="text-3xl text-primary font-black">{averageGPA}</span>
              <span className="text-sm text-on-surface-variant">/ 10</span>
            </h2>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">Đợt kiến tập Học kỳ I - Năm học 2023-2024</p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5ffdc] text-primary border border-primary/20 rounded-2xl text-xs font-black tracking-wider uppercase shadow-sm">
            <CheckCircle className="w-4 h-4" />
            <span>ĐẠT HỌC PHẦN</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-warning-yellow/15 text-yellow-700 border border-warning-yellow/30 rounded-2xl text-xs font-black tracking-wider uppercase shadow-sm">
            <Award className="w-4 h-4" />
            <span>XUẤT SẮC (Top 5%)</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Score Table Left, Visualization Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Grade Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-surface-muted/40 shadow-sm p-6 flex flex-col">
          <h2 className="font-bold text-base text-on-surface flex items-center gap-2 mb-6">
            <Building className="w-5 h-5 text-primary" />
            <span>Chi tiết điểm theo từng chuyến</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-container">
                  <th className="py-4 px-4">Nhà máy</th>
                  <th className="py-4 px-4 text-center">Chuẩn bị</th>
                  <th className="py-4 px-4 text-center">Báo cáo</th>
                  <th className="py-4 px-4 text-center">Cộng</th>
                  <th className="py-4 px-4 text-center">Tổng điểm</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold divide-y divide-surface-container/50">
                {gradeItems.map((item) => {
                  const isSelected = selectedTripId === item.id;
                  return (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedTripId(item.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-primary/5 hover:bg-primary/10 font-black' 
                          : 'hover:bg-surface-container-low'
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
                          }`}>{item.factory}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-medium text-on-surface-variant">{item.prepare.toFixed(1)}</td>
                      <td className="py-4 px-4 text-center font-medium text-on-surface-variant">{item.report.toFixed(1)}</td>
                      <td className="py-4 px-4 text-center text-[#476d01]">{item.bonus > 0 ? `+${item.bonus.toFixed(1)}` : '0'}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 bg-[#e5ffdc] text-primary rounded-lg shadow-sm border border-primary/10">
                          {item.total.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t border-surface-container flex justify-between items-center text-xs text-on-surface-variant font-bold bg-[#f8faf1]/50 p-3 rounded-xl">
            <span className="flex items-center gap-1">
              <Info className="w-4 h-4 text-primary" />
              <span>Công thức tính: Tổng điểm = (Chuẩn bị * 0.3) + (Báo cáo * 0.7) + Điểm cộng</span>
            </span>
            <span className="text-primary">Trung bình: {averageGPA}/10</span>
          </div>
        </div>

        {/* Right Column: Visualization Custom Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-surface-muted/40 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-base text-on-surface flex items-center gap-2 mb-2">
              <BarChart2 className="w-5 h-5 text-secondary" />
              <span>Phân bổ điểm chi tiết</span>
            </h2>
            <p className="text-xs text-on-surface-variant font-semibold mb-6">
              Xem tỷ trọng và so sánh điểm thành phần của chuyến: <span className="font-black text-primary uppercase">{activeGrade.factory}</span>
            </p>

            {/* Custom Interactive Bars */}
            <div className="space-y-5">
              {/* Factor 1: Chuẩn bị */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                  <span>Chuẩn bị (Tác phong, chuyên cần)</span>
                  <span className="text-primary font-black">{activeGrade.prepare} / 10</span>
                </div>
                <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full bg-[#89B449] rounded-full transition-all duration-500 flex items-center justify-end pr-2" 
                    style={{ width: `${activeGrade.prepare * 10}%` }}
                  >
                    <span className="text-[9px] text-white font-black leading-none">{activeGrade.prepare * 10}%</span>
                  </div>
                </div>
              </div>

              {/* Factor 2: Báo cáo */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                  <span>Bài thu hoạch (Nội dung & Thể thức)</span>
                  <span className="text-primary font-black">{activeGrade.report} / 10</span>
                </div>
                <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500 flex items-center justify-end pr-2" 
                    style={{ width: `${activeGrade.report * 10}%` }}
                  >
                    <span className="text-[9px] text-white font-black leading-none">{activeGrade.report * 10}%</span>
                  </div>
                </div>
              </div>

              {/* Factor 3: Nhận xét */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                  <span>Phản biện & Nhận định (Giáo viên chấm)</span>
                  <span className="text-primary font-black">{activeGrade.feedback.toFixed(1)} / 10</span>
                </div>
                <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full bg-secondary rounded-full transition-all duration-500 flex items-center justify-end pr-2" 
                    style={{ width: `${activeGrade.feedback * 10}%` }}
                  >
                    <span className="text-[9px] text-white font-black leading-none">{activeGrade.feedback * 10}%</span>
                  </div>
                </div>
              </div>

              {/* Factor 4: Điểm cộng */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                  <span>Điểm thưởng (Leader, hoạt động nổi bật)</span>
                  <span className="text-primary font-black">{activeGrade.bonus} điểm</span>
                </div>
                <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full bg-warning-yellow rounded-full transition-all duration-500 flex items-center justify-end pr-2" 
                    style={{ width: `${activeGrade.bonus * 10}%` }}
                  >
                    {activeGrade.bonus > 0 && (
                      <span className="text-[9px] text-[#191d17] font-black leading-none">{activeGrade.bonus * 10}%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-[#f8faf1] border border-surface-muted p-4 rounded-2xl">
            <h3 className="font-bold text-xs text-on-surface mb-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-warning-yellow fill-warning-yellow" />
              <span>Đánh giá của cố vấn đoàn</span>
            </h3>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic">
              "Sinh viên Nguyễn Văn A có thái độ thực địa chuyên nghiệp, tuân thủ đúng nội quy tham quan và tích cực ghi chép phản biện thông tin trong dây chuyền sản xuất của Acecook. Bài báo cáo trình bày khoa học, chính xác."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
