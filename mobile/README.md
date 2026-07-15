# 📱 Mobile App — Flutter Client cho QLKienTap

## Mục đích

Ứng dụng di động Flutter dùng chung **Backend NestJS** với Frontend React.

## Kiến trúc tổng quan

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Frontend React │     │  Mobile Flutter │     │  AI Service  │
│   (Port 5173)   │     │  (Android/iOS)  │     │  (Port 8000) │
└────────┬────────┘     └────────┬────────┘     └──────┬───────┘
         │                       │                      │
         └───────────┬───────────┘                      │
                     ▼                                  │
              ┌──────────────┐                          │
              │   Backend    │◄─────────────────────────┘
              │ NestJS :3000 │
              └──────┬───────┘
                     ▼
              ┌──────────────┐
              │  SQL Server  │
              │  :1433       │
              └──────────────┘
```

## Khởi tạo dự án Flutter

```bash
cd mobile
flutter create --org vn.edu.huit --project-name qlkientap .
```

## API Base URL

Khi chạy trên máy ảo Android (emulator):
```dart
// Android Emulator dùng 10.0.2.2 thay cho localhost
const String apiBaseUrl = 'http://10.0.2.2:3000/api';

// Thiết bị thật trên cùng WiFi: dùng IP LAN
// const String apiBaseUrl = 'http://192.168.1.xxx:3000/api';
```

## Cấu trúc thư mục (sau khi flutter create)

```
mobile/
├── lib/
│   ├── main.dart
│   ├── models/           ← Data models (SinhVien, GiangVien...)
│   ├── services/         ← API service classes
│   ├── screens/          ← Các màn hình
│   └── widgets/          ← Widget tái sử dụng
├── android/
├── ios/
├── pubspec.yaml
└── README.md             ← File này
```

## Lưu ý Backend CORS

Backend đã cấu hình CORS trong `backend/src/main.ts`. Khi phát triển mobile,
bạn cần thêm origin hoặc bật wildcard:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: true,  // Cho phép tất cả origin khi dev
  credentials: true,
});
```
