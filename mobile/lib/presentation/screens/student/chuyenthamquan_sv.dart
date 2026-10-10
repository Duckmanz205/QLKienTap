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
        builder: (context, setState) {
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
                          setState(() {
                            localPath = pickerResult.files.single.path;
                            fileName = pickerResult.files.single.name;
                          });
                        }
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Lỗi chọn file: $e')),
                        );
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

                        setState(() => isSubmitting = true);
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
                          if (context.mounted) {
                            setState(() => isSubmitting = false);
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
  final _descriptionCtrl = TextEditingController();
  bool _isProposing = false;

  @override
  void dispose() {
    _companyNameCtrl.dispose();
    _addressCtrl.dispose();
    _descriptionCtrl.dispose();
    super.dispose();
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
              _buildTab('propose', 'Đề xuất'),
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
        }
      },
      child: content,
    );
  }

  Widget _buildAvailableTripsTab(List<Trip> trips, AppStateProviderState appStateProvider) {
    return PaginatedList<Trip>(
      items: trips,
      searchHint: 'Tìm kiếm chuyến...',
      dropdownTitle: 'Loại',
      dropdownOptions: const ['Tất cả', 'Trực tiếp', 'Trực tuyến'],
      itemName: 'chuyến',
      emptyWidget: const Center(child: Text('Không có chuyến nào có sẵn để đăng ký.')),
      filter: (trip, query, type) {
        final matchesQuery = trip.name.toLowerCase().contains(query.toLowerCase());
        final matchesType = type == 'Tất cả' || trip.type == type;
        return matchesQuery && matchesType;
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
                  onPressed: () async {
                    try {
                      await appStateProvider.registerTrip(trip.id);
                      if (context.mounted) {
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
                          _showCancelDialog(context, trip, appStateProvider);
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

  Widget _buildProposeTab(AppStateProviderState appStateProvider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Đề xuất doanh nghiệp/nhà máy',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
            ),
            const SizedBox(height: 8),
            const Text(
              'Nếu bạn biết một doanh nghiệp phù hợp cho chuyên ngành, hãy đề xuất để khoa xem xét liên hệ tổ chức chuyến đi.',
              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _companyNameCtrl,
              decoration: const InputDecoration(
                labelText: 'Tên doanh nghiệp / Nhà máy',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.business),
              ),
              validator: (v) => v == null || v.isEmpty ? 'Vui lòng nhập tên doanh nghiệp' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _addressCtrl,
              decoration: const InputDecoration(
                labelText: 'Địa chỉ (Tỉnh/Thành phố)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.location_on),
              ),
              validator: (v) => v == null || v.isEmpty ? 'Vui lòng nhập địa chỉ' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descriptionCtrl,
              decoration: const InputDecoration(
                labelText: 'Lý do đề xuất / Thông tin thêm',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 4,
              validator: (v) => v == null || v.isEmpty ? 'Vui lòng nhập lý do' : null,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isProposing
                  ? null
                  : () async {
                      if (_formKey.currentState!.validate()) {
                        setState(() => _isProposing = true);
                        try {
                          await appStateProvider.proposeTrip(
                            _companyNameCtrl.text,
                            _addressCtrl.text,
                            _descriptionCtrl.text,
                          );
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Đã gửi đề xuất thành công!')),
                            );
                            _companyNameCtrl.clear();
                            _addressCtrl.clear();
                            _descriptionCtrl.clear();
                            widget.onTabChanged('available');
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
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isProposing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('GỬI ĐỀ XUẤT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ],
        ),
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
