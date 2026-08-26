/**
 * ========================================
 * CENTRALIZED API & PAYMENT CONFIGURATION
 * ========================================
 * Single source of truth untuk semua API endpoints dan credentials
 * Update di sini akan otomatis reflect di seluruh aplikasi
 */
// ========== GOOGLE APPS SCRIPT CONFIGURATION ==========
export const GAS_CONFIG = {
  // Main API endpoint untuk semua backend calls
  URL: 'https://script.google.com/macros/s/AKfycbxWKFJdqvk2Ntt1ZRfC_-f0jgueHpkptQgDSa3bzJEtkMUI3WbP-6GJUAR5gdoXBOKH/exec',
  // Timeout untuk fetch calls (dalam milliseconds)
  TIMEOUT: 60000,
  // Actions/endpoints yang dipanggil
  ACTIONS: {
    // Auth related
    REGISTER_USER: 'registerUser',
    LOGIN_USER: 'loginUser',
    VALIDATE_USER: 'validateUser',
    CHANGE_PASSWORD: 'changePassword',
    REQUEST_PASSWORD_RESET: 'requestPasswordReset',
    RESET_PASSWORD: 'resetPassword',
    VERIFY_EMAIL: 'verifyEmail',
    // Promo & Domain related
    VALIDATE_PROMO: 'validatePromoCode',
    CHECK_DOMAIN: 'checkDomain',
    // Order related
    CREATE_ORDER: 'createOrderWithAuth',
    GET_ORDERS: 'getUserOrders',
    GET_ORDER_DETAIL: 'getOrderDetail',
    GET_USER_ORDER_STATS: 'getUserOrderStats',
    // Payment related
    GET_SNAP_TOKEN: 'getSnapToken',
    VERIFY_PAYMENT: 'verifyPaymentStatus',
    HANDLE_MIDTRANS_WEBHOOK: 'handleMidtransWebhook',
    // User profile
    GET_USER_PROFILE: 'getUserProfile',
    UPDATE_USER_PROFILE: 'updateUserProfile',
    // Admin Settings CMS
    GET_SETTINGS: 'getsettings',
    SAVE_SETTINGS: 'savesettings',
    GET_EMAIL_TEMPLATES: 'getemailtemplates',
    SAVE_EMAIL_TEMPLATE: 'saveemailtemplate',
  }
};
// ========== MIDTRANS PAYMENT GATEWAY CONFIGURATION ==========
export const MIDTRANS_CONFIG = {
  // Environment: 'sandbox' untuk development, 'production' untuk live
  ENVIRONMENT: 'sandbox',
  // Client Key - untuk frontend Snap integration
  CLIENT_KEY: 'Mid-client-5Pt2HLTUbjJd24VZ',
  // Server Key - untuk backend verification & token generation
  // Note: Must be set in Google Apps Script Properties, not here
  SERVER_KEY: '',
  // Snap API URLs
  SNAP_URL: {
    sandbox: 'https://app.sandbox.midtrans.com/snap/snap.js',
    production: 'https://app.midtrans.com/snap/snap.js'
  },
  // Payment status values
  STATUS: {
    PENDING: 'pending',
    SETTLEMENT: 'settlement',
    EXPIRED: 'expire',
    CANCELLED: 'cancel',
    FAILED: 'failure',
    DENIED: 'deny'
  }
};
