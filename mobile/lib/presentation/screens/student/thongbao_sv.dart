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
  String _resolveUrl(String? fileUrl, String? attachmentName) {
    final target = fileUrl ?? attachmentName ?? '';
    if (target.startsWith('http://') || target.startsWith('https://')) {
      return target;
    }
    // Android emulator mapping: localhost -> 10.0.2.2 or current baseUrl
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

  Widget _buildTypeBadge(String? type) {
    String label = 'Thông báo';
    Color textColor = const Color(0xFF455A64);
    Color bgColor = const Color(0xFFECEFF1);
    IconData icon = Icons.campaign_outlined;

    switch (type) {
      case 'NhacNho':
        label = 'Nhắc nhở';
        textColor = const Color(0xFFE65100);
        bgColor = const Color(0xFFFFF3E0);
        icon = Icons.alarm_on;
        break;
      case 'CanhBao':
        label = 'Cảnh báo';
        textColor = const Color(0xFFC62828);
        bgColor = const Color(0xFFFFEBEE);
        icon = Icons.warning_amber_rounded;
        break;
      case 'TaiChinh':
        label = 'Tài chính';
        textColor = const Color(0xFF2E7D32);
        bgColor = const Color(0xFFE8F5E9);
        icon = Icons.account_balance_wallet_outlined;
        break;
      case 'PhanCong':
        label = 'Phân công';
        textColor = const Color(0xFF512DA8);
        bgColor = const Color(0xFFEDE7F6);
        icon = Icons.assignment_ind_outlined;
        break;
      case 'ChuyenDi':
        label = 'Chuyến đi';
        textColor = const Color(0xFF0277BD);
        bgColor = const Color(0xFFE1F5FE);
        icon = Icons.directions_bus_outlined;
        break;
      default:
        label = 'Thông báo';
        textColor = const Color(0xFF455A64);
        bgColor = const Color(0xFFECEFF1);
        icon = Icons.campaign_outlined;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: textColor.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: textColor),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: textColor),
          ),
        ],
      ),
    );
  }

  void _showDetailDialog(BuildContext context, StudentNotification notif) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTypeBadge(notif.type),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  notif.title,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.access_time, size: 13, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Text(
                          notif.timeText,
                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                    if (notif.senderName != null)
                      Text(
                        notif.senderName!,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                      ),
                  ],
                ),
                if (notif.isEdited) ...[
                  const SizedBox(height: 2),
                  const Text('(Đã chỉnh sửa)', style: TextStyle(fontSize: 10, fontStyle: FontStyle.italic, color: Colors.grey)),
                ],
                const SizedBox(height: 12),
                Text(
                  notif.content,
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
    final allNotifs = appState.studentNotifications;

    return RefreshIndicator(
      onRefresh: () async {
        if (ApiService.userId != null) {
          await AppStateProvider.of(context).fetchStudentDataFromApi(ApiService.userId!);
        }
      },
      child: Column(
        children: [
          const SizedBox(height: 8),
          Expanded(
            child: PaginatedList<StudentNotification>(
              items: allNotifs,
              searchHint: 'Tìm kiếm thông báo, người gửi...',
              dropdownTitle: 'Loại',
              dropdownOptions: const ['Tất cả', 'Nhắc nhở', 'Tài chính', 'Cảnh báo', 'Chuyến đi', 'Thông báo'],
              itemName: 'thông báo',
              filter: (n, query, filterType) {
                final q = query.toLowerCase();
                final matchQuery = n.title.toLowerCase().contains(q) || 
                       n.content.toLowerCase().contains(q) ||
                       (n.senderName?.toLowerCase().contains(q) ?? false);
                if (!matchQuery) return false;
                if (filterType == 'Tất cả') return true;
                if (filterType == 'Nhắc nhở') return n.type == 'NhacNho';
                if (filterType == 'Tài chính') return n.type == 'TaiChinh';
                if (filterType == 'Cảnh báo') return n.type == 'CanhBao';
                if (filterType == 'Chuyến đi') return n.type == 'ChuyenDi';
                if (filterType == 'Thông báo') return n.type == 'ThongBao' || n.type == null;
                return true;
              },
              itemBuilder: (notif) => _buildNotificationCard(context, notif),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(BuildContext context, StudentNotification notif) {
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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildTypeBadge(notif.type),
                  Text(
                    notif.timeText,
                    style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                notif.title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              if (notif.senderName != null) ...[
                const SizedBox(height: 2),
                Text(
                  'Đơn vị: ${notif.senderName}',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary),
                ),
              ],
              const SizedBox(height: 8),
              Text(
                notif.content,
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
                      color: AppColors.primary.withValues(alpha: 0.08),
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
