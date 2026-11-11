# 📘 Hướng dẫn Cài đặt, Khởi chạy & Đóng gói Dự án Quản lý Kiến tập (QLKienTap)

Hệ thống quản lý toàn diện quy trình kiến tập nhà máy cho sinh viên HUIT, tích hợp chấm điểm AI tự động, trích xuất chữ viết tay OCR và ứng dụng di động.

---

## 🏗️ 1. Tổng quan Kiến trúc Hệ thống

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│        Frontend Web             │       │          Mobile App             │
│        React + Vite             │       │            Flutter              │
│       Port 5173 (Local)         │       │         Android / iOS           │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 │ HTTP REST /api                          │ HTTP REST /api
                 ▼                                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           Backend API Server                              │
│                      NestJS (TypeScript) - Port 3000                      │
│                                                                           │
│   • Auth (JWT Guard & Roles)              • Quản lý Chuyến & Điểm danh    │
│   • Phân công GVHD & Chấm điểm            • R2 Storage (Cloudflare S3)    │
└──────────────────┬───────────────────────────────────────┬────────────────┘
                   │                                       │
                   │ TypeORM (Port 1433)                   │ HTTP Multi-part
                   ▼                                       ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│           Database              │       │         AI Microservice         │
│     Microsoft SQL Server        │       │         Python + FastAPI        │
│         DB: QLKienTap           │       │         Port 8000 (Local)       │
│                                 │       │   • Vision OCR (DeepSeek/Qwen)  │
│  • 33 Bảng quan hệ              │       │   • Global Semaphore (2 luồng)  │
│  • Triggers & Constraints       │       │   • Chấm Rubric Đa tác tử (CoT) │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## 📋 2. Yêu cầu Hệ thống (Prerequisites)

| Phần mềm / Môi trường | Phiên bản tối thiểu | Lệnh kiểm tra | Ghi chú |
| :--- | :---: | :--- | :--- |
| **Node.js** | v18+ | `node -v` | Chạy Backend & Frontend |
| **npm** | v9+ | `npm -v` | Trình quản lý gói Node |
| **Python** | 3.9+ hoặc 3.10+ | `python --version` | Chạy AI Microservice |
| **Flutter SDK** | 3.10+ | `flutter --version` | Chạy Mobile App |
| **Microsoft SQL Server** | 2019+ | Kiểm tra qua SSMS | Port 1433, bật TCP/IP |
| **SSMS / Azure Data Studio** | Bất kỳ | Mở giao diện SSMS | Quản trị CSDL |

> [!IMPORTANT]
> SQL Server phải đang chạy service và đã bật kết nối **TCP/IP trên cổng 1433** trong *SQL Server Configuration Manager*.

---

## 🗄️ 3. Bước 1: Khởi tạo Cơ sở Dữ liệu

Dự án cung cấp 2 phương án cài đặt CSDL trong thư mục [TaiLieu/](TaiLieu):

### Phương án A: Dùng file Mock Data Demo hoàn chỉnh (Khuyên dùng)
Mở SSMS, mở file [Backup_Demo.sql](TaiLieu/Tai_Lieu_Test_Du_An/Backup_Demo.sql) và nhấn **Execute** (F5).
- File này đã tạo sẵn 33 bảng, dữ liệu các đợt kiến tập, nhà máy, sinh viên, phân công GVHD và 3 bài nộp mẫu hoàn chỉnh đã có sẵn file scan PDF và text OCR trên R2.

### Phương án B: Cài đặt từng bước Schema + Import
1. Chạy file `TaiLieu/QLKienTap_Database_v2.sql` để tạo toàn bộ bảng, khóa chính, khóa ngoại, triggers.
2. Chạy file `TaiLieu/QLKienTap_ImportData.sql` để nạp dữ liệu mẫu ban đầu.

### 🕒 Tiện ích dời ngày Demo tự động
Nếu ngày diễn ra demo khác với ngày trong dữ liệu mẫu, bạn có thể đồng bộ toàn bộ ngày của 21 bảng trong CSDL chỉ với 1 cú click:
- Mở file [DoiNgayDemo_DirectDB.sql](TaiLieu/Tai_Lieu_Test_Du_An/DoiNgayDemo_DirectDB.sql)
- Đổi biến `@NgayDemoMongMuon` sang ngày bạn thuyết trình (VD: `2026-11-20`) và bấm **Execute**.
- Toàn bộ thời hạn đăng ký, ngày tham quan, hạn nộp bài và mã hóa đơn sẽ được dời chính xác. Chi tiết xem tại [Huong_Dan_Doi_Ngay_Demo.md](TaiLieu/Tai_Lieu_Test_Du_An/Huong_Dan_Doi_Ngay_Demo.md).

