import 'package:flutter/material.dart';
import 'pagination_footer.dart';
import 'searchable_dropdown.dart';

class PaginatedList<T> extends StatefulWidget {
  final List<T> items;
  final String searchHint;
  final String dropdownTitle;
  final List<String> dropdownOptions;
  final String? initialDropdownValue;
  final bool Function(T item, String searchQuery, String dropdownValue) filter;
  final Widget Function(T item) itemBuilder;
  final String itemName;
  final Widget? emptyWidget;
  final Widget? Function(List<T> filteredItems)? headerWidgetBuilder;
  final Widget? footerWidget;
  final bool verticalFilters;

  const PaginatedList({
    super.key,
    required this.items,
    this.searchHint = 'Tìm kiếm...',
    required this.dropdownTitle,
    required this.dropdownOptions,
    this.initialDropdownValue,
    required this.filter,
    required this.itemBuilder,
    this.itemName = 'dữ liệu',
    this.emptyWidget,
    this.headerWidgetBuilder,
    this.footerWidget,
    this.verticalFilters = false,
  });

  @override
  State<PaginatedList<T>> createState() => _PaginatedListState<T>();
}

class _PaginatedListState<T> extends State<PaginatedList<T>> {
  String _searchQuery = '';
  late String _dropdownValue;
  int _currentPage = 1;
  int _limit = 15;

  @override
  void initState() {
    super.initState();
    _dropdownValue = widget.initialDropdownValue ?? widget.dropdownOptions.first;
  }

  @override
  Widget build(BuildContext context) {
    // 1. Filter
    final filtered = widget.items.where((item) => widget.filter(item, _searchQuery, _dropdownValue)).toList();
    
    // 2. Paginate
    final totalPages = (filtered.length / _limit).ceil();
    if (_currentPage > totalPages && totalPages > 0) {
      _currentPage = totalPages;
    } else if (_currentPage < 1) {
      _currentPage = 1;
    }

    final startIndex = (_currentPage - 1) * _limit;
    int endIndex = startIndex + _limit;
    if (endIndex > filtered.length) endIndex = filtered.length;
    
    final paginatedItems = (startIndex < filtered.length) 
        ? filtered.sublist(startIndex, endIndex) 
        : <T>[];

    return CustomScrollView(
      slivers: [
        if (widget.headerWidgetBuilder != null)
          SliverToBoxAdapter(child: widget.headerWidgetBuilder!(filtered)),
        // Search & Dropdown Row/Column
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: widget.verticalFilters 
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(widget.dropdownTitle, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black54)),
                    const SizedBox(height: 8),
                    SearchableDropdown(
                      title: widget.dropdownTitle,
                      value: _dropdownValue,
                      options: widget.dropdownOptions,
                      onChanged: (val) {
                        setState(() {
                          _dropdownValue = val;
                          _currentPage = 1;
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      onChanged: (val) {
                        setState(() {
                          _searchQuery = val;
                          _currentPage = 1;
                        });
                      },
                      decoration: InputDecoration(
                        hintText: widget.searchHint,
                        prefixIcon: const Icon(Icons.search, size: 20),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(color: Colors.grey.shade300),
                        ),
                        filled: true,
                        fillColor: Colors.white,
                      ),
                    ),
                  ],
                )
              : Row(
                  children: [
                    Expanded(
                      child: TextField(
                        onChanged: (val) {
                          setState(() {
                            _searchQuery = val;
                            _currentPage = 1;
                          });
                        },
                        decoration: InputDecoration(
                          hintText: widget.searchHint,
                          prefixIcon: const Icon(Icons.search, size: 20),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: Colors.grey.shade300),
                          ),
                          filled: true,
                          fillColor: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    SearchableDropdown(
                      title: widget.dropdownTitle,
                      value: _dropdownValue,
                      options: widget.dropdownOptions,
                      onChanged: (val) {
                        setState(() {
                          _dropdownValue = val;
                          _currentPage = 1;
                        });
                      },
                    ),
                  ],
                ),
          ),
        ),
        
        // List
        if (paginatedItems.isEmpty)
          SliverFillRemaining(
            hasScrollBody: false,
            child: widget.emptyWidget ?? const Center(child: Text('Không có dữ liệu')),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  return widget.itemBuilder(paginatedItems[index]);
                },
                childCount: paginatedItems.length,
              ),
            ),
          ),
        
        // Footer
        SliverToBoxAdapter(
          child: PaginationFooter(
            currentPage: _currentPage,
            totalPages: totalPages,
            limit: _limit,
            totalItems: filtered.length,
            itemName: widget.itemName,
            onPageChanged: (page) => setState(() => _currentPage = page),
            onLimitChanged: (limit) => setState(() {
              _limit = limit;
              _currentPage = 1;
            }),
          ),
        ),
        
        if (widget.footerWidget != null)
          SliverToBoxAdapter(child: widget.footerWidget!),
      ],
    );
  }
}
