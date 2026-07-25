import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardHomeView from './components/DashboardHomeView';
import UserAccountsView from './components/UserAccountsView';
import StudentCatalogueView from './components/StudentCatalogueView';
import CommitteeView from './components/CommitteeView';
import FeesManagementView from './components/FeesManagementView';
import RefundApprovalView from './components/RefundApprovalView';
import InternshipResultsView from './components/InternshipResultsView';
import AnnouncementView from './components/AnnouncementView';
import ReportsOverviewView from './components/ReportsOverviewView';
import VisitReportDetailView from './components/VisitReportDetailView';

import { 
  initialUserAccounts, 
  initialCommitteeBoards, 
  initialAnnouncements, 
  initialFeeRecords, 
  initialResultRecords, 
  initialRefundRecords, 
  initialTripDetails 
} from './data';
import { UserRole } from './types';

export default function App() {
  const [view, setView] = useState<string>('trang-chu');
  const [userRole, setUserRole] = useState<UserRole>('Quản lý khoa');

  // React local states for shared reactive mock dataset
  const [accounts, setAccounts] = useState(initialUserAccounts);
  const [boards, setBoards] = useState(initialCommitteeBoards);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [feeRecords, setFeeRecords] = useState(initialFeeRecords);
  const [results, setResults] = useState(initialResultRecords);
  const [refundRecords, setRefundRecords] = useState(initialRefundRecords);
  const [trips, setTrips] = useState(initialTripDetails);

  // Unread announcement simulation
  const unreadCount = announcements.length;

  const handleLogout = () => {
    alert('Hệ thống: Bạn đã đăng xuất an toàn khỏi tài khoản cán bộ khoa.');
  };

  const getPageTitle = (currentView: string) => {
    switch (currentView) {
      case 'trang-chu':
        return 'Trang chủ Hệ thống';
      case 'tai-khoan':
        return 'Quản lý Tài khoản Cán bộ & Sinh viên';
      case 'sinh-vien':
        return 'Danh mục nền & Lớp niên chế';
      case 'hoi-dong-cham':
        return 'Hội đồng Bảo vệ & Đánh giá báo cáo';
      case 'quan-ly-le-phi':
        return 'Đối soát & Thu lệ phí kiến tập';
      case 'duyet-hoan-phi':
        return 'Xét duyệt hoàn trả lệ phí';
      case 'ket-qua-kien-tap':
        return 'Kết quả học tập & Bảng điểm chuyên đề';
      case 'thong-bao':
        return 'Bản tin thông báo hệ thống';
      case 'bao-cao-thong-ke':
        return 'Danh mục báo cáo & Kết xuất Excel';
      case 'tong-hop-tham-quan':
        return 'Tổng hợp dữ liệu tham quan thực tế';
      default:
        return 'Quản lý Kiến tập Khoa thực phẩm';
    }
  };

  const renderActiveView = () => {
    switch (view) {
      case 'trang-chu':
        return (
          <DashboardHomeView 
            setView={setView} 
            boards={boards} 
            announcements={announcements} 
          />
        );
      case 'tai-khoan':
        return (
          <UserAccountsView 
            accounts={accounts} 
            setAccounts={setAccounts} 
          />
        );
      case 'sinh-vien':
        return <StudentCatalogueView />;
      case 'hoi-dong-cham':
        return (
          <CommitteeView 
            boards={boards} 
            setBoards={setBoards} 
          />
        );
      case 'quan-ly-le-phi':
        return (
          <FeesManagementView 
            feeRecords={feeRecords} 
            setFeeRecords={setFeeRecords} 
          />
        );
      case 'duyet-hoan-phi':
        return (
          <RefundApprovalView 
            refundRecords={refundRecords} 
            setRefundRecords={setRefundRecords} 
          />
        );
      case 'ket-qua-kien-tap':
        return (
          <InternshipResultsView 
            results={results} 
            setResults={setResults} 
          />
        );
      case 'thong-bao':
        return (
          <AnnouncementView 
            announcements={announcements} 
            setAnnouncements={setAnnouncements} 
          />
        );
      case 'bao-cao-thong-ke':
        return <ReportsOverviewView setView={setView} />;
      case 'tong-hop-tham-quan':
        return (
          <VisitReportDetailView 
            trips={trips} 
            setView={setView} 
          />
        );
      default:
        return (
          <div className="py-12 text-center text-slate-400 font-bold">
            Trang đang được xây dựng...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf1] relative">
      {/* Sidebar navigation */}
      <Sidebar 
        currentView={view} 
        setView={setView} 
        userRole={userRole} 
        unreadCount={unreadCount} 
        onLogout={handleLogout} 
      />

      {/* Main Container Wrapper */}
      <div className="ml-[260px] flex flex-col min-h-screen">
        {/* Fixed Header */}
        <Header 
          currentRole={userRole} 
          onRoleChange={setUserRole} 
          title={getPageTitle(view)} 
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 pt-24 px-8 pb-12 overflow-y-auto w-full max-w-7xl mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
