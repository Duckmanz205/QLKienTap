# Đề xuất Hướng bảo mật và Tối ưu hóa Hiệu năng (QLKienTap)

Tài liệu này đánh giá hiện trạng bảo mật và hiệu năng của hệ thống **Quản lý kiến tập (QLKienTap)** dựa trên mã nguồn frontend, backend hiện tại và cấu trúc cơ sở dữ liệu, từ đó đề xuất các giải pháp kỹ thuật theo tiêu chuẩn công nghiệp.

---

## I. Hiện trạng & Các rủi ro hệ thống (Security & Performance Risks)

### A. Rủi ro về Bảo mật (Security Vulnerabilities)
1. **Mật khẩu lưu dạng Plaintext / So sánh trực tiếp:**
   * Trong `auth.service.ts`, mật khẩu được kiểm tra trực tiếp: `user.mat_khau_hash === mat_khau` mà không qua giải thuật mã hóa một chiều.
   * Dữ liệu import mẫu (`QLKienTap_ImportData.sql`) đang lưu mật khẩu thô dạng văn bản thường (plaintext).
2. **Cơ chế Token giả lập (Mock Token):**
   * Backend hiện đang trả về token tĩnh dạng: `mock-jwt-token-for-user-${user.id}`. Chuỗi này không được ký số (signature) và không có hạn sử dụng, rất dễ bị giả mạo.
3. **Thiếu các lớp bảo vệ API (Guards/Middleware):**
   * Các Controller (như `GiangVienController`, `SinhVienController`, `AuthController`) hoàn toàn không sử dụng Guard (như `@UseGuards(JwtAuthGuard)`).
   * Bất kỳ ai cũng có thể truy cập trực tiếp các endpoint nhạy cảm (ví dụ: lấy danh sách sinh viên, chấm điểm, phê duyệt đề xuất, khóa điểm) chỉ bằng cách thay đổi mã định danh trên URL hoặc Body.
4. **Lỗ hổng Upload tệp tin (File Upload Vulnerabilities):**
   * Hệ thống cho phép sinh viên nộp báo cáo (`file_bao_cao`), file minh chứng (`file_minh_chung`), và hóa đơn (`file_don_da_duyet`) mà chưa có cơ chế kiểm tra định dạng tệp (MIME type, Extension) và giới hạn dung lượng ở tầng backend.
5. **Rò rỉ thông tin nhạy cảm:**
   * Thông tin tài khoản trả về từ API bao gồm cả trường mật khẩu hoặc các thông tin cấu hình nhạy cảm.

### B. Rủi ro về Hiệu năng khi Dữ liệu Lớn (Scalability & Performance Risks)
6. **Quá tải đường truyền và Timeout phía Server:**
   * Các API truy vấn danh sách (như danh sách sinh viên, phiếu đăng ký, kết quả học phần) hiện đang lấy toàn bộ bản ghi từ database (fetch all) trong một truy vấn duy nhất.
   * Khi dữ liệu tăng lên hàng chục nghìn bản ghi, việc này sẽ chiếm dụng lượng lớn RAM của NestJS, gây tắc nghẽn đường truyền mạng và dẫn đến lỗi Gateway Timeout (504).
7. **Lag giao diện người dùng (Frontend Rendering Bottleneck):**
   * Phía ReactJS nếu render đồng thời hàng nghìn DOM elements (ví dụ ở trang Ma trận điểm hoặc Quản lý sinh viên) sẽ gây ra hiện tượng đơ giật màn hình (UI Lag), giảm nghiêm trọng trải nghiệm người dùng.
8. **Nghẽn tác vụ đồng bộ (Blocking Main Thread):**
   * Các thao tác nặng như tạo hàng loạt hàng đợi nhắc nhở (`NhacNho`), xử lý tệp đối soát hóa đơn excel hoặc xuất báo cáo thống kê CSV cho toàn bộ khóa học nếu xử lý đồng bộ trên tiến trình chính của NestJS sẽ làm nghẽn toàn bộ các request khác đến server.

---

## II. Đề xuất Giải pháp Phát triển

