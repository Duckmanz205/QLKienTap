import React, { useState } from 'react';
import { Trip, StudentProfile } from '../types';
import { MapPin, Calendar, Phone, ChevronDown, CheckCircle, Users, ArrowRight, Star } from 'lucide-react';

interface ScheduleProps {
  trips: Trip[];
  profile: StudentProfile;
}

export const Schedule: React.FC<ScheduleProps> = ({ trips, profile }) => {
  const [selectedGroupTrip, setSelectedGroupTrip] = useState('vinamilk-hiep-phuoc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Group participants avatars (from student list)
  const participants = [
    {
      name: 'Lan Ngọc',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJviU2hNtFtTAjeQlUaulZGrhMIR67fZrJFsmPfhaQmQnpbSnvblZMXQ1aKGoaNjAClDIeJkQOa1kUTpAqQjRNwgulvp_vUVYJkerqM3497nrU4uuqYidQkUp12BHaq5oowwi3wIr9L72KZxabieyaI72oUrbpTaglWX783_Ps8Z0b2XEX7cB6d8bxo5ixuTHfbmrXUwsZlk34J-kPy_p5K5ue3_rlaJUWEvLt0XrsrUu64r_JX7i4_Q'
    },
    {
      name: 'Hải Đăng',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdoasknnPDNUfgKV24U5WnvFJxFzecQljeKDJxyUQP0IscIP9PKheQgaG_86Xdwk0h76S8ZIALeL0YoNEHvm8XRnBfEoTuzDSwsOcPbxLeaphOZrm-ykFpk3LYPEjvtDvoyjOSRdDTffSFfU8Ij7cWcQ8BpeY6fcscUF2Xw85bWF5MdnjAgrsVRV2Lx2mhIFa7lCdfkNREEN6741oOSIi-yOL9RXd-2Qbd9zRXUPmm07bdAic2SD2I7A'
    },
    {
      name: 'Thảo My',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuImgIOMvBlxG5PEJDHdeHDwS4O_GvCAsZmz1L2RDPpkg78ofPyL3JjnvvLTzcF08Jz1Fco2tEEkiQcHWRJSAqFAwar9Nla2x7dvrYDK27GsGTOe3DoGkBdaFtt81q-vkUAzVGT2-3bzJ7m_mixPi_HZwadng_imJRM4zjNlheS_7qK125geGNv6yjAAuL8aJW3w3A45LuDfdAm52lDwA5kVBLX5xz7J5dEvVPHohG82ZVoR-X47OQtDQ'
    },
    {
      name: 'Minh Khang',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0_RsRc0A2BXh2MB23kseLfGbYNEV6O3qI9gZzdai6-Ogxe5h_Rjta7CYG6GIr4bm335l4qboydOdFdvpPHc36olEEdcvSF4K3XEd6Nw7w9mgRJbfXdFPsKt-GbDbhKRN3ZV3Bzd599zv_krJrqA5CHmDh995J9qFkPlL-beBbAtNgRd_aHKLu2Oq384DLwfikDP_d-0FgjLT6yC3Rvl2iGfSCIx9JGDYak3OIgWRbkFXZXpGB-KBCwA'
    }
  ];

  const handleCallTeacher = () => {
    alert('Đang kết nối cuộc gọi đến Giảng viên hướng dẫn ThS. Nguyễn Văn A (0909.123.456)...');
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-6">
      {/* Selector Dropdown */}
      <div className="relative">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Chọn chuyến tham quan</label>
        
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-white border border-slate-200/90 rounded-xl py-3 px-4 flex items-center justify-between shadow-xs hover:border-[#266528] active:border-[#266528] transition-all focus:outline-none"
        >
          <span className="text-sm font-semibold text-slate-800">Vinamilk - 20/07/2026</span>
          <ChevronDown size={18} className="text-slate-400" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-[72px] left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-lg z-30 overflow-hidden">
            <div 
              onClick={() => { setSelectedGroupTrip('vinamilk-hiep-phuoc'); setIsDropdownOpen(false); }}
              className="p-3.5 text-xs font-semibold hover:bg-slate-50 cursor-pointer text-[#266528] border-l-4 border-[#266528]"
            >
              Vinamilk - 20/07/2026 (KCN Hiệp Phước)
            </div>
            <div 
              onClick={() => { alert('Chuyến đi này hiện chưa bắt đầu hoặc chưa chia đoàn.'); setIsDropdownOpen(false); }}
              className="p-3.5 text-xs font-semibold hover:bg-slate-50 cursor-pointer text-slate-400"
            >
              Acecook - 26/10/2025 (Học trực tuyến)
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-[#E7E0C4] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="font-extrabold text-base text-[#266528] tracking-tight">Nhà máy sữa Vinamilk</h2>
            
            <div className="flex items-start gap-1.5 text-slate-600 mt-2">
              <MapPin size={15} className="mt-0.5 shrink-0" />
              <span className="text-xs font-medium leading-tight">KCN Hiệp Phước, TP. Hồ Chí Minh</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-slate-600 mt-1">
              <Calendar size={15} className="shrink-0" />
              <span className="text-xs font-medium">20/07/2026 | 07:00 - 12:00</span>
            </div>
          </div>
          
          <span className="inline-block bg-[#446900] text-white font-semibold text-[10px] px-3 py-1 rounded-full whitespace-nowrap">
            Trực tiếp
          </span>
        </div>

        <div className="h-px bg-slate-400/20 w-full"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-white">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlBXZPZKmLFE2efYv3RvriMHPnBbvcGCvtMbBpFpS95NiazbSvfF5ESQu897UGQYDwSycdb5S4Zu3tPgkp4BuxFjgMgbv1bIrPuIIQ67da8ueGrBdBuhVHxQbyQrU8S9j_IlrbhFZsFOYEBQiNgJK3lD9C_qEG8xmG9-HhxYcfHgNayQ9mhBA4cziK5CaMj2qqzNORc99bDZhm7hFrPMNl9oiBDswNRv6HZdCS1Bacob5xjAAigSNeOw" 
                alt="Teacher Nguyễn Văn A"
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">GV dẫn đoàn</p>
              <p className="font-bold text-slate-800 text-sm mt-1">ThS. Nguyễn Văn A</p>
            </div>
          </div>
          
          <button 
            onClick={handleCallTeacher}
            className="w-10 h-10 bg-[#266528] text-white rounded-full flex items-center justify-center shadow-xs hover:bg-[#105217] active:scale-95 transition-transform"
          >
            <Phone size={18} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Timeline tracker */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative">
        {/* Continuous Timeline center line */}
        <div className="absolute left-[29px] top-7 bottom-7 w-0.5 bg-[#E7E0C4]"></div>
        
        <ul className="space-y-6 relative z-10">
          <li className="flex items-start gap-4">
            <div className="w-[18px] h-[18px] rounded-full bg-[#407f3e] flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-xs">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400">07:00</p>
              <p className="font-bold text-slate-800 text-sm">Tập trung (Cơ sở 1)</p>
            </div>
          </li>
          
          <li className="flex items-start gap-4">
            <div className="w-[18px] h-[18px] rounded-full bg-slate-300 flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-xs">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400">08:00</p>
              <p className="font-semibold text-slate-700 text-sm">Di chuyển bằng xe trường</p>
            </div>
          </li>
          
          <li className="flex items-start gap-4">
            <div className="w-[18px] h-[18px] rounded-full bg-slate-300 flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-xs">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400">09:00</p>
              <p className="font-semibold text-slate-700 text-sm">Tham quan nhà máy sữa và chụp ảnh lưu niệm</p>
            </div>
          </li>
          
          <li className="flex items-start gap-4">
            <div className="w-[18px] h-[18px] rounded-full bg-slate-300 flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-xs">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400">12:00</p>
              <p className="font-semibold text-slate-700 text-sm">Kết thúc, xe đón đưa về lại trường</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Participants List */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Danh sách đoàn viên</h3>
          <span className="font-bold text-[10px] bg-[#f2f5ec] text-[#41493e] px-2 py-1 rounded-lg">40 người</span>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar -mx-4 px-4">
          {participants.map((person, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0 w-[56px]">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shadow-xs bg-slate-50">
                <img 
                  src={person.avatar} 
                  alt={person.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="text-[10px] text-slate-600 font-semibold truncate text-center w-full leading-none">
                {person.name}
              </span>
            </div>
          ))}

          {/* Dummy extra placeholder */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 w-[56px] justify-center">
            <div className="w-12 h-12 rounded-full bg-[#f2f5ec] border border-slate-100 flex items-center justify-center text-[#266528]">
              <Users size={18} />
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate text-center w-full leading-none">
              +36 SV
            </span>
          </div>

          {/* View More button arrow */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 w-[56px] justify-center">
            <button 
              onClick={() => alert('Danh sách chi tiết gồm 40 sinh viên lớp CNTP21-02 tham gia chuyến đi.')}
              className="w-12 h-12 rounded-full bg-[#E7E0C4] text-[#266528] flex items-center justify-center hover:bg-slate-300/40 active:scale-95 transition-transform"
            >
              <ArrowRight size={18} />
            </button>
            <span className="text-[10px] text-[#266528] font-bold truncate text-center w-full leading-none">
              Xem tất cả
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
