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
                          color: Colors.red.shade100,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.picture_as_pdf, color: Colors.red, size: 24),
                      ),
                      const SizedBox(height: 8),
                      const Text('baocao_vinamilk.pdf', style: TextStyle(fontSize: 12, color: Colors.black54)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.fullscreen, size: 16, color: Color(0xFF3B711A)),
                  label: const Text('XEM TOÀN MÀN HÌNH', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF3B711A))),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF3B711A)),
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
                          Text('AI đề xuất: ${widget.student.aiSuggestedGrade}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black54)),
                        ],
                      ),
                    ),
                  ],
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
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black45),
                          decoration: InputDecoration(
                            border: InputBorder.none,
                            hintText: widget.student.gvhdGrade.toString(),
                          ),
                          onChanged: (val) {
                            if (double.tryParse(val) != null) {
                              appStateProvider.updateStudentGrade(widget.student.id, gvhdGrade: double.parse(val));
                            }
                          },
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
                  onChanged: (val) {
                    appStateProvider.updateStudentGrade(widget.student.id, comment: val);
                  },
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Bottom Buttons
          ElevatedButton.icon(
            onPressed: () {
              appStateProvider.updateStudentGrade(widget.student.id, isGraded: true);
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
