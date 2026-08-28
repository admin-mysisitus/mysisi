/**
 * REFACTORED PUBLIC AUTHENTICATION PAGE
 * ===================================
 * Uses SharedAuthForm to eliminate duplicate UI/logic.
 * Clean, minimal, and fully centralized.
 */
import {
  AuthManager
} from '../modules/unified-auth.js';
import {
  SharedAuthForm
} from '../modules/shared-auth-form.js';
import {
  showSuccess,
  showError
} from '../modules/unified-utils.js';
// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initAuthPage();
});

function initAuthPage() {
  // Handle error query params
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
    // Clean up URL without reloading
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  if (AuthManager.isLoggedIn()) {
    showLoggedInState();
  } else {
    showAuthForms();
  }
  // Listen for auth state changes
  document.addEventListener('auth:authChanged', (e) => {
    const user = e.detail;
    if (user) {
      showLoggedInState();
    } else {
      showAuthForms();
    }
  });
}
// ============================================================================
// LOGGED IN STATE
// ============================================================================
function showLoggedInState() {
  const formsSection = document.getElementById('auth-form-container');
  const loggedInSection = document.getElementById('auth-loggedin-section');
  if (formsSection) formsSection.style.display = 'none';
  if (loggedInSection) loggedInSection.style.display = 'block';
  const user = AuthManager.getCurrentUser();
  if (user) {
    document.getElementById('loggedin-name').textContent = user.displayName || 'Pengguna';
    document.getElementById('loggedin-email').textContent = user.email || '';
    const photoEl = document.getElementById('loggedin-photo');
    if (photoEl) {
      photoEl.src = user.photoURL || AuthManager.getDefaultAvatar();
      photoEl.onerror = () => {
        photoEl.src = AuthManager.getDefaultAvatar();
      };
    }
  }
  // Setup logout button
  const logoutBtn = document.getElementById('loggedin-logout-btn');
  if (logoutBtn && !logoutBtn.hasListener) {
    logoutBtn.addEventListener('click', () => {
      AuthManager.clearSession();
      showSuccess('Logout Berhasil', 'Anda telah keluar dari akun Anda.');
    });
    logoutBtn.hasListener = true;
  }
}
// ============================================================================
// AUTH FORMS (LOGIN/REGISTER)
// ============================================================================
function showAuthForms() {
  const formsSection = document.getElementById('auth-form-container');
  const loggedInSection = document.getElementById('auth-loggedin-section');
  if (loggedInSection) loggedInSection.style.display = 'none';
  if (formsSection) {
    formsSection.style.display = 'block';
    // Instantiate SharedAuthForm only if it hasn't been instantiated yet
    if (!formsSection.hasChildNodes()) {
      const authForm = new SharedAuthForm({
        containerId: 'auth-form-container',
        inlineMode: false,
        showGoogleSignIn: true,
        showPrivacyNotice: true,
        // Optional callbacks - if empty, SharedAuthForm handles default redirects
        onLoginSuccess: (user) => {
          showLoggedInState();
          // Let default redirect behavior happen
          setTimeout(() => {
            window.location.href = user.role === 'admin' ? '/admin/' : '/dashboard/';
          }, 1500);
        }
      });
      authForm.render();
    }
  }
}