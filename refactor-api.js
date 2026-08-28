const fs = require('fs');
let code = fs.readFileSync('assets/js/modules/unified-api.js', 'utf8');

// Replace hardcoded API call strings with GAS_CONFIG.ACTIONS...
code = code.replace(/this\.call\('createOrderWithAuth'/g, "this.call(GAS_CONFIG.ACTIONS.CREATE_ORDER");
code = code.replace(/this\.call\('checkPaymentStatus'/g, "this.call(GAS_CONFIG.ACTIONS.CHECK_PAYMENT_STATUS");
code = code.replace(/this\.call\('generateMidtransToken'/g, "this.call(GAS_CONFIG.ACTIONS.GENERATE_MIDTRANS_TOKEN");
code = code.replace(/this\.call\('setupCloudflareZone'/g, "this.call(GAS_CONFIG.ACTIONS.SETUP_CLOUDFLARE_ZONE");
code = code.replace(/this\.call\('getDnsRecords'/g, "this.call(GAS_CONFIG.ACTIONS.GET_DNS_RECORDS");
code = code.replace(/this\.call\('addDnsRecord'/g, "this.call(GAS_CONFIG.ACTIONS.ADD_DNS_RECORD");
code = code.replace(/this\.call\('editDnsRecord'/g, "this.call(GAS_CONFIG.ACTIONS.EDIT_DNS_RECORD");
code = code.replace(/this\.call\('deleteDnsRecord'/g, "this.call(GAS_CONFIG.ACTIONS.DELETE_DNS_RECORD");

// Remove the first duplicate verifyEmailToken and resetPassword (the ones that call this.call)
// We will use regex to remove the blocks
const removeVerifyEmailToken = /\/\*\*\r?\n\s*\* Verify email token[^]*?static verifyEmailToken\(token\) \{\r?\n\s*return this\.call\('verifyEmailToken', \{\r?\n\s*token\r?\n\s*\}, \{\r?\n\s*method: 'GET'\r?\n\s*\}\);\r?\n\s*\}/;
code = code.replace(removeVerifyEmailToken, '');

const removeResetPassword = /\/\*\*\r?\n\s*\* Reset password with token[^]*?static resetPassword\(token, password\) \{\r?\n\s*return this\.call\('resetPassword', \{\r?\n\s*token,\r?\n\s*password\r?\n\s*\}, \{\r?\n\s*method: 'POST'\r?\n\s*\}\);\r?\n\s*\}/;
code = code.replace(removeResetPassword, '');

fs.writeFileSync('assets/js/modules/unified-api.js', code);
console.log('Refactored unified-api.js');
