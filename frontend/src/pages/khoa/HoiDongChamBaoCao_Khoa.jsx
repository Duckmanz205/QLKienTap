import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';

export default function HoiDongChamBaoCao_Khoa() {
  const [schedules, setSchedules] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [enrollments, setEnrollments] = useState([]); // List of students for final grade computation
  
  // Board setup form states
  const [scheduleId, setScheduleId] = useState('');
  const [boardName, setBoardName] = useState('');
  const [boardDate, setBoardDate] = useState('');
  const [boardRoom, setBoardRoom] = useState('');

  // Add Member form states
  const [activeBoardIdForMember, setActiveBoardIdForMember] = useState(null);
  const [memberLecturerId, setMemberLecturerId] = useState('');
  const [memberRole, setMemberRole] = useState('ThanhVien'); // ChuTich | ThuKy | ThanhVien

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const s = await khoaApi.getSchedules(); setSchedules(s.data);
      const l = await khoaApi.getLecturers(); setLecturers(l.data.filter(x => x.du_dk_hoi_dong));

      // Mock list of students needing final grade lock
      setEnrollments([
        { id: 1, sinhVien: { ho_ten: 'Nguyễn Văn A', mssv: '20032101', ten_lop: '14DHTP1' }, lichKienTap: { ten_lich: 'Kế hoạch K14 Thực phẩm' }, diem_tong_ket: null, trang_thai: 'DangThucHien' },
        { id: 2, sinhVien: { ho_ten: 'Trần Thị B', mssv: '20032102', ten_lop: '14DHTP1' }, lichKienTap: { ten_lich: 'Kế hoạch K14 Thực phẩm' }, diem_tong_ket: 8.5, trang_thai: 'Dat' },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await khoaApi.createBoard({
        scheduleId: Number(scheduleId),
        name: boardName,
        date: new Date(boardDate),
        room: boardRoom,
      });
      setMessage('Tạo hội đồng chấm vấn đáp thành công');
      setScheduleId(''); setBoardName(''); setBoardDate(''); setBoardRoom('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await khoaApi.addBoardMember({
        boardId: activeBoardIdForMember,
        lecturerId: Number(memberLecturerId),
        role: memberRole,
      });
      setMessage('Thêm thành viên hội đồng thành công');
      setActiveBoardIdForMember(null);
      setMemberLecturerId('');
      setMemberRole('ThanhVien');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLockGrades = async (enrollmentId) => {
    setMessage('');
    setError('');
    try {
      const userJson = localStorage.getItem('user');
      const { user } = JSON.parse(userJson);
      const res = await khoaApi.lockGrades({
        termStudentId: enrollmentId,
        userId: user.id,
      });
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Chốt và khóa điểm thất bại');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Hội đồng chấm & Khóa điểm học phần</h2>
        <p className="text-slate-500 text-sm">Thiết lập các hội đồng chấm vấn đáp, phân công thành viên ban giám khảo và chốt khóa điểm tổng kết học phần</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Board Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 text-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Tạo hội đồng chấm báo cáo</h3>
          <form onSubmit={handleCreateBoard} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700">Lịch kiến tập áp dụng</label>
              <select required value={scheduleId} onChange={e => setScheduleId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded bg-white">
                <option value="">-- Chọn lịch kế hoạch --</option>
                {schedules.map(s => <option key={s.id} value={s.id}>{s.ten_lich}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700">Tên hội đồng</label>
              <input type="text" required value={boardName} onChange={e => setBoardName(e.target.value)} placeholder="Ví dụ: Hội đồng Thực phẩm Nhóm 1" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded" />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Ngày họp hội đồng</label>
              <input type="date" required value={boardDate} onChange={e => setBoardDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded" />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Phòng họp / Địa điểm</label>
              <input type="text" required value={boardRoom} onChange={e => setBoardRoom(e.target.value)} placeholder="Ví dụ: Phòng D402" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold">Tạo hội đồng</button>
          </form>
        </div>

        {/* Board List / Setup Member */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Quản lý hội đồng vấn đáp</h3>
          <p className="text-slate-500">Mời thầy/cô đủ điều kiện vào ban hội đồng.</p>
          <div className="flex gap-2">
            <button onClick={() => { setActiveBoardIdForMember(1); }} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded font-semibold">
              + Phân nhiệm vụ thành viên (Hội đồng mẫu)
            </button>
          </div>
        </div>
      </div>

      {/* Add Board Member Form */}
      {activeBoardIdForMember && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Mời giảng viên vào ban hội đồng</h3>
          <form onSubmit={handleAddMember} className="flex flex-wrap gap-4 items-end">
            <div className="w-64">
              <label className="block font-medium text-slate-700">Giảng viên (Đạt chuẩn)</label>
              <select required value={memberLecturerId} onChange={e => setMemberLecturerId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded bg-white">
                <option value="">-- Chọn giảng viên --</option>
                {lecturers.map(gv => <option key={gv.id} value={gv.id}>{gv.ho_ten} ({gv.ma_gv})</option>)}
              </select>
            </div>
            <div className="w-48">
              <label className="block font-medium text-slate-700">Vai trò trong hội đồng</label>
              <select value={memberRole} onChange={e => setMemberRole(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded bg-white">
                <option value="ChuTich">Chủ tịch Hội đồng</option>
                <option value="ThuKy">Thư ký Hội đồng</option>
                <option value="ThanhVien">Ủy viên phản biện</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setActiveBoardIdForMember(null)} className="px-4 py-2 border border-slate-300 rounded text-slate-700">Hủy</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-semibold">Thêm thành viên</button>
            </div>
          </form>
        </div>
      )}

      {/* Lock Grades Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Chốt học phần & Khóa điểm tổng kết</h3>
        <p className="text-slate-500">
          Chỉ chốt khi sinh viên đã hoàn thành đầy đủ 3 bài báo cáo thu hoạch và có đủ điểm vấn đáp của các thành viên hội đồng.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold text-left">
              <tr>
                <th className="px-4 py-2">MSSV</th>
                <th className="px-4 py-2">Sinh viên</th>
                <th className="px-4 py-2">Lớp</th>
                <th className="px-4 py-2">Đợt học phần</th>
                <th className="px-4 py-2">Điểm tổng kết</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2 text-right">Khóa điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-600">
              {enrollments.map(e => (
                <tr key={e.id} className="hover:bg-slate-55">
                  <td className="px-4 py-3 font-semibold text-slate-800">{e.sinhVien?.mssv}</td>
                  <td className="px-4 py-3">{e.sinhVien?.ho_ten}</td>
                  <td className="px-4 py-3">{e.sinhVien?.ten_lop}</td>
                  <td className="px-4 py-3">{e.lichKienTap?.ten_lich}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">
                    {e.diem_tong_ket !== null ? `${e.diem_tong_ket}/10` : 'Chưa chốt'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      e.trang_thai === 'Dat' ? 'bg-green-50 text-green-700' :
                      e.trang_thai === 'KhongDat' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {e.trang_thai}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.trang_thai === 'DangThucHien' && (
                      <button onClick={() => handleLockGrades(e.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-semibold transition-colors">
                        Tính & Chốt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
