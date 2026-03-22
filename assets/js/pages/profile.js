/**
 * Profile Page - User account management
 */

import { GAS_CONFIG } from '../config/api.config.js';

let currentUserProfile = null;
let userStats = null;

// ============================================================================
// INITIALIZE
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!userAuth || !userAuth.isLoggedIn) {
    window.location.href = '/verify-email.html';
    return;
  }

  // Load user profile
  await loadUserProfile();

  // Setup event listeners
  setupEventListeners();

  // Load initial tab data
  await loadOrdersData();
  await loadStatsData();
});

// ============================================================================
// LOAD USER PROFILE
// ============================================================================

async function loadUserProfile() {
  try {
    const params = new URLSearchParams({
      action: 'getUserProfile',
      userId: userAuth.userId
    });

    const result = await fetch(`\$\{GAS_CONFIG.URL\}?${params}`).then(r => r.json());

    if (result.success && result.profile) {
      currentUserProfile = result.profile;
      displayUserProfile();
    } else {
      Notifications.showToast('Gagal memuat profil', 'error');
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    Notifications.showToast('Terjadi kesalahan', 'error');
  }
}

function displayUserProfile() {
  // Sidebar
  document.getElementById('sidebarName').textContent = currentUserProfile.displayName || '-';
  document.getElementById('sidebarEmail').textContent = currentUserProfile.email || '-';

  // Info Tab - View Mode
  document.getElementById('displayName').textContent = currentUserProfile.displayName || '-';
  document.getElementById('displayEmail').textContent = currentUserProfile.email || '-';
  document.getElementById('displayWhatsapp').textContent = currentUserProfile.whatsapp || '-';

  // Format created date
  if (currentUserProfile.createdAt) {
    const date = new Date(currentUserProfile.createdAt);
    const formatted = date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById('displayCreatedAt').textContent = formatted;
  }

  // Edit Mode
  document.getElementById('editName').value = currentUserProfile.displayName || '';
  document.getElementById('editEmail').value = currentUserProfile.email || '';
  document.getElementById('editWhatsapp').value = currentUserProfile.whatsapp || '';
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Edit Profile Form
  document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);

  // Change Password Form
  document.getElementById('changePasswordForm').addEventListener('submit', handleChangePassword);
}

// ============================================================================
// TAB SWITCHING
// ============================================================================

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remove active from all nav items
  document.querySelectorAll('.profile-nav-item').forEach(item => {
    item.classList.remove('active');
  });

  // Show selected tab
  const tabElement = document.getElementById(`tab-${tabName}`);
  if (tabElement) {
    tabElement.classList.add('active');
  }

  // Add active to clicked nav item
  event.target.closest('.profile-nav-item').classList.add('active');

  // Load data for selected tab
  if (tabName === 'orders') {
    loadOrdersData();
  } else if (tabName === 'stats') {
    loadStatsData();
  }
}

// ============================================================================
// EDIT PROFILE
// ============================================================================

function toggleEditMode() {
  const viewMode = document.getElementById('infoView');
  const editMode = document.getElementById('infoEdit');

  viewMode.style.display = viewMode.style.display === 'none' ? 'block' : 'none';
  editMode.style.display = editMode.style.display === 'none' ? 'block' : 'none';

  if (editMode.style.display === 'block') {
    document.getElementById('editName').focus();
  }
}

