import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';

class LichDanDoanGVScreen extends StatelessWidget {
  final Function(String) onTourTap;

  const LichDanDoanGVScreen({
    super.key,
    required this.onTourTap,
  });

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: appState.lecturerTours.length,
      itemBuilder: (context, index) {
        final tour = appState.lecturerTours[index];
        final progress = tour.registeredCount / tour.maxCount;

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
                      child: Text(tour.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkSlate)),
                    ),
                    Icon(
                      tour.status == 'completed' ? Icons.check_circle : Icons.schedule,
                      color: tour.status == 'completed' ? AppColors.secondary : AppColors.primary,
                      size: 20,
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 12, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text('${tour.date}  •  ${tour.timeRange}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Đăng ký: ${tour.registeredCount}/${tour.maxCount} SV', style: const TextStyle(fontSize: 11, color: AppColors.darkSlate)),
                    Text('${(progress * 100).toInt()}%', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
                  ],
                ),
                const SizedBox(height: 4),
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                  borderRadius: BorderRadius.circular(4),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => onTourTap(tour.id),
                      icon: const Icon(Icons.how_to_reg, size: 16),
                      label: const Text('ĐIỂM DANH', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
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
}
