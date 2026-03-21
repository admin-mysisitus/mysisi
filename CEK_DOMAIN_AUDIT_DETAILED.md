# 🔍 CEK DOMAIN COMPONENT - DETAILED AUDIT & FIXES

**Date**: March 21, 2026  
**Component**: Cek Domain Search Feature  
**Status**: Currently working with critical issues needing fixes

---

## 📊 EXECUTIVE SUMMARY

| Aspect | Status | Comment |
|--------|--------|---------|
| **HTML Structure** | ✅ Good | Semantic, accessible, modular |
| **JS Logic** | ⚠️ Needs Fix | Race conditions, false availability results |
| **CSS** | ⚠️ Needs Fix | Not mobile-responsive, animations could be optimized |
| **Data Architecture** | 🔴 Critical | Hardcoded prices, no real availability API |
| **Error Handling** | 🔴 Critical | Silent failures on DNS check errors |
| **Conversion Flow** | 🔴 Critical | Need proper checkout page (currently redirects to non-existent routes) |

---

## 🟢 WHAT'S WORKING WELL

### 1. **Event Handling Architecture**
```javascript
✅ Proper form submission flow
✅ Debounced input for performance
✅ Event delegation patterns
✅ Keyboard accessibility (Enter key support)
```

### 2. **Domain Parsing Logic**
```javascript
✓ Handles single-part extensions (.com, .id)
✓ Handles multi-part extensions (.co.id, .my.id, etc)
✓ Regex validation for special characters
✓ Case normalization (automatic lowercase)
✓ Smart base extraction

Example:
- Input: "MyBusiness.CO.ID"
- Parsed to: { base: "mybusiness", ext: ".co.id", isFullDomain: true }
```

### 3. **Accessibility Features**
```html
✓ role="search" on form
✓ role="alert" on error container
✓ role="listbox" on suggestions
✓ aria-label on inputs and buttons
✓ aria-expanded on toggles
✓ aria-live="polite" on dynamic regions
```

### 4. **Placeholder Animation**
```javascript
✓ Cycling placeholder text
✓ Smooth typing/deleting effect
✓ Natural timing (100ms type, 50ms delete, 1500ms pause)
```

---

## 🟡 MODERATE ISSUES (SHOULD FIX)

### Issue #1: Non-Responsive CSS

**Location**: [assets/css/components/cek-domain.css](assets/css/components/cek-domain.css)

**Problem**:
```css
/* Tidak ada mobile breakpoints */
#cek-domain-popular-extensions {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

/* Akan breakage di mobile:
   - 150px minimum pada layar 320px = hanya 2 columns (jelek)
   - Gap 15px terlalu besar di mobile
   - Form gap 10px tidak optimal mobile
*/
```

**Fix**:
```css
/* Mobile-first approach */
#cek-domain-popular-extensions {
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

@media (min-width: 640px) {
  #cek-domain-popular-extensions {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }
}

@media (min-width: 1024px) {
  #cek-domain-popular-extensions {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 15px;
  }
}

/* Form responsiveness */
.cek-domain-form {
  gap: 8px;
  flex-direction: column;
}

@media (min-width: 768px) {
  .cek-domain-form {
    gap: 10px;
    flex-direction: row;
  }
}

/* iOS input zoom fix */
#cek-domain-input,
#cek-domain-btn {
  font-size: 16px; /* Prevent automatic zoom on iOS */
}

@media (min-width: 768px) {
  #cek-domain-input,
  #cek-domain-btn {
    font-size: 1rem;
  }
}
```

---

### Issue #2: Animation Performance

**Problem**:
```javascript
// Current: sequential animation delays di JS
item.style.animationDelay = `${idx * 0.08}s`;
// Untuk 8 items = 8 separate repaints
// Grid recalculation x8 = jank potential
```

**Better Approach**:
```javascript
// Use CSS transitions instead for smoother performance
renderPricingPreview() {
  cekDomainPopularExtensions.innerHTML = '';
  const sortedExts = [...allExtensions].sort(...).slice(0, 8);

  sortedExts.forEach((ext, idx) => {
    const item = document.createElement('div');
    item.className = `cek-domain-ext-item ${ext.highlight !== 'none' ? `highlight-${ext.highlight}` : ''}`;
    
    // Will-change untuk hint browser
    item.style.willChange = 'transform';
    
    // Inline style untuk faster animation
    item.style.animation = `none`; // Remove animation-delay
    
    // Let CSS handle it
    item.classList.add(`animate-${idx}`);
    // ...rest
  });
}
```

**Updated CSS**:
```css
/* Better: use staggered with animation-fill-mode */
.cek-domain-ext-item {
  opacity: 0;
  animation: slideUp 0.6s ease forwards;
}

.cek-domain-ext-item:nth-child(1) { animation-delay: 0s; }
.cek-domain-ext-item:nth-child(2) { animation-delay: 0.08s; }
.cek-domain-ext-item:nth-child(3) { animation-delay: 0.16s; }
/* etc */

/* Or use CSS Grid animation */
@supports (animation-timeline: view()) {
  .cek-domain-ext-item {
    animation: slideUp linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
}
```

---

### Issue #3: Hardcoded Extension Data

**Problem**:
```javascript
// Hardcoded di JS - jika admin ubah harga, harus edit code
const allExtensions = [
  { ext: '.com', oldPrice: 209900, newPrice: 159900, ... },
  { ext: '.id', oldPrice: 249000, newPrice: 99000, ... },
  // 10 more...hardcoded values
];
```

**Problems**:
- Tidak bisa real-time update pricing
- Jika ada promo baru, harus redeploy
- Tidak ada versioning atau changelog

**Fix - API-driven approach**:

**Create API endpoint** `/api/domain-extensions.json`:
```json
{
  "extensions": [
    {
      "ext": ".com",
      "oldPrice": 209900,
      "newPrice": 159900,
      "info": "Ideal untuk bisnis global",
      "highlight": "best",
      "label": "Terpopuler",
      "available": true,
      "displayOrder": 1
    },
    {
      "ext": ".id",
      "oldPrice": 249000,
      "newPrice": 99000,
      "info": "Domain Indonesia resmi",
      "highlight": "best",
      "label": "Best Deal",
      "available": true,
      "displayOrder": 2
    }
  ],
  "lastUpdated": "2026-03-21T10:30:00Z",
  "promo": {
    "active": true,
    "message": "PROMO SPESIAL: .ID hanya Rp99.000..."
  }
}
```

