import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/app_models.dart';
import '../network/api_service.dart';

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

  static const String _offlineQueuePref = 'qlkt_offline_pending_notifications';

  String _getNotifiedKey(String? userId) =>
      'qlkt_notified_keys_${userId ?? ApiService.userId ?? "common"}';
  String _getInitKey(String? userId) =>
      'qlkt_notif_initialized_${userId ?? ApiService.userId ?? "common"}';

  static const String channelId = 'qlkt_smart_reminders';
  static const String channelName = 'Nhắc nhở kiến tập';
  static const String channelDescription =
      'Thông báo nhắc nhở chuyến đi, hạn nộp bài và đóng lệ phí kiến tập';

  static const String announcementChannelId = 'qlkt_announcements';
  static const String announcementChannelName = 'Thông báo Khoa & Chuyến đi';
  static const String announcementChannelDescription =
      'Thông báo chính thức từ Khoa, đợt kiến tập và chuyến tham quan';

  /// Callback toàn cục để hiển thị In-App Notification Banner nổi khi đang mở app
  static void Function(String title, String body, String? type)? onInAppNotification;

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
      
      // Tạo trước NotificationChannels với mức ưu tiên cao nhất để kích hoạt Heads-up banner
      const reminderChannel = AndroidNotificationChannel(
        channelId,
        channelName,
        description: channelDescription,
        importance: Importance.max,
        playSound: true,
        enableVibration: true,
        showBadge: true,
      );
      await androidImplementation.createNotificationChannel(reminderChannel);

      const announcementChannel = AndroidNotificationChannel(
        announcementChannelId,
        announcementChannelName,
        description: announcementChannelDescription,
        importance: Importance.max,
        playSound: true,
        enableVibration: true,
        showBadge: true,
      );
      await androidImplementation.createNotificationChannel(announcementChannel);
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
    String? channel,
    String? type,
    bool skipInAppBanner = false,
  }) async {
    if (!_isInitialized) {
      await initialize();
    }

    final targetChannelId = channel ??
        ((type == 'ThongBao' || type == 'ChuyenDi' || type == 'PhanCong')
            ? announcementChannelId
            : channelId);
    final targetChannelName = targetChannelId == announcementChannelId
        ? announcementChannelName
        : channelName;
    final targetDescription = targetChannelId == announcementChannelId
        ? announcementChannelDescription
        : channelDescription;

    final androidDetails = AndroidNotificationDetails(
      targetChannelId,
      targetChannelName,
      channelDescription: targetDescription,
      importance: Importance.max,
      priority: Priority.high,
      ticker: 'Thông báo Quản lý kiến tập',
      playSound: true,
      enableVibration: true,
      icon: '@mipmap/ic_launcher',
      styleInformation: BigTextStyleInformation(
        body,
        contentTitle: title,
      ),
    );

    const darwinDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(
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

    // Kích hoạt In-App Banner nổi nếu ứng dụng đang ở tiền cảnh (Foreground)
    if (!skipInAppBanner) {
      try {
        onInAppNotification?.call(title, body, type);
      } catch (_) {}
    }
  }

  /// Bắn thông báo thử nghiệm tức thì
  Future<void> testInstantNotification({String? title, String? body}) async {
    final notifId = DateTime.now().millisecondsSinceEpoch & 0x7FFFFFFF;
    await showInstantNotification(
      id: notifId,
      title: title ?? '🔔 Kiểm tra thông báo thành công!',
      body: body ??
          'Hệ thống thông báo đẩy (Local Notifications & Banner nổi) hoạt động hoàn hảo trên thiết bị.',
      type: 'ThongBao',
    );
  }

  /// Lưu trữ thông báo vào Hàng đợi ngoại tuyến (Offline Pending Queue) khi mất mạng
  Future<void> enqueueOfflineNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
    String? type,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final queue = prefs.getStringList(_offlineQueuePref) ?? [];
      final item = jsonEncode({
        'id': id,
        'title': title,
        'body': body,
        'payload': payload,
        'type': type,
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
            type: item['type'] as String?,
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

  /// Quét và tự động đẩy thông báo cho Sinh viên (Hỗ trợ toàn bộ thông báo Khoa & Nhắc nhở)
  Future<void> notifyStudentNotifications(
    List<StudentNotification> notifications, {
    String? userId,
  }) async {
    if (notifications.isEmpty) return;

    try {
      final effectiveUserId =
          userId ?? ApiService.userId?.toString() ?? 'student_common';
      final storageKey = _getNotifiedKey(effectiveUserId);
      final initKey = _getInitKey(effectiveUserId);

      final prefs = await SharedPreferences.getInstance();
      final bool isInitialized = prefs.getBool(initKey) ?? false;
      final notifiedList = prefs.getStringList(storageKey) ?? [];
      final notifiedSet = notifiedList.toSet();

      // Lần đầu đăng nhập trên thiết bị (First Sync):
      // Chỉ lập chỉ mục toàn bộ thông báo lịch sử cũ vào notifiedSet để không bắn spam hàng chục thông báo cũ
      if (!isInitialized) {
        for (var notif in notifications) {
          notifiedSet.add(notif.id);
        }
        await prefs.setStringList(storageKey, notifiedSet.toList());
        await prefs.setBool(initKey, true);
        debugPrint(
            '[NotificationService] First sync for student $effectiveUserId: Indexed ${notifiedSet.length} existing notifications.');
        return;
      }

      // Các lần sync sau: Lọc các thông báo thực sự mới chưa từng được push
      final newNotifs =
          notifications.where((n) => !notifiedSet.contains(n.id)).toList();
      if (newNotifs.isEmpty) return;

      final online = await isNetworkConnected();

      // Đánh dấu đã thông báo ngay lập tức để tránh trùng lặp
      for (var notif in newNotifs) {
        notifiedSet.add(notif.id);
      }
      await prefs.setStringList(storageKey, notifiedSet.toList());

      // Bắn Local Notifications cho từng thông báo mới (Heads-up trong status bar)
      for (var notif in newNotifs) {
        final int notifId = notif.id.hashCode & 0x7FFFFFFF;
        final payload = jsonEncode({'id': notif.id, 'type': notif.type});

        if (online) {
          await showInstantNotification(
            id: notifId,
            title: notif.title,
            body: notif.content,
            payload: payload,
            type: notif.type,
            skipInAppBanner: true,
          );
        } else {
          await enqueueOfflineNotification(
            id: notifId,
            title: notif.title,
            body: notif.content,
            payload: payload,
            type: notif.type,
          );
        }
      }

      // Hiển thị In-App banner nổi 1 lần cho thông báo mới nhất
      if (online && newNotifs.isNotEmpty) {
        final latest = newNotifs.first;
        try {
          onInAppNotification?.call(latest.title, latest.content, latest.type);
        } catch (_) {}
      }
    } catch (e) {
      debugPrint(
          '[NotificationService] Error notifying student notifications: $e');
    }
  }

  /// Alias tương thích ngược
  Future<void> notifyStudentReminders(
    List<StudentNotification> reminders, {
    String? userId,
  }) =>
      notifyStudentNotifications(reminders, userId: userId);

  /// Quét và tự động đẩy thông báo cho Giảng viên (Hỗ trợ toàn bộ thông báo Khoa & Nhắc nhở)
  Future<void> notifyLecturerNotifications(
    List<LecturerNotification> notifications, {
    String? userId,
  }) async {
    if (notifications.isEmpty) return;

    try {
      final effectiveUserId =
          userId ?? ApiService.userId?.toString() ?? 'lecturer_common';
      final storageKey = _getNotifiedKey(effectiveUserId);
      final initKey = _getInitKey(effectiveUserId);

      final prefs = await SharedPreferences.getInstance();
      final bool isInitialized = prefs.getBool(initKey) ?? false;
      final notifiedList = prefs.getStringList(storageKey) ?? [];
      final notifiedSet = notifiedList.toSet();

      // Lần đầu đăng nhập trên thiết bị (First Sync):
      if (!isInitialized) {
        for (var notif in notifications) {
          notifiedSet.add(notif.id);
        }
        await prefs.setStringList(storageKey, notifiedSet.toList());
        await prefs.setBool(initKey, true);
        debugPrint(
            '[NotificationService] First sync for lecturer $effectiveUserId: Indexed ${notifiedSet.length} existing notifications.');
        return;
      }

      final newNotifs =
          notifications.where((n) => !notifiedSet.contains(n.id)).toList();
      if (newNotifs.isEmpty) return;

      final online = await isNetworkConnected();

      for (var notif in newNotifs) {
        notifiedSet.add(notif.id);
      }
      await prefs.setStringList(storageKey, notifiedSet.toList());

      for (var notif in newNotifs) {
        final int notifId = notif.id.hashCode & 0x7FFFFFFF;
        final payload = jsonEncode({'id': notif.id, 'type': notif.type});

        if (online) {
          await showInstantNotification(
            id: notifId,
            title: notif.title,
            body: notif.body,
            payload: payload,
            type: notif.type,
            skipInAppBanner: true,
          );
        } else {
          await enqueueOfflineNotification(
            id: notifId,
            title: notif.title,
            body: notif.body,
            payload: payload,
            type: notif.type,
          );
        }
      }

      if (online && newNotifs.isNotEmpty) {
        final latest = newNotifs.first;
        try {
          onInAppNotification?.call(latest.title, latest.body, latest.type);
        } catch (_) {}
      }
    } catch (e) {
      debugPrint(
          '[NotificationService] Error notifying lecturer notifications: $e');
    }
  }

  /// Alias tương thích ngược
  Future<void> notifyLecturerReminders(
    List<LecturerNotification> reminders, {
    String? userId,
  }) =>
      notifyLecturerNotifications(reminders, userId: userId);

  /// Đóng toàn bộ thông báo đang hiển thị trên thanh trạng thái thiết bị mà KHÔNG xóa lịch sử ID đã nhận
  Future<void> dismissActiveSystemNotifications() async {
    await _localNotifications.cancelAll();
  }

  /// Xóa lịch sử đã thông báo (khi thực sự muốn reset hoàn toàn dữ liệu push)
  Future<void> clearNotificationHistory({String? userId}) async {
    final prefs = await SharedPreferences.getInstance();
    final effectiveUserId =
        userId ?? ApiService.userId?.toString() ?? 'common';
    await prefs.remove(_getNotifiedKey(effectiveUserId));
    await prefs.remove(_getInitKey(effectiveUserId));
    await prefs.remove(_offlineQueuePref);
    await _localNotifications.cancelAll();
  }

  void dispose() {
    _connectivitySubscription?.cancel();
  }
}
