import React from 'react';
import { StudentProfile } from '../types';
import { User, Mail, GraduationCap, RefreshCw, Bookmark, ShieldCheck, FileCheck, LogOut } from 'lucide-react';

interface ProfileProps {
  profile: StudentProfile;
  onResetData: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ profile, onResetData }) => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#266528] mb-4 shadow-sm bg-[#ecefe6]">
          <img 
            src={profile.avatar} 
            alt={profile.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-lg font-extrabold text-slate-800">{profile.name}</h2>
        <p className="text-xs text-[#266528] font-bold mt-1 bg-[#ecefe6] px-3 py-1 rounded-full">
          Mã số SV: {profile.studentId}
        </p>
      </div>

      {/* Profile Information List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        <div className="p-4 flex items-center gap-3.5">
          <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
            <GraduationCap size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngành học</p>
            <p className="text-xs font-bold text-slate-700 mt-0.5">{profile.major}</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3.5">
          <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
            <Bookmark size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lớp học phần</p>
            <p className="text-xs font-bold text-slate-700 mt-0.5">{profile.class}</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3.5">
          <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email sinh viên</p>
            <p className="text-xs font-bold text-slate-700 mt-0.5">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Admin checklist progress card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-slate-800 text-sm mb-3.5 flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#266528]" />
          <span>Hồ sơ thực tập niên khóa</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-lg">
            <span>1. Khai báo thông tin SV</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-sm font-bold">Hoàn thành</span>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-lg">
            <span>2. Giấy cam kết gia đình</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-sm font-bold">Đã nộp</span>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-lg">
            <span>3. Xác nhận đóng phí bảo hiểm</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-sm font-bold">Đã nộp</span>
          </div>
        </div>
      </div>

      {/* Reset Demo State option */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => {
            const confirmReset = window.confirm('Bạn có muốn đặt lại toàn bộ dữ liệu demo (bao gồm đăng ký chuyến đi, nộp báo cáo, thanh toán)?');
            if (confirmReset) {
              onResetData();
              alert('Dữ liệu đã được khôi phục về trạng thái ban đầu!');
            }
          }}
          className="w-full bg-[#f2f5ec] hover:bg-[#ecefe6] text-[#266528] hover:text-[#105217] font-bold text-xs py-3 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
        >
          <RefreshCw size={14} />
          <span>Khôi phục dữ liệu ban đầu</span>
        </button>

        <button 
          onClick={() => alert('Chức năng đăng xuất sinh viên đã bị tắt cho tài khoản demo.')}
          className="w-full bg-rose-50 text-rose-600 font-bold text-xs py-3 rounded-xl hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
        >
          <LogOut size={14} />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </div>
  );
};
