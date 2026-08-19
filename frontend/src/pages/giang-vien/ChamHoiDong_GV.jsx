import React, { useState } from 'react';
import { 
  Users, MapPin, Calendar, Clock, ChevronRight, CheckCircle2, Save, ArrowRight
} from 'lucide-react';

export default function ChamHoiDong_GV() {
  const [activeTab, setActiveTab] = useState('danh_sach'); // 'danh_sach' or 'cham_diem'
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(1);

  // Mock Sessions
  const sessions = [
    {
      id: 1,
      tenHoiDong: 'Hội đồng Báo cáo TQNM - Nhóm 1',
      ngayGio: '25/09/2026 - 08:00',
      diaDiem: 'Phòng B.301',
      soSv: 15,
      trangThai: 'Đang diễn ra' // Secondary green
    },
    {
      id: 2,
      tenHoiDong: 'Hội đồng Báo cáo TQNM - Nhóm 2',
      ngayGio: '26/09/2026 - 13:00',
      diaDiem: 'Phòng B.302',
      soSv: 20,
      trangThai: 'Sắp diễn ra' // Warning yellow
    },
    {
      id: 3,
      tenHoiDong: 'Hội đồng Báo cáo TQNM - Nhóm 3',
      ngayGio: '20/09/2026 - 08:00',
      diaDiem: 'Phòng C.105',
      soSv: 18,
      trangThai: 'Đã hoàn thành' // Muted gray
    }
  ];

  // Mock Students for Grading Tab
  const students = [
    { id: 1, mssv: '2022220001', name: 'Nguyễn Văn An', status: 'graded', avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=f1f5f9&color=475569' },
    { id: 2, mssv: '2022220002', name: 'Trần Thị Bình', status: 'pending', avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Binh&background=f1f5f9&color=475569' },
    { id: 3, mssv: '2022220003', name: 'Lê Hoàng Cường', status: 'pending', avatar: 'https://ui-avatars.com/api/?name=Le+Hoang+Cuong&background=f1f5f9&color=475569' },
    { id: 4, mssv: '2022220004', name: 'Phạm Duy Khang', status: 'pending', avatar: 'https://ui-avatars.com/api/?name=Pham+Duy+Khang&background=f1f5f9&color=475569' },
  ];

  // Mock Reports for the selected student
  const mockReports = [
    {
      id: 101,
      nhaMay: 'Nhà máy Yakult HCM',
      hinhThuc: 'Trực tiếp',
      score: '8.5',
      committee: [
        { id: 1, name: 'GV1', avatar: 'https://ui-avatars.com/api/?name=Thanh+Tam&background=89B449&color=fff', status: 'Đã chấm' },
        { id: 2, name: 'GV2', avatar: 'https://ui-avatars.com/api/?name=Hoang+Nam&background=e2e8f0&color=64748b', status: 'Chưa chấm' },
      ]
    },
    {
      id: 102,
      nhaMay: 'Acecook Việt Nam',
      hinhThuc: 'Trực tuyến',
      score: '',
      committee: [
        { id: 1, name: 'GV1', avatar: 'https://ui-avatars.com/api/?name=Thanh+Tam&background=89B449&color=fff', status: 'Đã chấm' },
        { id: 2, name: 'GV2', avatar: 'https://ui-avatars.com/api/?name=Hoang+Nam&background=e2e8f0&color=64748b', status: 'Chưa chấm' },
      ]
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Sắp diễn ra':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#DBD468] text-slate-800 shadow-sm">{status}</span>;
      case 'Đang diễn ra':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#89B449] text-white shadow-sm">{status}</span>;
      case 'Đã hoàn thành':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">{status}</span>;
      default:
        return null;
    }
  };

  const handleEnterGrading = (id) => {
    setSelectedSessionId(id);
    setActiveTab('cham_diem');
  };

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Buổi báo cáo TQNM</h1>
        
        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-[#E7E0C4] p-1">
          <button 
            onClick={() => setActiveTab('danh_sach')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'danh_sach' ? 'bg-[#89B449]/10 text-[#407F3E] border-b-2 border-[#89B449]' : 'text-slate-500 hover:bg-slate-50 border-b-2 border-transparent'
            }`}
          >
            Danh sách buổi
          </button>
          <button 
            onClick={() => setActiveTab('cham_diem')}
            disabled={!selectedSessionId}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'cham_diem' ? 'bg-[#89B449]/10 text-[#407F3E] border-b-2 border-[#89B449]' : 'text-slate-500 hover:bg-slate-50 border-b-2 border-transparent disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            Chấm điểm
          </button>
        </div>
      </div>

      {activeTab === 'danh_sach' && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E7E0C4] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E7E0C4] text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-[#E7E0C4]">
                  <th className="p-4 pl-6 min-w-[250px]">Tên hội đồng</th>
                  <th className="p-4 min-w-[150px]">Ngày giờ</th>
                  <th className="p-4 min-w-[120px]">Địa điểm</th>
                  <th className="p-4 text-center min-w-[150px]">Số SV báo cáo</th>
                  <th className="p-4 text-center min-w-[120px]">Trạng thái</th>
                  <th className="p-4 pr-6 text-right min-w-[120px]">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700 divide-y divide-[#E7E0C4]/50">
                {sessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800">{session.tenHoiDong}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {session.ngayGio.split(' - ')[0]}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1"><Clock className="w-3.5 h-3.5" /> {session.ngayGio.split(' - ')[1]}</div>
                    </td>
                    <td className="p-4 font-bold text-[#407F3E]">
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {session.diaDiem}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E7E0C4]/50 text-slate-700 font-bold">
                        {session.soSv}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(session.trangThai)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={() => handleEnterGrading(session.id)}
                        className="text-xs font-bold text-[#407F3E] hover:text-[#89B449] hover:underline transition-colors cursor-pointer flex items-center justify-end gap-1"
                      >
                        Vào chấm điểm <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cham_diem' && (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] animate-in slide-in-from-right-4 duration-300">
          
          {/* Left Column: Student List */}
          <div className="w-full lg:w-[320px] bg-white rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-[#E7E0C4] bg-[#E7E0C4]/30 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Users className="w-4 h-4 text-[#407F3E]" /> Sinh viên báo cáo</h3>
              <span className="text-xs font-bold text-slate-500">1 / 15</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {students.map(std => (
                <div 
                  key={std.id}
                  onClick={() => setSelectedStudentId(std.id)}
                  className={`p-4 border-b border-[#E7E0C4]/50 flex items-center gap-3 cursor-pointer transition-colors ${
                    selectedStudentId === std.id ? 'bg-[#407F3E]/5 border-l-4 border-l-[#407F3E]' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <img src={std.avatar} alt="avt" className="w-10 h-10 rounded-full border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${selectedStudentId === std.id ? 'text-[#407F3E]' : 'text-slate-800'}`}>{std.name}</p>
                    <p className="text-[11px] font-medium text-slate-500">{std.mssv}</p>
                  </div>
                  {/* Progress Dot */}
                  <div className="shrink-0 flex items-center justify-center">
                    {std.status === 'graded' ? (
                      <div className="w-5 h-5 rounded-full bg-[#89B449]/20 flex items-center justify-center" title="Đã chấm xong">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#89B449]" />
                      </div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#DBD468] animate-pulse" title="Chưa chấm"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Area: Grading Panel */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E7E0C4] flex flex-col relative overflow-hidden">
            
            {/* Header info */}
            <div className="p-6 border-b border-[#E7E0C4] bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-800">Đánh giá Báo cáo TQNM</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Đang chấm: <span className="font-bold text-[#407F3E]">Nguyễn Văn An</span>
                </p>
              </div>
              <div className="px-4 py-2 bg-[#E7E0C4]/40 border border-[#E7E0C4] rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Điểm hội đồng (Trung bình)</span>
                <span className="text-2xl font-black text-[#407F3E] leading-none">--</span>
                <span className="text-sm font-bold text-slate-400"> /10</span>
              </div>
            </div>

            {/* Scrollable Factory Cards */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              
              {mockReports.map(rep => (
                <div key={rep.id} className="bg-white border border-[#E7E0C4] rounded-xl shadow-sm overflow-hidden flex flex-col xl:flex-row">
                  
                  {/* Info Column */}
                  <div className="p-5 xl:w-[40%] bg-[#fdfcf8] border-b xl:border-b-0 xl:border-r border-[#E7E0C4]">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-slate-800 text-base">{rep.nhaMay}</h4>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 mb-6">
                      Hình thức: {rep.hinhThuc}
                    </span>
                    
                    {/* Committee member statuses */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tiến độ hội đồng</p>
                      <div className="flex flex-wrap gap-2">
                        {rep.committee.map(member => (
                          <div key={member.id} className="flex items-center gap-1.5 bg-white border border-[#E7E0C4] px-2 py-1 rounded-md shadow-sm">
                            <img src={member.avatar} alt="avt" className="w-5 h-5 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-600">{member.name}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Đã chấm' ? 'bg-[#89B449]' : 'bg-slate-300'}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Grading Input Column */}
                  <div className="p-6 xl:w-[60%] flex flex-col justify-center">
                    <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                      Điểm báo cáo TQNM (Của bạn) <span className="text-[#E68A8C]">*</span>
                    </label>
                    <div className="relative max-w-[200px]">
                      <input 
                        type="number" min="0" max="10" step="0.1" defaultValue={rep.score}
                        placeholder="--"
                        className="w-full pl-6 pr-12 py-4 bg-white border border-[#E7E0C4] rounded-xl text-2xl focus:outline-none focus:border-[#407F3E] focus:ring-2 focus:ring-[#407F3E]/20 font-black text-[#407F3E] transition-all text-center shadow-inner"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">/10</span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 mt-3">Nhập điểm đánh giá bài thuyết trình và mức độ am hiểu thực tế của sinh viên tại nhà máy này.</p>
                  </div>

                </div>
              ))}

            </div>

            {/* Bottom Panel */}
            <div className="p-4 border-t border-[#E7E0C4] bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-500">Chưa lưu thay đổi.</span>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
                Lưu điểm & chuyển sinh viên tiếp theo <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
