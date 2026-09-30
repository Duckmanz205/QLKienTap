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
  bool _isPdfView = true;
  bool _isChecked = false;
  bool _isSubmitting = false;
  bool _isExtracting = false;
  bool _hasExtracted = false;
  
  final TextEditingController _txtController = TextEditingController(
      text: "Đang tải nội dung...");

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

    setState(() {
      _isSubmitting = false;
    });

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
        title: Text(_isPdfView ? 'Kiểm tra file PDF' : 'Kiểm tra file TXT'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        leading: !_isPdfView 
          ? IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () {
                setState(() {
                  _isPdfView = true;
                });
              },
            )
          : IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _isPdfView ? _buildPdfView() : _buildTxtView(),
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
                if (_isPdfView)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _isExtracting ? null : () async {
                        setState(() {
                          _isPdfView = false;
                        });
                        
                        if (!_hasExtracted) {
                          setState(() {
                            _isExtracting = true;
                            _txtController.text = "Đang trích xuất nội dung từ PDF, vui lòng đợi...";
                          });
                          
                          final text = await ApiService.extractTextFromPdf(widget.filePath);
                          
                          if (mounted) {
                            setState(() {
                              _isExtracting = false;
                              _hasExtracted = true;
                              if (text != null && text.isNotEmpty) {
                                _txtController.text = text;
                              } else {
                                _txtController.text = "Không thể trích xuất nội dung hoặc file PDF trống/lỗi.";
                              }
                            });
                          }
                        }
                      },
                      icon: _isExtracting 
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.text_snippet),
                      label: Text(_isExtracting ? 'Đang trích xuất...' : 'Trích xuất sang file text (.txt)'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(color: AppColors.primary),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  )
                else
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        setState(() {
                          _isPdfView = true;
                        });
                      },
                      icon: const Icon(Icons.picture_as_pdf),
                      label: const Text('Quay lại xem PDF'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.grey.shade700,
                        side: BorderSide(color: Colors.grey.shade400),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    SizedBox(
                      height: 24,
                      width: 24,
                      child: Checkbox(
                        value: _isChecked,
                        onChanged: _hasExtracted ? (val) {
                          setState(() {
                            _isChecked = val ?? false;
                          });
                        } : null,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Đã kiểm tra nội dung hoàn chỉnh',
                        style: TextStyle(
                          fontSize: 14, 
                          fontWeight: FontWeight.w500,
                          color: _hasExtracted ? Colors.black87 : Colors.grey,
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

  Widget _buildTxtView() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Nội dung trích xuất:',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(8),
              ),
              child: TextField(
                controller: _txtController,
                maxLines: null,
                keyboardType: TextInputType.multiline,
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  hintText: 'Nhập/Chỉnh sửa nội dung văn bản...',
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
