const { DataSource } = require('typeorm');
const ds = new DataSource({
  type: 'mysql2',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'qlkientap',
});
ds.initialize().then(async () => {
  const phieus = await ds.query('SELECT p.id, p.trang_thai, c.lich_kien_tap_id FROM phieu_dang_ky p JOIN chuyen_tham_quan c ON p.chuyen_tham_quan_id = c.id WHERE c.lich_kien_tap_id = 1');
  console.log('PhieuDangKy for lich 1:', phieus);
  
  const hopLe = phieus.filter(p => p.trang_thai === 'HopLe');
  console.log('HopLe count:', hopLe.length);

  const lksv = await ds.query('SELECT * FROM lich_kien_tap_sinh_vien WHERE lich_kien_tap_id = 1');
  console.log('LichKienTapSinhVien count:', lksv.length);
  process.exit(0);
}).catch(console.error);
