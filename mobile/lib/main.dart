import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/services/notification_service.dart';
import 'data/state/app_state.dart';
import 'presentation/screens/login_screen.dart';
import 'presentation/screens/student/student_portal.dart';
import 'presentation/screens/lecturer/lecturer_portal.dart';
import 'presentation/screens/change_password_screen.dart';

final GlobalKey<ScaffoldMessengerState> rootScaffoldMessengerKey =
    GlobalKey<ScaffoldMessengerState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.instance.initialize();

  // Đăng ký In-App Floating Notification Banner
  NotificationService.onInAppNotification = (title, body, type) {
    rootScaffoldMessengerKey.currentState?.removeCurrentSnackBar();
    rootScaffoldMessengerKey.currentState?.showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.only(top: 12, left: 16, right: 16, bottom: 20),
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: BorderSide(
            color: AppColors.primary.withValues(alpha: 0.6),
            width: 1.2,
          ),
        ),
        duration: const Duration(seconds: 4),
        content: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.notifications_active_rounded,
                color: AppColors.secondary,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      fontSize: 13,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    body,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 11,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  };

  runApp(
    const AppStateContainer(
      child: MainApp(),
    ),
  );
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context).state;

    Widget homeScreen;
    if (appState.currentRole != null && appState.phaiDoiMatKhau == true) {
      homeScreen = const ChangePasswordScreen();
    } else if (appState.currentRole == 'student') {
      homeScreen = const StudentPortal();
    } else if (appState.currentRole == 'lecturer') {
      homeScreen = const LecturerPortal();
    } else {
      homeScreen = const LoginScreen();
    }

    return MaterialApp(
      scaffoldMessengerKey: rootScaffoldMessengerKey,
      debugShowCheckedModeBanner: false,
      title: 'Quản Lý Kiến Tập',
      theme: AppTheme.lightTheme,
      home: homeScreen,
    );
  }
}
