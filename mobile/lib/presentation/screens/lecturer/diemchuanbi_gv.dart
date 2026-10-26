import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
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
  bool _isImporting = false;
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
    if (_selectedTour == null || _students.isEmpty) return;
    final tourId = int.tryParse(_selectedTour!.id) ?? 0;
    if (tourId <= 0) return;

    setState(() => _isSaving = true);
    try {
      final records = <Map<String, dynamic>>[];
      for (var s in _students) {
        if (s.isLockedPrep) continue;
        final prepText = _prepControllers[s.phieuId]?.text.trim() ?? '0';
        final prepScore = double.tryParse(prepText) ?? 0.0;
        final extraScore = _extraGrades[s.phieuId] ?? 0.0;
        records.add({
          'phieuId': s.phieuId,
          'diemChuanBi': prepScore,
          'diemCong': extraScore,
        });
      }

      if (records.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Không có điểm sinh viên nào cần lưu.')),
          );
        }
        return;
      }

      await AppStateProvider.of(context).saveTripPrepGradesBatch(tourId, records);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã lưu điểm cho ${records.length} sinh viên thành công!'),
            backgroundColor: AppColors.secondary,
          ),
        );
        _loadStudents(tourId);
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

  // Chọn file Excel và phân tích xem trước kết quả
  Future<void> _pickAndImportExcel() async {
    if (_selectedTour == null) return;
    final tourId = int.tryParse(_selectedTour!.id) ?? 0;
    if (tourId <= 0) return;

    final isLocked = _students.isNotEmpty && _students.any((s) => s.isLockedPrep);
    if (isLocked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Điểm của chuyến này đã bị khóa, không thể nhập thêm điểm mới.'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    try {
      final pickerResult = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['xlsx', 'xls'],
      );

      if (pickerResult == null || pickerResult.files.single.path == null) {
        return;
      }

      final file = pickerResult.files.single;

      setState(() => _isImporting = true);

      final res = await AppStateProvider.of(context)
          .importPrepGradesExcel(tourId, file.path!, saveImmediately: false);

      if (!mounted) return;

      _showImportPreviewBottomSheet(res, file.name);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi đọc file Excel: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isImporting = false);
      }
    }
  }

  // Hiển thị BottomSheet xem trước đối soát và xác nhận áp dụng
  void _showImportPreviewBottomSheet(Map<String, dynamic> res, String fileName) {
    final matchedCount = res['matchedCount'] ?? 0;
    final unmatchedCount = res['unmatchedCount'] ?? 0;
    final invalidCount = res['invalidCount'] ?? 0;
    final List<dynamic> records = res['records'] ?? [];
    final List<dynamic> unmatchedMssvs = res['unmatchedMssvs'] ?? [];
    final List<dynamic> invalidRows = res['invalidRows'] ?? [];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalContext, setModalState) {
            bool isSavingModal = false;

            return Container(
              height: MediaQuery.of(context).size.height * 0.82,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  Center(
                    child: Container(
                      margin: const EdgeInsets.only(top: 10, bottom: 8),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 14),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.table_chart, color: AppColors.primary, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Kết quả đọc file Excel',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.darkSlate),
                              ),
                              Text(
                                fileName,
                                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.grey),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFE8F5E9),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFA5D6A7)),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('$matchedCount / ${_students.length}',
                                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary)),
                                      const SizedBox(height: 2),
                                      const Text('SV khớp danh sách', style: TextStyle(fontSize: 11, color: Color(0xFF2E7D32), fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFF8E1),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFFFE082)),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('$unmatchedCount',
                                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFFF57F17))),
                                      const SizedBox(height: 2),
                                      const Text('Ngoài chuyến đi', style: TextStyle(fontSize: 11, color: Color(0xFFF57F17), fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ),
                              ),
                              if (invalidCount > 0) ...[
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFFEBEE),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: const Color(0xFFFFCDD2)),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('$invalidCount',
                                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.danger)),
                                        const SizedBox(height: 2),
                                        const Text('Điểm không hợp lệ', style: TextStyle(fontSize: 11, color: AppColors.danger, fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          if (unmatchedMssvs.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF8E1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFFFFE082)),
                              ),
                              child: Text(
                                'Các MSSV không thuộc chuyến: ${unmatchedMssvs.join(', ')}',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF795548)),
                              ),
                            ),
                          ],
                          if (invalidRows.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFEBEE),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFFFFCDD2)),
                              ),
                              child: Text(
                                'Dòng điểm lỗi: ${invalidRows.map((e) => 'Dòng ${e['row']}: ${e['error']}').join('; ')}',
                                style: const TextStyle(fontSize: 11, color: AppColors.danger),
                              ),
                            ),
                          ],
                          const SizedBox(height: 16),
                          const Text(
                            'Xem trước danh sách cập nhật điểm:',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                          ),
                          const SizedBox(height: 8),
                          if (records.isEmpty)
                            Container(
                              padding: const EdgeInsets.all(24),
                              alignment: Alignment.center,
                              child: const Text('Không tìm thấy sinh viên nào phù hợp trong file Excel.'),
                            )
                          else
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: records.length,
                              separatorBuilder: (_, __) => const Divider(height: 1),
                              itemBuilder: (c, idx) {
                                final r = records[idx];
                                return Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(r['hoTen'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                            Text('MSSV: ${r['mssv']}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                          ],
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFE8F5E9),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          'Chuẩn bị: ${r['diemChuanBi']}',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.primary),
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      if ((r['diemCong'] ?? 0) > 0)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFFFF8E1),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            '+${r['diemCong']}',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFFF57F17)),
                                          ),
                                        ),
                                    ],
                                  ),
                                );
                              },
                            ),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border(top: BorderSide(color: Colors.grey.shade200)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: isSavingModal || records.isEmpty
                                ? null
                                : () {
                                    for (var r in records) {
                                      final phieuId = r['phieuId'];
                                      if (phieuId != null && _prepControllers.containsKey(phieuId)) {
                                        _prepControllers[phieuId]?.text = r['diemChuanBi']?.toString() ?? '';
                                        _extraGrades[phieuId] = (r['diemCong'] as num?)?.toDouble() ?? 0.0;
                                      }
                                    }
                                    setState(() {});
                                    Navigator.pop(ctx);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Đã áp dụng điểm từ file Excel cho ${records.length} sinh viên! Bấm "LƯU ĐIỂM CHUẨN BỊ" để lưu.'),
                                        backgroundColor: AppColors.secondary,
                                      ),
                                    );
                                  },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.primary,
                              side: const BorderSide(color: AppColors.primary),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('ÁP DỤNG VÀO BẢNG', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: isSavingModal || records.isEmpty
                                ? null
                                : () async {
                                    setModalState(() => isSavingModal = true);
                                    try {
                                      final tourId = int.tryParse(_selectedTour?.id ?? '') ?? 0;
                                      final batchRecords = records.map((r) => {
                                        'phieuId': r['phieuId'],
                                        'diemChuanBi': r['diemChuanBi'],
                                        'diemCong': r['diemCong'] ?? 0,
                                      }).toList();

                                      await AppStateProvider.of(context).saveTripPrepGradesBatch(tourId, batchRecords);

                                      for (var r in records) {
                                        final phieuId = r['phieuId'];
                                        if (phieuId != null && _prepControllers.containsKey(phieuId)) {
                                          _prepControllers[phieuId]?.text = r['diemChuanBi']?.toString() ?? '';
                                          _extraGrades[phieuId] = (r['diemCong'] as num?)?.toDouble() ?? 0.0;
                                        }
                                      }
                                      if (mounted) {
                                        setState(() {});
                                        Navigator.pop(ctx);
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text('Đã cập nhật và lưu điểm thành công cho ${records.length} sinh viên!'),
                                            backgroundColor: AppColors.secondary,
                                          ),
                                        );
                                      }
                                    } catch (e) {
                                      setModalState(() => isSavingModal = false);
                                      if (mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text('Lỗi khi lưu điểm: $e'), backgroundColor: AppColors.danger),
                                        );
                                      }
                                    }
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: isSavingModal
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('ÁP DỤNG & LƯU NGAY', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
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
        actions: [
          if (!isLocked && _students.isNotEmpty)
            IconButton(
              icon: _isImporting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          color: AppColors.primary, strokeWidth: 2))
                  : const Icon(Icons.table_view_rounded,
                      color: AppColors.primary),
              tooltip: 'Nhập điểm từ file Excel',
              onPressed: _isImporting ? null : _pickAndImportExcel,
            ),
        ],
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
                        value: tours.firstWhere((t) => t.id == _selectedTour?.id, orElse: () => tours.first),
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
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.lock, size: 18, color: Color(0xFF047857)),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Đã nộp điểm lên Khoa (Đã khóa sổ)',
                            style: TextStyle(fontSize: 12, color: Color(0xFF065F46), fontWeight: FontWeight.bold),
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

                if (!isLocked && _students.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: _isImporting ? null : _pickAndImportExcel,
                    icon: _isImporting
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.file_upload_outlined, size: 18),
                    label: const Text('Nhập nhanh từ file Excel',
                        style: TextStyle(
                            fontSize: 12, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                      padding: const EdgeInsets.symmetric(
                          vertical: 10, horizontal: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
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
