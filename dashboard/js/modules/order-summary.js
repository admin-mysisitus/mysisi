/**
 * ORDER SUMMARY PAGE MODULE
 * ===================================
 * Display order details before checkout
 * - Guest accessible (public page)
 * - Shows domain + available addons
 * - Displays pricing with PPN tax
 * - Redirects to cart on add-to-cart
 * 
 * Features:
 * - No login required
 * - Domain availability recheck
 * - Addon selection UI
 * - LocalStorage persistence
 * 
 * NOTE: Promo code logic moved to /cart/ (inline checkout)
 */

import { CartManager } from '/assets/js/modules/unified-cart.js';
import { showSuccess, showError, showInfo } from '/assets/js/modules/unified-utils.js';
import APIClient from '/assets/js/modules/unified-api.js';
import { ADDON_PACKAGES } from '/assets/js/config/api.config.js';

// State management (currentUser can be null for guests)
let orderState = {
  domain: null,
  tld: null,
  price: 299000,
  duration: 1,
  selectedAddons: []
};

/**
 * Main render function
 * Order summary is GUEST ACCESSIBLE - NO login friction
 * Login only happens in cart page
 */
export async function render(currentUser) {
  try {
    // Load saved order state from localStorage
    loadOrderState();

    // Extract domain from URL (hash-based routing support)
    const domain = extractDomainFromUrl();
    
    if (!domain) {
      throw new Error('Domain tidak ditemukan. Kembali ke pencarian domain.');
    }

    // Parse domain and TLD
    const { domainName, tld } = parseDomain(domain);
    orderState.domain = domainName;
    orderState.tld = tld;

    // Validate domain availability
    await validateDomainAvailability();

    // Render UI
    renderOrderSummary();

    // Setup event handlers
    setupEventHandlers();

    // Save state to localStorage for persistence
    saveOrderState();

  } catch (error) {
    console.error('Error rendering order summary:', error);
    showError('Kesalahan', error.message);
    
    const errorState = document.getElementById('error-state');
    if (errorState) {
      errorState.style.display = 'block';
      errorState.style.textAlign = 'center';
      errorState.style.padding = '60px 20px';
      errorState.innerHTML = `
        <div style="color: #dc2626; margin-bottom: 20px;">
          <h2>❌ Kesalahan</h2>
          <p>${error.message}</p>
        </div>
        <a href="/" style="padding: 10px 20px; background: #2563EB; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">
          Kembali ke Beranda
        </a>
      `;
    }
  }
}

/**
 * Extract domain from URL (support both search params and hash params)
 */
function extractDomainFromUrl() {
  // Try search params first (regular URL)
  let domain = new URLSearchParams(window.location.search).get('domain');
  
  // Try hash params (hash-based routing)
  if (!domain) {
    const hash = window.location.hash;
    if (hash && hash.includes('?')) {
      const queryPart = hash.split('?')[1];
      domain = new URLSearchParams(queryPart).get('domain');
    }
  }

  return domain ? domain.toLowerCase() : null;
}

/**
 * Parse domain into name and TLD
 */
function parseDomain(domain) {
  const parts = domain.split('.');
  if (parts.length < 2) {
    throw new Error('Format domain tidak valid');
  }

  const tld = parts[parts.length - 1];
  const domainName = parts.slice(0, -1).join('.');

  return { domainName, tld };
}

/**
 * Validate domain availability by calling API
 */
async function validateDomainAvailability() {
  try {
    const fullDomain = `${orderState.domain}.${orderState.tld}`;
    const result = await APIClient.checkDomain(fullDomain);

    if (!result.success) {
      throw new Error('Domain tidak tersedia atau terjadi kesalahan');
    }

    // If available, optionally get pricing
    if (result.data && result.data.price) {
      orderState.price = result.data.price;
    }

  } catch (error) {
    console.warn('Domain availability check failed:', error);
    // Don't throw - allow to continue with cached price
  }
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
  // Expose functions to window for inline handlers
  window.toggleAddon = toggleAddon;
  window.addToCart = addToCart;
}
function renderOrderSummary() {
  // Hide loading, show content
  const loadingState = document.getElementById('loading-state');
  const summaryContent = document.getElementById('summary-content');
  
  if (loadingState) loadingState.style.display = 'none';
  if (summaryContent) summaryContent.style.display = 'grid';

  // Set domain info
  const domainNameEl = document.getElementById('domain-name');
  if (domainNameEl) {
    domainNameEl.textContent = `${orderState.domain}.${orderState.tld}`;
  }

  // Set prices
  updatePriceSummary();

  // Render addons
  renderAddons();

  // Restore selected addons if any
  restoreSelectedAddons();
}

/**
 * Render available addons
 */
function renderAddons() {
  const addonsList = document.getElementById('addons-list');
  if (!addonsList) return;

  // Clear existing
  addonsList.innerHTML = '';

  // Render each addon
  Object.values(ADDON_PACKAGES).forEach(addon => {
    const isSelected = orderState.selectedAddons.includes(addon.id);
    
    const addonEl = document.createElement('label');
    addonEl.className = 'addon-checkbox' + (isSelected ? ' selected' : '');
    addonEl.style.cursor = 'pointer';
    
    addonEl.innerHTML = `
      <input type="checkbox" data-addon-id="${addon.id}" ${isSelected ? 'checked' : ''}
        onchange="window.toggleAddon && window.toggleAddon('${addon.id}', this.checked)">
      <div style="flex: 1;">
        <strong style="display: block; margin-bottom: 2px;">${addon.name}</strong>
        <small style="color: #666;">${addon.description || 'Layanan tambahan untuk domain'}</small>
      </div>
      <div style="text-align: right; white-space: nowrap;">
        <strong style="display: block; color: #2563EB;">${addon.price === 0 ? 'GRATIS' : `Rp ${formatNumber(addon.price)}`}</strong>
        <small style="color: #666;">/${addon.duration} tahun</small>
      </div>
    `;
    
    addonsList.appendChild(addonEl);
  });
}

