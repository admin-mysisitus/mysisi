/**
 * Checkout Page Module
 * Domain and package selection, order creation
 * Migrated from assets/js/pages/checkout.js
 */

import APIClient from '/assets/js/modules/unified-api.js';
import { CartManager } from '/assets/js/modules/unified-cart.js';
import { showSuccess, showError, showLoading, hideLoading, formatCurrency, isValidEmail, isValidPhoneNumber } from '/assets/js/modules/unified-utils.js';
import { DOMAIN_PACKAGES, ADDON_PACKAGES } from '/assets/js/config/api.config.js';

let checkoutState = {
  domain: null,
  domainWithoutExt: null,
  extension: null,
  selectedPackage: null,
  promoCode: '',
  discount: 0,
  formData: {},
  addons: [],
  isRecheckingDomain: false,
  domainStatus: null  // 'available' or 'taken'
};

export async function render(currentUser) {
  try {
    // Extract domain from URL parameter
    // Support both: /page?domain=x (regular) and /#!page?domain=x (hash routing)
    let domain = null;
    
    // Try regular search params first
    const searchParams = new URLSearchParams(window.location.search);
    domain = searchParams.get('domain');
    
    // If not found, try extracting from hash
    if (!domain) {
      const hash = window.location.hash;
      if (hash && hash.includes('?')) {
        const queryPart = hash.split('?')[1];
        const hashParams = new URLSearchParams(queryPart);
        domain = hashParams.get('domain');
      }
    }

    if (domain) {
      parseAndStoreDomain(domain);
    }

    // Load addons from CartManager
    const cart = CartManager.getCart();
    checkoutState.addons = cart.addons || [];

    // Perform initial domain recheck
    if (checkoutState.domain) {
      await recheckDomainAvailability();
    }

    // Setup form event listeners
    setupFormValidation(currentUser);

    // Render UI
    renderDomainSummary();
    renderPackages();
    renderAddonsSection();
    renderOrderSummary();

    // Setup checkout button
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
      btnCheckout.addEventListener('click', (e) => {
        e.preventDefault();
        processCheckout(currentUser);
      });
    }

  } catch (error) {
    console.error('Error rendering checkout:', error);
    document.getElementById('content').innerHTML = `
      <div class="alert alert-error">
        ${error.message}
      </div>
    `;
  }
}

function parseAndStoreDomain(domain) {
  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//i, '').toLowerCase();

  // Split by dot
  const parts = domain.split('.');
  if (parts.length < 2) {
    throw new Error('Domain tidak valid');
  }

  // Get extension (TLD)
  const extension = '.' + parts.slice(-1)[0];
  const domainWithoutExt = parts.slice(0, -1).join('.');

  checkoutState.domain = domainWithoutExt + extension;
  checkoutState.domainWithoutExt = domainWithoutExt;
  checkoutState.extension = extension;
}

/**
 * Recheck domain availability before checkout
 * This ensures the domain is still available and not taken
 */
async function recheckDomainAvailability() {
  if (!checkoutState.domain) return;

  try {
    checkoutState.isRecheckingDomain = true;
    
    // Call API to check domain availability
    const result = await APIClient.call('cekDomain', { 
      domain: checkoutState.domain 
    }, { method: 'GET' });

    if (result.available) {
      checkoutState.domainStatus = 'available';
    } else {
      checkoutState.domainStatus = 'taken';
      showErrorMessage(`Domain ${checkoutState.domain} sudah tidak tersedia`);
    }

  } catch (error) {
    console.error('Domain recheck error:', error);
    // If API fails, assume available and continue
    checkoutState.domainStatus = 'available';
  } finally {
    checkoutState.isRecheckingDomain = false;
  }
}

function renderDomainSummary() {
  const container = document.getElementById('domain-summary');
  if (!container) return;

  if (!checkoutState.domain) {
    container.innerHTML = `
      <div class="alert alert-info">
        Masukkan domain yang ingin Anda pesan
      </div>
    `;
    return;
  }

  const basePrice = 299000;
  const statusBadge = checkoutState.domainStatus === 'taken' 
    ? '<span style="color: #e74c3c; font-weight: bold;">❌ Tidak Tersedia</span>'
    : '<span style="color: #27ae60; font-weight: bold;">✓ Tersedia</span>';

  container.innerHTML = `
    <div class="domain-card">
      <div class="domain-name">${checkoutState.domain}</div>
      <div style="font-size: 14px; margin-bottom: 10px;">
        ${statusBadge}
      </div>
      <div class="domain-price">Rp ${formatPrice(basePrice)} / tahun</div>
    </div>
  `;
}

