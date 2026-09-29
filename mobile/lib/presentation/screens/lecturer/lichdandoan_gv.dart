import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';
import '../../widgets/paginated_list.dart';

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

    return PaginatedList<dynamic>(
      items: appState.lecturerTours,
      searchHint: 'Tìm chuyến đi...',
      dropdownTitle: 'Trạng thái',
      dropdownOptions: const ['Tất cả', 'completed', 'pending'],
      itemName: 'chuyến đi',
      filter: (tour, query, status) {
        final matchQuery = tour.name.toLowerCase().contains(query.toLowerCase());
        final matchStatus = status == 'Tất cả' || tour.status == status;
        return matchQuery && matchStatus;
      },
      itemBuilder: (tour) {
        final progress = tour.registeredCount / tour.maxCount;

        String statusText;
        Color statusBg;
        Color statusColor;

        if (tour.status == 'completed') {
          statusText = 'Đã hoàn thành';
          statusBg = const Color(0xFFE5E5CA); // Muted beige/grey
          statusColor = const Color(0xFF555555);
        } else if (tour.status == 'ongoing') {
          statusText = 'Đang diễn ra';
          statusBg = const Color(0xFF3B711A); // Dark green
          statusColor = Colors.white;
        } else {
          statusText = 'Sắp diễn ra';
          statusBg = const Color(0xFFDCD271); // Yellowish
          statusColor = const Color(0xFF333333);
        }

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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(tour.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.black87)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(statusText, style: TextStyle(fontSize: 10, color: statusColor, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.calendar_today, size: 14, color: Colors.grey.shade700),
                    const SizedBox(width: 6),
                    Text('${tour.date} | ${tour.timeRange}', style: TextStyle(fontSize: 12, color: Colors.grey.shade700)),
                  ],
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFFE9E5D3), borderRadius: BorderRadius.circular(4)),
                    child: const Text('Trực tiếp', style: TextStyle(fontSize: 10, color: Color(0xFF5A5A5A), fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Số SV đăng ký:', style: TextStyle(fontSize: 11, color: Colors.grey.shade700)),
                    Text('${tour.registeredCount}/${tour.maxCount}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87)),
                  ],
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 6,
                    backgroundColor: Colors.grey.shade300,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF3B711A)),
                  ),
                ),
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: () => onTourTap(tour.id),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF3B711A)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Xem chi tiết', style: TextStyle(color: Color(0xFF3B711A), fontWeight: FontWeight.bold, fontSize: 12)),
                      SizedBox(width: 6),
                      Icon(Icons.arrow_forward, size: 14, color: Color(0xFF3B711A)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
