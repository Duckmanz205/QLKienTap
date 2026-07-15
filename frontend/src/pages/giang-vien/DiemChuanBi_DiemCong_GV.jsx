import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Search, 
  Plus, 
  Info, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Download,
  Check
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function DiemChuanBi_DiemCong_GV() {
  const [lecturer, setLecturer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Local state to keep track of score inputs before saving
  // Key: phieuId, Value: { diemChuanBi: number, diemCong: number }
  const [scores, setScores] = useState({});

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchTrips(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchTrips = async (gvId) => {
    try {
      const res = await giangVienApi.getLedTrips(gvId);
      setTrips(res.data);
      if (res.data.length > 0) {
        setSelectedTripId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching led trips:', err);
    }
  };

  useEffect(() => {
    if (selectedTripId) {
      fetchRegistrations(Number(selectedTripId));
    } else {
      setStudents([]);
      setScores({});
    }
  }, [selectedTripId]);

  const fetchRegistrations = async (tripId) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await giangVienApi.getTripRegistrations(tripId);
      setStudents(res.data);
      
      const initialScores = {};
      res.data.forEach(item => {
        initialScores[item.id] = {
          diemChuanBi: item.diemPhieuDangKy?.diem_chuan_bi !== null && item.diemPhieuDangKy?.diem_chuan_bi !== undefined
            ? Number(item.diemPhieuDangKy.diem_chuan_bi)
            : 0,
          diemCong: item.diemPhieuDangKy?.diem_cong !== null && item.diemPhieuDangKy?.diem_cong !== undefined
            ? Number(item.diemPhieuDangKy.diem_cong)
            : 0
        };
      });
      setScores(initialScores);
    } catch (err) {
      setError('Không thể tải danh sách sinh viên.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepScoreChange = (phieuId, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 10) num = 10;

    setScores(prev => ({
      ...prev,
      [phieuId]: {
        ...prev[phieuId],
        diemChuanBi: num
      }
    }));
  };

  const incrementBonus = (phieuId) => {
    const currentBonus = scores[phieuId]?.diemCong || 0;
    let newBonus = currentBonus + 0.5;
    if (newBonus > 1.0) {
      newBonus = 0; // Cycle back to 0 if they click past 1.0
    }

    setScores(prev => ({
      ...prev,
      [phieuId]: {
        ...prev[phieuId],
        diemCong: newBonus
      }
    }));
  };

  const handleSaveScores = async () => {
    if (!selectedTripId || students.length === 0) return;
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const promises = Object.keys(scores).map(phieuId => {
        const studentScore = scores[phieuId];
        return giangVienApi.gradePrepAndBonus({
          lecturerId: lecturer.id,
          phieuId: Number(phieuId),
          diemChuanBi: studentScore.diemChuanBi,
          diemCong: studentScore.diemCong
        });
      });

      await Promise.all(promises);
      setMessage('Lưu điểm chuẩn bị và điểm cộng thành công!');
      fetchRegistrations(Number(selectedTripId));
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình lưu điểm số.');
    } finally {
      setLoading(false);
    }
  };

  if (!lecturer) {
    return (
      <div className="flex items-center justify-center min-h-[450px] text-slate-500 font-semibold">
        Đang tải dữ liệu giảng viên...
      </div>
    );
  }

  const filteredStudents = students.filter(item => {
    const name = item.sinhVien?.ho_ten || '';
    const mssv = item.sinhVien?.mssv || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           mssv.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-2">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight font-headline-lg flex items-center gap-3">
            <Award className="w-8 h-8 text-primary" />
            <span>Điểm chuẩn bị &amp; Điểm cộng</span>
          </h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Quản lý và cập nhật điểm số chuẩn bị trước chuyến đi, cùng với điểm thưởng chuyên cần của sinh viên.
          </p>
        </div>

        {/* Selector */}
        <div className="w-full md:w-96 space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
            Chọn chuyến kiến tập
          </label>
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-surface-variant rounded-xl text-sm focus:border-primary focus:outline-none font-semibold shadow-sm"
          >
            {trips.map(t => (
              <option key={t.id} value={t.id}>
                {t.nhaMay?.ten_nha_may} - {new Date(t.ngay_khoi_hanh).toLocaleDateString('vi-VN')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#f8faf1] border border-surface-variant/60 rounded-2xl p-5 shadow-sm flex items-start gap-4">
        <div className="bg-primary-container/10 p-2.5 rounded-xl text-primary shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">Lưu ý về quy chế điểm số</h3>
          <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
            Điểm chuẩn bị lấy từ bài kiểm tra trắc nghiệm trước chuyến đi (thang điểm 10). Điểm cộng tối đa là 1.0 điểm 
            (mỗi lượt ghi nhận tăng 0.5 điểm) dành cho sinh viên phát biểu tích cực hoặc đạt thứ hạng xuất sắc.
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-[#e5ffdc] border border-primary/20 text-[#476d01] px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-750 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm overflow-hidden relative z-10">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 bg-[#f8faf1]/30 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Tìm sinh viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f8faf1] border border-surface-variant rounded-xl text-xs focus:border-primary focus:outline-none font-bold"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-variant">
                <th className="py-4 px-6 pl-8 w-36">MSSV</th>
                <th className="py-4 px-6 w-64">Họ Tên</th>
                <th className="py-4 px-6 w-44">Điểm Chuẩn Bị (0 - 10)</th>
                <th className="py-4 px-6 w-56">Điểm Cộng (Max 1.0)</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500 font-medium">
                    Đang đồng bộ dữ liệu điểm số...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    Không tìm thấy sinh viên nào trong chuyến đi này.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((item) => {
                  const studentScore = scores[item.id] || { diemChuanBi: 0, diemCong: 0 };
                  const initials = item.sinhVien?.ho_ten?.split(' ').slice(-2).map(w => w[0]).join('') || 'SV';
                  const isMaxBonus = studentScore.diemCong >= 1.0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 pl-8 font-mono text-primary font-bold">
                        {item.sinhVien?.mssv}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs uppercase">
                            {initials}
                          </div>
                          <span className="font-bold text-on-surface">{item.sinhVien?.ho_ten}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={studentScore.diemChuanBi}
                          onChange={(e) => handlePrepScoreChange(item.id, e.target.value)}
                          className="w-24 px-3 py-2 bg-[#f8faf1] rounded-xl border border-surface-variant focus:border-primary focus:outline-none text-center font-bold text-primary"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 bg-[#f8faf1] p-1.5 rounded-xl border border-surface-variant w-fit">
                          <button
                            type="button"
                            onClick={() => incrementBonus(item.id)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                              isMaxBonus 
                                ? 'bg-slate-200 text-slate-500 border border-slate-350 cursor-not-allowed'
                                : 'bg-white text-primary border border-primary hover:bg-primary/5'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>0.5</span>
                          </button>
                          <span className={`text-xs font-bold min-w-[70px] text-center ${isMaxBonus ? 'text-primary' : 'text-slate-500'}`}>
                            {studentScore.diemCong.toFixed(1)} / 1.0
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveScores}
          disabled={loading || students.length === 0}
          className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>Lưu điểm số</span>
        </button>
      </div>
    </div>
  );
}
