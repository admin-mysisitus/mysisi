/**
 * Checkout Pricing Module - Phase 2
 * Handles: Pricing calculations, domain duration, addons, tax, promo codes
 * Version: 1.0
 */

// ============================================================================
// PRICING CONFIGURATION
// ============================================================================

const PRICING_CONFIG = {
  // Domain base price per year
  domain: 299000,

  // Package prices per year
  packages: {
    starter: 599000,
    grower: 1299000,
    pioneer: 2399000
  },

  // Addon prices (one-time or yearly)
  addons: {
    ssl: {
      name: 'SSL Extended Certificate',
      price: 500000,
      id: 'ssl'
    },
    email: {
      name: 'Email Hosting Pro',
      price: 200000,
      id: 'email'
    },
    cdn: {
      name: 'CDN Global',
      price: 300000,
      id: 'cdn'
    }
  },

  // Tax rate (PPN)
  tax: 0.11, // 11%

  // Domain duration multipliers
  durationMultipliers: {
    1: 1.0,     // 1 year: 100%
    2: 1.8,     // 2 years: 80% off (discount)
    3: 2.5,     // 3 years: ~83% off
    5: 3.8      // 5 years: ~84% off
  }
};

// ============================================================================
// PRICING STATE
// ============================================================================

let pricingState = {
  domain: '',
  domainDuration: 1, // years
  packageId: '',
  selectedAddons: [], // array of addon IDs
  promoCode: '',
  promoDiscount: 0, // percentage or fixed amount
  discountType: 'percentage', // 'percentage' or 'fixed'
  subtotal: 0,
  ppn: 0,
  discount: 0,
  total: 0
};

// ============================================================================
// CALCULATE functions
// ============================================================================

/**
 * Calculate domain price with duration multiplier
 */
function calculateDomainPrice(years = 1) {
  const multiplier = PRICING_CONFIG.durationMultipliers[years] || 1.0;
  return Math.round(PRICING_CONFIG.domain * multiplier);
}

/**
 * Calculate package price
 */
function calculatePackagePrice(packageId) {
  return PRICING_CONFIG.packages[packageId] || 0;
}

/**
 * Calculate addons total
 */
function calculateAddonsPrice(addonIds = []) {
  return addonIds.reduce((total, id) => {
    const addon = PRICING_CONFIG.addons[id];
    return total + (addon ? addon.price : 0);
  }, 0);
}

/**
 * Calculate subtotal (domain + package + addons)
 */
function calculateSubtotal(domain, duration, packageId, addonIds) {
  const domainPrice = calculateDomainPrice(duration);
  const packagePrice = calculatePackagePrice(packageId);
  const addonsPrice = calculateAddonsPrice(addonIds);

  return domainPrice + packagePrice + addonsPrice;
}

/**
 * Calculate PPN (11%)
 */
function calculatePPN(subtotal) {
  return Math.round(subtotal * PRICING_CONFIG.tax);
}

/**
 * Calculate discount from promo code
 */
function calculateDiscount(subtotal, promoDiscount, discountType) {
  if (!promoDiscount) return 0;

  if (discountType === 'percentage') {
    return Math.round(subtotal * (promoDiscount / 100));
  } else if (discountType === 'fixed') {
    return Math.min(promoDiscount, subtotal); // Discount can't exceed subtotal
  }

  return 0;
}

/**
 * Calculate total price (subtotal + PPN - discount)
 */
function calculateTotal(subtotal, ppn, discount) {
  return Math.max(0, subtotal + ppn - discount);
}

/**
 * Master function: Calculate all prices
 * Returns: { subtotal, ppn, discount, total, breakdown }
 */
function calculateAllPrices(domain, duration, packageId, addonIds, promoCode = '', promoData = {}) {
  // Validate inputs
  if (!packageId) {
    return {
      subtotal: 0,
      ppn: 0,
      discount: 0,
      total: 0,
      breakdown: []
    };
  }

  // Calculate subtotal
  const subtotal = calculateSubtotal(domain, duration, packageId, addonIds);

  // Calculate PPN
  const ppn = calculatePPN(subtotal);

  // Calculate discount
  const discount = calculateDiscount(subtotal, promoData.discount || 0, promoData.type || 'percentage');

  // Calculate total
  const total = calculateTotal(subtotal, ppn, discount);

  // Create breakdown
  const breakdown = [];

  // Domain
  const domainPrice = calculateDomainPrice(duration);
  breakdown.push({
    label: `${domain} (${duration} Tahun)`,
    price: domainPrice,
    type: 'domain'
  });

  // Package
  const pkgPrice = calculatePackagePrice(packageId);
  breakdown.push({
    label: `Paket ${getPackageName(packageId)}`,
    price: pkgPrice,
    type: 'package'
  });

  // Addons
  addonIds.forEach(id => {
    const addon = PRICING_CONFIG.addons[id];
    if (addon) {
      breakdown.push({
        label: addon.name,
        price: addon.price,
        type: 'addon'
      });
    }
  });

  // Subtotal
  breakdown.push({
    label: 'Subtotal',
    price: subtotal,
    type: 'subtotal'
  });

  // Tax
  if (ppn > 0) {
    breakdown.push({
      label: 'PPN 11%',
      price: ppn,
      type: 'tax'
    });
  }

  // Promo Discount
  if (discount > 0 && promoCode) {
    breakdown.push({
      label: `Diskon Promo (${promoCode})`,
      price: -discount,
      type: 'discount'
    });
  }

  // Total
  breakdown.push({
    label: 'Total Pembayaran',
    price: total,
    type: 'total'
  });

  return {
    subtotal,
    ppn,
    discount,
    total,
    breakdown,
    promoCode: promoCode || ''
  };
}

/**
 * Get package name
 */
function getPackageName(packageId) {
  const packages = {
    starter: 'Starter',
    grower: 'Grower',
    pioneer: 'Pioneer'
  };
  return packages[packageId] || '';
}

/**
 * Format rupiah currency - MOVED to /assets/js/utils/formatting.js
 * Use Formatting.formatRupiah() for new code
 * Kept here for backwards compatibility
 */
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format number with thousand separator
 */
function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

// ============================================================================
// EXPORT for use in other modules
// ============================================================================

// Make functions available globally
window.PRICING_CONFIG = PRICING_CONFIG;
window.pricingState = pricingState;
window.calculateDomainPrice = calculateDomainPrice;
window.calculatePackagePrice = calculatePackagePrice;
window.calculateAddonsPrice = calculateAddonsPrice;
window.calculateSubtotal = calculateSubtotal;
window.calculatePPN = calculatePPN;
window.calculateDiscount = calculateDiscount;
window.calculateTotal = calculateTotal;
window.calculateAllPrices = calculateAllPrices;
window.getPackageName = getPackageName;
window.formatRupiah = formatRupiah;
window.formatNumber = formatNumber;
