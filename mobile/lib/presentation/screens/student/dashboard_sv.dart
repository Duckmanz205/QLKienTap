import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';

class DashboardSVScreen extends StatelessWidget {
  final Function(String) onTripTap;
  final VoidCallback onNotifTap;

  const DashboardSVScreen({
    super.key,
    required this.onTripTap,
    required this.onNotifTap,
  });

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final registeredCount = appState.studentTrips.where((t) => t.isRegistered).length;
    final completedCount = appState.studentTrips.where((t) => t.isCompleted).length;
    final pendingSubmissionsCount = appState.submissions.where((s) => s.status != 'Đã nộp').length;
    
    final completedWithGrades = appState.studentTrips.where((t) => t.isCompleted && t.gradeDetails != null).toList();
    double gpa = 0.0;
    if (completedWithGrades.isNotEmpty) {
      final totalScore = completedWithGrades.map((t) => t.gradeDetails!.total).reduce((a, b) => a + b);
      gpa = totalScore / completedWithGrades.length;
    } else {
      gpa = 8.7;
    }

    final upcomingTrips = appState.studentTrips.where((t) => t.isRegistered && !t.isCompleted).toList();
    final recentNotifications = appState.studentNotifications.take(3).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: [
              _buildStatCard('Chuyến đã đăng ký', '$registeredCount', AppColors.primary, Colors.white),
              _buildStatCard('Đã hoàn thành', '$completedCount', AppColors.secondary, Colors.white),
              _buildStatCard(
                'Bài cần nộp',
                '$pendingSubmissionsCount',
                pendingSubmissionsCount > 0 ? AppColors.warning : Colors.grey.shade400,
                AppColors.darkSlate,
              ),
              _buildStatCard('Điểm TB', gpa.toStringAsFixed(1), AppColors.primary, Colors.white, isLargeNum: true),
            ],
          ),
          const SizedBox(height: 24),

          const Text(
            'Chuyến sắp tới',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
          ),
          const SizedBox(height: 8),
          if (upcomingTrips.isEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Không có chuyến tham quan nào sắp tới.',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ),
            )
          else
            SizedBox(
              height: 140,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: upcomingTrips.length,
                itemBuilder: (context, index) {
                  final trip = upcomingTrips[index];
                  return Container(
                    width: 260,
                    margin: const EdgeInsets.only(right: 12),
                    child: Card(
                      child: InkWell(
                        onTap: () => onTripTap(trip.id),
                        borderRadius: BorderRadius.circular(20),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    trip.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.calendar_today, size: 12, color: AppColors.textMuted),
                                      const SizedBox(width: 4),
                                      Text(trip.date, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                    ],
                                  ),
                                ],
                              ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: trip.type == 'Trực tiếp'
                                          ? AppColors.primary.withValues(alpha: 0.1)
                                          : AppColors.secondary.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      trip.type,
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: trip.type == 'Trực tiếp' ? AppColors.primary : AppColors.secondary,
                                      ),
                                    ),
                                  ),
                                  const Text(
                                    'Chi tiết →',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          const SizedBox(height: 24),

          const Text(
            'Thông báo gần đây',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
          ),
          const SizedBox(height: 8),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: recentNotifications.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final notif = recentNotifications[index];
              return Card(
                child: ListTile(
                  onTap: () {
                    appStateProvider.markStudentNotificationRead(notif.id);
                    onNotifTap();
                  },
                  leading: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: AppColors.appBackground,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.campaign, size: 20, color: AppColors.primary),
                      ),
                      if (!notif.isRead)
                        Positioned(
                          top: 0,
                          right: 0,
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.warning,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                    ],
                  ),
                  title: Text(
                    notif.title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: notif.isRead ? FontWeight.w500 : FontWeight.bold,
                    ),
                  ),
                  subtitle: Text(
                    notif.content,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
                  trailing: Text(
                    notif.timeText,
                    style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String val, Color bgColor, Color textColor, {bool isLargeNum = false}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: textColor.withValues(alpha: 0.85),
            ),
          ),
          Text(
            val,
            style: TextStyle(
              fontSize: isLargeNum ? 28 : 24,
              fontWeight: FontWeight.w900,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
