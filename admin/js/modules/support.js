import APIClient from '/assets/js/modules/unified-api.js';
import {
AuthManager
} from '/assets/js/modules/unified-auth.js';
let currentTickets = [];
export async function render() {
console.error('Admin Support Tickets Module Loaded');
setupEventListeners();
await loadTickets();
}
function setupEventListeners() {
const listContainer = document.getElementById('ticket-list');
if (listContainer) {
listContainer.addEventListener('click', (e) => {
const btnEdit = e.target.closest('[data-action="edit-ticket"]');
if (btnEdit) {
window.editTicket(btnEdit.dataset.id);
return;
}
const btnDel = e.target.closest('[data-action="delete-ticket"]');
if (btnDel) {
window.deleteTicket(btnDel.dataset.id);
return;
}
});
}
const btnAdd = document.getElementById('btn-add-ticket');
const btnClose = document.getElementById('btn-close-ticket');
const modal = document.getElementById('ticket-modal');
const form = document.getElementById('ticket-form');
if (btnAdd) {
btnAdd.addEventListener('click', () => {
form.reset();
document.getElementById('tck-id').value = '';
document.getElementById('ticket-modal-title').textContent = 'Buat Tiket Baru';
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
const submitBtn = document.getElementById('btn-save-ticket');
const originalText = submitBtn.innerHTML;
submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
submitBtn.disabled = true;
const tckData = {
id: document.getElementById('tck-id').value.trim(),
subject: document.getElementById('tck-subject').value.trim(),
user: document.getElementById('tck-user').value.trim(),
priority: document.getElementById('tck-priority').value,
status: document.getElementById('tck-status').value
};
try {
const adminId = AuthManager.getUserId();
const res = await APIClient.saveAdminTicket(adminId, tckData);
if (res.success) {
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'success',
title: 'Berhasil',
text: 'Tiket berhasil disimpan!'
});
}
modal.style.display = 'none';
await loadTickets();
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
window.editTicket = (id, event) => {
if (event) event.stopPropagation();
const t = currentTickets.find(x => x.id === id);
if (!t) return;
document.getElementById('ticket-modal-title').textContent = 'Edit Tiket';
document.getElementById('tck-id').value = t.id;
document.getElementById('tck-subject').value = t.subject;
document.getElementById('tck-user').value = t.user;
document.getElementById('tck-priority').value = t.priority || 'medium';
document.getElementById('tck-status').value = t.status || 'open';
document.getElementById('ticket-modal').style.display = 'flex';
};
window.deleteTicket = async (id, event) => {
if (event) event.stopPropagation();
if (typeof Swal !== 'undefined') {
const result = await Swal.fire({
title: 'Tutup Tiket?',
text: `Tiket ${id} akan ditutup.`,
icon: 'warning',
showCancelButton: true,
confirmButtonColor: '#ef4444',
cancelButtonColor: '#4b5563',
confirmButtonText: 'Ya, Tutup'
});
if (result.isConfirmed) {
try {
const res = await APIClient.deleteAdminTicket(AuthManager.getUserId(), id);
if (res.success) {
Swal.fire('Berhasil!', 'Tiket telah ditutup.', 'success');
await loadTickets();
} else {
throw new Error(res.message);
}
} catch (err) {
Swal.fire('Error', err.message, 'error');
}
}
}
};
}
async function loadTickets() {
const listContainer = document.getElementById('ticket-list');
if (!listContainer) return;
listContainer.innerHTML = '<div class="p-md"><div class="admin-skeleton skeleton-card mb-sm"></div><div class="admin-skeleton skeleton-card mb-sm"></div></div>';
try {
const adminId = AuthManager.getUserId();
const response = await APIClient.getAdminTickets(adminId);
if (response.success) {
const tickets = response.data || [];
if (tickets.length === 0) {
listContainer.innerHTML = '<div class="grid-state-message">Belum ada tiket support.</div>';
} else {
renderTickets(tickets, listContainer);
}
} else {
throw new Error(response.message);
}
} catch (error) {
console.error('Failed to load tickets:', error);
listContainer.innerHTML = `<div class="grid-state-message table-state-cell--error">${error.message}</div>`;
}
}
function renderTickets(tickets, listContainer) {
listContainer.innerHTML = '';
currentTickets = tickets;
tickets.forEach((t, index) => {
let isActive = index === 0;
let statusClass = (t.status === 'Open' || t.status === 'open') ? 'status-pill--warning' : ((t.status === 'Closed' || t.status === 'closed') ? 'status-pill--danger' : 'status-pill--success');
let priorityBadge = (t.priority === 'High' || t.priority === 'high') ? '<i class="ph ph-fire text-danger mr-xs"></i>' : '';
const div = document.createElement('div');
div.className = isActive ? 'ticket-item active' : 'ticket-item';
div.innerHTML = `
<div class="ticket-header-row">
<h4 class="ticket-subject">
${priorityBadge}${t.subject}
</h4>
<span class="ticket-date">${new Date(t.time || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
</div>
<div class="ticket-meta-row">
<span class="ticket-user"><i class="ph ph-user"></i> ${t.user}</span>
<span class="status-pill ${statusClass}">${t.status}</span>
</div>
<div class="table-actions">
<button type="button" class="btn-action btn-action--edit" data-action="edit-ticket" data-id="${t.id}" title="Edit">
<i class="ph ph-pencil-simple"></i>
</button>
<button type="button" class="btn-action btn-action--delete" data-action="delete-ticket" data-id="${t.id}" title="Tutup">
<i class="ph ph-x"></i>
</button>
</div>
`;
listContainer.appendChild(div);
});
}