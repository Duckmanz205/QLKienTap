import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';

class LichTrinhDoanSVScreen extends StatefulWidget {
  final VoidCallback? onNavigateToReports;

  const LichTrinhDoanSVScreen({super.key, this.onNavigateToReports});

  @override
  State<LichTrinhDoanSVScreen> createState() => _LichTrinhDoanSVScreenState();
}

class _LichTrinhDoanSVScreenState extends State<LichTrinhDoanSVScreen> {
  Trip? _selectedTrip;
  TripBusInfo? _busInfo;
  bool _isLoading = false;
  bool _hasInitialized = false;
  String _searchStudentQuery = '';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasInitialized) {
      _hasInitialized = true;
      final appState = AppStateProvider.of(context).state;
      final registered = appState.studentTrips
          .where((t) =>
              t.isRegistered &&
              (t.registrationStatus == null ||
                  ['HopLe', 'ChoDuyet', 'DaThamGia', 'HoanThanh']
                      .contains(t.registrationStatus)))
          .toList();
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
    if (cleaned.isEmpty) return;
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

  String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty || dateStr == 'N/A') {
      return '--/--/----';
    }
    final dt = DateTime.tryParse(dateStr);
    if (dt == null) return dateStr;
    final d = dt.toLocal();
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
  }

  String _formatDateTime(DateTime? dt) {
    if (dt == null) return '--:-- --/--/----';
    final d = dt.toLocal();
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }

  Widget _buildStatusBadge(String? status) {
    String label = 'Đủ điều kiện tham gia';
    Color bg = const Color(0xFFD1FAE5);
    Color text = const Color(0xFF065F46);
    IconData icon = Icons.check_circle_rounded;

    switch (status) {
      case 'DaThamGia':
        label = 'Đã tham gia';
        bg = const Color(0xFFCCFBF1);
        text = const Color(0xFF115E59);
        break;
      case 'HoanThanh':
        label = 'Đã hoàn thành';
        bg = const Color(0xFFDBEAFE);
        text = const Color(0xFF1E40AF);
        break;
      case 'VangMat':
        label = 'Vắng mặt';
        bg = const Color(0xFFFFE4E6);
        text = const Color(0xFF9F1239);
        icon = Icons.cancel_rounded;
        break;
      default:
        label = status == 'HopLe' ? 'Đủ điều kiện tham gia' : (status ?? 'Đã đăng ký');
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: text.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: text),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: text,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToChucBadge(String? cachToChuc) {
    final bool isTuDo = cachToChuc == 'TuDo';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isTuDo ? const Color(0xFFEDE9FE) : const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: isTuDo
              ? const Color(0xFF7C3AED).withValues(alpha: 0.3)
              : const Color(0xFFD97706).withValues(alpha: 0.3),
        ),
      ),
      child: Text(
        isTuDo ? 'Chuyến tự do' : 'Do Khoa/CLB tổ chức',
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: isTuDo ? const Color(0xFF5B21B6) : const Color(0xFF92400E),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final registeredTrips = appState.studentTrips
        .where((t) =>
            t.isRegistered &&
            (t.registrationStatus == null ||
                ['HopLe', 'ChoDuyet', 'DaThamGia', 'HoanThanh']
                    .contains(t.registrationStatus)))
        .toList();

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
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.darkSlate,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Hãy vào mục "Tham quan" để chọn và đăng ký chuyến kiến tập.',
                style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    final currentTrip = _selectedTrip ?? registeredTrips.first;

    // Tìm Submission tương ứng từ appState.submissions để lấy dữ liệu thực tế
    Submission? correspondingSub;
    for (final s in appState.submissions) {
      if (s.registrationId?.toString() == currentTrip.registrationId ||
          s.id == currentTrip.registrationId ||
          s.tripName == currentTrip.name) {
        correspondingSub = s;
        break;
      }
    }

    final String factoryAddress = _busInfo?.diaChiNhaMay ?? currentTrip.location;
    final String? diaDiemTapTrung = _busInfo?.diaDiemTapTrung ??
        correspondingSub?.diaDiemTapTrung ??
        currentTrip.diaDiemTapTrung;
    final String hinhThuc = _busInfo?.hinhThuc ?? currentTrip.hinhThuc ?? currentTrip.type;
    final bool isTrucTuyen = hinhThuc == 'TrucTuyen' || hinhThuc == 'Trực tuyến';
    final bool isTuDo = currentTrip.isTuDo || _busInfo?.cachToChuc == 'TuDo';

    final String nguoiLienHeDN = _busInfo?.enterpriseContactPerson ?? '';
    final String sdtLienHeDN = _busInfo?.enterpriseContactPhone ?? '';

    // Thời gian & Trạng thái tiến trình
    final DateTime now = DateTime.now();
    DateTime? tripStartDate = currentTrip.rawNgayThamQuan;
    tripStartDate ??= DateTime.tryParse(currentTrip.date);

    bool isPastStart = false;
    bool isToday = false;
    bool isPastDay = false;

    if (tripStartDate != null) {
      final tripDateOnly = DateTime(tripStartDate.year, tripStartDate.month, tripStartDate.day);
      final todayOnly = DateTime(now.year, now.month, now.day);
      isToday = tripDateOnly.isAtSameMomentAs(todayOnly);
      isPastDay = todayOnly.isAfter(tripDateOnly);

      final gioBatDauStr = _busInfo?.gioBatDau ?? currentTrip.gioBatDau ?? '08:00';
      final parts = gioBatDauStr.split(':');
      final hour = parts.isNotEmpty ? int.tryParse(parts[0]) ?? 8 : 8;
      final min = parts.length > 1 ? int.tryParse(parts[1]) ?? 0 : 0;
      final startMoment = DateTime(tripStartDate.year, tripStartDate.month, tripStartDate.day, hour, min);
      isPastStart = now.isAfter(startMoment);
    }

    // DiemDanh data
    final String? diemDanhStatus = correspondingSub?.diemDanhStatus;
    final DateTime? diemDanhNgay = correspondingSub?.diemDanhNgay;
    final String? diemDanhNguoi = correspondingSub?.diemDanhNguoi;
    final String? diemDanhGhiChu = correspondingSub?.diemDanhGhiChu;

    // Report deadline & status data
    final DateTime? reportDeadline = correspondingSub?.hanNopDate ??
        tripStartDate?.add(const Duration(days: 10));
    final bool isOverdueReport = reportDeadline != null && now.isAfter(reportDeadline);
    final bool hasBaoCao = correspondingSub?.fileBaoCaoUrl?.isNotEmpty == true;
    final String? reportStatus = correspondingSub?.reportStatus;
    final int lanNop = correspondingSub?.lanNop ?? 1;

    // Lọc danh sách sinh viên theo tìm kiếm
    final allStudents = _busInfo?.students ?? [];
    final filteredStudents = allStudents.where((st) {
      if (_searchStudentQuery.isEmpty) return true;
      final q = _searchStudentQuery.toLowerCase().trim();
      return st.hoTen.toLowerCase().contains(q) || st.mssv.toLowerCase().contains(q);
    }).toList();

    return RefreshIndicator(
      onRefresh: () async {
        await _loadBusInfo(int.tryParse(currentTrip.id) ?? 0);
        final activeId = ApiService.profileId ?? ApiService.userId;
        if (activeId != null) {
          await appStateProvider.fetchStudentDataFromApi(activeId);
        }
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Dropdown chọn chuyến tham quan
            Text(
              'CHỌN CHUYẾN THAM QUAN',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade600,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 6),

            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade300),
                boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 4)],
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<Trip>(
                  value: registeredTrips.firstWhere(
                    (t) => t.id == currentTrip.id,
                    orElse: () => registeredTrips.first,
                  ),
                  isExpanded: true,
                  icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary),
                  items: registeredTrips.map((t) {
                    final hinhThucLabel =
                        (t.hinhThuc == 'TrucTuyen' || t.type == 'Trực tuyến') ? 'Trực tuyến' : 'Trực tiếp';
                    return DropdownMenuItem<Trip>(
                      value: t,
                      child: Text(
                        '[${_formatDate(t.date)}] ${t.name} ($hinhThucLabel)',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          color: AppColors.darkSlate,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    );
                  }).toList(),
                  onChanged: (newTrip) {
                    if (newTrip != null && newTrip.id != currentTrip.id) {
                      setState(() {
                        _selectedTrip = newTrip;
                        _searchStudentQuery = '';
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
                  padding: EdgeInsets.all(40.0),
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              ),
            ] else ...[
              // CARD TỔNG QUAN CHUYẾN ĐI
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF4F0E4),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFDBD468).withValues(alpha: 0.5)),
                  boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 6)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badges row
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isTrucTuyen ? const Color(0xFFE0F2FE) : AppColors.primary,
                            borderRadius: BorderRadius.circular(6),
                            border: isTrucTuyen
                                ? Border.all(color: const Color(0xFF0284C7).withValues(alpha: 0.4))
                                : null,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isTrucTuyen ? Icons.laptop_chromebook : Icons.place_rounded,
                                size: 12,
                                color: isTrucTuyen ? const Color(0xFF0369A1) : Colors.white,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                isTrucTuyen ? 'Trực tuyến' : 'Trực tiếp',
                                style: TextStyle(
                                  color: isTrucTuyen ? const Color(0xFF0369A1) : Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        _buildStatusBadge(currentTrip.registrationStatus),
                        _buildToChucBadge(currentTrip.cachToChuc),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Tên doanh nghiệp
                    Text(
                      _busInfo?.tenChuyenDi ?? currentTrip.name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: AppColors.darkSlate,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Địa chỉ nhà máy
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.location_on_outlined, size: 16, color: Colors.grey.shade700),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            factoryAddress,
                            style: TextStyle(fontSize: 12.5, color: Colors.grey.shade800, height: 1.3),
                          ),
                        ),
                      ],
                    ),

                    // Địa điểm tập trung nếu đi trực tiếp
                    if (!isTrucTuyen && diaDiemTapTrung != null && diaDiemTapTrung.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              '📍 Địa điểm tập trung: ',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                            Expanded(
                              child: Text(
                                diaDiemTapTrung,
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.darkSlate,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 8),
                    // Ngày & Giờ tham quan
                    Row(
                      children: [
                        Icon(Icons.calendar_today_outlined, size: 14, color: Colors.grey.shade700),
                        const SizedBox(width: 6),
                        Text(
                          _formatDate(currentTrip.date),
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey.shade800),
                        ),
                        const SizedBox(width: 14),
                        Icon(Icons.access_time_rounded, size: 14, color: Colors.grey.shade700),
                        const SizedBox(width: 6),
                        Text(
                          'Bắt đầu: ${_busInfo?.gioBatDau ?? currentTrip.gioBatDau ?? "08:00"}',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey.shade800),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // CỤM LIÊN HỆ: GIẢNG VIÊN DẪN ĐOÀN & ĐẦU MỐI DOANH NGHIỆP
              _buildContactSection(),
              const SizedBox(height: 20),

              // TIẾN TRÌNH CHUYẾN ĐI THỰC TẾ (5 BƯỚC ĐỘNG THEO WEB)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: Colors.grey.shade200),
                  boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 6)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.timeline_rounded, color: AppColors.primary, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Tiến trình chuyến đi thực tế',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: AppColors.darkSlate,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            '5 bước CSDL',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24),

                    // BƯỚC 1: Tập trung & Chuẩn bị
                    _buildStepItem(
                      stepNum: '1',
                      isDone: isPastStart,
                      isActive: !isPastStart,
                      badgeText: 'TRƯỚC GIỜ ĐI',
                      title: 'Tập trung & Chuẩn bị',
                      bodyWidget: Text(
                        isTrucTuyen
                            ? 'Sinh viên chuẩn bị thiết bị, kiểm tra kết nối mạng và truy cập phòng họp trực tuyến trước giờ bắt đầu 15 phút (đổi tên theo cú pháp MSSV - Họ tên).'
                            : isTuDo
                                ? 'Chuyến đi tự túc: Sinh viên chủ động phương tiện di chuyển và có mặt trước cổng doanh nghiệp ($factoryAddress) tối thiểu 15 phút trước giờ bắt đầu.'
                                : 'Sinh viên có mặt trước 15–30 phút tại địa điểm tập trung: ${diaDiemTapTrung ?? "Theo thông báo của đoàn kiến tập"} để điểm danh trước khi khởi hành.',
                        style: const TextStyle(fontSize: 12, height: 1.4, color: Color(0xFF475569)),
                      ),
                    ),

                    // BƯỚC 2: Bắt đầu tham quan tại Doanh nghiệp
                    _buildStepItem(
                      stepNum: '2',
                      isDone: isPastDay,
                      isActive: isToday,
                      badgeText: '${_busInfo?.gioBatDau ?? currentTrip.gioBatDau ?? "08:00"} — ${_formatDate(currentTrip.date)}',
                      title: 'Bắt đầu tham quan tại Doanh nghiệp',
                      bodyWidget: Text(
                        'Thời gian chính thức bắt đầu buổi kiến tập tại ${_busInfo?.tenChuyenDi ?? currentTrip.name}.'
                        '${nguoiLienHeDN.isNotEmpty ? " Đầu mối đón tiếp: $nguoiLienHeDN ($sdtLienHeDN)." : ""}',
                        style: const TextStyle(fontSize: 12, height: 1.4, color: Color(0xFF475569)),
                      ),
                    ),

                    // BƯỚC 3: Hoạt động & Xin xác nhận
                    _buildStepItem(
                      stepNum: '3',
                      isDone: isPastDay || diemDanhStatus == 'CoMat',
                      isActive: isToday,
                      badgeText: 'TẠI DOANH NGHIỆP',
                      title: 'Hoạt động & Xin xác nhận tham quan',
                      bodyWidget: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Nghe phổ biến nội quy an toàn, quan sát quy trình công nghệ sản xuất và trao đổi chuyên môn cùng chuyên gia nhà máy.',
                            style: TextStyle(fontSize: 12, height: 1.4, color: Color(0xFF475569)),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFFBEB),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFFDE68A)),
                            ),
                            child: const Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(Icons.info_outline, size: 14, color: Color(0xFFD97706)),
                                SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    'Lưu ý: Sinh viên ghi chép số liệu và xin mộc đỏ Giấy xác nhận tham quan (nếu đi trực tiếp) để đính kèm khi nộp bài thu hoạch.',
                                    style: TextStyle(fontSize: 11, color: Color(0xFF92400E), height: 1.3),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    // BƯỚC 4: Xác nhận tham gia (Điểm danh từ bảng DiemDanh)
                    _buildStepItem(
                      stepNum: '4',
                      isDone: diemDanhStatus == 'CoMat',
                      isError: diemDanhStatus == 'Vang' || diemDanhStatus == 'TuChoiThamGia',
                      badgeText: 'ĐIỂM DANH THỰC TẾ',
                      title: 'Xác nhận tham gia (Điểm danh)',
                      bodyWidget: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (diemDanhStatus == 'CoMat') ...[
                            Wrap(
                              crossAxisAlignment: WrapCrossAlignment.center,
                              spacing: 6,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFD1FAE5),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF065F46)),
                                      SizedBox(width: 4),
                                      Text(
                                        'Đã điểm danh: Có mặt',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                                      ),
                                    ],
                                  ),
                                ),
                                if (diemDanhNgay != null)
                                  Text(
                                    '(${_formatDateTime(diemDanhNgay)})',
                                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                  ),
                              ],
                            ),
                            if (diemDanhNguoi != null && diemDanhNguoi.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                'Người điểm danh: $diemDanhNguoi',
                                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.darkSlate),
                              ),
                            ],
                            if (diemDanhGhiChu != null && diemDanhGhiChu.isNotEmpty) ...[
                              const SizedBox(height: 2),
                              Text(
                                'Ghi chú: $diemDanhGhiChu',
                                style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.grey.shade700),
                              ),
                            ],
                          ] else if (diemDanhStatus == 'Vang' || diemDanhStatus == 'TuChoiThamGia') ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFE4E6),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: const Color(0xFFF43F5E).withValues(alpha: 0.3)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.cancel_rounded, size: 12, color: Color(0xFF9F1239)),
                                  SizedBox(width: 4),
                                  Text(
                                    'Vắng mặt / Không tham gia',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF9F1239)),
                                  ),
                                ],
                              ),
                            ),
                            if (diemDanhGhiChu != null && diemDanhGhiChu.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                'Lý do: $diemDanhGhiChu',
                                style: const TextStyle(fontSize: 11, color: Color(0xFFBE123C), fontWeight: FontWeight.w500),
                              ),
                            ],
                          ] else ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.hourglass_top_rounded, size: 12, color: Color(0xFF92400E)),
                                  SizedBox(width: 4),
                                  Text(
                                    '⏳ Chờ Giảng viên dẫn đoàn điểm danh',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF92400E)),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Giảng viên sẽ điểm danh trực tiếp tại buổi tham quan.',
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                            ),
                          ],
                        ],
                      ),
                    ),

                    // BƯỚC 5: Hạn chót & Nộp bài thu hoạch
                    _buildStepItem(
                      stepNum: '5',
                      isDone: hasBaoCao,
                      isError: isOverdueReport && !hasBaoCao,
                      isLast: true,
                      badgeText: 'HẠN NỘP: ${_formatDateTime(reportDeadline)}',
                      title: 'Hoàn thành Bài thu hoạch',
                      bodyWidget: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Thời hạn nộp bài thu hoạch chính thức (10 ngày kể từ ngày đi). Sinh viên hoàn thành báo cáo PDF và đính kèm giấy xác nhận tham quan.',
                            style: TextStyle(fontSize: 12, height: 1.4, color: Color(0xFF475569)),
                          ),
                          const SizedBox(height: 8),

                          // Status indicator & Action button
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              if (hasBaoCao) ...[
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: reportStatus == 'TreHan'
                                        ? const Color(0xFFFFE4E6)
                                        : reportStatus == 'ChoBoSung'
                                            ? const Color(0xFFE0F2FE)
                                            : const Color(0xFFD1FAE5),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        reportStatus == 'TreHan'
                                            ? Icons.warning_amber_rounded
                                            : Icons.check_circle_rounded,
                                        size: 13,
                                        color: reportStatus == 'TreHan'
                                            ? const Color(0xFF9F1239)
                                            : const Color(0xFF065F46),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        reportStatus == 'TreHan'
                                            ? 'Đã nộp trễ hạn (Lần $lanNop)'
                                            : reportStatus == 'ChoBoSung'
                                                ? 'Chờ bổ sung (Lần $lanNop)'
                                                : 'Đã nộp bài (Lần $lanNop)',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: reportStatus == 'TreHan'
                                              ? const Color(0xFF9F1239)
                                              : const Color(0xFF065F46),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ] else ...[
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isOverdueReport
                                        ? const Color(0xFFFFE4E6)
                                        : const Color(0xFFFEF3C7),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    isOverdueReport ? 'Đã quá hạn nộp bài' : 'Chưa nộp bài',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: isOverdueReport
                                          ? const Color(0xFF9F1239)
                                          : const Color(0xFF92400E),
                                    ),
                                  ),
                                ),
                              ],

                              if (widget.onNavigateToReports != null)
                                ElevatedButton.icon(
                                  onPressed: widget.onNavigateToReports,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    elevation: 0,
                                  ),
                                  icon: const Icon(Icons.arrow_forward_rounded, size: 14),
                                  label: Text(
                                    hasBaoCao ? 'Xem bài nộp' : 'Nộp bài ngay',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // DANH SÁCH SINH VIÊN TRONG ĐOÀN (CÓ Ô TÌM KIẾM THEO TÊN / MSSV)
              _buildMembersCard(filteredStudents, allStudents.length),
              const SizedBox(height: 20),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStepItem({
    required String stepNum,
    required bool isDone,
    bool isActive = false,
    bool isError = false,
    bool isLast = false,
    required String badgeText,
    required String title,
    required Widget bodyWidget,
  }) {
    Color iconBg;
    Widget iconContent;

    if (isDone) {
      iconBg = AppColors.primary;
      iconContent = const Icon(Icons.check, size: 14, color: Colors.white);
    } else if (isError) {
      iconBg = const Color(0xFFE11D48);
      iconContent = const Icon(Icons.close, size: 14, color: Colors.white);
    } else if (isActive) {
      iconBg = Colors.white;
      iconContent = Text(
        stepNum,
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary),
      );
    } else {
      iconBg = Colors.white;
      iconContent = Text(
        stepNum,
        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade400),
      );
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Timeline indicator line + circle
          SizedBox(
            width: 28,
            child: Column(
              children: [
                Container(
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    color: iconBg,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isDone
                          ? AppColors.primary
                          : isError
                              ? const Color(0xFFE11D48)
                              : isActive
                                  ? AppColors.primary
                                  : Colors.grey.shade300,
                      width: isActive ? 2 : 1.5,
                    ),
                    boxShadow: isActive
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.3),
                              blurRadius: 6,
                              spreadRadius: 1,
                            )
                          ]
                        : null,
                  ),
                  child: Center(child: iconContent),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      color: isDone ? AppColors.primary.withValues(alpha: 0.4) : Colors.grey.shade200,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),

          // Content
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Text(
                          badgeText,
                          style: TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey.shade700,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.bold,
                      color: AppColors.darkSlate,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: bodyWidget,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactSection() {
    final lecturers = _busInfo?.lecturers ?? [];
    final fallbackName = _busInfo?.lecturerName;
    final fallbackPhone = _busInfo?.lecturerPhone;

    final String nguoiLienHeDN = _busInfo?.enterpriseContactPerson ?? '';
    final String sdtLienHeDN = _busInfo?.enterpriseContactPhone ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // GIẢNG VIÊN DẪN ĐOÀN CARD
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
            boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 4)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.school_outlined, size: 16, color: AppColors.primary),
                  SizedBox(width: 6),
                  Text(
                    'GIẢNG VIÊN DẪN ĐOÀN',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              if (lecturers.isNotEmpty) ...[
                ...lecturers.map((gv) => _buildLecturerRow(gv)),
              ] else if (fallbackName != null && fallbackName.isNotEmpty) ...[
                _buildLecturerRow(
                  TripLecturer(
                    id: 0,
                    hoTen: fallbackName,
                    soDienThoai: fallbackPhone,
                    laTruongDoan: true,
                  ),
                ),
              ] else ...[
                Text(
                  'Chờ phân công giảng viên dẫn đoàn.',
                  style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Colors.grey.shade600),
                ),
              ],
            ],
          ),
        ),

        // ĐẦU MỐI DOANH NGHIỆP CARD
        if (nguoiLienHeDN.isNotEmpty || sdtLienHeDN.isNotEmpty) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
              boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 4)],
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: const Color(0xFF89B449).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.business_center, color: AppColors.primary, size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'ĐẦU MỐI DOANH NGHIỆP',
                        style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.grey),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        nguoiLienHeDN.isNotEmpty ? nguoiLienHeDN : 'Đang cập nhật',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                      ),
                      if (sdtLienHeDN.isNotEmpty)
                        Text(
                          sdtLienHeDN,
                          style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                        ),
                    ],
                  ),
                ),
                if (sdtLienHeDN.isNotEmpty)
                  IconButton(
                    onPressed: () => _makePhoneCall(sdtLienHeDN),
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Color(0xFF89B449),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.phone, color: Colors.white, size: 14),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildLecturerRow(TripLecturer gv) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.person, color: AppColors.primary, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        gv.hoTen,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.darkSlate,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (gv.laTruongDoan) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'Trưởng đoàn',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                if (gv.soDienThoai != null && gv.soDienThoai!.isNotEmpty)
                  Text(
                    gv.soDienThoai!,
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                  ),
              ],
            ),
          ),
          if (gv.soDienThoai != null && gv.soDienThoai!.isNotEmpty)
            IconButton(
              onPressed: () => _makePhoneCall(gv.soDienThoai!),
              icon: Container(
                padding: const EdgeInsets.all(7),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.phone, color: Colors.white, size: 14),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMembersCard(List<TripBusMember> filteredStudents, int totalCount) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 6)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.groups_rounded, color: Color(0xFF89B449), size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Sinh viên trong đoàn ($totalCount)',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.darkSlate,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Ô tìm kiếm thành viên theo MSSV hoặc họ tên
          TextField(
            onChanged: (val) {
              setState(() {
                _searchStudentQuery = val;
              });
            },
            decoration: InputDecoration(
              hintText: 'Tìm theo MSSV, họ tên...',
              hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade400),
              prefixIcon: const Icon(Icons.search, size: 18, color: Colors.grey),
              suffixIcon: _searchStudentQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 16),
                      onPressed: () {
                        setState(() {
                          _searchStudentQuery = '';
                        });
                      },
                    )
                  : null,
              filled: true,
              fillColor: Colors.grey.shade50,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade200),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.primary),
              ),
            ),
          ),
          const SizedBox(height: 14),

          if (filteredStudents.isEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Text(
                  totalCount == 0 ? 'Chưa có sinh viên nào trong đoàn.' : 'Không tìm thấy sinh viên phù hợp.',
                  style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Colors.grey.shade500),
                ),
              ),
            ),
          ] else ...[
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                childAspectRatio: 0.72,
                crossAxisSpacing: 8,
                mainAxisSpacing: 10,
              ),
              itemCount: filteredStudents.length,
              itemBuilder: (ctx, idx) {
                final st = filteredStudents[idx];
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF4F0E4),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.grey.shade300),
                          ),
                          child: const Icon(Icons.person, color: Colors.grey, size: 24),
                        ),
                        if (st.isLeader)
                          Positioned(
                            top: -2,
                            right: -2,
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: const BoxDecoration(
                                color: Colors.amber,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.star, size: 10, color: Colors.white),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      st.hoTen,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.darkSlate,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (st.mssv.isNotEmpty)
                      Text(
                        st.mssv,
                        style: TextStyle(fontSize: 9, color: Colors.grey.shade600),
                        textAlign: TextAlign.center,
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
