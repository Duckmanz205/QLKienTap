import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';
import 'dashboard_gv.dart';
import 'lichdandoan_gv.dart';
import 'diemdanhsv_gv.dart';
import 'sinhvienhuongdan_gv.dart';
import 'chambaithuhoach_gv.dart';
import 'hoidongchambaocao_dsbuoi_gv.dart';

class LecturerPortal extends StatefulWidget {
  const LecturerPortal({super.key});

  @override
  State<LecturerPortal> createState() => _LecturerPortalState();
}

class _LecturerPortalState extends State<LecturerPortal> {
  int _currentIndex = 0;

  // Sub-screens conditional flags
  String? _attendanceActiveTourId;
  String? _gradingActiveStudentId;
  bool _notificationSubScreen = false;
  bool _profileSubScreen = false;
  String? _activeCouncilId;

  void _navigateTo(int index) {
    setState(() {
      _currentIndex = index;
      _attendanceActiveTourId = null;
      _gradingActiveStudentId = null;
      _notificationSubScreen = false;
      _profileSubScreen = false;
      _activeCouncilId = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    // Determine titles & back button flags
    bool showBack = _attendanceActiveTourId != null ||
        _gradingActiveStudentId != null ||
        _notificationSubScreen ||
        _profileSubScreen ||
        _activeCouncilId != null;

    String pageTitle = 'Xin chào, ${_stateRoleLabel(appState)}';
    if (_currentIndex == 1) {
      if (_attendanceActiveTourId != null) {
        pageTitle = 'Điểm danh đoàn';
      } else {
        pageTitle = 'Lịch trình dẫn đoàn';
      }
    } else if (_currentIndex == 2) {
      if (_gradingActiveStudentId != null) {
        pageTitle = 'Đánh giá & chấm bài';
      } else {
        pageTitle = 'Sinh viên hướng dẫn';
      }
    } else if (_currentIndex == 3) {
      if (_activeCouncilId != null) {
        pageTitle = 'Chấm điểm hội đồng';
      } else {
        pageTitle = 'Hội đồng chấm báo cáo';
      }
    } else if (_currentIndex == 4) {
      pageTitle = 'Thêm';
    }

    if (_notificationSubScreen) pageTitle = 'Hộp thư thông báo';
    if (_profileSubScreen) pageTitle = 'Hồ sơ giảng viên';

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        leading: showBack
            ? IconButton(
                icon: const Icon(Icons.arrow_back, color: AppColors.primary),
                onPressed: () {
                  setState(() {
                    if (_attendanceActiveTourId != null) {
                      _attendanceActiveTourId = null;
                    } else if (_gradingActiveStudentId != null) {
                      _gradingActiveStudentId = null;
                    } else if (_activeCouncilId != null) {
                      _activeCouncilId = null;
                    } else {
                      _notificationSubScreen = false;
                      _profileSubScreen = false;
                    }
                  });
                },
              )
            : IconButton(
                icon: const Icon(Icons.menu, color: AppColors.primary),
                onPressed: () => setState(() => _profileSubScreen = true),
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
                onPressed: () => setState(() => _notificationSubScreen = true),
              ),
              if (appState.lecturerNotifications.any((n) => n.isUnread))
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
            onTap: () => setState(() => _profileSubScreen = true),
            child: Container(
              margin: const EdgeInsets.only(right: 16, left: 4),
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.grey.shade300, width: 1.5),
                image: DecorationImage(
                  image: NetworkImage(appState.lecturerProfile.avatar),
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
        ],
      ),
      body: _buildLecturerBody(appState, appStateProvider),
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
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard, color: AppColors.primary),
              label: 'Trang chủ',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.directions_bus_outlined),
              activeIcon: Icon(Icons.directions_bus, color: AppColors.primary),
              label: 'Dẫn đoàn',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.people_outline),
              activeIcon: Icon(Icons.people, color: AppColors.primary),
              label: 'Hướng dẫn',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.gavel_outlined),
              activeIcon: Icon(Icons.gavel, color: AppColors.primary),
              label: 'Hội đồng',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.more_horiz_outlined),
              activeIcon: Icon(Icons.more_horiz, color: AppColors.primary),
              label: 'Thêm',
            ),
          ],
        ),
      ),
    );
  }

  String _stateRoleLabel(AppState state) {
    final lastName = state.lecturerProfile.name.split(' ').last;
    return 'Thầy $lastName';
  }

  Widget _buildLecturerBody(AppState appState, AppStateProviderState appStateProvider) {
    if (_profileSubScreen) {
      return _buildProfileSubScreen(appState, appStateProvider);
    }
    if (_notificationSubScreen) {
      return _buildNotificationsSubScreen(appState, appStateProvider);
    }

    switch (_currentIndex) {
      case 0:
        return DashboardGVScreen(
          onTourTap: (tourId) => setState(() {
            _currentIndex = 1;
            _attendanceActiveTourId = tourId;
          }),
          onStudentTap: (studentId) => setState(() {
            _currentIndex = 2;
            _gradingActiveStudentId = studentId;
          }),
          onCouncilTap: (councilId) => setState(() {
            _currentIndex = 3;
            _activeCouncilId = councilId;
          }),
        );
      case 1:
        if (_attendanceActiveTourId != null) {
          final tour = appState.lecturerTours.firstWhere((t) => t.id == _attendanceActiveTourId);
          return DiemDanhSVGVScreen(tour: tour, onBack: () => setState(() => _attendanceActiveTourId = null));
        }
        return LichDanDoanGVScreen(onTourTap: (tourId) => setState(() => _attendanceActiveTourId = tourId));
      case 2:
        if (_gradingActiveStudentId != null) {
          final student = appState.lecturerStudents.firstWhere((s) => s.id == _gradingActiveStudentId);
          return ChamBaiThuHoachGVScreen(
            student: student,
            onGradeSaved: () {
              setState(() {
                _gradingActiveStudentId = null;
              });
            },
          );
        }
        return SinhVienHuongDanGVScreen(onStudentTap: (studentId) => setState(() => _gradingActiveStudentId = studentId));
      case 3:
        if (_activeCouncilId != null) {
          final council = appState.councilSessions.firstWhere((c) => c.id == _activeCouncilId);
          return HoiDongGradingQueueScreen(session: council, onBack: () => setState(() => _activeCouncilId = null));
        }
        return HoiDongChamBaoCaoDSBuoiGVScreen(onCouncilTap: (councilId) => setState(() => _activeCouncilId = councilId));
      case 4:
        return _buildMoreMenu(appState, appStateProvider);
      default:
        return DashboardGVScreen(
          onTourTap: (tourId) => setState(() {
            _currentIndex = 1;
            _attendanceActiveTourId = tourId;
          }),
          onStudentTap: (studentId) => setState(() {
            _currentIndex = 2;
            _gradingActiveStudentId = studentId;
          }),
          onCouncilTap: (councilId) => setState(() {
            _currentIndex = 3;
            _activeCouncilId = councilId;
          }),
        );
    }
  }

  Widget _buildNotificationsSubScreen(AppState appState, AppStateProviderState appStateProvider) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: appState.lecturerNotifications.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Thông báo đã nhận',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                TextButton.icon(
                  onPressed: () {
                    appStateProvider.markAllLecturerNotificationsRead();
                  },
                  icon: const Icon(Icons.done_all, size: 16),
                  label: const Text('Đọc tất cả', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          );
        }

        final notif = appState.lecturerNotifications[index - 1];
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
                    if (notif.isUnread)
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
                              fontWeight: notif.isUnread ? FontWeight.bold : FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            notif.time,
                            style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  notif.body,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade700, height: 1.4),
                ),
                if (notif.attachment != null) ...[
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Đang tải tài liệu: ${notif.attachment}...')),
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
                  backgroundImage: NetworkImage(appState.lecturerProfile.avatar),
                ),
                const SizedBox(height: 12),
                Text(
                  appState.lecturerProfile.name,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                ),
                Text(
                  appState.lecturerProfile.email,
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text('Thông tin chi tiết', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          _buildInfoRow('Mã số giảng viên:', appState.lecturerProfile.teacherId),
          _buildInfoRow('Khoa:', 'Công nghệ Thực phẩm'),
          _buildInfoRow('Bộ môn phân công:', appState.lecturerProfile.department),
          const Divider(height: 36),

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
          title: 'Hồ sơ giảng viên',
          desc: 'Thông tin học hàm học vị, mã số giảng viên, đổi mật khẩu',
          icon: Icons.person,
          onTap: () => setState(() => _profileSubScreen = true),
        ),
        const SizedBox(height: 12),
        _buildMenuCard(
          title: 'Hộp thư thông báo',
          desc: 'Xem lại các chỉ thị, thông báo chung của bộ môn & khoa',
          icon: Icons.campaign,
          onTap: () => setState(() => _notificationSubScreen = true),
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
