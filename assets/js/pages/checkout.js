/**
 * Checkout Page - Domain & Package Selection Module
 * Handles: Domain retrieval from URL, package selection, form validation, order creation
 * Dependencies: DOM manipulation, localStorage API, fetch API
 */

// ============================================================================
// HARDCODED DOMAIN & PACKAGE DATA
// ============================================================================

const DOMAIN_PACKAGES = {
  'starter': {
    id: 'starter',
    name: 'Starter',
    price: 599000,
    features: [
      '5 Halaman Website',
      '5 GB Hosting Storage',
      'Domain + SSL Gratis',
      'Email Hosting (5 akun)',
      'Support Chat 24/7',
      'Basic SEO Optimization'
    ],
    recommended: false
  },
  'grower': {
    id: 'grower',
    name: 'Grower',
    price: 1299000,
    features: [
      '15 Halaman Website',
      '50 GB Hosting Storage',
      'Domain + SSL Gratis',
      'Email Hosting (25 akun)',
      'Support Chat 24/7 + Phone Support',
      'Advanced SEO Optimization',
      'Analytics Integration',
      'CDN Global'
    ],
    recommended: true
  },
  'pioneer': {
    id: 'pioneer',
    name: 'Pioneer',
    price: 2399000,
    features: [
      'Unlimited Halaman Website',
      'Unlimited Hosting Storage',
      'Domain + SSL Gratis',
      'Email Hosting (Unlimited)',
      'Dedicated Support Manager',
      'Full SEO Optimization',
      'E-commerce Integration',
      'CDN Global',
      'API Access',
      'Custom Domain Email'
    ],
    recommended: false
  }
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let checkoutState = {
  domain: null,
  domainWithoutExt: null,
  extension: null,
  selectedPackage: null,
  formData: {}
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  initializeCheckout();
});

function initializeCheckout() {
  // Extract domain from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const domain = urlParams.get('domain');

  if (!domain) {
    showErrorMessage('Domain tidak ditemukan. Silakan kembali ke halaman cek domain.');
    return;
  }

  // Store domain in state
  parseAndStoreDomain(domain);

  // Render sections
  renderDomainSummary();
  renderPackages();
  renderOrderSummary();

  // Restore state from sessionStorage
  restoreCheckoutState();

  // Setup form validation
  setupFormValidation();
}

function parseAndStoreDomain(domain) {
  // Remove http(s):// and www if present
  let cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');

  // Split domain and extension
  const parts = cleanDomain.split('.');
  const extension = parts[parts.length - 1];
  const domainName = parts.slice(0, -1).join('.');

  checkoutState.domain = cleanDomain;
  checkoutState.domainWithoutExt = domainName;
  checkoutState.extension = extension;
}

// ============================================================================
// DOMAIN SUMMARY RENDERING
// ============================================================================

function renderDomainSummary() {
  const domainDisplay = document.getElementById('domain-display');
  const priceDisplay = document.getElementById('price-display');

  // Domain name display
  domainDisplay.innerHTML = `
    <div class="domain-name">
      <span class="domain-text">${checkoutState.domain}</span>
      <span class="domain-badge">Tersedia</span>
    </div>
  `;

  // Base domain price (simplified - using grower as base reference)
  const basePrice = 299000; // Typical domain registration price
  priceDisplay.innerHTML = `
    <div class="domain-price-detail">
      <span class="label">Harga Domain (1 Tahun):</span>
      <span class="price">Rp ${formatPrice(basePrice)}</span>
    </div>
  `;
}

// ============================================================================
// PACKAGE SELECTION RENDERING
// ============================================================================

function renderPackages() {
  const packagesGrid = document.getElementById('packages-grid');
  packagesGrid.innerHTML = '';

  Object.values(DOMAIN_PACKAGES).forEach(pkg => {
    const card = createPackageCard(pkg);
    packagesGrid.appendChild(card);
  });
}

