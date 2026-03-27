/**
 * UNIFIED CART & WISHLIST MANAGER
 * ===================================
 * Professional e-commerce grade cart system
 * - Cart persistence (localStorage)
 * - Wishlist management
 * - Price calculation
 * - Promo code support
 * 
 * Usage:
 *   CartManager.add(domain, package, duration)
 *   CartManager.getTotal()
 *   WishlistManager.add(domain, reason)
 */

import { showSuccess, showError } from './unified-utils.js';

// ============================================================================
// CART MANAGER
// ============================================================================

export class CartManager {
  /**
   * Add domain to cart
   * @param {string} domain - Domain name (e.g., "example.com")
   * @param {string} tld - TLD (e.g., "com")
   * @param {object} options - {package, duration, registrar, price, renewalPrice}
   */
  static add(domain, tld, options = {}) {
    if (!domain || !tld) {
      throw new Error('Domain dan TLD diperlukan');
    }

    const cart = this.getCart();
    
    // Check if already in cart
    const existingIndex = cart.domains.findIndex(d => d.domain.toLowerCase() === domain.toLowerCase());
    
    if (existingIndex >= 0) {
      cart.domains[existingIndex] = {
        ...cart.domains[existingIndex],
        ...options,
        lastUpdated: Date.now()
      };
      showSuccess('🔄 Item Diperbarui', `${domain} sudah di cart, detail diupdate`);
    } else {
      cart.domains.push({
        domain: domain.toLowerCase(),
        tld: tld.toLowerCase(),
        extension: `.${tld.toLowerCase()}`,
        package: options.package || 'starter',
        duration: options.duration || 1,
        price: options.price || 0,
        renewalPrice: options.renewalPrice || 0,
        registrar: options.registrar || 'auto',
        status: 'pending',
        addedAt: Date.now(),
        id: this._generateId()
      });
      showSuccess('✅ Ditambahkan ke Cart', `${domain} sudah di cart`);
    }
    
    this.saveCart(cart);
    return cart;
  }

  /**
   * Remove domain from cart
   */
  static remove(domain) {
    const cart = this.getCart();
    cart.domains = cart.domains.filter(d => d.domain.toLowerCase() !== domain.toLowerCase());
    this.saveCart(cart);
    return cart;
  }

  /**
   * Update domain details in cart
   */
  static update(domain, updates) {
    const cart = this.getCart();
    const index = cart.domains.findIndex(d => d.domain.toLowerCase() === domain.toLowerCase());
    
    if (index < 0) {
      throw new Error('Domain tidak ditemukan di cart');
    }
    
    cart.domains[index] = {
      ...cart.domains[index],
      ...updates,
      lastUpdated: Date.now()
    };
    
    this.saveCart(cart);
    return cart.domains[index];
  }

  /**
   * Get all items in cart
   */
  static getCart() {
    try {
      const stored = localStorage.getItem('cart');
      if (!stored) {
        return { domains: [], addons: [], coupon: null, subtotal: 0, discount: 0, total: 0 };
      }
      return JSON.parse(stored);
    } catch (err) {
      console.error('[Cart] Parse error:', err);
      return { domains: [], addons: [], coupon: null, subtotal: 0, discount: 0, total: 0 };
    }
  }

