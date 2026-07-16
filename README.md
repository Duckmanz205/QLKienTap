# HỆ THỐNG QUẢN LÝ KIẾN TẬP - HUIT

Hệ thống quản lý chuyến đi tham quan doanh nghiệp và học phần kiến tập dành cho giảng viên, sinh viên và ban quản lý khoa thuộc trường Đại học Công nghiệp Thực phẩm TP.HCM (HUIT). 

Dự án được xây dựng trên mô hình phân tách độc lập giữa **Backend (NestJS)** và **Frontend (ReactJS)**.

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

Dưới đây là sơ đồ cây thư mục chi tiết mô tả cấu trúc và chức năng của các tệp tin trong hai phân hệ chính:

### 1. Phân hệ Backend (`/backend`)
Phần API server của ứng dụng, chịu trách nhiệm kết nối cơ sở dữ liệu, xử lý nghiệp vụ, xác thực JWT, mã hóa mật khẩu và quản lý hàng đợi.

```text
backend/
├── src/
│   ├── main.ts                   # Điểm khởi chạy của ứng dụng NestJS, cấu hình CORS, Prefixes.
│   ├── app.module.ts             # Module gốc liên kết tất cả các module nghiệp vụ và cấu hình cơ sở dữ liệu.
│   ├── app.controller.ts         # Controller mặc định hiển thị trạng thái server.
│   ├── app.service.ts            # Service xử lý thông tin cơ bản cho AppController.
│   │
│   ├── auth/                     # Module Quản lý Xác thực và Phân quyền (Authentication & Authorization)
│   │   ├── auth.module.ts        # Đăng ký cấu hình JWT Module, các guard bảo vệ và controller.
│   │   ├── auth.service.ts       # Xử lý logic đăng nhập khớp mật khẩu mã hóa bcrypt, đổi mật khẩu.
│   │   ├── auth.controller.ts    # Các endpoint login, đổi mật khẩu và cập nhật profile.
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts # Decorator @Roles() gắn vai trò được phép truy cập API.
│   │   └── guards/
│   │       ├── auth.guard.ts     # Guard trích xuất Bearer Token từ Header Authorization để giải mã JWT.
│   │       └── roles.guard.ts    # Guard kiểm tra vai trò người dùng sau khi giải mã JWT để RBAC.
│   │
│   ├── entities/
│   │   └── qlkt.entity.ts        # Định nghĩa 32 đối tượng thực thể (TypeORM Entities) map tương ứng với CSDL.
│   │
│   ├── queue/                    # Module Hàng đợi tác vụ nền (Task Queue Service)
│   │   ├── queue.module.ts       # Đăng ký QueueModule toàn cục (@Global) để sử dụng ở mọi nơi.
│   │   └── task-queue.service.ts # Dịch vụ hàng đợi lai (BullMQ + In-Memory) xử lý gửi mail, nhắc nhở và kết xuất.
│   │
│   ├── upload/                   # Module Tải lên tệp an toàn (Secure File Upload Guardrail)
│   │   ├── upload.module.ts      # Khởi tạo mô-đun upload kèm theo liên kết xác thực JWT.
│   │   └── upload.controller.ts  # Endpoint xử lý tải lên an toàn (size limit, extension whitelist, đổi tên UUID) và serve tệp tin chống Stored XSS.
│   │
│   ├── sinh-vien/                # Module Phân hệ Sinh viên
│   │   ├── sinh-vien.module.ts   # Đăng ký controller sinh viên và nạp các Entity liên quan.
│   │   ├── sinh-vien.service.ts  # Xử lý logic đăng ký chuyến đi, gửi yêu cầu hoàn phí, nộp báo cáo.
│   │   └── sinh-vien.controller.ts # Các API dành cho sinh viên (đã được bảo vệ bởi AuthGuard/RolesGuard).
│   │
│   ├── giang-vien/               # Module Phân hệ Giảng viên
│   │   ├── giang-vien.module.ts  # Đăng ký controller giảng viên và nạp các Entity tương tác.
│   │   ├── giang-vien.service.ts # Xử lý chấm điểm bài thu hoạch, chấm hội đồng, điểm danh chuyến đi trực tiếp.
│   │   └── giang-vien.controller.ts # Các API dành cho giảng viên (bảo vệ quyền truy cập).
│   │
│   └── khoa/                     # Module Phân hệ Quản lý Khoa
│       ├── khoa.module.ts        # Đăng ký controller và liên kết các cơ sở dữ liệu.
│       ├── khoa.service.ts       # Xử lý tạo đợt, lên lịch trình, duyệt đề xuất, phân công GVHD và kết xuất Excel.
│       └── khoa.controller.ts    # Các API dành cho quản lý khoa (hỗ trợ phân trang, bộ lọc server-side).
│
├── package.json                  # Định nghĩa dependencies (NestJS, TypeORM, bcryptjs, bullmq, mssql).
├── tsconfig.json                 # Cấu hình biên dịch mã nguồn TypeScript.
└── .env                          # Tệp cấu hình môi trường kết nối database SQL Server, JWT, Redis.
```