async function handleEditProfile(event) {
  event.preventDefault();

  const name = document.getElementById('editName').value.trim();
  const whatsapp = document.getElementById('editWhatsapp').value.trim();

  // Validate
  if (!name || name.length < 3) {
    Notifications.showMessage('Nama minimal 3 karakter', 'error');
    return;
  }

  if (!whatsapp || !/08[0-9]{8,11}/.test(whatsapp)) {
    Notifications.showMessage('Nomor WhatsApp tidak valid (08xxxxxxxxxx)', 'error');
    return;
  }

  // Show loading
  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  try {
    const params = new URLSearchParams({
      action: 'updateUserProfile',
      userId: userAuth.userId,
      name: name,
      whatsapp: whatsapp
    });

    const result = await fetch(`\$\{GAS_CONFIG.URL\}?${params}`).then(r => r.json());

    if (result.success) {
      // Update local data
      currentUserProfile.displayName = name;
      currentUserProfile.whatsapp = whatsapp;
      userAuth.displayName = name;

      // Update UI
      displayUserProfile();

      Notifications.showMessage('Profil berhasil diubah', 'success');
      setTimeout(() => {
        toggleEditMode();
      }, 1500);
    } else {
      Notifications.showMessage(result.message || 'Gagal mengubah profil', 'error');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    Notifications.showMessage('Terjadi kesalahan', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// ============================================================================
// CHANGE PASSWORD
// ============================================================================

function togglePasswordField(fieldId) {
  const field = document.getElementById(fieldId);
  const isPassword = field.type === 'password';
  field.type = isPassword ? 'text' : 'password';
}

function checkPasswordStrength() {
  const password = document.getElementById('newPassword').value;
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');

  if (password.length === 0) {
    strengthBar.className = 'strength-bar';
    strengthBar.style.width = '0%';
    strengthText.textContent = 'Password strength';
    return;
  }

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  let className = '';
  let text = '';

  if (strength <= 1) {
    className = 'strength-weak';
    text = 'Password lemah';
  } else if (strength <= 2) {
    className = 'strength-fair';
    text = 'Password cukup';
  } else if (strength <= 3) {
    className = 'strength-good';
    text = 'Password kuat';
  } else {
    className = 'strength-strong';
    text = 'Password sangat kuat';
  }

  strengthBar.className = `strength-bar ${className}`;
  strengthBar.style.width = (strength * 20) + '%';
  strengthText.textContent = text;
}

function validatePasswordMatch() {
  const password = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const matchMessage = document.getElementById('matchMessage');

  if (confirmPassword === '') {
    matchMessage.style.display = 'none';
    return;
  }

  if (password === confirmPassword) {
    matchMessage.style.display = 'block';
    matchMessage.textContent = '✓ Password cocok';
    matchMessage.style.color = '#28a745';
  } else {
    matchMessage.style.display = 'block';
    matchMessage.textContent = '✗ Password tidak cocok';
    matchMessage.style.color = '#dc3545';
  }
}

async function handleChangePassword(event) {
  event.preventDefault();

  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate
  if (!oldPassword) {
    Notifications.showMessage('Masukkan password lama', 'error');
    return;
  }

  if (!newPassword || newPassword.length < 8) {
    Notifications.showMessage('Password baru minimal 8 karakter', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    Notifications.showMessage('Password tidak cocok', 'error');
    return;
  }

  if (oldPassword === newPassword) {
    Notifications.showMessage('Password baru harus berbeda dengan yang lama', 'error');
    return;
  }

  // Show loading
  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengubah...';

  try {
    const params = new URLSearchParams({
      action: 'changePassword',
      userId: userAuth.userId,
      oldPassword: oldPassword,
      newPassword: newPassword
    });

    const result = await fetch(`\$\{GAS_CONFIG.URL\}?${params}`).then(r => r.json());

    if (result.success) {
      Notifications.showMessage('Password berhasil diubah', 'success');

      // Reset form
      setTimeout(() => {
        document.getElementById('changePasswordForm').reset();
        document.getElementById('passwordMessage').classList.remove('show');
        document.getElementById('strengthBar').className = 'strength-bar';
        document.getElementById('strengthBar').style.width = '0%';
      }, 1500);
    } else {
      Notifications.showMessage(result.message || 'Gagal mengubah password', 'error');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    Notifications.showMessage('Terjadi kesalahan', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// ============================================================================
// LOAD ORDERS
// ============================================================================

async function loadOrdersData() {
  try {
    const ordersContent = document.getElementById('ordersContent');

    const params = new URLSearchParams({
      action: 'getUserOrders',
      userId: userAuth.userId
    });

    const result = await fetch(`\$\{GAS_CONFIG.URL\}?${params}`).then(r => r.json());

    if (result.success && result.orders && result.orders.length > 0) {
      displayOrders(result.orders);
    } else {
      ordersContent.innerHTML = `
        <div class="orders-empty">
          <i class="fas fa-box-open"></i>
          <p>Belum ada pesanan</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('ordersContent').innerHTML = `
      <div class="orders-empty">
        <p>Gagal memuat pesanan</p>
      </div>
    `;
  }
}

function displayOrders(orders) {
  const html = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Domain</th>
          <th>Paket</th>
          <th>Total</th>
          <th>Tanggal</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td class="order-id">${order.orderId}</td>
            <td>${order.domain}</td>
            <td>${order.packageName}</td>
            <td>Rp ${Formatting.formatRupiah(order.total)}</td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
              <span class="status-badge status-${order.paymentStatus.toLowerCase()}">
                ${order.paymentStatus}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.getElementById('ordersContent').innerHTML = html;
}

// ============================================================================
// LOAD STATS
// ============================================================================

async function loadStatsData() {
  try {
    const params = new URLSearchParams({
      action: 'getUserOrderStats',
      userId: userAuth.userId
    });

    const result = await fetch(`\$\{GAS_CONFIG.URL\}?${params}`).then(r => r.json());

    if (result.success && result.stats) {
      displayStats(result.stats);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function displayStats(stats) {
  document.getElementById('statTotalOrders').textContent = stats.totalOrders || 0;
  document.getElementById('statTotalSpent').textContent = `Rp ${Formatting.formatRupiah(stats.totalSpent || 0)}`;
  document.getElementById('statPaidOrders').textContent = stats.paidOrders || 0;
  document.getElementById('statPendingOrders').textContent = stats.pendingOrders || 0;
}

// ============================================================================
// LOGOUT
// ============================================================================

function logout() {
  if (confirm('Apakah Anda yakin ingin logout?')) {
    // Clear session
    sessionStorage.removeItem('userAuth');
    // Clear local auth
    userAuth = null;
    // Redirect to home
    window.location.href = '/';
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// showMessage and showToast moved to /assets/js/utils/notifications.js
// Use Notifications.showMessage() and Notifications.showToast() instead

function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

// formatDate moved to /assets/js/utils/formatting.js
// Use Formatting.formatDate() instead or keep local copy if needed for specific format

// Export for global use
window.switchTab = switchTab;
window.logout = logout;
window.toggleEditMode = toggleEditMode;
window.togglePasswordField = togglePasswordField;
window.checkPasswordStrength = checkPasswordStrength;
window.validatePasswordMatch = validatePasswordMatch;
