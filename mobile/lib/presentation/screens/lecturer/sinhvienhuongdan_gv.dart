import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
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

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final allStudents = appState.lecturerStudents;
    final filteredStudents = allStudents.where((s) {
      if (_filter == 'graded') return s.isGraded;
      if (_filter == 'ungraded') return !s.isGraded;
      return true; // 'all'
    }).toList();

    return Column(
      children: [
        Expanded(
          child: PaginatedList<dynamic>(
            items: allStudents,
            searchHint: 'Tìm theo MSSV/họ tên',
            dropdownTitle: 'Lịch kiến tập',
            dropdownOptions: const ['Đợt 1 - Học kỳ 1 (2023-2024)', 'Đợt 2 - Học kỳ 1 (2023-2024)'],
            itemName: 'sinh viên',
            verticalFilters: true,
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
                margin: const EdgeInsets.only(bottom: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.grey.shade200),
                ),
                elevation: 0,
                color: Colors.white,
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
                                Text(student.id, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF3B711A))),
                                Text(student.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.black87)),
                                Text('Lớp: ${student.className}', style: const TextStyle(fontSize: 11, color: Colors.black54)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: isCompletedTours ? const Color(0xFF8CB654) : const Color(0xFFD7CD61),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isCompletedTours ? Icons.check_circle : Icons.more_horiz,
                                size: 12,
                                color: isCompletedTours ? Colors.white : const Color(0xFF333333),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Số chuyến hoàn thành: ${student.completedTours}',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: isCompletedTours ? Colors.white : const Color(0xFF333333),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: isFullyGraded ? const Color(0xFF8CB654) : const Color(0xFFD7CD61),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isFullyGraded ? Icons.assignment_turned_in : Icons.warning_amber_rounded,
                                size: 12,
                                color: isFullyGraded ? Colors.white : const Color(0xFF333333),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                isFullyGraded ? 'Đã chấm đủ' : 'Còn ${student.papersLeft} bài',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: isFullyGraded ? Colors.white : const Color(0xFF333333),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => widget.onStudentTap(student.id),
                        icon: const Icon(Icons.edit_note, size: 16),
                        label: const Text('Xem & chấm', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF457B3B),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
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
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? AppColors.secondary : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
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
