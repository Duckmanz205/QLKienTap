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

    final guidedCount = appState.lecturerStudents.length;
    final ungradedCount = appState.lecturerStudents.where((s) => !s.isGraded).length;
    final todayTours = appState.lecturerTours.length;
    
    final ungradedList = appState.lecturerStudents.where((s) => !s.isGraded).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Filter Tabs (Scopes)
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                _buildScopeTab('led', 'Dẫn đoàn', Icons.directions_bus),
                _buildScopeTab('guided', 'Hướng dẫn', Icons.school),
                _buildScopeTab('council', 'Hội đồng', Icons.gavel),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Overview Stats Grid
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 1.1,
            children: [
              _buildStatCard('Đoàn kiến tập', '$todayTours', AppColors.primary),
              _buildStatCard('SV Hướng dẫn', '$guidedCount', AppColors.secondary),
              _buildStatCard(
                'Bài chờ chấm',
                '$ungradedCount',
                ungradedCount > 0 ? AppColors.warning : Colors.grey.shade400,
                isHighlight: ungradedCount > 0,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Conditional display based on Scope Selection
          if (_lecturerScope == 'led') ...[
            const Text('Đoàn xe đang phụ trách dẫn đi', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
            const SizedBox(height: 8),
            _buildDashboardToursList(appState),
          ] else if (_lecturerScope == 'guided') ...[
            const Text('Sinh viên hướng dẫn cần chấm điểm', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
            const SizedBox(height: 8),
            if (ungradedList.isEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text('Tất cả sinh viên hướng dẫn đã được nhập điểm đầy đủ.', style: TextStyle(fontSize: 13, color: Colors.grey.shade600), textAlign: TextAlign.center),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: ungradedList.length,
                itemBuilder: (context, index) {
                  final student = ungradedList[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: ListTile(
                      onTap: () => widget.onStudentTap(student.id),
                      leading: CircleAvatar(backgroundImage: NetworkImage(student.avatar)),
                      title: Text(student.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      subtitle: Text('Doanh nghiệp: ${student.company} • ${student.className}', style: const TextStyle(fontSize: 11)),
                      trailing: const Icon(Icons.chevron_right, color: AppColors.primary),
                    ),
                  );
                },
              ),
          ] else ...[
            const Text('Phiên chấm hội đồng tốt nghiệp', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
            const SizedBox(height: 8),
            _buildDashboardCouncilsList(appState),
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
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: active ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 14, color: active ? Colors.white : AppColors.darkSlate),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: active ? Colors.white : AppColors.darkSlate,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color, {bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: isHighlight ? AppColors.danger.withValues(alpha: 0.2) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.textMuted), maxLines: 2),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
    );
  }

  Widget _buildDashboardToursList(AppState state) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: state.lecturerTours.length,
      itemBuilder: (context, index) {
        final tour = state.lecturerTours[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 10),
          child: ListTile(
            onTap: () => widget.onTourTap(tour.id),
            leading: const Icon(Icons.directions_bus, color: AppColors.primary),
            title: Text(tour.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            subtitle: Text('Thời gian: ${tour.date} • ${tour.timeRange}', style: const TextStyle(fontSize: 11)),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              decoration: BoxDecoration(color: AppColors.secondary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
              child: const Text('Điểm danh →', style: TextStyle(color: AppColors.primary, fontSize: 9, fontWeight: FontWeight.bold)),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDashboardCouncilsList(AppState state) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: state.councilSessions.length,
      itemBuilder: (context, index) {
        final session = state.councilSessions[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 10),
          child: ListTile(
            onTap: () => widget.onCouncilTap(session.id),
            leading: const Icon(Icons.gavel, color: AppColors.primary),
            title: Text(session.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            subtitle: Text('Hội trường: ${session.room} • ${session.timeRange}', style: const TextStyle(fontSize: 11)),
            trailing: const Icon(Icons.arrow_forward_ios, size: 12, color: AppColors.textMuted),
          ),
        );
      },
    );
  }
}
