export class DashboardSidebar {
  constructor(router) {
    this.router = router;
    this.currentRoute = null;
  }
  render(currentRoute = '/dashboard/') {
    this.currentRoute = currentRoute;
    const container = document.getElementById('sidebar');
    const menuItems = [{
      id: 'dashboard',
      icon: 'fas fa-th-large',
      label: 'Dashboard',
      route: '/dashboard/'
    }, {
      id: 'profile',
      icon: 'fas fa-user-cog',
      label: 'Profil Saya',
      route: '/dashboard/profile'
    }, {
      id: 'cart',
      icon: 'fas fa-shopping-cart',
      label: 'Keranjang Saya',
      route: '/dashboard/cart',
      isExternal: false,
      badge: 'cart-badge'
    }, {
      id: 'wishlist',
      icon: 'fas fa-heart',
      label: 'Wishlist Saya',
      route: '/dashboard/wishlist',
      badge: 'wishlist-badge'
    }, {
      id: 'orders',
      icon: 'fas fa-shopping-bag',
      label: 'Pesanan',
      route: '/dashboard/orders'
    }, {
      id: 'invoices',
      icon: 'fas fa-file-invoice-dollar',
      label: 'Invoice',
      route: '/dashboard/invoices',
      badge: ''
    }, {
      id: 'domains',
      icon: 'fas fa-globe',
      label: 'Domain Saya',
      route: '/dashboard/domains'
    }, {
      id: 'support',
      icon: 'fas fa-headset',
      label: 'Support',
      route: '/dashboard/support'
    }];
    const menuHtml = menuItems.map(item => {
      let badge = '';
      if (item.badge === 'cart-badge') {
        badge = '<span class="menu-badge cart-badge-count" style="display: none;">0</span>';
      } else if (item.badge === 'wishlist-badge') {
        badge = '<span class="menu-badge wishlist-badge-count" style="display: none; background-color: #ef4444;">0</span>';
      } else if (item.badge) {
        badge = '<span class="menu-badge">' + item.badge + '</span>';
      }
      const href = item.isExternal ? item.route : '#!' + item.route;
      const activeClass = this.currentRoute === item.route ? 'active' : '';
      const extAttr = item.isExternal ? 'data-external="true"' : '';
      return '<a href="' + href + '" class="menu-item ' + activeClass + '" data-route="' + item.route + '" ' + extAttr + ' title="' + item.label + '">' + '<span class="menu-icon ' + item.icon + '"></span>' + '<span class="menu-label">' + item.label + '</span>' + badge + '</a>';
    }).join('');
    container.innerHTML = `
      <div class="sidebar-brand-container">
        <a href="#!/dashboard/" class="sidebar-logo">
          <img src="/assets/img/logo/logo512x512.webp" alt="SISITUS" class="sidebar-logo-img">
          <span class="sidebar-logo-text">SISITUS</span>
        </a>
      </div>

      <div class="sidebar-menu-header">MENU UTAMA</div>

      <nav class="sidebar-menu">
        ${menuHtml}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-info">
          <small class="sidebar-info__title">SISITUS Client Dashboard</small>
          <small class="sidebar-info__meta">Akses cepat &bull; aman &bull; terintegrasi</small>
        </div>
      </div>
    `;
    container.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (item.dataset.external === 'true') {
          return;
        }
        e.preventDefault();
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
        const route = item.dataset.route;
        window.location.hash = '#!' + route;
      });
    });
    this.updateCartBadge();
    window.addEventListener('cart:updated', () => this.updateCartBadge());
    this.updateWishlistBadge();
    window.addEventListener('wishlist:updated', () => this.updateWishlistBadge());
  }
  async updateCartBadge() {
    try {
      const {
        CartManager
      } = await import('/assets/js/modules/unified-cart.js');
      const cartSummary = CartManager.getSummary();
      const badge = document.querySelector('.cart-badge-count');
      if (badge) {
        if (cartSummary.itemCount > 0) {
          badge.textContent = cartSummary.itemCount;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
    } catch (err) {}
  }
  async updateWishlistBadge() {
    try {
      const {
        WishlistManager
      } = await import('/assets/js/modules/unified-cart.js');
      const count = WishlistManager.getWishlist().domains?.length || 0;
      const badge = document.querySelector('.wishlist-badge-count');
      if (badge) {
        if (count > 0) {
          badge.textContent = count;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
    } catch (err) {}
  }
  setActive(route) {
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    const activeItem = document.querySelector('[data-route="' + route + '"]');
    if (activeItem) {
      activeItem.classList.add('active');
    }
    this.currentRoute = route;
  }
}