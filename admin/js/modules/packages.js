import APIClient from '/assets/js/modules/unified-api.js';
import { AuthManager } from '/assets/js/modules/unified-auth.js';
let currentPackages = [];
export async function render() {
setupEventListeners();
await loadPackages();
}
function setupEventListeners() {
const btnAdd = document.getElementById('btn-add-package');
const btnClose = document.getElementById('btn-close-package');
const modal = document.getElementById('package-modal');
const form = document.getElementById('package-form');
const container = document.getElementById('packages-grid');
if (btnAdd) {
btnAdd.addEventListener('click', () => {
form.reset();
document.getElementById('pkg-id').disabled = false;
document.getElementById('pkg-id').value = '';
document.getElementById('pkg-periodValue').value = '1';
document.getElementById('pkg-order').value = '99';
document.getElementById('pkg-active').checked = true;
document.getElementById('package-modal-title').textContent = 'Buat Paket Baru';
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
const editBtn = e.target.closest('[data-action="edit-pkg"]');
if (editBtn) {
const id = editBtn.dataset.id;
openEditPackage(id);
return;
}
const deleteBtn = e.target.closest('[data-action="delete-pkg"]');
if (deleteBtn) {
const id = deleteBtn.dataset.id;
await confirmDeletePackage(id);
return;
}
});
}
if (form) {
form.addEventListener('submit', async (e) => {
e.preventDefault();
const submitBtn = document.getElementById('btn-save-package');
const originalText = submitBtn.innerHTML;
submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
submitBtn.disabled = true;
const featuresText = document.getElementById('pkg-features').value;
const featuresArray = featuresText.split('\n').map(f => f.trim()).filter(f => f.length > 0);
const packageData = {
id: document.getElementById('pkg-id').value.trim(),
name: document.getElementById('pkg-name').value.trim(),
price: parseInt(document.getElementById('pkg-price').value),
periodValue: parseInt(document.getElementById('pkg-periodValue').value) || 1,
order: parseInt(document.getElementById('pkg-order').value) || 0,
description: document.getElementById('pkg-description').value.trim(),
features: featuresArray,
active: document.getElementById('pkg-active').checked
};
try {
const adminId = AuthManager.getUserId();
const res = await APIClient.saveAdminPackage(adminId, packageData);
if (res.success) {
if (typeof Swal !== 'undefined') {
Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Paket berhasil disimpan!' });
}
modal.classList.remove('show');
await loadPackages();
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
function openEditPackage(id) {
const pkg = currentPackages.find(p => p.id === id);
if (!pkg) return;
document.getElementById('package-modal-title').textContent = 'Edit Paket';
document.getElementById('pkg-id').value = pkg.id;
document.getElementById('pkg-id').disabled = true;
document.getElementById('pkg-name').value = pkg.name;
document.getElementById('pkg-price').value = pkg.price;
document.getElementById('pkg-periodValue').value = pkg.periodValue || pkg.cycle || 1;
document.getElementById('pkg-order').value = pkg.order !== undefined ? pkg.order : 0;
document.getElementById('pkg-description').value = pkg.description || '';
let featuresText = '';
if (Array.isArray(pkg.features)) {
featuresText = pkg.features.join('\n');
} else if (typeof pkg.features === 'string') {
featuresText = pkg.features;
}
document.getElementById('pkg-features').value = featuresText;
document.getElementById('pkg-active').checked = pkg.active !== false;
document.getElementById('package-modal').classList.add('show');
}
async function confirmDeletePackage(id) {
if (typeof Swal !== 'undefined') {
const result = await Swal.fire({
title: 'Hapus Paket?',
text: `Paket dengan ID ${id} akan dihapus secara permanen.`,
icon: 'warning',
showCancelButton: true,
confirmButtonColor: '#ef4444',
cancelButtonColor: '#4b5563',
confirmButtonText: 'Ya, Hapus'
});
if (result.isConfirmed) {
try {
const res = await APIClient.deleteAdminPackage(AuthManager.getUserId(), id);
if (res.success) {
Swal.fire('Berhasil!', 'Paket telah dihapus.', 'success');
await loadPackages();
} else {
throw new Error(res.message);
}
} catch (err) {
Swal.fire('Error', err.message, 'error');
}
}
}
}
window.editPackage = openEditPackage;
window.deletePackage = confirmDeletePackage;
async function loadPackages() {
const container = document.getElementById('packages-grid');
if (!container) return;
container.innerHTML = '<div class="grid-col-full grid-state-message"><i class="ph ph-spinner ph-spin"></i><span>Memuat data paket...</span></div>';
try {
const adminId = AuthManager.getUserId();
const response = await APIClient.getAdminPackages(adminId);
if (response.success && response.data) {
const packages = response.data;
if (packages.length === 0) {
container.innerHTML = '<div class="grid-col-full grid-state-message">Belum ada paket.</div>';
} else {
renderPackages(packages, container);
}
} else {
throw new Error(response.message);
}
} catch (error) {
container.innerHTML = `<div class="grid-col-full grid-state-message table-state-cell--error">${error.message}</div>`;
}
}
function renderPackages(packages, container) {
container.innerHTML = '';
currentPackages = packages;
packages.forEach((pkg, index) => {
const isPopular = index === 1;
const isActive = pkg.active !== false;
const card = document.createElement('div');
let cardClasses = ['product-card'];
if (isPopular) cardClasses.push('product-card--featured');
if (!isActive) cardClasses.push('product-card--inactive');
card.className = cardClasses.join(' ');
let popularBadge = isPopular ? '<div class="popular-badge">Paling Populer</div>' : '';
let inactiveBadge = !isActive ? '<div class="inactive-badge">NONAKTIF</div>' : '';
let featuresArr = [];
if (Array.isArray(pkg.features)) {
featuresArr = pkg.features;
} else if (typeof pkg.features === 'string' && pkg.features.trim()) {
featuresArr = pkg.features.split('\n');
}
let featuresHtml = featuresArr.filter(f => f && f.trim().length > 0).map(f => `
<li class="pkg-feature-item">
<i class="ph ph-check-circle pkg-check-icon"></i>
<span>${f.trim()}</span>
</li>
`).join('');
const displayPrice = pkg.price != null ? Number(pkg.price).toLocaleString('id-ID') : '0';
const displayCycle = pkg.periodValue || pkg.cycle || '1';
const pkgId = pkg.id || '';
const pkgName = pkg.name || 'Paket Tanpa Nama';
card.innerHTML = `
${popularBadge}
${inactiveBadge}
<div class="pkg-header">
<h3 class="pkg-title">${pkgName}</h3>
</div>
<div class="pkg-price-wrap">
<span class="pkg-price">Rp ${displayPrice}</span>
<span class="pkg-cycle">/${displayCycle} Tahun</span>
</div>
<ul class="pkg-features-list">
${featuresHtml || '<li class="pkg-feature-empty">-</li>'}
</ul>
<div class="pkg-actions">
<button type="button" class="admin-btn pkg-btn-edit" data-action="edit-pkg" data-id="${pkgId}">
<i class="ph ph-pencil-simple"></i> Edit Paket
</button>
<button type="button" class="btn-action btn-action--delete pkg-btn-delete" data-action="delete-pkg" data-id="${pkgId}" title="Hapus">
<i class="ph ph-trash"></i>
</button>
</div>
`;
container.appendChild(card);
});
}