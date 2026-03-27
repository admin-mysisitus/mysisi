/**
 * DASHBOARD CART VIEW MODULE
 * ===================================
 * Professional cart management for dashboard
 * - Display cart items with prices
 * - Add/remove/modify items
 * - Inline login if not authenticated
 * - Display addons and promo
 * - Proceed to checkout
 */

import { CartManager, WishlistManager } from '/assets/js/modules/unified-cart.js';
import { showSuccess, showError, showInfo, formatCurrency } from '/assets/js/modules/unified-utils.js';
import APIClient from '/assets/js/modules/unified-api.js';
import { AuthManager } from '/assets/js/modules/unified-auth.js';
import { ADDON_PACKAGES } from '/assets/js/config/api.config.js';

class DashboardCart {
  constructor() {
    this.cart = CartManager.getCart();
    this.container = null;
    this.currentUser = null;
    this.isSubmittingLogin = false;
  }

  /**
   * Render cart view
   */
  render(containerElement, currentUser = null) {
    this.container = containerElement;
    this.currentUser = currentUser || AuthManager.getCurrentUser();

    // If not authenticated, show login form first
    if (!this.currentUser) {
      this.renderLoginPrompt();
      return;
    }

    // If cart is empty, show empty state
    if (CartManager.isEmpty()) {
      this.renderEmptyCart();
      return;
    }

    // Show full cart with items, addons, promo
    this.renderCartContent();
  }

  /**
   * Render login prompt (inline login in cart)
   */
  renderLoginPrompt() {
    const cartData = CartManager.getCart();
    const items = (cartData && cartData.domains) || [];
    const summary = CartManager.getSummary();
    
    this.container.innerHTML = `
      <div style="max-width: 600px; margin: 60px auto; padding: 20px;">
        <!-- Cart Preview (without checkout) -->
        <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">
            <i class="fas fa-shopping-cart"></i> Preview Keranjang
          </h3>
          <div style="max-height: 200px; overflow-y: auto;">
            ${items.length > 0 ? items.map(item => `
              <div style="padding: 10px 0; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between;">
                <span>${item.domain}</span>
                <strong>${this.formatCurrency(item.price)}</strong>
              </div>
            `).join('') : '<div style="padding: 20px; text-align: center; color: #999;">Keranjang kosong</div>'}
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd; display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #2563EB;">
            <span>Total:</span>
            <span>${this.formatCurrency(summary.total)}</span>
          </div>
        </div>

        <!-- Login Form -->
        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px;">
          <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold; text-align: center;">
            Masuk ke Akun Anda
          </h2>
          <p style="text-align: center; color: #666; margin-bottom: 25px;">
            Silakan login untuk melanjutkan checkout domain Anda
          </p>

          <form id="inline-login-form" style="display: flex; flex-direction: column; gap: 15px;">
            <!-- Email Field -->
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px;">
                Email
              </label>
              <input type="email" id="login-email" name="email" placeholder="nama@email.com" required
                style="width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;">
            </div>

            <!-- Password Field -->
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px;">
                Kata Sandi
              </label>
              <input type="password" id="login-password" name="password" placeholder="••••••••" required
                style="width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;">
            </div>

            <!-- Login Button -->
            <button type="submit" class="btn-login" 
              style="width: 100%; padding: 14px 20px; background-color: #2563EB; color: white; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer; transition: background-color 0.3s;">
              <i class="fas fa-sign-in-alt"></i> Masuk
            </button>

            <!-- Loading State -->
            <div id="login-loading" style="display: none; text-align: center; color: #2563EB; font-size: 14px;">
              <i class="fas fa-spinner fa-spin"></i> Memproses...
            </div>

            <!-- Error Message -->
            <div id="login-error" style="display: none; background: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 5px; font-size: 14px;"></div>
          </form>

          <!-- Divider -->
          <div style="margin: 20px 0; text-align: center; color: #999; font-size: 14px;">atau</div>

          <!-- Register Link -->
          <p style="text-align: center; color: #666; font-size: 14px; margin: 0;">
            Belum punya akun? 
            <a href="/auth/" style="color: #2563EB; text-decoration: none; font-weight: bold;">Daftar di sini</a>
          </p>
        </div>
      </div>

      <style>
        .btn-login:hover {
          background-color: #1d4ed8 !important;
        }

        .btn-login:disabled {
          background-color: #999 !important;
          cursor: not-allowed !important;
        }
      </style>
    `;

    // Attach event listeners
    const form = this.container.querySelector('#inline-login-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleLoginSubmit(e));
    }
  }

