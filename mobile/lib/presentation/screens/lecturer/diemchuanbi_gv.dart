import 'package:flutter/material.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';

class DiemChuanBiGVScreen extends StatefulWidget {
  final VoidCallback? onBack;
  const DiemChuanBiGVScreen({super.key, this.onBack});

  @override
  State<DiemChuanBiGVScreen> createState() => _DiemChuanBiGVScreenState();
}

class _DiemChuanBiGVScreenState extends State<DiemChuanBiGVScreen> {
  LecturerTour? _selectedTour;
  List<TripRegistrationStudent> _students = [];
  bool _isLoading = false;
  bool _isSaving = false;
  bool _isLocking = false;
  bool _hasInitialized = false;

  final Map<int, TextEditingController> _prepControllers = {};
  final Map<int, double> _extraGrades = {};

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasInitialized) {
      _hasInitialized = true;
      final appState = AppStateProvider.of(context).state;
      if (appState.lecturerTours.isNotEmpty) {
        _selectedTour = appState.lecturerTours.first;
        _loadStudents(int.tryParse(_selectedTour!.id) ?? 0);
      }
    }
  }

  @override
  void dispose() {
    for (var ctrl in _prepControllers.values) {
      ctrl.dispose();
    }
    super.dispose();
  }

  Future<void> _loadStudents(int tourId) async {
    if (tourId <= 0) return;
    setState(() => _isLoading = true);
    try {
      final list = await AppStateProvider.of(context).fetchTripRegistrations(tourId);
      if (mounted) {
        _prepControllers.clear();
        _extraGrades.clear();
        for (var s in list) {
          _prepControllers[s.phieuId] = TextEditingController(text: s.prelimGrade > 0 ? s.prelimGrade.toString() : '');
          _extraGrades[s.phieuId] = s.extraGrade;
        }
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

  Future<void> _saveAllGrades() async {
    setState(() => _isSaving = true);
    int savedCount = 0;
    try {
      for (var s in _students) {
        if (s.isLockedPrep) continue;
        final prepText = _prepControllers[s.phieuId]?.text.trim() ?? '0';
        final prepScore = double.tryParse(prepText) ?? 0.0;
        final extraScore = _extraGrades[s.phieuId] ?? 0.0;

        await ApiService.gradePrepAndBonus(s.phieuId, prepScore, extraScore);
        savedCount++;
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã lưu điểm cho $savedCount sinh viên thành công!'),
            backgroundColor: AppColors.secondary,
          ),
        );
        final tourId = int.tryParse(_selectedTour?.id ?? '') ?? 0;
        if (tourId > 0) _loadStudents(tourId);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi khi lưu điểm: $e'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  Future<void> _lockTripPrepGrades() async {
    if (_selectedTour == null) return;
    final tourId = int.tryParse(_selectedTour!.id) ?? 0;
    if (tourId <= 0) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Khóa điểm chuẩn bị', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Text(
          'Bạn có chắc chắn muốn khóa điểm chuẩn bị và điểm cộng cho chuyến "${_selectedTour!.name}"?\n\nSau khi khóa, toàn bộ điểm sẽ được chốt và bạn sẽ không thể chỉnh sửa.',
          style: const TextStyle(fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('HỦY', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger, foregroundColor: Colors.white),
            child: const Text('XÁC NHẬN KHÓA'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      setState(() => _isLocking = true);
      try {
        await AppStateProvider.of(context).lockTripPrepGrades(tourId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã khóa điểm chuẩn bị chuyến tham quan thành công!'),
              backgroundColor: AppColors.secondary,
            ),
          );
          _loadStudents(tourId);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Lỗi khóa điểm: $e'), backgroundColor: AppColors.danger),
          );
        }
      } finally {
        if (mounted) {
          setState(() => _isLocking = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context).state;
    final tours = appState.lecturerTours;

    final isLocked = _students.isNotEmpty && _students.any((s) => s.isLockedPrep);

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Điểm chuẩn bị & Điểm cộng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        leading: widget.onBack != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: widget.onBack,
              )
            : null,
      ),
      body: Column(
        children: [
          // Header Tour Selector & Info Card
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

                // Locked Status Notice or Info Box
                if (isLocked)
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.amber.shade300),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.lock, size: 18, color: Colors.amber),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Điểm chuẩn bị của chuyến này đã được khóa. Không thể chỉnh sửa.',
                            style: TextStyle(fontSize: 12, color: Colors.brown, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF2F5ED),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.info_outline, color: AppColors.primary, size: 18),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Điểm chuẩn bị (tối đa 10) chiếm 30% điểm chuyến đi. Điểm cộng (tối đa 1.0) dành cho các đóng góp tích cực.',
                            style: TextStyle(color: Color(0xFF4A5568), fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),

          // Student Scoring List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _students.isEmpty
                    ? Center(
                        child: Text(
                          'Chưa có sinh viên nào trong chuyến này.',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _students.length,
                        itemBuilder: (context, idx) {
                          final student = _students[idx];
                          final ctrl = _prepControllers[student.phieuId];
                          final bonus = _extraGrades[student.phieuId] ?? 0.0;

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
                                  // Header: Student Name & MSSV
                                  Row(
                                    children: [
                                      Container(
                                        width: 36,
                                        height: 36,
                                        decoration: BoxDecoration(
                                          color: AppColors.primary.withValues(alpha: 0.1),
                                          shape: BoxShape.circle,
                                        ),
                                        alignment: Alignment.center,
                                        child: Text(
                                          student.hoTen.isNotEmpty ? student.hoTen[0].toUpperCase() : 'S',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.primary),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              student.hoTen,
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkSlate),
                                            ),
                                            Text(
                                              'MSSV: ${student.mssv} • Lớp: ${student.className}',
                                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (student.isLockedPrep)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: Colors.grey.shade200,
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Text('Đã khóa', style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),

                                  // Scores Input Row
                                  Row(
                                    children: [
                                      // Điểm chuẩn bị TextField
                                      Expanded(
                                        flex: 2,
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text('Điểm chuẩn bị (0-10)', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                            const SizedBox(height: 4),
                                            Container(
                                              height: 40,
                                              decoration: BoxDecoration(
                                                color: student.isLockedPrep ? Colors.grey.shade100 : Colors.white,
                                                border: Border.all(color: Colors.grey.shade300),
                                                borderRadius: BorderRadius.circular(8),
                                              ),
                                              child: TextField(
                                                controller: ctrl,
                                                enabled: !student.isLockedPrep,
                                                textAlign: TextAlign.center,
                                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                                decoration: const InputDecoration(
                                                  border: InputBorder.none,
                                                  hintText: '0.0',
                                                  contentPadding: EdgeInsets.symmetric(vertical: 10),
                                                ),
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkSlate),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 12),

                                      // Điểm cộng Chips
                                      Expanded(
                                        flex: 3,
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                const Text('Điểm cộng', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                                Text('+${bonus.toStringAsFixed(2)}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.secondary)),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Row(
                                              children: [0.0, 0.25, 0.5, 1.0].map((val) {
                                                final isSelected = (bonus - val).abs() < 0.01;
                                                return Expanded(
                                                  child: GestureDetector(
                                                    onTap: student.isLockedPrep
                                                        ? null
                                                        : () {
                                                            setState(() {
                                                              _extraGrades[student.phieuId] = val;
                                                            });
                                                          },
                                                    child: Container(
                                                      height: 40,
                                                      margin: const EdgeInsets.only(right: 4),
                                                      decoration: BoxDecoration(
                                                        color: isSelected ? AppColors.secondary : Colors.grey.shade100,
                                                        borderRadius: BorderRadius.circular(6),
                                                        border: Border.all(
                                                          color: isSelected ? AppColors.secondary : Colors.grey.shade300,
                                                        ),
                                                      ),
                                                      alignment: Alignment.center,
                                                      child: Text(
                                                        val == 0 ? '0' : '+$val',
                                                        style: TextStyle(
                                                          fontSize: 10,
                                                          fontWeight: FontWeight.bold,
                                                          color: isSelected ? Colors.white : Colors.grey.shade700,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                );
                                              }).toList(),
                                            ),
                                          ],
                                        ),
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

          // Bottom Action Buttons
          if (!isLocked && _students.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.white,
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _isLocking ? null : _lockTripPrepGrades,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.danger,
                        side: const BorderSide(color: AppColors.danger),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: _isLocking
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: AppColors.danger, strokeWidth: 2))
                          : const Text('KHÓA ĐIỂM CHUYẾN ĐI', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _saveAllGrades,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: _isSaving
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('LƯU ĐIỂM CHUẨN BỊ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
