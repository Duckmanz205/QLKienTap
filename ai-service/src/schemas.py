from pydantic import BaseModel, Field

# ==========================================
# SCHEMA CHO AGENT 1: GIÁM KHẢO TỔNG QUAN & HÌNH THỨC
# ==========================================
class DanhGia_HinhThuc_TongQuan(BaseModel):
    diem_hinh_thuc: float = Field(
        description="Điểm hình thức trình bày (Thang 10). Nếu tốt cho 8-10, nếu kém cho dưới 6."
    )
    ly_do_hinh_thuc: str = Field(
        description="Lập luận minh bạch: Nhận xét hình thức. LƯU Ý: Văn bản được trích xuất bằng OCR, TUYỆT ĐỐI BỎ QUA các lỗi chính tả vô lý do máy quét nhầm. Chỉ trừ điểm nếu sai cấu trúc trình bày cơ bản."
    )

    diem_tong_quan: float = Field(description="Điểm Giới thiệu nhà máy/công ty (Thang 10).")
    ly_do_tong_quan: str = Field(
        description="Lập luận minh bạch: Trình bày đủ nội dung tổng quan về công ty và sản phẩm không? Có bị sơ sài không? (Dựa theo Rubric)"
    )


# ==========================================
# SCHEMA CHO AGENT 2: GIÁM KHẢO CÔNG NGHỆ
# ==========================================
class DanhGia_QuyTrinh(BaseModel):
    diem_quy_trinh: float = Field(description="Điểm Quy trình công nghệ (Thang 10).")
    ly_do_quy_trinh: str = Field(
        description="Lập luận minh bạch: Có liệt kê/vẽ sơ đồ khối không? Thuyết minh quy trình đủ các bước hay sơ sài? (Dựa theo Rubric)"
    )


# ==========================================
# SCHEMA CHO AGENT 3: GIÁM KHẢO QA / VSATTP
# ==========================================
class DanhGia_VSATTP(BaseModel):
    diem_vsattp: float = Field(description="Điểm Đánh giá thực trạng VSATTP (Thang 10).")
    ly_do_vsattp: str = Field(
        description="Lập luận minh bạch: Quét toàn bộ phần VSATTP, thống kê TỔNG SỐ YÊU CẦU được nêu ra và đếm SỐ YÊU CẦU sinh viên CÓ ĐIỀN thực trạng/đánh giá. Từ đó chia tỷ lệ % (100%, 75%, 50% hay dưới 50% nội dung)."
    )


# ==========================================
# ĐẦU RA CUỐI CÙNG (THƯ KÝ TỔNG HỢP)
# ==========================================
class KetQua_KiemToan_Rubric(BaseModel):
    """
    ĐÂY LÀ ĐẦU RA CUỐI CÙNG TRẢ VỀ CHO GIAO DIỆN WEBAPP (STREAMLIT)
    """
    # 1. Kết quả chi tiết từ 3 Giám khảo
    hinh_thuc_tong_quan: DanhGia_HinhThuc_TongQuan
    quy_trinh_cong_nghe: DanhGia_QuyTrinh
    vsattp: DanhGia_VSATTP

    # 2. Thư ký tổng hợp điểm
    diem_bao_cao_cuoi_cung: float = Field(
        description="Điểm trung bình tổng kết của bài báo cáo (Hệ số 40%). Python sẽ tự làm toán."
    )