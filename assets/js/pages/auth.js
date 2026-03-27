/**
 * REFACTORED PUBLIC AUTHENTICATION PAGE
 * ===================================
 * Replace /assets/js/pages/auth.js with this clean, unified version
 * 
 * Uses:
 * - AuthManager: Centralized session state
 * - APIClient: Unified API calls
 * - Utils: Notifications & validation
 * 
 * Features:
 * - Email/Password registration & login
 * - Google OAuth integration
 * - Email verification with auto-login
 * - Clean error handling
 * - Loading states
 * - Multi-tab auth sync
 */

import { AuthManager } from '../modules/unified-auth.js';
import APIClient from '../modules/unified-api.js';
import {
  showSuccess,
  showError,
  showLoading,
  hideLoading,
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
  setButtonLoading,
  handleAPIError
} from '../modules/unified-utils.js';

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', initPage);

function initPage() {


  // 1. Check for email verification token (highest priority)
  const urlParams = new URLSearchParams(window.location.search);
  const verifyToken = urlParams.get('verify');

  if (verifyToken) {

    handleEmailVerification(verifyToken);
    return; // Stop further initialization
  }

  // 2. If already logged in, redirect to dashboard
  if (AuthManager.isLoggedIn()) {

    window.location.href = '/dashboard/';
    return; // Stop further initialization
  }

  // 3. Initialize auth forms & UI
  setupAuthTabs();
  setupAuthForms();
  initializeGoogleSignIn();


}

// ============================================================================
// EMAIL VERIFICATION (Auto-login after registration)
// ============================================================================

/**
 * Handle email verification token from registration link
 */
