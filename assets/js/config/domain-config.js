/**
 * Domain Configuration - Centralized domain extensions and pricing
 * Consolidated from: cek-domain.js, checkout-pricing.js, gas.js
 */

// All supported domain extensions with pricing and info
const DOMAIN_EXTENSIONS = [
  {
    ext: '.com',
    oldPrice: 209900,
    newPrice: 159900,
    info: 'Ideal untuk bisnis global',
    highlight: 'best',
    label: '<i class="fas fa-star"></i> Terpopuler'
  },
  {
    ext: '.id',
    oldPrice: 249000,
    newPrice: 99000,
    info: 'Domain Indonesia resmi',
    highlight: 'best',
    label: '<i class="fas fa-star"></i> Best Deal'
  },
  {
    ext: '.co.id',
    oldPrice: 299000,
    newPrice: 295000,
    info: 'Terpercaya untuk perusahaan',
    highlight: 'business',
    label: '<i class="fas fa-briefcase"></i> Bisnis'
  },
  {
    ext: '.my.id',
    oldPrice: 35000,
    newPrice: 9900,
    info: 'Pribadi atau portofolio',
    highlight: 'cheap',
    label: '<i class="fas fa-coins"></i> Super Hemat'
  },
  {
    ext: '.web.id',
    oldPrice: 50000,
    newPrice: 9900,
    info: 'Website profesional',
    highlight: 'cheap',
    label: '<i class="fas fa-coins"></i> Super Hemat'
  },
  {
    ext: '.cloud',
    oldPrice: 389000,
    newPrice: 49900,
    info: 'Hosting atau cloud',
    highlight: 'cheap',
    label: '<i class="fas fa-coins"></i> Super Hemat'
  },
  {
    ext: '.org',
    oldPrice: 189900,
    newPrice: 149900,
    info: 'Organisasi & komunitas',
    highlight: 'none',
    label: ''
  },
  {
    ext: '.net',
    oldPrice: 219900,
    newPrice: 199900,
    info: 'Internet & teknologi',
    highlight: 'none',
    label: ''
  },
  {
    ext: '.biz.id',
    oldPrice: 150000,
    newPrice: 120000,
    info: 'Bisnis lokal',
    highlight: 'business',
    label: '<i class="fas fa-briefcase"></i> Bisnis'
  },
  {
    ext: '.ac.id',
    oldPrice: 75000,
    newPrice: 65000,
    info: 'Lembaga pendidikan',
    highlight: 'none',
    label: ''
  },
  {
    ext: '.or.id',
    oldPrice: 150000,
    newPrice: 130000,
    info: 'Organisasi nirlaba',
    highlight: 'none',
    label: ''
  },
  {
    ext: '.sch.id',
    oldPrice: 59000,
    newPrice: 59000,
    info: 'Sekolah & pendidikan',
    highlight: 'none',
    label: ''
  }
];

// Multi-part extensions that need special parsing
const MULTI_PART_EXTENSIONS = [
  '.co.id',
  '.my.id',
  '.sch.id',
  '.ac.id',
  '.go.id',
  '.or.id',
  '.web.id',
  '.biz.id',
  '.net.id'
];

// Domain pricing multipliers based on years
const DOMAIN_MULTIPLIERS = {
  1: 1.0,
  2: 1.8,
  3: 2.5,
  5: 4.0
};

// Base domain price for calculations
const BASE_DOMAIN_PRICE = 299000;

/**
 * Get all domain extensions
 * @returns {Array} Array of domain extension objects
 */
function getDomainExtensions() {
  return DOMAIN_EXTENSIONS;
}

/**
 * Get extension data by extension string (e.g., '.com')
 * @param {string} ext - Extension (e.g., '.com')
 * @returns {Object|null} Extension object or null if not found
 */
function getExtensionData(ext) {
  return DOMAIN_EXTENSIONS.find(item => item.ext === ext.toLowerCase()) || null;
}

/**
 * Get multiplier for domain duration
 * @param {number} years - Number of years (1, 2, 3, or 5)
 * @returns {number} Multiplier value
 */
function getDomainMultiplier(years) {
  return DOMAIN_MULTIPLIERS[years] || 1.0;
}

/**
 * Get multi-part extensions list
 * @returns {Array} Array of multi-part extensions
 */
function getMultiPartExtensions() {
  return MULTI_PART_EXTENSIONS;
}

/**
 * Parse domain into base and extension
 * @param {string} domain - Domain to parse (e.g., 'example.com')
 * @returns {Object} { base, ext, isFullDomain, isInvalid }
 */
function parseDomain(input) {
  const cleaned = input.toLowerCase().trim();

  // Check multi-part extensions first
  for (const ext of MULTI_PART_EXTENSIONS) {
    if (cleaned.endsWith(ext)) {
      return {
        base: cleaned.slice(0, -ext.length),
        ext,
        isFullDomain: true,
        isInvalid: false
      };
    }
  }

  // Check single-part extensions
  if (cleaned.includes('.')) {
    const ext = cleaned.slice(cleaned.lastIndexOf('.'));

    if (DOMAIN_EXTENSIONS.some(e => e.ext === ext)) {
      return {
        base: cleaned.slice(0, -ext.length),
        ext,
        isFullDomain: true,
        isInvalid: false
      };
    }

    return {
      base: cleaned,
      ext: null,
      isFullDomain: false,
      isInvalid: true
    };
  }

  return {
    base: cleaned,
    ext: null,
    isFullDomain: false,
    isInvalid: false
  };
}

/**
 * Validate domain format
 * @param {string} domain - Domain to validate
 * @returns {Object} { valid, error }
 */
function validateDomain(domain) {
  if (!domain || !domain.trim()) {
    return { valid: false, error: 'Masukkan nama domain untuk memulai (minimal 3 karakter)' };
  }

  const { base, isInvalid } = parseDomain(domain);

  if (isInvalid) {
    return { valid: false, error: 'Ekstensi tidak valid. Coba: .com, .id, .co.id, atau ekstensi lainnya' };
  }

  if (base.length < 3) {
    return { valid: false, error: 'Nama domain minimal 3 karakter' };
  }

  const baseRegex = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
  if (!baseRegex.test(base)) {
    return { valid: false, error: 'Nama domain hanya boleh mengandung huruf, angka, dan strip (-)' };
  }

  return { valid: true, error: null };
}

/**
 * Calculate domain price based on extension and years
 * @param {string} ext - Extension (e.g., '.com')
 * @param {number} years - Number of years
 * @returns {number} Price in Rupiah
 */
function calculateDomainPrice(ext, years = 1) {
  const extData = getExtensionData(ext);
  if (!extData) return 0;

  const multiplier = getDomainMultiplier(years);
  return Math.round(extData.newPrice * multiplier);
}

// ES6 Module - no CommonJS export needed
