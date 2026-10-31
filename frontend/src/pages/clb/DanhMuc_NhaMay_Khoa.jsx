import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, ChevronDown, Check,
  Edit2, Trash2, AlertTriangle, Wifi, Users, X
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function DanhMuc_NhaMay_Khoa() {
  const navigate = useNavigate();
  const [factories, setFactories] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('Tất cả');

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null); // null means Create
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [draftWarningTarget, setDraftWarningTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form States
  const [tenNhaMay, setTenNhaMay] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [hoTroTrucTiep, setHoTroTrucTiep] = useState(true);
  const [hoTroTrucTuyen, setHoTroTrucTuyen] = useState(false);
  const [trangThai, setTrangThai] = useState('HoatDong');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFactories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterTrangThai]);

  const fetchFactories = async () => {
    try {
      const res = await khoaApi.getFactories();
      setFactories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditData(null);
    setTenNhaMay('');
    setDiaChi('');
    setHoTroTrucTiep(true);
    setHoTroTrucTuyen(false);
    setTrangThai('HoatDong');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (factory) => {
    setEditData(factory);
    setTenNhaMay(factory.ten_nha_may);
    setDiaChi(factory.dia_chi);
    setHoTroTrucTiep(factory.ho_tro_truc_tiep);
    setHoTroTrucTuyen(factory.ho_tro_truc_tuyen);
    setTrangThai(factory.trang_thai);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editData) {
        // Nếu chuyển từ Hoạt động sang Ngừng hợp tác mà còn chuyến nháp
        if (editData.trang_thai === 'HoatDong' && trangThai === 'NgungHopTac' && editData.so_chuyen_nhap > 0) {
          setIsSubmitting(false);
          setIsModalOpen(false);
          setDraftWarningTarget(editData);
          return;
        }

        // Edit mode
        await khoaApi.updateFactory(editData.id, {
          ten_nha_may: tenNhaMay,
          dia_chi: diaChi,
          ho_tro_truc_tiep: hoTroTrucTiep,
          ho_tro_truc_tuyen: hoTroTrucTuyen,
          trang_thai: trangThai,
        });
        toast.success('Cập nhật thông tin nhà máy thành công');
      } else {
        // Create mode
        await khoaApi.createFactory({
          ten_nha_may: tenNhaMay,
          dia_chi: diaChi,
          ho_tro_truc_tiep: hoTroTrucTiep,
          ho_tro_truc_tuyen: hoTroTrucTuyen,
        });
        toast.success('Thêm mới nhà máy thành công');
      }
      setIsModalOpen(false);
      setEditData(null);
      setTenNhaMay('');
      setDiaChi('');
      setHoTroTrucTiep(true);
      setHoTroTrucTuyen(false);
      setTrangThai('HoatDong');
      fetchFactories();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (factory) => {
    try {
      const next = factory.trang_thai === 'HoatDong' ? 'NgungHopTac' : 'HoatDong';
      if (next === 'NgungHopTac' && factory.so_chuyen_nhap > 0) {
        setDraftWarningTarget(factory);
        return;
      }
      await khoaApi.updateFactory(factory.id, { trang_thai: next });
      toast.success(next === 'NgungHopTac' ? 'Đã chuyển sang Ngừng hợp tác' : 'Đã kích hoạt lại Hoạt động');
      fetchFactories();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi đổi trạng thái');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await khoaApi.deleteFactory(deleteTarget.id);
      toast.success(`Đã xóa nhà máy "${deleteTarget.ten_nha_may}" thành công!`);
      setDeleteTarget(null);
      fetchFactories();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi xóa nhà máy';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmStopCooperation = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.so_chuyen_nhap > 0) {
      setDraftWarningTarget(deleteTarget);
      setDeleteTarget(null);
      return;
    }
    setIsDeleting(true);
    try {
      await khoaApi.updateFactory(deleteTarget.id, { trang_thai: 'NgungHopTac' });
      toast.success(`Đã chuyển nhà máy "${deleteTarget.ten_nha_may}" sang trạng thái Ngừng hợp tác!`);
      setDeleteTarget(null);
      fetchFactories();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái nhà máy');
    } finally {
      setIsDeleting(false);
    }
  };

  const trangThaiOptions = ["Tất cả", "Hoạt động", "Ngừng hợp tác"];

  const filteredFactories = factories.filter(f => {
    const matchesSearch = f.ten_nha_may?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTrangThai = true;
    if (filterTrangThai === "Hoạt động") matchesTrangThai = f.trang_thai === 'HoatDong';
    if (filterTrangThai === "Ngừng hợp tác") matchesTrangThai = f.trang_thai !== 'HoatDong';
    
    return matchesSearch && matchesTrangThai;
  });

  const totalFactories = filteredFactories.length;
  const totalPages = Math.ceil(totalFactories / limit) || 1;
  const validCurrentPage = Math.min(page, totalPages);
  const paginatedFactories = filteredFactories.slice((validCurrentPage - 1) * limit, validCurrentPage * limit);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Nhà máy</h1>
        <button 
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm nhà máy
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo tên nhà máy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
          />
        </div>

        {/* Trạng thái Dropdown */}
        <SearchableDropdown
          options={trangThaiOptions.map(opt => ({ value: opt, label: opt }))}
          value={filterTrangThai}
          onChange={(val) => setFilterTrangThai(val)}
          placeholder="Tất cả trạng thái"
          searchPlaceholder="Tìm trạng thái..."
          className="min-w-[170px]"
        />
      </div>

      {/* Main Table Content */}
      <div className="relative z-10 space-y-6">
        {paginatedFactories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] p-12 text-center text-slate-500 font-medium">
            Không tìm thấy nhà máy nào khớp điều kiện
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E7E0C4]">
                    <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12">STT</th>
                    <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[35%]">Tên nhà máy</th>
                    <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[35%]">Địa chỉ</th>
                    <th className="px-3 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hình thức</th>
                    <th className="px-3 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider w-28">Trạng thái</th>
                    <th className="px-3 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                  {paginatedFactories.map((f, index) => {
                    const isHoatDong = f.trang_thai === 'HoatDong';
                    return (
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 text-slate-500 font-mono text-xs text-center">{(page - 1) * limit + index + 1}</td>
                        <td className="px-3 py-3">
                          <span className="font-bold text-slate-800">{f.ten_nha_may}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-slate-500">{f.dia_chi || '—'}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <div className={`flex items-center w-[85px] gap-1.5 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-colors ${
                              f.ho_tro_truc_tiep
                                ? 'bg-[#89B449]/20 text-[#407F3E] border border-[#89B449]/30'
                                : 'bg-white text-slate-400 border border-slate-200'
                            }`}>
                              <Users className="w-3 h-3 shrink-0" />
                              Trực tiếp
                            </div>
                            <div className={`flex items-center w-[85px] gap-1.5 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-colors ${
                              f.ho_tro_truc_tuyen
                                ? 'bg-[#89B449]/20 text-[#407F3E] border border-[#89B449]/30'
                                : 'bg-white text-slate-400 border border-slate-200'
                            }`}>
                              <Wifi className="w-3 h-3 shrink-0" />
                              Trực tuyến
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div
                            className={`inline-flex whitespace-nowrap items-center px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border cursor-pointer hover:opacity-80 transition-colors ${
                              isHoatDong
                                ? 'bg-[#89B449] text-white border-[#407F3E]/20'
                                : 'bg-slate-200 text-slate-500 border-slate-300'
                            }`}
                            title="Nhấn để đổi trạng thái"
                            onClick={() => toggleStatus(f)}
                          >
                            {isHoatDong ? 'Hoạt động' : 'Ngưng hợp tác'}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(f)}
                              className="p-1.5 text-slate-400 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(f)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa nhà máy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border border-[#E7E0C4] bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <SearchableDropdown 
              options={[
                { value: 15, label: '15' },
                { value: 30, label: '30' },
                { value: 50, label: '50' },
                { value: 100, label: '100' }
              ]}
              value={limit}
              onChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              searchPlaceholder="Tìm số lượng..."
              className="min-w-[80px]"
              direction="up"
            />
            <span>/ {totalFactories} nhà máy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={validCurrentPage <= 1}
              onClick={() => setPage(1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button 
              disabled={validCurrentPage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {validCurrentPage} / {totalPages}
            </span>
            
            <button 
              disabled={validCurrentPage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button 
              disabled={validCurrentPage >= totalPages}
              onClick={() => setPage(totalPages)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {editData ? 'Chỉnh sửa doanh nghiệp' : 'Thêm doanh nghiệp mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên nhà máy / Công ty <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={tenNhaMay}
                  onChange={e => setTenNhaMay(e.target.value)}
                  placeholder="Ví dụ: Công ty Cổ phần Acecook..."
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Địa chỉ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={diaChi}
                  onChange={e => setDiaChi(e.target.value)}
                  placeholder="Ví dụ: KCN Tân Bình, TP.HCM"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] text-sm transition-all"
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Khả năng hỗ trợ tham quan</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hoTroTrucTiep}
                      onChange={e => setHoTroTrucTiep(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#407F3E] focus:ring-[#407F3E]"
                    />
                    <span className="text-sm font-medium text-slate-700">Trực tiếp (Offline)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hoTroTrucTuyen}
                      onChange={e => setHoTroTrucTuyen(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#407F3E] focus:ring-[#407F3E]"
                    />
                    <span className="text-sm font-medium text-slate-700">Trực tuyến (Online)</span>
                  </label>
                </div>
              </div>

              {editData && (
                <div className="pt-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Trạng thái</label>
                  <SearchableDropdown
                    value={trangThai}
                    onChange={(val) => setTrangThai(val)}
                    options={[
                      { value: 'HoatDong', label: 'Hoạt động (Đang hợp tác)' },
                      { value: 'NgungHopTac', label: 'Ngừng hợp tác' }
                    ]}
                    className="w-full"
                    searchPlaceholder="Tìm trạng thái..."
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang xử lý...' : (editData ? 'Lưu thay đổi' : 'Thêm nhà máy')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cảnh báo có chuyến đi / Xác nhận xóa */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            {deleteTarget.so_chuyen_nhap > 0 ? (
              // Kịch bản A: Có chuyến tham quan ở trạng thái NHÁP -> Chặn ngừng hợp tác và yêu cầu xóa chuyến nháp trước
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Không thể xóa hoặc ngừng hợp tác
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đang có chuyến tham quan ở trạng thái Nháp
                    </p>
                  </div>
                </div>

                <div className="space-y-3 bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl text-sm text-slate-700 leading-relaxed mb-6">
                  <p>
                    Nhà máy <strong className="text-slate-900 font-semibold">{deleteTarget.ten_nha_may}</strong> hiện đang có{' '}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                      {deleteTarget.so_chuyen_nhap} chuyến tham quan ở trạng thái Nháp
                    </span>.
                  </p>
                  <p className="text-xs text-slate-600">
                    Bạn cần vào mục <strong className="text-slate-800">Chuyến tham quan</strong> để xóa các chuyến tham quan nháp này trước khi thực hiện thao tác.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget(null);
                      navigate('/clb/trips');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#407F3E] hover:bg-[#407F3E]/90 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    Đi đến Chuyến tham quan
                  </button>
                </div>
              </div>
            ) : deleteTarget.so_chuyen_tham_quan > 0 ? (
              // Kịch bản B: Không có chuyến nháp nhưng đã có chuyến tham quan lịch sử (đã duyệt, đã diễn ra...)
              // -> Không thể xóa vĩnh viễn dữ liệu học vụ, nhưng CHO PHÉP chuyển sang Ngừng hợp tác
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Không thể xóa vĩnh viễn nhà máy
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Có dữ liệu chuyến tham quan lịch sử liên quan
                    </p>
                  </div>
                </div>

                <div className="space-y-3 bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl text-sm text-slate-700 leading-relaxed mb-6">
                  <p>
                    Nhà máy <strong className="text-slate-900 font-semibold">{deleteTarget.ten_nha_may}</strong> đã gắn liền với{' '}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                      {deleteTarget.so_chuyen_tham_quan} chuyến tham quan / đề xuất
                    </span>{' '}
                    trong hệ thống.
                  </p>
                  <p className="text-xs text-slate-600">
                    Để đảm bảo tính toàn vẹn dữ liệu điểm số và phiếu tham quan của sinh viên, hệ thống{' '}
                    <strong className="text-red-600 font-semibold">không cho phép xóa</strong> nhà máy này.
                  </p>
                  <p className="text-xs text-slate-600">
                    Bạn có thể chuyển nhà máy sang trạng thái{' '}
                    <strong className="text-amber-700 font-semibold">Ngừng hợp tác</strong> để không còn tiếp tục lập chuyến đi mới.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  {deleteTarget.trang_thai === 'NgungHopTac' ? (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      Đã hiểu (Đang ngừng hợp tác)
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleConfirmStopCooperation}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {isDeleting ? 'Đang cập nhật...' : 'Xác nhận ngừng hợp tác'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Kịch bản C: Chưa có chuyến tham quan nào -> Cho phép xóa vĩnh viễn
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Xác nhận xóa nhà máy
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Thao tác này không thể hoàn tác
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Bạn có chắc chắn muốn xóa vĩnh viễn nhà máy{' '}
                  <strong className="text-slate-900 font-semibold">{deleteTarget.ten_nha_may}</strong> khỏi hệ thống?
                </p>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Cảnh báo Chuyến tham quan Nháp khi chọn Ngừng hợp tác */}
      {draftWarningTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Không thể ngừng hợp tác
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đang có chuyến tham quan ở trạng thái Nháp
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl text-sm text-slate-700 leading-relaxed mb-6">
              <p>
                Nhà máy <strong className="text-slate-900 font-semibold">{draftWarningTarget.ten_nha_may}</strong> hiện đang có{' '}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                  {draftWarningTarget.so_chuyen_nhap} chuyến tham quan ở trạng thái Nháp
                </span>.
              </p>
              <p className="text-xs text-slate-600">
                Bạn cần vào mục <strong className="text-slate-800">Chuyến tham quan</strong> để xóa các chuyến tham quan nháp này trước khi chuyển nhà máy sang trạng thái Ngừng hợp tác.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDraftWarningTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftWarningTarget(null);
                  navigate('/clb/trips');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#407F3E] hover:bg-[#407F3E]/90 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                Đi đến Chuyến tham quan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
