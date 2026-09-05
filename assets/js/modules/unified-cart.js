import {
  showSuccess,
  showError
} from './unified-utils.js';
import {
  APIClient
} from './unified-api.js';
export class CartManager {
  static add(domain, tld, options = {}) {
    if (!domain || !tld) {
      throw new Error('Domain dan TLD diperlukan');
    }
    const cart = this.getCart();
    const existingIndex = cart.domains.findIndex(d => d.domain.toLowerCase() === domain.toLowerCase());
    if (existingIndex >= 0) {
      cart.domains[existingIndex] = {
        ...cart.domains[existingIndex],
        ...options,
        domainPrice: options.domainPrice || cart.domains[existingIndex].domainPrice || 0,
        packagePrice: options.packagePrice || cart.domains[existingIndex].packagePrice || 0,
        basePrice: options.basePrice || cart.domains[existingIndex].basePrice || options.price || cart.domains[existingIndex].price || 0,
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
        domainPrice: options.domainPrice || 0,
        packagePrice: options.packagePrice || 0,
        price: options.price || 0,
        basePrice: options.basePrice || options.price || 0,
        renewalPrice: options.renewalPrice || 0,
        isRenewal: options.isRenewal || false,
        registrar: options.registrar || 'auto',
        status: 'pending',
        addedAt: Date.now(),
        id: this._generateId()
      });
      showSuccess('Ditambahkan ke Cart', `${domain} sudah di cart`);
    }
    this.saveCart(cart);
    return cart;
  }
  static remove(domain) {
    const cart = this.getCart();
    cart.domains = cart.domains.filter(d => d.domain.toLowerCase() !== domain.toLowerCase());
    if (cart.domains.length === 0) {
      cart.coupon = null;
      cart.addons = [];
    }
    this.saveCart(cart);
    return cart;
  }
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
  static getCart() {
    try {
      const stored = localStorage.getItem('cart');
      if (!stored) {
        return {
          domains: [],
          addons: [],
          coupon: null,
          subtotal: 0,
          discount: 0,
          total: 0
        };
      }
      return JSON.parse(stored);
    } catch (err) {
      void('[Cart] Parse error:', err);
      return {
        domains: [],
        addons: [],
        coupon: null,
        subtotal: 0,
        discount: 0,
        total: 0
      };
    }
  }
  static saveCart(cart) {
    try {
      const calculated = this._calculatePrices(cart);
      localStorage.setItem('cart', JSON.stringify(calculated));
      window.dispatchEvent(new CustomEvent('cart:updated', {
        detail: calculated
      }));
    } catch (err) {
      void('[Cart] Save error:', err);
    }
  }
  static mergeCart(remoteCart) {
    if (!remoteCart) return;
    const localCart = this.getCart();
    let updated = false;
    const iterate = (items, callback) => {
      if (!items) return;
      if (Array.isArray(items)) items.forEach(callback);
      else if (typeof items === 'object') Object.values(items).forEach(callback);
    };
    const remoteDomains = Array.isArray(remoteCart) ? remoteCart : (remoteCart.domains || []);
    iterate(remoteDomains, remoteItem => {
      if (remoteItem && remoteItem.domain && !localCart.domains.some(localItem => localItem.domain === remoteItem.domain)) {
        localCart.domains.push(remoteItem);
        updated = true;
      }
    });
    iterate(remoteCart.addons, remoteAddon => {
      if (remoteAddon && remoteAddon.id && !localCart.addons.some(localAddon => localAddon.id === remoteAddon.id)) {
        localCart.addons.push(remoteAddon);
        updated = true;
      }
    });
    if (remoteCart.coupon && !localCart.coupon) {
      localCart.coupon = remoteCart.coupon;
      updated = true;
    }
    if (updated || localCart.domains.length === 0) {
      this.saveCart(localCart);
    }
  }
  static clear() {
    localStorage.removeItem('cart');
    window.dispatchEvent(new CustomEvent('cart:cleared'));
  }
  static isEmpty() {
    return this.getCart().domains.length === 0;
  }
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
  static async applyCoupon(code) {
    const cart = this.getCart();
    try {
      if (!window.APIClient) {
        throw new Error('API Client not available. Import APIClient before applying coupon.');
      }
      const response = await window.APIClient.validatePromoCode(code);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Kode promo tidak valid atau sudah kadaluarsa');
      }
      cart.coupon = {
        code: code,
        discountType: response.data.discountType || 'percent',
        discountValue: response.data.discountValue || 0
      };
      this.saveCart(cart);
      return {
        success: true,
        cart
      };
    } catch (error) {
      void('[Cart] Error validating coupon:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  static removeCoupon() {
    const cart = this.getCart();
    cart.coupon = null;
    this.saveCart(cart);
    return cart;
  }
  static addAddons(addons) {
    if (!Array.isArray(addons)) {
      throw new Error('Addon harus berupa array');
    }
    const cart = this.getCart();
    if (!cart.addons) {
      cart.addons = [];
    }
    addons.forEach(addon => {
      const existingIndex = cart.addons.findIndex(a => a.id.toLowerCase() === addon.id.toLowerCase());
      if (existingIndex >= 0) {
        cart.addons[existingIndex] = {
          ...cart.addons[existingIndex],
          ...addon,
          quantity: addon.quantity || 1
        };
      } else {
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
  static removeAddon(addonId) {
    const cart = this.getCart();
    if (cart.addons) {
      cart.addons = cart.addons.filter(a => a.id.toLowerCase() !== addonId.toLowerCase());
    }
    this.saveCart(cart);
    return cart;
  }
  static clearAddons() {
    const cart = this.getCart();
    cart.addons = [];
    this.saveCart(cart);
    return cart;
  }
  static _calculatePrices(cart) {
    let subtotal = 0;
    if (cart.domains && Array.isArray(cart.domains)) {
      cart.domains.forEach(domain => {
        let itemPrice = domain.price || 0;
        if (domain.isRenewal) {
          itemPrice = domain.renewalPrice || itemPrice;
        } else if (domain.package === 'none') {
          itemPrice = domain.domainPrice || itemPrice;
        } else if (domain.package && domain.packagePrice > 0) {
          itemPrice = domain.packagePrice;
        }
        domain.price = itemPrice;
        subtotal += itemPrice * (domain.duration || 1);
        if (domain.addons && Array.isArray(domain.addons)) {
          domain.addons.forEach(addon => {
            subtotal += (addon.price || 0) * (addon.quantity || 1);
          });
        }
      });
    }
    if (cart.addons && Array.isArray(cart.addons)) {
      cart.addons.forEach(addon => {
        subtotal += (addon.price || 0) * (addon.quantity || 1);
      });
    }
    let discount = 0;
    if (cart.coupon) {
      const type = cart.coupon.discountType;
      const value = cart.coupon.discountValue;
      if (type === 'percent' || type === 'percentage') {
        discount = subtotal * (value / 100);
      } else if (type === 'fixed') {
        discount = value;
      }
    }
    let subtotalAfterDiscount = subtotal - discount;
    let ppn = Math.round(subtotalAfterDiscount * 0.11);
    return {
      ...cart,
      subtotal: Math.round(subtotal),
      discount: Math.round(discount),
      ppn: ppn,
      total: Math.round(subtotalAfterDiscount + ppn)
    };
  }
  static _generateId() {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
export class WishlistManager {
  static add(domain, reason = '', priority = 'medium', options = {}) {
    if (!domain) {
      throw new Error('Domain diperlukan');
    }
    const wishlist = this.getWishlist();
    if (wishlist.domains.some(d => d.domain.toLowerCase() === domain.toLowerCase())) {
      showError('Sudah di Wishlist', `${domain} sudah ada di wishlist`);
      return wishlist;
    }
    wishlist.domains.push({
      domain: domain.toLowerCase(),
      reason: reason || 'Domain impian',
      priority: priority,
      addedAt: Date.now(),
      id: this._generateId(),
      ...options
    });
    this.saveWishlist(wishlist);
    showSuccess('Ditambahkan ke Wishlist', `${domain} disimpan untuk nanti`);
    return wishlist;
  }
  static remove(domain) {
    const wishlist = this.getWishlist();
    wishlist.domains = wishlist.domains.filter(d => d.domain.toLowerCase() !== domain.toLowerCase());
    this.saveWishlist(wishlist);
    return wishlist;
  }
  static clear() {
    this.saveWishlist({
      domains: [],
      updatedAt: Date.now()
    });
    window.dispatchEvent(new CustomEvent('wishlist:cleared'));
  }
  static async moveToCart(domain) {
    const wishlist = this.getWishlist();
    const item = wishlist.domains.find(d => d.domain.toLowerCase() === domain.toLowerCase());
    if (!item) {
      throw new Error('Item tidak ditemukan di wishlist');
    }
    const configRes = await APIClient.fetchPricingConfig();
    let starterPrice = 599000;
    if (configRes.success && configRes.data && configRes.data.packages && configRes.data.packages.starter) {
      starterPrice = configRes.data.packages.starter.price;
    }
    const tld = item.tld || domain.split('.').pop();
    CartManager.add(domain, tld, {
      priority: item.priority,
      price: item.price || 0,
      domainPrice: item.domainPrice || item.price || 0,
      renewalPrice: item.renewalPrice || item.price || 0,
      basePrice: item.basePrice || item.price || 0,
      package: 'starter',
      packagePrice: starterPrice
    });
    this.remove(domain);
    return {
      cart: CartManager.getCart(),
      wishlist: this.getWishlist()
    };
  }
  static getWishlist() {
    try {
      const stored = localStorage.getItem('wishlist');
      if (!stored) {
        return {
          domains: []
        };
      }
      return JSON.parse(stored);
    } catch (err) {
      void('[Wishlist] Parse error:', err);
      return {
        domains: []
      };
    }
  }
  static saveWishlist(wishlist) {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new CustomEvent('wishlist:updated', {
        detail: wishlist
      }));
    } catch (err) {
      void('[Wishlist] Save error:', err);
    }
  }
  static mergeWishlist(remoteWishlist) {
    if (!remoteWishlist) return;
    const localWishlist = this.getWishlist();
    let updated = false;
    const iterate = (items, callback) => {
      if (!items) return;
      if (Array.isArray(items)) items.forEach(callback);
      else if (typeof items === 'object') Object.values(items).forEach(callback);
    };
    const remoteDomains = Array.isArray(remoteWishlist) ? remoteWishlist : (remoteWishlist.domains || []);
    iterate(remoteDomains, remoteItem => {
      if (remoteItem && remoteItem.domain && !localWishlist.domains.some(localItem => localItem.domain === remoteItem.domain)) {
        localWishlist.domains.push(remoteItem);
        updated = true;
      }
    });
    if (updated || localWishlist.domains.length === 0) {
      this.saveWishlist(localWishlist);
    }
  }
  static isInWishlist(domain) {
    return this.getWishlist().domains.some(d => d.domain.toLowerCase() === domain.toLowerCase());
  }
  static getSummary() {
    const wishlist = this.getWishlist();
    return {
      itemCount: wishlist.domains.length,
      highPriority: wishlist.domains.filter(d => d.priority === 'high').length,
      items: wishlist.domains.sort((a, b) => {
        const priorityMap = {
          high: 1,
          medium: 2,
          low: 3
        };
        return priorityMap[a.priority] - priorityMap[b.priority];
      })
    };
  }
  static _generateId() {
    return `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
export class CartAnalytics {
  static trackAbandonedCart() {
    if (CartManager.isEmpty()) return;
    const cart = CartManager.getCart();
    const abandoned = {
      cartId: `abandoned_${Date.now()}`,
      items: cart.domains,
      total: cart.total || 0,
      abandonedAt: Date.now(),
      userEmail: null
    };
    let abandoned_carts = [];
    try {
      abandoned_carts = JSON.parse(localStorage.getItem('abandoned_carts')) || [];
    } catch (err) {}
    abandoned_carts.push(abandoned);
    localStorage.setItem('abandoned_carts', JSON.stringify(abandoned_carts));
  }
  static getAbandonedCarts() {
    try {
      return JSON.parse(localStorage.getItem('abandoned_carts')) || [];
    } catch (err) {
      return [];
    }
  }
}
export default {
  CartManager,
  WishlistManager,
  CartAnalytics
};