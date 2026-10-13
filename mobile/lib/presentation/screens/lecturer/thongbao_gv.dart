import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';
import '../../../data/models/app_models.dart';
import '../../../core/network/api_service.dart';
import '../../widgets/paginated_list.dart';

class ThongBaoGVScreen extends StatefulWidget {
  const ThongBaoGVScreen({super.key});

  @override
  State<ThongBaoGVScreen> createState() => _ThongBaoGVScreenState();
}

class _ThongBaoGVScreenState extends State<ThongBaoGVScreen> {
  String _resolveUrl(String? fileUrl, String? attachmentName) {
    final target = fileUrl ?? attachmentName ?? '';
    if (target.startsWith('http://') || target.startsWith('https://')) {
      return target;
    }
    final base = ApiService.baseUrl.replaceAll('/api', '');
    return '$base${target.startsWith('/') ? '' : '/'}$target';
  }

  Future<void> _openAttachment(BuildContext context, String? fileUrl, String? fileName) async {
    final urlStr = _resolveUrl(fileUrl, fileName);
    if (urlStr.isEmpty) return;
    final uri = Uri.parse(urlStr);

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Đang mở tệp: ${fileName ?? "tài liệu"}...')),
      );
    }

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        throw 'Không thể mở liên kết: $urlStr';
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi mở tệp: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    }
  }

  void _showDetailDialog(BuildContext context, LecturerNotification notif) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.notifications, color: AppColors.primary, size: 22),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  notif.title,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 14, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      notif.time,
                      style: const TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  notif.body,
                  style: const TextStyle(fontSize: 14, height: 1.5, color: Colors.black87),
                ),
                if (notif.attachment != null || notif.fileUrl != null) ...[
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 8),
                  const Text('Tệp đính kèm:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
                  const SizedBox(height: 6),
                  InkWell(
                    onTap: () => _openAttachment(context, notif.fileUrl, notif.attachment),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.attach_file, color: AppColors.primary, size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              notif.attachment ?? 'Tải tài liệu đính kèm',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const Icon(Icons.download, color: AppColors.primary, size: 18),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Đóng', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context).state;
    final allNotifs = appState.lecturerNotifications;

    return Column(
      children: [
        const SizedBox(height: 8),
        Expanded(
          child: PaginatedList<LecturerNotification>(
            items: allNotifs,
            searchHint: 'Tìm thông báo...',
            dropdownTitle: 'Bộ lọc',
            dropdownOptions: const ['Tất cả'],
            itemName: 'thông báo',
            filter: (notif, query, filterValue) {
              return notif.title.toLowerCase().contains(query.toLowerCase()) || 
                     notif.body.toLowerCase().contains(query.toLowerCase());
            },
            emptyWidget: const Center(child: Text('Không có thông báo nào.')),
            itemBuilder: (notif) {
              return _buildNotificationCard(context, notif);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildNotificationCard(BuildContext context, LecturerNotification notif) {
    final hasAttachment = notif.attachment != null || notif.fileUrl != null;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () => _showDetailDialog(context, notif),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          notif.title,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
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
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              if (hasAttachment) ...[
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () => _openAttachment(context, notif.fileUrl, notif.attachment),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.attach_file, size: 14, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            notif.attachment ?? 'Tệp đính kèm',
                            style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.download, size: 12, color: AppColors.primary),
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
