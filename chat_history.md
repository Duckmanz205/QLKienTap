# Lịch sử trò chuyện ngày 14/07/2026

## 1. Clone mã nguồn

**Người dùng:**

> clone source main của repo https://github.com/Duckmanz205/QLKienTap.git về.

**Antigravity:**

- Đã chạy lệnh clone thành công nhánh `main` của repository về thư mục `d:\DoAnTotNghiepCuNhan\HeThongQuanLyKienTap`.
- Cấu trúc dự án gồm:
  - Thư mục `backend`: NestJS.
  - Thư mục `frontend`: Vite.

---

## 2. Viết mô tả chi tiết các bảng trong CSDL

**Người dùng:**

> Task: Viết mô tả (STT, Tên cột, Kiểu dữ liệu, Mô tả) để tôi tự copy paste thủ công vào file word.
> Source: QKienTap_Database.sql
> Lưu ý: Dựa vào source sql để hoàn thành task, không đụng vào code hay bất kì file nào khác, bạn chỉ cần đưa thông tin ra để tôi tự copy paste thủ công, không tự ý copy paste tự động vào file docx.

**Antigravity:**
Đã cung cấp danh sách mô tả chi tiết của 32 bảng cơ sở dữ liệu dưới dạng bảng biểu Markdown để người dùng sao chép thủ công:

### 1. Bảng: `NamHoc` (Danh mục năm học)

| STT | Tên cột         | Kiểu dữ liệu   | Mô tả                                                                   |
| :-- | :-------------- | :------------- | :---------------------------------------------------------------------- |
| 1   | `id`            | `INT`          | ID tự tăng (Khóa chính), mã định danh duy nhất của năm học.             |
| 2   | `ten_nam_hoc`   | `NVARCHAR(20)` | Tên năm học, giá trị duy nhất và không được để trống (vd: '2025-2026'). |
| 3   | `ngay_bat_dau`  | `DATE`         | Ngày bắt đầu năm học.                                                   |
| 4   | `ngay_ket_thuc` | `DATE`         | Ngày kết thúc năm học (phải lớn hơn ngày bắt đầu).                      |

### 2. Bảng: `HocKy` (Danh mục học kỳ)

| STT | Tên cột         | Kiểu dữ liệu   | Mô tả                                               |
| :-- | :-------------- | :------------- | :-------------------------------------------------- |
| 1   | `id`            | `INT`          | ID tự tăng (Khóa chính), mã định danh của học kỳ.   |
| 2   | `nam_hoc_id`    | `INT`          | ID năm học (Khóa ngoại liên kết tới bảng `NamHoc`). |
| 3   | `ten_hoc_ky`    | `NVARCHAR(20)` | Tên học kỳ (vd: 'Học kỳ 1').                        |
| 4   | `ngay_bat_dau`  | `DATE`         | Ngày bắt đầu học kỳ.                                |
| 5   | `ngay_ket_thuc` | `DATE`         | Ngày kết thúc học kỳ (phải lớn hơn ngày bắt đầu).   |

### 3. Bảng: `Khoa` (Danh mục khóa học của sinh viên)

| STT | Tên cột        | Kiểu dữ liệu   | Mô tả                                                       |
| :-- | :------------- | :------------- | :---------------------------------------------------------- |
| 1   | `id`           | `INT`          | ID tự tăng (Khóa chính), mã định danh của khóa học.         |
| 2   | `ten_khoa`     | `NVARCHAR(20)` | Tên khóa học, giá trị duy nhất (vd: '14ĐHTP', '13ĐHTP'...). |
| 3   | `nam_nhap_hoc` | `INT`          | Năm nhập học của khóa tương ứng.                            |

### 4. Bảng: `TaiKhoan` (Quản lý tài khoản đăng nhập hệ thống)

| STT | Tên cột              | Kiểu dữ liệu    | Mô tả                                                                                       |
| :-- | :------------------- | :-------------- | :------------------------------------------------------------------------------------------ |
| 1   | `id`                 | `INT`           | ID tự tăng (Khóa chính), mã định danh tài khoản.                                            |
| 2   | `ten_dang_nhap`      | `NVARCHAR(50)`  | Tên đăng nhập hệ thống (duy nhất).                                                          |
| 3   | `mat_khau_hash`      | `NVARCHAR(255)` | Chuỗi mật khẩu đã được mã hóa.                                                              |
| 4   | `vai_tro`            | `NVARCHAR(20)`  | Vai trò người dùng (`QuanLyKhoa`, `GiangVien`, `SinhVien`).                                 |
| 5   | `trang_thai`         | `NVARCHAR(20)`  | Trạng thái tài khoản (`HoatDong`, `KhoaTaiKhoan`). Mặc định: `HoatDong`.                    |
| 6   | `phai_doi_mat_khau`  | `BIT`           | Cờ ép buộc người dùng đổi mật khẩu ở lần đăng nhập đầu tiên (1: Có, 0: Không). Mặc định: 1. |
| 7   | `lan_dang_nhap_cuoi` | `DATETIME2`     | Thời điểm cuối cùng tài khoản đăng nhập vào hệ thống.                                       |
| 8   | `ngay_tao`           | `DATETIME2`     | Ngày giờ khởi tạo tài khoản trên hệ thống.                                                  |

### 5. Bảng: `SinhVien` (Thông tin chi tiết sinh viên)

| STT | Tên cột       | Kiểu dữ liệu    | Mô tả                                                                               |
| :-- | :------------ | :-------------- | :---------------------------------------------------------------------------------- |
| 1   | `id`          | `INT`           | ID tự tăng (Khóa chính), định danh sinh viên.                                       |
| 2   | `mssv`        | `NVARCHAR(15)`  | Mã số sinh viên (duy nhất).                                                         |
| 3   | `ho_ten`      | `NVARCHAR(100)` | Họ và tên đầy đủ của sinh viên.                                                     |
| 4   | `taikhoan_id` | `INT`           | ID tài khoản liên kết (Khóa ngoại liên kết bảng `TaiKhoan`, duy nhất).              |
| 5   | `khoa_id`     | `INT`           | ID khóa học (Khóa ngoại liên kết bảng `Khoa`).                                      |
| 6   | `ten_lop`     | `NVARCHAR(20)`  | Tên lớp sinh hoạt của sinh viên.                                                    |
| 7   | `email`       | `NVARCHAR(100)` | Địa chỉ thư điện tử cá nhân hoặc của trường cấp.                                    |
| 8   | `sdt`         | `NVARCHAR(15)`  | Số điện thoại liên lạc.                                                             |
| 9   | `hoc_lai`     | `BIT`           | Cờ đánh dấu sinh viên đăng ký học lại khóa cũ (1: Học lại, 0: Học đi). Mặc định: 0. |

### 6. Bảng: `GiangVien` (Thông tin chi tiết giảng viên)

| STT | Tên cột                  | Kiểu dữ liệu    | Mô tả                                                                       |
| :-- | :----------------------- | :-------------- | :-------------------------------------------------------------------------- |
| 1   | `id`                     | `INT`           | ID tự tăng (Khóa chính), định danh giảng viên.                              |
| 2   | `ma_gv`                  | `NVARCHAR(15)`  | Mã giảng viên (duy nhất).                                                   |
| 3   | `ho_ten`                 | `NVARCHAR(100)` | Họ và tên đầy đủ của giảng viên.                                            |
| 4   | `taikhoan_id`            | `INT`           | ID tài khoản liên kết (Khóa ngoại liên kết bảng `TaiKhoan`, duy nhất).      |
| 5   | `email`                  | `NVARCHAR(100)` | Địa chỉ thư điện tử của giảng viên.                                         |
| 6   | `sdt`                    | `NVARCHAR(15)`  | Số điện thoại liên lạc.                                                     |
| 7   | `du_dk_hoi_dong`         | `BIT`           | Đủ điều kiện tham gia hội đồng chấm báo cáo (1: Đủ, 0: Không). Mặc định: 0. |
| 8   | `so_sv_toi_da_huong_dan` | `INT`           | Hạn ngạch (quota) số lượng sinh viên tối đa được phép hướng dẫn trong đợt.  |

### 7. Bảng: `NhaMay` (Danh sách doanh nghiệp/nhà máy đối tác)

| STT | Tên cột             | Kiểu dữ liệu    | Mô tả                                                                             |
| :-- | :------------------ | :-------------- | :-------------------------------------------------------------------------------- |
| 1   | `id`                | `INT`           | ID tự tăng (Khóa chính), định danh nhà máy.                                       |
| 2   | `ten_nha_may`       | `NVARCHAR(150)` | Tên đầy đủ của nhà máy/doanh nghiệp.                                              |
| 3   | `dia_chi`           | `NVARCHAR(255)` | Địa chỉ trụ sở chính/nhà xưởng.                                                   |
| 4   | `nhom_nganh`        | `NVARCHAR(50)`  | Nhóm ngành hoạt động (vd: 'Đồ uống', 'Sữa - dầu - chất béo'...).                  |
| 5   | `ho_tro_truc_tiep`  | `BIT`           | Hỗ trợ tham quan/kiến tập trực tiếp tại nhà máy (1: Có, 0: Không). Mặc định: 1.   |
| 6   | `ho_tro_truc_tuyen` | `BIT`           | Hỗ trợ tham quan/kiến tập trực tuyến (1: Có, 0: Không). Mặc định: 0.              |
| 7   | `trang_thai`        | `NVARCHAR(20)`  | Trạng thái hợp tác của nhà máy (`HoatDong`, `NgungHopTac`). Mặc định: `HoatDong`. |

### 8. Bảng: `ThongBao` (Quản lý các thông báo từ Khoa)

