import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';
import { Calendar, PlusCircle, Layers, Folder, Search, FileText } from 'lucide-react';

export default function PlanManagement_Khoa() {
  const [campaigns, setCampaigns] = useState([]);
  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [campaignName, setCampaignName] = useState('');
  const [campaignYearId, setCampaignYearId] = useState('');
  const [campaignTermId, setCampaignTermId] = useState('');
  const [campaignBD, setCampaignBD] = useState('');
  const [campaignKT, setCampaignKT] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const c = await khoaApi.getCampaigns(); setCampaigns(c.data);
      const y = await khoaApi.getYears(); setYears(y.data);
      const t = await khoaApi.getTerms(); setTerms(t.data);
      if (y.data.length > 0) setCampaignYearId(y.data[0].id);
      if (t.data.length > 0) setCampaignTermId(t.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      await khoaApi.createCampaign({
        ten_dot: campaignName,
        nam_hoc_id: Number(campaignYearId),
        hoc_ky_id: Number(campaignTermId),
        tg_bat_dau: campaignBD,
        tg_ket_thuc: campaignKT,
      });
      setMessage('Thêm đợt kiến tập thành công');
      setCampaignName('');
      setCampaignBD('');
      setCampaignKT('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Lỗi khi thêm đợt kiến tập');
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.ten_dot.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-primary w-6 h-6" />
            Quản lý Đợt Kiến tập
          </h2>
          <p className="text-slate-500 text-sm">Thiết lập và quản lý các đợt kiến tập doanh nghiệp chính thức của Khoa</p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-500/30 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-500/30 text-rose-800 px-4 py-3 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Campaign */}
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PlusCircle className="text-primary w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800">Thêm đợt kiến tập mới</h3>
          </div>
          <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1">Tên đợt kiến tập</label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="Ví dụ: Đợt kiến tập hè 2026 - Khoa CNTP"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Năm học</label>
                <select
                  value={campaignYearId}
                  onChange={e => setCampaignYearId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
                >
                  {years.map(y => (
                    <option key={y.id} value={y.id}>{y.ten_nam_hoc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Học kỳ</label>
                <select
                  value={campaignTermId}
                  onChange={e => setCampaignTermId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
                >
                  {terms.map(t => (
                    <option key={t.id} value={t.id}>{t.ten_hoc_ky}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  required
                  value={campaignBD}
                  onChange={e => setCampaignBD(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
                />
              </div>
              <div>
                <label className="block mb-1">Ngày kết thúc</label>
                <input
                  type="date"
                  required
                  value={campaignKT}
                  onChange={e => setCampaignKT(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-[#2c6b2d] text-white py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-sm"
            >
              Tạo đợt kiến tập
            </button>
          </form>
        </div>

        {/* Campaign List */}
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Folder className="text-secondary w-5 h-5" />
              Danh sách đợt kiến tập
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đợt..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary font-semibold"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="bg-[#f8faf1] text-slate-700 font-bold text-left">
                  <th className="px-4 py-3 rounded-l-xl">Tên đợt kiến tập</th>
                  <th className="px-4 py-3">Năm học - Học kỳ</th>
                  <th className="px-4 py-3">Thời gian diễn ra</th>
                  <th className="px-4 py-3 rounded-r-xl text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold">
                {filteredCampaigns.map(c => {
                  const now = new Date();
                  const start = new Date(c.tg_bat_dau);
                  const end = new Date(c.tg_ket_thuc);
                  let status = 'Sắp diễn ra';
                  let statusClass = 'bg-amber-50 text-amber-700 border-amber-200/50';
                  if (now >= start && now <= end) {
                    status = 'Đang diễn ra';
                    statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-250/50';
                  } else if (now > end) {
                    status = 'Đã hoàn thành';
                    statusClass = 'bg-slate-100 text-slate-600 border-slate-200/50';
                  }

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-800">{c.ten_dot}</td>
                      <td className="px-4 py-3.5">
                        {c.namHoc?.ten_nam_hoc} - {c.hocKy?.ten_hoc_ky}
                      </td>
                      <td className="px-4 py-3.5">
                        {new Date(c.tg_bat_dau).toLocaleDateString('vi-VN')} - {new Date(c.tg_ket_thuc).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredCampaigns.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">
                      Không tìm thấy đợt kiến tập nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
