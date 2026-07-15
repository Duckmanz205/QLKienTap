"""
AI Service - Entry point
Khởi chạy FastAPI server phục vụ inference cho hệ thống QLKienTap.
"""

from fastapi import FastAPI

app = FastAPI(
    title="QLKienTap AI Service",
    description="Microservice AI cho hệ thống Quản lý Kiến tập",
    version="0.1.0",
)


@app.get("/")
def root():
    return {"message": "AI Service is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


# TODO: Thêm các endpoint AI tại đây
# Ví dụ:
# @app.post("/predict/grade")
# async def predict_grade(data: GradeInput):
#     ...


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