/**
 * Update price summary display
 */
function updatePriceSummary() {
  const domainPrice = orderState.price;
  
  // Calculate addon total
  const addonTotal = orderState.selectedAddons.reduce((sum, addonId) => {
    const addon = ADDON_PACKAGES[addonId];
    return sum + (addon ? addon.price : 0);
  }, 0);

  const subtotal = domainPrice + addonTotal;
  const ppn = Math.round(subtotal * 0.11); // 11% tax
  const total = subtotal + ppn;

  // Update DOM - with defensive checks
  const domainPriceEl = document.getElementById('domain-price');
  if (domainPriceEl) domainPriceEl.textContent = `Rp ${formatNumber(domainPrice)}`;
  
  if (addonTotal > 0) {
    const addonSubEl = document.getElementById('addons-subtotal');
    if (addonSubEl) addonSubEl.style.display = 'flex';
    const addontotalEl = document.getElementById('addons-total');
    if (addontotalEl) addontotalEl.textContent = `Rp ${formatNumber(addonTotal)}`;
  } else {
    const addonSubEl = document.getElementById('addons-subtotal');
    if (addonSubEl) addonSubEl.style.display = 'none';
  }

  const subtotalEl = document.getElementById('subtotal');
  if (subtotalEl) subtotalEl.textContent = `Rp ${formatNumber(subtotal)}`;
  const ppnEl = document.getElementById('ppn');
  if (ppnEl) ppnEl.textContent = `Rp ${formatNumber(ppn)}`;
  const totalEl = document.getElementById('total');
  if (totalEl) totalEl.textContent = `Rp ${formatNumber(total)}`;
}

/**
 * Toggle addon selection
 */
function toggleAddon(addonId, isChecked) {
  if (isChecked) {
    if (!orderState.selectedAddons.includes(addonId)) {
      orderState.selectedAddons.push(addonId);
    }
  } else {
    orderState.selectedAddons = orderState.selectedAddons.filter(id => id !== addonId);
  }

  // Update UI
  updatePriceSummary();
  
  // Update label styling
  const labels = document.querySelectorAll('.addon-checkbox');
  labels.forEach(label => {
    const checkbox = label.querySelector('input[type="checkbox"]');
    if (checkbox.checked) {
      label.classList.add('selected');
    } else {
      label.classList.remove('selected');
    }
  });

  saveOrderState();
}


/**
 * Add to cart and redirect
 */
function addToCart() {
  try {
    const fullDomain = `${orderState.domain}.${orderState.tld}`;

    // Add domain to cart
    CartManager.add(fullDomain, orderState.tld, {
      package: 'starter',
      duration: orderState.duration,
      price: orderState.price,
      renewalPrice: orderState.price
    });

    // Add addons to cart
    if (orderState.selectedAddons.length > 0) {
      const addons = orderState.selectedAddons.map(addonId => {
        const addon = ADDON_PACKAGES[addonId];
        return {
          id: addonId,
          name: addon.name,
          price: addon.price,
          duration: addon.duration
        };
      });
      CartManager.addAddons(addons);
    }

    showSuccess('✓ Ditambahkan', 'Domain sudah di keranjang');

    // Redirect to standalone cart page
    setTimeout(() => {
      window.location.href = '/cart/';
    }, 1000);

  } catch (error) {
    console.error('Error adding to cart:', error);
    showError('Error', error.message);
  }
}

/**
 * Restore selected addons from state
 */
function restoreSelectedAddons() {
  orderState.selectedAddons.forEach(addonId => {
    const checkbox = document.querySelector(`input[data-addon-id="${addonId}"]`);
    if (checkbox) {
      checkbox.checked = true;
    }
  });
}

/**
 * Save current order state to localStorage
 */
function saveOrderState() {
  try {
    localStorage.setItem('current_order_state', JSON.stringify(orderState));
  } catch (e) {
    console.warn('Could not save order state:', e);
  }
}

/**
 * Load order state from localStorage
 */
function loadOrderState() {
  try {
    const saved = localStorage.getItem('current_order_state');
    if (saved) {
      const restored = JSON.parse(saved);
      // Restore selected addons - ensure it's an array
      if (restored.selectedAddons && Array.isArray(restored.selectedAddons)) {
        orderState.selectedAddons = restored.selectedAddons;
      }
      // Restore other fields if domain/tld match current URL
      if (restored.domain) orderState.domain = restored.domain;
      if (restored.tld) orderState.tld = restored.tld;
      if (restored.price) orderState.price = restored.price;
      if (restored.duration) orderState.duration = restored.duration;
    }
  } catch (e) {
    console.warn('Could not load order state:', e);
  }
}

/**
 * Format number as Indonesian currency
 */
function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

export default render;
