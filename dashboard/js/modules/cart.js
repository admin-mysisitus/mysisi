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

import { CartManager, WishlistManager } from '/assets/js/modules/unified-cart.js';
import { showSuccess, showError, showInfo, formatCurrency, isValidEmail } from '/assets/js/modules/unified-utils.js';
import APIClient from '/assets/js/modules/unified-api.js';
import { AuthManager } from '/assets/js/modules/unified-auth.js';
import SharedAuthForm from '/assets/js/modules/shared-auth-form.js';
import { ADDON_PACKAGES } from '/assets/js/config/api.config.js';

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
  promoValidated: false,
  isValidatingPromo: false,
  
  // UI state
  isProcessingCheckout: false
};

/**
 * MAIN RENDER FUNCTION
 * Entry point for cart page rendering
 */
export async function render(currentUser) {
  try {
    cartState.container = document.getElementById('cart-container');
    if (!cartState.container) {
      console.error('[Cart] #cart-container not found');
      return;
    }

    cartState.currentUser = currentUser || AuthManager.getCurrentUser();
    
    // Initialize auth if not already done
    if (!AuthManager.isLoggedIn && !cartState.currentUser) {
      AuthManager.init();
    }

    // Load saved promo if exists
    loadSavedPromo();

    // Route based on auth state
    if (!cartState.currentUser) {
      // Guest: show inline auth + cart preview
      renderGuestCheckout();
    } else if (!cartState.currentUser.emailVerified) {
      // Logged in but not verified: show verification message
      renderEmailVerificationPrompt();
    } else if (CartManager.isEmpty()) {
      // Empty cart
      renderEmptyCart();
    } else {
      // Authenticated + verified: show full cart
      renderAuthenticatedCart();
    }

  } catch (error) {
    console.error('[Cart] Error rendering:', error);
    showError('Error', error.message);
    cartState.container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h2>❌ Error</h2>
        <p>${error.message}</p>
        <a href="/" class="btn" style="display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Kembali ke Beranda
        </a>
      </div>
    `;
  }
}

// ============================================================================
// GUEST CHECKOUT - INLINE AUTH + CART PREVIEW
// ============================================================================

function renderGuestCheckout() {
  const cartData = CartManager.getCart();
  const items = (cartData && cartData.domains) || [];
  const summary = CartManager.getSummary();

  cartState.container.innerHTML = `
    <div style="max-width: 1000px; margin: 0 auto; padding: 20px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
        
        <!-- Cart Preview -->
        <div>
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
            <i class="fas fa-shopping-cart"></i> Preview Keranjang
          </h3>
          <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            ${items.length > 0 ? `
              <div style="max-height: 300px; overflow-y: auto;">
                ${items.map(item => `
                  <div style="padding: 12px 0; border-bottom: 1px solid #ddd;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <strong>${item.domain}</strong>
                      <strong style="color: #2563EB;">Rp ${formatCurrency(item.price * (item.duration || 1))}</strong>
                    </div>
                    <small style="color: #999;">${item.duration || 1} tahun</small>
                  </div>
                `).join('')}
              </div>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd; display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #2563EB;">
                <span>Total:</span>
                <span>Rp ${formatCurrency(summary.total)}</span>
              </div>
            ` : '<div style="padding: 40px; text-align: center; color: #999;">Keranjang kosong</div>'}
          </div>
        </div>

        <!-- Auth Form Container -->
        <div>
          <div id="shared-auth-form-container"></div>
        </div>

      </div>
    </div>
  `;

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

  // Add GiveNamespace handlers
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

    showSuccess('✓ Login Berhasil!', 'Halaman sedang diperbarui...');

    // Re-render based on verification status
    setTimeout(() => {
      render(userData);
    }, 1500);

  } catch (error) {
    console.error('[Cart] Auth success error:', error);
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
    console.error('[Cart] Google auth error:', error);
    showError('Error', error.message);
  }
}

// ============================================================================
// EMAIL VERIFICATION PROMPT
// ============================================================================

function renderEmailVerificationPrompt() {
  cartState.container.innerHTML = `
    <div style="max-width: 600px; margin: 60px auto; padding: 20px; text-align: center;">
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #92400e;">
          <i class="fas fa-envelope-open-text"></i> Verifikasi Email Diperlukan
        </h2>
        <p style="margin: 0 0 10px 0; color: #78350f;">
          Email Anda belum terverifikasi. Silakan cek email untuk link verifikasi.
        </p>
        <p style="margin: 0; color: #99410e; font-size: 14px;">
          Email dikirim ke: <strong>${cartState.currentUser?.email}</strong>
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="color: #666;">Setelah memverifikasi email, refresh halaman ini atau klik tombol di bawah.</p>
        <button onclick="location.reload()" class="btn" style="padding: 12px 24px; background: #2563EB; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
          <i class="fas fa-redo"></i> Refresh Halaman
        </button>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">

      <div style="color: #999; font-size: 14px;">
        <p>Link verifikasi tidak muncul?</p>
        <a href="/auth/verify-email.html" style="color: #2563EB; text-decoration: none; font-weight: bold;">
          Buka halaman verifikasi email
        </a>
      </div>
    </div>
  `;
}

// ============================================================================
// EMPTY CART
// ============================================================================

function renderEmptyCart() {
  cartState.container.innerHTML = `
    <div style="text-align: center; padding: 60px 20px;">
      <div style="font-size: 80px; margin-bottom: 20px; opacity: 0.5;">
        <i class="fas fa-shopping-cart"></i>
      </div>
      <h2 style="color: #333; margin-bottom: 10px;">Keranjang Kosong</h2>
      <p style="color: #666; margin-bottom: 30px; font-size: 16px;">
        Belum ada domain di keranjang Anda. Mulai cari domain impian Anda!
      </p>
      <a href="/?section=cek-domain" class="btn" style="display: inline-block; padding: 12px 30px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
        <i class="fas fa-search"></i> Cari Domain
      </a>
    </div>
  `;
}

// ============================================================================
// AUTHENTICATED & VERIFIED CART
// ============================================================================

function renderAuthenticatedCart() {
  const { items, subtotal, discount, total } = CartManager.getSummary();
  const cartData = CartManager.getCart();
  const addons = (cartData && cartData.addons) || [];
  const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
  const promoTotal = cartState.promoDiscount || 0;

  let itemsHTML = items.map(item => renderCartItem(item)).join('');

  cartState.container.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
      <h2 style="margin: 0 0 30px 0; font-size: 28px; font-weight: bold;">
        <i class="fas fa-shopping-cart"></i> Keranjang Saya
      </h2>

      <div style="display: grid; grid-template-columns: 1fr 380px; gap: 30px;">
        
        <!-- Cart Items -->
        <div>
          <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 20px 0; font-weight: bold;">Domain yang Dipesan</h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
              ${itemsHTML}
            </div>
          </div>

          ${addons.length > 0 ? `
            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
              <h3 style="margin: 0 0 15px 0; font-weight: bold;">📦 Layanan Tambahan</h3>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${addons.map(addon => `
                  <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <div>
                      <strong>${addon.name}</strong><br>
                      <small style="color: #999;">${addon.duration} tahun</small>
                    </div>
                    <strong style="color: #2563EB;">Rp ${formatCurrency(addon.price)}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Cart Summary & Checkout -->
        <div>
          <div style="background: #f8f9fa; border-radius: 10px; padding: 25px; border: 1px solid #e0e0e0; position: sticky; top: 20px;">
            <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">Ringkasan Pesanan</h3>
            
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; font-size: 14px;">
              <span>Domain (${items.length}):</span>
              <strong>Rp ${formatCurrency(subtotal)}</strong>
            </div>

            ${addonsTotal > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; font-size: 14px;">
                <span>Addon (${addons.length}):</span>
                <strong>Rp ${formatCurrency(addonsTotal)}</strong>
              </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; font-size: 14px;">
              <span>Subtotal:</span>
              <strong>Rp ${formatCurrency(subtotal + addonsTotal)}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; font-size: 14px;">
              <span>PPN (11%):</span>
              <strong>Rp ${formatCurrency(Math.round((subtotal + addonsTotal) * 0.11))}</strong>
            </div>

            ${promoTotal > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; font-size: 14px; color: #27ae60;">
                <span><i class="fas fa-tag"></i> Diskon Promo:</span>
                <strong>-Rp ${formatCurrency(promoTotal)}</strong>
              </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 18px; font-weight: bold; color: #2563EB;">
              <span>Total:</span>
              <strong>Rp ${formatCurrency(total - promoTotal + Math.round((subtotal + addonsTotal) * 0.11))}</strong>
            </div>

            <!-- Promo Code Section -->
            <div style="margin: 20px 0; border-top: 1px solid #ddd; padding-top: 20px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px;">
                🎉 Punya Kode Promo?
              </label>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="promo-code-input" placeholder="Masukkan kode promo" 
                  style="flex: 1; padding: 10px 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;">
                <button onclick="window.applyPromoCode()" class="btn" 
                  style="padding: 10px 16px; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; font-weight: bold; white-space: nowrap;">
                  Gunakan
                </button>
              </div>
              <div id="promo-message" style="display: none; margin-top: 8px; font-size: 13px;"></div>
            </div>

            <!-- Checkout Button -->
            <button onclick="window.proceedToCheckout()" class="btn" 
              style="width: 100%; padding: 15px 20px; background-color: #2563EB; color: white; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 20px;">
              <i class="fas fa-lock"></i> Lanjut ke Pembayaran
            </button>

            <a href="/?section=cek-domain" style="display: block; text-align: center; padding: 12px 20px; background-color: #f0f0f0; color: #333; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
              <i class="fas fa-search"></i> Cari Domain Lain
            </a>
          </div>
        </div>

      </div>
    </div>
  `;

  // Expose functions to window
  window.applyPromoCode = applyPromoCode;
  window.proceedToCheckout = proceedToCheckout;
  window.removeCartItem = removeCartItem;
  window.removeAddon = removeAddon;
}

// ============================================================================
// CART ITEM RENDERING
// ============================================================================

function renderCartItem(item) {
  const renewalInfo = item.renewalPrice && item.renewalPrice !== item.price
    ? `<small style="color: #999;">Pembaruan: Rp ${formatCurrency(item.renewalPrice)}/tahun</small>`
    : '';

  return `
    <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div style="flex: 1;">
        <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
          ${item.domain}
        </h4>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
          <span style="display: inline-block; background: #e3f2fd; color: #2563EB; padding: 4px 8px; border-radius: 3px; font-size: 12px; margin-right: 10px;">
            ${item.package ? item.package.toUpperCase() : 'STARTER'}
          </span>
          <span style="color: #999;">${item.duration || 1} tahun</span>
        </p>
        ${renewalInfo}
      </div>
      <div style="text-align: right; margin-left: 20px; white-space: nowrap;">
        <div style="font-size: 18px; font-weight: bold; color: #2563EB; margin-bottom: 8px;">
          Rp ${formatCurrency(item.price * (item.duration || 1))}
        </div>
        <button onclick="window.removeCartItem('${item.domain}')" 
          style="background: #fee; color: #e74c3c; border: 1px solid #fcc; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">
          <i class="fas fa-trash"></i> Hapus
        </button>
      </div>
    </div>
  `;
}

// ============================================================================
// PROMO CODE FUNCTIONS
// ============================================================================

function loadSavedPromo() {
  try {
    const saved = localStorage.getItem('saved_promo_code');
    if (saved) {
      cartState.promoCode = saved;
    }
  } catch (e) {
    console.warn('[Cart] Could not load saved promo:', e);
  }
}

function saveSavedPromo() {
  try {
    if (cartState.promoCode) {
      localStorage.setItem('saved_promo_code', cartState.promoCode);
    } else {
      localStorage.removeItem('saved_promo_code');
    }
  } catch (e) {
    console.warn('[Cart] Could not save promo:', e);
  }
}

async function applyPromoCode() {
  const input = document.getElementById('promo-code-input');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    showError('Kode Kosong', 'Masukkan kode promo terlebih dahulu');
    return;
  }

  if (cartState.isValidatingPromo) {
    return; // Already validating
  }

  cartState.isValidatingPromo = true;
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
      if (result.data.discountType === 'percentage') {
        discount = Math.round(subtotal * (result.data.discount / 100));
      } else {
        discount = result.data.discount;
      }

      cartState.promoCode = code;
      cartState.promoDiscount = discount;
      cartState.promoValidated = true;

      if (promoMsg) {
        promoMsg.textContent = `✓ ${result.message || 'Kode promo berhasil diterapkan'}`;
        promoMsg.style.color = '#27ae60';
      }

      showSuccess('✓ Berhasil', 'Kode promo diterapkan');
      saveSavedPromo();

      // Re-render cart
      render(cartState.currentUser);
    } else {
      // Invalid promo
      cartState.promoCode = null;
      cartState.promoDiscount = 0;
      cartState.promoValidated = false;

      if (promoMsg) {
        promoMsg.textContent = result.message || 'Kode promo tidak valid';
        promoMsg.style.color = '#dc2626';
      }

      localStorage.removeItem('saved_promo_code');
    }
  } catch (error) {
    console.error('[Cart] Promo validation error:', error);
    if (promoMsg) {
      promoMsg.textContent = 'Gagal memvalidasi kode promo';
      promoMsg.style.color = '#dc2626';
    }
    cartState.promoCode = null;
    cartState.promoDiscount = 0;
  } finally {
    cartState.isValidatingPromo = false;
  }
}

