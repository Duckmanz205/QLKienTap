import React, { useState } from 'react';
import { Search, Key, RotateCcw, Lock, Unlock, Users, Sparkles } from 'lucide-react';

const initialUserAccounts = [
  { username: 'admin_khoa', fullname: 'Nguyễn Văn A', role: 'Quản lý khoa', status: 'Đang hoạt động' },
  { username: 'gv_tuan', fullname: 'Lê Minh Tuấn', role: 'Giảng viên', status: 'Đang hoạt động' },
  { username: 'sv_hoa', fullname: 'Phạm Thị Hoa', role: 'Sinh viên', status: 'Đã khóa' },
  { username: 'gv_lan', fullname: 'Trần Thị Lan', role: 'Giảng viên', status: 'Đang hoạt động' },
  { username: 'sv_hung', fullname: 'Nguyễn Duy Hưng', role: 'Sinh viên', status: 'Đang hoạt động' },
  { username: 'sv_dung', fullname: 'Lê Tiến Dũng', role: 'Sinh viên', status: 'Đang hoạt động' },
  { username: 'admin_audit', fullname: 'Vũ Quốc Huy', role: 'Quản lý khoa', status: 'Đang hoạt động' },
  { username: 'gv_phuong', fullname: 'Đỗ Minh Phương', role: 'Giảng viên', status: 'Đã khóa' }
];

export default function TaiKhoanNguoiDung_Khoa() {
  const [accounts, setAccounts] = useState(initialUserAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả');

  // Filters logic
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          acc.fullname.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Tất cả' || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (username) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.username === username) {
        const nextStatus = acc.status === 'Đang hoạt động' ? 'Đã khóa' : 'Đang hoạt động';
        return { ...acc, status: nextStatus };
      }
      return acc;
    }));
  };

  const handleResetPassword = (fullname) => {
    alert(`Đã đặt lại mật khẩu của cán bộ/sinh viên: ${fullname} về mật khẩu mặc định.`);
  };

  const handleDefaultPasswordChange = () => {
    const newPass = prompt("Nhập mật khẩu mặc định mới áp dụng cho tài khoản tạo mới:");
    if (newPass) {
      alert(`Đã cập nhật mật khẩu mặc định thành công.`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title section with Đổi mật khẩu mặc định button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Tài khoản người dùng
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản trị trạng thái và cài đặt tài khoản người dùng của cán bộ khoa và sinh viên.
          </p>
        </div>
        <button
          onClick={handleDefaultPasswordChange}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm self-start sm:self-center"
        >
          <Key className="w-4 h-4" />
          <span>Đổi mật khẩu mặc định</span>
        </button>
      </div>

      {/* Filter bar card */}
      <div className="bg-white rounded-2xl border border-[#E7E0C4] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end w-full">
          {/* Search Box */}
          <div className="flex-1 relative">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Tìm kiếm tài khoản
            </label>
            <div className="relative flex items-center bg-[#E7E0C4]/10 rounded-xl border border-[#E7E0C4] focus-within:ring-2 focus-within:ring-[#407F3E]/20 transition-all">
              <Search className="absolute left-4 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm tài khoản..."
                className="w-full bg-transparent text-sm text-slate-850 pl-11 pr-4 py-2.5 outline-none placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-64 relative">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Vai trò
            </label>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full appearance-none bg-[#E7E0C4]/10 border border-[#E7E0C4] rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold hover:bg-[#E7E0C4]/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Sinh viên">Sinh viên</option>
              <option value="Giảng viên">Giảng viên</option>
              <option value="Quản lý khoa">Quản lý khoa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#E7E0C4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-[#E7E0C4]">
              <tr>
                <th className="px-6 py-4 font-bold">Tên đăng nhập</th>
                <th className="px-6 py-4 font-bold">Tên hiển thị</th>
                <th className="px-6 py-4 font-bold">Vai trò</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0C4]/40 text-slate-800 font-medium">
              {filteredAccounts.map((acc) => {
                const isLocked = acc.status === 'Đã khóa';
                return (
                  <tr
                    key={acc.username}
                    className={`hover:bg-[#E7E0C4]/10 transition-colors duration-200 ${isLocked ? 'opacity-75 bg-red-50/20' : ''}`}
                  >
                    <td className="px-6 py-4 font-bold text-slate-700">{acc.username}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{acc.fullname}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                        acc.role === 'Quản lý khoa'
                          ? 'bg-slate-500 text-white'
                          : acc.role === 'Giảng viên'
                            ? 'bg-[#407F3E] text-white'
                            : 'bg-[#89B449] text-white'
                      }`}>
                        {acc.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                        isLocked 
                          ? 'bg-[#E68A8C] text-white' 
                          : 'bg-[#89B449] text-white'
                      }`}>
                        {acc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        {/* Lock / Unlock button */}
                        <button
                          onClick={() => handleToggleStatus(acc.username)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            isLocked 
                              ? 'text-[#89B449] hover:bg-[#89B449]/10' 
                              : 'text-[#E68A8C] hover:bg-[#E68A8C]/10'
                          }`}
                          title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        >
                          {isLocked ? <Unlock className="w-4.5 h-4.5" /> : <Lock className="w-4.5 h-4.5" />}
                        </button>

                        {/* Reset password button */}
                        <button
                          onClick={() => handleResetPassword(acc.fullname)}
                          className="p-2 text-slate-400 hover:text-[#407F3E] hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                          title="Đặt lại MK"
                        >
                          <RotateCcw className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-bold text-sm">
                    Không tìm thấy tài khoản nào khớp với bộ lọc!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
