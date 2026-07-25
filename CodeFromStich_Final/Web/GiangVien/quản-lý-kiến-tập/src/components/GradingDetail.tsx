import React, { useState } from 'react';
import { Student } from '../types';

interface GradingDetailProps {
  student: Student;
  onSaveGrade: (mssv: string, score: number, comments: string) => void;
  onBack: () => void;
}

export default function GradingDetail({ student, onSaveGrade, onBack }: GradingDetailProps) {
  const [score, setScore] = useState<string>(student.preparatoryGrade ? student.preparatoryGrade.toString() : '8.5');
  const [comments, setComments] = useState<string>(
    student.notes || 'Báo cáo có cấu trúc rõ ràng, hình vẽ minh họa sơ đồ quy trình chi tiết và trực quan. Trình bày sạch đẹp, có chiều sâu phân tích kỹ thuật.'
  );
  const [showExplanation, setShowExplanation] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      alert('Vui lòng nhập điểm hợp lệ từ 0 đến 10.');
      return;
    }
    onSaveGrade(student.mssv, numScore, comments);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onBack();
    }, 1500);
  };

  const handleRequestEdit = () => {
    alert(`Đã gửi yêu cầu chỉnh sửa báo cáo đến sinh viên ${student.name}. Sinh viên sẽ nhận được thông báo để bổ sung.`);
    onBack();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in select-none relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 right-8 bg-[#266528] text-white px-6 py-3.5 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-semibold animate-bounce border-2 border-white/20">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          Đã lưu điểm thành công cho {student.name}!
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
        <button onClick={onBack} className="hover:text-primary transition-colors">Trang chủ</button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <button onClick={onBack} className="hover:text-primary transition-colors">Sinh viên hướng dẫn</button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191d17]">Chấm bài: {student.name}</span>
      </div>

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
            {student.name.split(' ').pop()?.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
              {student.name}
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-1 flex items-center gap-4">
              <span>MSSV: <strong className="font-mono text-on-surface">{student.mssv}</strong></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              <span>Lớp: <strong className="font-mono text-on-surface">{student.class}</strong></span>
            </p>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface font-semibold flex items-center gap-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Quay lại danh sách
        </button>
      </div>

      {/* Columns: Report Viewer (Left) & Grading / AI Helper (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: PDF Report Viewer (7 cols) */}
        <div className="xl:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-150 overflow-hidden">
          <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-400">picture_as_pdf</span>
              <span>BaoCao_KienTap_Heineken_NguyenThiThuHa.pdf</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span>Trang 1 / 4</span>
              <div className="h-4 w-[1px] bg-slate-600"></div>
              <button onClick={() => alert('Đang tải tài liệu gốc...')} className="hover:text-white transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">download</span> Tải xuống
              </button>
            </div>
          </div>

          {/* Actual Mock PDF Document Canvas */}
          <div className="p-12 bg-slate-100 overflow-y-auto max-h-[700px] flex justify-center">
            <div className="bg-white w-full max-w-[595px] min-h-[842px] shadow-lg p-12 text-[#1c1c1c] flex flex-col justify-between border border-slate-200 select-text">
              {/* Report Header */}
              <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6 shrink-0">
                <p className="font-bold text-xs uppercase tracking-wider">TRƯỜNG ĐẠI HỌC ABC</p>
                <p className="font-bold text-[13px] uppercase tracking-wider">KHOA CÔNG NGHỆ THÔNG TIN &amp; TRUYỀN THÔNG</p>
                <div className="w-20 h-0.5 bg-slate-900 mx-auto my-3"></div>
                <h2 className="font-black text-lg uppercase tracking-tight py-4 leading-normal">
                  BÁO CÁO THU HOẠCH KIẾN TẬP DOANH NGHIỆP
                </h2>
                <p className="text-sm font-semibold italic">Đơn vị kiến tập: Công ty TNHH Nhà Máy Bia Heineken Việt Nam</p>
              </div>

              {/* Report Content */}
              <div className="flex-1 py-8 space-y-6 text-[12px] leading-relaxed text-justify">
                <div>
                  <h3 className="font-bold text-sm uppercase mb-2 border-b border-slate-200 pb-1">I. Giới thiệu tổng quan doanh nghiệp</h3>
                  <p>
                    Nhà máy Bia Heineken Việt Nam là một trong những cơ sở sản xuất bia hiện đại bậc nhất khu vực Đông Nam Á. Được thành lập và vận hành dưới sự chuyển giao quy trình nghiêm ngặt, nhà máy luôn cam kết chất lượng sản phẩm chuẩn quốc tế đi đôi với phát triển bền vững, giảm thiểu khí thải cacbon, tuần hoàn nguồn nước.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm uppercase mb-2 border-b border-slate-200 pb-1">II. Quy trình công nghệ &amp; Dây chuyền sản xuất</h3>
                  <p>
                    Trong chuyến kiến tập, nhóm chúng em được tham quan thực tế quy trình khép kín bao gồm: chuẩn bị nguyên liệu (lúa mạch bóc vỏ, hoa bia hảo hạng), ủ nấm men đặc trưng Heineken A-yeast, lên men sơ cấp và thứ cấp trong bồn chứa khổng lồ nằm ngang, lọc ép li tâm ly trích cặn lắng, và cuối cùng là hệ thống chiết chai/lon đạt công suất hàng chục ngàn sản phẩm mỗi giờ. Toàn bộ các công đoạn được giám sát nghiêm ngặt qua hệ thống điều khiển trung tâm SCADA tiên tiến nhất.
                  </p>
                  <p className="mt-2 italic text-slate-500 text-center font-medium">
                    (Hình 1.1: Mô hình hóa quy trình tự động hóa dòng chất từ bồn ủ đến tháp lọc)
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm uppercase mb-2 border-b border-slate-200 pb-1">III. Bài học thu hoạch và đánh giá</h3>
                  <p>
                    Qua chuyến đi, em không chỉ hiểu sâu sắc về mặt kỹ thuật cơ điện tử và tự động hóa công nghiệp mà còn học hỏi được văn hóa tác phong làm việc kỷ luật, an toàn lao động tuyệt đối (Safety First) tại nhà máy Heineken. Việc tổ chức luồng logistics vận chuyển vỏ chai rỗng quay vòng tái chế cũng mang lại bài học lớn về kinh tế xanh tuần hoàn.
                  </p>
                </div>
              </div>

              {/* Report Footer signatures */}
              <div className="border-t border-slate-200 pt-6 flex justify-between text-[11px] shrink-0">
                <div>
                  <p className="font-bold text-slate-500 uppercase">Giảng viên hướng dẫn</p>
                  <p className="font-bold mt-12 text-slate-900">ThS. Nguyễn Văn A</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-500 uppercase">Sinh viên thực hiện</p>
                  <p className="font-bold mt-12 text-slate-900">Nguyễn Thị Thu Hà</p>
                  <p className="text-slate-500 font-mono">MSSV: 20123456</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Feedback & Manual Score Entry (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          {/* AI Suggestion Box */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-emerald-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
              <span className="material-symbols-outlined text-[120px] text-primary">auto_awesome</span>
            </div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <h2 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wider">AI chấm điểm đề xuất</h2>
            </div>

            <div className="flex items-baseline gap-2 mb-3 relative z-10">
              <span className="text-[52px] font-black text-emerald-800 leading-none">8.0</span>
              <span className="text-emerald-600 text-sm font-bold">/ 10</span>
            </div>

            <p className="text-emerald-900 text-xs font-semibold leading-relaxed mb-4 relative z-10">
              Hệ thống AI (Gemini 2.5 Flash) phân tích nội dung bài viết đạt chuẩn cấu trúc học thuật, mô tả đúng chu kỳ ủ lên men, và có tính liên hệ thực tiễn cao.
            </p>

            <button 
              onClick={() => setShowExplanation(true)}
              className="px-4 py-2 bg-emerald-850 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1 relative z-10"
            >
              <span className="material-symbols-outlined text-[16px]">info</span> Xem giải thích chi tiết
            </button>
          </div>

          {/* Manual Grading Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
            <h2 className="font-extrabold text-sm text-[#191d17] uppercase tracking-wider">Phiếu chấm điểm của Giảng viên</h2>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Điểm báo cáo (Hệ 10)</label>
              <div className="relative max-w-[140px]">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-4 py-3 font-mono font-black text-xl text-primary bg-[#f8faf1] border border-slate-200 rounded-xl focus:outline-none focus:border-primary/50 text-center"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">/ 10</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nhận xét &amp; Góp ý</label>
              <textarea
                rows={5}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Nhập nhận xét chi tiết..."
                className="w-full p-4 text-sm bg-[#f8faf1] border border-slate-200 rounded-xl focus:outline-none focus:border-primary/50 text-on-surface font-medium leading-relaxed resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleRequestEdit}
                className="w-full py-3 border-2 border-[#E68A8C] hover:bg-red-50 text-red-600 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span> Yêu cầu chỉnh sửa
              </button>
              <button
                onClick={handleSave}
                className="w-full py-3 bg-primary hover:bg-[#1a4b1c] text-white font-extrabold text-xs rounded-xl shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">save</span> Lưu điểm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rubric Breakdown Modal / Popup */}
      {showExplanation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-150 overflow-hidden select-none">
            <div className="bg-emerald-850 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white text-[24px]">auto_awesome</span>
                <h3 className="font-extrabold text-base">Phân tích tiêu chí chấm từ AI</h3>
              </div>
              <button 
                onClick={() => setShowExplanation(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white flex items-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                Sau đây là chi tiết điểm phân tích tự động dựa trên cấu trúc đề cương và biểu điểm tiêu chuẩn của khoa:
              </p>

              {/* Rubric Criteria */}
              <div className="space-y-4">
                {/* Rule 1 */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-xs text-on-surface">1. Bố cục &amp; Hình thức trình bày</h4>
                    <span className="font-mono font-bold text-xs text-emerald-800">2.0 / 2.0 đ</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-medium leading-normal">
                    Trình bày chuyên nghiệp, đúng phông chữ quy định, căn đều lề. Đầy đủ các chữ ký phê duyệt từ giảng viên hướng dẫn.
                  </p>
                </div>

                {/* Rule 2 */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-xs text-on-surface">2. Quy trình &amp; Kiến thức Công nghệ</h4>
                    <span className="font-mono font-bold text-xs text-emerald-800">4.0 / 5.0 đ</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-medium leading-normal">
                    Mô tả chính xác cơ chế hoạt động của buồng lên men dầy và tháp lọc li tâm Heineken. Thiếu một phần nhỏ sơ đồ dòng chảy bao quát của bộ phận xử lý bã hoa bia.
                  </p>
                </div>

                {/* Rule 3 */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-xs text-on-surface">3. Nhận xét &amp; Bài học thu hoạch</h4>
                    <span className="font-mono font-bold text-xs text-emerald-800">2.0 / 3.0 đ</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-medium leading-normal">
                    Có ý thức học hỏi cao, nhận xét đúng tinh thần tác phong công nghiệp. Cần bổ sung nhận định mang tính tự quản lý nghề nghiệp cá nhân cụ thể hơn nữa.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowExplanation(false)}
                  className="px-5 py-2.5 bg-primary hover:bg-[#1f5121] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Đóng lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
