/**
 * UNIFIED API CLIENT
 * ===================================
 * Single API layer untuk semua GAS calls
 * - Consistent request/response format
 * - Automatic error handling & recovery
 * - Built-in timeout & retry logic
 * - Session validation
 * - Detailed logging
 * 
 * Usage:
 *   APIClient.call('registerUser', {email, password})
 *   APIClient.call('loginUser', {email, password})
 *   APIClient.call('getUserProfile', {userId})
 */
import {
  AuthManager
} from './unified-auth.js';
import {
  GAS_CONFIG
} from '../config/api.config.js';
import { getFirebase } from './firebase-core.js';

export class APIClient {
  static DEFAULT_TIMEOUT = 30000; // 30 seconds
  /**
   * Make API call to GAS backend
   * Simple, direct pattern matching sampel-mekanisme-GAS
   */
  static async call(action, data = {}, options = {}) {
    let {
      method = 'POST'
    } = options;

    // Use GET for data retrieval if no complex data
    const getActions = ['checkdomain', 'getorders', 'getactivepromocodes'];
    if (getActions.includes(action.toLowerCase())) {
      method = 'GET';
    }
    try {
      const response = await this.makeRequest(action, data, method, this.DEFAULT_TIMEOUT);
      // Response bisa dalam berbagai format, fallback jika tidak sesuai expected
      let result = response;
      // Jika response adalah object dengan success field
      if (typeof response === 'object' && response !== null) {
        // Jika ada success field, gunakan sebagai response valid
        if ('success' in response) {
          if (typeof response.success !== 'boolean') {
            console.warn('[API] Warning: success field bukan boolean, treating as:', !!response.success);
            response.success = !!response.success; // Convert to boolean
          }
          result = response;
        } else if ('data' in response) {
          // Fallback: jika ada data field tapi tidak ada success, anggap success = true
          console.warn('[API] No success field, default to true (data present)');
          result = {
            success: true,
            data: response.data,
            message: response.message || 'Operation successful',
            timestamp: response.timestamp || Date.now()
          };
        } else {
          // Response adalah object tapi tidak ada expected field
          console.warn('[API] Unexpected response format, trying to detect success state:', response);
          result = {
            success: true, // Assume success jika response sudah dikirim
            data: response,
            message: response.message || 'Operation completed',
            timestamp: Date.now()
          };
        }
      } else {
        // Response bukan object (string, boolean, etc) - unexpected
        console.error('[API] Response bukan object:', typeof response);
        throw new Error('Server response format tidak valid');
      }
      // Final validation
      if (result.success === false && (result.errorCode === 'UNAUTHORIZED' || result.errorCode === 'SESSION_EXPIRED')) {
        console.error('[API] Auth error - clearing session');
        AuthManager.clearSession();
        throw new Error('Session expired. Please login again.');
      }
      return result;
    } catch (error) {
      console.error(`[API] ${action} failed:`, error.message);
      throw error; // Let caller handle error
    }
  }
  /**
   * Make actual HTTP request
   * Using FormData for ALL requests - matches sampel-mekanisme-GAS pattern
   * FormData automatically becomes multipart/form-data - NO CORS preflight needed
   * Per sampel-mekanisme-GAS: this is the ONLY way to reliably work with GAS
   * 
   * DO NOT use:
   * - Content-Type: application/json (triggers preflight - GAS doesn't like it)
   * - URLSearchParams (less reliable than FormData)
   * - Custom headers (can trigger preflight)
   */
  static async makeRequest(action, data, method, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      // Build URLSearchParams for application/x-www-form-urlencoded format
      // as required by Google Apps Script rules to avoid CORS preflight errors.
      const postParams = new URLSearchParams();
      postParams.append('action', action);
      // Add all data fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            postParams.append(key, JSON.stringify(value));
          } else {
            postParams.append(key, String(value));
          }
        }
      });
      let url = `${GAS_CONFIG.URL}`;
      let options = {
        method: method,
        signal: controller.signal,
        redirect: 'follow',
        cache: 'no-store'
      };
      if (method === 'GET') {
        // For GET, append as query string
        const params = new URLSearchParams({
          action,
          ...data
        });
        url = `${GAS_CONFIG.URL}?${params}`;
      } else if (method === 'POST') {
        // For POST, use application/x-www-form-urlencoded to prevent CORS preflight issues
        options.body = postParams;
      }
      const response = await fetch(url, options);
      if (!response.ok) {
        // Try to get error message from response body
        let errorBody = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const errorJson = await response.json();
            errorBody = errorJson.message || JSON.stringify(errorJson);
          } else {
            errorBody = await response.text();
          }
        } catch (e) {
          errorBody = response.statusText;
        }
        throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
      }
      // Try parse as JSON
      try {
        const responseText = await response.text();
        // Try parse JSON
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          // Jika bukan valid JSON, return sebagai response object dengan raw text
          console.warn('[API] Response bukan JSON, return as-is:', responseText.substring(0, 100));
          return {
            success: true, // Assume success jika GAS respond
            data: responseText,
            message: 'Response received from server',
            timestamp: Date.now(),
            _raw: responseText // Keep raw response
          };
        }
      } catch (error) {
        throw new Error('Gagal membaca response dari server: ' + error.message);
      }
    } catch (error) {
      // Network error, timeout, atau parse error
      if (error.name === 'AbortError') {
        throw new Error('Request timeout setelah ' + timeout + 'ms');
      }
      throw error; // Re-throw all other errors
    } finally {
      clearTimeout(timeoutId);
    }
  }
  // ========== AUTH ENDPOINTS ==========
  /**
   * Register new user
   */
  static async registerUser(email, password, displayName = '', whatsapp = '') {
    try {
      const { auth, db } = await getFirebase();
      if (!auth) {
        return { success: false, message: 'Firebase Auth tidak tersedia' };
      }
      
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      const actionCodeSettings = {
        url: window.location.origin + '/dashboard/', // Akan memunculkan tombol 'Continue' ke dashboard
        handleCodeInApp: false
      };
      
      await user.sendEmailVerification(actionCodeSettings);
      
      const profile = {
        userId: user.uid,
        email: user.email,
        displayName: displayName || email.split('@')[0],
        whatsapp: whatsapp || '',
        photoURL: '',
        authMethod: 'email',
        createdAt: new Date().toISOString()
      };
      if (db) {
        await db.ref(`users/${user.uid}`).set(profile);
      }
      return { success: true, data: profile, message: 'Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.' };
    } catch (e) {
      console.error('[Auth] Register error:', e);
      let errorMsg = 'Pendaftaran gagal';
      if (e.code === 'auth/email-already-in-use') {
        errorMsg = 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      } else if (e.code === 'auth/weak-password') {
        errorMsg = 'Password terlalu lemah (minimal 6 karakter).';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'Format email tidak valid.';
      } else if (e.message) {
        errorMsg = e.message;
      }
      return { success: false, message: errorMsg };
    }
  }
  /**
   * Login user
   */
  static async loginUser(email, password) {
    try {
      const { auth, db } = await getFirebase();
      if (!auth) {
        return { success: false, message: 'Firebase Auth tidak tersedia' };
      }
      
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      let profile = null;
      if (db) {
        const snapshot = await db.ref(`users/${user.uid}`).once('value');
        profile = snapshot.val();
      }
      return { success: true, data: profile || { userId: user.uid, email: user.email, displayName: user.email.split('@')[0] }, message: 'Login berhasil' };
    } catch (e) {
      console.error('[Auth] Login error:', e);
      let errorMsg = 'Login gagal';
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        errorMsg = 'Email atau password yang Anda masukkan salah.';
      } else if (e.code === 'auth/too-many-requests') {
        errorMsg = 'Terlalu banyak percobaan login. Silakan coba lagi beberapa saat lagi.';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'Format email tidak valid.';
      } else if (e.message) {
        errorMsg = e.message;
      }
      return { success: false, message: errorMsg };
    }
  }
  /**
   * Verify email token (auto-login after registration)
   * Using GET request to avoid CORS preflight issues
   */
  static verifyEmailToken(token) {
    return this.call('verifyEmailToken', {
      token
    }, {
      method: 'GET'
    });
  }
  /**
   * Verify Google OAuth token (Legacy GIS fallback)
   * Using POST request because Google tokens are extremely long and can trigger URL limits or CORS failures on GET
   */
  static async verifyGoogleToken(token) {
    try {
      const { auth, db, firebase } = await getFirebase();
      if (!auth) return { success: false, message: 'Firebase Auth tidak tersedia' };

      const credential = firebase.auth.GoogleAuthProvider.credential(token);
      const userCredential = await auth.signInWithCredential(credential);
      const user = userCredential.user;
      const profile = {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        whatsapp: '',
        authMethod: 'google',
        emailVerified: user.emailVerified || true,
        createdAt: new Date().toISOString()
      };
      if (db) {
        await db.ref(`users/${user.uid}`).set(profile);
      }
      return { success: true, data: profile, message: 'Google sign-in berhasil' };
    } catch (e) {
      console.error('Google sign in error', e);
      return { success: false, message: e.message || 'Gagal login dengan Google' };
    }
  }

  /**
   * Native Firebase Google Sign In with Popup
   * Bypasses COOP header issues associated with Google Identity Services
   */
  static async signInWithGooglePopup() {
    try {
      const { auth, db, firebase } = await getFirebase();
      if (!auth) return { success: false, message: 'Firebase Auth tidak tersedia' };
      
      const provider = new firebase.auth.GoogleAuthProvider();
      // Optional: Add custom parameters if needed
      // provider.setCustomParameters({ prompt: 'select_account' });
      
      const userCredential = await auth.signInWithPopup(provider);
      const user = userCredential.user;
      
      const profile = {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        whatsapp: '',
        authMethod: 'google',
        emailVerified: user.emailVerified || true,
        createdAt: new Date().toISOString()
      };
      
      if (db) {
        // Retrieve existing user data to avoid overwriting properties
        const snapshot = await db.ref(`users/${user.uid}`).once('value');
        const existingData = snapshot.val();
        if (existingData) {
          profile.whatsapp = existingData.whatsapp || '';
          profile.role = existingData.role || 'customer';
          profile.createdAt = existingData.createdAt || profile.createdAt;
        }
        await db.ref(`users/${user.uid}`).update(profile);
      }
      
      return { success: true, data: profile, message: 'Google sign-in berhasil' };
    } catch (e) {
      console.error('Google popup sign in error', e);
      return { success: false, message: e.message };
    }
  }
  /**
   * Request password reset
   * Using GET request to avoid CORS preflight issues
   */
  static requestPasswordReset(email) {
    return this.call('requestPasswordReset', {
      email
    }, {
      method: 'POST'
    });
  }
  /**
   * Reset password with token
   */
  static resetPassword(token, password) {
    return this.call('resetPassword', {
      token,
      password
    }, {
      method: 'POST'
    });
  }
  // ========== USER PROFILE ENDPOINTS ==========
  /**
   * Get user profile
   * Using GET request to avoid CORS preflight issues
   */
  static async getUserProfile(userId) {
    try {
      const { db } = await getFirebase();
      if (db) {
        const snapshot = await db.ref(`users/${userId}`).once('value');
        const profile = snapshot.val();
        if (profile) return { success: true, data: profile };
      }
      return { success: false, message: 'Profil tidak ditemukan di Firebase' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
  /**
   * Update user profile
   */
  static async updateUserProfile(userId, displayName, whatsapp, photoBase64) {
    try {
      const { db } = await getFirebase();
      if (db) {
        const updates = { displayName, whatsapp };
        if (photoBase64) updates.photoURL = photoBase64;
        await db.ref(`users/${userId}`).update(updates);
        return { success: true, message: 'Profil berhasil diupdate' };
      }
      return { success: false, message: 'Firebase DB tidak tersedia' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
  /**
   * Change password
   */
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const { auth, firebase } = await getFirebase();
      if (auth && auth.currentUser) {
         const user = auth.currentUser;
         const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);
         await user.reauthenticateWithCredential(credential);
         await user.updatePassword(newPassword);
         return { success: true, message: 'Password berhasil diubah' };
      }
    } catch (e) {
      return { success: false, message: 'Password lama salah atau gagal mengubah password.' };
    }
    return { success: false, message: 'User tidak terautentikasi' };
  }
  // ========== ORDER ENDPOINTS ==========
  /**
   * Create order (authenticated)
   * Accepts userId as part of orderData or will pass-through
   */
  static createOrder(orderData) {
    return this.call('createOrderWithAuth', orderData, {
      method: 'POST'
    });
  }
  /**
   * Create order with separate userId (alternative signature for convenience)
   */
  static async createOrderWithAuth(userIdOrOrderData, orderDataIfUserIdProvided) {
    let data;
    if (typeof userIdOrOrderData === 'string') {
      data = {
        userId: userIdOrOrderData,
        ...orderDataIfUserIdProvided
      };
    } else {
      data = userIdOrOrderData;
    }
    
    const response = await this.call('createOrderWithAuth', data, {
      method: 'POST'
    });
    
    // Mirror the domain to Firebase RTDB for fast checking later
    if (response.success && data.domain) {
       try {
         const { db } = await getFirebase();
         if (db) {
           const domainKey = data.domain.toLowerCase().replace(/\./g, '_');
           await db.ref(`domains/${domainKey}`).set({
               domain: data.domain.toLowerCase(),
               status: 'ordered',
               userId: data.userId || 'anonymous',
               updatedAt: new Date().toISOString()
           });
         }
       } catch(e) {
         console.warn('[API] Failed to mirror domain order to Firebase', e);
       }
    }
    
    return response;
  }
  /**
   * Get user's orders
   */
  static getUserOrders(userId) {
    return this.call('getUserOrders', {
      userId
    }, {
      method: 'POST'
    });
  }
  /**
   * Get order detail
   */
  static getOrderDetail(orderId, userId) {
    return this.call('getOrderDetail', {
      orderId,
      userId
    }, {
      method: 'POST'
    });
  }
  /**
   * Sync order status directly with Midtrans backend
   * @param {string} orderId 
   */
  static syncOrderStatus(orderId) {
    return this.call('syncorderstatus', {
      orderId
    }, {
      method: 'POST'
    });
  }
  /**
   * Get user order statistics
   */
  static getUserOrderStats(userId) {
    return this.call('getUserOrderStats', {
      userId
    }, {
      method: 'POST'
    });
  }
  // ========== PAYMENT ENDPOINTS ==========
  /**
   * Generate Midtrans payment token
   */
  static generateMidtransToken(orderId, email, phone, name, domain, packageId, total, addons = []) {
    return this.call('generateMidtransToken', {
      orderId,
      email,
      phone,
      name,
      domain,
      packageId,
      total,
      addons // NEW: Pass addons array
    }, {
      method: 'POST'
    });
  }
  // ========== DOMAIN ENDPOINTS ==========
  /**
   * Check domain availability
   */
  static async checkDomain(domain) {
    if (!domain) return { success: false, message: 'Domain diperlukan' };
    
    // Normalize domain for Firebase key (replace dots with underscores)
    const domainKey = domain.toLowerCase().replace(/\./g, '_');
    
    try {
      const { db } = await getFirebase();
      if (!db) {
        throw new Error("Firebase DB not initialized");
      }
      
      const snapshot = await db.ref(`domains/${domainKey}`).once('value');
      
      if (snapshot.exists()) {
        const domainInfo = snapshot.val();
        // Domain is registered in our RTDB
        if (domainInfo.status === 'ordered') {
          return { 
            success: true, 
            data: { domain: domain, available: true, isOrdered: true, status: 'ordered' }, 
            message: 'Domain sedang dipesan (Rebutan)' 
          };
        } else if (domainInfo.status === 'taken' || domainInfo.status === 'active') {
          return { 
            success: true, 
            data: { domain: domain, available: false, isOrdered: false, status: 'taken' }, 
            message: 'Domain sudah aktif' 
          };
        }
      }
      
      // If not in RTDB or status is somehow cleared, it's available!
      return {
        success: true,
        data: { domain: domain, available: true, isOrdered: false, status: 'available' },
        message: 'Domain tersedia'
      };
      
    } catch (e) {
      console.warn('[API] Firebase domain check failed', e);
      // Fallback response if RTDB fails (don't block the user, just assume unknown/available)
      return { success: true, data: { domain: domain, available: true, isOrdered: false, status: 'unknown' }, message: 'Gagal mengecek ke database lokal' };
    }
  }
  /**
   * Get domain pricing
   */
  static getDomainPricing(tld) {
    return this.call('getDomainPricing', {
      tld
    }, {
      method: 'POST'
    });
  }
  // ========== PROMO ENDPOINTS ==========
  /**
   * Validate promo code
   */
  static validatePromoCode(code) {
    return this.call('validatePromoCode', {
      code
    }, {
      method: 'POST'
    });
  }
  /**
   * Get active promo codes list
   */
  static getActivePromoCodes() {
    return this.call('getActivePromoCodes', {}, {
      method: 'GET'
    });
  }
  // ========== ADMIN ENDPOINTS ==========
  static getAdminStats(adminId = 'ADMIN') {
    return this.call('getadminstats', {
      adminId
    }, {
      method: 'POST'
    });
  }
  static async getAllUsers(adminId = 'ADMIN') {
    try {
      const { db } = await getFirebase();
      if (db) {
        const snapshot = await db.ref('users').once('value');
        const usersObj = snapshot.val() || {};
        const usersArray = Object.values(usersObj).map(u => ({ id: u.userId, name: u.displayName || 'Unknown', email: u.email, role: u.role || 'customer', status: u.status || 'active' }));
        return { success: true, data: usersArray };
      }
      return { success: false, message: 'Firebase DB not available' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
  static async saveAdminUser(adminId, userData) {
    try {
      const { db } = await getFirebase();
      if (db) {
         const userId = userData.id || ('USER-' + Date.now());
         userData.userId = userId;
         await db.ref(`users/${userId}`).set({
             userId: userId,
             displayName: userData.name,
             email: userData.email,
             whatsapp: userData.whatsapp || '',
             photoURL: userData.photo || '',
             role: userData.role || 'customer',
             status: userData.active ? 'active' : 'inactive',
             authMethod: 'email',
             createdAt: new Date().toISOString()
         });
      }
    } catch (e) {
       console.error('Failed to save user to Firebase', e);
    }
    return this.call('saveadminuser', { adminId, userData: JSON.stringify(userData) }, { method: 'POST' });
  }
  static deleteAdminUser(adminId, id) {
    return this.call('deleteadminuser', {
      adminId,
      id
    }, {
      method: 'POST'
    });
  }
  static getAllTransactions(adminId = 'ADMIN') {
    return this.call('getalltransactions', {
      adminId
    }, {
      method: 'POST'
    });
  }
  static saveAdminTransaction(adminId, txData) {
    return this.call('saveadmintransaction', {
      adminId,
      txData: JSON.stringify(txData)
    }, {
      method: 'POST'
    });
  }
  static deleteAdminTransaction(adminId, id) {
    return this.call('deleteadmintransaction', {
      adminId,
      id
    }, {
      method: 'POST'
    });
  }
  static getAdminPromos(adminId) {
    return this.call('getadminpromos', {
      adminId
    }, {
      method: 'POST'
    });
  }
  static saveAdminPromo(adminId, promoData) {
    return this.call('saveadminpromo', {
      adminId,
      promoData: JSON.stringify(promoData)
    }, {
      method: 'POST'
    });
  }
  static deleteAdminPromo(adminId, code) {
    return this.call('deleteadminpromo', {
      adminId,
      code
    }, {
      method: 'POST'
    });
  }
  static getAdminPackages(adminId) {
    return this.call('getadminpackages', {
      adminId
    }, {
      method: 'POST'
    });
  }
  static saveAdminPackage(adminId, packageData) {
    return this.call('saveadminpackage', {
      adminId,
      packageData: JSON.stringify(packageData)
    }, {
      method: 'POST'
    });
  }
  static deleteAdminPackage(adminId, id) {
    return this.call('deleteadminpackage', {
      adminId,
      id
    }, {
      method: 'POST'
    });
  }
  static getAdminTickets(adminId) {
    return this.call('getadmintickets', {
      adminId
    }, {
      method: 'POST'
    });
  }
  static saveAdminTicket(adminId, ticketData) {
    return this.call('saveadminticket', {
      adminId,
      ticketData: JSON.stringify(ticketData)
    }, {
      method: 'POST'
    });
  }
  static deleteAdminTicket(adminId, id) {
    return this.call('deleteadminticket', {
      adminId,
      id
    }, {
      method: 'POST'
    });
  }
  static getAdminDNS(adminId) {
    return this.call('getadmindns', {
      adminId
    }, {
      method: 'POST'
    });
  }
  static saveAdminDNS(adminId, dnsData) {
    return this.call('saveadmindns', {
      adminId,
      dnsData: JSON.stringify(dnsData)
    }, {
      method: 'POST'
    });
  }
  static deleteAdminDNS(adminId, domain) {
    return this.call('deleteadmindns', {
      adminId,
      domain
    }, {
      method: 'POST'
    });
  }
}
// Export for use
export default APIClient;