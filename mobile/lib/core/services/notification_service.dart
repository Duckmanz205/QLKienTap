import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/app_models.dart';

class NotificationService {
  NotificationService._internal();
  static final NotificationService instance = NotificationService._internal();

  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  final Connectivity _connectivity = Connectivity();

  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  VoidCallback? onNetworkRestored;

  bool _isInitialized = false;
  bool _wasOffline = false;

  static const String _notifiedKeysPref = 'qlkt_notified_reminder_keys';
  static const String _offlineQueuePref = 'qlkt_offline_pending_notifications';

  static const String channelId = 'qlkt_smart_reminders';
  static const String channelName = 'Nhắc nhở kiến tập';
  static const String channelDescription =
      'Thông báo nhắc nhở chuyến đi, hạn nộp bài và đóng lệ phí kiến tập';

  Future<void> initialize() async {
    if (_isInitialized) return;

    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const darwinSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: darwinSettings,
    );

    await _localNotifications.initialize(
      settings: initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        debugPrint('[NotificationService] User tapped notification: ${response.payload}');
      },
    );

    // Xin quyền gửi thông báo trên Android 13+ (API 33+)
    final androidImplementation = _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    if (androidImplementation != null) {
      await androidImplementation.requestNotificationsPermission();
      
      // Tạo trước NotificationChannel với mức ưu tiên cao nhất để kích hoạt Heads-up banner
      const androidChannel = AndroidNotificationChannel(
        channelId,
        channelName,
        description: channelDescription,
        importance: Importance.max,
        playSound: true,
        enableVibration: true,
        showBadge: true,
      );
      await androidImplementation.createNotificationChannel(androidChannel);
    }

    _startConnectivityMonitoring();

    _isInitialized = true;
    debugPrint('[NotificationService] Initialized successfully with offline queue & connectivity listener');
  }

  /// Lắng nghe trạng thái kết nối mạng theo thời gian thực
  void _startConnectivityMonitoring() {
    _connectivitySubscription?.cancel();
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen((results) async {
      final bool isOnline = results.any((r) => r != ConnectivityResult.none);
      if (isOnline) {
        if (_wasOffline) {
          debugPrint('[NotificationService] Mạng đã phục hồi! Đang xả hàng đợi offline và đồng bộ...');
          _wasOffline = false;
          await flushOfflineNotifications();
          onNetworkRestored?.call();
        }
      } else {
        debugPrint('[NotificationService] Mất kết nối mạng. Chuyển sang chế độ bảo lưu ngoại tuyến (Offline mode).');
        _wasOffline = true;
      }
    });

    // Kiểm tra trạng thái mạng ban đầu
    _connectivity.checkConnectivity().then((results) {
      _wasOffline = !results.any((r) => r != ConnectivityResult.none);
    });
  }

  /// Kiểm tra xem hiện tại thiết bị có mạng hay không
  Future<bool> isNetworkConnected() async {
    final results = await _connectivity.checkConnectivity();
    return results.any((r) => r != ConnectivityResult.none);
  }

  /// Hiển thị thông báo đẩy ngay lập tức (Heads-up notification trên đỉnh màn hình)
  Future<void> showInstantNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    if (!_isInitialized) {
      await initialize();
    }

    const androidDetails = AndroidNotificationDetails(
      channelId,
      channelName,
      channelDescription: channelDescription,
      importance: Importance.max,
      priority: Priority.high,
      ticker: 'Nhắc nhở kiến tập',
      playSound: true,
      enableVibration: true,
      icon: '@mipmap/ic_launcher',
      styleInformation: BigTextStyleInformation(''),
    );

    const darwinDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: darwinDetails,
    );

    await _localNotifications.show(
      id: id,
      title: title,
      body: body,
      notificationDetails: details,
      payload: payload,
    );
  }

  /// Lưu trữ thông báo vào Hàng đợi ngoại tuyến (Offline Pending Queue) khi mất mạng
  Future<void> enqueueOfflineNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final queue = prefs.getStringList(_offlineQueuePref) ?? [];
      final item = jsonEncode({
        'id': id,
        'title': title,
        'body': body,
        'payload': payload,
      });

      if (!queue.contains(item)) {
        queue.add(item);
        await prefs.setStringList(_offlineQueuePref, queue);
        debugPrint('[NotificationService] Đã bảo lưu thông báo vào hàng đợi ngoại tuyến: $title');
      }
    } catch (e) {
      debugPrint('[NotificationService] Lỗi khi thêm vào hàng đợi ngoại tuyến: $e');
    }
  }

  /// Xả toàn bộ hàng đợi ngoại tuyến và bắn Heads-up Notifications khi có mạng lại
  Future<void> flushOfflineNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final queue = prefs.getStringList(_offlineQueuePref) ?? [];
      if (queue.isEmpty) return;

      debugPrint('[NotificationService] Đang xả ${queue.length} thông báo trong hàng đợi ngoại tuyến...');
      for (final itemStr in queue) {
        try {
          final item = jsonDecode(itemStr) as Map<String, dynamic>;
          await showInstantNotification(
            id: item['id'] as int,
            title: item['title'] as String,
            body: item['body'] as String,
            payload: item['payload'] as String?,
          );
        } catch (e) {
          debugPrint('[NotificationService] Lỗi khi xả thông báo: $e');
        }
      }

      await prefs.remove(_offlineQueuePref);
      debugPrint('[NotificationService] Đã xả và gửi thành công toàn bộ thông báo ngoại tuyến!');
    } catch (e) {
      debugPrint('[NotificationService] Lỗi xả hàng đợi ngoại tuyến: $e');
    }
  }

  /// Quét và tự động đẩy thông báo nhắc nhở cho Sinh viên (kèm cơ chế bảo lưu khi mất mạng)
  Future<void> notifyStudentReminders(List<StudentNotification> reminders) async {
    if (reminders.isEmpty) return;

    try {
      final online = await isNetworkConnected();
      final prefs = await SharedPreferences.getInstance();
      final notifiedList = prefs.getStringList(_notifiedKeysPref) ?? [];
      final notifiedSet = notifiedList.toSet();

      bool hasNew = false;
      for (var reminder in reminders) {
        if (!reminder.id.startsWith('auto-') &&
            reminder.type != 'NhacNho' &&
            reminder.type != 'CanhBao') {
          continue;
        }

        if (!notifiedSet.contains(reminder.id)) {
          final int notifId = reminder.id.hashCode & 0x7FFFFFFF;
          final payload = jsonEncode({'id': reminder.id, 'type': reminder.type});

          if (online) {
            // Khi có mạng: bắn ngay lập tức Heads-up popup
            await showInstantNotification(
              id: notifId,
              title: reminder.title,
              body: reminder.content,
              payload: payload,
            );
          } else {
            // Khi mất mạng: CHỈ bảo lưu vào Hàng đợi ngoại tuyến, KHÔNG hiển thị ngay
            // Chờ đến khi có mạng trở lại sẽ tự động xả hàng đợi và đẩy thông báo lên màn hình
            await enqueueOfflineNotification(
              id: notifId,
              title: reminder.title,
              body: reminder.content,
              payload: payload,
            );
          }

          notifiedSet.add(reminder.id);
          hasNew = true;
        }
      }

      if (hasNew) {
        await prefs.setStringList(_notifiedKeysPref, notifiedSet.toList());
      }
    } catch (e) {
      debugPrint('[NotificationService] Error notifying student reminders: $e');
    }
  }

  /// Quét và tự động đẩy thông báo nhắc nhở cho Giảng viên (kèm cơ chế bảo lưu khi mất mạng)
  Future<void> notifyLecturerReminders(List<LecturerNotification> reminders) async {
    if (reminders.isEmpty) return;

    try {
      final online = await isNetworkConnected();
      final prefs = await SharedPreferences.getInstance();
      final notifiedList = prefs.getStringList(_notifiedKeysPref) ?? [];
      final notifiedSet = notifiedList.toSet();

      bool hasNew = false;
      for (var reminder in reminders) {
        if (!reminder.id.startsWith('auto-') &&
            reminder.type != 'NhacNho' &&
            reminder.type != 'CanhBao') {
          continue;
        }

        if (!notifiedSet.contains(reminder.id)) {
          final int notifId = reminder.id.hashCode & 0x7FFFFFFF;
          final payload = jsonEncode({'id': reminder.id, 'type': reminder.type});

          if (online) {
            await showInstantNotification(
              id: notifId,
              title: reminder.title,
              body: reminder.body,
              payload: payload,
            );
          } else {
            // Khi mất mạng: CHỈ bảo lưu vào Hàng đợi ngoại tuyến, KHÔNG hiển thị ngay
            await enqueueOfflineNotification(
              id: notifId,
              title: reminder.title,
              body: reminder.body,
              payload: payload,
            );
          }

          notifiedSet.add(reminder.id);
          hasNew = true;
        }
      }

      if (hasNew) {
        await prefs.setStringList(_notifiedKeysPref, notifiedSet.toList());
      }
    } catch (e) {
      debugPrint('[NotificationService] Error notifying lecturer reminders: $e');
    }
  }

  /// Xóa lịch sử đã thông báo (dùng khi đăng xuất hoặc reset)
  Future<void> clearNotificationHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_notifiedKeysPref);
    await prefs.remove(_offlineQueuePref);
    await _localNotifications.cancelAll();
  }

  void dispose() {
    _connectivitySubscription?.cancel();
  }
}
