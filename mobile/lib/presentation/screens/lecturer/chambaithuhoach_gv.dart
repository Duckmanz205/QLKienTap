import 'package:flutter/material.dart';
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
  late TextEditingController _commentController;
  late TextEditingController _gradeController;
  bool _isAIGrading = false;
  bool _isSaving = false;
  double? _aiGrade;

  @override
  void initState() {
    super.initState();
    _commentController = TextEditingController(text: widget.student.comment ?? '');
    _gradeController = TextEditingController(
      text: widget.student.gvhdGrade > 0 ? widget.student.gvhdGrade.toString() : '',
    );
    _aiGrade = widget.student.aiSuggestedGrade;
  }

  @override
  void didUpdateWidget(covariant ChamBaiThuHoachGVScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.student.comment != oldWidget.student.comment) {
      _commentController.text = widget.student.comment ?? '';
    }
    if (widget.student.gvhdGrade != oldWidget.student.gvhdGrade) {
      _gradeController.text = widget.student.gvhdGrade > 0 ? widget.student.gvhdGrade.toString() : '';
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    _gradeController.dispose();
    super.dispose();
  }

  Future<void> _handleAIGrading() async {
    if (widget.student.reportFileUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sinh viên chưa nộp bài báo cáo.')));
      return;
    }

    setState(() => _isAIGrading = true);

    try {
      final text = await ApiService.fetchReportText(widget.student.reportFileUrl!);
      final data = await ApiService.gradeWithAI(text);

      setState(() {
        _aiGrade = double.tryParse(data['diem_bao_cao_cuoi_cung']?.toString() ?? '');
        if (_aiGrade != null) {
          _gradeController.text = _aiGrade!.toString();
        }

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
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Chấm điểm AI hoàn tất! Hãy kiểm tra và lưu lại.'), backgroundColor: AppColors.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Lỗi chấm AI', style: TextStyle(color: AppColors.danger)),
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
        setState(() => _isAIGrading = false);
      }
    }
  }

  Future<void> _saveGrade() async {
    final gradeText = _gradeController.text.trim();
    final grade = double.tryParse(gradeText);
    if (grade == null || grade < 0 || grade > 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập điểm hợp lệ từ 0 đến 10.'), backgroundColor: AppColors.danger),
      );
      return;
    }

    setState(() => _isSaving = true);
    final appStateProvider = AppStateProvider.of(context);

    try {
      final repId = widget.student.reportId;
      if (repId != null && repId > 0) {
        await ApiService.gradeReport(repId, grade, _commentController.text.trim());
        if (_aiGrade != null) {
          await ApiService.saveAIGrade(repId, _aiGrade!, _commentController.text.trim());
        }
      }

      appStateProvider.updateStudentGrade(
        widget.student.id,
        gvhdGrade: grade,
        comment: _commentController.text.trim(),
        isGraded: true,
      );

      widget.onGradeSaved();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã lưu điểm bài thu hoạch thành công!'), backgroundColor: AppColors.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi lưu điểm: $e'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasReportFile = widget.student.reportFileUrl != null && widget.student.reportFileUrl!.isNotEmpty;
    final hasConfirmFile = widget.student.confirmationFileUrl != null && widget.student.confirmationFileUrl!.isNotEmpty;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Profile Info Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.beigeBorder),
              boxShadow: const [
                BoxShadow(color: AppColors.cardShadow, blurRadius: 6, offset: Offset(0, 2)),
              ],
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    widget.student.avatar,
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (_, _, _) => Container(
                      width: 60,
                      height: 60,
                      color: AppColors.primary.withValues(alpha: 0.1),
                      alignment: Alignment.center,
                      child: const Icon(Icons.person, color: AppColors.primary, size: 30),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.student.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.darkSlate)),
                      const SizedBox(height: 2),
                      Text('MSSV: ${widget.student.id} • Lớp: ${widget.student.className}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.business, size: 13, color: AppColors.primary),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              widget.student.company,
                              style: const TextStyle(fontSize: 11, color: AppColors.darkSlate, fontWeight: FontWeight.w500),
                              overflow: TextOverflow.ellipsis,
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
          const SizedBox(height: 16),

          // Report PDF File Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.beigeBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Bài báo cáo thu hoạch', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
                const SizedBox(height: 10),
                Container(
                  height: 80,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.picture_as_pdf,
                        color: hasReportFile ? AppColors.danger : Colors.grey,
                        size: 32,
                      ),
                      const SizedBox(width: 10),
                      Flexible(
                        child: Text(
                          hasReportFile ? widget.student.reportFileUrl!.split('/').last : 'Chưa nộp file báo cáo',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: hasReportFile ? AppColors.darkSlate : Colors.grey,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: !hasReportFile
                      ? null
                      : () {
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
                  icon: const Icon(Icons.fullscreen, size: 16),
                  label: const Text('XEM TOÀN MÀN HÌNH', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    minimumSize: const Size.fromHeight(40),
                  ),
                ),
              ],
            ),
          ),

          // Confirmation Paper Box if self-contacted trip
          if (hasConfirmFile) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.secondary.withValues(alpha: 0.5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.verified, size: 16, color: AppColors.secondary),
                      const SizedBox(width: 6),
                      const Text(
                        'Giấy xác nhận tham quan (Chuyến tự liên hệ)',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.secondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => PdfViewerScreen(
                            title: 'Giấy xác nhận tham quan',
                            pdfUrl: widget.student.confirmationFileUrl!,
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.visibility_outlined, size: 16),
                    label: const Text('XEM GIẤY XÁC NHẬN THAM QUAN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.secondary,
                      side: const BorderSide(color: AppColors.secondary),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      minimumSize: const Size.fromHeight(38),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),

          // Grading Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.beigeBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Đánh giá & Chấm điểm', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
                    if (_aiGrade != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'AI đề xuất: ${_aiGrade!.toStringAsFixed(1)}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 14),

                // AI Grading Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isAIGrading || !hasReportFile ? null : _handleAIGrading,
                    icon: _isAIGrading
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.auto_awesome, size: 16),
                    label: Text(
                      _isAIGrading ? 'Đang phân tích bài nộp...' : 'Chấm điểm tự động bằng AI',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Score Input
                const Text('ĐIỂM GVHD (HỆ SỐ 0.3)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                const SizedBox(height: 6),
                Container(
                  height: 48,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.primary),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _gradeController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primary),
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            hintText: '0.0',
                          ),
                        ),
                      ),
                      const Padding(
                        padding: EdgeInsets.only(right: 16.0),
                        child: Text('/ 10', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Comment Input
                const Text('NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                const SizedBox(height: 6),
                TextField(
                  controller: _commentController,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Nhập nhận xét chi tiết về bài thu hoạch của sinh viên...',
                    hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.beigeBorder)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.beigeBorder)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Save Grade Button
          ElevatedButton.icon(
            onPressed: _isSaving ? null : _saveGrade,
            icon: _isSaving
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Icon(Icons.save, size: 16),
            label: const Text('LƯU ĐIỂM BÀI THU HOẠCH', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(46),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
