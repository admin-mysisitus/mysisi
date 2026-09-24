const App = {
  getDashboardRenderer() {
    const renderers = {
      [AppConfig.ROLES.ADMIN]: AdminPages.renderDashboard,
      [AppConfig.ROLES.GURU]: GuruPages.renderDashboard,
      [AppConfig.ROLES.KEPSEK]: KepsekPages.renderDashboard,
      [AppConfig.ROLES.ORTU]: OrtuPages.renderDashboard
    };

    return renderers[Auth.currentRole] || null;
  },

  init() {
    const menuButton = document.getElementById('btn-menu-toggle');
    const closeButton = document.getElementById('btn-menu-close');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    const toggleMenu = () => {
      if (!sidebar || !backdrop) return;
      sidebar.classList.toggle('active');
      backdrop.classList.toggle('active');
    };

    if (menuButton) menuButton.addEventListener('click', toggleMenu);
    if (closeButton) closeButton.addEventListener('click', toggleMenu);
    if (backdrop) backdrop.addEventListener('click', toggleMenu);

    Router.init();
    Router.add('#/dashboard', async (container) => {
      const renderer = this.getDashboardRenderer();
      if (renderer) {
        await renderer.call(null, container);
        return;
      }

      container.innerHTML = '<p class="text-center text-muted">Role tidak valid.</p>';
    });

    Auth.init();
  },

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});