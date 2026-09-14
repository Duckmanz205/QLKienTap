import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Check,
  Key, Lock, Unlock
} from 'lucide-react';
import { qtvApi } from '../../services/api';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function TaiKhoanNguoiDung_Khoa() {
  const [accounts, setAccounts] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, ho_ten: '' });
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Tất cả vai trò');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  const [filterTrangThai, setFilterTrangThai] = useState('Tất cả');
  const [isTrangThaiDropdownOpen, setIsTrangThaiDropdownOpen] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [totalPages, setTotalPages] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(0);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    fetchData(page);
  }, [page, limit, filterRole, filterTrangThai]);

  const fetchData = async (targetPage = page) => {
    try {
      const res = await qtvApi.getAccounts({
        page: targetPage,
        limit,
        search: searchTerm,
        vaiTro: filterRole !== "Tất cả vai trò" ? filterRole : undefined,
        trangThai: filterTrangThai !== "Tất cả" ? filterTrangThai : undefined
      });
      setAccounts(res.data.data || []);
      setTotalAccounts(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setPage(targetPage);
    } catch (err) {
      console.error(err);
    }
  };

  const roleOptions = [
    { value: "Tất cả vai trò", label: "Tất cả vai trò" },
    { value: "QuanLyKhoa", label: "Quản lý khoa" },
    { value: "GiangVien", label: "Giảng viên" },
    { value: "SinhVien", label: "Sinh viên" },
  ];
  const trangThaiOptions = [
    { value: "Tất cả", label: "Tất cả" },
    { value: "HoatDong", label: "Hoạt động" },
    { value: "KhoaTaiKhoan", label: "Khóa tài khoản" },
  ];

  const handleToggleStatus = async (id) => {
    try {
      const res = await qtvApi.toggleAccountLock(id);
      setToast({ show: true, message: res.data.message, type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const executeResetPassword = async () => {
    try {
      const res = await qtvApi.resetAccountPassword(confirmModal.id);
      setToast({ show: true, message: res.data.message, type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    } finally {
      setConfirmModal({ show: false, id: null, ho_ten: '' });
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-2 animate-in fade-in duration-300">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      <ConfirmModal
        isOpen={confirmModal.show}
        title="Xác nhận đặt lại mật khẩu"
        message={
          <>
            Bạn có chắc chắn muốn đặt lại mật khẩu của người dùng <span className="font-semibold text-gray-800">{confirmModal.ho_ten || 'này'}</span>? Mật khẩu sẽ được khôi phục về mặc định.
          </>
        }
        actionType="reset"
        onConfirm={executeResetPassword}
        onCancel={() => setConfirmModal({ show: false, id: null, ho_ten: '' })}
      />
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tài khoản người dùng</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo tên đăng nhập/họ tên"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
          />
        </div>

        {/* Vai trò Dropdown */}
        <div className="relative min-w-[200px]">
          <div 
            onClick={() => { setIsRoleDropdownOpen(!isRoleDropdownOpen); setIsTrangThaiDropdownOpen(false); }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isRoleDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="text-slate-700 font-medium truncate pr-2">
              {roleOptions.find(o => o.value === filterRole)?.label || filterRole}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isRoleDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {roleOptions.map(opt => (
                <div 
                  key={opt.value}
                  onClick={() => { setFilterRole(opt.value); setIsRoleDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    (filterRole === opt.value) 
                      ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                      : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                  }`}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  {filterRole === opt.value && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trạng thái Dropdown */}
        <div className="relative min-w-[180px]">
          <div 
            onClick={() => { setIsTrangThaiDropdownOpen(!isTrangThaiDropdownOpen); setIsRoleDropdownOpen(false); }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isTrangThaiDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="text-slate-700 font-medium">
              {trangThaiOptions.find(o => o.value === filterTrangThai)?.label || filterTrangThai}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          {isTrangThaiDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {trangThaiOptions.map(opt => (
                <div 
                  key={opt.value}
                  onClick={() => { setFilterTrangThai(opt.value); setIsTrangThaiDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    (filterTrangThai === opt.value) 
                      ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                      : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                  }`}
                >
                  {opt.label}
                  {filterTrangThai === opt.value && <Check className="w-4 h-4 text-[#407F3E]" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6">Tên đăng nhập</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4 text-center">Vai trò</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Lần đăng nhập cuối</th>
                <th className="p-4 text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">Không tìm thấy tài khoản nào khớp điều kiện</td>
                </tr>
              ) : (
                accounts.map(acc => {
                  const isLocked = acc.trang_thai === 'KhoaTaiKhoan';
                  
                  let roleColor = '';
                  if (acc.vai_tro === 'Quản lý khoa') roleColor = 'bg-[#407F3E] text-white';
                  else if (acc.vai_tro === 'Giảng viên') roleColor = 'bg-[#89B449] text-white';
                  else roleColor = 'bg-[#E7E0C4] text-slate-800 border border-[#407F3E]/20';

                  return (
                    <tr key={acc.id} className={`transition-colors ${isLocked ? 'bg-slate-50/50 opacity-80 hover:opacity-100' : 'hover:bg-slate-50'}`}>
                      <td className="p-4 pl-6 font-mono font-bold text-slate-800">{acc.ten_dang_nhap}</td>
                      <td className="p-4 font-bold text-slate-700">{acc.ho_ten}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${roleColor}`}>
                          {acc.vai_tro}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm border ${
                          isLocked 
                            ? 'bg-[#E68A8C] text-white border-[#E68A8C]/20' 
                            : 'bg-[#89B449] text-white border-[#89B449]/20'
                        }`}>
                          {acc.trang_thai === 'KhoaTaiKhoan' ? 'Khóa tài khoản' : 'Hoạt động'}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-500 font-medium">
                        {acc.lan_dang_nhap_cuoi ? new Date(acc.lan_dang_nhap_cuoi).toLocaleString('vi-VN') : '-'}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end items-center gap-2 text-slate-400">
                          {/* Reset Password */}
                          <button 
                            onClick={() => setConfirmModal({ show: true, id: acc.id, ho_ten: acc.ho_ten })}
                            className="p-1.5 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer"
                            title="Reset mật khẩu"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          
                          {/* Toggle Lock */}
                          <button
                            onClick={() => handleToggleStatus(acc.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isLocked 
                                ? 'text-[#89B449] hover:bg-[#89B449]/10' 
                                : 'text-[#E68A8C] hover:bg-[#E68A8C]/10'
                            }`}
                            title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          >
                            {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {accounts.length > 0 && (
          <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span>Hiển thị</span>
              <select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>/ {totalAccounts} tài khoản</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(1)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trang đầu
              </button>
              <button 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trước
              </button>
              
              <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
                Trang {page} / {totalPages}
              </span>
              
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Sau
              </button>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Trang cuối
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
