import React, { useState } from 'react';
import { 
  Grid, 
  Search, 
  Plus, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Download,
  Building,
  Sparkles
} from 'lucide-react';

export default function StudentCatalogueView() {
  const [searchTerm, setSearchTerm] = useState('');

  // Roster of major academic classes in food technology department
  const initialClasses = [
    { code: '14ĐHTP1', name: 'Đại học Công nghệ Thực phẩm 14 - Lớp 1', students: 32, advisor: 'Lê Minh Tuấn', major: 'Công nghệ Thực phẩm', year: '2021 - 2025' },
    { code: '14ĐHTP2', name: 'Đại học Công nghệ Thực phẩm 14 - Lớp 2', students: 30, advisor: 'Trần Thị Lan', major: 'Công nghệ Thực phẩm', year: '2021 - 2025' },
    { code: '13ĐHTP1', name: 'Đại học Công nghệ Thực phẩm 13 - Lớp 1', students: 35, advisor: 'Đỗ Minh Phương', major: 'Công nghệ Thực phẩm', year: '2020 - 2024' },
    { code: '13ĐHTP2', name: 'Đại học Công nghệ Thực phẩm 13 - Lớp 2', students: 31, advisor: 'Bùi Tiến Dũng', major: 'Công nghệ Thực phẩm', year: '2020 - 2024' },
    { code: '14ĐHCL1', name: 'Đại học Đảm bảo chất lượng & An toàn thực phẩm', students: 28, advisor: 'Vũ Quốc Huy', major: 'Đảm bảo chất lượng thực phẩm', year: '2021 - 2025' },
    { code: '13ĐHCL1', name: 'Đại học Đảm bảo chất lượng & An toàn thực phẩm 13', students: 25, advisor: 'Nguyễn Tiến Dũng', major: 'Đảm bảo chất lượng thực phẩm', year: '2020 - 2024' }
  ];

  const filteredClasses = initialClasses.filter(c => {
    return c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.advisor.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.major.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-container tracking-tight">
            Danh mục nền / Lớp niên chế
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý mã lớp niên chế, chuyên ngành, khóa học và giảng viên cố vấn thuộc diện kiến tập thực tế của khoa.
          </p>
        </div>
        <button
          onClick={() => alert('Chức năng thêm mã lớp niên chế mới đang được cấu hình cùng cổng thông tin đào tạo Đại học.')}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#407F3E] hover:bg-[#346732] text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm lớp mới</span>
        </button>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[#E7E0C4] rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#407F3E] text-white rounded-full flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tổng số lớp niên chế</p>
            <h3 className="text-xl font-black text-slate-800">6 Lớp quản lý</h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#407F3E] text-white rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ngành đào tạo khoa</p>
            <h3 className="text-xl font-black text-slate-800">2 Chuyên ngành</h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#407F3E] text-white rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tổng sinh viên diện kiến tập</p>
            <h3 className="text-xl font-black text-slate-800">181 Sinh viên</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã lớp, giảng viên chủ nhiệm hoặc ngành đào tạo..."
            className="w-full bg-slate-50 text-slate-800 text-sm pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#407F3E]/20 outline-none font-medium"
          />
        </div>
      </div>

      {/* Grid of Classes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cl) => (
          <div 
            key={cl.code} 
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#407F3E]/10 text-primary-container text-xs font-black rounded-lg">
                  Lớp: {cl.code}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">{cl.year}</span>
              </div>

              <h3 className="font-extrabold text-slate-800 text-base mt-4">
                {cl.name}
              </h3>

              <div className="mt-4 space-y-2 text-xs font-semibold text-slate-500">
                <p>• Ngành: <span className="text-slate-700 font-bold">{cl.major}</span></p>
                <p>• Cố vấn học tập: <span className="text-slate-700 font-bold">{cl.advisor}</span></p>
                <p>• Sĩ số lớp niên chế: <span className="text-slate-800 font-black">{cl.students} sinh viên</span></p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
              <button 
                onClick={() => alert(`Đang tải toàn bộ danh sách lớp ${cl.code} kèm mã đăng ký kiến tập thực tế...`)}
                className="flex-1 py-2 bg-slate-50 hover:bg-[#407F3E]/10 text-slate-600 hover:text-primary-container text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất file lớp</span>
              </button>
              <button 
                onClick={() => alert(`Tính năng tra cứu hồ sơ chi tiết các sinh viên lớp ${cl.code} đang tải...`)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                Xem SV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