  /**
   * Handle inline login form submission
   */
  async handleLoginSubmit(e) {
    e.preventDefault();

    const email = this.container.querySelector('#login-email').value.trim();
    const password = this.container.querySelector('#login-password').value;
    const errorDiv = this.container.querySelector('#login-error');
    const loadingDiv = this.container.querySelector('#login-loading');
    const submitBtn = this.container.querySelector('.btn-login');

    // Validate
    if (!email || !password) {
      if (errorDiv) errorDiv.textContent = 'Email dan kata sandi tidak boleh kosong';
      if (errorDiv) errorDiv.style.display = 'block';
      return;
    }

    try {
      // Show loading state
      if (loadingDiv) loadingDiv.style.display = 'block';
      if (errorDiv) errorDiv.style.display = 'none';
      if (submitBtn) submitBtn.disabled = true;

      // Call login API
      const result = await APIClient.loginUser(email, password);

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Login gagal. Silakan cek email dan kata sandi Anda.');
      }

      // Save session
      AuthManager.saveSession(result.data);

      // Show success message
      showSuccess('✓ Login Berhasil', 'Anda sudah login. Halaman sedang diperbarui...');

      // Reload cart with user data
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      if (errorDiv) {
        errorDiv.textContent = error.message || 'Terjadi kesalahan saat login';
        errorDiv.style.display = 'block';
      }
    } finally {
      if (loadingDiv) loadingDiv.style.display = 'none';
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  /**
   * Render empty cart UI
   */
  renderEmptyCart() {
    this.container.innerHTML = `
      <div class="cart-empty" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 80px; margin-bottom: 20px; opacity: 0.5;">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h2 style="color: #333; margin-bottom: 10px;">Keranjang Kosong</h2>
        <p style="color: #666; margin-bottom: 30px; font-size: 16px;">
          Belum ada domain di keranjang Anda. <br>
          Mulai cari domain impian Anda sekarang!
        </p>
        <a href="/?section=cek-domain" class="btn btn-primary" style="display: inline-block; padding: 12px 30px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          <i class="fas fa-search"></i> Cari Domain
        </a>
      </div>
    `;
  }

  /**
   * Render cart with items
   */
  renderCartContent() {
    const { items, subtotal, discount, total } = CartManager.getSummary();
    const cartData = CartManager.getCart();
    const addons = (cartData && cartData.addons) || [];
    const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);

    let itemsHTML = items.map(item => this.renderCartItem(item)).join('');
    let addonsHTML = this.renderAddonsSection(addons);

    this.container.innerHTML = `
      <div class="cart-content">
        <!-- Cart Items List -->
        <div class="cart-items-section">
          <h2 style="margin-bottom: 20px; font-size: 24px; font-weight: bold;">
            <i class="fas fa-shopping-cart"></i> Keranjang Saya
          </h2>
          <div class="cart-items-list">
            ${itemsHTML}
          </div>

          <!-- Addons Section -->
          ${addonsHTML}
        </div>

        <!-- Cart Summary & Checkout -->
        <div class="cart-summary-section">
          <div class="cart-summary-card" style="background: #f8f9fa; border-radius: 10px; padding: 25px; border: 1px solid #e0e0e0;">
            <h3 style="margin-bottom: 20px; font-size: 18px; font-weight: bold;">Ringkasan Pesanan</h3>
            
            <div class="summary-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd;">
              <span>Domain (${items.length}):</span>
              <strong>Rp${this.formatCurrency(subtotal)}</strong>
            </div>

            ${addonsTotal > 0 ? `
              <div class="summary-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd;">
                <span>Addon (${addons.length}):</span>
                <strong>Rp${this.formatCurrency(addonsTotal)}</strong>
              </div>
            ` : ''}

            ${discount > 0 ? `
              <div class="summary-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; color: #27ae60;">
                <span><i class="fas fa-tag"></i> Diskon:</span>
                <strong>-Rp${this.formatCurrency(discount)}</strong>
              </div>
            ` : ''}

            <div class="summary-row" style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 18px; font-weight: bold; color: #2563EB;">
              <span>Total:</span>
              <strong>Rp${this.formatCurrency(total + addonsTotal)}</strong>
            </div>

            <!-- Promo Code Input -->
            <div style="margin: 20px 0; border-top: 1px solid #ddd; padding-top: 20px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px;">
                Punya Kode Promo?
              </label>
              <div style="display: flex; gap: 10px;">
                <input type="text" id="promo-code-input" placeholder="Masukkan kode promo" 
                  style="flex: 1; padding: 10px 15px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;">
                <button onclick="window.applyPromoCode && window.applyPromoCode()" class="btn" 
                  style="padding: 10px 20px; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; font-weight: bold;">
                  Gunakan
                </button>
              </div>
              <div id="promo-message" style="display: none; margin-top: 8px; font-size: 13px;"></div>
            </div>

            <!-- Action Buttons -->
            <div style="margin-top: 20px; display: grid; gap: 10px;">
              <button onclick="window.proceedToCheckout && window.proceedToCheckout()" 
                class="btn btn-primary" 
                style="width: 100%; padding: 15px 20px; background-color: #2563EB; color: white; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer;">
                <i class="fas fa-lock"></i> Lanjut ke Checkout
              </button>
              <a href="/?section=cek-domain" class="btn btn-secondary" 
                style="width: 100%; padding: 15px 20px; background-color: #f0f0f0; color: #333; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;">
                <i class="fas fa-search"></i> Lanjut Cari Domain Lain
              </a>
            </div>
          </div>

          <!-- Wishlist Sidebar -->
          ${this.renderWishlistSidebar()}
        </div>
      </div>

      <style>
        .cart-content {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 20px;
          margin-top: 20px;
        }
        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .cart-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        @media (max-width: 768px) {
          .cart-content {
            grid-template-columns: 1fr;
          }
          .cart-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      </style>
    `;

    // Expose functions to window for onclick handlers
    window.proceedToCheckout = () => this.proceedToCheckout();
    window.applyPromoCode = () => this.applyPromoCode();
    window.removeCartItem = (domain) => this.removeItem(domain);
    window.removeAddon = (addonId) => this.removeAddon(addonId);
    window.updateCartItemDuration = (domain, duration) => this.updateItemDuration(domain, duration);
  }

