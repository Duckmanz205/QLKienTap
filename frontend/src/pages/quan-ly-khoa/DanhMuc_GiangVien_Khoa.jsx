import React, { useState, useEffect } from 'react';
import { 
  Upload, Plus, Search, ChevronDown, Check,
  Edit2, Key, Trash2, X, CloudUpload, FileSpreadsheet, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { khoaApi } from '../../services/api';

export default function DanhMuc_GiangVien_Khoa() {
  const [lecturers, setLecturers] = useState([]);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    ma_gv: '',
    ho_ten: '',
    email: '',
    sdt: '',
    so_sv_toi_da_huong_dan: ''
  });
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHoiDong, setFilterHoiDong] = useState('Tất cả');
  const [isHoiDongDropdownOpen, setIsHoiDongDropdownOpen] = useState(false);
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterHoiDong]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await khoaApi.getLecturers();
      setLecturers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const hoiDongOptions = ["Tất cả", "Đủ điều kiện", "Chưa đủ điều kiện"];

  const filteredLecturers = lecturers.filter(gv => {
    const matchesSearch = gv.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) || gv.ma_gv.includes(searchTerm);
    let matchesHoiDong = true;
    if (filterHoiDong === "Đủ điều kiện") matchesHoiDong = gv.du_dk_hoi_dong === true;
    if (filterHoiDong === "Chưa đủ điều kiện") matchesHoiDong = gv.du_dk_hoi_dong === false;
    
    return matchesSearch && matchesHoiDong;
  });

  const totalLecturers = filteredLecturers.length;
  const totalPages = Math.ceil(totalLecturers / limit) || 1;
  const paginatedLecturers = filteredLecturers.slice((page - 1) * limit, page * limit);

  const toggleHoiDongStatus = async (id, currentStatus) => {
    try {
      await khoaApi.updateLecturerBoardEligibility(id, !currentStatus);
      setLecturers(lecturers.map(gv => 
        gv.id === id ? { ...gv, du_dk_hoi_dong: !currentStatus } : gv
      ));
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleOpenModal = (lecturer = null) => {
    if (lecturer) {
      setEditingLecturer(lecturer);
      setFormData({
        ma_gv: lecturer.ma_gv,
        ho_ten: lecturer.ho_ten,
        email: lecturer.email || '',
        sdt: lecturer.sdt || '',
        so_sv_toi_da_huong_dan: lecturer.so_sv_toi_da_huong_dan || ''
      });
    } else {
      setEditingLecturer(null);
      setFormData({
        ma_gv: '',
        ho_ten: '',
        email: '',
        sdt: '',
        so_sv_toi_da_huong_dan: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        so_sv_toi_da_huong_dan: formData.so_sv_toi_da_huong_dan ? parseInt(formData.so_sv_toi_da_huong_dan) : undefined
      };
      
      if (editingLecturer) {
        await khoaApi.updateLecturer(editingLecturer.id, dataToSubmit);
        alert('Cập nhật giảng viên thành công');
      } else {
        await khoaApi.createLecturer(dataToSubmit);
        alert('Thêm giảng viên thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };


  const downloadTemplate = () => {
    const templateData = [
      {
        "Mã GV": "GV001",
        "Họ tên": "Trần Thị A",
        "Email": "tranthia@huit.edu.vn",
        "SĐT": "0912345678",
        "Số SV hướng dẫn tối đa": 15
      },
      {
        "Mã GV": "GV002",
        "Họ tên": "Nguyễn Văn B",
        "Email": "nguyenvanb@huit.edu.vn",
        "SĐT": "0987654321",
        "Số SV hướng dẫn tối đa": 10
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GiangVien");
    XLSX.writeFile(wb, "Mau_Import_GiangVien.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const formattedData = data.map(row => ({
        ma_gv: String(row['Mã GV'] || row['ma_gv'] || ''),
        ho_ten: String(row['Họ tên'] || row['ho_ten'] || ''),
        email: String(row['Email'] || row['email'] || ''),
        sdt: String(row['SĐT'] || row['sdt'] || ''),
        so_sv_toi_da_huong_dan: parseInt(row['Số SV hướng dẫn tối đa'] || row['so_sv_toi_da_huong_dan'] || 0)
      })).filter(r => r.ma_gv && r.ho_ten);

      setImportData(formattedData);
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleImportExcel = async () => {
    if (importData.length === 0) {
      alert('Không có dữ liệu hợp lệ để import');
      return;
    }
    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of importData) {
      try {
        await khoaApi.createLecturer(record);
        successCount++;
      } catch (err) {
        console.error(err);
        errorCount++;
      }
    }
    
    alert(`Import hoàn tất. Thành công: ${successCount}, Lỗi: ${errorCount}`);
    setIsImporting(false);
    setIsImportModalOpen(false);
    setImportData([]);
    fetchData();
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-2 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Giảng viên</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 border-2 border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Nhập từ Excel
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" />
            Thêm giảng viên
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E7E0C4] mb-6 flex flex-wrap gap-4 items-center relative z-20">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo mã GV/họ tên"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
          />
        </div>

        {/* Đủ điều kiện hội đồng Dropdown */}
        <div className="relative min-w-[250px]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">Đủ ĐK hội đồng:</span>
            <div className="relative w-full">
              <div 
                onClick={() => setIsHoiDongDropdownOpen(!isHoiDongDropdownOpen)}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isHoiDongDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
              >
                <span className="text-slate-700 font-medium">{filterHoiDong}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              {isHoiDongDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1">
                  {hoiDongOptions.map(opt => (
                    <div 
                      key={opt}
                      onClick={() => { setFilterHoiDong(opt); setIsHoiDongDropdownOpen(false); }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                        (filterHoiDong === opt) 
                          ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                          : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                      }`}
                    >
                      {opt}
                      {filterHoiDong === opt && <Check className="w-4 h-4 text-[#407F3E]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4">Mã GV</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Đủ ĐK hội đồng</th>
                <th className="p-4 text-center">Số SV tối đa Hướng dẫn</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {paginatedLecturers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">Không tìm thấy giảng viên nào khớp điều kiện</td>
                </tr>
              ) : (
                paginatedLecturers.map(gv => (
                  <tr key={gv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-800">{gv.ma_gv}</td>
                    <td className="p-4 font-bold text-[#407F3E]">{gv.ho_ten}</td>
                    <td className="p-4 text-slate-600">{gv.email}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => toggleHoiDongStatus(gv.id, gv.du_dk_hoi_dong)}
                        className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer inline-block align-middle ${gv.du_dk_hoi_dong ? 'bg-[#89B449]' : 'bg-slate-300'}`}
                        title={gv.du_dk_hoi_dong ? "Đủ điều kiện" : "Chưa đủ điều kiện"}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${gv.du_dk_hoi_dong ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      {gv.so_sv_toi_da_huong_dan ? (
                        <span className="font-bold text-slate-800 text-sm">{gv.so_sv_toi_da_huong_dan}</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-400 font-medium text-[10px] uppercase tracking-wider rounded-md border border-slate-200">Chưa cấu hình</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 text-slate-400">
                        <button onClick={() => handleOpenModal(gv)} className="p-1.5 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded transition-colors cursor-pointer" title="Sửa thông tin">
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button 
                          className="p-1.5 text-slate-300 cursor-not-allowed" 
                          title="Không thể xóa giảng viên từ giao diện này" 
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7E0C4] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Hiển thị</span>
            <select 
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>/ {totalLecturers} giảng viên</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button 
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {page} / {totalPages}
            </span>
            
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}></div>
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {editingLecturer ? <Edit2 className="w-5 h-5 text-[#407F3E]" /> : <Plus className="w-5 h-5 text-[#407F3E]" />}
                {editingLecturer ? 'Sửa thông tin giảng viên' : 'Thêm giảng viên mới'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Mã Giảng Viên</label>
                <input
                  type="text"
                  required
                  value={formData.ma_gv}
                  onChange={(e) => setFormData({...formData, ma_gv: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] transition-all disabled:opacity-60"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Họ tên</label>
                <input
                  type="text"
                  required
                  value={formData.ho_ten}
                  onChange={(e) => setFormData({...formData, ho_ten: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] transition-all disabled:opacity-60"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.sdt}
                    onChange={(e) => setFormData({...formData, sdt: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Số SV tối đa hướng dẫn</label>
                <input
                  type="number"
                  min="0"
                  value={formData.so_sv_toi_da_huong_dan}
                  onChange={(e) => setFormData({...formData, so_sv_toi_da_huong_dan: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-xl text-sm focus:outline-none focus:border-[#407F3E] transition-all"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer">
                Hủy
              </button>
              <button type="submit" className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer">
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !isImporting && setIsImportModalOpen(false)}></div>
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#407F3E]" />
                Nhập danh sách giảng viên từ Excel
              </h2>
              <button disabled={isImporting} type="button" onClick={() => setIsImportModalOpen(false)} className="p-1.5 text-slate-400 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6 overflow-hidden flex-1 bg-slate-50">
              {/* Banner gợi ý tải file mẫu */}
              <div className="bg-[#407F3E]/5 border border-[#407F3E]/20 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-[#407F3E]/10">
                    <FileSpreadsheet className="w-6 h-6 text-[#407F3E]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Chưa có file đúng định dạng?</p>
                    <p className="text-sm text-slate-500">Tải file mẫu để đảm bảo import chính xác, tránh sai cột dữ liệu.</p>
                  </div>
                </div>
                <button 
                  onClick={downloadTemplate}
                  type="button"
                  className="shrink-0 flex items-center gap-2 border border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Tải file mẫu
                </button>
              </div>

              <div className="flex gap-4 items-center">
                <label className="flex-1">
                  <div className="border-2 border-dashed border-[#E7E0C4] rounded-xl p-8 bg-white flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-[#89B449] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <CloudUpload className="w-6 h-6 text-[#89B449]" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                      Kéo thả file Excel vào đây, hoặc bấm để chọn file
                    </p>
                    <p className="text-xs text-slate-400">Định dạng hỗ trợ: .xlsx, .xls</p>
                  </div>
                  <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={isImporting} />
                </label>
              </div>

              {importData.length > 0 && (
                <div className="flex-1 bg-white border border-[#E7E0C4] rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 py-3 bg-slate-50 border-b border-[#E7E0C4] flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Xem trước dữ liệu ({importData.length} dòng)</span>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="sticky top-0 bg-[#E7E0C4] z-10">
                        <tr className="text-slate-800 font-bold uppercase tracking-wider text-xs">
                          <th className="px-4 py-3">Mã GV</th>
                          <th className="px-4 py-3">Họ tên</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">SĐT</th>
                          <th className="px-4 py-3">Số SV HD tối đa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {importData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-bold text-[#407F3E]">{row.ma_gv}</td>
                            <td className="px-4 py-2 text-slate-800">{row.ho_ten}</td>
                            <td className="px-4 py-2">{row.email}</td>
                            <td className="px-4 py-2">{row.sdt}</td>
                            <td className="px-4 py-2">{row.so_sv_toi_da_huong_dan}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button disabled={isImporting} type="button" onClick={() => setIsImportModalOpen(false)} className="px-5 py-2.5 border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-50">
                Hủy
              </button>
              <button 
                disabled={isImporting || importData.length === 0} 
                onClick={handleImportExcel} 
                className="px-6 py-2.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Đang import...
                  </>
                ) : (
                  'Xác nhận Import'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
