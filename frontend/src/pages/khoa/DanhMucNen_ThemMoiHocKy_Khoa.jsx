import React, { useState, useEffect } from 'react';
import { Edit2, Plus, Calendar, Trash2, X, ChevronDown, Check } from 'lucide-react';
import { khoaApi } from '../../services/api';

export default function DanhMucNen_ThemMoiHocKy_Khoa() {
  const [activeTab, setActiveTab] = useState('nam-hoc');
  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [courses, setCourses] = useState([]);

  // Mockup modal state for prompt requirement
  const [showModal, setShowModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [y, t, c] = await Promise.all([
        khoaApi.getYears(),
        khoaApi.getTerms(),
        khoaApi.getCourses()
      ]);
      setYears(y.data);
      setTerms(t.data);
      setCourses(c.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Danh mục nền</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý các danh mục cơ sở của hệ thống</p>
      </div>

      <div className="flex gap-8 border-b border-[#E7E0C4] mb-6 relative">
        <button 
          onClick={() => setActiveTab('nam-hoc')}
          className={`pb-3 font-semibold text-sm transition-colors relative cursor-pointer ${activeTab === 'nam-hoc' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Năm học
          {activeTab === 'nam-hoc' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#89B449]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('hoc-ky')}
          className={`pb-3 font-semibold text-sm transition-colors relative cursor-pointer ${activeTab === 'hoc-ky' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Học kỳ
          {activeTab === 'hoc-ky' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#89B449]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('khoa')}
          className={`pb-3 font-semibold text-sm transition-colors relative cursor-pointer ${activeTab === 'khoa' ? 'text-[#89B449]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Khóa
          {activeTab === 'khoa' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#89B449]"></div>}
        </button>

        <div className="absolute right-0 bottom-2">
           <button 
             onClick={() => setShowModal(true)}
             className="bg-[#407F3E] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#407F3E]/90 transition-colors shadow-sm cursor-pointer"
           >
             <Plus className="w-4 h-4" />
             Thêm mới
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#E7E0C4]/40 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
              {activeTab === 'nam-hoc' && (
                <>
                  <th className="p-4">Tên năm học</th>
                  <th className="p-4">Ngày bắt đầu</th>
                  <th className="p-4">Ngày kết thúc</th>
                </>
              )}
              {activeTab === 'hoc-ky' && (
                <>
                  <th className="p-4">Học kỳ</th>
                  <th className="p-4">Năm học</th>
                  <th className="p-4">Ngày bắt đầu</th>
                  <th className="p-4">Ngày kết thúc</th>
                </>
              )}
              {activeTab === 'khoa' && (
                <>
                  <th className="p-4">Tên khóa</th>
                  <th className="p-4">Năm nhập học</th>
                  <th className="p-4">Số sinh viên</th>
                </>
              )}
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
            {activeTab === 'nam-hoc' && years.map(y => (
              <tr key={y.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold">{y.ten_nam_hoc}</td>
                <td className="p-4 text-slate-600">{new Date(y.ngay_bat_dau).toLocaleDateString('vi-VN')}</td>
                <td className="p-4 text-slate-600">{new Date(y.ngay_ket_thuc).toLocaleDateString('vi-VN')}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 text-slate-400">
                    <button className="p-1.5 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded transition-colors cursor-pointer" title="Sửa">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 cursor-not-allowed opacity-40 hover:bg-transparent text-slate-300" title="Không thể xóa năm học đã có học kỳ">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {activeTab === 'hoc-ky' && terms.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold">{t.ten_hoc_ky}</td>
                <td className="p-4 text-slate-600">{t.namHoc?.ten_nam_hoc}</td>
                <td className="p-4 text-slate-600">{new Date(t.ngay_bat_dau).toLocaleDateString('vi-VN')}</td>
                <td className="p-4 text-slate-600">{new Date(t.ngay_ket_thuc).toLocaleDateString('vi-VN')}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 text-slate-400">
                    <button className="p-1.5 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded transition-colors cursor-pointer" title="Sửa">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded transition-colors cursor-pointer" title="Xóa">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {activeTab === 'khoa' && courses.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold">{c.ten_khoa}</td>
                <td className="p-4 text-slate-600">{c.nam_nhap_hoc}</td>
                <td className="p-4 text-slate-600">{c.sinhVienCount || 0}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 text-slate-400">
                    <button className="p-1.5 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded transition-colors cursor-pointer" title="Sửa">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded transition-colors cursor-pointer" title="Xóa">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mockup Modal for Thêm mới Học kỳ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-[480px] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-[#E7E0C4]">
              <h2 className="text-[#407F3E] font-bold text-lg">Thêm mới Học kỳ</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tên học kỳ <span className="text-[#E68A8C]">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Học kỳ 1" 
                  className="w-full px-4 py-2.5 border border-[#E7E0C4] rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all" 
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Năm học <span className="text-[#E68A8C]">*</span>
                </label>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
                >
                  <span className={isDropdownOpen ? 'text-slate-800' : 'text-slate-500'}>Chọn năm học</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
                
                {/* Floating Open State Mockup */}
                {isDropdownOpen && (
                  <div className="absolute top-[72px] left-0 w-full bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-10 py-1 overflow-hidden">
                    <div className="px-4 py-2 text-sm text-slate-700 hover:bg-[#E7E0C4]/50 cursor-pointer transition-colors">2023-2024</div>
                    <div className="px-4 py-2 text-sm text-slate-800 bg-[#E7E0C4] font-medium flex justify-between items-center cursor-pointer transition-colors">
                      2024-2025
                      <Check className="w-4 h-4 text-[#407F3E]" />
                    </div>
                    <div className="px-4 py-2 text-sm text-slate-700 hover:bg-[#E7E0C4]/50 cursor-pointer transition-colors">2025-2026</div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày bắt đầu</label>
                <div className="relative">
                  <input type="text" placeholder="dd/mm/yyyy" className="w-full pl-4 pr-10 py-2.5 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all" />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày kết thúc</label>
                <div className="relative">
                  <input type="text" placeholder="dd/mm/yyyy" className="w-full pl-4 pr-10 py-2.5 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all" />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-[#E7E0C4] flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 border border-[#E7E0C4] hover:bg-slate-100 transition-colors cursor-pointer">
                Hủy
              </button>
              <button className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#407F3E] hover:bg-[#407F3E]/90 transition-colors shadow-sm cursor-pointer">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
