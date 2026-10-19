import 'package:flutter/material.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';

class DiemDanhSVGVScreen extends StatefulWidget {
  final LecturerTour? initialTour;
  final VoidCallback? onBack;

  const DiemDanhSVGVScreen({
    super.key,
    this.initialTour,
    this.onBack,
  });

  @override
  State<DiemDanhSVGVScreen> createState() => _DiemDanhSVGVScreenState();
}

class _DiemDanhSVGVScreenState extends State<DiemDanhSVGVScreen> {
  LecturerTour? _selectedTour;
  List<TripRegistrationStudent> _students = [];
  bool _isLoading = false;
  bool _isSaving = false;
  bool _hasInitialized = false;

  String _searchQuery = '';
  final String _filterStatus = 'Tất cả';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasInitialized) {
      _hasInitialized = true;
      final appState = AppStateProvider.of(context).state;
      if (widget.initialTour != null) {
        _selectedTour = widget.initialTour;
      } else if (appState.lecturerTours.isNotEmpty) {
        _selectedTour = appState.lecturerTours.first;
      }
      if (_selectedTour != null) {
        _loadStudents(int.tryParse(_selectedTour!.id) ?? 0);
      }
    }
  }

  Future<void> _loadStudents(int tourId) async {
    if (tourId <= 0) return;
    setState(() => _isLoading = true);
    try {
      final list = await AppStateProvider.of(context).fetchTripRegistrations(tourId);
      if (mounted) {
        setState(() {
          _students = List.from(list);
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _saveAttendance() async {
    if (_selectedTour == null || _students.isEmpty) return;
    final tourId = int.tryParse(_selectedTour!.id) ?? 0;
    if (tourId <= 0) return;

    setState(() => _isSaving = true);
    try {
      final records = _students.map((s) {
        final status = (s.attendanceStatus == 'ChuaDiemDanh' || s.attendanceStatus.isEmpty)
            ? 'CoMat'
            : s.attendanceStatus;
        return {
          'phieuId': s.phieuId,
          'status': status,
          if (s.excuseReason != null && s.excuseReason!.isNotEmpty) 'note': s.excuseReason,
        };
      }).toList();

      await ApiService.takeAttendance(tourId, records);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã lưu kết quả điểm danh thành công!'),
            backgroundColor: AppColors.secondary,
          ),
        );
        _loadStudents(tourId);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi lưu điểm danh: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  void _markAllPresent() {
    setState(() {
      _students = _students.map((s) => s.copyWith(attendanceStatus: 'CoMat', excuseReason: null)).toList();
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đã đánh dấu tất cả Có mặt.')),
    );
  }

  void _updateStudentAttendance(int phieuId, String newStatus, {String? reason}) {
    setState(() {
      _students = _students.map((s) {
        if (s.phieuId == phieuId) {
          return s.copyWith(
            attendanceStatus: newStatus,
            excuseReason: reason ?? (newStatus == 'CoMat' ? null : s.excuseReason),
          );
        }
        return s;
      }).toList();
    });
  }

  Future<void> _showReasonDialog(TripRegistrationStudent student, String newStatus) async {
    final title = newStatus == 'Vang' ? 'Lý do vắng mặt' : 'Lý do từ chối tham gia';
    final ctrl = TextEditingController(text: student.excuseReason ?? '');

    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(
            labelText: 'Nhập lý do chi tiết',
            border: OutlineInputBorder(),
          ),
          maxLines: 2,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, null),
            child: const Text('HỦY', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            child: const Text('XÁC NHẬN'),
          ),
        ],
      ),
    );

    if (result != null) {
      _updateStudentAttendance(student.phieuId, newStatus, reason: result);
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context).state;
    final tours = appState.lecturerTours;

    final filtered = _students.where((s) {
      final matchQuery = s.hoTen.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.mssv.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchFilter = _filterStatus == 'Tất cả' ||
          (_filterStatus == 'CoMat' && s.attendanceStatus == 'CoMat') ||
          (_filterStatus == 'Vang' && s.attendanceStatus == 'Vang') ||
          (_filterStatus == 'TuChoiThamGia' && s.attendanceStatus == 'TuChoiThamGia') ||
          (_filterStatus == 'ChuaDiemDanh' && (s.attendanceStatus == 'ChuaDiemDanh' || s.attendanceStatus.isEmpty));
      return matchQuery && matchFilter;
    }).toList();

    final presentCount = _students.where((s) => s.attendanceStatus == 'CoMat').length;
    final absentCount = _students.where((s) => s.attendanceStatus == 'Vang').length;
    final refusedCount = _students.where((s) => s.attendanceStatus == 'TuChoiThamGia').length;

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Điểm danh Chuyến tham quan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        leading: widget.onBack != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: widget.onBack,
              )
            : null,
      ),
      body: Column(
        children: [
          // Header Tour Selector & Search Box
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (tours.isNotEmpty) ...[
                  const Text('Chọn chuyến tham quan dẫn đoàn', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<LecturerTour>(
                        value: tours.any((t) => t.id == _selectedTour?.id) ? _selectedTour : tours.first,
                        isExpanded: true,
                        icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.primary),
                        items: tours.map((t) {
                          return DropdownMenuItem<LecturerTour>(
                            value: t,
                            child: Text('${t.name} (${t.date})', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                          );
                        }).toList(),
                        onChanged: (newTour) {
                          if (newTour != null && newTour.id != _selectedTour?.id) {
                            setState(() {
                              _selectedTour = newTour;
                            });
                            _loadStudents(int.tryParse(newTour.id) ?? 0);
                          }
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Search Bar
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Tìm theo họ tên hoặc MSSV...',
                    hintStyle: const TextStyle(fontSize: 13),
                    prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.primary),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
                  ),
                ),
                const SizedBox(height: 12),

                // Counters & Quick Actions
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        'Có mặt: $presentCount | Vắng: $absentCount | Từ chối: $refusedCount',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                      ),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: _markAllPresent,
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text('Tất cả có mặt', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Student List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _students.isEmpty
                    ? Center(
                        child: Text(
                          'Chưa có sinh viên nào đăng ký chuyến này.',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        itemBuilder: (context, idx) {
                          final student = filtered[idx];
                          final isPresent = student.attendanceStatus == 'CoMat';
                          final isAbsent = student.attendanceStatus == 'Vang';
                          final isRefused = student.attendanceStatus == 'TuChoiThamGia';

                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
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
                                      // Avatar / Initial
                                      Container(
                                        width: 40,
                                        height: 40,
                                        decoration: BoxDecoration(
                                          color: AppColors.primary.withValues(alpha: 0.1),
                                          shape: BoxShape.circle,
                                        ),
                                        alignment: Alignment.center,
                                        child: Text(
                                          student.hoTen.isNotEmpty ? student.hoTen[0].toUpperCase() : 'S',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary),
                                        ),
                                      ),
                                      const SizedBox(width: 12),

                                      // Name & MSSV
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              student.hoTen,
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkSlate),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              'MSSV: ${student.mssv} • Lớp: ${student.className}',
                                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                            ),
                                            if (student.feeStatus != 'DaDongDungHan') ...[
                                              const SizedBox(height: 4),
                                              Text(
                                                'Phí: Chưa hoàn tất (${student.feeStatus})',
                                                style: const TextStyle(fontSize: 10, color: AppColors.danger, fontWeight: FontWeight.bold),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),

                                      // 3 Attendance Action Buttons
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          _buildAttendanceBtn(
                                            icon: Icons.check,
                                            label: 'Có',
                                            isActive: isPresent,
                                            activeColor: AppColors.secondary,
                                            onTap: () => _updateStudentAttendance(student.phieuId, 'CoMat'),
                                          ),
                                          const SizedBox(width: 6),
                                          _buildAttendanceBtn(
                                            icon: Icons.close,
                                            label: 'Vắng',
                                            isActive: isAbsent,
                                            activeColor: AppColors.danger,
                                            onTap: () => _showReasonDialog(student, 'Vang'),
                                          ),
                                          const SizedBox(width: 6),
                                          _buildAttendanceBtn(
                                            icon: Icons.block,
                                            label: 'Từ chối',
                                            isActive: isRefused,
                                            activeColor: Colors.orange,
                                            onTap: () => _showReasonDialog(student, 'TuChoiThamGia'),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),

                                  if (student.excuseReason != null && student.excuseReason!.isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: Colors.grey.shade100,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Row(
                                        children: [
                                          const Text('Lý do: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                                          Expanded(
                                            child: Text(student.excuseReason!, style: const TextStyle(fontSize: 11, color: AppColors.darkSlate)),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),

          // Bottom Bar Save Button
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _saveAttendance,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isSaving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('LƯU KẾT QUẢ ĐIỂM DANH', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceBtn({
    required IconData icon,
    required String label,
    required bool isActive,
    required Color activeColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? activeColor : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isActive ? activeColor : Colors.grey.shade300,
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isActive ? Colors.white : Colors.grey.shade600),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isActive ? Colors.white : Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