| STT | Tên cột        | Kiểu dữ liệu    | Mô tả                                                                                    |
| :-- | :------------- | :-------------- | :--------------------------------------------------------------------------------------- |
| 1   | `id`           | `INT`           | ID tự tăng (Khóa chính), định danh bài thông báo.                                        |
| 2   | `tieu_de`      | `NVARCHAR(255)` | Tiêu đề của thông báo.                                                                   |
| 3   | `noi_dung`     | `NVARCHAR(MAX)` | Nội dung chi tiết bài thông báo.                                                         |
| 4   | `nguoi_gui_id` | `INT`           | ID tài khoản người gửi (Khóa ngoại liên kết bảng `TaiKhoan`).                            |
| 5   | `khoa_id`      | `INT`           | ID khóa nhận thông báo (Khóa ngoại liên kết bảng `Khoa`, NULL nếu gửi toàn bộ các khoa). |
| 6   | `ngay_gui`     | `DATETIME2`     | Thời gian gửi thông báo lên hệ thống.                                                    |
| 7   | `da_chinh_sua` | `BIT`           | Cờ đánh dấu thông báo đã bị chỉnh sửa hay chưa (1: Đã sửa, 0: Chưa sửa).                 |

### 9. Bảng: `ThongBaoFile` (Tệp tin đính kèm của thông báo)

| STT | Tên cột         | Kiểu dữ liệu    | Mô tả                                                              |
| :-- | :-------------- | :-------------- | :----------------------------------------------------------------- |
| 1   | `id`            | `INT`           | ID tự tăng (Khóa chính), định danh file đính kèm.                  |
| 2   | `thongbao_id`   | `INT`           | ID bài thông báo sở hữu tệp (Khóa ngoại liên kết bảng `ThongBao`). |
| 3   | `ten_file`      | `NVARCHAR(255)` | Tên của tệp tin hiển thị trên giao diện.                           |
| 4   | `duong_dan`     | `NVARCHAR(500)` | Đường dẫn lưu trữ vật lý của file trên máy chủ.                    |
| 5   | `dung_luong_kb` | `INT`           | Dung lượng tệp đính kèm (tính bằng KB).                            |

### 10. Bảng: `ThongBaoDaDoc` (Theo dõi xem/đọc thông báo của người dùng)

| STT | Tên cột       | Kiểu dữ liệu | Mô tả                                                            |
| :-- | :------------ | :----------- | :--------------------------------------------------------------- |
| 1   | `id`          | `INT`        | ID tự tăng (Khóa chính), định danh lượt đọc.                     |
| 2   | `thongbao_id` | `INT`        | ID thông báo đã đọc (Khóa ngoại liên kết bảng `ThongBao`).       |
| 3   | `taikhoan_id` | `INT`        | ID tài khoản người đã đọc (Khóa ngoại liên kết bảng `TaiKhoan`). |
| 4   | `ngay_doc`    | `DATETIME2`  | Thời điểm người dùng nhấn xem thông báo.                         |

### 11. Bảng: `NhacNho` (Hàng đợi nhắc nhở tự động cho sinh viên/giảng viên)

| STT | Tên cột            | Kiểu dữ liệu    | Mô tả                                                                                                                      |
| :-- | :----------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------- |
| 1   | `id`               | `INT`           | ID tự tăng (Khóa chính), định danh nhắc nhở.                                                                               |
| 2   | `taikhoan_id`      | `INT`           | ID tài khoản nhận tin nhắc nhở (Khóa ngoại liên kết bảng `TaiKhoan`).                                                      |
| 3   | `loai`             | `NVARCHAR(30)`  | Phân loại nhắc nhở (`HanNopBaoCao`, `HanDongPhi`, `HanBaoLuu18Thang`, `LichDanDoan`, `LichBaoCaoHoiDong`, `LichThamQuan`). |
| 4   | `noi_dung`         | `NVARCHAR(500)` | Nội dung chi tiết của nhắc nhở.                                                                                            |
| 5   | `doi_tuong_id`     | `INT`           | ID của thực thể liên quan (ID chuyến đi, ID hóa đơn...) phục vụ việc truy vết.                                             |
| 6   | `ngay_du_kien_gui` | `DATETIME2`     | Thời gian dự kiến gửi thông báo nhắc nhở này đi.                                                                           |
| 7   | `da_gui`           | `BIT`           | Cờ trạng thái đã gửi đi thành công (1: Đã gửi, 0: Chưa).                                                                   |
| 8   | `ngay_gui_thuc_te` | `DATETIME2`     | Thời điểm thực tế hệ thống gửi tin đi.                                                                                     |

### 12. Bảng: `DotKienTap` (Quản lý các đợt kiến tập chung)

| STT | Tên cột         | Kiểu dữ liệu    | Mô tả                                                                                                    |
| :-- | :-------------- | :-------------- | :------------------------------------------------------------------------------------------------------- |
| 1   | `id`            | `INT`           | ID tự tăng (Khóa chính), định danh đợt kiến tập.                                                         |
| 2   | `ten_dot`       | `NVARCHAR(150)` | Tên đợt kiến tập (duy nhất kết hợp với năm học & học kỳ).                                                |
| 3   | `nam_hoc_id`    | `INT`           | ID năm học diễn ra đợt kiến tập (Khóa ngoại liên kết bảng `NamHoc`).                                     |
| 4   | `hoc_ky_id`     | `INT`           | ID học kỳ diễn ra đợt kiến tập (Khóa ngoại liên kết bảng `HocKy`).                                       |
| 5   | `ngay_bat_dau`  | `DATE`          | Ngày bắt đầu triển khai đợt kiến tập.                                                                    |
| 6   | `ngay_ket_thuc` | `DATE`          | Ngày kết thúc đợt kiến tập (phải lớn hơn ngày bắt đầu).                                                  |
| 7   | `trang_thai`    | `NVARCHAR(20)`  | Trạng thái hiện tại của đợt (`Nhap`, `DangTrienKhai`, `DaKetThuc`, `DaKhoa`, `DaHuy`). Mặc định: `Nhap`. |

### 13. Bảng: `LichKienTap` (Lịch trình chi tiết áp dụng riêng theo từng khóa học)

| STT | Tên cột                | Kiểu dữ liệu    | Mô tả                                                                                            |
| :-- | :--------------------- | :-------------- | :----------------------------------------------------------------------------------------------- |
| 1   | `id`                   | `INT`           | ID tự tăng (Khóa chính), định danh lịch kiến tập.                                                |
| 2   | `dot_kien_tap_id`      | `INT`           | ID đợt kiến tập chứa lịch này (Khóa ngoại liên kết bảng `DotKienTap`).                           |
| 3   | `khoa_id`              | `INT`           | ID khoa áp dụng lịch (Khóa ngoại liên kết bảng `Khoa`).                                          |
| 4   | `ten_lich`             | `NVARCHAR(150)` | Tên gọi mô tả lịch kiến tập cụ thể.                                                              |
| 5   | `tg_mo_dang_ky_tu`     | `DATETIME2`     | Thời điểm bắt đầu mở cổng đăng ký chuyến tham quan.                                              |
| 6   | `tg_mo_dang_ky_den`    | `DATETIME2`     | Thời điểm kết thúc nhận đăng ký.                                                                 |
| 7   | `tg_dien_ra_tu`        | `DATE`          | Ngày bắt đầu tổ chức đi tham quan thực tế.                                                       |
| 8   | `tg_dien_ra_den`       | `DATE`          | Ngày kết thúc tổ chức đi tham quan thực tế.                                                      |
| 9   | `han_chot_nop_bao_cao` | `DATETIME2`     | Hạn chót để sinh viên nộp file bài thu hoạch.                                                    |
| 10  | `han_chot_diem`        | `DATETIME2`     | Hạn cuối để giảng viên hoàn thành chấm và chốt điểm trên hệ thống.                               |
| 11  | `trang_thai`           | `NVARCHAR(20)`  | Trạng thái của lịch (`Nhap`, `MoDangKy`, `DangDienRa`, `DaKetThuc`, `DaKhoa`). Mặc định: `Nhap`. |

### 14. Bảng: `LichKienTap_SinhVien` (Danh sách sinh viên đăng ký học phần)

| STT | Tên cột            | Kiểu dữ liệu   | Mô tả                                                                                        |
| :-- | :----------------- | :------------- | :------------------------------------------------------------------------------------------- |
| 1   | `id`               | `INT`          | ID tự tăng (Khóa chính), định danh lượt đăng ký học phần.                                    |
| 2   | `lich_kien_tap_id` | `INT`          | ID lịch kiến tập tương ứng (Khóa ngoại liên kết bảng `LichKienTap`).                         |
| 3   | `sinh_vien_id`     | `INT`          | ID sinh viên tham gia học phần (Khóa ngoại liên kết bảng `SinhVien`).                        |
| 4   | `lan_dang_ky`      | `INT`          | Số lần đăng ký học phần kiến tập của sinh viên này. Mặc định: 1.                             |
| 5   | `trang_thai`       | `NVARCHAR(20)` | Trạng thái thực hiện học phần (`DangThucHien`, `Dat`, `KhongDat`). Mặc định: `DangThucHien`. |
| 6   | `ngay_them`        | `DATETIME2`    | Ngày sinh viên được import/thêm vào danh sách đợt.                                           |

### 15. Bảng: `ChuyenThamQuan` (Quản lý các chuyến đi thực tế nhà máy)

