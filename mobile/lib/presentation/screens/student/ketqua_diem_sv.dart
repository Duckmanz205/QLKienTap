import 'package:flutter/material.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';

class KetQuaDiemSVScreen extends StatefulWidget {
  const KetQuaDiemSVScreen({super.key});

  @override
  State<KetQuaDiemSVScreen> createState() => _KetQuaDiemSVScreenState();
}

class _KetQuaDiemSVScreenState extends State<KetQuaDiemSVScreen> {
  bool _isLoading = false;
  bool _hasInitialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasInitialized) {
      _hasInitialized = true;
      _loadGrades();
    }
  }

  Future<void> _loadGrades() async {
    final studentId = ApiService.profileId ?? ApiService.userId;
    if (studentId == null) return;

    setState(() => _isLoading = true);
    try {
      await AppStateProvider.of(context).fetchStudentGrades(studentId);
    } catch (_) {
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;
    final termGrade = appState.termGrade;

    return RefreshIndicator(
      onRefresh: _loadGrades,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Thanh chọn Đợt kiến tập (Cohort Selector) khi sinh viên học lại / có nhiều đợt
            if (appState.termGrades.length > 1) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.beigeBorder),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    const Icon(Icons.school_outlined, size: 20, color: AppColors.primary),
                    const SizedBox(width: 10),
                    const Text(
                      'Đợt học:',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black87),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int>(
                          value: appState.selectedTermIndex < appState.termGrades.length
                              ? appState.selectedTermIndex
                              : 0,
                          isExpanded: true,
                          icon: const Icon(Icons.arrow_drop_down, color: AppColors.primary),
                          items: List.generate(appState.termGrades.length, (idx) {
                            final tg = appState.termGrades[idx];
                            final title = tg.tenDot ?? 'Đợt kiến tập #${idx + 1}';
                            final extra = tg.lanDangKy != null && tg.lanDangKy! > 1
                                ? ' (Lần ${tg.lanDangKy})'
                                : '';
                            return DropdownMenuItem<int>(
                              value: idx,
                              child: Text(
                                '$title$extra',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }),
                          onChanged: (newIdx) {
                            if (newIdx != null) {
                              appStateProvider.setSelectedTermIndex(newIdx);
                            }
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            // Overall Grade Card
            _buildOverallGradeCard(termGrade),
            const SizedBox(height: 16),

            // Formula Info Box
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.beigeBorder),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, size: 20, color: AppColors.primary),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Công thức tính điểm: (Chuẩn bị × 0.3) + (Báo cáo × 0.3) + (Hội đồng × 0.4) + Điểm cộng',
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade700, height: 1.3),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Chi tiết điểm các chuyến đi',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                ),
                if (termGrade != null && termGrade.tripGrades.isNotEmpty)
                  Text(
                    '${termGrade.tripGrades.length} chuyến',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                  ),
              ],
            ),
            const SizedBox(height: 12),

            if (_isLoading) ...[
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              ),
            ] else if (termGrade == null || termGrade.tripGrades.isEmpty) ...[
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: [
                    Icon(Icons.assessment_outlined, size: 48, color: Colors.grey.shade400),
                    const SizedBox(height: 12),
                    const Text(
                      'Chưa có dữ liệu điểm kiến tập',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Điểm số sẽ được cập nhật sau khi các Giảng viên và Hội đồng hoàn thành việc chấm điểm.',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ] else ...[
              ...termGrade.tripGrades.map((tg) => _buildTripGradeCard(tg, termGrade)),
            ],
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildOverallGradeCard(StudentTermGrade? grade) {
    String scoreText = '--';
    String statusText = 'Đang chờ điểm';
    Color badgeColor = AppColors.warning;
    Color textColor = AppColors.darkSlate;

    if (grade != null) {
      if (grade.diemTongKet != null) {
        scoreText = grade.diemTongKet!.toStringAsFixed(1);
        if (grade.diemTongKet! >= 5.0) {
          statusText = 'Đạt yêu cầu';
          badgeColor = AppColors.secondary;
          textColor = Colors.white;
        } else {
          statusText = 'Chưa đạt';
          badgeColor = AppColors.danger;
          textColor = Colors.white;
        }
      } else {
        // Calculate estimated average from valid trip grades
        final validScores = grade.tripGrades
            .map((t) => t.calculateCalculatedScore())
            .where((s) => s != null)
            .toList();

        if (validScores.isNotEmpty) {
          final avg = validScores.fold<double>(0, (acc, s) => acc + s!) / validScores.length;
          scoreText = avg.toStringAsFixed(1);
          if (avg >= 5.0) {
            statusText = 'Tạm tính: Đạt';
            badgeColor = AppColors.secondary;
            textColor = Colors.white;
          } else {
            statusText = 'Tạm tính: Chưa đạt';
            badgeColor = AppColors.danger;
            textColor = Colors.white;
          }
        }
      }
    }

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary,
            AppColors.primary.withValues(alpha: 0.85),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'ĐIỂM TỔNG KẾT HỌC PHẦN',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            scoreText,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 48,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: badgeColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              statusText,
              style: TextStyle(
                color: textColor,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            grade?.isScoreLocked == true
                ? 'Bảng điểm chính thức đã được Khoa phê duyệt.'
                : 'Bảng điểm đang trong quá trình chấm và tổng hợp.',
            style: const TextStyle(color: Colors.white70, fontSize: 11, fontStyle: FontStyle.italic),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildTripGradeCard(TripGradeItem trip, StudentTermGrade? termGrade) {
    final finalScore = trip.calculateCalculatedScore();
    final hasScore = finalScore != null;

    final isScoreLocked = termGrade?.isScoreLocked == true || termGrade?.diemTongKet != null;
    final isPassed = termGrade?.isPassed ?? false;
    final isOverallPassed = termGrade?.trangThai == 'Dat' || (isScoreLocked && isPassed);
    final isOverallFailed = termGrade?.trangThai == 'KhongDat' || (isScoreLocked && !isPassed);

    String tripResult;
    if (isOverallPassed) {
      tripResult = 'Dat';
    } else if (isOverallFailed) {
      tripResult = 'KhongDat';
    } else if (trip.ketQua == 'Dat' || trip.ketQua == 'KhongDat') {
      tripResult = trip.ketQua!;
    } else if (hasScore) {
      tripResult = finalScore >= 5.0 ? 'Dat' : 'KhongDat';
    } else {
      tripResult = 'ChoDiem';
    }

    Widget resultBadge;
    if (tripResult == 'Dat') {
      resultBadge = Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: AppColors.secondary.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.secondary.withValues(alpha: 0.3)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_outline, size: 12, color: AppColors.secondary),
            SizedBox(width: 4),
            Text(
              'Đạt',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppColors.secondary,
              ),
            ),
          ],
        ),
      );
    } else if (tripResult == 'KhongDat') {
      resultBadge = Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: AppColors.danger.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cancel_outlined, size: 12, color: AppColors.danger),
            SizedBox(width: 4),
            Text(
              'Không đạt',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppColors.danger,
              ),
            ),
          ],
        ),
      );
    } else {
      resultBadge = Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.warning.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Text(
          'Đang chấm',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
        ),
      );
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.beigeBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Title & Total score
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        trip.tenNhaMay,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkSlate),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          trip.hinhThuc,
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (hasScore) ...[
                      Text(
                        finalScore.toStringAsFixed(1),
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.primary),
                      ),
                      const SizedBox(height: 2),
                    ],
                    resultBadge,
                  ],
                ),
              ],
            ),
            const Divider(height: 20),

            // 4 Component Scores
            Row(
              children: [
                Expanded(
                  child: _buildScoreColumn(
                    'Chuẩn bị (30%)',
                    trip.diemChuanBi,
                    pendingText: (!trip.daKhoaChuanBi && !trip.daKhoa && !isScoreLocked) ? 'Chờ chốt' : null,
                  ),
                ),
                Expanded(
                  child: _buildScoreColumn(
                    'Báo cáo (30%)',
                    trip.diemBaiThuHoach,
                    pendingText: (!trip.daKhoaThuHoach && !trip.daKhoa && !isScoreLocked) ? 'Chờ chốt' : null,
                  ),
                ),
                Expanded(
                  child: _buildScoreColumn(
                    'Hội đồng (40%)',
                    trip.diemBaoCaoTQNM,
                    pendingText: (!trip.daKhoaHoiDong && !trip.daKhoa && !isScoreLocked) ? 'Chờ chốt' : null,
                  ),
                ),
                Expanded(
                  child: _buildScoreColumn('Điểm cộng', trip.diemCong, isBonus: true),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreColumn(String title, double? score, {bool isBonus = false, String? pendingText}) {
    String scoreText = pendingText ?? '--';
    if (score != null) {
      scoreText = isBonus ? '+${score.toStringAsFixed(1)}' : score.toStringAsFixed(1);
    }

    final isPendingChip = score == null && pendingText != null;

    return Column(
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4),
        if (isPendingChip)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              scoreText,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: AppColors.darkSlate,
              ),
            ),
          )
        else
          Text(
            scoreText,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: isBonus && (score ?? 0) > 0 ? AppColors.secondary : AppColors.darkSlate,
            ),
          ),
      ],
    );
  }
}
