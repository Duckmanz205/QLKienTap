/* ============================================================================
   CƠ SỞ DỮ LIỆU: HỆ THỐNG QUẢN LÝ KIẾN TẬP
   SQL Server (T-SQL)
   Mỗi bảng có ghi chú (UCxx) tương ứng chức năng trong hồ sơ đặc tả UC
   Quy ước: PascalCase cho tên bảng, snake_case cho tên cột
   Quy ước trạng thái: lưu dạng mã không dấu (dễ so sánh ở code), tên đầy đủ
                        tiếng Việt được map ở tầng ứng dụng / view
   ============================================================================ */
/*USE master;
GO
ALTER DATABASE QLKienTap SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE QLKienTap;
GO*/
CREATE DATABASE QLKienTap;
GO
USE QLKienTap;
GO

/* ============================================================================
   PHẦN 1 — DANH MỤC NỀN & TÀI KHOẢN  (UC1-4, UC5, UC7, UC8, UC11)
   ============================================================================ */

CREATE TABLE NamHoc (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    ten_nam_hoc     NVARCHAR(20)  NOT NULL UNIQUE,        -- vd: '2025-2026'
    ngay_bat_dau    DATE          NOT NULL,
    ngay_ket_thuc   DATE          NOT NULL,
    CONSTRAINT CK_NamHoc_Ngay CHECK (ngay_ket_thuc > ngay_bat_dau)
);

CREATE TABLE HocKy (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    nam_hoc_id      INT           NOT NULL FOREIGN KEY REFERENCES NamHoc(id),
    ten_hoc_ky      NVARCHAR(20)  NOT NULL,                -- 'Học kỳ 1'
    ngay_bat_dau    DATE          NOT NULL,
    ngay_ket_thuc   DATE          NOT NULL,
    CONSTRAINT CK_HocKy_Ngay CHECK (ngay_ket_thuc > ngay_bat_dau),
    CONSTRAINT UQ_HocKy UNIQUE (nam_hoc_id, ten_hoc_ky)
);

CREATE TABLE Khoa (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    ten_khoa        NVARCHAR(20)  NOT NULL UNIQUE,         -- '14ĐHTP', '13ĐHTP'...
    nam_nhap_hoc    INT           NOT NULL
);