| STT | Tên cột                 | Kiểu dữ liệu   | Mô tả                                                                                            |
| :-- | :---------------------- | :------------- | :----------------------------------------------------------------------------------------------- |
| 1   | `id`                    | `INT`          | ID tự tăng (Khóa chính), định danh chuyến đi.                                                    |
| 2   | `nha_may_id`            | `INT`          | ID nhà máy điểm đến của chuyến (Khóa ngoại liên kết bảng `NhaMay`).                              |
| 3   | `lich_kien_tap_id`      | `INT`          | ID lịch kiến tập chứa chuyến (Khóa ngoại liên kết bảng `LichKienTap`).                           |
| 4   | `ngay_tham_quan`        | `DATE`         | Ngày tổ chức khởi hành tham quan.                                                                |
| 5   | `gio_bat_dau`           | `TIME`         | Giờ xuất phát tham quan.                                                                         |
| 6   | `gio_ket_thuc`          | `TIME`         | Giờ kết thúc tham quan.                                                                          |
| 7   | `hinh_thuc`             | `NVARCHAR(15)` | Hình thức tham quan (`TrucTiep` hoặc `TrucTuyen`).                                               |
| 8   | `cach_to_chuc`          | `NVARCHAR(15)` | Cách thức tổ chức (`DoKhoaToChuc` hoặc `TuDo`). Mặc định: `DoKhoaToChuc`.                        |
| 9   | `suc_chua`              | `INT`          | Số lượng giới hạn sinh viên được tham gia tối đa của chuyến.                                     |
| 10  | `trang_thai`            | `NVARCHAR(20)` | Trạng thái chuyến (`Nhap`, `MoDangKy`, `DaChotDanhSach`, `DaDienRa`, `DaHuy`). Mặc định: `Nhap`. |
| 11  | `de_xuat_boi_id`        | `INT`          | ID sinh viên đề xuất chuyến tự đi kiến tập (NULL nếu do Khoa tổ chức).                           |
| 12  | `trang_thai_duyet_tudo` | `NVARCHAR(15)` | Kết quả duyệt đề xuất tự do của Khoa (`ChoDuyet`, `DaDuyet`, `TuChoi`).                          |
| 13  | `nguoi_duyet_id`        | `INT`          | ID quản lý duyệt đơn đề xuất chuyến đi tự do (Khóa ngoại liên kết `TaiKhoan`).                   |
| 14  | `ngay_duyet`            | `DATETIME2`    | Thời gian phê duyệt đơn đề xuất chuyến tự do.                                                    |

### 16. Bảng: `ChuyenThamQuan_GiangVienDanDoan` (Phân công GV dẫn đoàn cho chuyến)

| STT | Tên cột               | Kiểu dữ liệu | Mô tả                                                                                 |
| :-- | :-------------------- | :----------- | :------------------------------------------------------------------------------------ |
| 1   | `id`                  | `INT`        | ID tự tăng (Khóa chính), định danh phân công.                                         |
| 2   | `chuyen_tham_quan_id` | `INT`        | ID chuyến đi tham quan (Khóa ngoại liên kết bảng `ChuyenThamQuan`).                   |
| 3   | `giang_vien_id`       | `INT`        | ID giảng viên dẫn đoàn (Khóa ngoại liên kết bảng `GiangVien`).                        |
| 4   | `la_truong_doan`      | `BIT`        | Cờ xác định giảng viên này có phải trưởng đoàn chấm điểm cộng hay không. Mặc định: 1. |

### 17. Bảng: `PhieuDangKy` (Phiếu đăng ký chuyến đi của sinh viên)

| STT | Tên cột               | Kiểu dữ liệu   | Mô tả                                                                                                                                     |
| :-- | :-------------------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `id`                  | `INT`          | ID tự tăng (Khóa chính), định danh phiếu đăng ký.                                                                                         |
| 2   | `sinh_vien_id`        | `INT`          | ID sinh viên đăng ký (Khóa ngoại liên kết bảng `SinhVien`).                                                                               |
| 3   | `chuyen_tham_quan_id` | `INT`          | ID chuyến đi tham quan (Khóa ngoại liên kết bảng `ChuyenThamQuan`).                                                                       |
| 4   | `ngay_dang_ky`        | `DATETIME2`    | Ngày giờ sinh viên gửi phiếu đăng ký chuyến đi.                                                                                           |
| 5   | `trang_thai`          | `NVARCHAR(20)` | Trạng thái phiếu đăng ký (`ChoDuyet`, `HopLe`, `BiLoai`, `DaHuy`, `DaThamGia`, `VangMat`, `HoanThanh`, `KhongDat`). Mặc định: `ChoDuyet`. |

### 18. Bảng: `YeuCauHuyDangKy` (Yêu cầu xin rút/hủy đăng ký chuyến đi của SV)

| STT | Tên cột            | Kiểu dữ liệu    | Mô tả                                                                             |
| :-- | :----------------- | :-------------- | :-------------------------------------------------------------------------------- |
| 1   | `id`               | `INT`           | ID tự tăng (Khóa chính), định danh yêu cầu hủy.                                   |
| 2   | `phieu_dang_ky_id` | `INT`           | ID phiếu đăng ký muốn hủy (Khóa ngoại liên kết bảng `PhieuDangKy`, duy nhất).     |
| 3   | `ly_do`            | `NVARCHAR(500)` | Lý do sinh viên viết đơn xin hủy chuyến.                                          |
| 4   | `file_minh_chung`  | `NVARCHAR(500)` | Đường dẫn lưu file minh chứng lý do hủy hợp lệ (giấy khám sức khỏe...).           |
| 5   | `ngay_yeu_cau`     | `DATETIME2`     | Ngày gửi yêu cầu hủy đăng ký.                                                     |
| 6   | `trang_thai_duyet` | `NVARCHAR(15)`  | Trạng thái xét duyệt hủy (`ChoDuyet`, `DaDuyet`, `TuChoi`). Mặc định: `ChoDuyet`. |
| 7   | `nguoi_duyet_id`   | `INT`           | ID người duyệt đơn xin hủy (Khóa ngoại liên kết bảng `TaiKhoan`).                 |
| 8   | `ngay_duyet`       | `DATETIME2`     | Ngày thực tế thực hiện duyệt/từ chối đơn hủy.                                     |

### 19. Bảng: `DanhSachDen` (Quản lý các trường hợp vi phạm quy chế kiến tập)

| STT | Tên cột            | Kiểu dữ liệu   | Mô tả                                                                                     |
| :-- | :----------------- | :------------- | :---------------------------------------------------------------------------------------- |
| 1   | `id`               | `INT`          | ID tự tăng (Khóa chính), định danh vi phạm.                                               |
| 2   | `sinh_vien_id`     | `INT`          | ID sinh viên vi phạm (Khóa ngoại liên kết bảng `SinhVien`).                               |
| 3   | `ly_do`            | `NVARCHAR(20)` | Lý do bị phạt (`KhongDongPhi`, `DangKyKhongThamGia`, `HuyKhongMinhChung`).                |
| 4   | `phieu_dang_ky_id` | `INT`          | ID phiếu đăng ký gốc liên quan trực tiếp đến vi phạm (Khóa ngoại liên kết `PhieuDangKy`). |
| 5   | `ngay_ghi_nhan`    | `DATETIME2`    | Ngày giờ phát hiện và ghi nhận vi phạm của sinh viên.                                     |
| 6   | `con_hieu_luc`     | `BIT`          | Cờ trạng thái xử phạt còn áp dụng hay đã hết hạn (1: Còn, 0: Hết phạt). Mặc định: 1.      |

### 20. Bảng: `HoaDonLePhi` (Hóa đơn thu lệ phí chuyến đi)

| STT | Tên cột                 | Kiểu dữ liệu    | Mô tả                                                                                           |
| :-- | :---------------------- | :-------------- | :---------------------------------------------------------------------------------------------- |
| 1   | `id`                    | `INT`           | ID tự tăng (Khóa chính), định danh hóa đơn.                                                     |
| 2   | `phieu_dang_ky_id`      | `INT`           | ID phiếu đăng ký chuyến đi (Khóa ngoại liên kết bảng `PhieuDangKy`, duy nhất).                  |
| 3   | `so_tien`               | `DECIMAL(12,0)` | Số tiền lệ phí cần nộp.                                                                         |
| 4   | `noi_dung_chuyen_khoan` | `NVARCHAR(100)` | Mã cú pháp hệ thống tự sinh để SV ghi vào nội dung chuyển khoản (MSSV_MaChuyen).                |
| 5   | `han_dong`              | `DATETIME2`     | Hạn chót thanh toán hóa đơn này.                                                                |
| 6   | `ngay_dong_thuc_te`     | `DATETIME2`     | Thời điểm thực tế sinh viên nộp/chuyển tiền thành công.                                         |
| 7   | `trang_thai`            | `NVARCHAR(20)`  | Trạng thái đóng phí (`ChuaDong`, `DaDongDungHan`, `ViPham`, `DaHoanPhi`). Mặc định: `ChuaDong`. |

### 21. Bảng: `DonHoanPhi` (Đơn xin hoàn trả lại lệ phí khi hủy chuyến thành công)

| STT | Tên cột             | Kiểu dữ liệu    | Mô tả                                                                                        |
| :-- | :------------------ | :-------------- | :------------------------------------------------------------------------------------------- |
| 1   | `id`                | `INT`           | ID tự tăng (Khóa chính), định danh đơn hoàn phí.                                             |
| 2   | `hoa_don_id`        | `INT`           | ID hóa đơn liên quan (Khóa ngoại liên kết bảng `HoaDonLePhi`).                               |
| 3   | `file_don_da_duyet` | `NVARCHAR(500)` | Đường dẫn lưu tệp scan đơn đã ký xác nhận của Ban chủ nhiệm khoa.                            |
| 4   | `ngay_nop`          | `DATETIME2`     | Ngày gửi đơn xin hoàn tiền.                                                                  |
| 5   | `trang_thai`        | `NVARCHAR(15)`  | Trạng thái giải quyết đơn hoàn phí (`ChoXuLy`, `DaHoanTien`, `TuChoi`). Mặc định: `ChoXuLy`. |
| 6   | `nguoi_xu_ly_id`    | `INT`           | ID cán bộ tài vụ xử lý thủ tục hoàn tiền (Khóa ngoại liên kết `TaiKhoan`).                   |
| 7   | `ngay_xu_ly`        | `DATETIME2`     | Ngày hoàn tất chuyển tiền hoàn trả.                                                          |

### 22. Bảng: `PhanCongGVHD` (Phân công Giảng viên hướng dẫn cho sinh viên)

