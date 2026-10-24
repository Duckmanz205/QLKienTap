import 'package:flutter/material.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';

Widget buildCouncilRoleBadge(String role) {
  final isCt = role == 'ChuTich' || role == 'Chủ tịch';
  final isTk = role == 'ThuKy' || role == 'Thư ký';

  final Color bgColor = isCt
      ? const Color(0xFFECFDF5)
      : isTk
          ? const Color(0xFFEFF6FF)
          : const Color(0xFFF1F5F9);
  final Color borderColor = isCt
      ? const Color(0xFFA7F3D0)
      : isTk
          ? const Color(0xFFBFDBFE)
          : const Color(0xFFCBD5E1);
  final Color textColor = isCt
      ? const Color(0xFF047857)
      : isTk
          ? const Color(0xFF1D4ED8)
          : const Color(0xFF334155);
  final IconData icon = isCt
      ? Icons.gavel
      : isTk
          ? Icons.description_outlined
          : Icons.people_outline;
  final String label = isCt
      ? 'Chủ tịch Hội đồng'
      : isTk
          ? 'Thư ký Hội đồng'
          : 'Thành viên Hội đồng';

  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
    decoration: BoxDecoration(
      color: bgColor,
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: borderColor),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: textColor),
        const SizedBox(width: 5),
        Text(
          label,
          style: TextStyle(
            color: textColor,
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    ),
  );
}

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
                if (board.isBoardLocked)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Text('Đã khóa điểm', style: TextStyle(color: Colors.red.shade700, fontSize: 10, fontWeight: FontWeight.bold)),
                  )
                else
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
                buildCouncilRoleBadge(board.role),
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
  final Map<int, TextEditingController> _noteControllers = {};
  final Map<int, bool> _savingStudent = {};
  final Map<int, bool> _lockingStudent = {};
  final Map<int, bool> _savingNote = {};
  bool _isLockingEntireBoard = false;

  @override
  void dispose() {
    for (var ctrl in _scoreControllers.values) {
      ctrl.dispose();
    }
    for (var ctrl in _noteControllers.values) {
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

  Future<void> _handleLockStudent(CouncilBoardItem board, CouncilStudentItem student) async {
    final boChuyenId = student.boChuyenId;
    if (boChuyenId == null) return;

    final appState = AppStateProvider.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Chốt điểm sinh viên', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Text('Bạn có chắc muốn chốt điểm hội đồng cho sinh viên ${student.hoTen}? Sau khi chốt, điểm số của sinh viên này sẽ được khóa và không thể chỉnh sửa.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Đóng')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            child: const Text('Xác nhận chốt'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    setState(() => _lockingStudent[student.studentId] = true);
    try {
      await appState.lockCouncilGrade(boardId: board.sessionId, boChuyenId: boChuyenId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Đã chốt điểm hội đồng cho SV ${student.hoTen} thành công!'), backgroundColor: AppColors.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        final errStr = e.toString();
        if (errStr.contains('chưa hoàn tất') || errStr.contains('chưa chấm') || errStr.contains('uncompleted')) {
          _showUncompletedWarningDialog(context, errStr);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Lỗi chốt điểm: $e'), backgroundColor: AppColors.danger),
          );
        }
      }
    } finally {
      if (mounted) setState(() => _lockingStudent[student.studentId] = false);
    }
  }

  void _showUncompletedWarningDialog(BuildContext context, String rawError) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: AppColors.warning),
            SizedBox(width: 8),
            Text('Chưa thể chốt điểm', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              rawError.replaceAll('Exception: ', ''),
              style: const TextStyle(fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: const Text(
                'Theo quy chế, Chủ tịch chỉ có thể chốt điểm khi tất cả thành viên hội đồng đã hoàn tất chấm điểm cho mọi chuyến tham quan.',
                style: TextStyle(fontSize: 11, color: AppColors.darkSlate, fontStyle: FontStyle.italic),
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            child: const Text('Đã hiểu'),
          ),
        ],
      ),
    );
  }

  void _showProgressMatrixSheet(BuildContext context, CouncilBoardItem board) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final students = board.students;
        final totalStudents = students.length;
        final lockedCount = students.where((s) => s.isGradeLocked).length;

        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.all(20),
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(ctx).size.height * 0.75,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.grid_view, color: AppColors.primary, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Tiến độ chấm Hội đồng',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Tổng quan tiến độ chấm: $lockedCount/$totalStudents sinh viên đã chốt điểm.',
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              const SizedBox(height: 14),
              const Divider(height: 1),
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  itemCount: students.length,
                  separatorBuilder: (ctx, index) => const Divider(height: 16),
                  itemBuilder: (ctx, idx) {
                    final st = students[idx];
                    final isLocked = st.isGradeLocked;

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${idx + 1}. ${st.hoTen} (${st.mssv})',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: isLocked ? const Color(0xFFECFDF5) : const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isLocked ? const Color(0xFFA7F3D0) : const Color(0xFFFDE68A),
                                ),
                              ),
                              child: Text(
                                isLocked ? 'Đã chốt' : 'Chờ chốt',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isLocked ? const Color(0xFF047857) : const Color(0xFFB45309),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        ...st.trips.map((t) => Padding(
                          padding: const EdgeInsets.only(left: 10, top: 2),
                          child: Row(
                            children: [
                              Icon(
                                t.myScore != null ? Icons.check_circle : Icons.radio_button_unchecked,
                                size: 12,
                                color: t.myScore != null ? AppColors.secondary : Colors.grey,
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  t.tenNhaMay,
                                  style: const TextStyle(fontSize: 11, color: AppColors.darkSlate),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Text(
                                t.myScore != null ? '${t.myScore!.toStringAsFixed(1)} đ' : 'Chưa chấm',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: t.myScore != null ? FontWeight.bold : FontWeight.normal,
                                  color: t.myScore != null ? AppColors.primary : Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        )),
                      ],
                    );
                  },
                ),
              ),
              const Divider(height: 1),
              const SizedBox(height: 10),
              const Text(
                '* Chỉ Chủ tịch hội đồng mới có quyền chốt điểm khi các thành viên đã chấm đầy đủ.',
                style: TextStyle(fontSize: 11, color: AppColors.textMuted, fontStyle: FontStyle.italic),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _handleLockEntireBoard(CouncilBoardItem board) async {
    final appState = AppStateProvider.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Khóa sổ toàn bộ Hội đồng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: const Text('Bạn có chắc chắn muốn khóa sổ toàn bộ điểm của phiên bảo vệ hội đồng này? Sau khi khóa sổ, tất cả thành viên sẽ không thể chỉnh sửa điểm nữa.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Đóng')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger, foregroundColor: Colors.white),
            child: const Text('Khóa sổ Hội đồng'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    setState(() => _isLockingEntireBoard = true);
    try {
      await appState.lockCouncilGrade(boardId: board.sessionId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã khóa sổ toàn bộ hội đồng thành công!'), backgroundColor: AppColors.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        final errStr = e.toString();
        if (errStr.contains('chưa hoàn tất') || errStr.contains('chưa chấm') || errStr.contains('uncompleted')) {
          _showUncompletedWarningDialog(context, errStr);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Lỗi khóa sổ hội đồng: $e'), backgroundColor: AppColors.danger),
          );
        }
      }
    } finally {
      if (mounted) setState(() => _isLockingEntireBoard = false);
    }
  }

  Future<void> _handleSaveNote(CouncilBoardItem board, CouncilStudentItem student) async {
    final boChuyenId = student.boChuyenId;
    if (boChuyenId == null) return;
    final ctrl = _noteControllers[student.studentId];
    final note = ctrl?.text.trim() ?? '';

    setState(() => _savingNote[student.studentId] = true);
    try {
      await AppStateProvider.of(context).updateCouncilStudentNote(boardId: board.sessionId, boChuyenId: boChuyenId, ghiChu: note);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã lưu ghi chú đánh giá hội đồng!'), backgroundColor: AppColors.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi lưu ghi chú: $e'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _savingNote[student.studentId] = false);
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
    final isChairman = currentBoard?.role == 'ChuTich' || currentBoard?.role == 'Chủ tịch';
    final isSecretary = currentBoard?.role == 'ThuKy' || currentBoard?.role == 'Thư ký';
    final canManageCouncil = isChairman || isSecretary;
    final isBoardLocked = currentBoard?.isBoardLocked == true;

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Chấm điểm Hội đồng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
        actions: [
          if (canManageCouncil && currentBoard != null)
            TextButton.icon(
              onPressed: () => _showProgressMatrixSheet(context, currentBoard!),
              icon: const Icon(Icons.grid_view, size: 16, color: Colors.white),
              label: const Text('Tiến độ chấm', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          if (isChairman && !isBoardLocked && currentBoard != null)
            TextButton.icon(
              onPressed: _isLockingEntireBoard ? null : () => _handleLockEntireBoard(currentBoard!),
              icon: _isLockingEntireBoard
                  ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.lock_outline, size: 16, color: Colors.white),
              label: const Text('Khóa sổ Hội đồng', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ),
        ],
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(sessionName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkSlate)),
                    ),
                    const SizedBox(width: 8),
                    buildCouncilRoleBadge(currentBoard?.role ?? widget.session?.role ?? ''),
                    if (isBoardLocked) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.lock, size: 12, color: Colors.red.shade700),
                            const SizedBox(width: 4),
                            Text('ĐÃ KHÓA SỔ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.red.shade700)),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 6),
                Text('Hội trường: $room • Thời gian: $timeRange', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                if (isBoardLocked) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.warning.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
                    ),
                    child: const Text(
                      'Biên bản chấm điểm này đã được Khoa/Chủ tịch khóa sổ. Điểm số chỉ xem, không thể chỉnh sửa.',
                      style: TextStyle(fontSize: 11, color: AppColors.darkSlate, fontStyle: FontStyle.italic),
                    ),
                  ),
                ],
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
                      final isLocking = _lockingStudent[student.studentId] ?? false;
                      final isSavingNote = _savingNote[student.studentId] ?? false;

                      // Initialize controllers if not present
                      if (!_scoreControllers.containsKey(student.studentId)) {
                        final existingScore = student.trips.isNotEmpty ? student.trips.first.myScore : null;
                        _scoreControllers[student.studentId] = TextEditingController(
                          text: existingScore != null ? existingScore.toString() : '',
                        );
                      }
                      if (!_noteControllers.containsKey(student.studentId)) {
                        _noteControllers[student.studentId] = TextEditingController(
                          text: student.councilNote ?? '',
                        );
                      }
                      final ctrl = _scoreControllers[student.studentId]!;
                      final noteCtrl = _noteControllers[student.studentId]!;
                      final hasGraded = student.trips.any((t) => t.myScore != null);
                      final isStudentLocked = isBoardLocked || student.isGradeLocked ||
                          (student.trips.isNotEmpty && student.trips.every((t) => t.isLocked));

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
                                            if (isStudentLocked)
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: Colors.red.shade50,
                                                  borderRadius: BorderRadius.circular(6),
                                                  border: Border.all(color: Colors.red.shade200),
                                                ),
                                                child: Text('Đã chốt điểm', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.red.shade700)),
                                              )
                                            else if (hasGraded)
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

                              // Score Input Row & Action Buttons
                              Wrap(
                                alignment: WrapAlignment.spaceBetween,
                                crossAxisAlignment: WrapCrossAlignment.center,
                                runSpacing: 8,
                                spacing: 8,
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Text('Điểm (0-10):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.darkSlate)),
                                      const SizedBox(width: 8),
                                      Container(
                                        width: 58,
                                        height: 36,
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                            color: isStudentLocked ? Colors.grey.shade400 : AppColors.primary,
                                            width: 1.5,
                                          ),
                                          borderRadius: BorderRadius.circular(8),
                                          color: isStudentLocked ? Colors.grey.shade100 : Colors.white,
                                        ),
                                        child: TextField(
                                          controller: ctrl,
                                          readOnly: isStudentLocked,
                                          textAlign: TextAlign.center,
                                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                            color: isStudentLocked ? Colors.grey.shade600 : AppColors.primary,
                                          ),
                                          decoration: const InputDecoration(
                                            border: InputBorder.none,
                                            hintText: '0.0',
                                            contentPadding: EdgeInsets.symmetric(vertical: 8),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      ElevatedButton(
                                        onPressed: (!isStudentLocked && currentBoard != null && !isSaving)
                                            ? () => _submitScore(currentBoard!, student)
                                            : null,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: isStudentLocked ? Colors.grey.shade400 : AppColors.primary,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                        ),
                                        child: isSaving
                                            ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                            : Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  if (isStudentLocked) ...[
                                                    const Icon(Icons.lock, size: 12),
                                                    const SizedBox(width: 4),
                                                  ],
                                                  Text(isStudentLocked ? 'ĐÃ KHÓA' : 'LƯU ĐIỂM', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                                ],
                                              ),
                                      ),
                                      if (isChairman && !isStudentLocked && currentBoard != null) ...[
                                        const SizedBox(width: 6),
                                        OutlinedButton(
                                          onPressed: isLocking ? null : () => _handleLockStudent(currentBoard!, student),
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: AppColors.danger,
                                            side: const BorderSide(color: AppColors.danger),
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                          child: isLocking
                                              ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: AppColors.danger, strokeWidth: 2))
                                              : const Text('CHỐT ĐIỂM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                        ),
                                      ],
                                    ],
                                  ),
                                ],
                              ),

                              // Council Note Section
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: noteCtrl,
                                      readOnly: isStudentLocked || !canManageCouncil,
                                      decoration: InputDecoration(
                                        hintText: canManageCouncil
                                            ? 'Nhận xét / Ghi chú đánh giá của Hội đồng...'
                                            : 'Ghi chú đánh giá của Hội đồng (Chỉ xem)',
                                        hintStyle: const TextStyle(fontSize: 11),
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
                                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
                                      ),
                                      style: const TextStyle(fontSize: 11),
                                    ),
                                  ),
                                  if (!isStudentLocked && currentBoard != null && canManageCouncil) ...[
                                    const SizedBox(width: 6),
                                    TextButton(
                                      onPressed: isSavingNote ? null : () => _handleSaveNote(currentBoard!, student),
                                      style: TextButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                        foregroundColor: AppColors.primary,
                                      ),
                                      child: isSavingNote
                                          ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2))
                                          : const Text('Lưu ghi chú', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
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
