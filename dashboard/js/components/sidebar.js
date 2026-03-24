/**
 * Dashboard Sidebar Navigation Component
 */

export class DashboardSidebar {
  constructor(router) {
    this.router = router;
    this.currentRoute = null;
  }

  render(currentRoute = '/dashboard/') {
    this.currentRoute = currentRoute;
    const container = document.getElementById('sidebar');

    const menuItems = [
      {
        id: 'dashboard',
        icon: 'icon-home',
        label: 'Dashboard',
        route: '/dashboard/'
      },
      {
        id: 'profile',
        icon: 'icon-user',
        label: 'Profil',
        route: '/dashboard/profile'
      },
      {
        id: 'orders',
        icon: 'icon-shopping',
        label: 'Pesanan',
        route: '/dashboard/orders'
      },
      {
        id: 'checkout',
        icon: 'icon-plus-circle',
        label: 'Beli Domain',
        route: '/dashboard/checkout'
      },
      {
        id: 'invoices',
        icon: 'icon-file-text',
        label: 'Invoice',
        route: '/dashboard/invoices',
        badge: ''
      },
      {
        id: 'domains',
        icon: 'icon-globe',
        label: 'Domain Saya',
        route: '/dashboard/domains'
      },
      {
        id: 'support',
        icon: 'icon-headphones',
        label: 'Support',
        route: '/dashboard/support'
      }
    ];

    container.innerHTML = `
      <div class="sidebar-header">
        <h2>Menu</h2>
      </div>
      
      <nav class="sidebar-menu">
        ${menuItems.map(item => `
          <a 
            href="#!${item.route}" 
            class="menu-item ${this.currentRoute === item.route ? 'active' : ''}"
            data-route="${item.route}"
            title="${item.label}"
          >
            <span class="menu-icon ${item.icon}"></span>
            <span class="menu-label">${item.label}</span>
            ${item.badge ? `<span class="menu-badge">${item.badge}</span>` : ''}
          </a>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-info">
          <small>SISITUS Client Dashboard</small>
          <small>v1.0</small>
        </div>
      </div>
    `;

    // Add click handlers
    container.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.dataset.route;
        this.router.navigate(route);
      });
    });
  }

  /**
   * Set active menu item
   */
  setActive(route) {
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    const activeItem = document.querySelector(`[data-route="${route}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
    this.currentRoute = route;
  }
}
