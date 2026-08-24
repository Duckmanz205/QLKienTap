import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Clock, Laptop, Phone, 
  ChevronDown, Check, User, Users
} from 'lucide-react';
import { sinhVienApi, giangVienApi } from '../../services/api';

export default function LichTrinhDoan_SV() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchTrips(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchTrips = async (svId) => {
    try {
      const res = await sinhVienApi.getRegisteredTrips(svId);
      const validTrips = (res.data || []).filter(t => t.trang_thai === 'HopLe' || t.trang_thai === 'DaThamGia' || t.trang_thai === 'HoanThanh');
      setTrips(validTrips);
      if (validTrips.length > 0) {
        setSelectedTrip(validTrips[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedTrip?.chuyenThamQuan?.id) {
      giangVienApi.getTripRegistrations(selectedTrip.chuyenThamQuan.id).then(res => {
        const list = (res.data || []).map(r => ({
          id: r.sinhVien.id,
          name: r.sinhVien.ho_ten,
          role: r.truong_nhom ? 'Trưởng nhóm' : 'Đoàn viên'
        }));
        setStudents(list);
      }).catch(err => console.error(err));
    } else {
      setStudents([]);
    }
  }, [selectedTrip]);

  const itinerary = [
    { time: '07:00', task: 'Tập trung', desc: 'Sinh viên có mặt đúng giờ, điểm danh.' },
    { time: '07:30', task: 'Di chuyển', desc: 'Xe khởi hành. Vui lòng giữ trật tự.' },
    { time: '08:30', task: 'Đến nơi', desc: 'Nghe phổ biến nội quy.' },
    { time: '09:00', task: 'Tham quan', desc: 'Quan sát quy trình.' },
    { time: '10:30', task: 'Giao lưu', desc: 'Hỏi đáp với doanh nghiệp.' },
    { time: '11:30', task: 'Kết thúc', desc: 'Lên xe về lại trường.' },
  ];

  if (!student) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative" onClick={() => setIsDropdownOpen(false)}>
      
      {/* Header & Dropdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Lịch trình & thông tin đoàn</h1>
        
        {/* Trip Selector */}
        <div className="relative w-full md:w-[320px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Chọn chuyến tham quan</label>
          <div 
            onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all shadow-sm ${isDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="font-bold text-slate-800 truncate pr-2">
              {selectedTrip ? selectedTrip.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chưa xác định' : 'Chưa có chuyến tham quan'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isDropdownOpen && trips.length > 0 && (
            <div className="absolute top-full right-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {trips.map(trip => (
                <div 
                  key={trip.id}
                  onClick={() => { setSelectedTrip(trip); setIsDropdownOpen(false); }}
                  className={`px-4 py-3 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedTrip?.id === trip.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{trip.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi'}</span>
                  {selectedTrip?.id === trip.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTrip ? (
        <>
          {/* Overview Info Card */}
          <div className="bg-[#E7E0C4] rounded-2xl p-6 shadow-sm mb-8 flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
            
            {/* Left Side: Trip Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#407F3E] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  {selectedTrip.chuyenThamQuan?.hinh_thuc === 'TrucTuyen' ? <Laptop className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {selectedTrip.chuyenThamQuan?.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-300 text-slate-600 text-[10px] font-bold uppercase tracking-wider bg-white/50">
                  {selectedTrip.trang_thai}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4">{selectedTrip.chuyenThamQuan?.nhaMay?.ten_nha_may}</h2>
              
              <div className="space-y-2 text-sm font-medium text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="leading-snug">{selectedTrip.chuyenThamQuan?.nhaMay?.dia_chi || '--'}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{selectedTrip.chuyenThamQuan?.ngay_tham_quan ? new Date(selectedTrip.chuyenThamQuan.ngay_tham_quan).toLocaleDateString('vi-VN') : '--'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{selectedTrip.chuyenThamQuan?.gio_bat_dau?.slice(0, 5) || '--'} - {selectedTrip.chuyenThamQuan?.gio_ket_thuc?.slice(0, 5) || '--'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-px h-24 bg-white/50"></div>

            {/* Right Side: Mentor Info */}
            <div className="bg-white/40 rounded-xl p-5 shrink-0 min-w-[280px]">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Giảng viên dẫn đoàn</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                  <img src="https://ui-avatars.com/api/?name=GV&background=407F3E&color=fff" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg leading-tight">
                    {selectedTrip.chuyenThamQuan?.giangVienDanDoan?.ho_ten || 'Chưa phân công'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedTrip.chuyenThamQuan?.giangVienDanDoan?.sdt || '--'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Timeline Itinerary */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#E7E0C4]">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-[#E7E0C4] pb-4">
                <Clock className="w-5 h-5 text-[#407F3E]" />
                Lịch trình chi tiết
              </h3>
              
              <div className="relative pl-3">
                {/* Vertical Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-[#E7E0C4]"></div>
                
                <div className="space-y-8">
                  {itinerary.map((step, index) => (
                    <div key={index} className="relative flex items-start gap-6 group">
                      {/* Dot */}
                      <div className="relative z-10 w-8 h-8 rounded-full bg-white border-4 border-[#407F3E] shrink-0 mt-0.5 group-hover:scale-110 transition-transform shadow-sm"></div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-1">
                          <span className="font-black text-lg text-[#407F3E] shrink-0">{step.time}</span>
                          <h4 className="font-bold text-slate-800 text-base">{step.task}</h4>
                        </div>
                        <p className="text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block w-full">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Delegation List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E0C4] h-fit">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-[#E7E0C4] pb-4">
                <Users className="w-5 h-5 text-[#89B449]" />
                Danh sách đoàn viên ({students.length})
              </h3>
              
              <div className="flex flex-wrap gap-x-4 gap-y-6 justify-start">
                {students.map((st) => (
                  <div key={st.id} className="flex flex-col items-center w-[72px] group">
                    <div className="w-12 h-12 rounded-full bg-[#E7E0C4]/30 border border-[#E7E0C4] flex items-center justify-center mb-2 overflow-hidden group-hover:border-[#89B449] transition-colors relative">
                      {st.role === 'Trưởng nhóm' && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-[#DBD468] rounded-full border border-white z-10" title="Trưởng nhóm"></div>
                      )}
                      <User className="w-5 h-5 text-slate-400 group-hover:text-[#89B449] transition-colors" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 text-center leading-tight line-clamp-2">
                      {st.name}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 mt-0.5">
                      {st.role}
                    </span>
                  </div>
                ))}
                {students.length === 0 && (
                  <p className="text-xs text-slate-500 italic">Chưa có sinh viên nào.</p>
                )}
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="flex items-center justify-center p-12 text-slate-500 bg-white rounded-2xl shadow-sm border border-[#E7E0C4]">
          Bạn chưa có chuyến đi nào hợp lệ để xem lịch trình.
        </div>
      )}
    </div>
  );
}
