import APIClient from '/assets/js/modules/unified-api.js';
import {
AuthManager
} from '/assets/js/modules/unified-auth.js';
import {
openDnsManagement
} from '/assets/js/modules/dns-ui.js';
let registeredDomains = [];
export async function render() {
console.error('Admin DNS Module Loaded');
setupEventListeners();
await loadDNS();
}
function setupEventListeners() {
const tbody = document.getElementById('dns-table-body');
if (tbody) {
tbody.addEventListener('click', (e) => {
const btnCf = e.target.closest('[data-action="setup-cf"]');
if (btnCf) {
window.setupCloudflare(btnCf.dataset.domain);
return;
}
const btnDns = e.target.closest('[data-action="manage-dns"]');
if (btnDns) {
window.manageDns(btnDns.dataset.domain);
return;
}
});
}
const btnAdd = document.getElementById('btn-add-dns');
const btnClose = document.getElementById('btn-close-dns');
const modal = document.getElementById('dns-modal');
if (btnAdd) {
btnAdd.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Refresh Data';
btnAdd.addEventListener('click', async () => {
btnAdd.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Memuat...';
await loadDNS();
btnAdd.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Refresh Data';
});
}
window.setupCloudflare = async (domain) => {
if (typeof Swal !== 'undefined') {
Swal.fire({
title: 'Menyiapkan Sistem DNS...',
text: `Mendaftarkan ${domain} ke Sistem DNS`,
allowOutsideClick: false,
didOpen: () => {
Swal.showLoading();
}
});
}
try {
const res = await APIClient.setupCloudflareZone(domain);
if (res.success) {
const nsList = res.data.name_servers.map(ns => `<li><strong>${ns}</strong></li>`).join('');
Swal.fire({
icon: 'success',
title: 'Sistem DNS Berhasil Disetup!',
html: `
<p>Silakan ubah Nameserver (NS) domain <b>${domain}</b> di penyedia domain Anda (misal DomaiNesia) menjadi:</p>
<ul class="dns-cf-instructions">
${nsList}
</ul>
`
});
} else {
throw new Error(res.message);
}
} catch (err) {
Swal.fire('Gagal', err.message, 'error');
}
};
window.manageDNS = async (domainName) => {
openDnsManagement(domainName, window.setupCloudflare);
};
}
async function loadDNS() {
const tbody = document.getElementById('dns-table-body');
if (!tbody) return;
tbody.innerHTML = '<tr><td colspan="4" class="table-state-cell"><i class="ph ph-spinner ph-spin"></i><span>Mencari data domain dari pesanan...</span></td></tr>';
try {
const adminId = AuthManager.getUserId();
const response = await APIClient.getAllTransactions(adminId);
if (response.success) {
const orders = response.data || [];
const domainMap = new Map();
orders.forEach(o => {
if (o.paymentStatus === 'paid' && o.domain) {
if (!domainMap.has(o.domain)) {
domainMap.set(o.domain, {
domain: o.domain,
user: o.customerEmail || o.userId || 'Unknown User'
});
}
}
});
registeredDomains = Array.from(domainMap.values());
if (registeredDomains.length === 0) {
tbody.innerHTML = '<tr><td colspan="4" class="table-state-cell">Belum ada pesanan domain lunas.</td></tr>';
} else {
renderDNS(registeredDomains, tbody);
}
} else {
throw new Error(response.message);
}
} catch (error) {
console.error('Failed to load DNS domains:', error);
tbody.innerHTML = `<tr class="table-state-cell--error"><td colspan="4" class="table-state-cell table-state-cell--error">${error.message}</td></tr>`;
}
}
function renderDNS(domainsList, tbody) {
tbody.innerHTML = '';
domainsList.forEach(d => {
const tr = document.createElement('tr');
tr.innerHTML = `
<td class="nowrap">
<div class="dns-domain-cell"><i class="ph ph-globe text-primary mr-xs"></i><span class="font-bold text-sm">${d.domain}</span></div>
</td>
<td class="text-muted text-sm">${d.user}</td>
<td class="nowrap">
<span class="status-pill status-pill--info"><i class="ph ph-cloud"></i> Otomatis</span>
</td>
<td class="text-right nowrap">
<div class="table-actions">
<button type="button" class="admin-btn btn-sm mr-xs" data-action="setup-cf" data-domain="${d.domain}" title="Setup Cloudflare">
<i class="ph ph-lightning"></i> Setup CF
</button>
<button type="button" class="btn-action btn-action--view" data-action="manage-dns" data-domain="${d.domain}" title="Kelola DNS">
<i class="ph ph-gear"></i>
</button>
</div>
</td>
`;
tbody.appendChild(tr);
});
}