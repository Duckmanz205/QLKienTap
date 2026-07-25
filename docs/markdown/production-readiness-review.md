# Báo Cáo Phân Tích & Đánh Giá Độ Sẵn Sàng Deploy Production (Production Readiness Review)

**Dự án:** Hệ Thống Quản Lý Kiến Tập (QLKienTap)  
**Ngày thực hiện:** 25/07/2026  
**Vai trò:** Senior Software Architect, Security Engineer & Code Reviewer  

---

## 1. Executive Summary

- **Kết luận:** **`NO-GO`** (Chưa đủ điều kiện deploy lên Production).
- **Mức độ rủi ro tổng thể:** **RẤT CAO (CRITICAL)**.
- **Tóm tắt vấn đề:**
  Hệ thống được phát triển trên kiến trúc hiện đại (NestJS 11, TypeORM 1, SQL Server, Cloudflare R2 / Local fallback, BullMQ / In-Memory Queue), cấu trúc thư mục và phân chia các phân hệ (Auth, SinhVien, GiangVien, Khoa, Upload, Queue) rõ ràng.  
  Tuy nhiên, qua phân tích chuyên sâu toàn bộ source code backend và frontend, phát hiện một số **lỗi bảo mật nghiêm trọng (Critical Vulnerabilities)** về Phân quyền/Xác thực (Broken Access Control/IDOR), lộ dữ liệu cá nhân, **lỗi bất đồng bộ / Race Condition** khi sinh viên đăng ký chuyến đi đồng thời, và **thiếu Transaction** xử lý dữ liệu tiền tệ / hóa đơn.

### Các vấn đề nghiêm trọng nhất cần lưu ý:
1. **SEC-001 (Critical):** Endpoint `GET /api/auth/profile/:userId` và `PUT /api/auth/profile/:userId` hoàn toàn không có Guard bảo vệ (`AuthGuard`/`RolesGuard`). Bất kỳ người dùng vô danh nào cũng có thể đọc và sửa email/SĐT của bất kỳ tài khoản nào.
2. **SEC-002 (Critical):** Các API thuộc `SinhVienController` và `GiangVienController` chỉ kiểm tra vai trò chung qua `@Roles('SinhVien')` hoặc `@Roles('GiangVien')` mà **không kiểm tra quyền sở hữu (Ownership/IDOR)**. Sinh viên A có thể gửi `studentId` hoặc `invoiceId` của sinh viên B để xem dữ liệu, đăng ký chuyến thay, hủy chuyến hoặc thực hiện thanh toán hóa đơn.
3. **CONC-001 (Critical):** Nghiệp vụ `registerTrip` (Đăng ký chuyến tham quan) kiểm tra sức chứa (`currentRegs >= trip.suc_chua`) bằng câu lệnh `count` riêng biệt trước khi `save`, không sử dụng Database Transaction hoặc Pessimistic/Optimistic Lock. Khi có nhiều truy cập đồng thời (concurrency), hệ thống sẽ bị **Race Condition**, dẫn đến việc vượt quá sức chứa (Overbooking) và đăng ký trùng lịch.
4. **DB-001 (High):** Các thao tác ghi nhiều bảng liên quan (Tạo phiếu đăng ký + Hóa đơn lệ phí; Duyệt hủy + Hoàn phí + Thêm danh sách đen) chưa được bọc trong Database Transaction (`EntityManager.transaction` hoặc QueryRunner). Khi xảy ra lỗi giữa chừng sẽ gây mất đồng bộ dữ liệu.
5. **SEC-003 (High):** Secret Key của JWT vẫn sử dụng giá trị mặc định fallback (`default_secret_key_123456`) trong `AuthGuard` nếu biến môi trường chưa được thiết lập chuẩn.

---

## 2. Critical Issues (Lỗi Nghiêm Trọng)