function createPackageCard(pkg) {
  const card = document.createElement('div');
  card.className = `package-card ${pkg.recommended ? 'recommended' : ''}`;
  card.id = `package-${pkg.id}`;
  card.innerHTML = `
    <div class="package-header">
      ${pkg.recommended ? '<div class="recommended-badge"><i class="fas fa-star"></i> TERPOPULER</div>' : ''}
      <h3 class="package-name">${pkg.name}</h3>
      <div class="package-price">
        <span class="amount">Rp ${formatPrice(pkg.price)}</span>
        <span class="period">/tahun</span>
      </div>
    </div>

    <div class="package-features">
      <ul>
        ${pkg.features.map(feature => `
          <li>
            <i class="fas fa-check-circle"></i>
            <span>${feature}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <button class="btn btn-select-package" data-package-id="${pkg.id}">
      <span>Pilih ${pkg.name}</span>
    </button>
  `;

  // Add click handler
  card.querySelector('.btn-select-package').addEventListener('click', function() {
    selectPackage(pkg.id);
  });

  return card;
}

function selectPackage(packageId) {
  if (!DOMAIN_PACKAGES[packageId]) {
    console.error('Package tidak ditemukan:', packageId);
    return;
  }

  // Update state
  checkoutState.selectedPackage = packageId;
  saveCheckoutState();

  // Update UI
  document.querySelectorAll('.package-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.getElementById(`package-${packageId}`).classList.add('selected');

  // Show selected package notification
  const selectedPkg = DOMAIN_PACKAGES[packageId];
  const displayElement = document.getElementById('selected-package-display');
  document.getElementById('selected-package-text').textContent = 
    `Paket ${selectedPkg.name} (Rp ${formatPrice(selectedPkg.price)}/tahun) telah dipilih`;
  displayElement.style.display = 'block';

  // Update order summary
  renderOrderSummary();

  // Scroll to form
  scrollToSection('step-contact');
}

// ============================================================================
// FORM VALIDATION & SUBMISSION
// ============================================================================

function setupFormValidation() {
  const form = document.getElementById('checkout-form');

  form.addEventListener('input', function(e) {
    const input = e.target;
    validateField(input);
  });

  form.addEventListener('change', function(e) {
    const input = e.target;
    if (input.type === 'checkbox' || input.type === 'radio') {
      validateField(input);
    }
  });
}

function validateField(field) {
  const value = field.value.trim();
  const fieldGroup = field.closest('.form-group');
  const helpText = fieldGroup.querySelector('.form-help');

  // Clear previous error
  fieldGroup.classList.remove('error', 'success');

  if (field.name === 'fullname') {
    if (value.length < 3) {
      fieldGroup.classList.add('error');
      if (helpText) helpText.textContent = 'Nama minimal 3 karakter';
      return false;
    }
  } else if (field.name === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      fieldGroup.classList.add('error');
      if (helpText) helpText.textContent = 'Email tidak valid';
      return false;
    }
  } else if (field.name === 'phone') {
    if (!/^08\d{8,11}$/.test(value)) {
      fieldGroup.classList.add('error');
      if (helpText) helpText.textContent = 'Format: 08xxxxxxxxxx (8-11 digit)';
      return false;
    }
  } else if (field.name === 'address') {
    if (value.length < 10) {
      fieldGroup.classList.add('error');
      if (helpText) helpText.textContent = 'Alamat minimal 10 karakter';
      return false;
    }
  }

  fieldGroup.classList.add('success');
  return true;
}

function validateCheckoutForm() {
  const form = document.getElementById('checkout-form');
  const formElements = form.querySelectorAll('input[required], textarea[required]');
  let isValid = true;

  // Validate all fields
  formElements.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  // Validate checkbox
  const tosCheckbox = document.getElementById('tos');
  if (!tosCheckbox.checked) {
    isValid = false;
    closestFormGroup(tosCheckbox).classList.add('error');
  }

  return isValid;
}

function closestFormGroup(element) {
  let parent = element.parentElement;
  while (parent && !parent.classList.contains('form-group')) {
    parent = parent.parentElement;
  }
  return parent || element.closest('.form-group');
}

// ============================================================================
// ORDER SUMMARY
// ============================================================================

function renderOrderSummary() {
  const summaryElement = document.getElementById('order-summary');
  const selectedPkgId = checkoutState.selectedPackage;

  if (!selectedPkgId) {
    summaryElement.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Silakan pilih paket terlebih dahulu</p>
      </div>
    `;
    document.getElementById('subtotal-price').textContent = 'Rp 0';
    document.getElementById('total-price').textContent = 'Rp 0';
    return;
  }

  const pkg = DOMAIN_PACKAGES[selectedPkgId];
  const baseDomainPrice = 299000;
  const totalPrice = baseDomainPrice + pkg.price;

  summaryElement.innerHTML = `
    <div class="summary-items">
      <div class="summary-item">
        <div class="item-details">
          <h4>${checkoutState.domain}</h4>
          <small>Domain + SSL Certificate (1 Tahun)</small>
        </div>
        <span class="item-price">Rp ${formatPrice(baseDomainPrice)}</span>
      </div>

      <div class="summary-item">
        <div class="item-details">
          <h4>Paket ${pkg.name} Website</h4>
          <small>Hosting, Builder, Support (1 Tahun)</small>
        </div>
        <span class="item-price">Rp ${formatPrice(pkg.price)}</span>
      </div>
    </div>
  `;

  document.getElementById('subtotal-price').textContent = `Rp ${formatPrice(totalPrice)}`;
  document.getElementById('total-price').textContent = `Rp ${formatPrice(totalPrice)}`;
}

