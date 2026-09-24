const Auth = {
  currentUser: null,
  currentRole: null,
  userData: null,

  init() {
    if (!auth) return;

    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        try {
          const userData = await DB.getUser(user.uid);
          if (!userData) {
            await this.logout();
            return;
          }

          this.userData = userData;
          this.currentRole = userData.role;
          this.updateProfileUI();

          const appShell = document.getElementById('app-shell');
          const loginView = document.getElementById('login-view');
          if (appShell) appShell.classList.remove('hidden');
          if (loginView) loginView.classList.add('hidden');

          if (!location.hash || location.hash === '#/login') {
            window.location.hash = '#/dashboard';
            return;
          }

          Router.handleRoute();
        } catch (error) {
          console.error('Auth initialization failed:', error);
          await this.logout();
        }
        return;
      }

      this.currentUser = null;
      this.currentRole = null;
      this.userData = null;

      const appShell = document.getElementById('app-shell');
      const loginView = document.getElementById('login-view');
      const loading = document.getElementById('app-loading');

      if (appShell) appShell.classList.add('hidden');
      if (loginView) loginView.classList.remove('hidden');
      if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
          loading.classList.add('hidden');
        }, 300);
      }
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await this.login();
      });
    }

    const toggleButton = document.getElementById('toggle-password');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.togglePasswordVisibility());
    }

    const logoutButton = document.getElementById('btn-logout');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        await this.logout();
      });
    }
  },

  async login() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const btn = document.getElementById('btn-login');
    const err = document.getElementById('login-error');

    if (!emailInput || !passwordInput || !btn || !err) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    btn.disabled = true;
    btn.querySelector('.btn-text').innerText = 'Loading...';
    err.classList.add('hidden');

    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      err.innerText = 'Email atau password salah.';
      err.classList.remove('hidden');
      btn.disabled = false;
      btn.querySelector('.btn-text').innerText = 'Masuk';
    }
  },

  togglePasswordVisibility() {
    const passInput = document.getElementById('password');
    const icon = document.getElementById('toggle-password-icon');
    if (!passInput || !icon) return;

    const isPasswordHidden = passInput.type === 'password';
    passInput.type = isPasswordHidden ? 'text' : 'password';
    icon.classList.toggle('ph-eye', !isPasswordHidden);
    icon.classList.toggle('ph-eye-slash', isPasswordHidden);
  },

  async logout() {
    if (auth) await auth.signOut();
    window.location.hash = '';
  },

  updateProfileUI() {
    if (!this.userData) return;

    const userName = document.getElementById('current-user-name');
    const userRole = document.getElementById('current-user-role');
    const avatarWrap = document.querySelector('.avatar');

    if (userName) userName.innerText = this.userData.name || 'Pengguna';
    if (userRole) userRole.innerText = AppConfig.getRoleLabel(this.currentRole);

    if (avatarWrap) {
      const photoUrl = this.userData.photoURL || '';
      if (photoUrl) {
        const normalizedUrl = DriveBridge.normalizeDriveImageUrl(photoUrl, 'w200', '');
        if (normalizedUrl) {
          avatarWrap.innerHTML = `<img src="${normalizedUrl}" alt="${this.userData.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'ph ph-user\'></i>'">`;
        }
      }
    }

    this.buildSidebar();
  },

  buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    nav.innerHTML = '';
    const links = AppConfig.getRoleNav(this.currentRole);

    links.forEach((link) => {
      const item = document.createElement('a');
      item.href = link.hash;
      item.className = 'btn-nav';
      item.innerHTML = `<i class="ph ${link.icon}"></i><span>${link.text}</span>`;
      nav.appendChild(item);
    });

    const loading = document.getElementById('app-loading');
    if (loading) {
      loading.style.opacity = '0';
      setTimeout(() => loading.classList.add('hidden'), 300);
    }
  }
};
