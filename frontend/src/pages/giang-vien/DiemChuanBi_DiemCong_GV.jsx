import React, { useState } from 'react';
import { 
  Info, ChevronDown, Check, Save, Plus, Minus
} from 'lucide-react';

export default function DiemChuanBi_DiemCong_GV() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Mock Trips
  const trips = [
    { id: 1, name: 'Nhà máy Yakult HCM (10/09/2026)' },
    { id: 2, name: 'Vinamilk Bình Dương (05/09/2026)' }
  ];
  const [selectedTrip, setSelectedTrip] = useState(trips[0]);

  // Mock Students
  const initialStudents = [
    { id: 101, mssv: '2022220001', name: 'Nguyễn Văn An', diemChuanBi: '', diemCong: 0.0, ghiChu: '' },
    { id: 102, mssv: '2022220002', name: 'Trần Thị Bình', diemChuanBi: '8.5', diemCong: 0.5, ghiChu: 'Hỏi đáp tích cực' },
    { id: 103, mssv: '2022220003', name: 'Lê Hoàng Cường', diemChuanBi: '7.0', diemCong: 1.0, ghiChu: 'Nhóm trưởng xuất sắc' },
    { id: 104, mssv: '2022220004', name: 'Phạm Duy Khang', diemChuanBi: '9.0', diemCong: 0.0, ghiChu: '' },
    { id: 105, mssv: '2022220005', name: 'Vũ Quốc Huy', diemChuanBi: '', diemCong: 0.0, ghiChu: '' },
  ];
  const [students, setStudents] = useState(initialStudents);

  const handleScoreChange = (id, field, value) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleBonusChange = (id, delta) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        let newBonus = s.diemCong + delta;
        if (newBonus > 1.0) newBonus = 1.0;
        if (newBonus < 0) newBonus = 0;
        return { ...s, diemCong: newBonus };
      }
      return s;
    }));
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300 relative" onClick={() => setIsDropdownOpen(false)}>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Điểm chuẩn bị & điểm cộng</h1>
      </div>

      {/* Top Bar: Dropdown */}
      <div className="mb-6">
        <div className="relative w-full md:w-[400px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Chọn chuyến tham quan</label>
          <div 
            onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all shadow-sm ${isDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
          >
            <span className="font-bold text-slate-800 truncate pr-2">{selectedTrip.name}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in slide-in-from-top-1">
              {trips.map(trip => (
                <div 
                  key={trip.id}
                  onClick={() => { setSelectedTrip(trip); setIsDropdownOpen(false); }}
                  className={`px-4 py-3 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    selectedTrip.id === trip.id ? 'bg-[#E7E0C4]/40 text-[#407F3E] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">{trip.name}</span>
                  {selectedTrip.id === trip.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#E7E0C4] rounded-xl p-4 flex items-start gap-3 shadow-sm border border-[#E7E0C4]/50 mb-8">
        <Info className="w-5 h-5 text-[#407F3E] shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-slate-700 leading-relaxed">
          <strong className="text-slate-800">Lưu ý:</strong> Điểm chuẩn bị lấy từ bài kiểm tra tổ chức ngoài hệ thống (Google Form/Kahoot...). 
          Với chuyến tự do, đây là bài do GVHD tổ chức riêng. Điểm cộng tối đa là 1.0 điểm/chuyến.
        </p>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-visible pb-24 md:pb-0">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                <th className="p-4 pl-6 min-w-[120px]">MSSV</th>
                <th className="p-4 min-w-[200px]">Họ tên</th>
                <th className="p-4 text-center min-w-[150px]">Điểm chuẩn bị<br/><span className="text-[10px] text-slate-500 font-medium normal-case">(Hệ số 10)</span></th>
                <th className="p-4 text-center min-w-[180px]">Điểm cộng</th>
                <th className="p-4 pr-6 min-w-[200px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  
                  <td className="p-4 pl-6 font-mono font-bold text-slate-600">{student.mssv}</td>
                  
                  <td className="p-4 font-bold text-slate-800">{student.name}</td>
                  
                  <td className="p-4">
                    <div className="flex justify-center">
                      <input 
                        type="number" 
                        min="0" max="10" step="0.1"
                        value={student.diemChuanBi}
                        onChange={(e) => handleScoreChange(student.id, 'diemChuanBi', e.target.value)}
                        placeholder="--"
                        className="w-20 px-3 py-2 text-center bg-white border border-[#E7E0C4] rounded-lg text-sm font-bold text-[#407F3E] focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all placeholder-slate-300"
                      />
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button 
                          onClick={() => handleBonusChange(student.id, -0.5)}
                          disabled={student.diemCong <= 0}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="w-16 text-center font-bold text-xs">
                          <span className={student.diemCong > 0 ? "text-[#89B449]" : "text-slate-500"}>
                            {student.diemCong > 0 ? `+${student.diemCong.toFixed(1)}` : '0.0'}
                          </span>
                        </div>
                        
                        <button 
                          onClick={() => handleBonusChange(student.id, 0.5)}
                          disabled={student.diemCong >= 1.0}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:text-[#407F3E] hover:border-[#407F3E] hover:bg-[#407F3E]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xs group"
                        >
                          <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">Tối đa 1.0 đ</span>
                    </div>
                  </td>
                  
                  <td className="p-4 pr-6">
                    <input 
                      type="text" 
                      value={student.ghiChu}
                      onChange={(e) => handleScoreChange(student.id, 'ghiChu', e.target.value)}
                      placeholder="Ghi chú (tùy chọn)..."
                      className="w-full px-3 py-2 bg-transparent border-b border-transparent hover:border-[#E7E0C4] focus:bg-white focus:border-[#E7E0C4] focus:outline-none focus:ring-1 focus:ring-[#E7E0C4] rounded-none focus:rounded-md text-xs text-slate-700 placeholder-slate-300 transition-all"
                    />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-6 duration-500 delay-300">
        <button className="flex items-center gap-2 px-8 py-3.5 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer font-bold text-sm tracking-wide">
          <Save className="w-5 h-5" />
          Lưu điểm
        </button>
      </div>

    </div>
  );
}
