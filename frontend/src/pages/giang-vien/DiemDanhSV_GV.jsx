import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  CheckCheck, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function DiemDanhSV_GV() {
  const [lecturer, setLecturer] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Local state for attendance records before saving to DB
  // Key: phieuId, Value: { status: 'CoMat'|'Vang'|'TuChoiThamGia', note: string }
  const [records, setRecords] = useState({});

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
      setRecords({});
    }
  }, [selectedTripId]);

  const fetchRegistrations = async (tripId) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await giangVienApi.getTripRegistrations(tripId);
      setStudents(res.data);
      
      // Initialize local state from existing db values
      const initialRecords = {};
      res.data.forEach(item => {
        initialRecords[item.id] = {
          status: item.diemDanh?.trang_thai || 'CoMat', // Default to CoMat if not checked yet
          note: item.diemDanh?.ghi_chu || ''
        };
      });
      setRecords(initialRecords);
    } catch (err) {
      setError('Không thể tải danh sách sinh viên.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (phieuId, status) => {
    setRecords(prev => ({
      ...prev,
      [phieuId]: {
        ...prev[phieuId],
        status
      }
    }));
  };

  const handleNoteChange = (phieuId, note) => {
    setRecords(prev => ({
      ...prev,
      [phieuId]: {
        ...prev[phieuId],
        note
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = { ...records };
    students.forEach(s => {
      updated[s.id] = {
        ...updated[s.id],
        status: 'CoMat'
      };
    });
    setRecords(updated);
    setMessage('Đã đánh dấu tất cả có mặt tạm thời (Bấm "Lưu điểm danh" để xác nhận).');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveAttendance = async () => {
    if (!selectedTripId || students.length === 0) return;
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const recordPayload = Object.keys(records).map(phieuId => ({
        phieuId: Number(phieuId),
        status: records[phieuId].status,
        note: records[phieuId].note
      }));

      const res = await giangVienApi.takeAttendance({
        lecturerId: lecturer.id,
        tripId: Number(selectedTripId),
        records: recordPayload
      });

      setMessage(res.data.message || 'Lưu điểm danh thành công!');
      fetchRegistrations(Number(selectedTripId));
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu điểm danh.');
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

  // Filter students based on search query
  const filteredStudents = students.filter(item => {
    const name = item.sinhVien?.ho_ten || '';
    const mssv = item.sinhVien?.mssv || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           mssv.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate statistics
  const totalCount = students.length;
  const presentCount = Object.values(records).filter(r => r.status === 'CoMat').length;
  const progressPercent = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header with Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-2">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight font-headline-lg flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <span>Điểm danh sinh viên</span>
          </h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Ghi nhận trạng thái tham gia thực tế của sinh viên trong chuyến kiến tập đoàn.
          </p>
        </div>

        {/* Trip Dropdown Selector */}
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

      {/* Control Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-surface-variant/40 shadow-sm relative z-10">
        <button
          onClick={handleMarkAllPresent}
          className="px-5 py-2.5 rounded-xl border-2 border-secondary text-secondary hover:bg-secondary/5 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Đánh dấu tất cả Có mặt</span>
        </button>

        {/* Progress bar */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner hidden sm:block">
            <div 
              className="h-full bg-secondary transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-on-surface">
            Có mặt: <span className="text-secondary text-lg">{presentCount}</span> / {totalCount} sinh viên
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-surface-variant/40 shadow-sm overflow-hidden relative z-10">
        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-[#f8faf1]/30 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Tìm theo tên/MSSV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f8faf1] border border-surface-variant rounded-xl text-xs focus:border-primary focus:outline-none font-bold"
            />
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-variant">
                <th className="py-4 px-6 text-center w-16">STT</th>
                <th className="py-4 px-6 w-72">Sinh viên</th>
                <th className="py-4 px-6 w-36">MSSV</th>
                <th className="py-4 px-6 w-80">Trạng thái điểm danh</th>
                <th className="py-4 px-6">Ghi chú vắng/từ chối</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                    Đang đồng bộ dữ liệu điểm danh...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    Không tìm thấy sinh viên nào trong chuyến đi này.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((item, index) => {
                  const stateRecord = records[item.id] || { status: 'CoMat', note: '' };
                  const isRejected = stateRecord.status === 'TuChoiThamGia';
                  const initials = item.sinhVien?.ho_ten?.split(' ').slice(-2).map(w => w[0]).join('') || 'SV';

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50 transition-colors ${isRejected ? 'bg-red-50/20' : ''}`}
                    >
                      <td className="py-4 px-6 text-center font-bold text-on-surface-variant">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs uppercase">
                            {initials}
                          </div>
                          <span className="font-bold text-on-surface">{item.sinhVien?.ho_ten}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-on-surface-variant">
                        {item.sinhVien?.mssv}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex bg-[#ecefe6]/60 p-1 rounded-xl w-max border border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'CoMat')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                              stateRecord.status === 'CoMat'
                                ? 'bg-secondary text-white shadow-sm'
                                : 'text-on-surface-variant hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Có mặt</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'Vang')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                              stateRecord.status === 'Vang'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-on-surface-variant hover:bg-slate-100'
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Vắng</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'TuChoiThamGia')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                              stateRecord.status === 'TuChoiThamGia'
                                ? 'bg-error text-white shadow-sm'
                                : 'text-on-surface-variant hover:bg-slate-100'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="text"
                          value={stateRecord.note}
                          onChange={(e) => handleNoteChange(item.id, e.target.value)}
                          placeholder={isRejected ? "Nhập lý do từ chối..." : "Thêm ghi chú..."}
                          className={`w-full px-3 py-1.5 bg-[#f8faf1] border rounded-lg text-xs font-semibold focus:outline-none transition-all ${
                            isRejected 
                              ? 'border-red-200 focus:border-red-400 bg-red-50/10 placeholder:text-red-300' 
                              : 'border-surface-variant focus:border-primary'
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveAttendance}
          disabled={loading || students.length === 0}
          className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>Lưu điểm danh</span>
        </button>
      </div>
    </div>
  );
}
