import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';
import { UserCheck, Search, CheckCircle2, AlertCircle, RefreshCw, Star } from 'lucide-react';

export default function LeaderAssignment_Khoa() {
  const [trips, setTrips] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Assignment fields
  const [activeTripId, setActiveTripId] = useState(null);
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [laTruongDoan, setLaTruongDoan] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tripRes = await khoaApi.getTrips();
      setTrips(tripRes.data);

      const lecRes = await khoaApi.getLecturers();
      setLecturers(lecRes.data);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách chuyến đi hoặc giảng viên.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLeader = async (e) => {
    e.preventDefault();
    if (!selectedLecturerId) {
      alert('Vui lòng chọn giảng viên.');
      return;
    }
    try {
      setError('');
      setMessage('');
      await khoaApi.assignGvdd({
        tripId: Number(activeTripId),
        lecturerId: Number(selectedLecturerId),
        laTruongDoan: laTruongDoan,
      });
      setMessage('Phân công Giảng viên dẫn đoàn thành công.');
      setActiveTripId(null);
      setSelectedLecturerId('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Không thể phân công giảng viên dẫn đoàn.');
    }
  };

  const filteredTrips = trips.filter(t => 
    t.nhaMay?.ten_nha_may.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.lichKienTap?.ten_lich.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <UserCheck className="text-primary w-6 h-6" />
          Phân công Giảng viên Dẫn đoàn (GVDD)
        </h2>
        <p className="text-slate-500 text-sm">Chỉ định trưởng đoàn và phó đoàn phụ trách đưa đón, quản lý sinh viên tại thực địa</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment panel */}
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm space-y-4 lg:col-span-1 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="text-primary w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800">Cấu hình dẫn đoàn</h3>
          </div>
          {activeTripId ? (
            <form onSubmit={handleAssignLeader} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="p-3 bg-[#f8faf1] rounded-xl border border-primary/10">
                <span className="text-[10px] text-slate-400 block uppercase">Chuyến đi đã chọn</span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {trips.find(x => x.id === activeTripId)?.nhaMay?.ten_nha_may}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1 font-medium">
                  Khởi hành: {new Date(trips.find(x => x.id === activeTripId)?.ngay_tham_quan).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div>
                <label className="block mb-1">Chọn giảng viên dẫn đoàn</label>
                <select
                  required
                  value={selectedLecturerId}
                  onChange={e => setSelectedLecturerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {lecturers.map(l => (
                    <option key={l.id} value={l.id}>{l.ho_ten} ({l.ma_gv})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block mb-1">Vai trò trong chuyến đi</label>
                <div className="flex gap-4 font-semibold text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={laTruongDoan === true}
                      onChange={() => setLaTruongDoan(true)}
                      className="text-primary focus:ring-primary"
                    />
                    Trưởng đoàn
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={laTruongDoan === false}
                      onChange={() => setLaTruongDoan(false)}
                      className="text-primary focus:ring-primary"
                    />
                    Phó đoàn / Giám sát
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-[#2c6b2d] text-white py-2.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
                >
                  Xác nhận Phân công
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTripId(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-600 font-bold transition-all cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-slate-400 font-medium">
              Vui lòng chọn một chuyến đi từ danh sách bên cạnh để bắt đầu phân công.
            </div>
          )}
        </div>

        {/* Trips list */}
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">
              Danh sách các Chuyến kiến tập
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên nhà máy hoặc đợt..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary font-semibold"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center gap-2">
                <RefreshCw className="animate-spin w-5 h-5 text-primary" />
                Đang tải danh sách chuyến...
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead>
                  <tr className="bg-[#f8faf1] text-slate-700 font-bold text-left">
                    <th className="px-4 py-3 rounded-l-xl">Doanh nghiệp / Địa điểm</th>
                    <th className="px-4 py-3">Ngày đi</th>
                    <th className="px-4 py-3">Danh sách GVDD hiện tại</th>
                    <th className="px-4 py-3 rounded-r-xl text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold">
                  {filteredTrips.map(t => {
                    const leaders = t.giaoVienDanDoan || [];
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800">{t.nhaMay?.ten_nha_may}</div>
                          <div className="text-[10px] text-slate-400">{t.lichKienTap?.ten_lich}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          {new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN')}
                          <div className="text-[10px] text-slate-400 font-mono">{t.gio_bat_dau} - {t.gio_ket_thuc}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1">
                            {leaders.map(l => (
                              <div key={l.id} className="flex items-center gap-1">
                                {l.la_truong_doan ? (
                                  <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[9px] px-1 py-0.5 rounded font-bold flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Trưởng đoàn
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] px-1 py-0.5 rounded font-bold">
                                    Phó đoàn
                                  </span>
                                )}
                                <span className="font-bold text-slate-850">{l.giangVien?.ho_ten}</span>
                              </div>
                            ))}
                            {leaders.length === 0 && (
                              <span className="text-rose-500 italic font-semibold flex items-center gap-0.5">
                                <AlertCircle className="w-3.5 h-3.5" /> Chưa phân công
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => {
                              setActiveTripId(t.id);
                              setSelectedLecturerId('');
                            }}
                            className="bg-primary hover:bg-[#2c6b2d] text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Phân công GVDD
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTrips.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">
                        Không tìm thấy chuyến đi nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
