/**
 * Authentication Module
 * Handles: Google OAuth, Email/Password auth, User session management
 * Used by: /auth/index.html, /checkout/index.html (auth section)
 * Version: 2.0 (Consolidated)
 */

import { GAS_CONFIG } from '../config/api.config.js';
import { showSuccess, showError } from '../utils/notifications.js';

// ============================================================================
// AUTH STATE
// ============================================================================

let userAuth = {
  isLoggedIn: false,
  userId: null,
  displayName: '',
  email: '',
  photoURL: '',
  whatsapp: '',
  authMethod: null // 'google' or 'email'
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  initializeAuth();
  setupAuthTabs();
  setupAuthForms();
});

function initializeAuth() {
  // Check if user already logged in (from sessionStorage)
  const savedUser = sessionStorage.getItem('sisitus_user');
  if (savedUser) {
    try {
      userAuth = JSON.parse(savedUser);
      showLoggedInState();
    } catch (e) {
      console.error('Error restoring user session:', e);
      sessionStorage.removeItem('sisitus_user');
    }
  }

  // Initialize Google Sign-In
  if (typeof google !== 'undefined') {
    try {
      google.accounts.id.initialize({
        client_id: '1077896753927-npj3ma45dsqrgqmp9bcrioumk6lneo60.apps.googleusercontent.com', // REPLACE THIS
        callback: handleGoogleSignIn,
        auto_select: false
      });

      // Render button on dedicated auth page if element exists
      const googleButton = document.getElementById('g_id_onload');
      if (googleButton) {
        google.accounts.id.renderButton(
          document.querySelector('.g_id_signin'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signup_with',
            locale: 'id'
          }
        );
      }
    } catch (e) {
      console.warn('Google Sign-In not available:', e);
    }
  }
}

function setupAuthTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const tabName = this.dataset.tab;
      const forms = document.querySelectorAll('.auth-form');
      const buttons = document.querySelectorAll('.tab-btn');

      forms.forEach(form => form.classList.remove('active'));
      buttons.forEach(b => b.classList.remove('active'));

      if (tabName === 'register') {
        document.getElementById('register-form').classList.add('active');
      } else {
        document.getElementById('login-form').classList.add('active');
      }
      this.classList.add('active');
    });
  });
}

function setupAuthForms() {
  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
}

// ============================================================================
// REGISTER HANDLER
// ============================================================================

async function handleRegister(e) {
  e.preventDefault();

  const form = e.target;
  const errorEl = document.getElementById('auth-error');
  const successEl = document.getElementById('auth-success');

  // Clear previous messages
  errorEl?.classList.remove('show');
  successEl?.classList.remove('show');

  try {
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    const passwordConfirm = form.querySelector('input[name="passwordConfirm"]').value;
    const displayName = form.querySelector('input[name="displayName"]').value.trim();
    const whatsapp = form.querySelector('input[name="whatsapp"]')?.value.trim() || '';

    // Validation
    if (!email || !password || !displayName) {
      throw new Error('Silakan isi semua field yang diperlukan');
    }

    if (password.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }

    if (password !== passwordConfirm) {
      throw new Error('Password dan konfirmasi password tidak sesuai');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email tidak valid');
    }

    // Call GAS registerUser
    const response = await callGAS('registerUser', {
      email,
      password,
      displayName,
      whatsapp
    });

    if (response.success) {
      // Show success message
      if (successEl) {
        successEl.textContent = response.message || 'Akun berhasil dibuat! Silakan verifikasi email Anda.';
        successEl.classList.add('show');
      }

      showSuccess('Registrasi Berhasil', response.message || 'Email verifikasi sudah dikirim. Cek inbox Anda.');

      // Reset form
      form.reset();

      // Redirect after delay
      setTimeout(() => {
        window.location.href = '/auth/verify-email.html';
      }, 2000);
    } else {
      throw new Error(response.message || 'Terjadi kesalahan saat mendaftar');
    }
  } catch (error) {
    console.error('Register error:', error);
    const message = error.message || 'Terjadi kesalahan saat mendaftar';
    
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
    
    showError('Registrasi Gagal', message);
  }
}

// ============================================================================
// LOGIN HANDLER
// ============================================================================

