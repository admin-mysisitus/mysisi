import InvoiceService from '/assets/js/modules/unified-invoice.js';
import APIClient from '/assets/js/modules/unified-api.js';
import {
AuthManager
} from '/assets/js/modules/unified-auth.js';
let currentTx = [];
export async function render() {
console.error('Admin Transactions Module Loaded');
setupEventListeners();
await loadTransactions();
}
function setupEventListeners() {
const tbody = document.getElementById('tx-table-body');
if (tbody) {
tbody.addEventListener('click', (e) => {
const btnOpen = e.target.closest('[data-action="open-tx"]');
if (btnOpen) {
openTxInvoice(btnOpen.dataset.inv);
return;
}
const btnCopy = e.target.closest('[data-action="copy-tx"]');
if (btnCopy) {
copyTxInvoiceLink(btnCopy.dataset.inv);
return;
}
const btnEdit = e.target.closest('[data-action="edit-tx"]');
if (btnEdit) {
editTx(btnEdit.dataset.inv);
return;
}
const btnDel = e.target.closest('[data-action="delete-tx"]');
if (btnDel) {
deleteTx(btnDel.dataset.inv);
return;
}
});
}
window.openTxInvoice = (inv) => {
const tx = currentTx.find(t => (t.inv || t.orderId) === inv);
if (tx) InvoiceService.syncOrderToPublicInvoice(tx);
window.open(`/invoice/?id=${encodeURIComponent(inv)}`, '_blank');
};
window.copyTxInvoiceLink = (inv) => {
const tx = currentTx.find(t => (t.inv || t.orderId) === inv);
if (tx) InvoiceService.syncOrderToPublicInvoice(tx);
const url = `${window.location.origin}/invoice/?id=${encodeURIComponent(inv)}`;
navigator.clipboard.writeText(url).then(() => {
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'success',
title: 'Link Faktur Tersalin!',
text: `Link invoice siap dibagikan:\n${url}`,
timer: 2500,
showConfirmButton: false
});
} else {
alert('Link tersalin: ' + url);
}
});
};
const btnAdd = document.getElementById('btn-add-tx');
const btnClose = document.getElementById('btn-close-tx');
const modal = document.getElementById('tx-modal');
const form = document.getElementById('tx-form');
if (btnAdd) {
btnAdd.addEventListener('click', () => {
form.reset();
document.getElementById('tx-inv').value = '';
document.getElementById('tx-modal-title').textContent = 'Buat Invoice Manual';
modal.style.display = 'flex';
});
}
if (btnClose) {
btnClose.addEventListener('click', () => {
modal.style.display = 'none';
});
}
if (form) {
form.addEventListener('submit', async (e) => {
e.preventDefault();
const submitBtn = document.getElementById('btn-save-tx');
const originalText = submitBtn.innerHTML;
submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
submitBtn.disabled = true;
const txData = {
inv: document.getElementById('tx-inv').value.trim(),
name: document.getElementById('tx-name').value.trim(),
email: document.getElementById('tx-email').value.trim(),
item: document.getElementById('tx-item').value.trim(),
domain: document.getElementById('tx-domain').value.trim(),
total: parseInt(document.getElementById('tx-total').value),
status: document.getElementById('tx-status').value
};
try {
const adminId = AuthManager.getUserId();
const res = await APIClient.saveAdminTransaction(adminId, txData);
if (res.success) {
await InvoiceService.syncOrderToPublicInvoice(txData);
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'success',
title: 'Berhasil',
text: 'Transaksi berhasil disimpan!'
});
}
modal.style.display = 'none';
await loadTransactions();
} else {
throw new Error(res.message);
}
} catch (error) {
console.error(error);
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'error',
title: 'Gagal',
text: error.message
});
}
} finally {
submitBtn.innerHTML = originalText;
submitBtn.disabled = false;
}
});
}
window.editTx = (inv) => {
const tx = currentTx.find(t => t.inv === inv || t.orderId === inv);
if (!tx) return;
document.getElementById('tx-modal-title').textContent = 'Edit Invoice';
document.getElementById('tx-inv').value = tx.inv;
document.getElementById('tx-name').value = tx.name;
document.getElementById('tx-email').value = tx.email;
document.getElementById('tx-item').value = tx.item;
document.getElementById('tx-domain').value = tx.domain || '';
document.getElementById('tx-total').value = tx.total;
document.getElementById('tx-status').value = tx.status || 'unpaid';
document.getElementById('tx-modal').style.display = 'flex';
};
window.deleteTx = async (inv) => {
if (typeof Swal !== 'undefined') {
const result = await Swal.fire({
title: 'Batalkan Transaksi?',
text: `Transaksi ${inv} akan dibatalkan/digagalkan.`,
icon: 'warning',
showCancelButton: true,
confirmButtonColor: '#ef4444',
cancelButtonColor: '#4b5563',
confirmButtonText: 'Ya, Batalkan'
});
if (result.isConfirmed) {
try {
const res = await APIClient.deleteAdminTransaction(AuthManager.getUserId(), inv);
if (res.success) {
Swal.fire('Berhasil!', 'Transaksi telah dibatalkan.', 'success');
await loadTransactions();
} else {
throw new Error(res.message);
}
} catch (err) {
Swal.fire('Error', err.message, 'error');
}
}
}
};
const searchInput = document.getElementById('search-tx');
const filterSelect = document.getElementById('filter-status');
if (searchInput) searchInput.addEventListener('input', applyFilters);
if (filterSelect) filterSelect.addEventListener('change', applyFilters);
}
function applyFilters() {
const tbody = document.getElementById('tx-table-body');
if (!tbody) return;
const searchVal = (document.getElementById('search-tx')?.value || '').toLowerCase();
const filterVal = document.getElementById('filter-status')?.value || 'all';
let filteredTx = currentTx;
if (searchVal) {
filteredTx = filteredTx.filter(tx => {
const txInv = (tx.inv || tx.orderId || '').toLowerCase();
return txInv.includes(searchVal) || (tx.email && tx.email.toLowerCase().includes(searchVal)) || (tx.name && tx.name.toLowerCase().includes(searchVal));
});
}
if (filterVal !== 'all') {
filteredTx = filteredTx.filter(tx => {
const status = (tx.status || tx.paymentStatus || 'unpaid').toLowerCase();
if (filterVal === 'paid') return status === 'paid' || status === 'settlement' || status === 'capture' || status === 'selesai' || status === 'success';
if (filterVal === 'unpaid') return status === 'unpaid' || status === 'pending' || status === 'tertunda';
if (filterVal === 'failed') return status === 'failed' || status === 'expire' || status === 'cancel' || status === 'deny';
return true;
});
}
updateStats(currentTx);
renderTxTable(filteredTx, tbody);
}
function updateStats(allTx) {
let revenue = 0;
let pendingAmount = 0;
let successCount = 0;
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();
allTx.forEach(tx => {
const status = (tx.status || tx.paymentStatus || 'unpaid').toLowerCase();
const total = parseInt(tx.total || 0);
const date = new Date(tx.date || tx.createdAt || new Date());
if (status === 'paid' || status === 'settlement' || status === 'capture' || status === 'selesai' || status === 'success') {
revenue += total;
if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
successCount++;
}
} else if (status === 'unpaid' || status === 'pending' || status === 'tertunda') {
pendingAmount += total;
}
});
const statRevenue = document.getElementById('stat-revenue');
const statPending = document.getElementById('stat-pending');
const statSuccess = document.getElementById('stat-success');
if (statRevenue) statRevenue.textContent = `Rp ${revenue.toLocaleString('id-ID')}`;
if (statPending) statPending.textContent = `Rp ${pendingAmount.toLocaleString('id-ID')}`;
if (statSuccess) statSuccess.textContent = successCount;
}
async function loadTransactions() {
const tbody = document.getElementById('tx-table-body');
if (!tbody) return;
tbody.innerHTML = '<tr><td colspan="6" class="table-state-cell"><i class="ph ph-spinner ph-spin"></i><span>Memuat data transaksi...</span></td></tr>';
try {
const adminId = AuthManager.getUserId();
const response = await APIClient.getAllTransactions(adminId);
if (response.success && response.data) {
if (response.data.length === 0) {
tbody.innerHTML = '<tr><td colspan="6" class="table-state-cell">Belum ada transaksi.</td></tr>';
updateStats([]);
} else {
currentTx = response.data;
InvoiceService.syncOrdersToInvoices(currentTx);
applyFilters();
}
} else {
throw new Error(response.message || 'Gagal memuat transaksi');
}
} catch (error) {
console.error('Failed to load transactions:', error);
tbody.innerHTML = `<tr class="table-state-cell--error"><td colspan="6" class="table-state-cell table-state-cell--error">Error: ${error.message}</td></tr>`;
}
}
function renderTxTable(mockTx, tbody) {
tbody.innerHTML = '';
if (mockTx.length === 0) {
tbody.innerHTML = '<tr><td colspan="6" class="table-state-cell">Tidak ada transaksi yang sesuai.</td></tr>';
return;
}
mockTx.forEach(tx => {
const inv = tx.inv || tx.orderId || '-';
const date = tx.date || tx.createdAt || new Date().toISOString();
const name = tx.name || '-';
const email = tx.email || '-';
const item = tx.item || tx.domain || tx.packageId || '-';
const total = tx.total || 0;
const status = (tx.status || tx.paymentStatus || 'unpaid').toLowerCase();
let statusClass = 'status-pill--danger';
let statusText = status.toUpperCase();
if (status === 'paid' || status === 'settlement' || status === 'capture' || status === 'selesai' || status === 'success') {
statusClass = 'status-pill--success';
statusText = 'PAID';
} else if (status === 'pending' || status === 'unpaid' || status === 'tertunda') {
statusClass = 'status-pill--warning';
statusText = 'UNPAID';
}
const isFailed = (status === 'failed' || status === 'expire' || status === 'cancel' || status === 'deny');
const tr = document.createElement('tr');
if (isFailed) tr.className = 'tr--failed';
tr.innerHTML = `
<td class="nowrap">
<p class="table-user-name text-primary">${escapeHtml(inv)}</p>
<p class="table-user-sub">${new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
</td>
<td>
<div class="table-user-info">
<p class="table-user-name">${escapeHtml(name)}</p>
<p class="table-user-sub">${escapeHtml(email)}</p>
</div>
</td>
<td class="text-muted text-sm">
${escapeHtml(item)}
</td>
<td class="nowrap font-bold text-sm">
Rp ${parseInt(total || 0).toLocaleString('id-ID')}
</td>
<td class="nowrap">
<span class="status-pill ${statusClass}">
${escapeHtml(statusText)}
</span>
</td>
<td class="text-right nowrap">
<div class="table-actions">
<button type="button" class="btn-action btn-action--edit" data-action="open-tx" data-inv="${escapeHtml(inv)}" title="Buka Faktur Online">
<i class="ph ph-receipt"></i>
</button>
<button type="button" class="btn-action btn-action--view" data-action="copy-tx" data-inv="${escapeHtml(inv)}" title="Salin Link Faktur">
<i class="ph ph-link"></i>
</button>
<button type="button" class="btn-action btn-action--edit" data-action="edit-tx" data-inv="${escapeHtml(inv)}" title="Edit">
<i class="ph ph-pencil-simple"></i>
</button>
<button type="button" class="btn-action btn-action--delete" data-action="delete-tx" data-inv="${escapeHtml(inv)}" title="Batalkan">
<i class="ph ph-prohibit"></i>
</button>
</div>
</td>
`;
tbody.appendChild(tr);
});
}
function escapeHtml(str) {
if (!str) return '';
return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}