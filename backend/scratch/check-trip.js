const { DataSource } = require('typeorm');
const options = require('./src/ormconfig.js');
const ds = new DataSource(options);
ds.initialize().then(async () => {
  const res = await ds.query('SELECT ChuyenThamQuan.id, NhaMay.ten_nha_may, lich_kien_tap_id, trang_thai FROM ChuyenThamQuan LEFT JOIN NhaMay ON NhaMay.id = ChuyenThamQuan.nha_may_id');
  console.log(res);
  process.exit(0);
});
