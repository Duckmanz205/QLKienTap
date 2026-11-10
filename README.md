# 🎓 QLKienTap — Hệ thống Quản lý Kiến tập Nhà máy & Chấm điểm AI

Hệ thống quản lý toàn diện quy trình kiến tập nhà máy dành cho sinh viên, giảng viên và quản lý khoa tại trường Đại học Công Thương TP.HCM (HUIT), tích hợp Hội đồng chấm điểm AI tự động, trích xuất chữ viết tay OCR và ứng dụng di động Flutter.

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Chức năng chính](#-chức-năng-chính)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Hướng dẫn khởi chạy nhanh](#-hướng-dẫn-khởi-chạy-nhanh)
- [Tối ưu & Đóng gói khi di chuyển (Clean & Move)](#-tối-ưu--đóng-gói-khi-di-chuyển-clean--move)
- [Tài khoản thử nghiệm](#-tài-khoản-thử-nghiệm)
- [Cơ sở dữ liệu](#-cơ-sở-dữ-liệu)

---

## 🔍 Tổng quan

**QLKienTap** là đồ án khóa luận tốt nghiệp xây dựng giải pháp chuyển đổi số toàn diện cho hoạt động kiến tập nhà máy tại HUIT:

- **Quản lý kế hoạch học phần**: Tạo đợt kiến tập theo năm học / học kỳ, quản lý danh mục nhà máy đối tác.
- **Tổ chức chuyến tham quan**: Hỗ trợ cả 2 hình thức chuyến do Khoa tổ chức và chuyến do sinh viên tự liên hệ (chuyến tự do).
- **Thuật toán xét duyệt 3 tầng ưu tiên**: Tự động xét duyệt sinh viên đăng ký dựa trên điều kiện tốt nghiệp, số chuyến đã tích lũy và mức độ ưu tiên.
- **Điểm danh & Giám sát thực địa**: Giảng viên dẫn đoàn điểm danh trực tiếp qua Web/Mobile; nộp giấy xác nhận tham quan doanh nghiệp mộc đỏ.
- **Hội đồng chấm AI & Vision OCR**: Tự động nhận diện chữ viết tay từ bài scan PDF qua mô hình DeepSeek-Flash / Qwen-VL; chấm điểm Rubric 3 tiêu chí độc lập theo chuỗi suy luận CoT.
- **Quản lý tài chính & Hoàn phí**: Theo dõi trạng thái hóa đơn lệ phí, kiểm duyệt đơn hoàn phí và xử lý danh sách đen (Blacklist).

---

## 🏗️ Kiến trúc hệ thống

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend Web   │     │   Mobile App     │     │   AI Service     │
│   React + Vite   │     │   Flutter App    │     │  Python/FastAPI  │
│    Port 5173     │     │  Android / iOS   │     │    Port 8000     │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         └───────────┬────────────┘                        │
                     ▼                                     │
             ┌──────────────────┐                          │
             │     Backend      │◄─────────────────────────┘
             │   NestJS API     │
             │   Port 3000      │◄────── Cloudflare R2 (S3 Storage)
             └────────┬─────────┘
                      ▼
             ┌──────────────────┐
             │   SQL Server     │
             │   Port 1433      │
             │  DB: QLKienTap   │
             └──────────────────┘
```

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ | Phiên bản / Chi tiết |
| :--- | :--- | :--- |
| **Backend API** | NestJS (TypeScript) | v11, TypeORM, Passport JWT, Multer |
| **Database** | Microsoft SQL Server | 2019+, 33 Bảng quan hệ, Triggers, Constraints |
| **Frontend Web** | React + Vite | React 19, Vite 8, Tailwind CSS, Lucide Icons |
| **AI Microservice** | Python + FastAPI | DeepSeek-V4.1-Flash-1017, Qwen3.8-Max, PyMuPDF |
| **Mobile App** | Flutter (Dart) | Flutter 3.10+, Material Design 3 |
| **Object Storage** | Cloudflare R2 | S3 Compatible Bucket (PDF, minh chứng, TXT) |

---

## ✨ Chức năng chính

### 👨‍🎓 Cổng Sinh viên (8 phân hệ)
- **Dashboard**: Thống kê số chuyến đã đi, tiến độ hoàn thành, cảnh báo hạn nộp bài.
- **Đăng ký chuyến**: Xem danh sách nhà máy, đăng ký chuyến do Khoa tổ chức hoặc gửi đề xuất chuyến tự do.
- **Lịch trình đoàn**: Xem ngày giờ khởi hành, danh sách xe, giảng viên dẫn đoàn và trạng thái điểm danh.
- **Nộp bài thu hoạch**: Tải lên file PDF bài scan viết tay, nhận diện tự động chữ viết tay qua OCR nền, xem điểm chấm chi tiết.
- **Thanh toán lệ phí**: Tra cứu hóa đơn, quét mã QR thanh toán hoặc tải minh chứng chuyển khoản.
- **Hoàn phí & Rút đơn**: Rút đơn tự do trước khi chốt danh sách; làm đơn hoàn phí kèm file lý do xin duyệt.
- **Kết quả & Điểm số**: Xem ma trận điểm 3 chuyến, điểm thành phần và điểm tổng kết học phần.
- **Hộp thư thông báo**: Nhận thông báo triệu tập, lịch phỏng vấn và phản hồi duyệt đơn.

### 👨‍🏫 Cổng Giảng viên (8 phân hệ)
- **Lịch dẫn đoàn**: Xem lịch các chuyến được phân công dẫn đoàn đến các nhà máy.
- **Điểm danh sinh viên**: Điểm danh Có mặt / Vắng mặt trực tiếp trên xe.
- **Điểm chuẩn bị & Điểm cộng**: Chấm điểm chuẩn bị trước chuyến đi, ghi nhận điểm cộng phát biểu/thái độ.
- **Sinh viên hướng dẫn (GVHD)**: Quản lý danh sách sinh viên được phân công chấm bài thu hoạch.
- **Chấm bài thu hoạch**: Chấm điểm Rubric, xem bản gợi ý chấm điểm tự động từ AI, duyệt sửa điểm và khóa điểm.
- **Hội đồng chấm báo cáo**: Chấm điểm sinh viên báo cáo trực tiếp trước hội đồng khoa.

### 🏛️ Cổng Quản lý Khoa & CLB (18 phân hệ)
- **Đợt kiến tập & Lịch kiến tập**: Thiết lập thời gian mở đăng ký, lịch trình tham quan.
- **Quản lý Chuyến & Lọc danh sách**: Thiết lập sức chứa, chạy thuật toán lọc 3 tầng ưu tiên, chốt danh sách chính thức.
- **Phân công GVHD**: Phân bổ sinh viên cho giảng viên hướng dẫn theo hàng loạt hoặc thủ công.
- **Phân công GV Dẫn đoàn**: Bố trí giảng viên phụ trách đoàn xe đến từng nhà máy.
- **Quản lý Tài chính & Hoàn phí**: Rà soát hóa đơn lệ phí, duyệt đơn xin hoàn phí, cấp phiếu tham quan.
- **Hội đồng chấm báo cáo**: Thành lập hội đồng, phân bổ sinh viên báo cáo, tổng kết điểm hội đồng.
- **Tổng kết học phần**: Khóa điểm toàn khoa, xuất báo cáo Excel, thống kê sinh viên học lại.

---

## 📂 Cấu trúc thư mục

```
CodeDoAn/
├── backend/                        # NestJS API Server
│   ├── src/
│   │   ├── auth/                   # Xác thực JWT, Roles Guard, User Decorator
│   │   ├── entities/qlkt.entity.ts # 33 TypeORM Entities
│   │   ├── sinh-vien/              # Module nghiệp vụ Sinh viên
│   │   ├── giang-vien/             # Module nghiệp vụ Giảng viên
│   │   ├── khoa/                   # Module Quản lý Khoa & CLB
│   │   └── upload/                 # Upload controller & Cloudflare R2 Service
│   ├── .env                        # Biến môi trường Backend & R2
│   └── package.json
│
├── frontend/                       # React + Vite Web Portal
│   ├── src/
│   │   ├── pages/                  # Các trang Sinh viên, Giảng viên, Khoa, CLB
│   │   ├── components/             # Reusable UI components & Layouts
│   │   └── services/               # Axios API clients & Auth services
│   ├── vite.config.js
│   └── package.json
│
├── ai-service/                     # Python AI Microservice (FastAPI)
│   ├── src/
│   │   ├── main.py                 # Endpoint /process-pdf, /grade-rubric
│   │   ├── model_profiles.py       # Cấu hình DeepSeek Flash 1017 & Qwen Max
│   │   └── schemas.py              # Pydantic Schemas
│   ├── .env                        # API Key Qwen/DashScope
│   └── requirements.txt
│
├── mobile/                         # Flutter Mobile Application
│   ├── lib/                        # Dart source code
│   └── pubspec.yaml
│
├── TaiLieu/                        # Tài liệu đặc tả & CSDL
│   └── Tai_Lieu_Test_Du_An/        # Script SQL Backup Demo & Công cụ dời ngày
├── README.md                       # File tổng quan này
└── README_SETUP.md                 # Hướng dẫn cài đặt chi tiết từng bước
```

---

## 🚀 Hướng dẫn khởi chạy nhanh

> 📖 Hướng dẫn chi tiết từng bước và xử lý sự cố xem tại: [README_SETUP.md](./README_SETUP.md)

1. **Khôi phục CSDL SQL Server:**
   Mở file [TaiLieu/Tai_Lieu_Test_Du_An/Backup_Demo.sql](./TaiLieu/Tai_Lieu_Test_Du_An/Backup_Demo.sql) trên SSMS và chạy F5 để nạp toàn bộ cấu trúc bảng và dữ liệu mẫu demo.

2. **Khởi chạy Backend (Port 3000):**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

3. **Khởi chạy Frontend Web (Port 5173):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Khởi chạy AI Service (Port 8000):**
   ```bash
   cd ai-service
   python -m venv venv
   .\venv\Scripts\pip install -r requirements.txt
   .\venv\Scripts\uvicorn src.main:app --reload --port 8000
   ```

---

## 📦 Tối ưu & Đóng gói khi di chuyển (Clean & Move)

Trước khi nén `.zip` dự án để sao lưu hoặc chuyển sang máy tính khác, hãy chạy lệnh dọn dẹp sau để giảm dung lượng dự án từ **2.2 GB xuống còn ~500 MB (giảm 80%)**:

```powershell
# 1. Dọn dẹp Flutter build (xóa sạch 1.04 GB build cache)
cd mobile; flutter clean; cd ..

# 2. Xóa các bản build dist
Remove-Item -Recurse -Force backend/dist, frontend/dist -ErrorAction SilentlyContinue

# 3. Xóa các thư mục thư viện dependencies (có thể cài lại bất cứ lúc nào)
Remove-Item -Recurse -Force backend/node_modules, frontend/node_modules, ai-service/venv -ErrorAction SilentlyContinue
```

> [!NOTE]
> Khi mở dự án trên máy mới, chỉ cần chạy lại `npm install` trong `backend`/`frontend` và `pip install -r requirements.txt` trong `ai-service`.

---

## 🔑 Tài khoản thử nghiệm

| Vai trò | Tài khoản | Mật khẩu | Chú thích |
| :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `123456` | Quản trị hệ thống |
| **Quản lý Khoa** | `admin01` | `123456` | Quản lý học thuật, duyệt lịch |
| **Quản lý CLB** | `clb01` | `123456` | Mở đợt, lọc danh sách 3 tầng |
| **Sinh viên (Demo)** | `2001230000` | `123456` | Đã nộp 3 chuyến (Acecook, Heineken, Ajinomoto) |
| **Giảng viên** | `GV001` | `GvHuit2025` | Giảng viên hướng dẫn & Dẫn đoàn |

---

## 👤 Nhóm tác giả

- **Sinh viên thực hiện**:
  - Nguyễn Văn Đức — MSSV: 2001230000
  - Nguyễn Vĩnh Khang — MSSV: 2005230497
  - Phạm Văn Mãnh — MSSV: 2005230519
- **Đơn vị**: Khoa Công nghệ Thông tin — Trường Đại học Công Thương TP.HCM (HUIT)
- **Năm học**: 2025 – 2026
