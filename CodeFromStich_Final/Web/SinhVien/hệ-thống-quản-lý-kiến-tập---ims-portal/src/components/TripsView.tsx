import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Clock, 
  Laptop, 
  Users, 
  Trash2, 
  Check, 
  AlertTriangle,
  Info,
  Building,
  Plus
} from 'lucide-react';
import { Trip } from '../types';

interface TripsViewProps {
  trips: Trip[];
  availableTrips: Trip[];
  onRegisterTrip: (trip: Trip) => void;
  onCancelRegistration: (tripId: string) => void;
  onAddDestinationProposal: (proposal: any) => void;
}

export default function TripsView({ 
  trips, 
  availableTrips, 
  onRegisterTrip, 
  onCancelRegistration,
  onAddDestinationProposal
}: TripsViewProps) {
  const [subTab, setSubTab] = useState<'available' | 'registered'>('available');
  const [showProposalModal, setShowProposalModal] = useState(false);
  
  // Proposal Form State
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'Trực tiếp' | 'Trực tuyến'>('Trực tiếp');
  const [contactInfo, setContactInfo] = useState('');

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !address || !reason) {
      alert('Vui lòng điền các trường bắt buộc (*)');
      return;
    }
    onAddDestinationProposal({ companyName, address, reason, type, contactInfo });
    // Reset Form
    setCompanyName('');
    setAddress('');
    setReason('');
    setType('Trực tiếp');
    setContactInfo('');
    setShowProposalModal(false);
    alert('Đề xuất điểm đến thành công! Ban cố vấn sẽ xem xét trong 3-5 ngày làm việc.');
  };

  return (
    <div className="space-y-6">
      {/* Title Header with Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Chuyến tham quan</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Đăng ký tham gia các chuyến kiến tập bổ ích hoặc xem lịch sử các hoạt động kiến tập của bạn.</p>
        </div>
        <button 
          onClick={() => setShowProposalModal(true)}
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs tracking-wider uppercase shadow-md hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Đề xuất điểm đến</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-surface-muted/60 relative z-10">
        <button 
          onClick={() => setSubTab('available')}
          className={`relative pb-3 font-bold text-md transition-colors cursor-pointer ${
            subTab === 'available' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Có thể đăng ký</span>
          {subTab === 'available' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
          )}
        </button>
        <button 
          onClick={() => setSubTab('registered')}
          className={`relative pb-3 font-bold text-md transition-colors cursor-pointer ${
            subTab === 'registered' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Đã đăng ký</span>
          {subTab === 'registered' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Available Trips Tab */}
      {subTab === 'available' && (
        <div className="relative z-10 animate-fade-in">
          {availableTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-outline-variant p-12 text-center max-w-lg mx-auto mt-6">
              <Compass className="w-16 h-16 text-outline/40 mx-auto mb-4" />
              <p className="text-lg font-bold text-on-surface">Không còn chuyến đi nào khả dụng</p>
              <p className="text-sm text-on-surface-variant mt-2">Bạn đã đăng ký hết tất cả các chuyến đi hiện đang mở đăng ký.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTrips.map((trip) => {
                const isOnline = trip.type === 'Trực tuyến';
                const isAlmostFull = trip.slotsRemaining !== null && trip.slotsRemaining <= 5 && trip.slotsRemaining > 0;
                const isFull = trip.slotsRemaining === 0;

                return (
                  <div 
                    key={trip.id} 
                    className="bg-white rounded-2xl border border-surface-muted/40 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                      <img 
                        src={trip.image} 
                        alt={trip.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                          isOnline ? 'bg-blue-600 text-white' : 'bg-secondary text-white'
                        }`}>
                          {isOnline ? <Laptop className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                          <span>{trip.type}</span>
                        </span>
                        {isAlmostFull && (
                          <span className="px-3 py-1 bg-warning-yellow text-on-surface rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Sắp đầy</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-[#89b449] font-bold text-[10px] uppercase tracking-widest block mb-1">
                        {trip.category}
                      </span>
                      <h3 className="font-black text-base text-on-surface mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                        {trip.title}
                      </h3>

                      <div className="space-y-2 text-xs text-on-surface-variant font-semibold mb-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-outline" />
                          <span>{trip.date} | {trip.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-outline shrink-0" />
                          <span className="truncate">{trip.venue}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-surface-container flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <Users className="w-4.5 h-4.5 text-primary" />
                          <span className="text-xs font-bold">
                            {isFull ? (
                              <span className="text-[#ba1a1a]">Hết chỗ</span>
                            ) : trip.slotsRemaining === 9999 ? (
                              'Không giới hạn'
                            ) : (
                              `Còn ${trip.slotsRemaining} chỗ`
                            )}
                          </span>
                        </div>
                        <span className="text-[11px] text-outline font-bold bg-[#f2f5ec] px-2.5 py-1 rounded-md">
                          + {trip.participantsCount} tham gia
                        </span>
                      </div>

                      <button
                        disabled={isFull}
                        onClick={() => onRegisterTrip(trip)}
                        className={`w-full mt-6 py-3 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isFull 
                            ? 'bg-gray-100 text-outline/50 cursor-not-allowed border border-gray-200'
                            : 'bg-primary-container text-on-primary-container hover:bg-primary shadow-sm active:scale-98'
                        }`}
                      >
                        <Compass className="w-4.5 h-4.5" />
                        <span>Đăng ký ngay</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Registered Trips Tab */}
      {subTab === 'registered' && (
        <div className="bg-white rounded-2xl border border-surface-muted/40 shadow-sm overflow-hidden animate-fade-in relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#f8faf1] text-on-surface-variant font-bold text-xs uppercase tracking-wider border-b border-surface-container-high">
                  <th className="py-4 px-6">Nhà máy</th>
                  <th className="py-4 px-6">Ngày tham quan</th>
                  <th className="py-4 px-6">Hình thức</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold divide-y divide-surface-container/50">
                {trips.map((trip) => {
                  const isOnline = trip.type === 'Trực tuyến';
                  
                  // Status Styles
                  let badgeClass = '';
                  if (trip.status === 'Hợp lệ') badgeClass = 'bg-primary/10 text-primary border border-primary/20';
                  else if (trip.status === 'Hoàn thành') badgeClass = 'bg-secondary-container/40 text-[#446900] border border-secondary-container/60';
                  else if (trip.status === 'Chờ duyệt') badgeClass = 'bg-warning-yellow/15 text-yellow-700 border border-warning-yellow/40';
                  else badgeClass = 'bg-red-50 text-red-700 border border-red-200';

                  const canCancel = trip.status === 'Hợp lệ' || trip.status === 'Chờ duyệt';

                  return (
                    <tr key={trip.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f2f5ec] flex items-center justify-center text-primary shrink-0 shadow-inner">
                            <Building className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{trip.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant font-medium">{trip.date}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isOnline ? 'bg-blue-50 text-blue-700' : 'bg-[#c0ef7c]/20 text-[#476d01]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-blue-600' : 'bg-[#476d01]'}`}></span>
                          {trip.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
                          {trip.status === 'Hoàn thành' && <Check className="w-3.5 h-3.5 mr-0.5" />}
                          <span>{trip.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {canCancel ? (
                          <button
                            onClick={() => onCancelRegistration(trip.id)}
                            className="text-red-500 hover:text-red-700 hover:underline inline-flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hủy đăng ký</span>
                          </button>
                        ) : (
                          <span className="text-outline/40 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suggest Destination Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-surface-container animate-scale-up">
            <div className="p-6 bg-primary-container text-on-primary-container flex justify-between items-center">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Compass className="w-5 h-5 text-white" />
                <span>Đề xuất điểm đến kiến tập</span>
              </h3>
              <button 
                onClick={() => setShowProposalModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProposalSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Tên Doanh nghiệp / Nhà máy <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ví dụ: Công ty Vinamilk, Nhà máy Intel..."
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-muted/60 rounded-xl text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                    Hình thức tham quan
                  </label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-muted/60 rounded-xl text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="Trực tiếp">Trực tiếp (Offline)</option>
                    <option value="Trực tuyến">Trực tuyến (Online)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                    Thông tin liên hệ (Nếu có)
                  </label>
                  <input 
                    type="text" 
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="SĐT, Email, Người liên hệ..."
                    className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-muted/60 rounded-xl text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Địa chỉ doanh nghiệp <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Địa chỉ chi tiết của nhà máy, văn phòng..."
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-muted/60 rounded-xl text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Lý do đề xuất kiến tập <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Lợi ích học thuật, ngành học tương thích, quy mô doanh nghiệp..."
                  className="w-full px-4 py-2.5 bg-[#f8faf1] border border-surface-muted/60 rounded-xl text-sm focus:border-primary focus:outline-none resize-none"
                  required
                ></textarea>
              </div>

              <div className="pt-4 border-t border-surface-container flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-[#ecefe6] rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-container shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Gửi đề xuất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