**Updated JavaScript**:
```javascript
async function initCekDomain() {
  // Fetch prices dari API bukannya hardcoded
  let allExtensions = [];
  
  try {
    const response = await fetch('/api/domain-extensions.json', {
      headers: { 'Accept': 'application/json' },
      cache: 'force-cache' // Cache untuk performance
    });
    
    if (!response.ok) throw new Error('Failed to load extensions');
    
    const data = await response.json();
    allExtensions = data.extensions;
    
    console.log('✓ Extensions loaded:', allExtensions.length);
  } catch (error) {
    console.error('Failed to fetch extensions, using fallback:', error);
    // Fallback ke hardcoded jika API gagal
    allExtensions = getFallbackExtensions();
  }
  
  // Rest of logic...
  renderPricingPreview();
  initiatePlaceholderAnimation();
  
  // Return cleanup function
  return {
    destroy() {
      cekDomainForm.removeEventListener('submit', handleSubmit);
      cekDomainInput.removeEventListener('input', handleInput);
    }
  };
}

// Call it
window.addEventListener('DOMContentLoaded', () => {
  const cekDomainInstance = initCekDomain();
  
  // Store untuk potential cleanup later
  window.cekDomainInstance = cekDomainInstance;
});
```

---

## 🔴 CRITICAL ISSUES (MUST FIX)

### Critical #1: Silent Error Handling on DNS Check

**Problem**:
```javascript
async function checkDomainAvailability(domain) {
  // Current: Cloudflare DNS query tanpa proper error handling
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`
    );
    
    const data = await response.json();
    return !data.Answer || data.Answer.length === 0; // ← Returns boolean only
    
  } catch (error) {
    console.warn('Pengecekan DNS gagal:', error.message);
    return true; // ← SILENT FAIL! Assume available
  }
}
```

**What Happens When Cloudflare API is Down**:
```
1. User search domain: "mybusiness.com"
2. Cloudflare API timeout atau down
3. Catch block executed, returns true (assume "available")
4. Card ditampilkan sebagai "Available ✓"
5. User klik "Amankan di Checkout"
6. Checkout process gagal karena data tidak akurat
7. Bad user experience + loss of trust
```

**Decision: Keep Cloudflare DNS + Improve Error Handling**

Cloudflare DNS adalah solusi yang ringan dan cepat (tanpa API key). Limitations:
- DNS check hanya cek apakah domain punya DNS record (hosted)
- Bukan apakah domain tersedia untuk registrasi
- Ada domain yang tidak punya DNS record tapi sudah dipesan

Tapi dengan **proper error handling + user awareness**, ini acceptable:

```javascript
async function checkDomainAvailability(domain) {
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
      {
        headers: { 'accept': 'application/dns-json' },
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return explicit result object (bukan hanya boolean)
    return {
      available: !data.Answer || data.Answer.length === 0,
      error: false,
      method: 'dns-check',
      message: null
    };
    
  } catch (error) {
    // Return error state (jangan silent fail)
    return {
      available: null, // Unknown
      error: true,
      method: 'dns-check',
      message: `Gagal mengecek ketersediaan: ${error.message}. Mohon coba lagi atau hubungi support kami.`
    };
  }
}
```

**UI Handling untuk 3 States**:
```javascript
const result = await checkDomainAvailability(fullDomain);

if (result.error) {
  // State 3: ERROR - tampilkan pesan error
  card.classList.add('cek-domain-result-card-error');
  card.innerHTML = `
    <h3><i class="fas fa-exclamation-triangle"></i> ${sanitizeHTML(fullDomain)}</h3>
    <p class="cek-domain-result-error">${result.message}</p>
    <button class="cek-domain-retry-btn">Coba Lagi</button>
  `;
  
} else if (result.available === true) {
  // State 1: AVAILABLE - bisa checkout
  card.classList.add('available');
  card.innerHTML = `
    <h3><i class="fas fa-check-circle" style="color: #27ae60;"></i> ${sanitizeHTML(fullDomain)}</h3>
    <p class="cek-domain-result-info">Domain tersedia untuk dibeli</p>
    <p class="cek-domain-result-price">Rp${formatCurrency(price)}/tahun</p>
    <a href="/checkout/${encodeURIComponent(fullDomain)}" class="cek-domain-action-btn">Lanjut ke Checkout</a>
  `;
  
} else if (result.available === false) {
  // State 2: UNAVAILABLE - sudah terpakai
  card.classList.add('unavailable');
  card.innerHTML = `
    <h3><i class="fas fa-times-circle"></i> ${sanitizeHTML(fullDomain)}</h3>
    <p class="cek-domain-result-info">Domain sudah diambil / tidak tersedia</p>
    <p style="font-size: 0.85rem; color: #999;">Coba variasi nama lain</p>
  `;
  
} else {
  // State 0: UNKNOWN (result.available === null) - fallback/timeout
  card.classList.add('unknown');
  card.innerHTML = `
    <h3><i class="fas fa-question-circle"></i> ${sanitizeHTML(fullDomain)}</h3>
    <p class="cek-domain-result-info">Status ketersediaan tidak jelas</p>
    <p style="font-size: 0.85rem; color: #999;">Silakan hubungi support atau coba di checkout</p>
    <a href="/checkout/${encodeURIComponent(fullDomain)}" class="cek-domain-action-btn">Lanjut ke Checkout</a>
  `;
}
```

**Disclaimer to Show Users** (in UI):
```html
<div class="cek-domain-disclaimer">
  <i class="fas fa-info-circle"></i>
  <small>
    Pengecekan ini menggunakan metode DNS check. 
    Hasil akan dikonfirmasi ulang saat Anda melanjutkan ke checkout. 
    Garansi 100% uang kembali jika domain tidak tersedia.
  </small>
