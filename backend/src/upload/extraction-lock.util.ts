/**
 * extraction-lock.util.ts
 * Quản lý bộ nhớ các tiến trình OCR bài thu hoạch đang chạy
 * để chống race condition và gọi trùng lặp giữa uploadReport và submitReport.
 */
export const activeExtractions = new Set<string>();

