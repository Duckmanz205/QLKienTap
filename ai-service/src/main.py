import os
import re
import asyncio
import io
import base64
import gc
from fastapi import FastAPI, UploadFile, File, Security, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from openai import AsyncOpenAI
from PIL import Image
import fitz  # PyMuPDF
from dotenv import load_dotenv

from src.schemas import (
    DanhGia_HinhThuc_TongQuan,
    DanhGia_QuyTrinh,
    DanhGia_VSATTP,
    KetQua_KiemToan_Rubric
)

# ==========================================
# CẤU HÌNH KHỞI TẠO & MÔI TRƯỜNG
# ==========================================
load_dotenv()

QWEN_API_KEY = os.getenv("QWEN_API_KEY")
QWEN_BASE_URL = os.getenv("QWEN_BASE_URL", "https://dashscope-intl.aliyuncs.com/compatible-mode/v1")
SECRET_API_KEY = os.getenv("GRADING_API_KEY", "satori_2026_secure_key")

if not QWEN_API_KEY:
    raise ValueError("⚠️ CẢNH BÁO: Chưa cấu hình QWEN_API_KEY trong file .env!")

client = AsyncOpenAI(api_key=QWEN_API_KEY, base_url=QWEN_BASE_URL)

app = FastAPI(title="HUIT - AI Grader & OCR Microservice", version="1.0")

# THÊM CORS (CỰC KỲ QUAN TRỌNG ĐỂ REACT GỌI ĐƯỢC API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép Frontend React (localhost:5173) gọi sang
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if credentials.credentials != SECRET_API_KEY:
        raise HTTPException(status_code=401, detail="Sai API Key!")
    return credentials.credentials

# ==========================================
# MODULE 1: OCR ENGINE (TRÍCH XUẤT VĂN BẢN)
# ==========================================
def extract_sequential_elements(pdf_bytes: bytes) -> list:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    sequential_elements = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        page_elements = []

        text_blocks = page.get_text("blocks")
        for x0, y0, x1, y1, text, block_no, block_type in text_blocks:
            if block_type == 0 and text.strip():
                page_elements.append({
                    "type": "machine_text",
                    "content": text.strip(),
                    "y_coord": y0,
                    "x_coord": x0
                })

        dict_blocks = page.get_text("dict")["blocks"]
        for block in dict_blocks:
            if block["type"] == 1:
                try:
                    bbox = block["bbox"]
                    image_bytes = block["image"]
                    pil_img = Image.open(io.BytesIO(image_bytes))

                    if pil_img.mode in ('RGBA', 'LA') or (pil_img.mode == 'P' and 'transparency' in pil_img.info):
                        background = Image.new('RGB', pil_img.size, (255, 255, 255))
                        background.paste(pil_img, mask=pil_img.convert('RGBA').split()[3])
                        pil_img = background
                    else:
                        pil_img = pil_img.convert("RGB")

                    if pil_img.width > 30 and pil_img.height > 30:
                        page_elements.append({
                            "type": "handwritten_image",
                            "content": pil_img,
                            "y_coord": bbox[1],
                            "x_coord": bbox[0]
                        })
                except Exception:
                    pass

        page_elements.sort(key=lambda e: (e["y_coord"], e["x_coord"]))
        sequential_elements.extend(page_elements)

    return sequential_elements


def pil_to_base64(img: Image.Image) -> str:
    max_edge = 1536
    if max(img.size) > max_edge:
        ratio = max_edge / max(img.size)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    buffered = io.BytesIO()
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img.save(buffered, format="JPEG", quality=85)
    return f"data:image/jpeg;base64,{base64.b64encode(buffered.getvalue()).decode('utf-8')}"


