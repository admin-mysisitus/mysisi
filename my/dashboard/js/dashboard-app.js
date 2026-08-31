/**
 * Dashboard SPA Main Application
 * Handles routing, session management, and page rendering
 */
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
import {
  DashboardNavbar
} from './components/navbar.js';
import {
  DashboardSidebar
} from './components/sidebar.js';

// alias rute bahasa Indonesia → rute utama, supaya tidak duplikasi config
const ROUTE_ALIASES = {
  '/dashboard/keranjang': '/dashboard/cart',
  '/dashboard/keranjang-saya': '/dashboard/cart',
  '/dashboard/domain-saya': '/dashboard/domains',
  '/dashboard/pesanan': '/dashboard/orders',
  '/dashboard/pengaturan': '/dashboard/settings',
};

class DashboardApp {
  constructor() {
    this.currentUser = AuthManager.getCurrentUser();
    this.currentRoute = null;
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
        loadModule: () => import('./modules/payment.js')
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
      '/dashboard/settings': {
        page: 'settings',
        title: 'Pengaturan Akun',
        requiresAuth: true,
        loadModule: () => import('./modules/settings.js')
      },
      '/dashboard/cart': {
        page: 'cart',
        title: 'Keranjang Belanja',
        requiresAuth: true,
        loadModule: () => import('./modules/cart.js')
      }
    };
  }
  handleRouteChange() {
    const hash = window.location.hash;
    let routePart = hash.replace('#!', '').split('?')[0] || '/dashboard/';
    let baseRoute = routePart.startsWith('/dashboard/') ? routePart : `/dashboard/${routePart}`;
    // resolve alias ke rute utama supaya tidak perlu duplikasi config
    if (ROUTE_ALIASES[baseRoute]) {
      baseRoute = ROUTE_ALIASES[baseRoute];
    }
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
    // admin sebaiknya masuk ke panel admin
    if (this.currentUser && this.currentUser.role === 'admin') {
      window.location.href = 'https://backstage.sisitus.com/';
      return;
    }
    this.currentRoute = route;
    this.sidebar.setActive(route);
    document.title = `${routeConfig.title} - SISITUS Dashboard`;
    try {
      this.showLoadingOverlay();
      const module = await routeConfig.loadModule();
      // fetch HTML template dengan retry
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
          if (retries === 0) {
            throw new Error('Gagal memuat antarmuka halaman. Server hosting mungkin sedang sibuk. Silakan muat ulang (refresh) halaman ini.');
          }
          await new Promise(res => setTimeout(res, 500));
        }
      }
      const contentArea = document.getElementById('content');
      contentArea.innerHTML = html;
      if (module.render) {
        await module.render(this.currentUser);
      } else if (module.default && typeof module.default === 'function') {
        await module.default(this.currentUser);
      }
      contentArea.scrollTop = 0;
    } catch (error) {
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
}
// mulai app saat DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
  });
} else {
  window.dashboardApp = new DashboardApp();
}