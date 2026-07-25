import { useState, useEffect } from 'react';
import { Trip, Notification, Submission, Payment, RefundRequest, StudentProfile } from './types';
import { 
  INITIAL_PROFILE, 
  INITIAL_TRIPS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_PAYMENTS, 
  INITIAL_REFUNDS, 
  loadState, 
  saveState 
} from './data';

// Component imports
import { MobileFrame } from './components/MobileFrame';
import { Dashboard } from './components/Dashboard';
import { Trips } from './components/Trips';
import { SubmitReport } from './components/SubmitReport';
import { Results } from './components/Results';
import { Schedule } from './components/Schedule';
import { Notifications } from './components/Notifications';
import { Profile } from './components/Profile';

// Lucide icon imports
import { Menu, Bell, Home, Compass, Upload, Award, MoreHorizontal, User } from 'lucide-react';

export default function App() {
  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [previousScreen, setPreviousScreen] = useState<string>('dashboard');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  
  // Tab states for listings
  const [tripsActiveTab, setTripsActiveTab] = useState<'available' | 'registered'>('available');

  // Core application states with localStorage persistence
  const [profile, setProfile] = useState<StudentProfile>(() => loadState('profile', INITIAL_PROFILE));
  const [trips, setTrips] = useState<Trip[]>(() => loadState('trips', INITIAL_TRIPS));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadState('notifications', INITIAL_NOTIFICATIONS));
  const [submissions, setSubmissions] = useState<Submission[]>(() => loadState('submissions', INITIAL_SUBMISSIONS));
  const [payments, setPayments] = useState<Payment[]>(() => loadState('payments', INITIAL_PAYMENTS));
  const [refunds, setRefunds] = useState<RefundRequest[]>(() => loadState('refunds', INITIAL_REFUNDS));

  // Sync state changes with localStorage
  useEffect(() => { saveState('profile', profile); }, [profile]);
  useEffect(() => { saveState('trips', trips); }, [trips]);
  useEffect(() => { saveState('notifications', notifications); }, [notifications]);
  useEffect(() => { saveState('submissions', submissions); }, [submissions]);
  useEffect(() => { saveState('payments', payments); }, [payments]);
  useEffect(() => { saveState('refunds', refunds); }, [refunds]);

  // Navigate helper
  const navigateTo = (screen: string, params?: any) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    if (screen === 'trip-detail' && params?.tripId) {
      setSelectedTripId(params.tripId);
    } else if (screen !== 'trip-detail') {
      setSelectedTripId(null);
    }
  };

  // State modification Handlers
  const handleRegisterTrip = (tripId: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, isRegistered: true } : t));
    
    // Auto add a pending payment for the registered trip
    const tripToPay = trips.find(t => t.id === tripId);
    if (tripToPay) {
      const codeSuffix = Math.floor(10000 + Math.random() * 90000);
      const isRegisteredAlreadyInPay = payments.some(p => p.tripId === tripId);
      if (!isRegisteredAlreadyInPay) {
        const newPayment: Payment = {
          id: `pay-${tripId}`,
          tripId: tripId,
          name: `Chuyến: ${tripToPay.name}`,
          code: `KT2026-${tripToPay.name.substring(8, 11).toUpperCase()}-${codeSuffix}`,
          amount: 50000,
          dueDate: '15/07/2026',
          status: 'Chưa đóng'
        };
        setPayments(prev => [newPayment, ...prev]);
      }
    }
  };

  const handleUploadReport = (id: string, fileName: string, fileSize: string) => {
    // Determine exact ID matches for sub-reports or main reports
    if (id.endsWith('-report')) {
      const originalId = id.replace('-report', '');
      setSubmissions(prev => prev.map(s => s.id === originalId 
        ? { ...s, fileName, fileSize, status: s.hasConfirmationFile ? 'Đã nộp' : 'Trễ hạn - trừ điểm' } 
        : s
      ));
    } else if (id.endsWith('-confirm')) {
      const originalId = id.replace('-confirm', '');
      setSubmissions(prev => prev.map(s => s.id === originalId 
        ? { ...s, hasConfirmationFile: true, confirmationFileName: fileName, status: s.fileName ? 'Đã nộp' : 'Trễ hạn - trừ điểm' } 
        : s
      ));
    } else {
      setSubmissions(prev => prev.map(s => s.id === id 
        ? { ...s, fileName, fileSize, status: 'Đã nộp', submittedAt: new Date().toLocaleString('vi-VN') } 
        : s
      ));
    }
  };

  const handlePayFee = (paymentId: string) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Đã đóng đúng hạn' } : p));
  };

  const handleAddRefund = (invoiceName: string, amountText: string) => {
    const newRefund: RefundRequest = {
      id: `ref-${Date.now()}`,
      invoiceName,
      dateText: new Date().toLocaleDateString('vi-VN'),
      amountText,
      status: 'Chờ xử lý'
    };
    setRefunds(prev => [newRefund, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleResetData = () => {
    setProfile(INITIAL_PROFILE);
    setTrips(INITIAL_TRIPS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setPayments(INITIAL_PAYMENTS);
    setRefunds(INITIAL_REFUNDS);
    setCurrentScreen('dashboard');
  };

  // Compute unread counter
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Determine standard page titles
  const getPageTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Xin chào, Lan Ngọc';
      case 'trips':
        return 'Chuyến tham quan';
      case 'submit':
        return 'Nộp bài thu hoạch';
      case 'results':
        return 'Kết quả & điểm';
      case 'timeline':
        return 'Lịch trình đoàn';
      case 'notifications':
        return 'Thông báo';
      case 'profile':
        return 'Hồ sơ cá nhân';
      default:
        return 'Cộng Đồng Sinh Viên';
    }
  };

  // Header should not be rendered on some screens to follow screenshot layout
  // Specifically Screen A (Chi tiết chuyến tham quan) and Screen C (Thông báo list) render their own back headers.
  const hasExternalHeader = currentScreen === 'trip-detail' || currentScreen === 'notifications';

  return (
    <MobileFrame 
      profile={profile}
      unreadNotifCount={unreadCount}
      currentScreen={currentScreen}
      onNavigate={navigateTo}
    >
      {/* 1. Header (Top App Bar matching original Material styles) */}
      {!hasExternalHeader && (
        <header className="sticky top-0 inset-x-0 z-10 bg-[#f8faf1]/90 backdrop-blur-md border-b border-[#E7E0C4] -mx-4 px-4 py-3 mb-4 flex justify-between items-center h-16 select-none animate-slideDown">
          <button 
            onClick={() => navigateTo('profile')}
            className="p-2 -ml-2 text-[#266528] hover:bg-[#ecefe6] rounded-full transition-colors flex items-center justify-center cursor-pointer"
          >
            <Menu size={24} />
          </button>
          
          <h1 className="font-extrabold text-sm text-[#266528] truncate px-2 text-center flex-1 tracking-tight">
            {getPageTitle()}
          </h1>
          
          <div className="flex items-center gap-2.5 shrink-0">
            <button 
              onClick={() => navigateTo('notifications')}
              className="p-2 text-slate-500 hover:bg-[#ecefe6] hover:text-[#266528] rounded-full transition-colors relative flex items-center justify-center cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border border-white rounded-full animate-pulse"></span>
              )}
            </button>
            
            <div 
              onClick={() => navigateTo('profile')}
              className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 shadow-xs cursor-pointer shrink-0"
            >
              <img 
                src={profile.avatar} 
                alt="Student Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>
      )}

      {/* 2. Primary Screen Container */}
      <div className="flex-1">
        {currentScreen === 'dashboard' && (
          <Dashboard 
            profile={profile}
            trips={trips}
            notifications={notifications}
            submissions={submissions}
            onNavigate={navigateTo}
          />
        )}

        {(currentScreen === 'trips' || currentScreen === 'trip-detail') && (
          <Trips 
            trips={trips}
            onRegisterTrip={handleRegisterTrip}
            activeTab={tripsActiveTab}
            setActiveTab={setTripsActiveTab}
            selectedTripId={selectedTripId}
            onSelectTrip={setSelectedTripId}
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'submit' && (
          <SubmitReport 
            submissions={submissions}
            onUploadReport={handleUploadReport}
          />
        )}

        {currentScreen === 'results' && (
          <Results 
            trips={trips}
            payments={payments}
            refunds={refunds}
            onPayFee={handlePayFee}
            onAddRefund={handleAddRefund}
          />
        )}

        {currentScreen === 'timeline' && (
          <Schedule 
            trips={trips}
            profile={profile}
          />
        )}

        {currentScreen === 'notifications' && (
          <Notifications 
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllRead={handleMarkAllRead}
            onGoBack={() => navigateTo(previousScreen)}
          />
        )}

        {currentScreen === 'profile' && (
          <Profile 
            profile={profile}
            onResetData={handleResetData}
          />
        )}
      </div>

      {/* 3. Bottom Safe-Area Navigation Bar */}
      {!hasExternalHeader && (
        <nav className="fixed bottom-0 inset-x-0 z-30 pb-safe bg-[#f8faf1]/95 backdrop-blur-md shadow-[0_-1px_6px_rgba(0,0,0,0.03)] border-t border-[#E7E0C4] w-full max-w-[390px] mx-auto select-none">
          <div className="flex justify-between items-center h-16 px-1.5">
            {/* Tab 1: Trang chủ */}
            <button 
              onClick={() => navigateTo('dashboard')}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-all duration-200 ${
                currentScreen === 'dashboard' ? 'scale-105' : 'scale-100 hover:opacity-80'
              }`}
            >
              <div className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1 mb-0.5 ${
                currentScreen === 'dashboard' ? 'bg-[#c0ef7c] text-[#266528]' : 'text-slate-500'
              }`}>
                <Home size={20} className={currentScreen === 'dashboard' ? 'stroke-[2.5px]' : ''} />
              </div>
              <span className={`text-[9px] font-bold tracking-tight uppercase leading-none ${
                currentScreen === 'dashboard' ? 'text-[#266528]' : 'text-slate-500'
              }`}>Trang chủ</span>
            </button>

            {/* Tab 2: Tham quan */}
            <button 
              onClick={() => {
                navigateTo('trips');
                setSelectedTripId(null);
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-all duration-200 ${
                currentScreen === 'trips' || currentScreen === 'trip-detail' ? 'scale-105' : 'scale-100 hover:opacity-80'
              }`}
            >
              <div className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1 mb-0.5 ${
                currentScreen === 'trips' || currentScreen === 'trip-detail' ? 'bg-[#c0ef7c] text-[#266528]' : 'text-slate-500'
              }`}>
                <Compass size={20} className={(currentScreen === 'trips' || currentScreen === 'trip-detail') ? 'stroke-[2.5px]' : ''} />
              </div>
              <span className={`text-[9px] font-bold tracking-tight uppercase leading-none ${
                (currentScreen === 'trips' || currentScreen === 'trip-detail') ? 'text-[#266528]' : 'text-slate-500'
              }`}>Tham quan</span>
            </button>

            {/* Tab 3: Nộp bài */}
            <button 
              onClick={() => navigateTo('submit')}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-all duration-200 ${
                currentScreen === 'submit' ? 'scale-105' : 'scale-100 hover:opacity-80'
              }`}
            >
              <div className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1 mb-0.5 ${
                currentScreen === 'submit' ? 'bg-[#c0ef7c] text-[#266528]' : 'text-slate-500'
              }`}>
                <Upload size={20} className={currentScreen === 'submit' ? 'stroke-[2.5px]' : ''} />
              </div>
              <span className={`text-[9px] font-bold tracking-tight uppercase leading-none ${
                currentScreen === 'submit' ? 'text-[#266528]' : 'text-slate-500'
              }`}>Nộp bài</span>
            </button>

            {/* Tab 4: Kết quả */}
            <button 
              onClick={() => navigateTo('results')}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-all duration-200 ${
                currentScreen === 'results' ? 'scale-105' : 'scale-100 hover:opacity-80'
              }`}
            >
              <div className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1 mb-0.5 ${
                currentScreen === 'results' ? 'bg-[#c0ef7c] text-[#266528]' : 'text-slate-500'
              }`}>
                <Award size={20} className={currentScreen === 'results' ? 'stroke-[2.5px]' : ''} />
              </div>
              <span className={`text-[9px] font-bold tracking-tight uppercase leading-none ${
                currentScreen === 'results' ? 'text-[#266528]' : 'text-slate-500'
              }`}>Kết quả</span>
            </button>

            {/* Tab 5: Thêm / Hồ sơ */}
            <button 
              onClick={() => navigateTo('profile')}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-all duration-200 ${
                currentScreen === 'profile' ? 'scale-105' : 'scale-100 hover:opacity-80'
              }`}
            >
              <div className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1 mb-0.5 ${
                currentScreen === 'profile' ? 'bg-[#c0ef7c] text-[#266528]' : 'text-slate-500'
              }`}>
                <MoreHorizontal size={20} className={currentScreen === 'profile' ? 'stroke-[2.5px]' : ''} />
              </div>
              <span className={`text-[9px] font-bold tracking-tight uppercase leading-none ${
                currentScreen === 'profile' ? 'text-[#266528]' : 'text-slate-500'
              }`}>Thêm</span>
            </button>
          </div>
        </nav>
      )}
    </MobileFrame>
  );
}
