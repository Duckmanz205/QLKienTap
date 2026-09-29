import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';
import '../../widgets/paginated_list.dart';

class HoiDongChamBaoCaoDSBuoiGVScreen extends StatelessWidget {
  final Function(String) onCouncilTap;

  const HoiDongChamBaoCaoDSBuoiGVScreen({
    super.key,
    required this.onCouncilTap,
  });

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    return PaginatedList<dynamic>(
      items: appState.councilSessions,
      searchHint: 'Tìm phiên chấm...',
      dropdownTitle: 'Hội trường',
      dropdownOptions: const ['Tất cả', 'F.4.1', 'B.3.2'],
      itemName: 'phiên chấm',
      verticalFilters: false,
      headerWidgetBuilder: (filteredItems) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF3B711A), // Green
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Text(
                      'Danh sách buổi',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Text(
                      'Chấm điểm',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
      filter: (session, query, room) {
        final matchQuery = session.name.toLowerCase().contains(query.toLowerCase());
        final matchRoom = room == 'Tất cả' || session.room.contains(room);
        return matchQuery && matchRoom;
      },
      itemBuilder: (session) {
        // Determine styles based on status
        Color pillBgColor;
        Color pillTextColor;
        String pillText;
        Widget button;
        bool hasLeftBorder = false;

        if (session.status == 'upcoming') {
          pillBgColor = const Color(0xFFD7CD61);
          pillTextColor = Colors.black87;
          pillText = 'Sắp diễn ra';
          button = OutlinedButton(
            onPressed: () => onCouncilTap(session.id),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFF3B711A)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              minimumSize: const Size.fromHeight(40),
            ),
            child: const Text('VÀO CHẤM ĐIỂM', style: TextStyle(color: Color(0xFF3B711A), fontWeight: FontWeight.bold, fontSize: 11)),
          );
        } else if (session.status == 'ongoing') {
          pillBgColor = const Color(0xFF9CCC65); // Light green
          pillTextColor = Colors.black87;
          pillText = 'Đang diễn ra';
          hasLeftBorder = true;
          button = ElevatedButton(
            onPressed: () => onCouncilTap(session.id),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3B711A), // Dark green
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              minimumSize: const Size.fromHeight(40),
              elevation: 0,
            ),
            child: const Text('TIẾP TỤC CHẤM', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
          );
        } else {
          pillBgColor = Colors.grey.shade300;
          pillTextColor = Colors.black54;
          pillText = 'Đã hoàn thành';
          button = OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: Colors.grey.shade400),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              minimumSize: const Size.fromHeight(40),
            ),
            child: const Text('XEM KẾT QUẢ', style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold, fontSize: 11)),
          );
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (hasLeftBorder)
                  Container(
                    width: 4,
                    decoration: const BoxDecoration(
                      color: Color(0xFF8CB654),
                      borderRadius: BorderRadius.horizontal(left: Radius.circular(12)),
                    ),
                  ),
                Expanded(
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
                              child: Text(
                                session.name,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.black87),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: pillBgColor, borderRadius: BorderRadius.circular(12)),
                              child: Text(pillText, style: TextStyle(color: pillTextColor, fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Icon(Icons.calendar_today, size: 14, color: Colors.grey.shade600),
                            const SizedBox(width: 6),
                            Text('${session.timeRange} | ${session.date}', style: TextStyle(fontSize: 11, color: Colors.grey.shade700)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Icon(Icons.location_on_outlined, size: 14, color: Colors.grey.shade600),
                            const SizedBox(width: 6),
                            Text('Phòng ${session.room}', style: TextStyle(fontSize: 11, color: Colors.grey.shade700)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Icon(Icons.people_outline, size: 14, color: Colors.grey.shade600),
                            const SizedBox(width: 6),
                            Text('Số SV báo cáo: ', style: TextStyle(fontSize: 11, color: Colors.grey.shade700)),
                            Text('${session.studentCount}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        button,
                      ],
                    ),
                  ),
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

class HoiDongGradingQueueScreen extends StatelessWidget {
  final CouncilSession session;
  final VoidCallback onBack;

  const HoiDongGradingQueueScreen({
    super.key,
    required this.session,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(session.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 4),
              Text('Hội trường: ${session.room} • Thời gian: ${session.timeRange}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
            ],
          ),
        ),
        
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: 3,
            itemBuilder: (context, index) {
              final names = ['Lê Văn C', 'Nguyễn Thị D', 'Phạm Minh E'];
              final mssvs = ['SV20260011', 'SV20260022', 'SV20260033'];
              
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(child: Text('${index + 1}')),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(names[index], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                Text('MSSV: ${mssvs[index]} • Đề tài: Chuỗi cung ứng thủy sản', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Chấm điểm thuyết trình (0-10):', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                            child: const Text('8.0', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          OutlinedButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Đã nộp điểm hội đồng 8.0 cho SV ${names[index]}')),
                              );
                            },
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppColors.primary),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: const Text('Lưu điểm hội đồng', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
                          ),
                        ],
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
}
