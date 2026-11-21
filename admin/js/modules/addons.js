import APIClient from '/assets/js/modules/unified-api.js';
import { AuthManager } from '/assets/js/modules/unified-auth.js';
let currentAddons = [];
export async function render() {
setupEventListeners();
await loadAddons();
}
function setupEventListeners() {
const btnAdd = document.getElementById('btn-add-addon');
const btnClose = document.getElementById('btn-close-addon');
const modal = document.getElementById('addon-modal');
const form = document.getElementById('addon-form');
const container = document.getElementById('addons-grid');
if (btnAdd) {
btnAdd.addEventListener('click', () => {
form.reset();
const idInput = document.getElementById('addon-id');
if (idInput) {
idInput.disabled = false;
idInput.value = '';
}
const recInput = document.getElementById('addon-recommended');
if (recInput) recInput.checked = false;
const orderInput = document.getElementById('addon-order');
if (orderInput) orderInput.value = '99';
const titleEl = document.getElementById('addon-modal-title');
if (titleEl) titleEl.textContent = 'Tambah Addon Baru';
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
const editBtn = e.target.closest('[data-action="edit-addon"]');
if (editBtn) {
const id = editBtn.dataset.id;
openEditAddon(id);
return;
}
const deleteBtn = e.target.closest('[data-action="delete-addon"]');
if (deleteBtn) {
const id = deleteBtn.dataset.id;
await confirmDeleteAddon(id);
return;
}
});
}
if (form) {
form.addEventListener('submit', async (e) => {
e.preventDefault();
const submitBtn = document.getElementById('btn-save-addon');
const originalText = submitBtn.innerHTML;
submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
submitBtn.disabled = true;
const addonData = {
id: (document.getElementById('addon-id').value || '').trim(),
name: (document.getElementById('addon-name').value || '').trim(),
description: (document.getElementById('addon-description').value || '').trim(),
price: parseInt(document.getElementById('addon-price').value) || 0,
duration: parseInt(document.getElementById('addon-duration').value) || 1,
order: parseInt(document.getElementById('addon-order').value) || 0,
recommended: document.getElementById('addon-recommended').checked
};
try {
const adminId = AuthManager.getUserId();
const res = await APIClient.saveAdminAddon(adminId, addonData);
if (res.success) {
if (typeof Swal !== 'undefined') {
Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Addon berhasil disimpan!' });
}
modal.classList.remove('show');
await loadAddons();
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
function openEditAddon(id) {
const addon = currentAddons.find(a => a.id === id);
if (!addon) return;
document.getElementById('addon-modal-title').textContent = 'Edit Addon';
const idInput = document.getElementById('addon-id');
idInput.value = addon.id;
idInput.disabled = true;
document.getElementById('addon-name').value = addon.name;
document.getElementById('addon-description').value = addon.description || '';
document.getElementById('addon-price').value = addon.price || 0;
document.getElementById('addon-duration').value = addon.duration || 1;
document.getElementById('addon-order').value = addon.order !== undefined ? addon.order : 0;
document.getElementById('addon-recommended').checked = Boolean(addon.recommended);
document.getElementById('addon-modal').classList.add('show');
}
async function confirmDeleteAddon(id) {
if (typeof Swal !== 'undefined') {
const result = await Swal.fire({
title: 'Hapus Addon?',
text: `Addon dengan ID ${id} akan dihapus secara permanen.`,
icon: 'warning',
showCancelButton: true,
confirmButtonColor: '#ef4444',
cancelButtonColor: '#4b5563',
confirmButtonText: 'Ya, Hapus'
});
if (result.isConfirmed) {
try {
const res = await APIClient.deleteAdminAddon(AuthManager.getUserId(), id);
if (res.success) {
Swal.fire('Berhasil!', 'Addon telah dihapus.', 'success');
await loadAddons();
} else {
throw new Error(res.message);
}
} catch (err) {
Swal.fire('Error', err.message, 'error');
}
}
}
}
window.editAddon = openEditAddon;
window.deleteAddon = confirmDeleteAddon;
function formatNumber(num) {
return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0';
}
async function loadAddons() {
const container = document.getElementById('addons-grid');
if (!container) return;
container.innerHTML = '<div class="grid-col-full grid-state-message"><i class="ph ph-spinner ph-spin"></i><span>Memuat layanan ekstra...</span></div>';
try {
const adminId = AuthManager.getUserId();
const response = await APIClient.getAdminAddons(adminId);
if (response.success && response.data) {
const addons = response.data;
if (addons.length === 0) {
container.innerHTML = '<div class="grid-col-full grid-state-message">Belum ada layanan ekstra.</div>';
} else {
renderAddons(addons, container);
}
} else {
throw new Error(response.message);
}
} catch (error) {
container.innerHTML = `<div class="grid-col-full grid-state-message table-state-cell--error">${error.message}</div>`;
}
}
function renderAddons(addons, container) {
container.innerHTML = '';
currentAddons = addons;
addons.forEach(addon => {
const card = document.createElement('div');
const isRec = Boolean(addon.recommended);
card.className = isRec ? 'product-card product-card--featured' : 'product-card';
const displayPrice = addon.price > 0 ? `Rp ${formatNumber(addon.price)}` : 'Gratis';
let badges = '';
if (addon.recommended) {
badges += '<span class="status-pill status-pill--warning">Rekomendasi</span>';
}
card.innerHTML = `
<div class="addon-card-header">
<div class="addon-icon-wrap">
<i class="ph ph-puzzle-piece"></i>
</div>
<div class="addon-title-wrap">
<h3 class="addon-title">${addon.name}</h3>
${badges ? `<div class="addon-badges">${badges}</div>` : ''}
</div>
</div>
<p class="addon-desc">
${addon.description || '-'}
</p>
<div class="addon-price-wrap">
<span class="addon-price">${displayPrice}</span>
${addon.price > 0 ? `<span class="addon-cycle">/ ${addon.duration || 1} tahun</span>` : ''}
</div>
<div class="addon-actions">
<button type="button" class="admin-btn addon-btn-edit" data-action="edit-addon" data-id="${addon.id}">
<i class="ph ph-pencil-simple"></i> Edit
</button>
<button type="button" class="btn-action btn-action--delete addon-btn-delete" data-action="delete-addon" data-id="${addon.id}" title="Hapus">
<i class="ph ph-trash"></i>
</button>
</div>
`;
container.appendChild(card);
});
}