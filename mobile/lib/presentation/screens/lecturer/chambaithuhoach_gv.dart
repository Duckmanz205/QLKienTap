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
      text: widget.student.isGraded
          ? (widget.student.gvhdGrade % 1 == 0
              ? widget.student.gvhdGrade.toInt().toString()
              : widget.student.gvhdGrade.toString())
          : '',
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
      _gradeController.text = widget.student.isGraded
          ? (widget.student.gvhdGrade % 1 == 0
              ? widget.student.gvhdGrade.toInt().toString()
              : widget.student.gvhdGrade.toString())
          : '';
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

      if (!mounted) return;
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
    if (widget.student.isScoreLocked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Điểm bài thu hoạch đã bị khóa bởi khoa/bộ môn, không thể chỉnh sửa.'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

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
    final isLocked = widget.student.isScoreLocked;

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
                  child: (widget.student.avatar.isNotEmpty && (widget.student.avatar.startsWith('http://') || widget.student.avatar.startsWith('https://')))
                      ? Image.network(
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
                        )
                      : Container(
                          width: 60,
                          height: 60,
                          color: AppColors.primary.withValues(alpha: 0.1),
                          alignment: Alignment.center,
                          child: const Icon(Icons.person, color: AppColors.primary, size: 30),
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
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          if (widget.student.trangThaiNop != null) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: widget.student.trangThaiNop == 'TreHan'
                                    ? Colors.amber.shade100
                                    : Colors.green.shade100,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                widget.student.trangThaiNop == 'TreHan' ? 'Nộp trễ' : 'Nộp đúng hạn',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: widget.student.trangThaiNop == 'TreHan'
                                      ? Colors.amber.shade900
                                      : Colors.green.shade900,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                          ],
                          OutlinedButton.icon(
                            onPressed: isLocked ? null : () => _showExtendDeadlineBottomSheet(context),
                            icon: Icon(isLocked ? Icons.lock : Icons.edit_calendar, size: 13),
                            label: Text(
                              isLocked ? 'Điểm đã khóa' : 'Gia hạn nộp bài',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: isLocked ? Colors.grey : AppColors.primary,
                              side: BorderSide(color: isLocked ? Colors.grey.shade300 : AppColors.primary),
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
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
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (isLocked) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.red.shade200),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.lock, size: 12, color: AppColors.danger),
                                SizedBox(width: 4),
                                Text('Đã khóa điểm', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.danger)),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),
                        ],
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
                  ],
                ),
                const SizedBox(height: 14),

                // AI Grading Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isAIGrading || !hasReportFile || isLocked ? null : _handleAIGrading,
                    icon: _isAIGrading
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.auto_awesome, size: 16),
                    label: Text(
                      _isAIGrading ? 'AI (Qwen3.7 Flash) đang phân tích bài nộp...' : 'Chấm điểm tự động bằng AI',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isLocked ? Colors.grey.shade400 : AppColors.primary,
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
                    color: isLocked ? Colors.grey.shade100 : Colors.white,
                    border: Border.all(color: isLocked ? Colors.grey.shade300 : AppColors.primary),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _gradeController,
                          enabled: !isLocked,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: isLocked ? Colors.grey.shade700 : AppColors.primary,
                          ),
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
                  enabled: !isLocked,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Nhập nhận xét chi tiết về bài thu hoạch của sinh viên...',
                    hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                    fillColor: isLocked ? Colors.grey.shade100 : null,
                    filled: isLocked,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.beigeBorder)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.beigeBorder)),
                    disabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Save Grade Button
          ElevatedButton.icon(
            onPressed: (_isSaving || isLocked) ? null : _saveGrade,
            icon: _isSaving
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Icon(isLocked ? Icons.lock : Icons.save, size: 16),
            label: Text(
              isLocked ? 'ĐÃ KHÓA ĐIỂM (CHỈ XEM)' : 'LƯU ĐIỂM BÀI THU HOẠCH',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: isLocked ? Colors.grey.shade400 : AppColors.primary,
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

  void _showExtendDeadlineBottomSheet(BuildContext context) {
    final ptqId = widget.student.phieuThamQuanId ?? widget.student.phieuId;
    if (ptqId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không tìm thấy thông tin Phiếu tham quan để gia hạn.')),
      );
      return;
    }

    String selectedMode = 'DungHan'; // 'DungHan' | 'Khoa'
    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            final dateStr = '${selectedDate.day.toString().padLeft(2, '0')}/${selectedDate.month.toString().padLeft(2, '0')}/${selectedDate.year}';
            final isoDateStr = '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}';

            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.edit_calendar, color: AppColors.primary, size: 20),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Text(
                          'Gia hạn nộp bài thu hoạch',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 20),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Sinh viên: ${widget.student.name} (${widget.student.id})',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Chuyến: ${widget.student.company}',
                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text('CHẾ ĐỘ GIA HẠN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                  const SizedBox(height: 6),
                  RadioListTile<String>(
                    value: 'DungHan',
                    groupValue: selectedMode,
                    activeColor: AppColors.primary,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('1. Gia hạn Đúng hạn', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    subtitle: const Text('Kéo dài hạn Đúng hạn. Cổng nộp bài (Trễ hạn) tự động lùi thêm 10 ngày sau mốc này.', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    onChanged: (val) {
                      if (val != null) setSheetState(() => selectedMode = val);
                    },
                  ),
                  RadioListTile<String>(
                    value: 'Khoa',
                    groupValue: selectedMode,
                    activeColor: Colors.amber.shade800,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('2. Mở khóa Nộp bù (Trễ hạn)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    subtitle: const Text('Mở lại cổng nộp bài cho sinh viên bị khóa. Bài nộp trong thời gian này ghi nhận Trễ hạn.', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    onChanged: (val) {
                      if (val != null) setSheetState(() => selectedMode = val);
                    },
                  ),
                  const SizedBox(height: 10),
                  Text(
                    selectedMode == 'DungHan' ? 'HẠN ĐÚNG HẠN MỚI (ĐẾN 23:59)' : 'HẠN ĐÓNG CỔNG NỘP BÙ MỚI (ĐẾN 23:59)',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 6),
                  InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: ctx,
                        initialDate: selectedDate,
                        firstDate: DateTime.now().add(const Duration(days: 1)),
                        lastDate: DateTime.now().add(const Duration(days: 90)),
                      );
                      if (picked != null) {
                        setSheetState(() => selectedDate = picked);
                      }
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.primary),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today, size: 16, color: AppColors.primary),
                          const SizedBox(width: 10),
                          Text(
                            '23:59 ngày $dateStr',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                          ),
                          const Spacer(),
                          const Text('Thay đổi', style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: isSubmitting
                        ? null
                        : () async {
                            setSheetState(() => isSubmitting = true);
                            try {
                              await ApiService.extendReportDeadline(
                                phieuThamQuanId: ptqId,
                                loaiGiaHan: selectedMode,
                                ngayGiaHanMoi: isoDateStr,
                              );
                              if (context.mounted) {
                                Navigator.pop(ctx);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Gia hạn nộp bài thành công!')),
                                );
                                widget.onGradeSaved();
                              }
                            } catch (e) {
                              setSheetState(() => isSubmitting = false);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Lỗi: $e')),
                                );
                              }
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(46),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: isSubmitting
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('XÁC NHẬN GIA HẠN', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
