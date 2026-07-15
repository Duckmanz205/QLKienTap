# 🤖 AI Service — Mô hình AI cho QLKienTap

## Mục đích

Thư mục này chứa toàn bộ mã nguồn liên quan đến mô hình AI/ML phục vụ hệ thống Quản lý Kiến tập.

## Cấu trúc thư mục

```
ai-service/
├── data/               ← Dữ liệu huấn luyện / test (CSV, JSON...)
├── models/             ← File model đã train (.pkl, .h5, .onnx, .pt...)
├── notebooks/          ← Jupyter Notebooks thử nghiệm & phân tích
├── src/                ← Mã nguồn chính
│   ├── main.py         ← Entry point (FastAPI / Flask server)
│   ├── predict.py      ← Logic inference / dự đoán
│   └── train.py        ← Script huấn luyện model
├── requirements.txt    ← Thư viện Python cần thiết
└── README.md           ← File này
```

## Cách tích hợp với Backend (NestJS)

AI Service chạy như một **microservice riêng biệt** (thường dùng FastAPI hoặc Flask):

```
Frontend (React) ──▶ Backend (NestJS :3000) ──▶ AI Service (FastAPI :8000)
                                               │
Mobile (Flutter) ──────────────────────────────┘
```

- Backend gọi AI Service qua **HTTP REST API** (ví dụ: `POST http://localhost:8000/predict`)
- AI Service **không** kết nối trực tiếp vào SQL Server, mà nhận dữ liệu từ Backend

## Khởi chạy nhanh

```bash
cd ai-service
pip install -r requirements.txt
python src/main.py
```

## Gợi ý ứng dụng AI cho QLKienTap

- Chấm điểm tự động bài thu hoạch (`diem_bai_thu_hoach_ai`)
- Gợi ý phân công GVHD dựa trên lịch sử
- Dự đoán sinh viên có nguy cơ không đạt
- Phát hiện trùng lặp / đạo văn báo cáo
