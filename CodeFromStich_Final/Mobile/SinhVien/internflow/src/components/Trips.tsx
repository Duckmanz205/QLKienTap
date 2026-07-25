import React, { useState } from 'react';
import { Trip } from '../types';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, ClipboardCheck, UserCheck, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

interface TripsProps {
  trips: Trip[];
  onRegisterTrip: (tripId: string) => void;
  activeTab: 'available' | 'registered';
  setActiveTab: (tab: 'available' | 'registered') => void;
  selectedTripId: string | null;
  onSelectTrip: (tripId: string | null) => void;
  onNavigate: (screen: string, params?: any) => void;
}

export const Trips: React.FC<TripsProps> = ({
  trips,
  onRegisterTrip,
  activeTab,
  setActiveTab,
  selectedTripId,
  onSelectTrip,
  onNavigate
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Find currently selected trip
  const currentTrip = trips.find(t => t.id === selectedTripId);

  // Handle registration action
  const handleConfirmRegistration = (tripId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onRegisterTrip(tripId);
      setIsProcessing(false);
      setRegisterSuccess(true);
      setTimeout(() => {
        setRegisterSuccess(false);
        onSelectTrip(null); // Go back to list
      }, 2000);
    }, 1500);
  };

  // List filtered trips
  const filteredTrips = trips.filter(trip => {
    if (activeTab === 'available') return !trip.isRegistered;
    return trip.isRegistered;
  });

  // Share action mock
  const handleShare = () => {
    alert('Liên kết chia sẻ thông tin chuyến đi đã được sao chép vào bộ nhớ tạm!');
  };

  // If detailed view is active, render detailed page
  if (currentTrip) {
    return (
      <div className="flex flex-col animate-fadeIn pb-24">
        {/* Top App Bar inside main container */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md flex items-center justify-between px-2 py-3 border-b border-slate-100 -mx-4 mb-4">
          <button 
            onClick={() => onSelectTrip(null)}
            className="p-2 transition-colors duration-200 active:opacity-70 hover:bg-slate-100 rounded-full flex items-center justify-center text-[#266528]"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 font-bold text-base text-[#266528] px-2 truncate">Chi tiết chuyến tham quan</h1>
          <button 
            onClick={handleShare}
            className="p-2 transition-colors duration-200 active:opacity-70 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-500"
          >
            <Share2 size={20} />
          </button>
        </header>

        {/* Scrollable Content inside container */}
        <div className="flex flex-col gap-6">
          {/* Hero Image Section */}
          <section className="relative h-48 w-full -mx-4">
            <div className="w-full h-full rounded-b-2xl overflow-hidden bg-slate-100">
              <img 
                className="w-full h-full object-cover" 
                src={currentTrip.heroImage} 
                alt={currentTrip.name} 
              />
            </div>
            
            {/* Floating Badges */}
            <div className="absolute bottom-4 left-4">
              <span className="bg-[#446900] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
                {currentTrip.type}
              </span>
            </div>
            <div className="absolute bottom-4 right-4">
              <span className="bg-[#266528] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
                Do khoa tổ chức
              </span>
            </div>
          </section>

          {/* Main Info Section */}
          <section className="px-1">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-1.5">{currentTrip.name}</h2>
            <span className="inline-block text-[#41493e] font-semibold text-xs bg-[#ecefe6] px-2.5 py-1 rounded-sm">
              {currentTrip.industry}
            </span>

            <div className="flex flex-col gap-2.5 mt-5">
              <div className="flex items-center gap-2.5 bg-[#f2f5ec]/70 border border-slate-200/50 px-3 py-2.5 rounded-xl">
                <Calendar size={18} className="text-[#266528]" />
                <span className="text-xs font-medium text-slate-700">{currentTrip.date}</span>
              </div>
              
              <div className="flex items-center gap-2.5 bg-[#f2f5ec]/70 border border-slate-200/50 px-3 py-2.5 rounded-xl">
                <Clock size={18} className="text-[#266528]" />
                <span className="text-xs font-medium text-slate-700">{currentTrip.time}</span>
              </div>
              
              <div className="flex items-center gap-2.5 bg-[#f2f5ec]/70 border border-slate-200/50 px-3 py-2.5 rounded-xl">
                <MapPin size={18} className="text-[#266528]" />
                <span className="text-xs font-medium text-slate-700 truncate">{currentTrip.location}</span>
              </div>
            </div>
          </section>

          {/* Factory Info Card */}
          <section className="px-1">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-base text-slate-800 mb-2.5">Thông tin nhà máy</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {currentTrip.description}
              </p>
            </div>
          </section>

          {/* Reminders Card */}
          <section className="px-1">
            <div className="bg-white rounded-2xl p-5 border-l-4 border-[#DBD468] shadow-xs border-y border-r border-slate-200/40">
              <h3 className="font-bold text-base text-slate-800 mb-3">Lưu ý trước khi đăng ký</h3>
              <ul className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 text-[#DBD468]">
                    <ClipboardCheck size={18} />
                  </div>
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">
                    Cần hoàn thành bài kiểm tra chuẩn bị trước khi khởi hành
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 text-[#DBD468]">
                    <UserCheck size={18} />
                  </div>
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">
                    Mang theo thẻ sinh viên và mặc đồng phục/áo khoa chỉnh tề
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 text-[#DBD468]">
                    <AlertTriangle size={18} />
                  </div>
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">
                    Có mặt đúng giờ, xe di chuyển đúng giờ và không chờ sinh viên đến trễ
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer Fixed register action */}
        <footer className="fixed bottom-0 left-0 right-0 w-full max-w-[390px] mx-auto bg-white p-4 border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20">
          {currentTrip.isRegistered ? (
            <div className="w-full bg-[#ecefe6] text-[#266528] font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 border border-[#aef4a5]/40">
              <CheckCircle size={18} />
              <span>Đã đăng ký thành công</span>
            </div>
          ) : (
            <button 
              disabled={isProcessing || registerSuccess}
              onClick={() => handleConfirmRegistration(currentTrip.id)}
              className={`w-full font-bold py-3.5 rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 ${
                registerSuccess 
                  ? 'bg-[#446900] text-white'
                  : 'bg-[#407f3e] hover:bg-[#346a32] text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang xử lý...</span>
                </>
              ) : registerSuccess ? (
                <>
                  <CheckCircle size={18} />
                  <span>Đăng ký thành công!</span>
                </>
              ) : (
                <>
                  <span>Xác nhận đăng ký</span>
                  <Sparkles size={16} />
                </>
              )}
            </button>
          )}
        </footer>
      </div>
    );
  }

  // Listing View (Screen F)
  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-6">
      {/* Segmented Control / Tabs */}
      <div className="flex bg-[#e0e4db] rounded-full p-1 shadow-inner relative z-10">
        <button 
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2 text-center rounded-full font-semibold text-xs transition-all duration-200 ${
            activeTab === 'available'
              ? 'bg-[#446900] text-white shadow-xs'
              : 'text-[#41493e] hover:bg-slate-200/50'
          }`}
        >
          Có thể đăng ký
        </button>
        <button 
          onClick={() => setActiveTab('registered')}
          className={`flex-1 py-2 text-center rounded-full font-semibold text-xs transition-all duration-200 ${
            activeTab === 'registered'
              ? 'bg-[#446900] text-white shadow-xs'
              : 'text-[#41493e] hover:bg-slate-200/50'
          }`}
        >
          Đã đăng ký
        </button>
      </div>

      {/* Available/Registered List */}
      <div className="flex flex-col gap-4">
        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <ClipboardCheck size={36} className="text-slate-300" />
            <p className="text-sm">Không tìm thấy chuyến tham quan nào.</p>
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <article 
              key={trip.id} 
              className="bg-white rounded-2xl shadow-xs p-5 border border-slate-200/85 flex flex-col gap-4 hover:border-[#266528] transition-colors"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <h2 className="font-bold text-slate-800 text-base leading-tight truncate">{trip.name}</h2>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Calendar size={14} className="shrink-0" />
                    <span className="truncate">{trip.date} | {trip.time}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                  trip.type === 'Trực tiếp' 
                    ? 'bg-[#ecefe6] text-[#266528]' 
                    : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {trip.type}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100 gap-4">
                <button 
                  onClick={() => onNavigate('timeline')}
                  className="text-xs text-[#266528] hover:underline font-bold"
                >
                  {trip.isRegistered ? 'Xem lịch trình đoàn' : 'Xem thông tin sơ bộ'}
                </button>

                <button 
                  onClick={() => onSelectTrip(trip.id)}
                  className="bg-[#266528] hover:bg-[#105217] text-white font-bold text-xs py-2 px-6 rounded-xl shadow-xs transition-all active:scale-95"
                >
                  {trip.isRegistered ? 'Chi tiết' : 'Đăng ký'}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
