import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';
import '../../widgets/paginated_list.dart';

class SinhVienHuongDanGVScreen extends StatefulWidget {
  final Function(String) onStudentTap;

  const SinhVienHuongDanGVScreen({
    super.key,
    required this.onStudentTap,
  });

  @override
  State<SinhVienHuongDanGVScreen> createState() => _SinhVienHuongDanGVScreenState();
}

class _SinhVienHuongDanGVScreenState extends State<SinhVienHuongDanGVScreen> {
  String _filter = 'all'; // 'all', 'graded', 'ungraded'
  bool _isLocking = false;

  Future<void> _lockAllGuidedReports(int dotKienTapId) async {
    final appStateProvider = AppStateProvider.of(context);
    final uncompleteCount = appStateProvider.state.lecturerStudents.where((s) => s.papersLeft > 0).length;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Khóa điểm toàn đợt', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Text(
          uncompleteCount > 0
              ? 'Hiện còn $uncompleteCount sinh viên chưa hoàn tất việc chấm điểm bài thu hoạch. Bạn có chắc chắn muốn khóa điểm toàn bộ đợt kiến tập không?'
              : 'Bạn có chắc chắn muốn khóa toàn bộ điểm bài thu hoạch đợt kiến tập này? Sau khi khóa, điểm sẽ được chuyển đến Hội đồng và Khoa để tổng kết.',
          style: const TextStyle(fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('HỦY', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger, foregroundColor: Colors.white),
            child: const Text('XÁC NHẬN KHÓA'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      setState(() => _isLocking = true);
      try {
        await appStateProvider.lockGuidedReportsGrades(dotKienTapId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã khóa điểm toàn đợt thành công! Điểm đã được gửi lên Khoa.'),
              backgroundColor: AppColors.secondary,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Lỗi khóa điểm: $e'), backgroundColor: AppColors.danger),
          );
        }
      } finally {
        if (mounted) {
          setState(() => _isLocking = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final allStudents = appState.lecturerStudents;
    final filtered = allStudents.where((s) {
      if (_filter == 'graded') return s.papersLeft == 0;
      if (_filter == 'ungraded') return s.papersLeft > 0;
      return true;
    }).toList();

    return Column(
      children: [
        // Filter Chips Row & Lock Button
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          color: Colors.white,
          child: Column(
            children: [
              Row(
                children: [
                  _buildFilterTab('all', 'Tất cả (${allStudents.length})'),
                  const SizedBox(width: 8),
                  _buildFilterTab('graded', 'Đã chấm đủ'),
                  const SizedBox(width: 8),
                  _buildFilterTab('ungraded', 'Chưa xong'),
                ],
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _isLocking ? null : () {
                    final students = AppStateProvider.of(context).state.lecturerStudents;
                    final dotId = students.map((s) => s.dotKienTapId).firstWhere((id) => id != null && id > 0, orElse: () => 2) ?? 2;
                    _lockAllGuidedReports(dotId);
                  },
                  icon: _isLocking
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: AppColors.danger, strokeWidth: 2))
                      : const Icon(Icons.lock_outline, size: 16, color: AppColors.danger),
                  label: const Text('KHÓA ĐIỂM TOÀN ĐỢT KIẾN TẬP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.danger)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.danger),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
            ],
          ),
        ),

        Expanded(
          child: PaginatedList<LecturerStudent>(
            items: filtered,
            searchHint: 'Tìm theo MSSV/họ tên',
            dropdownTitle: 'Trạng thái',
            dropdownOptions: const ['Tất cả'],
            itemName: 'sinh viên',
            verticalFilters: false,
            filter: (student, query, dot) {
              final matchQuery = student.name.toLowerCase().contains(query.toLowerCase()) ||
                  student.id.toLowerCase().contains(query.toLowerCase());
              return matchQuery;
            },
            itemBuilder: (student) {
              final parts = student.completedTours.split('/');
              final isCompletedTours = parts.length == 2 && parts[0] == parts[1];
              final isFullyGraded = student.papersLeft == 0;

              return Card(
                margin: const EdgeInsets.only(bottom: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                  side: const BorderSide(color: AppColors.beigeBorder),
                ),
                elevation: 0,
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(14.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                            backgroundImage: (student.avatar.isNotEmpty && (student.avatar.startsWith('http://') || student.avatar.startsWith('https://')))
                                ? NetworkImage(student.avatar)
                                : null,
                            radius: 22,
                            onBackgroundImageError: (student.avatar.isNotEmpty && (student.avatar.startsWith('http://') || student.avatar.startsWith('https://')))
                                ? (_, _) {}
                                : null,
                            child: (student.avatar.isEmpty || (!student.avatar.startsWith('http://') && !student.avatar.startsWith('https://')))
                                ? const Icon(Icons.person, size: 22, color: AppColors.primary)
                                : null,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(student.id.contains('_') ? student.id.split('_').first : student.id, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppColors.primary)),
                                Text(student.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkSlate)),
                                Text('Lớp: ${student.className} • ${student.company}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isCompletedTours ? AppColors.secondary.withValues(alpha: 0.15) : AppColors.warning.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Chuyến: ${student.completedTours}',
                              style: TextStyle(
                                fontSize: 10,
                                color: isCompletedTours ? AppColors.primary : AppColors.darkSlate,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isFullyGraded ? AppColors.secondary.withValues(alpha: 0.15) : AppColors.danger.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              isFullyGraded ? 'Đã chấm đủ' : 'Còn ${student.papersLeft} bài',
                              style: TextStyle(
                                fontSize: 10,
                                color: isFullyGraded ? AppColors.primary : AppColors.danger,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      ElevatedButton.icon(
                        onPressed: () => widget.onStudentTap(student.id),
                        icon: const Icon(Icons.edit_note, size: 16),
                        label: const Text('Xem & chấm bài', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFilterTab(String filterKey, String label) {
    final isActive = _filter == filterKey;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _filter = filterKey),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: isActive ? Colors.white : AppColors.darkSlate,
            ),
          ),
        ),
      ),
    );
  }
}