| STT | Tên cột                      | Kiểu dữ liệu   | Mô tả                                                                                             |
| :-- | :--------------------------- | :------------- | :------------------------------------------------------------------------------------------------ |
| 1   | `id`                         | `INT`          | ID tự tăng (Khóa chính), định danh phân công.                                                     |
| 2   | `lich_kien_tap_sinh_vien_id` | `INT`          | ID lượt đăng ký của sinh viên (Khóa ngoại liên kết bảng `LichKienTap_SinhVien`).                  |
| 3   | `giang_vien_id`              | `INT`          | ID giảng viên hướng dẫn (Khóa ngoại liên kết bảng `GiangVien`).                                   |
| 4   | `ngay_phan_cong`             | `DATETIME2`    | Ngày được phân công làm GVHD.                                                                     |
| 5   | `trang_thai`                 | `NVARCHAR(15)` | Trạng thái hoạt động của quyết định phân công (`DangHoatDong`, `DaGo`). Mặc định: `DangHoatDong`. |

### 23. Bảng: `DiemDanh` (Bảng điểm danh SV đi thực tế)

| STT | Tên cột              | Kiểu dữ liệu    | Mô tả                                                                          |
| :-- | :------------------- | :-------------- | :----------------------------------------------------------------------------- |
| 1   | `id`                 | `INT`           | ID tự tăng (Khóa chính), định danh lượt điểm danh.                             |
| 2   | `phieu_dang_ky_id`   | `INT`           | ID phiếu đăng ký chuyến đi (Khóa ngoại liên kết bảng `PhieuDangKy`, duy nhất). |
| 3   | `trang_thai`         | `NVARCHAR(15)`  | Trạng thái điểm danh (`CoMat`, `Vang`, `TuChoiThamGia`).                       |
| 4   | `ghi_chu`            | `NVARCHAR(255)` | Ghi chú thêm lý do vắng hoặc từ chối tham gia.                                 |
| 5   | `nguoi_diem_danh_id` | `INT`           | ID giảng viên thực hiện điểm danh tại chỗ (Khóa ngoại liên kết `GiangVien`).   |
| 6   | `ngay_diem_danh`     | `DATETIME2`     | Thời điểm giảng viên xác nhận điểm danh.                                       |

### 24. Bảng: `BaiThuHoach` (Nộp file bài báo cáo/thu hoạch chuyến đi của SV)

| STT | Tên cột                   | Kiểu dữ liệu    | Mô tả                                                                            |
| :-- | :------------------------ | :-------------- | :------------------------------------------------------------------------------- |
| 1   | `id`                      | `INT`           | ID tự tăng (Khóa chính), định danh bài nộp.                                      |
| 2   | `phieu_dang_ky_id`        | `INT`           | ID phiếu đăng ký chuyến đi tương ứng (Khóa ngoại liên kết bảng `PhieuDangKy`).   |
| 3   | `file_bao_cao`            | `NVARCHAR(500)` | Đường dẫn lưu file bài báo cáo dạng .pdf.                                        |
| 4   | `file_xac_nhan_tham_quan` | `NVARCHAR(500)` | Đường dẫn tệp giấy xác nhận tham quan (bắt buộc đối với chuyến đi tự do `TuDo`). |
| 5   | `lan_nop`                 | `INT`           | Lượt nộp bài thứ mấy của sinh viên. Mặc định: 1.                                 |
| 6   | `ngay_nop`                | `DATETIME2`     | Thời điểm sinh viên nộp bài lên hệ thống.                                        |
| 7   | `trang_thai`              | `NVARCHAR(15)`  | Trạng thái bài nộp (`DaNop`, `ChoBoSung`, `TreHan`). Mặc định: `DaNop`.          |

### 25. Bảng: `DiemPhieuDangKy` (Bảng ghi nhận điểm số chi tiết cho từng chuyến đi)

| STT | Tên cột                   | Kiểu dữ liệu    | Mô tả                                                                          |
| :-- | :------------------------ | :-------------- | :----------------------------------------------------------------------------- |
| 1   | `id`                      | `INT`           | ID tự tăng (Khóa chính), định danh bảng điểm.                                  |
| 2   | `phieu_dang_ky_id`        | `INT`           | ID phiếu đăng ký tương ứng (Khóa ngoại liên kết bảng `PhieuDangKy`, duy nhất). |
| 3   | `diem_chuan_bi`           | `DECIMAL(4,2)`  | Điểm chuẩn bị (trắc nghiệm/bài tập online), chiếm tỷ trọng 30%.                |
| 4   | `ngay_lam_bai_chuan_bi`   | `DATETIME2`     | Thời điểm làm bài chuẩn bị.                                                    |
| 5   | `diem_bai_thu_hoach_ai`   | `DECIMAL(4,2)`  | Điểm do công cụ AI tự động chấm và đề xuất trước.                              |
| 6   | `diem_bai_thu_hoach`      | `DECIMAL(4,2)`  | Điểm bài thu hoạch do GVHD chấm chính thức, chiếm tỷ trọng 30%.                |
| 7   | `nhan_xet_bai_thu_hoach`  | `NVARCHAR(MAX)` | Nhận xét chi tiết của giảng viên về chất lượng bài nộp.                        |
| 8   | `giang_vien_cham_id`      | `INT`           | ID giảng viên phụ trách chấm bài thu hoạch (Khóa ngoại liên kết `GiangVien`).  |
| 9   | `ngay_cham_bai_thu_hoach` | `DATETIME2`     | Thời điểm giảng viên lưu điểm chấm bài.                                        |
| 10  | `diem_bao_cao_tqnm`       | `DECIMAL(4,2)`  | Điểm báo cáo chấm trước Hội đồng chấm, chiếm tỷ trọng 40%.                     |
| 11  | `diem_cong`               | `DECIMAL(4,2)`  | Điểm cộng từ phát biểu trong chuyến tham quan (tối đa 1.0 điểm). Mặc định: 0.  |
| 12  | `da_khoa`                 | `BIT`           | Cờ khóa điểm của phiếu đăng ký (1: Đã khóa, 0: Chưa). Mặc định: 0.             |

### 26. Bảng: `NhatKyDiemCong` (Ghi nhận chi tiết từng lần phát biểu/đóng góp được điểm cộng)

| STT | Tên cột                  | Kiểu dữ liệu   | Mô tả                                                                              |
| :-- | :----------------------- | :------------- | :--------------------------------------------------------------------------------- |
| 1   | `id`                     | `INT`          | ID tự tăng (Khóa chính), định danh dòng điểm cộng.                                 |
| 2   | `phieu_dang_ky_id`       | `INT`          | ID phiếu đăng ký của sinh viên phát biểu (Khóa ngoại liên kết bảng `PhieuDangKy`). |
| 3   | `diem`                   | `DECIMAL(3,2)` | Số điểm được cộng cho lượt phát biểu đó. Mặc định: 0.5.                            |
| 4   | `giang_vien_ghi_nhan_id` | `INT`          | ID giảng viên dẫn đoàn ghi nhận và chấm (Khóa ngoại liên kết bảng `GiangVien`).    |
| 5   | `ngay_ghi_nhan`          | `DATETIME2`    | Thời điểm giảng viên tích chọn ghi nhận điểm cộng trên hệ thống.                   |

### 27. Bảng: `HoiDongChamBaoCao` (Hội đồng chấm báo cáo kết quả kiến tập)

| STT | Tên cột            | Kiểu dữ liệu    | Mô tả                                                                                 |
| :-- | :----------------- | :-------------- | :------------------------------------------------------------------------------------ |
| 1   | `id`               | `INT`           | ID tự tăng (Khóa chính), định danh hội đồng.                                          |
| 2   | `lich_kien_tap_id` | `INT`           | ID lịch kiến tập tổ chức buổi chấm hội đồng (Khóa ngoại liên kết bảng `LichKienTap`). |
| 3   | `ten_hoi_dong`     | `NVARCHAR(150)` | Tên gọi phân biệt của hội đồng.                                                       |
| 4   | `ngay_bao_cao`     | `DATETIME2`     | Ngày giờ làm việc chính thức của hội đồng.                                            |
| 5   | `dia_diem`         | `NVARCHAR(150)` | Địa điểm diễn ra (Phòng học trực tiếp hoặc link phòng họp trực tuyến).                |

### 28. Bảng: `HoiDong_ThanhVien` (Danh sách phân bổ giảng viên vào từng hội đồng)

| STT | Tên cột         | Kiểu dữ liệu   | Mô tả                                                                            |
| :-- | :-------------- | :------------- | :------------------------------------------------------------------------------- |
| 1   | `id`            | `INT`          | ID tự tăng (Khóa chính), định danh thành viên.                                   |
| 2   | `hoi_dong_id`   | `INT`          | ID hội đồng (Khóa ngoại liên kết bảng `HoiDongChamBaoCao`).                      |
| 3   | `giang_vien_id` | `INT`          | ID giảng viên tham gia (Khóa ngoại liên kết bảng `GiangVien`).                   |
| 4   | `vai_tro`       | `NVARCHAR(15)` | Vai trò trong hội đồng (`ChuTich`, `ThuKy`, `ThanhVien`). Mặc định: `ThanhVien`. |

### 29. Bảng: `DiemHoiDong_ChiTiet` (Chi tiết chấm điểm độc lập của từng thành viên hội đồng)

| STT | Tên cột                 | Kiểu dữ liệu   | Mô tả                                                                            |
| :-- | :---------------------- | :------------- | :------------------------------------------------------------------------------- |
| 1   | `id`                    | `INT`          | ID tự tăng (Khóa chính), định danh lượt chấm.                                    |
| 2   | `phieu_dang_ky_id`      | `INT`          | ID phiếu đăng ký của sinh viên báo cáo (Khóa ngoại liên kết bảng `PhieuDangKy`). |
| 3   | `hoi_dong_thanhvien_id` | `INT`          | ID thành viên hội đồng chấm điểm (Khóa ngoại liên kết bảng `HoiDong_ThanhVien`). |
| 4   | `diem`                  | `DECIMAL(4,2)` | Điểm số độc lập được chấm từ thành viên này.                                     |
| 5   | `ngay_cham`             | `DATETIME2`    | Ngày thực hiện chấm điểm.                                                        |

