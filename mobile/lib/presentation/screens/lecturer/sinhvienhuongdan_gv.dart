import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';

class SinhVienHuongDanGVScreen extends StatelessWidget {
  final Function(String) onStudentTap;

  const SinhVienHuongDanGVScreen({
    super.key,
    required this.onStudentTap,
  });

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: appState.lecturerStudents.length,
      itemBuilder: (context, index) {
        final student = appState.lecturerStudents[index];

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    CircleAvatar(backgroundImage: NetworkImage(student.avatar), radius: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(student.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text('Lớp: ${student.className} • MSSV: ${student.id}', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: student.isGraded ? AppColors.secondary.withValues(alpha: 0.1) : AppColors.warning.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        student.isGraded ? 'Đã chấm' : 'Chưa chấm',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: student.isGraded ? AppColors.secondary : AppColors.darkSlate,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildInfoRow('Doanh nghiệp thực tập:', student.company),
                _buildInfoRow('Số chuyến hoàn thành:', student.completedTours),
                _buildInfoRow('Ngày nộp báo cáo:', student.submittedDate),
                if (student.isGraded) ...[
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Điểm GVHD chấm:', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                      Text('${student.gvhdGrade}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.primary)),
                    ],
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        onStudentTap(student.id);
                      },
                      icon: const Icon(Icons.edit_note, size: 16),
                      label: Text(student.isGraded ? 'SỬA ĐIỂM' : 'CHẤM ĐIỂM', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: student.isGraded ? Colors.grey.shade100 : AppColors.primary,
                        foregroundColor: student.isGraded ? AppColors.darkSlate : Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
          Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.darkSlate)),
        ],
      ),
    );
  }
}
