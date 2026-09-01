const fs = require('fs');
let content = fs.readFileSync('e:/Khoa_Luan/CodeDoAn/frontend/src/services/api.js', 'utf8');

const prefixStr = \
const getAdminPrefix = () => {
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const parsed = JSON.parse(userJson);
      if (parsed?.user?.vai_tro === 'QuanLyCLB') return '/clb';
    }
  } catch (e) {}
  return '/khoa';
};

export const khoaApi = {\;

content = content.replace('export const khoaApi = {', prefixStr);

// Split at export const khoaApi = {
const splitIdx = content.indexOf('export const khoaApi = {');
let start = content.substring(0, splitIdx + 'export const khoaApi = {'.length);
let rest = content.substring(splitIdx + 'export const khoaApi = {'.length);

rest = rest.replace(/'\/khoa\//g, '\\\\\\{getAdminPrefix()}/');
rest = rest.replace(/',/g, '\\\,');
rest = rest.replace(/\\\/khoa\//g, '\\\\\\{getAdminPrefix()}/');

fs.writeFileSync('e:/Khoa_Luan/CodeDoAn/frontend/src/services/api.js', start + rest);
