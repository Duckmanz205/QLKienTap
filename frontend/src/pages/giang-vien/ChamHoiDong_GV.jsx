import React, { useState, useEffect } from 'react';
import { 
  Users, MapPin, Calendar, Clock, ChevronRight, CheckCircle2, Save, ArrowRight
} from 'lucide-react';
import { giangVienApi } from '../../services/api';

export default function ChamHoiDong_GV() {
  const [activeTab, setActiveTab] = useState('danh_sach'); // 'danh_sach' or 'cham_diem'
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // When a session is selected, we group its registrations by student
  const [students, setStudents] = useState([]);
  const [studentReports, setStudentReports] = useState([]);

  // Scores map: { [phieuId]: score }
  const [scores, setScores] = useState({});

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      fetchSessions(user.id);
    }
  }, []);

  const fetchSessions = async (accountId) => {
    try {
      setLoading(true);
      const profileRes = await giangVienApi.getProfile(accountId);
      const lecturerId = profileRes.data.id;
      
      const res = await giangVienApi.getBoardSessions(lecturerId);
      
      const mappedSessions = (res.data || []).map(item => {
        const hd = item.session;
        // count unique students
        const studentSet = new Set(item.registrations.map(r => r.sinhVien?.id));
        
        return {
          id: hd.id,
          tenHoiDong: hd.ten_hoi_dong,
          ngayGio: `${new Date(hd.ngay_bao_cao || Date.now()).toLocaleDateString('vi-VN')} - ${hd.gio_bao_cao?.slice(0,5) || '08:00'}`,
          diaDiem: hd.dia_diem,
          soSv: studentSet.size,
          trangThai: getStatusFromDate(hd.ngay_bao_cao),
          raw: item // Keep raw data for grading
        };
      });
      
      setSessions(mappedSessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromDate = (dateString) => {
    if (!dateString) return 'Sắp diễn ra';
    const date = new Date(dateString);
    const today = new Date();
    date.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (date < today) return 'Đã hoàn thành';
    if (date > today) return 'Sắp diễn ra';
    return 'Đang diễn ra';
  };

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

  const handleEnterGrading = (sessionObj) => {
    setSelectedSessionId(sessionObj.id);
    
    const item = sessionObj.raw;
    const regs = item.registrations || [];
    
    // Group by student
    const studentMap = new Map();
    regs.forEach(reg => {
      const sv = reg.sinhVien;
      if (!sv) return;
      if (!studentMap.has(sv.id)) {
        studentMap.set(sv.id, {
          id: sv.id,
          mssv: sv.mssv,
          name: sv.ho_ten,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sv.ho_ten || 'SV')}&background=f1f5f9&color=475569`,
          reports: []
        });
      }
      studentMap.get(sv.id).reports.push({
        id: reg.id,
        nhaMay: reg.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi',
        hinhThuc: reg.chuyenThamQuan?.hinh_thuc === 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp',
        score: '', // we don't have individual member's past score easily in this API unless it's in diemHoiDong array
        committee: [
          // mock committee members for UI since the API doesn't return other members' scores here
          { id: 1, name: 'Tôi', avatar: 'https://ui-avatars.com/api/?name=Toi&background=89B449&color=fff', status: 'Chưa chấm' }
        ],
        memberId: item.memberId // the member id of the current lecturer
      });
    });
    
    const studentsArray = Array.from(studentMap.values()).map(st => {
      return {
        ...st,
        status: 'pending' // 'graded' if all reports are scored
      };
    });
    
    setStudents(studentsArray);
    if (studentsArray.length > 0) {
      handleSelectStudent(studentsArray[0], studentsArray);
    }
    
    setActiveTab('cham_diem');
  };

  const handleSelectStudent = (student, allStudents = students) => {
    setSelectedStudentId(student.id);
    setStudentReports(student.reports);
    
    // Init scores state for this student
    const newScores = { ...scores };
    student.reports.forEach(r => {
      if (newScores[r.id] === undefined) {
        newScores[r.id] = r.score || '';
      }
    });
    setScores(newScores);
  };

  const handleScoreChange = (phieuId, value) => {
    setScores(prev => ({ ...prev, [phieuId]: value }));
  };

  const handleSaveAndNext = async () => {
    try {
      setSaving(true);
      // Submit scores
      for (const rep of studentReports) {
        const score = scores[rep.id];
        if (score !== '' && score !== null) {
          await giangVienApi.submitBoardScore({
            memberId: rep.memberId,
            phieuId: rep.id,
            score: parseFloat(score)
          });
        }
      }
      
      alert('Đã lưu điểm thành công!');
      
      // Update student status to graded
      const updatedStudents = students.map(s => 
        s.id === selectedStudentId ? { ...s, status: 'graded' } : s
      );
      setStudents(updatedStudents);
      
      // Go to next student if available
      const currentIndex = updatedStudents.findIndex(s => s.id === selectedStudentId);
      if (currentIndex < updatedStudents.length - 1) {
        handleSelectStudent(updatedStudents[currentIndex + 1], updatedStudents);
      }
      
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu điểm');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const activeStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300">
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Buổi báo cáo TQNM</h1>
        
        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-[#E7E0C4] p-1">
          <button 
            onClick={() => setActiveTab('danh_sach')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
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
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">Đang tải dữ liệu...</td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-medium italic">Không có buổi báo cáo nào.</td>
                  </tr>
                ) : (
                  sessions.map(session => (
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
                          onClick={() => handleEnterGrading(session)}
                          className="text-xs font-bold text-[#407F3E] hover:text-[#89B449] hover:underline transition-colors cursor-pointer flex items-center justify-end gap-1"
                        >
                          Vào chấm điểm <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
              <span className="text-xs font-bold text-slate-500">{students.findIndex(s => s.id === selectedStudentId) + 1} / {students.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {students.map(std => (
                <div 
                  key={std.id}
                  onClick={() => handleSelectStudent(std)}
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
                  Đang chấm: <span className="font-bold text-[#407F3E]">{activeStudent?.name || '---'}</span>
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
              
              {studentReports.map(rep => (
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
                            <div className={`w-1.5 h-1.5 rounded-full ${scores[rep.id] !== '' ? 'bg-[#89B449]' : 'bg-slate-300'}`}></div>
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
                        type="number" min="0" max="10" step="0.1" 
                        value={scores[rep.id] || ''}
                        onChange={(e) => handleScoreChange(rep.id, e.target.value)}
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
              <span className="text-xs font-bold text-slate-500">Hãy lưu trước khi chuyển sang sinh viên khác.</span>
              <button 
                onClick={handleSaveAndNext}
                disabled={saving || studentReports.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lưu điểm & chuyển sinh viên tiếp theo <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
