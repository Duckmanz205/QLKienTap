import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Check, 
  Save, 
  CheckCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function LichDanDoan_GV() {
  const [lecturer, setLecturer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); // key: regId, value: { status, notes }

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedTripId) {
      fetchRegistrations(Number(selectedTripId));
    }
  }, [selectedTripId]);

  const fetchRegistrations = async (tripId) => {
    setLoading(true);
    try {
      const res = await giangVienApi.getTripRegistrations(tripId);
      setRegistrations(res.data);

      // Initialize local state for attendance status
      const initial = {};
      res.data.forEach(reg => {
        // Map backend state ('HopLe'/'DaThamGia' -> CoMat, 'VangMat' -> Vang, 'BiLoai' -> TuChoiThamGia)
        let status = 'CoMat';
        if (reg.trang_thai === 'VangMat') status = 'Vang';
        else if (reg.trang_thai === 'BiLoai') status = 'TuChoiThamGia';

        initial[reg.id] = {
          status,
          notes: reg.ghi_chu_diem_danh || ''
        };
      });
      setAttendanceState(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (regId, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [regId]: { ...prev[regId], status }
    }));
  };

  const handleNotesChange = (regId, notes) => {
    setAttendanceState(prev => ({
      ...prev,
      [regId]: { ...prev[regId], notes }
    }));
  };

  const handleMarkAllPresent = () => {
    setAttendanceState(prev => {
      const updated = { ...prev };
      registrations.forEach(reg => {
        updated[reg.id] = {
          ...updated[reg.id],
          status: 'CoMat'
        };
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    setMessage('');
    setError('');
    setLoading(true);
    try {
      // Loop and submit all registrations to backend
      const promises = registrations.map(reg => {
        const state = attendanceState[reg.id] || { status: 'CoMat', notes: '' };
        return giangVienApi.takeAttendance({
          registrationId: reg.id,
          status: state.status,
          notes: state.notes
        });
      });
      await Promise.all(promises);
      setMessage('Đã lưu bảng điểm danh thành công!');
      if (selectedTripId) {
        fetchRegistrations(Number(selectedTripId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bảng điểm danh.');
    } finally {
      setLoading(false);
    }
  };

  if (!lecturer) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Đang tải thông tin lịch dẫn đoàn...
      </div>
    );
  }

  const activeTrip = trips.find(t => t.id === Number(selectedTripId));

  // Calculations for stats
  const totalCount = registrations.length;
  const presentCount = Object.values(attendanceState).filter(v => v.status === 'CoMat').length;
  const absentCount = Object.values(attendanceState).filter(v => v.status === 'Vang').length;
  const rejectedCount = Object.values(attendanceState).filter(v => v.status === 'TuChoiThamGia').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Lịch trình & Điểm danh</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Ghi nhận trạng thái tham gia của sinh viên tại các chuyến kiến tập thực địa do bạn dẫn đoàn.
          </p>
        </div>

        {/* Trip Picker Dropdown */}
        {trips.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200">
            <Compass className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Chuyến đi:</span>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="text-sm font-bold text-primary focus:outline-none bg-transparent cursor-pointer"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nhaMay?.ten_nha_may} ({new Date(t.ngay_tham_quan).toLocaleDateString('vi-VN')})
                </option>
              ))}
            </select>
          </div>
        )}
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

      {/* Active Trip Info and Stats Banner */}
      {activeTrip && (
        <div className="bg-white rounded-2xl shadow-sm border border-surface-variant/40 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
          {/* Left Info */}
          <div className="lg:col-span-8 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
            <div>
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                activeTrip.trang_thai === 'HoanThanh' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {activeTrip.trang_thai === 'HoanThanh' ? 'Đã hoàn thành' : 'Sắp diễn ra'}
              </span>
              <h2 className="text-xl font-extrabold text-on-surface mt-2">{activeTrip.nhaMay?.ten_nha_may}</h2>
              <p className="text-xs text-on-surface-variant font-semibold mt-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeTrip.nhaMay?.dia_chi}</span>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold text-on-surface-variant">
              <span className="flex items-center gap-1">
                <UserCheck className="w-4 h-4 text-slate-400" /> 
                <span>Dẫn đoàn: {lecturer.ho_ten}</span>
              </span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" /> 
                <span>{new Date(activeTrip.ngay_tham_quan).toLocaleDateString('vi-VN')}</span>
              </span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" /> 
                <span>{activeTrip.gio_bat_dau.slice(0, 5)} - {activeTrip.gio_ket_thuc.slice(0, 5)}</span>
              </span>
            </div>
          </div>

          {/* Right Stats */}
          <div className="lg:col-span-4 p-6 bg-[#f8faf1]/40 flex flex-col justify-center">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 text-center lg:text-left">
              Thống kê điểm danh
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-150 text-center shadow-xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Có mặt</p>
                <p className="text-lg font-black text-primary mt-1">{presentCount}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-150 text-center shadow-xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Vắng</p>
                <p className="text-lg font-black text-red-650 mt-1">{absentCount}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-150 text-center shadow-xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Từ chối</p>
                <p className="text-lg font-black text-amber-600 mt-1">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roster & Grid Attendance */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-variant/40 overflow-hidden relative z-10">
        {/* Table Top Actions */}
        <div className="p-4 bg-[#f8faf1] border-b border-surface-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span>Danh sách điểm danh ({totalCount} sinh viên)</span>
          </span>

          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-primary font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Đánh dấu tất cả có mặt</span>
          </button>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-semibold">Đang tải danh sách sinh viên...</div>
          ) : registrations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-semibold">Chưa có sinh viên nào đăng ký chuyến đi này.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6 w-1/3">Sinh viên</th>
                  <th className="py-4 px-6 text-center w-1/3">Trạng thái điểm danh</th>
                  <th className="py-4 px-6 w-1/3">Ghi chú chuyến đi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {registrations.map((reg) => {
                  const state = attendanceState[reg.id] || { status: 'CoMat', notes: '' };

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Student Identity */}
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-on-surface">{reg.sinhVien?.ho_ten}</p>
                          <p className="text-[11px] font-mono font-bold text-on-surface-variant mt-0.5">
                            MSSV: {reg.sinhVien?.mssv} | Lớp: {reg.sinhVien?.lop}
                          </p>
                        </div>
                      </td>

                      {/* Attendance Status Picker */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2 max-w-[280px] mx-auto">
                          {/* Có mặt */}
                          <button
                            onClick={() => handleStatusChange(reg.id, 'CoMat')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              state.status === 'CoMat'
                                ? 'bg-primary border-primary text-white shadow-sm scale-105'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-primary/5 hover:text-primary'
                            }`}
                          >
                            Có mặt
                          </button>

                          {/* Vắng */}
                          <button
                            onClick={() => handleStatusChange(reg.id, 'Vang')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              state.status === 'Vang'
                                ? 'bg-red-600 border-red-600 text-white shadow-sm scale-105'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-650'
                            }`}
                          >
                            Vắng
                          </button>

                          {/* Từ chối */}
                          <button
                            onClick={() => handleStatusChange(reg.id, 'TuChoiThamGia')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              state.status === 'TuChoiThamGia'
                                ? 'bg-amber-600 border-amber-600 text-white shadow-sm scale-105'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                            }`}
                          >
                            Từ chối
                          </button>
                        </div>
                      </td>

                      {/* Note input field */}
                      <td className="py-4 px-6">
                        <input
                          type="text"
                          value={state.notes}
                          onChange={(e) => handleNotesChange(reg.id, e.target.value)}
                          placeholder="Nhập lý do vắng, đi trễ, trang phục..."
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 transition-colors font-semibold"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Action Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSaveAttendance}
            disabled={loading || registrations.length === 0}
            className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Save className="w-4.5 h-4.5" />
            <span>Lưu điểm danh chuyến đi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
