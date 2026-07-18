import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF407F3E); // Forest Green
  static const Color secondary = Color(0xFF89B449); // Light Green
  static const Color warning = Color(0xFFDBD468); // Sand Yellow
  static const Color danger = Color(0xFFE68A8C); // Coral Pink
  
  static const Color appBackground = Color(0xFFE7E0C4); // Light Beige
  static const Color baseBackground = Color(0xFFFFFFFF); // Pure White
  
  static const Color darkSlate = Color(0xFF2C3E50); // Text
  static const Color textMuted = Color(0xFF7F8C8D);
  static const Color cardShadow = Color(0x0D000000);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        error: AppColors.danger,
        background: AppColors.appBackground,
        surface: AppColors.baseBackground,
      ),
      scaffoldBackgroundColor: AppColors.appBackground,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.baseBackground,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: AppColors.primary),
        titleTextStyle: TextStyle(
          color: AppColors.primary,
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.baseBackground,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: Colors.grey.shade100, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.grey.shade50,
        labelStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
        floatingLabelStyle: const TextStyle(color: AppColors.primary),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
      ),
    );
  }
}
