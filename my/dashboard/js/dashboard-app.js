import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
import {
  DashboardNavbar
} from './components/navbar.js';
import {
  DashboardSidebar
} from './components/sidebar.js';
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  EnvHelper
} from '/assets/js/modules/unified-utils.js';
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
class DashboardApp {
  constructor() {
    this.currentUser = AuthManager.getCurrentUser();
    this.currentRoute = null;
    this.currentModule = null;
    this.navbar = null;
    this.sidebar = null;
    this.init();
  }
  async init() {
    this.navbar = new DashboardNavbar();
    this.navbar.render();
    this.sidebar = new DashboardSidebar(this);
    this.sidebar.render();
    this.setupRoutes();
    window.addEventListener('hashchange', () => this.handleRouteChange());
    document.addEventListener('auth:authChanged', (e) => {
      if (!e.detail) {
        window.location.href = '/auth/';
      } else {
        this.currentUser = e.detail.user || e.detail;
      }
    });
    this.handleRouteChange();
  }
  setupRoutes() {
    this.routes = {
      '/dashboard/': {
        page: 'dashboard',
        title: 'Dashboard',
        requiresAuth: true,
        loadModule: () => import('./modules/dashboard.js')
      },
      '/dashboard/profile': {
        page: 'profile',
        title: 'Profil Saya',
        requiresAuth: true,
        loadModule: () => import('./modules/profile.js')
      },
      '/dashboard/orders': {
        page: 'orders',
        title: 'Pesanan Saya',
        requiresAuth: true,
        loadModule: () => import('./modules/orders.js')
      },
      '/dashboard/payment': {
        page: 'payment',
        title: 'Pembayaran',
        requiresAuth: true,
        loadModule: () => import('./modules/payment.js?v=2')
      },
      '/dashboard/invoices': {
        page: 'invoices',
        title: 'Invoice',
        requiresAuth: true,
        loadModule: () => import('./modules/invoices.js')
      },
      '/dashboard/domains': {
        page: 'domains',
        title: 'Domain Saya',
        requiresAuth: true,
        loadModule: () => import('./modules/domains.js')
      },
      '/dashboard/wishlist': {
        page: 'wishlist',
        title: 'Wishlist Saya',
        requiresAuth: true,
        loadModule: () => import('./modules/wishlist.js')
      },
      '/dashboard/support': {
        page: 'support',
        title: 'Support',
        requiresAuth: true,
        loadModule: () => import('./modules/support.js')
      },
      '/dashboard/domain-saya': {
        page: 'domains',
        title: 'Domain Saya',
        requiresAuth: true,
        loadModule: () => import('./modules/domains.js?v=' + Date.now())
      },
      '/dashboard/pesanan': {
        page: 'orders',
        title: 'Pesanan',
        requiresAuth: true,
        loadModule: () => import('./modules/orders.js?v=' + Date.now())
      },
      '/dashboard/pengaturan': {
        page: 'settings',
        title: 'Pengaturan Akun',
        requiresAuth: true,
        loadModule: () => import('./modules/settings.js?v=' + Date.now())
      },
      '/dashboard/cart': {
        page: 'cart',
        title: 'Keranjang Belanja',
        requiresAuth: true,
        loadModule: () => import('./modules/cart.js?v=' + Date.now())
      },
      '/dashboard/keranjang': {
        page: 'cart',
        title: 'Keranjang Saya',
        requiresAuth: true,
        loadModule: () => import('./modules/cart.js?v=' + Date.now())
      },
      '/dashboard/keranjang-saya': {
        page: 'cart',
        title: 'Keranjang Saya',
        requiresAuth: true,
        loadModule: () => import('./modules/cart.js?v=' + Date.now())
      }
    };
  }
  handleRouteChange() {
    const hash = window.location.hash;
    const routePart = hash.replace('#!', '').split('?')[0] || '/dashboard/';
    const baseRoute = routePart.startsWith('/dashboard/') ? routePart : `/dashboard/${routePart}`;
    this.navigate(baseRoute);
  }
  async navigate(route) {
    if (!this.routes[route]) {
      route = '/dashboard/';
      window.location.hash = '#!' + route;
      return;
    }
    const routeConfig = this.routes[route];
    if (routeConfig.requiresAuth && !this.currentUser) {
      window.location.href = '/auth/';
      return;
    }
    if (this.currentUser && this.currentUser.role === 'admin') {
      window.location.href = EnvHelper.getDomainUrl('backstage', '/');
      return;
    }
    this.currentRoute = route;
    this.sidebar.setActive(route);
    document.title = `${routeConfig.title} - SISITUS Dashboard`;
    try {
      this.showLoadingOverlay();
      const module = await routeConfig.loadModule();
      let html = '';
      let fetchSuccess = false;
      let retries = 3;
      while (retries > 0 && !fetchSuccess) {
        try {
          const response = await fetch(`views/${routeConfig.page}.html`);
          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
          }
          html = await response.text();
          if (html.includes('HTTP 404') || html.includes('drive.google.com') || html.includes('<title>Error</title>')) {
            throw new Error('Soft 404 dari Server Hosting');
          }
          fetchSuccess = true;
        } catch (fetchErr) {
          retries--;
          void(`[Router] Gagal memuat template ${routeConfig.page}.html, sisa percobaan: ${retries}`, fetchErr);
          if (retries === 0) {
            throw new Error(`Gagal memuat antarmuka halaman. Server hosting mungkin sedang sibuk. Silakan muat ulang (refresh) halaman ini.`);
          }
          await new Promise(res => setTimeout(res, 500));
        }
      }
      const contentArea = document.getElementById('content');
      if (this.currentModule && typeof this.currentModule.destroy === 'function') {
        try {
          this.currentModule.destroy();
        } catch (cleanupErr) {
          console.warn('[Router] Error cleaning up previous module:', cleanupErr);
        }
      }
      contentArea.innerHTML = html;
      this.currentModule = module;
      if (module.render) {
        await module.render(this.currentUser);
      } else if (module.default && typeof module.default === 'function') {
        await module.default(this.currentUser);
      }
      contentArea.scrollTop = 0;
    } catch (error) {
      void('Error loading route:', error);
      document.getElementById('content').innerHTML = `
        <div class="error-container">
          <h2>Error</h2>
          <p>${error.message}</p>
          <button onclick="window.location.reload()">Reload</button>
        </div>
      `;
    } finally {
      this.hideLoadingOverlay();
    }
  }
  showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'flex';
  }
  hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
  }
  static showNotification(message, type = 'info') {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: type === 'error' ? 'error' : (type === 'success' ? 'success' : 'info'),
        title: type === 'error' ? 'Kesalahan' : (type === 'success' ? 'Sukses' : 'Informasi'),
        text: message,
        confirmButtonText: 'OK',
        confirmButtonColor: type === 'error' ? '#ef4444' : '#2563eb'
      });
    } else {
      alert(message);
    }
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
  });
} else {
  window.dashboardApp = new DashboardApp();
}