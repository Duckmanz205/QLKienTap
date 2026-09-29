import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/network/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';
import '../../widgets/paginated_list.dart';

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

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    return Column(
      children: [
        // Tab switcher
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _financeTab = 'payment'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _financeTab == 'payment' ? AppColors.primary : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Thanh toán',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: _financeTab == 'payment' ? Colors.white : AppColors.darkSlate,
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _financeTab = 'refund'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _financeTab == 'refund' ? AppColors.primary : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Hoàn phí',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: _financeTab == 'refund' ? Colors.white : AppColors.darkSlate,
                      ),
                    ),
                  ),
                ),
              ),
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

  String _formatCurrency(double amount) {
    return '${amount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}đ';
  }

  Widget _buildPaymentsTab(AppState appState, AppStateProviderState appStateProvider) {
    return PaginatedList<dynamic>(
      items: appState.payments,
      searchHint: 'Tìm kiếm hóa đơn...',
      dropdownTitle: 'Trạng thái',
      dropdownOptions: const ['Tất cả trạng thái', 'Đã đóng đúng hạn', 'Chưa đóng', 'Vi phạm', 'Đã hoàn phí'],
      itemName: 'hóa đơn',
      filter: (p, query, status) {
        final matchesQuery = p.name.toLowerCase().contains(query.toLowerCase()) || 
                             p.code.toLowerCase().contains(query.toLowerCase());
        final matchesStatus = status == 'Tất cả trạng thái' || p.status == status;
        return matchesQuery && matchesStatus;
      },
      itemBuilder: (p) {
        // Determine status color & style
        Color statusBgColor;
        Color statusTextColor;
        Color statusBorderColor;
        if (p.status == 'Chưa đóng') {
          statusBgColor = Colors.white;
          statusTextColor = AppColors.primary;
          statusBorderColor = AppColors.primary;
        } else if (p.status == 'Đã đóng đúng hạn') {
          statusBgColor = const Color(0xFFD5C97E).withValues(alpha: 0.25);
          statusTextColor = const Color(0xFF6B6224);
          statusBorderColor = const Color(0xFFD5C97E);
        } else if (p.status == 'Vi phạm') {
          statusBgColor = AppColors.danger.withValues(alpha: 0.12);
          statusTextColor = const Color(0xFFB83232);
          statusBorderColor = AppColors.danger;
        } else {
          statusBgColor = Colors.grey.shade100;
          statusTextColor = Colors.grey.shade600;
          statusBorderColor = Colors.grey.shade400;
        }

        // Determine amount color
        Color amountColor;
        if (p.status == 'Đã đóng đúng hạn') {
          amountColor = AppColors.primary;
        } else if (p.status == 'Vi phạm') {
          amountColor = const Color(0xFFB83232);
        } else {
          amountColor = AppColors.primary;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
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
                    _formatCurrency(p.amount),
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                      color: amountColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Row 2: Code tag with copy
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đã sao chép nội dung chuyển khoản!')),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE7E0C4),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        p.code,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.darkSlate,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(Icons.copy, size: 13, color: AppColors.primary),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Row 3: Deadline + Status badge
              Row(
                children: [
                  Icon(Icons.access_time, size: 14, color: Colors.grey.shade500),
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
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: statusBorderColor, width: 1),
                    ),
                    child: Text(
                      p.status,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: statusTextColor,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRefundsTab(AppState appState, AppStateProviderState appStateProvider) {
    final violatedPayments = appState.payments.where((p) => p.status == 'Vi phạm' || p.status == 'Đã đóng đúng hạn').toList();

    return SingleChildScrollView(
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
              
              DropdownButtonFormField<String>(
                value: _refundSelectedInvoice,
                decoration: InputDecoration(
                  labelText: 'Chọn hóa đơn liên quan',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  isDense: true,
                ),
                items: violatedPayments.map((p) {
                  return DropdownMenuItem<String>(
                    value: p.id,
                    child: Text(p.name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)),
                  );
                }).toList(),
                onChanged: (val) {
                  setState(() {
                    _refundSelectedInvoice = val;
                  });
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
                        setState(() {
                          _isUploadingRefund = true;
                        });
                        final pay = appState.payments.firstWhere((p) => p.id == _refundSelectedInvoice);
                        final success = await appStateProvider.addRefund(
                          'HĐ: ${pay.name.replaceAll('Chuyến: ', '')}',
                          '50.000đ',
                          localPath: _refundLocalFilePath,
                          fileName: _refundUploadedFile,
                        );
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
    ));
  }
}