### 2. Phân hệ Frontend (`/frontend`)
Ứng dụng giao diện người dùng đơn trang (SPA) xây dựng bằng thư viện ReactJS, tương thích hoàn toàn với React 19.

```text
frontend/
├── src/
│   ├── main.jsx                  # Điểm khởi chạy React, gắn ứng dụng vào file HTML gốc.
│   ├── App.jsx                   # Cấu hình danh sách Route điều hướng và quản lý quyền truy cập.
│   ├── App.css                   # Định nghĩa các tùy biến chung cho layout.
│   ├── index.css                 # Hệ thống CSS Tokens, chủ đề Forest Green và hiệu ứng hoạt họa.
│   │
│   ├── components/               # Các component dùng chung cho toàn hệ thống
│   │   ├── Layout.jsx            # Bố cục trang bao gồm Sidebar điều hướng động và Header hiển thị thông tin.
│   │   └── VirtualList.jsx       # Component ảo hóa danh sách (Virtual Scroll) giúp hiển thị mượt mà hàng ngàn dòng.
│   │
│   ├── services/
│   │   └── api.js                # Cấu hình Axios Client, tự động đính kèm Token Bearer JWT và tập hợp các hàm gọi API.
│   │
│   └── pages/                    # Chứa giao diện các phân hệ người dùng
│       ├── Login.jsx             # Giao diện đăng nhập và đổi mật khẩu cho lần đầu truy cập.
│       │
│       ├── sinh-vien/            # Giao diện Cổng Sinh viên
│       │   ├── DashBoard_SV.jsx      # Bảng điều khiển xem tiến độ chuyến đi và điểm số.
│       │   ├── DanhSachChuyen_SV.jsx # Đăng ký chuyến tham quan do khoa tổ chức.
│       │   ├── LichTrinhDoan_SV.jsx  # Xem chi tiết thông tin và lịch trình xe, giảng viên dẫn đoàn.
│       │   ├── LopHocPhan_SV.jsx     # Xem danh sách sinh viên cùng lớp học phần kiến tập.
│       │   ├── NopBaiThuHoach_SV.jsx # Tải tệp báo cáo thu hoạch và ảnh minh chứng lên máy chủ.
│       │   ├── ThanhToan_SV.jsx      # Xem hóa đơn và đóng lệ phí kiến tập.
│       │   ├── HoanPhi_SV.jsx        # Gửi đơn đề nghị hoàn phí trong trường hợp đặc biệt.
│       │   └── ThongBao_SV.jsx       # Xem thông báo từ ban quản lý khoa.
│       │
│       ├── giang-vien/           # Giao diện Cổng Giảng viên
│       │   ├── DashBoard_GV.jsx      # Xem danh sách sinh viên được phân công hướng dẫn.
│       │   ├── ChamBaiThuHoach_GV.jsx# Chấm điểm báo cáo trực tuyến của các sinh viên phụ trách.
│       │   ├── HoiDongCham_GV.jsx    # Nhập điểm hội đồng chấm báo cáo của nhóm sinh viên.
│       │   ├── LichTrinhDanDoan_GV.jsx# Điểm danh và theo dõi danh sách sinh viên đi kiến tập thực địa.
│       │   └── ThongBao_GV.jsx       # Xem các văn bản hướng dẫn/thông báo từ khoa.
│       │
│       └── khoa/                 # Giao diện Cổng Quản lý Khoa
│           ├── ChuyenThamQuan_DSLoc.jsx    # Quản lý chuyến tham quan, bộ lọc phân trang và cuộn vô hạn Virtual Scroll.
│           ├── DanhMuc_SinhVien_Khoa.jsx   # Quản lý danh mục sinh viên, nạp danh sách tự động qua file Excel thật.
│           ├── QuanLyLePhi_Khoa.jsx        # Quản lý đóng tiền, đối soát giao dịch ngân hàng qua tải lên tệp Excel.
│           ├── DuyetHoanPhi_Khoa.jsx       # Tiếp nhận lý do, xem ảnh minh chứng và phê duyệt đơn hoàn tiền.
│           ├── PhanCongGVHD_Khoa.jsx       # Phân công giáo viên hướng dẫn khóa luận/báo cáo thực tập.
│           ├── GiangVien_BoNhiem_Khoa.jsx  # Bổ nhiệm giảng viên dẫn đoàn hoặc cho phép chấm điểm hội đồng.
│           ├── HoiDongKienTap_TaoMoi_Khoa.jsx# Tạo lập hội đồng chấm điểm, thêm thành viên.
│           ├── ThongBao_Khoa.jsx           # Soạn thảo thông báo phân loại đối tượng nhận.
│           ├── DotKienTap_TaoMoi_Khoa.jsx  # Khởi tạo chiến dịch kiến tập cho học kỳ mới.
│           ├── DanhMuc_NhaMay_Khoa.jsx     # Quản lý danh bạ thông tin các doanh nghiệp/nhà máy liên kết.
│           ├── DanhMucNen_ThemMoiHocKy_Khoa.jsx # Thiết lập các tham số cơ sở như Năm học, Học kỳ, Khóa lớp.
│           ├── BaoCaoThongKe_Khoa.jsx      # Biểu đồ và thông số tổng kết chiến dịch.
│           └── XemTruocBaoCao_Khoa.jsx     # Xem trước danh sách chuẩn bị kết xuất báo cáo cuối đợt.
│
├── vite.config.js                # Cấu hình môi trường build ứng dụng Vite ReactJS.
└── package.json                  # Chứa thông tin thư viện sử dụng (React 19, Axios, Lucide Icons).
```

