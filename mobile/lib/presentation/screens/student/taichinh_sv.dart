import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';
import '../../widgets/paginated_list.dart';
import '../../widgets/searchable_dropdown.dart';

class TaiChinhSVScreen extends StatefulWidget {
  const TaiChinhSVScreen({super.key});

  @override
  State<TaiChinhSVScreen> createState() => _TaiChinhSVScreenState();
}

class _TaiChinhSVScreenState extends State<TaiChinhSVScreen> {
  String _financeTab = 'payment'; // 'payment' or 'refund'
  String? _refundSelectedInvoice;
  String? _refundUploadedFile;
  String? _refundLocalFilePath;
  bool _isUploadingRefund = false;
  Map<String, dynamic>? _paymentConfig;

  @override
  void initState() {
    super.initState();
    _loadPaymentConfig();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && ApiService.userId != null) {
        AppStateProvider.of(context).fetchStudentDataFromApi(ApiService.userId!);
      }
    });
  }

  Future<void> _loadPaymentConfig() async {
    try {
      final res = await ApiService.getPaymentConfig();
      if (res != null && mounted) {
        setState(() {
          _paymentConfig = res is Map ? Map<String, dynamic>.from(res) : null;
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    return Column(
      children: [
        // Tab switcher styled to match Web (clean tabs with active indicator underline)
        Container(
          margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: Color(0xFFE7E0C4), width: 1.5)),
          ),
          child: Row(
            children: [
              _buildTabButton('payment', 'Thanh toán'),
              _buildTabButton('refund', 'Hoàn phí'),
            ],
          ),
        ),

        Expanded(
          child: _financeTab == 'payment'
              ? _buildPaymentsTab(appState, appStateProvider)
              : _buildRefundsTab(appState, appStateProvider),
        ),
      ],
    );
  }

  Widget _buildTabButton(String tabKey, String title) {
    final isActive = _financeTab == tabKey;
    return InkWell(
      onTap: () => setState(() => _financeTab = tabKey),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isActive ? AppColors.primary : Colors.transparent,
              width: 2.5,
            ),
          ),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: isActive ? AppColors.primary : Colors.grey.shade600,
          ),
        ),
      ),
    );
  }

  String _formatCurrency(double amount) {
    return amount.toInt().toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]}.',
        );
  }

  Widget _buildPaymentsTab(AppState appState, AppStateProviderState appStateProvider) {
    return RefreshIndicator(
      onRefresh: () async {
        if (ApiService.userId != null) {
          await appStateProvider.fetchStudentDataFromApi(ApiService.userId!);
          await _loadPaymentConfig();
        }
      },
      child: PaginatedList<Payment>(
        items: appState.payments,
        searchHint: 'Tìm theo nhà máy, nội dung...',
        dropdownTitle: 'Trạng thái',
        dropdownOptions: const [
          'Tất cả trạng thái',
          'Chưa đóng',
          'Đã đóng đúng hạn',
          'Đã đóng trễ hạn',
          'Vi phạm',
          'Đã hoàn phí',
        ],
        itemName: 'hóa đơn',
        filter: (p, query, status) {
          final matchesQuery = p.name.toLowerCase().contains(query.toLowerCase()) || 
                               p.code.toLowerCase().contains(query.toLowerCase());
          final matchesStatus = status == 'Tất cả trạng thái' || p.status == status;
          return matchesQuery && matchesStatus;
        },
        headerWidgetBuilder: (_) {
          return Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: const Row(
              children: [
                Icon(Icons.credit_card, size: 18, color: AppColors.primary),
                SizedBox(width: 8),
                Text(
                  'Lịch sử hóa đơn thanh toán',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.darkSlate,
                  ),
                ),
              ],
            ),
          );
        },
        itemBuilder: (p) {
          // Status badge colors matching Web exactly
          Color statusBgColor = const Color(0xFFDBD468);
          Color statusTextColor = const Color(0xFF1E293B);
          Color statusBorderColor = const Color(0xFFDBD468).withValues(alpha: 0.2);

          if (p.status == 'Đã đóng đúng hạn' || p.status == 'Đã đóng trễ hạn') {
            statusBgColor = const Color(0xFF89B449);
            statusTextColor = Colors.white;
            statusBorderColor = const Color(0xFF89B449).withValues(alpha: 0.2);
          } else if (p.status == 'Vi phạm') {
            statusBgColor = const Color(0xFFE68A8C);
            statusTextColor = Colors.white;
            statusBorderColor = const Color(0xFFE68A8C).withValues(alpha: 0.2);
          } else if (p.status == 'Đã hoàn phí') {
            statusBgColor = const Color(0xFFF1F5F9);
            statusTextColor = const Color(0xFF64748B);
            statusBorderColor = const Color(0xFFE2E8F0);
          }

          return InkWell(
            onTap: () => _showPaymentDetailModal(p),
            borderRadius: BorderRadius.circular(16),
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE7E0C4)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Row 1: Company name + Amount
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          p.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: AppColors.darkSlate,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${_formatCurrency(p.amount)} VNĐ',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Row 2: Code tag with copy
                  GestureDetector(
                    onTap: () async {
                      await Clipboard.setData(ClipboardData(text: p.code));
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Đã sao chép nội dung chuyển khoản: ${p.code}')),
                        );
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE7E0C4).withValues(alpha: 0.4),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFE7E0C4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Flexible(
                            child: Text(
                              p.code,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF334155),
                                letterSpacing: 0.5,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.copy, size: 14, color: Color(0xFF64748B)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Row 3: Deadline + Status badge
                  Row(
                    children: [
                      Icon(Icons.calendar_today, size: 13, color: Colors.grey.shade500),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          'Hạn đóng: ${p.dueDate}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusBgColor,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: statusBorderColor),
                        ),
                        child: Text(
                          p.status,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: statusTextColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: Color(0xFFF1F5F9), height: 18),

                  // Row 4: View Detail Action Button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      InkWell(
                        onTap: () => _showPaymentDetailModal(p),
                        borderRadius: BorderRadius.circular(6),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.visibility_outlined, size: 15, color: AppColors.primary),
                              SizedBox(width: 4),
                              Text(
                                'Xem chi tiết',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
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
    );
  }

  void _showPaymentDetailModal(Payment p) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.9,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: const BoxDecoration(
                  color: Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Chi tiết hóa đơn lệ phí',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: AppColors.darkSlate,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(ctx),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),

              // Body
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Section 1: Thông tin chuyến kiến tập
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE7E0C4)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'THÔNG TIN CHUYẾN KIẾN TẬP',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF64748B),
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Doanh nghiệp',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              p.name,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Ngày tham quan',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        p.tripDate ?? '--',
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                                      ),
                                    ],
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Hình thức',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        p.tripType ?? 'Trực tiếp',
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Section 2: Tình trạng lệ phí
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE7E0C4)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'TÌNH TRẠNG LỆ PHÍ',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF64748B),
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Trạng thái',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: p.status.contains('Đã đóng')
                                        ? const Color(0xFFDCFCE7)
                                        : p.status == 'Vi phạm'
                                            ? const Color(0xFFFEE2E2)
                                            : const Color(0xFFFEF9C3),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                      color: p.status.contains('Đã đóng')
                                          ? const Color(0xFF86EFAC)
                                          : p.status == 'Vi phạm'
                                              ? const Color(0xFFFCA5A5)
                                              : const Color(0xFFDBD468),
                                    ),
                                  ),
                                  child: Text(
                                    p.status,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: p.status.contains('Đã đóng')
                                          ? const Color(0xFF166534)
                                          : p.status == 'Vi phạm'
                                              ? const Color(0xFF991B1B)
                                              : const Color(0xFF854D0E),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Hạn thu phí',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        p.dueDate,
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFFE68A8C)),
                                      ),
                                    ],
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Ngày nộp thực tế',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        p.paidDate ?? '--',
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const Divider(color: Color(0xFFE2E8F0), height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Tổng tiền cần đóng',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                                ),
                                Text(
                                  '${_formatCurrency(p.amount)} VNĐ',
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Section 3: Thông tin chuyển khoản / VietQR
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.credit_card, size: 16, color: AppColors.primary),
                                SizedBox(width: 6),
                                Text(
                                  'THÔNG TIN THANH TOÁN',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            if (p.status == 'Chưa đóng' || p.rawStatus == 'ChuaDong') ...[
                              if (_paymentConfig != null &&
                                  _paymentConfig!['ma_ngan_hang'] != null &&
                                  _paymentConfig!['so_tai_khoan'] != null) ...[
                                Center(
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.05),
                                          blurRadius: 8,
                                          offset: const Offset(0, 3),
                                        ),
                                      ],
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: Image.network(
                                        'https://img.vietqr.io/image/${_paymentConfig!['ma_ngan_hang']}-${_paymentConfig!['so_tai_khoan']}-compact.png?amount=${p.amount.toInt()}&addInfo=${Uri.encodeComponent(p.code)}&accountName=${Uri.encodeComponent(_paymentConfig!['ten_chu_tai_khoan'] ?? '')}',
                                        width: 190,
                                        height: 190,
                                        fit: BoxFit.contain,
                                        errorBuilder: (context, error, stackTrace) => const SizedBox(
                                          width: 190,
                                          height: 190,
                                          child: Center(child: Text('Không thể tải mã VietQR', style: TextStyle(fontSize: 12))),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                const Text(
                                  'Mở app Ngân hàng của bạn để quét mã QR bên trên, hoặc sao chép thông tin bên dưới.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Color(0xFF64748B)),
                                ),
                                const SizedBox(height: 16),
                                Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      _buildInfoRow('Ngân hàng thụ hưởng', _paymentConfig!['ten_ngan_hang'] ?? ''),
                                      const SizedBox(height: 10),
                                      _buildInfoRow('Chủ tài khoản', _paymentConfig!['ten_chu_tai_khoan'] ?? ''),
                                      const SizedBox(height: 10),
                                      _buildCopyRow('Số tài khoản', _paymentConfig!['so_tai_khoan'] ?? '', isGreen: true),
                                      const Divider(color: Color(0xFFE2E8F0), height: 20),
                                      _buildCopyRow('Nội dung chuyển khoản BẮT BUỘC', p.code, isBoldRed: true),
                                    ],
                                  ),
                                ),
                              ] else ...[
                                const Center(
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(vertical: 20),
                                    child: Text(
                                      'Câu lạc bộ chưa thiết lập cấu hình tài khoản thụ hưởng cho đợt này. Vui lòng quay lại kiểm tra sau.',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                                    ),
                                  ),
                                ),
                              ],
                            ] else if (p.status.contains('Đã đóng')) ...[
                              const Center(
                                child: Padding(
                                  padding: EdgeInsets.symmetric(vertical: 20),
                                  child: Column(
                                    children: [
                                      Icon(Icons.check_circle_outline, size: 48, color: AppColors.primary),
                                      SizedBox(height: 10),
                                      Text(
                                        'Đã hoàn tất thanh toán',
                                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        'Cảm ơn bạn đã nộp lệ phí đúng hạn.',
                                        style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ] else if (p.status == 'Vi phạm') ...[
                              const Center(
                                child: Padding(
                                  padding: EdgeInsets.symmetric(vertical: 20),
                                  child: Column(
                                    children: [
                                      Icon(Icons.error_outline, size: 48, color: Color(0xFFDC2626)),
                                      SizedBox(height: 10),
                                      Text(
                                        'Hóa đơn vi phạm hạn nộp',
                                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFFDC2626)),
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        'Bạn đã quá hạn nộp lệ phí. Nếu có sai sót, vui lòng liên hệ Câu lạc bộ.',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ] else ...[
                              Center(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 20),
                                  child: Text(
                                    'Hóa đơn trạng thái: ${p.status}',
                                    style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Footer
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: const BoxDecoration(
                  color: Color(0xFFF8FAFC),
                  border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE2E8F0),
                      foregroundColor: const Color(0xFF334155),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: const Text('Đóng', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.darkSlate),
        ),
      ],
    );
  }

  Widget _buildCopyRow(String label, String value, {bool isGreen = false, bool isBoldRed = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: isBoldRed ? const Color(0xFFDC2626) : const Color(0xFF94A3B8),
          ),
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            Expanded(
              child: Text(
                value,
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: isBoldRed ? 12 : 14,
                  fontWeight: FontWeight.bold,
                  color: isGreen ? AppColors.primary : isBoldRed ? const Color(0xFFDC2626) : AppColors.darkSlate,
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.copy, size: 16, color: Color(0xFF64748B)),
              onPressed: () async {
                await Clipboard.setData(ClipboardData(text: value));
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Đã sao chép: $value')),
                  );
                }
              },
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRefundsTab(AppState appState, AppStateProviderState appStateProvider) {
    final violatedPayments = appState.payments.where((p) => p.status == 'Vi phạm').toList();

    return RefreshIndicator(
      onRefresh: () async {
        if (ApiService.userId != null) {
          await appStateProvider.fetchStudentDataFromApi(ApiService.userId!);
        }
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Tạo đơn hoàn phí', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.primary)),
              const SizedBox(height: 12),
              
              SearchableDropdown(
                title: 'Hóa đơn liên quan',
                value: _refundSelectedInvoice != null
                    ? (violatedPayments.where((p) => p.id == _refundSelectedInvoice).firstOrNull?.name ?? 'Chọn hóa đơn liên quan')
                    : 'Chọn hóa đơn liên quan',
                options: violatedPayments.map((p) => p.name).toList(),
                onChanged: (val) {
                  final p = violatedPayments.where((p) => p.name == val).firstOrNull;
                  if (p != null) {
                    setState(() {
                      _refundSelectedInvoice = p.id;
                    });
                  }
                },
              ),
              const SizedBox(height: 12),

              GestureDetector(
                onTap: () async {
                  if (_isUploadingRefund) return;
                  try {
                    final pickerResult = await FilePicker.pickFiles(
                      type: FileType.custom,
                      allowedExtensions: ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'],
                    );
                    if (pickerResult != null && pickerResult.files.single.path != null) {
                      final file = pickerResult.files.single;
                      setState(() {
                        _refundUploadedFile = file.name;
                        _refundLocalFilePath = file.path;
                      });
                    }
                  } catch (e) {
                    if (!mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Lỗi chọn file: $e'), backgroundColor: AppColors.danger),
                    );
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE7E0C4), width: 1.5),
                  ),
                  child: Row(
                    children: [
                      _isUploadingRefund
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                            )
                          : const Icon(Icons.attach_file, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _refundUploadedFile ?? 'File đơn đã được BCN khoa duyệt',
                          style: TextStyle(fontSize: 12, color: _refundUploadedFile != null ? AppColors.secondary : Colors.grey.shade600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: () async {
                    final uri = Uri.parse('${ApiService.baseUrl}/upload/file/templates/mau_don_xin_hoan_phi.docx');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                  icon: const Icon(Icons.download, size: 14, color: AppColors.primary),
                  label: const Text('Tải mẫu đơn hoàn phí (.docx)', style: TextStyle(fontSize: 11, color: AppColors.primary)),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              ElevatedButton(
                onPressed: _refundSelectedInvoice != null && _refundUploadedFile != null && !_isUploadingRefund
                    ? () async {
                        final pay = appState.payments.where((p) => p.id == _refundSelectedInvoice).firstOrNull;
                        if (pay == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Không tìm thấy thông tin hóa đơn đã chọn.')),
                          );
                          return;
                        }
                        
                        final accountNumberController = TextEditingController();
                        final accountNameController = TextEditingController();
                        final reasonController = TextEditingController();
                        final formKey = GlobalKey<FormState>();
                        String? selectedBank;
                        final List<String> banks = ['Vietcombank', 'Techcombank', 'MB Bank', 'Agribank', 'VietinBank', 'BIDV', 'ACB', 'TPBank', 'VPBank', 'Khác'];

                        final result = await showDialog<bool>(
                          context: context,
                          builder: (context) {
                            return StatefulBuilder(
                              builder: (context, setStateDialog) {
                                return AlertDialog(
                                  title: const Text('Nhập thông tin hoàn phí', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary)),
                                  content: SingleChildScrollView(
                                    child: Form(
                                      key: formKey,
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          SearchableDropdown(
                                            title: 'Ngân hàng',
                                            value: selectedBank ?? 'Chọn ngân hàng',
                                            options: banks,
                                            onChanged: (val) {
                                              setStateDialog(() {
                                                selectedBank = val;
                                              });
                                            },
                                          ),
                                          const SizedBox(height: 12),
                                          TextFormField(
                                            controller: accountNumberController,
                                            decoration: const InputDecoration(labelText: 'Số tài khoản', border: OutlineInputBorder(), isDense: true),
                                            validator: (v) => v == null || v.isEmpty ? 'Vui lòng nhập' : null,
                                            keyboardType: TextInputType.number,
                                          ),
                                          const SizedBox(height: 12),
                                          TextFormField(
                                            controller: accountNameController,
                                            decoration: const InputDecoration(labelText: 'Tên người thụ hưởng', border: OutlineInputBorder(), isDense: true),
                                            validator: (v) => v == null || v.isEmpty ? 'Vui lòng nhập' : null,
                                          ),
                                          const SizedBox(height: 12),
                                          TextFormField(
                                            controller: reasonController,
                                            decoration: const InputDecoration(labelText: 'Lý do / Lời nhắn', border: OutlineInputBorder(), isDense: true),
                                            maxLines: 2,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(context, false),
                                      child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
                                    ),
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                                      onPressed: () {
                                        if (selectedBank == null) {
                                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Vui lòng chọn ngân hàng')));
                                          return;
                                        }
                                        if (formKey.currentState?.validate() ?? false) {
                                          Navigator.pop(context, true);
                                        }
                                      },
                                      child: const Text('Xác nhận gửi'),
                                    ),
                                  ],
                                );
                              }
                            );
                          }
                        );

                        if (result != true) return;
                        
                        setState(() {
                          _isUploadingRefund = true;
                        });
                        try {
                          final success = await appStateProvider.addRefund(
                            pay.id,
                            'HĐ: ${pay.name.replaceAll('Chuyến: ', '')}',
                            '50.000đ',
                            localPath: _refundLocalFilePath,
                            fileName: _refundUploadedFile,
                            bankName: selectedBank,
                            accountNumber: accountNumberController.text,
                            accountName: accountNameController.text,
                            reason: reasonController.text,
                          );
                          if (mounted) {
                            setState(() {
                              _isUploadingRefund = false;
                              if (success) {
                                _refundSelectedInvoice = null;
                                _refundUploadedFile = null;
                                _refundLocalFilePath = null;
                              }
                            });
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(success ? 'Nộp đơn hoàn phí thành công!' : 'Nộp đơn hoàn phí thất bại.'),
                                backgroundColor: success ? AppColors.secondary : AppColors.danger,
                              ),
                            );
                          }
                        } catch (e) {
                          if (mounted) {
                            setState(() {
                              _isUploadingRefund = false;
                            });
                            String errorMsg = e.toString();
                            if (errorMsg.startsWith('Exception: ')) {
                              errorMsg = errorMsg.substring(11);
                            }
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(errorMsg),
                                backgroundColor: AppColors.danger,
                              ),
                            );
                          }
                        }
                      }
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('GỬI ĐƠN XIN HOÀN PHÍ', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        const Text('Đơn yêu cầu đã nộp', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.darkSlate)),
        const SizedBox(height: 8),

        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: appState.refunds.length,
          itemBuilder: (context, index) {
            final ref = appState.refunds[index];
            Color statusColor = AppColors.warning;
            if (ref.status == 'Đã hoàn tiền') statusColor = AppColors.secondary;
            if (ref.status == 'Từ chối') statusColor = AppColors.danger;

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                title: Text(ref.invoiceName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                subtitle: Text('Ngày nộp: ${ref.dateText} • Số tiền: ${ref.amountText}', style: const TextStyle(fontSize: 11)),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                  child: Text(
                    ref.status,
                    style: TextStyle(
                      fontSize: 10, 
                      fontWeight: FontWeight.bold, 
                      color: statusColor == AppColors.warning ? AppColors.darkSlate : statusColor,
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ],
    )));
  }
}
