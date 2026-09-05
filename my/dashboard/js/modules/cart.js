/**
 * CART PAGE MODULE - ENHANCED VERSION
 * ===================================
 * Complete cart management for checkout flow
 *
 * Features:
 * - Inline authentication (register + login)
 * - Promo code validation
 * - Email verification enforcement
 * - Order creation + midtrans payment
 * - Full checkout flow
 *
 * Flow:
 * 1. Guest views cart + inline login (SharedAuthForm)
 * 2. User registers/logins + verifies email
 * 3. User applies promo code (optional)
 * 4. User clicks "Lanjut Bayar" → creates order → midtrans payment
 * 5. Payment success → redirected to /invoice/{order_id}
 */
import {
  CartManager,
  WishlistManager
} from '/assets/js/modules/unified-cart.js';
import {
  showSuccess,
  showError,
  showInfo,
  formatPrice,
  isValidEmail,
  setButtonLoading
} from '/assets/js/modules/unified-utils.js';
import APIClient from '/assets/js/modules/unified-api.js';
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
import SharedAuthForm from '/assets/js/modules/shared-auth-form.js';
// ============================================================================
// CART STATE MANAGEMENT
// ============================================================================
let cartState = {
  container: null,
  currentUser: null,
  userId: null,
  userEmail: null,
  emailVerified: false,
  // Promo state
  promoCode: null,
  promoDiscount: 0,
  promoDescription: null,
  promoValidated: false,
  isValidatingPromo: false,
  // UI state
  isProcessingCheckout: false,
  selectedDomain: null,
  pricing: {
    packages: {},
    addons: {}
  }
};
// Helper for operations that might trigger full re-renders and browser scroll jumps
async function withScrollPreservation(action) {
  const scrollContainer = document.getElementById('content');
  const scrollYContent = scrollContainer ? scrollContainer.scrollTop : 0;
  const scrollYWindow = window.scrollY;
  const container = cartState.container;
  if (container) {
    container.style.minHeight = `${container.getBoundingClientRect().height}px`;
  }
  await action();
  const restoreScroll = () => {
    if (scrollContainer) scrollContainer.scrollTop = scrollYContent;
    window.scrollTo({
      top: scrollYWindow,
      behavior: 'instant'
    });
  };
  restoreScroll();
  requestAnimationFrame(restoreScroll);
  setTimeout(restoreScroll, 10);
  setTimeout(restoreScroll, 50);
  if (container) {
    setTimeout(() => {
      container.style.minHeight = '';
    }, 60);
  }
}
// Expose global handlers
window.removeCartItem = removeCartItem;
window.changeItemPackage = (domain, packageId) => {
  try {
    const cart = CartManager.getCart();
    const item = cart.domains.find(d => d.domain.toLowerCase() === domain.toLowerCase());
    if (!item) return;
    const pkg = cartState.pricing.packages[packageId];
    if (!pkg || pkg.active === false) return;
    const newPrice = pkg.price;
    CartManager.update(domain, {
      package: packageId,
      packagePrice: newPrice,
      // Jika none, renewal price ikut harga domain. Jika ada paket, ikut paket.
      renewalPrice: packageId === 'none' ? (item.domainPrice || 0) : newPrice
    });
    withScrollPreservation(async () => {
      if (cartState.currentUser) {
        await render(cartState.currentUser);
      } else if (window.updateCartPreview) {
        window.updateCartPreview();
      }
    });
    showSuccess('✓ Paket Diperbarui', `Paket diganti ke ${pkg.name}`);
  } catch (error) {
    console.log('Error changing package:', error);
    showError('Gagal', error.message);
  }
};
window.toggleCartAddon = async (domain, addonId, isChecked) => {
  try {
    const addonDef = cartState.pricing.addons[addonId];
    if (!addonDef) return;
    const cart = CartManager.getCart();
    const item = cart.domains.find(d => d.domain.toLowerCase() === domain.toLowerCase());
    if (!item) return;
    let itemAddons = item.addons || [];
    if (isChecked) {
      // Add addon to domain
      const existing = itemAddons.find(a => a.id.toLowerCase() === addonId.toLowerCase());
      if (!existing) {
        itemAddons.push({
          id: addonId,
          name: addonDef.name,
          price: addonDef.price,
          duration: addonDef.duration
        });
      }
    } else {
      // Remove addon from domain
      itemAddons = itemAddons.filter(a => a.id.toLowerCase() !== addonId.toLowerCase());
    }
    // Save to CartManager
    CartManager.update(domain, {
      addons: itemAddons
    });
    await withScrollPreservation(async () => {
      if (cartState.currentUser) {
        await render(cartState.currentUser);
      } else if (window.updateCartPreview) {
        window.updateCartPreview();
      }
    });
  } catch (error) {
    console.log('Error toggling addon:', error);
    showError('Gagal', error.message);
  }
};
/**
 * MAIN RENDER FUNCTION
 * Entry point for cart page rendering
 */
