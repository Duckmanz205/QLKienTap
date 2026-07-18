import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';

class ChuyenThamQuanSVScreen extends StatefulWidget {
  final Function(String) onTripTap;
  final String activeTab;
  final Function(String) onTabChanged;

  const ChuyenThamQuanSVScreen({
    super.key,
    required this.onTripTap,
    required this.activeTab,
    required this.onTabChanged,
  });

  @override
  State<ChuyenThamQuanSVScreen> createState() => _ChuyenThamQuanSVScreenState();
}

class _ChuyenThamQuanSVScreenState extends State<ChuyenThamQuanSVScreen> {
  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final availableTrips = appState.studentTrips.where((t) => !t.isRegistered).toList();
    final registeredTrips = appState.studentTrips.where((t) => t.isRegistered).toList();

    return Column(
      children: [
        // Tab switcher
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => widget.onTabChanged('available'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: widget.activeTab == 'available' ? AppColors.secondary : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Có thể đăng ký',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: widget.activeTab == 'available' ? Colors.white : AppColors.darkSlate,
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => widget.onTabChanged('registered'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: widget.activeTab == 'registered' ? AppColors.secondary : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Đã đăng ký',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: widget.activeTab == 'registered' ? Colors.white : AppColors.darkSlate,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        Expanded(
          child: widget.activeTab == 'available'
              ? _buildAvailableTripsTab(availableTrips, appStateProvider)
              : _buildRegisteredTripsTab(registeredTrips, appStateProvider),
        ),
      ],
    );
  }

  Widget _buildAvailableTripsTab(List<Trip> trips, AppStateProviderState appStateProvider) {
    if (trips.isEmpty) {
      return const Center(child: Text('Không có chuyến nào có sẵn để đăng ký.'));
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: trips.length,
      itemBuilder: (context, index) {
        final trip = trips[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ListTile(
                onTap: () => widget.onTripTap(trip.id),
                title: Text(
                  trip.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 12, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Text(trip.date, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                        const SizedBox(width: 12),
                        const Icon(Icons.access_time, size: 12, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Text(trip.time, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: trip.type == 'Trực tiếp'
                                ? AppColors.primary.withValues(alpha: 0.1)
                                : AppColors.secondary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            trip.type,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: trip.type == 'Trực tiếp' ? AppColors.primary : AppColors.secondary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'Còn 15 chỗ',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: ElevatedButton(
                  onPressed: () {
                    appStateProvider.registerTrip(trip.id);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Đăng ký thành công chuyến ${trip.name}')),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('ĐĂNG KÝ CHUYẾN ĐI', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRegisteredTripsTab(List<Trip> trips, AppStateProviderState appStateProvider) {
    if (trips.isEmpty) {
      return const Center(child: Text('Bạn chưa đăng ký chuyến tham quan nào.'));
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: trips.length,
      itemBuilder: (context, index) {
        final trip = trips[index];
        final status = trip.isCompleted ? 'Hợp lệ/Hoàn thành' : 'Chờ duyệt';
        final statusColor = trip.isCompleted ? AppColors.secondary : AppColors.warning;

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
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
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        status,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: statusColor == AppColors.warning ? AppColors.darkSlate : statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 12, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(trip.date, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  ],
                ),
                if (!trip.isCompleted) ...[
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () {
                          appStateProvider.cancelTripRegistration(trip.id);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Đã hủy đăng ký chuyến ${trip.name}')),
                          );
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.danger,
                        ),
                        child: const Text('Hủy đăng ký', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

class ChuyenThamQuanDetailSVScreen extends StatelessWidget {
  final Trip trip;
  final VoidCallback onBack;

  const ChuyenThamQuanDetailSVScreen({
    super.key,
    required this.trip,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Image.network(
            trip.heroImage,
            height: 200,
            fit: BoxFit.cover,
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        trip.type,
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 10),
                      ),
                    ),
                    Text(
                      trip.industry,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  trip.name,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                ),
                const SizedBox(height: 16),
                _buildDetailRow(Icons.location_on_outlined, trip.location),
                const SizedBox(height: 8),
                _buildDetailRow(Icons.calendar_today_outlined, trip.date),
                const SizedBox(height: 8),
                _buildDetailRow(Icons.access_time, trip.time),
                const Divider(height: 32),
                const Text(
                  'Mô tả chuyến đi',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                ),
                const SizedBox(height: 8),
                Text(
                  trip.description,
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade700, height: 1.5),
                ),
                const SizedBox(height: 32),
                if (!trip.isRegistered)
                  ElevatedButton(
                    onPressed: () {
                      appStateProvider.registerTrip(trip.id);
                      onBack();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Đăng ký thành công chuyến ${trip.name}')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('ĐĂNG KÝ THAM GIA CHUYẾN ĐI', style: TextStyle(fontWeight: FontWeight.bold)),
                  )
                else
                  ElevatedButton(
                    onPressed: trip.isCompleted
                        ? null
                        : () {
                            appStateProvider.cancelTripRegistration(trip.id);
                            onBack();
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Đã hủy đăng ký chuyến ${trip.name}')),
                            );
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: trip.isCompleted ? Colors.grey.shade300 : AppColors.danger,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      trip.isCompleted ? 'CHUYẾN ĐI ĐÃ HOÀN THÀNH' : 'HỦY ĐĂNG KÝ THAM GIA',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
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
}