// ============================================================================
// CHECKOUT PROCESSING
// ============================================================================

async function processCheckout() {
  // Validate form
  if (!validateCheckoutForm()) {
    scrollToSection('step-contact');
    showErrorMessage('Mohon lengkapi semua data yang diperlukan');
    return;
  }

  // Validate package selection
  if (!checkoutState.selectedPackage) {
    scrollToSection('step-packages');
    showErrorMessage('Mohon pilih paket terlebih dahulu');
    return;
  }

  // Collect form data
  const formElements = document.getElementById('checkout-form');
  checkoutState.formData = {
    fullname: formElements.fullname.value.trim(),
    email: formElements.email.value.trim(),
    phone: formElements.phone.value.trim(),
    address: formElements.address.value.trim()
  };

  // Show loading state
  const checkoutBtn = document.getElementById('checkout-btn');
  const originalText = checkoutBtn.innerHTML;
  checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
  checkoutBtn.disabled = true;

  try {
    // Prepare order data
    const orderData = {
      domain: checkoutState.domain,
      packageId: checkoutState.selectedPackage,
      packageName: DOMAIN_PACKAGES[checkoutState.selectedPackage].name,
      packagePrice: DOMAIN_PACKAGES[checkoutState.selectedPackage].price,
      domainPrice: 299000,
      totalPrice: 299000 + DOMAIN_PACKAGES[checkoutState.selectedPackage].price,
      customerData: checkoutState.formData,
      timestamp: new Date().toISOString()
    };

    // IMPORTANT: Replace GOOGLE_APPS_SCRIPT_URL with your actual Google Apps Script deployment URL
    // Get it from: Deploy > New deployment > Web app > Copy deployment URL
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2rAgb8plwll-5rDlADw4pitA8kzplN8aA7diUlo70DyeY68pwzl2o8mYp6Y9UJnOS/exec';
    
    if (!GOOGLE_APPS_SCRIPT_URL.includes('script.google.com')) {
      showErrorMessage('Google Apps Script URL belum dikonfigurasi. Hubungi admin.');
      checkoutBtn.innerHTML = originalText;
      checkoutBtn.disabled = false;
      return;
    }

    // Send to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (result.success && result.orderId) {
      // Clear sessionStorage
      sessionStorage.removeItem('checkoutState');
      
      // Show success message
      showSuccessMessage('Pesanan berhasil dibuat! Silakan cek email Anda.');
      
      // Redirect to payment page with query parameter
      setTimeout(() => {
        window.location.href = `/payment/?orderId=${result.orderId}`;
      }, 2000);
    } else {
      throw new Error(result.message || 'Gagal membuat pesanan');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showErrorMessage(`Gagal memproses pesanan: ${error.message}`);
    
    // Restore button state
    checkoutBtn.innerHTML = originalText;
    checkoutBtn.disabled = false;
  }
}

// ============================================================================
// NAVIGATION & UTILITY FUNCTIONS
// ============================================================================

function goBackToCekDomain() {
  window.location.href = '/';
}

function scrollToSection(sectionClassName) {
  const section = document.querySelector(`.${sectionClassName}`);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price);
}

function showErrorMessage(message) {
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  document.body.appendChild(toast);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 5000);
}

function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 5000);
}

// ============================================================================
// STATE PERSISTENCE
// ============================================================================

function saveCheckoutState() {
  sessionStorage.setItem('checkoutState', JSON.stringify(checkoutState));
}

function restoreCheckoutState() {
  const saved = sessionStorage.getItem('checkoutState');
  if (saved) {
    try {
      const restored = JSON.parse(saved);
      checkoutState = { ...checkoutState, ...restored };
      
      // Restore selected package visual state
      if (checkoutState.selectedPackage) {
        document.getElementById(`package-${checkoutState.selectedPackage}`).classList.add('selected');
        const selectedPkg = DOMAIN_PACKAGES[checkoutState.selectedPackage];
        const displayElement = document.getElementById('selected-package-display');
        document.getElementById('selected-package-text').textContent = 
          `Paket ${selectedPkg.name} (Rp ${formatPrice(selectedPkg.price)}/tahun) telah dipilih`;
        displayElement.style.display = 'block';
      }
    } catch (e) {
      console.warn('Failed to restore checkout state:', e);
    }
  }
}
