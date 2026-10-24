import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/state/app_state.dart';
import 'package:mobile/presentation/screens/login_screen.dart';

void main() {
  Widget createTestWidget() {
    return const AppStateContainer(
      child: MaterialApp(
        home: LoginScreen(),
      ),
    );
  }

  group('Kiểm thử giao diện Đăng nhập (LoginScreen Widget Tests)', () {
    testWidgets('Hiển thị đầy đủ form đăng nhập, trường tài khoản và mật khẩu', (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Kiểm tra có các TextFields
      expect(find.byType(TextFormField), findsNWidgets(2));
      expect(find.text('Tài khoản / Mã số (MSSV hoặc MSGV)'), findsOneWidget);
      expect(find.text('Mật khẩu'), findsOneWidget);

      // Kiểm tra nút Đăng nhập
      expect(find.text('ĐĂNG NHẬP'), findsOneWidget);
    });

    testWidgets('Validate báo lỗi khi để trống tài khoản hoặc mật khẩu', (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Nhấn nút Đăng nhập khi form rỗng
      await tester.tap(find.text('ĐĂNG NHẬP'));
      await tester.pumpAndSettle();

      // Xác nhận hiển thị thông báo lỗi validation
      expect(find.text('Vui lòng nhập tài khoản'), findsOneWidget);
      expect(find.text('Vui lòng nhập mật khẩu'), findsOneWidget);
    });

    testWidgets('Kiểm tra nhập liệu vào trường tài khoản và mật khẩu', (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Nhập tài khoản và mật khẩu
      await tester.enterText(find.byType(TextFormField).first, '2005190573');
      await tester.enterText(find.byType(TextFormField).last, 'password123');
      await tester.pumpAndSettle();

      // Xác nhận form đã được điền
      expect(find.text('2005190573'), findsOneWidget);
      expect(find.text('password123'), findsOneWidget);
    });
  });
}
