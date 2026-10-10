import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_service.dart';

import 'dart:typed_data';
import 'package:http/http.dart' as http;

class PdfViewerScreen extends StatefulWidget {
  final String title;
  final String pdfUrl;

  const PdfViewerScreen({
    super.key,
    required this.title,
    required this.pdfUrl,
  });

  @override
  State<PdfViewerScreen> createState() => _PdfViewerScreenState();
}

class _PdfViewerScreenState extends State<PdfViewerScreen> {
  Uint8List? _pdfBytes;
  String? _errorMessage;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchPdf();
  }

  String _getFixedUrl(String url) {
    String finalUrl = url;
    
    if (finalUrl.startsWith('reports/')) {
      finalUrl = '${ApiService.baseUrl}/upload/file/$finalUrl';
    } else if (finalUrl.startsWith('/api/')) {
      finalUrl = ApiService.baseUrl.replaceAll('/api', '') + finalUrl;
    } else if (!finalUrl.startsWith('http')) {
      finalUrl = '${ApiService.baseUrl}/upload/file/reports/$finalUrl';
    }

    if (finalUrl.contains('localhost') || finalUrl.contains('127.0.0.1')) {
      try {
        final uri = Uri.parse(ApiService.baseUrl);
        finalUrl = finalUrl.replaceAll('localhost', uri.host).replaceAll('127.0.0.1', uri.host);
      } catch (e) {
        finalUrl = finalUrl.replaceAll('localhost', '10.0.2.2').replaceAll('127.0.0.1', '10.0.2.2');
      }
    }
    
    return finalUrl;
  }

  Future<void> _fetchPdf() async {
    try {
      final fixedUrl = _getFixedUrl(widget.pdfUrl);
      final headers = <String, String>{};
      if (ApiService.token != null) {
        headers['Authorization'] = 'Bearer ${ApiService.token}';
      }

      final response = await http.get(Uri.parse(fixedUrl), headers: headers);
      if (response.statusCode == 200) {
        if (mounted) {
          setState(() {
            _pdfBytes = response.bodyBytes;
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _errorMessage = 'Lỗi HTTP ${response.statusCode}\nUrl: $fixedUrl\nBody: ${response.body}';
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Lỗi kết nối: $e';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title.isEmpty ? 'Tài liệu PDF' : widget.title, style: const TextStyle(fontSize: 14)),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
                )
              : SfPdfViewer.memory(
                  _pdfBytes!,
                  canShowScrollHead: false,
                  canShowScrollStatus: false,
                  onDocumentLoadFailed: (PdfDocumentLoadFailedDetails details) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Lỗi định dạng PDF: ${details.description}'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  },
                ),
    );
  }
}
