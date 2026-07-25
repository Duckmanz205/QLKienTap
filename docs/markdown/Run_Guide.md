# HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG QUẢN LÝ KIẾN TẬP - HUIT

Tài liệu này hướng dẫn chi tiết các bước để thiết lập cơ sở dữ liệu Microsoft SQL Server, cấu hình và chạy cả hai phần Backend (NestJS) và Frontend (ReactJS) trên máy tính của bạn.

---

## BƯỚC 1: Thiết lập Cơ sở dữ liệu (SQL Server)

Hệ thống sử dụng hệ quản trị cơ sở dữ liệu **Microsoft SQL Server**.

1. Mở ứng dụng **SQL Server Management Studio (SSMS)** hoặc công cụ quản lý cơ sở dữ liệu tương tự.
2. Kết nối tới SQL Server instance của bạn.
3. Tạo cơ sở dữ liệu mới mang tên `QLKienTap`:
   ```sql
   CREATE DATABASE QLKienTap;
   GO
   ```
4. Chọn database `QLKienTap` vừa tạo và chạy file cấu trúc bảng:
   - Mở tệp tin [QLKienTap_Database.sql](DB/QLKienTap_Database.sql) và thực thi (Execute) toàn bộ script để tạo các bảng dữ liệu và ràng buộc liên quan.
5. Tiếp tục chạy file nạp dữ liệu mẫu:
   - Mở tệp tin [QLKienTap_ImportData.sql](DB/QLKienTap_ImportData.sql) và thực thi (Execute) toàn bộ nội dung để điền dữ liệu mẫu (thông tin các chuyến tham quan thực tế, giảng viên và sinh viên trường HUIT).

> [!IMPORTANT]
> **Kích hoạt kết nối TCP/IP cho SQL Server (Nếu gặp lỗi kết nối)**:
>
> 1. Nhấp tổ hợp phím `Win + R`, nhập `SQLServerManager16.msc` (hoặc phiên bản tương ứng trên máy bạn như `SQLServerManager15.msc`...) để mở **SQL Server Configuration Manager**.
> 2. Truy cập **SQL Server Network Configuration** -> **Protocols for MSSQLSERVER** (hoặc **Protocols for SQLEXPRESS**).
> 3. Click đúp vào **TCP/IP** và đổi trạng thái **Enabled** thành **Yes**.
> 4. Chuyển qua tab **IP Addresses**, kéo xuống cuối cùng ở phần **IPAll**, điền cổng **1433** tại ô **TCP Port**. Nhấp OK.
> 5. Trở lại phần **SQL Server Services**, click chuột phải vào instance SQL Server của bạn và chọn **Restart**.

---

## BƯỚC 2: Cấu hình và Khởi chạy Backend (NestJS)

1. Mở tệp cấu hình môi trường [.env](backend/.env) trong thư mục `/backend`.
2. Kiểm tra và chỉnh sửa cấu hình kết nối SQL Server của bạn (đặc biệt là mật khẩu của tài khoản `sa`):
   ```env
   DB_HOST=localhost
   DB_PORT=1433
   DB_USERNAME=sa
   DB_PASSWORD=YourPasswordHere  # Nhập mật khẩu SQL Server của bạn vào đây
   DB_DATABASE=QLKienTap
   PORT=3000
   ```
3. Mở terminal tại thư mục `/backend`, thực hiện cài đặt thư viện và khởi chạy:
   ```bash
   npm install
   npm run start:dev
   ```

   - _Backend chạy thành công khi xuất hiện thông báo: `🚀 Backend dang chay tai: http://localhost:3000/api`_

---

## BƯỚC 3: Khởi chạy Frontend (ReactJS)

1. Mở một cửa sổ terminal mới tại thư mục `/frontend`.
2. Thực hiện cài đặt các thư viện cần thiết và chạy ứng dụng:
   ```bash
   npm install
   npm run dev
   ```

   - _Màn hình console sẽ xuất hiện liên kết chạy thử: `http://localhost:5173/`_

---

## BƯỚC 4: Thông tin tài khoản đăng nhập chạy thử

Hệ thống đã được thiết kế một cơ chế đăng nhập thông minh hỗ trợ phát triển. Đối với các tài khoản trong file dữ liệu mẫu (có mật khẩu dạng placeholder), bạn có thể sử dụng các thông tin đăng nhập mẫu dưới đây:

| Vai trò          | Tên đăng nhập (Username)                       | Mật khẩu mặc định |
| :--------------- | :--------------------------------------------- | :---------------- |
| **Quản lý khoa** | `admin01`                                      | `AdminHuit2025`   |
| **Giảng viên**   | `gv001` (hoặc `gv002`, `gv003`)                | `GvHuit2025`      |
| **Sinh viên**    | `2005200237` (hoặc `2005190573`, `2005191538`) | `SvHuit2025`      |

_(Lưu ý: Đối với tài khoản lần đầu đăng nhập, hệ thống sẽ tự động yêu cầu cập nhật mật khẩu mới trước khi cho phép vào giao diện tính năng chính)._
