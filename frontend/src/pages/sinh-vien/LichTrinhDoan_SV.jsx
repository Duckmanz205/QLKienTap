import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Compass, 
  User, 
  Phone, 
  MessageSquare, 
  Truck, 
  Star, 
  Search, 
  RotateCw,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  Map
} from 'lucide-react';
import { sinhVienApi, giangVienApi } from '../../services/api';

export default function LichTrinhDoan_SV() {
  const [student, setStudent] = useState(null);
  const [registeredTrips, setRegisteredTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock schedule data for trips to ensure rich content
  const mockSchedules = {
    default: {
      vehicle: 'Xe 45 chỗ - HUIT Trans',
      lecturer: {
        name: 'ThS. Nguyễn Hoàng Anh',
        department: 'Khoa Công nghệ thực phẩm',
        phone: '0903.456.789',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60'
      },
      route: [
        { time: '07:30', title: 'Tập trung tại cổng số 1 HUIT', location: '140 Lê Trọng Tấn, Tân Phú, TP.HCM', details: ['Điểm danh sinh viên', 'Kiểm tra trang phục (Áo thun đồng phục HUIT, giày thể thao)', 'Phát nước uống và thẻ sinh viên kiến tập'], isHighlight: false },
        { time: '08:00', title: 'Đoàn bắt đầu di chuyển', location: 'Hành trình xe buýt đoàn', details: ['Di chuyển bằng xe du lịch 45 chỗ chất lượng cao', 'Sinh viên nghe phổ biến nội quy an toàn tại doanh nghiệp'], isHighlight: false },
        { time: '09:00', title: 'Đến địa điểm tham quan & Đón tiếp', location: 'Cổng đón tiếp của doanh nghiệp', details: ['Chụp ảnh tập thể lưu niệm trước sảnh chính', 'Đại diện doanh nghiệp tiếp nhận đoàn'], isHighlight: true },
        { time: '09:30', title: 'Phổ biến quy trình & Tham quan dây chuyền', location: 'Phòng sản xuất chính', details: ['Tham quan khu vực vận hành máy móc hiện đại', 'Trực tiếp quan sát quy trình đóng gói sản phẩm khép kín'], isHighlight: true },
        { time: '11:00', title: 'Giao lưu hỏi đáp cùng Ban Giám đốc', location: 'Hội trường Tầng 3', details: ['Đại diện HR giới thiệu cơ hội việc làm & thực tập', 'Hỏi đáp kỹ thuật chuyên ngành và kỹ năng mềm'], isHighlight: false },
        { time: '11:45', title: 'Kết thúc chuyến đi, lên xe về lại trường', location: 'Khu vực bãi đậu xe', details: ['Điểm danh quân số trước khi xe xuất phát', 'Thu lại thẻ kiến tập'], isHighlight: false }
      ]
    }
  };

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      sinhVienApi.getProfile(user.id).then(res => {
        setStudent(res.data);
        fetchData(res.data.id);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, []);

  const fetchData = async (svId) => {
    try {
      const regRes = await sinhVienApi.getRegisteredTrips(svId);
      const validTrips = regRes.data.filter(t => t.trang_thai === 'HopLe' || t.trang_thai === 'DaThamGia' || t.trang_thai === 'HoanThanh');
      setRegisteredTrips(validTrips);
      
      if (validTrips.length > 0) {
        setSelectedTripId(validTrips[0].chuyenThamQuan.id);
        fetchParticipants(validTrips[0].chuyenThamQuan.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchParticipants = async (tripId) => {
    try {
      setLoading(true);
      const res = await giangVienApi.getTripRegistrations(tripId);
      
      // Map to UI representation
      const list = res.data.map((r, index) => ({
        id: r.sinhVien.id.toString(),
        name: r.sinhVien.ho_ten,
        studentId: r.sinhVien.mssv,
        isLeader: index === 0, // Mock first student as leader
        hasMedicalNotes: index % 7 === 4, // Mock some medical notes
        medicalNotes: index % 7 === 4 ? 'Dị ứng hạt bụi công nghiệp, say xe' : '',
        checkedIn: r.trang_thai === 'DaThamGia' || r.trang_thai === 'HoanThanh'
      }));
      setStudents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTripChange = (e) => {
    const tripId = e.target.value;
    setSelectedTripId(tripId);
    if (tripId) {
      fetchParticipants(tripId);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
  };

  // Find selected trip details
  const activeTripObj = registeredTrips.find(t => t.chuyenThamQuan.id.toString() === selectedTripId.toString())?.chuyenThamQuan;

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.studentId.includes(searchTerm);
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'leader' ? s.isLeader :
      filterType === 'medical' ? s.hasMedicalNotes : true;
    
    return matchesSearch && matchesFilter;
  });

  const checkedInCount = students.filter(s => s.checkedIn).length;

  if (registeredTrips.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-outline-variant p-12 text-center max-w-lg mx-auto mt-6">
        <Compass className="w-16 h-16 text-outline/40 mx-auto mb-4" />
        <p className="text-lg font-bold text-on-surface">Không tìm thấy lịch trình</p>
        <p className="text-sm text-on-surface-variant mt-2">Bạn cần đăng ký chuyến đi và hoàn thành thanh toán để có lịch trình đoàn kiến tập.</p>
      </div>
    );
  }

  const scheduleInfo = mockSchedules.default;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dropdown Trip Selector */}
      <div className="flex items-center gap-4 bg-white rounded-2xl p-3 max-w-md shadow-sm border border-surface-muted/50 relative z-10 group transition-all hover:shadow-md">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#f2f5ec] flex items-center justify-center text-primary shadow-inner">
          <Truck className="w-5 h-5" />
        </div>
        <div className="flex-1 flex flex-col justify-center pr-4">
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-0.5">
            Chọn chuyến tham quan
          </span>
          <select 
            value={selectedTripId}
            onChange={handleTripChange}
            className="bg-transparent text-sm font-bold text-on-surface outline-none cursor-pointer w-full pr-4 appearance-none"
          >
            {registeredTrips.map((t) => (
              <option key={t.chuyenThamQuan.id} value={t.chuyenThamQuan.id}>
                {t.chuyenThamQuan.nhaMay?.ten_nha_may} - {new Date(t.chuyenThamQuan.ngay_tham_quan).toLocaleDateString('vi-VN')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeTripObj && (
        <div className="bg-white rounded-3xl border border-surface-muted/40 shadow-sm overflow-hidden relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between p-6 md:p-8 gap-8 items-center">
            
            {/* Trip Main Information */}
            <div className="flex flex-col gap-4 max-w-2xl w-full">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{activeTripObj.hinh_thuc === 'TrucTiep' ? 'Trực tiếp' : 'Trực tuyến'}</span>
                </span>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{activeTripObj.cach_to_chuc === 'DoKhoaToChuc' ? 'Khoa tổ chức' : 'Tự do'}</span>
                </span>
              </div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
                  {activeTripObj.nhaMay?.ten_nha_may}
                </h1>
                <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 mt-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{activeTripObj.nhaMay?.dia_chi}</span>
                </p>
              </div>

              {/* Overview Details Cards Grid */}
              <div className="flex flex-wrap gap-4 mt-2 p-4 bg-[#f8faf1] rounded-2xl border-l-4 border-primary shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#e5ffdc] flex items-center justify-center text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider leading-none">Ngày đi</div>
                    <div className="text-xs font-black text-on-surface mt-1">
                      {new Date(activeTripObj.ngay_tham_quan).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="w-px h-8 bg-surface-muted hidden sm:block"></div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider leading-none">Thời gian</div>
                    <div className="text-xs font-black text-on-surface mt-1">
                      {activeTripObj.gio_bat_dau.slice(0, 5)} - {activeTripObj.gio_ket_thuc.slice(0, 5)}
                    </div>
                  </div>
                </div>
                <div className="w-px h-8 bg-surface-muted hidden sm:block"></div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider leading-none">Phương tiện</div>
                    <div className="text-xs font-black text-on-surface mt-1 truncate max-w-[150px]">
                      {scheduleInfo.vehicle}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lecturer Teacher Profile Card */}
            <div className="bg-[#f8faf1]/80 p-5 rounded-2xl border border-surface-muted/30 shadow-sm min-w-[280px] w-full md:w-auto flex flex-col gap-4">
              <div className="text-[10px] font-black text-on-surface-variant tracking-wider flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Giảng viên dẫn đoàn
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={scheduleInfo.lecturer.avatar} 
                    alt={scheduleInfo.lecturer.name} 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary ring-offset-2"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-secondary text-white w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center shadow-md">
                    <Star className="w-2.5 h-2.5 fill-white text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-black text-on-surface">
                    {scheduleInfo.lecturer.name}
                  </div>
                  <div className="text-xs text-on-surface-variant font-semibold">
                    {scheduleInfo.lecturer.department}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <a 
                  href={`tel:${scheduleInfo.lecturer.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-[#ecefe6] border border-surface-muted rounded-xl text-on-surface text-xs font-bold transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{scheduleInfo.lecturer.phone}</span>
                </a>
                <button 
                  onClick={() => alert(`Bắt đầu trò chuyện với giảng viên ${scheduleInfo.lecturer.name}`)}
                  className="flex items-center justify-center w-9 h-9 bg-[#e5ffdc] hover:bg-primary hover:text-white rounded-xl text-primary transition-all cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-muted/40 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                <span>Lộ trình chi tiết</span>
              </h2>
              <span className="text-[10px] font-black bg-[#f2f5ec] text-[#476d01] px-3 py-1 rounded-full uppercase tracking-wider">
                {scheduleInfo.route.length} hoạt động
              </span>
            </div>

            <div className="relative pl-6 space-y-8 before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-[#ecefe6]">
              {scheduleInfo.route.map((item, index) => (
                <div key={index} className="relative group">
                  {item.isHighlight ? (
                    <div className="absolute -left-[27px] w-6 h-6 bg-primary rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 animate-pulse">
                      <Star className="w-2.5 h-2.5 fill-white text-white" />
                    </div>
                  ) : (
                    <div className="absolute -left-[25px] w-5 h-5 bg-white rounded-full border-4 border-[#c0c9bb] group-hover:border-primary transition-colors flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-start">
                    <div className="w-14 flex-shrink-0 text-xs font-black text-on-surface-variant mt-1">
                      {item.time}
                    </div>
                    <div className={`flex-1 rounded-2xl p-4 shadow-sm border transition-all ${
                      item.isHighlight 
                        ? 'bg-primary/5 border-primary/25' 
                        : 'bg-[#f8faf1]/50 border-surface-muted/30 hover:shadow-md'
                    }`}>
                      <h3 className="font-black text-sm text-on-surface mb-1">
                        {item.title}
                      </h3>
                      {item.location && (
                        <p className="text-xs text-on-surface-variant font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary/60" />
                          <span>{item.location}</span>
                        </p>
                      )}
                      {item.details && item.details.length > 0 && (
                        <ul className="text-xs text-on-surface-variant space-y-1.5 pl-4 list-disc marker:text-primary/40 mt-3 font-semibold">
                          {item.details.map((detail, dIndex) => (
                            <li key={dIndex}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Display Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-surface-muted/40 p-5 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
              <Map className="w-4.5 h-4.5 text-primary" />
              <span>Bản đồ hành trình</span>
            </h3>
            <div className="h-44 rounded-xl overflow-hidden relative group shadow-inner border border-surface-container">
              <div 
                className="w-full h-full bg-cover bg-center transition-all duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop&q=60')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none flex items-end p-4">
                <span className="text-white text-xs font-bold tracking-wide flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#89b449]" />
                  <span>KCN VSIP 1, Bình Dương</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance List */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-muted/40 p-6 h-full flex flex-col">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <span>Danh sách đoàn sinh viên</span>
                </h2>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Lớp danh sách thành viên chuyến kiến tập
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên, MSSV..."
                    className="pl-9 pr-4 py-1.5 bg-[#f8faf1] border border-surface-muted rounded-xl text-xs w-full focus:outline-none focus:border-primary font-medium"
                  />
                </div>
                <button 
                  onClick={handleResetFilters}
                  className="p-1.5 bg-[#f8faf1] border border-surface-muted rounded-xl text-on-surface-variant hover:text-primary hover:bg-[#ecefe6] transition-colors cursor-pointer"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCw className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Filter Toggle Buttons */}
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  filterType === 'all' 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-[#f2f5ec]/70 text-on-surface-variant hover:bg-[#f2f5ec]'
                }`}
              >
                Tất cả ({students.length})
              </button>
              <button 
                onClick={() => setFilterType('leader')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  filterType === 'leader' 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-[#f2f5ec]/70 text-on-surface-variant hover:bg-[#f2f5ec]'
                }`}
              >
                Trưởng nhóm ({students.filter(s => s.isLeader).length})
              </button>
              <button 
                onClick={() => setFilterType('medical')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  filterType === 'medical' 
                    ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' 
                    : 'bg-[#f2f5ec]/70 text-on-surface-variant hover:bg-[#f2f5ec]'
                }`}
              >
                Lưu ý y tế ({students.filter(s => s.hasMedicalNotes).length})
              </button>
            </div>

            {/* Students List */}
            {loading ? (
              <div className="text-center py-12 text-on-surface-variant text-sm font-semibold">Đang tải danh sách...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1 max-h-[450px]">
                {filteredStudents.map((s) => (
                  <div 
                    key={s.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 group ${
                      s.checkedIn 
                        ? 'bg-primary/5 border-primary/25' 
                        : 'bg-white border-surface-muted/50 hover:border-outline-variant hover:bg-[#f8faf1]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black text-sm flex items-center justify-center border border-primary/25 shadow-inner">
                        {s.name.split(' ').pop()?.[0]}
                      </div>
                      {s.isLeader && (
                        <div className="absolute -bottom-1 -right-1 bg-warning-yellow rounded-full w-4 h-4 border border-white flex items-center justify-center shadow-md">
                          <Star className="w-2.5 h-2.5 fill-on-surface text-on-surface" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-on-surface truncate group-hover:text-primary transition-colors">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-on-surface-variant font-bold mt-0.5">
                        {s.studentId}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {s.hasMedicalNotes && (
                        <div 
                          className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center cursor-pointer" 
                          title={s.medicalNotes}
                          onClick={() => alert(`Lưu ý y tế cho ${s.name}: ${s.medicalNotes}`)}
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shadow-inner transition-all ${
                        s.checkedIn 
                          ? 'bg-primary border-primary text-white' 
                          : 'border-outline-variant text-transparent bg-white group-hover:border-primary'
                      }`}>
                        <CheckCircle className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="col-span-full py-12 text-center text-on-surface-variant bg-[#f8faf1]/50 rounded-2xl border border-dashed border-outline-variant">
                    <HelpCircle className="w-10 h-10 text-outline mx-auto mb-2" />
                    <p className="font-bold text-sm">Không tìm thấy sinh viên</p>
                    <p className="text-xs text-outline mt-0.5">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc khác</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer Summary */}
            <div className="mt-6 pt-5 border-t border-surface-container flex flex-wrap gap-4 items-center justify-between text-xs text-on-surface-variant font-bold">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning-yellow shadow-inner"></span>
                  <span>Trưởng nhóm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] shadow-inner"></span>
                  <span>Lưu ý y tế</span>
                </div>
              </div>
              <div className="bg-[#e5ffdc] text-primary px-3 py-1 rounded-full border border-primary/20">
                Đã điểm danh: <span className="font-black">{checkedInCount}</span>/{students.length} sinh viên
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
