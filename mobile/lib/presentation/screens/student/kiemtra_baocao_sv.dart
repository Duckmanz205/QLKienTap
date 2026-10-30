import 'dart:io';
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';
import '../../../core/network/api_service.dart';

class KiemTraBaoCaoSVScreen extends StatefulWidget {
  final String submissionId;
  final String filePath;
  final String fileName;
  final String fileSize;

  const KiemTraBaoCaoSVScreen({
    super.key,
    required this.submissionId,
    required this.filePath,
    required this.fileName,
    required this.fileSize,
  });

  @override
  State<KiemTraBaoCaoSVScreen> createState() => _KiemTraBaoCaoSVScreenState();
}

class _KiemTraBaoCaoSVScreenState extends State<KiemTraBaoCaoSVScreen> {
  bool _isChecked = false;
  bool _isSubmitting = false;
  bool _hasExtracted = false;
  
  final TextEditingController _txtController = TextEditingController(
      text: "Đang tải nội dung...");

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

  Future<void> _submitReport() async {
    if (!_isChecked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng xác nhận đã kiểm tra nội dung hoàn chỉnh.')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    final appStateProvider = AppStateProvider.of(context);
    final success = await appStateProvider.uploadReport(
      widget.submissionId,
      widget.filePath,
      widget.fileName,
      widget.fileSize,
      extractedText: _hasExtracted ? _txtController.text : null,
    );

    if (mounted) {
      setState(() {
        _isSubmitting = false;
      });
    }

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Nộp báo cáo thành công!'), backgroundColor: AppColors.secondary),
        );
        Navigator.of(context).pop(true); // Return true to indicate success
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Nộp báo cáo thất bại.'), backgroundColor: AppColors.danger),
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
          Expanded(
            child: _buildPdfView(),
          ),
          
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
                )
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
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
                    onPressed: _isSubmitting ? null : _submitReport,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text(
                            'Nộp bài cho giảng viên',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
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
