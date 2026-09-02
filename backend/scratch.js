const http = require('http');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');

async function run() {
  const hash = await bcrypt.hash('123', 10);
  
  execSync(`sqlcmd -S localhost -d QLKienTap -Q "UPDATE TaiKhoan SET mat_khau_hash = '${hash}' WHERE ten_dang_nhap = 'clb01'"`);

  const data = JSON.stringify({ ten_dang_nhap: 'clb01', mat_khau: '123' });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const json = JSON.parse(body);
      if (!json.token) {
          console.log('Login failed', json);
          return;
      }
      const token = json.token;
      
      const schedData = JSON.stringify({
        ten_lich: 'Test script',
        dot_kien_tap_id: 1,
        khoa_id: 1,
        tg_mo_dang_ky_tu: '2026-09-02T12:00',
        tg_mo_dang_ky_den: '2026-09-03T12:00',
        tg_dien_ra_tu: '2026-09-04',
        tg_dien_ra_den: '2026-09-05',
        han_chot_nop_bao_cao: '2026-09-06T12:00',
        han_chot_diem: '2026-09-07T12:00'
      });

      const req2 = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/clb/schedules',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': schedData.length,
          'Authorization': 'Bearer ' + token
        }
      }, res2 => {
        let body2 = '';
        res2.on('data', chunk => body2 += chunk);
        res2.on('end', () => console.log('Schedule Response:', res2.statusCode, body2));
      });
      req2.write(schedData);
      req2.end();
    });
  });
  req.write(data);
  req.end();
}
run();
