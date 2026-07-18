import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';

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

  @override
  void initState() {
    super.initState();
    _commentController = TextEditingController(text: widget.student.comment ?? '');
  }

  @override
  void didUpdateWidget(covariant ChamBaiThuHoachGVScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.student.comment != oldWidget.student.comment) {
      _commentController.text = widget.student.comment ?? '';
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);

    return Column(
      children: [
        // Tab switcher
        Container(
          margin: const EdgeInsets.symmetric(vertical: 12),
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(12)),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _gradeScreenTab = 'preparation'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: _gradeScreenTab == 'preparation' ? AppColors.primary : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Hồ sơ chuẩn bị',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _gradeScreenTab == 'preparation' ? Colors.white : AppColors.darkSlate,
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _gradeScreenTab = 'report'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: _gradeScreenTab == 'report' ? AppColors.primary : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Báo cáo tốt nghiệp',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _gradeScreenTab == 'report' ? Colors.white : AppColors.darkSlate,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        Expanded(
          child: SingleChildScrollView(
            child: _gradeScreenTab == 'preparation'
                ? _buildPreparationTab(appStateProvider)
                : _buildReportTab(appStateProvider),
          ),
        ),
      ],
    );
  }

  Widget _buildPreparationTab(AppStateProviderState appStateProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Thông tin học phần chuẩn bị', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary)),
                const Divider(height: 20),
                _buildInfoRow('Hồ sơ kiến tập doanh nghiệp:', 'Đầy đủ (PDF)'),
                _buildInfoRow('Nhật ký thực tập số:', 'Hoàn thành 3 tuần'),
                _buildInfoRow('Phiếu khảo sát doanh nghiệp:', 'Đã nộp'),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        const Text('Nhập điểm hồ sơ chuẩn bị (0.0 - 10.0)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Slider(
                value: widget.student.prelimGrade,
                min: 0.0,
                max: 10.0,
                divisions: 20,
                label: widget.student.prelimGrade.toString(),
                activeColor: AppColors.primary,
                inactiveColor: Colors.grey.shade200,
                onChanged: (val) {
                  appStateProvider.updateStudentGrade(widget.student.id, prelimGrade: val);
                },
              ),
            ),
            Container(
              width: 50,
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
              decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
              child: Text(
                '${widget.student.prelimGrade}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        const Text('Điểm cộng chuyên cần (Tối đa +1.0đ)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 4),
        const Text('Mỗi lần sinh viên tham gia đầy đủ các buổi hoạt động cộng 0.5đ.', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
        const SizedBox(height: 12),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: widget.student.extraGrade <= 0
                      ? null
                      : () {
                          appStateProvider.updateStudentGrade(widget.student.id, extraGrade: widget.student.extraGrade - 0.5);
                        },
                  icon: const Icon(Icons.remove_circle_outline),
                  color: AppColors.danger,
                ),
                Text('+${widget.student.extraGrade}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                IconButton(
                  onPressed: widget.student.extraGrade >= 1.0
                      ? null
                      : () {
                          appStateProvider.updateStudentGrade(widget.student.id, extraGrade: widget.student.extraGrade + 0.5);
                        },
                  icon: const Icon(Icons.add_circle_outline),
                  color: AppColors.secondary,
                ),
              ],
            ),
            if (widget.student.extraGrade >= 1.0)
              const Text('Đã đạt mức tối đa (+1.0)', style: TextStyle(fontSize: 10, color: AppColors.secondary, fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }

  Widget _buildReportTab(AppStateProviderState appStateProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Simulated PDF Viewer Frame
        Container(
          height: 160,
          decoration: BoxDecoration(
            color: Colors.grey.shade800,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.picture_as_pdf, color: Colors.redAccent, size: 40),
                  SizedBox(height: 8),
                  Text('BaoCaoThucTap_Acecook.pdf', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  Text('Trang 1 / 18 • Dung lượng: 2.3 MB', style: TextStyle(color: Colors.white70, fontSize: 9)),
                ],
              ),
              Positioned(
                bottom: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(8)),
                  child: const Text('Xem toàn màn hình ⛶', style: TextStyle(color: Colors.white, fontSize: 9)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // AI Suggestion Box
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.secondary.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.secondary.withValues(alpha: 0.4)),
          ),
          child: Row(
            children: [
              const Icon(Icons.psychology, color: AppColors.secondary, size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Điểm gợi ý từ AI chấm bài:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppColors.secondary)),
                    Text(
                      '${widget.student.aiSuggestedGrade} / 10.0 (Báo cáo khớp 92% mẫu, phân tích quy trình tốt)',
                      style: const TextStyle(fontSize: 10, color: AppColors.darkSlate),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Sliders for Grade
        const Text('Điểm GVHD chấm (0.0 - 10.0)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        Row(
          children: [
            Expanded(
              child: Slider(
                value: widget.student.gvhdGrade,
                min: 0.0,
                max: 10.0,
                divisions: 20,
                label: widget.student.gvhdGrade.toString(),
                activeColor: AppColors.primary,
                onChanged: (val) {
                  appStateProvider.updateStudentGrade(widget.student.id, gvhdGrade: val);
                },
              ),
            ),
            Container(
              width: 50,
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
              decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
              child: Text('${widget.student.gvhdGrade}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12), textAlign: TextAlign.center),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Comment Input
        const Text('Nhận xét ý kiến', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 6),
        TextField(
          controller: _commentController,
          maxLines: 2,
          decoration: const InputDecoration(
            hintText: 'Nhập ý kiến đánh giá bài báo cáo của sinh viên...',
          ),
          onChanged: (val) {
            appStateProvider.updateStudentGrade(widget.student.id, comment: val);
          },
        ),
        const SizedBox(height: 24),

        ElevatedButton(
          onPressed: () {
            appStateProvider.updateStudentGrade(widget.student.id, isGraded: true);
            widget.onGradeSaved();
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Đã hoàn tất lưu bảng điểm cho SV ${widget.student.name}!'), backgroundColor: AppColors.secondary),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: const Text('LƯU & KHÓA ĐIỂM CHẤM BÁO CÁO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
          Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.darkSlate)),
        ],
      ),
    );
  }
}