export async function render(currentUser) {
  try {
    cartState.container = document.getElementById('cart-container');
    if (!cartState.container) {
      console.log('[Cart] #cart-container not found');
      return;
    }
    // Delegated Action: Parse URL parameters for secure Add to Cart
    // (Digunakan saat user login di Public mencoba menambah keranjang)
    try {
      // Because dashboard uses hash routing (#!/dashboard/cart?addDomain=...), we need to parse the hash
      const hashSplit = window.location.hash.split('?');
      if (hashSplit.length > 1) {
        const queryParams = new URLSearchParams(hashSplit[1]);
        const addDomain = queryParams.get('addDomain');
        const addTld = queryParams.get('tld');
        if (addDomain) {
          const tld = addTld || addDomain.split('.').pop();
          // Clean the URL immediately without reloading the page
          const cleanUrl = window.location.pathname + hashSplit[0];
          window.history.replaceState(null, '', cleanUrl);
          // Process addition through secure existing CartManager mechanism
          // VALIDASI SOURCE OF TRUTH: Ambil harga otentik dari API, BUKAN dari parameter
          showInfo('Memproses', `Memeriksa ketersediaan ${addDomain}...`);
          const [configRes, checkRes] = await Promise.all([
            APIClient.fetchPricingConfig(),
            APIClient.checkDomain(addDomain)
          ]);
          if (checkRes.success && checkRes.data && checkRes.data.available) {
            let starterPrice = 599000;
            let domainPrice = 150000;
            if (configRes.success && configRes.data) {
              if (configRes.data.packages?.starter) {
                starterPrice = configRes.data.packages.starter.price;
              }
              if (configRes.data.domains) {
                const cleanTld = tld.startsWith('.') ? tld.substring(1) : tld;
                const extData = Object.values(configRes.data.domains).find(d => d.ext === cleanTld || d.ext === `.${cleanTld}`);
                if (extData && extData.registration) {
                  domainPrice = extData.registration;
                }
              }
            }
            CartManager.add(addDomain, tld, {
              package: 'starter',
              duration: 1,
              domainPrice: domainPrice,
              packagePrice: starterPrice,
              price: starterPrice, // legacy format
              renewalPrice: starterPrice,
              basePrice: starterPrice
            });
          } else {
            showError('❌ Gagal', `Domain ${addDomain} tidak tersedia atau terjadi kesalahan jaringan.`);
          }
        }
      }
    } catch (e) {
      console.log('[Cart] Error parsing URL parameters:', e);
    }
    // Fetch pricing configuration
    const pricingRes = await APIClient.fetchPricingConfig();
    if (pricingRes.success && pricingRes.data) {
      cartState.pricing = pricingRes.data;
    }
    // CRITICAL: Refresh user data from storage in case they just verified email
    if (!currentUser) {
      AuthManager.refreshUserData(); // NEW: Load latest user session
    }
    cartState.currentUser = currentUser || AuthManager.getCurrentUser();
    if (cartState.currentUser) {
      cartState.userId = cartState.currentUser.userId;
      cartState.userEmail = cartState.currentUser.email;
      cartState.emailVerified = cartState.currentUser.emailVerified || false;
    } else {
      cartState.userId = null;
      cartState.userEmail = null;
      cartState.emailVerified = false;
    }
    // Register background verification check listeners once
    if (!window.cartListenersRegistered) {
      window.cartListenersRegistered = true;
      const checkVerificationStatus = () => {
        const user = AuthManager.getCurrentUser();
        if (user && user.emailVerified && (!cartState.currentUser || !cartState.currentUser.emailVerified)) {
          console.log('[Cart] Auto-detecting email verification success in background!');
          cartState.currentUser = user;
          cartState.userId = user.userId;
          cartState.userEmail = user.email;
          cartState.emailVerified = true;
          render(user);
        }
      };
      window.addEventListener('focus', checkVerificationStatus);
      window.addEventListener('storage', (e) => {
        if (e.key === AuthManager.SESSION_KEY) {
          checkVerificationStatus();
        }
      });
    }
    // Initialize auth if not already done
    if (!AuthManager.isLoggedIn() && !cartState.currentUser) {
      AuthManager.init();
    }
    // Load saved promo if exists
    loadSavedPromo();
    // Route based on auth state
    if (cartState.verificationPollInterval) {
      clearInterval(cartState.verificationPollInterval);
      cartState.verificationPollInterval = null;
    }
    if (!cartState.currentUser) {
      // Guest: show inline auth + cart preview
      renderGuestCheckout();
    } else if (CartManager.isEmpty()) {
      // Empty cart
      renderEmptyCart();
    } else {
      // Authenticated + verified: show full cart
      renderAuthenticatedCart();
    }
  } catch (error) {
    console.log('[Cart] Error rendering:', error);
    showError('Error', error.message);
    cartState.container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h2>❌ Error</h2>
        <p>${error.message}</p>
        <a href="#!/dashboard/checkout" class="btn" style="display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Kembali ke Beranda
        </a>
      </div>
    `;
  }
}
// ============================================================================
// HELPER FOR SELECTED DOMAIN
// ============================================================================
window.selectCartDomain = (domain) => {
  cartState.selectedDomain = domain;
  withScrollPreservation(async () => {
    if (cartState.currentUser) {
      await render(cartState.currentUser);
    } else if (window.updateCartPreview) {
      window.updateCartPreview();
    }
  });
};

function getSelectedCartSummary() {
  const cartData = CartManager.getCart();
  const items = (cartData && cartData.domains) || [];
  if (items.length > 0 && (!cartState.selectedDomain || !items.find(i => i.domain === cartState.selectedDomain))) {
    cartState.selectedDomain = items[0].domain;
  }
  const selectedItem = items.find(i => i.domain === cartState.selectedDomain);
  let domainSubtotal = 0;
  if (selectedItem) {
    domainSubtotal = (selectedItem.price || 0) * (selectedItem.duration || 1);
  }
  const addons = (selectedItem && selectedItem.addons) || [];
  const addonsTotal = addons.reduce((sum, a) => sum + ((a.price || 0) * (a.quantity || 1)), 0);
  let subtotal = domainSubtotal + addonsTotal;
  let discount = 0;
  if (cartData && cartData.coupon) {
    const type = cartData.coupon.discountType;
    const value = cartData.coupon.discountValue;
    if (type === 'percent' || type === 'percentage') {
      discount = subtotal * (value / 100);
    } else if (type === 'fixed') {
      discount = value;
    }
  }
  // Also update cartState if promo exists
  cartState.promoDiscount = Math.round(discount);
  let subtotalAfterDiscount = subtotal - cartState.promoDiscount;
  let ppn = Math.round(subtotalAfterDiscount * 0.11);
  let finalTotal = Math.round(subtotalAfterDiscount + ppn);
  return {
    items,
    selectedItem,
    addons,
    domainSubtotal,
    addonsTotal,
    subtotal: Math.round(subtotal),
    discount: cartState.promoDiscount,
    ppn,
    finalTotal
  };
}
// ============================================================================
// GUEST CART PREVIEW
// ============================================================================
export function updateCartPreview() {
  const container = document.getElementById('cart-preview-container');
  if (!container && !document.querySelector('.cart-preview')) return;
  if (document.activeElement && document.activeElement.tagName !== 'BODY') {
    document.activeElement.blur();
  }
}
// ============================================================================
// GUEST CHECKOUT - INLINE AUTH + CART PREVIEW
// ============================================================================
function renderGuestCheckout() {
  cartState.container.innerHTML = `
    <div class="page-container">
      <div class="cart-page guest-checkout-grid">

        <!-- Cart Preview Container -->
        <div id="cart-preview-container"></div>

        <!-- Auth Form Container -->
        <div>
          <div id="shared-auth-form-container"></div>
        </div>

      </div>
    </div>
  `;
  // Function to render the cart preview card reactively
  const updateCartPreview = () => {
    // Blur active element to prevent browser's auto-scroll on focus loss
    if (document.activeElement && document.activeElement.tagName !== 'BODY') {
      document.activeElement.blur();
    }
    const {
      items,
      selectedItem,
      addons,
      domainSubtotal,
      addonsTotal,
      subtotal,
      discount,
      ppn,
      finalTotal
    } = getSelectedCartSummary();
    const previewContainer = document.getElementById('cart-preview-container');
    if (!previewContainer) return;
    let previewContent = '<div class="preview-empty">Keranjang kosong</div>';
    if (items.length > 0) {
      let addonsHtml = '';
      if (addonsTotal > 0) {
        addonsHtml = `
                <div class="price-row" style="margin-bottom: 4px;">
                  <span class="price-row-label">Layanan Tambahan:</span>
                  <span class="price-value">${formatPrice(addonsTotal)}</span>
                </div>
        `;
      }
      let promoHtml = '';
      if (discount > 0) {
        let promoDescHtml = '';
        if (cartState.promoDescription) {
          promoDescHtml = `<span class="promo-desc-detail" style="font-size: 11px; color: var(--text-secondary); font-style: italic; margin-top: 2px; padding-left: 18px;">(${cartState.promoDescription})</span>`;
        }
        promoHtml = `
                <div class="price-row discount" style="align-items: flex-start; padding: 4px 0;">
                  <div style="display: flex; flex-direction: column; text-align: left;">
                    <span class="price-row-label"><i class="ph-fill ph-tag"></i> Diskon Promo:</span>
                    ${promoDescHtml}
                  </div>
                  <span class="price-value">-${formatPrice(discount)}</span>
                </div>
        `;
      }
      const itemsHtml = items.map(item => renderCartItem(item)).join('');
      previewContent = `
            <div class="preview-items" style="border-bottom: 1px solid var(--border-light); margin-bottom: 0.75rem; padding-bottom: 0.25rem;">
              ${itemsHtml}
            </div>

            <!-- Detailed Price Breakdown -->
            <div class="preview-breakdown" style="font-size: 13px; border-bottom: 2px solid var(--border-light); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
              <div class="price-row" style="margin-bottom: 4px;">
                <span class="price-row-label">Domain (1 dari ${items.length}):</span>
                <span class="price-value">${formatPrice(domainSubtotal)}</span>
              </div>

              ${addonsHtml}

              <div class="price-row subtotal" style="padding-top: 0.5rem; margin-top: 0.5rem;">
                <span class="price-row-label">Subtotal:</span>
                <span class="price-value">${formatPrice(subtotal)}</span>
              </div>

              <div class="price-row ppn" style="margin-bottom: 4px;">
                <span class="price-row-label">PPN (11%):</span>
                <span class="price-value">${formatPrice(ppn)}</span>
              </div>

              ${promoHtml}
            </div>

            <div class="price-row total preview-total" style="padding-top: 0.5rem;">
              <span>Total Pembayaran:</span>
              <span class="price-value">${formatPrice(finalTotal)}</span>
            </div>
      `;
    }
    previewContainer.innerHTML = `
      <div class="cart-preview">
        <h3 class="preview-title" style="margin-bottom: 0.75rem; font-size: 1.1rem;">
          <i class="ph-fill ph-shopping-cart"></i> Preview Keranjang
        </h3>
        <div class="preview-body" style="background: var(--bg-white); border: 1px solid var(--border-light); border-radius: var(--radius); padding: clamp(0.75rem, 2vw, 1.25rem);">
          ${previewContent}
        </div>
      </div>
    `;
  };
  // Register updateCartPreview globally
  window.updateCartPreview = updateCartPreview;
  // Initial render of preview
  updateCartPreview();
  // Initialize SharedAuthForm with callbacks
  const authForm = new SharedAuthForm({
    containerId: 'shared-auth-form-container',
    inlineMode: true,
    showGoogleSignIn: true,
    showPrivacyNotice: true,
    onLoginSuccess: handleAuthSuccess,
    onRegisterSuccess: handleAuthSuccess
  });
  authForm.render();
  // Expose google login handler
  window.handleGoogleSignIn = handleGoogleSignIn;
}
/**
 * Handle successful authentication
 * User logged in from inline form
 */
async function handleAuthSuccess(userData) {
  try {
    console.log('[Cart] Auth success, userData:', userData);
    // Save to auth manager
    AuthManager.saveSession(userData);
    // Update cart state
    cartState.currentUser = userData;
    cartState.userId = userData?.userId;
    cartState.userEmail = userData?.email;
    cartState.emailVerified = userData?.emailVerified || false;
    // IMPORTANT: Redirect to verification page if email is not verified
    if (!cartState.emailVerified) {
      showSuccess('✓ Akun Dibuat!', 'Mengarahkan ke halaman verifikasi...');
      setTimeout(() => {
        window.location.href = '/auth/verify-email.html';
      }, 1500);
      return;
    }
    showSuccess('✓ Login Berhasil!', 'Halaman sedang diperbarui...');
    // Re-render based on verification status
    setTimeout(() => {
      render(userData);
    }, 1500);
  } catch (error) {
    console.log('[Cart] Auth success error:', error);
    showError('Error', error.message);
  }
}
/**
 * Handle Google Sign-In
 */
async function handleGoogleSignIn(response) {
  if (!response.credential) {
    showError('Error', 'Google Sign-In gagal');
    return;
  }
  try {
    showInfo('Loading', 'Verifying Google token...');
    const result = await APIClient.verifyGoogleToken(response.credential);
    if (!result.success) {
      throw new Error(result.message || 'Google Sign-In gagal');
    }
    if (!result.data) {
      throw new Error('Data pengguna tidak ditemukan');
    }
    // Save session
    AuthManager.saveSession(result.data);
    showSuccess('✓ Google Login Sukses!', 'Halaman sedang diperbarui...');
    // Re-render
    setTimeout(() => {
      render(result.data);
    }, 1500);
  } catch (error) {
    console.log('[Cart] Google auth error:', error);
    showError('Error', error.message);
  }
}
// ============================================================================
// EMAIL VERIFICATION PROMPT
// ============================================================================
function renderEmailVerificationPrompt() {
  cartState.container.innerHTML = `
    <div class="page-container">
      <div class="verification-prompt" style="max-width: 600px; margin: 40px auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div class="verification-alert" style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
          <h2 style="color: #92400e; margin-top: 0; display: flex; align-items: center; gap: 10px; font-size: 1.3rem;">
            <i class="ph-fill ph-envelope-open"></i> Verifikasi Email Diperlukan
          </h2>
          <p style="color: #b45309; margin-bottom: 8px;">
            Email Anda belum terverifikasi. Silakan cek email untuk link verifikasi.
          </p>
          <p style="color: #b45309; margin: 0;">
            Email dikirim ke: <strong>${cartState.currentUser?.email}</strong>
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-flex; align-items: center; gap: 10px; color: #2563eb; font-weight: 500; font-size: 0.95rem; margin-bottom: 15px; padding: 8px 16px; background-color: #eff6ff; border-radius: 20px; animation: pulse 2s infinite;">
            <span class="css-spinner" style="border-color: rgba(0,0,0,0.1); border-top-color: var(--color-primary);"></span> Menunggu verifikasi email...
          </div>
          <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">Halaman ini akan otomatis diperbarui setelah Anda memverifikasi email Anda.</p>
          <button onclick="location.reload()" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <i class="ph-fill ph-arrows-clockwise"></i> Cek Manual / Refresh
          </button>
        </div>

        <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--border-light);">

        <div style="color: var(--text-light); text-align: center; font-size: var(--teks-kecil);">
          <p>Link verifikasi tidak muncul?</p>
          <a href="/auth/verify-email.html" style="color: var(--primary-blue); text-decoration: none; font-weight: bold;">
            Buka halaman verifikasi email
          </a>
        </div>
      </div>
    </div>
  `;
  // Start polling to check if user has verified their email in the database
  if (!cartState.verificationPollInterval) {
    console.log('[Cart] Starting email verification status polling...');
    cartState.verificationPollInterval = setInterval(async () => {
      try {
        if (!cartState.currentUser || cartState.currentUser.emailVerified) {
          clearInterval(cartState.verificationPollInterval);
          cartState.verificationPollInterval = null;
          return;
        }
        const result = await APIClient.getUserProfile(cartState.currentUser.userId);
        if (result.success && result.data && result.data.emailVerified) {
          console.log('[Cart] User verified email (detected via polling)!');
          clearInterval(cartState.verificationPollInterval);
          cartState.verificationPollInterval = null;
          // Save updated session
          const updatedUser = {
            ...cartState.currentUser,
            emailVerified: true
          };
          AuthManager.saveSession(updatedUser);
          // Update state and show success message
          cartState.currentUser = updatedUser;
          cartState.emailVerified = true;
          showSuccess('✓ Email Terverifikasi', 'Halaman diperbarui, mengarahkan ke keranjang...');
          // Re-render full cart
          setTimeout(() => {
            render(updatedUser);
          }, 1500);
        }
      } catch (error) {
        console.log('[Cart] Error polling verification status:', error);
      }
    }, 3000);
  }
}
// ============================================================================
// EMPTY CART
// ============================================================================
function renderEmptyCart() {
  cartState.container.innerHTML = `
    <div class="page-container">
      <div class="cart-empty">
        <div class="empty-icon">
          <i class="ph-fill ph-shopping-cart"></i>
        </div>
        <h2 class="empty-title">Keranjang Kosong</h2>
        <p class="empty-text">
          Belum ada domain di keranjang Anda. Mulai cari domain impian Anda!
        </p>
        <a href="/#cek-domain" class="btn btn-primary">
          <i class="ph-fill ph-magnifying-glass"></i> Cari Domain
        </a>
      </div>
    </div>
  `;
}
// ============================================================================
// AUTHENTICATED & VERIFIED CART
// ============================================================================
function renderAuthenticatedCart() {
  const {
    items,
    selectedItem,
    addons,
    domainSubtotal,
    addonsTotal,
    subtotal,
    discount,
    ppn,
    finalTotal
  } = getSelectedCartSummary();
  const promoTotal = discount;
  let itemsHTML = items.map(item => renderCartItem(item)).join('');
  // Flatten HTML generation to avoid IDE syntax highlighter bugs with nested templates
  let selectedItemHTML = '';
  if (selectedItem) {
    let packageInfoHTML = '';
    if (selectedItem.package && selectedItem.package !== 'none') {
      packageInfoHTML = `
                <div class="price-row" style="margin-bottom: 4px; padding-left: 10px; font-size: 13px;">
                  <span class="price-row-label">+ ${cartState.pricing.packages[selectedItem.package]?.name || selectedItem.package}</span>
                  <span class="price-value">${formatPrice(selectedItem.packagePrice || 0)}</span>
                </div>
                <div class="price-row" style="margin-bottom: 8px; padding-left: 10px; font-size: 13px; color: #10b981;">
                  <span class="price-row-label"><i class="ph-fill ph-gift"></i> Diskon Bundle Domain</span>
                  <span class="price-value">-${formatPrice(selectedItem.domainPrice || 0)}</span>
                </div>
      `;
    }
    selectedItemHTML = `
                <div class="price-row" style="margin-bottom: 4px;">
                  <span class="price-row-label">Domain (${selectedItem.domain}):</span>
                  <span class="price-value">${formatPrice(selectedItem.domainPrice || 0)}</span>
                </div>
                ${packageInfoHTML}
    `;
  }
  let addonsHTML = '';
  if (addons.length > 0) {
    const addonsList = addons.map(addon => `
                  <div class="price-row" style="padding-left: 10px; font-size: 13px;">
                    <span class="price-row-label">- ${addon.name}</span>
                    <span class="price-value">${formatPrice(addon.price)}</span>
                  </div>
    `).join('');
    addonsHTML = `
                <div class="summary-divider" style="margin: 8px 0; border-top: 1px dashed var(--border-color);"></div>
                <div class="price-row" style="margin-bottom: 4px;">
                  <span class="price-row-label" style="font-weight: 700; color: var(--text-primary);">Layanan Tambahan (Addon):</span>
                </div>
                ${addonsList}
                <div class="summary-divider" style="margin: 8px 0; border-top: 1px dashed var(--border-color);"></div>
    `;
  }
  let promoHTML = '';
  if (promoTotal > 0) {
    const promoDescHTML = cartState.promoDescription ? `<span class="promo-desc-detail" style="font-size: 11px; color: var(--text-secondary); font-style: italic; margin-top: 2px; padding-left: 18px;">(${cartState.promoDescription})</span>` : '';
    promoHTML = `
                <div class="price-row discount" style="align-items: flex-start; height: auto; padding: 8px 0;">
                  <div style="display: flex; flex-direction: column; text-align: left;">
                    <span class="price-row-label"><i class="ph-fill ph-tag"></i> Diskon Promo:</span>
                    ${promoDescHTML}
                  </div>
                  <span class="price-value">-${formatPrice(promoTotal)}</span>
                </div>
    `;
  }
  cartState.container.innerHTML = `
    <div class="page-container">
      <div class="cart-page">
        <!-- Removed redundant Keranjang Saya title -->

        <div class="cart-grid">

          <!-- Cart Items -->
          <div>
            <div class="cart-items-section">
              <h3 class="cart-items-title">Domain yang Dipesan</h3>
              <div class="cart-items-list">
                ${itemsHTML}
              </div>
            </div>

          </div>

          <!-- Cart Summary & Checkout -->
          <div>
            <div class="cart-summary">
              <h3 class="summary-title">Ringkasan Pesanan</h3>

              ${selectedItemHTML}

              ${addonsHTML}

              <div class="price-row subtotal">
                <span class="price-row-label">Subtotal:</span>
                <span class="price-value">${formatPrice(subtotal)}</span>
              </div>

              <div class="price-row ppn">
                <span class="price-row-label">PPN (11%):</span>
                <span class="price-value">${formatPrice(ppn)}</span>
              </div>

              ${promoHTML}

              <div class="price-row total">
                <span>Total:</span>
                <span class="price-value">${formatPrice(finalTotal)}</span>
              </div>

              <!-- Promo Code Section -->
              <div class="promo-section">
                <label class="promo-label">
                  <i class="ph-fill ph-tag"></i> ${cartState.promoValidated ? 'Kode Promo Aktif' : 'Punya Kode Promo?'}
                </label>
                
                ${cartState.promoValidated ? `
                  <div class="promo-applied-box" style="display:flex; justify-content:space-between; align-items:center; background:#f0fdf4; border:1px solid #bbf7d0; padding:10px 14px; border-radius:8px; margin-bottom:12px;">
                    <div>
                      <span style="font-weight:700; color:#166534;">${cartState.promoCode}</span>
                      <div style="font-size:12px; color:#15803d; margin-top:2px;">Berhasil diterapkan</div>
                    </div>
                    <button onclick="window.cancelPromoCode()" class="btn-cancel-promo" style="background:none; border:none; color:#dc2626; cursor:pointer; font-size:12px; font-weight:600; display:flex; align-items:center; gap:4px; padding:6px 8px; border-radius:4px; transition:all 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'">
                      <i class="ph-fill ph-x-circle"></i> Batalkan
                    </button>
                  </div>
                ` : `
                  <div class="promo-input-group">
                    <input type="text" id="promo-code-input" placeholder="Masukkan kode promo" class="promo-input">
                    <button id="btn-apply-promo" onclick="window.applyPromoCode()" class="btn-apply-promo">
                      Gunakan
                    </button>
                  </div>
                  <div id="promo-message" class="promo-message"></div>
                `}
              </div>

              <!-- Action Buttons -->
              <div class="action-section">
                <button id="btn-proceed-checkout" onclick="window.proceedToCheckout()" class="btn btn-primary" ${!selectedItem ? 'disabled="disabled"' : ''}>
                  <i class="ph-fill ph-lock-key"></i> Lanjut ke Pembayaran
                </button>

                <a href="/#cek-domain" class="btn btn-secondary">
                  <i class="ph-fill ph-magnifying-glass"></i> Cari Domain Lain
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
  // Expose functions to window
  window.applyPromoCode = applyPromoCode;
  window.proceedToCheckout = proceedToCheckout;
  window.removeCartItem = removeCartItem;
}

