import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class PaginationFooter extends StatelessWidget {
  final int currentPage;
  final int totalPages;
  final int limit;
  final int totalItems;
  final String itemName;
  final Function(int) onPageChanged;
  final Function(int) onLimitChanged;

  const PaginationFooter({
    super.key,
    required this.currentPage,
    required this.totalPages,
    required this.limit,
    required this.totalItems,
    this.itemName = 'dữ liệu',
    required this.onPageChanged,
    required this.onLimitChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        border: Border(
          top: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Hiển thị',
                style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
              ),
              const SizedBox(width: 8),
              Container(
                height: 32,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.white,
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: limit,
                    icon: const Icon(Icons.arrow_drop_down, size: 20),
                    style: const TextStyle(color: AppColors.darkSlate, fontSize: 13, fontWeight: FontWeight.bold),
                    onChanged: (val) {
                      if (val != null) onLimitChanged(val);
                    },
                    items: [15, 30, 50, 100].map((e) {
                      return DropdownMenuItem(value: e, child: Text('$e'));
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '/ $totalItems $itemName',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildButton('Trang đầu', currentPage > 1 ? () => onPageChanged(1) : null),
                const SizedBox(width: 6),
                _buildButton('Trước', currentPage > 1 ? () => onPageChanged(currentPage - 1) : null),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Trang $currentPage / ${totalPages > 0 ? totalPages : 1}',
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 6),
                _buildButton('Sau', currentPage < totalPages ? () => onPageChanged(currentPage + 1) : null),
                const SizedBox(width: 6),
                _buildButton('Trang cuối', currentPage < totalPages ? () => onPageChanged(totalPages) : null),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildButton(String text, VoidCallback? onPressed) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: onPressed == null ? Colors.grey.shade200 : Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
          color: Colors.white,
        ),
        child: Text(
          text,
          style: TextStyle(
            color: onPressed == null ? Colors.grey.shade400 : Colors.grey.shade700,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
