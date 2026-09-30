import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_service.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';
import '../shared/pdf_viewer_screen.dart';

class ChamBaiThuHoachGVScreen extends StatefulWidget {
  final LecturerStudent student;
  final VoidCallback onGradeSaved;

  const ChamBaiThuHoachGVScreen({
    super.key,
    required this.student,
    required this.onGradeSaved,
  });

  @override
  State<ChamBaiThuHoachGVScreen> createState() => _ChamBaiThuHoachGVScreenState();
}

class _ChamBaiThuHoachGVScreenState extends State<ChamBaiThuHoachGVScreen> {
  String _gradeScreenTab = 'preparation'; // 'preparation' or 'report'
  late TextEditingController _commentController;
  late TextEditingController _gradeController;
  bool _isAIGrading = false;
  double? _aiGrade;

  Future<void> _handleAIGrading() async {
    if (widget.student.reportFileUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sinh viên chưa nộp bài')));
      return;
    }
    
    setState(() {
      _isAIGrading = true;
    });
    
    try {
      final text = await ApiService.fetchReportText(widget.student.reportFileUrl!);
      final data = await ApiService.gradeWithAI(text);
      
      setState(() {
        _aiGrade = double.tryParse(data['diem_bao_cao_cuoi_cung']?.toString() ?? '');
        _gradeController.text = _aiGrade?.toString() ?? '';
        
        List<String> commentLines = [];
        final ht = data['hinh_thuc_tong_quan'];
        if (ht != null) {
          commentLines.add('1. Hình thức (${ht['diem_hinh_thuc']}): ${ht['ly_do_hinh_thuc']}');
          commentLines.add('2. Tổng quan (${ht['diem_tong_quan']}): ${ht['ly_do_tong_quan']}');
        }
        final qt = data['quy_trinh_cong_nghe'];
        if (qt != null) {
          commentLines.add('3. Quy trình (${qt['diem_quy_trinh']}): ${qt['ly_do_quy_trinh']}');
        }
        final vs = data['vsattp'];
        if (vs != null) {
          commentLines.add('4. VSATTP (${vs['diem_vsattp']}): ${vs['ly_do_vsattp']}');
        }
        
        _commentController.text = commentLines.join('\n\n');
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Chấm điểm AI thành công! Hãy lưu lại.'), backgroundColor: AppColors.secondary));
      }
    } catch (e) {
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Lỗi chấm AI', style: TextStyle(color: Colors.red)),
            content: Text(e.toString()),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Đóng'),
              ),
            ],
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isAIGrading = false;
        });
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _commentController = TextEditingController(text: widget.student.comment ?? '');
    _gradeController = TextEditingController(text: widget.student.gvhdGrade.toString());
    _aiGrade = widget.student.aiSuggestedGrade;
  }

  @override
  void didUpdateWidget(covariant ChamBaiThuHoachGVScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.student.comment != oldWidget.student.comment) {
      _commentController.text = widget.student.comment ?? '';
    }
    if (widget.student.gvhdGrade != oldWidget.student.gvhdGrade) {
      _gradeController.text = widget.student.gvhdGrade.toString();
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    _gradeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Profile Info Card
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFE9E5D3), // yellow/beige tint
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8), 
                  child: Image.network(widget.student.avatar, width: 64, height: 64, fit: BoxFit.cover),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('MSSV: ${widget.student.id}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.business, size: 14, color: Color(0xFF3B711A)),
                        const SizedBox(width: 4),
                        Text(widget.student.company, style: const TextStyle(fontSize: 11, color: Colors.black87)),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 14, color: Color(0xFF3B711A)),
                        const SizedBox(width: 4),
                        Text(widget.student.submittedDate, style: const TextStyle(fontSize: 11, color: Colors.black87)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // PDF Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              children: [
                Container(
                  height: 100,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEBEBEB),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: widget.student.reportFileUrl != null ? Colors.red.shade100 : Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(Icons.picture_as_pdf, color: widget.student.reportFileUrl != null ? Colors.red : Colors.grey, size: 24),
                      ),
                      const SizedBox(height: 8),
                      Text(widget.student.reportFileUrl?.split('/').last ?? 'Chưa nộp file báo cáo', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: widget.student.reportFileUrl == null ? null : () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PdfViewerScreen(
                          title: widget.student.reportFileUrl!.split('/').last,
                          pdfUrl: widget.student.reportFileUrl!,
                        ),
                      ),
                    );
                  },
                  icon: Icon(Icons.fullscreen, size: 16, color: widget.student.reportFileUrl != null ? const Color(0xFF3B711A) : Colors.grey),
                  label: Text('XEM TOÀN MÀN HÌNH', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: widget.student.reportFileUrl != null ? const Color(0xFF3B711A) : Colors.grey)),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: widget.student.reportFileUrl != null ? const Color(0xFF3B711A) : Colors.grey),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    minimumSize: const Size.fromHeight(40),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Grading Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Đánh giá', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE9E5D3),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.psychology, size: 12, color: Colors.black54),
                          const SizedBox(width: 4),
                          Text('AI đề xuất: ${_aiGrade ?? "Chưa có"}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black54)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isAIGrading || widget.student.reportFileUrl == null ? null : _handleAIGrading,
                    icon: _isAIGrading 
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.auto_awesome, size: 16),
                    label: Text(_isAIGrading ? 'Đang chấm điểm...' : 'Chấm tự động bằng AI', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF407F3E),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('ĐIỂM GVHD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black54)),
                const SizedBox(height: 4),
                Container(
                  height: 48,
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFF3B711A)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _gradeController,
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black45),
                          decoration: InputDecoration(
                            border: InputBorder.none,
                            hintText: widget.student.gvhdGrade.toString(),
                          ),
                        ),
                      ),
                      const Padding(
                        padding: EdgeInsets.only(right: 16.0),
                        child: Text('/ 10', style: TextStyle(fontSize: 14, color: Colors.black54)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const Text('NHẬN XÉT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black54)),
                const SizedBox(height: 4),
                TextField(
                  controller: _commentController,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Nhận xét về bài thu hoạch...',
                    hintStyle: const TextStyle(fontSize: 12, color: Colors.black38),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Color(0xFFE9E5D3)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Color(0xFFE9E5D3)),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Bottom Buttons
          ElevatedButton.icon(
            onPressed: () {
              final grade = double.tryParse(_gradeController.text) ?? widget.student.gvhdGrade;
              appStateProvider.updateStudentGrade(
                widget.student.id, 
                gvhdGrade: grade,
                comment: _commentController.text,
                isGraded: true
              );
              widget.onGradeSaved();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã lưu điểm!'), backgroundColor: AppColors.secondary),
              );
            },
            icon: const Icon(Icons.save, size: 16),
            label: const Text('LƯU ĐIỂM', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3B711A),
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(44),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.warning_amber_rounded, size: 16, color: Color(0xFFE57373)),
            label: const Text('YÊU CẦU BỔ SUNG', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFE57373))),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFE57373)),
              minimumSize: const Size.fromHeight(44),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }
}
