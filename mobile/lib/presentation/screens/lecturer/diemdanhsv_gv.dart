import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';

class DiemDanhSVGVScreen extends StatelessWidget {
  final LecturerTour tour;
  final VoidCallback onBack;

  const DiemDanhSVGVScreen({
    super.key,
    required this.tour,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    // Filter student by tour (mock filter by tourId)
    final students = appState.lecturerStudents.where((s) => s.tourId == tour.id).toList();

    return Column(
      children: [
        // Tour metadata header
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(tour.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 4),
              Text('Tổng số sinh viên đăng ký: ${students.length} • Khởi hành: ${tour.timeRange}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
            ],
          ),
        ),

        // Students checklist
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: students.length,
            itemBuilder: (context, index) {
              final student = students[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(backgroundImage: NetworkImage(student.avatar), radius: 18),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(student.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                Text('MSSV: ${student.id} • ${student.className}', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildAttendanceButton(
                              label: 'Có mặt',
                              color: AppColors.secondary,
                              isActive: student.attendanceStatus == 'present',
                              onTap: () => appStateProvider.updateAttendance(student.id, 'present'),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildAttendanceButton(
                              label: 'Vắng',
                              color: AppColors.danger,
                              isActive: student.attendanceStatus == 'absent',
                              onTap: () => appStateProvider.updateAttendance(student.id, 'absent'),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildAttendanceButton(
                              label: 'Phép',
                              color: AppColors.warning,
                              isActive: student.attendanceStatus == 'excused',
                              onTap: () {
                                _showExcuseDialog(context, student.id, student.excuseReason, appStateProvider);
                              },
                            ),
                          ),
                        ],
                      ),
                      if (student.attendanceStatus == 'excused' && student.excuseReason != null) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(6)),
                          child: Text(
                            'Lý do: ${student.excuseReason}',
                            style: const TextStyle(fontSize: 10, fontStyle: FontStyle.italic, color: AppColors.darkSlate),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        // Confirm
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: ElevatedButton(
            onPressed: () {
              onBack();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã lưu dữ liệu điểm danh chuyến đi thành công!'), backgroundColor: AppColors.secondary),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('HOÀN TẤT & LƯU PHIẾU ĐIỂM DANH', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          ),
        ),
      ],
    );
  }

  Widget _buildAttendanceButton({required String label, required Color color, required bool isActive, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? color : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isActive ? color : Colors.grey.shade300),
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
    );
  }

  void _showExcuseDialog(BuildContext context, String studentId, String? currentReason, AppStateProviderState appStateProvider) {
    final controller = TextEditingController(text: currentReason);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Vắng có phép', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Nhập lý do vắng học',
            alignLabelWithHint: true,
          ),
          maxLines: 2,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              appStateProvider.updateAttendance(studentId, 'excused', reason: controller.text.trim());
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    ).then((_) => controller.dispose());
  }
}
