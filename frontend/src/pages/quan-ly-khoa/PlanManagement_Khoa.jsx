import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, ChevronRight, ChevronDown, Check, X, PlusCircle, Folder, Search,
  Edit2, Trash2, Rocket, MoreVertical
} from 'lucide-react';
import { khoaApi } from '../../services/api';
import Toast from '../../components/Toast';

export default function PlanManagement_Khoa() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [campaigns, setCampaigns] = useState([]);
  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!activeDropdown) return;

    const handleScroll = (e) => {
      // Bỏ qua cuộn trong chính menu (nếu có)
      if (e.target.closest?.('.dropdown-menu-portal')) return;
      setActiveDropdown(null);
    };
    
    const handleClickOutside = (e) => {
      if (e.target.closest?.('.dropdown-trigger') || e.target.closest?.('.dropdown-menu-portal')) return;
      setActiveDropdown(null);
    };
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('click', handleClickOutside, true);
    window.addEventListener('keydown', handleEsc, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('click', handleClickOutside, true);
      window.removeEventListener('keydown', handleEsc, true);
    };
  }, [activeDropdown]);

  const handleDropdownClick = (e, c) => {
    e.stopPropagation();
    if (activeDropdown?.id === c.id) {
      setActiveDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 150;
    
    let top = rect.bottom;
    if (window.innerHeight - rect.bottom < menuHeight) {
      top = rect.top - menuHeight;
    }
    
    setDropdownPos({
      top: top,
      left: rect.right - 192,
    });
    setActiveDropdown(c);
  };

  // Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Delete Confirm State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Publish Confirm State
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  // Modal Form States
  const [campaignName, setCampaignName] = useState('');
  const [campaignBD, setCampaignBD] = useState('');
  const [campaignKT, setCampaignKT] = useState('');
  
  // Custom Dropdown for Năm học
  const [selectedYear, setSelectedYear] = useState('');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Custom Dropdown for Học kỳ
  const [selectedTerm, setSelectedTerm] = useState('');
  const [isTermDropdownOpen, setIsTermDropdownOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [campRes, yearsRes, termsRes] = await Promise.all([
        khoaApi.getCampaigns(),
        khoaApi.getYears(),
        khoaApi.getTerms()
      ]);
      setCampaigns(campRes.data);
      setYears(yearsRes.data);
      setTerms(termsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setCampaignName('');
    setSelectedYear('');
    setSelectedTerm('');
    setCampaignBD('');
    setCampaignKT('');
  };

  const handleSaveCampaign = async () => {
    if (!campaignName || !selectedTerm || !campaignBD || !campaignKT) {
      setToast({ show: true, message: 'Vui lòng điền đầy đủ thông tin', type: 'error' });
      return;
    }
    
    try {
      const payload = {
        ten_dot: campaignName,
        hoc_ky_id: parseInt(selectedTerm),
        ngay_bat_dau: campaignBD,
        ngay_ket_thuc: campaignKT
      };

      if (isEditMode) {
        await khoaApi.updateCampaign(editingId, payload);
        setToast({ show: true, message: 'Cập nhật đợt kiến tập thành công', type: 'success' });
      } else {
        await khoaApi.createCampaign(payload);
        setToast({ show: true, message: 'Tạo đợt kiến tập thành công', type: 'success' });
      }
      resetForm();
      fetchInitialData();
    } catch (err) {
      console.error(err);
      let errorMsg = 'Lỗi khi lưu đợt kiến tập';
      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMsg = err.response.data.message.join(', ');
        } else {
          errorMsg = err.response.data.message;
        }
      }
      setToast({ show: true, message: errorMsg, type: 'error' });
    }
  };

  const handleEditClick = (c) => {
    setCampaignName(c.ten_dot);
    setSelectedYear(c.nam_hoc_id || '');
    setSelectedTerm(c.hoc_ky_id || '');
    setCampaignBD(c.raw_bat_dau);
    setCampaignKT(c.raw_ket_thuc);
    setEditingId(c.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await khoaApi.deleteCampaign(deletingId);
      setToast({ show: true, message: 'Xóa đợt kiến tập thành công', type: 'success' });
      setIsDeleteConfirmOpen(false);
      setDeletingId(null);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.response?.data?.message || 'Lỗi khi xóa đợt kiến tập', type: 'error' });
    }
  };

  const handlePublishClick = (id) => {
    setPublishingId(id);
    setIsPublishConfirmOpen(true);
  };

  const confirmPublish = async () => {
    try {
      await khoaApi.publishCampaign(publishingId);
      setToast({ show: true, message: 'Gửi yêu cầu lập lịch thành công', type: 'success' });
      setIsPublishConfirmOpen(false);
      setPublishingId(null);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.response?.data?.message || 'Lỗi khi gửi yêu cầu', type: 'error' });
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Nháp':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Nháp</span>;
      case 'Đang triển khai':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white border border-[#89B449]/20 shadow-sm">Đang triển khai</span>;
      case 'Đã kết thúc':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 border border-[#DBD468]/20 shadow-sm">Đã kết thúc</span>;
      case 'Đã khóa':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#407F3E] text-white border border-[#407F3E]/20 shadow-sm">Đã khóa</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  // Mock data mapping to fit the columns perfectly
  const displayData = campaigns.map(c => {
    let rawStatus = c.trang_thai || 'Nhap';
    let displayStatus = 'Nháp';
    if (rawStatus === 'Nhap') displayStatus = 'Nháp';
    else if (rawStatus === 'DangTrienKhai') displayStatus = 'Đang triển khai';
    else if (rawStatus === 'DaKetThuc') displayStatus = 'Đã kết thúc';
    else if (rawStatus === 'DaKhoa') displayStatus = 'Đã khóa';
    else if (rawStatus === 'DaHuy') displayStatus = 'Đã hủy';

    return {
      id: c.id,
      ten_dot: c.ten_dot,
      nam_hoc: c.hocKy?.namHoc?.ten_nam_hoc || 'Đang cập nhật',
      nam_hoc_id: c.hocKy?.namHoc?.id,
      hoc_ky: c.hocKy?.ten_hoc_ky || 'Đang cập nhật',
      hoc_ky_id: c.hocKy?.id,
      tg_bat_dau: c.ngay_bat_dau ? new Date(c.ngay_bat_dau).toLocaleDateString('vi-VN') : 'Đang cập nhật',
      tg_ket_thuc: c.ngay_ket_thuc ? new Date(c.ngay_ket_thuc).toLocaleDateString('vi-VN') : 'Đang cập nhật',
      raw_bat_dau: c.ngay_bat_dau ? c.ngay_bat_dau.split('T')[0] : '',
      raw_ket_thuc: c.ngay_ket_thuc ? c.ngay_ket_thuc.split('T')[0] : '',
      trang_thai: displayStatus,
      raw_trang_thai: rawStatus
    };
  });

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-4 animate-in fade-in duration-300 relative">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Đợt kiến tập</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo đợt kiến tập
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">Tên đợt</th>
                <th className="p-4">Năm học</th>
                <th className="p-4">Học kỳ</th>
                <th className="p-4">Ngày bắt đầu</th>
                <th className="p-4">Ngày kết thúc</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">Không có đợt kiến tập nào.</td>
                </tr>
              ) : (
                displayData.map(c => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => setViewingDetail(c)}
                  >
                    <td className="p-4 pl-6 font-bold text-slate-800">{c.ten_dot}</td>
                    <td className="p-4 font-medium text-slate-600">{c.nam_hoc}</td>
                    <td className="p-4 font-medium text-slate-600">{c.hoc_ky}</td>
                    <td className="p-4 font-medium text-slate-600">{c.tg_bat_dau}</td>
                    <td className="p-4 font-medium text-slate-600">{c.tg_ket_thuc}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(c.trang_thai)}
                    </td>
                    <td className="p-4 text-right pr-6 relative" onClick={(e) => e.stopPropagation()}>
                      {c.raw_trang_thai === 'Nhap' ? (
                        <button 
                          onClick={(e) => handleDropdownClick(e, c)}
                          className="dropdown-trigger p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      ) : (
                        <div className="w-8 h-8 inline-block"></div> // Placeholder for alignment
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mockup - "+ Tạo đợt kiến tập" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dimmed Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {isEditMode ? <Edit2 className="w-5 h-5 text-[#407F3E]" /> : <Plus className="w-5 h-5 text-[#407F3E]" />}
                {isEditMode ? 'Sửa đợt kiến tập' : 'Tạo đợt kiến tập'}
              </h2>
              <button 
                onClick={resetForm}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tên đợt</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Đợt kiến tập - Học kỳ 1 - 2025-2026"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Năm học custom dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Năm học</label>
                  <div 
                    onClick={() => { setIsYearDropdownOpen(!isYearDropdownOpen); setIsTermDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isYearDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium ${selectedYear ? 'text-slate-800' : 'text-slate-400'}`}>
                      {years.find(y => y.id === selectedYear)?.ten_nam_hoc || 'Chọn năm học'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                  {isYearDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
                      {years.map(opt => (
                        <div 
                          key={opt.id}
                          onClick={() => { setSelectedYear(opt.id); setIsYearDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            (selectedYear === opt.id) 
                              ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                              : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                        >
                          {opt.ten_nam_hoc}
                          {selectedYear === opt.id && <Check className="w-4 h-4 text-[#407F3E]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Học kỳ custom dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Học kỳ</label>
                  <div 
                    onClick={() => { setIsTermDropdownOpen(!isTermDropdownOpen); setIsYearDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all ${isTermDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                  >
                    <span className={`font-medium ${selectedTerm ? 'text-slate-800' : 'text-slate-400'}`}>
                      {terms.find(t => t.id === selectedTerm)?.ten_hoc_ky || 'Chọn học kỳ'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                  {isTermDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
                      {terms.map(opt => (
                        <div 
                          key={opt.id}
                          onClick={() => { setSelectedTerm(opt.id); setIsTermDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                            (selectedTerm === opt.id) 
                              ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                              : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                        >
                          {opt.ten_hoc_ky}
                          {selectedTerm === opt.id && <Check className="w-4 h-4 text-[#407F3E]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={campaignBD}
                    onChange={(e) => setCampaignBD(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={campaignKT}
                    onChange={(e) => setCampaignKT(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-800 font-medium cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end gap-3">
              <button 
                onClick={resetForm}
                className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveCampaign}
                className="px-5 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Xem chi tiết */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
          ></div>
          
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Chi tiết
              </h2>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {Object.entries({
                'Tên đợt': viewingDetail.ten_dot,
                'Năm học': viewingDetail.nam_hoc,
                'Học kỳ': viewingDetail.hoc_ky,
                'Ngày bắt đầu': viewingDetail.tg_bat_dau,
                'Ngày kết thúc': viewingDetail.tg_ket_thuc,
                'Trạng thái': viewingDetail.trang_thai,
              }).map(([label, value]) => (
                <div key={label} className="flex flex-col border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-medium text-slate-800 break-words">{String(value)}</span>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end rounded-b-2xl">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewingDetail(null); }}
                className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setIsDeleteConfirmOpen(false)}></div>
          <div className="bg-white p-6 rounded-2xl shadow-xl z-10 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Xóa đợt kiến tập</h3>
            <p className="text-sm text-slate-600 mb-6">Bạn có chắc chắn muốn xóa đợt kiến tập này? Thao tác này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold">Hủy</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirm Modal */}
      {isPublishConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setIsPublishConfirmOpen(false)}></div>
          <div className="bg-white p-6 rounded-2xl shadow-xl z-10 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Gửi yêu cầu lập lịch</h3>
            <p className="text-sm text-slate-600 mb-6">Bạn có chắc chắn muốn chốt đợt kiến tập này và chuyển cho Câu lạc bộ lập lịch? Sau khi xác nhận, đợt sẽ không thể chỉnh sửa hay xóa.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsPublishConfirmOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold">Hủy</button>
              <button onClick={confirmPublish} className="px-4 py-2 bg-[#407F3E] text-white rounded-lg hover:bg-[#407F3E]/90 font-bold">Xác nhận gửi</button>
            </div>
          </div>
        </div>
      )}

      {/* Portal Dropdown Menu */}
      {activeDropdown && createPortal(
        <div 
          className="dropdown-menu-portal fixed w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <button 
            onClick={() => { handleEditClick(activeDropdown); setActiveDropdown(null); }} 
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4 mr-3 text-blue-500" /> Sửa
          </button>
          <button 
            onClick={() => { handlePublishClick(activeDropdown.id); setActiveDropdown(null); }} 
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
          >
            <Rocket className="w-4 h-4 mr-3 text-[#407F3E]" /> Lập lịch
          </button>
          <button 
            onClick={() => { handleDeleteClick(activeDropdown.id); setActiveDropdown(null); }} 
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-3 text-red-500" /> Xóa
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
