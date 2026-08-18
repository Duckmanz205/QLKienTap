const bcrypt = require('bcryptjs');

async function main() {
  const passwords = {
    AdminHuit2025: await bcrypt.hash('AdminHuit2025', 10),
    SvHuit2025: await bcrypt.hash('SvHuit2025', 10),
    GvHuit2025: await bcrypt.hash('GvHuit2025', 10),
  };

  console.log('=== Bcrypt Hashes ===');
  for (const [plain, hash] of Object.entries(passwords)) {
    console.log(`${plain}: ${hash}`);
  }

  console.log('\n=== SQL UPDATE (chạy trong SSMS) ===');
  console.log(`UPDATE TaiKhoan SET mat_khau_hash = '${passwords.AdminHuit2025}' WHERE ten_dang_nhap = 'admin01';`);
  console.log(`UPDATE TaiKhoan SET mat_khau_hash = '${passwords.SvHuit2025}' WHERE vai_tro = 'SinhVien';`);
  console.log(`UPDATE TaiKhoan SET mat_khau_hash = '${passwords.GvHuit2025}' WHERE vai_tro = 'GiangVien';`);
}

main();
