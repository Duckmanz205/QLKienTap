import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  FileText, 
  Sparkles, 
  ArrowLeft, 
  Download, 
  Check, 
  AlertTriangle,
  Info,
  ExternalLink,
  Search,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function ChamBaiThuHoach_GV() {
  const [lecturer, setLecturer] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Grading states
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');
  const [showAiBreakdown, setShowAiBreakdown] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchReports(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchReports = async (gvId) => {
    try {
      const res = await giangVienApi.getGuidedReports(gvId);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectReport = (rep) => {
    setSelectedReport(rep);
    setScore(rep.diem_bai_thu_hoach !== null && rep.diem_bai_thu_hoach !== undefined ? rep.diem_bai_thu_hoach.toString() : '8.0');
    setComments(rep.nhan_xet_gv || 'Báo cáo có cấu trúc rõ ràng, tổng hợp được đầy đủ quy trình sản xuất thực tế tại nhà máy. Trình bày khoa học.');
    setMessage('');
    setError('');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      alert('Vui lòng nhập điểm hợp lệ từ 0 đến 10.');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await giangVienApi.gradeReport({
        reportId: selectedReport.id,
        diemBaiThuHoach: numScore,
        nhanXet: comments
      });
      setMessage(res.data.message);
      
      // Refresh list and return back
      fetchReports(lecturer.id);
      setTimeout(() => {
        setSelectedReport(null);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu điểm báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  if (!lecturer) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải danh sách bài thu hoạch...
      </div>
    );
  }

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.phieuDangKy?.sinhVien?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phieuDangKy?.sinhVien?.mssv?.includes(searchTerm);
    
    if (statusFilter === 'graded') {
      return matchesSearch && r.trang_thai === 'DaCham';
    }
    if (statusFilter === 'pending') {
      return matchesSearch && r.trang_thai !== 'DaCham';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      {!selectedReport && (
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Chấm bài thu hoạch</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Đánh giá, nhận xét các bài báo cáo thu hoạch kiến tập sau chuyến đi của sinh viên bạn hướng dẫn.
          </p>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className="bg-[#e5ffdc] border border-primary/20 text-[#476d01] px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-750 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      {/* List vs Detail View Toggle */}
      {!selectedReport ? (
        /* Report List View */
        <div className="space-y-6 relative z-10">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-surface-variant/40 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Tìm sinh viên, MSSV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f8faf1] border border-surface-variant rounded-xl text-xs focus:border-primary focus:outline-none font-semibold text-on-surface"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${
                  statusFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-[#f8faf1] border border-surface-variant text-slate-600 hover:bg-[#ecefe6]'
                }`}
              >
                Tất cả ({reports.length})
              </button>
              <button 
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-primary text-white shadow-sm' : 'bg-[#f8faf1] border border-surface-variant text-slate-600 hover:bg-[#ecefe6]'
                }`}
              >
                Chờ chấm ({reports.filter(r => r.trang_thai !== 'DaCham').length})
              </button>
              <button 
                onClick={() => setStatusFilter('graded')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${
                  statusFilter === 'graded' ? 'bg-primary text-white shadow-sm' : 'bg-[#f8faf1] border border-surface-variant text-slate-600 hover:bg-[#ecefe6]'
                }`}
              >
                Đã chấm ({reports.filter(r => r.trang_thai === 'DaCham').length})
              </button>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-variant">
                    <th className="py-4 px-6">Sinh viên</th>
                    <th className="py-4 px-6">MSSV / Lớp</th>
                    <th className="py-4 px-6">Chuyến kiến tập</th>
                    <th className="py-4 px-6">Tập tin</th>
                    <th className="py-4 px-6">Ngày nộp</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        Không tìm thấy bài thu hoạch nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((r) => {
                      const isGraded = r.trang_thai === 'DaCham';
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-4 px-6">
                            <span className="font-bold text-on-surface">{r.phieuDangKy?.sinhVien?.ho_ten}</span>
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant font-mono text-xs">
                            {r.phieuDangKy?.sinhVien?.mssv} | {r.phieuDangKy?.sinhVien?.lop}
                          </td>
                          <td className="py-4 px-6 font-bold text-on-surface group-hover:text-primary transition-colors">
                            {r.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may}
                          </td>
                          <td className="py-4 px-6 text-xs text-primary font-mono truncate max-w-[150px]" title={r.bai_thu_hoach_url}>
                            {r.bai_thu_hoach_url || 'Báo cáo.pdf'}
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant font-medium">
                            {new Date(r.ngay_nop).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isGraded 
                                ? 'bg-primary/10 text-primary border border-primary/20' 
                                : 'bg-warning-yellow/15 text-yellow-750 border border-warning-yellow/30'
                            }`}>
                              <span>{isGraded ? `Đã chấm (${r.diem_bai_thu_hoach})` : 'Chờ chấm'}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleSelectReport(r)}
                              className="px-3.5 py-1.5 bg-primary text-white hover:bg-primary-container rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all active:scale-95 flex items-center gap-1 inline-flex"
                            >
                              <span>{isGraded ? 'Xem lại' : 'Chấm bài'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Report Grading Detail View */
        <div className="space-y-6 animate-fade-in relative z-10">
          {/* Breadcrumbs / Back navigation */}
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-surface-variant/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-md border border-primary/20 shadow-inner">
                {selectedReport.phieuDangKy?.sinhVien?.ho_ten?.charAt(0) || 'S'}
              </div>
              <div>
                <h2 className="font-bold text-base text-on-surface">{selectedReport.phieuDangKy?.sinhVien?.ho_ten}</h2>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  MSSV: <span className="font-mono text-on-surface font-semibold">{selectedReport.phieuDangKy?.sinhVien?.mssv}</span> | Lớp: <span className="text-on-surface font-semibold">{selectedReport.phieuDangKy?.sinhVien?.lop}</span>
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedReport(null)}
              className="px-4 py-2 border border-slate-200 text-on-surface-variant hover:text-on-surface font-bold text-xs rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>

          {/* Grid: Document viewer vs Grade form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Document details and download */}
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-surface-variant/40 overflow-hidden">
              <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  <span className="truncate max-w-[280px]">{selectedReport.bai_thu_hoach_url || 'BaoCao_KienTap.pdf'}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <span>Trang 1 / 4</span>
                  <div className="h-4 w-[1px] bg-slate-600"></div>
                  <button 
                    onClick={() => alert('Đang tải file minh chứng...')}
                    className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Download className="w-3.5 h-3.5" /> <span>Tải xuống</span>
                  </button>
                </div>
              </div>

              {/* Simulated PDF Layout Canvas */}
              <div className="p-8 bg-slate-100 overflow-y-auto max-h-[600px] flex justify-center">
                <div className="bg-white w-full max-w-[500px] min-h-[650px] shadow-lg p-10 text-slate-800 flex flex-col justify-between border border-slate-200 select-text">
                  <div className="text-center space-y-2 border-b-2 border-slate-900 pb-4 shrink-0">
                    <p className="font-bold text-[10px] uppercase tracking-wider">Trường ĐH Công Thương TP.HCM (HUIT)</p>
                    <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Khoa Công nghệ Thực phẩm</p>
                    <div className="w-12 h-0.5 bg-slate-900 mx-auto my-2"></div>
                    <h2 className="font-black text-sm uppercase tracking-tight py-2 leading-normal">
                      BÁO CÁO THU HOẠCH KIẾN TẬP
                    </h2>
                    <p className="text-xs font-semibold italic text-primary">
                      Doanh nghiệp: {selectedReport.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Đoàn kiến tập'}
                    </p>
                  </div>

                  <div className="flex-1 py-6 space-y-4 text-[11px] leading-relaxed text-justify">
                    <div>
                      <h4 className="font-bold text-xs uppercase mb-1 border-b border-slate-200 pb-0.5">I. Giới thiệu tổng quan doanh nghiệp</h4>
                      <p>
                        Công ty hoạt động trong lĩnh vực sản xuất chế biến thực phẩm sạch hàng đầu Việt Nam, sử dụng các tiêu chuẩn an toàn sinh học ISO và HACCP nghiêm ngặt để đảm bảo chất lượng dòng thực phẩm từ nguyên liệu đầu vào đến người tiêu dùng.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs uppercase mb-1 border-b border-slate-200 pb-0.5">II. Dây chuyền sản xuất quan sát</h4>
                      <p>
                        Dây chuyền sản xuất tự động khép kín hoàn toàn, giảm thiểu sự can thiệp trực tiếp của con người nhằm bảo vệ tính tiệt trùng tối đa. Hệ thống cánh tay robot hiện đại thực hiện đóng hộp, xếp palette và chuyển kho tự động thông minh.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs uppercase mb-1 border-b border-slate-200 pb-0.5">III. Bài học thu hoạch và nhận định cá nhân</h4>
                      <p>
                        Chuyến đi mang lại trải nghiệm thực tế quý giá giúp sinh viên hiểu rõ tầm quan trọng của việc đảm bảo vệ sinh an toàn thực phẩm cũng như quy mô vận hành chuẩn công nghiệp lớn ngoài giảng đường đại học.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 flex justify-between text-[10px] shrink-0">
                    <div>
                      <p className="font-bold text-slate-500 uppercase">Cố vấn học tập</p>
                      <p className="font-bold mt-8 text-slate-900">{lecturer.ho_ten}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-500 uppercase">Sinh viên nộp</p>
                      <p className="font-bold mt-8 text-slate-900">{selectedReport.phieuDangKy?.sinhVien?.ho_ten}</p>
                      <p className="text-slate-500 font-mono text-[9px]">MSSV: {selectedReport.phieuDangKy?.sinhVien?.mssv}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Suggestion & Grade form */}
            <div className="lg:col-span-5 space-y-6">
              {/* AI suggestion */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-emerald-200 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
                  <Sparkles className="w-24 h-24 text-primary" />
                </div>
                
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-800 flex items-center justify-center shadow-inner">
                    <Sparkles className="w-5 h-5 text-emerald-800" />
                  </div>
                  <h2 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wider">AI chấm điểm đề xuất</h2>
                </div>

                <div className="flex items-baseline gap-2 mb-3 relative z-10">
                  <span className="text-4xl font-black text-emerald-800 leading-none">8.5</span>
                  <span className="text-emerald-600 text-sm font-bold">/ 10</span>
                </div>

                <p className="text-emerald-900 text-xs font-semibold leading-relaxed mb-4 relative z-10">
                  Trình phân tích đạt chuẩn: Bố cục 3 phần rõ ràng, mô tả chi tiết quy trình, đúng tiến độ. Đề xuất điểm: 8.5/10.
                </p>

                <button 
                  type="button"
                  onClick={() => setShowAiBreakdown(true)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Xem chi tiết tiêu chí</span>
                </button>
              </div>

              {/* Grading input form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-variant/40 space-y-6">
                <h3 className="font-bold text-sm text-[#191d17] uppercase tracking-wider">Phiếu chấm điểm báo cáo</h3>
                
                <form onSubmit={handleSaveGrade} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Điểm báo cáo thu hoạch (0 - 10) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative max-w-[140px]">
                      <input 
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-full px-4 py-3 font-mono font-black text-xl text-primary bg-[#f8faf1] border border-surface-variant rounded-xl focus:outline-none focus:border-primary/50 text-center"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">/ 10</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Nhận xét & Gợi ý từ giáo viên
                    </label>
                    <textarea 
                      rows={4}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Nhập nhận xét chi tiết..."
                      className="w-full p-4 text-xs bg-[#f8faf1] border border-surface-variant rounded-xl focus:outline-none focus:border-primary/50 text-on-surface font-semibold leading-relaxed resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-[#ecefe6] rounded-xl cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Lưu điểm báo cáo
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* AI Breakdown Criteria Modal */}
      {showAiBreakdown && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-surface-variant animate-scale-up">
            <div className="p-6 bg-emerald-850 text-white flex justify-between items-center">
              <h3 className="font-black text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span>Tiêu chí chấm tự động AI</span>
              </h3>
              <button 
                onClick={() => setShowAiBreakdown(false)}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="flex justify-between font-bold text-xs text-on-surface mb-1">
                  <span>1. Hình thức & cấu trúc báo cáo</span>
                  <span className="text-emerald-800 font-mono">2.0 / 2.0đ</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                  Báo cáo trình bày sạch đẹp, đúng tiến độ và đầy đủ chữ ký xác nhận của các bên.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="flex justify-between font-bold text-xs text-on-surface mb-1">
                  <span>2. Nội dung công nghệ quan sát</span>
                  <span className="text-emerald-800 font-mono">4.5 / 5.0đ</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                  Mô tả rất chính xác quy trình công nghệ lên men và tự động hóa dây chuyền sản xuất của nhà máy.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="flex justify-between font-bold text-xs text-on-surface mb-1">
                  <span>3. Bài học & Liên hệ thực tiễn</span>
                  <span className="text-emerald-800 font-mono">2.0 / 3.0đ</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                  Rút ra bài học bổ ích về tinh thần kỷ luật và an toàn sản xuất nhưng cần phân tích chuyên sâu thêm.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => setShowAiBreakdown(false)}
                  className="px-4 py-2 bg-emerald-850 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