// ============================================================================
// CHECKOUT FUNCTIONS
// ============================================================================

async function proceedToCheckout() {
  try {
    if (cartState.isProcessingCheckout) {
      return;
    }

    const summary = CartManager.getSummary();
    if (summary.itemCount === 0) {
      showError('⚠️ Keranjang Kosong', 'Tambahkan domain ke keranjang terlebih dahulu');
      return;
    }

    // Check email verification
    if (!cartState.currentUser?.emailVerified) {
      showError('⚠️ Email Tidak Terverifikasi', 'Silakan verifikasi email Anda terlebih dahulu');
      return;
    }

    cartState.isProcessingCheckout = true;

    // Get first domain for order
    const firstDomain = summary.items[0]?.domain || '';
    if (!firstDomain) {
      throw new Error('Domain tidak ditemukan');
    }

    // Parse domain
    const parts = firstDomain.split('.');
    const tld = parts[parts.length - 1];

    // Calculate final total with promo + ppn
    const subtotal = summary.subtotal + (CartManager.getCart().addons || []).reduce((sum, a) => sum + a.price, 0);
    const ppn = Math.round(subtotal * 0.11);
    const finalTotal = subtotal + ppn - (cartState.promoDiscount || 0);

    // Prepare order data
    const orderData = {
      userId: cartState.userId,
      email: cartState.userEmail,
      domain: firstDomain,
      tld: tld,
      packageId: 'starter',
      addons: CartManager.getCart().addons || [],
      promoCode: cartState.promoCode || null,
      total: finalTotal
    };

    console.log('[Cart] Creating order:', orderData);

    // CREATE ORDER DI DATABASE
    const createOrderResult = await APIClient.createOrder(orderData);

    if (!createOrderResult.success) {
      throw new Error(createOrderResult.message || 'Gagal membuat order');
    }

    const orderId = createOrderResult.data?.orderId;
    if (!orderId) {
      throw new Error('Order ID tidak ditemukan dalam response');
    }

    console.log('[Cart] Order created:', orderId);
    showSuccess('✓ Order Dibuat', 'Mengarahkan ke pembayaran...');

    // Redirect to payment page
    setTimeout(() => {
      window.location.href = `/dashboard/payment/?orderId=${encodeURIComponent(orderId)}`;
    }, 1500);

  } catch (error) {
    console.error('[Cart] Checkout error:', error);
    showError('❌ Error Checkout', error.message);
  } finally {
    cartState.isProcessingCheckout = false;
  }
}

function removeCartItem(domain) {
  if (confirm(`Hapus ${domain} dari keranjang?`)) {
    CartManager.remove(domain);
    render(cartState.currentUser);
  }
}

function removeAddon(addonId) {
  const cart = CartManager.getCart();
  if (cart.addons) {
    CartManager.addAddons(cart.addons.filter(a => a.id !== addonId));
    render(cartState.currentUser);
  }
}

export default render;

// Export render function for dashboard-app compatibility
export async function render(currentUser) {
  const container = document.getElementById('cart-container');
  if (!container) {
    console.error('Cart container not found');
    return;
  }

  try {
    const cart = new DashboardCart();
    cart.render(container, currentUser);
  } catch (error) {
    console.error('Error rendering cart:', error);
    container.innerHTML = `
      <div class="alert alert-error">
        <p>${error.message}</p>
        <button onclick="window.location.reload()">Coba Lagi</button>
      </div>
    `;
  }
}
