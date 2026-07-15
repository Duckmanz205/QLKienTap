# 📘 Hướng dẫn chạy đồ án Quản lý Kiến tập (QLKienTap)

## Tổng quan kiến trúc

```
Frontend (React + Vite)  ──▶  Backend (NestJS)  ──▶  SQL Server
     Port 5173           API    Port 3000        TypeORM  Port 1433
                    http://localhost:3000/api          DB: QLKienTap
```

---

## 📋 Yêu cầu hệ thống (Prerequisites)

| Phần mềm | Phiên bản tối thiểu | Kiểm tra bằng lệnh |
| :--- | :--- | :--- |
| **Node.js** | v18+ | `node -v` |
| **npm** | v9+ | `npm -v` |
| **SQL Server** | 2019+ | Kiểm tra qua SSMS |
| **SSMS** hoặc **Azure Data Studio** | Bất kỳ | Dùng để chạy script SQL |

> ⚠️ SQL Server phải đang chạy và cho phép kết nối TCP/IP trên cổng **1433**.  
> Bật TCP/IP trong **SQL Server Configuration Manager** nếu chưa bật.

---

## 🛠️ Bước 1: Chuẩn bị Database

### 1.1. Tạo database (nếu chưa có)

Mở SSMS, kết nối vào SQL Server và chạy:

```sql
CREATE DATABASE QLKienTap;
```

### 1.2. Tạo bảng tự động từ TypeORM

Mở file `backend/src/app.module.ts` dòng **30**, tạm sửa:

```diff
- synchronize: false, // TAT trong production, dung migrations thay the
+ synchronize: true,  // TẠM BẬT để TypeORM tự tạo bảng
```

> ⚠️ Sau khi bảng đã được tạo xong (backend khởi động thành công lần đầu), hãy **chuyển lại thành `false`** để tránh mất dữ liệu.
> Nếu database của bạn **đã có sẵn bảng**, bước này có thể bỏ qua.

---

## ⚙️ Bước 2: Cấu hình & Chạy Backend

### 2.1. Cấu hình file `.env`

Mở file `backend/.env` và cập nhật thông tin kết nối SQL Server:

```env
# Cau hinh ket noi SQL Server
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=123          ← Đổi thành mật khẩu SQL Server của bạn
DB_DATABASE=QLKienTap

# Cau hinh ung dung
PORT=3000                ← Backend sẽ chạy ở port này

# JWT
JWT_SECRET=default_secret_key_123456
JWT_EXPIRES_IN=24h
```

> 🔴 **Lưu ý về PORT**: File `.env` hiện đặt `PORT=3000`.  
> Frontend (`frontend/src/services/api.js`) đang gọi API tới `http://localhost:3000/api`.  
> Hai giá trị này **phải khớp nhau**. Nếu bạn đổi PORT, nhớ cập nhật cả `api.js`.

### 2.2. Cài đặt thư viện & khởi chạy

Mở **Terminal 1** (PowerShell hoặc CMD):

```bash
cd e:\Khoa_Luan\CodeDoAn\backend
npm install
npm run start:dev
```

### 2.3. Xác nhận thành công

Khi thấy dòng sau, backend đã sẵn sàng:

```
🚀 Backend dang chay tai: http://localhost:3000/api
```

Kiểm tra nhanh bằng trình duyệt: truy cập `http://localhost:3000/api` → thấy **"Hello World!"** là thành công.

---

## 💻 Bước 3: Cài đặt & Chạy Frontend

Mở **Terminal 2** (giữ Terminal 1 đang chạy backend):

```bash
cd e:\Khoa_Luan\CodeDoAn\frontend
npm install
npm run dev
```

Khi thấy dòng:

```
VITE v8.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

Mở trình duyệt truy cập: **http://localhost:5173**

→ Trang đăng nhập sẽ hiện lên.

---

## 🔑 Bước 4: Đăng nhập thử nghiệm

Database đã có sẵn dữ liệu. Các tài khoản sử dụng **mật khẩu mặc định** theo cơ chế trong `backend/src/auth/auth.service.ts`:

| Vai trò | Tên đăng nhập (ví dụ) | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Quản lý Khoa** | `admin01` | `AdminHuit2025` | Tài khoản quản trị viên |
| **Sinh viên** | `2022220001` (MSSV bất kỳ) | `SvHuit2025` | Dùng MSSV có trong bảng TaiKhoan |
| **Giảng viên** | Mã GV có trong DB | `GvHuit2025` | Dùng tên đăng nhập GV trong DB |

> 💡 Mật khẩu mặc định hoạt động nhờ cơ chế: nếu `mat_khau_hash` trong DB là `$2b$10$hash_placeholder`, hệ thống sẽ so khớp với mật khẩu mặc định theo vai trò.

---

## 🔧 Tổng hợp lệnh chạy nhanh

Nếu mọi thứ đã được cài đặt, chỉ cần mở **2 terminal** và chạy:

**Terminal 1 — Backend:**
```bash
cd e:\Khoa_Luan\CodeDoAn\backend
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
cd e:\Khoa_Luan\CodeDoAn\frontend
npm run dev
```

Sau đó mở trình duyệt → **http://localhost:5173**

---

## ❌ Xử lý lỗi thường gặp

### Lỗi 1: `ConnectionError: Failed to connect to localhost:1433`
- **Nguyên nhân**: SQL Server chưa chạy hoặc chưa bật TCP/IP.
- **Cách sửa**:
  1. Mở **SQL Server Configuration Manager**
  2. Vào **SQL Server Network Configuration** → **Protocols for MSSQLSERVER**
  3. Bật **TCP/IP** → Khởi động lại SQL Server service

### Lỗi 2: `Login failed for user 'sa'`
- **Nguyên nhân**: Sai mật khẩu hoặc tài khoản `sa` chưa được bật.
- **Cách sửa**: Kiểm tra lại `DB_PASSWORD` trong `backend/.env`

### Lỗi 3: Frontend bị lỗi trắng / không load
- **Nguyên nhân**: Thiếu thư viện (lucide-react, axios, react-router-dom...).
- **Cách sửa**:
  ```bash
  cd frontend
  npm install
  ```
  Sau đó **tắt** và **khởi động lại** `npm run dev`.

### Lỗi 4: API trả về lỗi CORS
- **Nguyên nhân**: Backend chạy sai port so với cấu hình CORS.
- **Cách sửa**: Đảm bảo backend chạy ở port **3000** (khớp với `API_BASE_URL` trong `frontend/src/services/api.js`).

---

## 📂 Cấu trúc thư mục chính

```
CodeDoAn/
├── backend/                    ← NestJS API Server
│   ├── src/
│   │   ├── auth/               ← Xác thực (Login, đổi MK)
│   │   ├── entities/           ← TypeORM Entities (33 bảng)
│   │   ├── giang-vien/         ← Module Giảng viên
│   │   ├── khoa/               ← Module Quản lý Khoa (Admin)
│   │   ├── sinh-vien/          ← Module Sinh viên
│   │   ├── app.module.ts       ← Module gốc (cấu hình DB)
│   │   └── main.ts             ← Entry point (CORS, port)
│   ├── .env                    ← Biến môi trường
│   └── package.json
│
└── frontend/                   ← React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx       ← Trang đăng nhập
    │   │   ├── sinh-vien/      ← 8 trang Sinh viên
    │   │   ├── giang-vien/     ← 8 trang Giảng viên
    │   │   └── khoa/           ← 16 trang Admin
    │   ├── services/api.js     ← Axios API client
    │   └── App.jsx             ← Router chính
    ├── vite.config.js
    └── package.json
```
