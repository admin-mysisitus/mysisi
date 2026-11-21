import APIClient from '/assets/js/modules/unified-api.js';
import { AuthManager } from '/assets/js/modules/unified-auth.js';
let currentDomains = [];
export async function render() {
setupEventListeners();
await loadDomains();
}
function setupEventListeners() {
const btnAdd = document.getElementById('btn-add-domain');
const btnClose = document.getElementById('btn-close-domain');
const modal = document.getElementById('domain-modal');
const form = document.getElementById('domain-form');
const container = document.getElementById('domains-grid');
if (btnAdd) {
btnAdd.addEventListener('click', () => {
form.reset();
const extInput = document.getElementById('domain-ext');
if (extInput) {
extInput.disabled = false;
extInput.value = '';
}
const orderInput = document.getElementById('domain-order');
if (orderInput) orderInput.value = '99';
const titleEl = document.getElementById('domain-modal-title');
if (titleEl) titleEl.textContent = 'Tambah Ekstensi Domain';
modal.classList.add('show');
});
}
if (btnClose) {
btnClose.addEventListener('click', () => {
modal.classList.remove('show');
});
}
if (container) {
container.addEventListener('click', async (e) => {
const editBtn = e.target.closest('[data-action="edit-dom"]');
if (editBtn) {
const extKey = editBtn.dataset.ext;
openEditDomain(extKey);
return;
}
const deleteBtn = e.target.closest('[data-action="delete-dom"]');
if (deleteBtn) {
const extKey = deleteBtn.dataset.ext;
await confirmDeleteDomain(extKey);
return;
}
});
}
if (form) {
form.addEventListener('submit', async (e) => {
e.preventDefault();
const submitBtn = document.getElementById('btn-save-domain');
const originalText = submitBtn.innerHTML;
submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
submitBtn.disabled = true;
let ext = (document.getElementById('domain-ext').value || '').trim();
if (ext && !ext.startsWith('.')) ext = '.' + ext;
const domainData = {
ext: ext,
registration: parseInt(document.getElementById('domain-registration').value) || 0,
renewal: parseInt(document.getElementById('domain-renewal').value) || 0,
transfer: parseInt(document.getElementById('domain-renewal').value) || 0,
oldPrice: parseInt(document.getElementById('domain-oldprice').value) || 0,
order: parseInt(document.getElementById('domain-order').value) || 0,
highlight: document.getElementById('domain-highlight').value,
info: (document.getElementById('domain-info').value || '').trim(),
label: (document.getElementById('domain-label').value || '').trim(),
color: document.getElementById('domain-color').value || '#2563eb'
};
try {
const adminId = AuthManager.getUserId();
const res = await APIClient.saveAdminDomain(adminId, domainData);
if (res.success) {
if (typeof Swal !== 'undefined') {
Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Domain berhasil disimpan!' });
}
modal.classList.remove('show');
await loadDomains();
} else {
throw new Error(res.message);
}
} catch (error) {
if (typeof Swal !== 'undefined') {
Swal.fire({ icon: 'error', title: 'Gagal', text: error.message });
}
} finally {
submitBtn.innerHTML = originalText;
submitBtn.disabled = false;
}
});
}
}
function openEditDomain(extKey) {
const domain = currentDomains.find(d => {
const k = d.ext.replace('.', '').replace(/\./g, '_');
return k === extKey;
});
if (!domain) return;
document.getElementById('domain-modal-title').textContent = 'Edit Ekstensi Domain';
const extInput = document.getElementById('domain-ext');
extInput.value = domain.ext;
extInput.disabled = true;
document.getElementById('domain-highlight').value = domain.highlight || 'none';
document.getElementById('domain-order').value = domain.order !== undefined ? domain.order : 0;
document.getElementById('domain-oldprice').value = domain.oldPrice || '';
document.getElementById('domain-registration').value = domain.registration || 0;
document.getElementById('domain-renewal').value = domain.renewal || 0;
document.getElementById('domain-info').value = domain.info || '';
const cleanLabel = domain.label ? domain.label.replace(/<[^>]*>?/gm, '').trim() : '';
document.getElementById('domain-label').value = cleanLabel;
document.getElementById('domain-color').value = domain.color || '#2563eb';
document.getElementById('domain-modal').classList.add('show');
}
async function confirmDeleteDomain(extKey) {
const domain = currentDomains.find(d => {
const k = d.ext.replace('.', '').replace(/\./g, '_');
return k === extKey;
});
if (!domain) return;
if (typeof Swal !== 'undefined') {
const result = await Swal.fire({
title: 'Hapus Ekstensi?',
text: `Ekstensi ${domain.ext} akan dihapus secara permanen.`,
icon: 'warning',
showCancelButton: true,
confirmButtonColor: '#ef4444',
cancelButtonColor: '#4b5563',
confirmButtonText: 'Ya, Hapus'
});
if (result.isConfirmed) {
try {
const res = await APIClient.deleteAdminDomain(AuthManager.getUserId(), domain.ext);
if (res.success) {
Swal.fire('Berhasil!', 'Ekstensi telah dihapus.', 'success');
await loadDomains();
} else {
throw new Error(res.message);
}
} catch (err) {
Swal.fire('Error', err.message, 'error');
}
}
}
}
window.editDomain = openEditDomain;
window.deleteDomain = confirmDeleteDomain;
function formatNumber(num) {
return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0';
}
async function loadDomains() {
const container = document.getElementById('domains-grid');
if (!container) return;
container.innerHTML = '<div class="grid-col-full grid-state-message"><i class="ph ph-spinner ph-spin"></i><span>Memuat harga domain...</span></div>';
try {
const adminId = AuthManager.getUserId();
const response = await APIClient.getAdminDomains(adminId);
if (response.success && response.data) {
const domains = response.data;
if (domains.length === 0) {
container.innerHTML = '<div class="grid-col-full grid-state-message">Belum ada ekstensi domain.</div>';
} else {
renderDomains(domains, container);
}
} else {
throw new Error(response.message);
}
} catch (error) {
container.innerHTML = `<div class="grid-col-full grid-state-message table-state-cell--error">${error.message}</div>`;
}
}
function renderDomains(domains, container) {
container.innerHTML = '';
currentDomains = domains;
const sortedDomains = domains.sort((a, b) => {
const orderA = typeof a.order === 'number' ? a.order : 999;
const orderB = typeof b.order === 'number' ? b.order : 999;
if (orderA !== orderB) return orderA - orderB;
const hlOrder = { best: 3, cheap: 2, business: 1, none: 0 };
return (hlOrder[b.highlight] || 0) - (hlOrder[a.highlight] || 0);
});
sortedDomains.forEach(domain => {
const extKey = domain.ext.replace('.', '').replace(/\./g, '_');
const hasDiscount = domain.oldPrice && domain.oldPrice > domain.registration;
let discountPercent = 0;
if (hasDiscount) {
discountPercent = Math.round((1 - domain.registration / domain.oldPrice) * 100);
}
const card = document.createElement('div');
const isBest = domain.highlight === 'best';
card.className = isBest ? 'product-card product-card--featured' : 'product-card';
let badges = '';
if (domain.label) {
const cleanBadge = domain.label.replace(/<[^>]*>?/gm, '').trim();
if (cleanBadge) {
badges += `<span class="status-pill status-pill--info">${cleanBadge}</span>`;
}
}
if (hasDiscount) {
badges += `<span class="status-pill status-pill--danger">Hemat ${discountPercent}%</span>`;
}
card.innerHTML = `
<div class="domain-card-header">
<div class="domain-ext">${domain.ext}</div>
<div class="domain-badges">${badges}</div>
</div>
<div class="domain-pricing-wrap">
${hasDiscount ? `<div class="domain-old-price">Rp ${formatNumber(domain.oldPrice)}</div>` : ''}
<div class="domain-main-price">
Rp ${formatNumber(domain.registration)}
<span class="domain-cycle">/ thn</span>
</div>
<div class="domain-renewal">
Perpanjang: Rp ${formatNumber(domain.renewal)}
</div>
</div>
<div class="domain-actions">
<button type="button" class="admin-btn domain-btn-edit" data-action="edit-dom" data-ext="${extKey}">
<i class="ph ph-pencil-simple"></i> Edit
</button>
<button type="button" class="btn-action btn-action--delete domain-btn-delete" data-action="delete-dom" data-ext="${extKey}" title="Hapus">
<i class="ph ph-trash"></i>
</button>
</div>
`;
container.appendChild(card);
});
}