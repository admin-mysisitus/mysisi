/**
 * UNIFIED AUTH MANAGER
 * ===================================
 * Single source of truth untuk authentication state
 * - Centralized session management
 * - Event-driven updates
 * - Automatic multi-tab sync
 * - Session timeout support
 * - No duplication with dashboard module
 * 
 * Usage:
 *   AuthManager.login(email, password)
 *   AuthManager.logout()
 *   AuthManager.isLoggedIn()
 *   AuthManager.getCurrentUser()
 *   AuthManager.on('authChanged', handler)
 */
import {
  getFirebase
} from './firebase-core.js';
import APIClient from './unified-api.js';
import { CartManager, WishlistManager } from './unified-cart.js';
export class AuthManager {
  static SESSION_KEY = 'sisitus_user';
  static SESSION_VERSION = 2;
  static SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  static STORAGE_TYPE = 'localStorage'; // Use localStorage for cross-tab persistence
  // State
  static state = {
    user: null,
    isLoggedIn: false,
    lastActivity: null,
    expiresAt: null
  };
  // Event listeners
  static listeners = {
    authChanged: [],
    authError: [],
    sessionExpired: []
  };
  /**
   * Initialize auth manager
   * - Check if user is logged in
   * - Setup session timeout
   * - Setup storage listener
   */
  static async init() {
    this.loadSession();
    try {
      const {
        auth,
        db
      } = await getFirebase();
      if (auth) {
        auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            let profile = null;
            if (db) {
              try {
                const userRef = db.ref(`users/${firebaseUser.uid}`);
                const snap = await userRef.once('value');
                profile = snap.val();
                // Pasang Realtime Listener untuk deteksi suspend dan demosi instan
                userRef.on('value', (rtSnap) => {
                  const rtProfile = rtSnap.val();
                  if (rtProfile) {
                    if (rtProfile.status === 'suspended') {
                      void('[AuthManager] Realtime Account Suspended, forcing logout');
                      auth.signOut();
                      this.clearSession();
                      if (window.location.hostname === 'backstage.sisitus.com' || window.location.pathname.includes('/admin/') || window.location.pathname.includes('/dashboard/')) {
                        window.location.href = '/auth/?error=suspended';
                      }
                      return;
                    }
                    // Deteksi penurunan role secara realtime saat sedang di dasbor admin
                    if (rtProfile.role !== 'admin' && (window.location.hostname === 'backstage.sisitus.com' || window.location.pathname.includes('/admin/'))) {
                      void('[AuthManager] Realtime Role Demoted, forcing exit from admin');
                      // Bawa dia ke dasbor pelanggan, jangan ke login, karena statusnya adalah pelanggan aktif
                      window.location.href = '/my/dashboard/';
                      return;
                    }
                    // Sinkronisasi data sesi lokal jika ada perubahan jabatan
                    if (this.state.user && this.state.user.role !== rtProfile.role) {
                      const updatedUser = {
                        ...this.state.user,
                        role: rtProfile.role
                      };
                      this.saveSession(updatedUser);
                    }
                  }
                });
              } catch (e) {
                void('[AuthManager] Failed to fetch user profile:', e);
              }
            }
            // Mencegah login jika status suspended di database
            if (profile && profile.status === 'suspended') {
              void('[AuthManager] Account is suspended, forcing logout');
              auth.signOut();
              this.clearSession();
              return;
            }
            const userObj = {
              userId: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              emailVerified: firebaseUser.emailVerified,
              ...(profile || {})
            };
            // Ensure state updates without causing infinite loop
            if (JSON.stringify(this.state.user) !== JSON.stringify(userObj)) {
              this.saveSession(userObj);
              
              // Sync Cart & Wishlist on login
              const cartRes = await APIClient.fetchUserCart(userObj.userId);
              if (cartRes.success && cartRes.data) {
                CartManager.mergeCart(cartRes.data);
              }
              const wishRes = await APIClient.fetchUserWishlist(userObj.userId);
              if (wishRes.success && wishRes.data) {
                WishlistManager.mergeWishlist(wishRes.data);
              }
            }
          } else {
            if (this.state.isLoggedIn) {
              this.clearSession();
            }
          }
        });
      }
    } catch (error) {
      void('[AuthManager] Error initializing Firebase Auth:', error);
    }
    this.setupStorageListener();

    // Setup sync listeners
    if (!this._syncListenersAdded) {
      this._syncListenersAdded = true;
      window.addEventListener('cart:updated', async (e) => {
        if (this.isLoggedIn()) {
          const user = this.getCurrentUser();
          await APIClient.syncUserCart(user.userId, e.detail);
        }
      });
      window.addEventListener('wishlist:updated', async (e) => {
        if (this.isLoggedIn()) {
          const user = this.getCurrentUser();
          await APIClient.syncUserWishlist(user.userId, e.detail);
        }
      });
    }
  }
  /**
   * Load session from storage
   */
  static loadSession() {
    try {
      const stored = window[this.STORAGE_TYPE].getItem(this.SESSION_KEY);
      if (!stored) {
        this.state = {
          user: null,
          isLoggedIn: false,
          lastActivity: Date.now(),
          expiresAt: null
        };
        return;
      }
      const data = JSON.parse(stored);
      // Validate version
      if (data.version !== this.SESSION_VERSION) {
        void('[AuthManager] Session version mismatch, clearing');
        this.clearSession();
        return;
      }
      // Validate user data structure
      if (data.user && typeof data.user === 'object') {
        this.state = {
          user: this.validateUserData(data.user),
          isLoggedIn: !!data.user
        };
      }
    } catch (error) {
      void('[AuthManager] Error loading session:', error);
      this.clearSession();
    }
  }
  /**
   * Validate user data structure
   * Ensure required fields exist
   */
  static validateUserData(user) {
    const required = ['userId', 'email', 'displayName'];
    for (const field of required) {
      if (!user[field]) {
        void(`[AuthManager] Missing required field: ${field}`);
        return null;
      }
    }
    return {
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified || false,
      photoURL: user.photoURL || '',
      whatsapp: user.whatsapp || '',
      authMethod: user.authMethod || 'email',
      role: user.role || 'customer',
      status: user.status || 'active', // Pastikan status ikut tersimpan ke session storage
      verifiedAt: user.verifiedAt || Date.now(),
      hasPassword: user.hasPassword
    };
  }
  /**
   * Save session to storage
   */
  static saveSession(user) {
    try {
      if (!user) {
        this.clearSession();
        return;
      }
      const validatedUser = this.validateUserData(user);
      if (!validatedUser) {
        throw new Error('Invalid user data');
      }
      const data = {
        version: this.SESSION_VERSION,
        user: validatedUser
      };
      window[this.STORAGE_TYPE].setItem(this.SESSION_KEY, JSON.stringify(data));
      this.state = {
        user: validatedUser,
        isLoggedIn: true
      };
      this.emit('authChanged', validatedUser);
    } catch (error) {
      void('[AuthManager] Error saving session:', error);
      this.emit('authError', error);
    }
  }
  static clearSession() {
    // Clear localStorage session key
    window[this.STORAGE_TYPE].removeItem(this.SESSION_KEY);
    // Jika ada session storage yang dipakai khusus auth di masa depan, hapus item per item
    // contoh: sessionStorage.removeItem('auth_token_tmp');

    // Completely invalidate the Firebase Auth session to prevent ghost sessions
    getFirebase().then(({
      auth
    }) => {
      if (auth) auth.signOut();
    }).catch(e => void('[AuthManager] Firebase signout error:', e));

    if (this.state.isLoggedIn || this.state.user) {
      this.state = {
        user: null,
        isLoggedIn: false,
        lastActivity: Date.now(),
        expiresAt: null
      };
      this.emit('authChanged', null);
    }
  }
  /**
   * Get current logged-in user
   */
  static getCurrentUser() {
    return this.state.user;
  }
  /**
   * CRITICAL: Refresh user data from storage (NEW)
   * Call this when returning from email verification or other auth operations
   * to ensure you have the latest user data
   */
  static refreshUserData() {
    void('[AuthManager] Refreshing user data from storage...');
    this.loadSession();
    if (this.state.user && this.state.user.emailVerified) {
      void('âœ… User verification status updated:', this.state.user);
      this.emit('authChanged', {
        user: this.state.user,
        isLoggedIn: true
      });
    }
    return this.state.user;
  }
  /**
   * Check if user is logged in
   */
  static isLoggedIn() {
    return this.state.isLoggedIn && this.state.user !== null;
  }
  /**
   * Get user ID
   */
  static getUserId() {
    return this.state.user?.userId || null;
  }
  /**
   * Get Firebase ID Token
   */
  static async getIdToken() {
    try {
      const {
        auth
      } = await getFirebase();
      if (auth && auth.currentUser) {
        return await auth.currentUser.getIdToken(true);
      }
    } catch (e) {
      void('[AuthManager] Failed to get idToken:', e);
    }
    return null;
  }
  /**
   * Check if user is admin
   */
  static isAdmin() {
    return this.isLoggedIn() && this.state.user?.role === 'admin';
  }
  /**
   * Update user data (after profile updates)
   */
  static updateUser(updates) {
    if (!this.isLoggedIn()) {
      throw new Error('No user logged in');
    }
    const updatedUser = {
      ...this.state.user,
      ...updates
    };
    this.saveSession(updatedUser);
  }
  /**
   * Setup storage listener for multi-tab sync
   */
  static setupStorageListener() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.SESSION_KEY) {
        this.loadSession();
      }
    });
  }

  /**
   * Event system
   */
  static on(eventName, handler) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].push(handler);
    }
    // Return unsubscribe function
    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(h => h !== handler);
    };
  }
  static emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          void(`[AuthManager] Error in ${eventName} handler:`, error);
        }
      });
    }
    // Also dispatch custom event for global handling
    const event = new CustomEvent(`auth:${eventName}`, {
      detail: data
    });
    document.dispatchEvent(event);
  }
  /**
   * Expose state as read-only object
   */
  static getState() {
    return {
      ...this.state
    };
  }
}
// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AuthManager.init());
} else {
  AuthManager.init();
}