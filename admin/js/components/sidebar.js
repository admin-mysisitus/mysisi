export class AdminSidebar {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('admin-sidebar');
  }
  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="admin-sidebar-header">
        <img src="/assets/img/logo/logo512x512.webp" alt="SISITUS Logo" style="width: 28px; height: 28px; object-fit: contain;">
        <span class="admin-logo-text">SISITUS Admin</span>
      </div>
      <nav class="admin-nav-menu">
        <div style="color: var(--admin-text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; padding: 10px 16px; margin-top: 10px;">Main Menu</div>
        
        <a href="#!/admin/" class="admin-nav-item" data-route="/admin/">
          <i class="fas fa-chart-pie"></i> Overview
        </a>
        <a href="#!/admin/users" class="admin-nav-item" data-route="/admin/users">
          <i class="fas fa-users"></i> Users
        </a>
        <a href="#!/admin/transactions" class="admin-nav-item" data-route="/admin/transactions">
          <i class="fas fa-file-invoice-dollar"></i> Transaksi
        </a>
        
        <div style="color: var(--admin-text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; padding: 10px 16px; margin-top: 15px;">Manajemen Produk</div>
        
        <a href="#!/admin/packages" class="admin-nav-item" data-route="/admin/packages">
          <i class="fas fa-box-open"></i> Paket & Domain
        </a>
        <a href="#!/admin/dns" class="admin-nav-item" data-route="/admin/dns">
          <i class="fas fa-network-wired"></i> DNS Records
        </a>
        <a href="#!/admin/promos" class="admin-nav-item" data-route="/admin/promos">
          <i class="fas fa-ticket"></i> Promo Codes
        </a>

        <div style="color: var(--admin-text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; padding: 10px 16px; margin-top: 15px;">Sistem</div>
        
        <a href="#!/admin/livechat" class="admin-nav-item" data-route="/admin/livechat">
          <i class="fas fa-comments"></i> Live Chat
        </a>
        <a href="#!/admin/support" class="admin-nav-item" data-route="/admin/support">
          <i class="fas fa-headset"></i> Support Tickets
        </a>
        <a href="#!/admin/settings" class="admin-nav-item" data-route="/admin/settings">
          <i class="fas fa-sliders"></i> Pengaturan
        </a>
        
        <a href="#!/admin/profile" class="admin-nav-item" data-route="/admin/profile">
          <i class="fas fa-user-circle"></i> Profil Admin
        </a>
        
        <div style="color: var(--admin-text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; padding: 10px 16px; margin-top: 15px; border-top: 1px solid var(--admin-border); padding-top: 20px;">Lainnya</div>

        <a href="/" class="admin-nav-item" style="color: var(--admin-text-muted);">
          <i class="fas fa-arrow-left"></i> Kembali ke Web
        </a>
        <button id="sidebar-logout-btn" class="admin-nav-item" style="color: var(--admin-danger); background: transparent; border: none; text-align: left; width: 100%; cursor: pointer;">
          <i class="fas fa-sign-out-alt"></i> Keluar
        </button>
      </nav>
    `;
    // Setup logout listener
    const logoutBtn = this.container.querySelector('#sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (confirm('Apakah Anda yakin ingin keluar dari Admin Panel?')) {
          const {
            AuthManager
          } = await import('/assets/js/modules/unified-auth.js');
          AuthManager.clearSession();
          window.location.href = '/admin/login.html';
        }
      });
    }
    // Auto-close sidebar on mobile when a link is clicked
    const navLinks = this.container.querySelectorAll('.admin-nav-item');
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
    const items = this.container.querySelectorAll('.admin-nav-item');
    items.forEach(item => {
      if (item.getAttribute('data-route') === route) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
}