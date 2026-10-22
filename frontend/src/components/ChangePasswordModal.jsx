import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Key, Eye, EyeOff, X, RotateCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authApi } from '../services/api';
import { getValidSession } from '../utils/auth';

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation rules (bám sát đặc tả hệ thống và regex backend)
  const hasMinLength = newPass.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPass);
  const hasLowerCase = /[a-z]/.test(newPass);
  const hasNumber = /[0-9]/.test(newPass);
  const isMatch = newPass === confirmPass && confirmPass !== '';
  const isDifferentFromOld = oldPass !== '' && newPass !== '' && newPass !== oldPass;
  const isValid = oldPass.trim() !== '' && hasMinLength && hasUpperCase && hasLowerCase && hasNumber && isMatch && isDifferentFromOld;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading]);

  // Reset form khi modal mở hoặc đóng
  useEffect(() => {
    if (isOpen) {
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (loading) return;
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setError('');
    setLoading(true);

    try {
      const res = await authApi.changePassword(oldPass, newPass);
      toast.success(res?.data?.message || 'Đổi mật khẩu thành công!');

      // Cập nhật session trong localStorage (gỡ cờ phai_doi_mat_khau nếu có) nhưng giữ nguyên phiên đăng nhập
      try {
        const session = getValidSession();
        if (session && session.user) {
          session.user.phai_doi_mat_khau = false;
          localStorage.setItem('user', JSON.stringify(session));
        }
      } catch (storageErr) {
        console.warn('Lỗi cập nhật localStorage sau khi đổi mật khẩu:', storageErr);
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Lỗi đổi mật khẩu:', err);
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed & Blurred Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog Content */}
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6 sm:p-7 border border-[#E7E0C4]/80 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1.5 transition-colors cursor-pointer disabled:opacity-50"
          title="Đóng (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 bg-[#e5ffdc] text-[#407F3E] rounded-2xl flex items-center justify-center shadow-inner shrink-0 border border-[#407F3E]/20">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>Đổi mật khẩu</span>
              <ShieldCheck className="w-4 h-4 text-[#407F3E]" />
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật mật khẩu mới an toàn cho tài khoản của bạn.
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-[#ba1a1a] px-3.5 py-2.5 rounded-xl text-xs font-semibold leading-relaxed animate-in fade-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                required
                disabled={loading}
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#407F3E]/40 focus:border-[#407F3E] text-sm transition-all font-medium disabled:opacity-60"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                disabled={loading}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#407F3E]/40 focus:border-[#407F3E] text-sm transition-all font-medium disabled:opacity-60"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                disabled={loading}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#407F3E]/40 focus:border-[#407F3E] text-sm transition-all font-medium disabled:opacity-60"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Interactive Requirements Checklist */}
          <div className="bg-[#f8faf1] rounded-2xl p-3.5 border border-[#e5ffdc] space-y-2">
            <p className="text-[10px] font-bold text-[#407F3E] uppercase tracking-wider">
              Yêu cầu mật khẩu phức tạp:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${hasMinLength ? 'bg-[#407F3E]' : 'bg-slate-300'}`} />
                <span className={hasMinLength ? 'text-[#407F3E]' : 'text-slate-500'}>Tối thiểu 8 ký tự</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${hasUpperCase ? 'bg-[#407F3E]' : 'bg-slate-300'}`} />
                <span className={hasUpperCase ? 'text-[#407F3E]' : 'text-slate-500'}>Ít nhất 1 chữ hoa (A-Z)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${hasLowerCase ? 'bg-[#407F3E]' : 'bg-slate-300'}`} />
                <span className={hasLowerCase ? 'text-[#407F3E]' : 'text-slate-500'}>Ít nhất 1 chữ thường (a-z)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${hasNumber ? 'bg-[#407F3E]' : 'bg-slate-300'}`} />
                <span className={hasNumber ? 'text-[#407F3E]' : 'text-slate-500'}>Ít nhất 1 chữ số (0-9)</span>
              </div>
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isMatch ? 'bg-[#407F3E]' : 'bg-slate-300'}`} />
                <span className={isMatch ? 'text-[#407F3E]' : 'text-slate-500'}>Mật khẩu xác nhận trùng khớp</span>
              </div>
              {newPass && oldPass && !isDifferentFromOld && (
                <div className="flex items-center gap-1.5 sm:col-span-2 text-amber-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Mật khẩu mới không được trùng mật khẩu cũ</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#407F3E] hover:bg-[#2c6b2d] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cập nhật mật khẩu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
