import 'package:flutter/material.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';

class HoiDongChamBaoCaoDSBuoiGVScreen extends StatefulWidget {
  final Function(String)? onCouncilTap;

  const HoiDongChamBaoCaoDSBuoiGVScreen({
    super.key,
    this.onCouncilTap,
  });

  @override
  State<HoiDongChamBaoCaoDSBuoiGVScreen> createState() => _HoiDongChamBaoCaoDSBuoiGVScreenState();
}

class _HoiDongChamBaoCaoDSBuoiGVScreenState extends State<HoiDongChamBaoCaoDSBuoiGVScreen> {
  String _searchQuery = '';
  String _selectedRole = 'Tất cả vai trò';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadSessions();
  }

  Future<void> _loadSessions() async {
    final lecturerId = ApiService.userId;
    if (lecturerId == null) return;
    setState(() => _isLoading = true);
    try {
      await AppStateProvider.of(context).fetchBoardSessions(lecturerId);
    } catch (_) {
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context).state;
    final boards = appState.councilBoards;

    final filtered = boards.where((b) {
      final matchQuery = b.sessionName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          b.room.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchRole = _selectedRole == 'Tất cả vai trò' || b.role == _selectedRole;
      return matchQuery && matchRole;
    }).toList();

    return RefreshIndicator(
      onRefresh: _loadSessions,
      child: Column(
        children: [
          // Filter & Search Header
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        decoration: InputDecoration(
                          hintText: 'Tìm buổi bảo vệ, phòng...',
                          hintStyle: const TextStyle(fontSize: 13),
                          prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.primary),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedRole,
                          items: const [
                            DropdownMenuItem(value: 'Tất cả vai trò', child: Text('Tất cả', style: TextStyle(fontSize: 12))),
                            DropdownMenuItem(value: 'Chủ tịch', child: Text('Chủ tịch', style: TextStyle(fontSize: 12))),
                            DropdownMenuItem(value: 'Thư ký', child: Text('Thư ký', style: TextStyle(fontSize: 12))),
                            DropdownMenuItem(value: 'Ủy viên', child: Text('Ủy viên', style: TextStyle(fontSize: 12))),
                          ],
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedRole = val);
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // List of Board Sessions
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : filtered.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.gavel_outlined, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 12),
                              const Text(
                                'Chưa có phiên bảo vệ hội đồng',
                                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Khoa chưa phân công bạn vào hội đồng chấm bảo cáo nào.',
                                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        itemBuilder: (context, idx) {
                          final board = filtered[idx];
                          return _buildBoardCard(board);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildBoardCard(CouncilBoardItem board) {
    Color statusBgColor;
    Color statusTextColor;
    String statusText;

    if (board.status == 'upcoming') {
      statusBgColor = AppColors.warning.withValues(alpha: 0.3);
      statusTextColor = AppColors.darkSlate;
      statusText = 'Sắp diễn ra';
    } else if (board.status == 'ongoing') {
      statusBgColor = AppColors.secondary.withValues(alpha: 0.2);
      statusTextColor = AppColors.primary;
      statusText = 'Đang diễn ra';
    } else {
      statusBgColor = Colors.grey.shade200;
      statusTextColor = Colors.grey.shade700;
      statusText = 'Đã hoàn thành';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.beigeBorder),
        boxShadow: const [
          BoxShadow(color: AppColors.cardShadow, blurRadius: 6, offset: Offset(0, 2)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    board.sessionName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.darkSlate),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: statusBgColor, borderRadius: BorderRadius.circular(10)),
                  child: Text(statusText, style: TextStyle(color: statusTextColor, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                const Icon(Icons.badge_outlined, size: 14, color: AppColors.primary),
                const SizedBox(width: 6),
                Text('Vai trò: ${board.role}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
              ],
            ),
            const SizedBox(height: 6),

            Row(
              children: [
                Icon(Icons.calendar_today, size: 14, color: Colors.grey.shade600),
                const SizedBox(width: 6),
                Text('${board.timeRange} | ${board.date}', style: TextStyle(fontSize: 11, color: Colors.grey.shade700)),
              ],
            ),
            const SizedBox(height: 6),

            Row(
              children: [
                Icon(Icons.location_on_outlined, size: 14, color: Colors.grey.shade600),
                const SizedBox(width: 6),
                Text(board.room, style: TextStyle(fontSize: 11, color: Colors.grey.shade700)),
                const Spacer(),
                Icon(Icons.people_outline, size: 14, color: Colors.grey.shade600),
                const SizedBox(width: 4),
                Text('${board.students.length} sinh viên', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
              ],
            ),
            const SizedBox(height: 14),

            ElevatedButton(
              onPressed: () {
                if (widget.onCouncilTap != null) {
                  widget.onCouncilTap!(board.sessionId.toString());
                } else {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => HoiDongGradingQueueScreen(
                        board: board,
                        onBack: () => Navigator.pop(context),
                      ),
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                minimumSize: const Size.fromHeight(38),
                elevation: 0,
              ),
              child: const Text('VÀO CHẤM ĐIỂM HỘI ĐỒNG', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ],
        ),
      ),
    );
  }
}

class HoiDongGradingQueueScreen extends StatefulWidget {
  final CouncilSession? session;
  final CouncilBoardItem? board;
  final VoidCallback onBack;

  const HoiDongGradingQueueScreen({
    super.key,
    this.session,
    this.board,
    required this.onBack,
  });

  @override
  State<HoiDongGradingQueueScreen> createState() => _HoiDongGradingQueueScreenState();
}

class _HoiDongGradingQueueScreenState extends State<HoiDongGradingQueueScreen> {
  final Map<int, TextEditingController> _scoreControllers = {};
  final Map<int, bool> _savingStudent = {};

  @override
  void dispose() {
    for (var ctrl in _scoreControllers.values) {
      ctrl.dispose();
    }
    super.dispose();
  }

  Future<void> _submitScore(CouncilBoardItem board, CouncilStudentItem student) async {
    final ctrl = _scoreControllers[student.studentId];
    final score = double.tryParse(ctrl?.text.trim() ?? '');
    if (score == null || score < 0 || score > 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập điểm hợp lệ từ 0 đến 10.'), backgroundColor: AppColors.danger),
      );
      return;
    }

    setState(() => _savingStudent[student.studentId] = true);

    try {
      final phieuIds = student.trips.map((t) => t.phieuId).where((id) => id > 0).toList();
      await AppStateProvider.of(context).submitBoardScoresBatch(board.memberId, phieuIds, score);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã lưu điểm hội đồng ${score.toStringAsFixed(1)} cho SV ${student.hoTen} thành công!'),
            backgroundColor: AppColors.secondary,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi chấm điểm: $e'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _savingStudent[student.studentId] = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context).state;
    // Find board from state or widget
    CouncilBoardItem? currentBoard = widget.board;
    if (currentBoard == null && widget.session != null) {
      currentBoard = appState.councilBoards.firstWhere(
        (b) => b.sessionId.toString() == widget.session!.id,
        orElse: () => CouncilBoardItem(
          sessionId: int.tryParse(widget.session!.id) ?? 0,
          memberId: 0,
          sessionName: widget.session!.name,
          room: widget.session!.room,
          date: widget.session!.date,
          timeRange: widget.session!.timeRange,
          role: widget.session!.role,
          status: widget.session!.status,
          students: [],
        ),
      );
    }

    final sessionName = currentBoard?.sessionName ?? widget.session?.name ?? 'Buổi bảo vệ hội đồng';
    final room = currentBoard?.room ?? widget.session?.room ?? '';
    final timeRange = currentBoard?.timeRange ?? widget.session?.timeRange ?? '';
    final students = currentBoard?.students ?? [];

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Chấm điểm Hội đồng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
      ),
      body: Column(
        children: [
          // Session Header Info
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(sessionName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkSlate)),
                const SizedBox(height: 4),
                Text('Hội trường: $room • Thời gian: $timeRange', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
              ],
            ),
          ),

          // Students List
          Expanded(
            child: students.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Text(
                        'Chưa có sinh viên nào trong danh sách báo cáo của hội đồng này.',
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: students.length,
                    itemBuilder: (context, index) {
                      final student = students[index];
                      final isSaving = _savingStudent[student.studentId] ?? false;

                      // Initialize controller if not present
                      if (!_scoreControllers.containsKey(student.studentId)) {
                        final existingScore = student.trips.isNotEmpty ? student.trips.first.myScore : null;
                        _scoreControllers[student.studentId] = TextEditingController(
                          text: existingScore != null ? existingScore.toString() : '',
                        );
                      }
                      final ctrl = _scoreControllers[student.studentId]!;
                      final hasGraded = student.trips.any((t) => t.myScore != null);

                      return Card(
                        margin: const EdgeInsets.only(bottom: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: const BorderSide(color: AppColors.beigeBorder),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(14.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CircleAvatar(
                                    backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                                    foregroundColor: AppColors.primary,
                                    child: Text('${index + 1}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(student.hoTen, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkSlate)),
                                            if (hasGraded)
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: AppColors.secondary.withValues(alpha: 0.15),
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: const Text('Đã chấm', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.secondary)),
                                              ),
                                          ],
                                        ),
                                        const SizedBox(height: 2),
                                        Text('MSSV: ${student.mssv} • Lớp: ${student.className}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                        if (student.topic != null && student.topic!.isNotEmpty) ...[
                                          const SizedBox(height: 2),
                                          Text('Đề tài: ${student.topic}', style: const TextStyle(fontSize: 11, color: AppColors.darkSlate, fontStyle: FontStyle.italic)),
                                        ],
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 20),

                              // Representative Trips List
                              const Text('3 Chuyến tham quan báo cáo:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                              const SizedBox(height: 6),
                              ...student.trips.map((t) => Padding(
                                padding: const EdgeInsets.only(bottom: 4),
                                child: Row(
                                  children: [
                                    const Icon(Icons.check_circle_outline, size: 12, color: AppColors.primary),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(
                                        '${t.tenNhaMay} (${t.hinhThuc == 'TrucTuyen' ? 'Trực tuyến' : 'Trực tiếp'})',
                                        style: const TextStyle(fontSize: 11, color: AppColors.darkSlate),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (t.myScore != null)
                                      Text(
                                        '${t.myScore!.toStringAsFixed(1)} đ',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                                      ),
                                  ],
                                ),
                              )),
                              const SizedBox(height: 12),

                              // Score Input Row & Save Button
                              Row(
                                children: [
                                  const Text('Điểm hội đồng (0-10):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
                                  const SizedBox(width: 10),
                                  Container(
                                    width: 70,
                                    height: 38,
                                    decoration: BoxDecoration(
                                      border: Border.all(color: AppColors.primary, width: 1.5),
                                      borderRadius: BorderRadius.circular(8),
                                      color: Colors.white,
                                    ),
                                    child: TextField(
                                      controller: ctrl,
                                      textAlign: TextAlign.center,
                                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary),
                                      decoration: const InputDecoration(
                                        border: InputBorder.none,
                                        hintText: '0.0',
                                        contentPadding: EdgeInsets.symmetric(vertical: 8),
                                      ),
                                    ),
                                  ),
                                  const Spacer(),
                                  ElevatedButton(
                                    onPressed: (currentBoard != null && !isSaving)
                                        ? () => _submitScore(currentBoard!, student)
                                        : null,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.primary,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    child: isSaving
                                        ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                        : const Text('LƯU ĐIỂM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
