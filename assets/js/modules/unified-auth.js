import {
  getFirebase
} from './firebase-core.js';
import {
  EnvHelper
} from './unified-utils.js';
import APIClient from './unified-api.js';
import {
  CartManager,
  WishlistManager
} from './unified-cart.js';
export class AuthManager {
  static SESSION_KEY = 'sisitus_user';
  static SESSION_VERSION = 2;
  static SESSION_TIMEOUT = 30 * 60 * 1000;
  static STORAGE_TYPE = 'localStorage';
  static state = {
    user: null,
    isLoggedIn: false,
    lastActivity: null,
    expiresAt: null
  };
  static listeners = {
    authChanged: [],
    authError: [],
    sessionExpired: []
  };
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
                userRef.on('value', (rtSnap) => {
                  const rtProfile = rtSnap.val();
                  if (rtProfile) {
                    if (rtProfile.status === 'suspended') {
                      console.log('[AuthManager] Realtime Account Suspended, forcing logout');
                      auth.signOut();
                      this.clearSession();
                      if (window.location.hostname === 'backstage.sisitus.com' || window.location.pathname.includes('/admin/') || window.location.pathname.includes('/dashboard/')) {
                        window.location.href = '/auth/?error=suspended';
                      }
                      return;
                    }
                    if (rtProfile.role !== 'admin' && (window.location.hostname === 'backstage.sisitus.com' || window.location.pathname.includes('/admin/'))) {
                      console.log('[AuthManager] Realtime Role Demoted, forcing exit from admin');
                      window.location.href = EnvHelper.getDomainUrl('my', '/dashboard/');
                      return;
                    }
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
                console.log('[AuthManager] Failed to fetch user profile:', e);
              }
            }
            if (profile && profile.status === 'suspended') {
              console.log('[AuthManager] Account is suspended, forcing logout');
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
            if (JSON.stringify(this.state.user) !== JSON.stringify(userObj)) {
              this.saveSession(userObj);
              const cartRes = await APIClient.fetchUserCart(userObj.userId);
              if (cartRes.success && cartRes.data) {
                CartManager.mergeCart(cartRes.data);
              } else {
                if (!CartManager.isEmpty()) {
                  await APIClient.syncUserCart(userObj.userId, CartManager.getCart());
                }
              }
              const wishRes = await APIClient.fetchUserWishlist(userObj.userId);
              if (wishRes.success && wishRes.data) {
                WishlistManager.mergeWishlist(wishRes.data);
              } else {
                const currentWishlist = WishlistManager.getWishlist();
                if (currentWishlist && currentWishlist.domains && currentWishlist.domains.length > 0) {
                  await APIClient.syncUserWishlist(userObj.userId, currentWishlist);
                }
              }
            }
          } else {
            if (this.state.isLoggedIn) {
              const hostname = window.location.hostname;
              const isMyDomain = hostname.startsWith('my.') || hostname.includes('localhost');
              if (isMyDomain) {
                this.clearSession();
              } else {
                console.log('[AuthManager] Ignoring null firebaseUser on public domain to preserve SSO session.');
              }
            }
          }
        });
      }
    } catch (error) {
      console.log('[AuthManager] Error initializing Firebase Auth:', error);
    }
    this.setupStorageListener();
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
      if (data.version !== this.SESSION_VERSION) {
        console.log('[AuthManager] Session version mismatch, clearing');
        this.clearSession();
        return;
      }
      if (data.user && typeof data.user === 'object') {
        this.state = {
          user: this.validateUserData(data.user),
          isLoggedIn: !!data.user
        };
      }
    } catch (error) {
      console.log('[AuthManager] Error loading session:', error);
      this.clearSession();
    }
  }
  static validateUserData(user) {
    const required = ['userId', 'email', 'displayName'];
    for (const field of required) {
      if (!user[field]) {
        console.log(`[AuthManager] Missing required field: ${field}`);
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
      status: user.status || 'active',
      verifiedAt: user.verifiedAt || Date.now(),
      hasPassword: user.hasPassword
    };
  }
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
      console.log('[AuthManager] Error saving session:', error);
      this.emit('authError', error);
    }
  }
  static clearSession() {
    window[this.STORAGE_TYPE].removeItem(this.SESSION_KEY);
    getFirebase().then(({
      auth
    }) => {
      if (auth) auth.signOut();
    }).catch(e => console.log('[AuthManager] Firebase signout error:', e));
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
  static getCurrentUser() {
    return this.state.user;
  }
  static refreshUserData() {
    console.log('[AuthManager] Refreshing user data from storage...');
    this.loadSession();
    if (this.state.user && this.state.user.emailVerified) {
      console.log('âœ… User verification status updated:', this.state.user);
      this.emit('authChanged', {
        user: this.state.user,
        isLoggedIn: true
      });
    }
    return this.state.user;
  }
  static isLoggedIn() {
    return this.state.isLoggedIn && this.state.user !== null;
  }
  static getUserId() {
    return this.state.user?.userId || null;
  }
  static async getIdToken() {
    try {
      const {
        auth
      } = await getFirebase();
      if (auth && auth.currentUser) {
        return await auth.currentUser.getIdToken(true);
      }
    } catch (e) {
      console.log('[AuthManager] Failed to get idToken:', e);
    }
    return null;
  }
  static isAdmin() {
    return this.isLoggedIn() && this.state.user?.role === 'admin';
  }
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
  static setupStorageListener() {
    if (this._storageListenerAdded) return;
    this._storageListenerAdded = true;
    window.addEventListener('storage', (event) => {
      if (event.key === this.SESSION_KEY) {
        this.loadSession();
      }
    });
  }
  static on(eventName, handler) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].push(handler);
    }
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
          console.log(`[AuthManager] Error in ${eventName} handler:`, error);
        }
      });
    }
    const event = new CustomEvent(`auth:${eventName}`, {
      detail: data
    });
    document.dispatchEvent(event);
  }
  static getState() {
    return {
      ...this.state
    };
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AuthManager.init());
} else {
  AuthManager.init();
}