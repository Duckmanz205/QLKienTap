/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Registration, InternshipPlan, FactoryVisit, RegistrationStatus } from '../types';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertCircle, 
  AlertTriangle,
  FileText, 
  RefreshCw, 
  ShieldCheck,
  DollarSign
} from 'lucide-react';

interface RegistrationViewProps {
  registrations: Registration[];
  plans: InternshipPlan[];
  visits: FactoryVisit[];
  onUpdateStatus: (id: string, status: RegistrationStatus) => void;
  onUpdateFeeStatus: (id: string, status: 'unpaid' | 'pending' | 'verified') => void;
  onFreezeList: (visitId: string) => void;
}

export default function RegistrationView({
  registrations,
  plans,
  visits,
  onUpdateStatus,
  onUpdateFeeStatus,
  onFreezeList
}: RegistrationViewProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'proofs' | 'freeze'>('list');
  
  // Filtering states
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'All');
  const [selectedVisitId, setSelectedVisitId] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected registration for proof modal
  const [selectedProofReg, setSelectedProofReg] = useState<Registration | null>(null);

  // Status map helper
  const getStatusLabel = (status: RegistrationStatus) => {
    switch (status) {
      case 'pending': return { text: 'Chờ duyệt', cls: 'bg-indigo-50 text-indigo-700 border border-indigo-150' };
      case 'valid': return { text: 'Hợp lệ / Chấp thuận', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-150' };
      case 'rejected': return { text: 'Bị từ chối', cls: 'bg-rose-50 text-rose-700 border border-rose-150' };
      case 'cancelled_pending_approval': return { text: 'Chờ duyệt hủy', cls: 'bg-amber-50 text-amber-700 border border-amber-150 animate-pulse' };
      case 'cancelled': return { text: 'Đã hủy chuyến', cls: 'bg-slate-100 text-slate-500 border border-slate-200' };
      case 'attended': return { text: 'Đã tham gia', cls: 'bg-teal-50 text-teal-700 border border-teal-150' };
      case 'absent': return { text: 'Vắng mặt', cls: 'bg-red-50 text-red-700 border border-red-150' };
      case 'completed': return { text: 'Đạt kiến tập', cls: 'bg-blue-50 text-blue-700 border border-blue-150' };
      case 'failed': return { text: 'Không đạt', cls: 'bg-orange-50 text-orange-700 border border-orange-150' };
    }
  };

  // Filter logic
  const filteredRegs = registrations.filter(r => {
    const linkedVisit = visits.find(v => v.id === r.visitId);
    
    const matchesPlan = selectedPlanId === 'All' || (linkedVisit && linkedVisit.planId === selectedPlanId);
    const matchesVisit = selectedVisitId === 'All' || r.visitId === selectedVisitId;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.mssv.includes(searchQuery) ||
                          r.studentClass.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlan && matchesVisit && matchesStatus && matchesSearch;
  });

  // Pending cancellation proofs
  const pendingProofs = registrations.filter(r => r.status === 'cancelled_pending_approval');

  // Freeze Candidates (only visits of active plan)
  const freezeVisits = visits.filter(v => selectedPlanId === 'All' || v.planId === selectedPlanId);

  // Stats for the current filter
  const stats = {
    total: filteredRegs.length,
    valid: filteredRegs.filter(r => r.status === 'valid' || r.status === 'completed' || r.status === 'attended').length,
    pending: filteredRegs.filter(r => r.status === 'pending').length,
    cancelled: filteredRegs.filter(r => r.status === 'cancelled' || r.status === 'cancelled_pending_approval').length
  };

  const handleApproveProof = (regId: string) => {
    onUpdateStatus(regId, 'cancelled');
    // Mark fee status to verified/refunded or pending refund processing
    onUpdateFeeStatus(regId, 'pending'); 
    setSelectedProofReg(null);
    alert('Đã phê duyệt minh chứng hủy chuyến. Đơn hoàn lệ phí của sinh viên đã được đưa vào hàng đợi bồi hoàn!');
  };

  const handleRejectProof = (regId: string) => {
    onUpdateStatus(regId, 'valid'); // revert back to active registration
    setSelectedProofReg(null);
    alert('Đã từ chối minh chứng hủy. Trạng thái đăng ký của sinh viên được khôi phục về Hoạt động.');
  };

  const handleVerifyFee = (regId: string) => {
    onUpdateFeeStatus(regId, 'verified');
    alert('Đã xác minh và phê duyệt hoàn trả học phí thành công!');
  };

  const handleFreezeVisitAction = (vId: string) => {
    onFreezeList(vId);
    alert('Đã chốt danh sách chuyến đi này. Toàn bộ đăng ký chờ duyệt (Pending) được chuyển thành Hợp lệ (Valid), danh sách được khóa để bàn giao cho Giảng viên dẫn đoàn!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Đăng ký Kiến tập</h2>
          <p className="text-xs text-slate-500">Phê duyệt hồ sơ vắng mặt có minh chứng, duyệt hoàn lệ phí và xuất báo cáo chốt danh sách</p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="border-b border-slate-200 flex flex-wrap gap-1">
        <button 
          id="tab-reg-list"
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg ${
            activeTab === 'list' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          Danh sách đăng ký ({registrations.length})
        </button>
        <button 
          id="tab-reg-proofs"
          onClick={() => setActiveTab('proofs')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-2 ${
            activeTab === 'proofs' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          Duyệt minh chứng hủy
          {pendingProofs.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-bounce">
              {pendingProofs.length}
            </span>
          )}
        </button>
        <button 
          id="tab-reg-freeze"
          onClick={() => setActiveTab('freeze')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg ${
            activeTab === 'freeze' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          Lọc & Chốt danh sách chuyến
        </button>
      </div>

      {/* Content for List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
            <div className="text-center md:border-r border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tổng đăng ký</span>
              <h4 className="text-xl font-bold text-slate-800 mt-0.5">{stats.total}</h4>
            </div>
            <div className="text-center md:border-r border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Đăng ký Hợp lệ</span>
              <h4 className="text-xl font-bold text-emerald-600 mt-0.5">{stats.valid}</h4>
            </div>
            <div className="text-center md:border-r border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Hồ sơ chờ duyệt</span>
              <h4 className="text-xl font-bold text-indigo-600 mt-0.5">{stats.pending}</h4>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Hủy chuyến / Hủy chờ duyệt</span>
              <h4 className="text-xl font-bold text-slate-500 mt-0.5">{stats.cancelled}</h4>
            </div>
          </div>

          {/* Filters controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Plan filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Đợt Kiến tập:</label>
              <select 
                value={selectedPlanId} 
                onChange={(e) => {
                  setSelectedPlanId(e.target.value);
                  setSelectedVisitId('All');
                }}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All">Tất cả đợt</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Visit filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Chọn chuyến doanh nghiệp:</label>
              <select 
                value={selectedVisitId} 
                onChange={(e) => setSelectedVisitId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All">Tất cả chuyến</option>
                {visits
                  .filter(v => selectedPlanId === 'All' || v.planId === selectedPlanId)
                  .map(v => (
                    <option key={v.id} value={v.id}>{v.factoryName.split(' - ')[0]}</option>
                  ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Trạng thái hồ sơ:</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="valid">Hợp lệ / Chấp thuận</option>
                <option value="rejected">Bị từ chối</option>
                <option value="cancelled_pending_approval">Chờ duyệt hủy</option>
                <option value="cancelled">Đã hủy chuyến</option>
                <option value="completed">Đạt kiến tập</option>
                <option value="failed">Không đạt</option>
              </select>
            </div>

            {/* Search filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Tìm kiếm SV:</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Search size={14} />
                </span>
                <input 
                  type="text" 
                  placeholder="Nhập MSSV, Họ tên..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3 pl-4">Sinh viên (MSSV)</th>
                    <th className="p-3">Lớp</th>
                    <th className="p-3">Doanh nghiệp đăng ký</th>
                    <th className="p-3">Thời gian ĐK</th>
                    <th className="p-3">Lệ phí</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right pr-4">Thao tác duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRegs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400">Không tìm thấy bản ghi đăng ký nào khớp bộ lọc</td>
                    </tr>
                  ) : (
                    filteredRegs.map((reg) => {
                      const stat = getStatusLabel(reg.status);
                      return (
                        <tr key={reg.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-3 pl-4">
                            <span className="font-bold text-slate-800 block">{reg.studentName}</span>
                            <span className="font-mono text-[10px] text-slate-400 block">{reg.mssv}</span>
                          </td>
                          <td className="p-3 font-semibold text-slate-600">{reg.studentClass}</td>
                          <td className="p-3">
                            <span className="font-medium text-slate-800 leading-tight">{reg.visitName}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{reg.registeredAt}</td>
                          <td className="p-3">
                            {reg.feeStatus === 'verified' && (
                              <span className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 border border-emerald-100 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                Đã nộp HP
                              </span>
                            )}
                            {reg.feeStatus === 'pending' && (
                              <div className="flex flex-col items-start gap-1">
                                <span className="inline-flex items-center gap-0.5 text-amber-600 bg-amber-50 border border-amber-100 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                  Chờ hoàn phí
                                </span>
                                <button 
                                  onClick={() => handleVerifyFee(reg.id)}
                                  className="text-[9px] text-indigo-600 hover:underline font-bold"
                                >
                                  Xác nhận hoàn
                                </button>
                              </div>
                            )}
                            {reg.feeStatus === 'unpaid' && (
                              <span className="inline-flex items-center gap-0.5 text-slate-400 bg-slate-50 border border-slate-150 text-[10px] px-1.5 py-0.5 rounded">
                                Chưa nộp
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {stat && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${stat.cls}`}>
                                {stat.text}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {reg.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => { onUpdateStatus(reg.id, 'valid'); onUpdateFeeStatus(reg.id, 'verified'); }}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                    title="Duyệt hợp lệ"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button 
                                    onClick={() => onUpdateStatus(reg.id, 'rejected')}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                    title="Từ chối"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              )}
                              {reg.status === 'cancelled_pending_approval' && (
                                <button 
                                  onClick={() => setSelectedProofReg(reg)}
                                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] rounded flex items-center gap-0.5 shadow-sm"
                                >
                                  Duyệt minh chứng
                                </button>
                              )}
                              {reg.status !== 'pending' && reg.status !== 'cancelled_pending_approval' && (
                                <button 
                                  onClick={() => onUpdateStatus(reg.id, 'pending')}
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                  title="Đặt lại Chờ duyệt"
                                >
                                  <RefreshCw size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content for Cancellation Proofs Tab */}
      {activeTab === 'proofs' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-950">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Danh sách yêu cầu hủy chuyến có đính kèm minh chứng</p>
              <p className="text-slate-600 mt-0.5">Sinh viên hủy chuyến tự do hoặc bắt buộc có lý do chính đáng sẽ gửi tệp minh chứng ảnh chụp (lịch thi trùng, giấy bệnh viện...). Quản lý khoa cần xem xét và phê duyệt để thực hiện kích hoạt bồi hoàn lệ phí (nếu có).</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Hàng đợi duyệt minh chứng ({pendingProofs.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingProofs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">Hiện tại không có minh chứng hủy chuyến nào cần phê duyệt</div>
              ) : (
                pendingProofs.map((reg) => (
                  <div key={reg.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{reg.studentName}</span>
                        <span className="font-mono text-xs text-slate-500">({reg.mssv})</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">{reg.studentClass}</span>
                      </div>
                      <p className="text-xs text-slate-700">
                        Chuyến đăng ký: <strong className="text-slate-800 font-bold">{reg.visitName}</strong>
                      </p>
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 border border-slate-150 rounded mt-2">
                        Lý do hủy: "{reg.cancellationReason || 'Chưa cung cấp lý do'}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button 
                        onClick={() => setSelectedProofReg(reg)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                      >
                        <FileText size={14} /> Xem tệp đính kèm
                      </button>
                      <button 
                        onClick={() => handleApproveProof(reg.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Check size={14} /> Chấp thuận hủy
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content for Freeze / Locking Tab */}
      {activeTab === 'freeze' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 text-xs text-indigo-950">
            <ShieldCheck size={20} className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Chốt danh sách và Khóa Đăng ký</p>
              <p className="text-slate-600 mt-0.5">Khi một chuyến tham quan đạt đủ sĩ số mong muốn hoặc sát ngày khởi hành, Quản lý khoa sẽ thực hiện chốt sổ. Hành động này chuyển toàn bộ đăng ký chờ phê duyệt còn lại thành Hợp lệ, đóng tính năng hủy chuyến của Sinh viên, và sẵn sàng kết xuất danh sách cho Giảng viên dẫn đoàn.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freezeVisits.map((visit) => {
              const visitRegs = registrations.filter(r => r.visitId === visit.id);
              const activeCount = visitRegs.filter(r => r.status === 'valid' || r.status === 'completed' || r.status === 'attended').length;
              const pendingCount = visitRegs.filter(r => r.status === 'pending').length;
              const isLocked = pendingCount === 0 && visit.registeredCount >= visit.capacity;

              return (
                <div key={visit.id} className="bg-white rounded-xl border border-slate-150 p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight mb-2">{visit.factoryName.split(' - ')[0]}</h4>
                    <p className="text-[11px] text-slate-400 mb-4">{visit.factoryName}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Tổng đăng ký</span>
                        <p className="font-bold text-slate-700 mt-0.5">{visitRegs.length}</p>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded">
                        <span className="text-[9px] uppercase text-emerald-600 font-bold">Chấp thuận</span>
                        <p className="font-bold text-emerald-700 mt-0.5">{activeCount}</p>
                      </div>
                      <div className="bg-indigo-50 p-2 rounded">
                        <span className="text-[9px] uppercase text-indigo-600 font-bold">Chờ duyệt</span>
                        <p className="font-bold text-indigo-700 mt-0.5">{pendingCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">Tải trọng: {visit.registeredCount}/{visit.capacity}</span>
                    {pendingCount > 0 ? (
                      <button 
                        onClick={() => handleFreezeVisitAction(visit.id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-sm"
                      >
                        Chốt & Khóa ngay
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-150">
                        <Check size={12} /> Đã khóa danh sách
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancellation Proof Image Viewer Modal */}
      {selectedProofReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Phê duyệt Minh chứng Hủy chuyến</h4>
                <p className="text-[10px] text-slate-400">Xem xét và đưa ra quyết định chấp thuận hủy chuyến đóng phí</p>
              </div>
              <button onClick={() => setSelectedProofReg(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Sinh viên gửi hồ sơ:</span>
                <span className="text-xs font-bold text-slate-800 block">{selectedProofReg.studentName} ({selectedProofReg.mssv}) - {selectedProofReg.studentClass}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-semibold block">Lý do trình báo:</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 border border-slate-200 rounded leading-relaxed italic">
                  "{selectedProofReg.cancellationReason || 'Không có lý do cụ thể'}"
                </p>
              </div>

              {/* Mock Proof Document Visualization */}
              <div>
                <span className="text-xs text-slate-500 font-semibold block mb-1">Tệp tin ảnh đính kèm (Minh chứng):</span>
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-100 flex flex-col items-center justify-center min-h-[140px] text-center">
                  <FileText size={40} className="text-indigo-600 mb-2" />
                  <span className="text-xs font-mono font-semibold text-slate-800">{selectedProofReg.cancellationProofUrl || 'minh_chung_ho_so_kem.jpg'}</span>
                  <span className="text-[10px] text-slate-400 mt-1">Ảnh chụp lịch thi của ĐHQG-HCM, có con dấu hoặc chữ ký số xác thực</span>
                </div>
              </div>

              {/* Footer controls */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  onClick={() => handleRejectProof(selectedProofReg.id)}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  Từ chối Minh chứng
                </button>
                <button 
                  onClick={() => handleApproveProof(selectedProofReg.id)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Duyệt chấp thuận & Hoàn phí
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
