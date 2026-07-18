import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';

class LichTrinhDoanSVScreen extends StatelessWidget {
  const LichTrinhDoanSVScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final registeredCompleted = appState.studentTrips.where((t) => t.isRegistered).toList();
    if (registeredCompleted.isEmpty) {
      return const Center(child: Text('Bạn chưa có lịch trình đoàn nào. Hãy đăng ký chuyến đi.'));
    }

    final currentTrip = registeredCompleted.first;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${currentTrip.name} - ${currentTrip.date}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const Icon(Icons.arrow_drop_down, color: AppColors.primary),
              ],
            ),
          ),
          const SizedBox(height: 16),

          Card(
            color: const Color(0xFFE7E0C4),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    currentTrip.name,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                  ),
                  const SizedBox(height: 8),
                  _buildDetailRow(Icons.location_on, currentTrip.location),
                  const SizedBox(height: 6),
                  _buildDetailRow(Icons.calendar_today, '${currentTrip.date} • ${currentTrip.time}'),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.local_activity_outlined, size: 18, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(6)),
                        child: Text(currentTrip.type, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const Divider(height: 24, color: Colors.white70),
                  
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          image: DecorationImage(
                            image: NetworkImage('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('GVHD: Nguyễn Văn A', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('SĐT: 0987.654.321', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.phone, color: AppColors.primary),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Đang gọi cho GVHD: 0987.654.321...')),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          const Text('Lịch trình di chuyển', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
          const SizedBox(height: 12),
          _buildTimelineStep(context, '07:00', 'Tập trung tại sảnh trường', 'Yêu cầu đi học đúng giờ, mặc đồng phục khoa.'),
          _buildTimelineStep(context, '08:00', 'Di chuyển bằng xe bus', 'Nhà trường sắp xếp xe đưa đón sinh viên từ cơ sở 1.'),
          _buildTimelineStep(context, '09:00', 'Tham quan nhà máy', 'Tham quan dây chuyền sản xuất và nghe giới thiệu công nghệ.'),
          _buildTimelineStep(context, '12:00', 'Kết thúc tham quan', 'Tập trung lên xe và di chuyển về lại trường.'),

          const SizedBox(height: 24),
          const Text('Danh sách thành viên đoàn', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
          const SizedBox(height: 8),
          
          SizedBox(
            height: 80,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 8,
              itemBuilder: (context, index) {
                return Container(
                  width: 60,
                  margin: const EdgeInsets.only(right: 12),
                  child: Column(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.grey.shade300,
                          image: DecorationImage(
                            image: NetworkImage('https://images.unsplash.com/photo-${1500000000000 + index * 100000}?w=100'),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'SV ${index + 1}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 10, color: AppColors.darkSlate),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 13, color: AppColors.darkSlate),
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineStep(BuildContext context, String time, String title, String desc) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 50,
            child: Text(
              time,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary),
            ),
          ),
          Column(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
              ),
              Expanded(
                child: Container(
                  width: 2,
                  color: AppColors.primary.withValues(alpha: 0.3),
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 2),
                  Text(desc, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
