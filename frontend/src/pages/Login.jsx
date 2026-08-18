import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const TIPS = [
  {
    icon: '🏭',
    title: 'Lần đầu đăng nhập?',
    text: 'Mật khẩu mặc định là MSSV hoặc mã số của bạn do phòng quản lý đào tạo cung cấp.',
  },
  {
    icon: '🔒',
    title: 'Bảo mật tài khoản',
    text: 'Hãy đổi mật khẩu mặc định ngay sau lần đăng nhập đầu tiên để bảo vệ thông tin cá nhân.',
  },
  {
    icon: '📱',
    title: 'Truy cập mọi lúc',
    text: 'Hệ thống hỗ trợ đầy đủ trên thiết bị di động — bạn có thể đăng ký, nộp bài mọi lúc mọi nơi.',
  },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTip, setActiveTip] = useState(0);
  const navigate = useNavigate();

  // Auto-rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(username, password);
      const { user, token } = response.data;

      // Store session info
      localStorage.setItem('user', JSON.stringify({ user, token }));

      // Redirect depending on user role
      if (user.vai_tro === 'SinhVien') {
        navigate('/sinh-vien');
      } else if (user.vai_tro === 'GiangVien') {
        navigate('/giang-vien');
      } else if (user.vai_tro === 'QuanLyKhoa') {
        navigate('/khoa');
      } else {
        setError('Vai trò tài khoản không hợp lệ');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ===== LEFT PANEL — Branding ===== */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between bg-[#407F3E] text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5"></div>
        <div className="absolute top-1/2 -right-16 w-64 h-64 rounded-full bg-[#89B449]/15"></div>

        <div className="relative z-10 flex flex-col h-full px-10 xl:px-12 pb-10">
          {/* Logo + Title — vertically centered to align with right panel */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative -top-[70px]">
              <img
                src="/huit-logo.svg"
                alt="Logo HUIT"
                className="w-[280px] xl:w-[320px] max-w-full h-auto object-contain brightness-0 invert drop-shadow-md self-start"
              />
              <h1 className="-mt-11 text-3xl xl:text-4xl font-black leading-tight tracking-tight">
                Quản lý Kiến tập
              </h1>
            </div>
            <div className="-mt-9 space-y-1">
              <p className="text-white/80 text-sm font-medium">
                Trường Đại học Công Thương TP.HCM
              </p>
              <p className="text-white/60 text-sm">
                Khoa Công nghệ Thực phẩm
              </p>
            </div>
          </div>

          {/* Feature list */}
          <div className="mb-auto space-y-4 py-8">
            {[
              { icon: '🏭', text: 'Đăng ký chuyến tham quan trực tuyến' },
              { icon: '📊', text: 'Theo dõi điểm số minh bạch theo thời gian thực' },
              { icon: '🤝', text: 'Kết nối Sinh viên · Giảng viên · Khoa' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0 group-hover:bg-white/20 transition-colors">
                  {item.icon}
                </div>
                <span className="text-white/90 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Khoa Công nghệ Thực phẩm
          </p>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Login Form ===== */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar (mobile logo + help) */}
        <div className="flex items-center justify-between px-6 py-4 lg:justify-end">
          <img
            src="/huit-logo.svg"
            alt="Logo HUIT"
            className="h-10 w-auto object-contain lg:hidden"
          />
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-md space-y-8">
            {/* Heading */}
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Đăng nhập
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Sử dụng tài khoản do khoa cấp để tiếp tục
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-3 bg-[#E68A8C]/10 border border-[#E68A8C]/40 text-[#8b2525] px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                <svg className="w-5 h-5 text-[#E68A8C] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Mã số / Tên đăng nhập
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập mã số sinh viên hoặc giảng viên"
                    className="w-full pl-11 pr-4 py-3 bg-[#E7E0C4]/15 border border-[#E7E0C4]/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#407F3E]/40 focus:border-[#407F3E]/50 text-sm font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#407F3E] hover:text-[#2c6b2d] transition-colors cursor-pointer"
                    onClick={() => alert('Vui lòng liên hệ Quản lý Khoa để được cấp lại mật khẩu.')}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 bg-[#E7E0C4]/15 border border-[#E7E0C4]/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#407F3E]/40 focus:border-[#407F3E]/50 text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242M15.12 15.12L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#407F3E] focus:ring-[#407F3E] cursor-pointer accent-[#407F3E]"
                />
                <label htmlFor="remember-me" className="text-sm text-slate-600 cursor-pointer select-none">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-[#407F3E]/20 text-sm font-bold text-white bg-[#407F3E] hover:bg-[#2c6b2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#407F3E] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E7E0C4]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-medium uppercase tracking-wider">hoặc</span>
              </div>
            </div>

            {/* Tips carousel */}
            <div className="bg-[#E7E0C4]/20 border border-[#E7E0C4]/40 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#407F3E]/10 flex items-center justify-center text-base shrink-0">
                  {TIPS[activeTip].icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700">{TIPS[activeTip].title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{TIPS[activeTip].text}</p>
                </div>
              </div>
              {/* Dots */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {TIPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTip(i)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === activeTip ? 'bg-[#407F3E] w-5' : 'bg-[#E7E0C4]'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
