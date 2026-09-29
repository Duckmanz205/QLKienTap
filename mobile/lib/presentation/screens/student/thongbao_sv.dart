import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';
import '../../../data/models/app_models.dart';
import '../../widgets/paginated_list.dart';

class ThongBaoSVScreen extends StatefulWidget {
  const ThongBaoSVScreen({super.key});

  @override
  State<ThongBaoSVScreen> createState() => _ThongBaoSVScreenState();
}

class _ThongBaoSVScreenState extends State<ThongBaoSVScreen> {
  String _activeTab = 'all'; // 'all' or 'unread'

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final allNotifs = appState.studentNotifications;
    final unreadNotifs = allNotifs.where((n) => !n.isRead).toList();
    final displayNotifs = _activeTab == 'all' ? allNotifs : unreadNotifs;

    return Column(
      children: [
        // Tab switcher
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              _buildTab('all', 'Tất cả (${allNotifs.length})'),
              _buildTab('unread', 'Chưa đọc (${unreadNotifs.length})'),
            ],
          ),
        ),

        if (unreadNotifs.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(right: 16, bottom: 8),
            child: Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: () async {
                  try {
                    await ApiService.post('sinh-vien/mark-all-read', {'userId': ApiService.userId});
                    // Locally mark all read
                    appStateProvider.markAllStudentNotificationsRead();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Đã đánh dấu tất cả là đã đọc')),
                    );
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Lỗi: $e'), backgroundColor: AppColors.danger),
                    );
                  }
                },
                icon: const Icon(Icons.done_all, size: 16),
                label: const Text('Đánh dấu tất cả đã đọc', style: TextStyle(fontSize: 12)),
              ),
            ),
          ),

        Expanded(
          child: PaginatedList<StudentNotification>(
            items: displayNotifs,
            searchHint: 'Tìm kiếm thông báo...',
            dropdownTitle: 'Loại',
            dropdownOptions: const ['Tất cả'],
            itemName: 'thông báo',
            filter: (n, query, type) {
              return n.title.toLowerCase().contains(query.toLowerCase()) || 
                     n.content.toLowerCase().contains(query.toLowerCase());
            },
            itemBuilder: (notif) => _buildNotificationCard(context, notif, appStateProvider),
          ),
        ),
      ],
    );
  }

  Widget _buildTab(String tabKey, String label) {
    final isActive = _activeTab == tabKey;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTab = tabKey),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? AppColors.secondary : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isActive ? Colors.white : AppColors.darkSlate,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationCard(BuildContext context, StudentNotification notif, AppStateProviderState appStateProvider) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          if (!notif.isRead) {
            appStateProvider.markStudentNotificationRead(notif.id);
          }
        },
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
                  onTap: () async {
                    final urlStr = notif.attachment!.startsWith('http')
                        ? notif.attachment!
                        : '${ApiService.baseUrl}/upload/file/attachments/${notif.attachment}';
                    final uri = Uri.parse(urlStr);

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Đang tải xuống tệp: ${notif.attachment}...')),
                    );

                    try {
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                      } else {
                        throw 'Không thể khởi chạy đường dẫn';
                      }
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Lỗi tải xuống tệp: $e'),
                          backgroundColor: AppColors.danger,
                        ),
                      );
                    }
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
      ),
    );
  }
}
