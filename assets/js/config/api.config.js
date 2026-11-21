export const GAS_CONFIG = {
  URL: 'https://script.google.com/macros/s/AKfycbydqCvHyaa1UOzo6-l-A-4sU-LntcZa7_XZ8gxxoMhdnmtu1SLilKT9ivtZQ0jExL9b/exec',
  TIMEOUT: 60000,
  ACTIONS: {
    CHECK_LOGIN_RATE_LIMIT: 'checkloginratelimit',
    HANDLE_FAILED_LOGIN: 'handlefailedlogin',
    UPLOAD_PROFILE_PHOTO: 'uploadprofilephoto',
    CREATE_ORDER: 'createOrderWithAuth',
    CHECK_PAYMENT_STATUS: 'checkPaymentStatus',
    GENERATE_MIDTRANS_TOKEN: 'generateMidtransToken',
    SETUP_CLOUDFLARE_ZONE: 'setupCloudflareZone',
    GET_DNS_RECORDS: 'getDnsRecords',
    ADD_DNS_RECORD: 'addDnsRecord',
    EDIT_DNS_RECORD: 'editDnsRecord',
    DELETE_DNS_RECORD: 'deleteDnsRecord',
    GET_SETTINGS: 'getsettings',
    SAVE_SETTINGS: 'savesettings',
    GET_EMAIL_TEMPLATES: 'getemailtemplates',
    SAVE_EMAIL_TEMPLATE: 'saveemailtemplate',
  }
};
export const MIDTRANS_CONFIG = {
  ENVIRONMENT: 'sandbox',
  CLIENT_KEY: 'Mid-client-5Pt2HLTUbjJd24VZ',
  SNAP_URL: {
    sandbox: 'https://app.sandbox.midtrans.com/snap/snap.js',
    production: 'https://app.midtrans.com/snap/snap.js'
  },
  STATUS: {
    PENDING: 'pending',
    SETTLEMENT: 'settlement',
    EXPIRED: 'expire',
    CANCELLED: 'cancel',
    FAILED: 'failure',
    DENIED: 'deny'
  }
};