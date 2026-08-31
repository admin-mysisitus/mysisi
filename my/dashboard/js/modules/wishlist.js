/**
 * DASHBOARD WISHLIST VIEW MODULE
 * ===================================
 * Professional wishlist management for dashboard
 * - Display wishlist items with priorities
 * - Move to cart
 * - Remove items
 */
import {
  CartManager,
  WishlistManager
} from '/assets/js/modules/unified-cart.js';
import {
  showSuccess,
  showError
} from '/assets/js/modules/unified-utils.js';
class DashboardWishlist {
  constructor() {
    this.wishlist = WishlistManager.getWishlist();
    this.container = null;
  }
  /**
   * Render wishlist view
   */
  render(containerElement) {
    this.container = containerElement;
    if (WishlistManager.getWishlist().domains.length === 0) {
      this.renderEmptyWishlist();
      return;
    }
    this.renderWishlistContent();
  }
  /**
   * Render empty wishlist UI
   */
  renderEmptyWishlist() {
    this.container.innerHTML = `
      <div class="wishlist-empty" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 80px; margin-bottom: 20px; opacity: 0.5;">
          <i class="ph-fill ph-heart-break"></i>
        </div>
        <h2 style="color: #333; margin-bottom: 10px;">Wishlist Kosong</h2>
        <p style="color: #666; margin-bottom: 30px; font-size: 16px;">
          Belum ada domain di wishlist Anda. <br>
          Tambahkan domain impian Anda ke wishlist untuk disimpan!
        </p>
        <a href="/#cek-domain" class="btn btn-primary" style="display: inline-block; padding: 12px 30px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          <i class="ph-fill ph-magnifying-glass"></i> Cari Domain
        </a>
      </div>
    `;
  }
  /**
   * Render wishlist with items
   */
  renderWishlistContent() {
    const wishlist = WishlistManager.getWishlist();
    const grouped = {
      high: wishlist.domains.filter(d => d.priority === 'high'),
      medium: wishlist.domains.filter(d => d.priority === 'medium'),
      low: wishlist.domains.filter(d => d.priority === 'low')
    };
    let itemsHTML = '';
    // High priority
    if (grouped.high.length > 0) {
      itemsHTML += `
        <div style="margin-bottom: 32px;">
          <h3 style="margin: 0 0 16px 0; color: var(--color-danger); font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <i class="ph-fill ph-star"></i> Prioritas Tinggi (${grouped.high.length})
          </h3>
          <div class="domain-grid">
            ${grouped.high.map(item => this.renderWishlistItem(item)).join('')}
          </div>
        </div>
      `;
    }
    // Medium priority
    if (grouped.medium.length > 0) {
      itemsHTML += `
        <div style="margin-bottom: 32px;">
          <h3 style="margin: 0 0 16px 0; color: var(--color-warning); font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <i class="ph-fill ph-warning-circle"></i> Prioritas Sedang (${grouped.medium.length})
          </h3>
          <div class="domain-grid">
            ${grouped.medium.map(item => this.renderWishlistItem(item)).join('')}
          </div>
        </div>
      `;
    }
    // Low priority
    if (grouped.low.length > 0) {
      itemsHTML += `
        <div style="margin-bottom: 32px;">
          <h3 style="margin: 0 0 16px 0; color: var(--text-secondary); font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <i class="ph-fill ph-info"></i> Prioritas Rendah (${grouped.low.length})
          </h3>
          <div class="domain-grid">
            ${grouped.low.map(item => this.renderWishlistItem(item)).join('')}
          </div>
        </div>
      `;
    }
    this.container.innerHTML = `
      <div class="dashboard-page-header dashboard-page-header--wishlist">
        <div class="dashboard-page-header-content">
          <h1 class="dashboard-page-header-title">Wishlist Saya</h1>
          <p class="dashboard-page-header-desc">Simpan nama domain potensial untuk proyek masa depan Anda dan pantau ketersediaan serta harga mereka.</p>
        </div>
        <div class="dashboard-page-header-visual">
          <i class="ph-fill ph-heart"></i>
        </div>
      </div>

      <div class="page-shell">
        <div class="wishlist-content">
          ${itemsHTML}

          <div class="page-card" style="margin-top: 32px; text-align: center; padding: 32px 24px; background: var(--dashboard-surface-muted);">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-secondary); margin-bottom: 20px;">
              <i class="ph-fill ph-info"></i>
              <span>Domain impian akan dipesan ketika harga lebih murah atau fitur baru tersedia</span>
            </div>
            <a href="#!/dashboard/checkout" class="btn btn-primary" style="display: inline-flex;">
              <i class="ph ph-magnifying-glass"></i> Cari Domain Lebih Banyak
            </a>
          </div>
        </div>
      </div>
    `;
    // Expose functions to window
    window.moveWishlistToCart = (domain) => this.moveToCart(domain);
    window.removeWishlistItem = (domain) => this.removeItem(domain);
    window.updateWishlistPriority = (domain, priority) => this.updatePriority(domain, priority);
  }
  /**
   * Render single wishlist item
   */
  renderWishlistItem(item) {
    const addedDate = new Date(item.addedAt).toLocaleDateString('id-ID');
    return `
      <div class="invoice-mobile-card domain-list-card">
        <div class="inv-card-header">
          <div class="inv-card-id" style="text-transform: lowercase;">${item.domain}</div>
        </div>
        <div class="inv-card-body">
          <div class="inv-card-row">
            <span class="inv-card-label">Keterangan</span>
            <span class="inv-card-value">${item.reason || 'Domain impian'}</span>
          </div>
          <div class="inv-card-row">
            <span class="inv-card-label">Ditambahkan</span>
            <span class="inv-card-value">${addedDate}</span>
          </div>
        </div>
        <div class="inv-card-footer" style="display: flex; gap: 8px;">
          <button onclick="window.moveWishlistToCart && window.moveWishlistToCart('${item.domain}')"
            class="btn btn-sm btn-primary" style="flex: 1;">
            <i class="ph ph-shopping-cart"></i> Beli
          </button>
          <button onclick="window.removeWishlistItem && window.removeWishlistItem('${item.domain}')"
            class="btn btn-sm btn-outline" style="color: var(--color-danger); border-color: var(--color-danger);">
            <i class="ph ph-trash"></i>
          </button>
        </div>
      </div>
    `;
  }
  /**
   * Move wishlist item to cart
   */
  moveToCart(domain) {
    try {
      WishlistManager.moveToCart(domain);
      showSuccess('✓ Pindah ke Keranjang', `${domain} sudah ditambahkan ke keranjang`);
      this.render(this.container);
    } catch (error) {
      showError('❌ Error', error.message);
    }
  }
  /**
   * Remove item from wishlist
   */
  removeItem(domain) {
    WishlistManager.remove(domain);
    showSuccess('✓ Dihapus', `${domain} dihapus dari wishlist`);
    if (WishlistManager.getWishlist().domains.length === 0) {
      this.renderEmptyWishlist();
    } else {
      this.render(this.container);
    }
  }
  /**
   * Update item priority
   */
  updatePriority(domain, priority) {
    const wishlist = WishlistManager.getWishlist();
    const item = wishlist.domains.find(d => d.domain === domain);
    if (item) {
      item.priority = priority;
      WishlistManager.saveWishlist(wishlist);
      showSuccess('✓ Prioritas Diperbarui', `${domain} prioritasnya diubah`);
      this.render(this.container);
    }
  }
}
// Export render function for dashboard-app compatibility
export async function render() {
  const container = document.getElementById('wishlist-container');
  if (!container) {
    console.log('Wishlist container not found');
    return;
  }
  try {
    const wishlist = new DashboardWishlist();
    wishlist.render(container);
  } catch (error) {
    console.log('Error rendering wishlist:', error);
    container.innerHTML = `
      <div class="alert alert-error">
        <p>${error.message}</p>
        <button onclick="window.location.reload()">Coba Lagi</button>
      </div>
    `;
  }
}

// Auto-refresh UI when wishlist data syncs from backend (e.g., after login)
window.addEventListener('wishlist:updated', () => {
  const container = document.getElementById('wishlist-container');
  // Hanya render ulang jika user sedang berada di halaman wishlist
  if (container) {
    render();
  }
});