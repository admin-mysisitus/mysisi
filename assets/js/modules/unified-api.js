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
import {
  getFirebase
} from './firebase-core.js';
import {
  EnvHelper
} from './unified-utils.js';
export class APIClient {
  static DEFAULT_TIMEOUT = GAS_CONFIG.TIMEOUT || 30000; // Use configured timeout
  /**
   * Make API call to GAS backend
   * Simple, direct pattern matching sampel-mekanisme-GAS
   */
  static async call(action, data = {}, options = {}) {
    let {
      method = 'POST'
    } = options;
    // DO NOT force GET for GAS, as it requires a doGet function which doesn't exist, causing CORS errors.
    try {
      const response = await this.makeRequest(action, data, method, this.DEFAULT_TIMEOUT);
      // Response bisa dalam berbagai format, fallback jika tidak sesuai expected
      let result = response;
      // Jika response adalah object dengan success field
      if (typeof response === 'object' && response !== null) {
        // Jika ada success field, gunakan sebagai response valid
        if ('success' in response) {
          if (typeof response.success !== 'boolean') {
            void('[API] Warning: success field bukan boolean, treating as:', !!response.success);
            response.success = !!response.success; // Convert to boolean
          }
          result = response;
        } else if ('data' in response) {
          // Fallback: jika ada data field tapi tidak ada success, anggap success = true
          void('[API] No success field, default to true (data present)');
          result = {
            success: true,
            data: response.data,
            message: response.message || 'Operation successful',
            timestamp: response.timestamp || Date.now()
          };
        } else {
          // Response adalah object tapi tidak ada expected field
          void('[API] Unexpected response format, trying to detect success state:', response);
          result = {
            success: true, // Assume success jika response sudah dikirim
            data: response,
            message: response.message || 'Operation completed',
            timestamp: Date.now()
          };
        }
      } else {
        // Response bukan object (string, boolean, etc) - unexpected
        void('[API] Response bukan object:', typeof response);
        throw new Error('Server response format tidak valid');
      }
      // Final validation
      if (result.success === false && (result.errorCode === 'UNAUTHORIZED' || result.errorCode === 'SESSION_EXPIRED')) {
        void('[API] Auth error - clearing session');
        AuthManager.clearSession();
        throw new Error('Session expired. Please login again.');
      }
      return result;
    } catch (error) {
      void(`[API] ${action} failed:`, error.message);
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
      // Get Firebase ID Token if user is logged in
      const {
        auth
      } = await getFirebase();
      let idToken = '';
      if (auth && auth.currentUser) {
        try {
          idToken = await auth.currentUser.getIdToken(false);
        } catch (e) {
          void('[API] Failed to get ID token', e);
        }
      }
      // Build URLSearchParams for application/x-www-form-urlencoded format
      // as required by Google Apps Script rules to avoid CORS preflight errors.
      const postParams = new URLSearchParams();
      postParams.append('action', action);
      if (idToken) {
        postParams.append('idToken', idToken);
      }
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
          ...(idToken ? {
            idToken
          } : {}),
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
          void('[API] Response bukan JSON, return as-is:', responseText.substring(0, 100));
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
      const {
        auth,
        db
      } = await getFirebase();
      if (!auth) {
        return {
          success: false,
          message: 'Firebase Auth tidak tersedia'
        };
      }
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      const actionCodeSettings = {
        url: EnvHelper.getDomainUrl('my', '/dashboard/'), // Akan memunculkan tombol 'Continue' ke dashboard
        handleCodeInApp: true
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
        // Jangan gunakan .set() agar tidak menghapus profil existing jika ada
        const snapshot = await db.ref(`users/${user.uid}`).once('value');
        const existingData = snapshot.val();
        if (existingData) {
          profile.whatsapp = existingData.whatsapp || profile.whatsapp;
          profile.role = existingData.role || 'customer';
          profile.status = existingData.status || 'active';
          profile.createdAt = existingData.createdAt || profile.createdAt;
        }
        await db.ref(`users/${user.uid}`).update(profile);
      }
      // Update native Firebase Auth profile
      await user.updateProfile({
        displayName: profile.displayName
      });
      return {
        success: true,
        data: profile,
        message: 'Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.'
      };
    } catch (e) {
      void('[Auth] Register error:', e);
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
      return {
        success: false,
        message: errorMsg
      };
    }
  }
  /**
   * Login user
   */
  static async loginUser(email, password) {
    try {
      const {
        auth,
        db
      } = await getFirebase();
      if (!auth) {
        return {
          success: false,
          message: 'Firebase Auth tidak tersedia'
        };
      }
      // 1. Check Rate Limit dari Backend
      const rateLimitRes = await this.call(GAS_CONFIG.ACTIONS.CHECK_LOGIN_RATE_LIMIT, {
        email
      });
      if (rateLimitRes.success && rateLimitRes.data && !rateLimitRes.data.allowed) {
        let blockMsg = 'Akses ditolak.';
        const data = rateLimitRes.data;
        if (data.suspended) {
          blockMsg = 'Akun Anda telah ditangguhkan oleh Admin karena terlalu banyak percobaan gagal.';
        } else if (data.remainingSec) {
          blockMsg = `Terlalu banyak percobaan salah. Coba lagi dalam ${data.remainingSec} detik.`;
        }
        return {
          success: false,
          message: blockMsg,
          rateLimit: data
        };
      }
      // 2. Lakukan Firebase Auth
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      let profile = null;
      if (db) {
        const snapshot = await db.ref(`users/${user.uid}`).once('value');
        profile = snapshot.val();
        // Cek suspend permanen dari RTDB Single Source of Truth
        if (profile && profile.status === 'suspended') {
          await auth.signOut();
          return {
            success: false,
            message: 'Akun Anda telah ditangguhkan oleh Admin.'
          };
        }
      }
      // 3. Clear failed attempts di backend karena login sukses
      this.call(GAS_CONFIG.ACTIONS.HANDLE_FAILED_LOGIN, {
        email,
        isSuccess: true
      }).catch(() => {});
      return {
        success: true,
        data: profile || {
          userId: user.uid,
          email: user.email,
          displayName: user.email.split('@')[0]
        },
        message: 'Login berhasil'
      };
    } catch (e) {
      void('[Auth] Login error:', e);
      let errorMsg = 'Login gagal';
      let isPasswordError = false;
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        errorMsg = 'Email atau password yang Anda masukkan salah.';
        isPasswordError = true;
      } else if (e.code === 'auth/too-many-requests') {
        errorMsg = 'Terlalu banyak percobaan login. Silakan coba lagi beberapa saat lagi.';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'Format email tidak valid.';
      } else if (e.message) {
        errorMsg = e.message;
      }
      let rateLimitData = null;
      // Jika salah password, catat ke backend (GAS)
      if (isPasswordError) {
        try {
          const failRes = await this.call(GAS_CONFIG.ACTIONS.HANDLE_FAILED_LOGIN, {
            email
          });
          if (failRes.success && failRes.data) {
            const data = failRes.data;
            rateLimitData = data;
            if (data.suspended) {
              errorMsg = 'Akun Anda telah ditangguhkan otomatis karena terlalu banyak percobaan gagal (5 kali).';
            } else if (data.cooldownUntil) {
              const cooldownMins = data.count === 3 ? 1 : 5;
              const remainingSec = Math.ceil((data.cooldownUntil - Date.now()) / 1000);
              errorMsg = `Password salah. Akses ditangguhkan selama ${cooldownMins} menit demi keamanan.`;
              rateLimitData.remainingSec = remainingSec > 0 ? remainingSec : 0;
            } else {
              const remaining = 3 - data.count;
              if (remaining > 0) errorMsg += ` (Sisa percobaan sebelum penangguhan: ${remaining})`;
            }
          }
        } catch (failErr) {
          void('[Auth] Gagal mencatat percobaan salah ke backend', failErr);
        }
      }
      return {
        success: false,
        message: errorMsg,
        rateLimit: rateLimitData
      };
    }
  }
  /**
   * Verify Google OAuth token (Legacy GIS fallback)
   * Using POST request because Google tokens are extremely long and can trigger URL limits or CORS failures on GET
   */
  static async verifyGoogleToken(token) {
    try {
      const {
        auth,
        db,
        firebase
      } = await getFirebase();
      if (!auth) return {
        success: false,
        message: 'Firebase Auth tidak tersedia'
      };
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
        // Gunakan update dan periksa existingData untuk menghindari terhapusnya status suspend atau role admin
        const snapshot = await db.ref(`users/${user.uid}`).once('value');
        const existingData = snapshot.val();
        if (existingData) {
          profile.whatsapp = existingData.whatsapp || profile.whatsapp;
          profile.role = existingData.role || 'customer';
          profile.status = existingData.status || 'active';
          profile.createdAt = existingData.createdAt || profile.createdAt;
        }
        await db.ref(`users/${user.uid}`).update(profile);
      }
      return {
        success: true,
        data: profile,
        message: 'Google sign-in berhasil'
      };
    } catch (e) {
      void('Google sign in error', e);
      return {
        success: false,
        message: e.message || 'Gagal login dengan Google'
      };
    }
  }
  static async requestPasswordReset(email) {
    try {
      const {
        auth
      } = await getFirebase();
      if (!auth) return {
        success: false,
        message: 'Firebase Auth tidak tersedia'
      };
      const actionCodeSettings = {
        url: EnvHelper.getDomainUrl('my', '/auth/'),
        handleCodeInApp: true
      };
      await auth.sendPasswordResetEmail(email, actionCodeSettings);
      return {
        success: true,
        message: 'Link reset password telah dikirim ke email Anda.'
      };
    } catch (error) {
      void('[Auth] Reset password error:', error);
      let errorMsg = 'Gagal mengirim email reset password';
      if (error.code === 'auth/user-not-found') {
        errorMsg = 'Email tidak terdaftar di sistem kami.';
      }
      return {
        success: false,
        message: errorMsg
      };
    }
  }
  static async resetPassword(token, password) {
    return {
      success: false,
      message: 'Harap gunakan link resmi dari email.'
    };
  }
  static async verifyEmailToken(token) {
    return {
      success: true,
      message: 'Verifikasi diproses oleh Firebase.'
    };
  }
  // ========== USER PROFILE ENDPOINTS ==========
  /**
   * Get user profile
   * Using GET request to avoid CORS preflight issues
   */
  static async getUserProfile(userId) {
    try {
      const {
        db
      } = await getFirebase();
      if (db) {
        const snapshot = await db.ref(`users/${userId}`).once('value');
        const profile = snapshot.val();
        if (profile) return {
          success: true,
          data: profile
        };
      }
      return {
        success: false,
        message: 'Profil tidak ditemukan di Firebase'
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  /**
   * Update user profile
   */
  static async updateUserProfile(userId, displayName, whatsapp, photoBase64) {
    try {
      const {
        auth,
        db
      } = await getFirebase();
      if (!db) {
        return {
          success: false,
          message: 'Firebase DB tidak tersedia'
        };
      }
      let photoURL = null;
      if (photoBase64) {
        let idToken = '';
        if (auth && auth.currentUser) {
          idToken = await auth.currentUser.getIdToken();
        }
        const uploadRes = await this.call(GAS_CONFIG.ACTIONS.UPLOAD_PROFILE_PHOTO, {
          userId: userId,
          photoBase64: photoBase64
        });
        if (!uploadRes.success) {
          return {
            success: false,
            message: 'Gagal mengunggah foto: ' + (uploadRes.message || 'Error')
          };
        }
        if (uploadRes.data && uploadRes.data.photoURL) {
          photoURL = uploadRes.data.photoURL;
        }
      }
      const updates = {
        displayName,
        whatsapp
      };
      if (photoURL) {
        updates.photoURL = photoURL;
      }
      await db.ref(`users/${userId}`).update(updates);
      // Juga update native Firebase Auth profile
      if (auth && auth.currentUser) {
        const profileUpdates = {
          displayName
        };
        if (photoURL) profileUpdates.photoURL = photoURL;
        await auth.currentUser.updateProfile(profileUpdates);
      }
      return {
        success: true,
        message: 'Profil berhasil diupdate',
        data: photoURL ? {
          photoURL: photoURL
        } : null
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  /**
   * Change password
   */
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const {
        auth,
        firebase
      } = await getFirebase();
      if (auth && auth.currentUser) {
        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
        return {
          success: true,
          message: 'Password berhasil diubah'
        };
      }
    } catch (e) {
      return {
        success: false,
        message: 'Password lama salah atau gagal mengubah password.'
      };
    }
    return {
      success: false,
      message: 'User tidak terautentikasi'
    };
  }
  // ========== CART & WISHLIST SYNC ==========
  /**
   * Sync Cart to Firebase Realtime Database
   */
  static async syncUserCart(userId, cartData) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB tidak tersedia'
      };
      await db.ref(`users/${userId}/cart`).set(cartData);
      return {
        success: true
      };
    } catch (e) {
      void('[APIClient] Error syncing cart:', e);
      return {
        success: false,
        message: e.message
      };
    }
  }
  /**
   * Fetch Cart from Firebase Realtime Database
   */
  static async fetchUserCart(userId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        data: null
      };
      const snapshot = await db.ref(`users/${userId}/cart`).once('value');
      return {
        success: true,
        data: snapshot.val()
      };
    } catch (e) {
      void('[APIClient] Error fetching cart:', e);
      return {
        success: false,
        data: null
      };
    }
  }
  /**
   * Sync Wishlist to Firebase Realtime Database
   */
  static async syncUserWishlist(userId, wishlistData) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB tidak tersedia'
      };
      await db.ref(`users/${userId}/wishlist`).set(wishlistData);
      return {
        success: true
      };
    } catch (e) {
      void('[APIClient] Error syncing wishlist:', e);
      return {
        success: false,
        message: e.message
      };
    }
  }
  /**
   * Fetch Wishlist from Firebase Realtime Database
   */
  static async fetchUserWishlist(userId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        data: null
      };
      const snapshot = await db.ref(`users/${userId}/wishlist`).once('value');
      return {
        success: true,
        data: snapshot.val()
      };
    } catch (e) {
      void('[APIClient] Error fetching wishlist:', e);
      return {
        success: false,
        data: null
      };
    }
  }
  // ========== ORDER ENDPOINTS ==========
  /**
   * Create order (authenticated)
   * Accepts userId as part of orderData or will pass-through
   */
  static createOrder(orderData) {
    return this.createOrderWithAuth(orderData);
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
    // Safety net: generate orderId if caller didn't provide one
    if (!data.orderId) {
      const ts = Date.now();
      const rnd = Math.random().toString(36).substring(2, 8).toUpperCase();
      data.orderId = `INV-${ts}-${rnd}`;
      void('[API] orderId was missing, auto-generated:', data.orderId);
    }
    try {
      // 1. Call GAS to Create Order AND Generate Token simultaneously
      const response = await this.call(GAS_CONFIG.ACTIONS.CREATE_ORDER, data, {
        method: 'POST'
      });
      if (response.success && response.data) {
        // GAS returns orderId and snapToken
        const orderId = response.data.orderId;
        const snapToken = response.data.snapToken || '';
        const snapRedirectUrl = response.data.snapRedirectUrl || '';
        // GAS handles the RTDB writes for initial order via createOrderWithAuth endpoint.
        // We simply return the response to the caller.
        return response;
      } else {
        throw new Error(response.message || 'Gagal membuat pesanan');
      }
    } catch (e) {
      void('[API] Error in createOrderWithAuth:', e);
      return {
        success: false,
        message: e.message || 'Terjadi kesalahan sistem'
      };
    }
  }
  /**
   * Get user's orders
   */
  static async getUserOrders(userId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      // Primary: baca dari userOrders/{userId} - node yang bisa diakses user sendiri
      const userOrdersSnap = await db.ref(`userOrders/${userId}`).once('value');
      let ordersArray = [];
      if (userOrdersSnap.exists()) {
        const raw = userOrdersSnap.val() || {};
        ordersArray = Object.values(raw);
      } else {
        // Fallback untuk user lama: query orders langsung (mungkin diblokir rules, tapi coba)
        try {
          const snapshot = await db.ref('orders').orderByChild('userId').equalTo(userId).once('value');
          const data = snapshot.val() || {};
          ordersArray = Object.values(data);
          // Rebuild userOrders index jika berhasil (otomatis perbaiki user lama)
          if (ordersArray.length > 0) {
            const updates = {};
            ordersArray.forEach(o => {
              if (o.orderId) updates[`userOrders/${userId}/${o.orderId}`] = o;
            });
            db.ref().update(updates).catch(() => {});
          }
        } catch (fallbackErr) {
          void('[API] orders query fallback failed (permission):', fallbackErr.message);
        }
      }
      ordersArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return {
        success: true,
        data: {
          orders: ordersArray,
          count: ordersArray.length
        },
        message: 'Pesanan berhasil diambil'
      };
    } catch (e) {
      void('[API] RTDB getUserOrders failed:', e);
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async getOrderDetail(orderId, userId = null) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snap = await db.ref(`orders/${orderId}`).once('value');
      if (snap.exists()) {
        return {
          success: true,
          data: snap.val()
        };
      }
      return {
        success: false,
        message: 'Order tidak ditemukan'
      };
    } catch (e) {
      void('[API] RTDB getOrderDetail failed:', e);
      // Fallback ke GAS Backend jika Firebase menolak akses (Cross-Domain Public Site tanpa Firebase Auth)
      if (e.message && e.message.toLowerCase().includes('permission denied')) {
        console.log('[API] Fallback ke GAS Backend untuk getOrderDetail...');
        try {
          return await this.call('getOrderDetail', {
            orderId,
            userId
          });
        } catch (gasError) {
          return {
            success: false,
            message: gasError.message
          };
        }
      }
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async getUserOrderStats(userId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snapshot = await db.ref('orders').orderByChild('userId').equalTo(userId).once('value');
      const ordersData = snapshot.val() || {};
      const orders = Object.values(ordersData);
      const stats = {
        totalOrders: orders.length,
        ordersByStatus: {
          pending: 0,
          processing: 0,
          completed: 0,
          cancelled: 0
        },
        paymentStatus: {
          pending: 0,
          paid: 0,
          unpaid: 0,
          expired: 0,
          failed: 0
        },
        totalSpent: 0,
        averageOrderValue: 0,
        lastOrderDate: null,
        activeDomains: 0
      };
      orders.forEach(o => {
        if (o.orderStatus && stats.ordersByStatus[o.orderStatus] !== undefined) {
          stats.ordersByStatus[o.orderStatus]++;
        }
        if (o.paymentStatus && stats.paymentStatus[o.paymentStatus] !== undefined) {
          stats.paymentStatus[o.paymentStatus]++;
          if (o.paymentStatus === 'paid') {
            stats.activeDomains++;
          }
        }
        stats.totalSpent += (Number(o.total) || 0);
        if (!stats.lastOrderDate || new Date(o.createdAt) > new Date(stats.lastOrderDate)) {
          stats.lastOrderDate = o.createdAt;
        }
      });
      if (stats.totalOrders > 0) {
        stats.averageOrderValue = Math.round(stats.totalSpent / stats.totalOrders);
      }
      return {
        success: true,
        data: stats
      };
    } catch (e) {
      void('[API] RTDB getUserOrderStats failed:', e);
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async syncOrderStatus(orderId) {
    try {
      const response = await this.call(GAS_CONFIG.ACTIONS.CHECK_PAYMENT_STATUS, {
        orderId
      }, {
        method: 'POST'
      });
      // Frontend simply queries GAS and returns response. 
      // RTDB sync should only be handled by GAS webhook or GAS endpoint, not frontend.
      return response;
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static generateMidtransToken(orderId, email, phone, name, domain, packageId, total) {
    return this.call(GAS_CONFIG.ACTIONS.GENERATE_MIDTRANS_TOKEN, {
      orderId,
      email,
      phone,
      name,
      domain,
      packageId,
      total
    }, {
      method: 'POST'
    });
  }
  static async checkDomain(domain) {
    try {
      if (!domain) return {
        success: false,
        message: 'Domain diperlukan'
      };
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: true,
        data: {
          domain,
          available: true
        },
        message: 'Tidak dapat memverifikasi - anggap tersedia'
      };
      const domainLower = domain.toLowerCase();
      const domainKey = domainLower.replace(/\./g, '_');
      // Status pembayaran yang dianggap "sudah berhasil" (domain resmi milik orang)
      const PAID_STATUSES = ['paid', 'settlement', 'capture', 'success', 'active'];
      // 1. Fast path: check `domains` mirror node (public readable)
      // Node ini di-update oleh webhook Midtrans ketika pembayaran berhasil
      const domainSnap = await db.ref(`domains/${domainKey}`).once('value');
      if (domainSnap.exists()) {
        const domainData = domainSnap.val();
        // Hanya block jika sudah AKTIF (bayar berhasil). Status 'ordered' = masih rebutan
        const isTaken = domainData.status === 'active';
        return {
          success: true,
          data: {
            domain,
            available: !isTaken,
            isOrdered: domainData.status === 'ordered' // sedang dipesan tapi belum bayar
          },
          message: isTaken ? 'Domain sudah dimiliki orang lain' : 'Domain tersedia'
        };
      }
      // Tidak ada data â†’ domain tersedia
      return {
        success: true,
        data: {
          domain,
          available: true
        },
        message: 'Domain tersedia'
      };
    } catch (e) {
      void('[API] checkDomain failed:', e);
      return {
        success: true,
        data: {
          domain,
          available: true
        },
        message: 'Tidak dapat memverifikasi'
      };
    }
  }
  static async getDomainPricing(tld) {
    try {
      const fallbackPricing = {
        'com': {
          price: 114900,
          period: '1 Tahun'
        },
        'id': {
          price: 190000,
          period: '1 Tahun'
        },
        'co.id': {
          price: 295000,
          period: '1 Tahun'
        },
        'my.id': {
          price: 9900,
          period: '1 Tahun'
        },
        'web.id': {
          price: 9900,
          period: '1 Tahun'
        },
        'cloud': {
          price: 49900,
          period: '1 Tahun'
        },
        'org': {
          price: 149900,
          period: '1 Tahun'
        },
        'net': {
          price: 199900,
          period: '1 Tahun'
        },
        'biz.id': {
          price: 120000,
          period: '1 Tahun'
        },
        'ac.id': {
          price: 65000,
          period: '1 Tahun'
        },
        'or.id': {
          price: 130000,
          period: '1 Tahun'
        },
        'sch.id': {
          price: 59000,
          period: '1 Tahun'
        },
        'top': {
          price: 230000,
          period: '1 Tahun'
        },
        'xyz': {
          price: 29900,
          period: '1 Tahun'
        },
        'it.com': {
          price: 114900,
          period: '1 Tahun'
        },
        'ponpes.id': {
          price: 59000,
          period: '1 Tahun'
        },
        'go.id': {
          price: 250000,
          period: '1 Tahun'
        },
        'net.id': {
          price: 130000,
          period: '1 Tahun'
        }
      };
      const data = fallbackPricing[tld];
      if (!data) return {
        success: false,
        message: 'TLD tidak didukung'
      };
      return {
        success: true,
        data: {
          tld,
          price: data.price,
          period: data.period
        }
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async validatePromoCode(code) {
    if (!code) return {
      success: false,
      message: 'Kode promo diperlukan'
    };
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snap = await db.ref(`promos/${code.toUpperCase()}`).once('value');
      if (!snap.exists()) return {
        success: false,
        message: 'Kode promo tidak ditemukan'
      };
      const promo = snap.val();
      if (!promo.active) return {
        success: false,
        message: 'Kode promo sudah tidak aktif'
      };
      const now = new Date();
      if (promo.start && new Date(promo.start) > now) return {
        success: false,
        message: 'Kode promo belum aktif'
      };
      if (promo.end && new Date(promo.end) < now) return {
        success: false,
        message: 'Kode promo sudah kedaluwarsa'
      };
      if (promo.limit > 0 && (promo.usage || 0) >= promo.limit) return {
        success: false,
        message: 'Kuota promo sudah habis'
      };
      return {
        success: true,
        data: promo,
        message: 'Promo berhasil diterapkan'
      };
    } catch (e) {
      return {
        success: false,
        message: 'Gagal memvalidasi promo: ' + e.message
      };
    }
  }
  static async getAdminStats(adminId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const usersSnap = await db.ref('users').once('value');
      const ordersSnap = await db.ref('orders').once('value');
      const ticketsSnap = await db.ref('tickets').once('value');
      const users = usersSnap.val() || {};
      const orders = ordersSnap.val() || {};
      const tickets = ticketsSnap.val() || {};
      const usersCount = Object.keys(users).length;
      let revenue = 0;
      let subsCount = 0;
      Object.values(orders).forEach(o => {
        // Support both old `status` field and new `paymentStatus` field
        const pStatus = (o.paymentStatus || o.status || '').toLowerCase();
        if (pStatus === 'paid' || pStatus === 'settlement' || pStatus === 'capture' || pStatus === 'success' || pStatus === 'active') {
          revenue += (Number(o.total) || 0);
          subsCount++;
        }
      });
      const ticketsCount = Object.keys(tickets).length;
      const labels = [];
      const dataPoints = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('id-ID', {
          weekday: 'long'
        }));
        dataPoints.push(0);
      }
      const recentActivities = [];
      Object.values(users).forEach(u => {
        if (u.createdAt) {
          try {
            const date = new Date(u.createdAt);
            const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 6) dataPoints[6 - diffDays]++;
            recentActivities.push({
              type: 'user',
              title: `User baru mendaftar: ${u.displayName || u.email}`,
              timeStr: u.createdAt,
              timestamp: date.getTime()
            });
          } catch (e) {}
        }
      });
      Object.values(orders).forEach(o => {
        if (o.createdAt) {
          try {
            recentActivities.push({
              type: 'transaction',
              title: `Order baru: ${o.orderId || 'Order'}`,
              timeStr: o.createdAt,
              timestamp: new Date(o.createdAt).getTime()
            });
          } catch (e) {}
        }
      });
      Object.values(tickets).forEach(t => {
        if (t.createdAt) {
          try {
            recentActivities.push({
              type: 'ticket',
              title: `Tiket baru: ${t.subject || 'Support'}`,
              timeStr: t.createdAt,
              timestamp: new Date(t.createdAt).getTime()
            });
          } catch (e) {}
        }
      });
      recentActivities.sort((a, b) => b.timestamp - a.timestamp);
      return {
        success: true,
        data: {
          users: usersCount,
          revenue: 'Rp ' + revenue.toLocaleString('id-ID'),
          subscriptions: subsCount,
          tickets: ticketsCount,
          recentActivities: recentActivities.slice(0, 10),
          chartData: {
            labels,
            dataPoints
          }
        }
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async getAllUsers(adminId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snap = await db.ref('users').once('value');
      const data = snap.val() || {};
      // Inject Firebase key (uid) into each user object in case it's missing
      const users = Object.entries(data).map(([key, val]) => ({
        uid: key,
        id: key,
        ...val,
        // Ensure uid is always present (might be stored inside the object too)
        ...(val.uid ? {} : {
          uid: key
        })
      }));
      return {
        success: true,
        data: users
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async saveAdminUser(adminId, userData) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const id = userData.uid || userData.id;
      if (id) {
        await db.ref(`users/${id}`).update(userData);
      } else {
        const newRef = db.ref('users').push();
        await newRef.set({
          ...userData,
          uid: newRef.key,
          createdAt: new Date().toISOString()
        });
      }
      return {
        success: true,
        message: 'User berhasil disimpan',
        data: userData
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async deleteAdminUser(adminId, id) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      await db.ref(`users/${id}`).update({
        status: 'suspended'
      });
      return {
        success: true,
        message: 'User berhasil disuspend'
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async getAllTransactions(adminId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snap = await db.ref('orders').once('value');
      const data = snap.val() || {};
      return {
        success: true,
        data: Object.values(data)
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async saveAdminTransaction(adminId, txData) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const id = txData.orderId || txData.id || ('INV-' + Date.now());
      txData.orderId = id;
      await db.ref(`orders/${id}`).update(txData);
      return {
        success: true,
        message: 'Transaksi berhasil disimpan',
        data: txData
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async deleteAdminTransaction(adminId, id) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      await db.ref(`orders/${id}`).remove();
      return {
        success: true,
        message: 'Transaksi berhasil dihapus'
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async getAdminPromos(adminId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snap = await db.ref('promos').once('value');
      const data = snap.val() || {};
      return {
        success: true,
        data: Object.values(data)
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async getPublicPromos() {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snap = await db.ref('promos').once('value');
      const data = snap.val() || {};
      const now = new Date();
      const promos = Object.values(data).filter(p => {
        if (!p.active) return false;
        if (p.start && new Date(p.start) > now) return false;
        if (p.end && new Date(p.end) < now) return false;
        const limit = Number(p.limit) || 0;
        const usage = Number(p.usage) || 0;
        if (limit > 0 && usage >= limit) return false;
        return true;
      });
      return {
        success: true,
        data: promos
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async saveAdminPromo(adminId, promoData) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const code = promoData.code || ('PROMO-' + Date.now());
      promoData.code = code;
      await db.ref(`promos/${code}`).set(promoData);
      return {
        success: true,
        message: 'Promo berhasil disimpan',
        data: promoData
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async deleteAdminPromo(adminId, code) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      await db.ref(`promos/${code}`).remove();
      return {
        success: true,
        message: 'Promo berhasil dihapus'
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static pricingCache = null;
  static async fetchPricingConfig(forceRefresh = false) {
    if (this.pricingCache && !forceRefresh) {
      return {
        success: true,
        data: this.pricingCache
      };
    }
    try {
      const {
        db
      } = await getFirebase();
      if (!db) throw new Error('Firebase DB not available');
      const [snapPackages, snapDomains, snapAddons, snapPromos] = await Promise.all([
        db.ref('packages').once('value'),
        db.ref('domains_pricing').once('value'),
        db.ref('addons').once('value'),
        db.ref('promos').once('value')
      ]);
      this.pricingCache = {
        packages: snapPackages.val() || {},
        domains: snapDomains.val() || {},
        addons: snapAddons.val() || {},
        promos: snapPromos.val() || {}
      };
      return {
        success: true,
        data: this.pricingCache
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async getPackages() {
    const res = await this.fetchPricingConfig();
    if (res.success && res.data && res.data.packages) {
      return {
        success: true,
        data: Object.values(res.data.packages).filter(p => p.active !== false)
      };
    }
    return {
      success: false,
      message: res.message || 'Failed to get packages'
    };
  }
  static async getAdminPackages(adminId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snap = await db.ref('packages').once('value');
      const data = snap.val() || {};
      return {
        success: true,
        data: Object.values(data)
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async saveAdminPackage(adminId, packageData) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const id = packageData.id || ('PKG-' + Date.now());
      packageData.id = id;
      await db.ref(`packages/${id}`).set(packageData);
      return {
        success: true,
        message: 'Paket berhasil disimpan',
        data: packageData
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async deleteAdminPackage(adminId, id) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      await db.ref(`packages/${id}`).remove();
      return {
        success: true,
        message: 'Paket berhasil dihapus'
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  // --- ADMIN DOMAINS API ---
  static async getAdminDomains(adminId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snap = await db.ref('domains_pricing').once('value');
      const data = snap.val() || {};
      return {
        success: true,
        data: Object.values(data)
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async saveAdminDomain(adminId, domainData) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const key = domainData.ext.replace('.', '').replace(/\./g, '_');
      await db.ref(`domains_pricing/${key}`).set(domainData);
      return {
        success: true,
        message: 'Domain berhasil disimpan',
        data: domainData
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async deleteAdminDomain(adminId, ext) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const key = ext.replace('.', '').replace(/\./g, '_');
      await db.ref(`domains_pricing/${key}`).remove();
      return {
        success: true,
        message: 'Domain berhasil dihapus'
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  // --- ADMIN ADDONS API ---
  static async getAdminAddons(adminId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snap = await db.ref('addons').once('value');
      const data = snap.val() || {};
      return {
        success: true,
        data: Object.values(data)
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async saveAdminAddon(adminId, addonData) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const id = addonData.id || ('ADDON-' + Date.now());
      addonData.id = id;
      await db.ref(`addons/${id}`).set(addonData);
      return {
        success: true,
        message: 'Addon berhasil disimpan',
        data: addonData
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async deleteAdminAddon(adminId, id) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      await db.ref(`addons/${id}`).remove();
      return {
        success: true,
        message: 'Addon berhasil dihapus'
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async getAdminTickets(adminId) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const snap = await db.ref('tickets').once('value');
      const data = snap.val() || {};
      return {
        success: true,
        data: Object.values(data)
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async saveAdminTicket(adminId, ticketData) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      const id = ticketData.id || ('TICKET-' + Date.now());
      ticketData.id = id;
      await db.ref(`tickets/${id}`).update(ticketData);
      return {
        success: true,
        message: 'Tiket berhasil disimpan',
        data: ticketData
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  static async deleteAdminTicket(adminId, id) {
    try {
      const {
        db
      } = await getFirebase();
      if (!db) return {
        success: false,
        message: 'Firebase DB not available'
      };
      await db.ref(`tickets/${id}`).remove();
      return {
        success: true,
        message: 'Tiket berhasil dihapus'
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }
  // ==========================================
  // DNS MANAGEMENT (GAS BACKEND INTEGRATION)
  // ==========================================
  static async setupCloudflareZone(domain) {
    if (!AuthManager.isLoggedIn()) return {
      success: false,
      message: 'Tidak ada sesi aktif'
    };
    return this.call(GAS_CONFIG.ACTIONS.SETUP_CLOUDFLARE_ZONE, {
      domain
    });
  }
  static async getDnsRecords(domain) {
    if (!AuthManager.isLoggedIn()) return {
      success: false,
      message: 'Tidak ada sesi aktif'
    };
    return this.call(GAS_CONFIG.ACTIONS.GET_DNS_RECORDS, {
      domain
    });
  }
  static async addDnsRecord(domain, recordData) {
    if (!AuthManager.isLoggedIn()) return {
      success: false,
      message: 'Tidak ada sesi aktif'
    };
    return this.call(GAS_CONFIG.ACTIONS.ADD_DNS_RECORD, {
      domain,
      recordData
    });
  }
  static async editDnsRecord(domain, recordId, recordData) {
    if (!AuthManager.isLoggedIn()) return {
      success: false,
      message: 'Tidak ada sesi aktif'
    };
    return this.call(GAS_CONFIG.ACTIONS.EDIT_DNS_RECORD, {
      domain,
      recordId,
      recordData
    });
  }
  static async deleteDnsRecord(domain, recordId) {
    if (!AuthManager.isLoggedIn()) return {
      success: false,
      message: 'Tidak ada sesi aktif'
    };
    return this.call(GAS_CONFIG.ACTIONS.DELETE_DNS_RECORD, {
      domain,
      recordId
    });
  }
}
// Export for use
window.APIClient = APIClient;
export default APIClient;