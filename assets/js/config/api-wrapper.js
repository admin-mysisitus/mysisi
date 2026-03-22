/**
 * ========================================
 * UNIFIED API WRAPPER & UTILITIES
 * ========================================
 * Centralized API call handler dengan:
 * - Built-in error handling & timeout
 * - Env-aware configuration
 * - Startup validation
 * - Request/response logging
 * 
 * USAGE:
 *   const result = await API.call('loginUser', { email, password });
 *   const result = await API.post('createOrder', orderData);
 */

import { GAS_CONFIG, MIDTRANS_CONFIG, DOMAIN_PACKAGES, buildGASUrl, buildGASRequest } from './api.config.js';

// ========== ENVIRONMENT DETECTION ==========
const ENVIRONMENT = detectEnvironment();

function detectEnvironment() {
  const hostname = window.location.hostname;
  
  // Production
  if (hostname === 'sisitus.com' || hostname === 'www.sisitus.com') {
    return 'production';
  }
  
  // Staging
  if (hostname.includes('staging') || hostname.includes('staging.sisitus')) {
    return 'staging';
  }
  
  // Development/Local
  return 'sandbox';
}

// ========== API WRAPPER CLASS ==========
class APIClient {
  constructor(config) {
    this.config = config;
    this.requestLog = [];
    this.validateConfig();
  }

  /**
   * Validate configuration on startup
   */
  validateConfig() {
    const errors = [];
    
    // Check GAS URL
    if (!this.config.GAS_CONFIG.URL) {
      errors.push('❌ GAS_CONFIG.URL tidak ditemukan');
    } else if (!this.config.GAS_CONFIG.URL.includes('script.google.com')) {
      errors.push('❌ GAS_CONFIG.URL format tidak valid');
    }
    
    // Check MIDTRANS config
    if (!this.config.MIDTRANS_CONFIG.CLIENT_KEY) {
      errors.push('⚠️ MIDTRANS_CONFIG.CLIENT_KEY tidak ditemukan');
    }
    if (!this.config.MIDTRANS_CONFIG.SERVER_KEY) {
      errors.push('⚠️ MIDTRANS_CONFIG.SERVER_KEY tidak ditemukan');
    }
    
    // Check DOMAIN_PACKAGES
    const packages = Object.keys(this.config.DOMAIN_PACKAGES);
    if (packages.length === 0) {
      errors.push('❌ DOMAIN_PACKAGES kosong');
    }
    
    // Log results
    if (errors.length > 0) {
      console.warn('⚠️ API Configuration Issues:');
      errors.forEach(err => console.warn(err));
      
      // Still functional dengan config partial
      if (errors.filter(e => e.startsWith('❌')).length > 0) {
        console.error('🔴 Critical config errors - some features may not work');
      }
    } else {
      console.log('✅ API Configuration valid - all systems ready');
    }
  }

  /**
   * GET request ke GAS dengan query parameters
   * @param {string} action - Action name
   * @param {object} params - Query parameters
   * @param {object} options - Fetch options override
   */
  async call(action, params = {}, options = {}) {
    try {
      // Log request
      this.log('GET', action, params);
      
      // Build URL
      const url = buildGASUrl(action, params);
      
      // Set timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.GAS_CONFIG.TIMEOUT);
      
      // Fetch
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Parse result
      const result = await this.parseResponse(response);
      
      // Log response
      this.log('RESPONSE', action, result);
      
      return result;
    } catch (error) {
      return this.handleError(error, action, 'GET');
    }
  }