CREATE TABLE TaiKhoan (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    ten_dang_nhap       NVARCHAR(50)  NOT NULL UNIQUE,
    mat_khau_hash       NVARCHAR(255) NOT NULL,
    vai_tro             NVARCHAR(20)  NOT NULL
        CHECK (vai_tro IN (N'QuanLyKhoa', N'GiangVien', N'SinhVien')),
    trang_thai          NVARCHAR(20)  NOT NULL DEFAULT N'HoatDong'
        CHECK (trang_thai IN (N'HoatDong', N'KhoaTaiKhoan')),
    phai_doi_mat_khau   BIT           NOT NULL DEFAULT 1,   -- ép đổi MK lần đầu (UC4)
    lan_dang_nhap_cuoi  DATETIME2     NULL,
    ngay_tao            DATETIME2     NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE SinhVien (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    mssv            NVARCHAR(15)  NOT NULL UNIQUE,
    ho_ten          NVARCHAR(100) NOT NULL,
    taikhoan_id     INT           NOT NULL UNIQUE FOREIGN KEY REFERENCES TaiKhoan(id),
    khoa_id         INT           NOT NULL FOREIGN KEY REFERENCES Khoa(id),
    ten_lop         NVARCHAR(20)  NULL,
    email           NVARCHAR(100) NULL,
    sdt             NVARCHAR(15)  NULL,
    hoc_lai         BIT           NOT NULL DEFAULT 0        -- SV khóa cũ học lại
);

CREATE TABLE GiangVien (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    ma_gv                   NVARCHAR(15)  NOT NULL UNIQUE,
    ho_ten                  NVARCHAR(100) NOT NULL,
    taikhoan_id             INT           NOT NULL UNIQUE FOREIGN KEY REFERENCES TaiKhoan(id),
    email                   NVARCHAR(100) NULL,
    sdt                     NVARCHAR(15)  NULL,
    du_dk_hoi_dong          BIT           NOT NULL DEFAULT 0, -- đủ điều kiện làm thành viên hội đồng (UC24)
    so_sv_toi_da_huong_dan  INT           NULL                -- quota GVHD, để NULL khi khoa chưa chốt số liệu (UC18)
);

CREATE TABLE NhaMay (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    ten_nha_may         NVARCHAR(150) NOT NULL,
    dia_chi             NVARCHAR(255) NULL,
    nhom_nganh          NVARCHAR(50)  NULL,          -- 'Đồ uống', 'Sữa - dầu - chất béo'...
    ho_tro_truc_tiep    BIT           NOT NULL DEFAULT 1,
    ho_tro_truc_tuyen   BIT           NOT NULL DEFAULT 0,
    trang_thai          NVARCHAR(20)  NOT NULL DEFAULT N'HoatDong'
        CHECK (trang_thai IN (N'HoatDong', N'NgungHopTac'))  -- không xóa cứng, chỉ đổi trạng thái
);


/* ============================================================================
   PHẦN 2 — THÔNG BÁO & NHẮC NHỞ  (UC6, UC12, UC21)
   ============================================================================ */

CREATE TABLE ThongBao (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    tieu_de         NVARCHAR(255)   NOT NULL,
    noi_dung        NVARCHAR(MAX)   NOT NULL,
    nguoi_gui_id    INT             NOT NULL FOREIGN KEY REFERENCES TaiKhoan(id),
    khoa_id         INT             NULL FOREIGN KEY REFERENCES Khoa(id),   -- NULL = gửi tất cả
    ngay_gui        DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    da_chinh_sua    BIT             NOT NULL DEFAULT 0
);

CREATE TABLE ThongBaoFile (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    thongbao_id     INT             NOT NULL FOREIGN KEY REFERENCES ThongBao(id),
    ten_file        NVARCHAR(255)   NOT NULL,
    duong_dan       NVARCHAR(500)   NOT NULL,
    dung_luong_kb   INT             NOT NULL
);

CREATE TABLE ThongBaoDaDoc (       -- phục vụ UC21 Xem thông báo: đánh dấu đã đọc/chưa đọc
    id              INT IDENTITY(1,1) PRIMARY KEY,
    thongbao_id     INT             NOT NULL FOREIGN KEY REFERENCES ThongBao(id),
    taikhoan_id     INT             NOT NULL FOREIGN KEY REFERENCES TaiKhoan(id),
    ngay_doc        DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_ThongBaoDaDoc UNIQUE (thongbao_id, taikhoan_id)
);

CREATE TABLE NhacNho (             -- hàng đợi nhắc nhở tự động (UC12)
    id              INT IDENTITY(1,1) PRIMARY KEY,
    taikhoan_id     INT             NOT NULL FOREIGN KEY REFERENCES TaiKhoan(id),
    loai            NVARCHAR(30)    NOT NULL
        CHECK (loai IN (N'HanNopBaoCao', N'HanDongPhi', N'HanBaoLuu18Thang',
                         N'LichDanDoan', N'LichBaoCaoHoiDong', N'LichThamQuan')),
    noi_dung        NVARCHAR(500)   NOT NULL,
    doi_tuong_id    INT             NULL,      -- id bản ghi liên quan (chuyến, phiếu, ...) để trace
    ngay_du_kien_gui DATETIME2      NOT NULL,
    da_gui          BIT             NOT NULL DEFAULT 0,
    ngay_gui_thuc_te DATETIME2      NULL
);


/* ============================================================================
   PHẦN 3 — ĐỢT & LỊCH KIẾN TẬP  (UC9, UC13)
   ============================================================================ */

CREATE TABLE DotKienTap (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    ten_dot         NVARCHAR(150)   NOT NULL,
    nam_hoc_id      INT             NOT NULL FOREIGN KEY REFERENCES NamHoc(id),
    hoc_ky_id       INT             NOT NULL FOREIGN KEY REFERENCES HocKy(id),
    ngay_bat_dau    DATE            NOT NULL,
    ngay_ket_thuc   DATE            NOT NULL,
    trang_thai      NVARCHAR(20)    NOT NULL DEFAULT N'Nhap'
        CHECK (trang_thai IN (N'Nhap', N'DangTrienKhai', N'DaKetThuc', N'DaKhoa', N'DaHuy')),
    CONSTRAINT CK_DotKienTap_Ngay CHECK (ngay_ket_thuc > ngay_bat_dau),
    CONSTRAINT UQ_DotKienTap UNIQUE (nam_hoc_id, hoc_ky_id, ten_dot)
    -- Quy tắc nghiệp vụ: trạng thái được TÍNH TOÁN TỰ ĐỘNG từ trạng thái các
    -- LichKienTap con (không cho người dùng sửa tay) — xử lý ở tầng ứng dụng/trigger
);

CREATE TABLE LichKienTap (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    dot_kien_tap_id         INT             NOT NULL FOREIGN KEY REFERENCES DotKienTap(id),
    khoa_id                 INT             NOT NULL FOREIGN KEY REFERENCES Khoa(id),
    ten_lich                NVARCHAR(150)   NOT NULL,
    tg_mo_dang_ky_tu        DATETIME2       NOT NULL,
    tg_mo_dang_ky_den       DATETIME2       NOT NULL,
    tg_dien_ra_tu           DATE            NOT NULL,
    tg_dien_ra_den          DATE            NOT NULL,
    han_chot_nop_bao_cao    DATETIME2       NOT NULL,
    han_chot_diem           DATETIME2       NOT NULL,
    trang_thai              NVARCHAR(20)    NOT NULL DEFAULT N'Nhap'
        CHECK (trang_thai IN (N'Nhap', N'MoDangKy', N'DangDienRa', N'DaKetThuc', N'DaKhoa')),
    CONSTRAINT CK_LichKienTap_DangKy CHECK (tg_mo_dang_ky_den <= tg_dien_ra_tu),
    CONSTRAINT CK_LichKienTap_BaoCaoTruocChot CHECK (han_chot_diem > han_chot_nop_bao_cao)
    -- Quy tắc nghiệp vụ: han_chot_nop_bao_cao và han_chot_diem phải sau tg_dien_ra_den
    -- (kiểm tra ở tầng ứng dụng vì phụ thuộc dữ liệu vừa nhập trong cùng giao dịch)
);

CREATE TABLE LichKienTap_SinhVien (   -- danh sách SV đăng ký học phần (import từ phòng đào tạo)
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    lich_kien_tap_id    INT             NOT NULL FOREIGN KEY REFERENCES LichKienTap(id),
    sinh_vien_id        INT             NOT NULL FOREIGN KEY REFERENCES SinhVien(id),
    lan_dang_ky         INT             NOT NULL DEFAULT 1,   -- lần đăng ký học phần thứ mấy của SV này
    trang_thai          NVARCHAR(20)    NOT NULL DEFAULT N'DangThucHien'
        CHECK (trang_thai IN (N'DangThucHien', N'Dat', N'KhongDat')),
    ngay_them           DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    -- Quy tắc nghiệp vụ (UC13): 1 SV chỉ thuộc 1 LichKienTap đang "DangThucHien" tại 1 thời điểm
    CONSTRAINT UQ_LichKienTap_SinhVien UNIQUE (lich_kien_tap_id, sinh_vien_id)
);
CREATE INDEX IX_LKTSV_SinhVien ON LichKienTap_SinhVien(sinh_vien_id, trang_thai);


/* ============================================================================
   PHẦN 4 — CHUYẾN THAM QUAN & ĐĂNG KÝ  (UC10, UC14, UC15, UC16, UC17)
   ============================================================================ */

CREATE TABLE ChuyenThamQuan (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    nha_may_id              INT             NOT NULL FOREIGN KEY REFERENCES NhaMay(id),
    lich_kien_tap_id        INT             NOT NULL FOREIGN KEY REFERENCES LichKienTap(id),
    ngay_tham_quan          DATE            NOT NULL,
    gio_bat_dau             TIME            NOT NULL,
    gio_ket_thuc            TIME            NOT NULL,
    hinh_thuc               NVARCHAR(15)    NOT NULL
        CHECK (hinh_thuc IN (N'TrucTiep', N'TrucTuyen')),
    cach_to_chuc            NVARCHAR(15)    NOT NULL DEFAULT N'DoKhoaToChuc'
        CHECK (cach_to_chuc IN (N'DoKhoaToChuc', N'TuDo')),
    suc_chua                INT             NOT NULL,
    trang_thai              NVARCHAR(20)    NOT NULL DEFAULT N'Nhap'
        CHECK (trang_thai IN (N'Nhap', N'MoDangKy', N'DaChotDanhSach', N'DaDienRa', N'DaHuy')),
    -- Áp dụng khi cach_to_chuc = 'TuDo' (SV đề xuất, cần khoa duyệt trong vòng 24h — UC10)
    de_xuat_boi_id          INT             NULL FOREIGN KEY REFERENCES SinhVien(id),
    trang_thai_duyet_tudo   NVARCHAR(15)    NULL
        CHECK (trang_thai_duyet_tudo IN (N'ChoDuyet', N'DaDuyet', N'TuChoi')),
    nguoi_duyet_id          INT             NULL FOREIGN KEY REFERENCES TaiKhoan(id),
    ngay_duyet              DATETIME2       NULL,
    CONSTRAINT CK_ChuyenThamQuan_Gio CHECK (gio_ket_thuc > gio_bat_dau),
    CONSTRAINT CK_ChuyenThamQuan_SucChua CHECK (suc_chua > 0),
    -- Chỉ nhà máy có ho_tro_truc_tuyen = 1 mới được tạo chuyến hinh_thuc = 'TrucTuyen' (kiểm tra ở trigger/app)
    CONSTRAINT CK_ChuyenThamQuan_TuDo CHECK (
        (cach_to_chuc = N'DoKhoaToChuc' AND de_xuat_boi_id IS NULL)
        OR (cach_to_chuc = N'TuDo' AND de_xuat_boi_id IS NOT NULL)
    ),
    -- Quy tắc nghiệp vụ (UC10): mỗi chuyến tự do chỉ phục vụ đúng 1 sinh viên,
    -- tránh trường hợp 2 SV chung 1 chuyến tự do nhưng có GVHD khác nhau
    CONSTRAINT CK_ChuyenThamQuan_TuDo_SucChua CHECK (
        cach_to_chuc <> N'TuDo' OR suc_chua = 1
    )
);
CREATE INDEX IX_ChuyenThamQuan_Lich ON ChuyenThamQuan(lich_kien_tap_id);
CREATE INDEX IX_ChuyenThamQuan_NhaMay ON ChuyenThamQuan(nha_may_id, ngay_tham_quan);

CREATE TABLE ChuyenThamQuan_GiangVienDanDoan (   -- N-N: 1 chuyến có thể nhiều GV dẫn đoàn (UC19)
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    chuyen_tham_quan_id     INT             NOT NULL FOREIGN KEY REFERENCES ChuyenThamQuan(id),
    giang_vien_id           INT             NOT NULL FOREIGN KEY REFERENCES GiangVien(id),
    la_truong_doan          BIT             NOT NULL DEFAULT 1,  -- người ghi điểm cộng chính thức
    CONSTRAINT UQ_Chuyen_GVDanDoan UNIQUE (chuyen_tham_quan_id, giang_vien_id)
    -- Quy tắc nghiệp vụ (UC19): 1 GV không được dẫn 2 đoàn trùng ngày/giờ (kiểm tra ở app)
    -- Với chuyến tự do (UC10/UC18): dòng ở đây được 2 trigger cuối file tự động
    -- chèn vào — KHÔNG có bước "Quản lý khoa phân công thủ công" như chuyến thường.
    -- Chuyến tự do CHƯA có dòng nào trong bảng này = đang ở trạng thái "Chờ gán GV dẫn đoàn".
);

CREATE TABLE PhieuDangKy (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    sinh_vien_id            INT             NOT NULL FOREIGN KEY REFERENCES SinhVien(id),
    chuyen_tham_quan_id     INT             NOT NULL FOREIGN KEY REFERENCES ChuyenThamQuan(id),
    ngay_dang_ky            DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    trang_thai              NVARCHAR(20)    NOT NULL DEFAULT N'ChoDuyet'
        CHECK (trang_thai IN (N'ChoDuyet', N'HopLe', N'BiLoai', N'DaHuy',
                               N'DaThamGia', N'VangMat', N'HoanThanh', N'KhongDat')),
    CONSTRAINT UQ_PhieuDangKy UNIQUE (sinh_vien_id, chuyen_tham_quan_id)
    -- SV được đăng ký trùng nhà máy ở NHIỀU chuyến khác nhau để cải thiện điểm,
    -- ràng buộc UNIQUE này chỉ chặn đăng ký trùng đúng 1 chuyến 2 lần
);
CREATE INDEX IX_PhieuDangKy_SinhVien ON PhieuDangKy(sinh_vien_id, trang_thai);
CREATE INDEX IX_PhieuDangKy_Chuyen ON PhieuDangKy(chuyen_tham_quan_id, trang_thai);

CREATE TABLE YeuCauHuyDangKy (     -- UC16, kèm minh chứng để UC14 duyệt
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dang_ky_id        INT             NOT NULL UNIQUE FOREIGN KEY REFERENCES PhieuDangKy(id),
    ly_do                   NVARCHAR(500)   NOT NULL,
    file_minh_chung         NVARCHAR(500)   NULL,
    ngay_yeu_cau            DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    trang_thai_duyet        NVARCHAR(15)    NOT NULL DEFAULT N'ChoDuyet'
        CHECK (trang_thai_duyet IN (N'ChoDuyet', N'DaDuyet', N'TuChoi')),
    nguoi_duyet_id          INT             NULL FOREIGN KEY REFERENCES TaiKhoan(id),
    ngay_duyet              DATETIME2       NULL
);

CREATE TABLE DanhSachDen (         -- UC17 bước 1: lọc loại trước khi xếp ưu tiên
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    sinh_vien_id            INT             NOT NULL FOREIGN KEY REFERENCES SinhVien(id),
    ly_do                   NVARCHAR(20)    NOT NULL
        CHECK (ly_do IN (N'KhongDongPhi', N'DangKyKhongThamGia', N'HuyKhongMinhChung')),
    phieu_dang_ky_id        INT             NULL FOREIGN KEY REFERENCES PhieuDangKy(id),  -- bản ghi gốc gây ra
    ngay_ghi_nhan           DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    con_hieu_luc            BIT             NOT NULL DEFAULT 1
);
CREATE INDEX IX_DanhSachDen_SinhVien ON DanhSachDen(sinh_vien_id, con_hieu_luc);


/* ============================================================================
   PHẦN 5 — THANH TOÁN & HOÀN PHÍ  (UC30, UC31)
   ============================================================================ */

CREATE TABLE HoaDonLePhi (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dang_ky_id        INT             NOT NULL UNIQUE FOREIGN KEY REFERENCES PhieuDangKy(id),
    so_tien                 DECIMAL(12,0)   NOT NULL,
    noi_dung_chuyen_khoan   NVARCHAR(100)   NOT NULL,   -- mã hệ thống tự sinh (MSSV_MaChuyen)
    han_dong                DATETIME2       NOT NULL,
    ngay_dong_thuc_te       DATETIME2       NULL,
    trang_thai              NVARCHAR(20)    NOT NULL DEFAULT N'ChuaDong'
        CHECK (trang_thai IN (N'ChuaDong', N'DaDongDungHan', N'ViPham', N'DaHoanPhi'))
);

CREATE TABLE DonHoanPhi (          -- xử lý hoàn phí: SV nộp đơn giấy đã được BCN khoa duyệt (ngoài hệ thống)
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    hoa_don_id               INT            NOT NULL FOREIGN KEY REFERENCES HoaDonLePhi(id),
    file_don_da_duyet        NVARCHAR(500)  NOT NULL,   -- bản scan đơn đã có chữ ký/dấu BCN khoa
    ngay_nop                 DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    trang_thai                NVARCHAR(15)  NOT NULL DEFAULT N'ChoXuLy'
        CHECK (trang_thai IN (N'ChoXuLy', N'DaHoanTien', N'TuChoi')),
    nguoi_xu_ly_id            INT           NULL FOREIGN KEY REFERENCES TaiKhoan(id),
    ngay_xu_ly                DATETIME2     NULL
);


/* ============================================================================
   PHẦN 6 — PHÂN CÔNG GIẢNG VIÊN HƯỚNG DẪN  (UC18)
   ============================================================================ */

CREATE TABLE PhanCongGVHD (
    id                          INT IDENTITY(1,1) PRIMARY KEY,
    lich_kien_tap_sinh_vien_id  INT         NOT NULL FOREIGN KEY REFERENCES LichKienTap_SinhVien(id),
    giang_vien_id               INT         NOT NULL FOREIGN KEY REFERENCES GiangVien(id),
    ngay_phan_cong               DATETIME2  NOT NULL DEFAULT SYSDATETIME(),
    trang_thai                   NVARCHAR(15) NOT NULL DEFAULT N'DangHoatDong'
        CHECK (trang_thai IN (N'DangHoatDong', N'DaGo'))
);
-- Quy tắc nghiệp vụ: 1 SV chỉ có 1 GVHD "DangHoatDong" cho 1 lần đăng ký học phần.
-- Dùng filtered unique index (không phải UNIQUE constraint thường) để không chặn
-- nhầm lịch sử nhiều lần "DaGo" của cùng một sinh viên.
CREATE UNIQUE INDEX UQ_PhanCongGVHD_DangHoatDong
    ON PhanCongGVHD(lich_kien_tap_sinh_vien_id)
    WHERE trang_thai = N'DangHoatDong';


/* ============================================================================
   PHẦN 7 — THỰC HIỆN & ĐIỂM SỐ  (UC22, UC24, UC25, UC26, UC29)
   ============================================================================ */

-- UC22: với chuyến tự do, KHÔNG có bản ghi ở bảng này (không ai điểm danh).
-- Điều kiện "được phép nộp báo cáo" cho trường hợp đó chuyển sang kiểm tra
-- BaiThuHoach.file_xac_nhan_tham_quan IS NOT NULL thay vì trang_thai='CoMat'
-- ở đây — xử lý rẽ nhánh theo cach_to_chuc ở tầng ứng dụng khi validate UC29.
CREATE TABLE DiemDanh (            -- UC22, tại nhà máy — thay cho "chữ ký GV dẫn đoàn" trên giấy
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dang_ky_id        INT             NOT NULL UNIQUE FOREIGN KEY REFERENCES PhieuDangKy(id),
    trang_thai              NVARCHAR(15)    NOT NULL
        CHECK (trang_thai IN (N'CoMat', N'Vang', N'TuChoiThamGia')),
    ghi_chu                 NVARCHAR(255)   NULL,        -- lý do nếu TuChoiThamGia (vi phạm trang phục...)
    nguoi_diem_danh_id      INT             NOT NULL FOREIGN KEY REFERENCES GiangVien(id),
    ngay_diem_danh          DATETIME2       NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE BaiThuHoach (         -- UC29 Nộp báo cáo
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dang_ky_id        INT             NOT NULL FOREIGN KEY REFERENCES PhieuDangKy(id),
    file_bao_cao            NVARCHAR(500)   NOT NULL,     -- MSSV-Họ tên-BCKT<nhà máy>.pdf
    file_xac_nhan_tham_quan NVARCHAR(500)   NULL,          -- bắt buộc nếu ChuyenThamQuan.cach_to_chuc = 'TuDo'
    lan_nop                 INT             NOT NULL DEFAULT 1,
    ngay_nop                DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    trang_thai               NVARCHAR(15)   NOT NULL DEFAULT N'DaNop'
        CHECK (trang_thai IN (N'DaNop', N'ChoBoSung', N'TreHan'))
);
CREATE INDEX IX_BaiThuHoach_Phieu ON BaiThuHoach(phieu_dang_ky_id, ngay_nop DESC);

CREATE TABLE DiemPhieuDangKy (     -- bảng điểm tổng hợp 1-1 với PhieuDangKy — "nguồn sự thật" để tính điểm tổng kết
    id                          INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dang_ky_id            INT         NOT NULL UNIQUE FOREIGN KEY REFERENCES PhieuDangKy(id),

    -- Điểm chuẩn bị 30% (UC26) — offline: làm trước khi khởi hành; online/tự do: làm trước báo cáo
    diem_chuan_bi               DECIMAL(4,2) NULL CHECK (diem_chuan_bi BETWEEN 0 AND 10),
    ngay_lam_bai_chuan_bi       DATETIME2    NULL,

    -- Điểm bài thu hoạch 30% (UC25) — GVHD chấm, AI hỗ trợ đề xuất
    diem_bai_thu_hoach_ai       DECIMAL(4,2) NULL CHECK (diem_bai_thu_hoach_ai BETWEEN 0 AND 10),
    diem_bai_thu_hoach          DECIMAL(4,2) NULL CHECK (diem_bai_thu_hoach BETWEEN 0 AND 10),
    nhan_xet_bai_thu_hoach      NVARCHAR(MAX) NULL,
    giang_vien_cham_id          INT          NULL FOREIGN KEY REFERENCES GiangVien(id),
    ngay_cham_bai_thu_hoach     DATETIME2    NULL,

    -- Điểm báo cáo TQNM 40% (UC24) — trung bình từ DiemHoiDong_ChiTiet
    diem_bao_cao_tqnm           DECIMAL(4,2) NULL CHECK (diem_bao_cao_tqnm BETWEEN 0 AND 10),

    -- Điểm cộng — 0.5đ/câu, tối đa 1đ/nhà máy, tổng hợp từ NhatKyDiemCong
    diem_cong                   DECIMAL(4,2) NOT NULL DEFAULT 0 CHECK (diem_cong BETWEEN 0 AND 1),

    -- Điểm 1 chuyến = 30% + 30% + 40% + điểm cộng (tính ở view/app, KHÔNG lưu computed
    -- column vì phụ thuộc điều kiện "đã đủ cả 3 thành phần mới tính")
    da_khoa                     BIT          NOT NULL DEFAULT 0
);


-- UC26 áp dụng THỐNG NHẤT 1 luồng cho mọi hình thức chuyến (không tách nhánh):
-- giang_vien_ghi_nhan_id / giang_vien_cham_id luôn là "giảng viên dẫn đoàn"
-- của chuyến đó (bảng ChuyenThamQuan_GiangVienDanDoan) — với chuyến tự do,
-- đây chính là GVHD được 2 trigger ở Phần 12 tự động gán vào vai trò đó,
-- nên KHÔNG cần thêm cột/nhánh riêng phân biệt tự do hay do khoa tổ chức.
-- Quyết định (đã chốt): điểm cộng KHÔNG bị chặn theo cach_to_chuc — cố tình để
-- ngỏ, không thêm CHECK giới hạn, để không loại trừ các tình huống phát sinh
-- điểm cộng ngoài kịch bản "hỏi đáp tại nhà máy" mặc định mà chưa lường hết.
CREATE TABLE NhatKyDiemCong (      -- UC26 chi tiết — mỗi câu hỏi 1 dòng, để truy vết ai ghi + khi nào
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dang_ky_id        INT             NOT NULL FOREIGN KEY REFERENCES PhieuDangKy(id),
    diem                    DECIMAL(3,2)    NOT NULL DEFAULT 0.5,
    giang_vien_ghi_nhan_id  INT             NOT NULL FOREIGN KEY REFERENCES GiangVien(id),  -- GV dẫn đoàn, không phải GVHD
    ngay_ghi_nhan           DATETIME2       NOT NULL DEFAULT SYSDATETIME()
    -- Trigger/app đảm bảo SUM(diem) theo phieu_dang_ky_id không vượt 1, đồng bộ vào DiemPhieuDangKy.diem_cong
);


/* ============================================================================
   PHẦN 8 — HỘI ĐỒNG CHẤM BÁO CÁO TQNM  (UC24 mới bổ sung)
   ============================================================================ */

CREATE TABLE HoiDongChamBaoCao (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    lich_kien_tap_id        INT             NOT NULL FOREIGN KEY REFERENCES LichKienTap(id),
    ten_hoi_dong            NVARCHAR(150)   NOT NULL,
    ngay_bao_cao            DATETIME2       NOT NULL,
    dia_diem                NVARCHAR(150)   NULL
);

CREATE TABLE HoiDong_ThanhVien (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    hoi_dong_id             INT             NOT NULL FOREIGN KEY REFERENCES HoiDongChamBaoCao(id),
    giang_vien_id           INT             NOT NULL FOREIGN KEY REFERENCES GiangVien(id),
    vai_tro                 NVARCHAR(15)    NOT NULL DEFAULT N'ThanhVien'
        CHECK (vai_tro IN (N'ChuTich', N'ThuKy', N'ThanhVien')),
    CONSTRAINT UQ_HoiDong_ThanhVien UNIQUE (hoi_dong_id, giang_vien_id)
    -- Ràng buộc giang_vien_id phải có du_dk_hoi_dong = 1 (kiểm tra ở app)
);

CREATE TABLE DiemHoiDong_ChiTiet ( -- điểm độc lập của từng thành viên hội đồng cho từng chuyến
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dang_ky_id        INT             NOT NULL FOREIGN KEY REFERENCES PhieuDangKy(id),
    hoi_dong_thanhvien_id   INT             NOT NULL FOREIGN KEY REFERENCES HoiDong_ThanhVien(id),
    diem                    DECIMAL(4,2)    NOT NULL CHECK (diem BETWEEN 0 AND 10),
    ngay_cham               DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_DiemHoiDong_ChiTiet UNIQUE (phieu_dang_ky_id, hoi_dong_thanhvien_id)
    -- DiemPhieuDangKy.diem_bao_cao_tqnm = AVG(diem) GROUP BY phieu_dang_ky_id (đồng bộ ở app/trigger)
);


/* ============================================================================
   PHẦN 9 — BỘ CHUYẾN ĐẠI DIỆN & KẾT QUẢ HỌC PHẦN  (UC24, UC27, UC28)
   ============================================================================ */

CREATE TABLE BoChuyenBaoCao (      -- bộ chuyến hệ thống tự động chọn để làm hồ sơ báo cáo chính thức
    id                          INT IDENTITY(1,1) PRIMARY KEY,
    lich_kien_tap_sinh_vien_id  INT         NOT NULL UNIQUE FOREIGN KEY REFERENCES LichKienTap_SinhVien(id),
    ngay_chon                   DATETIME2   NOT NULL DEFAULT SYSDATETIME(),
    tu_dong                     BIT         NOT NULL DEFAULT 1,
    ghi_chu_dieu_chinh_gvhd     NVARCHAR(500) NULL   -- lý do nếu GVHD điều chỉnh lại bộ hệ thống chọn
);

CREATE TABLE BoChuyenBaoCao_Chuyen (  -- N-N: các PhieuDangKy thuộc bộ chuyến báo cáo (≥2 trực tiếp + ≥1 trực tuyến)
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    bo_chuyen_bao_cao_id    INT             NOT NULL FOREIGN KEY REFERENCES BoChuyenBaoCao(id),
    phieu_dang_ky_id        INT             NOT NULL FOREIGN KEY REFERENCES PhieuDangKy(id),
    CONSTRAINT UQ_BoChuyen_Chuyen UNIQUE (bo_chuyen_bao_cao_id, phieu_dang_ky_id)
);

CREATE TABLE KetQuaHocPhan (       -- UC27 Quản lý kết quả kiến tập — điểm tổng kết, khóa điểm
    id                          INT IDENTITY(1,1) PRIMARY KEY,
    lich_kien_tap_sinh_vien_id  INT         NOT NULL UNIQUE FOREIGN KEY REFERENCES LichKienTap_SinhVien(id),
    bo_chuyen_bao_cao_id        INT         NULL FOREIGN KEY REFERENCES BoChuyenBaoCao(id),
    diem_tong_ket                DECIMAL(4,2) NULL CHECK (diem_tong_ket BETWEEN 0 AND 10),
    ket_qua                      NVARCHAR(20) NOT NULL DEFAULT N'DangThucHien'
        CHECK (ket_qua IN (N'DangThucHien', N'Dat', N'KhongDat', N'ChuaHoanThanh')),
    ngay_khoa                    DATETIME2   NULL,
    nguoi_khoa_id                 INT        NULL FOREIGN KEY REFERENCES TaiKhoan(id)
    -- diem_tong_ket = TRUNG BÌNH CỘNG DiemPhieuDangKy.(diem_chuan_bi*0.3 + diem_bai_thu_hoach*0.3
    --                  + diem_bao_cao_tqnm*0.4 + diem_cong) của các PhieuDangKy trong BoChuyenBaoCao_Chuyen
);


/* ============================================================================
   PHẦN 10 — VIEW HỖ TRỢ NGHIỆP VỤ
   ============================================================================ */

-- (UC13/UC32) Ma trận tổng hợp dữ liệu tham quan — hiển thị cho GVHD & báo cáo thống kê
GO
CREATE VIEW vw_MaTranThamQuanSinhVien AS
SELECT
    sv.mssv,
    sv.ho_ten,
    sv.ten_lop,
    nm.ten_nha_may,
    ct.ngay_tham_quan,
    ct.hinh_thuc,
    ct.cach_to_chuc,
    pdk.trang_thai              AS trang_thai_phieu,
    dpd.diem_chuan_bi,
    dpd.diem_cong,
    dpd.diem_bai_thu_hoach,
    dpd.diem_bao_cao_tqnm,
    DATEDIFF(MONTH, ct.ngay_tham_quan, GETDATE()) AS so_thang_da_qua   -- so với hạn bảo lưu 18 tháng
FROM PhieuDangKy pdk
JOIN SinhVien sv           ON sv.id = pdk.sinh_vien_id
JOIN ChuyenThamQuan ct     ON ct.id = pdk.chuyen_tham_quan_id
JOIN NhaMay nm             ON nm.id = ct.nha_may_id
LEFT JOIN DiemPhieuDangKy dpd ON dpd.phieu_dang_ky_id = pdk.id;
GO


/* ============================================================================
   PHẦN 11 — INDEX BỔ SUNG CHO TRUY VẤN THƯỜNG DÙNG
   ============================================================================ */

CREATE INDEX IX_LichKienTap_Dot   ON LichKienTap(dot_kien_tap_id, khoa_id);
CREATE INDEX IX_HoaDonLePhi_TT    ON HoaDonLePhi(trang_thai);
CREATE INDEX IX_KetQuaHocPhan_KQ  ON KetQuaHocPhan(ket_qua);


/* ============================================================================
   PHẦN 12 — TRIGGER: TỰ ĐỘNG GÁN GVHD LÀM GIẢNG VIÊN DẪN ĐOÀN CHO CHUYẾN TỰ DO
   (UC10 bước 6, UC18 quy tắc nghiệp vụ)

   Nghiệp vụ: với chuyến tham quan "tự do" (cach_to_chuc = 'TuDo'), GVHD của
   sinh viên đề xuất luôn đóng vai trò giảng viên dẫn đoàn — không qua UC19
   phân công thủ công. Vì thứ tự xảy ra trước–sau giữa "khoa duyệt chuyến tự
   do" (UC10) và "khoa phân công GVHD" (UC18) không cố định, cần 2 trigger
   đồng bộ 2 chiều, mỗi trigger có NOT EXISTS để không chèn trùng khi cả hai
   cùng chạy.

   Lưu ý: đây là bản tham chiếu ở tầng CSDL. Nếu đội dev muốn xử lý ở tầng
   NestJS (service layer) thay vì trigger DB, có thể bỏ qua phần này và port
   nguyên văn điều kiện SELECT bên dưới thành 1 hàm dùng chung, gọi lại ở cả
   2 use case (duyệt chuyến tự do / phân công GVHD).
   ============================================================================ */

GO
CREATE TRIGGER trg_ChuyenThamQuan_TuDo_GanGVDD
ON ChuyenThamQuan
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ xử lý các dòng vừa CHUYỂN sang 'DaDuyet' (tránh chạy lại mỗi lần UPDATE khác)
    INSERT INTO ChuyenThamQuan_GiangVienDanDoan (chuyen_tham_quan_id, giang_vien_id, la_truong_doan)
    SELECT i.id, pc.giang_vien_id, 1
    FROM inserted i
    JOIN deleted d
        ON d.id = i.id
    JOIN LichKienTap_SinhVien lksv
        ON lksv.sinh_vien_id = i.de_xuat_boi_id
        AND lksv.trang_thai = N'DangThucHien'
    JOIN PhanCongGVHD pc
        ON pc.lich_kien_tap_sinh_vien_id = lksv.id
        AND pc.trang_thai = N'DangHoatDong'
    WHERE i.cach_to_chuc = N'TuDo'
        AND i.trang_thai_duyet_tudo = N'DaDuyet'
        AND ISNULL(d.trang_thai_duyet_tudo, N'') <> N'DaDuyet'
        AND NOT EXISTS (
            SELECT 1 FROM ChuyenThamQuan_GiangVienDanDoan g
            WHERE g.chuyen_tham_quan_id = i.id
        );
END;
GO

CREATE TRIGGER trg_PhanCongGVHD_BackfillGVDD
ON PhanCongGVHD
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Khi 1 GVHD mới được gán "DangHoatDong", rà soát các chuyến tự do đã
    -- duyệt của đúng sinh viên đó mà vẫn đang "Chờ gán GV dẫn đoàn"
    INSERT INTO ChuyenThamQuan_GiangVienDanDoan (chuyen_tham_quan_id, giang_vien_id, la_truong_doan)
    SELECT ct.id, i.giang_vien_id, 1
    FROM inserted i
    JOIN LichKienTap_SinhVien lksv
        ON lksv.id = i.lich_kien_tap_sinh_vien_id
    JOIN ChuyenThamQuan ct
        ON ct.de_xuat_boi_id = lksv.sinh_vien_id
        AND ct.cach_to_chuc = N'TuDo'
        AND ct.trang_thai_duyet_tudo = N'DaDuyet'
    WHERE i.trang_thai = N'DangHoatDong'
        AND NOT EXISTS (
            SELECT 1 FROM ChuyenThamQuan_GiangVienDanDoan g
            WHERE g.chuyen_tham_quan_id = ct.id
        );
END;
GO
