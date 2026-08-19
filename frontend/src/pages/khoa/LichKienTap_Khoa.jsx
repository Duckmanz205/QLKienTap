import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { khoaApi } from '../../services/api';

export default function LichKienTap_Khoa() {
  const [campaigns, setCampaigns] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form states
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleCampaignId, setScheduleCampaignId] = useState('');
  const [scheduleCourseId, setScheduleCourseId] = useState('');
  const [scheduleRegBD, setScheduleRegBD] = useState('');
  const [scheduleRegKT, setScheduleRegKT] = useState('');
  const [scheduleBD, setScheduleBD] = useState('');
  const [scheduleKT, setScheduleKT] = useState('');
  const [scheduleReportLimit, setScheduleReportLimit] = useState('');
  const [scheduleScoreLimit, setScheduleScoreLimit] = useState('');

  // Import cohort state
  const [activeImportScheduleId, setActiveImportScheduleId] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const c = await khoaApi.getCampaigns(); setCampaigns(c.data);
      const s = await khoaApi.getSchedules(); setSchedules(s.data);
      const sv = await khoaApi.getStudents({ limit: 1000 }); setStudents(sv.data.data || []);
      const co = await khoaApi.getCourses(); setCourses(co.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await khoaApi.createSchedule({
        ten_lich: scheduleName,
        dot_kien_tap_id: Number(scheduleCampaignId),
        khoa_id: Number(scheduleCourseId),
        tg_mo_dang_ky_tu: scheduleRegBD,
        tg_mo_dang_ky_den: scheduleRegKT,
        tg_dien_ra_tu: scheduleBD,
        tg_dien_ra_den: scheduleKT,
        han_chot_nop_bao_cao: scheduleReportLimit,
        han_chot_diem: scheduleScoreLimit,
      });
      setMessage('Tạo lịch kiến tập lớp thành công');
      setScheduleName(''); setScheduleCampaignId(''); setScheduleCourseId('');
      setScheduleRegBD(''); setScheduleRegKT(''); setScheduleBD(''); setScheduleKT('');
      setScheduleReportLimit(''); setScheduleScoreLimit('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Tạo lịch kiến tập lớp thất bại');
    }
  };

  const handleToggleStudentSelect = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(x => x !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length < 2) {
        alert("File excel không hợp lệ hoặc trống");
        return;
      }
      
      const headerRow = data[0];
      const mssvIndex = headerRow.findIndex(h => {
        if (!h) return false;
        const str = String(h).toLowerCase();
        return str.includes('mssv') || str.includes('mã sinh viên') || str.includes('ma sinh vien') || str.includes('mã sv') || str.includes('masv');
      });

      if (mssvIndex === -1) {
        alert("Không tìm thấy cột 'MSSV' hoặc 'Mã sinh viên' trong file Excel (dòng đầu tiên).");
        return;
      }

      const extractedMssvList = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[mssvIndex]) {
          extractedMssvList.push(String(row[mssvIndex]).trim());
        }
      }

      const matchedIds = students
        .filter(s => extractedMssvList.includes(String(s.mssv)))
        .map(s => s.id);

      setSelectedStudentIds(matchedIds);
      
      if (matchedIds.length === 0) {
        alert(`Đã đọc ${extractedMssvList.length} MSSV từ file nhưng không có sinh viên nào khớp với hệ thống.`);
      } else if (matchedIds.length < extractedMssvList.length) {
        alert(`Tìm thấy ${matchedIds.length}/${extractedMssvList.length} sinh viên khớp. (Một số MSSV trong file không tồn tại trên hệ thống)`);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset input
  };

  const executeImport = async () => {
    setMessage('');
    setError('');
    if (selectedStudentIds.length === 0) {
      alert('Vui lòng chọn ít nhất một sinh viên.');
      return;
    }
    try {
      await khoaApi.importStudents({
        lichId: activeImportScheduleId,
        studentIds: selectedStudentIds,
      });
      setMessage('Nhập danh sách sinh viên vào lịch kiến tập thành công');
      setActiveImportScheduleId(null);
      setSelectedStudentIds([]);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Nhập danh sách sinh viên thất bại');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Lịch kiến tập</h2>
        <p className="text-slate-500 text-sm">Lập lịch trình thời gian chi tiết cho từng lớp sinh viên và quản lý danh sách sinh viên tham gia đợt kiến tập</p>
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

      {/* Forms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
        {/* Create Schedule (LichKienTap) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 h-fit">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Lập lịch kiến tập chi tiết lớp</h3>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700">Tên lịch kiến tập</label>
              <input type="text" required value={scheduleName} onChange={e => setScheduleName(e.target.value)} placeholder="Ví dụ: Kế hoạch kiến tập ngành Thực phẩm K14" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Đợt kiến tập</label>
              <select required value={scheduleCampaignId} onChange={e => setScheduleCampaignId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white">
                <option value="">-- Chọn đợt --</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.ten_dot}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700">Ngành áp dụng</label>
              <select required value={scheduleCourseId} onChange={e => setScheduleCourseId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white">
                <option value="">-- Chọn ngành --</option>
                {courses.map(k => (
                  <option key={k.id} value={k.id}>{k.ten_khoa}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700">Mở đăng ký từ</label>
                <input type="datetime-local" required value={scheduleRegBD} onChange={e => setScheduleRegBD(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300" />
              </div>
              <div>
                <label className="block font-medium text-slate-700">Đến ngày</label>
                <input type="datetime-local" required value={scheduleRegKT} onChange={e => setScheduleRegKT(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700">Thời gian diễn ra từ</label>
                <input type="date" required value={scheduleBD} onChange={e => setScheduleBD(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300" />
              </div>
              <div>
                <label className="block font-medium text-slate-700">Đến ngày</label>
                <input type="date" required value={scheduleKT} onChange={e => setScheduleKT(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700">Hạn chốt báo cáo</label>
                <input type="datetime-local" required value={scheduleReportLimit} onChange={e => setScheduleReportLimit(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300" />
              </div>
              <div>
                <label className="block font-medium text-slate-700">Hạn chốt điểm</label>
                <input type="datetime-local" required value={scheduleScoreLimit} onChange={e => setScheduleScoreLimit(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">Tạo kế hoạch chi tiết</button>
          </form>
        </div>

        {/* Right column: Import panel + Schedules list */}
        <div className="lg:col-span-2 space-y-8">
          {/* Import Student Cohort Panel */}
          {activeImportScheduleId && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Nhập danh sách sinh viên tham gia kiến tập</h3>
                <button onClick={() => setActiveImportScheduleId(null)} className="text-slate-400 hover:text-slate-600">Quay lại</button>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                <div className="text-slate-600">
                  <span className="font-semibold block mb-1">Tải lên file Excel</span>
                  <span>File cần có dòng tiêu đề (header) chứa cột có tên "MSSV" hoặc "Mã sinh viên".</span>
                </div>
                <div>
                  <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="text-slate-600" />
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto mt-4">
                {students.map(s => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <div key={s.id} onClick={() => handleToggleStudentSelect(s.id)} className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 hover:bg-slate-50'
                    }`}>
                      <div>
                        <span className="font-semibold text-slate-850">{s.ho_ten}</span>
                        <span className="text-slate-400 ml-2">({s.mssv})</span>
                        <span className="text-slate-500 ml-4">Lớp: {s.ten_lop}</span>
                      </div>
                      <span className={`material-symbols-outlined ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                        {isSelected ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span>Đã chọn: {selectedStudentIds.length} sinh viên</span>
                <button onClick={executeImport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">Nhập sinh viên</button>
              </div>
            </div>
          )}

          {/* Schedules List */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Danh sách kế hoạch lịch kiến tập chi tiết</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold text-left">
                  <tr>
                    <th className="px-4 py-2">Tên lịch kiến tập</th>
                    <th className="px-4 py-2">Đợt áp dụng</th>
                    <th className="px-4 py-2">Thời gian đăng ký</th>
                    <th className="px-4 py-2">Thời gian diễn ra</th>
                    <th className="px-4 py-2">Hạn chốt</th>
                    <th className="px-4 py-2 text-right">Nhập SV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  {schedules.map(sch => (
                    <tr key={sch.id} className="hover:bg-slate-55">
                      <td className="px-4 py-3 font-semibold text-slate-800">{sch.ten_lich}</td>
                      <td className="px-4 py-3">{sch.dotKienTap?.ten_dot}</td>
                      <td className="px-4 py-3">
                        {new Date(sch.tg_mo_dang_ky_tu).toLocaleDateString('vi-VN')} - {new Date(sch.tg_mo_dang_ky_den).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(sch.tg_dien_ra_tu).toLocaleDateString('vi-VN')} - {new Date(sch.tg_dien_ra_den).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <div>Báo cáo: {new Date(sch.han_chot_nop_bao_cao).toLocaleDateString('vi-VN')}</div>
                        <div>Điểm: {new Date(sch.han_chot_diem).toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setActiveImportScheduleId(sch.id); setSelectedStudentIds([]); }} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded font-semibold transition-colors">
                          Nhập SV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
