import {
  AuthManager
} from '../modules/unified-auth.js';
import {
  SharedAuthForm
} from '../modules/shared-auth-form.js';
import {
  showSuccess,
  showError,
  renderUserAvatarHtml,
  EnvHelper,
  Base64Utils
} from '../modules/unified-utils.js';
import {
  CartManager,
  WishlistManager
} from '../modules/unified-cart.js';
document.addEventListener('DOMContentLoaded', () => {
  initAuthPage();
});

function initAuthPage() {
  const hash = window.location.hash;
  if (hash.startsWith('#handoff=')) {
    try {
      const base64Payload = hash.substring(9);
      const jsonStr = Base64Utils.decode(base64Payload);
      const payload = JSON.parse(jsonStr);
      if (payload.cart) CartManager.mergeCart(payload.cart);
      if (payload.wishlist) WishlistManager.mergeWishlist(payload.wishlist);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      console.log('[Auth] Guest Handoff successful');
    } catch (e) {
      console.log('[Auth] Failed to parse guest handoff:', e);
    }
  }
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get('error');
  if (errorParam) {
    if (errorParam === 'unauthorized') {
      showError('Akses Ditolak', 'Anda tidak memiliki hak akses ke halaman tersebut. Silakan login kembali.');
    } else if (errorParam === 'suspended') {
      showError('Akun Ditangguhkan', 'Akun Anda sedang ditangguhkan. Silakan hubungi tim dukungan kami.');
    } else {
      showError('Autentikasi Gagal', 'Silakan login kembali untuk melanjutkan.');
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  if (AuthManager.isLoggedIn()) {
    showLoggedInState();
  } else {
    showAuthForms();
  }
  document.addEventListener('auth:authChanged', (e) => {
    const user = e.detail;
    if (user) {
      showLoggedInState();
    } else {
      showAuthForms();
    }
  });
}

function showLoggedInState() {
  const formsSection = document.getElementById('auth-form-container');
  const loggedInSection = document.getElementById('auth-loggedin-section');
  if (formsSection) formsSection.style.display = 'none';
  if (loggedInSection) loggedInSection.style.display = 'block';
  const user = AuthManager.getCurrentUser();
  const urlParams = new URLSearchParams(window.location.search);
  const redirectPath = urlParams.get('redirect');
  if (redirectPath) {
    const safeRedirect = redirectPath.startsWith('/') ? redirectPath : '/';
    window.location.href = user && user.role === 'admin' ? EnvHelper.getDomainUrl('backstage', '/') : EnvHelper.getDomainUrl('my', safeRedirect);
    return;
  }
  if (user) {
    document.getElementById('loggedin-name').textContent = user.displayName || 'Pengguna';
    document.getElementById('loggedin-email').textContent = user.email || '';
    const photoWrapper = document.querySelector('.profile-photo-wrapper');
    if (photoWrapper) {
      photoWrapper.innerHTML = renderUserAvatarHtml(user, 'w200', 'profile-photo');
    }
    const dashboardBtn = document.querySelector('#auth-loggedin-section a[href="/dashboard/"]');
    if (dashboardBtn) {
      dashboardBtn.href = user.role === 'admin' ? window.location.origin + '/' : '/dashboard/';
    }
    const profileBtn = document.querySelector('#auth-loggedin-section a[href="/dashboard/#!/dashboard/profile"]');
    if (profileBtn) {
      profileBtn.href = user.role === 'admin' ? window.location.origin + '/#!/profile' : '/dashboard/#!/dashboard/profile';
    }
  }
  const logoutBtn = document.getElementById('loggedin-logout-btn');
  if (logoutBtn && !logoutBtn.hasListener) {
    logoutBtn.addEventListener('click', () => {
      AuthManager.clearSession();
      showSuccess('Logout Berhasil', 'Anda telah keluar dari akun Anda.');
    });
    logoutBtn.hasListener = true;
  }
}

function showAuthForms() {
  const formsSection = document.getElementById('auth-form-container');
  const loggedInSection = document.getElementById('auth-loggedin-section');
  if (loggedInSection) loggedInSection.style.display = 'none';
  if (formsSection) {
    formsSection.style.display = 'block';
    if (!formsSection.hasChildNodes()) {
      const authForm = new SharedAuthForm({
        containerId: 'auth-form-container',
        inlineMode: false,
        showGoogleSignIn: true,
        showPrivacyNotice: true,
        onLoginSuccess: (user) => {
          showLoggedInState();
          setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPath = urlParams.get('redirect');
            if (redirectPath) {
              const safeRedirect = redirectPath.startsWith('/') ? redirectPath : '/';
              window.location.href = user.role === 'admin' ? EnvHelper.getDomainUrl('backstage', '/') : EnvHelper.getDomainUrl('my', safeRedirect);
            } else {
              window.location.href = user.role === 'admin' ? EnvHelper.getDomainUrl('backstage', '/') : EnvHelper.getDomainUrl('my', '/dashboard/');
            }
          }, 1500);
        }
      });
      authForm.render();
    }
  }
}