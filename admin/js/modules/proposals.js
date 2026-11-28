import APIClient from '/assets/js/modules/unified-api.js';
import { AuthManager } from '/assets/js/modules/unified-auth.js';
import InvoiceService from '/assets/js/modules/unified-invoice.js';
let currentProposals = [];
export async function render() {
console.log('Admin Proposals & Invoices Module Loaded');
setupEventListeners();
await loadProposals();
}
function setupEventListeners() {
const tbody = document.getElementById('proposals-table-body');
if (tbody) {
tbody.addEventListener('click', (e) => {
const btnInv = e.target.closest('[data-action="view-invoice"]');
if (btnInv) {
window.openInvoiceOnline(btnInv.dataset.id);
return;
}
const btnProp = e.target.closest('[data-action="view-proposal"]');
if (btnProp) {
window.openProposalOnline(btnProp.dataset.id);
return;
}
const btnCopy = e.target.closest('[data-action="copy-invoice"]');
if (btnCopy) {
window.copyInvoiceLink(btnCopy.dataset.id);
return;
}
const btnEdit = e.target.closest('[data-action="edit-proposal"]');
if (btnEdit) {
window.editProposal(btnEdit.dataset.id);
return;
}
const btnDup = e.target.closest('[data-action="duplicate-proposal"]');
if (btnDup) {
window.duplicateProposal(btnDup.dataset.id);
return;
}
const btnDel = e.target.closest('[data-action="delete-proposal"]');
if (btnDel) {
window.deleteProposal(btnDel.dataset.id, btnDel.dataset.name);
return;
}
});
}
const btnAdd = document.getElementById('btn-add-proposal');
const btnClose = document.getElementById('btn-close-proposal');
const btnCloseTop = document.getElementById('btn-close-proposal-top');
const modal = document.getElementById('proposal-modal');
const form = document.getElementById('proposal-form');
if (btnAdd) {
btnAdd.addEventListener('click', () => {
openAddModal();
});
}
const closeModal = () => {
if (modal) modal.style.display = 'none';
};
if (btnClose) btnClose.addEventListener('click', closeModal);
if (btnCloseTop) btnCloseTop.addEventListener('click', closeModal);
const presetBtns = document.querySelectorAll('.preset-btn');
presetBtns.forEach(btn => {
btn.addEventListener('click', () => {
const preset = btn.getAttribute('data-preset');
applyPreset(preset);
});
});
const catSelect = document.getElementById('prop-category');
if (catSelect) {
catSelect.addEventListener('change', () => {
const isNew = !document.getElementById('proposal-id').value;
if (isNew) {
applyPreset(catSelect.value, false);
}
});
}
const searchInput = document.getElementById('search-proposals');
const filterCat = document.getElementById('filter-proposal-category');
const filterStatus = document.getElementById('filter-proposal-status');
if (searchInput) searchInput.addEventListener('input', () => renderTable());
if (filterCat) filterCat.addEventListener('change', () => renderTable());
if (filterStatus) filterStatus.addEventListener('change', () => renderTable());
if (form) {
form.addEventListener('submit', async (e) => {
e.preventDefault();
await handleFormSubmit();
});
}
window.openInvoiceOnline = (id) => {
window.open(`/invoice/?id=${encodeURIComponent(id)}`, '_blank');
};
window.openProposalOnline = (id) => {
window.open(`/proposal/?id=${encodeURIComponent(id)}`, '_blank');
};
window.copyInvoiceLink = (id) => {
const url = `${window.location.origin}/invoice/?id=${encodeURIComponent(id)}`;
navigator.clipboard.writeText(url).then(() => {
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'success',
title: 'Link Faktur Tersalin!',
text: `Link invoice siap dibagikan ke calon klien:\n${url}`,
timer: 2500,
showConfirmButton: false
});
} else {
alert('Link tersalin: ' + url);
}
});
};
window.copyProposalLink = (id) => {
const url = `${window.location.origin}/proposal/?id=${encodeURIComponent(id)}`;
navigator.clipboard.writeText(url).then(() => {
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'success',
title: 'Link Proposal Tersalin!',
text: `Link proposal online berhasil disalin:\n${url}`,
timer: 2500,
showConfirmButton: false
});
} else {
alert('Link tersalin: ' + url);
}
});
};
window.editProposal = (id) => {
const proposal = currentProposals.find(p => p.id === id);
if (!proposal) return;
openEditModal(proposal);
};
window.duplicateProposal = async (id) => {
const orig = currentProposals.find(p => p.id === id);
if (!orig) return;
const clone = {
...orig,
id: InvoiceService.generateId(),
invoiceNumber: InvoiceService.generateInvoiceNumber(),
clientName: `${orig.clientName} (Salinan)`,
title: `${orig.title}`,
createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString(),
status: 'draft'
};
try {
await InvoiceService.saveInvoice(clone);
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'success',
title: 'Berhasil Diduplikat',
text: 'Faktur/proposal berhasil diduplikat sebagai draft baru.',
timer: 1800,
showConfirmButton: false
});
}
await loadProposals();
} catch (e) {
console.error(e);
}
};
window.deleteProposal = async (id, name) => {
if (typeof Swal !== 'undefined') {
const result = await Swal.fire({
title: 'Hapus Faktur / Proposal Ini?',
text: `Dokumen untuk "${name || id}" akan dihapus permanen.`,
icon: 'warning',
showCancelButton: true,
confirmButtonColor: '#ef4444',
cancelButtonColor: '#64748b',
confirmButtonText: 'Ya, Hapus',
cancelButtonText: 'Batal'
});
if (!result.isConfirmed) return;
} else {
if (!confirm(`Hapus proposal untuk "${name || id}"?`)) return;
}
try {
const res = await InvoiceService.deleteInvoice(id);
if (res.success) {
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'success',
title: 'Dihapus',
text: 'Dokumen berhasil dihapus.',
timer: 1500,
showConfirmButton: false
});
}
await loadProposals();
}
} catch (e) {
console.error(e);
}
};
}
function openAddModal() {
const form = document.getElementById('proposal-form');
const modal = document.getElementById('proposal-modal');
if (!form || !modal) return;
form.reset();
document.getElementById('proposal-id').value = '';
document.getElementById('proposal-modal-title').textContent = 'Buat Proposal Penawaran Baru';
const elEmail = document.getElementById('prop-client-email'); if (elEmail) elEmail.value = '';
const elUser = document.getElementById('prop-user-id'); if (elUser) elUser.value = '';
const d = new Date();
d.setDate(d.getDate() + 30);
document.getElementById('prop-valid-until').value = d.toISOString().split('T')[0];
applyPreset('sekolah');
modal.style.display = 'flex';
}
function openEditModal(proposal) {
const modal = document.getElementById('proposal-modal');
if (!modal) return;
document.getElementById('proposal-modal-title').textContent = 'Edit Penawaran: ' + proposal.clientName;
document.getElementById('proposal-id').value = proposal.id;
document.getElementById('prop-client-name').value = proposal.clientName || '';
document.getElementById('prop-category').value = proposal.category || 'sekolah';
document.getElementById('prop-pic-name').value = proposal.picName || '';
document.getElementById('prop-pic-phone').value = proposal.picPhone || '';
const elEmailEdit = document.getElementById('prop-client-email'); if (elEmailEdit) elEmailEdit.value = proposal.clientEmail || proposal.email || '';
const elUserEdit = document.getElementById('prop-user-id'); if (elUserEdit) elUserEdit.value = proposal.userId || '';
document.getElementById('prop-title').value = proposal.title || '';
document.getElementById('prop-subtitle').value = proposal.subtitle || '';
document.getElementById('prop-notes').value = proposal.notes || '';
document.getElementById('prop-demo-url').value = proposal.demoUrl || '';
document.getElementById('prop-features').value = Array.isArray(proposal.features) ? proposal.features.join('\n') : (proposal.features || '');
const total = Number(proposal.totalAmount) || Number(proposal.pkg2Price) || 1299000;
const dp = Number(proposal.dpAmount) || Math.round(total * 0.5);
document.getElementById('prop-total-amount').value = total;
document.getElementById('prop-dp-amount').value = dp;
document.getElementById('prop-pkg1-name').value = proposal.pkg1Name || 'Paket Starter';
document.getElementById('prop-pkg1-price').value = proposal.pkg1Price || 599000;
document.getElementById('prop-pkg2-name').value = proposal.pkg2Name || 'Paket Grower';
document.getElementById('prop-pkg2-price').value = proposal.pkg2Price || 1299000;
document.getElementById('prop-pkg3-name').value = proposal.pkg3Name || 'Paket Pioneer';
document.getElementById('prop-pkg3-price').value = proposal.pkg3Price || 2399000;
document.getElementById('prop-status').value = proposal.status || 'BELUM BAYAR';
document.getElementById('prop-valid-until').value = proposal.validUntil || '';
modal.style.display = 'flex';
}
function applyPreset(preset, changeCategorySelect = true) {
if (changeCategorySelect) {
const catSelect = document.getElementById('prop-category');
if (catSelect) catSelect.value = preset;
}
const pData = InvoiceService.PRESETS[preset] || InvoiceService.PRESETS.sekolah;
document.getElementById('prop-title').value = pData.title;
document.getElementById('prop-subtitle').value = pData.subtitle;
document.getElementById('prop-notes').value = pData.notes;
document.getElementById('prop-demo-url').value = pData.demoUrl;
document.getElementById('prop-features').value = pData.features.join('\n');
document.getElementById('prop-total-amount').value = pData.totalAmount;
document.getElementById('prop-dp-amount').value = pData.dpAmount;
if (preset === 'sekolah') {
document.getElementById('prop-pkg1-name').value = 'Paket Starter';
document.getElementById('prop-pkg1-price').value = 599000;
document.getElementById('prop-pkg2-name').value = 'Paket Grower';
document.getElementById('prop-pkg2-price').value = 1299000;
document.getElementById('prop-pkg3-name').value = 'Paket Pioneer';
document.getElementById('prop-pkg3-price').value = 2399000;
} else if (preset === 'perusahaan') {
document.getElementById('prop-pkg1-name').value = 'Corporate Starter';
document.getElementById('prop-pkg1-price').value = 799000;
document.getElementById('prop-pkg2-name').value = 'Business Pro';
document.getElementById('prop-pkg2-price').value = 1599000;
document.getElementById('prop-pkg3-name').value = 'Enterprise Cloud';
document.getElementById('prop-pkg3-price').value = 3299000;
} else if (preset === 'personal') {
document.getElementById('prop-pkg1-name').value = 'Personal Starter';
document.getElementById('prop-pkg1-price').value = 499000;
document.getElementById('prop-pkg2-name').value = 'Authority Pro';
document.getElementById('prop-pkg2-price').value = 999000;
document.getElementById('prop-pkg3-name').value = 'Executive Brand';
document.getElementById('prop-pkg3-price').value = 1899000;
} else if (preset === 'umkm') {
document.getElementById('prop-pkg1-name').value = 'Katalog Starter';
document.getElementById('prop-pkg1-price').value = 649000;
document.getElementById('prop-pkg2-name').value = 'Toko Bisnis WA';
document.getElementById('prop-pkg2-price').value = 1399000;
document.getElementById('prop-pkg3-name').value = 'E-Commerce Pro';
document.getElementById('prop-pkg3-price').value = 2599000;
}
}
async function handleFormSubmit() {
const saveBtn = document.getElementById('btn-save-proposal');
const origText = saveBtn.innerHTML;
saveBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
saveBtn.disabled = true;
const id = document.getElementById('proposal-id').value.trim() || InvoiceService.generateProposalId();
const totalAmount = parseInt(document.getElementById('prop-total-amount').value) || 0;
const dpAmount = parseInt(document.getElementById('prop-dp-amount').value) || Math.round(totalAmount * 0.5);
const rawFeatures = document.getElementById('prop-features').value;
const featuresList = rawFeatures
.split('\n')
.map(s => s.trim())
.filter(Boolean);
const clientEmail = (document.getElementById('prop-client-email')?.value || '').trim();
const userId = (document.getElementById('prop-user-id')?.value || '').trim();
const data = {
id,
invoiceNumber: InvoiceService.generateInvoiceNumber(id),
clientName: document.getElementById('prop-client-name').value.trim(),
clientEmail,
userId,
category: document.getElementById('prop-category').value,
picName: document.getElementById('prop-pic-name').value.trim(),
picPhone: document.getElementById('prop-pic-phone').value.trim(),
title: document.getElementById('prop-title').value.trim(),
subtitle: document.getElementById('prop-subtitle').value.trim(),
demoUrl: document.getElementById('prop-demo-url').value.trim(),
features: featuresList,
totalAmount,
dpAmount,
remainingAmount: totalAmount,
paidAmount: 0,
notes: document.getElementById('prop-notes').value.trim(),
pkg1Name: document.getElementById('prop-pkg1-name').value.trim(),
pkg1Price: parseInt(document.getElementById('prop-pkg1-price').value) || 0,
pkg2Name: document.getElementById('prop-pkg2-name').value.trim(),
pkg2Price: parseInt(document.getElementById('prop-pkg2-price').value) || 0,
pkg3Name: document.getElementById('prop-pkg3-name').value.trim(),
pkg3Price: parseInt(document.getElementById('prop-pkg3-price').value) || 0,
status: document.getElementById('prop-status').value,
validUntil: document.getElementById('prop-valid-until').value,
};
data.items = [
{ name: data.title, qty: 1, unit: 'Paket', price: totalAmount, subtotal: totalAmount },
{ name: 'Alokasi Domain & Server Cloud NVMe Performa Tinggi (1 Tahun)', qty: 1, unit: 'Tahun', price: 0, subtotal: 0 },
{ name: 'Sertifikat Keamanan SSL 256-Bit & Maintenance Pemeliharaan', qty: 1, unit: 'Lisensi', price: 0, subtotal: 0 }
];
try {
const res = await InvoiceService.saveProposal(data);
if (data.status === 'deal' || data.invoiceId) {
await InvoiceService.saveInvoice(data);
}
if (res.success) {
document.getElementById('proposal-modal').style.display = 'none';
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'success',
title: 'Penawaran & Faktur Tersimpan!',
html: `
<p class="mb-sm">Dokumen untuk <strong>${data.clientName}</strong> berhasil disimpan.</p>
<div class="swal-actions">
<a href="/invoice/?id=${encodeURIComponent(id)}" target="_blank" class="admin-btn mb-xs"><i class="ph ph-receipt"></i> Buka Faktur Online</a>
<a href="/proposal/?id=${encodeURIComponent(id)}" target="_blank" class="admin-btn btn-secondary"><i class="ph ph-file-text"></i> Buka Proposal Lengkap</a>
</div>
`,
showConfirmButton: false,
showCancelButton: true,
cancelButtonText: 'Tutup'
});
}
await loadProposals();
} else {
throw new Error(res.message);
}
} catch (err) {
console.error(err);
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'error',
title: 'Gagal Menyimpan',
text: err.message
});
} else {
alert('Gagal: ' + err.message);
}
} finally {
saveBtn.innerHTML = origText;
saveBtn.disabled = false;
}
}
async function loadProposals() {
const tbody = document.getElementById('proposals-table-body');
if (tbody) {
tbody.innerHTML = `
<tr>
<td colspan="5" class="table-state-cell"><i class="ph ph-spinner ph-spin"></i><span>Memuat daftar faktur & proposal...</span></td>
</tr>
`;
}
try {
let proposals = [];
try {
const cachedP = localStorage.getItem('sisitus_proposals');
if (cachedP) proposals = JSON.parse(cachedP);
} catch (e) {}
try {
const resInv = await InvoiceService.getAllInvoices();
const invList = resInv.data || [];
invList.forEach(inv => {
const pId = inv.proposalId || inv.id;
const idx = proposals.findIndex(p => p.id === pId);
if (idx >= 0) {
proposals[idx] = { ...proposals[idx], ...inv, id: pId, invoiceId: inv.id };
} else {
proposals.push({ ...inv, id: pId, invoiceId: inv.id });
}
});
} catch (e) {}
if (proposals.length === 0) {
const presets = [
{ ...InvoiceService.PRESETS.sekolah, id: 'PROP-SEKOLAH-DEMO', invoiceNumber: 'INV-SIS-202611-001' },
{ ...InvoiceService.PRESETS.perusahaan, id: 'PROP-CORP-DEMO', invoiceNumber: 'INV-SIS-202611-002' },
{ ...InvoiceService.PRESETS.personal, id: 'PROP-PERSONAL-DEMO', invoiceNumber: 'INV-SIS-202611-003', status: 'deal' }
];
for (const p of presets) {
await InvoiceService.saveProposal(p);
}
proposals = presets;
}
currentProposals = proposals;
updateStats(proposals);
renderTable();
} catch (error) {
console.error('Error loading proposals:', error);
if (tbody) {
tbody.innerHTML = `
<tr>
<td colspan="5" class="table-state-cell table-state-cell--error">
Gagal memuat dokumen: ${error.message}
</td>
</tr>
`;
}
}
}
function updateStats(proposals) {
const total = proposals.length;
const active = proposals.filter(p => p.status === 'aktif' || p.status === 'BELUM BAYAR').length;
const deal = proposals.filter(p => p.status === 'deal' || p.status === 'LUNAS' || p.status === 'DP').length;
let totalValue = 0;
proposals.forEach(p => {
totalValue += (Number(p.totalAmount) || Number(p.pkg2Price) || 1299000);
});
const totalEl = document.getElementById('stat-total-proposals');
const activeEl = document.getElementById('stat-active-proposals');
const dealEl = document.getElementById('stat-deal-proposals');
const valEl = document.getElementById('stat-potential-value');
if (totalEl) totalEl.textContent = total;
if (activeEl) activeEl.textContent = active;
if (dealEl) dealEl.textContent = deal;
if (valEl) valEl.textContent = InvoiceService.formatRupiah(totalValue);
}
function renderTable() {
const tbody = document.getElementById('proposals-table-body');
if (!tbody) return;
const searchQuery = (document.getElementById('search-proposals')?.value || '').toLowerCase().trim();
const catFilter = document.getElementById('filter-proposal-category')?.value || 'all';
const statusFilter = document.getElementById('filter-proposal-status')?.value || 'all';
let filtered = currentProposals.filter(p => {
const matchesSearch = !searchQuery ||
(p.clientName || '').toLowerCase().includes(searchQuery) ||
(p.title || '').toLowerCase().includes(searchQuery) ||
(p.picName || '').toLowerCase().includes(searchQuery) ||
(p.demoUrl || '').toLowerCase().includes(searchQuery) ||
(p.id || '').toLowerCase().includes(searchQuery);
const matchesCat = catFilter === 'all' || p.category === catFilter;
const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
return matchesSearch && matchesCat && matchesStatus;
});
if (filtered.length === 0) {
tbody.innerHTML = `
<tr>
<td colspan="5" class="table-state-cell">Tidak ada faktur / proposal yang sesuai filter.</td>
</tr>
`;
return;
}
tbody.innerHTML = filtered.map(p => {
let catIcon = 'ph-buildings';
let catLabel = 'Sekolah / Edukasi';
let catClass = 'proposal-cat-pill--sekolah';
if (p.category === 'perusahaan') {
catIcon = 'ph-briefcase';
catLabel = 'Perusahaan';
catClass = 'proposal-cat-pill--perusahaan';
} else if (p.category === 'personal') {
catIcon = 'ph-user';
catLabel = 'Personal Brand';
catClass = 'proposal-cat-pill--personal';
} else if (p.category === 'umkm') {
catIcon = 'ph-storefront';
catLabel = 'UMKM / Toko';
catClass = 'proposal-cat-pill--umkm';
}
let statusLabel = 'Belum Bayar';
let statusBadgeClass = 'status-cell-badge--unpaid';
const st = (p.status || '').toUpperCase();
if (st === 'LUNAS' || st === 'DEAL' || st === 'FP') {
statusLabel = 'Lunas Penuh (Deal)';
statusBadgeClass = 'status-cell-badge--paid';
} else if (st === 'DP') {
statusLabel = 'DP Diterima (50%)';
statusBadgeClass = 'status-cell-badge--dp';
} else if (st === 'DRAFT') {
statusLabel = 'Draft';
statusBadgeClass = 'status-cell-badge--expired';
}
const createdDate = p.createdAt ? InvoiceService.formatDate(p.createdAt) : '-';
const totalAmount = Number(p.totalAmount) || Number(p.pkg2Price) || 0;
const dpAmount = Number(p.dpAmount) || Math.round(totalAmount * 0.5);
return `
<tr>
<td>
<div class="client-cell">
<div class="client-title">${escapeHtml(p.clientName)}</div>
<div class="client-sub">
<span><i class="ph ph-user"></i> ${escapeHtml(p.picName || 'PIC')}</span>
${p.picPhone ? `• <span class="text-success"><i class="ph ph-whatsapp-logo"></i> ${escapeHtml(p.picPhone)}</span>` : ''}
</div>
<div class="client-code">No: ${p.invoiceNumber || p.id}</div>
</div>
</td>
<td>
<div>
<div class="proposal-cat-pill ${catClass}">
<i class="ph ${catIcon}"></i> ${catLabel}
</div>
<div class="proposal-title">${escapeHtml(p.title)}</div>
${p.demoUrl ? `
<a href="${escapeHtml(p.demoUrl)}" target="_blank" rel="noopener noreferrer" class="proposal-demo-link">
<i class="ph ph-globe"></i> <span>Live Demo: ${escapeHtml(p.demoUrl)}</span>
</a>
` : ''}
</div>
</td>
<td>
<div class="pkg-cell-price">
${InvoiceService.formatRupiah(totalAmount)}
</div>
<div class="pkg-cell-sub">
Min. DP: ${InvoiceService.formatRupiah(dpAmount)}
</div>
</td>
<td>
<div class="status-cell-badge ${statusBadgeClass}">
${statusLabel}
</div>
<div class="status-cell-date">Dibuat: ${createdDate}</div>
</td>
<td class="text-right nowrap">
<div class="btn-group btn-group--right">
<button type="button" class="admin-btn-action" title="Lihat Faktur & Invoice Online" data-action="view-invoice" data-id="${p.id}">
<i class="ph ph-file-text"></i>
</button>
<button type="button" class="admin-btn-action" title="Lihat Proposal Lengkap" data-action="view-proposal" data-id="${p.id}">
<i class="ph ph-article"></i>
</button>
<button type="button" class="admin-btn-action" title="Salin Link Faktur" data-action="copy-invoice" data-id="${p.id}">
<i class="ph ph-link"></i>
</button>
<button type="button" class="admin-btn-action" title="Edit Penawaran" data-action="edit-proposal" data-id="${p.id}">
<i class="ph ph-pencil"></i>
</button>
<button type="button" class="admin-btn-action" title="Duplikat Dokumen" data-action="duplicate-proposal" data-id="${p.id}">
<i class="ph ph-copy"></i>
</button>
<button type="button" class="admin-btn-action admin-btn-action--danger" title="Hapus Dokumen" data-action="delete-proposal" data-id="${p.id}" data-name="${escapeQuotes(p.clientName)}">
<i class="ph ph-trash"></i>
</button>
</div>
</td>
</tr>
`;
}).join('');
}
function escapeHtml(str) {
if (!str) return '';
return String(str)
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;')
.replace(/'/g, '&#039;');
}
function escapeQuotes(str) {
if (!str) return '';
return String(str).replace(/'/g, "\\'");
}
