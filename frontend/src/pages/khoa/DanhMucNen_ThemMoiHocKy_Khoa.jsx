import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';

export default function DanhMucNen_ThemMoiHocKy_Khoa() {
  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);

  // Form states
  const [tenNamHoc, setTenNamHoc] = useState('');
  const [ngayBDNamHoc, setNgayBDNamHoc] = useState('');
  const [ngayKTNamHoc, setNgayKTNamHoc] = useState('');

  const [namHocId, setNamHocId] = useState('');
  const [tenHocKy, setTenHocKy] = useState('');
  const [ngayBDHocKy, setNgayBDHocKy] = useState('');
  const [ngayKTHocKy, setNgayKTHocKy] = useState('');

  const [campaignName, setCampaignName] = useState('');
  const [campaignYearId, setCampaignYearId] = useState('');
  const [campaignTermId, setCampaignTermId] = useState('');
  const [campaignBD, setCampaignBD] = useState('');
  const [campaignKT, setCampaignKT] = useState('');

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
      const y = await khoaApi.getYears(); setYears(y.data);
      const t = await khoaApi.getTerms(); setTerms(t.data);
      const c = await khoaApi.getCampaigns(); setCampaigns(c.data);
      const s = await khoaApi.getSchedules(); setSchedules(s.data);
      const sv = await khoaApi.getStudents(); setStudents(sv.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await khoaApi.createYear({ ten_nam_hoc: tenNamHoc, ngay_bat_dau: ngayBDNamHoc, ngay_ket_thuc: ngayKTNamHoc });
      setMessage('Tạo năm học thành công');
      setTenNamHoc(''); setNgayBDNamHoc(''); setNgayKTNamHoc('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await khoaApi.createTerm({ nam_hoc_id: Number(namHocId), ten_hoc_ky: tenHocKy, ngay_bat_dau: ngayBDHocKy, ngay_ket_thuc: ngayKTHocKy });
      setMessage('Tạo học kỳ thành công');
      setNamHocId(''); setTenHocKy(''); setNgayBDHocKy(''); setNgayKTHocKy('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await khoaApi.createCampaign({
        ten_dot: campaignName,
        nam_hoc_id: Number(campaignYearId),
        hoc_ky_id: Number(campaignTermId),
        ngay_bat_dau: campaignBD,
        ngay_ket_thuc: campaignKT,
      });
      setMessage('Tạo đợt kiến tập thành công');
      setCampaignName(''); setCampaignYearId(''); setCampaignTermId(''); setCampaignBD(''); setCampaignKT('');
      fetchData();
    } catch (err) { console.error(err); }
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
    } catch (err) { console.error(err); }
  };

  const handleToggleStudentSelect = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(x => x !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
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
        <h2 className="text-2xl font-bold text-slate-800">Cấu hình kế hoạch & Đợt kiến tập</h2>
        <p className="text-slate-500 text-sm">Thiết lập danh mục năm học, học kỳ, mở các đợt kiến tập và lập lịch trình thời gian chi tiết cho từng lớp sinh viên</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        {/* Create Year */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Tạo năm học mới</h3>
          <form onSubmit={handleCreateYear} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700">Tên năm học</label>
              <input
                type="text" required value={tenNamHoc} onChange={e => setTenNamHoc(e.target.value)} placeholder="Ví dụ: 2024-2025"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700">Ngày bắt đầu</label>
                <input
                  type="date" required value={ngayBDNamHoc} onChange={e => setNgayBDNamHoc(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700">Ngày kết thúc</label>
                <input
                  type="date" required value={ngayKTNamHoc} onChange={e => setNgayKTNamHoc(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">Tạo năm học</button>
          </form>
        </div>

        {/* Create Term */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Tạo học kỳ mới</h3>
          <form onSubmit={handleCreateTerm} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700">Chọn năm học</label>
              <select required value={namHocId} onChange={e => setNamHocId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                <option value="">-- Chọn năm học --</option>
                {years.map(y => <option key={y.id} value={y.id}>{y.ten_nam_hoc}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700">Tên học kỳ</label>
              <input
                type="text" required value={tenHocKy} onChange={e => setTenHocKy(e.target.value)} placeholder="Ví dụ: Học kỳ 1"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700">Ngày bắt đầu</label>
                <input type="date" required value={ngayBDHocKy} onChange={e => setNgayBDHocKy(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300" />
              </div>
              <div>
                <label className="block font-medium text-slate-700">Ngày kết thúc</label>
                <input type="date" required value={ngayKTHocKy} onChange={e => setNgayKTHocKy(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">Tạo học kỳ</button>
          </form>
        </div>

        {/* Create Campaign */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Thiết lập Đợt kiến tập khoa</h3>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700">Tên đợt kiến tập</label>
              <input type="text" required value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Ví dụ: Đợt kiến tập Hè 2025" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700">Năm học</label>
                <select required value={campaignYearId} onChange={e => setCampaignYearId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white">
                  <option value="">-- Chọn --</option>
                  {years.map(y => <option key={y.id} value={y.id}>{y.ten_nam_hoc}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700">Học kỳ</label>
                <select required value={campaignTermId} onChange={e => setCampaignTermId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white">
                  <option value="">-- Chọn --</option>
                  {terms.map(t => <option key={t.id} value={t.id}>{t.ten_hoc_ky} ({t.namHoc?.ten_nam_hoc})</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700">Ngày triển khai</label>
                <input type="date" required value={campaignBD} onChange={e => setCampaignBD(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300" />
              </div>
              <div>
                <label className="block font-medium text-slate-700">Ngày kết thúc</label>
                <input type="date" required value={campaignKT} onChange={e => setCampaignKT(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">Tạo đợt kiến tập</button>
          </form>
        </div>

        {/* Create Schedule (LichKienTap) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Lập lịch kiến tập chi tiết lớp</h3>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700">Tên lịch kiến tập</label>
              <input type="text" required value={scheduleName} onChange={e => setScheduleName(e.target.value)} placeholder="Ví dụ: Kế hoạch kiến tập ngành Thực phẩm K14" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                  {students.map(s => s.khoa).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).map(k => (
                    <option key={k.id} value={k.id}>{k.ten_khoa}</option>
                  ))}
                </select>
              </div>
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
                <label className="block font-medium text-slate-700">Hạn chốt nộp báo cáo</label>
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
      </div>

      {/* Import Student Cohort Panel */}
      {activeImportScheduleId && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Nhập danh sách sinh viên tham gia kiến tập</h3>
            <button onClick={() => setActiveImportScheduleId(null)} className="text-slate-400 hover:text-slate-600">Quay lại</button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
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
  );
}
