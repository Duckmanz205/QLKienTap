const fs = require('fs');
let content = fs.readFileSync('e:/Khoa_Luan/CodeDoAn/frontend/src/services/api.js', 'utf8');

const getPrefixStr = 
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

export const khoaApi = {;

content = content.replace('export const khoaApi = {', getPrefixStr);

// Find the block of khoaApi and replace '/khoa/' with \/
const startIdx = content.indexOf('export const khoaApi = {');
const endIdx = content.indexOf('};', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  let before = content.substring(0, startIdx);
  let block = content.substring(startIdx, endIdx);
  let after = content.substring(endIdx);

  // Replace api.get('/khoa/...') with api.get(\\/...\)
  block = block.replace(/api\.(get|post|put|delete|patch)\(\'\/khoa\/(.*?)\'/g, "api.\(\\{getAdminPrefix()}/\\)");
  
  // Replace api.get(\/khoa/...\) with api.get(\\/...\)
  block = block.replace(/api\.(get|post|put|delete|patch)\(\\/khoa\/(.*?)\/g, "api.\(\\{getAdminPrefix()}/\\)");

  fs.writeFileSync('e:/Khoa_Luan/CodeDoAn/frontend/src/services/api.js', before + block + after);
}

