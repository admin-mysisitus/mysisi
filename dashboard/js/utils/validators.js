/**
 * Dashboard Validators - DEPRECATED
 * ===================================
 * All validators telah dipindahkan ke /assets/js/modules/unified-utils.js
 * File ini dipertahankan hanya untuk backward compatibility
 * 
 * GUNAKAN DARI LOKASI BARU:
 * import { isValidEmail, isValidPhone, isValidDomain, DOMAIN_PACKAGES } from '/assets/js/modules/unified-utils.js'
 */

// Re-export dari unified-utils untuk backward compatibility
export { isValidEmail, isValidEmailStrict, isValidPassword, isValidPhoneNumber, isValidDomain, DOMAIN_PACKAGES } from '/assets/js/modules/unified-utils.js';
