# 🎓 QLKienTap — Hệ thống Quản lý Kiến tập Nhà máy

Hệ thống quản lý toàn diện quy trình kiến tập nhà máy dành cho sinh viên, giảng viên và quản lý khoa tại trường Đại học Công Thương TP.HCM (HUIT).

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Chức năng chính](#-chức-năng-chính)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Tài khoản thử nghiệm](#-tài-khoản-thử-nghiệm)
- [Cơ sở dữ liệu](#-cơ-sở-dữ-liệu)
- [Tác giả](#-tác-giả)

---

## 🔍 Tổng quan

**QLKienTap** là đồ án khóa luận tốt nghiệp xây dựng hệ thống phần mềm hỗ trợ quản lý hoạt động kiến tập nhà máy, bao gồm:

- Lập kế hoạch đợt kiến tập theo năm học / học kỳ
- Quản lý chuyến tham quan nhà máy (do Khoa tổ chức hoặc sinh viên tự đề xuất)
- Đăng ký, lọc danh sách sinh viên theo thứ tự ưu tiên 3 tầng
- Điểm danh, chấm điểm bài thu hoạch, hội đồng báo cáo
- Quản lý lệ phí, hoàn phí, danh sách đen
- Tổng kết kết quả học phần kiến tập

---

## 🏗️ Kiến trúc hệ thống

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend Web   │     │   Mobile App     │     │   AI Service     │
│  React + Vite    │     │   Flutter        │     │  Python/FastAPI  │
│   Port 5173      │     │  Android / iOS   │     │   Port 8000      │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                         │
         └────────────┬───────────┘                         │
                      ▼                                     │
              ┌──────────────────┐                          │
              │     Backend      │◄─────────────────────────┘
              │   NestJS API     │
              │   Port 3000      │
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

| Thành phần | Công nghệ | Phiên bản |
| :--- | :--- | :--- |
| **Backend** | NestJS (TypeScript) | v11 |
| **ORM** | TypeORM | v1.0 |
| **Database** | Microsoft SQL Server | 2019+ |
| **Frontend Web** | React + Vite | React 19, Vite 8 |
| **UI Icons** | Lucide React | v1.24 |
| **HTTP Client** | Axios | v1.18 |
| **Mobile** | Flutter (Dart) | *(đang phát triển)* |
| **AI Service** | Python + FastAPI | *(đang phát triển)* |

---

## ✨ Chức năng chính

### 👨‍🎓 Cổng Sinh viên (8 trang)
| Chức năng | Mô tả |
| :--- | :--- |
| Dashboard | Tổng quan thông tin cá nhân, lịch kiến tập |
| Đăng ký chuyến tham quan | Xem danh sách và đăng ký chuyến tham quan nhà máy |
| Lịch trình đoàn | Xem lịch trình các chuyến đã đăng ký |
| Nộp bài thu hoạch | Upload báo cáo thu hoạch sau chuyến tham quan |
| Thanh toán lệ phí | Xem hóa đơn và xác nhận thanh toán |
| Hoàn phí | Gửi yêu cầu hoàn phí khi hủy đăng ký |
| Kết quả / Điểm | Xem điểm từng chuyến và kết quả học phần |
| Thông báo | Nhận thông báo từ Khoa và giảng viên |

### 👨‍🏫 Cổng Giảng viên (8 trang)
| Chức năng | Mô tả |
| :--- | :--- |
| Dashboard | Tổng quan SV hướng dẫn, chuyến dẫn đoàn |
| Lịch dẫn đoàn | Xem các chuyến tham quan được phân công dẫn đoàn |
| Điểm danh SV | Điểm danh sinh viên tại chuyến tham quan |
| Điểm chuẩn bị & điểm cộng | Chấm điểm bài chuẩn bị, ghi nhận điểm cộng |
| SV hướng dẫn | Quản lý danh sách sinh viên được phân công hướng dẫn |
| Chấm bài thu hoạch | Chấm điểm và nhận xét bài thu hoạch |
| Hội đồng chấm báo cáo | Tham gia chấm điểm báo cáo tại hội đồng |
| Thông báo | Nhận thông báo từ Khoa |

### 🏛️ Cổng Quản lý Khoa (18 trang)
| Chức năng | Mô tả |
| :--- | :--- |
| Dashboard | Thống kê tổng quan (SV, GV, nhà máy, đợt KT) |
| Danh mục nền | Quản lý năm học, học kỳ, khóa |
| Quản lý sinh viên | Import, xem, quản lý danh sách sinh viên |
| Quản lý giảng viên | Xem danh sách giảng viên |
| Quản lý nhà máy | CRUD nhà máy / đơn vị hợp tác |
| Kế hoạch kiến tập | Tạo đợt kiến tập, lịch kiến tập |
| Chuyến tham quan | Tạo chuyến, duyệt đề xuất tự do, lọc DS 3 tầng ưu tiên |
| Quản lý đăng ký | Xem, duyệt phiếu đăng ký và yêu cầu hủy |
| Phân công GVHD | Phân công giảng viên hướng dẫn cho sinh viên |
| Phân công GV dẫn đoàn | Phân công giảng viên dẫn đoàn cho chuyến đi |
| Hội đồng chấm báo cáo | Tạo hội đồng, phân công thành viên |
| Quản lý lệ phí | Xem trạng thái thanh toán, xử lý vi phạm |
| Duyệt hoàn phí | Phê duyệt / từ chối yêu cầu hoàn phí |
| Kết quả kiến tập | Ma trận điểm, khóa điểm, tổng kết học phần |
| Tài khoản người dùng | Quản lý tài khoản hệ thống |
| Thông báo | Gửi thông báo đến SV, GV |
| Báo cáo thống kê | Báo cáo SV học lại, kết quả tổng kết |
| Xem trước báo cáo | Xem báo cáo tham quan nhà máy |

---

## 📂 Cấu trúc thư mục

```
QLKienTap/
│
├── backend/                        # NestJS API Server
│   ├── src/
│   │   ├── auth/                   #   Xác thực (đăng nhập, đổi MK)
│   │   ├── entities/qlkt.entity.ts #   33 Entity TypeORM
│   │   ├── sinh-vien/              #   Module Sinh viên
│   │   ├── giang-vien/             #   Module Giảng viên
│   │   ├── khoa/                   #   Module Quản lý Khoa
│   │   ├── app.module.ts           #   Cấu hình gốc (DB, modules)
│   │   └── main.ts                 #   Entry point (CORS, port)
│   ├── .env                        #   Biến môi trường
│   └── package.json
│
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx           #   Trang đăng nhập
│   │   │   ├── sinh-vien/          #   8 trang Sinh viên
│   │   │   ├── giang-vien/         #   8 trang Giảng viên
│   │   │   └── khoa/               #   18 trang Quản lý Khoa
│   │   ├── components/             #   Component dùng chung (Layout...)
│   │   ├── services/api.js         #   Axios API client
│   │   └── App.jsx                 #   Router chính
│   ├── vite.config.js
│   └── package.json
│
├── ai-service/                     # Python AI Microservice
│   ├── src/main.py                 #   FastAPI entry point
│   ├── models/                     #   File model đã train
│   ├── notebooks/                  #   Jupyter Notebooks
│   ├── data/                       #   Dữ liệu huấn luyện
│   └── requirements.txt
│
├── mobile/                         # Flutter Mobile App
│   └── (flutter create ...)
│
├── TaiLieu/                        # Tài liệu đồ án
├── README.md                       # File này
└── README_SETUP.md                 # Hướng dẫn cài đặt chi tiết
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Node.js** v18+
- **Microsoft SQL Server** 2019+
- **SSMS** hoặc Azure Data Studio

### Khởi chạy nhanh

**1. Tạo database**
```sql
CREATE DATABASE QLKienTap;
```

**2. Cấu hình backend** — Sửa file `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=<mật_khẩu_SQL_Server>
DB_DATABASE=QLKienTap
PORT=3000
```

**3. Chạy Backend** (Terminal 1):
```bash
cd backend
npm install
npm run start:dev
```

**4. Chạy Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm run dev
```

**5. Truy cập**: Mở trình duyệt → **http://localhost:5173**

> 📖 Xem hướng dẫn đầy đủ tại [README_SETUP.md](./README_SETUP.md)

---

## 🔑 Tài khoản thử nghiệm

| Vai trò | Tên đăng nhập | Mật khẩu |
| :--- | :--- | :--- |
| Quản lý Khoa | `admin01` | `AdminHuit2025` |
| Sinh viên | *MSSV bất kỳ trong DB* | `SvHuit2025` |
| Giảng viên | *Mã GV bất kỳ trong DB* | `GvHuit2025` |

---

## 🗄️ Cơ sở dữ liệu

Hệ thống sử dụng **33 bảng** trên SQL Server, được định nghĩa qua TypeORM Entity:

| Nhóm | Bảng | Mô tả |
| :--- | :--- | :--- |
| **Danh mục nền** | NamHoc, HocKy, Khoa | Năm học, học kỳ, khóa sinh viên |
| **Người dùng** | TaiKhoan, SinhVien, GiangVien | Tài khoản đăng nhập & thông tin cá nhân |
| **Kiến tập** | DotKienTap, LichKienTap, LichKienTap_SinhVien | Đợt kiến tập, lịch & đăng ký SV |
| **Tham quan** | NhaMay, ChuyenThamQuan, ChuyenThamQuan_GiangVienDanDoan | Nhà máy, chuyến tham quan, GV dẫn đoàn |
| **Đăng ký** | PhieuDangKy, YeuCauHuyDangKy, DanhSachDen | Phiếu ĐK, yêu cầu hủy, blacklist |
| **Tài chính** | HoaDonLePhi, DonHoanPhi | Hóa đơn lệ phí, đơn hoàn phí |
| **Chấm điểm** | DiemDanh, BaiThuHoach, DiemPhieuDangKy, NhatKyDiemCong | Điểm danh, bài TH, điểm, điểm cộng |
| **Hội đồng** | HoiDongChamBaoCao, HoiDong_ThanhVien, DiemHoiDong_ChiTiet | Hội đồng & chấm báo cáo |
| **Tổng kết** | BoChuyenBaoCao, BoChuyenBaoCao_Chuyen, KetQuaHocPhan | Bộ 3 chuyến báo cáo, kết quả cuối |
| **Hệ thống** | ThongBao, ThongBaoFile, ThongBaoDaDoc, NhacNho, PhanCongGVHD | Thông báo, nhắc nhở, phân công |

---

## 👤 Tác giả

- **Sinh viên thực hiện**: *(Điền tên)*
- **MSSV**: *(Điền MSSV)*
- **Giảng viên hướng dẫn**: *(Điền tên GVHD)*
- **Trường**: Đại học Công Thương TP.HCM (HUIT)
- **Năm**: 2025 – 2026

---

## 📄 Giấy phép

Đồ án này được thực hiện phục vụ mục đích học tập và nghiên cứu.