async function handleLogin(e) {
  e.preventDefault();

  const form = e.target;
  const errorEl = document.getElementById('auth-error');
  const successEl = document.getElementById('auth-success');

  // Clear previous messages
  errorEl?.classList.remove('show');
  successEl?.classList.remove('show');

  try {
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;

    if (!email || !password) {
      throw new Error('Silakan isi email dan password');
    }

    // Call GAS loginUser
    const response = await callGAS('loginUser', {
      email,
      password
    });

    if (response.success && response.data) {
      // Save user session
      userAuth = {
        isLoggedIn: true,
        userId: response.data.userId,
        displayName: response.data.displayName,
        email: response.data.email,
        photoURL: response.data.photoURL || '',
        whatsapp: response.data.whatsapp || '',
        authMethod: 'email'
      };

      sessionStorage.setItem('sisitus_user', JSON.stringify(userAuth));

      if (successEl) {
        successEl.textContent = response.message || `Selamat datang, ${userAuth.displayName}!`;
        successEl.classList.add('show');
      }

      showSuccess('Login Berhasil', `Selamat datang kembali, ${userAuth.displayName}!`);

      // Reset form
      form.reset();

      // Redirect to checkout or profile
      setTimeout(() => {
        const returnTo = sessionStorage.getItem('auth_return_to') || '/checkout';
        window.location.href = returnTo;
      }, 1500);
    } else {
      throw new Error(response.message || 'Email atau password salah');
    }
  } catch (error) {
    console.error('Login error:', error);
    const message = error.message || 'Terjadi kesalahan saat login';
    
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
    
    showError('Login Gagal', message);
  }
}

// ============================================================================
// GOOGLE SIGN-IN HANDLER
// ============================================================================

window.handleGoogleSignIn = async function(response) {
  if (response.clientId && response.credential) {
    try {
      // Verify token dengan GAS
      const result = await callGAS('verifyGoogleToken', {
        token: response.credential
      });

      if (result.success && result.data) {
        // Save user session
        userAuth = {
          isLoggedIn: true,
          userId: result.data.userId,
          displayName: result.data.displayName,
          email: result.data.email,
          photoURL: result.data.photoURL || '',
          whatsapp: result.data.whatsapp || '',
          authMethod: 'google'
        };

        sessionStorage.setItem('sisitus_user', JSON.stringify(userAuth));

        showSuccess('Login Berhasil', `Selamat datang, ${userAuth.displayName}!`);

        // Redirect to checkout or previous page
        setTimeout(() => {
          const returnTo = sessionStorage.getItem('auth_return_to') || '/checkout';
          window.location.href = returnTo;
        }, 1500);
      } else {
        throw new Error(result.message || 'Token tidak valid');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      showError('Google Sign-In Gagal', error.message || 'Terjadi kesalahan saat login dengan Google');
    }
  }
};

// ============================================================================
// LOGOUT HANDLER
// ============================================================================

export function handleLogout() {
  userAuth = {
    isLoggedIn: false,
    userId: null,
    displayName: '',
    email: '',
    photoURL: '',
    whatsapp: '',
    authMethod: null
  };

  sessionStorage.removeItem('sisitus_user');
  showSuccess('Logout Sukses', 'Anda telah berhasil logout');

  // Redirect to home
  setTimeout(() => {
    window.location.href = '/';
  }, 1500);
}

// ============================================================================
// LOGGED-IN STATE
// ============================================================================

function showLoggedInState() {
  const authSection = document.getElementById('auth-section-not-logged-in');
  const checkoutAuth = document.querySelector('.checkout-auth-section');

  if (authSection) authSection.style.display = 'none';
  if (checkoutAuth) checkoutAuth.style.display = 'none';

  // Show next step based on context
  const nextStep = document.getElementById('cek-domain-section');
  if (nextStep) {
    nextStep.style.display = 'block';
  }
}

// ============================================================================
// GAS API CALL
// ============================================================================

async function callGAS(action, params) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const queryParams = new URLSearchParams({
      action,
      ...params
    });

    const response = await fetch(`${GAS_CONFIG.URL}?${queryParams}`, {
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`GAS call failed (${action}):`, error);

    if (error.name === 'AbortError') {
      throw new Error('Server tidak merespons. Silakan coba lagi.');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export function isUserLoggedIn() {
  return userAuth.isLoggedIn;
}

export function getCurrentUser() {
  return userAuth;
}

export function redirectToLogin(returnTo = window.location.pathname) {
  sessionStorage.setItem('auth_return_to', returnTo);
  window.location.href = '/auth/';
}
