import * as fs from 'fs';
import * as path from 'path';

const LOCK_FILE_PATH = path.resolve(process.cwd(), 'uploads', 'bo_chuyen_locks.json');
let cachedLocks: Record<string, boolean> | null = null;

function readLocks(): Record<string, boolean> {
  if (cachedLocks !== null) {
    return cachedLocks;
  }
  try {
    if (!fs.existsSync(LOCK_FILE_PATH)) {
      cachedLocks = {};
      return cachedLocks;
    }
    const content = fs.readFileSync(LOCK_FILE_PATH, 'utf8');
    cachedLocks = JSON.parse(content) || {};
    return cachedLocks!;
  } catch {
    cachedLocks = {};
    return cachedLocks;
  }
}

function writeLocks(locks: Record<string, boolean>) {
  cachedLocks = { ...locks };
  try {
    const dir = path.dirname(LOCK_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFile(LOCK_FILE_PATH, JSON.stringify(locks, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Lỗi ghi file bo_chuyen_locks:', err);
      }
    });
  } catch (err) {
    console.error('Lỗi chuẩn bị ghi file bo_chuyen_locks:', err);
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
    const locks = { ...readLocks() };
    if (isLocked) {
      locks[String(dotKienTapId)] = true;
    } else {
      delete locks[String(dotKienTapId)];
    }
    writeLocks(locks);
  },
};
