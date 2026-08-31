/**
 * Dashboard Top Navigation Bar Component
 */
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
import {
  showConfirm,
  renderUserAvatarHtml,
  EnvHelper
} from '/assets/js/modules/unified-utils.js';
export class DashboardNavbar {
  constructor() {
    this.user = AuthManager.getCurrentUser();
    this.authListenerBound = false;
    this.breadcrumbListenerBound = false;
    this.dropdownOutsideClickHandler = null;
    this.sidebarOutsideClickHandler = null;
  }
  render() {
    const container = document.getElementById('navbar');
    container.innerHTML = `
      <div class="navbar-container">
        <!-- Mobile hamburger menu button -->
        <button id="sidebar-toggle" class="sidebar-toggle" aria-label="Toggle Sidebar">
          <i class="ph-fill ph-list"></i>
        </button>

        <div class="navbar-brand">
          <a href="#!/dashboard/" class="navbar-logo">
            <img src="/assets/img/logo/logo512x512.webp" alt="SISITUS" class="logo-img">
            <span class="logo-text">Client Area</span>
          </a>
        </div>

        <div class="navbar-content">
          <!-- Breadcrumb or Title -->
          <div class="navbar-breadcrumbs">
            <a href="#!/dashboard/" class="breadcrumb-link"><i class="ph-fill ph-house"></i> <span class="breadcrumb-text">Dashboard</span></a>
            <span class="breadcrumb-separator"><i class="ph-bold ph-caret-right"></i></span>
            <span class="breadcrumb-item active" id="navbar-active-page">Overview</span>
          </div>
        </div>

        <div class="navbar-actions">
          <!-- Kunjungi Website button -->
          <a href="${EnvHelper.getDomainUrl('public', '/')}" target="_blank" class="btn btn-white btn-website" style="border: 1px solid #ddd; margin-right: 15px;">
            <i class="ph-fill ph-arrow-square-out"></i> <span class="btn-text">Kunjungi Website</span>
          </a>

          <!-- User Profile Dropdown -->
          <div class="user-dropdown-container">
            <div class="user-profile-trigger" id="user-profile-trigger">
              ${renderUserAvatarHtml(this.user, 'w150', 'user-avatar')}
              <span class="user-name">${this.user?.displayName || 'Pelanggan'}</span>
              <i class="ph-bold ph-caret-down dropdown-arrow"></i>
            </div>
            <div class="user-dropdown-menu" id="user-dropdown-menu">
              <div class="dropdown-header">
                <strong>${this.user?.displayName || 'Pelanggan'}</strong>
                <span class="dropdown-email">${this.user?.email || ''}</span>
              </div>
              <hr>
              <a href="#!/dashboard/profile" class="dropdown-item"><i class="ph-fill ph-user-gear"></i> Profil Saya</a>
              <a href="#!/dashboard/orders" class="dropdown-item"><i class="ph-fill ph-clock-counter-clockwise"></i> Pesanan</a>
              <a href="#!/dashboard/invoices" class="dropdown-item"><i class="ph-fill ph-receipt"></i> Invoice</a>
              <hr>
              <button id="btn-logout-dropdown" class="dropdown-item logout-btn"><i class="ph-fill ph-sign-out"></i> Keluar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    // Dropdown toggle logic
    const dropdownTrigger = document.getElementById('user-profile-trigger');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (dropdownTrigger && dropdownMenu) {
      dropdownTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
        const arrow = dropdownTrigger.querySelector('.dropdown-arrow');
        if (arrow) {
          if (dropdownMenu.classList.contains('show')) {
            arrow.style.transform = 'rotate(180deg)';
          } else {
            arrow.style.transform = 'rotate(0deg)';
          }
        }
      });
      if (this.dropdownOutsideClickHandler) {
        document.removeEventListener('click', this.dropdownOutsideClickHandler);
      }
      this.dropdownOutsideClickHandler = () => {
        dropdownMenu.classList.remove('show');
        const arrow = dropdownTrigger.querySelector('.dropdown-arrow');
        if (arrow) {
          arrow.style.transform = 'rotate(0deg)';
        }
      };
      document.addEventListener('click', this.dropdownOutsideClickHandler);
    }
    // Mobile sidebar toggle logic
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
      });
      if (this.sidebarOutsideClickHandler) {
        document.removeEventListener('click', this.sidebarOutsideClickHandler);
      }
      this.sidebarOutsideClickHandler = (e) => {
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      };
      document.addEventListener('click', this.sidebarOutsideClickHandler);
    }
    // Logout handler
    const btnLogout = document.getElementById('btn-logout-dropdown');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        showConfirm('Yakin ingin logout?', () => {
          AuthManager.clearSession();
          window.location.href = '/auth/';
        });
      });
    }
    // Listen for auth changes
    if (!this.authListenerBound) {
      this.authListenerBound = true;
      document.addEventListener('auth:authChanged', (e) => {
        if (e.detail) {
          this.user = e.detail.user || e.detail;
          this.render();
        }
      });
    }
    // Update active breadcrumb name on hashchange
    this.updateActiveBreadcrumb();
    if (!this.breadcrumbListenerBound) {
      this.breadcrumbListenerBound = true;
      window.addEventListener('hashchange', () => this.updateActiveBreadcrumb());
    }
  }
  updateActiveBreadcrumb() {
    const hash = window.location.hash;
    const pageId = hash.replace('#!', '').split('?')[0].split('/').filter(Boolean).pop() || 'dashboard';
    const pageData = {
      'dashboard': {
        label: 'Overview',
        icon: 'ph-fill ph-squares-four'
      },
      'profile': {
        label: 'Profil Saya',
        icon: 'ph-fill ph-user-gear'
      },
      'orders': {
        label: 'Pesanan Saya',
        icon: 'ph-fill ph-tote'
      },
      'payment': {
        label: 'Pembayaran',
        icon: 'ph-fill ph-credit-card'
      },
      'invoices': {
        label: 'Invoice',
        icon: 'ph-fill ph-receipt'
      },
      'domains': {
        label: 'Domain Saya',
        icon: 'ph-fill ph-globe'
      },
      'wishlist': {
        label: 'Wishlist Saya',
        icon: 'ph-fill ph-heart'
      },
      'support': {
        label: 'Support & Bantuan',
        icon: 'ph-fill ph-headset'
      },
      'checkout': {
        label: 'Pesan Domain Baru',
        icon: 'ph-fill ph-shopping-cart'
      },
      'cart': {
        label: 'Keranjang Belanja',
        icon: 'ph-fill ph-shopping-cart'
      },
      'keranjang': {
        label: 'Keranjang Saya',
        icon: 'ph-fill ph-shopping-cart'
      },
      'keranjang-saya': {
        label: 'Keranjang Saya',
        icon: 'ph-fill ph-shopping-cart'
      }
    };
    const activeBreadcrumb = document.getElementById('navbar-active-page');
    if (activeBreadcrumb) {
      const data = pageData[pageId] || pageData['dashboard'];
      activeBreadcrumb.innerHTML = `<i class="${data.icon}" style="margin-right: 6px; color: var(--primary-blue);"></i>${data.label}`;
    }
  }
}