/**
 * Render addons section showing selected addons from order-summary
 */
function renderAddonsSection() {
  const container = document.getElementById('addons-summary');
  if (!container) return;

  if (!checkoutState.addons || checkoutState.addons.length === 0) {
    container.innerHTML = `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; font-size: 14px; color: #666;">
        Tidak ada addon yang dipilih
      </div>
    `;
    return;
  }

  const addonsHTML = checkoutState.addons.map(addon => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
      <div>
        <strong>${addon.name}</strong>
        <div style="font-size: 12px; color: #999;">Durasi: ${addon.duration} tahun</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: bold; color: #2563EB;">Rp${formatPrice(addon.price)}</div>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 15px 0; font-weight: bold;">Addon Layanan (${checkoutState.addons.length})</h4>
      ${addonsHTML}
    </div>
  `;
}

function renderPackages() {
  const container = document.getElementById('packages-grid');
  if (!container) return;

  container.innerHTML = Object.values(DOMAIN_PACKAGES).map(pkg => createPackageCard(pkg)).join('');

  // Add click handlers
  container.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('click', () => {
      selectPackage(card.dataset.packageId);
    });
  });
}

function createPackageCard(pkg) {
  const isRecommended = pkg.recommended;
  const badgeHtml = isRecommended ? '<div class="package-badge">Recommended</div>' : '';

  return `
    <div class="package-card ${isRecommended ? 'recommended' : ''}" data-package-id="${pkg.id}">
      ${badgeHtml}
      <h3>${pkg.name}</h3>
      <div class="package-price">Rp ${formatPrice(pkg.price)}</div>
      <ul class="package-features">
        ${pkg.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <button class="btn btn-primary btn-block" type="button">Pilih Paket</button>
    </div>
  `;
}

function selectPackage(packageId) {
  checkoutState.selectedPackage = packageId;

  // Update UI
  document.querySelectorAll('.package-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`[data-package-id="${packageId}"]`).classList.add('selected');

  renderOrderSummary();

  // Show notification
  const pkg = DOMAIN_PACKAGES[packageId];  // DOMAIN_PACKAGES is object, not array
  if (pkg) {
    showSuccessMessage(`Paket ${pkg.name} dipilih`);
  }
}

function setupFormValidation(currentUser) {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Pre-fill email and phone from user
  const emailInput = form.querySelector('[name="email"]');
  const phoneInput = form.querySelector('[name="phone"]');
  const nameInput = form.querySelector('[name="fullname"]');

  if (emailInput) emailInput.value = currentUser.email || '';
  if (phoneInput) phoneInput.value = currentUser.whatsapp || '';
  if (nameInput) nameInput.value = currentUser.displayName || '';

  // Add real-time validation
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => validateField(field));
  });

  // Handle promo code input
  const promoInput = form.querySelector('[name="promoCode"]');
  if (promoInput) {
    promoInput.addEventListener('blur', async () => {
      await validateAndApplyPromoCode(promoInput.value.trim());
    });
  }
}

function validateField(field) {
  const name = field.name;
  const value = field.value.trim();
  let error = null;

  switch (name) {
    case 'fullname':
      if (value.length < 3) {
        error = 'Nama minimal 3 karakter';
      }
      break;

    case 'email':
      if (!isValidEmail(value)) {
        error = 'Email tidak valid';
      }
      break;

    case 'phone':
      if (!isValidPhoneNumber(value)) {
        error = 'Format: 08xxxxxxxxxx, +62xxxxxxxxxx, atau 62xxxxxxxxxx';
      }
      break;

    case 'address':
      if (value.length < 10) {
        error = 'Alamat minimal 10 karakter';
      }
      break;
  }

  const formGroup = field.closest('.form-group');
  if (error) {
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    const helpText = formGroup.querySelector('.form-help');
    if (helpText) helpText.textContent = error;
  } else {
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
    const helpText = formGroup.querySelector('.form-help');
    if (helpText) helpText.textContent = '';
  }
}

async function validateAndApplyPromoCode(code) {
  try {
    if (!code) {
      // Clear promo if empty
      checkoutState.promoCode = '';
      checkoutState.discount = 0;
      renderOrderSummary();
      return;
    }

    // Validate promo code via API
    const result = await APIClient.validatePromoCode(code);
    
    if (result.success && result.data) {
      // Promo is valid
      checkoutState.promoCode = result.data.code;
      
      // Calculate discount based on type
      const baseDomainPrice = 299000;
      const pkg = DOMAIN_PACKAGES[checkoutState.selectedPackage];  // DOMAIN_PACKAGES is object
      if (!pkg) return;  // Package not found
      const subtotal = baseDomainPrice + pkg.price;
      
      if (result.data.discountType === 'percentage') {
        checkoutState.discount = Math.round(subtotal * (result.data.discount / 100));
      } else {
        checkoutState.discount = result.data.discount;
      }
      
      renderOrderSummary();
      showSuccessMessage(`✅ ${result.message}`);
    } else {
      // Promo is invalid
      checkoutState.promoCode = '';
      checkoutState.discount = 0;
      renderOrderSummary();
      showErrorMessage(result.message || 'Kode promo tidak valid');
    }
  } catch (error) {
    console.error('Promo validation error:', error);
    checkoutState.promoCode = '';
    checkoutState.discount = 0;
    renderOrderSummary();
    showErrorMessage('Gagal validasi kode promo');
  }
}

function validateCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return false;

  // Check all required fields
  const fullname = form.querySelector('[name="fullname"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  const phone = form.querySelector('[name="phone"]').value.trim();
  const address = form.querySelector('[name="address"]').value.trim();
  const tos = form.querySelector('[name="tos"]').checked;

  if (!fullname || fullname.length < 3) {
    showErrorMessage('Nama minimal 3 karakter');
    return false;
  }

  if (!isValidEmail(email)) {
    showErrorMessage('Email tidak valid');
    return false;
  }

  if (!isValidPhoneNumber(phone)) {
    showErrorMessage('Format nomor: 08xxxxxxxxxx, +62xxxxxxxxxx, atau 62xxxxxxxxxx');
    return false;
  }

  if (!address || address.length < 10) {
    showErrorMessage('Alamat minimal 10 karakter');
    return false;
  }

  if (!tos) {
    showErrorMessage('Anda harus menyetujui Syarat & Ketentuan');
    return false;
  }

  if (!checkoutState.selectedPackage) {
    showErrorMessage('Pilih paket terlebih dahulu');
    return false;
  }

  return true;
}

function renderOrderSummary() {
  const container = document.getElementById('order-summary');
  if (!container) return;

  if (!checkoutState.selectedPackage) {
    container.innerHTML = `
      <div class="alert alert-info">
        Pilih paket untuk melihat ringkasan pesanan
      </div>
    `;
    return;
  }

  const baseDomainPrice = 299000;
  const pkg = DOMAIN_PACKAGES[checkoutState.selectedPackage];  // DOMAIN_PACKAGES is object
  if (!pkg) return;  // Package not found
  
  // Calculate addon total
  const addonsTotal = checkoutState.addons.reduce((sum, addon) => sum + addon.price, 0);
  
  // Calculate subtotal (domain + package + addons)
  const subtotal = baseDomainPrice + pkg.price + addonsTotal;
  const ppn = Math.round(subtotal * 0.11);
  const discount = checkoutState.discount || 0;
  const total = subtotal + ppn - discount;

  let discountHtml = '';
  if (discount > 0) {
    discountHtml = `
      <div class="summary-item discount">
        <span>Diskon (${checkoutState.promoCode})</span>
        <span class="price">-Rp ${formatPrice(discount)}</span>
      </div>
    `;
  }

  let addonsHtml = '';
  if (addonsTotal > 0) {
    addonsHtml = `
      <div class="summary-item">
        <span>Addon (${checkoutState.addons.length})</span>
        <span class="price">Rp ${formatPrice(addonsTotal)}</span>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="order-summary-card">
      <h3>Ringkasan Pesanan</h3>
      
      <div class="summary-item">
        <span>Domain: ${checkoutState.domain} (1 tahun)</span>
        <span class="price">Rp ${formatPrice(baseDomainPrice)}</span>
      </div>

      <div class="summary-item">
        <span>Paket: ${pkg.name}</span>
        <span class="price">Rp ${formatPrice(pkg.price)}</span>
      </div>

      ${addonsHtml}

      <div class="summary-divider"></div>

      <div class="summary-item">
        <span>Subtotal</span>
        <span class="price">Rp ${formatPrice(subtotal)}</span>
      </div>

      <div class="summary-item">
        <span>PPN (11%)</span>
        <span class="price">Rp ${formatPrice(ppn)}</span>
      </div>

      ${discountHtml}

      <div class="summary-divider"></div>

      <div class="summary-item total">
        <span>Total</span>
        <span class="price">Rp ${formatPrice(total)}</span>
      </div>
    </div>
  `;
}

async function processCheckout(currentUser) {
  try {
    // Check if domain is still available
    if (checkoutState.domainStatus === 'taken') {
      showErrorMessage(`Domain ${checkoutState.domain} tidak tersedia. Silakan pilih domain lain.`);
      return;
    }

    if (!validateCheckoutForm()) {
      return;
    }

    const form = document.getElementById('checkout-form');
    const fullname = form.querySelector('[name="fullname"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();
    const address = form.querySelector('[name="address"]').value.trim();

    // Calculate prices
    const baseDomainPrice = 299000;
    const pkg = DOMAIN_PACKAGES[checkoutState.selectedPackage];  // DOMAIN_PACKAGES is object
    if (!pkg) {
      showErrorMessage('Paket tidak valid');
      return;
    }
    
    // Calculate addon total
    const addonsTotal = checkoutState.addons.reduce((sum, addon) => sum + addon.price, 0);
    
    // Calculate subtotal and total
    const subtotal = baseDomainPrice + pkg.price + addonsTotal;
    const ppn = Math.round(subtotal * 0.11);
    const discount = checkoutState.discount || 0;
    const total = subtotal + ppn - discount;

    // Show loading
    const btn = document.getElementById('btn-checkout');
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    // Prepare addons data
    const addonsData = checkoutState.addons.map(addon => ({
      id: addon.id,
      name: addon.name,
      price: addon.price,
      duration: addon.duration
    }));

    // Create order via API
    const result = await APIClient.createOrder({
      userId: currentUser.userId,
      domain: checkoutState.domain,
      domainDuration: 1,
      packageId: checkoutState.selectedPackage,
      packageName: pkg.name,
      addons: addonsData,  // Now properly populated
      promoCode: checkoutState.promoCode,
      subtotal,
      ppn,
      discount,
      total,
      name: fullname,
      email,
      phone,
      address
    });

    if (result.success && result.data && result.data.orderId) {
      showSuccessMessage('Pesanan berhasil dibuat! Redirecting...');
      // Clear cart after successful order
      try {
        CartManager.clear();
      } catch (e) {
        console.warn('Could not clear cart:', e);
      }
      // Redirect to payment page with order data
      setTimeout(() => {
        window.location.hash = `#!payment?orderId=${result.data.orderId}`;
      }, 1500);
    } else {
      showErrorMessage(result.message || 'Gagal membuat pesanan');
      btn.disabled = false;
      btn.textContent = 'Buat Pesanan';
    }

  } catch (error) {
    console.error('Checkout error:', error);
    showErrorMessage(error.message);
    const btn = document.getElementById('btn-checkout');
    btn.disabled = false;
    btn.textContent = 'Buat Pesanan';
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price);
}

function showErrorMessage(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-error alert-dismissible';
  alertDiv.innerHTML = `
    ${message}
    <button onclick="this.parentElement.remove()" class="btn-close">&times;</button>
  `;
  
  const container = document.getElementById('checkout-alerts') || document.getElementById('content');
  container.insertBefore(alertDiv, container.firstChild);

  setTimeout(() => alertDiv.remove(), 5000);
}

function showSuccessMessage(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success alert-dismissible';
  alertDiv.innerHTML = `
    ${message}
    <button onclick="this.parentElement.remove()" class="btn-close">&times;</button>
  `;
  
  const container = document.getElementById('checkout-alerts') || document.getElementById('content');
  container.insertBefore(alertDiv, container.firstChild);

  setTimeout(() => alertDiv.remove(), 5000);
}
