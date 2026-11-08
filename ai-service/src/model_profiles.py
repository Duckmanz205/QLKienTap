"""
================================================================================
HỆ THỐNG QUẢN LÝ CẤU HÌNH CÁC MODEL AI (MODEL PROFILES REGISTRY)
Dự án: Hệ thống Quản lý & Chấm điểm Báo cáo Kiến tập HUIT
================================================================================
File này lưu trữ chi tiết các cấu hình tối ưu của từng mô hình AI trong hệ thống:
1. MODEL CHẤM ĐIỂM CHUYÊN SÂU (ĐỘ CHÍNH XÁC CAO NHẤT): Qwen3.8-Max-0902 (Thinking Mode ON)
2. MODEL CHẤM ĐIỂM DEMO SIÊU TỐC (HIỆU NĂNG CAO, TIẾT KIỆM): DeepSeek-V4.1-Flash-1017 (Thinking Mode OFF)
3. MODEL OCR THỊ GIÁC (TRÍCH XUẤT VĂN BẢN PDF/ẢNH): 
   - Qwen3.8-Omni-Flash (Mô hình Vision Omni mới, 2M TPM, hỗ trợ text output)
   - DeepSeek-V4.1-Flash-1017 (Mô hình Vision OCR dự phòng)
"""

import os
from typing import Dict, Any

# ==============================================================================
# PROFILE 1: QWEN 3.8 MAX 0902 - CHUYÊN SÂU CHẤM ĐIỂM HỌC THUẬT (ĐỘ CHÍNH XÁC CAO NHẤT)
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
# PROFILE 3: QWEN3.8-OMNI-FLASH - OCR THỊ GIÁC CHÍNH THỨC
# ==============================================================================
PROFILE_OCR_QWEN38_OMNI_FLASH = {
    "model_name": "qwen3.8-omni-flash",
    "fallback_model_name": "qwen3.8-max-0902",
    "description": "Mô hình Omni-modal thế hệ mới của Alibaba, TPM 2.000.000, trích xuất text từ ảnh scan sắc nét.",
    "temperature": 0.01,
    "max_tokens": 4000,
    "modalities": ["text"],
    "stream": False,
    "extra_body": {
        "enable_thinking": False
    }
}

# ==============================================================================
# PROFILE 4: DEEPSEEK V4.1 FLASH 1017 - OCR VISION TRÍCH XUẤT VĂN BẢN (DỰ PHÒNG)
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
# GRADING: Mặc định demo nhanh dùng deepseek-v4.1-flash-1017, hoặc qwen_max khi cần chấm sâu
GRADING_SELECTION = os.getenv("GRADING_PROFILE", "deepseek_flash_1017").lower()
if "qwen" in GRADING_SELECTION or "max" in GRADING_SELECTION:
    ACTIVE_GRADING_PROFILE = PROFILE_GRADING_QWEN38_MAX
else:
    ACTIVE_GRADING_PROFILE = PROFILE_GRADING_DEEPSEEK_FLASH_1017

# OCR: Mặc định chuyển sang qwen3.8-omni-flash, có thể ghi đè qua biến môi trường OCR_PROFILE
OCR_SELECTION = os.getenv("OCR_PROFILE", "qwen3.8-omni-flash").lower()
if "deepseek" in OCR_SELECTION:
    ACTIVE_OCR_PROFILE = PROFILE_OCR_DEEPSEEK_FLASH
else:
    ACTIVE_OCR_PROFILE = PROFILE_OCR_QWEN38_OMNI_FLASH
