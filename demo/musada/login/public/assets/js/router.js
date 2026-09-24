const Router = {
  routes: {},
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  add(path, handler) {
    this.routes[path] = handler;
  },

  normalizeHash(hash = '') {
    const normalized = hash || '#/dashboard';
    const [pathname] = normalized.split('?');
    return pathname;
  },

  getActiveRoute() {
    return this.normalizeHash(window.location.hash);
  },

  async handleRoute() {
    if (!Auth.currentUser) return;

    const hash = this.getActiveRoute();
    const container = document.getElementById('views-container');
    if (!container) return;

    document.querySelectorAll('.btn-nav').forEach((el) => {
      el.classList.toggle('active', el.getAttribute('href') === hash);
    });

    container.innerHTML = '<div class="text-center text-muted loading-state"><div class="loader loading-state__loader"></div>Memuat halaman...</div>';

    const [path] = hash.split('?');
    let matchedHandler = this.routes[path];
    let routeParams = null;

    if (!matchedHandler) {
      const parts = path.split('/');
      if (parts.length > 2) {
        const basePath = `${parts.slice(0, -1).join('/')}/:id`;
        if (this.routes[basePath]) {
          matchedHandler = this.routes[basePath];
          routeParams = parts[parts.length - 1];
        }
      }
    }

    if (matchedHandler) {
      try {
        await matchedHandler(container, routeParams);
      } catch (error) {
        container.innerHTML = `<div class="card"><p class="error-text">Gagal memuat halaman: ${error.message}</p></div>`;
      }
    } else {
      container.innerHTML = '<div class="card"><div class="card-body"><h2 class="card-title">404</h2><p class="text-muted">Halaman tidak ditemukan.</p></div></div>';
    }

    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
  },

  setTitle(title, subtitle) {
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    if (titleEl) titleEl.innerText = title;
    if (!subtitleEl) return;

    subtitleEl.innerText = subtitle || '';
    if (subtitle) {
      subtitleEl.classList.remove('hidden');
    } else {
      subtitleEl.classList.add('hidden');
    }
  }
};