import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TripsView from './components/TripsView';
import ScheduleView from './components/ScheduleView';
import SubmissionsView from './components/SubmissionsView';
import GradesView from './components/GradesView';
import FinanceView from './components/FinanceView';
import NotificationsView from './components/NotificationsView';

import { 
  initialTrips, 
  initialAvailableTrips, 
  initialSubmissions, 
  initialStudents, 
  initialSchedules, 
  initialPayments, 
  initialRefundRequests, 
  initialNotifications 
} from './data/mockData';
import { Trip, Submission, Student, PaymentItem, RefundItem, NotificationItem } from './types';

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<string>('trang-chu');

  // Application Dynamic States (persisted locally to support reload continuity)
  const [trips, setTrips] = useState<Trip[]>(() => {
    const local = localStorage.getItem('ims_trips');
    return local ? JSON.parse(local) : initialTrips;
  });

  const [availableTrips, setAvailableTrips] = useState<Trip[]>(() => {
    const local = localStorage.getItem('ims_available_trips');
    return local ? JSON.parse(local) : initialAvailableTrips;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const local = localStorage.getItem('ims_submissions');
    return local ? JSON.parse(local) : initialSubmissions;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const local = localStorage.getItem('ims_students');
    return local ? JSON.parse(local) : initialStudents;
  });

  const [payments, setPayments] = useState<PaymentItem[]>(() => {
    const local = localStorage.getItem('ims_payments');
    return local ? JSON.parse(local) : initialPayments;
  });

  const [refundRequests, setRefundRequests] = useState<RefundItem[]>(() => {
    const local = localStorage.getItem('ims_refund_requests');
    return local ? JSON.parse(local) : initialRefundRequests;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const local = localStorage.getItem('ims_notifications');
    return local ? JSON.parse(local) : initialNotifications;
  });

  const [selectedCouncilReportIds, setSelectedCouncilReportIds] = useState<string[]>([]);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('ims_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('ims_available_trips', JSON.stringify(availableTrips));
  }, [availableTrips]);

  useEffect(() => {
    localStorage.setItem('ims_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('ims_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('ims_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('ims_refund_requests', JSON.stringify(refundRequests));
  }, [refundRequests]);

  useEffect(() => {
    localStorage.setItem('ims_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Actions
  const handleRegisterTrip = (trip: Trip) => {
    // 1. Move from available to registered
    const updatedAvailable = availableTrips.filter(t => t.id !== trip.id);
    if (trip.slotsRemaining !== 9999) {
      // Decrement slot remaining
      const decrementedTrip = { 
        ...trip, 
        slotsRemaining: Math.max(0, trip.slotsRemaining - 1),
        registered: true,
        status: 'Hợp lệ' as const
      };
      setTrips(prev => [decrementedTrip, ...prev]);
    } else {
      setTrips(prev => [{ ...trip, registered: true, status: 'Hợp lệ' as const }, ...prev]);
    }
    setAvailableTrips(updatedAvailable);

    // 2. Add pending submission automatically
    const newSub: Submission = {
      id: `sub-gen-${Date.now()}`,
      tripId: trip.id,
      tripTitle: trip.title,
      type: trip.type,
      status: 'Chưa nộp',
      date: new Date().toLocaleDateString('vi-VN'),
      deadline: '10 ngày sau đăng ký',
      deadlineTimestamp: Date.now() + 10 * 24 * 60 * 60 * 1000
    };
    setSubmissions(prev => [newSub, ...prev]);

    // 3. Add unpaid payment item automatically
    const newPay: PaymentItem = {
      id: `pay-gen-${Date.now()}`,
      tripId: trip.id,
      tripTitle: trip.title,
      code: `KT-SV-${Math.floor(100 + Math.random() * 900)}`,
      amount: trip.type === 'Trực tiếp' ? 150000 : 50000,
      deadline: '7 ngày sau đăng ký',
      status: 'Chưa đóng'
    };
    setPayments(prev => [newPay, ...prev]);

    // 4. Create new notification
    const newNotif: NotificationItem = {
      id: `notif-gen-${Date.now()}`,
      title: `Đăng ký thành công chuyến đi ${trip.title}`,
      content: `Yêu cầu đăng ký tham quan thực tế tại doanh nghiệp ${trip.title} của bạn đã được ghi nhận. Vui lòng thanh toán lệ phí đoàn và hoàn thành bài viết thu hoạch đúng hạn quy định.`,
      time: 'Vừa xong',
      timeRelative: 'Vừa xong',
      isRead: false,
      category: 'hệ thống'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleCancelRegistration = (tripId: string) => {
    const tripToCancel = trips.find(t => t.id === tripId);
    if (!tripToCancel) return;

    if (confirm(`Bạn có chắc chắn muốn hủy đăng ký chuyến đi "${tripToCancel.title}"?`)) {
      // 1. Remove from registered and return to available list
      setTrips(prev => prev.filter(t => t.id !== tripId));
      
      const originalAvail = initialAvailableTrips.find(t => t.id === tripId) || {
        ...tripToCancel,
        registered: false,
        status: 'Hợp lệ' as const,
        slotsRemaining: tripToCancel.slotsRemaining === 9999 ? 9999 : tripToCancel.slotsRemaining + 1
      };
      setAvailableTrips(prev => [originalAvail, ...prev]);

      // 2. Clear corresponding auto generated submission & payment items
      setSubmissions(prev => prev.filter(s => s.tripId !== tripId));
      setPayments(prev => prev.filter(p => p.tripId !== tripId));

      // 3. Create cancel notification
      const newNotif: NotificationItem = {
        id: `notif-gen-${Date.now()}`,
        title: `Đã hủy đăng ký chuyến đi ${tripToCancel.title}`,
        content: `Bạn đã chủ động hủy đăng ký tham quan thực địa tại ${tripToCancel.title}. Biên lai tài chính và bài nộp thu hoạch tương ứng đã được hệ thống thu hồi.`,
        time: 'Vừa xong',
        timeRelative: 'Vừa xong',
        isRead: false,
        category: 'hệ thống'
      };
      setNotifications(prev => [newNotif, ...prev]);
      alert('Đã hủy đăng ký chuyến đi thành công.');
    }
  };

  const handleToggleCheckIn = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, checkedIn: !s.checkedIn };
      }
      return s;
    }));
  };

  const handleUploadReport = (
    subId: string, 
    fileName: string, 
    fileSize: string, 
    proofName?: string, 
    proofSize?: string
  ) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          status: 'Đã nộp',
          submittedDate: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
          fileName,
          fileSize,
          proofFileName: proofName,
          proofFileSize: proofSize
        };
      }
      return s;
    }));

    // Add alert notification
    const sub = submissions.find(s => s.id === subId);
    if (sub) {
      const newNotif: NotificationItem = {
        id: `notif-gen-${Date.now()}`,
        title: `Hệ thống tiếp nhận báo cáo kiến tập`,
        content: `Tệp tin bài thu hoạch "${fileName}" dành cho chuyến đi "${sub.tripTitle}" đã được nộp thành công lên cơ sở dữ liệu khoa.`,
        time: 'Vừa xong',
        timeRelative: 'Vừa xong',
        isRead: false,
        category: 'bài thu hoạch'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleSelectCouncilReport = (subId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCouncilReportIds(prev => [...prev, subId]);
    } else {
      setSelectedCouncilReportIds(prev => prev.filter(id => id !== subId));
    }
  };

  const handlePayFee = (paymentId: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'Đã đóng đúng hạn',
          payDate: new Date().toLocaleDateString('vi-VN')
        };
      }
      return p;
    }));

    // Add alert notification
    const pay = payments.find(p => p.id === paymentId);
    if (pay) {
      const newNotif: NotificationItem = {
        id: `notif-gen-${Date.now()}`,
        title: `Thanh toán thành công lệ phí kiến tập`,
        content: `Khoa CNTP ghi nhận khoản thanh toán ${pay.amount.toLocaleString()}đ của bạn dành cho biên lai mã hiệu "${pay.code}" thành công.`,
        time: 'Vừa xong',
        timeRelative: 'Vừa xong',
        isRead: false,
        category: 'tài chính'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleAddRefundRequest = (refund: Omit<RefundItem, 'id' | 'date'>) => {
    const newRefund: RefundItem = {
      ...refund,
      id: `ref-gen-${Date.now()}`,
      date: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    };
    setRefundRequests(prev => [newRefund, ...prev]);

    // Create system notification
    const newNotif: NotificationItem = {
      id: `notif-gen-${Date.now()}`,
      title: `Tiếp nhận yêu cầu hoàn trả chi phí`,
      content: `Hệ thống đã phê duyệt tạo đơn yêu cầu hoàn phí cho "${refund.invoiceName}" trị giá ${refund.amount.toLocaleString()}đ. Quá trình xử lý dự kiến mất 5-7 ngày làm việc.`,
      time: 'Vừa xong',
      timeRelative: 'Vừa xong',
      isRead: false,
      category: 'tài chính'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleAddDestinationProposal = (proposal: any) => {
    // Add custom proposal confirmation log in the notifications
    const newNotif: NotificationItem = {
      id: `notif-gen-${Date.now()}`,
      title: `Đã ghi nhận đề xuất điểm đến ${proposal.companyName}`,
      content: `Khoa CNTP đã nhận được đề xuất tham quan thực địa của bạn tại doanh nghiệp "${proposal.companyName}" tọa lạc tại ${proposal.address}. Cảm ơn sự nhiệt tình của bạn!`,
      time: 'Vừa xong',
      timeRelative: 'Vừa xong',
      isRead: false,
      category: 'hệ thống'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Label resolving
  const getActiveViewLabel = () => {
    switch (activeView) {
      case 'trang-chu': return 'Trang chủ';
      case 'chuyen-tham-quan': return 'Chuyến tham quan';
      case 'lich-trinh-doan': return 'Lịch trình đoàn';
      case 'nop-bai-thu-hoach': return 'Nộp bài thu hoạch';
      case 'ket-qua-diem': return 'Kết quả & điểm';
      case 'thanh-toan': return 'Thanh toán';
      case 'hoan-phi': return 'Hoàn phí';
      case 'thong-bao': return 'Thông báo';
      default: return 'Trang chủ';
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex bg-[#ecefe6]/50">
      
      {/* Sidebar navigation element */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        unreadNotificationsCount={unreadNotificationsCount} 
      />

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col pl-[260px] min-h-screen">
        
        {/* Fixed Header component */}
        <Header 
          activeViewLabel={getActiveViewLabel()} 
          setActiveView={setActiveView} 
          unreadNotificationsCount={unreadNotificationsCount} 
        />

        {/* Dynamic content rendering frame */}
        <main className="flex-1 p-8 mt-16 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {activeView === 'trang-chu' && (
            <DashboardView 
              trips={trips} 
              submissions={submissions} 
              notifications={notifications} 
              setActiveView={setActiveView} 
            />
          )}

          {activeView === 'chuyen-tham-quan' && (
            <TripsView 
              trips={trips} 
              availableTrips={availableTrips} 
              onRegisterTrip={handleRegisterTrip} 
              onCancelRegistration={handleCancelRegistration}
              onAddDestinationProposal={handleAddDestinationProposal}
            />
          )}

          {activeView === 'lich-trinh-doan' && (
            <ScheduleView 
              trips={trips} 
              schedules={initialSchedules} 
              students={students} 
              onToggleCheckIn={handleToggleCheckIn} 
            />
          )}

          {activeView === 'nop-bai-thu-hoach' && (
            <SubmissionsView 
              submissions={submissions} 
              onUploadReport={handleUploadReport} 
              onSelectCouncilReport={handleSelectCouncilReport}
              selectedCouncilReportIds={selectedCouncilReportIds}
            />
          )}

          {activeView === 'ket-qua-diem' && (
            <GradesView />
          )}

          {activeView === 'thanh-toan' && (
            <FinanceView 
              payments={payments} 
              refundRequests={refundRequests} 
              onPayFee={handlePayFee} 
              onAddRefundRequest={handleAddRefundRequest}
              initialTab="payment"
            />
          )}

          {activeView === 'hoan-phi' && (
            <FinanceView 
              payments={payments} 
              refundRequests={refundRequests} 
              onPayFee={handlePayFee} 
              onAddRefundRequest={handleAddRefundRequest}
              initialTab="refund"
            />
          )}

          {activeView === 'thong-bao' && (
            <NotificationsView 
              notifications={notifications} 
              onMarkAllRead={handleMarkAllRead} 
            />
          )}

        </main>
      </div>
    </div>
  );
}