---

## 🛠️ YÊU CẦU MÔI TRƯỜNG & THƯ VIỆN

Để hệ thống hoạt động ổn định và đầy đủ chức năng, vui lòng chuẩn bị các môi trường sau:

1. **Node.js**: Phiên bản **20.19.0** trở lên (Khuyến nghị bản LTS v20 hoặc v22).
2. **Microsoft SQL Server**: Phiên bản **2016** trở lên. Cổng dịch vụ tiêu chuẩn mặc định là **1433**.
3. **Redis Server** (Tùy chọn):
   * Cổng mặc định **6379**.
   * Dùng để phục vụ cơ chế xử lý hàng đợi **BullMQ** cho việc xử lý các tác vụ ngầm (gửi mail, xuất tệp).
   * *Nếu không cài đặt Redis, Backend sẽ tự động phát hiện và chuyển đổi sang In-Memory Queue (Sử dụng luồng setTimeout) dưới nền để đảm bảo hệ thống vẫn khởi chạy bình thường và không bị lỗi kết nối.*

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### Bước 1: Khởi tạo Cơ sở dữ liệu (SQL Server)
1. Khởi chạy **SQL Server Management Studio (SSMS)** hoặc một chương trình quản trị CSDL tương đương.
2. Tạo cơ sở dữ liệu mới với tên `QLKienTap`:
   ```sql
   CREATE DATABASE QLKienTap;
   GO
   ```
