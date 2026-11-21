export class AdminSidebar {
constructor(app) {
this.app = app;
this.container = document.getElementById('admin-sidebar');
this.currentRoute = '/';
}
render() {
if (!this.container) return;
this.container.innerHTML = `
<div class="sidebar-brand-container">
<a href="#!/" class="sidebar-logo">
<img src="/assets/img/logo/logo.svg" alt="SISITUS" class="sidebar-logo-img">
<span class="sidebar-logo-text">SISITUS</span>
</a>
</div>
<div class="sidebar-menu-header">MENU UTAMA</div>
<nav class="sidebar-menu">
<a href="#!/" class="menu-item active" data-route="/" title="Overview">
<span class="menu-icon"><i class="ph-fill ph-squares-four"></i></span>
<span class="menu-label">Overview</span>
</a>
<a href="#!/users" class="menu-item" data-route="/users" title="Users">
<span class="menu-icon"><i class="ph-fill ph-users"></i></span>
<span class="menu-label">Users</span>
</a>
<a href="#!/transactions" class="menu-item" data-route="/transactions" title="Transaksi">
<span class="menu-icon"><i class="ph-fill ph-receipt"></i></span>
<span class="menu-label">Transaksi</span>
</a>
</nav>
<div class="sidebar-menu-header">MANAJEMEN PRODUK</div>
<nav class="sidebar-menu">
<a href="#!/packages" class="menu-item" data-route="/packages" title="Paket Website">
<span class="menu-icon"><i class="ph-fill ph-package"></i></span>
<span class="menu-label">Paket Website</span>
</a>
<a href="#!/proposals" class="menu-item" data-route="/proposals" title="Proposal Builder">
<span class="menu-icon"><i class="ph-fill ph-file-text"></i></span>
<span class="menu-label">Proposal Builder</span>
</a>
<a href="#!/domains" class="menu-item" data-route="/domains" title="Harga Domain">
<span class="menu-icon"><i class="ph-fill ph-globe"></i></span>
<span class="menu-label">Harga Domain</span>
</a>
<a href="#!/addons" class="menu-item" data-route="/addons" title="Layanan Ekstra">
<span class="menu-icon"><i class="ph-fill ph-puzzle-piece"></i></span>
<span class="menu-label">Layanan Ekstra</span>
</a>
<a href="#!/dns" class="menu-item" data-route="/dns" title="DNS Records">
<span class="menu-icon"><i class="ph-fill ph-tree-structure"></i></span>
<span class="menu-label">DNS Records</span>
</a>
<a href="#!/promos" class="menu-item" data-route="/promos" title="Kode Promo">
<span class="menu-icon"><i class="ph-fill ph-ticket"></i></span>
<span class="menu-label">Kode Promo</span>
</a>
</nav>
<div class="sidebar-menu-header">SISTEM</div>
<nav class="sidebar-menu">
<a href="#!/livechat" class="menu-item" data-route="/livechat" title="Live Chat">
<span class="menu-icon"><i class="ph-fill ph-chat-teardrop-dots"></i></span>
<span class="menu-label">Live Chat</span>
</a>
<a href="#!/support" class="menu-item" data-route="/support" title="Support Tickets">
<span class="menu-icon"><i class="ph-fill ph-headset"></i></span>
<span class="menu-label">Support Tickets</span>
</a>
<a href="#!/settings" class="menu-item" data-route="/settings" title="Pengaturan">
<span class="menu-icon"><i class="ph-fill ph-sliders"></i></span>
<span class="menu-label">Pengaturan</span>
</a>
<a href="#!/profile" class="menu-item" data-route="/profile" title="Profil Admin">
<span class="menu-icon"><i class="ph-fill ph-user-circle-gear"></i></span>
<span class="menu-label">Profil Admin</span>
</a>
</nav>
<div class="sidebar-footer">
<div class="sidebar-info">
<small class="sidebar-info__title">SISITUS Admin Dashboard</small>
<small class="sidebar-info__meta">Akses cepat &bull; aman &bull; terintegrasi</small>
</div>
</div>
`;
const navLinks = this.container.querySelectorAll('.menu-item');
navLinks.forEach(link => {
link.addEventListener('click', () => {
if (window.innerWidth <= 768) {
const sidebar = document.getElementById('admin-sidebar');
const overlay = document.getElementById('admin-sidebar-overlay');
if (sidebar) sidebar.classList.remove('open');
if (overlay) overlay.classList.remove('show');
}
});
});
}
setActive(route) {
this.currentRoute = route;
const items = this.container.querySelectorAll('.menu-item');
items.forEach(item => {
if (item.getAttribute('data-route') === route) {
item.classList.add('active');
} else {
item.classList.remove('active');
}
});
}
}
export default AdminSidebar;