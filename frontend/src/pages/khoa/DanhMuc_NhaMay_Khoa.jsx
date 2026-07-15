import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';

export default function DanhMuc_NhaMay_Khoa() {
  const [factories, setFactories] = useState([]);
  
  // Create Form State
  const [tenNhaMay, setTenNhaMay] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [nhomNganh, setNhomNganh] = useState('');
  const [hoTroTrucTiep, setHoTroTrucTiep] = useState(true);
  const [hoTroTrucTuyen, setHoTroTrucTuyen] = useState(false);

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFactories();
  }, []);

  const fetchFactories = async () => {
    khoaApi.getFactories().then(res => setFactories(res.data)).catch(err => console.error(err));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await khoaApi.createFactory({
        ten_nha_may: tenNhaMay,
        dia_chi: diaChi,
        nhom_nganh: nhomNganh,
        ho_tro_truc_tiep: hoTroTrucTiep,
        ho_tro_truc_tuyen: hoTroTrucTuyen,
      });
      setMessage('Thêm nhà máy thành công');
      setTenNhaMay('');
      setDiaChi('');
      setNhomNganh('');
      setHoTroTrucTiep(true);
      setHoTroTrucTuyen(false);
      fetchFactories();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const next = currentStatus === 'HoatDong' ? 'NgungHopTac' : 'HoatDong';
      await khoaApi.updateFactory(id, { trang_thai: next });
      fetchFactories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Danh mục Nhà máy / Doanh nghiệp đối tác</h2>
        <p className="text-slate-500 text-sm">Quản lý cơ sở dữ liệu các công ty, cơ sở sản xuất liên kết tổ chức tham quan kiến tập</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Factory */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Thêm doanh nghiệp mới</h3>
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700">Tên nhà máy / Công ty</label>
              <input
                type="text"
                required
                value={tenNhaMay}
                onChange={e => setTenNhaMay(e.target.value)}
                placeholder="Ví dụ: Công ty Cổ phần Acecook Việt Nam"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Địa chỉ</label>
              <input
                type="text"
                required
                value={diaChi}
                onChange={e => setDiaChi(e.target.value)}
                placeholder="Ví dụ: KCN Tân Bình, TP.HCM"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700">Nhóm ngành nghề</label>
              <input
                type="text"
                required
                value={nhomNganh}
                onChange={e => setNhomNganh(e.target.value)}
                placeholder="Ví dụ: Chế biến thực phẩm"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-slate-700">Khả năng hỗ trợ tham quan</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hoTroTrucTiep}
                    onChange={e => setHoTroTrucTiep(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Trực tiếp (Offline)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hoTroTrucTuyen}
                    onChange={e => setHoTroTrucTuyen(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Trực tuyến (Online)</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors"
            >
              Thêm nhà máy
            </button>
          </form>
        </div>

        {/* Factories Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Danh sách đối tác liên kết</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold text-left">
                <tr>
                  <th className="px-4 py-2">Doanh nghiệp</th>
                  <th className="px-4 py-2">Nhóm ngành</th>
                  <th className="px-4 py-2">Hỗ trợ</th>
                  <th className="px-4 py-2">Trạng thái</th>
                  <th className="px-4 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600">
                {factories.map(f => (
                  <tr key={f.id} className="hover:bg-slate-55">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-850">{f.ten_nha_may}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{f.dia_chi}</div>
                    </td>
                    <td className="px-4 py-3">{f.nhom_nganh}</td>
                    <td className="px-4 py-3 space-x-1">
                      {f.ho_tro_truc_tiep && <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Trực tiếp</span>}
                      {f.ho_tro_truc_tuyen && <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Trực tuyến</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${f.trang_thai === 'HoatDong' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {f.trang_thai === 'HoatDong' ? 'Đang hợp tác' : 'Ngưng liên kết'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleStatus(f.id, f.trang_thai)}
                        className={`px-2.5 py-1 rounded font-semibold ${
                          f.trang_thai === 'HoatDong' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {f.trang_thai === 'HoatDong' ? 'Hủy hợp tác' : 'Kích hoạt lại'}
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
  );
}
