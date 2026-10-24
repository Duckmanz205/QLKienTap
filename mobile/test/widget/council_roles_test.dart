import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/models/app_models.dart';
import 'package:mobile/data/state/app_state.dart';
import 'package:mobile/presentation/screens/lecturer/hoidongchambaocao_dsbuoi_gv.dart';

void main() {
  group('Kiểm thử Phân quyền 3 Roles Hội đồng Báo cáo (Council Roles Widget Tests)', () {
    CouncilBoardItem createMockBoard({
      required String role,
      bool isStudentLocked = false,
      bool isBoardLocked = false,
    }) {
      return CouncilBoardItem(
        sessionId: 101,
        memberId: 1,
        sessionName: 'Phiên Bảo vệ Hội đồng Công nghệ',
        room: 'A.101',
        date: '24/10/2026',
        timeRange: '08:00 - 11:30',
        role: role,
        status: 'ongoing',
        isBoardLocked: isBoardLocked,
        students: [
          CouncilStudentItem(
            studentId: 201,
            mssv: '20012001',
            hoTen: 'Nguyễn Văn Test',
            className: '12DHTH01',
            boChuyenId: 301,
            isGradeLocked: isStudentLocked,
            councilNote: 'Đạt yêu cầu',
            trips: [
              CouncilStudentTripItem(
                phieuId: 501,
                tenNhaMay: 'Nhà máy Acecook',
                hinhThuc: 'TrucTiep',
                myScore: 8.5,
              ),
            ],
          ),
        ],
      );
    }

    testWidgets('1. Vai trò ChuTich: Hiển thị Khóa sổ Hội đồng, CHỐT ĐIỂM, Tiến độ chấm và sửa Ghi chú', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final board = createMockBoard(role: 'ChuTich');

      await tester.pumpWidget(
        AppStateContainer(
          child: MaterialApp(
            home: HoiDongGradingQueueScreen(
              board: board,
              onBack: () {},
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Kiểm tra Badge Chủ tịch Hội đồng
      expect(find.text('Chủ tịch Hội đồng'), findsOneWidget);

      // Nút Khóa sổ Hội đồng trên AppBar
      expect(find.text('Khóa sổ Hội đồng'), findsOneWidget);

      // Nút Tiến độ chấm
      expect(find.text('Tiến độ chấm'), findsOneWidget);

      // Nút CHỐT ĐIỂM cho sinh viên
      expect(find.text('CHỐT ĐIỂM'), findsOneWidget);

      // Nút Lưu ghi chú
      expect(find.text('Lưu ghi chú'), findsOneWidget);
    });

    testWidgets('2. Vai trò ThuKy: Ẩn Khóa sổ, Ẩn CHỐT ĐIỂM, nhưng CÓ Tiến độ chấm và sửa Ghi chú', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final board = createMockBoard(role: 'ThuKy');

      await tester.pumpWidget(
        AppStateContainer(
          child: MaterialApp(
            home: HoiDongGradingQueueScreen(
              board: board,
              onBack: () {},
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Kiểm tra Badge Thư ký Hội đồng
      expect(find.text('Thư ký Hội đồng'), findsOneWidget);

      // Tuyệt đối KHÔNG có nút Khóa sổ Hội đồng
      expect(find.text('Khóa sổ Hội đồng'), findsNothing);

      // Tuyệt đối KHÔNG có nút CHỐT ĐIỂM
      expect(find.text('CHỐT ĐIỂM'), findsNothing);

      // Thư ký CÓ nút Tiến độ chấm
      expect(find.text('Tiến độ chấm'), findsOneWidget);

      // Thư ký CÓ quyền Lưu ghi chú
      expect(find.text('Lưu ghi chú'), findsOneWidget);
    });

    testWidgets('3. Vai trò ThanhVien: Ẩn Khóa sổ, Ẩn CHỐT ĐIỂM, Ẩn Tiến độ chấm, Ghi chú chỉ xem', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final board = createMockBoard(role: 'ThanhVien');

      await tester.pumpWidget(
        AppStateContainer(
          child: MaterialApp(
            home: HoiDongGradingQueueScreen(
              board: board,
              onBack: () {},
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Kiểm tra Badge Thành viên Hội đồng
      expect(find.text('Thành viên Hội đồng'), findsOneWidget);

      // Tuyệt đối KHÔNG có nút Khóa sổ Hội đồng
      expect(find.text('Khóa sổ Hội đồng'), findsNothing);

      // Tuyệt đối KHÔNG có nút CHỐT ĐIỂM
      expect(find.text('CHỐT ĐIỂM'), findsNothing);

      // Thành viên KHÔNG có nút Tiến độ chấm
      expect(find.text('Tiến độ chấm'), findsNothing);

      // Thành viên KHÔNG có nút Lưu ghi chú (chỉ xem)
      expect(find.text('Lưu ghi chú'), findsNothing);
    });

    testWidgets('4. Sinh viên đã chốt điểm: Nút CHỐT ĐIỂM biến mất, hiển thị Đã chốt điểm và ĐÃ KHÓA', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      // Giảng viên là ChuTich nhưng sinh viên này đã bị khóa
      final board = createMockBoard(role: 'ChuTich', isStudentLocked: true);

      await tester.pumpWidget(
        AppStateContainer(
          child: MaterialApp(
            home: HoiDongGradingQueueScreen(
              board: board,
              onBack: () {},
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Nút CHỐT ĐIỂM biến mất
      expect(find.text('CHỐT ĐIỂM'), findsNothing);

      // Hiển thị badge Đã chốt điểm
      expect(find.text('Đã chốt điểm'), findsOneWidget);

      // Nút lưu điểm chuyển thành ĐÃ KHÓA
      expect(find.text('ĐÃ KHÓA'), findsOneWidget);
    });

    testWidgets('5. Toàn bộ Hội đồng đã khóa sổ: Hiển thị badge ĐÃ KHÓA SỔ, ẩn nút Khóa sổ trên AppBar', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final board = createMockBoard(role: 'ChuTich', isBoardLocked: true);

      await tester.pumpWidget(
        AppStateContainer(
          child: MaterialApp(
            home: HoiDongGradingQueueScreen(
              board: board,
              onBack: () {},
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Hiển thị badge ĐÃ KHÓA SỔ
      expect(find.text('ĐÃ KHÓA SỔ'), findsOneWidget);

      // Nút Khóa sổ trên AppBar đã bị ẩn
      expect(find.text('Khóa sổ Hội đồng'), findsNothing);
    });

    testWidgets('6. Nhấn nút Tiến độ chấm mở BottomSheet chi tiết ma trận tiến độ', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final board = createMockBoard(role: 'ChuTich');

      await tester.pumpWidget(
        AppStateContainer(
          child: MaterialApp(
            home: HoiDongGradingQueueScreen(
              board: board,
              onBack: () {},
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Nhấn nút Tiến độ chấm
      await tester.tap(find.text('Tiến độ chấm'));
      await tester.pumpAndSettle();

      // Kiểm tra BottomSheet hiển thị tiêu đề
      expect(find.text('Tiến độ chấm Hội đồng'), findsOneWidget);
      expect(find.textContaining('sinh viên đã chốt điểm'), findsOneWidget);
    });
  });
}
