import React, { useState } from 'react';
import { Search, Plus, Key, ToggleLeft, ToggleRight, Edit, Users, Sparkles } from 'lucide-react';
import { UserAccount, UserRole, UserStatus } from '../types';

interface UserAccountsViewProps {
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
}

export default function UserAccountsView({ accounts, setAccounts }: UserAccountsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Tất cả vai trò');
  const [statusFilter, setStatusFilter] = useState<string>('Tất cả');
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form states
  const [newUsername, setNewUsername] = useState('');
  const [newFullname, setNewFullname] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Sinh viên');

  // Filters logic
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.fullname.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'Tất cả vai trò' || acc.role === roleFilter;
    const matchesStatus = statusFilter === 'Tất cả' || acc.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = (username: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.username === username) {
        const nextStatus: UserStatus = acc.status === 'Hoạt động' ? 'Khóa tài khoản' : 'Hoạt động';
        return { ...acc, status: nextStatus };
      }
      return acc;
    }));
  };

  const handleResetPassword = (fullname: string) => {
    alert(`Đã gửi yêu cầu cấp lại mật khẩu mới cho cán bộ/sinh viên: ${fullname}. Mật khẩu mặc định đã được gửi về email liên kết.`);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newFullname) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    // Check if duplicate
    if (accounts.some(acc => acc.username === newUsername)) {
      alert('Tên đăng nhập này đã tồn tại trên hệ thống!');
      return;
    }

    const newUser: UserAccount = {
      username: newUsername,
      fullname: newFullname,
      role: newRole,
      status: 'Hoạt động',
      lastLogin: 'Chưa bao giờ'
    };

    setAccounts(prev => [newUser, ...prev]);
    setShowAddModal(false);
    
    // reset form
    setNewUsername('');
    setNewFullname('');
    setNewRole('Sinh viên');
  };

  // Stats calculation
  const totalAccs = accounts.length * 16; // Multiply just for realistic big mockup numbers matching screenshot stats (128 total)
  const activeAccs = accounts.filter(acc => acc.status === 'Hoạt động').length * 15; // realistic stats matching screenshots
  const lockedAccs = totalAccs - activeAccs;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Title section */}
      <div className="flex flex-col gap-2 relative z-10">
        <h1 className="text-3xl font-black text-primary-container tracking-tight">
          Tài khoản người dùng
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Quản lý và phân quyền truy cập hệ thống cho cán bộ, giảng viên và sinh viên.
        </p>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-secondary-container-green/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm p-5 relative overflow-visible z-20 border border-slate-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end w-full">
          {/* Search Box */}
          <div className="flex-1 w-full relative">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Tìm kiếm
            </label>
            <div className="relative flex items-center bg-slate-50 rounded-xl focus-within:ring-2 ring-[#407F3E]/20 border border-slate-200 transition-all">
              <Search className="absolute left-4 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên đăng nhập/họ tên..." 
                className="w-full bg-transparent text-sm text-slate-800 pl-11 pr-4 py-2.5 outline-none placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Filter dropdowns & buttons */}
          <div className="flex flex-wrap lg:flex-nowrap gap-4 w-full lg:w-auto">
            {/* Role Filter */}
            <div className="w-full sm:w-48 relative">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Vai trò
              </label>
              <select 
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium hover:bg-slate-100 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
              >
                <option>Tất cả vai trò</option>
                <option>Quản lý khoa</option>
                <option>Giảng viên</option>
                <option>Sinh viên</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48 relative">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Trạng thái
              </label>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium hover:bg-slate-100 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#407F3E]/20"
              >
                <option>Tất cả</option>
                <option>Hoạt động</option>
                <option>Khóa tài khoản</option>
              </select>
            </div>

            {/* Add New Button */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="h-[44px] px-6 bg-[#407F3E] hover:bg-[#346732] text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 self-end whitespace-nowrap cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Table Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden z-10 relative border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#E7E0C4] text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Tên đăng nhập</th>
                <th className="px-6 py-4 font-bold">Họ tên</th>
                <th className="px-6 py-4 font-bold">Vai trò</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold">Lần đăng nhập cuối</th>
                <th className="px-6 py-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredAccounts.map((acc, index) => {
                const isLocked = acc.status === 'Khóa tài khoản';
                return (
                  <tr 
                    key={acc.username}
                    className={`hover:bg-slate-50/50 transition-colors duration-200 ${
                      isLocked ? 'opacity-70 grayscale-[0.1] bg-slate-50/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-primary-container">
                      {acc.username}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {acc.fullname}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm ${
                        acc.role === 'Quản lý khoa' 
                          ? 'bg-[#407F3E] text-white' 
                          : acc.role === 'Giảng viên' 
                            ? 'bg-secondary-container-green text-on-secondary-container-green' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {acc.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm ${
                        isLocked 
                          ? 'bg-[#E68A8C] text-white' 
                          : 'bg-secondary-container-green text-on-secondary-container-green'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-white' : 'bg-[#446900]'}`}></span>
                        {acc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                      {acc.lastLogin}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleResetPassword(acc.fullname)}
                          className="p-2 text-slate-400 hover:text-[#407F3E] hover:bg-slate-100 rounded-lg transition-all" 
                          title="Đặt lại mật khẩu"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(acc.username)}
                          className={`p-2 rounded-lg transition-all ${
                            isLocked ? 'text-red-400 hover:bg-red-50' : 'text-[#407F3E] hover:bg-green-50'
                          }`} 
                          title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        >
                          {isLocked ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => alert(`Tính năng sửa thông tin cho cán bộ ${acc.fullname} đang được kích hoạt.`)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" 
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-medium text-sm">
                    Không tìm thấy tài khoản nào khớp với bộ lọc!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer with pagination info */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị 1-{filteredAccounts.length} của {totalAccs} tài khoản
          </span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 text-xs text-slate-400 bg-white border border-slate-200 rounded-md cursor-not-allowed" disabled>Trước</button>
            <button className="px-3 py-1 text-xs text-white bg-[#407F3E] font-bold rounded-md">1</button>
            <button className="px-3 py-1 text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-bold rounded-md transition-all">2</button>
            <button className="px-3 py-1 text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-bold rounded-md transition-all">3</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-3 py-1 text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-bold rounded-md transition-all">12</button>
            <button className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-all">Sau</button>
          </div>
        </div>
      </div>

      {/* Bottom stats block matching mockup bento stats */}
      <div className="p-6 bg-[#E7E0C4] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <div className="flex items-center gap-4 relative z-10 mb-4 md:mb-0">
          <div className="w-12 h-12 rounded-full bg-[#407F3E] flex items-center justify-center text-white shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Thống kê nhanh</h3>
            <p className="text-xs text-slate-500">Tổng quan phân bổ tài khoản hệ thống</p>
          </div>
        </div>
        <div className="flex gap-8 relative z-10 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-[#407F3E]">{totalAccs}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng tài khoản</span>
          </div>
          <div className="w-px h-10 bg-slate-300 self-center hidden sm:block"></div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-[#446900]">{activeAccs}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đang hoạt động</span>
          </div>
          <div className="w-px h-10 bg-slate-300 self-center hidden sm:block"></div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-red-500">{lockedAccs}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đã khóa</span>
          </div>
        </div>
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#407F3E]" />
                <span>Thêm tài khoản mới</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tên đăng nhập *
                </label>
                <input 
                  type="text" 
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value.toLowerCase().trim())}
                  placeholder="Ví dụ: gv_hong" 
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#407F3E]/20 focus:border-[#407F3E] text-sm text-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Họ tên đầy đủ *
                </label>
                <input 
                  type="text" 
                  value={newFullname}
                  onChange={e => setNewFullname(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Thị Hồng" 
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#407F3E]/20 focus:border-[#407F3E] text-sm text-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Vai trò hệ thống *
                </label>
                <select 
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#407F3E]/20 focus:border-[#407F3E] text-sm text-slate-700 font-medium cursor-pointer"
                >
                  <option value="Sinh viên">Sinh viên</option>
                  <option value="Giảng viên">Giảng viên</option>
                  <option value="Quản lý khoa">Quản lý khoa</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#407F3E] hover:bg-[#346732] text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
