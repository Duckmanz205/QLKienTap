import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'data/state/app_state.dart';
import 'presentation/screens/login_screen.dart';
import 'presentation/screens/student/student_portal.dart';
import 'presentation/screens/lecturer/lecturer_portal.dart';

void main() {
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
    if (appState.currentRole == 'student') {
      homeScreen = const StudentPortal();
    } else if (appState.currentRole == 'lecturer') {
      homeScreen = const LecturerPortal();
    } else {
      homeScreen = const LoginScreen();
    }

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Quản Lý Kiến Tập',
      theme: AppTheme.lightTheme,
      home: homeScreen,
    );
  }
}