function renderCartItemSelectors(item) {
  const currentPackage = item.package || 'starter';
  const selectedAddonIds = (item.addons || []).map(a => a.id.toLowerCase());
  // Generate Packages Selection HTML
  const packagesHTML = Object.values(cartState.pricing.packages).filter(pkg => pkg.active !== false).sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : 999;
    const orderB = typeof b.order === 'number' ? b.order : 999;
    return orderA - orderB;
  }).map(pkg => {
    const isSelected = currentPackage === pkg.id;
    const priceDisplay = formatPrice(pkg.price);
    return `
      <div class="cart-item-package-card ${isSelected ? 'selected' : ''}"
           onclick="window.changeItemPackage('${item.domain}', '${pkg.id}')">
        <div>
          <div class="cart-item-package-name">
            ${isSelected ? '✓ ' : ''}${pkg.name}
          </div>
          <div class="cart-item-package-price">
            ${priceDisplay}
          </div>
        </div>
        <div class="cart-item-package-desc">${pkg.description}</div>
      </div>
    `;
  }).join('');
  // Generate Addons Checklist HTML
  const addonsHTML = Object.values(cartState.pricing.addons).sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : 999;
    const orderB = typeof b.order === 'number' ? b.order : 999;
    return orderA - orderB;
  }).map(addon => {
    const isSelected = selectedAddonIds.includes(addon.id.toLowerCase());
    let featuresList = '';
    if (addon.features && addon.features.length > 0) {
      const itemsHtml = addon.features.map(f => `<li><i class="ph-fill ph-check" style="color: var(--primary-blue); font-size: 10px; margin-right: 4px;"></i> ${f}</li>`).join('');
      featuresList = `<ul class="cart-item-addon-features">${itemsHtml}</ul>`;
    }
    const descHtml = addon.description ? `<div class="cart-item-addon-desc">${addon.description}</div>` : '';
    const isFree = addon.price === 0;
    let claimBtnHtml = '';
    if (isFree) {
      claimBtnHtml = `
            <div class="cart-item-addon-claim-btn ${isSelected ? 'claimed' : ''}">
              ${isSelected ? '<i class="ph-fill ph-check"></i> Diklaim' : 'Klaim'}
            </div>
      `;
    }
    let detailsHtml = '';
    if (descHtml || featuresList) {
      detailsHtml = `
        <div class="cart-item-addon-details" style="${isFree ? 'margin-left: 0;' : ''}">
          ${descHtml}
          ${featuresList}
        </div>
      `;
    }
    return `
      <label class="cart-item-addon-option ${isSelected ? 'selected' : ''} ${isFree ? 'is-free' : ''}">
        <div class="cart-item-addon-header" style="justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
            <input type="checkbox"
                   class="cart-item-addon-checkbox"
                   ${isFree ? 'style="display:none;"' : ''}
                   ${isSelected ? 'checked="checked"' : ''}
                   onchange="window.toggleCartAddon('${item.domain}', '${addon.id}', this.checked)">
            <div class="cart-item-addon-info">
              <span class="cart-item-addon-name">${addon.name}</span>
              <span class="cart-item-addon-price ${isFree ? 'free-badge' : ''}">${isFree ? 'GRATIS' : '+' + formatPrice(addon.price)}</span>
            </div>
          </div>

          ${claimBtnHtml}
        </div>
        ${detailsHtml}
      </label>
    `;
  }).join('');
  return `
    <div class="cart-item-packages">
      <div class="cart-item-packages-title">
        <i class="ph-fill ph-codesandbox-logo"></i> Pilih Paket Pembuatan Website
      </div>
      <div class="cart-item-packages-grid">
        ${packagesHTML}
      </div>
    </div>

    <div class="cart-item-addons">
      <div class="cart-item-addons-title">
        <i class="ph-fill ph-puzzle-piece"></i> Layanan Tambahan (Add-ons)
      </div>
      <div class="cart-item-addons-grid">
        ${addonsHTML}
      </div>
    </div>
  `;
}
// ============================================================================
// CART ITEM RENDERING
// ============================================================================
function renderCartItem(item) {
  const renewalInfo = item.renewalPrice && item.renewalPrice !== item.price ? `<div class="cart-item-renewal" style="margin-top: 4px;"><i class="ph-fill ph-arrows-clockwise"></i> Pembaruan: ${formatPrice(item.renewalPrice)}/tahun</div>` : '';
  let configSection = '';
  if (!item.isRenewal) {
    configSection = `
      <!-- Config Section (Packages & Addons) -->
      <div class="cart-item-config">
        ${renderCartItemSelectors(item)}
      </div>
    `;
  }
  return `
    <div class="cart-item ${item.domain === cartState.selectedDomain ? 'selected-domain-card' : ''}" style="display: block; margin-bottom: 1.5rem; ${item.domain === cartState.selectedDomain ? 'border: 2px solid var(--primary-blue); background: #f0f7ff; border-radius: 8px;' : ''}">
      <div class="cart-item-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: clamp(1rem, 2vw, 1.5rem); padding-bottom: 0.75rem;">
        <div style="padding-right: 12px; padding-top: 4px;">
          <input type="radio" name="selected_domain" ${item.domain === cartState.selectedDomain ? 'checked="checked"' : ''} onchange="window.selectCartDomain('${item.domain}')" style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--primary-blue);">
        </div>
        <div style="flex: 1; min-width: 0; user-select: none;">
          <h4 class="cart-item-domain" style="font-family: 'Courier New', monospace; font-weight: 700; color: var(--text-primary); margin: 0; font-size: 16px; word-break: break-word;">
            ${item.domain}
          </h4>
          <div class="cart-item-details" style="display: flex; gap: 8px; align-items: center; margin-top: 6px; border: none; padding: 0; flex-wrap: wrap;">
            <span class="cart-item-badge" style="background: ${item.isRenewal ? '#fef3c7' : '#e3f2fd'}; color: ${item.isRenewal ? '#d97706' : 'var(--primary-blue)'}; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; text-transform: uppercase;">${item.isRenewal ? 'PERPANJANGAN' : (!item.package || item.package === 'none' ? 'HANYA DOMAIN' : item.package.toUpperCase())}</span>
            <span class="cart-item-duration" style="color: var(--text-light); font-size: 11px;"><i class="ph-fill ph-calendar"></i> ${item.duration || 1} tahun</span>
          </div>
          ${renewalInfo}
        </div>
        <div class="cart-item-actions" style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; padding: 0; border: none;">
          <div class="cart-item-price" style="font-weight: 800; color: var(--primary-blue); font-family: 'Courier New', monospace; font-size: 16px;">${formatPrice(item.price * (item.duration || 1))}</div>
          <button onclick="window.removeCartItem('${item.domain}')" class="btn-remove" style="display: flex; align-items: center; gap: 4px; background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; padding: 4px 0;">
            <i class="ph-fill ph-trash"></i> Hapus
          </button>
        </div>
      </div>
      ${configSection}
    </div>
  `;
}
// ============================================================================
// PROMO CODE FUNCTIONS
// ============================================================================
function loadSavedPromo() {
  try {
    const cartData = CartManager.getCart();
    if (cartData && cartData.coupon && cartData.coupon.code) {
      cartState.promoCode = cartData.coupon.code;
      cartState.promoDescription = 'Kupon Diterapkan';
      cartState.promoValidated = true;
      cartState.promoDiscount = cartData.discount || 0;
    }
  } catch (e) {
    console.log('[Cart] Could not load saved promo:', e);
  }
}
async function applyPromoCode() {
  const input = document.getElementById('promo-code-input');
  if (!input) return;
  const promoBtn = document.getElementById('btn-apply-promo');
  const code = input.value.trim().toUpperCase();
  if (!code) {
    showError('Kode Kosong', 'Masukkan kode promo terlebih dahulu');
    return;
  }
  if (cartState.isValidatingPromo) {
    return; // Already validating
  }
  cartState.isValidatingPromo = true;
  setButtonLoading(promoBtn, true, 'Memvalidasi...');
  const promoMsg = document.getElementById('promo-message');
  if (promoMsg) {
    promoMsg.textContent = 'Memvalidasi...';
    promoMsg.style.display = 'block';
  }
  try {
    const result = await APIClient.validatePromoCode(code);
    if (result.success && result.data) {
      // Valid promo - calculate discount
      const summary = CartManager.getSummary();
      const subtotal = summary.subtotal || 0;
      let discount = 0;
      const pType = (result.data.type || '').toLowerCase();
      const pValue = parseFloat(result.data.value) || 0;
      if (pType === 'percentage' || pType === 'percent') {
        discount = Math.round(subtotal * (pValue / 100));
      } else {
        discount = pValue;
      }
      cartState.promoCode = code;
      cartState.promoDiscount = discount;
      cartState.promoDescription = result.data.description;
      cartState.promoValidated = true;
      // Save to CartManager
      const cartData = CartManager.getCart();
      cartData.coupon = {
        code: code,
        discountType: pType,
        discountValue: pValue,
        description: result.data.description
      };
      CartManager.saveCart(cartData);
      if (promoMsg) {
        promoMsg.textContent = `✓ ${result.message || 'Kode promo berhasil diterapkan'}`;
        promoMsg.style.color = '#27ae60';
      }
      showSuccess('✓ Berhasil', 'Kode promo diterapkan');
      render(cartState.currentUser);
    } else {
      cartState.promoCode = null;
      cartState.promoDiscount = 0;
      cartState.promoDescription = null;
      cartState.promoValidated = false;
      // Remove from CartManager
      const cartData = CartManager.getCart();
      cartData.coupon = null;
      CartManager.saveCart(cartData);
      if (promoMsg) {
        promoMsg.textContent = result.message || 'Kode promo tidak valid';
        promoMsg.style.color = '#dc2626';
      }
    }
  } catch (error) {
    console.log('[Cart] Promo validation error:', error);
    if (promoMsg) {
      promoMsg.textContent = 'Gagal memvalidasi kode promo';
      promoMsg.style.color = '#dc2626';
    }
    cartState.promoCode = null;
    cartState.promoDiscount = 0;
  } finally {
    cartState.isValidatingPromo = false;
    setButtonLoading(promoBtn, false, 'Gunakan');
  }
}
window.cancelPromoCode = () => {
  cartState.promoCode = null;
  cartState.promoDiscount = 0;
  cartState.promoDescription = null;
  cartState.promoValidated = false;
  localStorage.removeItem('saved_promo_code');
  localStorage.removeItem('saved_promo_description');
  localStorage.removeItem('saved_promo_discount_value');
  localStorage.removeItem('saved_promo_discount_type');
  CartManager.removeCoupon();
  showInfo('Promo Dibatalkan', 'Kode promo telah dilepas dari keranjang.');
  if (cartState.currentUser) {
    render(cartState.currentUser);
  }
};
// ============================================================================
// CHECKOUT FUNCTIONS
// ============================================================================
async function proceedToCheckout() {
  try {
    if (cartState.isProcessingCheckout) {
      return;
    }
    const checkoutBtn = document.getElementById('btn-proceed-checkout');
    setButtonLoading(checkoutBtn, true, 'Membuat Order...');
    const summary = CartManager.getSummary();
    if (summary.itemCount === 0) {
      showError('⚠️ Keranjang Kosong', 'Tambahkan domain ke keranjang terlebih dahulu');
      return;
    }
    // Check email verification - Bypassed to allow checkout
    // if (!cartState.currentUser?.emailVerified) {
    //   showError('⚠️ Email Tidak Terverifikasi', 'Silakan verifikasi email Anda terlebih dahulu');
    //   return;
    // }
    cartState.isProcessingCheckout = true;
    // Get first domain for order
    const {
      selectedItem
    } = getSelectedCartSummary();
    const firstDomain = selectedItem?.domain || '';
    if (!firstDomain) {
      throw new Error('Domain tidak ditemukan');
    }
    // Parse domain
    const parts = firstDomain.split('.');
    const tld = parts[parts.length - 1];
    // VALIDASI: Re-check domain availability via DNS (Siapa Cepat Dia Dapat)
    console.log('[Cart] Checking global DNS availability for:', firstDomain);
    try {
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(firstDomain)}&type=A`, {
        headers: {
          'accept': 'application/dns-json'
        },
        timeout: 8000
      });
      if (response.ok) {
        const data = await response.json();
        const isDnsAvailable = !data.Answer || data.Answer.length === 0;
        if (!isDnsAvailable) {
          throw new Error(`Domain ${firstDomain} sudah didaftarkan secara global. Silakan pilih domain lain.`);
        }
      } else {
        // Fallback to backend check if DNS check fails
        const availabilityCheck = await APIClient.checkDomain(firstDomain);
        if (!availabilityCheck.success || !availabilityCheck.data?.available) {
          throw new Error(`Domain ${firstDomain} tidak tersedia di sistem.`);
        }
      }
    } catch (e) {
      if (e.message.includes('didaftarkan secara global') || e.message.includes('tidak tersedia')) {
        throw e;
      }
      console.log("[Cart] DNS check error, proceeding anyway:", e);
    }
    // Calculate final total with promo + ppn
    const subtotal = summary.subtotal;
    const ppn = Math.round(subtotal * 0.11);
    const finalTotal = subtotal + ppn - (cartState.promoDiscount || 0);
    // Generate unique orderId on frontend so GAS can use it for Midtrans
    const timestamp = Date.now();
    const random6 = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderId = `INV-${timestamp}-${random6}`;
    let idToken = '';
    try {
      // Get auth instance properly instead of relying on window.firebaseAuth
      const {
        getFirebase
      } = await import('/assets/js/modules/firebase-core.js');
      const {
        auth
      } = await getFirebase();
      if (auth) {
        const fbUser = await new Promise(resolve => {
          const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
          });
        });
        if (!fbUser) {
          console.log('[Cart] fbUser is null. Firebase Auth state is lost.');
          window.location.href = '/auth/';
          return;
        }
        idToken = await fbUser.getIdToken(true);
      }
    } catch (e) {
      console.log('[Cart] Failed to get fresh ID token:', e);
    }
    // Prepare order data
    const orderData = {
      orderId: orderId,
      idToken: idToken,
      userId: cartState.userId || cartState.currentUser?.userId,
      email: cartState.userEmail || cartState.currentUser?.email,
      name: cartState.currentUser?.displayName || cartState.currentUser?.name || cartState.currentUser?.email?.split('@')[0] || 'Customer',
      phone: cartState.currentUser?.whatsapp || cartState.currentUser?.phone || '',
      domain: firstDomain,
      domainDuration: selectedItem?.duration || 1,
      isRenewal: selectedItem?.isRenewal || false,
      packageId: selectedItem?.package || 'none',
      addons: selectedItem?.addons || [],
      promoCode: cartState.promoCode || null,
      subtotal: subtotal,
      ppn: ppn,
      discount: cartState.promoDiscount || 0,
      total: finalTotal
    };
    console.log('[Cart] Creating order:', orderData);
    // CREATE ORDER DI DATABASE
    const createOrderResult = await APIClient.createOrder(orderData);
    if (!createOrderResult.success) {
      throw new Error(createOrderResult.message || 'Gagal membuat order');
    }
    // orderId already declared above, verify GAS returned same/valid id
    const confirmedOrderId = createOrderResult.data?.orderId || orderId;
    console.log('[Cart] Order created:', confirmedOrderId);
    // Hanya hapus domain yang di-checkout dari cart
    CartManager.remove(firstDomain);
    // ALWAYS CLEAR PROMOS AFTER SUCCESSFUL CHECKOUT (Since promo is consumed for this order)
    cartState.promoCode = null;
    cartState.promoDiscount = 0;
    cartState.promoDescription = null;
    cartState.promoValidated = false;
    localStorage.removeItem('saved_promo_code');
    localStorage.removeItem('saved_promo_description');
    localStorage.removeItem('saved_promo_discount_value');
    localStorage.removeItem('saved_promo_discount_type');
    CartManager.removeCoupon();
    // ALWAYS CLEAR ADDONS AFTER SUCCESSFUL CHECKOUT (So they don't stick to the next checkout)
    CartManager.clearAddons();
    showSuccess('✓ Order Dibuat', 'Mengarahkan ke pembayaran...');
    // Redirect to payment page (use hash route for SPA)
    setTimeout(() => {
      window.location.hash = `#!/dashboard/payment?orderId=${encodeURIComponent(confirmedOrderId)}`;
    }, 1500);
  } catch (error) {
    console.log('[Cart] Checkout error:', error);
    showError('❌ Error Checkout', error.message);
  } finally {
    cartState.isProcessingCheckout = false;
    const checkoutBtn = document.getElementById('btn-proceed-checkout');
    setButtonLoading(checkoutBtn, false, 'Lanjut ke Pembayaran');
  }
}

function removeCartItem(domain) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Hapus Domain?',
      text: 'Apakah Anda yakin ingin menghapus ' + domain + ' dari keranjang?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        CartManager.remove(domain);
        render(cartState.currentUser);
        Swal.fire({
          title: 'Dihapus!',
          text: domain + ' telah dihapus dari keranjang.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  } else if (confirm('Hapus ' + domain + ' dari keranjang?')) {
    CartManager.remove(domain);
    render(cartState.currentUser);
  }
}
// Auto-refresh UI when cart data syncs from backend (e.g., after login)
window.addEventListener('cart:updated', () => {
  const container = document.getElementById('cart-container');
  // Hanya render ulang jika user sedang berada di halaman cart dan tidak sedang memproses
  if (container && cartState.currentUser && !cartState.isProcessingCheckout) {
    render(cartState.currentUser);
  }
});
export default render;