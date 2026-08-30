import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
import {
  renderUserAvatarHtml
} from '/assets/js/modules/unified-utils.js';
export class AdminNavbar {
  constructor() {
    this.container = document.getElementById('admin-navbar');
    this.authListenerBound = false;
  }
  render() {
    if (!this.container) return;
    // Get real user data from AuthManager
    const userData = AuthManager.getCurrentUser();
    let displayName = 'Administrator';
    let avatarHtml = renderUserAvatarHtml(userData, 'w150', 'admin-avatar');
    if (userData && userData.displayName) {
      displayName = userData.displayName;
    }
    this.container.innerHTML = `
      <div class="admin-navbar-left">
        <button id="admin-menu-toggle" class="admin-menu-toggle">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      
      <div class="admin-nav-actions">
        <button class="admin-btn" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-text-main); padding: 8px 12px;">
          <i class="fas fa-bell"></i>
        </button>
        
        <div class="admin-profile-btn" id="admin-profile-trigger">
          ${avatarHtml}
          <span style="font-weight: 500; font-size: 0.9rem; padding-right: 8px;">${displayName}</span>
        </div>
      </div>
    `;
    // Profile click to go to profile settings
    const profileBtn = document.getElementById('admin-profile-trigger');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        window.location.hash = '#!/profile';
      });
    }
    // Setup Sidebar Toggle Logic for Mobile
    const menuToggle = document.getElementById('admin-menu-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (menuToggle && sidebar && overlay) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('show');
      });
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
    if (!this.authListenerBound) {
      this.authListenerBound = true;
      document.addEventListener('auth:authChanged', (e) => {
        if (e.detail) {
          this.render();
        }
      });
    }
  }
  setTitle(title) {
    const titleEl = document.getElementById('admin-top-title');
    if (titleEl) {
      titleEl.textContent = title;
    }
  }
}