3. Lần lượt chạy hai tệp tin SQL có sẵn trong thư mục `/DB` của dự án:
   * **[QLKienTap_Database.sql](DB/QLKienTap_Database.sql)**: Tạo cấu trúc các bảng, khóa ngoại và các index tối ưu hóa.
   * **[QLKienTap_ImportData.sql](DB/QLKienTap_ImportData.sql)**: Chèn dữ liệu mẫu cho Năm học, Nhà máy, Giảng viên, Sinh viên và Tài khoản đã được mã hóa mật khẩu bcrypt.

> [!IMPORTANT]
> **Lưu ý kết nối TCP/IP**: Hãy chắc chắn rằng bạn đã kích hoạt giao thức **TCP/IP** cho SQL Server instance của mình trong ứng dụng *SQL Server Configuration Manager* và đặt cổng Port là **1433** tại thẻ IPAll trước khi kết nối ứng dụng backend.

### Bước 2: Cấu hình và Chạy Backend (NestJS)
1. Truy cập vào thư mục `/backend`.
2. Tạo tệp cấu hình môi trường `.env` dựa theo mẫu `.env.example`:
   ```env
   # Kết nối CSDL SQL Server
   DB_HOST=localhost
   DB_PORT=1433
   DB_USERNAME=sa
   DB_PASSWORD=YourPasswordHere  # Thay bằng mật khẩu tài khoản sa của bạn
   DB_DATABASE=QLKienTap

   # Cấu hình Redis (Cho BullMQ - có thể để mặc định)
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Cấu hình Token Bảo mật JWT
   JWT_SECRET=default_secret_key_123456
   JWT_EXPIRES_IN=24h

   # Cổng chạy Backend
   PORT=3000
   ```
3. Mở cửa sổ Terminal tại thư mục `/backend` và khởi chạy các lệnh:
   ```bash
   # Cài đặt thư viện dependencies
   npm install

   # Chạy dự án ở chế độ phát triển
   npm run start:dev
   ```
   * *Thông báo chạy thành công: `🚀 Backend dang chay tai: http://localhost:3000/api`*

### Bước 3: Cấu hình và Chạy Frontend (ReactJS)
1. Mở một cửa sổ Terminal mới và truy cập vào thư mục `/frontend`.
2. Khởi chạy các lệnh để cài đặt và chạy UI:
   ```bash
   # Cài đặt thư viện dependencies
   npm install

   # Khởi động máy chủ phát triển
   npm run dev
   ```
   * *Truy cập giao diện ứng dụng thông qua đường dẫn mặc định: `http://localhost:5173/`*

---

## 🔑 THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP MẪU

Bạn có thể đăng nhập vào hệ thống bằng các tài khoản kiểm thử đại diện dưới đây:

| Phân hệ (Portal) | Tên tài khoản (Username) | Mật khẩu mặc định |
| :--- | :--- | :--- |
| **Quản lý khoa** | `admin01` | `AdminHuit2025` |
| **Giảng viên** | `gv001` (hoặc `gv002`, `gv003`) | `GvHuit2025` |
| **Sinh viên** | `2005200237` (hoặc `2005190573`, `2005191538`) | `SvHuit2025` |

> [!NOTE]
> Mật khẩu mặc định của các tài khoản đã được chuyển đổi mã hóa một chiều sang chuẩn `bcryptjs` an toàn trong cơ sở dữ liệu. Nhằm đảm bảo đúng quy trình nghiệp vụ, ở lần đăng nhập đầu tiên người dùng sẽ được yêu cầu đổi mật khẩu mới.