async function handleEmailVerification(token) {
  const wrapper = document.querySelector('.auth-wrapper');

  try {
    // Show loading UI
    if (wrapper) {
      wrapper.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <h2 style="margin-bottom: 20px;">🔐 Verifikasi Email</h2>
          <p style="font-size: 16px; margin-bottom: 30px; color: #666;">
            ⏳ Sedang memverifikasi email Anda...
          </p>
          <div style="display: inline-block;">
            <div style="width: 50px; height: 50px; border: 4px solid #e0e0e0; border-top: 4px solid #2563EB; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </div>
      `;
    }

    // Call GAS to verify token
    const response = await APIClient.verifyEmailToken(token);

    if (!response.success) {
      throw new Error(response.message || 'Verifikasi email gagal');
    }

    if (!response.data) {
      throw new Error('Data user tidak ditemukan dalam response');
    }

    // Save session (auto-login)
    AuthManager.saveSession(response.data);

    // Show success message
    if (wrapper) {
      wrapper.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 60px; margin-bottom: 20px;">✓</div>
          <h2 style="color: #27ae60; margin-bottom: 10px;">Email Terverifikasi!</h2>
          <p style="font-size: 18px; color: #333; margin-bottom: 5px;">
            Selamat datang, <strong>${response.data.displayName}</strong>!
          </p>
          <p style="color: #666; margin-top: 20px;">
            Anda akan diarahkan ke dashboard dalam beberapa detik...
          </p>
          <div style="margin-top: 30px;">
            <div style="width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top: 4px solid #27ae60; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
          </div>
        </div>
      `;
    }

    showSuccess('✓ Email Terverifikasi!', `Selamat datang, ${response.data.displayName}!`);

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      window.location.href = '/dashboard/';
    }, 2000);
  } catch (error) {

    // Show error UI
    if (wrapper) {
      wrapper.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 60px; margin-bottom: 20px;">✗</div>
          <h2 style="color: #e74c3c; margin-bottom: 10px;">Verifikasi Gagal</h2>
          <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
            ${error.message || 'Terjadi kesalahan saat memverifikasi email'}
          </p>
          <p style="font-size: 14px; color: #999; margin-bottom: 30px;">
            Link verifikasi mungkin sudah expired atau tidak valid.
          </p>
          <a href="/auth/" style="display: inline-block; background-color: #2563EB; color: white; padding: 10px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Kembali ke Login
          </a>
        </div>
      `;
    }

    handleAPIError(error);
  }
}

// ============================================================================
// REGISTRATION FORM
// ============================================================================

/**
 * Handle registration form submission
 */
async function handleRegister(e) {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');

  try {
    // Get form values
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    const passwordConfirm = form.querySelector('input[name="passwordConfirm"]').value;
    const whatsapp = form.querySelector('input[name="whatsapp"]')?.value.trim() || '';
    const displayName = email.split('@')[0]; // Auto-generate from email

    // Validate input
    if (!isValidEmail(email)) {
      throw new Error('Email tidak valid');
    }

    if (!password) {
      throw new Error('Password diperlukan');
    }

    const pwdValidation = isValidPassword(password);
    if (!pwdValidation.valid) {
      throw new Error(pwdValidation.message);
    }

    if (password !== passwordConfirm) {
      throw new Error('Password dan konfirmasi password tidak sesuai');
    }

    if (whatsapp && !isValidPhoneNumber(whatsapp)) {
      throw new Error('Nomor WhatsApp tidak valid (format: 08xxxxxxxxxx, +62xxxxxxxxxx, atau 62xxxxxxxxxx)');
    }

    // Show loading state
    setButtonLoading(btn, true, '⏳ Mendaftar...');

    // Call API
    const response = await APIClient.registerUser(email, password, displayName, whatsapp);

    if (!response.success) {
      throw new Error(response.message || 'Registrasi gagal, silakan coba lagi');
    }

    // Show success message
    showSuccess(
      '✓ Registrasi Berhasil!',
      `Email verifikasi telah dikirim ke ${email}\n\nSilakan cek folder Inbox atau Spam Anda`
    );

    // Clear form
    form.reset();

    // Redirect to login tab after 3 seconds
    setTimeout(() => {
      switchTab('login');
    }, 3000);

  } catch (error) {
    handleAPIError(error);
    setButtonLoading(btn, false);
  }
}

// ============================================================================
// LOGIN FORM
// ============================================================================

/**
 * Handle login form submission
 */
async function handleLogin(e) {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');

  try {
    // Get form values
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;

    // Validate
    if (!email || !password) {
      throw new Error('Email dan password diperlukan');
    }

    if (!isValidEmail(email)) {
      throw new Error('Email tidak valid');
    }

    // Show loading state
    setButtonLoading(btn, true, '⏳ Login...');

    // Call API
    const response = await APIClient.loginUser(email, password);

    if (!response.success) {
      throw new Error(response.message || 'Login gagal');
    }

    if (!response.data) {
      throw new Error('Data user tidak ditemukan');
    }

    // Save session
    AuthManager.saveSession(response.data);

    // Show success message
    showSuccess(
      '✓ Login Berhasil!',
      `Selamat datang kembali, ${response.data.displayName}!`
    );

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard/';
    }, 1500);
  } catch (error) {
    handleAPIError(error);
    setButtonLoading(btn, false);
  }
}

// ============================================================================
// GOOGLE SIGN-IN
// ============================================================================

/**
 * Handle Google OAuth response
 */
window.handleGoogleSignIn = async function(response) {
  if (!response.credential) {
    console.warn('[Auth Google] No credential in response');
    return;
  }

  try {

    showLoading('Google Sign-In', 'Memproses...');

    // Verify token with GAS
    const result = await APIClient.verifyGoogleToken(response.credential);

    if (!result.success) {
      throw new Error(result.message || 'Google Sign-In gagal');
    }

    if (!result.data) {
      throw new Error('Data user tidak ditemukan');
    }

    // Save session
    AuthManager.saveSession(result.data);

    hideLoading();
    showSuccess(
      '✓ Google Login Sukses!',
      `Selamat datang, ${result.data.displayName}!`
    );

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard/';
    }, 1500);
  } catch (error) {
    hideLoading();
    handleAPIError(error);
  }
};

/**
 * Initialize Google Sign-In button
 */
function initializeGoogleSignIn() {
  try {
    if (typeof google === 'undefined') {
      console.warn('[Auth Google] Google SDK not loaded');
      return;
    }



    google.accounts.id.initialize({
      client_id: '1077896753927-npj3ma45dsqrgqmp9bcrioumk6lneo60.apps.googleusercontent.com',
      callback: window.handleGoogleSignIn,
      auto_select: false
    });

    // Find and render Google button
    const googleBtnContainer = document.querySelector('.google-signin-container');
    if (googleBtnContainer) {
      google.accounts.id.renderButton(googleBtnContainer, {
        theme: 'outline',
        size: 'large',
        text: 'signup_with',
        locale: 'id'
      });
    }
  } catch (error) {
    console.warn('[Auth Google] Error initializing:', error);
  }
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Setup auth tab switching
 */
function setupAuthTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = btn.dataset.tab;
      switchTab(tabName);
    });
  });
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
  // Update active tab button
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update active form
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.toggle('active', form.id === `${tabName}-form`);
  });
}

/**
 * Setup form event listeners
 */
function setupAuthForms() {
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);

  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);

  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  handleRegister,
  handleLogin,
  handleEmailVerification
};