@app.post("/process-pdf")
async def process_pdf_endpoint(file: UploadFile = File(...)):
    """API Nhận file PDF và trả về 1 cục văn bản thô dạng JSON"""
    pdf_bytes = await file.read()
    elements = extract_sequential_elements(pdf_bytes)

    vlm_prompt = (
        "Bạn là hệ thống trích xuất văn bản (OCR) chính xác tuyệt đối. Hãy trích xuất nội dung văn bản tiếng Việt trong ảnh. "
        "TUYỆT ĐỐI KHÔNG thêm bình luận hay câu mào đầu.\n\n"
        "QUY TẮC ĐỊNH DẠNG NGHIÊM NGẶT:\n"
        "1. ĐỐI VỚI VĂN BẢN THƯỜNG: BẮT BUỘC giữ nguyên định dạng văn bản thô (có xuống dòng). TUYỆT ĐỐI KHÔNG tự ý bọc chúng vào trong định dạng Bảng (Table).\n"
        "2. ĐỐI VỚI SƠ ĐỒ KHỐI: Liệt kê các bước theo thứ tự từ trên xuống dưới dạng text thô.\n"
        "3. ĐỐI VỚI BẢNG BIỂU: Chỉ đọc nội dung theo từng dòng từ trái qua phải một cách tự nhiên. KHÔNG sử dụng định dạng Markdown Table (|).\n\n"
        "Nếu bức ảnh KHÔNG có chữ, trả về duy nhất chữ: EMPTY"
    )

    final_text = ""

    for elem in elements:
        if elem["type"] == "machine_text":
            final_text += elem["content"] + "\n\n"
        elif elem["type"] == "handwritten_image":
            raw_img = elem["content"]
            b64_url = pil_to_base64(raw_img)

            try:
                response = await client.chat.completions.create(
                    model="qwen-vl-ocr",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": vlm_prompt},
                                {"type": "image_url", "image_url": {"url": b64_url}}
                            ]
                        }
                    ],
                    temperature=0.01,
                    max_tokens=2000
                )
                ocr_text = response.choices[0].message.content.strip()

                if "EMPTY" not in ocr_text.upper() and len(ocr_text) >= 3:
                    ocr_text = re.sub(r'(?i)^(.*?trích xuất.*?:|.*?như sau:)\s*', '', ocr_text)
                    if ocr_text.startswith("```markdown"):
                        ocr_text = ocr_text.replace('```markdown\n', '')
                        if ocr_text.endswith("```"):
                            ocr_text = ocr_text[:-3]
                    if ocr_text.strip():
                        final_text += ocr_text.strip() + "\n\n"

            except Exception as e:
                final_text += f"[Lỗi trích xuất ảnh qua Qwen Cloud: {str(e)}]\n\n"

            del raw_img
            gc.collect()

    return {"extracted_text": final_text.strip()}


# ==========================================
# MODULE 2: GRADING ENGINE (HỘI ĐỒNG CHẤM AI)
# ==========================================
EXPERT_MODEL = "qwen3.8-max"  # Khôi phục đúng model của dự án

class GradingRequest(BaseModel):
    document_text: str

PROMPT_AGENT_1 = """Bạn là Giám khảo số 1. Nhiệm vụ của bạn là đọc báo cáo thực tập và chấm 2 tiêu chí: HÌNH THỨC và TỔNG QUAN.
[KHÁNG THỂ OCR - LƯU Ý TỐI QUAN TRỌNG]: Văn bản bạn đang đọc được trích xuất từ chữ viết tay bằng công nghệ máy quét (OCR). Sẽ có RẤT NHIỀU từ bị sai chính tả vô lý, sai dấu, hoặc ngắt dòng lộn xộn do máy đọc nhầm (VD: "Tiến xu lý", "thẩm thải", "Nục dich"). TUYỆT ĐỐI BỎ QUA và KHÔNG TRỪ ĐIỂM HÌNH THỨC cho những lỗi chính tả này. Chỉ trừ điểm hình thức nếu cấu trúc bài làm thực sự thiếu logic các phần.

Hãy suy luận và đưa ra điểm số dựa trên RUBRIC sau:
1. TIÊU CHÍ HÌNH THỨC (Thang 10):
- Sinh viên trình bày rõ ràng (đã bỏ qua lỗi chính tả do OCR): 8-10 điểm.
- Format quá lộn xộn, mất hẳn cấu trúc bài: Dưới 6 điểm.

2. TIÊU CHÍ TỔNG QUAN VỀ CÔNG TY (Thang 10):
- 8.0 - 10.0: Trình bày đủ nội dung tổng quan về công ty và sản phẩm.
- 6.0 - 8.0: Trình bày đủ nội dung tổng quan về công ty và sản phẩm nhưng dữ liệu sơ sài.
- 4.0 - 6.0: Trình bày thiếu một trong hai nội dung: tổng quan về công ty và sản phẩm.
- Dưới 4.0: Trình bày thiếu một trong hai nội dung: tổng quan về công ty và sản phẩm và dữ liệu sơ sài.

TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON TUYỆT ĐỐI TUÂN THỦ CẤU TRÚC SAU:
{
    "diem_hinh_thuc": (số thực),
    "ly_do_hinh_thuc": "(giải thích minh bạch dựa trên rubric, xác nhận đã bỏ qua lỗi OCR)",
    "diem_tong_quan": (số thực),
    "ly_do_tong_quan": "(giải thích minh bạch dựa trên rubric)"
}
"""

PROMPT_AGENT_2 = """Bạn là Giám khảo số 2 (Kỹ sư Công nghệ). Nhiệm vụ của bạn là đọc báo cáo và chấm TIÊU CHÍ QUY TRÌNH CÔNG NGHỆ.
[KHÁNG THỂ OCR]: Văn bản được quét bằng máy (OCR), hãy tự động suy luận các từ bị sai chính tả để hiểu đúng ý nghĩa chuyên môn (VD: "Ozon" thành "Ozan", "siêu lọc" thành "siêu lạc").

Hãy suy luận và đưa ra điểm số dựa trên RUBRIC sau:
- 8.0 - 10.0: Có sơ đồ khối (OCR thường hiển thị các bước nối tiếp nhau từ trên xuống dưới dạng text thô, hãy xem đó là sơ đồ khối), thuyết minh quy trình đủ nội dung trong từng quá trình.
- 6.0 - 8.0: Vẽ sai sơ đồ khối (hoặc thiếu), thuyết minh quy trình đủ nội dung trong từng quá trình.
- 4.0 - 6.0: Vẽ sai sơ đồ khối, thuyết minh đủ quá trình nhưng nội dung sơ sài.
- Dưới 4.0: Vẽ sai sơ đồ khối, thuyết minh không đủ quá trình và nội dung sơ sài.

TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON TUYỆT ĐỐI TUÂN THỦ CẤU TRÚC SAU:
{
    "diem_quy_trinh": (số thực),
    "ly_do_quy_trinh": "(giải thích minh bạch dựa trên rubric)"
}
"""

