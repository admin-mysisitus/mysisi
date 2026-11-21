import { AuthManager } from '/assets/js/modules/unified-auth.js';
import { renderUserAvatarHtml, EnvHelper } from '/assets/js/modules/unified-utils.js';
export class AdminNavbar {
constructor() {
this.container = document.getElementById('admin-navbar');
this.authListenerBound = false;
this.dropdownOutsideHandler = null;
}
render() {
if (!this.container) return;
const userData = AuthManager.getCurrentUser();
let displayName = 'Administrator';
let avatarHtml = renderUserAvatarHtml(userData, 'w150', 'user-avatar');
if (userData && userData.displayName) {
displayName = userData.displayName;
}
this.container.innerHTML = `
<div class="navbar-container">
<button id="admin-menu-toggle" class="sidebar-toggle" aria-label="Toggle Sidebar">
<i class="ph-fill ph-list"></i>
</button>
<div class="navbar-brand">
<a href="#!/" class="navbar-logo">
<img src="/assets/img/logo/logo.svg" alt="SISITUS" class="logo-img">
<span class="logo-text">Admin Panel</span>
</a>
</div>
<div class="navbar-content">
<div class="navbar-breadcrumbs">
<a href="#!/" class="breadcrumb-link"><i class="ph-fill ph-house"></i> <span class="breadcrumb-text">Dashboard</span></a>
<span class="breadcrumb-separator"><i class="ph-bold ph-caret-right"></i></span>
<span class="breadcrumb-item active"><i class="ph-fill ph-squares-four" id="admin-navbar-active-icon"></i> <span id="admin-navbar-active-page">Overview</span></span>
</div>
</div>
<div class="navbar-actions">
<a href="/" target="_blank" rel="noopener noreferrer" id="btn-kunjungi-website" class="btn btn-white btn-website">
<i class="ph-fill ph-arrow-square-out"></i> <span class="btn-text">Kunjungi Website</span>
</a>
<div class="user-dropdown-container">
<div class="user-profile-trigger" id="admin-profile-trigger">
${avatarHtml}
<span class="user-name">${displayName}</span>
<i class="ph-bold ph-caret-down dropdown-arrow"></i>
</div>
<div class="user-dropdown-menu" id="admin-user-dropdown-menu">
<div class="dropdown-header">
<strong>${displayName}</strong>
<span class="dropdown-email">${userData?.email || 'admin@sisitus.com'}</span>
</div>
<hr>
<a href="#!/profile" class="dropdown-item"><i class="ph-fill ph-user-gear"></i> Profil Admin</a>
<a href="#!/transactions" class="dropdown-item"><i class="ph-fill ph-receipt"></i> Transaksi</a>
<a href="#!/settings" class="dropdown-item"><i class="ph-fill ph-sliders"></i> Pengaturan</a>
<hr>
<button id="btn-admin-logout" class="dropdown-item logout-btn"><i class="ph-fill ph-sign-out"></i> Keluar</button>
</div>
</div>
</div>
</div>
`;
const trigger = document.getElementById('admin-profile-trigger');
const menu = document.getElementById('admin-user-dropdown-menu');
if (trigger && menu) {
trigger.addEventListener('click', (e) => {
e.stopPropagation();
menu.classList.toggle('show');
const arrow = trigger.querySelector('.dropdown-arrow');
if (arrow) {
arrow.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}
});
if (this.dropdownOutsideHandler) {
document.removeEventListener('click', this.dropdownOutsideHandler);
}
this.dropdownOutsideHandler = () => {
menu.classList.remove('show');
const arrow = trigger.querySelector('.dropdown-arrow');
if (arrow) arrow.style.transform = 'rotate(0deg)';
};
document.addEventListener('click', this.dropdownOutsideHandler);
}
const logoutBtn = document.getElementById('btn-admin-logout');
if (logoutBtn) {
logoutBtn.addEventListener('click', async () => {
if (confirm('Apakah Anda yakin ingin keluar dari Admin Panel?')) {
AuthManager.clearSession();
window.location.href = EnvHelper.getDomainUrl('my', '/auth/');
}
});
}
const menuToggle = document.getElementById('admin-menu-toggle');
const sidebar = document.getElementById('admin-sidebar');
const overlay = document.getElementById('admin-sidebar-overlay');
if (menuToggle && sidebar && overlay) {
menuToggle.addEventListener('click', () => {
sidebar.classList.add('open');
overlay.classList.add('show');
});
overlay.addEventListener('click', () => {
sidebar.classList.remove('open');
overlay.classList.remove('show');
});
}
if (!this.authListenerBound) {
this.authListenerBound = true;
document.addEventListener('auth:authChanged', (e) => {
if (e.detail) {
this.render();
}
});
}
}
setTitle(title, icon) {
const pageEl = document.getElementById('admin-navbar-active-page');
if (pageEl) {
pageEl.textContent = title || 'Overview';
}
const iconEl = document.getElementById('admin-navbar-active-icon');
if (iconEl && icon) {
iconEl.className = icon;
}
const titleEl = document.getElementById('admin-top-title');
if (titleEl) {
titleEl.textContent = title || 'Overview';
}
}
}
export default AdminNavbar;