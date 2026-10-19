import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/state/app_state.dart';
import 'package:mobile/presentation/screens/lecturer/diemdanhsv_gv.dart';
import 'package:mobile/presentation/screens/lecturer/diemchuanbi_gv.dart';

void main() {
  group('Kiểm thử giao diện các luồng Giảng viên (Lecturer Flows Widget Tests)', () {
    testWidgets('DiemDanhSVGVScreen hiển thị nút Tất cả có mặt và danh sách sinh viên', (tester) async {
      tester.view.physicalSize = const Size(1080, 2280);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const AppStateContainer(
          child: MaterialApp(
            home: Scaffold(
              body: DiemDanhSVGVScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Tất cả có mặt'), findsOneWidget);
    });

    testWidgets('DiemChuanBiGVScreen hiển thị thông tin quy chuẩn điểm chuẩn bị 30%', (tester) async {
      tester.view.physicalSize = const Size(1080, 2280);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const AppStateContainer(
          child: MaterialApp(
            home: Scaffold(
              body: DiemChuanBiGVScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Điểm chuẩn bị (tối đa 10) chiếm 30% điểm chuyến đi'), findsOneWidget);
    });
  });
}
