/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  FileText, 
  Maximize2, 
  Cpu, 
  Save, 
  AlertOctagon, 
  X,
  CheckCircle,
  Eye
} from 'lucide-react';

export const EvaluationView: React.FC = () => {
  const { students, selectedStudentId, updateStudentGrade, setScreen, saveGrades } = useApp();
  
  // Find current student or fallback to first student
  const student = students.find(s => s.id === selectedStudentId) || students[0];

  // Internal states pre-filled with student's current grades
  const [gradeInput, setGradeInput] = useState<string>(
    student.gvhdGrade === 0 ? '' : student.gvhdGrade.toString()
  );
  const [commentInput, setCommentInput] = useState<string>(student.comment);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Sync state if selected student changes
  useEffect(() => {
    if (student) {
      setGradeInput(student.gvhdGrade === 0 ? '' : student.gvhdGrade.toString());
      setCommentInput(student.comment);
    }
  }, [selectedStudentId, student]);

  // Handle grade change validation
  const handleGradeChange = (val: string) => {
    setGradeInput(val);
  };

  const handleSaveGrade = async () => {
    setIsSaving(true);
    let parsedGrade = parseFloat(gradeInput);
    if (isNaN(parsedGrade)) parsedGrade = 0.0;
    // Cap 0 to 10
    parsedGrade = Math.max(0, Math.min(10, parsedGrade));

    // Save globally
    updateStudentGrade(student.id, {
      gvhdGrade: parsedGrade,
      comment: commentInput,
      isGraded: true
    });

    await saveGrades();
    setIsSaving(false);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      // Auto return to list view
      setScreen('guided');
    }, 1500);
  };

  const handleRequestRevision = () => {
    alert(`Đã gửi yêu cầu bổ sung/chỉnh sửa báo cáo cho sinh viên ${student.name} (${student.id})!`);
    updateStudentGrade(student.id, {
      comment: "Yêu cầu bổ sung: " + commentInput,
      isGraded: false
    });
    setScreen('guided');
  };

  if (!student) {
    return <div className="p-4 text-center">Không tìm thấy sinh viên!</div>;
  }

  // Derive PDF name based on student details
  const pdfName = `baocao_${student.company.toLowerCase().replace(/\s+/g, '_')}.pdf`;

  return (
    <div className="flex flex-col gap-6 pb-12 text-on-surface">
      {/* 1. Header Info Card */}
      <section className="bg-surface-muted rounded-xl p-3 flex gap-4 items-center shadow-sm border border-outline-variant/30">
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container shadow-sm border border-outline-variant/30">
          <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase font-bold text-[10px]">MSSV:</span>
            <span className="font-body-md text-body-md text-on-surface font-bold text-sm truncate">{student.id}</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Building className="w-4 h-4 text-primary shrink-0" />
            <span className="font-body-md text-body-md text-on-surface font-semibold text-xs truncate">{student.company}</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span className="font-body-md text-body-md text-on-surface-variant text-xs">{student.submittedDate}</span>
          </div>
        </div>
      </section>

      {/* 2. PDF Document Card */}
      <section className="bg-surface-container-lowest border border-surface-muted rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="bg-surface-container rounded-lg h-32 flex flex-col items-center justify-center gap-2 border border-outline-variant/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-variant/30 pointer-events-none"></div>
          <FileText className="w-12 h-12 text-[#E68A8C] transition-transform group-hover:scale-110 duration-300" />
          <span className="font-body-md text-body-md text-on-surface-variant font-bold text-xs">{pdfName}</span>
        </div>
        <button 
          onClick={() => setShowPdfModal(true)}
          className="w-full border border-primary text-primary hover:bg-primary hover:text-on-primary transition-all duration-200 rounded-lg py-3 font-label-md text-label-md flex justify-center items-center gap-2 focus:outline-none uppercase font-bold cursor-pointer"
        >
          <Maximize2 className="w-4.5 h-4.5" />
          Xem toàn màn hình
        </button>
      </section>

      {/* 3. Grading Section Card */}
      <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-5 border border-surface-muted/50">
        <div className="flex justify-between items-center gap-2">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Đánh giá</h2>
          <div className="bg-surface-muted text-on-surface-variant px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-sm shrink-0 border border-outline-variant/20">
            <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-label-md text-[11px] font-bold">AI đề xuất: {student.aiSuggestedGrade.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase ml-1 font-bold tracking-wider text-[10px]" htmlFor="grade-input">
            Điểm GVHD
          </label>
          <div className="relative w-full">
            <input 
              type="number"
              min="0"
              max="10"
              step="0.1"
              id="grade-input"
              value={gradeInput}
              onChange={(e) => handleGradeChange(e.target.value)}
              placeholder="0.0"
              className="w-full border-2 border-primary rounded-lg p-4 text-center font-headline-lg text-headline-lg text-primary focus:outline-none focus:ring-4 focus:ring-primary-container/30 bg-background/50 transition-all shadow-inner placeholder:text-outline-variant select-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant font-bold">
              / 10
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase ml-1 font-bold tracking-wider text-[10px]" htmlFor="comment-input">
            Nhận xét
          </label>
          <textarea 
            id="comment-input"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="w-full border border-surface-muted bg-background/50 rounded-lg p-4 h-28 resize-none font-body-md text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container placeholder:text-outline-variant shadow-sm transition-all focus:ring-offset-1 text-on-surface"
            placeholder="Nhận xét về bài thu hoạch của sinh viên..."
          />
        </div>
      </section>

      {/* 4. Bottom Action Stack */}
      <section className="flex flex-col gap-3 mt-4">
        <button 
          onClick={handleSaveGrade}
          disabled={isSaving}
          className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold rounded-lg py-4 font-label-md text-label-md flex justify-center items-center gap-2 shadow-md uppercase tracking-wider cursor-pointer active:scale-[0.98] transition-all disabled:opacity-80"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4.5 h-4.5" />
              Lưu điểm
            </>
          )}
        </button>
        <button 
          onClick={handleRequestRevision}
          className="w-full border-2 border-[#E68A8C] text-[#ba1a1a] hover:bg-error-container hover:border-error hover:text-[#ba1a1a] transition-all rounded-lg py-3 font-label-md text-label-md flex justify-center items-center gap-2 uppercase tracking-wider font-bold cursor-pointer active:scale-[0.98]"
        >
          <AlertOctagon className="w-4.5 h-4.5" />
          Yêu cầu bổ sung
        </button>
      </section>

      {/* PDF Viewer Fullscreen Simulator Overlay Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex flex-col justify-between p-4 select-none animate-fadeIn">
          {/* Header */}
          <div className="flex justify-between items-center bg-zinc-900 text-white rounded-xl p-3 border border-zinc-800">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E68A8C]" />
              <span className="font-headline-sm text-sm truncate max-w-[200px] font-bold">{pdfName}</span>
            </div>
            <button 
              onClick={() => setShowPdfModal(false)}
              className="p-1 hover:bg-zinc-800 rounded-full"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* PDF Page Simulator with realistic report layout */}
          <div className="flex-1 my-4 bg-white rounded-xl p-6 overflow-y-auto text-black border border-zinc-200 shadow-2xl max-w-lg mx-auto w-full custom-scrollbar">
            <div className="text-center border-b pb-4 mb-4">
              <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-600">Trường Đại học Công nghệ Thực phẩm TP.HCM</h2>
              <h3 className="text-[11px] font-bold uppercase text-zinc-500">Khoa Công nghệ Thực phẩm</h3>
              <h1 className="text-lg font-extrabold uppercase text-primary mt-4 tracking-tight">Báo Cáo Thu Hoạch Kiến Tập</h1>
              <p className="text-xs text-zinc-400 mt-1">Đợt 1 - Học Kỳ I (2023 - 2024)</p>
            </div>

            {/* Student metadata */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-zinc-50 p-3 rounded-lg border border-zinc-200 mb-4 text-zinc-700">
              <div><strong>Sinh viên:</strong> {student.name}</div>
              <div><strong>MSSV:</strong> {student.id}</div>
              <div><strong>Lớp:</strong> {student.className}</div>
              <div><strong>Đơn vị:</strong> {student.company}</div>
            </div>

            {/* Mock Report Content */}
            <div className="space-y-4 text-zinc-800 text-xs leading-relaxed text-justify">
              <div>
                <h4 className="font-extrabold text-primary uppercase text-[11px] tracking-wider mb-1">I. Giới Thiệu Chung về {student.company}</h4>
                <p>
                  Đơn vị tiếp nhận kiến tập là một trong những doanh nghiệp đầu ngành trong lĩnh vực sản xuất và chế biến thực phẩm tại Việt Nam. Quy trình quản lý chất lượng nghiêm ngặt đạt các chứng chỉ quốc tế như ISO 9001, HACCP và FSSC 22000.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-primary uppercase text-[11px] tracking-wider mb-1">II. Nội Dung Kiến Tập Thực Tế</h4>
                <p>
                  Trong suốt chuyến tham quan thực tế tại nhà máy sản xuất, sinh viên đã có cơ hội tìm hiểu chuyên sâu về:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Tìm hiểu nguồn nguyên liệu đầu vào và các tiêu chuẩn kiểm soát chất lượng sơ bộ.</li>
                  <li>Khảo sát hệ thống dây chuyền chiết rót, đóng chai tự động đạt tốc độ cao.</li>
                  <li>Quan sát quy trình tiệt trùng UHT và hệ thống quản trị rủi ro tại phân xưởng.</li>
                  <li>Tham quan trung tâm R&D và khu vực phòng thí nghiệm vi sinh hiện đại.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-extrabold text-primary uppercase text-[11px] tracking-wider mb-1">III. Nhận Xét & Thu Hoạch Cá Nhân</h4>
                <p>
                  Chuyến đi thực tế đã giúp củng cố toàn bộ khối lượng lý thuyết đã tích lũy trên giảng đường Đại học về Môn Công nghệ Chế biến thực phẩm và Quản lý Chất lượng. Sinh viên nhận thức sâu sắc về tầm quan trọng của việc tự động hóa và vệ sinh an toàn thực phẩm đối với ngành công nghiệp tiêu dùng nhanh (FMCG).
                </p>
              </div>

              <div className="border-t pt-4 text-center text-[10px] text-zinc-400 font-medium">
                --- HẾT BÁO CÁO ---
              </div>
            </div>
          </div>

          {/* Footer controls inside modal */}
          <div className="bg-zinc-900 rounded-xl p-3 flex justify-between items-center text-white border border-zinc-800 text-xs">
            <span>Trang 1 / 1</span>
            <button 
              onClick={() => setShowPdfModal(false)}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-bold"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-secondary-container/20 animate-slideUp">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-label-md text-sm font-bold">Lưu điểm bài thu hoạch thành công!</span>
        </div>
      )}
    </div>
  );
};
