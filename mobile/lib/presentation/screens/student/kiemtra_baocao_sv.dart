import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';
import '../../../core/network/api_service.dart';

class KiemTraBaoCaoSVScreen extends StatefulWidget {
  final String submissionId;
  final String filePath;
  final String fileName;
  final String fileSize;
  final bool isTuDo;
  final String? fileXacNhanUrl;
  final String? confirmationFileName;

  const KiemTraBaoCaoSVScreen({
    super.key,
    required this.submissionId,
    required this.filePath,
    required this.fileName,
    required this.fileSize,
    this.isTuDo = false,
    this.fileXacNhanUrl,
    this.confirmationFileName,
  });

  @override
  State<KiemTraBaoCaoSVScreen> createState() => _KiemTraBaoCaoSVScreenState();
}

class _KiemTraBaoCaoSVScreenState extends State<KiemTraBaoCaoSVScreen> {
  bool _isChecked = false;
  bool _isSubmitting = false;
  bool _hasExtracted = false;

  String? _localConfirmationPath;
  String? _localConfirmationName;

  final TextEditingController _txtController = TextEditingController(
    text: "Đang tải nội dung...",
  );

  @override
  void initState() {
    super.initState();
    _extractTextInBackground();
  }

  Future<void> _extractTextInBackground() async {
    try {
      final text = await ApiService.extractTextFromPdf(widget.filePath);
      if (mounted) {
        setState(() {
          _hasExtracted = true;
          if (text != null && text.isNotEmpty) {
            _txtController.text = text;
          } else {
            _txtController.text = '';
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _hasExtracted = true;
          _txtController.text = '';
        });
      }
    }
  }

  @override
  void dispose() {
    _txtController.dispose();
    super.dispose();
  }

  bool get _hasConfirmation =>
      _localConfirmationPath != null ||
      (widget.fileXacNhanUrl != null && widget.fileXacNhanUrl!.isNotEmpty);

  bool get _canSubmit {
    if (_isSubmitting) return false;
    if (!_isChecked) return false;
    if (widget.isTuDo && !_hasConfirmation) return false;
    return true;
  }

  Future<void> _pickConfirmationFile() async {
    try {
      final result = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
      );
      if (result != null && result.files.single.path != null) {
        final file = result.files.single;
        if (file.size > 5 * 1024 * 1024) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Dung lượng giấy xác nhận tối đa là 5MB.'),
              backgroundColor: AppColors.danger,
            ),
          );
          return;
        }
        setState(() {
          _localConfirmationPath = file.path;
          _localConfirmationName = file.name;
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lỗi chọn file: $e'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  Future<void> _submitReport() async {
    if (!_isChecked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng xác nhận đã kiểm tra nội dung hoàn chỉnh.'),
        ),
      );
      return;
    }

    if (widget.isTuDo && !_hasConfirmation) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Chuyến tham quan tự do bắt buộc phải có Giấy xác nhận tham quan doanh nghiệp (có dấu mộc đỏ).',
          ),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    final appStateProvider = AppStateProvider.of(context);
    try {
      final success = await appStateProvider.uploadReport(
        widget.submissionId,
        widget.filePath,
        widget.fileName,
        widget.fileSize,
        extractedText: _hasExtracted ? _txtController.text : null,
        fileXacNhanUrl: widget.fileXacNhanUrl,
        localConfirmationPath: _localConfirmationPath,
        confirmationFileName: _localConfirmationName,
      );

      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                widget.isTuDo
                    ? 'Nộp bài thành công! Giấy xác nhận đã được gửi cho Giảng viên duyệt điểm danh.'
                    : 'Nộp báo cáo thành công!',
              ),
              backgroundColor: AppColors.secondary,
            ),
          );
          Navigator.of(context).pop(true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Nộp báo cáo thất bại.'),
              backgroundColor: AppColors.danger,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi nộp bài: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kiểm tra file PDF'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
      ),
      body: Column(
        children: [
          Expanded(child: _buildPdfView()),

          // Action Buttons Bottom Area
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  offset: const Offset(0, -4),
                  blurRadius: 10,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.isTuDo) ...[
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _hasConfirmation
                          ? const Color(0xFFEEF2FF)
                          : const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: _hasConfirmation
                            ? const Color(0xFFC7D2FE)
                            : const Color(0xFFFECACA),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              _hasConfirmation
                                  ? Icons.verified
                                  : Icons.warning_amber_rounded,
                              size: 18,
                              color: _hasConfirmation
                                  ? const Color(0xFF4F46E5)
                                  : AppColors.danger,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _hasConfirmation
                                    ? 'Giấy xác nhận DN (Bắt buộc)'
                                    : 'Thiếu Giấy xác nhận DN (Bắt buộc)',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: _hasConfirmation
                                      ? const Color(0xFF3730A3)
                                      : AppColors.danger,
                                ),
                              ),
                            ),
                            TextButton.icon(
                              onPressed: _pickConfirmationFile,
                              icon: Icon(
                                _hasConfirmation
                                    ? Icons.change_circle_outlined
                                    : Icons.upload_file,
                                size: 16,
                              ),
                              label: Text(
                                _hasConfirmation
                                    ? 'Thay đổi'
                                    : 'Đính kèm ngay',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                minimumSize: Size.zero,
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _localConfirmationName != null
                              ? 'Tệp vừa chọn: $_localConfirmationName'
                              : (widget.confirmationFileName ??
                                  (widget.fileXacNhanUrl != null
                                      ? 'Đã có giấy xác nhận đã nộp trước đó'
                                      : 'Chuyến tự do bắt buộc phải có Giấy xác nhận tham quan doanh nghiệp (có dấu mộc đỏ).')),
                          style: TextStyle(
                            fontSize: 11,
                            color: _hasConfirmation
                                ? Colors.indigo.shade800
                                : Colors.red.shade700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],

                Row(
                  children: [
                    SizedBox(
                      height: 24,
                      width: 24,
                      child: Checkbox(
                        value: _isChecked,
                        onChanged: (val) {
                          setState(() {
                            _isChecked = val ?? false;
                          });
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Đã kiểm tra nội dung hoàn chỉnh',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _canSubmit ? _submitReport : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: Colors.grey.shade300,
                      disabledForegroundColor: Colors.grey.shade500,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            widget.isTuDo && !_hasConfirmation
                                ? 'Vui lòng đính kèm Giấy xác nhận'
                                : 'Nộp bài cho giảng viên',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPdfView() {
    return SfPdfViewer.file(
      File(widget.filePath),
      canShowScrollHead: false,
      canShowScrollStatus: false,
    );
  }
}