### 30. Bảng: `BoChuyenBaoCao` (Nhóm các chuyến đi chính thức cấu thành điểm học phần)

| STT | Tên cột                      | Kiểu dữ liệu    | Mô tả                                                                                                |
| :-- | :--------------------------- | :-------------- | :--------------------------------------------------------------------------------------------------- |
| 1   | `id`                         | `INT`           | ID tự tăng (Khóa chính), định danh bộ chuyến báo cáo.                                                |
| 2   | `lich_kien_tap_sinh_vien_id` | `INT`           | ID đăng ký học phần của sinh viên (Khóa ngoại liên kết `LichKienTap_SinhVien`, duy nhất).            |
| 3   | `ngay_chon`                  | `DATETIME2`     | Ngày chốt chọn bộ chuyến.                                                                            |
| 4   | `tu_dong`                    | `BIT`           | Chọn tự động bằng thuật toán hay do GVHD điều chỉnh bằng tay (1: Tự động, 0: Thủ công). Mặc định: 1. |
| 5   | `ghi_chu_dieu_chinh_gvhd`    | `NVARCHAR(500)` | Giải trình lý do thay đổi từ phía giảng viên hướng dẫn (nếu có).                                     |

### 31. Bảng: `BoChuyenBaoCao_Chuyen` (Quan hệ N-N liên kết các phiếu đăng ký thuộc bộ báo cáo)

| STT | Tên cột                | Kiểu dữ liệu | Mô tả                                                                                     |
| :-- | :--------------------- | :----------- | :---------------------------------------------------------------------------------------- |
| 1   | `id`                   | `INT`        | ID tự tăng (Khóa chính), định danh dòng liên kết.                                         |
| 2   | `bo_chuyen_bao_cao_id` | `INT`        | ID bộ chuyến báo cáo gốc (Khóa ngoại liên kết bảng `BoChuyenBaoCao`).                     |
| 3   | `phieu_dang_ky_id`     | `INT`        | ID phiếu đăng ký chuyến đi được lựa chọn vào bộ (Khóa ngoại liên kết bảng `PhieuDangKy`). |

### 32. Bảng: `KetQuaHocPhan` (Điểm tổng kết cuối cùng của học phần kiến tập)

| STT | Tên cột                      | Kiểu dữ liệu   | Mô tả                                                                                                        |
| :-- | :--------------------------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| 1   | `id`                         | `INT`          | ID tự tăng (Khóa chính), định danh kết quả học phần.                                                         |
| 2   | `lich_kien_tap_sinh_vien_id` | `INT`          | ID lượt học phần tương ứng của sinh viên (Khóa ngoại liên kết `LichKienTap_SinhVien`, duy nhất).             |
| 3   | `bo_chuyen_bao_cao_id`       | `INT`          | ID bộ chuyến chính thức dùng để tính điểm tổng (Khóa ngoại liên kết bảng `BoChuyenBaoCao`, duy nhất).        |
| 4   | `diem_tong_ket`              | `DECIMAL(4,2)` | Điểm trung bình cộng tổng kết học phần kiến tập của sinh viên.                                               |
| 5   | `ket_qua`                    | `NVARCHAR(20)` | Phân loại xếp loại cuối cùng (`DangThucHien`, `Dat`, `KhongDat`, `ChuaHoanThanh`). Mặc định: `DangThucHien`. |
| 6   | `ngay_khoa`                  | `DATETIME2`    | Ngày giờ thực hiện khóa điểm chính thức gửi lên phòng đào tạo.                                               |
| 7   | `nguoi_khoa_id`              | `INT`          | ID tài khoản quản lý khoa thực hiện khóa điểm (Khóa ngoại liên kết bảng `TaiKhoan`).                         |

---

# Lịch sử trò chuyện ngày 15/07/2026

## 1. Mapping giao diện từ CodeFromStich_Final

**Người dùng:**

> Task: Mapping Giao diện
> Source: Các source trong CodeFromStich_Final
> Mô tả chi tiết task: Các source trong CodeFromStich_Final chứa các code về giao diện hoàn chỉnh của hệ thống này, hãy mapping toàn bộ vào giao diện cũ ở frontend và liên kết với backend. Trong các source stich final có các mockdata thì không cần lấy vì hệ thống này đã có data thực ở 2 file gồm QLKienTap_Database và QLKienTap_ImportData.
> Note: Mapping chuẩn chỉnh theo đúng source code mới. Không thay đổi code trong source CodeFromStich_Final. Frontend xây dựng bằng ReactJS, backend xây dựng bằng NestJS.

**Antigravity:**

- Giải nén tất cả file `.zip` trong `CodeFromStich_Final/` ra các thư mục tạm.
- Phân tích cấu trúc giao diện từ Stich cho 3 portal: Sinh viên, Giảng viên, Quản lý khoa.
- Mapping toàn bộ giao diện:
  - **Sinh viên (8 trang):** Trang chủ, Chuyến tham quan & Đăng ký, Lịch trình đoàn, Nộp bài thu hoạch, Thanh toán, Hoàn phí, Kết quả & Điểm, Thông báo.
  - **Giảng viên (7 trang):** Trang chủ, Lịch dẫn đoàn, Sinh viên hướng dẫn, Chấm bài thu hoạch, Hội đồng chấm báo cáo, Thông báo.
  - **Quản lý khoa (7 trang ban đầu):** Trang chủ, Danh mục nền, Sinh viên, Giảng viên, Nhà máy, Chuyến tham quan, Hội đồng chấm báo cáo.
- Tạo hệ thống theme Forest Green với TailwindCSS custom config.
- Xây dựng sidebar cố định cho cả 3 portal.
- Liên kết tất cả component với backend NestJS thông qua `api.js`.

---

## 2. Không chạy thử chương trình

**Người dùng:**

> Không cần chạy chương trình thử vì phần này sẽ do thành viên khác đảm nhận.

**Antigravity:**

- Ghi nhận, không chạy `npm run dev` hay `npm run start:dev`.

---

## 3. Backend không chạy được & đăng nhập thất bại

**Người dùng:**

> Hiện tại backend vẫn chưa chạy được và đăng nhập đã thất bại. Lý do là gì? Hướng khắc phục.

**Antigravity:**

- **Nguyên nhân:** Backend thiếu module `auth`, `sinh-vien`, `giang-vien`, `khoa` và entity definitions. File `app.module.ts` chưa import đúng.
- **Khắc phục:** Tạo đầy đủ các module NestJS (controller + service + module) cho auth, sinh-vien, giang-vien, khoa. Cập nhật `app.module.ts` để import tất cả.

---

## 4. Màn hình trắng xóa khi load frontend

**Người dùng:**

> Tôi đã chạy lại và xuất hiện tình trạng màn hình trắng xóa, khi F5 load lại trang thì giao diện chỉ xuất hiện trong nháy mắt (tầm 0.5s) rồi lại trắng xóa.

**Antigravity:**

- **Nguyên nhân:** Lỗi import icon `BookText` từ `lucide-react` (không tồn tại trong phiên bản cài đặt), lỗi reference `undefined` trong các component.
- **Khắc phục:** Thay thế icon bằng `BookOpen`, sửa các lỗi import và reference trong Layout.jsx và các trang con.

---

## 5. Header bị đè bởi body & trang Nộp bài thu hoạch trắng

**Người dùng:**

> Header của các trang đang bị các phần của body đè lên, và ở trang Nộp bài thu hoạch/reports thì gặp trường hợp màn hình trắng.

**Antigravity:**

- **Fix header:** Thêm `fixed` positioning cho header với `z-40`, đặt `pt-24` cho main content.
- **Fix trang reports:** Sửa lỗi undefined reference trong `NopBaiThuHoach_SV.jsx`.

---

## 6. Body bị header đè sau khi fix

**Người dùng:**

> Khi fix được header thì nó lại đè lên body. Hãy đẩy body xuống để hiện rõ hết body.

**Antigravity:**

- Tăng `padding-top` của main content từ `pt-16` lên `pt-24` để body không bị header che khuất.

---

## 7. Thiếu trang Hoàn phí cho Sinh viên

**Người dùng:**

> Sau khi kiểm tra lại các trang của sinh viên trên stich thì tôi phát hiện bạn mapping còn thiếu trang Hoàn phí nằm chung mục Tài chính với Thanh toán.

**Antigravity:**

- Tạo file `HoanPhi_SV.jsx` với giao diện nộp đơn hoàn phí, danh sách đơn đã nộp, theo dõi trạng thái.
- Đăng ký route `/sinh-vien/refund` trong `App.jsx`.
- Thêm menu "Hoàn phí" vào sidebar mục TÀI CHÍNH trong `Layout.jsx`.

---

## 8. Thiếu trang Điểm danh SV & Điểm chuẩn bị cho Giảng viên

**Người dùng:**

> Sau khi kiểm tra lại các trang của giảng viên trên stich thì tôi phát hiện bạn mapping còn thiếu trang Điểm danh sinh viên, Điểm chuẩn bị & Cộng nằm chung mục Dẫn Đoàn.

**Antigravity:**

- Tạo `DiemDanhSV_GV.jsx` — quản lý điểm danh (Có mặt/Vắng/Từ chối) cho từng chuyến.
- Tạo `DiemChuanBi_DiemCong_GV.jsx` — chấm điểm chuẩn bị và ghi nhận điểm cộng phát biểu.
- Cập nhật backend `giang-vien.service.ts` để aggregate dữ liệu điểm danh và điểm.
- Đăng ký route `/giang-vien/attendance` và `/giang-vien/preparation` trong `App.jsx`.
- Thêm 2 mục vào sidebar Giảng viên dưới category DẪN ĐOÀN.

---

## 9. Fix toàn bộ portal Quản lý Khoa

**Người dùng:**