</div>
```

---

### Critical #2: Race Condition in Multiple Submissions (EXISTING)

**Problem**:
```javascript
async function checkDomainAvailability(domain) {
  try {
    const response = await fetch(...);
    const data = await response.json();
    return !data.Answer || data.Answer.length === 0;
  } catch (error) {
    console.warn('Pengecekan DNS gagal:', error.message);
    return true; // ← SILENT FAIL! Assume available
  }
}
```

**What Happens**:
```
Saat Cloudflare API down atau timeout:
1. Catch block executed
2. Console.warn (user tidak lihat)
3. Return true (assume available)
→ User klik "Amankan Sekarang"
→ Checkout fails
→ Bad experience
```

**Fix - Explicit Error State**:
```javascript
async function checkDomainAvailability(domain) {
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
      {
        headers: { 'accept': 'application/dns-json' },
        signal: AbortSignal.timeout(9000)
      }
    );

    if (!response.ok) {
      throw new Error(`DNS API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return explicit result object
    return {
      available: !data.Answer || data.Answer.length === 0,
      error: false,
      message: null
    };
  } catch (error) {
    // Return error state
    return {
      available: null, // Unknown
      error: true,
      message: `Gagal mengecek ketersediaan: ${error.message}. Coba lagi atau hubungi support.`
    };
  }
}

// Usage:
const result = await checkDomainAvailability(fullDomain);

if (result.error) {
  // Show error in UI
  card.classList.add('cek-domain-result-card-error');
  card.innerHTML = `
    <h3><i class="fas fa-exclamation-triangle"></i> ${fullDomain}</h3>
    <p class="cek-domain-result-error">${result.message}</p>
    <button onclick="location.reload()">Coba Lagi</button>
  `;
} else if (result.available) {
  // Show available
} else {
  // Show unavailable
}
```

---

### Critical #3: Broken Conversion Flow - Need Checkout Page

**Problem**:
```javascript
let currentRequestId = 0;

async function displayResults(inputVal) {
  // User klik submit di Form A: "sisitus.com"
  const requestId = ++currentRequestId; // requestId = 1
  
  // Meanwhile: User submit Form B dengan domain lain
  // Same function executed again
  const requestId2 = ++currentRequestId; // requestId2 = 2, tapi variable name sama di scope berbeda
  
  // Promise.all di requestId 1 selesai dalam 5 detik
  // Promise.all di requestId 2 selesai dalam 3 detik (lebih cepat)
  
  if (requestId !== currentRequestId) return; // Check 1 fails karena currentId sudah 2
  
  // Results dari request 2 ditampilkan DI ATAS RESULTS DARI REQUEST 1
  // Tapi user harap melihat hasil terakhir (request 2)... OK di kasus ini
  
  // TAPI jika request 2 lebih LAMBAT = hasil lama tertampil di atas yang baru ✗
}
```

**Better: AbortController**:
```javascript
let activeAbortController = null;

async function displayResults(inputVal) {
  // Cancel previous request
  if (activeAbortController) {
    activeAbortController.abort();
  }
  
  // Start new request
  activeAbortController = new AbortController();
  
  // ... rest of logic
  
  const resultCards = await Promise.all(
    targetExts.map(async (extData) => {
      try {
        const fullDomain = isFullDomain ? ... : ...;
        
        // Pass abort signal to fetch
        const response = await fetch(..., {
          signal: activeAbortController.signal
        });
        
        // Jika user submit lagi, signal akan abort ini fetch
        
        return { card, isAvailable, extData };
      } catch (err) {
        // Catch AbortError too
        if (err.name === 'AbortError') {
          console.log('Request cancelled');
          return null; // Skip this result
        }
        // ... handle other errors
      }
    })
  );
  
  // Filter out null results dari cancelled requests
  const validResults = resultCards.filter(r => r !== null);
  
  // Render only valid results
  cekDomainResultsList.innerHTML = '';
  validResults.forEach(item => {
    cekDomainResultsList.appendChild(item.card);
  });
}
```

---

### Critical #3: Broken Conversion Flow - Need Checkout Page

**Current Problem**:
```html
<!-- Links go to non-existent routes -->
<a href="/checkout?domain=${domain}">Amankan Sekarang</a>
<a href="/transfer?domain=${domain}">Transfer Domain</a>

<!-- Result: User sees 404 page when clicking -->
```

**Solution: Create Dedicated Checkout Page**

Buat file baru: [checkout/index.html](checkout/index.html)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkout Domain - SISITUS</title>
  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/components/checkout.css">
</head>
<body>
  <main class="checkout-page">
    <div class="container">
      <div class="checkout-wrapper">
        <!-- Step 1: Domain Summary -->
        <section class="checkout-section step-domain">
          <h2>Ringkasan Domain</h2>
          <div class="domain-summary-card">
            <div class="domain-name-display" id="domain-display"></div>
            <div class="domain-price-display" id="price-display"></div>
            <button class="btn-change-domain" onclick="goBackToCekDomain()">Ubah Domain</button>
          </div>
        </section>

        <!-- Step 2: Package Selection -->
        <section class="checkout-section step-packages">
          <h2>Pilih Paket Anda</h2>
          <div class="packages-grid" id="packages-grid"></div>
        </section>

        <!-- Step 3: Contact Info -->
        <section class="checkout-section step-contact">
          <h2>Data Pemilik Domain</h2>
          <form id="checkout-form" class="checkout-form">
            <div class="form-group">
              <label>Nama Lengkap *</label>
              <input type="text" name="fullname" required>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" name="email" required>
            </div>
            <div class="form-group">
              <label>No. WhatsApp *</label>
              <input type="tel" name="phone" required>
            </div>
            <div class="form-group">
              <label>Alamat *</label>
              <textarea name="address" rows="3" required></textarea>
            </div>
          </form>
        </section>

        <!-- Step 4: Order Summary -->
        <section class="checkout-section step-summary">
          <h2>Ringkasan Pesanan</h2>
          <div class="order-summary" id="order-summary"></div>
          <div class="checkout-total">
            <div class="total-price">Total: <span id="total-price">Rp 0</span></div>
            <button class="btn btn-primary btn-lg" onclick="processCheckout()">
              Lanjutkan ke Pembayaran
            </button>
          </div>
        </section>
      </div>
    </div>
  </main>

  <script src="/assets/js/pages/checkout.js"></script>
</body>
</html>
```

Buat file JavaScript: [assets/js/pages/checkout.js](assets/js/pages/checkout.js)

```javascript
/**
 * Checkout Page Logic
 */

(function() {
  'use strict';

  // Get domain dari URL parameter
  const params = new URLSearchParams(window.location.search);
  const domain = params.get('domain');

  if (!domain) {
    window.location.href = '/#cek-domain';
    return;
  }

  // Initialize checkout page
  function init() {
    displayDomainSummary(domain);
    displayPackages();
    setupFormHandlers();
  }

  function displayDomainSummary(domain) {
    const display = document.getElementById('domain-display');
    const priceDisplay = document.getElementById('price-display');
    
    // Fetch price dari API
    fetch('/api/domain-extensions.json')
      .then(r => r.json())
      .then(data => {
        const ext = domain.substring(domain.lastIndexOf('.'));
        const extData = data.extensions.find(e => e.ext === ext);
        
        display.innerHTML = `
          <div class="domain-name">${domain}</div>
          <div class="domain-status">✓ Domain Tersedia</div>
        `;
        
        if (extData) {
          const discount = calculateDiscount(extData.oldPrice, extData.newPrice);
          priceDisplay.innerHTML = `
            <div class="price-item">
              <span>Harga Domain /tahun:</span>
              <span class="price">
                ${extData.oldPrice ? `<span class="old">Rp${formatCurrency(extData.oldPrice)}</span>` : ''}
                <span class="new">Rp${formatCurrency(extData.newPrice)}</span>
              </span>
            </div>
          `;
        }
      })
      .catch(err => {
        console.error('Error fetching domain info:', err);
        display.innerHTML = `<div class="error">Gagal memuat data domain</div>`;
      });
  }

  function displayPackages() {
    const grid = document.getElementById('packages-grid');
    
    const packages = [
      {
        id: 'starter',
        name: 'PAKET STARTER',
        price: 599000,
        description: 'Sempurna untuk Bisnis Kecil & UMKM',
        features: ['5-7 Hari Pengerjaan', 'Hingga 5 Halaman', 'Optimasi Core Web Vitals', 'Domain + Hosting 1 Tahun', 'SSL Certificate Gratis']
      },
      {
        id: 'grower',
        name: 'PAKET GROWER',
        price: 1299000,
        description: 'Untuk Bisnis Menengah & Perusahaan',
        isPopular: true,
        features: ['7-10 Hari Pengerjaan', 'Hingga 8 Halaman', 'SEO On-Page Lengkap', 'Domain + Hosting 2 Tahun (Promo 3)', 'Integrasi Media Sosial', '1 Bulan Maintenance Gratis']
      },
      {
        id: 'pioneer',
        name: 'PAKET PIONEER',
        price: 2399000,
        description: 'Untuk Bisnis E-Commerce & Penjual',
        features: ['14-21 Hari Pengerjaan', '12 Halaman + Toko Online', 'Unlimited Produk', 'Integrasi Ongkir & Payment', 'Dashboard Admin Lengkap']
      }
    ];

    grid.innerHTML = packages.map(pkg => `
      <div class="package-card ${pkg.isPopular ? 'popular' : ''}" data-package="${pkg.id}">
        ${pkg.isPopular ? '<div class="popular-badge">PALING DIPILIH</div>' : ''}
        <h3>${pkg.name}</h3>
        <p class="desc">${pkg.description}</p>
        <div class="price">Rp${formatCurrency(pkg.price)}</div>
        <ul class="features">
          ${pkg.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
        </ul>
        <button class="btn btn-secondary" onclick="selectPackage('${pkg.id}', ${pkg.price})">
          Pilih Paket Ini
        </button>
      </div>
    `).join('');
  }

  function selectPackage(packageId, price) {
    // Store selected package
    window.selectedPackage = { id: packageId, price };
    
    // Highlight selected
    document.querySelectorAll('.package-card').forEach(card => {
      card.classList.remove('selected');
    });
    document.querySelector(`[data-package="${packageId}"]`).classList.add('selected');
    
    // Update order summary
    updateOrderSummary(price);
  }

  function updateOrderSummary(packagePrice) {
    const summary = document.getElementById('order-summary');
    const totalPrice = document.getElementById('total-price');
    
    // Get domain price dari API
    fetch('/api/domain-extensions.json')
      .then(r => r.json())
      .then(data => {
        const ext = domain.substring(domain.lastIndexOf('.'));
        const extData = data.extensions.find(e => e.ext === ext);
        const domainPrice = extData ? extData.newPrice : 0;
        
        const total = packagePrice + domainPrice;
        
        summary.innerHTML = `
          <div class="summary-item">
            <span>Domain ${domain}:</span>
            <span class="price">Rp${formatCurrency(domainPrice)}</span>
          </div>
          <div class="summary-item">
            <span>Paket Website (1 Tahun):</span>
            <span class="price">Rp${formatCurrency(packagePrice)}</span>
          </div>
          <hr>
          <div class="summary-item total">
            <span>Total Pembayaran:</span>
            <span class="price">Rp${formatCurrency(total)}</span>
          </div>
        `;
        
        totalPrice.textContent = `Rp${formatCurrency(total)}`;
      });
  }

  function setupFormHandlers() {
    const form = document.getElementById('checkout-form');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Form data siap untuk dikirim
    });
  }

  function processCheckout() {
    const form = document.getElementById('checkout-form');
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    if (!window.selectedPackage) {
      alert('Silakan pilih paket terlebih dahulu');
      return;
    }

    // Prepare order data
    const formData = new FormData(form);
    const orderData = {
      domain: domain,
      package: window.selectedPackage.id,
      fullname: formData.get('fullname'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      timestamp: new Date().toISOString()
    };

    // Send to backend
    fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        // Redirect ke payment gateway atau success page
        window.location.href = `/payment/${data.orderId}`;
      } else {
        alert(`Error: ${data.message}`);
      }
    })
    .catch(err => {
      console.error('Checkout error:', err);
      alert('Gagal memproses pesanan. Silakan coba lagi.');
    });
  }

  function goBackToCekDomain() {
    window.location.href = '/#cek-domain';
  }

  // Utility functions
  function formatCurrency(value) {
    return value.toLocaleString('id-ID');
  }

  function calculateDiscount(oldPrice, newPrice) {
    if (!oldPrice) return 0;
    return Math.round((1 - newPrice / oldPrice) * 100);
  }

  // Initialize
  init();
})();
```

**Update Cek Domain Result Card** untuk link ke checkout:

```javascript
// Dalam function createResultCard() di cek-domain.js
const checkoutLink = `/checkout/${encodeURIComponent(fullDomain)}`;

