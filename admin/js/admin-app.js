/**
 * Admin Dashboard SPA Main Application
 */
import {
  AdminSidebar
} from './components/sidebar.js';
import {
  AdminNavbar
} from './components/navbar.js';
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
import {
  getFirebase
} from '/assets/js/modules/firebase-core.js';
class AdminApp {
  constructor() {
    this.currentRoute = null;
    this.sidebar = null;
    this.navbar = null;
    this.init();
  }
  async init() {
    // STRICT SECURITY: Synchronous Check sebelum me-render UI apapun
    const user = AuthManager.getCurrentUser();
    if (!user) {
      window.location.href = 'https://my.sisitus.com/auth/';
      return;
    }
    if (user.status === 'suspended') {
      document.body.innerHTML = '';
      window.location.href = 'https://my.sisitus.com/auth/?error=suspended';
      return;
    }
    if (user.role !== 'admin') {
      document.body.innerHTML = '';
      // Arahkan ke dasbor pelanggan karena dia masih punya hak akses sebagai customer
      window.location.href = 'https://my.sisitus.com/dashboard/';
      return;
    }
    // Render sidebar and navbar
    this.sidebar = new AdminSidebar(this);
    this.sidebar.render();
    this.navbar = new AdminNavbar();
    this.navbar.render();
    // SECURITY: Firebase Admin Probe Check
    try {
      const {
        db
      } = await getFirebase();
      await db.ref('users').once('value'); // This will throw Permission Denied if not admin
    } catch (e) {
      void('Admin verification failed!', e);
      AuthManager.clearSession();
      window.location.href = 'https://my.sisitus.com/auth/?error=unauthorized';
      return;
    }
    // Setup routes
    this.setupRoutes();
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRouteChange());
    // Initial route
    this.handleRouteChange();
  }
  setupRoutes() {
    this.routes = {
      '/': {
        page: 'overview',
        title: 'Overview',
        loadModule: () => import('./modules/overview.js')
      },
      '/users': {
        page: 'users',
        title: 'Kelola Users',
        loadModule: () => import('./modules/users.js')
      },
      '/transactions': {
        page: 'transactions',
        title: 'Transaksi',
        loadModule: () => import('./modules/transactions.js')
      },
      '/packages': {
        page: 'packages',
        title: 'Paket Website',
        loadModule: () => import('./modules/packages.js')
      },
      '/domains': {
        page: 'domains',
        title: 'Harga Domain',
        loadModule: () => import('./modules/domains.js')
      },
      '/addons': {
        page: 'addons',
        title: 'Layanan Ekstra',
        loadModule: () => import('./modules/addons.js')
      },
      '/dns': {
        page: 'dns',
        title: 'DNS Records',
        loadModule: () => import('./modules/dns.js')
      },
      '/promos': {
        page: 'promos',
        title: 'Kode Promo',
        loadModule: () => import('./modules/promos.js')
      },
      '/livechat': {
        page: 'livechat',
        title: 'Live Chat',
        loadModule: () => import('./modules/livechat.js')
      },
      '/support': {
        page: 'support',
        title: 'Support Tickets',
        loadModule: () => import('./modules/support.js')
      },
      '/settings': {
        page: 'settings',
        title: 'Pengaturan Sistem',
        loadModule: () => import('./modules/settings.js')
      },
      '/profile': {
        page: 'profile',
        title: 'Profil Admin',
        loadModule: () => import('./modules/profile.js')
      }
    };
  }
  handleRouteChange() {
    const hash = window.location.hash;
    const routePart = hash.replace('#!', '').split('?')[0] || '/';
    const baseRoute = routePart.startsWith('/') ? routePart : `/${routePart}`;
    this.navigate(baseRoute);
  }
  async navigate(route) {
    // PROTECT ROUTES
    if (route !== '/login' && !AuthManager.isAdmin()) {
      window.location.href = 'https://my.sisitus.com/auth/';
      return;
    }
    if (!this.routes[route]) {
      route = '/';
      window.location.hash = '#!' + route;
      return;
    }
    this.currentRoute = route;
    const routeConfig = this.routes[route];
    // Update sidebar UI
    if (this.sidebar) this.sidebar.setActive(route);
    // Update Navbar title
    if (this.navbar) this.navbar.setTitle(routeConfig.title);
    document.title = `${routeConfig.title} - Admin SISITUS`;
    try {
      this.showLoading();
      // Load JS module
      const module = await routeConfig.loadModule();
      // Load HTML view
      const response = await fetch(`/views/${routeConfig.page}.html`);
      if (!response.ok) throw new Error(`View not found: ${routeConfig.page}`);
      const html = await response.text();
      const contentArea = document.getElementById('admin-content');
      contentArea.innerHTML = html;
      // Run module logic
      if (module.render) {
        await module.render();
      }
      contentArea.scrollTop = 0;
    } catch (error) {
      void('Routing Error:', error);
      document.getElementById('admin-content').innerHTML = `
        <div style="padding: 2rem; color: #ef4444; text-align: center;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <h2>Error Loading Module</h2>
          <p>${error.message}</p>
        </div>
      `;
    } finally {
      this.hideLoading();
    }
  }
  showLoading() {
    const loader = document.getElementById('admin-loading-overlay');
    if (loader) loader.style.display = 'flex';
  }
  hideLoading() {
    const loader = document.getElementById('admin-loading-overlay');
    if (loader) loader.style.display = 'none';
  }
}
// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  window.adminApp = new AdminApp();
});