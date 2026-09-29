import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/state/app_state.dart';
import 'confirm_dialog.dart';

class AppDrawer extends StatelessWidget {
  final String role; // 'SinhVien' or 'GiangVien'
  final int currentIndex;
  final String? activeSubScreen;
  final void Function(int index, {String? subScreen}) onNavigate;

  const AppDrawer({
    super.key,
    required this.role,
    required this.currentIndex,
    this.activeSubScreen,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final String name = role == 'SinhVien'
        ? appState.studentProfile.name
        : appState.lecturerProfile.name;
    final String avatarUrl = role == 'SinhVien'
        ? appState.studentProfile.avatar
        : appState.lecturerProfile.avatar;
    final int notifCount = role == 'SinhVien'
        ? appState.studentNotifications.where((n) => !n.isRead).length
        : appState.lecturerNotifications.where((n) => n.isUnread).length;

    // Define menu items for each role
    final List<Map<String, dynamic>> menuItems = role == 'SinhVien'
        ? [
            {'icon': Icons.home, 'label': 'Trang chủ', 'category': 'TRANG CHỦ', 'index': 0},
            {'icon': Icons.explore, 'label': 'Chuyến tham quan', 'category': 'KIẾN TẬP CỦA TÔI', 'index': 1},
            {'icon': Icons.calendar_month, 'label': 'Lịch trình đoàn', 'category': 'KIẾN TẬP CỦA TÔI', 'subScreen': 'schedule', 'index': 4},
            {'icon': Icons.upload_file, 'label': 'Nộp bài thu hoạch', 'category': 'KIẾN TẬP CỦA TÔI', 'index': 2},
            {'icon': Icons.school, 'label': 'Kết quả & điểm', 'category': 'KIẾN TẬP CỦA TÔI', 'index': 3},
            {'icon': Icons.payment, 'label': 'Thanh toán', 'category': 'TÀI CHÍNH', 'subScreen': 'finance_payment', 'index': 4},
            {'icon': Icons.money_off, 'label': 'Hoàn phí', 'category': 'TÀI CHÍNH', 'subScreen': 'finance_refund', 'index': 4},
            {'icon': Icons.notifications, 'label': 'Thông báo', 'category': 'THÔNG BÁO', 'subScreen': 'notifications', 'badge': notifCount, 'index': 4},
          ]
        : [
            {'icon': Icons.home_outlined, 'label': 'Trang chủ', 'category': 'TRANG CHỦ', 'index': 0},
            {'icon': Icons.calendar_month, 'label': 'Lịch dẫn đoàn', 'category': 'DẪN ĐOÀN', 'index': 1},
            {'icon': Icons.person_outline, 'label': 'Điểm danh sinh viên', 'category': 'DẪN ĐOÀN', 'subScreen': 'attendance', 'index': 1},
            {'icon': Icons.star_border, 'label': 'Điểm chuẩn bị & Cộng', 'category': 'DẪN ĐOÀN', 'subScreen': 'grading_prep', 'index': 2},
            {'icon': Icons.person_outline, 'label': 'Sinh viên hướng dẫn', 'category': 'HƯỚNG DẪN', 'index': 2},
            {'icon': Icons.tv_outlined, 'label': 'Buổi báo cáo TQNM', 'category': 'HỘI ĐỒNG', 'index': 3},
            {'icon': Icons.notifications_none, 'label': 'Thông báo', 'category': 'THÔNG BÁO', 'subScreen': 'notifications', 'badge': notifCount, 'index': 4},
          ];

    // Group items by category
    final Map<String, List<Map<String, dynamic>>> groupedMenu = {};
    for (var item in menuItems) {
      final cat = item['category'] as String;
      if (!groupedMenu.containsKey(cat)) groupedMenu[cat] = [];
      groupedMenu[cat]!.add(item);
    }

    return Drawer(
      backgroundColor: AppColors.primary,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20),
              width: double.infinity,
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.1))),
              ),
              child: Column(
                children: [
                  Image.asset(
                    'assets/images/huit_logo.png',
                    height: 50,
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'QUẢN LÝ KIẾN TẬP',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                      letterSpacing: 1.2,
                    ),
                  ),
                  Text(
                    'HUIT — ${role == 'SinhVien' ? 'KHOA CNTP' : 'GIẢNG VIÊN'}',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontWeight: FontWeight.w600,
                      fontSize: 10,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
            ),

            // Menu Items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 16),
                children: groupedMenu.entries.map((entry) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 20, top: 10, bottom: 8),
                        child: Text(
                          entry.key,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.5),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                      ...entry.value.map((item) {
                        final bool isIndexActive = currentIndex == item['index'];
                        final bool isSubScreenActive = item['subScreen'] != null ? activeSubScreen == item['subScreen'] : activeSubScreen == null;
                        
                        // For the main menu, only highlight if both index and subscreen conditions match perfectly
                        final bool isActive = isIndexActive && isSubScreenActive;
                        
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                          child: InkWell(
                            onTap: () {
                              Navigator.pop(context); // Close drawer
                              // In a real app we might navigate to a named route, but here we update index
                              // and potentially set a sub-screen. For now, just trigger onNavigate.
                              // We would need to pass subScreen info to the parent if applicable.
                              onNavigate(item['index'] as int, subScreen: item['subScreen'] as String?); 
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: isActive ? Colors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    item['icon'],
                                    size: 20,
                                    color: isActive ? AppColors.primary : Colors.white.withOpacity(0.8),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Text(
                                      item['label'],
                                      style: TextStyle(
                                        color: isActive ? AppColors.primary : Colors.white.withOpacity(0.8),
                                        fontSize: 13,
                                        fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  if (item['badge'] != null && (item['badge'] as int) > 0)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppColors.warning,
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        '${item['badge']}',
                                        style: const TextStyle(
                                          color: Colors.black87,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),
                      const SizedBox(height: 8),
                    ],
                  );
                }).toList(),
              ),
            ),

            // Footer (User Info & Logout)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.1),
                border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: Colors.white,
                        backgroundImage: NetworkImage(avatarUrl),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              role == 'SinhVien' ? 'Sinh viên' : 'Giảng viên',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.7),
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final confirm = await ConfirmDialog.show(
                          context,
                          title: 'Đăng xuất',
                          message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
                          isDestructive: true,
                        );
                        if (confirm == true) {
                          appStateProvider.logout();
                        }
                      },
                      icon: const Icon(Icons.logout, size: 18),
                      label: const Text('Đăng xuất'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red[300],
                        side: BorderSide(color: Colors.red.withOpacity(0.3)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
