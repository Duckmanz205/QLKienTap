import React from 'react';
import { Trip } from '../types';

interface StudentHomeAndFinanceProps {
  view: string;
  trips: Trip[];
  onViewChange: (view: string) => void;
}

export default function StudentHomeAndFinance({ view, trips, onViewChange }: StudentHomeAndFinanceProps) {
  
  if (view === 'student-dashboard') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in select-none">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-primary-container to-[#266528] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
            <span className="material-symbols-outlined text-[320px]">school</span>
          </div>
          
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">Cổng sinh viên</span>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">Chào mừng Nguyễn Văn A đến với Cổng kiến tập nghề nghiệp!</h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Hãy kiểm tra lịch trình đưa đón, hoàn tất báo cáo nghiên cứu trước chuyến đi và nộp bài thu hoạch đúng hạn để nhận đánh giá tối ưu từ hội đồng giảng viên.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button 
                onClick={() => onViewChange('lich-trinh-doan')}
                className="px-5 py-2.5 bg-white text-primary hover:bg-[#f8faf1] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span> Xem lịch di chuyển
              </button>
              <button 
                onClick={() => onViewChange('nop-bai-thu-hoach')}
                className="px-5 py-2.5 bg-[#DBD468] text-[#191d17] hover:bg-[#cbd45d] font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Nộp bài thu hoạch ngay
              </button>
            </div>
          </div>
        </div>

        {/* Quick Bento Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#266528] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px] fill-current">verified</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Trạng thái rèn luyện</p>
              <p className="text-[#191d17] text-lg font-extrabold mt-0.5">Tốt (Đã đi 2/3 chuyến)</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#7c7515] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">pending_actions</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Bài thu hoạch</p>
              <p className="text-[#191d17] text-lg font-extrabold mt-0.5">1 bài chờ chấm điểm</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">payments</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Học phí kiến tập</p>
              <p className="text-[#191d17] text-lg font-extrabold mt-0.5">Đã thanh toán đủ</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'chuyen-tham-quan') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Khám phá chuyến tham quan</h1>
          <p className="text-on-surface-variant font-medium mt-1">Các doanh nghiệp liên kết tài trợ đón tiếp đoàn sinh viên trường trong học kỳ này</p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-slate-150 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div>
                <div 
                  className="h-44 bg-cover bg-center border-b border-slate-100 relative"
                  style={{ backgroundImage: `url('${trip.image}')` }}
                >
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded text-[10px] font-extrabold text-primary">
                    {trip.type === 'direct' ? 'Trực tiếp' : 'Trực tuyến'}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-extrabold text-base text-on-surface leading-tight group-hover:text-primary transition-colors">
                    {trip.factoryName}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {trip.address}
                  </p>
                  <p className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">groups</span>
                    Sức chứa tối đa: <strong className="text-on-surface">{trip.maxStudents} sinh viên</strong>
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button 
                  onClick={() => alert(`Bạn đã được tự động đăng ký tham gia chuyến đi tại ${trip.factoryName} theo danh sách lớp.`)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary text-on-surface-variant font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                  Xem chi tiết đăng ký
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'ket-qua-diem') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Kết quả rèn luyện &amp; điểm</h1>
          <p className="text-on-surface-variant font-medium mt-1">Bảng tổng hợp điểm quá trình, điểm báo cáo thu hoạch và ý kiến đánh giá từ giảng viên hướng dẫn</p>
        </div>

        {/* Gradesheet card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phiếu điểm học kỳ 1 - 2023</span>
            <span className="px-3 py-1 bg-green-50 text-[#266528] rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-200">Đã hoàn thành</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Box 1 */}
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-150">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Điểm chuẩn bị</p>
                <p className="text-2xl font-black text-primary font-mono mt-1">8.5</p>
              </div>

              {/* Box 2 */}
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-150">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Điểm cộng phát biểu</p>
                <p className="text-2xl font-black text-secondary font-mono mt-1">+0.5</p>
              </div>

              {/* Box 3 */}
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-150">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Báo cáo thu hoạch</p>
                <p className="text-2xl font-black text-primary font-mono mt-1">8.0</p>
              </div>
            </div>

            {/* Total score weight */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-extrabold text-sm text-[#191d17]">Tổng kết học phần Kiến tập Doanh nghiệp</h4>
                <p className="text-xs text-on-surface-variant font-medium">Trọng số: Điểm chuẩn bị 30% | Điểm cộng | Điểm báo cáo 70%</p>
              </div>
              <div className="bg-[#266528] text-white px-6 py-3 rounded-2xl flex items-baseline gap-1.5 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Tổng kết:</span>
                <span className="text-2xl font-black font-mono">8.7</span>
                <span className="text-xs text-white/80 font-bold">/ 10</span>
              </div>
            </div>

            {/* Lecturer comment */}
            <div className="p-4 bg-emerald-500/5 border border-primary/10 rounded-xl space-y-1.5">
              <h5 className="font-bold text-xs text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">rate_review</span> Nhận xét từ ThS. Nguyễn Văn A
              </h5>
              <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
                "Sinh viên đi đầy đủ các chuyến thực tế, chuẩn bị bài tốt. Báo cáo thu hoạch có đầu tư nghiên cứu sơ đồ thiết bị nhà máy bia, trình bày đẹp đẽ. Tích cực tham gia đóng góp thảo luận."
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'thanh-toan') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Thanh toán học phí kiến tập</h1>
          <p className="text-on-surface-variant font-medium mt-1">Xem trạng thái đóng phí bảo hiểm, xe đưa đón và lệ phí thực tập liên kết</p>
        </div>

        {/* Invoice template */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-400">Mã hóa đơn: INV-2023-0982</p>
              <h3 className="font-extrabold text-base text-on-surface mt-1">Học phí kiến tập doanh nghiệp - Học kỳ 1</h3>
            </div>
            <span className="px-3.5 py-1.5 bg-green-50 text-green-700 font-extrabold text-xs uppercase rounded-xl border border-green-200 shrink-0">
              Đã thanh toán
            </span>
          </div>

          <div className="p-6 space-y-4 text-xs font-semibold text-on-surface-variant">
            <div className="flex justify-between border-b border-dashed border-slate-100 pb-2.5">
              <span>Học phí cơ bản chuyên ngành</span>
              <span className="font-mono text-on-surface">1,200,000 đ</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-100 pb-2.5">
              <span>Phí dịch vụ xe đưa đón chất lượng cao</span>
              <span className="font-mono text-on-surface">350,000 đ</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-100 pb-2.5">
              <span>Bảo hiểm tai nạn du lịch bắt buộc</span>
              <span className="font-mono text-on-surface">150,000 đ</span>
            </div>
            <div className="flex justify-between pt-2.5 font-bold text-sm text-on-surface">
              <span>Tổng tiền đã thu</span>
              <span className="font-mono text-primary font-black">1,700,000 đ</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'hoan-phi') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191d17] tracking-tight">Hoàn phí &amp; hỗ trợ tài chính</h1>
          <p className="text-on-surface-variant font-medium mt-1">Gửi yêu cầu hoặc tra cứu hoàn trả chi phí xe tự túc đối với các chuyến đi gần khu vực cư trú</p>
        </div>

        {/* Refund panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#7c7515] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#191d17]">Chưa có yêu cầu hoàn phí nào được tạo</h3>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                Theo quy định của trường, những sinh viên có hộ khẩu thường trú nằm cùng địa bàn quận/huyện của nhà máy tham quan được quyền làm đơn nhận lại phụ phí xe đưa đón trị giá <strong>150,000 đ / chuyến đi</strong>.
              </p>
            </div>
          </div>

          <button 
            onClick={() => alert('Đơn yêu cầu hoàn phí đã được ghi nhận trực tuyến. Phòng Kế hoạch Tài chính sẽ xem xét hồ sơ cư trú của bạn.')}
            className="px-4 py-2 bg-primary hover:bg-[#1a4b1c] text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors"
          >
            Tạo đơn hoàn phí tự túc di chuyển
          </button>
        </div>
      </div>
    );
  }

  return null;
}
