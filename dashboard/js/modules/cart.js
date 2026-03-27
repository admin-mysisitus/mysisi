/**
 * DASHBOARD CART VIEW MODULE
 * ===================================
 * Professional cart management for dashboard
 * - Display cart items with prices
 * - Add/remove/modify items
 * - Proceed to checkout
 * - Save to order
 */

import { CartManager, WishlistManager } from '/assets/js/modules/unified-cart.js';
import { showSuccess, showError } from '/assets/js/modules/unified-utils.js';

export class DashboardCart {
  constructor() {
    this.cart = CartManager.getCart();
    this.container = null;
  }

  /**
   * Render cart view
   */
  render(containerElement) {
    this.container = containerElement;

    if (CartManager.isEmpty()) {
      this.renderEmptyCart();
      return;
    }

    this.renderCartContent();
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

    let itemsHTML = items.map(item => this.renderCartItem(item)).join('');

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
        </div>

        <!-- Cart Summary & Checkout -->
        <div class="cart-summary-section">
          <div class="cart-summary-card" style="background: #f8f9fa; border-radius: 10px; padding: 25px; border: 1px solid #e0e0e0;">
            <h3 style="margin-bottom: 20px; font-size: 18px; font-weight: bold;">Ringkasan Pesanan</h3>
            
            <div class="summary-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd;">
              <span>Subtotal (${items.length} item):</span>
              <strong>Rp${this.formatCurrency(subtotal)}</strong>
            </div>

            ${discount > 0 ? `
              <div class="summary-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; color: #27ae60;">
                <span><i class="fas fa-tag"></i> Diskon:</span>
                <strong>-Rp${this.formatCurrency(discount)}</strong>
              </div>
            ` : ''}

            <div class="summary-row" style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 18px; font-weight: bold; color: #2563EB;">
              <span>Total:</span>
              <strong>Rp${this.formatCurrency(total)}</strong>
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
   * Render wishlist sidebar
   */
  renderWishlistSidebar() {
    const wishlistSummary = WishlistManager.getSummary();

    if (wishlistSummary.itemCount === 0) {
      return '';
    }

    const wishlistItems = wishlistSummary.items
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
   * Apply promo code
   */
  applyPromoCode() {
    const input = document.getElementById('promo-code-input');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      showError('⚠️ Kode Kosong', 'Masukkan kode promo terlebih dahulu');
      return;
    }

    // TODO: Validate coupon with GAS backend
    CartManager.applyCoupon(code);
    showSuccess('✓ Kode Diterapkan', `Kode promo ${code} sudah diterapkan`);
    this.render(this.container);
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
    window.location.href = `/dashboard/#!checkout?domain=${encodeURIComponent(firstDomain)}&from=cart`;
  }

  /**
   * Move wishlist item to cart
   */
  moveWishlistToCart(domain) {
    WishlistManager.moveToCart(domain);
    this.render(this.container);
  }

  /**
   * Format currency
   */
  formatCurrency(value) {
    return value.toLocaleString('id-ID');
  }
}

export default DashboardCart;
