import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';
import 'dashboard_sv.dart';
import 'chuyenthamquan_sv.dart';
import 'nopbaithuhoach_sv.dart';
import 'ketqua_diem_sv.dart';
import 'lichtrinhdoan_sv.dart';
import 'taichinh_sv.dart';

class StudentPortal extends StatefulWidget {
  const StudentPortal({super.key});

  @override
  State<StudentPortal> createState() => _StudentPortalState();
}

class _StudentPortalState extends State<StudentPortal> {
  int _currentIndex = 0;
  String _tripsTab = 'available'; // 'available' or 'registered'
  String? _selectedTripDetailId;
  String? _moreSubScreen; // null, 'schedule', 'finance', 'notifications', 'profile'

  void _navigateTo(int index) {
    setState(() {
      _currentIndex = index;
      _selectedTripDetailId = null;
      _moreSubScreen = null;
    });
  }

  void _openTripDetail(String tripId) {
    setState(() {
      _selectedTripDetailId = tripId;
    });
  }

  void _closeTripDetail() {
    setState(() {
      _selectedTripDetailId = null;
    });
  }

  void _openMoreScreen(String screenKey) {
    setState(() {
      _moreSubScreen = screenKey;
    });
  }

  void _closeMoreScreen() {
    setState(() {
      _moreSubScreen = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final isTripDetailActive = _selectedTripDetailId != null;
    final isSubScreenActive = _moreSubScreen != null;

    String pageTitle = 'Xin chào, ${appState.studentProfile.name.split(' ').last}';
    if (_currentIndex == 1) {
      pageTitle = isTripDetailActive ? 'Chi tiết chuyến đi' : 'Chuyến tham quan';
    } else if (_currentIndex == 2) {
      pageTitle = 'Nộp bài thu hoạch';
    } else if (_currentIndex == 3) {
      pageTitle = 'Kết quả & điểm';
    } else if (_currentIndex == 4) {
      if (_moreSubScreen == 'schedule') pageTitle = 'Lịch trình đoàn';
      if (_moreSubScreen == 'finance') pageTitle = 'Tài chính';
      if (_moreSubScreen == 'notifications') pageTitle = 'Thông báo';
      if (_moreSubScreen == 'profile') pageTitle = 'Hồ sơ cá nhân';
      if (_moreSubScreen == null) pageTitle = 'Thêm';
    }

    final showBack = isTripDetailActive || isSubScreenActive;

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        leading: showBack
            ? IconButton(
                icon: const Icon(Icons.arrow_back, color: AppColors.primary),
                onPressed: () {
                  if (isTripDetailActive) {
                    _closeTripDetail();
                  } else if (isSubScreenActive) {
                    _closeMoreScreen();
                  }
                },
              )
            : IconButton(
                icon: const Icon(Icons.menu, color: AppColors.primary),
                onPressed: () => _openMoreScreen('profile'),
              ),
        title: Text(
          pageTitle,
          style: const TextStyle(
            color: AppColors.primary,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none, color: AppColors.darkSlate),
                onPressed: () => _openMoreScreen('notifications'),
              ),
              if (appState.studentNotifications.any((n) => !n.isRead))
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.danger,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
          GestureDetector(
            onTap: () => _openMoreScreen('profile'),
            child: Container(
              margin: const EdgeInsets.only(right: 16, left: 4),
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.grey.shade300, width: 1.5),
                image: DecorationImage(
                  image: NetworkImage(appState.studentProfile.avatar),
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
        ],
      ),
      body: _buildMainBody(appState, appStateProvider),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.appBackground, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _navigateTo,
          type: BottomNavigationBarType.fixed,
          backgroundColor: AppColors.baseBackground,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textMuted,
          selectedLabelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
          unselectedLabelStyle: const TextStyle(fontSize: 9),
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home, color: AppColors.primary),
              label: 'Trang chủ',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.explore_outlined),
              activeIcon: Icon(Icons.explore, color: AppColors.primary),
              label: 'Tham quan',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.upload_file_outlined),
              activeIcon: Icon(Icons.upload_file, color: AppColors.primary),
              label: 'Nộp bài',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.stars_outlined),
              activeIcon: Icon(Icons.stars, color: AppColors.primary),
              label: 'Kết quả',
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.more_horiz_outlined),
              activeIcon: const Icon(Icons.more_horiz, color: AppColors.primary),
              label: _moreSubScreen != null ? 'Quay lại' : 'Thêm',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMainBody(AppState appState, AppStateProviderState appStateProvider) {
    if (_selectedTripDetailId != null) {
      final trip = appState.studentTrips.firstWhere((t) => t.id == _selectedTripDetailId);
      return ChuyenThamQuanDetailSVScreen(trip: trip, onBack: _closeTripDetail);
    }

    if (_moreSubScreen != null) {
      return _buildSubScreen(appState, appStateProvider);
    }

    switch (_currentIndex) {
      case 0:
        return DashboardSVScreen(
          onTripTap: _openTripDetail,
          onNotifTap: () => _openMoreScreen('notifications'),
        );
      case 1:
        return ChuyenThamQuanSVScreen(
          onTripTap: _openTripDetail,
          activeTab: _tripsTab,
          onTabChanged: (tab) => setState(() => _tripsTab = tab),
        );
      case 2:
        return const NopBaiThuHoachSVScreen();
      case 3:
        return const KetQuaDiemSVScreen();
      case 4:
        return _buildMoreMenu(appState, appStateProvider);
      default:
        return DashboardSVScreen(
          onTripTap: _openTripDetail,
          onNotifTap: () => _openMoreScreen('notifications'),
        );
    }
  }

  Widget _buildSubScreen(AppState appState, AppStateProviderState appStateProvider) {
    if (_moreSubScreen == 'schedule') {
      return const LichTrinhDoanSVScreen();
    }
    if (_moreSubScreen == 'finance') {
      return const TaiChinhSVScreen();
    }
    if (_moreSubScreen == 'notifications') {
      return _buildNotificationsSubScreen(appState, appStateProvider);
    }
    if (_moreSubScreen == 'profile') {
      return _buildProfileSubScreen(appState, appStateProvider);
    }
    return Container();
  }

  Widget _buildNotificationsSubScreen(AppState appState, AppStateProviderState appStateProvider) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: appState.studentNotifications.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Hộp thư thông báo',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                TextButton.icon(
                  onPressed: () {
                    appStateProvider.markAllStudentNotificationsRead();
                  },
                  icon: const Icon(Icons.done_all, size: 16),
                  label: const Text('Đọc tất cả', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          );
        }

        final notif = appState.studentNotifications[index - 1];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (!notif.isRead)
                      Container(
                        margin: const EdgeInsets.only(top: 4, right: 8),
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.warning,
                          shape: BoxShape.circle,
                        ),
                      ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            notif.title,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: notif.isRead ? FontWeight.w600 : FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            notif.timeText,
                            style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  notif.content,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade700, height: 1.4),
                ),
                if (notif.attachment != null) ...[
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Đang tải tệp: ${notif.attachment}...')),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.attach_file, size: 14, color: AppColors.primary),
                          const SizedBox(width: 4),
                          Text(
                            notif.attachment!,
                            style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProfileSubScreen(AppState appState, AppStateProviderState appStateProvider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 10)],
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundImage: NetworkImage(appState.studentProfile.avatar),
                ),
                const SizedBox(height: 12),
                Text(
                  appState.studentProfile.name,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                ),
                Text(
                  appState.studentProfile.email,
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text('Thông tin chi tiết', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          _buildInfoRow('MSSV', appState.studentProfile.studentId),
          _buildInfoRow('Lớp', appState.studentProfile.className),
          _buildInfoRow('Ngành học', appState.studentProfile.major),
          const Divider(height: 36),

          OutlinedButton.icon(
            onPressed: () {
              appStateProvider.resetData();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã khôi phục dữ liệu gốc!')),
              );
            },
            icon: const Icon(Icons.refresh),
            label: const Text('Khôi phục dữ liệu gốc'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: const BorderSide(color: AppColors.primary),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 12),

          ElevatedButton.icon(
            onPressed: () {
              appStateProvider.logout();
            },
            icon: const Icon(Icons.logout),
            label: const Text('Đăng xuất'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
          Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.darkSlate)),
        ],
      ),
    );
  }

  Widget _buildMoreMenu(AppState appState, AppStateProviderState appStateProvider) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildMenuCard(
          title: 'Lịch trình & thông tin đoàn',
          desc: 'Xem chi tiết hướng dẫn viên, liên lạc, timeline di chuyển',
          icon: Icons.calendar_month,
          onTap: () => _openMoreScreen('schedule'),
        ),
        const SizedBox(height: 12),
        _buildMenuCard(
          title: 'Tài chính & Hoàn lệ phí',
          desc: 'Xem hóa đơn đóng phí, nộp hồ sơ xin hoàn tiền',
          icon: Icons.payment,
          onTap: () => _openMoreScreen('finance'),
        ),
        const SizedBox(height: 12),
        _buildMenuCard(
          title: 'Thông báo chung',
          desc: 'Xem lại tất cả các thông báo của khoa và lớp',
          icon: Icons.campaign,
          onTap: () => _openMoreScreen('notifications'),
        ),
        const SizedBox(height: 12),
        _buildMenuCard(
          title: 'Hồ sơ cá nhân',
          desc: 'Thông tin sinh viên, đổi mật khẩu, khôi phục dữ liệu',
          icon: Icons.person,
          onTap: () => _openMoreScreen('profile'),
        ),
      ],
    );
  }

  Widget _buildMenuCard({required String title, required String desc, required IconData icon, required VoidCallback onTap}) {
    return Card(
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppColors.primary),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(desc, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted),
      ),
    );
  }
}
