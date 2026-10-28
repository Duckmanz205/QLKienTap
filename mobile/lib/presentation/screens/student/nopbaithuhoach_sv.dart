import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';
import '../../widgets/paginated_list.dart';
import 'kiemtra_baocao_sv.dart';

class NopBaiThuHoachSVScreen extends StatefulWidget {
  const NopBaiThuHoachSVScreen({super.key});

  @override
  State<NopBaiThuHoachSVScreen> createState() => _NopBaiThuHoachSVScreenState();
}

class _NopBaiThuHoachSVScreenState extends State<NopBaiThuHoachSVScreen> {
  // State values for file uploads
  final Map<String, String> _uploadedReports = {};
  final Map<String, String> _uploadedConfirms = {};
  final Map<String, String> _reportFileSizes = {};

  // Uploading states
  final Map<String, bool> _uploadingReports = {};
  final Map<String, bool> _uploadingConfirms = {};

  // Campaign checklist
  final Set<String> _campaignSelectedTrips = {};
  bool _isSavingRepTrips = false;
  bool _hasInitializedRepTrips = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasInitializedRepTrips) {
      _hasInitializedRepTrips = true;
      _initData();
    }
  }

  Future<void> _initData() async {
    final appStateProvider = AppStateProvider.of(context);
    await appStateProvider.fetchRepresentativeTripsStatus();
    if (mounted) {
      final repStatus = appStateProvider.state.repStatus;
      if (repStatus != null && repStatus.selectedRegistrationIds.isNotEmpty) {
        setState(() {
          _campaignSelectedTrips.clear();
          for (var id in repStatus.selectedRegistrationIds) {
            _campaignSelectedTrips.add(id.toString());
          }
        });
      }
    }
  }

  Future<void> _handleSaveRepresentativeTrips(List<Submission> allSubs) async {
    final appStateProvider = AppStateProvider.of(context);
    final repStatus = appStateProvider.state.repStatus;

    if (repStatus?.isLockedByKhoa == true) {
      String lockMsg = 'Khoa đã chốt danh sách hội đồng. Không thể thay đổi bộ chuyến đi.';
      if (repStatus?.lockReason == 'COUNCIL_ASSIGNED') {
        lockMsg = 'Bạn đã được Khoa phân công vào Hội đồng bảo vệ. Danh sách Bộ 3 chuyến báo cáo đã được cố định chính thức.';
      } else if (repStatus?.lockReason == 'GRADES_LOCKED') {
        lockMsg = 'Điểm báo cáo của bộ chuyến đã được chốt/khóa sổ. Không thể thay đổi.';
      } else if (repStatus?.lockReason == 'DOT_LOCKED') {
        lockMsg = 'Đợt kiến tập đã kết thúc hoặc đang bị khóa.';
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(lockMsg),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    if (_campaignSelectedTrips.length != 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chọn đúng chính xác 3 chuyến tham quan báo cáo.'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    final selectedSubs = allSubs.where((s) => _campaignSelectedTrips.contains(s.id)).toList();

    // 1. Kiểm tra quy định thời hạn 18 tháng theo quy chế HUIT
    final now = DateTime.now();
    final eighteenMonthsAgo = DateTime(now.year, now.month - 18, now.day);
    for (final s in selectedSubs) {
      DateTime? tripDate = s.tripDate;
      if (tripDate == null && s.dateText.isNotEmpty) {
        final parts = s.dateText.split(RegExp(r'[/.-]'));
        if (parts.length == 3) {
          if (parts[0].length == 4) {
            tripDate = DateTime.tryParse('${parts[0]}-${parts[1].padLeft(2, '0')}-${parts[2].padLeft(2, '0')}');
          } else {
            tripDate = DateTime.tryParse('${parts[2]}-${parts[1].padLeft(2, '0')}-${parts[0].padLeft(2, '0')}');
          }
        }
      }
      if (tripDate != null && tripDate.isBefore(eighteenMonthsAgo)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Chuyến đi "${s.tripName}" (${s.dateText}) đã quá 18 tháng kể từ ngày tham quan, không được phép đưa vào Bộ 3 chuyến báo cáo theo quy chế HUIT.',
            ),
            backgroundColor: AppColors.danger,
          ),
        );
        return;
      }
    }

    // 2. Kiểm tra tối thiểu 2 chuyến trực tiếp
    final directCount = selectedSubs.where((s) {
      final lower = s.typeText.toLowerCase();
      return lower.contains('trực tiếp') || lower.contains('tructiep');
    }).length;

    if (directCount < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Quy định: Cần tối thiểu 2 chuyến kiến tập trực tiếp.'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    // 3. Kiểm tra không trùng lặp nhà máy
    final uniqueTripNames = selectedSubs.map((s) => s.tripName.trim().toLowerCase()).toSet();
    if (uniqueTripNames.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Các chuyến tham quan được chọn không được trùng nhà máy.'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    setState(() => _isSavingRepTrips = true);
    try {
      final regIds = _campaignSelectedTrips.map((id) => int.tryParse(id) ?? 0).where((id) => id > 0).toList();
      await appStateProvider.selectRepresentativeTrips(regIds);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã cập nhật bộ 3 chuyến tham quan báo cáo thành công!'),
            backgroundColor: AppColors.secondary,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi lưu bộ chuyến: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSavingRepTrips = false);
      }
    }
  }

  Future<void> _confirmDeleteReport(Submission sub) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận xóa bài nộp', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Text('Bạn có chắc chắn muốn xóa bài báo cáo thu hoạch cho chuyến "${sub.tripName}"? Tệp đã nộp sẽ bị xóa khỏi hệ thống.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('HỦY', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger, foregroundColor: Colors.white),
            child: const Text('XÓA BÀI NỘP'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final appStateProvider = AppStateProvider.of(context);
      try {
        await appStateProvider.deleteReport(sub.id);
        setState(() {
          _uploadedReports.remove(sub.id);
          _reportFileSizes.remove(sub.id);
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã xóa bài báo cáo thu hoạch thành công!')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Lỗi xóa bài: $e'), backgroundColor: AppColors.danger),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;
    final repStatus = appState.repStatus;
    final isLocked = repStatus?.isLockedByKhoa == true;

    return PaginatedList<Submission>(
      items: appState.submissions,
      searchHint: 'Tìm chuyến đi...',
      dropdownTitle: 'Trạng thái',
      dropdownOptions: const ['Tất cả', 'Đã nộp', 'Chưa nộp', 'Trễ hạn - trừ điểm'],
      itemName: 'bài thu hoạch',
      filter: (sub, query, status) {
        final matchQuery = sub.tripName.toLowerCase().contains(query.toLowerCase());
        final matchStatus = status == 'Tất cả' || sub.status == status;
        return matchQuery && matchStatus;
      },
      headerWidgetBuilder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Council Info banner if assigned
            if (repStatus != null && repStatus.councilSessionName != null) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.primary, width: 1.5),
                  boxShadow: [
                    BoxShadow(color: AppColors.primary.withValues(alpha: 0.08), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.groups, color: AppColors.primary, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            repStatus.councilSessionName!,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.primary),
                          ),
                        ),
                        if (isLocked)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.danger.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('Đã chốt', style: TextStyle(color: AppColors.danger, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                    const Divider(height: 16),
                    if (repStatus.councilRoom != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Row(
                          children: [
                            const Icon(Icons.room, size: 14, color: AppColors.textMuted),
                            const SizedBox(width: 6),
                            Text('Phòng: ${repStatus.councilRoom}', style: const TextStyle(fontSize: 12, color: AppColors.darkSlate)),
                          ],
                        ),
                      ),
                    if (repStatus.councilTime != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Row(
                          children: [
                            const Icon(Icons.access_time, size: 14, color: AppColors.textMuted),
                            const SizedBox(width: 6),
                            Text('Thời gian: ${repStatus.councilTime}', style: const TextStyle(fontSize: 12, color: AppColors.darkSlate)),
                          ],
                        ),
                      ),
                    if (repStatus.councilMembers.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          'Hội đồng: ${repStatus.councilMembers.join(', ')}',
                          style: TextStyle(fontSize: 11, color: Colors.grey.shade600, fontStyle: FontStyle.italic),
                        ),
                      ),
                  ],
                ),
              ),
            ],
            const Text(
              'Danh sách chuyến đi hoàn thành',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
            ),
          ],
        ),
      ),
      footerWidget: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.beigeBorder, width: 1.5),
            boxShadow: const [
              BoxShadow(color: AppColors.cardShadow, blurRadius: 8, offset: Offset(0, 2)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Expanded(
                    child: Text(
                      'Bộ 3 chuyến tham quan báo cáo',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: _campaignSelectedTrips.length == 3 ? AppColors.secondary.withValues(alpha: 0.2) : Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${_campaignSelectedTrips.length}/3 chuyến',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: _campaignSelectedTrips.length == 3 ? AppColors.primary : AppColors.textMuted,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Quy định: Chọn tối thiểu 2 chuyến trực tiếp + 1 chuyến trực tuyến/tự do tại các doanh nghiệp khác nhau để gửi hội đồng.',
                style: TextStyle(fontSize: 11, color: AppColors.textMuted),
              ),
              if (isLocked) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.amber.shade300),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.lock, size: 16, color: Colors.orange),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          repStatus?.lockReason == 'COUNCIL_ASSIGNED'
                              ? 'Bạn đã được Khoa phân công vào Hội đồng bảo vệ. Danh sách Bộ 3 chuyến báo cáo đã được cố định chính thức.'
                              : repStatus?.lockReason == 'GRADES_LOCKED'
                                  ? 'Điểm báo cáo của bộ chuyến đã được chốt/khóa sổ. Không thể thay đổi.'
                                  : repStatus?.lockReason == 'DOT_LOCKED'
                                      ? 'Đợt kiến tập đã kết thúc hoặc đang bị khóa.'
                                      : 'Quản lý Khoa đã khóa cổng đăng ký cho đợt này. Bạn không thể thực hiện chọn hoặc thay đổi bộ chuyến.',
                          style: const TextStyle(fontSize: 11, color: Colors.brown, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 12),

              ...appState.submissions.map((s) {
                final isSelected = _campaignSelectedTrips.contains(s.id);
                
                DateTime? tripDate = s.tripDate;
                if (tripDate == null && s.dateText.isNotEmpty) {
                  final parts = s.dateText.split(RegExp(r'[/.-]'));
                  if (parts.length == 3) {
                    if (parts[0].length == 4) {
                      tripDate = DateTime.tryParse('${parts[0]}-${parts[1].padLeft(2, '0')}-${parts[2].padLeft(2, '0')}');
                    } else {
                      tripDate = DateTime.tryParse('${parts[2]}-${parts[1].padLeft(2, '0')}-${parts[0].padLeft(2, '0')}');
                    }
                  }
                }
                final now = DateTime.now();
                final eighteenMonthsAgo = DateTime(now.year, now.month - 18, now.day);
                final isExpired = tripDate != null && tripDate.isBefore(eighteenMonthsAgo);

                return Material(
                  color: Colors.transparent,
                  child: CheckboxListTile(
                  value: isSelected,
                  onChanged: (isLocked || isExpired)
                      ? null
                      : (val) {
                          setState(() {
                            if (val == true) {
                              if (_campaignSelectedTrips.length < 3) {
                                _campaignSelectedTrips.add(s.id);
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Chỉ được chọn tối đa 3 chuyến tham quan báo cáo.')),
                                );
                              }
                            } else {
                              _campaignSelectedTrips.remove(s.id);
                            }
                          });
                        },
                  title: Row(
                    children: [
                      Expanded(
                        child: Text(s.tripName, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isExpired ? Colors.grey : AppColors.darkSlate)),
                      ),
                      if (isExpired)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.danger.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('Quá 18 tháng', style: TextStyle(color: AppColors.danger, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                  subtitle: Text('${s.typeText} • ${s.dateText}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  controlAffinity: ListTileControlAffinity.leading,
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                ),
              );
            }),
              const SizedBox(height: 16),

              ElevatedButton(
                onPressed: (!isLocked && _campaignSelectedTrips.length == 3 && !_isSavingRepTrips)
                    ? () => _handleSaveRepresentativeTrips(appState.submissions)
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: Colors.grey.shade300,
                  disabledForegroundColor: Colors.grey.shade500,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: _isSavingRepTrips
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('XÁC NHẬN LỰA CHỌN BỘ 3 CHUYẾN', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
      itemBuilder: (sub) {
        Color statusColor = AppColors.warning;
        if (sub.status == 'Đã nộp') statusColor = AppColors.secondary;
        if (sub.status == 'Trễ hạn - trừ điểm') statusColor = AppColors.danger;

        final isUploaded = _uploadedReports.containsKey(sub.id) || sub.fileName != null;
        final isConfirmUploaded = _uploadedConfirms.containsKey(sub.id) || sub.hasConfirmationFile;

        final isUploadingReport = _uploadingReports[sub.id] ?? false;
        final isUploadingConfirm = _uploadingConfirms[sub.id] ?? false;

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
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
                        sub.tripName,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        sub.status,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: statusColor == AppColors.warning ? AppColors.darkSlate : statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  '${sub.typeText} • ${sub.dateText}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                ),
                const Divider(height: 24),

                _buildUploadDropzone(
                  title: 'Bài báo cáo thu hoạch (PDF)',
                  isUploaded: isUploaded,
                  isUploading: isUploadingReport,
                  fileName: _uploadedReports[sub.id] ?? sub.fileName,
                  fileSize: _reportFileSizes[sub.id] ?? sub.fileSize,
                  onViewTap: sub.fileBaoCaoUrl != null
                      ? () async {
                          final uri = Uri.parse(sub.fileBaoCaoUrl!);
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri, mode: LaunchMode.externalApplication);
                          }
                        }
                      : null,
                  onDeleteTap: isUploaded ? () => _confirmDeleteReport(sub) : null,
                  onTap: () async {
                    if (isUploadingReport) return;
                    try {
                      final pickerResult = await FilePicker.pickFiles(
                        type: FileType.custom,
                        allowedExtensions: ['pdf'],
                      );
                      if (pickerResult != null && pickerResult.files.single.path != null) {
                        final file = pickerResult.files.single;
                        final sizeInMb = file.size / (1024 * 1024);
                        final fileSizeStr = '${sizeInMb.toStringAsFixed(1)} MB';

                        if (!context.mounted) return;
                        final success = await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => KiemTraBaoCaoSVScreen(
                              submissionId: sub.id,
                              filePath: file.path!,
                              fileName: file.name,
                              fileSize: fileSizeStr,
                            ),
                          ),
                        );

                        if (success == true) {
                          setState(() {
                            _uploadedReports[sub.id] = file.name;
                            _reportFileSizes[sub.id] = fileSizeStr;
                          });
                        }
                      }
                    } catch (e) {
                      if (!context.mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Lỗi chọn file: $e'), backgroundColor: AppColors.danger),
                      );
                    }
                  },
                ),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  alignment: WrapAlignment.spaceBetween,
                  children: [
                    TextButton.icon(
                      onPressed: () async {
                        final uri = Uri.parse('${ApiService.baseUrl}/upload/file/templates/huong_dan_viet_bao_cao.pdf');
                        if (await canLaunchUrl(uri)) {
                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                        }
                      },
                      icon: const Icon(Icons.picture_as_pdf, size: 14, color: AppColors.primary),
                      label: const Text('Quy chuẩn Báo cáo (PDF)', style: TextStyle(fontSize: 11, color: AppColors.primary)),
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                    TextButton.icon(
                      onPressed: () async {
                        final uri = Uri.parse('${ApiService.baseUrl}/upload/file/templates/mau_nhat_ky_thuc_tap.xlsx');
                        if (await canLaunchUrl(uri)) {
                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                        }
                      },
                      icon: const Icon(Icons.table_chart, size: 14, color: AppColors.secondary),
                      label: const Text('Mẫu Nhật ký (Excel)', style: TextStyle(fontSize: 11, color: AppColors.secondary)),
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                  ],
                ),

                if (sub.tripName.contains('Cát Lái') || sub.typeText.contains('tự do')) ...[
                  const SizedBox(height: 12),
                  _buildUploadDropzone(
                    title: 'Giấy xác nhận tham quan (bắt buộc)',
                    isUploaded: isConfirmUploaded,
                    isUploading: isUploadingConfirm,
                    fileName: _uploadedConfirms[sub.id] ?? sub.confirmationFileName,
                    fileSize: isConfirmUploaded ? 'Đã đính kèm' : null,
                    onViewTap: sub.fileXacNhanUrl != null
                        ? () async {
                            final uri = Uri.parse(sub.fileXacNhanUrl!);
                            if (await canLaunchUrl(uri)) {
                              await launchUrl(uri, mode: LaunchMode.externalApplication);
                            }
                          }
                        : null,
                    onTap: () async {
                      if (isUploadingConfirm) return;
                      try {
                        final pickerResult = await FilePicker.pickFiles(
                          type: FileType.custom,
                          allowedExtensions: ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'],
                        );
                        if (pickerResult != null && pickerResult.files.single.path != null) {
                          final file = pickerResult.files.single;
                          setState(() {
                            _uploadingConfirms[sub.id] = true;
                          });

                          final success = await appStateProvider.uploadConfirmationFile(
                            sub.id,
                            file.path!,
                            file.name,
                          );

                          if (!context.mounted) return;

                          setState(() {
                            _uploadingConfirms[sub.id] = false;
                            if (success) {
                              _uploadedConfirms[sub.id] = file.name;
                            }
                          });

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(success ? 'Nộp giấy xác nhận thành công!' : 'Nộp giấy xác nhận thất bại.'),
                              backgroundColor: success ? AppColors.secondary : AppColors.danger,
                            ),
                          );
                        }
                      } catch (e) {
                        if (!context.mounted) return;
                        setState(() {
                          _uploadingConfirms[sub.id] = false;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Lỗi chọn/tải file lên: $e'), backgroundColor: AppColors.danger),
                        );
                      }
                    },
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildUploadDropzone({
    required String title,
    required bool isUploaded,
    required bool isUploading,
    required String? fileName,
    required String? fileSize,
    required VoidCallback onTap,
    VoidCallback? onViewTap,
    VoidCallback? onDeleteTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isUploaded ? AppColors.secondary.withValues(alpha: 0.5) : AppColors.beigeBorder,
            style: BorderStyle.solid,
            width: 1.5,
          ),
        ),
        child: Row(
          children: [
            isUploading
                ? const SizedBox(
                    width: 28,
                    height: 28,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                  )
                : Icon(
                    isUploaded ? Icons.check_circle : Icons.cloud_upload_outlined,
                    color: isUploaded ? AppColors.secondary : AppColors.primary,
                    size: 28,
                  ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isUploaded ? AppColors.secondary : AppColors.darkSlate,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isUploaded ? '$fileName${fileSize != null ? ' ($fileSize)' : ''}' : 'Bấm để chọn file tài liệu',
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (isUploaded && !isUploading)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (onViewTap != null)
                    IconButton(
                      icon: const Icon(Icons.remove_red_eye_outlined, size: 20, color: AppColors.primary),
                      onPressed: onViewTap,
                      tooltip: 'Xem tài liệu',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  if (onDeleteTap != null) ...[
                    const SizedBox(width: 10),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.danger),
                      onPressed: onDeleteTap,
                      tooltip: 'Xóa bài nộp',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                  if (onViewTap == null && onDeleteTap == null)
                    const Icon(Icons.cached, size: 20, color: AppColors.textMuted),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
