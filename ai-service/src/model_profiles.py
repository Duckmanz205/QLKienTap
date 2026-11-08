"""
================================================================================
HỆ THỐNG QUẢN LÝ CẤU HÌNH CÁC MODEL AI (MODEL PROFILES REGISTRY)
Dự án: Hệ thống Quản lý & Chấm điểm Báo cáo Kiến tập HUIT
================================================================================
File này lưu trữ chi tiết các cấu hình tối ưu của từng mô hình AI trong hệ thống:
1. MODEL CHẤM ĐIỂM CHUYÊN SÂU (ĐỘ CHÍNH XÁC CAO NHẤT): Qwen3.8-Max-0902 (Thinking Mode ON)
2. MODEL CHẤM ĐIỂM DEMO SIÊU TỐC (HIỆU NĂNG CAO, TIẾT KIỆM): DeepSeek-V4.1-Flash-1017 (Thinking Mode OFF)
3. MODEL OCR THỊ GIÁC (TRÍCH XUẤT VĂN BẢN PDF/ẢNH): DeepSeek-V4.1-Flash (Vision)
"""

import os
from typing import Dict, Any

# ==============================================================================
# PROFILE 1: QWEN 3.8 MAX 0902 - CHUYÊN SÂU CHẤM ĐIỂM HỌC THUẬT (ĐỘ CHÍNH XÁC CAO NHẤT)
# ==============================================================================
# Lưu trữ an toàn cấu hình của Qwen3.8-Max Snapshot 0902:
# - Chế độ suy luận sâu (enable_thinking=True) giúp AI tạo chuỗi tư duy CoT (5,000 - 9,400 ký tự)
# - Bóc tách sự khác biệt tinh tế giữa tập đoàn mẹ và từng chi nhánh nhà máy tham quan
# - Rà soát chi tiết từng điều kiện VSATTP (đếm chính xác 31-32 mục biểu mẫu)
# ==============================================================================
PROFILE_GRADING_QWEN38_MAX = {
    "model_name": "qwen3.8-max-0902",
    "description": "Mô hình cao cấp nhất cho tác vụ chấm điểm Rubric chuyên sâu, bật chuỗi suy luận CoT.",
    "temperature": 0.05,
    "max_tokens": 4000,
    "response_format": {"type": "json_object"},
    "extra_body": {
        "enable_thinking": True
    },
    "benchmark_stats": {
        "avg_grading_time_seconds": 64.72,
        "reasoning_chars_per_agent": "5,000 - 9,400 chars",
        "accuracy_level": "Cao nhất (Academic Standard)"
    }
}

# ==============================================================================
# PROFILE 2: DEEPSEEK V4.1 FLASH 1017 - CHẤM ĐIỂM SIÊU TỐC CHO DEMO
# ==============================================================================
# Cấu hình tối ưu cho DeepSeek-V4.1-Flash-1017 (Snapshot 1017, MoE 552B):
# - Tắt suy luận (enable_thinking=False) để đạt tốc độ phản hồi cực nhanh (~1 - 3 giây)
# - Định dạng đầu ra ép chuẩn JSON (response_format={'type': 'json_object'})
# - Nhiệt độ thấp (temperature=0.05) đảm bảo ổn định và nhất quán định dạng
# - Thích hợp trình diễn live demo, kiểm thử chức năng giao diện, tiết kiệm chi phí
# ==============================================================================
PROFILE_GRADING_DEEPSEEK_FLASH_1017 = {
    "model_name": "deepseek-v4.1-flash-1017",
    "description": "Mô hình MoE 552B siêu tốc độ cho demo nhanh, phản xạ trực tiếp không suy luận CoT.",
    "temperature": 0.05,
    "max_tokens": 2500,
    "response_format": {"type": "json_object"},
    "extra_body": {
        "enable_thinking": False
    },
    "benchmark_stats": {
        "avg_grading_time_seconds": "~1 - 3s",
        "reasoning_chars_per_agent": "0 chars (trả thẳng JSON)",
        "accuracy_level": "Tốt cho demo nhanh"
    }
}

# ==============================================================================
# PROFILE 3: DEEPSEEK V4.1 FLASH 1017 - OCR VISION TRÍCH XUẤT VĂN BẢN
# ==============================================================================
PROFILE_OCR_DEEPSEEK_FLASH = {
    "model_name": "deepseek-v4.1-flash-1017",
    "fallback_model_name": "qwen3.8-max-0902",
    "description": "Mô hình trích xuất thị giác ảnh PDF tiếng Việt, sơ đồ khối, bảng kiểm tra VSATTP snapshot 1017 ổn định và tốc độ cao.",
    "temperature": 0.01,
    "max_tokens": 4000,
    "stream": False,
    "extra_body": {
        "enable_thinking": False
    }
}

# ==============================================================================
# CƠ CHẾ CHUYỂN ĐỔI LINH HOẠT (ACTIVE SELECTION)
# ==============================================================================
# Mặc định theo yêu cầu của bạn: Chuyển sang PROFILE_GRADING_DEEPSEEK_FLASH_1017
# để demo nhanh với enable_thinking=False.
# Có thể đổi qua biến môi trường GRADING_PROFILE=qwen_max hoặc đổi biến code bên dưới.
PROFILE_SELECTION = os.getenv("GRADING_PROFILE", "deepseek_flash_1017").lower()

if "qwen" in PROFILE_SELECTION or "max" in PROFILE_SELECTION:
    ACTIVE_GRADING_PROFILE = PROFILE_GRADING_QWEN38_MAX
else:
    ACTIVE_GRADING_PROFILE = PROFILE_GRADING_DEEPSEEK_FLASH_1017

ACTIVE_OCR_PROFILE = PROFILE_OCR_DEEPSEEK_FLASH
