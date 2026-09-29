import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/app_models.dart';
import '../../../data/state/app_state.dart';
import '../../widgets/paginated_list.dart';

class DiemChuanBiGVScreen extends StatefulWidget {
  final VoidCallback? onBack;
  const DiemChuanBiGVScreen({super.key, this.onBack});

  @override
  State<DiemChuanBiGVScreen> createState() => _DiemChuanBiGVScreenState();
}

class _DiemChuanBiGVScreenState extends State<DiemChuanBiGVScreen> {
  // Store values per student. Mock data:
  final Map<String, String> _prepGrades = {};
  final Map<String, String> _bonusGrades = {};

  @override
  Widget build(BuildContext context) {
    final appStateProvider = AppStateProvider.of(context);
    final appState = appStateProvider.state;

    final initialTourName = appState.lecturerTours.isNotEmpty ? appState.lecturerTours.first.name : null;
    final dropdownOptions = appState.lecturerTours.map((t) => t.name).toList();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      body: PaginatedList<LecturerStudent>(
        items: appState.lecturerStudents,
        searchHint: 'Tìm theo MSSV/họ tên',
        dropdownTitle: 'Chọn chuyến tham quan',
        dropdownOptions: dropdownOptions.isNotEmpty ? dropdownOptions : ['Không có'],
        initialDropdownValue: initialTourName,
        verticalFilters: true,
        filter: (student, query, tourName) {
          if (appState.lecturerTours.isEmpty) return false;
          final tour = appState.lecturerTours.firstWhere((t) => t.name == tourName, orElse: () => appState.lecturerTours.first);
          final matchTour = student.tourId == tour.id;
          final matchQuery = student.name.toLowerCase().contains(query.toLowerCase()) || 
                             student.id.toLowerCase().contains(query.toLowerCase());
          return matchTour && matchQuery;
        },
        headerWidgetBuilder: (filteredItems) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF2F5ED), // Light green tint
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, color: Color(0xFF3B711A), size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Điểm chuẩn bị lấy từ bài kiểm tra ngoài hệ thống. Chuyến tự do: bài do GVHD tổ chức riêng.',
                      style: TextStyle(color: Color(0xFF4A5568), fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        itemBuilder: (student) {
          final prepVal = _prepGrades[student.id] ?? '0.0';
          final bonusVal = _bonusGrades[student.id] ?? '0.0';
          final hasBonus = bonusVal != '0.0';

          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.grey.shade200),
            ),
            elevation: 0,
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundImage: NetworkImage(student.avatar),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(student.id, style: const TextStyle(fontSize: 11, color: Colors.black54)),
                            Text(student.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF2B4C5F))),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Điểm chuẩn bị', style: TextStyle(fontSize: 11, color: Colors.black54)),
                            const SizedBox(height: 4),
                            Container(
                              height: 36,
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey.shade300),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: TextField(
                                textAlign: TextAlign.center,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  border: InputBorder.none,
                                  hintText: prepVal,
                                  hintStyle: const TextStyle(color: Color(0xFF2B4C5F)),
                                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                                ),
                                style: const TextStyle(color: Color(0xFF2B4C5F), fontSize: 14),
                                onChanged: (val) {
                                  _prepGrades[student.id] = val;
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Điểm cộng', style: TextStyle(fontSize: 11, color: Colors.black54)),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _bonusGrades[student.id] = hasBonus ? '0.0' : '+0.5';
                                      });
                                    },
                                    child: Container(
                                      height: 36,
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        color: hasBonus ? const Color(0xFFBCE77C) : Colors.grey.shade200,
                                        borderRadius: const BorderRadius.horizontal(left: Radius.circular(8)),
                                      ),
                                      child: Text(
                                        '+0.5',
                                        style: TextStyle(
                                          color: hasBonus ? const Color(0xFF3B711A) : Colors.black54,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Container(
                                    height: 36,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: Colors.grey.shade200,
                                      borderRadius: const BorderRadius.horizontal(right: Radius.circular(8)),
                                    ),
                                    child: const Text('0.5 / 1.0', style: TextStyle(color: Colors.black54)),
                                  ),
                                ),
                              ],
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã lưu điểm!'), backgroundColor: AppColors.secondary),
          );
          if (widget.onBack != null) widget.onBack!();
        },
        backgroundColor: const Color(0xFF3B711A),
        icon: const Icon(Icons.save, color: Colors.white, size: 18),
        label: const Text('LƯU ĐIỂM', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
      ),
    );
  }
}
