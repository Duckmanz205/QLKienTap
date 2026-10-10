import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import 'searchable_dropdown.dart';

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
              SearchableDropdown(
                title: 'Hiển thị',
                value: limit.toString(),
                options: const ['15', '30', '50', '100'],
                onChanged: (val) {
                  onLimitChanged(int.parse(val));
                },
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
