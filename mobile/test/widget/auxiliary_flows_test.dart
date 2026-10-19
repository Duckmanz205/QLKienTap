import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/state/app_state.dart';
import 'package:mobile/presentation/screens/student/thongbao_sv.dart';
import 'package:mobile/presentation/screens/student/taichinh_sv.dart';
import 'package:mobile/presentation/screens/change_password_screen.dart';

void main() {
  group('Kiểm thử giao diện các luồng phụ và bổ trợ (Auxiliary Flows Widget Tests)', () {
    testWidgets('ThongBaoSVScreen hiển thị ô tìm kiếm thông báo và danh sách', (tester) async {
      tester.view.physicalSize = const Size(1080, 2280);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const AppStateContainer(
          child: MaterialApp(
            home: Scaffold(
              body: ThongBaoSVScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Tìm kiếm thông báo...'), findsOneWidget);
    });

    testWidgets('TaiChinhSVScreen hiển thị tab Thanh toán và tab Hoàn phí', (tester) async {
      tester.view.physicalSize = const Size(1080, 2280);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const AppStateContainer(
          child: MaterialApp(
            home: Scaffold(
              body: TaiChinhSVScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Thanh toán'), findsOneWidget);
      expect(find.text('Hoàn phí'), findsOneWidget);
    });

    testWidgets('ChangePasswordScreen hiển thị form đổi mật khẩu và các quy tắc mật khẩu', (tester) async {
      tester.view.physicalSize = const Size(1080, 2280);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const AppStateContainer(
          child: MaterialApp(
            home: Scaffold(
              body: ChangePasswordScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Tối thiểu 8 ký tự'), findsOneWidget);
      expect(find.textContaining('Ít nhất 1 chữ hoa (A-Z)'), findsOneWidget);
      expect(find.textContaining('Ít nhất 1 chữ thường (a-z)'), findsOneWidget);
      expect(find.textContaining('Ít nhất 1 chữ số (0-9)'), findsOneWidget);
    });
  });
}