---

## ⚙️ 4. Bước 2: Cấu hình & Chạy Backend (NestJS)

### 4.1. Cài đặt và khởi chạy
Mở **Terminal 1**:
```bash
cd backend
npm install --no-audit --no-fund --verbose
npm run start:dev
```
Backend sẵn sàng tại: `http://localhost:3000/api`

---

## 💻 5. Bước 3: Cài đặt & Chạy Frontend Web (React + Vite)

Mở **Terminal 2**:
```bash
cd frontend
npm install --no-audit --no-fund --verbose
npm run dev
```
Truy cập giao diện: **http://localhost:5173**

---

## 🤖 6. Bước 4: Cài đặt & Chạy AI Service (FastAPI)

Dịch vụ AI phục vụ tác vụ chấm điểm báo cáo Rubric chuyên sâu và OCR nhận diện chữ viết tay qua mô hình DeepSeek Flash / Qwen Max.

### 6.1. Cài đặt và khởi chạy
Mở **Terminal 3**:
```bash
cd ai-service
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\uvicorn src.main:app --reload --port 8000
```
Swagger UI tài liệu API: `http://localhost:8000/docs`

---

## 📱 7. Bước 5: Chạy Mobile App (Flutter - Tùy chọn)

Mở **Terminal 4**:
```bash
cd mobile
flutter pub get
flutter run
```

---

## 🔑 8. Danh sách Tài khoản Đăng nhập Thử nghiệm

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `123456` | Quản trị tài khoản, danh mục hệ thống |
| **Quản lý Khoa** | `admin01` | `123456` | Lập đợt, duyệt chuyến, phân công GVHD, chấm HĐ |
| **Quản lý CLB** | `clb01` | `123456` | Mở đăng ký, lọc danh sách 3 tầng, chốt danh sách |
| **Giảng viên** | `GV001` | `GvHuit2025` | Điểm danh chuyến, chấm bài thu hoạch, chấm HĐ |
| **Sinh viên (Demo)** | `2001230000` | `123456` | Đã nộp đủ 3 chuyến, xem điểm, hóa đơn |
| **Sinh viên khác** | `2005190573` (MSSV) | `SvHuit2025` | Sinh viên mẫu thử nghiệm đăng ký chuyến mới |

---

## 📦 9. Hướng dẫn Dọn dẹp Dự án Siêu nhẹ trước khi Di chuyển (Move / Backup)

Dự án đầy đủ sau khi build có thể nặng hơn **2.2 GB** với hơn **120,000 tệp tin** (rất lâu khi nén zip hoặc chép qua USB/Drive).

Trước khi nén hoặc sao chép, bạn hãy chạy các lệnh sau tại thư mục gốc để thu gọn dự án về **chỉ còn ~500 MB (giảm 80%)**:

```powershell
# 1. Dọn dẹp Flutter mobile (xóa hơn 1GB thư mục build tạm)
cd mobile; flutter clean; cd ..

# 2. Xóa các thư mục build sản phẩm
Remove-Item -Recurse -Force backend/dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend/dist -ErrorAction SilentlyContinue

# 3. Xóa các thư mục thư viện dependencies (có thể tải lại trong vài chục giây)
Remove-Item -Recurse -Force backend/node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend/node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ai-service/venv -ErrorAction SilentlyContinue
```

### ⚠️ Lưu ý sống còn khi sao lưu:
- **TUYỆT ĐỐI KHÔNG XÓA**:
  - File môi trường: `backend/.env`, `ai-service/.env`
  - Thư mục tài liệu & CSDL: `TaiLieu/` (chứa `Backup_Demo.sql`)
  - Toàn bộ thư mục `src/`, `lib/`, `android/`, `ios/`
- **Khôi phục nhanh trên máy mới:** Chỉ cần mở từng thư mục và chạy:
  - `backend` $\rightarrow$ `npm install --no-audit --no-fund --verbose`
  - `frontend` $\rightarrow$ `npm install --no-audit --no-fund --verbose`
  - `ai-service` $\rightarrow$ `python -m venv venv` và `pip install -r requirements.txt`
  - `mobile` $\rightarrow$ `flutter pub get`
