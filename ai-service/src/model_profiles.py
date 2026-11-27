"""
================================================================================
HỆ THỐNG QUẢN LÝ CẤU HÌNH CÁC MODEL AI (MODEL PROFILES REGISTRY)
Dự án: Hệ thống Quản lý & Chấm điểm Báo cáo Kiến tập HUIT
================================================================================
Sử dụng API tương thích OpenAI của Deploy (https://api-cdn.deploy.com/api/v1)
với 1 model duy nhất trên 1 API key dùng chung cho cả 2 tác vụ:
1. MODEL OCR THỊ GIÁC (TRÍCH XUẤT VĂN BẢN PDF/ẢNH): deepseek-ai/deepseek-v4.1-flash-1017
2. MODEL HỘI ĐỒNG CHẤM ĐIỂM AI (RUBRIC GRADING): deepseek-ai/deepseek-v4.1-flash-1017
"""

import os
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)
load_dotenv()

DEPLOY_MODEL = os.getenv("DEPLOY_MODEL", "deepseek-ai/deepseek-v4.1-flash-1017")
OCR_REASONING_EFFORT = os.getenv("OCR_REASONING_EFFORT", "none").lower()
GRADING_REASONING_EFFORT = os.getenv("GRADING_REASONING_EFFORT", "none").lower()


def _build_deploy_extra_body(reasoning_effort: str, cache_preference: int) -> Dict[str, Any]:
    """Tạo extra_body tương thích với Deploy API cho OpenAI SDK 1.52.x."""
    body: Dict[str, Any] = {
        "reasoning_effort": reasoning_effort,
        "cache_preference": cache_preference,
    }
    max_thinking_tokens = os.getenv("MAX_THINKING_TOKENS")
    if reasoning_effort != "none" and max_thinking_tokens and max_thinking_tokens.isdigit():
        body["max_thinking_tokens"] = int(max_thinking_tokens)
    return body


# ==============================================================================
# PROFILE 1: QWEN 3.8 MAX 0902 (LƯU TRỮ THAM KHẢO)
# ==============================================================================
PROFILE_GRADING_QWEN38_MAX = {
    "model_name": "qwen3.8-max-0902",
    "description": "Cấu hình lưu trữ Qwen3.8-Max (DashScope) trước khi chuyển sang Deploy.",
    "temperature": 0.05,
    "max_completion_tokens": 4000,
    "response_format": {"type": "json_object"},
    "extra_body": {
        "enable_thinking": True
    },
}

# ==============================================================================
# PROFILE 2: DEEPSEEK V4.1 FLASH 1017 (DEPLOY) - CHẤM ĐIỂM RUBRIC SONG SONG
# ==============================================================================
PROFILE_GRADING_DEEPSEEK_FLASH_1017 = {
    "model_name": DEPLOY_MODEL,
    "description": "DeepSeek-V4.1-Flash-1017 qua Deploy API cho Hội đồng chấm điểm Rubric (dùng chung API key).",
    "temperature": 0.05,
    "max_completion_tokens": 2500,
    "response_format": {"type": "json_object"},
    "extra_body": _build_deploy_extra_body(
        reasoning_effort=GRADING_REASONING_EFFORT,
        cache_preference=2,
    ),
}

# ==============================================================================
# PROFILE 3: DEEPSEEK V4.1 FLASH 1017 (DEPLOY) - OCR VISION TRÍCH XUẤT VĂN BẢN
# ==============================================================================
PROFILE_OCR_DEEPSEEK_FLASH = {
    "model_name": DEPLOY_MODEL,
    "description": "DeepSeek-V4.1-Flash-1017 qua Deploy API cho trích xuất thị giác ảnh PDF tiếng Việt.",
    "temperature": 0.01,
    "max_completion_tokens": 4000,
    "stream": False,
    "extra_body": _build_deploy_extra_body(
        reasoning_effort=OCR_REASONING_EFFORT,
        cache_preference=1,
    ),
}

# ==============================================================================
# ACTIVE SELECTION
# ==============================================================================
PROFILE_SELECTION = os.getenv("GRADING_PROFILE", "deepseek_flash_1017").lower()

if "qwen" in PROFILE_SELECTION or "max" in PROFILE_SELECTION:
    ACTIVE_GRADING_PROFILE = PROFILE_GRADING_QWEN38_MAX
else:
    ACTIVE_GRADING_PROFILE = PROFILE_GRADING_DEEPSEEK_FLASH_1017

ACTIVE_OCR_PROFILE = PROFILE_OCR_DEEPSEEK_FLASH