  /**
   * Save cart to localStorage
   */
  static saveCart(cart) {
    try {
      const calculated = this._calculatePrices(cart);
      localStorage.setItem('cart', JSON.stringify(calculated));
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: calculated }));
    } catch (err) {
      console.error('[Cart] Save error:', err);
    }
  }

  /**
   * Clear cart
   */
  static clear() {
    localStorage.removeItem('cart');
    window.dispatchEvent(new CustomEvent('cart:cleared'));
  }

  /**
   * Check if cart has items
   */
  static isEmpty() {
    return this.getCart().domains.length === 0;
  }

  /**
   * Get cart summary (for display)
   */
  static getSummary() {
    const cart = this.getCart();
    return {
      itemCount: cart.domains.length,
      subtotal: cart.subtotal || 0,
      discount: cart.discount || 0,
      total: cart.total || 0,
      items: cart.domains,
      coupon: cart.coupon || null
    };
  }

  /**
   * Add coupon/promo code
   */
  static applyCoupon(code) {
    const cart = this.getCart();
    
    // TODO: Validate coupon dengan GAS backend
    // For now, just store it
    cart.coupon = code;
    this.saveCart(cart);
    
    return cart;
  }

  /**
   * Remove coupon
   */
  static removeCoupon() {
    const cart = this.getCart();
    cart.coupon = null;
    this.saveCart(cart);
    return cart;
  }

  /**
   * Add addons to cart
   * @param {array} addons - Array of addon objects [{id, name, price, duration, quantity}]
   */
  static addAddons(addons) {
    if (!Array.isArray(addons)) {
      throw new Error('Addon harus berupa array');
    }

    const cart = this.getCart();
    
    // Initialize addons array if doesn't exist
    if (!cart.addons) {
      cart.addons = [];
    }

    // Add each addon
    addons.forEach(addon => {
      const existingIndex = cart.addons.findIndex(a => a.id.toLowerCase() === addon.id.toLowerCase());
      
      if (existingIndex >= 0) {
        // Update existing addon
        cart.addons[existingIndex] = {
          ...cart.addons[existingIndex],
          ...addon,
          quantity: addon.quantity || 1
        };
      } else {
        // Add new addon
        cart.addons.push({
          id: addon.id,
          name: addon.name,
          price: addon.price || 0,
          duration: addon.duration || 1,
          quantity: addon.quantity || 1
        });
      }
    });

    this.saveCart(cart);
    return cart;
  }

  /**
   * Remove addon from cart
   */
  static removeAddon(addonId) {
    const cart = this.getCart();
    if (cart.addons) {
      cart.addons = cart.addons.filter(a => a.id.toLowerCase() !== addonId.toLowerCase());
    }
    this.saveCart(cart);
    return cart;
  }

  /**
   * Clear all addons from cart
   */
  static clearAddons() {
    const cart = this.getCart();
    cart.addons = [];
    this.saveCart(cart);
    return cart;
  }

  /**
   * Calculate prices (subtotal, discount, total)
   * @private
   */
  static _calculatePrices(cart) {
    let subtotal = 0;
    
    // Calculate domain prices
    if (cart.domains && Array.isArray(cart.domains)) {
      cart.domains.forEach(domain => {
        subtotal += (domain.price || 0) * (domain.duration || 1);
      });
    }
    
    // Calculate addon prices
    if (cart.addons && Array.isArray(cart.addons)) {
      cart.addons.forEach(addon => {
        subtotal += (addon.price || 0) * (addon.quantity || 1);
      });
    }
    
    let discount = 0;
    
    // TODO: Calculate discount based on coupon
    // For now: 0 discount
    
    return {
      ...cart,
      subtotal: Math.round(subtotal),
      discount: Math.round(discount),
      total: Math.round(subtotal - discount)
    };
  }

  /**
   * Generate unique ID for cart item
   * @private
   */
  static _generateId() {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// WISHLIST MANAGER
// ============================================================================

export class WishlistManager {
  /**
   * Add domain to wishlist
   * @param {string} domain - Domain name
   * @param {string} reason - Why user wants this domain
   * @param {string} priority - low, medium, high
   */
  static add(domain, reason = '', priority = 'medium') {
    if (!domain) {
      throw new Error('Domain diperlukan');
    }

    const wishlist = this.getWishlist();
    
    // Check if already in wishlist
    if (wishlist.domains.some(d => d.domain.toLowerCase() === domain.toLowerCase())) {
      showError('⚠️ Sudah di Wishlist', `${domain} sudah ada di wishlist`);
      return wishlist;
    }
    
    wishlist.domains.push({
      domain: domain.toLowerCase(),
      reason: reason || 'Domain impian',
      priority: priority,
      addedAt: Date.now(),
      id: this._generateId()
    });
    
    this.saveWishlist(wishlist);
    showSuccess('❤️ Ditambahkan ke Wishlist', `${domain} disimpan untuk nanti`);
    
    return wishlist;
  }

  /**
   * Remove domain from wishlist
   */
  static remove(domain) {
    const wishlist = this.getWishlist();
    wishlist.domains = wishlist.domains.filter(d => d.domain.toLowerCase() !== domain.toLowerCase());
    this.saveWishlist(wishlist);
    return wishlist;
  }

  /**
   * Move wishlist item to cart
   */
  static moveToCart(domain) {
    const wishlist = this.getWishlist();
    const item = wishlist.domains.find(d => d.domain.toLowerCase() === domain.toLowerCase());
    
    if (!item) {
      throw new Error('Item tidak ditemukan di wishlist');
    }
    
    // Add to cart
    const tld = domain.split('.').pop();
    CartManager.add(domain, tld, { priority: item.priority });
    
    // Remove from wishlist
    this.remove(domain);
    
    return { cart: CartManager.getCart(), wishlist: this.getWishlist() };
  }

  /**
   * Get all wishlist items
   */
  static getWishlist() {
    try {
      const stored = localStorage.getItem('wishlist');
      if (!stored) {
        return { domains: [] };
      }
      return JSON.parse(stored);
    } catch (err) {
      console.error('[Wishlist] Parse error:', err);
      return { domains: [] };
    }
  }

  /**
   * Save wishlist to localStorage
   */
  static saveWishlist(wishlist) {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new CustomEvent('wishlist:updated', { detail: wishlist }));
    } catch (err) {
      console.error('[Wishlist] Save error:', err);
    }
  }

  /**
   * Check if domain is in wishlist
   */
  static isInWishlist(domain) {
    return this.getWishlist().domains.some(d => d.domain.toLowerCase() === domain.toLowerCase());
  }

  /**
   * Get wishlist summary
   */
  static getSummary() {
    const wishlist = this.getWishlist();
    return {
      itemCount: wishlist.domains.length,
      highPriority: wishlist.domains.filter(d => d.priority === 'high').length,
      items: wishlist.domains.sort((a, b) => {
        const priorityMap = { high: 1, medium: 2, low: 3 };
        return priorityMap[a.priority] - priorityMap[b.priority];
      })
    };
  }

  /**
   * Generate unique ID for wishlist item
   * @private
   */
  static _generateId() {
    return `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// CART ANALYTICS (Optional: for future tracking)
// ============================================================================

export class CartAnalytics {
  /**
   * Track abandoned carts (for later email reminder)
   */
  static trackAbandonedCart() {
    if (CartManager.isEmpty()) return;
    
    const cart = CartManager.getCart();
    const abandoned = {
      cartId: `abandoned_${Date.now()}`,
      items: cart.domains,
      total: cart.total || 0,
      abandonedAt: Date.now(),
      userEmail: null // Will be filled in if logged in
    };
    
    // Store in localStorage for recovery
    let abandoned_carts = [];
    try {
      abandoned_carts = JSON.parse(localStorage.getItem('abandoned_carts')) || [];
    } catch (err) {}
    
    abandoned_carts.push(abandoned);
    localStorage.setItem('abandoned_carts', JSON.stringify(abandoned_carts));
  }

  /**
   * Get abandoned carts
   */
  static getAbandonedCarts() {
    try {
      return JSON.parse(localStorage.getItem('abandoned_carts')) || [];
    } catch (err) {
      return [];
    }
  }
}

export default { CartManager, WishlistManager, CartAnalytics };