  /**
   * Render single cart item
   */
  renderCartItem(item) {
    const renewalPriceInfo = item.renewalPrice && item.renewalPrice !== item.price 
      ? `<small style="color: #999;">Pembaruan: Rp${this.formatCurrency(item.renewalPrice)}/tahun</small>`
      : '';

    return `
      <div class="cart-item">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
            ${item.domain}
          </h4>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
            <span class="badge" style="display: inline-block; background: #e3f2fd; color: #2563EB; padding: 4px 8px; border-radius: 3px; font-size: 12px;">
              ${item.package.toUpperCase()}
            </span>
            <span style="margin-left: 10px; color: #999;">
              ${item.duration} tahun
            </span>
          </p>
          ${renewalPriceInfo}
        </div>
        <div style="text-align: right; margin-left: 20px;">
          <div style="font-size: 18px; font-weight: bold; color: #2563EB; margin-bottom: 8px;">
            Rp${this.formatCurrency(item.price * item.duration)}
          </div>
          <button onclick="window.removeCartItem && window.removeCartItem('${item.domain}')" 
            style="background: #fee; color: #e74c3c; border: 1px solid #fcc; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render addons section (show addons added from order-summary)
   */
  renderAddonsSection(addons) {
    if (!addons || addons.length === 0) {
      return '';
    }

    const addonsHTML = addons.map(addon => `
      <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="display: block; margin-bottom: 4px;">${addon.name}</strong>
          <small style="color: #999;">${addon.duration} tahun</small>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: bold; color: #2563EB; margin-bottom: 6px;">
            Rp${this.formatCurrency(addon.price)}
          </div>
          <button onclick="window.removeAddon && window.removeAddon('${addon.id}')" 
            style="background: #fee; color: #e74c3c; border: 1px solid #fcc; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">
            Hapus
          </button>
        </div>
      </div>
    `).join('');

    return `
      <div style="margin-top: 30px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">
          <i class="fas fa-gift"></i> Addon Layanan (${addons.length})
        </h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${addonsHTML}
        </div>
        <a href="/order-summary/" style="display: inline-block; margin-top: 15px; color: #2563EB; text-decoration: none; font-size: 14px; font-weight: bold;">
          <i class="fas fa-plus"></i> Tambah Addon
        </a>
      </div>
    `;
  }

  /**
   * Render wishlist sidebar
   */
  renderWishlistSidebar() {
    try {
      const wishlistSummary = WishlistManager.getSummary();
      
      if (!wishlistSummary || wishlistSummary.itemCount === 0) {
        return '';
      }

      const items = wishlistSummary.items || [];
      const wishlistItems = items
        .slice(0, 5) // Show top 5
        .map(item => `
          <div style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
              <div style="font-size: 13px; font-weight: bold;">${item.domain}</div>
              <div style="font-size: 11px; color: #999;">
                ${item.priority === 'high' ? '⭐ Urgent' : ''}
              </div>
            </div>
            <button onclick="window.moveWishlistToCart && window.moveWishlistToCart('${item.domain}')"
              style="background: #e8f5e9; color: #27ae60; border: none; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">
              Beli
            </button>
          </div>
        `)
        .join('');

      return `
        <div class="wishlist-card" style="background: #f0f8ff; border-radius: 10px; padding: 15px; border: 1px solid #bfe7ff;">
          <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold;">
            <i class="fas fa-heart" style="color: #e74c3c;"></i> Wishlist (${wishlistSummary.itemCount})
          </h4>
          <div style="font-size: 12px;">
            ${wishlistItems}
            ${wishlistSummary.itemCount > 5 ? `<div style="padding: 10px 0; text-align: center;"><a href="/dashboard/#!wishlist" style="color: #2563EB; text-decoration: none; font-weight: bold;">Lihat Semua</a></div>` : ''}
          </div>
        </div>
      `;
    } catch (error) {
      console.warn('Error rendering wishlist sidebar:', error);
      return '';
    }
  }

  /**
   * Remove item from cart
   */
  removeItem(domain) {
    CartManager.remove(domain);
    showSuccess('✓ Dihapus', `${domain} dihapus dari keranjang`);
    
    // Re-render
    if (CartManager.isEmpty()) {
      this.renderEmptyCart();
    } else {
      this.render(this.container);
    }
  }

  /**
   * Update item duration
   */
  updateItemDuration(domain, duration) {
    CartManager.update(domain, { duration: parseInt(duration) });
    showSuccess('✓ Diperbarui', `Durasi ${domain} diperbarui`);
    this.render(this.container);
  }

  /**
   * Remove addon from cart
   */
  removeAddon(addonId) {
    CartManager.removeAddon(addonId);
    showSuccess('✓ Addon Dihapus', 'Addon dihapus dari keranjang');
    this.render(this.container, this.currentUser);
  }

  /**
   * Apply promo code
   */
  async applyPromoCode() {
    const input = document.getElementById('promo-code-input');
    const msgDiv = document.getElementById('promo-message');
    if (!input || !msgDiv) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      msgDiv.textContent = 'Masukkan kode promo terlebih dahulu';
      msgDiv.style.color = '#e74c3c';
      msgDiv.style.display = 'block';
      return;
    }

    try {
      // Show loading state
      const btn = input.nextElementSibling;
      if (btn) btn.disabled = true;

      // Validate promo with backend
      const result = await APIClient.validatePromoCode(code);

      if (!result.success) {
        throw new Error(result.message || 'Kode promo tidak valid');
      }

      // Apply promo to cart
      CartManager.applyCoupon(code, result.data?.discount || 0);

      // Show success message
      msgDiv.textContent = `✓ ${result.data?.message || 'Kode promo berhasil diterapkan'}`;
      msgDiv.style.color = '#27ae60';
      msgDiv.style.display = 'block';

      showSuccess('✓ Promo Diterapkan', `Diskon Rp${this.formatCurrency(result.data?.discount || 0)} diterapkan!`);

      // Re-render cart with updated prices
      setTimeout(() => {
        this.render(this.container, this.currentUser);
      }, 500);

    } catch (error) {
      console.error('Promo validation error:', error);
      msgDiv.textContent = error.message || 'Gagal memvalidasi kode promo';
      msgDiv.style.color = '#e74c3c';
      msgDiv.style.display = 'block';
    } finally {
      const btn = input.nextElementSibling;
      if (btn) btn.disabled = false;
    }
  }

  /**
   * Proceed to checkout
   */
  proceedToCheckout() {
    const summary = CartManager.getSummary();
    if (summary.itemCount === 0) {
      showError('⚠️ Keranjang Kosong', 'Tambahkan domain ke keranjang terlebih dahulu');
      return;
    }

    const firstDomain = summary.items[0].domain;
      window.location.href = `/dashboard/#!checkout?domain=${encodeURIComponent(firstDomain)}`;
  }

  /**
   * Move wishlist item to cart
   */
  moveWishlistToCart(domain) {
    WishlistManager.moveToCart(domain);
    this.render(this.container);
  }

  /**
   * Format currency - imported from unified-utils
   */
  formatCurrency(value) {
    return formatCurrency(value);
  }
}

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
