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

import { AuthManager } from './unified-auth.js';
import { GAS_CONFIG } from '../config/api.config.js';

export class APIClient {
  static DEFAULT_TIMEOUT = 30000; // 30 seconds
  static MAX_RETRIES = 2;
  static RETRY_DELAY = 1000; // 1 second

  /**
   * Make API call to GAS backend
   * Handles errors, retries, timeouts
   */
  static async call(action, data = {}, options = {}) {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.MAX_RETRIES,
      method = 'GET'
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const response = await this.makeRequest(action, data, method, timeout);

        // Validate response format
        if (!response.success === false && typeof response.success !== 'boolean') {
          console.warn('[API] Response missing success field, assuming false');
          response.success = false;
        }

        // Handle auth errors
        if (response.success === false && response.message?.includes('Auth')) {
          console.error('[API] Auth error detected, clearing session');
          AuthManager.clearSession();
          throw new Error('Session expired. Please login again.');
        }

        return response;
      } catch (error) {
        lastError = error;
        console.warn(`[API] Attempt ${attempt} failed:`, error.message);

        // Don't retry on auth errors
        if (error.message?.includes('Auth')) {
          throw error;
        }

        // Don't retry on validation errors
        if (error.message?.includes('Validation')) {
          throw error;
        }

        // Retry on network/timeout errors
        if (attempt < retries + 1) {
          await this.delay(this.RETRY_DELAY);
        }
      }
    }

    console.error('[API] All retry attempts failed:', lastError);
    throw new Error(lastError?.message || 'API call failed');
  }

  /**
   * Make actual HTTP request
   * CORS-optimized: Avoids preflight by:
   * - Using GET requests for read operations
   * - Using application/x-www-form-urlencoded for POST (not JSON)
   * - Not sending custom headers
   */
  static async makeRequest(action, data, method, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      let url = `${GAS_CONFIG.URL}?action=${action}`;
      let options = {
        method: method,
        signal: controller.signal
      };

      // For GET requests: Add all data to URL query string
      if (method === 'GET') {
        const params = new URLSearchParams({ action, ...data });
        url = `${GAS_CONFIG.URL}?${params}`;
        // GET with no custom headers - no preflight
      } 
      // For POST requests: Use form-urlencoded format to avoid preflight
      else if (method === 'POST') {
        const params = new URLSearchParams({ action, ...data });
        options.body = params.toString();
        // application/x-www-form-urlencoded is a simple request, no preflight
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Helper: delay function for retries
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========== AUTH ENDPOINTS ==========

  /**
   * Register new user
   */
  static registerUser(email, password, displayName = '', whatsapp = '') {
    return this.call('registerUser', {
      email,
      password,
      displayName: displayName || email.split('@')[0],
      whatsapp
    }, { method: 'POST' });
  }

  /**
   * Login user
   */
  static loginUser(email, password) {
    return this.call('loginUser', {
      email,
      password
    }, { method: 'POST' });
  }

  /**
   * Verify email token (auto-login after registration)
   * Using GET request to avoid CORS preflight issues
   */
  static verifyEmailToken(token) {
    return this.call('verifyEmailToken', { token }, { method: 'GET' });
  }

  /**
   * Verify Google OAuth token
   * Using GET request to avoid CORS preflight issues
   */
  static verifyGoogleToken(token) {
    return this.call('verifyGoogleToken', { token }, { method: 'GET' });
  }

  /**
   * Request password reset
   * Using GET request to avoid CORS preflight issues
   */
  static requestPasswordReset(email) {
    return this.call('requestPasswordReset', { email }, { method: 'GET' });
  }

  /**
   * Reset password with token
   */
  static resetPassword(token, password) {
    return this.call('resetPassword', { token, password }, { method: 'POST' });
  }

  // ========== USER PROFILE ENDPOINTS ==========

  /**
   * Get user profile
   * Using GET request to avoid CORS preflight issues
   */
  static getUserProfile(userId) {
    return this.call('getUserProfile', { userId }, { method: 'GET' });
  }

  /**
   * Update user profile
   */
  static updateUserProfile(userId, displayName, whatsapp) {
    return this.call('updateUserProfile', {
      userId,
      displayName,
      whatsapp
    }, { method: 'POST' });
  }

  /**
   * Change password
   */
  static changePassword(userId, oldPassword, newPassword) {
    return this.call('changePassword', {
      userId,
      oldPassword,
      newPassword
    }, { method: 'POST' });
  }

  /**
   * Delete account
   */
  static deleteAccount(userId, password) {
    return this.call('deleteAccount', {
      userId,
      password
    }, { method: 'POST' });
  }

  // ========== ORDER ENDPOINTS ==========

  /**
   * Create order (authenticated)
   */
  static createOrder(orderData) {
    return this.call('createOrderWithAuth', orderData, { method: 'POST' });
  }

  /**
   * Get user's orders
   */
  static getUserOrders(userId) {
    return this.call('getUserOrders', { userId });
  }

  /**
   * Get order detail
   */
  static getOrderDetail(orderId, userId) {
    return this.call('getOrderDetail', { orderId, userId });
  }

  /**
   * Update order status
   */
  static updateOrderStatus(orderId, status) {
    return this.call('updateOrderStatus', {
      orderId,
      status
    }, { method: 'POST' });
  }

  /**
   * Get user order statistics
   */
  static getUserOrderStats(userId) {
    return this.call('getUserOrderStats', { userId });
  }

  // ========== PAYMENT ENDPOINTS ==========

  /**
   * Generate Midtrans payment token
   */
  static generateMidtransToken(orderId, email, phone, name, domain, packageId, total) {
    return this.call('generateMidtransToken', {
      orderId,
      email,
      phone,
      name,
      domain,
      packages: packageId,
      total
    }, { method: 'POST' });
  }

  /**
   * Verify payment status
   */
  static verifyPaymentStatus(transactionId, orderId) {
    return this.call('verifyPaymentStatus', {
      transactionId,
      orderId
    });
  }

  // ========== DOMAIN ENDPOINTS ==========

  /**
   * Check domain availability
   */
  static checkDomain(domain) {
    return this.call('checkDomain', { domain });
  }

  /**
   * Get domain pricing
   */
  static getDomainPricing(tld) {
    return this.call('getDomainPricing', { tld });
  }

  // ========== PROMO ENDPOINTS ==========

  /**
   * Validate promo code
   */
  static validatePromoCode(code) {
    return this.call('validatePromoCode', { code });
  }

  // ========== UTILITY ENDPOINTS ==========

  /**
   * Health check
   */
  static async healthCheck() {
    try {
      const response = await this.call('healthCheck', {});
      return response.success;
    } catch (error) {
      console.error('[API] Health check failed:', error);
      return false;
    }
  }
}

// Export for use
export default APIClient;
