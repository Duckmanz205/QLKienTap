# Kế hoạch triển khai: Cập nhật nội dung text chỉnh sửa lên Cloudflare

## Phân tích nguyên nhân lỗi hiện tại:
Nguyên nhân file text trên Cloudflare hiển thị dòng chữ *"Không thể trích xuất văn bản từ file này"* là do quy trình upload hiện tại bị "lệch pha":
1. Khi bạn vừa chọn file PDF, API `POST /upload/report` ngay lập tức được gọi. Backend tự động tạo một file `.txt` và đẩy lên Cloudflare cùng lúc. Nếu backend đọc PDF thất bại (hoặc AI OCR chạy chậm/lỗi), nó sẽ ghi mặc định dòng chữ trên.
2. Trên giao diện (Frontend), bạn bấm nút "Trích xuất text" hoặc tự gõ chỉnh sửa nội dung. State `uploadedFile.text` được cập nhật.
3. Tuy nhiên, khi bấm nút **"Xác nhận & Nộp bài"**, frontend chỉ gửi đường dẫn file PDF (`fileBaoCaoUrl`) cho backend thông qua API `submit-report`. Toàn bộ nội dung text mà bạn đã tốn công trích xuất/chỉnh sửa trên UI **không được gửi đi**. Do đó, Cloudflare vẫn giữ file `.txt` lỗi ban đầu.

## 🔄 Workflows (Giải pháp)
1. **Luồng Frontend:**
   - Khi người dùng bấm nút **Xác nhận & Nộp bài**, thu thập nội dung text hiện tại trong ô preview (`uploadedFile.text`).
   - Gửi nội dung text này kèm theo request nộp bài (`submitReport`) xuống backend.
2. **Luồng Backend:**
   - Cập nhật DTO của API `submitReport` để nhận thêm trường `extractedText`.
   - Trong lúc ghi nhận bài thu hoạch vào DB, backend sẽ tạo lại file `.txt` với nội dung mới nhất từ `extractedText`.
   - Ghi đè (Overwrite) file `.txt` này lên Cloudflare R2 bằng đường dẫn (key) tương ứng với file PDF.

## 📋 Tasks

- [ ] **[Backend]** (`e:\Khoa_Luan\CodeDoAn\backend\src\sinh-vien\dto\sinh-vien.dto.ts`): Thêm trường `extractedText: string` vào `SubmitReportDto`.
- [ ] **[Backend]** (`e:\Khoa_Luan\CodeDoAn\backend\src\sinh-vien\sinh-vien.controller.ts`): Cập nhật hàm `submitReport` để truyền `body.extractedText` vào service.
- [ ] **[Backend]** (`e:\Khoa_Luan\CodeDoAn\backend\src\sinh-vien\sinh-vien.service.ts`): 
  - Đảm bảo `R2StorageService` đã được inject (đã có từ task trước).
  - Trong hàm `submitReport`, lấy `validBaoCaoRef` (ví dụ: `reports/MSSV/abc.pdf`), đổi đuôi thành `.txt` để làm key.
  - Chuyển `extractedText` thành Buffer (có kèm `\uFEFF` BOM để không lỗi font tiếng Việt).
  - Gọi `this.r2Storage.uploadFile(...)` để ghi đè file text lên Cloudflare R2.
- [ ] **[Frontend]** (`e:\Khoa_Luan\CodeDoAn\frontend\src\pages\sinh-vien\NopBaiThuHoach_SV.jsx`): Cập nhật payload của hàm `sinhVienApi.submitReport` trong `handleSubmit`, thêm thuộc tính `extractedText: uploadedFile.text`.
