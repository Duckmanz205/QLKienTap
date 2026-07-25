import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';

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

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Danh sách chuyến đi hoàn thành',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
          ),
          const SizedBox(height: 12),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: appState.submissions.length,
            itemBuilder: (context, index) {
              final sub = appState.submissions[index];
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
                        title: 'Bài báo cáo thu hoạch (PDF/DOCX)',
                        isUploaded: isUploaded,
                        isUploading: isUploadingReport,
                        fileName: _uploadedReports[sub.id] ?? sub.fileName,
                        fileSize: _reportFileSizes[sub.id] ?? sub.fileSize,
                        onTap: () async {
                          if (isUploadingReport) return;
                          try {
                            final pickerResult = await FilePicker.pickFiles(
                              type: FileType.custom,
                              allowedExtensions: ['pdf', 'docx', 'doc'],
                            );
                            if (pickerResult != null && pickerResult.files.single.path != null) {
                              final file = pickerResult.files.single;
                              setState(() {
                                _uploadingReports[sub.id] = true;
                              });

                              final sizeInMb = file.size / (1024 * 1024);
                              final fileSizeStr = '${sizeInMb.toStringAsFixed(1)} MB';

                              final success = await appStateProvider.uploadReport(
                                sub.id,
                                file.path!,
                                file.name,
                                fileSizeStr,
                              );

                              setState(() {
                                _uploadingReports[sub.id] = false;
                                if (success) {
                                  _uploadedReports[sub.id] = file.name;
                                  _reportFileSizes[sub.id] = fileSizeStr;
                                }
                              });

                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(success ? 'Nộp báo cáo thành công!' : 'Nộp báo cáo thất bại.'),
                                  backgroundColor: success ? AppColors.secondary : AppColors.danger,
                                ),
                              );
                            }
                          } catch (e) {
                            setState(() {
                              _uploadingReports[sub.id] = false;
                            });
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Lỗi chọn/tải file lên: $e'), backgroundColor: AppColors.danger),
                            );
                          }
                        },
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
          ),
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.appBackground,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.primary, width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Chọn bộ chuyến báo cáo',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Chọn tối thiểu 2 trực tiếp + 1 trực tuyến/tự do để tạo bộ báo cáo gửi hội đồng.',
                  style: TextStyle(fontSize: 11, color: AppColors.darkSlate),
                ),
                const SizedBox(height: 12),
                
                ...appState.submissions.map((sub) {
                  final isSelected = _campaignSelectedTrips.contains(sub.id);
                  return CheckboxListTile(
                    value: isSelected,
                    onChanged: (val) {
                      setState(() {
                        if (val == true) {
                          _campaignSelectedTrips.add(sub.id);
                        } else {
                          _campaignSelectedTrips.remove(sub.id);
                        }
                      });
                    },
                    title: Text(sub.tripName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    subtitle: Text(sub.typeText, style: const TextStyle(fontSize: 10)),
                    controlAffinity: ListTileControlAffinity.leading,
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                  );
                }),
                const SizedBox(height: 16),
                
                ElevatedButton(
                  onPressed: _campaignSelectedTrips.length >= 3
                      ? () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Xác nhận lựa chọn bộ chuyến báo cáo thành công!')),
                          );
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey.shade300,
                    disabledForegroundColor: Colors.grey.shade500,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('XÁC NHẬN LỰA CHỌN', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUploadDropzone({
    required String title,
    required bool isUploaded,
    required bool isUploading,
    required String? fileName,
    required String? fileSize,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isUploaded ? AppColors.secondary.withValues(alpha: 0.5) : const Color(0xFFE7E0C4),
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
                    isUploaded
                        ? '$fileName${fileSize != null ? ' ($fileSize)' : ''}'
                        : 'Bấm để chọn file tài liệu',
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            if (isUploaded && !isUploading)
              const Icon(Icons.cached, size: 16, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
