import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Check,
  Key, Lock, Unlock
} from 'lucide-react';

const initialUserAccounts = [
  { username: 'admin_khoa', fullname: 'Nguyễn Văn A', role: 'Quản lý khoa', status: 'Hoạt động', lastLogin: '19/08/2023 08:30' },
  { username: 'gv_tuan', fullname: 'Lê Minh Tuấn', role: 'Giảng viên', status: 'Hoạt động', lastLogin: '18/08/2023 15:45' },
  { username: 'sv_hoa', fullname: 'Phạm Thị Hoa', role: 'Sinh viên', status: 'Khóa tài khoản', lastLogin: '15/08/2023 09:12' },
  { username: 'gv_lan', fullname: 'Trần Thị Lan', role: 'Giảng viên', status: 'Hoạt động', lastLogin: '19/08/2023 10:20' },
  { username: 'sv_hung', fullname: 'Nguyễn Duy Hưng', role: 'Sinh viên', status: 'Hoạt động', lastLogin: '19/08/2023 14:05' },
  { username: 'sv_dung', fullname: 'Lê Tiến Dũng', role: 'Sinh viên', status: 'Hoạt động', lastLogin: '17/08/2023 11:30' },
  { username: 'admin_audit', fullname: 'Vũ Quốc Huy', role: 'Quản lý khoa', status: 'Hoạt động', lastLogin: '12/08/2023 16:50' },
  { username: 'gv_phuong', fullname: 'Đỗ Minh Phương', role: 'Giảng viên', status: 'Khóa tài khoản', lastLogin: '10/08/2023 13:15' }
];

export default function TaiKhoanNguoiDung_Khoa() {
  const [accounts, setAccounts] = useState(initialUserAccounts);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Tất cả vai trò');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  const [filterTrangThai, setFilterTrangThai] = useState('Tất cả');
  const [isTrangThaiDropdownOpen, setIsTrangThaiDropdownOpen] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterRole, filterTrangThai]);

  const roleOptions = ["Tất cả vai trò", "Quản lý khoa", "Giảng viên", "Sinh viên"];
  const trangThaiOptions = ["Tất cả", "Hoạt động", "Khóa tài khoản"];

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.fullname.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesRole = true;
    if (filterRole !== "Tất cả vai trò") {
      matchesRole = acc.role === filterRole;
    }

    let matchesTrangThai = true;
    if (filterTrangThai !== "Tất cả") {
      matchesTrangThai = acc.status === filterTrangThai;
    }
    
    return matchesSearch && matchesRole && matchesTrangThai;
  });

  const totalAccounts = filteredAccounts.length;
  const totalPages = Math.ceil(totalAccounts / limit) || 1;
  const paginatedAccounts = filteredAccounts.slice((page - 1) * limit, page * limit);

  const handleToggleStatus = (username) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.username === username) {
        const nextStatus = acc.status === 'Hoạt động' ? 'Khóa tài khoản' : 'Hoạt động';
        return { ...acc, status: nextStatus };
      }
      return acc;
    }));
  };

  const handleResetPassword = (fullname) => {
    if (window.confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu của ${fullname}?`)) {
      alert(`Đã đặt lại mật khẩu cho: ${fullname}`);
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-2 animate-in fade-in duration-300">
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
            <span className="text-slate-700 font-medium truncate pr-2">{filterRole}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isRoleDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {roleOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setFilterRole(opt); setIsRoleDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    (filterRole === opt) 
                      ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                      : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {filterRole === opt && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
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
            <span className="text-slate-700 font-medium">{filterTrangThai}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          {isTrangThaiDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {trangThaiOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { setFilterTrangThai(opt); setIsTrangThaiDropdownOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    (filterTrangThai === opt) 
                      ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                      : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                  }`}
                >
                  {opt}
                  {filterTrangThai === opt && <Check className="w-4 h-4 text-[#407F3E]" />}
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
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">Không tìm thấy tài khoản nào khớp điều kiện</td>
                </tr>
              ) : (
                paginatedAccounts.map(acc => {
                  const isLocked = acc.status === 'Khóa tài khoản';
                  
                  let roleColor = '';
                  if (acc.role === 'Quản lý khoa') roleColor = 'bg-[#407F3E] text-white';
                  else if (acc.role === 'Giảng viên') roleColor = 'bg-[#89B449] text-white';
                  else roleColor = 'bg-[#E7E0C4] text-slate-800 border border-[#407F3E]/20';

                  return (
                    <tr key={acc.username} className={`transition-colors ${isLocked ? 'bg-slate-50/50 opacity-80 hover:opacity-100' : 'hover:bg-slate-50'}`}>
                      <td className="p-4 pl-6 font-mono font-bold text-slate-800">{acc.username}</td>
                      <td className="p-4 font-bold text-slate-700">{acc.fullname}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${roleColor}`}>
                          {acc.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm border ${
                          isLocked 
                            ? 'bg-[#E68A8C] text-white border-[#E68A8C]/20' 
                            : 'bg-[#89B449] text-white border-[#89B449]/20'
                        }`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-500 font-medium">
                        {acc.lastLogin || '-'}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end items-center gap-2 text-slate-400">
                          {/* Reset Password */}
                          <button 
                            onClick={() => handleResetPassword(acc.fullname)}
                            className="p-1.5 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg transition-colors cursor-pointer" 
                            title="Đặt lại mật khẩu"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          
                          {/* Toggle Lock */}
                          <button
                            onClick={() => handleToggleStatus(acc.username)}
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
        {paginatedAccounts.length > 0 && (
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
