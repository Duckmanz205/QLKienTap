const fs = require('fs');
let content = fs.readFileSync('e:/Khoa_Luan/CodeDoAn/frontend/src/services/api.js', 'utf8');

// The file currently has things like: api.get( + "" + ${getAdminPrefix()}/years')
// I want to replace ${getAdminPrefix()}/something') or /khoa/something) with ${getAdminPrefix()}/something)
// Let's just restore the file to what it was before my powershell messed it up, from git!
