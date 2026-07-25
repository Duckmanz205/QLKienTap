/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount } from '../types';
import { 
  Search, 
  Plus, 
  Key, 
  Lock, 
  Unlock, 
  Trash2, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle 
} from 'lucide-react';

interface AccountViewProps {
  accounts: UserAccount[];
  onAddAccount: (account: UserAccount) => void;
  onToggleStatus: (id: string) => void;
  onResetPassword: (id: string) => void;
  onDeleteAccount: (id: string) => void;
}

export default function AccountView({
  accounts,
  onAddAccount,
  onToggleStatus,
  onResetPassword,
  onDeleteAccount
}: AccountViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'lecturer' | 'student'>('student');

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'All' || acc.role === filterRole;
    const matchesStatus = filterStatus === 'All' || acc.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculations for quick metrics card
  const total = accounts.length;
  const active = accounts.filter(a => a.status === 'active').length;
  const locked = accounts.filter(a => a.status === 'locked').length;

  const getRoleLabel = (r: 'admin' | 'lecturer' | 'student') => {
    switch (r) {
      case 'admin': return { text: 'Quản lý khoa', cls: 'bg-indigo-50 text-indigo-700 border border-indigo-150' };
      case 'lecturer': return { text: 'Giảng viên', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-150' };
      case 'student': return { text: 'Sinh viên', cls: 'bg-slate-100 text-slate-700 border border-slate-200' };
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) return;

    onAddAccount({
      id: 'acc_' + Date.now(),
      username,
      fullName,
      email,
      role,
      status: 'active',
      lastLogin: 'Chưa đăng nhập'
    });

    setUsername('');
    setFullName('');
    setEmail('');
    setShowModal(false);
  };

  const handleResetAction = (id: string, name: string) => {
    if (confirm(`Bạn chắc chắn muốn đặt lại mật khẩu cho tài khoản ${name}? Mật khẩu mới sẽ mặc định là "UITHCM@2026".`)) {
      onResetPassword(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics block */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Tổng tài khoản</span>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{total}</h4>
            <span className="text-[10px] text-slate-500 block mt-0.5">Trong hệ thống dữ liệu khoa</span>
          </div>
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600">Đang hoạt động</span>
            <h4 className="text-xl font-extrabold text-emerald-600 mt-0.5">{active}</h4>
            <span className="text-[10px] text-slate-500 block mt-0.5">Có quyền truy cập cổng thông tin</span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-600">Đang khóa</span>
            <h4 className="text-xl font-extrabold text-rose-600 mt-0.5">{locked}</h4>
            <span className="text-[10px] text-slate-500 block mt-0.5">Tài khoản bị tạm ngưng / Thu hồi</span>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* Control filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={15} />
          </span>
          <input 
            type="text" 
            placeholder="Tìm theo Tên tài khoản hoặc Họ tên chủ sở hữu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-xs font-semibold">Vai trò:</span>
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white text-slate-600 focus:outline-none"
            >
              <option value="All">Tất cả vai trò</option>
              <option value="admin">Quản lý khoa</option>
              <option value="lecturer">Giảng viên</option>
              <option value="student">Sinh viên</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-xs font-semibold">Trạng thái:</span>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white text-slate-600 focus:outline-none"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Bị khóa tài khoản</option>
            </select>
          </div>

          <button 
            id="btn-create-account"
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus size={14} /> Thêm mới tài khoản
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3 pl-4">Tên tài khoản (Username)</th>
                <th className="p-3">Họ và Tên chủ sở hữu</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Đăng nhập gần nhất</th>
                <th className="p-3 text-right pr-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">Không tìm thấy tài khoản người dùng nào khớp bộ lọc</td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const rLabel = getRoleLabel(acc.role);
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-3 pl-4 font-mono font-bold text-slate-900">{acc.username}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800 block">{acc.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{acc.email}</span>
                      </td>
                      <td className="p-3">
                        {rLabel && (
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${rLabel.cls}`}>
                            {rLabel.text}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          acc.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {acc.status === 'active' ? 'Hoạt động' : 'Khóa tài khoản'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{acc.lastLogin}</td>
                      <td className="p-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleResetAction(acc.id, acc.fullName)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Đặt lại mật khẩu mặc định"
                          >
                            <Key size={14} />
                          </button>
                          
                          <button 
                            onClick={() => onToggleStatus(acc.id)}
                            className={`p-1 rounded ${acc.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title={acc.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                          >
                            {acc.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>

                          <button 
                            disabled={acc.username === 'admin_khoa'}
                            onClick={() => {
                              if (confirm(`Bạn chắc chắn xóa vĩnh viễn tài khoản ${acc.fullName}?`)) {
                                onDeleteAccount(acc.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Thêm mới Tài khoản Người dùng</h4>
                <p className="text-[10px] text-slate-400">Khai báo thông số bảo mật và định danh cho thành viên mới</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên tài khoản (Username)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: gv_le_anh" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và Tên chủ tài khoản</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: ThS. Lê Văn Anh" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Địa chỉ Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="anhlv@uit.edu.vn" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cấp quyền / Phân vai trò</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as 'admin' | 'lecturer' | 'student')}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="student">Sinh viên (Truy cập tra cứu)</option>
                  <option value="lecturer">Giảng viên (Dẫn đoàn & Hướng dẫn)</option>
                  <option value="admin">Quản lý khoa (Toàn quyền quản trị)</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[11px] text-slate-500 leading-normal">
                * Mật khẩu khởi tạo mặc định cho tài khoản mới được cấu hình tự động là: <strong className="text-slate-700">UITHCM@2026</strong>. Thành viên có thể thay đổi sau khi đăng nhập lần đầu.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
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