PROMPT_AGENT_3 = """Bạn là Giám khảo số 3 (Chuyên gia QA). Nhiệm vụ của bạn là chấm TIÊU CHÍ ĐÁNH GIÁ THỰC TRẠNG VSATTP.
[LƯU Ý ĐỊNH DẠNG]: Phần này sinh viên điền vào một biểu mẫu giấy và được quét bằng OCR thành văn bản thô (không còn định dạng bảng). Bạn sẽ thấy một loạt các "Yêu cầu", theo sau là "Thực trạng" và "Đánh giá (Đạt/Không đạt)".

NHIỆM VỤ ĐẾM THÔNG MINH: 
1. Quét toàn bộ phần VSATTP.
2. Thống kê xem biểu mẫu đã đưa ra TỔNG CỘNG bao nhiêu YÊU CẦU.
3. Đếm xem sinh viên ĐÃ VIẾT đánh giá/thực trạng cho BAO NHIÊU YÊU CẦU trong số đó.
4. Tính tỷ lệ % hoàn thành.

Hãy suy luận và đưa ra điểm số dựa trên RUBRIC sau:
- 8.0 - 10.0: Đánh giá đầy đủ 100% các nội dung theo yêu cầu.
- 6.0 - 8.0: Đánh giá không đầy đủ nhưng đảm bảo ít nhất 75% nội dung.
- 4.0 - 6.0: Đảm bảo ít nhất 50% đến dưới 75% nội dung.
- Dưới 4.0: Chỉ đánh giá được ít hơn 50% nội dung.

TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON TUYỆT ĐỐI TUÂN THỦ CẤU TRÚC SAU:
{
    "diem_vsattp": (số thực),
    "ly_do_vsattp": "(Bắt buộc ghi rõ: Đã tìm thấy tổng cộng X yêu cầu, sinh viên điền Y yêu cầu, đạt Z%. Do đó đối chiếu Rubric cho điểm...)"
}
"""

async def call_and_parse_json(system_prompt: str, document_text: str, pydantic_model):
    try:
        response = await client.chat.completions.create(
            model=EXPERT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"BÁO CÁO CỦA SINH VIÊN:\n\n{document_text}"}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        raw_content = response.choices[0].message.content
        return pydantic_model.model_validate_json(raw_content)
    except Exception as e:
        print(f"❌ Lỗi AI Agent chi tiết: {str(e)}")
        return None

@app.post("/grade", response_model=KetQua_KiemToan_Rubric)
async def grade_report_api(request: GradingRequest, token: str = Depends(verify_token)):
    doc = request.document_text
    print("🚀 [Multi-Agent] Kích hoạt 3 Giám khảo chạy song song...")

    task1 = call_and_parse_json(PROMPT_AGENT_1, doc, DanhGia_HinhThuc_TongQuan)
    task2 = call_and_parse_json(PROMPT_AGENT_2, doc, DanhGia_QuyTrinh)
    task3 = call_and_parse_json(PROMPT_AGENT_3, doc, DanhGia_VSATTP)

    ket_qua1, ket_qua2, ket_qua3 = await asyncio.gather(task1, task2, task3)

    if not ket_qua1: ket_qua1 = DanhGia_HinhThuc_TongQuan(diem_hinh_thuc=0, ly_do_hinh_thuc="Lỗi API", diem_tong_quan=0, ly_do_tong_quan="Lỗi API")
    if not ket_qua2: ket_qua2 = DanhGia_QuyTrinh(diem_quy_trinh=0, ly_do_quy_trinh="Lỗi API")
    if not ket_qua3: ket_qua3 = DanhGia_VSATTP(diem_vsattp=0, ly_do_vsattp="Lỗi API")

    diem_trung_binh = (ket_qua1.diem_hinh_thuc + ket_qua1.diem_tong_quan + ket_qua2.diem_quy_trinh + ket_qua3.diem_vsattp) / 4.0
    print(f"✅ [Hoàn Thành] Điểm tổng kết: {round(diem_trung_binh, 1)}/10")

    return KetQua_KiemToan_Rubric(
        hinh_thuc_tong_quan=ket_qua1,
        quy_trinh_cong_nghe=ket_qua2,
        vsattp=ket_qua3,
        diem_bao_cao_cuoi_cung=round(diem_trung_binh, 1)
    )