import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';

class KetQuaDiemSVScreen extends StatelessWidget {
  const KetQuaDiemSVScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;
    final completedTrips = appState.studentTrips.where((t) => t.isCompleted).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              children: [
                const Text(
                  'Điểm tổng kết học phần',
                  style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  '8.4',
                  style: TextStyle(color: Colors.white, fontSize: 44, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.secondary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Đạt',
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text(
            'Chi tiết điểm các chuyến đi',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
          ),
          const SizedBox(height: 12),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: completedTrips.length,
            itemBuilder: (context, index) {
              final trip = completedTrips[index];
              final hasGrade = trip.gradeDetails != null;

              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              trip.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ),
                          if (hasGrade)
                            Text(
                              '${trip.gradeDetails!.total}',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.warning.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Đang chờ khóa điểm',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${trip.type} • ${trip.date}',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                      if (hasGrade) ...[
                        const Divider(height: 24),
                        GridView.count(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisCount: 2,
                          childAspectRatio: 3.5,
                          children: [
                            _buildGradeComponent('Điểm chuẩn bị', '${trip.gradeDetails!.preparation}'),
                            _buildGradeComponent('Bài thu hoạch', '${trip.gradeDetails!.report}'),
                            _buildGradeComponent('Báo cáo TQNM', '${trip.gradeDetails!.evaluation}'),
                            _buildGradeComponent('Điểm cộng', '+${trip.gradeDetails!.bonus}'),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildGradeComponent(String label, String score) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        Text(score, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
      ],
    );
  }
}
