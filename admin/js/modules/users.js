import APIClient from '/assets/js/modules/unified-api.js';
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
let currentUsers = [];
export async function render() {
  void('Admin Users Module Loaded');
  setupEventListeners();
  await loadUsers();
}

function setupEventListeners() {
  const btnAdd = document.getElementById('btn-add-user');
  const btnClose = document.getElementById('btn-close-user');
  const modal = document.getElementById('user-modal');
  const form = document.getElementById('user-form');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      form.reset();
      document.getElementById('usr-id').value = '';
      document.getElementById('user-modal-title').textContent = 'Tambah User Baru';
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
      const submitBtn = document.getElementById('btn-save-user');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
      submitBtn.disabled = true;
      const userData = {
        id: document.getElementById('usr-id').value.trim(),
        name: document.getElementById('usr-name').value.trim(),
        email: document.getElementById('usr-email').value.trim(),
        whatsapp: document.getElementById('usr-wa').value.trim(),
        role: document.getElementById('usr-role').value,
        password: document.getElementById('usr-password').value, // can be empty
        active: document.getElementById('usr-active').checked,
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
        void(error);
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
    document.getElementById('usr-id').value = user.id;
    document.getElementById('usr-name').value = user.name;
    document.getElementById('usr-email').value = user.email;
    document.getElementById('usr-wa').value = user.whatsapp || user.wa || ''; // depending on API response
    document.getElementById('usr-role').value = user.role || 'customer';
    document.getElementById('usr-password').value = '';
    document.getElementById('usr-active').checked = user.status === 'active';
    // Ideally we should have verified status from API, assume true for existing if not provided
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
  // Show loading state in table
  tbody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 16px; display: block;"></i>
        Memuat data user...
      </td>
    </tr>
  `;
  try {
    const adminId = AuthManager.getUserId();
    const response = await APIClient.getAllUsers(adminId);
    if (response.success && response.data) {
      if (response.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Belum ada user.</td></tr>';
      } else {
        currentUsers = response.data;
        applyFilters();
      }
    } else {
      throw new Error(response.message || 'Gagal memuat user');
    }
  } catch (error) {
    void('Failed to load users:', error);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--admin-danger);">Error: ${error.message}</td></tr>`;
  }
}

function renderTable(users, tbody) {
  tbody.innerHTML = '';
  const countLabel = document.getElementById('users-count');
  if (countLabel) {
    countLabel.textContent = `Menampilkan ${users.length} user`;
  }
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Tidak ada user yang sesuai.</td></tr>';
    return;
  }
  users.forEach(user => {
    const name = user.name || user.displayName || 'Unknown';
    const email = user.email || '-';
    const role = user.role || 'customer';
    const status = user.status || 'active';
    const joinedDate = user.joined || user.createdAt || new Date().toISOString();
    const uid = user.id || user.uid || user.userId || '';
    const statusColor = status === 'active' ? 'var(--admin-success)' : 'var(--admin-danger)';
    const statusBg = status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    const roleColor = role === 'admin' ? 'var(--admin-primary)' : (role === 'support' ? 'var(--admin-warning)' : 'var(--admin-text-muted)');
    const rowOpacity = status === 'active' ? '1' : '0.6';
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--admin-border)';
    tr.style.opacity = rowOpacity;
    tr.innerHTML = `
      <td style="padding: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--admin-surface-hover); display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--admin-primary);">
            ${name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style="margin: 0; font-weight: 600;">${name}</p>
            <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--admin-text-muted);">${email}</p>
          </div>
        </div>
      </td>
      <td style="padding: 16px;">
        <span style="color: ${roleColor}; text-transform: capitalize; font-weight: 500;">
          ${role}
        </span>
      </td>
      <td style="padding: 16px;">
        <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; text-transform: capitalize;">
          ${status}
        </span>
      </td>
      <td style="padding: 16px; color: var(--admin-text-muted);">
        ${new Date(joinedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td style="padding: 16px; text-align: right;">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="admin-btn" onclick="window.editUser('${uid}')" style="background: rgba(59, 130, 246, 0.1); color: var(--admin-info); padding: 8px; border-radius: 6px;" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="admin-btn" onclick="window.deleteUser('${uid}')" style="background: rgba(239, 68, 68, 0.1); color: var(--admin-danger); padding: 8px; border-radius: 6px;" title="Suspend">
            <i class="fas fa-ban"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}