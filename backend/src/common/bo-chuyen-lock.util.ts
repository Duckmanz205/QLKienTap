import * as fs from 'fs';
import * as path from 'path';

const LOCK_FILE_PATH = path.resolve(process.cwd(), 'uploads', 'bo_chuyen_locks.json');

function readLocks(): Record<string, boolean> {
  try {
    if (!fs.existsSync(LOCK_FILE_PATH)) return {};
    const content = fs.readFileSync(LOCK_FILE_PATH, 'utf8');
    return JSON.parse(content) || {};
  } catch {
    return {};
  }
}

function writeLocks(locks: Record<string, boolean>) {
  try {
    const dir = path.dirname(LOCK_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCK_FILE_PATH, JSON.stringify(locks, null, 2), 'utf8');
  } catch (err) {
    console.error('Lỗi ghi file bo_chuyen_locks:', err);
  }
}

export const BoChuyenLockManager = {
  isLocked(dotKienTapId: number): boolean {
    if (!dotKienTapId) return false;
    const locks = readLocks();
    return !!locks[String(dotKienTapId)];
  },
  setLock(dotKienTapId: number, isLocked: boolean) {
    if (!dotKienTapId) return;
    const locks = readLocks();
    if (isLocked) {
      locks[String(dotKienTapId)] = true;
    } else {
      delete locks[String(dotKienTapId)];
    }
    writeLocks(locks);
  },
};
