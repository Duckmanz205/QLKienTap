const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function main() {
  // Đường dẫn tuyệt đối tới file import gốc và file đích
  const importDataPath = path.resolve(__dirname, '../../DB/QLKienTap_ImportData.sql');
  const outputPath = path.resolve(__dirname, '../../DB/QLKienTap_ResetPassword_Individual.sql');

  if (!fs.existsSync(importDataPath)) {
    console.error('Không tìm thấy file QLKienTap_ImportData.sql tại', importDataPath);
    return;
  }

  // Đọc file, xử lý BOM hoặc UTF-16 nếu có (SQL Server Management Studio thường lưu với encoding đặc biệt)
  const buffer = fs.readFileSync(importDataPath);
  let content = '';
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    content = buffer.toString('utf16le');
  } else if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    content = buffer.toString('utf16le'); // Simplified fallback
  } else if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    content = buffer.toString('utf8').substring(1);
  } else {
    content = buffer.toString('utf8');
  }

  // Trích xuất tự động danh sách tài khoản từ các câu lệnh INSERT INTO TaiKhoan có sẵn
  // Mẫu câu lệnh: INSERT INTO TaiKhoan (...) VALUES (22, N'2005190573', N'$2b...', N'SinhVien', N'HoatDong', 1);
  const regex = /INSERT INTO TaiKhoan[\s\S]*?VALUES\s*\(\d+,\s*N'([^']+)',\s*N'[^']+',\s*N'([^']+)'/g;
  
  const accounts = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const ten_dang_nhap = match[1];
    const vai_tro = match[2];
    
    // Chỉ lấy vai trò SinhVien hoặc GiangVien (bỏ qua QuanLyKhoa như yêu cầu)
    if (vai_tro === 'SinhVien' || vai_tro === 'GiangVien') {
      accounts.push({ ten_dang_nhap, vai_tro });
    }
  }

  if (accounts.length === 0) {
    console.log('Không tìm thấy tài khoản nào thuộc diện SinhVien/GiangVien trong file ImportData.');
    return;
  }

  console.log(`Đã trích xuất ${accounts.length} tài khoản SinhVien/GiangVien từ ImportData. Đang tiến hành hash mật khẩu... (có thể mất vài giây)`);

  const saltRounds = 10;
  let sqlLines = [
    '-- Script cập nhật mật khẩu mặc định riêng theo đúng mã định danh (MSSV/mã GV) cho từng tài khoản',
    '-- Sinh tự động từ generate-individual-passwords.js, KHÔNG chạy trực tiếp production nếu chưa review kỹ',
    'USE QLKienTap;',
    'GO',
    '',
  ];

  // Hash password riêng cho từng người
  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.ten_dang_nhap, saltRounds);
    // Bắt buộc đổi MK lần tới: phai_doi_mat_khau = 1
    sqlLines.push(
      `UPDATE TaiKhoan SET mat_khau_hash = N'${hash}', phai_doi_mat_khau = 1 WHERE ten_dang_nhap = N'${acc.ten_dang_nhap}';`
    );
  }
  sqlLines.push('GO');

  // Ghi ra file .sql kết quả
  fs.writeFileSync(outputPath, sqlLines.join('\n'), 'utf-8');
  console.log(`Hoàn tất! Đã sinh ${accounts.length} dòng UPDATE vào file ${outputPath}`);
}

main().catch(console.error);
