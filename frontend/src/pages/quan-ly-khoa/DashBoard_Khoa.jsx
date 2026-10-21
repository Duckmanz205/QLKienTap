import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { khoaApi } from '../../services/api';
import { 
  Users, 
  Compass, 
  Calendar, 
  AlertTriangle,
  Clock,
  MapPin,
  User,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Building2,
  ClipboardList,
  Sparkles,
  Layers,
  Lock,
  Unlock,
  FileText,
  Presentation,
  Award,
  Send,
  AlertCircle,
  GraduationCap,
  ShieldAlert,
  RotateCcw,
  Check,
  X
} from 'lucide-react';

export default function DashBoard_Khoa() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    studentCount: 0,
    lecturerCount: 0,
    factoryCount: 0,
    campaignCount: 0,
    scheduleCount: 0,
    pendingCancelCount: 0,
    pendingRefundCount: 0,
    pendingActionCount: 0,
    distributionData: [],
    timeline: [],
    currentCampaign: null,
    pipeline: {
      registeredStudentsCount: 0,
      submittedReportsCount: 0,
      eligibleCount: 0,
      selectedBoChuyenCount: 0,
      totalBoardsCount: 0,
      lockedBoardsCount: 0,
      gradedStudentsCount: 0,
    },
    urgentAlerts: {
      pendingProposalsCount: 0,
      pendingCancelCount: 0,
      pendingRefundCount: 0,
      notEligibleCount: 0,
      unassignedCouncilCount: 0,
      unassignedSupervisorCount: 0,
    }
  });
  const [loading, setLoading] = useState(true);
  const [isTogglingLock, setIsTogglingLock] = useState(false);
  const [confirmLockModal, setConfirmLockModal] = useState({
    isOpen: false,
    nextLocked: false,
    campaignId: null,
    campaignName: ''
  });

  // Loaded user profile details
  const [userProfile, setUserProfile] = useState({ ho_ten: 'Quản lý Khoa' });

  useEffect(() => {
    fetchStats();
    // Load manager name if present
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed?.user?.vai_tro === 'QuanTriVienHeThong') {
          navigate('/qtv/accounts', { replace: true });
          return;
        }
        if (parsed.user && parsed.user.ten_hien_thi) {
          setUserProfile({ ho_ten: parsed.user.ten_hien_thi });
        } else if (parsed.ho_ten) {
          setUserProfile({ ho_ten: parsed.ho_ten });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await khoaApi.getDashboardStats();
      if (res.data) {
        setStats(prev => ({
          ...prev,
          ...res.data,
          currentCampaign: res.data.currentCampaign || null,
          pipeline: {
            registeredStudentsCount: res.data.pipeline?.registeredStudentsCount || 0,
            submittedReportsCount: res.data.pipeline?.submittedReportsCount || 0,
            eligibleCount: res.data.pipeline?.eligibleCount || 0,
            selectedBoChuyenCount: res.data.pipeline?.selectedBoChuyenCount || 0,
            totalBoardsCount: res.data.pipeline?.totalBoardsCount || 0,
            lockedBoardsCount: res.data.pipeline?.lockedBoardsCount || 0,
            gradedStudentsCount: res.data.pipeline?.gradedStudentsCount || 0,
          },
          urgentAlerts: {
            pendingProposalsCount: res.data.urgentAlerts?.pendingProposalsCount || 0,
            pendingCancelCount: res.data.urgentAlerts?.pendingCancelCount || 0,
            pendingRefundCount: res.data.urgentAlerts?.pendingRefundCount || 0,
            notEligibleCount: res.data.urgentAlerts?.notEligibleCount || 0,
            unassignedCouncilCount: res.data.urgentAlerts?.unassignedCouncilCount || 0,
            unassignedSupervisorCount: res.data.urgentAlerts?.unassignedSupervisorCount || 0,
          },
          scheduleCount: res.data.scheduleCount || 0,
          pendingCancelCount: res.data.pendingCancelCount || 0,
          pendingRefundCount: res.data.pendingRefundCount || 0,
          pendingActionCount: res.data.pendingActionCount !== undefined 
            ? res.data.pendingActionCount 
            : ((res.data.pendingCancelCount || 0) + (res.data.pendingRefundCount || 0)),
          distributionData: res.data.distributionData || [],
          timeline: res.data.timeline || [],
        }));
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLockModal = () => {
    if (!stats.currentCampaign?.id) return;
    const nextLocked = !stats.currentCampaign.isBoChuyenLocked;
    setConfirmLockModal({
      isOpen: true,
      nextLocked,
      campaignId: stats.currentCampaign.id,
      campaignName: stats.currentCampaign.tenDot
    });
  };

  const handleConfirmToggleLock = async () => {
    if (!confirmLockModal.campaignId) return;
    try {
      setIsTogglingLock(true);
      await khoaApi.toggleLockBoChuyen(confirmLockModal.campaignId, { isLocked: confirmLockModal.nextLocked });
      setStats(prev => ({
        ...prev,
        currentCampaign: prev.currentCampaign ? {
          ...prev.currentCampaign,
          isBoChuyenLocked: confirmLockModal.nextLocked
        } : null
      }));
      setConfirmLockModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('Lỗi khóa/mở cổng:', err);
    } finally {
      setIsTogglingLock(false);
    }
  };

  const totalStudents = stats.distributionData.reduce((acc, curr) => acc + curr.value, 0);
  const colors = ['bg-[#407F3E]', 'bg-[#89B449]', 'bg-[#DBD468]', 'bg-[#3b82f6]', 'bg-[#8b5cf6]'];
  const distributionData = stats.distributionData.map((d, idx) => ({
    name: d.name,
    count: d.value,
    percent: totalStudents > 0 ? Math.round((d.value / totalStudents) * 100) : 0,
    color: colors[idx % colors.length]
  }));

  const totalUrgentCount = 
    (stats.urgentAlerts?.pendingProposalsCount || 0) +
    (stats.urgentAlerts?.pendingCancelCount || 0) +
    (stats.urgentAlerts?.pendingRefundCount || 0) +
    (stats.urgentAlerts?.unassignedCouncilCount || 0);

  const eligibleRate = stats.studentCount > 0 
    ? Math.round(((stats.pipeline?.eligibleCount || 0) / stats.studentCount) * 100) 
    : 0;

  const regRate = stats.studentCount > 0 
    ? Math.round(((stats.pipeline?.registeredStudentsCount || 0) / stats.studentCount) * 100) 
    : 0;

  const boChuyenRate = (stats.pipeline?.eligibleCount || 0) > 0 
    ? Math.round(((stats.pipeline?.selectedBoChuyenCount || 0) / (stats.pipeline?.eligibleCount || 1)) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Modal xác nhận Khóa / Mở cổng Bộ 3 chuyến */}
      {confirmLockModal.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setConfirmLockModal(prev => ({ ...prev, isOpen: false }))}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden border border-[#E7E0C4]">
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                {confirmLockModal.nextLocked ? <Lock className="w-4 h-4 text-amber-600" /> : <Unlock className="w-4 h-4 text-[#407F3E]" />}
                <span>{confirmLockModal.nextLocked ? 'Khóa cổng chọn bộ 3 chuyến' : 'Mở khóa cổng chọn bộ 3 chuyến'}</span>
              </h3>
              <button 
                onClick={() => setConfirmLockModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                {confirmLockModal.nextLocked 
                  ? `Bạn có chắc chắn muốn KHÓA cổng đăng ký Bộ 3 chuyến cho "${confirmLockModal.campaignName}"? Toàn bộ sinh viên sẽ không thể đăng ký mới hoặc thay đổi bộ chuyến.` 
                  : `Bạn có chắc chắn muốn MỞ KHÓA cổng đăng ký Bộ 3 chuyến cho "${confirmLockModal.campaignName}"? Sinh viên đủ điều kiện sẽ có thể đăng ký hoặc thay đổi bộ chuyến theo nguyện vọng.`}
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-[#E7E0C4] flex justify-end gap-3">
              <button 
                onClick={() => setConfirmLockModal(prev => ({ ...prev, isOpen: false }))}
                disabled={isTogglingLock}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmToggleLock}
                disabled={isTogglingLock}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${
                  confirmLockModal.nextLocked 
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'bg-[#407F3E] hover:bg-[#346A32]'
                }`}
              >
                {isTogglingLock ? 'Đang cập nhật...' : (confirmLockModal.nextLocked ? 'Xác nhận Khóa' : 'Xác nhận Mở khóa')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Welcome Panel */}
      <div className="bg-gradient-to-r from-[#407F3E] via-[#407F3E]/95 to-[#89B449] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass size={180} className="animate-spin-slow text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white/20 text-white text-[11px] px-3 py-1 rounded-full font-bold tracking-wide uppercase">
              HỆ THỐNG QUẢN LÝ KIẾN TẬP - KHOA CÔNG NGHỆ THỰC PHẨM
            </span>
            {stats.currentCampaign && (
              <span className="bg-[#DBD468] text-slate-900 text-[11px] px-3 py-1 rounded-full font-extrabold tracking-wide uppercase shadow-xs">
                {stats.currentCampaign.tenDot}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight mt-3 text-white">
            Trung Tâm Điều Hành & Giám Sát Kiến Tập
          </h1>
          <p className="text-white/90 text-sm mt-2 leading-relaxed font-medium">
            Xin chào Thầy/Cô <strong className="text-white font-bold">{userProfile.ho_ten}</strong>. 
            Học phần kiến tập đang có <strong className="text-white underline font-bold">{stats.studentCount} sinh viên</strong> tham gia. 
            Đã có <strong className="text-[#DBD468] font-bold">{stats.pipeline?.eligibleCount || 0} sinh viên</strong> hoàn thành đủ điều kiện bảo vệ trước Hội đồng.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Đợt kiến tập */}
        <div 
          onClick={() => navigate('/khoa/plans')}
          className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md hover:border-[#407F3E]/50 transition-all duration-200 flex items-center justify-between group cursor-pointer"
        >
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Đợt kiến tập</p>
            <h3 className="text-xl font-black text-[#407F3E] mt-1 truncate">
              {loading ? '...' : (stats.currentCampaign?.tenDot || `${stats.campaignCount} Đợt`)}
            </h3>
            <span className="text-slate-500 text-xs font-semibold flex items-center mt-1.5 gap-1 truncate">
              {stats.currentCampaign ? `${stats.currentCampaign.hocKy} • ${stats.currentCampaign.namHoc}` : 'Học kỳ hiện tại'}
            </span>
          </div>
          <div className="w-12 h-12 bg-[#407F3E]/10 text-[#407F3E] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Calendar size={22} />
          </div>
        </div>

        {/* Card 2: Sinh viên tham gia đợt */}
        <div 
          onClick={() => navigate('/khoa/students')}
          className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md hover:border-[#89B449]/50 transition-all duration-200 flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sinh viên tham gia</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">
              {loading ? '...' : stats.studentCount}
            </h3>
            <span className="text-[#407F3E] text-xs font-bold flex items-center mt-1.5 gap-1">
              <TrendingUp size={14} className="text-[#407F3E]" /> {regRate}% đã có chuyến đi
            </span>
          </div>
          <div className="w-12 h-12 bg-[#89B449]/10 text-[#407F3E] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={22} />
          </div>
        </div>

        {/* Card 3: Đủ ĐK chọn Bộ 3 chuyến */}
        <div 
          onClick={() => navigate('/khoa/reports')}
          className="bg-white p-5 rounded-2xl border border-[#E7E0C4] shadow-sm hover:shadow-md hover:border-[#407F3E]/50 transition-all duration-200 flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Đủ ĐK bảo vệ Hội đồng</p>
            <h3 className="text-3xl font-black text-[#407F3E] mt-1">
              {loading ? '...' : stats.pipeline?.eligibleCount || 0}
            </h3>
            <span className="text-slate-500 text-xs font-semibold flex items-center mt-1.5 gap-1">
              <CheckCircle2 size={14} className="text-emerald-600" /> {eligibleRate}% trên tổng SV
            </span>
          </div>
          <div className="w-12 h-12 bg-[#407F3E]/10 text-[#407F3E] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award size={22} />
          </div>
        </div>

        {/* Card 4: Yêu cầu chờ xử lý */}
        <div 
          onClick={() => navigate('/khoa/trips')}
          className={`bg-white p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
            totalUrgentCount > 0 
              ? 'border-amber-300 hover:border-amber-400 hover:shadow-md bg-amber-50/20' 
              : 'border-[#E7E0C4] hover:border-[#407F3E]/40 hover:shadow-md'
          }`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Yêu cầu cần xử lý</p>
            <h3 className={`text-3xl font-black mt-1 ${
              totalUrgentCount > 0 ? 'text-amber-600' : 'text-slate-800'
            }`}>
              {loading ? '...' : totalUrgentCount}
            </h3>
            <span className={`text-xs font-semibold flex items-center mt-1.5 gap-1 ${
              totalUrgentCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-500'
            }`}>
              {totalUrgentCount > 0 ? (
                <>
                  <AlertTriangle size={14} className="text-amber-600" /> Cần Ban CN Khoa xem xét
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} className="text-emerald-600" /> Không có việc tồn đọng
                </>
              )}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
            totalUrgentCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {totalUrgentCount > 0 ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (65%): Executive Dashboard Pipeline & Action Center */}
        <div className="lg:col-span-2 space-y-6">

          {/* BLOCK 1: TIẾN TRÌNH 4 GIAI ĐOẠN HỌC PHẦN KIẾN TẬP */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E0C4] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E0C4]">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#407F3E]" />
                  Tiến trình Vận hành Học phần Kiến tập
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Theo dõi 4 giai đoạn khép kín từ đăng ký chuyến đến bảo vệ Hội đồng và khóa điểm
                </p>
              </div>

              {/* Status & Quick Toggle Lock Port */}
              {stats.currentCampaign && (
                <div className="flex items-center gap-2 shrink-0">
                  {stats.currentCampaign.isBoChuyenLocked ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      <Lock className="w-3.5 h-3.5 text-slate-500" /> Cổng Bộ 3 chuyến: ĐÃ KHÓA
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#407F3E]/10 text-[#407F3E] border border-[#407F3E]/20">
                      <Unlock className="w-3.5 h-3.5 text-[#407F3E]" /> Cổng Bộ 3 chuyến: ĐANG MỞ
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenLockModal}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                      stats.currentCampaign.isBoChuyenLocked
                        ? 'bg-[#407F3E] text-white hover:bg-[#346A32] border-[#407F3E]'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                    }`}
                  >
                    {stats.currentCampaign.isBoChuyenLocked ? 'Mở khóa cổng' : 'Khóa cổng'}
                  </button>
                </div>
              )}
            </div>

            {/* 4 Pipeline Milestones Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              
              {/* Step 1: Đăng ký chuyến */}
              <div 
                onClick={() => navigate('/khoa/registrations')}
                className="p-4 rounded-xl border border-[#E7E0C4] bg-[#f8faf1] hover:border-[#407F3E]/40 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Compass className="w-4 h-4 text-[#407F3E]" /> 1. Đăng ký tham quan
                  </span>
                  <span className="text-[#407F3E] font-mono">{regRate}%</span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xl font-black text-slate-800">
                    {stats.pipeline?.registeredStudentsCount || 0}
                  </span>
                  <span className="text-xs text-slate-500">
                    / {stats.studentCount || 0} SV tham gia
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                  <div className="h-full bg-[#407F3E] rounded-full transition-all duration-500" style={{ width: `${regRate}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 truncate">
                  Sinh viên đã hoàn tất đăng ký ít nhất 1 chuyến hợp lệ
                </p>
              </div>

              {/* Step 2: Thu hoạch & Điểm danh */}
              <div 
                onClick={() => navigate('/khoa/reports')}
                className="p-4 rounded-xl border border-[#E7E0C4] bg-[#f8faf1] hover:border-[#407F3E]/40 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <FileText className="w-4 h-4 text-[#89B449]" /> 2. Bài thu hoạch đã nộp
                  </span>
                  <span className="text-[#407F3E] font-mono">Đang thu bài</span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xl font-black text-slate-800">
                    {stats.pipeline?.submittedReportsCount || 0}
                  </span>
                  <span className="text-xs text-slate-500">
                    bài đã nộp hệ thống
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                  <div className="h-full bg-[#89B449] rounded-full transition-all duration-500" style={{ width: '100%' }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 truncate">
                  Bao gồm bài thu hoạch cá nhân các chuyến trực tiếp & trực tuyến
                </p>
              </div>

              {/* Step 3: Chọn Bộ 3 chuyến báo cáo */}
              <div 
                onClick={() => navigate('/khoa/boards')}
                className="p-4 rounded-xl border border-[#E7E0C4] bg-[#f8faf1] hover:border-[#407F3E]/40 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Layers className="w-4 h-4 text-emerald-600" /> 3. Đăng ký Bộ 3 chuyến
                  </span>
                  <span className="text-emerald-700 font-mono">{boChuyenRate}%</span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xl font-black text-slate-800">
                    {stats.pipeline?.selectedBoChuyenCount || 0}
                  </span>
                  <span className="text-xs text-slate-500">
                    / {stats.pipeline?.eligibleCount || 0} SV đủ ĐK
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${boChuyenRate}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 truncate">
                  Yêu cầu: 2 chuyến trực tiếp + 1 trực tuyến tại 3 nhà máy
                </p>
              </div>

              {/* Step 4: Hội đồng chấm & Khóa điểm */}
              <div 
                onClick={() => navigate('/khoa/boards')}
                className="p-4 rounded-xl border border-[#E7E0C4] bg-[#f8faf1] hover:border-[#407F3E]/40 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Presentation className="w-4 h-4 text-cyan-600" /> 4. Hội đồng chấm báo cáo
                  </span>
                  <span className="text-cyan-700 font-mono">
                    {stats.pipeline?.lockedBoardsCount || 0}/{stats.pipeline?.totalBoardsCount || 0} HĐ khóa điểm
                  </span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xl font-black text-slate-800">
                    {stats.pipeline?.totalBoardsCount || 0}
                  </span>
                  <span className="text-xs text-slate-500">
                    Hội đồng đã lập
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-600 rounded-full transition-all duration-500" 
                    style={{ 
                      width: stats.pipeline?.totalBoardsCount > 0 
                        ? `${Math.round(((stats.pipeline?.lockedBoardsCount || 0) / stats.pipeline.totalBoardsCount) * 100)}%` 
                        : '0%' 
                    }} 
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 truncate">
                  {stats.pipeline?.gradedStudentsCount || 0} sinh viên đã hoàn thành chấm điểm chính thức
                </p>
              </div>

            </div>
          </div>

          {/* BLOCK 2: TRUNG TÂM CẢNH BÁO ĐIỀU HÀNH & YÊU CẦU CẦN DUYỆT */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E0C4] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0C4]">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  Trung tâm Cảnh báo & Tác vụ cần xử lý
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Các vấn đề và yêu cầu đang chờ Ban Chủ nhiệm Khoa phê duyệt hoặc điều phối
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {totalUrgentCount} mục cần chú ý
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Item 1: Đề xuất chuyến đi tự do */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-amber-600" /> Đề xuất chuyến tự do
                    </span>
                    <span className="font-black text-amber-700 text-base font-mono">
                      {stats.urgentAlerts?.pendingProposalsCount || 0}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Sinh viên gửi đề xuất nhà máy tự do đang chờ Khoa xem xét & phê duyệt.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/khoa/trips')}
                  className="mt-3 w-full py-2 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  Xem & Duyệt đề xuất <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item 2: Đơn hủy chuyến & Hoàn phí */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Đơn hủy & Hoàn phí
                    </span>
                    <span className="font-black text-slate-800 text-base font-mono">
                      {(stats.urgentAlerts?.pendingCancelCount || 0) + (stats.urgentAlerts?.pendingRefundCount || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Yêu cầu hủy phiếu đăng ký tham quan hoặc đơn hoàn tiền lệ phí cần xác nhận.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/khoa/trips')}
                  className="mt-3 w-full py-2 bg-white hover:bg-slate-200/60 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  Kiểm tra yêu cầu <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item 3: Sinh viên chưa đủ điều kiện */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Chưa đủ điều kiện
                    </span>
                    <span className="font-black text-rose-600 text-base font-mono">
                      {stats.urgentAlerts?.notEligibleCount || 0}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Sinh viên chưa hoàn thành đủ cơ cấu 2 chuyến trực tiếp + 1 trực tuyến tại 3 nhà máy.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/khoa/reports')}
                  className="mt-3 w-full py-2 bg-white hover:bg-rose-50 border border-slate-300 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  Danh sách sinh viên <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item 4: Chưa xếp Hội đồng chấm */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#407F3E] flex items-center gap-1.5">
                      <Presentation className="w-3.5 h-3.5 text-[#407F3E]" /> Chưa xếp Hội đồng
                    </span>
                    <span className="font-black text-[#407F3E] text-base font-mono">
                      {stats.urgentAlerts?.unassignedCouncilCount || 0}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Sinh viên đã nộp Bộ 3 chuyến báo cáo nhưng chưa được phân vào Hội đồng chấm nào.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/khoa/boards')}
                  className="mt-3 w-full py-2 bg-white hover:bg-emerald-50 border border-[#407F3E]/40 text-[#407F3E] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  Xếp lịch Hội đồng <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (35%): Phân bố sinh viên & Lối tắt điều hành */}
        <div className="bg-white p-6 rounded-2xl border border-[#E7E0C4] shadow-sm flex flex-col h-full">
          <div className="pb-4 border-b border-[#E7E0C4] mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Phân bố sinh viên theo khóa</h3>
            <p className="text-slate-400 text-xs mt-0.5">Tỷ lệ sinh viên tham gia kiến tập phân bổ theo từng khóa học</p>
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {distributionData.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">Chưa có dữ liệu phân bố</div>
            ) : (
              distributionData.map((major) => (
                <div key={major.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="truncate max-w-[200px]">{major.name}</span>
                    <span>{major.count} SV ({major.percent}%)</span>
                  </div>
                  {/* Horizontal Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${major.color}`}
                      style={{ width: `${major.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="mt-8 pt-4 border-t border-[#E7E0C4] space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#407F3E]" /> Lối tắt điều hành nhanh
            </h4>
            <button 
              onClick={() => navigate('/khoa/boards')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#407F3E]/5 hover:bg-[#407F3E]/10 text-[#407F3E] text-xs font-bold transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Presentation className="w-4 h-4 text-[#407F3E]" />
                Quản lý Hội đồng chấm báo cáo
              </span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => navigate('/khoa/supervisors')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#89B449]/10 hover:bg-[#89B449]/20 text-[#407F3E] text-xs font-bold transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#407F3E]" />
                Phân công Giảng viên hướng dẫn
              </span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => navigate('/khoa/students')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                Quản lý Sinh viên & Khóa học
              </span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => navigate('/khoa/reports')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-600" />
                Báo cáo Thống kê Toàn diện
              </span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