card.innerHTML = `
  <h3><i class="fas fa-check-circle"></i> ${sanitizeHTML(fullDomain)}</h3>
  <p class="cek-domain-result-info">${sanitizeHTML(extData.info)}</p>
  <p class="cek-domain-result-price">
    Rp${formatCurrency(extData.newPrice)}/tahun
  </p>
  <a href="${checkoutLink}" class="cek-domain-action-btn cek-domain-buy-btn">
    <i class="fas fa-lock"></i> Amankan Sekarang
  </a>
`;
```

---

### Critical #4: No Cleanup/Destroy Method

**Problem**:
```javascript
// Current: IIFE yang tidak bisa dihancurkan
(function () {
  'use strict';

  const section = document.querySelector('.cek-domain-section');
  if (!section) return;

  // ... 500+ lines
  
  cekDomainForm.addEventListener('submit', ...);
  cekDomainInput.addEventListener('input', ...);
  // ... more listeners
  
})(); // ← Executed immediately, no way to cleanup

// Problem jika:
// - SPA navigation away dan kembali → listeners duplicate
// - Lazy loading component → listeners keep referencing old elements
// - Page reloaded → memory leak potential
```

**Fix - Module Pattern with Cleanup**:
```javascript
const CekDomainComponent = (() => {
  'use strict';
  
  let instance = null;
  let listeners = [];

  function init() {
    const section = document.querySelector('.cek-domain-section');
    if (!section) return;

    // Cache elements
    const cekDomainInput = section.querySelector('#cek-domain-input');
    const cekDomainForm = section.querySelector('#cek-domain-form-main');
    
    // Define handlers (named functions untuk easier removal)
    const handleSubmit = async (e) => {
      e.preventDefault();
      const input = cekDomainInput.value.trim();
      if (validateDomainInput(input)) {
        await displayResults(input);
      }
    };
    
    const handleInput = (e) => {
      let value = e.target.value.toLowerCase();
      if (value !== e.target.value) e.target.value = value;
      debouncedSuggestions();
    };
    
    const handleKeydown = (e) => {
      if (e.key === 'Enter') cekDomainForm.dispatchEvent(new Event('submit'));
    };
    
    // Add listeners
    cekDomainForm.addEventListener('submit', handleSubmit);
    cekDomainInput.addEventListener('input', handleInput);
    cekDomainInput.addEventListener('keydown', handleKeydown);
    
    // Store references untuk cleanup
    listeners.push({ element: cekDomainForm, event: 'submit', handler: handleSubmit });
    listeners.push({ element: cekDomainInput, event: 'input', handler: handleInput });
    listeners.push({ element: cekDomainInput, event: 'keydown', handler: handleKeydown });
    
    // Initialize
    renderPricingPreview();
    initiatePlaceholderAnimation();
    
    console.log('✓ Cek Domain component initialized');
  }

  function destroy() {
    // Remove all event listeners
    listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    listeners = [];
    
    console.log('✓ Cek Domain component destroyed');
  }

  return {
    init,
    destroy,
    getInstance: () => instance
  };
})();