> Hiện tại các trang của Quản lý khoa đang gặp vấn đề:
>
> - Phong màu và phong chữ đang khác với các trang của giảng viên và sinh viên.
> - Sidebar của quản lý khoa đang khác với thiết kế trên stich. Thiết kế đúng phải gồm: Trang chủ; Mục DANH MỤC HỆ THỐNG: Danh mục nền, Sinh viên; Mục KẾ HOẠCH KIẾN TẬP: Đợt kiến tập; Mục ĐĂNG KÝ & PHÂN CÔNG: Quản lý đăng ký, Phân công GVHD, Phân công GV dẫn đoàn; Thông báo; Báo cáo thống kê.
> - Thiếu nhiều trang.
> - Button đăng xuất bị tình trạng chỉ xuất hiện 0.5s rồi biến mất.

**Antigravity:**

### Theme Forest Green:

- Cập nhật `DashBoard_Khoa.jsx`: chuyển gradient từ `indigo/slate` sang `primary/primary-container`, metric icons sang `bg-primary/10`, chart bars sang `bg-primary/bg-secondary`.

### 6 trang mới đã tạo:

| Trang                             | Route                 | Chức năng                                            |
| --------------------------------- | --------------------- | ---------------------------------------------------- |
| `PlanManagement_Khoa.jsx`         | `/khoa/plans`         | Quản lý đợt kiến tập (tạo, xem, tìm kiếm)            |
| `RegistrationManagement_Khoa.jsx` | `/khoa/registrations` | 3 tab: Đăng ký, Hủy chuyến, Hoàn phí — duyệt/từ chối |
| `SupervisorAssignment_Khoa.jsx`   | `/khoa/supervisors`   | Phân công GVHD cho SV theo enrollment                |
| `LeaderAssignment_Khoa.jsx`       | `/khoa/leaders`       | Phân công GV dẫn đoàn (Trưởng/Phó) cho chuyến        |
| `ThongBao_Khoa.jsx`               | `/khoa/notifications` | Tạo và quản lý thông báo gửi SV/GV                   |
| `BaoCaoThongKe_Khoa.jsx`          | `/khoa/reports`       | Báo cáo SV học lại + Kết quả học phần + Xuất CSV     |

### Backend NestJS — Endpoints mới:

| Method | Endpoint                  | Chức năng                                    |
| ------ | ------------------------- | -------------------------------------------- |
| `GET`  | `/api/khoa/enrollments`   | Lấy danh sách SV đã enroll vào lịch kiến tập |
| `GET`  | `/api/khoa/notifications` | Lấy tất cả thông báo                         |
| `POST` | `/api/khoa/notifications` | Tạo thông báo mới                            |

### Sidebar Khoa (đúng Stich):

- Cấu trúc: Trang chủ → DANH MỤC HỆ THỐNG (Danh mục nền, Sinh viên) → KẾ HOẠCH KIẾN TẬP (Đợt kiến tập) → ĐĂNG KÝ & PHÂN CÔNG (Quản lý đăng ký, Phân công GVHD, Phân công GV dẫn đoàn) → THÔNG BÁO & BÁO CÁO (Thông báo, Báo cáo thống kê).

### Nút đăng xuất:

- Cố định dưới sidebar với `fixed` layout, không bị biến mất.

### Cleanup:

- Xóa thư mục tạm `temp_unzip_khoa`.
- Sửa lỗi duplicate closing brace trong `DashBoard_Khoa.jsx`.
- Loại bỏ duplicate API entries trong `api.js`.

---

## 10. Push lên GitHub

**Người dùng:**

> Hãy push source này lên nhánh NguyenVinhKhang của repo https://github.com/Duckmanz205/QLKienTap.git.
> Note: Chỉ cần push 2 source chính là frontend và backend thôi vì source main của repo này hiện tại chỉ có như thế nên tránh xung đột.

**Antigravity:**

- Checkout nhánh `NguyenVinhKhang`.
- Stage chỉ 2 thư mục `frontend/` và `backend/` (53 files, +15,467 dòng).
- Commit: `feat: Mapping giao dien Stich Final - Frontend (ReactJS) va Backend (NestJS)...`
- Push thành công: `02532b1..d3bba6f NguyenVinhKhang -> NguyenVinhKhang`.
- **Không bao gồm:** `CodeFromStich/`, `CodeFromStich_Final/`, `DB/`, `MoTa/`, `Run_Guide.md`, `chat_history.md` — tránh xung đột.

---

## Tổng kết files đã thay đổi/tạo mới ngày 15/07/2026

### Frontend (ReactJS):

| File                                   | Loại thay đổi                         |
| -------------------------------------- | ------------------------------------- |
| `src/App.jsx`                          | Sửa — thêm route cho tất cả trang mới |
| `src/index.css`                        | Sửa — hệ thống theme Forest Green     |
| `src/services/api.js`                  | Sửa — thêm API client methods mới     |
| `src/components/Layout.jsx`            | Tạo mới — Sidebar + Header 3 portal   |
| `src/pages/Login.jsx`                  | Tạo mới                               |
| `src/pages/sinh-vien/*.jsx` (8 files)  | Tạo mới — Toàn bộ portal Sinh viên    |
| `src/pages/giang-vien/*.jsx` (8 files) | Tạo mới — Toàn bộ portal Giảng viên   |
| `src/pages/khoa/*.jsx` (13 files)      | Tạo mới — Toàn bộ portal Quản lý khoa |

### Backend (NestJS):

| File                          | Loại thay đổi                     |
| ----------------------------- | --------------------------------- |
| `src/app.module.ts`           | Sửa — import tất cả module        |
| `src/entities/qlkt.entity.ts` | Tạo mới — 32 entity definitions   |
| `src/auth/*` (3 files)        | Tạo mới — Authentication module   |
| `src/sinh-vien/*` (3 files)   | Tạo mới — Student module          |
| `src/giang-vien/*` (3 files)  | Tạo mới — Lecturer module         |
| `src/khoa/*` (3 files)        | Tạo mới — Department Admin module |

---

## 11. Cập nhật và điều chỉnh các trang của role Khoa, Sinh viên, Giảng viên theo tài liệu BA (docx)

**Người dùng:**

> Task: Đối chiếu và chỉnh sửa lại hệ thống cho đúng nhất có thể dựa vào Prompt_Stitch_QLKienTap.docx (Phần A, B, C).

**Antigravity:**

- Cập nhật màu nền và hiệu ứng active/hover của Sidebar cho vai trò Sinh viên và Giảng viên trong `Layout.jsx` sang màu xanh chủ đạo `#407F3E` và xanh nhạt `#89B449`.
- Thiết kế lại các trang vai trò Khoa:
  - `KetQuaKienTap_MaTranDiem_Khoa.jsx` (Ma trận điểm, khóa điểm, bộ lọc).
  - `QuanLyLePhi_Khoa.jsx` (Quản lý lệ phí, nhập file đối soát, biên lai).
  - `DuyetHoanPhi_Khoa.jsx` (Duyệt hoàn phí, lý do hủy chuyến, minh chứng).
  - `ThongBao_Khoa.jsx` (Tạo thông báo mới với chế độ gửi ngay/lịch biểu, phân loại đối tượng).
  - `BaoCaoThongKe_Khoa.jsx` (Giao diện thẻ tab và báo cáo kết quả).
- Đồng bộ hóa màu sắc cảnh báo thành màu cát vàng `#DBD468` cho các trạng thái chờ duyệt/chưa đóng ở cả phía Sinh viên (`ThanhToan_SV.jsx`, `HoanPhi_SV.jsx`, `LichTrinhDoan_SV.jsx`, `DashBoard_SV.jsx`, `ThongBao_SV.jsx`) và Giảng viên (`DashBoard_GV.jsx`).

---

## 12. Sửa liên kết nút "Xem biểu đồ & chi tiết"

**Người dùng:**

> "Xem biểu đồ & chi tiết" đang chưa có liên kết với trang xem biểu đồ & chi tiết hoặc là hiện tại chưa có trang đó. Hãy kiểm tra lại và liên kết cho đúng.

**Antigravity:**

- Xác định đường dẫn trang Xem trước Báo cáo tham quan là `/khoa/visit-report`.
- Cập nhật `actionPath` của mục báo cáo đầu tiên trong `BaoCaoThongKe_Khoa.jsx` từ `/khoa/reports` thành `/khoa/visit-report` để chuyển hướng chính xác khi bấm nút.

---

## 13. Push mã nguồn cập nhật lên GitHub

**Người dùng:**

> giờ hãy push 2 source frontend và backend đã qua cập nhật và chỉnh sửa này lên nhánh NguyenVinhKhang của repo https://github.com/Duckmanz205/QLKienTap.git

**Antigravity:**

- Thực hiện staging các tệp tin frontend đã chỉnh sửa và các trang Khoa mới tạo.
- Commit các thay đổi với thông điệp: `feat: map new Khoa screens and align layout color palette/badges across all roles`.
- Thực hiện đẩy (push) thành công các thay đổi lên nhánh `NguyenVinhKhang` trên kho lưu trữ từ xa.

---

## 14. Bảo mật và Tối ưu hóa hiệu năng - Giai đoạn 1, 2 và 3

**Người dùng:**

> Hãy bắt đầu giai đoạn 3: Cấu hình @nestjs/jwt, RolesGuard phân quyền; Tích hợp Virtual Scrolling cho các danh sách lớn trên ReactJS.

**Antigravity:**

- **Giai đoạn 1 (Bảo mật tài khoản & Seed):**
  - Tích hợp mã hóa mật khẩu một chiều sử dụng `bcryptjs` ở Backend.
  - Cập nhật cơ chế xác thực đăng nhập để so khớp mật khẩu đã hash.
  - Chuyển đổi và mã hóa thành công toàn bộ tài khoản mẫu trong tệp SQL seed dữ liệu.
- **Giai đoạn 2 (Tối ưu hóa truy vấn & Phân trang Server-side):**
  - Cải tiến các API danh mục sinh viên, danh sách đăng ký, yêu cầu hoàn phí và phân công GVHD hỗ trợ phân trang server-side dạng `{ data, total, page, limit, totalPages }`.
  - Tích hợp thanh phân trang (Pagination Footer) và bộ lọc tìm kiếm debounced (300ms) tại các giao diện tương ứng của Khoa và Giảng viên.
