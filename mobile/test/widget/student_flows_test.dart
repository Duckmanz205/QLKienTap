import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/state/app_state.dart';
import 'package:mobile/presentation/screens/student/chuyenthamquan_sv.dart';
import 'package:mobile/presentation/screens/student/nopbaithuhoach_sv.dart';
import 'package:mobile/presentation/screens/student/ketqua_diem_sv.dart';

void main() {
  group('Kiểm thử giao diện các luồng Sinh viên (Student Flows Widget Tests)', () {
    testWidgets('ChuyenThamQuanSVScreen hiển thị ô tìm kiếm và danh sách chuyến đi', (tester) async {
      tester.view.physicalSize = const Size(1080, 2280);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        AppStateContainer(
          child: MaterialApp(
            home: Scaffold(
              body: ChuyenThamQuanSVScreen(
                activeTab: 'danh-sach',
                onTripTap: (_) {},
                onTabChanged: (_) {},
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(TextField), findsWidgets);
      expect(find.textContaining('Tìm kiếm'), findsWidgets);
    });

    testWidgets('NopBaiThuHoachSVScreen hiển thị khu vực chọn bộ 3 chuyến tham quan báo cáo', (tester) async {
      tester.view.physicalSize = const Size(1080, 2280);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const AppStateContainer(
          child: MaterialApp(
            home: Scaffold(
              body: NopBaiThuHoachSVScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Bộ 3 chuyến tham quan báo cáo'), findsOneWidget);
    });

    testWidgets('KetQuaDiemSVScreen hiển thị thẻ điểm tổng kết và công thức tính điểm 30-30-40', (tester) async {
      tester.view.physicalSize = const Size(1080, 2280);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const AppStateContainer(
          child: MaterialApp(
            home: Scaffold(
              body: KetQuaDiemSVScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Công thức tính điểm: (Chuẩn bị × 0.3) + (Báo cáo × 0.3) + (Hội đồng × 0.4) + Điểm cộng'), findsOneWidget);
    });
  });
}
