import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';

class LichTrinhDoanSVScreen extends StatefulWidget {
  const LichTrinhDoanSVScreen({super.key});

  @override
  State<LichTrinhDoanSVScreen> createState() => _LichTrinhDoanSVScreenState();
}

class _LichTrinhDoanSVScreenState extends State<LichTrinhDoanSVScreen> {
  Trip? _selectedTrip;
  TripBusInfo? _busInfo;
  bool _isLoading = false;
  bool _hasInitialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasInitialized) {
      _hasInitialized = true;
      final appState = AppStateProvider.of(context).state;
      final registered = appState.studentTrips.where((t) => t.isRegistered).toList();
      if (registered.isNotEmpty) {
        _selectedTrip = registered.first;
        _loadBusInfo(int.tryParse(_selectedTrip!.id) ?? 0);
      }
    }
  }

  Future<void> _loadBusInfo(int tripId) async {
    if (tripId <= 0) return;
    setState(() => _isLoading = true);
    try {
      final info = await AppStateProvider.of(context).fetchTripBusInfo(tripId);
      if (mounted) {
        setState(() {
          _busInfo = info;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final cleaned = phoneNumber.replaceAll(RegExp(r'[^\d+]'), '');
    final uri = Uri.parse('tel:$cleaned');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Không thể gọi số: $phoneNumber')),
          );
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Số điện thoại: $phoneNumber')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final registeredTrips = appState.studentTrips.where((t) => t.isRegistered).toList();

    if (registeredTrips.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.directions_bus_outlined, size: 64, color: Colors.grey.shade400),
              const SizedBox(height: 16),
              const Text(
                'Bạn chưa đăng ký chuyến tham quan nào.',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Hãy vào mục "Chuyến tham quan" để chọn và đăng ký chuyến kiến tập.',
                style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    final currentTrip = _selectedTrip ?? registeredTrips.first;

    return RefreshIndicator(
      onRefresh: () async {
        await _loadBusInfo(int.tryParse(currentTrip.id) ?? 0);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Dropdown selector if multiple trips
            Text(
              'Chọn chuyến tham quan đã đăng ký',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 8),

            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<Trip>(
                  value: registeredTrips.firstWhere((t) => t.id == currentTrip.id, orElse: () => registeredTrips.first),
                  isExpanded: true,
                  icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary),
                  items: registeredTrips.map((t) {
                    return DropdownMenuItem<Trip>(
                      value: t,
                      child: Text(
                        '${t.name} (${t.date})',
                        style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13, color: AppColors.darkSlate),
                        overflow: TextOverflow.ellipsis,
                      ),
                    );
                  }).toList(),
                  onChanged: (newTrip) {
                    if (newTrip != null && newTrip.id != currentTrip.id) {
                      setState(() {
                        _selectedTrip = newTrip;
                      });
                      _loadBusInfo(int.tryParse(newTrip.id) ?? 0);
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),

            if (_isLoading) ...[
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              ),
            ] else ...[
              // Company info card - green gradient
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.primary.withValues(alpha: 0.08),
                      AppColors.primary.withValues(alpha: 0.18),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title + badge
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            _busInfo?.tenChuyenDi ?? currentTrip.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.darkSlate,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _busInfo?.hinhThuc == 'TrucTuyen' ? 'Trực tuyến' : currentTrip.type,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Location
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.location_on_outlined, size: 16, color: Colors.grey.shade600),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            currentTrip.location,
                            style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),

                    // Date & time
                    Row(
                      children: [
                        Icon(Icons.access_time_rounded, size: 15, color: Colors.grey.shade600),
                        const SizedBox(width: 6),
                        Text(
                          '${currentTrip.date} | ${_busInfo != null ? '${_busInfo!.gioBatDau} - ${_busInfo!.gioKetThuc}' : currentTrip.time}',
                          style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // GV DẪN ĐOÀN
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.school, color: AppColors.primary, size: 20),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'GV DẪN ĐOÀN',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textMuted,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  _busInfo?.lecturerName ?? 'Đang cập nhật',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.darkSlate,
                                  ),
                                ),
                                if (_busInfo?.lecturerPhone != null && _busInfo!.lecturerPhone!.isNotEmpty)
                                  Text(
                                    _busInfo!.lecturerPhone!,
                                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                  ),
                              ],
                            ),
                          ),
                          if (_busInfo?.lecturerPhone != null && _busInfo!.lecturerPhone!.isNotEmpty)
                            IconButton(
                              icon: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: const BoxDecoration(
                                  color: AppColors.primary,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.phone, color: Colors.white, size: 16),
                              ),
                              onPressed: () => _makePhoneCall(_busInfo!.lecturerPhone!),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Timeline
              _buildTimelineItem(_busInfo?.gioBatDau ?? '07:30', 'Tập trung tại trường & Lên xe', isFirst: true),
              _buildTimelineItem('08:00', 'Xe xuất phát di chuyển đến nhà máy'),
              _buildTimelineItem('09:00', 'Tham quan, nghe thuyết trình tại nhà máy'),
              _buildTimelineItem(_busInfo?.gioKetThuc ?? '11:30', 'Kết thúc tham quan & Trở về trường', isLast: true),

              const SizedBox(height: 24),

              // Danh sách thành viên cùng xe
              _buildBusMembersCard(_busInfo?.students ?? []),
              const SizedBox(height: 20),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineItem(String time, String title, {bool isFirst = false, bool isLast = false}) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 55,
            child: Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(
                time,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: Colors.grey.shade700,
                ),
              ),
            ),
          ),
          Column(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: isFirst ? AppColors.primary : Colors.grey.shade500,
                  shape: BoxShape.circle,
                  border: isFirst
                      ? Border.all(color: AppColors.primary.withValues(alpha: 0.3), width: 3)
                      : null,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: Colors.grey.shade300,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 20.0),
              child: Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                  fontSize: 13,
                  color: AppColors.darkSlate,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBusMembersCard(List<TripBusMember> members) {
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Thành viên đoàn xe',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.darkSlate,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${members.length} người',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (members.isEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20.0),
              child: Center(
                child: Text(
                  'Danh sách thành viên trên xe đang được CLB sắp xếp.',
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade500, fontStyle: FontStyle.italic),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ] else ...[
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: members.length,
              separatorBuilder: (_, _) => Divider(color: Colors.grey.shade100, height: 16),
              itemBuilder: (context, idx) {
                final student = members[idx];
                return Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: student.isLeader
                            ? AppColors.primary.withValues(alpha: 0.15)
                            : Colors.grey.shade100,
                        shape: BoxShape.circle,
                        border: student.isLeader
                            ? Border.all(color: AppColors.primary, width: 1.5)
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        student.hoTen.isNotEmpty ? student.hoTen[0].toUpperCase() : 'S',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: student.isLeader ? AppColors.primary : AppColors.darkSlate,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  student.hoTen,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.darkSlate,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (student.isLeader) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'TRƯỞNG NHÓM',
                                    style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            student.mssv.isNotEmpty ? 'MSSV: ${student.mssv}' : 'Sinh viên',
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ],
      ),
    );
  }
}