- **Giai đoạn 3 (JWT, RBAC & Virtual Scrolling):**
  - Cấu hình `@nestjs/jwt` lấy biến môi trường từ `.env` và cập nhật logic `login` để sinh chuỗi JWT thật.
  - Viết `AuthGuard` (xác thực token Bearer) và `RolesGuard` kết hợp decorator `@Roles(...)` để phân quyền truy cập chéo.
  - Bảo vệ các controller `SinhVienController`, `GiangVienController` và `KhoaController` theo đúng vai trò nghiệp vụ.
  - Thêm Axios request interceptor phía frontend để tự động gửi JWT token trong header `Authorization`.
  - Viết component ảo hóa danh sách `VirtualList.jsx` hiệu năng cao trên React 19.
  - Tích hợp chế độ chuyển đổi "Virtual Scroll (Không phân trang)" cho danh sách đăng ký chuyến đi và danh sách phân công GVHD trong trang `ChuyenThamQuan_DSLoc.jsx` của Quản lý Khoa.

---

## 15. Bảo mật và Tối ưu hóa hiệu năng - Giai đoạn 4

**Người dùng:**

> Bắt đầu giai đoạn 4: Xây dựng hàng rào bảo mật tệp upload; Tích hợp BullMQ xử lý hàng đợi tác vụ nền gửi mail/nhắc nhở và xuất file.

**Antigravity:**

- **Bảo mật tệp tải lên (Secure File Upload Guardrail):**
  - Tạo mới `UploadModule` và `UploadController` hỗ trợ 3 loại tải lên: tệp báo cáo (PDF/Word), danh sách/biên đối soát (Excel), và ảnh minh chứng thanh toán (JPG/PNG).
  - Tích hợp các bộ lọc và xác thực nghiêm ngặt: giới hạn dung lượng (2MB cho minh chứng, 5MB cho báo cáo/Excel), giới hạn loại tệp (whitelist mimetype/extension).
  - Phòng chống Path Traversal và Stored XSS bằng cách tự động đổi tên tệp sang UUID ngẫu nhiên và lưu ở thư mục chuyên dụng `./uploads/` (nằm ngoài thư mục công khai của web).
  - Xây dựng endpoint phục vụ tệp an toàn `/api/upload/file/:type/:filename` đi kèm các header bảo mật (`Content-Type` chuẩn hóa, `Content-Disposition` dạng tải về bắt buộc đối với tệp Office, thiết lập `Content-Security-Policy: default-src 'none'` và `X-Content-Type-Options: nosniff`). Bảo vệ đường dẫn tải bằng `AuthGuard` phân quyền.
- **Hàng đợi xử lý tác vụ nền BullMQ:**
  - Cấu hình động kiểm tra máy chủ Redis. Tạo dịch vụ hàng đợi lai `TaskQueueService` độc lập.
  - Khi Redis trực tuyến, hệ thống tự động khởi tạo BullMQ Queue và Worker để xử lý luồng công việc dưới nền. Khi Redis ngoại tuyến (môi trường local dev), hệ thống tự động fallback sang cơ chế In-Memory xử lý bất đồng bộ bằng `setTimeout`, tránh làm sập ứng dụng khi khởi động.
  - Tích hợp 3 loại Job: `send-email` (gửi mail xác nhận), `send-reminder` (gửi nhắc nhở sinh viên), và `export-file` (xuất báo cáo nặng).
  - Liên kết luồng gửi thông báo (`createNotification`) để tự kích hoạt job nền gửi mail và nhắc nhở. Thêm API kết xuất danh sách sinh viên `/api/khoa/export-student-list` hoạt động bất đồng bộ thông qua hàng đợi nền.
- **Tích hợp phía Frontend:**
  - Nâng cấp màn hình `NopBaiThuHoach_SV.jsx` loại bỏ mô phỏng, cho phép sinh viên tải tệp báo cáo thật và tệp ảnh xác nhận thật (đối với chuyến đi đề xuất tự do) lên máy chủ kèm thanh tiến độ tải.
  - Nâng cấp nút nhập danh sách sinh viên trong `DanhMuc_SinhVien_Khoa.jsx` và nút nhập đối soát lệ phí trong `QuanLyLePhi_Khoa.jsx` để đẩy tệp Excel thật lên bộ lọc bảo mật ở backend trước khi phân tích.

---

# Lịch sử trò chuyện ngày 19/07/2026

## 16. Chuyển đổi Source Code Mobile sang Flutter/Dart & Bảo mật hóa hệ thống di động

**Người dùng:**

> Chuyển đổi các source code mobile từ typescript sang flutter/dart dùng để chạy mobile trên giả lập (Android Studio). Sắp xếp lại cấu trúc thư mục lib mobile theo chuẩn sạch (Clean Architecture), tách nhỏ các màn hình chức năng thành 6 file trang chức năng riêng biệt cho mỗi vai trò và đặt tên bằng tiếng Việt. Cấu hình bảo mật nâng cao bao gồm mã hóa lưu trữ Token (Secure Storage), tự động đăng xuất khi gặp lỗi 401 hết hạn và tự động phục hồi phiên làm việc khi mở ứng dụng.

**Antigravity:**

- **Chuyển đổi React Mobile sang Flutter/Dart:**
  - Chuyển đổi toàn bộ các component và màn hình trong React Mobile sang mã nguồn Dart chạy trên thiết bị di động.
  - Xây dựng hệ màu chủ đạo Forest Green (`#407F3E`) đồng bộ với hệ thống giao diện Web.
- **Tái thiết kế cấu trúc thư mục sạch (Clean Architecture):**
  - Cơ cấu lại thư mục `lib/` thành: `core/` (gồm `theme/` và `network/`), `data/` (gồm `models/` và `state/`), `presentation/` (gồm các màn hình giao diện `screens/`).
  - Phân tách các màn hình thành đúng 6 tệp tin chức năng riêng biệt tương tự như web cho mỗi vai trò:
    - _Sinh viên:_ `dashboard_sv.dart` (Dashboard), `chuyenthamquan_sv.dart` (Đăng ký chuyến đi), `nopbaithuhoach_sv.dart` (Nộp báo cáo), `ketqua_diem_sv.dart` (Xem điểm), `lichtrinhdoan_sv.dart` (Lịch trình đoàn), và `taichinh_sv.dart` (Tài chính & Hoàn lệ phí).
    - _Giảng viên:_ `dashboard_gv.dart` (Dashboard), `lichdandoan_gv.dart` (Lịch dẫn đoàn), `diemdanhsv_gv.dart` (Điểm danh thực địa), `sinhvienhuongdan_gv.dart` (DS sinh viên hướng dẫn), `chambaithuhoach_gv.dart` (Chấm điểm chuẩn bị/báo cáo), và `hoidongchambaocao_dsbuoi_gv.dart` (Chấm điểm hội đồng tốt nghiệp).
- **Xây dựng hệ thống mạng kết nối API & Cơ chế hoạt động Lai (Hybrid Fallback):**
  - Tích hợp 100% các API gọi tới NestJS backend tại `api_service.dart`.
  - Thiết kế cơ chế lai bảo vệ: Tự động bắt lỗi timeout/mất kết nối khi server backend chưa online và chuyển app sang chế độ **Offline Mock Mode**, cho phép mô phỏng nghiệp vụ trên bộ nhớ RAM để sinh viên và giảng viên trải nghiệm mượt mà, không bị sập app.
- **Tích hợp Bảo mật mã hóa & Quản lý phiên:**
  - Viết lớp mã hóa `SecureStorage` dựa trên `shared_preferences` với giải thuật dịch chuyển bit XOR kết hợp Base64 để lưu trữ an toàn JWT token, ID tài khoản và vai trò trên bộ nhớ đĩa cục bộ.
  - Tự động phục hồi phiên đăng nhập (Auto-login) khi mở app nếu phát hiện token hợp lệ.
  - Tích hợp Interceptor bắt lỗi `401 Unauthorized` ở lớp API, tự động gọi lệnh đăng xuất giải phóng token mã hóa và đẩy người dùng quay về trang đăng nhập khi token hết hạn.

---

## 17. Tích hợp Tải/Nộp file thật trên Mobile & Đồng bộ hóa Biểu mẫu mẫu trên toàn hệ thống

**Người dùng:**

- Đề xuất tạo file mẫu hướng dẫn đưa lên hệ thống cho sinh viên tải về để đồng bộ và dễ quản lý.
- Áp dụng giải pháp tải file mẫu trên cả Web và Mobile cho các chức năng tương ứng.

**Antigravity:**

- **Triển khai Tải/Nộp file thật trên Mobile:**
  - Thay thế cơ chế giả lập/mock bằng việc tích hợp gói `file_picker` và `url_launcher` trong Flutter.
  - Cho phép người dùng chọn tệp thực tế từ bộ nhớ thiết bị và tải các tệp tin trực tiếp từ máy chủ.
- **Tạo thư mục lưu trữ file mẫu chuyên dụng trên Backend:**
  - Tạo thư mục `backend/uploads/templates/` lưu trữ 4 loại biểu mẫu:
    - `mau_nhat_ky_thuc_tap.xlsx` (Mẫu nhật ký tuần của SV).
    - `huong_dan_viet_bao_cao.pdf` (Quy chuẩn định dạng bài báo cáo).
    - `mau_don_xin_hoan_phi.docx` (Mẫu đơn hoàn tiền lệ phí).
    - `mau_import_sinh_vien.xlsx` (Mẫu import danh sách SV của Khoa).
  - Cấu hình whitelist trong `upload.controller.ts` để cho phép truy xuất trực tiếp các tệp tin tĩnh trong thư mục `templates` qua endpoint `/api/upload/file/templates/:filename`.
- **Tích hợp Tải file mẫu trên Mobile:**
  - Bổ sung các liên kết tải xuống trực quan (icon và văn bản dạng nút bấm) trong `nopbaithuhoach_sv.dart` và `taichinh_sv.dart`.
