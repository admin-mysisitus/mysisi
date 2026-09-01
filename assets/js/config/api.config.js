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
  URL: 'https://script.google.com/macros/s/AKfycbxhlES3h0EyQgTFYL7u62FS2W67EYW_XlW5gWRFidAgK5OAOvdSy_qSSesWc-nr62VT/exec',
  // Timeout untuk fetch calls (dalam milliseconds)
  TIMEOUT: 60000,
  ACTIONS: {
    // Auth & Security related
    CHECK_LOGIN_RATE_LIMIT: 'checkloginratelimit',
    HANDLE_FAILED_LOGIN: 'handlefailedlogin',
    UPLOAD_PROFILE_PHOTO: 'uploadprofilephoto',
    // Order & Payment related
    CREATE_ORDER: 'createOrderWithAuth',
    CHECK_PAYMENT_STATUS: 'checkPaymentStatus',
    GENERATE_MIDTRANS_TOKEN: 'generateMidtransToken',
    // DNS & Cloudflare related
    SETUP_CLOUDFLARE_ZONE: 'setupCloudflareZone',
    GET_DNS_RECORDS: 'getDnsRecords',
    ADD_DNS_RECORD: 'addDnsRecord',
    EDIT_DNS_RECORD: 'editDnsRecord',
    DELETE_DNS_RECORD: 'deleteDnsRecord',
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