### 1. Giải pháp Bảo mật (Security Implementation)
* **Mã hóa mật khẩu bằng bcrypt:** Sử dụng `bcrypt.compare()` đối chiếu mật khẩu và hash trước khi lưu. Thay thế mật khẩu mẫu plaintext trong file SQL import bằng mật khẩu đã hash.
* **Áp dụng JWT thực tế:** Tích hợp `@nestjs/jwt` để ký token bằng thuật toán HMAC SHA256 kèm theo hạn sử dụng và khóa bí mật lưu ở file `.env`.
* **Phân quyền RBAC:** Triển khai `RolesGuard` bảo vệ các endpoint theo vai trò (`QuanLyKhoa`, `GiangVien`, `SinhVien`).
* **Bảo vệ File Upload:** Kiểm tra kích thước và extension của tệp tải lên (chỉ cho phép `.pdf` đối với báo cáo, `.jpg/.png` đối với minh chứng). Đổi tên file ngẫu nhiên (UUID) để tránh ghi đè và lỗi Path Traversal.

### 2. Giải pháp Tối ưu hóa Hiệu năng & Dữ liệu lớn (Performance Optimization)
* **Phân trang phía Server (Server-side Pagination & Filtering):**
  * Áp dụng cơ chế phân trang (Offset hoặc Cursor-based) cho tất cả các API danh sách. Frontend chỉ gửi yêu cầu tải một lượng dữ liệu vừa đủ (ví dụ: `page=1&limit=20`).
  * Thực hiện việc tìm kiếm, lọc dữ liệu trực tiếp dưới database bằng cách chuyển tham số xuống truy vấn SQL, thay vì lọc trên bộ nhớ của server.
* **Tối ưu hóa Cơ sở dữ liệu (Database Indexing):**
  * Tạo thêm các Index trên SQL Server cho các trường thường xuyên dùng để lọc (`WHERE`), sắp xếp (`ORDER BY`) hoặc kết nối (`JOIN`) như: `sinh_vien_id`, `lich_kien_tap_id`, `trang_thai`, `ngay_dang_ky`.
* **Kỹ thuật hiển thị Virtual Scrolling ở Frontend:**
  * Sử dụng các thư viện như `react-window` hoặc `react-virtualized` cho các danh sách lớn (như ma trận điểm sinh viên). Cơ chế này chỉ render các dòng đang hiển thị trên màn hình và tái sử dụng DOM, loại bỏ hoàn toàn tình trạng lag trình duyệt.
* **Quản lý Cache phía Client:**
  * Tích hợp `React Query` (TanStack Query) hoặc `SWR` để cache dữ liệu ở client, tự động fetch lại dưới nền và giảm số lượng request thừa lên server.
* **Hàng đợi tác vụ nền bất đồng bộ (Queueing & Background Jobs):**
  * Sử dụng hệ thống hàng đợi như `BullMQ` (chạy trên nền Redis) cho các tác vụ tốn thời gian (gửi nhắc nhở hàng loạt, xuất báo cáo CSV lớn, xử lý file import).
  * API sẽ lập tức phản hồi trạng thái "Đang xử lý" kèm theo Job ID để client theo dõi tiến trình qua WebSocket, giúp server tránh bị timeout.

---

## III. Kế hoạch Triển khai Khuyến nghị

| Giai đoạn | Nội dung thực hiện | Mức độ ưu tiên |
| :--- | :--- | :--- |
| **Giai đoạn 1** | Tích hợp `bcrypt` mã hóa mật khẩu; Cập nhật seed data SQL; Cấu hình môi trường `.env`. | **Cao** |
| **Giai đoạn 2** | Triển khai phân trang Server-side cho API Sinh viên/Giảng viên/Khoa; Viết lại câu lệnh truy vấn có index tối ưu. | **Cao** |
| **Giai đoạn 3** | Cấu hình `@nestjs/jwt`, `RolesGuard` phân quyền; Tích hợp Virtual Scrolling cho các danh sách lớn trên ReactJS. | **Trung bình** |
| **Giai đoạn 4** | Xây dựng hàng rào bảo mật tệp upload; Tích hợp `BullMQ` xử lý hàng đợi tác vụ nền gửi mail/nhắc nhở và xuất file. | **Thấp** |
