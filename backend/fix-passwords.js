/**
 * Script fix mật khẩu trực tiếp vào SQL Server thông qua mssql driver.
 * Chạy: node fix-passwords.js
 */
const bcrypt = require('bcryptjs');
const sql = require('mssql');
require('dotenv').config();

async function main() {
  const config = {
    user: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || '123',
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_DATABASE || 'QLKienTap',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  console.log('🔌 Đang kết nối SQL Server...');
  const pool = await sql.connect(config);

  // 1. Kiểm tra các tài khoản hiện có
  console.log('\n📋 Danh sách tài khoản hiện tại:');
  const accounts = await pool.request().query(
    `SELECT id, ten_dang_nhap, LEFT(mat_khau_hash, 30) AS hash_preview, vai_tro, trang_thai 
     FROM TaiKhoan ORDER BY id`
  );
  console.table(accounts.recordset);

  // 2. Hash mật khẩu mặc định
  const hashes = {
    QuanLyKhoa: await bcrypt.hash('AdminHuit2025', 10),
    SinhVien: await bcrypt.hash('SvHuit2025', 10),
    GiangVien: await bcrypt.hash('GvHuit2025', 10),
  };

  // 3. Update từng vai trò
  for (const [vaiTro, hash] of Object.entries(hashes)) {
    const result = await pool.request()
      .input('hash', sql.NVarChar, hash)
      .input('vaiTro', sql.NVarChar, vaiTro)
      .query(`UPDATE TaiKhoan SET mat_khau_hash = @hash WHERE vai_tro = @vaiTro`);
    console.log(`✅ Đã cập nhật ${result.rowsAffected[0]} tài khoản vai trò ${vaiTro}`);
  }

  // 4. Kiểm tra lại
  console.log('\n📋 Danh sách tài khoản sau khi cập nhật:');
  const updated = await pool.request().query(
    `SELECT id, ten_dang_nhap, LEFT(mat_khau_hash, 30) AS hash_preview, vai_tro 
     FROM TaiKhoan ORDER BY id`
  );
  console.table(updated.recordset);

  await pool.close();
  console.log('\n🎉 Hoàn tất! Bạn có thể đăng nhập lại.');
}

main().catch((err) => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
