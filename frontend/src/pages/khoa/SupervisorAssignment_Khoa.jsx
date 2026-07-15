import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';
import { GraduationCap, Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function SupervisorAssignment_Khoa() {
  const [enrollments, setEnrollments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Filter states
  const [selectedPlanId, setSelectedPlanId] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');

  // Assign dropdown state
  const [selectedLecturerId, setSelectedLecturerId] = useState({});

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const enRes = await khoaApi.getEnrollments();
      setEnrollments(enRes.data);

      const lecRes = await khoaApi.getLecturers();
      setLecturers(lecRes.data);

      const schRes = await khoaApi.getSchedules();
      setSchedules(schRes.data);

      // Initialize selected lecturers
      const initialSelected = {};
      enRes.data.forEach(en => {
        // If they already have an advisor, store it
        if (en.sinhVien?.details?.giang_vien_huong_dan_id) {
          initialSelected[en.id] = String(en.sinhVien.details.giang_vien_huong_dan_id);
        }
      });
      setSelectedLecturerId(initialSelected);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải cơ sở dữ liệu phân công.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (enrollmentId) => {
    const lecturerId = selectedLecturerId[enrollmentId];
    if (!lecturerId) {
      alert('Vui lòng chọn giảng viên trước khi phân công.');
      return;
    }
    try {
      setError('');
      setMessage('');
      await khoaApi.assignGvhd({
        lichKienTapSinhVienId: enrollmentId,
        lecturerId: Number(lecturerId),
      });
      setMessage('Phân công Giảng viên hướng dẫn thành công.');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Lỗi trong quá trình phân công giảng viên hướng dẫn.');
    }
  };

  // Unique classes for filtering
  const uniqueClasses = Array.from(new Set(enrollments.map(e => e.sinhVien?.ten_lop).filter(Boolean)));

  const filteredEnrollments = enrollments.filter(e => {
    const matchesPlan = selectedPlanId === 'All' || String(e.lich_kien_tap_id) === selectedPlanId;
    const matchesClass = filterClass === 'All' || e.sinhVien?.ten_lop === filterClass;
    const matchesSearch = e.sinhVien?.ho_ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.sinhVien?.mssv.includes(searchQuery);
    return matchesPlan && matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <GraduationCap className="text-primary w-6 h-6" />
          Phân công Giảng viên Hướng dẫn (GVHD)
        </h2>
        <p className="text-slate-500 text-sm">Giao việc hướng dẫn học phần báo cáo kiến tập cho giảng viên cơ hữu theo từng sinh viên</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-500/30 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-500/30 text-rose-800 px-4 py-3 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm space-y-4">
        {/* Filters bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block mb-1">Lọc đợt kiến tập</label>
            <select
              value={selectedPlanId}
              onChange={e => setSelectedPlanId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">Tất cả đợt</option>
              {schedules.map(sch => (
                <option key={sch.id} value={sch.id}>{sch.ten_lich}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Lọc lớp</label>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">Tất cả các lớp</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1">Tìm kiếm sinh viên</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tên hoặc mã số sinh viên..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto pt-2">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin w-5 h-5 text-primary" />
              Đang kết nối cơ sở dữ liệu...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="bg-[#f8faf1] text-slate-700 font-bold text-left">
                  <th className="px-4 py-3 rounded-l-xl">Sinh viên</th>
                  <th className="px-4 py-3">Lớp học</th>
                  <th className="px-4 py-3">Đợt tham gia</th>
                  <th className="px-4 py-3">Giảng viên hướng dẫn hiện tại</th>
                  <th className="px-4 py-3 rounded-r-xl text-center">Thay đổi phân công</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold">
                {filteredEnrollments.map(e => {
                  const currentAdvisorName = e.sinhVien?.details?.giangVienHuongDan?.ho_ten || 'Chưa phân công';
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{e.sinhVien?.ho_ten}</div>
                        <div className="text-[10px] text-slate-400">MSSV: {e.sinhVien?.mssv}</div>
                      </td>
                      <td className="px-4 py-3.5">{e.sinhVien?.ten_lop}</td>
                      <td className="px-4 py-3.5">{e.lichKienTap?.ten_lich}</td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {currentAdvisorName === 'Chưa phân công' ? (
                          <span className="text-rose-500 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {currentAdvisorName}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold">
                            {currentAdvisorName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center flex justify-center gap-2">
                        <select
                          value={selectedLecturerId[e.id] || ''}
                          onChange={ev => setSelectedLecturerId({
                            ...selectedLecturerId,
                            [e.id]: ev.target.value
                          })}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-primary font-medium"
                        >
                          <option value="">-- Chọn giảng viên --</option>
                          {lecturers.map(l => (
                            <option key={l.id} value={l.id}>{l.ho_ten} ({l.ma_gv})</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssign(e.id)}
                          className="bg-primary hover:bg-[#2c6b2d] text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                        >
                          Phân công
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredEnrollments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400 font-medium">
                      Không tìm thấy sinh viên nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
