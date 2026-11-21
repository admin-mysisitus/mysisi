import APIClient from '/assets/js/modules/unified-api.js';
import { AuthManager } from '/assets/js/modules/unified-auth.js';
import { renderUserAvatarHtml } from '/assets/js/modules/unified-utils.js';
let currentUsers = [];
export async function render() {
setupEventListeners();
await loadUsers();
}
function setupEventListeners() {
const tbody = document.getElementById('users-table-body');
if (tbody) {
tbody.addEventListener('click', (e) => {
const btnEdit = e.target.closest('[data-action="edit-user"]');
if (btnEdit) {
window.editUser(btnEdit.dataset.uid);
return;
}
const btnDel = e.target.closest('[data-action="delete-user"]');
if (btnDel) {
window.deleteUser(btnDel.dataset.uid);
return;
}
});
}
const btnClose = document.getElementById('btn-close-user');
const modal = document.getElementById('user-modal');
const form = document.getElementById('user-form');
if (btnClose) {
btnClose.addEventListener('click', () => {
modal.style.display = 'none';
});
}
if (form) {
form.addEventListener('submit', async (e) => {
e.preventDefault();
const submitBtn = document.getElementById('btn-save-user');
const originalText = submitBtn.innerHTML;
submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
submitBtn.disabled = true;
const nameField = document.getElementById('usr-name').value.trim();
const userData = {
id: document.getElementById('usr-id').value.trim(),
uid: document.getElementById('usr-id').value.trim(),
name: nameField,
displayName: nameField,
email: document.getElementById('usr-email').value.trim(),
whatsapp: document.getElementById('usr-wa').value.trim(),
role: document.getElementById('usr-role').value,
status: document.getElementById('usr-active').checked ? 'active' : 'suspended',
verified: document.getElementById('usr-verified').checked
};
try {
const adminId = AuthManager.getUserId();
const res = await APIClient.saveAdminUser(adminId, userData);
if (res.success) {
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'success',
title: 'Berhasil',
text: 'User berhasil disimpan!'
});
}
modal.style.display = 'none';
await loadUsers();
} else {
throw new Error(res.message);
}
} catch (error) {
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
window.editUser = (id) => {
const user = currentUsers.find(u => u.id === id);
if (!user) return;
document.getElementById('user-modal-title').textContent = 'Edit User';
document.getElementById('usr-id').value = user.id || user.uid || '';
document.getElementById('usr-name').value = user.displayName || user.name || 'Pelanggan';
document.getElementById('usr-email').value = user.email || '';
document.getElementById('usr-wa').value = user.whatsapp || user.wa || '';
document.getElementById('usr-role').value = user.role || 'customer';
const currentStatus = user.status || 'active';
document.getElementById('usr-active').checked = currentStatus === 'active';
document.getElementById('usr-verified').checked = user.verified !== false;
document.getElementById('user-modal').style.display = 'flex';
};
window.deleteUser = async (id) => {
if (typeof Swal !== 'undefined') {
const result = await Swal.fire({
title: 'Suspend User?',
text: `User dengan ID ${id} akan di-suspend.`,
icon: 'warning',
showCancelButton: true,
confirmButtonColor: '#ef4444',
cancelButtonColor: '#4b5563',
confirmButtonText: 'Ya, Suspend'
});
if (result.isConfirmed) {
try {
const res = await APIClient.deleteAdminUser(AuthManager.getUserId(), id);
if (res.success) {
Swal.fire('Berhasil!', 'User telah di-suspend.', 'success');
await loadUsers();
} else {
throw new Error(res.message);
}
} catch (err) {
Swal.fire('Error', err.message, 'error');
}
}
}
};
const searchInput = document.getElementById('search-users');
const filterSelect = document.getElementById('filter-user-status');
if (searchInput) searchInput.addEventListener('input', applyFilters);
if (filterSelect) filterSelect.addEventListener('change', applyFilters);
}
function applyFilters() {
const tbody = document.getElementById('users-table-body');
if (!tbody) return;
const searchVal = (document.getElementById('search-users')?.value || '').toLowerCase();
const filterVal = document.getElementById('filter-user-status')?.value || 'all';
let filteredUsers = currentUsers;
if (searchVal) {
filteredUsers = filteredUsers.filter(u => (u.name && u.name.toLowerCase().includes(searchVal)) || (u.email && u.email.toLowerCase().includes(searchVal)));
}
if (filterVal !== 'all') {
filteredUsers = filteredUsers.filter(u => {
const status = (u.status || 'active').toLowerCase();
return status === filterVal;
});
}
renderTable(filteredUsers, tbody);
}
async function loadUsers() {
const tbody = document.getElementById('users-table-body');
if (!tbody) return;
tbody.innerHTML = '<tr><td colspan="5" class="table-state-cell"><i class="ph ph-spinner ph-spin"></i><span>Memuat data user...</span></td></tr>';
try {
const adminId = AuthManager.getUserId();
const response = await APIClient.getAllUsers(adminId);
if (response.success && response.data) {
if (response.data.length === 0) {
tbody.innerHTML = '<tr><td colspan="5" class="table-state-cell">Belum ada user.</td></tr>';
} else {
currentUsers = response.data;
applyFilters();
}
} else {
throw new Error(response.message || 'Gagal memuat user');
}
} catch (error) {
tbody.innerHTML = `<tr class="table-state-cell--error"><td colspan="5" class="table-state-cell table-state-cell--error">Error: ${error.message}</td></tr>`;
}
}
function renderTable(users, tbody) {
tbody.innerHTML = '';
const countLabel = document.getElementById('users-count');
if (countLabel) {
countLabel.textContent = `Menampilkan ${users.length} user`;
}
if (users.length === 0) {
tbody.innerHTML = '<tr><td colspan="5" class="table-state-cell">Tidak ada user yang sesuai.</td></tr>';
return;
}
users.forEach(user => {
const name = user.name || user.displayName || 'Unknown';
const email = user.email || '-';
const role = user.role || 'customer';
const status = user.status || 'active';
const joinedDate = user.joined || user.createdAt || new Date().toISOString();
const uid = user.id || user.uid || user.userId || '';
const statusClass = status === 'active' ? 'status-pill--success' : 'status-pill--danger';
const roleColor = role === 'admin' ? 'var(--primary-blue)' : (role === 'support' ? 'var(--warning-orange)' : 'var(--text-muted)');
const isSuspended = status !== 'active';
const tr = document.createElement('tr');
if (isSuspended) tr.className = 'tr--failed';
tr.innerHTML = `
<td>
<div class="table-user-cell">
${renderUserAvatarHtml(user, 'w100', 'admin-avatar')}
<div class="table-user-info">
<p class="table-user-name">${name}</p>
<p class="table-user-sub">${email}</p>
</div>
</div>
</td>
<td class="nowrap">
<span class="user-role-badge user-role-badge--${role}">${role}</span>
</td>
<td class="nowrap">
<span class="status-pill ${statusClass}">
${status}
</span>
</td>
<td class="nowrap text-muted text-sm">
${new Date(joinedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
</td>
<td class="text-right nowrap">
<div class="table-actions">
<button type="button" class="btn-action btn-action--edit" data-action="edit-user" data-uid="${uid}" title="Edit">
<i class="ph ph-pencil-simple"></i>
</button>
<button type="button" class="btn-action btn-action--delete" data-action="delete-user" data-uid="${uid}" title="Suspend">
<i class="ph ph-prohibit"></i>
</button>
</div>
</td>
`;
tbody.appendChild(tr);
});
}