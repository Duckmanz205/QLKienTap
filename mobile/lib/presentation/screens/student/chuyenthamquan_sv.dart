import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';
import '../../../core/network/api_service.dart';
import '../../widgets/paginated_list.dart';

Future<void> _showCancelDialog(
  BuildContext context,
  Trip trip,
  AppStateProviderState appStateProvider, {
  VoidCallback? onBack,
}) async {
  final reasonCtrl = TextEditingController();
  String? localPath;
  String? fileName;
  bool isSubmitting = false;

  await showDialog(
    context: context,
    builder: (ctx) {
      return StatefulBuilder(
        builder: (dialogCtx, setDialogState) {
          return AlertDialog(
            title: const Text('Hủy đăng ký', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Bạn có chắc muốn hủy đăng ký chuyến ${trip.name} không?'),
                  const SizedBox(height: 16),
                  TextField(
                    controller: reasonCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Lý do hủy (bắt buộc)',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 16),
                  const Text('File minh chứng (tùy chọn):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () async {
                      try {
                        final pickerResult = await FilePicker.pickFiles(
                          type: FileType.custom,
                          allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
                        );
                        if (pickerResult != null && pickerResult.files.single.path != null) {
                          setDialogState(() {
                            localPath = pickerResult.files.single.path;
                            fileName = pickerResult.files.single.name;
                          });
                        }
                      } catch (e) {
                        if (dialogCtx.mounted) {
                          ScaffoldMessenger.of(dialogCtx).showSnackBar(
                            SnackBar(content: Text('Lỗi chọn file: $e')),
                          );
                        }
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        border: Border.all(color: Colors.grey.shade300),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.attach_file, size: 16, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              fileName ?? 'Chưa chọn file',
                              style: TextStyle(
                                fontSize: 12,
                                color: fileName != null ? AppColors.darkSlate : Colors.grey.shade600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: isSubmitting ? null : () => Navigator.pop(ctx),
                child: const Text('Đóng'),
              ),
              ElevatedButton(
                onPressed: isSubmitting
                    ? null
                    : () async {
                        if (reasonCtrl.text.trim().isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Vui lòng nhập lý do hủy.')),
                          );
                          return;
                        }

                        setDialogState(() => isSubmitting = true);
                        try {
                          await appStateProvider.cancelTripRegistration(
                            trip.id,
                            trip.registrationId,
                            lyDo: reasonCtrl.text.trim(),
                            fileMinhChung: localPath,
                          );
                          if (context.mounted) {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Đã gửi yêu cầu hủy đăng ký chuyến ${trip.name}')),
                            );
                            if (onBack != null) onBack();
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Lỗi: $e'), backgroundColor: AppColors.danger),
                            );
                          }
                        } finally {
                          if (dialogCtx.mounted) {
                            setDialogState(() => isSubmitting = false);
                          }
                        }
                      },
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger, foregroundColor: Colors.white),
                child: isSubmitting
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('XÁC NHẬN HỦY'),
              ),
            ],
          );
        },
      );
    },
  );
}

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
  final _formKey = GlobalKey<FormState>();
  final _companyNameCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _contactPersonCtrl = TextEditingController();
  final _contactPhoneCtrl = TextEditingController();
  final _descriptionCtrl = TextEditingController();
  
  bool _isProposing = false;
  String _proposalMode = 'custom'; // 'system' or 'custom'
  int? _selectedFactoryId;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 7));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 8, minute: 0);
  String _selectedTripType = 'TrucTiep'; // 'TrucTiep' or 'TrucTuyen'
  
  List<Map<String, dynamic>> _factories = [];
  String _filterFactory = 'Tất cả';

  @override
  void initState() {
    super.initState();
    _loadFactories();
  }

  Future<void> _loadFactories() async {
    try {
      final res = await ApiService.getFactories();
      if (res is List && mounted) {
        setState(() {
          _factories = res.map((f) => Map<String, dynamic>.from(f as Map)).toList();
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _companyNameCtrl.dispose();
    _addressCtrl.dispose();
    _contactPersonCtrl.dispose();
    _contactPhoneCtrl.dispose();
    _descriptionCtrl.dispose();
    super.dispose();
  }

  Future<void> _showRegisterConfirmDialog(Trip trip, AppStateProviderState appStateProvider) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận đăng ký', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Bạn có chắc chắn muốn đăng ký tham gia chuyến ${trip.name} không?'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.secondary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, size: 18, color: AppColors.primary),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Hóa đơn lệ phí sẽ được tạo tự động. Vui lòng thanh toán trước hạn.',
                      style: TextStyle(fontSize: 11, color: AppColors.darkSlate),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('HỦY'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('XÁC NHẬN ĐĂNG KÝ', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      try {
        await appStateProvider.registerTrip(trip.id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Đăng ký thành công chuyến ${trip.name}!'),
              backgroundColor: AppColors.secondary,
            ),
          );
          widget.onTabChanged('registered');
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Đăng ký thất bại: $e'),
              backgroundColor: AppColors.danger,
            ),
          );
        }
      }
    }
  }

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
              _buildTab('available', 'Có thể đăng ký'),
              _buildTab('registered', 'Đã đăng ký'),
              _buildTab('propose', 'Đề xuất chuyến'),
            ],
          ),
        ),

        Expanded(
          child: _buildCurrentTabContent(availableTrips, registeredTrips, appStateProvider),
        ),
      ],
    );
  }

  Widget _buildTab(String tabKey, String label) {
    final isActive = widget.activeTab == tabKey;
    return Expanded(
      child: GestureDetector(
        onTap: () => widget.onTabChanged(tabKey),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? AppColors.secondary : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isActive ? Colors.white : AppColors.darkSlate,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentTabContent(List<Trip> available, List<Trip> registered, AppStateProviderState appStateProvider) {
    Widget content;
    if (widget.activeTab == 'propose') {
      content = _buildProposeTab(appStateProvider);
    } else if (widget.activeTab == 'registered') {
      content = _buildRegisteredTripsTab(registered, appStateProvider);
    } else {
      content = _buildAvailableTripsTab(available, appStateProvider);
    }

    return RefreshIndicator(
      onRefresh: () async {
        if (ApiService.userId != null) {
          await appStateProvider.fetchStudentDataFromApi(ApiService.userId!);
          await _loadFactories();
        }
      },
      child: content,
    );
  }

  Widget _buildAvailableTripsTab(List<Trip> trips, AppStateProviderState appStateProvider) {
    return PaginatedList<Trip>(
      items: trips,
      searchHint: 'Tìm kiếm chuyến...',
      dropdownTitle: 'Hình thức',
      dropdownOptions: const ['Tất cả', 'Trực tiếp', 'Trực tuyến'],
      itemName: 'chuyến',
      emptyWidget: const Center(child: Text('Không có chuyến nào có sẵn để đăng ký.')),
      filter: (trip, query, type) {
        final matchesQuery = trip.name.toLowerCase().contains(query.toLowerCase()) ||
            trip.location.toLowerCase().contains(query.toLowerCase());
        final matchesType = type == 'Tất cả' || trip.type == type;
        final matchesFactory = _filterFactory == 'Tất cả' || trip.name.contains(_filterFactory);
        return matchesQuery && matchesType && matchesFactory;
      },
      headerWidgetBuilder: (_) {
        if (_factories.isEmpty) return const SizedBox.shrink();
        final factoryNames = ['Tất cả', ..._factories.map((f) => f['ten_nha_may']?.toString() ?? '').where((n) => n.isNotEmpty)];
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: factoryNames.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, idx) {
                final name = factoryNames[idx];
                final isSelected = _filterFactory == name;
                return ChoiceChip(
                  label: Text(name, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : AppColors.darkSlate)),
                  selected: isSelected,
                  selectedColor: AppColors.primary,
                  backgroundColor: Colors.white,
                  side: BorderSide(color: isSelected ? AppColors.primary : AppColors.beigeBorder),
                  onSelected: (val) {
                    setState(() {
                      _filterFactory = val ? name : 'Tất cả';
                    });
                  },
                );
              },
            ),
          ),
        );
      },
      itemBuilder: (trip) {
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
                    const SizedBox(height: 6),
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
                          'Mở đăng ký',
                          style: TextStyle(fontSize: 11, color: AppColors.secondary, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: ElevatedButton(
                  onPressed: () => _showRegisterConfirmDialog(trip, appStateProvider),
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
    final appState = appStateProvider.state;

    return PaginatedList<Trip>(
      items: trips,
      searchHint: 'Tìm kiếm chuyến...',
      dropdownTitle: 'Trạng thái',
      dropdownOptions: const ['Tất cả', 'Hợp lệ/Hoàn thành', 'Chờ duyệt'],
      itemName: 'chuyến',
      emptyWidget: const Center(child: Text('Bạn chưa đăng ký chuyến tham quan nào.')),
      filter: (trip, query, status) {
        final matchesQuery = trip.name.toLowerCase().contains(query.toLowerCase());
        final tripStatus = trip.isCompleted ? 'Hợp lệ/Hoàn thành' : 'Chờ duyệt';
        final matchesStatus = status == 'Tất cả' || tripStatus == status;
        return matchesQuery && matchesStatus;
      },
      itemBuilder: (trip) {
        final status = trip.isCompleted ? 'Hoàn thành' : 'Chờ diễn ra';
        final statusColor = trip.isCompleted ? AppColors.secondary : AppColors.primary;

        // Payment status lookup
        final payment = appState.payments.firstWhere(
          (p) => p.tripId == trip.id,
          orElse: () => Payment(id: '', tripId: '', name: '', code: '', amount: 0, dueDate: '', status: 'Chưa đóng'),
        );

        Color feeColor = AppColors.warning;
        String feeText = payment.status;
        if (payment.status.contains('Đã đóng') || payment.status == 'DaDongDungHan') {
          feeColor = AppColors.secondary;
          feeText = 'Đã đóng phí';
        } else if (payment.status == 'Vi phạm' || payment.status == 'ViPham') {
          feeColor = AppColors.danger;
          feeText = 'Vi phạm hạn nộp';
        } else if (payment.status == 'Đã hoàn phí' || payment.status == 'DaHoanPhi') {
          feeColor = Colors.grey;
          feeText = 'Đã hoàn phí';
        } else {
          feeText = 'Chưa đóng phí';
        }

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
                          color: statusColor,
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
                    const SizedBox(width: 12),
                    const Icon(Icons.access_time, size: 12, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(trip.time, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: feeColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: feeColor.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        feeText,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: feeColor == AppColors.warning ? AppColors.darkSlate : feeColor,
                        ),
                      ),
                    ),
                  ],
                ),
                if (!trip.isCompleted) ...[
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton.icon(
                        onPressed: () {
                          _showCancelDialog(context, trip, appStateProvider);
                        },
                        icon: const Icon(Icons.cancel_outlined, size: 16),
                        label: const Text('Yêu cầu hủy đăng ký', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.danger,
                        ),
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

  Widget _buildProposeTab(AppStateProviderState appStateProvider) {
    final proposals = appStateProvider.state.proposals;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Proposal Form Card
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: AppColors.beigeBorder),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Đề xuất chuyến kiến tập mới',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Đề xuất doanh nghiệp/nhà máy để Khoa và CLB xem xét liên hệ tổ chức.',
                      style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 16),

                    // Mode switcher
                    Row(
                      children: [
                        Expanded(
                          child: ChoiceChip(
                            label: const Center(child: Text('Doanh nghiệp mới', style: TextStyle(fontSize: 12))),
                            selected: _proposalMode == 'custom',
                            selectedColor: AppColors.secondary,
                            onSelected: (val) {
                              if (val) setState(() => _proposalMode = 'custom');
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ChoiceChip(
                            label: const Center(child: Text('Chọn từ hệ thống', style: TextStyle(fontSize: 12))),
                            selected: _proposalMode == 'system',
                            selectedColor: AppColors.secondary,
                            onSelected: (val) {
                              if (val) setState(() => _proposalMode = 'system');
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    if (_proposalMode == 'system') ...[
                      DropdownButtonFormField<int>(
                        value: _selectedFactoryId,
                        decoration: const InputDecoration(
                          labelText: 'Chọn nhà máy / doanh nghiệp',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.business),
                        ),
                        items: _factories.map((f) {
                          return DropdownMenuItem<int>(
                            value: f['id'] as int?,
                            child: Text(f['ten_nha_may']?.toString() ?? '', overflow: TextOverflow.ellipsis),
                          );
                        }).toList(),
                        onChanged: (val) => setState(() => _selectedFactoryId = val),
                        validator: (v) => _proposalMode == 'system' && v == null ? 'Vui lòng chọn nhà máy' : null,
                      ),
                      const SizedBox(height: 12),
                    ] else ...[
                      TextFormField(
                        controller: _companyNameCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Tên doanh nghiệp / Nhà máy',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.business),
                        ),
                        validator: (v) => _proposalMode == 'custom' && (v == null || v.trim().isEmpty) ? 'Vui lòng nhập tên doanh nghiệp' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _addressCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Địa chỉ (Tỉnh/Thành phố)',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.location_on),
                        ),
                        validator: (v) => _proposalMode == 'custom' && (v == null || v.trim().isEmpty) ? 'Vui lòng nhập địa chỉ' : null,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _contactPersonCtrl,
                              decoration: const InputDecoration(
                                labelText: 'Người liên hệ',
                                border: OutlineInputBorder(),
                                prefixIcon: Icon(Icons.person),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextFormField(
                              controller: _contactPhoneCtrl,
                              keyboardType: TextInputType.phone,
                              decoration: const InputDecoration(
                                labelText: 'SĐT liên hệ',
                                border: OutlineInputBorder(),
                                prefixIcon: Icon(Icons.phone),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                    ],

                    // Date & Time pickers
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: _selectedDate,
                                firstDate: DateTime.now(),
                                lastDate: DateTime.now().add(const Duration(days: 365)),
                              );
                              if (picked != null) setState(() => _selectedDate = picked);
                            },
                            child: InputDecorator(
                              decoration: const InputDecoration(
                                labelText: 'Ngày dự kiến',
                                border: OutlineInputBorder(),
                                prefixIcon: Icon(Icons.calendar_today, size: 18),
                              ),
                              child: Text('${_selectedDate.day.toString().padLeft(2, '0')}/${_selectedDate.month.toString().padLeft(2, '0')}/${_selectedDate.year}', style: const TextStyle(fontSize: 13)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: InkWell(
                            onTap: () async {
                              final picked = await showTimePicker(
                                context: context,
                                initialTime: _selectedTime,
                              );
                              if (picked != null) setState(() => _selectedTime = picked);
                            },
                            child: InputDecorator(
                              decoration: const InputDecoration(
                                labelText: 'Giờ bắt đầu',
                                border: OutlineInputBorder(),
                                prefixIcon: Icon(Icons.access_time, size: 18),
                              ),
                              child: Text('${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}', style: const TextStyle(fontSize: 13)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Format dropdown (Trực tiếp / Trực tuyến)
                    DropdownButtonFormField<String>(
                      value: _selectedTripType,
                      decoration: const InputDecoration(
                        labelText: 'Hình thức tham quan',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.laptop),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'TrucTiep', child: Text('Kiến tập trực tiếp')),
                        DropdownMenuItem(value: 'TrucTuyen', child: Text('Kiến tập trực tuyến')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedTripType = val);
                      },
                    ),
                    const SizedBox(height: 12),

                    TextFormField(
                      controller: _descriptionCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Lý do đề xuất / Nguyện vọng',
                        border: OutlineInputBorder(),
                        alignLabelWithHint: true,
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),

                    ElevatedButton(
                      onPressed: _isProposing
                          ? null
                          : () async {
                              if (_formKey.currentState!.validate()) {
                                setState(() => _isProposing = true);
                                try {
                                  final timeStr = '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}';
                                  await appStateProvider.proposeTrip(
                                    factoryId: _proposalMode == 'system' ? _selectedFactoryId : null,
                                    companyName: _proposalMode == 'custom' ? _companyNameCtrl.text.trim() : null,
                                    address: _proposalMode == 'custom' ? _addressCtrl.text.trim() : null,
                                    contactPerson: _contactPersonCtrl.text.trim().isNotEmpty ? _contactPersonCtrl.text.trim() : null,
                                    contactPhone: _contactPhoneCtrl.text.trim().isNotEmpty ? _contactPhoneCtrl.text.trim() : null,
                                    visitDate: _selectedDate,
                                    startTime: timeStr,
                                    type: _selectedTripType,
                                  );

                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Đã gửi đề xuất chuyến đi thành công!'),
                                        backgroundColor: AppColors.secondary,
                                      ),
                                    );
                                    _companyNameCtrl.clear();
                                    _addressCtrl.clear();
                                    _contactPersonCtrl.clear();
                                    _contactPhoneCtrl.clear();
                                    _descriptionCtrl.clear();
                                  }
                                } catch (e) {
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Lỗi: $e'), backgroundColor: AppColors.danger),
                                    );
                                  }
                                } finally {
                                  if (mounted) setState(() => _isProposing = false);
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: _isProposing
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text('GỬI ĐỀ XUẤT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Proposal History Section
          const Text(
            'Các đề xuất đã gửi',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
          ),
          const SizedBox(height: 8),

          if (proposals.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.beigeBorder),
              ),
              child: const Text(
                'Bạn chưa gửi đề xuất chuyến tham quan nào.',
                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              ),
            )
          else
            ...proposals.map((prop) {
              Color statusColor = AppColors.warning;
              String statusLabel = 'Chờ duyệt';
              if (prop.trangThai == 'ChapNhan' || prop.trangThai == 'Approved') {
                statusColor = AppColors.secondary;
                statusLabel = 'Đã chấp nhận';
              } else if (prop.trangThai == 'TuChoi' || prop.trangThai == 'Rejected') {
                statusColor = AppColors.danger;
                statusLabel = 'Từ chối';
              }

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(14.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              prop.tenDoanhNghiep,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                            ),
                            child: Text(
                              statusLabel,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: statusColor == AppColors.warning ? AppColors.darkSlate : statusColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (prop.diaChi != null) ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on, size: 12, color: AppColors.textMuted),
                            const SizedBox(width: 4),
                            Expanded(child: Text(prop.diaChi!, style: const TextStyle(fontSize: 11, color: AppColors.textMuted))),
                          ],
                        ),
                      ],
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          if (prop.ngayThamQuan != null) ...[
                            const Icon(Icons.calendar_today, size: 12, color: AppColors.textMuted),
                            const SizedBox(width: 4),
                            Text(prop.ngayThamQuan!, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                            const SizedBox(width: 12),
                          ],
                          if (prop.hinhThuc != null) ...[
                            const Icon(Icons.laptop, size: 12, color: AppColors.textMuted),
                            const SizedBox(width: 4),
                            Text(prop.hinhThuc!, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                          ],
                        ],
                      ),
                      if (prop.phanHoi != null && prop.phanHoi!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Phản hồi từ Khoa/CLB: ${prop.phanHoi}',
                            style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppColors.darkSlate),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
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
                    onPressed: () async {
                      try {
                        await appStateProvider.registerTrip(trip.id);
                        if (context.mounted) {
                          onBack();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Đăng ký thành công chuyến ${trip.name}')),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Đăng ký thất bại: $e')),
                          );
                        }
                      }
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
                            _showCancelDialog(context, trip, appStateProvider, onBack: onBack);
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