- **Đồng bộ hóa Tải file mẫu trên Web Frontend (ReactJS):**
  - Cập nhật trang quản lý sinh viên của Khoa (`DanhMuc_SinhVien_Khoa.jsx`): Thêm nút **"Tải tệp mẫu"** tải file `mau_import_sinh_vien.xlsx` bên cạnh nút chọn file.
  - Cập nhật trang nộp báo cáo của Sinh viên (`NopBaiThuHoach_SV.jsx`): Thiết kế khung thông tin hướng dẫn màu xanh dương ở đầu trang chứa hai đường dẫn tải PDF quy chuẩn và Excel mẫu nhật ký tuần.
  - Cập nhật trang hoàn phí của Sinh viên (`HoanPhi_SV.jsx`): Thêm đường dẫn tải **Đơn hoàn phí mẫu (.docx)** ngay dưới trường chọn file đính kèm trong Modal tạo đơn hoàn phí.

---

## 18. Khắc phục lỗi định dạng tệp tin mẫu (Excel, Word, PDF)

**Người dùng:**

- Thông báo không mở được các file mẫu vừa tải xuống từ thư mục `uploads/templates` bằng Microsoft Excel (báo lỗi tệp bị lỗi hoặc sai định dạng).

**Antigravity:**

- **Nguyên nhân:** Các tệp mẫu được tạo bằng phương thức ghi văn bản thô (plain text) để kiểm tra luồng truyền tải dữ liệu, dẫn đến việc các phần mềm Office/PDF từ chối đọc cấu trúc nhị phân.
- **Khắc phục:**
  - Viết tập lệnh Python tự động `generate_templates.py` trong thư mục `scratch` sử dụng các thư viện nhị phân chuẩn (`openpyxl`, `python-docx`, và `reportlab`).
  - Thực thi tập lệnh thành công để biên dịch và tạo ra các tệp nhị phân thực tế chuẩn 100% bao gồm: bảng tính Excel có kẻ viền lưới và định dạng tiêu đề, đơn xin hoàn phí dạng Word (.docx) căn lề chuẩn, và cẩm nang hướng dẫn định dạng PDF có phân trang.
  - Cho phép người dùng mở trực tiếp tệp mẫu bằng Microsoft Excel, Microsoft Word và Adobe Reader bình thường từ cả máy chủ cục bộ lẫn Web/Mobile.

---

# Lịch sử trò chuyện ngày 25/07/2026

## 19. Kiểm tra toàn bộ source code (Production Readiness Audit) & Khắc phục rủi ro bảo mật, race condition, database transaction

**Người dùng:**

> Bạn là Senior Software Architect, Security Engineer và Code Reviewer. Hãy kiểm tra toàn bộ source code của dự án trước khi deploy lên Production. Phân tích lỗi logic, bảo mật, race condition, transaction, phân quyền, hiệu năng, cấu hình Production... Sau đó lập báo cáo và tiến hành sửa chữa toàn bộ rủi ro.

**Antigravity:**

- **Rà soát & Đánh giá toàn diện hệ thống:**
  - Phân tích kiến trúc NestJS 11, TypeORM, SQL Server, BullMQ, Cloudflare R2.
  - Lập báo cáo kiểm tra độ sẵn sàng Production tại [`docs/production-readiness-review.md`](file:///d:/DoAnTotNghiepCuNhan/HeThongQuanLyKienTap/docs/production-readiness-review.md) phát hiện 10 lỗ hổng bảo mật và rủi ro vận hành quan trọng.
- **Khắc phục lỗi Auth Bypass & IDOR (Insecure Direct Object Reference):**
  - Khởi tạo `@CurrentUser()` decorator lấy danh tính xác thực từ JWT token trong `user.decorator.ts`.
  - Bổ sung `@UseGuards(AuthGuard)` bảo vệ toàn bộ các endpoint tại `auth.controller.ts`, `sinh-vien.controller.ts`, `giang-vien.controller.ts`. Loại bỏ việc nhận `studentId`, `lecturerId`, `accountId` từ client parameters.
- **Khắc phục Race Condition & Tranh chấp dữ liệu trong Đăng ký Chuyến đi:**
  - Áp dụng Pessimistic Write Locking (`pessimistic_write` / `UPDLOCK`) và bọc toàn bộ thao tác trong `dataSource.transaction(...)` trong `sinh-vien.service.ts` để chống overbooking.
- **Khắc phục tính Nguyên tử (Atomicity) của Database Transaction:**
  - Bọc các thao tác thanh toán lệ phí, phê duyệt hủy chuyến, cập nhật trạng thái trong `dataSource.transaction(...)` ở `sinh-vien.service.ts` và `khoa.service.ts`.
- **Cấu hình Bảo mật Production & Kiểm soát Tệp tải lên:**
  - Ép buộc kiểm tra `JWT_SECRET` bắt buộc cấu hình trong môi trường Production tại `auth.guard.ts`.
  - Động hóa cấu hình CORS từ biến môi trường `process.env.CORS_ORIGIN` tại `main.ts`.
  - Thêm `FileTypeValidator` và `AuthGuard` vào endpoint tải tệp và đính kèm minh chứng tại `upload.controller.ts`.
- **Hoàn thiện Hàng đợi Xử lý Nền (Background Queue Processing):**
  - Triển khai logic xuất file Excel thực tế trong `handleExportFile` tại `task-queue.service.ts`, lưu trữ báo cáo xuất tại `uploads/excels/`.
- **Kiểm thử E2E & Biên dịch hệ thống:**
  - Viết test E2E bảo mật `auth-idor.e2e-spec.ts`.
  - Kiểm tra biên dịch `npm run build` thành công 100% không có lỗi.

---

## 20. Triển khai Mô hình Đăng ký Theo Khung Giờ & Xét Duyệt Hàng Loạt (Time-Window Batch Allocation)

**Người dùng:**

> Ở chức năng đăng ký chuyến tham quan của sinh viên thì kiểu sinh viên đăng ký là không có giới hạn, chỉ mở theo giờ (ví dụ: mở từ 7h-20h ngày 25/7 là có bao nhiêu đăng ký trong khoảng thời gian đó là nhận hết), sau khi hết giờ thì quản lý khoa sẽ nhận danh sách đăng ký và tiến hành lọc theo các mục đề ra. Hãy triển khai code theo mô hình này.

**Antigravity:**

- **Bổ sung Khung giờ Đăng ký vào CSDL:**
  - Thêm 2 thuộc tính `thoi_gian_mo_dang_ky` và `thoi_gian_dong_dang_ky` vào entity `ChuyenThamQuan` (`qlkt.entity.ts`).
- **Giai đoạn 1: Tiếp nhận Đăng ký theo Khung giờ (`sinh-vien.service.ts`):**
  - Kiểm tra thời gian hiện tại nằm trong khung giờ mở cổng.
  - Loại bỏ hoàn toàn việc chặn sức chứa `suc_chua` tức thì khi bấm đăng ký. Tiếp nhận 100% sinh viên đủ điều kiện trong khung giờ và chốt phiếu ở trạng thái `'ChoDuyet'`. Chưa tạo hóa đơn lệ phí ngay.
- **Giai đoạn 2: Phân bổ & Xét duyệt Hàng loạt tự động (`khoa.service.ts`):**
  - Cập nhật hàm `filterAndAssignStudents(tripId)` chạy nguyên tử trong `dataSource.transaction(...)`.
  - Tự động lọc danh sách phiếu `'ChoDuyet'` theo 4 tầng ưu tiên (Sinh viên năm cuối -> Chưa đi chuyến nào -> Không có điểm phạt -> Đăng ký sớm).
  - Phân bổ đúng mốc `suc_chua` nhà máy: Top N sinh viên được chuyển sang trạng thái `'HopLe'` và tự động phát hành `HoaDonLePhi` (hạn đóng 3 ngày). Các sinh viên dôi ra chuyển sang trạng thái `'BiLoai'`.

---

## 21. Tích hợp Logo Trường HUIT Hòa hợp trên Giao diện Web & Mobile

**Người dùng:**

> Hãy sử dụng ảnh logo trường đưa vào những chỗ phù hợp trên giao diện (cả web và mobile). Source: images. Tinh chỉnh logo hiển thị hòa hợp, không bị đóng khung bo góc thô cứng, và phóng to rõ nét tên trường HUIT ở góc trái thanh Header Bar màu trắng.

**Antigravity:**

- **Sao chép và Quản lý Tài nguyên Assets:**
  - Sao chép tệp logo `images/logo-huit-truong-dai-hoc-cong-thuong-tp-hcm-png-vector-3.png` sang `frontend/public/huit-logo.png`, `frontend/src/assets/huit-logo.png` và `mobile/assets/images/huit_logo.png`.
  - Khai báo asset trong `mobile/pubspec.yaml`.
- **Tích hợp & Thiết kế Logo Tự nhiên trên Web App (React):**
  - Tích hợp Logo HUIT dạng PNG nguyên bản (`h-11 md:h-[46px] w-auto object-contain`) nằm tự nhiên ở vị trí góc trái thanh Header Bar màu trắng (`Layout.jsx`), cạnh vạch phân cách và tiêu đề `IMS Portal > Trang chủ` (độ rộng tự nhiên ~200px giúp toàn bộ chữ tên trường HUIT to rõ, sắc nét 100%).
  - Loại bỏ các ô khung vuông bo góc thô xung quanh logo ở cả trang Đăng nhập (`Login.jsx`) và thanh điều hướng.
- **Tích hợp trên Mobile App (Flutter):**
  - Đặt Logo HUIT tự nhiên trên màn hình Đăng nhập Mobile (`login_screen.dart`), loại bỏ container bo góc thô cứng.
  - Bổ sung Logo HUIT thu nhỏ bên cạnh tiêu đề AppBar trên toàn bộ các cổng thông tin di động (`student_portal.dart` & `lecturer_portal.dart`).
- **Xác minh & Biên dịch:**
  - Chạy `npm run build` kiểm tra biên dịch thành công 100%.

