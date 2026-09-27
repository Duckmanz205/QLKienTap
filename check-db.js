const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('backend/database.sqlite');
db.all("SELECT id, trang_thai, cach_to_chuc FROM chuyen_tham_quan WHERE trang_thai='MoDangKy';", (err, rows) => {
  console.log('Trips open for registration:', rows);
});
db.all("SELECT id, ten_sinh_vien, nam_nhap_hoc FROM sinh_vien JOIN khoa_hoc ON sinh_vien.khoa_hoc_id = khoa_hoc.id WHERE ten_dang_nhap = 'nguyentrongtai' OR ho_ten LIKE '%Trọng Tài%';", (err, rows) => {
  console.log('Student info:', rows);
});