// Usage:
document.addEventListener('DOMContentLoaded', () => {
  CekDomainComponent.init();
  
  // If using SPA, expose for cleanup
  window.CekDomainComponent = CekDomainComponent;
});

// If navigating away (SPA):
function navigateAway() {
  CekDomainComponent.destroy();
  // ... navigate
}
```

---

## 📝 COMPLETE REFACTORED CODE

Here's the refactored `cek-domain.js` dengan semua fixes diterapkan:

```javascript
/** 
 * CEK DOMAIN COMPONENT - REFACTORED
 * Features:
 * - Real-time domain suggestions
 * - Availability checking via WHOIS
 * - Smart recommendation engine
 * - Error handling & recovery
 * - Mobile responsive
 * - Proper cleanup
 */

const CekDomainComponent = (() => {
  'use strict';

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  let state = {
    allExtensions: [],
    activeRequest: null,
    listeners: [],
    isInitialized: false
  };

  // ============================================
  // FETCH EXTENSIONS DATA
  // ============================================
  async function fetchExtensions() {
    try {
      const response = await fetch('/api/domain-extensions.json', {
        headers: { 'Accept': 'application/json' },
        cache: 'force-cache'
      });

      if (!response.ok) throw new Error('Failed to load extensions');

      const data = await response.json();
      state.allExtensions = data.extensions || [];
      console.log('✓ Extensions loaded:', state.allExtensions.length);
    } catch (error) {
      console.error('❌ Failed to fetch extensions:', error);
      // Use hardcoded fallback
      state.allExtensions = getFallbackExtensions();
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function formatCurrency(value) {
    return value.toLocaleString('id-ID');
  }

  function calculateSavings(oldP, newP) {
    if (!oldP) return 0;
    return Math.round((1 - newP / oldP) * 100);
  }

  function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // DOMAIN AVAILABILITY CHECKING
  // ============================================
  async function checkDomainAvailability(domain, abortSignal) {
    try {
      // Try WHOIS first
      return await checkViaWHOIS(domain, abortSignal);
    } catch (error) {
      console.warn('WHOIS failed, trying fallback:', error.message);
      // Fallback to Cloudflare DNS
      return checkViaCloudflareFallback(domain, abortSignal);
    }
  }

  async function checkViaWHOIS(domain, abortSignal) {
    // Using whois.com API or similar
    const response = await fetch(
      `https://www.whois.com/api/v1/domain?domain=${domain}`,
      {
        signal: abortSignal,
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error(`WHOIS API: ${response.status}`);
    }

    const data = await response.json();
    return {
      available: data.registrar === null || data.registrar === undefined,
      error: false,
      method: 'whois'
    };
  }

  async function checkViaCloudflareFallback(domain, abortSignal) {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
      {
        headers: { 'accept': 'application/dns-json' },
        signal: abortSignal
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudflare API: ${response.status}`);
    }

    const data = await response.json();
    return {
      available: !data.Answer || data.Answer.length === 0,
      error: false,
      method: 'cloudflare'
    };
  }

  // ============================================
  // DOMAIN PARSING
  // ============================================
  const validMultiPartExtensions = [
    '.co.id', '.my.id', '.sch.id', '.ac.id', '.go.id',
    '.or.id', '.web.id', '.biz.id', '.net.id'
  ];

  function parseDomain(input) {
    const cleaned = input.toLowerCase().trim();

    for (const ext of validMultiPartExtensions) {
      if (cleaned.endsWith(ext)) {
        return {
          base: cleaned.slice(0, -ext.length),
          ext,
          isFullDomain: true,
          isInvalid: false
        };
      }
    }

    if (cleaned.includes('.')) {
      const ext = cleaned.slice(cleaned.lastIndexOf('.'));
      if (state.allExtensions.some(e => e.ext === ext)) {
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

  // ============================================
  // EVENT HANDLERS
  // ============================================
  function createHandlers(section) {
    const cekDomainInput = section.querySelector('#cek-domain-input');
    const cekDomainForm = section.querySelector('#cek-domain-form-main');
    const cekDomainError = section.querySelector('#cek-domain-error');
    const debouncedSuggestions = debounce(() => renderInstantSuggestions(section), 300);

    const handleInput = (e) => {
      let value = e.target.value;

      if (value !== value.toLowerCase()) {
        e.target.value = value.toLowerCase();
        value = value.toLowerCase();
      }

      if (/[^a-z0-9.-]/i.test(value)) {
        cekDomainError.innerHTML = '<i class="fas fa-warning"></i> Hanya huruf, angka, titik, dan strip yang diperbolehkan';
        cekDomainError.style.display = 'block';
      } else {
        cekDomainError.style.display = 'none';
        debouncedSuggestions();
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const input = cekDomainInput.value.trim();

      if (validateDomainInput(input, section)) {
        await displayResults(input, section);
      }
    };

    const handleKeydown = (e) => {
      if (e.key === 'Enter') {
        cekDomainForm.dispatchEvent(new Event('submit'));
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        const suggestions = section.querySelector('#cek-domain-suggestions');
        suggestions.style.display = 'none';
      }, 200);
    };

    return {
      handleInput,
      handleSubmit,
      handleKeydown,
      handleBlur,
      debouncedSuggestions
    };
  }

  // ============================================
  // VALIDATION & DISPLAY
  // ============================================
  function validateDomainInput(input, section) {
    const cekDomainError = section.querySelector('#cek-domain-error');

    if (!input || !input.trim()) {
      cekDomainError.innerHTML = '<i class="fas fa-info-circle"></i> Masukkan nama domain (minimal 3 karakter)';
      cekDomainError.style.display = 'block';
      return false;
    }

    const { base, isInvalid } = parseDomain(input);

    if (isInvalid) {
      cekDomainError.innerHTML = '<i class="fas fa-warning"></i> Ekstensi tidak valid. Coba: .com, .id, .co.id';
      cekDomainError.style.display = 'block';
      return false;
    }

    if (base.length < 3) {
      cekDomainError.innerHTML = '<i class="fas fa-info-circle"></i> Nama domain minimal 3 karakter';
      cekDomainError.style.display = 'block';
      return false;
    }

    const baseRegex = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
    if (!baseRegex.test(base)) {
      cekDomainError.innerHTML = '<i class="fas fa-warning"></i> Format domain tidak valid';
      cekDomainError.style.display = 'block';
      return false;
    }

    cekDomainError.style.display = 'none';
    return true;
  }

  async function displayResults(inputVal, section) {
    const cekDomainBtn = section.querySelector('#cek-domain-btn');
    const cekDomainResultsList = section.querySelector('#cek-domain-results-list');
    const cekDomainResults = section.querySelector('#cek-domain-results');

    // Cancel previous request
    if (state.activeRequest) {
      state.activeRequest.abort();
    }

    state.activeRequest = new AbortController();
    cekDomainBtn.disabled = true;
    const originalBtnHTML = cekDomainBtn.innerHTML;
    cekDomainBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...';

    cekDomainResultsList.innerHTML = '';
    cekDomainResults.removeAttribute('hidden');
    cekDomainResults.classList.add('show');
    cekDomainResults.scrollIntoView({ behavior: 'smooth' });

    const { base, ext, isFullDomain, isInvalid } = parseDomain(inputVal);

    if (isInvalid) {
      cekDomainResultsList.innerHTML = `
        <li style="grid-column: 1/-1; text-align: center; color: #e74c3c;">
          <i class="fas fa-exclamation-circle"></i> Format tidak valid
        </li>
      `;
      cekDomainBtn.disabled = false;
      cekDomainBtn.innerHTML = originalBtnHTML;
      return;
    }

    const targetExts = isFullDomain
      ? state.allExtensions.filter(e => e.ext === ext)
      : state.allExtensions;

    try {
      const resultCards = await Promise.all(
        targetExts.map(async (extData) => {
          try {
            const fullDomain = isFullDomain
              ? `${base}${ext}`
              : `${base}${extData.ext}`;

            const result = await checkDomainAvailability(
              fullDomain,
              state.activeRequest.signal
            );

            return {
              domain: fullDomain,
              extData,
              available: result.available,
              error: result.error,
              message: result.message
            };
          } catch (err) {
            if (err.name === 'AbortError') return null;
            
            return {
              domain: `${base}${extData.ext}`,
              extData,
              available: null,
              error: true,
              message: 'Gagal mengecek ketersediaan'
            };
          }
        })
      );

      // Filter out cancelled requests
      const validResults = resultCards.filter(r => r !== null);

      if (!validResults.length) {
        cekDomainBtn.disabled = false;
        cekDomainBtn.innerHTML = originalBtnHTML;
        return;
      }

      // Render results
      cekDomainResultsList.innerHTML = '';

      // Find recommended domain
      let recommendedDomain = null;
      if (!isFullDomain) {
        const isBusinessIntent = /(bisnis|company|corp|store|toko)/i.test(base);
        const isPersonalIntent = /(personal|blog|my|portfolio|cv)/i.test(base);

        if (isBusinessIntent) {
          recommendedDomain = validResults.find(
            r => r.available && (r.extData.highlight === 'business' || r.extData.highlight === 'best')
          );
        } else if (isPersonalIntent) {
          recommendedDomain = validResults.find(
            r => r.available && (r.extData.highlight === 'cheap' || r.extData.highlight === 'best')
          );
        }

        if (!recommendedDomain) {
          recommendedDomain = validResults.find(r => r.available && r.extData.highlight === 'best') ||
                              validResults.find(r => r.available && r.extData.highlight === 'cheap') ||
                              validResults.find(r => r.available);
        }
      }

      // Render all results
      validResults.forEach((result) => {
        const isRecommended = recommendedDomain && result.domain === recommendedDomain.domain;
        const card = createResultCard(result, isRecommended);
        cekDomainResultsList.appendChild(card);
      });

    } catch (err) {
      console.error('Display results error:', err);
      cekDomainResultsList.innerHTML = `
        <li style="grid-column: 1/-1; text-align: center;">
          <i class="fas fa-exclamation-triangle"></i> Terjadi kesalahan
        </li>
      `;
    } finally {
      cekDomainBtn.disabled = false;
      cekDomainBtn.innerHTML = originalBtnHTML;
    }
  }

  function createResultCard(result, isRecommended = false) {
    const card = document.createElement('li');
    const { domain, extData, available, error, message } = result;

    if (error) {
      card.className = 'cek-domain-result-card error';
      card.innerHTML = `
        <h3><i class="fas fa-exclamation-triangle"></i> ${sanitizeHTML(domain)}</h3>
        <p class="cek-domain-result-info">${message}</p>
        <button onclick="location.reload()" class="cek-domain-action-btn">
          <i class="fas fa-redo"></i> Coba Lagi
        </button>
      `;
    } else if (available) {
      card.className = `cek-domain-result-card available ${isRecommended ? 'super-highlight' : ''}`;
      const discount = calculateSavings(extData.oldPrice, extData.newPrice);

      card.innerHTML = `
        ${isRecommended ? '<div class="cek-domain-recommended-badge">Rekomendasi Terbaik</div>' : ''}
        <h3><i class="fas fa-check-circle"></i> ${sanitizeHTML(domain)}</h3>
        <p class="cek-domain-result-info">${sanitizeHTML(extData.info)}</p>
        ${extData.oldPrice ? `<span class="cek-domain-result-old">Rp${formatCurrency(extData.oldPrice)}</span>` : ''}
        <p class="cek-domain-result-price">
          dari <strong>Rp${formatCurrency(extData.newPrice)}</strong> /tahun
        </p>
        <a href="${getWhatsAppURL(domain)}" class="cek-domain-action-btn cek-domain-buy-btn">
          <i class="fas fa-lock"></i> Amankan via WhatsApp
        </a>
      `;
    } else {
      card.className = 'cek-domain-result-card unavailable';
      card.innerHTML = `
        <h3><i class="fas fa-times-circle"></i> ${sanitizeHTML(domain)}</h3>
        <p class="cek-domain-result-info">Domain sudah diambil</p>
        <p style="font-size: 0.85rem; color: #999;">Coba variasi lain atau transfer dari registrar</p>
      `;
    }

    return card;
  }

  function getWhatsAppURL(domain) {
    const message = encodeURIComponent(
      `Halo SISITUS, saya tertarik dengan domain: ${domain}\n\n` +
      `Tolong informasi harga dan promo terbaru.`
    );
    return `https://wa.me/6281215289095?text=${message}`;
  }

  function renderInstantSuggestions(section) {
    const cekDomainInput = section.querySelector('#cek-domain-input');
    const cekDomainSuggestions = section.querySelector('#cek-domain-suggestions');
    const inputVal = cekDomainInput.value;

    const { base, isFullDomain, isInvalid } = parseDomain(inputVal);

    if (!base || base.length < 2 || isFullDomain || isInvalid) {
      cekDomainSuggestions.style.display = 'none';
      return;
    }

    const topExts = ['.com', '.id', '.co.id', '.web.id', '.my.id'];
    cekDomainSuggestions.innerHTML = '';

    topExts.forEach(ext => {
      const fullDomain = `${base}${ext}`;
      const extData = state.allExtensions.find(item => item.ext === ext);

      const item = document.createElement('div');
      item.className = 'cek-domain-suggestion-item';
      item.setAttribute('role', 'option');

      const extLabel = ext.replace('.', '').toUpperCase();
      const priceHTML = extData && extData.newPrice ? `
        <div class="cek-domain-suggestion-price">
          ${extData.oldPrice ? `<span class="cek-domain-suggestion-price-old">Rp${formatCurrency(extData.oldPrice)}</span>` : ''}
          <span class="cek-domain-suggestion-price-new">Rp${formatCurrency(extData.newPrice)}</span>
        </div>
      ` : '';

      item.innerHTML = `
        <div class="cek-domain-suggestion-icon">${extLabel}</div>
        <div class="cek-domain-suggestion-content">
          <div class="cek-domain-suggestion-domain">${sanitizeHTML(fullDomain)}</div>
          <div class="cek-domain-suggestion-note">${sanitizeHTML(extData?.info || '')}</div>
        </div>
        ${priceHTML}
      `;

      item.addEventListener('click', () => {
        cekDomainInput.value = fullDomain;
        cekDomainSuggestions.style.display = 'none';
        cekDomainInput.form.dispatchEvent(new Event('submit'));
      });

      cekDomainSuggestions.appendChild(item);
    });

    cekDomainSuggestions.style.display = 'block';
  }

  function renderPricingPreview(section) {
    const cekDomainPopularExtensions = section.querySelector('#cek-domain-popular-extensions');
    const cekDomainPricingPreview = section.querySelector('#cek-domain-pricing-preview');

    if (!cekDomainPopularExtensions) return;

    cekDomainPopularExtensions.innerHTML = '';
    const sortedExts = [...state.allExtensions]
      .sort((a, b) => {
        const order = { best: 3, cheap: 2, business: 1, none: 0 };
        return order[b.highlight] - order[a.highlight];
      })
      .slice(0, 8);

    sortedExts.forEach((ext) => {
      const discount = calculateSavings(ext.oldPrice, ext.newPrice);
      const item = document.createElement('div');
      item.className = `cek-domain-ext-item ${ext.highlight !== 'none' ? `highlight-${ext.highlight}` : ''}`;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      let labels = '';
      if (ext.label) {
        labels = `<span class="cek-domain-ext-label"><i class="fas fa-star"></i> ${ext.label}</span>`;
      }
      if (discount > 0) {
        labels += `<span class="cek-domain-ext-discount">-${discount}%</span>`;
      }

      item.innerHTML = `
        <div class="cek-domain-ext-labels">${labels}</div>
        <div class="cek-domain-ext-name">${ext.ext}</div>
        <div class="cek-domain-ext-prices">
          ${ext.oldPrice ? `<span class="cek-domain-ext-old">Rp${formatCurrency(ext.oldPrice)}</span>` : ''}
          <span class="cek-domain-ext-new">Rp${formatCurrency(ext.newPrice)}</span>
        </div>
        <div class="cek-domain-ext-info">${ext.info}</div>
      `;

      const handleSelect = () => {
        const input = section.querySelector('#cek-domain-input');
        input.value = `contoh${ext.ext}`;
        input.form.dispatchEvent(new Event('submit'));
      };

      item.addEventListener('click', handleSelect);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSelect();
      });

      cekDomainPopularExtensions.appendChild(item);
    });

    if (cekDomainPricingPreview) {
      cekDomainPricingPreview.style.display = 'block';
      cekDomainPricingPreview.classList.add('fade-in');
    }
  }

  function initiatePlaceholderAnimation(section) {
    const cekDomainInput = section.querySelector('#cek-domain-input');
    const placeholderTexts = [
      'toko online anda...',
      'bisnis anda.id',
      'portfolio anda.com',
      'blog digital.my.id',
      'startup anda.web'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
      const currentText = placeholderTexts[textIndex];

      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      cekDomainInput.setAttribute('placeholder', currentText.substring(0, charIndex));

      let speed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === currentText.length) {
        speed = 1500;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % placeholderTexts.length;
        speed = 300;
      }

      setTimeout(typeEffect, speed);
    }

    typeEffect();
  }

  // ============================================
  // INITIALIZATION & CLEANUP
  // ============================================
  async function init() {
    if (state.isInitialized) return;

    await fetchExtensions();

    const section = document.querySelector('.cek-domain-section');
    if (!section) {
      console.warn('Cek domain section not found');
      return;
    }

    const handlers = createHandlers(section);
    const cekDomainForm = section.querySelector('#cek-domain-form-main');
    const cekDomainInput = section.querySelector('#cek-domain-input');

    cekDomainForm.addEventListener('submit', handlers.handleSubmit);
    cekDomainInput.addEventListener('input', handlers.handleInput);
    cekDomainInput.addEventListener('keydown', handlers.handleKeydown);
    cekDomainInput.addEventListener('blur', handlers.handleBlur);

    state.listeners.push(
      { element: cekDomainForm, event: 'submit', handler: handlers.handleSubmit },
      { element: cekDomainInput, event: 'input', handler: handlers.handleInput },
      { element: cekDomainInput, event: 'keydown', handler: handlers.handleKeydown },
      { element: cekDomainInput, event: 'blur', handler: handlers.handleBlur }
    );

    renderPricingPreview(section);
    initiatePlaceholderAnimation(section);

    state.isInitialized = true;
    console.log('✓ Cek Domain component initialized');
  }

  function destroy() {
    if (!state.isInitialized) return;

    state.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    if (state.activeRequest) {
      state.activeRequest.abort();
    }

    state.listeners = [];
    state.isInitialized = false;

    console.log('✓ Cek Domain component destroyed');
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    init,
    destroy,
    isInitialized: () => state.isInitialized
  };
})();

// AUTO-INIT on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CekDomainComponent.init();
  });
} else {
  CekDomainComponent.init();
}

