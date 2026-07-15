import React, { useState, useEffect } from 'react';
import { khoaApi } from '../../services/api';
import { 
  Users, 
  Check, 
  X, 
  Search, 
  ShieldCheck, 
  Briefcase,
  Mail,
  Phone
} from 'lucide-react';

export default function DanhMuc_GiangVien_Khoa() {
  const [lecturers, setLecturers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    khoaApi.getLecturers()
      .then(res => setLecturers(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredLecturers = lecturers.filter(gv => 
    gv.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) || 
    gv.ma_gv.includes(searchTerm)
  );

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Danh mục Giảng viên</h2>
        <p className="text-slate-500 text-xs">Xem và điều hành thông tin đội ngũ Giảng viên hướng dẫn & dẫn đoàn thuộc Khoa</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-250 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </span>
          <input 
            type="text" 
            placeholder="Tìm theo Mã giảng viên hoặc Họ tên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="text-slate-500 font-semibold">
          Tổng cộng: {filteredLecturers.length} giảng viên
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 pl-4">Mã GV</th>
                <th className="p-3">Họ và Tên</th>
                <th className="p-3">Liên lạc</th>
                <th className="p-3">Đủ ĐK Hội đồng</th>
                <th className="p-3 text-right pr-4">Hạn mức Hướng dẫn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLecturers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">Không tìm thấy thông tin giảng viên nào</td>
                </tr>
              ) : (
                filteredLecturers.map((gv) => (
                  <tr key={gv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 pl-4 font-mono font-bold text-slate-900">{gv.ma_gv}</td>
                    <td className="p-3 font-semibold text-slate-800 flex items-center gap-2">
                      <Briefcase size={14} className="text-slate-400" />
                      {gv.ho_ten}
                    </td>
                    <td className="p-3 space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Mail size={12} />
                        <span className="font-mono">{gv.email}</span>
                      </div>
                      {gv.sdt && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Phone size={12} />
                          <span className="font-mono">{gv.sdt}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {gv.du_dk_hoi_dong ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <ShieldCheck size={11} /> Đạt tiêu chuẩn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          Chưa đủ điều kiện
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right pr-4 font-bold text-slate-800">
                      {gv.so_sv_toi_da_huong_dan ? `${gv.so_sv_toi_da_huong_dan} SV` : 'Không giới hạn'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
