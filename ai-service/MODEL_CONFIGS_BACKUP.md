# 📚 TÀI LIỆU LƯU TRỮ VÀ HƯỚNG DẪN CẤU HÌNH CÁC MODEL AI (AI SERVICE)
*Dự án: Hệ thống Quản lý và Chấm điểm Báo cáo Kiến tập Sinh viên HUIT*

---

## 1. MỤC ĐÍCH TÀI LIỆU
Tài liệu này lưu trữ đầy đủ, an toàn và chi tiết cấu hình của các mô hình AI phục vụ 2 tác vụ nòng cốt:
1. **Trích xuất văn bản thị giác (OCR Engine)**: `deepseek-v4.1-flash`
2. **Hội đồng Giám khảo Chấm điểm (Grading Engine)**: 
   - **Cấu hình 1 (Chuyên sâu - Độ chính xác cao nhất)**: `qwen3.8-max-0902` (Bật suy luận CoT)
   - **Cấu hình 2 (Demo siêu tốc - Phản hồi tức thì)**: `deepseek-v4.1-flash-1017` (Tắt suy luận)

---

## 2. CẤU HÌNH CHI TIẾT CỦA MODEL CHUYÊN SÂU: `qwen3.8-max-0902`
> **Lưu trữ an toàn để khôi phục nhanh khi bảo vệ khóa luận hoặc nghiệm thu chính thức.**

* **Mã định danh mô hình:** `qwen3.8-max-0902` (Alias: `qwen3.8-max-2026-09-02`)
* **Nhà cung cấp:** Alibaba Cloud ModelStudio / Qwen Cloud (MaaS AP-Southeast-1)
* **Bản chất:** Mô hình Flagship đầu bảng của Qwen, tối ưu hóa cho tác vụ Agent cộng tác và suy luận logic dài hạn (Long-horizon reasoning).
* **Tham số kỹ thuật tối ưu:**
  ```python
  model = "qwen3.8-max-0902"
  temperature = 0.05
  max_tokens = 4000
  response_format = {"type": "json_object"}
  extra_body = {
      "enable_thinking": True  # BẬT CHUỖI SUY LUẬN CHUYÊN SÂU
  }
  ```
* **Hiệu năng & Đặc điểm thực tế đã kiểm chứng qua Benchmark:**
  * **Thời gian chấm trung bình:** `64.72 giây` cho toàn bộ 3 Giám khảo AI song song.
  * **Độ dài chuỗi suy luận:** `5,000 đến 9,422 ký tự suy luận CoT / tiêu chí`.
  * **Độ chính xác:** Đạt mức cao nhất. Phát hiện sinh viên copy râu ông nọ cắm cằm bà kia (quy trình gốm sứ vào nhà máy Ajinomoto), phân biệt rành mạch giữa tập đoàn mẹ và từng chi nhánh nhà máy tham quan, rà soát đủ 31-32 mục VSATTP.

---

## 3. CẤU HÌNH MODEL DEMO SIÊU TỐC: `deepseek-v4.1-flash-1017`
> **Đang kích hoạt để phục vụ Demo nhanh, quay video, hoặc test giao diện.**

* **Mã định danh mô hình:** `deepseek-v4.1-flash-1017`
* **Lưu ý quan trọng:** Mã `deepseek-v4.1-flash-1017` là snapshot mới nhất (Oct 18, 2026), khác với mã `deepseek-v4.1-flash` dùng cho OCR thị giác.
* **Tham số kỹ thuật tối ưu:**
  ```python
  model = "deepseek-v4.1-flash-1017"
  temperature = 0.05
  max_tokens = 2500
  response_format = {"type": "json_object"}
  extra_body = {
      "enable_thinking": False  # TẮT SUY LUẬN ĐỂ TRẢ KẾT QUẢ TỨC THÌ
  }
  ```
* **Hiệu năng kỳ vọng:**
  * **Thời gian phản hồi:** Khoảng `1 – 3 giây` cho mỗi Agent.
  * **Định dạng:** Ép chuẩn JSON Schema theo cấu trúc Pydantic của hệ thống.

---

## 4. CẤU HÌNH MODEL OCR THỊ GIÁC: `deepseek-v4.1-flash`
* **Mã định danh mô hình:** `deepseek-v4.1-flash`
* **Tác vụ:** Quét từng trang PDF được render ảnh 150 DPI, trích xuất văn bản viết tay, bảng kiểm tra VSATTP, và sơ đồ khối.
* **Tham số kỹ thuật:**
  ```python
  model = "deepseek-v4.1-flash"
  temperature = 0.01
  max_tokens = 4000
  stream = True
  extra_body = {
      "enable_thinking": False
  }
  ```
* **Tốc độ xử lý:** `3.3 – 7.3 giây / trang` (Trung bình ~4.5 - 5.1s/trang).

---

## 5. HƯỚNG DẪN CHUYỂN ĐỔI QUA LẠI GIỮA CÁC MODEL (1 DÒNG DUY NHẤT)

Trong file `ai-service/src/model_profiles.py` (hoặc `ai-service/src/main.py`), chỉ cần trỏ biến:

* **Khi muốn dùng DeepSeek-V4.1-Flash-1017 (Demo Siêu Tốc):**
  ```python
  ACTIVE_GRADING_PROFILE = PROFILE_GRADING_DEEPSEEK_FLASH_1017
  ```
* **Khi muốn quay lại Qwen3.8-Max-0902 (Chấm chính xác cao nhất):**
  ```python
  ACTIVE_GRADING_PROFILE = PROFILE_GRADING_QWEN38_MAX
  ```