// Expose globally for debugging & SPA cleanup
window.CekDomainComponent = CekDomainComponent;
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: Critical Fixes (MUST DO)
- [ ] **Fix silent error handling** - Return error object bukan silent fail (30 min)
- [ ] **Add AbortController** - Prevent race conditions (20 min)
- [ ] **Create checkout page** - `/checkout/index.html` + `checkout.js` (2 hours)
- [ ] **Add mobile-responsive CSS** - Mobile-first media queries (45 min)
- [ ] **Implement cleanup/destroy** - Module pattern dengan destroy method (30 min)

### Phase 2: Data & APIs (THIS SPRINT)
- [ ] Move hardcoded prices to `/api/domain-extensions.json` (1 hour)
- [ ] Create `/api/orders/create` endpoint for checkout (1.5 hours)
- [ ] Add disclaimer UI about DNS check limitations (20 min)
- [ ] Create CSS for checkout page and error states (1 hour)

### Phase 3: Enhancements (NEXT SPRINT)
- [ ] Add analytics/conversion tracking
- [ ] Enhance recommendation algorithm with more keywords
- [ ] Add payment gateway integration
- [ ] Setup email confirmation system
- [ ] Add admin dashboard for order management

---

## ✅ TESTING CHECKLIST

- [ ] Rapid form submissions (no race conditions)
- [ ] API timeout handling (graceful degradation)
- [ ] Mobile portrait/landscape responsiveness
- [ ] Keyboard-only navigation (Tab, Enter)
- [ ] Screen reader testing (ARIA compliance)
- [ ] Long domain names (edge case)
- [ ] Special character filtering
- [ ] Network throttle (slow connection)
- [ ] Browser console (no errors/warnings)
- [ ] Conversion flow to WhatsApp

---

**End of Audit Document**
