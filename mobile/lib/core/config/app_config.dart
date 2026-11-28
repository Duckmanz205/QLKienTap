/// Cấu hình cờ tính năng dùng chung cho Mobile App (QLKienTap).
class AppConfig {
  /// Mở khóa các mốc thời gian cho chế độ demo bảo vệ đồ án.
  /// Có thể ghi đè khi chạy/build qua: --dart-define=DEMO_BYPASS_TIME_GATES=false
  static const bool demoBypassTimeGates = bool.fromEnvironment(
    'DEMO_BYPASS_TIME_GATES',
    defaultValue: true,
  );
}
