import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/state/app_state.dart';

class TaiChinhSVScreen extends StatefulWidget {
  const TaiChinhSVScreen({super.key});

  @override
  State<TaiChinhSVScreen> createState() => _TaiChinhSVScreenState();
}

class _TaiChinhSVScreenState extends State<TaiChinhSVScreen> {
  String _financeTab = 'payment'; // 'payment' or 'refund'
  String? _refundSelectedInvoice;
  String? _refundUploadedFile;

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
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _financeTab == 'payment'
                ? _buildPaymentsTab(appState, appStateProvider)
                : _buildRefundsTab(appState, appStateProvider),
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentsTab(AppState appState, AppStateProviderState appStateProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: appState.payments.map((p) {
        Color statusColor = AppColors.warning;
        if (p.status == 'Đã đóng đúng hạn') statusColor = AppColors.secondary;
        if (p.status == 'Vi phạm') statusColor = AppColors.danger;
        if (p.status == 'Đã hoàn phí') statusColor = Colors.grey;

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        p.status,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: statusColor == AppColors.warning ? AppColors.darkSlate : statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Số tiền:', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                    Text(
                      '${p.amount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}đ',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Nội dung chuyển khoản:', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    GestureDetector(
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Đã sao chép nội dung chuyển khoản!')),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                        color: const Color(0xFFE7E0C4),
                        child: Row(
                          children: [
                            Text(p.code, style: const TextStyle(fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.bold)),
                            const SizedBox(width: 4),
                            const Icon(Icons.copy, size: 12, color: AppColors.primary),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Hạn đóng: ${p.dueDate}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                ),
                if (p.status == 'Chưa đóng' || p.status == 'Vi phạm') ...[
                  const Divider(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      appStateProvider.payFee(p.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Đã giả lập đóng phí cho ${p.name}')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('GIẢ LẬP ĐÓNG PHÍ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRefundsTab(AppState appState, AppStateProviderState appStateProvider) {
    final violatedPayments = appState.payments.where((p) => p.status == 'Vi phạm' || p.status == 'Đã đóng đúng hạn').toList();

    return Column(
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
                onTap: () {
                  setState(() {
                    _refundUploadedFile = 'DonHoanPhi_DaDuyet.pdf';
                  });
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
                      const Icon(Icons.attach_file, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Text(
                        _refundUploadedFile ?? 'File đơn đã được BCN khoa duyệt',
                        style: TextStyle(fontSize: 12, color: _refundUploadedFile != null ? AppColors.secondary : Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              ElevatedButton(
                onPressed: _refundSelectedInvoice != null && _refundUploadedFile != null
                    ? () {
                        final pay = appState.payments.firstWhere((p) => p.id == _refundSelectedInvoice);
                        appStateProvider.addRefund('HĐ: ${pay.name.replaceAll('Chuyến: ', '')}', '50.000đ');
                        setState(() {
                          _refundSelectedInvoice = null;
                          _refundUploadedFile = null;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Nộp đơn hoàn phí thành công!')),
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
    );
  }
}