### [SEC-001] Missing Guard / IDOR tại Auth Controller (`profile/:userId`)
- **Mức độ:** `Critical`
- **File & Dòng code:** [`backend/src/auth/auth.controller.ts:20-31`](file:///d:/DoAnTotNghiepCuNhan/HeThongQuanLyKienTap/backend/src/auth/auth.controller.ts#L20-L31)
- **Module/API:** `GET /api/auth/profile/:userId`, `PUT /api/auth/profile/:userId`
- **Mô tả vấn đề:**  
  Trong `AuthController`, các route lấy thông tin cá nhân và cập nhật thông tin cá nhân (`getProfile`, `updateProfile`) nhận tham số `userId` từ URL nhưng không khai báo `@UseGuards(AuthGuard)`.
- **Trường hợp lỗi:**  
  Kẻ tấn công không cần đăng nhập vẫn có thể duyệt danh sách `userId` từ 1 đến N để thu thập toàn bộ Email, Số điện thoại, Mã số sinh viên/mã giảng viên hoặc sửa đổi thông tin liên lạc của bất kỳ ai trong hệ thống.
- **Nguyên nhân gốc:** Thiếu decorator `@UseGuards(AuthGuard)` và không kiểm tra `req.user.sub === userId`.
- **Đề xuất sửa:**  
  1. Thêm `@UseGuards(AuthGuard)` cho `AuthController` hoặc các endpoint tương ứng.  
  2. Lấy `userId` trực tiếp từ JWT Payload (`req.user.sub`) thay vì tin tưởng tham số `:userId` từ Route Parameter.
- **Mức độ chắc chắn:** `100% Verified`.

---

### [SEC-002] Broken Access Control & IDOR trong SinhVienController và GiangVienController
- **Mức độ:** `Critical`
- **File & Dòng code:** 
  - [`backend/src/sinh-vien/sinh-vien.controller.ts:13-141`](file:///d:/DoAnTotNghiepCuNhan/HeThongQuanLyKienTap/backend/src/sinh-vien/sinh-vien.controller.ts#L13-L141)
  - [`backend/src/giang-vien/giang-vien.controller.ts:13-110`](file:///d:/DoAnTotNghiepCuNhan/HeThongQuanLyKienTap/backend/src/giang-vien/giang-vien.controller.ts#L13-L110)
- **Module/API:** 
  - `GET /api/sinh-vien/registered-trips/:studentId`
  - `POST /api/sinh-vien/register` (body: `studentId`)
  - `POST /api/sinh-vien/pay-invoice/:invoiceId`
  - `POST /api/sinh-vien/submit-report` (body: `studentId`)
  - `POST /api/giang-vien/grade-report` (body: `lecturerId`)
- **Mô tả vấn đề:**  
  Guard `@Roles('SinhVien')` chỉ xác thực rằng người dùng có vai trò là SinhVien, nhưng Controller sử dụng `studentId` hoặc `accountId` truyền từ Client Request (Query Param hoặc Request Body). Backend không kiểm tra xem `studentId` này có trùng khớp với ID của SinhVien đang đăng nhập hay không.
- **Trường hợp lỗi:**  
  Sinh viên A (đã đăng nhập) có thể đổi `studentId` trong Body thành ID của Sinh viên B để đăng ký chuyến đi, nộp bài thu hoạch thay B, hoặc xem danh sách phiếu đăng ký/hóa đơn của Sinh viên B. Giảng viên A có thể gửi `lecturerId` của Giảng viên B để chấm điểm bài báo cáo.
- **Nguyên nhân gốc:** Không giải mã token để lấy thông tin căn cước người dùng (`req.user`) và so sánh ownership trong Service/Guard.
- **Đề xuất sửa:**  
  - Sử dụng Custom Decorator `@CurrentUser()` để lấy thông tin tài khoản từ JWT (`req.user.sub`).
  - Trong Service, query thông tin `SinhVien`/`GiangVien` dựa trên `taikhoan_id = user.sub` thay vì nhận `studentId`/`lecturerId` từ Request Body/Param.
- **Mức độ chắc chắn:** `100% Verified`.

---

### [CONC-001] Race Condition & Double Booking khi đăng ký chuyến tham quan
- **Mức độ:** `Critical`
- **File & Dòng code:** [`backend/src/sinh-vien/sinh-vien.service.ts:167-245`](file:///d:/DoAnTotNghiepCuNhan/HeThongQuanLyKienTap/backend/src/sinh-vien/sinh-vien.service.ts#L167-L245)
- **Module/API:** `POST /api/sinh-vien/register`
- **Mô tả vấn đề:**  
  Khi sinh viên đăng ký chuyến đi, hàm `registerTrip` thực hiện các bước:
  1. `this.phieuRepo.count(...)` để đếm số lượng chỗ đã đăng ký.
  2. So sánh `currentRegs >= trip.suc_chua`.
  3. `this.phieuRepo.save(newPhieu)`.
  Các bước này chạy ở mức Read Committed cách biệt thông thường mà không có Transaction Lock.
- **Trường hợp lỗi:**  
  Khi mở đăng ký cho chuyến đi hot (ví dụ: sức chứa 30 người, còn 1 chỗ trống), nếu có 10 sinh viên bấm Đăng ký cùng 1 mili-giây, cả 10 request đều đếm được `currentRegs = 29` (< 30) và đều cho phép insert thành công. Kết quả chuyến đi bị đăng ký quá tải 38/30 sinh viên.
- **Nguyên nhân gốc:** Thiếu cơ chế Khóa bi quan (`Pessimistic Locking` / `SELECT ... WITH (UPDLOCK)`) hoặc Unique Constraint/Distributed Lock cho lượt đăng ký.
- **Đề xuất sửa:**  
  - Sử dụng TypeORM Transaction với `pessimistic_write` lock khi đọc thông tin chuyến đi:
    `queryRunner.manager.findOne(ChuyenThamQuan, { where: { id: tripId }, lock: { mode: 'pessimistic_write' } })`.
  - Thêm DB constraint / unique index nếu áp dụng.
- **Mức độ chắc chắn:** `100% Verified`.

---

## 3. High-Risk Issues (Rủi Ro Cao)

### [DB-001] Thiếu Transaction trong các thao tác dữ liệu đa bảng
- **Mức độ:** `High`
- **File & Dòng code:** 
  - [`backend/src/sinh-vien/sinh-vien.service.ts:225-243`](file:///d:/DoAnTotNghiepCuNhan/HeThongQuanLyKienTap/backend/src/sinh-vien/sinh-vien.service.ts#L225-L243)
  - [`backend/src/khoa/khoa.service.ts:389-421`](file:///d:/DoAnTotNghiepCuNhan/HeThongQuanLyKienTap/backend/src/khoa/khoa.service.ts#L389-L421)
- **Module/API:** `registerTrip`, `approveCancelRequest`, `scanAndMarkLatePayments`
- **Mô tả vấn đề:**  
  Trong `registerTrip`, code lưu `PhieuDangKy` thành công (`await this.phieuRepo.save(newPhieu)`), sau đó mới tạo và lưu `HoaDonLePhi` (`await this.hoaDonRepo.save(hoaDon)`). Nếu thao tác lưu `HoaDonLePhi` bị lỗi (mất kết nối DB, timeout), phiếu đăng ký đã được ghi vào DB nhưng không có hóa đơn tương ứng.
  Tương tự trong `approveCancelRequest`, cập nhật trạng thái yêu cầu hủy, phiếu đăng ký, hóa đơn và ghi danh sách đen diễn ra qua 4 câu lệnh `save` độc lập không có Transaction rollback.
- **Tác động:** Dữ liệu bị sai lệch, không nhất quán giữa các bảng nghiệp vụ.
- **Đề xuất sửa:**  
  Bọc tất cả các logic thao tác từ 2 bảng trở lên trong `dataSource.transaction(async transactionalEntityManager => { ... })`.
- **Mức độ chắc chắn:** `100% Verified`.

---

### [SEC-003] Fallback JWT Secret Cố Định Trong AuthGuard
- **Mức độ:** `High`
- **File & Dòng code:** [`backend/src/auth/guards/auth.guard.ts:30`](file:///d:/DoAnTotNghiepCuNhan/HeThongQuanLyKienTap/backend/src/auth/guards/auth.guard.ts#L30)
- **Module/API:** Global Authentication Guard
- **Mô tả vấn đề:**  
  Code sử dụng: `this.configService.get<string>('JWT_SECRET', 'default_secret_key_123456')`. Nếu môi trường Production quên khai báo biến `JWT_SECRET` trong `.env`, hệ thống sẽ âm thầm dùng khóa mặc định. Kẻ tấn công có thể tự rèn (forge) JWT token với bất kỳ vai trò nào (`QuanLyKhoa`, `SinhVien`) để chiếm quyền điều khiển hệ thống.
- **Đề xuất sửa:**  
  Ném Exception ngắt ứng dụng ngay khi khởi chạy (`bootstrap`) nếu biến `JWT_SECRET` không được định nghĩa hoặc có giá trị mặc định dễ đoán.
- **Mức độ chắc chắn:** `100% Verified`.

---

### [SEC-004] CORS Cấu Hình Cố Định Cho Localhost
- **Mức độ:** `High`
- **File & Dòng code:** [`backend/src/main.ts:9-13`](file:///d:/DoAnTotNghiepCuNhan/HeThongQuanLyKienTap/backend/src/main.ts#L9-L13)
- **Module/API:** Server Main Setup
- **Mô tả vấn đề:**  
  Origin của CORS đang bị hardcode: `origin: ['http://localhost:5173', 'http://localhost:3000']`. Khi đưa lên Production trên tên miền thật (ví dụ: `https://kientap.edu.vn`), Frontend trên domain thật sẽ bị chặn CORS, hoặc nếu đổi thành `*` kèm `credentials: true` sẽ gây lỗi bảo mật CORS misconfiguration.
- **Đề xuất sửa:**  
  Đọc origin từ biến môi trường `CORS_ORIGIN` (tách bởi dấu phẩy) trong `.env`.
- **Mức độ chắc chắn:** `100% Verified`.

---

### [QUEUE-001] Stub/Mock Background Job trong Queue Service
- **Mức độ:** `High`
- **File & Dòng code:** [`backend/src/queue/task-queue.service.ts:119-135`](file:///d:/DoAnTotNghiepCuNhan/HeThongQuanLyKienTap/backend/src/queue/task-queue.service.ts#L119-L135)
- **Module/API:** `TaskQueueService`
- **Mô tả vấn đề:**  
  Các hàm xử lý job nền như `handleSendEmail`, `handleSendReminder`, `handleExportFile` hiện chỉ là code giả định (Stub) dùng `setTimeout` và `logger.log` mà chưa thực sự gửi email qua SMTP/Nodemailer hay xuất file Excel thật lưu vào thư mục storage.
- **Tác động:** Chức năng xuất file sinh viên (`exportStudentList`) thông báo với người dùng đã đưa vào queue, nhưng file thực tế không được tạo ra, dẫn đến đường dẫn download bị lỗi 404.
- **Đề xuất sửa:**  
  Cần hoàn thiện module kết nối Nodemailer và thư viện ExcelJS/xlsx trong `TaskQueueService`.
- **Mức độ chắc chắn:** `100% Verified`.

---

## 4. Medium / Low-Risk Issues (Rủi Ro Trung Bình & Thấp)

1. **[PERF-001] Low:** `getAvailableTrips` trong `SinhVienService` thực hiện query `count` phiếu đăng ký bên trong vòng lặp `for (const trip of trips)`. Nếu có 50 chuyến đi mở đăng ký, hệ thống sẽ thực hiện 51 câu truy vấn SQL (N+1 query problem).
   - *Khuyến nghị:* Dùng `GROUP BY chuyen_tham_quan_id` trong 1 câu query duy nhất.
2. **[SEC-005] Medium:** Route `GET /api/upload/file/:type/:filename` trong `UploadController` phục vụ file local mà không kiểm tra quyền đăng nhập hoặc sở hữu file (ví dụ: minh chứng hoàn phí, bài thu hoạch PDF).
   - *Khuyến nghị:* Áp dụng `AuthGuard` cho các file nhạy cảm.
3. **[CFG-001] Low:** Trạng thái `synchronize` trong TypeORM thiết lập `false` (Đúng chuẩn), tuy nhiên chưa thấy các file Migration script trong thư mục `src/migrations`.

---

## 5. Production Configuration Checklist

| Hạng mục kiểm tra | Trạng thái | Ghi chú |
| :--- | :--- | :--- |
| **Environment Production** | `FAIL` | Cần thiết lập `NODE_ENV=production` |
| **Debug Mode** | `PASS` | Đã tắt log debug thừa trong Production |
| **Secret Keys (JWT/API Keys)** | `FAIL` | Đang dùng JWT Secret fallback cố định |
| **Database Credentials** | `PASS` | Lấy từ `.env` |
| **CORS Domain Config** | `FAIL` | Đang hardcode `localhost` |
| **Global Validation Pipe** | `PASS` | Đã bật `whitelist: true, transform: true` |
| **Rate Limiting (Throttler)** | `FAIL` | Chưa cài đặt `@nestjs/throttler` chống Spam/DDoS |
| **File Storage Config (R2)** | `PASS` | Có cơ chế fallback linh hoạt |
| **Queue Worker (Redis)** | `PASS` | Có cơ chế fallback In-Memory khi chưa bật Redis |

---

## 6. Missing Tests (Các Test Cần Bổ Sung)

1. **Unit Test / Integration Test cho Auth & IDOR:**
   - Test kiểm tra Sinh viên A không được phép lấy dữ liệu của Sinh viên B (`GET /api/sinh-vien/registered-trips/:studentId`).
   - Test truy cập `GET /api/auth/profile/:userId` không có token trả về HTTP 401.
2. **Concurrency / Race Condition Test:**
   - Integration test giả lập 20 concurrent requests cùng đăng ký 1 chuyến đi có sức chứa 5 người. Kiểm tra kết quả chỉ đúng 5 phiếu hợp lệ.
3. **Transaction Rollback Test:**
   - Test việc ném lỗi khi lưu Hóa đơn phải rollback Phiếu đăng ký tương ứng.

---

## 7. Deployment Risks (Nguy Cơ Khi Deploy)

1. **Nguy cơ sai lệch dữ liệu thanh toán & đăng ký:** Khi số lượng sinh viên truy cập lớn trong ngày mở đăng ký kiến tập, thiếu Locking sẽ làm vỡ số lượng sinh viên quy định của nhà máy.
2. **Nguy cơ rò rỉ dữ liệu cá nhân:** Do các endpoint Auth và SinhVien bị lỗi IDOR, thông tin MSSV, Email, SĐT giảng viên/sinh viên dễ bị cào (scrape) công khai.

---

## 8. Recommended Fix Plan (Kế Hoạch Sửa Lỗi Đề Xuất)

### Bước 1: Phải sửa trước Production (Bắt buộc)
1. Thêm `AuthGuard` và sửa logic lấy ID người dùng từ `req.user.sub` cho `AuthController`, `SinhVienController`, `GiangVienController` (Giải quyết `SEC-001` & `SEC-002`).
2. Thêm Transaction & Pessimistic Lock cho hàm `registerTrip` trong `SinhVienService` (Giải quyết `CONC-001`).
3. Đưa tất cả thao tác ghi dữ liệu liên quan nhiều bảng vào Database Transaction (Giải quyết `DB-001`).
4. Ép buộc khai báo `JWT_SECRET` và `CORS_ORIGIN` trong môi trường Production, xóa bỏ fallback secret cố định (Giải quyết `SEC-003`, `SEC-004`).

### Bước 2: Nên sửa trước Production
1. Cài đặt `@nestjs/throttler` để giới hạn tần suất request (Rate Limiting) cho các API public và API đăng ký.
2. Tối ưu hóa N+1 Query trong `getAvailableTrips`.
3. Hoàn thiện code xuất file Excel thật trong `TaskQueueService`.

---
*Báo cáo được lập bởi Senior Software Architect & Security Engineer.*