  /**
   * POST request ke GAS dengan body JSON
   * @param {string} action - Action name
   * @param {object} data - Request body
   * @param {object} options - Fetch options override
   */
  async post(action, data = {}, options = {}) {
    try {
      // Add action to data
      const payload = { action, ...data };
      
      // Log request
      this.log('POST', action, payload);
      
      // Build request
      const requestOptions = {
        ...buildGASRequest(payload),
        ...options
      };
      
      // Set timeout if using AbortSignal.timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.GAS_CONFIG.TIMEOUT);
      
      // Fetch
      const response = await fetch(this.config.GAS_CONFIG.URL, {
        ...requestOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Parse result
      const result = await this.parseResponse(response);
      
      // Log response
      this.log('RESPONSE', action, result);
      
      return result;
    } catch (error) {
      return this.handleError(error, action, 'POST');
    }
  }

  /**
   * Parse API response dengan error handling
   */
  async parseResponse(response) {
    // Check status
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Try JSON parse
    try {
      return await response.json();
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }
  }

  /**
   * Handle errors dengan informative messages
   */
  handleError(error, action, method) {
    let message = 'Terjadi kesalahan';
    let statusCode = 'UNKNOWN';
    
    if (error.name === 'AbortError') {
      message = `Koneksi timeout (${this.config.GAS_CONFIG.TIMEOUT / 1000}s)`;
      statusCode = 'TIMEOUT';
    } else if (error instanceof TypeError) {
      message = 'Gagal terhubung ke server (cek koneksi internet)';
      statusCode = 'NETWORK_ERROR';
    } else {
      message = error.message || message;
      statusCode = 'ERROR';
    }
    
    // Log error
    this.log('ERROR', action, { statusCode, message });
    
    return {
      success: false,
      message: message,
      error: error.message,
      statusCode: statusCode
    };
  }

  /**
   * Internal logging untuk development & debugging
   */
  log(type, action, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      action,
      data,
      environment: ENVIRONMENT
    };
    
    this.requestLog.push(logEntry);
    
    // Keep only last 50 requests
    if (this.requestLog.length > 50) {
      this.requestLog.shift();
    }
    
    // Log to console in development
    if (ENVIRONMENT !== 'production') {
      const style = type === 'ERROR' ? 'color: red; font-weight: bold;' :
                    type === 'RESPONSE' ? 'color: green;' :
                    type === 'POST' ? 'color: blue;' : 'color: gray;';
      
      console.log(`%c[${type}] ${action}`, style, data);
    }
  }

  /**
   * Get request history (untuk debugging)
   */
  getRequestLog() {
    return this.requestLog;
  }

  /**
   * Clear request logger
   */
  clearLog() {
    this.requestLog = [];
  }

  /**
   * Get environment info
   */
  getEnvironmentInfo() {
    return {
      environment: ENVIRONMENT,
      url: this.config.GAS_CONFIG.URL,
      timeout: this.config.GAS_CONFIG.TIMEOUT,
      packages: Object.keys(this.config.DOMAIN_PACKAGES).length,
      midtransEnv: this.config.MIDTRANS_CONFIG.ENVIRONMENT
    };
  }
}

// ========== SINGLETON INSTANCE ==========
const API = new APIClient({
  GAS_CONFIG,
  MIDTRANS_CONFIG,
  DOMAIN_PACKAGES
});

// ========== SHORTCUT FUNCTIONS FOR COMMON OPERATIONS ==========

/**
 * Auth operations
 */
export const AuthAPI = {
  register: (email, password, displayName, whatsapp) =>
    API.call('registerUser', { email, password, displayName, whatsapp }),
  
  login: (email, password) =>
    API.call('loginUser', { email, password }),
  
  logout: () => {
    sessionStorage.removeItem('sisitus_user');
  },
  
  getUserProfile: (userId) =>
    API.call('getUserProfile', { userId }),
  
  updateProfile: (userId, name, whatsapp) =>
    API.call('updateUserProfile', { userId, name, whatsapp }),
  
  changePassword: (userId, oldPassword, newPassword) =>
    API.call('changePassword', { userId, oldPassword, newPassword }),
  
  requestPasswordReset: (email) =>
    API.call('requestPasswordReset', { email })
};

/**
 * Order operations
 */
export const OrderAPI = {
  create: (orderData) =>
    API.post('createOrderWithAuth', orderData),
  
  getDetail: (orderId, userId) =>
    API.call('getOrderDetail', { orderId, userId }),
  
  getUserOrders: (userId) =>
    API.call('getUserOrders', { userId }),
  
  getStatus: (orderId) =>
    API.call('getOrderStatus', { orderId }),
  
  updateStatus: (orderId, status) =>
    API.call('updateOrderStatus', { orderId, status })
};

/**
 * Domain operations
 */
export const DomainAPI = {
  check: (domain) =>
    API.call('checkDomain', { domain }),
  
  getPricing: (domain, years) =>
    API.call('getDomainPrice', { domain, years })
};

/**
 * Promo operations
 */
export const PromoAPI = {
  validate: (code) =>
    API.call('validatePromoCode', { code }),
  
  getDetails: (code) =>
    API.call('getPromoDetails', { code })
};

/**
 * Payment operations
 */
export const PaymentAPI = {
  generateToken: (orderId, email, phone, nama, domain, paket, total) =>
    API.call('generateMidtransToken', { orderId, email, phone, nama, domain, paket, total }),
  
  verifyStatus: (orderId) =>
    API.call('verifyPaymentStatus', { orderId }),
  
  handleWebhook: (notification) =>
    API.post('handleMidtransWebhook', notification)
};

// ========== EXPORT MAIN API CLIENT ==========
export default API;
export { API, ENVIRONMENT };
