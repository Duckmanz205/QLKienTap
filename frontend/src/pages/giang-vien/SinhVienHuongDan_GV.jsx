import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Check, 
  AlertTriangle,
  Info,
  Calendar,
  Building,
  GraduationCap
} from 'lucide-react';
import { giangVienApi, sinhVienApi } from '../../services/api';

export default function SinhVienHuongDan_GV() {
  const [lecturer, setLecturer] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTrips, setStudentTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  
  // Grading form state
  const [diemChuanBi, setDiemChuanBi] = useState('');
  const [diemCong, setDiemCong] = useState(0.0);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchStudents(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchStudents = async (gvId) => {
    try {
      const res = await giangVienApi.getGuidedStudents(gvId);
      setStudents(res.data);
      if (res.data.length > 0) {
        handleSelectStudent(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectStudent = async (termStudent) => {
    setSelectedStudent(termStudent);
    setStudentTrips([]);
    setSelectedTripId('');
    setDiemChuanBi('');
    setDiemCong(0.0);
    setMessage('');
    setError('');

    try {
      const res = await sinhVienApi.getRegisteredTrips(termStudent.sinh_vien_id);
      // Filter only approved/participated trips
      const validTrips = res.data.filter(t => 
        t.trang_thai === 'HopLe' || t.trang_thai === 'DaThamGia' || t.trang_thai === 'HoanThanh'
      );
      setStudentTrips(validTrips);

      if (validTrips.length > 0) {
        const firstTrip = validTrips[0];
        setSelectedTripId(firstTrip.id.toString());
        
        // Fetch grade details if available
        const gradesRes = await sinhVienApi.getGrades(termStudent.sinh_vien_id);
        const activeTermGrades = gradesRes.data.find(g => g.lich_kien_tap_id === termStudent.lich_kien_tap_id);
        if (activeTermGrades && activeTermGrades.selectedTrips) {
          const matchedTripGrade = activeTermGrades.selectedTrips.find(tg => tg.phieu_dang_ky_id === firstTrip.id);
          if (matchedTripGrade) {
            setDiemChuanBi(matchedTripGrade.diem_chuan_bi?.toString() || '');
            setDiemCong(Number(matchedTripGrade.diem_cong || 0.0));
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTripChange = async (tripIdStr) => {
    setSelectedTripId(tripIdStr);
    setMessage('');
    setError('');
    const matchedTrip = studentTrips.find(t => t.id === Number(tripIdStr));
    if (!matchedTrip) return;

    try {
      const gradesRes = await sinhVienApi.getGrades(selectedStudent.sinh_vien_id);
      const activeTermGrades = gradesRes.data.find(g => g.lich_kien_tap_id === selectedStudent.lich_kien_tap_id);
      if (activeTermGrades && activeTermGrades.selectedTrips) {
        const matchedTripGrade = activeTermGrades.selectedTrips.find(tg => tg.phieu_dang_ky_id === matchedTrip.id);
        if (matchedTripGrade) {
          setDiemChuanBi(matchedTripGrade.diem_chuan_bi?.toString() || '');
          setDiemCong(Number(matchedTripGrade.diem_cong || 0.0));
        } else {
          setDiemChuanBi('');
          setDiemCong(0.0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGrades = async (e) => {
    e.preventDefault();
    if (!selectedTripId) {
      alert('Vui lòng chọn chuyến đi kiến tập.');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await giangVienApi.gradePrepAndBonus({
        lecturerId: lecturer.id,
        registrationId: Number(selectedTripId),
        diemChuanBi: Number(diemChuanBi),
        diemCong: Number(diemCong)
      });
      setMessage(res.data.message);
      // Reload student details to fetch fresh grades
      handleSelectStudent(selectedStudent);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi nhập điểm quá trình.');
    } finally {
      setLoading(false);
    }
  };

  if (!lecturer) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải danh sách sinh viên hướng dẫn...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">Sinh viên hướng dẫn</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">
          Theo dõi danh sách sinh viên bạn được phân công hướng dẫn và nhập điểm chuẩn bị, điểm cộng quá trình.
        </p>
      </div>

      {/* Guide Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/10 rounded-2xl p-5 flex items-start gap-4 relative z-10">
        <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-primary">Quy định tính điểm quá trình</h3>
          <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
            - <strong>Điểm chuẩn bị (Tác phong/Chuẩn bị slide):</strong> Chấm theo thang điểm 10.0 cho sự tìm hiểu thông tin doanh nghiệp trước chuyến đi.
            <br />- <strong>Điểm cộng xây dựng bài:</strong> Hỗ trợ cộng điểm trực tiếp (+0.0, +0.5, +1.0) cho các sinh viên tích cực đóng góp ý kiến hoặc hỗ trợ trưởng đoàn.
          </p>
        </div>
      </div>

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

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Student List Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-surface-variant/40 shadow-sm overflow-hidden">
          <div className="p-4 bg-[#f8faf1] border-b border-surface-variant/40 flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5" />
              <span>Bảng danh sách hướng dẫn ({students.length} sinh viên)</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Sinh viên</th>
                  <th className="py-4 px-6">MSSV / Lớp</th>
                  <th className="py-4 px-6">Đợt học tập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-500">
                      Bạn chưa được phân công hướng dẫn sinh viên nào.
                    </td>
                  </tr>
                ) : (
                  students.map((termSv) => {
                    const isSelected = selectedStudent?.id === termSv.id;
                    return (
                      <tr 
                        key={termSv.id}
                        onClick={() => handleSelectStudent(termSv)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <span className={`font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                            {termSv.sinhVien?.ho_ten}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant">
                          <span className="font-mono text-xs">{termSv.sinhVien?.mssv}</span>
                          <span className="text-slate-300 mx-1">|</span>
                          <span>{termSv.sinhVien?.lop}</span>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant font-medium text-xs">
                          {termSv.lichKienTap?.ten_lich}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Grading Form Widget */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-surface-variant/40 shadow-sm p-6 flex flex-col justify-between">
          {selectedStudent ? (
            <form onSubmit={handleSaveGrades} className="space-y-6">
              <div>
                <h3 className="font-black text-lg text-on-surface">Nhập điểm quá trình</h3>
                <p className="text-xs text-on-surface-variant font-semibold mt-0.5">
                  Nhập điểm cho sinh viên: <span className="text-primary font-bold">{selectedStudent.sinhVien?.ho_ten}</span>
                </p>
              </div>

              {/* Trip Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Chọn chuyến kiến tập liên quan <span className="text-red-500">*</span>
                </label>
                {studentTrips.length === 0 ? (
                  <p className="text-xs text-[#ba1a1a] font-bold">
                    Sinh viên này chưa tham gia chuyến đi nào được duyệt.
                  </p>
                ) : (
                  <select
                    value={selectedTripId}
                    onChange={(e) => handleTripChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none"
                    required
                  >
                    {studentTrips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.chuyenThamQuan?.nhaMay?.ten_nha_may} ({new Date(t.chuyenThamQuan?.ngay_tham_quan).toLocaleDateString('vi-VN')})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Preparatory Grade Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Điểm chuẩn bị (Slide/Nghiên cứu) (0 - 10)
                </label>
                <input 
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={diemChuanBi}
                  onChange={(e) => setDiemChuanBi(e.target.value)}
                  placeholder="Ví dụ: 8.5"
                  disabled={studentTrips.length === 0}
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none font-bold text-primary"
                />
              </div>

              {/* Bonus Grade buttons selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Điểm cộng phát biểu / Đóng góp ý kiến
                </label>
                <div className="flex items-center gap-2">
                  {[0.0, 0.5, 1.0].map((val) => {
                    const isActive = Number(diemCong) === val;
                    return (
                      <button
                        type="button"
                        key={val}
                        disabled={studentTrips.length === 0}
                        onClick={() => setDiemCong(val)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-secondary text-white border-secondary shadow-sm scale-102'
                            : 'bg-[#f8faf1] border-slate-205 text-slate-500 hover:bg-[#ecefe6]'
                        }`}
                      >
                        {val > 0 ? `+${val.toFixed(1)}` : '0.0'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || studentTrips.length === 0}
                  className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-container shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                >
                  Lưu điểm quá trình
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 font-semibold text-sm">
              <GraduationCap className="w-12 h-12 text-slate-300 mb-2" />
              <span>Chọn một sinh viên bên danh sách để nhập điểm</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
