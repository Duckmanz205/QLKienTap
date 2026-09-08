import React, { useState, useEffect } from 'react';
import { 
  Upload, Plus, Search, ChevronDown, Check,
  Edit2, Key, Trash2, X, CloudUpload, FileSpreadsheet, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { khoaApi } from '../../services/api';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function DanhMuc_SinhVien_Khoa() {
  const [students, setStudents] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, stud: null, title: '', message: '' });
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('All');
  const [isKhoaDropdownOpen, setIsKhoaDropdownOpen] = useState(false);
  const [searchKhoaDropdown, setSearchKhoaDropdown] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [searchLopDropdown, setSearchLopDropdown] = useState('');
  const [filterHocLai, setFilterHocLai] = useState(false);
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modal States
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newMssv, setNewMssv] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [khoaList, setKhoaList] = useState([]);
  const [lopList, setLopList] = useState([]);

  useEffect(() => {
    fetchData(1);
    fetchCourses();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await khoaApi.getUniqueClasses();
      setLopList(res.data || []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách lớp:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await khoaApi.getCourses();
      setKhoaList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async (targetPage = page, targetLimit = limit) => {
    try {
      const svRes = await khoaApi.getStudents({ page: targetPage, limit: targetLimit, search: searchTerm });
      setStudents(svRes.data.data || []);
      setTotalStudents(svRes.data.total || 0);
      setTotalPages(svRes.data.totalPages || 1);
      setPage(targetPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      const autoTenKhoa = extractKhoa(newClass);
      
      if (editingStudent) {
        await khoaApi.updateStudent(editingStudent.id, {
          mssv: newMssv,
          ho_ten: newName,
          email: newEmail,
          sdt: newPhone,
          ten_lop: newClass,
          ten_khoa: autoTenKhoa
        });
        setToast({ show: true, message: 'Cập nhật sinh viên thành công', type: 'success' });
      } else {
        await khoaApi.createStudent({
          mssv: newMssv,
          ho_ten: newName,
          ten_lop: newClass,
          email: newEmail,
          sdt: newPhone,
          ten_khoa: autoTenKhoa
        });
        setToast({ show: true, message: 'Thêm sinh viên thành công', type: 'success' });
      }
      setShowSingleModal(false);
      setEditingStudent(null);
      setNewMssv('');
      setNewName('');
      setNewClass('');
      setNewEmail('');
      setNewPhone('');
      fetchData(1);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleEditClick = (stud) => {
    setEditingStudent(stud);
    setNewMssv(stud.mssv);
    setNewName(stud.ho_ten);
    setNewClass(stud.ten_lop || '');
    setNewEmail(stud.email || '');
    setNewPhone(stud.sdt || '');
    setShowSingleModal(true);
  };

  const handleDeleteClick = (stud) => {
    setConfirmModal({
      show: true,
      action: 'delete',
      stud,
      title: 'Xóa sinh viên',
      message: (
        <>
          Bạn có chắc chắn muốn xóa sinh viên <span className="font-semibold text-gray-800">{stud.ho_ten}</span> khỏi hệ thống?
        </>
      )
    });
  };

  const executeConfirmAction = async () => {
    const { action, stud } = confirmModal;
    if (action === 'delete') {
      try {
        const res = await khoaApi.deleteStudent(stud.id);
        setToast({ show: true, message: res.data.message || 'Xóa sinh viên thành công', type: 'success' });
        fetchData();
      } catch (err) {
        console.error(err);
        setToast({ show: true, message: err.response?.data?.message || 'Có lỗi xảy ra khi xóa sinh viên', type: 'error' });
      }
    }
    setConfirmModal({ show: false, action: null, stud: null, title: '', message: '' });
  };

  const extractKhoa = (ten_lop) => {
    if (!ten_lop) return 'Khác';
    const match = ten_lop.match(/^(\d+)/);
    return match ? `Khóa ${match[1]}` : 'Khác';
  };

  // Dropdown Lists
  const khoaOptions = ["Tất cả khóa", ...khoaList.map(k => k.ten_khoa)];
  const lopOptions = ["Tất cả lớp", ...lopList];

  const filteredStudents = students.filter(s => {
    const k = extractKhoa(s.ten_lop);
    const matchesKhoa = filterKhoa === 'All' || k === filterKhoa || filterKhoa === "Tất cả khóa" || filterKhoa.includes(k);
    const matchesClass = filterClass === 'All' || filterClass === "Tất cả lớp" || s.ten_lop === filterClass;
    const matchesHocLai = !filterHocLai || s.hoc_lai === true;
    return matchesKhoa && matchesClass && matchesHocLai;
  });

  const downloadTemplate = () => {
    const templateData = [
      {
        "MSSV": "20012345",
        "Họ tên": "Nguyễn Văn A",
        "Email": "20012345@student.huit.edu.vn",
        "SĐT": "0912345678",
        "Lớp": "12DHTP01"
      },
      {
        "MSSV": "20012346",
        "Họ tên": "Trần Thị B",
        "Email": "20012346@student.huit.edu.vn",
        "SĐT": "0987654321",
        "Lớp": "12DHTP02"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SinhVien");
    XLSX.writeFile(wb, "Mau_Import_SinhVien.xlsx");
  };

  const handleOpenImportModal = async () => {
    setIsImportModalOpen(true);
    // Danh sách khóa đã được load ở fetchCourses() khi component mount
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
      
      const formattedData = data.map(row => {
        const tenLop = String(row['Lớp'] || row['ten_lop'] || '').trim();
        const autoTenKhoa = extractKhoa(tenLop);
        const tenKhoa = String(row['Khóa'] || row['ten_khoa'] || autoTenKhoa).trim();
        const matchedKhoa = khoaList.find(k => k.ten_khoa === tenKhoa);
        return {
          mssv: String(row['MSSV'] || row['mssv'] || ''),
          ho_ten: String(row['Họ tên'] || row['ho_ten'] || ''),
          email: String(row['Email'] || row['email'] || ''),
          sdt: String(row['SĐT'] || row['sdt'] || ''),
          ten_lop: tenLop,
          khoa_id: matchedKhoa ? matchedKhoa.id : undefined,
          ten_khoa: tenKhoa,
        };
      }).filter(r => r.mssv && r.ho_ten);

      setImportData(formattedData);
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleImportExcel = async () => {
    if (importData.length === 0) {
      setToast({ show: true, message: 'Không có dữ liệu hợp lệ để import', type: 'error' });
      return;
    }
    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of importData) {
      try {
        await khoaApi.createStudent(record);
        successCount++;
      } catch (err) {
        console.error(err);
        errorCount++;
      }
    }
    
    setToast({ show: true, message: `Import hoàn tất. Thành công: ${successCount}, Lỗi: ${errorCount}`, type: 'success' });
    setIsImporting(false);
    setIsImportModalOpen(false);
    setImportData([]);
    fetchData(1);
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-2 animate-in fade-in duration-300 relative">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      <ConfirmModal
        isOpen={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        actionType={confirmModal.action}
        onConfirm={executeConfirmAction}
        onCancel={() => setConfirmModal({ show: false, action: null, stud: null, title: '', message: '' })}
      />
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Sinh viên</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleOpenImportModal}
            className="px-4 py-2 border-2 border-[#407F3E] text-[#407F3E] hover:bg-[#407F3E]/10 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Nhập từ Excel
          </button>
          <button 
            onClick={() => {
              setEditingStudent(null);
              setNewMssv('');
              setNewName('');
              setNewClass('');
              setNewEmail('');
              setNewPhone('');
              setShowSingleModal(true);
            }}
            className="px-4 py-2 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm sinh viên
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
            placeholder="Tìm theo MSSV/họ tên"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData(1)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all"
          />
        </div>

        {/* Khóa Dropdown */}
        <div className="relative min-w-[160px]">
          <div 
            onClick={() => { setIsKhoaDropdownOpen(!isKhoaDropdownOpen); setIsClassDropdownOpen(false); }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isKhoaDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="text-slate-700 font-medium">{filterKhoa === 'All' ? 'Tất cả khóa' : filterKhoa}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          {isKhoaDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm khóa..." 
                  value={searchKhoaDropdown}
                  onChange={(e) => setSearchKhoaDropdown(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {khoaOptions
                  .filter(opt => opt.toLowerCase().includes(searchKhoaDropdown.toLowerCase()))
                  .map(opt => (
                  <div 
                    key={opt}
                    onClick={() => { setFilterKhoa(opt === 'Tất cả khóa' ? 'All' : opt); setIsKhoaDropdownOpen(false); setSearchKhoaDropdown(''); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      (filterKhoa === opt || (filterKhoa === 'All' && opt === 'Tất cả khóa')) 
                        ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                        : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                    }`}
                  >
                    {opt}
                    {(filterKhoa === opt || (filterKhoa === 'All' && opt === 'Tất cả khóa')) && <Check className="w-4 h-4 text-[#407F3E]" />}
                  </div>
                ))}
                {khoaOptions.filter(opt => opt.toLowerCase().includes(searchKhoaDropdown.toLowerCase())).length === 0 && (
                  <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lớp Dropdown */}
        <div className="relative min-w-[160px]">
          <div 
            onClick={() => { setIsClassDropdownOpen(!isClassDropdownOpen); setIsKhoaDropdownOpen(false); }}
            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isClassDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="text-slate-700 font-medium">{filterClass === 'All' ? 'Tất cả lớp' : filterClass}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          {isClassDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
              <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                <input 
                  type="text" 
                  placeholder="Tìm lớp..." 
                  value={searchLopDropdown}
                  onChange={(e) => setSearchLopDropdown(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {lopOptions
                  .filter(opt => opt.toLowerCase().includes(searchLopDropdown.toLowerCase()))
                  .map(opt => (
                  <div 
                    key={opt}
                    onClick={() => { setFilterClass(opt === 'Tất cả lớp' ? 'All' : opt); setIsClassDropdownOpen(false); setSearchLopDropdown(''); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      (filterClass === opt || (filterClass === 'All' && opt === 'Tất cả lớp')) 
                        ? 'bg-[#E7E0C4] text-slate-800 font-bold' 
                        : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                    }`}
                  >
                    {opt}
                    {(filterClass === opt || (filterClass === 'All' && opt === 'Tất cả lớp')) && <Check className="w-4 h-4 text-[#407F3E]" />}
                  </div>
                ))}
                {lopOptions.filter(opt => opt.toLowerCase().includes(searchLopDropdown.toLowerCase())).length === 0 && (
                  <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#E7E0C4]">
          <span className="text-sm font-semibold text-slate-700">Chỉ hiện SV học lại</span>
          <button 
            onClick={() => setFilterHocLai(!filterHocLai)}
            className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${filterHocLai ? 'bg-[#89B449]' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${filterHocLai ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4">MSSV</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Lớp</th>
                <th className="p-4">Khóa</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">Không tìm thấy sinh viên nào khớp điều kiện</td>
                </tr>
              ) : (
                filteredStudents.map(stud => {
                  const khoa = extractKhoa(stud.ten_lop);
                  return (
                    <tr key={stud.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-slate-600 text-xs">{stud.mssv}</td>
                      <td className="p-4 font-bold text-slate-800">{stud.ho_ten}</td>
                      <td className="p-4 font-semibold text-slate-700">{stud.ten_lop}</td>
                      <td className="p-4 text-slate-600">{khoa}</td>
                      <td className="p-4 text-slate-500">{stud.email}</td>
                      <td className="p-4 text-center">
                        {stud.hoc_lai ? (
                          <span className="bg-[#DBD468] text-[#191d17] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            Học lại
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 text-slate-400">
                          <button 
                            className="p-1.5 hover:text-[#407F3E] hover:bg-[#407F3E]/10 rounded transition-colors cursor-pointer" 
                            title="Sửa thông tin"
                            onClick={() => handleEditClick(stud)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button 
                            className="p-1.5 hover:text-[#E68A8C] hover:bg-[#E68A8C]/10 rounded transition-colors cursor-pointer" 
                            title="Xóa sinh viên" 
                            onClick={() => handleDeleteClick(stud)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                fetchData(1, newLimit);
              }}
              className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>/ {totalStudents} sinh viên</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={page <= 1}
              onClick={() => fetchData(1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang đầu
            </button>
            <button 
              disabled={page <= 1}
              onClick={() => fetchData(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trước
            </button>
            
            <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
              Trang {page} / {totalPages}
            </span>
            
            <button 
              disabled={page >= totalPages}
              onClick={() => fetchData(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Sau
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => fetchData(totalPages)}
              className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Trang cuối
            </button>
          </div>
        </div>
      </div>

      {/* Single Student Modal */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50  animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E7E0C4] max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-slate-800 text-lg">
                {editingStudent ? "Sửa thông tin sinh viên" : "Thêm sinh viên mới"}
              </h4>
              <button 
                onClick={() => setShowSingleModal(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSingleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã số SV (MSSV) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="20032119" 
                    value={newMssv}
                    onChange={(e) => setNewMssv(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] text-sm transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã Lớp <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="14DHTP1" 
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và Tên <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Nguyễn Văn Hải" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                <input 
                  type="email" 
                  placeholder="20032119@huit.edu.vn" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] text-sm transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Số điện thoại</label>
                <input 
                  type="text" 
                  placeholder="0912345678" 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] text-sm transition-all font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowSingleModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  {editingStudent ? "Lưu thay đổi" : "Thêm sinh viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40  animate-in fade-in duration-200" onClick={() => !isImporting && setIsImportModalOpen(false)}></div>
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#407F3E]" />
                Nhập danh sách sinh viên từ Excel
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
                          <th className="px-4 py-3">MSSV</th>
                          <th className="px-4 py-3">Họ tên</th>
                          <th className="px-4 py-3">Lớp</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">SĐT</th>
                          <th className="px-4 py-3">Cảnh báo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {importData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-bold text-[#407F3E]">{row.mssv}</td>
                            <td className="px-4 py-2 text-slate-800">{row.ho_ten}</td>
                            <td className="px-4 py-2">{row.ten_lop}</td>
                            <td className="px-4 py-2">{row.email}</td>
                            <td className="px-4 py-2">{row.sdt}</td>
                            <td className="px-4 py-2">
                              {row.khoa_id === undefined && row.ten_khoa !== 'Khác' && (
                                <span className="text-[#407F3E] text-xs italic font-semibold">
                                  Sẽ tự tạo {row.ten_khoa}
                                </span>
                              )}
                              {row.khoa_id === undefined && row.ten_khoa === 'Khác' && (
                                <span className="text-[#E68A8C] text-xs italic">
                                  Không xác định được khóa
                                </span>
                              )}
                            </td>
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
