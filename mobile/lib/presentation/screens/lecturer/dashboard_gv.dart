import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';

class DashboardGVScreen extends StatefulWidget {
  final Function(String) onTourTap;
  final Function(String) onStudentTap;
  final Function(String) onCouncilTap;

  const DashboardGVScreen({
    super.key,
    required this.onTourTap,
    required this.onStudentTap,
    required this.onCouncilTap,
  });

  @override
  State<DashboardGVScreen> createState() => _DashboardGVScreenState();
}

class _DashboardGVScreenState extends State<DashboardGVScreen> {
  String _lecturerScope = 'led'; // 'led' (dẫn đoàn), 'guided' (hướng dẫn), 'council' (hội đồng)

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final stats = appState.lecturerDashboardStats;
    final guidedCount = stats?.tongSvHuongDan ?? appState.lecturerStudents.length;
    final ungradedCount = stats?.baiCanCham ?? appState.lecturerStudents.where((s) => !s.isGraded).length;
    final todayTours = stats?.doanDangDan ?? appState.lecturerTours.length;
    final boardSessions = stats?.buoiBaoCao ?? appState.councilSessions.length;
    
    final ungradedList = appState.lecturerStudents.where((s) => !s.isGraded).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top Greeting
          Row(
            children: [
              const CircleAvatar(
                backgroundColor: Color(0xFFBCE77C),
                radius: 20,
                child: Icon(Icons.waving_hand, color: Color(0xFF3B711A), size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Chào thầy!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87)),
                    Text('Hôm nay có $ungradedCount sinh viên đang đợi chấm bài.', style: const TextStyle(fontSize: 11, color: Colors.black54)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Filter Tabs (Scopes)
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              children: [
                _buildScopeTab('led', 'Dẫn đoàn', Icons.groups),
                _buildScopeTab('guided', 'Hướng dẫn', Icons.menu_book),
                _buildScopeTab('council', 'Hội đồng', Icons.gavel),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Overview Stats Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.25,
            children: [
              _buildStatCard('Đoàn đang dẫn', '$todayTours', Icons.flag, const Color(0xFF8CB654), const Color(0xFFF2F5ED)),
              _buildStatCard('SV cần chấm bài', '$ungradedCount', Icons.assignment_turned_in, const Color(0xFFD6A461), const Color(0xFFFAF5ED)),
              _buildStatCard('Buổi báo cáo tới', '$boardSessions', Icons.calendar_today, const Color(0xFFB76E79), const Color(0xFFF7EBED)),
              _buildStatCard('Tổng SV hướng dẫn', '$guidedCount', Icons.school, const Color(0xFF3B711A), const Color(0xFFE8EFE5)),
            ],
          ),
          const SizedBox(height: 24),

          // Conditional Sections based on Scope
          if (_lecturerScope == 'led') ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('Lịch trong tuần', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87)),
                Icon(Icons.chevron_right, size: 20, color: Colors.black54),
              ],
            ),
            const SizedBox(height: 12),
            _buildTimelineCard('T5', '25', '[Dẫn đoàn] Tham quan', 'Vinamilk', '08:00', const Color(0xFFBCE77C), const Color(0xFF3B711A)),
            _buildTimelineCard('T6', '26', '[Hội đồng] Chấm báo cáo', 'Khóa 46', '13:30', const Color(0xFFB76E79).withValues(alpha: 0.8), const Color(0xFF903B4C)),
            _buildTimelineCard('T7', '27', '[Dẫn đoàn] Tham quan', 'Acecook', '08:30', const Color(0xFFBCE77C), const Color(0xFF3B711A)),
          ] else if (_lecturerScope == 'guided') ...[
            Row(
              children: [
                const Text('Bài chờ chấm', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87)),
                const SizedBox(width: 8),
                if (ungradedCount > 0)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: const Color(0xFFFFEBEE), borderRadius: BorderRadius.circular(8)),
                    child: Text('$ungradedCount Cần gấp', style: const TextStyle(color: Colors.red, fontSize: 9, fontWeight: FontWeight.bold)),
                  ),
                const Spacer(),
                const Text('Xem tất cả', style: TextStyle(fontSize: 11, color: Color(0xFF3B711A), fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            if (ungradedList.isEmpty)
              const Center(child: Padding(padding: EdgeInsets.all(16.0), child: Text('Không có bài cần chấm.')))
            else
              ...ungradedList.take(3).map((student) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                  elevation: 0,
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: const Color(0xFFF2F5ED),
                          radius: 20,
                          child: Text(student.name.isNotEmpty ? student.name.substring(0, 1).toUpperCase() : 'S', style: const TextStyle(color: Color(0xFF3B711A), fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(student.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87)),
                              Text('${student.company} • Nộp gần đây', style: const TextStyle(fontSize: 11, color: Colors.black54)),
                            ],
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: () => widget.onStudentTap(student.id),
                          icon: const Icon(Icons.edit_note, size: 14),
                          label: const Text('Chấm ngay', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF3B711A),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            minimumSize: Size.zero,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            elevation: 0,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
          ] else ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('Hội đồng sắp tới', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87)),
                Icon(Icons.chevron_right, size: 20, color: Colors.black54),
              ],
            ),
            const SizedBox(height: 12),
            if (appState.councilSessions.isEmpty)
              const Center(child: Padding(padding: EdgeInsets.all(16.0), child: Text('Không có hội đồng sắp tới.')))
            else
              ...appState.councilSessions.take(2).map((session) {
                return _buildTimelineCard('T2', '30', '[Hội đồng] Chấm báo cáo', session.name, session.timeRange, const Color(0xFFB76E79).withValues(alpha: 0.8), const Color(0xFF903B4C));
              }),
          ],
        ],
      ),
    );
  }

  Widget _buildScopeTab(String scope, String label, IconData icon) {
    final active = _lecturerScope == scope;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _lecturerScope = scope),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? const Color(0xFF3B711A) : Colors.transparent,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 14, color: active ? Colors.white : Colors.black54),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: active ? Colors.white : Colors.black54,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color iconColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: bgColor,
            radius: 16,
            child: Icon(icon, color: iconColor, size: 16),
          ),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.black54)),
        ],
      ),
    );
  }

  Widget _buildTimelineCard(String dow, String date, String tag, String title, String time, Color dateBg, Color tagColor) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade200)),
      elevation: 0,
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: dateBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(dow, style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
                  Text(date, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(tag, style: TextStyle(fontSize: 10, color: tagColor, fontWeight: FontWeight.bold)),
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(Icons.access_time, size: 10, color: Colors.black54),
                      const SizedBox(width: 4),
                      Text(time, style: const TextStyle(fontSize: 10, color: Colors.black54)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
