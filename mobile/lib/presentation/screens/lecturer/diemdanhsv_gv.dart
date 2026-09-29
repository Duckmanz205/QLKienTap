import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';
import '../../widgets/paginated_list.dart';

class DiemDanhSVGVScreen extends StatefulWidget {
  final LecturerTour? initialTour;
  final VoidCallback? onBack;

  const DiemDanhSVGVScreen({
    super.key,
    this.initialTour,
    this.onBack,
  });

  @override
  State<DiemDanhSVGVScreen> createState() => _DiemDanhSVGVScreenState();
}

class _DiemDanhSVGVScreenState extends State<DiemDanhSVGVScreen> {
  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final initialTourName = widget.initialTour != null 
        ? widget.initialTour!.name 
        : (appState.lecturerTours.isNotEmpty ? appState.lecturerTours.first.name : null);

    final dropdownOptions = appState.lecturerTours.map((t) => t.name).toList();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      body: PaginatedList<LecturerStudent>(
        items: appState.lecturerStudents,
        searchHint: 'Tìm theo MSSV/họ tên',
        dropdownTitle: 'Chọn chuyến tham quan',
        dropdownOptions: dropdownOptions.isNotEmpty ? dropdownOptions : ['Không có'],
        initialDropdownValue: initialTourName,
        verticalFilters: true,
        filter: (student, query, tourName) {
          if (appState.lecturerTours.isEmpty) return false;
          final tour = appState.lecturerTours.firstWhere((t) => t.name == tourName, orElse: () => appState.lecturerTours.first);
          final matchTour = student.tourId == tour.id;
          final matchQuery = student.name.toLowerCase().contains(query.toLowerCase()) || 
                             student.id.toLowerCase().contains(query.toLowerCase());
          return matchTour && matchQuery;
        },
        headerWidgetBuilder: (filteredItems) {
          final presentCount = filteredItems.where((s) => s.attendanceStatus == 'present').length;
          final totalCount = filteredItems.length;
          return Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                OutlinedButton(
                  onPressed: () {
                    for (var student in filteredItems) {
                      appStateProvider.updateAttendance(student.id, 'present');
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.primary, width: 1.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    minimumSize: Size.zero,
                  ),
                  child: const Text('Đánh dấu tất cả Có mặt', style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
                Text('$presentCount/$totalCount đã điểm danh', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
              ],
            ),
          );
        },
        itemBuilder: (student) {
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.grey.shade200),
            ),
            elevation: 0,
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('MSSV: ${student.id}', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                                  const SizedBox(height: 4),
                                  Text(student.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                ],
                              ),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                _buildStatusIcon(
                                  icon: Icons.check, 
                                  isActive: student.attendanceStatus == 'present', 
                                  onTap: () => appStateProvider.updateAttendance(student.id, 'present')
                                ),
                                _buildStatusIcon(
                                  icon: Icons.close, 
                                  isActive: student.attendanceStatus == 'absent', 
                                  onTap: () => appStateProvider.updateAttendance(student.id, 'absent')
                                ),
                                _buildStatusIcon(
                                  icon: Icons.block, 
                                  isActive: student.attendanceStatus == 'excused', 
                                  onTap: () {
                                    appStateProvider.updateAttendance(student.id, 'excused');
                                    _showExcuseDialog(context, student.id, student.excuseReason, appStateProvider);
                                  }
                                ),
                              ],
                            ),
                          ],
                        ),
                        if (student.attendanceStatus == 'excused' || student.attendanceStatus == 'absent') ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                const Text('Lý do: ', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                Expanded(
                                  child: Text(
                                    student.excuseReason ?? 'Bị ốm', 
                                    style: const TextStyle(fontSize: 11, color: AppColors.darkSlate)
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          if (widget.onBack != null) widget.onBack!();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã lưu dữ liệu điểm danh!'), backgroundColor: AppColors.secondary),
          );
        },
        backgroundColor: AppColors.primary,
        elevation: 4,
        shape: const CircleBorder(),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
            Text('LƯU', style: TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusIcon({required IconData icon, required bool isActive, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(left: 4),
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: isActive ? Colors.grey.shade200 : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Icon(
          icon,
          size: 20,
          color: isActive ? AppColors.darkSlate : Colors.grey.shade400,
        ),
      ),
    );
  }

  void _showExcuseDialog(BuildContext context, String studentId, String? currentReason, AppStateProviderState appStateProvider) {
    final controller = TextEditingController(text: currentReason);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nhập lý do vắng/phép', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'VD: Bị ốm, Việc gia đình...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            onPressed: () {
              appStateProvider.updateAttendance(studentId, 'excused', reason: controller.text);
              Navigator.pop(ctx);
            },
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
  }
}
